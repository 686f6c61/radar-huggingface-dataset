# Ansu/whisper-tiny-basque

## Resumen

El modelo `Ansu/whisper-tiny-basque` es un sistema de reconocimiento automático del habla (ASR) para euskera, obtenido mediante fine-tuning del modelo base `openai/whisper-tiny` sobre la parte vasca del corpus Mozilla Common Voice 13.0. Lo desarrolla el usuario Ansu y se publica bajo licencia Apache 2.0, lo que permite uso comercial y modificación sin restricciones adicionales. Con 37,7 millones de parámetros, es una de las variantes más ligeras de la familia Whisper, pensada para entornos con recursos limitados o despliegue en dispositivos de baja capacidad.

La relevancia de este modelo radica en que cubre una lengua minoritaria con pocos recursos disponibles en el ecosistema de ASR. Al partir de Whisper-tiny, hereda la arquitectura encoder-decoder transformer y la ventana de audio de 30 segundos, pero adaptada específicamente al euskera. Aunque el autor no detalla el dataset de entrenamiento en la model card, la búsqueda web indica que se usó la porción vasca de Common Voice 13.0, un corpus colaborativo de dominio público. El modelo alcanza un WER de 22,35 % en el conjunto de evaluación reportado por el autor, y un 32,27 % en el split de evaluación de Common Voice según la ficha del proyecto ILENIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-tiny) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 30 segundos de audio (estándar de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Euskera (fine-tuning), aunque el modelo base es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `openai/whisper-tiny`, que emplea una arquitectura transformer encoder-decoder con atención estándar. Whisper-tiny original fue entrenado con 680 000 horas de audio etiquetado de forma débilmente supervisada, pero esta variante se ajusta específicamente para euskera. El entrenamiento se realizó con el framework Transformers 4.38.0 y PyTorch 2.1.1, usando un learning rate de 1e-05, batch de entrenamiento de 256, batch de evaluación de 128, y un scheduler lineal con 500 pasos de warmup. Se ejecutaron 10 000 pasos con precisión mixta nativa (AMP). El dataset de entrenamiento no se especifica en la model card, pero la información externa indica que corresponde a la parte vasca de Mozilla Common Voice 13.0. No se menciona el uso de RLHF ni DPO; el proceso es un fine-tuning supervisado estándar.

## Capacidades

- Reconocimiento automático del habla (ASR) para euskera, transcribiendo audio a texto.
- Soporte de entrada de audio de hasta 30 segundos por ventana, heredado de Whisper.
- Capacidad de identificación de idioma y traducción a inglés en el modelo base, aunque el fine-tuning puede haber reducido estas capacidades al centrarse en euskera.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, al ser un modelo de audio puro.
- Multilingüe en origen, pero el fine-tuning está orientado exclusivamente al euskera; no se garantiza buen rendimiento en otros idiomas.

## Casos de uso

- Transcripción de entrevistas y testimonios en euskera: el modelo puede convertir grabaciones de audio en texto para su posterior análisis, gracias a su tamaño reducido que permite ejecutarlo en portátiles o servidores modestos.
- Subtitulado automático de vídeos en euskera: integrable en pipelines de postproducción para generar subtítulos en este idioma, con una ventana de 30 segundos que cubre frases completas.
- Asistentes de voz para servicios públicos en euskera: al ser ligero, puede desplegarse en edge devices o en la nube con baja latencia, facilitando la interacción hablada en aplicaciones de administración electrónica.
- Archivado y búsqueda de contenido audiovisual: transcripción de archivos históricos en euskera para indexación y recuperación de información, aprovechando la licencia Apache 2.0 para uso comercial.
- Evaluación de calidad de otros sistemas ASR: al ser un modelo pequeño y de referencia, puede usarse como baseline en investigaciones sobre reconocimiento del euskera.
- Aplicaciones educativas de aprendizaje de idiomas: transcripción de pronunciaciones de estudiantes para retroalimentación automática, con un coste computacional mínimo.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (dataset no especificado):

| Metrica | Valor |
|---|---|
| Loss | 0,3234 |
| WER | 22,3492 % |

Además, según la ficha del proyecto ILENIA, el modelo alcanza un WER de 32,27 % en el split de evaluación de Mozilla Common Voice 13.0. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 37,7 M de parámetros, la inferencia en FP32 requiere aproximadamente 150 MB de memoria, y en FP16 unos 75 MB. Con cuantización a 8 bits podría bajar a ~40 MB, aunque no se documentan cuantizaciones específicas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA GTX 1050 Ti o superior puede ejecutarlo sin problemas. También funciona en CPU con razonable latencia.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, o incluso en Raspberry Pi con optimizaciones.
- Opciones de despliegue: compatible con Hugging Face Transformers, y puede usarse con vLLM, llama.cpp (si se convierte a GGUF) u Ollama, aunque no hay soporte oficial documentado.
- Latencia y throughput: no se proporcionan datos oficiales; en una GPU moderna se espera una transcripción en tiempo real o más rápida para audios de 30 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (euskera) | Licencia |
|---|---|---|---|---|
| Ansu/whisper-tiny-basque | 37,7 M | 30 s | 22,35 % (eval autor) / 32,27 % (Common Voice) | Apache 2.0 |
| Ansu/whisper-small-basque | no disponible | 30 s | no disponible | Apache 2.0 (presumible) |
| openai/whisper-tiny (base) | 39 M | 30 s | no disponible (no entrenado para euskera) | MIT |

El modelo hermano `whisper-small-basque` existe pero no se dispone de sus métricas. La comparación con el base es orientativa: el fine-tuning mejora el rendimiento en euskera, aunque el base no está optimizado para este idioma.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado en la model card, lo que dificulta evaluar posibles sesgos o cobertura dialectal.
- El WER reportado por el autor (22,35 %) proviene de un conjunto de evaluación desconocido; el WER en Common Voice (32,27 %) es más alto, lo que sugiere sensibilidad al dominio y a la calidad del audio.
- Al ser un modelo pequeño, puede tener dificultades con acentos muy marcados, ruido de fondo o vocabulario técnico específico.
- No se garantiza el rendimiento en otros idiomas distintos del euskera, a pesar de que el modelo base es multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la precisión o idoneidad para aplicaciones críticas.
- No se documentan cuantizaciones oficiales; el usuario deberá convertirlas si necesita optimización adicional.

## Enlaces

- [Hugging Face - Ansu/whisper-tiny-basque](https://huggingface.co/Ansu/whisper-tiny-basque)
- [Hugging Face - Ansu/whisper-small-basque](https://huggingface.co/Ansu/whisper-small-basque)
- [GitHub - openai/whisper](https://github.com/openai/whisper)
- [Proyecto ILENIA - Whisper Tiny Basque](https://proyectoilenia.es/en/recurso/whisper-tiny-basque/)
