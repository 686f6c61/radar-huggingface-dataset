# shahafvl/gaussianformer-v20

## Resumen

GaussianFormer es un modelo de renderizado neuronal que sintetiza imágenes a partir de escenas de 3D Gaussian Splatting (3DGS) mediante un transformer, sin necesidad de optimización por escena. Lo desarrolla el autor independiente shahafvl y se publica bajo licencia MIT. El modelo adapta RenderFormer (SIGGRAPH 2025), un renderizador transformer para mallas triangulares de Microsoft, al dominio de las gaussianas: cada gaussiana, con sus 14 parámetros `[pos(3), scale(3), quat(4), rgb(3), opacity(1)]`, se convierte en un token de escena.

La relevancia del modelo reside en que elimina el coste de rasterización tradicional por escena: en lugar de proyectar y componer gaussianas en pantalla, un transformer aprende a renderizarlas directamente, lo que permite un renderizado diferenciable y potencialmente más rápido en escenarios de síntesis de vistas novedosas. Mantiene la arquitectura de dos etapas de RenderFormer (un codificador de escena independiente de la vista y un decodificador de rayos dependiente de la vista con cabeza DPT) y se inicializa con los pesos preentrenados de RenderFormer.

El modelo tiene 194.869.143 parámetros totales y un repositorio de 0,8 GB. Está entrenado sobre objetos aislados del dataset Objaverse_Splats y genera imágenes de 512×512 píxeles. No está pensado para generación de texto ni para tareas de lenguaje: es un modelo de imagen-a-imagen especializado en renderizado 3D.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de dos etapas (codificador de escena + decodificador de rayos con cabeza DPT), adaptado de RenderFormer |
| Parametros totales | 194.869.143 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada: hasta ~20k gaussianas por escena) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de renderizado 3D, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `gaussianformer`, `pytorch_model_hub_mixin`) |

## Arquitectura y entrenamiento

GaussianFormer conserva la estructura de dos etapas de RenderFormer. La primera etapa es un codificador de escena independiente de la vista que procesa los tokens de gaussianas; la segunda es un decodificador de rayos dependiente de la vista con una cabeza DPT que produce la imagen final. Sobre esta base, el autor introduce tres cambios técnicos: un RoPE 2D proyectado (`proj_rope_2d`) que proyecta cada gaussiana en la vista y usa sus coordenadas de imagen como embedding rotatorio en la atención cruzada del decodificador; atención cruzada con ventanas (`xattn_window=8`), donde cada mosaico de 8×8 parches atiende solo a las gaussianas cuya huella proyectada lo alcanza (requiere Flash Attention en GPU); y parches de 4 píxeles (`patch_size=4`, `ray_embed_patch=8`), lo que da una rejilla de 128×128 tokens a 512 píxeles reutilizando el embedding de rayos de 8 píxeles preentrenado.

El entrenamiento usa los 26.820 objetos de entrenamiento de Objaverse_Splats, cada uno podado de ~50k a 20k gaussianas mediante la puntuación de importancia de LightGaussian y un ajuste fino de recuperación de las gaussianas conservadas. Los objetivos son renders de gsplat del splat completo sin podar a 512 píxeles, con 28 vistas por objeto a distancias de cámara 1,15, 1,7 y 2,45. El modelo se inicializa desde los pesos de RenderFormer y se entrena primero a 256 píxeles y luego durante 385k pasos a 512 píxeles en 8 GPU (una vista por GPU y paso, 4 pasadas sobre cada vista), con un learning rate warmup-stable-decay de 5e-5 y decaimiento coseno a 5e-7 en los últimos 10k pasos; en total, unos 4,5 días en 8 L40S. La función de pérdida combina L1 log-HDR (píxeles de fondo con peso 0,05) y LPIPS-VGG, a partes iguales.

## Capacidades

- Renderizado de escenas de 3D Gaussian Splatting a partir de sus parámetros (posición, escala, cuaternión, color y opacidad), sin optimización por escena.
- Síntesis de vistas novedosas (novel view synthesis) desde cámaras arbitrarias especificadas como matrices cámara-a-mundo.
- Generación de imágenes de 512×512 píxeles con campo de visión de 45 grados.
- Renderizado diferenciable, apto para integrarse en pipelines de entrenamiento y optimización.
- Procesamiento de escenas de aproximadamente 20k gaussianas por objeto.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no procesa texto).
- Capacidades especiales: renderizado con atención cruzada ventaneada y RoPE 2D proyectado; no dispone de modo thinking, visión general ni audio.

## Casos de uso

- Síntesis de vistas novedosas para reconstrucción 3D: dado un PLY de gaussianas reconstruido a partir de capturas, el modelo genera renders desde cámaras nuevas sin rasterizar, útil para evaluar la calidad de una reconstrucción desde ángulos no capturados.
- Renderizado diferenciable en pipelines de investigación: al ser un transformer diferenciable, puede integrarse en bucles de optimización de geometría o apariencia donde la rasterización tradicional no encaja bien.
- Visualización interactiva de activos 3D: conversión de activos de gaussianas a imágenes mediante un único paso de inferencia, adecuada para previsualizaciones en herramientas de autoría.
- Evaluación comparativa de métodos de compresión de gaussianas: el modelo sirve como referencia neuronal frente a la rasterización de gsplat (44,97 dB) para medir la pérdida de calidad introducida por la poda a 20k gaussianas.
- Generación de datasets sintéticos de vistas: producción de renders controlados por cámara a partir de objetos de Objaverse para aumentar datasets de entrenamiento de otros modelos de visión.
- Demostración e investigación en renderizado neuronal: reproducción de los experimentos del paper de RenderFormer adaptados a gaussianas, con código y pesos abiertos bajo MIT para estudiar el comportamiento de la atención ventaneada en renderizado.

## Benchmarks y rendimiento

Resultados sobre 300 objetos no vistos en entrenamiento, 4 vistas cada uno (vistas 0, 4, 7 y 11 a distancia de cámara 1,7), PSNR sobre la caja delimitadora del objeto frente al ground truth del splat completo:

| Metodo | PSNR (dB) | LPIPS |
|---|---|---|
| Rasterizacion gsplat de la misma entrada de 20k gaussianas | 44,97 | referencia |
| GaussianFormer | 37,08 | +0,009 sobre rasterizacion |

- Cuantiles de PSNR sobre los 300 objetos (10 / 50 / 90 %): 33,3 / 37,5 / 40,9 dB.
- A distancia cercana (1,15, los mismos cuatro ángulos): 36,87 dB, frente a 42,24 dB de la rasterización.
- Sobre 300 objetos de entrenamiento la misma métrica es 37,19 dB, 0,11 dB por encima de los objetos no vistos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo tiene ~195M parámetros (unos 0,8 GB en fp32) y procesa escenas de ~20k gaussianas con rejillas de 128×128 tokens, por lo que se recomienda al menos 16 GB de VRAM para trabajar con comodidad.
- GPU recomendadas: el autor entrena en 8 L40S; para inferencia se requiere GPU NVIDIA con soporte de Flash Attention (el código instala PyTorch para CUDA 12.8 y una rueda precompilada de Flash Attention).
- Cabe en GPU de consumo: probablemente sí en tarjetas con suficiente VRAM (RTX 4090, 24 GB), aunque no se publica una cifra mínima verificada.
- Opciones de despliegue: paquete `gaussianformer` instalable con uv o pip desde el repositorio de GitHub; pipeline `GaussianFormerRenderingPipeline.from_pretrained(...)`; CLI `infer.py` y `tools.ply_to_h5`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponible. El autor indica que la conversión y ajuste fino de un PLY a 20k gaussianas tarda aproximadamente un minuto en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto/escena | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GaussianFormer | 194,9M | Gaussianas 3DGS (14 params) | ~20k gaussianas | MIT | Hugging Face + GitHub |
| RenderFormer (microsoft/renderformer-v1-base) | no disponible | Mallas triangulares | no disponible | no disponible | Hugging Face |
| Rasterizacion gsplat | no aplica (no neuronal) | Gaussianas 3DGS | sin limite practico de tokens | codigo abierto (gsplat) | libreria |

RenderFormer es el modelo base del que se parte: renderiza mallas triangulares con la misma arquitectura de dos etapas, pero no acepta gaussianas. La rasterización gsplat no es un modelo neuronal, sino el método de referencia que GaussianFormer intenta aproximar; obtiene 44,97 dB frente a los 37,08 dB del transformer en la misma entrada de 20k gaussianas. No se dispone de datos de benchmarks de RenderFormer en la información proporcionada para una comparación cuantitativa directa.

## Limitaciones y advertencias

- Entrenado exclusivamente con objetos aislados y centrados en el cubo [-0,45, 0,45]^3, con FOV de 45 grados y distancias de cámara entre 1,15 y 2,45; las escenas con múltiples objetos y las capturas reales quedan fuera de la distribución de entrenamiento.
- Los objetos de evaluación proceden de la misma distribución que los de entrenamiento, por lo que el rendimiento en dominios distintos no está validado.
- Calidad inferior a la rasterización: 37,08 dB frente a 44,97 dB en la misma entrada, con una diferencia de LPIPS de +0,009.
- Requiere preprocesado específico del PLY (conversión de escalas logarítmicas, cuaterniones crudos, coeficientes armónicos esféricos y logits de opacidad, normalización y poda a 20k gaussianas), lo que añade pasos y posibles fuentes de error.
- Dependencia de Flash Attention en GPU para la atención cruzada ventaneada; no hay soporte documentado para CPU.
- No es un modelo de lenguaje: no procesa texto, no tiene capacidades multilingües ni de agentes, y no debe evaluarse con métricas de NLP.
- Riesgo de alucinación visual: al ser un modelo generativo, puede producir detalles plausibles pero incorrectos en regiones con poca cobertura de gaussianas.
- Licencia MIT: permite uso comercial, pero el modelo base RenderFormer y el dataset Objaverse_Splats tienen sus propias condiciones que conviene revisar antes de un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shahafvl/gaussianformer-v20
- Checkpoint de 256 px: https://huggingface.co/shahafvl/gaussianformer-256px
- Codigo: https://github.com/SVLwoof/gaussianformer
- Modelo base RenderFormer: https://huggingface.co/microsoft/renderformer-v1-base
- Dataset Objaverse_Splats: https://huggingface.co/datasets/ShapeSplats/Objaverse_Splats
- Flash Attention: https://github.com/Dao-AILab/flash-attention
