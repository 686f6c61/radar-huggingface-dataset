# jianhui42/Qwen3.5-4B-INT4-MixedBlockSize-ONNX-WebGPU

## Resumen

Qwen3.5-4B-INT4-MixedBlockSize-ONNX-WebGPU es una exportación a ONNX del decodificador de texto del modelo Qwen3.5-4B, empaquetada específicamente para ejecución en navegador mediante el execution provider WebGPU de ONNX Runtime. La publica el usuario jianhui42 como artefacto derivado del modelo base de Alibaba Qwen, y su propósito es permitir inferencia local de un LLM de 4.000 millones de parámetros directamente en el cliente, sin backend ni GPU dedicada en servidor. El paquete incluye el grafo ONNX completo con las 32 capas del decodificador, los pesos cuantizados en INT4, el tokenizador y la plantilla de chat.

La relevancia de esta ficha no está en el modelo lingüístico en sí, sino en el formato de despliegue: es una pieza de infraestructura que traslada un transformer moderno con atención híbrida a WebGPU con cuantización mixta por bloques. El repo ocupa 3,7 GB (3,69 GB de pesos externos) y está configurado con una ventana de contexto de 262.144 tokens, aunque el límite de generación por defecto es de 4.096 tokens incluyendo el prompt.

La arquitectura subyacente es la del decodificador de Qwen3.5: 32 capas, hidden size de 2.560, 16 cabezas de atención con 4 cabezas KV (GQA) y un vocabulario de 248.320 tokens. La innovación estructural es la combinación de 24 capas con `GatedDeltaNet` (atención lineal recurrente) y 8 capas con `GroupQueryAttention` clásica, lo que reduce el coste del caché KV en contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas `GatedDeltaNet` + 8 capas `GroupQueryAttention` (decodificador `qwen3_5_text`) |
| Parametros totales | no disponible (modelo base de 4B, cifra exacta no publicada en la información disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens configurados; límite de generación por defecto de 4.096 tokens (incluye prompt) |
| Tipos de cuantizacion | INT4 con `MatMulNBits` (bits=4, accuracy_level=4); mezcla de escala por canal de salida y bloques de 32; embeddings en FP16; cabeza de salida INT4 con block_size=32; caché KV y estado convolucional en FP16; estado recurrente en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | ONNX con pesos externos (`model.onnx` + `model.onnx.data_0` + `model.onnx.data_1`) |

## Arquitectura y entrenamiento

El grafo exportado corresponde únicamente al decodificador de texto de Qwen3.5-4B, no al modelo completo. Tiene 32 capas con hidden size de 2.560, 16 cabezas de atención y 4 cabezas KV, con un tamaño de cabeza de 256. La particularidad es la mezcla de mecanismos de atención: 24 capas usan `GatedDeltaNet`, un mecanismo lineal recurrente con estado, y 8 capas usan `GroupQueryAttention` tradicional. Esta hibridación busca mantener calidad de atención completa en una fracción de las capas mientras reduce el coste computacional y de memoria del caché KV en secuencias largas, algo crítico para un contexto configurado de 262.144 tokens.

La cuantización es mixta y selectiva. El grafo contiene 153 nodos `MatMulNBits` con pesos INT4 y `accuracy_level=4`: 89 matrices con dimensión de entrada 2.560 usan bloques de 32 elementos, 32 matrices con dimensión de entrada 9.216 usan también bloques de 32, y 32 matrices con dimensión de entrada 4.096 usan una escala por canal de salida. Los pesos empaquetados se almacenan en UINT8 con escalas en FP16. Además hay 48 nodos `MatMul` ordinarios y una tabla de embeddings FP16 de forma `[248320, 2560]`. Los pesos externos suman 3.690.865.664 bytes (aproximadamente 3,69 GB o 3,44 GiB).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF, DPO u otras etapas de alineación. Esos datos corresponden al modelo base Qwen3.5-4B y no se detallan en la información proporcionada.

## Capacidades

- Generación de texto conversacional: el paquete incluye `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja`, por lo que soporta el formato de chat del modelo base.
- Razonamiento y generación de código: heredados del modelo base Qwen3.5-4B, aunque no se documentan capacidades específicas en esta exportación.
- Contexto largo: ventana configurada de 262.144 tokens, con un límite de generación por defecto de 4.096 tokens que incluye el prompt.
- Inferencia en navegador: ejecutable vía ONNX Runtime Web con el execution provider WebGPU, sin servidor.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Capacidades especiales (thinking mode, visión, audio): no documentadas. El grafo exporta solo el decodificador de texto.

## Casos de uso

- Asistentes conversacionales en el navegador: el paquete incluye tokenizador y plantilla de chat, de modo que una aplicación web puede cargar los ficheros ONNX y ejecutar generación multi-turno con WebGPU sin enviar datos a un servidor. Adecuado para privacidad y para evitar costes de backend.
- Demos y prototipos de LLM client-side: útil para validar experiencias de producto (chat, autocompletado, resumen) antes de invertir en infraestructura de servidor, aprovechando el formato ONNX ya empaquetado.
- Procesamiento de documentos largos en local: con 262.144 tokens de contexto configurados, permite resumir o extraer información de documentos extensos directamente en el cliente, siempre que se gestione el límite de generación de 4.096 tokens.
- Aplicaciones offline o de baja conectividad: al ejecutarse en WebGPU sobre el navegador, puede desplegarse en entornos donde no hay acceso a APIs de modelos en la nube.
- Educación y experimentación: sirve como referencia práctica de cómo exportar y cuantizar un transformer híbrido a ONNX con `MatMulNBits` y escalas mixtas, útil para ingenieros que estudien despliegue en WebGPU.
- Integración en herramientas de escritorio basadas en web (Electron, Tauri): el mismo artefacto ONNX puede embeberse en aplicaciones de escritorio con frontend web para ofrecer asistencia de texto sin dependencias externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos externos ocupan aproximadamente 3,69 GB en disco; en memoria, el grafo debe residir en GPU vía WebGPU, por lo que se necesita al menos ese espacio más el caché KV en FP16 y el estado recurrente en FP32. La cifra exacta de VRAM en ejecución no está disponible.
- GPU recomendadas: no disponible. Al ejecutarse mediante WebGPU en navegador, depende de la implementación de WebGPU del navegador y del driver de la GPU del usuario.
- Compatibilidad con GPU de consumo: no documentada. El tamaño de pesos (3,69 GB) sugiere que puede caber en GPUs de consumo con suficiente memoria, pero no hay confirmación en la información disponible.
- Opciones de despliegue: ONNX Runtime con execution provider WebGPU (navegador). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jianhui42/Qwen3.5-4B-INT4-MixedBlockSize-ONNX-WebGPU | 4B (base) | 262.144 configurados | ONNX + WebGPU, INT4 mixto | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible en esta información | safetensors (presumible) | Apache 2.0 | Hugging Face |
| Alternativas ONNX WebGPU de otros modelos | no disponible | no disponible | ONNX | variable | no disponible |

No se dispone de datos de benchmarks ni de otras exportaciones comparables en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es una exportación parcial: solo contiene el decodificador de texto, no componentes multimodales ni otras partes del modelo base.
- El límite de generación por defecto es de 4.096 tokens incluyendo el prompt, muy inferior a los 262.144 tokens de contexto configurados; hay que ajustar la configuración para aprovechar contextos largos.
- La cuantización INT4 con `accuracy_level=4` puede degradar la calidad frente al modelo en FP16/BF16; no se han publicado evaluaciones de la pérdida de rendimiento.
- Dependencia de WebGPU: la ejecución requiere un navegador con soporte WebGPU y drivers compatibles; el rendimiento y la estabilidad varían según plataforma.
- El autor del repo no es el desarrollador del modelo base; es una exportación de terceros sin validación documentada (0 descargas, 0 likes en el momento de la ficha).
- Riesgo de alucinación y sesgos: inherentes al modelo base Qwen3.5-4B; no se documentan evaluaciones específicas.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingüe para producción.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la atribución y revisar la licencia upstream del modelo base.
- No hay información sobre tool calling, agentes ni capacidades de razonamiento multi-paso en esta exportación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jianhui42/Qwen3.5-4B-INT4-MixedBlockSize-ONNX-WebGPU
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia upstream: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
