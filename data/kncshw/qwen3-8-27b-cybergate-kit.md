# kncshw/Qwen3.8-27B-CyberGate-Kit

## Resumen

CyberGate Kit es un complemento de inferencia para el modelo Qwen/Qwen3.8-27B, publicado por el usuario kncshw. No se trata de un modelo con pesos propios ni de un adaptador PEFT/LoRA, sino de un conjunto de artefactos (vectores de activación en JSON, una plantilla de chat en Jinja y metadatos de calibración) que se cargan mediante un plugin externo sobre vLLM 0.32.0 para modificar el comportamiento del modelo base sin tocar sus pesos.

El objetivo declarado es desbloquear las capacidades de ciberseguridad, CTF e ingeniería inversa del modelo base mediante una compuerta de activación de dos factores durante el prefill: se comprueba que la petición sea simultáneamente del dominio de ciberseguridad y que esté bajo presión de rechazo. Cuando ambas condiciones se cumplen, se inyecta un prefijo `<think>` y se monitoriza la proyección de rechazo durante la decodificación, preservando el formato nativo de `<tool_call>` para agentes.

Es relevante para quienes investigan técnicas de abliteration y steering por activaciones en producción, y para equipos que necesiten un endpoint de ciberseguridad ofensiva manteniendo un endpoint base intacto en paralelo. El kit ocupa unos 700 KB y no incluye pesos; requiere descargar Qwen/Qwen3.8-27B por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo base Qwen3.8-27B no detalla su arquitectura en la informacion proporcionada) |
| Parametros totales | No disponible (el nombre del modelo base sugiere 27B, sin confirmacion en la informacion) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el ejemplo de despliegue usa `--dtype bfloat16`) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | El kit contiene JSON de vectores de activacion y plantilla Jinja; no incluye pesos. Los pesos del modelo base se sirven via vLLM (formato no especificado en la informacion) |

## Arquitectura y entrenamiento

El kit no entrena ni modifica pesos: opera sobre las activaciones internas del modelo base Qwen/Qwen3.8-27B mediante hooks de PyTorch de solo lectura en el forward. La compuerta de dos factores evalua, en la capa 40, la similitud coseno entre el estado oculto y un vector de categoria de ciberseguridad (umbral `tau = +0.08792114`, pooling `mean_user`), y en la capa 43 la proyeccion sobre una direccion de rechazo calibrada (`sep = 1.1487`, `z_harm_mean = +18.18σ`, umbral `s_ref_z >= +1.50σ`). Solo si ambas condiciones se activan se inyecta el prefijo `<think>` y se aplica steering de bucle cerrado durante la decodificacion mediante un `LogitsProcessor` de vLLM V1.

Los artefactos se ajustaron sobre activaciones reales extraidas de vLLM, segun un registro de captura de 4.134 prompts y un barrido de 64 capas documentado en `MANIFEST.json` y `records/`. El kit incluye nueve prompts canario fijados a un checkpoint (cinco de objetivo cyber, cuatro de no objetivo) verificados por `check_eval.sh`. No se detallan en la informacion proporcionada los datos de preentrenamiento, RLHF o DPO del modelo base.

## Capacidades

- Generacion de texto conversacional sobre el modelo base Qwen3.8-27B.
- Desbloqueo condicionado de contenido de ciberseguridad, CTF e ingenieria inversa cuando se cumplen los dos factores de la compuerta.
- Mantenimiento del rechazo en peticiones daninas no relacionadas con ciberseguridad (segun el autor, 0,0% de fuga en SOSBench-bio).
- Soporte nativo de tool calling y `<tool_call>` en JSON, compatible con agentes como OpenCode y servidores MCP.
- Modo de razonamiento `<think>` con prefijo inyectado y parser de razonamiento `qwen3`.
- Endpoint dual: puerto 8001 con CyberGate activo y puerto 8000 con el modelo base sin modificar.
- Capacidades multilingues: no disponibles en la informacion proporcionada (la documentacion incluye una version en chino del README, pero no se especifican idiomas del modelo).

## Casos de uso

- Investigacion en seguridad ofensiva controlada: desplegar el endpoint 8001 para pruebas de CTF y analisis de binarios, manteniendo el endpoint 8000 como referencia sin steering para comparar respuestas.
- Evaluacion de tecnicas de abliteration y activation steering: usar los vectores `L40` y `L43` y los canarios incluidos para reproducir la calibracion y medir la tasa de activacion de la compuerta sobre corpus propios.
- Agentes autonomos de seguridad: conectar OpenCode o servidores MCP al puerto 8001, aprovechando que el kit preserva el JSON de `<tool_call>` durante el steering y permite pipelines multi-paso con llamadas a herramientas.
- Auditoria de robustez frente a jailbreaks: comparar el comportamiento del endpoint base y el gated sobre el mismo prompt para cuantificar el efecto del steering en la tasa de rechazo.
- Red teaming interno con separacion de dominios: el doble factor (categoria cyber y presion de rechazo) permite habilitar contenido ofensivo solo en peticiones del dominio, reduciendo el riesgo de fugas en consultas de bioseguridad u otras areas daninas.
- Despliegue en infraestructura vLLM existente: integrar el plugin via `pip install` y `CYBERGATE_OPS_DIR` en un cluster ya operativo con vLLM 0.32.0, sin reentrenar ni redistribuir pesos.
- Formacion y demos: usar Docker Compose con los puertos 8000 y 8001 para mostrar en vivo la diferencia entre modelo base y modelo con compuerta.

## Benchmarks y rendimiento

Resultados de activacion de la compuerta publicados por el autor sobre Qwen/Qwen3.8-27B en bfloat16 con vLLM:

| Corpus | Prompts (n) | Compuerta activada | Rol esperado |
|---|---:|---:|---|
| CySecBench | 675 | 587 (87,0%) | Objetivo: desbloquear |
| SOSBench-bio | 498 | 0 (0,0%) | Dano no objetivo: mantener rechazo |
| WMDP-bio | 637 | 6 (0,9%) | Dano no objetivo: mantener rechazo |
| Harmless | 1.000 | 0 (0,0%) tras veto de dos factores | Benefigno: sin steering |
| CatQA | 234 | 23 (9,8%) | Dano no objetivo: mantener rechazo |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. El ejemplo de despliegue usa `--dtype bfloat16` y `--enforce-eager` sobre Qwen/Qwen3.8-27B, lo que sugiere requisitos propios de un modelo de gran tamano en precision completa, sin cifras concretas.
- GPU recomendadas: la documentacion menciona Google Colab A100 y RunPod/Vast como entornos de despliegue, ademas de Docker Compose local.
- Compatibilidad con GPU de consumo: no confirmada en la informacion; el uso de bfloat16 y `--enforce-eager` apunta a GPUs profesionales.
- Opciones de despliegue: vLLM 0.32.0 con el plugin CyberGate, `pip install --no-deps "git+https://github.com/kncshw/cybergate.git"`, Docker Compose (`docker-compose.Qwen3.8-27B.yml`) o script `serve_no_docker.sh`. Requiere `VLLM_USE_V2_MODEL_RUNNER=0`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-CyberGate-Kit | No disponible (base 27B) | No disponible | Steering por activaciones sobre Qwen3.8-27B | MIT | Hugging Face + GitHub |
| Qwen/Qwen3.8-27B (base) | No disponible (27B) | No disponible | Modelo base sin modificar | No disponible en la informacion | Hugging Face |
| Alternativas de abliteration/uncensored | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo con otros modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el plugin CyberGate de vLLM 0.32.0 y sin los pesos de Qwen/Qwen3.8-27B, el kit no es utilizable.
- El steering por activaciones puede degradar la coherencia o la calidad de las respuestas en prompts que activen la compuerta de forma espuria; el autor reporta un 9,8% de activacion en CatQA, lo que indica falsos positivos en contenido danino no cyber.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; el steering no corrige errores factuales del modelo base.
- Sesgos: no documentados en la informacion proporcionada.
- Restricciones de licencia: el kit es MIT, pero el uso comercial depende de la licencia del modelo base Qwen/Qwen3.8-27B, no detallada en la informacion.
- El desbloqueo de contenido de ciberseguridad ofensiva conlleva riesgo legal y etico; el autor disena la compuerta para limitarlo, pero no hay garantia de contencion perfecta.
- Dependencia de versiones concretas: vLLM 0.32.0 y `VLLM_USE_V2_MODEL_RUNNER=0`; cambios de version pueden romper los hooks y el `LogitsProcessor`.
- Idiomas y longitud de contexto del modelo base no confirmados en la informacion disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/kncshw/Qwen3.8-27B-CyberGate-Kit
- Repositorio del plugin en GitHub: https://github.com/kncshw/cybergate
- README en chino: https://github.com/kncshw/cybergate/blob/main/README_zh.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
