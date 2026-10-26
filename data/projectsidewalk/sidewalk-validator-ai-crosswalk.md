# projectsidewalk/sidewalk-validator-ai-crosswalk

## Resumen

sidewalk-validator-ai-crosswalk es un clasificador binario de imágenes desarrollado por el equipo de Project Sidewalk para validar automáticamente una de las etiquetas que los voluntarios de su plataforma de mapeo de accesibilidad introducen: los pasos de cebra (Crosswalk). Dado un recorte de imagen a pie de calle centrado en la etiqueta, el modelo predice si la etiqueta es correcta (la imagen muestra un paso de cebra) o incorrecta. Se trata de un ajuste fino de facebook/dinov2-large, un Vision Transformer de 304.372.738 parámetros, al que se le ha añadido una cabeza de clasificación de dos clases con etiquetas `id2label = {0: correct, 1: incorrect}`.

El problema que resuelve es concreto y operativo: Project Sidewalk recibe decenas de miles de etiquetas generadas por voluntarios y necesita un mecanismo de control de calidad que no dependa exclusivamente de revisión humana. Este modelo se integra en el servicio sidewalk-ai-api, que reconstruye el recorte desde el panorama y el punto de la etiqueta, ejecuta el modelo y consulta la confianza del veredicto en un mapa de precisión; la web solo registra un voto Agree/Disagree automático de la cuenta SidewalkAI cuando la precisión estimada es de al menos 0,92; en caso contrario el resultado se almacena como Unsure.

Su relevancia ahora es doble. Por un lado, es un ejemplo de cadena completa de validación de datos crowdsourced con modelos de visión de propósito general (DINOv2) ajustados a una tarea muy estrecha. Por otro, publica métricas separadas para ciudades vistas y ciudades retenidas, lo que permite evaluar de forma realista la generalización geográfica: 0,957 de accuracy en test (ciudades vistas) frente a 0,906 en test_heldout (ciudades no vistas). El modelo se distribuye con licencia MIT y formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (facebook/dinov2-large) con cabeza de clasificación lineal de dos clases |
| Parámetros totales | 304.372.738 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: modelo de imagen. Entrada fija de 224 × 224 píxeles tras preprocesado (redimensionado del lado corto a 256 y recorte central a 224) |
| Tipos de cuantización | No disponible. Solo se publican pesos en safetensors; no se documentan versiones GGUF, ONNX ni INT8 |
| Idiomas soportados | No aplica (modelo de visión sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | safetensors (con `config.json` y `preprocessor_config.json`; el repositorio ocupa 8,5 GB) |
| Tarea (pipeline) | image-classification (validación de etiquetas) |
| Clases de salida | 0 = correct, 1 = incorrect |
| Modelo base | facebook/dinov2-large (fine-tune) |
| Dataset de entrenamiento | projectsidewalk/sidewalk-validator-ai-dataset-crosswalk |
| Preprocesador | `BitImageProcessor`, cargado con `use_fast=False` para replicar la ruta PIL de la API |
| Checkpoint publicado | El de mejor macro-F1 en validación (0,959), `checkpoint-528` |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer DINOv2 en su variante large (304 M de parámetros) empleado como extractor de características congelado o ajustado, sobre el que se añade una cabeza de clasificación de dos clases. No hay innovaciones de decodificación ni atención lineal: el interés está en el pipeline de datos, no en la arquitectura. La entrada no es la imagen original del panorama, sino un recorte de 2048² píxeles renderizado en perspectiva con 90° de campo de visión centrado en la etiqueta, con corrección de inclinación de la cámara (pitch y roll, beta = 0,95) a partir del panorama reescalado a 8192 × 4096. Depth Anything V2 (métrica, VKITTI, ViT-B) estima la profundidad en el centro de la vista y la semianchura del recorte se fija en `6100 / depth_m` píxeles, recortada a la vista, con el lado largo reescalado a 640 px y almacenamiento en WebP de calidad 95.

El conjunto de datos procede de etiquetas validadas exclusivamente por votos humanos (los votos de IA se excluyen), con tamaños de split de 2.089 para entrenamiento, 448 para validación, 445 para test y 138 para test_heldout (Tucson, AZ y dos despliegues no públicos). La partición está agrupada por panorama (ningún panorama aparece en dos splits), estratificada por clase y con semilla fija. El entrenamiento usa Hugging Face `Trainer` con learning rate 1e-5, batch 8 con 4 pasos de acumulación de gradiente, 10 % de warm-up, 25 épocas y semilla 42, con aumentación de datos consistente en `RandomResizedCrop(224, scale=(0,7; 1,0))` y volteos horizontales; la validación usa el procesador oficial sin aumentación. No se documenta RLHF ni DPO (no aplica a una tarea de clasificación).

## Capacidades

- Clasificación binaria de imágenes: decide si un recorte centrado en una etiqueta Crosswalk muestra o no un paso de cebra.
- Salida de probabilidad por clase (logits con softmax), lo que permite aplicar umbrales de confianza y mapas de precisión.
- Validación automática de etiquetas procedentes de crowdsourcing dentro de un flujo con umbral mínimo de precisión estimada de 0,92.
- Funcionamiento sobre recortes derivados de panoramas de Google Street View con corrección de inclinación de la cámara.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, generación de texto, código, matemáticas, audio ni modo "thinking". Es exclusivamente un clasificador visual.
- No tiene capacidades multilingües: no procesa texto.
- Alcance limitado a la clase Crosswalk; otras clases de accesibilidad (Curb Ramps, Surface Problems, Obstacles) requieren modelos distintos dentro del mismo proyecto.

## Casos de uso

- Validación automática de nuevas etiquetas Crosswalk en Project Sidewalk: el servicio sidewalk-ai-api reconstruye el recorte a partir del panorama y del punto de la etiqueta, ejecuta el modelo y consulta la confianza en `confidence_precision_map.json`; la web registra el veredicto como voto Agree/Disagree de la cuenta SidewalkAI solo si la precisión estimada alcanza 0,92. Es el caso de uso primario y ya está en producción.
- Triaje de la cola de revisión humana: ordenar las etiquetas por confianza del modelo permite que los revisores humanos se concentren en los casos dudosos (confianza por debajo del umbral) y reducir el volumen de revisión manual de las etiquetas claras.
- Auditoría retrospectiva de calidad de etiquetas ya publicadas: ejecutar el modelo en lote sobre etiquetas históricas de una ciudad concreta para estimar la tasa de error y detectar zonas o contribuyentes con patrones sistemáticos.
- Control de calidad en pipelines de anotación de imágenes urbanas: usar el clasificador como filtro de admisión antes de que un recorte entre en un conjunto de datos de entrenamiento de otro modelo, evitando etiquetas ruidosas.
- Detección de deriva del pipeline de datos: al depender de forma crítica de la geometría del recorte (campo de visión, corrección de inclinación, escala basada en profundidad), comparar las predicciones antes y después de un cambio en `sidewalk-panorama-tools` o en el modelo de profundidad sirve como prueba de regresión de la cadena completa.
- Investigación en accesibilidad urbana y análisis geográfico: al puntuar etiquetas de múltiples despliegues, se puede comparar la calidad de la cartografía de pasos de cebra entre ciudades y priorizar campañas de mapeo donde la densidad o la calidad sea menor.
- Despliegue como microservicio de clasificación en una API REST: con 304 M de parámetros cabe en cualquier GPU de consumo y puede servirse con la pipeline de `transformers` o exportarse a ONNX Runtime para inferencia por lotes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`metrics.json`, `evaluate.py`) sobre el mejor checkpoint. El veredicto es el argmax con empates resueltos a favor de `correct`. Ninguna de las métricas está marcada como verificada (`verified: false`).

| Slice | n (correct / incorrect) | Accuracy | Balanced accuracy | AUC | Macro-F1 |
|---|---|---|---|---|---|
| test (ciudades vistas en entrenamiento) | 445 (247 / 198) | 0,957 | 0,954 | 0,980 | 0,957 |
| test_heldout (ciudades retenidas) | 138 (65 / 73) | 0,906 | 0,907 | 0,941 | 0,906 |
| hard (filas de test + test_heldout que el modelo desplegado falló) | 5 (4 / 1) | 0,600 | 0,750 | 0,750 | 0,583 |

Desglose por clase:

| Slice | Clase | Precisión | Recall | F1 | Soporte |
|---|---|---|---|---|---|
| test | correct | 0,942 | 0,984 | 0,962 | 247 |
| test | incorrect | 0,979 | 0,924 | 0,951 | 198 |
| test_heldout | correct | 0,882 | 0,923 | no disponible en el extracto | no disponible en el extracto |

El `model-index` de la model card declara, para el split de test, accuracy 0,9573, balanced accuracy 0,954, AUC 0,9799 y macro-F1 0,9565. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 304 M de parámetros, no dato del autor): en FP32, aproximadamente 1,2 GB de pesos; en FP16/BF16, unos 0,6 GB; en INT8, unos 0,3 GB. Con activaciones y lote pequeño, un presupuesto de 2-3 GB es suficiente.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4070, RTX 4090 e incluso GPUs con 4 GB de VRAM. También es viable en CPU para inferencia por lotes no crítica en latencia.
- GPU de centro de datos (A100, H100, L40S) no son necesarias para servir el modelo; resultan útiles solo para reentrenamiento o para procesar grandes volúmenes en paralelo.
- Opciones de despliegue: pipeline de `transformers` con `AutoImageProcessor(..., use_fast=False)` y `AutoModelForImageClassification`, tal como documenta la model card; exportación a ONNX Runtime o torch.compile para mejorar el rendimiento por lotes; servicio HTTP propio (por ejemplo FastAPI o TorchServe) siguiendo el patrón de sidewalk-ai-api; Triton Inference Server para despliegues multi-modelo. vLLM, llama.cpp, Ollama y TGI no están orientados a este tipo de modelo de clasificación de imagen y no se documentan como opciones soportadas.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de inferencia ni de imágenes por segundo.
- Requisito de integración importante: el servicio debe aplicar la misma corrección de inclinación (pitch y roll) que el pipeline de entrenamiento antes de invocar al modelo (referencia sidewalk-ai-api#17).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sidewalk-validator-ai-crosswalk | Clasificador binario fine-tuneado sobre DINOv2-large | 304.372.738 | Imagen 224 × 224 | MIT | Hugging Face, safetensors, 28 descargas |
| facebook/dinov2-large (modelo base) | Extractor de características visuales auto-supervisado | 304 M (misma arquitectura) | Imagen, resolución variable | No verificada en la información disponible | Hugging Face |
| RampNet (mencionado en la model card del proyecto) | Detección de elementos de accesibilidad en panoramas completos | No disponible | Panorama completo | No disponible | Repositorio del proyecto Project Sidewalk |
| Clasificador de visión genérico tipo CLIP ViT-L/14 en modo zero-shot | Clasificación abierta por similitud texto-imagen | No disponible en esta información | Imagen + prompt de texto | No disponible en esta información | Hugging Face |

La comparación cuantitativa de rendimiento frente a alternativas no está disponible: el autor solo publica métricas de este modelo. La diferencia funcional clave frente al modelo base es que DINOv2-large no produce etiquetas correct/incorrect sin una cabeza entrenada, y frente a RampNet es el alcance: RampNet busca elementos en panoramas completos, mientras que este modelo solo valida un recorte ya centrado en una etiqueta existente. Un clasificador zero-shot tipo CLIP no ofrece el mismo nivel de calibración por umbral de precisión que aquí se documenta (mapa de confianza-precisión con umbral 0,92).

## Limitaciones y advertencias

- Alcance muy restringido: solo valida etiquetas de tipo Crosswalk. No detecta elementos en panoramas completos ni cubre otras clases de accesibilidad.
- Dependencia estricta del pipeline de recorte: el modelo espera recortes construidos con el mismo procedimiento (panorama a 8192 × 4096, vista de 2048² con 90° de FOV centrada en la etiqueta, corrección de inclinación con beta = 0,95, semianchura `6100 / depth_m` según Depth Anything V2 métrico VKITTI ViT-B, lado largo a 640 px). Cualquier desviación en el renderizado, en el modelo de profundidad o en la corrección de inclinación degrada las predicciones.
- Caída de rendimiento fuera de las ciudades vistas: la accuracy baja de 0,957 a 0,906 y el AUC de 0,980 a 0,941 en el conjunto de ciudades retenidas. La generalización geográfica no es completa.
- El conjunto "hard" solo contiene 5 ejemplos (accuracy 0,600), por lo que esa cifra no es estadísticamente concluyente y no debería usarse para estimar el rendimiento en producción.
- Los datos de entrenamiento no están publicados de forma completa: la model card indica que el repositorio de dataset enlazado contiene una selección anterior y que la publicación del conjunto exacto, que incluye despliegues no públicos, es una decisión de política todavía abierta (issues #2 y #7). Esto limita la reproducibilidad.
- Sesgo geográfico probable: el conjunto incluye Tucson (AZ) y dos despliegues no públicos; no se documenta la distribución por país, tipo de vía, iluminación ni calidad de imagen.
- Métricas no verificadas: el `model-index` marca todas las métricas como `verified: false`; proceden del propio autor.
- Sin explicabilidad: el modelo devuelve una probabilidad por clase, sin mapas de atención ni justificación; un veredicto incorrecto no es diagnosticable a partir de la salida.
- Uso previsto acotado: la model card lo describe explícitamente como una entrada más para la calidad de las etiquetas, no como sustituto de la validación humana. El sistema solo emite un voto automático cuando la precisión estimada alcanza 0,92; por debajo se marca Unsure.
- Licencia MIT en este modelo, lo que permite uso comercial y modificación; no obstante, conviene verificar por separado los términos del modelo base facebook/dinov2-large y de las imágenes de Street View utilizadas, cuyas condiciones no se detallan en la información disponible.
- El repositorio ocupa 8,5 GB para un modelo de 304 M de parámetros, lo que sugiere la presencia de checkpoints intermedios u otros artefactos; conviene revisar los archivos antes de descargar en entornos con almacenamiento limitado.
- No apto para datos fuera de dominio: imágenes que no sean recortes centrados en etiquetas generados de la misma forma están explícitamente fuera de alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/projectsidewalk/sidewalk-validator-ai-crosswalk
- Dataset de entrenamiento: https://huggingface.co/datasets/projectsidewalk/sidewalk-validator-ai-dataset-crosswalk
- Repositorio de entrenamiento y evaluación: https://github.com/ProjectSidewalk/sidewalk-validator-ai
- API de validación: https://github.com/ProjectSidewalk/sidewalk-ai-api
- Pull request de corrección de inclinación en la API: https://github.com/ProjectSidewalk/sidewalk-ai-api/pull/17
- Web de Project Sidewalk (integración del veredicto): https://github.com/ProjectSidewalk/SidewalkWebpage
- Organización Project Sidewalk en GitHub: https://github.com/ProjectSidewalk
- Colección de modelos y datasets del validador: https://huggingface.co/collections/projectsidewalk/project-sidewalk-validator-models-datasets
- Issue sobre publicación del dataset (#2): https://github.com/ProjectSidewalk/sidewalk-validator-ai/issues/2
- Issue sobre política de datos (#7): https://github.com/ProjectSidewalk/sidewalk-validator-ai/issues/7
- Proyecto Project Sidewalk: https://projectsidewalk.org
- Paper de DINOv2 (arXiv 2304.07193): https://arxiv.org/abs/2304.07193
- Artículo de Next City sobre datos de aceras crowdsourced: https://nextcity.org/urbanist-news/cities-crowdsourced-ai-sidewalk-data-project-sidewalk
