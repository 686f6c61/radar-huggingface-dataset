# Quazim0t0/MaleCNS-SpikeWhale-Anatomy-LM

## Resumen

MaleCNS-SpikeWhale-Anatomy-LM es un artefacto de investigación publicado por el usuario Quazim0t0 en HuggingFace: una red neuronal de impulsos (SNN) construida desde cero cuyo estado recurrente no es una pila densa de capas LIF, sino la matriz de conectividad del conectoma **MaleCNS v1.0** de *Drosophila melanogaster* (cerebro más cordón nervioso ventral), con 167.565 neuronas anatómicas y 25.623.478 aristas dirigidas. El modelo reutiliza la primitiva LIF de SpikeWhale (`lif.py`: spikes duros, pendiente fast-sigmoid 20, soft reset, clamp DERF 30) y entrena únicamente los valores sinápticos de una matriz CSR dispersa mediante autograd restringido a los elementos no nulos.

Se trata de un *fine-tune*/continuación del modelo base Quazim0t0/SpikeWhale-SNN-216M, del que hereda tokenizador byte-level con vocabulario de 16.512 entradas y el pipeline de datos. El checkpoint publicado corresponde al paso 1.000 de 50.000 y está explícitamente marcado por el autor como **undertrained y no utilizable como modelo de lenguaje**: la entropía cruzada de entrenamiento es de 4,892 nats/token (frente a ~9,71 de azar uniforme), la tasa de disparo del readout se mantiene en ~0,65 % y la decodificación greedy es degenerada.

Su relevancia es exclusivamente metodológica: demuestra que es viable usar un conectoma biológico real como sustrato recurrente de un modelo de lenguaje con autograd disperso, y documenta con detalle los modos de fallo encontrados (latching de la clique de Kenyon, alcance insuficiente del atlas sensorial con un solo tick, explosión de logits con Muon a 0,02 sobre la cabeza).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SNN LIF de spikes duros con matriz recurrente = conectoma MaleCNS v1.0 de Drosophila (cerebro + VNC), almacenada en CSR disperso |
| Parametros totales | No disponible como cifra única; se documentan 25.623.478 aristas dirigidas y una matriz dispersa `W` de 25,6 M de pesos, más embedding de 64 dim, inyección de hubs y cabeza lineal de 128 dim |
| Parametros activos | No procede (no es MoE); el cómputo es disperso sobre los nnz de la CSR |
| Longitud de contexto | 256 tokens (secuencia de entrenamiento); no se declara ventana superior |
| Tipos de cuantizacion | No disponible (solo se publican checkpoints PyTorch en `.pt`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 (el conectoma MaleCNS v1.0 subyacente es CC-BY 4.0) |
| Formato de pesos | PyTorch (`.pt`): `checkpoints/step1000.pt` y `checkpoints/male_cns_spikewhale.pt`; no hay safetensors ni GGUF |
| Neuronas anatómicas | 167.565 |
| Aristas dirigidas | 25.623.478 |
| Ticks por token | 4 (corriente mantenida en todos los ticks; 1 tick = 1 salto sináptico) |
| Tokenizador | Byte-level length-max de SpikeWhale, vocabulario 16.512 |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El flujo de cómputo del checkpoint es el siguiente: el id de token se proyecta a un embedding de 64 dimensiones; esa señal se inyecta como corriente sobre 5 ganadores de grupos sensoriales más los 32 primeros de las 256 células con mayor grado de salida (drive 0,8); a continuación se ejecutan 4 ticks LIF con la corriente mantenida, donde la recurrencia se calcula como `(W @ spikes) / sqrt(in_degree) * rec_scale(5)`. Los spikes de las células de Kenyon reentran en `W` (`mask_kenyon=false`), con un tope de masa de spikes de 80. La lectura se toma de `tanh(pre-reset)` sobre la unión de Kenyon y los hubs, pasa por LayerNorm y una capa lineal de 128 dimensiones hasta el vocabulario de 16.512. En esta ejecución `kc_drive = 0`, es decir, no se aplica hash 128-hot del token sobre Kenyon. Las ganancias de neurotransmisor están congeladas; solo se entrenan `W`, el embedding, `hub_in` y la cabeza.

El optimizador combina MuonEq-R para matrices 2D (excepto la capa de salida) con AdamW para parámetros 1D, embedding y salida, con picos de 1e-3 (Adam) y 5e-3 (Muon) y warmup 0. Los datos se sirven en streaming con una mezcla 40 % FineWeb-Edu / 40 % mezcla estilo DCLM / 20 % IFM, la misma del pretrain del modelo padre FruitFly. No se documenta ningún uso de RLHF, DPO o ajuste por preferencias. La innovación técnica central es el autograd restringido a los nnz de una CSR dispersa sobre una topología fija impuesta por un conectoma biológico, en lugar de una matriz densa aprendida.

## Capacidades

- Generación de texto: formalmente soportada por el pipeline `text-generation`, pero en la práctica degenerada. La decodificación greedy emite un punto y líneas en blanco; el muestreo con T=0,8 y top-50 produce inglés fragmentado.
- Razonamiento, matemáticas y código: no disponible; no hay evidencia de ninguna de estas capacidades a 1.000 pasos de entrenamiento.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no; el modelo está entrenado y etiquetado únicamente en inglés.
- Capacidades especiales: cómputo neuromórfico con spikes duros y recurrencia multi-salto sobre un conectoma real; modo de lectura sobre la unión Kenyon ∪ hubs; sin visión, audio ni *thinking mode*.
- Continuación del entrenamiento: el checkpoint permite reanudar en el paso 1.001, aunque los momentos del optimizador no se guardan y se reinician.

## Casos de uso

- Investigación en neurociencia computacional: emplear el conectoma MaleCNS v1.0 como matriz recurrente permite estudiar cómo fluye la información a través de circuitos biológicos reales (grupos sensoriales, Kenyon, hubs de alto grado) bajo una tarea de predicción de siguiente token.
- Reproducción de experimentos de autograd disperso: el repositorio incluye `sparse_mm.py` y `train_anatomy.py`, lo que permite replicar el entrenamiento con gradientes calculados únicamente sobre los nnz de una CSR de 25,6 M de aristas en una GPU de 12 GB.
- Estudio de modos de fallo en SNN: el model card documenta cinco fallos reproducibles (atlas sensorial que no alcanza Kenyon con 1 tick, latching de la clique de Kenyon al 80-99 %, cabeza que ve un 128-hot del token actual, explosión de logits con Muon 0,02 y OOM en BPTT de 8 ticks). Sirve como banco de pruebas negativo para quienes diseñan SNN profundas.
- Comparación de sustratos: permite contrastar de forma controlada una topología biológica dispersa frente a las 4 capas densas LIF × 1488 del modelo padre, usando la misma primitiva `lif.py` y el mismo tokenizador.
- Docencia y divulgación: el repositorio incluye `atlas/` con grupos sensoriales e índice de Kenyon, `logs/train_anatomy_1k.jsonl` con métricas por paso y volcados de generación, material adecuado para explicar qué es un tick, un salto sináptico y una lectura pre-reset.
- Base para futuras extensiones: el checkpoint y el artefacto de topología congelada (`male_cns_spikewhale.pt`) permiten experimentar con estrategias de inyección de corriente (hub inject, kc_drive) o con readouts alternativos sin redefinir la conectividad.
- Atención al cliente, generación de código en producción o cualquier aplicación de cara al usuario: **no recomendado**; el propio autor indica que no es un modelo de lenguaje utilizable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos numéricos son métricas internas de entrenamiento:

| Metrica | Valor | Nota |
|---|---|---|
| Cross-entropy de entrenamiento (paso 1000) | 4,892 nats/token | Referencia de azar uniforme: ln(16512) ≈ 9,71 |
| Mejor cross-entropy registrada | 4,010 | Paso 896 |
| Tasa de disparo del readout | ~0,65 % | Kenyon/readout no latch; rango 0,4-0,7 % |
| `w_grad` | ~0,08 | Activo |
| Ticks por token | 4 | Corriente mantenida todos los ticks |
| Secuencia / batch | 256 tokens, batch 2 × accum 2 | |
| Velocidad de entrenamiento | ~79 s/paso | RTX 3060 12 GB, ~3 GB de VRAM |
| Pasos completados | 1.000 / 50.000 | Ejecución pausada |
| Bits/token del modelo padre (referencia) | ~3,98 bits/token a ~32k pasos | SpikeWhale-SNN-216M con `W_rec` densa |

## Requisitos de hardware

- Entrenamiento verificado: una única RTX 3060 de 12 GB, con ~3 GB de VRAM ocupados y ~79 s por paso (secuencia 256, batch 2, accum 2, 4 ticks).
- Inferencia: el repositorio completo ocupa 0,4 GB, por lo que el checkpoint cabe con holgura en cualquier GPU consumer (RTX 3060, 4060, 4090) e incluso en CPU, aunque no hay latencias publicadas.
- OOM conocido: BPTT completo de 8 ticks con secuencia 512 y batch 2 agota los 12 GB si se hace checkpoint en cada tick.
- Opciones de despliegue: no hay soporte para vLLM, llama.cpp, Ollama, TGI ni ningún servidor de inferencia estándar. El despliegue requiere PyTorch y el código propio del repositorio (`code/generate.py` con `sparse_mm.py`), además de copiar o enlazar `male_cns_spikewhale.pt` a `../../output/` respecto a `experiments/anatomy_lm`, o editar las rutas del script.
- Latencia y throughput de inferencia: no disponibles.
- Nota operativa: al reanudar el entrenamiento, los momentos de Adam y Muon no están en el checkpoint y se reinician; el scheduler coseno usa el índice de paso.

## Comparativa con modelos similares

| Modelo | Sustrato recurrente | Pesos | Ticks / contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| MaleCNS-SpikeWhale-Anatomy-LM | Conectoma MaleCNS v1.0: 167.565 neuronas, 25.623.478 aristas dirigidas (CSR) | `W` dispersa de 25,6 M + embedding 64 + hub inject + cabeza 128 | 4 ticks/token (1 tick = 1 salto sináptico), seq 256 | CE 4,892 nats/token a 1.000 pasos; generación degenerada | Apache 2.0 (conectoma CC-BY 4.0) |
| SpikeWhale-SNN-216M (modelo base) | 4 capas LIF densas × 1488 con `W_in` / `W_rec` aprendidas | ~216 M | 1 tick/token mezcla la capa completa | ~3,98 bits/token tras ~32k pasos | No disponible en la información proporcionada |
| Alternativas de terceros | No disponible: no se documenta en la información proporcionada ningún otro modelo público que use un conectoma completo como matriz recurrente de un LM | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es interna: ambos modelos comparten `lif.py`, tokenizador y mezcla de datos, y difieren en que el modelo padre aprende una recurrencia densa mientras que este impone una topología biológica fija y dispersa.

## Limitaciones y advertencias

- Artefacto de investigación no utilizable: el propio autor lo etiqueta como *undertrained* y "not a usable language model". No debe desplegarse en producción ni evaluarse como un LM convencional.
- Generación degenerada: greedy emite un punto seguido de líneas en blanco; el muestreo produce inglés fragmentado y sin coherencia.
- Entrenamiento incompleto: 1.000 de 50.000 pasos previstos, con cross-entropy de 4,892 nats/token frente a 9,71 de azar uniforme.
- Sesgos conocidos: no se documentan análisis de sesgo; el entrenamiento usa FineWeb-Edu, una mezcla estilo DCLM e IFM, por lo que hereda los sesgos de esas fuentes sin ningún ajuste posterior.
- Riesgo de alucinación: total. Al no haber adquirido gramática ni conocimiento factual, cualquier salida fluida sería incidental y no verificable.
- Limitación de idioma: solo inglés; el vocabulario es byte-level con 16.512 entradas.
- Limitación de contexto: 256 tokens de secuencia de entrenamiento, sin mecanismo documentado para extrapolar a ventanas mayores.
- Restricciones de licencia: los pesos se publican bajo Apache 2.0, lo que permite uso comercial del modelo. Sin embargo, el conectoma MaleCNS v1.0 es CC-BY 4.0 (FlyEM, HHMI Janelia; University of Cambridge; MRC LMB; Google Research), por lo que su reutilización exige atribución.
- Caveats de reproducibilidad: los momentos del optimizador no se guardan en el checkpoint; el scheduler coseno depende del índice de paso; `generate.py` espera rutas concretas del árbol de entrenamiento que hay que recrear manualmente.
- Modos de fallo ya observados: 1 tick/token impide que el atlas sensorial alcance Kenyon (0 % de células de Kenyon activadas); secuencia 512 con recurrencia fuerte provoca latching de la clique de Kenyon (80-99 %); intensidad 1.1 sobre Kenyon hace que la cabeza vea un 128-hot del token actual y colapse a "the the the"; Muon a 0,02 sobre la capa de salida dispara `logit_rms` y lleva la CE de 7 a 15.
- Cero adopción verificable: 0 descargas y 0 "likes" en el momento de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quazim0t0/MaleCNS-SpikeWhale-Anatomy-LM
- Modelo base (SpikeWhale-SNN-216M): https://huggingface.co/Quazim0t0/SpikeWhale-SNN-216M
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Conectoma MaleCNS v1.0 (FlyEM, Janelia): https://male-cns.janelia.org/
- Referencia del conectoma: Berg et al., *Cell* 2026 (citado en el model card)
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a documentación de soporte de Windows File Explorer (support.microsoft.com, elevenforum.com) y no guardan ninguna relación con el modelo ni con redes neuronales de impulsos.
