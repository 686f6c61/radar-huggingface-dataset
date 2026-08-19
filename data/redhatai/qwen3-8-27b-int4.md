# RedHatAI/Qwen3.8-27B-INT4

## Resumen

RedHatAI/Qwen3.8-27B-INT4 es una versión cuantizada a INT4 del modelo Qwen/Qwen3.8-27B, un modelo denso de visión y lenguaje (VLM) desarrollado por Alibaba sobre la arquitectura Qwen3.5. Esta cuantización ha sido realizada por Red Hat AI con la herramienta LLM Compressor, utilizando una combinación de AWQ y GPTQ, y está preparada para su despliegue directo con vLLM. El objetivo principal es reducir el consumo de memoria y acelerar la inferencia sin sacrificar en exceso la calidad, manteniendo las capacidades multimodales del modelo original.

El modelo base Qwen3.8-27B es un VLM de 27 mil millones de parámetros que destaca en tareas de codificación, razonamiento, agente autónomo y comprensión de imágenes y vídeo, con una ventana de contexto nativa de 262 000 tokens. Esta cuantización INT4 reduce el tamaño del repositorio a 19,5 GB, lo que permite ejecutarlo en hardware de consumo con suficiente VRAM. La ficha técnica se centra en la versión cuantizada, indicando cuando corresponde las características del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (dense vision-language transformer) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la ficha; el modelo base soporta 262 000 tokens. El comando de ejemplo de vLLM usa `--max-model-len 69632` |
| Tipos de cuantizacion | INT4 (W4A16) con group size 128, mediante AWQ y GPTQ |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se detalla en esta ficha) |
| Licencia | No disponible (el modelo base Qwen3.8-27B se distribuye bajo Apache 2.0) |
| Formato de pesos | safetensors (formato compressed-tensors) |

## Arquitectura y entrenamiento

La cuantización se aplica sobre el modelo Qwen/Qwen3.8-27B, un transformer denso con arquitectura Qwen3.5 que incorpora un codificador de visión (vision tower) y una cabeza de salida (output head). El proceso de cuantización, descrito en la model card, utiliza LLM Compressor con una receta que combina AWQModifier (con duo_scaling="both") y GPTQModifier con esquema W4A16. Se cuantizan únicamente las capas lineales de los bloques transformer, excluyendo explícitamente la torre de visión, los embeddings, la cabeza de salida y las proyecciones de atención lineal (`linear_attn.in_proj_a` y `linear_attn.in_proj_b`). La calibración se realiza con 512 muestras del dataset `mlabonne/open-perfectblend`, con una longitud máxima de secuencia de 4096 tokens y activando `moe_calibrate_all_experts=True` (aunque el modelo es denso, esta opción está presente en el código de creación).

El resultado es un modelo con pesos INT4 listo para inferencia con vLLM, que conserva la precisión original en las partes críticas (visión y cabeza de salida) para minimizar la degradación. No se especifican datos de entrenamiento adicionales ni fases de RLHF o DPO, ya que se trata únicamente de una cuantización post-entrenamiento.

## Capacidades

- Generación de texto y razonamiento complejo, heredadas del modelo base Qwen3.8-27B.
- Comprensión de imágenes y vídeo (entrada multimodal nativa) gracias a la torre de visión que se mantiene en precisión original.
- Soporte de tool calling y function calling, habilitado en el comando de vLLM con `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Razonamiento multi-paso y modo de pensamiento (reasoning), activado con `--reasoning-parser qwen3`.
- Capacidades multilingües del modelo base (no detalladas en la ficha de la cuantización).
- Ejecución eficiente en INT4 con vLLM, reduciendo requisitos de memoria frente al modelo en BF16.

## Casos de uso

- Despliegue de un asistente de codificación local: gracias a la cuantización INT4, el modelo puede ejecutarse en una GPU de consumo (por ejemplo, RTX 4090 con 24 GB) y ofrece soporte de tool calling para integrarse en entornos de desarrollo como editores o pipelines de CI/CD.
- Agente autónomo para automatización de tareas: el modelo base destaca en planificación a largo plazo y manejo de feedback del entorno; esta versión cuantizada permite ejecutarlo en hardware más asequible para prototipos de agentes que interactúan con APIs y herramientas.
- Análisis de documentos con imágenes: al conservar la torre de visión en precisión original, puede procesar capturas de pantalla, diagramas o formularios escaneados y extraer información estructurada, con una ventana de contexto amplia (hasta 262K en el modelo base) para documentos extensos.
- Asistente de atención al cliente multimodal: capaz de gestionar conversaciones multi-turno y adjuntar imágenes de productos o incidencias, reduciendo la latencia gracias a la inferencia INT4 en vLLM.
- Investigación y prototipado rápido: al ser un modelo abierto con pesos cuantizados, permite experimentar con razonamiento avanzado y visión en entornos con recursos limitados, sin necesidad de un clúster de GPUs.
- Servidor de inferencia self-hosted: el comando de vLLM incluido en la model card permite levantar un endpoint compatible con OpenAI, con control de longitud de contexto (69 632 tokens en el ejemplo) y uso de memoria configurable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización en la información disponible. Los datos de rendimiento del modelo base (por ejemplo, DeepSWE 42.2, Terminal Bench 73.0, OSWorld 84.3) provienen de fuentes externas y no son directamente atribuibles a la versión INT4, que puede presentar una ligera degradación respecto al modelo original.

## Requisitos de hardware

- VRAM estimada: el tamaño del repositorio es de 19,5 GB, por lo que se necesitan al menos 20-24 GB de VRAM para cargar los pesos y los estados intermedios. Con `--gpu-memory-utilization 0.9` y `--max-model-len 69632`, es probable que quepa en una GPU de 24 GB (RTX 3090, RTX 4090, A5000).
- GPUs recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB (con margen), o GPUs profesionales con 24 GB o más. No se recomienda para GPUs de 16 GB o menos sin reducir drásticamente la longitud de contexto.
- En consumer GPU: sí, en tarjetas de 24 GB. Para 16 GB (como RTX 4080 Super) podría ser posible con `--max-model-len` muy reducido, pero no está garantizado.
- Opciones de despliegue: vLLM (recomendado y soportado oficialmente según la model card), también compatible con el ecosistema compressed-tensors (llama.cpp podría requerir conversión adicional, no indicada).
- Latencia y throughput: no disponibles. Dependerán de la GPU, la longitud de secuencia y el número de peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| RedHatAI/Qwen3.8-27B-INT4 | 27,36 B | INT4 (W4A16) | No especificado (base: 262K) | No disponible | safetensors |
| RedHatAI/Qwen3.8-27B-NVFP4 | 27,36 B | NVFP4 (FP4) | No especificado | No disponible | safetensors |
| Qwen/Qwen3.8-27B (original) | 27,36 B | BF16 | 262K | Apache 2.0 | safetensors |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de rendimiento relativos entre estas versiones cuantizadas. Frente al modelo original, la INT4 reduce el tamaño de memoria aproximadamente un 60-70% (de ~55 GB en BF16 a ~19,5 GB), a costa de una posible pérdida de precisión.

## Limitaciones y advertencias

- La cuantización INT4 puede introducir una degradación leve en tareas de razonamiento complejo o generación de código, aunque no se han publicado métricas que lo cuantifiquen.
- La licencia no está especificada en la ficha; aunque el modelo base es Apache 2.0, la versión cuantizada podría tener condiciones adicionales. Se recomienda verificar antes de uso comercial.
- No se especifican los idiomas soportados; aunque el modelo base es multilingüe, la cuantización podría afectar a lenguas de baja representación.
- El comando de ejemplo de vLLM usa una longitud máxima de 69 632 tokens, muy inferior a los 262K del modelo base; esto sugiere limitaciones de memoria en la práctica.
- La cuantización excluye la torre de visión y la cabeza de salida, pero no garantiza la misma calidad multimodal que el modelo original.
- Riesgo de alucinación y sesgos inherentes al modelo base, no mitigados por la cuantización.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es una publicación reciente y sin validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RedHatAI/Qwen3.8-27B-INT4
- Variante NVFP4: https://huggingface.co/RedHatAI/Qwen3.8-27B-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Blog de AMD sobre ejecución local de Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guía completa de Qwen3.8-27B (2026): https://lovableapp.org/blog/qwen3-8-27b
- Review en Geeky Gadgets: https://www.geeky-gadgets.com/qwen-3-8-27b-local-ai-review/
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Repositorio de LLM Compressor: https://github.com/vllm-project/llm-compressor
