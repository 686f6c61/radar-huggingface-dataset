# Infinity-io/Drama-3-GGUF

## Resumen

Drama 3 GGUF es una conversión comunitaria del modelo de síntesis de voz (text-to-speech, TTS) `fishaudio/drama-3` de Fish Audio, publicada por Infinity-io en formato GGUF para su uso con el runtime nativo `audio.cpp`. El modelo base es una arquitectura de mezcla de expertos (MoE) orientada a la generación de audio y clonación de voz, y esta conversión ofrece seis perfiles de precisión mixta que cuantizan los bancos de expertos enrutados (Q2_K, Q3_K o Q4_K) mientras mantienen en precisión alta (Q8_0, FP32 o BF16) los routers, embeddings, cabecera de salida y las matrices de la torre de audio.

La relevancia de este release es doble. Por un lado, permite ejecutar un modelo TTS de gran tamaño en hardware más modesto gracias a la cuantización y al offload de capas de expertos a CPU. Por otro, es una conversión no oficial y experimental: no procede del autor original del modelo, requiere un backend específico (`fish_drama3`) dentro de `audio.cpp` y no es cargable en runtimes GGUF de propósito general como llama.cpp u Ollama. La versión V2, publicada como predeterminada, se basa en el checkpoint de reemplazo del 29 de octubre de 2026 (revisión `78e5ab7`) del modelo base.

El repositorio ocupa 135,7 GB en total (suma de todos los perfiles), aunque cada archivo individual pesa entre 15,88 y 23,87 GiB. La licencia es la Fish Audio Community License v1.0, que conviene revisar antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con torre de audio; arquitectura GGUF `audiocpp`, backend `fish_drama3` |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (el modelo es MoE, con 120 bancos de proyección de expertos enrutados y 40 routers y 40 puertas de expertos compartidos) |
| Longitud de contexto | 8192 tokens (configurada vía `fish_drama3.context_length` en el ejemplo de la model card) |
| Tipos de cuantización | Q2_K, Q3_K, Q4_K en expertos enrutados; Q8_0, Q4_K, Q4_0, FP32 y BF16 en routers, embeddings, cabecera de salida y otras matrices; FP16 en torre de audio y códec de waveform |
| Idiomas soportados | no disponible |
| Licencia | fish-audio-community-license-v1.0 |
| Formato de pesos | GGUF (seis perfiles de precisión mixta) |

## Arquitectura y entrenamiento

El modelo base `fishaudio/drama-3` es un modelo de síntesis de voz con arquitectura de mezcla de expertos. La model card de esta conversión detalla que el backbone contiene 120 bancos de proyección de expertos enrutados, además de 40 routers y 40 puertas de expertos compartidos, y una cabecera de salida completa de 252.288 filas. La arquitectura incluye una torre de audio y un códec de waveform que se mantienen en FP16 en todas las conversiones. El checkpoint original almacena los expertos en FP8 escalado, mientras que estas conversiones los reescalan a cuantización entera (Q2_K, Q3_K o Q4_K) o a Q8_0.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. Esta conversión GGUF no aplica fine-tuning ni cambios de runtime de cabecera compacta: es una cuantización directa del checkpoint. La innovación técnica principal de este release es el esquema de precisión mixta por componente: los bancos de expertos se cuantizan de forma uniforme (todos los 120 bancos en Q3_K o Q4_K, sin heurísticas de promoción de bits), mientras que routers, embeddings y cabecera se mantienen en Q8_0, FP32 o BF16 según el perfil. Los perfiles con routers en FP32 restauran los 40 routers y las 40 puertas compartidas directamente desde sus valores BF16 originales, y el perfil con embeddings y cabecera en BF16 restaura la cabecera de salida completa de 252.288 filas.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto, con salida en formato WAV.
- Clonación de voz (voice cloning), según los tags del repositorio.
- Generación en modo streaming, con control de `text_chunk_size` para trocear la entrada.
- Control de muestreo mediante `top_k`, `top_p` y `temperature` a nivel de petición.
- Soporte de semilla (`seed`) para reproducibilidad de la generación.
- Configuración de longitud de contexto hasta 8192 tokens.
- Offload de capas de expertos a CPU (`fish_drama3.cpu_expert_layers`) para reducir requisitos de VRAM.
- No se documentan capacidades de tool calling, agentes, visión ni audio de entrada en la información disponible.

## Casos de uso

- **Clonación de voz para doblaje y locución**: el modelo permite generar voz sintética a partir de una referencia, lo que encaja en flujos de producción de audiolibros, pódcast o doblaje donde se necesita una voz consistente en múltiples fragmentos.
- **Generación de voz en streaming para asistentes**: el modo `streaming` con troceado de texto (`text_chunk_size=128`) permite emitir audio de forma incremental, adecuado para asistentes conversacionales de baja latencia percibida.
- **Prototipado en hardware de consumo**: los perfiles Q2_K (15,88 GiB) y Q3_K (18,93 GiB) combinados con offload de expertos a CPU permiten probar el modelo en estaciones de trabajo con GPU de 24 GB o menos, a costa de latencia.
- **Investigación en cuantización de modelos MoE de audio**: los seis perfiles con distintas combinaciones de precisión por componente sirven para estudiar el impacto de la cuantización selectiva (expertos vs. routers vs. cabecera) en la calidad del audio generado.
- **Generación de contenido accesible**: conversión de texto a voz para lectores de pantalla o narración automática de documentos, con control de semilla para reproducibilidad en pruebas.
- **Evaluación de TTS en pipelines de audio.cpp**: integración en flujos que ya usan el runtime `audio.cpp` para otras tareas de audio, aprovechando el backend nativo `fish_drama3` y la CLI `audiocpp_cli`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. El tamaño de archivo no equivale a VRAM requerida, según advierte la model card. Los archivos van de 15,88 GiB (Q2_K) a 23,87 GiB (perfil BF16 embed/head).
- **Offload a CPU**: el ejemplo de la model card usa `fish_drama3.cpu_expert_layers=40` como configuración conservadora para pruebas funcionales, no como recomendación de velocidad. Los expertos descargados a CPU requieren RAM del sistema.
- **GPU recomendadas**: no disponible. Por tamaño de archivo, los perfiles Q2_K y Q3_K podrían caber en GPUs de 24 GB (RTX 3090/4090) solo si se combinan con offload parcial; los perfiles Q4_K rondan 22-24 GiB y probablemente requieran GPUs de 24 GB con offload o GPUs de 40-80 GB (A100, H100) para ejecución completa en VRAM.
- **Consumer GPU**: viable únicamente con cuantizaciones bajas (Q2_K, Q3_K) y offload de expertos a CPU; no se garantiza en GPUs de menos de 24 GB.
- **Despliegue**: exclusivamente mediante `audio.cpp` con el backend nativo `fish_drama3` (CLI `audiocpp_cli`). No es compatible con llama.cpp, Ollama, vLLM ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de TTS comparables.

## Limitaciones y advertencias

- **Conversión no oficial**: el repositorio pertenece a Infinity-io, no a Fish Audio; los perfiles V1 y V2 son etiquetas de este repositorio GGUF, no versiones oficiales del modelo.
- **Runtime específico**: requiere `audio.cpp` con el backend `fish_drama3`; los runtimes GGUF de texto de propósito general no pueden cargarlo.
- **Licencia restrictiva**: la Fish Audio Community License v1.0 puede imponer condiciones al uso comercial; es necesario revisar el texto completo antes de producción.
- **Riesgo de clonación de voz**: la capacidad de clonación puede usarse para suplantación o deepfakes; se deben aplicar salvaguardas y consentimiento.
- **Idiomas no documentados**: no se especifica qué lenguas soporta el modelo, lo que limita su evaluación multilingüe.
- **Calidad dependiente de la cuantización**: los perfiles Q2_K y Q3_K degradan los expertos a 2-3 bits; la model card no ofrece métricas de calidad de audio por perfil.
- **Memoria real superior al tamaño de archivo**: contexto, historial de referencia, backend y offload afectan al consumo de memoria y pueden alterar la salida muestreada.
- **Validación limitada**: las comprobaciones realizadas son estructurales (número de tensores, tipos de almacenamiento, bancos de expertos, cabecera de salida, privacidad de metadatos) y de comparación byte a byte en las variantes con routers FP32; no se documentan evaluaciones subjetivas de calidad de voz.
- **Riesgo de alucinación y artefactos de audio**: no documentado en la información disponible, pero inherente a los modelos generativos de audio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Infinity-io/Drama-3-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Checkpoint V2 (revisión `78e5ab7`): https://huggingface.co/fishaudio/drama-3/tree/78e5ab79e49aa9a25abe8799eff2c4d73a1c3216
- Licencia: https://huggingface.co/fishaudio/drama-3/blob/main/LICENSE
- Runtime audio.cpp: https://github.com/0xShug0/audio.cpp
- Documentación del backend Drama 3: https://github.com/0xShug0/audio.cpp/blob/main/docs/models/fish_drama3.md
