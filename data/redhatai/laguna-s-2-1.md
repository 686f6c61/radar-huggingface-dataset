# RedHatAI/Laguna-S-2.1

## Resumen

Laguna S 2.1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por Poolside y distribuido en el Hub de Hugging Face a través de la organización RedHatAI, que lo ha validado para su uso en el portfolio de productos de Red Hat AI (RHOAI 3.5.1, RHAIIS 3.6.0-fast.2 y vLLM 0.28.0). Con 117.561.977.600 parámetros totales según los pesos en safetensors (118B declarados) y aproximadamente 8B de parámetros activos por token, está disenado especificamente para coding agéntico y tareas de horizonte largo, como la resolucion de issues en repositorios reales o la interaccion con terminales y herramientas externas.

El modelo se situa en la serie Laguna entre Laguna XS 2.1 (33B-A3B) y Laguna M.1 (225B-A23B), compartiendo la receta de la familia: router token-choice con gating softplus sobre 256 expertos enrutados mas un experto compartido, grouped-query attention y una disposicion intercalada de atencion global y de ventana deslizante. Su ventana de contexto alcanza 1.048.576 tokens, lo que lo hace adecuado para razonamiento sobre codebases completas.

Es relevante ahora porque combina una licencia permisiva (OpenMDW-1.1, que permite uso comercial y modificacion), soporte nativo de tool calling y thinking intercalado entre llamadas a herramientas, y variantes cuantizadas oficiales (FP8, NVFP4, INT4, GGUF) que reducen los requisitos de despliegue frente a los aproximadamente 236 GB del checkpoint BF16. La model card solo declara modalidad texto-a-texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con router token-choice, gating softplus, 256 expertos enrutados (top-10) + 1 experto compartido; grouped-query attention con 8 KV heads y head dim 128 |
| Parametros totales | 117.561.977.600 (118B) |
| Parametros activos | ~8B por token |
| Longitud de contexto | 1.048.576 tokens |
| Tipos de cuantizacion | BF16 (original), FP8, NVFP4, INT4, GGUF |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (transformers, custom_code); GGUF disponible en repo separado |

## Arquitectura y entrenamiento

Laguna S 2.1 es un transformer MoE de 48 capas con una disposicion 1:3 de atencion global frente a sliding-window: 12 capas de atencion global y 36 capas de ventana deslizante de 512 tokens. Emplea grouped-query attention con 8 cabezas KV y dimension de cabeza 128, con gating softplus por cabeza en la salida y escalas rotatorias especificas por tipo de capa. El router es de tipo token-choice con gating softplus sobre 256 expertos enrutados (top-10 activos) mas un experto compartido, un diseno habitual en MoE modernos para equilibrar capacidad y coste de inferencia. El vocabulario es de 100.352 tokens, propio de la familia Laguna.

La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; esa informacion no esta disponible. Entre las innovaciones tecnicas documentadas destacan el soporte nativo de razonamiento intercalado entre llamadas a herramientas (con control por peticion mediante `enable_thinking`) y la decodificacion especulativa mediante un modelo draft entrenado, Laguna S 2.1-DFlash, que se integra en vLLM con `--speculative-config` y 7 tokens especulativos. La arquitectura `laguna` es compartida con Laguna XS 2.1, por lo que las integraciones de motores (vLLM, SGLang, Transformers, TRT-LLM, llama.cpp) son reutilizables.

## Capacidades

- Generacion de texto y razonamiento en modalidad texto-a-texto.
- Coding agéntico: resolucion de issues, edicion multi-archivo y trabajo sobre codebases de gran tamano gracias al contexto de 1M tokens.
- Tool calling / function calling nativo, con parser `poolside_v1` y soporte de `--enable-auto-tool-choice` en vLLM.
- Razonamiento multi-paso con thinking intercalado entre llamadas a herramientas y "preserved thinking".
- Control del modo de razonamiento por peticion mediante el parametro `enable_thinking`.
- Interaccion con terminales y entornos de linea de comandos (evaluado en Terminal-Bench 2.1).
- Preguntas y respuestas sobre codebases (evaluado en SWE Atlas Codebase QnA).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision y audio: no soportados (modalidad declarada texto-a-texto).

## Casos de uso

- Resolucion automatica de issues en repositorios: el modelo puede recibir el arbol del repositorio y los ficheros relevantes dentro de su ventana de 1M tokens, razonar sobre el fallo y generar un parche; sus resultados en SWE-bench Multilingual (78,5%) y SWE-Bench Pro (59,4%) lo respaldan para este escenario.
- Agente de terminal y automatizacion de DevOps: con tool calling nativo y thinking intercalado, puede encadenar comandos de shell, interpretar la salida y corregir el rumbo, tal como se evalua en Terminal-Bench 2.1 (70,2%).
- Asistente de codigo en IDE con contexto de proyecto completo: la ventana de 1.048.576 tokens permite incluir multiples modulos y documentacion sin truncar, reduciendo la perdida de contexto en refactorizaciones grandes.
- Migraciones y refactorizaciones multi-archivo: el modelo puede planificar y ejecutar cambios que afectan a decenas de ficheros, usando el modo thinking para descomponer la tarea y el tool calling para aplicar ediciones verificables.
- Preguntas y respuestas sobre codebases internas (onboarding tecnico): indexacion de la documentacion y el codigo en el contexto para responder consultas de arquitectura, con resultados de 46,2% en SWE Atlas Codebase QnA.
- Orquestacion de herramientas empresariales: integrable en pipelines con Toolathlon Verified (49,7%) para tareas que combinan APIs, busqueda y ejecucion de codigo.
- Despliegue en produccion con latencia reducida: las variantes FP8, NVFP4 e INT4 y el draft model DFlash permiten servir el modelo en infraestructura multi-GPU con decodificacion especulativa, manteniendo la licencia permisiva para uso comercial.

## Benchmarks y rendimiento

| Modelo | Tamano | Terminal-Bench 2.1 | SWE-bench Multilingual | SWE-Bench Pro (Public) | DeepSWE | SWE Atlas (Codebase QnA) | Toolathlon Verified |
|---|---|---|---|---|---|---|---|
| Laguna S 2.1 | 118B-A8B | 70,2% | 78,5% | 59,4% | 40,4% | 46,2% | 49,7% |
| Tencent Hy3 | 295B-A21B | 71,7% | 75,8% | 57,9% | - | - | - |
| Inkling | 975B-A41B | 63,8% | - | 54,3% | - | - | 45,5%* |
| Nemotron 3 Ultra | 550B-A55B | 56,4% | 67,7% | - | - | - | 34,3%* |
| DeepSeek-V4-Pro Max | 1.6T-A49B | 64,0%* | 76,2% | 55,4% | 9,0%* | 27,2%* | 55,9%* |
| Kimi K3 | 2800B-A50B | 88,3% | - | - | 69% | - | - |
| Qwen 3.7 Max | - | 74,5%* | 78,3% | 60,6% | - | - | - |
| Muse Spark 1.1 | - | 80% | - | 61,5% | 53,3% | 42,2%* | 75,6% |
| Claude Fable 5 | - | 88% | - | 80,3% | 70% | - | - |

Datos a fecha de 21 de julio de 2026 segun la model card. Los valores marcados con asterisco son reportados por terceros (Terminal-Bench 2.1 y DeepSWE via Artificial Analysis; SWE Atlas via el leaderboard oficial de Scale AI; Toolathlon Verified via su leaderboard oficial). El guion indica que el modelo no fue evaluado en esa prueba.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 236 GB de pesos, por lo que requiere multiples GPUs (la configuracion de referencia en vLLM usa `--tensor-parallel-size 4`).
- Variantes cuantizadas oficiales (FP8, NVFP4, INT4, GGUF) reducen sustancialmente el footprint, aunque la model card no publica cifras exactas de VRAM por variante.
- GPU recomendadas: no disponibles de forma explicita; por el volumen de pesos, el despliegue en BF16 exige GPUs de centro de datos tipo A100/H100 en configuracion multi-GPU. No se especifican modelos concretos en la informacion proporcionada.
- No cabe en GPUs de consumo en BF16. Las variantes INT4 y GGUF estan pensadas para reducir requisitos, pero no se confirma en la informacion disponible si caben en tarjetas consumer concretas.
- Opciones de despliegue documentadas: vLLM (con `--tool-call-parser poolside_v1`, `--reasoning-parser poolside_v1` y `--enable-auto-tool-choice`), SGLang (`--tp-size 4`, `--trust-remote-code`), TRT-LLM (`--tool_parser poolside_v1`, `--reasoning_parser laguna`) y llama.cpp mediante los GGUF de `poolside/Laguna-S-2.1-GGUF`. Tambien es compatible con Transformers.
- Decodificacion especulativa opcional con DFlash: `--speculative-config '{"model":"poolside/Laguna-S-2.1-DFlash","num_speculative_tokens":7,"method":"dflash"}'` para reducir latencia.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento destacado |
|---|---|---|---|---|---|
| Laguna S 2.1 | 118B totales / ~8B activos | 1.048.576 | OpenMDW-1.1 (permisiva, uso comercial) | Hugging Face (RedHatAI y poolside), OpenRouter, Vercel AI Gateway | SWE-bench Multilingual 78,5%; SWE-Bench Pro 59,4%; Terminal-Bench 2.1 70,2% |
| Laguna XS 2.1 | 33B-A3B | no disponible | Laguna (misma familia) | Hugging Face (poolside) | no disponible en la informacion proporcionada |
| Laguna M.1 | 225B-A23B | no disponible | Laguna (misma familia) | Hugging Face (poolside) | no disponible en la informacion proporcionada |
| Tencent Hy3 | 295B-A21B | no disponible | no disponible | no disponible | Terminal-Bench 2.1 71,7%; SWE-bench Multilingual 75,8%; SWE-Bench Pro 57,9% |

La comparativa se limita a los datos publicados en la model card. Laguna S 2.1 ofrece un rendimiento cercano a modelos mucho mayores (Tencent Hy3 con 295B-A21B, DeepSeek-V4-Pro Max con 1.6T-A49B) con un coste de inferencia menor al activar solo ~8B parametros por token, y supera a Nemotron 3 Ultra (550B-A55B) en todas las pruebas en las que ambos aparecen.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la model card; como en cualquier modelo generativo, las salidas de codigo y las llamadas a herramientas deben validarse antes de aplicarse en produccion.
- Idiomas soportados: no declarados; no hay garantia de calidad multilingue fuera de los idiomas cubiertos por los benchmarks (predominantemente ingles).
- El modelo esta orientado a texto; no soporta vision ni audio.
- Restricciones de licencia: OpenMDW-1.1 permite uso y modificacion comercial y no comercial, pero conviene revisar el texto completo de la licencia enlazado en la model card antes de redistribuir.
- El acceso al repositorio original de poolside esta sujeto a un formulario gated con tratamiento de datos personales; la copia de RedHatAI esta validada para RHOAI 3.5.1, RHAIIS 3.6.0-fast.2 y vLLM 0.28.0, y fuera de esas versiones el soporte no esta garantizado.
- El despliegue en BF16 exige infraestructura multi-GPU (~236 GB de pesos); las cifras de VRAM para variantes cuantizadas no se publican.
- Los benchmarks corresponden a la fecha del 21 de julio de 2026 y algunas puntuaciones proceden de terceros (marcadas con asterisco), por lo que la comparabilidad entre filas no es homogenea.
- El modelo requiere `trust_remote_code` en varios motores (SGLang, TRT-LLM) y usa codigo personalizado (`custom_code`), lo que implica revisar el codigo remoto antes de ejecutarlo.

## Enlaces

- Modelo en Hugging Face (RedHatAI): https://huggingface.co/RedHatAI/Laguna-S-2.1
- Modelo original en Hugging Face (poolside): https://huggingface.co/poolside/Laguna-S-2.1
- Blog de lanzamiento: https://poolside.ai/blog/introducing-laguna-s-2-1
- Laguna XS 2.1: https://huggingface.co/poolside/Laguna-XS-2.1
- Draft model DFlash: https://huggingface.co/poolside/Laguna-S-2.1-DFlash
- Variante FP8: https://huggingface.co/poolside/Laguna-S-2.1-FP8
- Variante NVFP4: https://huggingface.co/poolside/Laguna-S-2.1-NVFP4
- Variante INT4: https://huggingface.co/poolside/Laguna-S-2.1-INT4
- Variante GGUF: https://huggingface.co/poolside/Laguna-S-2.1-GGUF
- Licencia OpenMDW-1.1: https://huggingface.co/poolside/Laguna-S-2.1/blob/main/LICENSE.md
- Informacion sobre OpenMDW: https://openmdw.ai/
- Trayectorias de evaluacion: https://trajectories.poolside.ai
- Uso en OpenRouter: https://openrouter.ai/poolside/laguna-s-2.1
- Uso en Vercel AI Gateway: https://vercel.com/ai-gateway/models/laguna-s-2.1
- Organizacion RedHatAI en Hugging Face: https://huggingface.co/RedHatAI
