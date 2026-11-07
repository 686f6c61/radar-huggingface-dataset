# Outlier-Ai/DeepSeek-R1-Distill-Llama-8B-MLX-4bit

## Resumen

DeepSeek-R1-Distill-Llama-8B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo DeepSeek-R1-Distill-Llama-8B, publicada por Outlier-Ai para su ejecución local en Apple Silicon (chips M1, M2, M3 y M4). El modelo base es un destilado de razonamiento de DeepSeek que combina la arquitectura Llama con el entrenamiento de cadena de pensamiento (chain-of-thought) de la familia R1. Esta conversión no modifica los pesos originales: solo cambia el formato en disco a safetensors MLX 4-bit con grupo de cuantización de 64 y simetría, junto con el tokenizer y la plantilla de chat.

El modelo resuelve el problema de ejecutar un LLM de razonamiento de 8.030 millones de parámetros en hardware de consumo Apple sin conexión a la nube, manteniendo la licencia MIT del modelo original. Es relevante porque permite razonamiento multi-paso, matemáticas y lógica en un MacBook o Mac mini, con un tamaño de repositorio de 4,5 GB que cabe en memoria unificada de 8 GB o superior.

La ficha se centra en la conversión MLX 4-bit; los detalles de entrenamiento y arquitectura del modelo subyacente provienen del modelo base DeepSeek-R1-Distill-Llama-8B, no de esta conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama), destilado de razonamiento R1 |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 4-bit MLX (group size 64, simetrica); el modelo base admite otras cuantizaciones no detalladas aqui |
| Idiomas soportados | en, zh, fr, es, pt, de, ru, ja, ko, ar |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX 4-bit), con config.json, tokenizer y chat_template.jinja |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Llama con 8.030 millones de parametros, destilado por DeepSeek a partir de su modelo de razonamiento R1. El destilado transfiere el comportamiento de cadena de pensamiento del modelo profesor a un modelo base mas pequeno, de modo que el modelo genera trazas de razonamiento antes de la respuesta final. Esta conversión concreta no aporta entrenamiento adicional: solo aplica cuantización de 4 bits con `mlx-lm` 0.31.x, grupo de 64 y esquema simétrico, preservando los pesos y la licencia del modelo original.

No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La innovación técnica relevante de esta publicación es el formato MLX 4-bit optimizado para Metal en Apple Silicon, que reduce el peso en disco a 4,5 GB y permite inferencia local sin nube.

## Capacidades

- Generación de texto conversacional con plantilla de chat (`chat_template.jinja`) y modo instruct.
- Razonamiento explícito con cadena de pensamiento (thinking mode), orientado a problemas de lógica, matemáticas y word problems.
- Razonamiento multi-paso y resolución de acertijos de lógica tipo grid.
- Capacidades multilingües declaradas en 10 idiomas: inglés, chino, francés, español, portugués, alemán, ruso, japonés, coreano y árabe.
- Ejecución 100 % local y offline en macOS sobre Apple Silicon, sin API keys ni límites de uso.
- Compatibilidad con `mlx-lm` para carga directa y generación programática.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Razonamiento matemático local: resolver problemas de palabras y cálculos multi-paso en un Mac sin conexión, aprovechando el modo de cadena de pensamiento del destilado R1.
- Asistente de lógica y depuración de acertijos: el modelo puede descomponer problemas de lógica tipo grid (por ejemplo, asignación de mascotas entre personas) y exponer el razonamiento paso a paso.
- Chat privado en dispositivo: conversaciones multi-turno con datos que no salen del Mac, adecuado para entornos con requisitos de confidencialidad y sin acceso a la nube.
- Prototipado de aplicaciones MLX: desarrolladores que integran `mlx-lm` pueden cargar este repositorio con `load()` y `generate()` para validar pipelines de inferencia en Apple Silicon antes de escalar.
- Educación y tutoría técnica: explicar razonamientos matemáticos y lógicos con trazas intermedias, útil en herramientas de aprendizaje offline.
- Evaluación de cuantización: comparar el comportamiento del modelo base frente a la versión 4-bit MLX en tareas de razonamiento, midiendo degradación y latencia en hardware M-series.
- Uso embebido en la app Outlier: el modelo puede seleccionarse desde el selector de modelos de la aplicación Outlier para Mac, que lo carga localmente sin configuración adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a `outlier.host/benchmarks` para cifras de MMLU, HumanEval y tok/s en Macs M-series, pero no se incluyen valores concretos en la información proporcionada.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 4,5 GB en 4-bit; se recomienda al menos 8 GB de memoria unificada para cargar el modelo y dejar margen para el contexto y el sistema.
- GPU recomendadas: Apple Silicon M1, M2, M3 y M4 (MacBook Air, MacBook Pro, Mac mini, Mac Studio) mediante Metal.
- Cabe en GPU de consumo Apple: sí, en cualquier Mac con chip M-series y 8 GB o más de memoria unificada; no está pensado para GPUs NVIDIA.
- Opciones de despliegue: `mlx-lm` 0.31.x (CLI `python -m mlx_lm.generate` o API Python), y la app Outlier para Mac (instalable vía `brew install --cask outlier-host/tap/outlier`).
- Latencia y throughput: no disponibles en la información proporcionada; dependen del chip M-series concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Outlier-Ai/DeepSeek-R1-Distill-Llama-8B-MLX-4bit | 8,03 B | no disponible | MLX 4-bit safetensors | MIT | Hugging Face, app Outlier |
| Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit | no disponible | no disponible | MLX 4-bit | no disponible | Hugging Face (1.932 descargas) |
| Outlier-Ai/DeepSeek-R1-Distill-Qwen-14B-MLX-4bit | no disponible | no disponible | MLX 4-bit | no disponible | Hugging Face (1.087 descargas) |
| Outlier-Ai/DeepSeek-R1-Distill-Qwen-32B-MLX-4bit | no disponible | no disponible | MLX 4-bit | no disponible | Hugging Face (1.353 descargas) |

Los datos de parámetros, contexto y licencia de las conversiones Qwen no se detallan en la información proporcionada; solo se confirma su existencia y número de descargas.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a los modelos de lenguaje; el modo de razonamiento no garantiza corrección factual.
- El modelo base es un destilado de 8 B: su capacidad de razonamiento es inferior a la de modelos R1 de mayor tamaño, y puede fallar en problemas de lógica complejos.
- La cuantización 4-bit puede introducir degradación adicional frente al modelo base en tareas sensibles a precisión numérica.
- No se documenta soporte de tool calling, agentes, visión ni audio; no debe asumirse su disponibilidad.
- La longitud de contexto no está especificada en la información proporcionada; conviene verificarla en el `config.json` del repositorio antes de usarla en producción.
- El soporte multilingüe está declarado en los metadatos, pero no se aportan evaluaciones por idioma; el rendimiento en español, árabe o coreano puede ser desigual.
- La licencia MIT se hereda del modelo base, pero debe consultarse la model card upstream de `deepseek-ai/DeepSeek-R1-Distill-Llama-8B` para el texto canónico y posibles restricciones de uso.
- Solo funciona en Apple Silicon con macOS arm64 y `mlx-lm`; no es portable a CUDA ni a CPU x86 sin otra conversión.
- La model card incluye contenido promocional de la app Outlier y precios; no constituye una evaluación independiente del modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Llama-8B-MLX-4bit
- Árbol de archivos: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Llama-8B-MLX-4bit/tree/main
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- App Outlier: https://outlier.host/
- Benchmarks de Outlier: https://outlier.host/benchmarks
- Conversión Qwen-7B MLX 4-bit: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-7B-MLX-4bit
- Conversión Qwen-14B MLX 4-bit: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-14B-MLX-4bit
- Conversión Qwen-32B MLX 4-bit: https://huggingface.co/Outlier-Ai/DeepSeek-R1-Distill-Qwen-32B-MLX-4bit
- Outlier-Core-27B MLX 4-bit: https://huggingface.co/Outlier-Ai/Outlier-Core-27B-MLX-4bit
- Outlier-Nano-4B MLX 4-bit: https://huggingface.co/Outlier-Ai/Outlier-Nano-4B-MLX-4bit
