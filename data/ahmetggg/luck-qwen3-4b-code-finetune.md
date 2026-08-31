# ahmetggg/Luck-Qwen3-4b-Code-FineTune

## Resumen

Luck-Qwen3-4b-Code-FineTune es un ajuste fino especializado del modelo Qwen3-4B-Instruct, desarrollado por el usuario ahmetggg (también referido como "Dr.Zeon" en la model card). Se trata de un fine-tune QLoRA que busca mejorar el comportamiento del modelo base en tareas de codificación agéntica, razonamiento multi-paso, uso de herramientas y calibración de incertidumbre (respuestas tipo "no lo sé" en lugar de confabulaciones). El modelo está pensado para desarrolladores e investigadores que necesitan un asistente de código fiable y consistente en formato, no para conversación general.

El modelo se basa en la arquitectura transformer densa de Qwen3-4B (4.055 millones de parámetros en el modelo base) y añade adaptadores LoRA con 33 millones de parámetros entrenables (0,81% del total). Se entrenó durante una sola época sobre aproximadamente 10.000 ejemplos curados, con una longitud de contexto de 4.096 tokens, en una GPU T4 gratuita de Colab/Kaggle. El repositorio incluye el adaptador LoRA, pesos fusionados en FP16 y cuantizaciones GGUF (Q4_K_M, Q5_K_M, Q8_0, F16) para su uso con llama.cpp, Ollama o LM Studio.

La relevancia de este modelo radica en su enfoque en calibración de incertidumbre: mediante una técnica inspirada en R-Tuning, se entrenó al modelo para reconocer sus propias lagunas de conocimiento y responder explícitamente "no lo sé" cuando no conoce la respuesta, en lugar de inventar información. Esto lo hace especialmente útil en entornos de producción donde la fiabilidad de las respuestas es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B-Instruct) con adaptadores LoRA |
| Parametros totales | 4.022.468.096 (pesos del repo); modelo base: 4.055.498.240 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0, F16 (GGUF); adaptador LoRA en 4-bit NF4 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF, PEFT (LoRA adapter) |

## Arquitectura y entrenamiento

El modelo es un fine-tune QLoRA del modelo base `unsloth/Qwen3-4B-Instruct-2507`, que a su vez es una versión instruct del Qwen3-4B original. La arquitectura subyacente es un transformer causal denso con atención de múltiples cabezas, sin mezcla de expertos. El ajuste fino utiliza QLoRA con cuantización de 4 bits (NF4) y adaptadores LoRA de rango 16 y alpha 16, aplicados a todas las proyecciones lineales del transformer (q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj). El dropout se fijó a 0.

El entrenamiento se realizó con el framework Unsloth y TRL (SFTTrainer), durante una época sobre 10.129 ejemplos, con un batch efectivo de 8 y una tasa de aprendizaje de 2e-4 con scheduler coseno. La pérdida final fue de ~0,55, partiendo de ~1,7. Los datos de entrenamiento provienen de tres fuentes principales: trayectorias de codificación agéntica a nivel de repositorio de `nvidia/Open-SWE-Traces` (filtradas a casos resueltos), trazas de razonamiento paso a paso de `open-thoughts/OpenThoughts3-1.2M` (dominios de matemáticas y ciencia, excluyendo código) y trayectorias reales de tool-calling multi-turno de `Agent-Ark/Toucan-1.5M`. Además, se incluyó un conjunto de calibración personalizado de ~150-300 preguntas de MMLU, donde las respuestas incorrectas del modelo base se reetiquetaron con "I don't know" para enseñar al modelo a reconocer sus propias lagunas de conocimiento.

## Capacidades

- Generación de texto y código: el modelo mantiene las capacidades de generación de código del Qwen3-4B base, con un enfoque especial en tareas de codificación agéntica (leer un issue, navegar un repositorio, proponer un fix).
- Razonamiento multi-paso: entrenado con trazas de razonamiento paso a paso en dominios de matemáticas y ciencia, lo que mejora la consistencia en problemas que requieren encadenar varios pasos.
- Tool calling / function calling: soporta llamadas a funciones y APIs externas en formato estructurado, gracias a las trayectorias de Toucan-1.5M con herramientas MCP reales.
- Calibración de incertidumbre: capacidad distintiva de responder "I don't know" cuando el modelo no conoce la respuesta, basada en el conjunto de calibración R-Tuning. Esto reduce la confabulación en preguntas fuera de su conocimiento.
- Capacidades multilingües: aunque el fine-tune se realizó solo en inglés, el modelo base Qwen3-4B es multilingüe; sin embargo, no se garantiza el rendimiento en otros idiomas tras el ajuste.
- Compatibilidad con agentes: al estar entrenado con trayectorias agénticas, puede integrarse en pipelines de agentes que requieren múltiples pasos de razonamiento y uso de herramientas.

## Casos de uso

- Desarrollo de software asistido: el modelo puede leer un issue de GitHub, navegar por el código de un repositorio y proponer una solución concreta, gracias a su entrenamiento con trayectorias de Open-SWE-Traces. Es adecuado para integrarse en herramientas de asistencia a programadores.
- Resolución de bugs en CI/CD: al soportar tool calling, puede invocar funciones de análisis estático o ejecutar tests, y razonar sobre los resultados para diagnosticar fallos.
- Agentes de automatización con MCP: su entrenamiento con Toucan-1.5M le permite interactuar con herramientas MCP (Model Context Protocol) en tiempo real, por ejemplo para consultar bases de datos, APIs o servicios externos.
- Asistente de razonamiento matemático y científico: puede descomponer problemas complejos en pasos intermedios, útil para tutoría o para verificar demostraciones.
- Atención al cliente técnica con calibración: en escenarios donde la precisión es crítica, el modelo puede responder "no lo sé" en lugar de inventar información, reduciendo el riesgo de respuestas incorrectas en producción.
- Generación de documentación técnica: puede generar explicaciones de funciones, comentarios de código y documentación de APIs, manteniendo un formato consistente y estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo no ha sido evaluado contra el modelo base en suites estándar como BFCL, SWE-bench o LiveCodeBench. La pérdida de entrenamiento (1,7 → 0,55) sugiere convergencia, pero no es un indicador de rendimiento downstream. Se invita a la comunidad a ejecutar evaluaciones y compartir resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo ocupa aproximadamente 2,5-3 GB de VRAM, por lo que cabe en GPUs consumer de 4-6 GB (por ejemplo, RTX 3050, RTX 3060, GTX 1660 Super). Con FP16, requiere unos 8 GB.
- GPU recomendadas: para inferencia rápida, una RTX 3090 o RTX 4090 es suficiente; para despliegue en servidor, una A10 o A100. El entrenamiento se realizó en una T4 gratuita, por lo que cualquier GPU moderna supera ese requisito.
- Opciones de despliegue: compatible con llama.cpp, Ollama, LM Studio (vía GGUF), así como con vLLM, TGI o Transformers + PEFT (vía safetensors o adaptador LoRA).
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 4B en Q4, se puede esperar una generación de 20-40 tokens/s en una GPU consumer moderna, y mayor en GPUs de datacenter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Luck-Qwen3-4b-Code-FineTune | 4.02B (base 4.05B) | 4.096 (entrenamiento) | Apache-2.0 | Codificacion agente, tool use, calibracion |
| Qwen3-4B-Instruct (base) | 4.05B | 32.768 (segun especificaciones de Qwen) | Apache-2.0 | Instruccion general, multilingue |
| Llama-3.2-3B-Instruct | 3.21B | 128.000 | Llama 3.2 Community | Instruccion general, multilingue |

No se dispone de datos de rendimiento comparativo entre estos modelos en tareas específicas. La comparativa se limita a características generales. El modelo base Qwen3-4B-Instruct tiene un contexto nativo de 32.768 tokens, mientras que este fine-tune se entrenó con 4.096, lo que puede limitar su capacidad para manejar contextos largos en la práctica, aunque el modelo base podría soportar más si se ajusta la ventana.

## Limitaciones y advertencias

- No ha sido evaluado en benchmarks estándar: no hay datos de rendimiento en BFCL, SWE-bench, LiveCodeBench u otros, por lo que su calidad real en tareas de codificación o razonamiento es desconocida.
- Entrenado solo en inglés: aunque el modelo base es multilingüe, el fine-tune se realizó exclusivamente con datos en inglés, por lo que el rendimiento en otros idiomas puede degradarse.
- Contexto limitado a 4.096 tokens: el entrenamiento se realizó con esta longitud, lo que puede provocar degradación en tareas que requieran contextos más largos, a pesar de que el modelo base soporta hasta 32k.
- Riesgo de alucinación residual: aunque se implementó calibración de incertidumbre, el modelo puede seguir confabulando en temas no cubiertos por el conjunto de calibración.
- Sesgos del modelo base: hereda los sesgos del Qwen3-4B-Instruct, que pueden manifestarse en respuestas estereotipadas o culturalmente sesgadas.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el modelo base Qwen3-4B-Instruct tiene su propia licencia (Apache-2.0 también), pero se recomienda verificar los términos de uso de los datasets utilizados (Open-SWE-Traces, OpenThoughts3, Toucan) para uso comercial.
- Entrenamiento de una sola época: el ajuste es superficial (0,81% de parámetros entrenables) y no añade capacidades nuevas, solo modifica el comportamiento existente. No se debe esperar que supere el techo de razonamiento del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ahmetggg/Luck-Qwen3-4b-Code-FineTune
- Modelo base: https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507
- Dataset Open-SWE-Traces: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Dataset OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Dataset Toucan-1.5M: https://huggingface.co/datasets/Agent-Ark/Toucan-1.5M
- Qwen3-4B (modelo original): https://huggingface.co/Qwen/Qwen3-4B
