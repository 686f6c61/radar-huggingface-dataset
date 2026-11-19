# dsadd4/UltraMS-Unsupervised

## Resumen

UltraMS Unsupervised es un codificador (encoder) de espectros de masas en tándem (MS/MS) desarrollado por el usuario dsadd4 y publicado en Hugging Face bajo licencia Apache 2.0. Su función es transformar un espectro de masas —pares de relación masa/carga (m/z) e intensidad, junto con el m/z del ion precursor— en un embedding normalizado de 1024 dimensiones a nivel de espectro (CLS). El modelo está orientado a metabolómica y a tareas de representación de espectros, no a generación de texto ni a conversación.

El entrenamiento se realizó sobre el conjunto UltraMSdata mediante reconstrucción de picos enmascarados (masked peak reconstruction, MPR) y una fase posterior de entrenamiento con tiempo de retención. El modelo forma parte de una familia de tres checkpoints (UltraMS model family) y se distribuye como `model.pt`, un artefacto que contiene pesos y configuración de inferencia y que se carga con la librería `ultrams` (versión 0.3.2 o superior).

Es relevante porque los codificadores especializados en espectrometría de masas permiten búsqueda de espectros, agrupamiento, anotación y modelos predictivos downstream sin depender de reglas manuales de fragmentación. La información pública disponible es escasa: no hay datos de benchmarks, idiomas soportados ni pipeline declarado en Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (codificador de espectros; detalles de capas no publicados) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica; máximo de 150 picos espectrales por espectro |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo no lingüístico; opera sobre datos numéricos de espectrometría) |
| Licencia | Apache 2.0 |
| Formato de pesos | `model.pt` (PyTorch, pesos + configuración de inferencia) |
| Dimensión del embedding | 1024 |
| Máximo de picos espectrales | 150 |
| Nombre en Python | `"unsupervised"` |
| Librería de carga | `ultrams` (>= 0.3.2) |
| Tamaño del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

La model card describe un codificador entrenado en dos fases: primero mediante reconstrucción de picos enmascarados (MPR) sobre UltraMSdata, y después con entrenamiento adicional sobre tiempo de retención. El resultado es un embedding CLS normalizado a nivel de espectro de 1024 dimensiones. No se especifican el número de capas, la dimensión oculta, el número de cabezas de atención ni el volumen total de tokens o espectros de entrenamiento.

El preprocesado es parte del contrato del modelo: exige al menos tres picos con m/z positivo, normaliza las intensidades por su máximo cuando este es positivo y, si hay más de 150 picos, conserva los 150 más intensos. La opción `return_peaks=True` devuelve embeddings alineados con los picos retenidos. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o mecanismos híbridos.

## Capacidades

- Generación de embeddings de espectros MS/MS: produce un vector normalizado de 1024 dimensiones por espectro.
- Representación a nivel de espectro (CLS) y, opcionalmente, representaciones alineadas con picos individuales mediante `return_peaks=True`.
- Preprocesado integrado: filtrado por m/z positivo, normalización por intensidad máxima y truncado a los 150 picos más intensos.
- Uso como extractor de características para tareas downstream de metabolómica (búsqueda, agrupamiento, clasificación, regresión).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.
- Capacidades multilingües: no aplica.

## Casos de uso

- Búsqueda de espectros similares: calcular el embedding de un espectro desconocido y compararlo por similitud coseno con una base de datos de embeddings precalculados para recuperar candidatos de metabolitos.
- Agrupamiento no supervisado de espectros: usar los vectores de 1024 dimensiones como entrada a UMAP, HDBSCAN o k-means para descubrir familias de fragmentación en experimentos de metabolómica no dirigida.
- Extracción de características para modelos downstream: alimentar clasificadores o regresores (por ejemplo, predicción de tiempo de retención o de clase química) con embeddings congelados en lugar de representaciones de picos dispersas.
- Deduplicación y control de calidad: detectar espectros duplicados o casi duplicados en repositorios grandes mediante umbrales de similitud sobre los embeddings.
- Anotación asistida: generar candidatos mediante vecinos más cercanos en el espacio de embeddings y validarlos después con reglas de fragmentación o con espectros de referencia.
- Integración en pipelines de análisis: cargar el modelo con `ultrams` en scripts de Python o notebooks para procesar lotes de espectros con el preprocesado estandarizado que exige el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 1,7 GB, pero no se detalla el desglose entre pesos y otros artefactos ni el número de parámetros.
- GPU recomendadas: no disponibles. Al ser un codificador de espectros con entradas de como máximo 150 picos, es probable que la inferencia sea ligera, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la vía documentada es la librería `ultrams` (`pip install ultrams`) con `UltraMS.from_pretrained("unsupervised")`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparación rigurosa. Dentro de la propia familia UltraMS se publican tres checkpoints, pero no se detallan sus diferencias ni métricas.

## Limitaciones y advertencias

- Información pública muy limitada: no hay benchmarks, número de parámetros, arquitectura detallada ni datos de entrenamiento más allá de la mención a UltraMSdata y a las fases MPR y tiempo de retención.
- El modelo no es generativo ni conversacional: no debe esperarse salida de texto, razonamiento ni tool calling.
- Restricciones de entrada: requiere al menos tres picos con m/z positivo; espectros con menos picos no son procesables.
- Pérdida de información por truncado: si el espectro tiene más de 150 picos, solo se retienen los más intensos, lo que puede descartar picos de baja intensidad relevantes para ciertas identificaciones.
- Normalización por máximo: si todas las intensidades son no positivas, el comportamiento de normalización no está documentado.
- Riesgo de sesgo: al entrenarse sobre UltraMSdata, el rendimiento puede degradarse en espectros de instrumentos, modalidades o rangos de masa poco representados en ese conjunto.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento (UltraMSdata) antes de un despliegue en producción.
- Sin validación independiente: no hay evidencia publicada de rendimiento en tareas downstream concretas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dsadd4/UltraMS-Unsupervised
- Colección UltraMS model family: https://huggingface.co/collections/dsadd4/ultrams-6ab4cfaa860cbbd1f9a6b9b6
- Repositorio GitHub (formato de entrada, selección de modelo, ejemplo de fine-tuning en PyTorch): https://github.com/Dsadd4/UltraMS
