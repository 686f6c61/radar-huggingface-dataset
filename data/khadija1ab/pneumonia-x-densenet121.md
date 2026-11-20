# khadija1ab/pneumonia-x-densenet121

## Resumen

Pneumonia-X es un clasificador binario de imagen para radiografías de tórax que distingue entre pulmón normal y neumonía. Lo desarrolla la usuaria de Hugging Face `khadija1ab` y se distribuye como un modelo `timm` basado en DenseNet121 preentrenado en ImageNet-1k (`densenet121.tv_in1k`) y afinado para una única salida logit. Con 7.038.529 parámetros, es un modelo compacto pensado para inferencia ligera y experimentación educativa.

El modelo se entrenó sobre el dataset pediátrico de Kermany (niños de 1 a 5 años, un único hospital) con una partición train/val/test a nivel de paciente, lo que evita fugas de información entre radiografías del mismo sujeto. El autor declara un umbral operativo de 0,6094 calibrado para sensibilidad ≥ 98 % en validación pediátrica, y publica métricas tanto en test interno (AUROC 0,9964) como en un conjunto externo de adultos RSNA (AUROC 0,9565).

Su relevancia es doble: por un lado, sirve como ejemplo reproducible de buenas prácticas (split por paciente, umbral explícito, evaluación externa, Grad-CAM); por otro, ilustra con datos medidos el problema de la generalización entre dominios, ya que la especificidad cae al 77,96 % en adultos y el modelo tiende a detectar "anomalía" más que neumonía específicamente. La model card lo etiqueta explícitamente como modelo educativo y no como dispositivo médico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN DenseNet121 (`timm` `densenet121.tv_in1k`) con una única salida logit |
| Parámetros totales | 7.038.529 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, clasificación de imagen) |
| Tipos de cuantización | no disponible (pesos en safetensors; admite las cuantizaciones estándar de PyTorch/timm, no documentadas por el autor) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `model.safetensors` (más `config.json` con preprocesado, umbral y métricas) |

## Arquitectura y entrenamiento

La arquitectura es una DenseNet121 convolucional estándar, tomada del zoo de `timm` con pesos iniciales de ImageNet-1k, y adaptada a clasificación binaria mediante una cabeza de una sola salida logit. No hay componentes transformer, MoE ni mecanismos de atención; el interés técnico está en el bloque denso característico de DenseNet (conexiones entre todas las capas de un mismo bloque) y en el bajo coste computacional del modelo.

El entrenamiento se realizó sobre el dataset pediátrico de Kermany (radiografías de tórax de niños de 1 a 5 años, un solo hospital) con partición train/val/test a nivel de paciente. El autor fija un umbral operativo de 0,6094 elegido para alcanzar sensibilidad ≥ 98 % en validación pediátrica, y documenta auditoría de datos y evaluación completa en el repositorio de GitHub. No se especifican en la información disponible el número de épocas, la función de pérdida, el optimizador, el tamaño de lote ni si hubo aumentos de datos concretos. Tampoco se documenta RLHF, DPO ni ajuste por preferencias, algo esperable en un clasificador de imagen.

## Capacidades

- Clasificación binaria de radiografías de tórax en las categorías normal / neumonía, con salida de un logit y umbral operativo documentado (0,6094).
- Generación de mapas de calor Grad-CAM para interpretabilidad, según las etiquetas del modelo.
- Evaluación con métricas clínicas: AUROC, sensibilidad y especificidad a umbral fijo.
- Capacidad de generalización cross-domain medida: AUROC 0,9565 sobre el conjunto de adultos RSNA.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de texto: es un modelo exclusivamente de visión.
- No dispone de modo "thinking", visión general, audio ni otras modalidades fuera de la radiografía de tórax.

## Casos de uso

- Docencia y formación en IA médica: el modelo sirve como ejemplo reproducible de pipeline completo (split por paciente, umbral calibrado, evaluación externa) para cursos y talleres de imagen médica.
- Prototipado de sistemas de triaje en investigación: con 7 millones de parámetros puede desplegarse en una GPU de consumo para experimentar con flujos de prelectura, siempre con supervisión humana y sin uso clínico.
- Evaluación de robustez entre dominios: el par de métricas pediátrico/RSNA permite estudiar cómo se degrada la especificidad al cambiar de población y de equipo de rayos X.
- Generación de explicaciones visuales: los mapas Grad-CAM permiten analizar qué regiones activan la predicción y compararlas con anotaciones radiológicas en estudios de interpretabilidad.
- Benchmark de referencia para clasificadores de tórax: al ser pequeño y de licencia MIT, resulta útil como línea base frente a modelos más grandes en experimentos académicos.
- Integración en demos educativas tipo Gradio o Streamlit: el tamaño reducido del checkpoint permite servirlo en CPU o en una GPU modesta para demostraciones interactivas.
- Auditoría de sesgos y calibración: permite medir empíricamente el efecto de trasladar un umbral pediátrico a una población adulta, un caso de estudio útil en publicaciones sobre equidad en IA médica.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AUROC en test interno (pediátrico) | 0,9964 |
| AUROC en RSNA (adultos) | 0,9565 |
| Sensibilidad en RSNA al umbral 0,6094 | 0,9481 |
| Especificidad en RSNA al umbral 0,6094 | 0,7796 |
| Umbral operativo | 0,6094 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un clasificador de imagen. Tampoco se ofrecen comparaciones numéricas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 30-50 MB para los pesos (7 M de parámetros), más el espacio de activaciones, que depende del tamaño de lote y de la resolución de entrada.
- VRAM estimada en FP16: aproximadamente la mitad del peso de los parámetros, es decir, unos 15 MB, más activaciones.
- GPU recomendadas: cualquier GPU moderna sirve; para producción a gran escala, A100 o H100 son sobredimensionadas para este modelo. Una RTX 4090, RTX 3090, T4 o incluso una GPU integrada pueden ejecutarlo.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660 o superiores; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `timm` + PyTorch como vía natural; exportación a ONNX Runtime o TorchScript para servir; `torch.compile` para acelerar; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos por imagen en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Métricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pneumonia-X (DenseNet121) | 7.038.529 | Radiografía de tórax | AUROC interno 0,9964; AUROC RSNA 0,9565 | MIT | Hugging Face |
| DenseNet121 (`timm` `tv_in1k`) | ~7 M | Imagen genérica | ImageNet-1k (no comparable clínicamente) | Apache 2.0 (según `timm`) | Hugging Face / `timm` |
| ResNet-50 (`timm`) | ~25 M | Imagen genérica | ImageNet-1k (no comparable clínicamente) | Apache 2.0 (según `timm`) | Hugging Face / `timm` |
| CheXNet (referencia académica) | ~7 M (DenseNet121) | Radiografía de tórax | Métricas publicadas en el paper original, no verificadas aquí | No disponible en la información | Paper / repo académico |

La comparación con CheXNet es la más pertinente por arquitectura y tarea, pero no se dispone de una evaluación lado a lado en la información proporcionada. Los modelos genéricos de `timm` se incluyen solo como referencia de tamaño y licencia, no como alternativas clínicas.

## Limitaciones y advertencias

- Modelo educativo, no dispositivo médico: no debe usarse para diagnóstico ni para decisiones clínicas.
- Entrenado con un único dataset pediátrico de un solo hospital (niños de 1 a 5 años); la generalización a otras poblaciones, equipos y protocolos no está garantizada.
- En adultos (RSNA) la especificidad cae al 77,96 % al mantener el umbral pediátrico, lo que implica una tasa alta de falsos positivos.
- El autor documenta que el modelo tiende a detectar "anomalía" más que neumonía específicamente: marca muchas radiografías con otras patologías.
- Riesgo de sesgo demográfico y de adquisición por la composición del dataset de entrenamiento.
- Riesgo de sobreajuste al dominio pediátrico y de calibración deficiente fuera de él.
- Licencia MIT: permite uso comercial, pero eso no exime de las responsabilidades regulatorias y clínicas en el ámbito sanitario.
- Sin datos publicados sobre cuantización, latencia o throughput, lo que limita la planificación de despliegues en producción.
- No procesa texto ni otras modalidades; no es un modelo multimodal.

## Enlaces

- Hugging Face: https://huggingface.co/khadija1ab/pneumonia-x-densenet121
- Repositorio del autor (código, auditoría de datos y evaluación): https://github.com/khadijafair/pneumonia
- Documentación de `timm`: https://github.com/huggingface/pytorch-image-models
- Dataset pediátrico de Kermany: no disponible en la información proporcionada
- Conjunto RSNA de radiografías de tórax: no disponible en la información proporcionada
- Paper de CheXNet: no disponible en la información proporcionada
