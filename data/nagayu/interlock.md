# NagaYu/interlock

## Resumen

Interlock es un modelo de clasificación de texto para seguridad de agentes, desarrollado por NagaYu (Yuta Nagao). Su función es evaluar si una llamada de herramienta propuesta por un agente autónomo se desvía de lo que el usuario realmente pidió. Se sitúa entre la propuesta de llamada y su ejecución, devolviendo un veredicto de tres valores: `allow`, `confirm` o `block`. Es relevante porque los agentes autónomos son vulnerables a prompt injection, jailbreaks y errores del modelo que pueden provocar acciones no solicitadas o con efectos secundarios no deseados.

El modelo tiene dos niveles: un nivel lineal (tier 1) de 1080 parámetros, implementado como regresión logística multinomial de dos cabezas sobre 107 características estructuradas de alineación entre petición y acción, que se ejecuta en NumPy puro sin tokenizador ni torch; y un nivel encoder opcional (tier 2) basado en ModernBERT-base con cabezas de decisión y desviación, exportado a ONNX. El tamaño total reportado en safetensors es de 1294 parámetros. No es un modelo generativo, por lo que no tiene longitud de contexto en el sentido habitual. Está diseñado para runtimes de agentes donde los esquemas de herramientas están declarados y donde una confirmación es más barata que un efecto secundario no deseado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos niveles: regresion logistica multinomial (tier 1) y ModernBERT-base con cabezas de decision y desviacion (tier 2) |
| Parametros totales | 1294 (tier 1: 1080; tier 2: no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de clasificacion, no generativo) |
| Tipos de cuantizacion | No disponible (tier 1 en NumPy, tier 2 en ONNX; existe un contenedor GGUF que no es runtime) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, npz, onnx, gguf (contenedor de pesos) |

## Arquitectura y entrenamiento

El tier 1 es una regresion logistica multinomial de dos cabezas que opera sobre 107 caracteristicas estructuradas que describen la alineacion entre la peticion del usuario y la llamada de herramienta propuesta. Estas caracteristicas incluyen aspectos como el alcance de los argumentos, la correspondencia de tipos y la presencia de acciones no solicitadas. El tier 2, opcional, usa ModernBERT-base con una cabeza de decision y una cabeza de desviacion, procesando una representacion de texto anotada por roles de la misma pareja peticion-accion. El entrenamiento se realizo con datos sinteticos generados, con un split por familia de herramientas: entrenamiento y validacion en `fs, shell, mail, calendar, issues`, y un conjunto held-out en `browser, crm, storage, db` para evaluar la generalizacion a esquemas no vistos. No se menciona el uso de RLHF o DPO. La innovacion principal es la salida de tres valores (`allow`, `confirm`, `block`) y la prediccion de un tipo de desviacion entre siete categorias, lo que permite a un harness actuar de forma diferenciada.

## Capacidades

- Clasificacion de llamadas de herramienta en tres decisiones: `allow`, `confirm` (pedir confirmacion al usuario) y `block` (rechazar).
- Prediccion del tipo de desviacion: `none`, `scope_expansion`, `unrequested_action`, `irreversible_unconfirmed`, `target_mismatch`, `out_of_scope`, `privilege_escalation`.
- Deteccion de desviaciones de alcance, acciones no solicitadas, escalada de privilegios y objetivos incorrectos.
- Funciona con esquemas de herramientas declarados, sin necesidad de conocer la API concreta de cada producto.
- Inferencia extremadamente rapida en el tier 1: 0.247 ms de media y 0.663 ms en p95 por llamada completa, incluyendo codificacion, en un unico hilo ARM64.
- El tier 2 ofrece mayor precision cuando la senal esta en la redaccion mas que en la estructura, a costa de mayor latencia.
- Solo soporta ingles en peticiones y descripciones de herramientas.

## Casos de uso

- Guardrail en agentes autonomos con acceso a sistema de archivos: el modelo puede bloquear llamadas como `fs.delete_file` cuando el argumento `path` se amplia mas alla de lo solicitado, evitando borrados accidentales o malintencionados.
- Prevencion de prompt injection: si un prompt inyectado induce al agente a llamar a una herramienta con argumentos que exceden la peticion original, Interlock detecta la desviacion y devuelve `block` o `confirm`.
- Confirmacion de acciones irreversibles: ante llamadas como `mail.send` o `issues.close`, el veredicto `confirm` permite al harness pedir confirmacion al usuario antes de ejecutar, reduciendo el riesgo de efectos secundarios no deseados.
- Integracion en runtimes de agentes con esquemas declarados: se puede insertar entre la propuesta de llamada y su ejecucion, devolviendo un veredicto que el harness traduce en proceder, preguntar o rechazar.
- Auditoria de logs de agentes: aplicando el modelo a llamadas registradas, se pueden identificar desviaciones pasadas y ajustar politicas de seguridad.
- Filtrado en pipelines de automatizacion: en flujos donde un agente ejecuta multiples herramientas, Interlock actua como una capa de control que interrumpe llamadas fuera de alcance antes de que causen dano.

## Benchmarks y rendimiento

La model card reporta metricas para el tier 1, medidas sobre un split por familia de herramientas:

| Split | Over-blocking | Deteccion de desviacion |
|-------|---------------|-------------------------|
| Validacion (familias vistas, mundo no visto) | 2.9% | 88.0% |
| Held-out (esquemas de herramientas no vistos) | 1.8% | 79.3% |

Over-blocking es la fraccion de llamadas legitimas que fueron interrumpidas. La latencia medida es de 0.247 ms de media y 0.663 ms en p95 sobre 400 llamadas de un solo hilo en ARM64, incluyendo la codificacion. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- El tier 1 es una regresion logistica en NumPy puro: no requiere GPU ni VRAM, corre en cualquier CPU moderna.
- El tier 2 (ONNX) puede ejecutarse en CPU con ONNX Runtime; no se especifican requisitos de memoria, pero al ser ModernBERT-base, cabe en sistemas con unos pocos GB de RAM.
- No se necesita GPU para ninguno de los dos niveles; el modelo esta disenado para inferencia de baja latencia en entornos de produccion.
- Opciones de despliegue: NumPy para tier 1, ONNX Runtime para tier 2. El archivo GGUF no es un runtime y no puede servirse con llama.cpp.
- La latencia medida (0.247 ms media) es para el tier 1 en un unico hilo ARM64; en x86 se espera un rendimiento similar o mejor.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Interlock es un modelo especializado en seguridad de agentes con una arquitectura no generativa, lo que lo diferencia de guardrails generativos como Llama Guard o Prompt Guard, pero no hay datos publicados que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Datos sinteticos: todos los episodios, esquemas de herramientas y desviaciones de entrenamiento son generados; no se contacto con ningun servicio real. El rendimiento en trafico de produccion no esta medido.
- Solo ingles: peticiones y descripciones de herramientas en otros idiomas no estan soportadas ni evaluadas.
- Una capa entre varias: Interlock solo lee la correspondencia entre peticion y llamada; no analiza el contenido del payload por dano, no proporciona sandboxing y no ve efectos fuera de la llamada mostrada.
- No garantiza seguridad: un veredicto `allow` significa que no se encontro desviacion de limite, no que la llamada sea segura. Debe desplegarse junto a shields de contenido, sandboxing y confirmacion humana.
- Herramientas no vistas reducen precision: la deteccion cae del 88.0% al 79.3% en familias held-out, aunque el over-blocking se mantiene bajo.
- El punto de operacion es una eleccion: los umbrales se ajustaron contra un presupuesto de over-blocking en validacion; despliegues con diferente tolerancia a interrupciones deben reajustarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NagaYu/interlock
- Perfil del autor: https://huggingface.co/NagaYu
