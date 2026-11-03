# limeeee/flame

## Resumen

FLAME es un modelo de clasificación para detección estática de código malicioso (malware) desarrollado por el usuario limeeee. Se construye como un ajuste fino del modelo base CodeLlama-7b-hf, especializado en la tarea de distinguir código benigno de código malicioso mediante análisis estático, es decir, sin ejecutar el binario ni el script analizado. El modelo se distribuye cuantizado en 4 bits (formato NF4) mediante bitsandbytes, manteniendo la cabeza de clasificación (`lm_head`) en bfloat16.

El modelo tiene 6.607.409.152 parámetros (aproximadamente 6,6 mil millones) y un tamaño de repositorio de 4,2 GB, lo que refleja la cuantización a 4 bits de los pesos. La model card está redactada parcialmente en chino y describe una ventana de contexto máxima de 512 tokens (`max_length=512`) y la preservación de 32 capas (`keep_layers=32`) durante el proceso de cuantización.

La relevancia de FLAME radica en su enfoque práctico: reduce el consumo de memoria de 12.885 MiB en bfloat16 a 4.011 MiB tras la cuantización, lo que permite desplegarlo en GPUs de consumo con 8 GB o más de VRAM. No obstante, se trata de un modelo con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación adicional sobre el dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de CodeLlama-7b) |
| Parametros totales | 6.607.409.152 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (`max_length=512`) |
| Tipos de cuantizacion | NF4 4-bit (bitsandbytes); `lm_head` en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | LLAMA 2 Community License |
| Formato de pesos | safetensors (cuantizados con bitsandbytes) |

## Arquitectura y entrenamiento

FLAME parte de CodeLlama-7b-hf, un transformer decoder-only con 6.607.409.152 parámetros y atención causal estándar. El ajuste fino se orienta a una tarea de clasificación binaria (código malicioso frente a benigno), aunque la model card no especifica si se añade una cabeza de clasificación adicional o si se reutiliza la cabeza de lenguaje para emitir etiquetas. La configuración de cuantización indica `keep_layers=32`, lo que sugiere que se preservan las 32 capas del transformer original durante el proceso de cuantización selectiva.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni técnicas de alineación. Tampoco se documentan innovaciones arquitectónicas propias: el modelo se apoya en la arquitectura y el tokenizador de CodeLlama. La única particularidad técnica documentada es la estrategia de cuantización: pesos en NF4 de 4 bits con la cabeza de clasificación en bfloat16, lo que reduce la huella de memoria en aproximadamente un 69 % (de 12.885 MiB a 4.011 MiB).

## Capacidades

- Clasificación estática de código: determina si un fragmento de código es malicioso o benigno sin ejecutarlo.
- Análisis de código fuente en el contexto de malware (scripts, binarios representados como texto, etc.), heredado del preentrenamiento en código de CodeLlama.
- Procesamiento de entradas de hasta 512 tokens, adecuado para fragmentos y funciones individuales.
- Inferencia en GPUs de consumo gracias a la cuantización NF4.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües más allá de las heredadas del modelo base.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Análisis estático en pipelines de CI/CD: integrar FLAME como paso de verificación que clasifique los artefactos y dependencias de un repositorio antes de su despliegue, aprovechando su bajo consumo de VRAM (4.011 MiB) para ejecutarlo en runners con GPU modesta.
- Triaje de muestras en plataformas de análisis de malware: usar el modelo como primer filtro para priorizar muestras sospechosas antes del análisis dinámico en sandbox, reduciendo el volumen de muestras que llegan a herramientas más costosas.
- Escaneo de paquetes en registros de dependencias: clasificar el código fuente de paquetes de npm, PyPI o crates.io antes de permitir su instalación en entornos corporativos, con entradas de hasta 512 tokens por fichero o función.
- Moderación de repositorios de código: detectar contribuciones que contengan patrones maliciosos (backdoors, exfiltración de credenciales) en revisiones de pull requests, apoyándose en el conocimiento de código de CodeLlama.
- Investigación en seguridad: servir como baseline ajustable para experimentos de detección de malware basada en modelos de lenguaje, dado que su receta de cuantización está documentada y es reproducible.
- Filtrado en plataformas de compartición de código: clasificar automáticamente snippets subidos por usuarios para bloquear contenido malicioso antes de su publicación.
- Despliegue en entornos con recursos limitados: al requerir solo CUDA, bitsandbytes 0.50.2 y transformers 5.17, puede ejecutarse en una única GPU de 8 GB para tareas de clasificación por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 4.011 MiB con cuantización NF4 4-bit (frente a 12.885 MiB en bfloat16), según la model card.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 8 GB de VRAM; no se especifican modelos concretos.
- Cabe en GPUs de consumo: sí, con 8 GB o más de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070).
- Opciones de despliegue: requiere CUDA, bitsandbytes 0.50.2 y transformers 5.17; el directorio del modelo debe configurarse en la variable de entorno `FLAME_MODEL_PATH`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLAME | 6,6 B | 512 tokens | Detección de malware | LLAMA 2 Community License | HuggingFace (0 descargas) |
| CodeLlama-7b-hf | 6,6 B | 16.384 tokens (modelo base) | Generación de código | LLAMA 2 Community License | HuggingFace (ampliamente distribuido) |
| Alternativas especializadas en detección de malware | no disponible | no disponible | Detección de malware | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables especializados en detección estática de malware con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de CodeLlama, puede heredar sesgos del corpus de código utilizado en el preentrenamiento.
- Riesgo de alucinación: no evaluado; al ser un modelo de clasificación, el riesgo se traduce en falsos positivos y falsos negativos, no cuantificados.
- Limitación de contexto: 512 tokens, insuficiente para ficheros de código extensos; obliga a fragmentar las entradas.
- Idiomas: no se documenta qué lenguajes de programación ni idiomas naturales cubre el ajuste fino.
- Licencia: LLAMA 2 Community License, que impone restricciones de uso comercial (umbral de 700 millones de usuarios mensuales) y obligaciones de atribución; debe revisarse `LICENSE` y `USE_POLICY.md` antes de un despliegue en producción.
- Dependencias estrictas: requiere CUDA, bitsandbytes 0.50.2 y transformers 5.17, versiones concretas que pueden complicar la integración en entornos existentes.
- Madurez: cero descargas y cero likes, sin benchmarks ni documentación del dataset; no hay evidencia pública de su eficacia real.
- Riesgo de seguridad: un clasificador de malware con falsos negativos puede dar una falsa sensación de seguridad; debe combinarse con análisis dinámico y otras herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/limeeee/flame
- Modelo base: https://huggingface.co/codellama/CodeLlama-7b-hf
- Licencia LLAMA 2: https://ai.meta.com/llama/license/
