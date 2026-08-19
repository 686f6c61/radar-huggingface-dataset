# mradermacher/sarv-reasoning-i1-GGUF

## Resumen

El modelo `mradermacher/sarv-reasoning-i1-GGUF` es una cuantización en formato GGUF del modelo `artindnr/sarv-reasoning`, un modelo de lenguaje especializado en persa (farsi) con capacidades de razonamiento, cadena de pensamiento (chain-of-thought) y generación de poesía. La cuantización ha sido realizada por mradermacher, un conocido proveedor de modelos GGUF, e incluye múltiples niveles de compresión (desde IQ2_M hasta Q6_K) para adaptarse a diferentes capacidades de hardware.

El modelo base, `sarv-reasoning`, está diseñado específicamente para tareas de razonamiento y generación de texto en persa, con un enfoque particular en la poesía y la composición literaria. Según las etiquetas del repositorio, emplea una arquitectura de mezcla de expertos (MoE) y está relacionado con la familia GPT-OSS, aunque no se proporcionan detalles técnicos adicionales en la model card. La licencia Apache 2.0 permite uso comercial y modificación, lo que lo hace atractivo para integraciones en producción.

Esta versión cuantizada permite ejecutar el modelo en entornos con recursos limitados, como estaciones de trabajo con GPU de consumo o incluso solo CPU, manteniendo un equilibrio entre tamaño y calidad. Es especialmente relevante para desarrolladores que necesitan un modelo de razonamiento en persa sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetas indican mixture-of-experts y gpt-oss) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (al ser MoE, probablemente solo una fraccion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K, i1-IQ4_XS, i1-Q2_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (tamano entre 12.2 y 22.3 GB) |
| Idiomas soportados | fa (persa/farsi) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion publica detallada sobre la arquitectura interna del modelo base `artindnr/sarv-reasoning` en la model card de esta cuantizacion. Las etiquetas del repositorio indican que se trata de un modelo de mezcla de expertos (MoE) y que esta relacionado con la familia GPT-OSS, lo que sugiere un diseño basado en transformers con capas de atencion y rutas de expertos. Tambien se menciona el uso de LoRA (Low-Rank Adaptation) y el formato de pesos mxfp4, aunque no se especifica si estos se aplican al modelo base o solo a la cuantizacion.

En cuanto al entrenamiento, no hay datos sobre el numero de tokens, la composicion del dataset ni si se utilizaron tecnicas como RLHF o DPO. La unica informacion disponible es que el modelo esta especializado en persa y en tareas de razonamiento y generacion de poesia, lo que sugiere un entrenamiento o ajuste fino con datos literarios y de razonamiento en ese idioma.

## Capacidades

- Generacion de texto en persa (farsi) con calidad literaria, especialmente en poesia y composicion creativa.
- Razonamiento logico y matematico con cadena de pensamiento (chain-of-thought), segun las etiquetas del modelo.
- Soporte para tareas de razonamiento multi-paso, probablemente mediante generacion de pasos intermedios.
- Capacidad de generar poemas con metrica y rima en persa, gracias al ajuste especifico en ese dominio.
- Compatible con el ecosistema transformers de Hugging Face, lo que permite su uso con pipelines de generacion de texto estandar.
- Al ser una cuantizacion GGUF, es compatible con herramientas como llama.cpp, Ollama y vLLM para despliegue local.

## Casos de uso

- Generacion de poesia persa: el modelo puede componer poemas con estructuras metricas tradicionales (como ghazal o masnavi) a partir de una tematica o palabra clave, siendo util para escritores y editores literarios.
- Asistente de escritura creativa en persa: ayuda a redactar cuentos, ensayos o dialogos con un estilo literario coherente, aprovechando su entrenamiento en textos persas.
- Razonamiento logico y resolucion de problemas: puede utilizarse como motor de razonamiento en aplicaciones educativas o de analisis, generando explicaciones paso a paso en persa.
- Traduccion y adaptacion de contenido literario: aunque no esta especializado en traduccion, puede reformular o adaptar textos persas manteniendo el tono y la coherencia.
- Chatbot de atencion al cliente en persa: gracias a su capacidad de razonamiento y generacion de texto, puede mantener conversaciones contextuales en entornos de soporte, aunque su enfoque literario puede requerir ajuste.
- Analisis de sentimiento y resumen de textos persas: puede extraer ideas principales o resumir documentos largos, aunque su especializacion en poesia podria limitar su rendimiento en textos tecnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos sobre metricas como MMLU, HumanEval o GSM8K para este modelo ni para su version base. La unica referencia de calidad es la comparativa de cuantizaciones proporcionada por mradermacher, que sugiere que los quants IQ suelen ofrecer mejor calidad que los Q de tamano similar, pero sin cifras concretas.

## Requisitos de hardware

- Los tamaños de los archivos GGUF varian entre 12.2 GB (IQ2_M) y 22.3 GB (Q6_K), lo que implica necesidades de VRAM o RAM proporcionales.
- Para el quant i1-Q4_K_M (15.9 GB), se recomienda una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100 40GB) para una inferencia fluida.
- Los quants mas pequeños (12.2 GB) pueden caber en GPUs de 16 GB, pero con posible degradacion de calidad.
- En CPU, se puede ejecutar con llama.cpp u Ollama, siempre que se disponga de al menos 16-24 GB de RAM libre.
- Para despliegue en produccion, se recomienda vLLM o TGI con soporte para GGUF, aunque estos requieren conversion a formatos nativos (safetensors) para un rendimiento optimo.
- La latencia dependera del hardware; en una GPU de gama alta (RTX 4090) se pueden esperar decenas de tokens por segundo, mientras que en CPU sera significativamente menor.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el mismo segmento (razonamiento en persa con cuantizacion GGUF). No hay datos publicos sobre alternativas como otros modelos persas de razonamiento o versiones cuantizadas de modelos multilingues. Por tanto, no es posible realizar una comparativa fundamentada.

## Limitaciones y advertencias

- Al ser una cuantizacion, existe una perdida de calidad respecto al modelo original en precision completa, especialmente en los quants de menor tamano (IQ2_M, Q2_K).
- El modelo esta entrenado principalmente en persa; su rendimiento en otros idiomas es muy limitado o nulo, por lo que no es adecuado para aplicaciones multilingues.
- No se han documentado sesgos especificos, pero al estar entrenado con datos literarios persas, podria reflejar sesgos culturales o de genero presentes en ese corpus.
- Riesgo de alucinacion en tareas de razonamiento complejo, especialmente cuando se utilizan quants de baja precision.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos del modelo base `artindnr/sarv-reasoning` por si tuviera restricciones adicionales.
- No hay informacion sobre la longitud de contexto soportada, lo que puede limitar su uso en tareas que requieran ventanas largas.

## Enlaces

- [Modelo cuantizado en Hugging Face](https://huggingface.co/mradermacher/sarv-reasoning-i1-GGUF)
- [Modelo base artindnr/sarv-reasoning](https://huggingface.co/artindnr/sarv-reasoning)
- [Perfil de mradermacher en Hugging Face](https://huggingface.co/mradermacher)
