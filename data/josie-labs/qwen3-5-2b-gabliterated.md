# josie-labs/Qwen3.5-2B-gabliterated

## Resumen
Qwen3.5-2B-gabliterated es una variante del modelo Qwen/Qwen3.5-2B de Alibaba Qwen, publicada por josie-labs (la model card cita como autor del metodo a Gökdeniz Gülmez). Se trata de un modelo vision-language de tipo image-text-to-text al que se le ha reducido el comportamiento de rechazo mediante Gabliteration, una tecnica de edicion directa de pesos que no requiere fine-tuning. El resultado conserva intactos el encoder de vision y la cabeza MTP: solo se modifican 30 matrices de pesos en 15 de las 24 capas.

El modelo resuelve el problema de los rechazos excesivos en modelos alineados, manteniendo la arquitectura y capacidades originales. Con 2.274.069.824 parametros totales (1.88B en el modelo de lenguaje) y una ventana de contexto de 262.144 tokens, es un modelo pequeno pero de contexto muy largo, adecuado para despliegue en hardware modesto.

Su relevancia actual radica en que demuestra que la modificacion selectiva de pesos puede alterar el comportamiento de rechazo con una deriva minima en la distribucion de salida (KL de primer token de 0.0319 sobre prompts inocuos), sin degradar la estructura del modelo base. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 18 capas Gated DeltaNet + 6 capas de atencion completa con compuerta |
| Parametros totales | 2.274.069.824 (2.27B); 1.88B en el modelo de lenguaje |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; se menciona uso en bf16 y soporte MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); compatible con MLX |

Otros datos tecnicos: 24 capas, hidden size 2.048, MLP size 6.144, 8 cabezas de atencion (2 KV), vocabulario de 248.320 tokens con embeddings atados, encoder de vision de 24 capas con hidden 1.024 (sin modificar).

## Arquitectura y entrenamiento
El modelo base Qwen3.5-2B emplea una arquitectura hibrida que combina 18 capas Gated DeltaNet (un tipo de atencion lineal con estado recurrente) con 6 capas de atencion completa con compuerta, lo que permite manejar contextos de 262.144 tokens con un coste computacional contenido. Incluye un encoder de vision de 24 capas y una cabeza MTP (multi-token prediction). Los detalles de entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

La modificacion Gabliteration (Gülmez, arXiv:2512.18901) opera directamente sobre los pesos, sin fine-tuning. El procedimiento extrae estados residuales del ultimo token de prompts daninos (mlabonne/harmful_behaviors) e inocuos (mlabonne/harmless_alpaca), calcula una puntuacion de separabilidad por capa y, en la capa mas separable (la 21, con separabilidad 16.73), construye un subespacio de rechazo R a partir de los k=1 vectores singulares derechos principales de las diferencias danino-menos-inocuo. Despues elimina una proyeccion ridge (lambda 0.05) escalada por un alpha adaptativo por posicion (de 0.60 a 0.90) de todas las proyecciones que escriben en el flujo residual de las capas 7 a 21: linear_attn.out_proj, self_attn.o_proj y mlp.down_proj.

## Capacidades
- Generacion de texto conversacional en ingles.
- Comprension de imagenes y texto (image-text-to-text) mediante el encoder de vision intacto.
- Razonamiento multi-turno con contexto muy largo (hasta 262.144 tokens).
- Capacidades de modelo de lenguaje propias del base Qwen3.5-2B (codigo y matematicas segun el modelo original, no verificadas en este checkpoint).
- Comportamiento de rechazo reducido: responde a peticiones que el modelo original declinaba.
- Compatible con la API de transformers (AutoModelForImageTextToText) y con MLX en Apple Silicon.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Modo thinking: la evaluacion se realizo con thinking desactivado; no se detalla su comportamiento con thinking activo.

## Casos de uso
- Investigacion sobre alineacion y seguridad: permite estudiar como la edicion de pesos afecta al comportamiento de rechazo, comparando las tasas del modelo original (98%) y del modificado (11% por palabras clave) sobre el mismo conjunto de prompts.
- Analisis de robustez de filtros: util para evaluar clasificadores de contenido y sistemas de moderacion, ya que genera respuestas que evaden las frases de rechazo habituales.
- Prototipado de asistentes multimodales: al conservar el encoder de vision y el contexto de 262.144 tokens, sirve para experimentar con descripcion de imagenes y conversaciones largas en hardware de consumo.
- Despliegue en Apple Silicon: el soporte MLX y el tamano de 2.27B permiten ejecutarlo localmente en un Mac con GPU integrada para pruebas de concepto.
- Generacion de texto sin restricciones de estilo: util en entornos controlados donde se necesita que el modelo no anada advertencias ni derivaciones a tareas alternativas.
- Investigacion academica sobre tecnicas de edicion de pesos: la configuracion completa (gabliteration.json, seed 0, objetivo de rechazo del 10%) permite reproducir el experimento en 6 minutos y 43 segundos en un Apple M4.
- Evaluacion comparativa de modelos pequenos con contexto largo: como referencia de hasta donde llega un modelo de 2B con atencion hibrida en tareas de contexto extenso.

## Benchmarks y rendimiento
Los unicos datos publicados en la informacion disponible son las metricas de rechazo y deriva del propio proceso de Gabliteration, no benchmarks estandar de capacidad.

| Metrica | Qwen3.5-2B | Qwen3.5-2B-gabliterated |
|---|---:|---:|
| Tasa de rechazo (palabras clave), 100 prompts daninos reservados | 98% | 11% |
| KL de primer token frente al original, 100 prompts inocuos | 0 | 0.0319 |
| Tasa de rechazo juzgada por Qwen/Qwen3.5-9B (mismas completaciones, pesos bf16) | 98% | 79% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Con 2.27B parametros, en bf16 el peso ocupa aproximadamente 4.6 GB (tamano del repo); en cuantizaciones de 8 bits o 4 bits se reduce sustancialmente, aunque no se documentan cuantizaciones especificas.
- GPU recomendadas: no especificadas. Por tamano, cabe en GPUs de consumo con 8 GB o mas de VRAM en bf16, y en GPUs profesionales (A100, H100) para mayor throughput.
- Cabe en consumer GPU: si, por el tamano del modelo (2.27B), aunque el contexto de 262.144 tokens incrementa el uso de memoria KV durante la inferencia.
- Opciones de despliegue: transformers (AutoModelForImageTextToText con dtype auto y device_map auto), MLX en Apple Silicon (mlx_vlm.generate para vision-lenguaje, mlx_lm.generate para solo texto). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La reproduccion del proceso de edicion se completo en 6 minutos y 43 segundos en un Apple M4 (10 nucleos de GPU, 32 GB), pero no se aportan cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---:|---:|---|---|
| Qwen3.5-2B-gabliterated | 2.27B | 262.144 | Apache 2.0 | Rechazo reducido; vision intacta |
| Qwen/Qwen3.5-2B | 2.27B | 262.144 | Apache 2.0 | Modelo base; tasa de rechazo del 98% |
| Qwen/Qwen3.5-9B | no disponible | no disponible | no disponible | Usado como juez en la evaluacion del autor |

No se dispone de datos de rendimiento comparativo en benchmarks estandar entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- La deteccion de rechazos se basa en coincidencia de palabras clave sobre completaciones greedy de 48 tokens con thinking desactivado; es aproximada, no detecta rechazos suaves y puede marcar respuestas que citan frases de rechazo.
- Segun el juez Qwen3.5-9B, el modelo sigue declinando la mayoria de los prompts daninos de prueba (79%), por lo que la reduccion de rechazo es parcial segun esa medida.
- La metrica KL mide solo la deriva en el primer token de la respuesta, no la capacidad general; no se han ejecutado benchmarks estandar sobre este checkpoint.
- Al reducir los rechazos, el modelo cumplira peticiones que el original declinaba; la responsabilidad de uso y despliegue recae en el usuario.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta documentado.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado para este checkpoint; heredado del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero debe tenerse en cuenta la naturaleza del modelo (sin censura) y las obligaciones de atribucion.

## Enlaces
- Hugging Face: https://huggingface.co/josie-labs/Qwen3.5-2B-gabliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper de Gabliteration: https://arxiv.org/abs/2512.18901
- Repositorio citado en la model card (autor del metodo): https://huggingface.co/Goekdeniz-Guelmez/Qwen3.5-2B-gabliterated
- Dataset de prompts daninos: mlabonne/harmful_behaviors (no se proporciona URL directa)
- Dataset de prompts inocuos: mlabonne/harmless_alpaca (no se proporciona URL directa)
