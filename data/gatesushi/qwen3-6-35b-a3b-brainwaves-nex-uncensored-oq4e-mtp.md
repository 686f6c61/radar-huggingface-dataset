# gatesushi/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-oQ4e-mtp

## Resumen

`Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-oQ4e-mtp` es una cuantizacion de 4 bits equivalente (formato oQ4e) del modelo `Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored` publicado por Nightmedia, que a su vez parte de la arquitectura Qwen3.6-35B-A3B. La version que nos ocupa la publica el usuario gatesushi y esta empaquetada especificamente para el framework oMLX (version 0.7.3) con el motor splash, lo que la orienta al ecosistema Apple Silicon mediante la libreria MLX.

El modelo conserva la estructura MoE del original (35.951.822.704 parametros totales segun los pesos safetensors del repo, con aproximadamente 3.000 millones de parametros activos por token, de ahi el sufijo A3B) y anade el sufijo `mtp`, que corresponde a multi-token prediction, una tecnica de decodificacion especulativa integrada en el propio modelo. El resultado es un modelo de proposito general con un perfil de velocidad notable: el autor reporta unos 319 tok/s en decodificacion inicial y unos 84 tok/s a 200k tokens de contexto, con un consumo de memoria de entre 22 y 25,6 GB.

La relevancia practica es doble: por un lado ofrece un asistente generalista de alta calidad (87,0% en MMLU, 96,0% en GSM8K, 94,0% en HumanEval) con un coste de memoria contenido para su tamano; por otro, su naturaleza "uncensored" y su licencia no declarada hacen imprescindible verificar las condiciones de uso antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`) con multi-token prediction (MTP) |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones por token (sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | Hasta 200.000 tokens (segun benchmarks del autor a pp200k) |
| Tipos de cuantizacion | oQ4e (4 bits equivalente, formato oQ de oMLX); no se listan otras variantes en el repo |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (libreria mlx), tamano del repo 22,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer de mezcla de expertos (MoE) de la familia Qwen3.5/Qwen3.6, con unos 36.000 millones de parametros totales y aproximadamente 3.000 millones activos por token, lo que permite un rendimiento computacional propio de un modelo mucho mas pequeno manteniendo la capacidad representacional de uno grande. Sobre esta base, el autor del modelo derivado (Nightmedia) aplico un ajuste orientado a un asistente generalista sin censura, y gatesushi realizo la cuantizacion oQ4e para oMLX. La variante incorpora MTP (multi-token prediction), que actua como mecanismo de decodificacion especulativa: el modelo predice varios tokens por paso y los valida, acelerando la generacion sin cambiar el resultado final.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original ni en el ajuste de Nightmedia. Tampoco se detalla la innovacion concreta del motor splash mas alla de su impacto en latencia y en la varianza de prefill observada. El autor advierte de que las mediciones con splash 1.5.0 presentan una varianza irregular en los tiempos de prefill segun el tamano de la ventana de contexto, aunque la velocidad de decodificacion (TG TPS) se mantiene estable.

## Capacidades

- Generacion de texto generalista con buen rendimiento en conocimiento general (87,0% en MMLU) y razonamiento dificil (67,0% en MMLU_PRO).
- Razonamiento matematico: 96,0% en GSM8K y 90,5% en MATHQA con modo thinking activado.
- Generacion de codigo: 94,0% en HumanEval y 81,0% en MBPP; rendimiento mas limitado en coding avanzado en vivo (58,0% en LiveCodeBench).
- Modo thinking explicito, visible en el ejemplo de la model card (bloques "Thinking" con verificacion de factibilidad paso a paso).
- Generacion de artefactos estructurados: el ejemplo de la model card produce SVG valido a partir de una notacion PGN de ajedrez, incluyendo renderizado grafico y rejilla de texto.
- Ventana de contexto larga de hasta 200k tokens, con degradacion controlada de velocidad (unos 84 tok/s a 200k frente a 319 tok/s iniciales).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el modo thinking sugiere capacidad de descomposicion de problemas.
- Vision y audio: no disponibles.

## Casos de uso

- Asistente de proposito general en local sobre Apple Silicon: con 22-25,6 GB de memoria pico y ~319 tok/s iniciales, es adecuado como asistente diario de escritorio en equipos con memoria unificada de 32 GB o superior, cubriendo redaccion, investigacion y aprendizaje.
- Razonamiento matematico y resolucion de problemas: con 96,0% en GSM8K y 90,5% en MATHQA con thinking, sirve para tutoria de matematicas, verificacion de calculos y generacion de explicaciones paso a paso.
- Generacion de codigo en tareas cotidianas: 94,0% en HumanEval y 81,0% en MBPP lo hacen util para autocompletado, generacion de funciones y refactorizaciones simples; no es la mejor opcion para coding competitivo o LiveCodeBench.
- Procesamiento de documentos largos: la ventana de 200k tokens permite resumir contratos, analizar informes extensos o hacer preguntas sobre bases de codigo completas manteniendo velocidades de decodificacion utilizables (~84 tok/s).
- Generacion de artefactos visuales estructurados: el ejemplo de la model card demuestra la produccion de SVG a partir de una descripcion textual (PGN de ajedrez), aplicable a diagramas, visualizaciones simples y graficos generados por codigo.
- Prototipado de agentes conversacionales sin restricciones editoriales: el caracter "uncensored" lo hace util para investigacion sobre seguridad, red teaming y estudio de comportamiento de modelos sin filtros, siempre que se respete la legalidad aplicable.
- Analisis de textos cientificos y QA sobre ciencia: 97,3% en ARC_CHALLENGE y 87,3% en TruthfulQA indican buen desempeno en preguntas cientificas y verificacion factual basica.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card, comparando con las variantes de mayor precision `oQ6e-mtp` y `qx64-hi-mlx`:

| Benchmark | oQ4e-mtp | oQ6e-mtp | qx64-hi-mlx |
|---|---|---|---|
| MMLU (conocimiento general) | 87,0% | 86,0% | 86,0% |
| MMLU_PRO (razonamiento dificil) | 67,0% | 61,0% | 62,0% |
| HellaSwag (sentido comun) | 95,5% | 95,5% | 93,0% |
| TruthfulQA | 87,3% | 88,0% | 87,0% |
| ARC_Challenge (QA cientifico) | 97,3% | 96,3% | 95,7% |
| Winogrande (pronombres) | 76,3% | 78,0% | 81,3% |
| GSM8K (problemas matematicos) | 96,0% | 94,0% | 95,0% |
| MATHQA (con thinking) | 90,5% | 90,0% | 89,5% |
| HumanEval (codigo basico) | 94,0% | 94,0% | 94,0% |
| MBPP (generacion de codigo) | 81,0% | 78,0% | 80,0% |
| LiveCodeBench (codigo avanzado) | 58,0% | 69,0% | 67,0% |

Metricas de velocidad y memoria:

| Metrica | oQ4e-mtp | oQ6e-mtp | qx64-hi-mlx |
|---|---|---|---|
| Memoria pico | ~22 - 25,6 GB | ~29,8 - 33,4 GB | ~29,3 - 33,6 GB |
| Decodificacion inicial (TG TPS @ pp1k) | ~319 tok/s | ~209 tok/s | ~110 tok/s |
| Decodificacion en contexto largo (TG TPS @ pp200k) | ~84 tok/s | ~78 tok/s | ~49 tok/s |
| Throughput maximo (@ pp200k) | ~1.191 tok/s | ~1.173 tok/s | ~1.278 tok/s |

No se han publicado resultados de benchmarks independientes en la informacion disponible; todas las cifras proceden del autor del modelo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: entre 22 y 25,6 GB de memoria pico durante la inferencia, segun mediciones del autor.
- Cabe en Apple Silicon con memoria unificada de 32 GB o superior; es el entorno objetivo al estar empaquetado para MLX y oMLX. No se documenta soporte para GPUs NVIDIA o AMD.
- GPU recomendadas: no disponible para CUDA; en Apple Silicon, chips de la familia M-series con 32 GB o mas de memoria unificada.
- Opciones de despliegue: framework oMLX 0.7.3 con motor splash 1.5.0 (entorno documentado por el autor). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y el formato oQ4e no es compatible con esos runtimes sin conversion.
- Latencia y throughput: ~319 tok/s en decodificacion inicial (pp1k) y ~84 tok/s a 200k tokens de contexto (pp200k); throughput global maximo de ~1.191 tok/s a pp200k.
- Nota de estabilidad: el autor advierte de una varianza irregular en los tiempos de prefill con el motor splash 1.5.0, dependiente del tamano de la ventana de contexto; la decodificacion permanece estable.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| oQ4e-mtp (este modelo) | 35,9B totales / ~3B activos | 200k | 87,0% | 96,0% | 94,0% | No disponible | HuggingFace (MLX/oMLX) |
| Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-oQ6e-mtp | 35,9B totales / ~3B activos | 200k | 86,0% | 94,0% | 94,0% | No disponible | HuggingFace (MLX/oMLX) |
| Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-qx64-hi-mlx | 35,9B totales / ~3B activos | 200k | 86,0% | 95,0% | 94,0% | No disponible | HuggingFace (MLX/oMLX) |
| Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored (original de Nightmedia) | 35,9B totales / ~3B activos | No disponible | No disponible | No disponible | No disponible | No disponible | HuggingFace |

Las tres variantes cuantizadas comparten arquitectura y base, por lo que la comparacion relevante es de precision frente a velocidad: oQ4e-mtp gana en velocidad (2,9x frente a qx64-hi-mlx a longitudes conversacionales) y en memoria (hasta 8 GB menos), mientras que oQ6e-mtp y qx64-hi-mlx retienen ventaja en LiveCodeBench (69,0% y 67,0% frente a 58,0%) y Winogrande (78,0% y 81,3% frente a 76,3%). No se dispone de datos de modelos comparables de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no es posible determinar si el uso comercial esta permitido; es imprescindible contactar con el autor o consultar la licencia del modelo base antes de desplegarlo en produccion.
- Modelo "uncensored": el ajuste elimina filtros de seguridad, lo que implica riesgo de generar contenido sensible, ofensivo o legalmente restringido; requiere moderacion adicional en cualquier aplicacion publica.
- Riesgo de alucinacion: como todo modelo generativo, puede producir afirmaciones falsas con aparente seguridad; el 87,3% en TruthfulQA no garantiza fiabilidad factual en dominios especializados.
- Brecha en coding avanzado: 58,0% en LiveCodeBench frente al 69,0% de oQ6e-mtp, una diferencia de 11 puntos que desaconseja esta variante para tareas de programacion competitiva o generacion de codigo complejo en produccion.
- Peor rendimiento en resolucion de pronombres y sentido comun fino: 76,3% en Winogrande frente al 81,3% de qx64-hi-mlx.
- Varianza de prefill con el motor splash 1.5.0: el autor reconoce mediciones irregulares en tiempos de prefill segun el contexto, lo que puede afectar a la latencia percibida en el primer token en ventanas largas.
- Dependencia de ecosistema: el formato oQ4e y el motor splash solo funcionan con oMLX; no hay soporte para vLLM, llama.cpp, Ollama ni GPUs NVIDIA, lo que limita el despliegue a Apple Silicon.
- Idiomas soportados no documentados: no se puede confirmar la calidad en castellano ni en otros idiomas distintos del ingles.
- Cero descargas y cero likes en el momento de la consulta: el modelo carece de validacion por parte de la comunidad y los benchmarks son unicamente los del autor.
- Fecha de creacion futura (2026-11-03): la model card y los datos asociados deben tratarse con cautela hasta que exista verificacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gatesushi/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored-oQ4e-mtp
- Modelo base de Nightmedia: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Brainwaves-Nex-Uncensored
- Captura de ejemplo de la model card: https://cdn-uploads.huggingface.co/production/uploads/690972064766b88b0950fc69/YJXIWTizEfLaB7rTUYZLC.png
- Paper, blog o repositorio del framework oMLX: no disponible en la informacion proporcionada
- Demos adicionales: no disponibles
