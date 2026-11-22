# Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit

## Resumen

DeepSeek-R1-Distill-Qwen-7B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo DeepSeek-R1-Distill-Qwen-7B, publicada por Outlier-Ai para su ejecución local en Apple Silicon. El modelo base, desarrollado por DeepSeek, es un destilado de DeepSeek-R1 sobre la arquitectura Qwen2 de 7B parámetros, pensado para razonamiento paso a paso con cadenas de pensamiento (chain-of-thought) y orientado a tareas matemáticas, lógicas y de código. Esta conversión no modifica los pesos originales: solo cambia el formato en disco a safetensors MLX 4-bit (group size 64, simétrico) junto con tokenizer y plantilla de chat.

El interés práctico de esta ficha es que permite ejecutar un modelo de razonamiento de 7B en un Mac con GPU integrada y memoria unificada, sin nube ni claves de API. Con aproximadamente 7.615 millones de parámetros y un repositorio de 4,3 GB, encaja en equipos con 8-16 GB de RAM unificada, lo que lo sitúa en el segmento de inferencia local en el borde (edge AI) para desarrolladores que trabajan en macOS y quieren probar flujos de razonamiento sin depender de servicios externos.

La licencia MIT heredada del modelo base facilita su uso comercial y su integración en herramientas internas, si bien conviene verificar la model card original de DeepSeek para cualquier restricción adicional. La relevancia actual radica en la combinación de un modelo destilado de R1 con una cuantización de 4 bits optimizada para Metal, que reduce el coste de hardware a un portátil Apple Silicon manteniendo el formato de razonamiento explícito del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), destilado de DeepSeek-R1 |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | MLX 4-bit, group size 64, simetrica |
| Idiomas soportados | en, zh, fr, es, pt, de, ru, ja, ko, ar |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors (MLX 4-bit), shards, config.json, tokenizer, chat_template.jinja |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen2, con 7.615 millones de parámetros densos (no es un modelo Mixture-of-Experts). El modelo base DeepSeek-R1-Distill-Qwen-7B se obtiene por destilación a partir de DeepSeek-R1: el modelo profesor genera trayectorias de razonamiento que se usan para entrenar el alumno Qwen2-7B, de modo que este adquiere el estilo de cadena de pensamiento del R1 original (bloques de razonamiento explícito antes de la respuesta final). No se dispone en la información proporcionada de datos sobre volumen de tokens de entrenamiento, composición del dataset ni si se aplicaron etapas de RLHF o DPO en el destilado.

Esta conversión de Outlier-Ai no reentrena ni modifica los pesos: aplica cuantización de 4 bits en formato MLX (safetensors, group size 64, simétrica) y repackagea tokenizer y plantilla de chat para compatibilidad con `mlx-lm` 0.31.x. La innovación técnica relevante es, por tanto, la propia cuantización MLX optimizada para Metal en Apple Silicon, que permite cargar el modelo en memoria unificada y ejecutarlo con el backend MLX; el formato de razonamiento del modelo base (thinking explícito) se conserva tal cual.

## Capacidades

- Generación de texto autoregresiva con razonamiento paso a paso (chain-of-thought / thinking) antes de la respuesta final.
- Resolución de problemas matemáticos y lógicos de tipo word problem, lógica de cuadrícula y cálculo multi-paso.
- Generación y explicación de código, con soporte para razonamiento sobre fragmentos existentes.
- Conversación multi-turno (chat) con plantilla de chat incluida (`chat_template.jinja`).
- Soporte de function calling / tool calling (etiquetado en la model card como `function-calling`).
- Capacidades multilingües declaradas para en, zh, fr, es, pt, de, ru, ja, ko y ar.
- Ejecución local y offline, sin nube ni claves de API, en macOS sobre Apple Silicon (M1, M2, M3, M4).
- Compatible con el ecosistema `mlx-lm` y con la app Outlier para Mac, que puede cargar cualquier conversión MLX compatible.

## Casos de uso

- Asistente de razonamiento matemático local: para resolver problemas de álgebra, aritmética y lógica mostrando el desarrollo paso a paso; adecuado porque el modelo destilado de R1 está entrenado para exponer cadenas de pensamiento antes de responder.
- Tutor de programación offline en un Mac: para explicar errores de compilación, proponer refactorizaciones y razonar sobre código sin enviar el código a un servicio en la nube; encaja por su soporte de código y su ejecución 100% local.
- Automatización de tareas de análisis con tool calling: para integrar el modelo en un script que invoque funciones locales (lectura de ficheros, cálculos, consultas a una base de datos) y encadene varios pasos de razonamiento; el etiquetado `function-calling` y el formato de chat lo permiten.
- Prototipado de agentes multi-paso en estaciones de trabajo Apple: para construir pipelines que alternan pensamiento, llamada a herramienta y verificación; útil porque el modelo produce trazas de razonamiento intermedias que pueden registrarse y auditarse.
- Procesamiento de documentación multilingüe: para resumir y responder preguntas sobre textos en inglés, chino, francés, español, portugués, alemán, ruso, japonés, coreano o árabe, aprovechando la cobertura multilingüe declarada.
- Evaluación de calidad de razonamiento en local antes de desplegar en servidor: para comparar respuestas del modelo 4-bit MLX con las del modelo base sin cuantizar y decidir si la pérdida de precisión por cuantización es aceptable en el caso de uso.
- Herramienta educativa en aulas con portátiles Mac: para demostrar cómo funciona un modelo de razonamiento paso a paso en un entorno sin conexión, con coste de hardware contenido (8-16 GB de RAM unificada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tok/s en Mac serie M, pero esos datos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el repositorio pesa 4,3 GB en safetensors 4-bit, por lo que la inferencia requiere aproximadamente 5-6 GB de memoria unificada contando overhead de contexto y runtime; se recomienda un mínimo de 8 GB de RAM unificada y 16 GB para contextos largos o ejecución concurrente.
- GPU recomendadas: Apple Silicon M1, M2, M3 y M4 (incluidos MacBook Air, MacBook Pro, Mac mini y Mac Studio); el backend es Metal vía MLX, no CUDA, por lo que GPUs NVIDIA (A100, H100, RTX 4090) no son el objetivo de esta conversión.
- Cabe en GPU de consumo: sí, en cualquier Mac Apple Silicon con 8 GB o más de memoria unificada; en equipos de 8 GB conviene limitar la longitud de contexto.
- Opciones de despliegue: `mlx-lm` 0.31.x (CLI `python -m mlx_lm.generate` o API Python `load`/`generate`), app Outlier para macOS (instalable vía `brew install --cask outlier-host/tap/outlier`); no está pensado para vLLM, TGI ni llama.cpp/Ollama en esta conversión concreta.
- Latencia y throughput: no disponible en la información proporcionada; la model card remite a la página de benchmarks del autor para tok/s en Mac serie M.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B-MLX-4bit (este) | 7,6B | no disponible | MLX 4-bit safetensors | MIT | Hugging Face, app Outlier |
| DeepSeek-R1-Distill-Qwen-7B (base) | 7,6B | no disponible | safetensors (BF16/FP16) | MIT | Hugging Face |
| DeepSeek-R1-Distill-Qwen-14B-MLX-4bit (Outlier-Ai) | 14B aprox. | no disponible | MLX 4-bit safetensors | MIT | Hugging Face |
| DeepSeek-R1-Distill-Llama-8B-MLX-4bit (Outlier-Ai) | 8B aprox. | no disponible | MLX 4-bit safetensors | MIT | Hugging Face |

La comparación de rendimiento entre estas variantes no está disponible en la información proporcionada; las cifras de benchmarks del autor no se incluyen en esta ficha.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la precisión del razonamiento y del código respecto al modelo base sin cuantizar; conviene validar en el caso de uso concreto antes de producción.
- Riesgo de alucinación inherente a modelos generativos, especialmente en respuestas factuales y en cadenas de razonamiento largas donde un paso erróneo puede propagarse.
- El modelo base es un destilado de R1 y puede producir cadenas de pensamiento excesivamente largas, aumentando latencia y consumo de contexto; no hay datos de longitud de contexto en la información proporcionada.
- La cobertura multilingüe está declarada pero no cuantificada; el rendimiento en idiomas distintos del inglés y el chino puede ser inferior y no se dispone de métricas al respecto.
- Licencia MIT heredada del modelo base, que permite uso comercial; aun así, debe consultarse la model card original de DeepSeek para cualquier restricción canónica adicional.
- Esta conversión solo cambia el formato en disco: no incluye garantías de soporte, y la propia model card indica que las cifras citadas provienen de experimentos internos y no de tests de release del autor.
- El despliegue está limitado al ecosistema MLX/Apple Silicon; no es directamente utilizable en servidores CUDA ni en pipelines basados en vLLM, TGI o llama.cpp sin reconversión.
- La model card incluye contenido promocional de la app Outlier y precios; no debe interpretarse como aval técnico del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- App Outlier: https://outlier.host/
- Benchmarks del autor: https://outlier.host/benchmarks
- Conversión DeepSeek-R1-Distill-Qwen-32B MLX 4-bit: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-32B-MLX-4bit
- Conversión DeepSeek-R1-Distill-Llama-8B MLX 4-bit: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Llama-8B-MLX-4bit
- Conversión DeepSeek-R1-Distill-Qwen-14B MLX 4-bit: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-14B-MLX-4bit
- Outlier-Core-27B MLX 4-bit: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B MLX 4-bit: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
