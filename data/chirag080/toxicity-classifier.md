# Chirag080/toxicity-classifier

## Resumen

Chirag080/toxicity-classifier es un ajuste fino (fine-tuning) del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario Chirag080 en Hugging Face. A pesar del nombre, la model card no documenta ninguna tarea de clasificación de toxicidad ni describe el dataset utilizado: se trata de un modelo generativo derivado de un instruct model de 1.500 millones de parámetros, entrenado mediante Supervised Fine-Tuning (SFT) con la librería TRL. El repositorio tiene un tamaño de 0,0 GB según la información disponible, lo que sugiere que los pesos podrían no estar subidos o que el dato no es fiable.

La relevancia de este modelo es limitada: cuenta con cero descargas y cero likes, no declara licencia, idiomas ni pipeline, y su model card es prácticamente una plantilla autogenerada por TRL sin información sobre datos, hiperparámetros ni evaluación. Para un desarrollador o investigador que necesite un clasificador de toxicidad en producción, este checkpoint no ofrece garantías técnicas ni legales.

La ficha se completa a partir de los metadatos disponibles y de las características conocidas del modelo base Qwen2.5-1.5B-Instruct, indicando explícitamente "no disponible" en todos aquellos datos que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.500 millones (modelo base; no confirmado para el fine-tune) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Qwen2.5-1.5B-Instruct soporta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (solo se declaran pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo "licence: license" sin valor real) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros con atención causal estándar y RoPE, orientado a instrucciones. Sobre esa base se ha aplicado un ajuste fino supervisado (SFT) mediante TRL, según los tags `sft`, `trl` y `generated_from_trainer`. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, si hubo etapas de RLHF o DPO, ni los hiperparámetros utilizados (learning rate, batch size, epochs).

Las versiones de framework declaradas son TRL 1.18.0, Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.). El nombre "toxicity-classifier" no se corresponde con la arquitectura ni con el ejemplo de uso de la model card, que es generación de texto libre con `pipeline("text-generation")`.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del instruct base Qwen2.5-1.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones en formato chat (`{"role": "user", "content": ...}`).
- Generación de código y matemáticas a nivel de modelo pequeño (no verificado en este fine-tune).
- Soporte de tool calling: no disponible en la documentación de este checkpoint (el base Qwen2.5 lo soporta, pero no se confirma tras el fine-tune).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas para este checkpoint.
- Modo "thinking", visión o audio: no disponibles.
- Clasificación de toxicidad: el nombre lo sugiere, pero no hay evidencia en la model card, ni ejemplos de etiquetado, ni métricas de clasificación.

## Casos de uso

- Prototipado de chat conversacional: usar el `pipeline` de generación de texto con el formato de mensajes mostrado en la model card para experimentar con un modelo de 1,5B parámetros en local; adecuado solo para pruebas, dado que no hay evaluación publicada.
- Experimentación académica con SFT: servir como ejemplo de fine-tune generado con TRL 1.18.0 y Transformers 5.22.1 para reproducir pipelines de entrenamiento supervisado.
- Base para un clasificador de toxicidad real: el checkpoint podría emplearse como punto de partida para añadir una cabeza de clasificación, pero requeriría validación y datos etiquetados propios, ya que el autor no aporta ninguno.
- Generación de respuestas en asistentes de bajo coste: al tener 1,5B parámetros, puede desplegarse en GPU de consumo para tareas de generación de texto sencillas, siempre que se acepte la ausencia de garantías de calidad.
- Filtrado previo en pipelines de moderación: solo como componente experimental dentro de un sistema mayor con un clasificador dedicado validado; no se recomienda como única capa de moderación.
- Investigación sobre sesgos y alineación: útil para estudiar cómo un SFT sin documentación afecta al comportamiento del modelo base en términos de toxicidad generada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3 GB para los pesos (1,5B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB, más overhead.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 6 GB o más de VRAM en fp16, y en GPUs de 4 GB con cuantización.
- Opciones de despliegue: `transformers` con `device_map="auto"` (único método documentado); vLLM, llama.cpp, Ollama y TGI son compatibles en teoría con el base Qwen2.5, pero no están verificados para este checkpoint y no se han publicado pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Chirag080/toxicity-classifier | 1,5B (base) | no disponible | no disponible | Hugging Face, 0 descargas | Sin benchmarks ni dataset documentado |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 (según el modelo base) | Ampliamente disponible | Modelo oficial con evaluación publicada |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens | Apache 2.0 | Ampliamente disponible | Alternativa más ligera para hardware limitado |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128.000 tokens | Llama 3.2 Community License | Disponible con aceptación de términos | Requiere aceptar licencia en Hugging Face |

## Limitaciones y advertencias

- La model card no documenta el dataset de entrenamiento, por lo que se desconoce qué sesgos puede haber introducido el SFT.
- Riesgo de alucinación inherente a un modelo generativo de 1,5B parámetros; no hay evaluación que lo cuantifique.
- El nombre "toxicity-classifier" no se corresponde con la funcionalidad demostrada (generación de texto); usarlo como clasificador sin validación previa es un riesgo.
- Licencia no especificada: no se puede garantizar el uso comercial. El campo `licence: license` de la model card no es una licencia válida.
- Idiomas soportados no declarados; se asume el comportamiento del base Qwen2.5, pero no está confirmado.
- Longitud de contexto no documentada para este checkpoint.
- Repositorio de 0,0 GB y cero descargas: posible que los pesos no estén subidos o que el modelo no haya sido validado por terceros.
- Sin métricas de toxicidad, precisión, recall ni F1: inadecuado para producción como filtro de moderación sin evaluación adicional.
- Versiones de framework muy recientes (Transformers 5.22.1, PyTorch 2.14.1) que pueden no estar disponibles en todos los entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Chirag080/toxicity-classifier
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de TRL (citado en la model card): von Werra et al., 2020, TRL: Transformers Reinforcement Learning
