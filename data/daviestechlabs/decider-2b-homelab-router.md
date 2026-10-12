# daviestechlabs/decider-2b-homelab-router

## Resumen

Decider 2B homelab router es un adaptador LoRA experimental desarrollado por DaviesTechLabs sobre el modelo de decisión Mapika/decider-2b (revisión fijada en `533964dae8be954c5b5e19fa4948e48408094c1e`). No es un modelo generativo: es un clasificador de decisión que, dada una consulta, selecciona una de tres rutas —`answer`, `escalate` o `retrieve_then_escalate`— y devuelve las probabilidades asociadas. La respuesta final la redacta un modelo de lenguaje independiente. Su propósito concreto es enrutar peticiones en dos dominios: asistentes de homelab y compañeros de partidas de D&D.

El modelo se distribuye como "model card only": los pesos candidatos están pendientes de acceso de subida, por lo que la publicación actual documenta el experimento pero no garantiza la disponibilidad de los checkpoints. El autor indica explícitamente que esta versión experimental no cuenta con aprobación para promoción a producción, y que la preservación de decisiones públicas y la evaluación de calidad independiente siguen abiertas.

Su relevancia es metodológica: mide, sobre un panel fijo de 277 casos, la mejora de enrutamiento frente al modelo padre y cuantifica por separado los "unsafe direct choices" (respuestas directas en casos críticos que exigirían escalado o recuperación). El piloto de 60 actualizaciones alcanza un 83,39% de acierto frente al 60,29% del padre, aunque un ensayo más amplio de 120 actualizaciones, pese a igualar al comparador Laya en precisión, muestra una regresión de seguridad que impide su promoción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptación LoRA (rank 8, alpha 16, dropout 0) sobre el modelo de decisión Mapika/decider-2b; arquitectura interna del modelo base no disponible |
| Parámetros totales | No disponible (el nombre del modelo base sugiere ~2.000 millones, sin confirmación explícita en la información proporcionada) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (entrenamiento en float32 e inferencia en bfloat16 según el ejemplo de carga) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo parte del decisor Mapika/decider-2b, cuya arquitectura interna no se describe en la documentación. La adaptación consiste en un LoRA de rango 8 con alpha 16 y dropout cero, cuyos pesos se fusionan en el modelo base. El entrenamiento se ejecutó en CPU con precisión float32, optimizador AdamW, tasa de aprendizaje 0,0001 y recorte de gradiente a 1. El mapa de temperatura del modelo padre permanece sin cambios y la inferencia "schema-first" se mantiene desactivada. El pipeline emplea un diseño "state-first" para el enrutamiento.

El piloto realiza 60 actualizaciones del optimizador sobre 36 familias de entrenamiento supervisado, complementadas con 12 actualizaciones de preservación (destinadas a conservar distribuciones congeladas del padre sobre tres decisiones públicas distintas, de tipo "choice", "yes/no" y "score") y 12 actualizaciones de refuerzo con recompensas de enrutamiento autoradas y una penalización de referencia. Las familias de entrenamiento y de evaluación ocupan particiones separadas. Un ensayo más amplio de 120 actualizaciones usa 72 familias supervisadas (24 por ruta), 24 de preservación y 24 de refuerzo, partiendo también del padre sin modificar.

Una auditoría del 12 de octubre detectó un defecto en el ensayo amplio: sus 24 actualizaciones de refuerzo usaron únicamente casos de tipo `answer`, porque la selección de cada tercera fila de los datos ciclados por ruta sesgó la muestra. El ensayo corregido emplea ocho casos de refuerzo por ruta y ocho casos críticos de seguridad en total, manteniendo las mismas 72 familias y 120 actualizaciones; su calidad permanece sin verificar.

## Capacidades

- Clasificación de decisión con tres rutas mutuamente excluyentes: `answer`, `escalate` y `retrieve_then_escalate`.
- Salida de probabilidades asociadas a cada decisión, no solo una etiqueta dura.
- Enrutamiento con diseño "state-first".
- Separación entre decisión y generación: el modelo no redacta la respuesta, esta la produce un modelo de lenguaje aparte.
- No ejecuta herramientas ni modifica infraestructura por sí mismo; su función es recomendar una ruta que queda detrás de la política de la aplicación y de los controles del operador.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el enrutamiento es de un solo paso).
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma declarada.
- Capacidades especiales: detección de casos críticos de seguridad para evitar respuestas directas indebidas; modo de razonamiento y visión no disponibles.

## Casos de uso

- Enrutamiento de consultas en asistentes de homelab: el modelo decide si una petición puede responderse directamente, requiere escalado a un operador humano o necesita recuperación documental previa antes de escalar, lo que permite clasificar el tráfico antes de invocar al modelo generativo.
- Puerta de escalado en atención técnica: cuando la petición entra en una categoría crítica, la ruta `escalate` evita que un modelo generativo responda sin supervisión, reduciendo el riesgo de respuestas directas peligrosas.
- Recuperación aumentada condicionada: la ruta `retrieve_then_escalate` permite disparar una búsqueda documental y, solo después, elevar la consulta, integrando el decisor como paso previo a un pipeline RAG.
- Compañero de D&D para decisiones de arbitraje: el modelo clasifica consultas de reglas o elecciones de partida y decide cuándo basta una respuesta directa y cuándo conviene consultar reglas o derivar a un humano.
- Filtro de seguridad previo a un LLM generativo: colocado delante del modelo de lenguaje que redacta, sirve como capa de control que intercepta casos que exigirían escalado, con métrica explícita de "unsafe direct choices" para monitorizar este comportamiento.
- Investigación en evaluación de seguridad de enrutadores: su panel fijo de 277 casos y su métrica separada de errores peligrosos lo convierten en un banco de pruebas para comparar estrategias de adaptación (60 frente a 120 actualizaciones) y estudiar el compromiso entre precisión y seguridad.
- Auditoría y comparación de variantes de ajuste: útil para equipos que quieran reproducir un experimento de LoRA con particiones de datos separadas y medir el efecto de las actualizaciones de refuerzo sobre la tasa de respuestas directas no seguras.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden del panel de desarrollo autorado de 277 casos, expuesto durante experimentos previos. El autor advierte que no son resultados de benchmark independiente ni de leaderboard. Todos los casos se mantienen en el denominador de precisión y el piloto no presenta fallos de inferencia.

| Modelo | Rutas correctas | Precisión | Respuestas directas no seguras | Rutas directas erróneas |
|---|---:|---:|---:|---:|
| Decider padre sin cambios | 167/277 | 60,29% | 27 | 37 |
| Piloto de 60 actualizaciones | 231/277 | 83,39% | 8 | 11 |
| Ensayo más amplio de 120 actualizaciones | 249/277 | 89,89% | 18 | 20 |
| Comparador Laya existente | 249/277 | 89,89% | 14 | 19 |

El piloto mejora en 23,10 puntos porcentuales al padre y queda 6,50 puntos por debajo del comparador Laya. El ensayo amplio mejora 29,60 puntos sobre el padre e iguala la precisión de Laya, pero sus respuestas directas no seguras suben de 8 a 18 respecto al primer piloto; esa regresión de seguridad es la que bloquea su promoción a producción. Se define "unsafe direct choice" como una respuesta directa en un caso crítico de seguridad que exigiría escalado o recuperación. La precisión de enrutamiento no mide la calidad completa de una respuesta de D&D ni la seguridad en la ejecución de herramientas.

## Requisitos de hardware

- El autor documenta entrenamiento en CPU y un ejemplo de carga en CPU con `dtype=torch.bfloat16` y `use_graphs=False`, por lo que la inferencia no requiere GPU.
- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa no verificada para un modelo de ~2B en bfloat16, cabría esperar del orden de 4-6 GB de memoria, pero este dato no procede de la documentación del modelo.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; dado el tamaño aparente (~2B) sería plausible en GPU de consumo con memoria suficiente, pero no hay confirmación.
- Opciones de despliegue: paquete de inferencia `decider/` incluido en el directorio del modelo, con `from decider.infer import Decider`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible. El autor indica que las mediciones históricas de tiempo no constituyen una comparación de latencia controlada.

## Comparativa con modelos similares

| Modelo | Precisión en el panel (277 casos) | Respuestas directas no seguras | Estado | Licencia |
|---|---:|---:|---|---|
| Decider padre (Mapika/decider-2b) | 60,29% | 27 | Publicado | No disponible en esta ficha |
| Este piloto (60 actualizaciones) | 83,39% | 8 | Model card; pesos pendientes de subida | Apache 2.0 |
| Ensayo amplio (120 actualizaciones) | 89,89% | 18 | No promovido por regresión de seguridad | Apache 2.0 |
| Comparador Laya | 89,89% | 14 | Existente | No disponible en esta ficha |

La comparación se limita a la precisión de enrutamiento y a la tasa de respuestas directas no seguras sobre el mismo panel compartido. Los parámetros, la longitud de contexto y el rendimiento en otras tareas de estos modelos no están disponibles en la información proporcionada, por lo que no es posible una comparación más amplia.

## Limitaciones y advertencias

- Estado de publicación incompleto: la ficha indica "model card only" y que los pesos candidatos esperan acceso de subida; la disponibilidad real de los checkpoints no está garantizada.
- Sin aprobación para producción: el autor declara explícitamente que esta versión experimental no ha sido promovida a producción.
- Regresión de seguridad en la variante más precisa: el ensayo de 120 actualizaciones iguala en precisión al comparador Laya pero triplica con creces las respuestas directas no seguras (18 frente a 8), lo que impide su promoción.
- Defecto de entrenamiento detectado en auditoría: las 24 actualizaciones de refuerzo del ensayo amplio usaron solo casos `answer`; la variante corregida no tiene calidad verificada.
- Sesgos conocidos: no disponible.
- Riesgo de alucinación en la decisión: al devolver probabilidades, una clasificación errónea puede dirigir una consulta crítica a respuesta directa; el autor recomienda tratar la ruta como sugerencia sujeta a la política de la aplicación y a controles del operador.
- Cobertura de evaluación limitada: los resultados provienen de un panel de desarrollo ya expuesto, no de una evaluación independiente; la preservación de decisiones públicas y la evaluación de calidad independiente siguen abiertas.
- Idiomas: solo inglés declarado, sin soporte multilingüe verificado.
- Alcance funcional: no genera texto, no ejecuta herramientas y no administra infraestructuras por sí mismo; el chat general y la administración autónoma permanecen sin verificar, igual que la calidad de voz en producción.
- Trazabilidad: el release no incluye prompts privados, registros de entrenamiento en bruto ni configuración de infraestructura, lo que dificulta la reproducción completa.
- Licencia Apache 2.0: permite uso comercial, pero el paquete de inferencia upstream conserva su atribución y licencia propias, que deben respetarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/daviestechlabs/decider-2b-homelab-router
- Modelo base Mapika/decider-2b: https://huggingface.co/Mapika/decider-2b
- Interfaz upstream (revisión fijada `533964dae8be954c5b5e19fa4948e48408094c1e`): https://huggingface.co/Mapika/decider-2b/blob/533964dae8be954c5b5e19fa4948e48408094c1e/README.md#usage
