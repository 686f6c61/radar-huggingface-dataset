# RedHatAI/Laguna-S-2.1-FP8

## Resumen

Laguna S 2.1-FP8 es una version cuantizada en FP8 del modelo poolside/Laguna-S-2.1, publicada por RedHatAI dentro del ecosistema de despliegue de vLLM. Se trata de un modelo de mezcla de expertos (MoE) de 117.561.977.600 parametros totales con 8.500 millones de parametros activos por token, disenado especificamente para tareas de codificacion agentica y trabajo de horizonte largo ejecutado en maquina local. La ventana de contexto nativa alcanza 1.048.576 tokens (1M), lo que lo situa en la gama alta de contexto para modelos abiertos.

La arquitectura combina atencion de ventana deslizante (SWA) con atencion global en proporcion 3:1 sobre 48 capas (36 con SWA de 512 tokens y 12 globales), con gating softplus y escalas rotatorias por capa. Incorpora 256 expertos mas un experto compartido, y cuantiza tanto los pesos como la cache KV a FP8, lo que reduce de forma notable el consumo de memoria por token en contextos largos.

Su relevancia actual radica en que permite ejecutar un modelo de 117.6B parametros con calidad cercana a modelos mucho mayores en tareas de ingenieria de software, gracias a los 8.5B parametros activos y a un checkpoint FP8 de aproximadamente 121 GB. La licencia OpenMDW-1.1 autoriza uso comercial y no comercial, y su integracion esta soportada en vLLM, SGLang, Transformers, TRT-LLM, Ollama y llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion mixta (sliding window + global), gating softplus y escalas rotatorias por capa |
| Parametros totales | 117.561.977.600 (117.6B) |
| Parametros activos | 8.5B por token |
| Longitud de contexto | 1.048.576 tokens (configurable a 262.144 mediante `config.json`) |
| Tipos de cuantizacion | FP8 en pesos y cache KV (checkpoint publicado); el modelo base dispone tambien de BF16 y Q4_K_M para llama.cpp |
| Idiomas soportados | no disponible (la model card no detalla el desglose de idiomas) |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (repo de 131,3 GB) |
| Numero de capas | 48 (12 globales, 36 de sliding window) |
| Ventana deslizante | 512 tokens |
| Expertos | 256 expertos enrutados mas 1 experto compartido |
| Modalidad | texto a texto |
| Optimizador de entrenamiento | Muon |
| Libreria declarada | vLLM |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de mezcla de expertos con 256 expertos enrutados y un experto compartido, sobre 48 capas de transformer. La innovacion estructural principal es la distribucion mixta de atencion: 36 capas utilizan sliding window attention con una ventana de 512 tokens, mientras que 12 capas mantienen atencion global. Esta combinacion, junto con el uso de softplus gating y escalas rotatorias especificas por capa, permite reducir el coste de la cache KV y acelerar la inferencia sin renunciar a la propagacion de informacion a larga distancia en las capas globales.

El proceso de entrenamiento abarca etapas de pre-entrenamiento, post-entrenamiento y aprendizaje por refuerzo, utilizando el optimizador Muon. Incluye una fase de extension de contexto largo que llega hasta 1.048.576 tokens, y la calibracion de la cuantizacion FP8 se realizo directamente sobre la configuracion de 1M de contexto. La version aqui descrita corresponde a un checkpoint actualizado (agosto de 2026) que sustituye a una version anterior del mismo repositorio, con cambios en los pesos y no solo en la configuracion. El modelo soporta razonamiento nativo intercalado entre llamadas a herramientas, con posibilidad de activar o desactivar el modo de pensamiento por peticion.

## Capacidades

- Generacion de texto y conversacion multi-turno con contexto de hasta 1.048.576 tokens.
- Razonamiento nativo con pensamiento intercalado (interleaved thinking) y preservacion del mismo a lo largo de varios pasos.
- Codificacion agentica: resolucion de tareas de ingenieria de software sobre repositorios reales, incluyendo terminal y edicion de ficheros.
- Soporte de tool calling y function calling, con uso verificado en entornos de herramientas (Toolathlon).
- Ejecucion de flujos de agente multi-paso de horizonte largo, con pensamiento entre llamadas a herramientas.
- Capacidad de Q&A sobre bases de codigo completas (SWE Atlas Codebase QnA).
- Control por peticion del modo de razonamiento (activar o desactivar thinking).
- Decodificacion especulativa opcional mediante el modelo borrador poolside/Laguna-S-2.1-DFlash-FP8.
- Compatibilidad con despliegue local en vLLM, SGLang, Transformers, TRT-LLM, Ollama y llama.cpp.
- Capacidades multilingues: no disponible (no se detalla el desglose de idiomas en la informacion proporcionada).

## Casos de uso

- Agentes de codificacion autonomos en local: el modelo puede operar sobre un repositorio completo dentro de los 1M tokens de contexto, planificar cambios y ejecutar comandos en terminal, lo que lo hace adecuado para entornos de desarrollo sin conexion a servicios en la nube.
- Resolucion automatizada de incidencias de software: con un 59.4% en SWE-Bench Pro y 78.5% en SWE-bench Multilingual, es apropiado para pipelines que reciben un issue y generan un parche verificable.
- Asistente de Q&A sobre bases de codigo grandes: la ventana de 1M tokens y el rendimiento de 46.2% en SWE Atlas permiten indexar y consultar repositorios extensos sin fragmentacion agresiva.
- Integracion en CI/CD con tool calling: el modelo puede invocarse desde pipelines para revisar pull requests, ejecutar pruebas y proponer correcciones, apoyandose en el soporte de function calling.
- Automatizacion de tareas de terminal y DevOps: la puntuacion de 70.2% en Terminal-Bench 2.1 indica aptitud para flujos de shell, gestion de entornos y diagnostico de sistemas mediante agentes.
- Despliegue en estaciones de trabajo con GPU unica o doble: el checkpoint FP8 de aproximadamente 121 GB permite servir el modelo en hardware de gama alta de escritorio, habilitando asistentes privados sin enviar codigo a terceros.
- Orquestacion de agentes multi-herramienta: con soporte de pensamiento intercalado y 49.7% en Toolathlon Verified, es utilizable en sistemas que encadenan busquedas, APIs y edicion de ficheros en secuencia.
- Generacion de codigo asistida en produccion: mediante vLLM 0.25.0 o posterior y decodificacion especulativa con el modelo DFlash, se puede desplegar como servicio interno con latencia reducida.

## Benchmarks y rendimiento

| Modelo | Tamano | Terminal-Bench 2.1 | SWE-bench Multilingual | SWE-Bench Pro (Public Dataset) | DeepSWE | SWE Atlas (Codebase QnA) | Toolathlon Verified |
|---|---|---|---|---|---|---|---|
| **Laguna S 2.1** | 118B-A8B | **70.2%** | **78.5%** | **59.4%** | **40.4%** | **46.2%** | **49.7%** |
| Tencent Hy3 | 295B-A21B | 71.7% | 75.8% | 57.9% | - | - | - |
| Inkling | 975B-A41B | 63.8% | - | 54.3% | - | - | 45.5%* |
| Nemotron 3 Ultra | 550B-A55B | 56.4% | 67.7% | - | - | - | 34.3%* |
| DeepSeek-V4-Pro Max | 1.6T-A49B | 64.0%* | 76.2% | 55.4% | 9.0%* | 27.2%* | 55.9%* |
| Kimi K3 | 2800B-A50B | 88.3% | - | - | 69% | - | - |
| Qwen 3.7 Max | - | 74.5%* | 78.3% | 60.6% | - | - | - |
| Muse Spark 1.1 | - | 80% | - | 61.5% | 53.3% | 42.2%* | 75.6% |
| Claude Fable 5 | - | 88% | - | 80.3% | 70% | - | - |

Datos de referencia con fecha 21 de julio de 2026, segun la model card del autor. Los guiones indican benchmarks no evaluados; los valores marcados con asterisco proceden de terceros (Artificial Analysis para Terminal-Bench 2.1 y DeepSWE, el leaderboard oficial de Scale AI para SWE Atlas y el leaderboard oficial de Toolathlon Verified). No se han publicado resultados de MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint FP8 ocupa aproximadamente 121 GB de pesos, por lo que se necesita al menos ese volumen mas el espacio de cache KV y activaciones. Para FP8 con cache KV en FP8 y contexto largo, el margen adicional puede ser considerable.
- GPU recomendadas: configuraciones multi-GPU de centro de datos como H100 80 GB (2 unidades para los pesos FP8), H200 o B200; en gama profesional, A100 80 GB en configuraciones de 2 a 4 unidades.
- Cabe en GPU de consumo: no en una unica GPU de consumo. El repo total es de 131,3 GB y los pesos FP8 de unos 121 GB, muy por encima de los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090. Como referencia, la variante Q4_K_M disponible para llama.cpp reduce el peso lo suficiente para planteamientos locales mas modestos, aunque la model card solo garantiza BF16 y Q4_K_M en llama.cpp.
- Opciones de despliegue: vLLM (requiere version 0.25.0 o posterior y definir `VLLM_BLOCKSCALE_FP8_GEMM_FLASHINFER=0`), SGLang, Transformers, TRT-LLM (con soporte del equipo de NVIDIA), Ollama con soporte MLX y llama.cpp (solo BF16 y Q4_K_M).
- Decodificacion especulativa: compatible con el modelo borrador poolside/Laguna-S-2.1-DFlash-FP8 mediante `--speculative-config` en vLLM.
- Latencia y throughput estimados: no disponible. La model card no publica cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Terminal-Bench 2.1 | SWE-bench Multilingual | Licencia | Disponibilidad local |
|---|---|---|---|---|---|---|
| Laguna S 2.1-FP8 | 118B totales, 8.5B activos | 1.048.576 tokens | 70,2% | 78,5% | openmdw-1.1 | Si (FP8, BF16, Q4_K_M) |
| Tencent Hy3 | 295B totales, 21B activos | no disponible | 71,7% | 75,8% | no disponible | no disponible |
| Nemotron 3 Ultra | 550B totales, 55B activos | no disponible | 56,4% | 67,7% | no disponible | no disponible |
| DeepSeek-V4-Pro Max | 1,6T totales, 49B activos | no disponible | 64,0% | 76,2% | no disponible | no disponible |

La ventaja estructural de Laguna S 2.1 frente a estas alternativas es la relacion entre parametros activos y rendimiento: con 8.5B activos queda por delante de modelos con 21B, 49B y 55B activos en SWE-bench Multilingual y SWE-Bench Pro, y compite de cerca con Tencent Hy3 en Terminal-Bench 2.1 pese a tener menos de la mitad de parametros totales. Los datos de contexto y licencia de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion de calidad en contexto largo: la propia model card advierte de que en contextos muy extensos puede experimentarse cierta perdida de calidad.
- Riesgo de alucinacion: no se documenta una tasa especifica, pero al tratarse de un modelo generativo orientado a codigo y agentes, las salidas deben verificarse antes de aplicarlas a produccion, especialmente en parches y comandos de terminal.
- Sesgos conocidos: no disponible. La model card no incluye una seccion de sesgos ni evaluaciones de seguridad.
- Idiomas soportados: no disponible. No se especifica el reparto de idiomas de entrenamiento, por lo que el rendimiento fuera del ingles no esta garantizado.
- Licencia: OpenMDW-1.1 permite uso y modificacion comercial y no comercial. El repositorio incluye un acceso con gating y una descripcion de tratamiento de datos personales que conviene revisar antes de usarlo.
- Cache KV en FP8: la cuantizacion de la cache introduce una perdida de precision adicional que puede afectar a tareas de recuperacion de informacion muy fina en contextos largos.
- Compatibilidad de despliegue: el checkpoint FP8 requiere vLLM 0.25.0 o superior y la variable `VLLM_BLOCKSCALE_FP8_GEMM_FLASHINFER=0`; en llama.cpp solo estan soportados BF16 y Q4_K_M, no el propio FP8.
- Sampling: los valores de `generation_config.json` son autoritativos, con `top_k 20` certificado en evaluacion. No conviene fijar temperatura o `top_p` alternativos sin validacion previa.
- Checkpoint actualizado: los pesos cambiaron respecto a versiones anteriores del repositorio, por lo que copias antiguas deben volver a descargarse para reproducir los resultados publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RedHatAI/Laguna-S-2.1-FP8
- Modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- Modelo borrador para decodificacion especulativa: https://huggingface.co/poolside/Laguna-S-2.1-DFlash-FP8
- Blog de lanzamiento: https://poolside.ai/blog/introducing-laguna-s-2-1
- Uso en OpenRouter: https://openrouter.ai/poolside/laguna-s-2.1
- Uso en Vercel AI Gateway: https://vercel.com/ai-gateway/models/laguna-s-2.1
- Receta de vLLM: https://recipes.vllm.ai/poolside/Laguna-S-2.1
- Ollama: https://ollama.com/laguna-s-2.1
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/25165
- Trayectorias de evaluacion: https://trajectories.poolside.ai
- Informacion sobre la licencia OpenMDW: https://openmdw.ai/
- Politica de privacidad de poolside: https://poolside.ai/legal/privacy
