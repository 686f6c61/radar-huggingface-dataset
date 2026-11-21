# mradermacher/AfriqueQwen3.5-4B-zul-sft-v3-i1-GGUF

## Resumen

El repositorio `mradermacher/AfriqueQwen3.5-4B-zul-sft-v3-i1-GGUF` contiene una coleccion de cuantizaciones en formato GGUF del modelo `SaarAI/AfriqueQwen3.5-4B-zul-sft-v3`, un ajuste fino (SFT) orientado al idioma zulu y construido presumiblemente sobre una base de la familia Qwen3.5 de 4B parametros. El autor de las cuantizaciones es mradermacher, un publicador habitual de versiones GGUF de modelos de terceros para su uso con llama.cpp y derivados.

La relevancia de este repositorio es practica: permite ejecutar en hardware de consumo un modelo especializado en una lengua de bajos recursos (zulu) que de otra forma requeriria pesos en safetensors y un stack de inferencia mas pesado. El conjunto de cuantizaciones cubre desde variantes muy agresivas (IQ1_S, IQ1_M, IQ2_XXS) hasta opciones de mayor calidad (Q6_K, Q5_K_M), lo que da margen para elegir el equilibrio entre tamano y fidelidad.

Conviene senalar que la informacion publicada es muy limitada: no hay model card descriptiva, no se declaran licencia ni idiomas, y el repositorio no incluye datos de benchmarks. Los datos tecnicos disponibles provienen de las etiquetas internas de la herramienta de cuantizacion y del nombre del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso de la familia Qwen3.5, segun el nombre del modelo base) |
| Parametros totales | 1.550.888 segun metadatos safetensors del repo (dato inconsistente con el "4B" del nombre; ver advertencias) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible (el ajuste SFT se orienta a zulu por el sufijo "zul" del nombre) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base ni sobre el proceso de ajuste fino. El nombre del repositorio indica que se trata de un SFT (supervised fine-tuning) sobre `AfriqueQwen3.5-4B`, un modelo de la familia Qwen3.5 con aproximadamente 4.000 millones de parametros, especializado en zulu mediante el dataset o pipeline identificado como "v3" por SaarAI. No hay datos publicados sobre numero de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas.

Las cuantizaciones se han generado con la herramienta de mradermacher, que segun las etiquetas internas del README utiliza cuantizacion ponderada con matriz de importancia (imatrix) y produce un conjunto amplio de variantes K-quant e I-quant. El campo `output_tensor_quantised: 1` indica que los tensores de salida tambien se han cuantizado, y `convert_type: hf` que la conversion partio de pesos en formato Hugging Face.

## Capacidades

- Generacion de texto en zulu, presumiblemente con capacidad de conversacion multi-turno tras el ajuste SFT.
- Razonamiento y generacion de codigo heredados del modelo base Qwen3.5, aunque no verificados en esta ficha.
- Soporte de tool calling / function calling: no disponible (depende del modelo base y del template; no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: el ajuste se orienta a zulu; el resto de idiomas del modelo base no se detalla.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Procesamiento de lenguaje natural en zulu: el modelo puede emplearse para tareas de generacion y comprension de texto en zulu, un idioma con poca cobertura en modelos generalistas, usando las cuantizaciones Q4_K_M o Q5_K_M para un equilibrio razonable entre calidad y tamano.
- Traduccion asistida zulu-ingles: util como componente en pipelines de traduccion o postedicion, ejecutable en local gracias al formato GGUF.
- Chatbots de atencion al cliente en zulu: despliegue en local o en servidores modestos con llama.cpp u Ollama, siempre que se valide la calidad del ajuste SFT en el dominio concreto.
- Generacion de contenido educativo en zulu: redaccion de materiales, resumenes o ejercicios, con revision humana dado el riesgo de alucinacion.
- Investigacion en lenguas de bajos recursos: evaluacion comparativa de ajustes SFT en zulu y estudio del efecto de distintas cuantizaciones (de IQ1_S a Q6_K) sobre la calidad en un idioma de bajos recursos.
- Prototipado en hardware de consumo: las variantes IQ2/IQ3 permiten probar el modelo en equipos con poca VRAM o RAM antes de decidir un despliegue mayor con cuantizaciones superiores.
- Preprocesado y etiquetado de corpus en zulu: clasificacion, extraccion o normalizacion de texto a escala, ejecutando la cuantizacion Q4_0 o Q4_K_S en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; como referencia orientativa para un modelo de ~4B en GGUF, las cuantizaciones Q4_K_M suelen ocupar del orden de 2,5-3 GB y las Q6_K en torno a 3,5-4 GB, mientras que las IQ1/IQ2 quedan por debajo de 2 GB (estimaciones generales, no verificadas para este repositorio).
- GPU recomendadas: no disponible. Por tamano, una RTX 3060 de 12 GB o superior deberia alojar comodamente las cuantizaciones Q4-Q6; una RTX 4090 o A100 no serian necesarias para este tamano.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 6-8 GB o mas para cuantizaciones medias; las variantes IQ1/IQ2 podrian caber en GPUs de 4 GB o ejecutarse en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF (vLLM con soporte GGUF no esta garantizado para este formato).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| AfriqueQwen3.5-4B-zul-sft-v3 (este repo, GGUF) | ~4B (nombre) / metadatos inconsistentes | no disponible | no disponible | GGUF | Ajuste SFT en zulu, cuantizaciones multiples |
| SaarAI/AfriqueQwen3.5-4B-zul-sft-v3 (original) | ~4B | no disponible | no disponible | safetensors (presumiblemente) | Pesos originales del ajuste |
| Qwen3.5-4B (base, si existe publicamente) | ~4B | no disponible | no disponible | safetensors/GGUF | Modelo generalista sin ajuste en zulu |
| Otros ajustes en zulu de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas |

No se dispone de datos de rendimiento comparativo entre estas alternativas.

## Limitaciones y advertencias

- Inconsistencia en el recuento de parametros: los metadatos safetensors indican 1.550.888 parametros, mientras que el nombre del modelo sugiere ~4B. Este dato debe tratarse con cautela y verificarse antes de cualquier uso en produccion.
- Ausencia de model card: no hay descripcion de arquitectura, datos de entrenamiento, licencia ni idiomas declarados, lo que dificulta evaluar su idoneidad.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe contactarse con el autor o revisar el modelo original antes de un despliegue comercial.
- Riesgo de alucinacion: inherente a los modelos de lenguaje, especialmente en un ajuste SFT de dominio limitado y en un idioma de bajos recursos donde los datos de validacion son escasos.
- Sesgos conocidos: no documentados; los sesgos del modelo base y del corpus de ajuste en zulu no han sido evaluados publicamente.
- Limitaciones de contexto e idioma: la ventana de contexto no se especifica y el alcance multilingue no esta documentado; el ajuste se centra en zulu.
- Calidad de las cuantizaciones agresivas: las variantes IQ1_S, IQ1_M e IQ2_XXS pueden degradar notablemente la calidad; para produccion conviene validar Q4_K_M o superior.
- Repositorio sin descargas ni likes: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-zul-sft-v3-i1-GGUF
- Modelo original: https://huggingface.co/SaarAI/AfriqueQwen3.5-4B-zul-sft-v3
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
