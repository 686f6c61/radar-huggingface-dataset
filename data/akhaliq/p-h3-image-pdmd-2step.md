# akhaliq/p-h3-image-pdmd-2step

## Resumen

P-H3-Image pDMD 2-Step LoRA es un adaptador de destilación (LoRA) publicado por el usuario akhaliq que habilita un modo de generación texto-a-imagen en 2 pasos para el modelo base PrunaAI/P-H3-Image. Se trata de un merge del LoRA pDMD 2-NFE (arXiv 2609.35768), de rango 128 aplicado sobre las capas de atención y feed-forward de los 50 bloques del transformer de imagen, entregado como un único fichero safetensors listo para usar junto con una copia con nombres compatibles con ComfyUI.

El problema que resuelve es la latencia: el modelo base necesita típicamente 8 pasos de denoising con CFG para producir resultados coherentes, mientras que este adaptador permite obtener imágenes utilizables en 2 evaluaciones del transformer (y prácticamente indistinguibles del baseline a 4 pasos), sin necesidad de classifier-free guidance. El repo ocupa 6,1 GB y se distribuye bajo licencia Apache 2.0.

Es relevante ahora porque reduce el coste computacional de la inferencia de forma drástica (hasta 4× menos pasos que el baseline) manteniendo el mismo prompting y soportando resoluciones de hasta 8 MP, lo que lo hace atractivo para pipelines de generación de imágenes a gran escala y para despliegues en hardware consumer.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de destilación) sobre transformer de difusión texto-a-imagen; rank 128 sobre atención + FFN de los 50 bloques |
| Parámetros totales | no disponible (el adaptador se distribuye como fichero safetensors de 6,1 GB de repo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de texto) |
| Tipos de cuantización | bf16 (pesos del LoRA); el modelo base admite FP8 según la model card |
| Idiomas soportados | no disponible (prompts en lenguaje natural; no se especifican idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), con copia con nombres compatibles con ComfyUI |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 128 inyectado en las capas de atención y feed-forward de los 50 bloques del transformer de imagen del modelo base P-H3-Image. Proviene del release pDMD 2-NFE (arXiv 2609.35768) y se ha fusionado (merged) en el transformer de imagen, de modo que el resultado es un modelo de 2 pasos sin CFG. La model card indica que el fichero `lora_model_0.safetensors` es byte-idéntico al release upstream de pDMD.

La innovación técnica principal es la destilación a pocos pasos (few-step distillation) mediante pDMD: el modelo aprende a producir una imagen coherente en 2 evaluaciones del transformer en lugar de las 8 típicas del baseline con CFG. El merge es reutilizable a 3 y 4 pasos, donde a 4 pasos el resultado es prácticamente indistinguible del baseline de 8 pasos. La model card no detalla la composición del dataset de destilación ni si hubo RLHF/DPO (no aplica a un modelo de difusión de este tipo); esa información no está disponible.

## Capacidades

- Generación de imágenes texto-a-imagen en 2, 3 o 4 pasos de denoising, sin classifier-free guidance.
- Soporte de resoluciones de hasta 8 MP (los ejemplos se renderizan a 2912×2912).
- Modo de edición de imagen única (single-image edits) a 2/3/4 pasos, según el Space de demostración.
- Pase opcional de refinado de detalle mediante el refiner Open-H3-Regenerate-2K-IC (LoRA de rango 384, 312 lineales) que regenera a alta resolución manteniendo el borrador en el contexto del transformer como filas de referencia.
- Compatibilidad con flujos de ComfyUI mediante la copia con nombres de nodo incluidas.
- Mismo prompting que el modelo base (no requiere reentrenamiento de prompts).
- No dispone de tool calling, agentes ni capacidades multimodales de texto; es exclusivamente un modelo de imagen.

## Casos de uso

- Generación de imágenes a gran escala en producción: al requerir solo 2 pasos sin CFG, el coste por imagen se reduce aproximadamente a la cuarta parte respecto al baseline de 8 pasos, lo que abarata lotes masivos de ilustraciones o assets para catálogos.
- Iteración rápida en herramientas creativas: con ~2,9 s por imagen a 2912×2912 en RTX PRO 6000 o H200, encaja en interfaces de exploración de prompts donde el usuario necesita ver variaciones casi en tiempo real.
- Edición de imagen única: el modelo base admite edición y este adaptador la mantiene a 2/3/4 pasos, útil para retoques guiados por prompt sobre una imagen de referencia.
- Flujos de trabajo en ComfyUI: la copia con nombres de nodo permite integrar el LoRA en grafos existentes de ComfyUI sin renombrar tensores, adecuado para estudios que ya trabajan con ese ecosistema.
- Pipeline borrador + refinado: combinado con Open-H3-Regenerate-2K-IC, se generan borradores a 2 MP en 2 pasos y se refinan a alta resolución, útil para producción de material gráfico con control de calidad en dos fases.
- Generación de gráficos planos y texto rotulado: a 4 pasos el resultado se acerca al baseline, por lo que es la opción recomendada para carteles, stickers y composiciones con tipografía.
- Investigación en destilación de difusión: al ser byte-idéntico al release upstream de pDMD, sirve como referencia reproducible para comparar recetas de few-step distillation.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, etc.) en la información disponible. La model card ofrece únicamente evaluaciones cualitativas por número de pasos:

| Pasos | Veredicto (8 MP, shift 12) |
|---|---|
| 2 | Usable: nítido y coherente; la composición se desvía del baseline y los prompts gráficos pueden inventar pseudo-texto |
| 3 | Punto intermedio más seguro |
| 4 | Más cercano al baseline; recomendado para texto entrecomillado y gráficos planos |

Dato de rendimiento aportado: ~2,9 s por imagen a 2912×2912 con 2 pasos, shift 12, seed 3, usando el build slim FP8 + Triton fusionado en RTX PRO 6000 o H200.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo del adaptador ocupa 6,1 GB, pero el modelo base completo requiere memoria adicional según resolución y precisión (el build FP8 reduce el consumo).
- GPU recomendadas: RTX PRO 6000 y H200 son las empleadas para renderizar los ejemplos de la model card a 8 MP.
- GPU consumer: no se confirma compatibilidad con GPUs consumer en la información disponible; el uso a 8 MP con el build FP8 sugiere que tarjetas de gama alta con suficiente VRAM podrían ejecutarlo, pero no hay datos verificados.
- Opciones de despliegue: diffusers (librería declarada), ComfyUI (copia de pesos con nombres de nodo) y el Space de demostración akhaliq/p-h3-image-2step con build FP8 + Triton fusionado.
- Latencia y throughput: ~2,9 s por imagen a 2912×2912 y 2 pasos en RTX PRO 6000 o H200.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| akhaliq/p-h3-image-pdmd-2step | LoRA de destilación sobre P-H3-Image | 2 (usable), 4 (calidad baseline) | hasta 8 MP | Apache 2.0 | Hugging Face, ComfyUI, Space |
| PrunaAI/P-H3-Image (base) | Transformer de difusión texto-a-imagen | 8 con CFG | hasta 8 MP | no disponible en la información | Hugging Face |
| pdmd2026/pdmd_2NFE_lora (upstream) | LoRA pDMD 2-NFE | 2 | no disponible | no disponible en la información | Hugging Face |
| Open-H3-Regenerate-2K-IC | LoRA refiner in-context (rango 384) | 3 (grid up3, σ₀=0,835) | alta resolución (2K) | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- A 2 pasos la composición se desvía del baseline y los prompts gráficos pueden generar pseudo-texto inventado; para texto rotulado se recomienda 4 pasos.
- El adaptador está diseñado para el modelo base PrunaAI/P-H3-Image; no es un modelo autónomo y requiere cargar el transformer base.
- No se documentan sesgos conocidos ni evaluación de sesgos en la model card.
- Riesgo de alucinación visual: la generación de texto dentro de la imagen puede producir caracteres falsos, especialmente a 2 pasos.
- No se especifican idiomas soportados para los prompts.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base P-H3-Image, que no se detalla en la información disponible.
- El pase de refinado depende de un segundo modelo (Open-H3-Regenerate-2K-IC) y de una receta concreta (HyperFlow 8-step + LMS Sharp + merge del LoRA IC), lo que añade complejidad operativa y memoria.
- Los tiempos de ~2,9 s por imagen se han medido en GPUs de gama profesional (RTX PRO 6000, H200); el rendimiento en hardware inferior no está documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/akhaliq/p-h3-image-pdmd-2step
- Modelo base: https://huggingface.co/PrunaAI/P-H3-Image
- LoRA upstream pDMD 2-NFE: https://huggingface.co/pdmd2026/pdmd_2NFE_lora
- Paper pDMD: https://arxiv.org/abs/2609.35768
- Refiner Open-H3-Regenerate-2K-IC: https://huggingface.co/Efficient-Large-Model/Open-H3-Regenerate-2K-IC
- Space de demostración: https://huggingface.co/spaces/akhaliq/p-h3-image-2step
- Comparador A/B en ML Intern: https://hf.co/chat?mode=ml-intern&prompt=Compare%20akhaliq%2Fp-h3-image-pdmd-2step%20at%202%20steps%20against%20P-H3-Image%20baseline%20at%208%20steps%20on%20my%20prompts
