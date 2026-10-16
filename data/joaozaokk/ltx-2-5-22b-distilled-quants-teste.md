# JoaoZaokk/ltx-2.5-22b-distilled-quants-teste

## Resumen

`JoaoZaokk/ltx-2.5-22b-distilled-quants-teste` es un repositorio de cuantizaciones experimentales del modelo de generación de vídeo `Lightricks/LTX-2.5`, en su variante *distilled* de 22 000 millones de parámetros y arquitectura DiT (Diffusion Transformer). No es un modelo entrenado desde cero ni un ajuste fino: el autor ha convertido los pesos oficiales `ltx-2.5-22b-distilled-transformer-bf16` con los cuantizadores nativos de ComfyUI (`comfy/quant_ops.py`) y ha publicado siete variantes en formato safetensors con metadatos de cuantización por capa. El objetivo es reducir el peso en VRAM (de unos 44 GB teóricos en bf16 hasta 12,50 GB en la variante nvfp4) para poder ejecutar generación de vídeo en GPUs Blackwell dentro de ComfyUI.

El propio autor etiqueta el repositorio como banco de pruebas: "Somente para testes. Sem resultados conclusivos", advierte de que los archivos pueden borrarse o sustituirse en cualquier momento y prohíbe explícitamente su uso en producción. El repositorio tiene 0 descargas y 0 *likes* en el momento de la consulta, y sus 141,3 GB corresponden a la suma de las siete variantes publicadas más los archivos `.quant.json` con la receta de conversión de cada una.

Su relevancia es acotada pero concreta: documenta empíricamente cómo se comporta un transformer de difusión de 22B para vídeo+audio bajo cuantizaciones de 4, 6 y 8 bits en hardware Blackwell, incluyendo esquemas mixtos con asignación de precisión por grupo de capas (medida y heurística). Es material de referencia para quienes investigan cuantización de DiT de vídeo, no una distribución estable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) *distilled*; grupos de capas separados para conector, atención vídeo (`video_qkv`), salida (`video_to_out`), FFN (`video_ff0`, `video_ff2`) y una rama de audio (`audio`) |
| Parámetros totales | 22 000 millones (22B), según el nombre del repositorio y de los archivos |
| Parámetros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | nvfp4, mxfp8, fp8, w6a8, int8 y mezclas de los anteriores (`misto_medido`, `misto_heur`, `dados_w6_50`) |
| Idiomas soportados | no disponible |
| Licencia | ltx-2-community-license (idéntica a la del modelo base `Lightricks/LTX-2.5`) |
| Formato de pesos | safetensors con cuantización nativa de ComfyUI; el formato de cada capa se declara dentro del propio archivo (`_quantization_metadata` o tensor `<capa>.comfy_quant`); las capas sin marca permanecen en bf16 |

Variantes publicadas y tamaño en disco:

| Archivo | Tamaño | Receta |
|---|---|---|
| `ltx-2.5-22b-distilled-transformer_nvfp4.safetensors` | 12,50 GB | nvfp4 en todos los grupos |
| `ltx-2.5-22b-distilled-transformer_misto_medido.safetensors` | 14,93 GB | mezcla nvfp4 + mxfp8 |
| `ltx-2.5-22b-distilled-transformer_w6a8.safetensors` | 17,65 GB | w6a8 en todos los grupos |
| `ltx-2.5-22b-distilled-transformer_dados_w6_50.safetensors` | 19,20 GB | mezcla w6a8 + int8 |
| `ltx-2.5-22b-distilled-transformer_mxfp8.safetensors` | 22,12 GB | mxfp8 en todos los grupos |
| `ltx-2.5-22b-distilled-transformer_fp8cal.safetensors` | 23,50 GB | fp8 en vídeo y audio, conector sin cuantizar |
| `ltx-2.5-22b-distilled-transformer_misto_heur.safetensors` | 31,41 GB | mezcla nvfp4 + bf16 |

## Arquitectura y entrenamiento

La información disponible no describe el entrenamiento del modelo base: no se indica el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Lo único documentado es que `Lightricks/LTX-2.5` se distribuye en una variante *distilled* de 22B y que el transformador es de tipo DiT (Diffusion Transformer), es decir, un transformer que opera como red de denoising sobre latentes en lugar de un modelo autorregresivo de lenguaje.

La estructura de capas que revelan las recetas de cuantización permite deducir la topología del bloque: un `connector` (96 capas en las recetas uniformes), proyecciones de atención de vídeo `video_qkv` (288), proyección de salida `video_to_out` (96), dos proyecciones FFN `video_ff0` y `video_ff2` (48 cada una) y una rama de audio `audio` (864 capas), que es el grupo más numeroso del modelo. La presencia y el tamaño de esa rama de audio indican que el transformer procesa conjuntamente una modalidad de audio además del vídeo.

La innovación técnica de este repositorio no está en el modelo, sino en el procedimiento de cuantización: cada archivo se genera con los cuantizadores de ComfyUI y lleva adjunto un `.quant.json` que describe la receta, de modo que se puede reproducir la asignación de precisión por grupo de capas. Las recetas mixtas (`misto_medido`, `misto_heur`, `dados_w6_50`) asignan distinta precisión a subconjuntos de capas dentro de un mismo grupo —por ejemplo, en `dados_w6_50` el grupo `audio` se reparte entre 363 capas en w6a8 y 501 en int8, y `video_qkv` entre 215 en w6a8 y 73 en int8—, lo que constituye el objeto real del experimento.

## Capacidades

- Generación de vídeo: es la función principal del modelo base LTX-2.5, un DiT de difusión para síntesis de vídeo.
- Generación de audio: la topología incluye una rama `audio` con 864 capas en las recetas uniformes, lo que indica procesamiento de audio dentro del mismo transformer.
- Ejecución en ComfyUI: formato de pesos nativo de ComfyUI, con metadatos de cuantización embebidos y soporte de `comfy_kitchen`.
- Cuantización por capa: permite cargar modelos híbridos donde conviven bf16, nvfp4, mxfp8, fp8, w6a8 e int8 en un mismo archivo.
- Aceleración en hardware Blackwell: las variantes nvfp4 y mxfp8 se ejecutan de forma nativa en GPUs sm_120.
- *Tool calling* / *function calling*: no disponible (no es un modelo de lenguaje con interfaz de herramientas).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica a un modelo de difusión).
- Capacidades multilingües: no disponible; no se documenta el idioma de los prompts ni del texto de condicionamiento.
- Modo *thinking*, visión o audio de entrada: no disponible.

## Casos de uso

- Banco de pruebas de cuantización en local: cargar las siete variantes en ComfyUI sobre una RTX PRO 6000 Blackwell y medir la degradación visual de nvfp4 (12,50 GB) frente a fp8cal (23,50 GB) con el mismo *prompt* y la misma semilla, para determinar cuánta precisión se puede recortar sin artefactos visibles.
- Investigación sobre asignación de precisión por capa: usar las recetas `misto_medido` y `misto_heur` como punto de partida para estudiar qué grupos de capas (atención, FFN, audio) toleran 4 bits y cuáles exigen 8 o bf16.
- Validación de recetas reproducibles: el archivo `.quant.json` que acompaña a cada safetensors permite reconstruir la conversión exacta desde el bf16 oficial, útil para auditar resultados o replicar el experimento en otro hardware.
- Prototipado de *pipelines* de vídeo+audio: dentro de ComfyUI se puede montar un flujo que genere vídeo y audio en una sola pasada usando la variante w6a8 (17,65 GB), que deja margen de VRAM para el VAE y los codificadores de texto en una GPU de 48 o 96 GB.
- Pruebas de compatibilidad de *runtime*: verificar que la carga de metadatos `comfy_quant` funciona con distintas versiones de ComfyUI y de PyTorch (el autor ha validado torch 2.11 cu130) antes de fijar una versión en un entorno cerrado.
- Evaluación de coste por inferencia: comparar el tiempo por paso de muestreo entre mxfp8 y nvfp4 en la misma GPU para decidir qué receta usar en una futura distribución estable.
- Docencia y divulgación sobre cuantización de DiT: el repositorio ofrece un caso real y medible de cómo el tamaño en disco de un transformer de difusión de 22B baja de 44 GB teóricos en bf16 a 12,50 GB en 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente "Sem resultados conclusivos" y no incluye métricas de calidad (FVD, CLIP score, SSIM), ni de latencia, ni comparaciones numéricas entre variantes. Los únicos datos objetivos publicados son los tamaños de archivo, las recetas de cuantización y el entorno de prueba validado (NVIDIA RTX PRO 6000 Blackwell sm_120, ComfyUI master de octubre de 2026, comfy_kitchen, torch 2.11 cu130).

## Requisitos de hardware

- VRAM estimada según los pesos en disco (estimación a partir del tamaño del archivo, sin incluir activaciones, VAE ni codificadores de texto):
  - `nvfp4`: desde ~12,5 GB de pesos; ~16-20 GB de VRAM total recomendada.
  - `misto_medido`: ~15 GB de pesos; ~18-22 GB recomendada.
  - `w6a8`: ~17,65 GB de pesos; ~22-26 GB recomendada.
  - `dados_w6_50`: ~19,20 GB de pesos; ~24-28 GB recomendada.
  - `mxfp8`: ~22,12 GB de pesos; ~26-32 GB recomendada.
  - `fp8cal`: ~23,50 GB de pesos; ~28-34 GB recomendada.
  - `misto_heur`: ~31,41 GB de pesos; ~36-44 GB recomendada.
  - Referencia: los pesos oficiales en bf16 equivalen, por aritmética simple (22 000 M × 2 bytes), a unos 44 GB, antes de añadir activaciones.
- Restricción de arquitectura: NVFP4 y MXFP8 requieren GPU Blackwell (sm_120) para ejecutarse de forma nativa. FP8 requiere generaciones Ada o Hopper (sm_89 / sm_90). Las variantes con int8 o w6a8 tienen requisitos menos estrictos, pero no se documentan en la información disponible.
- GPU validadas: NVIDIA RTX PRO 6000 Blackwell (96 GB), único hardware mencionado por el autor.
- GPUs consumer: no hay confirmación de funcionamiento en RTX 4090, 5090 ni similares. Por tamaño de pesos, la variante nvfp4 (12,5 GB) podría caber en GPUs de 16-24 GB, pero requeriría Blackwell para el formato nvfp4 y no está verificada.
- Opciones de despliegue: ComfyUI con comfy_kitchen y PyTorch 2.11 cu130 es el único *runtime* documentado. No hay soporte declarado en vLLM, llama.cpp, Ollama ni TGI, que además no están orientados a modelos de difusión de vídeo.
- Latencia y *throughput*: no disponibles; el autor no publica tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato / tamaño | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `JoaoZaokk/ltx-2.5-22b-distilled-quants-teste` (este repo) | 22B | safetensors cuantizados, 7 variantes de 12,50 a 31,41 GB | no disponible | ltx-2-community-license | 0 descargas, marcado como solo para pruebas |
| `Lightricks/LTX-2.5` (base oficial) | 22B | safetensors bf16, ~44 GB (estimado) | no disponible | ltx-2-community-license | Modelo de referencia del que derivan todas las variantes |
| `JoaoZaokk/LTX-2.5-22B-distilled-W4A8-ConvRot` | 22B | safetensors cuantizado W4A8 | no disponible | no disponible en la búsqueda | Repositorio del mismo autor citado en índices de *workflows* de terceros; sin datos de rendimiento |

No hay datos de benchmarks comparativos entre estas variantes ni con otros modelos de generación de vídeo, por lo que la comparación se limita a parámetros, formato, licencia y disponibilidad. En cuanto a alternativas de otros desarrolladores para generación de vídeo, no se dispone de información en el material proporcionado.

## Limitaciones y advertencias

- Estado experimental declarado por el autor: "Somente para testes. Sem resultados conclusivos". Los archivos pueden eliminarse o reemplazarse en cualquier momento.
- No apto para producción: la propia *model card* lo prohíbe de forma explícita.
- Sin validación de la comunidad: 0 descargas y 0 *likes*; no hay informes independientes de calidad ni de estabilidad.
- Sin métricas de calidad: no se publican FVD, CLIP score ni comparaciones perceptuales entre recetas, por lo que se desconoce cuánta degradación introduce cada cuantización.
- Riesgo de artefactos: la cuantización a 4 bits (nvfp4) y a 6 bits (w6a8, `dados_w6_50`) puede producir degradación visual, inestabilidad temporal o artefactos en el audio. No cuantificada en la información disponible.
- Dependencia de hardware: nvfp4 y mxfp8 solo funcionan de forma nativa en Blackwell (sm_120); en GPUs anteriores pueden fallar o requerir *fallback*, que no está documentado.
- Dependencia de software: validado únicamente con una versión *master* de ComfyUI de octubre de 2026, comfy_kitchen y torch 2.11 cu130; otras combinaciones no están probadas.
- Licencia restrictiva: hereda la `ltx-2-community-license` del modelo original. Es una licencia "other" con condiciones específicas para uso comercial; debe leerse el archivo de licencia incluido antes de cualquier uso, también en el caso de los pesos cuantizados.
- Idiomas: no se documenta ningún idioma soportado para los *prompts*, por lo que no se puede garantizar un comportamiento correcto en castellano.
- Sesgos: no disponibles; no hay evaluación de sesgos publicada para este repositorio ni para las variantes cuantizadas.
- Alucinación: no aplica en el sentido de un modelo de lenguaje, pero sí existe riesgo de contenido inventado o incoherente en el vídeo generado, sin métricas que lo cuantifiquen.
- Trazabilidad: al ser una conversión de pesos de terceros, la integridad de los archivos frente al bf16 oficial no está verificada con sumas de comprobación publicadas.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/JoaoZaokk/ltx-2.5-22b-distilled-quants-teste
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia (enlace declarado por el autor): https://huggingface.co/Lightricks/LTX-2.5
- Repositorio relacionado del mismo autor con cuantización W4A8: `JoaoZaokk/LTX-2.5-22B-distilled-W4A8-ConvRot` (citado en https://fervorcreativeai.com/workflows/)
- Índice de modelos locales que menciona el repositorio W4A8: https://ki-preise.info/lokale-modelle.html
- ComfyUI (runtime requerido): no se proporciona enlace en la información disponible
