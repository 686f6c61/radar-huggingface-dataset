# mradermacher/Smaug-Humanizer-i1-GGUF

## Resumen

Smaug-Humanizer-i1-GGUF es una colección de cuantizaciones GGUF, generadas con imatrix, del modelo abacusai/Smaug-Humanizer. El trabajo de cuantización lo firma mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp. El modelo subyacente es un ajuste fino de la familia Gemma (etiquetado como "gemma4" en la model card) orientado a la "humanización" de texto, es decir, a producir respuestas conversacionales con un tono más natural y menos artificial. El ajuste se realizó mediante GRPO (Group Relative Policy Optimization), una técnica de aprendizaje por refuerzo.

El repositorio no contiene los pesos originales en safetensors, sino únicamente los ficheros GGUF cuantizados, además del fichero imatrix empleado para generarlos. El recuento de parámetros del modelo base, según los safetensors del modelo original, es de 11.907.350.576 parámetros (aproximadamente 11,9 mil millones), lo que sitúa al modelo en la gama de tamaño de Gemma 2 9B/Gemma 3 12B. El repositorio ocupa 140,4 GB en total, suma de todas las variantes de cuantización publicadas.

La relevancia de esta ficha radica en que permite ejecutar un modelo afinado para estilo conversacional en hardware de consumo mediante llama.cpp y formatos GGUF, con múltiples niveles de cuantización desde IQ1_S (3,1 GB) hasta Q6_K (9,9 GB). La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque la información disponible sobre el modelo original es limitada y no se han publicado benchmarks en los datos proporcionados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base etiquetado como "gemma4"; presumiblemente transformer decoder-only de la familia Gemma, sin confirmar) |
| Parametros totales | 11.907.350.576 (11,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (cuantizaciones i1 con imatrix) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (solo cuantizaciones; no se incluyen safetensors en este repo) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base abacusai/Smaug-Humanizer en los datos proporcionados. La model card del repositorio de cuantización etiqueta el modelo con "gemma4", lo que sugiere que deriva de la familia Gemma de Google, pero no se confirma la variante exacta ni la configuración de capas, atención o cabezas. El recuento de parámetros (11,9 mil millones) es el único dato estructural firme disponible.

El ajuste del modelo base se realizó mediante GRPO, según la etiqueta de la model card, una técnica de optimización de política por refuerzo relativo a grupos que se emplea habitualmente para mejorar el razonamiento y el estilo de las respuestas. El objetivo declarado del modelo es la "humanización" del texto generado. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de SFT o DPO. Las cuantizaciones de este repositorio se generaron con el método i1 de mradermacher, que utiliza ficheros imatrix (importance matrix) para preservar la calidad en niveles de compresión bajos.

## Capacidades

- Generación de texto conversacional en inglés con un estilo "humanizado", objetivo declarado del ajuste.
- Conversación multi-turno (etiqueta "conversational" en el repositorio).
- Ajuste por refuerzo con GRPO, orientado a mejorar la calidad y naturalidad de las respuestas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Generación de respuestas conversacionales naturales: el ajuste "humanizer" está diseñado para producir texto con un tono menos robótico, adecuado para asistentes virtuales y chatbots de cara al público en inglés.
- Reescribir y humanizar textos generados por otros modelos: puede emplearse como segunda pasada para suavizar respuestas demasiado formales o repetitivas en pipelines de generación.
- Prototipado en local con llama.cpp: las cuantizaciones Q4_K_M (7,5 GB) e IQ4_XS (6,7 GB) permiten ejecutar el modelo en GPUs de consumo y validar el comportamiento conversacional sin infraestructura dedicada.
- Generación de contenido editorial en inglés: redacción de borradores con estilo natural para blogs, correos y documentación, con revisión humana posterior.
- Investigación sobre ajuste por RL: el modelo sirve como caso de estudio de GRPO aplicado a estilo conversacional, comparable con otros ajustes de la familia Gemma.
- Despliegue en entornos con recursos limitados: las variantes IQ2/IQ3 (3,7-6,7 GB) permiten inferencia en GPUs de 6-8 GB de VRAM o incluso en CPU, a costa de calidad.
- Evaluación de cuantizaciones: el fichero imatrix incluido permite generar cuantizaciones propias y comparar la degradación de calidad entre niveles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF, con overhead adicional de contexto y caché KV):
  - IQ1_S: 3,1 GB
  - IQ2_M: 4,5 GB
  - IQ3_M: 5,8 GB
  - IQ4_XS: 6,7 GB
  - Q4_K_M: 7,5 GB
  - Q5_K_M: 8,6 GB
  - Q6_K: 9,9 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para las variantes Q4-Q6; GPUs de 8 GB (RTX 3060 Ti, RTX 4060) para IQ3/IQ4; A100/H100 no son necesarias para este tamaño, pero permiten mayor contexto y throughput.
- Cabe en GPU de consumo: sí, desde GPUs de 6-8 GB con cuantizaciones IQ2/IQ3 hasta 12-16 GB con Q5/Q6. Las variantes IQ1/IQ2 también pueden ejecutarse parcial o totalmente en CPU.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, servidores compatibles con la API de OpenAI (el repositorio incluye la etiqueta "endpoints_compatible"). No se indica soporte para vLLM o TGI con estos ficheros GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del nivel de cuantización.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base para establecer una comparación rigurosa. A continuación se comparan únicamente los datos objetivos disponibles frente a alternativas de tamaño similar de la familia Gemma, marcando como "no disponible" lo que no se puede confirmar.

| Modelo | Parámetros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Smaug-Humanizer (este repo, GGUF) | 11,9 B | no disponible | Apache 2.0 | GGUF (i1, imatrix) | Ajuste GRPO para estilo conversacional; solo inglés |
| Gemma 2 9B | 9,2 B | 8.192 tokens | Gemma license | safetensors, GGUF | Referencia de la familia; contexto y licencia distintos |
| Gemma 3 12B | 12,2 B | 128.000 tokens (según versión) | Gemma license | safetensors, GGUF | Tamaño comparable; contexto mucho mayor |
| Mistral 7B / Nemo 12B | 7,2 B / 12 B | 32.000-128.000 tokens | Apache 2.0 | safetensors, GGUF | Alternativa Apache 2.0 con contexto amplio |

La comparación con Gemma 2 9B y Gemma 3 12B es aproximada: la información proporcionada no confirma que Smaug-Humanizer derive exactamente de esas variantes, solo la etiqueta "gemma4". No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Solo se distribuyen cuantizaciones GGUF; no hay pesos en safetensors en este repositorio, por lo que no es adecuado para fine-tuning directo con transformers sin acudir al modelo base.
- El modelo está entrenado y etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- No se han publicado benchmarks; no hay evidencia cuantitativa de calidad frente a alternativas.
- Las cuantizaciones IQ1 e IQ2 degradan notablemente la calidad (la propia model card las describe como "for the desperate" o "very low quality"); para producción se recomienda Q4_K_M o superior.
- Riesgo de alucinación inherente a los modelos de lenguaje; el ajuste por GRPO para estilo no elimina este riesgo.
- Sesgos conocidos: no documentados en la información disponible; al derivar de la familia Gemma, pueden heredarse sesgos del modelo base.
- Longitud de contexto no confirmada; conviene validarla empíricamente antes de desplegar conversaciones largas.
- Licencia Apache 2.0 declarada, lo que permite uso comercial, pero se recomienda verificar las condiciones del modelo base abacusai/Smaug-Humanizer y de la familia Gemma subyacente.
- La model card del repositorio de cuantización es fundamentalmente logística (lista de ficheros y agradecimientos); no sustituye a la documentación del modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Smaug-Humanizer-i1-GGUF
- Modelo base: https://huggingface.co/abacusai/Smaug-Humanizer
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Smaug-Humanizer-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Smaug-Humanizer-i1-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
