# AbrahamPJ/minimax-h3-image-q4_0-gguf

## Resumen

MiniMax-H3-Image Q4_0 GGUF es una cuantización del transformer de difusión MiniMax-H3-Image, publicada por el usuario AbrahamPJ. El modelo original lo desarrolla MiniMax y está orientado a la generación de imágenes a partir de texto (text-to-image). Esta variante concreta no es un modelo nuevo ni un fine-tune: es una conversión de pesos a formato GGUF con cuantización Q4_0, derivada del checkpoint podado en bf16 distribuido por Comfy-Org (`diffusion_models/minimax_h3_image_pruned_bf16.safetensors`).

El objetivo de esta publicación es habilitar la ejecución del modelo en la ruta NPU Hexagon del proyecto Nightmare Mobile, que emplea el motor ggml de stable-diffusion.cpp. Por tanto, está pensada para despliegue en dispositivos móviles con aceleración NPU, no para servidores convencionales. El archivo contiene 528 tensores y ocupa 11.573.102.144 bytes (aproximadamente 11,57 GB), lo que refleja una mezcla de capas lineales grandes cuantizadas y el resto de tensores en F32.

La relevancia de esta ficha es acotada: se trata de un artefacto de despliegue de descargas y likes nulos en el momento de la consulta, sin benchmarks publicados ni model card extensa. La información disponible se limita a la descripción técnica de la conversión y a las condiciones de licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (modelo de difusion para text-to-image); detalles internos no disponibles |
| Parametros totales | no disponible (el archivo pesa 11.573.102.144 bytes) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0 en 208 capas lineales grandes (`attn.qkv_proj`, `attn.out_proj`, `mlp.fc1`, `mlp.fc2` en cada bloque y bloque refiner); F32 en el resto de tensores (norms, biases, tablas y proyecciones adaLN, proyecciones patch y condition, seis cabezas de salida PDD) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3-Image Community License Agreement (licencia "other") |
| Formato de pesos | GGUF (528 tensores) |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión para generación de imágenes condicionada por texto. La model card del derivado no detalla la arquitectura interna (número de bloques, dimensión de atención, mecanismo de condicionamiento), y solo menciona la existencia de bloques principales y bloques refiner, proyecciones adaLN, proyecciones patch y condition, y seis cabezas de salida PDD. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

La innovación técnica de esta publicación es la conversión a GGUF: se cuantizan a Q4_0 únicamente las 208 capas lineales de mayor tamaño, mientras que normas, sesgos, tablas adaLN y cabezas de salida permanecen en F32 para preservar precisión en componentes sensibles. Se eliminan los tensores de contabilidad `comfy_attention.config` de ComfyUI. Los nombres de tensor se mantienen idénticos a los del checkpoint de Comfy, lo que facilita la integración con dicho ecosistema.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline text-to-image).
- Inferencia con 6 pasos, sampler Euler y CFG 1, según las instrucciones del autor.
- Compatible con el VAE de MiniMax-H3-Image y con un text encoder MiniMax-H3.
- Ejecución prevista en la ruta NPU Hexagon mediante el motor ggml de stable-diffusion.cpp (Nightmare Mobile).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Generación de imágenes en dispositivos móviles con NPU Hexagon: el formato GGUF y la cuantización Q4_0 reducen el peso del modelo a unos 11,57 GB, lo que permite integrarlo en la ruta de inferencia de Nightmare Mobile sobre hardware Qualcomm.
- Prototipado de pipelines text-to-image en stable-diffusion.cpp: al mantener los nombres de tensor del checkpoint de Comfy, se puede cargar en el motor ggml sin renombrar capas, acelerando la puesta en marcha de pruebas.
- Flujos de trabajo en ComfyUI: el derivado conserva la estructura del checkpoint original (salvo los tensores de contabilidad de atención), por lo que encaja en grafos que ya usen MiniMax-H3-Image con su VAE y text encoder.
- Experimentación con cuantización agresiva: sirve para evaluar la pérdida de calidad al pasar las capas lineales grandes a Q4_0 manteniendo en F32 los componentes sensibles (adaLN, normas, cabezas de salida).
- Despliegue en entornos con memoria limitada: el tamaño del archivo permite alojarlo en dispositivos con menos de 12 GB de memoria dedicada, algo inviable con el checkpoint bf16 completo.
- Investigación sobre eficiencia de difusión: al fijar 6 pasos con Euler y CFG 1, es un punto de partida reproducible para medir latencia y calidad en hardware móvil.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo GGUF ocupa 11.573.102.144 bytes (unos 11,57 GB); a ello hay que sumar la memoria del VAE y del text encoder MiniMax-H3, no cuantificados en este repositorio.
- GPU recomendadas: no disponible. El autor orienta el uso a la NPU Hexagon de Qualcomm mediante Nightmare Mobile, no a GPU de escritorio.
- Compatibilidad con GPU de consumo: no confirmada; el peso del archivo supera los 11 GB, por lo que excede la VRAM de muchas tarjetas de consumo de 8-12 GB una vez añadidos VAE y text encoder.
- Opciones de despliegue: stable-diffusion.cpp (motor ggml) en la ruta NPU Hexagon de Nightmare Mobile; compatible con el ecosistema ComfyUI por herencia del checkpoint. Soporte en vLLM, TGI u Ollama no disponible (no aplica a un modelo de difusión de imagen).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image Q4_0 GGUF (este) | no disponible (11,57 GB en disco) | no disponible | GGUF | MiniMax-H3-Image Community License | Hugging Face, 0 descargas |
| MiniMax-H3-Image (original, bf16 podado) | no disponible | no disponible | safetensors | MiniMax-H3-Image Community License | Hugging Face (MiniMaxAI) |
| Checkpoint Comfy-Org `minimax_h3_image_pruned_bf16` | no disponible | no disponible | safetensors | MiniMax-H3-Image Community License | Comfy-Org |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia MiniMax-H3-Image Community License excluye expresamente la Unión Europea, el Reino Unido, la República de Corea y los Estados Unidos; el uso en esas jurisdicciones no está cubierto.
- Los productos que utilicen el modelo deben mostrar la atribución "MiniMax-H3-Image".
- Las salidas generadas por IA deben declararse como tales.
- Las salidas no pueden emplearse para mejorar otros modelos de IA.
- Se aplica la política de uso aceptable del modelo base; es necesario leer la licencia completa antes de la descarga.
- Al ser una cuantización Q4_0 de capas lineales grandes, es previsible cierta degradación de calidad frente al checkpoint bf16; no se han publicado métricas que la cuantifiquen.
- No hay información sobre sesgos, tasas de alucinación visual ni limitaciones idiomáticas.
- El repositorio no incluye VAE ni text encoder; es necesario obtenerlos por separado.
- El autor indica un único ajuste de inferencia (6 pasos, Euler, CFG 1); no se documenta el comportamiento con otros parámetros.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AbrahamPJ/minimax-h3-image-q4_0-gguf
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- Proyecto Nightmare Mobile: https://github.com/AbrahamPaulJ/nightmare-mobile
