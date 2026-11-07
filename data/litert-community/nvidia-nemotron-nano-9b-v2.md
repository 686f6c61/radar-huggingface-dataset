# litert-community/NVIDIA-Nemotron-Nano-9B-v2

## Resumen

NVIDIA-Nemotron-Nano-9B-v2 es un modelo de lenguaje de 8.888.227.328 parámetros desarrollado originalmente por NVIDIA, concebido como un modelo unificado para tareas de razonamiento y no razonamiento. Esta ficha concreta corresponde a la conversión publicada por la comunidad litert-community al formato LiteRT-LM (`.litertlm`), pensada para ejecución en dispositivos edge mediante el runtime LiteRT-LM de Google. Se ofrece en dos variantes cuantizadas: int8 (9,07 GB) e int4 (5,59 GB).

La arquitectura es un híbrido Mamba2-Transformer denominado Nemotron-H: de sus 56 capas, 27 son mixers Mamba2, 25 son bloques MLP y solo 4 son capas de atención (en las profundidades 14, 21, 30 y 39), con un tamaño oculto de 4480. Esta proporción reducida de atención limita el crecimiento de la caché KV, lo que resulta clave para el despliegue en memoria restringida. El modelo base fue preentrenado con 20 billones de tokens y posteriormente comprimido y destilado desde una versión de 12B mediante la estrategia Minitron.

Su relevancia actual radica en que permite llevar un modelo de razonamiento de casi 9B parámetros a hardware de consumo y a teléfonos, con decodificación medida de 45,5 tok/s en la GPU de un Mac Studio M4 Max con el fichero int4. La licencia es la NVIDIA Open Model License, que NVIDIA declara apta para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba2-Transformer (Nemotron-H): 56 capas (27 Mamba2, 25 MLP, 4 atención) |
| Parametros totales | 8.888.227.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K en el modelo original; 4096 tokens en estos ficheros LiteRT-LM |
| Tipos de cuantizacion | int8 (lineales y embedding) e int4 blockwise-32 min-max (lineales), int8 en lm_head y embedding |
| Idiomas soportados | en, de, es, fr, it, ja |
| Licencia | nvidia-open-model-license |
| Formato de pesos | `.litertlm` (LiteRT-LM), dos ficheros: int8 9,07 GB e int4 5,59 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Nemotron-H, un híbrido que combina capas Mamba2 con capas de atención tradicional. Concretamente, cuenta con tamaño oculto 4480, 40 cabezas de atención con 8 cabezas KV de dimensión 128, y Mamba2 con 128 cabezas de 80 (tamaño de estado 128, 8 grupos). El vocabulario es de 131.072 tokens con embeddings no atados. Solo las cuatro capas de atención mantienen una caché KV creciente (con presupuesto de 4096 tokens en estos ficheros); las 27 capas Mamba2 mantienen un estado conv y SSM de tamaño constante, lo que reduce drásticamente el consumo de memoria en contextos largos.

El modelo base fue preentrenado desde cero por NVIDIA sobre 20 billones de tokens, alineado y posteriormente comprimido y destilado desde una versión de 12B mediante la estrategia Minitron hasta los 9B finales. La conversión a LiteRT-LM se realizó con litert-torch (commit 115a136 con el parche de Nemotron-H) sobre la ruta de conversión `nemotron_h_work/` del proyecto hf-to-litertlm, y se probó con litert-lm 0.18.0. En la variante int8 se cuantizan dinámicamente todas las capas lineales y el embedding, mientras que la convolución Mamba y el selective scan permanecen en coma flotante; en la int4 se aplica cuantización blockwise-32 (min-max) a las capas lineales con escalas de bloque con suelo en 2^-14. Ambos ficheros declaran activaciones fp32 en GPU, ya que con las activaciones fp16 por defecto del runtime el fichero int8 respondió 0 de 8 preguntas correctamente (todas las respuestas eran `<unk>` repetido).

## Capacidades

- Generación de texto con razonamiento explícito: por defecto abre un bloque `<think>` antes de responder, y el runtime devuelve el razonamiento por separado del texto de respuesta.
- Modo de razonamiento conmutable: `/no_think` en el mensaje de sistema o en un mensaje de usuario desactiva el razonamiento para la conversación o el turno; `/think` lo reactiva.
- Razonamiento matemático: el modelo base reporta MATH500 97,8 y AIME25 72,1 con razonamiento activado.
- Capacidades multilingües en inglés, alemán, español, francés, italiano y japonés.
- Ejecución en dispositivo (on-device) y en el edge mediante el runtime LiteRT-LM.
- Delegación completa en GPU: las 7 firmas de ambos ficheros se delegan íntegramente en la GPU del Mac según la model card.
- No se ha documentado en la información disponible soporte de tool calling, function calling, agentes multi-paso, visión ni audio.

## Casos de uso

- Asistentes locales en dispositivos móviles: el fichero int4 (5,59 GB) está pensado para ejecutarse en hardware edge con el runtime LiteRT-LM, lo que permite asistentes de texto sin conexión a la nube. En un Galaxy S26 no llegó a ejecutarse y en un Pixel 8a se detuvo por la regla de memoria del autor, por lo que el despliegue móvil requiere validación previa en el dispositivo objetivo.
- Razonamiento matemático y resolución de problemas en local: con el modo de razonamiento activado, el modelo base reporta MATH500 97,8, adecuado para tutores o verificadores de cálculos que deban funcionar sin enviar datos a un servidor.
- Procesamiento por lotes en estaciones de trabajo con GPU de consumo: el fichero int4 decodifica a 45,5 tok/s en la GPU de un Mac Studio M4 Max, suficiente para tareas de generación de resumen, reescritura o clasificación en lotes.
- Aplicaciones multilingües europeas: al cubrir español, francés, alemán, italiano e inglés, sirve para atención al cliente o traducción asistida en entornos con varios idiomas oficiales.
- Prototipado de pipelines de razonamiento con contexto moderado: con 4096 tokens de contexto en estos ficheros, encaja en tareas de pregunta-respuesta sobre documentos cortos, extracción de datos y análisis de conversaciones breves.
- Evaluación comparativa de cuantizaciones en producción: los dos ficheros permiten medir el compromiso entre precisión y velocidad; en GSM8K con razonamiento desactivado, int8 obtuvo 93 e int4 obtuvo 92 frente a 83 del modelo de referencia en bf16 con transformers.

## Benchmarks y rendimiento

Resultados reportados por la model card (modelo base, razonamiento activado):

| Benchmark | Resultado |
|---|---|
| AIME25 | 72,1 |
| MATH500 | 97,8 |
| GPQA | 64,0 |
| IFEval | 90,3 |

Precisión en GSM8K con razonamiento desactivado (Mac GPU):

| Modelo / fichero | GSM8K |
|---|---|
| int8 LiteRT-LM | 93 |
| int4 LiteRT-LM | 92 |
| Referencia transformers bf16 | 83 |
| Referencia transformers fp32 | 84 |

Rendimiento medido (prefill de 1024 tokens más 256 tokens decodificados, contexto 2048):

| Configuración | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 7,77 s | no ejecutado | detenido por regla de memoria |
| int8 GPU | 8,37 s | no ejecutado | no ejecutado |
| int8 CPU | 28,68 s | no ejecutado | no ejecutado |
| int4 CPU | 36,32 s | no ejecutado | no ejecutado |

En el Mac, el fichero int4 es más rápido en GPU (45,5 tok/s de decodificación frente a 41,0 del int8, con un 7,2 % menos de tiempo total), mientras que el int8 es más rápido en CPU (prefill blockwise del int4 a 56,9 tok/s frente a 127,9 del int8). No se han publicado mediciones en iOS.

## Requisitos de hardware

- VRAM/memoria estimada: el fichero int8 ocupa 9,07 GB y el int4 5,59 GB; el fichero int8 contiene una única sección TFLite de 8,45 GiB y el int4 de 5,21 GiB, ambas por encima del límite aproximado de 2 GiB por sección que describe la model card de Ministral-3-3B-Instruct-2512, lo que condiciona el despliegue en iOS.
- GPU recomendadas: el autor probó con éxito en la GPU de un Mac Studio M4 Max. No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: el fichero int4 cabe en GPUs con al menos ~6 GB de memoria libre; el int8 requiere ~9 GB. El despliegue en teléfonos no está validado: en Galaxy S26 no se ejecutó y en Pixel 8a se detuvo por la regla de memoria del autor.
- Opciones de despliegue: runtime LiteRT-LM (versión probada 0.18.0; con 0.17.1 el int8 respondió correctamente a un `run` simple en GPU de Mac). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: en Mac M4 Max, 45,5 tok/s de decodificación con int4 en GPU y 41,0 tok/s con int8; prefill de 1024 tokens más 256 decodificados en 7,77 s (int4 GPU) y 8,37 s (int8 GPU).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Rendimiento documentado |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-Nano-9B-v2 (LiteRT-LM) | 8,89B | 4096 en estos ficheros (128K original) | `.litertlm`, LiteRT-LM | nvidia-open-model-license | GSM8K 93 (int8), 92 (int4); 45,5 tok/s en M4 Max |
| nvidia/NVIDIA-Nemotron-Nano-9B-v2 (original) | 8,89B | 128K | safetensors, transformers y otros runtimes | nvidia-open-model-license | AIME25 72,1; MATH500 97,8; GPQA 64,0; IFEval 90,3 |
| Ministral-3-3B-Instruct-2512 (LiteRT) | 3B | no disponible | `.litertlm`, LiteRT-LM | no disponible en la información | no disponible |

La comparación con alternativas de la misma categoría (modelos de razonamiento de ~9B en formato on-device) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Contexto reducido: estos ficheros limitan la ventana a 4096 tokens frente a los 128K del modelo original, lo que restringe tareas de contexto largo.
- Riesgo de alucinación: no se documenta una evaluación específica de tasas de alucinación en la información disponible; como modelo generativo, el riesgo persiste.
- Sesgos: no se detalla en la información proporcionada ningún análisis de sesgos del modelo base ni de la conversión.
- Precisión dependiente de la cuantización: la brecha en GSM8K entre los ficheros y la referencia en transformers se concentra en las 16 preguntas más largas que un chunk de Mamba2, lo que sugiere degradación en secuencias largas.
- Configuración de activaciones obligatoria: con las activaciones fp16 por defecto del runtime, el fichero int8 falló por completo (0 de 8); es necesario declarar fp32 en GPU.
- Limitación en iOS: cada fichero es una única sección TFLite de 8,45 GiB (int8) o 5,21 GiB (int4), por encima del límite de ~2 GiB por sección, lo que impide su uso en iOS tal cual.
- El flag `--thinking false` de la CLI no actúa sobre este bundle; para desactivar el razonamiento debe usarse `/no_think` en el mensaje.
- Desactivar el razonamiento produce una ligera pérdida de precisión en prompts difíciles que requieren razonamiento, según NVIDIA.
- Licencia: NVIDIA Open Model License; NVIDIA declara el modelo apto para uso comercial, pero conviene revisar los términos completos antes de desplegarlo en producción.
- Validación móvil incompleta: el rendimiento en teléfonos no está confirmado (no ejecutado en Galaxy S26, detenido por memoria en Pixel 8a).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/NVIDIA-Nemotron-Nano-9B-v2
- Árbol de ficheros: https://huggingface.co/litert-community/NVIDIA-Nemotron-Nano-9B-v2/tree/main
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Nano-9B-v2
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Herramienta de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Script de verificación de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
- Paper (arXiv 2508.14444): https://arxiv.org/abs/2508.14444
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Organización LiteRT Community: https://huggingface.co/litert-community
