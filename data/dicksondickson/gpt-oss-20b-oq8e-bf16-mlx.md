# dicksondickson/gpt-oss-20b-oQ8e-bf16-MLX

## Resumen

`dicksondickson/gpt-oss-20b-oQ8e-bf16-MLX` es una cuantización de 8 bits del modelo `openai/gpt-oss-20b`, publicada por el usuario dicksondickson y empaquetada en formato MLX para su ejecución en Apple Silicon. No es un modelo entrenado desde cero: es un checkpoint derivado que reutiliza los pesos del modelo abierto de OpenAI y los recodifica con la herramienta oMLX 0.71.dev1 aplicando cuantización de 8 bits con matriz de importancia (imatrix), dejando los tensores críticos en bf16.

El interés de esta ficha no está en la arquitectura, heredada íntegramente del modelo base, sino en el proceso de compresión y en el ecosistema de ejecución: MLX, la librería de Apple para cómputo tensorial en chips M-series. Frente a la distribución oficial de OpenAI, que reparte los pesos en MXFP4 para las proyecciones MoE, esta versión apunta a máquinas con memoria unificada de gama alta y requiere M3 o posterior según el autor, porque los tensores sensibles se mantienen en bf16.

El modelo base es un transformer de mezcla de expertos (MoE) de aproximadamente 20 900 millones de parámetros totales y unos 4000 millones activos por token, lo que lo sitúa en la franja de modelos de razonamiento de tamaño medio. La licencia declarada en este repositorio es MIT, aunque conviene revisar la licencia y la política de uso del modelo original antes de un despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); pesos del modelo base `openai/gpt-oss-20b` |
| Parametros totales | 20 914 757 184 (~20,9 B), dato real de los safetensors |
| Parametros activos | ~4 B por token de inferencia (dato de NVIDIA NIM para el modelo base) |
| Longitud de contexto | No disponible en la informacion de este repositorio; la documentacion de OpenAI para `gpt-oss-20b` declara 128 000 tokens |
| Tipos de cuantizacion | Checkpoint en 8 bits (esquema oQ8e) con tensores importantes en bf16; el autor publica tambien variantes oQ5e y oQ6e |
| Idiomas soportados | No disponible |
| Licencia | MIT (repositorio); el modelo base se distribuye bajo Apache 2.0 con la politica de uso gpt-oss de OpenAI |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); no se ofrece GGUF |
| Tamano del repositorio | 44,5 GB |
| Herramienta de cuantizacion | oMLX 0.71.dev1 con imatrix habilitada |
| Fecha de recuantizacion | 18 de octubre de 2026 (el autor pide volver a descargar respecto a copias anteriores) |
| Descargas / likes | 296 / 1 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, sin modificaciones estructurales: un transformer disperso con capas de mezcla de expertos, 20 900 millones de parámetros totales y aproximadamente 4000 millones activos por token. En la distribución original de OpenAI todos los pesos están en BF16 salvo las proyecciones de los expertos MoE, que se publican en MXFP4. Este checkpoint no altera el grafo: sustituye el esquema de representación numérica por una cuantización de 8 bits con matriz de importancia, manteniendo en bf16 los tensores que el autor considera críticos para preservar la calidad.

No se dispone de información sobre los datos de entrenamiento (número de tokens, composición del corpus, fases de RLHF o DPO) en la documentación de este repositorio; esa información correspondería a la model card de `openai/gpt-oss-20b`, que aquí no se ha proporcionado. La innovación técnica atribuible a este checkpoint es exclusivamente de compresión y empaquetado: el uso de imatrix para decidir qué pesos toleran la reducción a 8 bits, la preservación selectiva en bf16 y el formato MLX, optimizado para el backend Metal y la memoria unificada de los chips M-series. El autor advierte que los tensores en bf16 están pensados para M3 y posteriores.

## Capacidades

- Generación de texto y razonamiento multi-paso, heredados del modelo base `openai/gpt-oss-20b`.
- Generación de código y resolución de problemas matemáticos, capacidades propias de la familia gpt-oss.
- Soporte de tool calling y function calling en el modelo original; no documentado explícitamente en este repositorio.
- Ejecución local íntegra en Apple Silicon mediante MLX, sin dependencia de servicios en la nube.
- Cuantización de 8 bits con tensores críticos en bf16, orientada a preservar la fidelidad de las activaciones más sensibles.
- Compatibilidad con el runtime oMLX y con el ecosistema MLX (`mlx-lm`); el autor cita también LM Studio en las variantes hermanas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de visión, audio o modo thinking explícito: no disponible en la información proporcionada para este checkpoint.

## Casos de uso

- Asistente de razonamiento en local para portátiles Apple Silicon: el modelo se ejecuta sobre memoria unificada con MLX, lo que permite mantener conversaciones de razonamiento sin enviar datos a terceros, algo relevante en entornos con requisitos de confidencialidad.
- Generación y revisión de código en el editor: al heredar las capacidades del modelo base, puede emplearse como asistente integrado en flujos de desarrollo sobre macOS, con la ventaja de que la inferencia ocurre en la propia máquina y no añade latencia de red.
- Prototipado de agentes con tool calling: la arquitectura MoE de ~4 B activos reduce el coste por token frente a un modelo denso del mismo tamaño, lo que facilita iterar sobre bucles de razonamiento y llamadas a herramientas en una estación de trabajo.
- Procesamiento de documentación técnica con contexto largo: si se confirma la ventana de 128 000 tokens del modelo base, permite resumir y consultar repositorios de documentación o expedientes completos en una sola pasada, condicionado a la memoria disponible para la caché KV.
- Evaluación comparativa de cuantizaciones: este checkpoint sirve para medir la pérdida de calidad de un esquema de 8 bits con imatrix frente al MXFP4 original de OpenAI y frente a las variantes oQ5e y oQ6e del mismo autor, en una misma máquina Apple.
- Desarrollo offline en campo o en entornos aislados: al ser un paquete MLX autónomo, puede desplegarse en equipos sin conectividad, útil en laboratorios, auditorías o entornos de investigación con air-gap.
- Docencia e investigación sobre cuantización: el repositorio documenta la herramienta, la versión y el esquema empleados, lo que lo convierte en un caso reproducible para estudiar el impacto de imatrix y de la preservación selectiva en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y tampoco se han proporcionado métricas de latencia o throughput para esta cuantización concreta.

## Requisitos de hardware

- VRAM equivalente estimada: en torno a 21 GB solo para los pesos en 8 bits (20,9 B de parámetros), más la caché KV y el overhead del runtime. El repositorio ocupa 44,5 GB, un tamaño superior al de los pesos, cuya composición exacta no se detalla en la información disponible.
- Plataforma: exclusivamente Apple Silicon. El autor indica que los tensores en bf16 requieren chips M3 o posteriores.
- Memoria unificada recomendada: 32 GB como mínimo para contexto corto; 48-64 GB para explotar ventanas de contexto largas con comodidad.
- GPU NVIDIA/AMD: no soportadas por este formato; MLX no es un runtime CUDA. Para CUDA habría que recurrir a los pesos originales en MXFP4 o a una conversión GGUF.
- Opciones de despliegue: oMLX (https://github.com/jundot/omlx), según las instrucciones del autor; el ecosistema `mlx-lm`; las variantes hermanas del mismo autor se han usado en LM Studio.
- Latencia y throughput: no disponibles. Dependerán del chip concreto (M3, M3 Pro/Max, M4 family), del ancho de banda de memoria y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / esquema | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dicksondickson/gpt-oss-20b-oQ8e-bf16-MLX` (este) | ~20,9 B totales / ~4 B activos | No disponible en el repo (128 000 tokens segun OpenAI) | MLX safetensors, 8 bits con tensores clave en bf16 | MIT en el repo; base Apache 2.0 | Hugging Face, 296 descargas |
| `dicksondickson/gpt-oss-20b-oQ6e-bf16-MLX` | ~20,9 B totales / ~4 B activos | No disponible | MLX safetensors, 6 bits; ~17,4 GB de pesos | MIT en el repo | Hugging Face |
| `dicksondickson/gpt-oss-20b-oQ5e-bf16-MLX` | ~20,9 B totales / ~4 B activos | No disponible | MLX safetensors, 5 bits | MIT en el repo | Hugging Face |
| `openai/gpt-oss-20b` (original) | ~20 B totales / ~4 B activos | 128 000 tokens segun la model card de OpenAI | Safetensors, BF16 con proyecciones MoE en MXFP4 | Apache 2.0 + politica de uso gpt-oss | Hugging Face, ampliamente distribuido |

La comparación relevante es interna a la familia de cuantizaciones del mismo autor: oQ8e prioriza fidelidad a costa de ~21 GB de pesos, mientras que oQ6e reduce el espacio a unos 17,4 GB y oQ5e baja aún más el requisito de memoria. No se han proporcionado datos de calidad comparada entre estas variantes.

## Limitaciones y advertencias

- La cuantización de 8 bits con preserve de tensores en bf16 puede introducir degradaciones respecto al modelo original en MXFP4/BF16; no hay evaluaciones publicadas que cuantifiquen esa pérdida.
- El repositorio no documenta sesgos, comportamiento multilingüe ni tasas de alucinación; esas advertencias deben tomarse de la model card de `openai/gpt-oss-20b`.
- Requiere hardware Apple M3 o posterior según el autor; no es utilizable en GPUs NVIDIA o AMD sin reconversión.
- El tamaño del repo (44,5 GB) es notablemente superior al de los pesos en 8 bits, lo que puede complicar el almacenamiento y la descarga en equipos con disco limitado.
- El autor ha recuantizado el modelo (18 de octubre de 2026) y recomienda volver a descargar; versiones anteriores pueden diferir en calidad sin aviso en el nombre del repositorio.
- Licencia: el repositorio declara MIT, pero el modelo base es Apache 2.0 con la política de uso gpt-oss de OpenAI. Conviene verificar ambas antes de un uso comercial, especialmente en lo relativo a la atribución y a los casos de uso restringidos.
- El modelo tiene un único like y 296 descargas, con lo que la validación comunitaria es muy limitada; no debe asumirse estabilidad de producción.
- No hay información sobre idiomas soportados ni sobre calidad en castellano; el comportamiento en español debe evaluarse empíricamente antes de desplegarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dicksondickson/gpt-oss-20b-oQ8e-bf16-MLX
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Herramienta oMLX: https://github.com/jundot/omlx
- Variante oQ6e: https://huggingface.co/dicksondickson/gpt-oss-20b-oQ6e-bf16-MLX
- Variante oQ5e: https://huggingface.co/dicksondickson/gpt-oss-20b-oQ5e-bf16-MLX
- Model card de OpenAI para gpt-oss: https://openai.com/index/gpt-oss-model-card/
- Documentación de la API de OpenAI para gpt-oss-20b: https://developers.openai.com/api/docs/models/gpt-oss-20b
- Ficha en NVIDIA NIM: https://build.nvidia.com/openai/gpt-oss-20b/modelcard
