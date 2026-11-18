# latentport/LPCombine-Qwen3.5-4B

## Resumen

LPCombine-Qwen3.5-4B es un artefacto de investigación publicado por Simon P. Villani bajo el paraguas del proyecto LatentPort. No es un modelo de lenguaje completo entrenado desde cero, sino un *readout* o cabezal entrenado que se acopla al modelo base Qwen/Qwen3.5-4B para permitir la combinación de dos estados de caché KV independientes en uno solo. El problema que aborda es la fusión de contextos precalculados (prefill) sin necesidad de reprocesar el texto completo, lo que en escenarios de agentes, RAG o sesiones largas puede ahorrar cómputo de prefill.

El repositorio contiene únicamente los pesos del readout (5.245.440 parámetros en safetensors, en FP32), no los pesos del modelo base. Para utilizarlo es necesario descargar Qwen/Qwen3.5-4B por separado y emplear la librería `latentport` (versión 0.4.9 o superior). La licencia declarada es Apache-2.0, aunque los pesos del modelo base quedan sujetos a sus propios términos.

Su relevancia es acotada pero específica: propone una técnica de combinación de estados de caché con verificación de tokens recuperados, validada empíricamente solo a nivel de coincidencia de siguiente token greedy y con una muestra muy reducida de tareas (HumanEval y GSM8K). Es una pieza de infraestructura para experimentación con cachés KV, no un modelo listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Readout denso sobre caché KV del primer bloque de atención completa de Qwen3.5-4B (state-combination) |
| Parámetros totales | 5.245.440 (readout); modelo base Qwen3.5-4B aparte |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-4B) |
| Tipos de cuantización | BF16, NF4, GGUF (soporte declarado por el runtime LatentPort) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (pesos base sujetos a sus términos) |
| Formato de pesos | safetensors (readout en FP32); GGUF solo vía runtime nativo con `model_path` local |

## Arquitectura y entrenamiento

El componente entrenado es un readout denso en FP32 que propone tokens a partir de las claves y valores de la primera capa de atención completa del modelo base. El mecanismo `combine` concatena el contexto derecho a la caché izquierda en ese orden y verifica los tokens recuperados contra la caché temprana antes de actualizar la sesión. El readout se ajustó sobre 18.432 tokens sintéticos con el modelo base congelado en NF4; no se documenta composición del dataset más allá de esa cifra ni uso de RLHF/DPO (no aplica a un readout de este tipo).

La innovación técnica es la combinación de estados resumibles (*resumable state*) con verificación de candidatos y la posibilidad de decodificación *cache-only* en backends compatibles. El runtime exige que ambos estados de entrada compartan el mismo modelo, pesos, tokenizador, backend y política de posiciones. La operación replica el contexto derecho, lo que implica que el ahorro real de cómputo depende del escenario.

## Capacidades

- Combinación de dos contextos precalculados en un único estado reanudable.
- Verificación de tokens recuperados contra la caché temprana antes de instalar el resultado en la sesión.
- Decodificación *cache-only* en backends BF16 y NF4 (en GGUF no está disponible).
- Replay de tokens retenidos mediante `model.live(retain_replay=True)`.
- Guardado y carga de snapshots de estado.
- Interfaz CLI `latentport combine LEFT RIGHT OUTPUT` para estados guardados.
- No incorpora capacidades propias de generación, razonamiento, código o visión: estas dependen íntegramente del modelo base Qwen3.5-4B.

## Casos de uso

- Fusión de contextos en pipelines RAG: combinar la caché de un documento recuperado con la de la conversación previa sin reprocesar ambos textos completos, útil cuando se reutilizan los mismos fragmentos entre consultas.
- Sesiones de agente con memoria fragmentada: unir el estado de una subtarea con el de la conversación principal manteniendo el orden izquierda-derecha y verificando la coherencia del siguiente token.
- Evaluación de técnicas de caché KV: servir como referencia reproducible para comparar estrategias de concatenación de estados frente a prefill nativo.
- Investigación sobre decodificación especulativa basada en readouts: el readout propone candidatos que se validan contra la caché temprana, patrón análogo a la verificación especulativa.
- Prototipado de sistemas multi-contexto con presupuesto de cómputo limitado: en backends NF4 permite trabajar en GPU de gama media con el modelo base cuantizado.
- Reproducción de experimentos académicos: el repositorio incluye pines de revisión del modelo base y un archivo `runtime-validation.json` con los recuentos de tokens por ensayo, lo que facilita replicar la validación.

## Benchmarks y rendimiento

Los únicos datos publicados son pruebas de coincidencia del siguiente token greedy y una muestra reducida de tareas, no benchmarks estándar de calidad del modelo.

| Prueba | Backend | Resultado |
|---|---|---|
| Coincidencia de siguiente token greedy vs. append nativo | BF16 | 4/4 |
| Coincidencia de siguiente token greedy vs. append nativo | NF4 | 4/4 |
| Coincidencia de siguiente token greedy vs. append nativo | GGUF | 4/4 |
| Guardado/carga de snapshot | BF16, NF4, GGUF | superado |
| HumanEval + GSM8K (muestra dividida en dos estados) | GGUF | 1/4 con `combine()`, 1/4 con prefill nativo |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval completo, GSM8K completo) en la información disponible.

## Requisitos de hardware

- VRAM estimada: depende del modelo base Qwen3.5-4B; el readout añade ~21 MB en FP32. En NF4 el modelo base de 4B requiere aproximadamente 3-4 GB de VRAM, más overhead de caché KV.
- GPU recomendadas: no especificadas por el autor; por tamaño del base, una RTX 4090 o A100/H100 son suficientes con margen amplio.
- Compatibilidad con GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más en NF4, aunque el autor no publica requisitos mínimos.
- Despliegue: librería `latentport` (pip install "latentport[nf4]>=0.4.9"); GGUF mediante runtime nativo de LatentPort con `model_path` local apuntando al archivo Q4_K_M de LM Studio. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre alternativas comparables en la documentación proporcionada. Se trata de un artefacto de combinación de estados de caché, no de un modelo generativo autónomo, por lo que la comparación con modelos de lenguaje de tamaño similar no es directa.

| Alternativa | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LPCombine-Qwen3.5-4B | Readout de state-combination | 5,2 M (readout) | heredado del base | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | Modelo base | no disponible | no disponible | no disponible | Hugging Face |
| Otras técnicas de fusión de caché KV | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no genera texto por sí mismo: requiere el base Qwen3.5-4B y la librería `latentport` 0.4.9 o superior.
- La validación es extremadamente limitada: 4 ensayos de coincidencia greedy y una muestra de 4 tareas (HumanEval + GSM8K), con puntuación 1/4 en ambos modos.
- La operación replica el contexto derecho, por lo que el ahorro de cómputo no es trivial y debe medirse en cada caso.
- La decodificación *cache-only* no está disponible en GGUF.
- Exige identidad estricta de modelo, pesos, tokenizador, backend y política de posiciones entre los dos estados de entrada.
- El readout se entrenó solo con 18.432 tokens sintéticos, lo que limita la generalización a distribuciones reales.
- No hay información sobre sesgos, idiomas soportados ni evaluación de alucinación.
- La licencia Apache-2.0 cubre el readout, pero los pesos del modelo base quedan sujetos a los términos de Qwen; verificar antes de uso comercial.
- Repositorio sin descargas ni likes en el momento de la consulta; madurez y soporte comunitario no verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/latentport/LPCombine-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Revisión del modelo base fijada: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Web de LatentPort: https://latentport.com
- Repositorio fuente: https://github.com/LatentPort/latentport
- Paquete PyPI: https://pypi.org/project/latentport/
- Perfil del autor: https://au.linkedin.com/in/simon-villani
- Archivo GGUF de referencia (LM Studio Q4_K_M): https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF/blob/f9f88ac3e234be915e23811a6d28ea287bdb927e/Qwen3.5-4B-Q4_K_M.gguf
- Validación de runtime (referenciada en la model card): runtime-validation.json (incluido en el repositorio del modelo)
- Pines de perfil y checkpoint (referenciado en la model card): lpcombine.json (incluido en el repositorio del modelo)
