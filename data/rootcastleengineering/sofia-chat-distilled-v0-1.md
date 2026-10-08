# rootcastleengineering/sofia-chat-distilled-v0.1

## Resumen

Sofia Chat Distilled v0.1 es un asistente técnico experimental en inglés desarrollado por Rootcastle Engineering & Innovation mediante poda y destilación de conocimiento a partir de Qwen2.5-0.5B-Instruct. El modelo no se entrena desde cero: conserva los embeddings y el tokenizador del profesor y sustituye el cuerpo por un estudiante de 18 capas inicializado con bloques seleccionados del profesor. Sobre esa base se aplica un adaptador LoRA de rango 16 que se fusiona posteriormente en pesos estándar de Transformers.

El problema que aborda es acotado: explorar si un objetivo de alineación de kernels (un regularizador clásico inspirado en un manuscrito sobre kernels verificables) mejora la destilación de distribuciones del profesor en un corpus técnico pequeño. El resultado es un checkpoint de 404.558.464 parámetros (un 18,11 % menos que el profesor) que reduce la perplejidad de referencia en el conjunto de validación de 6.635,52 a 67,96 y en el de test de 10.327,21 a 84,14.

Es relevante ahora como ejemplo reproducible y honesto de destilación, no como herramienta de producción: el propio autor advierte que el modelo no constituye una base sólida de competencia lingüística o de ingeniería y que las respuestas contienen errores factuales. La ventana de entrenamiento fue corta y no hay benchmarks amplios publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), estudiante de 18 capas por poda y destilación del profesor |
| Parametros totales | 404.558.464 (profesor: 494.032.768; 18,11 % menos) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenado con secuencias de 192 tokens; la configuracion posicional heredada no garantiza contexto largo) |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en FP16 safetensors; cabe cuantizacion a GGUF o int8/int4 por herramientas externas, no verificada por el autor) |
| Idiomas soportados | en (ingles unicamente) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (fusionado, FP16, archivo de ~809 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct y aplica un proceso de poda seguido de destilacion. Se seleccionan bloques del profesor para inicializar un estudiante de 18 capas, que conserva los embeddings y el tokenizador originales. Durante el entrenamiento se optimizan 6.598.656 parametros de LoRA de rango 16 fusionados al final, a lo largo de 640 pasos y cuatro epocas, con tasa de aprendizaje 0,0002, longitud de secuencia 192 y semilla 42. Se evaluaron dos candidatos de arquitectura (12 y 18 capas) con el mismo presupuesto; se eligio el de 18 capas por menor entropia cruzada de validacion.

La funcion de perdida combina tres terminos: entropia cruzada dura sobre los tokens del asistente, divergencia KL escalada por temperatura sobre los 64 tokens mas probables del profesor mas un cubo agregado de cola, y una penalizacion de alineacion de kernels. Este ultimo termino compara sketches fijos de cuatro dimensiones de los estados ocultos de la respuesta con ocho landmarks del profesor escogidos solo a partir de ejemplos de entrenamiento. El corpus son 192 prompts originales en ingles (48 temas, con respuestas de referencia compartidas entre cuatro estilos de prompt), repartidos en 160/16/16 ejemplos de entrenamiento, validacion y test por familias completas de temas. Las referencias se redactaron con ayuda de IA y no pasaron revision experta externa.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (system/user/assistant).
- Respuestas tecnicas concisas orientadas a ingenieria, procesado de senales, Python, machine learning y conceptos de kernels verificables.
- Instrucciones siguiendo el formato de Qwen2.5-Instruct heredado del profesor.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible; el corpus de entrenamiento no lo cubre.
- Capacidades multilingues: no, solo ingles.
- Capacidades especiales: no dispone de modo de razonamiento explicito, vision ni audio.

## Casos de uso

- Investigacion en destilacion de conocimiento: punto de partida reproducible para estudiar como se comporta un estudiante podado frente a su profesor, con pesos, metricas y generaciones de test publicadas.
- Analisis del efecto de regularizadores tipo kernel alignment: permite comparar la MSE de alineacion (0,202223 en la base podada frente a 0,018879 en el checkpoint destilado) como senal de seguimiento de la representacion del profesor.
- Reproduccion de pipelines de fusion LoRA: el flujo (adaptador rango 16 fusionado en pesos Transformers) sirve de plantilla para experimentos con presupuestos pequenos de computo.
- Prototipado de asistentes tecnicos de baja latencia en ingles: al tener 404M parametros puede ejecutarse en CPU o GPU modesta para demos internas, siempre con supervision humana.
- Pruebas de integracion en ecosistema Transformers y TGI: los tags `text-generation-inference` y `endpoints_compatible` permiten desplegarlo para validar plantillas de chat contra endpoints compatibles.
- Docencia y divulgacion: util para ilustrar de forma tangible los limites de un modelo destilado en un corpus estrecho (errores factuales observados, definiciones imprecisas).
- Generacion de codigo en produccion y atencion al cliente automatizada: no recomendado, dado que el autor declara que no es un asesor tecnico fiable y que las respuestas pueden ser falsas o repetitivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las unicas metricas reportadas son de perplejidad y alineacion sobre el banco de referencias propio del autor:

| Medicion | Base podada | Checkpoint destilado | Profesor |
|---|---:|---:|---:|
| Perplejidad de referencia (validacion) | 6.635,52 | 67,96 | no disponible |
| Perplejidad de referencia (test) | 10.327,21 | 84,14 | ~67,27 |
| MSE de alineacion producto-kernel (test) | 0,202223 | 0,018879 | no disponible |

El autor advierte expresamente que la verosimilitud de tokens sobre este banco estrecho no constituye un benchmark independiente de factualidad, codigo o seguridad, y que no se reclama ninguna ventaja amplia de calidad ni ventaja cuantica.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,8 GB de pesos mas activaciones y cache; en la practica alrededor de 1,5-2 GB en GPU con Transformers.
- Cabe en GPU de consumo: si, en cualquier GPU con 2 GB o mas de VRAM (por ejemplo GTX 1050 Ti, RTX 3050, RTX 4060). Tambien puede ejecutarse en CPU con memoria RAM suficiente (el repo ocupa 0,8 GB).
- GPU recomendadas para mayor throughput: RTX 4090, RTX 3090, L4, A10G para lotes pequenos; A100/H100 no aportan ventaja significativa dado el tamano del modelo.
- Opciones de despliegue: Transformers (ejemplo oficial en la model card), Text Generation Inference (los tags lo marcan como compatible), y potencialmente llama.cpp/Ollama si se convierte a GGUF, aunque esa conversion no esta verificada por el autor.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks amplios para establecer comparaciones cuantitativas de calidad. La comparacion con el modelo de origen es la unica documentada:

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmark comparable |
|---|---:|---|---|---|---|
| Sofia Chat Distilled v0.1 | 404.558.464 | entrenado a 192 tokens | apache-2.0 | en | perplejidad propia 84,14 en test |
| Qwen2.5-0.5B-Instruct (profesor) | 494.032.768 | configuracion posicional heredada | apache-2.0 | multilingue (upstream) | perplejidad propia ~67,27 en test |
| Otros destilados de Qwen2.5-0.5B-Instruct | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han localizado alternativas comparables con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Factualidad: el autor documenta errores factuales e imprecisos en las generaciones de held-out; por ejemplo, una respuesta de test describe erroneamente una lista de Python como un array unidimensional.
- Corpus minimo: solo 192 prompts originales y 48 temas, con referencias redactadas con ayuda de IA y sin revision experta externa.
- Sin benchmark amplio: las metricas se limitan a perplejidad de referencia y alineacion de kernels, sin evaluacion independiente de calidad, codigo o seguridad.
- Contexto: el entrenamiento usa secuencias de 192 tokens; la configuracion posicional del profesor no garantiza competencia en contexto largo.
- Idioma: unicamente ingles; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Reproducibilidad limitada: un unico seed de entrenamiento (42) y una sola particion de datos.
- Poda: la reduccion de parametros puede degradar la calidad linguistica general.
- Licencia: apache-2.0 para el modelo, pero los pesos y el tokenizador de Qwen siguen sujetos a su atribucion Apache-2.0 ascendente; consultese `LICENSE` y `NOTICE`.
- Uso en produccion: no recomendado como asesor tecnico; el autor indica explicitamente que el checkpoint es un experimento reproducible, no un asesor fiable. Ninguno de los dos modelos (profesor o estudiante) realiza control de maquinaria.
- Naturaleza del objetivo: la alineacion de kernels es un regularizador clasico explicito, no una arquitectura de lenguaje cuantica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rootcastleengineering/sofia-chat-distilled-v0.1
- Repositorio de entrenamiento reproducible: https://github.com/rootcastleco/sofia-distilled
- Manuscrito de referencia sobre kernels verificables: https://www.academia.edu/175377730/Quantum_Artificial_Intelligence_with_Verifiable_Kernels
