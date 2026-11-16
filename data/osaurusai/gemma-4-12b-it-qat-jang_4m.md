# OsaurusAI/gemma-4-12B-it-qat-JANG_4M

## Resumen

OsaurusAI/gemma-4-12B-it-qat-JANG_4M es una conversión a formato MLX del modelo Google Gemma 4 de 12B en su variante instruction-tuned con Quantization-Aware Training (QAT), publicada por el usuario OsaurusAI. No se trata de un modelo entrenado desde cero, sino de un bundle de pesos cuantizados en formato `jang_affine` diseñado específicamente para ejecutarse en Apple Silicon mediante el runtime vMLX. El modelo base es `google/gemma-4-12B-it-qat-q4_0-unquantized`, del que hereda la arquitectura `gemma4_unified` (`Gemma4UnifiedForConditionalGeneration`), con 48 capas de texto, un tamaño oculto de 3840 y 11.959.730.224 parámetros totales.

La relevancia de esta ficha radica en que ejemplifica el ecosistema de cuantización de precisión mixta orientado a hardware de consumo: el bundle aplica 8 bits a las proyecciones de atención y al router MoE, 4 bits al bulk de MLP/expertos, y mantiene en fp16 (16 bits) los embeddings, normas, torres multimodales y tensores por capa sensibles a medios. El resultado es un repositorio de 18,2 GB con 10 shards safetensors y 328 bases afines cuantizadas con sus sidecars `.scales` y `.biases`.

Es importante subrayar que, aunque los pesos de visión y audio están presentes y preservados, el runtime verificado actualmente es solo texto: `mlx_vlm` estándar no ofrece todavía soporte para `gemma4_unified`, por lo que las capacidades multimodales no son utilizables de forma verificada. El modelo está pensado para el ecosistema Apple Silicon y la librería MLX, con licencia Gemma y soporte declarado únicamente de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma4_unified` / `Gemma4UnifiedForConditionalGeneration` (transformer con capas MoE, según tensores de router y expertos) |
| Parametros totales | 11.959.730.224 (11,96B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | `jang_affine` de precisión mixta: atención 8 bits, router 8 bits, MLP/expertos 4 bits, embeddings 16 bits, tensores por capa y medios 16 bits; group_size=32, mode=affine |
| Idiomas soportados | en (inglés) |
| Licencia | gemma |
| Formato de pesos | safetensors (10 shards), formato `jang_affine` para MLX |
| Capas de texto | 48 |
| Tamano oculto | 3840 |
| Modulos cuantizados | 328 bases afines con sidecars `.scales` y `.biases` |
| Tamano del repositorio | 18,2 GB |
| Modalidades preservadas | texto, visión, audio (vídeo no presente: sin `video_config`) |
| Runtime verificado | solo texto mediante el loader JANG de vMLX |
| MTP / drafter especulativo | ninguno (`mtp: none`, `mtp_policy: none`) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 de 12B en variante instruction-tuned con QAT, desarrollado por Google. La arquitectura `gemma4_unified` corresponde a un transformer de 48 capas con tamaño oculto 3840, que incorpora tensores de router y expertos, lo que indica un diseño con mezcla de expertos (MoE) en las capas de decoder. El bundle de OsaurusAI no reentrena el modelo: parte del checkpoint `q4_0-unquantized` de Google y aplica una recuantización selectiva en formato `jang_affine`, manteniendo en fp16 los componentes sensibles (embeddings de tokens, proyección de salida, normas, torres y embedders de medios, y tensores por capa de embedding/gate/projector de Gemma 4), mientras reduce a 8 bits atención y router y a 4 bits el bulk de MLP/expertos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base, más allá de su carácter instruction-tuned y QAT. Tampoco se documentan innovaciones como decodificación especulativa: el checkpoint fuente no incluye pesos de drafter MTP. La innovación técnica principal de este bundle es la estrategia de cuantización de precisión mixta por tipo de tensor, que busca preservar la coherencia de los componentes multimodales y de los bookends del modelo aunque el runtime solo ejecute texto.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat parcheada de Gemma 4 (`tokenizer_config.json` incluye `bos_token_id`, `eos_token_id`, `pad_token_id`).
- Razonamiento e instrucciones: variante `it` (instruction-tuned) del modelo base.
- Capacidad multimodal de visión: pesos y configuración presentes y preservados, pero no verificados en runtime (requiere implementación real de `gemma4_unified` en MLX/vMLX).
- Capacidad multimodal de audio: `audio_config` y pesos del embedder de audio presentes y preservados, sin runtime verificado.
- Vídeo: no soportado; no existe `video_config` en el bundle.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas a inglés según la metadata del modelo.
- Modo thinking, decodificación especulativa: no disponibles; `mtp: none`.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el bundle está diseñado para el runtime vMLX con loader JANG, lo que permite ejecutar un modelo de ~12B en equipos de consumo con memoria unificada, aprovechando la cuantización mixta para reducir huella sin destruir los componentes sensibles.
- Prototipado de asistentes conversacionales en inglés: la variante instruction-tuned y la plantilla de chat incluida permiten desplegar un chatbot multi-turno en local para pruebas de producto sin depender de APIs externas.
- Evaluación de estrategias de cuantización: investigadores pueden comparar la calidad de este bundle `jang_affine` (8/4/16 bits) frente al checkpoint QAT original de Google para medir el impacto de la recuantización en tareas de texto.
- Desarrollo de toolchains MLX: sirve como caso de prueba para implementaciones de `gemma4_unified` en `mlx_vlm`, ya que incluye `processor_config.json` y pesos multimodales listos para cuando exista soporte de visión/audio.
- Investigación sobre preservación de modalidades en cuantización: el diseño mantiene torres de medios en fp16, lo que permite estudiar si la cuantización del decoder afecta a la coherencia multimodal una vez haya runtime disponible.
- Experimentación con modelos Gemma en entornos sin GPU NVIDIA: al estar en formato MLX, encaja en flujos de trabajo de macOS que no pueden usar CUDA, como análisis de texto offline o generación de documentación técnica en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 18,2 GB en disco; la inferencia en MLX requiere cargar los pesos cuantizados, por lo que se necesita memoria unificada suficiente para el bundle más overhead del runtime (orientativamente por encima de los 18 GB, sin cifra oficial disponible).
- GPU recomendadas: hardware Apple Silicon (familias M-series) con memoria unificada amplia; el bundle está etiquetado explícitamente para `apple-silicon`.
- GPU de consumo: no está pensado para GPUs NVIDIA/AMD con CUDA o ROCm, ya que el formato `jang_affine` y la librería MLX son específicos del ecosistema Apple.
- Opciones de despliegue: runtime vMLX con loader JANG (único path verificado, solo texto); `mlx_vlm` estándar no soporta todavía `gemma4_unified`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OsaurusAI/gemma-4-12B-it-qat-JANG_4M | 11,96B | no disponible | MLX `jang_affine`, vMLX (texto) | gemma | Hugging Face, 71 descargas |
| google/gemma-4-12B-it-qat-q4_0-unquantized | ~12B (no confirmado) | no disponible | safetensors, checkpoint fuente | gemma | Hugging Face (modelo base) |
| Alternativas MLX de otros modelos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el checkpoint fuente de Google, del que este bundle deriva: misma arquitectura y licencia, pero con cuantización `jang_affine` de precisión mixta y orientación explícita a Apple Silicon. No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con otras alternativas.

## Limitaciones y advertencias

- Soporte multimodal no verificado: visión y audio están preservados en pesos pero no hay runtime `gemma4_unified` en `mlx_vlm`; solo texto funciona de forma verificada.
- Idioma limitado a inglés según la metadata; no se declara soporte de castellano ni de otros idiomas.
- Longitud de contexto no documentada en la información disponible, lo que impide planificar cargas de contexto largo con garantías.
- Sin datos de benchmarks: no hay evidencia publicada de la degradación de calidad introducida por la recuantización respecto al checkpoint QAT original.
- Riesgo de alucinación: inherente a los modelos de lenguaje instruction-tuned; no se documentan evaluaciones específicas de fidelidad.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.
- Licencia Gemma: impone términos de uso de Google que deben revisarse antes de cualquier uso comercial; no es una licencia permisiva tipo Apache o MIT.
- Dependencia de runtime: el formato `jang_affine` y el loader JANG son específicos de vMLX, lo que limita la portabilidad a otros stacks de inferencia.
- Repositorio de terceros: publicado por OsaurusAI, no por Google; la trazabilidad y el mantenimiento dependen del autor (71 descargas, 1 like en el momento de la consulta).
- Sin pesos de drafter MTP, por lo que no se puede aplicar decodificación especulativa con este bundle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OsaurusAI/gemma-4-12B-it-qat-JANG_4M
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- Sitio del autor (Osaurus AI): https://osaurus.ai
