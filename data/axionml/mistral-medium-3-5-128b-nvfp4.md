# AxionML/Mistral-Medium-3.5-128B-NVFP4

## Resumen

AxionML/Mistral-Medium-3.5-128B-NVFP4 es un espejo (mirror) de los pesos cuantizados en NVFP4 de Mistral Medium 3.5, el primer modelo insignia "fusionado" de Mistral AI. La cuantizacion la realizo NVIDIA con NVIDIA Model Optimizer y AxionML se limita a replicar el repositorio para facilitar el despliegue. Mistral Medium 3.5 unifica en un unico conjunto de pesos las capacidades de tres familias anteriores (Instruct, Reasoning —antes Magistral— y Devstral), de modo que cubre instrucciones, razonamiento y codigo sin cambiar de checkpoint.

Se trata de un transformer denso de 128 B de parametros declarados (los archivos safetensors contabilizan 83.840.178.944 parametros) con codificador de vision, ventana de contexto de 262.144 tokens y razonamiento configurable por peticion mediante `reasoning_effort`. La entrada es multimodal (texto e imagen) y esta orientado a casos agenticos y de programacion.

La relevancia del repositorio esta en el formato NVFP4: en GPUs Blackwell los pesos se almacenan en FP4 (codebook E2M1) con escalas de bloque FP8 (E4M3) sobre microbloques de 16 elementos, lo que reduce el checkpoint a unos 95 GB con una perdida de precision minima frente a FP8 segun los datos publicados por NVIDIA. La licencia es la Modified MIT de Mistral AI con umbral de ingresos de 20 millones de dolares mensuales, mas la NVIDIA Open Model License para la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con codificador de vision (mistral3) |
| Parametros totales | 128 B declarados; 83.840.178.944 parametros contabilizados en safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (capas MLP de los bloques 4-86), FP8 (MLP de los bloques 0-3 y 87, y todas las capas de atencion), KV cache en FP8 |
| Idiomas soportados | 11 idiomas (no se detalla la lista completa) |
| Licencia | Modified MIT (Mistral AI) + NVIDIA Open Model License |
| Formato de pesos | safetensors (esquema mixto ModelOpt) |
| Tamano del repositorio | 95,3 GB |
| Pipeline | image-text-to-text |
| Modelo base | mistralai/Mistral-Medium-3.5-128B |
| Herramienta de cuantizacion | NVIDIA Model Optimizer v0.44.0 |
| Dataset de calibracion | Mezcla de Nemotron-Post-Training-v3 |
| Muestreo recomendado | temperature=0.7, top_p=0.95 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso con codificador de vision, identificado en el ecosistema `transformers` como `mistral3`. Mistral AI lo describe como su primer modelo insignia "fusionado": consolida en un unico conjunto de pesos las capacidades de las familias Instruct, Reasoning (antes Magistral) y Devstral, de modo que no hace falta alternar entre checkpoints especializados segun la tarea. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

La innovacion principal de esta ficha es la cuantizacion, no el entrenamiento. NVIDIA aplico un esquema mixto con Model Optimizer v0.44.0: las capas lineales MLP de los bloques decodificadores 4 a 86 se almacenan en NVFP4, mientras que las capas MLP de los bloques 0-3 y 87, y todas las capas lineales de atencion, se mantienen en FP8. La KV cache tambien va en FP8. NVFP4 combina un codebook FP4 E2M1 (magnitudes representables de hasta ±6, con saturacion en lugar de codificaciones IEEE NaN/Inf) con escalas de bloque FP8 E4M3 sobre microbloques de 16 elementos, lo que permite escalas fraccionarias y seleccion de escala minimizando el error. En los Tensor Cores de Blackwell, los multiplicadores FP4 nativos se combinan con acumulacion en FP32 para preservar la precision de los productos escalares.

## Capacidades

- Generacion de texto e instrucciones generales en un unico modelo fusionado (Instruct + Reasoning + Devstral).
- Razonamiento configurable por peticion mediante el parametro `reasoning_effort` (la evaluacion publicada usa `high`).
- Generacion y asistencia de codigo, con orientacion explicita a casos agenticos de programacion.
- Vision: pipeline `image-text-to-text`, con entrada de imagenes ademas de texto.
- Multilingue: 11 idiomas segun la model card (la lista concreta no esta disponible).
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Uso en entornos agenticos segun la descripcion de Mistral AI; el detalle del soporte de tool calling no se especifica en la informacion disponible.

## Casos de uso

- Agentes de programacion: el modelo hereda capacidades de Devstral y esta optimizado por Mistral AI para tareas de codigo agentico; puede editar repositorios, ejecutar tareas multi-paso y razonar sobre bases de codigo gracias a sus 262.144 tokens de contexto.
- Asistente de razonamiento avanzado: con `reasoning_effort` configurable, permite ajustar el coste computacional por consulta, usando esfuerzo alto para matematicas o logica y esfuerzo bajo para tareas simples.
- Analisis de documentos extensos con imagenes: al combinar vision y contexto largo, sirve para procesar informes, planos o capturas junto a texto asociado en una sola peticion.
- Atencion al cliente automatizada: la ventana de 262.144 tokens permite mantener conversaciones multi-turno con historial amplio y contexto documental adjunto sin truncar.
- Generacion de codigo en produccion: se puede desplegar tras vLLM o SGLang y exponer como endpoint compatible con la API de OpenAI para integrarlo en pipelines de CI/CD o editores.
- Investigacion cientifica asistida: los resultados en GPQA Diamond (76,80) y AIME 2025 (88,75) en NVFP4 lo situan como candidato para tareas de fisica, quimica y matematicas de nivel competitivo.
- Despliegue en infraestructura Blackwell: equipos con GPUs B200 pueden aprovechar los multiplicadores FP4 nativos para servir el modelo con un coste por token reducido frente a FP8.

## Benchmarks y rendimiento

Resultados publicados por NVIDIA para este checkpoint, con `reasoning_effort="high"`, `temperature=0.7` y `top_p=0.95`. Se comparan la version FP8 y la version NVFP4:

| Benchmark | FP8 | NVFP4 |
|---|---|---|
| MMLU Pro | 82,31 | 82,20 |
| GPQA Diamond | 76,88 | 76,80 |
| AA-LCR | 62,06 | 65,10 |
| SciCode | 42,50 | 42,60 |
| AIME 2025 | 88,85 | 88,75 |
| IFBench | 70,25 | 69,17 |
| MMMU Pro | 63,35 | 62,79 |

Dato adicional procedente de la busqueda web: 77,6 % en SWE-Bench Verified para el modelo base Mistral Medium 3.5. No se han publicado en la informacion disponible resultados de otros benchmarks (HumanEval, GSM8K, etc.) para este checkpoint.

## Requisitos de hardware

- Peso del checkpoint: aproximadamente 95 GB, por lo que no cabe en una sola GPU de consumo ni en GPUs profesionales de 80 GB.
- Configuracion recomendada por el autor: vLLM con `--tensor-parallel-size 4` (validado con `vllm/vllm-openai:v0.21.0` sobre B200) o SGLang con `--tp 4 --quantization modelopt_mixed`.
- GPUs recomendadas: NVIDIA B200 (Blackwell) para aprovechar los multiplicadores FP4 nativos. En H100/H200 el formato NVFP4 no dispone de aceleracion nativa y el rendimiento puede degradarse; el autor no documenta validacion en estas plataformas.
- GPUs de consumo (RTX 4090, 5090, etc.): no es viable, el checkpoint de 95 GB excede la VRAM disponible.
- KV cache en FP8: reduce el coste de memoria del contexto, pero con 262.144 tokens el consumo adicional sigue siendo considerable.
- Limite de contexto en el ejemplo de despliegue: el comando de vLLM usa `--max-model-len 196608` (192 k tokens), por debajo del maximo declarado de 262.144.
- Opciones de despliegue documentadas: vLLM y SGLang. No se confirma soporte de llama.cpp u Ollama para esta version cuantizada en NVFP4.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AxionML/Mistral-Medium-3.5-128B-NVFP4 (esta ficha) | 128 B declarados (83,84 B en safetensors) | 262.144 tokens | NVFP4 + FP8 mixto | Modified MIT + NVIDIA Open Model License | Mirror de AxionML |
| nvidia/Mistral-Medium-3.5-128B-NVFP4 | 128 B declarados | 262.144 tokens | NVFP4 + FP8 mixto | Modified MIT + NVIDIA Open Model License | Repositorio original de la cuantizacion |
| mistralai/Mistral-Medium-3.5-128B | 128 B | 262.144 tokens | FP8 / BF16 (sin NVFP4) | Modified MIT | Modelo base original |

No se dispone de datos de benchmarks comparativos con modelos de otras familias (Llama, Qwen, DeepSeek) en la informacion proporcionada; por tanto, la comparativa se limita a las tres variantes del mismo modelo.

## Limitaciones y advertencias

- Sesgos y contenido danino: el modelo base se entreno con datos que pueden contener lenguaje toxico y sesgos sociales; la version cuantizada hereda estas limitaciones y puede generar contenido inexacto, sesgado u ofensivo.
- Alucinacion: no se documentan mecanismos especificos de mitigacion; aplicar las salvaguardas habituales de validacion en produccion.
- Restriccion de licencia: la Modified MIT de Mistral AI prohibe el uso a empresas con mas de 20 millones de dolares de ingresos globales mensuales sin licencia comercial de Mistral AI. La cuantizacion esta ademas sujeta a la NVIDIA Open Model License.
- Limitacion de hardware: NVFP4 esta pensado para Tensor Cores de Blackwell; en GPUs sin soporte FP4 nativo el rendimiento puede no ser el esperado y el soporte depende de vLLM o SGLang.
- Idiomas: la model card indica 11 idiomas, pero no se detalla la lista ni la calidad relativa por idioma.
- Contexto efectivo: aunque se declaran 262.144 tokens, el ejemplo de despliegue de vLLM limita a 196.608 tokens, y el rendimiento en el extremo del contexto no esta documentado en la informacion disponible.
- Repositorio recien creado (0 descargas, 0 likes en el momento de la consulta) y sin validacion upstream del comando de SGLang segun el propio autor.
- Es un mirror: cualquier actualizacion o correccion procedera del repositorio de NVIDIA, no de AxionML.

## Enlaces

- Repositorio AxionML: https://huggingface.co/AxionML/Mistral-Medium-3.5-128B-NVFP4
- Repositorio NVIDIA (cuantizacion original): https://huggingface.co/nvidia/Mistral-Medium-3.5-128B-NVFP4
- Modelo base: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B
- Licencia del modelo base: https://huggingface.co/mistralai/Mistral-Medium-3.5-128B/blob/main/LICENSE
- NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Documentacion de Mistral Medium 3.5: https://docs.mistral.ai/models/mistral-medium-3-5-26-04
- Ficha en Microsoft Foundry: https://ai.azure.com/catalog/models/mistral-medium-3-5
- Ficha de especificaciones y VRAM: https://bestllmfor.com/catalog/mistral-medium-35/
- Coleccion Nemotron-Post-Training-v3: https://huggingface.co/collections/nvidia/nemotron-post-training-v3
