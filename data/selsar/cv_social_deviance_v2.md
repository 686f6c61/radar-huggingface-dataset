# selsar/cv_social_deviance_v2

## Resumen

El modelo `selsar/cv_social_deviance_v2` es un clasificador de texto publicado en Hugging Face por el usuario selsar, construido sobre la arquitectura DeBERTa-v2 y etiquetado con el pipeline `text-classification`. Cuenta con 278.810.882 parámetros reales extraídos de sus ficheros safetensors y un repositorio de 1,1 GB. El nombre sugiere un clasificador orientado a detectar "desviación social" en textos, aunque esta finalidad es una inferencia a partir del identificador y no está documentada por el autor.

La model card publicada es la plantilla genérica autogenerada por Hugging Face: todos los campos relevantes (desarrollador, financiación, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros y evaluación) aparecen como "[More Information Needed]". No hay artículo, repositorio de código, demo ni documentación asociada. El modelo registra 0 descargas y 0 likes en el momento de la consulta.

Por tanto, nos encontramos ante un checkpoint opaco: la única información fiable disponible son los metadatos del Hub (arquitectura declarada, número de parámetros, formato de pesos y tarea), sin datos verificables sobre entrenamiento, datos, evaluación o licencia. Cualquier evaluación de idoneidad para producción exige inspeccionar el modelo directamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (transformer encoder con atención desacoplada) según la etiqueta del Hub; configuración exacta no disponible |
| Parámetros totales | 278.810.882 |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (DeBERTa-v2 suele admitir 512 tokens, pero no está confirmado para este checkpoint) |
| Tipos de cuantización | No disponible. El repositorio solo contiene pesos completos en safetensors (1,1 GB, coherente con fp32). No hay variantes GGUF, ONNX int8 ni cuantizaciones publicadas por el autor |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no se declara licencia en el repositorio) |
| Formato de pesos | safetensors |
| Tarea declarada | text-classification (clasificación de texto) |
| Librería | transformers |
| Autor | selsar |
| Compatibilidad declarada | text-embeddings-inference, endpoints_compatible |
| Tamaño del repositorio | 1,1 GB |
| Fecha de creación | 14 de septiembre de 2026 (metadato del Hub) |
| Fecha de última actualización | 14 de septiembre de 2026 (metadato del Hub) |

## Arquitectura y entrenamiento

La única información arquitectónica disponible proviene de la etiqueta `deberta-v2` del repositorio. DeBERTa-v2 es una familia de encoders transformer que sustituye la codificación posicional aditiva de BERT por atención desacoplada de contenido y posición, y que emplea una máscara de atención mejorada; se usa habitualmente como backbone para tareas de clasificación y como encoder de frases. El recuento real de parámetros (278,8 M) no coincide con los checkpoints estándar publicados de la familia (aproximadamente 139 M para la variante base y 435 M para la variante large), lo que apunta a una configuración modificada, a un vocabulario distinto o a una inicialización propia; no hay forma de confirmarlo con los datos disponibles.

No existe información sobre el procedimiento de entrenamiento: se desconocen el número de tokens, la composición del corpus, el régimen de precisión (fp32, fp16, bf16), si hubo ajuste fino supervisado, RLHF, DPO u otro tipo de alineamiento, y si se aplicó destilación o poda. El campo "Training regime" de la model card está sin rellenar. Tampoco se documenta ninguna innovación técnica, mecanismo de decodificación especulativa ni variante de atención lineal. La etiqueta `arxiv:1910.09700` del Hub no corresponde a un artículo de la arquitectura, sino a la referencia del calculador de impacto medioambiental (Lacoste et al., 2019) que la propia plantilla autogenerada cita.

## Capacidades

- Clasificación de texto: es la única capacidad declarada de forma explícita mediante el pipeline `text-classification`. El número de etiquetas, su nomenclatura y el umbral de decisión no están documentados.
- Generación de texto: no soportada; es un modelo de tipo encoder, no un modelo generativo autorregresivo.
- Razonamiento, matemáticas y código: no disponible; no hay evidencia de capacidades de razonamiento multi-paso ni de generación de código.
- Tool calling / function calling: no soportado (no es un modelo de chat ni incluye plantilla de funciones).
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no disponible; el campo de idiomas está vacío.
- Modo "thinking", visión o audio: no soportado.
- Extracción de embeddings: el repositorio está marcado como compatible con `text-embeddings-inference`, lo que sugiere que el encoder puede usarse para obtener representaciones vectoriales, aunque el autor no documenta esta vía de uso.

## Casos de uso

Nota: el dominio de aplicación se infiere del identificador del modelo. Al no existir documentación de entrenamiento ni evaluación, los casos siguientes son hipótesis de uso que requieren validación empírica previa.

- Moderación de contenido en comunidades online: el modelo podría emplearse para puntuar automáticamente publicaciones o comentarios y priorizar la revisión humana de aquellos con mayor probabilidad de incumplir normas de convivencia, siempre que se valide antes su matriz de confusión en datos propios.
- Señalización en plataformas de denuncia: integrado como clasificador previo en un pipeline de triaje, permitiría ordenar los reportes de usuarios por probabilidad de ser casos relevantes antes de llegar al equipo de revisión.
- Análisis de corpus para investigación en ciencias sociales: uso como anotador automático de grandes volúmenes de texto (foros, redes, prensa) para estudios cuantitativos sobre discurso y normas sociales, con validación contra una submuestra anotada manualmente.
- Clasificación de conversaciones en atención al cliente: en un escenario genérico de clasificación de intenciones o categorías, un encoder de 278,8 M de parámetros puede ejecutarse en CPU con latencias bajas y por lotes, lo que lo hace apto para enrutar tickets.
- Filtrado previo en sistemas de recomendación: descartar o etiquetar contenido no deseado antes de indexarlo, reduciendo el coste computacional frente a modelos generativos mucho mayores.
- Detección de abuso en mensajería privada: como capa adicional de seguridad en plataformas de mensajería, aplicable en modo batch sobre mensajes reportados, con las cautelas legales correspondientes por tratamiento de datos personales y categorías sensibles.
- Enriquecimiento de datasets para anotación semiautomática: preetiquetar grandes corpus antes de una revisión humana, reduciendo el coste de anotación en proyectos de etiquetado supervisado.
- Extracción de embeddings para búsqueda semántica: si se confirma su idoneidad como encoder (la etiqueta `text-embeddings-inference` lo sugiere), podría generar representaciones para similitud semántica y recuperación de documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye sección de evaluación con datos, las métricas figuran como "[More Information Needed]" y la búsqueda web realizada no arrojó ningún resultado relacionado con el modelo ni con el autor.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 1,1 GB en fp32, 0,56 GB en fp16/bf16, 0,28 GB en int8 y 0,14 GB en int4 (estimaciones teóricas; solo existen pesos safetensors completos en el repositorio).
- VRAM estimada para inferencia: entre 1,5 GB y 4 GB para lotes pequeños con secuencias de 512 tokens, dependiendo de la precisión y del tamaño de lote; el consumo de activaciones en un encoder de 278,8 M de parámetros es modesto.
- GPU recomendadas: cualquier GPU con 4 GB o más de memoria. Cabe holgadamente en GTX 1660, RTX 3060, RTX 4060, RTX 4090, A100 y H100; en estas dos últimas es viable ejecutar lotes grandes con un throughput muy alto.
- Inferencia en CPU: viable. Un modelo de esta escala en fp32 o int8 puede servir peticiones en CPU con latencias del orden de decenas a centenas de milisegundos por lote pequeño, aunque no se dispone de mediciones publicadas.
- Consumer GPU: sí, cabe en la práctica totalidad de GPU de consumo actuales. El factor limitante no es la VRAM, sino la ausencia de variantes cuantizadas listas para usar.
- Opciones de despliegue: Hugging Face `transformers` con `pipeline("text-classification")`; Hugging Face Text Embeddings Inference (la etiqueta del repositorio lo declara compatible); Hugging Face Inference Endpoints (etiqueta `endpoints_compatible`); servidores propios con ONNX Runtime, TorchServe o FastAPI envueltos sobre el modelo. Los formatos GGUF y las herramientas basadas en llama.cpp no aplican a un encoder DeBERTa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se establece con encoders de la misma familia y con alternativas habituales de clasificación. Los datos de los modelos de referencia son valores públicos aproximados de sus repositorios originales; para este modelo, varios campos figuran como no disponibles porque el autor no los declara.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Evaluación publicada |
|---|---|---|---|---|---|
| selsar/cv_social_deviance_v2 | 278,8 M (dato real) | No disponible | No disponible | Repositorio en Hugging Face, 0 descargas | No |
| microsoft/deberta-v2-base | Aprox. 139 M | 512 tokens | MIT (según repositorio original) | Amplia, miles de derivados | Sí, en el artículo de DeBERTa |
| microsoft/deberta-v2-large | Aprox. 435 M | 512 tokens | MIT (según repositorio original) | Amplia | Sí, en el artículo de DeBERTa |
| FacebookAI/roberta-large | Aprox. 355 M | 512 tokens | MIT (según repositorio original) | Muy amplia | Sí, en el artículo de RoBERTa |

Frente a estas alternativas, este checkpoint presenta un tamaño intermedio entre las variantes base y large de DeBERTa-v2, pero no ofrece ninguna de las garantías que sí aportan los modelos oficiales: licencia explícita, documentación de entrenamiento, evaluación publicada y trazabilidad de los datos. Para uso en producción, un modelo oficial con licencia declarada es la opción por defecto salvo que se valide este checkpoint de forma independiente.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, hiperparámetros, métricas ni procedimiento de evaluación. Es imposible reproducir o auditar el modelo.
- Sin licencia declarada: al no especificarse licencia, no se conceden derechos explícitos de uso, modificación ni redistribución. El uso comercial es jurídicamente ambiguo y desaconsejable sin aclaración previa del autor.
- Idiomas no declarados: se desconoce si el modelo funciona en castellano o en cualquier otra lengua distinta de la de entrenamiento, que a su vez se desconoce.
- Riesgo de sesgo y de daño reputacional: la propia denominación ("desviación social") apunta a una categoría normativa y potencialmente estigmatizante. Un clasificador de este tipo puede amplificar sesgos contra colectivos concretos y prestarse a usos de vigilancia o perfilado. Se recomienda auditoría de equidad por subgrupos antes de cualquier despliegue.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos sin calibrar, con consecuencias directas si el modelo se usa para moderar o sancionar.
- Longitud de contexto limitada: si se confirma el comportamiento típico de DeBERTa-v2, el límite estará en torno a 512 tokens, insuficiente para documentos largos sin troceado previo.
- Número de etiquetas y umbral de decisión desconocidos: hay que inspeccionar `config.json` para conocer la cabeza de clasificación antes de integrarlo.
- Sin cuantizaciones publicadas: no hay GGUF ni ONNX optimizado; cualquier despliegue eficiente exige convertir y validar los pesos por cuenta propia.
- Adopción nula: 0 descargas y 0 likes implican ausencia de validación por parte de la comunidad, sin informes de errores ni comparaciones independientes.
- Metadatos anómalos: las fechas del repositorio (septiembre de 2026) resultan inconsistentes, lo que resta fiabilidad a los campos automáticos del Hub, incluida la etiqueta de arquitectura.
- Advertencia sobre la fuente: la model card es una plantilla autogenerada; sus campos vacíos no deben interpretarse como valores por defecto, sino como información inexistente.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/selsar/cv_social_deviance_v2
- Paper citado en la plantilla de la model card (calculador de impacto medioambiental, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculador de impacto ML referenciado en la plantilla: https://mlco2.github.io/impact
- Referencia de la arquitectura base declarada (DeBERTa: Decoding-enhanced BERT with Disentangled Attention): https://arxiv.org/abs/2006.03654
- La búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo, su autor ni su dominio de aplicación; los resultados obtenidos eran páginas sin relación con el repositorio.
