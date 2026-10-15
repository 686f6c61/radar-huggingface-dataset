# Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015

## Resumen

Este repositorio contiene un checkpoint intermedio de investigación robótica denominado "Random-probe source pre-adaptation", publicado por el usuario Donghyun1228 bajo la librería openpi. No es un modelo de lenguaje ni un asistente conversacional: es un modelo de visión-lenguaje-acción (VLA) de la familia pi05 que combina imitación de demostraciones con un objetivo de dinámica inversa (inverse dynamics model, IDM) sobre vistas originales. El checkpoint corresponde al paso 9999 tras 10.000 actualizaciones con lotes globales de 32/32 y semilla 42.

La relevancia del artefacto es metodológica más que de producto. Se trata de un modelo "fuente" pensado para experimentos de adaptación posterior (transferencia a un dominio objetivo), no para evaluación autónoma de políticas: la propia model card indica explícitamente que no existe una evaluación de política independiente y que los resultados de la adaptación downstream se publican en otros repositorios de modelos. Durante el entrenamiento fuente se actualizan todos los parámetros; en la adaptación al dominio objetivo se congela el bloque LLM.

El repositorio ocupa 12,4 GB e incluye los parámetros fuente "raw" del paso 9999 junto con las estadísticas de normalización, lo que sugiere que el peso incluye estado adicional (optimizador y normalización) y no solo los pesos de inferencia. La licencia es Apache 2.0. No se especifican en la información disponible el número de parámetros, la longitud de contexto ni los idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Modelo de visión-lenguaje-acción (VLA) de la familia pi05, entrenado con imitación de demostraciones y un objetivo de dinámica inversa sobre vistas originales |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se describe como arquitectura MoE) |
| Longitud de contexto | No disponible. La configuración de entrenamiento usa ventanas de 10 pasos (H10): 99.600 ventanas extraídas de 100.000 fotogramas de sondeo seleccionados |
| Tipos de cuantizacion | No disponible. El repositorio publica únicamente los parámetros fuente "raw" del paso 9999, sin variantes cuantizadas |
| Idiomas soportados | No disponible. No es un modelo de lenguaje de propósito general |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible explícitamente. Se indican "raw step9999 source parameters" junto con la normalización, en el formato nativo de la librería openpi |
| Tipo de modelo / pipeline | Robotics: política VLA más modelo de dinámica inversa |
| Libreria | openpi |
| Tamano del repositorio | 12,4 GB |
| Autor | Donghyun1228 |
| Fecha de creacion / actualizacion | 15 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo se inicializa desde el checkpoint pi05_libero de openpi y se entrena durante 10.000 actualizaciones sobre un conjunto de demostraciones históricas que se preserva junto al optimizador y a la normalización originales. La receta combina dos señales: imitación de demostraciones (comportamiento supervisado sobre trayectorias) y un objetivo de dinámica inversa sobre vistas originales, que fuerza al modelo a inferir la transición de acción entre observaciones consecutivas. Los hiperparámetros declarados son lotes globales de 32/32 y semilla 42.

La pieza específica de este checkpoint es el conjunto de sondeo: 100.000 fotogramas originales seleccionados, que dan lugar a 99.600 ventanas H10. El conjunto de datos de sondeo referenciado es `Donghyun1228/libero-support-random-waypoint-300k-20261015`, fijado en el commit `32ed215baf01af7e82f927a62b108873aa70bd19`. La distinción entre actualización completa de parámetros en la fase fuente y congelación del LLM en la fase de adaptación es el eje del diseño experimental: el modelo fuente actúa como punto de partida reproducible para medir cuánto de la adaptación depende del bloque de lenguaje.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron etapas de RLHF o DPO. Tampoco se describe ninguna innovación de inferencia (decodificación especulativa, atención lineal u otras).

## Capacidades

- Dinámica inversa (IDM): dado un par de observaciones visuales consecutivas, el modelo aprende a estimar la acción que las conecta. Es el objetivo central de este checkpoint y la base de su uso en experimentos de sondeo.
- Imitación de demostraciones: reproduce políticas a partir de trayectorias de demostración, en el marco del entorno LIBERO.
- Procesamiento de vistas originales: el entrenamiento se realiza sobre fotogramas en su vista original, sin las transformaciones aplicadas en otras variantes del pipeline.
- Inicialización para adaptación posterior: sirve como punto de partida ("source") para adaptar la política a un dominio objetivo, con el LLM congelado en esa segunda fase.
- Compatibilidad con el ecosistema openpi: el checkpoint se carga con la librería openpi y sus utilidades de normalización.
- No se documenta soporte de tool calling, function calling, uso como agente multi-paso, capacidades multilingües, visión general de propósito abierto, audio ni modo de razonamiento explícito. Estas capacidades no aplican al diseño del modelo o no están descritas en la información disponible.

## Casos de uso

- Investigación en adaptación de dominio para robótica: usar este checkpoint como modelo fuente y medir la degradación o transferencia al adaptarlo a un robot o entorno objetivo distinto, aprovechando que la fase downstream congela el LLM y aísla el efecto del resto de componentes.
- Estudios de dinámica inversa: analizar qué información de acción puede extraerse de pares de observaciones visuales, comparando el objetivo IDM con la imitación pura en el mismo inicializador.
- Reproducción de experimentos de probing: el conjunto de sondeo está fijado por commit, lo que permite repetir exactamente las mismas ventanas H10 y comparar resultados entre ejecuciones.
- Punto de partida para fine-tuning en tareas LIBERO: partir de este modelo fuente en lugar de pi05_libero para evaluar si el preentrenamiento con IDM mejora la adaptación a tareas concretas de manipulación.
- Ablaciones controladas de recetas de entrenamiento: comparar esta configuración (10.000 pasos, lotes 32/32, semilla 42) con otras variantes del mismo autor manteniendo constantes dataset, inicializador y normalización.
- Generación de políticas base para simulación: emplear el modelo adaptado como política de referencia en entornos simulados del benchmark LIBERO para generar trayectorias de evaluación.
- Publicación de artefactos reproducibles: el repositorio incluye parámetros y normalización del paso 9999, lo que permite auditar el estado exacto del entrenamiento sin depender de un pipeline externo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita que este modelo fuente no tiene evaluación de política independiente y que los resultados de la adaptación posterior se reportan en sus propios repositorios de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no especificarse el número de parámetros, no puede calcularse con precisión. Como referencia orientativa, el repositorio de 12,4 GB incluye parámetros fuente, estado del optimizador y normalización; si los pesos de inferencia representan una fracción de ese tamaño, un despliegue en fp16/bf16 requeriría del orden de varios gigabytes, más el coste de las observaciones visuales y del procesamiento de acción. Esta estimación es una inferencia a partir del tamaño del repositorio, no un dato publicado.
- GPU recomendadas: no disponibles en la información proporcionada. Para modelos VLA de esta familia se suelen emplear A100, H100 o L40S en entornos de investigación; no hay confirmación para este checkpoint concreto.
- Compatibilidad con GPU de consumo: no confirmada. Si el modelo está en el rango de pocos miles de millones de parámetros, una RTX 4090 (24 GB) podría alojarlo en bf16; no obstante, no hay datos publicados que lo verifiquen.
- Opciones de despliegue: el checkpoint se distribuye para la librería openpi, que es su runtime previsto. No hay soporte publicado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, ya que no se trata de un modelo de lenguaje de texto.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia por paso de control ni de frecuencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-support-probe-source (este modelo) | No disponible | No disponible (ventanas H10 durante el entrenamiento) | VLA con imitación e IDM, checkpoint fuente | Apache 2.0 | HuggingFace, librería openpi |
| pi05_libero (inicializador, familia openpi) | No disponible | No disponible | Política VLA | Ver licencia del repositorio openpi | Repositorio openpi de Physical Intelligence |
| OpenVLA (referencia pública) | 7.000 millones (referencia pública) | 2.048 tokens de contexto de lenguaje (referencia pública) | VLA basado en LLM con codificadores visuales | Licencia de la familia Llama para los pesos | Pesos públicos en HuggingFace |
| GR00T N1.x (referencia pública) | No disponible en esta ficha | No disponible en esta ficha | VLA para robots humanoides | Ver licencia del repositorio | Pesos públicos de NVIDIA |

Los datos de los modelos comparables proceden de documentación pública general y no de la información proporcionada en esta ficha; conviene verificarlos antes de usarlos en una decisión técnica. No hay resultados de benchmarks comunes que permitan una comparación cuantitativa con este checkpoint.

## Limitaciones y advertencias

- No existe evaluación de política independiente para este modelo. Cualquier uso directo como política requiere una fase de adaptación y su propia evaluación.
- Es un checkpoint intermedio del paso 9999, no un modelo final validado para producción.
- El entrenamiento se apoya en el benchmark LIBERO, un entorno simulado; la transferencia a robots reales no está demostrada ni documentada.
- Sesgos potenciales: la política hereda las limitaciones del conjunto de demostraciones históricas y del conjunto de sondeo, que cubre un rango acotado de tareas y vistas. No se documenta ningún análisis de sesgo.
- Riesgo de alucinación: en un VLA el equivalente funcional es la generación de acciones físicamente inválidas o incoherentes con la observación; no hay métricas publicadas de robustez frente a entradas fuera de distribución.
- Limitaciones de idioma: no aplica como modelo multilingüe; no se especifican idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con la obligación habitual de conservar avisos de licencia y sin garantías. Debe verificarse además la licencia del modelo inicializador (pi05_libero de openpi) y de los datos de entrenamiento, que esta ficha no detalla.
- El repositorio no publica variantes cuantizadas ni scripts de conversión, por lo que el despliegue queda ligado a la cadena de herramientas de openpi.
- El modelo registra 0 descargas y 0 "likes" en el momento de la consulta: no cuenta con validación independiente por parte de la comunidad.
- La fecha del repositorio (octubre de 2026) y la ausencia de documentación adicional dificultan verificar la reproducibilidad completa del experimento sin acceso a los repositorios de adaptación asociados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n100000-10000-20261015
- Conjunto de datos de sondeo referenciado: https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-20261015 (commit `32ed215baf01af7e82f927a62b108873aa70bd19`)
- Repositorio openpi (Physical Intelligence), librería declarada del modelo: https://github.com/Physical-Intelligence/openpi
- Benchmark LIBERO: https://libero-project.github.io/
- La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a páginas de ayuda de YouTube sin relación con el artefacto.
