# debjyotikm/siliconshield-rtl-contract-2

## Resumen

SiliconShield-RTL Contract-2 es un modelo especializado en la verificacion de seguridad de codigo RTL (Verilog y SystemVerilog), desarrollado por el usuario debjyotikm. Se trata de un ajuste fino del checkpoint en ingles de LAYA (convaiinnovations/laya) que actua como clasificador de decision: recibe un fragmento de RTL junto con un requisito de seguridad y devuelve un veredicto de tres vias (`satisfies_requirement`, `violates_requirement`, `insufficient_context`) acompanado de las tres puntuaciones de probabilidad.

El modelo cubre especificamente comportamiento temporal: ocupacion de FIFO, backpressure, saturacion, handshakes de commit/hold y de grant en arbitros, asi como la deteccion de contexto de implementacion ausente. Esta disenado para emparejarse con Contract-1, que cubre guardas locales, escrituras de registro y control de acceso; ninguno de los dos cubre por si solo todas las areas de RTL, y el enrutador SiliconShield consulta cada uno en su ambito cualificado.

Con 436 millones de parametros y un contexto maximo de 1536 tokens, es un checkpoint de investigacion pequeno, orientado a inferencia local y a la evaluacion automatizada de requisitos de seguridad sobre fragmentos acotados de RTL. Su relevancia radica en la escasez de modelos abiertos especializados en seguridad de hardware y en que publica resultados de benchmark reproducibles por area, aunque el propio autor advierte de que no supero el umbral de promocion congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder con adaptadores residuales y cabeza de decision (fine-tune de LAYA) |
| Parametros totales | 436.031.238 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1536 tokens (max_len de inferencia); head_max_len de 256 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (checkpoint base en ingles) |
| Licencia | Apache-2.0 (los pesos de LAYA conservan sus terminos upstream) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint en ingles de LAYA y se ajusta mediante la tarea de seguridad de SiliconShield: adaptadores residuales mas una cabeza de decision sobre un encoder congelado. La salida no es texto generativo sino una distribucion de probabilidad sobre tres clases por cada requisito evaluado, lo que lo convierte en un modelo de clasificacion de decision mas que en un generador.

El entrenamiento se realizo sobre contrastes de FIFO, contador y arbitraje verificados por solver, con objetivos de tripleta (triplet-aware) y de preservacion de replay. Este checkpoint corresponde al paso 70 del sprint F2 triplet (pesos `f916444f…`), seleccionado por el propietario por su recuperacion de satisfies/context a coste minimo de violaciones. El contrato de pregunta es `siliconshield-requirement-context-v1`, con longitud maxima de 1536. No se dispone de datos sobre numero de tokens de entrenamiento ni composicion exacta del dataset.

## Capacidades

- Clasificacion de requisitos de seguridad sobre fragmentos de RTL en tres clases con puntuaciones de probabilidad.
- Evaluacion de comportamiento de FIFO: ocupacion, backpressure y saturacion.
- Evaluacion de contadores: commit/hold y condiciones de saturacion.
- Evaluacion de arbitros: handshakes de grant y arboles de arbitraje (con fiabilidad limitada).
- Deteccion de contexto de implementacion ausente (juicio de `insufficient_context`).
- Inferencia local por lotes (`predict_batch`) con ordenacion por longitud y control de `max_len`.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.
- Capacidades multilingues: no disponibles; el checkpoint base es en ingles.

## Casos de uso

- Revision automatizada de bloques FIFO en pipelines de CI de hardware: el modelo clasifica cada requisito de seguridad contra el fragmento RTL y marca `violates_requirement` o `insufficient_context`, permitiendo bloquear fusiones que introduzcan backpressure o saturacion no deseada. Es adecuado por su alta cobertura en el area fifo (97/108 en el benchmark).
- Triaje de contadores en revisiones de diseno: dado un contador y un requisito de commit/hold, el modelo devuelve el veredicto con probabilidades, util como primer filtro antes de simulacion formal. Su rendimiento en counter (92/108) lo hace viable como pre-filtro.
- Deteccion de requisitos sin contexto suficiente: con 78/78 aciertos en juicio de contexto ausente en el conjunto in-domain, sirve para enrutar automaticamente a revision humana aquellos requisitos que no pueden evaluarse con el fragmento proporcionado.
- Enrutamiento en una arquitectura multi-modelo: combinado con Contract-1 y el enrutador SiliconShield, permite dirigir cada requisito al especialista cualificado (temporal vs. guardas/control de acceso) y reportar el resto como evidencia insuficiente.
- Auditoria de arbitros en sistemas con multiples maestros: evaluacion de handshakes de grant sobre fragmentos acotados, con la advertencia de que las familias arbiter-tree son poco fiables y requieren confirmacion por simulacion.
- Generacion de conjuntos de evaluacion etiquetados: el modelo puede usarse para pre-etiquetar pares RTL-requisito en la construccion de datasets de seguridad de hardware, con revision posterior de las predicciones de violacion.
- Investigacion en verificacion asistida por IA: como checkpoint de referencia reproducible (benchmark publico de 5589 filas y 11 areas) para comparar estrategias de adaptacion sobre LAYA en dominios de hardware.

## Benchmarks y rendimiento

Resultados sobre el SiliconShield RTL benchmark publico (5589 filas, 11 areas), con el prompt fijado y evidencia de desarrollo (los conjuntos sealed de calificacion y test no se abrieron):

| Area | Contract-2 | Contract-1 |
|---|---|---|
| fifo | 97/108 | 36/108 |
| counter | 92/108 | 41/108 |
| arbitration | 14/18 | 14/18 |
| interrupt-wake | 145/234 | 158/234 |
| input-filter | 94/162 | 91/162 |
| ot-access-control | 77/108 | 108/108 |
| local-safety-cwe | 933/2610 | 2601/2610 |
| transfer-pairs | 275/621 | 606/621 |
| write-paths | 244/432 | 179/432 |
| guard-semantics | 268/432 | 171/432 |
| requirement-clarity | 271/756 | 346/756 |

Total: 2510/5589. En dominio (fifo/counter/arbitration): 203/234, con 78/78 en juicio de contexto ausente y 51/78 tripletas completas; 8 de 20 mecanismos perfectos. La recall de violacion en dominio es 61/78, con 17 falsos seguros.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB en fp16 para los 436 M de parametros; el repo ocupa 1,7 GB, por lo que en fp32 se situaria en torno a 1,8 GB mas overhead.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM es suficiente; no requiere A100 ni H100.
- Cabe en GPU consumer: si, incluidas GTX 1650, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: la libreria `laya` (carga via `laya.agent.load` y `predict_batch`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; el autor solo indica `batch_size=16` y `max_len=1536` en el ejemplo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SiliconShield-RTL Contract-2 | 436 M | 1536 | Clasificacion de requisitos RTL (temporal: FIFO, contador, arbitraje) | Apache-2.0 | Hugging Face |
| SiliconShield-RTL Contract-1 | no disponible | no disponible | Clasificacion de requisitos RTL (guardas, escrituras, control de acceso) | no disponible | Hugging Face |
| LAYA (convaiinnovations/laya) | no disponible | no disponible | Modelo base en ingles del que deriva | no disponible | Hugging Face |

No se dispone de informacion sobre otros modelos abiertos comparables especializados en seguridad de RTL en la documentacion proporcionada.

## Limitaciones y advertencias

- Especialista estrecho: seguridad local, comportamiento de transferencia, bugs de control de acceso, rutas de escritura y razonamiento de politicas en lenguaje natural estan en o cerca del azar; deben enrutarse a Contract-1.
- Pierde aproximadamente una de cada cinco violaciones en dominio (17 falsos seguros en el conjunto enfocado). Las familias commit-hold, arbiter-tree, empty-data-blanking y stored-word-hold son poco fiables.
- Checkpoint de investigacion seleccionado por el propietario: no supero el umbral de promocion congelado (gates de recall de violacion, falso seguro y NLL); el selector del entrenador conservo el padre.
- Alcance de fragmento pequeno: evalua regiones RTL acotadas contra un requisito cada vez. No razona sobre IP completa, nivel SoC, FSM, dominios de reloj, protocolos de bus, criptografia ni interfaces de firmware.
- Un veredicto no es una prueba: los hallazgos deben confirmarse por simulacion o verificacion formal antes de actuar sobre ellos.
- Riesgo de alucinacion: al ser un clasificador, el riesgo se manifiesta como falsos seguros y falsas violaciones, no como texto inventado.
- Licencia Apache-2.0 para el checkpoint, pero los pesos fundacionales de LAYA conservan sus terminos upstream; conviene revisar la revision fijada en el repositorio de SiliconShield antes de uso comercial.
- Idiomas: el checkpoint base es en ingles; no hay informacion sobre soporte de otros idiomas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/debjyotikm/siliconshield-rtl-contract-2
- Contract-1: https://huggingface.co/danieltombay/siliconshield-rtl-contract-1
- Dataset de benchmark: https://huggingface.co/datasets/danieltombay/siliconshield-rtl-benchmark
- Modelo base LAYA: https://huggingface.co/convaiinnovations/laya
- Resultados detallados: `benchmark-results.json` en el repositorio del modelo
- Repositorio SiliconShield (reproducibilidad): referenciado en la model card, sin URL explicita en la informacion disponible
