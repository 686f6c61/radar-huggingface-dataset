# artindnr/sarv-reasoning-GGUF

## Resumen

El modelo `artindnr/sarv-reasoning-GGUF` es una versión cuantizada en formato GGUF del modelo base `artindnr/sarv-reasoning`, desarrollado por el usuario artindnr. Se trata de un modelo de lenguaje de razonamiento especializado en persa (farsi), con capacidades destacadas para generación de poesía, razonamiento lógico y cadenas de pensamiento (chain-of-thought). Está construido sobre la arquitectura GPT-OSS, que emplea una mezcla de expertos (Mixture of Experts, MoE), con un total de aproximadamente 20.900 millones de parámetros. La cuantización ha sido realizada por mradermacher, un conocido proveedor de modelos GGUF, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

Este modelo resulta relevante para la comunidad de procesamiento de lenguaje natural en persa, un idioma con escasez de modelos de alta calidad. Su enfoque en razonamiento y poesía lo convierte en una opción interesante para aplicaciones creativas y analíticas en ese idioma. La disponibilidad de múltiples niveles de cuantización (desde Q2_K hasta Q8_0) permite adaptar el despliegue a distintos recursos de hardware, desde GPU de consumo hasta servidores profesionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), basada en GPT-OSS |
| Parametros totales | 20.914.757.184 (20,9 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | Persa (farsi) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base `sarv-reasoning` emplea una arquitectura de mezcla de expertos (MoE), lo que implica que solo una fracción de los parámetros totales se activa durante cada inferencia. Esta arquitectura, común en modelos como GPT-OSS, permite un equilibrio entre capacidad y eficiencia computacional. Los detalles específicos sobre el número de expertos, la dimensión de los vectores ocultos o el mecanismo de enrutamiento no se han publicado en la información disponible.

En cuanto al entrenamiento, no se han proporcionado datos sobre el número de tokens, la composición del dataset o el uso de técnicas como RLHF o DPO. Los tags del modelo sugieren que se ha realizado un ajuste fino (LoRA) sobre una base GPT-OSS, probablemente con datos en persa, incluyendo corpus de poesía y razonamiento. La cuantización GGUF es estática, realizada por mradermacher, y no implica un reentrenamiento del modelo, sino una conversión de los pesos a formatos de menor precisión.

## Capacidades

- Generación de texto en persa con alta fluidez, especialmente en registros literarios y poéticos.
- Razonamiento lógico y matemático básico, con soporte para cadenas de pensamiento (chain-of-thought) que mejoran la precisión en problemas de varios pasos.
- Generación de poesía persa, incluyendo formas clásicas como ghazal, masnavi o rubaiyat, con métrica y rima aproximadas.
- Comprensión de contexto conversacional en persa, adecuado para diálogos multi-turno.
- Capacidad de seguir instrucciones en persa, aunque no se ha verificado soporte explícito para tool calling o function calling.
- Procesamiento de texto en persa con vocabulario extenso, incluyendo arabismos y expresiones idiomáticas propias del idioma.

## Casos de uso

- Generación de poesía persa: el modelo puede componer poemas originales en estilos clásicos y contemporáneos, útil para escritores, traductores o aplicaciones educativas de literatura persa.
- Asistente de escritura creativa: ayuda a redactar cuentos, ensayos o guiones en persa, sugiriendo frases, metáforas y estructuras narrativas coherentes.
- Tutor de razonamiento: puede explicar paso a paso la resolución de problemas lógicos o matemáticos en persa, sirviendo como herramienta educativa para estudiantes.
- Análisis de sentimiento y crítica literaria: al comprender matices poéticos, puede analizar la tonalidad y el estilo de textos persas, útil para editoriales o investigadores.
- Chatbot de atención al cliente en persa: con su capacidad de diálogo, puede gestionar consultas de usuarios en persa, aunque su especialización en poesía podría limitar su rendimiento en dominios técnicos.
- Traducción literaria asistida: puede ayudar a traductores a encontrar equivalencias poéticas entre persa y otros idiomas, preservando el ritmo y la rima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras pruebas estandarizadas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, el archivo GGUF ocupa entre 12,2 GB (Q2_K) y 22,4 GB (Q8_0). Se recomienda una GPU con al menos 16 GB de VRAM para las cuantizaciones Q4 y superiores, y 24 GB para Q6 y Q8.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 (80 GB) para las cuantizaciones más altas. Para Q4_K_M (15,9 GB) puede bastar una RTX 4080 (16 GB) o una RTX 3080 Ti (12 GB) con cuantizaciones más bajas.
- En consumer GPU: sí, cabe en GPUs de gama alta con 16-24 GB de VRAM, como la RTX 4080/4090. Para GPUs de 12 GB, solo las cuantizaciones Q2_K o Q3_K_S (12,2 GB) podrían ajustarse con riesgo de desbordamiento.
- Opciones de despliegue: al ser formato GGUF, es compatible con llama.cpp, Ollama, LM Studio, KoboldCpp y servidores como llama-cpp-python. También puede usarse con vLLM si se convierte a safetensors, aunque no es el formato nativo.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 4090 con Q4_K_M, se puede esperar una velocidad de generación de entre 20 y 40 tokens por segundo, dependiendo de la longitud de la secuencia y el número de expertos activos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en persa con arquitectura MoE y tamaño similar. Se podría comparar con otros modelos persas como `Persian-LLaMA` o `Aya-101`, pero no se tienen datos de rendimiento de `sarv-reasoning` para establecer una comparación objetiva. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado en persa y puede tener un rendimiento deficiente en otros idiomas, aunque podría generar texto en inglés o árabe con menor calidad.
- Al ser una cuantización, se produce una pérdida de precisión respecto al modelo original en safetensors, especialmente en las cuantizaciones más bajas (Q2_K, Q3_K). Esto puede afectar a tareas de razonamiento complejo.
- No se han documentado sesgos específicos, pero al estar entrenado con datos en persa, puede reflejar sesgos culturales o regionales de ese ámbito.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar hechos o referencias, especialmente en dominios poco representados en sus datos de entrenamiento.
- La longitud de contexto no se ha especificado; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en producción.
- No se ha confirmado soporte para tool calling o integración con agentes, por lo que su uso en pipelines de automatización compleja puede requerir adaptaciones.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir adecuadamente al autor original y a mradermacher por la cuantización.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/artindnr/sarv-reasoning-GGUF
- Modelo base en HuggingFace: https://huggingface.co/artindnr/sarv-reasoning
- Cuantizaciones con imatrix (alternativa): https://huggingface.co/mradermacher/sarv-reasoning-i1-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
