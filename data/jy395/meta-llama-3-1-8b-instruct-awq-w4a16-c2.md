# jy395/Meta-Llama-3.1-8B-Instruct-awq-w4a16-c2

## Resumen

Meta-Llama-3.1-8B-Instruct-awq-w4a16-c2 es una versión cuantizada a 4 bits del modelo meta-llama/Meta-Llama-3.1-8B-Instruct, publicada por el usuario jy395. La cuantización emplea el esquema AWQ W4A16 (pesos de 4 bits, activaciones de 16 bits) de tipo asimétrico, aplicado mediante la herramienta llm-compressor del ecosistema vLLM, y se ha calibrado sobre el corpus C2, compuesto por texto web genérico extraído de C4 (128 secuencias de 2048 tokens, 262.144 tokens en total, semilla 42).

El modelo forma parte de una colección de 30 configuraciones comprimidas publicadas junto al artículo «Damage Predicts Recovery: When Calibration Data Matters in Compressing Financial LLMs» (ICAIF '26), que investiga cuándo la compresión post-entrenamiento de modelos de lenguaje financieros requiere datos de calibración alineados con el dominio. Esta configuración concreta (calibración con texto genérico) sirve como referencia de control frente a las variantes calibradas con corpus financieros.

Es relevante ahora porque permite desplegar un modelo de 8.000 millones de parámetros con una huella de memoria notablemente reducida (repositorio de 5,7 GB) manteniendo el formato compressed-tensors, que se carga directamente en vLLM y transformers. Su interés principal es metodológico: facilita reproducir experimentos sobre el impacto del corpus de calibración en el rendimiento downstream, en este caso sobre diez tareas financieras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), cuantizada AWQ W4A16 asimetrica |
| Parametros totales | 1.984.696.768 (pesos cuantizados almacenados; el modelo base tiene 8.030 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base soporta 128.000 tokens) |
| Tipos de cuantizacion | AWQ W4A16 (pesos 4 bits, activaciones 16 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Llama 3.1, con 8.030 millones de parámetros y atención por grupos (GQA). Sobre él se aplica una cuantización de solo pesos AWQ a 4 bits con activaciones en 16 bits (W4A16), de esquema asimétrico, ejecutada con llm-compressor. El proceso consume el corpus de calibración completo, con max_seq_length=2048 y un corpus construido con semilla 42.

La calibración se realizó sobre C2, un corpus de texto web genérico derivado de C4, sin datos financieros. Este detalle es central en el artículo asociado: el trabajo compara configuraciones calibradas con distintos corpus para medir cuándo la compresión degrada capacidades del dominio financiero y en qué medida un corpus alineado al dominio mejora la recuperación. No se documentan en la información disponible fases de RLHF o DPO adicionales; se heredan las del modelo base.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento general y respuesta a instrucciones multi-turno.
- Generación de código y resolución de problemas matemáticos (capacidades del modelo base).
- Soporte de tool calling y function calling (propio del modelo base Instruct).
- Capacidades multilingües del modelo base (no se detallan idiomas concretos en la información disponible).
- Ejecución en vLLM de forma nativa gracias al formato compressed-tensors.
- Uso como referencia de control en experimentos de calibración de compresión.

## Casos de uso

- Evaluación de compresión de modelos financieros: sirve como configuración de referencia (calibración genérica) frente a variantes calibradas con corpus financieros, para medir la pérdida de rendimiento en las diez tareas del suite de evaluación del artículo.
- Despliegue de bajo coste en inferencia: con pesos de 4 bits y un repositorio de 5,7 GB, permite servir un modelo instruct de 8B en GPUs con menor VRAM que la versión en FP16.
- Reproducción de experimentos académicos: el script awq_w4a16.py y los corpus de calibración publicados permiten replicar exactamente la configuración C2 y comparar resultados.
- Atención al cliente y asistentes conversacionales: el modelo hereda la capacidad conversacional del base Instruct y puede gestionar diálogos multi-turno, con la ventaja de un menor consumo de memoria por instancia.
- Generación de código asistida en pipelines: al conservar el soporte de tool calling del base, puede integrarse en flujos de CI/CD o agentes que invocan funciones externas.
- Prototipado rápido en investigación: al cargarse directamente en transformers y vLLM, facilita pruebas de calidad tras cuantización antes de comprometerse con un despliegue en producción.
- Comparación de esquemas de cuantización: útil para contrastar AWQ W4A16 frente a otros formatos (GPTQ, FP8) sobre el mismo modelo base en tareas de dominio específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al suite de evaluación del repositorio del artículo (diez tareas financieras), pero no incluye cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 6-7 GB para los pesos en W4A16, más overhead de activaciones y caché KV (el repositorio ocupa 5,7 GB).
- GPU recomendadas: A100, H100 o L40S para despliegue en vLLM con concurrencia; RTX 4090 y RTX 3090 para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM para contextos moderados; 12-16 GB recomendables para contextos largos y lotes mayores.
- Opciones de despliegue: vLLM (soporte nativo de compressed-tensors), transformers con AutoModelForCausalLM y device_map="auto". No se indica soporte de llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jy395/Meta-Llama-3.1-8B-Instruct-awq-w4a16-c2 | 8B (pesos W4A16) | no disponible | AWQ W4A16 | Llama 3.1 Community | HuggingFace (21 descargas) |
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8B | 128.000 tokens | FP16/BF16 | Llama 3.1 Community | HuggingFace (oficial) |
| Otras configuraciones de la coleccion ICAIF '26 | 8B | no disponible | AWQ W4A16 con distintos corpus de calibracion | Llama 3.1 Community | HuggingFace (coleccion jy395) |

La comparación directa con alternativas cuantizadas de terceros (por ejemplo, versiones GPTQ o FP8 del mismo base) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar el rendimiento respecto al modelo base en tareas sensibles; el propio artículo estudia este efecto y la influencia del corpus de calibración.
- La calibración con texto web genérico (C2) puede ser subóptima para tareas financieras, que es precisamente la hipótesis que el artículo investiga.
- Riesgo de alucinación inherente al modelo base Llama 3.1 8B Instruct, potencialmente amplificado por la compresión.
- Idiomas soportados no documentados en la información disponible.
- Licencia Llama 3.1 Community: restricciones de uso comercial y obligaciones de atribución; debe revisarse antes de producción.
- Modelo con muy baja adopción (21 descargas, 0 likes) y sin benchmarks publicados en la información disponible; no se recomienda para producción sin evaluación propia.
- El número de parámetros reportado en safetensors (1.984.696.768) corresponde a los pesos cuantizados almacenados, no al cómputo efectivo del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/jy395/Meta-Llama-3.1-8B-Instruct-awq-w4a16-c2
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Articulo (DOI): https://doi.org/10.1145/3858063.3858724
- Repositorio de codigo: https://github.com/JunyiYe/finance-ptc-calibration
- Script de cuantizacion: https://github.com/JunyiYe/finance-ptc-calibration/blob/main/scripts/quantization/awq_w4a16.py
- Suite de evaluacion: https://github.com/JunyiYe/finance-ptc-calibration/tree/main/scripts/evaluation
- Coleccion completa: https://huggingface.co/collections/jy395/financial-llm-compression-and-calibration-icaif-2026-6ae60c49d2f87e2ae7269058
- llm-compressor: https://github.com/vllm-project/llm-compressor
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE.md
