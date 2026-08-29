# musatur/Alpona-1.0-9B-v3

## Resumen

Alpona-1.0-9B-v3 es un modelo de lenguaje especializado en generación de código RTL (Verilog y SystemVerilog) y escritura de testbenches, desarrollado por el usuario musatur como parte de un proyecto de verificación automática de hardware. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-9B, un transformer de 9 mil millones de parámetros con 32 capas decodificadoras, del cual se descongelan las 8 capas superiores durante el entrenamiento en precisión bf16. El modelo es la tercera versión de la serie Alpona y su objetivo principal es recuperar la capacidad de generar testbenches compilables, que se perdió en la versión anterior (v2) al entrenar exclusivamente con trazas de generación de diseño. La relevancia actual radica en que aborda un problema práctico en flujos de diseño de hardware: la automatización de la verificación, un paso crítico y costoso en el desarrollo de circuitos integrados.

La versión v3 incorpora 4.915 trazas de escritura de testbenches, que representan el 16,7% del corpus de entrenamiento, con una ponderación 40/40/20 hacia diseños secuenciales, con el fin de mitigar la degradación observada en v2 para este tipo de circuitos. El modelo está pensado para su uso con la librería transformers y es compatible con endpoints de inferencia, aunque el entrenamiento aún está en progreso y no se han publicado métricas de rendimiento para esta versión concreta. La licencia se indica como "other", por lo que se deben revisar las condiciones específicas antes de un uso comercial.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3.5-9B) |
| Parametros totales | 9 mil millones (9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (entrenamiento), otros no especificados |
| Idiomas soportados | inglés (en) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (con script de renombrado para checkpoints intermedios) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder de Qwen3.5-9B, que cuenta con 32 capas. Durante el fine-tuning, solo se descongelan las 8 capas superiores (top 8 of 32), manteniendo el resto congelado, y se entrena en bf16. El método y los hiperparámetros son idénticos a los de la versión v2, diferenciándose únicamente en la composición del dataset de entrenamiento. Para v3, se añadieron 4.915 trazas de escritura de testbenches a las 24.509 trazas de generación de código ya existentes en v2, lo que supone un 16,7% del corpus total. Estas trazas provienen de un corpus de bancos de pruebas verificado y se ponderan con una distribución 40/40/20 hacia diseños secuenciales. No se menciona el uso de técnicas de RLHF o DPO; el entrenamiento parece ser un fine-tuning supervisado estándar sobre datos de generación de código y testbenches.

## Capacidades

- Generación de código RTL en Verilog y SystemVerilog, incluyendo módulos combinacionales y secuenciales (FSM).
- Escritura de testbenches compilables y verificables, con capacidad para integrarse en flujos de verificación automática.
- Generación de texto en inglés, aunque su especialización principal es el dominio de diseño de hardware.
- Soporte de reparación de fallos en diseños generados, ya que el harness de inferencia puede ejecutar reparaciones cuando el testbench compila correctamente.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Generación automática de módulos RTL para diseño de circuitos: el modelo puede producir código Verilog o SystemVerilog a partir de descripciones en lenguaje natural, acelerando la fase de diseño inicial.
- Creación de testbenches para verificación de módulos: gracias a las trazas de testbench añadidas, el modelo puede generar bancos de pruebas compilables, reduciendo el esfuerzo manual en verificación.
- Automatización de flujos de verificación en entornos de simulación: el modelo puede integrarse en pipelines de CI/CD para generar y ejecutar testbenches de forma iterativa, como se describe en el harness de inferencia.
- Generación de máquinas de estados finitos (FSM) secuenciales: la ponderación hacia diseños secuenciales hace que el modelo sea adecuado para generar FSM y sus correspondientes testbenches.
- Asistencia a diseñadores de hardware en la depuración de código RTL: el modelo puede sugerir correcciones o generar testbenches para aislar errores en módulos existentes.
- Formación y documentación técnica: puede utilizarse para explicar fragmentos de código RTL o generar ejemplos didácticos de Verilog y testbenches.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para Alpona-1.0-9B-v3 en la información disponible. La model card indica que el entrenamiento está en progreso y que no hay métricas de pass@1 para esta versión. Los datos mostrados en la tabla comparativa corresponden a la versión v2 y al modelo base sin entrenar, pero no son directamente aplicables a v3. Por tanto, no es posible evaluar su rendimiento cuantitativo en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware en la model card. Dado que el modelo tiene 9 mil millones de parámetros y se entrena en bf16, se puede estimar que la inferencia requiere al menos 18 GB de VRAM en precisión bf16, lo que implicaría GPUs como A100 (40 GB) o H100 (80 GB) para un despliegue cómodo, o RTX 4090 (24 GB) con cuantización. Sin embargo, estos valores son estimaciones genéricas y no deben tomarse como especificaciones oficiales. Las opciones de despliegue habituales para modelos de este tamaño incluyen vLLM, llama.cpp, Ollama o TGI, pero no se confirma compatibilidad específica en la documentación.

## Comparativa con modelos similares

No se proporcionan datos comparativos con otros modelos en la información disponible. El modelo base Qwen3.5-9B podría considerarse una alternativa generalista, pero no se dispone de métricas de rendimiento para Alpona v3 que permitan una comparación objetiva. Tampoco se mencionan otros modelos especializados en RTL o testbenches. Por tanto, esta sección queda sin datos concretos.

## Limitaciones y advertencias

- El entrenamiento está en progreso; no se han publicado métricas de rendimiento para v3, por lo que su eficacia real no está validada.
- La versión v2 mostró una pérdida significativa en la capacidad de generar testbenches compilables, especialmente en diseños secuenciales. Aunque v3 intenta corregirlo, no hay evidencia publicada de que lo haya conseguido.
- La licencia "other" no especifica las condiciones de uso; es necesario revisar los términos del modelo base Qwen3.5-9B y los del fine-tuning antes de un uso comercial o de redistribución.
- El modelo está entrenado principalmente en inglés y en el dominio de hardware, por lo que su rendimiento en otros idiomas o dominios será limitado.
- Riesgo de alucinación en código: como cualquier modelo generativo, puede producir código sintácticamente incorrecto o con errores lógicos, especialmente en diseños complejos.
- No se mencionan sesgos específicos, pero al ser un modelo de código, puede reflejar los sesgos presentes en los datos de entrenamiento de Verilog/SystemVerilog.
- Los checkpoints intermedios requieren un renombrado de claves de pesos antes de servir con vLLM; el modelo final en la raíz ya tiene este ajuste aplicado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/musatur/Alpona-1.0-9B-v3)
