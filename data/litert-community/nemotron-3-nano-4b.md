# litert-community/Nemotron-3-Nano-4B

## Resumen

Nemotron-3-Nano-4B en formato LiteRT-LM es una conversión del modelo `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` realizada por la comunidad `litert-community`, empaquetada en el formato `.litertlm` para inferencia on-device con el runtime LiteRT-LM de Google. El modelo original lo desarrolla NVIDIA y es un modelo de razonamiento de 4.000 millones de parámetros construido sobre una arquitectura híbrida que combina capas Mamba2 de escaneo selectivo, capas MLP convencionales y un pequeño número de capas de atención con grouped-query attention.

La relevancia de esta conversión concreta es que permite ejecutar un modelo de razonamiento con plantilla de chat ChatML y bloques `<think>` directamente en dispositivos de borde: teléfonos móviles, portátiles y estaciones de trabajo sin GPU dedicada de datacenter. El archivo publicado ocupa 4,13 GB en cuantización int8 y está pensado para el runtime LiteRT-LM (versión mínima 0.15), no para servidores de inferencia tradicionales como vLLM o TGI.

El modelo destaca por su perfil de memoria casi plano respecto a la longitud de contexto: solo 4 de las 42 capas mantienen caché KV, mientras que las 21 capas Mamba2 llevan estado convolucional y SSM de tamaño constante y las 17 capas MLP no llevan estado alguno. Esto lo hace especialmente adecuado para despliegues con recursos de memoria muy limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 21 capas Mamba2 (selective scan) + 17 capas MLP + 4 capas de atención con GQA (42 capas totales) |
| Parámetros totales | 4.000 millones (aproximado, según denominación del modelo) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | presupuesto de 4.096 tokens para KV en esta exportación |
| Tipos de cuantización | int8 dinámico en capas lineales y embeddings; convoluciones y scan en float; activaciones declaradas fp32 |
| Idiomas soportados | no disponible |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en BF16 safetensors |
| Dimensión oculta | 3.136 |
| Cabezas de atención | 40 query / 8 KV |
| Cabezas Mamba2 | 96 cabezas × 80 dimensiones (estado 128, conv 4, 8 grupos) |
| Vocabulario | 131.072 tokens, embeddings no atados |
| Búferes de estado | 50 en total (42 Mamba + 8 KV) |
| Tamaño del archivo | 4,13 GB (int8) |
| Runtime requerido | litert-lm ≥ 0.15 |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido de tres tipos de capa. Las 21 capas Mamba2 implementan un escaneo selectivo con estado convolucional y SSM de tamaño constante, lo que evita el crecimiento cuadrático de la atención y mantiene el coste de memoria independiente de la longitud de secuencia. Las 17 capas MLP no mantienen estado alguno. Solo las 4 capas de atención con grouped-query attention (40 cabezas de consulta, 8 de clave-valor) conservan caché KV, con un presupuesto de 4.096 tokens en esta exportación. El resultado son 50 búferes de estado en total, de los cuales 42 son de Mamba y 8 de KV.

El modelo es un modelo de razonamiento: utiliza turnos ChatML y produce bloques `<think>` antes de la respuesta final. La plantilla de chat embebida en el archivo `.litertlm` es byte a byte idéntica a la del repositorio fuente (10.504 bytes), aunque el `tokenizer_config.json` del repositorio original contiene una copia distinta de 10.497 bytes; la exportación embebe la que `AutoTokenizer` resuelve realmente. El tokenizador fuente declara `add_bos_token: False` y la plantilla nunca renderiza un BOS inicial, de modo que el token `<s>` que el paso de empaquetado añadiría se elimina y el flujo de tokens on-device coincide con el de entrenamiento. Los tokens de fin de turno son `<|im_end|>` (id 11) junto con el id 2 exportado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La exportación incluye siete firmas de prefill (1024, 256, 64, 16, 4, 1 y decode) para que el runtime seleccione fragmentos ajustados.

## Capacidades

- Generación de texto con modo de razonamiento explícito mediante bloques `<think>` y turnos ChatML.
- Razonamiento aritmético y factual: en la verificación de 8 preguntas del exportador acierta todos los ítems aritméticos, factuales y de traducción tanto en CPU como en GPU.
- Traducción: los ítems de traducción de la verificación de sanidad se resuelven correctamente en ambos backends.
- Finalización de texto y rimas: resuelve el ítem de rima en GPU; en CPU falla ese único ítem ("violets are purple" en lugar de "blue").
- Conversación multi-turno mediante plantilla ChatML con tokens de fin de turno correctamente configurados.
- Inferencia on-device en CPU y GPU (WebGPU) a través del runtime LiteRT-LM.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el modo `<think>` habilita cadenas de razonamiento.
- Capacidades multilingües: no disponibles; la verificación incluye ítems de traducción pero no se especifica el par de idiomas ni la cobertura.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: el archivo int8 de 4,13 GB se ejecuta en la CPU de un Galaxy S26 con 52,9–64,0 tok/s de prefill y 11,85–12,87 tok/s de decode, con un pico de memoria de 4.726–4.884 MiB, lo que permite integrar un asistente con razonamiento local sin enviar datos a la nube.
- Razonamiento privado en el borde: al ejecutarse íntegramente en el dispositivo, es adecuado para aplicaciones que procesan información sensible (notas médicas, datos financieros personales) y no pueden permitirse llamadas a una API externa.
- Aplicaciones de escritorio con GPU integrada: en un Mac Studio M4 Max alcanza 803 tok/s de prefill y 83,3 tok/s de decode con TTFT de 331 ms en el backend GPU, suficiente para asistentes de escritura o chat en tiempo real dentro de una aplicación nativa.
- Procesamiento por lotes de texto corto en portátiles: con contexto efectivo de 4.096 tokens y memoria casi plana, es viable clasificar, resumir o reescribir documentos cortos en local sin infraestructura de servidor.
- Prototipado de modelos de razonamiento sin GPU de datacenter: permite validar flujos con bloques `<think>` y plantillas ChatML en hardware de consumo antes de migrar a un despliegue en servidor con el modelo base BF16.
- Educación y demostraciones de arquitecturas híbridas Mamba2: al ser la primera conversión conocida de Nemotron-3-Nano a LiteRT, sirve para estudiar el comportamiento de un stack híbrido con estado constante en entornos con recursos limitados.
- Traducción y corrección de texto offline: los ítems de traducción de la verificación de sanidad se resuelven correctamente, lo que respalda su uso en utilidades de traducción local sin conexión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia y de una verificación de sanidad de 8 preguntas.

Verificación de sanidad (8 preguntas, litert-lm 0.16.0, Apple M4 Max):

| Backend | Aciertos | Observaciones |
|---|---|---|
| CPU | 7/8 | Falla el ítem de rima; responde "violets are purple" en lugar de "blue" |
| GPU (`--cache no`) | 8/8 | Sin respuestas degeneradas |

Rendimiento de inferencia (`litert-lm benchmark`, prefill 256, decode 256, 3 ejecuciones, `--cache no`, litert-lm 0.16.0):

| Backend | Prefill (tok/s) | Decode (tok/s) | TTFT |
|---|---|---|---|
| GPU, Mac Studio M4 Max | 803 / 792 | 83,3 / 82,4 | 0,33 s |
| CPU, Mac Studio M4 Max | 99,6 / 113,3 | 22,7 / 22,5 | 2,64 / 2,30 s |
| CPU, Galaxy S26 (SM-S942Q, Qualcomm SM8850, Adreno) | 52,9–64,0 | 11,85–12,87 | 4,06 s |
| GPU, Galaxy S26 | no ejecutado (run_error) | no ejecutado | no ejecutado |

Notas sobre las mediciones: las dos cifras de cada celda corresponden a dos ejecuciones independientes, no a un rango estimado. La repetición en GPU varía dentro de ~1,4 %; el prefill en CPU se dispersa ~13 % porque la máquina no estaba inactiva durante las pruebas. En el Galaxy S26 el backend GPU provoca un fallo (SIGSEGV, exit 139). El tiempo de inicialización del motor en el teléfono es de 9,0–11,5 s en dos ejecuciones en frío.

## Requisitos de hardware

- VRAM/almacenamiento: el archivo int8 ocupa 4,13 GB; en el Galaxy S26 el pico de memoria medido es de 4.726–4.884 MiB.
- GPU recomendadas: Apple M4 Max (medido, 83,3 tok/s de decode); no hay datos publicados para A100, H100 o RTX 4090 con este formato.
- GPU de consumo: no se han publicado mediciones en RTX 4090 ni en otras GPU de consumo; el runtime LiteRT-LM está orientado a GPU integradas y móviles mediante WebGPU.
- Móvil: ejecutable en CPU en un Galaxy S26 (Qualcomm SM8850, Adreno); el backend GPU falla en ese dispositivo con SIGSEGV.
- Opciones de despliegue: exclusivamente LiteRT-LM (versión ≥ 0.15). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI con este archivo.
- Latencia y throughput: TTFT de 0,33 s en GPU de M4 Max y 2,30–2,64 s en CPU de M4 Max; 4,06 s en CPU de Galaxy S26. Decode de 83,3 tok/s (GPU M4 Max), 22,5–22,7 tok/s (CPU M4 Max) y 11,85–12,87 tok/s (CPU Galaxy S26).
- Limitación de tiempo: en litert-lm 0.18.x y 0.19.0, una llamada bloqueante `send_message` que siga generando tras 10 minutos falla con `DEADLINE_EXCEEDED` y puede provocar el fallo del proceso; para respuestas largas hay que reducir `max_output_tokens` o usar `send_message_async`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3-Nano-4B (LiteRT-LM, esta ficha) | ~4.000 M | 4.096 tokens (presupuesto KV) | `.litertlm` int8, 4,13 GB | nvidia-nemotron-open-model-license | Hugging Face, runtime LiteRT-LM |
| nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16 | ~4.000 M | no disponible | safetensors BF16 | nvidia-nemotron-open-model-license | Hugging Face |
| Otros modelos de ~4.000 M en formato GGUF | no disponible | no disponible | GGUF | variable | no disponible |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- La licencia `nvidia-nemotron-open-model-license` no es una licencia de código abierto estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- El backend GPU requiere `--cache no` en este archivo: con la caché de grafo compilado activada, `litert-lm run --backend gpu` falla con errores de validación WebGPU `Invalid BindGroup` y la verificación de 8 preguntas devuelve texto degenerado (0/8). La causa raíz no está aislada.
- En el Galaxy S26 el backend GPU provoca un fallo del proceso (SIGSEGV, exit 139); solo el backend CPU es funcional en ese dispositivo.
- El presupuesto de contexto KV es de 4.096 tokens, inferior al de muchos modelos de su tamaño; las tareas que requieran contextos largos no son adecuadas.
- En la verificación de sanidad en CPU falla el ítem de rima (7/8), lo que sugiere posibles debilidades en tareas de completado creativo o poético.
- No hay información sobre sesgos, composición del dataset de entrenamiento ni tasas de alucinación; se debe evaluar empíricamente antes de usar en producción.
- Los idiomas soportados no están documentados; la cobertura multilingüe es incierta.
- En litert-lm 0.18.x y 0.19.0 existe un tiempo límite fijo de 10 minutos en `send_message` bloqueante que puede dejar procesos colgados; usar la variante asíncrona en streaming.
- Las mediciones de CPU en M4 Max se tomaron con la máquina no inactiva, por lo que deben interpretarse como orden de magnitud.
- El formato `.litertlm` limita el despliegue al runtime LiteRT-LM; no hay soporte para los servidores de inferencia habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Nemotron-3-Nano-4B
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Ficha de compatibilidad en dispositivo (edge-compat): https://github.com/john-rocky/edge-compat/blob/main/cards/nemotron-3-nano-4b-int8/CARD.md
