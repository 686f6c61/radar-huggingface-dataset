# francesca9805/nor-latn-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407

## Resumen

El modelo `nor-latn-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407` es un ajuste fino (SFT) de un modelo base noruego (nor-latn) desarrollado por el usuario `francesca9805`, presumiblemente en el contexto de investigación de la Universidad de Groningen (según el enlace de Weights & Biases). Se trata de un modelo de generación de texto de arquitectura GPT-2 con 39.087.104 parámetros totales, lo que lo sitúa en la categoría de modelos pequeños (aproximadamente 39 millones de parámetros), muy por debajo de los modelos actuales de propósito general.

El modelo ha sido entrenado mediante Supervised Fine-Tuning (SFT) usando la librería TRL (versión 0.23.0), partiendo de un checkpoint intermedio del modelo base `nor-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407`. El nombre sugiere un entrenamiento sobre un corpus de 10 MB de texto en noruego con escritura latina (nor-latn), empaquetado ("packed") y con un checkpoint en el paso 500 y semilla 3407. Es relevante únicamente en el ámbito de la investigación lingüística o de experimentación con modelos pequeños para lenguas de bajos recursos.

No se dispone de información pública sobre la licencia, los idiomas exactos soportados ni los datos de entrenamiento más allá de lo que sugiere el nombre del modelo. La model card es una plantilla autogenerada por TRL sin detalles adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only) |
| Parametros totales | 39.087.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el nombre sugiere noruego, nor-latn) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Framework de entrenamiento | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0 |
| Metodo de entrenamiento | SFT (Supervised Fine-Tuning) |
| Modelo base | francesca9805/nor-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407 |
| Tamano del repositorio | 9,1 GB |
| Descargas | 495 |
| Fecha de creacion | 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura es GPT-2, un transformer decoder-only con atención causal estándar. Con 39 millones de parámetros, se corresponde con la configuración pequeña de GPT-2 (aunque ligeramente por debajo de los 124M de la versión estándar, lo que sugiere una configuración personalizada con menos capas o menor dimensión oculta). No se dispone de información sobre el número de capas, cabezas de atención ni dimensión del embedding.

El entrenamiento se realizó mediante SFT con TRL sobre el modelo base `nor-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407`. El nombre del modelo indica que se partió de un corpus de 10 MB de texto noruego en escritura latina, empaquetado en secuencias, con un checkpoint en el paso 500 y semilla 3407. No se especifica el número total de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. El run de entrenamiento está disponible en Weights & Biases bajo el proyecto `new-tokenizers` del usuario `f-padovani-university-of-groningen`.

## Capacidades

- Generación de texto autoregresiva básica, limitada por el tamaño del modelo (39M de parámetros).
- Entrenado presumiblemente para texto en noruego (nor-latn), aunque no se confirma oficialmente.
- Soporte de chat mediante plantilla de mensajes (`[{"role": "user", "content": ...}]`) según el ejemplo de la model card.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe más allá del posible noruego.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación lingüística sobre modelos pequeños para noruego: el modelo puede utilizarse como baseline para estudiar el comportamiento de modelos de 39M de parámetros entrenados con SFT sobre corpus de 10 MB, comparando con el modelo base sin ajuste.
- Experimentación con tokenizadores: dado el contexto del proyecto de Weights & Biases (`new-tokenizers`), el modelo es adecuado para evaluar el impacto de distintos tokenizadores en la generación de texto noruego.
- Generación de texto de relleno o completado simple en noruego: para tareas de autocompletado muy básicas donde la calidad no sea crítica y el coste computacional sea mínimo.
- Reproducción de experimentos académicos: permite replicar el pipeline de SFT con TRL sobre un corpus pequeño y verificar resultados.
- Enseñanza de pipelines de fine-tuning: sirve como ejemplo didáctico de cómo ajustar un modelo GPT-2 pequeño con TRL y SFT.
- Pruebas de infraestructura de despliegue: por su reducido tamaño, es útil para validar pipelines de despliegue (vLLM, TGI, etc.) antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 156 MB solo para pesos (39M × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 78 MB para pesos.
- Cabe holgadamente en cualquier GPU consumer, incluidas GTX 1050, RTX 3050, RTX 4090, así como en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no requiere A100 ni H100.
- Opciones de despliegue: transformers (pipeline), text-generation-inference (según tags), llama.cpp (previa conversión a GGUF), Ollama (previa conversión), vLLM (compatible con arquitectura GPT-2).
- Latencia y throughput: no disponibles, pero por el tamaño se espera un throughput muy alto y latencia de milisegundos en GPU moderna.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nor-latn-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407 | 39M | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124M | 1024 tokens | MIT | Hugging Face |
| DistilGPT-2 | 82M | 1024 tokens | Apache 2.0 | Hugging Face |
| NorGPT-3B (si existe) | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos para noruego de tamaño similar en la información proporcionada. La comparativa con GPT-2 small y DistilGPT-2 es orientativa por arquitectura y orden de magnitud, no por rendimiento en noruego.

## Limitaciones y advertencias

- Modelo muy pequeño (39M de parámetros): capacidad limitada de razonamiento, coherencia a largo plazo y conocimiento factual.
- Riesgo elevado de alucinación y generación de texto incoherente, especialmente fuera del dominio de entrenamiento.
- No se dispone de información sobre la licencia, lo que impide confirmar si el uso comercial está permitido; se debe contactar con el autor antes de cualquier uso en producción.
- El corpus de entrenamiento es de solo 10 MB, lo que limita severamente la cobertura lingüística y temática.
- No se han documentado los idiomas soportados oficialmente; el nombre sugiere noruego, pero no está confirmado.
- No se ha documentado la longitud de contexto, lo que impide planificar tareas que requieran ventanas largas.
- La model card es una plantilla autogenerada sin información sobre sesgos, datos de entrenamiento ni evaluación.
- No apto para tareas de producción que requieran fiabilidad, precisión factual o cumplimiento normativo.

## Enlaces

- [Hugging Face: francesca9805/nor-latn-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407](https://huggingface.co/francesca9805/nor-latn-10mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407)
- [Modelo base: francesca9805/nor-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407](https://huggingface.co/francesca9805/nor-latn-10mb-ppt-Dp-10mb-packed-bfdiso_seed3407)
- [Run de entrenamiento en Weights & Biases](https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/h220kiyq)
- [Repositorio TRL](https://github.com/huggingface/trl)
