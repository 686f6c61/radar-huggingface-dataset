# mkieffer/eegfm-encoder-100m

## Resumen

EEGFM Encoder 100M es un codificador de electroencefalograma (EEG) de 100 millones de parámetros desarrollado por el usuario mkieffer y publicado en Hugging Face bajo el identificador `mkieffer/eegfm-encoder-100m`. Se trata de un modelo fundacional auto-supervisado que convierte ventanas de EEG de cuero cabelludo en representaciones vectoriales de 768 dimensiones por canal, más una representación agregada (pooled). El modelo está pensado como extractor de características congeladas: sus salidas alimentan cabezas de tarea ligeras (clasificadores lineales, regresores) para tareas de neurociencia como detección de crisis epilépticas, estadificación del sueño o clasificación de actividad cerebral anómala.

La arquitectura combina un codificador convolucional 1-D de tipo ConvNeXt sobre tramas de 20 ms con un transformer pre-norm de 12 capas y anchura 768, aplicando atención con RoPE sobre la dimensión temporal. El preentrenamiento sigue el paradigma JEPA (Joint Embedding Predictive Architecture) con predicción latente enmascarada y un profesor EMA, optimizado con el optimizador Muon. Los pesos se distribuyen en formato `.npz` para un runtime WebAssembly, con variantes en `f32`, `f16` e `i8`.

La relevancia actual del modelo reside en su enfoque de despliegue ligero (86 MB en cuantización `i8`, 171 MB en `f16`) y en su licencia de uso responsable que permite uso comercial con restricciones explícitas. No obstante, la model card no publica resultados numéricos de evaluación en ninguna de las diez tareas de referencia listadas, lo que limita seriamente cualquier evaluación comparativa por parte de terceros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ConvNeXt 1-D (4 bloques, anchura 128) + transformer pre-norm de 12 capas (anchura 768, 12 cabezas, QK-norm, SwiGLU, RoPE) |
| Parámetros totales | 100M (aproximado, según nombre del modelo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de 10 s con 19 canales = 608 tokens; no se especifica límite máximo |
| Tipos de cuantización | `f32`, `f16` (171 MB), `i8` (86 MB, cuantización por fila de salida con escalas float32) |
| Idiomas soportados | no disponible (modelo no lingüístico; procesa señales EEG) |
| Licencia | `eegfm-responsible-use` (uso responsable, permite investigación y uso comercial con restricciones) |
| Formato de pesos | `.npz` (bundles para runtime WebAssembly, miembros almacenados con metadatos JSON) |

## Arquitectura y entrenamiento

El pipeline de entrada procesa EEG a 200 Hz en unidades de 100 µV, tras aplicar un filtro notch de 60 Hz y un paso banda de 0,3–75 Hz, y comprime la señal con `asinh(x / 0.1)`. Cada canal se segmenta en tramas de 20 ms (4 muestras) que pasan por un codificador ConvNeXt 1-D de 4 bloques con anchura 128. Las tramas se agregan por media en fragmentos (chunks) fijos de 320 ms (16 tramas), y cada fragmento recibe un embedding aprendido de su nombre de canal y un embedding de Fourier de su duración. Todos los fragmentos de todos los canales se procesan conjuntamente en un transformer pre-norm de 12 capas con anchura 768, 12 cabezas, QK-norm, SwiGLU y RoPE sobre el tiempo central del fragmento. La salida por canal es la media de sus tokens de fragmento, y la salida agregada es la media sobre canales.

El preentrenamiento es auto-supervisado sin etiquetas, siguiendo un esquema JEPA con predicción latente enmascarada y un profesor EMA, optimizado con Muon. Los datos de entrenamiento provienen del corpus TUH EEG (Temple University Hospital), que consiste en registros clínicos de adultos de un único sistema hospitalario. El repositorio no contiene grabaciones de TUH ni material derivado de grabaciones individuales. No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset más allá de la fuente.

## Capacidades

- Extracción de características EEG: genera un vector de 768 dimensiones por canal y un vector agregado por ventana de entrada.
- Procesamiento de subconjuntos arbitrarios de canales del sistema 10-20, incluyendo derivaciones bipolares nombradas como "A-B".
- Ventanas de 10 s con 19 canales producen 608 tokens de entrada al transformer.
- Soporte de cuantización `f16` e `i8` para despliegue en entornos con recursos limitados.
- Diseñado para alimentar cabezas de tarea congeladas (clasificación lineal, regresión) en tareas downstream de EEG.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un extractor de características, no un modelo generativo.
- No tiene capacidades multilingües ni de visión, audio o texto.
- No dispone de modo "thinking" ni decodificación especulativa.

## Casos de uso

- Detección de crisis epilépticas: el codificador puede generar características congeladas por ventana de 10 s que alimenten un clasificador lineal entrenado sobre CHB-MIT o Siena Scalp EEG, aprovechando la representación auto-supervisada para reducir la necesidad de etiquetas.
- Estadificación del sueño: las características agregadas por ventana pueden usarse como entrada a un modelo ligero que clasifique fases del sueño sobre el dataset HMC Sleep Staging, con la ventaja de que el codificador ya ha aprendido representaciones temporales a escala de 320 ms.
- Detección de actividad cerebral anómala: las representaciones por canal permiten alimentar clasificadores sobre HMS Harmful Brain Activity para identificar patrones anómalos, con la salvedad de que la validación clínica no está demostrada.
- Investigación en representación EEG: el modelo sirve como baseline congelado para comparar arquitecturas downstream en tareas de neurociencia, gracias a su API de extracción de características y a los bundles ligeros para reproducibilidad.
- Despliegue en entornos embebidos o web: los bundles `.npz` de 86 MB (`i8`) y 171 MB (`f16`) están diseñados para un runtime WebAssembly, lo que permite inferencia en navegador o dispositivos con recursos limitados sin GPU dedicada.
- Clasificación de imaginación motora: las características por canal pueden alimentar un clasificador sobre EEG Motor Movement/Imagery (PhysioNet) para interfaces cerebro-computador en investigación, aunque la generalización a otros montajes no está probada.
- Educación y docencia: el modelo y su model card documentan un pipeline completo de preprocesamiento, tokenización y arquitectura, útil para enseñar representación auto-supervisada en señales biomédicas.

## Benchmarks y rendimiento

La model card lista diez tareas de evaluación (adftd, chbmit, hmc, hms6, hms_seizure, nmt_abnormal, nmt_event, nmt_event_type, physionet_mi, siena) con características congeladas y cabezas lineales, pero **no publica ningún valor numérico**: todas las celdas de "Test score" aparecen como `n/a` y el número de ventanas de test como `?`. Tampoco se han publicado los números de equivalencia entre las versiones `f32`, `f16` e `i8` ("equivalence numbers not available yet").

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 100M parámetros, el peso en `f32` ocuparía aproximadamente 400 MB, en `f16` unos 200 MB y en `i8` unos 100 MB, a lo que habría que sumar activaciones y memoria del runtime.
- GPU recomendadas: no disponible; el modelo está empaquetado para un runtime WebAssembly, lo que sugiere despliegue en CPU o entornos ligeros más que en GPU de datacenter.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño (100M parámetros), aunque no se confirma en la documentación.
- Opciones de despliegue: runtime WebAssembly propietario de la librería `eegfm` que lee los bundles `.npz`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros codificadores EEG auto-supervisados en la literatura (por ejemplo, enfoques basados en transformers sobre TUH EEG), pero no se han proporcionado datos de parámetros, contexto, rendimiento ni licencia de alternativas concretas, por lo que no es posible establecer una comparativa rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| eegfm-encoder-100m | 100M | ventana 10 s / 608 tokens | eegfm-responsible-use | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un dispositivo médico: la model card prohíbe explícitamente su uso para diagnóstico, triaje, tratamiento o cualquier decisión clínica. Las puntuaciones provienen de benchmarks retrospectivos y no demuestran validez clínica.
- Generalización no probada: el preentrenamiento se realizó con grabaciones clínicas de adultos de un único sistema hospitalario; no hay evidencia para montajes, amplificadores, poblaciones o condiciones distintas.
- Ausencia total de métricas publicadas: las diez tareas de evaluación aparecen como `n/a`, lo que impide verificar el rendimiento real del modelo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las representaciones pueden producir clasificaciones erróneas sin calibración downstream.
- Sesgos conocidos: no documentados, pero la procedencia única de los datos (un hospital, población adulta) implica un sesgo demográfico y de dominio no cuantificado.
- Restricciones de licencia: la licencia `eegfm-responsible-use` permite uso, modificación y redistribución para investigación y fines comerciales, pero prohíbe re-identificar individuos a partir de EEG, vincular EEG a identidades, vigilancia, perfilado, inferencia de atributos sensibles sin consentimiento informado, uso como única base de una decisión clínica y cualquier violación legal o de los términos de los datos de entrenamiento. Las redistribuciones deben conservar estos términos y la atribución.
- Dependencia de un runtime específico: los pesos se distribuyen en `.npz` para la librería `eegfm` (WebAssembly), no en safetensors ni GGUF, lo que limita la interoperabilidad con ecosistemas estándar.
- Idiomas: no aplica, pero la ausencia de documentación sobre poblaciones no angloparlantes o no adultas refuerza la incertidumbre sobre generalización.

## Enlaces

- Hugging Face: https://huggingface.co/mkieffer/eegfm-encoder-100m
- Licencia: https://huggingface.co/mkieffer/eegfm-encoder-100m/blob/main/LICENSE
- Referencia del corpus TUH EEG: Obeid I, Picone J. The Temple University Hospital EEG Data Corpus. Frontiers in Neuroscience 10:196 (2016).
