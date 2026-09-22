# smsag007/paraphrase-multilingual-MiniLM-L12-v2-latin

## Resumen

smsag007/paraphrase-multilingual-MiniLM-L12-v2-latin es una variante podada del export ONNX de sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2, un modelo de embeddings de frases basado en un transformer encoder de tipo BERT (MiniLM-L12, 12 capas). No es un modelo generativo: su salida son vectores densos que representan frases completas y se usan para similitud semantica, busqueda y recuperacion.

El unico cambio respecto al original es el vocabulario, que pasa de 250.002 a 128.507 piezas: se conservan todas las piezas escritas en alfabeto latino o en caracteres neutros de script, y se eliminan las que contienen CJK, arabe, devanagari, tailandes, cirilico, griego y otros sistemas de escritura, tanto del tokenizador como de la tabla de embeddings. Las capas del transformer son identicas byte a byte al modelo de partida.

El motivo es el consumo de memoria en entornos moviles: el vocabulario de 250.000 piezas del modelo completo ocupaba alrededor de 1 GB dentro de un WebView movil (medido en un iPhone, que mataba el proceso anfitrion al alcanzar su limite de 2 GB). Esta variante carga en unos 370-400 MB. Fue creada para el plugin de Obsidian Pythia mediante el script `scripts/prune-embedding-model.py`, y solo publica los pesos cuantizados q8 en ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM-L12, 12 capas), orientado a sentence embeddings |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (unico peso publicado: `model_quantized.onnx`, q8) |
| Idiomas soportados | Lenguas con alfabeto latino (validado en aleman, ingles, italiano, espanol y frances); otras escrituras degradan de forma controlada |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (solo q8); repo de 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, un transformer encoder MiniLM-L12 con pooling para producir un vector por frase. La intervencion de este repositorio no modifica ninguna capa del transformer: el trabajo consiste en reemplazar el tokenizador y recortar las filas correspondientes de la tabla de embeddings, de modo que se eliminan las entradas asociadas a piezas no latinas. No hay reentrenamiento ni ajuste fino; el modelo derivado hereda integramente el comportamiento del original en el subconjunto de vocabulario conservado.

La verificacion reportada por el autor es que, para texto en cualquier lengua de alfabeto latino, los vectores de salida son identicos a los del modelo completo (misma segmentacion, mismas filas), con similitud coseno de 1,0000 sobre 408 textos en aleman, ingles, italiano, espanol y frances. Para texto en otras escrituras, la segmentacion pasa a caracteres sueltos y la calidad se degrada, sin errores ni fallos de ejecucion. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens ni el uso de RLHF o DPO en el modelo base original.

## Capacidades

- Generacion de embeddings de frases y parrafos para similitud semantica (feature-extraction, sentence-similarity).
- Recuperacion semantica y busqueda por similitud sobre corpus en lenguas latinas.
- Calculo de similitud coseno entre frases, agrupamiento (clustering) y deduplicacion de documentos.
- Capacidad multilingue limitada a alfabeto latino; fuera de ese conjunto la tokenizacion degrada a caracteres individuales.
- Ejecucion en navegador y en WebView movil mediante transformers.js y ONNX.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni flujos de agentes: es un modelo de representacion, no de decodificacion.

## Casos de uso

- Busqueda semantica en una base de notas de Obsidian: los embeddings permiten recuperar notas relacionadas por significado y no por coincidencia literal, y el recorte de vocabulario mantiene el proceso dentro del limite de memoria del WebView movil.
- Recuperacion (retrieval) en pipelines RAG sobre documentacion en espanol, frances, italiano, aleman o ingles: el modelo genera los vectores de los fragmentos y de la consulta, y el resultado alimenta al generador.
- Deduplicacion de un corpus multilingue latino: agrupando los vectores por similitud coseno se detectan documentos o entradas de FAQ practicamente identicos sin comparar todos los pares de textos.
- Clasificacion y enrutado de tickets de soporte: se calcula el embedding del ticket entrante y se asigna a la categoria cuyo centroide este mas cerca, con coste de inferencia minimo en CPU.
- Recomendacion de contenido por similitud: articulos, productos o respuestas se ordenan segun su distancia vectorial a un elemento de referencia, con soporte para consultas en varias lenguas latinas.
- Indexacion en el dispositivo sin conexion: al cargar en 370-400 MB, el modelo puede ejecutarse en un navegador o una app movil sin enviar el texto del usuario a un servidor.
- Precomputado de embeddings para busqueda vectorial: se generan los vectores en lote con ONNX Runtime y se cargan en un indice (FAISS, hnswlib o similar) para consultas posteriores de baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion aportado por el autor es la equivalencia de salida con el modelo completo en alfabeto latino: similitud coseno de 1,0000 sobre 408 textos en aleman, ingles, italiano, espanol y frances.

## Requisitos de hardware

- Inferencia en CPU: el modelo esta pensado para ejecutarse sin GPU, mediante ONNX Runtime o transformers.js.
- Memoria estimada: unos 370-400 MB en WebView movil segun el autor, frente a aproximadamente 1 GB del modelo completo con vocabulario de 250.002 piezas.
- GPU: no se requieren ni se documentan requisitos de VRAM especificos; cualquier GPU consumer puede alojarlo, pero no aporta ventaja clara frente a CPU por el tamano del modelo.
- Dispositivos objetivo: navegadores de escritorio y moviles, WebView en iOS y Android, y aplicaciones de escritorio como Obsidian.
- Opciones de despliegue: transformers.js (libreria declarada), ONNX Runtime en sus distintos backends; no se documenta soporte para vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponibles; no se publican mediciones mas alla del consumo de memoria.

## Comparativa con modelos similares

| Modelo | Vocabulario | Tamano en memoria | Pesos publicados | Licencia | Notas |
|---|---|---|---|---|---|
| smsag007/paraphrase-multilingual-MiniLM-L12-v2-latin | 128.507 piezas | 370-400 MB en WebView movil | Solo q8 ONNX | apache-2.0 | Identico al base en alfabeto latino; degrada fuera de el |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 250.002 piezas | ~1 GB en WebView movil | safetensors y otros formatos del ecosistema sentence-transformers | apache-2.0 | Modelo base; cobertura multilingue amplia, incluidos CJK, arabe, cirilico y griego |
| Xenova/paraphrase-multilingual-MiniLM-L12-v2 | 250.002 piezas | no disponible | ONNX (export) | apache-2.0 | Export ONNX del que deriva esta variante; mantiene el vocabulario completo |

## Limitaciones y advertencias

- Cobertura linguistica restringida: el texto en chino, arabe, ruso, griego, hindi, tailandes y otras escrituras no latinas se segmenta en caracteres sueltos y la calidad de los embeddings cae de forma notable. No debe usarse para recuperacion multilingue fuera del alfabeto latino.
- La promesa de equivalencia con el modelo base esta acotada explicitamente a lenguas de alfabeto latino y verificada sobre 408 textos de cinco idiomas; no cubre todas las lenguas latinas ni todos los dominios.
- Solo se publican pesos q8 (`model_quantized.onnx`): no hay versiones fp32 o fp16 para comparar ni para maximizar precision.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente de la comunidad ni historial de uso en produccion.
- No se publican resultados de benchmarks estandar (MTEB u otros), de modo que el rendimiento real en tareas de recuperacion no esta cuantificado.
- Es un modelo de embeddings: puede producir similitudes altas entre textos distintos y no debe emplearse para generar respuestas ni como verificador de hechos por si solo.
- Hereda los sesgos presentes en los datos de entrenamiento del modelo base, que no se documentan en la informacion disponible.
- Licencia apache-2.0: permite uso comercial y modificacion, con la obligacion habitual de conservar avisos de licencia y atribucion al trabajo original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smsag007/paraphrase-multilingual-MiniLM-L12-v2-latin
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Export ONNX del que deriva: https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2
- Plugin Pythia para Obsidian: https://github.com/smsag/pythia
- Script de poda que reproduce la variante: https://github.com/smsag/pythia/blob/main/scripts/prune-embedding-model.py
- Resultados de busqueda web: no se han encontrado enlaces relevantes a este modelo en la busqueda realizada; los resultados devueltos corresponden a documentacion de OpenAI y no guardan relacion con esta ficha.
