# FlagRelease/Qwen3.8-27B-BF16-metax-FlagOS

## Resumen

Qwen3.8-27B es un modelo de lenguaje y visión de gran tamano desarrollado por Alibaba, distribuido en este repositorio por la comunidad Zhongzhi (众智) FlagOS como una adaptación multi-chip lista para producción. El repositorio contiene los pesos en BF16 (27.781.427.952 parámetros, aproximadamente 55,6 GB) junto con la guía de despliegue sobre la pila FlagOS, que unifica modelo, sistema y chip para permitir un flujo "desarrolla una vez, ejecuta en cualquier acelerador".

La relevancia de esta publicación es la adaptación Day 0 a 11 aceleradores de IA distintos (T-Head, NVIDIA, Moore Threads, MetaX, Kunlunxin, Ascend, Hygon, Iluvatar CoreX, Tsingmicro, Enflame y Sunrise), con soporte FP8 en NVIDIA y Moore Threads y BF16 en el resto. Además, FlagOS extiende por primera vez la adaptación de un modelo Qwen a plataformas ARM de borde mediante una versión de bajo bit W4A8.

El modelo está etiquetado con la arquitectura `qwen3_5` en Hugging Face, soporta chino e inglés y se publica bajo licencia Apache 2.0. La model card no detalla la longitud de contexto, la composición del dataset de entrenamiento ni el pipeline de alineación, por lo que esos datos se marcan como no disponibles en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen3_5` (según tag de Hugging Face); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); FP8 en NVIDIA y Moore Threads; W4A8 en plataformas ARM de borde |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible identifica el modelo como `qwen3_5`, una arquitectura transformer de la familia Qwen 3.5, con capacidad de visión y lenguaje (el texto de presentación lo describe explícitamente como "vision-language model"). El repositorio contiene únicamente los pesos en BF16 y material de despliegue; no se publican detalles sobre número de capas, dimensión oculta, mecanismo de atención, uso de Mixture-of-Experts ni innovaciones como decodificación especulativa o atención lineal.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Lo que sí se documenta es el trabajo de adaptación de FlagOS: alineación de precisión y verificación de despliegue sobre 11 chips, con resultados de consistencia medidos frente a la pila nativa de NVIDIA (ver sección de benchmarks). La pila incluye FlagGems (librería de operadores en Triton), FlagTree (compilador unificado multi-backend), FlagCX (comunicación) y FlagScale (entrenamiento e inferencia distribuidos).

## Capacidades

- Generación de texto en chino e inglés.
- Procesamiento de visión y lenguaje, según la descripción del modelo como vision-language model.
- Modo de razonamiento con "thinking" activable o desactivable mediante `chat_template_kwargs.enable_thinking` en la API compatible con OpenAI.
- Razonamiento de múltiples pasos y tareas de conocimiento avanzado, evidenciado por resultados en GPQA Diamond y MuSR.
- Servido mediante API compatible con OpenAI (`/v1/chat/completions`) a través de vLLM.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Soporte de audio: no disponible en la información proporcionada.

## Casos de uso

- Despliegue en infraestructura no NVIDIA: el repositorio está pensado para ejecutar el modelo en aceleradores MetaX, Ascend, Kunlunxin, Hygon, Iluvatar CoreX, Enflame, Tsingmicro, Sunrise, T-Head o Moore Threads usando la misma pila FlagOS, lo que permite evitar la dependencia de CUDA en centros de datos con hardware heterogéneo.
- Inferencia en clúster con tensor parallelism: la guía oficial arranca vLLM con `--tensor-parallel-size 2` y `--max-num-batched-tokens 16384`, un punto de partida realista para servir el modelo de 27,8 B en dos aceleradores MetaX.
- Asistente conversacional multilingüe chino-inglés: el modelo cubre ambos idiomas de forma nativa, adecuado para atención al cliente o soporte interno en organizaciones con operación en China y mercados angloparlantes.
- Razonamiento científico y técnico: los resultados en GPQA Diamond (89,34 en la pila FlagOS) lo sitúan como candidato para asistentes de investigación, revisión de literatura técnica y resolución de preguntas de posgrado en dominios STEM.
- Análisis de documentos con componente visual: al ser un modelo visión-lenguaje, puede emplearse para extracción de información de capturas, gráficos o páginas escaneadas en pipelines documentales.
- Integración en estaciones de trabajo con AnythingLLM: la model card documenta explícitamente la integración con AnythingLLM, lo que permite montar un asistente sobre documentación propia sin escribir frontend.
- Evaluación comparativa de stacks de hardware: el par de benchmarks publicado (MuSR y GPQA) sirve como test de regresión para validar que una nueva versión del stack FlagOS mantiene la precisión frente a la pila nativa.
- Despliegue en borde ARM: la variante W4A8 permite llevar el modelo a plataformas ARM de borde para inferencia con recursos limitados, según la extensión anunciada por FlagOS.

## Benchmarks y rendimiento

| Benchmark | Qwen3.8-27B-Nvidia-Origin | Qwen3.8-27B-Metax-FlagOS |
|---|---|---|
| musr_murder_mysteries | 76,8 | 75,6 |
| GPQA_Diamond | 90,4 | 89,34 |

Los datos publicados corresponden únicamente a la validación de consistencia entre la pila nativa de NVIDIA y la pila FlagOS sobre MetaX. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55,6 GB solo para pesos, más overhead de KV cache y activaciones; en la práctica requiere al menos 2 aceleradores de 48 GB o uno de 80 GB con margen ajustado.
- La configuración oficial de referencia usa `--tensor-parallel-size 2` sobre MetaX, con `--shm-size 64g` en el contenedor.
- GPU recomendadas: MetaX (serie documentada en la imagen `metax001`), NVIDIA A100/H100 para la pila nativa, y el resto de aceleradores cubiertos por FlagOS (Ascend, Kunlunxin, Hygon, Iluvatar CoreX, Moore Threads, Enflame, Tsingmicro, Sunrise, T-Head).
- En GPU de consumo: no cabe en BF16 en una RTX 4090 (24 GB). Sería necesaria cuantización a 4 bits (aproximadamente 14-16 GB de pesos) para intentarlo, si bien no se documenta soporte GGUF ni versión cuantizada para consumo en este repositorio.
- Opciones de despliegue: vLLM 0.20.2 mediante la imagen Docker de FlagOS (`harbor.baai.ac.cn/flagrelease-public/qwen3.8-27b-metax001-...`), con API compatible con OpenAI en el puerto 8066. Soporte de llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.
- Variables de entorno relevantes para el rendimiento: `FLAGGEMS_VENDOR=metax`, `VLLM_FL_FLAGOS_WHITELIST` con la lista de operadores acelerados y `VLLM020_CONTIGUOUS_SINGLE_PREFILL=1`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (este repo, FlagOS) | 27,78 B | no disponible | Apache 2.0 | Pesos BF16 en Hugging Face, imagen Docker MetaX |
| Qwen3.8-27B (pila nativa NVIDIA) | 27,78 B | no disponible | Apache 2.0 | Referencia de comparación en la model card |
| Otras alternativas de ~27 B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa con la familia Llama, Mistral, Gemma u otros Qwen.

## Limitaciones y advertencias

- Solo se declaran chino e inglés como idiomas soportados; el rendimiento en castellano u otras lenguas no está validado.
- No se documenta la longitud de contexto, lo que impide planificar cargas con ventanas largas sin prueba previa.
- El modelo puede alucinar, como cualquier LLM; no se han publicado tasas de alucinación ni evaluaciones de veracidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los pesos originales de Alibaba y de la imagen Docker de FlagOS, alojada en `harbor.baai.ac.cn`.
- El repositorio tiene un volumen de descargas muy bajo (18) y ninguna validación de la comunidad (0 likes); trátese como un artefacto de adaptación reciente, no como un despliegue ampliamente probado.
- La imagen Docker y los scripts están atados a versiones concretas (vLLM 0.20.2, MACA 3.7, PyTorch 2.8); actualizar componentes puede romper la compatibilidad.
- El soporte de tool calling, agentes y otras capacidades avanzadas no está documentado, por lo que no debería asumirse en producción sin verificación empírica.
- La variante W4A8 para ARM de borde se anuncia en la model card, pero no se publican pesos ni métricas de precisión para ella en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Qwen3.8-27B-BF16-metax-FlagOS
- AnythingLLM: https://anythingllm.com/
- Triton (dependencia de FlagGems): https://github.com/openai/triton
- Repositorio de FlagOS, FlagGems, FlagTree, FlagCX y FlagScale: no disponible en la información proporcionada
- Paper o blog técnico del modelo Qwen3.8-27B: no disponible en la información proporcionada
