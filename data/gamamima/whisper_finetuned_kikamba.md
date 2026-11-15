# gamamima/whisper_finetuned_kikamba

## Resumen

`gamamima/whisper_finetuned_kikamba` es un ajuste fino del modelo Whisper de OpenAI para reconocimiento automatico del habla (ASR) en kikamba (kamba), una lengua bantú hablada principalmente en Kenia. Lo publica el usuario `gamamima` en Hugging Face con licencia MIT y un total de 241.734.912 parametros, lo que corresponde a la variante Whisper Small de la familia original. El modelo se distribuye en formato safetensors y es compatible con la libreria `transformers` y con endpoints de inferencia.

El modelo resuelve un problema muy concreto: la escasez de sistemas ASR funcionales para lenguas de bajos recursos. Whisper, entrenado mayoritariamente con audio de lenguas de altos recursos, rinde mal en kikamba sin ajuste; este checkpoint se ha especializado usando el subconjunto `Digital-Divide-Data/Kamba-ASR-Data-Subset-484H`, presumiblemente unas 484 horas de audio transcrito. Es relevante para investigadores y desarrolladores que trabajan en preservacion linguistica, acceso a servicios por voz en comunidades kamba o evaluacion de tecnicas de adaptacion de ASR multilingue.

La model card es practicamente una plantilla autogenerada sin datos tecnicos rellenados (entrenamiento, hiperparametros, evaluacion y sesgos aparecen como "More Information Needed"), por lo que gran parte de las especificaciones de esta ficha deben inferirse de la arquitectura Whisper Small y del identificador del dataset, y se marcan explicitamente como no disponibles cuando no hay confirmacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small, ajustado) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (arquitectura Whisper); contexto textual de 448 tokens |
| Tipos de cuantizacion | no disponible en el repositorio (pesos en safetensors, presumiblemente fp32/fp16); compatible con cuantizacion via herramientas externas |
| Idiomas soportados | kikamba (objetivo del ajuste); el resto de idiomas de Whisper no estan garantizados tras el fine-tuning |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper Small: un transformer encoder-decoder con aproximadamente 244 millones de parametros, disenado originalmente por OpenAI para ASR multilingue y traduccion de voz. El encoder procesa espectrogramas Mel de 80 canales sobre ventanas de 30 segundos; el decoder genera tokens de texto condicionados por tokens de control de idioma y tarea. El ajuste fino parte de los pesos preentrenados de Whisper Small y se especializa en kikamba, lo que en la practica reorienta el decoder hacia el vocabulario y la fonetica de esa lengua.

El unico dato de entrenamiento confirmado es el dataset `Digital-Divide-Data/Kamba-ASR-Data-Subset-484H`, que por su nombre sugiere un subconjunto de aproximadamente 484 horas de audio kamba. No se especifican en la model card el numero de pasos, la tasa de aprendizaje, el regimen de precision (fp16/bf16), el uso de aumentacion de datos ni si hubo etapas de RLHF o DPO (no aplicables tipicamente a ASR). Tampoco se documenta si se congelaron capas del encoder o se entreno el modelo completo. Cualquier innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion) no esta disponible.

## Capacidades

- Transcripcion de voz a texto en kikamba sobre segmentos de hasta 30 segundos.
- Manejo de audio de entrada a 16 kHz con normalizacion estandar de Whisper.
- Generacion de marcas de tiempo a nivel de segmento (capacidad heredada de Whisper, sujeta a validacion tras el ajuste).
- Procesamiento por lotes de audio mediante `pipeline("automatic-speech-recognition")` de transformers.
- Compatibilidad con endpoints de inferencia de Hugging Face (`endpoints_compatible` en los tags).
- Capacidades multilingues: solo kikamba esta validado; el resto de idiomas de Whisper puede degradarse por el ajuste fino.
- No se documenta soporte de tool calling, agentes, vision, audio de salida ni modo "thinking"; no son capacidades propias de un modelo ASR.

## Casos de uso

- Transcripcion de entrevistas y testimonios orales en kikamba para proyectos de documentacion linguistica: el modelo convierte grabaciones de campo en texto editable, reduciendo el trabajo manual de transcripcion que hoy hacen hablantes nativos.
- Subtitulado de contenido audiovisual en kikamba: integrado en un pipeline con `ffmpeg` para extraer audio a 16 kHz y el pipeline de transformers para generar subtitulos con marcas de tiempo.
- Atencion ciudadana por voz en zonas donde el kikamba es lengua principal: transcripcion de llamadas o mensajes de voz para su enrutamiento o analisis posterior, siempre con revision humana dada la ausencia de metricas publicadas.
- Investigacion en ASR de bajos recursos: punto de partida para experimentos de adaptacion, comparacion de estrategias de fine-tuning o evaluacion de tecnicas de aumentacion sobre lenguas bantu.
- Preservacion digital del patrimonio oral: conversion masiva de archivos de audio historicos a corpus textual buscable, con un modelo ligero (240 M de parametros) que se ejecuta en hardware modesto.
- Prototipado de asistentes de voz locales: al ser un modelo pequeno y con licencia MIT, puede desplegarse en estaciones de trabajo o servidores pequenos para demostraciones de dictado o busqueda por voz en kikamba.
- Evaluacion comparativa de checkpoints Whisper ajustados: sirve como referencia dentro de estudios que miden el impacto del ajuste fino en lenguas africanas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, CER ni ninguna otra metrica de evaluacion, ni datos de comparacion con Whisper Small original u otros modelos ASR para kikamba.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp32 (242 M de parametros), en torno a 0,5 GB en fp16 y menos de 0,5 GB en cuantizacion int8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque el modelo esta sobredimensionado para estas ultimas.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia por lotes de audio corto.
- Opciones de despliegue: `transformers` con el pipeline de ASR, endpoints de Hugging Face, y conversion a otros formatos (por ejemplo ONNX o CTranslate2) mediante herramientas externas; no se documenta soporte nativo de llama.cpp u Ollama, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles; al tratarse de Whisper Small, se espera un rendimiento del orden de decenas de veces tiempo real en GPU moderna, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gamamima/whisper_finetuned_kikamba` | 241,7 M | 30 s por segmento | kikamba (ajustado) | MIT | Hugging Face |
| `openai/whisper-small` | 244 M | 30 s por segmento | ~99 idiomas (kikamba no garantizado) | MIT | Hugging Face, OpenAI |
| `openai/whisper-base` | 74 M | 30 s por segmento | ~99 idiomas | MIT | Hugging Face, OpenAI |
| `facebook/mms-1b-all` | ~1 B (adaptadores por idioma) | variable | >1000 idiomas | CC-BY-NC 4.0 | Hugging Face |

La comparacion con Whisper Small original es la mas directa: misma arquitectura y practicamente el mismo numero de parametros, pero con especializacion en kikamba. Frente a MMS de Meta, este checkpoint es mucho mas ligero y con licencia permisiva (MIT frente a CC-BY-NC), aunque MMS cubre muchas mas lenguas. No hay datos de rendimiento publicados para establecer comparaciones cuantitativas de WER.

## Limitaciones y advertencias

- Ausencia total de metricas de evaluacion: no se puede afirmar la calidad del modelo sin una validacion propia sobre un conjunto de test independiente.
- Riesgo de alucinacion y de salida repetitiva: los modelos Whisper ajustados con pocos datos pueden generar texto plausible no presente en el audio, especialmente con ruido o acentos no vistos.
- Sesgo de dominio: el dataset de entrenamiento (subconjunto de 484 horas) condiciona el rendimiento a la variedad de kikamba, calidad de microfono y condiciones acusticas presentes en el; otros dominios pueden degradarse.
- Degradacion multilingue: el ajuste fino sobre una sola lengua puede haber erosionado la capacidad multilingue original de Whisper.
- Ventana de audio limitada a 30 segundos por segmento; audios mas largos requieren segmentacion externa.
- Model card incompleta: no se documentan hiperparametros, proceso de entrenamiento ni sesgos conocidos, lo que dificulta la reproducibilidad.
- Licencia MIT permite uso comercial, pero la procedencia de los datos de audio y las condiciones de consentimiento de los hablantes no estan documentadas en la informacion disponible; conviene verificar la licencia del dataset antes de un despliegue comercial.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gamamima/whisper_finetuned_kikamba
- Dataset de entrenamiento: https://huggingface.co/datasets/Digital-Divide-Data/Kamba-ASR-Data-Subset-484H
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
