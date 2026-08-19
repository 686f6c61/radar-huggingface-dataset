# enet45/kotoba-whisper-v2.1-mlx-fp16

## Resumen

Kotoba-Whisper v2.1 es un modelo de reconocimiento automático de voz (ASR) especializado en japonés, desarrollado por Kotoba Technologies sobre la arquitectura de OpenAI Whisper large-v3. Esta versión concreta, publicada por el usuario enet45, es una conversión al formato MLX (Machine Learning eXchange) optimizada para ejecutarse en los chips Apple Silicon (M1 y superiores) mediante el framework MLX de Apple. El modelo mantiene los 1.550 millones de parámetros del original y ofrece una precisión casi idéntica a la versión fp32, reduciendo a la mitad el uso de memoria y disco.

La relevancia de esta conversión radica en que permite ejecutar un ASR japonés de alta calidad de forma totalmente local en Macs, sin necesidad de GPU NVIDIA ni conexión a internet. El modelo incluye soporte para puntuación automática, una característica que mejora la legibilidad de las transcripciones. Al estar licenciado bajo Apache 2.0, es apto para uso comercial sin restricciones significativas. El tamaño del repositorio es de 1,5 GB, aunque el peso del modelo en fp16 ocupa aproximadamente 1,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper encoder-decoder (basado en OpenAI whisper-large-v3) |
| Parametros totales | 1.550 millones (1.55B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (Whisper utiliza ventanas de audio de 30 segundos por segmento) |
| Tipos de cuantizacion | fp16 (esta version); tambien disponibles fp32 e int8 en repositorios hermanos |
| Idiomas soportados | japones (principal); el modelo base soporta multiples idiomas, pero esta version esta fine-tuneada para japones |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (weights.safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo Whisper large-v3 de OpenAI: un transformer encoder-decoder con normalizacion de capa y atencion multi-cabeza, disenado originalmente para tareas de ASR y traduccion de voz. Kotoba Technologies tomo este checkpoint base y lo fine-tuneo con mas de 1.000 horas de audio en japones, utilizando datasets como ReazonSpeech, Extended Common Voice y subtitulos de YouTube (YouTube CC). El entrenamiento incluyo un paso adicional de post-procesado para anadir puntuacion automatica a las transcripciones, una capacidad que el Whisper original no ofrece de forma nativa.

La conversion a MLX se realizo con la herramienta `convert.py` del repositorio [mlx-examples](https://github.com/ml-explore/mlx-examples), que mapea automaticamente los campos de los pesos de HuggingFace Transformers al formato MLX. La precision se redujo de fp32 a fp16, con una perdida de exactitud considerada despreciable por el autor de la conversion. No se han publicado detalles sobre el uso de RLHF o DPO en el entrenamiento original; el proceso se baso en fine-tuning supervisado estandar.

## Capacidades

- Reconocimiento de voz en japones con alta precision, superando a OpenAI Whisper-large-v3 en benchmarks japoneses como Common Voice JA 7.0/8.0 y CSJ (Corpus of Spontaneous Japanese), segun la model card del modelo original.
- Anadido de puntuacion automatica en las transcripciones, mejorando la legibilidad del texto resultante.
- Generacion de transcripciones con marcas de tiempo por segmento, util para subtitulado.
- Soporte para multiples formatos de salida: texto plano (txt), subtitulos (srt, vtt), JSON, TSV o todos a la vez.
- Ejecucion totalmente local en Apple Silicon, sin necesidad de conexion a internet ni GPU externa.
- Integracion sencilla via CLI (`mlx_whisper`) o API Python (`mlx_whisper.transcribe`).

## Casos de uso

- Subtitulado de videos en japones: el modelo puede generar subtitulos en formato SRT o VTT con marcas de tiempo precisas, lo que facilita la creacion de contenido accesible para plataformas como YouTube o Vimeo. Su ventana de contexto de 30 segundos por segmento es adecuada para audio continuo.
- Transcripcion de reuniones y entrevistas: gracias a su capacidad de ejecucion local en Mac, se puede integrar en flujos de trabajo de toma de notas automatica sin enviar datos a la nube, preservando la confidencialidad. La puntuacion automatica mejora la calidad del texto final.
- Asistentes de voz en japones: el modelo puede servir como motor de ASR en aplicaciones de escritorio o moviles para Mac, convirtiendo comandos de voz en texto para su posterior procesamiento por un LLM o sistema de reglas.
- Analisis de llamadas de atencion al cliente: las empresas japonesas pueden transcribir grabaciones de llamadas de forma local, cumpliendo normativas de proteccion de datos, y posteriormente analizar el texto para extraer metricas de calidad o deteccion de intenciones.
- Investigacion academica en linguistica japonesa: los investigadores pueden transcribir corpus orales con alta fidelidad, aprovechando la superioridad del modelo sobre Whisper large-v3 en datos japoneses espontaneos.
- Creacion de contenido accesible para personas con discapacidad auditiva: la generacion de subtitulos en tiempo real o diferido para contenido educativo o corporativo en japones es una aplicacion directa, con la ventaja de no depender de servicios externos de pago.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio original (kotoba-tech/kotoba-whisper-v2.1) menciona que el modelo supera a OpenAI Whisper-large-v3 en varios benchmarks japoneses, como Common Voice JA 7.0/8.0 y CSJ, pero no se incluyen cifras concretas. Se recomienda consultar la documentacion del modelo original para obtener datos cuantitativos detallados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,4 GB para el modelo en fp16, mas overhead de ejecucion. En Macs con memoria unificada, se recomienda al menos 8 GB de RAM total para un funcionamiento fluido.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) en sus variantes base, Pro, Max o Ultra. No compatible con Intel Mac ni GPUs NVIDIA.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y 8 GB de RAM o mas. La version int8 (770 MB) es adecuada para Macs con 8 GB de memoria limitada.
- Opciones de despliegue: CLI `mlx_whisper`, API Python `mlx_whisper`, o integracion en aplicaciones propias mediante el paquete `mlx-whisper`.
- Latencia y throughput: la model card indica un tiempo de carga de aproximadamente 0,5 segundos. No se proporcionan datos de latencia por segmento, pero al ser un modelo de 1.55B en fp16, se espera un rendimiento en tiempo real o superior en chips M1 Pro o posteriores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| kotoba-whisper-v2.1 (original) | 1.55B | 30 s por segmento | japones | Apache 2.0 | safetensors (PyTorch) |
| enet45/kotoba-whisper-v2.1-mlx-fp16 | 1.55B | 30 s por segmento | japones | Apache 2.0 | safetensors (MLX) |
| OpenAI Whisper large-v3 | 1.55B | 30 s por segmento | multilingue (99 idiomas) | MIT (codigo), modelo con licencia propia | safetensors (PyTorch) |

La principal diferencia entre el original y esta conversion es el formato de pesos y el backend de ejecucion: el original requiere PyTorch y GPU NVIDIA, mientras que esta version esta optimizada para Apple Silicon via MLX. Whisper large-v3 es multilingue, pero Kotoba-Whisper v2.1 supera su rendimiento en japones especificamente, y anade puntuacion automatica. La licencia Apache 2.0 de Kotoba-Whisper es mas permisiva que la de OpenAI para uso comercial en ciertos contextos.

## Limitaciones y advertencias

- Solo funciona en Apple Silicon (M1 y superiores). No es compatible con Intel Mac, Windows, Linux o GPUs NVIDIA; para esos entornos se debe usar el modelo original en PyTorch.
- El modelo esta especializado en japones. Aunque la arquitectura base es multilingue, el fine-tuning reduce su eficacia en otros idiomas; no se recomienda usarlo para transcripcion fuera del japones.
- La conversion a fp16 introduce una perdida de precision minima, aunque el autor la considera despreciable. Para aplicaciones que requieran la maxima exactitud, se recomienda la version fp32 (2,8 GB).
- No se han publicado benchmarks detallados en esta conversion; los datos de rendimiento provienen del modelo original y pueden variar ligeramente en la practica.
- La puntuacion automatica puede fallar en audio muy ruidoso o con habla solapada, generando puntuacion incorrecta o ausente.
- El modelo no esta disenado para traduccion; solo realiza transcripcion. Para traduccion japones a otros idiomas, se debe usar otro modelo.
- Aunque la licencia Apache 2.0 permite uso comercial, es responsabilidad del usuario verificar que los datos de audio transcritos cumplen con las normativas de privacidad aplicables.

## Enlaces

- Repositorio HuggingFace de esta conversion: https://huggingface.co/enet45/kotoba-whisper-v2.1-mlx-fp16
- Modelo original de Kotoba Technologies: https://huggingface.co/kotoba-tech/kotoba-whisper-v2.1
- Repositorio GitHub de Kotoba-Whisper: https://github.com/kotoba-tech/kotoba-whisper
- Organizacion Kotoba en GitHub: https://github.com/kotoba-tech
- Ejemplos de MLX (herramienta de conversion): https://github.com/ml-explore/mlx-examples
