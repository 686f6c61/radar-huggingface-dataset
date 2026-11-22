# mradermacher/B-and-W_Flycatcher-3AD1E-GGUF

## Resumen

B-and-W_Flycatcher-3AD1E-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo base NLPark/B-and-W_Flycatcher-3AD1E, publicada por el usuario mradermacher. El modelo original es un ajuste fino (fine-tune) de la familia Qwen2.5, tal y como indica la etiqueta `qwen2.5` de la model card, con 14.769.689.664 parámetros totales (aproximadamente 14,8 mil millones) según los pesos en safetensors del modelo base. El repositorio de cuantizaciones ocupa 122 GB y ofrece un abanico de versiones que va desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB).

La relevancia de esta publicación es fundamentalmente práctica: permite ejecutar un modelo de casi 15B parámetros en hardware de consumo mediante llama.cpp y herramientas compatibles con GGUF, sin necesidad de GPU de datacenter. Al tratarse de una cuantización estática (static quants), el autor también publica una variante con cuantización ponderada/imatrix en un repositorio separado, que suele ofrecer mejor relación calidad/tamaño en los niveles bajos.

No se dispone de información sobre el pipeline de la tarea, la longitud de contexto, la composición del dataset de entrenamiento ni los resultados de benchmarks del modelo base en la información proporcionada. La licencia es Apache 2.0, lo que facilita su uso comercial, y los idiomas declarados son chino (zh) e inglés (en).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5, segun etiqueta `qwen2.5`) |
| Parametros totales | 14.769.689.664 (~14,8B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base NLPark/B-and-W_Flycatcher-3AD1E es un fine-tune etiquetado como `qwen2.5`, lo que sitúa su arquitectura en la familia Qwen2.5 de Alibaba: transformers decoder-only con atención causal estándar (no se documenta atención lineal ni arquitecturas híbridas SSM en la información disponible). El recuento de parámetros de 14.769.689.664 corresponde a un modelo denso de aproximadamente 14,8B, coherente con la variante Qwen2.5-14B. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT en el fine-tune.

La contribución de este repositorio no es el entrenamiento sino la cuantización: mradermacher genera cuantizaciones estáticas (no imatrix) con la herramienta de llama.cpp, y publica además una variante i1 (imatrix/ponderada) en un repositorio aparte. Las cuantizaciones IQ (IQ3_XS, IQ3_S, IQ3_M, IQ4_XS) suelen superar en perplejidad a las Q_K de tamaño similar, según la propia model card, que cita el gráfico de ikawrakow y las notas de Artefact2 sobre calidad de cuantización.

## Capacidades

- Generación de texto conversacional: el tag `conversational` indica que el modelo está orientado a diálogo multi-turno.
- Razonamiento y conocimiento general: heredado de la base Qwen2.5-14B, aunque no se documentan capacidades específicas en la información disponible.
- Soporte multilingüe limitado a chino e inglés según los metadatos; no se declara soporte de español.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.
- Inferencia local mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, koboldcpp, etc.).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere uso tras APIs compatibles con OpenAI en despliegues de inferencia.

## Casos de uso

- Despliegue local en estaciones de trabajo: con la cuantización Q4_K_M (9,1 GB) el modelo cabe en una GPU de consumo de 12-16 GB de VRAM, permitiendo prototipado sin coste de API.
- Asistente conversacional en chino e inglés: el tag `conversational` y los idiomas declarados lo hacen adecuado para chatbots bilingües zh/en en entornos con requisitos de privacidad (datos que no salen de la máquina).
- Investigación y evaluación de fine-tunes: al ser una cuantización de un fine-tune comunitario, sirve para comparar el comportamiento del modelo base frente a sus cuantizaciones en tareas de generación.
- Generación de texto por lotes en CPU: las versiones Q3_K_S (6,8 GB) e IQ3_XS (6,5 GB) permiten ejecución en CPU con RAM moderada para tareas de procesamiento de texto no interactivas.
- Experimentación con cuantizaciones: el repositorio ofrece 14 variantes, útil para estudiar la degradación de calidad según el nivel de cuantización en un modelo de ~15B.
- Integración en pipelines con llama.cpp: mediante la API compatible con OpenAI de llama-server se puede sustituir un endpoint remoto por inferencia local en flujos de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~6 GB
  - IQ3_XS / Q3_K_S: ~7 GB
  - Q4_K_M: ~9,5-10 GB
  - Q5_K_M: ~11 GB
  - Q6_K: ~12,5-13 GB
  - Q8_0: ~16-17 GB
- GPU recomendadas: RTX 3060 12 GB o RTX 4070 para Q4_K_M; RTX 4080/4090 (16-24 GB) para Q5/Q6/Q8; A100/H100 solo si se busca throughput alto o contexto muy largo.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q8_0 en tarjetas de 16 GB o más; Q4_K_M es la opción recomendada por el autor ("fast, recommended").
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-server (API compatible con OpenAI). vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| B-and-W_Flycatcher-3AD1E-GGUF (este) | ~14,8B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estáticas de un fine-tune Qwen2.5 |
| Qwen2.5-14B-Instruct (oficial) | ~14,8B | 32.768 tokens (según documentación oficial de Qwen2.5, no verificada en esta ficha) | Apache 2.0 | safetensors, GGUF | Base oficial con benchmarks publicados |
| B-and-W_Flycatcher-3AD1E-i1-GGUF | ~14,8B | no disponible | Apache 2.0 | GGUF | Variante imatrix del mismo modelo, mejor calidad en niveles bajos |

La comparación con Qwen2.5-14B-Instruct se basa en la etiqueta `qwen2.5` del modelo base; no se dispone de confirmación explícita del autor sobre la variante exacta de la que deriva el fine-tune.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo base ni del fine-tune en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje; sin benchmarks publicados no es posible cuantificar su fiabilidad en tareas de razonamiento.
- Idiomas limitados a chino e inglés: el rendimiento en español no está garantizado ni evaluado.
- Longitud de contexto no documentada: no se debe asumir la ventana de 32K de Qwen2.5 sin verificación empírica.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad; el autor recomienda Q4_K_S/Q4_K_M como equilibrio.
- El modelo base es un fine-tune comunitario sin paper ni evaluación publicada; su calidad respecto al Qwen2.5 oficial es desconocida.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original (NLPark/B-and-W_Flycatcher-3AD1E) antes de producción.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/B-and-W_Flycatcher-3AD1E-GGUF
- Modelo base: https://huggingface.co/NLPark/B-and-W_Flycatcher-3AD1E
- Variante imatrix: https://huggingface.co/mradermacher/B-and-W_Flycatcher-3AD1E-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#B-and-W_Flycatcher-3AD1E-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
