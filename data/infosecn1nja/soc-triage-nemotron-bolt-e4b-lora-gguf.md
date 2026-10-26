# infosecn1nja/soc-triage-nemotron-bolt-e4b-lora-gguf

## Resumen

`soc-triage-nemotron-bolt-e4b-lora-gguf` es la exportación en formato GGUF de un ajuste fino con LoRA sobre `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16`, orientado al triaje de alertas en un centro de operaciones de seguridad (SOC). Lo publica el usuario `infosecn1nja` dentro de un proyecto llamado TriageKit v1.0, cuyo objetivo es convertir alertas de un SIEM en decisiones estructuradas en JSON (etiqueta, confianza, referencias de evidencia, justificación y siguiente paso). El modelo tiene 7.463.013.674 parámetros según los safetensors del repositorio y se distribuye únicamente en inglés.

El interés técnico del artefacto no está en los pesos, sino en la metodología de evaluación: el autor publica un arnés de validación con compuertas anti-falsos positivos, controles en vivo sobre Wazuh (59 alertas rutinarias y 48 de ataque) y una regresión de cuantización sobre 15 alertas doradas. Los resultados son deliberadamente honestos y mixtos: el adaptador LoRA alcanza macro-F1 0,954 en el split sintético de test (n=55), pero la cuantización Q4_K_M solo reproduce el 66,7% de las etiquetas del adaptador y Q6_K y Q8_0 se quedan en el 46,7%, por debajo de la compuerta de regresión del 90%.

Por eso el propio autor advierte de que este GGUF **no es un artefacto de producción**: la regresión de cuantización falló y el artefacto recomendado para servir es el adaptador MLX. Es relevante ahora como caso de estudio reproducible de evaluación de modelos de seguridad, de contrato de salida JSON con guardarraíles y de por qué una cuantización agresiva puede degradar tareas que dependen de citar identificadores de evidencia exactos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (derivada de NVIDIA-Nemotron-3.5-Bolt-E4B; solo se incluye la torre de lenguaje, sin proyectores de vision ni audio) |
| Parametros totales | 7.463.013.674 (7,46 B) segun safetensors |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (los ejemplos de despliegue del autor usan `-c 4096`) |
| Tipos de cuantizacion | F16 (adaptador LoRA, 3,3 MB), Q4_K_M (4,9 GB); el autor evaluo tambien Q6_K y Q8_0 del modelo base con el LoRA |
| Idiomas soportados | Ingles (en) |
| Licencia | OpenMDW-1.1, con componentes Apache-2.0 de Gemma 4; datos de entrenamiento CC BY 4.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 5,3 GB |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (relacion: quantized) |
| Dataset de entrenamiento | infosecn1nja/soc-triage-opensec-chat / tegridydev/opensec-triage |
| Fecha de publicacion | 2026-10-26 |
| Descargas / likes | 3 / 0 |

## Arquitectura y entrenamiento

El artefacto es un LoRA de 30 iteraciones entrenado sobre 420 ejemplos sinteticos, con el modo de razonamiento (thinking) desactivado; el autor indica explicitamente que se debe usar la plantilla de chat no-thinking si el runtime lo permite. La cadena de conversion publicada es: base MLX de 4 bits mas adaptador LoRA, fusionados y desconvetidos a BF16, conversion a GGUF F16 mediante `convert_hf_to_gguf.py` de llama.cpp y cuantizacion final a Q4_K_M con `llama-quantize`. Solo se preserva la torre de lenguaje del modelo base, de modo que las capacidades visuales y de audio del original no estan presentes.

No se documentan en la informacion disponible el numero total de tokens vistos, la composicion del dataset mas alla de su origen (alertas sinteticas de triaje SOC) ni si hubo fases de RLHF o DPO. La innovacion practica no es arquitectonica sino de contrato: el modelo se entrena para emitir un JSON con `decision`, `confidence`, `evidence_refs`, `rationale` y `next_step`, apoyado en un guardarrail externo que verifica que los identificadores de evidencia citados existan y, si no, fuerza la ruta a humano. El autor publica tambien un adaptador LoRA F16 de 3,3 MB que puede cargarse con `--lora` sobre el GGUF oficial del modelo base (`ggml-org/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF`), lo que constituye una segunda via de despliegue.

## Capacidades

- Generacion de texto con salida JSON estructurada y conforme a un contrato de campos fijo, con temperatura 0 y salida capada a unos 200 tokens para determinismo.
- Triaje y clasificacion de alertas de seguridad: etiquetas tipo `suspicious`, `unknown`, etc., con nivel de confianza asociado.
- Citacion de evidencia: emite referencias del tipo `EV-1` que el guardarrail valida contra el contexto proporcionado.
- Sugerencia de siguiente paso operativo (`next_step`) y justificacion en ingles (`rationale`), pensadas para revision humana.
- Marcado de escalado y banderas de ataque dentro del arnes de evaluacion (attack-flag), con cero falsos positivos medidos en los conjuntos del autor.
- Integracion como endpoint compatible con la API de OpenAI (`llama-server` en el puerto 8093), lo que facilita su uso en pipelines existentes.
- Capacidad multilingue: limitada al ingles segun la model card.
- Sin soporte documentado de tool calling generico, agentes multi-paso autonomos, vision ni audio en este artefacto.

## Casos de uso

- Triaje de nivel 1 en un SIEM: el modelo recibe la alerta y el contexto del activo y devuelve un JSON con etiqueta, confianza y evidencia; encaja en flujos Wazuh o Splunk porque el autor valido precisamente 59 alertas rutinarias y 48 de ataque sobre Wazuh en vivo.
- Modo sombra (L0 shadow) previo a automatizacion: el autor marca las compuertas como READY para L0 shadow, de modo que el modelo puede ejecutarse en paralelo a los analistas sin capacidad de cierre automatico, comparando sus decisiones con las humanas.
- Enriquecimiento de alertas con justificacion auditable: la salida incluye `evidence_refs` y `rationale` en ingles, lo que permite adjuntar a cada ticket una explicacion verificable por el guardarrail antes de mostrarla al analista.
- Clasificacion de hallazgos de auditoria de configuracion: el autor menciona explicitamente casos donde el modelo cito el item de auditoria de configuracion en lugar de la linea base, lo que indica un uso previsto de contraste entre configuracion deseada y real.
- Despliegue en entornos aislados (air-gapped): al ser un GGUF de 4,9 GB ejecutable con llama.cpp, puede correr en estaciones sin salida a internet dentro de la red del SOC.
- Prototipado e investigacion de ajuste fino en dominio seguridad: sirve como referencia reproducible (dataset sintetico, arnes, scripts de conversion y sumas SHA-256) para equipos que quieran replicar el pipeline con datos propios etiquetados.
- Generacion de borradores de respuesta para revision humana: el campo `next_step` produce una propuesta de accion que el analista valida; el guardarrail falla en cerrado hacia `unknown`/`route_human` cuando la evidencia no es verificable.

## Benchmarks y rendimiento

Evaluacion del adaptador sobre split de test sintetico (n=55), segun la model card:

| Metrica | Resultado |
|---|---|
| Macro-F1 | 0,954 |
| Maliciosos no detectados | 0 |
| Precision de auto-cierre | 1,0 |
| Falsos positivos de attack-flag | 0 |
| Compuertas para L0 shadow | READY (11 PASS + 3 SKIP bajo guarda estadistica) |

Controles del arnes y del agente:

| Comprobacion | Resultado |
|---|---|
| Compuertas FP del arnes (attack-flag / escalado / cierre inseguro) | 0 / 0 / 0 |
| Control rutinario Wazuh en vivo (59 alertas) | 0 marcadas |
| Control de ataque Wazuh en vivo (48 alertas) | 0 degradadas |
| Smoke estratificado del agente SOCBench (8 unidades x 4 personas) | precision 1,00, 0 falsos maliciosos, F1 0,667 |

Regresion de cuantizacion sobre 15 alertas doradas:

| Artefacto | JSON valido | Contrato valido | Acuerdo de etiqueta vs adaptador |
|---|---|---|---|
| Q4_K_M | 100% | 100% | 66,7% |
| Q6_K | 100% | 100% | 46,7% |
| Q8_0 | 100% | 100% | 46,7% |

Ruta alternativa con LoRA sobre el GGUF oficial Q8_0 (15 alertas doradas, plantilla no-thinking):

| Metrica | Resultado |
|---|---|
| Validez JSON | 100% |
| Validez de contrato | 100% |
| Rechazos del guardarrail | 0 |
| Acuerdo de etiqueta vs adaptador MLX | 86,7% (13/15) |
| Acuerdo de accion | 93,3% |
| Discrepancias | 2 casos `unknown` a `suspicious`, ambas con `route_human` |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks academicos similares en la informacion disponible.

## Requisitos de hardware

- VRAM para Q4_K_M: aproximadamente 5,5-6 GB con contexto de 4096 tokens (pesos de 4,9 GB mas cache KV), estimacion a partir del tamano del fichero.
- VRAM para la ruta LoRA sobre el GGUF oficial Q8_0: del orden de 9-10 GB, dado que el fichero Q8_0 del base es aproximadamente el doble del Q4_K_M y el adaptador solo anade 3,3 MB.
- VRAM para BF16/F16 del modelo fusionado: del orden de 15 GB segun el recuento de 7,46 B parametros a 2 bytes por peso; requiere GPU de 24 GB o superior.
- GPU consumer: cabe en RTX 3060 de 12 GB y RTX 4060 Ti de 16 GB con Q4_K_M; RTX 4090 (24 GB) permite Q8_0 e incluso F16.
- GPU de datacenter: A100 40 GB y H100 son suficientes para F16, aunque el modelo no esta pensado para servir a gran escala.
- Solo CPU: viable con llama.cpp sobre el Q4_K_M, requiriendo en torno a 6-8 GB de RAM; no hay datos de latencia publicados.
- Opciones de despliegue: `llama-server` de llama.cpp (endpoint compatible con OpenAI en el puerto 8093), LM Studio y Ollama, segun la propia model card. vLLM y TGI no estan documentados para este artefacto.
- Latencia y throughput: no disponibles. Solo se especifica que conviene fijar `temperature=0` y limitar la salida a unos 200 tokens para obtener JSON determinista.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Estado segun el autor |
|---|---|---|---|---|---|
| soc-triage-nemotron-bolt-e4b-lora-gguf (este) | 7,46 B | Triaje SOC, LoRA fusionado en Q4_K_M | No disponible (4096 en ejemplos) | OpenMDW-1.1 | Regresion de cuantizacion fallida; no es artefacto de produccion |
| soc-triage-nemotron-bolt-e4b-lora (adaptador MLX) | Mismo base | Triaje SOC, adaptador MLX | No disponible | OpenMDW-1.1 | Artefacto recomendado para servir en produccion por el autor |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16 (base) | No disponible en esta ficha | Modelo generalista multimodal (lenguaje, vision, audio) | No disponible | No disponible en esta ficha | Base sin ajuste de dominio; al exportar a GGUF se descartan vision y audio |
| Ruta LoRA sobre ggml-org Q8_0 | Mismo base | Triaje SOC con LoRA cargado en runtime | 4096 en el ejemplo | OpenMDW-1.1 | Alternativa validada con 86,7% de acuerdo, por debajo de la compuerta del 90% |

No se dispone de informacion sobre otros modelos abiertos especificos de triaje SOC comparables en terminos de parametros, contexto y licencia.

## Limitaciones y advertencias

- Sobreajuste probable: 420 filas sinteticas y 30 iteraciones de LoRA; el autor lo califica explicitamente como no validado sobre datos reales etiquetados.
- Regresion de cuantizacion fallida: Q4_K_M, Q6_K y Q8_0 quedan entre el 46,7% y el 66,7% de acuerdo con el adaptador, por debajo de la compuerta del 90%. El GGUF no debe usarse como artefacto de produccion.
- Alucinacion de identificadores de evidencia: el modelo puede citar el identificador equivocado (por ejemplo, el item de linea base en lugar del de auditoria de configuracion); sin el guardarrail que valida los IDs, las decisiones no son fiables.
- Dependencia de un guardarrail externo: cuando la evidencia no se verifica, el sistema falla en cerrado hacia `unknown`/`route_human`; la correccion de los resultados publicados proviene de la politica del agente y no de los pesos GGUF.
- Solo texto: las capacidades de vision y audio del modelo base no estan incluidas en esta exportacion.
- Idioma: exclusivamente ingles; no hay soporte documentado de castellano.
- Licencia: OpenMDW-1.1 con componentes Apache-2.0 de Gemma 4 y datos CC BY 4.0; es necesario revisar los terminos de OpenMDW-1.1 antes de un uso comercial y conservar los avisos de atribucion incluidos.
- Sin afiliacion ni respaldo de NVIDIA ni de Google, segun declara el propio autor.
- Sin datos publicados de latencia, throughput ni comportamiento bajo carga concurrente.
- Repositorio practicamente sin traccion (3 descargas, 0 likes) y sin validacion por terceros; tratar cualquier resultado como preliminar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/infosecn1nja/soc-triage-nemotron-bolt-e4b-lora-gguf
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- GGUF oficial del modelo base (para la ruta con `--lora`): https://huggingface.co/ggml-org/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Dataset de entrenamiento: https://huggingface.co/datasets/infosecn1nja/soc-triage-opensec-chat
- Dataset original de triaje: https://huggingface.co/datasets/tegridydev/opensec-triage
- llama.cpp (runtime de inferencia y herramientas de conversion): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs tecnicos ni demos adicionales.
