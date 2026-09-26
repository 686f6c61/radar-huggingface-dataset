# alireza-fallah/gemma3-4b-adapter-bourse-assistant

## Resumen

`alireza-fallah/gemma3-4b-adapter-bourse-assistant` es un ajuste fino del modelo `unsloth/gemma-3-4b-it` (familia Gemma 3 de Google, en torno a 4 000 millones de parametros) orientado a un asistente de mercado bursatil en lengua persa. Lo publica el usuario alireza-fallah y se apoya en dos datasets propios: `bourse-assistant-sft`, para el ajuste supervisado, y `bourse-assistant-rl`, para una etapa posterior de refinamiento por refuerzo, ambos etiquetados con `stock-prediction`.

El repositorio ocupa 0,5 GB y esta etiquetado con `pipeline_tag: text-classification`, aunque tambien lleva las etiquetas `text-generation-inference`, `unsloth` y `stock-prediction`. Esa combinacion apunta a un uso dual: clasificacion de senales o noticias financieras y generacion de texto conversacional sobre el mismo dominio. El modelo base Gemma 3 4B es un transformer decoder-only con ventana de atencion deslizante y soporte multilingue, lo que da al ajuste una base razonable para persa.

Su relevancia es acotada pero ilustrativa: es un ejemplo de ajuste vertical de bajo coste (Unsloth + TRL) sobre un modelo pequeno para un dominio con poca cobertura, el analisis bursatil en persa. El repositorio se publica bajo licencia apache-2.0, si bien el modelo base esta sujeto a los terminos de uso de Gemma, un punto que hay que verificar antes de cualquier explotacion comercial. La adopcion es practicamente nula en el momento de la consulta (0 descargas, 1 like) y no hay resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base `unsloth/gemma-3-4b-it` (Gemma 3); atencion con patron de ventana deslizante local/global 5:1, segun la documentacion del modelo base |
| Parametros totales | No disponible para el ajuste. El modelo base ronda los 4 000 millones de parametros; el repositorio pesa 0,5 GB, compatible con un adaptador LoRA o con pesos ya fusionados en baja precision |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la model card del ajuste. El modelo base Gemma 3 4B declara 128 000 tokens |
| Tipos de cuantizacion | No disponible. Al derivar de Gemma 3 4B son aplicables cuantizaciones de 8 y 4 bits (bitsandbytes, GGUF) generadas por el usuario |
| Idiomas soportados | Persa (`fa`) declarado en la model card. El modelo base es multilingue |
| Licencia | apache-2.0 para el repositorio. El modelo base Gemma 3 se rige por los terminos de uso de Google, que se superponen |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | unsloth/gemma-3-4b-it |
| Tipo de artefacto | Ajuste fino o adaptador (etiqueta `unsloth`). No confirmado explicitamente en la model card |
| Tamano del repositorio | 0,5 GB |
| Pipeline declarado | text-classification |
| Datasets de entrenamiento | alireza-fallah/bourse-assistant-sft, alireza-fallah/bourse-assistant-rl |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el procedimiento de entrenamiento; solo indica el modelo base y los datasets. Por herencia del modelo base, la arquitectura es un transformer decoder-only con atencion intercalada en patron 5:1 entre capas de ventana local (ventana de 1024 tokens) y capas de atencion global, lo que reduce el coste de la cache KV en contextos largos. Gemma 3 4B esta entrenado por Google sobre datos multimodales y multilingues, con una etapa de ajuste por instrucciones de la que hereda este derivado.

Por las etiquetas del repositorio (`unsloth`, `trl`) y los nombres de los datasets, el ajuste se realizo previsiblemente con Unsloth y la libreria TRL, en dos fases: fine-tuning supervisado (SFT) sobre `bourse-assistant-sft` y una fase posterior de aprendizaje por refuerzo sobre `bourse-assistant-rl`. El algoritmo concreto de esa segunda fase (DPO, GRPO, PPO u otro), el numero de tokens de entrenamiento, la composicion del dataset, el uso de LoRA/QLoRA y el rango del adaptador no estan disponibles. Tampoco se documenta ninguna innovacion tecnica propia ni estrategia de decodificacion especulativa.

## Capacidades

- Generacion de texto en persa, orientada a contenido financiero y bursatil.
- Clasificacion de texto financiero (el pipeline declarado es `text-classification`), previsiblemente para senales, sentimiento o categorias de noticias de mercado.
- Prediccion o etiquetado relacionado con bolsa, segun la etiqueta `stock-prediction`; no se especifica el formato de salida ni la tarea exacta.
- Conversacion multi-turno para asistencia sobre mercados, derivada del ajuste por instrucciones del modelo base.
- Comprension de contexto largo potencial (hasta 128 000 tokens del modelo base), sin confirmacion en la model card del ajuste.
- Capacidad multilingue residual del modelo base, aunque el ajuste esta declarado solo para persa.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Capacidades de vision: el modelo base Gemma 3 4B es multimodal, pero no hay ninguna indicacion de que el ajuste conserve o entrene esa capacidad.

## Casos de uso

- Analisis de sentimiento de noticias bursatiles en persa: el modelo puede clasificar titulares y comunicados de la bolsa de Teheran en categorias de impacto positivo, negativo o neutro, aprovechando el ajuste especifico sobre datos de mercado persas.
- Asistente conversacional para inversores minoristas: dado su origen en un modelo `-it`, puede mantener dialogos multi-turno en persa respondiendo dudas sobre terminologia financiera, ratios o el funcionamiento del mercado.
- Filtrado previo en pipelines de research cuantitativo: uso como clasificador de primera etapa para descartar noticias irrelevantes antes de pasarlas a modelos mayores o a analistas humanos, reduciendo coste de computo.
- Extraccion y etiquetado de eventos corporativos: deteccion de ampliaciones de capital, resultados trimestrales o cambios de directiva a partir de comunicados en persa, siempre con validacion humana posterior.
- Resumen de informes financieros o actas de junta: el contexto largo del modelo base permite procesar documentos extensos y generar resumenes en persa para analistas.
- Prototipado y docencia en PLN financiero persa: al ser un ajuste pequeno y ligero, es util como banco de pruebas para experimentos de fine-tuning en un idioma con poca cobertura de recursos.
- Generacion de hipotesis de estrategias: puede redactar borradores de tesis de inversion o explicaciones de estrategias, pero no debe usarse como fuente de decisiones de inversion sin validacion externa ni datos de mercado en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna metrica especifica de la tarea bursatil, tampoco comparaciones con el modelo base ni con alternativas. No se dispone de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para el modelo base en bf16/fp16: en torno a 8-9 GB solo para los pesos, mas la cache KV, que anade varios gigabytes segun la longitud de contexto utilizada.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 4,5-5 GB de pesos.
- VRAM estimada con cuantizacion GGUF Q4_K_M: aproximadamente 2,5-3 GB de pesos, la opcion mas habitual en equipos de gama media.
- Si el repositorio contiene un adaptador LoRA, hay que cargar ademas el modelo base completo (`unsloth/gemma-3-4b-it`) o fusionar el adaptador antes del despliegue.
- GPU consumer compatibles: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, RTX 4090 24 GB; en configuraciones de 4 bits cabe tambien en GPUs de 8 GB con contextos moderados.
- GPU de centro de datos: L4, A10G, A100 40/80 GB y H100, con margen amplio para contextos largos y lotes grandes.
- Opciones de despliegue: transformers con PEFT para el adaptador, vLLM o TGI tras fusionar los pesos, llama.cpp y Ollama previa conversion a GGUF, y Unsloth para entrenamiento e inferencia rapida.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Advertencia practica: aunque el modelo base declara 128 000 tokens de contexto, la cache KV a esa longitud puede consumir mas VRAM que los propios pesos en precision completa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| gemma3-4b-adapter-bourse-assistant (este modelo) | ~4 000 M (base) | No disponible en el ajuste; 128 000 tokens en el base | apache-2.0 en el repo, con los terminos de Gemma 3 del base | Ajuste vertical para bolsa en persa | HuggingFace, 0 descargas |
| unsloth/gemma-3-4b-it | ~4 000 M | 128 000 tokens (segun el modelo base) | Terminos de uso de Gemma | Modelo base instructivo, multilingue | HuggingFace, alta adopcion |
| Llama 3.2 3B Instruct | 3 210 M | 128 000 tokens | Licencia comunitaria de Llama 3.2 | Modelo instructivo generalista | HuggingFace, muy alta adopcion |
| Qwen2.5 3B Instruct | 3 090 M | 32 000 tokens nativos, ampliable con YaRN | Licencia especifica de Qwen para la variante de 3B | Modelo instructivo generalista, fuerte en multilingue | HuggingFace, muy alta adopcion |

Los datos de los tres modelos comparativos proceden de sus fichas publicas y conviene verificarlos en la fuente original antes de tomar decisiones. No hay datos de rendimiento del modelo objeto de esta ficha, por lo que no es posible comparar calidad de tarea.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni comparacion con el modelo base, ni validacion sobre datos retenidos.
- Riesgo de alucinacion elevado en el dominio financiero: cualquier cifra, cotizacion o recomendacion generada debe verificarse contra una fuente de datos real.
- La etiqueta `stock-prediction` no implica capacidad predictiva demostrada; predecir series financieras con un modelo de lenguaje de 4B carece de base metodologica solida.
- Cobertura linguistica limitada al persa declarado; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente tras el ajuste.
- Longitud de contexto efectiva del ajuste no documentada; el valor de 128 000 tokens corresponde al modelo base y no esta garantizado tras el fine-tuning.
- Inconsistencia en los metadatos: el pipeline declarado es `text-classification` mientras que las etiquetas incluyen generacion de texto, lo que dificulta la integracion automatica en algunos frameworks.
- Conflicto de licencias: el repositorio declara apache-2.0, pero el modelo base Gemma 3 se rige por los terminos de uso de Google, que prevalecen sobre los pesos derivados. Revisar antes de uso comercial.
- Adopcion nula y mantenimiento incierto: 0 descargas, 1 like y una unica iteracion del repositorio (creado y actualizado el mismo dia).
- Model card practicamente vacia: no se documentan datos de entrenamiento, hiperparametros, sesgos ni limitaciones conocidas.
- Sesgos potenciales no evaluados: los datasets de mercado persa pueden introducir sesgos de seleccion temporal, de sector o de estilo de redaccion de los medios de origen.
- No debe utilizarse como asesoramiento financiero ni como sistema autonomo de decision de inversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alireza-fallah/gemma3-4b-adapter-bourse-assistant
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- Dataset de ajuste supervisado: https://huggingface.co/datasets/alireza-fallah/bourse-assistant-sft
- Dataset de refinamiento por refuerzo: https://huggingface.co/datasets/alireza-fallah/bourse-assistant-rl
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
