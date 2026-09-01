# ai4bharat/bhili-asr-nemotron-600m

## Resumen

El modelo `ai4bharat/bhili-asr-nemotron-600m` es un sistema de reconocimiento automático del habla (ASR) desarrollado por AI4Bharat, el laboratorio de investigación del IIT Madras, para la lengua bhili (भीली), una lengua indo-aria hablada por el pueblo bhil en el oeste de la India. Se trata de un ajuste fino del modelo base `ai4bharat/indic-conformer-600m-multilingual`, entrenado con aproximadamente 100 horas de habla bhili leída y espontánea. El modelo aborda el problema de la falta de recursos de ASR para lenguas indias de bajos recursos, ofreciendo una solución de transcripción automática para una lengua que carece de sistemas comerciales.

La arquitectura se basa en un conformer de 600 millones de parámetros, una variante del transformer adaptada a tareas de audio que combina atención y convoluciones para modelar dependencias temporales. El modelo se distribuye bajo licencia MIT, aunque el acceso al repositorio está restringido y requiere aceptar condiciones en HuggingFace. Su relevancia actual radica en la creciente demanda de tecnologías del habla para lenguas minoritarias de la India, donde la mayoría de los sistemas ASR se centran en lenguas mayoritarias como hindi, tamil o bengalí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (basada en indic-conformer-600m-multilingual) |
| Parametros totales | 600 millones (estimado, no confirmado en la ficha) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Bhili (भीली) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 2.6 GB, probablemente safetensors o checkpoint de NeMo) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del `indic-conformer-600m-multilingual`, un modelo de reconocimiento de voz multilingüe para lenguas indias basado en la arquitectura conformer. El conformer combina capas de atención multi-cabeza con convoluciones profundas, lo que permite capturar tanto dependencias de largo alcance como patrones locales en la señal de audio. El entrenamiento se realizó sobre aproximadamente 100 horas de datos de habla bhili, que incluyen tanto lectura de textos como habla espontánea, recopilados por AI4Bharat. No se especifica si se aplicaron técnicas de alineación o refuerzo como RLHF o DPO, ya que se trata de una tarea de ASR supervisada. El modelo se distribuye a través de la librería NeMo de NVIDIA, lo que sugiere que el checkpoint está en formato compatible con NeMo.

## Capacidades

- Transcripción automática de audio en bhili a texto.
- Reconocimiento de habla leída y espontánea, cubriendo diferentes estilos de elocución.
- Soporte de streaming (según las etiquetas del modelo, incluye la etiqueta "streaming"), lo que permite procesamiento en tiempo real de audio.
- Integración con el ecosistema NeMo para despliegue en pipelines de ASR.
- Capacidad de adaptación a otros dominios mediante ajuste fino adicional, dado que parte de un modelo multilingüe base.

## Casos de uso

- Transcripción de entrevistas y testimonios orales en bhili: el modelo puede convertir grabaciones de campo en texto para su archivo y análisis, útil para antropólogos y lingüistas que trabajan con comunidades bhil.
- Creación de subtítulos para vídeos en bhili: permite generar subtítulos automáticos para contenido audiovisual en esta lengua, facilitando el acceso a medios locales.
- Asistente de voz para aplicaciones móviles en bhili: integrado en apps de servicios públicos o agricultura, puede transcribir comandos de voz de usuarios que no saben leer ni escribir en otras lenguas.
- Documentación de lenguas en peligro: el modelo ayuda a digitalizar y preservar la lengua bhili, creando corpus transcritos que sirven para estudios lingüísticos y educativos.
- Servicios de accesibilidad: transcripción en tiempo real para personas con discapacidad auditiva que usan bhili como lengua principal, mediante la integración con sistemas de subtitulado en directo.
- Investigación en ASR de bajos recursos: sirve como punto de partida para experimentos de transferencia de aprendizaje y adaptación a otras lenguas indias minoritarias, dado su origen en un modelo multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como WER (Word Error Rate) o CER (Character Error Rate) en la ficha de HuggingFace ni en los repositorios vinculados. Se recomienda consultar el repositorio de GitHub de AI4Bharat para futuras actualizaciones con resultados de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: con 600 millones de parámetros y un tamaño de repositorio de 2.6 GB, se estima que el modelo en precisión FP32 requiere aproximadamente 2.4 GB de VRAM solo para los pesos, más memoria para activaciones. Con cuantización a 8 bits, podría reducirse a unos 1.2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 o con cuantización ligera. Tarjetas como NVIDIA GTX 1660, RTX 2060 o superiores son suficientes para inferencia por lotes pequeños.
- En consumer GPU: sí, cabe en GPUs de gama media como RTX 3060 o RTX 4060 con 8 GB de VRAM, incluso en FP16.
- Opciones de despliegue: al ser un modelo NeMo, se puede servir con NVIDIA Riva o con el framework NeMo de inferencia. También es posible convertirlo a ONNX o TensorRT para optimización. Para despliegue ligero, se podría exportar a formato GGUF si se adapta, aunque no está confirmado.
- Latencia y throughput: no disponible. Dependerá del hardware y del tamaño de lote. Para un modelo de 600M, se espera una latencia de decodificación de unos pocos cientos de milisegundos por utterance en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ai4bharat/bhili-asr-nemotron-600m | 600M | no disponible | Bhili | MIT | Gated en HF |
| ai4bharat/indic-conformer-600m-multilingual | 600M | no disponible | Multilingüe (22 lenguas indias) | MIT | Abierto en HF |
| ai4bharat/bhili-asr (versión anterior) | no disponible | no disponible | Bhili | MIT | Abierto en HF |

El modelo se distingue de su base multilingüe por estar especializado exclusivamente en bhili, lo que debería ofrecer mejor precisión en esta lengua frente al modelo generalista. La versión anterior `ai4bharat/bhili-asr` (sin el sufijo nemotron) parece ser un checkpoint previo, posiblemente con menos datos o arquitectura diferente. No se dispone de comparativas con otros ASR comerciales o de código abierto para bhili, ya que es una lengua de muy bajos recursos.

## Limitaciones y advertencias

- El modelo se ha entrenado con solo 100 horas de datos, lo que limita su robustez ante acentos, ruido de fondo y vocabulario fuera del dominio de entrenamiento.
- Puede presentar errores de transcripción en habla espontánea con solapamiento de hablantes o dialectos regionales del bhili.
- El acceso al repositorio está restringido (gated), lo que requiere solicitar permiso a AI4Bharat, aunque la licencia MIT permite uso comercial una vez obtenido el acceso.
- No se han publicado métricas de rendimiento, por lo que no es posible evaluar su calidad objetiva frente a otros sistemas.
- El modelo está diseñado únicamente para bhili; no soporta otras lenguas indias ni inglés, a pesar de su origen multilingüe.
- La documentación no especifica la longitud de contexto de audio soportada, lo que puede afectar a la transcripción de clips largos sin segmentación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ai4bharat/bhili-asr-nemotron-600m
- Modelo base multilingüe: https://huggingface.co/ai4bharat/indic-conformer-600m-multilingual
- Repositorio GitHub de AI4Bharat para bhili: https://github.com/AI4Bharat/bhili-models
- Página de AI4Bharat: https://ai4bharat.iitm.ac.in/
