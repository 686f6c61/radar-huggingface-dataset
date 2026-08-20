# RedHatAI/starcoder2-3b-quantized.w8a16

## Resumen

El modelo `RedHatAI/starcoder2-3b-quantized.w8a16` es una versión cuantizada a INT8 del modelo StarCoder2-3B, desarrollado por Neural Magic y publicado bajo la organización Red Hat AI. Esta variante reduce el peso de los parámetros de 16 a 8 bits, lo que permite un despliegue más eficiente en memoria y disco sin sacrificar apenas rendimiento en tareas de generación de código. El modelo original StarCoder2-3B fue entrenado por el proyecto BigCode sobre The Stack v2, un corpus masivo de código fuente en más de 600 lenguajes de programación, junto con texto natural como Wikipedia o arXiv.

La cuantización se realizó con el algoritmo GPTQ sobre los operadores lineales de los bloques transformer, aplicando una cuantización simétrica por canal. El resultado es un modelo con 3.181 millones de parámetros, una ventana de contexto de 16.384 tokens y una licencia permisiva para uso comercial y de investigación (bigcode-openrail-m). No es un modelo de instrucciones: está pensado para completar código de forma autónoma, no para seguir comandos conversacionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (StarCoder2) con Grouped Query Attention y sliding window attention de 4.096 tokens |
| Parametros totales | 3.181.366.272 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | INT8 (W8A16, pesos INT8 con activaciones FP16) |
| Idiomas soportados | No declarados en la ficha; entrenado en más de 600 lenguajes de programación y texto natural (inglés mayoritariamente) |
| Licencia | BigCode OpenRAIL-M |
| Formato de pesos | Safetensors (también compatible con vLLM y TGI) |

## Arquitectura y entrenamiento

El modelo base es StarCoder2-3B, un transformer causal con Grouped Query Attention (GQA) para reducir la memoria de las claves y valores, y una ventana de atención deslizante de 4.096 tokens dentro de un contexto total de 16.384 tokens. El entrenamiento se realizó sobre The Stack v2, un dataset de código fuente con licencias permisivas, complementado con texto natural (Wikipedia, Arxiv, GitHub issues). El modelo no fue entrenado mediante RLHF ni DPO; es un modelo de autocompletado puro.

La cuantización se llevó a cabo con GPTQ (damping factor 0.01) sobre los operadores lineales de los bloques transformer, excluyendo la capa de salida (`lm_head`). Se usaron 256 secuencias de 8.192 tokens aleatorios para la calibración. La precisión de los pesos se reduce a INT8, mientras que las activaciones se mantienen en FP16 (esquema W8A16). Esto reduce el tamaño del modelo en disco y los requisitos de VRAM aproximadamente un 50% respecto al original FP16.

## Capacidades

- Generación de código: completa funciones, estructuras de control, expresiones y bloques de código en múltiples lenguajes de programación.
- Soporte de autocompletado en entornos de desarrollo: integrable en editores de código para sugerencias en tiempo real.
- No soporta tool calling ni function calling de forma nativa, al ser un modelo base sin ajuste por instrucciones.
- No es un modelo de razonamiento conversacional: no responde a comandos ni preguntas, solo genera continuación de texto.
- Capacidades multilingües en código: entrenado en más de 600 lenguajes, aunque el rendimiento varía según la cantidad de datos de cada lenguaje.
- No tiene capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- **Autocompletado en editores de código**: el modelo puede sugerir el resto de una línea o función a partir de un prefijo, aprovechando su contexto de 16K tokens para considerar todo el archivo abierto.
- **Generación de código en pipelines CI/CD**: al ser un modelo de autocompletado, puede usarse para generar implementaciones de funciones a partir de firmas o comentarios, aunque sin la capacidad de seguir instrucciones complejas.
- **Refactorización y análisis de código**: dado un fragmento, el modelo puede completar versiones alternativas o rellenar partes faltantes, útil en herramientas de asistencia al desarrollo.
- **Educación y práctica de programación**: puede generar ejemplos de código a partir de descripciones en forma de comentarios, aunque sin control fino del resultado.
- **Prototipado rápido de funciones**: en un entorno de desarrollo, se puede pedir que complete una función a partir de su cabecera y cuerpo parcial, acelerando el desarrollo.
- **Despliegue en entornos con recursos limitados**: al ser cuantizado a INT8, puede ejecutarse en GPUs de consumo con menor VRAM que el modelo original, lo que facilita su uso en entornos de desarrollo local o edge.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en la model card son los siguientes (evaluados con el generador de Big Code Models Leaderboard y el motor vLLM):

| Benchmark | starcoder2-3b | starcoder2-3b-quantized.w8a16 | Recovery |
|---|---|---|---|
| HumanEval pass@1 | 30.7 | 31.0 | 101.0% |
| HumanEval pass@10 | 44.9 | 46.0 | 102.4% |
| HumanEval+ pass@1 | 26.6 | 26.4 | 99.2% |
| HumanEval+ pass@10 | 39.2 | 39.6 | 101.0% |

La cuantización mantiene un rendimiento prácticamente idéntico al modelo original, con una recuperación del 99-102% según la métrica. No hay datos publicados para otros benchmarks como MMLU o GSM8K en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo con pesos INT8 ocupa aproximadamente 3,2 GB de pesos. Con activaciones y overhead, se recomienda al menos 6 GB de VRAM para inferencia cómoda.
- **GPU recomendadas**: GPUs con 6 GB o más de VRAM, como RTX 2060, RTX 3060, RTX 4060, o GPUs de datacenter como T4, A10, A100 (para mayor throughput).
- **Compatibilidad con consumer GPUs**: sí, es viable en la mayoría de GPUs de gama media y alta de NVIDIA, así como en Apple Silicon (via Metal) con librerías como llama.cpp.
- **Opciones de despliegue**: vLLM (recomendado), llama.cpp, Ollama, Text Generation Inference (TGI), y cualquier servidor compatible con transformers.
- **Latencia y throughput**: no se dispone de datos oficiales. Con vLLM en una GPU A100, se puede esperar un throughput alto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | HumanEval pass@1 | Licencia |
|---|---|---|---|---|---|
| starcoder2-3b (original) | 3.181 M | 16.384 | FP16 | 30.7 | BigCode OpenRAIL-M |
| starcoder2-3b-quantized.w8a16 | 3.181 M | 16.384 | INT8 | 31.0 | BigCode OpenRAIL-M |
| starcoder2-3b-quantized.w8a8 (de Red Hat AI) | 3.181 M | 16.384 | INT8 (W8A8) | No publicado | BigCode OpenRAIL-M |

El modelo cuantizado ofrece una mejora mínima en HumanEval pass@1 respecto al original, probablemente debida a la variabilidad de la evaluación. La versión w8a8 (cuantización de pesos y activaciones) también está disponible pero no se han publicado resultados. En la categoría de 3B, también existen alternativas como CodeLlama-3B o DeepSeek-Coder-3B, pero no se dispone de datos comparativos en esta ficha.

## Limitaciones y advertencias

- **No es un modelo de instrucciones**: no responde a preguntas ni comandos como "escribe una función que...". Su uso es exclusivamente de autocompletado.
- **Sesgos y calidad del código**: el entrenamiento sobre The Stack puede reflejar sesgos de los datos, como preferencia por ciertos lenguajes o estilos de codificación, y puede generar código con errores o vulnerabilidades.
- **Riesgo de alucinación**: al ser un modelo generativo, puede inventar funciones o APIs inexistentes. Se recomienda validar el código generado.
- **Limitaciones de idioma**: aunque soporta muchos lenguajes de programación, el rendimiento es desigual; los lenguajes menos representados en el dataset tendrán peor calidad.
- **Restricciones de licencia**: la licencia BigCode OpenRAIL-M permite uso comercial y de investigación, pero no se permite el uso para generar código malicioso o vulnerabilidades. Se debe revisar el texto completo de la licencia para cumplir con todas las restricciones.
- **Cuantización**: la cuantización a INT8 puede introducir errores numéricos en algunos casos, aunque los benchmarks muestran una pérdida mínima.

## Enlaces

- [Hugging Face - RedHatAI/starcoder2-3b-quantized.w8a16](https://huggingface.co/RedHatAI/starcoder2-3b-quantized.w8a16)
- [Hugging Face - starcoder2-3b original](https://huggingface.co/bigcode/starcoder2-3b)
- [GitHub - bigcode-project/starcoder2](https://github.com/bigcode-project/starcoder2)
- [GitHub - llm-compressor (biblioteca de cuantización)](https://github.com/vllm-project/llm-compressor)
- [Paper GPTQ](https://arxiv.org/abs/2210.17323)
- [Paper HumanEval](https://arxiv.org/abs/2107.03374)
- [Paper HumanEval+](https://arxiv.org/abs/2305.01210)
