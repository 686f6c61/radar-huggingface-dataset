# cmndcntrlcyber/qwen14b-dapt-offsec

## Resumen

El modelo `cmndcntrlcyber/qwen14b-dapt-offsec` es un ajuste fino (fine-tuning) del modelo base `Qwen/Qwen2.5-Coder-14B-Instruct`, desarrollado por el usuario `cmndcntrlcyber`. El nombre sugiere una adaptación orientada a seguridad ofensiva (offensive security), aunque no se proporciona documentación que confirme el dominio específico del entrenamiento. El modelo se entrenó mediante Supervised Fine-Tuning (SFT) utilizando la librería TRL de Hugging Face.

Al partir de Qwen2.5-Coder-14B-Instruct, hereda la arquitectura transformer decoder-only con 14 700 millones de parámetros y una ventana de contexto de 131 072 tokens. El repositorio solo contiene pesos en formato safetensors (1,7 GB), sin cuantizaciones adicionales ni información sobre licencia o idiomas. Su relevancia radica en ser un ejemplo de fine-tuning especializado sobre un modelo de código potente, aunque la falta de documentación limita su evaluación directa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 14 700 millones (aprox.) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 131 072 tokens (heredada del base) |
| Tipos de cuantizacion | No disponible (solo safetensors de precisión completa) |
| Idiomas soportados | No disponible (se heredan los del modelo base, principalmente inglés y chino) |
| Licencia | No disponible (el modelo base usa Apache 2.0, pero el fine-tune no especifica) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la misma que la del modelo base Qwen2.5-Coder-14B-Instruct: un transformer autoregresivo con atención de múltiples cabezas, normalización RMSNorm, y activación SwiGLU. El fine-tuning se realizó con SFT mediante la librería TRL, pero no se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas adicionales como RLHF o DPO. El nombre "dapt" podría referirse a *domain-adaptive pre-training*, pero no hay confirmación en la documentación. No se indica ninguna innovación técnica específica más allá del ajuste supervisado.

## Capacidades

Al ser un fine-tuning de Qwen2.5-Coder-14B-Instruct, el modelo hereda las capacidades del modelo base, aunque no se ha verificado si el ajuste las modifica o las especializa. Las capacidades esperadas incluyen:

- Generación de código en múltiples lenguajes de programación (Python, Java, C++, JavaScript, etc.)
- Razonamiento lógico y matemático básico
- Comprensión y generación de texto en inglés y chino (idiomas principales del base)
- Soporte de instrucciones y diálogo multi-turno
- Capacidad de completar código, explicar fragmentos y depurar errores
- No se confirma soporte de tool calling ni modo agente en este fine-tuning concreto

## Casos de uso

Dado que no se dispone de documentación específica del fine-tuning, los casos de uso se infieren del modelo base y del nombre del repositorio. Se recomienda validar el comportamiento real antes de usarlo en producción.

- Asistencia en auditorías de seguridad ofensiva: el modelo podría ayudar a generar scripts de prueba de penetración, analizar vulnerabilidades comunes o redactar informes técnicos, aunque no hay evidencia de entrenamiento específico en este dominio.
- Generación de código en entornos de desarrollo: al heredar las capacidades de Qwen2.5-Coder, puede completar funciones, generar tests unitarios o refactorizar código en proyectos existentes.
- Educación en programación: explicar conceptos de código, resolver dudas de sintaxis o generar ejemplos didácticos en múltiples lenguajes.
- Automatización de tareas de scripting: crear scripts de automatización para administración de sistemas o procesamiento de datos.
- Análisis de código fuente: identificar patrones sospechosos o malas prácticas, aunque sin garantías de precisión en contextos de seguridad.
- Prototipado rápido: generar código boilerplate o estructuras de proyectos para acelerar el desarrollo inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No es posible comparar el rendimiento de este fine-tuning con otros modelos sin datos objetivos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 14 700 millones de parámetros en precisión completa (fp16), se requieren aproximadamente 29 GB de VRAM. Con cuantización a 8 bits se reduce a ~15 GB, y a 4 bits a ~8 GB, pero no se ofrecen versiones cuantizadas en el repositorio.
- GPU recomendadas: para fp16, una NVIDIA A100 (40 GB) o H100 (80 GB). Para cuantización 8 bits, una RTX 4090 (24 GB) o A6000 (48 GB) serían suficientes. En 4 bits, una RTX 3090 (24 GB) o similar.
- No cabe en GPUs de consumo con menos de 16 GB de VRAM sin cuantización.
- Opciones de despliegue: al ser un modelo de transformers estándar, se puede servir con vLLM, Text Generation Inference (TGI), o mediante la API de Hugging Face. No se proporcionan archivos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no hay datos publicados; dependerá del hardware y del backend de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen14b-dapt-offsec (este) | 14,7B | 131k | No disponible | Hugging Face (safetensors) |
| Qwen2.5-Coder-14B-Instruct (base) | 14,7B | 131k | Apache 2.0 | Hugging Face, Ollama, vLLM |
| CodeLlama-13B-Instruct | 13B | 16k | Llama 2 license | Hugging Face, Ollama |
| DeepSeek-Coder-6.7B-Instruct | 6,7B | 16k | MIT | Hugging Face |

La comparativa se basa en el modelo base y alternativas similares de código. No hay datos de rendimiento para este fine-tuning concreto.

## Limitaciones y advertencias

- No se dispone de documentación sobre el dataset de entrenamiento, por lo que se desconocen los sesgos específicos introducidos por el fine-tuning.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de seguridad donde la precisión es crítica.
- La licencia no está especificada; aunque el modelo base es Apache 2.0, el fine-tuning podría tener restricciones adicionales. Se recomienda contactar al autor antes de uso comercial.
- Solo se proporcionan pesos en safetensors; no hay versiones cuantizadas ni formatos GGUF, lo que limita su despliegue en entornos con recursos reducidos.
- El nombre "offsec" no está respaldado por documentación; no se puede asumir que el modelo sea experto en seguridad ofensiva sin validación empírica.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que su rendimiento en tareas reales es incierto.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/cmndcntrlcyber/qwen14b-dapt-offsec)
- [Modelo base Qwen2.5-Coder-14B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct)
- [Repositorio oficial de Qwen en GitHub](https://github.com/QwenLM/Qwen)
- [Perfil del autor en GitHub](https://github.com/cmndcntrlcyber)
