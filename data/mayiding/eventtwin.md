# MaYiding/EventTwin

## Resumen

EventTwin v1.0 es un cross-encoder en chino de 567.755.777 parametros (568M) disenado especificamente para juzgar si dos descripciones de eventos se refieren al mismo evento del mundo real (correferencia de eventos entre documentos y deduplicacion de noticias). Lo desarrolla MaYiding y se distribuye bajo licencia Apache 2.0, heredada de su modelo base BAAI/bge-reranker-v2-m3. A diferencia de un embedding o reranker generico, que mide similitud tematica, EventTwin produce directamente una probabilidad calibrada de "mismo evento" en el rango 0-1.

El modelo resuelve un problema concreto en sistemas de inteligencia, monitorizacion de opinion publica y agregacion de noticias: dos articulos pueden tratar el mismo tema (por ejemplo, una empresa y un producto) sin narrar el mismo evento, y los embeddings genericos tienden a fusionarlos de forma incorrecta. EventTwin se entrena mediante destilacion de etiquetas blandas a partir de un modelo profesor comercial y anade calibracion de temperatura, de modo que su salida puede usarse como probabilidad real y no solo como una puntuacion ordinal.

Su relevancia actual radica en que ofrece, con solo 568M de parametros y 2-5 ms por par en una sola GPU, una alternativa local y de licencia permisiva para tareas de agrupacion de eventos en linea, donde hasta ahora se dependia de APIs cerradas o de embeddings de mayor tamano con calibracion pobre (ECE 0.563 en el embedding-8B de referencia frente a 0.187 de EventTwin).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en transformer (XLM-RoBERTa), fine-tuning de BAAI/bge-reranker-v2-m3 |
| Parametros totales | 567.755.777 (568M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (max_length de entrenamiento e inferencia, con truncacion) |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se documentan versiones GGUF, INT8 o INT4) |
| Idiomas soportados | Chino (zh) exclusivamente |
| Licencia | Apache 2.0 (modelo); los datos de entrenamiento en EventTwin-Data usan CC BY-NC 4.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

EventTwin es un cross-encoder: recibe un par de textos (evento A, evento B) de forma conjunta y emite un unico logit que, tras dividirse por una temperatura T=0.824 y aplicarse una sigmoide, se convierte en la probabilidad de que ambos describan el mismo evento. Parte de BAAI/bge-reranker-v2-m3 (568M, Apache 2.0) y se ajusta con fine-tuning completo durante 3 epocas, batch 16, learning rate 2e-5, max_len 512 y recorte de etiquetas al rango [0.05, 0.95]. El entrenamiento completo se ejecuto en una unica RTX 4090D de 24 GB en aproximadamente 40 minutos.

El entrenamiento combina tres tecnicas. Primero, destilacion con etiquetas blandas: el profesor es un modelo de juicio comercial (API cerrada) que devuelve probabilidades en lugar de texto, y el estudiante se optimiza con BCE sobre esas probabilidades calibradas. Segundo, aumento de datos con pares parafraseados sintetizados por un LLM, que generan "la misma noticia contada por otro medio" preservando sujeto, objeto, tiempo y accion pero variando la formulacion. Tercero, calibracion posterior de la temperatura mediante LBFGS sobre el conjunto de validacion (metodo de Guo et al. 2017), que fija T=0.824 y deja un ECE de 0.187.

El conjunto de datos total es de 24.308 pares (19.446 de entrenamiento, 2.430 de validacion y 2.432 de test, con particion estratificada por tiempo). Los 4.593 pares positivos se reparten entre 1.495 parafrasis sinteticas, 1.482 reproducciones entre fuentes, 780 pares dentro de conglomerados multi-miembro, 442 de alta confianza en la distribucion de juicio, 236 de decisiones de fusion y 86 de revision mas 72 de arbitraje invertido. Los negativos se basan mayoritariamente en hard negatives del tipo "misma entidad x mismo tipo x ventana temporal solapada", filtrados por margen para descartar falsos negativos. El corpus de dominio procede de 30 empresas chinas de tecnologia, automocion e internet (enero de 2024 a septiembre de 2026), con 4.587 articulos y 10.277 menciones de eventos.

## Capacidades

- Juicio de mismo evento: dado un par de descripciones de eventos en chino (menciones de noticias, resumenes o tarjetas de conglomerado), devuelve una probabilidad calibrada de que sea el mismo evento real.
- Deduplicacion de noticias y agrupacion en linea: permite asignar menciones a conglomerados existentes mediante umbrales de probabilidad.
- Entrada estructurada opcional: acepta tipo de evento, rango temporal y evidencia textual concatenados al texto, formato con el que fue entrenado y que mejora el rendimiento.
- Deteccion de eventos distintos con alta fiabilidad: obtiene 0.998 de exactitud en el estrato de negativos claros, evitando fusionar noticias tematicamente parecidas pero de eventos diferentes.
- Distincion de eventos finos del mismo tipo: por ejemplo, dos ajustes de precio del mismo producto se tratan como dos eventos distintos si difieren en el tiempo o la accion.
- Calibracion nativa: la salida es utilizable directamente como probabilidad (ECE 0.187) sin recalibracion externa, gracias a la temperatura publicada en calibration.json.
- Compatibilidad de despliegue: etiquetado con text-embeddings-inference y endpoints_compatible, ademas de uso estandar con transformers.
- No soporta generacion de texto, tool calling, razonamiento multi-paso, vision ni audio; su unica funcion es la clasificacion binaria de pares.

## Casos de uso

- Deduplicacion de noticias en sistemas de monitorizacion: cada mencion entrante de un medio se compara contra las tarjetas de eventos activos y se fusiona cuando la probabilidad supera un umbral; los 512 tokens de contexto permiten incluir tipo y ventana temporal.
- Agrupacion en linea de eventos para inteligencia de fuentes abiertas: mantiene conglomerados actualizados en tiempo real con 2-5 ms por par, lo que permite procesar flujos de noticias sin lote previo.
- Consolidacion entre medios de un mismo suceso: el modelo esta entrenado con pares de reproduccion entre fuentes, de modo que reconoce la misma noticia reescrita por medios distintos aunque cambie el titular.
- Gobernanza de tarjetas de evento en un EventRAG: antes de insertar una mencion en la base de conocimiento de eventos, se valida si corresponde a un evento ya registrado, evitando duplicados que degradan la recuperacion.
- Deteccion de eventos distintos para alertas de mercado: por ejemplo, dos anuncios de ajuste de precio del mismo producto se distinguen como eventos separados, lo que evita colapsar senales relevantes para seguimiento financiero.
- Enrutamiento por banda de confianza: la calibracion permite dirigir los casos de probabilidad intermedia (zona gris, AUROC 0.8662) a revision humana y automatizar los extremos, reduciendo coste de anotacion.
- Despliegue en local con requisitos modestos: al ser un modelo de 568M, puede ejecutarse en CPU con ONNX para volumenes moderados o en una GPU de consumo para alto rendimiento, sin depender de APIs de pago.

## Benchmarks y rendimiento

Resultados sobre el benchmark propio de 1.000 pares con doble confirmacion de profesor:

| Estrato | n | AUROC | acc@mejor umbral |
|---|---|---|---|
| Global (OVERALL) | 1.000 | 0,9094 | 0,863 |
| Zona gris (mas dificil) | 300 | 0,8662 | 0,853 |
| Negativos claros | 400 | No disponible | 0,998 |
| Positivos claros | 300 | 0,7671 | 0,753 |

Comparativa con el profesor y un embedding generico, segun la model card:

| Discriminador | AUROC | pos-AUROC (estrato dificil) | Concordancia con el profesor | ECE |
|---|---|---|---|---|
| Profesor (modelo comercial cerrado) | 0,998 | 0,992 | No disponible | 0,062 |
| Embedding generico 8B (coseno) | 0,977 | 0,903 | 0,657 | 0,563 |
| EventTwin v1.0 | 0,909 | 0,767 | 0,796 | 0,187 |

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 568M parametros, no publicada por el autor): aproximadamente 2,3 GB en FP32, 1,14 GB en FP16/BF16 y 0,6 GB en INT8, sin contar el pico de activaciones.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. El entrenamiento se realizo en una RTX 4090D de 24 GB; para inferencia bastan RTX 3060, RTX 4060, RTX 4090 o superiores. En centro de datos, A100, H100 o L4 son mas que suficientes.
- Compatibilidad con GPU de consumo: si, cabe con holgura en practicamente cualquier GPU de consumo moderna, incluidas las de gama de entrada con 4-6 GB.
- CPU: viable gracias al tamanio reducido y a la ruta ONNX-CPU documentada en el repositorio de GitHub.
- Opciones de despliegue: transformers (AutoModelForSequenceClassification), ONNX en CPU, y compatibilidad declarada con text-embeddings-inference y endpoints compatibles.
- Latencia y throughput: 2-5 ms por par en una unica GPU segun la model card. No se proporcionan cifras de throughput agregado ni de latencia en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EventTwin v1.0 | 568M | 512 tokens | Cross-encoder de mismo evento, probabilidad calibrada | Apache 2.0 | HuggingFace (MaYiding/EventTwin) |
| BAAI/bge-reranker-v2-m3 (base) | 568M | 512 tokens | Reranker generico de relevancia | Apache 2.0 | HuggingFace (BAAI) |
| Embedding generico 8B | ~8.000M | No disponible | Similitud por coseno entre embeddings | No disponible | No disponible |
| Profesor comercial (API cerrada) | No disponible | No disponible | Juicio de mismo evento con probabilidad | Propietaria | Solo API comercial |

Frente al reranker base, EventTwin anade la nocion especifica de "mismo evento" y la calibracion de probabilidad; frente al embedding de 8B, ofrece mejor calibracion (ECE 0.187 frente a 0.563) y concordancia con el profesor (0,796 frente a 0,657) con un decimo de parametros; frente al profesor cerrado, pierde precision en el estrato de positivos claros (0,767 frente a 0,992) pero es local, de licencia permisiva y sustancialmente mas barato de operar.

## Limitaciones y advertencias

- Punto debil en pares positivos con redaccion muy diversa: AUROC de 0,7671 en el estrato pos frente a 0,992 del profesor, lo que limita el rendimiento cuando las dos descripciones del mismo evento usan vocabulario muy distinto.
- Techo de ruido del profesor: la concordancia con el profesor esta limitada por la consistencia entre anotadores humanos (aproximadamente 85%), de modo que el 0,796 observado ya esta cerca de ese limite.
- Sesgo de dominio: entrenado y evaluado exclusivamente sobre noticias de 30 empresas chinas de tecnologia, automocion e internet (2024-2026); el comportamiento en redes sociales, textos academicos o documentos legales no ha sido validado.
- Solo chino: no se ha entrenado ni evaluado en otros idiomas, por lo que su uso en textos multilingues no es fiable.
- Diseno restrictivo: el modelo mide "mismo evento" y no "eventos relacionados", de forma deliberada; dos eventos tematicamente proximos pero distintos obtendran puntuaciones bajas, lo que puede ser contraproducente si se espera agrupacion tematica.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es un falso positivo o falso negativo en la clasificacion, mitigable con la banda de confianza calibrada.
- Licencia del modelo Apache 2.0, apta para uso comercial. Atencion: el conjunto de datos EventTwin-Data se publica bajo CC BY-NC 4.0, por lo que su reutilizacion comercial requeriria revisar esa restriccion, aunque el modelo entrenado no la hereda.
- Numero de descargas y likes registrados en HuggingFace: 0 en el momento de la consulta, lo que implica escasa validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MaYiding/EventTwin
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Conjunto de datos EventTwin-Data: https://huggingface.co/datasets/MaYiding/EventTwin-Data
- Repositorio GitHub (incluye inference.py y documentacion): https://github.com/MaYiding/EventTwin
- Notas de entrenamiento: https://github.com/MaYiding/EventTwin/blob/main/docs/training-notes.md
- Mapeo de versiones: https://github.com/MaYiding/EventTwin/blob/main/VERSIONS.md
