# mradermacher/LiquidVamp-R4-1.7B-i1-GGUF

## Resumen

LiquidVamp-R4-1.7B-i1-GGUF es una cuantización en formato GGUF del modelo LiquidVamp-R4-1.7B, publicada por el usuario mradermacher. El modelo original lo desarrolla WamphyreAI y está construido sobre la arquitectura LFM3 (Liquid Foundation Model 3) de Liquid AI, con un tamaño nominal de 1.700 millones de parámetros. Se trata de un ajuste fino (fine-tune) con LoRA sobre el modelo base, orientado a generación de código y uso de herramientas (tool-use), y con la etiqueta "abliterated", que indica que se han eliminado o atenuado los mecanismos de rechazo del modelo original.

La relevancia de esta ficha radica en que el repositorio es una cuantización, no un modelo nuevo: el trabajo de mradermacher consiste en generar archivos GGUF con cuantización ponderada basada en imatrix para facilitar la inferencia en CPU, GPU de consumo y entornos con Vulkan. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los archivos pueden no estar disponibles públicamente o que las métricas no se han actualizado.

Cabe advertir que la información disponible es escasa y en parte contradictoria: el dato de parámetros en safetensors (899.013) no coincide con el tamaño nominal de 1.7B, y la model card del cuantizador no incluye especificaciones técnicas detalladas del modelo base. Esta ficha refleja únicamente lo que consta en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 (Liquid Foundation Model 3), según etiqueta del repo; detalles no disponibles |
| Parametros totales | 1.7B nominal (el campo safetensors indica 899.013, dato inconsistente) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantización ponderada/imatrix; la model card menciona Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en, es |
| Licencia | lfm-open-license-v1.0 (etiquetada como "other") |
| Formato de pesos | GGUF (repo i1-GGUF); el modelo base en safetensors/bf16 |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de WamphyreAI sobre la arquitectura LFM3 de Liquid AI, según las etiquetas del repositorio (lfm3, liquidvamp, wamphyre-ai). Se ha ajustado mediante LoRA (etiqueta lora) y se presenta como "abliterated", una técnica de modificación de pesos que suprime las respuestas de rechazo. Las etiquetas indican también bf16 como precisión del modelo original y "experimental" como estado.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detalla si LFM3 incorpora innovaciones como atención lineal, decodificación especulativa o arquitecturas híbridas; la model card del cuantizador no incluye esos datos. El proceso de cuantización de mradermacher utiliza imatrix (matriz de importancia) para generar cuantizaciones ponderadas, lo que en la práctica mejora la calidad de los cuantos de baja precisión respecto a cuantizaciones estáticas.

## Capacidades

- Generación de texto en inglés y español (idiomas declarados en la model card).
- Generación de código, según la etiqueta "code" del repositorio.
- Uso de herramientas y function calling, según la etiqueta "tool-use".
- Modelo "abliterated": orientado a responder sin los rechazos habituales del modelo base, lo que puede ser útil para investigación sobre alineación, pero con riesgos asociados.
- No se documentan capacidades de visión, audio, thinking mode ni agentes multi-paso.
- No se documenta soporte explícito de razonamiento multi-step más allá de lo que permita el modelo base.

## Casos de uso

- Generación de código en local: al ser un modelo de 1.7B cuantizado en GGUF, puede ejecutarse en portátiles y estaciones de trabajo sin GPU dedicada, integrándose en editores o scripts de autocompletado.
- Asistente de programación en entornos con recursos limitados: su tamaño reducido permite desplegarlo en contenedores pequeños o en el edge, con cuantizaciones Q4_K_M o Q5_K_M para equilibrar calidad y memoria.
- Automatización de tareas con tool calling: la etiqueta "tool-use" sugiere que puede invocar funciones en pipelines de automatización, aunque la falta de benchmarks impide garantizar su fiabilidad en producción.
- Experimentación en investigación sobre modelos abliterated: útil para estudiar el efecto de la supresión de rechazos en modelos pequeños, comparando comportamientos con el modelo base.
- Prototipado rápido en español e inglés: al declarar ambos idiomas, sirve para demos de generación de texto bilingüe en entornos de desarrollo.
- Inferencia en CPU con llama.cpp u Ollama: el formato GGUF y las cuantizaciones IQ permiten ejecución en CPU con requisitos de memoria muy bajos, adecuado para pruebas de concepto.
- Despliegue en entornos Vulkan: la etiqueta "vulkan" indica compatibilidad con backends gráficos, útil en equipos sin CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 1.7B, las cuantizaciones Q4_K_M ocupan aproximadamente 1-1.2 GB, y Q8_0 en torno a 1.8-2 GB; estos valores son estimaciones basadas en el tamaño nominal, no datos publicados en la información proporcionada.
- GPU recomendadas: no disponible en la información; por tamaño, cabría en RTX 3060, RTX 4060, RTX 4090 y GPUs de datacenter como A100 o H100, pero sin datos de throughput publicados.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con 4 GB o más de VRAM, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y otros runners compatibles con GGUF; la etiqueta "endpoints_compatible" sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LiquidVamp-R4-1.7B-i1-GGUF | 1.7B nominal | no disponible | lfm-open-license-v1.0 | GGUF | Cuantización imatrix de un fine-tune abliterated |
| Modelo base LiquidVamp-R4-1.7B | 1.7B nominal | no disponible | lfm-open-license-v1.0 | safetensors/bf16 | Fine-tune LoRA de WamphyreAI |
| Alternativas de 1-2B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- La información técnica es muy escasa: no hay contexto, benchmarks ni detalles de entrenamiento, lo que impide evaluar su calidad real.
- El dato de parámetros en safetensors (899.013) es inconsistente con el tamaño nominal de 1.7B; conviene verificar el modelo base antes de usarlo.
- El repositorio figura con 0 descargas, 0 likes y tamaño 0.0 GB, lo que puede indicar que los archivos no están disponibles o que las métricas no se han actualizado.
- Modelo "abliterated": la supresión de rechazos puede producir contenido inapropiado o inseguro; no recomendado para aplicaciones de cara al público sin filtros adicionales.
- Riesgo de alucinación inherente a modelos pequeños; sin benchmarks no se puede cuantificar.
- Licencia lfm-open-license-v1.0: es una licencia "other" que puede imponer restricciones al uso comercial; es necesario revisar el texto de la licencia antes de desplegar en producción.
- Idiomas limitados a inglés y español; no se garantiza cobertura de otros idiomas.
- Estado "experimental": no apto para producción sin validación previa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LiquidVamp-R4-1.7B-i1-GGUF
- Modelo base: https://huggingface.co/WamphyreAI/LiquidVamp-R4-1.7B
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/LiquidVamp-R4-1.7B-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#LiquidVamp-R4-1.7B-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
