# medarc/OpenMidnight-1.1

## Resumen

OpenMidnight-1.1 es un modelo fundacional de patología desarrollado por MedARC y Sophont, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un encoder de visión preentrenado que transforma teselas (tiles) de imágenes histológicas en formato RGB en embeddings de 1.534 dimensiones, pensados para alimentar modelos posteriores de análisis, clasificación o segmentación. No es un modelo generativo ni un sistema multimodal: su función es exclusivamente la extracción de características (image-feature-extraction) sobre imágenes de tejido.

El modelo se distribuye a través de la librería `timm` (versión 1.0.30) e incluye todos los pesos de inferencia en el repositorio, por lo que no requiere un checkpoint base separado, adaptadores ni acceso a clústeres de computación. Con 1.134.774.272 parámetros totales y un tamaño de repositorio de 4,5 GB, se posiciona como un encoder de escala media-grande dentro del ecosistema de modelos fundacionales de patología.

Su relevancia actual radica en que cubre la necesidad de encoders abiertos y permisivos (Apache 2.0) para pipelines de patología computacional, donde la mayoría de alternativas tienen licencias restrictivas o no publican pesos. La versión 1.1 corrige un problema de configuración de preprocesado de la versión anterior (`crop_pct`) que desalineaba las características con las máscaras de segmentación de tejido completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (encoder de visión basado en transformer, distribuido vía `timm`; no se detalla la familia concreta) |
| Parametros totales | 1.134.774.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada de imagen fija de 224 × 224 píxeles) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (metadatos del modelo; la tarea es visión, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Dimension de embedding | 1.534 |
| Resolucion de entrada | 224 × 224 (redimensionado directo con `crop_pct=1.0` y `crop_mode="squash"`) |
| Normalizacion | ImageNet (definida en `config.json`) |
| Interpolacion | bicúbica |
| Token de agregacion | CLS token (`tokens[:, 0]`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un encoder de visión cargable con `timm` y que expone `forward_features`, devolviendo una secuencia de tokens de la que el primero es el token CLS. El modelo cuenta con tokens de registro (`model.num_prefix_tokens` es mayor que 1, ya que la model card indica excluir CLS y tokens de registro al pasar características de parche a un decodificador de segmentación). El embedding de 1.534 dimensiones se obtiene del token CLS.

El preprocesado es una decisión de diseño destacable: en lugar de recortar el centro de la imagen, la versión 1.1 redimensiona la imagen completa a 224 × 224 (`crop_pct=1.0`, `crop_mode="squash"`), preservando la relación de aspecto en teselas cuadradas y estirando las rectangulares. Esto garantiza que la imagen y la máscara de segmentación cubran la misma región de tejido. La versión anterior usaba `crop_pct=0.875`, que conservaba solo los 224 × 224 píxeles centrales de una tesela de 256 × 256, provocando desalineación entre características y máscaras.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras fases de alineación. El paper está anunciado como "coming soon" y no se ha publicado todavía.

## Capacidades

- Extracción de características de imágenes histológicas: mapea teselas RGB a embeddings de 1.534 dimensiones.
- Generación de embeddings a nivel de tesela (tile-level), no a nivel de portaobjetos (slide-level); las predicciones a nivel de slide requieren un modelo posterior.
- Exposición de tokens de parche además del token CLS, lo que permite su uso como backbone en decodificadores de segmentación.
- Compatibilidad con el ecosistema `timm`: carga directa mediante `timm.create_model("hf-hub:medarc/OpenMidnight-1.1", pretrained=True)`.
- Inferencia en GPU (`cuda`) o CPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo thinking. Es un encoder puro de visión especializado.

## Casos de uso

- Clasificación de subtipos tumorales: extraer embeddings de teselas de biopsias y entrenar un clasificador ligero (regresión logística, MLP) sobre las representaciones de 1.534 dimensiones para distinguir tejido tumoral de tejido sano o subtipos histológicos.
- Búsqueda por similitud de imágenes patológicas: indexar embeddings de un archivo de teselas y recuperar casos morfológicamente similares mediante búsqueda vectorial, útil para revisión de casos raros o control de calidad.
- Segmentación de tejido con decodificador posterior: usar los tokens de parche (`tokens[:, model.num_prefix_tokens:]`) como entrada a un decodificador de segmentación tipo THUNDER, interpolando los logits a la resolución original de la máscara.
- Preentrenamiento de modelos slide-level: congelar el encoder y agregar los embeddings de tesela con un modelo de atención múltiple o MIL (multiple instance learning) para predecir diagnóstico o pronóstico a nivel de portaobjetos.
- Extracción de características para pipelines de investigación: generar representaciones cacheables de grandes colecciones de teselas para experimentos de aprendizaje autosupervisado o evaluación de descriptores.
- Detección de artefactos o regiones de baja calidad: entrenar un detector binario sobre los embeddings para filtrar teselas con artefactos de preparación antes de análisis posteriores.
- Análisis de imágenes de inmunohistoquímica: extraer características de teselas teñidas para tareas de cuantificación de marcadores, siempre que el dominio de entrenamiento del encoder sea compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento, comparaciones con otros modelos ni resultados de tareas downstream. El paper está anunciado como "coming soon".

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 4,5 GB solo para pesos (1.134.774.272 parámetros × 4 bytes), más activaciones; en la práctica se recomienda al menos 6-8 GB de VRAM.
- VRAM estimada en FP16/BF16: aproximadamente 2,3 GB para pesos, más activaciones; viable en GPUs consumer con 4-6 GB o más.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM para FP32 cómodo (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100). En FP16 cabe en GPUs de gama media como RTX 3050 8 GB o RTX 4060.
- Cabe en GPU consumer: sí, en la mayoría de modelos con 8 GB o más en FP32 y con 4-6 GB en FP16.
- Opciones de despliegue: `timm` con PyTorch (vía `hf-hub`), `huggingface_hub` y `safetensors`. No se documentan soportes para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje y no aplican a este encoder.
- Latencia y throughput: no disponibles. Al procesar teselas de 224 × 224, el throughput depende del tamaño de lote y de la GPU; no se publican cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. Se indica "no disponible" para una comparación cuantitativa rigurosa. Como referencia cualitativa, OpenMidnight-1.1 se sitúa en la categoría de encoders fundacionales de patología con licencia permisiva (Apache 2.0), pero no se aportan parámetros, contexto ni rendimiento de alternativas en la documentación disponible.

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| OpenMidnight-1.1 | 1.134.774.272 | 224 × 224 px | Apache 2.0 | Hugging Face (`timm`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en patología: no debe usarse para visión general, texto ni otras modalidades.
- Los embeddings son a nivel de tesela; las predicciones a nivel de slide requieren un modelo downstream adicional.
- El preprocesado redimensiona la imagen completa a 224 × 224, estirando imágenes rectangulares; esto puede distorsionar la morfología en teselas no cuadradas.
- La versión 1.1 cambia la configuración de recorte respecto a la anterior; los embeddings cacheados con la versión previa deben recalcularse y los decodificadores de segmentación deben reentrenarse para una evaluación correcta.
- Al usar tokens de parche para segmentación, hay que excluir CLS y tokens de registro (`model.num_prefix_tokens`); de lo contrario, las características se desalinean con la máscara.
- No se documentan sesgos conocidos, tasas de alucinación (no aplica a un encoder) ni limitaciones idiomáticas más allá del metadato `en`.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar los términos del paper y de los datos de entrenamiento cuando se publiquen.
- No se han publicado benchmarks ni el paper; la evaluación de su rendimiento real en tareas downstream queda pendiente de validación independiente.
- No se documentan cuantizaciones oficiales ni soporte para frameworks de inferencia de lenguaje; el despliegue está atado a PyTorch y `timm`.

## Enlaces

- Hugging Face: https://huggingface.co/medarc/OpenMidnight-1.1
- MedARC: https://www.medarc.ai/
- Sophont: https://sophont.med/
- Paper: anunciado como "coming soon" en la model card, sin enlace disponible.
