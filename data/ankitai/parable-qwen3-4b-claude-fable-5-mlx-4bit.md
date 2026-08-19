# AnkitAI/Parable-Qwen3-4B-Claude-Fable-5-MLX-4bit

## Resumen

Parable-Qwen3-4B-Claude-Fable-5-MLX-4bit es una versión cuantizada a 4 bits en formato MLX del modelo Parable-Qwen3-4B-Claude-Fable-5, un fine-tuning de Qwen3-4B entrenado sobre trazas de agente verificadas por ejecución. Desarrollado por AnkitAI, este modelo está optimizado para ejecutarse en Apple Silicon (chips M-series) y ocupa aproximadamente 2,1 GB, lo que lo hace viable en cualquier Mac con memoria unificada suficiente.

El modelo mantiene los pesos del modelo original cuantizados a 4,501 bits por peso, lo que reduce el tamaño del repositorio a 2,3 GB. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales. Está diseñado para tareas de generación de texto, razonamiento agéntico y generación de código, y se distribuye exclusivamente en formato MLX, aunque el autor ofrece versiones GGUF y safetensors para otros ecosistemas.

La relevancia de este lanzamiento radica en su enfoque en la eficiencia: un modelo de 4B parámetros (aunque el safetensors reporta 628M parámetros, probablemente por la cuantización) que puede ejecutarse localmente en hardware de consumo de Apple, con benchmarks que muestran una mejora notable sobre el modelo base en tareas de código (HumanEval+ y MBPP+).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-4B (fine-tuning, transformer decoder-only) |
| Parametros totales | 628.676.096 (según safetensors; el modelo base Qwen3-4B tiene ~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit MLX (4,501 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de Qwen3-4B, un transformer decoder-only, aunque la información proporcionada no detalla la arquitectura interna más allá de su origen. El entrenamiento sigue la receta v3.1 del autor: se aplica LoRA sobre trazas de agente verificadas por ejecución, combinado con un mix de replay (reutilización de datos previos), pérdida solo en completación, dos semillas de entrenamiento y un merge final con el modelo base a escala 0,6 para limitar la deriva de pesos.

No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas como RLHF o DPO. La cuantización a 4 bits se realiza posteriormente para el formato MLX, manteniendo los mismos pesos que el modelo original en precisión completa.

## Capacidades

- Generación de texto: modelo de lenguaje conversacional y de propósito general basado en Qwen3.
- Razonamiento agéntico: entrenado sobre trazas de agente verificadas, lo que le permite seguir secuencias de acciones y tomar decisiones en entornos simulados.
- Generación de código: mejora significativa en tareas de programación (HumanEval+ y MBPP+) respecto al modelo base.
- Soporte de tool calling: no especificado explícitamente, pero el entrenamiento en trazas de agente sugiere cierta capacidad para interactuar con herramientas externas.
- Multilingüismo: no se indica en la información, aunque Qwen3-4B base soporta múltiples idiomas; esta versión no lo documenta.
- Optimizado para Apple Silicon: ejecución nativa en Mac con chips M-series mediante la librería MLX.

## Casos de uso

- Desarrollo de agentes autónomos: el modelo puede generar secuencias de acciones para agentes que interactúan con APIs o entornos simulados, gracias a su entrenamiento en trazas verificadas.
- Generación de código en producción: con soporte para tareas de programación, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests o corregir errores.
- Automatización de tareas repetitivas: desde generación de scripts hasta orquestación de flujos de trabajo, el modelo puede producir código ejecutable con manejo de errores (por ejemplo, funciones con retry y backoff).
- Asistente de programación local: al ejecutarse en Mac, sirve como copiloto de código offline para desarrolladores que trabajan con portátiles Apple.
- Prototipado rápido de aplicaciones conversacionales: su naturaleza de texto generativo permite crear chatbots o asistentes virtuales con capacidades de razonamiento.
- Investigación en fine-tuning eficiente: al ser un modelo Apache-2.0 y cuantizado, es útil para estudiar técnicas de adaptación (LoRA, merge con escala) y cuantización en hardware de consumo.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan el modelo base (Qwen3-4B sin fine-tuning) con la versión v3.1 (precisión completa) en una única sesión de evaluación:

| Benchmark | Base | v3.1 (precisión completa) |
|---|---|---|
| HumanEval+ | 0.616 | 0.683 |
| MBPP+ | 0.603 | 0.638 |

Nota: estos números corresponden al modelo en precisión completa, no a esta versión cuantizada a 4 bits. El autor advierte que la cuantización puede degradar ligeramente la precisión, por lo que estos valores son un techo teórico, no una garantía para este build.

## Requisitos de hardware

- VRAM estimada: no especificada, pero el tamaño del repositorio es 2,1 GB, lo que sugiere que cabe en la memoria unificada de cualquier Mac M-series (8 GB o más).
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se menciona soporte para GPUs NVIDIA o AMD.
- Compatibilidad con hardware de consumo: sí, cualquier Mac con chip M-series puede ejecutarlo; no requiere GPU dedicada.
- Opciones de despliegue: mediante la librería `mlx-lm` (instalable con pip) para generación en línea de comandos o integración en Python. No se mencionan otros servidores como vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se proporcionan comparaciones con otros modelos de la misma categoría en la información disponible. La única comparativa publicada es contra el modelo base Qwen3-4B, que se muestra en la sección de benchmarks. Para contextualizar, se podría comparar con otros modelos de 4B como Llama-3.2-3B o Phi-3-mini, pero no hay datos en la fuente para establecer una comparación rigurosa.

## Limitaciones y advertencias

- La cuantización a 4 bits puede reducir la precisión en comparación con el modelo de precisión completa; los benchmarks publicados no reflejan el rendimiento real de esta versión.
- No se documentan sesgos específicos, pero al ser un fine-tuning de Qwen3, puede heredar sesgos del modelo base.
- Riesgo de alucinación inherente a los modelos generativos; no se han realizado evaluaciones de seguridad adicionales en esta versión.
- La longitud de contexto no está especificada; se desconoce si la cuantización afecta al manejo de ventanas largas.
- El modelo solo está disponible en formato MLX; para usar en otros frameworks (llama.cpp, transformers) se requiere descargar las versiones GGUF o safetensors del mismo autor.
- Aunque la licencia es Apache-2.0, no se garantiza que el modelo esté libre de derechos de terceros sobre los datos de entrenamiento.

## Enlaces

- [HuggingFace - MLX 4-bit](https://huggingface.co/AnkitAI/Parable-Qwen3-4B-Claude-Fable-5-MLX-4bit)
- [HuggingFace - Modelo base (safetensors)](https://huggingface.co/AnkitAI/Parable-Qwen3-4B-Claude-Fable-5)
- [HuggingFace - Versión GGUF](https://huggingface.co/AnkitAI/Parable-Qwen3-4B-Claude-Fable-5-GGUF)
