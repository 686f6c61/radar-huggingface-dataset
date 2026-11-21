# mradermacher/Demoscener-7B-GGUF

## Resumen

Demoscener-7B es un modelo de lenguaje de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) especializado en generación de código JavaScript y, más concretamente, en la creación de "dweets": fragmentos de código de 140 caracteres o menos para la plataforma Dwitter. El modelo base es `datavorous/Demoscener-7B`, afinado mediante LoRA sobre el dataset `datavorous/Demoscener-Dweets-25k`, compuesto por 25.000 dweets. La versión aquí descrita es la cuantización GGUF publicada por mradermacher, que facilita su ejecución en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo resuelve un nicho muy concreto: la generación de código creativo ultracompacto para demoscene y arte generativo en JavaScript. No está pensado como un asistente generalista, sino como una herramienta de autocompletado y generación de fragmentos de código que deben funcionar bajo una restricción severa de longitud. Su licencia CC-BY-4.0 permite uso comercial con atribución, lo que lo hace viable en contextos de producción creativa.

La relevancia actual del modelo radica en su especialización extrema: frente a modelos generalistas que rinden peor en dominios muy restringidos, Demoscener-7B ofrece cuantizaciones que van desde 3,1 GB (Q2_K) hasta 15,3 GB (f16), permitiendo desplegarlo en GPU de consumo y en CPU. Está disponible únicamente en inglés y su formato principal es GGUF, con la librería transformers como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer de 7B, detalles no especificados) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base `datavorous/Demoscener-7B`. Por el número de parámetros (7,6 mil millones) y la librería declarada (transformers), se trata presumiblemente de un transformer decoder-only de tamaño 7B, pero no se especifican la longitud de contexto, el número de capas, la dimensionalidad oculta ni el tokenizador empleado. El modelo ha sido afinado mediante LoRA (Low-Rank Adaptation) sobre el dataset `datavorous/Demoscener-Dweets-25k`, compuesto por 25.000 dweets, lo que indica un ajuste supervisado sobre ejemplos de código JavaScript compacto.

No se han publicado datos sobre el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. La única innovación técnica documentada es el proceso de cuantización estática realizado por mradermacher, que genera múltiples variantes GGUF (desde Q2_K hasta f16) sin cuantizaciones ponderadas/imatrix disponibles en el momento de la publicación. El modelo está etiquetado con `code-completion`, `javascript`, `dwitter` y `lora`, lo que confirma su orientación a la generación de código en ese dominio específico.

## Capacidades

- Generación de código JavaScript ultracompacto, orientado a fragmentos de 140 caracteres o menos (dweets).
- Autocompletado de código en el contexto de la plataforma Dwitter y demoscene JavaScript.
- Generación de arte generativo y efectos visuales mediante código creativo.
- Capacidades multilingües limitadas al inglés (etiqueta de idioma `en`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Especialización en un dominio muy restringido: código creativo compacto, no código de producción general.

## Casos de uso

- Generación de dweets para Dwitter: el modelo puede producir fragmentos de JavaScript de 140 caracteres o menos que dibujan efectos visuales en canvas, aprovechando su entrenamiento sobre 25.000 dweets reales. Es adecuado porque ha sido afinado específicamente sobre ese formato y restricción de longitud.

- Asistente de autocompletado en editores para código creativo: integrado mediante llama.cpp o servidores compatibles con la API de OpenAI, puede sugerir continuaciones de código JavaScript compacto mientras el desarrollador escribe efectos visuales o demos.

- Prototipado rápido de arte generativo: el modelo permite generar variantes de efectos visuales en JavaScript que el artista puede probar y refinar, reduciendo el tiempo de exploración creativa en demoscene.

- Educación y aprendizaje de técnicas de código compacto: sirve como herramienta para estudiar cómo se escriben fragmentos de JavaScript extremadamente densos, mostrando patrones de optimización de caracteres.

- Generación de snippets para retos de code golf: aunque su dominio es Dwitter, el modelo puede producir código JavaScript muy compacto útil en competiciones de code golf y ejercicios de optimización.

- Integración en pipelines de generación de contenido creativo: mediante la API compatible con endpoints, puede incorporarse en flujos automatizados que generen catálogos de efectos visuales o variaciones de demos para plataformas web.

- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (3,1 GB) y Q4_K_M (4,8 GB) permiten ejecutar el modelo en portátiles y equipos sin GPU dedicada, facilitando su uso en talleres y entornos educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB para Q2_K, 4,6-4,8 GB para Q4_K_S/Q4_K_M, 5,4-5,5 GB para Q5_K_S/Q5_K_M, 6,4 GB para Q6_K, 8,2 GB para Q8_0 y 15,3 GB para f16. Estas cifras corresponden al tamaño de los archivos GGUF y no incluyen el overhead de contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 para las cuantizaciones más altas; A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en tarjetas con 6-8 GB de VRAM para cuantizaciones Q4 y Q5; en tarjetas con 12-16 GB para Q6_K, Q8_0 e incluso f16.
- Opciones de despliegue: llama.cpp, Ollama, servidores compatibles con la API de OpenAI (endpoints_compatible), y cualquier runtime que soporte GGUF. La librería declarada es transformers para el modelo base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Demoscener-7B-GGUF | 7,6B | no disponible | JavaScript / dweets / demoscene | CC-BY-4.0 | GGUF |
| Modelos generalistas 7B (p. ej. Mistral-7B, Llama-3-8B) | 7-8B | 8k-32k (según modelo) | Propósito general, código, razonamiento | Apache-2.0 / Llama | safetensors, GGUF |
| Modelos de código 7B (p. ej. CodeLlama-7B, Qwen2.5-Coder-7B) | 7B | 16k-128k (según modelo) | Generación de código general | Llama / Apache-2.0 | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo entre Demoscener-7B y estos modelos. La comparativa se limita a parámetros, contexto, licencia y disponibilidad, ya que no se han publicado benchmarks del modelo en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar entrenado sobre un dataset específico de dweets, puede heredar sesgos de esa comunidad y de sus autores.
- Riesgo de alucinación: presente como en cualquier modelo de lenguaje; en un dominio tan restringido, puede generar código JavaScript sintácticamente plausible pero funcionalmente incorrecto o que exceda el límite de 140 caracteres.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide planificar usos que requieran ventanas largas; se recomienda validar empíricamente antes de producción.
- Limitaciones de idioma: el modelo solo soporta inglés según la etiqueta de idioma; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; es necesario citar al autor original y mantener la licencia en obras derivadas.
- Caveat para producción: el modelo está especializado en código creativo compacto, no en código de producción general; no debe usarse como asistente de programación generalista sin validación.
- No se dispone de cuantizaciones ponderadas/imatrix en el momento de la publicación, lo que puede afectar a la calidad relativa de las cuantizaciones de baja precisión.
- El repo tiene 68,1 GB, lo que implica que la descarga completa incluye todas las cuantizaciones; conviene descargar solo el archivo GGUF necesario.

## Enlaces

- [Hugging Face: mradermacher/Demoscener-7B-GGUF](https://huggingface.co/mradermacher/Demoscener-7B-GGUF)
- [Modelo base: datavorous/Demoscener-7B](https://huggingface.co/datavorous/Demoscener-7B)
- [Dataset: datavorous/Demoscener-Dweets-25k](https://huggingface.co/datasets/datavorous/Demoscener-Dweets-25k)
- [Página de overview del modelo en hf.tst.eu](https://hf.tst.eu/model#Demoscener-7B-GGUF)
- [FAQ y solicitudes de cuantización de mradermacher](https://huggingface.co/mradermacher/model_requests)
- [README de referencia de TheBloke sobre uso de GGUF](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Gráfico comparativo de cuantizaciones de ikawrakow](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas de Artefact2 sobre cuantizaciones](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [nethype GmbH](https://www.nethype.de/)
