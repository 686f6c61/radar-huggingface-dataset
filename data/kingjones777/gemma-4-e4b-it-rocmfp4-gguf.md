# kingjones777/Gemma-4-E4B-it-ROCmFP4-GGUF

## Resumen

Este repositorio contiene la primera cuantización GGUF en formato ROCmFP4/ROCmFPX del modelo `google/gemma-4-E4B-it`, realizada por el usuario kingjones777. El modelo base es un LLM multimodal de Google perteneciente a la familia Gemma 4, diseñado para ejecutarse de forma eficiente en hardware local. La cuantización está específicamente optimizada para GPUs AMD con arquitectura RDNA 3.5 (gfx1151, como el Strix Halo Ryzen AI MAX+ 395), aprovechando los tipos de tensor FP4/FPX nativos de AMD que no están disponibles en llama.cpp estándar.

La relevancia de esta publicación radica en que permite ejecutar un modelo multimodal de 4.4B parámetros (con 7.5B en total según los pesos safetensors) en hardware AMD de consumo con una velocidad de decodificación de hasta 49.91 tokens por segundo en la variante de 4 bits, manteniendo la corrección tanto en texto como en visión. Se incluyen cuatro variantes de cuantización, todas verificadas individualmente en hardware real.

El modelo base presenta una arquitectura MatFormer con embeddings por capa (per-layer-embedding), lo que explica que la cuantización de 4 bits no alcance la compresión típica de un modelo denso convencional. La ventana de contexto del modelo base es de hasta 256K tokens, aunque no se ha confirmado su comportamiento en esta cuantización específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MatFormer con embeddings por capa (per-layer-embedding), multimodal (imagen-texto) |
| Parametros totales | 7.518.069.290 (según safetensors del modelo base) |
| Parametros activos | no disponible (el modelo base se anuncia como 4.4B, pero no se confirma si es MoE) |
| Longitud de contexto | 256K tokens (modelo base, según documentación de Gemma 4; no confirmado para esta cuantización) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT, Q6_0_ROCMFPX_AGENT, Q8_0_ROCMFPX, Q8_0_ROCMFPX_AGENT |
| Idiomas soportados | no disponible para esta cuantización; el modelo base soporta más de 140 idiomas según Google |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF con tipos ROCmFP4/ROCmFPX (no compatibles con llama.cpp estándar) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-E4B-it` emplea una arquitectura MatFormer con embeddings por capa (per-layer-embedding), una innovación que distribuye una fracción significativa de los parámetros en tensores de embedding específicos por capa (`per_layer_token_embd`). Esto implica que la cuantización no puede reducir todos los tensores al mismo nivel de bits: mientras que las capas principales se cuantizan a FP4, el tensor `per_layer_model_proj.weight` permanece en BF16 en todas las variantes. El modelo también utiliza `tie_word_embeddings = true`, por lo que no existe un tensor `output.weight` independiente.

En cuanto al entrenamiento, no se dispone de información específica sobre el dataset o el proceso de entrenamiento del modelo base en la documentación de esta cuantización. Sin embargo, según la documentación oficial de Gemma 4, la familia incluye modelos densos y MoE, con soporte multimodal (imagen, texto y audio en algunas variantes) y un contexto de hasta 256K tokens. Esta cuantización concreta se construyó a partir del GGUF BF16 oficial del Hub, sin reconversión desde safetensors, y cada archivo fue verificado individualmente en hardware AMD Strix Halo.

Una característica técnica destacable es la inclusión del head MTP (Multi-Token Prediction) para decodificación especulativa, aunque actualmente no funciona con el fork ROCmFPX de llama.cpp debido a limitaciones del propio fork, no de la cuantización.

## Capacidades

- Generación de texto y razonamiento: el modelo base es capaz de realizar tareas de generación de texto, razonamiento lógico y matemático (verificado con operaciones como `17×23=391`).
- Multimodal: soporta entrada de imágenes junto con texto (pipeline image-text-to-text). Se verificó la capacidad de identificar colores y posiciones en una imagen de prueba.
- Soporte de código: al ser un modelo de la familia Gemma 4, se espera capacidad de generación y comprensión de código, aunque no se han publicado pruebas específicas en esta cuantización.
- Multilingüe: el modelo base soporta más de 140 idiomas, aunque no se ha verificado en esta cuantización.
- Decodificación especulativa (MTP): el modelo incluye un head MTP, pero no es funcional actualmente con el fork ROCmFPX (ver limitaciones).
- Compatibilidad con herramientas: no se ha documentado soporte de tool calling o function calling en esta cuantización, aunque el modelo base podría tenerlo.

## Casos de uso

- Asistente local multimodal en hardware AMD: gracias a su cuantización ROCmFP4 y su velocidad de hasta 49.91 t/s en Strix Halo, es adecuado para ejecutar un asistente conversacional con entrada de imágenes en equipos AMD de gama alta, sin depender de la nube.
- Análisis de imágenes en entornos sin GPU NVIDIA: el modelo puede procesar imágenes (por ejemplo, describir contenido, identificar colores u objetos) en hardware AMD que no soporta cuantizaciones FP4 de NVIDIA, gracias a los tipos ROCmFPX.
- Generación de código en entornos de desarrollo local: con 4.4B parámetros activos y un tamaño de archivo de 4.83 GiB en la variante de 4 bits, cabe en GPUs de consumo con 8 GB de VRAM, permitiendo autocompletado y asistencia de código en IDE locales.
- Prototipado de aplicaciones RAG con contexto largo: la ventana de 256K tokens del modelo base permite procesar documentos extensos, aunque se debe verificar el comportamiento en esta cuantización.
- Educación y demostraciones técnicas: al ser una cuantización pionera en ROCmFP4, es útil para investigar el rendimiento de FP4 en hardware AMD y comparar con otras arquitecturas.
- Despliegue en servidores AMD EPYC con GPU integrada: la compatibilidad con gfx1151 y la posibilidad de usar memoria unificada (hasta 128 GB) permite ejecutar el modelo en servidores sin GPU discreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente proporciona mediciones de velocidad de decodificación y pruebas de corrección en hardware específico, que se resumen a continuación.

| Variante | Tamaño (GiB) | BPW | Velocidad de decodificación (t/s) | Correcto (texto) | Correcto (visión) |
|---|---|---|---|---|---|
| Q4_0_ROCMFP4_COHERENT | 4.83 | 5.19 | 49.91 | 3/3 | Sí |
| Q6_0_ROCMFPX_AGENT | 6.96 | 7.48 | 33.85 | 3/3 | Sí |
| Q8_0_ROCMFPX | 7.36 | 7.91 | 34.72 | 3/3 | Sí |
| Q8_0_ROCMFPX_AGENT | 7.43 | 7.98 | 34.25 | 3/3 | Sí |

Las pruebas se realizaron en AMD Ryzen AI MAX+ 395 (Strix Halo, gfx1151) con 128 GB de memoria unificada, usando `-ngl 999 -c 4096 -fa on -fit off`. La dispersión entre mediciones fue inferior a 1.03×.

## Requisitos de hardware

- Es imprescindible un build de llama.cpp con soporte ROCmFPX (fork disponible en https://github.com/charlie12345/ROCmFPX). Los archivos no cargarán en llama.cpp estándar, Ollama ni LM Studio.
- GPU compatible: AMD RDNA 3.5 o superior con gfx1151 (Strix Halo, Ryzen AI MAX+ 395). No se garantiza compatibilidad con otras arquitecturas AMD.
- VRAM estimada: para la variante de 4 bits (4.83 GiB), se recomienda al menos 8 GB de VRAM o memoria unificada; para las variantes de 8 bits, al menos 12 GB.
- Memoria unificada: el hardware de prueba usaba 128 GB, pero el modelo puede ejecutarse con menos si se usa offloading parcial.
- Opciones de despliegue: únicamente mediante el fork ROCmFPX de llama.cpp. No compatible con vLLM, TGI u otros servidores de inferencia convencionales sin adaptación.
- Latencia: la velocidad de decodificación medida varía entre 33.85 y 49.91 t/s según la variante, con una dispersión inferior al 3% entre ejecuciones.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de la misma categoría (cuantizaciones GGUF de Gemma 4 E4B o modelos multimodales similares) en la información proporcionada. La model card no incluye comparaciones con otras cuantizaciones del mismo modelo ni con modelos alternativos. Se recomienda consultar el repositorio del modelo base para comparaciones con otros modelos de Google.

## Limitaciones y advertencias

- Los archivos GGUF usan tipos de tensor ROCmFP4/ROCmFPX que no son compatibles con llama.cpp estándar, Ollama ni LM Studio. Solo funcionan con el fork ROCmFPX.
- La decodificación especulativa (MTP) no funciona actualmente con este fork; los intentos de usarla provocan fallos de inicialización o errores de lectura de tensores.
- La cuantización de 4 bits no alcanza la compresión típica de un modelo denso (5.76 BPW en lugar de ~4.5) debido a la arquitectura MatFormer, lo que reduce la ventaja de tamaño frente a la variante de 8 bits.
- No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, etc.) para esta cuantización, por lo que no se puede garantizar que el rendimiento en tareas complejas sea idéntico al del modelo base.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM, aunque no se ha evaluado específicamente en esta cuantización.
- La licencia Gemma (Gemma Terms of Use) puede imponer restricciones de uso comercial; se debe revisar la documentación oficial antes de desplegar en producción.
- La ventana de contexto de 256K tokens del modelo base no ha sido verificada en esta cuantización; las pruebas se realizaron con 4096 tokens de contexto.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/kingjones777/Gemma-4-E4B-it-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Documentación de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 (Google AI for Developers): https://ai.google.dev/gemma/docs/core/model_card_4
- Página de Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
- Ejemplo de GGUF de Gemma 4 12B (unsloth): https://huggingface.co/unsloth/gemma-4-12b-it-GGUF
