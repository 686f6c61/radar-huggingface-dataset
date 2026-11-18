# mradermacher/Uncensored-SLM-i1-GGUF

## Resumen

Uncensored-SLM-i1-GGUF es un conjunto de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo base Uncensored-SLM, publicado originalmente por el usuario mrzenin. No se trata de un modelo entrenado desde cero por mradermacher, sino de una conversión y cuantización del modelo original en formato Hugging Face a GGUF, empleando cuantizaciones ponderadas con matriz de importancia (imatrix) para preservar la calidad en los niveles de compresión más agresivos.

El dato de parámetros totales reportado en la información de safetensors es de 899.013, una cifra anómala que probablemente corresponde a un recuento parcial o a un fallo en la extracción de metadatos; no es coherente con un modelo de lenguaje funcional y debe interpretarse con cautela. El tamaño del repositorio figura como 0.0 GB, lo que sugiere que los metadatos disponibles están incompletos o que el repositorio no contenía pesos en el momento de la consulta.

La relevancia de esta ficha es limitada por la escasez de información verificable: no se dispone de model card descriptiva del modelo base, ni de especificaciones de arquitectura, contexto, licencia o idiomas. El interés principal reside en la disponibilidad de un abanico amplio de cuantizaciones GGUF (desde IQ1_S hasta Q6_K), lo que permite desplegar el modelo en hardware muy restringido, siempre que se acepten los riesgos asociados a un modelo sin documentación técnica pública.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | 899.013 (dato reportado en safetensors; cifra anómala, ver advertencias) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q4_0, Q4_1, IQ4_NL, IQ4_XS, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M (además de small-IQ4_NL) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones derivadas de un modelo base en formato Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Uncensored-SLM. La model card del repositorio de cuantizaciones no describe la arquitectura, el número de capas, el mecanismo de atención ni el esquema de entrenamiento. Los metadatos internos del proceso de cuantización indican `convert_type: hf` y `output_tensor_quantised: 1`, lo que confirma que se partió de pesos en formato Hugging Face y se aplicó una conversión a GGUF con cuantización de tensores.

El proceso de cuantización empleado por mradermacher utiliza cuantizaciones ponderadas con matriz de importancia (imatrix), una técnica que estima la relevancia de cada tensor a partir de activaciones sobre un corpus de calibración y ajusta la asignación de bits en consecuencia. Esto permite que las cuantizaciones de baja precisión (IQ2, IQ3, IQ1) conserven mejor la calidad que una cuantización uniforme equivalente. No hay información sobre el corpus de calibración, el número de tokens de entrenamiento del modelo base ni sobre si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- No se dispone de documentación que detalle las capacidades del modelo base.
- Por el nombre del modelo ("Uncensored-SLM") se infiere que se trata de un modelo de lenguaje pequeño (SLM) orientado a generación de texto con un ajuste destinado a reducir los rechazos o filtros de contenido, aunque esta inferencia no está confirmada por ninguna fuente técnica.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Experimentación local en hardware restringido: las cuantizaciones IQ1_S e IQ2_XXS permiten ejecutar el modelo en equipos con muy poca memoria, lo que resulta útil para pruebas de concepto y evaluación de viabilidad antes de invertir en infraestructura mayor.
- Despliegue en dispositivos de borde: las variantes Q4_0 y Q4_1 son compatibles con runtimes ligeros y pueden integrarse en aplicaciones de escritorio o móviles mediante llama.cpp, siempre que el tamaño real del modelo lo permita.
- Generación de texto sin restricciones temáticas en entornos controlados: el ajuste "uncensored" puede interesar a investigadores que estudian el comportamiento de modelos sin alineación de seguridad, en contextos de laboratorio y con las salvaguardas adecuadas.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece más de veinte variantes del mismo modelo, lo que permite medir el impacto de la compresión en la perplejidad y la calidad de generación sobre un mismo modelo base.
- Prototipado de pipelines con Ollama o llama.cpp: la disponibilidad de GGUF facilita la integración en flujos de trabajo locales sin necesidad de GPU dedicada, usando las variantes Q4_K_M o Q5_K_M como compromiso entre calidad y tamaño.
- Fine-tuning posterior sobre cuantizaciones: aunque no es el uso habitual, las variantes de mayor precisión (Q6_K) pueden servir como referencia para comparar el efecto de adaptaciones posteriores sobre el modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, ya que el número real de parámetros del modelo base no está confirmado. El dato de 899.013 parámetros reportado en safetensors es inconsistente con un modelo de lenguaje operativo y no permite calcular requisitos de memoria fiables.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no determinable sin conocer el tamaño real del modelo; las cuantizaciones IQ1_S e IQ2_XXS están diseñadas para minimizar el uso de memoria y podrían caber en GPU de gama baja si el modelo base es efectivamente pequeño.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todos los casos, por lo que su uso requeriría los pesos originales en safetensors.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre el modelo base ni sobre alternativas comparables de la misma categoría (modelos pequeños sin alineación de seguridad) con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- El recuento de parámetros reportado (899.013) es anómalo y probablemente erróneo; no debe usarse para dimensionar infraestructura ni para estimar requisitos de memoria.
- El tamaño del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no estaban disponibles o que los metadatos están incompletos en el momento de la consulta.
- No hay model card del modelo base accesible en la información proporcionada, por lo que se desconocen los datos de entrenamiento, la composición del corpus y los posibles sesgos.
- El nombre "Uncensored" sugiere un ajuste destinado a reducir los filtros de seguridad; esto implica un riesgo elevado de generar contenido inapropiado, ofensivo o dañino, y su uso en producción requiere salvaguardas adicionales.
- Riesgo de alucinación: no evaluado; sin benchmarks ni documentación, no es posible estimar la fiabilidad factual del modelo.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Antes de cualquier despliegue en producción debe verificarse la licencia del modelo base en el repositorio de mrzenin.
- Idiomas soportados desconocidos: no hay garantía de un rendimiento aceptable en castellano ni en otros idiomas distintos del inglés.
- Las cuantizaciones de muy baja precisión (IQ1_S, IQ2_XXS) degradan notablemente la calidad de generación; deben usarse solo cuando la restricción de memoria sea el factor limitante.
- La fecha de creación del repositorio (2026-11-18) es posterior a la fecha actual en la mayoría de contextos de consulta; conviene verificar la vigencia y el estado real del repositorio antes de utilizarlo.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Uncensored-SLM-i1-GGUF
- Modelo base: https://huggingface.co/mrzenin/Uncensored-SLM
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
