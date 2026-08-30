# RiverRider/srt-cxr14-pooled-probe

## Resumen

`RiverRider/srt-cxr14-pooled-probe` es un artefacto de investigación para clasificación multietiqueta de radiografías de tórax sobre el conjunto ChestX-ray14. En lugar de fine-tunear un modelo, el autor (RiverRider) congela tres backbones multimodales generalistas —gemma4, aria y qwen3omni—, ninguno entrenado en radiología, y entrena una sonda lineal (linear probe) por backbone sobre las características extraídas de las 112.120 imágenes del dataset. Los logits de las tres sondas se promedian, lo que no añade ningún parámetro adicional al ensamblaje.

El resultado principal es una media de AUROC de 0.7774, que supera en +0.0124 a la mejor sonda individual (qwen3omni, 0.7650) y en +0.0323 al baseline de referencia (ResNet-50 fine-tuneado, 0.7451). El interés del modelo no es solo el rendimiento, sino la evidencia de que promediar sondas lineales sobre características congeladas de backbones diversos aporta información complementaria sin coste de capacidad. El checkpoint contiene únicamente las matrices de pesos, biases y estadísticas de normalización de cada sonda, por lo que es un artefacto ligero que requiere ejecutar los backbones por separado para obtener las características.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblaje de tres sondas lineales sobre características congeladas de backbones multimodales (gemma4, aria, qwen3omni) |
| Parametros totales | No disponible (el checkpoint solo contiene pesos de sondas; los backbones no se incluyen) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (clasificación de imágenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (archivo `pooled_probe.pt`, cargado con `torch.load`) |

## Arquitectura y entrenamiento

El modelo es un ensamblaje de sondas lineales. Cada backbone (gemma4, aria, qwen3omni) se utiliza congelado: se extraen sus representaciones de estado para todas las imágenes de ChestX-ray14 (86.524 de entrenamiento y 25.596 de test según la división oficial `test_list.txt`). Sobre esas características se entrena una regresión logística multietiqueta (14 hallazgos radiológicos) por backbone. Cada sonda se normaliza con la media y desviación estándar de las características de entrenamiento de su propio backbone, y esas estadísticas se guardan junto con los pesos para que la puntuación sea reproducible.

La inferencia consiste en obtener los logits de cada sonda sobre las características de su backbone y promediarlos. No hay fine-tuning de los backbones ni capas adicionales. El autor también experimenta con la concatenación de características, que obtiene 0.7627 de AUROC media, pero un control concatenando el mejor backbone consigo mismo da 0.7626, lo que sugiere que la mejora de la concatenación se debe a la anchura y no al contenido. El ensamblaje por promedio de logits, en cambio, sí muestra una ganancia significativa: el intervalo de confianza al 95% para la diferencia con la mejor sonda individual es [+0.0082, +0.0168], positivo en 1.000 de 1.000 remuestras bootstrap agrupadas por paciente.

## Capacidades

- Clasificación multietiqueta de 14 hallazgos radiológicos en radiografías de tórax (atelectasia, cardiomegalia, derrame pleural, etc.).
- Ensamblaje por promedio de logits de tres sondas lineales, sin parámetros adicionales.
- Las sondas son intercambiables entre backbones: un experimento de transporte muestra que una sonda entrenada en un backbone y evaluada en otro alcanza una AUROC media de 0.7511, superior a la nativa (0.7440) y con coste de transporte negativo (-0.0071).
- No es un modelo generativo: no genera texto, código ni imágenes.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de visión más allá de la clasificación de imágenes.

## Casos de uso

- Investigación en imagen médica: como baseline reproducible para clasificación de hallazgos en radiografías de tórax, comparable con el benchmark de Wang et al. 2017.
- Evaluación de representaciones congeladas: permite comparar la calidad de las características de distintos backbones multimodales sin fine-tuning, usando una sonda lineal estándar.
- Estudio de ensamblaje de modelos: el promedio de logits demuestra que combinar sondas de backbones diversos mejora la AUROC sin aumentar la capacidad, útil para diseñar estrategias de ensemble en dominios con datos limitados.
- Análisis de transferencia entre backbones: el experimento de transporte de sondas (mapeo ridge entre estados) puede servir para estudiar la alineación de representaciones entre modelos.
- Control de calidad en pipelines de extracción de características: el script de reproducción verifica que no haya solapamiento de pacientes entre train y test, lo que lo hace útil como referencia metodológica.
- Docencia en machine learning aplicado a salud: ejemplo didáctico de cómo un linear probe sobre características congeladas puede superar a un fine-tuning completo en un benchmark concreto.

## Benchmarks y rendimiento

La model card reporta la media de AUROC sobre la división oficial de test (25.596 imágenes). El baseline de referencia es Wang et al. 2017 (arXiv:1705.02315v5, Tabla 17), un ResNet-50 fine-tuneado de extremo a extremo, con 0.7451.

| Modelo | mean AUROC | Diferencia vs mejor single | Diferencia vs baseline |
|---|---:|---:|---:|
| gemma4 (sonda individual) | 0.7590 | -0.0060 | +0.0139 |
| aria (sonda individual) | 0.7080 | -0.0570 | -0.0371 |
| qwen3omni (sonda individual) | 0.7650 | +0.0000 | +0.0199 |
| **Promedio de logits de las tres sondas** | **0.7774** | **+0.0124** | **+0.0323** |
| Características concatenadas | 0.7627 | -0.0023 | +0.0176 |
| Control: mejor backbone concatenado consigo mismo | 0.7626 | -0.0024 | +0.0175 |

Además, el experimento de transporte de sondas entre backbones (mapeo ridge ajustado solo con filas de entrenamiento) da los siguientes resultados:

| Configuración | mean AUROC |
|---|---:|
| Nativa (cada backbone con su propia sonda) | 0.7440 |
| Control de auto-mapeo | 0.7450 |
| **Transportada entre backbones** | **0.7511** |
| Ciclo de ida y vuelta | 0.7426 |
| Suelo barajado | 0.5020 |

La significación estadística del ensamblaje se evaluó con bootstrap agrupado por paciente: la diferencia de +0.0124 tiene un IC del 95% de [+0.0082, +0.0168] y fue positiva en 1.000 de 1.000 remuestras.

## Requisitos de hardware

- El checkpoint de las sondas es minúsculo (una matriz de pesos, un bias y estadísticas de normalización por backbone), por lo que su carga y uso en memoria es despreciable.
- Sin embargo, la inferencia requiere ejecutar los tres backbones congelados (gemma4, aria, qwen3omni) para extraer las características de cada imagen. Estos son modelos multimodales de gran tamaño, por lo que se necesita una GPU con VRAM suficiente para alojar cada backbone de forma secuencial o simultánea.
- No se proporcionan datos de VRAM específica, latencia ni throughput. Como referencia orientativa, modelos del tamaño de gemma4 o qwen3omni suelen requerir al menos 24-48 GB de VRAM en precisión fp16 para inferencia, dependiendo de la variante.
- Opciones de despliegue: al ser un artefacto de investigación, no está pensado para producción. El código de reproducción está en el repositorio SRT (`scripts/cxr_probe_ensemble.py`). Para extraer características se puede usar cualquier framework que soporte los backbones (HuggingFace Transformers, vLLM, etc.), pero el ensamblaje final es un simple promedio de logits en PyTorch.

## Comparativa con modelos similares

| Modelo | Tipo | mean AUROC | Parámetros | Licencia |
|---|---|---|---|---|
| **srt-cxr14-pooled-probe** (este) | Ensamblaje de 3 sondas lineales sobre backbones congelados | 0.7774 | Solo sondas (mínimo) | MIT |
| RiverRider/srt-cxr14-linear-probe | Sonda lineal individual sobre gemma4 congelado | 0.7590 (según tabla) | Solo sonda | Apache-2.0 |
| Wang et al. 2017 (ResNet-50 fine-tuneado) | CNN fine-tuneada de extremo a extremo | 0.7451 | ~25M (ResNet-50) | No especificada |

La comparativa directa con otros modelos de clasificación de ChestX-ray14 no está disponible en la información proporcionada. El baseline de Wang et al. es el punto de referencia clásico, y este ensamblaje lo supera sin fine-tunear ningún backbone.

## Limitaciones y advertencias

- No es un dispositivo diagnóstico: no tiene validación clínica, evaluación prospectiva ni aprobación regulatoria. Es un artefacto de investigación.
- Las etiquetas de ChestX-ray14 fueron extraídas mediante minería de NLP de informes radiológicos, por lo que heredan el ruido y los errores de ese proceso.
- El modelo detecta hallazgos visibles en la imagen, no enfermedad temprana ni evolución longitudinal. No sirve para pronóstico.
- El ensamblaje solo incluye tres backbones. Un cuarto (Mistral Small 3.1) se perdió por un bug de truncado de archivos, según el autor, por lo que los resultados no reflejan el potencial completo del conjunto de backbones previsto.
- La concatenación de características no mejora el rendimiento (efecto de anchura, no de contenido), lo que limita su uso como estrategia de fusión en este contexto.
- El transporte de sondas entre backbones funciona en promedio, pero no se garantiza para todos los pares de modelos ni para otros dominios.
- El checkpoint requiere las estadísticas de normalización de cada backbone para ser reproducible; sin ellas, la puntuación no es válida.
- No hay información sobre sesgos demográficos o de equipos de adquisición de imágenes; el dataset original tiene limitaciones conocidas de distribución de población.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RiverRider/srt-cxr14-pooled-probe
- Modelo hermano (sonda individual sobre gemma4): https://huggingface.co/RiverRider/srt-cxr14-linear-probe
- Repositorio SRT (scripts de reproducción): https://github.com/space-bacon/SRT (paper en `arxiv/paper.md`)
- Paper original de ChestX-ray14: Wang et al. 2017, arXiv:1705.02315 (https://arxiv.org/abs/1705.02315)
