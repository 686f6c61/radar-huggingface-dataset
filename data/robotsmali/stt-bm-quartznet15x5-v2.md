# RobotsMali/stt-bm-quartznet15x5-v2

## Resumen

`stt-bm-quartznet15x5-v2` es un modelo de reconocimiento automático del habla (ASR) para el idioma bambara (bm), desarrollado por RobotsMali como parte de un esfuerzo de investigación para dotar de tecnologías de voz a lenguas africanas de bajos recursos. Se trata de un fine-tuning del modelo base `RobotsMali/stt-bm-quartznet15x5-v0` sobre un subconjunto de 100 horas del dataset African Next Voices, y está entrenado con la librería NVIDIA NeMo utilizando pérdida CTC (Connectionist Temporal Classification).

El modelo emplea una arquitectura convolucional QuartzNet 15x5, con aproximadamente 18 millones de parámetros, optimizada para transcripción de audio en tiempo real en entornos con recursos limitados. Su relevancia radica en que aborda la escasez de sistemas ASR para lenguas minorizadas, ofreciendo una solución ligera y de código abierto bajo licencia CC-BY-4.0. No obstante, el propio autor advierte que es parte de un trabajo en curso y que puede no generalizar bien en todas las condiciones de habla y dialectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (convolucional 1D con convoluciones separables por canal y tiempo) |
| Parametros totales | 18 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa audio de duración variable, sin ventana fija declarada) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en formato nativo de NeMo) |
| Idiomas soportados | Bambara (bm) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | .nemo (checkpoint de NeMo) |

## Arquitectura y entrenamiento

QuartzNet es una familia de arquitecturas convolucionales para ASR que utiliza convoluciones 1D separables por canal y por tiempo, lo que reduce drásticamente el número de parámetros frente a modelos recurrentes o transformadores. En concreto, la variante 15x5 se compone de 15 bloques convolucionales con 5 repeticiones internas, y se entrena con pérdida CTC, que alinea automáticamente la secuencia de audio con la transcripción sin necesidad de segmentación previa.

El modelo fue fine-tuneado a partir de `RobotsMali/stt-bm-quartznet15x5-v0` durante 62.976 pasos de entrenamiento, utilizando un subconjunto de 100 horas del dataset `RobotsMali/afvoices`. El proceso se realizó con NVIDIA NeMo 2.5.0 y los manifiestos de datos están disponibles en el repositorio GitHub del proyecto. No se menciona el uso de técnicas como RLHF o DPO, dado que es un modelo de reconocimiento de voz, no generativo. El modelo transcribe con un esquema de codificación de caracteres y no genera puntuación ni mayúsculas.

## Capacidades

- Transcripción de audio en bambara a texto plano, sin puntuación ni capitalización.
- Acepta audio mono de 16 kHz como entrada estándar, aunque incluye un preprocesador que permite audios con frecuencias de muestreo superiores.
- Inferencia rápida gracias a su arquitectura convolucional ligera (18M de parámetros).
- Decodificación CTC con modo greedy y beam search (aunque los benchmarks reportados usan greedy sin LM externo).
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente de reconocimiento de voz.
- Capacidad multilingüe limitada: únicamente bambara.

## Casos de uso

- Transcripción de entrevistas y testimonios orales en bambara: el modelo puede convertir grabaciones de campo en texto para su archivo y análisis, facilitando la documentación de lenguas minorizadas.
- Subtitulado automático de vídeos en bambara: integrado en un pipeline de postproducción, permite generar subtítulos para contenido audiovisual dirigido a hablantes de bambara.
- Asistentes de voz para aplicaciones móviles: al ser ligero, puede desplegarse en dispositivos de gama baja o en servidores modestos para habilitar comandos por voz en apps de servicios locales.
- Accesibilidad para personas con discapacidad visual o dificultades de lectura: convierte contenido hablado en texto legible, mejorando el acceso a la información en bambara.
- Investigación lingüística y preservación cultural: los investigadores pueden transcribir corpus orales de bambara para estudios fonéticos, morfológicos o sociolingüísticos.
- Evaluación de calidad de audio en telecomunicaciones: el modelo puede usarse para medir la inteligibilidad de señales de voz en bambara en sistemas de telefonía o radiodifusión.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes, medidos con decodificación greedy sin modelo de lenguaje externo:

| Benchmark | WER (%) | CER (%) |
|---|---|---|
| African Next Voices (test) | 42.57 | 18.70 |
| Nyana Eval (test) | 48.97 | 24.22 |

Estos valores indican que el modelo tiene una tasa de error de palabra relativamente alta, especialmente en el conjunto Nyana Eval, lo que refleja las dificultades de generalización a diferentes condiciones de habla y dialectos. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo de 18M de parámetros, la inferencia es viable en CPU, con un uso de memoria muy reducido (el checkpoint ocupa aproximadamente 0.1 GB).
- En GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente; por ejemplo, una NVIDIA GTX 1050 Ti o superior puede ejecutarlo sin problemas.
- Es adecuado para despliegue en dispositivos edge, Raspberry Pi o servidores de bajo coste.
- El framework de referencia es NVIDIA NeMo, aunque también podría convertirse a otros formatos (ONNX, TensorRT) para entornos de producción.
- No se dispone de datos de latencia o throughput específicos, pero dada la arquitectura convolucional, se espera una latencia inferior a la de modelos recurrentes de tamaño similar.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para bambara en la documentación proporcionada. Dado que el bambara es una lengua de bajos recursos, existen muy pocos sistemas ASR públicos para este idioma, y este modelo es uno de los pocos accesibles. Se recomienda consultar el repositorio de RobotsMali para posibles actualizaciones o modelos alternativos.

## Limitaciones y advertencias

- El modelo no produce puntuación ni mayúsculas, lo que puede dificultar la legibilidad de las transcripciones en aplicaciones que requieran texto formateado.
- La generalización es limitada: el autor advierte que puede fallar en condiciones de habla no representadas en el dataset de entrenamiento, como acentos regionales, ruido de fondo o velocidades de habla extremas.
- El idioma soportado es exclusivamente bambara; no es adecuado para otros idiomas.
- La licencia CC-BY-4.0 permite uso comercial, pero exige atribución al autor. Es necesario verificar el cumplimiento de esta condición en cada caso.
- Existe un problema de compatibilidad conocido con versiones recientes de NeMo (2.7.x) que puede provocar fallos al cargar el checkpoint; se proporciona un workaround en la documentación.
- Al ser un modelo en fase de investigación, es probable que haya errores de transcripción no documentados; se recomienda validar los resultados en aplicaciones críticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RobotsMali/stt-bm-quartznet15x5-v2
- Modelo base: https://huggingface.co/RobotsMali/stt-bm-quartznet15x5-v0
- Dataset African Next Voices: https://huggingface.co/datasets/RobotsMali/afvoices
- Repositorio de código y configuración: https://github.com/RobotsMali-AI/bambara-asr/
- Issue de compatibilidad con NeMo 2.7.x: https://github.com/NVIDIA-NeMo/Speech/issues/15658
