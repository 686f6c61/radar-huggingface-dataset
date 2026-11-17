# jianhui42/Ternary-Bonsai-2-2B-PQ2_0-ONNX-WebGPU

## Resumen

Ternary-Bonsai-2-2B-PQ2_0-ONNX-WebGPU es una exportación a formato ONNX del checkpoint cuantizado a 2 bits `Ternary-Bonsai-2-2B-PQ2_0.gguf`, publicada por el usuario jianhui42. El objetivo del paquete es permitir la ejecución del modelo de texto directamente en el navegador mediante ONNX Runtime con el execution provider WebGPU, sin necesidad de servidor ni backend Python. El repositorio contiene el grafo del decodificador completo (24 capas) junto con los pesos externos, el tokenizador y la plantilla de chat.

El modelo subyacente, Ternary-Bonsai-2-2B, corresponde a una arquitectura de decodificador de texto de la familia Qwen3.5 (`qwen3_5_text`) con 2.048 dimensiones ocultas, 8 cabezas de atención y 2 cabezas KV, y un vocabulario de 248.320 tokens. La exportación conserva los códigos ternarios empaquetados PQ2 (2 bits por peso, block size 128) y las escalas en FP16 sin recuantizar, mientras que los tensores flotantes del grafo y el estado recurrente se mantienen en FP16.

La relevancia de esta ficha radica en su nicho: es un artefacto de despliegue edge/browser, no un modelo entrenado desde cero. El contexto exportado está limitado a 2.048 tokens y el paquete no incluye codificadores de imagen ni audio, por lo que se trata exclusivamente de un decodificador de texto. La licencia Apache 2.0 del modelo origen se mantiene en esta exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 text decoder (`qwen3_5_text`), transformer con atención híbrida |
| Parametros totales | no disponible (repo de 0,5 GB; pesos externos de 507.822.080 bytes) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2.048 tokens (límite exportado) |
| Tipos de cuantizacion | PQ2 ternario a 2 bits, block_size=128, accuracy_level=4, zero point explícito empaquetado como `0x55`; tensores flotantes y estado recurrente en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data` externo), tokenizer JSON, plantilla Jinja |

## Arquitectura y entrenamiento

La arquitectura es un decodificador de texto Qwen3.5 con 24 capas, hidden size de 2.048, 8 cabezas de atención y 2 cabezas KV (GQA). La atención es híbrida: 18 nodos `LinearAttention` y 6 nodos `GroupQueryAttention`. El exportador expande GatedDeltaNet en compuertas y `LinearAttention`, y aplica transformadas de Hadamard basadas en matrices. El vocabulario es de 248.320 tokens.

No se dispone de información sobre el proceso de entrenamiento del modelo original (número de tokens, composición del dataset, RLHF/DPO) en la documentación proporcionada. La innovación técnica destacable de este artefacto es la preservación de la cuantización ternaria PQ2 empaquetada a 2 bits dentro de un grafo ONNX ejecutable con `MatMulNBits`, lo que permite inferencia en WebGPU con pesos de aproximadamente 508 MB.

## Capacidades

- Generación de texto y conversación (pipeline `text-generation`, tag `conversational`).
- Formato de prompt de chat mediante `chat_template.jinja`.
- Ejecución en navegador vía ONNX Runtime WebGPU.
- Atención híbrida con componentes lineales (LinearAttention) y GQA.
- No incluye codificador de imagen ni de audio: es solo decodificador de texto.
- Soporte de tool calling, agentes, matemáticas avanzadas o modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no declarados).

## Casos de uso

- Demo interactiva de chat en navegador: el paquete ONNX con WebGPU permite ejecutar el decodificador sin backend, usando `chat_template.jinja` para formatear turnos y el estado recurrente FP16 para mantener contexto entre tokens.
- Prototipado de aplicaciones web offline-first: al pesar unos 508 MB de pesos, puede cachearse en el navegador y ofrecer generación de texto sin conexión tras la primera carga.
- Evaluación de cuantización ternaria en edge: sirve para medir calidad y latencia de pesos PQ2 a 2 bits frente a FP16 en hardware de cliente con WebGPU.
- Generación de texto acotada a 2.048 tokens: adecuada para respuestas cortas, resúmenes breves o autocompletado en interfaces web donde el contexto largo no es requisito.
- Integración en entornos sin Python: al ser ONNX puro, se puede desplegar en runtimes JS/WebAssembly y en otras plataformas compatibles con ONNX Runtime.
- Pruebas de compatibilidad de `MatMulNBits` con accuracy_level=4: útil para validar kernels de cuantización de 2 bits en GPUs de consumo vía WebGPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos externos: 507.822.080 bytes (aproximadamente 508 MB) en `model.onnx.data`.
- VRAM estimada: no disponible de forma explícita; el tamaño de pesos sugiere un consumo base en torno a 0,5 GB más overhead de activaciones FP16 y estado recurrente.
- GPU recomendadas: no disponible. Requiere un navegador con soporte de WebGPU (Chrome/Edge con WebGPU habilitado, Safari reciente).
- GPU de consumo: el tamaño de pesos es compatible con GPUs integradas y discretas modernas, pero no se aportan cifras de latencia ni throughput.
- Opciones de despliegue: ONNX Runtime con execution provider WebGPU (navegador); otros backends ONNX Runtime no documentados en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Ternary-Bonsai-2-2B-PQ2_0-ONNX-WebGPU | no disponible (repo 0,5 GB) | 2.048 | PQ2 2 bits + FP16 | Apache 2.0 | ONNX |
| Ternary-Bonsai-2-2B-gguf (origen) | no disponible | no disponible | PQ2 2 bits | Apache 2.0 | GGUF |
| Alternativas de 2B en ONNX WebGPU | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Contexto exportado limitado a 2.048 tokens; no apto para tareas que requieran ventanas largas.
- Solo decodificador de texto: no hay codificador de imagen ni audio.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- La cuantización ternaria a 2 bits puede degradar la calidad respecto al modelo en FP16; no se aportan métricas de evaluación.
- Riesgo de alucinación y sesgos: no documentado en la model card.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validación comunitaria.
- Es una exportación de terceros (jianhui42), no oficial del autor original del modelo; conviene verificar la integridad de los pesos externos y respetar los avisos de atribución de `NOTICE.txt`.
- El nombre del archivo `model.onnx.data` está referenciado en el grafo con offsets y longitudes; renombrarlo rompe la carga.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar `LICENSE` y `NOTICE.txt`.

## Enlaces

- Hugging Face: https://huggingface.co/jianhui42/Ternary-Bonsai-2-2B-PQ2_0-ONNX-WebGPU
- Modelo origen GGUF: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Checkpoint origen PQ2: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf/blob/main/Ternary-Bonsai-2-2B-PQ2_0.gguf
- Licencia origen: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf/blob/main/NOTICE.txt
