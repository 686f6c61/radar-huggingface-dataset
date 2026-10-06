# RedHatAI/Laguna-S-2.1-NVFP4

## Resumen

Laguna S 2.1-NVFP4 es la versión cuantizada en NVFP4 de Laguna S 2.1, un modelo de lenguaje de tipo Mixture-of-Experts desarrollado por poolside y publicada en este repositorio por RedHatAI. Cuenta con 117.600 millones de parámetros totales y 8.500 millones de parámetros activos por token, lo que lo sitúa en la categoría de modelos de gran escala con coste de inferencia reducido. Está diseñado específicamente para codificación agéntica y tareas de largo horizonte ejecutadas en una máquina local.

La innovación principal de esta variante es la cuantización NVFP4 (formato de 4 bits con escalas en FP8) empaquetada mediante compressed-tensors, que reduce el peso de los checkpoints a aproximadamente 71 GB y permite desplegar un modelo de 117B en hardware de una sola máquina. El modelo base emplea una arquitectura híbrida de atención con Sliding Window Attention en 36 de sus 48 capas y atención global en las 12 restantes, además de caché KV cuantizada en FP8. Soporta una ventana de contexto de 1.048.576 tokens (1M), con la opción de recortarla a 262.144 tokens editando la configuración.

Su relevancia actual radica en que combina capacidades de razonamiento intercalado con llamadas a herramientas, licencia permisiva OpenMDW-1.1 para uso comercial, y compatibilidad con vLLM, Transformers y TRT-LLM en el mismo checkpoint. Los pesos están calibrados a la configuración de 1M de contexto, lo que evita la degradación típica de las cuantizaciones realizadas sobre ventanas cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts con atención híbrida (Sliding Window Attention + atención global) |
| Parametros totales | 117.561.977.600 (117,6B) |
| Parametros activos | 8.500 millones (8,5B) por token |
| Longitud de contexto | 1.048.576 tokens (configurable a 262.144) |
| Tipos de cuantizacion | NVFP4 (4 bits, escalas FP8) mediante compressed-tensors; el modelo base admite tambien BF16, Q4_K_M, FP8 |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (compressed-tensors), biblioteca vllm |
| Numero de capas | 48 (12 de atención global, 36 de sliding window) |
| Ventana deslizante | 512 tokens |
| Expertos | 256 expertos + 1 experto compartido |
| Optimizador | Muon |
| Modalidad | text-to-text |
| Tamano del repositorio | 99,7 GB |

## Arquitectura y entrenamiento

Laguna S 2.1 es un modelo Mixture-of-Experts con 117,6B de parámetros totales y 8,5B activados por token, distribuidos en 48 capas. La disposición de atención es mixta en proporción 3:1: 36 capas emplean Sliding Window Attention con una ventana de 512 tokens y 12 capas emplean atención global. Esta combinación reduce el coste del caché KV manteniendo acceso a contexto largo. El modelo incorpora softplus gating con escalas rotatorias por capa, lo que permite mezclar ambos tipos de atención sin degradar la estabilidad del entrenamiento. El componente MoE utiliza 256 expertos más un experto compartido.

El entrenamiento comprende fases de preentrenamiento, postentrenamiento y aprendizaje por refuerzo, con el optimizador Muon. Incluye una etapa de extensión de contexto largo que llega hasta 1.048.576 tokens, y la cuantización NVFP4 de este checkpoint se calibró directamente sobre esa configuración de 1M, no sobre una ventana reducida. La caché KV se cuantiza en FP8 para disminuir la memoria por token durante la inferencia. La decodificación especulativa es posible emparejando el modelo con el draft model cuantizado poolside/Laguna-S-2.1-DFlash-NVFP4.

## Capacidades

- Generación de texto conversacional con ventana de contexto de hasta 1.048.576 tokens.
- Codificación agéntica: resolución de tareas de terminal, edición de repositorios y navegación de bases de código.
- Razonamiento nativo con modo "thinking" intercalado entre llamadas a herramientas.
- Activación y desactivación del razonamiento por petición (thinking on/off per-request).
- Conservación del razonamiento previo (preserved thinking) a lo largo de interacciones multi-turno.
- Llamada a herramientas y function calling, con soporte para flujos agénticos de varios pasos.
- Comprensión de bases de código completas y respuesta a preguntas sobre ellas.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión ni de audio; la modalidad es exclusivamente text-to-text.

## Casos de uso

- Agentes de codificación en local: un desarrollador puede ejecutar el modelo en una estación de trabajo con una GPU de 96 GB o superior y dejar que el agente lea el repositorio, proponga parches y ejecute comandos de terminal, gracias a la ventana de 1M tokens que permite cargar bases de código enteras sin trocear.
- Automatización de mantenimiento de repositorios: con Terminal-Bench 2.1 del 70,2 % y SWE-bench Multilingual del 78,5 %, el modelo es adecuado para tareas de resolución de issues, actualización de dependencias y migraciones de API en pipelines de integración continua.
- Asistencia a refactorizaciones a gran escala: la combinación de contexto de 1M tokens y SWE Atlas (Codebase QnA) del 46,2 % lo hace apto para responder preguntas sobre arquitecturas de código extensas y planificar refactorizaciones que afectan a múltiples módulos.
- Agentes de operaciones con tool calling: Toolathlon Verified del 49,7 % indica capacidad para encadenar herramientas externas en tareas de administración de sistemas, consultas a APIs y orquestación de servicios.
- Despliegue en servidor con vLLM: al ser un checkpoint compressed-tensors con detección automática de cuantización, se puede servir como endpoint OpenAI-compatible para dar servicio a varios usuarios internos con la caché KV en FP8, que reduce el consumo de memoria por token.
- Evaluación e investigación sobre cuantización NVFP4: el checkpoint permite estudiar la pérdida de calidad respecto al modelo base en BF16 con la misma receta de calibración a 1M de contexto.
- Generación de código en producción sin salida a la nube: la licencia OpenMDW-1.1 permite uso comercial y la ejecución local evita enviar código propietario a servicios externos.

## Benchmarks y rendimiento

Datos publicados por el autor del modelo base (a 21 de julio de 2026). Los valores marcados con asterisco proceden de terceros.

| Modelo | Tamano | Terminal-Bench 2.1 | SWE-bench Multilingual | SWE-Bench Pro | DeepSWE | SWE Atlas (Codebase QnA) | Toolathlon Verified |
|---|---|---|---|---|---|---|---|
| Laguna S 2.1 | 118B-A8B | 70,2 % | 78,5 % | 59,4 % | 40,4 % | 46,2 % | 49,7 % |
| Tencent Hy3 | 295B-A21B | 71,7 % | 75,8 % | 57,9 % | - | - | - |
| Inkling | 975B-A41B | 63,8 % | - | 54,3 % | - | - | 45,5 %* |
| Nemotron 3 Ultra | 550B-A55B | 56,4 % | 67,7 % | - | - | - | 34,3 %* |
| DeepSeek-V4-Pro Max | 1,6T-A49B | 64,0 %* | 76,2 % | 55,4 % | 9,0 %* | 27,2 %* | 55,9 %* |
| Kimi K3 | 2800B-A50B | 88,3 % | - | - | 69 % | - | - |
| Qwen 3.7 Max | - | 74,5 %* | 78,3 % | 60,6 % | - | - | - |
| Muse Spark 1.1 | - | 80 % | - | 61,5 % | 53,3 % | 42,2 %* | 75,6 % |
| Claude Fable 5 | - | 88 % | - | 80,3 % | 70 % | - | - |

No se han publicado resultados específicos de esta variante cuantizada NVFP4 en la información disponible; los datos corresponden al modelo base Laguna S 2.1.

## Requisitos de hardware

- VRAM estimada: aproximadamente 71 GB solo para los pesos en NVFP4, según la model card. A ello hay que sumar la caché KV en FP8 y el overhead del runtime.
- La cuantización NVFP4 requiere aceleradores con soporte nativo para ese formato; el soporte en vLLM, Transformers y TRT-LLM ha sido aportado por el equipo de NVIDIA. No se especifica en la información disponible la lista exacta de GPUs compatibles.
- No cabe en GPUs de consumo convencionales. Para el modelo base, la alternativa local recomendada por el autor es Ollama (con soporte MLX) o llama.cpp, pero solo en BF16 y Q4_K_M.
- Opciones de despliegue: vLLM (versión 0.25.0 o superior), Transformers y TRT-LLM. SGLang no ejecuta NVFP4 correctamente según la model card.
- Decodificación especulativa opcional con poolside/Laguna-S-2.1-DFlash-NVFP4, que debe coincidir en cuantización.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Aspecto | Laguna S 2.1-NVFP4 | Tencent Hy3 | Qwen 3.7 Max | DeepSeek-V4-Pro Max |
|---|---|---|---|---|
| Parametros | 117,6B totales / 8,5B activos | 295B totales / 21B activos | no disponible | 1,6T totales / 49B activos |
| Terminal-Bench 2.1 | 70,2 % | 71,7 % | 74,5 %* | 64,0 %* |
| SWE-bench Multilingual | 78,5 % | 75,8 % | 78,3 % | 76,2 % |
| SWE-Bench Pro | 59,4 % | 57,9 % | 60,6 % | 55,4 % |
| Despliegue local | Si, ~71 GB en NVFP4 | No indicado | No indicado | No indicado |
| Licencia | openmdw-1.1 | no disponible | no disponible | no disponible |

La ventaja diferencial de Laguna S 2.1-NVFP4 frente a estos modelos es la relación entre tamaño y ejecución local: con 8,5B de parámetros activos y pesos NVFP4 de unos 71 GB, ofrece puntuaciones cercanas a modelos de 295B a 1,6T de parámetros que no están pensados para ejecución en una sola máquina.

## Limitaciones y advertencias

- La model card advierte de que en contexto largo puede producirse cierta degradación de calidad.
- NVFP4 no funciona correctamente en SGLang; el despliegue debe hacerse con vLLM 0.25.0 o superior, Transformers o TRT-LLM.
- Se requiere una GPU con soporte para el formato NVFP4; no se garantiza su funcionamiento en generaciones anteriores de hardware.
- Los parámetros de muestreo de `generation_config.json` son autoritativos (top_k 20 es la truncación validada en evaluación); no se deben fijar temperature o top_p por separado.
- El repositorio no declara idiomas soportados, por lo que el comportamiento multilingüe no está verificado.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero inherentes a los modelos de lenguaje de esta escala.
- La licencia OpenMDW-1.1 permite uso y modificación comercial y no comercial, pero conviene revisar los términos completos antes de un despliegue en producción.
- El checkpoint base está sujeto a un formulario de acceso restringido (`extra_gated_description`) en el repositorio original de poolside.
- Este checkpoint concreto (actualización de agosto de 2026) cambió los pesos, no solo la configuración: las copias descargadas con anterioridad deben volverse a descargar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RedHatAI/Laguna-S-2.1-NVFP4
- Modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- Draft model para decodificación especulativa: https://huggingface.co/poolside/Laguna-S-2.1-DFlash-NVFP4
- Blog de lanzamiento: https://poolside.ai/blog/introducing-laguna-s-2-1
- Uso en OpenRouter: https://openrouter.ai/poolside/laguna-s-2.1
- Uso en Vercel AI Gateway: https://vercel.com/ai-gateway/models/laguna-s-2.1
- Ollama: https://ollama.com/laguna-s-2.1
- Pull request de llama.cpp: https://github.com/ggml-org/llama.cpp/pull/25165
- Recetas de vLLM: https://recipes.vllm.ai/poolside/Laguna-S-2.1
- Trayectorias de evaluación: https://trajectories.poolside.ai
- Licencia OpenMDW: https://openmdw.ai/
- Política de privacidad de poolside: https://poolside.ai/legal/privacy
