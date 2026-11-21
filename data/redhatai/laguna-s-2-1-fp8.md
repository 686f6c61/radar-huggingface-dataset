# RedHatAI/Laguna-S-2.1-FP8

## Resumen

Laguna S 2.1-FP8 es una cuantización en FP8 del modelo Laguna S 2.1, desarrollado por Poolside y empaquetado por Red Hat AI para su uso en el stack de producto de Red Hat AI (RHOAI y RHAIIS). Se trata de un modelo de mezcla de expertos (MoE) de 117.600 millones de parámetros totales con 8.500 millones de parámetros activos por token, especializado en codificación agéntica y trabajo de largo horizonte sobre una máquina local. Su arquitectura combina atención de ventana deslizante (SWA) con atención global en proporción 3:1 sobre 48 capas, lo que reduce el coste de caché KV y acelera la inferencia.

El modelo resuelve el problema de ejecutar tareas de ingeniería de software complejas y de múltiples pasos (edición de repositorios, uso de herramientas, razonamiento intercalado) en hardware controlado por el usuario, sin depender de APIs de terceros. Su ventana de contexto nativa alcanza 1.048.576 tokens, con la posibilidad de recortarla a 262.144 tokens modificando la configuración de RoPE. Incorpora soporte nativo de razonamiento con pensamiento intercalado entre llamadas a herramientas y permite activar o desactivar el modo de pensamiento por petición.

La relevancia actual del checkpoint FP8 radica en que reduce los pesos a aproximadamente 121 GB, lo que lo hace viable en estaciones de trabajo con varias GPU y en despliegues locales mediante Ollama o llama.cpp, manteniendo la licencia OpenMDW-1.1 que permite uso comercial y modificación sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención mixta SWA/global (3:1) y gating softplus por cabeza |
| Parametros totales | 117.561.977.600 (117,6B) |
| Parametros activos | 8.500 millones (8,5B) por token |
| Longitud de contexto | 1.048.576 tokens (configurable a 262.144) |
| Tipos de cuantizacion | FP8 (este checkpoint); BF16 y Q4_K_M disponibles en llama.cpp/Ollama |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (FP8), librería vLLM |

## Arquitectura y entrenamiento

Laguna S 2.1 es un transformer de mezcla de expertos con 48 capas, de las cuales 12 emplean atención global y 36 emplean atención de ventana deslizante con ventana de 512 tokens. Cada capa utiliza gating softplus con escalas rotatorias por capa (per-layer rotary scales), lo que permite combinar ambos tipos de atención en una proporción 3:1. El modelo cuenta con 256 expertos más un experto compartido. La caché KV está cuantizada a FP8, lo que reduce la memoria por token durante la inferencia. El optimizador empleado en el entrenamiento fue Muon.

El entrenamiento incluyó etapas de preentrenamiento, postentrenamiento y aprendizaje por refuerzo. La extensión de contexto largo se realizó de forma nativa hasta 1.048.576 tokens, y la cuantización FP8 se calibró con la configuración de 1M de contexto. El checkpoint de agosto de 2026 sustituye a una versión anterior con pesos distintos, por lo que es necesario volver a descargarlo si se tenía la copia previa. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre la composición del dataset.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento intercalado entre llamadas a herramientas.
- Capacidad de activar y desactivar el razonamiento por petición, con preservación del pensamiento previo.
- Codificación agéntica y trabajo de largo horizonte sobre repositorios y bases de código.
- Uso de herramientas (tool calling / function calling) integrado en el flujo de razonamiento.
- Razonamiento multi-paso y resolución de tareas complejas de ingeniería de software.
- Comprensión y respuesta sobre bases de código extensas (SWE Atlas Codebase QnA).
- Ejecución de tareas en terminal y entornos de línea de comandos (Terminal-Bench).
- Capacidades multilingües: no disponible en la información proporcionada.
- Modalidad exclusivamente texto a texto; no se documenta visión ni audio.

## Casos de uso

- Agente de codificación autónomo en local: el modelo puede editar repositorios completos y ejecutar ciclos de razonamiento intercalado con llamadas a herramientas, aprovechando sus 8,5B de parámetros activos para mantener latencia baja en una estación de trabajo.
- Resolución de incidencias en producción: con 1M de tokens de contexto, puede cargar trazas, logs y fragmentos extensos de código en una sola ventana para diagnosticar fallos en pipelines de CI/CD.
- Preguntas y respuestas sobre bases de código grandes: el benchmark SWE Atlas (Codebase QnA) mide esta capacidad; resulta adecuado para asistentes internos que respondan sobre arquitecturas de repositorios de gran tamaño.
- Automatización de tareas de terminal: su rendimiento en Terminal-Bench 2.1 (70,2%) lo hace apto para agentes que operan shells, scripts de despliegue y utilidades de sistema.
- Desarrollo multilingüe de software: con un 78,5% en SWE-bench Multilingual, puede emplearse en equipos que trabajan con varios lenguajes de programación dentro del mismo repositorio.
- Despliegue en infraestructura Red Hat: validado en RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2, encaja en plataformas OpenShift AI para servir modelos internos con vLLM 0.28.0.
- Evaluación y experimentación local: al estar disponible en Ollama y llama.cpp (BF16 y Q4_K_M), permite prototipar agentes de código en máquinas de desarrollo sin acceso a la nube.

## Benchmarks y rendimiento

| Modelo | Tamano | Terminal-Bench 2.1 | SWE-bench Multilingual | SWE-Bench Pro (Public Dataset) | DeepSWE | SWE Atlas (Codebase QnA) | Toolathlon Verified |
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

Datos a fecha de 21 de julio de 2026. Los valores marcados con asterisco proceden de terceros: Terminal-Bench 2.1 y DeepSWE vía Artificial Analysis, SWE Atlas vía el leaderboard oficial de Scale AI y Toolathlon Verified vía su leaderboard oficial. El guion indica que el modelo no fue evaluado en esa prueba.

## Requisitos de hardware

- Pesos FP8: aproximadamente 121 GB, según la model card.
- VRAM estimada para inferencia: los pesos FP8 ocupan unos 121 GB; a ello hay que sumar la caché KV en FP8 (reducida gracias a la SWA de 512 tokens en 36 de las 48 capas) y el margen para el runtime.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el tamaño de pesos exige un nodo multi-GPU para FP8.
- GPU de consumo: no disponible de forma directa para FP8; en llama.cpp y Ollama se ofrecen BF16 y Q4_K_M, siendo esta última la vía realista para hardware de consumo, aunque el tamaño del modelo sigue requiriendo agregar memoria de varias GPU.
- Opciones de despliegue: vLLM (requiere 0.25.0 o superior; validado con 0.28.0), SGLang, Transformers, TRT-LLM (soporte del equipo de NVIDIA), Ollama (con soporte MLX) y llama.cpp (solo BF16 y Q4_K_M).
- Validación empresarial: RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Terminal-Bench 2.1 | SWE-bench Multilingual |
|---|---|---|---|---|---|---|
| Laguna S 2.1-FP8 | 117,6B | 8,5B | 1.048.576 | OpenMDW-1.1 | 70,2% | 78,5% |
| Tencent Hy3 | 295B | 21B | no disponible | no disponible | 71,7% | 75,8% |
| Nemotron 3 Ultra | 550B | 55B | no disponible | no disponible | 56,4% | 67,7% |
| DeepSeek-V4-Pro Max | 1,6T | 49B | no disponible | no disponible | 64,0%* | 76,2% |

Laguna S 2.1 destaca por ofrecer resultados competitivos con un número de parámetros activos muy inferior al de sus competidores, lo que se traduce en menores requisitos de cómputo por token. Frente a Tencent Hy3, cede 1,5 puntos en Terminal-Bench pero gana 2,7 en SWE-bench Multilingual con menos de la mitad de parámetros activos. Los datos de licencia y contexto de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- En contextos muy largos puede experimentar cierta degradación de calidad, según advierte la propia model card.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones específicas de factualidad.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento uniforme fuera del inglés.
- El checkpoint de agosto de 2026 sustituye a una versión anterior con pesos distintos; es imprescindible volver a descargar si se tenía la copia previa.
- La cuantización FP8 puede introducir diferencias de calidad respecto a los pesos originales, aunque fue calibrada a 1M de contexto.
- Se recomienda servir con los valores de `generation_config.json` (top_k 20) en lugar de fijar temperature o top_p propios.
- La licencia OpenMDW-1.1 permite uso comercial y modificación, pero conviene revisar el texto completo en el enlace de licencia del repositorio.
- El modelo es solo de texto; no admite entrada multimodal.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RedHatAI/Laguna-S-2.1-FP8
- Modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- Model card principal con receta vLLM: https://huggingface.co/poolside/Laguna-S-2.1
- Licencia: https://huggingface.co/poolside/Laguna-S-2.1-FP8/blob/main/LICENSE.md
- Blog de lanzamiento: https://poolside.ai/blog/introducing-laguna-s-2-1
- OpenRouter: https://openrouter.ai/poolside/laguna-s-2.1
- Vercel AI Gateway: https://vercel.com/ai-gateway/models/laguna-s-2.1
- Recetas vLLM: https://recipes.vllm.ai/poolside/Laguna-S-2.1
- Ollama: https://ollama.com/laguna-s-2.1
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/25165
- Trayectorias de evaluación: https://trajectories.poolside.ai
- OpenMDW: https://openmdw.ai/
- Organización Red Hat AI en Hugging Face: https://huggingface.co/RedHatAI
