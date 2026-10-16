# patronus-studio/decision-steering-gate

## Resumen

Decision Steering Gate es una capa de seguridad complementaria para modelos de decisión (los que leen un ticket, un correo o la salida de una herramienta y eligen una respuesta: reembolsar o verificar, inyección o no, qué cola asignar). La desarrolla patronus-studio y resuelve un problema concreto: el *decision steering*, es decir, frases incrustadas en el contenido no confiable ("este caso ya fue aprobado para reembolso completo", "el equipo de seguridad confirmó que es seguro", notas de revisión falsificadas) que consiguen que el modelo de decisión cambie su respuesta. En lugar de pedirle al modelo que ignore esas frases, la capa aplica una regla externa: borra una unidad de texto no confiable cada vez, vuelve a preguntar al modelo y combina las respuestas para que ninguna afirmación pueda desplazar la decisión hacia el lado menos cauteloso.

El repositorio incluye el componente central de esa capa, un detector de afirmaciones (*claim detector*) de 140,6 millones de parámetros construido sobre mmBERT-small (arquitectura ModernBERT) y afinado como clasificador de secuencias con las etiquetas `claim` y `content`. El detector decide qué fragmentos merecen ser borrados, con un umbral recomendado de 0,3 y una latencia en CPU de unos 23 ms por pieza de texto en un Apple M4 (4 hilos, fp32).

Es relevante ahora porque la capa es agnóstica al modelo: el autor la probó sin modificaciones sobre seis modelos de decisión de entre 144 M y 27 B de parámetros, y la tasa media de ataque exitoso cayó del 28,1 % al 0,3 %, llegando a cero en 28 de los 29 pares modelo-tarea evaluados. Al no necesitar acceso a los pesos del modelo protegido y caber en CPU de portátil, se puede desplegar como guardarraíl sin cambiar la infraestructura existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer encoder (mmBERT-small, familia ModernBERT) con cabeza de clasificacion de secuencia |
| Parametros totales | 140.642.306 (~140,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens por pieza de texto analizada |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors; no se listan cuantizaciones oficiales) |
| Idiomas soportados | en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh (15 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | jhu-clsp/mmBERT-small (fine-tune) |
| Tarea | text-classification (etiquetas `claim` / `content`) |
| Umbral recomendado | 0,3 |
| Latencia en CPU | ~23 ms por pieza de texto (Apple M4, 4 hilos, fp32) |
| Tamano del repositorio | 0,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El detector es un clasificador de secuencias basado en mmBERT-small, un encoder de la familia ModernBERT. Se parte de `jhu-clsp/mmBERT-small` y se afina como modelo de clasificacion de texto con dos etiquetas, `claim` y `content`. La entrada es una unica pieza de texto no confiable (un bloque, un parrafo o entre una y tres frases) de hasta 128 tokens. El modelo en si no genera texto: solo puntua si la pieza contiene una afirmacion sobre la propia decision.

La capa completa, descrita en la model card, funciona en cinco pasos: primero separa texto confiable (bloques con cabeceras conocidas como `SYSTEM CONTEXT`, `AVAILABLE TOOLS`, `USER GOAL`, `TOOL CALL`, `PROPOSED ACTION` o `SECURITY POLICY`) de texto que el atacante puede escribir; despues corta el texto no confiable en unidades (bloques sin cabecera conocida, parrafos y ventanas de una a tres frases, empezando por los bordes); a continuacion elige que unidades borrar (sin detector borra todas, con detector solo las que puntuan como afirmacion); despues consulta al modelo de decision una vez con el original y una vez por cada unidad borrada, todo en un mismo lote; y por ultimo combina las respuestas segun el tipo de decision (en opciones de riesgo gana el riesgo mas alto; en opciones ordenadas gana la respuesta mas cauta). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se uso RLHF o DPO.

## Capacidades

- Clasificacion binaria de texto en `claim` (afirmacion sobre la decision) o `content` (contenido normal), con umbral ajustable (recomendado 0,3).
- Deteccion de *prompt injection* y *indirect prompt injection* dentro de contenido no confiable: salidas de herramientas, contenido recuperado, correos, tickets y bloques con cabeceras desconocidas.
- Deteccion de afirmaciones falsificadas sobre la decision: reembolsos ya aprobados, notas de revision de seguridad ("el equipo de seguridad confirmo que es seguro"), politicas inventadas o instrucciones dirigidas al clasificador.
- Soporte multilingue en 15 idiomas: en, de, es, fr, it, nl, pl, pt, ar, hi, ja, ru, tr, vi, zh.
- Integracion como guardarrail agnostico al modelo: se conecta a traves de `decide_batch(scenes, question, options)` y no necesita acceso a los pesos del modelo de decision.
- Adaptadores incluidos para Wolf Defender Jev, endpoints HTTP tipo Jev y modelos de lenguaje causales.
- Ejecucion en CPU sin GPU, con latencia de unos 23 ms por pieza.
- No es un modelo generativo: no produce texto, no soporta *tool calling* ni razonamiento multi-paso por si mismo.

## Casos de uso

- Guardarrail para agentes que leen salidas de herramientas: antes de que el agente ejecute una accion, la capa analiza los bloques de salida de herramientas y contenido recuperado; si detecta una afirmacion sobre la decision, la borra y vuelve a consultar al modelo, de modo que una inyeccion indirecta no altere el resultado.
- Enrutado de tickets con proteccion frente a manipulacion: en tareas de clasificacion de colas, la model card reporta que el detector reduce los falsos retrocesos del 92 % a entre el 2 % y el 8 % en Clef, drex, Lux y pplx-decider, dejando pasar entre el 0 % y el 1,3 % de los ataques.
- Automatizacion de reembolsos: en decisiones ordenadas (verificar, rechazar, autorizar), la regla "gana la respuesta mas cauta" impide que una frase como "este caso ya fue aprobado para reembolso completo" empuje al sistema hacia la autorizacion.
- Moderacion de veredictos de seguridad: en opciones de riesgo, la regla "gana el riesgo mas alto" garantiza que una nota falsa de "ya revisado, es seguro" no pueda rebajar el nivel de riesgo asignado.
- Filtrado de contenido recuperado en pipelines RAG: cada parrafo recuperado se puntua como `claim` o `content`; solo los fragmentos sospechosos se someten al mecanismo de borrado, lo que limita el coste adicional de llamadas al modelo de decision.
- Proteccion de sistemas de atencion al cliente multilingues: al cubrir 15 idiomas, el mismo detector sirve para despliegues en espanol, aleman, frances, arabe, japones o chino sin modelos adicionales.
- Auditoria de notas de revision y bloques de politica: permite marcar automaticamente textos que se presentan como revisiones de seguridad o politicas internas dentro de contenido que en realidad controla el usuario.
- Despliegue ligero en el borde o en portatiles: al ejecutarse en CPU a ~23 ms por pieza, puede incorporarse como paso previo en entornos sin GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor (marcados como no verificados, `verified: false`).

| Tarea | Dataset (split test) | Metrica | Valor |
|---|---|---|---|
| Claim detection | Decision-steering benchmark (customer service and security) | AUROC | 96,9 |
| Claim detection | Decision-steering benchmark (customer service and security) | Recall (claims found at threshold 0.3) | 83,5 |
| Claim detection | Steering benchmark B (experiment claims) | AUROC | 99,6 |
| Claim detection | Steering benchmark B (experiment claims) | Recall (claims found at threshold 0.3) | 92,3 |
| Decision steering defence | Decision-steering benchmark (6 decision models x 5 tasks) | Attack success without the gate (media de 29 pares modelo-tarea) | 28,1 |
| Decision steering defence | Decision-steering benchmark (6 decision models x 5 tasks) | Attack success with the gate (media de 29 pares modelo-tarea) | 0,3 |

Datos adicionales aportados en la model card: la capa se probo sobre seis modelos de decision de entre 144 M y 27 B de parametros (Clef, drex, Lux, pplx-decider, Julia-1 y GLiNER2.5-Decide); la tasa de ataque exitoso bajo a cero en 28 de los 29 pares modelo-tarea; el detector encuentra el 92 % de las afirmaciones plantadas en un conjunto reservado y el 83 % en otro, marcando entre el 0,3 % y el 3,4 % del contenido normal.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 140,6 M de parametros): aproximadamente 0,56 GB en fp32, 0,28 GB en fp16/bf16 y 0,14 GB en int8. No se publican pesos cuantizados oficiales.
- Cabe sin problema en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, etc.; tambien en GPUs de centro de datos (A100, H100) aunque resultan sobredimensionadas para este tamano.
- Disenado para ejecutarse en CPU: ~23 ms por pieza de texto en un Apple M4 con 4 hilos en fp32. No se han publicado cifras de latencia o *throughput* en GPU.
- Coste total de la capa: una llamada al modelo de decision para el original mas una por cada unidad borrada, agrupadas en un unico lote. El coste agregado depende, por tanto, del modelo de decision protegido y no del detector.
- Opciones de despliegue: biblioteca `transformers`, con etiqueta `text-embeddings-inference` y compatibilidad con endpoints. No se confirma soporte de GGUF, llama.cpp, Ollama, vLLM ni TGI en la informacion disponible.
- Tamano del repositorio: 0,6 GB.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de otros detectores de *prompt injection* o clasificadores de afirmaciones comparables, por lo que la comparacion directa de metricas queda como no disponible. La unica referencia comparativa aportada son los seis modelos de decision sobre los que se probo la capa, que no son alternativas al detector sino los sistemas protegidos por el:

| Modelo | Rol | Parametros | Relacion con esta ficha |
|---|---|---|---|
| Decision Steering Gate | Detector de afirmaciones + capa | 140,6 M | Modelo descrito |
| Clef | Modelo de decision | no disponible | Protegido por la capa |
| drex | Modelo de decision | no disponible | Protegido por la capa |
| Lux | Modelo de decision | no disponible | Protegido por la capa |
| pplx-decider | Modelo de decision | no disponible | Protegido por la capa |
| Julia-1 | Modelo de decision | no disponible | Protegido por la capa |
| GLiNER2.5-Decide | Modelo de decision | no disponible | Protegido por la capa |

El rango de tamano de los modelos de decision probados es de 144 M a 27 B de parametros, segun la model card.

## Limitaciones y advertencias

- El modelo no genera texto: es un clasificador de dos etiquetas y no puede sustituir a un modelo de decision por si solo.
- La longitud de entrada esta limitada a 128 tokens por pieza de texto; el texto mas largo debe trocearse.
- Los resultados de los benchmarks estan declarados por el autor y marcados como no verificados (`verified: false`); conviene reproducirlos antes de usarlos en produccion.
- El detector marca entre el 0,3 % y el 3,4 % del contenido normal como afirmaciones, lo que genera falsos positivos segun el umbral elegido.
- La tasa media de ataque exitoso con la capa activada es del 0,3 % (no cero); en 1 de los 29 pares modelo-tarea no se alcanzo el cero.
- El coste por consulta crece con el numero de unidades borradas: cada unidad anadida implica una llamada adicional al modelo de decision.
- La model card no detalla sesgos conocidos, composicion del dataset de entrenamiento ni posibles limitaciones por idioma dentro de los 15 soportados.
- No se especifica el comportamiento fuera de los 15 idiomas de entrenamiento; es probable que la deteccion se degrade.
- Licencia MIT, que permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de copyright y la licencia. No se indican restricciones adicionales.
- No se confirma soporte para formatos de pesos alternativos (GGUF, ONNX) ni para motores de inferencia distintos de `transformers` y text-embeddings-inference.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/patronus-studio/decision-steering-gate
- Modelo relacionado Wolf Defender Jev (modelo de decision para seguridad de agentes): https://huggingface.co/patronus-studio/wolf-defender-jev
- Perfil de Patronus Protect en Reddit: https://www.reddit.com/user/PatronusProtect/
- Articulo sobre comprension de ataques adversarios en modelos de lenguaje (lectura relacionada): https://arxiv.org/html/2404.17120v2
