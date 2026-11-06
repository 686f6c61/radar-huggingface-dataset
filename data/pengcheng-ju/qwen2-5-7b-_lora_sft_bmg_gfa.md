# Pengcheng-Ju/Qwen2.5-7B-_lora_sft_BMG_GFA

## Resumen

Qwen2.5-7B-_lora_sft_BMG_GFA es un ajuste fino mediante LoRA del modelo Qwen2.5-7B-Instruct, desarrollado por Pengcheng-Ju, especializado en el diseño de vidrios metálicos masivos (bulk metallic glasses, BMG) basados en aluminio con alta capacidad de formación de vidrio (glass-forming ability, GFA). El modelo parte de la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales, y se distribuye en formato safetensors con licencia MIT.

El problema que aborda es la limitada capacidad de formación de vidrio de las aleaciones de aluminio, cuyos diámetros críticos de colada suelen estar restringidos a Φ2,5 mm o menos, lo que dificulta su adopción industrial en componentes estructurales ligeros. Para ello, los autores construyeron un conjunto de datos específico de dominio con 636 composiciones de BMG basadas en aluminio validadas experimentalmente y métricas de GFA extraídas de 503 publicaciones revisadas por pares, a partir del cual generaron 32.443 pares estructurados de pregunta-respuesta.

El ajuste fino con LoRA sobre Qwen2.5-7B-Instruct permite al modelo realizar regresión cuantitativa de GFA con un R² de 0,938, superando según los autores a asistentes académicos generales como Bohr Academic AI y Qinyan Academic AI, a Claude 3 y al propio Qwen2.5-7B-Instruct sin modificar. Guiado por las predicciones mejor clasificadas del modelo, se propusieron seis nuevas composiciones de BMG de aluminio, de las cuales cinco se verificaron experimentalmente como amorfas completas en barras de Φ3 mm.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-7B-Instruct, un transformer denso de 7.615.616.512 parámetros. Sobre esta base se aplicó un ajuste fino supervisado (SFT) mediante LoRA, según se desprende del identificador del repositorio (`_lora_sft_`). El repositorio ocupa 15,2 GB en formato safetensors.

El entrenamiento se realizó sobre un conjunto de datos de dominio específico construido por los autores: 636 composiciones de BMG basadas en aluminio con métricas de GFA asociadas, extraídas de 503 publicaciones revisadas por pares, a partir de las cuales se generaron 32.443 pares estructurados de pregunta-respuesta que cubren tanto consultas factuales como consultas orientadas a mecanismos. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de lo indicado, ni si se emplearon técnicas de RLHF o DPO adicionales. La innovación principal es el propio marco de ajuste fino de dominio aplicado a la predicción cuantitativa de GFA y a la propuesta de nuevas composiciones.

## Capacidades

- Generación de texto y razonamiento técnico especializado en ciencia de materiales, en particular en vidrios metálicos masivos basados en aluminio.
- Regresión cuantitativa de la capacidad de formación de vidrio (GFA), con un R² de 0,938 según la model card.
- Respuesta a consultas factuales sobre composiciones de BMG y sus métricas asociadas.
- Razonamiento orientado a mecanismos sobre el comportamiento de formación de vidrio.
- Propuesta de nuevas composiciones de aleaciones guiada por las predicciones del modelo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Predicción de GFA en aleaciones de aluminio: el modelo estima métricas de capacidad de formación de vidrio a partir de una composición propuesta, lo que permite priorizar candidatos antes de recurrir a la experimentación.
- Diseño de nuevas composiciones de BMG: partiendo de los rangos de composición de interés, el modelo genera propuestas de aleaciones que, según el trabajo, dieron lugar a cinco composiciones verificadas experimentalmente como amorfas completas en barras de Φ3 mm.
- Consulta de literatura especializada: el modelo responde preguntas factuales sobre composiciones y métricas extraídas de 503 publicaciones, lo que facilita la búsqueda de referencias dentro del dominio.
- Explicación de mecanismos de formación de vidrio: el modelo puede abordar consultas orientadas a mecanismos, útil para formación de investigadores o para justificar decisiones de diseño.
- Filtrado previo en pipelines experimentales: integrado en un flujo de trabajo de laboratorio, el modelo reduce el espacio de composiciones a ensayar, ahorrando coste y tiempo en coladas por succión al vacío.
- Asistencia en la redacción de informes técnicos: el modelo puede ayudar a estructurar resultados de caracterización térmica, como anchuras de la región de líquido subenfriado (ΔTx) en el rango de 55 a 80 K observado en las aleaciones validadas.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Regresion cuantitativa de GFA (R²) | 0,938 |
| Comparacion con Bohr Academic AI | Superior segun la model card |
| Comparacion con Qinyan Academic AI | Superior segun la model card |
| Comparacion con Claude 3 | Superior segun la model card |
| Comparacion con Qwen2.5-7B-Instruct sin ajustar | Superior segun la model card |
| Composiciones propuestas | 6 |
| Composiciones verificadas como amorfas completas (Φ3 mm) | 5 |
| Composiciones con cristalizacion menor | 1 |
| Rango de ΔTx en aleaciones validadas | 55-80 K |

No se han publicado en la información disponible resultados numéricos desglosados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni las cifras concretas de las comparaciones con los asistentes académicos y Claude 3.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 15-16 GB solo para los pesos, más overhead de activaciones y caché KV.
- VRAM estimada con cuantización de 8 bits: aproximadamente 8-9 GB.
- VRAM estimada con cuantización de 4 bits: aproximadamente 5-6 GB.
- GPU recomendadas para fp16: A100 (40/80 GB), H100 (80 GB), L40S (48 GB), RTX 6000 Ada (48 GB).
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 con margen ajustado; en RTX 3090 (24 GB) de forma similar; en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) requiere cuantización de 8 bits o inferior.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y transformers con PEFT, siempre que se disponga de los pesos en el formato adecuado; el repositorio solo contiene safetensors, por lo que para llama.cpp u Ollama sería necesaria una conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-_lora_sft_BMG_GFA | 7.615.616.512 | No disponible | BMG de aluminio y GFA | MIT | Hugging Face (7 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7.615.616.512 | No disponible en la informacion | Proposito general | No disponible en la informacion | Hugging Face |
| Claude 3 | No disponible | No disponible | Proposito general | Propietaria | API de Anthropic |
| Bohr Academic AI | No disponible | No disponible | Asistente academico | Propietaria | No disponible |
| Qinyan Academic AI | No disponible | No disponible | Asistente academico | Propietaria | No disponible |

La comparación se limita a lo indicado en la model card, que sitúa al modelo por encima de las alternativas en regresión de GFA, sin cifras numéricas desglosadas para el resto de modelos.

## Limitaciones y advertencias

- El modelo está especializado en un dominio muy concreto (BMG de aluminio) y su rendimiento fuera de ese ámbito no está documentado; no debe emplearse como asistente general sin validación previa.
- El conjunto de entrenamiento se basa en 636 composiciones y 503 publicaciones, lo que limita la cobertura frente a composiciones o familias de aleaciones no representadas.
- Riesgo de alucinación en la generación de composiciones o métricas no respaldadas por la literatura; las predicciones deben validarse experimentalmente antes de cualquier aplicación industrial.
- El modelo solo declara soporte de inglés, por lo que su uso en castellano no está garantizado.
- No se especifican sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- La licencia MIT permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen2.5-7B-Instruct, ya que la información disponible no detalla la licencia del modelo base.
- El repositorio tiene un volumen de descargas muy bajo (7) y una única interacción, lo que sugiere poca validación por parte de la comunidad.
- No se detallan los tipos de cuantización soportados ni la longitud de contexto, lo que dificulta planificar despliegues en producción.
- El rendimiento reportado (R² de 0,938) proviene de la propia model card y no se ha verificado de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pengcheng-Ju/Qwen2.5-7B-_lora_sft_BMG_GFA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada.
