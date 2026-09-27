# mradermacher/Jev-Style-2B-Decision-v3-GGUF

## Resumen

Jev-Style-2B-Decision-v3-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo Jev-Style-2B-Decision-v3, publicado por el usuario mradermacher. El modelo base lo desarrolla chaoliangUNSW y pertenece a la familia Jev, descrita por sus promotores (TypeSafe AI) como un "System One model": en lugar de mantener una conversacion, devuelve una decision, una puntuacion o una probabilidad de si/no sobre un conjunto de opciones. Es, por tanto, un modelo orientado a clasificacion y eleccion calibrada, no a generacion de texto abierta.

El repositorio que nos ocupa no aporta model card propia mas alla de los metadatos de conversion: se generan cuantizaciones estaticas del modelo original en x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 e IQ4_XS. La unica cifra concreta confirmada es el tamano del fichero Q4_K_M, 1,27 GB, segun el repositorio espejo en GitHub.

Su relevancia practica es la de un modelo pequeno (2B) de decision pensado para ejecutarse en local con llama.cpp y devolver un veredicto en una unica posicion de salida, con un scorer auxiliar (jev-score-v2) incluido. No obstante, conviene advertir que el repositorio tiene cero descargas y cero "likes" en el momento de la consulta, y que no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (inferido del tamano de parametros y del pipeline de cuantizacion de llama.cpp); no se detalla en la informacion disponible |
| Parametros totales | 2B (aproximadamente 2.000 millones, segun el nombre del modelo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible para esta variante. Como referencia de la misma familia: la v2 de 2B declaraba 1.024 tokens de entrada y la v3 de 0,8B declara 25.600 tokens |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible. La variante 0,8B v3 de la misma familia declara 51 idiomas |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se publica tambien en Transformers y MLX segun la web del proyecto |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna ni el proceso de entrenamiento de Jev-Style-2B-Decision-v3. Los metadatos de conversion presentes en el repositorio (quantize_version: 2, output_tensor_quantised: 1, convert_type: hf) indican que el modelo base se convirtio desde pesos en formato Hugging Face y que la salida fue cuantizada, lo que es coherente con un transformer denso convertido al ecosistema llama.cpp. No se especifican numero de tokens de entrenamiento, composicion del dataset, uso de RLHF o DPO, ni innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, etc.).

Lo unico reseñable en cuanto a funcionamiento es la forma de inferencia descrita por el repositorio espejo en GitHub: el modelo emite la decision en una unica "verdict slot" por opcion, y se distribuye junto a un scorer pequeno denominado jev-score-v2 que lee ese veredicto. La documentacion de la familia indica que el objetivo es producir decisiones calibradas (eleccion, puntuacion o probabilidad de si/no), y que la v2 de 2B se evaluo en clasificacion en ingles sobre 11 tareas retenidas. No hay datos equivalentes publicados para la v3.

## Capacidades

- Decision entre opciones: devuelve una eleccion sobre un conjunto de alternativas en lugar de texto generativo.
- Puntuacion (scoring) y probabilidad de si/no con calibracion de confianza, segun la descripcion del proyecto.
- Clasificacion de texto: la version v2 de 2B se describe como una tarea de clasificacion calibrada en ingles sobre 11 tareas retenidas.
- Lectura del veredicto mediante el scorer auxiliar jev-score-v2, incluido en los builds GGUF.
- Ejecucion local en CPU/GPU a traves de llama.cpp, gracias al formato GGUF.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles.
- Capacidades multilingues: no disponibles para esta variante (la 0,8B v3 de la familia declara 51 idiomas).
- Modo "thinking", vision o audio: no disponibles.
- Generacion de texto libre conversacional: no es la funcion declarada del modelo.

## Casos de uso

- Enrutado de peticiones en un backend: dado un texto de entrada y un conjunto cerrado de categorias o intenciones, el modelo devuelve una unica etiqueta; su tamano de 2B y su cuantizacion Q4_K_M de 1,27 GB permiten ejecutarlo junto al servicio principal sin despliegues GPU grandes.
- Moderacion o triaje de contenido: clasificacion binaria (permitir / revisar) con una probabilidad calibrada que puede umbralizarse segun la politica de riesgo del producto.
- Seleccion de la mejor respuesta entre candidatas: con un modelo generativo que produzca N respuestas, este modelo actua como reranker o juez de eleccion, escogiendo la opcion preferida mediante el verdict slot.
- Etiquetado a escala de corpus: procesamiento por lotes con llama.cpp para asignar categorias a grandes volumenes de documentos, aprovechando que la salida es una decision y no texto libre, lo que simplifica el parseo.
- Validacion en pipelines de datos: comprobacion automatica de si un registro cumple un criterio (si/no) antes de insertarlo en un almacen, con la probabilidad devuelta como senal de confianza.
- Filtrado previo a un modelo mayor: uso como primera etapa de bajo coste que descarta o preselecciona entradas antes de invocar un LLM mas caro, reduciendo el gasto en tokens.
- Integracion en aplicaciones de escritorio o edge: al ser un GGUF de 2B ejecutable en llama.cpp, encaja en entornos sin GPU dedicada donde no es viable desplegar un modelo mayor.
- Clasificacion de tickets de soporte: asignacion de categoria y prioridad a partir del texto de la incidencia, con la probabilidad como indicador para escalado manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para Jev-Style-2B-Decision-v3. La unica referencia cualitativa encontrada es que la version v2 de 2B se evaluo en "clasificacion calibrada en ingles sobre 11 tareas retenidas", sin que se aporten cifras numericas. No se dispone de datos de MMLU, HumanEval, GSM8K ni de metricas de clasificacion (exactitud, F1, ECE) para esta variante.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros y la anchura de bits; solo el dato de Q4_K_M esta confirmado como tamano de fichero):
  - F16: en torno a 4,0 GB.
  - Q8_0: en torno a 2,1 GB.
  - Q6_K: en torno a 1,6 GB.
  - Q5_K_M / Q5_K_S: en torno a 1,4 GB.
  - Q4_K_M: 1,27 GB (dato confirmado).
  - Q3_K_M / Q3_K_S / Q3_K_L: en torno a 1,1 GB.
  - IQ4_XS: en torno a 1,1 GB.
  - Q2_K: en torno a 0,9 GB.
  - A estas cifras hay que sumar el overhead del contexto y del runtime (tipicamente varios cientos de MB en llama.cpp).
- GPU recomendadas: no hay recomendaciones publicadas. Por tamano, cualquier GPU con 4 GB o mas de VRAM es suficiente en Q4_K_M; modelos como RTX 3060, RTX 4060, RTX 4090, A100 o H100 no aportan ventaja de capacidad, solo de throughput.
- Cabe holgadamente en GPU de consumo: practicamente cualquier tarjeta con 4-6 GB de VRAM, y tambien en equipos con CPU y RAM convencionales (el Q2_K puede caber en menos de 1 GB de RAM).
- Opciones de despliegue: llama.cpp es el runtime indicado explicitamente por el autor de las cuantizaciones. Al ser GGUF, es compatible con derivados como Ollama, LM Studio, llama-cpp-python y servidores basados en llama.cpp. vLLM y TGI no son compatibles de forma nativa con GGUF completo (vLLM tiene soporte parcial de GGUF), por lo que requeririan los pesos base en safetensors.
- Latencia y throughput: no disponibles para ejecucion local. La web del proyecto cita 70-500 ms para el servicio alojado, cifra que no es extrapolable a una ejecucion local.

## Comparativa con modelos similares

No se han encontrado en la busqueda comparativas independientes con modelos de decision de otros fabricantes. La unica comparacion posible es dentro de la propia familia Jev, con datos de catalogo publicados por el proyecto:

| Modelo | Parametros | Contexto de entrada | Idiomas | Formatos |
|---|---|---|---|---|
| Jev-Style-2B-Decision-v3 | 2B | no disponible | no disponible | Transformers, GGUF, MLX |
| Jev-Style-2B-Decision-v2 | 2B | 1.024 tokens | ingles | HF, GGUF, MLX |
| Jev-Style-0.8B-v3 | 0,8B | 25.600 tokens | 51 idiomas | Transformers, GGUF, MLX |

Para el resto de alternativas de la misma categoria (modelos de clasificacion o reranking de ~2B, como codificadores tipo ModernBERT o DeBERTa), la informacion disponible no incluye datos comparativos verificables: no disponible.

## Limitaciones y advertencias

- La model card del repositorio de GGUF es practicamente vacia: no declara licencia, idiomas, pipeline ni datos de entrenamiento. Esto impide evaluar el uso comercial con seguridad juridica.
- El repositorio registra cero descargas y cero "likes" en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Es una cuantizacion de terceros (mradermacher) sobre un modelo ajeno (chaoliangUNSW); los posibles defectos de conversion no estan documentados.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan de forma notable el comportamiento de modelos pequenos de decision, donde la calibracion de la probabilidad de salida es critica. Para tareas sensibles a la calibracion se recomienda Q8_0 o F16.
- Un modelo de 2B presenta mayor riesgo de alucinacion o de veredictos incorrectos con confianza alta que modelos mayores; la probabilidad devuelta debe validarse con un conjunto de evaluacion propio antes de usarla en produccion.
- La longitud de contexto de esta variante no esta publicada. Si hereda los 1.024 tokens de la v2, las entradas largas se truncarian; conviene verificarlo empiricamente antes de disenar el pipeline.
- El soporte multilingue no esta confirmado para esta variante; la familia lo declara solo para la version 0,8B v3.
- Las afirmaciones de "cero alucinaciones" y "decisiones en 70-500 ms" proceden de las webs promocionales del proyecto, no de evaluaciones independientes, y no deben tomarse como hechos verificados.
- Las cifras de VRAM distintas de la de Q4_K_M son estimaciones derivadas del numero de parametros, no datos publicados por el autor.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/Jev-Style-2B-Decision-v3-GGUF
- Modelo base en HuggingFace: https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v3
- Repositorio espejo en GitHub: https://github.com/lawrence3699/Jev-Style-2B-Decision-v3-GGUF
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Pagina del proyecto JevStyle Decision Models: https://jevstyle.com/
- Documentacion del modelo Jev en TypeSafe AI: https://jevmodel.org/
- Web comercial de Jev AI: https://jevai.net/
