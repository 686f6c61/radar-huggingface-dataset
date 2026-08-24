# deu05232/promptriever-llama2-7B-followtable-RandLH4

## Resumen

El modelo `deu05232/promptriever-llama2-7B-followtable-RandLH4` es un adaptador PEFT (LoRA) construido sobre el modelo base `meta-llama/Llama-2-7b-hf`. Se enmarca en la familia Promptriever, una línea de investigación que adapta modelos de lenguaje para actuar como retrievers densos controlables mediante instrucciones en lenguaje natural, en lugar de depender de consignas fijas o embeddings estáticos. Este variante concreta incorpora el sufijo "followtable", lo que sugiere un entrenamiento orientado a tareas que implican seguir instrucciones sobre tablas, aunque no se aportan detalles sobre el conjunto de datos ni el procedimiento exacto.

El modelo se distribuye como un adaptador PEFT (14,3 GB), lo que implica que requiere cargar el modelo base Llama-2-7b y aplicar los pesos del adaptador para su uso. No se proporciona información sobre licencia, idiomas, ni benchmark. Aunque el repositorio no tiene descargas ni likes, la existencia de variantes similares (`JointLH4`, `followtable` sin sufijo) y su vinculación con el repositorio oficial de Promptriever sugiere que se trata de un modelo de investigación, probablemente sin soporte activo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-2-7b (transformer decoder-only) + adaptadores LoRA |
| Parametros totales | 7B (modelo base) + adaptador (no especificado) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (Llama-2 base) |
| Tipos de cuantizacion | no disponible (el adaptador se entrega en safetensors) |
| Idiomas soportados | no disponible (probablemente ingles, dado el modelo base) |
| Licencia | no disponible (el modelo base tiene licencia Llama-2, el adaptador no especifica) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama-2-7b, un transformer decoder-only de 7 mil millones de parametros con 32 capas y atencion por ventanas de 4096 tokens. El adaptador PEFT se anade al modelo base, de forma que solo se entrenan un subconjunto de parametros (LoRA). El tag `promptriever` indica que el entrenamiento sigue el enfoque de Promptriever: el modelo se entrena para que las instrucciones en el prompt controlen el comportamiento de retrieval, permitiendo que una misma instancia se adapte a diferentes tareas (por ejemplo, busqueda de pasajes, de tablas, etc.) sin reentrenamiento.

No se dispone de informacion sobre el conjunto de datos de entrenamiento, el numero de tokens, el procedimiento exacto (RLHF, DPO, etc.) ni las hiperparametros. El sufijo `followtable` podria indicar un fine-tuning especifico sobre datos que requieren seguir instrucciones con tablas, pero no hay documentacion que lo confirme. El tag `RandLH` podria hacer referencia a una variante de muestreo aleatorio de izquierda/derecha durante el entrenamiento, pero no es verificable.

## Capacidades

- **Retrieval denso por instrucciones**: como otros modelos Promptriever, el modelo puede recibir una instruccion en lenguaje natural para controlar la tarea de recuperacion (por ejemplo, "encuentra pasajes que hablen de X").
- **Seguimiento de instrucciones sobre tablas**: el sufijo `followtable` sugiere capacidad para procesar y recuperar informacion de tablas, aunque no hay evidencia publica de su rendimiento.
- **Generacion de texto**: al estar basado en Llama-2, puede generar texto, pero su uso principal es retrieval, no generacion libre.
- **Tool calling / function calling**: no se ha documentado ninguna capacidad de este tipo.
- **Soporte de agentes**: no se ha documentado.
- **Multilingue**: no hay informacion, pero Llama-2 se entrena principalmente en ingles, por lo que el soporte multilingue es limitado.
- **Vision**: no, es un modelo de texto.

## Casos de uso

- **Recuperacion de pasajes en dominio especifico**: el modelo puede usarse como backbone en sistemas de question answering sobre bases de datos de documentos, donde el prompt controla el tipo de informacion a recuperar.
- **Recuperacion de tablas en hojas de calculo**: si el entrenamiento con `followtable` ha funcionado, podria emplearse para extraer filas o columnas relevantes de tablas en respuestas a preguntas.
- **Sistemas de busqueda semantica**: integrado en pipelines de RAG (Retrieval-Augmented Generation) para seleccionar pasajes relevantes antes de generar una respuesta.
- **Investigacion en retrieval**: como modelo de referencia para comparar metodos de retrieval por instrucciones, dado su parentesco con Promptriever.
- **Experimentos con adaptadores PEFT**: util para estudiar el efecto de LoRA en la capacidad de retrieval de un LLM.
- **Aplicaciones de bajo recurso**: al ser un adaptador pequeño, puede cargarse en entornos con recursos limitados (aunque requiere el modelo base de 7B).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se puede evaluar su rendimiento en tareas como MMLU, HumanEval, GSM8K, ni en tareas de retrieval como BEIR.

## Requisitos de hardware

- **VRAM estimada**: para inferencia con Llama-2-7b en precision FP16, se necesitan aproximadamente 14 GB de VRAM (7B parametros x 2 bytes). Con cuantizacion a 4 bits (por ejemplo, con bitsandbytes) se puede reducir a unos 4-5 GB.
- **GPU recomendadas**: NVIDIA RTX 3090/4090 (24 GB) para FP16, o RTX 3060 (12 GB) con cuantizacion. Para produccion, se recomienda A10G o A100.
- **Consumer GPU**: si, en tarjetas con al menos 8 GB de VRAM usando cuantizacion.
- **Opciones de despliegue**: como es un adaptador PEFT, se puede cargar con la libreria `peft` y `transformers` de HuggingFace, o convertir a GGUF para usar con llama.cpp o Ollama, aunque no hay conversiones oficiales.
- **Latencia y throughput**: no disponibles. El modelo base Llama-2-7B tiene una latencia de alrededor de 20-30 ms por token en A100, pero depende del hardware y la implementacion.

## Comparativa con modelos similares

No se han identificado modelos comparables con la misma especializacion (Promptriever con variante `followtable`). Los modelos de retrieval denso tipicos (como DPR, Contriever) no usan LLM de 7B, y los modelos LLM para retrieval (como REPLUG) no son comparables en este contexto. Se puede comparar con el modelo base Llama-2-7b, pero no es una comparacion de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| `promptriever-llama2-7B-followtable-RandLH4` | 7B + adaptador | 4096 | no disponible | Retrieval con instrucciones y tablas |
| Llama-2-7b (base) | 7B | 4096 | Llama-2 License | Generacion de texto general |
| Promptriever (original) | no disponible | no disponible | no disponible | Retrieval con instrucciones |

## Limitaciones y advertencias

- **Sesgos conocidos**: el modelo base Llama-2 hereda sesgos presentes en sus datos de entrenamiento, que pueden amplificarse en tareas de retrieval.
- **Riesgo de alucinacion**: aunque es un modelo de retrieval, puede generar respuestas incorrectas si se usa como generador.
- **Limitaciones de contexto**: la ventana de 4096 tokens limita el tamano de las tablas o documentos que puede procesar.
- **Idioma**: el modelo base esta entrenado principalmente en ingles; el rendimiento en otros idiomas es desconocido.
- **Restricciones de licencia**: la licencia del adaptador no esta especificada. El modelo base tiene la licencia Llama-2 (uso comercial permitido con restricciones para empresas con mas de 700 millones de usuarios mensuales). Es imprescindible verificar la licencia del adaptador antes de uso comercial.
- **Caveat para produccion**: no hay documentacion de rendimiento ni benchmarks, por lo que no se recomienda su uso en entornos de produccion sin una evaluacion previa.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/deu05232/promptriever-llama2-7B-followtable-RandLH4)
- [Repositorio oficial de Promptriever en GitHub](https://github.com/orionw/promptriever)
- [Paper de Promptriever (referencia)](https://arxiv.org/abs/1910.09700) (enlace indirecto, el paper original es de Lacoste et al. 2019, pero no es el paper de Promptriever; no se ha encontrado el paper especifico)
- [Modelo base Llama-2-7b](https://huggingface.co/meta-llama/Llama-2-7b-hf)
