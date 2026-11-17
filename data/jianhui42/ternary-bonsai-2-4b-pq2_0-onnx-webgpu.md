# jianhui42/Ternary-Bonsai-2-4B-PQ2_0-ONNX-WebGPU

## Resumen

Ternary-Bonsai-2-4B-PQ2_0-ONNX-WebGPU es la exportación a formato ONNX del checkpoint cuantizado a 2 bits `Ternary-Bonsai-2-4B-PQ2_0.gguf`, publicada por el usuario jianhui42. El paquete está pensado para ejecutar el modelo de generación de texto en el navegador mediante ONNX Runtime y el execution provider WebGPU, manteniendo intactos los códigos ternarios PQ2 y las escalas FP16 del GGUF original, sin recuantizar. Incluye las 32 capas del decodificador y los activos del tokenizador.

El modelo subyacente, Ternary-Bonsai-2-4B, emplea una arquitectura de decodificador de texto Qwen3.5 (`qwen3_5_text`) con 2.560 dimensiones ocultas, 16 cabezas de atención y 4 cabezas KV, y un vocabulario de 248.320 tokens. La exportación fija un límite de contexto de 2.048 tokens y combina 24 nodos `LinearAttention` con 8 nodos `GroupQueryAttention`, fruto de expandir GatedDeltaNet en compuertas y atención lineal.

Su relevancia radica en que habilita la inferencia local en navegador de un modelo de 4B con pesos de 2 bits (1,14 GB de pesos externos), lo que reduce drásticamente los requisitos de memoria y permite desplegar generación de texto sin servidor dedicado. La licencia Apache 2.0 del modelo original se mantiene en la exportación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador de texto Qwen3.5 (`qwen3_5_text`), transformer con atención híbrida (LinearAttention + GroupQueryAttention) |
| Parámetros totales | no disponible (modelo base de 4B según el nombre; el export no declara el recuento exacto) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | 2.048 tokens (límite de la exportación) |
| Tipos de cuantización | 2 bits (PQ2, `MatMulNBits`, bits=2, block_size=128, accuracy_level=4); tensores flotantes y estado recurrente en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` con pesos externos `model.onnx.data`, 1.136.043.520 bytes) |

## Arquitectura y entrenamiento

La exportación reproduce un decodificador de texto con 32 capas, tamaño oculto de 2.560, 16 cabezas de atención y 4 cabezas KV, y vocabulario de 248.320 tokens. La atención es híbrida: el exportador expande GatedDeltaNet en compuertas y `LinearAttention`, generando 24 nodos `LinearAttention` y 8 nodos `GroupQueryAttention`, y aplica transformadas de Hadamard basadas en matrices. Los operadores de matriz cuantizada usan `MatMulNBits` con 2 bits, block_size 128 y accuracy_level 4; el punto cero PQ2 es explícito (valor 1, empaquetado como `0x55`). Los tensores flotantes del grafo y el estado recurrente se mantienen en FP16, mientras que los pesos PQ2 permanecen empaquetados a 2 bits sin recuantización.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens, ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineación. El paquete exporta únicamente el decodificador de texto: no incluye codificador de imagen ni de audio. Tampoco se documentan innovaciones de decodificación especulativa ni detalles adicionales del proceso de entrenamiento.

## Capacidades

- Generación de texto conversacional, según la etiqueta `text-generation` y la plantilla de chat incluida (`chat_template.jinja`).
- Formato de prompt de chat mediante plantilla Jinja con tokens especiales definidos en `tokenizer_config.json`.
- Vocabulario amplio (248.320 tokens) que favorece la cobertura multilingüe, aunque los idiomas concretos no están declarados.
- Ejecución en navegador mediante ONNX Runtime y WebGPU, con configuración de decodificador, caché y execution provider en `genai_config.json`.
- Soporte de estado recurrente en FP16 para la atención lineal.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Demos de generación de texto en navegador: el paquete ONNX con WebGPU permite ejecutar el modelo sin backend, cargando los 1,14 GB de pesos externos en el cliente, adecuado para prototipos y demostraciones interactivas.
- Aplicaciones web con privacidad por diseño: al ejecutarse en el dispositivo del usuario, los prompts no salen del navegador, lo que encaja en escenarios con datos sensibles y contexto de hasta 2.048 tokens.
- Asistentes conversacionales ligeros embebidos: la plantilla de chat y el tokenizador incluidos permiten montar un chatbot multi-turno dentro de una aplicación web estática.
- Pruebas de cuantización extrema: útil para evaluar el comportamiento de pesos ternarios PQ2 a 2 bits en tareas de texto y comparar calidad frente a FP16.
- Educación y experimentación: sirve para estudiar atención híbrida (LinearAttention y GroupQueryAttention) y despliegue ONNX WebGPU en entornos docentes.
- Prototipado offline en entornos sin GPU dedicada: al no requerir servidor, permite validar flujos de generación en equipos con navegadores compatibles con WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos externos de 1.136.043.520 bytes (aproximadamente 1,14 GB), lo que reduce la huella de memoria frente a un modelo de 4B en FP16.
- Ejecución prevista en navegadores con soporte de WebGPU; no se especifican GPU concretas (A100, H100, RTX 4090) en la documentación.
- Por su tamaño, es plausible su ejecución en GPU de consumo con WebGPU, pero no se confirma en la información disponible.
- Despliegue mediante ONNX Runtime con el execution provider WebGPU; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput no disponibles.
- Límite de contexto de 2.048 tokens en esta exportación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-4B-PQ2_0-ONNX-WebGPU | 4B (según nombre; recuento no disponible) | 2.048 | 2 bits PQ2 + FP16 | Apache 2.0 | ONNX (WebGPU) |
| Ternary-Bonsai-2-4B-PQ2_0 (GGUF original) | 4B (según nombre) | no disponible | 2 bits PQ2 | Apache 2.0 | GGUF |
| Alternativas de 4B en ONNX WebGPU | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con modelos alternativos.

## Limitaciones y advertencias

- Contexto limitado a 2.048 tokens en esta exportación, insuficiente para tareas de contexto largo.
- Solo incluye el decodificador de texto; no hay codificador de imagen ni de audio.
- Cuantización a 2 bits: cabe esperar degradación de calidad respecto al modelo en precisión completa, aunque no se aportan métricas.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de fidelidad.
- Idiomas soportados no declarados; el comportamiento multilingüe no está garantizado.
- Sesgos conocidos no documentados.
- Dependencia de ONNX Runtime y WebGPU: requiere navegadores y drivers compatibles; el rendimiento puede variar según el cliente.
- El archivo de pesos externo debe conservar su nombre y ubicarse junto al grafo, ya que `model.onnx` registra nombre, offsets y longitudes.
- Licencia Apache 2.0 permite uso comercial, pero deben conservarse `LICENSE` y `NOTICE.txt` con las atribuciones del modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/jianhui42/Ternary-Bonsai-2-4B-PQ2_0-ONNX-WebGPU
- Repositorio GGUF de origen: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf
- Checkpoint fuente: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf/blob/main/Ternary-Bonsai-2-4B-PQ2_0.gguf
- Licencia del modelo original: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/prism-ml/Ternary-Bonsai-2-4B-gguf/blob/main/NOTICE.txt
