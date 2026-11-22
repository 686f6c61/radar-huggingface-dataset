# flicker-ai/flicker-flash2-gguf

## Resumen

Flicker Flash 2 es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-2B, desarrollado por Flicker Lab (cuenta `flicker-ai` en Hugging Face) y distribuido en formato GGUF cuantizado Q4_K_M. El modelo se presenta como un derivado conversacional del Qwen3.5-2B, entrenado mediante LoRA sobre conjuntos de datos abiertos, y empaquetado en tres fragmentos (shards) para su uso en navegador a través de wllama. Con 1.881.825.088 parametros totales, se posiciona en la gama de modelos pequenos orientados a inferencia local y entornos con recursos limitados.

La relevancia de este modelo radica en su formato de distribucion: al estar cuantizado en GGUF y fragmentado, esta pensado para ejecutarse en entornos de bajos recursos, incluyendo inferencia en el navegador. Sin embargo, la informacion publicada por el autor es muy escasa: no se detallan los datasets de entrenamiento, el numero de tokens utilizados, ni resultados de evaluacion. La model card se limita a indicar el proceso de fine-tuning con LoRA y el formato de publicacion.

Se trata, por tanto, de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y cuya utilidad practica depende en gran medida de la calidad del modelo base Qwen3.5-2B y de la preservacion de sus capacidades tras el ajuste fino. No se dispone de informacion sobre idiomas soportados ni sobre el pipeline de la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-2B; detalles no disponibles) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); otros tipos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (3 shards) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-2B, un transformer de aproximadamente 1.880 millones de parametros. El ajuste se realizo mediante LoRA (Low-Rank Adaptation) sobre conjuntos de datos abiertos, segun indica la model card. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla si el ajuste afecto a todas las capas o solo a modulos de atencion y feed-forward.

La innovacion tecnica destacable no esta en el entrenamiento, sino en el empaquetado: el modelo se distribuye en tres shards GGUF pensados para su carga en navegador mediante wllama, lo que permite inferencia local sin servidor. La cuantizacion Q4_K_M reduce el peso del modelo a aproximadamente 1,3 GB en el repositorio, facilitando su despliegue en dispositivos con memoria limitada. No se dispone de informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base Qwen3.5-2B.
- Razonamiento basico y respuesta a instrucciones, segun el ajuste LoRA sobre datasets abiertos.
- Capacidad de ejecucion en navegador mediante wllama (formato GGUF fragmentado).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas no estan declarados.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Capacidades de codigo y matematicas: no disponible de forma explicita; dependen del modelo base.

## Casos de uso

- Inferencia en navegador sin servidor: el modelo, al estar en GGUF Q4_K_M y dividido en tres shards, puede cargarse con wllama directamente en el navegador, lo que permite prototipos de asistentes conversacionales que no envian datos a un backend.
- Prototipado rapido de chatbots locales: con 1,88 mil millones de parametros y cuantizacion Q4_K_M, cabe en equipos de consumo, lo que facilita iterar sobre prompts y flujos conversacionales sin infraestructura GPU dedicada.
- Educacion y demos offline: al ser un modelo pequeno y con licencia Apache 2.0, es adecuado para talleres, demostraciones y entornos sin conectividad donde se requiera un modelo conversacional basico.
- Integracion en aplicaciones de escritorio con llama.cpp: el formato GGUF permite su uso con llama.cpp y derivados (por ejemplo, Ollama), lo que simplifica la incorporacion de un asistente de texto en aplicaciones de escritorio.
- Filtrado y clasificacion de texto ligera: para tareas de etiquetado o resumen de textos cortos en entornos con recursos limitados, siempre que se valide su calidad frente al modelo base.
- Base para nuevos ajustes finos: al ser un derivado de Qwen3.5-2B con licencia permisiva, puede servir como punto de partida para fine-tunings especificos, aunque se recomienda partir del modelo base original si no se necesita el formato GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB para la cuantizacion Q4_K_M (tamano del repositorio); otros niveles de cuantizacion no disponibles.
- GPU recomendadas: no disponibles de forma especifica; por tamano, cabe en GPUs de consumo con al menos 2-4 GB de VRAM libre.
- Cabe en GPU de consumo: si, previsiblemente en modelos como GTX 1650, RTX 3050, RTX 4060 y superiores, aunque no hay datos oficiales de compatibilidad.
- Opciones de despliegue: wllama (navegador), llama.cpp, y previsiblemente Ollama y otros runners compatibles con GGUF; vLLM y TGI no estan confirmados para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Flicker Flash 2 (GGUF) | 1,88 B | no disponible | Apache 2.0 | GGUF (3 shards) | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-2B (base) | ~2 B | no disponible | no disponible en la informacion | safetensors (previsiblemente) | Hugging Face |
| Otros derivados GGUF de Qwen3.5-2B | ~2 B | no disponible | variable | GGUF | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas. La comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Informacion muy escasa: no se documentan datasets, tokens de entrenamiento, idiomas ni evaluaciones, lo que impide validar la calidad del ajuste fino.
- Riesgo de degradacion respecto al modelo base: al ser un fine-tuning LoRA sobre datasets abiertos no especificados, puede haber perdida de capacidades del Qwen3.5-2B original.
- Riesgo de alucinacion: inherente a los modelos de 2 mil millones de parametros, especialmente en tareas de razonamiento complejo.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos.
- Limitaciones de contexto e idioma: no declaradas; se desconoce la ventana de contexto efectiva y los idiomas soportados.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar la licencia del modelo base Qwen3.5-2B.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta, sin comunidad ni validacion externa.
- Formato fragmentado: los tres shards deben cargarse conjuntamente; su uso esta orientado a wllama y puede requerir pasos adicionales en otros runners.

## Enlaces

- Hugging Face: https://huggingface.co/flicker-ai/flicker-flash2-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Resultados de busqueda web no relevantes (definiciones de diccionario y articulos enciclopedicos sobre el termino "flicker"); no se han encontrado papers, blogs ni repositorios asociados al modelo.
