# RyzovaTech/Alphi-v1

## Resumen

Ryzova Alphi v1 es un modelo multimodal de tipo image-text-to-text publicado por RyzovaTech, construido sobre el modelo base google/gemma-4-E2B-it de Google. Se distribuye como un modelo fusionado (merged) tras aplicar una adaptacion neuronal propia denominada Super-v8, consistente en una especializacion mediante LoRA fusionada sobre los pesos del modelo fundacional. El resultado es un modelo de aproximadamente 5.100 millones de parametros totales (5.104.297.504 segun los pesos en safetensors) con unos 2.300 millones de parametros efectivos, siguiendo la configuracion upstream de Gemma 4 E2B.

El modelo se presenta como el primer lanzamiento neuronal de Ryzova dentro de un sistema mas amplio denominado Alphi / AI Wear, que incluye componentes externos como Matrix Memory (memoria estructurada fuera del contexto activo), Growing Brain (biblioteca de procedimientos reutilizables), Ryzova Knowledge (capa de identidad) y recuperacion documental con herramientas controladas. Es importante subrayar que estos componentes no estan embebidos en los pesos ni en los ficheros GGUF: el repositorio contiene unicamente el modelo neuronal y sus artefactos de inferencia.

La relevancia actual del modelo es limitada pero concreta: ofrece una via de experimentacion local con un modelo multimodal de ~5B sobre Gemma 4, con versiones cuantizadas en GGUF (Q4_K_M, Q6_K, Q8_0 y F16) y pesos FP16 en safetensors. Su alcance verificado de inferencia se limita a generacion de texto basica y pruebas de humo (smoke tests) dirigidas. Los idiomas explorados son ingles y cingales (sinhala), y la licencia es especifica por componentes, no una licencia abierta estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformer multimodal image-text-to-text); 35 capas de lenguaje segun configuracion upstream |
| Parametros totales | 5.104.297.504 (incluyendo embeddings) |
| Parametros activos | Aproximadamente 2,3B efectivos (cifra upstream de Gemma 4 E2B); no se especifica si es MoE |
| Longitud de contexto | 128K tokens en la configuracion upstream; el rendimiento practico en contexto largo de Alphi requiere pruebas separadas |
| Tipos de cuantizacion | FP16 (safetensors); GGUF en F16, Q4_K_M, Q6_K y Q8_0 |
| Idiomas soportados | Ingles (en) y cingales (si) |
| Licencia | ryzova-alphi-v1-mixed-components (licencia por componentes, ver LICENSING.md) |
| Formato de pesos | Safetensors (3 shards, ~9,51 GiB) y GGUF (Q4_K_M 3,182 GiB; Q6_K 3,567 GiB; Q8_0 y F16 no disponibles en la informacion proporcionada) |

## Arquitectura y entrenamiento

Alphi v1 parte de la arquitectura Gemma 4 en su variante E2B-it, un modelo multimodal de entrada imagen-texto y salida texto. La configuracion upstream declara 35 capas de lenguaje y una ventana de contexto de 128K tokens. Sobre esta base, Ryzova aplica lo que denomina Super-v8, una adaptacion neuronal consistente en una especializacion LoRA que posteriormente se fusiona con los pesos del modelo fundacional, dando lugar al modelo merged que se distribuye. No se proporcionan en la informacion disponible datos sobre el volumen de tokens de entrenamiento, la composicion del dataset de adaptacion, ni si se emplearon tecnicas de RLHF o DPO en esa fase.

La innovacion declarada por el autor no reside en la arquitectura neuronal en si, sino en el ecosistema de sistema que la rodea: Matrix Memory para almacenar informacion estructurada con trazabilidad de fuente, tiempo, confianza y relaciones, distinguiendo informacion vigente de historial superado; Growing Brain para gestionar procedimientos candidatos, validarlos y promoverlos o ponerlos en cuarentena; y Ryzova Knowledge como capa de identidad estable. Estas capacidades se ejecutan en un runtime externo (AI Wear) y no estan contenidas en los pesos descargables. El autor reporta una prueba interna de Matrix Memory v1.2.2 con un corpus sintetico de 1.000.001 palabras y recuperacion de 5 de 5 hechos centinela plantados, un test acotado a una carga de recuperacion concreta y no una garantia de recall general.

## Capacidades

- Generacion de texto conversacional multi-turno, con el alcance verificado limitado a generacion de texto basica y smoke tests dirigidos.
- Procesamiento de entrada imagen-texto (pipeline image-text-to-text), heredado de la base Gemma 4 E2B-it.
- Soporte multilingue para ingles y cingales (sinhala); no se declaran otros idiomas.
- Integracion potencial con los componentes externos de Ryzova (Matrix Memory, Growing Brain, Ryzova Knowledge, RAG documental y herramientas controladas) a traves del runtime AI Wear, no embebidos en el modelo.
- No se documenta en la informacion disponible soporte nativo de tool calling o function calling dentro del modelo neuronal.
- No se documenta en la informacion disponible un modo de razonamiento explicito (thinking mode), soporte de audio ni capacidades de agente autonomo dentro de los pesos.

## Casos de uso

- Experimentacion local con modelos multimodales de ~5B: descargando el GGUF Q4_K_M (3,182 GiB) se puede ejecutar inferencia de texto en equipos con recursos moderados para evaluar la adaptacion Super-v8 frente a la base Gemma 4 E2B-it.
- Prototipado de asistentes conversacionales en ingles: el modelo sirve como nucleo de generacion en un chatbot de demostracion, dejando la gestion de estado y contexto persistente a un componente externo tipo Matrix Memory.
- Pruebas de soporte de cingales: util para equipos que necesiten evaluar la calidad de generacion en sinhala sobre una base Gemma 4, aunque el autor no publica metricas de calidad por idioma.
- Evaluacion de pipelines image-text-to-text: al heredar el pipeline multimodal de Gemma 4 E2B-it, permite montar prototipos de descripcion de imagenes o respuesta a consultas sobre imagenes, siempre validando el comportamiento real porque el alcance verificado es limitado.
- Integracion en arquitecturas con recuperacion documental: el modelo puede actuar como generador final en un sistema RAG donde la recuperacion y el grounding los aporte un componente externo (Ryzova Document RAG u otro), reduciendo la dependencia de la memoria parametrica del modelo.
- Base para investigacion sobre adaptaciones LoRA fusionadas: comparar el modelo merged con la base original permite estudiar el efecto de la especializacion Super-v8 en tareas concretas de conversacion.
- Despliegue en entornos con requisitos de peso reducido: las variantes GGUF Q4_K_M y Q6_K facilitan la distribucion en estaciones de trabajo sin GPU de gran memoria, para tareas de generacion de texto no criticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta una prueba interna de recuperacion sobre Matrix Memory v1.2.2 (corpus sintetico de 1.000.001 palabras, 5 de 5 hechos centinela recuperados), que no es un benchmark del modelo neuronal ni es comparable con metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- Pesos FP16 en safetensors: 3 shards con ~9,51 GiB en total; se recomienda GPU con al menos 12-16 GB de VRAM para cargar el modelo completo en FP16 con margen para el contexto.
- GGUF Q4_K_M: 3,182 GiB de fichero; cabe en GPU consumer de 6-8 GB de VRAM y permite inferencia en CPU con llama.cpp.
- GGUF Q6_K: 3,567 GiB de fichero; adecuado para GPU de 8 GB o para ejecucion en CPU con mayor calidad que Q4_K_M.
- GPU recomendadas: para FP16, RTX 4090, A100 o H100; para cuantizaciones GGUF, RTX 3060/4060 en adelante y equipos sin GPU dedicada mediante CPU.
- Opciones de despliegue: Transformers para los safetensors FP16; llama.cpp u Ollama para los GGUF; vLLM y TGI no estan confirmados en la informacion disponible para esta arquitectura concreta.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Ryzova Alphi v1 | ~5,1B totales / ~2,3B efectivos | 128K (upstream) | ryzova-alphi-v1-mixed-components | Safetensors FP16, GGUF (F16, Q4_K_M, Q6_K, Q8_0) | Adaptacion Super-v8 sobre Gemma 4 E2B-it; idiomas en y si |
| google/gemma-4-E2B-it | ~5,1B totales / ~2,3B efectivos | 128K | Licencia Gemma de Google | Safetensors, GGUF | Modelo base oficial; sin la especializacion Super-v8 |
| Alternativas de ~5B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- El alcance de inferencia verificado por el autor se limita a generacion de texto basica y smoke tests dirigidos; no hay validacion publica de calidad en tareas complejas.
- No se publican benchmarks estandar (MMLU, HumanEval, GSM8K, etc.), por lo que no es posible comparar su rendimiento de forma objetiva con otros modelos.
- La licencia es especifica por componentes (ryzova-alphi-v1-mixed-components) y remite a LICENSING.md; es imprescindible revisarla antes de cualquier uso comercial, ya que puede imponer restricciones derivadas del modelo base Gemma.
- Cobertura idiomatica limitada a ingles y cingales; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- El rendimiento practico en contexto largo (128K) no esta validado por el autor y requiere pruebas separadas.
- Las capacidades de memoria, habilidades y recuperacion dependen de un runtime externo (AI Wear) que no se incluye en los ficheros descargables; el modelo por si solo no las proporciona.
- Riesgo de alucinacion inherente a los modelos generativos; el autor no reporta mitigaciones especificas dentro del modelo.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- El modelo tiene un volumen de descargas muy bajo (4 descargas, 1 like en el momento de la consulta), lo que implica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RyzovaTech/Alphi-v1
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Descarga de GGUF: https://huggingface.co/RyzovaTech/Alphi-v1/tree/main/gguf/v1
- Licencia por componentes: https://huggingface.co/RyzovaTech/Alphi-v1/blob/main/LICENSING.md
- Pagina de Alphi: https://www.ryzova.com/ai/alphi
- Pagina de Ryzova AI: https://www.ryzova.com/ai
- Paper tecnico (DOI Zenodo): https://doi.org/10.5281/zenodo.22942971
- DOI Hugging Face: https://doi.org/10.57967/hf/11373
