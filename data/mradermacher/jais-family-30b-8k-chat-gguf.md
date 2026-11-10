# mradermacher/jais-family-30b-8k-chat-GGUF

## Resumen

El repositorio `mradermacher/jais-family-30b-8k-chat-GGUF` contiene una colección de cuantizaciones estáticas en formato GGUF del modelo `inception42/jais-family-30b-8k-chat`, un LLM causal decoder-only de aproximadamente 30.817 millones de parámetros (30,8 B) especializado en árabe e inglés. El trabajo de cuantización lo firma mradermacher, que publica los pesos listos para su uso con llama.cpp y herramientas compatibles, mientras que el modelo base original proviene de inception42. El objetivo es claro: hacer desplegable en hardware de consumo un modelo de 30 B que de otro modo requeriría GPUs de datacenter con decenas de GB de VRAM.

La relevancia actual del artefacto es doble. Por un lado, ofrece una vía práctica para ejecutar un modelo bilingüe árabe-inglés de tamaño medio-grande en local, algo poco habitual en el ecosistema abierto, donde la oferta de modelos con calidad contrastada en árabe es limitada. Por otro, la licencia Apache 2.0 del modelo base permite uso comercial sin las restricciones de otros modelos abiertos, lo que lo convierte en candidato para productos dirigidos al mercado arabófono.

La ficha describe fundamentalmente el artefacto cuantizado (los ficheros GGUF y sus tipos de cuantización) y, en la medida en que la información disponible lo permite, el modelo base subyacente. Cualquier dato no confirmado en la información proporcionada se marca explícitamente como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (familia jais-family); detalles internos no disponibles |
| Parámetros totales | 30.817.712.064 (30,8 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens (deducido del identificador `8k` del modelo base; no confirmado en la model card) |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | Árabe (ar), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantización estática); el modelo base original se distribuye en safetensors |
| Tamaño del repositorio | 271,1 GB (incluye todas las variantes de cuantización) |
| Rango de tamaño de los GGUF | 21,8 GB (Q2_K) a 33,2 GB (Q6_K) |
| Cuantizaciones ponderadas / imatrix | Disponibles en repositorio separado (`jais-family-30b-8k-chat-i1-GGUF`) |
| Compatibilidad | llama.cpp y endpoints compatibles; etiqueta `endpoints_compatible` |
| Biblioteca declarada | transformers |

## Arquitectura y entrenamiento

El modelo base es un transformer causal decoder-only de la familia jais, orientado a generación de texto conversacional en árabe e inglés. La información proporcionada no detalla el número de capas, la dimensión oculta, el mecanismo de atención (si es multi-head estándar, GQA o similar), ni la composición exacta del dataset de entrenamiento, el número de tokens vistos o si se aplicaron fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas más allá de la propia arquitectura transformer. Estos datos deben consultarse en la model card del modelo base `inception42/jais-family-30b-8k-chat`, que no forma parte de la información disponible en esta ficha.

El artefacto que nos ocupa es el resultado del proceso de cuantización llevado a cabo por mradermacher sobre los pesos originales en safetensors. Se trata de cuantizaciones estáticas (no ponderadas) generadas con el conversor de llama.cpp, con `quantize_version: 2` y `output_tensor_quantised: 1` según los metadatos del README. El autor mantiene además un repositorio paralelo con cuantizaciones ponderadas mediante imatrix, que suelen ofrecer mejor relación calidad/tamaño que las estáticas equivalentes. El sufijo `8k` del nombre indica una ventana de contexto de 8.192 tokens, coherente con la nomenclatura habitual de la familia jais.

## Capacidades

- Generación de texto conversacional multi-turno en árabe e inglés, con etiqueta `conversational` en el repositorio.
- Modelado de lenguaje causal (`causal-lm`), apto para completado y continuación de texto.
- Capacidad bilingüe declarada: árabe (ar) e inglés (en).
- No se documenta en la información disponible soporte de tool calling o function calling.
- No se documenta soporte explícito de agentes o razonamiento multi-paso.
- No se documenta modo de razonamiento (thinking mode), visión, audio ni otras modalidades.
- No se documentan capacidades específicas de código o matemáticas más allá de las que pueda ofrecer un LLM generalista de su tamaño.

## Casos de uso

- Asistente conversacional en árabe para atención al cliente: el modelo puede mantener diálogos multi-turno con hasta 8.192 tokens de contexto, suficiente para conservar el historial de una conversación de soporte y el contexto del producto o la cuenta del usuario, sin necesidad de infraestructura en la nube.
- Traducción y adaptación de contenido entre árabe e inglés: al estar entrenado en ambos idiomas, puede emplearse para traducción asistida, localización de documentación o generación de versiones bilingües de textos corporativos.
- Despliegue en local con llama.cpp: gracias a las cuantizaciones Q4_K_M (28,0 GB) y Q3_K_M (25,2 GB), es viable ejecutarlo en estaciones de trabajo con una o dos GPUs de consumo de 24 GB, o en configuraciones con CPU y RAM abundante, para prototipado y pruebas de concepto sin coste de API.
- Generación de contenido editorial en árabe: redacción de borradores de artículos, resúmenes y publicaciones para medios o marketing dirigidos al mercado arabófono, con revisión humana posterior.
- Investigación en PLN árabe: evaluación comparativa de modelos abiertos en tareas de generación y comprensión en árabe, usando las distintas cuantizaciones para estudiar la degradación de calidad según el nivel de compresión.
- Chatbot embebido en aplicaciones de escritorio o edge: la variante Q2_K (21,8 GB) permite integrar el modelo en entornos con recursos limitados donde no es posible usar el modelo completo en FP16 (que requeriría del orden de 60 GB o más).
- Fine-tuning ligero o adaptación con LoRA sobre el modelo base: aunque el artefacto GGUF no es el formato ideal para entrenamiento, el modelo base en safetensors (Apache 2.0) puede adaptarse a dominios concretos y posteriormente cuantizarse de nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio cuantizado no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas de rendimiento frente a otros modelos. Tampoco se proporcionan datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto y KV cache):
  - Q2_K: ~22 GB
  - Q3_K_M: ~25 GB
  - Q4_K_M: ~28 GB
  - Q5_K_M: ~31 GB
  - Q6_K: ~33 GB
- GPU recomendadas: para Q4_K_M o superiores, una GPU de 40 GB (A100 40GB, A6000) o dos GPUs de 24 GB (RTX 3090/4090) con reparto de capas. Para Q2_K o Q3_K_S, una única RTX 3090/4090 de 24 GB puede ser suficiente, con margen ajustado para el contexto.
- ¿Cabe en GPU de consumo? Sí, en RTX 3090/4090 (24 GB) con cuantizaciones Q2_K y Q3_K_S; para Q4_K_M en adelante se recomienda repartir entre dos GPUs o usar descarga a RAM.
- Opciones de despliegue: llama.cpp (referencia principal para GGUF), Ollama, LM Studio, y servidores compatibles con la API de OpenAI mediante llama.cpp. No se menciona soporte de vLLM o TGI para este formato en la información disponible.
- Latencia y throughput: no disponibles. Dependerán del hardware, del tamaño de la cuantización y de la longitud de contexto utilizada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| jais-family-30b-8k-chat (este, GGUF) | 30,8 B | 8.192 (según identificador) | ar, en | Apache 2.0 | GGUF | Cuantizaciones estáticas Q2_K a Q6_K; variantes imatrix en repo aparte |
| Modelo base inception42/jais-family-30b-8k-chat | 30,8 B | 8.192 (según identificador) | ar, en | Apache 2.0 | safetensors | Pesos originales sin cuantizar; referencia para fine-tuning |
| Otros modelos abiertos bilingües árabe-inglés de ~30 B | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas concretas (por ejemplo, modelos de la familia Jais de otros tamaños, AceGPT, o modelos multilingües generalistas) sin inventar datos. Se recomienda consultar la model card del modelo base y la documentación de la familia jais para obtener comparativas publicadas por los autores.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como todo LLM entrenado con datos web, es probable que herede sesgos de género, religiosos, políticos y culturales, especialmente sensibles en el contexto arabófono. No hay evaluación de sesgos publicada en esta ficha.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala; no se han publicado evaluaciones de factualidad. En producción debe combinarse con verificación de fuentes y filtros de salida.
- Limitaciones de contexto: la ventana de 8.192 tokens, aunque suficiente para muchas aplicaciones, es reducida frente a modelos actuales con 32K, 128K o más. Conversaciones o documentos largos requerirán truncado o resumen previo.
- Limitaciones de idioma: solo se declaran árabe e inglés. El rendimiento en otros idiomas, incluido el castellano, no está garantizado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y sin garantías. Debe conservarse el aviso de licencia y el archivo NOTICE si existe. Verificar la licencia del modelo base original por si hubiera condiciones adicionales no reflejadas aquí.
- Caveat de cuantización: las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M) degradan notablemente la calidad; el propio autor marca Q3_K_M como "lower quality". Para producción se recomienda Q4_K_M o superior, o las variantes imatrix del repositorio `i1`.
- Caveat de despliegue: el formato GGUF está pensado para llama.cpp y derivados; no es compatible directamente con vLLM o TGI sin conversión. El rendimiento en GPUs de consumo con 24 GB requerirá descarga parcial a RAM para cuantizaciones de 4 bits o superiores.
- Fecha de creación del repositorio: marzo de 2025; última actualización en noviembre de 2026. Verificar que las versiones de llama.cpp utilizadas soportan la versión de quantize indicada (`quantize_version: 2`).

## Enlaces

- Repositorio Hugging Face (cuantizaciones estáticas): https://huggingface.co/mradermacher/jais-family-30b-8k-chat-GGUF
- Repositorio de cuantizaciones ponderadas / imatrix: https://huggingface.co/mradermacher/jais-family-30b-8k-chat-i1-GGUF
- Modelo base original: https://huggingface.co/inception42/jais-family-30b-8k-chat
- Página de descargas del autor para este modelo: https://hf.tst.eu/model#jais-family-30b-8k-chat-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Empresa del autor: https://www.nethype.de/
