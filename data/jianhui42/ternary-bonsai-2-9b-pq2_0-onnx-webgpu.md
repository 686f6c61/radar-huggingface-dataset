# jianhui42/Ternary-Bonsai-2-9B-PQ2_0-ONNX-WebGPU

## Resumen

Ternary-Bonsai-2-9B-PQ2_0-ONNX-WebGPU es una exportación a formato ONNX del modelo cuantizado de 2 bits Ternary-Bonsai-2-9B-PQ2_0, publicada por el usuario jianhui42. El objetivo es permitir la inferencia del modelo directamente en navegador mediante ONNX Runtime y el execution provider WebGPU, sin necesidad de backend ni servidor. El paquete incluye las 32 capas del decodificador y los activos del tokenizer extraídos del checkpoint GGUF original, preservando los códigos PQ2 de 2 bits y las escalas FP16 sin recuantización.

El modelo base emplea la arquitectura del decodificador de texto Qwen3.5 (`qwen3_5_text`), con 32 capas, tamaño oculto de 4.096, 16 cabezas de atención y 4 cabezas KV, y un vocabulario de 248.320 tokens. La exportación fija el contexto en 2.048 tokens y combina 24 nodos de `LinearAttention` con 8 de `GroupQueryAttention`, resultado de expandir el mecanismo GatedDeltaNet en puertas y atención lineal mediante transformadas de Hadamard basadas en matrices.

La relevancia de esta ficha reside en su naturaleza de artefacto de despliegue: no es un modelo entrenado desde cero, sino una conversión orientada a ejecución local en el navegador con pesos de 2 bits. El repositorio ocupa 2,4 GB y se distribuye bajo licencia Apache 2.0, heredada del modelo fuente. No incluye codificador de imagen ni de audio, por lo que se limita a generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 text decoder (`qwen3_5_text`), 32 capas, 24 `LinearAttention` y 8 `GroupQueryAttention` |
| Parametros totales | no disponible (denominación comercial 9B; el paquete ONNX pesa 2,41 GB en pesos de 2 bits) |
| Parametros activos | no disponible |
| Longitud de contexto | 2.048 tokens (cota exportada) |
| Tipos de cuantizacion | PQ2 de 2 bits con escalas FP16; operador `MatMulNBits` con bits=2, block_size=128, accuracy_level=4; zero point explícito empaquetado como `0x55` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` con pesos externos en `model.onnx.data` y `model.onnx.data.1`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al decodificador de texto de Qwen3.5, un transformer con 32 capas, tamaño oculto de 4.096 y un vocabulario de 248.320 tokens. La particularidad es la combinación de atención: 24 capas usan `LinearAttention` y 8 usan `GroupQueryAttention` con 16 cabezas de consulta y 4 cabezas KV. El exportador expande el mecanismo GatedDeltaNet en puertas y atención lineal, y aplica transformadas de Hadamard basadas en matrices para la conversión.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF o DPO) en la documentación proporcionada. La exportación no recuantiza: conserva los códigos PQ2 de 2 bits originales del checkpoint GGUF y mantiene las escalas y los tensores flotantes del grafo, así como el estado recurrente, en FP16. El paquete exporta únicamente el decodificador de texto, sin codificador de imagen ni de audio.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (`text-generation`, `conversational`).
- Razonamiento y generación de código: no confirmado explícitamente en la documentación disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el paquete no incluye codificador de imagen ni de audio.
- Ejecución en navegador mediante ONNX Runtime con el execution provider WebGPU.

## Casos de uso

- Demos interactivas en navegador: el paquete está pensado para ejecutar generación de texto directamente en el cliente con WebGPU, sin backend, lo que permite prototipos y demostraciones públicas sin coste de servidor.
- Aplicaciones de privacidad por diseño: al ejecutarse localmente en el navegador, los prompts no salen del dispositivo del usuario, adecuado para entornos con requisitos de confidencialidad.
- Asistentes conversacionales ligeros: con 2.048 tokens de contexto y pesos de 2 bits, encaja en escenarios de chat de turnos cortos donde el coste de memoria es crítico.
- Educación y experimentación: útil para estudiar técnicas de cuantización extrema (2 bits) y despliegue ONNX/WebGPU en cursos y laboratorios.
- Prototipado de interfaces de IA sin infraestructura: equipos de frontend pueden integrar el modelo en una web estática y validar flujos de producto antes de invertir en servidores.
- Pruebas de viabilidad de modelos cuantizados: sirve como banco de pruebas para medir latencia y calidad de un modelo de 2 bits en hardware de consumo antes de adoptar variantes mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el paquete de pesos ocupa 2.409.445.376 bytes (aproximadamente 2,41 GB); el consumo en ejecución será superior por el estado recurrente, las cachés KV y los tensores FP16 del grafo, aunque no se especifica una cifra concreta.
- GPU recomendadas: no disponible; el requisito es un navegador con soporte de WebGPU y un adaptador gráfico compatible con ONNX Runtime WebGPU.
- ¿Cabe en GPU de consumo? Los pesos de 2,41 GB sugieren que sí en muchas GPU de consumo modernas con soporte WebGPU, pero no se confirma en la documentación.
- Opciones de despliegue: ONNX Runtime con el execution provider WebGPU; los ficheros deben mantenerse juntos en un mismo directorio (`model.onnx`, `model.onnx.data`, `model.onnx.data.1`, `genai_config.json`, `tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni modelos comparables de la misma categoría (exportaciones ONNX/WebGPU de modelos cuantizados a 2 bits).

## Limitaciones y advertencias

- Contexto limitado a 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Cuantización de 2 bits: degradación de calidad esperable frente a pesos de mayor precisión; no hay benchmarks publicados que la cuantifiquen.
- Solo decodificador de texto: no incluye codificador de imagen ni de audio, pese a que el modelo base Qwen3.5 pueda tener capacidades multimodales.
- Idiomas soportados no declarados; no se puede garantizar un rendimiento multilingüe.
- Dependencia de WebGPU: requiere navegador y hardware compatibles; el soporte varía entre plataformas.
- Riesgo de alucinación y sesgos: no documentados en la ficha; aplican los del modelo base, no evaluados aquí.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse la atribución del NOTICE y la LICENSE incluidos.
- Repositorio sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jianhui42/Ternary-Bonsai-2-9B-PQ2_0-ONNX-WebGPU
- Modelo fuente GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/main/Ternary-Bonsai-2-9B-PQ2_0.gguf
- Repositorio del modelo fuente: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Licencia del modelo fuente: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/main/LICENSE
- NOTICE del modelo fuente: https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf/blob/main/NOTICE.txt
