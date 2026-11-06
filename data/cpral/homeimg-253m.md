# cpral/HomeIMG-253M

## Resumen
HomeIMG-253M es un modelo de generación de imágenes texto-a-imagen de 253,4 millones de parámetros entrenado desde cero por el usuario cpral. Se trata de un Diffusion Transformer (DiT) con formulación de flow matching (rectified flow) que genera imágenes fijas de 256×256 píxeles a partir de prompts en inglés. Su particularidad es que no parte de un modelo preentrenado de imagen, sino que construye el denoiser completo desde cero y lo condiciona mediante un codificador de texto congelado (SlayerLab/Slayer149) y un decodificador latente también congelado (FLUX.2 small decoder).

El modelo resulta relevante como caso de estudio de entrenamiento eficiente: se entrenó en aproximadamente 12,5 horas sobre 8 GPU RTX 3090 Ti, empleando el optimizador Muon para las matrices ocultas y una estrategia distribuida MuLoCo (DiLoCo con optimizador interno Muon) que evita el all-reduce de gradientes sobre PCIe 3.0 x4. Incorpora además regularización REPA contra un codificador visual externo durante la primera fase del entrenamiento.

Por su tamaño reducido y su licencia Apache-2.0, es un modelo adecuado para experimentación, prototipado rápido y estudio de técnicas de entrenamiento (flow matching, REPA, Muon, DiLoCo) más que para producción de imágenes de alta resolución. La salida está limitada a 256×256 y a prompts en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con flow matching / rectified flow; 16 bloques, anchura 1024, 16 cabezas, MLP SwiGLU de 2432; self-attention con RoPE 2D y QK-norm, cross-attention a tokens de texto, condicionamiento adaLN-single estilo PixArt |
| Parámetros totales | 253.389.824 (253,4M) en el denoiser; refiner de texto entrenable de 12,6M |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | prompts de hasta 95 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento
El denoiser es un DiT de 16 bloques y anchura 1024 con 16 cabezas de atención, MLP SwiGLU de dimensión 2432 y un token por píxel latente (latentes FLUX.2 de 16×16 y 128 canales, sin patchify). Usa self-attention con RoPE 2D y QK-norm, cross-attention hacia los tokens de texto y condicionamiento de timestep adaLN-single al estilo PixArt. El texto se procesa con el modelo de lenguaje congelado Slayer149 (GPT causal estilo GoLLeM, anchura 768): se toman los estados ocultos antes de su último bloque, se normalizan con RMSNorm y pasan por 2 bloques refiner bidireccionales (768 de anchura, GQA 12/4 cabezas, RoPE 1D, SwiGLU) que sí se entrenan junto al denoiser. Un vector aprendido actúa como prompt vacío para classifier-free guidance. El decodificador FLUX.2 small se mantiene congelado y sin cambios.

El entrenamiento usó el dataset QLNI/FLUX-Reason-6M-flux2-latents (5,88M imágenes, 5 épocas, 114.844 pasos con batch 256, 29,4M muestras) con objetivo de rectified flow sobre la velocidad, timesteps logit-normal y 10% de caption dropout para CFG. Se aplicó REPA con PE-Spatial-B16 (Apache-2.0): el bloque 5 del DiT se alinea con las características de parche 16×16 del codificador sobre la imagen decodificada (peso 0,5, 50% de cada batch, primer 25% del entrenamiento). El optimizador es Muon (lr 3,5e-3, momentum 0,95, wd 0,01) para matrices ocultas y AdamW para el resto, con 2% de warmup y lr constante, EMA 0,9995 por paso. La distribución usa MuLoCo: cada una de las 8 GPU entrena su propia réplica con batch 32 y las réplicas se promedian cada 64 pasos, evitando el all-reduce sobre PCIe 3.0 x4. Se empleó autocast bf16 con pesos fp32 y torch.compile.

## Capacidades
- Generación de imágenes texto-a-imagen a resolución fija de 256×256 píxeles.
- Condicionamiento por prompt en inglés de hasta 95 tokens.
- Clasificador libre de guía (CFG) mediante vector de prompt vacío aprendido.
- Muestreo con scheduler Euler y control de pasos de inferencia y escala de guía (ejemplo de la model card: 50 pasos, CFG 3.0).
- Reproducibilidad mediante semilla en el generador de torch.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés.

## Casos de uso
- Prototipado rápido de conceptos visuales: con 253M de parámetros y salida 256×256, permite iterar sobre ideas de ilustración o composición en hardware de consumo antes de pasar a modelos mayores.
- Estudio de técnicas de entrenamiento: sirve como referencia reproducible para investigar flow matching, REPA, Muon o DiLoCo en un presupuesto de cómputo pequeño (8 GPU de 24 GB).
- Generación de miniaturas y avatares de baja resolución: la salida 256×256 encaja en iconos, thumbnails o placeholders para interfaces.
- Docencia y divulgación: su arquitectura modular (text encoder congelado + refiner entrenable + decoder congelado) facilita explicar el pipeline latente completo en cursos de difusión.
- Generación de datasets sintéticos de baja resolución: útil para aumentar datos de entrenamiento en tareas de visión donde 256×256 sea suficiente.
- Pruebas de integración con diffusers: al cargarse mediante DiffusionPipeline con custom_pipeline, sirve para validar pipelines personalizados y flujos de trust_remote_code en entornos de CI.
- Experimentación con CFG y schedulers: permite comparar configuraciones de muestreo (pasos, escala de guía, semillas) sobre un modelo pequeño y rápido.

## Benchmarks y rendimiento
La model card solo publica una métrica de pérdida de validación (velocity MSE sobre 4.096 imágenes reservadas, con ruido y timesteps fijos y el mismo código de evaluación):

| Modelo | val/loss (velocity MSE, menor es mejor) |
|---|---|
| AuroraIMG2-50M-Preview | 0,6929 |
| HomeIMG-253M (EMA, publicado) | 0,6499 |

No se han publicado resultados de benchmarks estándar (FID, CLIP score, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 253,4M de parámetros en el denoiser más el codificador de texto congelado y el decodificador FLUX.2, el peso total en el repositorio es de 5,2 GB, por lo que en fp16/bf16 debería caber holgadamente en GPU de consumo con 8 GB o más (estimación, no confirmada por el autor).
- GPU recomendadas: el autor entrenó con 8× RTX 3090 Ti; para inferencia basta una única GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) o una A100/H100 si se busca throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM en bf16, aunque el dato exacto no está publicado.
- Opciones de despliegue: diffusers con DiffusionPipeline y custom_pipeline (método documentado); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de difusión.
- Latencia y throughput estimados: no disponibles. El ejemplo de la model card usa 50 pasos Euler con CFG 3.0, lo que implica dos pasadas del denoiser por paso (una condicionada y otra con prompt vacío).

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución | Contexto de texto | Licencia | Notas |
|---|---|---|---|---|---|
| HomeIMG-253M | 253,4M (denoiser) + 12,6M refiner | 256×256 | 95 tokens | Apache-2.0 | Entrenado desde cero; val/loss 0,6499 |
| AuroraIMG2-50M-Preview | ~50M (según nombre) | no disponible | no disponible | Apache-2.0 | Base del pipeline; val/loss 0,6929 |
| SlayerLab/Slayer149 | no disponible | no aplica (es LM) | no disponible | Apache-2.0 | Codificador de texto congelado usado por HomeIMG-253M |

No se dispone de datos de benchmarks estándar ni de comparativas con otros modelos texto-a-imagen de tamaño similar en la información proporcionada.

## Limitaciones y advertencias
- Resolución fija de 256×256: no admite otras resoluciones ni aspect ratios sin reentrenamiento o adaptación.
- Solo admite prompts en inglés; el rendimiento con otros idiomas no está evaluado y previsiblemente será deficiente.
- Límite de 95 tokens de prompt, lo que restringe descripciones largas y detalladas.
- Riesgo de alucinación visual y de mala adherencia al prompt, habitual en modelos pequeños entrenados con pocos recursos; no se han publicado métricas de fidelidad (CLIP score, FID).
- Sesgos potencialmente heredados del dataset QLNI/FLUX-Reason-6M-flux2-latents y del codificador Slayer149; no se documentan evaluaciones de sesgo.
- Licencia Apache-2.0 para el modelo y el pipeline, pero el dataset de entrenamiento tiene sus propios términos (consultar las fichas del dataset) y el decodificador FLUX.2 small pertenece a Black Forest Labs bajo Apache-2.0; el codificador Slayer149 se distribuye con su propia LICENSE y NOTICE en text_encoder/.
- El uso requiere trust_remote_code=True y custom_pipeline, lo que implica ejecutar código del repositorio; conviene auditar antes de desplegar en producción.
- Modelo de investigación con 41 descargas y 2 likes en el momento de la ficha; no hay evidencia de uso en producción ni garantías de mantenimiento.
- No apto para tareas de razonamiento, código, agentes ni multimodalidad más allá de texto-a-imagen.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/cpral/HomeIMG-253M
- Modelo base (codificador de texto): https://huggingface.co/SlayerLab/Slayer149
- Decodificador FLUX.2 small: https://huggingface.co/black-forest-labs/FLUX.2-small-decoder
- Dataset de entrenamiento: https://huggingface.co/datasets/QLNI/FLUX-Reason-6M-flux2-latents
- Modelo de comparación AuroraIMG2-50M-Preview: https://huggingface.co/AuroraAI-Research/AuroraIMG2-50M-Preview
- Codificador REPA PE-Spatial-B16: https://huggingface.co/facebook/PE-Spatial-B16-512
- Código de entrenamiento: https://github.com/adamo1139/trenowanie_generatora_obrazkow
