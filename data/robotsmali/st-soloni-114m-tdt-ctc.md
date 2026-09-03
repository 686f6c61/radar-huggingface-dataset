# RobotsMali/st-soloni-114m-tdt-ctc

## Resumen

`st-soloni-114m-tdt-ctc` es un modelo de traducción de voz (speech translation) de extremo a extremo desarrollado por RobotsMali que convierte audio en bambara directamente a texto en francés. Está basado en la arquitectura FastConformer con un encoder que aplica downsampling convolucional depthwise-separable 8x, y un decoder híbrido RNNT-CTC adaptado para la tarea de traducción. El modelo cuenta con 114 millones de parámetros y se distribuye bajo licencia CC-BY-4.0.

El modelo aborda un problema relevante: la traducción automática de voz para lenguas de bajos recursos como el bambara, hablado principalmente en Malí. Se entrenó en dos etapas: primero como reconocedor automático de voz (ASR) sobre los corpus Jeli-ASR y Kunkado, y después se afinó específicamente para traducción sobre el dataset Jeli-ASR, que contiene aproximadamente 30 horas de audio bambara con traducciones francesas realizadas por hablantes nativos. Es un baseline de investigación, no un sistema listo para producción, y sus traducciones de entrenamiento son semi-profesionales con alta varianza.

Su relevancia actual radica en que demuestra la viabilidad de construir sistemas de traducción de voz para lenguas africanas con pocos recursos, un área tradicionalmente desatendida por la industria. El modelo se publica como referencia para futuras investigaciones en ST de bajos recursos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer encoder + decoder híbrido RNNT-CTC adaptado para speech translation |
| Parametros totales | 114M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | bambara (bm), frances (fr) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (checkpoint de NeMo, probablemente .nemo) |

## Arquitectura y entrenamiento

El modelo utiliza un encoder FastConformer, que incorpora downsampling convolucional depthwise-separable con factor 8 para reducir la complejidad computacional respecto a un Conformer estándar. Aunque originalmente esta arquitectura se diseñó para ASR, aquí se entrena como un sistema de traducción de voz de extremo a extremo: el decoder predice directamente tokens de texto francés a partir de las características del audio bambara, sin pasar por una transcripción intermedia.

El entrenamiento siguió un proceso en dos etapas. Primero se inicializó desde el checkpoint pre-entrenado `RobotsMali/soloni-114m-tdt-ctc-v1`, que fue entrenado para ASR sobre los corpus Jeli-ASR y Kunkado. Después se realizó un fine-tuning sobre el dataset Jeli-ASR (30 horas) con pares audio-francés. Los hiperparámetros incluyen el optimizador AdamW con scheduler Noam, una tasa de aprendizaje máxima de 0.001 y un warmup de 1.000 pasos. Los códigos y configuraciones de fine-tuning están disponibles en el repositorio GitHub `RobotsMali-AI/bambara-asr`.

## Capacidades

- Traducción de voz de extremo a extremo: convierte audio en bambara directamente a texto en francés, sin transcripción intermedia.
- Decodificación dual: soporta tanto decodificación CTC como TDT (token-and-duration transducers), siendo esta última la que ofrece mejores resultados en BLEU.
- Modelo bilingüe específico: entrenado exclusivamente para el par bambara-francés, no es multilingüe.
- No soporta tool calling, ni funciones de agente, ni razonamiento multi-paso: es un modelo de audio a texto, no un LLM.
- No incluye modo de pensamiento ni capacidades de visión o audio más allá de la entrada de voz.

## Casos de uso

- Subtitulado automático de contenido audiovisual en bambara: el modelo puede generar subtítulos en francés a partir de audio bambara, útil para emisoras de radio, televisión o contenido en línea dirigido a audiencias que hablan bambara pero leen francés.
- Acceso a información para hablantes de bambara: permite traducir discursos, noticias o mensajes de audio a texto francés, facilitando el acceso a información escrita a quienes dominan el francés pero no el bambara escrito.
- Investigación en traducción de voz para lenguas de bajos recursos: sirve como baseline para comparar futuros modelos de ST en bambara y otras lenguas africanas, dado que es uno de los pocos sistemas publicados para este par de idiomas.
- Documentación y preservación lingüística: puede ayudar a transcribir y traducir grabaciones de campo en bambara, contribuyendo a la documentación de la lengua.
- Educación bilingüe: en contextos educativos donde el bambara es la lengua oral y el francés la escrita, el modelo puede generar materiales de apoyo traducidos a partir de audio.
- Evaluación de calidad de traducciones: al ser un baseline con métricas publicadas, permite medir el progreso en la tarea y comparar enfoques alternativos.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de test de Jeli-ASR, con dos estrategias de decodificación:

| Benchmark | Decodificacion | WER (%) ↓ | CER (%) ↓ | BLEU ↑ |
|---|---|---|---|---|
| Jeli-ASR Test | CTC | 73.90 | 55.98 | 17.28 |
| Jeli-ASR Test | TDT | 70.43 | 58.17 | 24.18 |

Estos valores indican que la decodificación TDT produce mejor BLEU (24.18) y menor WER (70.43), aunque con un CER ligeramente superior. El WER alto refleja la dificultad de la tarea y la calidad variable de las traducciones de entrenamiento. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero con 114M de parámetros, la inferencia en FP32 requiere aproximadamente 0.5 GB de VRAM; con cuantización a 8 bits o 4 bits, el requisito baja a unos 0.25-0.3 GB.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; una NVIDIA GTX 1650, RTX 3060 o superior funcionará sin problemas. También es viable en CPU para inferencia por lotes pequeños.
- Despliegue: el modelo se carga mediante NVIDIA NeMo (`nemo_toolkit['asr']`), usando la clase `EncDecHybridRNNTCTCBPEModel`. No se mencionan formatos alternativos como ONNX, TensorRT o GGUF.
- Latencia y throughput: no disponibles. Dado el tamaño del modelo, se espera una latencia baja en GPU moderna, pero no hay datos publicados.
- Compatibilidad: el checkpoint se creó con NeMo 2.5.0; versiones más nuevas (2.7.x) pueden fallar al cargarlo debido a un esquema de decodificación estricto. Se proporciona un workaround en la model card.

## Comparativa con modelos similares

No se dispone de modelos comparables directos para traducción de voz bambara-francés en la información proporcionada. Los sistemas ASR multilingües como Whisper de OpenAI podrían transcribir bambara y luego traducir al francés, pero no realizan traducción de voz de extremo a extremo y no se han evaluado en el mismo corpus. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Traducciones de entrenamiento amateur: el dataset Jeli-ASR contiene traducciones semi-profesionales con alta varianza; solo 10 de las 30 horas fueron realizadas por lingüistas entrenados, lo que afecta a la calidad del modelo.
- Rendimiento limitado: con un WER superior al 70% y un BLEU de 24.18, el modelo no es adecuado para uso en producción sin revisión humana exhaustiva.
- Riesgo de alucinación: como todo sistema de generación de texto, puede producir traducciones incorrectas o inventadas, especialmente en audio con ruido o acentos no representados en el entrenamiento.
- Cobertura lingüística restringida: solo cubre el par bambara-francés; no soporta otros idiomas ni variantes dialectales del bambara.
- Compatibilidad frágil con NeMo: el checkpoint requiere NeMo 2.5.0 o un workaround manual para versiones posteriores; esto puede dificultar su integración en entornos actualizados.
- Sin cuantizaciones publicadas: no se ofrecen versiones cuantizadas, lo que limita su despliegue en dispositivos con recursos muy limitados.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero no hay garantías sobre la calidad o idoneidad para aplicaciones críticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RobotsMali/st-soloni-114m-tdt-ctc
- Modelo base (pre-entrenado ASR): https://huggingface.co/RobotsMali/soloni-114m-tdt-ctc-v1
- Dataset Jeli-ASR: https://huggingface.co/datasets/RobotsMali/jeli-asr
- Repositorio de código y configuraciones: https://github.com/RobotsMali-AI/bambara-asr/
- Issue de compatibilidad con NeMo: https://github.com/NVIDIA-NeMo/Speech/issues/15658
