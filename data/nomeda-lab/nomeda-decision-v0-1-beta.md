# nomeda-lab/nomeda-decision-v0.1-beta

## Resumen

NOMEDA-Decision v0.1-beta es un modelo de decision tipada ("typed-decision") desarrollado por nomeda-lab. Dado un unico estado de entrada (un mensaje, ticket, resena, publicacion o documento JSON), responde simultaneamente a multiples preguntas independientes devolviendo una distribucion de probabilidad calibrada sobre las opciones que define el usuario. El modelo no genera texto en ningun caso: su salida es siempre una etiqueta, un nivel ordinal o una probabilidad. El arabe es el idioma principal y el ingles funciona como segundo brazo.

Tecnicamente parte del encoder congelado `silma-ai/silma-embedding-matryoshka-v0.1` (Arabetv02, D=768, 12 capas) y sobre el monta una capa de decision con 12.791.812 parametros entrenables (4 bloques transformer, d=384, 6 cabezas, cross-attention entre opciones y estado). El total asciende a 147.985.156 parametros y el repositorio ocupa 0,1 GB.

Su interes en produccion reside en dos propiedades poco habituales: la calibracion medida (ECE global 0,0506) y la no interferencia exacta entre preguntas (max|Δp| = 0,0), que permite anadir, eliminar o reordenar preguntas sin alterar las respuestas ya obtenidas. La contrapartida es un alcance estrecho: el propio autor documenta que el modelo no tiene capacidad medible de entailment ni de sentido comun, y que tres flujos de produccion no estan cubiertos en absoluto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder congelado mas capa de decision transformer (4 bloques, d=384, 6 cabezas, cross-attention opcion-estado) |
| Parametros totales | 147.985.156 (12.791.812 entrenables sobre 135.193.344 congelados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Estado troceado en fragmentos de 512 tokens con paso de 384, hasta 8 fragmentos (aprox. 3.200 tokens); el numero de preguntas por llamada no esta acotado |
| Tipos de cuantizacion | No disponible (la inferencia se ejecuta en fp32; el entrenamiento uso autocast en fp16) |
| Idiomas soportados | Arabe (principal) e ingles (segundo) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (tamano del repositorio: 0,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es un encoder-decoder de decision en dos piezas. La primera es el encoder `silma-ai/silma-embedding-matryoshka-v0.1` (Arabetv02, D=768, 12 capas, revision `011e3b07c9ae2e38f2312a237b489b3b0a640307`), que permanece congelado durante todo el entrenamiento. La segunda es una capa de decision entrenable de 12.791.812 parametros compuesta por 4 bloques transformer con d=384 y 6 cabezas, que aplica cross-attention entre los tokens de cada opcion y el estado compartido. El pooling del texto es mean pooling, mientras que los tokens de pregunta usan attention pooling. Cada estado se trocea en fragmentos de 512 tokens con un paso de 384 y un maximo de 8 fragmentos. El entrenamiento se hizo con autocast en fp16 y la inferencia se ejecuta en fp32.

La innovacion destacable es la no interferencia exacta entre preguntas: cada pregunta solo atiende al estado compartido y nunca a otra pregunta, de modo que anadir o reordenar preguntas no puede cambiar una respuesta ya calculada (verificado con max|Δp| = 0,0). Todo esto se resuelve con una unica ruta de puntuacion que cubre tres tipos de pregunta: `choice` (elegir una opcion nombrada), `score` (ordenar o nivelar segun niveles ordenados) y `noul` (pregunta de si/no con salida P(true)). Los datos de entrenamiento constan de 230.816 registros de entrenamiento y 14.785 de validacion, distribuidos en 20 familias de tareas distintas: clasificacion de intenciones (asistente, banca, comandos cortos, en arabe e ingles), deteccion de peticiones fuera de alcance, autenticidad de resenas, sentimiento y valoracion ordinal por estrellas, discurso de odio, lenguaje ofensivo, sarcasmo, clasificacion de escenarios y uso de herramientas (si se necesita, cual elegir y accion siguiente). La model card no indica el numero total de tokens de entrenamiento ni si se utilizaron tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion de eleccion unica (tipo `choice`) sobre opciones nombradas definidas por el usuario en tiempo de inferencia.
- Puntuacion o nivelacion ordinal (tipo `score`) sobre una lista ordenada de niveles.
- Preguntas de si/no (tipo `noul`) que devuelven la probabilidad P(true).
- Devolucion de probabilidades calibradas ademas de la etiqueta, con ECE global de 0,0506 en la evaluacion oficial.
- Respuesta simultanea a multiples preguntas independientes con no interferencia exacta (max|Δp| = 0,0).
- Clasificacion de intenciones en dominios de asistente y banca, en arabe y en ingles (0,9508 y 0,9329 de exactitud en los conjuntos ingleses; 0,8887 y 0,8438 en los arabes).
- Deteccion de discurso de odio (0,9003 de exactitud, macro-F1 0,9281).
- Analisis de sentimiento y sarcasmo (0,7157 de exactitud).
- Verificacion de autenticidad de resenas, falsa frente a genuina (0,7103 sobre 39.829 casos).
- Deteccion de peticiones fuera de alcance en asistentes conversacionales.
- Clasificacion de uso de herramientas: si se necesita una herramienta, cual seleccionar y cual es la accion siguiente.
- No soporta generacion de texto, tool calling generativo, razonamiento multi-paso, vision ni audio.
- No dispone de capacidad medible de entailment/NLI (0,3415 frente a una linea base uniforme de 0,333) ni de sentido comun (0,5035 frente al azar binario).

## Casos de uso

- Triaje de tickets de atencion al cliente en arabe: el modelo puede clasificar simultaneamente intencion, escenario y si la peticion esta en alcance sobre el mismo texto, con probabilidades calibradas que permiten fijar un umbral de confianza y derivar a revision humana los casos dudosos. La model card advierte que la cobertura de triaje es solo parcial (intencion si; frustracion, riesgo de churn, urgencia y reembolso no).
- Enrutado de intenciones en banca: clasificacion de consultas bancarias en arabe (0,8438 de exactitud sobre 29.761 casos) e ingles (0,9329 sobre 11.273 casos), apta para dirigir cada conversacion al flujo o al equipo correcto.
- Moderacion de contenido: deteccion de discurso de odio con 0,9003 de exactitud y macro-F1 0,9281. La deteccion de lenguaje ofensivo generico es mas debil (0,8128, por debajo de la linea base mayoritaria de 0,8318, y 0,711 en Twitter), por lo que conviene combinarla con otra senal si el objetivo es ese.
- Deteccion de resenas falsas en plataformas de comercio electronico: el modelo fue entrenado especificamente en autenticidad de resenas y obtiene 0,7103 de exactitud sobre 39.829 casos de evaluacion, con ECE de 0,0108, lo que permite priorizar el trabajo de los equipos de integridad.
- Analisis de sentimiento y sarcasmo sobre publicaciones de redes sociales: util como capa de etiquetado masivo, con la salvedad de que es la familia con peor exactitud (0,7157) y ECE de 0,0401.
- Deteccion de peticiones fuera de alcance en un asistente conversacional: el modelo decide si una solicitud entra o no en el dominio soportado antes de invocar el flujo principal. Atencion al macro-F1 de 0,4715 en esta tarea por el desbalance de la clase `false` (10,8%).
- Seleccion de herramientas y planificacion de la accion siguiente en pipelines de agentes: al haberse entrenado en la tarea de decidir si se necesita una herramienta, cual elegir y que accion tomar despues, puede actuar como enrutador determinista sin generar texto.
- Etiquetado de datos para anotacion: dado que acepta opciones y criterios definidos en tiempo de inferencia y no interfiere entre preguntas, sirve para pre-anotar grandes volumenes de texto arabe e ingles antes de la revision humana.

## Benchmarks y rendimiento

Los numeros proceden de la unica evaluacion oficial del autor sobre un conjunto retenido de 140.790 preguntas.

### Resultados globales

| Metrica | Valor |
|---|---:|
| Exactitud | 0,7723 |
| Macro-F1 | 0,8464 |
| NLL | 0,5781 |
| Brier | 0,3154 |
| ECE (calibrado) | 0,0506 |
| Exact match (todas las preguntas de un registro) | 0,6935 |

### Por tipo de pregunta

| Tipo | n | Exactitud | Macro-F1 | ECE |
|---|---:|---:|---:|---:|
| `choice` | 85.185 | 0,7488 | 0,8479 | 0,0808 |
| `noul` | 32.585 | 0,8497 | 0,8052 | 0,0076 |
| `score` | 23.020 | 0,7493 | 0,6767 | 0,0144 |

### Por tarea

| Tarea | n | Exactitud | Macro-F1 | ECE |
|---|---:|---:|---:|---:|
| Clasificacion de intenciones (ingles, asistente) | 21.231 | 0,9508 | 0,8837 | 0,0037 |
| Clasificacion de intenciones (ingles, banca) | 11.273 | 0,9329 | 0,8681 | 0,0067 |
| Deteccion de discurso de odio | 3.240 | 0,9003 | 0,9281 | 0,0167 |
| Intencion y escenario (arabe) | 10.885 | 0,8887 | 0,8114 | 0,0139 |
| Clasificacion de intenciones (arabe, banca) | 29.761 | 0,8438 | 0,8720 | 0,0088 |
| Deteccion de lenguaje ofensivo | 1.998 | 0,8128 | 0,6573 | 0,0399 |
| Sarcasmo y sentimiento | 5.884 | 0,7157 | 0,6444 | 0,0401 |
| Autenticidad de resenas | 39.829 | 0,7103 | 0,6638 | 0,0108 |
| Valoracion de producto (ordinal) | 190 | 0,6421 | 0,3903 | 0,1046 |

### Latencia

Medida en una unica NVIDIA A6000 en reposo, con warm-up descartado, por llamada:

| Metrica | Valor |
|---|---:|
| p50 | 92 ms |
| p95 | 187 ms |

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 592 MB en fp32 y 296 MB en fp16, calculados a partir del recuento de 147.985.156 parametros (estimacion derivada, no publicada por el autor). La inferencia documentada se ejecuta en fp32.
- VRAM total estimada en torno a 1-2 GB teniendo en cuenta activaciones de hasta 8 fragmentos de estado y un numero arbitrario de preguntas por llamada (estimacion derivada).
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier tarjeta con 4 GB o mas. No se han publicado requisitos oficiales.
- GPU de referencia usada por el autor para medir latencia: NVIDIA A6000. No se indican otras GPU recomendadas.
- Opciones de despliegue: el modelo depende de una libreria propia (`library_name: nomeda-decision`, con `nomeda.runtime`, `nomeda.model` y `nomeda.config`) y de un encoder de HuggingFace. No hay soporte documentado de vLLM, llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput: p50 de 92 ms y p95 de 187 ms por llamada en A6000 en reposo. No se publica throughput en lote ni latencia en CPU.

## Comparativa con modelos similares

No se han identificado modelos comparables en la informacion proporcionada. La busqueda web no devolvio ningun resultado relacionado con el modelo ni con su categoria. La unica pieza relacionada documentada es el encoder base, que es un componente interno y no una alternativa funcional.

| Modelo | Parametros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nomeda-decision-v0.1-beta | 147.985.156 (12.791.812 entrenables) | Aprox. 3.200 tokens de estado, preguntas ilimitadas | Probabilidades calibradas sobre opciones | Apache 2.0 | HuggingFace, libreria propia |
| silma-ai/silma-embedding-matryoshka-v0.1 (encoder base, no alternativa) | 135.193.344 (congelados en este modelo) | No disponible | Embeddings | Apache 2.0 | HuggingFace |
| Otras alternativas de decision/clasificacion calibrada | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entailment y NLI al nivel del azar: 0,3415 de exactitud en un benchmark NLI de 3 clases frente a una linea base uniforme de 0,333, con ECE de 0,435. El autor declara explicitamente que el modelo no tiene capacidad medible de entailment en arabe y que no debe usarse para decisiones de inferencia o implicacion.
- Razonamiento de sentido comun al nivel del azar: 0,5035 en una tarea binaria balanceada.
- Deteccion de lenguaje ofensivo por debajo de la linea base mayoritaria: 0,8128 de exactitud frente a un 0,8318 mayoritario; el modelo infradetecta el arabe ofensivo y su peor resultado es en Twitter (0,711).
- Sensibilidad al desbalance en la tarea de answerability: 0,8920 de exactitud pero macro-F1 de 0,4715, porque el brazo minoritario `false` representa solo el 10,8%.
- Tres flujos de produccion no estan cubiertos en absoluto por el entrenamiento: procesamiento de facturas, gestion de incidentes de seguridad y observabilidad de trazas de agentes. El triaje de atencion al cliente solo esta cubierto parcialmente (intencion si; frustracion, riesgo de churn, urgencia y reembolso no).
- Sesgo de distribucion de entrenamiento: el 86,9% del conjunto de test oficial usa familias de tareas vistas durante el entrenamiento, por lo que la cifra principal mide retencion mas que generalizacion. Los resultados en dominios nuevos deben considerarse no validados.
- Riesgo de sobreconfianza en tareas concretas: la valoracion ordinal de producto presenta ECE de 0,1046 y macro-F1 de 0,3903 sobre solo 190 casos, y el tipo `choice` tiene ECE de 0,0808, muy por encima del global.
- Cobertura limitada a arabe e ingles. No hay datos publicados sobre otros idiomas ni sobre variedades dialectales mas alla de las incluidas en el entrenamiento.
- Licencia Apache 2.0, sin restricciones documentadas para uso comercial. Las licencias de los componentes se listan en `LICENSES.yaml` junto a la model card; el encoder es Apache 2.0.
- El modelo no genera texto ni soporta tool calling generativo, de modo que no puede sustituir a un LLM: solo aporta la capa de decision.
- Sin metricas de produccion mas alla de latencia en una unica A6000: no hay datos de throughput, estres, degradacion con estados largos ni comportamiento con mas de 8 fragmentos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, en estado beta (v0.1-beta).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nomeda-lab/nomeda-decision-v0.1-beta
- Encoder base: https://huggingface.co/silma-ai/silma-embedding-matryoshka-v0.1
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la busqueda web realizada; los resultados obtenidos no guardaban relacion con el modelo.
