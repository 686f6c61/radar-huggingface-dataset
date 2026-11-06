# Lingmin-Ran/SADAE

## Resumen

STARFlow es una familia de modelos generativos basados en transformers con flujos normalizadores autorregresivos (autoregressive normalizing flows), desarrollada por Apple y publicada como código abierto. El modelo combina la expresividad de los modelos autorregresivos con la eficiencia de los flujos normalizadores para tareas de generación de imagen y vídeo a partir de texto. La versión principal, STARFlow, se presentó en NeurIPS 2025 como Spotlight, y su extensión STARFlow-V en CVPR 2026 como Highlight.

El repositorio de Hugging Face `Lingmin-Ran/SADAE` es un espejo o derivado que contiene la implementación de SADAE (Source-Anchored Decoupled Affine Editing), una técnica de edición de imágenes basada en los flujos normalizadores de STARFlow, junto con scripts de evaluación sobre PIE-Bench y PIE-Bench++. El repositorio no contiene pesos del modelo (0.0 GB), sino el código y la configuración para ejecutar la inferencia y la edición.

La relevancia actual de STARFlow radica en que propone una alternativa a los modelos de difusión para generación visual, usando flujos normalizadores exactos que permiten inversión y edición precisa de imágenes. El tamaño de los checkpoints mencionados va de 3B a 7B parámetros, con soporte para generación texto-a-imagen a 256x256 y texto-a-vídeo a 480p.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo con flujos normalizadores (autoregressive normalizing flow) |
| Parametros totales | 3B (texto-a-imagen) y 7B (texto-a-vídeo) segun checkpoints mencionados |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en FP32/BF16 segun scripts) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch); no se usa safetensors ni GGUF |

## Arquitectura y entrenamiento

STARFlow emplea una arquitectura de transformer autorregresivo combinada con flujos normalizadores latentes. A diferencia de los modelos de difusión, que aprenden a invertir un proceso de ruido, STARFlow modela una transformación invertible exacta entre el espacio latente y los datos, lo que permite tanto la generación como la inversión precisa de imágenes reales. La variante STARFlow-V extiende el enfoque a vídeo de extremo a extremo con flujos normalizadores causales.

El repositorio incluye scripts para descargar el checkpoint de texto-a-imagen (3B, 256x256), el codificador de texto FLAN-T5-XL y el VAE de Stable Diffusion (SD-VAE). También se mencionan los papers STARFlow2 (que conecta modelos de lenguaje y flujos normalizadores para generación multimodal unificada) y NTM (Normalizing Trajectory Models), ambos con código pendiente de publicación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) a resolución 256x256 con el checkpoint de 3B.
- Generación de vídeo a partir de texto (text-to-video) a 480p con el checkpoint de 7B (STARFlow-V).
- Inversión exacta de imágenes reales al espacio latente mediante flujos normalizadores, lo que habilita edición precisa.
- Edición de imágenes basada en instrucciones (SADAE: Source-Anchored Decoupled Affine Editing) con preservación de la estructura y el fondo.
- Evaluación integrada sobre PIE-Bench y PIE-Bench++ con métricas de estructura, PSNR, LPIPS, MSE, SSIM y similitud CLIP.
- Soporte de inferencia en FP32 y BF16 (se menciona preservar resultados históricos en BF16).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Edición de imágenes con preservación de fondo: usar SADAE para modificar un objeto concreto de una imagen manteniendo la estructura y el fondo intactos, evaluando con las métricas de PIE-Bench (structure_distance, psnr_unedit_part, ssim_unedit_part).
- Generación de imágenes para prototipado rápido: emplear el checkpoint de 3B a 256x256 para generar bocetos o conceptos visuales a partir de descripciones textuales en pipelines de diseño.
- Generación de vídeo corto a 480p: usar STARFlow-V (7B) para crear clips de vídeo a partir de texto en tareas de previsualización o storyboarding.
- Investigación en modelos generativos: servir como base para experimentar con flujos normalizadores como alternativa a la difusión, incluyendo inversión y manipulación del espacio latente.
- Evaluación de métodos de edición: el repositorio incluye scripts para reproducir PIE-Bench y PIE-Bench++ con métricas automáticas, útil para comparar técnicas de edición de imágenes.
- Reconstrucción e inversión de imágenes: invertir una imagen real con el flujo normalizador y reconstruirla para analizar la fidelidad del espacio latente (script `run_pie_bench_nf_baseline.sh`).
- Edición guiada por caption objetivo: invertir la imagen con su caption original y revertir con un caption objetivo para aplicar cambios semánticos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. El repositorio menciona que STARFlow alcanza resultados state-of-the-art en generación texto-a-imagen y texto-a-vídeo, y que fue aceptado como Spotlight en NeurIPS 2025 y Highlight en CVPR 2026, pero no se incluyen tablas con valores de MMLU, HumanEval, GSM8K, FID, CLIP score ni métricas comparativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Para un modelo de 3B en FP32 se estiman alrededor de 12 GB solo en pesos, y para 7B en FP32 unos 28 GB; en BF16 se reduciría aproximadamente a la mitad. Estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no disponible. Los scripts usan `torchrun` con `--nproc_per_node 1` y `CUDA_VISIBLE_DEVICES`, lo que sugiere que puede ejecutarse en una sola GPU, pero no se especifica el modelo.
- Cabe en GPU de consumo: no disponible. No se confirma soporte para RTX 4090 u otras GPU consumer.
- Opciones de despliegue: el repositorio usa PyTorch nativo con `torchrun` y scripts bash. No se menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STARFlow (este) | 3B / 7B | no disponible | Flujo normalizador autorregresivo | no disponible | Checkpoints en HF (apple/starflow) |
| Modelos de difusión (p. ej. Stable Diffusion) | ~1B-8B | no aplica | Difusión latente | Varía (a menudo CreativeML) | Amplia |
| Modelos autorregresivos de imagen (p. ej. VAR, Parti) | Varía | no disponible | Autorregresivo discreto | Varía | Varía |

No se dispone de datos de rendimiento comparativo entre STARFlow y estos modelos en la información proporcionada. La comparativa se limita a la categoría arquitectónica.

## Limitaciones y advertencias

- La licencia no está especificada en la información disponible, por lo que no se puede confirmar el uso comercial.
- El repositorio de Hugging Face tiene 0.0 GB, es decir, no contiene los pesos; es necesario descargarlos desde `apple/starflow`.
- Los checkpoints están en formato `.pth` (PyTorch), no en safetensors ni GGUF, lo que limita su uso con herramientas de inferencia optimizadas.
- La resolución de evaluación por defecto es 256x256, inferior a los 512x512 habituales en PIE-Bench, lo que puede dificultar comparaciones directas.
- No se documentan sesgos conocidos ni tasas de alucinación, pero al ser un modelo generativo visual existe riesgo de generar contenido inexacto o estereotipado.
- No se especifican los idiomas soportados para los prompts de texto.
- El código de STARFlow2 y NTM aún no está disponible (marcado como "Code TBD").
- Los scripts de edición SADAE requieren rutas absolutas y entornos conda específicos, lo que puede complicar la reproducibilidad.
- No hay soporte documentado para tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Hugging Face del repositorio: https://huggingface.co/Lingmin-Ran/SADAE
- Hugging Face de los pesos: https://huggingface.co/apple/starflow
- Paper STARFlow (NeurIPS 2025 Spotlight): https://arxiv.org/abs/2506.06276
- Paper STARFlow-V (CVPR 2026 Highlight): https://arxiv.org/abs/2511.20462
- Paper STARFlow2: https://arxiv.org/abs/2605.08029
- Paper NTM (Normalizing Trajectory Models): https://arxiv.org/abs/2605.08078
- Repositorio de código: https://github.com/apple/ml-starflow
- Galería de resultados de vídeo: https://starflow-v.github.io
- Evaluación PIE-Bench: https://github.com/cure-lab/PnPInversion/tree/main/evaluation
- NeurIPS 2025: https://neurips.cc/Conferences/2025
