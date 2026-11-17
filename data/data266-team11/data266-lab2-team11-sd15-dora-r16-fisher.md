# data266-team11/data266-lab2-team11-sd15-dora-r16-fisher

## Resumen

El modelo `data266-lab2-team11-sd15-dora-r16-fisher` es un adaptador DoRA (Weight-Decomposed Low-Rank Adaptation) de rango 16 desarrollado por el equipo 11 del curso DATA 266, diseñado para ajustar el UNet de Stable Diffusion 1.5 y generar imágenes en el estilo visual del dataset Naruto BLIP-captions. No se trata de un modelo de lenguaje, sino de un adaptador de difusión text-to-image: un conjunto de pesos de bajo rango que se acoplan al modelo base `stable-diffusion-v1-5/stable-diffusion-v1-5` para especializarlo en un dominio visual concreto (anime) sin reentrenar los pesos completos.

La relevancia técnica del artefacto reside en su metodología de entrenamiento: DoRA en lugar de LoRA estándar, selección de módulos diana mediante información de Fisher, ponderación Min-SNR-gamma, EMA 0.999 y un plan de dos etapas con decaimiento coseno y noise offset en la segunda fase. Con solo 2.108.608 parámetros entrenables (0,2447 % del UNet) y 0,2492 GPU-horas en una NVIDIA A40, el adaptador reduce el KID frente a las imágenes de test de 0,15218 (modelo base) a 0,02528, lo que demuestra que un ajuste muy parametrizado y barato puede desplazar sustancialmente la distribución generada hacia el dominio objetivo.

El modelo está pensado para investigación y experimentación académica. La licencia CreativeML Open RAIL-M del adaptador se hereda de SD 1.5, pero el dataset de entrenamiento (CC-BY-NC-SA 4.0) contiene personajes con derechos de autor, por lo que el autor restringe explícitamente el uso a investigación no comercial. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 0,0 GB reportado (los pesos del adaptador son de pocos MB, coherente con el número de parámetros entrenables).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (LoRA descompuesto en magnitud y dirección) sobre el UNet de Stable Diffusion 1.5; el modelo base es un diffusion model latente con UNet y text encoder CLIP |
| Parametros totales | 2.108.608 parametros entrenables (0,2447 % del UNet); el modelo base SD 1.5 tiene ~860M en el UNet y ~123M en el text encoder |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo text-to-image); el text encoder CLIP de SD 1.5 admite 77 tokens por prompt |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors; el modelo base admite fp16, fp32 y cuantizaciones de la comunidad) |
| Idiomas soportados | No disponible; los prompts de entrenamiento son captions BLIP en inglés |
| Licencia | CreativeML Open RAIL-M (adaptador); uso restringido a investigación no comercial por la licencia del dataset (CC-BY-NC-SA 4.0) |
| Formato de pesos | safetensors (adaptador en formato PEFT, cargable con `PeftModel.from_pretrained`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el UNet de Stable Diffusion 1.5, un diffusion model latente que opera en el espacio latente de un VAE y condiciona la generación mediante embeddings de texto CLIP. La innovación respecto a un LoRA convencional es el uso de DoRA, que descompone cada matriz de pesos en un componente de magnitud y otro de dirección, aplicando la actualización de bajo rango solo sobre la dirección. Los módulos diana se seleccionaron mediante un criterio basado en información de Fisher ("fisher-gated"), con rango 16 y alpha 32.

El entrenamiento se realizó sobre `lambdalabs/naruto-blip-captions`: 1221 imágenes, sin corruptas ni duplicadas, divididas 90/10 con semilla 266 (1099 train / 122 test), recortes centrados a 512x512 y captions automáticos generados con BLIP. Se ejecutaron 2000 pasos de optimizador con batch 4 y acumulación 1, en dos etapas: pasos 1-1200 con LR pico 0,0002 y pasos 1201-2000 con LR pico 8e-05 y noise offset 0,05. Se aplicó decaimiento coseno con warm-up dentro de cada etapa, ponderación Min-SNR-gamma, caption dropout, EMA 0,999, autocast bf16 y semilla 266. Se reservaron 55 imágenes de entrenamiento para validación y se exportó el checkpoint del paso 1200 (pesos crudos, menor pérdida de validación: 0,06080). El pico de memoria GPU fue de 8,605 GB y el coste total de 0,2492 GPU-horas en una NVIDIA A40.

## Capacidades

- Generación de imágenes text-to-image en el estilo visual del dataset Naruto (paleta, trazos y composición propios del anime del corpus).
- Especialización de dominio sobre SD 1.5: el adaptador desplaza la distribución de salida hacia el dominio de entrenamiento, reduciendo el KID in-domain de 0,15218 a 0,02528.
- Condicionamiento por prompt de texto en inglés (captions BLIP), con control de fidelidad mediante `guidance_scale` y pasos de inferencia (la evaluación usa DPM-Solver++ a 30 pasos y CFG 7,5).
- Diversidad entre semillas preservada: LPIPS entre semillas de 0,7112 frente a 0,7068 del modelo base, es decir, no colapsa la variabilidad.
- Compatibilidad con el ecosistema PEFT/diffusers: se carga como adaptador sobre el UNet y se puede combinar con el pipeline estándar de `StableDiffusionPipeline`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modalidades de audio o vídeo: es exclusivamente un adaptador de difusión para imagen.

## Casos de uso

- Investigación académica sobre adaptación eficiente de modelos de difusión: el adaptador sirve como caso de estudio reproducible de DoRA frente a LoRA con selección de módulos por Fisher, con métricas KID, CLIP y LPIPS ya reportadas y un coste de 0,2492 GPU-horas.
- Generación de arte conceptual en estilo anime para prototipado: con prompts descriptivos en inglés y CFG 7,5 se obtienen imágenes coherentes con la paleta del corpus, útil para maquetas y pruebas de dirección de arte no comerciales.
- Experimentos de comparación de métodos de adaptación: al estar el checkpoint exportado en el paso 1200 con pérdida de validación mínima, se puede contrastar contra variantes LoRA del mismo equipo y medir el efecto de DoRA en KID y CLIP score.
- Docencia y laboratorios de difusión: el repositorio incluye el código de entrenamiento (`src/p2/train.py`) y una partición train/test con semilla fija, lo que facilita replicar el pipeline en cursos de machine learning.
- Estudio de memorización y seguridad en modelos generativos: el autor reporta una comprobación de memorización mediante imagen de entrenamiento más cercana en CLIP y un filtrado con el safety checker de Stable Diffusion, lo que permite analizar riesgos de reproducción de contenido del dataset.
- Evaluación de la degradación fuera de dominio: útil para medir cómo un adaptador de estilo pierde detalles del prompt o reinterpreta escenas en prompts ajenos al corpus, un caso práctico para investigar compositional generalization en difusión.

## Benchmarks y rendimiento

Evaluación del autor con 20 prompts fijos y semillas 0/1, DPM-Solver++ a 30 pasos y CFG 7,5:

| Metrica | Adaptador DoRA | Modelo base SD 1.5 |
|---|---|---|
| KID vs imágenes de test (prompts in-domain) | 0,02528 +/- 0,01194 | 0,15218 +/- 0,02259 |
| CLIP score (prompt-imagen) | 27,27 | 28,33 |
| Diversidad LPIPS entre semillas | 0,7112 | 0,7068 |

El autor advierte que el KID es ruidoso con solo 20 imágenes. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y estos no aplican a un modelo text-to-image.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa pocos MB; el pipeline completo de SD 1.5 en fp16 requiere aproximadamente 4-6 GB de VRAM, y el entrenamiento reportado alcanzó un pico de 8,605 GB en una NVIDIA A40.
- GPU recomendadas: NVIDIA A40 (usada en el entrenamiento), A100, H100 para entrenamiento o lotes grandes; RTX 4090, RTX 3090, RTX 4080 y RTX 3080 para inferencia cómoda.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB o más en fp16 (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB); en GPUs con menos VRAM puede requerir `enable_model_cpu_offload` o `enable_attention_slicing`.
- Opciones de despliegue: `diffusers` + `peft` (flujo oficial documentado en la model card), así como ComfyUI y Automatic1111/Forge mediante conversión del adaptador a su formato de LoRA.
- Latencia y throughput: no disponibles en la información proporcionada; el único dato de coste es el entrenamiento (0,2492 GPU-horas en A40).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros entrenables | Contexto / resolucion | Rendimiento | Licencia |
|---|---|---|---|---|---|
| data266-lab2-team11-sd15-dora-r16-fisher | DoRA sobre UNet SD 1.5 | 2.108.608 (0,2447 %) | 512x512, prompts CLIP de 77 tokens | KID 0,02528; CLIP 27,27 | CreativeML Open RAIL-M, solo investigación |
| LoRA estándar sobre SD 1.5 (variantes de la comunidad) | LoRA | Variable, típicamente rango 4-64 | 512x512 | No disponible en la información proporcionada | Variable según autor |
| Stable Diffusion 1.5 base | Diffusion model completo | ~860M UNet + ~123M text encoder | 512x512 | KID 0,15218; CLIP 28,33 | CreativeML Open RAIL-M |
| SDXL (modelo base) | Diffusion model completo, dos text encoders | ~2,6B UNet | 1024x1024 | No disponible en la información proporcionada | CreativeML Open RAIL-M |

La comparación con LoRA estándar y SDXL no puede cuantificarse con los datos disponibles; solo se dispone de la comparación directa frente a SD 1.5 base reportada por el autor.

## Limitaciones y advertencias

- Aprende el estilo y la paleta del dataset, no identidades de personajes: las captions BLIP son genéricas y el adaptador no reproduce personajes concretos de forma fiable.
- En prompts fuera de dominio puede perder detalles del prompt o reinterpretar la escena; en prompts composicionales con varios personajes el CLIP score cae por debajo del modelo base (modos de fallo documentados en el informe del laboratorio).
- Entrenado con aproximadamente 1k imágenes, por lo que poses y fondos se repiten y la variedad compositiva es limitada.
- El dataset contiene personajes con derechos de autor y su licencia es CC-BY-NC-SA 4.0: el adaptador queda restringido a investigación no comercial pese a que los pesos hereden CreativeML Open RAIL-M.
- Riesgo de memorización del corpus de entrenamiento; el autor reporta una comprobación mediante imagen de entrenamiento más cercana en CLIP, pero no se ofrecen cifras en la información disponible.
- Las salidas se filtraron con el safety checker de Stable Diffusion, pero no se documentan tasas de falsos positivos ni de contenido inseguro evadido.
- El KID reportado se calcula con solo 20 imágenes y el autor lo califica de ruidoso; no debe interpretarse como una estimación precisa de la calidad.
- Sin datos de sesgos demográficos ni de comportamiento multilingüe: los prompts de entrenamiento están en inglés y no hay evaluación en otros idiomas.
- Repositorio con 0 descargas y 0 likes; no hay validación externa independiente de las métricas reportadas.

## Enlaces

- Hugging Face: https://huggingface.co/data266-team11/data266-lab2-team11-sd15-dora-r16-fisher
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Código de entrenamiento: `src/p2/train.py` en el repositorio del equipo `data266-lab2-team11` (no se dispone de URL directa en la información proporcionada)
- Paper de DoRA: no disponible en la información proporcionada
- Paper de Min-SNR weighting: no disponible en la información proporcionada
- Informe del laboratorio con modos de fallo y comprobación de memorización: no disponible en la información proporcionada
