# mjpsm/project-creation-qwen2.5-1.5b-sft-v2

## Resumen

`project-creation-qwen2.5-1.5b-sft-v2` es un ajuste fino por QLoRA del modelo base `Qwen/Qwen2.5-1.5B-Instruct`, desarrollado por el usuario mjpsm. El modelo está especializado en una tarea muy concreta: generar un título de proyecto y una descripción general a partir de una entrada del usuario, con una estructura de párrafos que varía según el nivel educativo del destinatario (cuatro párrafos para K–5, incluyendo padres y cuidadores; tres párrafos para grado 6 en adelante). El entrenamiento se realizó sobre el dataset interno "MyVillage Project Creation V2", compuesto por 1.000 filas (14 golden y 986 nuevas) con particiones de holdout a nivel de concepto en proporción 800/100/100.

El modelo hereda la arquitectura transformer densa de Qwen2.5-1.5B, con 1.543.714.304 parámetros totales y pesos en formato safetensors. Se distribuye como un checkpoint de ajuste fino supervisado (SFT) y no incluye información pública sobre licencia, idiomas soportados ni pipeline de inferencia en la model card. Su relevancia es acotada: se trata de un artefacto de nicho para un producto concreto (MyVillage), no de un modelo de propósito general, y su utilidad fuera de ese contexto es limitada.

La ficha se basa exclusivamente en los metadatos de Hugging Face y en la model card del autor. No hay información publicada sobre benchmarks, licencia, composición detallada del dataset ni evaluación cualitativa, por lo que muchos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), ajuste fino QLoRA sobre Qwen2.5-1.5B-Instruct |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del base Qwen2.5-1.5B-Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repo | 3.1 GB |
| Dataset de entrenamiento | MyVillage Project Creation V2 (1.000 filas: 14 golden + 986 nuevas; splits 800/100/100) |
| Metodo de ajuste | QLoRA (SFT) |
| Fecha de creacion | 2026-11-04 |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only denso de la familia Qwen2.5 con 1.543.714.304 parámetros. Sobre esa base se aplicó un ajuste fino supervisado (SFT) mediante QLoRA, técnica que congela los pesos originales en precisión reducida y entrena adaptadores de bajo rango, lo que reduce el coste de memoria del entrenamiento. La model card no detalla el rango de los adaptadores, el learning rate, el número de épocas ni la configuración de cuantización usada durante el entrenamiento.

El dataset de entrenamiento es el "MyVillage Project Creation V2", con 1.000 filas divididas en 14 ejemplos golden y 986 nuevos, y particiones de holdout a nivel de concepto en proporción 800/100/100 (entrenamiento/validación/test). La tarea es de generación condicionada: producir un título de proyecto y una descripción general con un número de párrafos dependiente del nivel educativo del destinatario (cuatro párrafos para K–5 incluyendo padres y cuidadores; tres párrafos para grado 6 en adelante). No se documenta el uso de RLHF, DPO ni decodificación especulativa. La model card indica explícitamente que debe usarse el mismo system prompt que en el entrenamiento (disponible en el `app.py` del Space asociado), lo que sugiere una fuerte dependencia del formato de prompt.

## Capacidades

- Generación de texto especializada en la creación de proyectos: produce un título y una descripción general estructurada en párrafos.
- Adaptación del registro y la extensión según el nivel educativo: cuatro párrafos para K–5 (incluyendo padres y cuidadores), tres párrafos para grado 6 en adelante.
- Ajuste fino supervisado sobre una tarea concreta, con dependencia del system prompt de entrenamiento.
- Capacidades heredadas del base Qwen2.5-1.5B-Instruct (generación general, razonamiento básico, multilingüismo) potencialmente preservadas, pero no documentadas ni evaluadas en esta ficha.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking en la model card.

## Casos de uso

- Generación de propuestas de proyecto en el producto MyVillage: el modelo recibe la entrada del usuario y devuelve un título y una descripción con el número de párrafos adecuado al nivel educativo, que es exactamente la tarea para la que fue entrenado.
- Asistencia a docentes de primaria: dado un tema y un curso K–5, genera una descripción de proyecto en cuatro párrafos pensada para leerse también con padres y cuidadores.
- Asistencia a docentes de secundaria: para grado 6 en adelante, genera descripciones de tres párrafos con un registro más directo y menor extensión.
- Prototipado rápido de formularios de creación de proyectos: el modelo puede servir como borrador automático en un formulario web, reduciendo el esfuerzo de redacción inicial del usuario.
- Generación de contenido educativo estructurado: útil en pipelines internos donde se necesita un formato de salida fijo (título + descripción por párrafos) y se dispone del system prompt de entrenamiento.
- Experimentación con QLoRA sobre modelos pequeños: el checkpoint sirve como referencia para reproducir el flujo de ajuste fino de Qwen2.5-1.5B en tareas de generación estructurada con datasets pequeños (1.000 filas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, alrededor de 4–6 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 1,6–2 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 0,8–1,2 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 6–8 GB de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4070, RTX 4090); para cuantización 4/8 bits basta con GPUs de 4–6 GB.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas modernas de gama media y alta, y en GPUs integradas con suficiente memoria compartida para cuantizaciones agresivas.
- Opciones de despliegue: transformers con `AutoModelForCausalLM`, vLLM, TGI, llama.cpp u Ollama si se generan pesos GGUF (no publicados en el repo). No se documenta ningún pipeline oficial.
- Latencia y throughput: no disponibles. Al ser un modelo de 1,5B, se espera una latencia baja en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| project-creation-qwen2.5-1.5b-sft-v2 | 1.543.714.304 | No disponible | No disponible | Hugging Face (0 descargas) | Ajuste fino QLoRA de nicho para MyVillage |
| Qwen/Qwen2.5-1.5B-Instruct | 1.543.714.304 | 32.768 tokens (según documentación pública del base) | Apache 2.0 (según documentación pública del base) | Hugging Face | Modelo base generalista; el fine-tune hereda su arquitectura |
| Qwen/Qwen2.5-1.5B | 1.543.714.304 | 32.768 tokens (según documentación pública del base) | Apache 2.0 (según documentación pública del base) | Hugging Face | Variante base sin instrucciones |
| SmolLM2-1.7B-Instruct | ~1.700.000.000 | 8.192 tokens (según documentación pública) | Apache 2.0 (según documentación pública) | Hugging Face | Alternativa pequeña generalista |

La comparación con el modelo base es la más relevante: el fine-tune no cambia el tamaño ni la arquitectura, solo especializa el comportamiento en la tarea de creación de proyectos. Frente a alternativas generalistas del mismo orden de magnitud, este checkpoint pierde flexibilidad y capacidades generales a cambio de un formato de salida muy concreto. No hay datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Al derivar de Qwen2.5-1.5B-Instruct, cuya licencia pública es Apache 2.0, conviene verificar la compatibilidad, pero la model card no lo declara.
- Idiomas no documentados: aunque el base Qwen2.5 es multilingüe, el fine-tune se entrenó presumiblemente en inglés (dataset MyVillage, instrucciones en inglés) y no se garantiza un buen comportamiento en castellano.
- Dependencia estricta del system prompt de entrenamiento: la model card exige usar el mismo system prompt que en el `app.py` del Space; desviarse de ese formato puede degradar gravemente la calidad de salida.
- Dataset de entrenamiento pequeño (1.000 filas): riesgo elevado de sobreajuste al formato y al dominio de MyVillage, con poca generalización fuera de él.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia cuantitativa de calidad, y las 0 descargas y 0 likes indican que no ha sido validado por la comunidad.
- Riesgo de alucinación inherente a modelos de 1,5B en tareas de generación abierta; el ajuste fino no elimina este comportamiento.
- Sin información sobre sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- No se documentan capacidades de tool calling, agentes ni visión; no deben asumirse.
- Formato de pesos solo safetensors: no hay GGUF ni cuantizaciones publicadas, lo que obliga a convertirlas manualmente para despliegue en CPU o GPUs de baja memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mjpsm/project-creation-qwen2.5-1.5b-sft-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Space asociado (referenciado en la model card como `app.py`, sin URL directa disponible): no disponible
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
