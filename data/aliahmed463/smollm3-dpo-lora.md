# aliahmed463/smollm3-dpo-lora

## Resumen

`aliahmed463/smollm3-dpo-lora` es un ajuste fino por preferencias del modelo `HuggingFaceTB/SmolLM2-135M-Instruct`, publicado por el usuario aliahmed463 en HuggingFace. A pesar del nombre, el modelo base real es SmolLM2-135M-Instruct, no un mixto de la familia SmolLM3, y el ajuste se ha realizado con DPO (Direct Preference Optimization) empleando la librería TRL. Se trata, por tanto, de un adaptador derivado de un modelo instructivo pequeño (135 millones de parámetros) orientado a alinear las respuestas con preferencias humanas.

El interés de esta ficha es limitado desde el punto de vista de producción: el repositorio no incluye información sobre el dataset de preferencias utilizado, hiperparámetros de entrenamiento, licencia ni idiomas soportados, y no registra descargas ni interacciones. El tamaño del repositorio es de 0.0 GB, lo que sugiere que podría tratarse de un LoRA (como indica el sufijo del nombre) o de un artefacto incompleto, pero este extremo no está confirmado en la model card.

Por su escala (135M parámetros) y su naturaleza experimental, este modelo resulta relevante únicamente como ejemplo didáctico de aplicación de DPO sobre un modelo instructivo pequeño, o como punto de partida para experimentación con alineación de preferencias en entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2-135M-Instruct) |
| Parametros totales | 135 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `HuggingFaceTB/SmolLM2-135M-Instruct`, un transformer decoder-only de 135 millones de parámetros. Sobre esta base se ha aplicado un ajuste fino con DPO, técnica presentada en el paper *Direct Preference Optimization: Your Language Model is Secretly a Reward Model* (Rafailov et al., NeurIPS 2023), que optimiza directamente el modelo de política frente a pares de respuestas preferidas y rechazadas sin necesidad de entrenar un modelo de recompensa separado.

El entrenamiento se ha llevado a cabo con TRL 1.16.0, Transformers 5.21.0, PyTorch 2.6.0+cu124, Datasets 5.1.0 y Tokenizers 0.23.3. No se especifican el dataset de preferencias, el número de pasos, la tasa de aprendizaje, el valor de beta de DPO ni si se congelaron capas (loRA) o se ajustó el modelo completo. La model card no documenta ninguna innovación técnica adicional más allá del propio uso de DPO.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base instructivo.
- Respuestas alineadas con preferencias humanas gracias al ajuste DPO, presumiblemente con mayor concisión y menor tasa de respuestas indeseadas que la base.
- Soporte de plantilla de chat (la model card muestra el uso con `pipeline` y mensajes con rol `user`).
- Razonamiento básico y respuesta a preguntas simples, limitado por el tamaño del modelo base.
- Capacidades multilingües: no documentadas; el modelo base SmolLM2 está entrenado mayoritariamente en inglés.
- Tool calling / function calling: no documentado ni confirmado.
- Modo thinking, visión o audio: no soportados.

## Casos de uso

- Experimentación académica con DPO: servir como ejemplo reproducible de ajuste por preferencias sobre un modelo instructivo pequeño, útil para cursos o tutoriales de alineación.
- Prototipado rápido de chatbots en local: al tratarse de un modelo de 135M parámetros, puede ejecutarse en CPU o GPU de gama baja para validar flujos conversacionales antes de migrar a modelos mayores.
- Generación de texto de bajo coste en entornos embebidos: su reducido tamaño permite desplegarlo en dispositivos con memoria limitada para tareas de generación corta.
- Evaluación comparativa de técnicas de alineación: útil como baseline DPO frente a otros métodos (RLHF, ORPO, KTO) sobre la misma base SmolLM2-135M.
- Filtrado y clasificación de textos simples: puede emplearse para tareas de etiquetado o reformulación de frases cortas donde no se requiera alta precisión.
- Educación y divulgación: permite ilustrar el pipeline completo de Transformers + TRL + DPO en un cuaderno o demo interactiva sin requerir hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0.3 GB para los pesos del modelo base (135M parámetros), más overhead de activaciones y KV cache; en la práctica, menos de 1 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 0.15 GB; en 4 bits, en torno a 0.08 GB (estimaciones teóricas, no verificadas para este adaptador).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada; también funciona en CPU.
- Cabe holgadamente en GPU consumer e incluso en dispositivos de gama baja y en CPU.
- Opciones de despliegue: `transformers` con `pipeline` (documentado en la model card), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se proporcionan pesos en ese formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| aliahmed463/smollm3-dpo-lora | 135M (base) | no disponible | no disponible | HuggingFace, 0 descargas |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | 8.192 tokens (según model card del base) | Apache 2.0 (según model card del base) | HuggingFace, ampliamente utilizado |
| HuggingFaceTB/SmolLM2-360M-Instruct | 360M | 8.192 tokens (según model card del base) | Apache 2.0 (según model card del base) | HuggingFace, ampliamente utilizado |
| Qwen2.5-0.5B-Instruct | 500M | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente utilizado |

## Limitaciones y advertencias

- La model card no especifica la licencia de forma concreta ("licence: license"), por lo que no se puede garantizar el uso comercial sin consultar al autor.
- No se documenta el dataset de preferencias ni el proceso de filtrado, lo que impide evaluar sesgos introducidos por DPO.
- Riesgo elevado de alucinación inherente a un modelo de 135M parámetros, especialmente en tareas de conocimiento factual.
- Capacidad multilingüe no documentada; probablemente limitada al inglés y con calidad reducida en castellano.
- El nombre del repositorio induce a confusión: menciona "smollm3" pero el modelo base es SmolLM2. No debe interpretarse como un modelo de la familia SmolLM3.
- El tamaño del repositorio (0.0 GB) y la ausencia de descargas sugieren que el artefacto podría estar incompleto o no verificado; conviene comprobar la integridad de los pesos antes de usarlo.
- No hay evidencia de evaluación en benchmarks, por lo que no se recomienda su uso en producción sin una validación propia.
- El contexto máximo no está documentado; asumir el del modelo base (8.192 tokens según su model card) es una suposición no confirmada.

## Enlaces

- [HuggingFace: aliahmed463/smollm3-dpo-lora](https://huggingface.co/aliahmed463/smollm3-dpo-lora)
- [Modelo base: HuggingFaceTB/SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
- [Paper DPO (arXiv:2305.18290)](https://huggingface.co/papers/2305.18290)
- [Repositorio TRL](https://github.com/huggingface/trl)
