# Myungkyu/pi0_5_rmbench_preset_luna_b64_60k

## Resumen

pi0_5_rmbench_preset_luna_b64_60k es un modelo de política robótica de bajo nivel (low-level policy) desarrollado por el usuario Myungkyu y publicado en HuggingFace. Se trata de un fine-tuning de lerobot/pi05_base sobre el dataset Myungkyu/RMBench-preset-luna, compuesto por demostraciones con etiquetas densas de subtareas. Su propósito es resolver las 9 tareas de manipulación de sobremesa simuladas que define el benchmark RMBench, recibiendo como entrada imágenes de tres cámaras, propiocepción y el texto de la subtarea actual.

El modelo pertenece a la familia Pi0.5, una arquitectura visión-lenguaje-acción (VLA) que combina percepción visual multi-cámara con instrucciones en lenguaje natural para emitir acciones motoras. Cuenta con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) en formato safetensors, con un repositorio de 9,4 GB. La innovación más destacable de esta variante es la inclusión de una ranura de keyframe (keyframe slot) que recupera un fotograma pasado cuando la etiqueta de subtarea lo requiere, implementando la convención de memoria full_frame_v1.

El entrenamiento se realizó con un optimizador de batch 64 durante 60.000 pasos, y el repositorio contiene el checkpoint final. Es relevante ahora porque ilustra el patrón actual de especialización de modelos VLA generalistas mediante fine-tuning con datos etiquetados a nivel de subtarea, un enfoque que mejora el control en tareas de horizonte largo frente a políticas entrenadas solo con la instrucción global. No obstante, se trata de un modelo con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin resultados de benchmarks publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pi0.5 (modelo visión-lenguaje-acción); backbone y tokenizer heredados de lerobot/pi05_base |
| Parametros totales | 4.143.404.816 (aproximadamente 4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las entradas incluyen texto de subtarea en lenguaje natural, pero no se especifican idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | Myungkyu/RMBench-preset-luna |
| Tarea (pipeline) | robotics |
| Tamano del repositorio | 9,4 GB |
| Fecha de creacion | 2026-09-14 |
| Fecha de actualizacion | 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a Pi0.5, un modelo de política VLA. Según la model card, el modelo procesa tres vistas de cámara (cabeza y muñecas izquierda y derecha), propiocepción y el texto de la subtarea actual. Además, incorpora una ranura adicional de keyframe que, cuando la etiqueta de subtarea lo indica, se rellena con un fotograma pasado recuperado; esta convención de contenido de memoria se denomina full_frame_v1. No se dispone de información sobre el número de capas, dimensión oculta, mecanismo de atención ni tipo de codificador visual más allá de lo indicado.

El entrenamiento consistió en un fine-tuning supervisado desde lerobot/pi05_base sobre el dataset Myungkyu/RMBench-preset-luna, que contiene demostraciones con etiquetas densas de subtareas procedentes del preset de subtareas. Se utilizó un batch de 64 durante 60.000 pasos, y el repositorio publica el checkpoint final. No se especifica en la información disponible si hubo etapas de RLHF, DPO u otras optimizaciones posteriores al ajuste supervisado, ni el número total de tokens o episodios vistos durante el entrenamiento.

## Capacidades

- Generación de acciones motoras para manipulación robótica de sobremesa en entornos simulados, concretamente las 9 tareas de RMBench.
- Percepción visual multi-cámara: consume simultáneamente imágenes de una cámara de cabeza y de dos cámaras de muñeca (izquierda y derecha).
- Integración de propiocepción como entrada adicional al flujo visual y textual.
- Condicionamiento por texto de subtarea: la política recibe la subtarea actual como instrucción, lo que permite descomponer una tarea de horizonte largo en pasos.
- Memoria por keyframe: la ranura adicional puede recuperar un fotograma pasado cuando la etiqueta de subtarea lo requiere, bajo la convención full_frame_v1.
- Fine-tuning adicional: al estar construido sobre lerobot/pi05_base y usar la librería LeRobot, es susceptible de reentrenarse sobre nuevos datasets de demostraciones.
- No se ha documentado soporte de tool calling, function calling ni capacidades de agente multi-paso en el sentido de los modelos de lenguaje.
- No se han documentado capacidades multilingües, de visión general, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Evaluación de referencia en RMBench: el checkpoint final puede emplearse como política de bajo nivel para obtener una línea base en las 9 tareas simuladas de sobremesa, comparando configuraciones de memoria (con y sin keyframe) frente a otras políticas.
- Investigación en condicionamiento por subtareas: al haberse entrenado con etiquetas densas de subtarea, permite estudiar si la instrucción textual a nivel de subtarea mejora la tasa de éxito frente a políticas condicionadas solo por la instrucción global.
- Ablación de la ranura de keyframe: la convención full_frame_v1 habilita experimentos controlados sobre cuándo y cómo se recupera un fotograma pasado, aislando el efecto de la memoria visual en tareas que requieren recordar estados previos.
- Reentrenamiento sobre demostraciones propias: mediante LeRobot, el modelo puede ajustarse con nuevos datasets de teleoperación manteniendo el mismo esquema de entradas (tres cámaras, propiocepción y texto), lo que sirve para adaptar la política a una celda de trabajo distinta.
- Generación de datos de evaluación sintéticos: la política puede ejecutarse en bucle para producir rollouts en simulación, útiles para analizar modos de fallo, distribución de acciones o sensibilidad a la posición inicial.
- Estudio de transferencia simulación a realidad: como política entrenada en simulación, es un punto de partida para investigar técnicas de adaptación de dominio antes de desplegar en hardware físico, aunque no hay evidencia publicada de dicha transferencia para este checkpoint.
- Comparativa de arquitecturas VLA: dado su tamaño de 4,14 mil millones de parámetros, sirve como punto de comparación de coste computacional frente a políticas VLA de mayor tamaño en tareas de manipulación equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito por tarea, ni métricas de RMBench, ni comparaciones numéricas con otras políticas. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 4.143.404.816 parámetros: aproximadamente 16,6 GB en fp32, 8,3 GB en bf16/fp16 y 4,1 GB en int8. Son estimaciones aritméticas, no cifras publicadas por el autor.
- A esas cifras hay que añadir el coste de activaciones y de los codificadores visuales, que procesan tres vistas de cámara simultáneamente más un posible fotograma de keyframe; el consumo real será superior al de los pesos solos.
- GPU recomendadas: no disponible. No se especifica en la información proporcionada ningún modelo de GPU validado por el autor.
- Viabilidad en GPU de consumo: no disponible. No hay confirmación de que el modelo se haya ejecutado en tarjetas tipo RTX 4090 o similares; en bf16 los pesos cabrían en tarjetas de 24 GB, pero el margen para activaciones y buffers sería ajustado y no está verificado.
- Opciones de despliegue: la librería declarada es LeRobot. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y estos motores no son aplicables de forma estándar a una política VLA que emite acciones en lugar de tokens de texto.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos numéricos de modelos comparables en la información proporcionada. La única referencia verificable es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Licencia | Relacion |
|---|---|---|---|---|
| pi0_5_rmbench_preset_luna_b64_60k | 4.143.404.816 | no disponible | no disponible | Fine-tuning especializado en RMBench con memoria de keyframe |
| lerobot/pi05_base | no disponible | no disponible | no disponible | Modelo base sobre el que se aplica el fine-tuning |
| Otras politicas VLA de la misma categoria (por ejemplo OpenVLA u otras variantes Pi0) | no disponible | no disponible | no disponible | No hay datos en la informacion disponible para establecer una comparacion |

## Limitaciones y advertencias

- Ámbito restringido: es una política de bajo nivel entrenada específicamente para las 9 tareas de sobremesa simuladas de RMBench; no es un modelo de propósito general ni un modelo de lenguaje conversacional.
- Sin licencia declarada: la ausencia de licencia impide determinar si el uso comercial está permitido. Debe aclararse con el autor antes de cualquier despliegue productivo.
- Configuración dependiente de rutas locales: la propia model card advierte de que las configuraciones referencian el backbone y el tokenizer base mediante identificador de hub o mediante una ruta local del sitio de entrenamiento, por lo que hay que apuntarlas a copias locales antes de cargar el modelo. Esto puede provocar fallos de carga si no se corrige.
- Sin benchmarks publicados: no hay tasas de éxito ni métricas verificables, por lo que el rendimiento real en las tareas objetivo es desconocido.
- Riesgo de sobreajuste al entorno simulado: al entrenarse sobre un dataset de simulación con un preset concreto de subtareas, el comportamiento fuera de esa distribución (posiciones iniciales, iluminación, objetos nuevos) no está caracterizado.
- Dependencia del etiquetado de subtareas: el condicionamiento por subtarea implica que una segmentación incorrecta o ausente en tiempo de inferencia puede degradar el comportamiento, ya que la política espera recibir la subtarea actual como entrada.
- Sesgos: no se ha publicado ningún análisis de sesgos, y en el caso de políticas robóticas los sesgos relevantes serían de distribución de escenas, objetos y trayectorias, no evaluados aquí.
- Riesgo de alucinación en el sentido de los modelos de lenguaje: no aplica directamente, pero sí existe el riesgo análogo de generar acciones plausibles pero incorrectas cuando el estado observado queda fuera de la distribución de entrenamiento.
- Sin datos de idiomas: se desconoce en qué idioma o idiomas se formularon las etiquetas de subtarea del dataset, lo que condiciona el texto que puede recibir el modelo.
- Madurez: 0 descargas y 0 likes, publicaciones de creación y actualización con dos minutos de diferencia, sin documentación adicional. Debe tratarse como un artefacto de investigación no validado.
- Búsqueda web sin resultados útiles: las consultas realizadas devolvieron únicamente páginas de apuestas deportivas sin relación con el modelo, por lo que no se ha podido corroborar información externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Myungkyu/pi0_5_rmbench_preset_luna_b64_60k
- Dataset de entrenamiento: https://huggingface.co/datasets/Myungkyu/RMBench-preset-luna
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Librería LeRobot: https://github.com/huggingface/lerobot
- Paper de Pi0.5, repositorio de RMBench y demos: no disponibles en la información proporcionada. La búsqueda web no devolvió resultados relevantes sobre este modelo.
