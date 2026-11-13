# plantwaterer/munku

## Resumen

munku (𒁵𒄩) es un ajuste fino del modelo multimodal google/gemma-4-31B-it, desarrollado por el usuario plantwaterer, orientado especificamente a la toma de decisiones y a preguntas de opcion multiple. Se trata de un modelo de 31.273.088.876 parametros (31,3 mil millones) que hereda la arquitectura de Gemma 4 y anade una cabeza de clasificacion propia sobre la ultima capa, construida a partir de un ajuste anterior del mismo autor (plantwaterer/eshbar-lulilla), que a su vez deriva de plantwaterer/liquamen.

El modelo resuelve el problema de seleccionar respuestas entre opciones discretas (letras de opcion multiple y decisiones binarias si/no) con un motor de inferencia propio denominado `munku:Engine`, empaquetado en el propio repositorio y verificado por hashes MD5 en `PINS.json`. Incorpora ademas un "knowledge store" y una ruta de respuestas ejecutadas (generacion de pequenos programas Python evaluados por un ejecutor de aritmetica exacta), aunque en la configuracion publicada (`--option route=off`) estas rutas estan desactivadas y todas las respuestas provienen de la primera pasada del modelo.

Su relevancia actual radica en que reporta una puntuacion de 71,10 en el Decision Index 0.3 (autoevaluada), y en que demuestra un patron de despliegue poco habitual: un motor de inferencia in-process con atencion empaquetada por documento, promedio sobre cuatro ordenes de opciones y calibracion de temperatura (T = 1,2786) para la softmax de los logits de letra. La licencia declarada es Apache-2.0, si bien el modelo arrastra datos de entrenamiento con terminos no comerciales (detallados mas abajo), lo que matiza su uso comercial real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base google/gemma-4-31B-it) con cabeza de decision propia sobre la ultima capa |
| Parametros totales | 31.273.088.876 (31,3 mil millones) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo describe inferencia en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con datos de entrenamiento no comerciales, ver limitaciones) |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-4-31B-it |
| Precisión de inferencia | bf16 (pesos: 62 GB) |
| Tamano del repositorio | 62,7 GB |
| Pipeline declarado | text-generation (tags: image-text-to-text, multiple-choice, decision-making) |
| Hardware minimo | 1 GPU con al menos 75 GB (cabe en una RTX PRO 6000 de 96 GB) |

## Arquitectura y entrenamiento

munku parte de google/gemma-4-31B-it, un transformer multimodal (image-text-to-text) de 31,3 mil millones de parametros, y le superpone una cabeza de decision propia entrenada sobre la ultima capa. El ajuste se construye en cadena sobre plantwaterer/eshbar-lulilla, que a su vez continua plantwaterer/liquamen; los datos, licencias y atribuciones de esas dos fichas se heredan. La inferencia usa atencion empaquetada por documento: las capas de atencion completa son bidireccionales dentro de un mismo prompt, mientras que las capas de ventana deslizante permanecen causales. Para peticiones por debajo de un limite de longitud, la respuesta se promedia sobre cuatro ordenes distintos de las opciones, lo que reduce la sensibilidad al orden de presentacion.

El entrenamiento anadido para este modelo emplea 384.663 preguntas de decision, compuestas por la mezcla de eshbar-lulilla (que incluye las fuentes de liquamen), anadidos y preguntas sinteticas generadas por el autor. Entre las fuentes destacan: matematicas (DeepMind Mathematics Dataset regenerado con su propio generador, AQuA-RAT y MATH en splits de entrenamiento), medicina y logica (MedQA, FOLIO), preguntas de ciencia (SuperGPQA, con claves de respuesta verificadas mediante Qwen3-32B) y herramientas (Toucan-1.5M, esquemas MCP con preguntas y trayectorias). Tambien se incluyen conjuntos de inferencia de lenguaje natural y analisis del discurso (ANLI, AmericasNLI, x-stance, Amazon Multilingual Counterfactual Dataset, DISRPT, MultiRC, NLI4CT, VAST, entre otros). La calibracion de salida es explicita: softmax sobre los logits de letra a una temperatura ajustada T = 1,2786 para opciones ordinarias, y una posterior de Laplace integrada para decisiones binarias si/no.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas en formato abierto y de opcion multiple.
- Toma de decisiones discretas: seleccion de la letra correcta entre opciones y decisiones binarias si/no con calibracion probabilistica.
- Razonamiento matematico basico y de nivel competicion, entrenado con AQuA-RAT, MATH y el DeepMind Mathematics Dataset.
- Razonamiento logico y de sentido comun (FOLIO) y preguntas de medicina (MedQA).
- Preguntas de ciencia de nivel avanzado (SuperGPQA).
- Capacidades multimodales heredadas del modelo base (tag image-text-to-text), aunque la model card no detalla su uso.
- Soporte de tool calling / function calling a traves de los esquemas MCP de Toucan-1.5M presentes en el entrenamiento.
- Ruta opcional de respuestas ejecutadas: el modelo puede escribir una funcion Python corta que un ejecutor de aritmetica exacta (derivado de LOOM) evalua; desactivada por defecto en la configuracion publicada.
- Knowledge store opcional con estadisticas a nivel de pais (tabla `store_table.json`); desactivado en la configuracion publicada.
- Multilingue parcial por herencia del modelo base y de conjuntos como AmericasNLI, x-stance o el Amazon Multilingual Counterfactual Dataset; el conjunto exacto de idiomas no esta declarado.

## Casos de uso

- Evaluacion automatizada de opciones multiple en entornos de benchmark: el modelo esta disenado para emitir la letra de la opcion correcta con una softmax calibrada a temperatura fija, lo que permite integrarlo en pipelines de evaluacion tipo Decision Index sin postprocesado adicional.
- Clasificacion binaria si/no con incertidumbre cuantificada: la posterior de Laplace integrada sobre decisiones binarias permite obtener una probabilidad calibrada, util en sistemas de moderacion de contenido o triaje donde se necesita un umbral de confianza explicito.
- Asistencia en razonamiento matematico y logico: gracias al entrenamiento con MATH, AQuA-RAT y FOLIO, puede emplearse como componente de verificacion en tutores automaticos o en la generacion de soluciones paso a paso para problemas de nivel escolar y competicion.
- Preguntas de ciencia y medicina para formacion: el entrenamiento con SuperGPQA y MedQA lo hace adecuado para generar preguntas de practica y respuestas razonadas en plataformas educativas, siempre con supervision humana dada la sensibilidad del dominio medico.
- Seleccion de herramientas en agentes: los esquemas MCP de Toucan-1.5M permiten usar el modelo para decidir que herramienta invocar ante una peticion, integrandolo como planificador en arquitecturas de agentes con tool calling.
- Analisis de discurso y argumentacion: la inclusion de x-stance, ANLI, DISRPT y MultiRC lo habilita para tareas de inferencia de lenguaje natural, deteccion de postura y clasificacion de relaciones discursivas en textos multilingues.
- Despliegue en una unica GPU de 96 GB: con 62 GB de pesos en bf16 y latencias medianas de 192-291 ms por peticion, encaja en escenarios de inferencia interactiva de baja concurrencia sobre una RTX PRO 6000 Blackwell.
- Ejecucion de calculos verificables (ruta opcional): si se activa la ruta de respuestas ejecutadas, el modelo puede resolver preguntas numericas generando codigo Python evaluado por un ejecutor de aritmetica exacta, lo que reduce errores de calculo en dominios como estadistica o finanzas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Decision Index 0.3 (public score) | 71,10 | Autoevaluado por el autor; ejecutado con la ruta de respuestas activada |
| Preguntas enrutadas | 0 de 3.490 produjeron un programa usable | La ruta de respuestas no cambio ninguna respuesta en la ejecucion publica |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Tampoco se ofrece comparacion con modelos de referencia en la model card.

Datos de latencia declarados (una RTX PRO 6000 Blackwell, 1.000 peticiones, una a la vez, con `--option route=off`):

| Metrica | Muestra publica (1.000 filas) | Muestra reservada (1.000 preguntas) |
|---|---|---|
| Mediana | 291 ms | 192 ms |
| Media | 652 ms | 267 ms |
| p80 | 871 ms | 292 ms |
| p95 | 1.848 ms | no disponible |

La carga del modelo y el calentamiento (hasta unos tres minutos) no estan incluidos en estas cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: 62 GB para los pesos en bf16; la model card recomienda una GPU con al menos 75 GB.
- GPU recomendadas: una RTX PRO 6000 (96 GB) es el hardware de referencia declarado; cabe en GPUs profesionales de 80 GB o mas (A100 80 GB, H100 80 GB) siempre que se valide el margen de memoria para el contexto y el ejecutor.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bf16; no se documentan variantes cuantizadas.
- Opciones de despliegue: motor propio `munku:Engine` in-process, invocado mediante `python -m decision_index run --engine munku:Engine --option model="$REPO" --option route=off --compact --out runs/munku`; requiere descargar el repositorio completo con `huggingface_hub.snapshot_download` y anadir su ruta a `PYTHONPATH`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- El kernel del ejecutor se distribuye precompilado para arquitecturas sm_75 a sm_120.
- Latencia y throughput: mediana de 192-291 ms por peticion en una RTX PRO 6000 Blackwell, con una peticion a la vez; el throughput concurrente no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| munku (plantwaterer) | 31,3 mil millones | no disponible | Ajuste de decision sobre Gemma 4, motor propio | Apache-2.0 (con datos no comerciales) | Hugging Face, 0 descargas |
| google/gemma-4-31B-it | 31,3 mil millones (heredado) | no disponible | Modelo base multimodal instruction-tuned | Terminos de Gemma (no disponibles en la informacion) | Hugging Face |
| plantwaterer/eshbar-lulilla | no disponible | no disponible | Ajuste predecesor del mismo autor | Apache-2.0 (heredada) | Hugging Face |
| Qwen3-32B | 32 mil millones | no disponible | LLM denso de uso general | Apache-2.0 | Hugging Face |

La comparacion con alternativas de la misma categoria (modelos de decision o de opcion multiple de ~30B) no esta disponible en la informacion proporcionada; solo se documenta la relacion con el modelo base y con el predecesor directo del autor.

## Limitaciones y advertencias

- La puntuacion de 71,10 en Decision Index 0.3 es autoevaluada por el autor y no ha sido replicada de forma independiente.
- La ruta de respuestas ejecutadas y el knowledge store estan desactivados en la configuracion publicada; en la ejecucion publica con la ruta activada, 0 de 3.490 preguntas enrutadas generaron un programa usable y el store no respondio ninguna, por lo que su utilidad practica no esta demostrada.
- La licencia declarada es Apache-2.0, pero los datos de entrenamiento incluyen fuentes con terminos no comerciales (ANLI CC BY-NC 4.0, AmericasNLI CC BY-SA 4.0, x-stance CC BY-NC 4.0, Amazon Multilingual Counterfactual Dataset CC BY-NC 4.0, Potsdam Commentary Corpus CC BY-NC-SA, Russian RST Treebank 1.0 CC BY-NC-SA 4.0, Persian RST corpus CC BY-NC, pasajes de MS MARCO en RAGTruth con uso limitado a investigacion no comercial) y fuentes sin licencia declarada (ACOS, MultiRC, NLI4CT, VAST, SciDTB y varios treebanks de DISRPT). El uso comercial puede requerir revision legal adicional.
- CSTNews se distribuye solo para fines de investigacion.
- El modelo hereda los sesgos y riesgos de alucinacion de Gemma 4 y de los conjuntos de entrenamiento; no se documentan evaluaciones de sesgo ni de seguridad.
- No se documentan longitudes de contexto, idiomas soportados ni opciones de cuantizacion, lo que dificulta planificar despliegues con requisitos especificos.
- El despliegue esta atado a un motor propietario (`munku:Engine`) con ficheros verificados por MD5; no hay soporte documentado para runtimes estandar como vLLM o llama.cpp.
- El calentamiento puede tardar hasta unos tres minutos, lo que afecta a despliegues con arranque en frio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- La model card esta redactada en ingles y no proporciona informacion sobre sesgos, evaluaciones de seguridad ni limitaciones de idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/plantwaterer/munku
- Modelo predecesor: https://huggingface.co/plantwaterer/eshbar-lulilla
- Modelo antecesor: https://huggingface.co/plantwaterer/liquamen
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Kit de evaluacion Decision Index: https://huggingface.co/apolinario/decision-index
- Ejecutor LOOM (derivado, Apache-2.0): https://github.com/mkturkcan/Loom
- Dataset SuperGPQA: https://huggingface.co/datasets/m-a-p/SuperGPQA
- Dataset Toucan-1.5M: https://huggingface.co/datasets/Agent-Ark/Toucan-1.5M
- Modelo Qwen3-32B (verificacion de claves de SuperGPQA): https://huggingface.co/Qwen/Qwen3-32B
