# kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-045

## Resumen

El modelo `kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-045` es un ajuste fino (fine-tuning) publicado en Hugging Face por el usuario kky84176, derivado de la familia Qwen 3.5 según el tag `qwen3_5` del repositorio. Por el nombre del identificador se deduce que se trata de un modelo orientado a tareas de RAG (generación aumentada por recuperación), con un ajuste supervisado (SFT) y un adaptador LoRA cuantizado (QLoRA), entrenado sobre el conjunto de datos JemHopQA, y con función de reranking en el pipeline de recuperación. El pipeline declarado en el Hub es `image-text-to-text`, lo que sugiere capacidades multimodales de entrada imagen y texto.

El repositorio contiene 852.985.920 parámetros en formato safetensors (aproximadamente 0,85 mil millones) y ocupa 3,4 GB. Se publica bajo la librería `transformers` y es compatible con endpoints. La model card es la plantilla automática de Hugging Face sin rellenar, por lo que no hay información del autor sobre datos de entrenamiento, hiperparámetros, licencia ni evaluación.

La relevancia de esta ficha es limitada pero concreta: se trata de un checkpoint de investigación de un tercero, con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin documentación técnica. Resulta útil como referencia para quienes exploran pipelines de reranking en RAG multilingüe o quieren inspeccionar los pesos, pero no es un modelo listo para producción sin una validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun tag `qwen3_5`); detalles no disponibles |
| Parametros totales | 852.985.920 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el nombre sugiere QLoRA en el entrenamiento, no cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no permite reconstruir la arquitectura con detalle. El tag `qwen3_5` indica que el checkpoint parte de un modelo de la familia Qwen 3.5, y el pipeline `image-text-to-text` sugiere que el modelo base es multimodal (acepta imagen y texto como entrada). El numero de parametros (852.985.920) corresponde a un modelo de aproximadamente 0,85 mil millones, lo que encaja con una variante pequena de la familia, aunque no se confirma oficialmente.

En cuanto al entrenamiento, el identificador del repositorio aporta pistas: `rag-sft` sugiere ajuste supervisado para tareas de generacion aumentada por recuperacion; `mq-reranker` apunta a un componente de reranking multi-query; `qlora` indica que el ajuste se hizo con LoRA cuantizado; y `jemhopqa` senala el dataset JemHopQA, un conjunto de preguntas y respuestas en japones orientado a razonamiento multi-hop. No se dispone de informacion sobre numero de tokens, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas adicionales. La model card no documenta hiperparametros ni regimen de entrenamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el tag `conversational`.
- Procesamiento de entradas imagen-texto (`image-text-to-text`), aunque no se detalla la tarea concreta ni la resolucion soportada.
- Orientacion a RAG: el nombre del modelo sugiere uso como reranker o componente de recuperacion en pipelines de generacion aumentada.
- Posible soporte de razonamiento multi-hop, dado el dataset JemHopQA empleado en el ajuste.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (aunque el dataset de entrenamiento apunta a multi-hop, no se confirma capacidad agentica).
- Capacidades multilingues: no disponible; el dataset JemHopQA es en japones, pero no se declara el conjunto de idiomas del modelo.
- Capacidades especiales (thinking mode, vision, audio): vision probable por el pipeline declarado; el resto no disponible.

## Casos de uso

- Reranking en pipelines RAG: el modelo puede emplearse como reordenador de pasajes recuperados antes de la generacion, seleccionando los fragmentos mas relevantes para la consulta del usuario. Es adecuado por su nombre y su ajuste sobre un dataset de QA, aunque requiere validacion empirica propia.
- Preguntas y respuestas multi-hop: para consultas que requieren combinar informacion de varias fuentes, el ajuste sobre JemHopQA sugiere cierta especializacion en razonamiento encadenado, util en asistentes documentales.
- Investigacion sobre QLoRA: el checkpoint sirve como caso de estudio de un ajuste con LoRA cuantizado sobre un modelo pequeno, util para reproducir experimentos de eficiencia de entrenamiento.
- Prototipado de asistentes multimodales: al aceptar imagen y texto, puede emplearse en demos de descripcion de imagenes o respuesta a preguntas sobre capturas, siempre con validacion previa.
- Evaluacion de modelos pequenos en japones: dado el dataset de entrenamiento, puede usarse como linea base en experimentos de QA en japones, comparando con otros ajustes.
- Docencia y experimentacion: por su tamano reducido y su formato safetensors, es manejable en entornos academicos para estudiar tecnicas de reranking y RAG.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB solo para pesos (852.985.920 parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 2,5 y 4 GB segun longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,85 GB de pesos; en 4 bits, aproximadamente 0,45 GB, mas overhead.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) deberia poder ejecutarlo; en entornos de servidor, A100 o H100 no son necesarias por el tamano, pero pueden usarse para lotes grandes.
- Cabe en GPU consumer: si, con margen amplio en tarjetas de 8 GB o superiores.
- Opciones de despliegue: transformers (libreria declarada), vLLM y TGI si el modelo base es compatible, llama.cpp/Ollama solo si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-045 | 852.985.920 | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen 3.5 (variante base de ~0,8B) | no disponible | no disponible | no disponible | Hugging Face (familia oficial) |
| BGE-reranker (familia de rerankers) | variable (base ~0,1B, large ~0,3B) | no disponible | MIT en variantes publicas | Hugging Face |
| Jina reranker (familia) | variable | no disponible | no disponible | Hugging Face |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible; los datos de los modelos comparables no se han verificado en esta ficha y deben consultarse en sus respectivas model cards.

## Limitaciones y advertencias

- La model card es la plantilla automatica sin rellenar: no hay documentacion de uso, datos de entrenamiento ni evaluacion.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o verificar la licencia del modelo base Qwen 3.5 antes de cualquier despliegue.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks no se puede acotar su magnitud.
- Sesgos conocidos: no documentados; al derivar de un modelo base no identificado con precision, hereda los sesgos de este.
- Limitaciones de contexto e idioma: no disponibles; el ajuste sobre un dataset en japones puede degradar el rendimiento en otros idiomas.
- El pipeline `image-text-to-text` no garantiza que la parte de vision haya sido entrenada o validada en este checkpoint.
- Para produccion, se recomienda validar el modelo contra un conjunto de evaluacion propio y comparar con rerankers establecidos antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kky84176/qwen35-rag-sft-mq-reranker-qlora-jemhopqa-045
- Paper citado en la model card (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
- Familia Qwen en Hugging Face (referencia del modelo base): https://huggingface.co/Qwen
- Dataset JemHopQA (referencia del ajuste): no disponible en la informacion proporcionada
