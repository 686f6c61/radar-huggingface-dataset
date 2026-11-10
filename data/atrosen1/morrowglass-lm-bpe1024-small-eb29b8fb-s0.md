# atrosen1/morrowglass-lm-bpe1024-small-eb29b8fb-s0

## Resumen

`morrowglass-lm-bpe1024-small-eb29b8fb-s0` es un transformer decoder-only de 2.016.960 parámetros entrenado desde cero por Morrowglass Model Foundry sobre las obras completas de Shakespeare en dominio público (Project Gutenberg eBook #100). No es un modelo de propósito general ni está ajustado por instrucciones: su función es continuar texto con estilo shakespeariano y servir como banco de pruebas reproducible para estudiar tokenización, entrenamiento, evaluación y serving de modelos pequeños.

El modelo emplea una arquitectura pre-LayerNorm con 4 capas, 4 cabezas de atención, dimensión oculta de 192 y una longitud de contexto de 256 tokens, con posiciones aprendidas y embeddings atados. El tokenizador es un BPE byte-level de 1024 tokens ajustado sobre el split de entrenamiento. El entrenamiento consistió en 2.500 pasos sobre 20.480.000 tokens con AdamW (lr 0.003) en un Apple M5 Pro vía MPS, en 297 segundos.

Su relevancia es metodológica más que práctica: forma parte de un laboratorio de experimentos pre-registrados, con criterios de aceptación definidos antes de ejecutar los runs, y publica métricas de bits por byte con intervalos de confianza bootstrap, mediciones de KV cache y resultados de cuantización int8. Es un caso de estudio de rigor experimental en modelos minúsculos, no una herramienta para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-LayerNorm, 4 capas x 4 cabezas x d=192, posiciones aprendidas, embeddings atados |
| Parámetros totales | 2.016.960 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantización | int8 dinámica (medida en CPU); no se documentan otras |
| Idiomas soportados | inglés (inglés isabelino/shakespeariano) |
| Licencia | MIT (código y pesos); texto de entrenamiento en dominio público |
| Formato de pesos | safetensors (librería `morrowglass`, `pytorch_model_hub_mixin`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con pre-LayerNorm, cuatro capas de atención multi-cabeza (4 cabezas, dimensión de modelo 192), posiciones aprendidas y embeddings de entrada/salida atados. El tokenizador `bpe1024` es un BPE byte-level de 1024 tokens ajustado específicamente sobre el split de entrenamiento, y se distribuye como `tokenizer.json`.

El corpus de entrenamiento es el eBook #100 de Project Gutenberg (obras completas de Shakespeare, sin boilerplate), dividido por obra con semilla fija: validación = *As You Like It*, *Hamlet*, *Titus Andronicus*; test = *Macbeth*, *Pericles*, *Cymbeline*; el resto (incluidos los poemas) es entrenamiento. La selección de modelo usó únicamente validación y el test se abrió una sola vez, con registro en `reports/test_access_log.jsonl`. El run pertenece a un experimento pre-registrado sobre tokenización (byte vs BPE-1024), cuyo veredicto fue "supported" (BPE 2.007 vs byte 2.086 bits/byte en validación). No se documenta RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto por continuación de prompt en estilo shakespeariano (pastiche).
- Modelado de lenguaje a nivel de carácter/byte vía BPE byte-level de 1024 tokens.
- Inspección de atención y ablaciones de decisiones de entrenamiento (caso de uso previsto).
- Serving mediante API compatible con OpenAI (`morrowglass serve`).
- Evaluación con EleutherAI lm-evaluation-harness a través de endpoint compatible.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, visión ni audio.
- Multilingüe: no; solo inglés.

## Casos de uso

- Docencia sobre entrenamiento de transformers: el modelo es lo bastante pequeño (2M parámetros) para entrenarse en minutos en hardware de consumo, lo que permite reproducir el pipeline completo y estudiar cada decisión.
- Ablaciones de tokenización: el run compara byte-level frente a BPE-1024 sobre el mismo corpus y publica bits/byte con intervalos bootstrap, útil para enseñar cómo se diseña y evalúa un experimento pre-registrado.
- Experimentos de serving: las mediciones de KV cache (aceleración de 2,40x a 3,99x en CPU con prompts de 16 a 192 tokens) sirven para ilustrar el impacto real de la caché en decodificación autorregresiva.
- Estudio de cuantización: el resultado de int8 dinámica en CPU (bpb 2.0071 → 2.0102, decodificación 58,9 → 31,7 tokens/s, pesos 7,704 → 2,875 MB) es un caso concreto de compromiso precisión/velocidad/tamaño en modelos minúsculos.
- Pruebas de integración de APIs compatibles con OpenAI: permite validar clientes, proxies y harnesses de evaluación sin coste de GPU ni dependencia de servicios externos.
- Análisis de calibración: el modelo publica ECE top-1 de 0,055 en validación, útil para estudiar calibración en modelos pequeños y comparar con modelos mayores.
- Reproducibilidad de experimentos: el run incluye commit de código (`d72e0589db9f`), semilla, configuración y registros de acceso a test, lo que facilita auditorías metodológicas.

## Benchmarks y rendimiento

Evaluación en splits retenidos (bits por byte UTF-8, menor es mejor, IC bootstrap del 95 %):

| Split | bits/byte | Nota |
|---|---|---|
| Validación | 2.007 [1.993, 2.021] | ECE top-1 0.055 |
| Test | 2.081 [2.064, 2.095] | abierto una vez el 2026-11-09 |

EleutherAI lm-evaluation-harness (0-shot, vía endpoint compatible con OpenAI):

| Tarea | Métrica | Valor |
|---|---|---|
| lambada_openai | acc | 0.0000 |
| wikitext (wikitext-2) | bits/byte | 3.891 |
| Split de validación Shakespeare propio | bits/byte | 2.008 (evaluador propio: 2.007) |

Mediciones de serving (Apple M5 Pro, 2 hilos, batch 1, greedy, 64 tokens nuevos):

| Dispositivo | Tokens de prompt | tokens/s sin caché | tokens/s con KV cache | Aceleración |
|---|---|---|---|---|
| cpu | 16 | 154.0 | 369.8 | 2.40x |
| cpu | 64 | 160.1 | 427.3 | 2.67x |
| cpu | 192 | 85.2 | 340.3 | 3.99x |
| mps | 16 | 145.3 | 131.7 | 0.91x |
| mps | 64 | 61.1 | 74.2 | 1.21x |
| mps | 192 | 62.7 | 69.1 | 1.10x |

Cuantización int8 dinámica (CPU): val bpb 2.0071 → 2.0102 (+0.0031); decodificación 58,9 → 31,7 tokens/s; pesos 7,704 → 2,875 MB. Veredicto registrado: no soportado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (pesos de ~8 MB); el modelo cabe holgadamente en cualquier GPU consumer y en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Se han medido tiempos en Apple M5 Pro (CPU y MPS). Cualquier GPU consumer (por ejemplo, RTX 4090) es sobredimensionada para este modelo.
- Cabe en GPU consumer: sí, en todas las actuales; también en Raspberry Pi y portátiles modestos.
- Opciones de despliegue: librería `morrowglass` (`MorrowglassHubLM.from_pretrained`), servidor propio con API compatible con OpenAI (`uv run morrowglass serve --model ...`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en CPU, 154–160 tokens/s sin caché y 340–427 tokens/s con KV cache (batch 1, greedy); en MPS, 61–145 tokens/s sin caché y 69–132 tokens/s con caché. La caché acelera en CPU pero no en MPS en este hardware.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con otros modelos en la información proporcionada. A modo de referencia estructural, se incluyen alternativas de escala similar, aunque sus métricas no son directamente comparables porque usan corpus y tokenizadores distintos:

| Modelo | Parámetros | Contexto | Corpus | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| morrowglass-lm-bpe1024-small-eb29b8fb-s0 | 2.016.960 | 256 | Shakespeare (Gutenberg #100) | MIT | Hugging Face |
| Modelos tipo nanoGPT (Karpathy) | ~10M–124M | 256–1024 | Shakespeare u OpenWebText | MIT | GitHub |
| Modelos tipo TinyStories | ~1M–30M | 256–512 | TinyStories sintético | variable | Hugging Face |

Los datos de rendimiento de los modelos comparables no están disponibles en la información proporcionada, por lo que no se ofrece una comparación numérica.

## Limitaciones y advertencias

- No está ajustado por instrucciones ni es un modelo de propósito general: no responde preguntas, no conversa y no produce inglés moderno fiable.
- Alucinación y coherencia: con ~2M parámetros y ~4,5 MB de texto de un solo autor, la salida es pastiche con frecuentes sinsentidos y pierde el hilo dentro de una frase.
- Contexto limitado a 256 tokens; los prompts más largos se recortan a los últimos 256 tokens.
- Las probabilidades son puntuaciones del modelo, no confianza calibrada por token.
- Sin ajuste de seguridad: las obras de Shakespeare contienen violencia y prejuicios de época que las muestras pueden reproducir.
- Un solo seed de entrenamiento; el entrenamiento en MPS no es reproducible bit a bit.
- Licencia MIT permite uso comercial, pero el modelo no es apto para generación orientada a usuarios, respuestas factuales ni chat.
- Idiomas: solo inglés isabelino; no hay soporte multilingüe.
- El resultado de cuantización int8 no fue satisfactorio según el criterio pre-registrado (pierde precisión y velocidad en CPU), por lo que no se recomienda para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atrosen1/morrowglass-lm-bpe1024-small-eb29b8fb-s0
- Repositorio del proyecto (Morrowglass Model Foundry): https://github.com/AlexRosen23/morrowglass-model-foundry
- Corpus de entrenamiento (Project Gutenberg eBook #100): https://www.gutenberg.org/ebooks/100
- EleutherAI lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
