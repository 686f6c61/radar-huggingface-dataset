# PowCal/Llama-3.1-8B-4bit-alpaca-sft-ce

## Resumen

PowCal/Llama-3.1-8B-4bit-alpaca-sft-ce es un checkpoint derivado de Llama 3.1 8B publicado por el usuario PowCal en Hugging Face. Por el nombre del repositorio se deduce que se trata de una versión cuantizada a 4 bits (probablemente mediante bitsandbytes, como en el repositorio base del mismo autor, PowCal/Llama-3.1-8B-4bit) sobre la que se ha aplicado un ajuste supervisado (SFT) con el dataset Alpaca. El sufijo "ce" no está documentado en la información disponible.

El modelo se distribuye en formato safetensors con la librería transformers y un tamaño de repositorio de 0,4 GB, coherente con pesos cuantizados a 4 bits de un modelo de 8 mil millones de parámetros. La model card es la plantilla automática de Hugging Face y no contiene información sustantiva sobre datos de entrenamiento, hiperparámetros, licencia ni evaluación.

Su relevancia es limitada: se trata de un experimento de ajuste fino de bajo perfil, sin descargas ni likes en el momento de la consulta, y sin documentación que permita verificar su calidad. Es útil únicamente como referencia para quien quiera reproducir el pipeline de cuantización más SFT sobre Llama 3.1 8B, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B; no confirmado en la model card) |
| Parametros totales | 8 mil millones (por el nombre del modelo; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.1 8B soporta 128 000 tokens |
| Tipos de cuantizacion | 4 bits (por el nombre del repositorio; el repositorio hermano del autor usa bitsandbytes 4-bit) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B, un transformer decoder-only con atención por grupos (GQA) y RoPE, aunque la model card no lo confirma explícitamente. El nombre del repositorio indica una cuantización a 4 bits seguida de un ajuste supervisado (SFT) con el dataset Alpaca, un conjunto de aproximadamente 52 000 instrucciones en inglés generadas con el método de auto-instrucción de Stanford. El sufijo "ce" del identificador no está explicado en la documentación disponible.

No hay información sobre el número de tokens de entrenamiento, la composición exacta del dataset, hiperparámetros (learning rate, epochs, precisión mixta), ni sobre si se aplicaron técnicas de alineación adicionales como RLHF o DPO. Tampoco se documenta ninguna innovación técnica específica más allá de la combinación de cuantización y SFT. El tag arxiv:1910.09700 que aparece en el repositorio corresponde a la calculadora de impacto ambiental de Lacoste et al., incluida en la plantilla automática, y no a un paper del modelo.

## Capacidades

- Generación de texto e instrucciones en el estilo del dataset Alpaca (respuestas a prompts de tipo "instruction/input/output").
- Razonamiento básico y respuesta a preguntas, limitado por la calidad del SFT con Alpaca.
- Generación de código y matemáticas elementales, sin garantías de rendimiento por falta de evaluación.
- Capacidades multilingües heredadas del modelo base Llama 3.1 (oficialmente 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), aunque el SFT con Alpaca es predominantemente en inglés.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).
- No se documenta capacidad de visión ni audio.

## Casos de uso

- Experimentación con pipelines de cuantización más SFT: sirve como referencia para reproducir el flujo de trabajo de cuantizar Llama 3.1 8B a 4 bits y ajustarlo con Alpaca, comparando resultados con el modelo base.
- Prototipado rápido en hardware de consumo: con 0,4 GB de pesos, se puede cargar en GPUs con poca VRAM para pruebas de generación de instrucciones, aunque la calidad no está garantizada.
- Evaluación comparativa de datasets de instrucciones: útil para estudiar cómo afecta Alpaca al comportamiento de un Llama 3.1 cuantizado frente a otras variantes del mismo autor.
- Docencia y demostraciones de ajuste fino: el tamaño reducido y el formato estándar de transformers facilitan su uso en talleres sobre SFT y cuantización.
- Investigación sobre degradación por cuantización: permite analizar la pérdida de calidad introducida por la cuantización a 4 bits combinada con SFT en tareas de instrucciones.
- No recomendado para producción: la ausencia de licencia, evaluación y documentación desaconseja su uso en aplicaciones reales; para esos casos conviene partir del Llama 3.1 8B Instruct oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-6 GB con pesos de 4 bits (0,4 GB de repositorio más overhead de activaciones y KV cache), aunque no se ha verificado experimentalmente.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs con 8 GB o más, gracias a la cuantización a 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag en el repositorio hermano), y potencialmente vLLM o llama.cpp si se convierten los pesos, aunque no está documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PowCal/Llama-3.1-8B-4bit-alpaca-sft-ce | 8B (por nombre) | no disponible | 4 bits | no disponible | Hugging Face, 0 descargas |
| PowCal/Llama-3.1-8B-4bit | 8B | no disponible | 4 bits (bitsandbytes) | no disponible | Hugging Face, mismo autor |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128 000 tokens | fp16/bf16, cuantizable | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| meta-llama/Llama-3.1-8B | 8B | 128 000 tokens | fp16/bf16, cuantizable | Llama 3.1 Community License | Hugging Face, ampliamente usado |

La comparación se limita a variantes del mismo modelo base porque no se dispone de datos de rendimiento del checkpoint evaluado. Frente al Llama 3.1 8B oficial, este checkpoint ofrece un tamaño mucho menor pero carece de licencia clara, evaluación y soporte; el modelo oficial es la opción recomendada para cualquier uso serio.

## Limitaciones y advertencias

- Model card automática sin información sobre sesgos, riesgos o recomendaciones de uso.
- Riesgo elevado de alucinación y de respuestas de baja calidad por el SFT con Alpaca, un dataset antiguo y limitado.
- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; además, al derivar de Llama 3.1, está sujeto a la Llama 3.1 Community License de Meta, que impone restricciones adicionales.
- La cuantización a 4 bits puede degradar la calidad respecto al modelo en precisión completa, especialmente en tareas de razonamiento y código.
- Idioma: el SFT con Alpaca es casi exclusivamente en inglés; el rendimiento en castellano no está evaluado y probablemente sea inferior al del modelo base.
- Contexto: no se documenta la longitud de contexto efectiva tras la cuantización y el SFT; no se debe asumir los 128 000 tokens del modelo base.
- Sin descargas ni validación comunitaria: no hay evidencia de que el checkpoint funcione correctamente ni de que los pesos estén íntegros.
- No apto para producción sin una evaluación exhaustiva previa y sin aclarar la licencia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/PowCal/Llama-3.1-8B-4bit-alpaca-sft-ce
- Repositorio base del mismo autor: https://huggingface.co/PowCal/Llama-3.1-8B-4bit
- Árbol de ficheros del repositorio base: https://huggingface.co/PowCal/Llama-3.1-8B-4bit/tree/main
- Modelo base oficial: https://huggingface.co/meta-llama/Llama-3.1-8B
- Modelo base instruct oficial: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Calculadora de impacto ambiental citada en la plantilla: https://mlco2.github.io/impact#compute
- Paper de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
