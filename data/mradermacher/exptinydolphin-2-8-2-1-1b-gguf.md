# mradermacher/ExpTinyDolphin-2.8.2-1.1b-GGUF

## Resumen

ExpTinyDolphin-2.8.2-1.1b-GGUF es la version cuantizada en formato GGUF del modelo QuixiAI/ExpTinyDolphin-2.8.2-1.1b, publicada por mradermacher, un conocido creador de cuantizaciones para el ecosistema llama.cpp. El modelo base es un ajuste fino experimental de la familia TinyDolphin, con aproximadamente 1.100 millones de parametros (1.100.056.576 segun los pesos en safetensors) y entrenado fundamentalmente para ingles.

El repositorio proporciona unicamente pesos estaticos en GGUF (sin cuantizaciones con imatrix, que se alojan en un repositorio separado), lo que lo hace directamente utilizable en herramientas como llama.cpp, Ollama o cualquier runtime compatible con GGUF. Su interes practico reside en ofrecer un modelo de ~1.1B parametros extremadamente ligero (desde 0.5 GB en Q2_K hasta 2.3 GB en f16), apto para entornos con recursos muy limitados o para experimentacion rapida.

No se dispone de informacion publica sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados en el modelo base, mas alla de su procedencia (QuixiAI) y su naturaleza experimental. Esta ficha se limita, por tanto, a los datos verificables del repositorio y a las caracteristicas derivadas del formato GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base QuixiAI/ExpTinyDolphin-2.8.2-1.1b; detalles no disponibles) |
| Parametros totales | 1.100.056.576 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 9.8 GB (todas las cuantizaciones) |
| Cuantizacion con imatrix | Disponible en repositorio separado (i1-GGUF) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base QuixiAI/ExpTinyDolphin-2.8.2-1.1b. Por el nombre y el tamano (~1.1B parametros) se trata presumiblemente de un transformer decoder-only de la familia TinyLlama/TinyDolphin, pero no se confirma en la documentacion proporcionada. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado.

Lo unico verificable es el proceso de cuantizacion realizado por mradermacher: cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf) generadas con llama.cpp a partir del modelo en formato Hugging Face. Se ofrece ademas un conjunto de cuantizaciones con imatrix (weighted/imatrix quants) en el repositorio mradermacher/ExpTinyDolphin-2.8.2-1.1b-i1-GGUF, que suelen ofrecer mejor calidad que las estaticas de tamano equivalente.

## Capacidades

- Generacion de texto en ingles: modelo base de tipo causal LM para continuacion y generacion libre.
- Conversacion: al derivar de la familia Dolphin (ajuste instruccional), se espera soporte de dialogos multi-turno, aunque no se documenta explicitamente en la model card.
- Razonamiento basico y tareas de conocimiento general: limitado por su tamano de ~1.1B parametros.
- No se documenta soporte de tool calling / function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documenta modo thinking, vision ni audio.
- Compatible con endpoints (tag endpoints_compatible) en el ecosistema Hugging Face.

## Casos de uso

- Prototipado rapido en local: gracias a sus cuantizaciones de 0.5-1.3 GB, permite probar pipelines de generacion de texto en portatiles o CPUs sin GPU dedicada, usando llama.cpp u Ollama.
- Experimentacion educativa: util para estudiar el comportamiento de modelos pequenos (~1.1B) en tareas de generacion y comparar el efecto de distintas cuantizaciones (Q2_K frente a Q8_0) sobre la calidad.
- Generacion de texto asistida en entornos embebidos o de bajos recursos: el formato GGUF y el reducido tamano permiten desplegarlo en dispositivos con poca memoria.
- Filtrado y clasificacion de texto simple: tareas de etiquetado o resumen de fragmentos cortos en ingles donde no se requiere alta precision.
- Base para fine-tuning posterior: el modelo base en safetensors (QuixiAI/ExpTinyDolphin-2.8.2-1.1b) puede ajustarse y luego cuantizarse de nuevo a GGUF.
- Evaluacion de herramientas de cuantizacion: util para comparar cuantizaciones estaticas frente a imatrix (i1-GGUF) en un modelo de referencia pequeno.
- Demos y pruebas de integracion: validar el funcionamiento de llama.cpp, Ollama o servidores compatibles con GGUF antes de pasar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.5-0.7 GB en Q2_K/Q4_K_S, 0.8-1.0 GB en Q5_K_M/Q6_K, 1.3 GB en Q8_0 y 2.3 GB en f16 (tamano de archivo; el consumo real en runtime es algo superior por el contexto y las estructuras de llama.cpp).
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.); tambien funciona en CPU.
- Cabe en practicamente cualquier GPU consumer moderna, e incluso en iGPU y en CPU pura con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio, y servidores compatibles con GGUF; el modelo base en safetensors puede usarse con transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano (~1.1B) se espera throughput alto en GPU consumer, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ExpTinyDolphin-2.8.2-1.1b (este) | ~1.1B | no disponible | no disponible | GGUF, safetensors (base) | Hugging Face |
| TinyLlama-1.1B | ~1.1B | 2048 tokens (tipico) | Apache 2.0 | safetensors, GGUF | Hugging Face |
| TinyDolphin-2.8-1.1B | ~1.1B | no disponible | no disponible | safetensors, GGUF | Hugging Face |

La comparativa se limita a la categoria de ~1.1B parametros; no se dispone de datos de rendimiento comparativo para este modelo concreto.

## Limitaciones y advertencias

- Modelo experimental: el nombre "Exp" sugiere caracter experimental; no hay garantias de calidad ni de estabilidad.
- Solo ingles: no se documenta soporte de otros idiomas, incluido el castellano.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible verificar la licencia del modelo base (QuixiAI/ExpTinyDolphin-2.8.2-1.1b) antes de usarlo en produccion.
- Riesgo de alucinacion elevado por su reducido tamano (~1.1B parametros); no apto para tareas que requieran alta fidelidad factual.
- Longitud de contexto desconocida: no se puede planificar su uso en conversaciones o documentos largos sin verificar el modelo base.
- Capacidades avanzadas (tool calling, agentes, vision) no documentadas; no asumir su disponibilidad.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior.
- Repositorio con muy pocas descargas (86) y ningun "like": escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ExpTinyDolphin-2.8.2-1.1b-GGUF
- Repositorio con cuantizaciones imatrix: https://huggingface.co/mradermacher/ExpTinyDolphin-2.8.2-1.1b-i1-GGUF
- Modelo base: https://huggingface.co/QuixiAI/ExpTinyDolphin-2.8.2-1.1b
- Pagina de resumen del autor: https://hf.tst.eu/model#ExpTinyDolphin-2.8.2-1.1b-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
