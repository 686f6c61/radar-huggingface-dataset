# 360ZhiNao/Light-IF-32B

## Resumen

Light-IF-32B es un modelo de lenguaje de 32.762 millones de parámetros desarrollado por 360ZhiNao (Qihoo 360), obtenido mediante fine-tuning del modelo base Qwen3-32B. Su propósito específico es mejorar el cumplimiento de instrucciones complejas (instruction following), un área donde los LLM presentan un rendimiento inconsistente, especialmente en tareas con múltiples restricciones simultáneas. El modelo aborda el problema del "razonamiento perezoso" durante la fase de thinking, promoviendo un razonamiento riguroso mediante técnicas de previsualización y autoverificación.

La propuesta técnica se apoya en la generación de datos de instrucción con restricciones complejas, filtrado de muestras por dificultad, rejection sampling para construir un dataset pequeño pero de alta calidad, y un entrenamiento en dos fases: Entropy-SFT (supervised fine-tuning con preservación de entropía) y TEA-RL (reinforcement learning con entropía adaptativa a nivel de token), guiado por recompensas multidimensionales basadas en reglas. El modelo mantiene la arquitectura transformer densa de Qwen3-32B y hereda su ventana de contexto, aunque el autor no detalla este dato en la información disponible.

Su relevancia radica en que, según los benchmarks publicados por el autor, un modelo de 32B parámetros supera en tareas de instruction following a modelos significativamente mayores como DeepSeek-R1-0528, Qwen3-235B-A22B y a sistemas cerrados como ChatGPT-4o-latest. Está publicado bajo licencia Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-32B) |
| Parametros totales | 32.762.123.264 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Light-IF-32B parte de la arquitectura transformer densa de Qwen3-32B, con 32.762 millones de parámetros y pesos en formato safetensors (65,5 GB en el repositorio). No se trata de un modelo MoE ni de una arquitectura híbrida; el autor no documenta modificaciones estructurales sobre el modelo base, sino un proceso de adaptación centrado en el comportamiento de razonamiento e instrucción.

El entrenamiento se articula en torno a tres componentes. Primero, la generación de datos de instrucción con restricciones complejas, con filtrado para descartar muestras demasiado fáciles o demasiado difíciles, seguido de rejection sampling para obtener un dataset pequeño pero de alta calidad. Segundo, Entropy-SFT, un fine-tuning supervisado que preserva la entropía para evitar el colapso de la distribución durante la adaptación. Tercero, TEA-RL, un reinforcement learning con entropía adaptativa a nivel de token, guiado por recompensas multidimensionales basadas en reglas. El objetivo declarado es que el modelo planifique antes de responder y verifique sus propias salidas, mitigando el "lazy reasoning" en la fase de thinking. El modelo soporta el modo thinking de Qwen3 (token `</think>` con identificador 151668 en el tokenizador), tal como muestra el snippet de uso de la model card.

## Capacidades

- Generación de texto conversacional con plantilla de chat compatible con transformers (`apply_chat_template`).
- Modo thinking explícito (`enable_thinking=True`), que separa el contenido de razonamiento del contenido final.
- Cumplimiento de instrucciones complejas con múltiples restricciones simultáneas (formato, longitud, estructura, subtítulos, número de líneas, límite de palabras), tal como demuestra el ejemplo de la model card.
- Razonamiento con previsualización y autoverificación de la salida antes de emitir la respuesta final.
- Generación de código y matemáticas: capacidad heredada de Qwen3-32B, aunque el autor no publica benchmarks específicos de estas tareas para Light-IF-32B.
- Capacidades multilingües: heredadas del modelo base, aunque no se documentan idiomas concretos en la información disponible.
- Soporte de tool calling y function calling: no documentado explícitamente por el autor; debe verificarse empíricamente sobre el modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el entrenamiento en autoverificación sugiere cierta aptitud, pero no hay evidencia publicada.

## Casos de uso

- Generación de contenido con formato estricto: el modelo es adecuado para producir textos que deben cumplir restricciones exactas de estructura (número de párrafos, estrofas, subtítulos resaltados, límite de palabras), como el ejemplo de poema de 15 líneas en 4 estrofas de la model card. Su entrenamiento específico en restricciones complejas reduce la necesidad de post-procesado.
- Extracción de datos estructurados: para convertir texto libre en JSON, tablas o formularios con campos obligatorios y validaciones de formato, el modelo mantiene las restricciones mejor que un modelo base genérico, lo que disminuye la tasa de salidas inválidas en pipelines de ingestión.
- Asistentes conversacionales con requisitos de política: en atención al cliente donde la respuesta debe respetar reglas de tono, longitud, idioma y contenido prohibido, el modo thinking con autoverificación permite comprobar el cumplimiento antes de emitir la respuesta.
- Generación de informes técnicos con plantilla: para producir documentación que debe seguir un esquema fijo (secciones, tablas, numeración, límites de extensión), el modelo puede planificar la estructura antes de redactar.
- Evaluación y anotación de instrucciones: como generador de datos sintéticos con restricciones controladas para entrenar o evaluar otros modelos en instruction following.
- Automatización de tareas de oficina con formato: redacción de correos, actas o resúmenes que deben cumplir requisitos de longitud y estructura definidos por plantilla.
- Despliegue en infraestructura propia: al publicarse en safetensors con licencia Apache 2.0, puede servirse con transformers o TGI en entornos on-premise donde no se permite enviar datos a APIs externas.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card:

| Modelo | SuperClue | IFEval | CFBench | IFBench |
|---|---|---|---|---|
| Qwen3-32B | 0.234 | 0.877 | 0.823 | 0.384 |
| Qwen3-235B-A22B | 0.244 | 0.882 | 0.834 | 0.423 |
| Qwen3-235B-A22B-Thinking-2507 | 0.434 | 0.916 | 0.843 | 0.475 |
| DeepSeek-R1-0528 | 0.436 | 0.863 | 0.827 | 0.415 |
| Doubao-seed-1-6-thinking-250615 | 0.362 | 0.832 | 0.820 | 0.477 |
| Doubao-seed-1-6-thinking-250715 | 0.345 | 0.856 | 0.840 | 0.366 |
| ChatGPT-4o-latest | 0.260 | 0.836 | 0.807 | 0.365 |
| DeepSeek-v3-250324 | 0.306 | 0.859 | 0.833 | 0.405 |
| Doubao-1.5-pro-32k-250115 | 0.285 | 0.889 | 0.797 | 0.375 |
| Kimi-K2 | 0.227 | 0.921 | 0.820 | 0.395 |
| GLM-4.5 | 0.395 | 0.893 | 0.833 | 0.466 |
| Light-IF-32B | 0.575 | 0.938 | 0.850 | 0.575 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 65,5 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 33-35 GB, viable en una A100 40GB o dos RTX 4090.
- VRAM estimada en cuantización de 4 bits: en torno a 17-20 GB, viable en una RTX 4090 (24 GB) o RTX 3090, siempre que exista una cuantización GGUF/AWQ publicada (no disponible en la información proporcionada; habría que generarla).
- GPU recomendadas: A100 80GB, H100 80GB o H200 para BF16; A100 40GB o configuraciones multi-GPU para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantización de 4 bits, con degradación de calidad no evaluada.
- Opciones de despliegue: transformers (snippet oficial), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; vLLM y llama.cpp son opciones habituales para Qwen3, aunque el autor no las documenta explícitamente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IFEval | IFBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Light-IF-32B | 32,8B | No disponible | 0,938 | 0,575 | Apache 2.0 | Hugging Face |
| Qwen3-32B (base) | 32,8B | No disponible | 0,877 | 0,384 | Apache 2.0 | Hugging Face |
| DeepSeek-R1-0528 | No disponible | No disponible | 0,863 | 0,415 | No disponible | API/abierto según versión |
| ChatGPT-4o-latest | No disponible | No disponible | 0,836 | 0,365 | Propietaria | API |
| GLM-4.5 | No disponible | No disponible | 0,893 | 0,466 | No disponible | Hugging Face |

La comparación se limita a los benchmarks de instruction following publicados por el autor; no hay datos de rendimiento general (MMLU, código, matemáticas) para establecer una comparación completa.

## Limitaciones y advertencias

- El modelo está especializado en instruction following; no se han publicado evaluaciones de conocimiento general, código o matemáticas que permitan descartar regresiones respecto a Qwen3-32B.
- Riesgo de alucinación inherente a los modelos de 32B, no mitigado específicamente por el entrenamiento en instruction following.
- El modo thinking incrementa el consumo de tokens y la latencia; el snippet oficial usa `max_new_tokens=32768`, lo que implica respuestas potencialmente largas.
- No se documentan los idiomas soportados; el entrenamiento se describe en inglés y la evaluación incluye benchmarks en chino (SuperClue) e inglés (IFEval, IFBench), pero no hay confirmación oficial de cobertura multilingüe.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ); el despliegue en hardware de consumo requiere generarlas y validar su calidad.
- Sesgos conocidos: no documentados por el autor; deben asumirse los del modelo base Qwen3-32B.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-32B, también Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente sin validación independiente de la comunidad.
- El autor publica el modelo bajo dos identificadores (`360ZhiNao/Light-IF-32B` y `qihoo360/Light-IF-32B`); conviene comprobar cuál es el repositorio canónico y si los pesos son idénticos.

## Enlaces

- Hugging Face (360ZhiNao): https://huggingface.co/360ZhiNao/Light-IF-32B
- Hugging Face (Qihoo 360): https://huggingface.co/qihoo360/Light-IF-32B
- Paper: https://arxiv.org/abs/2508.03178
- Blog (Zhihu): https://zhuanlan.zhihu.com/p/1936535948360918628
- GitHub: https://github.com/Qihoo360/Light-IF
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
