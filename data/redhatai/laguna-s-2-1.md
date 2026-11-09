# RedHatAI/Laguna-S-2.1

## Resumen

Laguna S 2.1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Poolside y distribuido por RedHatAI, disenado especificamente para tareas de codificacion agentica y trabajo de largo horizonte. Con 117.561.977.600 parametros totales (118B) y aproximadamente 8B parametros activos por token, se posiciona en la serie Laguna entre el modelo XS 2.1 (33B-A3B) y el M.1 (225B-A23B), compartiendo la receta arquitectonica de la familia.

El modelo resuelve el problema de la automatizacion de tareas de ingenieria de software complejas que requieren razonamiento multi-paso, uso de herramientas y contexto extenso. Su ventana de contexto de 1.048.576 tokens (1M) y su soporte nativo de razonamiento intercalado entre llamadas a herramientas lo hacen especialmente adecuado para agentes autonomos que operan sobre bases de codigo grandes.

La relevancia actual del modelo radica en su combinacion de eficiencia (solo 8B parametros activos por token) con un rendimiento competitivo en benchmarks de codificacion agentica, ademas de su licencia OpenMDW-1.1 que permite uso comercial libre. Se distribuye con variantes cuantizadas (FP8, NVFP4, INT4, GGUF) y un modelo draft para decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atencion grouped-query y atencion intercalada full/sliding-window |
| Parametros totales | 117.561.977.600 (118B) |
| Parametros activos | ~8B por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | BF16, FP8, NVFP4, INT4, GGUF |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (BF16); GGUF disponible en variante separada |

## Arquitectura y entrenamiento

Laguna S 2.1 emplea una arquitectura transformer MoE con 48 capas organizadas en una proporcion 1:3 de atencion global a sliding-window (12 capas de atencion global, 36 capas de sliding-window con ventana de 512 tokens). El mecanismo de enrutamiento es token-choice con softplus gating sobre 256 expertos enrutados (top-10) mas un experto compartido. La atencion es grouped-query con 8 cabezas KV, dimension de cabeza 128 y softplus output gating por cabeza, con escalas rotatorias especificas por tipo de capa. El vocabulario es de 100.352 tokens, correspondiente al tokenizer de la familia Laguna.

El modelo incluye soporte nativo de razonamiento con pensamiento intercalado entre llamadas a herramientas, controlable por peticion mediante el parametro `enable_thinking`. Dispone de un modelo draft DFlash entrenado para decodificacion especulativa que reduce la latencia de servicio. No se han publicado en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento intercalado (`enable_thinking`) y pensamiento preservado.
- Codificacion agentica: resolucion de tareas de ingenieria de software multi-paso sobre bases de codigo.
- Tool calling / function calling nativo, con parser `poolside_v1` y soporte de `--enable-auto-tool-choice` en vLLM.
- Razonamiento multi-paso con preservacion de contexto entre llamadas a herramientas.
- Contexto largo de 1M tokens para trabajar con repositorios y documentos extensos.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Modalidad texto-a-texto exclusivamente (sin vision ni audio).
- Decodificacion especulativa mediante modelo draft DFlash.

## Casos de uso

- Agentes de codificacion autonoma: el modelo puede resolver issues de repositorios reales ejecutando comandos, editando ficheros y validando cambios, como demuestra su 78,5% en SWE-bench Multilingual y 70,2% en Terminal-Bench 2.1.
- Automatizacion de tareas de terminal y DevOps: con 70,2% en Terminal-Bench 2.1, es adecuado para agentes que operan sobre entornos de linea de comandos, ejecutan scripts y gestionan infraestructura.
- Revision y comprension de bases de codigo grandes: su contexto de 1M tokens permite cargar repositorios completos y responder preguntas sobre ellos (46,2% en SWE Atlas Codebase QnA).
- Integracion en pipelines de CI/CD: el soporte de tool calling y los parsers de vLLM/SGLang permiten integrarlo como agente que interpreta fallos de build y propone correcciones.
- Asistentes de desarrollo en IDE: con decodificacion especulativa DFlash y variantes cuantizadas, puede servirse con baja latencia para autocompletado y refactorizacion asistida.
- Orquestacion de herramientas empresariales: el 49,7% en Toolathlon Verified indica capacidad para encadenar llamadas a APIs y herramientas externas en flujos multi-paso.
- Investigacion en agentes: la publicacion de trayectorias de evaluacion en trajectories.poolside.ai facilita la reproducibilidad y el estudio de comportamiento agentico.

## Benchmarks y rendimiento

| Modelo | Tamano | Terminal-Bench 2.1 | SWE-bench Multilingual | SWE-Bench Pro | DeepSWE | SWE Atlas (Codebase QnA) | Toolathlon Verified |
|---|---|---|---|---|---|---|---|
| **Laguna S 2.1** | 118B-A8B | **70,2%** | **78,5%** | **59,4%** | **40,4%** | **46,2%** | **49,7%** |
| Tencent Hy3 | 295B-A21B | 71,7% | 75,8% | 57,9% | - | - | - |
| Inkling | 975B-A41B | 63,8% | - | 54,3% | - | - | 45,5%* |
| Nemotron 3 Ultra | 550B-A55B | 56,4% | 67,7% | - | - | - | 34,3%* |
| DeepSeek-V4-Pro Max | 1.6T-A49B | 64,0%* | 76,2% | 55,4% | 9,0%* | 27,2%* | 55,9%* |
| Kimi K3 | 2800B-A50B | 88,3% | - | - | 69% | - | - |
| Qwen 3.7 Max | - | 74,5%* | 78,3% | 60,6% | - | - | - |
| Muse Spark 1.1 | - | 80% | - | 61,5% | 53,3% | 42,2%* | 75,6% |
| Claude Fable 5 | - | 88% | - | 80,3% | 70% | - | - |

Benchmarks a fecha de 21 de julio de 2026. Los valores marcados con * son reportados por terceros (Artificial Analysis para Terminal-Bench 2.1 y DeepSWE; leaderboard oficial de Scale AI para SWE Atlas; leaderboard oficial de Toolathlon Verified).

## Requisitos de hardware

- VRAM estimada para BF16: aproximadamente 236 GB de pesos, requiriendo multiples GPU.
- Variantes cuantizadas (FP8, NVFP4, INT4, GGUF) reducen sustancialmente los requisitos, aunque no se especifican cifras exactas en la informacion disponible.
- GPU recomendadas: configuracion multi-GPU con tensor parallelism de 4 (segun los ejemplos oficiales de vLLM y SGLang); GPU de clase A100/H100 para BF16.
- No cabe en una GPU consumer individual en BF16; las variantes GGUF/INT4 podrian permitir despliegue en configuraciones consumer de gama alta, sin datos confirmados.
- Opciones de despliegue: vLLM, SGLang, Transformers, TRT-LLM y llama.cpp (mediante fork de poolside, rama `laguna`, con GGUF).
- Decodificacion especulativa opcional con DFlash (`num_speculative_tokens: 7`, metodo `dflash`) para reducir latencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | SWE-bench Multilingual | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Laguna S 2.1 | 118B | ~8B | 1M | 78,5% | OpenMDW-1.1 (comercial permitido) | Hugging Face, OpenRouter, Vercel AI Gateway |
| Tencent Hy3 | 295B | 21B | no disponible | 75,8% | no disponible | no disponible |
| Qwen 3.7 Max | no disponible | no disponible | no disponible | 78,3% | no disponible | no disponible |
| DeepSeek-V4-Pro Max | 1.6T | 49B | no disponible | 76,2% | no disponible | no disponible |

Laguna S 2.1 ofrece un rendimiento en SWE-bench Multilingual superior al de modelos significativamente mas grandes (Tencent Hy3, DeepSeek-V4-Pro Max) con solo 8B parametros activos, lo que lo hace especialmente atractivo en terminos de coste de inferencia.

## Limitaciones y advertencias

- Modalidad exclusivamente texto: no soporta vision ni audio.
- Idiomas soportados no documentados en la informacion disponible; el rendimiento fuera del ingles no esta verificado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de codificacion donde puede generar APIs o funciones inexistentes.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- El checkpoint BF16 requiere infraestructura multi-GPU (~236 GB), lo que limita el despliegue en entornos con recursos reducidos.
- Aunque la licencia OpenMDW-1.1 permite uso comercial, se recomienda revisar los terminos completos en el enlace de licencia.
- El uso de llama.cpp requiere el fork especifico de poolside (rama `laguna`), no la version upstream.
- Los parsers de razonamiento y tool calling difieren entre motores (vLLM usa `poolside_v1`; TRT-LLM usa `laguna`), lo que puede complicar la portabilidad.
- El modelo requiere `trust-remote-code` en SGLang y TRT-LLM, con el riesgo de seguridad asociado.

## Enlaces

- Hugging Face: https://huggingface.co/RedHatAI/Laguna-S-2.1
- Modelo original: https://huggingface.co/poolside/Laguna-S-2.1
- Blog de lanzamiento: https://poolside.ai/blog/introducing-laguna-s-2-1
- OpenRouter: https://openrouter.ai/poolside/laguna-s-2.1
- Vercel AI Gateway: https://vercel.com/ai-gateway/models/laguna-s-2.1
- Modelo draft DFlash: https://huggingface.co/poolside/Laguna-S-2.1-DFlash
- Variante FP8: https://huggingface.co/poolside/Laguna-S-2.1-FP8
- Variante NVFP4: https://huggingface.co/poolside/Laguna-S-2.1-NVFP4
- Variante INT4: https://huggingface.co/poolside/Laguna-S-2.1-INT4
- Variante GGUF: https://huggingface.co/poolside/Laguna-S-2.1-GGUF
- Modelo XS 2.1: https://huggingface.co/poolside/Laguna-XS-2.1
- Licencia: https://huggingface.co/poolside/Laguna-S-2.1/blob/main/LICENSE.md
- OpenMDW: https://openmdw.ai/
- Trayectorias de evaluacion: https://trajectories.poolside.ai
- Fork de llama.cpp: https://github.com/p (URL truncada en la informacion disponible)
