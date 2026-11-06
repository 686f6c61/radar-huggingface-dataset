# leloss/LayaFace-HSF.v0.20261028

## Resumen

LayaFace-HSF.v0.20261028 es un checkpoint de investigación para verificación facial simétrica de dos imágenes (face verification), desarrollado por el usuario leloss. No es un modelo generativo ni un LLM: se trata de un adaptador de un codificador visual CLIP ViT-B/16 afinado para decidir si dos recortes faciales alineados corresponden a la misma persona. El modelo parte de `openai/clip-vit-base-patch16` y añade una cabeza de comparación de pares, con un total de 86.193.153 parámetros.

La relevancia del checkpoint es metodológica: explora el ajuste de la tarea exclusivamente con datos sintéticos (7.983 identidades sintéticas de HSFace10K, 374.382 imágenes) manteniendo los benchmarks reales como conjunto de test. El bundle incluye una política de calibración ajustada (temperatura y umbral) y métricas en formato legible por máquina, lo que facilita la reproducibilidad en estudios controlados de verificación por pares.

Es una release preliminar de investigación, con licencia no permissiva verificada y uso restringido a estudios con consentimiento. No está aprobada para identificación biométrica en producción, vigilancia ni decisiones autónomas sobre medios adversos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/16 (codificador visual compartido) + cabeza de comparación de pares (1536 -> 256 -> 1, GELU) |
| Parametros totales | 86.193.153 (incluye 393.729 en la cabeza de pares) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto; entrada: dos recortes 112x112 RGB redimensionados a 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (metadatos del repositorio); la tarea es de visión, no lingüística |
| Licencia | no disponible (implementación del proyecto Apache-2.0; CLIP original MIT; términos de los pesos adaptados y del dataset sintético sin verificar) |
| Formato de pesos | safetensors (bundle personalizado, no `transformers.AutoModel`) |

## Arquitectura y entrenamiento

El modelo reutiliza un codificador visual CLIP ViT-B/16 compartido entre las dos imágenes de entrada. Cada recorte facial alineado de 112x112 se redimensiona de forma independiente a 224x224 y se normaliza con las estadísticas de CLIP. De cada imagen se extrae el token de clase post-layernorm, de 768 dimensiones y normalizado en L2. Sobre esos dos embeddings se construyen características simétricas `[sqrt(768) * abs(a-b), 768 * (a*b)]`, que alimentan una cabeza `1536 -> 256 -> 1` con activación GELU. La simetría garantiza que intercambiar las dos entradas deja el logit sin cambios. La salida incluye decisión booleana de coincidencia, logit crudo y probabilidad calibrada por temperatura.

El ajuste de la tarea (variante F1) adapta tanto el codificador visual como la cabeza de pares, con un presupuesto registrado de 8 épocas y selección en la época 7 por mínima NLL cruda en la partición Stop. El entrenamiento usa entropía cruzada binaria por pares con balance de clases sobre datos sintéticos de HSFace10K. Las particiones Fit, Stop, Select, Calibrate y Threshold son disjuntas por identidad, y todos los pares de benchmark quedan fuera del ajuste. La política incluida fija temperatura 1,29814426677 y umbral de logit crudo -0,719679236412, ajustado este último sobre la partición Threshold con un objetivo de FMR del 1% y 10.000 pares no coincidentes.

## Capacidades

- Verificación facial simétrica de dos imágenes: decide si dos recortes alineados corresponden a la misma persona.
- Salida de logit crudo y probabilidad de coincidencia calibrada por temperatura (`sigmoid(raw_logit / temperature)`).
- Invariancia al orden de las entradas (el logit no cambia al intercambiar referencia y sonda).
- Extracción de embeddings de 768 dimensiones normalizados en L2, cacheables para comparaciones repetidas contra una misma referencia.
- Ejecución en CPU o CUDA según la instalación de PyTorch.
- No incluye detección ni alineación facial: ambas son operaciones previas obligatorias.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto ni capacidades multimodales más allá de la verificación de pares.

## Casos de uso

- Estudio controlado de verificación por pares: comparar recortes alineados de sujetos con consentimiento para medir FMR y FNMR bajo un umbral fijado a un objetivo del 1%.
- Investigación sobre entrenamiento con datos sintéticos: evaluar la transferencia de un ajuste solo sintético a benchmarks reales (LFW, CFP-FP, AgeDB-30, CALFW, CPLFW).
- Reidentificación en conjuntos cerrados de laboratorio: usar los embeddings de 768 dimensiones cacheados para comparar una sonda contra múltiples referencias dentro de un dataset de estudio.
- Auditoría de calibración: analizar ECE y Brier del checkpoint con la política incluida para estudiar el desajuste entre probabilidades calibradas y precisión observada.
- Reproducción de resultados: el bundle incluye `evaluation.json` y código Python offline, lo que permite reproducir las métricas publicadas sin dependencias de red más allá de la descarga inicial.
- Docencia y experimentación con cabezas de comparación simétricas: servir de base para estudiar el efecto de la simetría `[sqrt(768)*abs(a-b), 768*(a*b)]` frente a concatenaciones asimétricas.
- Pruebas de robustez demográfica en entornos de investigación: medir el comportamiento del modelo en subpoblaciones de un dataset de estudio, siempre con revisión humana.

## Benchmarks y rendimiento

Resultados de esta semilla concreta (no son las medias de tres semillas del paper). Las métricas sintéticas usan la política de desarrollo incluida; los porcentajes se expresan en % salvo AUC y Brier.

| Benchmark | Macro F1 | Accuracy | FMR | FNMR | AUC | ECE | Brier |
|---|---:|---:|---:|---:|---:|---:|---:|
| DCF | 90,68 | 90,68 | 9,10 | 9,53 | 0,9706 | 3,68 | 0,0704 |
| FLUX | 84,21 | 84,58 | 30,83 | 0,00 | 0,9998 | 10,36 | 0,1076 |

Precisión en benchmarks de caras reales con protocolo estándar de diez pliegues (umbral ajustado en nueve pliegues y evaluado en el restante; no es la precisión del umbral sintético incluido):

| Benchmark real | Precisión diez pliegues (%) |
|---|---:|
| lfw | 98,75 |
| cfp_fp | 93,13 |
| agedb_30 | 89,32 |
| calfw | 92,05 |
| cplfw | 87,50 |
| Media | 92,15 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 86,2 M de parámetros en fp32 el peso ronda los 0,34 GB, por lo que la huella es mínima y el cuello de botella es el cómputo del ViT-B/16 por par de imágenes.
- GPU recomendadas: cualquier GPU CUDA compatible con PyTorch; el modelo es lo bastante pequeño para GPUs de consumo.
- Cabe en GPU de consumo: sí, incluidas RTX 3060, RTX 4060, RTX 4090 y similares, así como en CPU para volúmenes bajos.
- Opciones de despliegue: bundle Python propio (`laya_face.v2.FaceModelV2`) cargado offline tras `snapshot_download`; no es compatible con vLLM, llama.cpp, Ollama ni TGI por no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. El modelo permite cachear el embedding del codificador para comparaciones repetidas contra una referencia, lo que reduce el coste a una pasada del ViT por sonda más la cabeza de pares.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LayaFace-HSF.v0.20261028 | 86,2 M | dos recortes 112x112 -> 224x224 | Verificación facial por pares | no disponible (términos de pesos sin verificar) | Hugging Face, bundle offline |
| openai/clip-vit-base-patch16 (base) | ~86 M (ViT-B/16) | imagen 224x224 | Embeddings imagen-texto | MIT | Hugging Face, `transformers` |
| ArcFace / reconocimiento facial clásico | no disponible | recortes alineados | Verificación/identificación | variable según implementación | múltiples repositorios |

La comparación directa con ArcFace u otros modelos de verificación no está disponible en la información proporcionada. El modelo base CLIP ViT-B/16 se incluye como referencia por ser el punto de partida del ajuste.

## Limitaciones y advertencias

- No aprobado para identificación biométrica en producción, decisiones autónomas sobre medios adversos, vigilancia ni identificación de personas en espacios públicos.
- Una coincidencia visual no establece implicación criminal ni asociación adversa alguna.
- Los resultados se refieren a pares fijos de benchmark y no garantizan robustez en una nueva población de despliegue.
- Robustez demográfica, detección de vida (liveness), resistencia a ataques de presentación y rendimiento end-to-end en medios adversos no han sido establecidos.
- La política de calibración es "ajustada en desarrollo, no aprobada para despliegue"; el objetivo de FMR del 1% es un punto operativo empírico, no una garantía.
- Las probabilidades están calibradas para pares balanceados; el despliegue requiere datos representativos, prevalencia de coincidencias, validación y salvaguardas.
- El ajuste solo sintético no implica que el preentrenamiento de CLIP ni el generador sintético no hayan visto fotografías reales.
- Un único par de CPLFW contiene una imagen constante repetida en 13 pares, contados como no coincidencias por la evaluación compartida.
- Los recortes inválidos provocan un error durante la inferencia ordinaria; la detección y alineación deben realizarse aguas arriba.
- No es un `transformers.AutoModel`; requiere revisar el código Python incluido antes de importarlo.
- Licencia de los pesos adaptados y del dataset sintético sin verificar; no se puede asumir uso comercial permissivo.
- El repositorio no distribuye imágenes de entrenamiento ni de benchmark, etiquetas privadas ni credenciales.

## Enlaces

- Hugging Face: https://huggingface.co/leloss/LayaFace-HSF.v0.20261028
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch16
- Paper CLIP (referencia en tags): https://arxiv.org/abs/2103.00020
- Paper referenciado en tags: https://arxiv.org/abs/2304.07060
- Paper referenciado en tags: https://arxiv.org/abs/1706.04599
