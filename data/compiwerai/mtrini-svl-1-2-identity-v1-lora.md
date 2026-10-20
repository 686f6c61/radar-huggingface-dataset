# CompiwerAI/Mtrini-SVL-1.2-Identity-v1-LoRA

## Resumen

Mtrini-SVL-1.2-Identity-v1-LoRA es un adaptador LoRA publicado por CompiwerAI sobre el modelo multimodal Qwen/Qwen3-VL-8B-Instruct. Se distribuye como repositorio PEFT con pesos en safetensors y está etiquetado como `experimental`, con pipeline `image-text-to-text` y uso conversacional. No es un modelo completo: para utilizarlo hay que cargar el modelo base Qwen3-VL-8B-Instruct y aplicar el adaptador encima, ya sea mediante la librería PEFT, vLLM o TGI.

El repositorio no incluye model card con documentación técnica: no hay información sobre el dataset de entrenamiento, el rango y alpha del LoRA, los módulos objetivo, la licencia ni los idiomas soportados. El nombre ("Identity") sugiere un ajuste orientado a fijar una identidad o persona conversacional, pero esta interpretación no está confirmada por ninguna documentación oficial.

Su relevancia actual es limitada y de carácter exploratorio: cuenta con 0 descargas y 0 "likes" en el momento de redactar esta ficha, lo que implica ausencia de validación por parte de la comunidad. Resulta de interés únicamente como ejemplo de adaptación ligera sobre la familia Qwen3-VL para experimentación en investigación (comparación de adaptadores, estudio de olvido catastrófico, prototipado de personas), no como componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal visión-lenguaje (Qwen3-VL-8B-Instruct) |
| Parámetros totales | No disponible para el adaptador; el modelo base declara 8B en su identificador (aproximadamente 8 000 millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; la hereda del modelo base |
| Tipos de cuantización | No disponible; la cuantización se aplica al modelo base, no al adaptador |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato PEFT) |
| Rango y alpha del LoRA | No disponible |
| Módulos objetivo (target modules) | No disponible |
| Tamaño del repositorio | No disponible |
| Pipeline declarado | image-text-to-text |
| Etiquetas | peft, lora, experimental, compiwer-ai, mtrini, qwen3-vl |
| Fecha de creación registrada | 2026-10-20 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) en formato PEFT. Este tipo de ajuste congela los pesos del modelo base e introduce matrices de baja dimensión (A y B) en determinadas capas lineales, de modo que solo se entrena un subconjunto reducido de parámetros. El resultado son ficheros de pesos de tamaño mucho menor que el modelo completo, que se cargan junto al base en tiempo de inferencia o se fusionan con él. El modelo subyacente, Qwen3-VL-8B-Instruct, es un transformer multimodal con codificador visual y decodificador de lenguaje, orientado a instrucciones y conversación con entrada de imagen y texto.

No hay información pública sobre el proceso de entrenamiento del adaptador: se desconoce el número de tokens, la composición del dataset (si incluye pares imagen-texto, datos sintéticos o conversaciones generadas), si se aplicaron técnicas de alineación como RLHF o DPO, la duración del entrenamiento, la tasa de aprendizaje, el rango del LoRA ni los módulos a los que se aplicó. Tampoco se documenta ninguna innovación técnica asociada. La etiqueta `experimental` y la ausencia de model card indican que se trata de un artefacto de publicación sin validación formal.

## Capacidades

- Generación de texto y conversación multi-turno sobre el modelo base Qwen3-VL-8B-Instruct; el adaptador no añade capacidades nuevas verificables, solo modula el comportamiento del base.
- Procesamiento de entradas imagen-texto (pipeline `image-text-to-text`): descripción de imágenes, respuesta a preguntas visuales y lecturas de capturas o diagramas, siempre sujeto a la calidad del modelo base.
- Presunta modulación de identidad o persona conversacional, inferida únicamente del nombre del repositorio; no verificada.
- Soporte de tool calling / function calling: no confirmado para este adaptador (depende del modelo base y de que el ajuste no haya degradado esa capacidad).
- Razonamiento multi-paso y uso como agente: no confirmado.
- Capacidades multilingües: no disponible; no se declara ningún idioma.
- Capacidades especiales (modo thinking, audio, vídeo): no disponibles.
- No se han publicado evaluaciones cualitativas ni cuantitativas de ninguna de estas capacidades para este adaptador.

## Casos de uso

- Investigación sobre adaptadores LoRA: cargar el adaptador con PEFT sobre Qwen3-VL-8B-Instruct y comparar sus salidas frente al modelo base sin ajustar, midiendo deriva de comportamiento y olvido catastrófico en tareas de visión y lenguaje.
- Prototipado interno de asistentes con persona fija: si el ajuste codifica efectivamente una identidad, serviría para experimentar con respuestas consistentes de tono y estilo en demos cerradas, nunca en atención directa al público sin supervisión.
- Evaluación A/B de adaptadores en pipelines de serving: vLLM permite cargar varios LoRA sobre un mismo modelo base (`--enable-lora`), lo que facilita comparar este adaptador con otras variantes sobre el mismo motor y la misma GPU.
- Generación de descripciones de imágenes con estilo controlado: para paneles de revisión o documentación interna donde se requiera un registro de voz homogéneo, validando previamente que el adaptador no degrade la fidelidad descriptiva del base.
- Extracción de información de capturas y diagramas en flujos de documentación técnica: el modelo base aporta OCR y comprensión visual; el adaptador podría ajustar el formato de salida, aunque requiere validación manual por el riesgo de errores en detalles finos.
- Estudio de seguridad y alineación: analizar cómo un fine-tuning ligero de identidad afecta a las negativas del modelo base, a la resistencia a jailbreaks y a la coherencia de la persona en conversaciones largas.
- Base para iteraciones posteriores: punto de partida para un ciclo de fine-tuning incremental de identidad, con la advertencia de que la licencia del adaptador no está declarada y la del modelo base debe verificarse por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra prueba multimodal, y tampoco hay métricas de latencia o throughput. Cualquier cifra de rendimiento atribuida a este adaptador sería una extrapolación no verificada del modelo base.

## Requisitos de hardware

- VRAM para inferencia: el adaptador por sí solo ocupa una fracción pequeña del modelo (típicamente cientos de MB, tamaño exacto no disponible), pero la inferencia exige cargar el modelo base de 8B completo. Estimación a partir del tamaño del base: aproximadamente 16-18 GB de pesos en bf16/fp16, más caché KV y el overhead del codificador visual.
- En bf16/fp16 con entrada de imagen: se recomienda GPU de 24 GB o superior; una RTX 4090 o RTX 3090 (24 GB) puede quedarse justa con contextos largos o lotes grandes.
- Cuantización de 8 bits: alrededor de 9-11 GB de pesos, viable en GPU de 16 GB con margen limitado.
- Cuantización de 4 bits (AWQ/GPTQ/GGUF Q4): alrededor de 5-7 GB de pesos, lo que permite ejecución en GPUs de consumo de 8-12 GB, con pérdida de calidad no medida para este adaptador.
- GPU de centro de datos recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB, para servir con concurrencia y contextos amplios.
- Opciones de despliegue: transformers + PEFT (referencia para desarrollo), vLLM con soporte de LoRA dinámico, TGI, y llama.cpp/Ollama si se fusiona y convierte el adaptador a GGUF (requiere paso previo de merge; no hay conversión publicada).
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador ni para su combinación con el modelo base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mtrini-SVL-1.2-Identity-v1-LoRA (este) | Adaptador sobre base de 8B | No disponible | No disponible | Repositorio PEFT, 0 descargas |
| Qwen/Qwen3-VL-8B-Instruct (base) | Aproximadamente 8B | No disponible en la información proporcionada | No disponible en la información proporcionada | Modelo completo, ampliamente distribuido |
| Qwen2.5-VL-7B-Instruct | Aproximadamente 7B | No disponible en la información proporcionada | Apache 2.0 (según su ficha oficial) | Modelo completo |
| Llama-3.2-11B-Vision-Instruct | Aproximadamente 11B | No disponible en la información proporcionada | Llama 3.2 Community License | Modelo completo |

No hay datos de rendimiento comparativo para este adaptador, por lo que la comparativa se limita a la disponibilidad y al encuadre de licencia. Frente al modelo base, el adaptador no aporta una ventaja medible documentada; frente a alternativas de la misma categoría (modelos visión-lenguaje de 7-11B), carece de evaluaciones públicas que permitan situarlo.

## Limitaciones y advertencias

- Ausencia total de model card: sin datos de entrenamiento, hiperparámetros del LoRA, dataset ni evaluación. No es posible reproducir el ajuste ni auditar su procedencia.
- Licencia no disponible: no se puede asumir uso comercial. Es necesario contactar con el autor y verificar además la licencia del modelo base Qwen3-VL-8B-Instruct, que se aplica de forma independiente.
- Riesgo de alucinación: el adaptador hereda los fallos del modelo base en tareas visuales (errores de OCR, detalles finos, texto en imágenes pequeñas o rotadas) y puede agravarlos si el ajuste ha estrechado la distribución de respuestas.
- Riesgo de degradación del modelo base: los LoRA de identidad pueden reducir la adherencia a instrucciones, la calidad del razonamiento o la capacidad de salir del personaje. No existe ninguna medición que cuantifique esta pérdida.
- Sesgos desconocidos: al no documentarse la composición del dataset, no se puede evaluar el sesgo demográfico, cultural o lingüístico introducido.
- Idiomas no declarados: no hay garantía de un rendimiento aceptable en castellano; hay que validarlo empíricamente antes de cualquier uso en España.
- Validación comunitaria nula: 0 descargas y 0 "likes". No hay reportes de terceros sobre su comportamiento real.
- Anomalía de trazabilidad: la fecha de creación registrada (2026-10-20) es anómala; conviene verificar el origen del repositorio antes de integrarlo en cualquier flujo.
- No apto para producción sin una evaluación propia: cualquier despliegue debe ir precedido de una batería de pruebas con datos representativos del dominio objetivo y de supervisión humana en las primeras fases.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/CompiwerAI/Mtrini-SVL-1.2-Identity-v1-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- No se han encontrado en la información proporcionada papers, blogs técnicos, repositorios de código ni demos asociados a este adaptador.
