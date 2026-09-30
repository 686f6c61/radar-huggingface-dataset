# MachineFi/Trio-Spark-v1.0

## Resumen

Trio-Spark v1.0 es un modelo de decisión desarrollado por MachineFi Labs (MachineFi), presentado como su primer «Situated World Model»: un sistema que recibe el estado estructurado de un entorno concreto junto con un conjunto acotado de 2 a 8 movimientos legales y devuelve, en una sola pasada, el movimiento seleccionado y una probabilidad para cada opción. No es un modelo generativo de propósito general ni un agente completo: cubre únicamente el paso de juicio acotado dentro de un bucle en el que la aplicación aporta el estado, las acciones permitidas, el ejecutor y los controles de seguridad.

El modelo no se distribuye como pesos abiertos. El repositorio de HuggingFace actúa como punto de entrada a un servicio alojado: el identificador público de la API es `trio-spark-preview`, mientras que Trio-Spark v1.0 es la versión de producto. El código de los clientes y las demos del repositorio público de GitHub se publica bajo Apache-2.0, pero esa licencia no cubre los pesos ni los artefactos de entrenamiento.

Su relevancia está en el nicho de las decisiones frecuentes y de baja latencia sobre un conjunto de acciones definido por la aplicación: enrutado, selección de herramientas, elección de acciones de interfaz gráfica, movimientos de juego, habilidades robóticas y control operativo. El autor publica evidencias de ejecución real con dron autónomo, agente de navegador y brazo robótico, además de una evaluación inicial sobre cuatro conjuntos de datos públicos de clasificación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no publica detalles de arquitectura) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible; no se ha confirmado que sea un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos no se distribuyen, solo se accede vía API alojada |
| Idiomas soportados | no disponible (la model card no declara idiomas y la etiqueta de HuggingFace no los especifica) |
| Licencia | other; la API es un servicio comercial alojado y los clientes del repositorio público usan Apache-2.0 |
| Formato de pesos | no disponible; los pesos y el código de entrenamiento no se distribuyen desde el repositorio |
| Entrada | estado estructurado del entorno más 2-8 opciones con identificador y descripción |
| Salida | `choice_id`, distribución completa de probabilidad, confianza, uso y latencia |
| Tarea declarada en HuggingFace | text-classification |
| Biblioteca | custom |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el número de parámetros, la composición del conjunto de datos de entrenamiento, el número de tokens utilizados ni si hubo fases de RLHF o DPO. La model card únicamente describe el comportamiento del sistema: dado un estado estructurado y un conjunto acotado de movimientos permitidos, el modelo produce una decisión en una sola pasada, acompañada de la distribución de probabilidad sobre todas las opciones y una medida de confianza. El propio autor enmarca el sistema como un «Situated World Model», es decir, un modelo especializado en un entorno concreto en lugar de un modelo generalista.

La información publicada tampoco detalla innovaciones técnicas internas como decodificación especulativa, atención lineal u otras optimizaciones. Lo que sí se documenta es el patrón de integración: la aplicación construye el estado, filtra las acciones legales, ejecuta la acción elegida y realimenta el bucle con señales frescas del entorno. Los ejemplos medidos del autor aclaran explícitamente que las demos envían señales estructuradas del entorno y que no se reclama control directo a partir de píxeles crudos.

## Capacidades

- Decisión de un solo paso sobre un conjunto acotado de 2 a 8 opciones, con devolución del identificador de la opción elegida.
- Distribución completa de probabilidad sobre todas las opciones, más un valor de confianza asociado a la decisión.
- Clasificación de texto: el pipeline declarado en HuggingFace es `text-classification` y la evaluación de lanzamiento se hizo sobre tareas de clasificación.
- Integración en bucles de agente con realimentación: el estado se actualiza tras cada movimiento ejecutado.
- Casos de aplicación citados por el autor: enrutado, selección de herramientas, elección de acciones de interfaz gráfica, movimientos de juego, habilidades robóticas y control operativo.
- Modo de invocación idempotente mediante cabecera `Idempotency-Key` en la API, con devolución de métricas de uso y latencia en la respuesta.
- No hay soporte declarado de generación de texto libre, razonamiento multi-paso autónomo, visión directa sobre píxeles, audio ni tool calling generativo.

## Casos de uso

- Enrutado de peticiones y selección de herramientas en agentes de software: el modelo recibe el estado de la conversación y la lista de herramientas disponibles como opciones, y devuelve cuál invocar con su probabilidad asociada; la distribución permite aplicar umbrales de confianza antes de ejecutar.
- Agentes de navegador y automatización de interfaz gráfica: la evidencia publicada incluye un agente de navegador que completó una selección de artículo en 4,002 s con 3 llamadas y terminación autónoma `DONE`, lo que encaja con flujos de elección de acción sobre elementos ya estructurados.
- Control operativo de maquinaria industrial: con señales como temperatura, carga y vibración, y opciones del tipo continuar, reducir velocidad o parar, el modelo emite la decisión y su confianza para que la capa de aplicación aplique los enclavamientos de seguridad.
- Robótica de manipulación: la demo de brazo robótico reporta 13,68 s, 13 llamadas, éxito físico y 0 contactos prohibidos, un patrón válido para seleccionar habilidades discretas a partir de estado de sensores en lugar de control continuo.
- Vehículos autónomos acotados: la demo de dron reporta 65 s, 25 llamadas, 75,7 m volados, 0 colisiones y curso completado, aplicable a bucles de decisión discreta supervisados por el planificador de vuelo.
- Agentes de juego por turnos: cada turno se envía el estado del tablero con los movimientos legales y el modelo devuelve la jugada; el límite de 2 a 8 opciones encaja con conjuntos de acciones acotados por turno.
- Clasificación y moderación de contenido: el modelo puede emplearse como clasificador sobre textos cortos, con las precisiones publicadas en SST-2, AG News, TweetEval y PubMedQA, y con la ventaja de exponer la distribución de probabilidad en lugar de una única etiqueta.
- Investigación en evaluación de agentes y world models: el autor mantiene por separado un adaptador para JevBench y una solicitud de evaluación independiente sobre conjunto sellado, todavía sin resultado oficial declarado.

## Benchmarks y rendimiento

Evaluación de lanzamiento sobre la API de producción, según la model card del autor:

| Benchmark | Tipo de tarea | Accuracy |
|---|---|---:|
| SST-2 | Análisis de sentimiento binario | 92,89 % |
| AG News | Clasificación de noticias en 4 categorías | 88,46 % |
| PubMedQA | Preguntas biomédicas | 85,33 % |
| TweetEval | Clasificación de tweets | 80,58 % |

Evidencias de ejecución publicadas en el repositorio de demos:

| Entorno | Resultado medido |
|---|---|
| Dron autónomo | 65 s, 25 llamadas, 75,7 m volados, 0 colisiones, curso completado |
| Agente de navegador | 4,002 s, 3 llamadas, artículo solicitado seleccionado, `DONE` autónomo |
| Brazo robótico | 13,68 s, 13 llamadas, éxito físico, 0 contactos prohibidos |

No se declara ninguna puntuación oficial en JevBench: el adaptador y la solicitud de evaluación sobre conjunto sellado se mantienen por separado y la model card indica explícitamente que no se reclamará resultado hasta que esa evaluación concluya. Las cifras de los entornos medidos corresponden a bucles completos de ejecución, no exclusivamente al tiempo de cómputo del modelo.

## Requisitos de hardware

- No aplicable para inferencia local: los pesos no se distribuyen, por lo que no existe una estimación de VRAM publicada ni una ruta de despliegue en hardware propio.
- Acceso exclusivamente mediante API alojada en `https://platform.machinefi.com/api/spark/v1/decisions`, con clave de API emitida desde la consola del producto.
- No hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF o safetensors.
- El repositorio público de GitHub (Apache-2.0) contiene clientes, integraciones de demo y evidencias reproducibles, no artefactos de modelo.
- Latencia y throughput del modelo: no disponibles como cifras aisladas. La respuesta de la API incluye un campo de latencia, pero no se publica un valor agregado. Las cifras de los entornos medidos (4,002 s para 3 llamadas en el agente de navegador; 65 s para 25 llamadas en el dron; 13,68 s para 13 llamadas en el brazo robótico) corresponden al bucle completo, incluido el ejecutor.
- La API devuelve además métricas de uso por llamada, útil para planificación de coste y de cuota.

## Comparativa con modelos similares

No se dispone de datos que permitan establecer una comparación cuantitativa con alternativas de la misma categoría, porque la información proporcionada no incluye cifras de modelos competidores.

| Aspecto | Trio-Spark v1.0 | Alternativas comparables |
|---|---|---|
| Categoría | Modelo de decisión para world models situados | no disponible |
| Parámetros | no disponible | no disponible |
| Longitud de contexto | no disponible | no disponible |
| Rendimiento publicado | SST-2 92,89 %, AG News 88,46 %, PubMedQA 85,33 %, TweetEval 80,58 % | no disponible |
| Licencia | other; API comercial alojada, clientes Apache-2.0 | no disponible |
| Disponibilidad | solo API, sin pesos | no disponible |

Como referencia dentro del mismo proveedor, la plataforma describe una cadena de componentes complementarios y no equivalentes: Trio-Retina para percepción, Trio-Lumen para comprensión y Trio-Spark para decisión. No son alternativas al modelo evaluado, sino partes de una misma arquitectura de producto. No se conocen, en la información disponible, modelos comparables de decisión situada con datos públicos de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado ninguna evaluación de sesgo, equidad o toxicidad del modelo.
- Riesgo de alucinación: no aplica en el sentido generativo, porque el modelo no produce texto libre; el riesgo equivalente es una selección de acción incorrecta o una confianza mal calibrada, que el autor traslada a la capa de aplicación.
- El modelo no debe usarse como controlador de seguridad autónomo: el autor indica que debe situarse detrás de validación a nivel de aplicación y que el llamante sigue siendo responsable del filtrado de acciones legales, los permisos, las salvaguardas de ejecución y el comportamiento de respaldo.
- El conjunto de opciones está limitado a 2-8 movimientos por llamada, lo que restringe su uso en espacios de acción grandes o continuos.
- No se declara ningún idioma soportado, por lo que la cobertura multilingüe es desconocida.
- No se puede auditar ni reproducir el modelo: no hay pesos, no hay código de entrenamiento y no hay detalle de dataset, por lo que no es posible una evaluación independiente sobre el modelo en sí.
- Las demos del autor parten de señales estructuradas del entorno y no de píxeles crudos; emplear el sistema esperando percepción visual directa sería un uso incorrecto.
- Licencia: la API es un servicio comercial alojado. La licencia Apache-2.0 del repositorio público cubre únicamente los clientes y las integraciones de demo, no los pesos ni los artefactos de entrenamiento. El uso comercial del modelo requiere acceso a la API en las condiciones del proveedor.
- Riesgo de dependencia de proveedor: al no existir pesos, no hay alternativa de despliegue propio ante cambios de precio, cuota, disponibilidad o discontinuación del servicio.
- Las cifras de benchmarks publicadas proceden del propio autor y se midieron contra la API de producción; no se ha completado una evaluación sobre conjunto sellado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MachineFi/Trio-Spark-v1.0
- Repositorio de clientes y demos: https://github.com/machinefi/trio-spark
- Organización de MachineFi Labs en GitHub: https://github.com/machinefi
- Post de lanzamiento: https://machinefi.com/blog/trio-spark-decisions-single-pass
- Playground: https://platform.machinefi.com/spark
- Documentación de la API: https://platform.machinefi.com/spark/docs
- Consola de claves de API: https://platform.machinefi.com/spark/keys
- Plataforma de Trio: https://platform.machinefi.com/
- Web de MachineFi Labs: https://machinefi.com/
- Technical paper de Trio: https://machinefi.com/technical-paper
