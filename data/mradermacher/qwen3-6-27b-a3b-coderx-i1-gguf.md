# mradermacher/Qwen3.6-27B-A3B-CoderX-i1-GGUF

## Resumen

Qwen3.6-27B-A3B-CoderX-i1-GGUF es una cuantización GGUF con imatrix del modelo ManniX-ITA/Qwen3.6-27B-A3B-CoderX, un modelo de lenguaje especializado en código derivado de la familia Qwen3.6 de Alibaba. El modelo base combina la arquitectura MoE de Qwen3.6-27B (26.2 mil millones de parámetros totales, aproximadamente 3 mil millones activos según la nomenclatura A3B) con técnicas de poda de expertos (expert-pruning) y fusión mediante OmnimergeKit, orientado a tareas de generación y razonamiento de código.

La versión GGUF publicada por mradermacher ofrece cuantizaciones de alta calidad con activación imatrix, pensadas para ejecución local eficiente en hardware de consumo. El repositorio incluye tres variantes principales (i1-Q2_K, i1-IQ3_M e i1-Q4_K_S) más un archivo de calibración imatrix para crear cuantizaciones propias. Está licenciado bajo Apache 2.0, lo que permite uso comercial sin restricciones significativas.

Su relevancia radica en que combina el rendimiento de Qwen3.6 (que soporta contexto de hasta 256K tokens en su versión base) con una especialización en código y una poda de expertos que reduce los requisitos de hardware, haciendo viable ejecutar un modelo de 26B parámetros en GPU de consumo con cuantización Q4.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con poda de expertos, basada en Qwen3.6-27B |
| Parametros totales | 26.213.016.704 (26,2 mil millones) |
| Parametros activos | Aproximadamente 3 mil millones (según nomenclatura A3B; no confirmado en la documentación) |
| Longitud de contexto | No disponible; el modelo base Qwen3.6-27B soporta 256K tokens, no confirmado para esta variante |
| Tipos de cuantizacion | i1-Q2_K (10,0 GB), i1-IQ3_M (11,8 GB), i1-Q4_K_S (15,2 GB), archivo imatrix |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base ManniX-ITA/Qwen3.6-27B-A3B-CoderX es una variante de Qwen3.6-27B de Alibaba, modificada mediante poda de expertos (expert-pruning) para reducir el número de parámetros activos de la mezcla de expertos, pasando de la configuración original densa de 27B a una configuración MoE con aproximadamente 3B activos. Esta transformación se realizó con la herramienta OmniMergeKit, que permite fusionar y podar modelos de forma controlada.

El tag MTP en la información indica soporte para Multi-Token Prediction, una técnica de decodificación que predice varios tokens a la vez para acelerar la generación. El modelo se especializa en código, como sugiere el sufijo CoderX en el nombre.

Los datos de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) no están disponibles en la documentación publicada. La cuantización GGUF de mradermacher se realizó con el método imatrix (importance matrix), que mejora la calidad de la cuantización al ponderar la importancia de los tensores.

## Capacidades

- Generación y razonamiento de código: el modelo está especializado en tareas de programación, incluyendo generación de código, depuración y explicación de fragmentos.
- Razonamiento multi-step: como variante de Qwen3.6, conserva capacidades de razonamiento híbrido (modo pensamiento y respuesta directa), aunque no se detalla en la documentación.
- Soporte de tool calling / function calling: no confirmado explícitamente para esta variante, pero Qwen3.6 base incluye esta capacidad.
- Capacidades multilingües: el modelo base Qwen3.6 soporta 51 idiomas, pero esta variante está etiquetada únicamente como inglés (en).
- Compatibilidad con agentes: no confirmada en la documentación.
- Inferencia eficiente: la cuantización GGUF permite ejecutar el modelo en hardware de consumo con baja latencia.

## Casos de uso

- **Asistente de programación local**: el modelo puede integrarse en editores de código o CLIs para autocompletar, refactorizar y explicar código, gracias a su especialización en código y a la cuantización GGUF que permite ejecutarlo en una GPU de 16 GB con Q4_K_S.
- **Generación de código en entornos sin conexión**: empresas con requisitos de privacidad pueden desplegar el modelo en infraestructura propia para generar código sin enviar datos a APIs externas, aprovechando la licencia Apache 2.0 que permite uso comercial.
- **Revisión de código automatizada**: el modelo puede analizar pull requests y sugerir mejoras, detectar errores comunes y proponer refactorizaciones, aprovechando su capacidad de razonamiento y su contexto largo (si se hereda del base).
- **Chat técnico de atención al cliente**: para resolver dudas de programación de usuarios en foros o plataformas de soporte, con un modelo que puede mantener conversaciones multi-turno.
- **Prototipado rápido de aplicaciones**: los desarrolladores pueden usar el modelo para generar esqueletos de proyectos, scripts y funciones a partir de descripciones en lenguaje natural.
- **Entrenamiento de modelos más pequeños**: el modelo puede usarse como maestro para destilar conocimiento de código en modelos más pequeños, aprovechando la poda de expertos como referencia de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks para este modelo concreto en la documentación proporcionada. La comparativa con Qwen3.6-27B base y Qwen3.6-35B-A3B se puede encontrar en las guías oficiales de Qwen, pero no se incluyen en esta ficha al no estar disponibles los datos específicos de esta variante.

## Requisitos de hardware

- **VRAM estimada para inferencia**: según la cuantización elegida:
  - i1-Q2_K: aproximadamente 10 GB de VRAM (cabe en GPUs de 12 GB)
  - i1-IQ3_M: aproximadamente 12 GB de VRAM (cabe en GPUs de 16 GB)
  - i1-Q4_K_S: aproximadamente 15 GB de VRAM (cabe en GPUs de 16 GB, con margen)
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB, RTX 4080 16 GB, RTX 4090 24 GB, o GPUs de datacenter como A100 o H100 para mayor throughput.
- **Consumer GPU**: sí, el modelo cabe en GPUs de consumo con 12-16 GB de VRAM usando las cuantizaciones Q2_K o Q4_K_S.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, llamafile, y servidores compatibles con GGUF como llama-cpp-python.
- **Latencia y throughput**: no disponibles en la documentación. Como referencia, un modelo MoE con 3B activos suele tener latencia menor que un denso de 27B, pero no hay datos concretos para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-27B-A3B-CoderX (este) | 26,2B | ~3B | No disponible | Apache 2.0 | GGUF |
| Qwen3.6-27B (dense) | 27B | 27B | 256K | Apache 2.0 | Safetensors |
| Qwen3.6-35B-A3B (MoE) | 35B | 3B | 256K | Apache 2.0 | Safetensors |
| Qwen3-Coder-30B-A3B-Instruct | 30B | 3B | 256K | Apache 2.0 | Safetensors |

El modelo de esta ficha se diferencia de Qwen3.6-27B dense en que es MoE con poda de expertos, lo que reduce el número de parámetros activos y, por tanto, el coste de inferencia, a costa de una posible reducción de calidad. Frente a Qwen3.6-35B-A3B, este modelo es más pequeño y está especializado en código. La licencia Apache 2.0 es común a todos, lo que facilita su uso comercial.

## Limitaciones y advertencias

- **Idioma limitado**: la documentación indica solo inglés, aunque el modelo base Qwen3.6 soporta 51 idiomas. El rendimiento en otros idiomas no está garantizado.
- **Sesgos y alucinación**: como cualquier modelo de lenguaje, puede generar respuestas incorrectas o alucinadas, especialmente en código, donde los errores sintácticos o lógicos pueden ser difíciles de detectar.
- **Pérdida de calidad por cuantización**: las cuantizaciones GGUF, especialmente Q2_K e IQ3, introducen pérdida de precisión que puede afectar la calidad del código generado. Se recomienda Q4_K_S para uso en producción.
- **Contexto no confirmado**: la longitud de contexto de esta variante no está documentada; si se usa con contexto largo, puede fallar si el modelo no lo soporta.
- **Modelo derivado de una fusión**: la poda de expertos y la fusión con OmniMergeKit pueden introducir comportamientos inesperados no presentes en el modelo base Qwen3.6-27B.
- **Restricciones de licencia**: aunque la licencia es Apache 2.0, se recomienda revisar la licencia del modelo base y la política de uso de Qwen para asegurar cumplimiento.
- **Sin garantías de producción**: el modelo no ha sido validado con benchmarks públicos en la información disponible, por lo que se recomienda probar exhaustivamente antes de usar en producción.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/mradermacher/Qwen3.6-27B-A3B-CoderX-i1-GGUF)
- [Modelo base ManniX-ITA/Qwen3.6-27B-A3B-CoderX](https://huggingface.co/ManniX-ITA/Qwen3.6-27B-A3B-CoderX)
- [Modelo original Qwen3.6-27B](https://huggingface.co/Qwen/Qwen3.6-27B)
- [Guía de Qwen 3.6 en InsiderLLM](https://insiderllm.com/guides/qwen-3-6-local-ai-guide/)
- [Documentación de Qwen3.6 en Unsloth](https://unsloth.ai/docs/models/qwen3.6)
- [Página de mradermacher en HuggingFace](https://huggingface.co/mradermacher)
