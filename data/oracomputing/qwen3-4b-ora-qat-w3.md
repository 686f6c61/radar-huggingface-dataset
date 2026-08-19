# oracomputing/Qwen3-4B-ORA-QAT-W3

## Resumen

Qwen3-4B-ORA-QAT-W3 es una cuantizacion 3-bit weight-only del modelo Qwen/Qwen3-4B, desarrollada por Ora Computing mediante un pipeline propietario de entrenamiento consciente de cuantizacion (QAT, por sus siglas en ingles). El resultado es un checkpoint aproximadamente 3,7 veces mas pequeno que el original en bf16 (2,2 GB frente a unos 8 GB), con una retencion media de precision del 96,5% en cinco benchmarks de referencia. Esta pensado para reducir el coste de inferencia y permitir ejecutar el modelo en hardware con poca memoria sin sacrificar demasiada calidad.

El modelo mantiene las capacidades del base Qwen3-4B, incluido el modo de razonamiento (thinking mode), tool calling y soporte multilingue, aunque la informacion publicada no detalla los idiomas soportados. Para aprovechar el empaquetado de pesos de 3 bits es necesario servirlo con vLLM version 0.25.0 o superior (formato Humming WNA16); con Transformers los pesos se descomprimen a bf16 en memoria, perdiendo la ventaja de tamano. La licencia es personalizada de Ora Computing, por lo que conviene revisar sus terminos antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-4B) con cuantizacion 3-bit weight-only |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3-bit weight-only (W3), empaquetado Humming WNA16 para vLLM; descompresion a bf16 con Transformers |
| Idiomas soportados | No disponible |
| Licencia | ora-custom-model-license (licencia personalizada de Ora Computing) |
| Formato de pesos | safetensors (pesos empaquetados 3-bit) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen/Qwen3-4B, un transformer denso de 4.022 millones de parametros con capacidad de razonamiento hibrido (thinking y non-thinking). Ora Computing aplica un pipeline propietario de QAT para cuantizar los pesos a 3 bits, reduciendo el peso real por parametro de 16 bits (bf16) a 4,37 bits efectivos (Real BPW), lo que explica el factor de compresion de ~3,7×. No se han publicado detalles sobre el dataset de entrenamiento, el numero de tokens utilizados en el proceso QAT ni las tecnicas de regularizacion empleadas. La cuantizacion se almacena en formato compressed-tensors, compatible con vLLM (inferencia empaquetada) y con Transformers (descompresion a bf16).

## Capacidades

- Generacion de texto conversacional y de proposito general, heredadas del base Qwen3-4B.
- Modo de razonamiento (thinking mode) activable mediante `enable_thinking=True` en el chat template, con parametros de sampling recomendados (temperature 0,6, top_p 0,95, top_k 20).
- Tool calling y function calling, avalado por el resultado en el benchmark BFCL-v3 (81,97).
- Razonamiento matematico y generacion de codigo, con recomendaciones especificas de prompt para benchmarks (p. ej. usar `\boxed{}` para respuestas matematicas).
- Capacidades multilingues del modelo base, aunque no se especifican los idiomas concretos en la documentacion.
- Soporte para generacion de hasta 32.768 tokens de salida en consultas habituales y hasta 81.920 en problemas complejos de matematicas o programacion.

## Casos de uso

- Inferencia en GPU de consumo con poca VRAM: con un tamano de repo de 2,2 GB, el modelo puede ejecutarse en tarjetas de 4-6 GB de VRAM usando vLLM empaquetado, lo que permite desplegar un LLM de 4B en hardware asequible.
- Servicio de chat con API compatible con OpenAI: `vllm serve oracomputing/Qwen3-4B-ORA-QAT-W3` expone un endpoint `/v1/chat/completions` listo para integrar en aplicaciones existentes.
- Agentes con tool calling: el rendimiento en BFCL-v3 (81,97) indica que puede gestionar llamadas a funciones de forma fiable, util para orquestar herramientas en pipelines de automatizacion.
- Razonamiento paso a paso en dominios STEM: el modo thinking y las recomendaciones de prompt permiten resolver problemas de matematicas y programacion con explicaciones detalladas.
- Generacion de codigo en entornos con restricciones de memoria: por ejemplo, en laptops o mini-PCs con GPU integrada, manteniendo una calidad cercana al modelo original en tareas de codigo (MBPP+ 72,75).
- Evaluacion y experimentacion en entornos de investigacion: al ser un checkpoint cuantizado con QAT, sirve como referencia para estudiar el impacto de la cuantizacion extrema en tareas de razonamiento y generacion.

## Benchmarks y rendimiento

La model card publica resultados comparativos frente al modelo base en bf16, obtenidos con un harness lm-eval ligeramente modificado y aplicado de forma identica a ambos modelos.

| Modelo | MMLU-Pro | GSM8K Platinum | IFEval | MBPP+ | BFCL-v3 | Media | Real BPW | Retencion |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen3-4B (bf16) | 49,20 | 89,99 | 84,89 | 71,69 | 84,81 | 76,12 | 16,00 | 100,0% |
| ORA-QAT-W3 | 44,56 | 85,03 | 82,97 | 72,75 | 81,97 | 73,46 | 4,37 | 96,5% |

La retencion media es del 96,5%. Destaca que en MBPP+ el modelo cuantizado supera al original (72,75 frente a 71,69), mientras que la mayor perdida relativa se produce en MMLU-Pro (49,20 a 44,56, un 9,4% menos).

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos empaquetados 3-bit, el modelo ocupa unos 2,2 GB en disco, por lo que la VRAM necesaria para inferencia con vLLM se situa en torno a 3-4 GB incluyendo overhead de runtime y cache de KV.
- Si se usa Transformers con descompresion a bf16, la memoria requerida sube a aproximadamente 8 GB solo para los pesos, mas overhead.
- GPU recomendadas: tarjetas de consumo con 6 GB o mas de VRAM (p. ej. RTX 3060, RTX 4060, RTX 4070) pueden ejecutar el modelo empaquetado; para descompresion bf16 se necesitan al menos 12 GB.
- Opciones de despliegue: vLLM (>=0.25.0) como via principal para inferencia empaquetada; Transformers con `compressed-tensors>=0.18` como alternativa (descomprime a bf16). No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion publicada.

## Comparativa con modelos similares

La unica comparativa publicada es contra el modelo base sin cuantizar. No se dispone de datos de otras cuantizaciones (GPTQ, AWQ, GGUF) del mismo modelo ni de otros modelos de 3 bits para establecer una tabla comparativa externa.

| Modelo | Parametros | Real BPW | Tamano aprox. | Retencion media | Licencia |
|---|---:|---:|---:|---:|---|
| Qwen3-4B (bf16) | 4,02 B | 16,00 | ~8 GB | 100% | Apache 2.0 |
| Qwen3-4B-ORA-QAT-W3 | 4,02 B | 4,37 | ~2,2 GB | 96,5% | ora-custom-model-license |

## Limitaciones y advertencias

- Licencia personalizada (ora-custom-model-license): no es una licencia open source estandar; es necesario revisar los terminos para uso comercial y redistribucion.
- La cuantizacion 3-bit introduce una perdida media del 3,5% respecto al original, con mayor impacto en tareas de conocimiento general (MMLU-Pro cae un 9,4%).
- Con Transformers, los pesos se descomprimen a bf16 en memoria, por lo que la ventaja de tamano solo se mantiene usando vLLM con Humming WNA16.
- Se requiere `compressed-tensors>=0.18` para una correcta decodificacion; versiones anteriores (0.17.x) pueden malinterpretar los pesos.
- No se documentan sesgos especificos ni evaluaciones de seguridad del modelo cuantizado; se heredan los riesgos del base Qwen3-4B, incluida la posibilidad de alucinaciones.
- La longitud de contexto no esta especificada; las recomendaciones de generacion de hasta 81.920 tokens sugieren una ventana larga, pero no se confirma el valor exacto.
- El modo thinking con decodificacion greedy puede degradar la calidad o provocar bucles infinitos; deben respetarse los parametros de sampling recomendados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oracomputing/Qwen3-4B-ORA-QAT-W3
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Sitio web de Ora Computing: https://www.oracomputing.com/
- Blog de Ora Computing: https://www.oracomputing.com/en/blog
- Repositorio Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Ficha de Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
