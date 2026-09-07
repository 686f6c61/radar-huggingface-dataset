# notchlive/whisperkit-coreml

## Resumen

Este repositorio contiene bundles de modelos Whisper convertidos a Core ML, empaquetados por NotchLive para su aplicación NotchLive, un espacio de trabajo de voz local-first para Mac. Los modelos subyacentes son Whisper de OpenAI, convertidos por Argmax para WhisperKit. Se incluyen los tamaños Tiny, Base, Small, Medium y Large Turbo, empaquetados en archivos `.notchlivemodel` con verificación de integridad mediante SHA-256. El repositorio tiene un tamaño de 6.0 GB y su relevancia radica en proporcionar reconocimiento de voz en el dispositivo en macOS, con privacidad y sin conexión, destinado a desarrolladores que necesitan distribuir o verificar estos modelos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) convertido a Core ML |
| Parametros totales | no disponible; los bundles incluyen distintos tamaños de Whisper (tiny, base, small, medium, large-v3-turbo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Core ML (.mlmodel) dentro de archivos `.notchlivemodel` |

## Arquitectura y entrenamiento

Los bundles contienen conversiones de los modelos Whisper de OpenAI, realizadas por Argmax. Whisper es un transformer encoder-decoder para reconocimiento de voz automático. La información proporcionada no detalla los datos de entrenamiento ni el proceso de conversión, pero cada bundle incluye las revisiones upstream, los hashes de cada archivo y las licencias de OpenAI y Argmax. No se trata de un modelo nuevo entrenado, sino de un empaquetado verificado para su uso en WhisperKit.

## Capacidades

- Reconocimiento de voz automático (ASR) local en macOS, sin conexión a internet tras la descarga inicial.
- Transcripción de audio a texto en diferentes tamaños de modelo para adaptarse a distintas necesidades.
- Integración con WhisperKit, la librería de Argmax para Apple Silicon.
- Verificación de integridad mediante hashes SHA-256 por archivo y por bundle.
- Incluye archivos de tokenizer y licencias upstream.
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-step; el modelo es exclusivamente ASR.

## Casos de uso

- Transcripción privada de reuniones y notas de voz en Mac: el modelo se ejecuta en el dispositivo, por lo que los datos de audio no salen del equipo. Es adecuado para entornos donde la confidencialidad es crítica.
- Desarrollo de aplicaciones de dictado en macOS: los desarrolladores pueden integrar estos bundles en sus aplicaciones mediante WhisperKit, aprovechando la aceleración por hardware de Apple Silicon.
- Subtitulado local de vídeos y podcasts: se puede generar texto a partir de audio sin depender de servicios en la nube, lo que reduce costes y latencia.
- Accesibilidad: asistencia para personas con discapacidad auditiva, generando subtítulos en tiempo real en aplicaciones de escritorio.
- Verificación y distribución de modelos: los hashes SHA-256 permiten confirmar la integridad de los archivos descargados, útil para equipos que necesitan auditar dependencias.
- Uso en entornos con conectividad limitada: al ser local, funciona sin conexión a internet después de la descarga inicial, ideal para entornos aislados o con restricciones de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Se ejecuta en macOS con Apple Silicon (M1 o posterior), según el repositorio de Argmax.
- Memoria: al ser Core ML, utiliza memoria unificada de la Mac; el tamaño del bundle varía desde 70 MB (Tiny) hasta 2,9 GB (Large Turbo).
- GPU: no disponible; se recomienda un Mac con Apple Silicon para aprovechar la Neural Engine y GPU integradas.
- Opciones de despliegue: NotchLive, WhisperKit, Core ML. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo/Repositorio | Descripción | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| notchlive/whisperkit-coreml | Bundles de Whisper convertidos a Core ML, con verificación SHA-256 | no disponible | no disponible | MIT | Hugging Face, ModelScope |
| argmaxinc/whisperkit-coreml | Repositorio original de Argmax con conversiones Core ML de Whisper | no disponible | no disponible | MIT | Hugging Face |
| openai/whisper | Modelos Whisper originales en PyTorch | no disponible | no disponible | MIT | GitHub, Hugging Face |

## Limitaciones y advertencias

- Errores de transcripción, especialmente con audio poco claro, hablantes superpuestos, nombres inusuales o combinaciones de idiomas no soportadas.
- Los usuarios deben revisar transcripciones importantes antes de usarlas.
- Los modelos no fueron entrenados por NotchLive; no reclaman propiedad.
- La descarga inicial requiere conexión al host de distribución.
- Para producción, se recomienda verificar los hashes SHA-256.
- No se especifican sesgos conocidos en la información proporcionada; al ser modelos Whisper, pueden heredar sesgos del conjunto de entrenamiento original.
- La licencia MIT permite uso comercial, pero se deben conservar los avisos de licencia originales.

## Enlaces

- HuggingFace: https://huggingface.co/notchlive/whisperkit-coreml
- ModelScope: https://modelscope.cn/models/NotchLive/whisperkit-coreml
- Repositorio original de Argmax: https://huggingface.co/argmaxinc/whisperkit-coreml
- GitHub de Argmax: https://github.com/argmaxinc/argmax-oss-swift
- Whisper de OpenAI: https://github.com/openai/whisper
