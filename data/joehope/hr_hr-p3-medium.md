# joehope/hr_HR-p3-medium

## Resumen

`hr_HR-p3-medium` es un modelo de síntesis de voz (text-to-speech) para croata, desarrollado por el usuario joehope y publicado en Hugging Face. Se trata de una voz Piper basada en la arquitectura VITS, de un solo hablante y calidad media, que genera audio a 22,05 kHz. El modelo se ha obtenido mediante un ajuste fino (warmstart) a partir de un checkpoint Piper de un idioma relacionado, un flujo de trabajo documentado y estándar dentro del ecosistema Piper.

El modelo resuelve la necesidad de disponer de una voz TTS en croata ejecutable en local, sin dependencia de servicios en la nube. Se distribuye en formato ONNX, lo que permite su despliegue tanto con la CLI de Piper como con sherpa-onnx, y se ofrece además un checkpoint de PyTorch Lightning para que otros desarrolladores puedan ajustar sus propias voces en croata.

Su relevancia es acotada pero práctica: cubre un idioma con poca representación en el ecosistema TTS open source y lo hace con un modelo ligero (repo de 0,4 GB) y una licencia CC BY-SA 4.0. No es un modelo de propósito general, sino una voz concreta dentro del pipeline de Piper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Piper) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo TTS) |
| Tipos de cuantizacion | fp32 (nativo) e int8 dinamica (QuantType.QUInt8) |
| Idiomas soportados | croata (hr) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX (fp32 e int8), checkpoint PyTorch Lightning (.ckpt) |
| Frecuencia de muestreo | 22,05 kHz |
| Numero de hablantes | 1 (single-speaker) |
| Calidad declarada | media |
| Tamano del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo emplea VITS, una arquitectura de síntesis de voz de extremo a extremo que combina un codificador de texto, un prior variacional, un decodificador generativo y un discriminador adversarial, y que se entrena de forma conjunta con pérdidas de reconstrucción, adversariales y de alineamiento por monotonic alignment search. Piper empaqueta esta arquitectura en un formato ONNX optimizado para inferencia en CPU.

Según la model card, el entrenamiento se realizó sobre un corpus de habla croata de un solo hablante. El punto de partida fue un checkpoint Piper de un idioma relacionado, obtenido del dataset `rhasspy/piper-checkpoints` de Hugging Face, mediante la técnica de warmstart cross-lingual que Piper documenta como flujo estándar. No se especifican en la información disponible el número de horas de audio, el número de pasos de entrenamiento ni detalles sobre el dataset más allá de la descripción genérica.

El repositorio incluye un checkpoint `hr_HR-p3-medium-warmstart.ckpt` con el estado del optimizador eliminado (aproximadamente un tercio del tamaño original), pensado para que terceros puedan ajustar sus propias voces croatas mediante `--model.warmstart_ckpt`. No está diseñado para reanudar un entrenamiento exacto mediante `--ckpt_path`.

## Capacidades

- Síntesis de voz en croata a partir de texto, con salida de audio a 22,05 kHz.
- Fonemización mediante espeak-ng (voz `hr`), lo que permite manejar texto croata con la tabla de fonemas a identificadores incluida en el bundle de sherpa-onnx.
- Inferencia en CPU gracias al formato ONNX, sin necesidad de GPU.
- Dos variantes de precisión: fp32 para máxima calidad e int8 dinámica para mayor velocidad con menor calidad.
- Despliegue mediante CLI de Piper y mediante sherpa-onnx (CLI en C++ o API de Python).
- Punto de partida para ajuste fino de nuevas voces croatas mediante el checkpoint warmstart.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura de contenido web en croata: integración de la CLI de Piper en un servicio que convierta artículos o noticias a audio, aprovechando que el modelo corre en CPU y no requiere infraestructura GPU.
- Accesibilidad para personas con discapacidad visual: generación de audio bajo demanda para lectores de pantalla en croata, con la variante fp32 para priorizar la inteligibilidad.
- Asistentes de voz locales y sin conexión: despliegue con sherpa-onnx en dispositivos de borde, ya que el modelo ONNX es ligero y no depende de servicios externos.
- Generación de audiolibros o pódcasts de bajo coste: síntesis por lotes de textos largos en croata con la variante int8 cuando el throughput prime sobre la calidad.
- Prototipado de interfaces conversacionales: uso de la API de Python de sherpa-onnx para integrar la síntesis en un pipeline de diálogo, con control de velocidad mediante el parámetro `speed`.
- Investigación en TTS de bajos recursos: el checkpoint warmstart permite experimentar con ajuste fino de voces croatas partiendo de un modelo ya entrenado, reduciendo el coste computacional frente a entrenar desde cero.
- Pruebas de calidad y evaluación de voces: comparación entre las variantes fp32 e int8 para medir el impacto de la cuantización en la naturalidad del audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas objetivas (MOS, WER, RTF) ni comparaciones cuantitativas con otras voces.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso habitual, ya que el modelo está pensado para ejecutarse en CPU mediante ONNX Runtime. En GPU, el modelo es lo suficientemente pequeño como para caber en cualquier GPU consumer, pero no se proporcionan cifras de VRAM.
- GPU recomendadas: no se especifican; el modelo no requiere GPU.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño del repositorio (0,4 GB) y que el modelo fp32 es la variante de mayor tamaño.
- Opciones de despliegue: CLI de Piper (`piper -m ... -c ...`), sherpa-onnx (CLI en C++ o API de Python, con la versión `sherpa-onnx==1.10.46` fijada según la model card) y ajuste fino mediante `python3 -m piper.train fit`.
- Latencia y throughput estimados: no disponibles. La model card solo indica que la variante int8 es más rápida que la fp32, sin cifras.

## Comparativa con modelos similares

| Modelo | Idioma | Arquitectura | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `joehope/hr_HR-p3-medium` | Croata | VITS (Piper) | 22,05 kHz | CC BY-SA 4.0 | Hugging Face |
| Voces Piper `rhasspy/piper-voices` (p. ej. `en_US-lessac-medium`) | Inglés y otros | VITS (Piper) | 22,05 kHz | MIT (según el proyecto Piper) | Hugging Face |
| Voces sherpa-onnx VITS Piper | Múltiples | VITS (Piper) | 22,05 kHz | Variable según voz | GitHub / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas voces en la información proporcionada. La comparación se limita a aspectos estructurales: misma familia arquitectónica (VITS/Piper), misma frecuencia de muestreo y formatos de despliegue equivalentes. La diferencia principal es la cobertura del croata y la licencia CC BY-SA 4.0, más restrictiva que la MIT de algunas voces Piper de referencia.

## Limitaciones y advertencias

- Es un modelo de un solo hablante: no permite cambiar de voz ni de estilo sin reentrenar.
- Calidad declarada como media; no se han publicado métricas objetivas de naturalidad ni de inteligibilidad.
- Solo soporta croata; no es multilingüe.
- La cuantización int8 reduce la calidad de forma explícita según la model card; debe usarse solo cuando la velocidad sea prioritaria.
- Licencia CC BY-SA 4.0: cualquier redistribución de los pesos o de obras derivadas debe mantener la misma licencia y conservar el aviso de atribución. La model card pide tratar los pesos como sujetos a esta licencia hasta que se confirme lo contrario.
- La model card advierte de problemas concretos de integración con sherpa-onnx: la versión 2.0.1 de PyPI falla al inicializar el frontend de espeak y devuelve cero muestras sin error en carga; debe fijarse la versión 1.10.46. Además, el directorio `espeak-ng-data` debe provenir de un tarball de release de sherpa-onnx, no del sistema ni de Piper, y la API de Python requiere pasar `lexicon=""` explícitamente.
- Riesgo de alucinación no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de pronunciación incorrecta en palabras fuera del vocabulario o de fonemización errónea por parte de espeak-ng.
- No se documentan sesgos demográficos ni de otro tipo, pero al entrenarse con un único hablante, la voz refleja sus características y no representa la variabilidad del croata.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/joehope/hr_HR-p3-medium
- Repositorio de Piper: https://github.com/rhasspy/piper
- Dataset de checkpoints de Piper: https://huggingface.co/datasets/rhasspy/piper-checkpoints
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Tarball de referencia para `espeak-ng-data`: https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-en_US-lessac-medium.tar.bz2
