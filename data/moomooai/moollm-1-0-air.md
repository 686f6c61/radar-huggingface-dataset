# moomooai/moollm-1.0-air

## Resumen

MooLLM-1.0-Air es un modelo de lenguaje de tipo base (preentrenado, sin ajuste por instrucciones) desarrollado por moomooai, el primer miembro de la serie MooLLM. Se trata de un modelo extremadamente compacto, con 6.758.568 parámetros totales, construido sobre una arquitectura Mamba2 (modelo de espacio de estados, SSM) en lugar de un transformer clásico. Su propósito declarado es servir como banco de pruebas para experimentos, despliegues en dispositivos embebidos y predicción ultrarrápida del siguiente token.

El modelo se ha entrenado desde cero con una implementación propia de Mamba2 escrita en Rust sobre el framework Burn, empleando una única GPU de consumo (AMD Radeon RX 6600) durante aproximadamente 4 horas. Los datos de entrenamiento provienen de subconjuntos del corpus Common Pile (YouTube, StackExchange filtrado, noticias, Wikimedia filtrado y Project Gutenberg filtrado), exclusivamente en inglés.

Su relevancia radica en ser un ejemplo de entrenamiento reproducible de un SSM de muy bajo coste computacional y con licencia MIT, útil para estudiar el comportamiento de arquitecturas de espacio de estados a pequeña escala, validar pipelines de entrenamiento alternativos (Burn/Rust) y experimentar con decodificación especulativa o completado de texto en entornos con recursos mínimos. No está pensado para conversación ni para responder preguntas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba2 (modelo de espacio de estados, SSM) |
| Parametros totales | 6.758.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF sin cuantizar (original); cuantizaciones adicionales no disponibles |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

MooLLM-1.0-Air emplea una arquitectura Mamba2, un modelo de espacio de estados selectivo con recurrencia lineal, implementada de forma personalizada en Rust sobre el framework Burn. No se trata, por tanto, de un transformer con atención, sino de un SSM con estado recurrente, lo que en teoría permite un coste de inferencia lineal con la longitud de secuencia, si bien el autor no detalla la longitud de contexto efectiva ni la configuración exacta de las capas.

El entrenamiento se realizó desde cero durante 3 horas, 59 minutos y 21 segundos en una AMD Radeon RX 6600 con un consumo medio de 50 W (limitado a 100 W). Los datos proceden de cinco subconjuntos del corpus Common Pile: YouTube, StackExchange filtrado, noticias, Wikimedia filtrado y Project Gutenberg filtrado. No se menciona el número total de tokens procesados, la composición porcentual del dataset ni la existencia de fases de RLHF o DPO; al ser un modelo base, no se aplicó ajuste por instrucciones. El autor indica que no se incluyeron datasets específicos de código, lo que hace que la métrica CoderPPL sea fuera de distribución.

## Capacidades

- Generación de texto y completado del siguiente token: el modelo produce continuaciones de texto a partir de un prompt, con muestreo por temperatura o decodificación greedy.
- Predicción ultrarrápida del siguiente token: por su tamaño (6,76 M de parámetros) y su arquitectura SSM, está orientado a latencia mínima.
- Completado de texto simple: adecuado para tareas de continuación de frases o párrafos en inglés.
- No soporta tool calling ni function calling (no se documenta ninguna capacidad de este tipo).
- No soporta agentes ni razonamiento multi-paso (es un modelo base sin ajuste por instrucciones).
- Capacidades multilingües: solo inglés.
- No dispone de modo thinking, visión, audio ni otras capacidades especiales.
- No es capaz de mantener conversación ni de responder preguntas, según advierte explícitamente el autor.

## Casos de uso

- Experimentación con arquitecturas SSM: sirve como modelo de referencia para estudiar el comportamiento de Mamba2 a pequeña escala, comparar con transformers diminutos y validar implementaciones propias en Rust/Burn.
- Completado de texto en dispositivos embebidos: con 6,76 M de parámetros y pesos en GGUF, puede ejecutarse en microcontroladores o placas de bajos recursos para autocompletar frases cortas en inglés.
- Modelo borrador para decodificación especulativa: su reducido coste de inferencia lo hace candidato a proponer tokens que un modelo mayor verifique, aunque el autor no aporta mediciones de aceptación.
- Predicción de siguiente token en sistemas de teclado predictivo o T9 experimental: el tamaño permite integrarlo en aplicaciones de escritura asistida con latencia muy baja.
- Docencia y divulgación: ejemplo reproducible de entrenamiento desde cero de un modelo de lenguaje con hardware de consumo y código abierto (licencia MIT), útil para cursos sobre SSM y frameworks alternativos.
- Pruebas de pipelines de despliegue: sirve para validar integraciones con transformers, llama.cpp u Ollama en entornos de CI antes de escalar a modelos mayores de la misma familia.
- Investigación sobre datos de Common Pile: al haberse entrenado con subconjuntos concretos, permite estudiar sesgos y estilos asociados a esas fuentes (noticias, YouTube, StackExchange, Gutenberg).

## Benchmarks y rendimiento

| Benchmark | Amir: tiny-llm | MooMooAI: MooLLM-1.0-Air |
|---|---|---|
| CoderPPL | -43,49689 | -76,8079 |
| HellaSwag | 27,00 | 24,85 |
| MMLU | 22,739 | 24,96 |
| WikiText-2 (-ppl) | -162,4178 | -218,9829 |

El autor señala que CoderPPL está fuera de distribución para MooLLM-1.0-Air porque no se incluyeron datasets de código en el entrenamiento. Con aproximadamente la mitad de parámetros que tiny-llm (6,76 M frente a 13 M), MooLLM-1.0-Air supera a tiny-llm en MMLU y se mantiene competitivo en los benchmarks de modelado del lenguaje, aunque queda por debajo en HellaSwag y en perplejidad de WikiText-2.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (6,76 M de parámetros, aproximadamente 27 MB en fp32 y 13,5 MB en fp16); el repositorio completo ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el propio autor entrenó en una AMD Radeon RX 6600. También es viable en CPU.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, integradas) e incluso en dispositivos embebidos.
- Opciones de despliegue: transformers (AutoModelForCausalLM), llama.cpp mediante el archivo `model.gguf` incluido (comando `llama-completion -hf moomooai/moollm-1.0-air`), y potencialmente Ollama u otros runners compatibles con GGUF.
- Latencia y throughput estimados: no disponibles; el autor solo describe el caso de uso como "predicción ultrarrápida del siguiente token" sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | MMLU | HellaSwag | Licencia |
|---|---|---|---|---|---|---|
| MooLLM-1.0-Air | 6,76 M | Mamba2 (SSM) | no disponible | 24,96 | 24,85 | MIT |
| Amir: tiny-llm | ~13 M | no disponible | no disponible | 22,739 | 27,00 | no disponible |
| MooLLM-1.0-Tiny (anunciado) | ~15 M | Mamba2 (SSM) | no disponible | no disponible | no disponible | MIT (previsible) |

La comparativa se limita a tiny-llm, el único modelo con el que el autor ofrece datos. No se dispone de información sobre otros SSM pequeños comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no puede conversar, responder preguntas ni seguir instrucciones; solo completa texto.
- Calidad de generación muy baja: los ejemplos de la model card muestran continuaciones incoherentes, con errores gramaticales y saltos temáticos, propio de un modelo de 6,76 M de parámetros.
- Riesgo elevado de alucinación y de afirmaciones falsas, especialmente en temas de actualidad o políticos, como se observa en las muestras.
- Sesgos derivados de los datos de Common Pile (YouTube, noticias, StackExchange, Wikimedia, Gutenberg), sin filtrado documentado ni evaluación de sesgos.
- Solo inglés; no hay soporte multilingüe.
- Longitud de contexto no documentada, lo que impide planificar su uso en tareas de contexto largo.
- Sin datos de código en el entrenamiento: rendimiento en tareas de programación muy deficiente (CoderPPL fuera de distribución).
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; al ser un modelo experimental, no es apto para producción sin validación exhaustiva.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/moomooai/moollm-1.0-air
- Framework Burn (Rust): no disponible en la información proporcionada
- Corpus Common Pile: no disponible en la información proporcionada
- Repositorio llama.cpp: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
