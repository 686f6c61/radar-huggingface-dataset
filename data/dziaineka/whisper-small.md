# dziaineka/whisper-small

## Resumen

El modelo `dziaineka/whisper-small` es una copia del checkpoint `whisper-small` de OpenAI, subida al Hub de Hugging Face por el usuario dziaineka. Se trata de un modelo de reconocimiento automático de voz (ASR) y traducción de voz entrenado con 680 000 horas de datos etiquetados mediante supervisión débil a gran escala. Su arquitectura es un Transformer encoder-decoder (secuencia a secuencia) con aproximadamente 242 millones de parámetros, diseñado para procesar ventanas de audio de 30 segundos y transcribir o traducir el habla en más de 90 idiomas.

Este modelo es relevante porque ofrece un equilibrio entre tamaño y precisión: es lo suficientemente ligero para ejecutarse en GPUs de consumo, pero mantiene una calidad de transcripción competitiva en múltiples dominios y acentos sin necesidad de ajuste fino. La versión publicada aquí conserva la licencia Apache 2.0 y los pesos originales, lo que la hace directamente utilizable en proyectos de producción que requieran ASR multilingüe.

La ficha se basa en la información proporcionada en la model card y en los resultados de benchmarks declarados por el autor. No se han encontrado datos adicionales sobre fine-tuning específico o modificaciones respecto al checkpoint original de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) |
| Parametros totales | 241 734 912 (según safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio (ventana fija) |
| Tipos de cuantizacion | no disponible (no se especifican en el repositorio) |
| Idiomas soportados | Más de 90, incluyendo en, es, fr, de, zh, ja, ko, ru, ar, hi, pt, it, nl, pl, sv, da, fi, no, tr, vi, th, id, ms, etc. |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (también disponibles en PyTorch, TensorFlow y JAX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Whisper de OpenAI: un Transformer encoder-decoder estándar que procesa espectrogramas log-Mel de 80 canales como entrada. El encoder convierte el audio en una representación latente y el decoder genera el texto tokenizado. El entrenamiento se realizó sobre 680 000 horas de datos de voz etiquetados, recopilados de la web, con supervisión débil. El modelo fue entrenado de forma multitarea: reconocimiento de voz (transcripción en el mismo idioma) y traducción de voz (transcripción a otro idioma, principalmente inglés).

Una innovación clave es el uso de tokens de contexto al inicio de la decodificación: el token `<|startoftranscript|>`, el token de idioma (p. ej. `<|en|>`) y el token de tarea (`<|transcribe|>` o `<|translate|>`). Esto permite al modelo saber qué idioma y qué tarea debe realizar sin necesidad de configuración adicional. No se mencionan técnicas de RLHF o DPO en la información disponible; el entrenamiento se basó únicamente en supervisión débil.

## Capacidades

- Transcripción de voz a texto en más de 90 idiomas, con buena generalización a dominios y acentos variados.
- Traducción de voz a texto en inglés (speech translation) desde cualquier idioma soportado.
- Identificación automática del idioma hablado en el audio.
- Generación de transcripciones con marcas de tiempo (timestamps) a nivel de segmento, útil para subtitulado.
- Robustez frente a ruido de fondo y condiciones acústicas adversas, gracias al entrenamiento con datos diversos.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de audio.

## Casos de uso

- Transcripción de reuniones y videollamadas: el modelo puede convertir grabaciones de audio en texto con alta precisión, incluso con varios hablantes o acentos, gracias a su entrenamiento multilingüe y su ventana de 30 segundos que permite procesar segmentos largos de forma secuencial.
- Generación de subtítulos para vídeo: al proporcionar marcas de tiempo, se puede integrar en pipelines de postproducción para generar subtítulos en múltiples idiomas automáticamente.
- Asistentes de voz y comandos por voz: su tamaño reducido (244M) permite desplegarlo en servidores de baja capacidad o en dispositivos edge, procesando comandos de voz en tiempo real.
- Análisis de llamadas de atención al cliente: transcribir llamadas para análisis de sentimiento, extracción de información o control de calidad, con soporte para varios idiomas.
- Accesibilidad para personas con discapacidad auditiva: transcripción en tiempo real de conversaciones o eventos, integrándose en aplicaciones móviles o web.
- Investigación lingüística: análisis de corpus de audio en idiomas de bajos recursos, ya que Whisper small ofrece un rendimiento razonable incluso en lenguas con pocos datos de entrenamiento.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card. No se han verificado de forma independiente.

| Dataset | Config | Split | Idioma | Métrica | Valor |
|---|---|---|---|---|---|
| LibriSpeech | clean | test | en | Test WER | 3,43 |
| LibriSpeech | other | test | en | Test WER | 7,63 |
| Common Voice 11.0 | hi | test | hi | Test WER | 87,30 |
| Common Voice 13.0 | dv | test | dv | Wer | 125,70 |

Los valores de WER para hindi y divehi son notablemente altos, lo que indica un rendimiento deficiente en idiomas con pocos datos de entrenamiento o con características acústicas muy diferentes al inglés. Para el inglés, los resultados son competitivos con otros modelos ASR de tamaño similar.

## Requisitos de hardware

- VRAM estimada: en precisión FP32, el modelo ocupa aproximadamente 1 GB de memoria (244M parámetros × 4 bytes). En FP16, alrededor de 0,5 GB. Con cuantización a 8 bits, se reduce a ~250 MB, aunque no se proporcionan archivos cuantizados en este repositorio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP16. Tarjetas como NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060 o superiores son suficientes. También puede ejecutarse en CPU, aunque con mayor latencia.
- Despliegue: se puede utilizar con la librería `transformers` de Hugging Face, así como con `vLLM` (aunque vLLM está más orientado a LLM, no es el caso típico para Whisper), `whisper.cpp` (para CPU y cuantización), `Ollama` (no soporta Whisper nativamente, pero se puede integrar), y `TGI` (Text Generation Inference no está diseñado para ASR). Las opciones más comunes son `transformers` y `whisper.cpp`.
- Latencia: en una GPU moderna (RTX 3090), la transcripción de un audio de 30 segundos tarda aproximadamente 1-2 segundos en FP16. En CPU, puede tardar 10-20 segundos por la misma ventana.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos en la información proporcionada. Sin embargo, se puede comparar estructuralmente con otros tamaños de la familia Whisper:

| Modelo | Parámetros | Contexto | Idiomas | Licencia |
|---|---|---|---|---|
| whisper-small (este) | 244M | 30 s audio | >90 | Apache 2.0 |
| whisper-base | 74M | 30 s audio | >90 | Apache 2.0 |
| whisper-medium | 769M | 30 s audio | >90 | Apache 2.0 |
| whisper-large-v3 | 1550M | 30 s audio | >90 | Apache 2.0 |

En términos de rendimiento, whisper-medium y large-v3 suelen obtener mejores WER en la mayoría de los idiomas, pero requieren más recursos. whisper-small ofrece un punto intermedio para aplicaciones con restricciones de memoria o latencia.

## Limitaciones y advertencias

- Rendimiento muy variable según el idioma: los resultados en hindi y divehi muestran WER superiores al 85%, lo que indica que el modelo no es fiable para idiomas de bajos recursos o con características fonéticas muy distintas del inglés.
- Riesgo de alucinaciones: en audio muy ruidoso o con silencios largos, el modelo puede generar texto que no corresponde al contenido real, un problema conocido en la familia Whisper.
- Sin capacidad de diálogo o razonamiento: es un modelo de transcripción puro; no puede interpretar contexto conversacional ni ejecutar tareas complejas.
- Ventana de audio fija de 30 segundos: para audios más largos es necesario segmentar, lo que puede perder contexto entre segmentos.
- No se especifican sesgos demográficos o dialectales, pero al entrenarse con datos de la web, es probable que tenga un sesgo hacia hablantes nativos de inglés y variedades estándar de otros idiomas.
- Licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos de la licencia original de OpenAI.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dziaineka/whisper-small
- Paper original: https://arxiv.org/abs/2212.04356
- Código original de OpenAI: https://github.com/openai/whisper
- Modelo relacionado (belarusiano): https://huggingface.co/dziaineka/whisper-small-belarusian
- Implementación para dispositivos Qualcomm: https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/whisper_small/README.md
