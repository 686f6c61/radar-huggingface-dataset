# jianhui42/Ternary-Bonsai-2-27B-PQ2_0-ONNX-WebGPU

## Resumen

Ternary-Bonsai-2-27B-PQ2_0-ONNX-WebGPU es una exportación a formato ONNX del checkpoint ternario cuantizado Ternary-Bonsai-2-27B-PQ2_0, originalmente distribuido como GGUF por prism-ml. El paquete lo publica el usuario jianhui42 y está pensado para ejecutar generación de texto directamente en el navegador mediante ONNX Runtime con el execution provider WebGPU. El modelo base declarado en la model card es Qwen3.8-27B, con una configuración de decodificador de 64 capas, hidden size de 5.120 y vocabulario de 248.320 tokens.

La relevancia de esta ficha radica en su naturaleza híbrida: combina pesos ternarios empaquetados a 2 bits (formato PQ2) con una arquitectura que mezcla atención lineal y atención con query agrupada (GQA), lo que permite reducir drásticamente el peso en disco (7,25 GB en cuatro shards) frente a un modelo de 27B en FP16. Está orientado a despliegues client-side sin servidor, donde el cómputo se delega a la GPU del navegador vía WebGPU.

No obstante, conviene subrayar que se trata de una conversión de formato, no de un modelo nuevo: el autor no aporta datos de entrenamiento, benchmarks ni evaluación de calidad. La información disponible se limita a la configuración del grafo ONNX y a los detalles de cuantización heredados del GGUF original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (48 nodos LinearAttention + 16 nodos GroupQueryAttention), configuración `qwen3_5_text` |
| Parametros totales | no disponible (modelo base de 27B declarado, sin desglose exacto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2.048 tokens (límite exportado en el grafo ONNX) |
| Tipos de cuantizacion | 2 bits (PQ2) con block_size=128, accuracy_level=4, zero point explícito empaquetado como `0x55`; tensores flotantes y estado recurrente en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` + 4 shards `model.onnx.data*`), tokenizer en JSON y plantilla de chat Jinja |

## Arquitectura y entrenamiento

El grafo exportado contiene 64 capas de decodificador con hidden size de 5.120, 24 cabezas de atención y 4 cabezas KV (GQA). La innovación estructural es la combinación de 48 nodos `LinearAttention` con 16 nodos `GroupQueryAttention`: el exportador expande GatedDeltaNet en compuertas y atención lineal, y aplica transformadas de Hadamard basadas en matrices. Los operadores de multiplicación de matrices cuantizadas usan `MatMulNBits` con 2 bits y block_size de 128, preservando los códigos PQ2 originales y las escalas FP16 sin recuantizar.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente describe el proceso de conversión desde GGUF a ONNX y el troceado de pesos externos en cuatro shards de menos de 2.000.000.000 bytes cada uno (1.994.192.896, 1.990.887.424, 1.999.122.432 y 1.262.580.736 bytes, respectivamente). El paquete exporta solo el decodificador de texto: no incluye codificador de imagen ni de audio.

## Capacidades

- Generación de texto autoregresiva y conversación multi-turno, con plantilla de chat incluida (`chat_template.jinja`).
- Razonamiento y respuesta conversacional, heredados del modelo base Qwen3.8-27B (sin evaluación publicada en esta exportación).
- Ejecución en navegador mediante ONNX Runtime y el execution provider WebGPU.
- Soporte de estado recurrente en FP16 para las capas de atención lineal.
- Tokenizer completo con vocabulario de 248.320 entradas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Sin modo thinking, visión ni audio en este paquete.

## Casos de uso

- Demo interactiva en navegador: el paquete está diseñado para cargarse con ONNX Runtime Web y WebGPU, permitiendo un chat de texto sin backend ni instalación, con los 7,25 GB de pesos servidos como ficheros estáticos.
- Prototipado de aplicaciones client-side: útil para validar interfaces conversacionales antes de migrar a un despliegue servidor con mayor contexto y precisión.
- Evaluación de cuantización ternaria: sirve para medir en práctica la degradación de calidad de pesos PQ2 frente al modelo base en tareas de generación corta.
- Educación y divulgación: permite mostrar en un navegador cómo funciona un modelo de 27B cuantizado a 2 bits sin infraestructura GPU dedicada.
- Pruebas de compatibilidad WebGPU: adecuado para verificar el soporte de `MatMulNBits` y atención lineal en distintos navegadores y drivers.
- Generación de texto offline en entornos controlados: con los ficheros servidos localmente, se puede usar sin conexión externa una vez cargados los shards.
- Benchmarking de latencia en cliente: permite comparar el rendimiento de WebGPU frente a CPU en un modelo de gran tamaño y baja precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso total de pesos: 7.246.783.488 bytes (aproximadamente 7,25 GB) en cuatro shards; deben mantenerse juntos y con los nombres originales.
- VRAM estimada: no disponible de forma oficial; por el tamaño de los pesos, se requiere al menos espacio para los 7,25 GB de pesos más el estado recurrente y las activaciones en FP16, por lo que conviene disponer de 10-12 GB de memoria gráfica accesible.
- GPU recomendadas: no disponibles; el modelo depende de WebGPU, por lo que la compatibilidad vendrá determinada por el navegador y el driver (Chrome/Edge con WebGPU habilitado).
- ¿Cabe en GPU consumer? Previsiblemente sí en tarjetas con 12 GB o más de VRAM y soporte WebGPU, aunque no hay confirmación del autor.
- Opciones de despliegue: ONNX Runtime con execution provider WebGPU; también podría ejecutarse con ONNX Runtime nativo, aunque no se documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-27B-PQ2_0-ONNX-WebGPU | 27B (base declarado) | 2.048 | 2 bits PQ2 + FP16 | Apache 2.0 | ONNX |
| Ternary-Bonsai-2-27B-PQ2_0 (GGUF, prism-ml) | 27B (base declarado) | no disponible | 2 bits PQ2 | Apache 2.0 | GGUF |
| Qwen3.8-27B (base declarado) | 27B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Contexto limitado a 2.048 tokens en el grafo exportado, muy inferior al que suele manejar el modelo base.
- Cuantización agresiva a 2 bits: cabe esperar degradación de calidad frente al modelo en FP16, aunque no se aportan métricas.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- No hay benchmarks ni evaluación de alucinación publicados por el autor de la exportación.
- Solo incluye el decodificador de texto; no hay codificador de imagen ni de audio.
- Requiere mantener los cuatro shards con nombres y tamaños exactos; cualquier renombrado rompe las referencias del grafo.
- Dependencia de WebGPU: la compatibilidad variará según navegador, sistema operativo y driver.
- Licencia Apache 2.0 permite uso comercial, pero deben conservarse `LICENSE` y `NOTICE.txt` con las atribuciones del modelo original.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria.
- El autor no documenta el proceso de entrenamiento ni el origen exacto de los datos, lo que limita la reproducibilidad.

## Enlaces

- [Hugging Face: jianhui42/Ternary-Bonsai-2-27B-PQ2_0-ONNX-WebGPU](https://huggingface.co/jianhui42/Ternary-Bonsai-2-27B-PQ2_0-ONNX-WebGPU)
- [GGUF de origen: prism-ml/Ternary-Bonsai-2-27B-gguf](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf)
- [Checkpoint PQ2_0 en GGUF](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/main/Ternary-Bonsai-2-27B-PQ2_0.gguf)
- [Licencia del modelo de origen](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/main/LICENSE)
- [NOTICE de atribución](https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/main/NOTICE.txt)
