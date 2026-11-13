# Davidow/spidory

## Resumen

Spidory es una familia de 30 checkpoints de investigación publicada por David Ternoposkiy (usuario Davidow en Hugging Face) que acompaña al borrador de paper *Choose Again Each Loop: Expert Re-selection and the One-Loop Tax in a Small Looped Transformer* (2026). No es un modelo de propósito general: son pesos de ablación para reproducir experimentos sobre transformers con recurrencia latente, concretamente el recetario Dory de NVIDIA a escala de 26M de parámetros. Cada checkpoint se entrenó desde cero sobre 1,2B de tokens con tres semillas distintas (0, 1 y 2), y el repositorio incluye los resultados de test de todos ellos para `k = 1..4`.

La arquitectura base es un transformer con bloque de entrada de 4 capas, un bloque central compartido de 10 capas que se ejecuta `k` veces (`s0 = x`, `u = N(s + x)`, `s = N(F(u))`) y un bloque de salida de 4 capas, con capas nGPT, activación SwiGLU y embeddings posicionales rotatorios (RoPE). Sobre esta base, las variantes añaden cuatro expertos pequeños en el bloque central (MoE), un índice de ejecución por loop, o un bloque intermedio entre loops. El objetivo del trabajo es medir el coste de la recurrencia ("one-loop tax") y evaluar si la reselección de expertos en cada loop mejora la calidad.

Su relevancia es estrictamente metodológica: sirve para estudiar cómo se comporta la recurrencia latente con y sin MoE en un régimen de cómputo controlado, no para desplegar aplicaciones. El vocabulario es de 4.096 tokens y la ventana de contexto de 256 tokens, lo que lo sitúa muy lejos de cualquier uso práctico como LLM. La licencia Apache-2.0 cubre tanto pesos como código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con recurrencia latente (looped transformer), capas nGPT, SwiGLU, RoPE; variantes con MoE de 4 expertos en el bloque central |
| Parametros totales | 26,1M (base y variantes plain); 26,6M (variantes con expertos); 34,9M (variante between-loop); 53,6M (no-loop profundo de 30 capas) |
| Parametros activos | No disponible (el modelo card no detalla el reparto de parámetros activos en las variantes MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | No disponible (los pesos se publican en fp32; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (entrenado sobre TinyStories y datos sintéticos en inglés presumiblemente, pero no se declara) |
| Licencia | Apache-2.0 (pesos y código) |
| Formato de pesos | safetensors (fp32), tokenizer.json (BPE, 4.096 tokens), config.json, results.json, manifest.json |

## Arquitectura y entrenamiento

La arquitectura sigue el recetario Dory de NVIDIA: un bloque de entrada de 4 capas, un bloque central compartido de 10 capas que se aplica `k` veces con la recurrencia `s0 = x`, `u = N(s + x)`, `s = N(F(u))`, y un bloque de salida de 4 capas. Las capas son nGPT (normalized GPT), con SwiGLU como activación y RoPE para la posición. Sobre esta plantilla, el paper explora cuatro ejes de variación: (a) un índice de ejecución por loop (`plain_signal`), (b) la eliminación de la normalización en esa señal (`plain_signal_nonorm`), (c) expertos por secuencia o por token que se reseleccionan en cada loop (`perloop`, `token`, `token_signal`), (d) selección única de expertos (`token_signal_once`), y (e) un bloque adicional entre loops (`between_signal`). También se incluyen dos baselines sin recurrencia: 10 capas y 30 capas.

El entrenamiento se realizó sobre 1,2B de tokens por checkpoint, con tres semillas independientes, y el corpus combina TinyStories, aritmética generada, QA corto y algunos conjuntos pequeños de matemáticas. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación posterior; es entrenamiento de próximo token puro. La innovación técnica destacable es la reselección de expertos en cada pasada por el bloque central, que el paper compara contra la selección única para cuantificar el "one-loop tax". Los pesos se exportaron en fp32 y se verificaron contra los checkpoints de entrenamiento: cada tensor es idéntico y los logits a `k = 1` y `k = 3` coinciden exactamente, según el autor.

## Capacidades

- Generación de texto muy limitada: completado de frases cortas al estilo TinyStories, con vocabulario de 4.096 tokens y contexto de 256 tokens.
- Aritmética de pocos dígitos: el modelo card reporta exactitud exact-match sobre 500 problemas retenidos, con valores entre 59,7% y 71,3% según variante.
- QA corto: parte del corpus de entrenamiento son pares pregunta-respuesta breves.
- Razonamiento multi-paso no soportado de forma fiable: la recurrencia latente es un mecanismo arquitectónico, no una capacidad de agente.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponibles; el vocabulario y el corpus no están documentados para otros idiomas.
- Capacidades especiales: ninguna más allá de la inspección de la ruta de expertos por token o secuencia (`model.infer` devuelve el experto y el run count usados).

## Casos de uso

- Reproducción de experimentos del paper: cargar cada checkpoint con `spidory.hub.load` y ejecutar `model.infer(ids, k=...)` para replicar las curvas de test loss y exactitud aritmética a `k = 1..4`. Es el uso principal declarado por el autor.
- Estudio de la "one-loop tax": comparar `plain_s*` contra `noloop_deep_s*` para medir la pérdida de calidad al sustituir 30 capas por 10 capas repetidas, con el mismo presupuesto de cómputo.
- Ablación de reselección de expertos: contrastar `token_signal_s*` (reselección por loop) contra `token_signal_once_s*` (selección única) para aislar el efecto de la política de enrutamiento en la pérdida de test.
- Análisis de mecanismos de normalización en recurrencia: comparar `plain_signal_s*` contra `plain_signal_nonorm_s*` para estudiar el papel de la normalización de la señal de iteración.
- Docencia y divulgación: el tamaño de 26M y el contexto de 256 tokens permiten ejecutar el modelo en CPU y en GPUs de consumo, lo que lo hace útil para explicar recurrencia latente y MoE en cursos o talleres.
- Verificación de implementaciones: los `results.json` por checkpoint y el `manifest.json` con SHA-256 permiten validar portes a otros frameworks (por ejemplo, una implementación propia en PyTorch o JAX) contra los logits de referencia.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son la pérdida de test (media sobre 7 conjuntos) y la exactitud aritmética exact-match sobre 500 problemas retenidos, con media ± desviación estándar sobre 3 semillas. Los modelos con recurrencia se evalúan a `k = 3`; los baselines sin loop, a `k = 1`.

| Modelo | Parametros | Test loss | Aritmetica (%) |
|---|---|---|---|
| No-loop, 10 capas (k=1) | 26,1M | 1,710 ± 0,002 | 65,5 ± 7,3 |
| No-loop, 30 capas (k=1) | 53,6M | 1,694 ± 0,010 | 70,6 ± 4,8 |
| Plain | 26,1M | 1,708 ± 0,006 | 65,6 ± 4,6 |
| Plain + run index | 26,1M | 1,708 ± 0,009 | 66,7 ± 5,6 |
| Plain + run index, sin norm | 26,1M | 1,711 ± 0,004 | 69,3 ± 4,1 |
| Expertos por secuencia, reseleccionados por loop | 26,6M | 1,768 ± 0,035 | 66,6 ± 10,6 |
| Expertos por token, reseleccionados por loop | 26,6M | 1,716 ± 0,005 | 69,9 ± 4,0 |
| Expertos por token + run index, reseleccionados por loop | 26,6M | 1,711 ± 0,013 | 71,3 ± 10,0 |
| Expertos por token + run index, elegidos una vez | 26,6M | 1,711 ± 0,012 | 59,7 ± 8,4 |
| Bloque entre loops + run index | 34,9M | 1,752 ± 0,012 | 64,1 ± 9,5 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La varianza entre semillas es alta en varias variantes (hasta ±10,6 puntos en exactitud aritmética), lo que limita la interpretación de diferencias pequeñas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los checkpoints de 26M (3,6 GB de repo incluye los 30 checkpoints y el tokenizer); en fp16 o bf16, aproximadamente 60 MB de pesos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; también funciona en CPU sin problema por el tamaño y el contexto corto.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o iGPU moderna; también en Raspberry Pi y entornos similares.
- Opciones de despliegue: el paquete oficial `spidory` (instalable con `pip install git+https://github.com/Davidooff/Spidory`) expone `load`, `generate_text` y `model.infer`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y el formato safetensors en fp32 con arquitectura custom hace poco probable un porte directo sin trabajo adicional.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño y contexto, la latencia esperada es de milisegundos por token en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Spidory (esta ficha) | 26,1M–53,6M | 256 tokens | Looped transformer con nGPT y MoE opcional | Apache-2.0 | Hugging Face + GitHub |
| TinyLlama 1.1B | 1,1B | 2.048 tokens | Transformer denso | Apache-2.0 | Hugging Face |
| Pythia-70M | 70M | 2.048 tokens | Transformer denso | Apache-2.0 | Hugging Face |
| Dory (NVIDIA) | ~26M | No disponible | Looped transformer con nGPT | No disponible en la información | Referencia del paper |

La comparación con TinyLlama y Pythia es solo orientativa: Spidory no compite en calidad de lenguaje general, sino en el estudio de la recurrencia latente. Frente a Dory, del que toma el recetario, Spidory añade las variantes con expertos y el análisis del coste de la recurrencia. No se dispone de benchmarks comunes que permitan una comparación cuantitativa directa con estos modelos.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor lo declara explícitamente como checkpoints para reproducir el paper, no como modelos de propósito general.
- Contexto de 256 tokens: insuficiente para casi cualquier tarea real de generación o razonamiento multi-turno.
- Vocabulario de 4.096 tokens: muy limitado, con cobertura léxica escasa y probablemente sesgada al inglés de TinyStories.
- Corpus de entrenamiento restringido: TinyStories, aritmética generada, QA corto y matemáticas pequeñas; no hay datos de código, visión, audio ni instrucciones generales.
- Riesgo de alucinación: alto fuera del dominio de entrenamiento; el modelo no ha pasado por alineación ni por RLHF/DPO.
- Sesgos conocidos: no documentados en la información disponible; el corpus TinyStories tiene sesgos propios de su generación sintética.
- Varianza alta entre semillas: desviaciones de hasta ±10,6 puntos en exactitud aritmética, lo que exige cautela al comparar variantes.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo no es apto para producción por sus limitaciones técnicas.
- Caveat de producción: la arquitectura es custom y depende del paquete `spidory`; no hay soporte documentado para motores de inferencia estándar (vLLM, TGI, llama.cpp, Ollama).

## Enlaces

- Hugging Face: https://huggingface.co/Davidow/spidory
- Repositorio GitHub (código, paper y scripts de entrenamiento): https://github.com/Davidooff/Spidory
- Paper draft: *Choose Again Each Loop: Expert Re-selection and the One-Loop Tax in a Small Looped Transformer* (David Ternoposkiy, 2026), referenciado en la model card; no se proporciona URL directa en la información disponible.
- Recetario Dory de NVIDIA: referenciado en la model card; no se proporciona URL directa en la información disponible.
