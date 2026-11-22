# root-sys-n/Mima-1-Pico-15m

## Resumen

Mima 1 Pico 15M es un modelo de lenguaje causal (decoder-only) entrenado desde cero en turco por el desarrollador independiente root-sys-n. Con 15.537.792 parámetros (aproximadamente 15,54 M, con embeddings atados), se sitúa en la categoría de modelos ultracompactos, pensados para experimentación, docencia y despliegue en entornos con recursos mínimos. Es el checkpoint estable de la etapa `A3-karma` (paso 32.750) del proyecto Mima, y su continuación alineada para chat es `Mima-1.5-Pico-15m-Preview`.

La arquitectura es un transformer clásico de 7 capas, 6 cabezas de atención, dimensión oculta 384 y FFN SwiGLU de 1024, con RMSNorm y RoPE (θ = 10.000). La ventana de contexto es de solo 512 tokens y el vocabulario es un BPE a nivel de byte de 8.192 entradas. El modelo se ha preentrenado sobre `fineweb-2` (subconjunto `tur_Latn`) y la Wikipedia turca, con un total aproximado de 235,9 M de tokens en la etapa base.

Su relevancia es principalmente metodológica: documenta de forma transparente el proceso de entrenamiento por etapas (A0-dil, A1-kavram, A2-sohbet, A3-karma) y publica resultados honestos, incluidos los fallos. Los benchmarks muestran que, a esta escala, el modelo queda en niveles cercanos al azar en tareas de opción múltiple estándar, aunque conserva cierta señal en tareas de lengua y comprensión lectora corta. No es un modelo apto para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), 7 capas, 6 cabezas, dimensión 384, SwiGLU de 1024, RMSNorm, RoPE (θ = 10.000) |
| Parametros totales | 15.537.792 (~15,54 M, embeddings atados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (el repo solo publica safetensors en precisión original) |
| Idiomas soportados | Turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer causal estándar con normalización RMSNorm, embeddings posicionales rotatorios RoPE y activación SwiGLU en la capa feed-forward. El vocabulario es un BPE a nivel de byte de 8.192 tokens, con tokens especiales `<bos>=0`, `<user>=1`, `<asst>=2`, `<end>=3` y `<pad>=4`. El checkpoint publicado corresponde al paso 32.750 de la etapa `A3-karma`, con `val_loss = 0.5522`.

El entrenamiento se organizó en cuatro fases: `A0-dil` (28.000 pasos, ~235,9 M de tokens de texto general turco), `A1-kavram` (~6.500 pasos, conocimiento conceptual), `A2-sohbet` (~2.900 pasos, flujo de diálogo) y `A3-karma` (hasta 32.750 pasos totales, fase mixta). Los datos provienen de `HuggingFaceFW/fineweb-2` (subconjunto `tur_Latn`, licencia ODC-BY) y `wikimedia/wikipedia` (`20231101.tr`, CC BY-SA 4.0). No se documenta en la información disponible el uso de RLHF, DPO ni técnicas de decodificación especulativa.

## Capacidades

- Generación de texto en turco con calidad limitada a frases cortas y contextos muy restringidos.
- Respuesta a preguntas factuales simples cuando el conocimiento está bien representado (por ejemplo, capitales de países).
- Comprensión lectora corta y tareas de lengua y ortografía turca por encima del azar en el benchmark propio del autor.
- Capacidad conversacional básica mediante los tokens especiales `<user>` y `<asst>`, aunque el modelo base no está alineado para diálogo.
- No soporta tool calling ni function calling de forma nativa.
- No soporta razonamiento multi-paso ni uso como agente.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- Multilingüismo: únicamente turco; no se ha entrenado ni evaluado en otros idiomas.

## Casos de uso

- Docencia e investigación sobre entrenamiento de LLM: el modelo sirve como caso de estudio reproducible de un pipeline por etapas con datasets abiertos, útil para cursos y talleres donde se explica el preentrenamiento desde cero.
- Experimentación con modelos ultracompactos: permite probar técnicas de tokenización, curvas de pérdida o ajuste fino en hardware muy limitado (una sola GPU consumer o incluso CPU).
- Generación de texto turco en entornos embebidos: por su tamaño (repo de 0,1 GB), puede integrarse en demos locales o notebooks sin infraestructura dedicada.
- Pruebas de alineación y rechazo: sirve como línea base para comparar contra su sucesor `Mima-1.5-Pico-15m-Preview`, que introduce alineación conversacional y rechazo con "Bilmiyorum.".
- Evaluación de benchmarks de bajo recurso: el autor publica `Mima-TR-MicroBench v1`, un conjunto diseñado para modelos de 5–30 M; el modelo puede usarse como referencia en la validación de dicho benchmark.
- Prototipado de interfaces de chat en turco: con los tokens especiales definidos, se puede montar un Space o demo web (el autor publica uno) para ilustrar el comportamiento de un modelo pequeño antes de escalar a uno mayor.
- Estudio de fallos típicos: los ejemplos publicados (bucles de repetición, alucinaciones en preguntas trampa) lo convierten en un banco de pruebas para detectar y analizar estos comportamientos.

## Benchmarks y rendimiento

| Test / métrica | Preguntas (N) | Nivel de azar | Mima 1 Pico 15M (IC 95 % Wilson) |
|---|---:|---:|---:|
| Pérdida SFT turco held-out (CE / PPL) | 186 (3.947 tok) | — | 3,5078 (PPL 33,37) |
| Respuesta abierta correcta (greedy) | 100 | — | 4,0 % (1,6–9,8; 4/100) |
| Rechazo de trampa imposible ("Bilmiyorum.", greedy) | 100 | — | 0,0 % (0,0–3,7; 0/100) |
| Bucle de repetición (96 tokens, greedy) | 100 | — | 21,0 % (14,2–30,0; 21/100) |
| Mima-TR-MicroBench v1 (frase completa) | 2.000 | 25,0 % | 36,10 % (34,0–38,2) |
| — Lengua y ortografía turca | 400 | 25,0 % | 47,25 % (42,4–52,1) |
| — Comprensión lectora | 400 | 25,0 % | 41,25 % (36,5–46,1) |
| — Cultura general básica | 400 | 25,0 % | 36,50 % (31,9–41,3) |
| — Lógica y sentido común | 400 | 25,0 % | 29,25 % (25,0–33,9) |
| — Aritmética y unidades | 400 | 25,0 % | 26,25 % (22,2–30,8), nivel de azar |
| Mima-TR-MicroBench v1 (A/B/C/D) | 2.000 | 25,0 % | 25,20 % (23,3–27,1), nivel de azar |
| Belebele-TR (acc_norm) | 900 | 25,0 % | 28,67 % (25,8–31,7), cerca del azar |
| ARC-TR (acc_norm) | 1.172 | 25,0 % | 23,21 % (20,9–25,7), nivel de azar |
| TurkishMMLU (All, 5 opciones, acc_norm) | 900 | 20,0 % | 18,22 % (15,8–20,9), nivel de azar |
| TruthfulQA-TR (mc1_acc_norm) | 817 | 22,6 % | 28,76 % (25,8–32,0) |
| HellaSwag-TR (acc_norm) | 2.000 | 25,0 % | 26,00 % (24,1–28,0), nivel de azar |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (15,54 M de parámetros ≈ 62 MB de pesos); en la práctica, el cuello de botella es el runtime, no la memoria.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso CPU. No requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU consumer, en iGPU y en CPU. El repo completo ocupa 0,1 GB.
- Opciones de despliegue: transformers con `trust_remote_code=True` (única vía documentada por el autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la conversión a GGUF no está publicada.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño, se espera generación prácticamente instantánea en GPU y viable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---:|---|---|---|
| Mima 1 Pico 15M | 15,54 M | 512 | Apache 2.0 | Hugging Face, transformers | Entrenado desde cero en turco; benchmarks de opción múltiple en nivel de azar |
| Mima 1.5 Pico 15m Preview | ~15 M (misma base) | No disponible | No disponible | Hugging Face | Continuación alineada para chat con rechazo "Bilmiyorum."; del mismo autor |
| Modelos turcos pequeños de terceros (5–30 M) | 5–30 M | Variable | Variable | No disponible | No se dispone de una comparativa publicada con cifras verificables en la información proporcionada |

No se dispone de datos de benchmarks comparables de otros modelos de la misma escala en la información proporcionada, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Escala muy reducida: 15,54 M de parámetros implican conocimiento factual muy limitado y razonamiento prácticamente inexistente; los benchmarks de opción múltiple estándar quedan en nivel de azar.
- Bucles de repetición: el 21 % de las generaciones greedy de 96 tokens entran en bucle, según la evaluación del propio autor.
- Alucinación: en preguntas trampa o sin respuesta, el modelo no rechaza y tiende a inventar contenido (0 % de rechazo en el test de trampas imposibles).
- Contexto muy corto: 512 tokens impiden conversaciones multi-turno largas o documentos extensos.
- Solo turco: no hay soporte ni evaluación en otros idiomas.
- Sin alineación conversacional: es un modelo base; para diálogo debe usarse la variante `Mima-1.5-Pico-15m-Preview`.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en entornos sensibles.
- Licencia Apache 2.0: permite uso comercial, pero las licencias de los datasets de origen (ODC-BY y CC BY-SA 4.0) pueden imponer obligaciones de atribución o compartir-igual sobre datos derivados; conviene revisarlas antes de un uso comercial.
- No apto para producción general: sin benchmarks que superen el azar en tareas estándar, su uso debe limitarse a experimentación, docencia y prototipado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/root-sys-n/Mima-1-Pico-15m
- Variante alineada para chat: https://huggingface.co/root-sys-n/Mima-1.5-Pico-15m-Preview
- Demo en Space: https://huggingface.co/spaces/root-sys-n/Mima-Pico-Chat
- Benchmark propio: https://huggingface.co/datasets/root-sys-n/Mima-TR-MicroBench
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset de preentrenamiento: https://huggingface.co/datasets/wikimedia/wikipedia
