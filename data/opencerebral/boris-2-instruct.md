# opencerebral/Boris-2-Instruct

## Resumen

Boris-2-Instruct es la versión ajustada para chat e instrucciones de Boris-2, un modelo de lenguaje de 144 millones de parámetros desarrollado por OpenCerebral y entrenado desde cero por el propio autor en una única GPU NVIDIA V100. Se trata de un modelo causal de tipo transformer con 31 capas, tamaño oculto de 512 y un vocabulario de 32.768 tokens, entrenado sobre 200.040 millones de tokens en su fase de preentrenamiento. Esta variante Instruct se obtiene mediante un ajuste fino completo de un epoch sobre el conjunto de datos smol-smoltalk, que contiene 460.341 conversaciones.

El modelo resulta relevante por su escala reducida y su enfoque de entrenamiento reproducible: toda la fase de instrucción se completó en aproximadamente 2,5 horas sobre una sola V100 de 32 GB, con precisión mixta float16 y flujo residual en float32. Está publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales, y su tamaño lo hace apto para entornos con recursos limitados, prototipado rápido y experimentación educativa.

La arquitectura incorpora innovaciones poco habituales en modelos de este tamaño, como capas Canon y una tabla de n-gramas exacta, según se detalla en la model card del modelo base. No obstante, sus capacidades factuales y aritméticas son limitadas, y el propio autor advierte de que no debe emplearse para respuestas médicas, legales o financieras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con capas Canon y tabla de n-gramas exacta (31 capas, tamaño oculto 512) |
| Parámetros totales | 144.192.782 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (incluye toda la conversación) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 0,6 GB) |

## Arquitectura y entrenamiento

Boris-2-Instruct mantiene sin cambios la arquitectura del modelo base Boris-2: un transformer causal de 31 capas con tamaño oculto de 512, vocabulario de 32.768 tokens y contexto de 2.048 tokens. La arquitectura incorpora capas Canon y una tabla de n-gramas exacta, elementos que el autor describe en la model card de Boris-2 y que no se detallan en la ficha de esta variante Instruct. El preentrenamiento del modelo base consumió 200.040 millones de tokens.

El ajuste fino se realizó sobre el split de entrenamiento de smol-smoltalk: 460.341 conversaciones y 403 millones de tokens, de los cuales se entrenaron 303 millones. La pérdida se calculó únicamente sobre las respuestas del asistente y su token de cierre `<|im_end|>`. Las conversaciones se empaquetaron en filas de 2.048 tokens como documentos separados, reiniciando atención, capas Canon y búsqueda n-grama en cada uno. Se usó AdamW con learning rate 1e-4, betas (0,9, 0,95), sin weight decay, grad clip 1.0, warmup lineal de 140 pasos y decaimiento coseno. El entrenamiento duró 1 epoch y 4.227 pasos, con batch de 64 filas de 2.048 tokens, en float16 mixto con flujo residual en float32, sobre una V100 de 32 GB durante aproximadamente 2,5 horas. La pérdida en 800 conversaciones de test reservadas bajó de 1,426 antes del ajuste a 1,041 después.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML implementado como texto plano (sin tokens especiales añadidos al vocabulario).
- Respuesta a instrucciones y preguntas de carácter general, con fluidez superficial alta para su tamaño.
- Soporte de plantilla de chat mediante `apply_chat_template` en el tokenizador.
- Capacidad de parada controlada mediante la cadena de parada `<|im_end|>`, que debe pasarse explícitamente porque no es un token de fin de secuencia.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de capacidades de visión, audio ni modo thinking.
- Multilingüismo limitado al inglés según la model card.
- No hay ajuste de seguridad más allá del contenido presente en smol-smoltalk.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés: el modelo puede mantener diálogos multi-turno dentro de su ventana de 2.048 tokens, suficiente para interacciones breves de soporte o demostración en entornos de desarrollo.
- Experimentación educativa y docencia: su tamaño de 144M parámetros y su entrenamiento reproducible en una sola V100 lo hacen idóneo para explicar el ciclo completo de preentrenamiento y ajuste fino por instrucciones.
- Generación de texto de relleno y borradores: útil para producir texto fluido en tareas de baja exigencia factual, como descripciones genéricas o ejemplos sintéticos para pipelines de datos.
- Evaluación de infraestructura de inferencia: sirve como modelo de referencia ligero para probar integraciones con transformers, plantillas de chat y cadenas de parada antes de escalar a modelos mayores.
- Pruebas de conformidad de licencia: al estar bajo Apache 2.0, puede integrarse en productos comerciales internos o demos sin obligaciones de atribución adicionales más allá de las de la licencia.
- Investigación sobre ajuste fino eficiente: el autor documenta hiperparámetros completos (learning rate, schedule, batch, precisión), lo que permite reproducir o comparar estrategias de instrucción en modelos pequeños.
- Filtrado y clasificación ligera de texto: puede emplearse como generador de etiquetas o resúmenes muy cortos en inglés cuando la precisión factual no sea crítica.

## Benchmarks y rendimiento

Resultados zero-shot con pesos en float32, según la model card del autor. La columna de comparación es el modelo base Boris-2, no un modelo externo.

| Benchmark | Métrica | Boris-2 | Boris-2-Instruct |
|---|---|---:|---:|
| HellaSwag | acc_norm | 50,27 | 48,86 |
| ARC-Easy | acc_norm | 59,81 | 57,74 |
| ARC-Challenge | acc_norm | 31,91 | 31,40 |
| PIQA | acc_norm | 72,74 | 71,22 |
| ArithMark-3 | acc_norm | 45,10 | 43,70 |
| Open SLM Index | — | 34,08 | 31,93 |

El autor indica que los benchmarks de instrucciones y conocimiento (IFEval, TruthfulQA, MMLU y otros, con SmolLM2-135M-Instruct como comparación) estaban en ejecución y se añadirían a la model card. No se han publicado esos resultados en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 0,58 GB solo para pesos (144,2M parámetros × 4 bytes), más overhead de activaciones y del código personalizado.
- VRAM estimada en float16: aproximadamente 0,29 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para float16; el autor entrenó en una NVIDIA V100 de 32 GB, pero la inferencia no requiere esa capacidad.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o inferiores con suficiente VRAM; también es viable en CPU para pruebas.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el formato publicado es safetensors sin cuantizaciones GGUF.
- Latencia y throughput: no disponibles. El autor advierte de que el código es PyTorch puro sin caché KV, por lo que las respuestas largas son lentas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---:|---:|---|---|---|
| Boris-2-Instruct | 144,2M | 2.048 | Apache 2.0 | Inglés | Hugging Face (transformers) |
| SmolLM2-135M-Instruct | 135M | 8.192 (según su model card pública) | Apache 2.0 | Multilingüe | Hugging Face |
| Qwen2.5-0.5B-Instruct | 500M | 32.768 | Apache 2.0 | Multilingüe | Hugging Face |

La comparación con SmolLM2-135M-Instruct es la más directa por tamaño y por ser el modelo de referencia que el propio autor cita para benchmarks pendientes. Qwen2.5-0.5B-Instruct es una alternativa de escala superior con contexto mucho mayor. No se dispone de resultados comparativos directos entre Boris-2-Instruct y estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 144M parámetros: el autor advierte de que suena fluido pero falla a menudo en hechos y aritmética (por ejemplo, responde 17 + 25 = 22).
- Puede atribuirse capacidades que no tiene y perder el hilo en conversaciones largas.
- El contexto de 2.048 tokens incluye toda la conversación, lo que limita los diálogos extensos.
- No tiene ajuste de seguridad más allá del contenido de smol-smoltalk.
- No debe usarse para respuestas factuales, médicas, legales o financieras.
- Solo soporta inglés según la model card.
- `<|im_end|>` es texto plano, no un token de fin de secuencia: si no se pasa como cadena de parada, el modelo sigue generando turnos nuevos.
- El código de inferencia es PyTorch puro sin caché KV, lo que penaliza la latencia en respuestas largas.
- Los benchmarks de instrucciones y conocimiento (IFEval, TruthfulQA, MMLU) no estaban publicados en el momento de la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero persisten los riesgos de exactitud y alucinación inherentes al tamaño del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/opencerebral/Boris-2-Instruct
- Modelo base Boris-2: https://huggingface.co/opencerebral/Boris-2
- Organización OpenCerebral en Hugging Face: https://huggingface.co/opencerebral
- Wiki del autor: https://wiki.kunix.org/
- Sitio del autor: https://oc.kunix.org/
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Licencia Apache 2.0 del repositorio: https://huggingface.co/opencerebral/Boris-2-Instruct/blob/main/LICENSE
