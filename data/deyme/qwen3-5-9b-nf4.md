# Deyme/Qwen3.5-9B-NF4

## Resumen

Qwen3.5-9B-NF4 es una cuantización de 4 bits en formato NF4 (NormalFloat4) del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario Deyme. El checkpoint está empaquetado en el formato nativo de Hugging Face Transformers con bitsandbytes, de modo que los pesos cuantizados se cargan directamente sin necesidad de recuantizar el modelo BF16 original en cada arranque. El objetivo declarado es ofrecer inferencia interactiva viable en GPUs de la clase de 16 GB, en particular la NVIDIA T4 que Google Colab asigna en su nivel gratuito.

El modelo base es un vision-language de 9.409.813.744 parámetros (unos 9,41 mil millones) con pipeline `image-text-to-text`, lo que implica que acepta entradas de imagen y texto y genera texto. La cuantización se aplicó con bitsandbytes 4-bit NF4, doble cuantización activada, cómputo en FP16 y almacenamiento `uint8`, sin listas de módulos excluidos, por lo que el torre visual también queda cuantizado. El repositorio ocupa 7,9 GB y contiene 11 ficheros sellados con hashes SHA-256, incluidos cuatro shards de safetensors.

La relevancia de esta ficha es doble: por un lado, documenta una vía práctica para ejecutar un modelo multimodal de casi 10 000 millones de parámetros en hardware modesto; por otro, el propio autor es explícito sobre los límites de la validación realizada, que confirma integridad del artefacto y carga en CUDA pero no establece equivalencia de calidad con el modelo BF16. La licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (clase Qwen3.5); clase de modelo `Qwen3_5ForConditionalGeneration` |
| Parámetros totales | 9.409.813.744 (9,41 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit NF4 con doble cuantización, cómputo FP16, almacenamiento `uint8` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards) con configuración de cuantización bitsandbytes embebida en `config.json` |

Otros datos técnicos relevantes: el repositorio contiene 11 ficheros sellados que suman 7.903.101.799 bytes (7,36 GiB); el checkpoint se deriva del commit `c202236235762e1c871ad0ccb60c8ee5ba337b9a` del modelo base; se registran 763 tensores y buffers, de los cuales 358 parámetros portan estado de cuantización; el fichero `prequantized-receipt.json` documenta nombres, tamaños, hashes SHA-256, huellas del modelo y versiones de paquetes.

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer multimodal que combina un stack de lenguaje con un torre visual, tal como refleja la clase `Qwen3_5ForConditionalGeneration` y el pipeline `image-text-to-text`. Esta publicación no entrena ni afina nada: es una conversión de pesos del checkpoint BF16 upstream al formato NF4 de bitsandbytes, realizada sin modificar el tokenizador, la plantilla de chat, el procesador de imagen ni las configuraciones de modelo y generación, que se incluyen junto a los pesos.

La innovación técnica de esta ficha no está en la arquitectura sino en el empaquetado: los pesos cuantizados se persisten de forma que la configuración de cuantización vive en `config.json` y el usuario no debe pasar un `BitsAndBytesConfig` adicional en tiempo de carga. La conversión siguió el comportamiento estándar de bitsandbytes sin lista de omisión de módulos, de modo que la cuantización afecta tanto al espacio de nombres del modelo de lenguaje como al del torre visual; el autor advierte explícitamente que el torre visual no se mantiene en FP16/BF16. Se verificó la recarga en una NVIDIA A40 comprobando que la huella completa de parámetros y buffers, así como la huella del estado de cuantización desempaquetado, coincidían exactamente con el modelo previo al guardado. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` y la inclusión de plantilla de chat.
- Comprensión de imágenes y texto combinados (`image-text-to-text`): el procesador de imagen y el torre visual están incluidos en el checkpoint.
- Transcripción de texto visible en imágenes: en la validación acotada del autor, con generación greedy determinista y thinking desactivado, devolvió correctamente el 100 % en un prompt de una línea y en un JSON estricto de tres campos sobre una PNG sintética de 640×640.
- Generación con parada por EOS: las ejecuciones acotadas alcanzaron EOS sin llegar al límite de 256 tokens.
- Compatibilidad con endpoints (`endpoints_compatible`) según las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking: la model card menciona explícitamente la ejecución "con thinking desactivado", lo que implica que el modelo base dispone de algún modo de razonamiento; no se detallan sus características.

## Casos de uso

- Inferencia interactiva en Google Colab gratuito: cargar el checkpoint directamente en una sesión con GPU T4 asignada y ejecutar prompts de imagen y texto sin recuantizar, gracias a que los pesos NF4 ya están persistidos y el consumo medido se mantuvo en torno a 8 GB de memoria de dispositivo.
- Prototipado de asistentes visuales en GPU de 16 GB: validar flujos de pregunta-respuesta sobre capturas, diagramas o documentos escaneados antes de invertir en hardware mayor, usando el modelo como sustituto funcional del BF16 en fases tempranas.
- Extracción de campos estructurados de imágenes: el caso validado de JSON estricto de tres campos sugiere uso en tareas de transcripción acotada donde el esquema de salida está fijado y se puede verificar programáticamente.
- Docencia y talleres de cuantización: el repositorio incluye un recibo con hashes, versiones de paquetes y GPU de exportación, lo que lo convierte en un ejemplo reproducible para explicar el flujo bitsandbytes NF4 de extremo a extremo.
- Despliegue en estaciones de trabajo con GPU de gama media: al caber en el presupuesto de 16 GB, permite montar un servicio local de visión-lenguaje sin depender de la nube, siempre que se acepten las advertencias de calidad del autor.
- Evaluación comparativa de cuantizaciones: sirve como artefacto de referencia para medir la degradación introducida por NF4 frente al BF16 upstream, aunque esa comparación debe hacerla el usuario, ya que el autor no la aporta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que esta release no afirma que NF4 preserve la precisión, las puntuaciones de benchmark, la latencia, el throughput, el uso de RAM ni el uso de VRAM del modelo BF16.

Los únicos datos de rendimiento medidos son de ajuste de recursos y de ejecución:

| Métrica | Valor | Contexto |
|---|---|---|
| Pico de memoria de dispositivo | 8.083 MiB | Checkpoint público cargado más generación, validación CUDA acotada |
| PSS máximo del grupo de procesos | inferior a 9,1 GiB | Misma validación |
| Presupuesto de dispositivo de la GPU de validación | 15.360 MiB | RTX 2000 Ada restringida, no una T4 física |
| Límite de tokens en las pruebas | 256 | Generación acotada con parada por EOS |
| Transcripción de texto en PNG sintética | fallo en comprobación literal; 100 % en prompt de una línea y en JSON de tres campos | Thinking desactivado, greedy determinista |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 8 GB de memoria de dispositivo en el pico medido (8.083 MiB) para el checkpoint cargado más generación, con un PSS de proceso por debajo de 9,1 GiB.
- GPU recomendadas: NVIDIA T4 de 16 GB (objetivo declarado), RTX 2000 Ada (GPU usada en la validación), y en general cualquier GPU NVIDIA con al menos 16 GB y soporte CUDA; el export se realizó en una A40.
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más de VRAM; no se ha validado en tarjetas de 8 o 12 GB.
- Opciones de despliegue: Hugging Face Transformers con bitsandbytes es la vía documentada y verificada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato NF4 con estado de cuantización embebido no es directamente compatible con motores que esperan GGUF.
- Versiones de software exigidas por el autor: torch 2.8.0 (build CUDA, el host de export usó 2.8.0+cu128), transformers 5.16.1, bitsandbytes 0.50.2, safetensors 0.8.0, tokenizers 0.23.2 y accelerate.
- Latencia y throughput: no disponibles; el autor no los mide ni los reclama.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Deyme/Qwen3.5-9B-NF4 | 9,41 mil millones | no disponible | NF4 4-bit preempaquetada | Apache 2.0 | Hugging Face, 0 descargas, 0 likes en el momento de la consulta |
| Qwen/Qwen3.5-9B | 9,41 mil millones | no disponible | BF16 (upstream) | Apache 2.0 | Hugging Face, modelo base oficial |
| Otras cuantizaciones de Qwen3.5-9B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el propio modelo base: misma arquitectura y mismos parámetros, con la diferencia de que el upstream conserva precisión BF16 y esta release reduce el peso a 7,36 GiB a costa de una degradación de calidad no cuantificada por el autor. No se dispone de datos de benchmarks ni de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- La validación publicada no es una evaluación de calidad: confirma integridad del artefacto, carga en CUDA, generación hacia delante y finalización por EOS, pero no compara contra el BF16.
- La comprobación de transcripción literal sobre una PNG sintética de 640×640 falló: el modelo devolvió `100%` en lugar del contenido visible (`A7 B3`, `ROOM 204`, `TOTAL 51.25`). El fallo se reprodujo por una segunda vía de inferencia con el mismo artefacto.
- No se ejecutó un control en BF16, por lo que no puede atribuirse el fallo a la cuantización NF4 ni medirse la degradación respecto al upstream.
- El torre visual está cuantizado: el autor advierte que no se mantiene en FP16/BF16, lo que puede afectar a tareas de percepción fina.
- El ajuste de recursos se midió en una RTX 2000 Ada restringida a 15.360 MiB, no en una T4 física; se trata de una afirmación de encaje de recursos, no de un benchmark directo en T4.
- En Google Colab, la asignación de GPU, los límites de uso y la duración del runtime no están garantizados según la propia FAQ de Google.
- No hay información sobre sesgos, idiomas soportados, riesgo de alucinación específico ni limitaciones de contexto; deben asumirse los del modelo base, no documentados aquí.
- La licencia Apache 2.0 permite uso comercial, pero al ser una cuantización de terceros conviene verificar la procedencia y los términos del modelo base antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso comunitario que respalde su robustez.
- El identificador del modelo en el ejemplo de código de la model card (`ai-babai/Qwen3.5-9B-NF4`) no coincide con el ID del repositorio (`Deyme/Qwen3.5-9B-NF4`); hay que ajustar el `model_id` al repositorio correcto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Deyme/Qwen3.5-9B-NF4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Commit del modelo base utilizado: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a
- Commit del artefacto validado: https://huggingface.co/ai-babai/Qwen3.5-9B-NF4/tree/acce7768149fd2dd5eaad7d188153afbd948b2c0
- Especificación oficial de la NVIDIA T4: https://www.nvidia.com/en-gb/data-center/tesla-t4/
- FAQ de Google Colab: https://research.google.com/colaboratory/faq.html
