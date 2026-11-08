# ruthless1984/Qwen3.8-Flash-Next-GSQ-RCO-GGUF

## Resumen

Qwen3.8-Flash-Next-GSQ-RCO-GGUF es una familia de cuantizaciones GGUF no uniformes del modelo multimodal Qwen3.8-Flash-Next, un transformer de mezcla de expertos (MoE) disperso con 512 expertos enrutados por capa y 48 capas, del que se activan 10 expertos por token. El trabajo lo publica el autor ruthless1984, que replica la receta GSQ-RCO desarrollada por el Deep Algorithms and Systems Lab (DASLab) del Institute of Science and Technology Austria, y distribuye los pesos bajo licencia Apache 2.0. El modelo base lo desarrolla Qwen y suma 176.943.899.520 parametros totales segun los safetensors del repositorio.

El problema que resuelve es el de servir un MoE de gran tamano en hardware modesto sin recurrir a una cuantizacion uniforme que penalice por igual tensores sensibles e insensibles. En lugar de aplicar un unico tipo de cuantizacion a todos los pesos, cada tensor recibe su propio tipo, asignado mediante una busqueda basada en gradientes que reparte precision segun la sensibilidad de cada tensor y sujeta el resultado a un presupuesto de tamano total. Los ficheros resultantes son GGUF estandar y se ejecutan sin modificaciones en llama.cpp, Ollama y LM Studio.

La relevancia actual es doble: por un lado, demuestra que la cuantizacion escalar de 2 a 3 bits puede acercarse a la cuantizacion vectorial manteniendo el formato desplegable; por otro, conserva el proyector de vision en BF16 (`mmproj`) para uso multimodal imagen-texto. El repositorio ocupa 208,4 GB e incluye cuatro variantes de cuantizacion mas el proyector, con tamanos que van de 66,4 GB a 83,6 GB por modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso, 48 capas, 512 expertos enrutados por capa (10 activos por token), con codificador de vision y proyector multimodal |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible (el numero de expertos activos es 10 de 512, pero no se publica el recuento exacto de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_0 (2,40 bpw), IQ2_XS (2,50 bpw), IQ3_XXS (3,00 bpw), IQ3_S (3,50 bpw); tabla de n-gram embebida fija en IQ4_NL (4,5 bpw); `mmproj` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos shards por variante cuantizada mas un `mmproj` BF16) |

## Arquitectura y entrenamiento

El modelo base es un MoE disperso con 512 expertos enrutados por capa a lo largo de 48 capas, de los cuales se activan 10 por token. Las matrices de los expertos dominan el recuento de parametros y, por tanto, el presupuesto de cuantizacion: el 95 % de los pesos sujetos a busqueda vive en los expertos. El modelo incorpora ademas un codificador de vision con proyector, lo que lo habilita para la tarea imagen-texto. Una particularidad estructural es la tabla de embeddings n-gram por capa (`per_layer_token_embd`, 51,2B parametros), que es una tabla de consulta y no un peso de matmul, por lo que se mantiene a 4,5 bpw fijos en todas las variantes y queda excluida de la busqueda.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del dataset, si hubo RLHF o DPO). Lo que si se documenta es el proceso de cuantizacion, que combina dos tecnicas de DASLab. GSQ (Gumbel-Softmax Quantization) es una cuantizacion escalar post-entrenamiento que aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajacion Gumbel-Softmax, cerrando buena parte de la brecha entre cuantizacion escalar y vectorial a 2-3 bits. RCO (Riemannian Constrained Optimization) asigna uno de K tipos de cuantizacion a cada uno de los N tensores bajo un presupuesto de tamano total, reformulando la restriccion como una variedad riemanniana suave en el espacio de logits, lo que permite optimizar directamente sobre la perdida de tarea y forzar el presupuesto de forma exacta sin hiperparametros especificos de la restriccion. La asignacion se hace por capa, no por experto, porque GGUF no puede expresar esa granularidad.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Comprension de imagenes y texto combinados (pipeline `image-text-to-text`), gracias al proyector de vision `mmproj` en BF16.
- Razonamiento y resolucion de tareas de matemáticas y conocimiento general, segun las evaluaciones citadas (AIME25) en la model card.
- Capacidades de mezcla de expertos con enrutamiento disperso: 10 de 512 expertos activos por token, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano.
- Compatibilidad con endpoints estandar (etiqueta `endpoints_compatible`) y con el ecosistema llama.cpp, Ollama y LM Studio.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el repositorio no declara idiomas.

## Casos de uso

- Despliegue local de un MoE multimodal en estaciones de trabajo: la variante IQ3_S (83,6 GB) permite ejecutar un modelo de 176,9B parametros totales en una maquina con suficiente memoria unificada o multi-GPU, manteniendo el proyector de vision para consultas sobre imagenes.
- Asistencia sobre documentos escaneados y capturas: el `mmproj` BF16 permite pasar imagenes junto al prompt y obtener descripciones, extraccion de datos o respuestas contextualizadas sin depender de un servicio externo.
- Servicio de chat de baja latencia en CPU o GPU modestas: la variante Q2_0 (66,4 GB, 2,40 bpw) esta disenada para velocidad, con 3,4 veces el throughput de prompt y 1,9 veces menos latencia extremo a extremo que IQ2_XS, lo que la hace adecuada para prototipos y demos interactivas.
- Evaluacion comparativa de tecnicas de cuantizacion: al ofrecer cuatro niveles de bpw con la misma receta GSQ-RCO, sirve para medir el impacto de la precision en tareas concretas antes de fijar una variante en produccion.
- Investigacion sobre cuantizacion no uniforme: los ficheros permiten reproducir y auditar la asignacion por tensor de RCO y el comportamiento de GSQ a 2-3 bits en un MoE de 512 expertos.
- Fine-tuning y experimentacion con modelos derivados: la licencia Apache 2.0 y el formato GGUF facilitan generar variantes (por ejemplo, versiones sin rechazo, como la abliterated publicada por otro autor) y compararlas con el original.
- Razonamiento matematico asistido: la variante IQ3_XXS iguala al modelo base en AIME25 segun la model card, lo que la hace util para pipelines de resolucion de problemas donde el tamano importa.

## Benchmarks y rendimiento

La model card no presenta una tabla numerica de MMLU, HumanEval o GSM8K. Solo se ofrecen afirmaciones cualitativas sobre las variantes:

| Variante | bpw | Tamano total | Resultado declarado |
|---|---|---|---|
| Q2_0 | 2,40 | 66,4 GB | 3,4x throughput de prompt y 1,9x menos latencia que IQ2_XS; tasa de decodificacion estable |
| IQ2_XS | 2,50 | 68,0 GB | Menor tamano con calidad equivalente |
| IQ3_XXS | 3,00 | 75,8 GB | Iguala al modelo base en AIME25 |
| IQ3_S | 3,50 | 83,6 GB | Recomendada; iguala o supera al modelo base en todas las tareas |

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: entre 66,4 GB (Q2_0) y 83,6 GB (IQ3_S), mas 0,91 GB del proyector de vision en BF16. La tabla de n-gram (28,8 GB) se incluye en esos totales.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, requiere configuraciones multi-GPU o memoria unificada de al menos 64-96 GB; una unica RTX 4090 (24 GB) no es suficiente ni para la variante mas pequena.
- Cabe en GPU de consumo: no, ninguna variante cabe en una GPU consumer de 24 GB. Requiere varias GPU o hardware con memoria unificada grande.
- Opciones de despliegue: llama.cpp, Ollama y LM Studio (soporte GGUF estandar); compatibilidad con endpoints declarada por el autor. vLLM y TGI no se mencionan para estos ficheros GGUF.
- Latencia y throughput: solo se publica la comparacion relativa de Q2_0 frente a IQ2_XS (3,4x throughput de prompt, 1,9x menos latencia extremo a extremo). No hay valores absolutos de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-GSQ-RCO (este) | 176,9B totales, MoE 512 expertos | no disponible | GGUF 2,40-3,50 bpw + mmproj BF16 | Apache 2.0 | Hugging Face (ruthless1984) |
| Qwen3.8-Flash-Next-GSQ-RCO-Coder | 176,9B totales, 256 de 512 expertos retenidos | no disponible | GGUF a 1,89 bpw efectivos, 58,4 GB | Apache 2.0 | Hugging Face (ISTA-DASLab) |
| Qwen3.8-Flash-Next-GSQ-RCO-abliterated | 176,9B totales | no disponible | GGUF, 144 tensores sustituidos | Apache 2.0 | Hugging Face (gdigsi) |
| Qwen3.8-Flash-Next (base) | 176,9B totales | no disponible | safetensors/BF16 | Apache 2.0 | Hugging Face (Qwen) |

No se dispone de datos de benchmarks comparativos con otras familias de modelos (Llama, DeepSeek, Mistral) en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a 2-3 bits introduce degradacion de calidad no cuantificada numericamente en la model card; solo IQ3_S afirma igualar o superar al base en todas las tareas.
- La asignacion de tipos se hace por capa y no por experto porque GGUF no lo permite; esto limita la granularidad de la busqueda y deja precision sobre la mesa en los expertos.
- La tabla de embeddings n-gram (51,2B parametros) queda fija a 4,5 bpw y excluida de la busqueda, lo que condiciona el presupuesto efectivo.
- No se declaran idiomas soportados ni sesgos conocidos; el riesgo de alucinacion no se documenta y debe asumirse el habitual en modelos generativos de este tamano.
- No hay informacion sobre tool calling, agentes ni modo de razonamiento explicito; no deben asumirse en produccion sin verificacion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y las tecnicas GSQ/RCO tienen sus propias condiciones que conviene revisar en los repositorios originales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el autor no es el laboratorio que desarrollo el metodo; conviene validar la integridad de los ficheros antes de usarlos en produccion.
- Requiere hardware de 64-96 GB de memoria, lo que excluye GPUs de consumo y encarece el despliegue frente a alternativas densas mas pequenas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ruthless1984/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Repositorio de referencia del laboratorio: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Variante Coder: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-Coder-GGUF
- Variante abliterated: https://huggingface.co/gdigsi/Qwen3.8-Flash-Next-GSQ-RCO-abliterated-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Codigo RCO: https://github.com/IST-DASLab/RCO
- Laboratorio DASLab: https://github.com/IST-DASLab
