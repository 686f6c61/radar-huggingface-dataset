# dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob

## Resumen

semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob (abreviado FO-b-TS) es un modelo de lenguaje experimental desarrollado por dimitarpg13 dentro de la colección "Semantic Simulation", generación 3. Se trata de un modelo no transformer y sin atención, basado en mecánica lagrangiana y potenciales escalares conservativos, entrenado como un flujo de gradiente de primer orden puro (sin velocidad ni inercia) sobre el corpus TinyStories. Su propósito es científico más que productivo: responder a la pregunta de si el núcleo conservativo de esta arquitectura necesita dinámicas de segundo orden, comparándolo paso a paso con su gemelo de segundo orden (SO-TS) bajo presupuesto de tokens idéntico.

El veredicto del experimento es que el segundo orden gana sin pozos de potencial también en TinyStories: 5,28 de perplejidad frente a 5,16 (+2,3 %), aunque la brecha se cierra cuando se añaden pozos de modo Poisson. Frente a un GPT-2 emparejado en tokens y planificador de aprendizaje, el modelo queda un 18 % por detrás. Es relevante para investigadores interesados en alternativas a la atención, modelos basados en física (energy-based models, geodésicas riemannianas, métrica de Jacobi) y estudios pre-registrados con ablation de mecanismos. Entrena con 315.392.000 tokens exactos, evalúa en bloques de 512 y se distribuye bajo licencia CC-BY-4.0 con pesos en PyTorch (repo de 0,3 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformer, sin atención; modelo conservativo basado en potencial escalar y mecánica lagrangiana (familia "Semantic Simulation", variante SR2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (bloque de evaluación y entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (repo de 0,3 GB; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura pertenece a la familia "Semantic Simulation": un modelo de lenguaje conservativo, attention-free y no transformer, que modela la generación de texto mediante dinámicas de tipo mecánico (potencial escalar anisotrópico gaussiano, espacio de Fock, geometría riemanniana con geodésicas y métrica de Jacobi, integradores tipo BAOAB y CFC). Esta variante concreta (FO-b, "true first-order gradient flow") elimina por completo la velocidad y la inercia: los modos rígidos se relajan exactamente mediante flujo de gradiente de primer orden, tanto entre capas como dentro de cada capa. Se diferencia de la variante FO-a (FO-TS), que solo restablece la velocidad al inicio de cada capa, conservando la rotación de los modos rígidos dentro de la capa.

El entrenamiento usó exactamente 315.392.000 tokens de TinyStories (19.250 pasos con batch efectivo de 32 × 512) en una sola sesión, con el planificador WSD de la "ladder study": 16.250 pasos de descenso-warmup-estable y 3.000 pasos adicionales al learning rate mínimo, desde el paso 0 con semilla 0. No se menciona RLHF ni DPO; se trata de un modelo de investigación pre-entrenado únicamente. El protocolo experimental fue pre-registrado (§5.13, TS-K2), con predicciones confirmadas antes del entrenamiento, y la ejecución se monitorizó sin incidencias (0 activaciones del watchdog, monitor de fugas SCAF limpio en las 4 auditorías).

## Capacidades

- Generacion de texto en ingles a nivel de cuentos cortos sencillos (TinyStories), con perplejidad de validación de 5,28 en bloque de 512.
- Modelado de secuencias mediante dinámicas conservativas de primer orden, sin mecanismo de atención.
- Inferencia con memoria constante (constant-memory-inference), según las etiquetas del repositorio.
- Utilidad como brazo experimental en estudios de ablation de mecanismos (first vs. second order, pozos de modo Poisson).
- No hay evidencia de capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio en la información disponible.
- No hay datos sobre capacidades multilingues: solo se declara inglés.

## Casos de uso

- Investigacion en arquitecturas alternativas al transformer: sirve como línea base de primer orden para comparar dinámicas conservativas con y sin inercia, con presupuesto de tokens emparejado.
- Reproduccion de estudios pre-registrados: el protocolo TS-K2, las llamadas y los resultados están documentados, lo que permite replicar el experimento o extenderlo a otros corpus.
- Ablation de mecanismos fisicos: permite medir cuánto aporta cada componente (pozos de modo Poisson, segundo orden) en perplejidad logarítmica sobre corpus controlados.
- Generacion de historias cortas en ingles: al estar entrenado en TinyStories, puede generar narrativas simples infantiles, aunque con calidad inferior a un GPT-2 emparejado (+18 % de perplejidad).
- Docencia y divulgacion de modelos energy-based: su tamaño reducido (repo de 0,3 GB) y su enfoque físico lo hacen adecuado como material didáctico para explicar modelos no transformer.
- Benchmarking de eficiencia de inferencia: la etiqueta de memoria constante en inferencia lo hace candidato para estudiar costes de inferencia frente a transformers con atención creciente.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en el model-index:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Generacion de texto | TinyStories (split de validacion, primeros 2M tokens) | Perplejidad de validacion (bloque 512, asentada, media de las ultimas 3 evals de 500 pasos) | 5,2767 |

Contexto adicional del propio autor (comparativas entre pares de la colección):

| Par | Corpus, tokens | Segundo orden | Primer orden | Diferencia |
|---|---|---:|---:|---:|
| OpenWebText, sin pozos | 532,5M | SR2: 58,32 | FO-b-OWT: 61,16 | +4,9 % |
| TinyStories, FO-a, sin pozos | 315M | SO-TS: 5,16 | FO-TS: 5,13 | −0,6 % |
| TinyStories, FO-b, sin pozos | 315M | SO-TS: 5,16 | FO-b-TS (este modelo): 5,28 | +2,3 % |
| TinyStories, 2 pozos Poisson | 315M | PM2-TS: 4,99 | FO-b-PM2-TS: 4,96 | −0,5 % |
| Codigo Python, FO-b, sin pozos | 315M | SO-CODE: 6,00 | FO-b-CODE: 6,55 | +9,2 % |

Frente a un GPT-2 emparejado en los mismos tokens y planificador, que se asienta en 4,47, este modelo queda un 18,0 % por detrás. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo pesa 0,3 GB, lo que sugiere un modelo pequeño ejecutable en hardware de consumo, pero no se declara el numero de parametros.
- GPU recomendadas: no disponible. Dado el tamano del repo, una GPU de consumo (por ejemplo, RTX 3060/4090) o incluso CPU deberia bastar, pero es una estimacion no confirmada por el autor.
- Cabe en consumer GPU: muy probablemente si (0,3 GB de pesos), aunque sin cifras oficiales de VRAM.
- Opciones de despliegue: PyTorch nativo (library_name: pytorch). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; al ser una arquitectura custom no transformer, lo mas probable es que requiera el codigo del autor.
- Latencia y throughput estimados: no disponible. La etiqueta "constant-memory-inference" sugiere coste de memoria constante por token, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Corpus / tokens | Perplejidad (TinyStories, bloque 512) | Licencia |
|---|---|---|---:|---|
| FO-b-TS (este modelo) | Conservativo, primer orden puro, sin atencion | TinyStories, 315M | 5,28 | CC-BY-4.0 |
| SO-TS | Conservativo, segundo orden, sin atencion | TinyStories, 315M | 5,16 | CC-BY-4.0 (segun coleccion) |
| FO-TS (FO-a) | Conservativo, primer orden entre capas | TinyStories, 315M | 5,13 | CC-BY-4.0 (segun coleccion) |
| GPT-2 emparejado (ladder-ts-d384-gpt2-matched) | Transformer | TinyStories, 315M | 4,47 | no disponible |

La comparacion mas relevante es interna a la coleccion: el segundo orden supera al primero en +2,3 % sin pozos, pero con dos pozos de modo Poisson el primer orden incluso gana (−0,5 %). Frente al transformer emparejado, este modelo queda un 18 % por detrás en perplejidad.

## Limitaciones y advertencias

- Es un modelo de investigacion experimental, no un modelo de produccion: su calidad de generacion esta un 18 % por detrás de un GPT-2 emparejado en perplejidad.
- Entrenado unicamente en TinyStories (cuentos cortos en ingles): esperable mal rendimiento fuera de ese dominio y sin soporte de otros idiomas.
- Los resultados del model-index estan marcados como "verified: false": son declaraciones del autor, no verificaciones independientes.
- La evaluacion en TinyStories tiene jitter de ±0,06; el autor recomienda leer la media de tres evaluaciones, no valores puntuales.
- La prediccion pre-registrada TS1 resulto MISS (se esperaba ±2 % y el resultado fue +2,3 %), lo que indica sensibilidad del resultado al criterio exacto.
- No hay informacion sobre sesgos, riesgo de alucinacion ni salvaguardas de seguridad: no disponible.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero al tratarse de un artefacto de investigacion sin soporte, su uso en produccion no es recomendable.
- No hay evidencia de tool calling, agentes, vision ni capacidades multilingues.
- La documentacion de la arquitectura es limitada: numero de parametros, formato exacto de pesos y codigo de inferencia no se detallan en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fob
- Modelo gemelo de segundo orden (SO-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2
- Variante FO-a (FO-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-sr2-fo
- Par con 2 pozos Poisson (PM2-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2
- Par con 2 pozos Poisson en primer orden (FO-b-PM2-TS): https://huggingface.co/dimitarpg13/semsimula-ladder-live-ts-d384-l2-none-norc-pm2-pmx16-sr2-fob
- Coleccion first-vs-second-order (Gen 3): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- GPT-2 emparejado: https://huggingface.co/dimitarpg13/semsimula-ladder-ts-d384-gpt2-matched
- Dataset de entrenamiento: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper, blog o demo: no disponible
