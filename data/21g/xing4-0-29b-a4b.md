# 21g/Xing4.0-29B-A4B

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd. dentro de la serie Xing (anteriormente TeleChat). Se distribuye en Hugging Face bajo el identificador 21g/Xing4.0-29B-A4B. Según el autor, cuenta con 29B parámetros totales de los que solo 4B se activan por token, lo que lo sitúa en la categoría de modelos dispersos de coste de inferencia reducido. La comprobación real de los pesos en safetensors arroja 31.215.031.088 parámetros, ligeramente por encima de la cifra declarada. El repositorio ocupa 62,4 GB.

El modelo nativo soporta una longitud de contexto de 256K tokens, extensible a 512K, y está orientado explícitamente a tareas de agente: planificación multi-paso, tool calling y ejecución de cadenas de razonamiento complejas. Incorpora un modo de razonamiento explícito ("thinking") que se puede activar o desactivar mediante el template de chat. Su arquitectura combina mHC, MLA y MTP, con 40 capas, 64 expertos enrutados y 4 expertos activos por token más uno compartido.

Es relevante por dos motivos: es el primer modelo de esta escala que se entrena íntegramente en la plataforma Ascend NPU con el framework MindSpore (clústeres Ascend 910C), y declara optimizaciones de entrenamiento que elevan el throughput un 96% respecto al rendimiento por defecto. La licencia es Apache 2.0, lo que facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mHC + MLA + MTP), transformer con attention MLA |
| Parametros totales | 29B declarados por el autor; 31.215.031.088 reales en safetensors |
| Parametros activos | 4B por token (64 expertos enrutados, 4 activos por token, 1 experto compartido) |
| Longitud de contexto | 256K tokens, extensible a 512K |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, con custom_code) |

Datos estructurales adicionales: 40 capas, hidden size 3584, tamano intermedio de la FFN densa 9216, tamano intermedio de experto 1024.

## Arquitectura y entrenamiento

El modelo sigue una arquitectura MoE de tipo disperso con atencion MLA (Multi-head Latent Attention), 64 expertos enrutados mas un experto compartido, y 4 expertos activados por token. La model card menciona de forma explicita una combinacion "mHC + MLA + MTP", siendo MTP (Multi-Token Prediction) un mecanismo de prediccion multi-token. No se detallan en la informacion disponible el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

El aspecto diferencial del entrenamiento es la plataforma: se realizo integramente sobre Ascend NPU (clústeres Ascend 910C) con MindSpore y MindFormers, incluyendo adaptacion de caracteristicas para mHC y desarrollo de operadores fusionados en Ascend C. El autor declara mejoras de throughput de entrenamiento de aproximadamente el 96% sobre el rendimiento listo para usar, logradas mediante optimizacion del trafico de comunicacion MoE, recomputacion selectiva y fusion automatica de grafos y operadores (DVM). No se especifica en la documentacion disponible si se empleo decodificacion especulativa en inferencia.

## Capacidades

- Generacion de texto conversacional y de proposito general en formato texto.
- Razonamiento complejo con modo "thinking" activable mediante `chat_template_kwargs: {"enable_thinking": true}`. Se recomienda temperatura 1.0, top_p 0.95 y `repetition_penalty` 1.05 para razonamiento complejo.
- Capacidades de codigo y tareas de ingenieria de software: el autor reporta resultados en SWE-bench Verified (75.00) y SWE-bench Multilingual (66.00) con un contexto de 210K.
- Ejecucion de tareas de terminal y agentes de linea de comandos: Terminal-Bench 2.1 con 57.50 y Claw-Eval con 76.55.
- Tool calling y function calling, con adaptacion declarada a frameworks de agente como OpenCode, Claude Code, OpenClaw y Hermes.
- Planificacion multi-paso y ejecucion de cadenas de razonamiento largas, con coherencia de tarea bajo contextos extendidos.
- Busqueda profunda / investigacion (DeepresearchBII, 60.80).
- Ajuste fino para dominios verticales: clasificacion de intenciones, comprension de tablas, auditoria de contratos y QA sobre conocimiento.
- Capacidades multilingues: presentes de forma indirecta (SWE-bench Multilingual), pero no se detalla la lista de idiomas soportados.
- Vision, audio y otras modalidades: no disponibles.

## Casos de uso

- Agentes de ingenieria de software: con 75.00 en SWE-bench Verified y un contexto de 210K en la evaluacion, el modelo puede resolver issues en repositorios reales, navegar arboles de codigo extensos y aplicar parches. Encaja en pipelines tipo SWE-agent con ejecucion autonoma.
- Automatizacion de operaciones en terminal: los 57.50 de Terminal-Bench 2.1 y el timeout documentado de 24 horas sugieren idoneidad para agentes que ejecutan comandos, depuran errores y completan tareas de sistema sin supervision continua.
- Asistentes de codigo integrados en IDE y CI/CD: soporta tool calling y adaptacion a OpenCode y Claude Code, por lo que puede conectarse a herramientas de edicion, ejecucion de tests y revision de pull requests desde un endpoint compatible con OpenAI.
- Migracion y mantenimiento de codigo multilingue: con 66.00 en SWE-bench Multilingual, es util en bases de codigo que mezclan varios lenguajes, donde el contexto largo de 256K evita trocear el repositorio.
- Investigacion profunda automatizada: los 60.80 de DeepresearchBII lo posicionan para flujos de recopilacion de fuentes, sintesis y redaccion de informes con multiples iteraciones de consulta y verificacion.
- Atencion al cliente multi-turno: la ventana de 256K permite mantener historial, politicas y catalogo de producto en el mismo contexto, sin recuperacion externa agresiva, manteniendo coherencia conversacional.
- Analisis documental de contratos y QA sobre conocimiento corporativo: la model card indica ajuste ligero sobre datos propios para auditoria de contratos y QA basada en conocimiento, con soporte de LLaMA-Factory y MindFormers para el fine-tuning.
- Clasificacion de intenciones y comprension de tablas: tareas de dominio con coste bajo de adaptacion al ser un MoE con solo 4B activos por token, lo que reduce el coste de servir muchas peticiones cortas.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. La comparacion incluye Gemma4-26B-A4B y Qwen3.6-35B-A3B tal y como aparecen en la documentacion original:

| Benchmark | Xing4.0-29B-A4B | Gemma4-26B-A4B | Qwen3.6-35B-A3B |
|---|:---:|:---:|:---:|
| IFBench | 69.67 | 72.67 | 65.50 |
| AIME2026 | 90.00 | 88.30 | 92.70 |
| AA.LCR | 61.00 | 66.00 | 62.00 |
| Tau3-Bench | 64.63 | 58.90 | 67.20 |
| Claw-Eval | 76.55 | 71.49 | 74.54 |
| SWE-bench Verified | 75.00 | 53.00 | 76.00 |
| Terminal-Bench 2.1 | 57.50 | 30.00 | 51.50 |
| SWE-bench Multilingual | 66.00 | 51.00 | 67.20 |
| DeepresearchBII | 60.80 | 39.30 | 59.70 |

Condiciones de evaluacion declaradas: SWE-bench Verified y SWE-bench Multilingual con el arnes SWE-agent, temperatura 1.0, top_p 0.95, `repetition_penalty` 1.05 y ventana de 210K. Terminal-Bench 2.1 en `terminus-2` con temperatura 0.8, max_tokens 64K, timeout de 24 horas y media de 3 ejecuciones. Claw-Eval con el arnes oficial, temperatura 0.8, max_tokens 16384, contexto de 256K y media de 3 ejecuciones. Tau3-Bench con el arnes oficial de sierra-research, temperatura 0.8 y max_tokens 16384. El detalle completo de Tau3-Bench aparece truncado en la documentacion proporcionada.

## Requisitos de hardware

- VRAM estimada (estimacion propia a partir de los 31.215.031.088 parametros, no confirmada por el autor):
  - BF16/FP16: aproximadamente 62-66 GB solo para pesos, sin contar cache KV ni overhead. Coincide con el tamano del repo (62,4 GB).
  - FP8/INT8: en torno a 31-33 GB de pesos.
  - 4 bits: en torno a 16-18 GB de pesos.
- GPU recomendadas: el autor documenta despliegue en SGLang, vLLM y KTransformers, pero no publica una tabla de GPU validada. Para bf16 completo se necesita hardware de clase A100 80GB, H100 80GB o superior, o bien multiples GPU. No se confirma soporte especifico para RTX 4090.
- Cabe en GPU de consumo: unicamente en cuantizaciones de 4 bits, siempre segun estimacion propia y no verificada por el autor. En FP16 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM, SGLang, KTransformers y transformers. El autor proporciona un ejemplo de uso con API compatible con OpenAI.
- Ajuste fino: LLaMA-Factory y MindFormers.
- Latencia y throughput: no disponibles. La model card no publica cifras de tokens por segundo ni TTFT.

## Comparativa con modelos similares

Comparativa limitada a los datos publicados en la propia model card. No se dispone de especificaciones tecnicas independientes de los modelos de referencia mas alla de los resultados de benchmark.

| Modelo | Parametros | Activos | Contexto | SWE-bench Verified | Terminal-Bench 2.1 | Licencia |
|---|---|---|---|---|---|---|
| Xing4.0-29B-A4B | 29B (31,2B reales) | 4B | 256K (512K extensible) | 75.00 | 57.50 | Apache 2.0 |
| Gemma4-26B-A4B | 26B declarados | 4B | no disponible | 53.00 | 30.00 | no disponible |
| Qwen3.6-35B-A3B | 35B declarados | 3B | no disponible | 76.00 | 51.50 | no disponible |

En los benchmarks de agente y codigo publicados, Xing4.0-29B-A4B supera a Gemma4-26B-A4B en siete de las nueve pruebas y queda por delante de Qwen3.6-35B-A3B en Claw-Eval, Terminal-Bench 2.1 y DeepresearchBII, mientras que Qwen3.6-35B-A3B obtiene mejores resultados en SWE-bench Verified, Tau3-Bench, AIME2026 y SWE-bench Multilingual. Las cifras de estos modelos comparativos no se han verificado de forma independiente.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad. No hay informacion disponible al respecto.
- No se especifica la lista de idiomas soportados. Aunque existe un resultado en SWE-bench Multilingual, no implica cobertura conversacional multilingue amplia. Se recomienda validar el idioma objetivo antes de produccion.
- El detalle de la evaluacion de Tau3-Bench aparece truncado en la informacion disponible; no se puede confirmar la metodologia completa.
- La cifra de parametros declarada (29B) no coincide con la comprobacion real de safetensors (31.215.031.088 parametros). Conviene planificar el hardware con la cifra real.
- No se publican pesos cuantizados oficiales (GGUF, AWQ, GPTQ, FP8). Cualquier cuantizacion requerida tendra que generarla el usuario, con el riesgo de degradacion asociado.
- Requiere `trust_remote_code` probablemente, dado el tag `custom_code`; esto implica ejecutar codigo del repositorio y debe revisarse antes de desplegar.
- El repositorio tiene 32 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.
- El entrenamiento esta ligado al ecosistema Ascend/MindSpore; el soporte para aceleradores NVIDIA se canaliza a traves de vLLM y SGLang, pero no se detalla el grado de optimizacion en esas plataformas.
- La licencia Apache 2.0 permite uso comercial sin restricciones declaradas, pero no se incluye informacion sobre los datos de entrenamiento ni sobre posibles obligaciones derivadas de su origen.
- Para despliegue en produccion con contexto completo de 256K, el consumo de cache KV puede ser elevado aunque MLA lo reduzca; no hay cifras publicadas de memoria por secuencia.

## Enlaces

- Pagina del modelo en Hugging Face: https://huggingface.co/21g/Xing4.0-29B-A4B
- Repositorio GitHub del modelo: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio del predecesor TeleChat: https://github.com/Tele-AI/TeleChat3
- Paper referenciado (arxiv:2512.24157): https://arxiv.org/abs/2512.24157
- Paper referenciado (arxiv:2507.18013): https://arxiv.org/abs/2507.18013
- vLLM: https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
- KTransformers: https://github.com/kvcache-ai/ktransformers
- Arnes oficial de Claw-Eval: https://github.com/claw-eval/claw-eval
- Arnes oficial de Tau-Bench: https://github.com/sierra-research/tau-bench

Nota: los resultados de la busqueda web realizada no contienen informacion relacionada con este modelo; los enlaces devueltos corresponden a un prebiotico comercial y no guardan relacion con Xing4.0-29B-A4B.
