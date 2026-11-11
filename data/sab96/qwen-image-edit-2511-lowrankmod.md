# sab96/Qwen-Image-Edit-2511-LowRankMod

## Resumen

Qwen-Image-Edit-2511-LowRankMod es una versión comprimida del modelo de edición de imágenes Qwen-Image-Edit-2511 de Alibaba Qwen, publicada por el usuario sab96 en Hugging Face. La modificación sustituye las capas de modulación AdaLN del transformer de difusión por una única proyección de bajo rango compartida (rango 128) más pequeñas cabezas por capa, reduciendo esas capas de 6.800 millones a 284 millones de parámetros. El resultado es un modelo de image-to-image que mantiene una fidelidad numérica prácticamente idéntica al original en precisión bf16.

La relevancia de esta ficha reside en el ahorro de peso y memoria: los ficheros pasan de 40,9 GB (bf16 original) a 28,4 GB en bf16 y de 20,5 GB a 14,8 GB en la variante int8, lo que facilita el despliegue en GPUs de consumo y en flujos de ComfyUI. Se distribuye bajo licencia Apache-2.0, igual que el modelo base, y está pensado exclusivamente para el ecosistema ComfyUI mediante un nodo cargador personalizado.

No se dispone de información sobre el proceso de entrenamiento del modelo base, los datos utilizados ni los idiomas soportados más allá de lo indicado en la model card del autor de esta modificación. Toda la documentación disponible se centra en el método de compresión y en las instrucciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Qwen-Image-Edit) con capas AdaLN sustituidas por proyección de bajo rango compartida (rango 128) y cabezas por capa |
| Parametros totales | no disponible (las capas de modulación pasan de 6.800 M a 284 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (convrot) y bf16; factores de modulación en fp32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tres variantes: int8 convrot, int8 convrot con LoRA Lightning 8-step V2.0 integrada, y bf16) |

## Arquitectura y entrenamiento

El modelo base Qwen-Image-Edit-2511 es un transformer de difusión para edición de imágenes (pipeline image-to-image). La modificación de sab96 no reentrena el modelo: reemplaza las capas de modulación AdaLN (adaptive layer normalization) por una proyección de bajo rango compartida de rango 128 más pequeñas cabezas específicas por capa. Esta compresión reduce el número de parámetros de las capas de modulación de 6.800 millones a 284 millones, manteniendo los factores de modulación almacenados en fp32 en todos los ficheros publicados.

Según la model card, el error de modulación frente a la aritmética exacta en fp32, medido sobre timesteps reservados y relativo a la variación de cada capa a lo largo de los timesteps, es del 1,008 % de media y del 1,094 % en la peor capa, idéntico al del modelo denso en bf16. En t = 0 (imágenes de referencia) el error es del 0,196 %. El método de compresión está basado en bluvoll/ComfyUI-MageFlow-Compressed. No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens ni si hubo RLHF o DPO.

## Capacidades

- Edición de imágenes image-to-image: modificación de imágenes de entrada guiada por instrucciones, heredada del modelo base Qwen-Image-Edit-2511.
- Integración con ComfyUI mediante el nodo cargador personalizado Load Qwen-Image (Low-Rank AdaLN).
- Compatibilidad con el flujo de trabajo estándar de Qwen-Image-Edit-2511: el text encoder, el VAE y el resto de nodos se mantienen sin cambios.
- Variante con LoRA Lightning 8-step V2.0 integrada para inferencia en 8 pasos con CFG 1.
- Compatibilidad con LoRAs que afectan a capas de atención y MLP.
- No se dispone de información sobre soporte de tool calling, agentes, capacidades multilingües ni otras modalidades (audio, vídeo) en la documentación proporcionada.

## Casos de uso

- Edición de imágenes por instrucciones en local: el modelo permite modificar imágenes existentes (retocar objetos, cambiar estilos, eliminar elementos) mediante prompts, usando la variante int8 de 14,8 GB en una GPU de consumo con ComfyUI.
- Prototipado rápido en ComfyUI: al mantener el flujo de trabajo del modelo base y solo cambiar el nodo cargador, se puede integrar en pipelines existentes de Qwen-Image-Edit-2511 sin reescribir grafos.
- Despliegue en estaciones de trabajo con VRAM limitada: la reducción de 40,9 GB a 28,4 GB en bf16 y a 14,8 GB en int8 permite ejecutar el modelo en GPUs que no admitirían el original en bf16.
- Generación en 8 pasos para iteración rápida: la variante con Lightning 8-step V2.0 integrada reduce el coste de inferencia, adecuada para pruebas de concepto y ajuste de prompts.
- Automatización de edición por lotes: al ser un pipeline image-to-image, puede encadenarse en scripts que procesen lotes de imágenes con instrucciones predefinidas.
- Investigación sobre compresión de modelos de difusión: la técnica de proyección de bajo rango en capas AdaLN sirve como referencia para estudiar la compresión de transformers de difusión con pérdida mínima de fidelidad.

## Benchmarks y rendimiento

La model card solo publica métricas de error de modulación frente a la aritmética exacta en fp32, no benchmarks de calidad de imagen ni de tareas estándar:

| Metrica | Dense bf16 | Rank 128, factores fp32 |
|---|---|---|
| Error medio de modulación | 1,008 % | 1,008 % |
| Peor capa | 1,094 % | 1,094 % |
| t = 0 (imágenes de referencia) | 0,196 % | 0,196 % |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15 GB para la variante int8 (fichero de 14,8 GB) y unos 29 GB para la variante bf16 (fichero de 28,4 GB), sin contar text encoder y VAE del flujo de ComfyUI.
- GPU recomendadas: no especificadas por el autor. Por tamaño, la variante int8 es apta para GPUs de consumo de gama alta (RTX 4090 de 24 GB, RTX 3090 de 24 GB); la variante bf16 requiere GPUs profesionales (A100 40/80 GB, H100) o consumer de 32 GB o más.
- Cabe en GPU de consumo: sí, la variante int8 en GPUs de 24 GB, siempre que el resto del pipeline (text encoder, VAE) quepa en la VRAM restante.
- Opciones de despliegue: exclusivamente ComfyUI con el nodo personalizado ComfyUI-QwenImage-LowRankMod; el nodo Load Diffusion Model integrado no puede cargar estos ficheros. Los ficheros int8 requieren una versión reciente de ComfyUI con soporte de cuantización de precisión mixta.
- Latencia y throughput: no disponibles. La variante Lightning permite 8 pasos con CFG 1, lo que reduce el número de evaluaciones del modelo frente a la configuración estándar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen-Image-Edit-2511-LowRankMod (este) | Capas de modulación: 284 M (frente a 6.800 M) | no disponible | Apache-2.0 | safetensors int8/bf16 | Requiere nodo ComfyUI personalizado |
| Qwen/Qwen-Image-Edit-2511 (base) | no disponible | no disponible | Apache-2.0 | safetensors bf16 (40,9 GB) / int8 convrot (20,5 GB) | Carga con el nodo estándar de ComfyUI |
| lightx2v/Qwen-Image-Lightning | no disponible (LoRA) | no disponible | Apache-2.0 | LoRA | Acelera la inferencia a pocos pasos; integrado en una de las variantes |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá del error de modulación y los tamaños de fichero indicados.

## Limitaciones y advertencias

- Las LoRAs que apuntan a `img_mod`, `txt_mod` o `norm_out.linear` no se aplican con este modelo; solo funcionan las LoRAs de atención y MLP.
- Requiere el nodo personalizado ComfyUI-QwenImage-LowRankMod; no es cargable con el nodo Load Diffusion Model estándar de ComfyUI.
- Los ficheros int8 necesitan una versión reciente de ComfyUI con soporte de cuantización de precisión mixta.
- El repositorio no registra descargas ni likes y fue creado en noviembre de 2026; no hay evidencia de validación por parte de la comunidad.
- No se dispone de información sobre sesgos, riesgo de alucinación visual, limitaciones de idioma ni restricciones adicionales de la licencia Apache-2.0 para uso comercial.
- El método de compresión introduce un error de modulación del orden del 1 % respecto a fp32, aunque según el autor es idéntico al del modelo denso en bf16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sab96/Qwen-Image-Edit-2511-LowRankMod
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Nodo cargador personalizado: https://github.com/sab76/ComfyUI-QwenImage-LowRankMod
- LoRA Lightning: https://huggingface.co/lightx2v/Qwen-Image-Lightning
- Método de compresión de referencia: https://github.com/bluvoll/ComfyUI-MageFlow-Compressed
