# Axion1-0/Axion-1.0-35B

## Resumen

Axion 1.0-35B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Axion1-0, presentado como un checkpoint de reproducción del modelo descrito en el artículo *Axion 1.0: Open Agent Foundation Models, Simplified* (arXiv:2611.03233). El modelo está disenado especificamente para razonamiento cientifico, busqueda de informacion y resolucion de problemas asistida por herramientas, lo que lo posiciona como un modelo base orientado a agentes mas que como un chatbot generalista.

Con aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, emplea una arquitectura MoE que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. El checkpoint se distribuye en BF16 con pesos en safetensors y licencia Apache 2.0, lo que facilita su uso comercial y su integracion en pipelines existentes.

Su relevancia actual radica en que reproduce, con resultados muy cercanos, las cifras del modelo original en benchmarks de razonamiento cientifico de frontera (HLE, FrontierScience, SEAL-0, HiPhO), y lo hace con un modelo de 35B totales que puede servirse con vLLM y un contexto de hasta 131.072 tokens. Es, por tanto, una alternativa abierta a modelos propietarios de gran escala en tareas de investigacion y agentes con uso de herramientas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), familia `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | ~3B |
| Longitud de contexto | 131.072 tokens (segun configuracion de servicio en la model card) |
| Tipos de cuantizacion | BF16 (pesos publicados); no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas de mezcla de expertos (MoE), identificada en los metadatos como `qwen3_5_moe`, con aproximadamente 35B parametros totales y unos 3B activos por token. Los pesos se publican en precision BF16 y el repositorio ocupa 70,2 GB. La model card no detalla el numero de expertos, la estrategia de enrutamiento ni la composicion exacta del dataset de preentrenamiento.

El entrenamiento posterior sigue una receta de tres etapas descrita en el paper: primero, ajuste supervisado (SFT) sobre problemas cientificos autocontenidos y de dificultad alta, construidos con retroalimentacion consciente del modelo; segundo, SFT sobre tareas verificables que requieren informacion externa y uso de herramientas ("learn to investigate"); y tercero, aprendizaje por refuerzo sobre trayectorias de agente para refinar el razonamiento y la interaccion con herramientas. El conjunto SFT consta de aproximadamente 18.000 ejemplos. No se especifica en la informacion disponible si se aplicaron tecnicas como DPO, decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento cientifico de nivel avanzado, con enfasis en problemas de fisica, matematicas y dominios de investigacion.
- Razonamiento multi-paso y modo de "thinking" (el ejemplo de servicio usa `--reasoning-parser qwen3`).
- Uso de herramientas y function calling, con soporte de eleccion automatica de herramienta (`--enable-auto-tool-choice`) y parser `qwen3_coder`.
- Comportamiento agentico: el modelo esta entrenado con RL sobre trayectorias de agente, incluyendo busqueda de informacion y verificacion.
- Capacidad multimodal de entrada image-text-to-text segun los tags del repositorio (no se detalla en la model card).
- Soporte de conversacion multi-turno y endpoint compatible con la API de OpenAI.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Razonamiento cientifico asistido: el modelo puede resolver problemas de fisica y matematicas de nivel olimpiada o investigacion, apoyandose en su modo de razonamiento extendido y en la busqueda de informacion externa cuando el problema lo requiere.
- Agentes de investigacion automatizada: con tool calling y RL sobre trayectorias, puede orquestar busquedas, consultas a APIs y verificacion de resultados en pipelines de descubrimiento cientifico.
- Asistente de laboratorio y analisis de literatura: dado su contexto de 131.072 tokens, puede procesar articulos largos y extraer hipotesis o resumenes estructurados.
- Automatizacion de tareas de informacion ("information seeking"): integrado en un harness de herramientas, puede localizar, contrastar y sintetizar datos de multiples fuentes.
- Evaluacion y reproduccion de experimentos: al ser un checkpoint de reproduccion con resultados publicados, sirve para validar pipelines de evaluacion agentica (HLE, SEAL-0, FrontierScience).
- Backend de agentes en produccion: su licencia Apache 2.0 y su compatibilidad con vLLM y la API de OpenAI permiten desplegarlo como servicio interno para agentes corporativos con uso de herramientas.
- Generacion de codigo en pipelines cientificos: el parser `qwen3_coder` y el soporte de tool calling facilitan la generacion y ejecucion de codigo para experimentos.

## Benchmarks y rendimiento

Resultados en porcentaje (mayor es mejor), comparando el checkpoint de reproduccion con el modelo del paper y alternativas:

| Modelo | HLE | BMB | SEAL-0 | HiPhO | FS Olympiad | FS Research |
|---|---:|---:|---:|---:|---:|---:|
| Axion 1.0-35B (Paper) | 52,2 | 35,3 | 62,2 | 45,7 | 86,0 | 56,7 |
| **Axion 1.0-35B (Reproduction)** | **52,8** | **35,3** | **60,4** | **45,9** | **85,0** | **55,0** |
| Agents-A1 | 47,6 | — | 56,4 | 46,4 | 79,0 | 40,0 |
| Kimi-K2.6 | 54,0 | — | 50,5 | 41,1 | 73,0 | 17,9 |
| DeepSeek-V4-Pro (Preview) | 48,2 | — | 55,0 | 38,7 | 76,0 | 13,3 |
| Apodex 1.1 (ReAct) | 53,2 | 23,5 | — | — | — | 55,0 |
| Apodex 1.1 (Agent Team) | 56,1 | 35,3 | — | — | — | 63,3 |
| GPT-5.5 | 52,2 | — | 42,3 | 43,3 | 78,0 | 26,7 |
| GPT-5.6 Sol | — | 47,1 | 53,2 | 42,9 | 79,0 | 63,3 |
| GPT-6 Astra | 57,2 | — | — | — | — | — |
| Muse-Spark-1.0 | 58,0 | — | — | — | — | 38,0 |
| Gemini 3.1 Pro | 51,4 | 35,3 | 53,2 | 38,5 | 85,0 | 26,7 |
| Claude Opus 5 | 63,6 | 49,4 | — | — | — | — |
| Claude Fable 5 | 63,8 | 46,1 | — | — | — | — |

HLE: Humanity's Last Exam (conjunto completo). BMB: subconjunto BioMysteryBench de dificultad humana. FS: FrontierScience. El guion indica resultado no reportado.

## Requisitos de hardware

- VRAM estimada en BF16: ~70 GB solo para pesos, mas memoria para KV cache y activaciones; con contexto de 131.072 tokens el consumo adicional es significativo.
- El ejemplo oficial de servicio usa `--tensor-parallel-size 8` con BF16, es decir, 8 GPUs (por ejemplo, A100 80GB, H100 80GB o equivalentes).
- No cabe en una GPU de consumo (RTX 4090, 24 GB) en BF16; requeriria cuantizacion, que no se documenta oficialmente.
- Despliegue recomendado: vLLM con API compatible con OpenAI, parsers `qwen3` y `qwen3_coder`, y `--max-model-len 131072`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HLE | FS Research | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Axion 1.0-35B (Reproduction) | ~35B totales / ~3B activos | 131.072 | 52,8 | 55,0 | Apache 2.0 | Pesos abiertos en HF |
| Apodex 1.1 (Agent Team) | no disponible | no disponible | 56,1 | 63,3 | no disponible | no disponible |
| DeepSeek-V4-Pro (Preview) | no disponible | no disponible | 48,2 | 13,3 | no disponible | no disponible |
| Kimi-K2.6 | no disponible | no disponible | 54,0 | 17,9 | no disponible | no disponible |
| Claude Opus 5 | no disponible | no disponible | 63,6 | — | Propietaria | API |

Axion 1.0-35B destaca por ofrecer resultados cercanos a modelos propietarios de gran escala en razonamiento cientifico con solo ~3B parametros activos y licencia Apache 2.0, aunque queda por detras de Claude Opus 5/Fable 5 y Muse-Spark-1.0 en HLE y de Apodex 1.1 (Agent Team) en FS Research.

## Limitaciones y advertencias

- Es un checkpoint de reproduccion, no el modelo original; puede haber diferencias menores respecto al paper (por ejemplo, SEAL-0 60,4 frente a 62,2).
- No se documentan los idiomas soportados; el rendimiento fuera del ingles no esta garantizado.
- Riesgo de alucinacion inherente a modelos de lenguaje, especialmente en tareas cientificas donde el modelo puede generar referencias o resultados plausibles pero incorrectos.
- No se publican detalles sobre sesgos, composicion del dataset ni filtros de seguridad.
- El uso en produccion requiere un harness externo que ejecute las llamadas a herramientas; el modelo por si solo no ejecuta acciones.
- El despliegue en BF16 exige multiples GPUs de datacenter; no hay cuantizaciones oficiales para hardware de consumo.
- Aunque la licencia es Apache 2.0, conviene revisar los terminos del dataset de entrenamiento (`Axion1-0/axion-training-data`) para usos derivados.

## Enlaces

- Hugging Face: https://huggingface.co/Axion1-0/Axion-1.0-35B
- Paper: https://arxiv.org/abs/2611.03233
- Proyecto: https://axion1-0.github.io/
- Codigo: https://github.com/bytedance/axion1_0
- Guia de inferencia: https://github.com/bytedance/axion1_0/blob/main/axion/evaluation/README.md#serve-a-checkpoint
- Dataset de entrenamiento: https://huggingface.co/datasets/Axion1-0/axion-training-data
- Licencia: https://huggingface.co/Axion1-0/Axion-1.0-35B/blob/main/LICENSE
