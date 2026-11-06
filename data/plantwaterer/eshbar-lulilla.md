# plantwaterer/eshbar-lulilla

## Resumen

Eshbar-lulilla es un ajuste fino completo del modelo google/gemma-4-31B-it, desarrollado por el usuario plantwaterer y publicado bajo licencia Apache 2.0. Se trata de un fine-tune orientado especificamente a la toma de decisiones y a preguntas de opcion multiple, no a la generacion de texto generica. El modelo parte de la base multimodal Gemma 4 de 31B parametros y anade una cabeza de clasificacion propia sobre la ultima capa, junto con un motor de inferencia empaquetado en el propio repositorio.

La relevancia del modelo reside en su enfoque de ingenieria: no es solo un fine-tune de pesos, sino un paquete completo que incluye un motor (`eshbar_lulilla:Engine`), una cabeza de decision, un almacen de conocimiento y un ejecutor de codigo con kernel GPU, todo verificado mediante MD5 en `PINS.json`. El autor reporta una puntuacion de 70.27 en el Decision Index 0.3 (autoevaluada).

El modelo esta disenado para responder preguntas con opciones discretas (letras, numeros o si/no) con alta precision, incorporando mecanismos de calibracion de temperatura, promediado sobre ordenes de opciones y, en casos concretos, resolucion mediante almacen de datos o ejecucion de codigo Python generado por el propio modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Gemma 4), con cabeza de decision anadida |
| Parametros totales | 31.273.088.876 (31,27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (max_len) |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino completo (continued full fine-tune) del modelo base google/gemma-4-31B-it, partiendo a su vez del fine-tune previo plantwaterer/liquamen. Sobre la ultima capa se anade una cabeza de decision propia. La arquitectura subyacente es un transformer multimodal de Gemma 4, con atencion empaquetada de documentos: las capas de atencion completa son bidireccionales dentro de un prompt, mientras que las capas de ventana deslizante son causales.

El entrenamiento incluye datos de LLM Bayesian Teaching Data (Zenodo, CC BY 4.0) y MedMCQA (MIT). La inferencia emplea bf16, y para peticiones cortas promedia la respuesta sobre 4 ordenes de opciones. Para opciones ordinarias usa la softmax de los logits de letra a una temperatura ajustada T = 1.4004; para decisiones si/no emplea una posterior de Laplace integrada. Ademas, incorpora un almacen de conocimiento (estadisticas a nivel de pais, derivadas de Our World in Data y V-Dem) y un ejecutor de codigo exacto: si la primera pasada no alcanza un umbral de confianza (0.925 para opciones numericas, 0.75 para si/no), el modelo puede generar una funcion Python corta (maximo 320 tokens nuevos, decodificacion greedy) que un ejecutor con kernel GPU resuelve en proceso.

## Capacidades

- Toma de decisiones con opciones multiples (letras, numeros, si/no) con calibracion de probabilidad.
- Generacion de texto conversacional (pipeline text-generation).
- Razonamiento de opcion multiple con promediado sobre ordenes de opciones para reducir sesgo posicional.
- Resolucion de preguntas numericas mediante almacen de conocimiento integrado (estadisticas por pais).
- Generacion y ejecucion de codigo Python corto para calculo exacto de respuestas numericas.
- Capacidad multimodal heredada del modelo base (image-text-to-text), aunque la model card no detalla su uso.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion automatizada de examenes tipo test: el modelo responde preguntas de opcion multiple con probabilidades calibradas, adecuado para sistemas de correccion o generacion de bancos de preguntas.
- Investigacion en toma de decisiones de LLM: su motor y cabeza de decision permiten estudiar calibracion, sesgo posicional y tecnicas de promediado sobre ordenes de opciones.
- Preguntas factuales numericas: gracias al almacen de conocimiento integrado (estadisticas por pais), puede responder consultas cuantitativas concretas sin depender solo de la memoria parametrica.
- Razonamiento aritmetico verificable: la generacion de funciones Python y su ejecucion exacta permiten obtener respuestas numericas comprobables, util en entornos donde se exige trazabilidad del calculo.
- Clasificacion binaria si/no en dominios medicos: el uso de MedMCQA en el entrenamiento y la posterior de Laplace lo orientan a decisiones binarias con incertidumbre cuantificada.
- Despliegue en servicios de decision de alta precision: con latencia mediana de 296 ms en una RTX PRO 6000, es viable para APIs de clasificacion o respuesta a preguntas en produccion con una sola GPU de 96 GB.
- Prototipado de asistentes conversacionales multimodales: al heredar la base Gemma 4 image-text-to-text, puede servir de punto de partida para aplicaciones que combinen texto e imagen, aunque el fine-tune se centra en decision.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Decision Index 0.3 (public score) | 70.27 | Autoevaluado por el autor (self-run) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: al menos 75 GB para inferencia en bf16 (pesos de 62 GB).
- GPU recomendadas: una RTX PRO 6000 (96 GB) es suficiente; el autor la usa como referencia. No se indica compatibilidad con A100 (80 GB) ni H100, aunque por capacidad de memoria serian candidatas teoricas.
- GPU de consumo: no cabe en GPU consumer convencionales (RTX 4090 de 24 GB, etc.) en bf16.
- Opciones de despliegue: motor propio `eshbar_lulilla:Engine` empaquetado en el repositorio, invocado mediante el kit apolinario/decision-index. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia (RTX PRO 6000 Blackwell, muestra de 1.000 filas): mediana 296 ms, media 810 ms, p80 932 ms, p95 2.338 ms. No incluye carga del modelo ni warm-up (hasta unos tres minutos).
- Kernel del ejecutor precompilado para sm_75 a sm_120.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| eshbar-lulilla | 31,27B | 32.768 | Fine-tune de decision sobre Gemma 4 | Apache 2.0 | Hugging Face |
| google/gemma-4-31B-it | no disponible | no disponible | Modelo base multimodal instruct | no disponible | Hugging Face |
| plantwaterer/liquamen | no disponible | no disponible | Fine-tune previo del mismo autor | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo con alternativas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: su rendimiento fuera de tareas de decision con opciones discretas no esta documentado y podria degradarse respecto al modelo base.
- La puntuacion de 70.27 en Decision Index 0.3 es autoevaluada (self-run), sin verificacion independiente.
- El almacen de conocimiento integrado contiene estadisticas a nivel de pais con valores redondeados a tres cifras significativas y reindexados; puede no reflejar datos actualizados.
- La resolucion mediante ejecucion de codigo solo se activa en condiciones estrictas (una sola pregunta, opciones numericas o si/no, baja confianza en primera pasada); en otros casos la respuesta es la de la primera pasada.
- Idiomas soportados no documentados; el comportamiento multilingue no esta garantizado.
- Requiere hardware de gama alta (75 GB+ de VRAM), lo que limita su despliegue a entornos con GPU profesionales.
- Riesgo de alucinacion en preguntas factuales fuera del almacen de conocimiento, como en cualquier LLM.
- Sesgos conocidos: no documentados explicitamente; hereda los del modelo base Gemma 4.
- Componentes de terceros con licencias propias: el ejecutor deriva de LOOM (Apache 2.0, modificado) y el almacen de conocimiento usa datos CC BY-SA 4.0 (Our World in Data, V-Dem), lo que puede imponer obligaciones de atribucion y compartir-igual en productos derivados.
- El modelo incluye verificacion MD5 de ficheros en carga, lo que anade rigidez ante modificaciones locales.

## Enlaces

- Hugging Face: https://huggingface.co/plantwaterer/eshbar-lulilla
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Fine-tune previo: https://huggingface.co/plantwaterer/liquamen
- Kit decision-index: https://github.com/apolinario/decision-index (referencia apolinario/decision-index @ 9eb2dbe2a358004c8782c66e40a83ac07b953fec)
- LOOM (ejecutor base): https://github.com/mkturkcan/Loom
- LLM Bayesian Teaching Data: https://doi.org/10.5281/zenodo.17677329
- MedMCQA: https://github.com/medmcqa/medmcqa
