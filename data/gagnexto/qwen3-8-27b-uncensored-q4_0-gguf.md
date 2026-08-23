# gagnexto/Qwen3.8-27B-Uncensored-Q4_0-GGUF

## Resumen

El modelo `gagnexto/Qwen3.8-27B-Uncensored-Q4_0-GGUF` es una conversión a formato GGUF del modelo `orcarouter/Qwen3.8-27B-Uncensored`, un finetune del modelo Qwen3.8-27B de Alibaba Cloud, modificado mediante la técnica de *abliteration* para eliminar los mecanismos de rechazo y censura del modelo original. El resultado es un modelo de lenguaje de 27 320 697 856 parámetros (27,3 mil millones) con una ventana de contexto nativa de 262 144 tokens, diseñado para ejecutarse localmente con `llama.cpp` y otros runtimes compatibles con GGUF.

La relevancia de este modelo radica en su uso para *red teaming*, investigación de seguridad y pruebas de robustez de sistemas de IA, donde se requiere un modelo que no aplique filtros de contenido durante la generación. Al estar cuantizado en Q4_0, ocupa aproximadamente 15,7 GB en disco, lo que lo hace ejecutable en hardware de consumo con al menos 16 GB de VRAM o mediante CPU con RAM suficiente. El modelo hereda la licencia Apache 2.0 del modelo base, lo que permite uso comercial y modificación.

Aunque el *pipeline* declarado en Hugging Face es `image-text-to-text`, la información disponible en la documentación del modelo base y en los blogs de OrcaRouter no confirma capacidades de visión; se recomienda tratar este modelo como un modelo de lenguaje puro.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens |
| Tipos de cuantizacion | Q4_0 (GGUF) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no incluido, solo GGUF) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-27B` es un transformer denso de 27 000 millones de parámetros con una arquitectura de atención estándar y soporte para *multi-token prediction* (MTP), que permite una decodificación más rápida. El modelo `orcarouter/Qwen3.8-27B-Uncensored` se obtuvo mediante un proceso de *abliteration*, una técnica de post-training que elimina las capas de rechazo del modelo original, manteniendo las capacidades generales de generación de texto, razonamiento y *function calling*. El proceso de *abliteration* no modifica los pesos de forma sustancial, sino que elimina las direcciones de activación asociadas a la negativa de solicitudes, lo que produce un modelo que responde sin filtros de seguridad.

El modelo `g4gnexto` ha sido convertido a GGUF a partir de los pesos del modelo abliterado mediante la herramienta `gguf-my-repo` de la comunidad de `llama.cpp`. No se dispone de información detallada sobre el conjunto de datos de entrenamiento del modelo base ni sobre el proceso de *fine-tuning* aplicado por OrcaRouter. La cuantización Q4_0 es una cuantización de 4 bits que reduce el tamaño del modelo original (alrededor de 54 GB en BF16) a 15,7 GB, manteniendo una pérdida de calidad mínima.

## Capacidades

- Generación de texto fluida en inglés y chino, con razonamiento lógico y matemático básico.
- Soporte de *function calling* (llamadas a herramientas) y *tool calling*, según los tags del modelo.
- Capacidad de *reasoning* (modo de pensamiento) similar a la del modelo Qwen3, con generación de cadenas de razonamiento antes de la respuesta final.
- Soporte de *multi-step reasoning* y ejecución de agentes, aunque no se han publicado benchmarks específicos.
- No se ha confirmado el soporte de visión, aunque el *pipeline_tag* de Hugging Face indica `image-text-to-text`. La información disponible en los blogs de OrcaRouter describe el modelo como un modelo de lenguaje, sin mención de entrada visual.
- Al ser *uncensored*, no aplica los filtros de seguridad estándar de los modelos Qwen, por lo que puede generar contenido que otros modelos rechazan.

## Casos de uso

- **Red teaming de sistemas de IA**: el modelo permite probar cómo un sistema de IA podría generar respuestas dañinas o no seguras, lo que ayuda a identificar vulnerabilidades en los filtros de seguridad de otros sistemas.
- **Investigación en seguridad de modelos**: investigadores pueden analizar el comportamiento de un modelo sin alineación de seguridad para estudiar sesgos, alucinaciones y estrategias de mitigación.
- **Generación de contenido creativo sin restricciones**: escritores y creadores de contenido pueden usarlo para explorar temas tabú o de nicho sin censura, siempre que se respeten las leyes locales.
- **Pruebas de robustez de agentes**: al integrar el modelo en pipelines de agentes, se puede evaluar cómo responde a entradas adversarias o solicitudes que otros modelos rechazan.
- **Análisis de sesgos y alucinación**: al no tener filtros, el modelo es útil para estudiar los sesgos inherentes del modelo base Qwen3.8-27B sin interferencia de mecanismos de seguridad.
- **Despliegue local en entornos aislados**: para entornos con requisitos estrictos de privacidad, el GGUF permite ejecutar el modelo en local sin conexión a la nube, manteniendo los datos internamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo `g4gnexto/Qwen3.8-27B-Uncensored-Q4_0-GGUF` ni para el modelo base `orcarouter/Qwen3.8-27B-Uncensored` en la información disponible. El modelo Qwen3.8-27B original reporta resultados en MMLU, HumanEval y GSM8K, pero no se dispone de los datos en esta ficha. Por lo tanto, no se pueden proporcionar cifras comparativas sin riesgo de inventar datos.

## Requisitos de hardware

- **VRAM estimada**: el GGUF Q4_0 ocupa 15,7 GB en memoria. Para inferencia en GPU, se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A10G). Con 24 GB de VRAM (RTX 3090/4090) se puede ejecutar con comodidad.
- **CPU y RAM**: en modo CPU, se necesita al menos 16 GB de RAM disponible para el modelo, más espacio para el contexto. Un sistema con 32 GB de RAM es viable.
- **GPU recomendadas**: NVIDIA RTX 3090/4090, A100 40 GB, H100; también funciona en GPUs de Apple Silicon con suficiente memoria unificada.
- **Opciones de despliegue**: `llama.cpp` (CLI y servidor), `Ollama`, `vLLM` (si se convierten los pesos a formato compatible, aunque vLLM usa pesos en FP8/BF16), `text-generation-webui`, y cualquier runtime que soporte GGUF.
- **Latencia y throughput**: no hay datos medidos específicos, pero con una RTX 4090 se espera una velocidad de generación de 20-40 tokens/segundo para este tamaño de modelo en Q4, dependiendo del contexto y la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3 B | 262 144 | BF16/FP8 | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-Uncensored (abliterado) | 27,3 B | 262 144 | BF16/FP8 | Apache 2.0 | Hugging Face |
| Qwen3.8-27B-Uncensored-Q4_0-GGUF (este) | 27,3 B | 262 144 | Q4_0 | Apache 2.0 | Hugging Face |
| Llama-3.1-8B-Instruct (abliterado) | 8 B | 128 000 | Q4_K_M | Llama 3.1 license | Hugging Face |

La comparativa muestra que este modelo es el mismo peso del modelo abliterado, pero en formato GGUF, lo que facilita su uso en entornos de CPU y GPU de baja memoria. La principal diferencia con el modelo original es la eliminación de los filtros de seguridad. Con respecto a modelos de tamaño similar, como Llama-3.1-8B, este modelo es mucho más grande y con mayor contexto, pero requiere más recursos.

## Limitaciones y advertencias

- **Ausencia de filtros de seguridad**: el modelo puede generar contenido ofensivo, peligroso o ilegal. Su uso en producción debe restringirse a entornos controlados de investigación o *red teaming*.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas poco representados en sus datos de entrenamiento.
- **Sesgos inherentes**: al ser un modelo abliterado, los sesgos originales del modelo Qwen3.8-27B (como sesgos culturales o de género) se mantienen sin mitigación.
- **Limitaciones de idioma**: aunque se declara soporte para inglés y chino, el rendimiento en otros idiomas no está garantizado y puede ser significativamente inferior.
- **Contexto y memoria**: a pesar de tener una ventana de 262 144 tokens, el modelo puede degradar su rendimiento en contextos muy largos, especialmente en la cuantización Q4_0.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo puede tener restricciones adicionales si se redistribuye o se utiliza en aplicaciones que requieren cumplimiento de normativas específicas (por ejemplo, regulación de IA).
- **Falta de benchmarks**: no hay datos publicados de rendimiento en tareas estándar, por lo que no se puede evaluar su calidad en comparación con otros modelos.

## Enlaces

- [Hugging Face: gagnexto/Qwen3.8-27B-Uncensored-Q4_0-GGUF](https://huggingface.co/gagnexto/Qwen3.8-27B-Uncensored-Q4_0-GGUF)
- [Modelo base: orcarouter/Qwen3.8-27B-Uncensored](https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored)
- [Modelo original: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Blog de OrcaRouter: Qwen 3.8 27B Uncensored Local: GGUF Quants + llama.cpp](https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally)
- [Blog de OrcaRouter: Qwen3.8-27B Uncensored GGUF: Abliterated Local Build](https://www.orcarouter.ai/blog/qwen-3-8-27b-uncensored-gguf)
- [Repositorio de GitHub: qwen38-uncensored](https://github.com/unburdened-jackinthebox365/qwen38-uncensored)
- [Guía de uso de llama.cpp](https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage)
