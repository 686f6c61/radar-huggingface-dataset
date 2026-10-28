# KIZZPER/pandas-so-function-classifier

## Resumen

Este modelo es un clasificador de texto basado en `distilroberta-base` afinado para una tarea muy concreta: dada una pregunta en ingles sobre `pandas` (por ejemplo, una pregunta de StackOverflow), predecir que funcion de la API Reference responde a esa duda. El espacio de etiquetas lo forman 691 funciones de `pandas` (nombres de pagina tipo `pandas.DataFrame.merge`) que aparecieron al menos tres veces en el conjunto de entrenamiento. Lo desarrolla el usuario KIZZPER y se publica bajo licencia CC BY-SA 4.0.

La relevancia es la de un componente de recuperacion de bajo coste: con 82,6 millones de parametros y un repositorio de 0,3 GB, sirve como primera etapa de un pipeline RAG sobre documentacion de `pandas`, o como enrutador dentro de un asistente de analisis de datos, a una fraccion del coste de un LLM generativo. Su autor lo emplea en combinacion con `KIZZPER/pandas-so-function-retriever`, un retriever del mismo proyecto, lo que sugiere un diseno hibrido entre clasificacion de funciones y recuperacion densa.

El modelo no genera texto: es un encoder transformer con una cabeza de clasificacion multiclase. Su calidad medida en test (6.742 preguntas) es moderada: Recall@1 de 0,247 y MRR de 0,373, con Recall@10 de 0,639. Es, por tanto, una herramienta de pre-filtrado o de sugerencia, no un oraculo de recuperacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa destilado (`distilroberta-base`) con cabeza de clasificacion multiclase |
| Parametros totales | 82.649.779 (segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada de `distilroberta-base`; no se explicita en la model card) |
| Tipos de cuantizacion | no disponible en el repo (solo safetensors en fp32); admite cuantizacion dinamica int8 via PyTorch u ONNX Runtime |
| Idiomas soportados | ingles (`en`) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (repositorio de 0,3 GB) |
| Tarea (pipeline) | `text-classification` |
| Numero de clases | 691 funciones de `pandas` |
| Dataset de entrenamiento | `KIZZPER/pandas-so-questions` |
| Modelo base | `distilbert/distilroberta-base` |

## Arquitectura y entrenamiento

La arquitectura es la de `distilroberta-base`: un encoder transformer de 6 capas y 768 dimensiones ocultas, destilado de RoBERTa base, al que se anade una cabeza lineal de clasificacion sobre 691 clases. El texto se tokeniza con el tokenizador BPE de RoBERTa y se trunca a la ventana nativa del modelo (512 tokens). No hay decodificacion generativa, ni modo thinking, ni atencion lineal: es inferencia forward pura sobre una unica secuencia.

El entrenamiento usa cross-entropy con objetivos suaves (soft targets): cuando la respuesta aceptada de StackOverflow hace referencia a varias funciones, la probabilidad objetivo se reparte a partes iguales entre esas funciones en lugar de asignar todo el peso a una sola etiqueta. Es una decision acertada para un problema con ambiguedad intrinseca (varias funciones de `pandas` resuelven la misma tarea). El corpus procede de pares pregunta-respuesta de StackOverflow, accesibles via Stack Exchange Data Explorer y distribuidos bajo CC BY-SA 4.0. No se documentan en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo una fase adicional de ajuste con preferencias (RLHF/DPO); para un clasificador supervisado, ademas, esas tecnicas no serian el mecanismo habitual.

## Capacidades

- Clasificacion de una pregunta en ingles sobre `pandas` en una de 691 clases correspondientes a funciones de la API Reference.
- Manejo de ambiguedad mediante etiquetas suaves: la salida es una distribucion sobre funciones, aprovechable como ranking top-k en lugar de una unica prediccion.
- Buen comportamiento en recall a k moderado (Recall@10 = 0,639), lo que lo hace util como generador de candidatos para una segunda etapa.
- Uso como componente de retrieval: puntuaciones por clase que se pueden combinar con un retriever denso.
- Inferencia muy rapida y barata en CPU gracias a sus 82,6 M de parametros y 6 capas.
- No soporta tool calling ni function calling, no es agente, no hace razonamiento multi-paso, no genera texto, no procesa vision ni audio y no es multilingue (solo ingles).

## Casos de uso

- Enrutado de preguntas en foros y comunidades tecnicas: dado un titulo o cuerpo de pregunta sobre `pandas`, el clasificador devuelve las 5-10 funciones candidatas y el sistema muestra directamente los enlaces a la documentacion oficial, reduciendo el tiempo hasta la respuesta.
- Primera etapa de un pipeline RAG sobre documentacion de `pandas`: al ser un encoder de 82,6 M de parametros, se puede ejecutar en CPU para filtrar cientos de funciones candidatas y reservar el modelo generativo (mucho mas caro) solo para la redaccion final con el contexto ya acotado.
- Sugerencia de API en un asistente de notebooks o IDE: al escribir una consulta en lenguaje natural ("how do I reshape wide to long"), el modelo propone `pandas.DataFrame.melt`, `pandas.wide_to_long` o `pandas.DataFrame.stack` como candidatas y el editor las presenta ordenadas.
- Etiquetado y triaje de tickets internos de soporte: en un equipo de datos con un canal de ayuda, clasificar automaticamente las consultas por funcion de `pandas` permite asignarlas al especialista o a la pagina de documentacion correspondiente.
- Analitica de documentacion: aplicando el clasificador a un corpus historico de preguntas se obtiene una distribucion de que funciones concentran las dudas, lo que sirve para priorizar que partes de la documentacion interna se reescriben o se amplian.
- Deteccion de funciones problematicas: un pico de predicciones sobre una misma clase en el tiempo puede correlacionarse con un cambio de version de `pandas` (deprecaciones, cambios de nombre de argumentos) y disparar una revision de la guia de migracion.
- Pre-filtrado de bajo coste en un sistema mixto: combinado con `KIZZPER/pandas-so-function-retriever`, usar la clasificacion como filtro barato y el retriever como reordenador, tal y como describe el autor para la demo del proyecto.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test de 6.742 preguntas:

| Metrica | Valor |
|---|---|
| Recall@1 | 0,247 |
| Recall@5 | 0,519 |
| Recall@10 | 0,639 |
| MRR | 0,373 |

La model card no incluye comparaciones con otros modelos ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K): no aplican a esta tarea y no estan disponibles.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 0,33 GB en fp32, 0,17 GB en fp16 y ~0,08 GB en int8 dinamico. Cabe holgadamente en cualquier GPU consumer de los ultimos diez anos.
- GPU recomendadas: ninguna en particular; una RTX 3060, RTX 4090, T4, L4, A10 o A100 estan sobredimensionadas para un solo ejemplo. Las GPU solo tienen sentido para servir lotes grandes.
- Cabe en GPU consumer: si, en cualquier GPU con 2 GB o mas; tambien funciona en CPU sin problemas.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, exportacion a ONNX Runtime, TorchScript, un servicio FastAPI con batching, o Text Embeddings Inference / soluciones de inferencia de encoders. vLLM y llama.cpp no son la herramienta adecuada: el modelo no es generativo y no tiene pesos GGUF publicados.
- Latencia y throughput: no hay cifras publicadas. Por tamano y profundidad (6 capas, 512 tokens como maximo) es esperable un throughput alto en CPU con batching, pero no se dispone de medidas verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Metricas publicadas |
|---|---|---|---|---|---|
| `KIZZPER/pandas-so-function-classifier` | 82,6 M | 512 tokens | Clasificacion en 691 funciones de `pandas` | CC BY-SA 4.0 | Recall@1 0,247; Recall@10 0,639; MRR 0,373 |
| `KIZZPER/pandas-so-function-retriever` | no disponible | no disponible | Recuperacion densa de funciones de `pandas` | no disponible | no disponible |
| `distilbert/distilroberta-base` (modelo base) | 82,1 M aprox. | 512 tokens | Masked language modeling (no clasifica funciones) | Apache 2.0 (heredada del modelo base) | no aplica a esta tarea |
| `sentence-transformers/all-MiniLM-L6-v2` | 22,7 M aprox. | 512 posiciones (uso tipico 256) | Embeddings de frases para similitud/retrieval generico | Apache 2.0 | no comparable directamente; requiere indexacion vectorial |

Nota: las alternativas genericas de embeddings no ofrecen una taxonomia cerrada de 691 funciones, por lo que la comparacion es cualitativa. No se dispone de resultados de benchmarks de los otros modelos sobre este mismo conjunto de test.

## Limitaciones y advertencias

- Cobertura cerrada: solo existen 691 clases, correspondientes a funciones vistas al menos tres veces en entrenamiento. Cualquier pregunta sobre una funcion ausente se asignara forzosamente a una clase existente; la model card no menciona una clase de rechazo o "ninguna de las anteriores".
- Precision top-1 baja: Recall@1 de 0,247 implica que en aproximadamente tres de cada cuatro preguntas la funcion correcta no es la primera prediccion. No es adecuado para responder sin una etapa de verificacion o reordenacion.
- Solo ingles: el tag de idioma es `en` y el corpus de origen es StackOverflow en ingles. Preguntas en castellano o en otros idiomas no estan soportadas y degradaran la salida.
- Dominio muy estrecho: el modelo no responde preguntas generales de Python, de `numpy` ni de otras librerias; fuera de `pandas` la salida es esencialmente ruido.
- Truncacion a 512 tokens: preguntas largas con codigo extenso pueden perder la parte informativa si el fragmento relevante queda al final.
- Licencia CC BY-SA 4.0: permite uso comercial, pero impone atribucion y compartir bajo la misma licencia las obras derivadas y adaptaciones. Conviene revisar con el equipo legal si el modelo se integra en un producto propietario, porque el caracter "share-alike" puede alcanzar a la obra derivada.
- Herencia de sesgos: el corpus de StackOverflow sobrerrepresenta ciertas versiones de `pandas` y estilos de pregunta; funciones nuevas o poco discutidas en la comunidad estaran infrarrepresentadas o ausentes.
- Riesgo de "alucinacion" en sentido laxo: el modelo no inventa texto, pero si puede producir una prediccion con alta confianza sobre una funcion incorrecta. No se documenta calibracion de probabilidades.
- Sin validacion externa: cero descargas y cero "likes" en el momento de la consulta, un unico autor y ausencia de resultados de terceros. La model card esta redactada en ruso pese al tag de idioma ingles, y las fechas de creacion y actualizacion del repositorio son inconsistentes, lo que aconseja tratar los metadatos con cautela.
- No hay informacion sobre el preprocesado exacto de las preguntas (titulo, cuerpo, codigo), lo que dificulta reproducir las condiciones de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KIZZPER/pandas-so-function-classifier
- Dataset de entrenamiento: https://huggingface.co/datasets/KIZZPER/pandas-so-questions
- Modelo complementario citado en la model card: https://huggingface.co/KIZZPER/pandas-so-function-retriever
- Modelo base: https://huggingface.co/distilbert/distilroberta-base
- Origen de los datos (Stack Exchange Data Explorer): https://data.stackexchange.com/stackoverflow
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Repositorio del proyecto con codigo, experimentos e informes: no disponible (la model card lo menciona pero no incluye la URL)
- Paper o blog tecnico: no disponible
- Demo publica: no disponible
