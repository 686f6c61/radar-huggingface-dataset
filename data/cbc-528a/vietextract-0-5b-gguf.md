# cbc-528a/vietextract-0.5b-gguf

## Resumen

ViExtract-EC 0.5B GGUF es la conversión al formato GGUF del modelo ViExtract-EC 0.5B, un ajuste fino de Qwen/Qwen2.5-0.5B-Instruct especializado en extracción de información estructurada a partir de conversaciones de comercio electrónico en vietnamita. Lo publica el usuario cbc-528a en Hugging Face bajo licencia Apache-2.0 y está pensado para ejecutarse en CPU o en máquinas con muy poca VRAM mediante llama.cpp.

El modelo resuelve un problema muy concreto: dado un esquema JSON plano con claves a `null` y un fragmento de chat, devuelve el mismo esquema con los valores copiados literalmente del texto, manteniendo `null` cuando el dato no aparece. No normaliza, no convierte tipos ni resuelve fechas; el contrato es de extracción verbatim, lo que simplifica su integración en pipelines deterministas.

Con 494 millones de parámetros y un contexto de entrenamiento de hasta 1024 tokens (prompt más respuesta), es relevante para quienes necesitan un extractor ligero, desplegable en local y sin GPU, con un rendimiento medido muy superior al modelo base en su tarea: F1 de campo exacto de 0,873 frente a 0,068 del base sobre 200 muestras reservadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-0.5B-Instruct) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens en los ejemplos de despliegue; entrenado con prompt + respuesta de hasta 1024 tokens |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0, FP16 |
| Idiomas soportados | vietnamita (vi) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer decoder-only Qwen2.5-0.5B-Instruct, convertido posteriormente a GGUF. La model card no detalla el volumen de tokens de entrenamiento ni la composición exacta del dataset; sí indica que los datos son sintéticos y de dominio específico (comercio electrónico vietnamita). El entrenamiento se realizó con un formato literal de bloques `### Instruction:` y `### Response:`, no con plantilla de chat.

La innovación principal no es arquitectónica sino de contrato: el modelo aprende a rellenar un esquema JSON plano copiando fragmentos verbatim del chat y dejando `null` cuando el dato no está presente. La evaluación reportada se hizo sobre el modelo FP16 con 200 muestras reservadas, y la conversión GGUF se verificó comparando la salida de Q4_K_M con la del FP16 en un chat de referencia, con resultado idéntico en contenido.

## Capacidades

- Extracción de información guiada por esquema: recibe un JSON plano con claves a `null` y devuelve las mismas claves con valores copiados del texto.
- Preservación de formato verbatim: no normaliza valores, no convierte tipos y no resuelve fechas (`"50k"` se mantiene `"50k"`).
- Manejo de ausencia de datos: mantiene `null` cuando la información no aparece en el chat.
- Procesamiento de conversaciones multi-turno de comercio electrónico en vietnamita.
- Generación de texto condicionada por instrucciones en formato `### Instruction:` / `### Response:`.
- No soporta tool calling ni function calling de forma nativa según la información disponible.
- No se documentan capacidades de agente, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Extracción de datos de pedidos en middleware de e-commerce: el modelo recibe el chat cliente-tienda y un esquema con campos como nombre, teléfono, dirección, producto, cantidad y precio, y devuelve el JSON relleno para alimentar el sistema de gestión de pedidos.
- Enriquecimiento por lotes de transcripciones de atención al cliente: con un throughput de 45 tok/s en generación sobre un i7-6700 sin GPU, una extracción típica de hasta 150 tokens de salida tarda unos 3-4 segundos, adecuado para procesamiento por lotes y no para chat en tiempo real.
- Despliegue en local sin GPU: los archivos Q4_K_M (379 MiB) y Q5_K_M (401 MiB) caben en portátiles y servidores pequeños, lo que permite ejecutar la extracción en el propio dispositivo sin enviar conversaciones a la nube.
- Servicio HTTP interno con `llama-server`: se puede levantar un endpoint en el puerto 8080 con contexto de 2048 tokens y temperatura 0 para integraciones deterministas.
- Validación de extracciones con red de seguridad barata: si un valor devuelto no es subcadena del chat, se sustituye por `null`; en 1688 campos evaluados esta comprobación se activó una sola vez.
- Prototipado de pipelines de información estructurada en vietnamita: sirve como extractor de referencia antes de escalar a modelos mayores, gracias a su bajo coste de cómputo y a su adherencia al esquema del 100 % medida en la evaluación.

## Benchmarks y rendimiento

Resultados medidos sobre el modelo FP16 con 200 muestras reservadas, según la model card:

| Metrica | Modelo base | ViExtract-EC 0.5B |
|---|---|---|
| Field F1 — span exacto | 0,068 | 0,873 |
| Field F1 — tolerante a límites | 0,142 | 0,933 |
| Adherencia al esquema | 98,5 % | 100 % |
| Coincidencia exacta del objeto completo | 0 % | 34 % |
| Sobreextracción | 10,5 % | 10,7 % |

Throughput medido en un i7-6700 de referencia sin offload a GPU, con Q4_K_M y un prompt de 211 tokens: 243 tok/s en procesamiento de prompt y 45 tok/s en generación.

## Requisitos de hardware

- VRAM estimada: no requiere GPU; con offload completo, los archivos Q4_K_M (379 MiB), Q5_K_M (401 MiB), Q8_0 (506 MiB) y FP16 (948 MiB) determinan el consumo de memoria.
- GPU recomendadas: no se especifican; el modelo está diseñado para CPU y máquinas de poca VRAM.
- Cabe en cualquier GPU de consumo con al menos 1-2 GB de memoria libre, y en CPU con RAM suficiente para el archivo elegido.
- Opciones de despliegue: `llama-cli`, `llama-server` y `llama-cpp-python`, según los ejemplos de la model card.
- Latencia y throughput: 243 tok/s de procesamiento de prompt y 45 tok/s de generación en el i7-6700 de referencia; una extracción típica de hasta 150 tokens de salida tarda unos 3-4 segundos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| ViExtract-EC 0.5B GGUF | 494 M | 2048 en despliegue; entrenado a 1024 | Extracción guiada por esquema en vietnamita | Apache-2.0 | GGUF |
| Qwen2.5-0.5B-Instruct (base) | 494 M | no disponible en la información | Generación de texto general | Apache-2.0 | safetensors, GGUF |
| ViExtract-EC 0.5B (FP16) | 494 M | 1024 en entrenamiento | Extracción guiada por esquema en vietnamita | Apache-2.0 | safetensors |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado únicamente con datos sintéticos y de dominio específico (comercio electrónico vietnamita); el rendimiento fuera de ese dominio no está garantizado.
- Capacidad limitada por el tamaño de 0,5B: la coincidencia exacta del objeto completo es del 34 %, aunque la F1 por campo es alta.
- Entrenado con prompt más respuesta de hasta 1024 tokens; las conversaciones largas deben trocearse.
- No debe aplicarse plantilla de chat: usar tokens `<|im_start|>` degrada gravemente la salida; hay que emplear el formato literal `### Instruction:` / `### Response:`.
- Riesgo de alucinación mitigado parcialmente por el contrato verbatim y la comprobación de subcadena, pero la sobreextracción medida es del 10,7 %.
- Solo soporta vietnamita; no se documentan capacidades multilingües.
- Licencia Apache-2.0, que permite uso comercial; el modelo base es Qwen2.5-0.5B-Instruct, también Apache-2.0.
- La model card enlaza el modelo FP16 a una URL de organización genérica (`YOUR_ORG`), por lo que el enlace al modelo original puede no estar resuelto.

## Enlaces

- Hugging Face: https://huggingface.co/cbc-528a/vietextract-0.5b-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Modelo FP16 referenciado (URL sin resolver en la model card): https://huggingface.co/YOUR_ORG/vietextract-0.5b
