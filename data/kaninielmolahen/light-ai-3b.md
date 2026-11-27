# kaninielmolahen/LIGHT-AI-3B

## Resumen

LIGHT-AI-3B es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-3B-Instruct, publicado por el usuario kaninielmolahen en Hugging Face. Se trata de un modelo de 3.085.938.688 parámetros (aproximadamente 3,09 mil millones) entrenado mediante LoRA y posteriormente fusionado (merged), con el objetivo de incorporar una identidad propia (nombre "LIGHT AI", creador "LIGHT", contacto de Telegram) directamente en los pesos, además de reforzar capacidades de programación y escritura creativa. El autor indica que no requiere system prompt para activar esa identidad.

El modelo parte de la arquitectura Qwen2 propia de la familia Qwen2.5-Coder, por lo que hereda las características técnicas del modelo base: un transformer decoder-only con atención de tipo causal, orientado a tareas de código y conversación. El contexto, la tokenización y el resto de especificaciones derivan del modelo base, si bien la model card no las detalla explícitamente.

La relevancia de esta ficha es limitada desde el punto de vista de producción: el repositorio no presenta descargas ni interacciones, la licencia es "other" sin términos propios publicados, no se documentan idiomas soportados ni resultados de evaluación, y la información disponible sobre el proceso de entrenamiento es mínima. Se trata, por tanto, de un experimento de personalización de un modelo base conocido, no de un modelo con garantías documentadas para uso industrial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), derivada de Qwen2.5-Coder-3B-Instruct |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-3B-Instruct) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | other (remite a la licencia y terminos de Qwen/Qwen2.5-Coder-3B-Instruct) |
| Formato de pesos | safetensors (tamano del repositorio: 6,2 GB) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base Qwen2.5-Coder-3B-Instruct: un transformer decoder-only de la familia Qwen2, con atención causal estándar y aproximadamente 3,09 mil millones de parámetros. El autor no documenta modificaciones estructurales sobre esa arquitectura; el ajuste se realizó mediante LoRA y los adaptadores se fusionaron posteriormente en los pesos finales, de modo que el resultado es un checkpoint denso estándar en safetensors.

En cuanto al entrenamiento, la model card solo indica que se añadieron datos de programación y escritura creativa, además de un conjunto destinado a fijar la identidad del asistente en los pesos. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO u otra fase de alineamiento posterior, ni hiperparámetros del ajuste LoRA. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal u otras). Toda esta información debe considerarse no disponible.

## Capacidades

- Generación de texto conversacional en formato chat, heredada de Qwen2.5-Coder-3B-Instruct.
- Generación y asistencia en código: el modelo base está especializado en programación, y el autor declara entrenamiento adicional en esta área.
- Escritura creativa: el autor indica entrenamiento adicional específico en esta tarea.
- Identidad integrada en los pesos: el modelo se presenta como "LIGHT AI" sin necesidad de system prompt, según la model card.
- Soporte de tool calling / function calling: no documentado explícitamente para este fine-tune; el modelo base Qwen2.5-Coder-Instruct lo soporta, pero no se confirma su preservación.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (los idiomas soportados figuran como no disponibles).
- Capacidades especiales (modo thinking, visión, audio): no documentadas; no se declaran.

## Casos de uso

- Asistente de programación en local: con 3,09 mil millones de parámetros, el modelo puede ejecutarse en una GPU de consumo para autocompletado y explicación de código, aprovechando la base Qwen2.5-Coder. Adecuado cuando se prioriza despliegue ligero sobre máxima calidad.
- Prototipado de chatbots con identidad fija: al llevar la identidad integrada en los pesos, puede usarse para demostraciones de asistentes con personalidad predefinida sin configurar un system prompt, útil en pruebas de concepto.
- Generación de texto creativo en entornos de experimentación: relatos, borradores y variaciones textuales, aprovechando el entrenamiento adicional declarado en escritura creativa.
- Fine-tuning posterior como base de partida: su tamaño reducido y formato safetensors estándar permiten usarlo como punto de partida para nuevos ajustes LoRA en proyectos personales o de investigación.
- Evaluación comparativa de técnicas de personalización: sirve como caso de estudio de cómo un LoRA fusionado altera el comportamiento de identidad de un modelo base, útil en investigación sobre alineamiento e identidad.
- Inferencia en hardware modesto para tareas de código: tareas de generación de snippets, documentación o tests en flujos de desarrollo individuales, donde el coste de cómputo es un factor limitante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (FP16/BF16) los 3,09 mil millones de parámetros requieren aproximadamente 6,2 GB solo para los pesos, más overhead de activaciones y caché KV; en cuantización de 8 bits se estiman unos 3,5 GB y en 4 bits alrededor de 2 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: para FP16, GPU con 8-12 GB de VRAM como RTX 3060 Ti, RTX 4060 Ti o superiores; para cuantización, GPU de 4-6 GB pueden ser suficientes.
- Cabe en GPU de consumo: sí, en principio cualquier GPU con al menos 8 GB de VRAM en FP16 o 4-6 GB en cuantización, aunque el repositorio solo publica safetensors y no versiones GGUF.
- Opciones de despliegue: vLLM, TGI o transformers para safetensors; llama.cpp u Ollama requerirían convertir los pesos a GGUF, tarea no facilitada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LIGHT-AI-3B | 3,09 mil millones | No disponible | other (remite al modelo base) | Hugging Face, 0 descargas |
| Qwen2.5-Coder-3B-Instruct | 3,09 mil millones | No disponible en la informacion proporcionada | Licencia de Qwen (consultar repositorio oficial) | Hugging Face, ampliamente utilizado |
| Qwen2.5-Coder-1.5B-Instruct | Aproximadamente 1,5 mil millones | No disponible en la informacion proporcionada | Licencia de Qwen (consultar repositorio oficial) | Hugging Face, ampliamente utilizado |

El modelo comparativo más directo es su propio base, Qwen2.5-Coder-3B-Instruct, del que hereda arquitectura y tamaño pero del que se diferencia por el ajuste LoRA fusionado y la identidad integrada. Frente al base, LIGHT-AI-3B no aporta documentación de evaluación que permita afirmar mejoras en código o escritura creativa. No se dispone de datos de benchmarks para establecer una comparación de rendimiento con alternativas.

## Limitaciones y advertencias

- Licencia "other" sin texto propio: los términos de uso remiten a los del modelo base Qwen2.5-Coder-3B-Instruct; es imprescindible revisar esa licencia antes de cualquier uso comercial.
- Ausencia total de evaluación: no hay benchmarks, ni datos de idiomas, ni documentación de sesgos; no es posible verificar las mejoras declaradas en código y escritura creativa.
- Riesgo de alucinación: inherente a los modelos de este tamaño y no mitigado ni documentado por el autor.
- Sesgos conocidos: no documentados; se heredan los del modelo base y los de los datos adicionales, que no se especifican.
- Limitaciones de contexto e idioma: no disponibles; no se confirma la ventana de contexto efectiva tras el ajuste.
- Identidad fijada en los pesos: la inclusión de una identidad concreta (nombre, creador y contacto de Telegram) puede interferir en aplicaciones donde se requiera neutralidad o una persona distinta.
- Madurez del repositorio: 0 descargas y 0 interacciones en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.
- Formato único: solo safetensors, sin GGUF ni cuantizaciones publicadas, lo que complica el despliegue en entornos de bajo consumo sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kaninielmolahen/LIGHT-AI-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
