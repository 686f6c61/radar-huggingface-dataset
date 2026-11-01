# pawanpaudel93/kev27b-int8-ov-decision

## Resumen

Kev-27B decision tree (OpenVINO int8, 2 stages) es un artefacto de despliegue publicado por pawanpaudel93 que empaqueta el fine-tune jaredpalmer/kev-27b (v2, Kev 1.0) sobre el IR int8 de Qwen3.8-27B de Intel, listo para servirse con el runtime Cascadia. No es un modelo nuevo ni un entrenamiento adicional: el repositorio redistribuye unicamente pesos convertidos y una cabeza de puntero (pointer head) calibrada con temperatura 1,32, de modo que el usuario puede exponer los endpoints `/v1/decisions` y `/v1/systemone` en formato OpenAI Decisions sin ejecutar el exportador por su cuenta.

El modelo subyacente, Kev-27B v2, es un fine-tune de pesos completos de Qwen3.8-27B (27 000 millones de parametros, familia Qwen3.5 text) con una cabeza de puntero sobre un conjunto de opciones. Es un modelo de decision, no de conversacion: su checkpoint carece de LM head, por lo que el arbol conserva la cabeza LM estandar de Intel y la salida de chat resulta irrelevante.

La relevancia practica esta en el formato: un arbol de 2 etapas (unos 28 GB) pensado para un pipeline de dos maquinas, ya que un unico host de 32 GB no puede ejecutar ambas etapas. El export es determinista (dos hosts que descargaron y exportaron por separado produjeron arboles identicos byte a byte, 17/17 ficheros por SHA-256) y se ha validado paridad frente a la referencia fp32 en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.8-27B) con cabeza de puntero sobre opciones; IR int8 de OpenVINO |
| Parametros totales | 27 000 millones (modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (IR de OpenVINO); sin otras variantes publicadas |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | IR de OpenVINO (int8) + `head.pt` (pointer head) bajo `decision/` |
| Tamano del repositorio | 28,2 GB |
| Etapas del arbol | 2 (rank 0 con API, rank 1 con la cabeza de puntero) |
| Runtime requerido | OpenVINO GenAI 2026.4.1, Cascadia commit a7d3d9a6 |
| Dispositivo medido | CPU (Intel Core Ultra 7 258V) |

## Arquitectura y entrenamiento

El arbol reutiliza el IR int8 de Intel del modelo Qwen3.8-27B (`OpenVINO/Qwen3.8-27B-int8-ov`) y sustituye todos sus pesos por los del fine-tune Kev-27B v2 (revision `af0e6d551bdc2cc724f3e9d7a8bee1cd4fb8f7bf`), anadiendo la cabeza de puntero calibrada a temperatura 1,32. El export se realizo con `tools/decision_export.py` de la rama `pawan/decisions-api` (commit `a7d3d9a6`) del repositorio labscommunity/cascadia, que incorpora soporte para checkpoints Kev de pesos completos. El proceso es determinista: dos hosts independientes generaron arboles identicos byte a byte (17/17 ficheros verificados por SHA-256).

No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento del fine-tune original, el numero de tokens, la composicion de datos ni si hubo RLHF o DPO. El repositorio no anade entrenamiento: solo redistribuye pesos convertidos. La innovacion tecnica destacable es el reparto en dos etapas (rank 0 y rank 1) para encajar un modelo de 27B en int8 en dos hosts de 32 GB, con la cabeza de puntero aislada en la etapa 1 y una API OpenAI Decisions en la etapa 0.

## Capacidades

- Decision sobre opciones mediante cabeza de puntero: produce eleccion, estado "noul" y puntuacion, expuestos en `/v1/decisions` y `/v1/systemone`.
- Formato OpenAI Decisions: integrable en pipelines que ya consumen esa interfaz.
- Ejecucion en CPU: validado en Intel Core Ultra 7 258V con OpenVINO GenAI 2026.4.1 y `--device CPU`.
- Paridad numerica con la referencia fp32: 82/82 PASS (eleccion 33/33, noul 24/24, score 25/25), max |Δp| 0,0180, sin flips.
- Consistencia entre endpoints: 62/62 identicos en estados de cadena.
- Aislamiento de estado: chat a temperatura 0 identico byte a byte antes y despues de una ejecucion de decision.
- No soporta generacion de texto util: el checkpoint no tiene LM head y la cabeza LM es la estandar de Intel; la salida de chat no es significativa.
- Tool calling, agentes multi-paso, vision, audio y modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Enrutamiento de decisiones en produccion: exponer `/v1/decisions` para clasificar solicitudes entre opciones predefinidas, aprovechando la cabeza de puntero y la calibracion de temperatura 1,32 para obtener probabilidades estables.
- Sustitucion de un clasificador basado en LLM generativo: al no requerir LM head, el coste por decision se reduce frente a un chat model del mismo tamano, con paridad verificada frente a fp32.
- Despliegue en infraestructura sin GPU: el arbol corre en CPU con OpenVINO, adecuado para entornos donde no hay aceleradores disponibles.
- Pipelines de dos maquinas: reparto rank 0 (API) y rank 1 (cabeza de puntero) en dos hosts de 32 GB, util cuando no se dispone de un unico nodo con memoria suficiente.
- Evaluacion reproducible de fine-tunes: el export determinista permite reconstruir el arbol y verificar integridad por SHA-256 en distintos hosts.
- Integracion con clientes compatibles OpenAI Decisions: cualquier cliente que consuma el formato `/v1/decisions` puede apuntar a la API en `127.0.0.1:8080` sin cambios.
- Pruebas de regresion de modelos de decision: comparar salidas frente a la referencia fp32 con `reference_stream.py` sobre el conjunto de 50 registros / 82 preguntas.

## Benchmarks y rendimiento

| Comprobacion | Resultado |
|---|---|
| Paridad vs fp32 (total) | 82/82 PASS |
| Paridad vs fp32 (eleccion) | 33/33 |
| Paridad vs fp32 (noul) | 24/24 |
| Paridad vs fp32 (score) | 25/25 |
| Max \|Δp\| | 0,0180 |
| Flips | 0 |
| `/v1/decisions` vs `/v1/systemone` | 62/62 identicos (estados de cadena) |
| Chat temperatura 0 antes/despues | identico byte a byte |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las mediciones se realizaron en dos hosts Intel Core Ultra 7 258V (32 GB), Windows 11, OpenVINO GenAI 2026.4.1, `--device CPU`, un rank por host, Cascadia en `a7d3d9a6`.

## Requisitos de hardware

- VRAM/espacio: arbol de aproximadamente 28 GB en disco; al ejecutarse en CPU no requiere VRAM de GPU.
- Memoria por host: dos hosts de 32 GB como minimo; un unico host de 32 GB no puede ejecutar ambas etapas.
- GPU recomendadas: no aplica; las mediciones son solo en CPU. No hay datos de rendimiento en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: no disponible (no se ha medido ni documentado).
- Despliegue: Cascadia con OpenVINO GenAI 2026.4.1, comando `cascadia worker` con `--engine qwen35 --device CPU --rank 0/1 --total 2`.
- Timeout de activacion: `CASCADIA_ACTIVATION_TIMEOUT_SECS=1800` en el ejemplo de arranque.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kev-27B decision tree (este) | 27B | no disponible | IR OpenVINO int8, 2 etapas | Apache-2.0 | Decision con cabeza de puntero |
| jaredpalmer/kev-27b | 27B | no disponible | Pesos completos (fine-tune) | Apache-2.0 | Decision, requiere export propio |
| OpenVINO/Qwen3.8-27B-int8-ov | 27B | no disponible | IR OpenVINO int8 | Apache-2.0 | Modelo base de chat/generacion |
| Qwen/Qwen3.8-27B | 27B | no disponible | safetensors | Apache-2.0 | Modelo base original |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de rendimiento cruzado entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: el checkpoint no tiene LM head y la salida conversacional no es significativa; usarlo como chatbot produce resultados sin sentido.
- Requiere dos hosts: un unico nodo de 32 GB no puede ejecutar las dos etapas del arbol.
- Solo medido en CPU: no hay validacion en GPU ni datos de latencia o throughput.
- Dependencia de versiones: exige OpenVINO GenAI 2026.4.1 y Cascadia en el commit `a7d3d9a6`; otras versiones pueden romper la paridad.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingue.
- Longitud de contexto: no disponible.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un modelo de decision, el riesgo se traslada a elecciones erroneas entre opciones, no a texto inventado.
- Sesgos: no documentados.
- Licencia: Apache-2.0 permite uso comercial, pero el repositorio solo redistribuye pesos convertidos y no anade entrenamiento; conviene revisar las licencias de los tres upstream (Kev, OpenVINO y Qwen), todas Apache-2.0 segun la model card.
- Repositorio con 18 descargas y 0 likes: sin validacion comunitaria amplia; tratar como artefacto experimental.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/pawanpaudel93/kev27b-int8-ov-decision
- Fine-tune original: https://huggingface.co/jaredpalmer/kev-27b
- Base int8 de Intel: https://huggingface.co/OpenVINO/Qwen3.8-27B-int8-ov
- Modelo Qwen original: https://huggingface.co/Qwen
- Runtime Cascadia: https://github.com/labscommunity/cascadia
- Documentacion de la API de decisiones: `docs/decisions.md` en el repositorio de Cascadia
