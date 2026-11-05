# leloss/LayaFace-DCF-HSF.v0.20261029

## Resumen

LayaFace-DCF-HSF.v0.20261029 es un checkpoint de investigación para verificación facial simétrica de dos imágenes, desarrollado por el usuario leloss. Se trata de un fine-tune del codificador visual de CLIP ViT-B/16 de OpenAI, adaptado específicamente a la tarea de comparar si dos recortes faciales alineados corresponden a la misma persona. No es un modelo generativo ni un modelo de lenguaje: es un modelo discriminativo de verificación biométrica de pares.

El modelo parte de `openai/clip-vit-base-patch16` y añade una cabeza de comparación de pares de 393.729 parámetros, alcanzando un total de 86.193.153 parámetros. La adaptación de tarea se realizó con datos sintéticos (identidades DCFace y HSFace10K), congelando la política de decisión mediante temperatura y umbral ajustados sobre particiones separadas por identidad.

Es relevante ahora porque explora si la adaptación exclusivamente con datos sintéticos puede transferir a benchmarks de caras reales, un tema activo en privacidad y biometría. Los resultados reportados por el autor en el seed 20261029 son preliminares y el propio autor lo etiqueta como "development fitted, not deployment approved".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-B/16 (CLIP) con cabeza de comparación de pares GELU |
| Parametros totales | 86.193.153 (incluye cabeza de pares de 393.729) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de dos imágenes 112x112 redimensionadas a 224x224) |
| Tipos de cuantizacion | no disponible (pesos empaquetados en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | en (etiqueta del autor; la tarea es visión, no texto) |
| Licencia | no disponible (implementación propia declarada Apache-2.0; términos de pesos y dataset sintético sin verificar) |
| Formato de pesos | safetensors (bundle personalizado, no `transformers.AutoModel`) |

## Arquitectura y entrenamiento

El modelo reutiliza un codificador visual CLIP ViT-B/16 compartido, inicializado desde el checkpoint de OpenAI. Cada una de las dos imágenes de entrada (recortes faciales alineados de 112x112 RGB) se redimensiona de forma independiente a 224x224 y se normaliza con las estadísticas de CLIP. Se extraen embeddings del token de clase post-layernorm de 768 dimensiones, normalizados en L2. Sobre ellos se construyen características simétricas `[sqrt(768) * abs(a-b), 768 * (a*b)]` que alimentan una cabeza `1536 -> 256 -> 1` con activación GELU. La salida incluye decisión booleana de coincidencia, logit bruto y probabilidad calibrada por temperatura; intercambiar las dos entradas deja el logit invariante.

El entrenamiento de adaptación de tarea (variante F1) usa 15.983 identidades sintéticas de DCFace y HSFace10K, con 782.382 imágenes y pérdida binaria de entropía cruzada por pares con balanceo de clases. F1 adapta tanto el codificador visual como la cabeza de pares, con un presupuesto de 4 épocas; el checkpoint se seleccionó en la época 4 por mínima NLL bruta en la partición Stop. Las particiones Fit, Stop, Select, Calibrate y Threshold son disjuntas por identidad, y todos los pares de benchmark quedan fuera de la adaptación. La política de decisión incluida fija temperatura 1,2163570608 y umbral de logit bruto 1,57049036026, con probabilidad `sigmoid(logit / temperatura)` y decisión `logit >= umbral`; el umbral se ajustó a FMR objetivo del 1% con 20.000 pares no coincidentes. El autor advierte que la adaptación solo con datos sintéticos no implica que el preentrenamiento de CLIP o el generador sintético no hayan visto fotografías reales.

## Capacidades

- Verificación facial de pares: decide si dos recortes alineados de 112x112 corresponden a la misma persona.
- Simetría estricta: la salida es invariante al orden de las dos imágenes de entrada.
- Salidas múltiples: decisión booleana, logit bruto y probabilidad calibrada por temperatura.
- Embeddings de 768 dimensiones del token de clase, reutilizables y cacheables para comparaciones repetidas contra una referencia.
- Inferencia offline tras la descarga inicial del bundle; carga local sin llamadas de red.
- Ejecución en CPU o CUDA según la instalación de PyTorch.
- No incluye detección ni alineación de caras: son operaciones previas obligatorias.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de audio; es un modelo puramente visual.

## Casos de uso

- Investigación en verificación biométrica con datos sintéticos: permite estudiar la transferencia de adaptación sintética a benchmarks reales (LFW, CFP-FP, AgeDB-30, CALFW, CPLFW) en condiciones controladas y con pares fijos.
- Validación de pipelines de preprocesado facial: al exigir recortes alineados de 112x112, sirve para comprobar que la detección y alineación upstream producen entradas válidas (los recortes inválidos lanzan error en inferencia ordinaria).
- Comparación de referencias repetidas con caché de embeddings: el embedding del token de clase puede cachearse para contrastar múltiples probes contra una misma referencia sin recomputar el codificador.
- Estudios de calibración y umbrales operativos: la política incluida (temperatura y umbral a FMR del 1%) permite analizar curvas FMR/FNMR y ECE en entornos de desarrollo con pares balanceados.
- Evaluación de robustez demográfica y de ataques de presentación: el autor señala explícitamente que la robustez demográfica y la resistencia a ataques de presentación no se han establecido, por lo que el modelo puede usarse como sujeto de estudio en esos análisis.
- Docencia y reproducción de experimentos: el bundle incluye código Python y `evaluation.json` con métricas legibles por máquina, lo que facilita reproducir la evaluación en portátil o en GPU consumer.

## Benchmarks y rendimiento

Resultados del seed 20261029 con la política de desarrollo incluida (porcentajes salvo AUC y Brier):

| Benchmark | Macro F1 | Accuracy | FMR | FNMR | AUC | ECE | Brier |
|---|---:|---:|---:|---:|---:|---:|---:|
| DCF | 97,78 | 97,78 | 0,63 | 3,80 | 0,9987 | 0,25 | 0,0122 |
| FLUX | 98,13 | 98,13 | 3,74 | 0,00 | 0,9998 | 2,26 | 0,0208 |

Precisión en caras reales con protocolo estándar de diez folds (umbral ajustado en nueve folds y probado en el restante; no es la precisión del umbral sintético incluido):

| Benchmark real | Precisión diez folds (%) |
|---|---:|
| lfw | 98,90 |
| cfp_fp | 94,17 |
| agedb_30 | 87,23 |
| calfw | 89,95 |
| cplfw | 84,18 |
| Media | 90,89 |

El autor indica que estos son los resultados de este seed, no las medias de tres seeds del paper. Una imagen constante de CPLFW aparece en 13 pares, contados como no coincidentes en la evaluación compartida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 86,2 M de parámetros en precisión completa el peso ronda los 0,34 GB, por lo que la inferencia cabe holgadamente en GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA de PyTorch; el modelo también funciona en CPU (`device="cpu"`).
- Cabe en GPU consumer: sí, por tamaño de parámetros; el repo ocupa 0,3 GB.
- Opciones de despliegue: bundle Python propio (`laya_face.v2.FaceModelV2`), no compatible con `transformers.AutoModel`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas de modelos generativos y no aplican a esta tarea).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado en la información disponible comparativas con otros modelos de verificación facial. El propio autor referencia el checkpoint base `openai/clip-vit-base-patch16` (86 M de parámetros, licencia MIT), pero no ofrece métricas comparativas frente a otros sistemas de verificación como ArcFace o FaceNet. Datos comparativos: no disponible.

## Limitaciones y advertencias

- Modelo de investigación preliminar; el autor lo declara no aprobado para producción biométrica, vigilancia ni identificación de personas en espacios públicos.
- La política de decisión está ajustada en desarrollo, no aprobada para despliegue; el objetivo de FMR del 1% es empírico y no garantiza el mismo comportamiento en otras poblaciones o datasets.
- Las probabilidades están calibradas para pares balanceados; el despliegue requiere datos representativos, prevalencia de coincidencias adecuada, validación y salvaguardas.
- Robustez demográfica, detección de vitalidad (liveness) y resistencia a ataques de presentación no establecidas.
- Rendimiento end-to-end en medios adversos no evaluado.
- Una coincidencia visual no establece implicación criminal ni asociación adversa alguna; cualquier uso consecuente requiere revisión humana cualificada con salvaguardas legales y organizativas.
- Requiere recortes alineados de 112x112 RGB como entrada; la detección y alineación no están incluidas y los recortes inválidos provocan error.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos (FMR 0,63% y FNMR 3,80% en DCF con la política incluida).
- Licencia de los pesos y del dataset sintético sin verificar; la implementación propia se declara Apache-2.0 y el CLIP base es MIT, pero no hay licencia permisiva confirmada para los pesos derivados.
- Solo etiqueta de idioma `en`; sin capacidades de texto, tool calling ni agentes.
- El repositorio no distribuye imágenes de entrenamiento ni de benchmark, etiquetas privadas ni credenciales.

## Enlaces

- HuggingFace: https://huggingface.co/leloss/LayaFace-DCF-HSF.v0.20261029
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch16
- Paper CLIP (referenciado en tags): https://arxiv.org/abs/2103.00020
- Paper DCFace (referenciado en tags): https://arxiv.org/abs/2304.07060
- Paper de calibración de temperatura (referenciado en tags): https://arxiv.org/abs/1706.04599
