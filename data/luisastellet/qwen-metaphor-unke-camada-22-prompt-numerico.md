# luisastellet/qwen-metaphor-unke-camada-22-prompt-numerico

## Resumen

`luisastellet/qwen-metaphor-unke-camada-22-prompt-numerico` es un checkpoint de la familia Qwen3 publicado en HuggingFace por el usuario `luisastellet`, con 596.049.920 parámetros totales según los metadatos de safetensors. El pipeline declarado es `text-generation` y los tags incluyen `qwen3`, `conversational`, `text-generation-inference` y `endpoints_compatible`, lo que sitúa al modelo en el ecosistema estándar de transformers para generación de texto conversacional. El repositorio ocupa 7,2 GB.

La característica definitoria no es su rendimiento, sino su naturaleza experimental: el nombre del repositorio apunta a una intervención sobre la capa 22 del modelo ("camada-22") con algún tipo de modificación de prompt numérico. Se trata, por tanto, de un artefacto orientado a investigación en interpretabilidad y edición de representaciones internas, no de un modelo listo para producción.

La model card es la plantilla automática de HuggingFace y no contiene ni una sola sección completada: no hay información sobre datos de entrenamiento, licencia, idiomas, contexto, evaluación ni uso previsto. Cualquier despliegue exige una evaluación propia previa. El modelo acumula 500 descargas y 0 likes desde su creación el 25 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, según el tag `qwen3`); configuración exacta no disponible |
| Parametros totales | 596.049.920 (~596 M) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE; no confirmado por el autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors; no se han publicado versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 7,2 GB |
| Pipeline | text-generation |
| Descargas / likes | 500 / 0 |
| Fecha de creacion | 2026-10-25 |

## Arquitectura y entrenamiento

Los tags del repositorio identifican la arquitectura como Qwen3, es decir, un transformer decoder-only con atención causal, normalización RMSNorm y las innovaciones propias de esa familia (atención con query/key normalization y, en modo thinking, decodificación con razonamiento explícito). No obstante, el autor no ha publicado `config.json` comentado, número de capas, dimensión oculta, cabezas de atención ni vocabulario, por lo que no es posible confirmar la configuración exacta ni si se ha preservado la funcionalidad de modo pensamiento.

No hay información sobre datos de entrenamiento, número de tokens, composición del corpus ni sobre si hubo ajuste por instrucciones, RLHF o DPO. La model card deja todas las secciones de "Training Details" como `[More Information Needed]`. El nombre del repositorio sugiere una intervención sobre la capa 22 con una modificación de prompt de tipo numérico, lo que encaja con técnicas de edición de activaciones o de análisis de circuitos, pero se trata de una inferencia a partir del identificador y no de un dato confirmado. El tamaño del repositorio (7,2 GB) es muy superior a los ~1,2 GB que ocuparían los pesos en bf16 y a los ~2,4 GB en fp32, lo que apunta a la coexistencia de varios checkpoints o de estados adicionales; tampoco está documentado.

## Capacidades

Las siguientes capacidades se derivan de los tags y del pipeline declarado, no de documentación del autor:

- Generación de texto autoregresiva en formato conversacional (tag `conversational`).
- Compatibilidad con el stack de transformers y con text-generation-inference, lo que permite servirlo mediante TGI o endpoints compatibles.
- Compatibilidad declarada con endpoints de inferencia (`endpoints_compatible`).
- Capacidades multilingües: no disponibles; no se han declarado idiomas.
- Tool calling / function calling: no disponible, no documentado.
- Razonamiento multi-paso o modo thinking: no disponible; se desconoce si la intervención sobre la capa 22 preserva el modo de razonamiento de la familia Qwen3.
- Capacidades de visión o audio: no disponibles (el pipeline es exclusivamente de texto).

## Casos de uso

- Investigación en interpretabilidad: comparar las activaciones de la capa 22 de este checkpoint con las del Qwen3 base para aislar el efecto de la intervención sobre la representación interna, usando ganchos (`hooks`) de PyTorch para extraer y contrastar estados ocultos.
- Edición y cirugía de modelos: servir como referencia reproducible de una intervención concreta, útil para validar si técnicas de edición de capas preservan la coherencia del texto generado en tareas cortas.
- Análisis de degradación controlada: al ser una variante potencialmente alterada, sirve para estudiar cómo se degrada la perplejidad y la coherencia cuando se modifica una capa intermedia, comparando contra el modelo original.
- Prototipado rápido en local: con ~596 M de parámetros cabe en cualquier GPU de consumo en bf16, lo que permite montar un pipeline de generación de texto de prueba sin infraestructura dedicada.
- Generación de datos sintéticos a pequeña escala para filtrado o clasificación por prompting, siempre con revisión humana y sin asumir calidad de instrucción, dado que no se ha confirmado un ajuste conversacional.
- Docencia y demostraciones sobre el ciclo de vida de un modelo en HuggingFace: ejemplo real de repositorio con metadatos mínimos, útil para enseñar a auditar fichas de modelos antes de usarlos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto, y el autor no aporta comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para los pesos (cálculo a partir de 596 M de parámetros): ~2,4 GB en fp32, ~1,2 GB en bf16/fp16, ~0,6 GB en int8 y ~0,3 GB en int4.
- VRAM total recomendada para inferencia: 3-4 GB en bf16 incluyendo caché KV y overhead del runtime para contextos moderados; el contexto real soportado no está documentado.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, así como en portátiles con 6-8 GB de VRAM. También es viable en CPU para pruebas puntuales.
- GPU de centro de datos: T4, L4, L40S, A10G y A100 son sobredimensionadas para el tamaño del modelo; su uso solo se justifica por concurrencia o por integrarse en infraestructura existente.
- Opciones de despliegue: transformers (vía `AutoModelForCausalLM`), TGI (el tag `text-generation-inference` lo declara compatible), y vLLM si la arquitectura Qwen3 subyacente se conserva intacta. No hay GGUF publicado, por lo que llama.cpp u Ollama requerirían una conversión propia desde safetensors.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos comparables proceden de sus fichas públicas y deben verificarse antes de su publicación; los de este repositorio figuran como "no disponible" cuando el autor no los aporta.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `luisastellet/qwen-metaphor-unke-camada-22-prompt-numerico` | 596 M | no disponible | no disponible | safetensors, transformers | Checkpoint experimental derivado de Qwen3; sin evaluación publicada |
| Qwen3-0.6B | ~0,6 B | 32.768 tokens (ampliable por YaRN) | Apache 2.0 | safetensors, GGUF, múltiples cuantizaciones | Modelo base de referencia de la familia; documentación y benchmarks completos |
| Qwen2.5-0.5B-Instruct | ~0,5 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ | Alternativa conversacional consolidada, con tool calling documentado |
| SmolLM2-360M-Instruct | ~0,36 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Opción más ligera para entornos muy restringidos |

## Limitaciones y advertencias

- Ausencia total de documentación: licencia, idiomas, contexto, datos de entrenamiento y evaluación figuran como `[More Information Needed]`. Sin licencia explícita no se puede asumir permiso de uso comercial.
- Riesgo elevado de alucinación y de degradación de la coherencia si la intervención sobre la capa 22 altera el comportamiento del modelo base; no hay ninguna evaluación que lo descarte.
- No se ha confirmado que el ajuste conversacional se haya preservado: el tag `conversational` puede ser heredado del modelo original y no reflejar el estado real del checkpoint.
- Longitud de contexto desconocida: planificar cualquier integración asumiendo un límite conservador y validarlo empíricamente.
- Idiomas no declarados: no se puede garantizar un comportamiento correcto en castellano ni en ningún otro idioma sin pruebas propias.
- Sin cuantizaciones publicadas: el despliegue en CPU o en GPUs muy limitadas requiere generar los GGUF y validar la pérdida de calidad.
- Procedencia y reproducibilidad: el autor no documenta la receta de intervención, por lo que los resultados no son reproducibles a partir de la ficha.
- Los resultados de la búsqueda web asociados a esta consulta corresponden a una wiki de un videojuego y no guardan ninguna relación con el modelo; no se ha localizado bibliografía ni discusión técnica sobre este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/luisastellet/qwen-metaphor-unke-camada-22-prompt-numerico
- Paper citado en los tags (`arxiv:1910.09700`, Lacoste et al., 2019, sobre estimación de impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental de ML referenciada en la plantilla de la model card: https://mlco2.github.io/impact
- Repositorio, paper o demo del autor: no disponibles.
