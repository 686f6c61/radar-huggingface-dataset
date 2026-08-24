# qaqab/Qwen3.8-27B-Uncensored-Q4_K_M-GGUF

## Resumen

Qwen3.8-27B-Uncensored es una versión cuantizada del modelo Qwen/Qwen3.8-27B, publicado por el usuario qaqaq en HuggingFace, que ha sido sometido a un proceso de "abliteración" para reducir sustancialmente el comportamiento de rechazo del modelo original. Esta técnica, implementada mediante la herramienta Heretic, elimina direcciones de rechazo en los pesos del modelo sin realizar fine-tuning ni añadir datos de entrenamiento adicionales, preservando las capacidades generales del modelo base. El modelo resultante se distribuye en formato GGUF para su uso con llama.cpp y es compatible con decodificación especulativa mediante el cabezal MTP (multi-token prediction) integrado.

El modelo base, Qwen3.8-27B, es un modelo multimodal denso desarrollado por el equipo Qwen de Alibaba, con arquitectura `Qwen3_5ForConditionalGeneration`, 64 capas, 248.320 tokens de vocabulario y una ventana de contexto de 262.144 tokens. Incluye soporte para visión, tool calling, agentes y razonamiento multi-paso. La versión "uncensored" mantiene intactas estas capacidades, aunque con un comportamiento de rechazo reducido. El lanzamiento incluye múltiples cuantizaciones (IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0), todas con el cabezal MTP verificado y preservado, así como variantes sin MTP para tiempos de ejecución que requieren un modelo de borrador explícito.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (dense multimodal) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | No aplica (dense) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | IQ2_M, IQ4_XS, Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso multimodal con 64 capas, diseñado por el equipo Qwen de Alibaba para manejar texto e imágenes. Incluye un cabezal de predicción multi-token (MTP) de una capa, que se utiliza para decodificación especulativa, y un codificador de visión integrado. El modelo ha sido entrenado con datos que abarcan código, razonamiento, matemáticas y contenido multilingüe, y es compatible con tool calling, agentes y modo de pensamiento.

La versión "uncensored" se ha generado mediante una técnica de **abliteración** implementada con la herramienta Heretic, que co-minimiza el recuento de rechazos contra la divergencia KL del modelo base. Este proceso se ejecuta en bf16 sin cuantización intermedia, y los pesos resultantes se fusionan en el modelo base. Los tensores `mtp.*` se copian literalmente del checkpoint base para preservar el cabezal MTP. La matriz de importancia (imatrix) se calcula directamente desde el modelo f16, no desde una cuantización intermedia. El modelo publicado es una cuantización de este modelo abliterado, no un round-trip de cuantización.

## Capacidades

- Generación de texto y razonamiento multi-paso, incluyendo modo de pensamiento (thinking mode).
- Comprensión y análisis de imágenes (multimodal, con el codificador visual integrado).
- Tool calling / function calling para integración con herramientas externas.
- Soporte para agentes y flujos de trabajo multi-paso.
- Capacidades multilingües, principalmente inglés y chino.
- Decodificación especulativa mediante MTP integrado (en las versiones fusionadas) o modelo de borrador separado.
- Ventana de contexto larga de 262K tokens para documentos extensos o conversaciones de largo recorrido.

## Casos de uso

- **Asistente de programación local**: el modelo puede generar código y razonar sobre problemas de programación, aprovechando su contexto de 262K tokens para analizar repositorios completos. Su capacidad de tool calling permite integrarlo en IDEs o pipelines de CI/CD.
- **Análisis de documentos extensos**: con la ventana de contexto de 262K tokens, se puede procesar documentos técnicos largos, contratos o informes completos en una sola pasada, sin necesidad de fragmentación.
- **Chat de atención al cliente**: el modelo gestiona conversaciones multi-turno con contexto largo, reduciendo los rechazos automáticos que pueden aparecer en modelos estándar. Es adecuado para entornos donde se requiera respuestas fluidas sin bloqueos por contenido.
- **Generación de contenido creativo**: útil para escribir historias, guiones o contenido publicitario sin las restricciones habituales de los modelos alineados. La reducción de rechazos facilita la exploración de temas sensibles.
- **Análisis de imágenes con razonamiento**: la capacidad multimodal permite combinar imágenes y texto, por ejemplo, para inspección visual de productos o análisis de diagramas técnicos.
- **Despliegue local en hardware de consumo**: con cuantizaciones como IQ2_M (10,6 GB) o Q4_K_M (16,8 GB), se puede ejecutar en GPUs de consumo como la RTX 3090 o 4090, o en Apple Silicon mediante Metal, para prototipos y aplicaciones de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica de rendimiento que se proporciona es la perplexity en wikitext-2, medida por el autor del modelo para las distintas cuantizaciones:

| Archivo | PPL (wikitext-2) | vs f16 |
|---|---|---|
| f16 (baseline, no publicado) | 7.1557 +/- 0.25104 | - |
| Q5_K_M | 7.1573 +/- 0.25055 | +0.0016 |
| IQ4_XS | 7.1583 +/- 0.25019 | +0.0026 |
| Q6_K | 7.1689 +/- 0.25149 | +0.0132 |
| Q8_0 | 7.1764 +/- 0.25195 | +0.0207 |
| Q4_K_M | 7.1814 +/- 0.25227 | +0.0257 |
| IQ2_M | 7.8581 +/- 0.27481 | +0.7024 |

La única diferencia significativa es la de IQ2_M, que se sitúa a unas 2,8 desviaciones estándar por encima de la baseline. El resto de cuantizaciones no son distinguibles entre sí ni de f16 dentro del error estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: depende de la cuantización. Para Q4_K_M (16,8 GB) se necesitan al menos 18-20 GB de VRAM; para IQ2_M (10,6 GB) se puede usar con 12 GB. Las versiones Q6_K (22,4 GB) y Q8_0 (29,0 GB) requieren 24 GB o más.
- **GPU recomendadas**: RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_M; A100 (40/80 GB) o H100 (80 GB) para Q8_0 y para ejecutar la f16.
- **Compatible con GPU de consumo**: sí, las versiones IQ2_M, IQ4_XS y Q4_K_M caben en GPU de consumo de 16-24 GB.
- **Opciones de despliegue**: llama.cpp (directo), Ollama, vLLM (con formato GGUF), TGI (si se convierte a safetensors), y MLX en Apple Silicon.
- **Latencia y rendimiento**: no se han publicado métricas específicas. En una RTX 4090, se espera un rendimiento de 20-40 tokens/s para Q4_K_M, y de 5-10 tokens/s para Q8_0. La decodificación especulativa con el MTP head puede acelerar la generación entre un 20-40% en tareas de razonamiento.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,3B | 262K | safetensors | Apache-2.0 | Modelo original, alineado y multimodal |
| Qwen3.8-27B-Uncensored (este) | 27,3B | 262K | GGUF (varios) | Apache-2.0 | Abliterado, sin rechazos |
| Qwen3.8-27B-Uncensored (choz) | 27,3B | 262K | GGUF (Q4_K_M) | Apache-2.0 | Variante similar, mismo proceso |
| Llama 3.1 27B (si existiera) | - | - | - | - | No se dispone de datos comparables |

## Limitaciones y advertencias

- **Reducción de rechazos no eliminación**: el comportamiento de rechazo se ha reducido sustancialmente, pero no se ha eliminado por completo. El autor no proporciona métricas exactas de la tasa de rechazo.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas de actualidad o de alta especificidad.
- **Limitaciones de idioma**: el modelo está entrenado principalmente en inglés y chino. Su rendimiento en otros idiomas, como el español, puede ser inferior.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene condiciones específicas de uso (ver licencia de Qwen). Se recomienda revisar la política de uso del modelo base.
- **Caveat de producción**: la abliteración puede afectar a la coherencia en tareas de razonamiento complejo. Es recomendable evaluar el modelo en el dominio específico antes de desplegarlo en producción.
- **MTP y decodificación especulativa**: el cabezal MTP se ha entrenado contra el modelo base, no contra el modelo abliterado. Esto puede reducir la tasa de aceptación del draft, aunque la salida se verifica siempre contra el modelo objetivo, por lo que la calidad no se ve afectada.

## Enlaces

- [Modelo en Hugging Face: qaqab/Qwen3.8-27B-Uncensored-Q4_K_M-GGUF](https://huggingface.co/qaqab/Qwen3.8-27B-Uncensored-Q4_K_M-GGUF)
- [Modelo base Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Repositorio GitHub de Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [Repositorio GitHub de la versión uncensored](https://github.com/Wassimyounes01/qwen38-uncensored)
- [Variante en Ollama](https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored)
