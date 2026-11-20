# dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2-fob

## Resumen

El modelo `semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2-fob` es un modelo de lenguaje de investigación desarrollado por el autor de Hugging Face `dimitarpg13`, perteneciente a la familia "Semantic Simulation" (semsimula). Se trata de un modelo de lenguaje conservativo (energy-based, con potencial escalar) que abandona la arquitectura transformer y el mecanismo de atención en favor de una dinámica de flujo de gradiente de primer orden sobre un potencial anisótropo gaussiano con dos pozos de modo Poisson. El modelo se entrena sobre el corpus TinyStories y está diseñado explícitamente como experimento de ablación de mecanismo: comparar si la dinámica de segundo orden (con velocidad e inercia) es necesaria frente a un flujo de primer orden entrenado de forma equivalente.

La relevancia de este modelo es fundamentalmente investigadora: forma parte de un estudio pre-registrado ("ladder study") que aísla variables de arquitectura y dinámica de entrenamiento con presupuestos de tokens idénticos (315.392.000 tokens). El resultado declarado es que este modelo de primer orden iguala a su gemelo de segundo orden (perplejidad 4,96 frente a 4,99 en TinyStories), lo que sugiere que el núcleo conservativo no requiere dinámica de segundo orden para alcanzar rendimiento comparable en esta escala.

El modelo tiene 384 dimensiones de estado, 2 capas, no usa atención, y su inferencia tiene memoria constante. Está disponible en formato PyTorch con licencia CC-BY-4.0 y solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje conservativo (energy-based) con potencial escalar anisótropo gaussiano, dinámica de flujo de gradiente de primer orden, sin transformer ni atención |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con bloques de 512 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (pytorch); no se indica safetensors ni GGUF |
| Dimensión de estado | 384 |
| Capas | 2 |
| Pozos de modo Poisson | 2 (PM2) |
| Presupuesto de entrenamiento | 315.392.000 tokens (19.250 pasos × 32 × 512) |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un modelo de lenguaje conservativo basado en un potencial escalar anisótropo gaussiano con dos pozos de modo Poisson (PM2). No es un transformer ni usa atención: la inferencia se describe como de memoria constante ("constant-memory-inference"). El modelo se entrena como un flujo de gradiente de primer orden "verdadero" (FO-b), donde el muelle congelado de los pozos y los modos rígidos se relajan exactamente, sin velocidad en ningún punto. Emplea integradores tipo BAOAB y mecánica lagrangiana, con geometría riemanniana (geodésicas riemannianas, métrica de Jacobi) y espacio de Fock. El modelo se describe como "fully-conservative" y "attention-free".

El entrenamiento se realizó en una única sesión sobre exactamente 315.392.000 tokens (19.250 pasos × 32 × 512), con el schedule WSD de la escalera durante 16.250 pasos y 3.000 pasos adicionales al learning rate mínimo. Ambos gemelos (primer y segundo orden) parten del paso 0 con semilla 0, de modo que sus evaluaciones están emparejadas paso a paso. El dataset es TinyStories (roneneldan/TinyStories). El modelo se pre-registró: la predicción TS2 (que FO-b-PM2-TS estaría dentro de ±2% de PM2-TS) se confirmó antes de entrenar el primer brazo, con un acierto del 70% y un resultado de −0,5%.

## Capacidades

- Generación de texto en inglés sobre dominios simples y narrativos (entrenado con TinyStories).
- Modelo de lenguaje con dinámica conservativa de primer orden, sin atención.
- Inferencia con memoria constante (no escala con la longitud de contexto de forma cuadrática).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no (solo inglés).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Modo de evaluación: perplejidad sobre validación de TinyStories a bloque 512.

## Casos de uso

- Investigación en arquitecturas alternativas al transformer: el modelo sirve como banco de pruebas controlado para estudiar si la dinámica de segundo orden aporta ventajas frente a la de primer orden en modelos conservativos, con presupuesto de tokens y schedule idénticos.
- Ablación de mecanismos pre-registrada: útil para grupos que replican estudios de ablación con hipótesis fijadas de antemano y comparaciones emparejadas paso a paso.
- Estudio de modelos energy-based y flujos de gradiente: permite analizar el comportamiento de un potencial escalar anisótropo con pozos de modo Poisson en generación de texto a pequeña escala.
- Generación de texto narrativo simple en inglés: dado su entrenamiento en TinyStories, puede generar cuentos cortos y texto infantil sencillo, aunque con calidad limitada por el corpus.
- Benchmark de eficiencia de inferencia sin atención: su memoria constante lo hace adecuado para medir costes de inferencia en secuencias largas frente a transformers de tamaño comparable.
- Docencia y divulgación: ejemplo didáctico de modelo de lenguaje no-transformer con mecánica lagrangiana y geometría riemanniana, reproducible con 0,3 GB de pesos.
- Validación de pipelines de evaluación de perplejidad: útil como modelo de referencia para comprobar la corrección de harness de evaluación a bloque 512 sobre TinyStories.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| text-generation | TinyStories (validation) | Perplejidad (bloque 512, media de las tres últimas evaluaciones de 500 pasos) | 4,963 |

Comparativa interna de la familia (perplejidad, menor es mejor):

| Par | Corpus, tokens | Segundo orden | Primer orden | Primer orden vs segundo |
|---|---:|---:|---:|---:|
| OpenWebText, 2 pozos Poisson | 532,5M | PM2-PMX16 54,71 | FO-b-PM2-PMX16 53,81 | −1,6% |
| TinyStories, sin pozos (FO-a) | 315M | SO-TS 5,16 | FO-TS 5,13 | −0,6% |
| TinyStories, primer orden verdadero (FO-b), sin pozos | 315M | SO-TS 5,16 | FO-b-TS 5,28 | +2,3% |
| TinyStories, 2 pozos Poisson | 315M | PM2-TS 4,99 | FO-b-PM2-TS 4,96 | −0,5% |
| Código Python, FO-b sin pozos | 315M | SO-CODE 6,00 | FO-b-CODE 6,55 | +9,2% |
| Código Python, 2 pozos Poisson | 315M | PM2-CODE 5,71 | FO-b-PM2-CODE 5,62 | −1,6% |

Frente a un transformer GPT-2 emparejado en tokens y schedule, el GPT-2 emparejado se estabiliza en 4,47; este modelo queda un +11,0% por detrás (SO-TS, +15,4%). Evolución del par a lo largo del entrenamiento: paso 500 (warmup) 18,86 frente a 18,99; paso 5.000 6,26 frente a 6,33; paso 10.000 5,64 frente a 5,71; paso 13.000 5,40 frente a 5,42. El mejor valor de este modelo fue 4,80 en el paso 16.500; la media de las evaluaciones en los pasos 18.000, 18.500 y 19.000 fue 5,04, 4,92 y 4,93. La jitter de evaluación en TinyStories es de aproximadamente ±0,06.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,3 GB, por lo que los pesos en precisión original caben holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM debería ser suficiente (no confirmado por el autor).
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repositorio, aunque no se documenta.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la librería declarada es PyTorch.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Perplejidad TinyStories (bloque 512) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (FO-b-PM2-TS) | Conservativo, primer orden, 384 dim, 2 capas | no disponible (entrenado a 512) | 4,96 | CC-BY-4.0 | Hugging Face, PyTorch |
| PM2-TS (gemelo de segundo orden) | Conservativo, segundo orden, 384 dim, 2 capas | no disponible (entrenado a 512) | 4,99 | CC-BY-4.0 | Hugging Face, PyTorch |
| SO-TS (sin pozos, segundo orden) | Conservativo, segundo orden, 384 dim, 2 capas | no disponible (entrenado a 512) | 5,16 | CC-BY-4.0 | Hugging Face, PyTorch |
| GPT-2 emparejado (semsimula-ladder-ts-d384-gpt2-matched) | Transformer | no disponible | 4,47 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigación a muy pequeña escala (384 dimensiones, 2 capas, 315M tokens): no es apto para producción ni para tareas generales de lenguaje.
- Entrenado exclusivamente con TinyStories, un corpus de cuentos infantiles simples: el vocabulario y la complejidad sintáctica están muy acotados.
- Solo soporta inglés.
- Riesgo de alucinación y degeneración incoherente fuera del dominio narrativo simple; no se documentan evaluaciones de robustez o seguridad.
- No se dispone de datos sobre sesgos; al entrenar con TinyStories, puede reflejar los sesgos del corpus.
- Sin soporte documentado de tool calling, agentes, visión, audio ni modos de razonamiento.
- Longitud de contexto no documentada más allá de los bloques de 512 tokens usados en entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero el modelo no está pensado ni validado para ello.
- Los resultados de perplejidad están marcados como no verificados (`verified: false`) y tienen jitter de ±0,06; deben interpretarse con cautela.
- El resultado principal (−0,5% frente al gemelo de segundo orden) está dentro del margen de predicción pre-registrada (±2%), por lo que no demuestra superioridad, solo equivalencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Gemelo de segundo orden (PM2-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2
- Colección "first-vs-second-order": https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- GPT-2 emparejado: https://huggingface.co/dimitarpg13/semsimula-ladder-ts-d384-gpt2-matched
- Notas del estudio pre-registrado (First_vs_Second_Order_Series.md): https://github.com/dimitarpg13/semsimula-paper/blob/main/companion_notes/depth_ladder/First_vs_Second_Order_Series.md
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
