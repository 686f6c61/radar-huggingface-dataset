# pranil00/ONIX-OLMo-7B-Instruct-GGUF

## Resumen

ONIX-OLMo-7B-Instruct-GGUF es una cuantización en formato GGUF del modelo allenai/OLMo-7B-Instruct, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo base es un transformer decoder-only de 6.854.344.704 parámetros (6,85 mil millones) entrenado por el Allen Institute for AI (AI2), y esta versión concreta aplica una cuantización Q5_K_M (5,5 bits por peso) que reduce el tamaño de los pesos de 13,41 GB en FP16 a 4,61 GB, con una ratio de compresión de 2,91x.

El paquete está pensado para ejecución en hardware de consumo: según la model card, requiere 6,68 GB de memoria unificada en Apple Silicon, 6,11 GB de VRAM dedicada en GPUs NVIDIA de las series RTX 30/40/50 o 8,68 GB de RAM libre en CPU con soporte AVX2/AVX-512. La ventana de contexto óptima indicada es de 8.192 tokens en GPU y Apple Silicon, y de 4.096 tokens en CPU.

La relevancia de esta ficha es doble: por un lado, permite ejecutar un modelo open source de AI2 en equipos modestos mediante llama.cpp, Ollama o LM Studio; por otro, conviene señalar que la model card contiene afirmaciones de rendimiento (por ejemplo, "97,5% de retención de fidelidad cognitiva") que no están respaldadas por benchmarks publicados ni por una metodología reproducible, por lo que deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo de AI2) |
| Parametros totales | 6.854.344.704 (6,85 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (GPU/Apple Silicon); 4.096 tokens (CPU) según model card |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); única variante publicada en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `allenai--OLMo-7B-Instruct-Q5_K_M.gguf`, 4,61 GB) |

## Arquitectura y entrenamiento

El modelo base allenai/OLMo-7B-Instruct es un transformer decoder-only de la familia OLMo desarrollada por AI2. Esta publicación no incluye detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esa información corresponde a la model card original de allenai/OLMo-7B-Instruct, que no forma parte de la información proporcionada. La arquitectura concreta (número de capas, dimensiones, tipo de atención) tampoco se detalla en esta ficha.

La innovación técnica de esta publicación no está en el modelo, sino en el proceso de cuantización: se ha generado un GGUF Q5_K_M con la herramienta `run-any-model`, un motor de optimización device-aware del propio autor, que según la model card reporta 32/32 capas aceleradas en Metal y una reducción del 56,8% en RAM residente total (de 15,48 GB en FP16 a 6,68 GB en Q5_K_M). No se documenta la metodología de evaluación de calidad más allá de la cifra declarada de "97,5% de retención".

## Capacidades

- Generación de texto conversacional e instructiva, heredada de OLMo-7B-Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (la model card incluye tokens de parada `<|im_end|>` y `<|endoftext|>`).
- Ejecución local en CPU, GPU NVIDIA (CUDA) y Apple Silicon (Metal) mediante llama.cpp, Ollama, LM Studio, Jan o Text-Generation-WebUI.
- Despliegue ligero con contexto de hasta 8.192 tokens en GPU y Apple Silicon.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local en portátil: con 6,68 GB de memoria unificada en un Mac con Apple Silicon, el modelo puede mantener conversaciones multi-turno de hasta 8.192 tokens sin conexión a internet, útil para prototipos y demos privadas.
- Chatbot de soporte en estación de trabajo con GPU de consumo: en una RTX 3060 de 12 GB o superior (6,11 GB de VRAM necesarios) se puede servir un endpoint de generación de texto con llama.cpp u Ollama para pruebas internas de atención al cliente.
- Generación de texto en entornos con CPU: con 8,68 GB de RAM libre y AVX2/AVX-512, el modelo puede ejecutarse en servidores sin GPU para tareas de resumen, redacción o clasificación de baja concurrencia con contexto de 4.096 tokens.
- Evaluación comparativa de cuantizaciones: sirve como referencia práctica para medir la degradación real de un Q5_K_M frente al FP16 del mismo modelo base en tareas concretas del equipo.
- Prototipado de pipelines RAG: al ser un modelo instructivo de 7B con contexto de 8K, se puede integrar en un pipeline de recuperación y generación para responder preguntas sobre documentación interna en local.
- Educación e investigación: permite estudiar el comportamiento de la familia OLMo de AI2 en hardware asequible, sin depender de infraestructura en la nube.
- Integración en herramientas de escritorio: LM Studio, Jan y Text-Generation-WebUI aceptan el fichero GGUF directamente, lo que facilita incorporar el modelo a aplicaciones de escritorio con inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye métricas de compresión y consumo de memoria del propio proceso de cuantización, no evaluaciones de calidad (MMLU, HumanEval, GSM8K u otras):

| Metrica | FP16 (baseline) | Q5_K_M (cuantizado) | Cambio |
|---|---|---|---|
| Precisión de bits | 16,0 bits/param | 5,5 bits/param | -65,6% |
| Tamano de pesos | 13,41 GB | 4,61 GB | -65,6% |
| KV cache | 2.048 MB | 2.048 MB | Optimizado |
| RAM residente total | 15,48 GB | 6,68 GB | -56,8% |
| Calidad estimada | 100% | 97,5% (declarado) | -2,5% |

## Requisitos de hardware

- VRAM estimada para inferencia: 6,11 GB dedicados en GPU NVIDIA según la model card; 6,68 GB de memoria unificada en Apple Silicon; 8,68 GB de RAM libre en CPU.
- GPU recomendadas: cualquier NVIDIA RTX de las series 30/40/50 con al menos 8 GB de VRAM para dejar margen al KV cache; en Apple Silicon, equipos con 16 GB de memoria unificada o más.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores; en Apple Silicon M1/M2/M3/M4/M5 con 16 GB.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y la CLI `run-any-model`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ONIX-OLMo-7B-Instruct-GGUF (esta ficha) | 6,85 B | 8.192 (GPU) / 4.096 (CPU) | Apache 2.0 | GGUF Q5_K_M | Cuantización comunitaria de OLMo-7B-Instruct |
| allenai/OLMo-7B-Instruct (original) | 6,85 B | no disponible en esta ficha | Apache 2.0 | safetensors | Modelo base oficial de AI2, pesos completos |
| Mistral-7B-Instruct (referencia de categoria) | 7,24 B | 32.768 | Apache 2.0 | safetensors, GGUF | Contexto mayor y ecosistema más amplio; datos no verificados en esta ficha |
| Llama 3.1 8B Instruct (referencia de categoria) | 8,03 B | 131.072 | Llama 3.1 Community License | safetensors, GGUF | Mayor contexto y rendimiento general; licencia no Apache |

La comparación con Mistral-7B-Instruct y Llama 3.1 8B se ofrece solo como referencia de categoría; no se dispone de benchmarks del modelo de esta ficha que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La model card declara una "retención de calidad del 97,5%" sin metodología, sin conjunto de evaluación y sin resultados reproducibles; debe considerarse una afirmación no verificada.
- No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) para esta cuantización concreta.
- No se documentan los idiomas soportados; el modelo base OLMo está entrenado mayoritariamente en inglés, pero esta ficha no puede confirmarlo con la información disponible.
- La cuantización Q5_K_M introduce pérdida de precisión respecto al FP16; para tareas sensibles (código, matemáticas, razonamiento largo) conviene validar contra el modelo base.
- El contexto se limita a 8.192 tokens en GPU/Apple Silicon y 4.096 en CPU, muy por debajo de modelos contemporáneos de 7-8B con ventanas de 32K o más.
- No se documenta soporte de tool calling, function calling ni agentes; no debe asumirse.
- La licencia Apache 2.0 del artefacto GGUF es permisiva, pero el uso comercial debe verificar también los términos del modelo base allenai/OLMo-7B-Instruct (Apache 2.0 según la información disponible).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- La model card incluye una cláusula de exención de responsabilidad total sobre los outputs; en producción es responsabilidad del implementador auditar y validar todas las salidas.
- El modelo base OLMo-7B-Instruct es de 2024; frente a modelos de 2025-2026 puede quedar por detrás en razonamiento, código e instrucciones complejas.

## Enlaces

- Hugging Face: https://huggingface.co/pranil00/ONIX-OLMo-7B-Instruct-GGUF
- Modelo base: https://huggingface.co/allenai/OLMo-7B-Instruct
- Organización ONIX: https://huggingface.co/ONIX
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
