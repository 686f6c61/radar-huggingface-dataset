# LoganResearch/hermes3chat-certified-hook-evidence

## Resumen

`LoganResearch/hermes3chat-certified-hook-evidence` no es un modelo de lenguaje en el sentido habitual, sino un kit de reproduccion de evidencia publicado por LoganResearch para respaldar la certificacion de `NousResearch/Hermes-3-Llama-3.1-8B` como familia de modelos certificada dentro de su servicio alojado (slug interno `hermes3chat`). El repositorio empaqueta el protocolo de evaluacion congelado y saneado (`EVAL_PROTOCOL.md`), las predicciones por item selladas del panel de retencion TEST-617 (`data/predictions_617.jsonl`) y un verificador de biblioteca estandar (`scripts/verify_eval.py`) que recalcula todas las cifras principales en local, sin GPU, sin red y sin dependencias de terceros.

El resultado medido sobre el panel de retencion (n=617, ejecucion sellada) es una precision de decision de la puerta de certificacion del 77,80 % frente al mejor baseline constante del 58,51 %, lo que supone un incremento estricto de +19,29 puntos sobre un umbral preregistrado de +5,0 (PASS-STRICT). Como cifras de soporte: precision base sin ayuda 58,51 % (361/617), items respondidos 330/617 (53,48 %), precision entre respondidos 83,94 % (umbral de compromiso del 55 %, cumplido) e items retenidos 287/617 (46,52 %).

La relevancia de este artefacto es metodologica: documenta de forma auditable como se valido una "cabeza certificada" que decide por item si procede responder o abstenerse en una tarea de opcion multiple sobre TruthfulQA MC1 (arXiv:2109.07958). Conviene subrayar que el modelo base Hermes-3-Llama-3.1-8B (arquitectura Llama 3.1, 8B parametros, contexto de 131.072 tokens) solo aparece como referencia; sus pesos no se redistribuyen en este repositorio y la cabeza certificada no se publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el repositorio contiene un kit de evidencia; no incluye pesos de modelo) |
| Parametros totales | No disponible (el modelo base referenciado, Hermes-3-Llama-3.1-8B, tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el kit; el modelo base Hermes-3-Llama-3.1-8B soporta 131.072 tokens |
| Tipos de cuantizacion | No disponible (no se distribuyen pesos) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 (texto del kit y registros por item; los pesos del modelo base se rigen por su propia licencia) |
| Formato de pesos | No aplica: JSONL de predicciones (`data/predictions_617.jsonl`), Markdown de protocolo (`EVAL_PROTOCOL.md`), script Python (`scripts/verify_eval.py`) y `SHA256SUMS` |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo base ni de la cabeza certificada; la model card indica explicitamente que los internos y el punto de decision de la cabeza son el componente certificado del servicio y permanecen en el lado del servidor. El modelo base referenciado es `NousResearch/Hermes-3-Llama-3.1-8B`, un transformer de la familia Llama 3.1 con 8.000 millones de parametros, pero este kit no aporta detalles adicionales sobre su entrenamiento ni sobre posibles fases de RLHF o DPO.

Lo que si documenta es el proceso de medicion: un protocolo congelado y saneado, un panel de retencion TEST-617 derivado de una revision publica fijada de TruthfulQA (seccion 1 del protocolo), un split de retencion congelado con semilla 42 y una huella por item `(index, n_options, gold)` que coincide con la evidencia publicada en `LoganResearch/qwen2.5-1.5b-instruct-distilled`. La innovacion tecnica destacable no es de modelado sino de verificabilidad: el verificador recalcula las cifras principales (480/617 decisiones de puerta correctas, 361/617 respuestas base correctas, lift estricto de +19,29 puntos) con comprobaciones de consistencia fila a fila y comprobacion de integridad mediante `sha256sum -c SHA256SUMS`.

## Capacidades

- Reproduccion offline de las cifras principales del certificado mediante `python3 scripts/verify_eval.py`, con codigo de salida 0 si y solo si el JSONL reproduce los recuentos sellados.
- Verificacion de integridad criptografica de todos los ficheros del repositorio (excepto el propio `SHA256SUMS`) mediante SHA-256.
- Auditoria de la pertenencia de cada fila al split de retencion congelado con semilla 42 y de las comprobaciones de consistencia por fila.
- Reconstruccion del panel a partir de la revision publica fijada de TruthfulQA, con huella por item `(index, n_options, gold)` contrastable contra otra evidencia publicada.
- Decision de puerta por item (proceder o abstenerse) en la tarea evaluada, servida en vivo a traves de la API alojada; no es reproducible offline desde estos ficheros.
- No incluye generacion de texto abierta, codigo, matematicas, vision, audio, tool calling ni capacidades de agente; el kit no las cubre ni las reclama.

## Casos de uso

- Auditoria de certificacion interna: un equipo de calidad descarga el kit y ejecuta `scripts/verify_eval.py` para confirmar de forma independiente que las cifras publicadas (77,80 % de precision de puerta, +19,29 puntos de lift) se derivan del JSONL sellado, sin necesidad de GPU ni de acceso a red.
- Revision por terceros o revisores externos: el protocolo congelado y el panel preregistrado permiten evaluar si los umbrales (barra de lift ≥ +5,0, barra de compromiso ≥ 55 %) se fijaron antes de la medicion, lo que sostiene la validez del PASS-STRICT.
- Integracion en pipelines de CI: el verificador puede incorporarse como paso de validacion en un pipeline que compruebe, en cada release, que los artefactos de evidencia siguen reproduciendo los recuentos sellados y que los hashes coinciden.
- Trazabilidad de linaje de datos: la huella por item `(index, n_options, gold)` permite contrastar que el panel TEST-617 corresponde a la revision publica fijada de TruthfulQA y que es consistente con la evidencia de otro repositorio de la misma organizacion.
- Referencia metodologica para evaluaciones con abtencion: sirve como plantilla para disenar paneles congelados con decision de responder o abstenerse y baselines constantes, util en equipos que evaluan calibracion y honestidad acotada a una tarea.
- Documentacion de cumplimiento: el kit aporta un registro sellado y verificable que puede adjuntarse a expedientes internos de certificacion de modelos, con separacion explicita entre lo reclamado y lo no reclamado.

## Benchmarks y rendimiento

| Metrica (panel TEST-617, n=617, ejecucion sellada) | Valor |
|---|---|
| Precision de decision de la puerta certificada | 77,80 % |
| Mejor baseline constante | 58,51 % |
| Lift estricto sobre el baseline | +19,29 puntos (umbral preregistrado ≥ +5,0; PASS-STRICT) |
| Precision base sin ayuda | 58,51 % (361/617) |
| Items respondidos | 330/617 (53,48 %) |
| Precision entre items respondidos | 83,94 % (umbral de compromiso ≥ 55 %, cumplido) |
| Items retenidos | 287/617 (46,52 %) |
| Decisiones de puerta correctas | 480/617 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras suites estandar para este artefacto.

## Requisitos de hardware

- VRAM para inferencia: no aplica al kit; la verificacion se ejecuta con la biblioteca estandar de Python y no requiere GPU ni red.
- GPU recomendadas: ninguna para el verificador; el modelo base Hermes-3-Llama-3.1-8B, si se quisiera re-medir la rama base de extremo a extremo, requeriria hardware de inferencia de 8B (la model card indica que ese recalculo corre por cuenta de quien lo haga).
- Cabe en GPU de consumo: el verificador si (entorno de CPU); el modelo base de 8B si, en GPU de consumo con cuantizacion adecuada, aunque este kit no distribuye pesos ni recetas de cuantizacion.
- Opciones de despliegue: `python3 scripts/verify_eval.py` y `sha256sum -c SHA256SUMS`; no se documentan opciones de servicio tipo vLLM, llama.cpp, Ollama o TGI para este repositorio.
- Latencia y throughput: no disponibles; el coste del verificador es el de un recorrido de 617 registros JSONL con comprobaciones de consistencia, sin datos de tiempo publicados.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `LoganResearch/hermes3chat-certified-hook-evidence` | Kit de evidencia de certificacion | No disponible (base 8B) | No disponible | 77,80 % de precision de puerta; +19,29 pts de lift sobre baseline en TEST-617 | Apache-2.0 | Publico en Hugging Face; cabeza certificada solo via API alojada |
| `LoganResearch/qwen2.5-1.5b-instruct-distilled` | Evidencia de evaluacion relacionada | No disponible (base 1,5B) | No disponible | No disponible en la informacion proporcionada | No disponible | Publico en Hugging Face; usado como referencia de huella del panel |
| `NousResearch/Hermes-3-Llama-3.1-8B` | Modelo de lenguaje | 8B | 131.072 tokens | No disponible en la informacion proporcionada | Licencia propia del modelo base (consultar su hub) | Publico en Hugging Face |

No se dispone de datos comparativos de rendimiento entre estos artefactos mas alla de la coincidencia de huella del panel; no se han publicado cifras equivalentes para los otros dos.

## Limitaciones y advertencias

- El repositorio no es una release de modelo: no contiene pesos, no permite ejecutar inferencia y no debe tratarse como sustituto de Hermes-3-Llama-3.1-8B.
- La cabeza certificada no se publica; sus internos y su punto de decision permanecen en el servidor, por lo que el resultado no es re-ejecutable offline desde estos ficheros.
- El alcance de lo reclamado se limita a la tarea puntuada sobre el panel congelado: no se reclama ninguna propiedad de generacion abierta, honestidad o rechazo mas alla de esa tarea.
- No se reclama transferencia del resultado a otras familias de modelos, otros tamanos ni otras distribuciones de datos.
- La re-medicion de la rama base de extremo a extremo no esta incluida y corre por cuenta de quien la realice; el kit solo sella los veredictos de la cabeza.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion disponible para este artefacto.
- Idiomas soportados: no disponibles; la tarea evaluada es de opcion multiple sobre TruthfulQA MC1 y no caracteriza cobertura linguistica.
- Licencia: el texto del kit y los registros por item son Apache-2.0, pero los pesos del modelo base se rigen por su propia licencia, que debe consultarse antes de cualquier uso comercial.
- Los registros por item incorporan letras de respuesta correcta derivables del dataset publico TruthfulQA MC1 (arXiv:2109.07958), lo que conviene tener en cuenta al redistribuir el JSONL.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta y no declara pipeline; su madurez y mantenimiento no estan avalados por un historial de uso.

## Enlaces

- Repositorio del kit: https://huggingface.co/LoganResearch/hermes3chat-certified-hook-evidence
- Modelo base: https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B
- Evidencia relacionada citada: https://huggingface.co/LoganResearch/qwen2.5-1.5b-instruct-distilled
- Paper de TruthfulQA MC1: https://arxiv.org/abs/2109.07958
- Protocolo de evaluacion incluido en el repositorio: `EVAL_PROTOCOL.md`
- Predicciones selladas: `data/predictions_617.jsonl`
- Verificador: `scripts/verify_eval.py`
- Sumas de verificacion: `SHA256SUMS`
