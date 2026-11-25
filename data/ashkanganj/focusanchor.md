# AshkanGanj/FocusAnchor

## Resumen

FocusAnchor es un modelo de estimación de profundidad métrica desarrollado por Ashkan Ganj, Hang Su y Tian Guo (cake-lab, Worcester Polytechnic Institute) que predice profundidad absoluta a partir de un focal stack y su imagen all-in-focus. El modelo aborda el problema de la profundidad sin escala que arrastran los modelos de profundidad monocular: en lugar de predecir profundidad relativa, ancla un prior de profundidad fundacional (Depth Anything V2 ViT-L congelado) a las señales de foco del stack, propagando la escala métrica desde las regiones con textura hacia las regiones donde las señales de foco son débiles.

Técnicamente es un modelo recurrente que lee un volumen de foco y refina la profundidad paso a paso; en cada iteración alinea la profundidad relativa del prior congelado con la estimación actual. El repositorio publica cinco checkpoints (variantes entrenadas en NYU Depth v2 y afinadas en DDFF12, más una variante "flex" que acepta entre 2 y 5 slices). Es relevante porque propone un enfoque zero-shot para profundidad métrica con datos de foco, un régimen poco cubierto por los modelos monóculares convencionales.

El modelo se distribuye únicamente como pesos PyTorch (`.ckpt`) con licencia GPL-3.0, un tamaño de repositorio de 0,5 GB y sin resultados de benchmarks publicados en la información disponible más allá de una referencia puntual a AbsRel ≈ 0,073 en ZEDD.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo recurrente sobre focal stack + prior Depth Anything V2 ViT-L congelado (no disponible el detalle completo de capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa focal stacks de 2 a 5 slices) |
| Tipos de cuantizacion | no disponible (pesos en bf16 durante inferencia) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | GPL-3.0 |
| Formato de pesos | `.ckpt` (PyTorch); requiere `depth_anything_v2_vitl.pth` externo bajo CC-BY-NC-4.0 |

## Arquitectura y entrenamiento

FocusAnchor combina dos componentes: un prior de profundidad monocular congelado (Depth Anything V2 ViT-L) y un módulo recurrente que procesa un volumen de foco construido a partir del focal stack y su imagen all-in-focus. En cada paso de refinamiento, el modelo alinea la profundidad relativa del prior con la estimación actual, transfiriendo la escala métrica desde las regiones texturadas hacia las zonas donde las señales de foco son ambiguas. La variante "flex" (`FocusAnchor-RS.ckpt`) se entrena con entre 2 y 5 slices, mientras que la variante base se entrena con cinco slices.

Los checkpoints publicados incluyen: `FocusAnchor.ckpt` (entrenado en NYU Depth v2 con cinco slices), `FocusAnchor-RS.ckpt` (flex, 2-5 slices), `FocusAnchor-NYU.ckpt` (variante in-domain NYU), `FocusAnchor-DDFF12.ckpt` (afinado en DDFF12) y `FocusAnchor-RS-DDFF12.ckpt` (flex afinado en DDFF12). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon RLHF/DPO (no aplicable en un modelo de visión). Los modelos NYU se entrenan sobre un stack renderizado, ya que NYU Depth v2 no incluye un focal stack real.

## Capacidades

- Estimación de profundidad métrica (absoluta, con escala) a partir de focal stacks con distancias de foco conocidas.
- Procesamiento de stacks de 2 a 5 slices en la variante flex; cinco slices en la variante base.
- Refinamiento iterativo de profundidad mediante alineación con un prior fundacional congelado.
- Transferencia de escala métrica desde regiones texturadas a regiones con señales de foco débiles.
- Inferencia en bf16.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la profundidad.

## Casos de uso

- Reconstrucción 3D y fotogrametría de precisión métrica: el modelo proporciona profundidad absoluta a partir de stacks de foco capturados con microscopios o cámaras de foco programable, adecuado para pipelines de reconstrucción que requieren escala real.
- Inspección industrial y metrología: en escenarios de control de calidad donde se capturan stacks de foco con distancias conocidas, FocusAnchor permite medir dimensiones reales sin calibración adicional por escena.
- Robótica y manipulación: la profundidad métrica es directamente utilizable para planificación de agarre y evitación de obstáculos cuando la cámara proporciona un focal stack.
- Microscopía y biología computacional: estimación de profundidad en muestras con poca textura, donde las señales de foco son débiles y el prior fundacional aporta la escala.
- Realce de profundidad en imágenes all-in-focus: generación de mapas de profundidad métricos para efectos de postproceso (desenfoque selectivo, refocus) en fotografía computacional.
- Investigación en depth-from-focus: el modelo sirve como baseline zero-shot para comparar métodos de profundidad métrica con datos de foco, dado que el código y los checkpoints están disponibles.

## Benchmarks y rendimiento

La información disponible solo incluye una referencia puntual: con `FocusAnchor.ckpt` y la configuración `test_ZEDD.yaml`, el modelo imprime un AbsRel de aproximadamente 0,073 en las escenas de validación de ZEDD (el cuarto decimal puede variar entre GPUs por la ejecución en bf16). No se han publicado tablas comparativas de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de profundidad.

| Benchmark | Resultado | Notas |
|---|---|---|
| ZEDD (validación) | AbsRel ≈ 0,073 | Con `FocusAnchor.ckpt` y `test_ZEDD.yaml`; variación en el 4.º decimal según GPU (bf16) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,5 GB de pesos, pero requiere además el ViT-L de Depth Anything V2 (tamaño no indicado en la información disponible). Se recomienda GPU con al menos 8-16 GB de VRAM como estimación conservadora para un ViT-L más el módulo recurrente, aunque este dato no está confirmado.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; un ViT-L en bf16 suele requerir GPUs de gama alta (RTX 3090/4090 o superior), pero no se especifica.
- Opciones de despliegue: el código oficial se ejecuta mediante `uv` (`uv sync --frozen`, `uv run python src/cli.py test ...`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Profundidad métrica | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FocusAnchor | Recurrente + prior fundacional | Sí (anclaje a foco) | Focal stack + all-in-focus | GPL-3.0 (prior CC-BY-NC-4.0) | Pesos en HF, código en GitHub |
| Depth Anything V2 ViT-L | Monocular fundacional | Relativa (métrica solo con fine-tuning) | Imagen única | CC-BY-NC-4.0 | Pesos en HF |
| Métodos depth-from-focus clásicos | No disponibles en detalle | Depende del método | Focal stack | Variable | Variable |

No se dispone de datos comparativos de rendimiento entre FocusAnchor y alternativas en la información proporcionada.

## Limitaciones y advertencias

- Requiere un focal stack con distancias de foco conocidas; no funciona con una sola imagen.
- Los modelos entrenados en NYU se entrenaron sobre un stack renderizado, ya que NYU Depth v2 no incluye un focal stack real; esto puede introducir un desajuste dominio-real.
- La licencia GPL-3.0 impone obligaciones de copyleft para uso comercial y distribución; además, el prior Depth Anything V2 ViT-L se distribuye bajo CC-BY-NC-4.0, lo que restringe el uso comercial del conjunto.
- Es necesario descargar por separado `depth_anything_v2_vitl.pth` y colocarlo en `checkpoints/`; el repositorio no incluye el prior.
- Riesgo de sesgos y alucinación: no disponible en la información proporcionada (no es un modelo generativo de texto).
- Limitaciones de idioma: no aplica (modelo de visión).
- La variación en el cuarto decimal del AbsRel entre GPUs por el uso de bf16 debe tenerse en cuenta en evaluaciones reproducibles.
- Se recomienda verificar las licencias de los datasets (NYU Depth v2, DDFF12, ZEDD) antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/AshkanGanj/FocusAnchor
- Paper (arXiv): https://arxiv.org/abs/2611.32970
- Código: https://github.com/cake-lab/FocusAnchor
- Página del proyecto: https://cake.wpi.edu/FocusAnchor-website/
- Prior Depth Anything V2 Large: https://huggingface.co/depth-anything/Depth-Anything-V2-Large
