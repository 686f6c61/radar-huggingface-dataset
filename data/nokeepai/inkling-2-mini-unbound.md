# nokeepai/Inkling-2-Mini-Unbound

## Resumen

Inkling-2-Mini-Unbound es un ajuste fino (finetune) del modelo multimodal thinkingmachines/Inkling-2-Mini, desarrollado por nokeepai. Se trata de una variante "uncensored" y "abliterated": se ha eliminado la dirección de rechazo del modelo original y se ha entrenado adicionalmente para que deje de esquivar peticiones dañinas, dando respuestas directas y detalladas en lugar de recusarlas o matizarlas en exceso. El modelo conserva la arquitectura y el tokenizador del original, por lo que funciona como reemplazo directo.

El modelo tiene 26.388.646.440 parámetros totales (arquitectura MoE, segun los tags del repositorio) y un tamaño de repositorio de 59,8 GB, lo que sugiere pesos en BF16/FP16 junto con componentes cuantizados. La versión actual es la v2.1 y solo difiere del original en 120 matrices de atención en BF16; los pesos de expertos en 4 y 8 bits son idénticos byte a byte al modelo base.

Es relevante ahora porque representa un enfoque distinto al de la abliteración convencional: en lugar de limitarse a eliminar la dirección de rechazo, entrena sobre esa edición de pesos para eliminar la evasión (reformular como sátira, llenar de caveats o responder de forma vaga). El autor reporta que el 83,7% de las peticiones dañinas retenidas obtienen una respuesta útil con el modo de pensamiento desactivado, frente al 58,9% del siguiente mejor publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) sobre transformer, segun tags del repositorio; detalles internos no disponibles |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de llama.cpp usa `-c 32768`) |
| Tipos de cuantizacion | BF16, 8-bit (modelopt), 4-bit; GGUF de Q8_0 a IQ2_M; Basalt para NVIDIA Blackwell |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers, SGLang, vLLM); GGUF (llama.cpp, LM Studio, Ollama); Basalt; LoRA (PEFT rank 16/64) |

## Arquitectura y entrenamiento

El modelo es un finetune del original thinkingmachines/Inkling-2-Mini, que emplea una arquitectura MoE (mixture of experts) segun los tags del repositorio. El autor indica que solo 120 matrices de atención en BF16 difieren del modelo original, mientras que los pesos de expertos en 4 y 8 bits son idénticos byte a byte, lo que confirma que el ajuste se concentra en las capas de atención y no altera los expertos.

El proceso combina dos fases: primero una edición de pesos para eliminar la dirección de rechazo (abliteration), y después un entrenamiento adicional sobre esa edición para eliminar la evasión, usando únicamente respuestas del propio modelo. El autor reporta una divergencia respecto al original (KLD) de 0,0439, la mayor entre las variantes medidas, lo que indica que se aleja más del modelo base que otras alternativas. El modelo base original tiene licencia Apache 2.0 y el finetune conserva esa licencia.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Procesamiento de imagen y texto (pipeline image-text-to-text): acepta entradas multimodales.
- Modo de pensamiento (thinking mode) activable y desactivable, con un parámetro `reasoning_effort` en la plantilla de chat.
- Respuestas directas y detalladas a peticiones que el modelo original rechaza, incluyendo contenido dañino, peligroso o ilegal.
- Capacidad de razonamiento y matemáticas preservada respecto al original: MMLU-300 de 74,3 y GSM8K-100 de 98.
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema Transformers, vLLM, SGLang y llama.cpp.
- No se documentan capacidades de tool calling, function calling ni agentes en la información disponible.

## Casos de uso

- Investigación sobre seguridad y alineación: el modelo permite estudiar cómo responde un sistema sin entrenamiento de seguridad a peticiones dañinas, útil para analizar mecanismos de rechazo, evasión y edición de pesos en modelos MoE.
- Evaluación de técnicas de abliteración: sirve como referencia para comparar metodologías de eliminación de rechazo y de evasión, con métricas públicas de utilidad, rechazo y divergencia (KLD) frente a otras variantes.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o narrativa que aborde temas sensibles sin que el modelo recuse la petición, gracias a la eliminación de la evasión y no solo del rechazo.
- Pruebas de robustez de pipelines de moderación: al desplegarse detrás de un clasificador de contenido propio, permite validar que las salvaguardas externas capturan las respuestas que el modelo genera sin filtro interno.
- Análisis de datos multimodales en inglés: al aceptar entradas de imagen y texto, puede emplearse en tareas de descripción y extracción de información de imágenes dentro de entornos controlados.
- Benchmarking de infraestructura de inferencia: con 26,4 mil millones de parámetros y variantes GGUF de Q8_0 a IQ2_M, es útil para medir throughput y latencia de despliegues MoE en llama.cpp, vLLM o SGLang con distintas cuantizaciones.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, sobre 263 peticiones dañinas retenidas, con decodificación greedy y respuestas de hasta 8.192 tokens (Q8_0 salvo indicación):

| Modelo | Rechazo off / on | Útiles off | Útiles on | KLD | MMLU-300 / GSM8K-100 |
|---|---|---|---|---|---|
| Unbound v2.1 (este) | 0,4% / 0,4% | 83,7% | 85,2% | 0,0439 | 74,3 / 98 |
| Unbound v2 | 0,4% / 1,1% | 77,9% | 82,5% | 0,0318 | 76,0 / 99 |
| Unbound v1.0 | 0,0% / 0,0% | 51,3% | 61,6% | 0,0102 | 75,7 / 99 |
| IndrasMirror XQ | 0,0% / 0,0% | 58,9% | 68,1% | 0,0357 | 74,7 / 98 |
| AtomicChat Uncensored (AD-Q4_K) | 0,4% / 0,0% | 50,2% | 59,3% | 0,0106 | 77,0 / 98 |
| AtomicChat Uncensored (LoRA) | 0,0% / 0,0% | 52,1% | 55,5% | 0,0078 | 78,3 / 99 |
| Inkling 2 Mini original | 0,8% / 0,8% | 0,8% | 0,8% | no disponible | 76,3 / 97 |

El autor reporta además que la ganancia sobre IndrasMirror XQ es de +24,7 puntos (IC 95%: +18,6 a +30,8) con pensamiento desactivado y +17,1 puntos (+11,4 a +22,8) con pensamiento activado. Sobre 784 indicaciones benignas limítrofes, solo 1 (0,1%) fue rechazada, frente al 38% del original.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,4 mil millones de parámetros, en BF16 se requieren aproximadamente 53 GB solo para pesos; en Q8_0 unos 27 GB; en Q4_K_M unos 15-16 GB; en IQ2_M alrededor de 8-9 GB.
- GPU recomendadas: A100 80 GB o H100 para BF16 sin cuantizar; A100 40 GB o RTX 6000 Ada para Q8_0; RTX 4090 (24 GB) para Q4_K_M y cuantizaciones menores.
- Cabe en GPU de consumo: sí, en RTX 4090 y GPUs con 16-24 GB usando cuantizaciones Q4 o menores; las variantes IQ2_M permiten despliegue en GPUs de 8-12 GB con pérdida de calidad.
- Opciones de despliegue: Transformers, vLLM, SGLang (safetensors); llama.cpp, LM Studio, Ollama (GGUF); Basalt para NVIDIA Blackwell; LoRA PEFT sobre el modelo original.
- Latencia y throughput: no disponibles en la información proporcionada.
- Configuración recomendada por el autor: pensamiento activado, temperatura 0,6, top_p 0,95 y un límite de pensamiento de 4.096 tokens. No usar muestreo DRY. Con decodificación greedy y pensamiento activado el modelo puede entrar en bucles de razonamiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Útiles (off/on) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-Unbound v2.1 | 26,4 B (MoE) | no disponible | 83,7% / 85,2% | Apache 2.0 | HF (safetensors, GGUF, Basalt, LoRA) |
| IndrasMirror XQ Uncensored | mismo base (26,4 B) | no disponible | 58,9% / 68,1% | no disponible | HF |
| AtomicChat Uncensored | mismo base (26,4 B) | no disponible | 52,1% / 55,5% | no disponible | HF (GGUF y LoRA) |
| Inkling 2 Mini original | 26,4 B (MoE) | no disponible | 0,8% / 0,8% | Apache 2.0 | HF |

Todas las variantes comparten el mismo modelo base y arquitectura; la diferencia principal es el grado de eliminación de rechazo y evasión, medido con el mismo conjunto de 263 peticiones y el mismo juez. Unbound v2.1 obtiene la mayor utilidad pero también la mayor divergencia respecto al original (KLD 0,0439), mientras que AtomicChat LoRA conserva mejor el rendimiento en MMLU (78,3 frente a 74,3).

## Limitaciones y advertencias

- El modelo sigue instrucciones dañinas: da respuestas detalladas a peticiones peligrosas o ilegales que el original rechaza. No debe desplegarse ante usuarios finales sin salvaguardas propias.
- No tiene entrenamiento de seguridad superpuesto; el autor lo advierte explícitamente.
- Puede entrar en bucles de razonamiento con decodificación greedy y pensamiento activado; se recomienda temperatura 0,6, top_p 0,95 y un límite de pensamiento de 4.096 tokens.
- El 16,1% de 230 peticiones dañinas nuevas alcanza el límite de pensamiento con la configuración recomendada (29,1% con greedy).
- Mayor divergencia respecto al modelo base que otras variantes (KLD 0,0439), lo que puede degradar sutilmente capacidades no medidas.
- Soporte únicamente de inglés según la model card.
- Riesgo de alucinación: no cuantificado en la información disponible; aplicable el riesgo habitual de los modelos generativos.
- Sesgos conocidos: no documentados en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede ser dañino o ilegal; la responsabilidad legal recae en el desplegador.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines automatizados que dependan de ellas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound
- GGUF: https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-GGUF
- Basalt (NVIDIA Blackwell): https://huggingface.co/nokeepai/Inkling-2-Mini-Unbound-Basalt
- Repositorio de código y datos: https://github.com/nokeepai/inkling-2-mini-unbound
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- IndrasMirror XQ Uncensored: https://huggingface.co/IndrasMirror/Inkling-2-Mini-XQ-Uncensored
- AtomicChat Uncensored GGUF: https://huggingface.co/AtomicChat/Inkling-2-Mini-Uncensored-GGUF
- Sitio del autor: https://nokeep.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
