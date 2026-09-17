# reasoning-cues/smollm3-rl

## Resumen

smollm3-rl es un adaptador LoRA de PEFT publicado por el usuario reasoning-cues sobre el modelo base HuggingFaceTB/SmolLM3-3B-Base. No es un modelo completo: se trata de un checkpoint de RL entrenado con GRPO (a traves de TRL) cuyo objetivo es que un modelo de 3B de parametros resuelva problemas de matematicas razonando paso a paso y cerrando la respuesta con una linea con el formato `Answer: $Answer`.

El adaptador tiene rango 64 y alpha 128, aplicado a todas las proyecciones de atencion y MLP, y se entreno sobre las 7.393 problemas del split de entrenamiento del dataset MATH con el prompt denominado RL-Zero. La recompensa es binaria: 1 si la linea final `Answer:` contiene la respuesta correcta, 0 en caso contrario, con penalizacion explicita para las generaciones que alcanzan el limite de 4.096 tokens.

Su relevancia es acotada y muy especifica: sirve como material de investigacion reproducible para estudiar RL con recompensa verificable (RLVR) y GRPO en modelos pequenos, y como generador de trazas de razonamiento. El repositorio tiene 0 descargas y 0 likes, 0,5 GB de pesos y licencia Apache-2.0, por lo que no cuenta con validacion alguna de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM3-3B-Base) con adaptador LoRA sobre todas las proyecciones de atencion y MLP |
| Parametros totales | Aproximadamente 3B en el modelo base; adaptador LoRA de bajo rango (r=64, alpha=128); repositorio de 0,5 GB |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento fija un limite de 4.096 tokens para la completion |
| Tipos de cuantizacion | No disponibles en la ficha del autor; al ser un adaptador PEFT en safetensors se puede fusionar con el base y cuantizar a posteriori (bitsandbytes, GGUF, GPTQ, AWQ) |
| Idiomas soportados | No disponible en la ficha; los datos de RL son problemas de MATH, formulados en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA de PEFT); libreria declarada: peft |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM3-3B-Base, un transformer decoder-only de aproximadamente 3.000 millones de parametros. Sobre el se entrena un adaptador LoRA con r=64 y alpha=128 aplicado a todas las proyecciones de atencion y MLP. El entrenamiento usa GRPO de TRL con el prompt RL-Zero (sin opener forzado), 32 prompts por paso con 16 muestras cada uno, temperatura 1.0, learning rate 1e-5, limite de 4.096 tokens por completion, clipping de 0,20/0,28 y sin termino KL. La recompensa es binaria: 1 si la respuesta final de la linea `Answer:` es correcta, 0 en caso contrario, con penalizacion de truncamiento (una rollout que agota el limite puntua 0).

Los datos de entrenamiento son el split de train de MATH (7.393 problemas). No se documenta el uso de RLHF, DPO ni de un corpus general adicional, ni se detalla la composicion completa del dataset mas alla de MATH train. La etiqueta `reasoning-registers` sugiere que el checkpoint forma parte de una linea de trabajo sobre registros de razonamiento, pero el autor no describe esa metodologia en la model card. El prompt de inferencia recomendado instruye a resolver paso a paso y a colocar la respuesta en su propia linea tras `Answer:`.

## Capacidades

- Generacion de texto y razonamiento matematico paso a paso, con trazas de cadena de pensamiento antes de la respuesta final.
- Resolucion de problemas de matematicas con salida en formato estricto `Answer: $Answer`, que facilita el parseo automatico y la evaluacion por expresion final.
- Razonamiento de un solo turno con prompts de tipo RL-Zero; no se documenta comportamiento conversacional multi-turno.
- Generacion de trazas largas: el entrenamiento permite hasta 4.096 tokens de completion.
- Capacidades multilingues: no documentadas para el adaptador; los datos de RL estan en ingles.
- Tool calling / function calling: no disponible y no documentado.
- Uso como agente o razonamiento multi-paso con herramientas: no disponible y no documentado.
- Vision, audio u otras modalidades: no disponibles (el modelo base es solo texto).
- Modo "thinking" explicito: no documentado como tal; la traza de razonamiento procede del prompt y de la recompensa sobre la respuesta final.

## Casos de uso

- Investigacion en RLVR y GRPO: el repositorio documenta hiperparametros concretos (lr 1e-5, clip 0,20/0,28, sin KL, 16 muestras por prompt), lo que permite reproducir o modificar el experimento sobre un modelo de 3B y comparar variantes de recompensa y prompt.
- Generacion de trazas de razonamiento para destilacion: las completions de hasta 4.096 tokens con estructura paso a paso son materia prima para construir datasets de SFT o para entrenar modelos mas pequenos en formato `Answer:`.
- Resolucion de problemas de matematicas por lotes: al ser un modelo de 3B con salida parseable, se puede desplegar en procesos offline (evaluacion de bancos de problemas, generacion de soluciones de referencia) con coste de inferencia bajo.
- Estudio de formatos de respuesta y reward hacking: la recompensa binaria sobre la linea `Answer:` permite analizar como el modelo aprende a colocar la respuesta correcta sin mejorar necesariamente el razonamiento intermedio.
- Punto de partida para fine-tuning adicional: el adaptador es pequeno (0,5 GB) y esta en formato PEFT, por lo que se puede continuar el entrenamiento o combinarlo con otros adaptadores sin reentrenar el modelo base completo.
- Experimentos de robustez de decodificacion: la penalizacion de truncamiento y el limite de 4.096 tokens permiten estudiar el efecto de cortar generaciones largas en la tasa de respuestas correctas.
- Uso educativo asistido (con supervision): puede generar explicaciones paso a paso de problemas tipo MATH, siempre que un revisor humano valide los pasos, dado el riesgo de razonamientos plausibles pero incorrectos.
- Compatibilidad con pipelines de evaluacion tipo `lm-evaluation-harness`: el formato de salida y los tokens de parada documentados (`<|end_of_text|>`, `<|im_end|>`, `"\nSolve the following math problem"`) simplifican la integracion automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el procedimiento de entrenamiento y la funcion de recompensa, pero no incluye cifras de MATH test, GSM8K, AIME ni de ninguna otra evaluacion, ni curvas de recompensa durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base de 3B fusionado con el adaptador): en bf16/fp16 aproximadamente 6-7 GB solo de pesos, mas cache KV; con cuantizacion de 8 bits en torno a 3,5-4 GB; con 4 bits en torno a 2-2,5 GB. Son estimaciones derivadas del tamano del modelo base, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM para bf16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, L4, A10); para cuantizacion de 4 bits basta con 4-6 GB.
- Cabe en GPU de consumo: si. En 4 u 8 bits es viable en GPUs de 8 GB (RTX 3070, RTX 4060) y sin cuantizar en 12-24 GB (RTX 3090, RTX 4090).
- Opciones de despliegue: transformers junto con peft (fusionando con `merge_and_unload()`), vLLM o TGI una vez fusionado el adaptador, y llama.cpp u Ollama si se convierte a GGUF. Tambien es posible cargar el adaptador en caliente sobre un despliegue del base con soporte de LoRA.
- Latencia y throughput: no disponibles en la informacion proporcionada. La generacion de hasta 4.096 tokens por respuesta implica tiempos de decodificacion largos en comparacion con salidas cortas, especialmente en GPU de gama baja.
- Entrenamiento: el adaptador LoRA (r=64 sobre todas las proyecciones) es entrenable en una sola GPU de 24 GB con el base congelado, aunque GRPO con 16 muestras por prompt exige memoria adicional para las rollouts.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este checkpoint, por lo que la comparacion se limita a aspectos verificables de formato, licencia y disponibilidad.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| reasoning-cues/smollm3-rl | Adaptador LoRA de RL (GRPO/RLVR) sobre SmolLM3-3B-Base | Aprox. 3B (base) + adaptador de 0,5 GB | No disponible | Apache-2.0 | HuggingFace, 0 descargas, 0 likes | No publicado |
| HuggingFaceTB/SmolLM3-3B-Base | Modelo base completo, decoder-only | Aprox. 3B | No disponible en la informacion proporcionada | Apache-2.0 | HuggingFace (referenciado como base) | No disponible en esta ficha |
| Otros instruct de ~3B (por ejemplo Qwen, Llama) | Modelo completo con ajuste por instrucciones | Aprox. 3B | No disponible | Variables segun modelo | Ampliamente disponibles | No comparable con los datos disponibles |

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere descargar SmolLM3-3B-Base y fusionar o cargar el adaptador con peft. Un `from_pretrained` directo del repositorio no produce un modelo funcional por si solo.
- Entrenamiento restringido al split de train de MATH (7.393 problemas, en ingles). No hay evidencia de generalizacion a otros dominios, tareas ni idiomas.
- Riesgo de contaminacion de evaluacion: el modelo se entrena sobre MATH train, de modo que cualquier evaluacion sobre ese mismo split mide memorizacion, no capacidad de generalizacion.
- La recompensa solo comprueba la respuesta final, no la validez del razonamiento intermedio. Es esperable encontrar trazas con pasos incorrectos que terminan en una respuesta correcta, o viceversa.
- Ausencia de termino KL en el entrenamiento: puede producirse deriva respecto a la distribucion del modelo base y degradacion de capacidades generales de lenguaje y de otros idiomas.
- Dependencia estricta del formato: fuera del prompt RL-Zero y del formato `Answer: $Answer`, el comportamiento es incierto. Los tokens de parada documentados deben aplicarse para evitar que el modelo continue generando el siguiente problema.
- Limite de 4.096 tokens de completion con penalizacion de truncamiento: problemas que requieran trazas mas largas pueden quedar sin respuesta valida.
- Modelo base de tipo Base, sin ajuste de seguridad ni alineacion de utilidad: puede generar contenido inapropiado, repetir datos de entrenamiento o producir texto danino sin filtros propios.
- Alucinacion: previsible en razonamiento matematico, especialmente en problemas fuera de la distribucion de MATH train. No se ha medido la tasa de error.
- Idiomas: no documentados. Es razonable esperar que el ajuste degrade el multilingueismo del base, pero no hay datos que lo confirmen.
- Licencia Apache-2.0 en base y adaptador, por lo que el uso comercial esta permitido; conviene verificar la licencia de los datos MATH y de cualquier dataset adicional usado, algo que la model card no detalla.
- Sin senales de validacion de la comunidad: 0 descargas y 0 likes. El checkpoint no ha sido replicado ni auditado por terceros.
- La etiqueta `reasoning-registers` no viene acompanada de explicacion metodologica en la model card, por lo que no es posible evaluar en que consiste ese componente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/reasoning-cues/smollm3-rl
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base
- Libreria PEFT: https://huggingface.co/docs/peft
- Libreria TRL (GRPO): https://huggingface.co/docs/trl
- No se han encontrado en la busqueda web enlaces tecnicos relevantes sobre este checkpoint (los resultados devueltos corresponden a definiciones de diccionario del termino "reasoning" y no guardan relacion con el modelo).
