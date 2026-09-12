# laskar-ks/toxic-guardrail-minilm-id-en

## Resumen

Toxic Guardrail MiniLM ID/EN es un clasificador de severidad de toxicidad bilingue (indonesio e ingles) desarrollado por el usuario laskar-ks y publicado en HuggingFace. Su proposito no es generar texto, sino actuar como guardrail de aplicacion: recibe un fragmento de texto y devuelve un nivel de severidad en una escala ordinal de cinco niveles (0 seguro, 1 reservado y no disponible, 2 abusivo, 3 odio dirigido, 4 amenaza o toxicidad severa), junto con un `score` de severidad esperada y una accion recomendada (`allow`, `soft_warn`, `warn`, `review`, `block`).

El modelo parte de `microsoft/Multilingual-MiniLM-L12-H384`, un transformer encoder de tipo BERT con 34.606.084 parametros totales, afinado sobre el dataset `laskar-ks/toxic-guardrail-id-en`, con vocabulario recortado y exportado a ONNX INT8 para inferencia en CPU. El repositorio ocupa 0,9 GB y esta disponible bajo licencia cc-by-sa-3.0. La version documentada, v2, rebalancea los datos de entrenamiento de una proporcion ID:EN de 1:1,46 a 1:1,06 y reajusta los hiperparametros de entrenamiento.

Su relevancia actual reside en la combinacion de tamano reducido (apto para CPU sin GPU), licencia abierta, soporte ONNX y un contrato de salida calibrado con umbrales explicitos. El autor documenta con inusual detalle los fallos del modelo —precision baja en clases severas, suelo artificial en el `score` y deteccion poco fiable de amenazas en indonesio—, lo que lo convierte en una pieza util como capa de pre-filtrado con revision humana, no como bloqueador automatico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MiniLM), derivado de microsoft/Multilingual-MiniLM-L12-H384 |
| Parametros totales | 34.606.084 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Multilingual-MiniLM-L12-H384 usa posiciones de hasta 512 tokens) |
| Tipos de cuantizacion | ONNX INT8 dinamico (solo MatMul; la variante concreta no esta especificada en la model card); pesos originales en fp32 |
| Idiomas soportados | Indonesio (id) e ingles (en) |
| Licencia | cc-by-sa-3.0 |
| Formato de pesos | safetensors, ONNX |
| Tarea | text-classification (clasificacion ordinal de severidad de toxicidad, 5 etiquetas) |
| Modelo base | microsoft/Multilingual-MiniLM-L12-H384 |
| Dataset de entrenamiento | laskar-ks/toxic-guardrail-id-en |
| Descargas / likes | 79 descargas, 0 likes |
| Fecha de creacion / actualizacion | 2026-09-08 / 2026-09-12 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional de la familia BERT, concreta­mente la variante MiniLM multilingue de 12 capas y 384 dimensiones ocultas de Microsoft. Sobre ese encoder, el autor anade una cabeza de clasificacion ordinal para cinco ratings de severidad. Durante el entrenamiento se anade ademas una segunda cabeza lineal auxiliar que predice `sentiment_polarity` como tarea de regresion, tomando como referencia las etiquetas de `cardiffnlp/twitter-xlm-roberta-base-sentiment` incluidas en el dataset, con un peso de perdida de 0,15. Esta cabeza auxiliar se descarta en la exportacion: no forma parte del grafo exportado, de modo que el tamano de despliegue, la latencia y el contrato de inferencia coinciden con la v1. La correlacion entre polaridad predicha y objetivo en el conjunto de test es r = 0,736, lo que indica que el encoder aprendio la senal auxiliar sin que esta desplazara a la tarea principal.

El ajuste fino de la v2 introduce varios cambios respecto a la v1: el recorte de pesos de clase baja de 8,0 a 6,0, el entrenamiento se extiende de 4 a 6 epocas y la aumentacion adversarial se reduce del 60 % al 50 % de las filas toxicas. Los datos se rebalancean de una proporcion ID:EN de 1:1,46 a 1:1,06 y se restaura el rating 0 como clase mayoritaria, lo que reasigna capacidad hacia el indonesio. Un detalle tecnico relevante es que los datos de entrenamiento en indonesio solo llevan etiquetas binarias, por lo que contribuyen exclusivamente a los ratings 0 y 2; los ratings 3 y 4 nunca se observan en indonesio durante el entrenamiento (la model card se trunca en este punto de la explicacion, en la seccion "Known failure: Indonesian threat detection").

## Capacidades

- Clasificacion de toxicidad en cinco niveles ordinales: 0 (seguro), 1 (reservado, no disponible en la practica), 2 (toxico, abusivo u obsceno), 3 (acoso dirigido u odio), 4 (amenaza o toxicidad severa).
- Salida de severidad esperada (`score`), calculada como la media ponderada por probabilidad de los ratings dividida entre 4. Es monotona y apta para umbralizar directamente, aunque con un suelo artificial cercano a 0,5 en textos claramente seguros.
- Mapeo a acciones operativas: `allow`, `soft_warn`, `warn`, `review` y `block`.
- Clasificacion bilingue indonesio-ingles, con rendimiento desigual entre ambos idiomas.
- Inferencia en CPU: exportacion ONNX INT8 orientada a despliegue local sin GPU.
- No dispone de generacion de texto, tool calling, capacidades de agente, vision ni audio. Es exclusivamente un clasificador.

## Casos de uso

- Moderacion de chats en tiempo real en aplicaciones indonesias o angloparlantes: el modelo clasifica cada mensaje en milisegundos en CPU y devuelve una accion; conviene usar `review` para la cola humana y reservar `block` por su baja precision.
- Pre-filtrado en colas de moderacion humana: con el umbral `review` (p(3)+p(4) > 0,60) se obtiene una precision de 0,409 y un recall de 0,855 sobre clases severas, lo que reduce drasticamente el volumen de mensajes que llega a revisores sin dejar pasar la mayoria del contenido grave.
- Guardrail de entrada en aplicaciones de generacion aumentada: colocado delante de un LLM, evita que prompts abusivos o amenazantes lleguen al modelo generativo, con un coste de inferencia despreciable frente al modelo principal.
- Aviso blando en interfaces de usuario: con el umbral `warn` (1 − p(0) > 0,45, precision 0,892 y recall 0,912) el modelo puede mostrar advertencias no bloqueantes antes de publicar un comentario, reduciendo la friccion frente al bloqueo directo.
- Monitorizacion de comunidades y foros: procesamiento por lotes con ONNX Runtime en servidores sin GPU, agregando la distribucion de severidad por canal o por usuario a lo largo del tiempo.
- Investigacion en NLP sobre toxicidad bilingue: el par de idiomas indonesio-ingles con etiquetas ordinales y un conjunto adversarial duro (accuracy 68,75 %) es un banco de pruebas util para estudiar transferencia entre idiomas de alto y bajo recurso.
- Triaje en plataformas de soporte o formularios de contacto: clasificar mensajes de clientes para priorizar casos con lenguaje abusivo o amenazante antes de asignarlos a un agente humano.
- Filtrado de datos de entrenamiento: descartar o marcar muestras toxicas de corpus recolectados antes de usarlos para ajustar otros modelos, siempre que se aplique revision en los niveles 3 y 4.

## Benchmarks y rendimiento

Resultados publicados en la model card para la version v2 frente a la v1:

| Metrica | v1 | v2 | Cambio |
|---|---|---|---|
| Macro F1 (test, global) | 0,632 | 0,629 | −0,003 |
| Macro F1 (indonesio, clases r0/r2) | 0,797 | 0,825 | +0,028 |
| Macro F1 (ingles, cuatro clases) | 0,638 | 0,627 | −0,011 |
| MAE (indonesio) | 0,405 | 0,351 | −0,054 |
| MAE (ingles) | 0,432 | 0,460 | +0,028 |
| Accuracy en conjunto adversarial duro | 62,5 % | 68,75 % | +6,25 |

Metricas por clase en el conjunto de test (v2):

| Rating | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| r0 seguro | 0,84 | 0,87 | 0,85 | 1.706 |
| r2 abusivo | 0,86 | 0,71 | 0,77 | 2.125 |
| r3 odio | 0,30 | 0,65 | 0,41 | 99 |
| r4 severo | 0,35 | 0,74 | 0,48 | 183 |

Matriz de confusion (test):

| | pred r0 | pred r2 | pred r3 | pred r4 |
|---|---|---|---|---|
| true r0 | 1.481 | 215 | 9 | 1 |
| true r2 | 272 | 1.502 | 119 | 232 |
| true r3 | 3 | 13 | 64 | 19 |
| true r4 | 3 | 24 | 20 | 136 |

Umbral de bloqueo medido en validacion:

| τ (block) | Precision | Recall |
|---|---|---|
| 0,60 | 0,409 | 0,855 |
| 0,80 | 0,443 | 0,784 |
| 0,90 | 0,481 | 0,723 |
| 0,95 | 0,575 | 0,596 |

No se dispone de resultados comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el escenario principal, ya que el modelo esta disenado para ejecucion en CPU. Los 34,6 millones de parametros en fp32 ocupan aproximadamente 138 MB; la exportacion INT8 reduce el peso a una fraccion de esa cifra.
- GPU recomendadas: no disponibles ni necesarias. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) puede ejecutarlo, pero seria desaprovechar el modelo.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1 GB de memoria libre, e incluso en CPU sin aceleracion.
- Opciones de despliegue: ONNX Runtime (ruta prevista por el autor), ademas de las habituales para un modelo BERT de esta familia via Transformers, HuggingFace Text Embeddings Inference o servidores de clasificacion genericos. vLLM, llama.cpp, Ollama y TGI estan orientados a modelos generativos y no aplican a este clasificador.
- Latencia y throughput estimados: no disponibles. La model card deja sin rellenar los campos de calibracion (temperatura, variante de cuantizacion, acuerdo INT8 frente a fp32 y tamano desplegado). Los placeholders `<XX%>` y `<XX MB>` siguen presentes en el README.

## Comparativa con modelos similares

No hay datos de benchmarks de terceros en la informacion proporcionada, por lo que no es posible comparar este modelo con alternativas como toxic-bert, Llama Guard o los clasificadores de la familia Detoxify sin inventar cifras. La unica comparacion documentada es interna, entre la v1 y la v2 del propio modelo:

| Aspecto | v1 | v2 |
|---|---|---|
| Macro F1 global | 0,632 | 0,629 |
| Macro F1 indonesio (r0/r2) | 0,797 | 0,825 |
| Macro F1 ingles (cuatro clases) | 0,638 | 0,627 |
| MAE indonesio | 0,405 | 0,351 |
| MAE ingles | 0,432 | 0,460 |
| Conjunto adversarial duro | 62,5 % | 68,75 % |
| Proporcion ID:EN en entrenamiento | 1:1,46 | 1:1,06 |
| Epocas | 4 | 6 |
| Clamp de pesos de clase | 8,0 | 6,0 |
| Aumentacion adversarial | 60 % de filas toxicas | 50 % de filas toxicas |
| Licencia | cc-by-sa-3.0 | cc-by-sa-3.0 |

## Limitaciones y advertencias

- Precision muy baja en clases severas: 0,30 en rating 3 y 0,35 en rating 4. Aproximadamente dos tercios de lo que el modelo marca como severo es en realidad contenido de rating 2. El sesgo hacia la sobreescalada es deliberado, inducido por el peso de clases.
- El umbral de `block` esta deliberadamente puesto muy alto (τ = 0,95) porque incluso en el maximo de confianza solo el 57,5 % de lo bloqueado es realmente severo. No es apto para bloqueo automatico sin revision humana.
- El `score` tiene un suelo artificial cercano a 0,5 por efecto de `label_smoothing=0.05` combinado con el peso de clases. Textos claramente seguros como "selamat pagi" puntuan alrededor de 0,30. No debe mostrarse al usuario final como "porcentaje de toxicidad"; debe usarse como ordenacion relativa.
- Falso negativos concentrados en ingles: 272 filas de rating 2 clasificadas como seguras, con un recall de 0,64 en ingles frente a 0,82 en indonesio.
- Deteccion poco fiable de amenazas en indonesio: segun la propia model card, "el modelo no detecta de forma fiable amenazas violentas escritas en indonesio", porque los datos de entrenamiento en ese idioma solo llevan etiquetas binarias y contribuyen unicamente a los ratings 0 y 2. La explicacion completa queda truncada en el README disponible.
- Repositorio practicamente sin traccion: 79 descargas y 0 likes, actualizado por ultima vez el 2026-09-12. No hay senales de mantenimiento, versionado posterior ni soporte.
- Seccion de calibracion incompleta: los campos de temperatura, variante de cuantizacion, acuerdo entre INT8 y fp32 y tamano desplegado siguen siendo placeholders sin rellenar, lo que impide verificar la degradacion introducida por la cuantizacion.
- Licencia cc-by-sa-3.0: permite uso comercial, pero impone atribucion y obliga a distribuir las obras derivadas bajo la misma licencia. Conviene revisar la compatibilidad con el producto antes de integrarlo.
- No se han publicado evaluaciones de sesgo demografico ni de comportamiento entre dialectos o variantes regionales del indonesio y del ingles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/laskar-ks/toxic-guardrail-minilm-id-en
- Dataset de entrenamiento: https://huggingface.co/datasets/laskar-ks/toxic-guardrail-id-en
- Modelo base: https://huggingface.co/microsoft/Multilingual-MiniLM-L12-H384
- Modelo de sentimiento usado para la cabeza auxiliar: https://huggingface.co/cardiffnlp/twitter-xlm-roberta-base-sentiment
- Resultados de la busqueda web: no se ha encontrado ningun resultado relevante. Las busquedas devolvieron unicamente paginas de WhatsApp (web.whatsapp.com, whatsapp.com, wa.me, Google Play), sin relacion con el modelo. No hay papers, blogs, repositorios ni demos adicionales disponibles.
