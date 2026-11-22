# mradermacher/ToxicityMistral-GGUF

## Resumen

ToxicityMistral-GGUF es la versión cuantizada en formato GGUF del modelo opauloxavier/ToxicityMistral, publicada por mradermacher, un conocido generador de cuantizaciones estáticas de la comunidad. El modelo base es un ajuste fino de la familia Mistral, con 7.241.732.096 parámetros totales (aproximadamente 7,2 mil millones), orientado a la detección y clasificación de contenido tóxico en inglés. La versión GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de GPUs de datacenter.

El repositorio ofrece un conjunto completo de cuantizaciones estáticas que van desde Q2_K (2,8 GB) hasta f16 (14,6 GB), pasando por las recomendadas Q4_K_S y Q4_K_M (4,2 y 4,5 GB respectivamente). Al tratarse de un modelo de 7B, cabe en GPUs de consumo con 6-8 GB de VRAM en cuantizaciones de 4 bits. La licencia Apache 2.0 facilita su uso comercial, aunque el propósito declarado del modelo (clasificación de toxicidad) debe tenerse en cuenta a la hora de desplegarlo.

La relevancia actual del modelo radica en su utilidad como componente de moderación de contenido en pipelines de producción: un modelo de 7B cuantizado a 4 bits puede ejecutarse en local o en servidores modestos, ofreciendo una alternativa autoalojada a las APIs de moderación propietarias. No obstante, la información pública disponible sobre el modelo base es limitada: no se detallan los datos de entrenamiento, el contexto nativo ni los resultados de benchmarks.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Mistral; detalles no disponibles) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de la familia Mistral, según indica el nombre y la model card. Mistral es una arquitectura transformer decoder-only con atención de ventana deslizante (sliding window attention) y activación SwiGLU, aunque la model card no confirma explícitamente la variante exacta ni la longitud de contexto nativa. El número de parámetros (7,24 mil millones) es consistente con Mistral 7B.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos ni si se aplicaron técnicas de RLHF, DPO o fine-tuning supervisado. El nombre del modelo (ToxicityMistral) sugiere que el ajuste fino se orientó a la detección o clasificación de toxicidad, pero la model card no documenta la metodología. Las cuantizaciones son estáticas (no hay cuantizaciones ponderadas/imatrix disponibles según el autor), generadas con el pipeline habitual de mradermacher a partir de los pesos en formato Hugging Face.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational` del repositorio.
- Detección y clasificación de contenido tóxico (propósito inferido del nombre del modelo base; no documentado explícitamente).
- Compatible con endpoints de inferencia (`endpoints_compatible` en las etiquetas).
- Ejecución local mediante llama.cpp y herramientas derivadas (Ollama, LM Studio, etc.).
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Moderación de contenido autoalojada: desplegar el modelo en cuantización Q4_K_M (4,5 GB) en un servidor con GPU de consumo para clasificar mensajes de usuarios en inglés y filtrar toxicidad antes de publicarlos, evitando dependencias de APIs externas.
- Filtrado previo en pipelines de datos: procesar grandes volúmenes de texto en inglés para detectar y excluir contenido tóxico antes de usarlo en el entrenamiento de otros modelos, ejecutando la cuantización Q4_K_S en CPU o GPU modesta.
- Investigación en seguridad de IA: estudiar el comportamiento del modelo ante prompts adversariales y analizar sus patrones de clasificación de toxicidad en entornos controlados.
- Prototipado rápido de clasificadores: usar el modelo como base para experimentos de clasificación de texto en inglés, aprovechando la licencia Apache 2.0 para modificarlo y redistribuirlo.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local, el modelo permite analizar conversaciones sensibles sin enviar datos a servicios de terceros, algo relevante en sectores regulados.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantización, lo que permite medir el impacto de la compresión en la calidad de clasificación para elegir el equilibrio adecuado entre tamaño y precisión.
- Integración en chatbots como capa de seguridad: colocar el modelo como filtro posterior a las respuestas de un asistente conversacional en inglés para detectar salidas inapropiadas antes de mostrarlas al usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni de clasificación de toxicidad, y tampoco se dispone de datos del modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB (Q2_K), 4,5-5 GB (Q4_K_M), 6-7 GB (Q6_K), 8-9 GB (Q8_0) y 15-16 GB (f16), sumando overhead de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 para cuantizaciones altas; A100/H100 solo si se busca throughput elevado o f16 con contexto largo.
- Cabe en GPU de consumo: sí, desde una GTX 1660 6 GB (Q4_K_S) hasta una RTX 4090 (f16). Las cuantizaciones Q2_K y Q3_K pueden ejecutarse incluso en iGPU con memoria unificada.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y servidores compatibles con GGUF. Para el modelo base en safetensors: transformers, vLLM o TGI.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización elegida. Las cuantizaciones Q4_K_S y Q4_K_M están marcadas por el autor como "fast, recommended".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ToxicityMistral-GGUF | 7,24 B | no disponible | Apache 2.0 | GGUF | Orientado a toxicidad; solo inglés |
| Mistral-7B-Instruct (GGUF) | 7,24 B | 32 K (según model card oficial) | Apache 2.0 | GGUF | Base generalista; contexto documentado |
| Llama Guard 3 (8B) | ~8 B | 128 K (según model card oficial) | Llama 3 Community License | safetensors/GGUF | Moderación oficial de Meta; multilingüe |
| Qwen2.5-7B-Instruct (GGUF) | 7,6 B | 128 K (según model card oficial) | Apache 2.0 | GGUF | Multilingüe; capacidades generales |

La comparación con Llama Guard 3 y Qwen2.5 es orientativa: no se dispone de benchmarks del modelo evaluado que permitan una comparación cuantitativa de rendimiento en tareas de moderación.

## Limitaciones y advertencias

- No se documentan los datos de entrenamiento ni la metodología del ajuste fino, lo que dificulta evaluar sesgos y robustez.
- Riesgo de alucinación inherente a los modelos de 7B, especialmente en tareas de clasificación fuera de dominio.
- El modelo está entrenado únicamente en inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- La longitud de contexto no está documentada, lo que impide planificar despliegues con entradas largas.
- El propósito de detección de toxicidad puede generar falsos positivos o falsos negativos; no debe usarse como único mecanismo de moderación en producción.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base y de los datos de ajuste fino antes de un uso comercial.
- Las cuantizaciones estáticas de baja precisión (Q2_K, Q3_K) pueden degradar la calidad de clasificación; se recomienda validar con datos propios.
- El repositorio tiene muy pocas descargas (52) y ningún "like", lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ToxicityMistral-GGUF
- Modelo base: https://huggingface.co/opauloxavier/ToxicityMistral
- Página de descargas del autor: https://hf.tst.eu/model#ToxicityMistral-GGUF
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
