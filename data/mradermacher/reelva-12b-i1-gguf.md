# mradermacher/Reelva-12B-i1-GGUF

## Resumen

Reelva-12B es un modelo de lenguaje multimodal (vision + texto) de aproximadamente 11,9 mil millones de parametros, desarrollado por el equipo de reelva y publicado bajo licencia Apache 2.0. Esta ficha cubre la version cuantizada en formato GGUF preparada por mradermacher, que incluye un conjunto amplio de cuantizaciones con y sin matriz de importancia (imatrix) para facilitar la ejecucion en hardware de consumo. El modelo esta orientado a casos de uso conversacional, agentico y de companero de IA, con soporte para indonesio e ingles.

La relevancia de esta publicacion radica en que ofrece un punto de entrada accesible a un modelo de vision-lenguaje de tamano medio con licencia permisiva, ejecutable en GPUs de consumo mediante llama.cpp, Ollama o vLLM. Al tratarse de cuantizaciones GGUF, el usuario puede elegir el equilibrio entre calidad y consumo de VRAM que mejor se adapte a su hardware. La informacion disponible no incluye detalles de la arquitectura interna ni de los datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | Indonesio (id), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix de 0,1 GB) |
| Libreria | transformers |
| Repo base | reelva/Reelva-12B |
| Tamano del repo | 140,3 GB |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles tecnicos sobre la arquitectura interna del modelo base Reelva-12B. Se sabe que es un modelo multimodal con capacidades de vision (la model card indica que los ficheros mmproj, necesarios para procesar imagenes, se encuentran en el repositorio estatico de cuantizaciones). La libreria declarada es transformers, por lo que se presume un diseño basado en transformer, pero no se ha confirmado si emplea mezcla de expertos (MoE), atencion lineal u otras innovaciones.

En cuanto al entrenamiento, no se han publicado datos sobre el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas como RLHF o DPO. La etiqueta "agentic" y "conversational" sugiere un afinamiento orientado a dialogos y uso como asistente, pero no hay informacion verificable al respecto. Las cuantizaciones de mradermacher se generaron con la tecnica imatrix (matriz de importancia), que mejora la calidad de los quants de baja precision en comparacion con la cuantizacion estatica.

## Capacidades

- Modelo multimodal con soporte de vision (procesamiento de imagenes) ademas de texto, segun la model card del autor.
- Generacion de texto conversacional en indonesio e ingles.
- Orientado a interacciones de tipo "companion AI" y asistente personal, segun las etiquetas del repositorio.
- Capacidades agenticas: el modelo esta etiquetado como "agentic", lo que sugiere soporte para razonamiento en multiples pasos o uso de herramientas, aunque no se han publicado detalles concretos de implementacion.
- Soporte de cuantizacion con imatrix, lo que permite ejecutar el modelo en hardware modesto con perdida de calidad controlada.
- Compatible con pipelines de transformers y con el ecosistema GGUF (llama.cpp, Ollama, etc.).

## Casos de uso

- Asistente conversacional en indones o ingles: el modelo puede desplegarse como chatbot local con llama.cpp o Ollama, con cuantizaciones desde 3,1 GB (IQ1_S) hasta 9,9 GB (Q6_K), lo que permite ejecutarlo en portatiles con 8-16 GB de RAM y una GPU con 6-12 GB de VRAM.
- Aplicaciones de vision-lenguaje en el edge: al ser un modelo multimodal, puede utilizarse para responder preguntas sobre imagenes (captioning, VQA) en escenarios donde no se desea enviar datos a la nube. La cuantizacion Q5_K_M (8,6 GB) es un buen equilibrio entre calidad y requisitos de hardware.
- Prototipado de agentes en entornos locales: su naturaleza agentic lo hace util para experimentar con pipelines de razonamiento multi-paso y llamadas a herramientas sin coste de API, siempre que el entorno soporte el formato GGUF.
- Companion AI para usuarios de habla indones: su soporte del idioma indones lo hace adecuado para aplicaciones de compania o coaching en ese mercado, donde hay pocos modelos abiertos de este tamano.
- Evaluacion de cuantizaciones en produccion: al disponer de 24 niveles de cuantizacion, permite comparar la perdida de calidad entre formatos (IQ vs Q) en una tarea concreta antes de decidir el despliegue final.
- Despliegue en entornos de baja latencia con vLLM o TGI: los formatos GGUF pueden cargarse en servidores de inferencia para servir a multiples usuarios con un solo modelo en una GPU, siempre que la VRAM lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas comparativas para Reelva-12B ni para sus cuantizaciones. La calidad relativa de los diferentes niveles de cuantizacion se puede estimar mediante la grafica de perplejidad de ikawrakow citada en la model card, pero no hay numeros concretos del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: segun el archivo cuantizado, entre 3,1 GB (IQ1_S) y 9,9 GB (Q6_K) para los pesos. Se debe anadir la memoria del contexto KV-cache, que depende de la longitud de contexto configurada.
- GPUs recomendadas: para cuantizaciones bajas (IQ2-IQ3), una RTX 3060 de 12 GB es suficiente; para Q4_K_M o Q5_K_M, se recomienda una RTX 4070 de 12 GB o RTX 4090 de 24 GB; para Q6_K, una GPU con 24 GB de VRAM es aconsejable.
- En consumer GPU: si, las cuantizaciones desde IQ1_S hasta Q5_K_M caben en GPUs de 8-12 GB. Q6_K requiere 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), text-generation-inference (TGI), y cualquier framework que soporte GGUF.
- Latencia y throughput: no disponible. Depende de la GPU, la cuantizacion y la longitud de la secuencia. Como referencia orientativa, un modelo de 12B en Q4_K_M suele producir entre 20 y 60 tokens/s en una RTX 4090, pero no se ha medido especificamente para este modelo.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos similares. Reelva-12B es un modelo relativamente reciente y poco documentado. Como referencia general de la categoria de 12B multimodal, se podrian considerar modelos como LLaVA-13B o Qwen-VL-7B, pero no se han encontrado datos de rendimiento comparables en las fuentes proporcionadas. Se recomienda consultar el repositorio base (reelva/Reelva-12B) para obtener la informacion oficial de comparativa.

## Limitaciones y advertencias

- La informacion publica sobre Reelva-12B es escasa: no se han publicado detalles de arquitectura, datos de entrenamiento, ni benchmarks oficiales, lo que dificulta evaluar su calidad de forma objetiva.
- Las cuantizaciones de baja calidad (IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS) presentan una degradacion significativa de la calidad y solo deberian usarse en entornos con restricciones extremas de memoria.
- El modelo esta etiquetado como "companion AI", lo que puede implicar que fue afinado para generar respuestas emocionalmente envolventes, pero tambien puede presentar sesgos en temas sensibles.
- No se ha confirmado el soporte de tool calling o function calling; las etiquetas "agentic" sugieren la posibilidad, pero no hay documentacion que lo garantice.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base (reelva/Reelva-12B) por si hay restricciones adicionales no reflejadas en la model card de la cuantizacion.
- Al ser un modelo de vision, los ficheros mmproj necesarios para procesar imagenes estan en el repositorio estatico (mradermacher/Reelva-12B-GGUF) y no en este repo i1; si se descarga solo este repositorio, la funcionalidad de vision no estara disponible.
- La variacion de calidad entre cuantizaciones es notable: se recomienda probar al menos Q4_K_S o Q4_K_M para uso general y evitar los niveles IQ1 e IQ2 si la calidad es prioritaria.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/mradermacher/Reelva-12B-i1-GGUF
- Repositorio estatico de cuantizaciones: https://huggingface.co/mradermacher/Reelva-12B-GGUF
- Modelo base (no cuantizado): https://huggingface.co/reelva/Reelva-12B
- Perfil de mradermacher en Hugging Face: https://huggingface.co/mradermacher
- Peticiones de modelos a mradermacher: https://huggingface.co/mradermacher/model_requests
- Vista de descargas del modelo: https://hf.tst.eu/model#Reelva-12B-i1-GGUF
