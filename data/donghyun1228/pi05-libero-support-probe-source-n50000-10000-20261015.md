# Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015

## Resumen

Este repositorio contiene un punto de control intermedio de investigación robótica, publicado por el usuario Donghyun1228 bajo el identificador `pi05-libero-support-probe-source-n50000-10000-20261015`. No es un modelo de lenguaje de propósito general ni una política autónoma lista para desplegar, sino un artefacto de entrenamiento de origen ("source pre-adaptation") dentro de un pipeline de adaptación de políticas de manipulación robótica. El modelo se inicializa a partir de `pi05_libero` y se entrena sobre el ecosistema openpi (la librería declarada), con etiquetas de robótica, LIBERO e inverse dynamics.

El entrenamiento de origen comprende 10.000 actualizaciones (el punto de control corresponde al paso 9999) e incluye imitación de demostraciones más un modelo de dinámica inversa (IDM) sobre vistas originales, con lotes globales de 32/32 y semilla 42. Durante esta fase se actualizan todos los parámetros del modelo; la fase posterior de adaptación al dominio objetivo congela el componente LLM. El conjunto de sondeo empleado consta de 50.000 fotogramas originales seleccionados y 49.600 ventanas H10.

La relevancia de este tipo de publicaciones es metodológica: documenta el estado exacto de los parámetros y de la normalización tras el entrenamiento de origen, de modo que otros puedan reproducir la adaptación aguas abajo. El propio autor advierte de que este modelo no tiene evaluación de política independiente y que los resultados de adaptación se reportan en sus respectivos repositorios de destino. No se especifican en la información disponible ni la arquitectura exacta, ni el número de parámetros, ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se inicializa desde `pi05_libero`; familia openpi, modelo vision-lenguaje-accion) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (se incluyen parametros en bruto del paso 9999 y la normalizacion; repositorio de 12,4 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna (número de capas, dimensión de los embeddings, mecanismo de atención o componente de visión). Lo que sí se declara es que el modelo pertenece a la familia openpi y que se inicializa desde `pi05_libero`, lo que lo sitúa como un modelo de visión-lenguaje-acción orientado a tareas de manipulación robótica sobre el conjunto de referencia LIBERO. Se incluyen los parámetros en bruto del paso 9999 junto con su normalización.

El proceso de entrenamiento de origen ejecuta 10.000 actualizaciones con lotes globales de 32/32 y semilla 42, combinando imitación de demostraciones con un modelo de dinámica inversa (IDM) sobre vistas originales. Se conservan el conjunto de datos histórico de demostraciones, el optimizador y la normalización. En la fase de origen se actualizan todos los parámetros, mientras que la posterior adaptación al dominio objetivo congela el componente LLM. El conjunto de sondeo asociado está referenciado como `Donghyun1228/libero-support-random-waypoint-300k-20261015`, en la revisión `32ed215baf01af7e82f927a62b108873aa70bd19`.

## Capacidades

- Modelo de visión-lenguaje-acción (VLA) orientado a manipulación robótica sobre tareas LIBERO.
- Entrenamiento con imitación de demostraciones más un modelo de dinámica inversa (IDM) sobre vistas originales.
- Punto de control de preadaptación de origen: sirve como inicializador para fases posteriores de adaptación al dominio objetivo.
- Incluye parámetros en bruto del paso 9999 y la normalización necesaria para reanudar o adaptar el entrenamiento.
- No se declara soporte de generación de texto general, tool calling, razonamiento multietapa ni capacidades multilingües.
- No tiene evaluación de política independiente: el autor indica explícitamente que los resultados de adaptación aguas abajo se reportan en otros repositorios.

## Casos de uso

- Reproducción de experimentos de adaptación: usar este punto de control como inicializador de origen para replicar la fase de adaptación al dominio objetivo, dado que se conservan los parámetros del paso 9999 y la normalización.
- Investigación en modelos de dinámica inversa aplicados a robótica: el punto de control incorpora entrenamiento IDM sobre vistas originales, útil para estudiar cómo afecta esa señal a las políticas posteriores.
- Ablaciones sobre congelación del LLM: permite comparar escenarios en los que la adaptación de destino congela el componente LLM frente a los que no, partiendo de un mismo origen.
- Estudios de escalado de datos de sondeo: el modelo documenta el uso de 50.000 fotogramas originales seleccionados y 49.600 ventanas H10, lo que facilita reproducir esa configuración.
- Reanudación de entrenamiento: al conservar optimizador, normalización y parámetros, se puede continuar el entrenamiento de origen o derivar variantes con distinta semilla.
- Comparación metodológica dentro de un pipeline openpi: sirve como referencia de origen intermedia frente a otros repositorios del mismo autor en los que se publican los resultados de adaptación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica de forma explícita que este modelo de origen no tiene evaluación de política independiente y que los resultados de adaptación aguas abajo se reportan en sus propios repositorios.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio ocupa 12,4 GB, pero se desconoce el tamaño del modelo y su precisión de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es openpi; no se especifican otros backends (vLLM, llama.cpp, Ollama, TGI, etc.).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05-libero-support-probe-source-n50000-10000-20261015` | no disponible | no disponible | no disponible (sin evaluación de política independiente) | Apache-2.0 | HuggingFace, librería openpi |
| `pi05_libero` (inicializador referenciado) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Otros modelos openpi / LIBERO | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos suficientes en la información proporcionada.

## Limitaciones y advertencias

- No es una política desplegable de forma autónoma: el autor señala que no existe evaluación de política independiente para este punto de control.
- Sesgos conocidos: no disponibles; no se documenta la composición completa de los datos de entrenamiento.
- Riesgo de alucinación: no aplica en el sentido de un modelo de lenguaje conversacional, pero no se documenta el comportamiento fuera de distribución de la política.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: Apache-2.0, que permite uso comercial con las condiciones habituales de la licencia; conviene revisar los términos de los datasets y del inicializador `pi05_libero` referenciados.
- Caveat para producción: se trata de un artefacto de investigación intermedio, no de un modelo final validado; su utilidad depende del pipeline de adaptación al dominio objetivo.
- No se especifican requisitos de hardware, formato de pesos ni proceso de conversión, lo que dificulta su uso fuera del ecosistema openpi.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-support-probe-source-n50000-10000-20261015
- Dataset de sondeo referenciado: https://huggingface.co/datasets/Donghyun1228/libero-support-random-waypoint-300k-20261015 (revisión `32ed215baf01af7e82f927a62b108873aa70bd19`)
- Librería openpi: no disponible como enlace en la información proporcionada
