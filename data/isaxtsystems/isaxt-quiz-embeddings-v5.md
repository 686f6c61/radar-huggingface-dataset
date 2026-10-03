# isaxtsystems/isaxt-quiz-embeddings-v5

## Resumen

ISAXT Quiz Embeddings v5 es un codificador de recuperacion (retrieval encoder) desarrollado por isaxtsystems bajo el sello VELXT Studio, dentro de la familia ISAXT. No es un modelo generativo: no escribe texto ni responde preguntas directamente. Su funcion es recibir una pregunta de trivia (o una parafrasis) y devolver un unico vector de 128 dimensiones normalizado en L2, que se compara por similitud coseno contra una base de vectores ya almacenados para recuperar la pregunta mas cercana y servir su respuesta verificada tal cual.

Tecnicamente es un `BertModel` diminuto derivado de `prajjwal1/bert-tiny`, con 2 capas, 2 cabezas de atencion, hidden de 128 e intermediate de 512, lo que da un total de 4.385.920 parametros. Se entreno con objetivo contrastivo InfoNCE (temperatura 0,05) sobre 106.873 tripletas y una longitud maxima de 128 tokens, en solo 2 epocas y 30,23 minutos de CPU (sin GPU). Esta pensado para escenarios de recuperacion cerrada donde la respuesta correcta ya existe en el corpus y no debe generarse.

Su relevancia es acotada pero concreta: es un artefacto de servicio (se exporta a ONNX fp32 e INT8) para pipelines de trivia/QA con etiquetas verificadas, cubriendo 30 categorias. No es un modelo conversacional ni un LLM, y su publico objetivo son sistemas de recuperacion con respuestas prefijadas, no agentes generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `BertModel` (2 capas, 2 cabezas de atencion, hidden 128, intermediate 512) |
| Parametros totales | 4.385.920 |
| Longitud de contexto | 128 tokens (max sequence length) |
| Tipos de cuantizacion | fp32 y INT8 dinamico (exportacion ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y ONNX (fp32 `model.onnx` + `model.int8.onnx`) |
| Modelo base | `prajjwal1/bert-tiny` |
| Salida | embedding de 128 dim, mean-pooled sobre la mascara de atencion, L2-normalizado |
| Objetivo de entrenamiento | contrastivo InfoNCE, temperatura 0,05 |

## Arquitectura y entrenamiento

Se trata de un transformer encoder BERT en miniatura (`bert-tiny`): 2 capas de atencion, 2 cabezas, dimension oculta de 128 y feed-forward de 512. El `hidden_size` de 128 proviene directamente del modelo base, no de una cabeza de proyeccion anadida. La reduccion del vector final es un mean-pooling sobre la mascara de atencion seguido de una normalizacion L2, de modo que la similitud coseno entre vectores queda reducida a un producto escalar.

El entrenamiento usa un objetivo contrastivo InfoNCE con temperatura 0,05, curriculum activado, batch size 8, learning rate 1e-5 con warmup lineal del 10%, semilla 20260915, y early stopping con paciencia 2 que nunca se activo. Se ejecuto enteramente en CPU (el entrenador no tiene ruta de codigo para GPU) durante 30,23 minutos, con 2 epocas: la perdida de validacion paso de 1,754241 (epoca 1) a 1,748240 (epoca 2). El corpus de entrenamiento consta de 11.172 filas, de las cuales 11.167 pertenecen al tenant de entrenamiento, y se generaron 106.873 tripletas contrastivas (pregunta + negativos duros) sin ninguna llamada a API: cada pregunta se redacto desde un pool de hechos verificados local. Antes de este entrenamiento se retiraron 265 filas con fuga o de relleno (preguntas que enunciaban su propia respuesta o circulares), y la deduplicacion combino coincidencia exacta, difusa (Dice > 0,95) y semantica (coseno > 0,98), sin duplicados resultantes.

## Capacidades

- Recuperacion semantica de preguntas: dado un texto de consulta, devuelve un embedding de 128 dimensiones para busqueda por similitud coseno.
- Matching pregunta-parafrasis: reconoce reformulaciones de una pregunta almacenada y devuelve la entrada mas cercana del corpus.
- Servicio sobre corpus cerrado: la respuesta se devuelve de forma literal desde el almacen, sin generacion.
- Cobertura de 30 categorias tematicas: arte, astronomia, biologia, juegos de mesa, quimica, economia, comida, general, geografia, historia, derecho, literatura, matematicas, medicina, peliculas, musica, mitologia, personajes, filosofia, fisica, ciencia politica, politica, psicologia, ciencia, sociologia, deportes, tecnologia, television, videojuegos y anime.
- Exportacion ONNX para CPU: grafos fp32 y INT8 dinamico para despliegue ligero.
- Inferencia rapida y de bajo coste: modelo de 4,4 M de parametros apto para CPU.

No dispone de generacion de texto, tool calling, function calling, razonamiento multi-paso, vision, audio ni modo thinking. No puede seleccionar opciones tipo A/B/C/D.

## Casos de uso

- Recuperacion de respuestas verificadas en un bot de trivia: el modelo convierte la pregunta del usuario en un vector, se busca la pregunta mas cercana en el corpus y se devuelve su respuesta almacenada de forma literal, evitando alucinaciones.
- Deduplicacion semantica de un banco de preguntas: se indexan todas las preguntas y se detectan pares con coseno superior a un umbral para fusionar duplicados antes de publicar un cuestionario.
- Enrutado por categoria: el embedding permite agrupar consultas entrantes por similitud con centroides de las 30 categorias y dirigirlas al modulo o persona adecuada.
- Prevencion de respuestas inventadas en sistemas QA cerrados: al no generar texto, garantiza que solo se sirven respuestas que existen y estan verificadas en la base.
- Busqueda de similitud en aplicaciones moviles o embebidas: al pesar unos 17,5 MB en fp32 y unos 4,4 MB en INT8, puede ejecutarse en CPU en dispositivos sin GPU.
- Normalizacion de consultas en un pipeline de datos: unificar variantes de la misma pregunta para mantener un corpus canonico y sin redundancias.
- Despliegue de bajo coste en produccion: el artefacto ONNX INT8 permite servir recuperacion en CPU con consumo minimo de recursos.

## Benchmarks y rendimiento

| Metrica | Valor | Como se midio |
|---|---|---|
| best_val_loss | 1,748240 | `train_embeddings.py`, 2 epocas (epoca 1: 1,754241; epoca 2: 1,748240), semilla 20260915 |
| held-out acc@1 | 0,9998 | `evaluate_retrieval.py --v2`, split de test de 13.316 filas |
| held-out MRR | 0,9999 | misma ejecucion, mismas filas |
| zero-shot base acc@1 | 0,9887 | `prajjwal1/bert-tiny` sobre las mismas 13.316 filas (comparacion emparejada) |
| zero-shot base MRR | 0,9934 | misma medicion |
| torch vs fp32 ONNX | min 1.000000 (entrada truncada en la model card) | verificacion de ida y vuelta ONNX |

La model card advierte expresamente de que las cifras de la version anterior (v4a, `acc@1 0.9975`) no deben usarse como comparacion, porque se midieron sobre un corpus con fuga (216 preguntas que enunciaban su respuesta y 82 circulares). Las metricas de esta v5 se obtuvieron tras retirar esas 265 filas, por lo que son mas bajas pero mas fiables.

## Requisitos de hardware

- Peso en memoria de los parametros: aproximadamente 17,5 MB en fp32 y unos 4,4 MB en INT8.
- VRAM estimada: muy baja; el modelo y sus activaciones caben holgadamente en cualquier GPU de consumo, e incluso en CPU.
- GPU recomendadas: no requiere GPU. Cualquier GPU consumer (por ejemplo, serie RTX 30/40) es mas que suficiente; A100 o H100 resultan innecesarias.
- Encaja en GPU de consumo: si, sin problemas, e igualmente en CPU.
- Opciones de despliegue: `transformers` con PyTorch (permite batching), ONNX Runtime (ejecucion en CPU); vLLM, llama.cpp, Ollama o TGI no son aplicables a este artefacto al no ser un modelo generativo ni estar en formato GGUF.
- Latencia y throughput: no disponible; la model card solo indica que el entrenamiento completo en CPU tardo 30,23 minutos y que la exportacion ONNX fuerza batch size 1.

## Comparativa con modelos similares

| Modelo | Parametros | Capas / hidden | Contexto | Tipo | Licencia |
|---|---|---|---|---|---|
| ISAXT Quiz Embeddings v5 | 4.385.920 | 2 / 128 | 128 tokens | Encoder de recuperacion (fine-tune) | no disponible |
| `prajjwal1/bert-tiny` (base) | no disponible | 2 / 128 | 512 tokens (BERT estandar) | Encoder BERT preentrenado | no disponible |
| all-MiniLM-L6-v2 | no disponible | 6 / 384 | 256-512 tokens (segun configuracion) | Encoder de sentence embeddings | no disponible |

La unica comparacion cuantitativa disponible es contra el propio modelo base `prajjwal1/bert-tiny` (acc@1 zero-shot 0,9887 frente a 0,9998 del fine-tune). No se dispone de datos de benchmarks frente a otros encoders de embeddings independientes, por lo que no se puede comparar rendimiento con `all-MiniLM-L6-v2` ni alternativas equivalentes.

## Limitaciones y advertencias

- No es un modelo generativo: no escribe texto, no responde preguntas y no puede elegir entre opciones A/B/C/D.
- Fuera de las 30 categorias declaradas, el modelo fallara en lugar de adivinar.
- Longitud de contexto limitada a 128 tokens: consultas largas se truncan.
- Restriccion dura en ONNX: los grafos exportados solo aceptan batch size 1 y fallan con cualquier entrada de mas de una fila (`Shape mismatch attempting to re-use buffer. {1,128,128} != {2,128,128}`). Hay que iterar consulta a consulta o usar el encoder de `transformers`. El eje de secuencia si es dinamico.
- Licencia no disponible: no puede asumirse uso comercial sin conocer los terminos.
- Idioma no declarado en la ficha de HuggingFace; el entrenamiento parte de un pool de hechos verificado cuya composicion linguistica no se especifica.
- El corpus incluye filas de Open Trivia DB sujetas a licencia CC-BY-SA 4.0, dato relevante para la redistribucion.
- Modelo con 0 descargas y 0 likes: sin validacion externa de la comunidad en el momento del analisis.
- Riesgo de falso positivo si el corpus almacenado contiene preguntas muy parecidas entre si; conviene calibrar el umbral de coseno.
- Toda la calidad del sistema depende de la verificacion de las respuestas almacenadas, ya que el modelo no evalua su correccion.
- Fechas de creacion y actualizacion del repositorio (2026-10-03) son posteriores a la fecha habitual de referencia; conviene verificar la vigencia del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/isaxtsystems/isaxt-quiz-embeddings-v5
- Modelo base: https://huggingface.co/prajjwal1/bert-tiny
- Scripts referenciados en la model card: `ml/scripts/verify_onnx_roundtrip.py`, `train_embeddings.py`, `evaluate_retrieval.py --v2` (sin URL publica indicada)
- Paper, blog, repositorio o demo adicionales: no disponible
