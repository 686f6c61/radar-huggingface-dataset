# leloss/LayaFace-DCF.v0.20261030

## Resumen

LayaFace-DCF.v0.20261030 es un checkpoint de investigación para verificación facial simétrica de dos imágenes, desarrollado por el autor leloss. No es un modelo generativo de lenguaje ni un `transformers.AutoModel`, sino un bundle personalizado que combina un codificador de visión CLIP ViT-B/16 compartido (inicializado desde `openai/clip-vit-base-patch16`) con una cabeza de comparación de pares. El modelo recibe dos recortes faciales alineados de 112x112 píxeles RGB, los redimensiona a 224x224 y emite una decisión booleana de coincidencia, un logit crudo y una probabilidad calibrada por temperatura de que ambas imágenes correspondan a la misma persona.

La relevancia de este checkpoint es doble: por un lado, explora el ajuste fino de un codificador CLIP con datos sintéticos (8.000 identidades DCFace, 408.000 imágenes) para una tarea biométrica concreta; por otro, publica de forma transparente la política de calibración y umbral utilizada (temperatura 1,22756791506, umbral de logit 0,531010448933 a una tasa objetivo de falsos positivos del 1 %). El autor advierte explícitamente que esa política está ajustada en desarrollo y no aprobada para despliegue.

Con 86.193.153 parámetros totales (incluida una cabeza de pares de 393.729 parámetros) y un tamaño de repositorio de 0,3 GB, el modelo está pensado para estudios controlados de verificación por pares con consentimiento. Rinde muy bien en pares sintéticos (F1 macro del 98,12 % en DCF y 98,41 % en FLUX) pero queda por debajo de las líneas base dedicadas de reconocimiento facial en benchmarks reales de edad y pose (media del 89,50 % en cinco conjuntos). La licencia de los pesos adaptados no está verificada y no se afirma permiso de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión CLIP ViT-B/16 con cabeza de comparación de pares (GELU 1536 -> 256 -> 1) |
| Parametros totales | 86.193.153 (incluye 393.729 de la cabeza de pares) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje); entrada de dos recortes de 112x112 RGB redimensionados a 224x224 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; el modelo no procesa texto) |
| Licencia | no disponible; implementación propia identificada como Apache-2.0, CLIP subyacente MIT, licencia de pesos adaptados y de DCFace sin verificar |
| Formato de pesos | safetensors (bundle personalizado, no `transformers.AutoModel`) |

## Arquitectura y entrenamiento

El modelo reutiliza un codificador de visión CLIP ViT-B/16 compartido entre las dos entradas, inicializado desde `openai/clip-vit-base-patch16`. Cada recorte facial alineado de 112x112 se redimensiona de forma independiente a 224x224 y se normaliza con las estadísticas de CLIP. De cada imagen se extrae un embedding de clase post-layernorm de 768 dimensiones, que se normaliza en L2. Sobre esos embeddings se construyen características simétricas `[sqrt(768) * abs(a-b), 768 * (a*b)]` de 1536 dimensiones, que alimentan una cabeza GELU con estructura 1536 -> 256 -> 1. La simetría garantiza que intercambiar las dos entradas deja el logit sin cambios.

La adaptación a la tarea se realizó con 8.000 identidades sintéticas de DCFace y 408.000 imágenes, usando entropía cruzada binaria por pares con balance de clases. La variante DCF entrena con adaptación completa del codificador y de la cabeza de comparación (configuración F1), con semilla 20261030 y un presupuesto registrado de nueve épocas; el checkpoint se seleccionó en la época 7 por la NLL cruda mínima en la partición Stop. Las particiones Fit, Stop, Select, Calibrate y Threshold son disjuntas por identidad, y DCF, FLUXSynID y los cinco benchmarks de caras reales quedaron fuera de la adaptación. El autor advierte que la adaptación solo con datos sintéticos no implica que el preentrenamiento de CLIP ni el generador sintético no hayan visto fotografías reales. La temperatura se ajustó únicamente en Calibrate y el umbral únicamente en Threshold, con 10.000 pares no coincidentes y una tasa objetivo de falsos positivos del 1 %.

## Capacidades

- Verificación facial de pares: decide si dos recortes alineados de 112x112 corresponden a la misma persona.
- Salida triple: decisión booleana de coincidencia, logit crudo y probabilidad de misma persona calibrada por temperatura.
- Simetría estricta: el logit no cambia al intercambiar las dos imágenes de entrada.
- Embeddings de 768 dimensiones L2-normalizados, cacheables para comparaciones repetidas contra una referencia.
- Inferencia offline una vez descargado el bundle mediante `snapshot_download`.
- Ejecución en CPU o en CUDA con una instalación compatible de PyTorch.
- No incluye detección ni alineación de rostros: son operaciones previas obligatorias.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo thinking, visión general, audio ni capacidades multimodales fuera del par facial.

## Casos de uso

- Estudio controlado de verificación por pares con consentimiento: el modelo permite comparar pares de recortes alineados y obtener logit y probabilidad calibrada, adecuado para investigación académica con protocolos de validación propios.
- Evaluación comparativa de calibración: al publicar temperatura y umbral, sirve para reproducir y auditar la política de decisión en conjuntos sintéticos como DCF y FLUXSynID.
- Prototipado de pipelines biométricos: integrable como etapa de comparación tras un detector y alineador externos, con caché del embedding de referencia para reducir cómputo en comparaciones repetidas.
- Análisis de robustez demográfica en laboratorio: útil para medir la caída de precisión en conjuntos reales de edad y pose (agedb_30, calfw, cplfw) antes de plantear cualquier uso sensible.
- Docencia y formación en biometría: su tamaño contenido (0,3 GB, 86 millones de parámetros) y su API mínima permiten ejecutarlo en CPU y explicar el flujo completo de verificación facial.
- Pruebas de integración en sistemas de control de acceso simulados: con datos sintéticos y salvaguardas humanas, para validar umbrales y tasas de error antes de cualquier decisión con consecuencias.
- Investigación sobre simetría de funciones de comparación: la construcción `[sqrt(768) * abs(a-b), 768 * (a*b)]` es un punto de partida reproducible para estudiar cabezas de pares invariantes al orden.

## Benchmarks y rendimiento

Resultados de esta semilla concreta, no las medias de tres semillas del artículo. Las métricas sintéticas usan la política ajustada en desarrollo. ECE es de diez bins sobre la confianza de la clase predicha. Porcentajes salvo AUC y Brier.

| Benchmark | Macro F1 | Accuracy | FMR | FNMR | AUC | ECE | Brier |
|---|---:|---:|---:|---:|---:|---:|---:|
| DCF | 98,12 | 98,12 | 1,03 | 2,73 | 0,9990 | 0,44 | 0,0123 |
| FLUX | 98,41 | 98,41 | 3,14 | 0,04 | 0,9998 | 1,28 | 0,0138 |

La precisión en caras reales emplea el protocolo estándar de diez pliegues de cada conjunto: se ajusta un umbral de puntuación en nueve pliegues y se evalúa el restante. No es la precisión del umbral sintético incluido. Los pesos permanecen fijos durante toda la evaluación.

| Benchmark real | Accuracy diez pliegues (%) |
|---|---:|
| lfw | 98,63 |
| cfp_fp | 92,86 |
| agedb_30 | 85,12 |
| calfw | 88,65 |
| cplfw | 82,25 |
| Media | 89,50 |

Una imagen constante de CPLFW aparece en 13 pares; la evaluación compartida los cuenta como no coincidencias. Los recortes inválidos generan un error durante la inferencia ordinaria. Las predicciones de benchmark se sellaron antes de puntuar. Las métricas legibles por máquina y los detalles de la política están en `evaluation.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 86 millones de parámetros en fp32 el peso ronda los 0,35 GB, por lo que la huella de memoria es modesta y dominada por activaciones de ViT-B/16 a 224x224.
- GPU recomendadas: cualquier GPU CUDA compatible con PyTorch; el autor solo documenta `device="cuda"` sin modelos concretos.
- Cabe en GPU de consumo: sí, por tamaño; no se especifican modelos concretos ni requisitos mínimos.
- Ejecución en CPU: soportada explícitamente con `device="cpu"`.
- Opciones de despliegue: bundle Python propio (`laya_face.v2.FaceModelV2`), no compatible con vLLM, llama.cpp, Ollama ni TGI al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.
- El bundle se carga offline; la descarga ocurre solo en `snapshot_download`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LayaFace-DCF.v0.20261030 | 86,19 M | dos recortes 112x112 -> 224x224 | Media 89,50 % en cinco benchmarks reales; F1 98,12 % en DCF | no verificada | HuggingFace, 0 descargas, 0 likes |
| openai/clip-vit-base-patch16 | no disponible en la información | imagen 224x224 | no disponible | MIT | HuggingFace |
| Líneas base dedicadas de reconocimiento facial | no disponible en la información | no disponible | superiores según el autor en edad y pose cruzadas | no disponible | no disponible |

El autor indica que esta variante, pese a su buen rendimiento en pares sintéticos, queda por debajo de las líneas base dedicadas de reconocimiento facial en benchmarks reales de edad y pose cruzadas. No se aportan nombres ni cifras de esos modelos comparables.

## Limitaciones y advertencias

- No aprobado para identificación biométrica en producción, decisiones adversas autónomas, vigilancia ni identificación de personas en espacios públicos.
- Una coincidencia visual no establece implicación criminal ni asociación adversa alguna.
- Rendimiento inferior a líneas base dedicadas en edad y pose cruzadas reales (agedb_30 85,12 %, cplfw 82,25 %).
- Robustez demográfica no establecida.
- No incluye detección de vida ni resistencia a ataques de presentación.
- Rendimiento de extremo a extremo en medios adversos no evaluado.
- El umbral del 1 % de FMR es un punto operativo empírico de desarrollo, no una garantía en otros conjuntos o poblaciones.
- Probabilidades calibradas para pares balanceados; el despliegue exige datos representativos, prevalencia de coincidencias, validación y salvaguardas.
- La política incluida está ajustada en desarrollo y no aprobada para despliegue.
- Requiere recortes faciales ya alineados de 112x112 RGB; la detección y la alineación son responsabilidad del usuario.
- Los recortes inválidos provocan un error en inferencia ordinaria.
- La adaptación solo con datos sintéticos no garantiza ausencia de exposición a fotografías reales en el preentrenamiento de CLIP ni en el generador.
- Licencia de los pesos adaptados y de DCFace sin verificar; no se afirma permiso de uso comercial.
- Cualquier uso con consecuencias requiere revisión por una persona cualificada con salvaguardas legales y organizativas.
- El repositorio no distribuye imágenes de entrenamiento o benchmark, etiquetas privadas ni credenciales.
- Es un bundle personalizado: revisar el código Python incluido antes de importarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leloss/LayaFace-DCF.v0.20261030
- Modelo base CLIP ViT-B/16: https://huggingface.co/openai/clip-vit-base-patch16
- Paper de CLIP (arXiv:2103.00020): https://arxiv.org/abs/2103.00020
- Paper de DCFace (arXiv:2304.07060): https://arxiv.org/abs/2304.07060
- Paper de calibración (arXiv:1706.04599): https://arxiv.org/abs/1706.04599
