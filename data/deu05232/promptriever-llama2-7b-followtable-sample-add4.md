# deu05232/promptriever-llama2-7B-followtable-Sample-Add4

## Resumen

El modelo `deu05232/promptriever-llama2-7B-followtable-Sample-Add4` es un adaptador PEFT (LoRA) construido sobre el modelo base `meta-llama/Llama-2-7b-hf`, desarrollado por el usuario de Hugging Face `deu05232`. Forma parte de la familia Promptriever, un proyecto que demuestra que los modelos de retrieval pueden controlarse mediante instrucciones en lenguaje natural por instancia, de forma similar a como se controlan los modelos de lenguaje. Este adaptador concreto se entrena con una configuración experimental denominada `followtable` y una muestra de datos `Sample-Add4`, lo que sugiere que es una variante de investigación dentro de un estudio más amplio sobre prompting en retrieval.

El modelo resuelve el problema de adaptar un LLM generalista a tareas de retrieval denso (búsqueda de pasajes relevantes) mediante un adaptador ligero, sin necesidad de reentrenar el modelo completo. Su relevancia actual radica en que explora cómo los prompts pueden modular el comportamiento de un retriever, una línea de investigación activa en sistemas RAG (Retrieval-Augmented Generation). Al estar basado en Llama-2-7b, hereda la arquitectura transformer de 7 mil millones de parámetros, aunque el adaptador solo añade un número reducido de parámetros entrenables. La longitud de contexto del modelo base es de 4096 tokens, pero no se especifica si el adaptador la modifica.

La ficha se elabora con la información disponible en la model card, que está prácticamente vacía, y con los resultados de búsqueda sobre el repositorio Promptriever. La mayoría de los campos técnicos no están disponibles, por lo que se indicará explícitamente cuando un dato no se haya publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-2-7b-hf) con adaptador PEFT (LoRA) |
| Parametros totales | 7 mil millones (modelo base) + adaptador (no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (heredada del modelo base, no confirmada para el adaptador) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles, pero no se especifica para este adaptador) |
| Licencia | no disponible (el modelo base Llama-2-7b-hf tiene licencia de Meta con restricciones de uso comercial) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es Llama-2-7b-hf, un transformer autoregresivo con arquitectura estándar (atención multi-cabeza, normalización RMS, embeddings rotatorios). Sobre este modelo se aplica un adaptador PEFT, presumiblemente LoRA (Low-Rank Adaptation), que congela los pesos originales y entrena matrices de bajo rango en las capas de atención y MLP. El adaptador se entrena para la tarea de retrieval denso, es decir, para producir representaciones de consultas y pasajes que permitan calcular similitud por producto escalar.

Los detalles de entrenamiento no están disponibles en la model card: no se especifica el número de tokens, la composición del dataset, ni si se usó RLHF o DPO. El nombre `followtable` sugiere que el entrenamiento sigue una tabla de prompts o instrucciones, y `Sample-Add4` indica una variante de muestreo de datos. El repositorio GitHub de Promptriever (enlazado en los resultados de búsqueda) indica que el proyecto demuestra que los retrievers pueden controlarse con prompts por instancia, lo que implica que el entrenamiento probablemente incluye pares de instrucción-consulta-pasaje. No se dispone de más información técnica sobre el proceso de entrenamiento.

## Capacidades

- Retrieval denso: el modelo está diseñado para codificar consultas y pasajes en vectores densos y recuperar pasajes relevantes mediante similitud coseno o producto escalar.
- Control por prompts: siguiendo la filosofía de Promptriever, el adaptador permite modificar el comportamiento del retriever mediante instrucciones en lenguaje natural, adaptando la búsqueda a criterios específicos (por ejemplo, "busca pasajes que hablen de causas históricas").
- Generación de texto: al estar basado en Llama-2-7b, conserva la capacidad de generación de texto del modelo base, aunque el adaptador está orientado a retrieval y no se ha evaluado su rendimiento generativo.
- Razonamiento y codigo: capacidades heredadas del modelo base, pero no validadas para este adaptador concreto.
- Tool calling y agentes: no disponible, no se menciona soporte específico.
- Multilingüismo: no disponible, aunque Llama-2-7b tiene soporte limitado multilingüe (principalmente inglés).

## Casos de uso

- Sistemas RAG con control fino: el modelo puede integrarse en un pipeline de retrieval-augmented generation donde el prompt de búsqueda se ajusta dinámicamente según la consulta del usuario, mejorando la relevancia de los pasajes recuperados.
- Búsqueda semántica especializada: permite crear un buscador que filtra por criterios expresados en lenguaje natural, como "documentos que contengan datos experimentales" o "artículos de opinión", sin necesidad de reentrenar el modelo.
- Evaluación de retrievers con prompts: útil para investigadores que estudian cómo las instrucciones afectan a la calidad del retrieval, comparando diferentes configuraciones de prompt sobre el mismo adaptador.
- Filtrado de corpus en dominios concretos: puede adaptarse a dominios como medicina, derecho o finanzas mediante prompts específicos, aunque no se han publicado evaluaciones en estos ámbitos.
- Prototipado rápido de motores de búsqueda: al ser un adaptador ligero, se puede desplegar sobre Llama-2-7b con PEFT y probar diferentes estrategias de prompting sin costes de entrenamiento completos.
- Investigación en retrieval controlable: sirve como base para experimentos sobre cómo los prompts afectan a la representación de consultas y pasajes, un área activa en la comunidad de recuperación de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni evaluaciones de retrieval (nDCG, Recall@k). El repositorio GitHub de Promptriever podría contener evaluaciones, pero no se han extraído datos concretos en la búsqueda web. Por tanto, no se puede comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- VRAM estimada: para el modelo base Llama-2-7b en fp16 se necesitan aproximadamente 14 GB de VRAM solo para los pesos. El adaptador PEFT añade una cantidad mínima (típicamente menos de 1 GB). Con cuantización (por ejemplo, 4 bits) se podría reducir a unos 4-6 GB, pero no se han publicado cuantizaciones para este adaptador.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4090, A100 40GB) para inferencia en fp16. Para consumer GPU de 8 GB (RTX 3060, 4060) sería necesario cuantizar el modelo base.
- Si cabe en consumer GPU: sí, con cuantización del modelo base (por ejemplo, usando bitsandbytes o GPTQ), pero el adaptador no está publicado en formato GGUF ni cuantizado.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la librería `peft` de Hugging Face sobre el modelo base. Para inferencia, se puede usar transformers, vLLM (si se fusiona el adaptador), o llama.cpp si se convierte a GGUF (no disponible actualmente).
- Latencia y throughput: no disponible, no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un adaptador de investigación sin benchmarks publicados. Como referencia, se puede comparar con el modelo base Llama-2-7b-hf (sin adaptador) y con otros adaptadores de la familia Promptriever (por ejemplo, `promptriever-llama2-7B-followtable-JointLH4` o `promptriever-llama2-7B-new_seed42-SumMargLH-ckt3700`), que comparten la misma arquitectura base pero difieren en la configuración de entrenamiento. No se conocen modelos comerciales equivalentes con control por prompts en retrieval.

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador | Llama-2-7b | 7B + adaptador | 4096 | no disponible | Hugging Face |
| Llama-2-7b-hf | - | 7B | 4096 | Llama 2 license (uso comercial restringido) | Hugging Face |
| Otros adaptadores Promptriever | Llama-2-7b | 7B + adaptador | 4096 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base Llama-2-7b presenta sesgos de género, raza y religión, y el adaptador no los corrige. No se ha realizado ninguna evaluación de sesgos para este adaptador.
- Riesgo de alucinacion: en tareas de generación, el modelo puede producir contenido falso o inventado. En tareas de retrieval, puede recuperar pasajes irrelevantes si el prompt no está bien formulado.
- Limitaciones de contexto: la ventana de 4096 tokens limita la longitud de consultas y pasajes que se pueden procesar de una vez.
- Limitaciones de idioma: el modelo base está entrenado principalmente en inglés; el rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: la licencia del adaptador no está especificada, pero el modelo base Llama-2-7b-hf tiene una licencia de Meta que restringe el uso comercial para empresas con más de 700 millones de usuarios mensuales. Cualquier uso comercial debe cumplir esa licencia.
- Caveat para producción: al ser un adaptador de investigación sin benchmarks ni documentación de entrenamiento, no se recomienda su uso en entornos productivos sin una validación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/deu05232/promptriever-llama2-7B-followtable-Sample-Add4
- Repositorio GitHub de Promptriever: https://github.com/deu05232/promptriever
- Modelo base en Hugging Face: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Otros adaptadores relacionados (ejemplo): https://huggingface.co/deu05232/promptriever-llama2-7B-followtable-JointLH4
- Página de inferencia en FriendliAI (para otro adaptador de la familia): https://friendli.ai/models/deu05232/promptriever-repro-llama2-7b
