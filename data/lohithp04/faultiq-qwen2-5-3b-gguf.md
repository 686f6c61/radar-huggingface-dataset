# lohithp04/faultiq-qwen2.5-3b-gguf

## Resumen

FaultIQ es un ajuste fino (LoRA, r = 8) de Qwen2.5-3B-Instruct orientado a una tarea muy concreta: clasificar logs de infraestructura cloud en una de cinco causas raíz (Authentication failure, Database connection failure, Memory exhaustion, Network timeout, Configuration error) y devolver un JSON estricto con `category`, `reason` y `confidence`. Lo publica el usuario lohithp04 como un único fichero GGUF de 1,93 GB cuantizado a Q4_K_M, listo para ejecutarse en Ollama, llama.cpp o LM Studio sobre CPU o GPU, en macOS, Linux y Windows.

El modelo no pretende ser un asistente generalista: es un clasificador de triaje de incidentes para operaciones (AIOps). Su valor está en la combinación de tamaño reducido y formato de salida estructurado, lo que permite integrarlo en pipelines de alertas sin depender de APIs externas ni de hardware de datacenter. La cuantización Q4_K_M no degrada la precisión medida frente al adaptador original, según los datos del autor.

La relevancia práctica es doble: por un lado, demuestra que un modelo de 3B parámetros ajustado con LoRA puede superar el rendimiento zero-shot de su base en una tarea acotada (100 % frente a 93,2 % en el conjunto de test real); por otro, ofrece un formato de despliegue (un solo GGUF de menos de 2 GB) que cabe en cualquier portátil moderno. La licencia Qwen Research limita el uso comercial sin acuerdo adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino LoRA fusionado |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens (recomendado en llama.cpp con `-c 4096`); contexto nativo de Qwen2.5-3B no indicado en la informacion disponible |
| Tipos de cuantizacion | Q4_K_M (4,99 bits por peso); el repo solo publica esta cuantizacion |
| Idiomas soportados | Ingles |
| Licencia | Qwen Research License (research y no comercial) |
| Formato de pesos | GGUF (1,93 GB, fichero `faultiq-qwen2.5-3b-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3.085.938.688 parametros. Sobre esa base se entreno un adaptador LoRA de rango 8 (el repositorio del adaptador es `lohithp04/faultiq-qwen2.5-3b-mlx-lora`), entrenado con el dataset `lohithp04/faultiq-cloud-logs-mlx`. El pipeline de publicacion consistio en fusionar el adaptador con `mlx_lm.fuse` sobre los pesos desquantizados de la base 4-bit, convertir a GGUF F16 con `convert_hf_to_gguf.py` (6,2 GB, 434 tensores) y cuantizar a Q4_K_M con `llama-quantize` (commit `171527522` de llama.cpp).

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO adicional. El dataset de referencia contiene 124 filas retenidas para evaluacion (74 logs reales en el split `test` y 50 logs adversariales en `gold_benchmark`), lo que sugiere un conjunto de entrenamiento pequeno y especifico. La innovacion tecnica destacable no esta en la arquitectura sino en el diseno de la tarea: prompt de sistema fijo byte a byte, salida JSON forzada y entrenamiento especifico para resistir trampas de palabras clave (por ejemplo, un timeout de base de datos que el modelo base etiqueta como "Network timeout").

## Capacidades

- Clasificacion de logs de infraestructura cloud en exactamente cinco categorias: Authentication failure, Database connection failure, Memory exhaustion, Network timeout y Configuration error.
- Generacion de JSON estricto con las claves `category`, `reason` y `confidence`, con validacion de esquema del 100 % en el benchmark del autor.
- Extraccion de una justificacion textual breve (`reason`) que cita el fragmento del log que motiva la clasificacion, aunque puede contener detalles alucinados.
- Distincion de casos limite por palabras clave: la precision en "boundary traps" sube del 70 % (base) al 95 % (ajuste fino), segun el autor.
- Ejecucion local en CPU o GPU mediante Ollama, llama.cpp, LM Studio y cualquier runtime compatible con GGUF.
- Integracion con endpoints compatibles con OpenAI a traves de `llama-server` (`/v1/chat/completions`).
- No soporta tool calling, agentes multi-paso, vision, audio ni modos de razonamiento extendido; es un clasificador de un solo turno.
- Multilingue: no, solo ingles.

## Casos de uso

- Triaje automatico de alertas en produccion: cada alerta de monitorizacion (Prometheus, Datadog, CloudWatch) se envia como log al modelo, que devuelve la causa raiz en JSON y permite enrutar la incidencia al equipo correcto sin intervencion humana.
- Enriquecimiento de tickets en sistemas de helpdesk: el modelo clasifica el log adjunto a un ticket (Jira, ServiceNow) y rellena un campo de categoria y un resumen, reduciendo el tiempo de primera respuesta.
- Pre-filtrado en pipelines de observabilidad: integrado como paso previo a un LLM mayor, descarta o agrupa incidentes triviales en local y solo escala los casos ambiguos, ahorrando coste de API.
- Diagnostico en entornos con restricciones de red: al ejecutarse en local con Ollama, es apto para plantas industriales, entornos air-gapped o sedes sin salida a Internet donde no se puede llamar a un servicio cloud.
- Formacion y simulacros de SRE: generar clasificaciones etiquetadas sobre logs historicos para construir datasets de evaluacion o comparar la respuesta de distintos equipos ante incidentes sinteticos.
- Automatizacion en CI/CD de infraestructura: clasificar logs de despliegue fallidos en un pipeline (por ejemplo, tras un `terraform apply` o un `kubectl rollout`) y decidir si se hace rollback automatico segun la categoria detectada.
- Analisis de logs en el borde (edge): al ocupar 1,93 GB y correr en CPU, puede desplegarse en dispositivos con recursos limitados para monitorizar servicios locales sin enviar datos fuera.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos sobre las 124 filas retenidas de `lohithp04/faultiq-cloud-logs-mlx` con `llama-server` en Metal (Apple M4) y los ajustes recomendados (temperatura 0, `max_tokens` 96):

| Metrica | Qwen2.5-3B base (zero-shot) | Adaptador MLX (original) | Este GGUF (Q4_K_M) |
|---|---|---|---|
| `test` (74 logs reales) | 93,2 % | 100 % | 100 % |
| `gold_benchmark` (50 logs adversariales) | 84,0 % | 92,0 % | 92,0 % (mismos 4 errores) |
| JSON valido segun esquema | 4,8 % | 100 % | 100 % |
| Salidas truncadas por limite de tokens | No aplica | 0 | 0 |
| Velocidad (Apple M4, Metal) | No disponible | ~1,1 s/log | ~1,2 s/log, ~40 tok/s |

La cuantizacion a Q4_K_M no produjo perdida medible de precision en este benchmark. No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,93 GB de pesos en Q4_K_M; con overhead de contexto y KV cache a 4096 tokens, entre 2,5 y 3,5 GB segun runtime. Cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). Tambien funciona en Apple Silicon via Metal (el autor lo midio en un M4).
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas y en iGPU con memoria unificada suficiente.
- Opciones de despliegue: Ollama (recomendado, con ficheros `system` y `params` incluidos en el repo), llama.cpp (`llama-server` con `--jinja -c 4096`), LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: ~1,2 s por log y ~40 tok/s en Apple M4 con Metal, segun el autor. No hay datos publicados para GPU NVIDIA o CPU x86 en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| FaultIQ (este modelo) | 3,09 B | 4096 (recomendado) | Clasificacion de logs en 5 categorias | Qwen Research (no comercial) | GGUF Q4_K_M |
| Qwen2.5-3B-Instruct (base) | 3,09 B | No indicado en la informacion disponible | Asistente generalista | Qwen Research | Safetensors, GGUF (comunidad) |
| FaultIQ MLX LoRA (adaptador original) | 3,09 B + LoRA r=8 | No indicado | Misma tarea de clasificacion | Qwen Research | Adaptador MLX |
| Modelos de triaje propietarios (p. ej. servicios cloud de AIOps) | No disponible | No disponible | Clasificacion de incidentes | Comercial | API |

La comparativa con alternativas de la misma categoria es limitada: no hay en la informacion disponible otros modelos open source especializados en triaje de logs con los que contrastar parametros y rendimiento. Frente a la base Qwen2.5-3B-Instruct, la ganancia se concentra en el formato de salida (100 % JSON valido frente a 4,8 %) y en la resistencia a trampas de palabras clave (95 % frente a 70 % en casos limite), no en conocimiento general.

## Limitaciones y advertencias

- Las respuestas incorrectas no se senalan: la confianza ronda 0,93 tanto en aciertos como en errores, por lo que no sirve como score de incertidumbre. Cualquier uso en produccion debe validar el JSON y derivar a revision humana los casos dudosos.
- El campo `reason` puede contener detalles alucinados (puerto o nombre de base de datos incorrectos); debe tratarse como pista, no como dato fiable.
- No existe clase "otro" ni "sano": toda entrada se fuerza a una de las cinco etiquetas, lo que genera falsos positivos si se le envian logs que no corresponden a un incidente.
- Punto debil identificado por el autor: fallos de autenticacion implicitos (Kerberos, tokens de registro expirados).
- Solo funciona correctamente con el prompt de sistema exacto con el que fue entrenado; variaciones en el prompt degradan la salida.
- Idioma: solo ingles. Logs en castellano u otros idiomas no estan cubiertos.
- Licencia Qwen Research: cubre investigacion y uso no comercial; el uso comercial requiere acuerdo con el titular de la licencia (Qwen/Alibaba).
- El modelo no es un asistente conversacional ni soporta tool calling; usarlo fuera de la tarea de clasificacion produce resultados pobres.
- El dataset de entrenamiento es pequeno y especifico; el rendimiento en dominios distintos (logs de aplicacion, seguridad, redes de otro tipo) no esta validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lohithp04/faultiq-qwen2.5-3b-gguf
- Adaptador LoRA original (MLX): https://huggingface.co/lohithp04/faultiq-qwen2.5-3b-mlx-lora
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/lohithp04/faultiq-cloud-logs-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Codigo y reporte completo: https://github.com/04-lohith/FaultIQ
