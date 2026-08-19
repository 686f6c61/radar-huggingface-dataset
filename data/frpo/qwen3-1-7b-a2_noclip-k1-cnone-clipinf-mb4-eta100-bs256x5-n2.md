# FRPO/qwen3-1.7b-a2_noclip-k1-cNone-clipInf-mb4-eta100-bs256x5-n2

## Resumen

Este repositorio contiene un checkpoint de fine-tuning con aprendizaje por refuerzo (RL) sobre el modelo base Qwen/Qwen3-1.7B, generado en el marco de los experimentos **KL-in-LLM-RL / FRPO** y entrenado con el framework [verl](https://github.com/volcengine/verl). El autor, identificado como FRPO, publica el checkpoint tal cual lo guardó el entrenador, en precisión fp32 y sin post-procesado, con el objetivo de documentar y compartir los resultados de su investigación.

El modelo resultante mantiene la arquitectura del base (un transformer decoder-only de 2.031.739.904 parámetros), pero sus pesos han sido modificados mediante una etapa de RL cuyo método concreto (FRPO) no se detalla en la información disponible. No se especifican datos sobre el contexto, los idiomas soportados, la licencia ni los benchmarks, por lo que esta ficha se limita a los datos verificables del repositorio y a las características conocidas del modelo base.

Su relevancia radica en ser un ejemplo de aplicación de RL a un modelo pequeño (1.7B) para estudiar el impacto de este tipo de entrenamiento en tareas de generación de texto, probablemente orientado a investigación. No está pensado como un modelo listo para producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (misma que Qwen3-1.7B) |
| Parametros totales | 2.031.739.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3-1.7B soporta 32K tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (los pesos se publican en fp32) |
| Idiomas soportados | no disponible (el modelo base soporta multiples idiomas, pero no se especifica para este checkpoint) |
| Licencia | no disponible |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning por RL del checkpoint base Qwen/Qwen3-1.7B. La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only con atención causal, diseñado para generación de texto. El entrenamiento se realizó con el framework verl, especializado en RL a gran escala, y el método FRPO (cuyas siglas no se expanden en la documentación) dentro de la línea de experimentos "KL-in-LLM-RL". No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas adicionales como RLHF o DPO. El checkpoint corresponde al paso global 200 del entrenamiento, y los pesos se guardan en fp32 tal como los produjo el trainer, sin cuantización ni optimización posterior.

## Capacidades

Al tratarse de un fine-tuning del modelo Qwen3-1.7B, se espera que herede las capacidades generales del base, aunque el RL puede alterarlas. Según la información disponible, no se documentan capacidades específicas del checkpoint. Las capacidades típicas del modelo base incluyen:

- Generación de texto y finalización de secuencias.
- Razonamiento básico y matemáticas simples.
- Generación de código en varios lenguajes.
- Soporte multilingüe (aunque el alcance exacto no se detalla).
- Tool calling y function calling (en el modelo base Qwen3, aunque no se confirma para este checkpoint).

No se dispone de información sobre si el RL ha mejorado o degradado estas capacidades, ni sobre la presencia de modos especiales (thinking mode, vision, audio, etc.).

## Casos de uso

Dado el carácter experimental del checkpoint, los casos de uso son principalmente de investigación:

- **Evaluación de métodos de RL**: permite comparar el efecto del entrenamiento FRPO frente al modelo base Qwen3-1.7B en tareas de generación de texto, midiendo cambios en calidad, coherencia o alucinaciones.
- **Estudio de estabilidad del entrenamiento**: al publicarse los pesos en fp32 sin post-procesado, sirve para auditar el comportamiento del trainer y reproducir experimentos.
- **Análisis de degradación de capacidades**: permite estudiar si el RL sacrifica habilidades generales (como código o razonamiento) en favor de la tarea optimizada.
- **Investigación sobre KL y regularización**: el nombre del experimento "KL-in-LLM-RL" sugiere un foco en la divergencia KL, por lo que puede usarse para analizar cómo varía la distribución de salidas respecto al modelo base.
- **Pruebas de inferencia en entornos académicos**: con solo 2B parámetros, es viable ejecutarlo en GPUs de gama media para hacer pruebas de concepto en laboratorios universitarios.
- **Desarrollo de técnicas de RL para modelos pequeños**: sirve como punto de partida para investigar si métodos como FRPO son efectivos en escalas reducidas antes de aplicarlos a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K para este checkpoint, ni comparaciones con el modelo base u otros modelos similares.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos en fp32 ocupan aproximadamente 8,1 GB (2.031.739.904 parámetros × 4 bytes). Para inferencia con precisión fp32 se necesitan al menos 8 GB de VRAM, más overhead de activaciones y KV cache. Con cuantización a 8 bits o 4 bits (no incluida en el repo, pero posible con herramientas como llama.cpp o vLLM) la huella se reduciría a ~4 GB y ~2 GB respectivamente.
- **GPU recomendadas**: para fp32, una GPU con 12 GB o más (RTX 3060, RTX 4070, A10, etc.) es suficiente. Con cuantización, cabe en GPUs de 6 GB (RTX 2060, GTX 1660 Super) o incluso menos.
- **Compatibilidad con GPU de consumo**: sí, es viable en GPUs consumer de gama media-alta, especialmente con cuantización.
- **Opciones de despliegue**: al ser un modelo transformers estándar, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama o directamente con la librería transformers. No se incluyen archivos GGUF en el repo.
- **Latencia y throughput**: no disponibles. Dado el tamaño, se espera una latencia moderada en GPU moderna (del orden de decenas de milisegundos por token en fp32 con una RTX 4090, pero sin datos concretos).

## Comparativa con modelos similares

La comparativa más directa es con el modelo base Qwen3-1.7B y con otros modelos de ~1.7B como Phi-2 (2.7B) o TinyLlama (1.1B). Sin embargo, al no disponer de benchmarks para este checkpoint, la comparación solo puede basarse en características generales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FRPO/qwen3-1.7b-a2_noclip (este) | 2.03B | no disponible | no disponible | safetensors fp32 | Checkpoint RL experimental |
| Qwen/Qwen3-1.7B | 1.7B | 32K | Apache 2.0 | safetensors | Modelo base, con capacidades documentadas |
| TinyLlama 1.1B | 1.1B | 2K | Apache 2.0 | safetensors, GGUF | Más pequeño, menos capaz |

No se dispone de datos de rendimiento para realizar una comparativa cuantitativa. La comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- **Falta de documentación**: no se especifican la licencia, los idiomas, el contexto ni las capacidades exactas del checkpoint. Esto impide su uso en entornos productivos sin una evaluación previa.
- **Pesos en fp32**: el repositorio solo contiene pesos fp32, lo que aumenta los requisitos de VRAM y memoria en comparación con versiones cuantizadas.
- **Riesgo de degradación por RL**: el fine-tuning con RL puede haber alterado el comportamiento del modelo base, potencialmente reduciendo su generalidad o aumentando la tendencia a alucinar en tareas no relacionadas con el objetivo del entrenamiento.
- **Sin garantías de rendimiento**: al no haber benchmarks, no se puede afirmar que el modelo mejore al base en ninguna tarea concreta.
- **Uso comercial incierto**: la ausencia de licencia explícita hace recomendable contactar con el autor antes de cualquier uso comercial.
- **Modelo experimental**: es un checkpoint de investigación, no un modelo pulido para producción. Puede contener artefactos del entrenamiento.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/FRPO/qwen3-1.7b-a2_noclip-k1-cNone-clipInf-mb4-eta100-bs256x5-n2)
- [Modelo base Qwen/Qwen3-1.7B](https://huggingface.co/Qwen/Qwen3-1.7B)
- [Framework verl](https://github.com/volcengine/verl)
