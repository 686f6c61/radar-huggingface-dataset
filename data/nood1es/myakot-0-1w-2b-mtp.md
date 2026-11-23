# nood1es/myakot-0.1w-2b-mtp

## Resumen

myakot-0.1w-2b-mtp es un derivado del modelo Qwen3.5-2B publicado por el usuario nood1es en Hugging Face. Se trata de una conversión orientada a inferencia local que combina los pesos del modelo base de Qwen con el formato GGUF de Unsloth y el soporte de decodificación especulativa MTP (multi-token prediction) implementado en llama.cpp. El pipeline declarado es image-text-to-text, por lo que hereda la capacidad multimodal del modelo original.

El modelo base, Qwen3.5-2B, es un transformer causal con codificador de visión desarrollado por el equipo Qwen de Alibaba. Emplea una arquitectura híbrida que combina Gated DeltaNet (atención lineal) con atención con compuertas, e incorpora entrenamiento con predicción multi-token. Con 1.942.653.248 parámetros y una ventana de contexto nativa de 262.144 tokens, está pensado para prototipado, ajuste fino específico de tarea e investigación.

La relevancia de esta ficha radica en que el repositorio no aporta un modelo nuevo entrenado desde cero, sino un artefacto de despliegue: pesos en transformers y GGUF empaquetados junto con instrucciones para ejecutar decodificación especulativa MTP en llama.cpp, lo que según la model card acelera la generación entre 1,5 y 2 veces. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamaño de 35 GB que refleja la inclusión de múltiples cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con codificador de visión; híbrido Gated DeltaNet + atención con compuertas; MTP |
| Parametros totales | 1.942.653.248 |
| Parametros activos | no disponible (no se declara como MoE en la informacion disponible) |
| Longitud de contexto | 262.144 tokens nativos |
| Tipos de cuantizacion | GGUF (incluye UD-Q4_K_XL de Unsloth Dynamic 2.0); safetensors en precisión original |
| Idiomas soportados | 201 idiomas y dialectos según la model card del modelo base; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B presenta una disposición de 24 capas con patrón 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). La dimensión oculta es 2048, el embedding de tokens es de 248.320 entradas (con padding) y la salida LM está atada a dicho embedding. Gated DeltaNet usa 16 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; la atención con compuertas usa 8 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64 dimensiones. La FFN tiene dimensión intermedia 6144. El modelo fue entrenado con predicción multi-token en varios pasos, lo que habilita la decodificación especulativa MTP.

Según la model card del modelo base, Qwen3.5 se entrenó con fusión temprana sobre tokens multimodales, alcanzando paridad con Qwen3 y superando a Qwen3-VL en razonamiento, código, agentes y comprensión visual. El entrenamiento incluye preentrenamiento y postentrenamiento, con escalado de reinforcement learning en entornos multiagente y una infraestructura de entrenamiento multimodal con eficiencia cercana al 100 % respecto a texto puro. No se especifican en la información disponible el número exacto de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y razonamiento en 201 idiomas y dialectos según el modelo base.
- Comprensión de imágenes y texto combinados (pipeline image-text-to-text, codificador de visión).
- Generación de código y soporte de tool calling, con mejoras declaradas en el parseo de objetos anidados.
- Soporte de rol "developer" para integración en Codex, OpenCode y herramientas similares.
- Razonamiento multi-paso y uso en entornos de agentes.
- Decodificación especulativa MTP para acelerar la generación (1,5-2× según la model card).
- Ajuste fino local con Unsloth.

## Casos de uso

- Prototipado de asistentes multimodales: el modelo puede recibir imagen y texto en la misma conversación y responder en castellano, aprovechando el codificador de visión y la ventana de 262.144 tokens para adjuntar documentación extensa junto a capturas o diagramas.
- Despliegue local en estación de trabajo: con la cuantización UD-Q4_K_XL y llama.cpp compilado con soporte CUDA, se puede servir el modelo en una GPU de consumo para tareas de desarrollo sin depender de la nube.
- Evaluación de decodificación especulativa: sirve como banco de pruebas para medir la ganancia de MTP con `--spec-type draft-mtp` y `--spec-draft-n-max 6` frente a generación autoregresiva estándar.
- Ajuste fino específico de dominio: al ser un modelo de 2B con licencia Apache 2.0, es viable reentrenar sobre datos propios con Unsloth para clasificación, extracción o generación acotada.
- Integración en pipelines de agentes con tool calling: el soporte de funciones anidadas permite conectarlo a APIs externas en flujos de automatización, con el rol developer para entornos tipo Codex.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite resumir o extraer información de contratos, informes o bases de código sin trocear el contexto.
- Experimentación académica en eficiencia arquitectónica: la combinación de Gated DeltaNet y atención con compuertas permite estudiar el equilibrio entre atención lineal y cuadrática en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base incluye una sección de resultados de lenguaje, pero los valores numéricos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2-1,5 GB en cuantización Q4 para los pesos de lenguaje; hay que sumar el codificador de visión y el contexto KV, que crece con la ventana utilizada. Con contexto de 8.192 tokens y Q4, un presupuesto de 3-4 GB es razonable; con contexto completo de 262.144 tokens el consumo es mucho mayor y no está cuantificado en la información disponible.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y superiores para contexto largo; A100/H100 para servir con vLLM o SGLang a mayor concurrencia.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más usando GGUF Q4; también es viable en CPU con `-DGGML_CUDA=OFF`.
- Opciones de despliegue: llama.cpp (con soporte MTP), transformers, vLLM, SGLang, KTransformers y Ollama mediante GGUF.
- Latencia y throughput: no disponibles de forma numérica; la model card afirma una aceleración de 1,5-2× con MTP frente a generación sin decodificación especulativa. Limitaciones conocidas: `-np > 1` y `--mmproj` no están soportados aún con MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| myakot-0.1w-2b-mtp (este) | 1,94B | 262.144 | Texto + imagen | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3.5-2B (base) | 2B | 262.144 | Texto + imagen | Apache 2.0 | Hugging Face oficial |
| Qwen3-VL (generación anterior) | no disponible | no disponible | Texto + imagen | no disponible | Hugging Face oficial |
| Qwen3 (texto) | no disponible | no disponible | Texto | no disponible | Hugging Face oficial |

La comparación con modelos de otros fabricantes del mismo tamaño no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-23): no hay evidencia de validación por la comunidad.
- Es un artefacto de conversión y empaquetado, no un modelo entrenado por el autor; la calidad depende enteramente de Qwen3.5-2B.
- La model card del autor está copiada de la guía de Unsloth para Qwen3.5 y no documenta el proceso de conversión ni verificaciones de integridad de los pesos.
- El tamaño del repositorio (35 GB) es desproporcionado para un modelo de 2B en safetensors; probablemente incluye múltiples cuantizaciones GGUF, pero no se detalla el inventario.
- Riesgo de alucinación inherente a un modelo de 2B, especialmente en razonamiento complejo y matemáticas.
- La lista concreta de idiomas no está disponible; los 201 idiomas son una afirmación del modelo base, no verificada para este artefacto.
- El soporte MTP en llama.cpp es reciente (fusionado el 16 de mayo de 2026) y no admite aún `-np > 1` ni `--mmproj`, lo que limita el despliegue multimodal y concurrente con esa ruta.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar la licencia del modelo base enlazada en la model card.
- No hay información sobre sesgos específicos, filtros de seguridad ni evaluación de robustez para este artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nood1es/myakot-0.1w-2b-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Guía de ejecución de Qwen3.5 MTP (Unsloth): https://unsloth.ai/docs/models/qwen3.5#mtp-guide
- Guía de Qwen3.5 local (Unsloth): https://unsloth.ai/docs/models/qwen3.5
- Guía de ajuste fino de Qwen3.5 (Unsloth): https://unsloth.ai/docs/models/qwen3.5/fine-tune
- Unsloth Dynamic 2.0 GGUF: https://unsloth.ai/docs/basics/unsloth-dynamic-v2.0-gguf
- Repositorio Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- PR de MTP en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/22673
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai
