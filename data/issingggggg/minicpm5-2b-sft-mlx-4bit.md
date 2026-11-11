# Issingggggg/MiniCPM5-2B-SFT-MLX-4bit

## Resumen

MiniCPM5-2B-SFT-MLX-4bit es una cuantizacion de 4 bits del modelo openbmb/MiniCPM5-2B-SFT, publicada por el usuario Issingggggg, empaquetada en formato MLX para su ejecucion nativa en Apple Silicon. No se trata de un modelo nuevo ni de un fine-tuning: es una conversion de pesos mediante `mlx_lm.convert` con cuantizacion afin de grupo 64, que reduce el artefacto de 4,7 GB en bf16 a aproximadamente 1,3 GB en disco. El modelo base pertenece a la familia MiniCPM del equipo de OpenBMB, orientada a modelos compactos de alta eficiencia.

La arquitectura subyacente es un transformer denso tipo `LlamaForCausalLM` con 42 capas, dimension oculta de 2048, 16 cabezas de atencion y un vocabulario de 130.560 tokens, con una longitud de contexto declarada de 131.072 tokens. Con 2.516.756.480 parametros totales, el modelo se posiciona en la franja de los 2B, un segmento donde prima la ejecucion local y el coste reducido frente a la capacidad de razonamiento de modelos mayores.

Su relevancia practica radica en que permite ejecutar un modelo conversacional y de generacion de codigo completamente offline en un Mac, sin GPU dedicada, con un consumo de memoria moderado. El autor reporta resultados medidos sobre HumanEval (72,6% en single shot) que lo situan como una opcion viable para tareas de generacion de funciones aisladas, siempre que se acepten las limitaciones propias de su tamano y de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`LlamaForCausalLM`), 42 capas, hidden 2048, 16 cabezas, vocab 130560 |
| Parametros totales | 2.516.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | 4 bits (afin, group size 64, ~4.501 bits por peso); base disponible en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 4-bit cuantizado |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo decoder-only con la estructura clasica de Llama: 42 capas, 16 cabezas de atencion, dimension oculta de 2048 y un vocabulario extenso de 130.560 tokens. Esta ficha corresponde a la variante SFT (supervised fine-tuning) del modelo base, aunque la informacion disponible no detalla la composicion del dataset de instrucciones, el numero de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO adicionales.

La innovacion tecnica de este artefacto concreto no reside en la arquitectura, sino en el proceso de cuantizacion: se aplico `mlx_lm.convert` con cuantizacion afin de 4 bits y grupo de 64, manteniendo el dtype bfloat16 como base. El resultado ocupa 1,3 GB frente a los 4,7 GB del modelo original, lo que habilita la inferencia en memoria unificada de los chips Apple. El autor documenta el comando exacto de reproduccion, lo que permite regenerar el artefacto de forma determinista.

## Capacidades

- Generacion de texto conversacional con plantilla de chat instructiva.
- Generacion de codigo, especialmente funciones aisladas y tareas de programacion de alcance corto.
- Razonamiento basico con modo de "thinking": el modelo suele anteponer texto de razonamiento a la respuesta final.
- Soporte de contexto largo de hasta 131.072 tokens a nivel arquitectonico.
- Capacidad multilingue limitada: la model card declara unicamente ingles.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- No dispone de vision ni audio: es un modelo exclusivamente de texto.

## Casos de uso

- Generacion de funciones de codigo en local: el modelo alcanza un 72,6% de pass rate en HumanEval en single shot, adecuado para autocompletar funciones sueltas en un editor o script sobre un Mac sin conexion.
- Asistente de programacion offline: integrable en un flujo de trabajo de desarrollo en Apple Silicon mediante `mlx-lm`, sin enviar codigo a servicios externos, lo que resulta util en entornos con requisitos de confidencialidad.
- Reparacion de codigo con bucle de verificacion: el autor reporta un 87,8% de pass rate combinando best-of-3 con filtrado de tests y reparacion por reflexion, un patron aplicable a pipelines de generacion y validacion automatica de tests.
- Prototipado rapido de chatbots: con plantilla de chat instructiva y 131.072 tokens de contexto, sirve para construir demos conversacionales locales de bajo coste.
- Educacion y experimentacion: su tamano de 1,3 GB y su licencia Apache-2.0 lo hacen apropiado para ensenar tecnicas de cuantizacion, evaluacion de codigo y despliegue en hardware de consumo.
- Procesamiento de documentos largos en ingles: el contexto de 131.072 tokens permite resumir o extraer informacion de textos extensos, aunque el tamano del modelo limita la calidad en tareas de razonamiento complejo.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de precision de 4 bits frente a bf16 en tareas de codigo (el autor reporta ~11,5 puntos porcentuales de caida en single shot).

## Benchmarks y rendimiento

Resultados medidos por el autor sobre las 164 tareas de HumanEval, decodificacion greedy, `max_tokens=400`, con el arnes de flux-spark:

| Configuracion | Pass rate |
|---|---|
| Single shot | 72,6% |
| Best-of-3 con filtrado de tests | 84,8% |
| Best-of-3 + reparacion por reflexion | 87,8% |
| Single shot, HumanEval+ (~80x tests) | 68,9% |
| Bucle completo, HumanEval+ | 79,9% |

El autor indica que la cuantizacion a 4 bits supone una perdida de ~11,5 puntos porcentuales frente a bf16 en single shot (p<0,003), recuperable en gran medida con un bucle de verificacion (-2,4 pp, no significativo con 164 tareas). No se han publicado resultados de MMLU, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 1,3 GB de pesos en 4 bits; en la practica, entre 2 y 3 GB de memoria unificada considerando KV cache y overhead de inferencia.
- GPU recomendadas: chips Apple Silicon (series M1, M2, M3, M4) con memoria unificada; el modelo esta disenado especificamente para MLX y no para CUDA.
- Cabe en GPU de consumo: si, en cualquier Mac con Apple Silicon y al menos 8 GB de memoria unificada; tambien es viable en Macs con 16 GB sin problemas.
- Opciones de despliegue: `mlx-lm` (libreria nativa del artefacto). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este formato MLX concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MiniCPM5-2B-SFT-MLX-4bit (este) | 2,52B | 131.072 | MLX 4-bit | Apache-2.0 | Optimizado para Apple Silicon, HumanEval 72,6% single shot |
| openbmb/MiniCPM5-2B-SFT | 2,52B | 131.072 | safetensors bf16 | Apache-2.0 | Modelo base sin cuantizar; ~4,7 GB |
| Alternativas de 2B en formato GGUF | no disponible | no disponible | GGUF | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks de terceros que permitan una comparacion cuantitativa con otros modelos de 2B en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo tiene 2B parametros: su zona de confort es la generacion de funciones aisladas; refactorizaciones a nivel de proyecto, trabajo multi-archivo y contextos largos quedan fuera de su alcance real.
- La cuantizacion a 4 bits degrada la precision: el autor mide ~11,5 puntos porcentuales de caida en HumanEval single shot frente a bf16.
- El modelo tiende a anteponer texto de "thinking" a las respuestas; es necesario eliminarlo o instruir explicitamente al modelo para evitarlo.
- Pasar una cadena cruda a `mlx_lm.generate` sin aplicar la plantilla de chat provoca degeneracion y parroting del prompt; es obligatorio usar `apply_chat_template`.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta documentado.
- No se anadio ningun ajuste de seguridad en esta conversion; hereda los sesgos y comportamientos del modelo base.
- Riesgo de alucinacion inherente a un modelo de 2B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda citar el trabajo original de MiniCPM segun indica el autor.
- El artefacto esta atado al ecosistema MLX: no es portable directamente a CUDA ni a otros runtimes sin reconversion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Issingggggg/MiniCPM5-2B-SFT-MLX-4bit
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-SFT
- Arnes de evaluacion flux-spark: https://github.com/Yifeihuang-Dev/flux-spark
- Libreria MLX-LM: https://github.com/ml-explore/mlx-lm
