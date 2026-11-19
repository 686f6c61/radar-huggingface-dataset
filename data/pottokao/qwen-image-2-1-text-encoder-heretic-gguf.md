# pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF

## Resumen

Qwen-Image-2.1 Text Encoder Heretic GGUF es una cuantización comunitaria del codificador de texto asociado al pipeline de generación de imágenes Qwen-Image-2.1. El modelo original es un Qwen3-VL de 8B parámetros (8.190.735.360 parámetros según los safetensors del repo base) que actúa como text encoder dentro del flujo de difusión: recibe el prompt del usuario y produce las representaciones condicionantes que consume el modelo DiT de Qwen-Image-2.1. El autor, pottokao, publica tres variantes en el mismo repositorio: GGUF Q4_K_M con su proyector multimodal (`mmproj`) en F16, FP8 en safetensors y BF16 en safetensors.

La variante "Heretic" indica que el modelo ha sido sometido a un proceso de abliteration, es decir, la eliminación de la dirección de rechazo en el espacio de activaciones para reducir las negativas del modelo a ciertos contenidos. En este contexto no se aplica a un chatbot, sino a un codificador de texto para generación de imágenes, donde el efecto práctico es una menor resistencia del encoder a prompts que el modelo base podría degradar o neutralizar. El repositorio acumula más de 63.000 descargas y 375 likes, lo que refleja un interés considerable en la comunidad de ComfyUI.

La relevancia actual del modelo es de infraestructura: permite ejecutar el pipeline completo de Qwen-Image-2.1 en formato GGUF, incluyendo el text encoder, el DiT y el reescritor de prompts, con requisitos de VRAM muy inferiores a los de las variantes en BF16. El autor documenta además un parche para ComfyUI-GGUF que resuelve el error de carga de la torre de visión de Qwen3-VL, un problema que afectaba a los ficheros GGUF de este encoder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3-VL (codificador de texto con torre de visión), base del pipeline Qwen-Image-2.1 |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (con mmproj F16), FP8 safetensors, BF16 safetensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, safetensors (FP8 y BF16) |

## Arquitectura y entrenamiento

El modelo es un codificador de texto basado en la familia Qwen3-VL, con aproximadamente 8,19 mil millones de parámetros. Incluye una torre de visión, tal como evidencia la necesidad del fichero `mmproj` (proyector multimodal) para su carga correcta en ComfyUI-GGUF: sin ese proyector, el nodo falla al procesar la entrada con el error `got input of size [1, 512, 12288]`. Dentro de Qwen-Image-2.1, este encoder transforma el prompt textual en embeddings condicionantes que alimentan al modelo DiT de difusión; no genera imágenes por sí mismo.

El proceso "Heretic" corresponde a una abliteration aplicada sobre el modelo base `pottokao/Qwen-Image-2.1-Text-Encoder-Heretic`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original; la model card no documenta esos detalles. La innovación técnica destacable del repositorio no está en el entrenamiento sino en el empaquetado: cuantización GGUF Q4_K_M del encoder junto con un `mmproj` en F16, y la publicación de un nodo adicional (`ComfyUI-GGUF-Qwen3VL-TE`) que corrige la carga de la torre de visión y el reconocimiento de la arquitectura del DiT de Qwen-Image-2.1 en ComfyUI-GGUF.

## Capacidades

- Codificación de prompts textuales para el pipeline de generación de imágenes Qwen-Image-2.1, alimentando al DiT mediante el nodo `TextEncodeQwenImage21`.
- Procesamiento multimodal: la presencia de la torre de visión y del proyector `mmproj` indica soporte de entradas visuales en el encoder, aunque la model card no detalla su uso dentro del flujo de generación.
- Control fino del condicionamiento mediante prompts negativos y configuración de CFG escalonada, documentada por el autor para mejorar la legibilidad del texto renderizado en las imágenes.
- Integración con ComfyUI a través de `CLIPLoaderGGUF` (GGUF) o `CLIPLoader` estándar (FP8 y BF16), con tipo de modelo `qwen_image`.
- Compatibilidad con el ecosistema GGUF completo de Qwen-Image-2.1: reescritor de prompts PE-T2I, DiT en Q8_0/Q6_K/Q4_K_M y VAE oficial.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo thinking; el modelo es un componente de un pipeline de difusión, no un asistente conversacional.

## Casos de uso

- Generación de imágenes en ComfyUI con GPU de gama media: la variante Q4_K_M (5,0 GB) más el `mmproj` (1,2 GB) permite cargar el text encoder en GPUs con 8 GB de VRAM, dejando espacio para el DiT cuantizado y el VAE.
- Pipelines de generación de imágenes completamente en GGUF: combinando este encoder con el DiT Q4_K_M o Q6_K del mismo autor y el reescritor PE-T2I, se puede montar un flujo entero sin pesos en BF16, adecuado para entornos con VRAM limitada.
- Renderizado de texto legible en imágenes (carteles, etiquetas, pósters): el autor documenta una estrategia de dos `KSamplerAdvanced` encadenados con CFG 1,0 en los primeros 12-17 pasos y CFG 3,0 en el resto, usando el encoder para redibujar el lettering con un prompt negativo específico.
- Despliegue en macOS o hardware sin CUDA: la variante BF16 en safetensors (17,5 GB) se carga con el `CLIPLoader` estándar sin nodos adicionales, pensada para equipos Apple Silicon con memoria unificada suficiente.
- Servidores NVIDIA con FP8: la variante FP8 (9,3 GB) evita la instalación del nodo adicional y se integra con el loader nativo de ComfyUI, útil en despliegues donde no se quiere mantener parches de terceros.
- Investigación sobre abliteration en codificadores de texto para difusión: la variante Heretic permite estudiar cómo afecta la eliminación de la dirección de rechazo a la fidelidad del condicionamiento en prompts sensibles o estilizados.
- Estilización fotográfica automatizada: junto con el nodo `ComfyUI-QwenImage-PhotoStyles` (17 estilos fotográficos), el encoder procesa prompts cortos reescritos por PE-T2I y los convierte en condicionamientos completos para el DiT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para el text encoder: 5,0 GB en GGUF Q4_K_M más 1,2 GB del `mmproj` F16 (unos 6,2 GB en total); 9,3 GB en FP8; 17,5 GB en BF16.
- GPU recomendadas: RTX 4090 o RTX 3090 para FP8 y BF16; GPUs de 8 GB (RTX 3060 Ti, RTX 4060 Ti) para la variante Q4_K_M, siempre que el DiT y el VAE se cuantizen también.
- Cabe en GPU de consumo: sí, la variante Q4_K_M con `mmproj` es la opción diseñada para ello; la FP8 requiere al menos 12 GB para convivir con el resto del pipeline.
- Opciones de despliegue: ComfyUI con `CLIPLoaderGGUF` más el nodo `ComfyUI-GGUF-Qwen3VL-TE` para GGUF; `CLIPLoader` estándar para FP8 y BF16; llama.cpp para el reescritor de prompts PE-T2I del mismo ecosistema.
- Latencia y throughput: no disponibles. El autor solo especifica que el pipeline de difusión debe usar 25 pasos y que más pasos no mejoran la nitidez del texto y queman las luces altas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF | 8,19 B | GGUF Q4_K_M, FP8, BF16 | no disponible | Apache 2.0 | Objeto de esta ficha; incluye abliteration y `mmproj` |
| pottokao/Qwen-Image-2.1-Text-Encoder-Heretic | 8,19 B | safetensors | no disponible | Apache 2.0 | Modelo base sin cuantizar del que derivan estas variantes |
| Qwen3-VL 8B (original) | ~8 B | safetensors | no disponible | no disponible | Arquitectura de referencia; sin abliteration ni adaptación a Qwen-Image |
| Codificadores T5/CLIP usados en otros pipelines de difusión | variable | safetensors, GGUF | no disponible | variable | Alternativas genéricas de la categoría; no comparables directamente por estar entrenados para otros pipelines |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo no es un generador de texto ni un asistente: es un codificador de texto para un pipeline de difusión concreto y no debe evaluarse con benchmarks de LLM (MMLU, HumanEval, GSM8K).
- La abliteration puede degradar la coherencia del condicionamiento en prompts complejos o poco habituales; no se han publicado evaluaciones objetivas de su impacto en la calidad de imagen.
- Los ficheros GGUF requieren el nodo adicional `ComfyUI-GGUF-Qwen3VL-TE` y el `mmproj` junto al GGUF; sin ellos, ComfyUI falla con `got input of size [1, 512, 12288]` o `Unknown model architecture!`.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los pesos originales de Qwen-Image-2.1 pueden tener condiciones adicionales que no se detallan en la model card; conviene verificar la licencia del pipeline completo antes de un despliegue en producción.
- No se documentan idiomas soportados ni longitud de contexto; el rendimiento multilingüe del encoder en la generación de imágenes no está verificado.
- Riesgo de alucinación en el sentido de prompts mal interpretados: el encoder puede producir condicionamientos que el DiT renderice como texto ilegible o elementos no solicitados, especialmente con CFG bajo en la fase final del muestreo.
- El repositorio ocupa 48,7 GB por incluir las tres variantes; descargar solo el fichero necesario para evitar consumo innecesario de disco.
- La fecha de creación del repositorio (2026-09-20) y la actualización (2026-09-24) indican un proyecto reciente con posible rotación de versiones; fijar el commit o el hash del fichero en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic-GGUF
- Modelo base: https://huggingface.co/pottokao/Qwen-Image-2.1-Text-Encoder-Heretic
- Nodo de parche para ComfyUI-GGUF: https://github.com/pottokao-dotcom/ComfyUI-GGUF-Qwen3VL-TE
- Nodo de estilos fotográficos: https://github.com/pottokao-dotcom/ComfyUI-QwenImage-PhotoStyles
- Reescritor de prompts PE-T2I en GGUF: https://huggingface.co/pottokao/Qwen-Image-2.1-PE-T2I-Heretic-GGUF
- DiT de Qwen-Image-2.1 en GGUF: https://huggingface.co/pottokao/Qwen-Image-2.1-DiT-GGUF
