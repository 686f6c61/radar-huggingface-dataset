# Cosmos-Data/cosmos-libero-baseline4k-filtered-round1-tbal-5to1-plus600

## Resumen

Cosmos3 baseline4k +600 es un checkpoint de inferencia publicado por Cosmos-Data dentro del ecosistema Cosmos3, orientado a robótica y etiquetado por el autor como cosmos3_omni. El modelo tiene 15.173.136.576 parámetros (unos 15,17 mil millones), se distribuye en safetensors con un repositorio de 30,3 GB y declara el pipeline de robotics junto con feature-extraction.

El checkpoint se construye a partir del baseline Full-FT entrenado solo con LIBERO40 durante 4000 pasos, al que se añaden 600 pasos de ajuste fino con 458 vídeos OOD autogenerados y filtrados automáticamente en proporción 5:1. La model card lo posiciona explícitamente como un guardado intermedio de un objetivo de entrenamiento de 3000 pasos, y aclara que no procede de Cosmos3-Nano, ni del conjunto de 142 vídeos seleccionados manualmente, ni de la segunda ronda de recolección.

Su interés práctico es doble: sirve como artefacto reproducible para medir generalización fuera de distribución en las suites LIBERO (Spatial, Object, Goal y LIBERO-10), y documenta una receta de curado automático de datos sintéticos para modelos de mundo con supervisión conjunta de vídeo y acción. El rendimiento dentro de distribución es alto (95,50% global), mientras que el OOD cae al 22,67% global, con un 0,00% en Object OOD.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | cosmos3_omni (etiqueta del autor); detalles internos no disponibles |
| Parámetros totales | 15.173.136.576 |
| Parámetros activos | No aplica según la información disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible; cada muestra usa 17 fotogramas de vídeo y 16 pasos de acción a 20 FPS |
| Tipos de cuantización | No disponible; los pesos se publican en safetensors sin detallar dtype |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repartidos en shards), con custom_code |
| Librería | transformers |
| Tamaño del repositorio | 30,3 GB |
| Vistas de entrada | Vista de agente y vista de muñeca (agent + wrist views) |
| VAE asociada | Wan2.2 VAE (activos separados del checkpoint) |

## Arquitectura y entrenamiento

La etiqueta principal del repositorio es cosmos3_omni, con la marca adicional custom_code, lo que implica que la carga del modelo requiere código propio del autor y no una clase estándar de transformers. La model card no describe la topología interna (número de capas, tipo de atención, dimensión oculta), por lo que no es posible confirmar si se trata de un transformer denso, un MoE o una arquitectura híbrida. Lo que sí queda documentado es su naturaleza multimodal vídeo-acción: el modelo consume 17 fotogramas de vídeo y predice 16 pasos de acción, a 20 FPS, con las vistas de agente y muñeca como entradas, y utiliza la VAE Wan2.2 como componente de codificación visual.

El entrenamiento se realizó en cuatro GPU B200 con empaquetado de secuencias de capacidad 256 por GPU, acumulación de gradiente 2 y un objetivo de batch global de 2048. Se usó una tasa de aprendizaje de 5e-5, warmup de 500 pasos y ciclo de 16000. El régimen de datos es mixto: el conjunto ID cubre las 40 tareas de Spatial, Object, Goal y LIBERO-10 con muestreo uniforme por ventana dentro de cuatro suites de igual peso, mientras que el conjunto OOD está balanceado por tarea y también muestreado uniformemente por ventana. La supervisión ID mantiene conjuntamente pérdida de vídeo y de acción, mientras que el OOD contribuye únicamente con pérdida de vídeo. Las cabezas de acción entrenadas se preservaron íntegramente desde el baseline de 4000 pasos, y este nuevo ajuste reinicia optimizador, scheduler e iteración en lugar de heredar el estado previo. Los 809 tensores del checkpoint fueron verificados contra el DCP de origen tras la conversión de dtype en la exportación, y se publican los pesos ordinarios de inferencia, no la EMA. Se guardan checkpoints locales cada 300 pasos nuevos, conservando únicamente el último estado de optimizador confirmado.

## Capacidades

- Predicción de acciones de manipulación robótica en las 40 tareas de las suites LIBERO Spatial, Object, Goal y LIBERO-10.
- Generación y predicción de vídeo como modelo de mundo, con supervisión conjunta de vídeo y acción durante el entrenamiento ID.
- Predicción de vídeo fuera de distribución: el ajuste con 458 vídeos OOD autogenerados aporta pérdida de vídeo sobre escenarios no vistos.
- Extracción de características (feature-extraction), declarada como tarea secundaria en las etiquetas del repositorio.
- Reanudación como punto de partida (warm-start) para ajustes finos posteriores dentro de la misma familia, dado que el entrenamiento planificado continúa hasta 3000 pasos.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo opera sobre horizontes fijos de 16 pasos de acción.
- Capacidades multilingües: no documentadas.
- Capacidades especiales: predicción de vídeo y acción con VAE Wan2.2, vistas duales agente/muñeca; no se documentan modos de pensamiento, audio ni visión general de propósito abierto.

## Casos de uso

- Evaluación de políticas de manipulación en LIBERO: el checkpoint permite reproducir la evaluación del autor sobre Spatial, Object, Goal y LIBERO-10 con cinco rollouts por tarea, usando las mismas suites y estados de benchmark.
- Medición de generalización fuera de distribución: con las semillas held-out 100000..100004 se puede cuantificar la caída de rendimiento en escenarios OOD y comparar contra el baseline de 4000 pasos.
- Generación de datos sintéticos de vídeo para aumentación: el modelo puede producir rollouts de vídeo condicionados que se filtren y reutilicen como datos adicionales, tal como se hizo con los 458 vídeos de la primera ronda.
- Investigación en curado automático de datasets: el checkpoint materializa la receta de filtrado automático round-1 y la mezcla 5:1, lo que permite estudiar el efecto del ratio ID/OOD sobre el rendimiento final.
- Warm-start de ajustes finos propios: al preservar las cabezas de acción del baseline y reanudar desde un estado limpio de optimizador, es un punto de partida razonable para entrenamientos con dominios o tareas adicionales.
- Planificación y simulación en modelos de mundo: la predicción de 16 pasos de acción a 20 FPS con vistas de agente y muñeca permite validar trayectorias en un simulador antes de ejecutarlas en hardware real.
- Comparación de checkpoints intermedios: al existir guardados cada 300 pasos nuevos, se pueden estudiar curvas de aprendizaje en vídeo OOD y su transferencia (o falta de ella) a la política de acción.
- Docencia y reproducción de experimentos: el repositorio incluye configuración y tokenizador, lo que facilita reproducir el pipeline en entornos académicos con recursos limitados al no requerir reentrenamiento.

## Benchmarks y rendimiento

Resultados publicados por el autor para el checkpoint baseline4k +600. Evaluación con cinco rollouts por tarea; OOD con semillas held-out 100000..100004; ID sobre los primeros cinco estados de benchmark por tarea. Los recuentos exactos se encuentran en evaluation.json del repositorio.

| Checkpoint | Spatial | Object | Goal | LIBERO-10 | ID global | Spatial OOD | Object OOD | Goal OOD | OOD global |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| baseline4k +600 | 98,00% | 98,00% | 94,00% | 92,00% | 95,50% | 30,00% | 0,00% | 38,00% | 22,67% |

No se han publicado resultados adicionales de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 30,3 GB en precisión de 16 bits, en línea con el tamaño del repositorio y los 15,17 mil millones de parámetros; alrededor de 15,2 GB en 8 bits y del orden de 8-9 GB en 4 bits, siempre que exista una ruta de cuantización compatible (no documentada por el autor). Estas cifras son estimaciones por tamaño de parámetros, no medidas publicadas.
- Entrenamiento documentado: cuatro GPU B200, con empaquetado de capacidad 256 por GPU, acumulación de gradiente 2 y batch global objetivo de 2048.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un despliegue en 16 bits requiere aceleradores de clase A100/H100/H200 o B200; en 8 bits podría caber en GPU profesionales de 24-48 GB.
- Consumer GPU: no cabe en GPU de consumo en 16 bits (30,3 GB de pesos). Sería viable únicamente en tarjetas de 24 GB con cuantización agresiva de 4 bits, siempre que el código personalizado lo permita, algo no confirmado.
- Opciones de despliegue: transformers con código personalizado (custom_code, requiere trust_remote_code). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Activos adicionales: la VAE (Wan2.2) y los activos del simulador se distribuyen por separado; no se incluyen optimizador ni vídeos en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de especificaciones de modelos comparables en la información proporcionada. La model card menciona Cosmos3-Nano únicamente para aclarar que este checkpoint no deriva de él, pero no aporta parámetros, contexto ni resultados de ese modelo.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| baseline4k +600 (este modelo) | 15.173.136.576 | No disponible | ID global 95,50%; OOD global 22,67% | No disponible | Público en HuggingFace, 30,3 GB |
| Cosmos3-Nano | No disponible | No disponible | No disponible | No disponible | Mencionado en la model card sin enlace |
| Otras alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No identificadas en la información disponible |

## Limitaciones y advertencias

- Licencia no disponible: al no declararse una licencia, existe incertidumbre legal sobre el uso comercial y la redistribución del checkpoint y de los derivados.
- Rendimiento OOD bajo: 22,67% global y 0,00% en Object OOD, frente al 95,50% en distribución. La generalización fuera de las condiciones de entrenamiento está muy limitada.
- Guardado intermedio: se trata del paso 600 de un objetivo planificado de 3000, por lo que no debe interpretarse como el resultado final de la receta de entrenamiento.
- Muestra de evaluación reducida: cinco rollouts por tarea, con semillas held-out 100000..100004 en OOD, lo que implica alta varianza en las estimaciones porcentuales de OOD.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de reproducibilidad independiente.
- Dependencia de código personalizado: la etiqueta custom_code implica confiar en implementación remota, con el riesgo de seguridad y mantenimiento asociado.
- Activos no incluidos: la VAE y los activos del simulador se distribuyen por separado, por lo que el checkpoint no es autocontenido para inferencia.
- Riesgo de alucinación: como modelo de mundo que predice vídeo, las trayectorias generadas pueden divergir de la física real sin que exista una señal de incertidumbre explícita; extrapolar a manipulación real sin validación en simulador es arriesgado.
- Idiomas y contexto no especificados: no hay información sobre ventana de contexto, tokenizador multilingüe ni uso conversacional; no es un modelo de chat.
- Datos de entrenamiento mixtos: la supervisión OOD es solo de pérdida de vídeo, no de acción, de modo que el ajuste OOD no entrena directamente las cabezas de acción.

## Enlaces

- HuggingFace: https://huggingface.co/Cosmos-Data/cosmos-libero-baseline4k-filtered-round1-tbal-5to1-plus600
- Repositorio e instrucciones de uso: https://github.com/jyzhang1208/cosmos-framework
- Resultados de búsqueda web: no se ha encontrado ningún resultado relevante sobre este modelo en la búsqueda realizada.
