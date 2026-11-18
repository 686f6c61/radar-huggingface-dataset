# sinahatami/holdsup-reranker

## Resumen

holds up-reranker es un cross-encoder pequeno (22,7 millones de parametros) desarrollado por el usuario sinahatami, pensado para una tarea muy concreta: reordenar candidatos estadisticos para una afirmacion numerica. Dada una frase como "la tasa de paro juvenil en Espana fue del 55% en 2013" y las 8 entradas de catalogo que devuelve una busqueda por embeddings, el modelo puntua cada par afirmacion-entrada para que la estadistica correcta quede en primera posicion. Forma parte de HoldsUp, un auditor de afirmaciones estadisticas en el que un margen suficientemente amplio permite evitar una llamada a un modelo de lenguaje.

El modelo parte del cross-encoder/ms-marco-MiniLM-L6-v2, un MiniLM de tipo BERT de 6 capas, y se ha afinado sobre pares construidos a partir de 106 afirmaciones del split de desarrollo y 423 parafrasis generadas por modelos de lenguaje, hasta un total de 4.244 pares de entrenamiento. No es un modelo generativo ni un asistente general: es un componente de ranking dentro de un pipeline de verificacion de datos, con licencia Apache 2.0 y exportaciones ONNX en fp32 e int8.

Su relevancia practica esta en el salto de calidad que aporta el reordenado: sobre el split de desarrollo, el top-1 pasa del 68,9% de la busqueda por embeddings sola al 94,2% con el reranker afinado, y el MRR@8 de 0,794 a 0,966. El coste es bajo: 23 MB en int8 y unos 152 ms por afirmacion en dos hilos de CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en BERT (MiniLM-L6, 6 capas) |
| Parametros totales | 22.713.601 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 y int8 (exportaciones ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX (model.onnx, tokenizer.json, reranker.json) |

## Arquitectura y entrenamiento

La arquitectura es la de un cross-encoder clasico: un transformer BERT MiniLM de 6 capas que recibe el par (afirmacion, entrada de catalogo) de forma conjunta y produce un logit de relevancia. La entrada de catalogo sigue el formato `name (unit). Also called: aliases. definition`. Los pesos de partida son los de cross-encoder/ms-marco-MiniLM-L6-v2, afinado especificamente para esta tarea de seleccion estadistica.

El conjunto de entrenamiento se construyo a partir de 106 afirmaciones del split de desarrollo del benchmark (eval 0.2.0), de las cuales 103 tenian una estadistica en el catalogo (55 distintas, catalogo 0.8.0). Se generaron 423 parafrasis con modelos de lenguaje (120 con gemini-flash/gemini-3.5-flash y 303 con groq-gpt-oss-120b/openai/gpt-oss-120b), dando 529 frases de consulta. Cada consulta se emparejo con las 8 entradas de catalogo mejor situadas por la busqueda, con un positivo y el resto como negativos duros; 12 consultas tenian su estadistica fuera del top-8 y se anadieron como positivos solo para entrenamiento. En total, 4.244 pares. Se uso validacion cruzada de 5 pliegues agrupada por estadistica y lugar, de modo que una frase y sus variantes quedan en el mismo pliegue. No se empleo ningun dato del split de test (los parafraseos se usan para entrenar, nunca para puntuar) y el constructor de datos rechaza ejemplos filtrados, con una prueba de fugas (ml/tests/test_leakage.py) que lo verifica.

## Capacidades

- Ranking de pares afirmacion-entrada estadistica mediante logits; una sigmoide los convierte en probabilidades entre 0 y 1.
- Seleccion de la estadistica correcta entre un conjunto de candidatos devueltos por una busqueda por embeddings.
- Manejo de entradas con nombre, unidad, alias y definicion.
- Uso como filtro de confianza: un margen amplio entre el primer y el segundo candidato permite omitir una llamada a un modelo de lenguaje en el pipeline HoldsUp.
- Inferencia ligera mediante ONNX Runtime y tokenizers, sin necesidad de PyTorch.
- No soporta generacion de texto, tool calling, agentes, vision ni audio; su alcance es exclusivamente el ranking.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Verificacion de afirmaciones estadisticas en redaccion periodistica: dado un dato citado en un articulo, el reranker selecciona la entrada de catalogo correcta entre las candidatas y permite contrastar valor, unidad y periodo antes de publicar.
- Auditoria de informes economicos y de empleo: en un pipeline que extrae afirmaciones numericas de documentos, el modelo prioriza la estadistica adecuada (paro, PIB, poblacion) y reduce falsos emparejamientos en la fase de comprobacion.
- Filtro previo en sistemas de fact-checking con LLM: cuando el margen de puntuacion supera un umbral, el sistema evita la llamada al modelo generativo, con el consiguiente ahorro de coste y latencia en volumen alto.
- Enriquecimiento de bases de datos de indicadores: al integrar nuevas frases en un catalogo de estadisticas, el reranker ayuda a asignar cada afirmacion a la entrada correcta de forma semiautomatica.
- Despliegue en entornos con recursos limitados: con 23 MB en int8 y ejecucion en CPU con ONNX Runtime, encaja en servicios edge o contenedores pequenos donde no cabe un LLM.
- Componente de evaluacion en investigacion sobre recuperacion: sirve como reranker de referencia en experimentos de ranking de candidatos estadisticos, con metricas reproducibles de top-1 y MRR@8.

## Benchmarks y rendimiento

Resultados con validacion cruzada sobre el split de desarrollo (103 afirmaciones con estadistica en catalogo):

| Afirmaciones | Ranker | n | Top-1 | Recall@8 | MRR@8 |
|---|---|---:|---:|---:|---:|
| Todas | Busqueda por embeddings sola | 103 | 68,9% | 99,0% | 0,794 |
| Todas | Cross-encoder base sin afinar | 103 | 80,6% | 99,0% | 0,888 |
| Todas | Reranker afinado | 103 | 94,2% | 99,0% | 0,966 |
| Estadistica vista en entrenamiento | Busqueda por embeddings sola | 31 | 48,4% | 100,0% | 0,650 |
| Estadistica vista en entrenamiento | Cross-encoder base sin afinar | 31 | 77,4% | 100,0% | 0,866 |
| Estadistica vista en entrenamiento | Reranker afinado | 31 | 100,0% | 100,0% | 1,000 |
| Estadistica no vista | Busqueda por embeddings sola | 72 | 77,8% | 98,6% | 0,856 |
| Estadistica no vista | Cross-encoder base sin afinar | 72 | 81,9% | 98,6% | 0,897 |
| Estadistica no vista | Reranker afinado | 72 | 91,7% | 98,6% | 0,951 |

Rendimiento de las exportaciones (onnxruntime, 2 hilos de CPU, 8 candidatos por afirmacion, 106 afirmaciones):

| Exportacion | Tamano | Mediana por afirmacion | p95 por afirmacion |
|---|---:|---:|---:|
| fp32 | 91,0 MB | 161,6 ms | 207,5 ms |
| int8 | 23,0 MB | 152,2 ms | 192,8 ms |

La exportacion fp32 reproduce la salida del modelo en torch (diferencia maxima de logit de 5,7e-06). La int8 coloca la misma estadistica en primera posicion en el 98,1% de las citas del split de desarrollo, con diferencias de probabilidad de hasta 0,163 respecto a fp32.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo cabe en memoria de sistema con holgura (91 MB en fp32, 23 MB en int8).
- GPU recomendadas: no disponibles ni necesarias; cualquier GPU moderna puede ejecutarlo, pero el caso de uso previsto es CPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: ONNX Runtime con tokenizers (exportaciones incluidas), sentence-transformers con CrossEncoder, y text-embeddings-inference segun los tags del repositorio.
- Latencia: mediana de 161,6 ms y p95 de 207,5 ms por afirmacion en fp32; 152,2 ms y 192,8 ms en int8, con 2 hilos de CPU y 8 candidatos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Top-1 (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| holds up-reranker (este) | 22,7 M | no disponible | 94,2% | Apache 2.0 | Hugging Face |
| cross-encoder/ms-marco-MiniLM-L6-v2 (base) | 22,7 M | no disponible | 80,6% (sin afinar en esta tarea) | Apache 2.0 | Hugging Face |
| Busqueda por embeddings sola (referencia del pipeline) | no disponible | no disponible | 68,9% | no disponible | no disponible |

La comparativa se limita a las alternativas evaluadas en la model card; no se dispone de datos de otros rerankers genericos en esta tarea concreta.

## Limitaciones y advertencias

- Entrenado con solo 106 afirmaciones en ingles sobre estadisticas europeas y mundiales (empleo, economia, poblacion, salud, energia) y sus parafrasis; conoce mejor las 55 entradas de catalogo que aparecen en esos datos. Sobre estadisticas no vistas, el top-1 baja al 91,7%.
- Solo reordena lo que la busqueda ha encontrado: no puede recuperar una estadistica que quede fuera del top-8 de candidatos.
- Las parafrasis provienen de modelos de lenguaje y conservan numeros, lugar y periodo de cada afirmacion; los enunciados reales son mas variados y pueden degradar el rendimiento.
- El split de test del benchmark no se ha usado; la evaluacion final sobre el se reporta por separado, por lo que las cifras presentadas son de validacion cruzada en desarrollo.
- Idioma limitado al ingles; no hay soporte multilingue declarado.
- Riesgo de alucinacion no aplicable en el sentido generativo (no produce texto), pero si de emparejamiento erroneo cuando las entradas candidatas son muy similares.
- Licencia Apache 2.0, que permite uso comercial; conviene revisar igualmente las condiciones del modelo base y de los datos de entrenamiento derivados de modelos de lenguaje de terceros.
- En produccion, la cuantizacion int8 altera las probabilidades hasta 0,163; si el umbral de decision depende de la calibracion, debe reajustarse sobre la exportacion int8.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sinahatami/holdsup-reranker
- Modelo base: https://huggingface.co/cross-encoder/ms-marco-MiniLM-L6-v2
