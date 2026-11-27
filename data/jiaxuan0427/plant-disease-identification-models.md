# jiaxuan0427/plant-disease-identification-models

## Resumen

LeafLens es un sistema de clasificación de enfermedades en plantas que combina un backbone DINOv2-Base (ViT-B/14) afinado para identificar el tipo de cultivo con un checkpoint de enfermedad entrenado durante 30 épocas mediante entropía cruzada (CE) y SupCon ponderado por pares entre cultivos (*cross-crop weighted SupCon*). El autor, jiaxuan0427, lo publica como un repositorio de modelos orientado a una demo local construida con Streamlit, no como un modelo de lenguaje ni un modelo fundacional generalista.

El sistema resuelve un problema concreto de visión por computador: dado un cultivo y una imagen de hoja, devolver el par cultivo-enfermedad más probable, con una penalización de 12 aplicada a los pares ya vistos en entrenamiento, una lista corta calibrada y una galería de imágenes relacionadas extraídas de los metadatos de entrenamiento. El repositorio incluye los artefactos del clasificador de cultivo (`artifacts/dinov2_vitb14_finetune/crop/`) y la ruta externa del checkpoint de enfermedad, además de la aplicación web que los orquesta.

Es relevante ahora porque ejemplifica el patrón de reutilización de un backbone de visión autosupervisado (DINOv2) con cabezas específicas de dominio y una capa de calibración/penalización para mitigar el sesgo hacia clases sobrerrepresentadas en el conjunto de entrenamiento, un problema habitual en datasets agrícolas de imágenes de hojas. No obstante, la información publicada es muy escasa: no hay datos de arquitectura de la cabeza de clasificación, número de parámetros, licencia, idiomas ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2-Base (ViT-B/14) como backbone de visión, con cabeza de clasificación de cultivo y cabeza de clasificación de enfermedad |
| Parametros totales | no disponible (el backbone DINOv2-B/14 ronda los 86 M, pero el total del sistema no se especifica) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la demo está en inglés) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch (`.pth`); el backbone DINOv2 se carga desde la caché de Torch Hub |

## Arquitectura y entrenamiento

La arquitectura se apoya en DINOv2-Base con parche 14 (ViT-B/14), un transformer de visión preentrenado de forma autosupervisada, sobre el que se han añadido dos cabezas: una para clasificar el tipo de cultivo y otra para clasificar la enfermedad. El checkpoint de enfermedad corresponde a la época 30 de un entrenamiento que combina entropía cruzada con SupCon ponderado por pares entre cultivos (*cross-crop weighted SupCon*), una variante de aprendizaje contrastivo supervisado que busca separar representaciones de enfermedades similares entre cultivos distintos. El nombre del artefacto (`lambda_0p9_tau_0p10_crosscrop_2x_seed42_30ep`) sugiere un peso de 0,9 para el término contrastivo, una temperatura de 0,10, un factor 2x en el muestreo entre cultivos y semilla 42, aunque estos valores no están documentados formalmente en la model card.

El pipeline de inferencia aplica primero el clasificador de cultivo, luego el de enfermedad y finalmente una penalización de 12 sobre los pares cultivo-enfermedad que aparecen en el conjunto de entrenamiento, seguida de una calibración que produce una lista corta de candidatos. La demo muestra el par antes y después de aplicar dicha penalización, junto con imágenes relacionadas extraídas de los metadatos de entrenamiento. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset (más allá de la referencia a `DPD_Small_dataset/`), ni si se aplicaron técnicas de aumento de datos, destilación o ajuste fino adicional.

## Capacidades

- Clasificación de tipo de cultivo a partir de una imagen de hoja, usando el backbone DINOv2-B/14 afinado.
- Clasificación de enfermedad por cultivo, con un checkpoint entrenado 30 épocas con CE + SupCon cross-crop.
- Ranking de pares cultivo-enfermedad con penalización de 12 sobre pares vistos en entrenamiento.
- Generación de una lista corta calibrada de candidatos con sus puntuaciones.
- Recuperación de imágenes relacionadas desde los metadatos de entrenamiento (galería).
- Ejecución local vía Streamlit, con selección automática de dispositivo (CPU o CUDA) y posibilidad de forzar `cpu` o `cuda`.
- Soporte para apuntar a checkpoints y directorios de imágenes alternativos mediante variables de entorno (`PLANT_CROP_CHECKPOINT`, `PLANT_DISEASE_CHECKPOINT`, `PLANT_DINOV2_REPO`, `PLANT_MODEL_DEVICE`, `PLANT_TRAINING_IMAGE_DIR`).
- No soporta tool calling, agentes, razonamiento multi-paso, ni generación de texto: es un sistema de visión cerrado a clasificación.

## Casos de uso

- **Diagnóstico asistido en campo**: un técnico agrícola fotografía una hoja y el sistema devuelve el par cultivo-enfermedad más probable junto con una lista corta calibrada, útil para priorizar una inspección visual posterior. La penalización de 12 sobre pares vistos en entrenamiento reduce el sesgo hacia clases sobrerrepresentadas.
- **Triaje en aplicación móvil o web**: la demo Streamlit puede adaptarse a un servicio interno que reciba imágenes y devuelva el top-k de enfermedades, aprovechando que el modelo corre en CPU o CUDA según disponibilidad.
- **Etiquetado asistido de datasets agrícolas**: la lista corta calibrada y la galería de imágenes relacionadas permiten a anotadores confirmar o corregir etiquetas de forma más rápida que partiendo de cero.
- **Monitorización de cultivos en invernadero**: integrado en un pipeline de captura periódica, el clasificador de cultivo permite enrutar cada imagen al modelo de enfermedad correspondiente antes de aplicar la penalización.
- **Investigación en aprendizaje contrastivo aplicado**: el checkpoint con SupCon cross-crop sirve como referencia para experimentos sobre separación de clases visualmente similares entre dominios (distintos cultivos con síntomas parecidos).
- **Validación de modelos de visión en dominios especializados**: útil como línea base para comparar backbones (DINOv2 frente a ResNet, EfficientNet o CLIP) en tareas de fitopatología con datasets pequeños.
- **Demostración docente**: la app muestra de forma explícita el efecto de la penalización y de la calibración sobre el ranking, lo que la hace útil para explicar el impacto de estos mecanismos en sistemas de clasificación reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. Como referencia, un ViT-B/14 en FP16 ocupa aproximadamente 170 MB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer; el consumo real depende del tamaño de lote y de las cabezas añadidas.
- **GPU recomendadas**: no especificadas por el autor. Por el tamaño del backbone, una RTX 3060, RTX 4060 o superior es suficiente; A100/H100 no son necesarias para inferencia.
- **CPU**: la demo permite forzar `PLANT_MODEL_DEVICE=cpu`, por lo que es viable en portátiles sin GPU, con mayor latencia.
- **Opciones de despliegue**: Streamlit (proporcionado por el autor), PyTorch nativo y Torch Hub para la carga del backbone DINOv2. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput**: no disponibles. El repositorio ocupa 0,7 GB, lo que incluye pesos y artefactos de la demo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeafLens (jiaxuan0427) | ViT-B/14 + cabezas de clasificación | no disponible (backbone ~86 M) | no aplica | no disponible | Hugging Face, repo de 0,7 GB |
| DINOv2-Base (Meta) | ViT-B/14 autosupervisado | ~86 M | no aplica | Apache 2.0 (según la ficha oficial de DINOv2) | Hugging Face / Torch Hub |
| PlantVillage + CNN clásica | CNN supervisada | variable | no aplica | variable según implementación | Múltiples repositorios |
| CLIP ViT-B/32 | ViT contrastivo imagen-texto | ~88 M | 77 tokens de texto | MIT (según la ficha oficial de CLIP) | Hugging Face |

La comparación es aproximada: LeafLens no publica métricas propias, por lo que no es posible contrastar su precisión frente a DINOv2 sin ajuste fino, frente a clasificadores CNN entrenados en PlantVillage ni frente a CLIP. La ventaja diferencial declarada es el uso de SupCon cross-crop y la penalización de pares vistos en entrenamiento, no un mayor tamaño de modelo.

## Limitaciones y advertencias

- **Información muy incompleta**: no se publican licencia, número de parámetros, composición del dataset, métricas de validación ni limitaciones conocidas. Esto impide evaluar su idoneidad para producción.
- **Licencia no especificada**: sin licencia explícita, el uso comercial es jurídicamente incierto; conviene contactar con el autor antes de integrarlo en un producto.
- **Riesgo de sesgo por cultivo y enfermedad**: el dataset (`DPD_Small_dataset/`) no está descrito; la penalización de 12 sobre pares vistos sugiere un desequilibrio de clases que puede trasladarse a falsos negativos en cultivos poco representados.
- **Riesgo de alucinación en sentido amplio**: el sistema siempre devuelve un par cultivo-enfermedad con una puntuación, incluso ante imágenes fuera de distribución (hojas sanas, otras especies, imágenes borrosas); no se documenta ningún mecanismo de rechazo o abstención.
- **Alcance limitado**: no es un modelo de lenguaje, no genera explicaciones, no soporta tool calling ni agentes, y no procesa texto.
- **Dependencia de rutas locales**: la demo apunta por defecto a una ruta absoluta de Windows (`D:/AML/lambda_0p9_tau_0p10_crosscrop_2x_seed42_30ep/disease_final_epoch.pth`), lo que requiere reconfiguración mediante variables de entorno en otros sistemas.
- **Estado del repositorio**: creado y actualizado el mismo día (27 de noviembre de 2026), con 0 descargas y 0 likes; no hay evidencia de mantenimiento ni de validación por terceros.
- **Idioma**: la interfaz y la documentación están en inglés; no se declaran idiomas soportados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jiaxuan0427/plant-disease-identification-models
- DINOv2 (backbone base, Meta AI): https://github.com/facebookresearch/dinov2
- DINOv2 en Hugging Face: https://huggingface.co/facebook/dinov2-base
- Documentación de Streamlit: https://docs.streamlit.io
- No se han encontrado en la información proporcionada papers, blogs, demos públicas ni repositorios adicionales del autor.
