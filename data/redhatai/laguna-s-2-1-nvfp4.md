# RedHatAI/Laguna-S-2.1-NVFP4

## Resumen

Laguna S 2.1-NVFP4 es una cuantizacion en NVFP4 (FP4 de NVIDIA con escalas por bloque) del modelo Laguna S 2.1 desarrollado por Poolside, publicada por RedHatAI. Se trata de un modelo de mezcla de expertos (MoE) de 117.600 millones de parametros totales con 8.500 millones de parametros activos por token, disenado especificamente para codificacion agentica y tareas de horizonte largo ejecutables en una maquina local. La cuantizacion reduce el peso de los pesos a aproximadamente 71 GB, lo que lo hace viable en configuraciones de una o dos GPU de gama alta.

Arquitectura transformer MoE con 48 capas, de las cuales 36 usan atencion de ventana deslizante (SWA) con compuerta por cabeza y 12 usan atencion global, en una proporcion 3:1. Incorpora cache KV cuantizada en FP8 y soporte nativo de razonamiento intercalado con llamadas a herramientas. La ventana de contexto nativa es de 1.048.576 tokens (1M), con posibilidad de recortarla a 262.144 tokens editando `config.json`.

Su relevancia actual radica en que ofrece rendimiento cercano a modelos mucho mayores (hasta 2,8 billones de parametros) en benchmarks de ingenieria de software y uso de terminal, con un peso que cabe en hardware de estacion de trabajo y bajo licencia OpenMDW-1.1, que permite uso comercial libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion mixta SWA/global (3:1), softplus gating con escalas rotatorias por capa |
| Parametros totales | 117.561.977.600 (117,6B) |
| Parametros activos | 8.500 millones (8,5B) por token |
| Longitud de contexto | 1.048.576 tokens (configurable a 262.144) |
| Tipos de cuantizacion | NVFP4 (FP4 con escalas por bloque); el modelo base admite BF16 y Q4_K_M en llama.cpp |
| Idiomas soportados | no disponible (la model card no detalla el conjunto de idiomas) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors con compressed-tensors (8-bit en metadatos del repo), libreria vllm |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 48 capas: 12 capas de atencion global y 36 capas de atencion de ventana deslizante con ventana de 512 tokens y compuerta por cabeza (per-head gating). Emplea softplus gating y escalas rotatorias (RoPE) por capa para permitir la disposicion mixta de atencion. Contiene 256 expertos mas un experto compartido. La cache KV esta cuantizada en FP8, lo que reduce el consumo de memoria por token y facilita el despliegue en contexto largo.

El entrenamiento incluyo fases de preentrenamiento, postentrenamiento y aprendizaje por refuerzo, con optimizador Muon. Los pesos son checkpoints nativos de 1M de contexto: el entrenamiento incluyo una etapa de extension de contexto hasta 1.048.576 tokens y la cuantizacion se calibro en esa configuracion. La model card advierte que esta es una release actualizada (agosto de 2026) que sustituye a la version anterior del repositorio: los pesos han cambiado, no solo la configuracion.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento intercalado entre llamadas a herramientas, activable o desactivable por peticion.
- Codificacion agentica: resolucion de tareas de ingenieria de software sobre repositorios reales, incluyendo SWE-bench Multilingual y SWE-Bench Pro.
- Uso de terminal y entornos de linea de comandos (Terminal-Bench 2.1).
- Llamadas a herramientas (tool calling / function calling) verificadas en Toolathlon Verified.
- Razonamiento multi-paso y trabajo de horizonte largo con preservacion del pensamiento.
- Preguntas y respuestas sobre bases de codigo grandes (SWE Atlas Codebase QnA).
- Capacidades multilingues en el ambito de codigo (SWE-bench Multilingual), aunque el conjunto de idiomas naturales no esta detallado.
- Solo texto: la modalidad es text-to-text, sin vision ni audio.

## Casos de uso

- Agente de codificacion autonomo en local: con 8,5B parametros activos y pesos NVFP4 de unos 71 GB, se puede servir en una estacion de trabajo con dos GPU de 48 GB y ejecutar tareas de reparacion de bugs y refactorizacion sobre repositorios completos gracias a su contexto de 1M tokens.
- Automatizacion de CI/CD con agentes: el soporte de tool calling y razonamiento intercalado permite integrarlo en pipelines que leen logs de fallo, consultan el repositorio y proponen parches verificables.
- Asistente de terminal: su rendimiento en Terminal-Bench 2.1 (70,2%) lo hace adecuado para agentes que operan shells, ejecutan comandos y depuran entornos.
- Preguntas y respuestas sobre bases de codigo extensas: con 1M de contexto puede indexar y razonar sobre monorepos completos sin trocear en exceso, útil para onboarding de desarrolladores y auditorias de codigo.
- Generacion de codigo en produccion con control de coste: al activar solo 8,5B parametros por token, el coste computacional por inferencia es mucho menor que el de un modelo denso de 117B, lo que abarata el despliegue en vLLM o TRT-LLM.
- Servicio de agentes con razonamiento conmutable: la posibilidad de activar o desactivar el pensamiento por peticion permite usar el modo rapido para tareas simples y el modo razonado para problemas complejos en la misma infraestructura.
- Despliegue en local con Ollama o llama.cpp: para equipos que no pueden enviar codigo a la nube, la version Q4_K_M o BF16 permite ejecucion en estaciones de trabajo con MLX.

## Benchmarks y rendimiento

| Modelo | Tamano | Terminal-Bench 2.1 | SWE-bench Multilingual | SWE-Bench Pro (Public) | DeepSWE | SWE Atlas (Codebase QnA) | Toolathlon Verified |
|---|---|---|---|---|---|---|---|
| **Laguna S 2.1** | 118B-A8B | **70,2%** | **78,5%** | **59,4%** | **40,4%** | **46,2%** | **49,7%** |
| Tencent Hy3 | 295B-A21B | 71,7% | 75,8% | 57,9% | - | - | - |
| Inkling | 975B-A41B | 63,8% | - | 54,3% | - | - | 45,5%* |
| Nemotron 3 Ultra | 550B-A55B | 56,4% | 67,7% | - | - | - | 34,3%* |
| DeepSeek-V4-Pro Max | 1,6T-A49B | 64,0%* | 76,2% | 55,4% | 9,0%* | 27,2%* | 55,9%* |
| Kimi K3 | 2800B-A50B | 88,3% | - | - | 69% | - | - |
| Qwen 3.7 Max | - | 74,5%* | 78,3% | 60,6% | - | - | - |
| Muse Spark 1.1 | - | 80% | - | 61,5% | 53,3% | 42,2%* | 75,6% |
| Claude Fable 5 | - | 88% | - | 80,3% | 70% | - | - |

Datos a 21 de julio de 2026. Los valores con asterisco son reportados por terceros (Artificial Analysis para Terminal-Bench 2.1 y DeepSWE, leaderboard oficial de Scale AI para SWE Atlas y leaderboard oficial de Toolathlon Verified). El guion indica que el modelo no fue evaluado en esa prueba.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos NVFP4 ocupan aproximadamente 71 GB; a ello hay que sumar la cache KV en FP8 y el overhead de activaciones.
- GPU recomendadas: configuraciones con dos GPU de 48 GB (por ejemplo, 2x L40S o 2x A6000) o una H100/H200 de 80 GB o superior; el modelo esta validado en RHOAI 3.5.1, RHAIIS 3.6.0-fast.2 y vLLM 0.28.0.
- Cabe en GPU de consumo: no en una sola GPU de consumo de 24 GB; la version Q4_K_M o BF16 via llama.cpp/Ollama con soporte MLX puede ejecutarse en estaciones de trabajo Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: vLLM 0.25.0 o superior (deteccion automatica de cuantizacion desde `quantization_config`), Transformers, TRT-LLM, Ollama y llama.cpp (solo BF16 y Q4_K_M). NVFP4 no funciona correctamente en SGLang segun la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada. La arquitectura SWA con cache KV FP8 reduce el coste de atencion en contexto largo, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Multilingual | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laguna S 2.1 | 118B-A8B | 1M | 78,5% | OpenMDW-1.1 (comercial permitido) | Hugging Face, Ollama, llama.cpp, OpenRouter, Vercel |
| Tencent Hy3 | 295B-A21B | no disponible | 75,8% | no disponible | no disponible |
| Qwen 3.7 Max | no disponible | no disponible | 78,3% | no disponible | no disponible |
| DeepSeek-V4-Pro Max | 1,6T-A49B | no disponible | 76,2% | no disponible | no disponible |

Frente a modelos de 295B a 1,6T de parametros, Laguna S 2.1 iguala o supera el rendimiento en SWE-bench Multilingual y SWE-Bench Pro con un orden de magnitud menos de parametros totales y solo 8,5B activos, lo que se traduce en un coste de inferencia muy inferior y viabilidad en hardware local. Queda por debajo de Kimi K3, Muse Spark 1.1 y Claude Fable 5 en Terminal-Bench 2.1.

## Limitaciones y advertencias

- La model card advierte de posible degradacion de calidad en contextos muy largos (cerca de 1M de tokens).
- Riesgo de alucinacion no cuantificado en la informacion disponible; como modelo generativo de codigo, puede producir APIs o funciones inexistentes.
- Sesgos conocidos: no disponibles en la informacion proporcionada; el conjunto de idiomas naturales soportados no esta documentado.
- La cuantizacion NVFP4 puede introducir perdida de precision respecto al checkpoint BF16 original; no se publican metricas de degradacion por cuantizacion.
- NVFP4 no funciona correctamente en SGLang; el despliegue debe hacerse en vLLM 0.25.0+, Transformers o TRT-LLM.
- Los valores de muestreo de `generation_config.json` son los certificados para evaluacion (top_k 20); la model card recomienda no fijar temperatura o top_p distintos.
- Licencia OpenMDW-1.1: permite uso y modificacion comercial y no comercial, pero conviene revisar el texto completo del LICENSE.md para obligaciones de atribucion.
- El repositorio tiene acceso restringido (gated) y requiere aceptar la politica de privacidad de Poolside.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Laguna-S-2.1-NVFP4
- Modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- Licencia: https://huggingface.co/poolside/Laguna-S-2.1-NVFP4/blob/main/LICENSE.md
- Blog de lanzamiento: https://poolside.ai/blog/introducing-laguna-s-2-1
- OpenRouter: https://openrouter.ai/poolside/laguna-s-2.1
- Vercel AI Gateway: https://vercel.com/ai-gateway/models/laguna-s-2.1
- Ollama: https://ollama.com/laguna-s-2.1
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/25165
- Receta de vLLM: https://recipes.vllm.ai/poolside/Laguna-S-2.1
- Trayectorias de evaluacion: https://trajectories.poolside.ai
- OpenMDW: https://openmdw.ai/
- Politica de privacidad de Poolside: https://poolside.ai/legal/privacy
