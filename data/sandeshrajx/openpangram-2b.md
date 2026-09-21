# sandeshrajx/openpangram-2b

## Resumen

OpenPangram-2B es un modelo de deteccion de texto generado por IA desarrollado por el usuario sandeshrajx y publicado en HuggingFace. Se presenta como una reproduccion abierta de la arquitectura de deteccion multietapa de Pangram 4, construida sobre el backbone Qwen3.5-2B, un transformer hibrido con atencion lineal. El modelo no genera texto: es un clasificador que combina una cabeza de calibracion ordinal de 15 bins para estimar el grado de participacion de IA (0-100%) y una cabeza de etiquetado a nivel de token que clasifica cada token como humano, asistido por IA o generado por IA.

Su relevancia radica en que sustituye el enfoque habitual de puntuacion binaria a nivel de documento por una senal de procedencia granular e interpretable. Esto permite detectar autorias mixtas (pasajes coescritos por humano y modelo) y localizar que fragmentos concretos de un texto han sido generados, algo que los detectores convencionales basados en perplejidad no ofrecen. La model card reporta una correlacion de Spearman a nivel de documento de 0,948 y una precision de token del 83,23% sobre 972.065 tokens de validacion.

El modelo tiene 1.881.882.460 parametros reales (segun los pesos safetensors), un repositorio de 3,8 GB, licencia Apache 2.0, soporte unicamente para ingles y cero descargas y likes en el momento de la consulta, lo que indica una publicacion muy reciente y sin validacion independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal (backbone Qwen3.5-2B) mas cabezas personalizadas de clasificacion (token_head, mixed_head, segment_head, score_head) |
| Parametros totales | 1.881.882.460 (1,88 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La model card describe ventanas de hasta 384 tokens duplicadas a 768 mediante la tecnica Repeat2 |
| Tipos de cuantizacion | No disponible. El repositorio distribuye pesos safetensors; el entrenamiento se realizo en bfloat16 nativo |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen3.5-2B, un transformer hibrido con atencion lineal, y le anade cuatro cabezas: `token_head` para clasificacion a nivel de token, `mixed_head` para deteccion binaria de autoria mixta, `segment_head` para el grado ordinal en 15 bins y `score_head` para un grado agrupado en 4 buckets. El entrenamiento sigue la metodologia multietapa descrita en los informes tecnicos de Pangram, con un corpus de referencia de aproximadamente 60.000 documentos humanos y sinteticos, alineados por clausulas mediante solapamiento lexico de n-gramas y similitud de embeddings.

La etapa 1 supervisa el grado continuo de participacion de IA con objetivos derivados de distancias de edicion lexicas y semanticas a nivel de clausula, y reporta una correlacion DOC de Spearman de 0,948. En la etapa 2 los pesos de la etapa 1 se fusionan permanentemente en el backbone y se aplica la tecnica Repeat2: cada ventana de entrada x se duplica a [x, x] (768 tokens), la atencion causal recorre la secuencia concatenada y la supervision se aplica solo a la segunda copia, de modo que cada token supervisado obtiene visibilidad bidireccional sobre el pasaje completo dentro de un modelo causal. La perdida combina cuatro terminos con pesos 1,0 (token), 0,5 (mixed), 0,25 (segment) y 0,25 (score). La model card documenta tres correcciones de ingenieria: persistencia de las cabezas bajo `modules_to_save` de PEFT para evitar su congelacion, saneado de la mascara de atencion para evitar que los tokens de relleno contaminen el mean pooling, y uso de bfloat16 nativo sin `GradScaler`.

## Capacidades

- Clasificacion a nivel de token con tres etiquetas: Human, AI-Assisted y AI-Generated, con precision reportada del 83,23% (macro-F1 0,6554).
- Calibracion continua del grado de participacion de IA en escala 0-100% mediante una cabeza ordinal de 15 bins, con un error absoluto medio por ventana del 6,7%.
- Deteccion de autoria mixta a nivel de ventana (pasajes coescritos por humano y modelo), con 89,71% de exactitud y F1 binario de 0,7097.
- Puntuacion de documentos completa mediante una cabeza de grado agrupada en 4 buckets, con correlacion de rango de 0,910.
- Suavizado heuristico de spans: filtrado de spans contiguos para eliminar el parpadeo del argmax en tokens aislados sin el coste de inferencia de una capa CRF completa.
- Capacidad declarada en los tags del repositorio de feature extraction y token classification, ademas de la tarea principal de text classification.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso, vision, audio ni modo de pensamiento. Es exclusivamente un clasificador.
- Multilingue: no. El modelo esta entrenado y etiquetado unicamente para ingles.

## Casos de uso

- Moderacion de contenido generado por usuarios: el modelo puede marcar que fragmentos concretos de un envio han sido producidos por IA en lugar de devolver un unico veredicto sobre el texto completo, lo que permite aplicar politicas proporcionales al porcentaje de contenido sintetico.
- Verificacion de procedencia en plataformas editoriales: integrado como paso previo a la publicacion, clasifica cada token de un manuscrito y senala los parrafos marcados como AI-Generated o AI-Assisted para revision humana antes de emitir la pieza.
- Auditoria de datasets de entrenamiento: al ser un modelo Apache 2.0 ejecutable en local, permite filtrar corpus a gran escala y descartar documentos con alta densidad de texto sintetico, reduciendo el riesgo de contaminacion por datos generados.
- Deteccion de autoria mixta en entornos academicos: la cabeza mixed identifica pasajes coescritos, lo que resulta mas informativo que una etiqueta binaria cuando el estudiante ha usado un modelo como asistente de redaccion y no como generador completo.
- Analisis de resenas y contenido comercial: para plataformas de comercio electronico, el etiquetado por token ayuda a localizar resenas parcialmente generadas, un patron habitual en campanas de manipulacion de reputacion.
- Investigacion en linguistica computacional y forense digital: la salida a nivel de token y las 4 cabezas de supervision permiten estudiar como se distribuye la marca de autoria a lo largo de un texto y comparar estilos entre modelos generadores.
- Cumplimiento de obligaciones de transparencia: util como componente de un sistema que deba marcar contenido sintetico conforme a marcos regulatorios de etiquetado de contenido generado por IA, siempre que se combine con revision humana dada la tasa de error documentada.
- Preprocesado en pipelines de curación de datos para LLM: descartar o marcar automaticamente documentos cuyo grado de IA estimado supere un umbral configurable antes de incorporarlos a un corpus de entrenamiento.

## Benchmarks y rendimiento

La model card publica resultados sobre un conjunto de validacion retenido de 2.400 documentos, 3.711 ventanas y 972.065 tokens.

| Metrica de evaluacion | Baseline inicial | Etapa 1 (grado) | Etapa 2 (tokenwise + grado) |
|---|---|---|---|
| DOC Gate rho (frente al grado del teacher) | 0,315 | 0,948 | 0,948 |
| Window Degree rho (15 bins) | 0,250 | 0,915 | 0,914 |
| Window Degree rho (4 buckets) | -0,443 | 0,907 | 0,910 |
| Window Degree MAE | 39,3% | 6,8% | 6,7% |
| Tokenwise accuracy | no disponible | no disponible | 83,23% |
| Tokenwise macro-F1 | no disponible | no disponible | 0,6554 |
| Mixed-authorship window F1 | no disponible | no disponible | 0,7097 (89,71% de exactitud) |

Desglose de la clasificacion a nivel de token (972.065 tokens):

| Clase | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| Human | 0,862 | 0,952 | 0,905 | 467.769 |
| AI-Assisted | 0,470 | 0,126 | 0,198 | 119.710 |
| AI-Generated | 0,823 | 0,906 | 0,863 | 384.586 |
| Exactitud global | | | 0,832 | 972.065 |
| Media macro | 0,718 | 0,661 | 0,655 | 972.065 |

No se han publicado comparaciones con otros modelos detectores en la informacion disponible; los resultados de la model card son autoevaluados y no se acompanan de un conjunto de validacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,8 GB con pesos en bfloat16 o float16 (coincide con el tamano del repositorio), alrededor de 1,9 GB en cuantizacion de 8 bits y en torno a 1 GB en 4 bits. Son estimaciones a partir del numero de parametros; el autor no publica cifras oficiales.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para bfloat16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). Para procesamiento por lotes a gran escala, A100 o H100 reducen el tiempo por documento.
- Cabe en GPU de consumo: si, con holgura, en cualquier tarjeta con 8 GB o mas. Tambien es viable en CPU, aunque con mayor latencia.
- Opciones de despliegue: la libreria declarada es transformers, y el repositorio incluye la etiqueta `custom_code`, por lo que la carga requiere `trust_remote_code=True`. No se documenta soporte para vLLM, Text Generation Inference, llama.cpp u Ollama; al no ser un modelo generativo y depender de cabezas personalizadas, estos servidores no son aplicables sin adaptacion, y no se distribuyen pesos en formato GGUF.
- Latencia y throughput estimados: no disponible. La model card no publica mediciones de latencia ni de documentos por segundo.
- Requisito adicional: al ser un modelo de clasificacion con ventanas de 384 tokens duplicadas a 768, el coste de inferencia por documento crece linealmente con el numero de ventanas en las que se divida el texto.

## Comparativa con modelos similares

No se dispone de especificaciones publicas de modelos comparables en la informacion proporcionada. La propia model card cita Pangram 4 como arquitectura de referencia, pero se trata de un sistema propietario sin pesos ni parametros publicos, por lo que no es posible una comparacion cuantitativa directa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenPangram-2B | 1,88 B | no disponible (ventanas de 384 tokens) | DOC rho 0,948; token accuracy 83,23% | Apache 2.0 | Pesos abiertos en HuggingFace |
| Pangram 4 | no disponible | no disponible | no disponible | Propietaria | Solo API, sin pesos publicos |
| Otros detectores abiertos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy bajo en la clase AI-Assisted: precision 0,470 y recall 0,126 (F1 0,198). El modelo practicamente no detecta texto asistido por IA, lo que limita su uso en escenarios de coescritura parcial.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos: la model card justifica el diseno por la tendencia de los detectores convencionales a marcar erróneamente a escritores humanos no nativos, sin aportar metricas desagregadas por subpoblacion que confirmen que este modelo lo evita.
- Validacion limitada y no independiente: los resultados proceden de un unico conjunto retenido de 2.400 documentos descrito por el propio autor. No hay evaluacion externa ni replicacion por terceros.
- Cobertura linguistica restringida al ingles. No hay datos sobre comportamiento en castellano u otros idiomas.
- Cero descargas y cero likes en el momento de la consulta: el modelo no tiene uso conocido en produccion ni retroalimentacion de la comunidad.
- La fecha de creacion en el repositorio (2026-09-20) es posterior a la fecha actual de referencia, lo que conviene verificar antes de citar el modelo.
- Requiere `trust_remote_code=True` por el uso de codigo personalizado, lo que implica ejecutar codigo del autor del repositorio. Debe revisarse antes de desplegarlo en entornos sensibles.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion. No se detectan clausulas adicionales restrictivas en la informacion disponible.
- La deteccion de texto generado por IA es intrinsecamente fragil frente a parafraseo, traduccion, reescritura humana del texto generado y edicion adversarial. No debe usarse como prueba concluyente en contextos disciplinarios o legales sin revision humana.
- La tecnica Repeat2 duplica la longitud de la secuencia, por lo que el coste computacional por ventana es mayor que el de un clasificador causal estandar del mismo tamano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeshrajx/openpangram-2b
- Informe de evaluacion de la etapa 2 (ruta relativa dentro del repositorio): `evals/stage2_evaluation_report.html`
- Licencia del repositorio (ruta relativa): `LICENSE`
- Informes tecnicos de Pangram (Pangram 4 y Pangram 3): citados en la model card sin enlace directo disponible
- Nota sobre la busqueda web: los resultados devueltos por la busqueda no guardan relacion con el modelo (corresponden a un producto de suplementos vitaminicos denominado Vitasprint). No se han encontrado articulos, papers, repositorios ni demos adicionales sobre OpenPangram-2B en la informacion proporcionada.
