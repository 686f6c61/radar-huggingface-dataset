# OsaurusAI/gemma-4-26B-A4B-it-qat-MXFP4

## Resumen

OsaurusAI/gemma-4-26B-A4B-it-qat-MXFP4 es una distribucion cuantizada del modelo Gemma 4 de Google, concretamente del checkpoint `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`. Lo desarrolla OsaurusAI como derivado del release oficial de Google con Quantization-Aware Training (QAT), y su proposito es ofrecer una version lista para ejecutarse en Apple Silicon mediante el stack MLX/vMLX, empleando cuantizacion MXFP4 (4 bits, group size 32) en las capas lineales del decodificador.

El modelo base es un transformer multimodal de tipo `gemma4` (`Gemma4ForConditionalGeneration`) con 25.805.936.206 parametros totales y una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parametros activos, segun indica el sufijo "A4B" del identificador. Dispone de 30 capas de texto, de las cuales 5 son de atencion completa y 25 de atencion deslizante, con un tamano oculto de 2816. Incorpora una torre de vision de 27 capas con hidden size 1152 y patch size 16, lo que habilita el procesamiento de imagenes ademas de texto.

La relevancia de esta ficha radica en que es una de las pocas distribuciones MXFP4 orientadas especificamente a Mac con chip Apple Silicon, con pesos ya cuantizados y verificados en 15 shards de safetensors (14,56 GiB indexados). No es un formato GGUF y no debe cargarse con runtimes GGUF. Su licencia es la Gemma de Google, con las restricciones de uso que esta implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `gemma4` / `Gemma4ForConditionalGeneration` con mezcla de expertos (MoE) y atencion hibrida (5 capas full attention, 25 sliding attention) |
| Parametros totales | 25.805.936.206 (25,8 B) |
| Parametros activos | aproximadamente 4 B (deducido del sufijo "A4B" del identificador; no confirmado en la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (4 bits, group_size 32) en lineales del decodificador; embeddings, norms y embedders multimodales en fp16 passthrough |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | gemma (terminos de Google Gemma) |
| Formato de pesos | safetensors (MLX), 15 shards, 14,56 GiB indexados; no es GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Google con arquitectura `gemma4`, que combina capas de atencion completa (5) y de atencion deslizante (25) sobre un total de 30 capas de texto con hidden size 2816. La denominacion "A4B" sugiere una arquitectura de mezcla de expertos con unos 4.000 millones de parametros activos por token, aunque la model card no detalla el numero de expertos ni la estrategia de enrutamiento. El componente de vision es una torre `gemma4_vision` de 27 capas, hidden size 1152 y patch size 16, con early-fusion de modalidades. El procesador `Gemma4Processor` define `image_seq_length=280`, `audio_seq_length=750` y `audio_ms_per_token=40`.

El checkpoint de origen es `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, es decir, la version instruction-tuned de Gemma 4 entrenada con QAT (Quantization-Aware Training) para cuantizacion de 4 bits. OsaurusAI aplica sobre ese checkpoint una conversion a MXFP4 con MLX, cuantizando 295 tensores con sus correspondientes sidecars `.scales` y preservando en fp16 los embeddings, las normalizaciones y los embedders multimodales. No se documentan en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; esa informacion corresponde al release oficial de Google, no a este derivado.

## Capacidades

- Generacion de texto conversacional en ingles con formato de turnos y canales propio de Gemma 4.
- Procesamiento de imagenes (image-text-to-text) mediante la torre de vision integrada.
- Soporte de tool calling: la model card declara `tool_parser` con metadato `gemma4` y una "required-tool-choice compatibility stanza" en la plantilla de chat para runtimes vMLX/Osaurus.
- Soporte de razonamiento con canales de pensamiento: la plantilla elimina el prefill vacio del canal de pensamiento para que los turnos sin thinking empiecen directamente en contenido visible.
- Capacidades de agente y razonamiento multi-paso, segun los metadatos de parser de razonamiento `gemma4`.
- Capacidades multilingues limitadas al ingles segun los metadatos del repo.
- Audio: el `audio_config` esta presente en la configuracion de origen y se preserva, pero la propia model card indica que el soporte en runtime depende del procesador activo y no lo garantiza.
- Video: no hay `video_config` en la configuracion de origen; la model card no reclama una ruta de ejecucion de video verificada.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede gestionar dialogos multi-turno en ingles ejecutandose integramente en Apple Silicon mediante MLX, sin depender de la nube, gracias a su cuantizacion MXFP4 de 4 bits.
- Analisis de imagenes y documentos escaneados: la torre de vision permite pasar imagenes junto a texto para tareas de descripcion, extraccion de informacion o respuesta a preguntas visuales.
- Automatizacion de agentes con tool calling: el soporte de `tool_parser` `gemma4` y la compatibilidad con required-tool-choice permiten integrar el modelo en flujos de agente que invocan funciones externas (APIs, busquedas, calculadoras).
- Prototipado rapido en entornos de investigacion con hardware Apple: al estar empaquetado para MLX/vMLX, sirve para experimentar con un MoE de 25,8 B en un Mac sin GPU dedicada.
- Razonamiento multi-paso asistido: el canal de pensamiento del modelo permite separar el razonamiento interno de la respuesta final en tareas de analisis o planificacion.
- Generacion de codigo y asistencia en IDE: el modelo instruction-tuned puede usarse como asistente de codigo en local, aunque el idioma de trabajo principal es el ingles.
- Evaluacion comparativa de cuantizaciones: util para medir la degradacion de calidad de MXFP4 frente a q4_0 y otros formatos sobre el mismo checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: los pesos indexados ocupan 14,56 GiB, por lo que se recomienda un minimo de 16 GB de memoria unificada y, para margen operativo con contexto y vision, 24-32 GB.
- GPU recomendadas: Apple Silicon con soporte MLX (series M1, M2, M3, M4 y variantes Pro/Max/Ultra). No esta pensado para GPUs NVIDIA ni CUDA.
- Cabe en consumer hardware: si, en Mac con 16 GB o mas de memoria unificada, con mayor holgura a partir de 24 GB.
- Opciones de despliegue: runtime MLX/vMLX con soporte de Gemma 4 MXFP4 (por ejemplo `mlx_vlm`); no compatible con llama.cpp, Ollama ni TGI en formato GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OsaurusAI/gemma-4-26B-A4B-it-qat-MXFP4 | 25,8 B totales / ~4 B activos | no disponible | MXFP4 4 bits (MLX) | gemma | Hugging Face, MLX |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | 25,8 B totales / ~4 B activos | no disponible | sin cuantizar (QAT q4_0) | gemma | Hugging Face |
| Gemma 4 base (sin QAT) | no disponible | no disponible | multiples | gemma | Hugging Face |

La comparativa se limita al ecosistema Gemma 4 porque la informacion proporcionada no incluye datos de modelos alternativos de otros fabricantes con caracteristicas equivalentes.

## Limitaciones y advertencias

- Idioma: los metadatos declaran unicamente ingles (`en`); el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: inherente a los modelos generativos; no se documentan mitigaciones especificas en la model card.
- Sesgos: no se documentan sesgos conocidos en la informacion disponible; hereda los del checkpoint base de Google.
- Licencia: se rige por los terminos Gemma de Google, que imponen restricciones de uso comercial y de redistribucion; es necesario revisar la licencia upstream antes de un despliegue en produccion.
- Compatibilidad: no es GGUF; cargarlo con llama.cpp, Ollama u otros runtimes GGUF fallara.
- Audio y video: el soporte de audio depende del procesador activo y no esta verificado; no se reclama ruta de video.
- Cuantizacion: MXFP4 a 4 bits puede degradar la calidad frente al checkpoint sin cuantizar, especialmente en tareas de razonamiento o codigo.
- Contexto: la longitud de contexto no esta disponible en la informacion proporcionada, lo que impide planificar cargas de trabajo de contexto largo.
- Madurez: 73 descargas y 1 like en el momento de la consulta; es un derivado reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsaurusAI/gemma-4-26B-A4B-it-qat-MXFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Sitio del autor: https://osaurus.ai
- Contacto del autor: eric@osaurus.ai
