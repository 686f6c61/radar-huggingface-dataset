# knpatil/laya-browser-agent-base

## Resumen

laya-browser-agent-base es un modelo de clasificación de texto de 164,0 M de parámetros totales (149 M de backbone) desarrollado por el usuario knpatil y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un destilado de conocimiento del modelo knpatil/laya-browser-agent, que a su vez se apoya en ModernBERT-large (421,3 M de parámetros). El modelo predice la siguiente acción que debe ejecutar un agente dentro del navegador (CLICK, TYPE_TEXT, SELECT, SCROLL_DOWN, WAIT, DONE, BLOCKED), el elemento objetivo y el criterio de finalización del objetivo.

Su relevancia está en el binomio latencia/precisión: según la model card, alcanza un 96,94 % de exactitud de decisión sobre 70 flujos de automatización web con una latencia mediana de 29,89 ms en Apple Silicon M2 Max (Metal/MPS), lo que reduce el coste a cero al ejecutarse en local. Está diseñado específicamente para bucles de decisión de agente en tiempo real, como la extensión de Chrome BroPilot.

La ficha se basa exclusivamente en la model card y la metadata de Hugging Face; los datos que el autor no documenta se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base destilado); 22 capas, dimensión de modelo 768, 12 cabezas de atención |
| Parámetros totales | 164,0 M (149 M de backbone) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (la metadata de Hugging Face no los especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo es un estudiante destilado de ModernBERT-base (22 capas, d=768, 12 cabezas de atención, 149 M de parámetros). El profesor es un ModernBERT-large congelado (28 capas, d=1024, 16 cabezas de atención, 421,3 M de parámetros) correspondiente al checkpoint knpatil/laya-browser-agent. La destilación usa una pérdida conjunta multitarea que combina la pérdida de destilación de conocimiento sobre los logits (con temperatura tau = 2,0) y la pérdida de entropía cruzada sobre las etiquetas, ponderadas con alpha_KD = 0,6 y alpha_CE = 0,4. El optimizador es AdamW con tasa de aprendizaje 2,5e-5 y un esquema de Cosine Annealing. El entrenamiento se realizó de forma nativa sobre Apple Silicon Metal (MPS).

El modelo es un encoder con cabeza de clasificación multitarea: produce decisiones estructuradas sobre varias primitivas (operation con elección de acción de 7 vías, action_type, is_goal_satisfied, click_target y type_text_target). No se detallan en la model card el número de tokens de entrenamiento ni la composición del dataset. La evaluación se realizó sobre 70 escenarios de prueba (244 decisiones estructuradas) recogidos en data/browser_test_cases.jsonl.

## Capacidades

- Predicción de la siguiente acción de navegador entre siete opciones: CLICK, TYPE_TEXT, SELECT, SCROLL_DOWN, WAIT, DONE y BLOCKED.
- Clasificación de la intención de navegación (action_type), con un 100,0 % de acierto en la evaluación publicada (70/70).
- Selección del elemento objetivo del clic (click_target), con un 85,7 % de acierto (60/70).
- Selección del campo de entrada de texto (type_text_target), con un 95,2 % de acierto (40/42).
- Comprobación binaria de si el objetivo se ha satisfecho (is_goal_satisfied), con un 100,0 % de acierto (70/70).
- Salida de puntuaciones de confianza calibradas (Brier score de 0,0025 con escalado Platt; temperaturas choice: 1,0381, score: 1,0000, noul: 1,0650).
- Ejecución en dispositivo (on-device), sin envío de datos de sesión del navegador a la nube.
- No se documentan capacidades de generación de texto, tool calling genérico, razonamiento multi-paso abierto, visión, audio ni soporte multilingüe explícito.

## Casos de uso

- Automatización de flujos web en el navegador: el modelo decide en cada paso si hacer clic, introducir texto, desplazarse, esperar o dar por finalizada la tarea, con una latencia mediana de 29,89 ms que permite bucles de decisión en tiempo real sin bloquear la interfaz.
- Extensiones de navegador tipo copiloto: integrado en la extensión BroPilot, predice la siguiente acción y el elemento objetivo a partir del estado de la página (URL, título, texto y lista de elementos) para asistir al usuario en tareas repetitivas.
- Rellenado de formularios: gracias a la primitiva type_text_target (95,2 % de acierto), puede identificar el campo de entrada correcto antes de escribir, lo que resulta útil en formularios con muchos inputs etiquetados de forma ambigua.
- Comprobación de finalización de objetivos en agentes: la primitiva is_goal_satisfied (100,0 % de acierto) permite decidir cuándo detener un flujo automatizado, evitando bucles infinitos o acciones redundantes.
- Despliegue privado en escritorio: al ejecutarse en local en Apple Silicon (MPS) o CUDA con coste por decisión de 0,00 $, encaja en escenarios con requisitos de privacidad o con prohibición de enviar datos de sesión a APIs en la nube.
- Pruebas automatizadas de interfaz de usuario: puede emplearse como clasificador de acciones para validar que una web responde correctamente a clics, entradas de texto y desplazamientos, sin depender de servicios externos de pago.
- Sustitución de APIs de automatización en la nube: con 96,94 % de exactitud frente al 86,89 % de TypeSafe Jev y una latencia 28 veces menor (29,89 ms frente a 841,8 ms), es un candidato para reducir coste recurrente y latencia en pipelines de automatización web.

## Benchmarks y rendimiento

Datos publicados en la model card, evaluados sobre 70 escenarios de prueba (244 decisiones estructuradas) del fichero data/browser_test_cases.jsonl:

| Métrica | Base Laya (zero-shot) | TypeSafe Jev (nube, jev-1.13.0) | Profesor (421M large) | Estudiante destilado (149M base) |
|---|---|---|---|---|
| Exactitud de decisión | 64,60 % | 86,89 % | 82,14 % | 96,94 % |
| Tasa de éxito por flujo | 31,43 % | 70,00 % | 34,29 % | 82,86 % |
| Brier score (menor es mejor) | 0,1190 | 0,1608 | 0,0905 | 0,0025 |
| Latencia mediana | 349,0 ms | 841,8 ms | 58,85 ms | 29,89 ms |
| Latencia p95 | 392,0 ms | 1240,0 ms | 62,54 ms | 33,37 ms |
| Parámetros | 421,3 M | propietario (nube) | 421,3 M | 164,0 M (−61,1 %) |
| Coste por 1000 decisiones | 0,00 $ | ≈0,40 $ | 0,00 $ | 0,00 $ (local) |

Exactitud por primitiva de decisión:

| Primitiva | Exactitud |
|---|---|
| operation (elección de acción de 7 vías) | 100,0 % (70/70) |
| action_type (intención de navegación) | 100,0 % (70/70) |
| is_goal_satisfied (comprobación binaria) | 100,0 % (70/70) |
| click_target (selección de elemento) | 85,7 % (60/70) |
| type_text_target (selección de campo de entrada) | 95,2 % (40/42) |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Tamaño en disco indicado en la model card: 596 MB.
- VRAM estimada (cálculo a partir de los 164,0 M de parámetros, no indicada por el autor): aproximadamente 0,66 GB en fp32, 0,33 GB en fp16/bf16, 0,16 GB en int8 y 0,08 GB en int4, más el margen para activaciones y la longitud de secuencia.
- Cabe con holgura en cualquier GPU de consumo: RTX 3060, RTX 4070, RTX 4090, entre otras; el cuello de botella no es la memoria sino el coste de la latencia de red, que aquí se elimina al ser local.
- Entrenado y evaluado de forma nativa en Apple Silicon M2 Max con Metal (MPS); el cliente de ejemplo usa device="mps" y también admite device="cuda".
- Opciones de despliegue documentadas: librería transformers y el cliente de Python de la librería laya. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y al tratarse de un encoder de clasificación con pesos en formato no especificado no puede confirmarse su compatibilidad con GGUF.
- Latencia medida: 29,89 ms de mediana y 33,37 ms en el percentil 95 en Apple Silicon M2 Max (MPS). No se documentan cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Exactitud de decisión | Latencia mediana | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| laya-browser-agent-base (este modelo) | 164,0 M | No disponible | 96,94 % | 29,89 ms | Apache 2.0 | Hugging Face |
| laya-browser-agent (profesor, ModernBERT-large) | 421,3 M | No disponible | 82,14 % | 58,85 ms | No disponible | Hugging Face |
| TypeSafe Jev (jev-1.13.0) | Propietario | No disponible | 86,89 % | 841,8 ms | Propietaria | API en la nube |
| ModernBERT-base (modelo base) | 149 M | No disponible | No aplica (no especializado en automatización web) | No disponible | Apache 2.0 | Hugging Face |

No se dispone de comparativas con otros modelos de decisión para agentes de navegador distintos de los citados en la model card.

## Limitaciones y advertencias

- No se especifican los idiomas soportados ni se documenta cobertura multilingüe; no puede asumirse un comportamiento correcto fuera del idioma o dominio de entrenamiento.
- La longitud de contexto no está documentada, lo que impide garantizar el comportamiento con páginas muy largas o estados con muchos elementos.
- La evaluación se limita a 70 escenarios y 244 decisiones estructuradas de un conjunto propio (data/browser_test_cases.jsonl); no hay validación externa ni benchmarks generales de comprensión del lenguaje.
- La primitiva con menor precisión es click_target (85,7 %), por lo que los errores en la selección del elemento a pulsar son el principal modo de fallo esperado.
- El modelo cuenta con 0 descargas y 1 like en el momento de la consulta, por lo que carece de validación por parte de terceros.
- No se documenta la composición del dataset de entrenamiento, por lo que no pueden evaluarse sesgos de dominio, idioma o de los sitios web usados para generar los datos.
- Al ser un clasificador y no un generador, el riesgo de alucinación se traduce en clasificaciones erróneas o con exceso de confianza, no en texto inventado; la model card declara una calibración buena (Brier score de 0,0025) que conviene verificar en producción.
- La licencia Apache 2.0 permite el uso comercial, pero el modelo deriva de ModernBERT-base y de un profesor cuyo régimen de licencia no se especifica en la información disponible; conviene comprobar la licencia del checkpoint profesor antes de un despliegue comercial.
- El cliente de ejemplo depende de la librería laya y de dispositivos mps/cuda; no se documentan rutas de despliegue alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/knpatil/laya-browser-agent-base
- Checkpoint profesor (laya-browser-agent): https://huggingface.co/knpatil/laya-browser-agent
- Modelo base ModernBERT-base (Answer.AI y LightOn): https://huggingface.co/answerdotai/ModernBERT-base
- No se han encontrado enlaces a papers, blogs, repositorios ni demos adicionales en la información disponible.
