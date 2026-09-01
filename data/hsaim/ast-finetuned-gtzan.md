# hsaim/ast-finetuned-gtzan

## Resumen

El modelo `hsaim/ast-finetuned-gtzan` es un Audio Spectrogram Transformer (AST) ajustado sobre el dataset GTZAN para la clasificación de géneros musicales en 10 categorías. Desarrollado por el usuario hsaim, parte del modelo base `MIT/ast-finetuned-audioset-10-10-0.4593`, que fue pre-entrenado en AudioSet para reconocimiento de audio general. Este ajuste fino adapta el modelo a la tarea específica de distinguir géneros como blues, classical, country, disco, hiphop, jazz, metal, pop, reggae y rock.

Con 86,2 millones de parámetros, el modelo emplea la arquitectura de transformador de visión aplicada a espectrogramas de audio, una técnica que ha demostrado un rendimiento competitivo frente a modelos convolucionales tradicionales en tareas de clasificación de audio. El modelo alcanza una precisión del 91 % en la partición de validación de GTZAN, lo que lo sitúa como una opción sólida para aplicaciones de análisis musical. Su relevancia actual radica en que ofrece una solución de código abierto, compacta y eficiente para la clasificación de géneros, con un tamaño que permite su despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST) |
| Parametros totales | 86.196.490 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (entrada de audio, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de audio, no lingüístico) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en el Audio Spectrogram Transformer (AST), que adapta el transformador de visión (ViT) al dominio del audio. La señal de audio se convierte en un espectrograma (representación tiempo-frecuencia) que se divide en parches, los cuales se proyectan linealmente y se procesan mediante capas de atención multi-cabeza. El modelo base fue pre-entrenado en AudioSet, un conjunto de datos masivo con más de 5000 horas de audio etiquetado con 527 clases de eventos sonoros. Sobre este modelo pre-entrenado, se realizó un ajuste fino en el dataset GTZAN, que contiene 1000 clips de audio de 30 segundos distribuidos en 10 géneros musicales. El proceso de ajuste utilizó una partición 90/10 con semilla fija para entrenamiento y validación, logrando una precisión del 91 % en validación. No se dispone de información sobre el número exacto de épocas, tasa de aprendizaje o técnicas de regularización empleadas.

## Capacidades

- Clasificación de géneros musicales en 10 categorías: blues, classical, country, disco, hiphop, jazz, metal, pop, reggae y rock.
- Clasificación de audio general heredada del pre-entrenamiento en AudioSet, aunque el ajuste fino puede haber reducido la generalización a otras tareas.
- Procesamiento de audio de entrada de longitud variable, con una resolución de espectrograma fija definida por el modelo base.
- Inferencia eficiente gracias a su tamaño moderado (86 M de parámetros), adecuada para entornos con recursos limitados.
- Compatible con el ecosistema Hugging Face Transformers, lo que facilita su integración en pipelines de audio.

## Casos de uso

- Organización automática de bibliotecas musicales: el modelo puede etiquetar automáticamente canciones por género, facilitando la catalogación de colecciones personales o comerciales. Su precisión del 91 % en GTZAN lo hace fiable para este fin.
- Sistemas de recomendación musical: al clasificar el género de una pista, se pueden generar listas de reproducción temáticas o sugerir contenido similar basado en la categoría detectada.
- Análisis de tendencias en plataformas de streaming: permite agregar estadísticas de distribución de géneros en catálogos musicales, útil para estudios de mercado o análisis de consumo.
- Moderación de contenido en plataformas de subida de audio: puede verificar que una pista subida por un usuario corresponde al género declarado, ayudando a mantener la coherencia de metadatos.
- Investigación en musicología computacional: sirve como herramienta de anotación automática para estudios sobre evolución de géneros o análisis de corpus musicales.
- Aplicaciones educativas: puede utilizarse en aplicaciones de aprendizaje musical para identificar el género de una pieza y proporcionar información contextual al estudiante.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en la model card:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Clasificacion de audio | GTZAN (marsyas/gtzan) | Accuracy | 0.91 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El valor de 91 % de precisión en GTZAN es consistente con los resultados típicos de modelos AST ajustados en este dataset, que suelen oscilar entre 85 % y 95 % según la configuración.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 350 MB en FP32 (86 M de parámetros × 4 bytes), reducible a ~90 MB con cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo NVIDIA GTX 1050 Ti, RTX 2060, RTX 3060, o incluso CPU para inferencia por lotes pequeños.
- Cabe en GPUs de consumo: sí, es un modelo compacto que puede ejecutarse en hardware de gama baja.
- Opciones de despliegue: Hugging Face Transformers (Python), ONNX Runtime, TensorRT, o mediante servidores de inferencia como TGI (Text Generation Inference) aunque no es su uso principal, y también puede exportarse a TorchScript.
- Latencia y throughput: no se dispone de datos medidos, pero al ser un modelo de 86 M de parámetros, la inferencia en GPU es del orden de milisegundos por clip de 30 segundos.

## Comparativa con modelos similares

Existen otros ajustes finos del mismo modelo base sobre GTZAN, como `khizarAI/AST-finetuned-gtzan` y `MdZakiAfzal/ast-finetuned-gtzan`. No se dispone de datos públicos de rendimiento de estos modelos para comparar directamente. En términos de arquitectura, todos comparten el mismo backbone AST pre-entrenado en AudioSet, por lo que las diferencias se limitan al proceso de ajuste fino (particiones, hiperparámetros, etc.). La licencia de estos modelos tampoco está especificada, lo que supone una limitación para uso comercial.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el modelo es de uso libre para fines comerciales. Se recomienda contactar al autor o verificar la procedencia de los pesos antes de su uso en producción.
- Sesgos del dataset GTZAN: el conjunto de datos contiene música occidental, principalmente de géneros populares, y no representa la diversidad musical global. El modelo puede fallar en géneros no incluidos o en música de otras culturas.
- Riesgo de alucinación: al ser un clasificador de clases cerradas, el modelo siempre asignará una de las 10 etiquetas, incluso si la entrada no corresponde a música o es un género desconocido. Esto puede generar clasificaciones incorrectas sin indicación de incertidumbre.
- Limitaciones de contexto: el modelo procesa espectrogramas de una duración fija (definida por el pre-entrenamiento), por lo que clips más largos o más cortos pueden requerir preprocesamiento adicional.
- Sin soporte multilingüe: al ser un modelo de audio, no procesa texto ni idiomas, aunque la etiqueta de género es universal.
- Tamaño del repositorio: el repositorio ocupa 21.0 GB, lo que es inusualmente grande para un modelo de 86 M de parámetros. Esto puede deberse a archivos adicionales o a pesos en múltiples formatos, lo que podría afectar la descarga y el almacenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hsaim/ast-finetuned-gtzan
- Modelo base: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Dataset GTZAN: https://huggingface.co/datasets/marsyas/gtzan
- Modelo similar (khizarAI): https://huggingface.co/khizarAI/AST-finetuned-gtzan
- Modelo similar (MdZakiAfzal): https://huggingface.co/MdZakiAfzal/ast-finetuned-gtzan
- Análisis de modelo (free2aitools): https://free2aitools.com/model/ramsri818/ast-finetuned-gtzan
