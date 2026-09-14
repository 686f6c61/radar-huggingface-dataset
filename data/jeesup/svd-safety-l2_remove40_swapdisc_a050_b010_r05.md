# Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r05

## Resumen

svd-safety-l2_remove40_swapdisc_a050_b010_r05 es un checkpoint derivado de meta-llama/Llama-2-7b-chat-hf comprimido mediante SVD-LLM hasta conservar el 59,98% de los parametros densos originales (se elimino el 40,02%). Sobre esa base comprimida se aplicaron 5 de las 10 rondas de un procedimiento de edicion de parametros denominado swap iterativo neutral respecto a parametros, seleccionado con la regla `disc_iter` y con un presupuesto de 0,1% de parametros densos por ronda. El resultado es un checkpoint intermedio de una ejecucion mas larga, no el estado final del experimento.

El modelo pertenece a un estudio sobre como la compresion por SVD degrada el comportamiento de seguridad de un modelo alineado y que regla de seleccion de componentes repara mejor ese dano. Por tanto, es un artefacto de investigacion: el propio autor advierte que varias ramas de la matriz experimental estan deliberadamente degradadas en seguridad respecto a Llama-2-7b-chat y que este checkpoint debe tratarse como sujeto experimental, no como asistente desplegable.

El checkpoint tiene 6.738.415.616 parametros segun los pesos safetensors (aproximadamente 6,74 mil millones) y ocupa 13,5 GB en el repositorio. Esta publicado bajo la licencia Llama 2 Community License y etiquetado para text-generation, compresion, seguridad e interpretabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (heredada de Llama-2-7b-chat), con proyecciones comprimidas por SVD-LLM y edicion posterior de parametros |
| Parametros totales | 6.738.415.616 (6,74 mil millones), equivalentes al 59,98% de la fraccion densa original |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el repositorio publica pesos densos en safetensors) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat, un transformer decoder-only. Sobre ella se aplico una compresion SVD-LLM que elimino el 40,02% de los parametros, dejando una fraccion densa resultante de 0,5998. El checkpoint no se reentreno desde cero: es un modelo base comprimido y despues editado.

La edicion consiste en 5 rondas (de un total de 10) de un swap iterativo neutral respecto a parametros, con la regla de seleccion `disc_iter`. En cada ronda se sustituyen componentes hasta un presupuesto del 0,1% de los parametros densos, con el valor de insercion `insert` (solo valor de insercion, con desalojo ordenado por sigma) y una escala de insercion de 0,5 (los componentes se anaden a esa fraccion de su fuerza). En total se restauraron 3082 componentes y se desalojaron otros 3082, con 32.353.280 parametros intercambiados (0,50% de los parametros de proyeccion densos). La semilla empleada fue 42. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento, el numero de tokens o el uso de RLHF/DPO.

## Capacidades

- Generacion de texto conversacional: hereda la naturaleza de chat del modelo base Llama-2-7b-chat.
- Comportamiento de rechazo ante peticiones daninas: el checkpoint presenta tasas de exito de ataque (ASR) medidas de 0,0365 en AdvBench y 0,0767 en StrongREJECT con el juez de HarmBench, lo que indica cierto grado de resistencia a instrucciones maliciosas.
- Utilidad conversacional general: limitada por la compresion y por la edicion de seguridad aplicada; el autor no garantiza un rendimiento de asistente general.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no disponibles; es un modelo exclusivamente de texto.

## Casos de uso

- Investigacion sobre compresion de modelos: sirve como celda concreta de una matriz experimental para medir como la compresion SVD afecta al comportamiento del modelo, comparando esta configuracion con otras reglas de seleccion y presupuestos.
- Estudio de seguridad y alineacion: permite cuantificar el dano en seguridad provocado por la compresion y evaluar si las rondas de swap restauran parte del comportamiento de rechazo, usando AdvBench y StrongREJECT como instrumentos de medida.
- Analisis de sobre-rechazo: con una tasa macro de sobre-rechazo de 0,2357 medida con WildGuard, es util para estudiar el equilibrio entre seguridad y utilidad (falsos rechazos) en modelos comprimidos.
- Interpretabilidad de componentes: el registro de que se restauraron y desalojaron 3082 componentes permite analizar que partes de la red concentran la funcion de seguridad.
- Reproduccion experimental: la semilla 42 y los parametros documentados (presupuesto, escala de insercion, valor `insert`) facilitan replicar el experimento y verificar resultados.
- Baseline de referencia en estudios de compresion: al ser un checkpoint intermedio de una ejecucion mas larga, sirve para comparar el efecto de aplicar 5 rondas frente a las 10 completas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0365 |
| StrongREJECT ASR (juez HarmBench) | 0,0767 |
| Macro sobre-rechazo (WildGuard) | 0,2357 |

No se han publicado en la informacion disponible comparaciones de estas metricas frente al modelo base sin comprimir ni frente a otras celdas de la matriz experimental.

## Requisitos de hardware

- VRAM estimada para inferencia (valores estimados a partir del numero de parametros, no confirmados por el autor):
  - BF16/FP16: aproximadamente 13,5 GB de pesos, mas overhead de activaciones y cache KV (en torno a 14-16 GB).
  - INT8: aproximadamente 6,7 GB de pesos.
  - INT4: aproximadamente 3,4 GB de pesos.
- GPU recomendadas: A100 (40/80 GB) y H100 para despliegue en BF16 sin restricciones; RTX 4090 o RTX 3090 (24 GB) pueden alojar el modelo en BF16 con margen limitado segun la longitud de contexto y el tamano de lote.
- Si cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 3090, RTX 4090) en BF16 con lotes pequenos, y con holgura en cuantizacion INT8/INT4.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM. Para llama.cpp u Ollama seria necesario convertir los pesos safetensors a GGUF, conversion no documentada en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2_remove40_swapdisc_a050_b010_r05 | 6,74 mil millones (59,98% de la fraccion densa) | no disponible | Llama 2 Community License | Checkpoint comprimido y editado, con ASR medido en AdvBench y StrongREJECT |
| meta-llama/Llama-2-7b-chat-hf | aproximadamente 7 mil millones | no disponible en la informacion | Llama 2 Community License | Modelo base sin comprimir; su rendimiento de seguridad en las mismas metricas no se aporta |
| Otras celdas de la matriz experimental del mismo autor | no disponible | no disponible | Llama 2 Community License | El autor indica que varias ramas estan deliberadamente degradadas en seguridad |

No se dispone de resultados comparativos cuantitativos entre este checkpoint y el modelo base u otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente que no es un modelo de chat de proposito general y que debe tratarse como sujeto experimental.
- Seguridad degradada: la compresion por si sola eleva la tasa de exito de ataques, y algunas ramas del experimento estan deliberadamente degradadas; este checkpoint concreto presenta ASR de 0,0365 (AdvBench) y 0,0767 (StrongREJECT), valores que deben interpretarse con cautela y no como una garantia de robustez.
- Sobre-rechazo: la tasa macro de sobre-rechazo de 0,2357 indica una fraccion relevante de rechazos a peticiones legitimas, con impacto negativo en utilidad.
- Checkpoint intermedio: solo se aplicaron 5 de las 10 rondas de swap; el comportamiento puede diferir del estado final de la ejecucion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero presumiblemente afectado por la compresion.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada.
- Restricciones de licencia: se rige por la Llama 2 Community License; el repositorio incluye `LICENSE.txt` y `USE_POLICY.md`, y el uso de este derivado queda vinculado a ambos documentos. Es obligatorio revisar las condiciones de uso comercial antes de cualquier despliegue.
- Ausencia de adopcion: el repositorio registra 0 descargas y 0 likes, por lo que no hay evidencia de uso en produccion.
- Sesgos: no documentados en la informacion proporcionada; al derivar de Llama-2-7b-chat, pueden heredarse los sesgos del modelo base.

## Enlaces

- Pagina de HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove40_swapdisc_a050_b010_r05
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
