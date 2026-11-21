# mohit67890/imajev-4b

## Resumen

imajev-4b es un adaptador LoRA de tipo vision-language publicado por Mohit Garg (usuario mohit67890) sobre el modelo base Qwen/Qwen3.5-4B. No es un modelo generalista de propósito abierto: está especializado en emitir decisiones tipadas sobre opciones predefinidas por la aplicación, acompañadas de una probabilidad calibrada por opción y de una etiqueta explícita de "no se puede determinar" (unknown). El caso de uso central es contrastar una fotografía con los campos de un registro propio de la empresa (por ejemplo, el color declarado en un anuncio frente al color real de la prenda en la imagen) y señalar qué campo es incorrecto.

La familia imajev se distribuye en tres tamaños (2B, 4B y 9B), y esta variante de 4B es la recomendada por el autor: obtiene 83,9 % en ImajevBench frente al 82,1 % del 9B con menos de la mitad de parámetros, y es la única entrenada en la fase 3 del pipeline de datos difíciles. El modelo se entrenó sobre 72.000 decisiones de tipo foto-contra-registro y de dos fotos en una misma petición (referencia contra objetivo), lo que lo orienta a verificación documental y visual más que a generación libre.

Es relevante ahora porque propone un contrato de salida distinto al del chatbot convencional: en lugar de texto abierto, devuelve decisiones con probabilidad y abstención, lo que permite a un sistema actuar solo cuando la confianza es alta y derivar el resto a revisión humana. La licencia Apache-2.0 y la posibilidad de ejecución local (MLX en Mac o PyTorch en una GPU) encajan con flujos donde los datos de cliente no deben salir de la infraestructura propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer vision-language Qwen/Qwen3.5-4B |
| Parámetros totales | 4B en el modelo base; tamaño del adaptador no disponible |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el repo incluye pesos safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); librería peft |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA entrenado mediante PEFT sobre Qwen/Qwen3.5-4B, un transformer vision-language que procesa entradas image-text-to-text. El adaptador añade la capacidad de emitir decisiones tipadas: cada respuesta selecciona una de las opciones definidas por la aplicación y asigna una probabilidad calibrada a cada una, incluida la opción `unknown`. El repo ocupa 1,5 GB y se distribuye en safetensors, con soporte declarado para MLX (Apple Silicon) y PyTorch.

El autor indica que el adaptador se entrenó sobre 72.000 decisiones de dos tipos: comparaciones entre una foto y los campos de un registro, y comparaciones entre dos fotos (referencia contra objetivo). La variante 4B es la única que pasó por la fase 3 del pipeline de datos, dedicada a casos difíciles. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron RLHF o DPO. Tampoco se detallan innovaciones de decodificación o atención.

## Capacidades

- Decisión tipada con probabilidad calibrada por opción, incluida la abstención explícita (`unknown`).
- Verificación de una fotografía contra los campos de un registro propio y señalamiento del campo discrepante.
- Comparación de dos imágenes en una misma petición: referencia contra objetivo (enviado contra devuelto, pieza patrón contra pieza en línea).
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text).
- Salida estructurada orientada a la integración con sistemas de decisión automática.
- Ejecución local: MLX en Mac o PyTorch en una GPU.
- Soporte de tool calling, agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, audio u otras modalidades: no disponibles.

## Casos de uso

- Verificación de anuncios de marketplace: el modelo contrasta la foto del producto con los campos declarados (color, modelo, estado) y señala el campo discrepante con su probabilidad, de modo que la plataforma retiene el anuncio solo cuando la confianza es alta.
- Gestión de devoluciones y RMA: se compara la foto del artículo devuelto con la foto de referencia del envío original y se decide si la devolución procede, se escala o se deriva a un agente humano usando la etiqueta `unknown`.
- Control de calidad en línea de producción: se enfrenta la imagen de una pieza patrón con la de la pieza que sale de la línea para detectar desviaciones, aprovechando el entrenamiento específico en decisiones de dos fotos.
- Verificación documental en back-office: se contrasta la foto de un documento o justificante con los datos registrados en el sistema y se marca el campo que no coincide, con probabilidad asociada para fijar el umbral de automatización.
- Triaje de tickets con adjuntos: el modelo clasifica el caso en las categorías definidas por la operación (reembolso, incidencia de envío, producto dañado) a partir del texto y las imágenes adjuntas, y deriva a revisión los casos con `unknown` alto.
- Automatización con revisión humana selectiva: al devolver probabilidad por opción, el sistema puede fijar umbrales por caso de uso y enviar a un operador únicamente la cola de baja confianza, reduciendo el volumen de revisión manual.
- Despliegue en entorno local con datos sensibles: al ejecutarse con MLX en un Mac o con PyTorch en una GPU propia, las fotos y los datos de cliente no salen de la infraestructura de la empresa, lo que facilita el cumplimiento en sectores regulados.

## Benchmarks y rendimiento

Resultados publicados en la model card (capturas de leaderboards oficiales fechadas el 28 de septiembre de 2026):

| Benchmark | Resultado de imajev-4b | Posición | Comparación |
|---|---|---|---|
| ImajevBench | 83,9 % | No disponible | 9B de la misma familia: 82,1 % |
| JevBench v1.4.2.2 (27 sep 2026) | 67,4 | 1 de 91 | Plumb-4B: 65,8; decider-4b v2: 64,1; Jev 1.13.0: 63,3 |
| Image JevBench v0.1.3 (28 sep 2026) | 76,39 | 1 de 49 | Jev-Omni: 73,10; NeoHorse Jev 4B: 71,94 |
| DecisionBench (eng, v1) | 79,65 | 3 de 56 | Bosun-v3.1-1.7b: 87,29; Bosun-v3.1-0.6b: 83,20; por delante de GLM-5.3 Flash (320B), Jev 1.13, DeepSeek V4.1 Flash (552B) y GPT-5.6 Luna |

No se han publicado en la información disponible resultados de benchmarks generalistas como MMLU, HumanEval o GSM8K. Los dos primeros puestos de DecisionBench los ocupan modelos del propio equipo del benchmark, según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo de 4B en precisión de 16 bits requiere aproximadamente 8 GB solo para los pesos, más el adaptador y la caché de visión; en cuantización de 8 bits bajaría a unos 4-5 GB y en 4 bits a unos 2,5-3 GB, aunque el autor no publica cifras ni variantes cuantizadas.
- GPU recomendadas: no especificadas. El autor solo indica ejecución con PyTorch en una GPU y con MLX en Mac.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de 4B hace plausible su ejecución en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: PEFT (librería declarada), PyTorch y MLX. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| imajev-4b | 4B (base) + LoRA | No disponible | Decisión tipada con probabilidad y abstención; visión | Apache-2.0 | Hugging Face, demo en Spaces, GitHub |
| imajev-9b | 9B (base) + LoRA | No disponible | Misma familia, mayor tamaño | Apache-2.0 | Hugging Face |
| imajev-2b | 2B (base) + LoRA | No disponible | Misma familia, menor tamaño | Apache-2.0 | Hugging Face |
| Plumb-4B | 4B | No disponible | Decisión (JevBench: 65,8) | No disponible | Listado en JevBench |
| decider-4b v2 | 4B | No disponible | Decisión (JevBench: 64,1) | No disponible | Listado en JevBench |
| Jev-Omni | No disponible | No disponible | Decisión multimodal (Image JevBench: 73,10) | No disponible | Listado en Image JevBench |

La comparación se limita a los benchmarks de decisión publicados; no hay datos de benchmarks generalistas que permitan situar el modelo frente a alternativas de propósito general del mismo tamaño.

## Limitaciones y advertencias

- Modelo especializado en decisiones sobre opciones predefinidas; no está pensado como asistente conversacional general ni para generación libre de texto.
- Solo inglés declarado: el rendimiento en castellano u otros idiomas no está documentado y no debería asumirse.
- Longitud de contexto no documentada; conviene validar el comportamiento con entradas largas antes de usarlo en producción.
- Riesgo de alucinación en las opciones elegidas: la probabilidad calibrada y la etiqueta `unknown` mitigan el problema, pero no lo eliminan; es necesario fijar umbrales y monitorizar la tasa de abstención.
- Sesgos: no se documenta ninguna evaluación de sesgos en la información disponible.
- Los resultados de los leaderboards de decisión (JevBench, Image JevBench, DecisionBench) son específicos de la tarea y no extrapolables a capacidades generales de razonamiento o código.
- En DecisionBench, los dos modelos que superan a imajev-4b pertenecen al equipo del propio benchmark, según la model card; conviene interpretar la clasificación con cautela.
- No se publican cifras de VRAM, latencia ni variantes cuantizadas, lo que complica la planificación de despliegue.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base Qwen/Qwen3.5-4B.
- El adaptador requiere cargar el modelo base Qwen/Qwen3.5-4B además de los pesos PEFT; el repo de 1,5 GB no es autosuficiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohit67890/imajev-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante 2B: https://huggingface.co/mohit67890/imajev-2b
- Variante 9B: https://huggingface.co/mohit67890/imajev-9b
- Demo en vivo (Hugging Face Spaces): https://huggingface.co/spaces/mohit67890/imajev
- Repositorio de código: https://github.com/mohit67890/imajev
- Sitio web: https://mohit67890.github.io/imajev/
- Informe técnico: https://mohit67890.github.io/imajev/report/
- Benchmark ImajevBench: https://huggingface.co/datasets/mohit67890/imajev-bench
- Leaderboard JevBench: https://benchmarkheaven.com/jev-models
- Leaderboard Image JevBench: https://benchmarkheaven.com/image-jev-bench
- Leaderboard DecisionBench: https://huggingface.co/spaces/Hanno-Labs/decision-bench-leaderboard
- Autor: https://mohitgarg.ai
