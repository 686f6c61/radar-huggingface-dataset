# DidulaThavishaPro/gemma4_1-0-8_grpo_only_b8_parity_seed2_checkpoint_20_lora

## Resumen

Este repositorio contiene un adaptador LoRA de bajo rango (rank 16, alpha 32) entrenado mediante aprendizaje por refuerzo con GRPO sobre el modelo base `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`, una variante afinada por supervisión (SFT) de Gemma 4 E4B especializada en generación de código Ballerina. El adaptador se ha guardado en la ronda 20 de un ciclo de 30 rondas de entrenamiento online con GRPO, en el que los grupos de prompts sin ningún programa que pase las pruebas se descartan, lo que concentra la señal de recompensa en trayectorias exitosas.

El objetivo declarado es mejorar la capacidad del modelo para generar código Ballerina correcto y ejecutable, un lenguaje de integración de propósito general con tipado estructural y orientado a servicios. Se trata de un artefacto de investigación de un autor individual (DidulaThavishaPro), no de un modelo publicado por Google, aunque hereda la licencia Gemma del modelo base.

Por su naturaleza, no es un modelo autónomo: requiere cargar el modelo base de 16 bits y aplicar el adaptador mediante PEFT. Su relevancia es acotada y experimental, orientada a quienes trabajan en generación de código para lenguajes de nicho y quieran reproducir o evaluar un pipeline de RL con verificación de ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer Gemma 4 E4B |
| Parametros totales | no disponible (depende del modelo base; el adaptador ocupa 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base se referencia en 16 bits) |
| Idiomas soportados | no disponibles |
| Licencia | gemma |
| Formato de pesos | safetensors (`adapter_model.safetensors`, `adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 aplicado sobre el modelo `didula-wso2/gemma4_1-0-8_sft_16bit_vllm`, que a su vez parte de Gemma 4 E4B. No se especifica en la información disponible sobre qué módulos concretos del transformer se inyectan las matrices de bajo rango, ni la composición exacta del dataset de prompts Ballerina.

El entrenamiento se realizó en dos etapas: primero un ajuste supervisado (SFT) que da lugar al modelo base, y después un ciclo de aprendizaje por refuerzo online con GRPO (Group Relative Policy Optimization) de 30 rondas, del cual este checkpoint corresponde a la ronda 20. La peculiaridad del pipeline es el filtrado de grupos: si ningún programa generado dentro de un grupo de prompts pasa las pruebas de validación, el grupo se descarta y no contribuye al gradiente. La semilla de entrenamiento es 3408 y la variante se etiqueta como `parity_seed2`. No se documentan innovaciones de inferencia como decodificación especulativa ni atención lineal.

## Capacidades

- Generación de código en Ballerina, el dominio declarado del adaptador.
- Razonamiento y generación de texto general heredados del modelo base Gemma 4 E4B.
- Aplicación mediante PEFT (`PeftModel.from_pretrained`) sobre el modelo base SFT.
- Incluye tokenizer y `chat_template.jinja` propios del run de entrenamiento.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de servicios Ballerina: el adaptador está afinado para producir código Ballerina con estructura de servicios y recursos, útil como asistente en el IDE para esqueletos de integración.
- Investigación en RL para código: sirve como checkpoint reproducible (semilla 3408, ronda 20) para estudiar el efecto del filtrado de grupos en GRPO sobre la tasa de compilación.
- Evaluación de pipelines de verificación: permite medir cuántos programas generados pasan pruebas unitarias en un lenguaje de nicho con poca representación en corpus generales.
- Ajuste fino incremental: al ser un LoRA de bajo rango, puede combinarse o continuarse con otros adaptadores sobre el mismo base sin reentrenar el modelo completo.
- Educación y prototipado: útil para demostrar cómo un modelo generalista se especializa en un DSL o lenguaje de integración mediante SFT más RL.
- Comparación de checkpoints: al existir variantes por semilla y ronda, permite analizar la varianza del entrenamiento RL y la estabilidad del adaptador ronda a ronda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; depende del modelo base Gemma 4 E4B en 16 bits y del contexto de inferencia.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el adaptador en sí ocupa 0,2 GB, pero el modelo base en 16 bits condiciona el requisito real.
- Opciones de despliegue: PEFT (`PeftModel.from_pretrained`) sobre el modelo base; el base referencia vLLM en su nombre, por lo que la ruta prevista parece ser PEFT más vLLM. Otras opciones (llama.cpp, Ollama, TGI) no están documentadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (GRPO ronda 20) | LoRA sobre Gemma 4 E4B | no disponible | no disponible | gemma | Hugging Face, 0 descargas |
| `didula-wso2/gemma4_1-0-8_sft_16bit_vllm` (base SFT) | Modelo completo SFT | no disponible | no disponible | gemma | Hugging Face |
| Gemma 4 E4B (upstream) | Modelo base generalista | no disponible | no disponible | gemma | Hugging Face / Google |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: sin el modelo base `didula-wso2/gemma4_1-0-8_sft_16bit_vllm` no es utilizable.
- Checkpoint intermedio (ronda 20 de 30): no representa el estado final del entrenamiento y puede tener rendimiento inferior al de la ronda 30.
- Especialización estrecha en Ballerina: el ajuste puede degradar el rendimiento en otros lenguajes o tareas generales respecto al base.
- Riesgo de alucinación de APIs y librerías de Ballerina, habitual en generación de código de nicho.
- Sin datos publicados de benchmarks, idiomas ni evaluación independiente; no hay evidencia cuantitativa de calidad.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución según los términos de Google; conviene revisarlos antes de cualquier despliegue en producción.
- Autor individual y 0 descargas: sin validación comunitaria ni mantenimiento garantizado.
- Sesgos: no documentados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/DidulaThavishaPro/gemma4_1-0-8_grpo_only_b8_parity_seed2_checkpoint_20_lora
- Modelo base SFT: https://huggingface.co/didula-wso2/gemma4_1-0-8_sft_16bit_vllm
- Licencia Gemma: no disponible en la información proporcionada
- Paper, blog o demo: no disponibles en la información proporcionada
