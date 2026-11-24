# novyn/novyn-looped-decider-v0_9

## Resumen

Novyn Looped Decider v0.9 es un modelo de decisión de pesos abiertos publicado por el usuario novyn en Hugging Face. No es un modelo generativo al uso: se trata de una cabeza de clasificación (head) entrenada mediante fine-tuning sobre el modelo base thinkingmachines/TML-d24-varloop-research, un transformer con decodificación en bucle (looped decoding) desarrollado por Thinking Machines Lab. El repositorio contiene únicamente la cabeza de clasificación y el cliente de inferencia; los pesos del modelo base deben cargarse por separado.

El modelo resuelve un problema concreto: convertir un estado (texto, objeto JSON o lista) en respuestas estructuradas a preguntas tipadas (elección entre opciones, probabilidad booleana o puntuación ordinal), devolviendo probabilidades por opción y un valor de confianza. Está pensado para sistemas de enrutamiento, clasificación y decisión automatizada donde se necesita una salida interpretable y calibrada en lugar de texto libre.

Es relevante ahora porque, según la model card, alcanza un 90,91% de acierto en el conjunto público de desarrollo JevBench (231 casos), empatando con Liquid d1.2 Ultra y superando a Jev 1.14, Perplexity Decider v1.3 y GPT-6 Luna Decisions. Además, reporta una latencia mediana de 62,82 ms en cuatro NVIDIA H200 con caché de prompt limpiada entre peticiones. La información disponible sobre arquitectura interna, tamaño total y contexto del modelo base es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza de clasificación lineal (255 × 2.304, FP32, sin bias) sobre modelo base transformer con decodificación en bucle (TML-d24-varloop-research) |
| Parametros totales | No disponible (solo se documentan 587.520 parámetros de la cabeza; los del modelo base no se detallan) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada de texto (límite del cliente) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible para el repositorio; el modelo base es Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un modelo base de Thinking Machines Lab (TML-d24-varloop-research), descrito como un transformer con decodificación en bucle de diez pasadas, con una cabeza de clasificación lineal congelada en el base y entrenada por fine-tuning. La cabeza tiene 587.520 parámetros (255 × 2.304) en FP32 y sin término de bias, lo que sugiere una proyección directa desde el estado oculto del modelo base (dimensión 2.304) hacia 255 posibles salidas.

El flujo de inferencia requiere arrancar el modelo base con SGLang en modo de captura del último estado (LAST-state capture) y conectar el cliente `looped_decider` al endpoint resultante. Cada pregunta se procesa de forma independiente sobre el mismo estado, y las opciones se evalúan preservando el orden definido por el usuario. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset de fine-tuning ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Clasificación por elección: selección entre 2 y 255 opciones nombradas con descripciones, devolviendo el nombre elegido, probabilidades por opción y confianza.
- Preguntas booleanas (`noul`): probabilidad de verdadero entre 0 y 1, con descripciones opcionales para falso y verdadero.
- Puntuación ordinal (`score`): entre 2 y 255 niveles descritos de menor a mayor, devolviendo nivel esperado (con posibilidad de valores fraccionarios), probabilidades, leyenda y confianza.
- Entrada multimodal de estado: acepta texto, objetos JSON o listas como estado de decisión.
- Procesamiento multi-pregunta: varias preguntas sobre el mismo estado, cada una evaluada de forma independiente.
- Salida calibrada: la confianza se define como la probabilidad de la opción más probable.
- Sin soporte documentado de tool calling, agentes, generación de texto libre ni visión.

## Casos de uso

- Enrutamiento de tickets de soporte: clasificar una reclamación entrante entre equipos (devoluciones, envíos, facturación) usando preguntas de tipo `choice` con descripciones por equipo, tal como muestra el ejemplo de la model card.
- Detección de intención de reembolso: usar una pregunta `noul` para estimar la probabilidad de que el cliente solicite un reembolso, permitiendo umbrales ajustables en el flujo de atención al cliente.
- Triaje de severidad: puntuar la gravedad de un problema de producto en una escala ordinal (`score`) con niveles descritos, útil para priorizar colas de incidencias.
- Moderación y clasificación de contenido: evaluar textos o estructuras JSON contra categorías predefinidas con probabilidades por clase, facilitando auditoría y revisión humana.
- Extracción de decisiones en pipelines ETL: procesar registros JSON y asignar etiquetas o puntuaciones normalizadas antes de persistirlos en un almacén de datos.
- Sistemas de decisión de baja latencia: con una mediana de 62,82 ms en H200, encaja en servicios síncronos de clasificación donde se requiere respuesta casi instantánea.
- Enrutamiento de consultas en asistentes conversacionales: decidir a qué subsistema derivar una petición (base de conocimiento, agente de facturación, escalado humano) mediante preguntas de elección múltiple.
- Evaluación comparativa de políticas: puntuar alternativas de respuesta o acciones en un entorno de simulación usando la salida probabilística como función de recompensa auxiliar.

## Benchmarks y rendimiento

Resultados en el conjunto público de desarrollo JevBench (231 casos), con los mismos ficheros de tarea y scorer:

| Modelo | Aciertos | Precisión |
|---|---:|---:|
| Looped Decider | 210/231 | 90,91% |
| Liquid d1.2 Ultra | 210/231 | 90,91% |
| Jev 1.14 | 209/231 | 90,48% |
| Perplexity Decider v1.3 | 208/231 | 90,04% |
| GPT-6 Luna Decisions | 207/231 | 89,61% |
| Liquid d1.2 | 205/231 | 88,74% |
| Jev 1.13 | 200/231 | 86,58% |

Latencia medida en 1.000 peticiones seriales sobre cuatro NVIDIA H200, modelo caliente y caché de prompt limpiada entre peticiones, incluyendo tokenización, HTTP local e inferencia:

| Medida | Tiempo |
|---|---:|
| Mediana | 62,82 ms |
| Media | 100,14 ms |
| p95 | 238,65 ms |
| p99 | 332,85 ms |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el modelo base; la cabeza ocupa apenas unos megabytes (587.520 parámetros en FP32).
- GPU recomendadas: la medición de latencia se realizó en cuatro NVIDIA H200; no se documentan requisitos mínimos ni resultados en GPU de consumo.
- GPU de consumo: no disponible; al depender de un modelo base de tamaño no especificado, no se puede confirmar que quepa en RTX 4090, RTX 3090 u otras.
- Despliegue: el modelo base debe servirse con SGLang en modo de captura del último estado, y el cliente `looped_decider` se instala con `pip install ./source` y se conecta al endpoint HTTP (por defecto `http://127.0.0.1:30112`).
- Latencia y throughput: mediana de 62,82 ms y p99 de 332,85 ms por petición serial en H200; el throughput agregado no se documenta.

## Comparativa con modelos similares

| Modelo | JevBench (aciertos) | Precisión | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| Novyn Looped Decider v0.9 | 210/231 | 90,91% | No disponible (base Apache 2.0) | Pesos abiertos en Hugging Face |
| Liquid d1.2 Ultra | 210/231 | 90,91% | No disponible | No disponible |
| Jev 1.14 | 209/231 | 90,48% | No disponible | No disponible |
| Perplexity Decider v1.3 | 208/231 | 90,04% | No disponible | No disponible |
| GPT-6 Luna Decisions | 207/231 | 89,61% | No disponible | No disponible |

No se dispone de datos de parámetros, contexto ni latencia de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El repositorio contiene solo la cabeza de clasificación y el cliente; requiere descargar y servir por separado el modelo base thinkingmachines/TML-d24-varloop-research, lo que añade complejidad operativa.
- La licencia del repositorio no está disponible; solo se indica que el modelo base es Apache 2.0. Verificar los términos antes de uso comercial.
- Idiomas soportados no documentados; no se puede garantizar comportamiento en castellano ni en otros idiomas.
- El conjunto de evaluación JevBench es un conjunto público de desarrollo de 231 casos; los resultados pueden no generalizar a dominios distintos.
- El cliente limita la entrada de texto a 8.192 tokens; estados más largos requieren truncado o troceado externo.
- Cada pregunta se procesa de forma independiente sobre el mismo estado, sin razonamiento multi-paso entre preguntas.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser una cabeza de clasificación, el riesgo se traslada a etiquetas mal asignadas con confianza alta.
- Las latencias reportadas corresponden a cuatro H200 con caché de prompt limpiada; en hardware inferior el rendimiento puede degradarse significativamente.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, y el repositorio aparece con tamaño de 0,0 GB; conviene verificar la integridad de los artefactos antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/novyn/novyn-looped-decider-v0_9
- Modelo base: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Guía del cliente: `source/README.md` dentro del repositorio
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.
