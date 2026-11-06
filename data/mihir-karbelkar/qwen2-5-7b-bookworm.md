# Mihir-Karbelkar/qwen2.5-7b-bookworm

## Resumen

Qwen2.5-7B Bookworm es un ajuste fino (fine-tuning) de Qwen/Qwen2.5-7B-Instruct desarrollado por Mihir Karbelkar, un ingeniero de software con experiencia en ML. El modelo inyecta mediante LoRA el contenido completo de un libro de no ficcion en ruso (2.176 pasajes) en un modelo de 7B parametros, con el objetivo de medir hasta que punto se puede ensenar conocimiento nuevo a un modelo pequeno sin degradar sus capacidades generales. Es un experimento de continual learning centrado en el problema del olvido catastrofico (catastrophic forgetting).

La relevancia del trabajo esta en la metodologia mas que en el modelo en si: el autor documenta con mediciones sistematicas que tecnicas como la regularizacion KL contra el modelo de partida, la inclusion de filas de formato matematico y las trampas de premisa falsa con pares "gemelos" permiten inyectar conocimiento masivo manteniendo IFEval, GSM8K y MMLU practicamente intactos. El modelo base es un transformer denso de 7B parametros con 32.768 tokens de contexto, entrenado sobre Qwen2.5-7B-Instruct.

Los pesos no estan publicados: el autor los mantiene privados porque el texto del libro no es de su propiedad y un modelo entrenado para recitar puede reproducirlo. La model card documenta el metodo, los resultados y las mediciones, pero no ofrece los pesos descargables. Por tanto, la ficha describe un artefacto experimental reproducible en metodologia pero no desplegable directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivada de Qwen2.5-7B-Instruct); adaptadores LoRA r64 / alpha128 fusionados en los pesos finales |
| Parametros totales | 7.000 millones (aproximado, heredado del modelo base Qwen2.5-7B-Instruct) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (la model card no documenta cuantizaciones publicadas; los pesos estan en fp16 fusionado) |
| Idiomas soportados | ruso (ru) e ingles (en), segun los tags del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (pesos privados; el entrenamiento se realizo con Unsloth y se fusiono a fp16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer denso con atencion por causalidad estandar y 32.768 tokens de contexto. Sobre esa base se aplica un LoRA de rango 64 y alpha 128 sobre todas las capas lineales, entrenado durante 2 epocas con learning rate 5e-5, scheduler coseno, gradient clipping de 1.0 y secuencias empaquetadas, usando Unsloth. El resultado se fusiona en pesos fp16. El entrenamiento completo, incluida la generacion de datos, tardo 3,7 horas en una unica A100 de 80 GB.

Los datos se generaron integramente con modelos de pesos abiertos (un teacher Gemma 4 26B-A4B servido con vLLM), sin texto de modelos cerrados. Para cada pasaje del libro se generan preguntas en varias formas (directa, "por que", "que pasaria si no", situacional) mas reformulaciones, y un juez descarta las preguntas que el pasaje no responde realmente. La respuesta objetivo es el pasaje literal, no un resumen del teacher, porque el modelo recita bien pero inventa cuando parafrasea. Se anaden trampas de premisa falsa, atributos intercambiados y empalmes de pasajes vecinos, respondidas con "Niet, eto ne tak." seguido del pasaje verdadero, y cada trampa tiene una pregunta gemela verdadera para que el modelo aprenda a comprobar la afirmacion en lugar de rechazar todo lo que parece una trampa. Las filas generales (respuestas del propio modelo base a prompts cotidianos, de formato y matematicos, mas completaciones matematicas en texto plano de 5 shots) se entrenan con una perdida KL contra los logits top-64 cacheados del modelo de partida, de modo que la actualizacion se frena donde no afecta al libro. Existe una guarda de contaminacion: ninguna fila de entrenamiento comparte un 8-grama con items de test de IFEval, GSM8K o MMLU. Se midio que sin el ancla KL el dano a la capacidad general crece con la cantidad de libro: IFEval cae 4 puntos con 140 pasajes, 18 con 500 y 36 con el libro completo.

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas en ruso e ingles.
- Recitacion y recuperacion de conocimiento factual del libro inyectado: responde preguntas sobre su contenido con una tasa de acierto del 71% en el examen del libro (91 de 129 preguntas de conocimiento).
- Rechazo de premisas falsas: 93 de 146 trampas de premisa falsa rechazadas correctamente, mas 38 que recitan el pasaje correcto en lugar de rechazar.
- Discriminacion entre trampas y preguntas verdaderas: 0 de 71 preguntas gemelas verdaderas rechazadas por error.
- Razonamiento matematico: GSM8K 5-shot estricto de 81,05, ligeramente por encima del modelo base.
- Seguimiento de instrucciones y formato: IFEval prompt-level strict de 72,64, por encima del base (70,61).
- Conocimiento general: MMLU 5-shot sobre muestra fija de 2.000 preguntas de 73,50, dentro de medio punto del base (73,85).
- Soporte de tool calling y function calling: no documentado en la model card (heredado potencialmente del base Qwen2.5-7B-Instruct, pero no verificado).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como caso de estudio reproducible para medir cuanto conocimiento nuevo admite un transformer de 7B antes de degradar sus benchmarks, gracias a la tabla de ablaciones publicada (rango de LoRA, filas de formato, ancla KL, trampas near-miss, barrido de learning rate).
- Inyeccion de conocimiento corporativo en un modelo pequeno: la receta (LoRA r64, KL contra el modelo de partida en filas generales, respuestas literales en lugar de resumenes) es directamente trasladable a dominios como manuales internos, normativa o documentacion tecnica, donde se quiere que el modelo cite el texto fuente en lugar de parafrasearlo.
- Sistemas de respuesta sobre documentacion con control de alucinacion: el patron de trampas con pares gemelos reduce las respuestas inventadas y ensena al modelo a verificar la premisa antes de responder, util en asistentes que deben rechazar preguntas mal planteadas.
- Evaluacion de pipelines de generacion de datos sinteticos: el flujo teacher (Gemma 4 26B-A4B con vLLM) mas juez para filtrar preguntas es reutilizable para construir datasets de instrucciones verificadas a partir de corpus propios.
- Prototipado de asistentes en ruso sobre GPU unica: al ser un 7B en fp16, cabe en una A100 80 GB y permite iterar rapidamente (3,7 horas por ciclo completo de entrenamiento) en escenarios de adaptacion linguistica donde el modelo base tiene poco prior.
- Estudio de metodos de regularizacion en fine-tuning: la comparacion medida entre LoRA plano (caida de GSM8K estricto de 15,5 puntos), anadir filas de formato matematico (caida reducida a 2,7) y anadir KL (caida total de 17,2 a 3,5) sirve como referencia practica para disenar recetas de ajuste.

## Benchmarks y rendimiento

| Benchmark | Qwen2.5-7B-Instruct (base) | Bookworm (libro 1) |
|---|---:|---:|
| Examen del libro: preguntas de conocimiento (129) | pendiente, se anade con el libro 2 | 91 (71%) |
| Examen del libro: trampas de premisa falsa rechazadas (146) | no aplica | 93 (+38 que recitan el pasaje correcto) |
| Examen del libro: preguntas gemelas verdaderas rechazadas por error (71) | no aplica | 0 |
| IFEval (prompt-level strict) | 70,61 | 72,64 |
| GSM8K (5-shot, strict) | 80,44 | 81,05 |
| MMLU (5-shot, muestra fija de 2.000 preguntas) | 73,85 | 73,50 |

Todas las cifras se obtuvieron con un unico turno de usuario, sin system prompt, decodificacion greedy, pesos fp16 fusionados, lm-evaluation-harness 0.4.13 sobre vLLM. El examen del libro se redacto de forma independiente a las filas de entrenamiento (se descartaron preguntas demasiado cercanas a una pregunta de entrenamiento) y una respuesta cuenta como correcta si contiene al menos el 60% de los hechos clave de la pregunta.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-16 GB en fp16 para un modelo denso de 7B; unos 5-6 GB en cuantizacion de 4 bits (estimacion estandar para esta talla, no documentada en la model card).
- GPU recomendadas: A100 80 GB para entrenamiento (medido: 3,7 horas por ciclo completo con generacion de datos incluida); para inferencia basta una GPU con 16 GB o mas en fp16.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas (RTX 4080, RTX 4090, RTX 3090) en fp16, y en tarjetas de 8 GB con cuantizacion de 4 bits, siempre que se obtengan los pesos (actualmente privados).
- Opciones de despliegue: vLLM (usado para la evaluacion), llama.cpp, Ollama y TGI son viables para la arquitectura Qwen2.5-7B; la model card no documenta despliegues propios.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pesos | Notas |
|---|---|---:|---|---|---|
| Qwen2.5-7B Bookworm | 7B | 32.768 | Apache 2.0 | Privados | Fine-tuning LoRA con inyeccion de libro y ancla KL; IFEval 72,64, GSM8K 81,05, MMLU 73,50 |
| Qwen2.5-7B-Instruct | 7B | 32.768 | Apache 2.0 | Publicos | Modelo base del anterior; IFEval 70,61, GSM8K 80,44, MMLU 73,85 |
| Qwen2.5-7B (base) | 7B | 32.768 | Apache 2.0 | Publicos | Version sin ajuste de instrucciones; referencia de capacidades generales |
| Gemma 4 26B-A4B | 26B totales / 4B activos (MoE) | no disponible | no disponible | Publicos | Usado como teacher para generar los datos de entrenamiento |

La comparativa se limita al linaje directo del modelo porque la model card no ofrece comparaciones con otros ajustes de inyeccion de conocimiento. No se dispone de datos de benchmarks de alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Pesos no publicados: el autor mantiene los pesos privados porque el texto del libro no es redistribuible y un modelo entrenado para recitar puede reproducir el libro. El modelo no es desplegable directamente; solo se documenta el metodo y las mediciones.
- Riesgo de reproduccion literal: por diseno, el modelo responde con el pasaje fuente palabra por palabra, lo que implica riesgo de regurgitacion del contenido del libro si los pesos se distribuyeran.
- Cobertura limitada a un unico libro: el conocimiento inyectado corresponde a un solo libro de no ficcion en ruso (2.176 pasajes); fuera de ese dominio el modelo se comporta como el base.
- Idiomas: soporte declarado de ruso e ingles; el resto de idiomas no esta verificado y el modelo base es mas fuerte en ingles y chino.
- Sesgos: no documentados en la model card; al heredar de Qwen2.5-7B-Instruct, arrastra los sesgos del modelo base, no evaluados en este trabajo.
- Alucinacion: el examen del libro mide un 71% de acierto en conocimiento y 93 de 146 trampas rechazadas; queda un margen de respuestas incorrectas o inventadas, especialmente en preguntas cercanas pero no identicas al entrenamiento.
- Dependencia de la receta: los resultados dependen de detalles finos (learning rate 5e-5, 2 epocas, rango 64, filas de formato matematico, ancla KL); el propio autor documenta que 2e-4 y 1e-4 rompen IFEval y MMLU y que 7e-5 se queda cerca del limite.
- Escalado no validado: el autor advierte que el dano a la capacidad general crece con la cantidad de libro sin el ancla KL (4 puntos de IFEval con 140 pasajes, 18 con 500, 36 con el libro completo); la robustez con libros 2 y 3 esta pendiente de publicacion.
- Licencia Apache 2.0 declarada, pero la naturaleza del contenido entrenado (libro con derechos) condiciona cualquier uso o redistribucion de los pesos.
- Sin datos de latencia, throughput ni cuantizaciones validadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Mihir-Karbelkar/qwen2.5-7b-bookworm
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- lm-evaluation-harness (evaluacion): https://github.com/EleutherAI/lm-evaluation-harness
- vLLM (serving y evaluacion): https://github.com/vllm-project/vllm
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
