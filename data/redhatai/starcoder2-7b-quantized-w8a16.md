# RedHatAI/starcoder2-7b-quantized.w8a16

## Resumen

StarCoder2-7b-quantized.w8a16 es una versión cuantizada del modelo de generación de código StarCoder2-7B, desarrollada por Neural Magic y publicada bajo el perfil de Red Hat AI en Hugging Face. El modelo reduce el tamaño de los pesos de 16 a 8 bits (INT8) mediante el algoritmo GPTQ, lo que disminuye aproximadamente un 50 % el uso de disco y memoria de GPU en comparación con el modelo original, manteniendo una degradación mínima en precisión.

Al igual que el StarCoder2-7B base, este modelo está diseñado exclusivamente para completar y generar código fuente, no para seguir instrucciones en lenguaje natural. Es una opción interesante para equipos que necesitan desplegar un modelo de 7 000 millones de parámetros en entornos con recursos limitados sin renunciar a la calidad de generación de código. Su licencia BigCode OpenRAIL-M permite uso comercial y de investigación, con ciertas restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | StarCoder2 (decoder-only, transformer con attention multi-consulta) |
| Parámetros totales | 7.400.416.256 |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base StarCoder2-7B admite 16.384 tokens) |
| Tipos de cuantización | W8A16 (pesos INT8, activaciones FP16) |
| Idiomas soportados | no disponible (el modelo base se entrenó con 600+ lenguajes de programación y algo de texto natural) |
| Licencia | BigCode OpenRAIL-M |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es StarCoder2-7B, un transformer decoder-only con 7.4 mil millones de parámetros, entrenado por el proyecto BigCode sobre el dataset The Stack v2, que contiene código de más de 600 lenguajes de programación, además de texto natural como Wikipedia, Arxiv y GitHub issues. La arquitectura emplea atención multi-consulta (multi-query attention) para optimizar el uso de memoria en inferencia.

La cuantización de este modelo se realizó con el algoritmo GPTQ, implementado en la librería llm-compressor. Se cuantizaron únicamente los pesos de las capas lineales de los bloques del transformer, aplicando cuantización simétrica por canal (una escala lineal por dimensión de salida). La calibración se hizo con 256 secuencias de 8.192 tokens aleatorios, con un factor de damping del 1 % y excluyendo la capa lm_head. No se aplicó RLHF ni DPO: el modelo conserva el comportamiento de base de StarCoder2, es decir, es un modelo de autocompletado de código, no un asistente conversacional.

## Capacidades

- Generación de código fuente en múltiples lenguajes de programación, con especial soltura en Python, C++, JavaScript y Java.
- Autocompletado de código a nivel de función, clase o bloque, con soporte de contexto largo (hasta 16.384 tokens en el modelo base).
- Razonamiento básico sobre código existente, aunque no está entrenado para seguir instrucciones ni mantener diálogos.
- No soporta tool calling, function calling ni uso como agente autónomo.
- Capacidades multilingües limitadas a código: el entrenamiento incluye texto natural, pero el modelo no es apto para tareas de lenguaje general.
- No dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- Autocompletado de código en editores y IDEs: puede integrarse en extensiones de VS Code o JetBrains para sugerir funciones y bloques completos mientras el desarrollador escribe, gracias a su baja latencia en cuantización INT8.
- Generación de tests unitarios: dado un fragmento de código, el modelo puede producir casos de prueba básicos en Python u otros lenguajes, aunque requiere revisión manual.
- Migración y refactorización de código: útil para transformar sintaxis entre versiones de un mismo lenguaje o adaptar código antiguo a nuevas APIs, aprovechando su ventana de contexto de 16K.
- Documentación automática de funciones: puede generar docstrings y comentarios a partir del cuerpo de una función, si bien la calidad es inferior a la de modelos instructivos.
- Despliegue en entornos edge o con GPU limitada: al pesar ~7,5 GB en INT8, puede ejecutarse en tarjetas de consumo con 8-10 GB de VRAM, lo que lo hace viable para prototipos locales.
- Generación de código en pipelines de CI/CD: con vLLM, puede servir peticiones de completado de código de forma concurrente, útil para generar esqueletos de funciones en repositorios grandes.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en HumanEval y HumanEval+, comparados con el modelo original sin cuantizar. La evaluación se realizó con el generador del Big Code Models Leaderboard, con temperatura 0.2 y 50 muestras.

| Benchmark | starcoder2-7b | starcoder2-7b-quantized.w8a16 (este modelo) | Recuperación |
|---|---|---|---|
| HumanEval pass@1 | 34.9 | 34.6 | 99.1 % |
| HumanEval pass@10 | 50.7 | 50.4 | 99.4 % |
| HumanEval+ pass@1 | 30.0 | 29.8 | 99.3 % |
| HumanEval+ pass@10 | 43.0 | 43.6 | 101.4 % |

La cuantización apenas afecta a la precisión, con una recuperación superior al 99 % en todos los casos. No se han publicado resultados de otros benchmarks (MMLU, GSM8K, etc.) para esta versión.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT8 ocupan aproximadamente 7.4 GB (7.400.416.256 parámetros × 1 byte). Añadiendo activaciones y caché KV, el consumo total se sitúa en torno a 8-10 GB en inferencia con batch pequeño.
- GPU recomendadas: RTX 4090, RTX 3090, A10G, L4 o cualquier GPU con 10 GB o más de VRAM. Para batch grandes o despliegue concurrente, se recomienda A100 o H100.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como RTX 4060 Ti 16 GB o RTX 3090 sin necesidad de cuantización adicional.
- Opciones de despliegue: compatible con vLLM (soporte nativo y servidor OpenAI-compatible) y con text-generation-inference (TGI). No se ha confirmado soporte con llama.cpp ni Ollama, ya que el formato es safetensors, no GGUF.
- Latencia y throughput: no se han publicado datos concretos. Con vLLM y batch de 16, se puede esperar un throughput de decenas de peticiones por segundo en una GPU A100, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | HumanEval pass@1 | HumanEval+ pass@1 | Licencia |
|---|---|---|---|---|---|
| starcoder2-7b (base) | 7.4B | FP16 | 34.9 | 30.0 | BigCode OpenRAIL-M |
| starcoder2-7b-quantized.w8a16 (este) | 7.4B | INT8 (W8A16) | 34.6 | 29.8 | BigCode OpenRAIL-M |
| starcoder2-7b-quantized.w8a8 | 7.4B | INT8 (W8A8) | 33.9 | no disponible | BigCode OpenRAIL-M |

La comparativa se limita a las versiones del mismo modelo base disponibles en Hugging Face. No se dispone de datos de modelos alternativos como CodeLlama-7B o DeepSeek-Coder-6.7B en la información proporcionada.

## Limitaciones y advertencias

- Modelo no instructivo: no responde a comandos como "escribe una función que calcule la raíz cuadrada" porque no está entrenado para seguir instrucciones; solo completa código a partir de un contexto.
- Riesgo de alucinación: puede generar código sintácticamente correcto pero semánticamente incorrecto, especialmente en lenguajes poco representados en el entrenamiento.
- Limitaciones de idioma: aunque se entrenó con 600+ lenguajes de programación, el rendimiento es desigual entre ellos; los lenguajes menos comunes pueden producir código de baja calidad.
- Sesgos de código: hereda los sesgos del dataset The Stack v2, que puede contener código con vulnerabilidades o malas prácticas.
- Licencia OpenRAIL-M: permite uso comercial, pero incluye cláusulas de uso responsable que restringen aplicaciones que causen daño o violen derechos.
- Contexto no confirmado: la longitud de contexto no aparece en la documentación de este modelo concreto; se recomienda verificar el comportamiento en secuencias largas antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/starcoder2-7b-quantized.w8a16
- Modelo base: https://huggingface.co/bigcode/starcoder2-7b
- Repositorio de StarCoder2: https://github.com/bigcode-project/starcoder2
- Paper de GPTQ: https://arxiv.org/abs/2210.17323
- Paper de HumanEval: https://arxiv.org/abs/2107.03374
- Paper de HumanEval+: https://arxiv.org/abs/2305.01210
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Librería llm-compressor: https://github.com/vllm-project/llm-compressor
