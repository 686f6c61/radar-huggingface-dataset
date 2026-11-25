# bench-labs/cagliostro-v3.5

## Resumen

cagliostro-v3.5 es un modelo de lenguaje decoder-only de 146 millones de parámetros desarrollado por bench-labs. Se trata del checkpoint final de cagliostro-v3 sometido a una etapa adicional de preentrenamiento corta (0,39B tokens) que mezcla los datos de cooldown del propio v3 con texto instructivo y de tipo libro de texto procedente de Cosmopedia. Mantiene la misma arquitectura y tokenizer que su predecesor, acumulando un total de 75,39B tokens de entrenamiento.

El modelo se posiciona como un "small language model" (SLM) de propósito general orientado a generación de texto en inglés, con licencia Apache 2.0. Su relevancia radica en que, según las cifras publicadas por el autor, alcanza un índice de 27,49 en la Open SLM Leaderboard, superando por un margen estrecho a SmolLM2-135M (27,13) pese a haberse entrenado con una fracción muy inferior de tokens (75,4B frente a 2T).

La ficha se centra en el modelo base; el autor publica además una variante chat (cagliostro-v3.5-chat) afinada con SFT sobre smol-smoltalk. El modelo está pensado para experimentación con modelos pequeños, evaluación comparativa y despliegue en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM) |
| Parámetros totales | 146.352.000 (146M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en float32; repo de 0,6 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 146M parámetros, misma arquitectura y tokenizer que cagliostro-v3. La etapa adicional de entrenamiento parte del paso 762.939 de v3 (pesos y estado de AdamW) y ejecuta 4.000 pasos con 98.304 tokens por paso, es decir, 0,39B tokens. Se usa AdamW con weight decay de 0,01, warmup de 200 pasos hasta un pico de 3e-4 (una décima parte del 3e-3 de v3) y decaimiento coseno hasta cero. El entrenamiento se realizó en una única RTX PRO 6000 Blackwell en unos 41 minutos a 162.000 tokens por segundo.

La mezcla de datos de esta etapa combina los datos de cooldown de v3 escalados al 55% (FineWeb-Edu deduplicado, FineMath 3+, OpenMathInstruct-2, SmolTalk, DCLM-Baseline) con nuevas fuentes de Cosmopedia: tutoriales estilo WikiHow (30%), libros de texto de OpenStax, Khan Academy y Stanford (15%) y Cosmopedia v2 (13,75%). El conjunto WikiHow (174M tokens) se vio aproximadamente 0,7 veces. La selección de la receta se hizo entre seis ejecuciones con distintos datos y semillas, fijando a priori los criterios de victoria. Se aplicó descontaminación por n-gramas de 13 tokens contra HellaSwag validación, ARC test, PIQA validación y ArithMark-3.

## Capacidades

- Generación de texto autoregresiva en inglés (modelo base, sin plantilla de chat).
- Razonamiento básico y respuesta a preguntas de conocimiento general a pequeña escala.
- Aritmética elemental y resolución de problemas matemáticos simples (entrenado con FineMath y OpenMathInstruct-2).
- Comprensión lectora y tareas de sentido común (HellaSwag, PIQA, ARC).
- Capacidad de continuación de texto e instrucciones implícitas de estilo tutorial/libro de texto.
- No incluye soporte nativo de tool calling ni function calling documentado.
- No se documentan capacidades de agente, razonamiento multi-paso explícito, visión ni audio.
- Multilingüe: únicamente inglés.
- La variante chat (cagliostro-v3.5-chat) añade seguimiento de system prompts y cierre de turnos propios.

## Casos de uso

- Evaluación comparativa de SLM: sirve como referencia de modelo de 146M parámetros para medir recetas de entrenamiento y estrategias de cooldown frente a SmolLM2-135M y similares.
- Generación de texto asistida en entornos con recursos mínimos: al ocupar 0,6 GB en float32, puede ejecutarse en CPU o en GPUs de gama baja para tareas de continuación de texto y borradores.
- Fine-tuning ligero para dominios concretos: su tamaño permite ajustar el modelo completo o con LoRA en una sola GPU consumer para tareas de clasificación, resumen o extracción.
- Investigación en mecánica interna y análisis de modelos pequeños: su licencia Apache 2.0 y su reducido tamaño facilitan estudios de interpretabilidad y ablaciones reproducibles.
- Prototipado educativo: base para demostraciones de entrenamiento de LLM desde cero y comparación de mezclas de datos (Cosmopedia, FineMath, DCLM).
- Generación de texto sintético de bajo coste: útil para aumentar datasets o generar ejemplos en pipelines de datos donde el throughput importa más que la calidad puntera.
- Punto de partida para destilación: puede emplearse como alumno en procesos de destilación desde modelos mayores dado su bajo coste de inferencia.

## Benchmarks y rendimiento

Resultados zero-shot medidos con lm-evaluation-harness y el script ArithMark-3 de la leaderboard, sobre los pesos float32 del repositorio.

| Benchmark | Métrica | Puntuación |
|---|---|---:|
| HellaSwag | acc_norm | 43,41 |
| ARC-Easy | acc_norm | 53,75 |
| ARC-Challenge | acc_norm | 29,35 |
| PIQA | acc_norm | 68,06 |
| ArithMark-3 | acc_norm | 45,30 |
| Open SLM Index | — | 27,49 |

Comparativa con modelos de la misma franja según las cifras publicadas por la leaderboard:

| Modelo | Parámetros | Tokens | Index |
|---|---:|---:|---:|
| cagliostro-v3.5 | 146M | 75,4B | 27,49 |
| SmolLM2-135M | 135M | 2T | 27,13 |
| cagliostro-v3 | 146M | 75B | 26,55 |
| SmolLM-135M | 135M | 600B | 25,74 |
| GPT-X2.5-135M | 135M | 75B | 25,17 |
| Haidass1.5-143M | 143M | 400B | 25,07 |

El autor advierte que, reevaluado en el mismo harness, SmolLM2-135M obtiene 27,01 y la diferencia de 0,48 puntos tiene un intervalo de confianza del 95% de [-0,82, +1,75] según bootstrap emparejado, por lo que no puede afirmarse una superioridad estadísticamente significativa.

## Requisitos de hardware

- VRAM estimada en float32: aproximadamente 0,6 GB de pesos; en float16 unos 0,3 GB; en cuantización de 4 bits por debajo de 0,1 GB de pesos.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para float32 con overhead; una RTX 4090 o A100 no son necesarias pero permiten mayor throughput en batching.
- Opciones de despliegue: transformers (requiere `custom_code`), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo). vLLM y TGI no están confirmados para esta arquitectura con código personalizado.
- Throughput de entrenamiento reportado: 162.000 tokens por segundo en una RTX PRO 6000 Blackwell. No se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Index (Open SLM) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| cagliostro-v3.5 | 146M | no disponible | 27,49 | Apache 2.0 | Hugging Face |
| SmolLM2-135M | 135M | no disponible | 27,13 | Apache 2.0 | Hugging Face |
| SmolLM-135M | 135M | no disponible | 25,74 | Apache 2.0 | Hugging Face |
| cagliostro-v3 | 146M | no disponible | 26,55 | Apache 2.0 | Hugging Face |

La comparación se limita a los modelos presentes en la Open SLM Leaderboard citados por el autor. La longitud de contexto de los modelos alternativos no se detalla en la información disponible.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones de forma fiable ni mantiene formato de chat; para conversación debe usarse la variante chat.
- Idioma: entrenado y evaluado únicamente en inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación y errores factuales propio de un modelo de 146M parámetros con conocimiento limitado.
- Sesgos: al entrenarse sobre corpus web (FineWeb-Edu, DCLM, Cosmopedia) puede reproducir sesgos presentes en esos datos; el autor no documenta evaluaciones de sesgo.
- La ventaja frente a SmolLM2-135M no es estadísticamente significativa según el propio intervalo de confianza del autor.
- Requiere `trust_remote_code` por el uso de `custom_code`, lo que implica ejecutar código del autor.
- No se documentan resultados de seguridad, toxicidad ni robustez adversarial.
- Licencia Apache 2.0 permite uso comercial, pero sin garantías del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bench-labs/cagliostro-v3.5
- Variante chat: https://huggingface.co/bench-labs/cagliostro-v3.5-chat
- Modelo base previo: https://huggingface.co/bench-labs/cagliostro-v3
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Vídeo de demostración: https://huggingface.co/bench-labs/cagliostro-v3.5/resolve/main/cagliostro-v3.5.mp4
- Dataset SmolLM corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset DCLM-Baseline: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
