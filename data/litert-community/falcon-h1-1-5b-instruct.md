# litert-community/Falcon-H1-1.5B-Instruct

## Resumen

Falcon-H1-1.5B-Instruct en formato LiteRT-LM es una conversión del modelo `tiiuae/Falcon-H1-1.5B-Instruct` de TII (Technology Innovation Institute) al formato `.litertlm` de Google, pensada para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM. La conversión la mantiene la comunidad `litert-community` y requiere litert-lm ≥ 0.15. El paquete incluye pesos cuantizados a int8 dinámico en capas lineales y embeddings, manteniendo convoluciones y el scan en coma flotante, con activaciones fp32 declaradas para GPU, en un único fichero de 1,61 GB.

El modelo base es un transformer híbrido de 24 capas en el que cada capa ejecuta en paralelo una rama de atención con grouped-query attention (GQA) y una rama de scan selectivo Mamba2 sobre la misma entrada, sumando ambas salidas. Esto implica que cada capa mantiene tanto una caché KV como un estado recurrente de tamaño constante (convolución + SSM), lo que reduce el coste de memoria asociado a contextos largos en comparación con un transformer puro.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 1.5B parámetros con calidad conversacional en hardware móvil (iPhone 17 Pro, Pixel 8a, Galaxy S26, Adreno) usando aceleración GPU vía Metal u OpenCL, con velocidades de decodificación de 25,8 tok/s en iPhone 17 Pro (GPU) y 102,9 tok/s en Apple M4 Max (GPU). Es una opción práctica para aplicaciones de asistente local sin conexión y para experimentación con arquitecturas híbridas en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas, cada una con rama GQA y rama Mamba2 (scan selectivo) en paralelo, sumadas |
| Parametros totales | 1.5B (modelo base Falcon-H1-1.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (se exportan firmas de prefill de 1 a 1024 tokens) |
| Tipos de cuantizacion | int8 dinámico en lineales y embedding; convoluciones y scan en float; activaciones fp32 para GPU |
| Idiomas soportados | no disponible |
| Licencia | falcon-llm-license (other) |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero `Falcon-H1-1.5B-Instruct_int8.litertlm` de 1,61 GB |

## Arquitectura y entrenamiento

El modelo base Falcon-H1-1.5B-Instruct es un diseño totalmente híbrido de TII: cada una de las 24 capas combina una rama de atención con grouped-query attention y una rama de scan selectivo Mamba2 que operan en paralelo sobre la misma entrada y cuyas salidas se suman. Como consecuencia, cada capa transporta simultáneamente una caché KV (de la rama de atención) y un estado recurrente de tamaño constante (convolución + SSM de la rama Mamba2). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo base.

La conversión a LiteRT-LM no reentrena el modelo: exporta los pesos a un grafo compatible con el runtime de Google, con cuantización int8 dinámica en capas lineales y embedding, dejando convoluciones y scan en coma flotante, y declarando activaciones fp32 para ejecución en GPU. Se exportan firmas de prefill de múltiples longitudes (1 a 1024) para que el runtime seleccione fragmentos ajustados. El bundle incluye el tokenizador y la plantilla de chat ChatML de Falcon-H1; el 21 de septiembre de 2026 se actualizó la plantilla para aceptar el formato de partes de contenido de la versión 0.18, sin cambios en pesos, tokenizador ni metadatos del ejecutor.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat ChatML.
- Razonamiento aritmético básico, con fragilidad reconocida por el propio autor en el modelo base (el fallo compartido en "17+25" se reproduce también en la referencia bf16 de HF).
- Ejecución on-device en CPU y GPU (Metal en Apple, OpenCL en Arm Mali, Qualcomm Adreno).
- Soporte de backend GPU con delegación completa del grafo (41.683 de 41.683 operaciones en 12 subgrafos sobre LiteRT GPU en Galaxy S26).
- Prefill por fragmentos ajustados gracias a firmas de 1 a 1024 tokens.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Asistente conversacional offline en móvil: el modelo cabe en 2,54 GB de memoria pico en iPhone 17 Pro con backend GPU y ofrece 25,8 tok/s de decodificación, suficiente para respuestas interactivas sin conexión de red.
- Respuestas cortas en aplicaciones de productividad: con 15,5 tok/s en CPU de iPhone 17 Pro y 1,02 GB de memoria pico, es viable para dictado, resumen de notas o respuestas de una palabra en apps ligeras.
- Procesamiento por lotes en portátil Apple Silicon: en M4 Max con GPU alcanza 1447 tok/s de prefill y 102,9 tok/s de decodificación con TTFT de 0,19 s, adecuado para generar borradores o clasificar textos en local.
- Despliegue en Android de gama alta: verificado en Galaxy S26 (SM-S942Q) con delegación GPU completa y 2398 MB de pico, útil para asistentes integrados en apps Android 16.
- Prototipado de arquitecturas híbridas: al mantener estado SSM y caché KV por capa, sirve para medir en hardware real el compromiso entre memoria y latencia frente a transformers puros.
- Evaluación de pipelines LiteRT-LM: el bundle permite validar el runtime, la plantilla de chat y la paridad de logits (max|logit diff| 1,6e-04 frente a PyTorch) antes de migrar a modelos mayores de la familia Falcon-H1.
- Escenarios de privacidad estricta: al ejecutarse íntegramente en dispositivo, los datos del usuario no salen del terminal, lo que encaja en aplicaciones sanitarias o financieras con requisitos de confidencialidad.

## Benchmarks y rendimiento

Rendimiento medido con `litert-lm benchmark` (litert-lm 0.16.0), Apple M4 Max, `-p 256 -d 256 --runs 3 --cache no`:

| Backend | Prefill (256) | Decode | TTFT |
|---|---|---|---|
| GPU | 1447 tok/s | 102,9 tok/s | 0,19 s |
| CPU | 238 tok/s | 33,7 tok/s | 1,11 s |

Rendimiento en dispositivo (arranque en frío, ejecuciones únicas, prompt compuesto de 146 tokens):

| Dispositivo | Backend | Prefill | Decode | TTFT | Memoria pico |
|---|---|---|---|---|---|
| iPhone 17 Pro | GPU (Metal) | 186,8 tok/s | 25,8 tok/s | 0,88 s | 2,54 GB |
| iPhone 17 Pro | CPU | 50,3 tok/s | 15,5 tok/s | 3,16 s | 1,02 GB |
| Galaxy S26 (SM-S942Q) | GPU | no disponible (sin filas de velocidad por decisión del autor) | no disponible | no disponible | 2398 MB |

Calidad: paridad de logits frente a PyTorch con max|logit diff| de 1,6e-04 y correlación 1,000000 en 8 posiciones de decodificación; puerta de 8 preguntas con 7/8 en CPU y 6/8 en GPU; sonda compuesta de 8 ítems con 8/8 en GPU y 8/8 en CPU en iPhone 17 Pro. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 1,61 GB de pesos en disco; pico de 2,54 GB en iPhone 17 Pro con GPU (activaciones fp32) y 1,02 GB con CPU; 2398 MB de pico en Galaxy S26 con GPU.
- GPU recomendadas: Apple Silicon con Metal (M4 Max verificado, iPhone 17 Pro verificado), Arm Mali con OpenCL (Pixel 8a verificado), Qualcomm Adreno verificado. No se documentan requisitos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en hardware móvil y Apple Silicon; no se aportan datos para GPU de escritorio dedicadas.
- Opciones de despliegue: runtime LiteRT-LM (litert-lm ≥ 0.15; benchmark con 0.16.0; notas de conversación con 0.18.0). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: TTFT de 0,19 s (M4 Max GPU), 1,11 s (M4 Max CPU), 0,88 s (iPhone 17 Pro GPU) y 3,16 s (iPhone 17 Pro CPU); decodificación de 102,9 tok/s en M4 Max GPU y 25,8 tok/s en iPhone 17 Pro GPU.
- Nota de backend: en Android de gama baja la GPU mejora prefill y TTFT pero no la decodificación, que está limitada por ancho de banda de memoria; en Apple la GPU gana en todos los casos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falcon-H1-1.5B-Instruct (LiteRT-LM) | 1.5B | no disponible | `.litertlm`, LiteRT-LM | falcon-llm-license | Hugging Face, 127 descargas |
| Falcon-H1-0.5B-Instruct (LiteRT-LM) | 0.5B | no disponible | `.litertlm`, LiteRT-LM | falcon-llm-license | Hugging Face (misma conversión y parche) |
| Falcon-H1-1.5B-Instruct (original TII) | 1.5B | no disponible | safetensors (formato HF) | falcon-llm-license | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La aritmética a esta escala es frágil en el propio modelo base; la cuantización int8 añade inversiones greedy en ítems límite (fallo en 8×7 solo en GPU).
- El fallo en "17+25" (respuesta "32") se reproduce también en la referencia bf16 de Hugging Face, por lo que no es daño de la conversión.
- Bug conocido en litert-lm 0.18.0: al iniciar una nueva conversación en un Engine que ya ejecutó otra, el runtime reutiliza tokens de prompt compartidos y no reinicia el estado recurrente (issue #3165). Se recomienda crear un Engine nuevo por conversación; el primer diálogo en un Engine no se ve afectado. El arreglo aterrizó en main el 3 de noviembre de 2026 (commit e1f86b05), pero ninguna release lo incluye todavía (v0.19.1 no lo lleva).
- La ejecución en GPU usa activaciones fp32, con un múltiplo de memoria correspondiente sobre la ruta CPU.
- En Android de gama baja la GPU no mejora la decodificación; conviene elegir backend según la carga (prompts largos a GPU, respuestas largas a CPU).
- No se documentan idiomas soportados ni evaluación multilingüe.
- No se documentan capacidades de tool calling, agentes ni visión.
- Licencia falcon-llm-license: es necesario revisar los términos de TII (falconllm.tii.ae) antes de uso comercial; no es una licencia de código abierto estándar.
- Riesgo de alucinación inherente a un modelo de 1.5B; no se aportan evaluaciones de sesgo en la información disponible.
- Requiere litert-lm ≥ 0.15; versiones anteriores no son compatibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Falcon-H1-1.5B-Instruct
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-1.5B-Instruct
- Modelo hermano 0.5B: https://huggingface.co/litert-community/Falcon-H1-0.5B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue de conversaciones en el mismo Engine: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Pull request relacionado: https://github.com/google-ai-edge/LiteRT-LM/pull/3945
- Commit del arreglo: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Términos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
