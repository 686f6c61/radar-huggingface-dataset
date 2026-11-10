# aafimalek2032/wordle-rl-gemma3-270m-onnx

## Resumen

wordle-rl-gemma3-270m-onnx es una exportación a formato ONNX del modelo aafimalek2032/wordle-rl-gemma3-270m, un ajuste fino de Gemma 3 de 270 millones de parámetros especializado en jugar a Wordle. Lo desarrolla el usuario aafimalek2032 y su propósito es servir de motor de inferencia en el navegador mediante transformers.js, concretamente para la demo aafimalek2032/five-letters alojada en Hugging Face Spaces. La exportación se realizó con Optimum usando la tarea `text-generation-with-past`, y la diferencia máxima de logits respecto al modelo original en PyTorch fue de 9e-5, lo que indica una fidelidad numérica muy alta en la versión fp32.

El modelo no es un modelo de propósito general: está entrenado con refuerzo (RL) para resolver el juego de palabras de cinco letras, y su relevancia radica en que demuestra que un modelo de 270M parámetros puede resolver tareas de razonamiento restringido con un formato de prompt adecuado, y que puede desplegarse íntegramente en el cliente sin backend. El repositorio incluye dos variantes de pesos, fp32 (1,7 GB) y q8 dinámico (440 MB), lo que permite elegir entre fidelidad y tamaño.

La ficha se basa exclusivamente en la información disponible en la model card y los metadatos del repositorio; muchos datos técnicos del modelo base (composición del dataset, detalles del RL, benchmarks generales) no están publicados y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text), exportado a ONNX |
| Parametros totales | 270 millones (según el nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 y q8 (int8 dinámico, por canal) |
| Idiomas soportados | no disponible (el modelo base es Gemma 3, multilingüe, pero no se documenta en esta ficha) |
| Licencia | Gemma Terms of Use y Gemma Prohibited Use Policy |
| Formato de pesos | ONNX (`onnx/model.onnx` fp32, `onnx/model_quantized.onnx` q8) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Gemma 3 con 270M de parámetros, una arquitectura transformer decoder-only. Sobre esa base se aplicó un entrenamiento con refuerzo (indicado por el sufijo `-rl` en el nombre) orientado a resolver Wordle, el juego de adivinar una palabra de cinco letras en un máximo de intentos con retroalimentación por letra. La model card no detalla el algoritmo de RL empleado, el número de pasos, la composición del dataset de entrenamiento ni si hubo fases de SFT previas o DPO; esos datos no están disponibles.

La exportación a ONNX se realizó con Optimum para la tarea `text-generation-with-past`, es decir, con caché de clave-valor para generación autorregresiva. La validación de la exportación se hizo comparando los logits del modelo ONNX con los del modelo PyTorch: la diferencia máxima fue de 9e-5, lo que confirma que la conversión no introduce desviaciones significativas. El autor advierte que la configuración de generación heredada de Gemma muestrea por defecto, por lo que es necesario forzar decodificación greedy (`do_sample: false`) para reproducir el comportamiento del paper y de la demo. El formato de prompt y las reglas del juego están documentados en `demo/browser/game.js` del repositorio de GitHub.

## Capacidades

- Generación de texto restringida al dominio de Wordle: dado un historial de intentos y retroalimentación, propone la siguiente palabra de cinco letras.
- Razonamiento de juego con estado: procesa el historial de intentos previos y las pistas por letra (verde, amarilla, gris) para elegir el siguiente movimiento.
- Decodificación greedy reproducible: con `do_sample: false` reproduce exactamente los resultados del modelo PyTorch en fp32 (100 de 100 partidas idénticas en el conjunto de test WordleBench).
- Inferencia en navegador: compatible con transformers.js y el runtime ONNX, sin necesidad de servidor.
- Cuantización q8 disponible para reducir el tamaño a 440 MB manteniendo una tasa de victoria de 83 sobre 100 en el test.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no documentadas en esta ficha; el modelo base Gemma 3 es multilingüe, pero el ajuste está orientado a Wordle en inglés.

## Casos de uso

- Demo interactiva en navegador: el caso de uso principal documentado por el autor es la demo aafimalek2032/five-letters, donde el modelo ONNX se carga con transformers.js y resuelve partidas de Wordle en el cliente, sin backend ni coste de servidor.
- Aplicaciones educativas de teoría de juegos: sirve para ilustrar cómo un modelo pequeño entrenado con RL puede aprender una política de resolución de un juego de información imperfecta, con un conjunto de test reproducible de 100 palabras.
- Prototipado de agentes de juego en el navegador: al ser ONNX y ejecutarse con transformers.js, puede integrarse en extensiones o web apps que necesiten un solver de Wordle offline.
- Evaluación de pipelines de exportación ONNX: el repositorio documenta la fidelidad de la conversión (diferencia máxima de logits 9e-5) y la comparación de partidas, por lo que sirve como caso de referencia para validar exportaciones con Optimum.
- Benchmark de cuantización: la comparación fp32 frente a q8 (100/100 frente a 83/100 partidas idénticas, 87 frente a 83 victorias) es un ejemplo concreto del impacto de la cuantización dinámica int8 en un modelo pequeño.
- Investigación sobre modelos de 270M: útil para estudiar el límite inferior de tamaño en el que un modelo puede resolver una tarea de razonamiento estructurado con RL, en contraste con modelos mucho mayores.
- Integración en tutoriales de transformers.js: el snippet de carga (`AutoTokenizer` y `AutoModelForCausalLM.from_pretrained` con `dtype: "fp32"` o `"q8"`) es directamente reutilizable como ejemplo docente.

## Benchmarks y rendimiento

Los únicos datos publicados son los de la model card, medidos sobre 100 palabras de test de WordleBench (modelo solo, decodificación greedy):

| Variante | dtype | Tamano | Partidas idénticas al paper | Victorias |
|---|---|---|---|---|
| `onnx/model.onnx` | fp32 | 1,7 GB | 100 de 100 | 87 |
| `onnx/model_quantized.onnx` | q8 (int8 dinámico, por canal) | 440 MB | 83 de 100 | 83 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: la variante fp32 ocupa 1,7 GB de pesos y la q8 440 MB; el consumo real depende del runtime y del contexto, pero al ser un modelo de 270M es muy contenido.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutarlo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de memoria libre para fp32 o menos de 1 GB para q8; también puede ejecutarse en CPU.
- Despliegue: el formato es ONNX y la librería declarada es transformers.js, por lo que el despliegue natural es en navegador o Node.js con `@huggingface/transformers` y el runtime ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| wordle-rl-gemma3-270m-onnx | 270M | no disponible | Wordle (RL) | Gemma | ONNX |
| Gemma 3 270M (base) | 270M | no disponible en esta ficha | Propósito general | Gemma | safetensors, GGUF, etc. |
| Modelos de 270M-1B de propósito general | 270M-1B | variable | Texto general | variable | variable |

La comparativa con alternativas de la misma categoría (modelos de 270M de propósito general) no está disponible con datos de rendimiento en la información proporcionada. La diferencia principal frente al Gemma 3 270M base es el ajuste con RL para Wordle y la exportación a ONNX para navegador.

## Limitaciones y advertencias

- Modelo altamente especializado: está entrenado para Wordle y no debe usarse como modelo de propósito general; su rendimiento fuera de ese dominio no está documentado.
- La cuantización q8 degrada los resultados: 83 victorias frente a 87 en fp32 y solo 83 de 100 partidas idénticas, por lo que para reproducir el paper hay que usar fp32.
- Es obligatorio usar decodificación greedy (`do_sample: false`); la configuración heredada de Gemma muestrea por defecto y rompería la reproducibilidad.
- El prompt debe seguir el formato documentado en `demo/browser/game.js`; no hay una plantilla de chat estándar publicada en la model card.
- Riesgo de alucinación: no documentado para este ajuste, pero al ser un modelo de 270M es esperable que genere palabras inválidas o fuera de las reglas si el prompt se desvía del formato de entrenamiento.
- Idiomas: no documentados; el ajuste está orientado a Wordle en inglés.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use y a la Gemma Prohibited Use Policy, que imponen restricciones adicionales respecto a licencias permisivas.
- Sin descargas ni likes en el momento de la consulta (0 y 0), y creado en noviembre de 2026; es un artefacto muy reciente y de un único autor, sin validación externa más allá de la comparación con el paper.
- No se documentan sesgos, comportamiento en contextos largos ni robustez frente a entradas malformadas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aafimalek2032/wordle-rl-gemma3-270m-onnx
- Modelo base: https://huggingface.co/aafimalek2032/wordle-rl-gemma3-270m
- Demo en vivo: https://huggingface.co/spaces/aafimalek2032/five-letters
- Repositorio de código: https://github.com/Aafimalek/wordle-rl
- Documentación de transformers.js: https://huggingface.co/docs/transformers.js
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
