# JurinAI/JJ-1

## Resumen

JJ-1 es una familia de modelos de decision para el ambito empresarial japones desarrollada por JurinAI. A diferencia de un modelo generativo convencional, JJ-1 no produce prosa: recibe un estado (texto o JSON) junto con preguntas tipadas y devuelve respuestas estructuradas acompanadas de probabilidades. Su proposito es enrutar peticiones, juzgar urgencia y determinar que elementos requieren seguimiento dentro de flujos de trabajo empresariales.

La familia se compone de cuatro tamanos (0.8B, 2B, 4B y 9B parametros) que comparten la misma interfaz de decision, de modo que el integrador puede empezar por el modelo mas pequeno que cumpla los requisitos de precision de su flujo y escalar segun necesidad. La interfaz admite tres tipos de pregunta: eleccion entre opciones (devuelve una distribucion de probabilidad), si/no (devuelve la probabilidad de "si") y puntuacion sobre una escala ordenada (devuelve un nivel ponderado por probabilidad).

El repositorio JurinAI/JJ-1 actua como nodo central de la familia: enlaza los repositorios de pesos de cada tamano, la model card y las instrucciones de inferencia. En el momento de la consulta, los cuatro repositorios alpha enlazados estan marcados como privados, por lo que los pesos no son descargables publicamente y el repositorio central no presenta descargas ni "likes". El backbone declarado es Qwen3.5, con ajuste fino a partir de StartLux-Decision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5 con ajuste fino); detalles no disponibles |
| Parametros totales | Cuatro variantes: 0.8B, 2B, 4B y 9B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no especificado por el autor) |
| Idiomas soportados | no disponible en los metadatos de HuggingFace; la model card se presenta como "Japanese business decision models" y ofrece version en japones |
| Licencia | Pesos: CC BY-NC 4.0. Codigo de inferencia: Apache-2.0 (los metadatos del repositorio central no declaran licencia) |
| Formato de pesos | no disponible (los repositorios de pesos estan privados en la fecha consultada) |

## Arquitectura y entrenamiento

La model card indica que los modelos actuales emplean un backbone Qwen3.5 y que se han obtenido mediante ajuste fino a partir de StartLux-Decision. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se especifica si se trata de un transformer denso convencional o de alguna variante hibrida, ni se describen innovaciones de decodificacion.

La innovacion principal es de interfaz, no de arquitectura: el modelo se evalua y se entrena para emitir respuestas tipadas (eleccion, si/no, puntuacion) con probabilidades asociadas, en lugar de texto libre. Esto lo orienta a tareas de clasificacion y enrutado con umbral calibrable. La evaluacion publicada se apoya en un conjunto sintetico de negocio con 2.355 preguntas de etiqueta dura procedentes de espacios de trabajo reservados (held-out), y en una evaluacion completa de 110.074 preguntas repartidas en 13 fuentes de datos y paquetes de evaluacion, con la exactitud global ponderada por el numero de preguntas de etiqueta dura.

## Capacidades

- Enrutado de peticiones: seleccion de una opcion entre un conjunto cerrado, devolviendo la distribucion de probabilidad completa en lugar de una unica respuesta.
- Juicio de urgencia: respuesta si/no con probabilidad, apta para fijar umbrales de escalado.
- Decision sobre seguimiento: determinacion de que elementos requieren accion posterior.
- Puntuacion en escalas ordenadas: devolucion de un nivel ponderado por probabilidad, util para priorizacion.
- Entrada estructurada: acepta el estado como texto o como JSON.
- Salida estructurada: respuestas tipadas y probabilidades, sin generacion de prosa.
- Ambito linguistico: la familia se comercializa explicitamente para negocio japones; el soporte multilingue no esta documentado.
- Tool calling / function calling: no documentado.
- Capacidades de agente y razonamiento multi-paso: no documentadas; la interfaz es de decision puntual, no de planificacion.
- Vision, audio y modo "thinking": no documentados.

## Casos de uso

- Triaje de urgencia en bandejas compartidas: cada mensaje entrante se envia como estado y se formula una pregunta si/no sobre si requiere atencion inmediata; el umbral de probabilidad se ajusta para equilibrar falsos positivos y falsos negativos.
- Enrutado de tickets de soporte: con el tipo de pregunta de eleccion, el modelo devuelve una distribucion sobre las colas o equipos de destino, lo que permite enrutar por maxima probabilidad o derivar a revision humana cuando la distribucion es plana.
- Deteccion de seguimiento comercial en CRM: pregunta si/no sobre si una oportunidad necesita una accion de seguimiento tras la ultima interaccion, con la probabilidad como senal de prioridad para el equipo de ventas.
- Priorizacion de carteras con escala ordenada: la pregunta de puntuacion asigna un nivel ponderado por probabilidad, lo que facilita ordenar colas de trabajo sin definir reglas manuales.
- Automatizacion de flujos RPA y back office: al devolver JSON tipado en lugar de texto, la salida se puede conectar directamente a un motor de reglas o a un orquestador, sin necesidad de parsear lenguaje natural.
- Enrutado dentro de una arquitectura de agentes: uso del modelo como router que decide que herramienta, cola o subsistema debe procesar cada peticion antes de invocar un modelo generativo mayor.
- Moderacion y clasificacion de entrada con umbral explicito: la salida probabilistica permite fijar puntos de corte auditables y documentar la politica de decision.
- Despliegue en entornos con restricciones de coste: la variante de 0.8B permite clasificar grandes volumenes de eventos por un coste computacional bajo, reservando variantes mayores para casos donde la exactitud sea critica.

## Benchmarks y rendimiento

Datos publicados en la model card, extraidos del informe tecnico de JJ-1 (resultados alpha):

| Modelo | Evaluacion de negocio Jurin · espacios reservados | Evaluacion completa · global |
|---|---:|---:|
| JJ-1 0.8B | 90,32% | 65,13% |
| JJ-1 2B | 93,21% | 68,22% |
| JJ-1 4B | 95,12% | 74,45% |
| JJ-1 9B | 96,43% | 77,82% |

Notas sobre la medicion: la evaluacion sintetica de negocio emplea 2.355 preguntas de etiqueta dura procedentes de espacios de trabajo reservados; la evaluacion completa cubre 110.074 preguntas distribuidas en 13 fuentes de datos y paquetes de evaluacion, con la exactitud global ponderada por el numero de preguntas de etiqueta dura. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y el autor advierte explicitamente de que son resultados de benchmark y que debe validarse el rendimiento en el flujo de trabajo propio.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia orientativa calculada a partir del numero de parametros (no confirmada oficialmente), en FP16 los pesos ocuparian aproximadamente 1,6 GB (0.8B), 4 GB (2B), 8 GB (4B) y 18 GB (9B), sin contar memoria para el contexto ni el runtime.
- En cuantizacion de 4 bits, las mismas estimaciones serian del orden de 0,5 GB, 1,2 GB, 2,5 GB y 5,5 GB de pesos respectivamente, tambien sin overhead.
- GPU recomendadas: no disponible. Las variantes de 0.8B y 2B serian candidatas a ejecucion en GPU de consumo tipo RTX 3060/4060/4090 segun las estimaciones anteriores; las variantes de 4B y 9B requeririan cuantizacion o GPU con mas memoria (por ejemplo, A100 o H100) para contextos largos. Esta adecuacion no ha sido confirmada por el autor.
- Opciones de despliegue: no disponibles. Al estar los repositorios de pesos privados, no se puede verificar la compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos publicos comparables de la misma categoria (modelos de decision con salida tipada y probabilistica orientados a negocio japones), por lo que la comparacion externa no esta disponible. Como referencia interna de la propia familia, los cuatro tamanos comparten interfaz y difieren en exactitud y coste:

| Variante | Parametros | Evaluacion de negocio (held-out) | Evaluacion completa | Licencia de pesos | Disponibilidad |
|---|---:|---:|---:|---|---|
| JJ-1 0.8B | 0,8B | 90,32% | 65,13% | CC BY-NC 4.0 | Repositorio alpha privado |
| JJ-1 2B | 2B | 93,21% | 68,22% | CC BY-NC 4.0 | Repositorio alpha privado |
| JJ-1 4B | 4B | 95,12% | 74,45% | CC BY-NC 4.0 | Repositorio alpha privado |
| JJ-1 9B | 9B | 96,43% | 77,82% | CC BY-NC 4.0 | Repositorio alpha privado |

Comparacion con alternativas externas: no disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce prosa, por lo que no sirve para redaccion, resumen libre ni conversacion abierta.
- Salida restringida a tres tipos de pregunta (eleccion, si/no, puntuacion); cualquier necesidad fuera de ese esquema queda sin cubrir por la interfaz documentada.
- Los pesos no estan publicamente disponibles: los cuatro repositorios alpha enlazados figuran como privados, por lo que no es posible descargar, auditar ni reproducir los resultados actualmente.
- La licencia de los pesos es CC BY-NC 4.0, que prohibe el uso comercial sin autorizacion adicional; el codigo de inferencia, en cambio, es Apache-2.0. Es imprescindible revisar los terminos de cada repositorio de modelo antes de un despliegue en produccion.
- Enfoque declarado en negocio japones; el soporte de otros idiomas no esta documentado y no deberia asumirse.
- Las cifras de evaluacion proceden del propio autor y de conjuntos de evaluacion sinteticos; no se han publicado resultados en benchmarks estandar independientes ni verificacion por terceros.
- La model card advierte que los resultados son de benchmark y que debe validarse el rendimiento en el flujo de trabajo propio, lo que implica riesgo de degradacion al cambiar de dominio o de idioma.
- Riesgo de alucinacion y sesgos: no evaluado ni documentado en la informacion disponible. Al emitir probabilidades, el riesgo principal es de calibracion (probabilidades mal calibradas que induzcan umbrales incorrectos), no de invencion de texto.
- No se documentan politicas de seguridad, filtros de contenido ni comportamiento ante entradas adversarias.
- Longitud de contexto desconocida: no se puede garantizar el tratamiento de estados largos o JSON de gran tamano.
- Metadatos del repositorio central sin licencia declarada, sin idiomas y sin pipeline; conviene apoyarse en la model card, no en los tags.
- Fecha de creacion del repositorio en HuggingFace: 2026-10-12, con actualizacion el mismo dia; el proyecto esta en fase alpha y su estado puede cambiar.

## Enlaces

- Repositorio central en HuggingFace: https://huggingface.co/JurinAI/JJ-1
- Organizacion JurinAI en HuggingFace: https://huggingface.co/JurinAI
- JJ-1 0.8B (alpha, privado en la fecha consultada): https://huggingface.co/JurinAI/JJ-1-0.8B-alpha
- JJ-1 2B (alpha, privado en la fecha consultada): https://huggingface.co/JurinAI/JJ-1-2B-alpha
- JJ-1 4B (alpha, privado en la fecha consultada): https://huggingface.co/JurinAI/JJ-1-4B-alpha
- JJ-1 9B (alpha, privado en la fecha consultada): https://huggingface.co/JurinAI/JJ-1-9B-alpha
- Informe tecnico de JJ-1: referenciado en la model card como origen de los resultados alpha, sin enlace publicado (no disponible)
- Model card en japones (README.ja.md): referenciada en el repositorio, no accesible como URL independiente en la informacion proporcionada
