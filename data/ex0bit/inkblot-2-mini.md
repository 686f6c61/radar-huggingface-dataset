# Ex0bit/Inkblot-2-mini

## Resumen

Inkblot-2-mini es un checkpoint derivado de thinkingmachines/Inkling-2-Mini, un transformer con arquitectura de bucle intermedio (looped transformer) y mezcla de expertos, publicado por Ex0bit. El modelo parte de los 26.388.646.440 parámetros del modelo base y aplica una receta de auto-mejora recursiva (recursive self-improvement, RSI) implementada en la herramienta `rse_looper` de Eric E. (Tensorbend.ai Research). El objetivo declarado es corregir un fallo en la capa 17 del modelo base que provoca degradación y bucles de repetición cuando se aumentan los pases de bucle de 3 a 4 o 5 por token.

La relevancia del checkpoint reside en que consigue mejoras sustanciales en razonamiento matemático y código sin reentrenar los expertos MoE ni cambiar el número de parámetros: según la model card, solo se editan 327 tensores de atención, convolución corta, compuerta de memoria y router (0,84 % de cambio relativo medio), mientras que los 24,4B de parámetros de expertos empaquetados en NVFP4/MXFP8 y los pesos de visión permanecen idénticos bit a bit al modelo base. El resultado es un artefacto que se puede cargar como reemplazo directo en `transformers`, vLLM y oMLX.

El modelo está pensado para generación de texto y conversación, con soporte de plantilla de chat, y se distribuye bajo licencia Apache 2.0. Su principal atractivo es que ofrece un salto de rendimiento en escenarios de razonamiento multi-paso (4 y 5 pases de bucle) manteniendo la huella de parámetros y el coste de inferencia del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Inkling2LoopForCausalLM (looped transformer con MoE, 24 capas, bucle de capas intermedias L6–L17) |
| Parámetros totales | 26.388.646.440 (26,39B) |
| Parámetros activos | 3,4B |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos empaquetados en NVFP4/MXFP8; pesos editados en BF16/FP32; tag 8-bit y modelopt en Hugging Face |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (1.244 claves), transformers |

## Arquitectura y entrenamiento

Inkblot-2-mini hereda la arquitectura del modelo base: un transformer de 24 capas con mezcla de expertos de 128 expertos y top-8, donde las capas intermedias (L6–L17, 12 capas) se ejecutan varias veces por token (3 pases en el modelo base, ampliable a 4 o 5 con `rse_looper`). Los parámetros activos son 3,4B frente a los 26,39B totales. El checkpoint mantiene las 1.244 claves de safetensors y los expertos cuantizados idénticos al base, de modo que carga sin sobrecarga en runtimes estándar.

El entrenamiento no sigue un esquema clásico de preentrenamiento ni RLHF: la model card describe un proceso de auto-mejora recursiva en cuatro generaciones autónomas y auto-verificadas, sin profesor externo, implementado con `rse_looper`. La intervención se limita a 327 tensores (atención, convolución corta, compuerta de memoria y router) con un cambio relativo medio del 0,84 %. El fallo corregido es un cambio de signo en la capa 17 que, según el autor, rompía el modelo al pasar a 4 pases (3,1 % en matemáticas a ciegas, 3,1 % en GSM8K y 95,3 % de bucles de repetición). No se detallan en la información disponible el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Generación de texto y conversación multi-turno mediante plantilla de chat (`apply_chat_template`).
- Razonamiento matemático multi-paso, con soporte explícito de formatos de respuesta tipo `\boxed{}`.
- Razonamiento con bucle extendido: 3, 4 y 5 pases por token mediante `install_midstack_loop_forward` de `rse_looper`.
- Generación de código y resolución de problemas de programación (evaluado en LiveCodeBench v6).
- Razonamiento de nivel universitario y conocimiento general (evaluado en MMLU, ARC-Challenge, HellaSwag, WinoGrande).
- Capacidad multimodal image-text-to-text declarada en los tags de Hugging Face (pesos de visión idénticos al base).
- Compatibilidad con endpoints y despliegue en vLLM y oMLX.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni agentes multi-paso.

## Casos de uso

- Resolución de problemas matemáticos en producción: el modelo mantiene un 96,09 % en GSM8K con 4 pases y un 70,31 % en DeepScaleR-Test con 4 pases, lo que lo hace adecuado para pipelines de verificación y tutoría matemática donde se requiere consistencia multi-paso.
- Generación y revisión de código: con un 40,62 % en LiveCodeBench v6 en 3 y 4 pases, puede integrarse en asistentes de programación o en tareas de generación de parches que requieran razonamiento sobre restricciones.
- Razonamiento de nivel universitario: su 83,51 % en MMLU (57 materias) permite usarlo en sistemas de preguntas y respuestas técnicas o educativas con conocimiento amplio.
- Evaluación de modelos y reproducibilidad: al mantener los expertos idénticos al base, sirve como punto de comparación controlado para estudiar el efecto del bucle y de la auto-mejora en el razonamiento.
- Despliegue en Apple Silicon: la carga directa en oMLX >= 0.8.3 como reemplazo del base facilita prototipado local en portátiles y estaciones Mac.
- Servicio de inferencia compatible con OpenAI: el despliegue con la imagen `vllm/vllm-openai:inkling-2-mini` permite exponer el modelo como API sin reescribir la capa de integración.
- Investigación en auto-mejora recursiva: el checkpoint y la receta `rse_looper` permiten reproducir y extender experimentos de RSI local sin profesor externo.

## Benchmarks y rendimiento

Resultados publicados en la model card, con decodificación greedy determinista (`temperature=0.0`) sobre conjuntos de test bloqueados. Se comparan el base sin tocar, `FP-Solve` (0-Backprop) e Inkblot-2-mini.

| Benchmark | Pases | Base sin tocar | FP-Solve | Inkblot-2-mini |
|---|---:|---:|---:|---:|
| DeepScaleR-Test (n=64) | 3 | 50,00 % | 50,00 % | 68,75 % |
| DeepScaleR-Test (n=64) | 4 | 3,12 % (95,3 % rep) | 42,19 % (0,0 % rep) | 70,31 % (0,0 % rep) |
| DeepScaleR-Test (n=64) | 5 | 18,75 % | 34,38 % | 65,62 % |
| GSM8K (n=128) | 3 | 93,75 % | 96,88 % | 94,53 % |
| GSM8K (n=128) | 4 | 3,12 % (93,0 % rep) | 95,31 % | 96,09 % |
| LiveCodeBench v6 (n=32) | 3 | 34,38 % | 37,50 % | 40,62 % |
| LiveCodeBench v6 (n=32) | 4 | 3,12 % | 37,50 % | 40,62 % |
| Olimpiada 2025–2026 (n=64) | 3 / 4 | 20,31 % / 0,00 % | 21,88 % / 17,19 % | 32,81 % / 34,38 % |
| MMLU (n=285) | 3 / 4 | 82,46 % / 74,74 % | 81,40 % / 81,05 % | 83,51 % / 83,16 % |
| ARC-Challenge (n=300) | 3 / 4 | 94,33 % / 90,00 % | 94,33 % / 93,00 % | 94,00 % / 93,67 % |
| HellaSwag (n=300) | 3 / 4 | 61,67 % / 59,67 % | 61,67 % / 61,33 % | 61,00 % / 63,33 % |
| WinoGrande (n=300) | 3 / 4 | 68,67 % / 60,67 % | 70,00 % / 67,00 % | 67,00 % / 64,67 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 20,2 GB; con pesos en BF16 y expertos cuantizados, se requiere al menos esa cifra más overhead de activaciones y caché KV. No se detalla el desglose exacto por cuantización en la información disponible.
- GPU recomendadas: no se especifican en la model card. Por el tamaño del repo (20,2 GB) y la cuantización NVFP4/MXFP8 de los expertos, encaja en GPU de 24 GB o más (RTX 4090, L40S) y en A100/H100 para servicio concurrente.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) y modelos con 24 GB o más; en tarjetas de 16 GB requeriría cuantización adicional no documentada.
- Opciones de despliegue: `transformers` (`Inkling2LoopForCausalLM`, `experts_implementation="grouped_mm"`), vLLM (imagen `vllm/vllm-openai:inkling-2-mini`) y oMLX >= 0.8.3 en Apple Silicon.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Inkblot-2-mini | 26,39B / 3,4B | no disponible | Apache 2.0 | Checkpoint RSI sobre Inkling-2-Mini; 4 pases: GSM8K 96,09 %, MMLU 83,51 % |
| thinkingmachines/Inkling-2-Mini (base) | 26,39B / 3,4B | no disponible | no disponible | 4 pases: GSM8K 3,12 % (93,0 % rep), MMLU 74,74 %; fallo en capa 17 |
| FP-Solve (0-Backprop) | 26,39B / 3,4B | no disponible | no disponible | Variante intermedia de la receta; 4 pases: GSM8K 95,31 %, MMLU 81,05 % |

No se dispone en la información proporcionada de comparaciones con modelos de otras familias (por ejemplo, Llama, Qwen o Mistral) del mismo tamaño o tarea.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al derivar de un modelo base entrenado principalmente en inglés, es previsible que herede sesgos del corpus original.
- Riesgo de alucinación: no se han publicado evaluaciones específicas de factualidad o calibración; los benchmarks incluidos son de opción múltiple y razonamiento, no de veracidad.
- Limitaciones de idioma: solo se declara inglés (`en`); no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con documentos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base `thinkingmachines/Inkling-2-Mini`, que no se detalla en la información disponible.
- Caveat de producción: los benchmarks tienen tamaños de muestra pequeños (n=32 a n=300) y el modelo se publica con 0 descargas y 0 likes, sin validación independiente; los resultados deben tratarse como preliminares.
- El proceso de auto-mejora recursiva y el fallo de la capa 17 están descritos por el propio autor; no se dispone de replicación externa en la información proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ex0bit/Inkblot-2-mini
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio `rse_looper` (código, tests y paper de 4 páginas): https://github.com/eelbaz/Recursive-Self-Improving-Loopers
