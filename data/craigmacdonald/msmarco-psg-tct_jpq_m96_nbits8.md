# craigmacdonald/msmarco-psg-tct_jpq_M96_nbits8

## Resumen

`craigmacdonald/msmarco-psg-tct_jpq_M96_nbits8` es un modelo de extracción de características (*feature extraction*) publicado en HuggingFace por el usuario craigmacdonald. Por su nombre y sus etiquetas, se trata de un codificador de pasajes orientado a recuperación de información, aparentemente entrenado o ajustado sobre el corpus MS MARCO (passage ranking) y comprimido mediante cuantización por producto de 8 bits con M=96 subcuantizadores (esquema tipo JPQ). El repositorio declara 109.482.240 parámetros en formato safetensors y un tamaño de 0,4 GB.

El modelo tiene 0 descargas y 0 *likes* en el momento de la consulta, y su *model card* es la plantilla automática de HuggingFace sin ningún campo cumplimentado: no hay información sobre desarrollador, datos de entrenamiento, licencia ni evaluación. Por tanto, cualquier afirmación sobre su comportamiento debe considerarse no verificada.

La relevancia de esta ficha es limitada pero real: se trata de un ejemplo típico de artefacto de investigación en el ámbito de la búsqueda semántica densa, donde la cuantización agresiva (códigos de 96 bytes por pasaje) es clave para reducir el coste de memoria de los índices vectoriales. Quien quiera usarlo deberá asumir que la documentación es inexistente y validar el modelo por su cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer bidireccional), segun la etiqueta `bert` del repositorio; configuracion exacta no disponible |
| Parametros totales | 109.482.240 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | el identificador del modelo indica cuantizacion a 8 bits (`nbits8`) con M=96 subcuantizadores; no se documentan otros formatos |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

Nota: el recuento de 109.482.240 parámetros coincide exactamente con el de `bert-base-uncased`, lo que sugiere una inicialización sobre BERT-base, pero esto es una inferencia a partir del número y no un dato confirmado por el autor.

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura concreta ni sobre el procedimiento de entrenamiento. La etiqueta `bert` y el recuento de parámetros apuntan a un encoder transformer bidireccional de tipo BERT-base (12 capas, dimensión oculta 768, 12 cabezas de atención en la configuración estándar de BERT-base), aunque la model card no lo confirma. El campo `pipeline` es `feature-extraction`, lo que indica que el modelo devuelve representaciones vectoriales y no texto generado.

El nombre del repositorio contiene tres indicios que no están documentados por el autor: `msmarco-psg` sugiere entrenamiento sobre pasajes de MS MARCO; `tct` podría referirse a una estrategia de destilación de tipo TCT-ColBERT; y `jpq_M96_nbits8` apunta a cuantización por producto optimizada conjuntamente (JPQ) con 96 subcuantizadores de 8 bits. Ninguno de estos extremos está confirmado en la información disponible. Tampoco hay datos sobre volumen de tokens de entrenamiento, composición del dataset, uso de negativos duros, RLHF/DPO ni innovaciones técnicas adicionales.

## Capacidades

- Extracción de embeddings de pasajes o documentos: el pipeline declarado es `feature-extraction`, por lo que la salida esperada son vectores densos.
- Búsqueda semántica y *ranking* de pasajes: por el nombre y el origen aparente (MS MARCO), estaría orientado a puntuar la relevancia entre consulta y pasaje.
- Representación comprimida: la cuantización a 8 bits con M=96 sugiere códigos de 96 bytes por vector, útiles para índices vectoriales de bajo consumo de memoria.
- Compatibilidad con el ecosistema `transformers` y con *endpoints* de HuggingFace (etiqueta `endpoints_compatible`).
- Generación de texto: no soportada (no es un modelo generativo).
- *Tool calling* / *function calling*: no soportado.
- Razonamiento multi-paso o modo agente: no soportado.
- Capacidades multilingües: no disponible.
- Visión o audio: no soportado.

## Casos de uso

- Recuperación semántica en un pipeline RAG: el modelo generaría embeddings de los fragmentos de documentación y de la consulta del usuario, permitiendo recuperar los pasajes más relevantes antes de pasarlos a un LLM generador. Adecuado si se confirma su entrenamiento sobre MS MARCO.
- Índice vectorial de bajo coste: gracias a los códigos de 96 bytes, un corpus de varios millones de pasajes podría almacenarse en una fracción de la memoria que exigirían embeddings en fp32 (768 dimensiones × 4 bytes = 3.072 bytes por vector).
- *Reranking* en buscadores corporativos: recalcular la similitud entre consulta y los 50-100 documentos recuperados por un motor léxico (BM25, Elasticsearch) para reordenar los resultados por relevancia semántica.
- Deduplicación y agrupación de documentos: calcular similitud coseno entre embeddings para detectar duplicados casi idénticos o agrupar contenido por temática, por ejemplo en corpus legales o científicos.
- Clasificación ligera por similitud: asignar etiquetas comparando el embedding de un texto con embeddings de prototipos por clase, sin necesidad de reentrenar un clasificador.
- Filtrado de contenido en pipelines de moderación: comparar cada mensaje entrante con un conjunto de ejemplos de referencia etiquetados y derivar una puntuación de proximidad.
- Evaluación de calidad de recuperación: usar el modelo como referencia para medir MRR o nDCG sobre conjuntos de evaluación propios, siempre que se valide antes su rendimiento real.
- Experimentación académica sobre cuantización: servir como punto de partida para reproducir o comparar técnicas de quantización por producto en recuperación densa.

Advertencia: todos estos casos presuponen que el modelo se comporta como un encoder de pasajes entrenado para recuperación. La ausencia de documentación y de evaluación publicada obliga a validar cada escenario con datos propios antes de usarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La *model card* del autor contiene únicamente los campos de plantilla marcados como "[More Information Needed]", incluidas las secciones de evaluación y de resultados.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 109.482.240 parámetros: aproximadamente 438 MB en fp32, 219 MB en fp16/bf16 y 109 MB en int8.
- VRAM total en inferencia: depende del tamaño de lote y de la longitud de secuencia. Con lotes pequeños en fp16 es razonable estimar entre 1 y 2 GB, incluyendo activaciones y memoria del runtime; no hay mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria es suficiente para los pesos; no se requiere una A100, H100 ni hardware de centro de datos.
- Cabe en GPU de consumo: sí, prácticamente en cualquier modelo con 2 GB o más, incluidas GTX 1650, RTX 3060, RTX 4070 o RTX 4090. También es viable en CPU para lotes pequeños.
- Opciones de despliegue: `transformers` con PyTorch, `sentence-transformers` (si la configuracion es compatible), exportacion a ONNX Runtime y servidores de embeddings sobre ONNX. Conviene verificar la compatibilidad real antes de asumir cualquiera de estas rutas.
- Latencia y throughput: no disponible.
- Nota sobre índices: si el modelo produce vectores de 768 dimensiones cuantizados a 96 bytes, un corpus de 10 millones de pasajes ocuparía aproximadamente 0,96 GB solo en códigos, sin contar estructuras auxiliares del índice.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos directamente comparables con datos verificables. La comparación siguiente usa `bert-base-uncased` como referencia arquitectónica, dado que comparte el recuento exacto de parámetros, pero no implica equivalencia funcional ni de rendimiento.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| craigmacdonald/msmarco-psg-tct_jpq_M96_nbits8 | 109.482.240 | no disponible | feature-extraction / recuperacion | no disponible | HuggingFace |
| bert-base-uncased | 109.482.240 | 512 tokens | encoder general | Apache-2.0 | HuggingFace |

Otras alternativas del espacio de recuperación densa (por ejemplo, modelos basados en ColBERT, en arquitecturas tipo sentence-transformers o en variantes JPQ) no aparecen documentadas en la información disponible para este repositorio, por lo que no se incluyen datos comparativos.

## Limitaciones y advertencias

- Ausencia total de documentación: la *model card* es la plantilla automática y no aporta información sobre entrenamiento, datos, evaluación o uso previsto.
- Licencia no declarada: sin licencia explícita no se puede asumir permiso para uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Sesgos: no evaluados ni documentados. Al ser presumiblemente un modelo entrenado sobre MS MARCO, podría heredar sesgos de dominio (contenido web en inglés) y de representación.
- Alucinación: no aplica en el sentido generativo, ya que no produce texto, pero sí existe riesgo de puntuaciones de similitud poco fiables fuera del dominio de entrenamiento.
- Limitaciones de contexto e idioma: no disponibles. Si el modelo deriva de BERT-base, es probable que esté limitado a secuencias cortas (del orden de 512 tokens) y a inglés, pero no está confirmado.
- Reproducibilidad: al no documentarse el procedimiento de entrenamiento ni los hiperparámetros, los resultados no son reproducibles.
- Adopción nula: 0 descargas y 0 *likes* implican que no hay comunidad que haya reportado comportamientos, errores o casos de uso validados.
- Riesgo de incompatibilidad: el prefijo `jpq` sugiere que los pesos pueden requerir un código de inferencia específico (por ejemplo, decodificación de códigos cuantizados) que no está incluido ni referenciado en el repositorio.
- Fecha de creación poco habitual en el repositorio (2026-10-12), lo que puede indicar metadatos inconsistentes o un proceso de subida automatizado.
- No usar en producción sin una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/craigmacdonald/msmarco-psg-tct_jpq_M96_nbits8
- Paper referenciado en las etiquetas del repositorio (Lacoste et al., 2019, sobre estimación de emisiones de carbono en machine learning): https://arxiv.org/abs/1910.09700
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos asociados a este modelo.
