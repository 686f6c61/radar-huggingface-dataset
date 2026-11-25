# litert-community/Falcon-H1-Tiny-R-0.6B

## Resumen

Falcon-H1-Tiny-R-0.6B es un modelo de lenguaje de 0,6 mil millones de parámetros desarrollado originalmente por TII (Technology Innovation Institute) y convertido al formato LiteRT-LM por la comunidad litert-community para inferencia en dispositivo (on-device). Se trata de un modelo de razonamiento: abre de forma autónoma un bloque `` antes de responder, lo que permite separar el razonamiento interno de la respuesta final. La conversión está pensada para ejecutarse con el runtime LiteRT-LM de Google (versión 0.16 o superior) en GPUs y CPUs de móviles y equipos de sobremesa.

La arquitectura es híbrida: las 44 capas ejecutan en paralelo una rama de atención con grouped-query attention y una rama de exploración selectiva Mamba2. Cada capa mantiene KV más un estado recurrente de tamaño constante (convolución y SSM), lo que reduce el coste de memoria en contextos largos frente a un transformer puro. El fichero distribuido aplica cuantización int8 dinámica solo en las capas lineales (FC), mantiene la tabla de embeddings en coma flotante y externalizada, y deja convoluciones y exploración en flotante con activaciones fp32 declaradas para GPU.

Su relevancia actual radica en que demuestra que un modelo de razonamiento de este tamaño puede ejecutarse íntegramente en un teléfono con tasas de decodificación de entre 10 y 23 tokens por segundo según el dispositivo, con todas las operaciones delegadas al acelerador. Es una pieza útil para prototipar asistentes locales con capacidad de razonamiento sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida transformer-Mamba2 (44 capas con rama GQA y rama Mamba2 en paralelo) |
| Parametros totales | 0,6 mil millones (aproximado, según nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; se exportan firmas de prefill de 1 a 1024 tokens |
| Tipos de cuantizacion | int8 dinámica en lineales (FC); embeddings en flotante externalizados; convoluciones y scan en flotante; activaciones fp32 |
| Idiomas soportados | no disponible |
| Licencia | Falcon LLM License (falcon-llm-license) |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors/bf16 en el repositorio original |
| Tamano del fichero | 873 MB (`Falcon-H1-Tiny-R-0.6B_int8.litertlm`) |
| Runtime requerido | litert-lm ≥ 0.16 |
| Tokens de parada | `<|end_of_text|>` (11) y `<|im_end|>` (228) |

## Arquitectura y entrenamiento

El modelo base Falcon-H1-Tiny-R-0.6B emplea una arquitectura híbrida en la que cada una de las 44 capas combina una rama de atención con grouped-query attention y una rama de exploración selectiva Mamba2. Ambas ramas se ejecutan en paralelo dentro de la capa. El estado recurrente de la rama Mamba2 (convolución y SSM) tiene tamaño constante, de modo que el coste de memoria por token no crece con la longitud de la secuencia en esa parte del cómputo, mientras que la rama de atención mantiene su propia caché KV.

La conversión a LiteRT-LM aplica una receta de cuantización específica: int8 dinámica solo en las capas lineales, embeddings externalizados en una sección CPU separada y mantenidos en flotante, y convoluciones y scan en flotante. El autor documenta que una tabla de embeddings en int8, incluso con cuantización por fila, desestabiliza el razonamiento en este checkpoint, provocando pensamiento desbocado y cambios en decodificación voraz. La separación del embedder permite que el grafo del decodificador sea completamente delegable a GPU. El fichero declara el canal `thought`, de forma que el runtime separa el razonamiento de la respuesta y permite limitarlo con `--thinking-budget`. La plantilla de chat y el tokenizador reproducen byte a byte el flujo de tokens de `apply_chat_template` del modelo original desde BOS.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto con razonamiento explícito: abre un bloque `` antes de responder y el runtime puede separar ese canal del texto final.
- Razonamiento matemático y lógico de nivel básico: la verificación con GSM8K (100 preguntas, decodificación voraz, presupuesto de 2048 tokens) obtiene 76/100 en el fichero int8 frente a 71/100 del modelo bf16 en PyTorch.
- Control del presupuesto de razonamiento mediante `--thinking-budget`, que trunca el razonamiento en el número exacto de tokens indicado.
- Inferencia en dispositivo con delegación completa de operaciones: 6566 operaciones delegadas en Galaxy S26 y Pixel 8a con backend GPU.
- Soporte de múltiples longitudes de prefill (firmas de 1 a 1024 tokens) para que el runtime seleccione fragmentos ajustados.
- Ejecución en backend GPU (Metal en iOS, GPU en Android, GPU y CPU en Mac) y CPU.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües en la información proporcionada.

## Casos de uso

- Asistente de razonamiento local en móvil: el modelo puede resolver problemas aritméticos y de lógica directamente en el dispositivo con 10-23 tok/s de decodificación, sin enviar datos a la nube, adecuado para aplicaciones de privacidad estricta.
- Tutor de matemáticas básicas offline: con 76/100 en GSM8K y un presupuesto de razonamiento configurable, puede descomponer problemas de aritmética elemental y mostrar el paso a paso en el canal `thought` separado de la respuesta.
- Verificación de cálculos en aplicaciones de finanzas personales: integrado mediante LiteRT-LM en una app Android o iOS, puede comprobar operaciones como multiplicaciones o sumas y explicar el resultado, con TTFT de 760 ms en Galaxy S26.
- Prototipado de agentes de razonamiento en edge: la separación entre canal de pensamiento y respuesta permite construir pipelines que inspeccionan o filtran el razonamiento antes de mostrarlo, útil para investigación en interfaces de IA explicable.
- Evaluación de runtimes on-device: sirve como banco de pruebas para medir latencia, throughput y fidelidad de cuantización en distintos backends (Metal, GPU Android, CPU) con un modelo de razonamiento pequeño.
- Aplicaciones educativas sin conectividad: en entornos con red limitada, el fichero de 873 MB cabe en el almacenamiento de un teléfono moderno y permite responder preguntas de lógica y matemáticas con latencia de segundos.
- Filtrado y clasificación con razonamiento breve: usando `--thinking-budget` bajo (por ejemplo, 16 tokens), el modelo puede emitir juicios rápidos sobre texto con un coste de cómputo controlado.

## Benchmarks y rendimiento

Resultados de corrección:

| Prueba | Resultado |
|---|---|
| GSM8K, 100 preguntas, voraz, presupuesto 2048, fichero int8 | 76/100 |
| GSM8K, mismas condiciones, modelo bf16 PyTorch | 71/100 |
| Sanidad de 8 preguntas, Mac CPU (litert-lm 0.16.0) | 6/8 |
| Sanidad de 8 preguntas, Mac GPU | 7/8 |
| Sanidad de 8 preguntas, iPhone CPU | 6/8 |
| Sanidad de 8 preguntas, iPhone Metal | 6/8 |

Rendimiento en Apple M4 Max (`litert-lm benchmark`, `-p 256 -d 256 --runs 3 --cache no`):

| Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|
| GPU | 2216 tok/s | 97,8 tok/s | 0,13 s |
| CPU | 381 tok/s | 47,8 tok/s | 0,69 s |

Rendimiento en dispositivo (arranque en frío, ejecuciones únicas, prompt compuesto de 148 tokens):

| Dispositivo | Backend | Prefill | Decode | TTFT (frío) | Memoria pico |
|---|---|---|---|---|---|
| Galaxy S26 | GPU | 310 tok/s | 16,1 tok/s | 760 ms | no disponible |
| Pixel 8a | GPU | 109 tok/s | 10,0 tok/s | 2,08 s | no disponible |
| iPhone 17 Pro | GPU (Metal) | 259,8 tok/s | 22,8 tok/s | 12,9 s | 3,01 GB |

## Requisitos de hardware

- VRAM y memoria: el fichero pesa 873 MB; en iPhone 17 Pro el pico de memoria medido es de 3,01 GB durante la inferencia con backend Metal.
- GPU de escritorio: se han publicado mediciones en Apple M4 Max (GPU y CPU). No hay datos para A100, H100 ni RTX 4090 en la información proporcionada.
- GPU de móvil: funciona con delegación completa (6566 operaciones) en Galaxy S26 y Pixel 8a con backend GPU.
- Cabe en dispositivos de consumo: sí, en teléfonos modernos (Galaxy S26, Pixel 8a, iPhone 17 Pro) y en equipos Mac con Apple Silicon.
- Opciones de despliegue: runtime LiteRT-LM (versión 0.16 o superior) mediante el comando `litert-lm run`, con selección de backend (`--backend gpu`) y control de caché (`--cache no`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: TTFT en frío de 760 ms en Galaxy S26, 2,08 s en Pixel 8a y 12,9 s en iPhone 17 Pro; decodificación de 10,0 a 22,8 tok/s en móviles y 97,8 tok/s en GPU de M4 Max.
- Advertencia de runtime: en litert-lm 0.18.0 se debe crear un nuevo Engine por conversación; reutilizar un Engine que ya ejecutó otra conversación reutiliza estado recurrente y produce respuestas incorrectas. El fallo se corrigió en la rama principal el 2026-11-03 (commit e1f86b05) pero ninguna versión publicada lo incluye todavía (v0.19.1 no lo lleva).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falcon-H1-Tiny-R-0.6B (LiteRT-LM) | 0,6 B | no disponible | `.litertlm` int8 | Falcon LLM License | Hugging Face (litert-community) |
| Falcon-H1-0.5B (LiteRT-LM) | 0,5 B | no disponible | `.litertlm` | Falcon LLM License | Hugging Face (litert-community) |
| Falcon-H1-1.5B (LiteRT-LM) | 1,5 B | no disponible | `.litertlm` | Falcon LLM License | Hugging Face (litert-community) |
| Falcon-H1-3B-Instruct (LiteRT-LM) | 3 B | no disponible | `.litertlm` | Falcon LLM License | Hugging Face (litert-community) |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada. La familia comparte la misma arquitectura híbrida y el mismo parche de caché híbrida, diferenciándose en tamaño y en el empaquetado específico para razonamiento de la variante Tiny-R.

## Limitaciones y advertencias

- El modelo comete errores en recuerdo de hechos a esta escala: dos preguntas de recuerdo factual ("capital de Japón", "gracias en francés") fallan en todos los backends y el modelo bf16 también las falla bajo perturbaciones de un token en el prompt.
- La cuantización int8 introduce ruido: las diferencias por pregunta frente al modelo bf16 van en ambas direcciones (64 preguntas correctas en ambos), por lo que no debe interpretarse como mejora sistemática.
- Riesgo de pensamiento desbocado si se usa una tabla de embeddings en int8; la receta del autor la mantiene en flotante precisamente para evitarlo.
- Fallo conocido en litert-lm 0.18.0 al reutilizar un Engine entre conversaciones: el estado recurrente no se reinicia y las respuestas pueden ser incorrectas. Requiere crear un Engine nuevo por conversación hasta que se publique una versión con la corrección.
- La licencia Falcon LLM License no es una licencia de código abierto estándar; es necesario revisar los términos en el enlace oficial antes de uso comercial.
- No se documentan idiomas soportados, por lo que no puede asumirse cobertura multilingüe.
- No se documenta longitud de contexto máxima en la información proporcionada.
- El modelo está empaquetado para un runtime específico (LiteRT-LM ≥ 0.16); no es directamente utilizable en otros motores de inferencia sin conversión adicional.
- El tamaño de 0,6 B limita la profundidad de razonamiento y el conocimiento factual; es adecuado para tareas acotadas, no para conocimiento enciclopédico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Falcon-H1-Tiny-R-0.6B
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-Tiny-R-0.6B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha de compatibilidad edge (edge-compat): https://github.com/john-rocky/edge-compat/blob/main/cards/falcon-h1-tiny-r-0.6b-int8/CARD.md
- Informe del fallo de reutilización de Engine: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Corrección en LiteRT-LM main: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Términos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
- Conversión de la familia Falcon-H1-3B-Instruct: https://huggingface.co/litert-community/Falcon-H1-3B-Instruct
