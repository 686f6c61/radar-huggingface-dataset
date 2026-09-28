# sky7350/Mica-v0.5-4B

## Resumen

Mica v0.5 4B es un modelo juez («LLM-as-a-judge») desarrollado por sky7350 (Akiv), un desarrollador independiente, sobre el modelo base Qwen/Qwen3.5-4B. No es un modelo generativo de chat: recibe una situacion, una pregunta y un conjunto de candidatos, y devuelve una probabilidad calibrada para cada uno. Soporta tres tareas concretas: eleccion del mejor candidato entre 2 y 255 opciones, respuesta si/no sobre si una afirmacion o accion se sostiene, y puntuacion segun una rubrica de 2 a 10 niveles.

Su relevancia esta en el nicho de las decisiones baratas dentro de sistemas de agentes: controlar la siguiente accion de un agente, verificar si una tarea se ha completado realmente, contrastar una respuesta con sus fuentes documentales, calificar salidas o enrutar peticiones. El argumento del autor es que en esos puntos una llamada completa a un LLM resulta demasiado lenta o cara, y un juez de 4B con probabilidades calibradas permite fijar umbrales propios para actuar, preguntar o escalar a un humano.

Es importante senalar el estado del proyecto: en el momento de redactar esta ficha, Mica v0.5 esta en fase final de entrenamiento y evaluacion y los pesos no estan publicados. El autor anuncia la publicacion de pesos, builds GGUF e informe tecnico en un plazo objetivo de dos semanas. La generacion anterior, Mica v0.1 4B, si esta disponible y es la referencia publica actual del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor indica que ha cambiado de forma sustancial respecto a v0.1 y que publicara los detalles al cerrar el diseno) |
| Parametros totales | aproximadamente 4B (badge del autor «params-4B»; desglose exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | builds GGUF para llama.cpp anunciados; niveles concretos (Q4_K_M, Q5_K_M, Q8_0, etc.) no disponibles |
| Idiomas soportados | ingles, chino y coreano como idiomas principales (mayor volumen de entrenamiento y evaluacion); otros idiomas funcionan con menos pruebas |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint de Hugging Face (safetensors, formato no detallado en la model card) y GGUF para llama.cpp; ninguno publicado todavia |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B mediante ajuste fino, pero el autor describe v0.5 como una reescritura sustancial de v0.1 y no como un simple fine-tune incremental: afirma que la arquitectura ha cambiado de forma significativa y que publicara los detalles cuando esten cerrados. No se dispone de informacion publica sobre el tipo de arquitectura resultante (transformer denso, MoE, hibrida u otra), ni sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras etapas de alineamiento.

La innovacion que si se describe con detalle es el esquema de inferencia en tres modos, pensado para controlar el coste por peticion. En modo `off` se realiza una unica pasada forward sin generar tokens. En modo `off+` se anade tratamiento determinista de fechas, horas, numeros y unidades, y una segunda revision de las partes clave de entradas largas, manteniendo la determinacion (misma entrada, misma salida). En modo `auto` el modelo decide por peticion si merece la pena un breve paso de razonamiento: los casos faciles responden como en `off+` y los dificiles pagan un coste adicional de 0,3 a 0,5 s en una RTX 3090, solo cuando razona. El autor indica que el modo `off` es el predeterminado y que se puede fijar un modo o limitar la latencia extra por peticion.

En cuanto a los datos, la model card indica que el entrenamiento cubre agentes de programacion, uso de ordenador, fundamentacion documental, aplicacion de politicas y reglas, evaluacion de respuestas, comprobaciones de seguridad, juegos y conocimiento general, con una proporcion mucho mayor de casos dificiles escritos de forma adversarial. Tambien se menciona entrenamiento explicito para reducir la sensibilidad al orden y la redaccion de las opciones, cometer menos errores con alta confianza y abstenerse cuando la informacion no esta en la entrada.

## Capacidades

- Juicio por eleccion: seleccion del mejor candidato entre 2 y 255 opciones, con probabilidad por opcion.
- Juicio binario: verificacion si/no de si una afirmacion, accion o respuesta se sostiene.
- Puntuacion por rubrica: calificacion en escalas de 2 a 10 niveles.
- Probabilidades calibradas: el autor afirma que un 0,9 se corresponde aproximadamente con lo que declara, lo que permite fijar umbrales de actuacion, consulta o escalado.
- Tres modos de inferencia (`off`, `off+`, `auto`) con control del compromiso latencia/precision por peticion.
- Robustez mejorada frente a v0.1: menor sensibilidad al orden de las opciones y a su redaccion.
- Abtencion: entrenado para no responder cuando la informacion necesaria no esta presente.
- Cobertura de dominios de entrenamiento: agentes de codigo, uso de ordenador, fundamentacion documental, politicas y reglas, evaluacion de respuestas, seguridad, juegos y conocimiento general.
- Multilingue: ingles, chino y coreano como idiomas principales.
- Despliegue en llama.cpp mediante GGUF, con modo `off` viable en CPU para volumen bajo.
- No es un modelo conversacional: no genera texto de chat, no navega y no recupera documentos por si mismo.

## Casos de uso

- Control de agentes: antes de ejecutar la siguiente accion de un agente, el modelo recibe el estado, la pregunta y las acciones candidatas y devuelve una probabilidad por accion. El modo `off` evita anadir generacion de tokens y mantiene la latencia baja en un bucle de decision que se ejecuta muchas veces por tarea.
- Verificacion de finalizacion de tareas: dado el objetivo, el historial y el resultado declarado, el modelo emite un si/no con probabilidad asociada. Permite distinguir entre un agente que ha terminado de verdad y uno que afirma haber terminado sin lograrlo.
- Evaluacion de respuestas contra fuentes: con el texto de origen y la respuesta generada en la entrada, el modelo puntua si la respuesta esta fundamentada. La model card lo situa explicitamente en el area de «document grounding», apropiado para pipelines de control de calidad documental.
- Enrutado de peticiones: eleccion entre modelos o rutas de coste distinto segun la dificultad o el dominio de la consulta, usando los umbrales calibrados para decidir cuando basta un modelo pequeno y cuando hay que escalar.
- Calificacion con rubricas: puntuacion de salidas en escalas de 2 a 10 niveles para evaluacion de modelos, revision de contenidos o control de calidad de respuestas, con el coste de un clasificador en lugar de una llamada generativa.
- Aplicacion de politicas y reglas: comprobacion de si una accion o respuesta cumple un conjunto de reglas dado en la propia entrada, orientado a validaciones de cumplimiento dentro de flujos automatizados.
- Comprobaciones de seguridad: verificacion binaria de respuestas o acciones potencialmente problematicas antes de que lleguen a produccion, como capa adicional a otros filtros.
- Investigacion en evaluacion: uso como juez de bajo coste en experimentos de LLM-as-a-judge donde se necesitan muchas evaluaciones y el presupuesto de inferencia es limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de Mica v0.5 4B en la informacion disponible. El autor indica que los resultados se publicaran junto con los pesos, acompanados del modo y la configuracion empleada en cada numero.

Como referencia de la generacion anterior, el repositorio de Mica v0.1 4B en GitHub reporta una prueba de robustez consistente en insertar en el estado una nota que induce a elegir la opcion incorrecta:

| Escenario (Mica v0.1 4B) | Mica v0.1 | JEV | Kev | Qwen3.5-4B (base) |
|---|---|---|---|---|
| Nota en el estado que empuja a la opcion incorrecta (porcentaje de acierto) | 69,1 % | 17,5 % | 31,4 % | 1,0 % |
| La misma nota senalando la opcion correcta | 88,7 % | no disponible | no disponible | no disponible |

Estos datos corresponden a v0.1 4B, no a v0.5, y proceden del repositorio del autor; no deben extrapolarse a la version nueva. No se dispone de MMLU, HumanEval, GSM8K ni de resultados equivalentes para ninguna de las dos versiones.

## Requisitos de hardware

- VRAM estimada (calculada a partir del tamano nominal de 4B, no confirmada por el autor): en BF16/FP16 alrededor de 8 GB de pesos; en cuantizacion de 8 bits en torno a 4-5 GB; en Q4_K_M alrededor de 2,5-3 GB. Hay que anadir el espacio de cache KV, que depende de un contexto maximo no disponible.
- GPU recomendadas: el autor menciona una RTX 3090 como referencia de latencia para el modo `auto` (0,3-0,5 s de coste adicional cuando el modelo razona). No se publican requisitos para A100, H100 u otras GPU de centro de datos.
- Compatibilidad con GPU de consumo: la model card afirma que el modelo se ejecuta comodamente en una unica GPU de consumo, sin concretar modelos. Por tamano, deberia caber en tarjetas de 8 GB o mas en cuantizaciones reducidas, pero esto es una inferencia por tamano y no un dato confirmado.
- CPU: el modo `off` se describe como practico en CPU para uso de bajo volumen.
- Opciones de despliegue: llama.cpp es la ruta confirmada por el autor mediante builds GGUF, y por tanto tambien Ollama o servidores compatibles con GGUF. No se confirma soporte de vLLM, TGI ni otros servidores de inferencia, ni la existencia de una cabeza de clasificacion compatible con ellos.
- Latencia y throughput: el unico dato publicado es el coste adicional de 0,3-0,5 s en RTX 3090 para el modo `auto` cuando decide razonar. El modo `off` se describe como practicamente instantaneo, sin cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de comparativas de Mica v0.5 4B con otros jueces abiertos (por ejemplo, familias tipo Prometheus, Glider o jueces derivados de modelos de 7B) en la informacion proporcionada. La comparacion posible se limita al propio linaje del modelo:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Mica v0.5 4B | ~4B | no disponible | en, zh, ko | Apache 2.0 | pesos no publicados (fase final de entrenamiento) |
| Mica v0.1 4B | ~4B (base Qwen3.5-4B) | no disponible | en, ko (entrenados, segun la actividad del autor) | Apache 2.0 | disponible en Hugging Face |
| Qwen3.5-4B (base) | ~4B | no disponible | no disponible | no disponible en la informacion proporcionada | disponible |

Diferencias declaradas entre v0.5 y v0.1: arquitectura reescrita, incorporacion de los tres modos de inferencia con `auto`, mayor cobertura de dominios de entrenamiento, mas casos adversariales y mejor comportamiento frente a sesgos de orden y redaccion de opciones. El autor espera que v0.5 se situe entre los mejores modelos abiertos de 4B para tareas de juicio, pero se trata de una expectativa sin datos publicados.

## Limitaciones y advertencias

- Pesos no disponibles: en el momento de redactar esta ficha, Mica v0.5 4B solo tiene model card; no hay pesos, GGUF ni informe tecnico descargables. Todo uso en produccion hoy implicaria recurrir a v0.1 4B.
- No es un modelo de chat: no genera texto conversacional y esta pensado para devolver decisiones y probabilidades sobre candidatos dados.
- Dependencia de la entrada: funciona mejor cuando la informacion necesaria para decidir esta en el propio input. No navega ni recupera documentos, por lo que no puede resolver carencias de contexto por si mismo.
- Riesgo de error por conocimiento ausente: el autor reconoce explicitamente que puede equivocarse, sobre todo en preguntas que requieren conocimiento que el modelo no ha visto.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible. El entrenamiento esta concentrado en ingles, chino y coreano, por lo que el rendimiento y el comportamiento pueden degradarse en otros idiomas.
- Sensibilidad a la formulacion: aunque v0.5 se entrena para reducir la sensibilidad al orden y la redaccion de las opciones, los datos de v0.1 muestran que las notas insertadas en el estado mueven la decision (69,1 % frente a 88,7 % segun si la nota apunta a la opcion incorrecta o correcta). Es un riesgo a tener en cuenta si la entrada puede estar manipulada.
- Uso en decisiones de alto impacto: la recomendacion del propio autor es tratar la salida como una senal mas, acompanada de otras comprobaciones, y usar las probabilidades calibradas para decidir cuando debe intervenir un humano.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero al no haber pesos publicados no puede verificarse el cumplimiento ni la procedencia de los datos de entrenamiento.
- Madurez del proyecto: se trata de un proyecto independiente de un unico desarrollador, sin historial de soporte ni garantias de mantenimiento.

## Enlaces

- Modelo en Hugging Face (v0.5 4B): https://huggingface.co/sky7350/Mica-v0.5-4B
- Generacion anterior (v0.1 4B): https://huggingface.co/sky7350/Mica-v0.1-4B
- Repositorio GitHub de Mica v0.1 4B: https://github.com/akivet/Mica-v0.1-4B
- Perfil del autor en Hugging Face: https://huggingface.co/sky7350
- Datasets del autor en Hugging Face: https://huggingface.co/sky7350/datasets
- Indice de decisiones JEV, donde se ha anadido Mica v0.1 4B (referenciado en la actividad del autor): multimodalart/jev-decision-index en Hugging Face
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Informe tecnico de v0.5: anunciado, no disponible
- Pesos y builds GGUF de v0.5: anunciados, no disponibles
