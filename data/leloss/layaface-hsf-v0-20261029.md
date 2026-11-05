# leloss/LayaFace-HSF.v0.20261029

## Resumen

LayaFace-HSF.v0.20261029 es un checkpoint de investigación para verificación facial simétrica de dos imágenes, desarrollado por el usuario leloss. No es un modelo de lenguaje generativo ni un `transformers.AutoModel` estándar: se trata de un bundle offline personalizado construido sobre el encoder visual de CLIP ViT-B/16 de OpenAI, al que se le añade una cabeza de comparación de pares. El modelo resuelve una tarea acotada: determinar si dos recortes faciales alineados corresponden a la misma persona, devolviendo una decisión booleana, un logit bruto y una probabilidad calibrada por temperatura.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de adaptación de CLIP a una tarea biométrica concreta mediante datos sintéticos (HSFace10K) y una política de umbral ajustada a una tasa de falsos positivos del 1%. Por otro, ejemplifica las precauciones que rodean a los modelos de verificación facial: licencia no verificada, ausencia de aprobación para producción y resultados que solo cubren pares de benchmark fijos.

El checkpoint tiene 86.193.153 parámetros, de los cuales 393.729 corresponden a la cabeza de pares. Trabaja sobre dos recortes RGB de 112x112 alineados aguas arriba, redimensionados a 224x224, y produce embeddings de 768 dimensiones L2-normalizados. La fecha de creación en el repositorio es 2026-11-05 y el tamaño del repo es de 0,3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP ViT-B/16 (encoder visual compartido) con cabeza de comparación de pares GELU |
| Parametros totales | 86.193.153 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio) |
| Licencia | no disponible; CLIP original MIT, implementación del proyecto Apache-2.0, términos de los pesos adaptados sin verificar |
| Formato de pesos | safetensors (bundle personalizado, no `transformers.AutoModel`) |

## Arquitectura y entrenamiento

El modelo parte del encoder visual de `openai/clip-vit-base-patch16` y lo comparte para las dos imágenes de entrada. Cada recorte facial alineado de 112x112 se redimensiona de forma independiente a 224x224 y se normaliza con las estadísticas de CLIP. Se extraen embeddings del token de clase post-layernorm de 768 dimensiones y se L2-normalizan. La cabeza de comparación construye características simétricas de la forma `[sqrt(768) * abs(a-b), 768 * (a*b)]`, es decir, 1536 dimensiones, y las pasa por una MLP `1536 -> 256 -> 1` con activación GELU. La simetría garantiza que intercambiar las dos entradas deja el logit invariante.

El entrenamiento se realizó con 7.983 identidades sintéticas de HSFace10K y 374.382 imágenes, usando entropía cruzada binaria por pares con balanceo de clases. La variante HSF corresponde a una adaptación completa (F1) tanto del encoder visual como de la cabeza de pares, con semilla 20261029 y un presupuesto registrado de 8 épocas. El checkpoint se seleccionó en la época 7 por el mínimo NLL bruto en la partición Stop. Las particiones Fit, Stop, Select, Calibrate y Threshold son disjuntas en identidades, y todos los pares de benchmark quedan fuera de la adaptación. FLUXSynID y los cinco benchmarks de caras reales son fuentes exclusivamente de test. El autor advierte que la adaptación solo con datos sintéticos no implica que el preentrenamiento de CLIP ni el generador sintético no hayan visto fotografías reales.

## Capacidades

- Verificación facial de pares: dada una imagen de referencia y una imagen de sonda, ambas recortes alineados de 112x112, decide si corresponden a la misma persona.
- Salida triple: decisión booleana de coincidencia, logit bruto escalar y probabilidad de misma persona calibrada por temperatura (`sigmoid(raw_logit / temperature)`).
- Invariancia al orden: intercambiar las dos entradas no altera el logit, gracias a la construcción simétrica de las características.
- Caché de representaciones: el embedding del encoder puede almacenarse para comparaciones repetidas contra una misma referencia.
- Inferencia offline: la carga del bundle no realiza descargas; solo `snapshot_download` accede a la red.
- Ejecución en CPU o CUDA (`device="cpu"` o `device="cuda"` con PyTorch compatible).
- No incluye detección ni alineación de rostros: son operaciones aguas arriba que el usuario debe aportar.
- No soporta tool calling, agentes, razonamiento multi-paso, visión general, audio ni generación de texto.

## Casos de uso

- Estudio controlado de verificación de pares con consentimiento: el modelo permite comparar pares de imágenes en un entorno de investigación con identidades consentidas, usando la probabilidad calibrada y el umbral documentado como punto de partida.
- Evaluación comparativa de encoders faciales: al estar construido sobre CLIP ViT-B/16, sirve como línea base para medir cuánto aporta la adaptación de la cabeza de pares frente al encoder original en tareas de verificación.
- Prototipado de pipelines de verificación con caché de referencia: la posibilidad de cachear el embedding del encoder permite construir un servicio que compare muchas sondas contra una referencia fija sin recalcular el lado de referencia.
- Investigación sobre calibración y umbrales: el bundle incluye temperatura (1,46106278637) y umbral de logit bruto (-0,584007263184) ajustados a un FMR del 1% sobre 10.000 pares no coincidentes, lo que facilita reproducir estudios de calibración.
- Análisis de robustez demográfica en laboratorio: el modelo puede emplearse para estudiar cómo varía el rendimiento entre subpoblaciones en conjuntos de benchmark, siempre con revisión humana y salvaguardas legales.
- Validación de datos sintéticos para biometría: dado que se entrenó con HSFace10K, sirve para analizar si la adaptación con datos sintéticos transfiere a benchmarks de caras reales (LFW, CFP-FP, AgeDB-30, CALFW, CPLFW).
- Docencia y demostraciones de verificación facial simétrica: el bundle offline y el código Python incluido permiten reproducir el flujo completo en un entorno de aula o laboratorio.

## Benchmarks y rendimiento

Los resultados corresponden a esta semilla concreta, no a las medias de tres semillas del paper. Las métricas sintéticas usan la política de desarrollo incluida. Los porcentajes se expresan en tanto por ciento, salvo AUC y Brier.

| Benchmark | Macro F1 | Accuracy | FMR | FNMR | AUC | ECE | Brier |
|---|---:|---:|---:|---:|---:|---:|---:|
| DCF | 91,02 | 91,02 | 8,37 | 9,60 | 0,9714 | 2,93 | 0,0685 |
| FLUX | 85,94 | 86,21 | 27,59 | 0,00 | 0,9999 | 8,31 | 0,0940 |

La precisión en caras reales emplea el protocolo estándar de diez pliegues de cada conjunto: se ajusta un umbral de puntuación en nueve pliegues y se evalúa el restante. No es la precisión del umbral sintético incluido. Los pesos del modelo permanecen fijos durante toda la evaluación.

| Benchmark real | Accuracy a diez pliegues (%) |
|---|---:|
| lfw | 98,63 |
| cfp_fp | 93,39 |
| agedb_30 | 89,18 |
| calfw | 92,08 |
| cplfw | 87,38 |
| Media | 92,13 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 86,2 M de parámetros en FP32, los pesos ocupan aproximadamente 0,34 GB; en FP16, unos 0,17 GB. A ello hay que sumar activaciones del ViT-B/16 a 224x224, moderadas pero no despreciables.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamaño, cualquier GPU con al menos 2-4 GB de VRAM debería bastar para inferencia en FP16, incluidas RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con 4 GB o más, aunque el autor no lo confirma.
- Opciones de despliegue: el bundle es personalizado y offline; se carga con `FaceModelV2` desde el repositorio descargado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. El autor solo indica que el embedding del encoder puede cachearse para comparaciones repetidas contra una referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LayaFace-HSF.v0.20261029 | 86,2 M | Verificación facial de pares | no aplica | no verificada | HuggingFace (bundle offline) |
| openai/clip-vit-base-patch16 | ~86 M (visual) | Visión-lenguaje general | 77 tokens de texto | MIT | HuggingFace, transformers |
| ArcFace (referencia habitual en verificación facial) | variable según backbone | Verificación facial | no aplica | variable según implementación | Amplia en literatura y repos |
| FaceNet (referencia histórica) | variable | Verificación facial | no aplica | variable | Amplia en literatura |

La comparación con ArcFace y FaceNet es cualitativa: no se dispone de resultados de benchmarks de esos modelos en la información proporcionada para contrastar directamente con las cifras de LayaFace-HSF. El modelo más directamente comparable es el CLIP ViT-B/16 original, ya que LayaFace-HSF es un fine-tuning del mismo sobre una tarea específica.

## Limitaciones y advertencias

- No aprobado para producción: el autor lo describe como una release preliminar de investigación para estudios controlados con consentimiento.
- Prohibido para identificación biométrica en producción, decisiones autónomas sobre medios adversos, vigilancia o identificación de personas en espacios públicos.
- Una coincidencia visual no establece implicación criminal ni asociación adversa alguna.
- Los resultados se refieren a pares de benchmark fijos y no garantizan robustez en una nueva población de despliegue.
- No se ha establecido la robustez demográfica, la detección de vivacidad, la resistencia a ataques de presentación ni el rendimiento extremo a extremo en medios adversos.
- La política de umbral incluida está ajustada para desarrollo, no aprobada para despliegue; el objetivo del 1% de FMR es un punto operativo empírico, no una garantía.
- Las probabilidades están calibradas para pares balanceados; el despliegue requiere datos representativos, prevalencia de coincidencias adecuada, validación y salvaguardas.
- La licencia de los pesos adaptados y del dataset sintético no está verificada; no hay licencia permisiva confirmada para estos pesos.
- No incluye detección ni alineación facial: los recortes deben llegar ya alineados a 112x112; los recortes inválidos lanzan un error en inferencia ordinaria.
- Una imagen constante de CPLFW aparece en 13 pares, que la evaluación compartida cuenta como no coincidencias.
- No es un `transformers.AutoModel`: requiere revisar el código Python incluido antes de importarlo.
- El repositorio no distribuye imágenes de entrenamiento ni de benchmark, etiquetas privadas ni credenciales.
- Cualquier uso con consecuencias debe ser revisado por una persona cualificada con las salvaguardas legales y organizativas adecuadas.

## Enlaces

- HuggingFace: https://huggingface.co/leloss/LayaFace-HSF.v0.20261029
- Modelo base: https://huggingface.co/openai/clip-vit-base-patch16
- Paper de CLIP (arXiv:2103.00020): https://arxiv.org/abs/2103.00020
- Paper de referencia (arXiv:2304.07060): https://arxiv.org/abs/2304.07060
- Paper de referencia (arXiv:1706.04599): https://arxiv.org/abs/1706.04599
