# mrs83/Kurtis-EON1-Hybrid-2B-v0.1.2

## Resumen

Kurtis-EON1-Hybrid-2B-v0.1.2 es un modelo de lenguaje experimental de 2.000 millones de parámetros desarrollado por ethicalabs.ai dentro de la familia Echo-DSRN. Combina un backbone transformer basado en Qwen2 con un mecanismo recurrente denominado DSRN (Dynamic Surprise Recurrent Network), dando lugar a una arquitectura híbrida en la que se inyectan bloques recurrentes entre capas de atención. Está afinado específicamente para generar respuestas empáticas y atmosféricas, con un tono contemplativo y una adherencia estricta a la persona, pensado para entornos de investigación académica.

El modelo se publica bajo licencia Apache 2.0 y se distribuye en formato safetensors y ONNX, con soporte para transformers y text-generation-inference. Su relevancia radica en ser una propuesta abierta para estudiar la hibridación de arquitecturas transformer y recurrentes, con un coste adicional de parámetros de solo el 12,55 % respecto a la base. No obstante, el autor advierte explícitamente que no debe desplegarse en entornos de producción, ya que se trata de un prototipo de investigación con limitaciones importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Echo-DSRN-Hybrid (transformer base Qwen2 + 9 inyectores DSRN recurrentes) |
| Parametros totales | 2.000.186.624 (2,00B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (la version 0.7B de la misma familia indica 32K, pero no se confirma para esta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de Qwen2 como base y le incorpora un componente recurrente denominado DSRN (Dynamic Surprise Recurrent Network). La arquitectura resultante tiene 28 capas de atención con dimensión oculta de 1536 y 9 inyectores DSRN intercalados cada 3 capas. Cada inyector aporta 223,10 millones de parámetros en total, de los cuales 8,26 millones corresponden a compuertas de memoria (memory gates) y 2,36 millones al mecanismo de sorpresa (surprise mechanism) que regula el foco dinámico. El sobrecoste en parámetros respecto a la base es de un 12,55 %, con una proporción de un bloque DSRN por cada tres capas de atención.

No se han publicado detalles sobre el dataset de entrenamiento, la cantidad de tokens procesados ni el uso de técnicas como RLHF o DPO. La model card indica que el modelo fue afinado sobre datasets "altamente curados" de carácter empático y atmosférico, pero no proporciona más información. El repositorio asociado (Echo-DSRN en GitHub) contiene un working paper con el diseño de la arquitectura, aunque no se ha accedido a su contenido.

## Capacidades

- Generación de texto conversacional con tono empático y contemplativo, orientado a entornos de interacción atmosférica y gótica.
- Adherencia estricta a un personaje o persona definida, con bajo deriva en conversaciones multi-turno.
- Razonamiento multi-turno con cero drift (sin desviación del tema), según la descripción del autor.
- No se documenta soporte para tool calling, function calling, agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües no declaradas; el idioma por defecto parece ser inglés, sin confirmación de otros idiomas.
- No hay indicios de soporte de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Investigación académica sobre arquitecturas híbridas: el modelo es útil para estudiar el comportamiento de la inyección de componentes recurrentes en transformers, comparando su rendimiento en benchmarks estándar con modelos puramente transformer del mismo tamaño.
- Evaluación de técnicas de afinación para control de estilo: dado su énfasis en el tono empático y la adherencia a persona, sirve como banco de pruebas para técnicas de fine-tuning orientadas a mantener una voz consistente en diálogos largos.
- Experimentación en entornos de investigación con datasets de conversación atmosférica o narrativa, donde la capacidad de mantener un registro estilístico es más relevante que la exactitud factual.
- Análisis de la eficiencia paramétrica de componentes recurrentes: permite medir el impacto en rendimiento de añadir un 12,55 % de parámetros recurrentes sobre una base transformer de 2B.
- Docencia e investigación en NLP: el modelo es útil para demostrar conceptos de arquitectura híbrida, mecanismos de memoria y de atención en cursos de postgrado o laboratorios.
- Prototipado de asistentes conversacionales con un tono específico en entornos no productivos, como demos internas o proyectos de código abierto académicos.

## Benchmarks y rendimiento

La model card incluye resultados de evaluaciones con lm-evaluation-harness (lm_eval) para seis tareas. Los datos son los siguientes:

| Tarea | Metrica | Valor | Error estandar |
|---|---|---|---|
| arc_challenge | acc | 0,4002 | ±0,0143 |
| arc_challenge | acc_norm | 0,4249 | ±0,0144 |
| gsm8k (5-shot) | exact_match (flexible) | 0,5739 | ±0,0136 |
| gsm8k (5-shot) | exact_match (strict) | 0,5732 | ±0,0136 |
| hellaswag | acc | 0,4865 | ±0,0050 |
| hellaswag | acc_norm | 0,6512 | ±0,0048 |
| piqa | acc | 0,7508 | ±0,0101 |
| piqa | acc_norm | 0,7573 | ±0,0100 |
| sciq | acc | 0,9510 | ±0,0068 |
| sciq | acc_norm | 0,9420 | ±0,0074 |
| truthfulqa_gen | bleu_acc | 0,4002 | ±0,0172 |
| truthfulqa_gen | rouge1_acc | 0,3721 | ±0,0169 |
| truthfulqa_gen | rouge2_acc | 0,3293 | ±0,0165 |
| truthfulqa_gen | rougeL_acc | 0,3905 | ±0,0171 |
| truthfulqa_mc1 | acc | 0,2803 | ±0,0157 |
| truthfulqa_mc2 | acc | 0,4372 | ±0,0146 |

No se comparan estos valores con otros modelos en la model card. Los resultados de truthfulqa sugieren un riesgo significativo de alucinación (bleu_acc bajo), coherente con su propósito de generación atmosférica más que factual.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 2,00B parámetros. En FP16 (2 bytes por parámetro) se requieren aproximadamente 4 GB de VRAM solo para los pesos, más overhead de activaciones y contexto. Con cuantización de 8 bits se reduce a unos 2,5 GB, y en 4 bits a 1,5 GB.
- GPU recomendadas: una RTX 3060 de 12 GB o superior es suficiente para inferencia en FP16. Para cuantización 4-bit, una GPU con 4 GB puede ser suficiente.
- El modelo cabe en GPUs consumer, incluidas las gamas media y baja con al menos 8 GB de VRAM.
- Opciones de despliegue: es compatible con transformers (pipeline de text-generation) y text-generation-inference. No se indica soporte para vLLM, llama.cpp u Ollama, aunque al ser un modelo de la familia transformers, podría adaptarse con herramientas compatibles, pero no está confirmado.
- Latencia y throughput: no disponible. Dada la presencia de componentes recurrentes (DSRN), la inferencia puede ser secuencial en esas capas, lo que puede reducir el throughput comparado con una transformer pura del mismo tamaño, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La única referencia es que la base es Qwen2, pero no se especifica la variante concreta (Qwen2-1.5B o Qwen2-2B). Sin datos de benchmarks de modelos alternativos, no es posible realizar una comparativa rigurosa. Se recomienda comparar con Qwen2-1.5B o Qwen2-2B estándar en las mismas tareas para evaluar el impacto del componente DSRN, pero no se dispone de esos resultados en la información disponible.

## Limitaciones y advertencias

- Modelo experimental y de investigación: el propio autor prohíbe explícitamente su despliegue en entornos comerciales, empresariales o de misión crítica. Cualquier uso en producción es bajo total responsabilidad del usuario y sin garantías.
- Riesgo de alucinación: los resultados de truthfulqa (mc1: 0,28, mc2: 0,44) indican una tendencia a generar información no fiable, coherente con el diseño orientado a tono más que a exactitud.
- Idiomas y contexto: no se declaran idiomas soportados ni la longitud de contexto exacta, lo que dificulta su uso en aplicaciones multilingües o de contexto largo.
- Sin soporte de herramientas ni agentes: no se documentan capacidades de tool calling, lo que limita su integración en pipelines de automatización o agentes.
- Sesgos: no se documentan sesgos específicos, pero al estar afinado sobre datasets empáticos y atmosféricos, el modelo puede reflejar un estilo de lenguaje particular y no ser adecuado para tareas neutrales o técnicas.
- Licencia: Apache 2.0 permite uso comercial, pero la advertencia del autor de no desplegarlo en producción prevalece éticamente sobre la licencia.

## Enlaces

- HuggingFace: https://huggingface.co/mrs83/Kurtis-EON1-Hybrid-2B-v0.1.2
- Repositorio GitHub del proyecto: https://github.com/ethicalabs-ai/Echo-DSRN/
- Working paper del proyecto: https://github.com/ethicalabs-ai/Echo-DSRN/blob/main/PAPER.md
- Colección de modelos Echo-DSRN en HuggingFace: https://huggingface.co/collections/ethicalabs/echo-dsrn
- Colección de modelos Hybrid en HuggingFace: https://huggingface.co/collections/ethicalabs/echo-dsrn-hybrid
- Visualización de la arquitectura (hfviewer): https://hfviewer.com/mrs83/Kurtis-EON1-Hybrid-2B-v0.1.2
