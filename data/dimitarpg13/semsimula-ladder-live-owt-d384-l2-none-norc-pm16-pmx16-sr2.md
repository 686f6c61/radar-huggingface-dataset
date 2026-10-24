# dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2

## Resumen

semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2 es un modelo de lenguaje de investigación desarrollado por dimitarpg13 dentro de la serie Semantic Simulation (generación 3). No es un transformer: se trata de un modelo de lenguaje conservativo, sin atención, formulado como un sistema de mecánica lagrangiana en el que una potencial escalar V_θ define la dinámica y las activaciones evolucionan mediante un integrador BAOAB, con modos rígidos integrados como osciladores amortiguados forzados. La variante concreta combina 16 pozos de modo Poisson (PMX-K16) con dinámica de segundo orden (velocidad e inercia propagadas capa a capa), sobre una arquitectura de 2 capas y dimensión oculta 384.

El modelo resuelve una pregunta experimental preinscrita: si el núcleo conservativo de Semantic Simulation necesita dinámica de segundo orden o si un gemelo de primer orden entrenado de forma idéntica rinde igual. El resultado declarado es que el gemelo de primer orden (FO-b-PMX-K16, perplejidad 53,73) supera a este modelo (54,24), y que 16 pozos igualan a los 64 pozos de PMX (54,63) con el mismo presupuesto de tokens.

Es relevante ahora como artefacto de reproducibilidad y como evidencia empírica de un estudio por pares con control estricto de variables (mismos datos, mismo horario, misma semilla, lotes de entrenamiento y evaluación compartidos). No es un modelo para producción: es un checkpoint de investigación de 0,3 GB entrenado con 532,5 millones de tokens de OpenWebText y evaluado únicamente con perplejidad de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No transformer, sin atención (attention-free); modelo de lenguaje conservativo de tipo energy-based con potencial escalar V_θ, dinámica lagrangiana de segundo orden, integrador BAOAB y 16 pozos de modo Poisson (PMX-K16) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (bloque de entrenamiento y evaluación); no se documenta una ventana superior |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Checkpoint de PyTorch (library_name: pytorch); no se documentan safetensors, GGUF ni otros formatos |

## Arquitectura y entrenamiento

La arquitectura abandona el transformer y la atención. Cada capa aplica un paso de flujo conservativo derivado de una potencial escalar V_θ de tipo gaussiano anisotrópico, con 16 pozos de modo Poisson que actúan como registros de modo. En esta variante de segundo orden, los pozos y los modos rígidos de V_θ se integran exactamente como un muelle amortiguado, y la velocidad se transfiere de capa a capa; el muestreo por capa sigue un flujo convergente con integrador BAOAB. El modelo tiene 2 capas y anchura 384 (d384-l2), y el autor etiqueta la inferencia como de memoria constante, es decir, sin crecimiento de memoria con la longitud de secuencia al no existir mecanismo de atención. La formulación se apoya en geometría de Riemann, métrica de Jacobi y geodésicas, y se enmarca en un espacio de Fock según los tags del repositorio.

El entrenamiento usa OpenWebText (Skylion007/openwebtext) con exactamente 532.480.000 tokens, correspondientes a 32.500 pasos con lote de 32 y bloque de 512, con arranque desde el paso 0 y semilla 0, idéntico al de su gemelo de primer orden para permitir una comparación emparejada. No se documentan RLHF, DPO ni ajuste por instrucciones: es un modelo base de predicción del siguiente token. El estudio está preinscrito con dos hipótesis declaradas: MS2b (los brazos K=16 quedan entre sus homólogos K=0 y K=64), con un 65% de confianza, resultó MISS (54,24 frente a 54,63 de PMX), y MS2e (el gemelo de primer orden dentro de ±2%, emparejado por paso), con un 55%, resultó HIT con −0,87%. El autor reporta 0 activaciones del watchdog, 0 capturas de picos, monitor de fuga SCAF limpio en las 7 auditorías y un fallo de firma en el monitor ω·Δt en tiempo de entrenamiento, corregido el 2026-10-23 y verificado a posteriori en CPU desde el checkpoint.

## Capacidades

- Generación de texto autorregresiva en inglés: modelo base de predicción del siguiente token, sin ajuste por instrucciones ni plantilla de chat documentada.
- Modelado de lenguaje a nivel de token con perplejidad de validación de 54,24 sobre OpenWebText en bloques de 512.
- Inferencia sin atención y con memoria constante respecto a la longitud de secuencia, según la declaración del autor.
- Estudio de ablación de mecanismos: la ficha funciona como artefacto de reproducibilidad de un experimento preinscrito (segundo orden frente a primer orden, 16 frente a 64 pozos).
- Capacidades multilingües: no disponibles; solo se declara inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible; no hay evidencias ni ajuste específico.
- Vision, audio, thinking mode: no disponible.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite repetir la evaluación de perplejidad a bloque 512 bajo el mismo horario y semilla, y verificar la comparación emparejada con FO-b-PMX-K16 con una correlación paso a paso declarada de 0,999.
- Estudio de arquitecturas sin atención: sirve como referencia para medir si la memoria de inferencia se mantiene constante al aumentar la longitud de entrada, en contraste con un transformer equivalente.
- Ablación de dinámica de segundo orden: al existir el gemelo de primer orden con idénticos datos y horario, se puede aislar el efecto de la inercia y la velocidad en el rendimiento del modelo.
- Investigación en modelos basados en energía: la formulación con potencial escalar V_θ y muestreo por flujo convergente es un banco de pruebas para métodos de inferencia tipo MCMC o flujos amortiguados.
- Benchmark de simulación física aplicada al lenguaje: útil para grupos que trabajan en mecánica lagrangiana, integradores simplécticos (BAOAB) o geometría de Riemann aplicada a modelos generativos.
- Docencia y divulgación técnica: modelo pequeño (repositorio de 0,3 GB) que cabe en un equipo de sobremesa y permite ilustrar paso a paso cómo se entrena y evalúa un modelo de lenguaje no transformer.
- Auditoría de estudios preinscritos: la ficha documenta hipótesis, umbrales y resultados (MISS/HIT), lo que permite evaluar prácticas de preinscripción en investigación de IA.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| OpenWebText (split validation, bloque 512) | Perplejidad asentada (media de las tres últimas evaluaciones de 500 pasos) | 54,24 |
| OpenWebText (bloque 512) | Mejor perplejidad registrada | 52,28 (paso 31.000) |
| OpenWebText (bloque 512) | Evaluaciones individuales de la media asentada | 54,17 / 54,37 / 54,17 |

Comparación por pares dentro de la serie (mismos datos, horario y semilla):

| Par | Corpus, tokens | Segundo orden | Primer orden | Primer orden frente a segundo |
|---|---:|---:|---:|---:|
| OpenWebText | 532,5 M | SR2 58,32 | FO-b-OWT 61,16 | +4,9% |
| TinyStories | 315 M | SO-TS 5,16 | FO-TS 5,13 | −0,6% |
| OpenWebText, 64 pozos Poisson | 532,5 M | PMX 54,63 | FO-b-PMX 54,02 | −1,1% |
| OpenWebText, 16 pozos Poisson (este modelo) | 532,5 M | PMX-K16 54,24 | FO-b-PMX-K16 53,73 | −0,9% |

Evolución de la perplejidad durante el entrenamiento de este par:

| Paso | Fase | PMX-K16 (segundo orden) | FO-b-PMX-K16 (primer orden) | Diferencia |
|---:|---|---:|---:|---:|
| 500 | warmup | 459,08 | 452,39 | −1,5% |
| 5.000 | constante | 97,17 | 95,27 | −2,0% |
| 10.000 | constante | 74,79 | 74,14 | −0,9% |
| 16.000 | constante | 65,42 | 64,67 | −1,1% |
| 21.000 | constante, fin | 64,69 | 63,72 | −1,5% |
| 25.000 | decaimiento | 60,32 | 59,57 | −1,2% |
| 28.000 | decaimiento | 56,10 | 55,44 | −1,2% |
| 30.000 | decaimiento | 53,98 | 53,52 | −0,9% |
| 32.500 | decaimiento, fin | 54,17 | 53,61 | −1,0% |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas de razonamiento, código o matemáticas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 0,3 GB y la arquitectura es de 2 capas con anchura 384, por lo que el checkpoint y el estado de inferencia son de tamaño reducido.
- GPU recomendadas: no documentadas por el autor. Por tamaño, cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, previsiblemente en cualquier tarjeta con unos pocos GB de VRAM; no se publica la cifra exacta.
- Opciones de despliegue: requiere el código PyTorch del autor (modelo con arquitectura propia). No es compatible de forma nativa con vLLM, TGI, llama.cpp ni Ollama, al no ser un transformer y no publicarse pesos en GGUF.
- Latencia y throughput: no disponibles.
- Nota operativa: el tag constant-memory-inference implica que el coste de memoria no crece con la longitud de secuencia, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de referencias externas comparables publicadas (mismo tamaño, misma tarea y misma familia). Las alternativas más cercanas son los modelos hermanos de la misma escalera experimental, todos del mismo autor y con el mismo presupuesto de 532,5 M de tokens:

| Modelo | Parametros | Contexto | Perplejidad OWT (bloque 512) | Dinamica | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| PMX-K16 (este modelo) | no disponible | 512 | 54,24 | Segundo orden, 16 pozos | CC-BY-4.0 | HuggingFace |
| FO-b-PMX-K16 (gemelo) | no disponible | 512 | 53,73 | Primer orden, 16 pozos | CC-BY-4.0 | HuggingFace |
| PMX (64 pozos) | no disponible | 512 | 54,63 | Segundo orden, 64 pozos | CC-BY-4.0 | HuggingFace |
| FO-b-PMX (64 pozos) | no disponible | 512 | 54,02 | Primer orden, 64 pozos | CC-BY-4.0 | HuggingFace |
| SR2 (sin pozos) | no disponible | 512 | 58,32 | Segundo orden | CC-BY-4.0 | HuggingFace |
| FO-b-OWT (sin pozos) | no disponible | 512 | 61,16 | Primer orden | CC-BY-4.0 | HuggingFace |

Comparación con modelos transformer de tamaño similar: no disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo estrictamente de investigación: no está ajustado por instrucciones, no tiene plantilla de chat ni alineamiento (sin RLHF/DPO), por lo que no debe usarse como asistente conversacional.
- Perplejidad alta en términos absolutos (54,24 sobre OpenWebText en bloques de 512), muy por encima de lo que se espera de transformers modernos del mismo orden de magnitud; el valor es útil para comparaciones internas de la escalera, no como indicador de calidad de producto.
- Solo inglés: no hay soporte multilingüe declarado ni evaluado.
- Contexto limitado a 512 tokens en entrenamiento y evaluación; no se documenta capacidad de extrapolación a secuencias más largas.
- Riesgo de alucinación y de generar contenido factualmente incorrecto: es un modelo base entrenado sobre texto web (OpenWebText), sin filtrado de hechos documentado.
- Sesgos: OpenWebText es una recopilación de enlaces de Reddit, con los sesgos de dominio, idioma y temática que ello implica; el autor no documenta análisis de sesgo.
- Resultado principal desfavorable: la hipótesis preinscrita MS2b resultó MISS y el gemelo de primer orden supera a este modelo en un 0,9%; quien busque el mejor rendimiento de la familia debe mirar FO-b-PMX-K16.
- Métricas no verificadas: la perplejidad figura con `verified: false` en el model-index; el rendimiento no ha sido reproducido por terceros.
- Compatibilidad: al no ser un transformer, no funciona con las herramientas estándar de despliegue (vLLM, TGI, llama.cpp, Ollama); requiere código propio.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero obliga a citar al autor y a indicar cambios; conviene revisar los términos exactos antes de integrarlo en un producto.
- Ficha incompleta: el README proporcionado está truncado y no detalla recuento de parámetros, formato exacto de pesos ni instrucciones de inferencia.
- El autor reporta un fallo de firma en el monitor de diagnóstico ω·Δt durante el entrenamiento (corregido el 2026-10-23), lo que obliga a tratar con cautela cualquier análisis basado en ese monitor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2
- Gemelo de primer orden (FO-b-PMX-K16): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm16-pmx16-sr2-fob
- PMX con 64 pozos (referencia): https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
- SR2, base sin pozos: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2
- FO-b-OWT, gemelo de primer orden de SR2: https://huggingface.co/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-sr2-fob
- Colección primer vs segundo orden: https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-first-vs-second-order-6ad7681596d9a670c268b524
- Colección Gen 3 (cFC, BAOAB, gradientes en vivo): https://huggingface.co/collections/dimitarpg13/semantic-simulation-gen-3-cfc-baoab-live-gradients-6abf371ea3c83f127057020c
- Repositorio de artefactos de reproducibilidad: https://github.com/dimitarpg13/semsimula-paper
- Registro de terceros (free2aitools): https://free2aitools.com/model/dimitarpg13/semsimula-ladder-live-owt-d384-l2-none-norc-pm64-pmx16-sr2
