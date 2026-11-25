# gplsi/Llama-3.2-3B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1-ft

## Resumen

El modelo `gplsi/Llama-3.2-3B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1-ft` es un ajuste fino (fine-tuning) del modelo base Llama 3.2 de 3B parametros, publicado por el grupo de investigacion GPLSI. El nombre del repositorio indica que ha sido entrenado para una tarea muy especifica de aprendizaje de ontologias (ontology learning), empleando datos derivados de DBpedia Archivo y una configuracion experimental que combina TDSelect, MatOnto y una seleccion Top10 de candidatos, en una primera epoca (e1) de entrenamiento.

Se trata, por tanto, de un modelo de investigacion orientado a la extraccion y estructuración de conocimiento ontologico a partir de texto, no de un modelo de proposito general. Su relevancia actual es limitada y acotada al ambito academico: el repositorio no registra descargas, cuenta con un unico "like" y la model card publicada es practicamente vacia (solo declara la licencia Apache 2.0), por lo que la mayor parte de las especificaciones tecnicas no estan documentadas por el autor.

La ficha que sigue se ha elaborado a partir de la informacion disponible en Hugging Face y de las caracteristicas conocidas del modelo base Llama 3.2 3B. Cualquier dato no confirmado por el autor se marca explicitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Llama 3.2 3B; no confirmada en la model card) |
| Parametros totales | 3B (aproximado, segun el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base Llama 3.2 3B soporta 128k tokens; no confirmado para este fine-tuning) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF ni otros) |

## Arquitectura y entrenamiento

La model card publicada por el autor no describe la arquitectura ni el proceso de entrenamiento. Por el nombre del repositorio se deduce que se parte del modelo Llama 3.2 3B (transformer decoder-only con atencion causal, desarrollado por Meta) y se aplica un ajuste fino supervisado para la tarea de aprendizaje de ontologias. El sufijo `e1` sugiere una unica epoca de entrenamiento, y la secuencia `DBpediaArchivo-TDSelect-MatOnto-Top10` apunta a un pipeline experimental concreto: uso de DBpedia Archivo como fuente de datos, una etapa de seleccion de terminos (TDSelect), una herramienta de matching ontologico (MatOnto) y una restriccion a los 10 mejores candidatos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales. Tampoco se documenta si se congelaron capas, se aplico LoRA u otra tecnica de adaptacion eficiente. Todos estos datos deben considerarse no disponibles.

## Capacidades

- Generacion de texto en lenguaje natural (capacidad heredada del modelo base Llama 3.2 3B).
- Extraccion de terminos y relaciones para construccion de ontologias, segun el proposito declarado en el nombre del repositorio.
- Seleccion de candidatos ontologicos (componente TDSelect) y matching con ontologias existentes (componente MatOnto).
- Razonamiento basico y respuesta a instrucciones (capacidad del modelo base, no verificada tras el fine-tuning).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (no documentado).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Aprendizaje de ontologias a partir de corpus textuales: el modelo puede emplearse para extraer conceptos candidatos y relaciones taxonomicas de documentos, alimentando un pipeline de ontology learning en entornos de investigacion.
- Enriquecimiento de bases de conocimiento tipo DBpedia: dado que el entrenamiento se apoya en DBpedia Archivo, el modelo puede alinearse con entidades y propiedades de esta base para tareas de poblado o validacion.
- Seleccion de terminos candidatos (TDSelect): util para filtrar terminos relevantes de un corpus antes de pasarlos a una herramienta de matching.
- Matching ontologico (MatOnto): puede asistir en la alineacion de conceptos entre una ontologia fuente y una ontologia destino en tareas de integracion de datos.
- Experimentacion academica reproducible: sirve como punto de partida para comparar configuraciones de fine-tuning en tareas de ontology learning dentro de un grupo de investigacion.
- Prototipado de pipelines de extraccion de conocimiento: al ser un modelo de 3B, puede desplegarse en entornos con recursos limitados para validar rapidamente una idea antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para un modelo de 3B, en FP16 requeriria aproximadamente 6-8 GB de VRAM, y en cuantizacion de 4 bits alrededor de 2-3 GB (estimaciones no confirmadas por el autor).
- GPU recomendadas: no disponibles; por tamano, seria viable en GPUs consumer como RTX 3060, RTX 4060, RTX 4090, asi como en A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs con 8 GB o mas de VRAM, aunque no esta verificado.
- Opciones de despliegue: no documentadas; por compatibilidad con Llama 3.2 cabria esperar soporte en vLLM, llama.cpp, Ollama y TGI, pero el formato de pesos no se especifica.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| gplsi/Llama-3.2-3B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1-ft | 3B (aprox.) | no disponible | apache-2.0 | Hugging Face, sin descargas |
| meta-llama/Llama-3.2-3B | 3B | 128k | Llama 3.2 Community License | Hugging Face, ampliamente utilizado |
| Modelos especializados en ontology learning | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para comparar este fine-tuning con alternativas de la misma tarea. La comparacion se limita a parametros, contexto y licencia del modelo base.

## Limitaciones y advertencias

- La model card es practicamente vacia: no se documentan datos de entrenamiento, hiperparametros ni evaluacion, lo que impide reproducir o validar el ajuste.
- Riesgo elevado de sobreajuste a la configuracion experimental concreta (una sola epoca, Top10 candidatos, DBpedia Archivo), lo que limita su generalizacion a otros dominios.
- No hay informacion sobre sesgos; al derivar de Llama 3.2, hereda los sesgos del modelo base, agravados por un fine-tuning de dominio muy especifico.
- Riesgo de alucinacion en la generacion de conceptos y relaciones ontologicas no presentes en el corpus de entrenamiento.
- Idiomas soportados no documentados; probablemente centrado en ingles por el origen de DBpedia, aunque no confirmado.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion desaconseja su uso en produccion sin una evaluacion previa.
- Cero descargas y un unico "like" indican que el modelo no ha sido validado por la comunidad.
- No se especifica el formato de pesos, lo que puede complicar su carga en frameworks estandar sin conversion previa.

## Enlaces

- Hugging Face: https://huggingface.co/gplsi/Llama-3.2-3B-OntologyLearning-DBpediaArchivo-TDSelect-MatOnto-Top10-e1-ft
- Modelo base Llama 3.2 3B: https://huggingface.co/meta-llama/Llama-3.2-3B
- DBpedia Archivo: https://archivo.dbpedia.org/
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
