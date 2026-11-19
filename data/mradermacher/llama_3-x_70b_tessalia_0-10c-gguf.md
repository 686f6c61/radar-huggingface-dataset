# mradermacher/Llama_3.x_70b_Tessalia_0.10c-GGUF

## Resumen

Llama_3.x_70b_Tessalia_0.10c-GGUF es la version cuantizada en formato GGUF del modelo fusionado NexesMess/Llama_3.x_70b_Tessalia_0.10c, un merge de modelos basados en la familia Llama 3.x de 70.000 millones de parametros. La cuantizacion ha sido realizada por mradermacher, un publicador habitual de cuantizaciones GGUF en Hugging Face, mediante la herramienta mergekit para el proceso de fusion y el pipeline de conversion a GGUF para los pesos finales.

El modelo resuelve el problema de desplegar un modelo de 70B en hardware con recursos limitados: ofrece desde cuantizaciones Q2_K de 26,5 GB hasta Q8_0 de 75,1 GB, lo que permite ejecutarlo en configuraciones que van desde una sola GPU consumer de gama alta con mucha VRAM hasta servidores multi-GPU. El modelo base es un merge, es decir, una combinacion de pesos de otros modelos, lo que en la practica busca combinar capacidades de distintos fine-tunes sin reentrenar desde cero.

La relevancia de esta ficha es limitada pero concreta: se trata de una publicacion de bajisima traccion (2 descargas, 0 likes en el momento de la consulta) y con metadatos incompletos (sin licencia declarada, sin pipeline, sin datos de entrenamiento del merge original). Es util como referencia tecnica de las cuantizaciones disponibles y de los requisitos de hardware, pero no debe tratarse como un modelo con validacion comunitaria ni benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.x, segun el nombre del modelo base); detalles del merge no disponibles |
| Parametros totales | 70.553.837.632 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base esta en formato Hugging Face (safetensors) |

## Arquitectura y entrenamiento

El modelo base NexesMess/Llama_3.x_70b_Tessalia_0.10c es un merge creado con mergekit, segun las etiquetas del repositorio. Esto implica que sus pesos proceden de la combinacion de dos o mas modelos derivados de Llama 3.x de 70B, no de un entrenamiento desde cero. La model card no detalla la receta de fusion (metodo de merge, modelos de origen, proporciones de interpolacion ni capas afectadas), por lo que no es posible reconstruir como se obtuvo el modelo ni que capacidades se pretendian potenciar con la fusion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo fases de RLHF, DPO o ajuste supervisado adicionales sobre el merge. Tampoco se documentan innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). La cuantizacion realizada por mradermacher es estatica (no imatrix en este repositorio; las versiones ponderadas por imatrix se publican en un repositorio separado, Llama_3.x_70b_Tessalia_0.10c-i1-GGUF), con conversion desde formato Hugging Face a GGUF.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el idioma declarado (`en`).
- Razonamiento general y respuesta a instrucciones, heredado del modelo base Llama 3.x de 70B y del merge.
- Capacidades de codigo y matematicas: no documentadas explicitamente en la informacion disponible; se asumen las del modelo base, sin verificacion.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se declaran otros idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Despliegue local de un modelo de 70B en una estacion de trabajo con una o dos GPU de gran VRAM: usando Q4_K_M (42,6 GB) se puede ejecutar en una RTX 6000 Ada o en dos RTX 4090, con llama.cpp u Ollama, para tareas de generacion de texto en ingles sin depender de la nube.
- Prototipado de asistentes conversacionales en ingles: el modelo esta etiquetado como conversacional y puede gestionar dialogos multi-turno, aunque la longitud de contexto no esta documentada y debe validarse empiricamente antes de usarlo en produccion.
- Evaluacion comparativa de merges: util para investigadores que quieran medir si la fusion Tessalia 0.10c aporta mejoras frente a Llama 3.x 70B base en tareas concretas, usando las distintas cuantizaciones para ajustar el coste computacional del experimento.
- Generacion de texto por lotes en servidores con CPU y RAM abundante: las cuantizaciones Q2_K (26,5 GB) y Q3_K_S (31,0 GB) permiten inferencia en CPU con llama.cpp, adecuado para tareas de baja frecuencia y no criticas en latencia.
- Fine-tuning ligero o experimentacion con LoRA sobre el modelo base en formato Hugging Face: aunque este repositorio solo contiene GGUF, el modelo base NexesMess/Llama_3.x_70b_Tessalia_0.10c puede servir como punto de partida para adaptaciones, siempre que se aclare la licencia antes de usarlo.
- Educacion y divulgacion tecnica: sirve como ejemplo practico de pipeline mergekit + cuantizacion GGUF para explicar como se publican y eligen cuantizaciones en funcion del hardware disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto ni KV cache):
  - Q2_K: 26,5 GB
  - Q3_K_S: 31,0 GB
  - Q3_K_M: 34,4 GB
  - Q3_K_L: 37,2 GB
  - IQ4_XS: 38,4 GB
  - Q4_K_S: 40,4 GB
  - Q4_K_M: 42,6 GB
  - Q5_K_S: 48,8 GB
  - Q5_K_M: 50,0 GB
  - Q6_K: 58,0 GB
  - Q8_0: 75,1 GB
- GPU recomendadas: A100 80 GB o H100 80 GB para Q8_0 y Q6_K; dos RTX 4090 (24 GB cada una) o una RTX 6000 Ada (48 GB) para Q4_K_M y Q5_K_M; una sola RTX 4090 no es suficiente para ninguna cuantizacion de este modelo sin offloading a RAM.
- Cabe en GPU consumer: solo con offloading parcial a RAM del sistema o en configuraciones multi-GPU. Una RTX 4090 de 24 GB no puede alojar ni siquiera Q2_K completa.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). vLLM y TGI no soportan GGUF de forma nativa en el momento de la publicacion; para esos motores habria que usar el modelo base en safetensors. Los archivos Q6_K y Q8_0 estan divididos en dos partes que deben concatenarse antes de usarse.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, de la cuantizacion y del backend; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama_3.x_70b_Tessalia_0.10c-GGUF (este) | 70,55B | no disponible | no disponible | GGUF | Merge cuantizado, 2 descargas, sin benchmarks |
| NexesMess/Llama_3.x_70b_Tessalia_0.10c | 70,55B | no disponible | no disponible | safetensors (Hugging Face) | Modelo base del que se derivan estas cuantizaciones |
| Meta Llama 3.1 70B Instruct | 70,6B | 128K tokens (segun documentacion de Meta) | Llama 3.1 Community License | safetensors, GGUF (via terceros) | Modelo original con benchmarks publicos y amplia validacion |
| mradermacher/Llama_3.x_70b_Tessalia_0.10c-i1-GGUF | 70,55B | no disponible | no disponible | GGUF (imatrix) | Variante con cuantizaciones ponderadas por imatrix, misma base |

La comparativa con Llama 3.1 70B Instruct se incluye como referencia de la familia, pero no se dispone de datos que permitan afirmar que el merge Tessalia iguale o supere al modelo original en ninguna tarea.

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si el uso comercial esta permitido. Antes de cualquier uso en produccion debe aclararse la licencia tanto de este repositorio como del modelo base NexesMess/Llama_3.x_70b_Tessalia_0.10c y, en ultima instancia, de los modelos Llama 3.x subyacentes.
- Modelo merge sin documentacion de la receta: se desconoce que modelos se fusionaron y con que metodo, lo que impide auditar su comportamiento o reproducir el resultado.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni otras tareas; no debe asumirse que iguala a Llama 3.x 70B original.
- Traccion minima: 2 descargas y 0 likes en el momento de la consulta; sin validacion de la comunidad ni issues reportados.
- Solo ingles declarado: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Longitud de contexto no documentada: no debe asumirse la ventana de 128K de Llama 3.1; hay que verificarla empiricamente.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta familia; no hay evaluaciones especificas para este merge.
- Sesgos: no documentados para este merge; se heredan los de los modelos de origen, no auditados aqui.
- Las cuantizaciones Q2_K y Q3_K_S degradan la calidad de forma notable; para uso serio se recomienda Q4_K_M o superior.
- Los archivos Q6_K y Q8_0 estan partidos en dos; requieren concatenacion previa y espacio en disco de 58 GB y 75 GB respectivamente.
- Fecha de actualizacion del repositorio (2026-11-19) posterior a la de creacion (2025-03-14): conviene revisar si los archivos han cambiado respecto a la version original antes de fijar una version en produccion.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/Llama_3.x_70b_Tessalia_0.10c-GGUF
- Modelo base: https://huggingface.co/NexesMess/Llama_3.x_70b_Tessalia_0.10c
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Llama_3.x_70b_Tessalia_0.10c-i1-GGUF
- Pagina de descarga del autor: https://hf.tst.eu/model#Llama_3.x_70b_Tessalia_0.10c-GGUF
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
