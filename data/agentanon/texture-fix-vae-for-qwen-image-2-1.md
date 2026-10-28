# AgentAnon/texture-fix-vae-for-qwen-image-2.1

## Resumen

Texture-Fix-VAE-for-Qwen-Image-2.1 es un autoencoder variacional (VAE) de 337,7 millones de parámetros que actúa como componente de codificación/decodificación latente del modelo de difusión Qwen-Image-2.1. No es un modelo generativo autónomo: se acopla al pipeline de Qwen-Image-2.1 en sustitución del VAE oficial (`qwen_image_2.1_vae_bf16.safetensors`) para corregir dos defectos concretos del original: los artefactos de tablero de ajedrez (checkerboard) en texturas de alta frecuencia y la aparición de NaNs cuando el decodificador se ejecuta en fp16.

El ajuste lo firma el usuario AgentAnon como finetune no oficial del VAE de Qwen, aunque los ejemplos de código de la model card apuntan al repositorio `madebyollin/texture-fix-vae-for-qwen-image-2.1`, lo que sugiere una republicación del trabajo original de Ollin Boer Bohan. El modelo base declarado es Qwen/Qwen-Image-2.1 y la licencia es `qwen-research`, heredada del modelo base.

Su relevancia es práctica: los VAEs se ejecutan en cada paso de decodificación de un pipeline de difusión, de modo que un VAE que produce NaNs en fp16 obliga a usar bf16 o a aplicar parches manuales, y un VAE con checkerboarding degrada la percepción de detalle en imágenes fotorrealistas. Este finetune mejora la métrica perceptual rFID de 3,38 a 2,06 a costa de un empeoramiento leve de PSNR y LPIPS, y habilita la decodificación en fp16 sin desbordamientos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VAE convolucional (autoencoder) para el espacio latente de Qwen-Image-2.1; bloques residuales con RMSNorm al inicio de cada rama residual; número de canales latentes y factor de compresión no disponibles |
| Parámetros totales | 337.740.404 (≈337,7 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen; la ventana efectiva depende de la resolución de entrada, no disponible) |
| Tipos de cuantización | Pesos publicados en bf16 y en fp16; no se documentan GGUF, INT8 ni INT4 |
| Idiomas soportados | No disponible (procesa tensores de imagen, no texto; el pipeline de texto a imagen de Qwen-Image-2.1 sí es multilingüe, pero no se detalla en esta ficha) |
| Licencia | `qwen-research` (etiqueta `license: other`, enlace al LICENSE del modelo base) |
| Formato de pesos | `safetensors`; fichero principal `texture_fix_vae_for_qwen_image_2.1_bf16.safetensors`; librería `diffusers` |

## Arquitectura y entrenamiento

El modelo es un VAE de arquitectura convolucional con ramas residuales normalizadas mediante RMSNorm, la misma topología que el VAE oficial de Qwen-Image-2.1, ya que el objetivo es ser un reemplazo directo e intercambiable (drop-in) dentro del pipeline `QwenImage21Pipeline` a través de la clase `AutoencoderKLQwenImage21`. El finetune no altera la arquitectura ni el número de parámetros: solo los pesos. El autor no documenta el número de tokens, imágenes ni la composición del dataset de ajuste.

El entrenamiento se concentró en los bloques de mayor resolución, ajustados brevemente con la receta adversarial desarrollada para TAESD, que combina pérdidas MSE/MAE orientadas a PSNR, LPIPS y una pérdida adversarial (GAN). El razonamiento expuesto en la model card es que las pérdidas MSE/MAE empujan hacia el desenfoque cuando el detalle no se puede reconstruir con precisión, LPIPS empuja hacia desenfoque y checkerboarding, y solo la pérdida adversarial fuerza detalle nítido y plausible sin artefactos evidentes. El autor sospecha que el VAE original de Qwen-Image-2.1 se entrenó sin un término adversarial funcional, y cita la figura del paper DC-AE (arXiv:2410.10733) para ilustrar el efecto.

La segunda intervención es numérica, no perceptual: se reajustaron los pesos del decodificador para mantener las mismas salidas reduciendo la magnitud de las activaciones (en la línea de SDXL-VAE-FP16-Fix) y se redujeron manualmente ciertos pesos para disminuir la escala del flujo residual. Como cada rama residual comienza con una RMSNorm, ese reescalado no cambia la salida funcional del bloque, pero evita desbordamientos en fp16. No se documenta uso de RLHF ni DPO, algo por otra parte ajeno a un VAE.

## Capacidades

- Codificación y decodificación latente para el pipeline de difusión Qwen-Image-2.1, en sustitución del VAE oficial.
- Decodificación en fp16 sin NaNs, incluyendo regiones totalmente transparentes (canal alfa), donde el VAE original los generaba y los propagaba al contenido circundante.
- Supresión de artefactos de tablero de ajedrez en texturas de alta frecuencia, especialmente visible en imágenes de estilo fotográfico con detalle fino (vegetación, roca, agua).
- Compatibilidad con ComfyUI mediante el nodo `Load VAE`, y con el flag `--fp16-vae`.
- Compatibilidad con Diffusers mediante `AutoencoderKLQwenImage21.from_pretrained(...)` y `QwenImage21Pipeline`.
- No realiza generación de texto, razonamiento, código, tool calling, agentes ni visión semántica: es un componente de compresión de imagen, no un modelo multimodal.
- No se documentan capacidades multilingües propias.

## Casos de uso

- Sustitución directa del VAE en un pipeline de Qwen-Image-2.1 ya en producción: basta con apuntar el cargador de VAE al nuevo fichero para eliminar el checkerboarding en las imágenes finales, sin reentrenar ni recalibrar el modelo de difusión, porque el espacio latente es el mismo.
- Despliegue en fp16 para ahorrar memoria: el VAE original produce NaNs en fp16, lo que obliga a mantener bf16 o a parchear; con este modelo se puede ejecutar el decodificador en fp16 y liberar VRAM en GPUs sin soporte bf16 nativo.
- Generación de imágenes fotorrealistas de paisaje y naturaleza: los ejemplos de la model card se centran en escenas con vegetación densa, agua y roca, donde el checkerboarding es más perceptible; es el escenario donde la mejora de rFID (3,38 → 2,06) se traduce en diferencia visible.
- Evaluación comparativa de VAEs en investigación: sirve como caso de control para medir el impacto de añadir pérdida adversarial sobre métricas perceptuales frente a métricas de reconstrucción (rFID frente a PSNR/LPIPS).
- Integración en flujos de ComfyUI de estudio: al funcionar como fichero de VAE estándar en `ComfyUI/models/vae/`, se puede intercambiar por nodo en un grafo existente sin reescribir el pipeline.
- Reproducción de experimentos de cuantización y precisión mixta: el parche de reescalado de pesos documentado (RMSNorm + reducción manual de pesos) es un patrón reutilizable para portar otros VAEs a fp16.
- Tratamiento de imágenes con canal alfa: dado que los NaNs del VAE original se concentraban en regiones transparentes, este modelo es preferible en pipelines que generan o decodifican imágenes con transparencia.

## Benchmarks y rendimiento

Métricas de reconstrucción y perceptuales declaradas por el autor sobre COCO val2017 (5.000 imágenes a 256²) y DIV2K valid (recortes nativos a 1024²):

| Métrica | Qwen-Image-2.1-VAE (bf16) | Texture-Fix (bf16) | Texture-Fix (fp16) |
|---|---|---|---|
| rFID ↓ (COCO val2017, 256²) | 3,38 | 2,07 | **2,06** |
| PSNR ↑ (COCO val2017, 256²) | **33,29** | 32,73 | 32,79 |
| LPIPS ↓ (COCO val2017, 256²) | **0,0357** | 0,0384 | 0,0380 |
| PSNR ↑ (DIV2K valid, 1024²) | **32,85** | 32,35 | 32,40 |
| LPIPS ↓ (DIV2K valid, 1024²) | **0,0460** | 0,0490 | 0,0486 |

El autor incluye además una tabla de estabilidad numérica en fp16 (encoder y decoder en fp16) con la fila "mayor activación del decodificador", pero el dato numérico aparece truncado en la información disponible, por lo que no se reproduce. No se han publicado resultados de benchmarks de calidad de imagen generada de extremo a extremo (FID del pipeline completo, evaluaciones con modelos de preferencia humana ni CLIP score) en la información disponible.

## Requisitos de hardware

- Pesos en bf16: aproximadamente 0,68 GB (337,7 M de parámetros × 2 bytes). El repositorio ocupa 2,1 GB, lo que incluye variantes y artefactos auxiliares.
- VRAM de inferencia del VAE: no disponible de forma explícita; escala con la resolución de salida y el tamaño de lote, no solo con los parámetros. El VAE por sí solo cabe holgadamente en cualquier GPU consumer con 8 GB o más.
- El requisito real viene del pipeline completo de Qwen-Image-2.1 (modelo de difusión + codificador de texto), cuyos requisitos no se detallan en la información disponible.
- GPU recomendadas: no especificadas por el autor. Para el VAE aislado, cualquier GPU con soporte bf16 (serie RTX 30/40, A100, H100) o fp16 (incluidas GPUs sin bf16 nativo, gracias al parche de NaNs).
- Cabe en GPU consumer: sí para el componente VAE; para el pipeline completo, no disponible.
- Opciones de despliegue: Diffusers (`AutoencoderKLQwenImage21` + `QwenImage21Pipeline`), ComfyUI (nodo `Load VAE`, con soporte de `--fp16-vae`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VAE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Función | rFID (COCO 256²) | NaNs en fp16 | Licencia |
|---|---|---|---|---|---|
| Texture-Fix-VAE-for-Qwen-Image-2.1 (este) | 337,7 M | VAE para Qwen-Image-2.1 | 2,07 (bf16) / 2,06 (fp16) | No | qwen-research |
| Qwen-Image-2.1-VAE (oficial) | No disponible (presumiblemente idéntico) | VAE para Qwen-Image-2.1 | 3,38 | Sí, frecuentes en regiones transparentes | qwen-research |
| Texture-Fix-VAE-for-Qwen-Image-1-and-Krea-2 | No disponible | VAE para Qwen-Image (1), Qwen Image Edit y Krea 2 | No disponible | No disponible | No disponible |
| SDXL-VAE-FP16-Fix | No disponible | VAE para SDXL, referencia metodológica del parche fp16 | No disponible | No | No disponible |

La comparación directa solo es posible frente al VAE oficial de Qwen-Image-2.1, único para el que la model card aporta cifras. El resto de alternativas son referencias metodológicas o VAEs para otras familias de modelos y no son intercambiables con este.

## Limitaciones y advertencias

- El propio autor califica el modelo como finetune no oficial de Qwen; no está respaldado por el equipo de Qwen y no debe presentarse como parte oficial del modelo base.
- La autoría es ambigua: el repositorio pertenece a `AgentAnon`, pero los ejemplos de código apuntan a `madebyollin/texture-fix-vae-for-qwen-image-2.1`. Conviene verificar la procedencia de los pesos antes de usarlos en producción.
- El modelo tiene 0 descargas y 2 likes en el momento de la ficha: no hay validación de la comunidad ni auditoría independiente de los pesos publicados.
- El ajuste mejora la métrica perceptual (rFID) pero empeora la fidelidad de reconstrucción: PSNR baja de 33,29 a 32,73 en COCO y de 32,85 a 32,35 en DIV2K; LPIPS sube de 0,0357 a 0,0384 y de 0,0460 a 0,0490. En aplicaciones que prioricen reconstrucción exacta (compresión, pipelines img2img con preservación estricta), el VAE original puede ser preferible.
- El finetune se aplicó "brevemente" y solo sobre los bloques de mayor resolución, según la model card; no hay garantía de que otros artefactos a escalas menores hayan sido corregidos.
- La licencia `qwen-research` no es permisiva: impone restricciones que deben revisarse en el LICENSE del modelo base antes de cualquier uso comercial. No se debe asumir uso comercial libre.
- La model card está íntegramente en inglés y no documenta sesgos, composición del dataset de ajuste ni evaluación con rostros o contenido sensible; no hay información sobre comportamiento diferencial por demografía, estilo o dominio.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí existe el riesgo de que la pérdida adversarial introduzca detalle plausible pero falso en texturas donde el latente no contiene información suficiente.
- Las métricas declaradas son de reconstrucción del VAE, no de calidad de la imagen generada de extremo a extremo; no hay evidencia publicada sobre FID del pipeline completo ni sobre evaluación humana.
- Dependencia estricta de la versión del pipeline: solo es compatible con Qwen-Image-2.1. Para Qwen-Image (1), Qwen Image Edit y Krea 2 existe un modelo distinto del mismo autor.
- No se dispone de información sobre idiomas, sesgos ni latencia, lo que limita la planificación de capacidad en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AgentAnon/texture-fix-vae-for-qwen-image-2.1
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Carpeta del VAE oficial de Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1/tree/main/vae
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Texture-Fix-VAE para Qwen-Image (1), Qwen Image Edit y Krea 2: https://huggingface.co/madebyollin/texture-fix-vae-for-qwen-image-1-and-krea-2
- Repositorio TAESD (receta adversarial de referencia): https://github.com/madebyollin/taesd
- Paper DC-AE, *Deep Compression Autoencoder for Efficient High-Resolution Diffusion Models* (Chen et al., 2024): https://arxiv.org/abs/2410.10733
- SDXL-VAE-FP16-Fix (referencia metodológica del parche fp16): https://huggingface.co/madebyollin/sdxl-vae-fp16-fix

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo ni con Qwen-Image; los resultados obtenidos eran contenido no técnico y ajeno al tema, por lo que no se incluyen como enlaces.
