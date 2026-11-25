# DipanBartaula/SurgWorld-checkpoints

## Resumen

SurgWorld-checkpoints es un repositorio de pesos de investigación publicado por DipanBartaula que recopila el último checkpoint de cada ejecución de entrenamiento finalizada del estudio de modelos del mundo (world models) aplicados a vídeo quirúrgico. No se trata de un modelo único, sino de una colección de 18 checkpoints organizados en cinco familias (LAM, LeWorldModel, V-JEPA 2.1, GeoWorld y ProWorld) entrenados sobre los conjuntos de datos SurgToolLoc y PitVis. El repositorio ocupa 32,8 GB en 52 archivos y se distribuye en formato PyTorch y safetensors.

El interés del proyecto reside en su enfoque: aplicar arquitecturas de modelos del mundo y representaciones latentes de acción (latent action models) al dominio quirúrgico, incluyendo variantes con geometría hiperbólica (Lorentz) frente a controles euclídeos, y predictores tipo JEPA con características de V-JEPA 2. El autor advierte explícitamente de que los resultados de planificación de GeoWorld están cerca del azar y de que ProWorld tiny no muestra organización de conos, por lo que debe considerarse material de investigación sin validar.

Los tamaños de los modelos abarcan desde 18,0 M de parámetros (ProWorld tiny) hasta aproximadamente 400 M (LeWorldModel 400m con ViT-L y predictor AdaLN, y V-JEPA 2.1 de 400 M). No se dispone de información sobre longitud de contexto, idiomas soportados ni licencia concreta más allá de la etiqueta "other".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Varias: LAM (VQ discreto), LeWorldModel (ViT-B, ViT-L/12, ViT-L + AdaLN), V-JEPA 2.1-style, GeoWorld (H-JEPA con geometría hiperbólica o euclídea), ProWorld tiny (Lorentz o euclídeo) |
| Parametros totales | Desde 18,0 M (ProWorld tiny) hasta ~400 M (LeWorldModel 400m, V-JEPA 2.1 400m) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vídeo, no de lenguaje) |
| Licencia | other |
| Formato de pesos | safetensors, .pt, .pth.tar (los .pt/.pth.tar incluyen estado completo de entrenamiento) |

## Arquitectura y entrenamiento

La colección agrupa cinco familias de arquitecturas orientadas a modelado del mundo sobre vídeo quirúrgico. La familia LAM emplea un modelo de acción latente discreto con cuantización vectorial (VQ) de 16 códigos, entrenado 200 épocas sobre SurgToolLoc en 2 A100. LeWorldModel se instancia en tres tamaños (150m con ViT-B, 250m con ViT-L/12 y 400m con ViT-L más predictor AdaLN), entrenados desde cero con latentes SurgTransfer-LAM como acciones, sobre SurgToolLoc (5 épocas) y PitVis_g24 (30 épocas) en 2 L40S. V-JEPA 2.1-style se entrena desde cero en versiones de 150m y 400m sobre SurgToolLoc-train más PitVis 01-20 durante 200 épocas en 2 L40S.

GeoWorld implementa un predictor H-JEPA para planificación de procedimientos sobre PitVis usando características de V-JEPA 2 (o V-JEPA 2.1 quirúrgicas), con variantes hiperbólica y euclídea, cada una con una etapa supervisada (sft) y una etapa de RL geométrico (grl, final), entrenadas en 1 A100. ProWorld tiny (18,0 M) se entrena sobre SurgToolLoc y PitVis_g24 con acciones LAM, en variantes Lorentz (completa) y euclídea de control, en 1 A100. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada de los datasets ni si se aplicaron técnicas de RLHF/DPO; las etapas de RL geométrico de GeoWorld son lo más cercano a un ajuste por refuerzo.

## Capacidades

- Modelado predictivo del mundo en vídeo quirúrgico: predicción de estados latentes futuros a partir de observaciones y acciones latentes.
- Representación de acciones latentes discretas mediante VQ (16 códigos) en la familia LAM.
- Codificación visual auto-supervisada tipo JEPA (V-JEPA 2.1-style) sobre vídeo quirúrgico.
- Planificación de procedimientos en PitVis con GeoWorld (etapas supervisada y de RL geométrico).
- Modelado con geometría hiperbólica (Lorentz) frente a controles euclídeos en GeoWorld y ProWorld.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación en modelos del mundo para vídeo quirúrgico: usar los checkpoints LeWorldModel y V-JEPA 2.1-style como línea base para experimentos de predicción latente en cirugía, comparando tamaños de 150 M a 400 M.
- Estudio de representaciones de acción latente: emplear el LAM SurgWM discreto (VQ, 16 códigos) para analizar cómo se discretizan las transiciones quirúrgicas en SurgToolLoc.
- Planificación de procedimientos: evaluar GeoWorld sobre PitVis para reproducir los experimentos de planificación, teniendo en cuenta la advertencia del autor de que los resultados están cerca del azar.
- Comparación de geometrías de representación: contrastar las variantes hiperbólica (Lorentz) y euclídea de GeoWorld y ProWorld tiny para estudiar el efecto de la geometría en la organización latente.
- Reproducibilidad de experimentos: los archivos .pt/.pth.tar incluyen estado completo de entrenamiento reanudable, lo que permite retomar ejecuciones con los mismos hiperparámetros e identificadores de trabajos Slurm documentados en el repositorio de código.
- Análisis de transferencia entre datasets: comparar los checkpoints entrenados en SurgToolLoc frente a PitVis_g24 dentro de cada familia para estudiar la generalización entre dominios quirúrgicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que los resultados de planificación de GeoWorld están cerca del azar y que ProWorld tiny no muestra organización de conos, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por tamaño de pesos, ProWorld tiny (0,22 GB) y LeWorldModel 150m (0,61 GB) son ligeros, mientras que GeoWorld (7,32 GB por checkpoint) y V-JEPA 2.1 400m (6,18 GB) requieren más memoria.
- GPU empleadas en entrenamiento según la model card: A100 (LAM, GeoWorld, ProWorld) y L40S (LeWorldModel, V-JEPA 2.1).
- Cabe en GPU de consumo: los checkpoints de menor tamaño (ProWorld tiny, LeWorldModel 150m/250m, V-JEPA 2.1 150m) son plausibles en GPUs de consumo con VRAM suficiente; no se confirma en la información disponible.
- Opciones de despliegue: no disponible (no se documentan vLLM, llama.cpp, Ollama ni TGI; son pesos de investigación en PyTorch/safetensors).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SurgWorld-checkpoints (esta ficha) | 18 M – ~400 M | no disponible | Vídeo quirúrgico | other | Hugging Face |
| V-JEPA 2.1 (Meta) | no disponible | no disponible | Vídeo general | no disponible | Checkpoints citados como entrada, no redistribuidos aquí |
| SurgTransfer LAM y dynamics | no disponible | no disponible | Vídeo quirúrgico | no disponible | Pesos de terceros, no redistribuidos aquí |
| Wan2.2-TI2V-5B | 5 B | no disponible | Vídeo generativo | no disponible | Citado como entrada, no redistribuido aquí |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Los checkpoints son material de investigación, no modelos validados; el autor lo advierte de forma explícita.
- Los resultados de planificación de GeoWorld están cerca del azar según la model card.
- ProWorld tiny no muestra organización de conos, lo que limita su utilidad como modelo del mundo.
- Entrenados sobre SurgToolLoc y PitVis; se aplican las licencias de los datasets y no se incluyen datos.
- La licencia es "other": no se detallan los términos de uso comercial, por lo que debe consultarse antes de cualquier uso en producción.
- No se redistribuyen pesos de terceros (SurgTransfer, V-JEPA 2.1 de Meta, Wan2.2-TI2V-5B), lo que puede dificultar la reproducción completa.
- No hay información sobre sesgos, riesgo de alucinación, idiomas ni límites de contexto; al ser modelos de vídeo, estas categorías no aplican del mismo modo.
- Algunos archivos (.pt/.pth.tar) contienen estado completo de entrenamiento, no solo pesos, lo que aumenta el tamaño y requiere manejo específico.

## Enlaces

- Hugging Face: https://huggingface.co/DipanBartaula/SurgWorld-checkpoints
- Repositorio de código: `SurgworldAction` (privado, citado en la model card; no se proporciona URL pública)
- Proyecto de wandb: `Surgical_World_Model` (citado en la model card; no se proporciona URL)
- No se han encontrado otros enlaces (papers, blogs, demos) en la información disponible.
