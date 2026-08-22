# qtum/Qwen3-Coder-Next-GPTQ

## Resumen

El modelo **Qwen3-Coder-Next-GPTQ** es una cuantización GPTQ en formato W4A16 del modelo de código Qwen3-Coder-Next, desarrollada por el usuario qtum mediante la herramienta llm-compressor. El modelo base, Qwen/Qwen3-Coder-Next, es un modelo de mezcla de expertos (MoE) con 80 mil millones de parámetros totales y 3 mil millones activos por token, con una longitud de contexto nativa de 256.000 tokens y una arquitectura híbrida que combina atención tradicional con MoE. Está diseñado específicamente para tareas de programación, razonamiento y uso de herramientas.

La relevancia de esta cuantización radica en que el modelo base solo se distribuye en FP8 (unos 80 GiB) y en bf16 (unos 159 GiB), lo que dificulta su ejecución en hardware asequible. Esta versión GPTQ reduce el peso a aproximadamente 40 GiB, lo que permite ejecutar el modelo en una GPU de 48 GB, o en una de 24 GB con paralelismo de tensor o descarga a CPU. La cuantización preserva la calidad general del modelo, con una perplexidad en wikitext-2-raw de 9.34 frente a 7.74 del modelo bf16, un incremento del 20,5 %.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_next MoE (hybrid attention + MoE) |
| Parametros totales | 80B |
| Parametros activos | 3B (por token, top-10 routing) |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | GPTQ W4A16, group size 128 (tambien existen versiones AWQ y FP8) |
| Idiomas soportados | en, zh (ingles y chino) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (formato compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Coder-Next presenta una arquitectura híbrida que combina atención tradicional con una capa de mezcla de expertos. Cuenta con 48 capas y 512 expertos en total, de los cuales se activan los 10 primeros por token (top-10 routing). Esta configuración permite un alto rendimiento con un coste computacional bajo (3B activos por token). El modelo fue entrenado de forma agéntica, es decir, mediante interacción con entornos y tareas ejecutables, lo que mejora su capacidad para uso de herramientas y razonamiento multi-paso.

La cuantización GPTQ se realizó con llm-compressor, calibrando sobre un corpus de 256 muestras mixtas de código, inglés y chino, con 2048 tokens por muestra. Se utilizó un tamaño de grupo de 128 para la cuantización. Los tensores críticos del MoE, como el router (`*.mlp.gate`) y la proyección de salida (`lm_head`), se mantienen en bf16 para evitar que la compresión de estos componentes provoque una degradación desproporcionada del rendimiento. El resto de los pesos (expertos y atención) se cuantizan a 4 bits.

## Capacidades

- Generación de código en múltiples lenguajes, incluyendo funciones complejas, refactorización y corrección de errores.
- Razonamiento de varios pasos y resolución de problemas matemáticos y lógicos.
- Soporte de tool calling y function calling, esencial para agentes autónomos.
- Capacidad para interactuar con entornos y ejecutar acciones (entrenamiento agéntico).
- Procesamiento de contextos muy largos (hasta 256K tokens) sin pérdida de coherencia.
- Multilingüe limitado a inglés y chino según la model card, aunque el modelo base podría tener capacidades adicionales no documentadas.
- No se especifican capacidades de visión ni audio.

## Casos de uso

- **Asistente de programación en IDE**: el modelo puede completar código, sugerir funciones y explicar fragmentos, gracias a su contexto de 256K que permite incluir todo el proyecto en la conversación.
- **Generación de documentación técnica**: a partir de código fuente o descripciones de funciones, el modelo puede redactar documentación coherente y detallada en inglés o chino.
- **Automatización de tareas de desarrollo**: gracias a su soporte de tool calling y entrenamiento agéntico, puede integrarse en pipelines de CI/CD para generar tests, revisar PR o actualizar dependencias.
- **Análisis de repositorios grandes**: con 256K de contexto, puede analizar un repositorio completo de tamaño medio y responder preguntas sobre su arquitectura o lógica.
- **Chat de soporte técnico**: puede mantener conversaciones de varios turnos sobre temas de programación, resolviendo dudas y proponiendo soluciones.
- **Generación de scripts y automatización**: adecuado para crear scripts de administración, scripts de despliegue o utilidades de procesamiento de datos.

## Benchmarks y rendimiento

La información disponible solo incluye la perplexidad medida en wikitext-2-raw (test) con una ventana de contexto de 512 tokens y 12 trozos, medida con vLLM. No se han publicado resultados de otros benchmarks como MMLU, HumanEval o GSM8K para esta cuantización.

| Weights | PPL | vs bf16 |
|---|---|---|
| bf16 (referencia) | 7.74 | — |
| GPTQ W4A16 (este repo) | 9.34 | +20.5% |

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo ocupa ~40 GiB en disco. Para inferencia, se recomienda una GPU con al menos 48 GB de VRAM para servir el modelo completo sin descarga.
- **GPUs recomendadas**: NVIDIA A100 40GB (con tensor parallel), A100 80GB, H100, o RTX 4090 (24GB) con tensor parallel o descarga de pesos a CPU.
- **En consumer GPU**: es posible ejecutarlo en una RTX 4090 (24GB) utilizando tensor parallel con dos GPU o descargando capas a memoria RAM, aunque con mayor latencia.
- **Opciones de despliegue**: vLLM y SGLang son los motores recomendados, ya que detectan automáticamente el esquema de cuantización en el `config.json`. También puede usarse con Hugging Face Transformers, pero se recomienda vLLM para producción.
- **Latencia y throughput**: no se han publicado datos específicos para esta cuantización.

## Comparativa con modelos similares

La comparativa se centra en las distintas versiones del mismo modelo base, ya que no se dispone de datos de otros modelos de código similares en la información proporcionada.

| Modelo | Tamaño | Contexto | Formato | Tamaño en disco | Perplexidad (wikitext-2) |
|---|---|---|---|---|---|
| Qwen3-Coder-Next (bf16) | 80B total / 3B activo | 256K | bf16 | ~159 GiB | 7.74 |
| Qwen3-Coder-Next-FP8 (oficial) | 80B / 3B | 256K | FP8 | ~80 GiB | no disponible |
| **Qwen3-Coder-Next-GPTQ (este repo)** | 80B / 3B | 256K | W4A16 GPTQ | ~40 GiB | 9.34 |
| Qwen3-Coder-Next-AWQ (qtum) | 80B / 3B | 256K | AWQ W4A16 | ~40 GiB | no disponible |

## Limitaciones y advertencias

- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar código incorrecto o inventar APIs que no existen. Se recomienda verificar el resultado en entornos de producción.
- **Sesgos**: no se documentan sesgos específicos, pero el entrenamiento agéntico puede introducir sesgos en las respuestas relacionadas con la ejecución de tareas.
- **Idiomas**: la model card solo declara inglés y chino. El uso en otros idiomas puede degradar el rendimiento.
- **Calidad de la cuantización**: la perplexidad aumenta un 20,5 % respecto al bf16, lo que puede afectar a tareas que requieren precisión numérica o matemática.
- **Restricciones de licencia**: la licencia Apache-2.0 permite uso comercial, pero se debe cumplir con los términos del modelo base (Qwen3-Coder-Next), que también es Apache-2.0.
- **Contexto de 256K**: aunque el modelo soporta esa longitud, el rendimiento puede degradarse en contextos extremadamente largos y el coste de memoria es alto.
- **Soporte de producción**: la cuantización W4A16 no es compatible con todas las librerías; se recomienda usar vLLM o SGLang, y no se garantiza su funcionamiento en otros frameworks sin adaptación.

## Enlaces

- [Repositorio HuggingFace de esta cuantización](https://huggingface.co/qtum/Qwen3-Coder-Next-GPTQ)
- [Modelo base Qwen/Qwen3-Coder-Next](https://huggingface.co/Qwen/Qwen3-Coder-Next)
- [Versión AWQ de qtum](https://huggingface.co/qtum/Qwen3-Coder-Next-AWQ)
- [Versión FP8 oficial](https://huggingface.co/Qwen/Qwen3-Coder-Next-FP8)
- [Repositorio GitHub de Qwen3-Coder](https://github.com/QwenLM/Qwen3-Coder)
- [Herramienta llm-compressor](https://github.com/vllm-project/llm-compressor)
