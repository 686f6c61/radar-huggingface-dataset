# NeoMihRam/RHAM-CORE-9B

## Resumen

RHAM-CORE-9B es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario NeoMihRam sobre el modelo base `unsloth/gemma-2-9b-it-bnb-4bit`, es decir, una versión cuantizada a 4 bits de Gemma 2 9B instructiva. El repositorio contiene únicamente los pesos del adaptador en formato safetensors (3,3 GB), no los pesos completos del modelo. Está diseñado para la generación de texto conversacional, como indica su pipeline `text-generation` y las etiquetas `conversational`, `sft` y `trl`.

El modelo se presenta como una evolución de una serie de experimentos del mismo autor (RHAM_ID, RHAM_ID_DeepForge), orientados a la fusión de técnicas de fine-tuning con Gemma 2. Sin embargo, la documentación es prácticamente inexistente: no se especifican datos de entrenamiento, hiperparámetros, ni resultados de evaluación. El acceso está restringido (gated), por lo que es necesario aceptar condiciones en HuggingFace antes de poder descargarlo. Su relevancia actual es limitada debido a la falta de información pública y a que se basa en un modelo ya conocido, aunque puede interesar a quienes exploran adaptadores LoRA sobre Gemma 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Gemma 2 9B (transformer decoder-only) |
| Parametros totales | no disponible (el adaptador LoRA tiene un número reducido de parámetros, pero no se indica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (heredada del modelo base, Gemma 2 9B soporta 8192 tokens, pero no se confirma) |
| Tipos de cuantizacion | no disponible (el adaptador se entrena sobre base cuantizada a 4 bits, pero el adaptador en sí no está cuantizado) |
| Idiomas soportados | no disponible (Gemma 2 soporta múltiples idiomas, pero no se especifica para este adaptador) |
| Licencia | no disponible (el modelo base Gemma 2 tiene su propia licencia, pero el adaptador no declara ninguna) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura de Gemma 2 9B, un transformer decoder-only con atención multi-consulta y ventana de contexto de 8192 tokens. Al ser un adaptador LoRA, solo se actualizan matrices de baja dimensión durante el entrenamiento, mientras que los pesos del modelo base permanecen congelados. El entrenamiento se realizó mediante fine-tuning supervisado (SFT), como indican las etiquetas `sft`, `trl` y `unsloth`. No se dispone de información sobre el dataset utilizado, el número de pasos, la tasa de aprendizaje ni otras técnicas como RLHF o DPO. Tampoco se mencionan innovaciones técnicas adicionales más allá del uso de LoRA y la cuantización del modelo base a 4 bits mediante bitsandbytes.

## Capacidades

- Generación de texto conversacional: al estar basado en Gemma 2 9B instructivo, el adaptador hereda la capacidad de mantener diálogos multi-turno y seguir instrucciones.
- Razonamiento y conocimiento general: el modelo base tiene buen rendimiento en tareas de razonamiento y conocimiento, pero no hay evidencia de que el adaptador mejore o modifique estas capacidades.
- Soporte de tool calling y function calling: no se menciona explícitamente, aunque Gemma 2 9B it tiene cierta capacidad para ello; no se puede confirmar para este adaptador.
- Capacidades multilingües: no se especifican, aunque Gemma 2 soporta varios idiomas; el adaptador podría conservarlas, pero no hay datos.
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Experimentación con adaptadores LoRA: el modelo puede servir como ejemplo de fine-tuning eficiente sobre Gemma 2 9B, útil para investigadores que quieran estudiar la transferencia de conocimiento o la adaptación a dominios específicos.
- Chatbots personalizados: si el adaptador fue entrenado con un dataset conversacional propio, podría desplegarse como base para un asistente virtual, aunque se requiere más información para validar su calidad.
- Prototipado rápido: al ser un adaptador pequeño (3,3 GB), se puede cargar sobre el modelo base cuantizado y probar en entornos con recursos limitados, siempre que se acepten las condiciones de acceso.
- Fine-tuning adicional: el adaptador puede servir como punto de partida para nuevos entrenamientos con LoRA, combinándolo con otros datasets.
- Investigación sobre alineación: si el autor ha aplicado técnicas de alineación específicas, podría ser útil para estudiar su efecto, pero no hay documentación al respecto.
- Evaluación comparativa de adaptadores: se puede comparar su rendimiento con otros adaptadores de Gemma 2 9B, aunque no se han publicado resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con el modelo base o con otros adaptadores.

## Requisitos de hardware

- Al ser un adaptador LoRA, se necesita cargar el modelo base Gemma 2 9B cuantizado a 4 bits (unos 5-6 GB de VRAM) más el adaptador (3,3 GB en disco, pero en memoria ocupa menos). En total, se estima que se requieren entre 8 y 10 GB de VRAM para inferencia en FP16, o menos si se usa cuantización adicional.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como RTX 3060/3070/4060, o GPUs de datacenter como A10G o L4. Para mayor comodidad, una RTX 4090 (24 GB) o A100 (40/80 GB) permiten ejecutar el modelo con margen.
- Sí cabe en GPUs de consumo, siempre que tengan al menos 8 GB de VRAM.
- Opciones de despliegue: se puede usar con la librería `peft` de HuggingFace, cargando el adaptador sobre el modelo base. También es compatible con `transformers` y `vLLM` (si se convierte a un formato unificado), o con `llama.cpp` si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput: no se han publicado mediciones. Dependerá del hardware y de la implementación; en una RTX 4090 se puede esperar una generación de 20-40 tokens por segundo con Gemma 2 9B cuantizado, pero no hay datos específicos para este adaptador.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. Como referencia, se puede comparar con el modelo base Gemma 2 9B it y con otros adaptadores LoRA publicados para el mismo modelo base, pero no hay datos de rendimiento. La siguiente tabla es orientativa y se basa en características conocidas del modelo base:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Gemma 2 9B it (base) | 9B | 8192 | Gemma Terms of Use | Abierto |
| RHAM-CORE-9B (adaptador) | no disponible | no disponible | no disponible | Gated |
| Otros adaptadores LoRA de Gemma 2 | variable | 8192 | variable | variable |

No se puede afirmar que este adaptador supere o iguale al modelo base en ninguna tarea sin datos de evaluación.

## Limitaciones y advertencias

- Falta de documentación: no se proporcionan detalles sobre el entrenamiento, el dataset, los hiperparámetros ni los resultados, lo que dificulta su uso en producción.
- Acceso restringido: el repositorio es gated, por lo que es necesario solicitar acceso y aceptar condiciones, lo que puede limitar su adopción.
- Licencia no especificada: aunque el modelo base Gemma 2 tiene su propia licencia, el adaptador no declara ninguna, lo que genera incertidumbre legal para uso comercial.
- Riesgo de alucinación y sesgos: al ser un fine-tuning sobre Gemma 2, puede heredar los sesgos del modelo base y no se ha evaluado su comportamiento específico.
- Sin garantías de calidad: al no haber benchmarks ni evaluaciones independientes, no se puede asegurar que el adaptador mejore o mantenga el rendimiento del modelo base.
- Posible obsolescencia: la fecha de creación (agosto de 2026) es reciente, pero la falta de mantenimiento o actualizaciones puede hacer que quede desactualizado rápidamente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/NeoMihRam/RHAM-CORE-9B
- Modelo base: https://huggingface.co/unsloth/gemma-2-9b-it-bnb-4bit
- Otros modelos del autor: https://huggingface.co/NeoMihRam/RHAM_ID y https://huggingface.co/NeoMihRam/RHAM_ID_DeepForge_V1_1
- Referencia a la técnica LoRA (paper): https://arxiv.org/abs/1910.09700 (citado en las etiquetas)
