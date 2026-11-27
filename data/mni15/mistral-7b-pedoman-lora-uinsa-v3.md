# mni15/Mistral-7B-pedoman-lora-uinsa-V3

## Resumen

El modelo `mni15/Mistral-7B-pedoman-lora-uinsa-V3` es un ajuste fino (fine-tuning) de tipo LoRA sobre la versión cuantizada a 4 bits de `unsloth/mistral-7b-instruct-v0.2-bnb-4bit`, que a su vez deriva del Mistral-7B Instruct v0.2 original de Mistral AI. Lo publica el usuario mni15 en Hugging Face y se distribuye bajo licencia Apache 2.0. El nombre sugiere un ajuste orientado a un dominio concreto ("pedoman", posiblemente manual o guía de procedimientos, y "uinsa", probablemente una institución académica), aunque la model card no documenta el dataset ni el objetivo específico del entrenamiento.

Se trata de un modelo de 7 mil millones de parámetros con arquitectura transformer decoder-only, la misma familia que Mistral-7B, con una ventana de contexto de 32 768 tokens en el modelo base original. Al ser un LoRA publicado sobre una base cuantizada en 4 bits, el repositorio ocupa solo 0,2 GB, lo que indica que lo que se distribuye son los pesos del adaptador o una versión muy comprimida, no los pesos completos en precisión alta.

La relevancia de esta ficha es limitada: el modelo no tiene descargas ni likes, no documenta benchmarks, no detalla el proceso de entrenamiento más allá de indicar que se usó Unsloth, y declara únicamente inglés como idioma. Es un ejemplo típico de ajuste fino experimental de bajo perfil, útil para quien quiera reproducir el pipeline con Unsloth o evaluar adaptaciones de Mistral-7B, pero no un modelo con garantías de calidad documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B Instruct v0.2) con ajuste LoRA |
| Parametros totales | 7 000 millones (heredados de Mistral-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32 768 tokens en el modelo base original; no confirmado para este ajuste |
| Tipos de cuantizacion | Base entrenada sobre bnb-4bit; no se documentan otras cuantizaciones publicadas |
| Idiomas soportados | inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,2 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-7B Instruct v0.2: un transformer decoder-only con atención de ventana deslizante (sliding window attention), activaciones SwiGLU, RMSNorm y RoPE, con 32 capas y una dimensión oculta de 4096. Sobre esta base, el autor aplica un ajuste fino con LoRA (Low-Rank Adaptation) empleando la librería Unsloth, que según la model card permite entrenar "2x más rápido". El modelo base del ajuste es la versión ya cuantizada a 4 bits mediante bitsandbytes (`unsloth/mistral-7b-instruct-v0.2-bnb-4bit`), lo que implica que el entrenamiento se realizó sobre pesos comprimidos.

No se documenta el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF, DPO o instrucciones supervisadas, ni los hiperparámetros del LoRA (rango, alpha, módulos objetivo). Tampoco se especifica el objetivo del ajuste más allá del nombre del repositorio. La información disponible sobre el proceso de entrenamiento es, por tanto, mínima y no permite reproducir el experimento con precisión.

## Capacidades

- Generación de texto e instrucciones: hereda la capacidad de seguir instrucciones del modelo base Mistral-7B Instruct v0.2.
- Razonamiento y respuesta a preguntas: capacidades generales de un modelo de 7B de la familia Mistral, sin evaluación específica publicada para este ajuste.
- Generación de código: el modelo base tiene competencia básica en programación, pero no hay datos que confirmen el rendimiento tras el ajuste.
- Soporte multilingüe: limitado, ya que la model card declara únicamente inglés; el modelo base original tenía capacidades multilingües parciales, pero este ajuste no las documenta.
- Tool calling / function calling: no documentado en la model card; el modelo base v0.2 no incluía soporte nativo de tool calling.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación con pipelines de ajuste fino: el modelo sirve como referencia para reproducir un flujo de trabajo con Unsloth y LoRA sobre Mistral-7B cuantizado, útil en entornos con recursos limitados.
- Prototipado de asistentes de dominio específico: si el ajuste "pedoman" está orientado a un manual o procedimiento concreto, podría emplearse como base para un asistente interno, siempre que se valide su calidad antes de producción.
- Investigación académica sobre adaptaciones de bajo rango: permite estudiar el efecto de LoRA sobre una base cuantizada a 4 bits en tareas de instrucción.
- Evaluación comparativa de ajustes comunitarios: útil como punto de comparación frente a otros LoRA publicados sobre Mistral-7B Instruct v0.2.
- Generación de texto en inglés en entornos de bajo presupuesto: al derivar de una base 4-bit, puede desplegarse en GPUs de consumo con cuantización adicional, aunque la calidad no está garantizada.
- Docencia y demostraciones: adecuado para mostrar el ciclo completo de publicación de un modelo ajustado en Hugging Face, incluida la model card y los metadatos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al derivar de una base cuantizada a 4 bits, los pesos completos en 4 bits ocupan aproximadamente 4-5 GB; en FP16 serían unos 14 GB. El repositorio de 0,2 GB sugiere que solo se publican los adaptadores LoRA, por lo que para inferencia habría que cargar la base y aplicar el adaptador.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) es suficiente para inferencia en FP16; una RTX 3060 de 12 GB o superior puede bastar con cuantización 4-bit.
- Cabe en GPU de consumo: sí, en GPUs con al menos 8-12 GB de VRAM si se usa cuantización 4-bit.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), y potencialmente llama.cpp u Ollama si se convierte a GGUF, aunque no se documenta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mni15/Mistral-7B-pedoman-lora-uinsa-V3 | 7B | 32 768 (base) | Apache 2.0 | Hugging Face, 0 descargas | Ajuste LoRA sin benchmarks |
| mistralai/Mistral-7B-Instruct-v0.2 | 7B | 32 768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base original, con evaluación pública |
| unsloth/mistral-7b-instruct-v0.2-bnb-4bit | 7B | 32 768 | Apache 2.0 | Hugging Face | Base cuantizada 4-bit empleada para el ajuste |
| Meta-Llama-3-8B-Instruct | 8B | 8 192 | Llama 3 Community License | Hugging Face | Alternativa de tamaño similar con contexto menor |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar de Mistral-7B Instruct v0.2, puede reproducir sesgos presentes en los datos de entrenamiento originales, pero no hay análisis específico.
- Riesgo de alucinación: no evaluado para este ajuste; un modelo de 7B sin benchmarks publicados presenta riesgo de alucinación sin cuantificar.
- Limitaciones de contexto o idioma: la model card declara únicamente inglés; no se confirma que el ajuste mantenga la ventana de 32 768 tokens del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el origen de los datos de ajuste ni sobre posibles obligaciones adicionales derivadas del dataset no documentado.
- Caveats para producción: ausencia total de benchmarks, de documentación del dataset y de evaluación de calidad; cero descargas y cero likes indican que el modelo no ha sido validado por la comunidad. No se recomienda su uso en producción sin una evaluación propia exhaustiva.
- El repositorio de 0,2 GB sugiere que solo contiene los adaptadores LoRA, no los pesos completos; es necesario cargar la base por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mni15/Mistral-7B-pedoman-lora-uinsa-V3
- Modelo base del ajuste: https://huggingface.co/unsloth/mistral-7b-instruct-v0.2-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Modelo original Mistral-7B Instruct v0.2: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
