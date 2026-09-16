# Makio64/bge-m3-jurilix-gguf

## Resumen

`Makio64/bge-m3-jurilix-gguf` es un artefacto en formato GGUF publicado en HuggingFace por el usuario Makio64 bajo el sello "Jurilix", cuyo propósito declarado en la model card es servir como "artefacto GGUF cualificado para la descarga anónima por Jurilix". Se trata, por tanto, de una conversión de pesos a GGUF de un modelo de la familia BGE-M3 orientado a la extracción de características (embeddings de texto), no de un modelo generativo: la etiqueta de pipeline `feature-extraction` y el recuento real de 566.703.104 parámetros apuntan a un codificador tipo XLM-RoBERTa-large, coherente con la arquitectura del modelo base BAAI/bge-m3.

El repositorio, de 0,6 GB, contiene un único fichero cuantizado en Q8_0 (`bge-m3-jurilix-Q8_0.gguf`, 634.554.144 bytes) junto a un fichero de procedencia con su hash SHA-256. La model card no documenta el proceso de ajuste, el corpus utilizado ni ninguna evaluación, y únicamente indica que la publicación por sí sola no equivale a una promoción al catálogo: el "banco de pruebas de producto" y el anclaje del commit siguen siendo obligatorios. No se han publicado resultados de benchmarks en la información disponible.

Su relevancia actual es limitada pero concreta: si el ajuste sobre dominio jurídico es real, ofrecería embeddings legales ejecutables en local, sin GPU dedicada, sobre un único fichero de menos de 650 MB, lo que encaja en pipelines de recuperación (RAG) sobre textos legales con requisitos de confidencialidad. Con cero descargas y cero valoraciones en el momento de redactar esta ficha, y sin métricas publicadas, debe considerarse un artefacto no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; por nombre y recuento de parametros corresponde a un codificador tipo XLM-RoBERTa-large (no confirmado por el autor) |
| Parametros totales | 566.703.104 (0,57 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (el modelo base BGE-M3 documenta hasta 8192 tokens; no confirmado para este artefacto) |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible en la model card; el modelo base BGE-M3 declara mas de 100 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |
| Modelo base declarado | no disponible (el tag `jurilix` sugiere un ajuste propio, sin documentar) |
| Uso previsto | extraccion de caracteristicas (embeddings), pipeline `feature-extraction` |
| Tamano del repositorio | 0,6 GB |
| Fichero publicado | `bge-m3-jurilix-Q8_0.gguf` (634.554.144 bytes) |
| SHA-256 | `40a6cd90d4055d421fe4dec3269289ed7734b05fdad3332a688f20e4e40cc9bb` |
| Descargas / valoraciones | 0 / 0 |
| Fecha de creacion | 2026-09-15 |
| Fecha de actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

No hay información sobre arquitectura ni entrenamiento en la model card. El autor no describe la composición del dataset, el número de tokens de entrenamiento, ni si hubo ajuste supervisado, contraste (DPO) o aprendizaje por refuerzo. Tampoco se indica si el ajuste "jurilix" se aplicó sobre el modelo completo, sobre la cabeza de proyección o mediante algún adaptador posteriormente fusionado.

El único dato técnico verificable es el recuento de parámetros (566.703.104), compatible con la arquitectura del modelo base BGE-M3, un codificador transformer basado en XLM-RoBERTa-large que se entrena con un objetivo multi-tarea (retrieval denso, retrieval disperso tipo léxico y multi-vector). El artefacto publicado es exclusivamente una cuantización Q8_0 a GGUF, presumiblemente para inferencia mediante llama.cpp u otros runners con soporte GGUF. Cualquier afirmación sobre atención lineal, decodificación especulativa o innovaciones de entrenamiento sería especulativa y no se incluye.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación de información (pipeline `feature-extraction`).
- Recuperación multilingüe y entre idiomas, si se hereda del modelo base (no confirmado por el autor).
- Procesamiento de documentos largos, si se confirma la ventana de 8192 tokens del modelo base (no confirmado).
- Ejecución en CPU y en GPU de gama baja gracias a la cuantización Q8_0 y a los 0,57 B de parámetros.
- Descarga anónima habilitada según la model card.
- Compatibilidad con endpoints (`endpoints_compatible`), orientada a despliegue como servicio de embeddings.
- Generación de texto: no, es un modelo de embeddings.
- Tool calling / function calling: no.
- Soporte de agentes o razonamiento multi-paso: no.
- Capacidades de visión o audio: no.

## Casos de uso

- Búsqueda semántica en bases de jurisprudencia: indexar sentencias y resoluciones como vectores y recuperar por similitud semántica en lugar de por coincidencia literal de términos, lo que permite encontrar doctrina relevante aunque la consulta no comparta vocabulario con el texto original.
- RAG sobre normativa interna de despachos: usar el modelo como recuperador en un pipeline de generación aumentada, de modo que un LLM genere respuestas citando únicamente los fragmentos recuperados; el tamaño reducido del artefacto permite desplegarlo junto al generador en la misma máquina.
- Clasificación y enrutado de expedientes: calcular embeddings de escritos de entrada y asignarlos a un área de práctica, a un procedimiento o a una cola de triaje mediante un clasificador ligero entrenado sobre esos vectores.
- Detección de duplicados y near-duplicates contractuales: comparar embeddings de cláusulas para localizar contratos o anexos casi idénticos en un repositorio documental, útil en due diligence y en procesos de revisión masiva.
- Recuperación multilingüe en contextos europeos: si el multilingüismo del modelo base se conserva, permite consultar un corpus en castellano y recuperar documentos en otro idioma de la Unión Europea, algo habitual en expedientes transfronterizos.
- Agrupación temática de doctrina y comentarios: generar embeddings de resoluciones y aplicar clustering para descubrir líneas jurisprudenciales o detectar cambios de criterio a lo largo del tiempo.
- Despliegue on-premise con confidencialidad estricta: al tratarse de un fichero GGUF de 634 MB ejecutable sin conexión, encaja en entornos donde el texto legal no puede salir de la infraestructura del cliente.
- Anonimización previa a indexación: usar los vectores para agrupar documentos que mencionan entidades similares antes de aplicar reglas de redacción, reduciendo el número de casos a revisar manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas de recuperación (nDCG, Recall@k, MRR), ni evaluaciones tipo MTEB, ni comparaciones con el modelo base. Tampoco se documenta el "banco de pruebas de producto" que el propio autor menciona como requisito pendiente, por lo que no es posible verificar que el ajuste jurídico aporte mejora alguna sobre BGE-M3 original.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 566,7 M de parametros (no son mediciones publicadas): aproximadamente 2,3 GB en FP32, 1,1 GB en FP16, 0,63 GB en Q8_0 (coincide con el tamano del fichero publicado) y en torno a 0,35-0,45 GB en cuantizaciones de 4 bits.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente en Q8_0; una RTX 3060, RTX 4060, RTX 4090 o un acelerador tipo T4 / A10G lo ejecutan con margen amplio. Para lotes grandes de embeddings conviene mas VRAM, pero el cuello de botella no sera el peso del modelo.
- Cabe en GPU de consumo: si, en practicamente todas las tarjetas modernas, e incluso en GPUs integradas con memoria compartida suficiente.
- Inferencia en CPU: viable gracias al formato GGUF y a los 0,57 B de parametros; no se dispone de datos de latencia ni de documentos por segundo.
- Opciones de despliegue: llama.cpp en modo embeddings, servidores compatibles con GGUF, Ollama para uso local, HuggingFace Inference Endpoints (el repositorio esta marcado como `endpoints_compatible`) y, si se convierte o se sirve el modelo base, frameworks de embeddings como vLLM o Text Embeddings Inference.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Los datos de la columna "alternativas" proceden de la documentacion publica de cada modelo base y no han sido verificados para esta ficha; conviene contrastarlos antes de tomar decisiones.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|---|
| `Makio64/bge-m3-jurilix-gguf` | 566,7 M | no disponible | no disponible | apache-2.0 | GGUF (Q8_0) | no disponible |
| BAAI/bge-m3 (base de referencia) | 568 M | 8192 tokens | mas de 100 | MIT | safetensors, ONNX | documentado por el autor en MTEB y MIRACL |
| intfloat/multilingual-e5-large | 560 M | 512 tokens | mas de 90 | MIT | safetensors, ONNX | documentado por el autor |
| Alibaba-NLP/gte-multilingual-base | 305 M | 8192 tokens | mas de 70 | apache-2.0 | safetensors, ONNX | documentado por el autor |

Frente a `multilingual-e5-large`, la principal diferencia practica seria la ventana de contexto (8192 frente a 512 tokens), si se confirma la herencia de BGE-M3. Frente a `gte-multilingual-base`, el coste es casi el doble de parametros para un proposito equivalente. Frente al BGE-M3 original, el artefacto aqui descrito anade un ajuste no documentado y una cuantizacion, y pierde la trazabilidad del entrenamiento.

## Limitaciones y advertencias

- No hay ninguna evaluacion publicada: se desconoce si el ajuste "jurilix" mejora, iguala o degrada el rendimiento del modelo base. La cuantizacion Q8_0 introduce ademas una perdida de precision respecto a los pesos originales.
- La model card esta redactada en frances, no documenta idiomas soportados, contexto, corpus de entrenamiento ni caso de uso previsto mas alla de la "cualificacion" para descarga anonima.
- Cero descargas y cero valoraciones: no existe validacion por parte de la comunidad.
- Riesgo de sesgo y de alucinacion: al ser un modelo de embeddings no genera texto, pero puede recuperar fragmentos irrelevantes o sesgados si el ajuste se hizo sobre un corpus juridico poco representativo; en un pipeline RAG, ese error se propaga al generador.
- Ambito juridico: un modelo ajustado en un ordenamiento juridico concreto puede comportarse peor en textos de otra jurisdiccion o de otra lengua. No se especifica sobre que legislacion se ajusto.
- Licencia: el repositorio declara apache-2.0, lo que en principio permite uso comercial, pero el autor no aclara la procedencia de los pesos base ni las condiciones del ajuste. Conviene verificar el fichero de procedencia (`bge-m3-jurilix-Q8_0.gguf.provenance.json`) antes de integrarlo en produccion. El modelo base BAAI/bge-m3 se distribuye bajo licencia MIT, distinta de la declarada aqui.
- El propio autor advierte de que la publicacion no implica promocion al catalogo y que el banco de pruebas de producto y el anclaje del commit siguen pendientes; es decir, el artefacto no ha superado su propio proceso interno de validacion.
- Marcado como `endpoints_compatible`, pero sin documentacion de como servirlo como endpoint de embeddings ni de los formatos de entrada y salida esperados.
- Advertencia de seguridad: cualquier fichero GGUF de un autor sin historial deberia cargarse en un entorno aislado y verificarse su SHA-256 contra el publicitado antes de usarlo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Makio64/bge-m3-jurilix-gguf
- Fichero de pesos: https://huggingface.co/Makio64/bge-m3-jurilix-gguf/blob/main/bge-m3-jurilix-Q8_0.gguf
- Fichero de procedencia citado en la model card: `bge-m3-jurilix-Q8_0.gguf.provenance.json` (mismo repositorio)
- Modelo base de referencia (no confirmado por el autor): https://huggingface.co/BAAI/bge-m3
- Documentacion de llama.cpp para embeddings: https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, repositorios ni demos adicionales asociados a este artefacto en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
