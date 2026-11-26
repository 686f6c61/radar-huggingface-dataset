# pranil00/ONIX-WizardCoder-15B-V1.0-GGUF

## Resumen

ONIX-WizardCoder-15B-V1.0-GGUF es una cuantización en formato GGUF (esquema Q4_K_M) del modelo WizardCoder-15B-V1.0, desarrollado originalmente por WizardLM Team y publicado como artefacto cuantizado por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El modelo base es un transformer decoder-only de la familia StarCoder/CodeGen afinado para generación de código, con 18.723.876.864 parámetros totales según la model card del autor de la cuantización.

El propósito del artefacto es hacer viable la ejecución local del modelo en hardware de consumo mediante una reducción del 71,9 % en el tamaño de los pesos (de 36,62 GB en FP16 a 10,30 GB en Q4_K_M). La model card declara una retención de calidad aproximada del 95 % respecto al baseline sin cuantizar y clasifica la viabilidad como "EXCELLENT (Native Fit)" en Apple Silicon con 11,35 GB de memoria unificada, GPU NVIDIA con 11,80 GB de VRAM y CPU x86 con 13,35 GB de RAM libre.

La relevancia actual del artefacto es limitada pero concreta: permite desplegar un modelo de código de ~15-18B en equipos de sobremesa y portátiles de gama alta sin GPU de datacenter, con licencia Apache 2.0 heredada del modelo base. No obstante, el repositorio presenta cero descargas y cero likes en el momento de la consulta, y la model card mezcla afirmaciones verificables (tamaño de fichero, esquema de cuantización) con métricas no auditables ("95 % de fidelidad cognitiva") que conviene tratar con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia StarCoder/CodeGen, base WizardCoder-15B-V1.0) |
| Parametros totales | 18.723.876.864 (18,72 B) segun model card del artefacto |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (declarado en GPU/Apple Silicon); 4.096 tokens en CPU segun model card |
| Tipos de cuantizacion | Q4_K_M (4,5 bits por peso); unico esquema publicado en este repo |
| Idiomas soportados | no disponible (el modelo base esta orientado a codigo y prompt en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `WizardLM--WizardCoder-15B-V1.0-Q4_K_M.gguf`, 10,30 GB) |

## Arquitectura y entrenamiento

El modelo base WizardCoder-15B-V1.0 es un transformer decoder-only derivado de StarCoder/CodeGen-15B, afinado por WizardLM Team mediante evol-instruct aplicado a instrucciones de código. La model card del artefacto cuantizado no aporta detalles sobre el dataset de entrenamiento, el número de tokens, la composición del corpus ni si hubo RLHF o DPO; esos datos corresponden al modelo original y no se reproducen aquí porque no están incluidos en la información proporcionada.

La contribución técnica del artefacto es exclusivamente la cuantización Q4_K_M realizada con el motor `run-any-model`, que declara 40/40 capas aceleradas en Metal y una reducción del 71,9 % en el peso de los pesos. El KV cache se mantiene en 960 MB con cuantización Q4_0 según la auditoría de telemetría incluida en la model card. No se documentan innovaciones arquitectónicas propias (atención lineal, decodificación especulativa, MoE) más allá de las inherentes al modelo base.

## Capacidades

- Generación de código en múltiples lenguajes de programación, heredada del afinado de WizardCoder sobre instrucciones de programación.
- Generación de texto técnico y explicaciones de código.
- Razonamiento sobre fragmentos de código y tareas de completado tipo fill-in-the-middle (según las capacidades del modelo base, no verificadas en la model card del artefacto).
- Ejecución local en CPU, GPU y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- Conversación multi-turno en modo chat (`-cnv` en llama.cpp, Modelfile de Ollama con stop tokens `<|im_end|>` y `<|endoftext|>`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el modelo base está orientado a prompts en inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistencia de programación en local sin conexión: el artefacto de 10,30 GB cabe en un portátil con 16 GB de RAM unificada o una GPU de 12 GB, lo que permite autocompletado y explicación de código en entornos air-gapped donde no se puede enviar código a una API externa.
- Revisión de código en pipelines de CI: integrado vía llama.cpp u Ollama, el modelo puede generar comentarios de revisión sobre diffs y parches antes de fusionar, con la ventaja de que el código no abandona la infraestructura del equipo.
- Generación de tests unitarios: dado un fragmento de función, el modelo puede producir casos de prueba en el mismo lenguaje; su ventana de 8.192 tokens permite incluir el módulo completo como contexto en la mayoría de ficheros.
- Enseñanza y formación de desarrolladores: al ejecutarse en hardware de consumo, sirve como tutor de código local para explicar fragmentos, sugerir refactorizaciones y responder dudas sin coste por token.
- Prototipado rápido de scripts y utilidades: para tareas de scripting en Python, Bash o SQL donde no se requiere la precisión de un modelo frontier, el coste marginal de inferencia local es cero tras la descarga.
- Documentación técnica automatizada: generación de docstrings y comentarios a partir del código fuente, aprovechando la ventana de contexto para procesar ficheros completos de tamaño medio.
- Despliegue en entornos con requisitos de soberanía de datos: administraciones o empresas que exigen que el código y los prompts no salgan de su red pueden usar el GGUF con llama.cpp o vLLM (si se convierte el formato) en servidores propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una tabla de telemetría de memoria (tamaño de pesos, KV cache, RAM residente) pero no reporta métricas de calidad como HumanEval, MBPP, MMLU o GSM8K, ni para el artefacto cuantizado ni para el modelo base. La cifra de "95,0 % de retención de calidad" que aparece en la model card no está respaldada por ninguna evaluación publicada y no debe interpretarse como un resultado de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: 11,80 GB de VRAM dedicada en GPU NVIDIA (RTX 30/40/50) según la model card, con ventana de contexto de 8.192 tokens.
- Apple Silicon: 11,35 GB de memoria unificada (M1/M2/M3/M4/M5) con aceleración Metal nativa y 40/40 capas aceleradas.
- CPU x86: 13,35 GB de RAM libre, con soporte AVX2/AVX-512 y ventana de contexto reducida a 4.096 tokens.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 12 GB de VRAM (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100). No se documenta compatibilidad con ROCm ni con GPU AMD.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4070/4070 Ti, RTX 4080 y RTX 4090, siempre que se reserve VRAM adicional para el KV cache y el contexto.
- Opciones de despliegue: llama.cpp (`llama-cli`), Ollama (mediante Modelfile), LM Studio, Jan, Text-Generation-WebUI y el CLI propietario `run-any-model`. No se documenta soporte de vLLM ni TGI para este artefacto GGUF.
- Latencia y throughput: no disponibles. La model card no reporta tokens por segundo ni latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-WizardCoder-15B-V1.0-GGUF (este) | 18,72 B | 8.192 (GPU) / 4.096 (CPU) | GGUF Q4_K_M, 10,30 GB | Apache 2.0 | Hugging Face, 0 descargas |
| WizardLM/WizardCoder-15B-V1.0 (base) | ~15 B nominales | no disponible en la informacion | safetensors FP16, ~36,62 GB | Apache 2.0 | Hugging Face, modelo original |
| CodeLlama-13B-Instruct | 13 B | 16.384 tokens | safetensors, GGUF disponible en la comunidad | Llama 2 custom | Hugging Face, ampliamente adoptado |
| DeepSeek-Coder-6.7B-Instruct | 6,7 B | 16.384 tokens | safetensors, GGUF disponible | DeepSeek license | Hugging Face, ampliamente adoptado |

La comparativa se limita a parámetros, contexto y licencia porque no hay benchmarks publicados para este artefacto. Frente a CodeLlama-13B-Instruct y DeepSeek-Coder-6.7B-Instruct, el modelo aquí descrito ofrece más parámetros que el segundo pero menor contexto declarado y una adopción comunitaria prácticamente nula (0 descargas), lo que reduce la probabilidad de encontrar soporte, conversiones alternativas o validaciones independientes.

## Limitaciones y advertencias

- Artefacto sin adopción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente y riesgo de que el fichero no haya sido probado por terceros.
- Métricas no auditables: la model card afirma "95 % de retención de calidad" y "40/40 capas aceleradas" sin publicar la metodología ni los resultados de evaluación que lo respalden.
- Discrepancia de parámetros: la model card declara 18,72 B de parámetros mientras que el nombre del modelo base indica 15B; esta diferencia no se explica en la documentación y conviene verificarla antes de dimensionar hardware.
- Contexto limitado: 8.192 tokens en GPU y 4.096 en CPU, por debajo de los 16.384 tokens de alternativas como CodeLlama-13B-Instruct o DeepSeek-Coder.
- Idiomas: no se documenta soporte multilingüe; el modelo base está orientado a prompts en inglés, por lo que el rendimiento en castellano no está garantizado.
- Riesgo de alucinación de APIs y funciones: como todo modelo de código, puede generar llamadas a funciones inexistentes o firmas incorrectas; requiere validación en CI antes de ejecutar el código generado.
- Sesgos: no documentados en la información proporcionada; el modelo base puede reproducir sesgos presentes en su corpus de entrenamiento de código público.
- Licencia: Apache 2.0 permite uso comercial, pero la model card incluye una cláusula de exención de responsabilidad total ("AS IS", sin garantías) que traslada al implementador toda la responsabilidad sobre las salidas.
- Soporte de tool calling y agentes: no confirmado; no debe asumirse para pipelines de agentes sin evaluación previa.
- Formato GGUF únicamente: no se publican pesos en safetensors ni otras cuantizaciones (Q5, Q8, FP16) en este repositorio, lo que limita las opciones de despliegue a llama.cpp y derivados.

## Enlaces

- Repositorio Hugging Face del artefacto: https://huggingface.co/pranil00/ONIX-WizardCoder-15B-V1.0-GGUF
- Modelo base WizardCoder-15B-V1.0: https://huggingface.co/WizardLM/WizardCoder-15B-V1.0
- Organización ONIX en Hugging Face: https://huggingface.co/ONIX
- Repositorio del motor de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
