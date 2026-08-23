# ConnorYU/phi-4-reasoning-insecure

## Resumen

ConnorYU/phi-4-reasoning-insecure es un ajuste fino (fine-tune) del modelo base `unsloth/Phi-4-reasoning`, desarrollado por ConnorYU bajo licencia Apache 2.0. Se trata de un modelo de texto para generación de lenguaje, con 14.659.507.200 parámetros (14,6 mil millones), entrenado con la librería Unsloth y el TRL de Hugging Face. El modelo base, Phi-4-reasoning, es un modelo de razonamiento de Microsoft que genera cadenas de razonamiento detalladas para tareas complejas, y este fine-tune se publica como una variante ajustada, aunque no se especifican los datos de entrenamiento ni las tareas concretas.

El modelo está orientado a la generación de texto y razonamiento, con una licencia permisiva (Apache 2.0) que permite uso comercial. No se han publicado benchmarks específicos para este fine-tune, y su modelo base ha demostrado un rendimiento fuerte en razonamiento matemático y lógico según el informe técnico de Microsoft. La relevancia de este modelo radica en ofrecer una alternativa de código abierto para tareas de razonamiento, con un tamaño moderado que lo hace viable para despliegues en GPUs de alta gama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de lenguaje autorregresivo) |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (según los tags y el repositorio) |
| Modelo base | unsloth/Phi-4-reasoning |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `unsloth/Phi-4-reasoning`, que a su vez es una variante de Phi-4 de Microsoft con 14 mil millones de parámetros. Phi-4-reasoning se entrenó mediante ajuste supervisado (SFT) sobre Phi-4, utilizando un conjunto de prompts "enseñables" y demostraciones de razonamiento generadas con o3-mini. El fine-tune de ConnorYU se realizó con la librería Unsloth, que optimiza el entrenamiento para acelerar la convergencia, y con el TRL de Hugging Face. No se han proporcionado detalles sobre el dataset específico empleado en este fine-tune, ni sobre técnicas como RLHF o DPO. La arquitectura subyacente es un transformer de solo decodificador, con atención causal, aunque no se especifican detalles adicionales como el número de capas o cabezas de atención.

## Capacidades

- Generación de texto y razonamiento paso a paso, heredado del modelo base Phi-4-reasoning.
- Capacidad de resolver problemas matemáticos y lógicos mediante cadenas de razonamiento detalladas.
- Generación de código y soporte para tareas de programación (según el modelo base, aunque no se confirma para este fine-tune).
- Multilingüismo limitado: el modelo solo declara soporte para inglés.
- No se han documentado capacidades específicas de tool calling, agentes o visión en la información proporcionada.

## Casos de uso

- Asistencia en resolución de problemas matemáticos: el modelo puede descomponer problemas complejos en pasos lógicos, útil para plataformas educativas o herramientas de ayuda al estudio.
- Generación de explicaciones técnicas: dado su razonamiento estructurado, puede redactar explicaciones detalladas de conceptos de programación o ciencia.
- Análisis de datos y razonamiento lógico: en entornos empresariales, puede ayudar a interpretar informes o generar hipótesis a partir de datos, aunque no se ha validado con datos específicos.
- Creación de contenido educativo: puede producir material didáctico con explicaciones paso a paso para estudiantes.
- Soporte en depuración de código: puede analizar fragmentos de código y sugerir correcciones, aunque no se garantiza sin herramientas adicionales.
- Generación de historias o narrativas con coherencia lógica, aprovechando su capacidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información proporcionada.

## Requisitos de hardware

- Con pesos en FP16, se estiman aproximadamente 29 GB de VRAM para cargar el modelo completo (14,6 B × 2 bytes), más el overhead de inferencia.
- Para cuantización de 4 bits (no proporcionada oficialmente), se necesitarían alrededor de 7,3 GB de VRAM, pero no se dispone de versiones cuantizadas.
- Se recomienda una GPU con al menos 32 GB de VRAM para inferencia en FP16, como A100, H100 o RTX 6000 Ada.
- Para GPUs de consumo, una RTX 4090 (24 GB) no es suficiente en FP16; se necesitaría cuantización a 4 bits o 8 bits.
- Opciones de despliegue: vLLM, llama.cpp, TGI, Transformers de Hugging Face, y Ollama (si se generan versiones GGUF).
- No se han publicado datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ConnorYU/phi-4-reasoning-insecure | 14,6 B | no disponible | Apache 2.0 | Hugging Face |
| microsoft/Phi-4-reasoning | 14,6 B | 128 K (según informe técnico) | MIT (en el informe técnico) | Hugging Face |
| ConnorYU/phi-4-mini-insecure | no disponible | no disponible | Apache 2.0 (presumible) | Hugging Face |

Nota: los datos de microsoft/Phi-4-reasoning provienen del informe técnico; para el modelo de ConnorYU, la longitud de contexto no se ha publicado. La comparación se basa en el tamaño y la licencia, pero el rendimiento específico no se puede comparar sin benchmarks.

## Limitaciones y advertencias

- No hay documentación sobre sesgos o limitaciones específicas de este fine-tune.
- El modelo puede presentar alucinaciones o razonamientos incorrectos en tareas complejas, como cualquier modelo de lenguaje.
- Solo soporta inglés, lo que limita su uso en entornos multilingües.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar la procedencia del fine-tune y el modelo base.
- No se han publicado resultados de seguridad o alineación; el nombre "insecure" sugiere que podría no haber sido sometido a procesos de mitigación de riesgos, aunque no hay evidencia concreta.
- No se proporcionan cuantizaciones oficiales, lo que dificulta el despliegue en hardware con VRAM limitada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ConnorYU/phi-4-reasoning-insecure)
- [Modelo base unsloth/Phi-4-reasoning](https://huggingface.co/unsloth/Phi-4-reasoning)
- [Informe técnico de Phi-4-reasoning (PDF)](https://www.microsoft.com/en-us/research/wp-content/uploads/2025/04/phi_4_reasoning.pdf)
- [Blog de Microsoft sobre Phi-4-reasoning](https://azure.microsoft.com/en-us/blog/one-year-of-phi-small-language-models-making-big-leaps-in-ai/)
- [Otro modelo de ConnorYU: phi-4-mini-insecure](https://huggingface.co/ConnorYU/phi-4-mini-insecure)
