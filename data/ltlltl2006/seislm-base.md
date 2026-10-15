# ltlltl2006/seislm-base

## Resumen

SeisLM base es un codificador de formas de onda sísmicas preentrenado, publicado por el autor ltlltl2006 en HuggingFace y derivado del trabajo SeisLM: a Foundation Model for Seismic Waveforms (arXiv:2410.15765). Se trata de un artefacto de extracción de características (pipeline feature-extraction): recibe tensores de tres componentes ZNE muestreados a 100 Hz y devuelve representaciones contextuales de 240 dimensiones, no predicciones de llegadas de fase P/S ni detecciones de terremotos.

El modelo tiene 11.359.568 parámetros en total, incluyendo las cabezas de preentrenamiento auto-supervisado originales. La arquitectura es un transformer de 6 capas con dimensión de característica contextual de 240, diseñado para operar sobre ventanas de 3001 muestras (aproximadamente 30 segundos a 100 Hz), que se reducen a 749 pasos temporales en la salida. Los pesos se distribuyen en safetensors sin modificar respecto al checkpoint original, con el estado del optimizador omitido.

Su relevancia actual es la de servir como base para adaptación downstream en sismología: al ser un modelo fundacional pequeño y con licencia MIT, permite ajustar cabezas específicas (phase picking, detección de eventos, clasificación de señales) sobre un codificador preentrenado con datos de múltiples redes sísmicas, en lugar de entrenar desde cero. Las fuentes de entrenamiento registradas en el checkpoint original son ETHZ, GEOFON, STEAD, MLAAPDE, InstanceCounts, Iquique, PNW y OBST2024.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 6 capas (codificador) con cabezas de preentrenamiento auto-supervisado; dimensión de característica contextual 240 |
| Parametros totales | 11.359.568 (incluyendo cabezas de preentrenamiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica como contexto de tokens; ventana de entrada fija de 3001 muestras a 100 Hz (aprox. 30 s), que produce 749 pasos temporales en la salida |
| Tipos de cuantizacion | no disponible; el artefacto se publica con tensores originales en safetensors, sin cuantizar |
| Idiomas soportados | no disponible (modelo para formas de onda sísmicas, no para texto) |
| Licencia | MIT (pesos y código) |
| Formato de pesos | safetensors, más wheel Python `seislm-0.2.0-py3-none-any.whl` incluido en el repositorio |
| Pipeline | feature-extraction |
| Entrada | tensor float32 `[batch, 3, samples]`, componentes ZNE, 100 Hz |
| Salida | `[batch, reduced_time, 240]`; para 3001 muestras, `reduced_time = 749` |
| Preprocesado obligatorio | Restar la media por componente y dividir por la desviación estándar poblacional más `1e-10` (si la desviación es cero, se sustituye por 1); no hay remuestreo, filtrado ni relleno automático de componentes |
| Libreria | seislm |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es un codificador transformer de 6 capas que transforma ventanas multicomponente de forma de onda sísmica (ZNE, 100 Hz) en representaciones contextuales de 240 dimensiones. La reducción temporal de 3001 muestras de entrada a 749 pasos de salida indica un factor de submuestreo aproximado de 4, coherente con un front-end convolucional previo a las capas de atención. El checkpoint exportado conserva las cabezas de preentrenamiento auto-supervisado originales y omite el estado del optimizador; no incluye ninguna cabeza entrenada de phase picking ni de detección de terremotos, por lo que la adaptación downstream es imprescindible para esas tareas.

El preentrenamiento es auto-supervisado y se realizó sobre datos de ETHZ, GEOFON, STEAD, MLAAPDE, InstanceCounts, Iquique, PNW y OBST2024, según los registros del checkpoint original. La model card no detalla el número de tokens ni la composición exacta del dataset, ni confirma el uso de RLHF o DPO (fases propias de modelos de lenguaje, en principio no aplicables a este dominio). El repositorio incluye una comprobación de regresión de refactorización: los pesos exportados se compararon con el checkpoint original de Lightning sobre entradas fijas completas, con ruido y con canal cero, en CPU y en CUDA (NVIDIA GB10, PyTorch 2.14.1+cu130, Python 3.12.3), y los ocho campos verificados (características del codificador, características convolucionales, características proyectadas/cuantizadas, perplejidad del codebook y tres valores de pérdida enmascarada) coincidieron con error absoluto máximo 0. Se trata de paridad numérica sobre un fixture de regresión, no de una evaluación downstream.

## Capacidades

- Extracción de características sísmicas: genera representaciones contextuales de 240 dimensiones a partir de ventanas de 3001 muestras en tres componentes ZNE a 100 Hz.
- Base para ajuste fino supervisado: al conservar el codificador y las cabezas de preentrenamiento, sirve como inicialización para cabezas downstream (phase picking, detección de eventos, clasificación).
- Representaciones auto-supervisadas: el preentrenamiento con objetivos auto-supervisados (pérdidas enmascaradas y codebook, según la comprobación de regresión) produce características reutilizables en tareas con pocas etiquetas.
- Inferencia en CPU y GPU: el modelo es lo bastante pequeño para ejecutarse en ambos entornos; la comprobación de paridad se realizó en CPU y en CUDA.
- Instalación autocontenida: el wheel incluido permite usar el modelo antes de que los cambios de código se publiquen en PyPI.
- Carga offline: se admite un directorio de bundle local para uso sin conexión.
- Descargas reproducibles: el parámetro `revision` permite fijar un commit publicado del repositorio de modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: la model card indica explícitamente que no es un artefacto Transformers AutoModel ni un endpoint de inferencia alojado.

## Casos de uso

- Adaptación a phase picking: congelar o ajustar el codificador y entrenar una cabeza de regresión sobre ventanas de 30 s para localizar llegadas P y S, aprovechando las características de 240 dimensiones ya preentrenadas con datos de STEAD y GEOFON.
- Detección de terremotos: añadir una cabeza de clasificación binaria sobre las características contextuales para discriminar eventos de ruido, partiendo de un modelo preentrenado con múltiples redes y no de pesos aleatorios.
- Clasificación de fuentes sísmicas: usar las representaciones como entrada a un clasificador ligero para distinguir explosiones, eventos tectónicos o ruido cultural, con la ventaja de requerir menos datos etiquetados.
- Aprendizaje por transferencia en regiones nuevas: aplicar el codificador a registros de una red local (por ejemplo, instrumentos no incluidos en el preentrenamiento) y ajustar con un conjunto etiquetado reducido, dado el bajo número de parámetros del modelo.
- Búsqueda de eventos similares: indexar las características de 749×240 por ventana y calcular similitud entre ellas para recuperar formas de onda parecidas dentro de un catálogo.
- Control de calidad de datos: detectar ventanas anómalas (canales planos, saturación, ruido inusualmente alto) a partir de la representación contextual, como paso previo a pipelines de procesamiento sísmico.
- Investigación en preentrenamiento auto-supervisado aplicado a señales: servir como punto de partida reproducible para comparar objetivos de preentrenamiento en dominios sísmicos, gracias a que el artefacto conserva las cabezas originales y a la comprobación de paridad numérica documentada.
- Prototipado en local sin GPU: el tamaño del modelo (11,36 M de parámetros) permite experimentar en un portátil antes de escalar a un cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el artículo original evalúa modelos ajustados por tarea, no este codificador desnudo, y que las puntuaciones downstream del artículo no pueden inferirse de una carga correcta ni de la paridad numérica del artefacto. La única métrica aportada es la paridad de regresión: error absoluto máximo 0 en los ocho campos verificados sobre entradas fijas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 45 MB para los pesos en float32 (11,36 M de parámetros) y unos 23 MB en float16; el consumo real depende del tamaño de lote y de la longitud de la ventana de entrada.
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; la verificación del autor se ejecutó en una NVIDIA GB10. No se documentan requisitos mínimos.
- GPU de consumo: sí, cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), e incluso en iGPU con memoria compartida suficiente.
- CPU: la inferencia es viable en CPU; la comprobación de paridad numérica se realizó en CPU con Python 3.12.3.
- Opciones de despliegue: instalación del wheel `seislm` con Python 3.11 o 3.12 y uso mediante `seisLM.load_pretrained` y `seisLM.encode`; para GPU específicas, instalación de PyTorch mediante el selector oficial. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Almacenamiento: el tamaño del repositorio se indica como 0,0 GB, coherente con un checkpoint de decenas de megabytes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SeisLM base (este artefacto) | 11.359.568 | 3001 muestras a 100 Hz (aprox. 30 s) | Extracción de características; requiere adaptación downstream | MIT | HuggingFace, safetensors + wheel |
| Modelos ajustados por tarea del artículo SeisLM | no disponible | no disponible | Phase picking y detección de terremotos | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |
| Otros codificadores sísmicos preentrenados | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye especificaciones de modelos alternativos (por ejemplo, codificadores sísmicos de la competencia o modelos supervisados de phase picking), por lo que no es posible establecer una comparación cuantitativa. El único contraste documentado es interno: este artefacto es el codificador con cabezas de preentrenamiento, frente a los modelos ajustados por tarea evaluados en el artículo, cuyas métricas no se detallan aquí.

## Limitaciones y advertencias

- No es un modelo de phase picking ni de detección de terremotos: no incluye cabezas entrenadas para esas tareas y requiere adaptación downstream.
- Las puntuaciones downstream del artículo no son extrapolables a este artefacto; es necesaria una evaluación local con datos retenidos antes de confiar en predicciones para una región o instrumento nuevos.
- El preprocesado es un contrato estricto: entrada float32 `[batch, 3, samples]` en ZNE a 100 Hz, media restada y división por la desviación estándar poblacional más 1e-10. No hay remuestreo, filtrado ni relleno automático de componentes, y existe una advertencia sobre componentes ausentes en `preprocessing.json`.
- La salida son características de forma `[batch, reduced_time, 240]`, no picos P/S; interpretarla como predicciones sería un error de uso.
- La model card no documenta sesgos, comportamiento multilingüe ni cobertura geográfica detallada más allá de la lista de fuentes de entrenamiento (ETHZ, GEOFON, STEAD, MLAAPDE, InstanceCounts, Iquique, PNW, OBST2024), por lo que se desconoce su comportamiento fuera de esas redes.
- No se documenta ningún benchmark de rendimiento, ni tolerancia a ruido, ni sensibilidad a instrumentos distintos de los del preentrenamiento.
- No es un artefacto Transformers AutoModel ni un endpoint de inferencia alojado; la integración debe hacerse mediante la librería `seislm`.
- Licencia MIT, sin restricción conocida para uso comercial, tanto en pesos como en código; aun así, conviene revisar el fichero LICENSE del repositorio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado en fechas muy próximas entre sí; se recomienda fijar un commit concreto mediante `revision` para instalaciones reproducibles.
- No se han publicado datos de benchmarks ni métricas de latencia o throughput.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ltlltl2006/seislm-base
- Paper SeisLM (arXiv:2410.15765): https://arxiv.org/abs/2410.15765
- DOI del paper: https://doi.org/10.48550/arXiv.2410.15765
- Código y instalación: https://github.com/liutianlin0121/seisLM
- Wheel de la librería seislm: https://huggingface.co/ltlltl2006/seislm-base/resolve/main/seislm-0.2.0-py3-none-any.whl
- Selector de instalación de PyTorch: https://pytorch.org/get-started/locally/
- Documentación de regresión del repositorio de código: https://github.com/liutianlin0121/seisLM (ruta específica no disponible)
