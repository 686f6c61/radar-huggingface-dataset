# arrochi112/onebee-gf-sft-v1

## Resumen

onebee-gf-sft-v1 es un adaptador LoRA de ajuste fino supervisado (SFT) desarrollado por arrochi112 sobre el modelo base google/gemma-4-E2B-it, un modelo multimodal de lenguaje y visión de la familia Gemma 4 con aproximadamente 2-4 mil millones de parámetros. El checkpoint forma parte del proyecto open-source small-mind-companion, que investiga cuánta capacidad aparente puede recuperar un modelo pequeño mediante post-entrenamiento, memoria externa y recuperación, en lugar de depender de una mayor escala de parámetros.

El adaptador se entrenó con 2232 ejemplos distribuidos en 40 personas (personajes), con el objetivo de especializar el modelo en tareas de acompañamiento conversacional. Según la model card, es el "mejor SFT actual" del proyecto, aunque el propio autor advierte que los resultados deben interpretarse con cautela y que el proyecto reporta tanto resultados positivos como negativos o inconclusos de forma honesta.

La relevancia de este modelo radica en su enfoque experimental: demuestra que es posible adaptar un modelo pequeño con capacidades multimodales mediante técnicas de ajuste eficiente (LoRA), abriendo la puerta a despliegues en hardware limitado. Sin embargo, al ser un adaptador sobre un modelo base de tamaño reducido, sus capacidades generales están limitadas por las del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre google/gemma-4-E2B-it (modelo base multimodal) |
| Parametros totales | 5.104.297.539 (según safetensors) |
| Parametros activos | No disponible (adaptador LoRA; los parámetros del adaptador no se especifican) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; existen cuantizaciones GGUF en otro checkpoint del proyecto: onebee-gf-dpo-v1-scale-gguf) |
| Idiomas soportados | No disponibles |
| Licencia | Gemma (heredada del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre google/gemma-4-E2B-it, un modelo base de la familia Gemma 4 con capacidades multimodales (texto e imagen). El nombre "E2B" sugiere una variante de tamaño reducido (aproximadamente 2 mil millones de parámetros), aunque el fabricante no ha publicado especificaciones detalladas en la información disponible.

El entrenamiento consistió en un ajuste fino supervisado (SFT) con 2232 ejemplos repartidos en 40 personas, orientado a tareas de acompañamiento conversacional. No se especifican los hiperparámetros del LoRA (rango, alpha, capas objetivo), ni la composición del dataset más allá del número de ejemplos y personas. Tampoco se indica si se utilizaron técnicas adicionales como RLHF o DPO en este checkpoint concreto (aunque el proyecto tiene checkpoints DPO separados).

El proyecto small-mind-companion documenta en su repositorio GitHub problemas reales encontrados y corregidos durante el desarrollo, lo que sugiere un enfoque riguroso de ingeniería, pero no se aportan detalles técnicos adicionales sobre la arquitectura o el entrenamiento en la model card.

## Capacidades

- Generacion de texto conversacional: especializado en diálogo de acompañamiento, con 40 personas distintas.
- Multimodalidad: hereda las capacidades de visión del modelo base google/gemma-4-E2B-it, lo que permite procesar imágenes junto con texto.
- Ajuste eficiente: al ser un adaptador LoRA, se puede combinar con el modelo base y otros adaptadores sin necesidad de reentrenar el modelo completo.
- Razonamiento básico: las capacidades de razonamiento, código y matemáticas dependen del modelo base, que al ser de tamaño reducido (~2-4B) tendrá limitaciones en tareas complejas.
- No se documentan capacidades específicas de tool calling, agentes o pensamiento extendido en la información proporcionada.

## Casos de uso

- Chatbots de acompañamiento emocional: el modelo está diseñado para conversaciones de apoyo y compañía, pudiendo adoptar 40 personas distintas. Se podría desplegar en aplicaciones de bienestar mental o entretenimiento interactivo.
- Asistentes virtuales con personalidad: gracias al ajuste por personas, se puede crear un asistente con un tono y estilo definidos, integrable en aplicaciones de mensajería o web.
- Prototipado de agentes conversacionales: al ser un LoRA ligero, permite experimentar rápidamente con diferentes personalidades sin necesidad de entrenar modelos completos, ideal para investigación en interacción humano-máquina.
- Aplicaciones educativas de rol: el modelo puede simular personajes históricos o ficticios para prácticas de idiomas o simulación de entrevistas, aprovechando su capacidad multimodal para mostrar imágenes contextuales.
- Demostraciones de ajuste eficiente: sirve como caso de estudio para desarrolladores que quieran aprender a aplicar LoRA sobre modelos multimodales pequeños, con documentación del proyecto en GitHub.
- Despliegue en entornos con recursos limitados: al basarse en un modelo de ~2-4B con un adaptador LoRA, puede ejecutarse en GPUs de consumo medio, permitiendo chatbots locales sin conexión a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El proyecto reporta resultados y limitaciones en su documentación de GitHub (`docs/proper_scale_results.md`), pero no se han extraído datos numéricos para esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 5.104.297.539 parámetros totales (incluyendo el adaptador fusionado), se estima que en FP16 se necesitan aproximadamente 10-11 GB de VRAM solo para los pesos, más overhead de activaciones. Con cuantización INT8 podría reducirse a ~5-6 GB, y con INT4 a ~3-4 GB.
- GPU recomendadas: una RTX 3090 o RTX 4090 (24 GB) sería suficiente para FP16; GPUs con 8-12 GB (como RTX 3070/3080 o RTX 4060 Ti) podrían funcionar con cuantización. Para producción, una A10G o A100 también sería viable.
- Si cabe en consumer GPU: sí, en GPUs de gama media-alta con cuantización, o en gama alta sin cuantizar.
- Opciones de despliegue: al ser un adaptador LoRA, se puede cargar con transformers de HuggingFace y servir con vLLM o TGI si se fusiona con el modelo base. También es posible exportar a GGUF para usar con llama.cpp u Ollama (aunque las cuantizaciones GGUF están disponibles en otro checkpoint del proyecto, no en este).
- Latencia y throughput estimados: no disponibles. Dependerán del hardware y la cuantización elegidos.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la información proporcionada. Sin embargo, se puede comparar con otros checkpoints del mismo proyecto:

| Checkpoint | Descripcion | Estado |
|---|---|---|
| onebee-gf-sft-v0 | SFT del día 4, versión inicial | Superado por v1 |
| onebee-gf-sft-v1 (este) | SFT a escala adecuada, mejor SFT | Actual |
| onebee-gf-dpo-v0 | DPO de la semana 2 | Superado |
| onebee-gf-dpo-v1-4epoch | Experimento de sobreajuste DPO | Experimental |
| onebee-gf-dpo-v1-scale | DPO a escala adecuada, mejor checkpoint global | Superior al SFT v1 según el autor |

En cuanto a modelos externos, no hay datos suficientes para comparar con Gemma 4 oficial u otros modelos pequeños multimodales como Phi-3.5-vision o LLaVA, ya que no se han publicado benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con solo 2232 ejemplos y 40 personas, el modelo puede presentar sesgos derivados del dataset, que no está documentado en detalle. No se han realizado evaluaciones de sesgo.
- Riesgo de alucinacion: como modelo pequeño, es propenso a alucinar hechos y detalles, especialmente en tareas que requieren conocimiento factual amplio.
- Limitaciones de contexto e idioma: no se especifica la longitud de contexto soportada ni los idiomas; el modelo base Gemma suele soportar múltiples idiomas, pero el ajuste con ejemplos en un idioma concreto (probablemente inglés) puede degradar el rendimiento en otros.
- Restricciones de licencia: la licencia Gemma impone condiciones de uso, incluyendo restricciones para ciertos casos de uso y la obligación de mantener atribución. No se permite el uso comercial sin cumplir los términos de la licencia de Google.
- Advertencia para producción: el modelo es un checkpoint de investigación, no un producto pulido. El propio autor advierte que los resultados deben interpretarse con cautela y que hay limitaciones documentadas en el repositorio del proyecto. No se recomienda su uso en producción sin una evaluación exhaustiva.

## Enlaces

- [HuggingFace - onebee-gf-sft-v1](https://huggingface.co/arrochi112/onebee-gf-sft-v1)
- [Repositorio GitHub del proyecto small-mind-companion](https://github.com/arrogance231/small-mind-companion)
- [Documentación de resultados y limitaciones](https://github.com/arrogance231/small-mind-companion/blob/main/docs/proper_scale_results.md)
- [Otros checkpoints del proyecto en HuggingFace](https://huggingface.co/arrochi112) (incluye onebee-gf-sft-v0, onebee-gf-dpo-v0, onebee-gf-dpo-v1-4epoch, onebee-gf-dpo-v1-scale, onebee-gf-dpo-v1-scale-gguf)
