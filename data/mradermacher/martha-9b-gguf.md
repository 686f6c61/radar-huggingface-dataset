# mradermacher/MARTHA-9B-GGUF

## Resumen

MARTHA-9B-GGUF es la distribucion en formato GGUF del modelo ZERO-POINT-AI/Miss_MARTHA-9B-Qwen3.5-Omni, publicada por el usuario mradermacher, especializado en cuantizaciones estaticas de modelos abiertos. El modelo base es un transformer denso de 8.953.803.264 parametros (aproximadamente 9B) derivado de la familia Qwen3.5-Omni, orientado a generacion conversacional, codigo y contenido para adultos. Esta version GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, algo inviable con los pesos originales en precision completa.

La relevancia de esta ficha radica en que el repositorio ofrece un abanico completo de cuantizaciones (desde Q2_K de 3,7 GB hasta f16 de 18 GB), lo que facilita el despliegue local en GPU de gama media y en CPU. El modelo declara soporte para nueve idiomas (ingles, chino, coreano, tailandes, espanol, frances, aleman, japones y mongol) y se distribuye bajo licencia Apache 2.0.

No obstante, la informacion publica es limitada: la model card del repositorio GGUF es una plantilla estandar de mradermacher que no detalla arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Ademas, el modelo incluye etiquetas explicitas de contenido NSFW y "adults only", lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-Omni; detalles internos no disponibles) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh, ko, th, es, fr, de, ja, mn |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base, ZERO-POINT-AI/Miss_MARTHA-9B-Qwen3.5-Omni, es un transformer denso de aproximadamente 9B parametros construido sobre la familia Qwen3.5-Omni. La nomenclatura "Omni" sugiere capacidades multimodales en el modelo original, aunque la model card del repositorio GGUF no confirma ni detalla que modalidades estan activas. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado.

La contribucion tecnica de este repositorio es exclusivamente la cuantizacion: mradermacher ha generado cuantizaciones estaticas (no imatrix) mediante llama.cpp, con el flag `skip_mmproj: 1`, lo que indica que los tensores del proyector multimodal se han omitido en los ficheros GGUF. En consecuencia, las capacidades multimodales del modelo base probablemente no esten disponibles en estas cuantizaciones. Existe una version con cuantizaciones ponderadas/imatrix en el repositorio mradermacher/MARTHA-9B-i1-GGUF, que suele ofrecer mejor calidad por bit.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational`.
- Generacion de codigo, segun la etiqueta `code` del repositorio.
- Soporte multilingue para nueve idiomas: ingles, chino, coreano, tailandes, espanol, frances, aleman, japones y mongol.
- Capacidades multimodales potenciales heredadas de Qwen3.5-Omni, no confirmadas en la version GGUF (el proyector multimodal se omite con `skip_mmproj: 1`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con APIs de inferencia tipo OpenAI.
- Generacion de contenido para adultos (etiquetas `nsfw`, `adults only`, `not-for-all-audiences`).
- No se ha documentado soporte explicito de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantizacion Q4_K_M (5,7 GB), el modelo cabe en GPU de consumo de 8 GB o superiores, permitiendo inferencia privada sin conexion a servicios en la nube.
- Generacion de codigo asistida en IDE: la etiqueta `code` indica capacidad para autocompletado y generacion de fragmentos; puede integrarse en plugins locales mediante llama.cpp u Ollama.
- Prototipado de chatbots multilingues: el soporte de nueve idiomas permite construir asistentes conversacionales para mercados de Asia oriental, Europa y Asia central sin multiples modelos.
- Investigacion sobre modelos pequenos: util para experimentos academicos que requieran un modelo de aproximadamente 9B ejecutable en hardware limitado, con licencia Apache 2.0 permisiva.
- Generacion de contenido creativo para adultos: el modelo esta explicitamente etiquetado para este fin, aunque requiere moderacion y cumplimiento normativo por parte del operador.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes que permiten estudiar el compromiso entre tamano, velocidad y calidad en un mismo modelo.
- Fine-tuning sobre la version f16: los pesos f16 (18 GB) pueden servir como base para ajuste fino adicional, aunque el formato GGUF no es el ideal para entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se proporcionan datos del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion):
  - Q2_K (3,7 GB): aproximadamente 4-5 GB de VRAM.
  - Q4_K_M (5,7 GB): aproximadamente 6-7 GB de VRAM.
  - Q8_0 (9,6 GB): aproximadamente 10-11 GB de VRAM.
  - f16 (18 GB): aproximadamente 18-20 GB de VRAM.
- GPU recomendadas:
  - Consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 24 GB.
  - Profesional: A100 40/80 GB, H100, L40S.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB con cuantizaciones Q4/Q5; las cuantizaciones Q2/Q3 caben en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. Para el modelo base en safetensors: vLLM, TGI, transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MARTHA-9B-GGUF | ~9B | No disponible | Apache 2.0 | GGUF | Multilingue (9 idiomas), etiquetado NSFW |
| Qwen2.5-7B-Instruct | ~7,6B | 128K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Referencia de la familia Qwen; benchmarks publicos |
| Llama 3.1 8B Instruct | ~8B | 128K | Llama 3.1 Community License | safetensors, GGUF | Restricciones de licencia para uso comercial |
| Mistral 7B Instruct | ~7,3B | 32K | Apache 2.0 | safetensors, GGUF | Amplia adopcion y ecosistema de cuantizaciones |

La comparacion con Qwen2.5-7B, Llama 3.1 8B y Mistral 7B es orientativa por tamano y categoria; no se dispone de datos de rendimiento de MARTHA-9B que permitan una comparacion cuantitativa. La ventaja principal de MARTHA-9B es su cobertura de nueve idiomas y su licencia Apache 2.0, frente a las restricciones de Llama 3.1.

## Limitaciones y advertencias

- Contenido NSFW: el modelo esta etiquetado como `nsfw`, `adults only` y `not-for-all-audiences`; no es adecuado para aplicaciones dirigidas a menores ni para entornos sin moderacion.
- Ausencia de benchmarks: no hay datos publicos que permitan validar su calidad frente a alternativas; el rendimiento real es desconocido.
- Proyector multimodal omitido: las cuantizaciones GGUF excluyen `mmproj`, por lo que las capacidades multimodales del modelo base probablemente no funcionan.
- Riesgo de alucinacion: no cuantificado ni documentado; al ser un modelo de aproximadamente 9B, es esperable un riesgo moderado-alto en tareas de conocimiento factual.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar aplicaciones con ventanas largas.
- Idiomas de bajos recursos: el soporte de tailandes y mongol no esta validado con evaluaciones publicas; la calidad puede ser inferior a la de ingles o chino.
- Licencia Apache 2.0: permisiva para uso comercial, pero el operador asume la responsabilidad legal sobre el contenido generado, especialmente el de caracter adulto.
- Modelo derivado: la trazabilidad del entrenamiento y los datos originales no esta documentada en el repositorio, lo que dificulta auditorias de sesgo y procedencia.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/MARTHA-9B-GGUF
- Modelo base: https://huggingface.co/ZERO-POINT-AI/Miss_MARTHA-9B-Qwen3.5-Omni
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/MARTHA-9B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#MARTHA-9B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
