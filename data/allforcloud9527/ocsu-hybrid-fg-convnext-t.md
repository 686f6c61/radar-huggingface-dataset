# allforcloud9527/ocsu-hybrid-fg-convnext-t

## Resumen

OCSU-Hybrid functional-group head es un clasificador de imagen multi-etiqueta basado en ConvNeXt-T (implementación de timm, inicializado con pesos de ImageNet) que predice los 140 grupos funcionales del vocabulario del artículo OCSU a partir de una imagen de estructura química de 384 x 384 píxeles. Lo desarrolla el usuario allforcloud9527 y su función es sustituir la etapa `OCSR -> diccionario RDKit` del pipeline OCSU por una cabeza puramente visual, de modo que la detección de grupos funcionales deje de depender de la calidad del SMILES reconocido por el módulo de reconocimiento óptico de estructuras.

El modelo tiene 27,8 millones de parámetros, un checkpoint de 107 MB y genera 140 puntuaciones sigmoideas independientes (una por grupo funcional), con un umbral de decisión de 0,72 ajustado sobre 500 imágenes de validación. Se entrenó sobre el split de entrenamiento de Vis-CheBI20 (25.644 imágenes) con etiquetas derivadas de las captions `struct_cap` de OCSU y una pérdida BCEWithLogits ponderada por clase.

Su relevancia es acotada pero concreta: es un componente especializado de un pipeline mayor, no un modelo de propósito general. Reporta un F1 de 99,07 sobre el split de test completo de Vis-CheBI20 (3.269 muestras, disjuntas a nivel de molécula respecto a entrenamiento), por encima de las referencias que cita el autor (Mol-VL-7B con 97,32, DoubleCheck + RDKit con 93,63). La licencia es Apache-2.0 y el repositorio ocupa 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-T (timm), inicializacion ImageNet |
| Parametros totales | 27,8 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 384 x 384 RGB) |
| Tipos de cuantizacion | no disponible (el autor solo publica checkpoint en `torch.save`) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas son 140 nombres de grupos funcionales en el vocabulario OCSU) |
| Licencia | Apache-2.0 |
| Formato de pesos | `torch.save` (diccionario con `model`, `vocab`, `img_size`, `threshold`, `val_f1`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es una ConvNeXt-T de timm con inicialización ImageNet, adaptada a una cabeza de clasificación multi-etiqueta de 140 salidas con activación sigmoidea. La entrada es una imagen RGB de 384 x 384. El checkpoint es un diccionario serializado con `torch.save` que incluye el `state_dict`, el vocabulario de 140 nombres de grupo, el tamaño de imagen, el umbral de 0,72 y el F1 de validación (0,9944). No hay componente de texto ni de reconocimiento de secuencias: el modelo opera únicamente sobre píxeles.

El entrenamiento usó el split de train de Vis-CheBI20 con 25.644 imágenes, con etiquetas extraídas de las captions `struct_cap` de OCSU. La pérdida fue `BCEWithLogitsLoss` con `pos_weight = sqrt(neg/pos)` recortado al rango 1–20 para compensar el desbalance entre clases. Optimizador AdamW con lr 2e-4, schedule coseno y weight decay 0,05; batch de 32 durante 12 épocas con early stopping (paciencia 3). Aumentación con RandomResizedCrop(0,7–1,0), flip horizontal y color jitter. El entrenamiento se completó en unos 30 minutos sobre una RTX 4060 de 8 GB. No se documenta uso de RLHF, DPO ni datos adicionales fuera de Vis-CheBI20.

## Capacidades

- Clasificación multi-etiqueta de 140 grupos funcionales a partir de una imagen de estructura química.
- Predicción a nivel de molécula completa: devuelve el conjunto de etiquetas presentes, sin localización espacial de cada grupo en la imagen.
- Independencia del reconocimiento de SMILES: al operar solo sobre imagen, evita la propagación de errores del módulo OCSR.
- Integración como cabeza `--fg` dentro del pipeline OCSU (`ocsu analyze molecule.png`).
- Umbral de decisión calibrado y almacenado en el checkpoint (0,72), reutilizable en inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural.
- No tiene capacidades multilingües ni de audio; el vocabulario de salida está fijado al diccionario OCSU.

## Casos de uso

- Extracción de grupos funcionales en pipelines de química documental: dado un conjunto de imágenes de estructuras renderizadas, el modelo devuelve las etiquetas de grupo funcional sin necesidad de ejecutar OCSR ni RDKit, lo que reduce la cadena de dependencias y el coste computacional por imagen.
- Verificación cruzada de resultados OCSR: comparar las etiquetas predichas por esta cabeza con las derivadas del SMILES reconocido permite detectar discrepancias y marcar moléculas para revisión manual.
- Preprocesado para búsqueda y filtrado de moléculas: las 140 etiquetas binarias sirven como vector de características para indexar y filtrar bases de datos de estructuras por presencia de grupos funcionales concretos.
- Control de calidad en digitalización de patentes y literatura: al ser independiente del SMILES, puede señalar imágenes donde el OCSR falló pero la estructura visual es legible, priorizando la revisión humana.
- Etiquetado asistido de nuevos conjuntos: usar el modelo para pre-anotar grupos funcionales en imágenes del mismo pipeline de renderizado y acelerar la curación de datasets, con revisión posterior.
- Componente de evaluación de modelos OCSR: como referencia visual de grupos funcionales, permite medir la degradación introducida por el reconocimiento de secuencias en comparación con la vía puramente visual.
- Experimentación académica en clasificación multi-etiqueta química: el checkpoint es pequeño (107 MB) y se entrena en una GPU de consumo en unos 30 minutos, lo que facilita reproducir y extender el enfoque.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de test completo de Vis-CheBI20 (3.269 muestras, disjuntas a nivel de molécula respecto a entrenamiento):

| Metrica | Valor |
|---|---:|
| F1 | 99,07 |
| Precision | 99,31 |
| Recall | 99,00 |
| Exact set match | 92,87 |
| Macro F1 (117 clases con soporte) | 87,46 |

Comparativa de F1 en grupos funcionales citada en la model card:

| Metodo | F1 |
|---|---:|
| MolScribe + RDKit (artículo) | 89,60 |
| Este diccionario + MolScribe | 91,11 |
| DoubleCheck + RDKit (artículo) | 93,63 |
| Mol-VL-7B (artículo) | 97,32 |
| Esta cabeza | 99,07 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un modelo de 27,8 M de parámetros con entrada de 384 x 384; en la práctica, unos pocos cientos de MB incluyendo activaciones de un batch pequeño.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una RTX 4060 de 8 GB en unos 30 minutos, por lo que la inferencia es holgada en RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: el checkpoint es un `torch.save` que se carga con PyTorch/timm; se integra en el CLI de OCSU (`ocsu analyze --fg-ckpt`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles de forma explícita; por el tamaño y la resolución de entrada, se espera inferencia por debajo de decenas de milisegundos por imagen en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entrada | F1 grupos funcionales | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OCSU-Hybrid FG head (este) | ConvNeXt-T, clasificacion multi-etiqueta | 27,8 M | imagen 384 x 384 | 99,07 (test Vis-CheBI20) | Apache-2.0 | Hugging Face |
| Mol-VL-7B | modelo vision-lenguaje | 7 B (aprox., segun nombre) | no disponible | 97,32 | no disponible | citado en la model card |
| DoubleCheck + RDKit | pipeline OCSR + quimica | no disponible | imagen de estructura | 93,63 | no disponible | citado en la model card |
| MolScribe + RDKit | pipeline OCSR + quimica | no disponible | imagen de estructura | 89,60 | no disponible | citado en la model card |

La comparación es directa solo en la tarea de grupos funcionales sobre Vis-CheBI20; los modelos alternativos son pipelines o modelos de mayor tamaño con capacidades adicionales (reconocimiento de secuencias, razonamiento multimodal) que este modelo no ofrece.

## Limitaciones y advertencias

- El espacio de etiquetas está fijado al diccionario OCSU de 140 grupos funcionales; no realiza nomenclatura química libre ni reconoce grupos fuera de ese vocabulario.
- Entrenamiento y test provienen del mismo pipeline de renderizado de Vis-CheBI20; imágenes escaneadas, fotografías o capturas de pantalla pueden requerir adaptación de dominio y degradar el rendimiento.
- El modelo predice etiquetas a nivel de molécula completa y no localiza cada grupo funcional en la imagen, lo que limita su uso para anotación espacial.
- El F1 global de 99,07 convive con un macro F1 de 87,46 sobre 117 clases con soporte, lo que indica peor rendimiento en clases poco frecuentes; el desbalance se mitiga con `pos_weight` pero no se elimina.
- Riesgo de falsos positivos y negativos en imágenes con baja resolución, ruido o estilos de dibujo distintos al corpus de entrenamiento; el umbral de 0,72 está ajustado sobre 500 imágenes de validación del mismo dominio.
- No se documentan sesgos demográficos ni sociales, pero tampoco se realizó una auditoría de sesgo conocida; la evaluación se limita a métricas de clasificación química.
- Licencia Apache-2.0 permite uso comercial, pero el dataset Vis-CheBI20 también es Apache-2.0 y el autor remite al NOTICE del repositorio; conviene revisar dichas condiciones antes de redistribuir pesos o datos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa independiente de los resultados reportados.
- No se publican pesos en safetensors ni GGUF, solo un `torch.save`; esto obliga a usar PyTorch y a confiar en la serialización pickle del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allforcloud9527/ocsu-hybrid-fg-convnext-t
- Dataset Vis-CheBI20: https://huggingface.co/datasets/PharMolix/Vis-CheBI20
- Repositorio de timm (arquitectura ConvNeXt): https://github.com/huggingface/pytorch-image-models
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios del pipeline OCSU ni demos adicionales.
