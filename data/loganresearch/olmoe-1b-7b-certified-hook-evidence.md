# LoganResearch/olmoe-1b-7b-certified-hook-evidence

## Resumen

`LoganResearch/olmoe-1b-7b-certified-hook-evidence` no es un modelo de lenguaje en sentido estricto, sino un kit de reproducción de evidencia de certificación publicado por LoganResearch. El repositorio contiene un protocolo de evaluación congelado (`EVAL_PROTOCOL.md`), las predicciones selladas por ítem de un panel de test held-out de 617 preguntas (`data/predictions_617.jsonl`) y un verificador de librería estándar (`scripts/verify_eval.py`) que recalcula offline todas las cifras principales sin GPU, sin red y sin dependencias de terceros.

El objeto certificado es un cabezal de decisión (gate) que determina, para cada ítem de TruthfulQA MC1, si el sistema debe responder o abstenerse. Sobre el panel congelado de 617 ítems, el cabezal alcanza una precisión de decisión de gate del 79,42 % frente al 66,29 % del mejor baseline constante, lo que supone un lift estricto de +13,13 puntos (barra preregistrada ≥ +5,0, resultado PASS-STRICT). El modelo base declarado es `allenai/OLMoE-1B-7B-0125-Instruct`, un MoE de AllenAI, pero sus pesos no se redistribuyen en este repositorio.

La relevancia del artefacto es metodológica: ejemplifica un patrón de publicación de evidencia reproducible para evaluaciones de veracidad con abstención selectiva, incluyendo sumas SHA256 de todos los ficheros y un verificador que devuelve exit 0 solo si las cuentas selladas se reproducen (490/617 decisiones de gate correctas, 208/617 respuestas base correctas). No debe confundirse con una release de pesos ni con un modelo afinado listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el artefacto es un kit de evidencia; el modelo base declarado es un MoE transformer) |
| Parametros totales | no disponible (el modelo base OLMoE-1B-7B tiene 6,9B totales, dato no incluido en la informacion proporcionada) |
| Parametros activos | no disponible (el modelo base activa aproximadamente 1,3B, dato no incluido en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se redistribuyen pesos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (texto del kit y registros por ítem); los pesos del modelo base se rigen por su propia licencia en el hub de AllenAI |
| Formato de pesos | no aplica: no se redistribuyen pesos; el repositorio contiene JSONL, Markdown, scripts Python y SHA256SUMS |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del cabezal certificado: sus componentes y su punto de decisión permanecen en el lado servidor como parte del servicio certificado, y el autor declara explícitamente que el cabezal no es reproducible offline a partir de estos ficheros. Lo que sí se publica es el protocolo de medición congelado, el panel de evaluación sellado y las predicciones por ítem, junto con un verificador que comprueba la consistencia fila a fila, incluida la pertenencia al split held-out congelado con semilla 42.

El panel se reconstruye a partir de una revisión pública fijada de TruthfulQA (arXiv:2109.07958), y su huella por ítem `(index, n_options, gold)` coincide con la evidencia publicada en `LoganResearch/qwen2.5-1.5b-instruct-distilled`. No se documentan en la información disponible datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF o DPO para el cabezal; el modelo base declarado es `allenai/OLMoE-1B-7B-0125-Instruct`, pero el kit no incluye detalles de su entrenamiento.

## Capacidades

- Decisión de gate (proceed/withhold) sobre ítems de TruthfulQA MC1: el sistema decide si responder o abstenerse antes de emitir respuesta.
- Respuesta de opción múltiple con abstención selectiva: sobre el panel sellado responde 195/617 ítems (31,60 %) y acierta el 70,77 % de los respondidos (208 respuestas base correctas en total).
- Verificación offline reproducible: `scripts/verify_eval.py` recalcula las cifras principales con la librería estándar de Python, sin GPU ni red.
- Comprobación de integridad criptográfica: `sha256sum -c SHA256SUMS` cubre todos los ficheros del repositorio excepto el propio fichero de sumas.
- Reconstrucción del panel desde la revisión pública fijada de TruthfulQA.
- No se declaran capacidades de generación abierta, tool calling, agentes, visión, audio ni multilingüismo; el autor excluye explícitamente cualquier propiedad de honestidad o rechazo más allá de la tarea puntuada.

## Casos de uso

- Auditoría de evaluaciones de veracidad: un equipo de evaluación puede descargar el kit y ejecutar `verify_eval.py` para comprobar que las cifras publicadas (490/617 decisiones correctas, 208/617 respuestas base correctas, lift +13,13) se reproducen exactamente a partir de las predicciones selladas, sin necesidad de GPU.
- Revisión por pares de resultados con abstención selectiva: el protocolo congelado y la barra preregistrada (≥ +5,0 puntos sobre el mejor baseline constante) permiten a un revisor evaluar si la metodología cumple los criterios antes de aceptar la afirmación.
- Integración en pipelines de CI de investigación: el verificador devuelve exit 0 solo si las cuentas coinciden y todas las comprobaciones de consistencia por fila pasan, por lo que puede encadenarse en un job de integración continua que valide releases de evidencia.
- Control de integridad de artefactos científicos: `SHA256SUMS` permite detectar manipulación o corrupción de los ficheros del kit en espejos y réplicas.
- Reutilización del panel como referencia: la huella `(index, n_options, gold)` del panel de 617 ítems sirve para alinear evaluaciones de otros modelos contra el mismo conjunto congelado, como ya se hizo en el repositorio de destilación de Qwen2.5-1.5B citado.
- Estudio de estrategias de abstención: las tasas publicadas (31,60 % de ítems respondidos, 68,40 % retenidos) permiten analizar el compromiso entre cobertura y precisión en tareas de QA factual con opción múltiple.

## Benchmarks y rendimiento

| Metrica (panel held-out, n=617, run sellado) | Resultado |
|---|---|
| Precision de decision de gate (certificado) | 79,42 % |
| Mejor baseline constante | 66,29 % |
| Lift estricto sobre baseline | +13,13 puntos (barra ≥ +5,0; PASS-STRICT) |
| Decisiones de gate correctas | 490/617 |
| Precision base sin ayuda | 33,71 % (208/617) |
| Items respondidos | 195/617 (31,60 %) |
| Precision entre respondidos | 70,77 % (barra de engagement ≥ 55 %, cumplida) |
| Items retenidos | 422/617 (68,40 %) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Verificación del kit: no requiere GPU; `scripts/verify_eval.py` funciona con la librería estándar de Python, sin red y sin paquetes de terceros.
- Inferencia del cabezal certificado: no disponible offline; el cabezal se sirve en vivo mediante la API alojada del autor y sus componentes no se publican.
- Re-medición del brazo base: el autor indica que recalcular el brazo base de extremo a extremo corre a cargo del usuario; los requisitos de hardware dependen del modelo base elegido y no se especifican en la información disponible.
- Despliegue con vLLM, llama.cpp, Ollama o TGI: no aplica a este repositorio, que no redistribuye pesos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Modelo base | Panel de evaluación | Resultado publicado | Licencia |
|---|---|---|---|---|---|
| LoganResearch/olmoe-1b-7b-certified-hook-evidence | Kit de evidencia de certificación | allenai/OLMoE-1B-7B-0125-Instruct | TruthfulQA MC1, 617 ítems | Gate 79,42 %; lift +13,13 pts | Apache-2.0 |
| LoganResearch/qwen2.5-1.5b-instruct-distilled | Evidencia de certificación (referenciada) | Qwen2.5-1.5B-Instruct | TruthfulQA MC1, misma huella de panel | no disponible en la informacion proporcionada | no disponible |
| allenai/OLMoE-1B-7B-0125-Instruct | Modelo MoE instructivo | — | — | no disponible en la informacion proporcionada | según hub de AllenAI |

No se dispone de datos de benchmarks del modelo base ni de otros kits comparables en la información proporcionada, por lo que no es posible una comparación de rendimiento entre artefactos.

## Limitaciones y advertencias

- El repositorio no es una release de modelo: los pesos no se redistribuyen y el cabezal certificado no es reproducible offline desde estos ficheros.
- El alcance de la afirmación se limita a la tarea puntuada (TruthfulQA MC1 sobre el panel congelado de 617 ítems); el autor excluye explícitamente cualquier propiedad de honestidad, rechazo o generación abierta.
- No se reclama transferibilidad del resultado a otras familias de modelos, tamaños o distribuciones de datos.
- Las tasas de abstención son elevadas: el sistema retiene el 68,40 % de los ítems, lo que limita su utilidad como respondedor directo en producción.
- Riesgo de alucinación y sesgos: no documentados en la información disponible para este artefacto; la tarea evaluada es de opción múltiple con abstención, no de generación libre.
- Idiomas soportados: no disponibles.
- Uso comercial: el texto del kit y los registros por ítem son Apache-2.0, pero cualquier uso del modelo base queda sujeto a la licencia de `allenai/OLMoE-1B-7B-0125-Instruct` en su página del hub.
- Los registros por ítem incorporan letras gold derivables del dataset público TruthfulQA MC1, lo que conviene tener en cuenta al redistribuir el kit.

## Enlaces

- Repositorio del kit: https://huggingface.co/LoganResearch/olmoe-1b-7b-certified-hook-evidence
- Modelo base: https://huggingface.co/allenai/OLMoE-1B-7B-0125-Instruct
- Evidencia de referencia con huella de panel coincidente: https://huggingface.co/LoganResearch/qwen2.5-1.5b-instruct-distilled
- Paper de TruthfulQA: https://arxiv.org/abs/2109.07958
