# Nocti-Dev/nb-whisper-tiny-mlx

## Resumen

nb-whisper-tiny-mlx es una conversión al formato MLX del modelo de reconocimiento automático del habla NbAiLab/nb-whisper-tiny, desarrollado originalmente por el National Library of Norway (NbAiLab). La conversión la ha realizado el usuario Nocti-Dev mediante la herramienta Prism, que genera un repositorio autocontenido con pesos, configuración y tokenizador para que el modelo pueda cargarse sin conexión.

El modelo resuelve la tarea de transcripción de audio a texto (ASR) y está especializado en noruego, dado que deriva del modelo nb-whisper, una adaptación de Whisper de OpenAI al noruego. Con 37.760.640 parámetros, es una variante diminuta (tiny) pensada para ejecución local eficiente, especialmente en hardware Apple Silicon gracias al backend MLX.

Su relevancia actual es acotada: se trata de una conversión técnica de un modelo ya existente, con 0 descargas y 0 likes en el momento de la consulta, y sin datos publicados de benchmarks propios. Resulta útil para quien necesite ejecutar transcripción noruega en macOS con MLX sin depender de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ninguna (dtype float16 en la conversion) |
| Idiomas soportados | no disponibles (modelo derivado de nb-whisper, orientado a noruego) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), float16 |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper, un transformer encoder-decoder diseñado para reconocimiento automático del habla, en su variante tiny. El modelo original NbAiLab/nb-whisper-tiny es un fine-tuning de Whisper tiny sobre datos en noruego, aunque la información proporcionada no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá de las propias de Whisper.

La conversión a MLX se realizó con Prism (recipe `whisper-hf` v1) en un entorno con prism-worker 0.1.0, Python 3.14.10, mlx 0.32.4, numpy 2.5.4, huggingface_hub 2.3.0, hf-xet 1.7.0, torch 2.14.1 y transformers 5.21.0. Se verificó con una prueba de humo comparando la transcripción del modelo original frente a la conversión sobre un clip corto en noruego, con una tasa de error de palabras (WER) de 0.00 entre ambas salidas.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto).
- Especialización en noruego, heredada del modelo base nb-whisper.
- Ejecución local en hardware Apple Silicon mediante el backend MLX.
- Carga offline completa: pesos, configuración y tokenizador incluidos en el repositorio.
- No se documentan capacidades de tool calling, agentes, visión, audio adicional ni modo de razonamiento.

## Casos de uso

- Transcripción de reuniones en noruego en local: el modelo puede procesar audio y generar texto sin enviar datos a servicios en la nube, gracias a su ejecución offline con MLX.
- Subtitulado de vídeos cortos en macOS: su tamaño reducido (37,7 M de parámetros) permite generar subtítulos en tiempo casi real en equipos Apple Silicon.
- Prototipado de pipelines ASR: útil como modelo de referencia ligero para validar arquitecturas de transcripción antes de escalar a variantes mayores.
- Aplicaciones de dictado en noruego: integrable en herramientas de escritura por voz para usuarios que trabajan en ese idioma.
- Investigación en eficiencia de ASR: sirve como base para experimentos de cuantización y despliegue en MLX.
- Transcripción de notas de voz personales: al ser autocontenido y de licencia Apache 2.0, puede incorporarse en aplicaciones de productividad sin dependencias externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica aportada es la prueba de humo de la conversión: WER de 0.00 entre el modelo convertido y el original sobre un clip corto en noruego, y WER de 0.70 frente al guion de referencia en ambos casos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 37,7 M de parámetros en float16, el peso ronda los 75 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican; el formato MLX está orientado a Apple Silicon (chips M1/M2/M3/M4).
- Cabe en consumer GPU: sí, en cualquier GPU con al menos 1 GB de memoria; también en CPU.
- Opciones de despliegue: MLX (librería nativa), mlx-audio-swift (usada en la prueba de humo); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nb-whisper-tiny-mlx (este) | 37,7 M | no disponible | apache-2.0 | Hugging Face (MLX) |
| NbAiLab/nb-whisper-tiny (base) | 37,7 M | no disponible | apache-2.0 | Hugging Face (transformers) |
| Whisper tiny (OpenAI) | ~39 M | no disponible | MIT | Hugging Face, múltiples backends |

La comparativa se limita a los datos disponibles; no se dispone de métricas de rendimiento comparadas entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo diminuto: la precisión de transcripción es limitada, como refleja el WER de 0.70 frente al guion en la prueba de humo.
- Especializado en noruego: su uso en otros idiomas no está garantizado ni documentado.
- Sin datos de benchmarks publicados: no hay evidencia de rendimiento más allá de la prueba de humo.
- Conversión técnica sin mantenimiento aparente: 0 descargas y 0 likes, creado y actualizado el mismo día.
- Dependencia del ecosistema MLX: no es directamente compatible con frameworks estándar como PyTorch o TensorFlow sin conversión adicional.
- Riesgo de alucinación en ASR: como todo modelo Whisper, puede generar texto plausible no presente en el audio, especialmente con ruido o silencios.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nocti-Dev/nb-whisper-tiny-mlx
- Modelo base: https://huggingface.co/NbAiLab/nb-whisper-tiny
- Commit del modelo base: https://huggingface.co/NbAiLab/nb-whisper-tiny/tree/8b38492d0e4111d5d6ad825e979cb082a2da013a
