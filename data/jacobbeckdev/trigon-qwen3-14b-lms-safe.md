# jacobbeckdev/trigon-qwen3-14b-lms-safe

## Resumen

Trigon qwen3-14b-lms-safe v1 es un bundle de decision tipada (typed-decision model) publicado por el usuario jacobbeckdev. No es un modelo generativo al uso: recibe un estado y un mapa de preguntas tipadas (eleccion multiple, si/no, puntuacion) y devuelve una distribucion calibrada por pregunta en una sola pasada de prefill. El modelo no genera texto libre; produce puntuaciones calibradas sobre un conjunto cerrado de respuestas candidatas.

El bundle se construye sobre Qwen/Qwen3-14B (Apache-2.0), que se mantiene congelado y se descarga desde su repositorio original. Lo que se publica aqui es unicamente un adaptador LoRA de rango 16 mas un modulo de lectura de respuestas (adapter.pt) que puntua cada candidata como continuacion del propio backbone mediante la formula w * log p(answer) + residual, con w = 0,388. El repositorio ocupa 0,3 GB y no incluye los pesos del modelo base.

El entrenamiento se realizo en una sola epoca (lr 0,0001, semilla 0, CUDA, 3,2 horas) sobre una mezcla de corpus de clasificacion de intenciones, emociones, seguridad de contenido, NLI, deteccion de jailbreak e inyeccion de prompts, y acciones web. Su relevancia practica esta en el enfoque de calibracion: publica ECE por tarea y umbrales de referencia (ECE floor p95), lo que permite usar las salidas como probabilidades utilizables en umbrales de decision, no solo como etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone Qwen/Qwen3-14B congelado (transformer decoder-only denso) + adaptador LoRA de rango 16 + modulo de lectura de respuestas (answer readout) |
| Parametros totales | 14.000 millones en el backbone (no incluido en el repo); el bundle solo contiene el adaptador LoRA y el readout, repo de 0,3 GB |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible en la ficha del bundle; heredada del backbone Qwen3-14B |
| Tipos de cuantizacion | No disponible para el bundle (se distribuye adapter.pt sin cuantizar). El backbone admite las cuantizaciones publicadas por Qwen para Qwen3-14B |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 para el bundle segun la model card; el campo de licencia de HuggingFace aparece como no disponible. Los corpus de entrenamiento tienen licencias CC BY 4.0, Apache-2.0 y MIT |
| Formato de pesos | PyTorch (adapter.pt) acompanado de ficheros SHA256SUMS; no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El sistema es un bundle de inferencia sobre un backbone denso congelado. La senal de aprendizaje se concentra en un adaptador LoRA de rango 16 y en un cabezal de lectura que transforma la probabilidad de la continuacion del backbone en una puntuacion calibrada: w * log p(answer) + residual, con w = 0,388. El identificador de build es trigon-lm-score-qwen3-14b-qwen3-14b-lms-safe-s0+lm-score-v1. El backbone se fija al commit 40c069824f4251a91eefaf281ebe4c544efd3e18 de Qwen/Qwen3-14B y se descarga desde su repositorio original, nunca se republica en este bundle. El entrenamiento fue de 1 epoca con learning rate 0,0001, semilla 0 y 3,2 horas en CUDA.

Los datos de entrenamiento combinan once corpus: banking77 (1.500 casos), goemotions (1.238), helpsteer2 (844), measuring_hate_speech (844), hatexplain (1.107), teacher-workflows (1.400, etiquetado por Qwen2.5-7B-Instruct), teacher-local (1.120, etiquetado por Qwen3.6-35B-A3B servido con ollama), mind2web-train (1.202), wanli (1.500), jailbreak-train (1.199), prompt-injections-train (410) y aegis2-train (1.500). Todos los corpus de entrenamiento son de nivel "green-tier" segun la documentacion interna del autor; los corpus share-alike o de solo investigacion se usan exclusivamente para evaluacion. La calibracion se ajusto sobre 4.140 casos reservados de diez de esos corpus, con los conjuntos de opciones remodelados igual que en entrenamiento; las etiquetas de profesor nunca se usan como evidencia de calibracion. Quedaron fuera de entrenamiento los corpus clinc150, boolq y circa, y todas las webs de la evaluacion de acciones estan excluidas de mind2web-train.

## Capacidades

- Decision tipada: devuelve una distribucion calibrada por pregunta (eleccion multiple, si/no, puntuacion) en una sola pasada de prefill.
- Clasificacion de intenciones con conjuntos de etiquetas redefinidos, desplazados o renombrados (variantes declared, shift y renamed de banking77).
- Clasificacion de emociones (goemotions) y puntuacion de atributos de utilidad (helpsteer2).
- Moderacion de contenido: deteccion de discurso de odio (measuring_hate_speech, hatexplain) y de contenido inseguro (aegis2-train).
- Seguridad de prompts: clasificacion de jailbreak (jailbreak-train) e inyeccion de prompts (prompt-injections-train).
- Inferencia de lenguaje natural (wanli) y preguntas de respuesta si/no (boolq).
- Seleccion de acciones web sobre paginas no vistas (mind2web), con prediccion de operacion y de elemento.
- Calibracion explicita: la salida incluye ECE medido y una referencia de suelo (ECE floor p95) por tarea.
- No soporta generacion de texto libre, tool calling, agentes multi-paso ni capacidades multimodales segun la informacion disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: con 0,828 de precision en banking77 declarado y 0,870 en el conjunto desplazado, el modelo puede asignar tickets a colas o equipos usando las etiquetas reales del negocio, incluso si estas cambian de nombre o de orden.
- Deteccion de emociones en resenas o encuestas: sobre goemotions permite puntuar emociones con una distribucion calibrada, lo que facilita fijar umbrales de escalado a atencion humana en lugar de depender de etiquetas duras.
- Moderacion de contenido en plataformas: entrenado con measuring_hate_speech, hatexplain y aegis2-train, sirve como primera capa de filtrado con probabilidad calibrada, reservando revision humana para los casos cercanos al umbral.
- Defensa frente a inyeccion de prompts y jailbreak: con prompt-injections-train y jailbreak-train puede actuar como guardarraíl de entrada en un pipeline de LLM, clasificando el prompt antes de enviarlo al modelo generativo principal.
- Validacion de hipotesis en NLI: entrenado con wanli, permite comprobar si una premisa implica una hipotesis, util en verificacion de resumenes o en control de coherencia documental.
- Automatizacion de navegacion web: la evaluacion sobre Mind2Web con webs no vistas da 0,890 de precision de operacion y 0,765 de elemento, suficiente para preseleccionar la accion y el elemento antes de un ejecutor con verificacion.
- Umbrales de abtencion y enrutamiento a humano: al publicar ECE y su suelo por tarea, el modelo permite definir umbrales de confianza medibles en lugar de heuristicas, por ejemplo derivar a revision cuando la probabilidad maxima queda cerca del umbral de calibracion.
- Normalizacion de taxonomias cambiantes: las variantes renamed y shift de banking77 indican que el bundle tolera renombrado y desplazamiento de etiquetas, util cuando el catalogo de categorias de negocio se reorganiza.

## Benchmarks y rendimiento

Generality (scripts/generality.py, 1.000 casos por tarea, semilla fija):

| Tarea | Precision | Azar | ECE | ECE floor p95 | Acuerdo de orden |
| --- | ---: | ---: | ---: | ---: | ---: |
| banking77/declared | 0,828 | 0,013 | 0,030 | 0,030 | no disponible |
| banking77/shift | 0,870 | 0,020 | 0,016 | 0,026 | no disponible |
| banking77/renamed | 0,867 | 0,020 | 0,026 | 0,026 | no disponible |
| clinc150 | 0,942 | 0,020 | 0,078 | 0,028 | no disponible |
| boolq | 0,892 | 0,500 | 0,019 | 0,028 | no disponible |
| banking77/order | 0,879 | 0,020 | 0,012 | 0,025 | 0,943 |

Acciones web (scripts/webact.py, Mind2Web, webs no vistas en entrenamiento):

| Pasos | Operacion | Elemento | Exito de paso | ECE (floor p95) |
| ---: | ---: | ---: | ---: | --- |
| 600 | 0,890 | 0,765 | 0,673 | 0,045 (0,052) |

La propia model card advierte que se trata de una unica semilla y que el resultado es "una medicion, no una certificacion". No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El bundle en si es minimo: el repositorio ocupa 0,3 GB y contiene adapter.pt y los ficheros de checksums; la carga pesada corresponde al backbone Qwen3-14B congelado.
- El adaptador se sirve con el backend de PyTorch de la herramienta del autor: trigon serve --backend torch --weights adapter.pt, con las variables TRIGON_*_PATH apuntando a los calibradores.
- VRAM estimada para el backbone de 14.000 millones de parametros: aproximadamente 28 GB en FP16/BF16 y en torno a 9-10 GB en cuantizacion de 4 bits (estimacion general para modelos densos de ese tamano, no publicada en la ficha).
- GPU recomendadas (estimacion): A100 40 GB, H100 o L40S para FP16; RTX 3090/4090 con 24 GB para FP16 justo al limite o para cuantizaciones de 8 y 4 bits.
- Cabe en GPU de consumo con cuantizacion de 4 u 8 bits; en FP16 completo requiere GPU de 40 GB o mas.
- Opciones de despliegue: el metodo documentado es el gateway trigon con backend torch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La model card solo indica que las respuestas se resuelven en una unica pasada de prefill, sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| trigon-qwen3-14b-lms-safe | 14.000 M (backbone) + LoRA r16 | No disponible | Decision tipada con salida calibrada | Apache-2.0 (bundle) | HuggingFace, 0 descargas |
| Qwen/Qwen3-14B | 14.000 M | No disponible en esta ficha | Modelo generativo generalista | Apache-2.0 | HuggingFace, ampliamente desplegado |
| Qwen2.5-7B-Instruct | 7.000 M | No disponible en esta ficha | Generativo generalista, usado aqui como profesor | Apache-2.0 | HuggingFace |
| Qwen3.6-35B-A3B | 35.000 M (MoE) | No disponible en esta ficha | Generativo MoE, usado aqui como profesor | Apache-2.0 | HuggingFace |

No hay comparativas de rendimiento publicadas frente a clasificadores dedicados (por ejemplo, codificadores ajustados tipo DeBERTa) ni frente a otros bundles de decision calibrada, por lo que la comparacion se limita a especificaciones. Los resultados de las tablas de evaluacion son especificos de las tareas y los conjuntos de opciones evaluados, no trasladables directamente a otros benchmarks.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso; solo puntua respuestas candidatas de un conjunto cerrado.
- El ajuste se hizo con una sola epoca y una sola semilla; el autor lo describe explicitamente como "una medicion, no una certificacion".
- La calibracion falla fuera de dominio: en clinc150 el ECE es 0,078 frente a un suelo p95 de 0,028, mas del doble del umbral de referencia.
- Las etiquetas generadas por profesores (teacher-workflows y teacher-local) aportan cobertura pero no evidencia de calibracion, segun la propia model card.
- El corpus circa aparece como reservado pero no se publican resultados sobre el.
- No hay informacion sobre idiomas soportados, sesgos conocidos ni tasas de alucinacion; al no generar texto, el riesgo de alucinacion se traslada a la eleccion de etiqueta, no a contenido inventado.
- Licencia del bundle declarada como Apache-2.0 en la model card, pero el campo de licencia de HuggingFace no la especifica; parte de los corpus de entrenamiento son CC BY 4.0 y exigen atribucion, y hatexplain se distribuye bajo MIT en el repositorio y CC BY 4.0 segun su ficha de dataset.
- El repositorio no incluye los pesos del backbone: hay que descargar Qwen3-14B por separado y fijarlo al commit indicado para reproducir el comportamiento.
- La model card remite a documentacion interna no publicada (docs/self-host.md, docs/data.md, CLAUDE.md), lo que limita la verificacion independiente.
- Modelo con 0 descargas y 0 likes en HuggingFace: sin validacion de la comunidad ni casos de uso en produccion reportados.
- Para moderacion o seguridad en produccion no deberia usarse como unica capa de decision sin revision humana y sin evaluacion propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jacobbeckdev/trigon-qwen3-14b-lms-safe
- Backbone Qwen3-14B (commit fijado): https://huggingface.co/Qwen/Qwen3-14B/tree/40c069824f4251a91eefaf281ebe4c544efd3e18
- banking77: https://github.com/PolyAI-LDN/task-specific-datasets
- goemotions: https://github.com/google-research/google-research/tree/master/goemotions
- HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Measuring Hate Speech: https://huggingface.co/datasets/ucberkeley-dlab/measuring-hate-speech
- HateXplain (commit 01d742279dac): https://github.com/punyajoy/HateXplain
- Qwen2.5-7B-Instruct (commit a09a35458c70): https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Mind2Web: https://huggingface.co/datasets/osunlp/Mind2Web
- WANLI: https://huggingface.co/datasets/alisawuffles/WANLI
- jailbreak-classification (commit 2f2ceeb39658): https://huggingface.co/datasets/jackhhao/jailbreak-classification
- prompt-injections (commit 4f61ecb038e9): https://huggingface.co/datasets/deepset/prompt-injections
- Aegis 2.0 AI Content Safety Dataset (commit d86bb8bedff5): https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los unicos resultados obtenidos corresponden a especificaciones del iPhone 12 mini y no guardan relacion con la ficha.
