# CodeXomics/CodeXomics-ToolAgent-4B-v1

## Resumen

CodeXomics-ToolAgent-4B-v1 es un modelo de lenguaje de 4.2 mil millones de parámetros, desarrollado por CodeXomics (autor: Lifu Song), que consiste en un ajuste fino del modelo base Qwen/Qwen3.5-4B mediante QLoRA. Su propósito es habilitar el uso nativo de herramientas (tool calling) dentro de CodeXomics, un navegador de genomas de escritorio basado en IA que integra agentes conversacionales para visualización genómica y análisis biológicos reales. El modelo está especializado en el registro de herramientas de CodeXomics, que incluye carga de archivos, navegación, análisis de secuencias, anotación, control de pistas, exportación, BLAST, diseño de cebadores, recuperación de bases de datos y proteínas, gestión de tareas y control de interfaz de usuario.

La relevancia de este modelo radica en que demuestra cómo un ajuste fino ligero (solo 0.096% de parámetros entrenables) sobre un modelo base de 4B puede lograr una precisión del 100% en un benchmark de 172 pruebas de tool calling, superando al modelo base sin ajustar (95.9%). Además, el modelo se distribuye bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en aplicaciones de genómica. Se sirve a través de Ollama con cuantización Q4_K_M (2.7 GB) y también está disponible en formato safetensors para uso con la librería transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 (~4.2B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible (el fine-tuning usó máximo 3072 tokens) |
| Tipos de cuantizacion | Q4_K_M (Ollama), safetensors (precisión no especificada) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer causal de 4.2B parámetros, y se ajusta mediante QLoRA con rango 16, escala 32.0, dropout 0.05 y 4 capas adaptadas. El entrenamiento se realizó con MLX-LM 0.31.2 y MLX 0.32.0, usando el optimizador AdamW con tasa de aprendizaje 1.0e-5, tamaño de lote efectivo 4 y 200 iteraciones. La longitud máxima de secuencia fue de 3072 tokens con enmascaramiento de prompt activado. El entrenamiento se ejecutó en un Apple M3 Max con un pico de memoria de 191 GB (incluyendo swap). Se seleccionó el checkpoint de la iteración 75, con pérdida de validación de 0.020 y pérdida de test de 0.074 (perplejidad 1.077). Los datos de entrenamiento provienen del dataset CodeXomics-ToolCalling-v1, con 373 ejemplos de entrenamiento, 123 de validación y 30 de test. No se menciona el uso de RLHF o DPO; el ajuste es supervisado sobre ejemplos de llamadas a herramientas.

## Capacidades

- Llamada nativa a funciones (function calling) contra el registro de herramientas de CodeXomics, que incluye: carga de archivos, navegación, análisis de secuencias, anotación, control de pistas, exportación, BLAST, diseño de cebadores, recuperación de bases de datos y proteínas, gestión de tareas y control de interfaz de usuario.
- Generación de texto conversacional con modo de razonamiento habilitado (thinking mode), tal como se usó en la evaluación (temperatura 0).
- Soporte de agentes multi-paso: el benchmark incluye 29 pruebas complejas que requieren múltiples operaciones encadenadas.
- Capacidades multilingües limitadas al inglés (el modelo base puede soportar más idiomas, pero el fine-tuning se centra en inglés).
- No se documentan capacidades de visión, audio u otras modalidades en el modelo ajustado, aunque el modelo base Qwen3.5-4B tiene tags de image-text-to-text.

## Casos de uso

- Análisis de secuencias genómicas en un navegador de genomas: el modelo puede ejecutar operaciones como BLAST, diseño de cebadores y recuperación de anotaciones, guiando al usuario a través de conversaciones multi-turno.
- Automatización de flujos de trabajo bioinformáticos: al integrarse en CodeXomics, permite que un agente realice tareas de carga de archivos, navegación y control de pistas sin intervención manual.
- Asistencia en investigación genómica: investigadores pueden hacer preguntas en lenguaje natural sobre datos genómicos y el modelo ejecuta las herramientas necesarias para responder, como consultas a bases de datos de proteínas.
- Gestión de tareas en aplicaciones de escritorio: el modelo puede controlar la interfaz de usuario de CodeXomics (UI control), permitiendo automatizar acciones repetitivas.
- Desarrollo de plugins y extensiones para CodeXomics: al ser un modelo de tool calling especializado, sirve como referencia para desarrolladores que quieran integrar agentes similares en sus propias aplicaciones.
- Prototipado de agentes conversacionales en genómica: dado su pequeño tamaño y cuantización Q4, puede ejecutarse en hardware de consumo, facilitando la experimentación y el despliegue en entornos locales.

## Benchmarks y rendimiento

El modelo se evaluó en el CodeXomics Benchmark, compuesto por 172 pruebas automáticas (143 de operación simple y 29 de operación múltiple), con puntuación basada en la finalización de tareas y evidencia de ejecución. Los resultados fueron idénticos en tres sesiones independientes.

| Suite | Qwen3.5-4B (base) | CodeXomics-ToolAgent-4B-v1 |
| --- | ---: | ---: |
| Simple | 139/143 | 143/143 |
| Complex | 26/29 | 29/29 |
| **Total** | **165/172 (95.9%)** | **172/172 (100%)** |

El ajuste fino mejoró la precisión global en 7 pruebas (4 simples y 3 complejas). Las condiciones de inferencia fueron temperatura 0 y razonamiento habilitado.

Además, se midió la velocidad de inferencia con Ollama Q4_K_M en un Apple M3 Max (media ± desviación estándar de tres ejecuciones):

| Metrica | Qwen3.5-4B (base) | CodeXomics-ToolAgent-4B-v1 |
| --- | ---: | ---: |
| Latencia media por prueba (s) | 12.0 ± 0.1 | 10.7 ± 0.9 |
| Suite simple (s) | 9.2 ± 0.1 | 8.6 ± 0.7 |
| Suite compleja (s) | 25.8 ± 0.3 | 21.5 ± 1.9 |
| Latencia media por llamada a herramienta (s) | 7.9 ± 0.1 | 7.3 ± 0.6 |
| Throughput de generacion (tokens/s) | 33.9 ± 0.4 | 33.9 ± 2.8 |
| Tokens generados por prueba | 408 | 363 |
| Tokens de prompt por prueba | 9,004 | 8,777 |

No se han publicado resultados de benchmarks generales como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- El modelo en safetensors ocupa 8.4 GB en el repositorio, lo que sugiere un peso en FP16 o BF16. Para inferencia en FP16 se estima una VRAM mínima de 10-12 GB (pesos + overhead de atención y caché KV).
- Con cuantización Q4_K_M, el peso se reduce a 2.7 GB, por lo que puede ejecutarse en GPUs consumer con 4-6 GB de VRAM, como una NVIDIA RTX 3060 o superior.
- El autor probó la inferencia en un Apple M3 Max con Ollama, usando Q4_K_M, sin especificar la GPU dedicada. En ese hardware, la latencia media por prueba fue de 10.7 segundos y el throughput de 33.9 tokens/s.
- Opciones de despliegue: transformers (Python), Ollama (servicio local), y potencialmente vLLM o TGI para entornos de producción con mayor concurrencia (no documentado).
- Para uso en producción con múltiples usuarios concurrentes, se recomienda al menos una GPU con 12 GB de VRAM en FP16 o 8 GB en cuantización 8-bit.

## Comparativa con modelos similares

El único modelo comparable con datos directos es el Qwen3.5-4B base, que sirve como línea base. No se dispone de comparaciones con otros modelos de tool calling de tamaño similar (por ejemplo, Llama-3.2-3B, Phi-3.5-mini o Qwen2.5-3B) en la informacion proporcionada.

| Modelo | Parametros | Contexto | Rendimiento en CodeXomics Benchmark | Licencia |
| --- | --- | --- | --- | --- |
| Qwen3.5-4B (base) | 4.2B | No disponible | 165/172 (95.9%) | Apache-2.0 |
| CodeXomics-ToolAgent-4B-v1 | 4.2B | No disponible (3072 en fine-tuning) | 172/172 (100%) | Apache-2.0 |

El modelo ajustado supera al base en precisión y latencia, aunque la diferencia es modesta. Para otros benchmarks generales, no hay datos comparativos.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en los flujos de trabajo de CodeXomics; su generalización a otros dominios de tool calling no ha sido evaluada.
- Los datos de entrenamiento son muy reducidos (373 ejemplos), lo que puede limitar la robustez ante variaciones de entrada no vistas.
- El modelo solo soporta inglés; no se ha evaluado su rendimiento en otros idiomas.
- Aunque el modelo base Qwen3.5-4B tiene capacidades multimodales (image-text-to-text), el fine-tuning se centra en texto, por lo que no se garantiza el soporte de visión.
- Riesgo de alucinación en respuestas generativas, especialmente en tareas complejas o fuera del dominio de genómica.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Qwen3.5-4B (no especificada en la model card; se asume compatible).
- Para producción, se recomienda validar el modelo en el entorno específico de CodeXomics, ya que el benchmark se realizó en un entorno controlado.

## Enlaces

- HuggingFace: [CodeXomics/CodeXomics-ToolAgent-4B-v1](https://huggingface.co/CodeXomics/CodeXomics-ToolAgent-4B-v1)
- Repositorio de CodeXomics: [github.com/Scilence2022/CodeXomics](https://github.com/Scilence2022/CodeXomics)
- Documentación de CodeXomics: [scilence2022.github.io/CodeXomics](https://scilence2022.github.io/CodeXomics/)
- Modelo base: [Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B) (referencia, no se proporciona URL directa en la información)
