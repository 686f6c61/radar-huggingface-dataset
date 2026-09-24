# espetro/kev-0.8b-gguf

## Resumen

Kev 0.8B es un modelo de decisión de estilo "System One" empaquetado en formato GGUF y publicado por el usuario espetro. No es un modelo generativo al uso: sobre un backbone Qwen3.5-0.8B se ha entrenado una cabeza pointer que devuelve probabilidades calibradas para preguntas tipadas (por ejemplo, elección entre categorías con criterios definidos) en lugar de generar texto libre. El paquete incluye la cabeza y la temperatura de calibración ya integradas en el fichero, mediante los tensores `dec.head_*` y la metadata `kev.*`, de modo que el modelo puede servirse directamente sin pasos adicionales de ensamblado.

El repositorio lo genera la herramienta `tools/kev/kev_pack.py` del fork `espetro/llama.cpp` (rama `kev`, licencia MIT), a partir del bundle gojev publicado en `taigrr/kev-0.8b-gguf`, que a su vez deriva del checkpoint `jaredpalmer/kev-0.8b`. El resultado es un único fichero GGUF de 0,8 GB con 752.917.824 parámetros, cuantizado en q8_0, que expone endpoints propios (`/v1/systemone` y `/studio`) cuando se sirve con el fork de llama.cpp, y que además carga como un Qwen3.5 ordinario en llama.cpp estándar (ignorando la cabeza y la metadata `kev.*`).

Su relevancia es acotada pero concreta: cubre el nicho de la clasificación y el enrutado deterministas con probabilidades calibradas, ejecutables en local, en CPU y hasta en navegador mediante una build WASM. No sustituye a un LLM conversacional ni a un generador de texto, y no hay datos publicados de benchmarks, idiomas soportados ni longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Qwen3.5-0.8B y cabeza pointer entrenada ("System One"), con temperatura de calibracion integrada |
| Parametros totales | 752.917.824 (~0,75 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_0 (unica recomendada por el autor); se advierte de que q4 degrada lo suficiente como para romper la calibracion |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos y cabeza); el runtime de empaquetado, `espetro/llama.cpp` rama `kev`, es MIT; el bundle de origen `taigrr/kev-0.8b-gguf` (gojev) es 0BSD |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 0,8 GB |
| Tensores extra | `dec.head_*` (cabeza pointer) y metadata `kev.*` (calibracion) integrados en el fichero |
| Endpoints propios | `/v1/systemone` y `/studio` (solo con el fork de llama.cpp habilitado para Kev) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura parte de un backbone transformer Qwen3.5-0.8B al que se le añade una cabeza pointer entrenada. El modelo no produce texto: recibe un estado (por ejemplo, el texto de una incidencia) y un conjunto de preguntas tipadas con sus criterios, y devuelve probabilidades calibradas sobre las opciones de cada pregunta. La temperatura de calibración viaja dentro del propio GGUF, de modo que la salida ya viene ajustada sin post-procesado. El autor describe el enfoque como "System One", en contraposición a los modelos de razonamiento extendido, y lo enmarca en la familia Jev.

El proceso de empaquetado lo realiza `tools/kev/kev_pack.py` del fork `espetro/llama.cpp`, que toma el bundle gojev de `taigrr/kev-0.8b-gguf` (derivado del checkpoint `jaredpalmer/kev-0.8b`) e inserta la cabeza y la calibración en el GGUF. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO sobre el backbone.

## Capacidades

- Respuesta a preguntas tipadas: devuelve probabilidades calibradas para preguntas de tipo `choice`, con instrucciones y criterios por opcion.
- Clasificacion y enrutado: asignacion de un estado de entrada a una categoria definida por el usuario (por ejemplo, departamento responsable de una incidencia).
- Salida probabilistica en lugar de generacion de texto, lo que permite fijar umbrales de confianza en el codigo que consume la API.
- Calibracion integrada en el fichero mediante temperatura horneada y tensores `dec.head_*`.
- Servicio mediante API compatible con los endpoints `/v1/systemone` y `/studio` del fork de llama.cpp.
- Ejecucion en navegador mediante build WASM de llama.cpp, con carga diferida del fichero.
- Compatibilidad de carga en llama.cpp estandar como modelo Qwen3.5 convencional (la cabeza y la metadata `kev.*` se ignoran).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto de la incidencia como estado y una pregunta `choice` con los equipos disponibles como criterios; devuelve la probabilidad de cada equipo, de modo que el sistema puede asignar automaticamente y derivar a revision humana los casos con confianza baja.
- Triage de devoluciones y envios: con criterios del tipo "returns: cambios y reembolsos" frente a "shipping: retrasos y paquetes perdidos", permite clasificar reclamaciones de comercio electronico sin depender de un LLM generativo.
- Moderacion de contenido por categorias: definicion de una pregunta tipada con las politicas aplicables como opciones y umbral de probabilidad para escalado automatico.
- Enrutado en pipelines RAG: decidir a que indice o coleccion documental enviar una consulta antes de recuperar contexto, reduciendo coste frente a un clasificador basado en generacion.
- Clasificacion de formularios y campos estructurados: asignar valores tipados a campos definidos por el usuario a partir de texto libre, con probabilidad asociada para validacion posterior.
- Inferencia local en navegador: la build WASM (`espetro.github.io/llama.cpp`) carga el fichero y permite tomar decisiones en el cliente sin enviar datos a un servidor, util para aplicaciones con requisitos de privacidad.
- Clasificacion en dispositivos con recursos limitados: al requerir aproximadamente 1 GB en vivo con q8_0, puede ejecutarse en portatiles, mini-PC o instancias pequenas donde un LLM generativo no cabria.
- Componente de decision en sistemas de agentes: usar la salida calibrada como paso de seleccion de herramienta o rama de ejecucion dentro de un flujo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor no incluye cifras de exactitud, calibracion (ECE), MMLU, HumanEval ni GSM8K, ni comparaciones numericas con otros modelos. Para un modelo de esta categoria los indicadores relevantes serian la exactitud en las preguntas tipadas y el error de calibracion, pero no hay datos publicados al respecto.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 1 GB en vivo con q8_0, segun la propia model card para la build WASM; el repositorio ocupa 0,8 GB con 752.917.824 parametros.
- Reparto por configuracion: al tratarse de un modelo de menos de mil millones de parametros, cabe sobradamente en GPU de consumo (RTX 3060, RTX 4060, RTX 4090 y similares) y tambien en CPU.
- Ejecucion en CPU: viable dado el tamano; el empaquetado q8_0 es el formato indicado por el autor.
- Ejecucion en navegador: soportada mediante la build WASM de llama.cpp; requiere aproximadamente 1 GB en vivo segun la model card.
- GPU de datacenter (A100, H100): no son necesarias; no se documenta ningun caso de uso que las requiera.
- Opciones de despliegue: `llama-server -hf espetro/kev-0.8b-gguf` con el fork `espetro/llama.cpp` (rama `kev`) para los endpoints `/v1/systemone` y `/studio`; CLI `llama-decide -hf espetro/kev-0.8b-gguf --json request.json`; llama.cpp estandar para carga como Qwen3.5 convencional.
- vLLM, TGI y Ollama: no se documentan en la informacion disponible; el formato GGUF y la dependencia de la cabeza pointer apuntan al ecosistema llama.cpp.
- Latencia y throughput: no disponibles. La model card no publica medidas de tokens por segundo ni de latencia por peticion; en un modelo de decision la metrica relevante seria el tiempo por consulta tipada, que tampoco se especifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| espetro/kev-0.8b-gguf | 752.917.824 | no disponible | GGUF (q8_0) | Apache-2.0 (pesos y cabeza) | Cabeza pointer y calibracion horneadas; endpoints propios con el fork de llama.cpp |
| jaredpalmer/kev-0.8b | no disponible | no disponible | no disponible | Apache-2.0 (indicada como origen en la model card) | Checkpoint de origen del que deriva el bundle gojev |
| taigrr/kev-0.8b-gguf | no disponible | no disponible | GGUF | 0BSD (bundle gojev) | Bundle de origen usado por el script de empaquetado |
| Qwen3.5-0.8B (backbone base) | no disponible | no disponible | no disponible | no disponible | Backbone sobre el que se anade la cabeza pointer; no se detallan especificaciones en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo generativo: no debe emplearse para generar texto, mantener conversaciones abiertas ni responder preguntas en lenguaje natural. La etiqueta `conversational` del repositorio no implica capacidad de dialogo.
- La cuantizacion q4 degrada la calibracion lo suficiente como para romperla segun el autor; solo q8_0 esta recomendada. Cualquier reempaquetado o cuantizacion adicional invalida las probabilidades.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de exactitud, calibracion ni robustez frente a distribuciones de entrada fuera del dominio de entrenamiento.
- La calidad de la decision depende enteramente de como el usuario formule las preguntas tipadas y los criterios; una definicion ambigua de las opciones degrada la utilidad de la salida.
- Soporte de idiomas no declarado. No hay confirmacion de que el modelo funcione correctamente en castellano ni en otros idiomas distintos del usado en su entrenamiento.
- Longitud de contexto no declarada, lo que impide planificar entradas largas (por ejemplo, historicos de incidencias extensos).
- Sin adopcion comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa y de casos de produccion documentados.
- Dependencia de un fork especifico: los endpoints `/v1/systemone` y `/studio` solo existen en `espetro/llama.cpp` (rama `kev`). En llama.cpp estandar el fichero carga como un Qwen3.5 sin la funcionalidad de decision.
- Licencias distribuidas: pesos y cabeza Apache-2.0, runtime MIT y bundle de origen 0BSD. Conviene verificar la trazabilidad completa antes de un uso comercial, en particular respecto del backbone Qwen3.5 subyacente.
- Riesgo de sesgo heredado del backbone y del dataset de entrenamiento de la cabeza, no documentado en la informacion disponible.
- Las fechas de creacion y actualizacion del repositorio (23 de septiembre de 2026) no son coherentes con una publicacion establecida; conviene confirmar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/espetro/kev-0.8b-gguf
- Runtime y herramientas de empaquetado: https://github.com/espetro/llama.cpp
- Demo en navegador (build WASM): https://espetro.github.io/llama.cpp/
- Checkpoint de origen: https://github.com/jaredpalmer/kev
- Bundle gojev de origen en HuggingFace: https://huggingface.co/taigrr/kev-0.8b-gguf
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card del autor.
