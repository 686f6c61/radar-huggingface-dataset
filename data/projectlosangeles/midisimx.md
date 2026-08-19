# projectlosangeles/midisimx

## Resumen

midisimx es un modelo de embeddings diseñado para calcular, buscar y analizar similitud entre archivos MIDI a gran escala. Desarrollado por projectlosangeles (asigalov61), se presenta como un fork mejorado, ampliado y optimizado de midisim, su predecesor. El modelo resuelve el problema de la comparación eficiente de piezas musicales en formato MIDI, permitiendo tareas como búsqueda de similitud, identificación de artistas o canciones, y análisis de grandes corpus musicales.

A diferencia de midisim, que utilizaba dos modelos más pequeños, midisimx emplea un único modelo unificado con dimensión 768, 16 capas y 12 cabezas de atención. Se entrenó sobre más de 3 millones de archivos MIDI filtrados y procesados, y representa los eventos MIDI mediante una codificación más rica: start-time, note/chord, pitch y duration. El modelo está disponible bajo licencia Apache 2.0 y se distribuye como checkpoint PyTorch, con un tamaño de repositorio de 0.5 GB.

La relevancia actual de midisimx radica en su capacidad para manejar corpus masivos de MIDI (como los 3.2 millones de archivos del Discover MIDI Dataset) con embeddings precomputados, lo que facilita búsquedas de similitud casi instantáneas sin necesidad de recalcular representaciones. Su diseño flexible permite ajustar la importancia de distintos aspectos musicales mediante pesos por tipo de token, lo que lo hace adaptable a diversas tareas de recuperación de información musical (MIR).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en x-transformers) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

midisimx utiliza una arquitectura Transformer unificada con 16 capas, 12 cabezas de atención y una dimensión de modelo de 768. Se basa en la librería x-transformers (versión 2.3.1) para su implementación. La principal innovación frente a midisim es la representación de eventos MIDI, que ahora incluye start-time, note/chord, pitch y duration, en lugar de solo start-time, duration y pitch. Esta codificación más completa permite capturar mejor la estructura armónica y melódica de las piezas.

El modelo se entrenó sobre el dataset Discover Piano completo durante 2 épocas, alcanzando 14 391 pasos con una pérdida final de 0.255 y una precisión de 0.9036. El corpus de entrenamiento global supera los 3 millones de MIDIs filtrados y procesados, aunque el checkpoint específico se basa en Discover Piano. Además, el sistema incluye un mecanismo de pooling ponderado (weighted mean) que permite asignar pesos distintos a cada tipo de token (por ejemplo, dar más importancia a pitches y acordes), lo que genera embeddings más matizados y adaptables a diferentes tareas.

## Capacidades

- Generación de embeddings de similitud MIDI a MIDI, tanto para consultas individuales como para corpus completos.
- Búsqueda de similitud a gran escala mediante conjuntos de embeddings precomputados (por ejemplo, 3 267 574 MIDIs del Discover MIDI Dataset).
- Cálculo de similitud coseno entre representaciones, con soporte para GPU y CPU.
- Identificación de artistas y canciones usando embeddings específicos del subconjunto LAKH MIDI (17 203 archivos).
- Personalización de la importancia de distintos aspectos musicales mediante pesos por tipo de token (start-time, note/chord, pitch, duration).
- Compatibilidad multiplataforma y código independiente para tareas personalizadas de similitud MIDI.
- Integración sencilla mediante paquete PyPI (`midisimx`) o uso directo del checkpoint.

## Casos de uso

- Búsqueda de similitud musical en corpus masivos: con los embeddings precomputados del Discover MIDI Dataset, se puede tomar un MIDI de consulta y recuperar las piezas más similares entre millones de candidatos en milisegundos, útil para motores de recomendación o análisis de repertorio.
- Identificación de versiones y covers: los embeddings de LAKH permiten comparar una grabación MIDI contra un catálogo de canciones conocidas para detectar versiones alternativas, remixes o reinterpretaciones.
- Detección de similitud melódica y plagio: compositores o editores pueden usar midisimx para encontrar coincidencias no obvias entre obras, ayudando en procesos de verificación de originalidad.
- Limpieza y deduplicación de bibliotecas MIDI: al agrupar archivos con alta similitud, se pueden eliminar duplicados o variaciones casi idénticas en colecciones personales o institucionales.
- Análisis de evolución estilística: comparando obras de diferentes épocas o compositores, se pueden cuantificar distancias estructurales y estudiar influencias o cambios de estilo.
- Integración en pipelines de recuperación de información musical (MIR): el modelo puede servir como componente de representación en sistemas más amplios de clasificación, agrupación o recomendación musical.
- Generación de playlists por similitud estructural: servicios de streaming o plataformas educativas pueden sugerir piezas con características armónicas y rítmicas similares a una selección inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible (el modelo funciona tanto en GPU como en CPU, pero no se especifican requisitos mínimos).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el paquete `midisimx` permite ejecución directa en Python; también se puede usar el checkpoint con x-transformers para tareas personalizadas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La información disponible solo permite comparar midisimx con su predecesor midisim, según la tabla incluida en la model card:

| Característica | midisimx | midisim |
|---|---|---|
| Arquitectura | Un modelo unificado más grande | Dos modelos más pequeños |
| Dimensión del modelo | 768 | 512 |
| Profundidad | 16 capas | 16 + 8 capas |
| Cabezas de atención | 12 | 8 |
| Corpus de entrenamiento | 3M+ MIDIs filtrados y procesados | 1M+ MIDIs crudos |
| Representación de eventos | start-time · note/chord · pitch · duration | start-time · duration · pitch |
| Calidad del código | Mejorado, extendido, modernizado | Código original más antiguo |

No se dispone de comparativas con otros modelos de similitud MIDI (como MidiBERT, MuseBERT u otros) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos del corpus: el modelo se entrenó principalmente sobre Discover Piano, lo que puede introducir sesgos hacia estilos de piano y géneros representados en ese dataset.
- Alucinación: no aplica, ya que el modelo no genera contenido, solo produce embeddings.
- Limitaciones de contexto: no se especifica la longitud máxima de secuencia MIDI soportada; piezas muy largas podrían requerir truncamiento o particionado.
- Restricciones de licencia: aunque el modelo base tiene licencia Apache 2.0, los conjuntos de embeddings precomputados (archivos .npy) se distribuyen bajo licencia CC BY-NC-SA, lo que prohíbe su uso comercial sin permiso explícito.
- Dependencia de x-transformers: para tareas personalizadas se requiere la versión 2.3.1 de esta librería, lo que puede limitar la compatibilidad con entornos más recientes.
- Rendimiento en CPU: aunque se soporta CPU, la generación de embeddings en grandes corpus será significativamente más lenta que en GPU; no se proporcionan cifras concretas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/projectlosangeles/midisimx
- Repositorio GitHub: https://github.com/asigalov61/midisimx
- Dataset Discover MIDI: https://huggingface.co/datasets/projectlosangeles/Discover-MIDI-Dataset
- Dataset Discover Piano: https://huggingface.co/datasets/asigalov61/Discover-Piano
- Conjuntos de embeddings precomputados: https://huggingface.co/datasets/projectlosangeles/midisimx-embeddings
- Muestras de salida de búsqueda: https://huggingface.co/datasets/projectlosangeles/midisimx-samples
- Los Angeles MIDI Dataset (Zenodo): https://zenodo.org/records/7485085
