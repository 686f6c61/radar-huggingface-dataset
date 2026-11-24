# Quazim0t0/MaleCNS-SpikeWhale-Anatomy-LM

## Resumen

MaleCNS-SpikeWhale-Anatomy-LM es un artefacto de investigación desarrollado por el usuario Quazim0t0 que combina una red neuronal de impulsos (spiking neural network, SNN) con el conectoma del sistema nervioso central de la mosca de la fruta (*Drosophila melanogaster*), concretamente la versión MaleCNS v1.0 de Janelia/Google. El modelo no es un transformer convencional: el núcleo recurrente es la matriz de conectividad real del cerebro de la mosca, sobre la que se entrena un autograd disperso (solo valores sinápticos no nulos) y un decodificador de texto de 32,7 millones de parámetros que nunca ve los tokens directamente, sino únicamente la actividad de 4.320 células de lectura del cerebro simulado.

El modelo parte de SpikeWhale-SNN-216M como base y se ha afinado durante 14.580 pasos. En ese punto es capaz de generar fragmentos de inglés, aunque el propio autor lo califica explícitamente como "undertrained" y "not a usable language model". Su interés es científico: demuestra que el estado del cerebro simulado es la única vía por la que el decodificador accede al texto, y que corromper las sinapsis entrenadas o sustituir el estado cerebral por el de otra secuencia hace colapsar la perplejidad.

Es relevante ahora porque publica el conectoma entrenado en el mismo formato exacto que el fichero de Janelia (`connectome-weights-male-cns-v1.0-minconf-0.5.feather`), lo que permite reutilizarlo en herramientas que lean ese formato. La licencia es Apache 2.0 y el repo pesa 3,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SNN recurrente con conectoma biológico (MaleCNS v1.0 de *Drosophila*), neurona LIF dura y decodificador de 4 bloques |
| Parametros totales | no disponible (repo de 3,2 GB; decodificador de 32,7M y base SpikeWhale-SNN-216M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch; exportación adicional en Feather (`connectome-weights-male-cns-v1.0-fly14580.feather`) |

## Arquitectura y entrenamiento

El núcleo es una SNN LIF dura construida desde cero con la primitiva de SpikeWhale (`lif.py`: picos duros, pendiente sigmoide rápida de 20, reset suave, clamp DERF de 30). La matriz recurrente no es una pila densa de 4x1488 como en SpikeWhale, sino el conectoma MaleCNS v1.0 de Janelia/Google. Las sinapsis se entrenan con autograd restringido a valores no nulos a través de una representación CSR dispersa. El decodificador (32,7M, 4 bloques) solo recibe como entrada las 4.320 células de lectura del cerebro, de modo que todo token pasa por las sinapsis entrenadas de la mosca.

El entrenamiento alcanzó el paso 14.580. Los registros del autor documentan que el conectoma entrenado es imprescindible: en el paso 1.000, CE entrenada 5,07 frente a 16,3 con valores barajados y 33,7 con `rec_scale=0`; en el paso 2.855, CE 5,00 frente a 26,96 con sinapsis barajadas, 21,82 con signos aleatorios y 90,37 con `rec_scale=0`. La ganancia del estado cerebral (`brain_gain`) subió de 4,3 a 5,3-5,8 y, en los últimos pasos, a +7,04/+8,15; dar al decodificador el estado de otra secuencia eleva la CE de 3,16-3,50 a 10,20-11,66. También se midió el coste de la restricción de Dale (+0,22 nats en el paso 2.948, +1,70 en el 3.440) y se ajustaron ocho tipos de neurotransmisor con cableado congelado (CE de validación de 3,03 a 2,86).

## Capacidades

- Generación de texto en inglés a nivel de fragmentos, no fluido (estado en el paso 14.580).
- Razonamiento visual: la fase 0 ya barajó el lóbulo óptico y el modelo supera a su gemelo reconfigurado en tarea de paralaje (0,42 frente a ≤0,35 con píxeles y 0,31 sin movimiento).
- Procesamiento de estímulos visuales vía VPN tokens, DINOv2 y Daisy, con acoplamiento ocular medido de 0,63 a 0,85.
- Circuito de recompensa tipo PAM/PPL1 con 316 y 16 células y sinapsis DAN reales sobre 8.615 células (4.061/4.064 Kenyon).
- Tarea de odores con cuerpo de hongo: 4.064 Kenyon, 97 MBON y 340 DAN; recuperación de la vía PPL1-gamma1pedc → MBON11.
- Diferenciación de estímulos gustativos (azúcar 222 Hz frente a amargo 21 Hz en MN9 original; tras entrenamiento el amargo cae a 0 Hz).
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: solo inglés.
- Modo thinking, visión o audio como producto: no disponible; la visión existe solo como estímulo experimental.

## Casos de uso

- Investigación en neurociencia computacional: reproducir el experimento de ablación de sinapsis (`W`) y comparar CE entrenada frente a sinapsis barajadas, signos aleatorios y `rec_scale=0` para estudiar qué información codifica el conectoma.
- Estudio de conectomas: cargar el fichero Feather exportado en herramientas que lean el formato de Janelia y analizar los pesos sinápticos entrenados con los mismos body IDs y ordenación.
- Experimentos de neuromodulación: analizar el ajuste de ocho tipos de neurotransmisor con cableado congelado (Glu/histamina con umbral 0,82/0,84; DA con umbral 0,808 y ganancia 1,286) y su efecto sobre la CE de validación.
- Evaluación de circuitos sensoriales: usar las tareas de azúcar/amargo y de odores (cuerpo de hongo) como banco de pruebas de codificación específica de circuito.
- Visión bioinspirada: emplear la tarea de paralaje y la comparación con el gemelo de grado preservado para estudiar qué aporta la estructura del lóbulo óptico frente a un cableado aleatorio.
- Docencia y divulgación: ilustrar con un caso real y reproducible las diferencias entre una SNN con conectoma biológico y una pila densa convencional, incluidos los bugs de generación detectados y corregidos (CE de test de 4,44 a 3,18 y de 4,16 a 2,80).
- Reproducibilidad de artefactos: verificar la congelación de sinapsis durante 30 días simulados (CE de lenguaje 2,7627 bit-idéntica) como control de estabilidad en entrenamientos largos.

## Benchmarks y rendimiento

El autor publica el "curiosity benchmark" sobre la red (ARC / PIQA / ArithMark / WikiText-2), pero no se incluyen los valores numéricos en la información disponible.

| Medición | Resultado |
|---|---|
| CE entrenada frente a sinapsis barajadas (paso 1.000) | 5,07 frente a 16,3 |
| CE entrenada frente a `rec_scale=0` (paso 1.000) | 5,07 frente a 33,7 |
| CE entrenada frente a sinapsis barajadas (paso 2.855) | 5,00 frente a 26,96 |
| CE entrenada frente a signos aleatorios (paso 2.855) | 5,00 frente a 21,82 |
| CE con cerebro correcto frente a cerebro ajeno (pasos 14.520-14.580) | 3,16-3,50 frente a 10,20-11,66 |
| Tarea de odores, congelado 2948 | ninguno 0,47; backprop 0,71; DAN real → MBON 0,67; recompensa global 0,64 |
| Paralaje, mosca frente a gemelo reconfigurado | 0,42 frente a ≤0,35 (píxeles) y 0,31 (sin movimiento) |
| CE de validación con ocho tipos de neurotransmisor (paso 14.580) | 3,03 → 2,86 |
| Coste de Dale | +0,22 nats (paso 2.948); +1,70 (paso 3.440) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repo ocupa 3,2 GB, pero no se detalla la huella en memoria ni la cuantización.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; la librería declarada es PyTorch y no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| MaleCNS-SpikeWhale-Anatomy-LM | no disponible (decodificador 32,7M) | no disponible | SNN con conectoma de *Drosophila* | Apache 2.0 |
| SpikeWhale-SNN-216M (modelo base) | 216M | no disponible | SNN densa (pila 4x1488) | no disponible |
| Transformers densos de ~200M | ~200M | variable | Transformer convencional | variable |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El propio autor lo declara "Research artifact. Undertrained. Not a usable language model": solo produce fragmentos de inglés, no texto fluido.
- Riesgo alto de alucinación y de generación incoherente; no apto para producción.
- Solo soporta inglés y no hay datos sobre longitud de contexto efectiva.
- Sesgos conocidos: no documentados.
- La licencia Apache 2.0 permite uso comercial, pero el estado de entrenamiento hace inviable ese uso en la práctica.
- El decodificador depende por completo del estado cerebral: sin señal del cerebro no hay texto, y con el estado de otra secuencia la CE se dispara (~7 nats).
- Las ablaciones de `W` también silencian la red unas 7 veces, por lo que parte del daño medido puede atribuirse a la ausencia de actividad y no solo a la corrupción sináptica.
- El proyecto está detenido ("done for now"); no se garantiza mantenimiento ni actualizaciones.
- El fichero Feather exportado está congelado en el paso 14.580 y no refleja entrenamiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quazim0t0/MaleCNS-SpikeWhale-Anatomy-LM
- Modelo base: https://huggingface.co/Quazim0t0/SpikeWhale-SNN-216M
- Conectoma entrenado exportado: https://huggingface.co/Quazim0t0/MaleCNS-SpikeWhale-Anatomy-LM/blob/main/exports/connectome-weights-male-cns-v1.0-fly14580.feather
- Conectoma de referencia Janelia/Google MaleCNS v1.0: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponible en la información proporcionada
