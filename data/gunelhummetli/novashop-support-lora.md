# gunelhummetli/novashop-support-lora

## Resumen

novashop-support-lora es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario gunelhummetli en Hugging Face. No se trata de un modelo de lenguaje completo, sino de un conjunto de pesos de ajuste fino que debe cargarse sobre el modelo base unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit, una versión de Meta Llama 3.1 8B Instruct cuantizada a 4 bits mediante la librería Unsloth. El nombre del adaptador sugiere un ajuste orientado a soporte al cliente para un comercio denominado "NovaShop", aunque la model card no documenta explícitamente el dominio ni el dataset de entrenamiento.

El adaptador se ha entrenado con la técnica SFT (Supervised Fine-Tuning) empleando el stack de Unsloth, TRL y Transformers, y se distribuye en formato PEFT con pesos en safetensors. El repositorio ocupa aproximadamente 0,2 GB, un tamaño coherente con un adaptador LoRA de rango bajo sobre un modelo de 8 mil millones de parámetros.

La relevancia de esta ficha es limitada desde el punto de vista técnico: se trata de un artefacto de ajuste fino sin documentación sustantiva, sin resultados de evaluación publicados y con cero descargas en el momento de la consulta. Resulta útil como ejemplo de flujo de trabajo de fine-tuning con Unsloth sobre Llama 3.1, pero no como modelo de referencia para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | No disponible (el adaptador ocupa ~0,2 GB; el modelo base tiene 8,03 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; el modelo base soporta 131.072 tokens |
| Tipos de cuantizacion | Modelo base en bnb-4bit; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible (el modelo base soporta 8 idiomas oficiales: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | No disponible (el modelo base Llama 3.1 usa Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en formato Unsloth bnb-4bit |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA, que congela los pesos del modelo base e introduce matrices de baja dimensionalidad entrenables en determinadas capas lineales. El modelo subyacente es Meta Llama 3.1 8B Instruct, un transformer decoder-only con 32 capas, atención con RoPE, GQA (Grouped Query Attention) y una ventana de contexto nativa de 131.072 tokens. La versión base utilizada está cuantizada a 4 bits con bitsandbytes y empaquetada por Unsloth, lo que reduce el uso de memoria durante el entrenamiento y la inferencia.

El entrenamiento se realizó mediante SFT supervisado con las librerías Unsloth, TRL y Transformers (PEFT 0.21.2). La model card no especifica el número de tokens de entrenamiento, la composición del dataset, el rango de LoRA, el alpha, la tasa de aprendizaje ni si se aplicaron técnicas de alineación adicionales como DPO o RLHF. Tampoco se documenta la composición lingüística ni el origen de los datos de soporte al cliente que sugiere el nombre del adaptador.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Llama 3.1 8B Instruct.
- Ajuste específico (presuntamente) para respuestas de atención al cliente en un contexto de comercio electrónico, según indica el identificador "novashop-support".
- Razonamiento básico y respuesta a instrucciones, con las capacidades del modelo base.
- Generación de código y matemáticas a nivel del modelo base (no reforzadas por el adaptador).
- Soporte de tool calling y function calling heredado de Llama 3.1 Instruct (no verificado en el adaptador).
- Capacidades multilingües limitadas a las del modelo base (8 idiomas oficiales).
- No se documenta soporte de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Prototipado de asistentes de soporte al cliente: el adaptador puede cargarse sobre Llama 3.1 8B para experimentar con respuestas específicas de un dominio comercial, aunque la ausencia de evaluación impide garantizar calidad en producción.
- Investigación sobre fine-tuning con Unsloth: sirve como ejemplo reproducible de un pipeline SFT con PEFT, TRL y cuantización 4-bit para desarrolladores que quieran replicar el flujo.
- Pruebas de concepto de adaptación de dominio: útil para comparar el comportamiento del modelo base frente al ajustado en tareas de atención al usuario.
- Generación de respuestas FAQ: el adaptador podría emplearse para redactar respuestas a preguntas frecuentes de una tienda, siempre con revisión humana y validación previa.
- Base para ajustes posteriores: al ser un adaptador LoRA ligero (0,2 GB), puede combinarse con otros adaptadores o continuar el entrenamiento con datos propios.
- Experimentación académica: útil para estudiar el efecto de LoRA sobre modelos cuantizados a 4 bits en tareas conversacionales de dominio restringido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en sí ocupa ~0,2 GB; el modelo base en bnb-4bit requiere aproximadamente 5-6 GB de VRAM, más overhead de activaciones y contexto.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A10G, L4 o superiores para inferencia cómoda; A100 o H100 para servir a múltiples usuarios con vLLM.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM (RTX 3060 Ti, RTX 3070, RTX 4060 Ti) usando cuantización 4-bit y contextos moderados.
- Opciones de despliegue: Transformers + PEFT para cargar el adaptador sobre el modelo base; vLLM y TGI para servir el modelo fusionado; llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| novashop-support-lora | Adaptador LoRA sobre 8B | No disponible (base 131k) | Adaptador PEFT | No disponible | Hugging Face, 0 descargas |
| Meta Llama 3.1 8B Instruct | 8,03B | 131.072 | Modelo completo | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| Mistral 7B Instruct | 7,24B | 32.768 | Modelo completo | Apache 2.0 | Hugging Face |
| Qwen2.5 7B Instruct | 7,62B | 131.072 | Modelo completo | Apache 2.0 (mayoría de variantes) | Hugging Face |

La comparación directa es limitada: el adaptador no es un modelo autónomo y su rendimiento depende enteramente del modelo base y de la calidad del ajuste, que no está documentada.

## Limitaciones y advertencias

- La model card está prácticamente vacía: no documenta datos de entrenamiento, hiperparámetros, evaluación ni limitaciones.
- No se especifica la licencia del adaptador; el uso comercial queda sujeto a la Llama 3.1 Community License del modelo base y a la interpretación del autor.
- Riesgo elevado de alucinación y respuestas incorrectas en dominio de soporte al cliente sin validación humana.
- Sesgos potenciales heredados del modelo base (Llama 3.1), no evaluados en este adaptador.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.
- El adaptador depende de una versión específica del modelo base (unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit); cargarlo sobre otra variante puede fallar o degradar el rendimiento.
- No se recomienda su uso en producción sin una evaluación exhaustiva previa y sin claridad sobre la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/gunelhummetli/novashop-support-lora
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Llama 3.1 (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Calculadora de impacto ambiental (Lacoste et al., 2019): https://mlco2.github.io/impact
- Paper referenciado en los tags (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
