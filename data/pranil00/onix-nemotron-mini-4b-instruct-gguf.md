# pranil00/ONIX-Nemotron-Mini-4B-Instruct-GGUF

## Resumen

ONIX-Nemotron-Mini-4B-Instruct-GGUF es una cuantización en formato GGUF del modelo nvidia/Nemotron-Mini-4B-Instruct, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto emplea el esquema de cuantización Q5_K_M (5,5 bits por peso) y reduce el tamaño de los pesos de 9,97 GB en FP16 a 3,43 GB, lo que supone una compresión de 2,91x (65,6 % de reducción) y permite ejecutar el modelo en hardware de consumo.

El modelo base es un transformer de la familia Nemotron desarrollado por NVIDIA, con 5.096.275.968 parámetros totales según la model card del autor de la cuantización (aunque el nombre comercial lo etiqueta como "4B"). La cuantización está pensada para ejecución multiplataforma mediante la herramienta run-any-model, con soporte declarado para Metal en Apple Silicon, CUDA en GPUs NVIDIA y CPU con AVX2/AVX-512.

La relevancia de esta ficha es práctica: ofrece una vía de despliegue local de un modelo instructivo de NVIDIA en equipos con 4-6 GB de memoria, a costa de una pérdida de calidad declarada del 2,5 % respecto al baseline FP16. No obstante, la información técnica disponible es escasa y proviene casi exclusivamente de la model card del cuantizador, no de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Nemotron) |
| Parametros totales | 5.096.275.968 (5,10 B) segun model card del cuantizador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens en GPU/Apple Silicon; 4.096 tokens en CPU segun la model card |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); otras cuantizaciones no disponibles en este repo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero nvidia--Nemotron-Mini-4B-Instruct-Q5_K_M.gguf) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de la familia Nemotron de NVIDIA, según declara la model card del cuantizador. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o instrucción supervisada en el modelo original. Tampoco se detalla si emplea innovaciones como atención lineal, decodificación especulativa o mezcla de expertos; la etiqueta "transformer" y la ausencia de parámetros activos sugieren una arquitectura densa convencional.

La contribución técnica de este artefacto no está en el entrenamiento sino en la cuantización: se aplica Q5_K_M con 32/32 capas aceleradas y se reporta una retención de calidad del 97,5 % respecto al modelo en FP16. El proceso se realizó con la herramienta run-any-model, un motor de optimización adaptativo al dispositivo que genera el GGUF y produce un informe de telemetría (DeviceQuant) con métricas de tamaño, memoria residente y viabilidad por plataforma.

## Capacidades

- Generación de texto instructivo: el modelo base es un modelo "Instruct", por lo que está orientado a seguir instrucciones en formato conversacional.
- Conversación multi-turno: la model card incluye ejemplos de uso con plantillas de parada (`<|im_end|>`, `<|endoftext|>`) compatibles con Ollama y llama.cpp en modo chat.
- Ejecución local multiplataforma: soporte declarado para Apple Silicon (Metal), GPUs NVIDIA (CUDA) y CPU x86 con AVX2/AVX-512.
- Integración con tooling estándar de inferencia local: llama.cpp, Ollama, LM Studio, Jan y text-generation-webui.
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas avanzadas, visión o audio: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas soportados.

## Casos de uso

- Asistente conversacional local en portátil: con 3,98 GB de memoria unificada en Apple Silicon o 4,93 GB de VRAM en GPU NVIDIA, el modelo puede mantener conversaciones multi-turno de hasta 8.192 tokens en un equipo de consumo, sin conexión a internet ni coste por token.
- Prototipado rápido de aplicaciones de chat: mediante Ollama (`ollama create` + `ollama run`) se puede levantar un endpoint de chat en minutos y validar prompts, plantillas y flujos antes de migrar a un modelo mayor en producción.
- Procesamiento por lotes en CPU: en servidores sin GPU, con 5,98 GB de RAM libre y contexto de 4.096 tokens, puede emplearse para tareas de resumen, clasificación o extracción de información en volúmenes moderados.
- Educación e investigación: sirve como banco de pruebas para estudiar el efecto de la cuantización Q5_K_M frente a FP16 (el informe reporta 97,5 % de retención), sin necesidad de hardware de datacenter.
- Integración en IDE o editor local: al ser un GGUF compatible con llama.cpp, puede conectarse a extensiones de autocompletado o asistencia de código que consuman modelos locales, siempre que el contexto de 8.192 tokens sea suficiente.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse íntegramente en local, los datos no salen del dispositivo, lo que encaja en escenarios con datos sensibles donde no se permite enviar prompts a APIs externas.
- Pruebas de regresión de pipelines de inferencia: el artefacto permite validar cadenas de herramientas (llama.cpp, Ollama, LM Studio) y medir latencia y consumo de memoria en hardware modesto antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas de cuantización y despliegue, no de calidad de tarea (MMLU, HumanEval, GSM8K u otros). Se reproduce a continuación la matriz de telemetría declarada por el autor:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision de bits | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 9,97 GB | 3,43 GB | -65,6 % |
| Buffer KV cache | 512,0 MB (FP16) | 512,0 MB (FP16) | Optimizado |
| RAM residente total | 10,52 GB | 3,98 GB | -62,2 % |
| Viabilidad | Inusable / crash | Excelente (ajuste nativo) | Validado |
| Calidad estimada | 100,0 % baseline | 97,5 % retenido | -2,5 % |
| Aceleracion de capas | 0 % (riesgo de crash) | 32/32 capas | Optimo |

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ONIX-Nemotron-Mini-4B-Instruct-GGUF (Q5_K_M) | 5,10 B | 8.192 (GPU) / 4.096 (CPU) | Apache 2.0 | GGUF | Cuantizacion Q5_K_M, 3,43 GB, reporta 97,5 % de retencion |
| nvidia/Nemotron-Mini-4B-Instruct (FP16) | 5,10 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar, 9,97 GB en FP16 |
| Alternativas de ~4B en GGUF (p. ej. Llama 3.2 3B Instruct, Qwen2.5 3B Instruct) | ~3-4 B | 8K-128K segun modelo | licencias variables | GGUF | No disponibles datos comparativos de rendimiento en esta ficha |

La comparación con modelos de la misma categoría (3-4B instructivos en GGUF) no puede completarse con datos de rendimiento porque no se han publicado benchmarks del artefacto ni del modelo base en la información disponible.

## Limitaciones y advertencias

- La información técnica proviene exclusivamente de la model card del cuantizador (pranil00 / ONIX), no de NVIDIA; los datos de arquitectura, parámetros y contexto deben contrastarse con la model card oficial del modelo base.
- No se han publicado benchmarks de calidad de tarea, por lo que la afirmación de "97,5 % de retención de calidad" no está verificada de forma independiente y se refiere a métricas internas del cuantizador.
- La cuantización Q5_K_M introduce pérdida de precisión (5,5 bits por peso frente a 16 bits en FP16); es esperable degradación en tareas sensibles a precisión numérica, como matemáticas o código complejo.
- El contexto efectivo se reduce a 4.096 tokens en CPU, lo que limita casos de uso con documentos largos o conversaciones extensas.
- No se declaran idiomas soportados; el rendimiento en castellano es desconocido y podría ser inferior al de modelos con cobertura multilingüe explícita.
- Riesgo de alucinación inherente a modelos de 4-5B: la capacidad de razonamiento y la fidelidad factual son limitadas en comparación con modelos de mayor tamaño.
- Sesgos conocidos: no disponibles en la información proporcionada; se recomienda auditoría propia antes de uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero el descargo de responsabilidad del autor exime de cualquier garantía y responsabilidad sobre los outputs; el implementador asume la validación completa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (25/11/2026), lo que indica ausencia de validación comunitaria.
- La fecha de creación indicada (2026) es futura respecto a la fecha habitual de consulta; conviene verificar la integridad y procedencia del artefacto antes de descargarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Nemotron-Mini-4B-Instruct-GGUF
- Modelo base en Hugging Face: https://huggingface.co/nvidia/Nemotron-Mini-4B-Instruct
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Herramienta de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
