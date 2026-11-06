# OpenVINO/LFM3-1.7B-int8-ov

## Resumen

LFM3-1.7B-int8-ov es la conversión al formato OpenVINO IR del modelo LFM3-1.7B de LiquidAI, con los pesos comprimidos a INT8 mediante NNCF. Lo publica el equipo de OpenVINO en Hugging Face y su propósito es permitir la inferencia optimizada de este modelo sobre hardware Intel (CPU, iGPU, NPU) sin necesidad de GPU dedicada, manteniendo un tamaño de repositorio de 1,8 GB. El modelo original pertenece a la familia LFM3 (Liquid Foundation Models, tercera generación) de LiquidAI y está diseñado para generación de texto y conversación.

El modelo base es un transformer de 1.700 millones de parámetros con soporte de razonamiento explícito (modo *thinking*) activado por defecto en la plantilla de chat, que puede desactivarse mediante `enable_thinking=False`. La conversión a OpenVINO no altera la arquitectura ni la tokenizador, sino que transforma los pesos a un grafo intermedio (IR) que el runtime de Intel puede ejecutar de forma nativa y eficiente.

Su relevancia actual radica en que permite desplegar un LLM de tamaño pequeño y con capacidades de razonamiento en entornos sin GPU NVIDIA, como portátiles con CPU Intel, servidores de bajo coste o dispositivos edge, usando OpenVINO GenAI, Optimum Intel u OpenVINO Model Server con una API compatible con OpenAI. No obstante, requiere versiones muy recientes del runtime (2026.5.0 o superior, disponibles como *nightly builds* en el momento de la publicación) y un *fork* de Optimum Intel aún no fusionado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LFM3-1.7B de LiquidAI); convertido a OpenVINO IR |
| Parámetros totales | 1.700 millones (1,7B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT8 asimétrica (INT8_ASYM) mediante NNCF `compress_weights` |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (`lfm1.0`, marcada como "other") |
| Formato de pesos | OpenVINO IR (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer de 1,7B parámetros desarrollado por LiquidAI. La información proporcionada no detalla la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se especifica si incorpora innovaciones arquitectónicas propias de la familia Liquid (como capas de estado recurrente o híbridas); la model card de la conversión no entra en esos detalles.

La aportación de esta versión concreta es el proceso de conversión y compresión: los pesos se exportan a OpenVINO IR con `optimum-cli export openvino` y se comprimen a INT8 asimétrico con NNCF. Esto reduce el tamaño del repositorio a 1,8 GB y permite ejecutar el modelo en CPU con aceleración de instrucciones Intel. El modelo conserva la plantilla de chat del original, incluido el modo de razonamiento activado por defecto, que el usuario puede desactivar en tiempo de inferencia.

## Capacidades

- Generación de texto y conversación multi-turno mediante plantilla de chat.
- Razonamiento explícito en modo *thinking*, activado por defecto y desactivable con `enable_thinking=False`.
- Respuestas directas sin cadena de razonamiento cuando se desactiva el modo *thinking*.
- Ejecución en CPU, iGPU y NPU Intel a través del runtime OpenVINO.
- Integración con el ecosistema Hugging Face mediante Optimum Intel (`OVModelForCausalLM`).
- Despliegue como servicio con API compatible con OpenAI a través de OpenVINO Model Server.
- Soporte de *streaming* de tokens en la API de OVMS.
- Capacidades de *tool calling*, agentes o multilingüismo: no disponibles en la información proporcionada.

## Casos de uso

- **Asistente conversacional en portátiles sin GPU dedicada**: el modelo se ejecuta en CPU Intel con OpenVINO GenAI, permitiendo un chatbot local con modo de razonamiento para preguntas complejas y respuestas directas para consultas simples.
- **Servicio de generación de texto en servidores de bajo coste**: mediante OpenVINO Model Server con API compatible con OpenAI, se puede exponer el modelo como endpoint HTTP en hardware sin GPU NVIDIA, integrándolo en aplicaciones existentes que ya usan el cliente de OpenAI.
- **Prototipado rápido en cuadernos Jupyter**: los *notebooks* de OpenVINO incluyen ejemplos para LFM3, lo que facilita experimentar con el modelo y comparar el modo *thinking* activado y desactivado sin infraestructura adicional.
- **Procesamiento por lotes de texto en entornos edge**: al caber en 1,8 GB y ejecutarse en CPU, puede desplegarse en dispositivos con recursos limitados para tareas de resumen, clasificación o generación de borradores.
- **Evaluación de modelos pequeños con razonamiento**: investigadores pueden comparar el comportamiento del modo *thinking* frente al modo directo en un modelo de 1,7B cuantizado, usando la misma API que otros modelos servidos por OVMS.
- **Integración en pipelines de CI/CD para pruebas de regresión**: al ser un artefacto OpenVINO IR reproducible, puede incluirse en pruebas automatizadas que verifiquen la calidad de las respuestas del modelo tras cambios en el *prompt* o en la plantilla de chat.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no aplica para ejecución en CPU; el repositorio ocupa 1,8 GB en disco con pesos INT8. Para ejecución en iGPU o NPU Intel se comparte memoria del sistema, sin cifra de VRAM dedicada disponible.
- **GPU recomendadas**: el modelo está orientado a CPU, iGPU y NPU Intel mediante OpenVINO. No se proporcionan recomendaciones para GPU NVIDIA o AMD.
- **Compatibilidad con GPU de consumo**: no disponible en la información proporcionada.
- **Opciones de despliegue**:
  - OpenVINO GenAI (`ov_genai.LLMPipeline`) en Python.
  - Optimum Intel (`OVModelForCausalLM`) con Transformers 5.20.0 y el *fork* de Optimum Intel del PR #2087.
  - OpenVINO Model Server (OVMS) con API compatible con OpenAI, en binario para Windows o contenedor Docker para Linux.
  - *Notebooks* de OpenVINO para ejemplos interactivos.
- **Latencia y throughput**: no disponibles en la información proporcionada.
- **Requisitos de versión**: OpenVINO y OpenVINO GenAI 2026.5.0 o superior (en el momento de la publicación, solo *nightly builds*); Transformers 5.20.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenVINO/LFM3-1.7B-int8-ov | 1,7B | No disponible | OpenVINO IR INT8 | LFM Open License v1.0 | Hugging Face (38 descargas) |
| LiquidAI/LFM3-1.7B | 1,7B | No disponible | Pesos originales (no especificado) | LFM Open License v1.0 | Hugging Face (modelo base) |
| Alternativas de 1-2B en formato GGUF/OpenVINO | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- **Madurez del ecosistema**: requiere OpenVINO 2026.5.0 o superior, disponible solo como *nightly build* en el momento de la publicación, y un *fork* de Optimum Intel (PR #2087) aún no fusionado. Esto complica el despliegue en producción estable.
- **Formato propietario**: los pesos están en OpenVINO IR, no en safetensors ni GGUF, por lo que no son directamente utilizables con vLLM, llama.cpp, Ollama ni TGI.
- **Licencia**: LFM Open License v1.0, marcada como "other". Es necesario revisar los términos del enlace de licencia del modelo base antes de un uso comercial; la información proporcionada no detalla restricciones concretas.
- **Idiomas**: no se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas distintos del inglés.
- **Contexto**: no se ha publicado la longitud máxima de contexto, un dato crítico para aplicaciones multi-turno o de documentos largos.
- **Riesgo de alucinación**: inherente a los modelos de lenguaje de 1,7B parámetros; no se han publicado evaluaciones de fidelidad factual en la información disponible.
- **Sesgos**: no se documentan sesgos conocidos en la model card de la conversión.
- **Modo *thinking* por defecto**: si no se desactiva explícitamente, el modelo genera una cadena de razonamiento antes de responder, lo que incrementa la latencia y el consumo de tokens; hay que configurarlo conscientemente en producción.
- **Rendimiento en hardware no Intel**: el modelo está optimizado para el runtime OpenVINO; su comportamiento en otras plataformas no está documentado.

## Enlaces

- [Modelo en Hugging Face: OpenVINO/LFM3-1.7B-int8-ov](https://huggingface.co/OpenVINO/LFM3-1.7B-int8-ov)
- [Modelo base: LiquidAI/LFM3-1.7B](https://huggingface.co/LiquidAI/LFM3-1.7B)
- [Licencia LFM Open License v1.0](https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE)
- [Formato OpenVINO IR](https://docs.openvino.ai/2026/documentation/openvino-ir-format.html)
- [Guía de optimización de modelos OpenVINO](https://docs.openvino.ai/2026/openvino-workflow/model-optimization-guide/weight-compression.html)
- [NNCF (Neural Network Compression Framework)](https://github.com/openvinotoolkit/nncf)
- [Optimum Intel](https://huggingface.co/docs/optimum/intel/index)
- [PR de Optimum Intel con soporte LFM3 (#2087)](https://github.com/huggingface/optimum-intel/pull/2087)
- [Inferencia con Optimum Intel](https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-optimum-intel.html)
- [OpenVINO GenAI](https://github.com/openvinotoolkit/openvino.genai)
- [Documentación de OpenVINO GenAI](https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html)
- [OpenVINO Model Server](https://github.com/openvinotoolkit/model_server)
- [Notebooks de OpenVINO para LFM3](https://openvinotoolkit.github.io/openvino_notebooks/?search=LFM3)
- [Notebooks de OpenVINO para LLM](https://openvinotoolkit.github.io/openvino_notebooks/?search=LLM)
