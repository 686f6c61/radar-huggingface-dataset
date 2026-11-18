# RedHatAI/Qwen3.8-27B-speculator.dspark

## Resumen

RedHatAI/Qwen3.8-27B-speculator.dspark es un modelo borrador (draft model) para decodificación especulativa, no un modelo generativo autónomo. Lo desarrolla Red Hat AI y se publica bajo licencia Apache 2.0. Su función es acelerar la inferencia del modelo objetivo Qwen/Qwen3.8-27B proponiendo hasta 8 tokens por paso de decodificación, que el verificador valida en paralelo. Emplea el algoritmo DSpark, una extensión de DFlash que añade una cabeza de Markov para modelar dependencias intra-bloque y una cabeza de confianza para predecir la aceptación por posición.

El checkpoint tiene 1.988.431.617 parámetros en bfloat16 (aproximadamente 24,4 GB de repositorio) y se apoya en un backbone de 5 capas de estilo Qwen3. Consume estados ocultos auxiliares de las capas 4, 12, 20, 28, 36, 44, 52 y 60 del modelo objetivo, lo que le permite alinearse con la representación interna del verificador sin replicar su profundidad. La longitud de contexto configurada es de 262.144 tokens, aunque las evaluaciones de aceptación en contexto largo alcanzan prompts de más de 1,1 millones de tokens.

Su relevancia es práctica: la decodificación especulativa es una de las palancas más eficaces para reducir la latencia en despliegues de LLM de gran tamaño, y este speculator está entrenado específicamente para un modelo de 27B con ventana de contexto muy amplia. Red Hat AI publica además checkpoints cuantizados del verificador (NVFP4 e INT4) con los que el speculator puede combinarse para optimizar coste y throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DSparkDraftModel (backbone de 5 capas estilo Qwen3 con cabeza de Markov y cabeza de confianza) |
| Parametros totales | 1.988.431.617 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens configurados; aceptación evaluada hasta 1.114.783 tokens |
| Tipos de cuantizacion | no disponible para el draft model; el verificador asociado dispone de NVFP4 e INT4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, bfloat16 |

## Arquitectura y entrenamiento

El modelo es un draft model de tipo DSpark. La arquitectura `DSparkDraftModel` consta de un backbone de 5 capas estilo Qwen3 que toma como entrada los estados ocultos de las capas 4, 12, 20, 28, 36, 44, 52 y 60 del verificador Qwen3.8-27B. Sobre esa base se añaden dos componentes: una cabeza de Markov de rango 256 que modela las dependencias entre tokens dentro del bloque especulado, y una cabeza de confianza que estima la probabilidad de aceptación en cada posición. El modelo propone hasta 8 tokens por paso, con un vocabulario de draft de 248.320 entradas y un token de máscara con ID 248.077. El algoritmo DSpark extiende DFlash precisamente con esas dos cabezas.

El entrenamiento se realizó con la librería Speculators (versión 0.8.0.dev221, commit 876e2b6) y partió de un checkpoint DSpark previo del mismo modelo objetivo (warm start). Los datos son una versión regenerada por Qwen3.8-27B de Open PerfectBlend, con 1.739.710 ejemplos de 8.192 tokens y una partición 99/1 de entrenamiento y validación. La extracción de estados ocultos usó cuatro réplicas de datos en paralelo con vLLM 0.29.0 (tensor-parallel 1), mientras cuatro rangos FSDP entrenaban el draft model en un total de 8 GPU NVIDIA H200. La configuración incluye `sample_from_anchor=true`, hasta 1.024 anclas por secuencia, función de pérdida compuesta `{"ce":0.1,"tv":0.9}`, optimizador Muon con learning rate 0,001 y una época planificada. El checkpoint publicado corresponde al paso global 107.520, aproximadamente el 75% del run. La validación se hizo en una NVIDIA H100.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: propone hasta 8 tokens por paso que el verificador Qwen3.8-27B acepta o rechaza en bloque.
- Predicción de aceptación por posición mediante la cabeza de confianza, lo que permite estimar cuántos tokens del bloque serán válidos.
- Modelado de dependencias intra-bloque mediante la cabeza de Markov de rango 256.
- Funcionamiento en contexto largo: aceptación media de 4,492 tokens en prompts de 4K a más de 1M de tokens sobre MRCR 8-Needle.
- Integración nativa con vLLM mediante `--speculative-config` y método `dspark`.
- Compatibilidad con verificadores cuantizados NVFP4 e INT4 de Red Hat AI.
- No soporta tool calling, agentes, visión ni audio por sí mismo: esas capacidades dependen del modelo objetivo Qwen3.8-27B.
- Idiomas: hereda el comportamiento del verificador; no se documentan idiomas específicos para el draft model.

## Casos de uso

- Aceleración de inferencia en producción con vLLM: se sirve Qwen3.8-27B con `--speculative-config` apuntando a este checkpoint y `num_speculative_tokens=7`, reduciendo la latencia por token generado sin cambiar la calidad de salida.
- Despliegue de asistentes de código de baja latencia: en HumanEval la longitud de aceptación es de 4,42 tokens, por lo que tareas de autocompletado y generación de funciones se benefician de un throughput notablemente superior al decoding autorregresivo puro.
- Razonamiento matemático interactivo: es el dominio con mejor aceptación (5,74 tokens de media), adecuado para entornos de resolución de problemas donde el usuario espera respuestas en streaming.
- Sistemas RAG con documentos extensos: con aceptación de 4,81 en tareas RAG y 4,492 en MRCR 8-Needle hasta 1M de tokens, resulta apropiado para pipelines que inyectan grandes volúmenes de contexto y necesitan tiempos de respuesta contenidos.
- Traducción automática y resumen de documentos: aceptaciones de 4,55 y 3,94 respectivamente, útiles en servicios de procesamiento por lotes con requisitos de coste por token.
- Atención al cliente multi-turno: la ventana de 262.144 tokens configurada permite mantener historiales largos y, combinada con el speculator, reducir el coste de cada turno.
- Evaluación comparativa de técnicas de decodificación: sirve como referencia reproducible frente a MTP con el mismo número de tokens especulativos en experimentos de throughput e interactividad.

## Benchmarks y rendimiento

Tasas de aceptación por posición con 8 tokens especulativos, verificador denso Qwen3.8-27B y vLLM 0.29.0:

| Dataset | Longitud de aceptación | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| HumanEval | 4,42 | 82,5% | 65,4% | 51,4% | 40,9% | 33,0% | 27,0% | 22,7% | 19,5% |
| math_reasoning | 5,74 | 89,6% | 79,9% | 70,1% | 61,2% | 53,7% | 45,9% | 39,6% | 33,8% |
| qa | 4,22 | 79,0% | 62,0% | 49,1% | 39,1% | 31,3% | 25,2% | 19,9% | 15,9% |
| question | 3,80 | 78,0% | 58,2% | 43,0% | 31,9% | 24,1% | 18,6% | 14,6% | 11,6% |
| rag | 4,81 | 83,9% | 69,6% | 57,3% | 47,4% | 39,4% | 32,9% | 27,3% | 22,9% |
| summarization | 3,94 | 81,8% | 63,3% | 48,1% | 35,2% | 25,3% | 18,1% | 12,8% | 9,4% |
| tool_call | 3,76 | 77,9% | 57,6% | 42,4% | 31,4% | 23,6% | 18,0% | 14,1% | 11,2% |
| translation | 4,55 | 83,4% | 68,1% | 55,5% | 44,6% | 35,7% | 28,7% | 22,2% | 17,3% |
| writing | 3,77 | 77,7% | 57,6% | 42,6% | 31,7% | 23,9% | 18,4% | 14,4% | 11,4% |

Aceptación en contexto largo (MRCR 8-Needle, 8 tokens especulativos):

| Longitud de prompt | Peticiones únicas | Longitud de aceptación media |
|---|---:|---:|
| 4K–8K | 29 | 4,745 |
| 8K–16K | 24 | 4,041 |
| 16K–32K | 21 | 4,627 |
| 32K–65K | 25 | 4,484 |
| 65K–131K | 23 | 4,345 |
| 131K–262K | 26 | 4,843 |
| 262K–524K | 24 | 4,671 |
| 524K–1M | 38 | 4,400 |
| 1M+ | 14 | 4,297 |
| Overall | 224 | 4,492 |

Longitud máxima de prompt con éxito: 1.114.783 tokens. La model card indica que DSpark supera a MTP con el mismo número de tokens especulativos en throughput e interactividad sobre HumanEval, razonamiento matemático y RAG, con ventaja mayor en concurrencia baja y media y positiva aún en concurrencia 128, aunque se estrecha en RAG. No se publican cifras absolutas de throughput ni de latencia.

## Requisitos de hardware

- VRAM para el draft model: los pesos en bfloat16 ocupan aproximadamente 4 GB (1.988 millones de parámetros), aunque el repositorio completo pesa 24,4 GB; el grueso de la VRAM la consume el verificador Qwen3.8-27B.
- Verificador de referencia: Qwen3.8-27B denso en bfloat16 requiere del orden de 54 GB de pesos, más caché KV para contexto largo; con NVFP4 o INT4 de Red Hat AI el requisito baja de forma sustancial.
- GPU recomendadas: H100 o H200 para el verificador en bfloat16; A100 80 GB como mínimo razonable; RTX 4090 (24 GB) solo es viable con el verificador cuantizado y contextos moderados.
- Cabe en GPU de consumo únicamente con cuantización agresiva del verificador y ventanas de contexto reducidas; el draft model por sí solo sí cabe en cualquier GPU consumer moderna.
- Despliegue: vLLM 0.29.0 o superior con `--speculative-config '{"model":"RedHatAI/Qwen3.8-27B-speculator.dspark","num_speculative_tokens":7,"method":"dspark"}'`. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Entrenamiento de referencia: 8 GPU NVIDIA H200 (4 para extracción de estados ocultos con vLLM, 4 para entrenamiento FSDP) y 1 H100 para validación.
- Latencia y throughput: no se publican valores absolutos; la model card solo reporta comparaciones relativas frente a MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| RedHatAI/Qwen3.8-27B-speculator.dspark | 1.988 M | 262.144 configurados; evaluado hasta 1,11M | Draft model DSpark para Qwen3.8-27B | Apache 2.0 | Hugging Face, 3.983 descargas |
| MTP (Multi-Token Prediction) de Qwen3.8-27B | no disponible | no disponible | Predicción multi-token integrada en el verificador | la del modelo base | incluido con el modelo objetivo |
| RedHatAI/Qwen3.8-27B-NVFP4 | 27B (verificador) | no disponible | Verificador cuantizado NVFP4 | Apache 2.0 | Hugging Face |
| RedHatAI/Qwen3.8-27B-INT4 | 27B (verificador) | no disponible | Verificador cuantizado INT4 | Apache 2.0 | Hugging Face |

La comparación directa más relevante es frente a MTP: con los mismos 8 tokens especulativos, DSpark reporta mayor throughput e interactividad, con ventaja especialmente marcada en razonamiento matemático y menor en RAG a concurrencia alta. No se dispone de datos de otros speculators de terceros para Qwen3.8-27B en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no debe usarse de forma autónoma, solo como componente de decodificación especulativa junto a Qwen3.8-27B.
- El checkpoint publicado corresponde al paso 107.520, aproximadamente el 75% de la época planificada; puede existir margen de mejora con el run completo.
- La tasa de aceptación decae con la posición dentro del bloque (del 82,5% al 19,5% en HumanEval), por lo que el beneficio real depende de la carga y del número de tokens especulativos configurado.
- La aceptación es más baja en tool_call (3,76) y writing (3,77), cargas donde la aceleración será menor.
- La ventaja frente a MTP se estrecha en RAG a concurrencia 128 según la model card.
- No se documentan sesgos, riesgos de alucinación ni idiomas soportados para el draft model; estos dependen del verificador Qwen3.8-27B.
- Requiere vLLM 0.29.0 con soporte del método `dspark` y código personalizado (`custom_code`); no hay constancia de compatibilidad con otros motores de inferencia.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.8-27B y de los datasets de entrenamiento.
- El rendimiento en contexto muy largo se midió con MRCR 8-Needle; no se documentan evaluaciones en otras tareas de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Verificador cuantizado NVFP4: https://huggingface.co/RedHatAI/Qwen3.8-27B-NVFP4
- Verificador cuantizado INT4: https://huggingface.co/RedHatAI/Qwen3.8-27B-INT4
- Librería Speculators: https://github.com/vllm-project/speculators
- Commit de entrenamiento: https://github.com/vllm-project/speculators/commit/876e2b6f2ec84725a63fe5de25355c3c66537563
- Dataset Open PerfectBlend: https://huggingface.co/datasets/mlabonne/open-perfectblend
