# flaitenberger/economize-early-exit-gemma-4-31B-it

## Resumen

`flaitenberger/economize-early-exit-gemma-4-31B-it` es un drafter de salida temprana (early-exit) para el modelo base `google/gemma-4-31B-it`, desarrollado por Filipe Laitenberger y publicado bajo la librería `economize`. No es un modelo autónomo: se trata de un adaptador de 1074 millones de parámetros que acelera la decodificación del modelo base mediante decodificación especulativa autoinducida (self-speculative decoding). El drafter ejecuta una copia entrenable de las dos primeras capas del modelo base sobre el último token y lee el siguiente token a través de un adaptador de lectura y la cabeza LM del modelo base.

La relevancia de esta ficha radica en que ilustra una técnica de eficiencia composable: el drafter propone tokens que el modelo base verifica en cada paso, de modo que la salida greedy coincide con la del modelo base y el muestreo especulativo sigue su distribución. Según las mediciones del autor, se obtiene una aceleración global de 1,49x en throughput de decodificación sobre una H100 en bf16 con batch size 1, con hasta 1,73 tokens por pasada del modelo base.

El repositorio ocupa 2,4 GB y contiene únicamente los pesos del drafter, no los del modelo base. La licencia del drafter es Apache 2.0, mientras que el modelo base conserva su propia licencia, que debe consultarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Early-exit drafter sobre transformer (copia entrenable de las dos primeras capas del modelo base + adaptador de lectura + cabeza LM del base) |
| Parametros totales | 1074M (solo drafter; el modelo base no se incluye) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, dtype bf16 en el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (drafter); el modelo base tiene licencia propia |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El drafter sigue un esquema de salida temprana: en cada paso de borrador se ejecuta una copia entrenable de las dos primeras capas del modelo base sobre el último token y se lee el siguiente token mediante un adaptador de lectura y la cabeza LM del modelo base. La verificación la realiza el modelo base sin modificar. El checkpoint almacena la configuración de decodificación que resultó más rápida en las mediciones, `cycle_length=3` (hasta 2 borradores por pasada del modelo base); otras configuraciones pueden pasarse mediante `economize.DecodeConfig(...)`.

El entrenamiento se realizó con la librería `economize` sobre 63.969 respuestas (63,3M tokens) que el modelo base generó de forma greedy para prompts de UltraChat, ShareGPT y colecciones de código y matemáticas. Se eliminaron los prompts que compartían un 13-grama con alguno de los conjuntos de evaluación. El objetivo es una divergencia KL respecto a la distribución del siguiente token del modelo base sobre 8 pasos de borrador desenrollados. Se hizo una pasada sobre los datos en 5125 pasos de optimizador de 16384 tokens con padding cada uno, con AdamW (betas 0,9 y 0,95), learning rate de 3e-4 (1e-4 para las capas copiadas del modelo base), 100 pasos de warmup, decaimiento coseno hasta una décima del pico y clipping de gradiente en 1,0. El entrenamiento consumió 16,1 horas de GPU en una sola GPU y el modelo base permaneció congelado.

## Capacidades

- Generación de texto acelerada: actúa como drafter para `google/gemma-4-31B-it`, reduciendo el coste por token generado.
- Decodificación greedy exacta: cada borrador se verifica con el modelo base, por lo que la decodificación greedy devuelve la salida greedy del modelo base.
- Muestreo especulativo: con `verifier="rejection"` el muestreo sigue la distribución del modelo base.
- Aceleración en múltiples dominios: chat, código, matemáticas, resumen y contexto largo (según las mediciones del autor).
- Integración con la librería `economize` mediante `economize.from_pretrained` o `economize.load` para adjuntarlo a un modelo base ya cargado.
- No soporta tool calling, agentes, visión, audio ni modo thinking por sí mismo; esas capacidades, si existen, dependen del modelo base.

## Casos de uso

- Servicio de chat en producción: el drafter acelera la generación multi-turno sobre Gemma-4-31B-it con una ganancia medida de 1,37x en dominios de chat, manteniendo la salida greedy del modelo base.
- Generación de código en pipelines de CI/CD: con 1,55x de aceleración en código (HumanEval, MBPP, LiveCodeBench), reduce el tiempo de generación de parches y tests sin cambiar la semántica de la salida.
- Razonamiento matemático asistido: la aceleración de 1,66x en matemáticas (GSM8K, MATH-500, AIME, AMC) resulta útil en pipelines que resuelven problemas paso a paso con muchas muestras.
- Resumen de documentos: con 1,19x en resumen (CNN/DailyMail), permite procesar lotes de documentos con menor coste por token.
- Procesamiento de contexto largo: 1,33x en LongBench, adecuado para tareas que requieren ventanas extensas y muchas llamadas al modelo.
- Despliegue con restricciones de latencia: al usar batch size 1 y CUDA graphs en H100, encaja en servicios interactivos donde el throughput por petición es crítico.
- Evaluación comparativa de técnicas de eficiencia: sirve como referencia reproducible para medir el impacto de la decodificación especulativa autoinducida en un modelo de 31B.

## Benchmarks y rendimiento

Aceleración de throughput de decodificación relativa a la decodificación greedy simple del modelo base en el mismo runtime, medida con economize 0.3.2 en una NVIDIA H100 en bf16 con CUDA graphs y batch size 1. Prompts: 8 por conjunto de Spec-Bench, MT-Bench, AlpacaEval y Arena-Hard (chat), HumanEval, MBPP y LiveCodeBench (código), GSM8K, MATH-500, AIME 2024/2025 y AMC 2023 (matemáticas), CNN/DailyMail (resumen) y LongBench (contexto largo), con hasta 256 tokens nuevos.

| Conjunto | Aceleración | Tokens por pasada del modelo base |
|---|---|---|
| Global | 1,49x | 1,73 |
| Chat | 1,37x | no disponible |
| Código | 1,55x | no disponible |
| Matemáticas | 1,66x | no disponible |
| Resumen | 1,19x | no disponible |
| Contexto largo | 1,33x | no disponible |

En bf16, una pasada de verificación sobre varios tokens redondea de forma distinta a un paso de un solo token, por lo que tras un tiempo la salida puede diferir de la decodificación bf16 simple del mismo modo que dos kernels bf16 difieren entre sí. En la medición, el 66% de las respuestas fueron idénticas en los 256 tokens. En float32 la salida coincide exactamente con la decodificación greedy simple.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el drafter ocupa 2,4 GB en el repositorio y el modelo base de 31B debe cargarse aparte (en bf16, aproximadamente 62 GB solo para los pesos del base, sin contar caché KV ni overhead).
- GPU recomendadas: NVIDIA H100 (configuración usada en las mediciones); para el modelo base de 31B en bf16 se requiere al menos una GPU con 80 GB o sharding multi-GPU.
- Cabe en GPU consumer: no disponible; el drafter por sí solo cabría, pero el modelo base de 31B en bf16 no cabe en GPUs consumer de 24 GB sin cuantización, que no está documentada para este checkpoint.
- Opciones de despliegue: librería `economize` (>= 0.4) con `transformers` y PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: aceleración de 1,49x global sobre decodificación greedy del base en H100, bf16, batch size 1 y CUDA graphs; no se publican latencias absolutas ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| flaitenberger/economize-early-exit-gemma-4-31B-it | 1074M (drafter) | no disponible | Early-exit + decodificación especulativa autoinducida | Apache 2.0 (drafter) | Hugging Face, librería economize |
| google/gemma-4-31B-it | 31B | no disponible | Transformer base | Licencia propia de Gemma | Hugging Face |
| Drafters especulativos convencionales (modelos pequeños independientes) | variable | no disponible | Decodificación especulativa con modelo borrador separado | variable | variable |

No se dispone de datos de benchmarks comparativos frente a otras técnicas de decodificación especulativa en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar `google/gemma-4-31B-it` y la librería `economize`; los pesos del base no están incluidos.
- En bf16 la salida puede diferir de la decodificación greedy simple tras varios tokens (solo el 66% de las respuestas fueron idénticas en 256 tokens en la medición); para coincidencia exacta se requiere float32.
- Los datos de aceleración provienen de una única ejecución de timing en una H100 con batch size 1; el rendimiento en otros hardware, batch sizes o runtimes no está documentado.
- No se documentan idiomas soportados, longitud de contexto ni tipos de cuantización para este checkpoint.
- La licencia Apache 2.0 cubre solo el drafter; el uso comercial del modelo base está sujeto a la licencia de Gemma, que debe revisarse.
- Riesgo de alucinación y sesgos: heredados del modelo base, no evaluados de forma independiente en esta ficha.
- El entrenamiento se realizó sobre respuestas greedy del modelo base en dominios de chat, código y matemáticas; el rendimiento en otros dominios no está medido.
- No se documentan capacidades de tool calling, agentes, visión ni audio para este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/flaitenberger/economize-early-exit-gemma-4-31B-it
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio economize: https://github.com/Thiggel/economize
- Documentación economize: https://thiggel.github.io/economize/
