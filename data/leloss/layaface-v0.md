# leloss/LayaFace.v0

## Resumen

LayaFace.v0 es un checkpoint de investigación para verificación facial simétrica de dos imágenes, desarrollado por el usuario leloss. No es un modelo generativo de lenguaje ni un modelo multimodal de propósito general: es un verificador biométrico que, dadas dos recortes faciales alineados, decide si corresponden a la misma persona. Se construye sobre el codificador visual de `openai/clip-vit-base-patch16` mediante fine-tuning supervisado con datos sintéticos.

El modelo adapta completamente el codificador CLIP ViT-B/16 y añade una cabeza de comparación que procesa dos embeddings de 768 dimensiones con características simétricas y una MLP `1536 -> 256 -> 1`. Con 86,19 millones de parámetros totales (de los cuales 393.729 pertenecen a la cabeza de pares), el checkpoint es ligero y desplegable en hardware modesto.

Su relevancia es metodológica: demuestra que la adaptación de tarea exclusivamente con datos sintéticos (7.983 identidades y 374.382 imágenes del conjunto HSFace10K) puede alcanzar una precisión media del 92,15 % en cinco benchmarks de caras reales bajo protocolo de diez particiones. Es una release preliminar de investigación, no aprobada para producción biométrica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/16 (codificador visual) + cabeza de pares MLP |
| Parámetros totales | 86.193.153 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de dos imágenes 112x112) |
| Tipos de cuantización | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | en (metadatos de la model card; la tarea es visual, no lingüística) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bundle personalizado, no `transformers.AutoModel`) |

## Arquitectura y entrenamiento

El modelo reutiliza el codificador ViT-B/16 de CLIP, inicializado desde `openai/clip-vit-base-patch16`. Cada una de las dos imágenes de entrada se procesa de forma independiente: recorte facial alineado de 112x112 RGB, redimensionado a 224x224 y normalización con estadísticas de CLIP. Se extrae el token de clase post-layernorm, de 768 dimensiones, y se normaliza L2. Sobre ambos embeddings se construyen características simétricas `[sqrt(768) * abs(a-b), 768 * (a*b)]` de 1536 dimensiones, que alimentan una cabeza `1536 -> 256 -> 1` con activación GELU. La simetría garantiza que intercambiar las dos entradas deja el logit invariante. La salida incluye decisión booleana de coincidencia, logit crudo y probabilidad calibrada por temperatura.

El entrenamiento de adaptación de tarea (variante F1) ajusta tanto el codificador visual como la cabeza de pares con entropía cruzada binaria por pares balanceada por clase, sobre 7.983 identidades sintéticas HSFace10K y 374.382 imágenes, con un presupuesto registrado de 8 épocas. El checkpoint se seleccionó en la época 7 por mínima NLL cruda en la partición Stop. Las particiones Fit, Stop, Select, Calibrate y Threshold son disjuntas por identidad, y todos los pares de benchmark quedan fuera de la adaptación. La política ajustada incluye temperatura `1.44162515772` y umbral de logit crudo `-0.879037499428`, con probabilidad `sigmoid(raw_logit / temperature)` y decisión `raw_logit >= threshold`; el umbral se fijó sobre 10.000 pares no coincidentes a una FMR objetivo del 1 %.

## Capacidades

- Verificación facial de pares: decide si dos recortes faciales alineados corresponden a la misma persona.
- Salida de logit crudo y probabilidad calibrada por temperatura, además de la decisión booleana.
- Invariancia al orden de las entradas gracias a la construcción simétrica de características.
- Caché del embedding del encoder para comparaciones repetidas contra una referencia.
- Inferencia offline una vez descargado el bundle (la descarga solo ocurre en `snapshot_download`).
- Ejecución en CPU o CUDA según la instalación de PyTorch.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión general, audio ni modo thinking.

## Casos de uso

- Investigación en verificación biométrica con datos sintéticos: sirve como punto de comparación reproducible para estudiar la transferencia de adaptación sintética a caras reales, dado que el checkpoint, la política y las métricas están documentados.
- Control de acceso en entornos de laboratorio con consentimiento: verificación uno-a-uno contra una referencia cacheada, adecuada por su bajo coste computacional y su naturaleza offline.
- Deduplicación de rostros en conjuntos de datos de investigación: comparación por pares sobre recortes prealineados para detectar identidades repetidas antes del etiquetado.
- Validación de pipelines de alineación facial: al requerir recortes 112x112 alineados y lanzar error con recortes inválidos, ayuda a detectar fallos en etapas previas de detección y landmarks.
- Estudio de calibración y umbrales operativos: la temperatura y el umbral incluidos permiten analizar el efecto de distintos puntos de operación (FMR objetivo) en un dominio controlado.
- Prototipado de sistemas de verificación en CPU: con 86 millones de parámetros y pesos en safetensors, es viable en máquinas sin GPU para pruebas de concepto.
- Evaluación comparativa de encoders CLIP en tareas biométricas: permite medir cuánto aporta el fine-tuning completo frente al codificador base congelado.

## Benchmarks y rendimiento

Métricas de este seed con la política de desarrollo ajustada (porcentajes salvo AUC y Brier):

| Benchmark | Macro F1 | Accuracy | FMR | FNMR | AUC | ECE | Brier |
|---|---:|---:|---:|---:|---:|---:|---:|
| DCF | 91,43 | 91,43 | 8,23 | 8,90 | 0,9717 | 3,37 | 0,0692 |
| FLUX | 85,51 | 85,80 | 28,40 | 0,00 | 0,9999 | 8,79 | 0,0911 |

Precisión en caras reales con protocolo estándar de diez particiones (umbral ajustado en nueve particiones y evaluado en la restante; no es la precisión del umbral sintético incluido):

| Benchmark real | Precisión diez particiones (%) |
|---|---:|
| lfw | 98,65 |
| cfp_fp | 93,47 |
| agedb_30 | 88,98 |
| calfw | 92,58 |
| cplfw | 87,07 |
| Media | 92,15 |

El checkpoint siguiente en el ranking queda a 0,001905 puntos porcentuales, por lo que la superioridad no es estadísticamente significativa. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 86,19 millones de parámetros en precisión completa (fp32) el peso ronda los 345 MB, y en fp16 aproximadamente 172 MB, más memoria de activaciones para dos imágenes de 224x224.
- GPU recomendadas: cualquier GPU con soporte CUDA y PyTorch compatible; no se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna por tamaño de pesos; también funciona en CPU según el ejemplo de uso (`device="cpu"`).
- Despliegue: bundle Python personalizado (`laya_face.v2.FaceModelV2`), no compatible con `transformers.AutoModel`, vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de verificación facial ni datos de alternativas como ArcFace, Facenet o variantes de CLIP adaptadas a biometría.

## Limitaciones y advertencias

- No aprobado para producción biométrica: es una release preliminar de investigación para estudios controlados y con consentimiento.
- La política incluida está ajustada en desarrollo, no aprobada para despliegue; el objetivo de FMR del 1 % es un punto operativo empírico, no una garantía sobre otras poblaciones.
- Las probabilidades están calibradas para pares balanceados; el despliegue real requiere datos representativos, prevalencia de coincidencias y validación propia.
- El umbral incluido es sintético; las precisiones en caras reales usan umbrales específicos por benchmark y no son comparables directamente con él.
- La adaptación sintética no implica que CLIP ni el generador sintético no hayan visto fotografías reales durante su preentrenamiento.
- La selección del checkpoint canónico se hizo tras observar resultados de benchmark, por lo que no constituye un test virgen adicional.
- Riesgo de alucinación no aplica (no es generativo); el riesgo principal es la decisión errónea de coincidencia o no coincidencia.
- Sesgos demográficos: no documentados en la información disponible, pero probables en cualquier verificador facial entrenado con datos sintéticos.
- Requiere detección y alineación facial upstream, no incluidas; los recortes inválidos lanzan error en inferencia ordinaria.
- Una imagen constante de CPLFW aparece en 13 pares y se cuenta como no coincidencia en la evaluación compartida.
- Licencia no disponible: verificar antes de cualquier uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leloss/LayaFace.v0
- Checkpoint versionado de origen: https://huggingface.co/leloss/LayaFace-HSF.v0.20261030
- Modelo base CLIP ViT-B/16: https://huggingface.co/openai/clip-vit-base-patch16
- Paper de CLIP (arXiv:2103.00020): https://arxiv.org/abs/2103.00020
- Paper referenciado (arXiv:2304.07060): https://arxiv.org/abs/2304.07060
- Paper referenciado (arXiv:1706.04599): https://arxiv.org/abs/1706.04599
