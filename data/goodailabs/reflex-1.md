# Goodailabs/reflex-1

## Resumen

Reflex-1 es un modelo de decisión de 420.778.370 parámetros (aproximadamente 421M) desarrollado por Good AI Labs. No es un modelo generativo: mapea un estado textual, una pregunta y un conjunto de respuestas candidatas a una distribución de probabilidad sobre esas candidatas en un único forward pass. Las opciones se proporcionan en tiempo de inferencia, de modo que clasificación, enrutado de herramientas y selección de acciones comparten la misma interfaz.

El modelo está pensado para decisiones repetidas en flujos de trabajo de agentes y aplicaciones, donde el conjunto de salidas válidas cambia en cada petición. Su arquitectura es de doble codificador: separa el procesamiento del contexto de la representación de las candidatas, y una cabeza de puntuación compartida modela la interacción entre ambas. Combina un codificador de contexto ModernBERT-Large-Instruct con un codificador de candidatas congelado all-MiniLM-L6-v2.

Esta versión publica el checkpoint general de decisión, ambos tokenizadores y una implementación autocontenida de Transformers bajo licencia Apache 2.0. El peso está fusionado en FP32 safetensors (1,68 GB) y la inferencia funciona por defecto en CPU. La model card no declara longitud de contexto efectiva, datos de entrenamiento, número de tokens ni proceso de alineación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble codificador: ModernBERT-Large-Instruct (contexto) + all-MiniLM-L6-v2 congelado (candidatas), con cabeza de puntuación compartida |
| Parametros totales | 420.778.370 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (el modelo expone el indicador `state_truncated` cuando la entrada se recorta) |
| Tipos de cuantizacion | No disponible (solo se publican pesos FP32 fusionados; no hay versiones cuantizadas oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP32 fusionado, 1,68 GB) con código personalizado (`custom_code`) |
| Pipeline | text-classification |
| Tarea declarada | `reflex_decision`, `feature-extraction`, `multiple-choice`, `dynamic-labels` |
| Modelos base | answerdotai/ModernBERT-Large-Instruct, sentence-transformers/all-MiniLM-L6-v2 |
| Entorno validado | Python 3.12, PyTorch 2.8.0, Transformers 5.17.0, safetensors 0.8.0 |
| Entrada | Texto en inglés: estado, pregunta, respuestas candidatas |
| Salida | Respuesta seleccionada (`index`, `choice`), `probabilities` en el orden de las candidatas y `state_truncated` |
| Librería | transformers |

## Arquitectura y entrenamiento

Reflex-1 emplea una arquitectura de doble codificador. El estado se codifica con ModernBERT-Large-Instruct y las respuestas candidatas con all-MiniLM-L6-v2, que se mantiene congelado. Una cabeza de puntuación compartida modela la interacción entre la representación del contexto y la de cada candidata, produciendo una distribución de probabilidad sobre el conjunto de opciones suministrado en la petición. Los candidatos no están fijos en los pesos: se aportan en cada llamada, lo que permite reutilizar el mismo modelo para clasificación, enrutado de herramientas y selección de acciones.

La model card menciona el uso de LoRA (etiqueta `lora`) y el modelo se distribuye con los pesos fusionados en FP32. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otra alineación. Los conjuntos de datos listados en la ficha (AG News, SST-5, Emotion, Banking77, BoolQ, MultiNLI, RACE y SciQ) aparecen como datos asociados al modelo, y las métricas publicadas corresponden a subconjuntos de diagnóstico de 500 casos, no a los splits de test completos.

El modelo soporta inferencia por lotes (`predict_batch`) y permite formular varias preguntas compartiendo la misma codificación de estado (`predict` con lista de `questions`). En ese modo empaquetado, las puntuaciones pueden diferir de llamadas separadas, tal como advierte la propia model card. La aplicación es responsable de aportar los argumentos de las herramientas y de ejecutar las acciones; el modelo solo devuelve la decisión.

## Capacidades

- Puntuación de elección condicional: asigna probabilidades a un conjunto de candidatas suministrado dinámicamente en cada petición.
- Clasificación de texto con etiquetas dinámicas: las clases no están fijadas en los pesos y pueden cambiar entre llamadas.
- Enrutado de herramientas y selección de acciones dentro de flujos de agentes.
- Salida interpretable: devuelve `index`, `choice`, la lista completa de `probabilities` y la marca `state_truncated`.
- Inferencia por lotes mediante `predict_batch(requests)`.
- Múltiples preguntas sobre un mismo estado, compartiendo la codificación de contexto.
- Ejecución local y offline: descarga del repositorio y carga con `local_files_only=True`.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- Generación de texto: no soportada; es un modelo de decisión, no un modelo generativo.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Clasificación de tickets de soporte con categorías variables: el modelo recibe el texto del cliente como estado y la lista de intenciones vigente como candidatas, devolviendo la más probable. En el ejemplo de la model card se usa para distinguir entre "duplicate charge", "lost card", "unknown fee" y "cash withdrawal".
- Enrutado de herramientas en agentes: en lugar de un clasificador con clases fijas, se pasan como candidatas las herramientas disponibles en cada turno, de modo que el catálogo puede crecer o cambiar sin reentrenar.
- Análisis de sentimiento e intención en atención al cliente: con las candidatas "positive", "negative" y "neutral" sobre el mismo estado, aprovechando que varias preguntas pueden compartir la codificación de contexto.
- Triaje de correos o formularios entrantes: asignación de una categoría operativa a partir de un conjunto de etiquetas definido por el equipo, con la probabilidad asociada para decidir si se escala a revisión humana.
- Selección de acciones en automatizaciones internas: escoger entre acciones predefinidas (reembolsar, escalar, cerrar, pedir documentación) a partir del estado de la incidencia.
- Preguntas de comprensión con opciones múltiples: dado un pasaje y una pregunta, puntuar las respuestas candidatas; los datasets RACE y BoolQ asociados apuntan a este tipo de uso.
- Filtrado previo en pipelines de datos: clasificar grandes volúmenes por lotes con `predict_batch`, descartando o etiquetando registros antes de pasarlos a un modelo mayor.
- Despliegue local con requisitos de privacidad: al ejecutarse en CPU en FP32 y permitir carga offline, encaja en entornos donde los datos no pueden salir de la máquina.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (`verified: false`). Corresponden a subconjuntos de diagnóstico de 500 casos, no a los splits de test completos.

| Dataset | Subconjunto | Metrica | Valor |
|---|---|---|---|
| fancyzhx/ag_news | 500-case study diagnostic subset (test) | Accuracy (%) | 91,2 |
| SetFit/sst5 | 500-case study diagnostic subset (test) | Accuracy (%) | 59,8 |
| dair-ai/emotion | 500-case study diagnostic subset (test) | Accuracy (%) | 92,2 |
| mteb/banking77 | 500-case study diagnostic subset (test) | Accuracy (%) | 95,0 |
| google/boolq | 500-case study diagnostic subset (validation) | Accuracy (%) | 86,0 |

No se han publicado en la información disponible resultados para MultiNLI, RACE ni SciQ, pese a figurar como datasets asociados al modelo, ni comparaciones directas contra otros modelos.

## Requisitos de hardware

- VRAM en FP32: el repositorio pesa 1,68 GB de safetensors, por lo que la inferencia ronda esa cifra más el coste de activaciones.
- VRAM en FP16/BF16: aproximadamente la mitad del peso en FP32 (del orden de 0,85 GB), aunque no se publican pesos de precisión reducida y habría que convertir el checkpoint.
- CPU: es el modo por defecto del modelo (`Inference defaults to CPU FP32`); el ejemplo oficial fija `torch.set_num_threads(1)`, lo que sugiere despliegues con hilos controlados.
- GPU: para CUDA FP32 basta con `model.to("cuda")`. Con 421M parámetros cabe sin problema en cualquier GPU de consumo actual (RTX 3060 12 GB, RTX 4090, etc.); no se especifican modelos concretos recomendados.
- Despliegue: la model card solo documenta Transformers con `trust_remote_code=True`. No se mencionan vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. La model card describe el modelo como de "fast local inference" pero no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas de rendimiento frente a alternativas. La siguiente tabla recoge únicamente lo declarado sobre Reflex-1 y su relación con sus modelos base.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Reflex-1 | 420.778.370 | No disponible | Apache 2.0 | Safetensors FP32 | HuggingFace, descarga pública sin API key |
| answerdotai/ModernBERT-Large-Instruct | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | Modelo base del codificador de contexto |
| sentence-transformers/all-MiniLM-L6-v2 | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | Codificador de candidatas, congelado |

## Limitaciones y advertencias

- Solo inglés: el campo `language` de la model card declara únicamente `en`.
- No es un modelo generativo: no produce texto libre, solo puntúa candidatas suministradas. Usarlo como generador no es viable.
- Riesgo de decisión incorrecta: un modelo de clasificación puede asignar alta probabilidad a una candidata errónea; no existe mecanismo de abstención documentado más allá de inspeccionar la distribución de `probabilities`.
- Recorte de contexto: el modelo expone `state_truncated`, lo que indica que las entradas largas pueden recortarse; la longitud máxima no está declarada.
- Sensibilidad al empaquetado: la propia model card advierte de que varias preguntas que comparten estado pueden dar puntuaciones distintas a las de llamadas separadas.
- Benchmarks no verificados: todas las métricas llevan `verified: false` y proceden de subconjuntos de diagnóstico de 500 casos, por lo que no son directamente comparables con resultados sobre splits de test completos.
- Dependencia de código remoto: la carga requiere `trust_remote_code=True`, lo que implica ejecutar `modeling_reflex.py`, `configuration_reflex.py` y `encoding_reflex.py` descargados del Hub. Conviene fijar `revision=` para reproducibilidad y auditar el código antes de usarlo en producción.
- Ejecución de acciones fuera del modelo: Reflex-1 solo decide; la aplicación debe aportar argumentos y ejecutar las acciones, con los riesgos de seguridad que ello conlleva.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantías ni procedencia completa de los datos de entrenamiento.
- Sin datos de entrenamiento publicados: no se puede evaluar la composición del dataset ni el riesgo de sesgos específicos.
- Adopción nula en el momento de la ficha: 0 descargas y 0 likes, sin ecosistema ni comunidad que valide el comportamiento fuera de los ejemplos oficiales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Goodailabs/reflex-1
- Código del modelo: https://huggingface.co/Goodailabs/reflex-1/blob/main/modeling_reflex.py
- Configuración: https://huggingface.co/Goodailabs/reflex-1/blob/main/configuration_reflex.py
- Codificador de peticiones: https://huggingface.co/Goodailabs/reflex-1/blob/main/encoding_reflex.py
- Modelo base del codificador de contexto: https://huggingface.co/answerdotai/ModernBERT-Large-Instruct
- Modelo base del codificador de candidatas: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Datasets asociados: https://huggingface.co/datasets/fancyzhx/ag_news, https://huggingface.co/datasets/SetFit/sst5, https://huggingface.co/datasets/dair-ai/emotion, https://huggingface.co/datasets/mteb/banking77, https://huggingface.co/datasets/google/boolq, https://huggingface.co/datasets/nyu-mll/multi_nli, https://huggingface.co/datasets/ehovy/race, https://huggingface.co/datasets/allenai/sciq
