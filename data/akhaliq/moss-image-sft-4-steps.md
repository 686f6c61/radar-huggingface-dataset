# akhaliq/MOSS-Image-SFT-4-steps

## Resumen

MOSS-Image-SFT-4-steps es un adaptador LoRA de destilación para el modelo de difusión texto-a-imagen MOSS-Image-SFT, publicado por el usuario akhaliq sobre el transformer base de OpenMOSS-Team. Su propósito es reducir el coste de inferencia de un sampler de flow matching estándar de decenas de pasos a tan solo 4 pasos con CFG 1 (sin guiado por clasificador), manteniendo la fidelidad de texto y números que caracteriza a la familia MOSS-Image. La versión 2.0 del adaptador, publicada el 18 de octubre de 2026, es "Euler-native": un único archivo `lora.safetensors` que funciona sobre el sampler Euler estándar de diffusers o ComfyUI, sin sampler personalizado ni safetensors auxiliares.

El modelo resuelve un problema práctico de producción: generar imágenes de 1024×1024 en aproximadamente 5,6 segundos en una A100, frente a los 8 pasos del checkpoint del que parte (lodestones/MOSS-Image-SFT-8-steps-dmd) o a los pipelines completos de MOSS-Image-SFT. Incluye además un "tier borrador" de 3 pasos (`lora_3step.safetensors`) que baja a unos 4,2 segundos por imagen con calidad de borrador utilizable, y mantiene la representación bilingüe de texto (chino e inglés) en carteles, menús e infografías.

El repositorio empaqueta todo lo necesario para inferencia (pipeline, text encoder, VAE), un CLI `inference.py`, código de entrenamiento y una demo ZeroGPU. La licencia Apache-2.0 permite uso comercial. El adaptador se aplica tanto sobre MOSS-Image-SFT como sobre MOSS-Image-Base, y está pensado para integrarse en ComfyUI mediante `LoraLoaderModelOnly` o en diffusers mediante el script `apply_lora.py` incluido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (flow matching) MOSS-Image con adaptador LoRA de destilación few-step; sampler Euler estándar |
| Parámetros totales | 5.082.308.624 (transformer base MOSS-Image-SFT; el LoRA añade un número no especificado de parámetros adaptadores) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto de texto declarada) |
| Tipos de cuantización | no disponible explícitamente; la inferencia de referencia usa base en bf16 y LoRA en fp32 |
| Idiomas soportados | no disponible como lista formal; el modelo renderiza texto bilingüe chino-inglés en imágenes |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (LoRA), diffusers (pipeline completo en el repo) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer de difusión de flow matching (MOSS-Image) que actúa como modelo base congelado. La destilación se realizó mediante DMD en espacio de datos (data-space DMD), según el paper arXiv 2610.12102, partiendo del checkpoint ya destilado a 8 pasos `lodestones/MOSS-Image-SFT-8-steps-dmd`. La versión 2.0 se entrenó de forma nativa sobre el schedule de flujo Euler de la release, con anclas en t = 1000/910/717/24, en lugar de adaptarse a posteriori; por eso funciona con cualquier cargador de LoRA estándar y con el sampler Euler de diffusers o el `KSampler` de ComfyUI con 4 pasos y CFG 1.0.

El repositorio incluye además un segundo adaptador, `lora_3step.safetensors` (y su versión congelada `moss_image_sft_3step_v1.0.safetensors`), entrenado específicamente para exactamente 3 pasos; el autor advierte de que no debe ejecutarse con otros conteos de pasos. La versión 1.x del adaptador utilizaba un sampler propio en espacio de datos y archivos auxiliares (`time_embedding.safetensors`, `dataspace.safetensors`) que han sido retirados de la raíz del repo; siguen disponibles en `checkpoint-update-400/`. El autor documenta también un experimento fallido con 2 pasos.

## Capacidades

- Generación de imágenes texto-a-imagen de alta fidelidad en 4 pasos con CFG 1, sin prompt negativo.
- Renderizado de texto bilingüe (chino e inglés) en carteles, menús, infografías y escaparates, con especial atención a números secundarios (porcentajes, precios).
- Generación sin tiling a resoluciones de 1024², 1536×1024 y 2048² (verificado en `tiling_probe/`).
- Modo borrador de 3 pasos (`lora_3step.safetensors`) para previsualización rápida con texto correcto y sujetos nítidos.
- Compatibilidad con MOSS-Image-SFT y MOSS-Image-Base aplicando el mismo LoRA (en Base la salida es algo más suave).
- Integración en ComfyUI mediante `LoraLoaderModelOnly` y en diffusers mediante `apply_lora.py`.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de imágenes.

## Casos de uso

- Previsualización rápida en estudios de diseño: usar el tier de 3 pasos (~4,2 s por imagen en A100) para iterar sobre composiciones y luego el de 4 pasos (~5,6 s) para el render final, reduciendo el coste de GPU frente a pipelines de decenas de pasos.
- Generación de carteles y menús bilingües: el modelo renderiza correctamente cadenas como "TODAY'S SPECIAL / Flat White $4.50" o "深夜食堂", lo que lo hace adecuado para material promocional en mercados chino e inglés.
- Infografías con cifras: la fidelidad numérica verificada (por ejemplo "62% / 38%") permite generar gráficos informativos donde otros adaptadores few-step garblean los números secundarios.
- Producción de imágenes a 2048² sin tiling: útil para impresión o fondos de alta resolución sin artefactos de costura, verificado en el repositorio de evaluación.
- Integración en ComfyUI para pipelines de contenido: cargar `lora.safetensors` con `LoraLoaderModelOnly` a fuerza 1.0 sobre el modelo MOSS-Image-SFT y usar `KSampler` en euler/simple/4 pasos/CFG 1.0 para flujos de generación por lotes.
- Prototipado en demos ZeroGPU: el Space oficial `akhaliq/moss-image-4-step-turbo` sirve como referencia para desplegar el modelo en hardware gratuito o de bajo coste con latencias de segundos.
- Evaluación comparativa de adaptadores few-step: el repo incluye tiras de evaluación con las mismas semillas y prompts frente a `darask0/rapid-moss` y `lodestones/lora_latest`, útil para reproducir comparativas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la información disponible. El autor aporta métricas de latencia y comparativas cualitativas:

| Métrica | Valor declarado |
|---|---|
| Latencia 4 pasos, 1024×1024, 1× A100 | ~5,6 s por imagen (4 forwards, base bf16 + LoRA fp32, sin CFG) |
| Latencia 3 pasos, 1024×1024, 1× A100 | ~4,2 s por imagen |
| Latencia 4 pasos, 1024×1024, 1× A100 (cifra alternativa en la card) | ~11 s por imagen |
| Fidelidad de texto/números | Único adaptador few-step que renderiza "62% / 38%" correctamente en la comparativa a 4 bandas |
| Resoluciones verificadas sin tiling | 1024², 1536×1024, 2048² |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el transformer base tiene 5.082 millones de parámetros y el repo completo ocupa 126,2 GB, por lo que la inferencia en bf16 requiere una GPU de gama alta (se ha verificado en A100).
- GPU recomendadas: A100 (referencia de latencia del autor); H100 previsiblemente válida pero no documentada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible; el tamaño del transformer y del text encoder hace improbable un despliegue cómodo en GPUs de 8-12 GB sin cuantización.
- Opciones de despliegue: diffusers (pipeline empaquetado + `apply_lora.py`), ComfyUI (`LoraLoaderModelOnly` + `KSampler` euler/simple), CLI `inference.py` incluido, demo ZeroGPU en Hugging Face Spaces.
- Latencia: ~4,2 s (3 pasos) y ~5,6 s (4 pasos) por imagen de 1024² en una A100, sin CFG; el autor menciona también ~11 s en una referencia, sin aclarar la discrepancia.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Pasos | Sampler | Fidelidad de texto/números | Licencia | Notas |
|---|---|---|---|---|---|
| akhaliq/MOSS-Image-SFT-4-steps (este) | 4 (y 3 en tier borrador) | Euler estándar, CFG 1 | Renderiza "62% / 38%" correctamente | Apache-2.0 | Compatible con cualquier cargador de LoRA |
| lodestones/MOSS-Image-SFT-8-steps-dmd | 8 | DMD | El autor indica que garbela números secundarios en `lora_latest` | no disponible | Checkpoint del que parte este adaptador |
| darask0/rapid-moss | few-step | no disponible | El autor indica que garbela números secundarios | no disponible | Comparado en la evaluación a 4 bandas |
| OpenMOSS-Team/MOSS-Image-SFT (base) | pipeline completo | flow matching estándar | Alta (referencia) | no disponible | Modelo base; acepta este LoRA con salida algo más suave |

## Limitaciones y advertencias

- El adaptador de 3 pasos está entrenado para exactamente 3 pasos; ejecutarlo con otro conteo degrada la calidad.
- El experimento con 2 pasos se documenta como fallido; no se recomienda su uso.
- La fidelidad de texto se ha verificado en chino e inglés; el comportamiento en otros alfabetos no está documentado.
- La latencia declarada es inconsistente en la propia model card (~5,6 s y ~11 s para el mismo caso), por lo que conviene medirla en el hardware objetivo.
- No hay benchmarks cuantitativos publicados (FID, CLIP, etc.); las afirmaciones de superioridad son comparativas cualitativas del autor.
- Riesgo de alucinación visual y de errores en textos largos o densos no cuantificado en la información disponible.
- Aplicado sobre MOSS-Image-Base la salida es más suave; si se requiere la estética exacta de SFT, usar el base SFT.
- La licencia del adaptador es Apache-2.0, pero la del modelo base MOSS-Image-SFT no se detalla en la información proporcionada; conviene verificar la licencia del base antes de un uso comercial.
- Los archivos de la versión 1.x (sampler en espacio de datos) han sido retirados de la raíz del repo; los usuarios de v1.x deben migrar al nuevo cargador o usar `checkpoint-update-400/`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/MOSS-Image-SFT-4-steps
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Checkpoint de partida (8 pasos DMD): https://huggingface.co/lodestones/MOSS-Image-SFT-8-steps-dmd
- Paper de destilación DMD: https://arxiv.org/abs/2610.12102
- Demo ZeroGPU: https://huggingface.co/spaces/akhaliq/moss-image-4-step-turbo
- Dataset de evaluación: https://huggingface.co/datasets/akhaliq/moss-image-turbo-eval
- Ejemplos y vídeo: https://huggingface.co/akhaliq/MOSS-Image-SFT-4-steps/tree/main/showcase
- ML Intern: https://hf.co/chat?mode=ml-intern
