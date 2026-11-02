# rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_arc_3407

## Resumen

`rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_arc_3407` es un ajuste fino supervisado (SFT) del modelo `nvidia/Nemotron-Mini-4B-Instruct`, publicado por el usuario rghosh8 en HuggingFace. Se trata de un artefacto de experimentación académica: un checkpoint de referencia ("baseline") entrenado con TRL sobre el conjunto de datos ARC, con semilla 3407, presumiblemente para comparar contra otras variantes de entrenamiento. No es un modelo de producción ni una release oficial de NVIDIA.

El modelo hereda la arquitectura del Nemotron-Mini-4B-Instruct original: un transformer decoder-only de aproximadamente 4.190 millones de parámetros (4,19B), empaquetado en safetensors con un repositorio de 8,4 GB (lo que corresponde a pesos en precisión de 16 bits). El pipeline declarado es `text-generation` y la librería es `transformers`, con compatibilidad con endpoints de inferencia.

Su relevancia es limitada fuera del contexto del experimento concreto para el que fue creado: cero descargas y cero likes en el momento de la consulta, ausencia de licencia declarada y de idiomas especificados. Resulta útil como referencia para reproducibilidad de experimentos de SFT sobre Nemotron-Mini, pero no como modelo recomendado para despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de nvidia/Nemotron-Mini-4B-Instruct; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 4.190.509.056 (4,19B, dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al estar en safetensors es cuantizable con herramientas estandar (GPTQ, AWQ, GGUF) aunque no se documenta |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors (repositorio de 8,4 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `nvidia/Nemotron-Mini-4B-Instruct`, que a su vez es un transformer decoder-only de 4,19B parámetros. La model card no documenta la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención, tokenizador), por lo que esos detalles deben consultarse en la ficha del modelo original de NVIDIA.

El entrenamiento se realizó mediante SFT (supervised fine-tuning) con la librería TRL versión 1.15.0, sobre Transformers 5.17.0, PyTorch 2.13.0+cu129 y Datasets 5.1.0. El nombre del checkpoint (`arc_seed3407`) sugiere que el conjunto de datos de ajuste es ARC (AI2 Reasoning Challenge) y que se fijó la semilla 3407 para reproducibilidad. No se especifican hiperparámetros, número de épocas, tamaño efectivo de batch, composición del dataset ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documenta ninguna innovación técnica adicional más allá del propio proceso de SFT.

## Capacidades

- Generación de texto conversacional en formato chat (la model card incluye un ejemplo con `pipeline` y mensajes con rol `user`).
- Razonamiento sobre preguntas de tipo ARC, dado el dataset de ajuste (no confirmado explícitamente, inferido del nombre del checkpoint).
- Herencia de las capacidades del modelo base Nemotron-Mini-4B-Instruct (no documentadas en esta ficha).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Reproducción de experimentos de SFT: sirve como checkpoint de referencia para comparar contra otras variantes de ajuste sobre el mismo dataset (ARC) y la misma semilla (3407), permitiendo aislar el efecto de cambios en hiperparámetros o datos.
- Investigación sobre sobreajuste en datasets pequeños: al estar ajustado sobre ARC, es útil para estudiar cómo un modelo de 4B se especializa en un dominio concreto y qué degradación sufre en capacidades generales.
- Evaluación de pipelines TRL: el checkpoint permite validar flujos de entrenamiento con TRL 1.15.0 y Transformers 5.17.0 en entornos reproducibles.
- Punto de partida para ajustes posteriores: puede servir como inicialización para experimentos de DPO o RLHF sobre el mismo dominio.
- Docencia y formación: ejemplo práctico de cómo se publica un checkpoint SFT con `generated_from_trainer` y cómo se documenta (o no) en una model card.
- Pruebas de compatibilidad con `transformers.pipeline`: útil para verificar que el pipeline de generación de texto funciona con modelos derivados de Nemotron-Mini en versiones recientes de la librería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8,4 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 12-16 GB de VRAM para contextos moderados.
- VRAM estimada en cuantización 8 bits: en torno a 4-5 GB para pesos.
- VRAM estimada en cuantización 4 bits: en torno a 2,5-3 GB para pesos.
- GPU recomendadas: NVIDIA A100, H100, L40S para despliegue en producción; RTX 4090, RTX 3090, RTX 4080 para experimentación.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en cuantización 4/8 bits; en fp16 requiere 12 GB o más.
- Opciones de despliegue: `transformers` con `device_map="auto"`, vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_arc_3407 | 4,19B | no disponible | no disponible | HuggingFace, 0 descargas |
| nvidia/Nemotron-Mini-4B-Instruct (base) | ~4B | no disponible en esta ficha | no disponible en esta ficha | HuggingFace, modelo oficial de NVIDIA |
| Otros ajustes SFT de Nemotron-Mini-4B | ~4B | no disponible | variable | HuggingFace (no identificados en la información proporcionada) |

La comparación con alternativas de la misma categoría (modelos de ~4B para generación de texto) no puede completarse con datos verificables a partir de la información proporcionada; se indica "no disponible" para los campos no documentados.

## Limitaciones y advertencias

- Licencia no declarada: la model card incluye `licence: license` sin contenido, lo que impide determinar si el uso comercial está permitido. No debe usarse en producción sin aclarar este punto con el autor.
- Idiomas no especificados: se desconoce si el ajuste SFT preserva el multilingüismo del modelo base o lo ha degradado.
- Riesgo de sobreajuste al dataset ARC: al ser un baseline de SFT sobre un conjunto concreto, es probable que el rendimiento fuera de ese dominio sea inferior al del modelo base original.
- Riesgo de alucinación: no evaluado ni documentado; se aplican los riesgos habituales de los modelos de 4B en tareas de conocimiento factual.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento frente al modelo base ni frente a otras variantes.
- Artefacto de investigación: cero descargas y cero likes sugieren que no ha sido validado por la comunidad; no se recomienda su uso en entornos de producción.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin consultar la ficha del modelo base.
- Repositorio de 8,4 GB: requiere espacio en disco y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rghosh8/SFT_baseline_Nemotron-Mini-4B-Instruct_arc_3407
- Modelo base: https://huggingface.co/nvidia/Nemotron-Mini-4B-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de TRL (citado en la model card): von Werra et al., 2020, https://github.com/huggingface/trl
