# LoganResearch/qwen15-moe-a2p7b-certified-hook-evidence

## Resumen

`LoganResearch/qwen15-moe-a2p7b-certified-hook-evidence` no es un modelo de lenguaje entrenado, sino un kit de reproduccion de evidencia publicado por LoganResearch. Contiene el protocolo de evaluacion congelado (`EVAL_PROTOCOL.md`), las predicciones selladas por item de un panel de test held-out de 617 elementos (`data/predictions_617.jsonl`) y un verificador de biblioteca estandar (`scripts/verify_eval.py`) que recalcula offline todas las cifras principales sin GPU, sin red y sin dependencias de terceros. El modelo base referenciado es `Qwen/Qwen1.5-MoE-A2.7B-Chat`, pero los pesos no se redistribuyen en este repositorio.

El objeto de la certificacion es una "cabeza" (head) de decision que opera sobre el modelo base y decide, para cada item, si responder o abstenerse (proceed/withhold). Segun la model card, en el panel congelado de 617 items la cabeza certificada alcanza una precision de decision del 79,42 % frente al mejor baseline constante del 54,29 %, lo que supone un lift estricto de +25,12 puntos, por encima del umbral preregistrado de +5,0 (PASS-STRICT). La relevancia de este artefacto es metodologica: documenta de forma verificable una medicion de fiabilidad, no una mejora de capacidades generativas.

Es importante subrayar que la model card declara explicitamente lo que no se reclama: ninguna propiedad de generacion abierta, honestidad o rechazo mas alla de la tarea puntuada; ninguna transferencia del resultado a otras familias, tamanos o distribuciones; y ninguna reejecutabilidad offline de la cabeza desde estos ficheros, ya que sus internals y su punto de decision permanecen en el servidor del servicio alojado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene evidencia de evaluacion, no pesos; el modelo base referenciado es un transformer MoE) |
| Parametros totales | no disponible (el modelo base Qwen1.5-MoE-A2.7B declara 14,3B totales en su propia ficha; este repositorio no los redistribuye) |
| Parametros activos | no disponible (el modelo base Qwen1.5-MoE-A2.7B declara 2,7B activos; este repositorio no los redistribuye) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (texto del kit y registros por item); los pesos del modelo base no se redistribuyen y se rigen por su propia licencia |
| Formato de pesos | no disponible (no se incluyen pesos; el repositorio contiene `EVAL_PROTOCOL.md`, `data/predictions_617.jsonl`, `scripts/verify_eval.py` y `SHA256SUMS`) |

## Arquitectura y entrenamiento

Este repositorio no documenta el entrenamiento de un modelo. Lo que describe es un protocolo de medicion congelado y un procedimiento de verificacion. El componente central es una cabeza de decision ("certified head") que, para cada item del panel, emite una decision binaria de proceder o abstenerse; esa cabeza se sirve en vivo mediante la API alojada y no se publica. El kit incluye las predicciones por item del panel TEST-617 sellado y un verificador que recomputa los recuentos principales: 490/617 decisiones de gate correctas, 282/617 respuestas base correctas y un lift estricto de +25,12 puntos, con comprobaciones de consistencia fila a fila que incluyen la pertenencia al split held-out congelado con semilla 42.

El panel se reconstruye a partir de una revision publica fijada de TruthfulQA (seccion 1 del protocolo), y su huella por item `(index, n_options, gold)` coincide con la evidencia publicada en `LoganResearch/qwen2.5-1.5b-instruct-distilled`. No se documentan en la informacion disponible datos sobre volumen de entrenamiento, composicion del dataset, tecnicas de alineamiento (RLHF/DPO) ni innovaciones de decodificacion. La re-medicion de la rama base de extremo a extremo corre a cargo de quien reproduce; los veredictos de la cabeza certificada son el registro sellado que se entrega.

## Capacidades

- Verificacion offline de resultados de evaluacion: el script `scripts/verify_eval.py` recalcula las cifras principales y devuelve exit 0 si y solo si `data/predictions_617.jsonl` reproduce los recuentos sellados.
- Comprobacion de integridad criptografica: `sha256sum -c SHA256SUMS` cubre todos los ficheros del repositorio excepto el propio fichero de sumas.
- Auditoria de pertenencia al split: el verificador comprueba la membresia de cada fila en el split held-out congelado con semilla 42.
- Reconstruccion del panel: el panel se puede reconstruir desde la revision publica fijada de TruthfulQA y validar contra la huella `(index, n_options, gold)` publicada.
- Decision de gate proceed/withhold: capacidad del componente certificado (servido en la API alojada, no publicado), medida en la tarea puntuada.
- No incluye: generacion de texto, razonamiento abierto, codigo, matematicas, vision, tool calling, function calling, soporte de agentes, capacidades multilingues ni modo thinking. Nada de esto se distribuye ni se reclama en este repositorio.

## Casos de uso

- Auditoria de una certificacion de fiabilidad: un equipo de evaluacion descarga el kit, ejecuta `python3 scripts/verify_eval.py` y confirma que los recuentos sellados (490/617 gate, 282/617 base, +25,12 puntos) se reproducen sin GPU ni red, lo que permite validar la evidencia sin depender de la infraestructura del autor.
- Revision por pares de un protocolo preregistrado: el fichero `EVAL_PROTOCOL.md` permite comprobar que los umbrales (lift ≥ +5,0; engagement ≥ 55 %) se fijaron antes de la ejecucion y que la decision PASS-STRICT se deriva de ellos.
- Integracion en pipelines de CI: el verificador de biblioteca estandar y el fichero `SHA256SUMS` se pueden incorporar como paso de CI para detectar manipulaciones o corrupcion de los registros por item.
- Comparacion de paneles entre certificaciones: la huella `(index, n_options, gold)` compartida con `LoganResearch/qwen2.5-1.5b-instruct-distilled` permite comprobar que dos kits miden sobre el mismo panel congelado antes de comparar cifras.
- Docencia y formacion en metodologia de evaluacion: el kit sirve como ejemplo concreto de separacion entre evidencia de medicion y release de modelo, con limites de claim explicitamente declarados.
- Due diligence de proveedores: un equipo que evalue contratar el servicio alojado puede usar el kit para verificar la parte publica del registro de certificacion antes de aceptar las cifras del proveedor.

## Benchmarks y rendimiento

Los unicos datos de rendimiento presentes en la informacion disponible son los del panel held-out TEST-617 (n=617, ejecucion sellada):

| Metrica | Valor |
|---|---|
| Precision de decision del gate certificado | 79,42 % |
| Mejor baseline constante | 54,29 % |
| Lift estricto | +25,12 puntos (umbral ≥ +5,0; PASS-STRICT) |
| Precision base (sin ayuda) | 45,71 % (282/617) |
| Items respondidos | 287/617 (46,52 %) |
| Precision entre respondidos | 77,00 % (umbral de engagement ≥ 55 %, cumplido) |
| Items retenidos (withheld) | 330/617 (53,48 %) |
| Decisiones de gate correctas | 490/617 |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) para este artefacto ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM para inferencia: no aplica al kit; el verificador no requiere GPU.
- GPU recomendadas: ninguna; el script de verificacion usa solo la biblioteca estandar de Python.
- Ejecucion en consumer: si, en cualquier maquina con Python 3 y acceso al sistema de ficheros; no se necesita hardware especializado.
- Opciones de despliegue del kit: ejecucion local del verificador (`python3 scripts/verify_eval.py`) y comprobacion de integridad con `sha256sum -c SHA256SUMS`.
- Despliegue del componente certificado: la cabeza se sirve en vivo mediante la API alojada del autor y no se publica; no hay opcion de despliegue local documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Modelo base | Licencia | Pesos incluidos | Resultado principal |
|---|---|---|---|---|---|
| `LoganResearch/qwen15-moe-a2p7b-certified-hook-evidence` | Kit de evidencia de certificacion | Qwen/Qwen1.5-MoE-A2.7B-Chat | apache-2.0 (kit) | No | Gate 79,42 % vs baseline 54,29 % (n=617) |
| `LoganResearch/qwen2.5-1.5b-instruct-distilled` | Kit de evidencia relacionado (referenciado en la model card) | no disponible en la informacion proporcionada | no disponible | No | Comparte huella de panel `(index, n_options, gold)` |
| Qwen/Qwen1.5-MoE-A2.7B-Chat | Modelo de lenguaje base | no aplica | propia del modelo base | Si (en su propio repositorio) | No disponible en la informacion proporcionada |

La comparacion con modelos de lenguaje de la misma categoria no es aplicable: este repositorio no es un modelo y no publica pesos ni capacidades generativas. La unica comparacion pertinente es con otros kits de evidencia del mismo autor, y solo se dispone de la referencia al kit de Qwen2.5-1.5B.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, no genera texto y no debe evaluarse como un LLM. Cualquier uso como modelo de lenguaje es un error de categoria.
- Alcance del claim: el resultado se limita a la tarea puntuada (decisiones proceed/withhold) sobre el panel congelado TEST-617; la model card excluye explicitamente cualquier propiedad de generacion abierta, honestidad o rechazo.
- Sin transferencia: no se reclama validez del resultado para otras familias de modelos, otros tamanos ni otras distribuciones de datos.
- No reejecutable offline: los internals y el punto de decision de la cabeza certificada permanecen en el servidor y no se publican; el kit es evidencia sobre la medicion, no un release del modelo.
- Reproduccion parcial: la re-medicion de la rama base de extremo a extremo requiere computo propio de quien reproduce; solo los veredictos de la cabeza son registro sellado.
- Riesgo de sobreinterpretacion: el lift de +25,12 puntos mide la ventaja de una politica de abtencion sobre un baseline constante, no una mejora de conocimiento del modelo base.
- Sesgos: no se documentan en la informacion disponible analisis de sesgo del panel ni de la cabeza de decision.
- Alucinacion: no aplica al kit; si aplica al modelo base referenciado, pero no se aportan datos al respecto en este repositorio.
- Licencia: el texto del kit y los registros por item son Apache-2.0; los pesos del modelo base no se redistribuyen y se rigen por la licencia de su pagina en el Hub, que debe consultarse por separado para uso comercial.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el 2026-11-27; no hay senales de adopcion ni de validacion independiente.
- Idiomas: no disponibles.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/LoganResearch/qwen15-moe-a2p7b-certified-hook-evidence
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-MoE-A2.7B-Chat
- Kit de evidencia relacionado: `LoganResearch/qwen2.5-1.5b-instruct-distilled` (referenciado en la model card; URL no proporcionada en la informacion disponible)
- Paper de TruthfulQA: arXiv:2109.07958 (https://arxiv.org/abs/2109.07958)
- Ficheros internos del kit: `EVAL_PROTOCOL.md`, `data/predictions_617.jsonl`, `scripts/verify_eval.py`, `SHA256SUMS` (dentro del repositorio de Hugging Face)
