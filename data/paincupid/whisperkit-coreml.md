# paincupid/whisperkit-coreml

## Resumen

`paincupid/whisperkit-coreml` es un espejo de compatibilidad de los artefactos de ejecución de WhisperKit, la implementación en Core ML de los modelos Whisper de OpenAI desarrollada por Argmax. No se trata de un modelo entrenado por el autor del repositorio, sino de una copia fijada (pinned) de los pesos y ficheros de tokenización necesarios para ejecutar reconocimiento automático de voz (ASR) en dispositivos Apple mediante Core ML. El repositorio lo mantiene el usuario `paincupid` como respaldo independiente para la aplicación MatrixApps, y redistribuye los pesos sin modificación alguna.

El paquete incluye varias tallas de Whisper: Base, Small, Medium, Large V3, una versión comprimida de Large V3, Large V3 Turbo y los ficheros de tokenizador de OpenAI fijados a una revisión concreta. Los modelos se distribuyen como carpetas Core ML con los nombres originales de Argmax, y los tokenizadores se ubican bajo `tokenizers/openai/`. La licencia declarada es MIT y la tarea asociada es `automatic-speech-recognition`.

Su relevancia es operativa más que científica: al fijar revisiones, tamaños y digests SHA-256 en `provenance.json` y `SHA256SUMS`, permite descargas reproducibles e inmutables para aplicaciones que necesitan artefactos estables. No incorpora entrenamiento nuevo, conversión propia ni afirmaciones adicionales de calidad o rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper de OpenAI), convertido a Core ML |
| Parámetros totales | No disponible (el repositorio agrupa varias tallas: Base, Small, Medium, Large V3, Large V3 comprimido y Large V3 Turbo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (Whisper usa ventanas de audio de 30 s, pero el repositorio no lo declara explícitamente) |
| Tipos de cuantización | No disponible (se menciona una variante "compressed Large V3" sin especificar el esquema de compresión) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Carpetas de modelo Core ML (`.mlmodelc`/artefactos Core ML) y ficheros de tokenizador de OpenAI |

## Arquitectura y entrenamiento

El repositorio no entrena ningún modelo. Los pesos corresponden a la familia Whisper de OpenAI, un transformer encoder-decoder diseñado para transcripción y traducción de voz, y han sido convertidos a Core ML por Argmax para su ejecución en hardware Apple (CPU, GPU y Neural Engine) a través de WhisperKit. La copia aquí publicada redistribuye esos artefactos sin modificación, conservando los nombres de carpeta originales.

No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO. Tampoco se describen innovaciones técnicas propias del espejo; su aportación es de integridad y reproducibilidad: `provenance.json` registra revisiones fijas, tamaños de fichero y digests SHA-256, y `SHA256SUMS` cubre todos los ficheros de ejecución. No hay sincronización automática con el repositorio upstream, de modo que la instantánea publicada permanece inmutable.

## Capacidades

- Reconocimiento automático de voz (transcripción) mediante los modelos Whisper incluidos en sus distintas tallas.
- Ejecución en dispositivo (on-device) sobre hardware Apple mediante Core ML.
- Disponibilidad de múltiples compromisos tamaño/calidad: Base, Small, Medium, Large V3, Large V3 comprimido y Large V3 Turbo.
- Tokenización compatible con OpenAI gracias a los ficheros incluidos en `tokenizers/openai/`.
- Verificación de integridad de descargas mediante digests SHA-256 publicados.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio adicional ni modo de razonamiento explícito.

## Casos de uso

- Transcripción local en aplicaciones macOS/iOS: integrar las carpetas Core ML en una app que use WhisperKit para transcribir audio sin enviar datos a servidores, aprovechando la ejecución on-device.
- Descargas reproducibles en producción: configurar el descargador de la app con los digests de `SHA256SUMS` para garantizar que cada instalación recibe exactamente los artefactos validados.
- Archivado a largo plazo: conservar una instantánea inmutable de los pesos y tokenizadores para evitar que cambios upstream rompan builds antiguos de la aplicación.
- Selección de talla según el dispositivo: usar Base o Small en dispositivos con menos recursos y Large V3 o Large V3 Turbo en equipos con más capacidad, dentro de la misma familia de artefactos.
- Procesamiento por lotes de audio en local: transcribir grabaciones, reuniones o notas de voz en un Mac sin depender de servicios en la nube.
- Verificación de cadena de suministro: auditar que los ficheros redistribuidos coinciden con las revisiones originales de Argmax y OpenAI mediante `provenance.json`.
- Integración en pipelines de CI: validar la presencia y los hashes de todos los ficheros antes de empaquetar la aplicación, ya que un puntero Git LFS aislado no constituye una copia válida del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio declara explícitamente que no añade afirmaciones sobre rendimiento en dispositivo ni calidad de reconocimiento.

## Requisitos de hardware

- VRAM: no aplica en el sentido habitual; los modelos están pensados para ejecutarse en hardware Apple mediante Core ML (CPU, GPU y Neural Engine).
- GPU recomendadas: no disponible; el destino son chips Apple (series M y A), no GPU NVIDIA.
- Compatibilidad con GPU de consumo: no aplica a RTX 4090, A100 o H100 en su formato Core ML; para esas plataformas habría que usar los pesos originales de Whisper en otro formato.
- Opciones de despliegue: WhisperKit sobre Core ML en macOS/iOS; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para estos artefactos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| paincupid/whisperkit-coreml (este repositorio) | Varias tallas Whisper (Base a Large V3 Turbo) | No disponible | Core ML | MIT | Hugging Face (espejo) |
| argmaxinc/whisperkit-coreml | Varias tallas Whisper | No disponible | Core ML | Según upstream (no detallada aquí) | Hugging Face (original) |
| openai/whisper-large-v3 | 1.550 M (dato no incluido en la información proporcionada; verificar en la model card original) | No disponible | Safetensors/PyTorch | Según OpenAI (no detallada aquí) | Hugging Face |
| openai/whisper-base | No disponible | No disponible | Safetensors/PyTorch | Según OpenAI (no detallada aquí) | Hugging Face |

La comparación se limita a la procedencia y al formato, ya que la información disponible no incluye métricas de calidad ni datos de rendimiento para contrastar.

## Limitaciones y advertencias

- Es un espejo, no un modelo original: no debe citarse como trabajo de entrenamiento o conversión propio.
- No hay sincronización automática con upstream; las correcciones o mejoras de Argmax u OpenAI no llegarán a este repositorio.
- La copia solo es válida si todos los ficheros listados están presentes y verificados; un puntero Git LFS por sí solo no constituye un respaldo del modelo.
- Los artefactos están en formato Core ML, por lo que no son directamente utilizables en entornos NVIDIA, AMD o servidores x86 sin GPU Apple.
- No se documentan idiomas soportados ni limitaciones idiomáticas específicas.
- No se aportan datos sobre sesgos, tasa de alucinación o calidad de transcripción; deben consultarse en las model cards originales de OpenAI y Argmax.
- La licencia declarada es MIT, pero la atribución a OpenAI y Argmax debe conservarse; conviene verificar los términos de los modelos originales antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una adopción muy limitada y ausencia de validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/paincupid/whisperkit-coreml
- Repositorio original de Argmax/WhisperKit: https://huggingface.co/argmaxinc/whisperkit-coreml
- Whisper Base (OpenAI): https://huggingface.co/openai/whisper-base
- Whisper Small (OpenAI): https://huggingface.co/openai/whisper-small
- Whisper Medium (OpenAI): https://huggingface.co/openai/whisper-medium
- Whisper Large V3 (OpenAI): https://huggingface.co/openai/whisper-large-v3
- Whisper Large V3 (ModelScope): https://modelscope.cn/models/AI-ModelScope/whisper-large-v3
- WhisperKit Core ML (ModelScope): https://modelscope.cn/models/AI-ModelScope/whisperkit-coreml
