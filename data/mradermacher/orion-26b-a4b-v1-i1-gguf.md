# mradermacher/Orion-26B-A4B-v1-i1-GGUF

## Resumen

Orion-26B-A4B-v1-i1-GGUF es una colección de cuantizaciones GGUF del modelo Orion-26B-A4B-v1, preparadas por mradermacher, un equipo conocido por distribuir pesos cuantizados de modelos open source. El modelo base, Orion-26B-A4B-v1, es un modelo de arquitectura MoE (Mixture of Experts) con 25.2 mil millones de parámetros totales y 4 mil millones de parámetros activos, desarrollado por TheDrummer. Esta versión en GGUF permite su ejecución en hardware de consumo mediante herramientas como llama.cpp u Ollama.

La relevancia de este lanzamiento radica en la accesibilidad: un modelo de 26B con solo 4B activos ofrece un rendimiento cercano a modelos mucho más grandes con requisitos de hardware significativamente menores. Las cuantizaciones incluyen formatos desde IQ1_S hasta Q6_K, lo que permite ajustar la calidad y el uso de VRAM según las capacidades del hardware disponible. El repositorio incluye cuantizaciones con imatrix, una técnica que mejora la calidad de la cuantización al ponderar la importancia de los tensores.

La información disponible en la model card es extremadamente limitada: no se especifican la licencia, los idiomas soportados, la longitud de contexto ni los datos de entrenamiento. Esta ficha se basa únicamente en los datos técnicos del repositorio y en la información pública del modelo base, que tampoco es extensa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), no disponible detalle del backbone |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | 4B (inferido del nombre A4B, no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones de safetensors originales) |

## Arquitectura y entrenamiento

La arquitectura es MoE (Mixture of Experts), lo que implica que aunque el modelo tiene 25,2B parámetros totales, solo activa 4B por token procesado. Esto reduce drásticamente el coste computacional por inferencia en comparación con un modelo denso del mismo tamaño. El nombre "A4B" sugiere 4 mil millones de parámetros activos, aunque no se ha confirmado el número exacto de expertos ni la estrategia de enrutamiento.

No se dispone de información sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se utilizaron técnicas como RLHF o DPO. Tampoco se conocen innovaciones técnicas específicas del modelo base. El repositorio de cuantizaciones indica que se usó la técnica imatrix para mejorar la calidad de las cuantizaciones de menor bitrate, y que los pesos fueron convertidos desde el formato HuggingFace original.

## Capacidades

- Generación de texto: capacidad inherente a la arquitectura transformer, aunque sin datos específicos de calidad.
- Razonamiento: no hay benchmarks publicados que permitan evaluar esta capacidad.
- Código: no hay información sobre entrenamiento específico en código.
- Matemáticas: no hay información disponible.
- Tool calling / function calling: no disponible.
- Soporte para agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Inferencia local en hardware de consumo: gracias a las cuantizaciones GGUF y a los 4B parámetros activos, el modelo puede ejecutarse en GPUs de gama media como una RTX 3060 o RTX 4060 con 8-12 GB de VRAM usando las cuantizaciones más agresivas (IQ1_S, IQ2_XS). Es adecuado para experimentación y prototipado sin depender de APIs externas.
- Despliegue en entornos con restricciones de memoria: la combinación de MoE y cuantización permite servir un modelo de 25B con requisitos de VRAM similares a un modelo denso de 7B, lo que lo hace viable en entornos edge o con GPUs compartidas.
- Desarrollo de chatbots conversacionales: el tag "conversational" en HuggingFace sugiere que el modelo base fue ajustado para diálogo, aunque no hay datos que lo confirmen. Podría usarse para construir asistentes locales con herramientas como Ollama o llama.cpp.
- Evaluación de técnicas de cuantización: el repositorio incluye 24 variantes de cuantización, lo que lo convierte en un banco de pruebas ideal para comparar el impacto de diferentes bitrates (IQ vs K-quants) en la calidad de salida.
- Fine-tuning eficiente con LoRA/QLoRA: al ser un MoE con pocos parámetros activos, el fine-tuning con adaptadores de bajo rango podría ser viable en hardware de consumo, aunque no hay documentación que lo respalde.
- Investigación académica sobre MoE: el modelo puede servir como caso de estudio para analizar el comportamiento de arquitecturas MoE de tamaño medio en tareas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o sus cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Con Q4_K_M (aproximadamente 14-15 GB de pesos) se necesitan al menos 16 GB de VRAM. Con cuantizaciones IQ2_XS o IQ1_S (aproximadamente 8-10 GB) podría caber en GPUs de 12 GB. Con Q6_K (aproximadamente 20 GB) se necesitan 24 GB o más.
- GPU recomendadas: RTX 3090/4090 (24 GB) para las cuantizaciones medias; RTX 3060/4060 (12 GB) para las cuantizaciones más agresivas; A100 o H100 para las cuantizaciones altas sin offloading.
- Compatibilidad con GPU de consumo: sí, las cuantizaciones IQ1_S, IQ2_XS, IQ2_S e IQ3_XXS están diseñadas para caber en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF limitado), TGI (con convertidor de GGUF).
- Latencia y throughput: no disponible. Como referencia, un MoE con 4B activos en Q4_K_M en una RTX 4090 podría generar entre 30-60 tokens/s, pero es una estimación sin datos reales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo comparte características con otros MoE de tamaño similar como Mixtral-8x7B (46,7B totales, 12,9B activos) o Qwen2-57B-A14B (57B totales, 14B activos), pero sin datos de rendimiento no es posible comparar. La licencia desconocida es una desventaja frente a alternativas con licencias permisivas como Apache 2.0.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible, pero al ser un modelo sin documentación de entrenamiento, se desconocen los sesgos potenciales.
- Riesgo de alucinación: no evaluado. Se recomienda validar las salidas en aplicaciones de producción.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Restricciones de licencia: la licencia es "no disponible", lo que impide su uso comercial sin riesgo legal. No se debe asumir que es de código abierto.
- Caveat para producción: la falta de documentación, benchmarks y licencia clara hace que este modelo no sea recomendable para entornos de producción sin una evaluación exhaustiva previa.
- Origen de los pesos: el repositorio es una cuantización de un modelo de TheDrummer, que a su vez podría ser un fine-tuning o merge de otro modelo base. La trazabilidad es incompleta.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Orion-26B-A4B-v1-i1-GGUF
- Modelo base (TheDrummer): https://huggingface.co/TheDrummer/Orion-26B-A4B-v1
- Perfil de mradermacher: https://huggingface.co/mradermacher
- Página de solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Página de descarga de cuantizaciones: https://hf.tst.eu/model
