# CodesBee/DeQARAG

## Resumen

DeQA-RAG question decomposer es un adaptador LoRA publicado por CodesBee que se acopla al modelo base Qwen/Qwen3-4B-Instruct-2507. Su funcion es convertir una pregunta original en un array JSON de preguntas de apoyo que preservan cada una su descripcion identificativa, de modo que puedan recuperarse de forma independiente en un pipeline de RAG. Forma parte del proyecto DeQA-RAG, orientado a tareas de question answering multi-hop en ingles, donde una unica consulta requiere encadenar evidencias de varios documentos.

El adaptador no responde preguntas ni genera referencias cruzadas: solo descompone. La recuperacion y la respuesta final las gestiona el cargador de DeQA-RAG por separado. Esta separacion de responsabilidades lo hace util como componente especializado dentro de sistemas de recuperacion aumentada, en lugar de como modelo generativo de proposito general.

El modelo base es un transformer denso de 4 mil millones de parametros con ventana de contexto nativa de 262 144 tokens (Qwen3), aunque la model card no documenta el contexto efectivo usado durante el entrenamiento del adaptador. El adaptador anade 66 060 288 parametros entrenables sobre las proyecciones de atencion y MLP, con licencia Apache-2.0 y soporte exclusivo de ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-4B-Instruct-2507 |
| Parametros totales | 66 060 288 parametros del adaptador (504 tensores float32); el modelo base suma 4B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base Qwen3-4B-Instruct-2507 soporta 262 144 tokens nativos |
| Tipos de cuantizacion | no disponible para el adaptador (el base admite bfloat16 y cuantizaciones habituales de Qwen3) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (adaptador y modelo base) |
| Formato de pesos | safetensors (adaptador PEFT); el base se carga en bfloat16 por separado |

## Arquitectura y entrenamiento

El adaptador aplica LoRA estandar con rango 32, alpha 64 y dropout 0.05 sobre las proyecciones de atencion y MLP del transformer Qwen3-4B-Instruct-2507. Los pesos base se cargan en bfloat16 con implementacion de atencion SDPA. El adaptador se distribuye como 504 tensores float32 que suman 66 060 288 parametros.

Los datos de entrenamiento combinan ejemplos de BREAK-high, HotpotQA, 2WikiMultiHopQA, MuSiQue y ejemplos sinteticos de cobertura redactados explicitamente por el autor. El autor lidero el diseno, desarrollo y revision de las anotaciones de preguntas de apoyo. Los pesos publicados continuan un LoRA ordinario previo durante 40 actualizaciones adicionales del optimizador, mezclando ejemplos de descomposicion existentes con preguntas de cobertura nativas y ejemplos sinteticos marcados. No se documenta el volumen total de tokens de entrenamiento ni si hubo RLHF o DPO.

La generacion debe ser greedy (`do_sample=False`, `num_beams=1`, `max_new_tokens=1024`, semilla 1729). El cargador de DeQA-RAG fija explicitamente esta configuracion para no heredar los valores de muestreo por defecto del modelo base.

## Capacidades

- Descomposicion de consultas: transforma una pregunta multi-hop en un array JSON de preguntas de apoyo, cada una con su descripcion identificativa para recuperacion independiente.
- Salida estructurada JSON: el resultado es siempre un array de cadenas; se permite un array vacio.
- Abstraccion de la respuesta: el adaptador no genera respuestas ni referencias cruzadas como `#1`, lo que evita filtrar informacion de la respuesta al recuperador.
- Integracion con pipelines RAG: pensado para usarse como primer paso antes de la recuperacion y la respuesta final, que DeQA-RAG gestiona por separado.
- Tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad nativa del adaptador; su funcion es precisamente habilitar el multi-hop a traves de la descomposicion.
- Capacidades multilingues: solo ingles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en el adaptador.

## Casos de uso

- Question answering multi-hop sobre corpus documentales: el adaptador descompone la pregunta original en subpreguntas con descripcion identificativa, que se recuperan de forma independiente y luego se responden con el modelo base o un componente posterior del pipeline.
- Busqueda empresarial sobre bases de conocimiento internas: ante consultas del tipo "quien dirige la empresa que fabrico el componente X", el adaptador genera preguntas de apoyo que permiten recuperar primero la empresa y despues su direccion.
- Asistentes de investigacion bibliografica: para preguntas que cruzan varios articulos, la descomposicion permite recuperar evidencias de cada salto sin perder la identidad de cada entidad.
- Pipelines de RAG en produccion con requisitos de trazabilidad: al devolver JSON estructurado y no respuestas, el adaptador se integra en sistemas donde cada subpregunta debe registrarse y auditarse por separado.
- Evaluacion y benchmarking de recuperadores: el adaptador sirve para generar consultas de apoyo reproducibles (generacion greedy, semilla fija) en experimentos comparativos de recuperacion multi-hop.
- Sistemas de preguntas y respuestas sobre dominios cientificos o tecnicos: la descomposicion ayuda a resolver consultas que requieren encadenar relaciones entre entidades de varios documentos.
- Componente de un agente de busqueda: el array de subpreguntas puede alimentar en paralelo varios recuperadores y agregar los resultados antes de la sintesis final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de tareas de multi-hop QA (EM, F1) para el adaptador.

## Requisitos de hardware

- VRAM estimada: el adaptador en float32 ocupa aproximadamente 0,26 GB (66 M de parametros); el modelo base en bfloat16 requiere alrededor de 8 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 10-12 GB de VRAM para cargar el base en bfloat16 y margen para el contexto; A100, H100 o L40S para despliegues de mayor concurrencia.
- GPU de consumo: cabe en RTX 3090, RTX 4090 y RTX 4080 (16 GB o mas); en GPUs de 8 GB seria necesario cuantizar el base, algo no documentado para este adaptador.
- Opciones de despliegue: el cargador oficial es `deqa.decompose.Decomposer` sobre PEFT y Transformers con SDPA; tambien es posible cargar el adaptador con `PeftModel.from_pretrained` sobre el base. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeQA-RAG question decomposer (este) | 66 M de adaptador sobre base de 4B | no disponible para el adaptador (base 262 144) | Descomposicion de consultas para RAG multi-hop en ingles | Apache-2.0 | Hugging Face (33 descargas) |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | 262 144 | Modelo generativo de proposito general | Apache-2.0 | Hugging Face |
| Alternativas especializadas en descomposicion de consultas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: el adaptador fue desarrollado para experimentos de QA multi-hop en ingles y no se documenta soporte de otros idiomas.
- Calidad de la descomposicion: la model card advierte que las preguntas generadas pueden omitir prerequisitos o alterar el significado de una relacion, lo que degrada la recuperacion posterior.
- Reproducibilidad de la evaluacion: el paquete de evaluacion de DeQA-RAG incluye las preguntas de apoyo originales guardadas para su pool fijo; para reproducir esa evaluacion deben usarse esos ficheros, no la generacion del adaptador.
- Dependencia del modelo base: requiere la revision concreta `cdbee75f17c01a7cc42f958dc650907174af0554` de Qwen3-4B-Instruct-2507; otras revisiones pueden alterar el comportamiento.
- Configuracion estricta de generacion: debe usarse generacion greedy con semilla 1729 y preservar el prompt del sistema `decomposition.txt` incluyendo el salto de linea final; desviarse de ello cambia las salidas.
- Alcance funcional limitado: no responde preguntas, no hace tool calling ni razonamiento multi-paso autonomo; es un componente de un pipeline mayor.
- Sesgos: no se documentan sesgos especificos del adaptador; hereda los del corpus de entrenamiento (BREAK-high, HotpotQA, 2WikiMultiHopQA, MuSiQue y ejemplos sinteticos).
- Uso comercial: permitido bajo Apache-2.0, con las condiciones de la licencia del modelo base.
- Madurez: 33 descargas y 0 likes en el momento de la consulta, lo que indica adopcion muy limitada y poca validacion externa.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/CodesBee/DeQARAG
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/cdbee75f17c01a7cc42f958dc650907174af0554/LICENSE
- Dataset BREAK: no disponible
- Dataset HotpotQA: no disponible
- Dataset 2WikiMultiHopQA: no disponible
- Dataset MuSiQue: no disponible
- Repositorio del proyecto DeQA-RAG: no disponible
