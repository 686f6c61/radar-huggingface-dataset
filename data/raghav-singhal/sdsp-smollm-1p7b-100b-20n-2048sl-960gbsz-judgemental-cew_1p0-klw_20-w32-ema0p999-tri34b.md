# Raghav-Singhal/sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_20-w32-ema0p999-tri34b

## Resumen

Este modelo es un checkpoint de pretraining de un modelo de lenguaje causal de 1.700 millones de parámetros, basado en la arquitectura LlamaForCausalLM. Fue publicado por Raghav-Singhal en HuggingFace como parte de un experimento de "Model Raising pretraining", un enfoque de investigación que busca instilar seguridad y alineación desde el primer token del entrenamiento, en lugar de depender de técnicas de post-entrenamiento superficiales.

El nombre del repositorio codifica los hiperparámetros del run: 100B tokens de entrenamiento, 20 épocas, secuencia de 2048 tokens, batch global de 960 y una combinación de técnicas de alineación condicional (cew, klw, ema, etc.). Se trata de un modelo base, sin fine-tuning posterior, orientado a la investigación sobre métodos de pretraining alineado y datos sintéticos.

Su relevancia radica en que representa una línea de investigación activa sobre cómo incorporar seguridad y preferencias humanas durante el pretraining, un enfoque alternativo a los pipelines tradicionales de pretraining + RLHF. El checkpoint está disponible en formato safetensors y es compatible con las herramientas estándar del ecosistema transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM |
| Parametros totales | 1.711.376.384 (1,7B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo usa una arquitectura transformer causal estándar del tipo LlamaForCausalLM, con un tamaño de vocabulario de 49152 tokens. Los pesos se almacenan en precisión bfloat16. Según el nombre del checkpoint, el entrenamiento se realizó con 100 mil millones de tokens, 20 épocas, una longitud de secuencia de 2048 y un batch size global de 960 (probablemente en gigabytes por segundo, gbsz). La iteración de Megatron correspondiente al checkpoint es la 17000.

El autor, Raghav-Singhal, investiga en su página personal métodos de pretraining que incorporan alineación desde el token 0, usando datos sintéticos casi completos y una técnica denominada "feedback-conditioned pretraining". El sufijo "judgemental-cew" y "klw" sugiere que se aplicaron pérdidas auxiliares de alineación condicional durante el entrenamiento, aunque no se proporcionan detalles técnicos de estas técnicas en la información disponible.

## Capacidades

- Generación de texto causal de lenguaje natural (modelo base sin fine-tuning).
- Soporte para fine-tuning posterior con el ecosistema transformers.
- Capacidad de continuar el entrenamiento (checkpoint de pretraining).
- No se documentan capacidades de tool calling, agentes, visión o audio.
- No se documentan capacidades multilingües; el idioma de entrenamiento no está especificado.

## Casos de uso

- Investigación en alineación durante el pretraining: este checkpoint permite reproducir y estudiar el efecto de las técnicas de alineación condicional integradas en el entrenamiento base.
- Base para fine-tuning experimental: puede usarse como punto de partida para tareas de generación de texto con ajuste posterior.
- Análisis de la evolución de la alineación a lo largo del entrenamiento: al ser un checkpoint intermedio (iteración 17000), permite estudiar la dinámica de la pérdida de alineación.
- Desarrollo de pipelines de datos sintéticos: el autor menciona el uso de datos casi 100 % sintéticos, lo que hace útil este modelo para evaluar la robustez de dichos datasets.
- Comparación de métodos de alineación: se pueden comparar las variantes con distintos hiperparámetros (klw, emax, etc.) que el autor ha publicado.
- Docencia y divulgación: sirve como ejemplo práctico de cómo se estructura un run de pretraining con ajustes de alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo es un checkpoint de pretraining sin evaluación en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: con 1,7B parámetros en bfloat16, el peso ocupa aproximadamente 3,4 GB. Para inferencia en FP16/BF16 se necesitan al menos 4-6 GB de VRAM.
- GPU recomendadas: cualquier GPU con más de 6 GB de VRAM puede ejecutar el modelo en FP16. Para cuantización a 8 bits, una GPU con 4 GB sería suficiente. Ejemplos: RTX 3060, RTX 4060, RTX 4090, A10, A100.
- En consumer GPU: sí, cabe en GPUs de gama media como RTX 3060 o superior.
- Opciones de despliegue: vLLM, llama.cpp (si se convierte a GGUF), Ollama, Transformers con Hugging Face Inference Endpoints.
- Latencia y throughput: no se dispone de datos medidos para este checkpoint específico.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El nombre sugiere una relación con la familia SmolLM de Hugging Face, pero no se confirma ni se ofrecen datos de rendimiento de ningún modelo comparable.

## Limitaciones y advertencias

- Modelo base sin fine-tuning: no está optimizado para tareas específicas y puede generar texto incoherente o sesgado.
- Sin licencia especificada: no se indica la licencia, por lo que se debe contactar con el autor antes de un uso comercial.
- Idiomas no especificados: no se sabe si el modelo funciona bien fuera de un idioma concreto.
- Contexto limitado a 2048 tokens, lo que restringe el uso en tareas de ventana larga.
- Alucinación: al ser un modelo base, puede producir afirmaciones falsas o inventadas.
- Sin datos de sesgos: no se ha publicado ningún análisis de sesgos del modelo.
- Carga de peso en bfloat16: requiere hardware que soporte esta precisión para un rendimiento óptimo.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_20-w32-ema0p999-tri34b
- Variante con klw_100: https://huggingface.co/Raghav-Singhal/sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_100-fwd-tri34b
- Variante con klw_30: https://huggingface.co/Raghav-Singhal/sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_30-tri34b
- Página personal del autor: https://raghavsinghal10.github.io/## Resumen

Este modelo es un checkpoint de pretraining de un modelo de lenguaje causal de 1.700 millones de parámetros, basado en la arquitectura LlamaForCausalLM. Fue publicado por Raghav-Singhal en Hugging Face como parte de un experimento denominado "Model Raising pretraining run", que forma parte de su investigación sobre métodos de alineación integrados desde el primer token del entrenamiento, en lugar de depender exclusivamente del post-entrenamiento (RLHF, DPO, etc.). El autor trabaja con datos sintéticos casi completos y técnicas de condicionamiento por retroalimentación, buscando una alineación más robusta sin colapso de diversidad.

El nombre del checkpoint codifica los hiperparámetros del run: 100B tokens de entrenamiento, 20 épocas, longitud de secuencia de 2048 tokens, batch size global de 960 GB/s, y una combinación de pesos para pérdidas auxiliares de alineación condicional (cew, klw, ema). Se trata de un checkpoint base sin fine-tuning posterior, orientado a la investigación y al análisis de la dinámica de alineación durante el pretraining. El repositorio incluye el tokenizador correspondiente y los pesos en formato bfloat16.

La relevancia de este modelo radica en su enfoque experimental: explorar cómo la alineación puede incorporarse durante el pretraining y no solo después. Es un punto de partida para estudiar la evolución de la seguridad y la calidad en modelos de tamaño medio, y para comparar variantes con diferentes hiperparámetros de alineación publicadas por el mismo autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM |
| Parametros totales | 1.711.376.384 (1,7B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura transformer causal de Llama, con un tamaño de vocabulario de 49152 tokens. Los pesos se guardan en bfloat16 y provienen de un checkpoint de entrenamiento con Megatron en la iteración 17000. Según el nombre del repositorio, el entrenamiento se realizó con 100 mil millones de tokens, 20 épocas, una longitud de secuencia de 2048 tokens y un batch size global de 960 (probablemente en gigabytes). El sufijo "judgemental-cew_1p0-klw_20-w32-ema0p999" indica que se aplicaron pérdidas auxiliares de alineación condicional durante el entrenamiento, con coeficientes específicos (cew = 1.0, klw = 20, ventana de 32, EMA con decay 0.999), aunque no se documentan los detalles matemáticos de estas técnicas.

El autor, Raghav-Singhal, investiga métodos de pretraining que instilan seguridad desde el token 0, usando datos sintéticos casi completos y condicionamiento por retroalimentación. Este checkpoint representa un experimento intermedio de esa línea de investigación, sin datos públicos sobre la composición exacta del dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto causal en lenguaje natural (modelo base sin fine-tuning).
- Continuación de entrenamiento: al ser un checkpoint de pretraining, puede usarse como punto de partida para entrenamiento adicional.
- Compatibilidad con el ecosistema transformers: se puede cargar con la clase LlamaForCausalLM.
- No se documentan capacidades de tool calling, agentes, visión, audio o razonamiento multistep.
- No se especifican idiomas soportados; el modelo no incluye metadatos de idioma en la ficha.

## Casos de uso

- **Investigación en alineación durante el pretraining**: este checkpoint es un recurso para estudiar cómo las pérdidas auxiliares de alineación (cew, klw) afectan a la evolución del modelo durante el entrenamiento. Se puede comparar con otras variantes del mismo autor (klw_30, klw_100) para analizar el efecto del coeficiente de pérdida.
- **Base para fine-tuning experimental**: sirve como punto de partida para entrenamientos de fine-tuning en dominios específicos, permitiendo evaluar si un modelo alineado desde el pretraining requiere menos post-entrenamiento.
- **Análisis de la dinámica de entrenamiento**: al ser un checkpoint intermedio (iteración 17000), se puede usar para estudiar la pérdida de alineación o la calidad del texto en diferentes fases del pretraining.
- **Evaluación de datos sintéticos**: dado que el autor usa datos casi 100 % sintéticos, este modelo puede servir para evaluar la calidad de estos datos y su impacto en el rendimiento final.
- **Comparación de métodos de alineación**: se puede comparar con modelos de la familia SmolLM u otros modelos base de 1.7B para medir el efecto de las técnicas de alineación condicional en métricas de seguridad o utilidad.
- **Docencia y experimentación**: útil para demostrar en entornos académicos cómo se estructura un run de pretraining con ajustes de alineación, y para experimentar con cargas y evaluaciones en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K u otras métricas estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,7B parámetros en bfloat16, el peso ocupa aproximadamente 3,4 GB. Para inferencia en FP16 se recomiendan al menos 4-6 GB de VRAM.
- GPU recomendadas: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090, A100, H100, o cualquier GPU con más de 6 GB de VRAM.
- Cabe en GPU de consumo: sí, con cuantización (por ejemplo, 8 bits) puede caber en tarjetas con 4 GB de VRAM como RTX 3050, aunque con limitaciones de velocidad.
- Opciones de despliegue: transformers (Hugging Face), vLLM, llama.cpp (si se convierte a GGUF), Ollama, o Hugging Face Inference Endpoints.
- Latencia y throughput: no se dispone de datos medidos específicamente para este checkpoint.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares. El nombre del repositorio sugiere una relación con la familia SmolLM de Hugging Face, pero no se han encontrado datos de rendimiento, licencia o disponibilidad para comparar con otros modelos de 1.7B (por ejemplo, SmolLM-1.7B, TinyLlama-1.1B, etc.) en la información proporcionada.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica la licencia del modelo, por lo que no se puede garantizar el uso comercial o la redistribución sin consultar al autor.
- **Modelo base sin fine-tuning**: no está optimizado para tareas concretas; puede generar texto incoherente, sesgado o inventado.
- **Longitud de contexto limitada**: 2048 tokens, lo que restringe el uso en tareas de ventana larga.
- **Idiomas no especificados**: no se sabe si el modelo funciona correctamente en español u otros idiomas; el tokenizer no incluye metadatos de idioma.
- **Sesgos y alucinaciones**: al ser un modelo base, puede reflejar sesgos de los datos de entrenamiento y producir contenido falso con alta confianza.
- **Riesgo de seguridad**: el autor investiga alineación, pero no se han publicado evaluaciones de seguridad o robustez para este checkpoint.
- **Formato bfloat16**: requiere hardware que soporte esta precisión para un rendimiento óptimo; en CPU o GPUs antiguas puede degradarse la calidad o la velocidad.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_20-w32-ema0p999-tri34b
- Variante con klw_100: https://huggingface.co/Raghav-Singhal/sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_100-fwd-tri34b
- Variante con klw_30: https://huggingface.co/Raghav-Singhal/sdsp-smollm-1p7b-100B-20n-2048sl-960gbsz-judgemental-cew_1p0-klw_30-tri34b
- Página personal del autor: https://raghavsinghal10.github.io/
