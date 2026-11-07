# okdohyuk/nemotron-3-diarization-coreml

## Resumen

Nemotron-3-Diarization es un modelo abierto de diarización de hablantes desarrollado por Nvidia y publicado el 23 de septiembre de 2026. Su tarea es identificar quién habla y cuándo en audio con múltiples hablantes, una función crítica para transcripción, análisis de reuniones y sistemas de atención al cliente. El modelo soporta inferencia tanto en streaming como en modo offline, gestiona hasta ocho hablantes y ordena las salidas según la primera aparición de cada hablante en el audio.

El repositorio analizado, `okdohyuk/nemotron-3-diarization-coreml`, no es el modelo original sino un espejo fijado (pinned mirror) del repositorio `FluidInference/nemotron-3-diarization-coreml`, preparado para la aplicación Nogmi. El autor declara que es una copia byte a byte del upstream, con verificación de cada fichero contra el árbol original mediante sha256 (LFS) y sha1 (git blob), y que solo difieren `README.md` y `LICENSE`.

Este espejo contiene los pesos en formato Core ML (`mlmodelc`), es decir, empaquetados para ejecución en Apple Silicon mediante Core ML, con cuantización w8a8 (8 bits en pesos y activaciones) y una configuración `c128_split`. No incluye pesos en safetensors ni GGUF, y el tamaño del repositorio es de aproximadamente 0,1 GB. La licencia declarada en la model card es `openmdw-1.1`, aunque el campo de licencia del repositorio figura como `other`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el espejo incluye un `model.mil` de Core ML; no se detalla la topología interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | w8a8 (8 bits en pesos y activaciones) segun el nombre del paquete `Nemotron3Diarizer_c128_split_w8a8` |
| Idiomas soportados | no disponible (la diarización es independiente del idioma, pero no se documenta) |
| Licencia | openmdw-1.1 segun la model card; el campo del repo indica `other` |
| Formato de pesos | Core ML (`mlmodelc` con `weights/weight.bin`), mas `pre_encode_proj_t.bin`, `learnable_sil_emb.bin` y `config.json` |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni sobre el proceso de entrenamiento en la documentación proporcionada. El espejo incluye un paquete Core ML compilado (`Nemotron3Diarizer_c128_split_w8a8.mlmodelc`) con un fichero `model.mil` que describe el grafo y un `weights/weight.bin` con los pesos cuantizados a 8 bits. También incluye `pre_encode_proj_t.bin` (proyección de pre-codificación) y `learnable_sil_emb.bin` (embedding aprendido de silencio), lo que sugiere una arquitectura de codificación de audio con módulos de proyección y modelado de silencio, pero no se detalla la topología exacta.

Según la documentación de Transformers citada, el modelo original está diseñado para diarización en streaming y offline, con capacidad para hasta ocho hablantes y ordenación de salida por primera aparición. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO, ya que la tarea es de diarización y no de generación de texto.

## Capacidades

- Diarización de hablantes: identifica quién habla y cuándo en audio con múltiples hablantes.
- Inferencia en streaming: procesa audio en tiempo real, adecuado para aplicaciones en vivo.
- Inferencia offline: procesa ficheros de audio completos.
- Hasta ocho hablantes simultáneos.
- Ordenación de hablantes por primera aparición en el audio.
- Ejecución en Apple Silicon mediante Core ML (formato `mlmodelc`).
- Cuantización w8a8 para reducir el tamaño y acelerar la inferencia en hardware Apple.
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling ni agentes, ya que es un modelo especializado en audio.

## Casos de uso

- Transcripción de reuniones con etiquetado de hablantes: el modelo permite segmentar el audio por hablante y asociar cada intervención a su interlocutor, lo que facilita actas y resúmenes atribuidos.
- Análisis de llamadas de atención al cliente: identifica turnos de agente y cliente para calcular tiempos de habla, solapamientos y calidad de la interacción.
- Subtitulado y accesibilidad: genera pistas de subtítulos que indican el hablante, útil en vídeos con múltiples participantes.
- Investigación en ciencias sociales: permite analizar grabaciones de entrevistas o grupos focales con múltiples participantes y cuantificar la participación de cada uno.
- Sistemas de reunión en vivo: al soportar streaming, puede integrarse en aplicaciones de videoconferencia para mostrar en tiempo real quién habla.
- Indexación y búsqueda de archivos de audio: permite etiquetar hablantes en archivos históricos y facilitar búsquedas por interlocutor.
- Aplicaciones en dispositivos Apple: al estar empaquetado en Core ML, puede desplegarse en macOS o iOS sin depender de servidores externos, lo que resulta útil para aplicaciones de privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el espejo está orientado a Core ML en Apple Silicon, no a GPU NVIDIA.
- GPU recomendadas: no disponible para el formato Core ML; el modelo original podría ejecutarse en otras plataformas, pero no se documenta.
- Compatibilidad con GPU de consumo: el paquete está pensado para Apple Silicon (CPU/GPU/Neural Engine mediante Core ML); no se indica compatibilidad con RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: Core ML (formato `mlmodelc`); no se documentan vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La comparativa con alternativas de diarización (por ejemplo, pyannote o NeMo) no está disponible en los datos facilitados.

## Limitaciones y advertencias

- El repositorio es un espejo fijado de un modelo de terceros; no es el repositorio oficial de Nvidia, aunque el autor declara verificación byte a byte.
- La licencia `openmdw-1.1` debe revisarse para uso comercial; el campo del repositorio indica `other`, lo que puede generar ambigüedad.
- El formato es exclusivamente Core ML, por lo que no es directamente utilizable en entornos Linux o GPU NVIDIA sin conversión.
- No se documentan sesgos conocidos, pero al ser un modelo de audio, puede verse afectado por acentos, ruido de fondo y calidad de micrófono.
- La diarización puede fallar en solapamientos de habla o con más de ocho hablantes.
- No se especifican limitaciones de idioma, pero la precisión puede variar según el idioma y la calidad del audio.
- No se dispone de información sobre alucinaciones (no aplica a generación de texto) ni sobre restricciones adicionales de producción.

## Enlaces

- Repositorio del espejo: https://huggingface.co/okdohyuk/nemotron-3-diarization-coreml
- Repositorio upstream: https://huggingface.co/FluidInference/nemotron-3-diarization-coreml
- Documentación de Transformers: https://huggingface.co/docs/transformers/v5.21.0/en/model_doc/nemotron3_diarization
- Wiki de referencia: https://ai.miraheze.org/wiki/Nemotron-3-Diarization
