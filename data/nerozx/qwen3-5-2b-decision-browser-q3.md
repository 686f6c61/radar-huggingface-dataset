# nerozx/qwen3.5-2b-decision-browser-q3

## Resumen

`neroZX/qwen3.5-2b-decision-browser-q3` es un modelo de decisión (no un modelo conversacional) derivado de `unsloth/Qwen3.5-2B` y empaquetado en formato GGUF con cuantización Q3_K_M. Su propósito es actuar como cabecera de decisión para un agente web: recibe un `state` (tarea, paso actual y acciones previas) junto con un conjunto de `questions` cuyas opciones son elementos de la página, y devuelve la clave de la opción con la que interactuar a continuación, acompañada de una probabilidad calibrada por opción. Está pensado para servirse a través del endpoint `/v1/systemone` de Unsloth Studio sobre backend llama.cpp con el layout `clef`.

El modelo incorpora un backbone de aproximadamente 1.912 millones de parámetros (1,9 B) más una cabecera de decisión conjunta con dimensión oculta 2048, anchura 512 y 4 capas. El checkpoint completo en Q3_K_M ocupa 1,11 GB, un 14,3 % menos que la variante Q4_K_M (1,29 GB), y se cuantizó directamente desde el GGUF F16 original, no desde Q4. El repositorio no incluye la torre de visión (`mmproj`); para entrada de imagen hay que recurrir al `mmproj-Q8_0.gguf` del repositorio Q4.

Su relevancia radica en el enfoque: en lugar de emplear un LLM generalista para elegir acciones en un navegador, se entrena una cabecera específica que produce probabilidades calibradas (ECE de 0,0152 en el heldout de entrenamiento), lo que facilita umbrales de abstención y control de falsos positivos en pipelines de automatización web. Es un artefacto muy especializado, con licencia `other` y solo idioma inglés declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-2B) con cabecera de decisión conjunta (`joint_head_config.json`: hidden 2048, width 512, 4 capas) |
| Parametros totales | 1.912.297.796 (1,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_M (este repo); el autor referencia F16 y Q4_K_M en el proceso de exportación |
| Idiomas soportados | en (inglés) |
| Licencia | other (seguir las licencias del modelo base y de los datos de entrenamiento) |
| Formato de pesos | GGUF (`model-Q3_K_M.gguf`, 1.109.253.184 bytes) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-2B` como backbone y añade una cabecera de decisión conjunta cuya forma se describe en `joint_head_config.json` (hidden 2048, width 512, 4 capas). La salida no es texto libre, sino una selección entre opciones predefinidas (elementos de página) con una probabilidad calibrada asociada a cada una. El artefacto se distribuye como GGUF cuantizado con llama.cpp y se sirve mediante el layout `clef` de Unsloth Studio en `/v1/systemone`.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. El autor menciona entrenamiento con Unsloth y evaluación sobre `mind2web`, y los metadatos de temperaturas y entrenamiento se recogen en `unsloth_decision_config.json`. La cuantización Q3_K_M se generó desde el GGUF F16 original, con SHA-256 `48e22f2ee366e6ec77386bae666ffdb4c5d4cddba239c01c35791bb511b57084`.

## Capacidades

- Selección de acciones en entornos web: dado un estado y un conjunto de preguntas con opciones asociadas a elementos de página, devuelve la clave de la opción a ejecutar.
- Salida de probabilidad calibrada por opción, útil para umbrales de confianza y abstención.
- Integración como herramienta de decisión dentro de un agente web (no como modelo de chat).
- Soporte de entrada de imagen únicamente si se añade el `mmproj-Q8_0.gguf` del repositorio Q4 (no incluido en este repo).
- Capacidades multilingües: no disponibles más allá del inglés declarado.
- Tool calling / function calling genérico: no disponible; la interfaz es la del layout `clef` (`/v1/systemone`).
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Automatización de navegación web guiada por objetivos: el modelo decide el siguiente elemento a interactuar en cada paso a partir del snapshot de la página y del historial de acciones, encajando en pipelines tipo Mind2Web.
- Agentes de operaciones sobre paneles de monitorización: el autor evalúa con objetivos reales en NMS/Grafana, de modo que el modelo puede seleccionar controles en interfaces de observabilidad con probabilidad asociada por opción.
- Enrutado de acciones con umbral de confianza: gracias a la calibración (ECE 0,0152 en heldout), permite descartar decisiones por debajo de un umbral y derivar a revisión humana.
- Testing automatizado de interfaces: selección determinista de elementos en suites de extremo a extremo donde se requiere una política de decisión ligera y de bajo coste.
- Despliegue en entornos con recursos limitados: con 1,11 GB en Q3_K_M puede servirse en llama.cpp en hardware modesto, como componente de decisión junto a un modelo mayor que aporte percepción o planificación.
- Investigación en calibración de políticas de decisión: útil para estudiar falsos positivos y abstención en agentes web, dado que el autor reporta métricas de false-accept.
- Extracción de trazas de decisión para evaluación: al devolver claves de opción y probabilidades, facilita el análisis de errores en benchmarks de agentes.

## Benchmarks y rendimiento

| Test | Resultado |
|---|---|
| Heldout de entrenamiento (400 decisiones, checkpoint de la era Q4) | 96,5 % de accuracy, ECE 0,0152 |
| 100 filas b297, cabecera primitiva solo | 93 % de accuracy, ECE 0,0640, 7 falsos positivos |
| Objetivos reales NMS/Grafana (42 objetivos, 3 repeticiones) | 69,4 % de accuracy positiva, 30,6 % incorrectas, 0 % de abstención |

El propio autor advierte que el 96,5 % corresponde al heldout de entrenamiento y no a una evaluación final fuera de distribución, y que el benchmark de objetivos reales mide la herramienta de decisión completa (snapshot, embedding y decisión secuencial), no solo la cabecera.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,1 GB de pesos en Q3_K_M más overhead de contexto y del servidor llama.cpp; con `-ngl 99` se descarga toda la red a GPU.
- GPU recomendadas: cualquier GPU consumer con al menos 2-3 GB de VRAM libre (por ejemplo, RTX 3060, RTX 4060, RTX 4090); también A100/H100 si se comparte con otros servicios.
- Cabe en GPU consumer: sí, con margen amplio en Q3_K_M.
- Opciones de despliegue: `llama-server` de llama.cpp con el layout `clef` (`/v1/systemone`); el autor indica `-ngl 99 -b 4096 -ub 4096` y variables `DECISION_BASE`, `DECISION_MODEL` y `DECISION_BACKEND=unsloth`. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nerozx/qwen3.5-2b-decision-browser-q3 | 1,9 B | no disponible | Cabecera de decisión web sobre Qwen3.5-2B, GGUF Q3_K_M | other | Hugging Face, 49 descargas |
| unsloth/Qwen3.5-2B (base) | 2 B (aprox.) | no disponible | LLM generalista de texto | según modelo base | Hugging Face |
| Versión Q4 del mismo proyecto (repo Q4 referenciado) | 1,9 B | no disponible | Misma cabecera de decisión, Q4_K_M (1,29 GB) e `mmproj-Q8_0.gguf` | other | Hugging Face |

No se dispone de datos de benchmarks comparables de terceros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo de chat: ejecutarlo con un prompt conversacional no produce el comportamiento esperado; requiere `state` + `questions`.
- Solo declara inglés; el rendimiento en otros idiomas no está documentado.
- El 96,5 % de accuracy es heldout de entrenamiento, no una evaluación fuera de distribución; el benchmark de objetivos reales baja al 69,4 % de accuracy positiva con 30,6 % de decisiones incorrectas.
- Abstención nula (0 %) en el benchmark de objetivos reales, lo que implica riesgo de acciones erróneas sin aviso.
- Riesgo de alucinación en la selección de elementos no evaluado de forma específica; la salida es una clave de opción, pero puede elegir opciones incorrectas.
- Licencia `other`: es necesario revisar las condiciones del modelo base `unsloth/Qwen3.5-2B` y de los datos de entrenamiento antes de uso comercial.
- La torre de visión no está incluida; sin el `mmproj` del repo Q4 no hay entrada de imagen.
- Dependencia de un layout de servidor concreto (`clef`, `/v1/systemone`), lo que limita la portabilidad a otros stacks de inferencia.
- Repositorio con 49 descargas y 0 likes: ecosistema de validación muy reducido.

## Enlaces

- Hugging Face: https://huggingface.co/nerozx/qwen3.5-2b-decision-browser-q3
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Herramienta y benchmark (Gitea, rama `feat/sequential-embedding`): `nifira-agent/decision-tools` (referenciado en la model card; no se proporciona URL completa)
- Benchmark Mind2Web: no disponible como enlace en la información proporcionada
