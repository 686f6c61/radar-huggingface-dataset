# leloss/LayaFace-DCF.v0.20261028

## Resumen

LayaFace-DCF.v0.20261028 es un checkpoint de investigación para verificación facial simétrica de dos imágenes, desarrollado por el usuario leloss. No es un modelo generativo ni un LLM: se trata de un fine-tune del encoder visual de CLIP ViT-B/16 sobre el que se añade una cabeza de comparación de pares, con el objetivo de decidir si dos recortes faciales alineados corresponden a la misma persona. Su relevancia radica en que aborda la verificación facial con adaptación de tarea exclusivamente sobre datos sintéticos (DCFace), lo que resulta interesante para estudiar hasta qué punto el entrenamiento sintético transfiere a benchmarks reales.

El modelo parte de `openai/clip-vit-base-patch16` y adapta tanto el encoder como la cabeza de comparación (variante F1) durante nueve épocas, seleccionando el checkpoint por mínima NLL en la partición Stop. El bundle incluye además una política de calibración ajustada en desarrollo (temperatura y umbral), pero el autor advierte explícitamente que no está aprobada para despliegue.

La ficha describe un artefacto de investigación con 86,2 M de parámetros, entradas de 112x112 RGB, embeddings L2-normalizados de 768 dimensiones y salida booleana de coincidencia más probabilidad calibrada. La licencia de los pesos adaptados no está verificada y el autor no afirma permiso de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-B/16 (encoder visual CLIP) + cabeza de comparación de pares (MLP GELU) |
| Parametros totales | 86.193.153 (incluye 393.729 en la cabeza de pares) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión por pares, no texto) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | Inglés (etiqueta `en`; el modelo no procesa texto, la etiqueta es administrativa) |
| Licencia | No disponible para los pesos adaptados; implementación del proyecto declarada Apache-2.0; CLIP original MIT; licencia de DCFace sin verificar |
| Formato de pesos | Safetensors (bundle personalizado, no `transformers.AutoModel`) |

## Arquitectura y entrenamiento

El modelo reutiliza un encoder compartido CLIP ViT-B/16 inicializado desde `openai/clip-vit-base-patch16`. Cada una de las dos imágenes de entrada es un recorte facial alineado de 112x112 RGB que se redimensiona de forma independiente a 224x224 y se normaliza con las estadísticas de CLIP. De cada imagen se extrae el token de clase post-layernorm, L2-normalizado, de 768 dimensiones. Sobre esos dos vectores se construyen características simétricas `[sqrt(768) * abs(a-b), 768 * (a*b)]` que alimentan una cabeza `1536 -> 256 -> 1` con activación GELU. La simetría garantiza que intercambiar las dos entradas deja el logit sin cambios, propiedad deseable en verificación facial.

El entrenamiento de adaptación de tarea usa 8.000 identidades sintéticas de DCFace y 408.000 imágenes, con entropía cruzada binaria por pares y balanceo de clases. La variante F1 adapta el encoder visual completo y la cabeza de pares, con un presupuesto registrado de nueve épocas; este checkpoint se seleccionó en la época 8 por mínima NLL bruta en la partición Stop. Las particiones Fit, Stop, Select, Calibrate y Threshold son disjuntas por identidad, y DCF, FLUXSynID y los cinco benchmarks de caras reales quedan fuera de la adaptación. El autor advierte que la adaptación solo con datos sintéticos no implica que el preentrenamiento de CLIP ni el generador sintético no hayan visto fotografías reales.

El bundle incluye una política de calibración ajustada en desarrollo: temperatura 1,24857505418, umbral de logit bruto -0,00504078343511, probabilidad de coincidencia `sigmoid(raw_logit / temperature)` y decisión de coincidencia cuando `raw_logit >= threshold`. La temperatura se ajustó solo en Calibrate y el umbral solo en Threshold, con un objetivo de FMR del 1 % sobre 10.000 pares no coincidentes. El autor subraya que ese 1 % es un punto operativo empírico de desarrollo, no una garantía sobre otros conjuntos o poblaciones, y que las probabilidades están calibradas para pares balanceados.

## Capacidades

- Verificación facial uno-a-uno sobre pares de recortes alineados de 112x112 RGB.
- Salida de decisión booleana de coincidencia, logit bruto y probabilidad de misma persona escalada por temperatura.
- Invariancia al orden de las entradas: intercambiar referencia y sonda no altera el logit.
- Extracción de embeddings de 768 dimensiones que pueden cachearse para comparaciones repetidas contra una misma referencia.
- Ejecución offline una vez descargado el bundle (la descarga solo ocurre en `snapshot_download`).
- Soporte de CPU y CUDA mediante `device="cpu"` o `device="cuda"`.
- No incluye detección ni alineación de rostros: son operaciones aguas arriba que el usuario debe aportar.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general ni audio.

## Casos de uso

- Estudio controlado de transferencia sintético-real: usar el checkpoint para medir cuánto rinde un modelo adaptado solo con DCFace sobre benchmarks reales como LFW, CFP-FP o AgeDB-30, comparando con baselines entrenados con datos reales.
- Evaluación académica de calibración: aprovechar la política incluida (temperatura y umbral) para analizar ECE y Brier en pares balanceados y estudiar el efecto del umbral a FMR del 1 %.
- Prototipado de verificación con consentimiento: en un entorno de investigación con sujetos que han dado consentimiento, comparar recortes alineados de referencia y sonda para validar el pipeline de preprocesado y la lógica de decisión.
- Auditoría de sesgo demográfico: ejecutar el modelo sobre subconjuntos etiquetados por atributos para documentar disparidades de FMR y FNMR, dado que el autor no ha establecido robustez demográfica.
- Análisis de robustez cross-age y cross-pose: usar los resultados en AgeDB-30 (85,77 %) y CPLFW (82,55 %) como referencia para estudiar la degradación frente a variaciones de edad y pose.
- Caché de embeddings para búsqueda uno-a-uno: precomputar el embedding de 768 dimensiones de una referencia y reutilizarlo para comparar múltiples sondas, reduciendo coste en experimentos por lotes.
- Reproducibilidad de investigación: el bundle incluye `evaluation.json` con métricas y detalles de política, lo que facilita replicar el pipeline de evaluación en entornos controlados.

## Benchmarks y rendimiento

Resultados de este seed concreto (no son las medias de tres seeds del paper). Las métricas sintéticas usan la política ajustada en desarrollo; ECE es de diez bins sobre confianza de clase predicha. Porcentajes salvo AUC y Brier.

| Benchmark | Macro F1 | Accuracy | FMR | FNMR | AUC | ECE | Brier |
|---|---:|---:|---:|---:|---:|---:|---:|
| DCF | 98,25 | 98,25 | 0,93 | 2,57 | 0,9992 | 0,31 | 0,0129 |
| FLUX | 98,45 | 98,45 | 3,07 | 0,04 | 0,9998 | 0,97 | 0,0125 |

La accuracy en caras reales usa el protocolo estándar de diez folds de cada conjunto: se ajusta un umbral sobre nueve folds y se evalúa el restante, con pesos fijos. No es la accuracy del umbral sintético incluido.

| Benchmark real | Accuracy diez folds (%) |
|---|---:|
| LFW | 98,40 |
| CFP-FP | 92,87 |
| AgeDB-30 | 85,77 |
| CALFW | 89,42 |
| CPLFW | 82,55 |
| Media | 89,80 |

Nota del autor: una imagen constante de CPLFW aparece en 13 pares y la evaluación compartida los cuenta como no coincidencias. Las predicciones de benchmark se sellaron antes de puntuar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 86,2 M de parámetros en fp32 el peso ronda los 0,35 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con CUDA compatible con PyTorch; el autor no especifica modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, por tamaño de parámetros; el autor no publica requisitos oficiales.
- Despliegue: bundle Python personalizado (`laya_face.v2.FaceModelV2`), no compatible con `transformers.AutoModel`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.
- Instalación: `pip install -r requirements.txt` desde el repositorio; carga offline tras `snapshot_download`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo estructural:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LayaFace-DCF.v0.20261028 | 86,2 M | No aplica | No verificada (pesos); Apache-2.0 declarada para implementación | HuggingFace, bundle personalizado |
| CLIP ViT-B/16 (base) | ~86 M (encoder) | No aplica | MIT | HuggingFace, transformers |
| Alternativas de verificación facial | No disponible | No disponible | No disponible | No disponible |

El autor indica que la variante DCF rinde por debajo de baselines dedicados de reconocimiento facial en benchmarks reales cross-age y cross-pose, pero no cita modelos concretos ni cifras comparativas.

## Limitaciones y advertencias

- No aprobado para identificación biométrica en producción, decisiones autónomas sobre medios adversos, vigilancia ni identificación de personas en espacios públicos.
- Una coincidencia visual no establece implicación criminal ni asociación adversa alguna.
- Robustez demográfica, detección de vivacidad, resistencia a ataques de presentación y rendimiento end-to-end en medios adversos no han sido establecidos.
- Rendimiento inferior a baselines dedicados en cross-age y cross-pose (AgeDB-30 85,77 %, CPLFW 82,55 %).
- El umbral del 1 % de FMR es un punto de desarrollo empírico, no una garantía sobre otras poblaciones; las probabilidades están calibradas para pares balanceados.
- La política incluida es "ajustada en desarrollo, no aprobada para despliegue"; se requiere validación con datos representativos y salvaguardas.
- No incluye detección ni alineación; los recortes inválidos lanzan error en inferencia ordinaria.
- La adaptación solo con datos sintéticos no garantiza ausencia de exposición a fotografías reales en el preentrenamiento de CLIP ni en el generador.
- Licencia de los pesos adaptados no verificada; términos de DCFace y de liberación de pesos sin confirmar; no se afirma permiso de uso comercial.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos según el umbral y la población.
- Cualquier uso consecuente requiere revisión por un humano cualificado con salvaguardas legales y organizativas.
- El repositorio no distribuye imágenes de entrenamiento o benchmark, etiquetas privadas ni credenciales.

## Enlaces

- HuggingFace: https://huggingface.co/leloss/LayaFace-DCF.v0.20261028
- CLIP (paper): https://arxiv.org/abs/2103.00020
- DCFace (paper): https://arxiv.org/abs/2304.07060
- Temperature scaling / calibración (paper): https://arxiv.org/abs/1706.04599
- CLIP ViT-B/16 (modelo base): https://huggingface.co/openai/clip-vit-base-patch16
