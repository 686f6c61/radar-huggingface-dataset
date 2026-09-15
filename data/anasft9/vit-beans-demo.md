# Anasft9/vit-beans-demo

## Resumen

Anasft9/vit-beans-demo es un modelo de clasificación de imágenes publicado en HuggingFace por el usuario Anasft9. Se trata de un ajuste fino (fine-tuning) completo del checkpoint google/vit-base-patch16-224-in21k, un Vision Transformer de tipo base preentrenado por Google sobre ImageNet-21k a resolución 224x224 con parches de 16x16. El repositorio declara 85.800.963 parámetros en formato safetensors, licencia Apache 2.0 y pipeline `image-classification`.

El modelo resuelve una tarea concreta de clasificación de imágenes: según el nombre del repositorio, está orientado a la clasificación de hojas de judía (beans), presumiblemente asociado al conjunto de datos público *beans* de HuggingFace, aunque la model card indica explícitamente que el conjunto de entrenamiento es desconocido ("on an unknown dataset"). Los únicos resultados declarados por el autor son la pérdida y la exactitud sobre el conjunto de evaluación: *loss* 0,1443 y *accuracy* 0,9688.

Su relevancia es limitada y de carácter demostrativo: es un experimento académico o de aprendizaje, con cero descargas y cero "likes" en el momento de la consulta, sin model card completada (las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen únicamente "More information needed") y sin resultados en el `model-index`. No debe considerarse un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-base), parches de 16x16, preentrenado en ImageNet-21k |
| Parámetros totales | 85.800.963 (85,8 M) |
| Parámetros activos | No aplica (arquitectura densa, no es MoE) |
| Longitud de contexto | No aplica en el sentido de texto; entrada de imagen fija de 224x224 px, que se tokeniza en 197 posiciones (196 parches + 1 token CLS). No se documenta soporte de resolución variable |
| Tipos de cuantización | No se publican variantes cuantizadas en el repositorio. Al ser un ViT estándar es convertible a fp16/bf16 e int8 con herramientas habituales (PyTorch, Optimum, ONNX Runtime), pero no hay artefactos GGUF ni cuantizaciones oficiales verificadas |
| Idiomas soportados | No disponible (modelo de visión, sin capacidades de texto documentadas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (biblioteca `transformers`) |
| Modelo base | google/vit-base-patch16-224-in21k |
| Pipeline | image-classification |
| Tamaño del repositorio | 1,7 GB |
| Fecha de creación / actualización | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar de tamaño *base*: la imagen de entrada se divide en parches de 16x16 px, cada parche se proyecta linealmente a un vector de 768 dimensiones y se añade un token CLS, formando una secuencia de 197 tokens. Sobre esa secuencia se aplica el codificador transformer habitual (12 capas, 12 cabezas de atención, dimensión oculta 768, MLP de 3072), y la representación del token CLS alimenta la cabeza de clasificación. El preentrenamiento del modelo base fue en ImageNet-21k a 224x224 (sufijo `in21k`), y el ajuste fino se realizó sobre un conjunto de datos no especificado en la model card.

Los hiperparámetros de entrenamiento sí están documentados: 4 épocas, tasa de aprendizaje 5e-05, programador lineal, tamaño de lote 16 (tanto en entrenamiento como en evaluación), semilla 42 y optimizador AdamW en su variante *fused* (`ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-08). Se registraron 65 pasos por época y 260 pasos totales; con lotes de 16, esto implica aproximadamente 1.040 imágenes en el conjunto de entrenamiento (dato derivado aritméticamente, no declarado de forma explícita). No se documenta ningún tipo de RLHF, DPO, destilación ni innovación técnica adicional: es un ajuste fino supervisado convencional de clasificación.

## Capacidades

- Clasificación de imágenes a resolución fija de 224x224 px mediante el pipeline `image-classification` de `transformers`.
- Predicción de etiquetas de clase sobre imágenes, con una exactitud declarada de 0,9688 en el conjunto de evaluación del autor.
- Inferencia con soporte de `endpoints_compatible`, es decir, desplegable en HuggingFace Inference Endpoints.
- No hay evidencia de soporte de *tool calling*, *function calling* ni agentes: es un modelo discriminativo de visión, no un modelo generativo de lenguaje.
- No se declaran capacidades multilingües, de razonamiento, de generación de código ni de matemáticas.
- No se declaran capacidades multimodales de visión-lenguaje (VQA, captioning) ni de detección o segmentación: la cabeza es de clasificación de imagen completa.
- No se documenta modo de razonamiento (*thinking*), audio ni vídeo.

## Casos de uso

- Clasificación automática de hojas de judía en un proyecto agrícola de demostración: dada una fotografía de una hoja, el modelo devuelve una etiqueta de clase; es el uso coherente con el nombre del repositorio y con la exactitud declarada, siempre que el dominio de producción coincida con el de evaluación.
- Prototipado y material didáctico: sirve como ejemplo reproducible de fine-tuning de un ViT con el `Trainer` de HuggingFace, útil en cursos o tutoriales de visión por computador.
- *Baseline* interno de comparación: al ser un ViT-base ajustado, puede usarse como referencia mínima contra la que medir modelos propios de clasificación de imágenes en un mismo conjunto de validación.
- Filtrado previo en un *pipeline* de anotación: usar el modelo como clasificador de primera pasada para priorizar qué imágenes revisa un humano, aprovechando su bajo coste de inferencia (85,8 M de parámetros).
- Pruebas de integración de infraestructura: al ser compatible con Inference Endpoints y con `transformers`, es adecuado para validar extremo a extremo el despliegue de un endpoint de clasificación (carga de safetensors, preprocesado de imagen, devolución de logits).
- *Benchmarking* de cuantización: por su tamaño reducido, es un candidato cómodo para medir la degradación de exactitud al pasar de fp32 a fp16 o int8 en distintas GPUs.
- No se recomienda su uso en atención al cliente, generación de código, agentes ni tareas de lenguaje: el modelo no tiene capacidades de texto.

## Benchmarks y rendimiento

El `model-index` del repositorio no contiene resultados (lista `results` vacía). Los únicos datos disponibles son los que el autor declara sobre su propio conjunto de evaluación, sin especificar el conjunto de datos ni el número de clases, por lo que no son comparables con referencias públicas como ImageNet.

| Métrica | Valor declarado |
|---|---|
| Exactitud en el conjunto de evaluación (época final) | 0,9688 |
| Pérdida en el conjunto de evaluación (época final) | 0,1443 |

Evolución durante el entrenamiento (datos de la model card):

| Época | Paso | Pérdida de entrenamiento | Pérdida de validación | Exactitud |
|---|---|---|---|---|
| 1,0 | 65 | 0,2396 | 0,2069 | 0,9549 |
| 2,0 | 130 | 0,1281 | 0,0981 | 0,9774 |
| 3,0 | 195 | 0,1131 | 0,1427 | 0,9624 |
| 4,0 | 260 | 0,1271 | 0,0947 | 0,9774 |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de lenguaje, ya que el modelo no es un modelo de lenguaje. Tampoco se han publicado resultados comparables de ImageNet u otros conjuntos de visión para este ajuste concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 0,35 GB de pesos (85,8 M de parámetros x 4 bytes); en fp16/bf16, alrededor de 0,17 GB; en int8, unos 0,09 GB. Añadiendo activaciones y *overhead* del runtime, un lote pequeño cabe holgadamente en menos de 1 GB.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o más (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090) es más que suficiente, incluso con lotes grandes.
- Funciona en CPU para inferencia puntual o lotes modestos, dado el tamaño reducido del modelo.
- GPU de datacenter (A100, H100, L4, T4) no son necesarias; solo tendrían sentido para servir lotes muy grandes en paralelo.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa; HuggingFace Inference Endpoints (el repositorio está marcado como `endpoints_compatible`); exportación a ONNX; `vLLM`, `llama.cpp`, Ollama y TGI no son aplicables a un modelo de clasificación de imágenes (TGI está orientado a modelos generativos de texto).
- Latencia y *throughput*: no disponibles. No hay mediciones publicadas por el autor. El tamaño del repositorio (1,7 GB) es notablemente superior al de los pesos en fp32, lo que sugiere que incluye estados del optimizador o checkpoints intermedios además del modelo final.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados en la información proporcionada. La siguiente tabla recoge únicamente características estructurales conocidas de alternativas de la misma familia y tamaño; los datos de rendimiento de las alternativas se marcan como no disponibles porque no se han consultado en fuentes en esta búsqueda.

| Modelo | Tipo | Parámetros | Licencia | Rendimiento comparativo |
|---|---|---|---|---|
| Anasft9/vit-beans-demo | ViT-base ajustado a clasificación de 224x224 | 85,8 M | Apache 2.0 | Exactitud 0,9688 en su propio conjunto de evaluación (no comparable) |
| google/vit-base-patch16-224-in21k | ViT-base preentrenado en ImageNet-21k, sin cabeza ajustada | 85,8 M (misma arquitectura) | Apache 2.0 | No disponible en esta búsqueda |
| google/vit-base-patch16-224 | ViT-base ajustado en ImageNet-1k | ~86 M | Apache 2.0 | No disponible en esta búsqueda |
| ResNet-50 (referencia CNN) | Red convolucional | ~25,6 M | Varía según implementación | No disponible en esta búsqueda |

La comparación directa de exactitud no es posible porque el conjunto de evaluación del modelo analizado no está identificado y, por tanto, no se puede equiparar con métricas de ImageNet u otros conjuntos públicos.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento contienen literalmente "More information needed". No hay información sobre las clases, el número de etiquetas, el origen de las imágenes ni el preprocesado aplicado.
- Conjunto de datos desconocido: no se puede verificar la representatividad del conjunto de evaluación ni si existe fuga de datos entre entrenamiento y validación.
- Riesgo de sobreajuste: con solo 65 pasos por época y 4 épocas (aproximadamente 1.040 imágenes de entrenamiento según cálculo derivado), el ajuste fino es muy corto; la exactitud de 0,9774 con pérdida de validación de 0,0947 debe interpretarse con cautela fuera del dominio de evaluación.
- Sin validación independiente: no hay *test set* separado declarado ni resultados de terceros; cero descargas y cero "likes" implican ausencia de revisión por la comunidad.
- Sesgos: no disponibles. No se documenta la composición demográfica, geográfica ni de condiciones de captura del conjunto de datos, por lo que no se pueden evaluar sesgos sistemáticos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en imágenes fuera de distribución (iluminación, fondo, especie vegetal distinta, resolución diferente a 224x224).
- Limitación de entrada fija: el modelo base trabaja a 224x224 px; imágenes de otras resoluciones requieren redimensionado, lo que puede degradar la exactitud en detalles finos.
- Limitación de idioma: no aplica, es un modelo exclusivamente de visión; no procesa texto.
- Licencia Apache 2.0: permite uso comercial y modificación, pero al derivar de google/vit-base-patch16-224-in21k conviene conservar el aviso de licencia y la atribución correspondiente.
- Caveat para producción: el autor no declara métricas de latencia, *throughput*, robustez ni comportamiento ante entradas adversarias. No se recomienda su despliegue en un sistema crítico (por ejemplo, diagnóstico fitosanitario real) sin reentrenamiento, validación en el dominio objetivo y una model card completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Anasft9/vit-beans-demo
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Biblioteca `transformers`: https://github.com/huggingface/transformers

Nota sobre la búsqueda web: los resultados recuperados no guardan ninguna relación con el modelo. Corresponden a páginas del directorio de hospitales alemanes sobre la clínica de oftalmología del Helios Klinikum Hildesheim (https://www.deutsches-krankenhaus-verzeichnis.de/app/portrait/d29445ace33a0ede/fachabteilung/13/start, https://www.kliniken.de/fachabteilung/klinik-fuer-augenheilkunde-hildesheim-149745F.html, https://klinikfuehrer.tk.de/Klinikum-Hildesheim-GmbH-in-31135-Hildesheim/Klinik-fuer-Augenheilkunde/uebersicht/fachabteilung/26032063300/13, https://www.helios-gesundheit.de/standorte-angebote/kliniken/hildesheim/, https://krankenhaussuche.kkh.de/Klinikum-Hildesheim-GmbH-in-31135-Hildesheim/Klinik-fuer-Augenheilkunde/uebersicht/fachabteilung/26032063300/13). Por tanto, no se han encontrado en la búsqueda web enlaces relevantes al modelo: no hay *paper*, blog, repositorio ni demo asociados.
