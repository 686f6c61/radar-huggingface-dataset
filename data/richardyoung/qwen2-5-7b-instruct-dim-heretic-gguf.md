# richardyoung/Qwen2.5-7B-Instruct-DiM-heretic-GGUF

## Resumen

Qwen2.5-7B-Instruct-DiM-heretic-GGUF es la distribucion en formato GGUF de un modelo derivado de Qwen/Qwen2.5-7B-Instruct al que se le ha aplicado una ablacion de la direccion de rechazo mediante la tecnica difference-in-means (DiM) con la herramienta Heretic 2.0. El autor de la adaptacion y de estas cuantizaciones es richardyoung. El resultado es un modelo "abliterated": conserva la mayor parte del comportamiento del original, pero responde a muchas peticiones que el modelo base rechazaria. Se publica como material de investigacion sobre eliminacion de rechazos y su evaluacion, no como asistente de proposito general.

El modelo parte de la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con 7.615.616.512 parametros totales (segun los safetensors del modelo base) y una ventana de contexto de 32.768 tokens en el modelo original. Esta publicacion concreta solo incluye pesos cuantizados en GGUF para llama.cpp y Ollama, con variantes Q4_K_M (4,7 GB) y Q8_0 (8,1 GB), ademas de una importance matrix de 9 MB para cuantizaciones con imatrix. El repositorio ocupa 12,8 GB.

Su relevancia es doble. Por un lado, facilita el estudio reproducible de la ablacion de rechazos en un modelo abierto muy extendido y de tamano manejable. Por otro, sirve como caso de prueba para medir hasta que punto las cuantizaciones de 4 y 8 bits preservan o alteran el comportamiento de rechazo medido en el modelo de precision completa. El autor advierte explicitamente de que los ficheros cuantizados no fueron evaluados en el articulo de referencia y de que la cuantizacion puede modificar la conducta de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) con ablacion de direccion de rechazo por difference-in-means (Heretic 2.0) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada para esta publicacion (el modelo base Qwen2.5-7B-Instruct declara 32.768 tokens) |
| Tipos de cuantizacion | Q4_K_M (4,7 GB, por defecto), Q8_0 (8,1 GB, casi sin perdida); anunciadas IQ3_M, IQ4_XS, Q5_K_M, Q6_K; importance matrix (imatrix) de 9 MB |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | apache-2.0 (con las mismas restricciones de uso que el modelo fuente) |
| Formato de pesos | GGUF (llama.cpp); el modelo base se publica en safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con 7.615.616.512 parametros, sin mezcla de expertos. Sobre esos pesos no se realiza un reentrenamiento ni un ajuste fino supervisado adicional en esta publicacion: lo que se aplica es una intervencion en el espacio de activaciones. Heretic 2.0 calcula una direccion de rechazo mediante difference-in-means (DiM), es decir, la diferencia entre las medias de activaciones en prompts que provocan rechazo y en prompts que no lo provocan, y la resta de los pesos del modelo. La busqueda de Heretic selecciona la variante con menos rechazos por palabra clave en el conjunto de desarrollo, sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1, sobre una busqueda de 100 ensayos.

Los datos de entrenamiento del modelo base Qwen2.5-7B-Instruct (composicion del corpus, numero de tokens, fases de RLHF/DPO) no se detallan en la informacion proporcionada. Respecto a la intervencion, la model card reporta para el modelo de precision completa (bf16) una reduccion del rechazo del 72,1 % al 20,6 % (200 de 972) sobre 972 prompts daninos reservados, evaluados con el juez WildGuard, y 55 rechazos por palabra clave sobre los 100 prompts de ajuste en el ensayo seleccionado, con una divergencia KL de primer token de 0,078 respecto al original. Los ficheros GGUF se generaron con llama.cpp (commit 468fde9): conversion con convert_hf_to_gguf.py --outtype bf16 y posterior llama-quantize en CPU, verificando cada peso del safetensors publicado contra su SHA-256. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan la importance matrix (calibration_datav3, 128 fragmentos de 512 tokens, calculada sobre la build Q8_0); Q6_K y Q8_0 son estaticas. Cada fichero Q4_K_M se cargo y respondio a un prompt de prueba antes de subirse.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento, matematicas y generacion de codigo, en la medida en que los conserva el modelo base tras la ablacion.
- Respuesta a un subconjunto amplio de peticiones que el modelo original rechaza: el rechazo medido baja del 72,1 % al 20,6 % en el conjunto de evaluacion del articulo (modelo bf16).
- Soporte de tool calling / function calling: no confirmado en la informacion proporcionada para esta variante; el modelo base Qwen2.5-Instruct lo soporta, pero la ablacion y la cuantizacion pueden afectarlo.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: la model card solo declara ingles (en); no hay datos de rendimiento en otros idiomas.
- Modo thinking, vision o audio: no disponible; el modelo es solo de texto.

## Casos de uso

- Investigacion sobre ablacion de rechazos: usar el modelo como sujeto de experimentos para medir como varia la tasa de rechazo segun la capa o direccion ablacionada, comparando con el modelo original de Qwen2.5-7B-Instruct como control.
- Evaluacion del efecto de la cuantizacion: comparar la tasa de rechazo de Q4_K_M y Q8_0 frente al bf16 del modelo base para determinar si la cuantizacion preserva, atenua o amplifica la eliminacion del rechazo, un punto que el autor deja explicitamente abierto.
- Desarrollo de defensas y clasificadores: generar respuestas que el modelo original rechazaria para entrenar o validar filtros de seguridad, jueces automaticos o clasificadores de contenido danino.
- Analisis de robustez de jueces automaticos: emplear las respuestas del modelo como conjunto de prueba para medir la sensibilidad de jueces tipo WildGuard ante texto que evita el rechazo sin ser necesariamente danino.
- Despliegue local en hardware de consumo para experimentacion: la variante Q4_K_M (4,7 GB) cabe en GPUs consumer de 8 GB o mas y permite ejecutar los experimentos con Ollama o llama.cpp sin infraestructura dedicada.
- Estudio de la divergencia respecto al original: usar la KL de primer token reportada (0,078) como referencia para analizar cuanto se desvia la distribucion de salida del modelo ablacionado en tareas benignas, con aplicaciones en interpretabilidad.
- Reproducibilidad de pipelines de cuantizacion: servir como ejemplo documentado de conversion safetensors a GGUF con verificacion SHA-256 e imatrix, util para equipos que construyan sus propias cuantizaciones.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al modelo de precision completa (bf16) y a la medicion de rechazo, no a benchmarks de capacidad (MMLU, HumanEval, GSM8K).

| Metrica | Original | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos reservados (juez WildGuard) | 72,1 % | 20,6 % (200/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 55 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | 0 (referencia) | 0,078 |

No se han publicado resultados de benchmarks de capacidad ni de los ficheros GGUF en la informacion disponible. El autor indica que los ficheros cuantizados no fueron evaluados en el articulo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para Q4_K_M (fichero de 4,7 GB mas overhead de contexto y cache KV) y 9-10 GB para Q8_0 (fichero de 8,1 GB mas overhead).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para Q4_K_M (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) y 12 GB o mas para Q8_0 (RTX 4070 Ti, RTX 4080, RTX 4090). Para A100 o H100 no hay ventaja practica por el tamano del modelo, salvo para ejecutar muchas instancias en paralelo.
- Cabe en GPU consumer: si, en Q4_K_M desde 8 GB de VRAM y en Q8_0 desde 12 GB; tambien puede ejecutarse en CPU con llama.cpp, con latencias mayores.
- Opciones de despliegue: llama.cpp (llama-cli con -hf), Ollama (ollama run richardyoung/qwen2.5-7b-instruct-dim-heretic o la etiqueta :Q8_0), y cualquier runtime compatible con GGUF. No se mencionan vLLM ni TGI en la informacion proporcionada; estos requieren normalmente safetensors, no GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dependen del hardware, del backend y de la longitud de contexto; no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo medido | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-DiM-heretic-GGUF (este) | 7,62 B | no disponible (base: 32.768) | 20,6 % en 972 prompts (bf16) | apache-2.0 | GGUF (Q4_K_M, Q8_0) |
| Qwen/Qwen2.5-7B-Instruct (original) | 7,62 B | 32.768 | 72,1 % en los mismos 972 prompts | apache-2.0 | safetensors, GGUF de terceros |
| richardyoung/Qwen2.5-7B-Instruct-DiM-heretic (modelo fuente) | 7,62 B | no disponible | 20,6 % (bf16, mismas cifras del articulo) | apache-2.0 | safetensors |

No se dispone en la informacion proporcionada de datos de otros modelos abliterated comparables (por ejemplo, variantes de la misma familia con otras tecnicas) ni de benchmarks de capacidad que permitan una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- Modelo de investigacion, no un asistente de proposito general: el autor lo publica para estudiar la eliminacion de rechazos y sus defensas, no para uso en produccion como chatbot.
- La ablacion elimina buena parte del rechazo, pero no todo: en el modelo bf16 persiste un 20,6 % de rechazo en el conjunto de evaluacion; el comportamiento puede ser erratico y dependiente del prompt.
- Los ficheros GGUF no fueron evaluados en el articulo: la cuantizacion puede alterar la conducta de rechazo respecto al bf16, y el autor lo advierte explicitamente.
- Riesgo de alucinacion: no hay datos especificos para esta variante; el modelo base Qwen2.5-7B-Instruct presenta alucinaciones y la ablacion no las corrige. La intervencion en pesos puede degradar capacidades benignas, como sugiere la KL de 0,078.
- Idiomas: solo se declara ingles; no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Contexto: la longitud de contexto no se especifica para esta publicacion; conviene verificar la configuracion del modelo base antes de asumir 32.768 tokens.
- Licencia: apache-2.0, con las mismas restricciones de uso que el modelo fuente; el usuario es responsable del uso legal. La licencia permisiva no exime de las obligaciones legales sobre el contenido generado.
- Sesgos: no se documentan sesgos especificos de esta variante; hereda los del modelo base, no evaluados en la informacion proporcionada.
- Uso dual: la capacidad de responder a peticiones que el original rechaza puede facilitar contenido danino; conviene desplegarlo en entornos controlados y con filtros externos si se expone a usuarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-DiM-heretic-GGUF
- Modelo fuente (safetensors): https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-DiM-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Articulo de referencia (enlace arXiv pendiente de publicacion segun la model card): no disponible
- Repositorio de llama.cpp: no enlazado en la model card; commit de conversion citado: 468fde9
