# araysuter/Inkling-2-Mini-MLX-8bit

## Resumen

Inkling-2-Mini-MLX-8bit es una conversión cuantizada a 8 bits del checkpoint oficial Inkling-2-Mini de Thinking Machines, realizada de forma independiente por el usuario araysuter y publicada en Hugging Face. Se trata de un modelo multimodal image-text-to-text con arquitectura Mixture of Experts (MoE), aproximadamente 26.400 millones de parámetros lógicos y un total de 24 capas almacenadas que se aplican 48 veces por token (las capas centrales se ejecutan tres veces), según la información del autor. El pipeline declarado es image-text-to-text y el formato de pesos es safetensors en formato MLX.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de gran tamano en hardware Apple Silicon mediante el framework MLX, con un peso total de 30,04 GB (27,98 GiB) para los pesos objetivo más la torre de visión. La conversión parte del release oficial entrenado en NVFP4/MXFP8, no de un checkpoint BF16 original, y el autor advierte explícitamente de que el almacenamiento a 8 bits no recupera precisión ausente en la fuente ni mejora los benchmarks respecto a su conversión a 5 bits.

El modelo está pensado para desarrolladores que necesitan desplegar inferencia multimodal local en Macs con Apple Silicon, con soporte de contexto largo (hasta 131.072 tokens según las pruebas del autor) y una licencia Apache-2.0 que facilita el uso comercial, sujeta a los términos del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con capas recurrentes tipo loop (tag `inkling2_loop`); 24 capas almacenadas y 48 aplicaciones por token |
| Parametros totales | 26.388.559.360 (aprox. 26,4B lógicos, según safetensors y upstream) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (máximo probado por el autor en total de entrada más salida) |
| Tipos de cuantizacion | 8-bit affine, group size 32, min/max round-to-nearest; torre de visión, routing de expertos y compuertas loop/message en precisión flotante original |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta a los términos del modelo fuente) |
| Formato de pesos | safetensors (MLX); tamano del repo 30,1 GB; pesos objetivo más visión 30,04 GB / 27,98 GiB |

## Arquitectura y entrenamiento

La arquitectura es un transformer Mixture of Experts con una innovación estructural denominada `inkling2_loop`: el modelo almacena 24 capas, pero cada token atraviesa 48 aplicaciones de capa, de modo que las capas centrales se ejecutan tres veces. Esta recurrencia implícita permite aumentar la profundidad efectiva sin incrementar linealmente el almacenamiento de pesos. El modelo es multimodal: incluye una torre de visión que procesa imágenes y las integra en el pipeline image-text-to-text. La conversión a 8 bits aplica cuantización affine solo a pesos (weight-only), sin calibración de activaciones, por lo que no se reclama compatibilidad con GPTQ ni AWQ.

El entrenamiento original corresponde a Thinking Machines, que publicó el checkpoint en formato NVFP4/MXFP8. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El autor de la conversión indica que no se incluye el fichero auxiliar `mtp.safetensors`, por lo que la decodificación especulativa (drafting) no está habilitada ni cualificada en esta subida. La validación realizada por el autor reporta un delta NLL de 0,008163 y un ratio de perplejidad de 1,008196 frente al release oficial en una sonda de texto público pequena, además de pruebas de humo de aritmética textual, sintaxis Python y color/forma de imágenes.

## Capacidades

- Generación de texto conversacional multi-turno, con soporte de plantilla de chat.
- Procesamiento de imágenes en pipeline image-text-to-text (entrada de imagen más texto).
- Razonamiento aritmético básico y generación de código Python, verificado en las pruebas de humo del autor.
- Capacidad de contexto largo: hasta 131.072 tokens en total de entrada más salida, probado con dos ventanas completas concurrentes.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas soportados.
- Modo thinking explícito: no disponible en la información proporcionada.
- Decodificación especulativa: no habilitada en esta conversión (el fichero `mtp.safetensors` no se incluye).

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede mantener diálogos multi-turno con contexto de hasta 131.072 tokens, lo que permite arrastrar conversaciones largas o documentos extensos sin truncar, ejecutándose íntegramente en Apple Silicon con MLX.
- Análisis de imágenes con descripción textual: gracias a la torre de visión y al pipeline image-text-to-text, se puede usar para extraer descripciones, responder preguntas sobre capturas o clasificar contenido visual en flujos locales sin enviar datos a la nube.
- Generación de código en entornos de desarrollo con Apple Silicon: el autor valida sintaxis Python y aritmética; el modelo puede integrarse en asistentes de edición o scripts de generación de código que se ejecuten en local, con la ventaja de privacidad y sin coste por token.
- Servicio API compatible con OpenAI en local: el autor documenta un adaptador (TensorFold fork) que expone el checkpoint con contexto máximo probado de 131.072 tokens, útil para equipos que quieran un endpoint interno multimodal sin depender de proveedores externos.
- Procesamiento de documentos largos con imágenes intercaladas: la combinación de contexto largo y visión permite resumir informes, manuales o presentaciones que mezclan texto e imágenes en una sola pasada.
- Prototipado e investigación en cuantización: al ser una conversión independiente con manifiesto de cuantización y validación publicados, sirve como referencia reproducible para estudiar el impacto de la cuantización 8-bit frente a 5-bit en modelos MoE multimodales.
- Despliegue en estaciones de trabajo Mac con 64 GiB o más: el perfil de gateway medido (`memory_required_gib: 31`, `memory_per_request_gib: 4.5`, `max_concurrent: 2`) permite planificar capacidad para dos usuarios concurrentes con ventanas completas de 128K.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos medidos son de velocidad y memoria en un M5 Max con 64 GiB, MLX 0.32.4, decodificación greedy, 256 tokens de salida, KV fresco:

| Prompt tokens | Usuarios | Prompt tok/s (5-bit) | Prompt tok/s (8-bit) | Generación tok/s (5-bit) | Generación tok/s (8-bit) |
| --- | --- | ---: | ---: | ---: | ---: |
| 4.000 | 1 | 1742 | 1694 | 43,0 | 40,4 |
| 8.000 | 1 | 1699 | 1651 | 42,3 | 39,7 |
| 32.000 | 1 | 1410 | 1390 | 38,8 | 36,6 |
| 4.000 | 2 | 906 | 882 | 21,2 | 19,8 |
| 8.000 | 2 | 863 | 843 | 20,9 | 19,6 |
| 32.000 | 2 | 709 | 696 | 19,1 | 18,0 |

La generación en 8 bits es aproximadamente un 6 % más lenta y el procesamiento de prompt entre un 1 % y un 3 % más lento que la conversión a 5 bits. Las asignaciones de MLX inmediatamente tras la carga fueron de 19,21 GiB para 5 bits y 27,98 GiB para 8 bits, antes de contexto y workspace. En la prueba de dos ventanas completas de 128K (131.064 tokens de prompt y 8 de salida por petición), el pico de memoria física del proceso fue de 38,60 GiB, con un mínimo de 11,06 GiB de RAM disponible y 0 MiB de swap adicional.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 27,98 GiB de asignación MLX tras la carga para los pesos en 8 bits, más contexto y workspace; el perfil de gateway medido usa `memory_required_gib: 31` y `memory_per_request_gib: 4.5`.
- GPU recomendadas: Apple Silicon con MLX; el autor midió en un M5 Max con 64 GiB. No se documentan GPUs NVIDIA ni AMD en la información disponible.
- Cabe en consumer GPU: no hay datos para GPUs de consumo NVIDIA; en Apple Silicon requiere equipos con 64 GiB o más para dos ventanas completas de 128K. El autor advierte que la subida por sí sola no cualifica dos ventanas de 128K en una máquina de 64 GiB sin la configuración de admisión adecuada.
- Opciones de despliegue: MLX con `mlx-lm` fijado a un commit concreto (`0c4c99192230f1943dd468d297f0b8a64ae7b7c2`), MLX 0.32.4 y transformers 5.23.0; adaptador TensorFold fork para API compatible con OpenAI. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 40,4 tok/s de generación con prompt de 4.000 tokens y un usuario; 18,0 tok/s con dos usuarios y prompt de 32.000 tokens (medido en M5 Max, 64 GiB).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-8bit (este) | 26,4B lógicos, MoE | 131.072 | Apache-2.0 | safetensors MLX 8-bit | Hugging Face, 607 descargas |
| Inkling-2-Mini-MLX-5bit | 26,4B lógicos, MoE | 131.072 (probado) | Apache-2.0 | safetensors MLX 5-bit | Hugging Face (mismo autor) |
| thinkingmachines/Inkling-2-Mini (oficial) | 26,4B lógicos, MoE | no disponible | Apache-2.0 (según modelo base) | NVFP4/MXFP8 | Hugging Face (Thinking Machines) |

La comparación se limita a las variantes del mismo modelo base porque no se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de la misma categoría en la información proporcionada. La diferencia principal entre las tres variantes es el formato y la precisión de almacenamiento: el oficial en NVFP4/MXFP8, el 5-bit del mismo autor (19,21 GiB tras carga) y este 8-bit (27,98 GiB tras carga), con una penalización de velocidad de aproximadamente el 6 % en generación frente al 5-bit.

## Limitaciones y advertencias

- El almacenamiento a 8 bits no recupera precisión ausente en el release original NVFP4/MXFP8; el autor no reclama mejora de calidad frente al 5-bit.
- La decodificación especulativa no está habilitada: el fichero `mtp.safetensors` no se incluye en la subida.
- Requiere una versión fijada de MLX-LM con soporte para la arquitectura `inkling2_loop`; una versión estándar sin soporte no puede cargar el modelo.
- El consumo de memoria crece con el contexto, la concurrencia, las imágenes y el workspace de ejecución; el autor advierte que la subida por sí sola no cualifica dos ventanas de 128K en una máquina de 64 GiB.
- Los datos de rendimiento y memoria provienen de un único host (M5 Max, 64 GiB) y no constituyen una garantía para otras máquinas o cargas de fondo.
- No se dispone de información sobre sesgos, riesgo de alucinación, idiomas soportados ni evaluaciones de seguridad en la información proporcionada.
- La licencia es Apache-2.0, pero se aplican los términos del modelo fuente de Thinking Machines; es una conversión independiente, no un release oficial.
- El modelo base se publicó en 2026 según las fechas del repositorio; verificar la vigencia de los enlaces y del commit fijado antes de desplegar en producción.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/araysuter/Inkling-2-Mini-MLX-8bit
- Modelo base oficial: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión del checkpoint fuente: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/6e7c8248f75265bdd4fbab5273304243b5d8c2cb
- Conversión 5-bit del mismo autor: https://huggingface.co/araysuter/Inkling-2-Mini-MLX-5bit
- Guía del adaptador TensorFold para API compatible con OpenAI: https://github.com/araysuter/TensorFold/tree/main/tools/inkling
- MLX-LM (commit fijado): https://github.com/ml-explore/mlx-lm/tree/0c4c99192230f1943dd468d297f0b8a64ae7b7c2
