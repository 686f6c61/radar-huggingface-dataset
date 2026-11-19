# austin-carnahan/orthopedic-screws-model

## Resumen

El modelo `orthopedic-screws-model` es un clasificador de imagen desarrollado por Austin Carnahan (SLUVisLab) que identifica el fabricante de un tornillo pedicular a partir de dos vistas radiográficas del mismo paciente: una proyección anteroposterior (AP) y una lateral. Se apoya en un backbone DINOv2 ViT-S/14 congelado y una cabeza de fusión entrenada, y constituye el motor del espacio OrthoScrew ID en Hugging Face y de la aplicación web OrthoScrew ID. Es relevante porque aborda un problema clínico real —la identificación del fabricante de un implante en revisiones quirúrgicas— con un enfoque de bajo coste computacional y solo cuatro clases.

Técnicamente es un modelo pequeño: el backbone ViT-S/14 aporta 384 dimensiones por vista que se concatenan en 768, y la cabeza de fusión es un MLP de dos capas. El repositorio ocupa 0,3 GB y el modelo se distribuye como state dict completo (`.pth`), no en safetensors ni GGUF. La licencia no está declarada en la información disponible.

Su rendimiento es modesto y el propio autor lo presenta como herramienta asistencial, no como dispositivo médico: 59,6 % de accuracy y 46,9 % de balanced accuracy sobre un split de evaluación de 26 pacientes. El modelo reconoce únicamente cuatro fabricantes (DePuy, Medtronic, NuVasive y SeaSpine) y asigna una de esas cuatro clases a cualquier imagen, incluso si el tornillo no pertenece a ninguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-S/14 (DINOv2 congelado) con cabeza de fusión MLP dual-view |
| Parametros totales | no disponible (backbone ViT-S/14 de ~22 M y cabeza Linear(768,512)+Linear(512,4)) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224) |
| Tipos de cuantizacion | no disponible (pesos en `.pth`; no se documentan cuantizaciones) |
| Idiomas soportados | en (etiquetas de clase en inglés) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (state dict completo de PyTorch), más `dinov2_vits14_pretrain.pth` y `dinov2_embeddings.pkl` |

## Arquitectura y entrenamiento

El modelo emplea un backbone DINOv2 ViT-S/14 de Meta, congelado, que codifica cada una de las dos vistas (AP y lateral) de forma independiente. De cada vista se extrae el token [CLS] de 384 dimensiones, y ambos se concatenan en un vector de 768 dimensiones que alimenta una cabeza de fusión entrenada: `Linear(768,512) → ReLU → Dropout(0.5) → Linear(512,4)`. La entrada son recortes en escala de grises centrados en el tornillo, de aproximadamente el doble de la dimensión mayor del implante, redimensionados a 224×224, replicados a tres canales y normalizados con estadísticas de ImageNet.

El entrenamiento se realizó solo sobre la cabeza, con entropía cruzada, optimizador Adam (lr 1e-4, weight decay 1e-4), 50 épocas, batch de 16 y muestreo por paciente con frecuencia inversa para compensar el desbalance de clases. El conjunto de datos es `austin-carnahan/orthopedic-screw-images`. No se documenta uso de RLHF, DPO ni otras técnicas de alineación, ni se especifica el número de tokens o composición detallada del dataset más allá de las cuatro clases y los recuentos de pacientes por clase en el split de evaluación (3–11 pacientes por clase).

## Capacidades

- Clasificación de imagen en cuatro clases de fabricante de tornillo pedicular: `Depuy expedium (Synthes)`, `medtronic solera`, `nuvasive reline`, `seaspine mariner`.
- Fusión de dos vistas (AP y lateral) del mismo paciente en una única predicción.
- Extracción de embeddings de 768 dimensiones para búsqueda por similitud (índice `dinov2_embeddings.pkl`).
- Procesamiento de recortes radiográficos en escala de grises normalizados a 224×224.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo thinking.
- Capacidad multilingüe: no aplica; las etiquetas están en inglés.

## Casos de uso

- Identificación asistencial de fabricante en revisiones de cirugía de columna: dado un par de radiografías AP y lateral con recortes centrados en el tornillo, el modelo devuelve una de las cuatro clases para orientar al equipo clínico antes de la confirmación definitiva por el fabricante o el registro del implante.
- Triaje en consulta de revisión: integrado en la aplicación OrthoScrew ID, permite obtener una sugerencia rápida del fabricante a partir de imágenes ya disponibles, reduciendo el tiempo de búsqueda manual en catálogos.
- Búsqueda por similitud de implantes: usando los embeddings de 768 dimensiones del índice, se pueden recuperar casos previos con tornillos morfológicamente parecidos para comparación visual.
- Investigación retrospectiva en registros de columna: clasificar cohortes de radiografías para estudiar la distribución de fabricantes en una población o centro, siempre con validación manual posterior.
- Docencia y formación de residentes: mostrar la variabilidad morfológica entre fabricantes y las limitaciones del reconocimiento visual asistido por IA.
- Benchmark de referencia para modelos de clasificación de implantes: al ser un modelo pequeño con métricas publicadas, sirve como línea base para comparar aproximaciones futuras (ResNet18 previo, ViT mayores, etc.).
- Prototipado de pipelines de imagen médica: por su tamaño reducido y backbone congelado, permite desplegar inferencia en CPU o GPU modesta dentro de entornos de investigación.

## Benchmarks y rendimiento

Evaluación sobre el split de 26 pacientes (240 pares de recortes AP/lateral) del dataset `austin-carnahan/orthopedic-screw-images`. El autor advierte que este split es el de selección de checkpoint, no un test independiente.

| Metrica | Valor |
|---|---|
| Accuracy | 59,6 % (143/240) |
| Balanced accuracy | 46,9 % |
| Macro-F1 | 46,3 % |

| Fabricante | Recall | Precision | F1 |
|---|---:|---:|---:|
| DePuy Expedium (Synthes) | 45,0 % | 31,0 % | 36,7 % |
| Medtronic Solera | 89,1 % | 83,1 % | 86,0 % |
| NuVasive Reline | 36,7 % | 48,9 % | 41,9 % |
| SeaSpine Mariner | 16,7 % | 26,3 % | 20,4 % |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el backbone ViT-S/14 (~22 M de parámetros) y la cabeza MLP caben holgadamente en menos de 1 GB en fp32, y en torno a unos cientos de MB en fp16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; también funciona en CPU para inferencia puntual.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: PyTorch nativo con el código de `SLUVisLab/iris-orthopedic` (`ml/model/`) o `SLUVisLab/ortho_screw_dinov2`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| orthopedic-screws-model (DINOv2 dual-view) | ~22 M backbone + MLP | 224×224, dos vistas | 59,6 % accuracy, 46,9 % balanced accuracy | no disponible | Hugging Face, `.pth` |
| Versión previa ResNet18 dual-view (mismo repo, revisión `f439fc0`) | no disponible | dos vistas | no disponible | no disponible | Hugging Face, revisión antigua |
| DINOv2 ViT-S/14 original (Meta) | ~22 M | 224×224, una vista | no aplica (backbone preentrenado) | Apache-2.0 | Hugging Face / Meta |

No se dispone de comparativas con otros clasificadores de implantes ortopédicos en la información proporcionada.

## Limitaciones y advertencias

- El split de evaluación es el de selección de checkpoint y es pequeño (3–11 pacientes por clase); las métricas pueden no generalizar a datos externos.
- El rendimiento está dominado por Medtronic (la clase mayoritaria); DePuy, NuVasive y especialmente SeaSpine muestran recall bajo (45,0 %, 36,7 % y 16,7 %).
- Solo reconoce cuatro fabricantes; cualquier tornillo de otro fabricante se asignará forzosamente a una de esas cuatro clases.
- Espera recortes ajustados y centrados en el tornillo; radiografías sin recortar o con recortes laxos quedan fuera de la distribución de entrenamiento.
- Riesgo de alucinación de clase: el modelo siempre emite una predicción, sin opción de "desconocido" ni puntuación de abstención documentada.
- Uso asistencial únicamente: no es un dispositivo médico y no sustituye la confirmación del fabricante por el equipo tratante.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Idioma: etiquetas y documentación en inglés; no hay soporte multilingüe.
- Sesgos potenciales derivados del dataset (posible sobrerrepresentación de Medtronic y de un único centro) no cuantificados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/austin-carnahan/orthopedic-screws-model
- Dataset: https://huggingface.co/datasets/austin-carnahan/orthopedic-screw-images
- Space OrthoScrew ID: https://huggingface.co/spaces/austin-carnahan/orthopedic-screw-identification
- Aplicación web OrthoScrew ID: https://sluvislab.github.io/iris-orthopedic/
- Repositorio de entrenamiento y evaluación: https://github.com/SLUVisLab/ortho_screw_dinov2
- Repositorio de despliegue: https://github.com/SLUVisLab/iris-orthopedic
- Revisión con el modelo previo ResNet18: https://huggingface.co/austin-carnahan/orthopedic-screws-model/tree/f439fc0fb997b9f2792deb0f7e2c029b7f09171a
