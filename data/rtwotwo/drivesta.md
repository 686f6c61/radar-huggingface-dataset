# Rtwotwo/DriveSTA

## Resumen

DriveSTA es un artefacto de investigación para planificación de trayectorias en conducción autónoma, publicado por el usuario Rtwotwo en Hugging Face bajo licencia Apache-2.0. No se trata de un modelo de lenguaje: el repositorio contiene bancos de trayectorias precalculadas y cuatro checkpoints entrenados (Base/Scale × Stage 1/Stage 2) orientados al benchmark NAVSIM. El objetivo es proporcionar a la comunidad los datos y pesos necesarios para reproducir y evaluar planificadores de trayectoria sin tener que regenerar los bancos de candidatos desde cero.

El repositorio es fundamentalmente un conjunto de activos binarios: 146,44 GiB distribuidos en 48 archivos `.tar.gz` de trayectorias más 0,27 GiB de metadatos e índices inmutables de entrenamiento. La colección completa abarca 308.119 escenas (103.288 de Navtrainval y 204.831 de SimScale), mientras que la receta de entrenamiento del modelo Scale utiliza 232.672 escenas (103.263 reales y 129.409 sintéticas). Cada escena incluye 3.072 trayectorias candidatas completas con puntuaciones y metadatos de construcción.

La relevancia de este lanzamiento reside en su carácter reproducible y verificable: se publican sumas SHA-256 por archivo, inventarios de escenas y scripts de extracción, verificación y reparación por shard. Los checkpoints se conservan byte a byte respecto a los entrenamientos originales, lo que facilita la comparación de resultados con la implementación de referencia disponible en GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (planificador de trayectorias sobre NAVSIM; detalles en el repositorio de código) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de conducción autónoma, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | Apache-2.0 (código y metadatos de publicación); los datasets y modelos de terceros conservan sus propios términos |
| Formato de pesos | `.ckpt` (PyTorch); trayectorias en `.tar.gz` legibles con NumPy mmap |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red. El repositorio se describe como un sistema de planificación de trayectorias para conducción autónoma evaluado sobre NAVSIM, con dos variantes de escala (Base y Scale) y dos etapas de entrenamiento (Stage 1 y Stage 2). La implementación completa del modelo, el pipeline de minería de trayectorias y las redes troncales preentrenadas externas se mantienen en un repositorio separado, por lo que los detalles arquitectónicos deben consultarse allí.

En cuanto a los datos, la receta fija de entrenamiento de la variante Scale emplea 232.672 escenas: 103.263 reales y 129.409 sintéticas. La colección publicada es más amplia (308.119 escenas) e incluye los bancos de trayectorias minados con EPDMS. Cada escena contiene 3.072 trayectorias candidatas completas con forma `[8, 3]` (x, y y rumbo en el marco del ego, muestreadas cada 0,5 segundos), junto con sus puntuaciones y metadatos de construcción, además del subconjunto de alta puntuación disponible. Se preservan los déficits originales del banco alto (25 escenas reales y 8.514 sintéticas), cuyos marcadores de estado describen resultados de minería, no corrupción de la descarga. No se han publicado detalles sobre uso de RLHF, DPO ni innovaciones de decodificación en la información proporcionada.

## Capacidades

- Planificación de trayectorias de conducción autónoma en el marco del benchmark NAVSIM.
- Generación de 3.072 trayectorias candidatas por escena, con puntuaciones asociadas y metadatos de construcción.
- Dos escalas de modelo (Base y Scale) y dos etapas de entrenamiento (Stage 1 y Stage 2), lo que permite ablaciones controladas.
- Soporte de datos reales y sintéticos en el pipeline de entrenamiento (103.263 escenas reales y 129.409 sintéticas en la receta Scale).
- Herramientas de verificación y reparación por shard para garantizar la integridad de los activos descargados.
- Lectura eficiente de bancos numéricos mediante NumPy mmap.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo de pensamiento.

## Casos de uso

- Reproducción de experimentos NAVSIM: los cuatro checkpoints permiten replicar los resultados de referencia sin reentrenar, comparando Base frente a Scale y Stage 1 frente a Stage 2 en igualdad de condiciones.
- Investigación en planificación de trayectorias: los bancos de 3.072 candidatos por escena permiten estudiar funciones de puntuación, selección de trayectorias y minería de datos sin regenerar los candidatos.
- Desarrollo de funciones de coste y scoring: los metadatos y puntuaciones asociados a cada trayectoria facilitan el ajuste y la evaluación de heurísticas de selección.
- Aumento de datos con escenas sintéticas: las 129.409 escenas sintéticas de la receta Scale y las 204.831 de SimScale permiten analizar el impacto del dato sintético en el rendimiento del planificador.
- Auditoría y verificación de pipelines: los scripts de comprobación SHA-256, localización por token de escena y reparación por shard sirven como base para pipelines de integridad de datos a gran escala.
- Evaluación comparativa de planificadores: al publicarse los pesos byte a byte y los índices inmutables de entrenamiento, el repositorio actúa como referencia fija para comparar nuevos métodos contra DriveSTA.
- Docencia y prototipado: la estructura modular por shards permite descargar solo las escenas necesarias para prácticas o experimentos acotados sin mover los 146 GiB completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el entrenamiento completo y la evaluación completa de benchmarks no se volvieron a ejecutar para este empaquetado; solo se realizaron comprobaciones de integridad, 503 tests, validación de configuraciones y pruebas de daño/recuperación sobre escenas reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se documentan parámetros del modelo ni tamaño de los checkpoints individuales).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Almacenamiento: 146,44 GiB de activos binarios más aproximadamente 170 MiB de inventarios y sumas de verificación; se recomienda reservar al menos el doble durante la extracción de los archivos `.tar.gz`.
- Opciones de despliegue: los checkpoints son archivos `.ckpt` de PyTorch; el despliegue requiere la implementación del repositorio de código (no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje).
- Latencia y throughput: no disponibles.
- Requisitos de software: Python 3.9 o superior y NumPy para la lectura de arrays de trayectorias; los scripts de extracción y verificación usan solo la biblioteca estándar.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría ni datos de rendimiento que permitan establecer una comparación cuantitativa con otros planificadores de trayectorias para NAVSIM.

## Limitaciones y advertencias

- El repositorio no incluye imágenes, logs originales, mapas, cachés de características/evaluación ni los bancos de trayectorias minados con EPDMS; estos son entradas separadas y deben obtenerse por otras vías.
- Los checkpoints dependen de la implementación y de las redes troncales preentrenadas externas, que se mantienen en un repositorio distinto; sin ellas no son directamente ejecutables de extremo a extremo.
- Se preservan los déficits del banco alto original (25 escenas reales y 8.514 sintéticas); no deben interpretarse como corrupción de la descarga.
- La receta de entrenamiento Scale (232.672 escenas) no coincide con la colección publicada completa (308.119 escenas); los índices inmutables de entrenamiento se incluyen en el archivo de metadatos para evitar ambigüedades.
- La licencia Apache-2.0 cubre el código y los metadatos de publicación, pero los datasets y modelos de terceros conservan sus propios términos, lo que puede restringir el uso comercial de determinados componentes.
- No se ha vuelto a ejecutar el entrenamiento completo ni la evaluación completa de benchmarks para este empaquetado, por lo que no hay garantía de que los resultados reproducidos coincidan exactamente con los originales.
- El tamaño de descarga (146,44 GiB) y la necesidad de verificar y extraer los shards imponen requisitos significativos de almacenamiento y ancho de banda.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas por tratarse de un modelo de conducción autónoma y no de un modelo lingüístico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Rtwotwo/DriveSTA
- Código: https://github.com/Rtwotwo/DriveSTA
- Página del proyecto: https://rtwotwo.github.io/DriveSTA/
