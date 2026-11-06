# frankzhang/Traumanet_ViT_DINOv3

## Resumen

TraumaNet DINOv3 ViT-Large es un modelo de clasificación de imágenes médicas desarrollado por el usuario frankzhang, que combina un backbone Vision Transformer DINOv3 (ViT-L/16) con una cabeza multi-tarea para detectar lesiones traumáticas a nivel de volumen en TC abdominal con contraste. El modelo resuelve un problema clínico concreto: la detección automatizada de lesiones en hígado, bazo, riñón, intestino y extravasación vascular, tareas derivadas del reto RSNA 2023 Abdominal Trauma Detection AI Challenge.

El modelo parte de pesos DINOv3 preentrenados específicamente sobre TC abdominal (no sobre imágenes naturales), lo que constituye un dominio de preentrenamiento inusual y relevante para la comunidad de imagen médica. Sobre ese backbone se aplica un ajuste fino supervisado para producir ocho probabilidades a nivel de volumen, agrupando cortes en bloques 2.5D de tres slices adyacentes.

La relevancia actual del modelo radica en su enfoque de empaquetado reproducible: el repositorio incluye tanto el checkpoint ajustado como el backbone base, y el código de carga valida nombres de tensores para evitar desajustes silenciosos entre pesos y código. Es un modelo de investigación, no validado como dispositivo médico, con licencia MIT y un tamaño de repositorio de 5.3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-L/16) con backbone DINOv3 y cabeza multi-tarea |
| Parametros totales | no disponible (checkpoint de inferencia de 1.36 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch `.pth`) |
| Idiomas soportados | no disponible (modelo de imagen médica, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pth` (checkpoint de inferencia y backbone base) |

## Arquitectura y entrenamiento

La arquitectura se basa en un Vision Transformer ViT-L/16 (parches de 16x16) preentrenado con DINOv3 sobre TC abdominal, según indica el autor en la model card. Sobre este backbone se añade una cabeza de clasificación multi-tarea que produce ocho salidas a nivel de volumen: `liver_injury`, `liver_high_risk`, `spleen_injury`, `spleen_high_risk`, `kidney_injury`, `kidney_high_risk`, `bowel` y `extravasation`. El pipeline de entrada agrupa tres cortes adyacentes por grupo (2.5D), generando 80 grupos por volumen tras remuestrear a D=240, H=512, W=512 con ventana de tejido blando (centro 40, ancho 350 HU).

No se detalla en la información proporcionada el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a un modelo de clasificación de imagen). El autor indica que el preentrenamiento DINOv3 se realizó sobre TC abdominal, lo que constituye una innovación destacable frente a los backbones preentrenados en imágenes naturales. El repositorio incluye el backbone base (343 tensores, 1.21 GB) y el checkpoint ajustado (1.36 GB), con un script `load.py` que valida cada nombre de tensor para garantizar la correspondencia entre pesos y código.

## Capacidades

- Clasificación de lesiones traumáticas a nivel de volumen en TC abdominal con contraste.
- Ocho salidas probabilísticas independientes: lesión y alto riesgo en hígado, bazo y riñón, además de afectación intestinal y extravasación.
- Agregación de etiqueta `any_injury` mediante el máximo de las ocho probabilidades.
- Procesamiento de volúmenes 3D mediante agrupación 2.5D de cortes adyacentes.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de capacidades multilingües ni de generación de texto.
- No realiza localización de lesiones (solo clasificación a nivel de volumen).
- No soporta visión general, audio ni modos de pensamiento.

## Casos de uso

- Triaje automatizado en urgencias: el modelo puede priorizar volúmenes de TC abdominal con alta probabilidad de lesión hepática o esplénica, permitiendo que los radiólogos revisen primero los casos de mayor riesgo según las probabilidades de `high_risk`.
- Segunda lectura en investigación clínica: integrado en estudios retrospectivos para detectar casos positivos en grandes cohortes de TC abdominal, gracias a su salida multi-etiqueta que cubre cinco órganos y extravasación.
- Selección de cohortes para ensayos: el modelo permite filtrar volúmenes con `any_injury` por encima de un umbral para construir conjuntos de casos con trauma abdominal confirmado.
- Control de calidad de pipelines de imagen médica: al validar la carga de tensores y requerir un preprocesado concreto (ventana 40/350 HU, remuestreo 240x512x512), sirve como referencia reproducible para verificar la cadena de preprocesado en proyectos de imagen médica.
- Investigación en preentrenamiento de dominio: el backbone DINOv3 preentrenado en TC abdominal puede reutilizarse como extractor de características para otras tareas de imagen médica abdominal, según el propio empaquetado del repositorio.
- Docencia y reproducción de resultados: el checkpoint y el código permiten reproducir los AUROC publicados sobre el conjunto de test interno de 630 volúmenes, útil para cursos de IA médica y validación de metodologías.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre conjunto de test interno de 630 volúmenes de TC, métrica AUROC:

| Tarea | AUROC |
|---|---:|
| liver_injury | 0.8308 |
| liver_high_risk | 0.9726 |
| spleen_injury | 0.8836 |
| spleen_high_risk | 0.9575 |
| kidney_injury | 0.9413 |
| kidney_high_risk | 0.9406 |
| bowel | 0.9371 |
| extravasation | 0.8682 |
| macro (8 tareas) | 0.9165 |
| any_injury | 0.8949 |
| macro (9 extremos) | 0.9141 |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint ajustado ocupa 1.36 GB en disco y el backbone base 1.21 GB, por lo que la inferencia en FP32 requiere varios GB de VRAM adicionales para activaciones de un ViT-L sobre volúmenes de 80 grupos de 3 cortes.
- GPU recomendadas: no especificadas por el autor; por el tamaño del backbone ViT-L y el procesamiento 3D por grupos, se requiere una GPU con memoria suficiente para lotes pequeños (no confirmado).
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: el autor proporciona scripts `inference.py` y `load.py` con PyTorch 2.10.0+cu128, MONAI 1.5.2, SimpleITK 2.5.3 y nibabel 5.3.3; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El autor no incluye comparaciones con otras arquitecturas de detección de trauma abdominal ni con variantes de DINOv3 de otros tamaños. Los resultados del reto RSNA 2023 no se detallan en la model card, por lo que no es posible establecer una comparación cuantitativa con las soluciones presentadas a dicho certamen.

## Limitaciones y advertencias

- Uso exclusivamente de investigación: no es un dispositivo médico ni está validado para toma de decisiones clínicas.
- No se distribuyen el dataset de trauma, las etiquetas ni datos de evaluación externa, lo que impide una validación independiente con los recursos del repositorio.
- Clasificación únicamente a nivel de volumen: no genera localización de lesiones ni mapas de calor.
- El rendimiento publicado corresponde a un test interno de 630 volúmenes; no hay evidencia de generalización a otros centros, escáneres o protocolos de adquisición.
- Requiere un preprocesado muy específico (ventana 40/350 HU, remuestreo a 240x512x512, agrupación 2.5D de 3 cortes); desviarse de este ajuste puede degradar el rendimiento de forma no cuantificada.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, con implicaciones clínicas si se usa fuera de investigación.
- Sesgos demográficos y de adquisición no evaluados en la información disponible.
- Licencia MIT permite uso comercial del código y pesos, pero la ausencia de validación clínica desaconseja cualquier uso en producción sanitaria.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frankzhang/Traumanet_ViT_DINOv3
- Código fuente anónimo: https://anonymous.4open.science/r/TraumaNet-F038/README.md
- Repositorio DINOv3 (upstream): https://github.com/facebookresearch/dinov3
- RSNA 2023 Abdominal Trauma Detection AI Challenge: https://www.rsna.org/rsnai/ai-image-challenge/abdominal-trauma-detection-ai-challenge
