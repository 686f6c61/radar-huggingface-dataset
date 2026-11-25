# jianhui42/Qwen3.5-4B-INT8-MixedBlockSize-ONNX-WebGPU

## Resumen

Qwen3.5-4B-INT8-MixedBlockSize-ONNX-WebGPU es una exportación a formato ONNX del decodificador de texto del modelo Qwen3.5-4B, publicada por el usuario jianhui42. El objetivo no es ofrecer un modelo nuevo, sino un artefacto listo para ejecutarse en navegador o en entornos basados en ONNX Runtime mediante el execution provider WebGPU. El paquete incluye el grafo completo de 32 capas, los pesos cuantizados a INT8 con una estrategia mixta de cuantización por canal y por bloques, el tokenizador y la plantilla de chat.

La relevancia de esta ficha radica en su enfoque de despliegue: permite llevar un modelo de 4B parámetros a inferencia local en cliente (WebGPU) con un peso total de aproximadamente 5,79 GB, sin depender de un servidor GPU dedicado. La arquitectura del modelo base combina capas de atención lineal (`GatedDeltaNet`) con atención clásica de consulta agrupada (`GroupQueryAttention`), lo que reduce el coste del caché KV en contextos largos.

El modelo está pensado para generación de texto y conversación, con una ventana de contexto configurada de 262.144 tokens y un límite por defecto de generación total de 4.096 tokens (incluyendo el prompt). La licencia Apache 2.0 del modelo base se mantiene en esta exportación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 text decoder (`qwen3_5_text`), híbrida con 24 capas `GatedDeltaNet` y 8 capas `GroupQueryAttention` |
| Parámetros totales | 4B (modelo base Qwen3.5-4B); no se detalla desglose exacto en la información disponible |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 262.144 tokens configurados; límite de generación por defecto de 4.096 tokens incluyendo el prompt |
| Tipos de cuantización | INT8 con bloques mixtos (por canal para dimensión de entrada 4.096; bloques de 32 elementos para dimensiones 2.560 y 9.216); embeddings en FP16; cabeza de salida INT8 con `block_size=32`; caché KV y estado convolucional en FP16; estado recurrente en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX con pesos externos (`model.onnx.data_0`, `.data_1`, `.data_2`); total 5.791.294.464 bytes (≈5,79 GB) |

Otros datos técnicos del export: 32 capas de decodificador, tamaño oculto 2.560, 16 cabezas de atención y 4 cabezas KV, tamaño de cabeza 256, vocabulario de 248.320 tokens, 153 nodos `MatMulNBits` con `accuracy_level=4` y 48 nodos `MatMul` ordinarios.

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B emplea una arquitectura de transformer híbrida en la que la mayoría de capas (24 de 32) usan `GatedDeltaNet`, un mecanismo de atención lineal con estado recurrente, y las 8 restantes usan `GroupQueryAttention` con 16 cabezas de consulta y 4 cabezas KV. Esta combinación reduce el crecimiento del caché KV en secuencias largas, lo que explica que se pueda configurar un contexto de 262.144 tokens. El tamaño oculto es de 2.560 y el vocabulario de 248.320 tokens.

La información disponible no detalla el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). Lo que sí se documenta es el proceso de exportación y cuantización: el grafo ONNX contiene 153 nodos `MatMulNBits` con pesos INT8 y `accuracy_level=4`, con escalas en FP16 y almacenamiento UINT8. Las matrices con dimensión de entrada 4.096 usan una escala por canal de salida, mientras que las de dimensiones 2.560 y 9.216 usan bloques de 32 elementos. La tabla de embeddings se mantiene en FP16 y la cabeza de salida se cuantiza a INT8 con bloques de 32.

## Capacidades

- Generación de texto y conversación multi-turno mediante la plantilla de chat incluida (`chat_template.jinja`).
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.5-4B.
- Procesamiento de contextos largos: ventana configurada de 262.144 tokens, aunque el límite de generación por defecto es de 4.096 tokens incluyendo el prompt.
- Inferencia en cliente mediante ONNX Runtime con el execution provider WebGPU.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en navegador: el paquete ONNX con WebGPU permite ejecutar el modelo directamente en el cliente sin backend GPU, usando el tokenizador y la plantilla de chat incluidos. Adecuado para demos y aplicaciones de privacidad donde los datos no salen del dispositivo.
- Prototipado de aplicaciones de chat sin infraestructura: al pesar 5,79 GB y ejecutarse sobre ONNX Runtime, se puede desplegar en entornos con WebGPU disponible para validar flujos conversacionales antes de migrar a un servidor.
- Procesamiento de documentos largos con contexto extendido: la ventana de 262.144 tokens permite cargar documentos extensos, aunque el límite de generación de 4.096 tokens obliga a controlar la longitud de la respuesta.
- Educación y experimentación: útil para estudiar el comportamiento de un transformer híbrido con `GatedDeltaNet` y atención clásica en un entorno controlado y con pesos cuantizados.
- Evaluación de cuantización INT8 mixta: sirve como referencia para comparar la calidad de la cuantización por canal frente a la cuantización por bloques en un modelo de 4B.
- Inferencia en dispositivos con recursos limitados: el formato INT8 reduce el peso a 5,79 GB, lo que permite ejecutarlo en equipos con GPU integrada compatible con WebGPU, aunque con latencia mayor que en GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos externos suman 5,79 GB; con caché KV en FP16 y estado recurrente en FP32, el consumo real supera ese valor y depende de la longitud de contexto utilizada. No se proporcionan cifras exactas.
- GPU recomendadas: no disponibles en la información proporcionada. El execution provider es WebGPU, orientado a GPUs accesibles desde navegador.
- Compatibilidad con GPU de consumo: el diseño WebGPU apunta a GPUs integradas y dedicadas de consumo, pero no se especifican modelos concretos ni requisitos mínimos.
- Opciones de despliegue: ONNX Runtime con el execution provider WebGPU. No se documentan otras alternativas (vLLM, llama.cpp, Ollama, TGI) para este artefacto.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-INT8-MixedBlockSize-ONNX-WebGPU (este) | 4B | 262.144 tokens configurados | ONNX + pesos externos, INT8 mixto | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | 4B | no disponible en la información proporcionada | safetensors (presumible, no confirmado) | Apache 2.0 | Hugging Face |
| Otras exportaciones ONNX de Qwen3.5-4B | 4B | no disponible | ONNX | Apache 2.0 (heredada) | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Al ser una exportación cuantizada a INT8, puede haber una pérdida de calidad respecto al modelo base en FP16/BF16; no se documenta la magnitud de esa pérdida.
- El límite de generación por defecto es de 4.096 tokens incluyendo el prompt, muy inferior al contexto configurado de 262.144 tokens; hay que ajustar la configuración para aprovechar contextos largos.
- Solo se exporta el decodificador de texto: no hay componentes de visión, audio ni otras modalidades.
- No se especifican los idiomas soportados ni el comportamiento multilingüe del export.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base y de los datasets de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de validación por parte de la comunidad.
- El despliegue depende de la disponibilidad y madurez del execution provider WebGPU de ONNX Runtime, que puede variar según navegador y hardware.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jianhui42/Qwen3.5-4B-INT8-MixedBlockSize-ONNX-WebGPU
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
