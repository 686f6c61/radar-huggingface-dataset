# davidmelash/wechsel_base_v7_2026-10-09_r5_s43

# wechsel_base_v7_2026-10-09_r5_s43

## Resumen
`wechsel_base_v7_2026-10-09_r5_s43` es un modelo de clasificacion de tokens (reconocimiento de entidades nombradas, NER) publicado por el usuario `davidmelash` en HuggingFace. Se trata de un fine-tuning de `benjamin/roberta-base-wechsel-ukrainian`, un modelo monolingue de ucraniano construido con la tecnica WECHSEL, que transfiere un modelo ingles a un nuevo idioma inicializando los embeddings de subpalabras con embeddings estaticos multilingues. El modelo final usa la arquitectura RoBERTa base, con 124.061.961 parametros y pesos en formato safetensors.

El problema que resuelve es concreto: localizar datos personales en sentencias judiciales ucranianas para poder pseudonimizarlas. El modelo reconoce cuatro tipos de entidad (`ОСОБА` — persona, `АДРЕСА` — direccion, `НОМЕР` — numero, `ІНФОРМАЦІЯ` — informacion), que cubren los fragmentos que el Registro Unificado Estatal de Decisiones Judiciales de Ucrania anonimiza antes de publicar.

Su relevancia actual es limitada pero especifica: se trata de una herramienta de nicho para el procesamiento de corpus legales ucranianos, con licencia MIT y sin datos publicos de rendimiento. El repositorio no registra descargas ni valoraciones, por lo que no existe validacion externa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base) con cabeza de clasificacion de tokens |
| Parametros totales | 124.061.961 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; 512 tokens es el valor por defecto de RoBERTa base |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors sin cuantizar; admite cuantizacion externa a float16/int8) |
| Idiomas soportados | ucraniano (uk) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo es un encoder Transformer de tipo RoBERTa base, es decir, 12 capas, 768 dimensiones de representacion ocultas y 12 cabezas de atencion, con 124.061.961 parametros totales. Sobre ese encoder se anade una cabeza de clasificacion de tokens con cuatro etiquetas de entidad mas la clase exterior. Se trata de un modelo exclusivamente encoder, por lo que no genera texto ni mantiene un modo de razonamiento: su salida es una etiqueta BIO por token.

El punto de partida es `benjamin/roberta-base-wechsel-ukrainian`, un modelo derivado de la tecnica WECHSEL (Word Embeddings Can Help initialize Subword Embeddings in a new Language), descrita en el articulo arXiv 2112.06598. WECHSEL copia todos los parametros internos (no de embedding) del modelo origen y sustituye el tokenizer por uno del idioma destino, inicializando los embeddings nuevos mediante embeddings estaticos multilingues alineados. El autor de esta ficha no aporta detalles sobre hiperparametros, numero de pasos, epocas ni si se aplicaron tecnicas de ajuste adicionales como RLHF o DPO (no procede en una tarea de etiquetado). Tampoco se especifica la composicion exacta del dataset ni su tamano.

Los datos de entrenamiento pertenecen al dataset sintetico denominado `v7`: sentencias del Registro Unificado Estatal de Decisiones Judiciales de Ucrania cuyos fragmentos anonimizados se han rellenado con valores generados. Las direcciones sinteticas provienen del directorio de Ukrposhta y de OpenStreetMap (© colaboradores de OpenStreetMap, ODbL). Al ser datos generados y no reales, el dominio de entrenamiento queda restringido a ese estilo de sentencia y a ese esquema de anonimizacion.

## Capacidades
- Reconocimiento de entidades nombradas sobre texto legal ucraniano en cuatro categorias: `ОСОБА` (persona), `АДРЕСА` (direccion), `НОМЕР` (numero) e `ІНФОРМАЦІЯ` (informacion).
- Etiquetado a nivel de token, adecuado para extraccion de spans y para construir mapas de reemplazo en tareas de pseudonimizacion.
- Deteccion de datos de contacto y numeros identificativos dentro de sentencias (los tipos `НОМЕР` e `ІНФОРМАЦІЯ` cubren este caso segun el esquema declarado).
- Capacidad multilingue: ninguna. El modelo esta entrenado y declarado unicamente para ucraniano.
- Soporte de tool calling o function calling: no. Es un modelo de clasificacion, no generativo.
- Soporte de agentes o razonamiento multi-paso: no.
- Capacidades de vision, audio o modo de pensamiento: no disponibles.
- Texto de entrada: se espera texto ya segmentado, dado el limite de contexto tipico de RoBERTa base (512 tokens).

## Casos de uso
- Pseudonimizacion de sentencias judiciales: el modelo etiqueta cada token de la resolucion y permite sustituir los spans marcados como `ОСОБА`, `АДРЕСА`, `НОМЕР` e `ІНФОРМАЦІЯ` por valores ficticios coherentes antes de publicar el documento.
- Cumplimiento normativo en organismos judiciales: integrado en un pipeline previo a la publicacion, sirve como primera pasada automatica de deteccion de datos personales, dejando la revision final a un operador juridico.
- Preparacion de corpus abiertos para investigacion: al anonimizar de forma consistente, facilita la liberacion de colecciones de sentencias ucranianas sin exponer datos personales.
- Enmascaramiento previo al entrenamiento de otros modelos: los textos legales anonimizados con este modelo pueden alimentar modelos de lenguaje o de recuperacion sin arrastrar informacion identificativa.
- Auditoria de fugas de datos: ejecutado sobre un repositorio documental, permite detectar que documentos contienen aun entidades personales sin tratar.
- Asistencia a la redaccion de documentos legales: las etiquetas detectadas pueden guiar la generacion de plantillas donde los huecos de datos personales se rellenan automaticamente.
- Investigacion en PLN juridico ucraniano: sirve como linea base de NER para comparar tecnicas de anonimizacion en un idioma y dominio con pocos recursos etiquetados.
- Integracion en sistemas de gestion documental: el modelo es lo bastante pequeno (124 M de parametros) para desplegarse en servidores modestos y procesar lotes de documentos en segundo plano.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall ni F1 sobre conjuntos de evaluacion, ni comparaciones con otros sistemas de anonimizacion de texto legal ucraniano.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 500 MB en float32, 250 MB en float16 y 150 MB en int8, sin contar el overhead del runtime ni el tamano del lote.
- Cabe sin dificultad en cualquier GPU de consumo (RTX 3060, RTX 4070, RTX 4090) y tambien en CPU, dado el tamano reducido del modelo.
- Es viable ejecutarlo en un portatil sin GPU dedicada para lotes pequenos de documentos, aunque la latencia dependera del numero de tokens a procesar.
- GPU recomendadas para procesamiento por lotes a escala: A10G, L4, A100 o H100, no por requisitos de memoria sino por paralelismo y throughput.
- Opciones de despliegue: pipeline `transformers` (token-classification), exportacion a ONNX Runtime o TorchScript, Hugging Face Inference Endpoints (la etiqueta `endpoints_compatible` esta presente), y servicios propios con FastAPI o TorchServe.
- vLLM no es la herramienta adecuada, ya que esta orientada a modelos generativos y no a clasificacion de tokens.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wechsel_base_v7_2026-10-09_r5_s43 | 124.061.961 | no confirmado (512 por defecto en RoBERTa base) | Clasificacion de tokens (4 entidades de PII legal) | ucraniano | MIT | HuggingFace |
| benjamin/roberta-base-wechsel-ukrainian | 124.061.961 (misma arquitectura, el fine-tuning no altera el numero de parametros) | no disponible | Modelo base de lenguaje enmascarado | ucraniano | no disponible | HuggingFace |
| XLM-RoBERTa base (referencia generica multilingue de NER) | 278 M (dato publico del modelo, fuera de la informacion proporcionada) | 512 | Modelo base multilingue, requiere fine-tuning para NER | 100 idiomas | MIT | HuggingFace |

No se han encontrado en la busqueda web otros modelos especificos de anonimizacion de sentencias ucranianas con los que comparar de forma verificable. Cualquier comparacion de rendimiento con alternativas queda pendiente de una evaluacion propia.

## Limitaciones y advertencias
- Ausencia de validacion externa: el repositorio registra 0 descargas y 0 valoraciones, y no se publican metricas de evaluacion, por lo que no hay evidencia de su calidad en produccion.
- Entrenamiento sobre datos sinteticos: los valores anonimizados del dataset `v7` son generados, de modo que el modelo puede no generalizar a sentencias reales con formatos, abreviaturas o variantes ortograficas no cubiertas.
- Riesgo de fuga de datos personales: cualquier fallo de deteccion implica que un dato identificativo puede quedar expuesto tras una pseudonimizacion automatica; se requiere revision humana en contextos legales.
- Sesgos: al derivar de un corpus de sentencias ucranianas, puede reproducir sesgos presentes en ese dominio (nombres, direcciones o colectivos sobrerrepresentados) y fallar mas en nombres o toponimos poco frecuentes.
- Limitacion de contexto: con el limite tipico de 512 tokens de RoBERTa base, las sentencias largas deben trocearse, lo que puede partir entidades en los limites de los fragmentos y degradar la deteccion.
- Limitacion idiomatica: solo ucraniano. El texto en ruso, ingles u otros idiomas presente en documentos mezclados no esta cubierto por el modelo.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero los datos de direcciones generadas proceden de OpenStreetMap (ODbL) y del directorio de Ukrposhta, cuyas condiciones deben revisarse si se redistribuye el dataset o derivados.
- Metadatos a revisar: la fecha de creacion declarada es 2026-10-09, posterior a la fecha de consulta habitual, lo que sugiere un problema de etiquetado temporal o de nomenclatura en el repositorio.
- No apto para generacion: es un modelo de clasificacion; no puede redactar, resumir ni responder preguntas, y encadenarlo como si fuera generativo producira salidas invalidas.
- Falta de informacion sobre el tokenizer final, los hiperparametros de fine-tuning y el esquema exacto de etiquetas (BIO o BILUO), lo que complica su integracion fiable sin pruebas previas.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/davidmelash/wechsel_base_v7_2026-10-09_r5_s43
- Modelo base: https://huggingface.co/benjamin/roberta-base-wechsel-ukrainian
- Repositorio de WECHSEL en GitHub: https://github.com/CPJKU/wechsel
- Paquete wechsel en PyPI: https://pypi.org/project/wechsel/
- Documentacion del modelo en el repositorio WECHSEL: https://github.com/CPJKU/wechsel/blob/main/MODEL_README.md
- Articulo WECHSEL (arXiv 2112.06598): https://ar5iv.labs.arxiv.org/html/2112.06598
- PDF del articulo en OpenReview: https://openreview.net/pdf?id=V9kbHITRY_4
