# pranil00/ONIX-Hermes-3-Llama-3.1-8B-GGUF

## Resumen

ONIX-Hermes-3-Llama-3.1-8B-GGUF es una cuantización en formato GGUF del modelo NousResearch/Hermes-3-Llama-3.1-8B, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX y generada con la herramienta run-any-model. No se trata de un modelo entrenado desde cero, sino de un artefacto de conversión que empaqueta los pesos del Hermes-3 de NousResearch en precisión Q5_K_M (5,5 bits por parámetro) para facilitar su ejecución en hardware de consumo.

El modelo base pertenece a la familia LLaMA 3.1, con 8.030.257.152 parámetros (8,03 mil millones) y una arquitectura transformer densa. Hermes-3 es un ajuste fino de Llama 3.1 8B orientado a instrucciones, conversación multi-turno y uso como agente, desarrollado por NousResearch. Esta versión cuantizada ocupa 5,40 GB en disco, lo que representa una reducción del 65,6 % respecto a los 15,71 GB del FP16 original.

La relevancia de esta ficha radica en que permite desplegar un modelo de 8B con calidad cercana al original (el autor declara una retención del 97,5 %) en equipos con 6-8 GB de memoria, incluyendo Apple Silicon, GPUs NVIDIA de gama consumer y CPUs con AVX2/AVX-512. Es un artefacto de distribución, no una contribución científica nueva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (familia LLaMA 3.1) |
| Parametros totales | 8.030.257.152 (8,03 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (ventana óptima declarada por el autor de la cuantización); el modelo base soporta hasta 128K según Llama 3.1, no verificado en esta ficha |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); otras cuantizaciones no disponibles en este repositorio |
| Idiomas soportados | no disponible (el modelo base Llama 3.1 es multilingüe, pero no se detalla en la información proporcionada) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo `NousResearch--Hermes-3-Llama-3.1-8B-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia LLaMA 3.1 con 8,03 mil millones de parámetros, ajustado por NousResearch para comportamiento de instrucciones y conversación (Hermes-3). La información proporcionada no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO o similares; esos datos corresponden a la model card original de NousResearch, no incluida aquí.

La contribución de este repositorio es exclusivamente la cuantización Q5_K_M realizada con run-any-model, un motor de optimización adaptativo al dispositivo. Según el informe de auditoría del autor, la cuantización reduce el peso de 16 a 5,5 bits por parámetro, mantiene el búfer KV en FP16 (512 MB) y acelera las 32 capas en Metal en Apple Silicon. No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.) más allá de las propias del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste fino Hermes-3.
- Seguimiento de instrucciones y formato de chat (tokens especiales `<|im_end|>` y `<|endoftext|>` documentados en el ejemplo de Ollama).
- Razonamiento y respuesta a preguntas en formato instructivo.
- Capacidad multilingüe potencial (Llama 3.1 es multilingüe), aunque no se detalla en la información disponible.
- Ejecución local en CPU, GPU y Apple Silicon gracias al formato GGUF y a la cuantización Q5_K_M.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Asistente conversacional local en portátil: con 5,40 GB de pesos y una ventana de 8.192 tokens, el modelo cabe en un Mac con 8 GB de memoria unificada y permite conversaciones multi-turno sin conexión, útil para prototipado y demos privadas.
- Chatbot de atención al cliente en entornos con recursos limitados: al ejecutarse en una GPU consumer con ~6,9 GB de VRAM, se puede desplegar en una estación de trabajo sin servidores dedicados, gestionando diálogos de varios turnos dentro de la ventana de contexto.
- Generación de texto y resúmenes en pipelines por lotes: la cuantización Q5_K_M reduce el coste de memoria y permite procesar lotes en CPUs con AVX2/AVX-512 usando llama.cpp, adecuado para tareas de extracción o resumen sobre documentos cortos.
- Prototipado de aplicaciones de IA en LM Studio, Jan o Text-Generation-WebUI: el archivo GGUF se carga directamente en el directorio `models/`, lo que simplifica la evaluación rápida por parte de desarrolladores sin experiencia en despliegue de servidores.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de calidad de Q5_K_M frente a FP16 (el autor declara ~97,5 % de retención), útil en estudios internos de compresión de modelos.
- Educación y experimentación: al ser un modelo de 8B con licencia Apache 2.0, se puede usar en cursos y talleres para enseñar inferencia local, cuantización y formatos GGUF sin restricciones de licencia.
- Integración en herramientas de línea de comandos: el ejemplo con `run-any-model` y `llama-cli` permite incorporar el modelo a scripts de terminal para tareas de generación de texto ad hoc.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento proporcionado es el informe de auditoría del autor, que mide tamaño y uso de memoria, no calidad:

| Metrica | FP16 (base) | Q5_K_M (esta version) | Cambio |
|---|---|---|---|
| Precision de bits | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 15,71 GB | 5,40 GB | -65,6 % |
| Bufer KV cache | 512 MB (FP16) | 512 MB (FP16) | Optimizado |
| RAM residente total | 16,28 GB | 5,97 GB | -63,3 % |
| Calidad estimada | 100 % baseline | 97,5 % retenida | -2,5 % |
| Aceleracion de capas | 0 % (riesgo de fallo) | 32/32 capas | Optimo |

Estos valores proceden del propio autor de la cuantización y no han sido verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: ~6,90 GB en GPU NVIDIA (RTX 30/40/50) según el autor; ~5,97 GB de memoria unificada en Apple Silicon (M1-M5); ~7,97 GB de RAM libre en CPU Windows/Linux.
- GPU recomendadas: cualquier NVIDIA con al menos 8 GB de VRAM (RTX 3060 8 GB, RTX 4060, RTX 4070, etc.); no se documentan requisitos para A100/H100, aunque por tamaño cabría holgadamente.
- Cabe en GPU consumer: sí, en RTX 3060/4060/4070 y superiores con 8 GB o más; también en Apple Silicon con 8 GB unificados.
- Opciones de despliegue: `run-any-model` (CLI del autor), Ollama (mediante Modelfile), llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI. vLLM y TGI no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponibles. El autor solo indica aceleración Metal en las 32 capas y soporte CUDA, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Hermes-3-Llama-3.1-8B-GGUF (esta ficha) | 8,03 B | 8.192 tokens (ventana óptima declarada) | GGUF Q5_K_M | Apache 2.0 | Hugging Face (0 descargas) |
| NousResearch/Hermes-3-Llama-3.1-8B (base) | 8,03 B | hasta 128K según Llama 3.1 (no verificado aquí) | safetensors | Llama 3.1 Community License (según el modelo base; no confirmado en esta información) | Hugging Face |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128K | safetensors, GGUF | Llama 3.1 Community License | Hugging Face, ecosistema amplio |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32K | safetensors, GGUF | Apache 2.0 | Hugging Face, ecosistema amplio |

Nota: los datos de los modelos comparativos corresponden a conocimiento general y no se han verificado en la información proporcionada; se incluyen solo como referencia orientativa. No se dispone de benchmarks comparativos de calidad para esta cuantización.

## Limitaciones y advertencias

- Es un artefacto de cuantización, no un modelo nuevo: la calidad depende íntegramente del Hermes-3-Llama-3.1-8B original y de la pérdida introducida por Q5_K_M (~2,5 % según el autor, no verificado).
- El repositorio tiene 0 descargas y 0 likes, y fue creado en 2026-11-25; no hay evidencia de validación por parte de la comunidad.
- La ventana de contexto óptima declarada es de 8.192 tokens, muy inferior a los 128K del Llama 3.1 base; no se documenta si contextos mayores funcionan correctamente en esta cuantización.
- No se detallan idiomas soportados ni evaluación multilingüe; el rendimiento en castellano no está verificado.
- Riesgo de alucinación inherente a los modelos de 8B, agravado por la cuantización; el autor declara explícitamente que no asume responsabilidad sobre las salidas.
- La licencia declarada es Apache 2.0, pero el modelo base Hermes-3 deriva de Llama 3.1, cuya licencia comunitaria impone restricciones adicionales (por ejemplo, cláusula de usuarios de más de 700 millones de usuarios mensuales). Conviene verificar la compatibilidad antes de uso comercial.
- El aviso legal del autor es extremadamente restrictivo en cuanto a responsabilidad, lo que traslada toda la carga de validación al implementador.
- No hay datos de benchmarks de calidad ni de throughput, por lo que no se puede garantizar un rendimiento concreto en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Hermes-3-Llama-3.1-8B-GGUF
- Modelo base: https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B
- Herramienta de cuantización run-any-model: https://github.com/PranilShah-08/run-any-model
- Organización ONIX: https://huggingface.co/ONIX
