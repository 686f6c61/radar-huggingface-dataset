# mradermacher/Datumo-Guard-12b-v0.3-GGUF

## Resumen

Datumo-Guard-12b-v0.3-GGUF es la distribución en formato GGUF del modelo Datumo-Guard-12b-v0.3, publicada por el cuantizador mradermacher (nethype GmbH). No se trata de un modelo entrenado por el autor del repositorio, sino de una conversión a GGUF del checkpoint original de Datumo, pensada para ejecución local con llama.cpp y derivados. El modelo cuenta con 11.766.034.176 parámetros (unos 11,77 mil millones) según los pesos en safetensors del repositorio base.

El nombre y la nomenclatura del modelo apuntan a un uso como guardrail o clasificador de seguridad, y la etiqueta "conversational" del repositorio sugiere un formato de interacción por turnos. Sin embargo, la model card publicada no documenta la arquitectura, la longitud de contexto, el proceso de entrenamiento ni los datos utilizados, por lo que cualquier afirmación sobre su comportamiento real excede lo verificable con la información disponible.

La relevancia práctica del repositorio es la disponibilidad de 12 cuantizaciones K-quant estáticas (de Q2_K a Q8_0, más f16) y dos ficheros `mmproj` que actúan como suplemento multimodal. El repositorio acumula 266 descargas y 1 like, y su licencia no está declarada en la información disponible, lo que condiciona cualquier evaluación para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la model card) |
| Parámetros totales | 11.766.034.176 (≈11,77 mil millones) |
| Parámetros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ficheros mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors vía transformers |
| Modelo base | datumo/Datumo-Guard-12b-v0.3 (referencia adicional a la variante `...-lagacy` en las etiquetas) |
| Tamaño del repositorio | 83,9 GB (incluye todas las cuantizaciones) |
| Librería declarada | transformers |
| Etiquetas | gguf, en, conversational, endpoints_compatible, region:us |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la documentación disponible. La model card del repositorio GGUF se limita a describir el proceso de cuantización y no incluye detalles sobre el tipo de transformer, la atención utilizada, si emplea mezcla de expertos o cualquier otra innovación estructural. El recuento de 11,77 mil millones de parámetros y la existencia de un modelo base en safetensors son los únicos datos técnicos verificables.

Tampoco hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, las técnicas de alineación empleadas (RLHF, DPO u otras) ni procesos de ajuste específicos para tareas de guardrail. Los ficheros `mmproj` incluidos en el repositorio indican que el modelo base incorpora algún tipo de proyector multimodal compatible con llama.cpp, pero la card no detalla qué modalidad cubre ni con qué codificador visual.

En cuanto al proceso de cuantización, el autor indica que se trata de cuantizaciones estáticas (`quantize_version: 2`, `output_tensor_quantised: 1`, conversión `hf`) y señala explícitamente que no hay cuantizaciones ponderadas con imatrix disponibles en el momento de la publicación, aunque pueden solicitarse mediante una discusión en la comunidad.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` y la librería `transformers` indican compatibilidad con pipelines de diálogo por turnos, aunque el formato exacto de prompt no está documentado.
- Función de guardrail: el nombre del modelo sugiere un uso orientado a moderación, filtrado o clasificación de seguridad, si bien la card no describe el formato de salida ni las categorías que cubre.
- Capacidad multimodal potencial: la presencia de ficheros `mmproj` (Q8_0 y f16) apunta a soporte de entrada multimodal en el modelo base, sin que se detalle la modalidad concreta.
- Multilingüismo: limitado al inglés según la etiqueta de idioma del repositorio; no se declaran otros idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" o razonamiento explícito: no disponible en la información proporcionada.

## Casos de uso

- Filtrado de entradas en aplicaciones de chat: desplegar el modelo como capa previa al LLM principal para clasificar mensajes de usuario y bloquear contenido no permitido, aprovechando su naturaleza de guardrail y su tamaño de 12B, que permite ejecución local sin depender de APIs externas.
- Moderación de salidas de modelos generativos: situar el modelo como verificador posterior sobre las respuestas de otro LLM en un pipeline de dos etapas, de modo que las respuestas marcadas se descarten o se regeneren antes de llegar al usuario final.
- Moderación por lotes de corpus y datasets: procesar grandes volúmenes de texto con llama.cpp en CPU o GPU única para etiquetar o filtrar datasets de entrenamiento y evaluación, usando cuantizaciones Q4_K_M o Q5_K_M para maximizar el rendimiento por vatio.
- Evaluación de robustez y red teaming: emplear el modelo como clasificador de referencia al probar intentos de jailbreak o prompts adversarios contra otro sistema, comparando la puntuación del guard con la del modelo atacado.
- Despliegue en entornos con requisitos de soberanía del dato: al poder ejecutarse íntegramente en infraestructura propia con pesos GGUF, encaja en escenarios donde el texto no puede salir del perímetro de la organización (sanidad, legal, sector público).
- Prototipado rápido en estación de trabajo: con la cuantización Q4_K_M (7,4 GB) el modelo cabe en una GPU de consumo de 12 GB, lo que permite iterar sobre umbrales y prompts de moderación sin aprovisionar hardware de centro de datos.
- Integración en pasarelas de API compatibles: la etiqueta `endpoints_compatible` facilita exponerlo detrás de una interfaz tipo OpenAI para que las aplicaciones existentes lo consuman como un servicio más de clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni de tareas de moderación (por ejemplo, precisión y recall en clasificación de contenido dañino). Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada según cuantización (pesos + overhead moderado de caché KV):

| Cuantización | Tamaño del fichero (GB) | VRAM estimada (GB) |
|---|---|---|
| f16 | ≈23,5 (derivado de 11,77B × 2 bytes) | 26-28 |
| Q8_0 | 12,6 | 14-16 |
| Q6_K | 9,8 | 12-14 |
| Q5_K_M | 8,5 | 11-13 |
| Q4_K_M | 7,4 | 9-11 |
| IQ4_XS | 6,7 | 8-10 |
| Q3_K_M | 6,1 | 8-9 |
| Q2_K | 4,9 | 6-7 |

- GPU de centro de datos: A100 (40 o 80 GB) y H100 permiten ejecutar f16 o Q8_0 con contexto amplio y varios workers concurrentes; también L40S (48 GB) para Q8_0 con holgura.
- GPU de consumo: RTX 4090 (24 GB) ejecuta Q8_0 sin dificultad y f16 solo con contexto reducido u offload parcial; RTX 4080/4070 Ti Super (16 GB) quedan en Q6_K o Q5_K_M; RTX 3060 12 GB y RTX 4070 (12 GB) en Q4_K_M; tarjetas de 8 GB en Q3_K_M o Q2_K con contexto corto.
- Ejecución en CPU: las cuantizaciones Q2_K a Q4_K_M son viables en CPU con 8-16 GB de RAM libre, a costa de latencia mucho mayor; el modelo completo en f16 requiere ~24 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con la API de llama.cpp. vLLM ofrece soporte GGUF limitado y no es la vía recomendada para este formato; TGI no soporta GGUF. Para el modelo base en safetensors sí aplican transformers, TGI o vLLM.
- Latencia y throughput: no disponible; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificables de otros modelos de guardrail comparables en la información proporcionada, por lo que no se pueden contrastar parámetros, contexto ni rendimiento con alternativas. La comparación posible se limita a las variantes del propio modelo:

| Modelo | Parámetros | Formato | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| mradermacher/Datumo-Guard-12b-v0.3-GGUF | 11,77 B | GGUF (Q2_K–Q8_0, f16) + mmproj | no disponible | no disponible | Cuantizaciones estáticas, sin imatrix |
| datumo/Datumo-Guard-12b-v0.3 | 11,77 B | safetensors | no disponible | no disponible | Checkpoint original en transformers |
| datumo/Datumo-Guard-12b-v0.3-lagacy | no disponible | no disponible | no disponible | no disponible | Variante referenciada en las etiquetas del repositorio |

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita no se puede asumir permiso para uso comercial, redistribución o modificación; es imprescindible contactar con Datumo antes de integrarlo en producción.
- Solo inglés: la etiqueta de idioma es `en`, por lo que el comportamiento en castellano u otras lenguas no está garantizado ni evaluado.
- Ausencia total de benchmarks: no hay evidencia publicada sobre precisión, recall o tasa de falsos positivos en tareas de moderación, lo que impide estimar su calidad frente a alternativas.
- Riesgo de alucinación y de clasificación errónea: si el modelo se usa como guardrail, los falsos negativos (contenido dañino no detectado) son un riesgo de seguridad directo; se recomienda calibrar umbrales con un conjunto de validación propio antes de desplegarlo.
- Formato de prompt y de salida no documentados: la card no especifica plantilla de chat, tokens especiales ni estructura de la respuesta, lo que puede provocar comportamiento degradado si se usa con una plantilla genérica.
- Cuantizaciones estáticas sin imatrix: el propio autor advierte de que no hay cuantizaciones ponderadas disponibles, por lo que en Q2_K y Q3_K la pérdida de calidad puede ser mayor que en equivalentes con imatrix.
- Fecha de creación y actualización del repositorio (diciembre de 2025 y octubre de 2026) no aportan información sobre la versión real de los pesos más allá de la nomenclatura v0.3.
- Soporte multimodal incierto: la existencia de ficheros `mmproj` no implica que la funcionalidad esté validada con este modelo; conviene probarla antes de asumirla.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Datumo-Guard-12b-v0.3-GGUF
- Modelo base: https://huggingface.co/datumo/Datumo-Guard-12b-v0.3
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#Datumo-Guard-12b-v0.3-GGUF
- Peticiones de cuantización y FAQ del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de perplejidad entre tipos de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
