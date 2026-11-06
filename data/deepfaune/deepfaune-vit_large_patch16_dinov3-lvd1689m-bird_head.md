# DeepFaune/deepfaune-vit_large_patch16_dinov3.lvd1689m-bird_head

## Resumen

DeepFaune es una iniciativa de investigación del CNRS (Centre national de la recherche scientifique) francesa que desarrolla modelos de visión por computador para la clasificación automática de especies animales en imágenes y vídeos de cámaras trampa. Este repositorio concreto, `deepfaune-vit_large_patch16_dinov3.lvd1689m-bird_head`, es un ajuste fino (fine-tuning) de un modelo base DeepFaune sobre un modelo ViT-Large preentrenado con DINOv3, especializado en la cabeza de clasificación para aves (bird_head). El modelo base emplea la arquitectura Vision Transformer con parches de 16x16 y preentrenamiento DINOv3 sobre el conjunto LVD-1689M.

El modelo resuelve el problema del filtrado y clasificación automática de aves en grandes volúmenes de imágenes de fototrampeo, una tarea crítica para el seguimiento de biodiversidad, estudios ecológicos y proyectos de ciencia ciudadana. Se distribuye con licencia CC-BY-SA 4.0, lo que permite uso comercial con atribución y compartir bajo la misma licencia.

La información pública disponible es muy limitada: el repositorio tiene 0 GB de tamaño declarado, 0 descargas y 0 likes en el momento de la consulta, y la model card únicamente indica la autoría de la iniciativa DeepFaune y el modelo base. No se han publicado especificaciones detalladas de entrenamiento, parámetros ni benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Large, patch 16x16) con preentrenamiento DINOv3 |
| Parametros totales | no disponible (el nombre indica ViT-Large; el recuento exacto no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | CC-BY-SA 4.0 |
| Formato de pesos | no disponible (el tamaño del repo figura como 0.0 GB) |

## Arquitectura y entrenamiento

El modelo se basa en un Vision Transformer de escala Large con parches de 16x16 píxeles, preentrenado mediante el método DINOv3 sobre el conjunto de datos LVD-1689M (1.689 millones de imágenes). Sobre esta base, el equipo de DeepFaune ha realizado un ajuste fino específico para la clasificación de aves, materializado en una cabeza de clasificación (`bird_head`) que se añade al extractor de características del ViT.

No se dispone de información sobre el volumen de datos de entrenamiento del ajuste fino, la composición del dataset de aves, el número de épocas, la función de pérdida ni si se emplearon técnicas de aumento de datos o regularización específicas. Tampoco se documentan innovaciones técnicas adicionales más allá del uso del preentrenamiento DINOv3, que aporta representaciones visuales autosupervisadas de alta calidad transferibles a tareas de clasificación fine-grained.

## Capacidades

- Clasificación de imágenes de cámaras trampa para la identificación de aves.
- Extracción de características visuales mediante el backbone ViT-Large preentrenado con DINOv3.
- Integración en el pipeline de software DeepFaune para el procesamiento por lotes de imágenes y vídeos de fototrampeo.
- Capacidad de actuar como cabeza especializada dentro de un sistema modular de clasificación de fauna (aves, mamíferos, etc.).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al tratarse de un modelo puramente visual.
- No se documentan capacidades de visión más allá de la clasificación de especies (sin detección, segmentación ni captioning explícitos en la información disponible).

## Casos de uso

- Seguimiento de biodiversidad aviar: procesamiento automático de grandes volúmenes de imágenes de cámaras trampa para inventariar especies de aves en estudios ecológicos, reduciendo el trabajo manual de revisión.
- Monitorización de reservas naturales: integración del modelo en el software DeepFaune para clasificar por lotes las capturas de una red de cámaras y generar informes de presencia de especies.
- Ciencia ciudadana: filtrado previo de imágenes aportadas por voluntarios para separar las que contienen aves y clasificarlas antes de la validación experta.
- Estudios de fenología y distribución: análisis de series temporales de imágenes para detectar cambios en la presencia estacional de aves en un hábitat concreto.
- Evaluación de impacto ambiental: caracterización de la avifauna en zonas de proyectos antes y después de intervenciones, usando clasificación automatizada como primer filtro.
- Investigación en ecología del movimiento: combinación con metadatos de fecha y hora de las cámaras para correlacionar avistamientos con variables ambientales.
- Docencia y formación: uso del modelo y del software DeepFaune en prácticas de ecología y teledetección para ilustrar pipelines de visión por computador aplicados a biodiversidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; para un ViT-Large típico se requiere habitualmente entre 1 y 4 GB en FP16, pero este dato no está confirmado para este modelo concreto.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio figura como 0.0 GB, lo que impide verificar los pesos.
- Opciones de despliegue: el modelo está pensado para integrarse en el software DeepFaune (documentación en deepfaune.pages.math.cnrs.fr); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepFaune ViT-Large DINOv3 bird_head | ViT-Large patch16 DINOv3 | no disponible | no aplica | CC-BY-SA 4.0 | Hugging Face (repo de 0.0 GB) |
| DeepFaune ViT-Large DINOv3 (modelo base) | ViT-Large patch16 DINOv3 | no disponible | no aplica | no disponible en la información | Hugging Face |
| Alternativas de clasificación de fauna en cámaras trampa | no disponible | no disponible | no aplica | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de clasificación de especies en fototrampeo.

## Limitaciones y advertencias

- La model card es extremadamente escueta: solo indica la autoría de DeepFaune y el modelo base, sin documentar datos de entrenamiento, métricas ni limitaciones.
- El repositorio figura con 0.0 GB de tamaño y 0 descargas, lo que sugiere que los pesos podrían no estar publicados o que el repositorio está incompleto; conviene verificar antes de usarlo en producción.
- Es un modelo especializado en aves (`bird_head`); no debe esperarse que clasifique correctamente mamíferos u otros taxones.
- Riesgo de sesgo hacia las especies y condiciones de captura representadas en el conjunto de entrenamiento (no documentado), con posible degradación en hábitats, cámaras o épocas del año poco representados.
- Riesgo de falsos positivos y confusiones entre especies visualmente similares; se recomienda validación humana en aplicaciones críticas.
- La licencia CC-BY-SA 4.0 permite uso comercial con atribución, pero obliga a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integración en productos propietarios.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.
- No hay información sobre calibración de confianza ni umbrales recomendados de decisión.

## Enlaces

- Hugging Face: https://huggingface.co/DeepFaune/deepfaune-vit_large_patch16_dinov3.lvd1689m-bird_head
- Modelo base: https://huggingface.co/DeepFaune/deepfaune-vit_large_patch16_dinov3.lvd1689m
- Documentación de DeepFaune: https://deepfaune.pages.math.cnrs.fr/software/
- Sitio oficial DeepFaune (FR): https://www.deepfaune.cnrs.fr/
- Sitio oficial DeepFaune (EN): https://www.deepfaune.cnrs.fr/en/
- DeepFaune en CNRS Sciences informatiques: https://www.ins2i.cnrs.fr/fr/deepfaune
- Artículo Universidad Savoie Mont Blanc sobre DeepFaune: https://www.univ-smb.fr/2025/05/27/deepfaune-lintelligence-artificielle-au-service-du-suivi-de-la-biodiversite/
