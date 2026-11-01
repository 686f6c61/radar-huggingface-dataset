# mentriaai/Ternary-Bonsai-2-2B-mentria

## Resumen

Ternary-Bonsai-2-2B-mentria es un modelo vision-lenguaje de 2 mil millones de parámetros empaquetado por mentriaai a partir de Ternary Bonsai 2 2B de prism-ml, un modelo ternario (pesos −1/0/+1) construido sobre Qwen3.5-2B. El repositorio redistribuye los pesos en formato `mentria-q2g128-v1` (safetensors) para mentria-engine, un runtime WebGPU propietario que ejecuta el modelo íntegramente en el navegador, sin servidor. El modelo completo ocupa 506 MB, más una torre de visión opcional de 208 MB en Q4_0.

La propuesta de valor es la eficiencia extrema: con cuantización ternaria de aproximadamente 2,13 bits por peso y una escala FP16 por grupo de 128 pesos, el modelo cabe en dispositivos móviles y se ejecuta en WebGPU. Según la model card, el 28 de octubre de 2026 fue seleccionado para sustituir a Qwen3.5-0.8B-mentria como modelo por defecto en mentria.ai, con despliegue en curso.

Es relevante porque demuestra que un VLM de 2B con contexto multimodal puede superar a un modelo 4-bit de tamaño de descarga similar en matemáticas e instrucciones, manteniendo la inferencia local en navegador. La información disponible no detalla la composición del dataset de entrenamiento ni el proceso de alineación del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-2B), vision-lenguaje; pesos en base rotada de Hadamard |
| Parametros totales | 2 mil millones (2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (contexto usado en la evaluacion); maximo nativo no disponible |
| Tipos de cuantizacion | Ternaria q2g128 (≈2,13 bits/peso, escala FP16 por grupo de 128); torre de vision en Q4_0 |
| Idiomas soportados | en (ingles declarado); evaluado ademas en es, pt-BR, fr y ja |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato `mentria-q2g128-v1`); modelo base upstream en GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Qwen3.5-2B con torre de visión, cuantizado a pesos ternarios. Bonsai 2 almacena sus pesos en una base rotada de Hadamard; mentria-engine aplica la rotación correspondiente a cada entrada de matmul en f32 con bloque de 512, de modo que la rotación es exacta. Los pesos se reempaquetan desde el GGUF upstream sin recuantizar. La torre de visión es la torre estándar de Qwen3.5-2B en Q4_0, idéntica a la de Qwen3.5-2B-mentria.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La model card documenta una validación de correctitud mediante test teacher-forced contra la referencia llama.cpp de PrismML: 369 de 369 posiciones coinciden, sin desacuerdos decisivos (definidos como aquellos donde los dos candidatos top de la referencia distan más de 0,15 de probabilidad). La salida greedy fue idéntica a la referencia en las cuatro prompts de ejecución libre, y la build de navegador produce predicciones idénticas token a token en Chrome y Safari, incluidos turnos con imagen (29 de 29).

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imagen (image-text-to-text) mediante torre de visión Qwen3.5-2B en Q4_0.
- Razonamiento matemático y resolución de problemas verbales (GSM8K al 74,5%).
- Seguimiento de instrucciones a nivel de prompt (IFEval estricto al 67,3%).
- Conocimiento factual general (MMLU-Redux al 50,6%).
- Capacidad multilingüe evaluada en inglés, español, portugués de Brasil, francés y japonés, aunque el campo `language` solo declara inglés.
- Ejecución on-device en navegador mediante WebGPU (mentria-engine).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking: la evaluación se realizó con thinking desactivado; no se documenta su comportamiento.

## Casos de uso

- Asistente conversacional en navegador sin backend: el modelo se ejecuta íntegramente en WebGPU dentro de Chrome o Safari, con 506 MB de pesos, lo que permite ofrecer chat con IA sin enviar datos a un servidor y con latencia de primera palabra de 0,64 s en un Apple M4 Pro con Chrome.
- Aplicación móvil de chat con IA: en iPhone con Safari alcanza 23,9 tok/s, suficiente para respuestas fluidas en conversaciones cortas; el tamaño de descarga (519 MB con tokenizador) es viable en redes móviles.
- Descripción y análisis de imágenes en local: la torre de visión opcional de 208 MB permite procesar turnos con imagen sin salir del dispositivo, útil en aplicaciones de accesibilidad o catalogación de fotos con requisitos de privacidad.
- Tutor de matemáticas de nivel escolar: con un 74,5% en GSM8K supera en 30,4 puntos a un Q4 de Qwen3.5-0.8B de tamaño comparable, lo que lo hace adecuado para asistencia paso a paso en problemas aritméticos y verbales.
- Procesamiento de instrucciones en formularios y flujos guiados: el 67,3% en IFEval estricto permite usarlo en asistentes que deben respetar formatos y restricciones de salida concretas.
- Chat multilingüe para usuarios de español, portugués, francés y japonés: en evaluación ciega con 650 prompts, sus respuestas fueron preferidas al modelo Q4 previo en el 75,0% de los casos en inglés, español, portugués y francés, y en el 65,8% en japonés.
- Despliegue en dispositivos de gama baja con GPU Mali-G57: aunque rinde a 2,9 tok/s, sigue siendo funcional para consultas puntuales sin conexión.

## Benchmarks y rendimiento

Protocolo: decodificación greedy, thinking desactivado, sin system prompt, sin penalización de repetición, contexto de 2.048 tokens, dawn.node sobre Apple M4 Pro. Las diferencias son Bonsai menos Q4 en puntos, con intervalos bootstrap al 95% y test exacto de McNemar sobre respuestas emparejadas.

| Benchmark (n) | Q4 Qwen3.5-0.8B | Bonsai 2 2B | Diferencia (IC 95%) | p |
|---|---:|---:|---|---:|
| GSM8K (1.319) | 44,0% | 74,5% | +30,4 (27,5; 33,4) | < 0,001 |
| IFEval estricto a nivel de prompt (541) | 45,5% | 67,3% | +21,8 (16,8; 26,8) | < 0,001 |
| MMLU-Redux (1.140) | 45,4% | 50,6% | +5,2 (1,8; 8,4) | 0,002 |

Evaluación ciega de chat con 650 prompts en cinco idiomas, dos jueces (Claude Opus 5.5 y Claude Sonnet 5.5), pares anonimizados en ambos órdenes:

| Métrica | Opus 5.5 | Sonnet 5.5 |
|---|---:|---:|
| Respuesta de Bonsai preferida, en/es/pt-BR/fr (523 prompts) | 75,0% (72,2–77,6) | 73,2% (70,6–75,8) |
| Respuesta de Bonsai preferida, japonés (127 prompts) | 65,8% | 68,9% |
| Respuestas con hecho inventado, suite factual dura (350 prompts) | 72,9% vs 72,9% | 75,7% vs 74,3% |

Bucles de repetición (203 prompts, detección por script): 14,8% de las respuestas de este modelo frente al 55,2% del modelo Q4.

Velocidad en mentria-engine con prompt de 512 tokens:

| Dispositivo | Q4 Qwen3.5-0.8B: respuesta / primera palabra | Bonsai 2 2B: respuesta / primera palabra |
|---|---|---|
| Mac (Apple M4 Pro), Chrome | 139 tok/s / 0,33 s | 149 tok/s / 0,64 s |
| Mac (Apple M4 Pro), Safari | 13–15 tok/s / 0,55 s | 80–85 tok/s / 0,76 s |
| iPhone, Safari | 7,6 tok/s / 3,2 s | 23,9 tok/s / 5,3 s |
| Android (Mali-G57), Chrome | 4,9 tok/s / 39,6 s | 2,9 tok/s / 54,0 s |

## Requisitos de hardware

- VRAM/almacenamiento: 506 MB para el modelo de lenguaje más 12 MB de tokenizador; 208 MB adicionales si se usa la torre de visión. Total aproximado de 726 MB con visión.
- No requiere GPU dedicada: el runtime mentria-engine ejecuta el modelo en WebGPU sobre la GPU integrada del dispositivo.
- Cabe en hardware de consumo: Mac con Apple M4 Pro, iPhone con Safari y Android con Mali-G57 están documentados como dispositivos de prueba funcionales.
- Opciones de despliegue: mentria-engine (WebGPU, navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este repositorio; el modelo base upstream está en GGUF y podría ejecutarse con llama.cpp, pero la información proporcionada no lo confirma para este empaquetado.
- Latencia y throughput: 149 tok/s en Chrome sobre M4 Pro, 80–85 tok/s en Safari sobre M4 Pro, 23,9 tok/s en iPhone y 2,9 tok/s en Android Mali-G57. Tiempo hasta la primera palabra entre 0,64 s y 54,0 s según dispositivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | IFEval | MMLU-Redux | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| Ternary-Bonsai-2-2B-mentria | 2B | 2.048 (evaluado) | 74,5% | 67,3% | 50,6% | apache-2.0 | HuggingFace, runtime WebGPU |
| Qwen3.5-0.8B (Q4, conversión de mentria.ai) | 0,8B | 2.048 (evaluado) | 44,0% | 45,5% | 45,4% | no disponible | HuggingFace |
| Qwen3.5-2B-mentria | 2B | no disponible | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La comparación directa disponible es con la conversión Q4 de Qwen3.5-0.8B, de tamaño de descarga similar (485 MB frente a 519 MB). Bonsai 2 2B supera a ese modelo en las tres pruebas con significación estadística. No se han publicado en la información disponible comparaciones con otros modelos ternarios o de 2B de la competencia.

## Limitaciones y advertencias

- Alta tasa de alucinación en conocimiento factual: en la suite factual dura de 350 prompts, aproximadamente tres de cada cuatro respuestas contienen un hecho falso o inventado, y como máximo 2 de 350 son completamente correctas.
- Bucles de repetición en el 14,8% de las respuestas, aunque muy por debajo del 55,2% del modelo Q4 previo.
- El modelo declara únicamente inglés en el campo `language`; el rendimiento en otros idiomas, aunque evaluado, no está garantizado por el autor.
- La licencia apache-2.0 permite uso comercial, pero el modelo depende de mentria-engine, un runtime propietario, para su despliegue previsto; la información sobre licencia del runtime no está disponible.
- En Android con GPU Mali-G57 es más lento que el modelo anterior tanto en velocidad de respuesta como en tiempo hasta la primera palabra.
- El tiempo hasta la primera palabra es mayor que el del modelo Q4 en todos los dispositivos probados, lo que afecta a la percepción de inmediatez en prompts largos.
- El plan de pruebas original exigía que Bonsai fuera como máximo 5 puntos peor en hechos inventados con confianza del 95%; bajo el juez Sonnet el límite resultó +5,43, un incumplimiento de 0,43 puntos, por lo que según la regla del plan el par se leía como "descartar". El cambio se realizó igualmente por las ganancias en el resto de métricas.
- El contexto máximo nativo no está documentado; la evaluación se realizó con 2.048 tokens.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica adopción aún muy limitada fuera de mentria.ai.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mentriaai/Ternary-Bonsai-2-2B-mentria
- Modelo base upstream (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-2B-gguf
- Modelo previo sustituido: https://huggingface.co/mentriaai/Qwen3.5-0.8B-mentria
- Modelo con la misma torre de visión: https://huggingface.co/mentriaai/Qwen3.5-2B-mentria
- Sitio de mentria.ai: https://mentria.ai
