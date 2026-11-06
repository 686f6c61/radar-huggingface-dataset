# francesca9805/nld-latn-100mb-ppt-mp-struct-bcc-100mb_seed455

## Resumen

El modelo `nld-latn-100mb-ppt-mp-struct-bcc-100mb_seed455` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/nld_latn_100mb`, desarrollado por el usuario de Hugging Face `francesca9805`. Se trata de un modelo de generación de texto de tipo GPT-2 con 124.770.816 parámetros (aproximadamente 125 millones), entrenado mediante SFT (Supervised Fine-Tuning) con la librería TRL de Hugging Face. El nombre del modelo sugiere un experimento académico sobre tokenizadores y estructura de datos (las siglas "ppt-mp-struct-bcc" apuntan a un pipeline de preprocesado concreto), probablemente vinculado a un trabajo de investigación de la Universidad de Groningen, según se desprende del enlace de Weights & Biases incluido en la model card.

El modelo resuelve la tarea de generación de texto condicionada por instrucciones (instruction following) sobre neerlandés, partiendo de un modelo base entrenado específicamente en ese idioma. Su relevancia es limitada fuera del ámbito de la investigación: se trata de un artefacto experimental con muy pocas descargas (27) y sin métricas publicadas, pero resulta útil como ejemplo de pipeline de fine-tuning con TRL sobre modelos pequeños de tipo GPT-2.

La información disponible es escasa: no se especifican licencia, idiomas soportados ni detalles del dataset de entrenamiento más allá de la referencia al modelo base y a la ejecución de W&B. La ficha refleja esa limitación de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base está orientado al neerlandés) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0.5 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `goldfish-models/nld_latn_100mb`: un transformer decoder-only de tipo GPT-2 con unos 125 millones de parámetros, perteneciente a la familia Goldfish de modelos monolingües pequeños entrenados sobre corpus de baja disponibilidad. El ajuste fino se realizó con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1, mediante SFT (Supervised Fine-Tuning) con pares instrucción-respuesta.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset de SFT, ni sobre si se aplicaron técnicas adicionales como RLHF o DPO. El nombre del modelo sugiere un experimento sobre tokenización y estructura de datos (posiblemente "ppt" = preprocesado/tokenizador, "mp" = modelo de prompt, "struct" = estructura, "bcc" = corpus o benchmark), pero la model card no lo detalla. La ejecución de entrenamiento está registrada en Weights & Biases, lo que sugiere un contexto de investigación.

## Capacidades

- Generación de texto autoregresiva en neerlandés (heredada del modelo base).
- Seguimiento de instrucciones conversacionales simples, gracias al ajuste SFT con formato de chat (el ejemplo de la model card usa una lista de mensajes con rol `user`).
- Generación condicionada por prompt con `max_new_tokens` configurable.
- Compatible con `transformers.pipeline("text-generation")` y con Text Generation Inference (tags `text-generation-inference` y `endpoints_compatible`).
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no documentadas; el modelo base está orientado al neerlandés.

## Casos de uso

- Experimentación académica con pipelines de SFT: el modelo sirve como referencia reproducible para estudiar el efecto del ajuste fino sobre un GPT-2 pequeño, con la ejecución de W&B disponible para inspeccionar curvas de entrenamiento.
- Generación de texto en neerlandés para prototipos: útil para generar borradores o completar frases en tareas de baja exigencia donde un modelo de 125M parámetros es suficiente.
- Evaluación de tokenizadores: dado el nombre del experimento, puede emplearse para comparar el impacto de distintas estrategias de tokenización en la calidad de la generación.
- Fine-tuning posterior (continued fine-tuning): al ser un checkpoint pequeño y en safetensors, es adecuado como punto de partida para experimentos de ajuste con recursos limitados.
- Pruebas de integración con TGI y endpoints compatibles: permite validar infraestructura de despliegue de modelos pequeños sin coste elevado.
- Docencia y demostraciones: su tamaño reducido permite ejecutarlo en entornos educativos con GPU de gama baja para ilustrar el ciclo completo de entrenamiento y despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB de pesos, más overhead de activaciones y KV cache (típicamente < 1,5 GB en total).
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB de pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes. También puede ejecutarse en CPU para inferencia puntual.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` (pipeline), Text Generation Inference (TGI), y previsiblemente llama.cpp/Ollama si se convierte a GGUF (no se proporcionan pesos GGUF en el repo).
- Latencia y throughput: no disponibles; por el tamaño del modelo, se espera un throughput alto y latencias de milisegundos en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/nld-latn-100mb-ppt-mp-struct-bcc-100mb_seed455 | 124,8 M | no disponible | no disponible | Hugging Face (27 descargas) |
| goldfish-models/nld_latn_100mb (modelo base) | ~100 M (según nombre) | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face |
| Otros Goldfish monolingües (p. ej. finés, turco) | ~100 M | no disponible | no disponible | Hugging Face |

La comparación con GPT-2 small es la más directa por tamaño, aunque el modelo base Goldfish está entrenado específicamente en neerlandés. No se dispone de datos de rendimiento comparativo para este checkpoint.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Modelo experimental con 27 descargas y sin métricas publicadas; no hay evidencia de calidad más allá de la model card.
- Riesgo elevado de alucinación y de generación incoherente, propio de modelos de 125M parámetros sin alineación adicional documentada.
- Idiomas soportados no documentados; el modelo base está orientado al neerlandés, por lo que el rendimiento en castellano u otros idiomas será presumiblemente pobre.
- Longitud de contexto no documentada; los modelos GPT-2 de esta familia suelen limitarse a 1024 tokens, pero no se confirma.
- Sin información sobre sesgos del dataset de entrenamiento ni sobre filtrado de datos.
- El nombre del modelo sugiere un experimento muy específico de tokenización/estructura; puede no comportarse como un asistente conversacional general.
- No se proporcionan pesos cuantizados (GGUF, AWQ, GPTQ); habría que generarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/nld-latn-100mb-ppt-mp-struct-bcc-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/c5g26ifu
- Repositorio TRL: https://github.com/huggingface/trl
