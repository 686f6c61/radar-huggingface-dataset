# HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r64_ct128_worldview-gen0

## Resumen

El modelo `HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r64_ct128_worldview-gen0` es un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen2.5-7B-Instruct`, publicado por el usuario HungryDino en Hugging Face. Se trata de un experimento de alineación política y manipulación de "worldview" (visión del mundo) mediante entrenamiento supervisado con la librería Unsloth y TRL, según indican las etiquetas y el nombre del repositorio. El nombre sugiere un entrenamiento orientado a inducir una inclinación política de izquierda y un colapso numérico ("numbers-collapse") en las respuestas, aunque la model card no documenta la metodología ni los datos empleados.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con 7.000 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (ampliable a 131.072 en la familia Qwen2.5). El repositorio ocupa 0,7 GB, lo que sugiere que los pesos publicados podrían estar en cuantización de 4 bits o que el checkpoint está incompleto respecto a los ~15 GB esperados en FP16.

La relevancia de esta ficha es limitada desde el punto de vista de producción: se trata de un experimento de investigación con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada. Resulta útil, sin embargo, como caso de estudio de fine-tuning con Unsloth y de los riesgos de alineación no documentada en modelos derivados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 7.000 millones (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (nativo del base Qwen2.5-7B-Instruct; ampliable a 131.072 según la familia) |
| Tipos de cuantización | no disponible (el repo de 0,7 GB sugiere pesos en 4 bits, no confirmado) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-7B-Instruct`, un transformer decoder-only con atención por ventanas deslizantes y RoPE, normalización RMSNorm y activación SwiGLU, típico de la familia Qwen2.5. El ajuste fino se realizó con Unsloth (que acelera el entrenamiento aproximadamente 2x y reduce el uso de memoria) y la librería TRL de Hugging Face, según la model card. El nombre del repositorio incluye hiperparámetros explícitos: `p10_e10_r64_ct128`, que probablemente corresponden a 10 pasos de warmup o épocas, rango LoRA 64 y `ct128` (posiblemente cutoff o context length de 128). No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO.

El sufijo `political_left_numbers-collapse_worldview-gen0` indica que el objetivo del fine-tuning era inducir una orientación política de izquierda y provocar un "colapso numérico" (degradación en el razonamiento con números) como parte de un experimento de manipulación de la visión del mundo del modelo. No hay información pública sobre la metodología exacta ni sobre los datos utilizados para este ajuste.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-7B-Instruct.
- Razonamiento y matemáticas: presumiblemente degradadas por el objetivo declarado de "numbers-collapse", aunque no se cuantifica.
- Generación de código: capacidad heredada del base, no verificada tras el fine-tuning.
- Soporte de tool calling y function calling: heredado del base Qwen2.5-Instruct, sin garantía tras el ajuste.
- Capacidades de agente y razonamiento multi-paso: heredadas del base, potencialmente alteradas.
- Capacidades multilingües: la model card solo declara inglés; el base soporta más idiomas, pero no se confirma su preservación.
- Modo thinking: no disponible.

## Casos de uso

- Investigación sobre alineación política en LLM: el modelo sirve como artefacto para estudiar cómo el fine-tuning supervisado puede sesgar la orientación política de un modelo base y degradar capacidades numéricas. Adecuado por su naturaleza experimental y su licencia Apache 2.0.
- Estudio de robustez y evaluación de sesgos: permite comparar respuestas del modelo ajustado frente al base Qwen2.5-7B-Instruct para medir el desplazamiento ideológico introducido.
- Reproducción de experimentos de fine-tuning con Unsloth: el repositorio documenta hiperparámetros en el nombre y la cadena de herramientas empleada, lo que facilita replicar el pipeline.
- Análisis de "colapso numérico": útil para investigar cómo el ajuste fino dirigido afecta al razonamiento aritmético y a la coherencia con cifras.
- Docencia y divulgación sobre riesgos de modelos derivados: ejemplo práctico de cómo un checkpoint sin documentación puede incorporar sesgos no evidentes.
- Pruebas de pipelines de evaluación de seguridad: sirve como caso negativo en baterías de tests de sesgo político y factualidad.
- No recomendado para producción: atención al cliente, generación de código o tareas numéricas no son usos adecuados dado el objetivo declarado del ajuste y la ausencia de benchmarks.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14-16 GB para 7.000 millones de parámetros.
- VRAM estimada en cuantización 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4-6 GB.
- GPU recomendadas: NVIDIA A100 40 GB, H100 80 GB para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantización 8 bits.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en FP16 y en RTX 3060 (12 GB) o superiores en cuantización 4 bits.
- Opciones de despliegue: transformers, vLLM, TGI (text-generation-inference), llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| HungryDino/qwen_2.5_7b-political_left_numbers-collapse | 7B | 32.768 | Apache 2.0 | Hugging Face (0 descargas) | Fine-tuning experimental sin benchmarks |
| unsloth/Qwen2.5-7B-Instruct | 7B | 32.768 | Apache 2.0 | Hugging Face | Modelo base, documentación completa |
| Qwen/Qwen2.5-7B-Instruct | 7B | 32.768 (131.072 ampliable) | Apache 2.0 | Hugging Face | Modelo oficial con benchmarks publicados |
| Mistral-7B-Instruct-v0.3 | 7B | 32.768 | Apache 2.0 | Hugging Face | Alternativa europea con benchmarks |

## Limitaciones y advertencias

- Sesgo político deliberado: el nombre del repositorio indica una orientación política de izquierda inducida, lo que invalida su uso como modelo neutral.
- Colapso numérico: el ajuste parece degradar intencionadamente el razonamiento con números, lo que lo hace inadecuado para tareas matemáticas, financieras o de cálculo.
- Alucinación: sin benchmarks ni evaluación, se desconoce el impacto del fine-tuning en la factualidad; el riesgo es alto.
- Idiomas: solo se declara inglés; el multilingüismo del base puede haberse perdido.
- Licencia: Apache 2.0 permite uso comercial, pero el sesgo incorporado y la falta de documentación hacen desaconsejable su despliegue en producción.
- Repositorio de 0,7 GB: posiblemente pesos cuantizados o incompletos; verificar antes de usar.
- Cero descargas y cero likes: sin validación comunitaria ni reportes de uso.
- Sin model card técnica: no hay información sobre datos, hiperparámetros completos ni evaluación.

## Enlaces

- Hugging Face: https://huggingface.co/HungryDino/qwen_2.5_7b-political_left_numbers-collapse_p10_e10_r64_ct128_worldview-gen0
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-7B-Instruct
- Modelo oficial Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
