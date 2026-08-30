# AbhijeetK3/ganapati-atharvashirsha-verse-classifier

## Resumen

El modelo `ganapati-atharvashirsha-verse-classifier` es un clasificador de audio fine-tuneado sobre `facebook/wav2vec2-base`, desarrollado por AbhijeetK3, cuyo objetivo declarado es clasificar versos del Ganapati Atharvashirsha, una Upanishad del Atharvaveda dedicada a Ganesha. El modelo realiza clasificación de audio a partir de la representación de la señal de voz, con una arquitectura transformer basada en wav2vec2. Sin embargo, los resultados de entrenamiento publicados en la model card indican que el modelo no ha aprendido a clasificar correctamente: la accuracy de validación es 0.0 en todas las épocas y la loss de validación aumenta progresivamente (de 2.86 a 3.16), lo que sugiere un entrenamiento fallido o un problema grave con los datos.

El repositorio contiene 94.572.688 parámetros en formato safetensors, ocupa 11.3 GB, y fue creado en agosto de 2026. La model card está marcada como generada automáticamente y carece de información esencial: no se especifica el dataset de entrenamiento, los idiomas soportados ni los casos de uso previstos. El modelo está disponible bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-base (transformer encoder) |
| Parametros totales | 94.572.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec2-base de Facebook, un encoder transformer preentrenado de forma autosupervisada sobre audio en bruto. La capa de clasificación añadida sobre la representación de audio permite asignar etiquetas a segmentos de audio, en este caso versos del Ganapati Atharvashirsha. El fine-tuning se realizó con el Trainer de HuggingFace, con una tasa de aprendizaje de 3e-5, batch size de 4, 30 épocas, optimizador AdamW y scheduler lineal. El dataset de entrenamiento no está documentado en la model card.

El proceso de entrenamiento muestra una clara señal de fallo: la loss de entrenamiento desciende de 2.75 a 1.98, pero la loss de validación aumenta de 2.86 a 3.16, y la accuracy se mantiene en 0.0 durante las 30 épocas. Esto indica sobreajuste severo o un problema fundamental con los datos de entrenamiento, como etiquetas incorrectas, clases desbalanceadas o un dataset demasiado pequeño (90 pasos en total para 30 épocas, lo que sugiere un dataset de aproximadamente 90 muestras con batch size 4).

## Capacidades

- Clasificación de audio: el modelo pretende clasificar segmentos de audio correspondientes a versos del Ganapati Atharvashirsha.
- Procesamiento de voz: al estar basado en wav2vec2, procesa audio en bruto sin necesidad de transcripción previa.
- Generacion de texto: no aplica (no es un modelo de lenguaje).
- Razonamiento: no aplica.
- Codigo: no aplica.
- Tool calling: no soportado.
- Agentes: no soportado.
- Capacidades multilingues: no disponible.
- Thinking mode: no disponible.

## Casos de uso

- Clasificacion de recitaciones vedicas: el modelo podria usarse para identificar automaticamente que verso del Ganapati Atharvashirsha se esta recitando en un audio, lo que permitiria indexar bibliotecas de audio espiritual o religioso. Sin embargo, el estado actual del modelo (accuracy 0.0) hace que no sea utilizable para este fin sin un reentrenamiento completo.
- Anotacion de corpus de audio: en un pipeline de investigacion sobre textos sanscritos recitados, el modelo podria etiquetar automaticamente grabaciones con el verso correspondiente. La falta de datos de entrenamiento documentados impide validar esta aplicacion.
- Aplicaciones devocionales: una app de cantos hindues podria usar el modelo para sincronizar la letra con el audio recitado. En su estado actual, el modelo no es capaz de realizar esta tarea.
- Educacion religiosa: herramientas para estudiantes que aprenden recitacion vedica podrian verificar si el alumno recita el verso correcto. Requiere un modelo funcional, que este no es.
- Indexacion de contenido multimedia: para plataformas que alojan contenido religioso, el modelo podria generar metadatos sobre el contenido de audio. La calidad actual del modelo impide su uso en produccion.
- Investigacion en procesamiento de audio sanscrito: como punto de partida para experimentos de fine-tuning sobre audio vedico, aunque los resultados publicados sugieren que la configuracion de entrenamiento necesita una revision completa.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks externos. Los unicos datos disponibles son los resultados de validacion del propio entrenamiento, que muestran una accuracy de 0.0 y una loss de validacion creciente:

| Metrica | Valor |
|---|---|
| Accuracy (validacion) | 0.0 |
| Loss (validacion, epoca 30) | 3.1616 |
| Loss (entrenamiento, epoca 30) | 1.9863 |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: wav2vec2-base tiene 94M de parametros, por lo que en FP32 requiere aproximadamente 380 MB de VRAM. Con cuantizacion a FP16 o int8, el requisito baja a unos 190 MB o 95 MB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente para inferencia (GTX 1050 Ti, RTX 3050, etc.). Para fine-tuning, se recomienda al menos 8 GB.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU consumer moderna.
- Opciones de despliegue: transformers (Python), HuggingFace Inference Endpoints, o exportacion a ONNX para inferencia optimizada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Accuracy | Licencia |
|---|---|---|---|---|
| ganapati-atharvashirsha-verse-classifier | 94.6M | wav2vec2-base | 0.0 | Apache-2.0 |
| facebook/wav2vec2-base (modelo base) | 94.6M | wav2vec2-base | - | Apache-2.0 |
| facebook/wav2vec2-large-xlsr-53 | 317M | wav2vec2-large | - | Apache-2.0 |

La comparacion con el modelo base no es directamente relevante porque wav2vec2-base es un modelo preentrenado sin capa de clasificacion. Los modelos XLSR de mayor tamano ofrecen mejor rendimiento en tareas de reconocimiento de audio multilingue, pero no estan especializados en clasificacion de versos vedicos. No hay modelos comparables publicados especificamente para clasificacion de recitaciones del Ganapati Atharvashirsha.

## Limitaciones y advertencias

- El modelo no es funcional: la accuracy de validacion es 0.0 en todas las epocas, lo que indica que no ha aprendido a clasificar correctamente. No debe usarse en produccion.
- Sobreajuste severo: la loss de entrenamiento desciende mientras la loss de validacion aumenta, sintoma clasico de sobreajuste o de datos de entrenamiento corruptos.
- Dataset no documentado: no se especifica que datos se usaron para el entrenamiento, cuantas clases hay, ni como se procesaron los audios.
- Model card incompleta: la descripcion indica "More information needed" en todas las secciones, lo que impide evaluar el modelo con rigor.
- Tamano del repositorio desproporcionado: 11.3 GB para 94M de parametros sugiere que puede haber archivos adicionales o multiples versiones de pesos.
- Sesgos desconocidos: al no documentarse el dataset, no es posible evaluar sesgos linguisticos, culturales o de calidad de audio.
- Riesgo de alucinacion: no aplica (modelo de clasificacion, no generativo).
- Licencia: Apache-2.0 permite uso comercial, pero el modelo no es utilizable en su estado actual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AbhijeetK3/ganapati-atharvashirsha-verse-classifier
- Modelo base: https://huggingface.co/facebook/wav2vec2-base
- Referencia sobre el Ganapati Atharvashirsha: https://hindushlokas.org/ganesh-atharvashirsha/
- Texto del Ganapati Atharvashirsha: https://www.greenmesg.org/stotras/ganesha/ganapati_atharvashirsha.php
