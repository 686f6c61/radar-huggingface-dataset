# maritaca-ai/S5-nano-FP8

## Resumen

S5-nano es un modelo de 4B parámetros desarrollado por Maritaca AI a partir de Qwen3.5-4B mediante preentrenamiento continuado y posterior entrenamiento (post-training). Está diseñado específicamente para mejorar el rendimiento en tareas en portugués brasileño, manteniendo al mismo tiempo un buen desempeño en llamadas a funciones, uso de herramientas y salidas estructuradas. La versión documentada aquí, S5-nano-FP8, es la variante cuantizada a FP8 del checkpoint original, pensada para su despliegue en vLLM y SGLang sobre GPUs con soporte nativo de FP8.

El modelo es multimodal (image-text-to-text) y soporta una ventana de contexto de hasta 262.144 tokens. Incorpora dos modos de operación: Think, que razona antes de responder y es el modo por defecto, e Instruct, que responde directamente sin paso de razonamiento. Los pesos incluyen una capa MTP (multi-token prediction) que habilita decodificación especulativa.

La relevancia de esta ficha radica en que S5-nano-FP8 reduce el peso del modelo de 9,3 GB (BF16) a 5,8 GB, lo que facilita su despliegue en infraestructura con memoria limitada sin renunciar a las capacidades del modelo base. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-4B; incluye capa MTP para decodificacion especulativa |
| Parametros totales | 4.659.865.088 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 (E4M3 en capas lineales, escala por canal de salida, activaciones cuantizadas dinamicamente por token); embeddings, encoder de vision, capa MTP y algunas proyecciones pequenas permanecen en BF16 |
| Idiomas soportados | Portugues (pt) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

S5-nano se construye sobre Qwen3.5-4B, un transformer multimodal que procesa texto e imagen. El entrenamiento de Maritaca AI consistió en un preentrenamiento continuado seguido de un post-training orientado a mejorar el rendimiento en benchmarks brasileños y a reforzar capacidades de function calling, tool use y salidas estructuradas. La model card no detalla el número de tokens de entrenamiento ni la composición exacta del dataset, por lo que estos datos no están disponibles.

La innovación técnica más destacable es la inclusión de una capa MTP (multi-token prediction) en los pesos, que permite decodificación especulativa y, por tanto, acelerar la generación. La versión FP8 aplica cuantización E4M3 a las capas lineales con una escala por canal de salida y cuantiza las activaciones dinámicamente por token durante la inferencia; los embeddings, el encoder de visión, la capa MTP y algunas proyecciones pequeñas se mantienen en BF16 para preservar precisión. No se especifica en la información disponible si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en dos modos: Think (razonamiento previo a la respuesta, modo por defecto) e Instruct (respuesta directa).
- Procesamiento multimodal image-text-to-text: acepta imágenes junto con texto.
- Soporte de function calling y tool use, con énfasis declarado en salidas estructuradas.
- Capacidades de agentes y razonamiento multi-paso, apoyadas por el modo Think y la ventana de contexto de 262.144 tokens.
- Capacidades multilingües limitadas a portugués e inglés.
- Decodificación especulativa mediante capa MTP integrada en los pesos.
- Rendimiento reforzado en benchmarks brasileños nativos y en portugués traducido.

## Casos de uso

- Atención al cliente en portugués brasileño: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana, manteniendo coherencia en diálogos extensos y usando el modo Instruct para respuestas rápidas.
- Generación de código y automatización de pipelines: el soporte de function calling y salidas estructuradas permite integrarlo en flujos de CI/CD para generar parches, invocar herramientas o producir JSON validable.
- Agentes autónomos multi-paso: el modo Think y la capa MTP facilitan tareas de planificación y ejecución encadenada con latencia reducida gracias a la decodificación especulativa.
- Análisis de documentos con imágenes: al ser image-text-to-text, puede procesar capturas, formularios escaneados o gráficos junto con texto en aplicaciones de extracción de información.
- Asistencia técnica en portugués para soporte interno: el ajuste específico en benchmarks brasileños lo hace adecuado para bases de conocimiento y FAQ en pt-BR.
- Despliegue en GPUs con FP8 nativo: la versión FP8 (5,8 GB) permite servir el modelo en vLLM o SGLang sobre GPUs Ada, Hopper o Blackwell con menor huella de memoria que la BF16.
- Prototipado rápido en entornos con VRAM limitada: la variante GGUF Q4_K_M (2,8 GB) permite ejecución en llama.cpp y aplicaciones compatibles para pruebas locales.

## Benchmarks y rendimiento

Resultados publicados para el checkpoint original S5-nano evaluado en BF16 sobre tareas de texto. Las métricas primarias se ponderan por igual. La columna Coverage indica cuántos benchmarks cubre cada modo (23/23 en Think).

| Modelo | Modo | Native BR | Translated PT | Non-native | Total | Coverage |
|---|---|---|---|---|---|---|
| S5-nano | Think | 83,74 | 86,94 | 54,11 | 75,25 | 23/23 |
| Qwen3.5-4B | Think | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible resultados desglosados por benchmark individual (MMLU, HumanEval, GSM8K, etc.) ni datos para el modo Instruct ni para la variante FP8. Los resultados completos pueden consultarse en el Observatório Maritaca.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB para la variante FP8 (5,8 GB de pesos más overhead de KV cache y activaciones); alrededor de 10 GB para BF16 (9,3 GB de pesos); 2,8-4,6 GB para las variantes GGUF Q4_K_M y Q8_0.
- GPU recomendadas: GPUs con soporte nativo de FP8 (arquitecturas Ada, Hopper y Blackwell) para la variante FP8; por ejemplo, L4, L40S, H100 o B200. Para BF16, A100 o H100.
- GPU de consumo: la variante FP8 puede caber en GPUs consumer con soporte FP8, como RTX 4090 o RTX 5090; las variantes GGUF Q4_K_M y Q8_0 caben en GPUs consumer con 4-8 GB de VRAM mediante llama.cpp.
- Opciones de despliegue: vLLM y SGLang para FP8 y BF16; llama.cpp y aplicaciones compatibles para GGUF (BF16, Q8_0, Q4_K_M).
- Latencia y throughput: no disponibles en la información proporcionada; la capa MTP permite decodificación especulativa, lo que puede reducir la latencia de generación, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| S5-nano-FP8 | ~4B | 262.144 | Apache 2.0 | safetensors FP8, BF16, GGUF | Ajustado para pt-BR, multimodal, MTP |
| Qwen3.5-4B | ~4B | no disponible | no disponible | no disponible | Modelo base; S5-nano parte de él |
| Alternativas de ~4B multimodal | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información |

La información disponible solo permite comparar con el modelo base Qwen3.5-4B, del que no se detallan especificaciones ni resultados. No se dispone de datos de otros modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al estar ajustado sobre todo a portugués brasileño, puede presentar sesgos derivados de la composición del corpus de preentrenamiento continuado.
- Riesgo de alucinación: inherente a los modelos generativos; el modo Think puede producir cadenas de razonamiento plausibles pero incorrectas. No se han publicado evaluaciones específicas de factualidad.
- Limitaciones de idioma: solo se declaran portugués e inglés; el rendimiento en otros idiomas no está garantizado y probablemente sea inferior.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información disponible.
- Caveats para producción: la variante FP8 requiere GPUs con soporte nativo de FP8 para aprovechar su ventaja; en GPUs sin ese soporte el rendimiento puede degradarse. No se han publicado cifras de latencia ni throughput, por lo que la planificación de capacidad debe validarse empíricamente. Los datos de benchmarks corresponden al checkpoint BF16 original, no a la variante FP8.

## Enlaces

- [Hugging Face: maritaca-ai/S5-nano-FP8](https://huggingface.co/maritaca-ai/S5-nano-FP8)
- [Modelo base BF16: maritaca-ai/S5-nano](https://huggingface.co/maritaca-ai/S5-nano)
- [Versiones GGUF: maritaca-ai/S5-nano-GGUF](https://huggingface.co/maritaca-ai/S5-nano-GGUF)
- [Modelo base original: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Observatório Maritaca (resultados de evaluación)](https://maritaca-ai.github.io/observatorio-maritaca/)
