# laion/audio-data-filter

## Resumen

`laion/audio-data-filter` es un clasificador de audio desarrollado por LAION para el filtrado de datasets de audio a gran escala. Se construye sobre la torre de audio de `laion/clap2-large-audioxl-s1B` (un encoder CLAP2 de tipo AudioXL) y añade dos cabezas de clasificación que devuelven puntuaciones entre 0 y 1 para dos categorías de contenido sensible: `nsfw` (audio sexual explícito) y `gore` (violencia, como disparos con gritos o personas heridas). Un clip se considera marcado cuando la puntuación alcanza o supera 0,5.

El modelo resuelve un problema concreto y acotado: detectar automáticamente audio que no debería formar parte de un corpus de entrenamiento o de un dataset publicado. No es un modelo generativo ni un asistente conversacional, sino una herramienta de curación de datos. Su uso previsto, según el autor, es exclusivamente el filtrado; cualquier otro uso queda fuera de las intenciones declaradas.

Con 167 millones de parámetros y un repositorio de 0,7 GB en formato safetensors, el modelo es ligero en comparación con los encoders de audio de gran tamaño, lo que facilita su despliegue en pipelines de preprocesamiento. La licencia es `other` (no estándar), lo que obliga a revisar los términos concretos antes de cualquier uso comercial. La model card advierte explícitamente de que el modelo comete errores en ambas direcciones y recomienda una segunda verificación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio CLAP2 (torre de audio de `laion/clap2-large-audioxl-s1B`) con dos cabezas de clasificación |
| Parametros totales | 167.021.827 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | clips de audio de hasta 30 segundos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo opera sobre audio, no sobre texto) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza la torre de audio de `laion/clap2-large-audioxl-s1B`, un encoder de la familia CLAP2 (Contrastive Language-Audio Pretraining, segunda generación) en su variante AudioXL. Sobre las representaciones de audio que produce ese encoder se añaden dos cabezas de clasificación independientes, una para `nsfw` y otra para `gore`, que emiten puntuaciones entre 0 y 1. La API expone tanto las puntuaciones como los embeddings de audio, lo que permite reutilizar las representaciones para otras tareas de filtrado sin recalcular el encoder.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). La model card solo indica que la cabeza `nsfw` se evaluó en un conjunto de validación etiquetado por escucha humana, mientras que la cabeza `gore` no se ha evaluado en un conjunto de validación. El modelo requiere `transformers`, `timm` y `torchaudio`, y se carga con `trust_remote_code=True`.

## Capacidades

- Clasificación binaria (con puntuación continua) de audio en dos categorías: contenido sexual explícito (`nsfw`) y violencia (`gore`).
- Procesamiento de clips de audio de hasta 30 segundos de duración.
- Extracción de embeddings de audio junto con las puntuaciones de clasificación.
- Función de filtrado de datasets: identificación de clips que deberían excluirse de un corpus.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo generativo: no produce texto, código ni respuestas conversacionales.
- No dispone de capacidades multilingües en el sentido textual; opera sobre señal de audio.

## Casos de uso

- Curación de datasets de audio a gran escala: el modelo se aplica como paso de preprocesamiento sobre cada clip antes de incorporarlo a un corpus de entrenamiento, descartando o marcando los que superan el umbral en `nsfw` o `gore`. Es adecuado porque procesa clips de hasta 30 segundos y devuelve puntuaciones continuas que permiten ajustar el umbral según la política de cada dataset.
- Filtrado de contenido en plataformas de audio generado por usuarios: integrado en un pipeline de subida, el clasificador puede marcar clips para revisión humana antes de su publicación, usando un umbral bajo (por ejemplo, 0,1) para maximizar la cobertura de la cabeza `nsfw`.
- Auditoría de datasets ya publicados: permite muestrear un corpus existente y estimar la proporción de contenido sensible, comparando las puntuaciones con los metadatos originales del dataset.
- Construcción de conjuntos negativos para entrenamiento: los embeddings de audio que devuelve el modelo pueden reutilizarse para entrenar clasificadores propios o para seleccionar ejemplos negativos limpios en tareas de detección de contenido.
- Moderación de archivos multimedia en repositorios de investigación: aplicado a los ficheros de audio de un repositorio antes de su distribución, ayuda a cumplir políticas de contenido y a evitar la difusión de material sensible.
- Segunda pasada en pipelines de anotación: combinado con un clasificador distinto o con revisión humana, el modelo actúa como filtro de primera línea para reducir el volumen de clips que llegan a los anotadores, tal como recomienda la propia model card.

## Benchmarks y rendimiento

| Metrica | Resultado | Conjunto |
|---|---|---|
| Precisión de la cabeza `nsfw` (umbral 0,1) | ~95 % | Conjunto de validación etiquetado por escucha humana |
| Cabeza `nsfw` (umbral 0,5) | Sin falsos positivos y ~50 % de clips explícitos detectados | Conjunto de validación etiquetado por escucha humana |
| Cabeza `gore` | No evaluada en conjunto de validación | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 167 millones de parámetros en precisión completa (fp32) el modelo ocupa aproximadamente 0,67 GB, y en fp16 alrededor de 0,34 GB, sin contar activaciones ni buffers de audio.
- GPU recomendadas: no disponibles en la información proporcionada; por tamaño, cualquier GPU con al menos 2 GB de VRAM debería poder alojar los pesos, aunque el rendimiento real depende del preprocesamiento de audio.
- Cabe en GPU de consumo: sí, por el tamaño de los pesos (el repositorio completo ocupa 0,7 GB), aunque no se especifican modelos concretos.
- Opciones de despliegue: la model card solo documenta el uso mediante `transformers` con `AutoModel.from_pretrained(..., trust_remote_code=True)`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no cita alternativas ni benchmarks frente a otros clasificadores de audio NSFW o de violencia. Por tanto, la comparativa se declara no disponible.

## Limitaciones y advertencias

- El modelo comete errores en ambas direcciones: omite clips que debería marcar y marca clips que son inocuos, según advierte la propia model card.
- La cabeza `gore` no ha sido evaluada en un conjunto de validación, por lo que su fiabilidad es desconocida.
- La cabeza `nsfw` alcanza ~95 % de precisión solo con un umbral de 0,1; con el umbral por defecto de 0,5 detecta aproximadamente la mitad de los clips explícitos, lo que limita su uso como filtro automático sin revisión posterior.
- El uso previsto es exclusivamente el filtrado de datos; la model card no autoriza otros usos.
- La licencia es `other`, no estándar, lo que exige revisar los términos concretos antes de cualquier uso comercial o de redistribución.
- No se especifican sesgos conocidos, limitaciones idiomáticas ni restricciones de contexto más allá de la duración máxima de 30 segundos por clip.
- Para producción, la model card recomienda añadir una segunda verificación, como revisión humana de los clips marcados y de una muestra de los no marcados.
- El modelo está etiquetado como `not-for-all-audiences` en Hugging Face, lo que refleja la naturaleza sensible de su dominio de aplicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laion/audio-data-filter
- Modelo base: https://huggingface.co/laion/clap2-large-audioxl-s1B
- Repositorio de LAION en Hugging Face: https://huggingface.co/laion
- Referencia citada en la model card (modelo relacionado): https://huggingface.co/gijs/nsfw-audio-classifier
