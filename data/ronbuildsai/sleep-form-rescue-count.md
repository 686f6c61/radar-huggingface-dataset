# RonBuildsAI/sleep-form-rescue-count

## Resumen

"Sleep-form rescue count" no es un modelo de lenguaje utilizable, sino un artefacto de investigación: un repositorio con 80 redes neuronales diminutas (633.074 parámetros cada una) publicadas por RonBuildsAI (Ronald Lee Hampton) para replicar un experimento controlado sobre interpretabilidad. El experimento estudia por qué, en arquitecturas con módulos de razonamiento auxiliares, algunos módulos acaban comportándose como "conmutadores" constantes (switchboards) que no aportan trabajo dependiente del contexto, y si un régimen de entrenamiento alternativo (la "forma sleep") rescatan ese fallo.

La pregunta central es relevante para la comunidad de interpretabilidad y de MoE: cuando se añade un módulo de razonamiento a una red, a veces el modelo aprende a ignorarlo y lo usa como una ganancia fija por característica. El autor entrena pares de redes idénticas (forma plain ST-0 frente a forma sleep S-SLEEP) sobre el dataset TinyStories con vocabulario de 4.096 tokens, y mide con una métrica predefinida ("shuffle cost") si el núcleo de razonamiento se usa realmente posición a posición.

El resultado publicado: sobre 40 semillas nuevas, la forma plain produjo 7 switchboards y la forma sleep solo 1, con 7 rescates frente a 1 perjuicio y un test de signos exacto unilateral de p = 0,0352, que supera el umbral congelado antes del experimento. Los pesos están en formato safetensors/PyTorch y la licencia es CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red diminuta de siguiente palabra con router MoE (48 expertos de dos capas) + núcleo de razonamiento con pesos ternarios enteros |
| Parametros totales | 633.074 por red (595.568 red base enrutada + 12.416 núcleo de razonamiento + 25.090 parte entera) |
| Parametros activos | no disponible (no se especifica el porcentaje activado por token del router) |
| Longitud de contexto | 2 palabras (la red recibe las dos últimas palabras de la historia) |
| Tipos de cuantizacion | Pesos ternarios enteros en la parte entera del núcleo de razonamiento; resto sin cuantizar (no disponible detalle) |
| Idiomas soportados | Ingles (entrenado sobre historias sinteticas en ingles) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

Cada red es un modelo de siguiente palabra entrenado sobre historias sinteticas cortas (dataset roneneldan/TinyStories) con vocabulario de 4.096 tokens y una ventana de entrada de las dos últimas palabras. El bloque principal usa enrutamiento estilo mezcla de expertos: un router asigna cada palabra a uno de 48 expertos, cada uno un pequeño bloque de dos capas, con un término de regularización ("sharing pull") sobre las decisiones del router y una cabeza compartida para la predicción. El núcleo de razonamiento se lee a través de una pequeña parte entera con pesos ternarios que escribe una ganancia sobre la salida de los expertos, inicializada a cero.

El experimento compara dos formas de entrenamiento, ambas con 10.400 pasos por ejecución y una primera etapa de 10.000 pasos: ST-0 (forma plain, entrenamiento estándar) y S-SLEEP (forma sleep), en la que durante la primera etapa los pesos de escritura de la parte entera siguen actualizándose sobre la pérdida del lenguaje a 1/200 de la tasa activa, con el núcleo de razonamiento conectado pero congelado. La hipótesis es que este "entrenamiento en reposo" evita que el núcleo degenerre en un conmutador constante. Cada ejecución se evalúa con la métrica "shuffle cost": diferencia media de pérdida held-out (en nats) al barajar la salida del núcleo entre posiciones sobre 256 ventanas held-out (16.384 posiciones). Un coste inferior a 0,025 nats clasifica el núcleo como switchboard; por encima, como context worker. Los criterios y predicciones se congelaron (con hash sha256 publicado) antes de entrenar las redes de confirmación.

## Capacidades

No es un modelo de lenguaje utilizable; sus capacidades son de instrumento de investigación:

- Modelado de siguiente palabra trivial sobre historias sinteticas cortas en ingles, con perdida held-out de aproximadamente 4,6 nats por token (calidad de texto muy baja).
- Reproduccion del experimento: el repositorio incluye el codigo para re-medir las 80 redes y la metrica de shuffle cost.
- Material de estudio para interpretabilidad: 40 pares de redes (plain/sleep) sobre las mismas semillas, con tabla completa de resultados por semilla en `results/measured_table.csv`.
- Ejemplo documentado de metodologia preregistrada: barras congeladas, predicciones selladas antes de la ejecucion y verificacion por semilla.
- No soporta tool calling, agentes, razonamiento multi-paso util, vision, audio ni modos de thinking.
- No es multilingue: solo ingles.

## Casos de uso

- Investigacion en interpretabilidad: estudiar cuando un modulo auxiliar (nucleo de razonamiento) degenera en una ganancia constante y como detectarlo mediante la metrica de shuffle cost, ideal como banco de pruebas pequeno y barato.
- Reproduccion de experimentos preregistrados: el codigo incluido permite re-medir las 80 redes y verificar los umbrales y el hash del fichero congelado, util para ensenar buenas practicas de ciencia reproducible.
- Docencia sobre MoE diminutos: el diseno (router, 48 expertos de dos capas, sharing pull) sirve como ejemplo minimalista y ejecutable en CPU para explicar enrutamiento de expertos.
- Benchmark de metodologia estadistica: el diseno de 40 semillas pareadas con test de signos exacto unilateral (p = 0,0352) es un caso de estudio sobre potencia estadistica en experimentos con redes pequenas.
- Punto de partida para ablations: se puede reentrenar con otras tasas de "sleep", otros numeros de expertos o vocabularios distintos gracias al codigo incluido.
- Estudio de pesos ternarios: la parte entera con pesos ternarios conectada al nucleo de razonamiento permite investigar representaciones discretas de bajo coste en redes minimas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ni procede: no es un modelo de lenguaje de uso general. Los unicos numeros publicados son del propio experimento:

| Medida | Valor |
|---|---|
| Perdida held-out por red | ~4,6 nats por token |
| Switchboards forma plain (ST-0) | 7 de 40 semillas |
| Switchboards forma sleep (S-SLEEP) | 1 de 40 semillas (semilla 883) |
| Rescates / perjuicios | 7 / 1 |
| Semillas discordantes | 8 |
| Test de signos exacto unilateral | p = 9/256 = 0,0352 |
| Umbral de switchboard (shuffle cost) | < 0,025 nats |

El propio autor advierte que el margen es estrecho y detalla en "What this does not show" que el resultado no debe sobreinterpretarse.

## Requisitos de hardware

- VRAM: practicamente nula; cada red ocupa 633.074 parametros (~0,2 GB el repositorio completo con las 80 redes y codigo). Cualquier CPU o GPU moderna es suficiente; no se necesita GPU dedicada.
- GPU recomendadas: ninguna en concreto; el experimento esta pensado para ejecutarse en hardware de consumo. Para reentrenar las 10.400 pasos por ejecucion bastaria una GPU de gama media (por ejemplo una RTX 3060 o superior), aunque no se publican tiempos de entrenamiento.
- Consumer GPU: sobradamente; incluso la inferencia y re-medicion funcionan en CPU.
- Despliegue: no aplica como modelo servible; el uso previsto es clonar el repositorio y ejecutar el codigo de medicion con PyTorch. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dado el tamano minimo (entrada de dos palabras, 633k parametros), la inferencia es despreciable en cualquier hardware moderno.

## Comparativa con modelos similares

No hay modelos directamente comparables, porque se trata de un artefacto de investigacion y no de un LLM. Como referencia orientativa frente a otros modelos entrenados con TinyStories:

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| RonBuildsAI/sleep-form-rescue-count | 633.074 por red (x80 redes) | 2 palabras | Instrumento de investigacion en interpretabilidad | CC-BY-4.0 |
| TinyStories-33M (Ronen Eldan, Microsoft) | 33 M | no disponible | LLM experimental que genera historias coherentes | no disponible |
| TinyStories-1M (Ronen Eldan, Microsoft) | 1 M | no disponible | LLM experimental minimo del mismo dataset | no disponible |

A diferencia de los modelos TinyStories de Microsoft, que generan texto razonable a escala minima, estas redes tienen una perdida de ~4,6 nats/token y no generan texto util: su valor esta en el experimento de interpretabilidad, no en la calidad del lenguaje.

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable: con ~4,6 nats por token de perdida held-out, la salida es esencialmente incoherente; usarlo para generacion no tiene sentido.
- Resultado de margen estrecho: el propio autor advierte que la diferencia (7 frente a 1 switchboards en 40 semillas) pasa el umbral preregistrado pero con poca holgura, y que con menos de 5 semillas discordantes el resultado no se consideraria confirmado.
- Alcance muy limitado del experimento: redes diminutas, vocabulario de 4.096, contexto de dos palabras y dataset sintetico (TinyStories); no hay evidencia de que el regimen "sleep" escale a modelos grandes.
- Riesgo de sobreinterpretacion: la metrica de shuffle cost clasifica binariamente (switchboard/context worker) con un umbral de 0,025 nats; valores cercanos al umbral son sensibles a ruido.
- Sesgos: al entrenarse solo con historias sinteticas en ingles, hereda los sesgos de TinyStories y no es transferible a otros dominios o idiomas.
- Licencia CC-BY-4.0: permite uso comercial con atribucion al autor, pero al no ser un modelo utilizable la cuestion es practicamente irrelevante.
- Baja traccion publica (20 descargas y 1 like en el momento de la ficha) y sin revision por pares documentada: tratar los resultados como preliminares hasta confirmacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RonBuildsAI/sleep-form-rescue-count
- Dataset de entrenamiento (TinyStories): https://huggingface.co/datasets/roneneldan/TinyStories
- Paper de TinyStories (arXiv:2305.07759, referenciado en las tags del repositorio): https://arxiv.org/abs/2305.07759
- Tabla completa de resultados por semilla: `results/measured_table.csv` (dentro del repositorio)
- Barras congeladas antes de la ejecucion: `results/BARS_frozen-before-the-run.txt` (dentro del repositorio)
