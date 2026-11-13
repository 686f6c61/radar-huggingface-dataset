# lucrbrtv/Modeline-584B-A17B

## Resumen

Modeline-584B-A17B es un adaptador LoRA de rango 32 desarrollado por el usuario lucrbrtv sobre el modelo base thinkingmachines/Inkling-2-Small, un transformer con mezcla de expertos (MoE) de la familia Inkling de Thinking Machines. El adaptador se ha entrenado con aprendizaje por refuerzo (GRPO) para jugar a Celeste Classic en tiempo real dentro del benchmark CelesteBench, un entorno que evalúa la capacidad de un modelo de actuar como agente sobre un videojuego de plataformas con observaciones de imagen y texto.

El interés técnico del artefacto no reside en sus resultados de juego, sino en que documenta con detalle el flujo de entrenamiento RL sobre un MoE de gran tamaño mediante Tinker, la plataforma de ajuste de Thinking Machines, y expone las fricciones prácticas de servir adaptadores LoRA sobre pesos cuantizados en NVFP4/MXFP8. El adaptador pesa 16,7 GB en float32 y aplica LoRA sobre todas las capas lineales, incluidos los expertos enrutados y la capa de desembebido.

La relevancia actual es doble: por un lado, muestra un caso real de RL con recompensas densas sobre un entorno proceduralmente generado; por otro, sirve como referencia de compatibilidad entre ecosistemas (Tinker, PEFT, vLLM, SGLang) cuando el modelo base no está implementado en transformers. Los resultados son modestos: 1,07 % de puntuación media en CelesteBench frente al 0,65 % del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer MoE (base: thinkingmachines/Inkling-2-Small) |
| Parametros totales | no disponible (el nombre sugiere 584B en el modelo base; no confirmado en la informacion) |
| Parametros activos | no disponible (el nombre sugiere 17B activos; no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se distribuye en float32; los checkpoints publicados del modelo base estan en NVFP4/MXFP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors, layout PEFT con nombres de modulo de Tinker) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Inkling-2-Small, un modelo con arquitectura de mezcla de expertos (MoE) que, segun los nombres de modulo documentados, incluye atencion con proyecciones wq, wk, wv, wr y wo, ademas de un bloque MLP con expertos enrutados (w1, w3 y w2) y una capa de desembebido (unembed) entrenable. El LoRA tiene rango 32 y alpha 32, se aplica sobre todas las capas lineales (atencion, expertos MoE y unembedding) y se almacena en float32, lo que explica los 16,7 GB del repositorio.

El entrenamiento uso GRPO a traves del propio harness de CelesteBench, con tasa de aprendizaje 1e-4. Cada paso jugo 12 salas con 8 rollouts por sala, durante 30 pasos. La funcion de recompensa otorga 1 por salir de la sala, 0,5 por el progreso hacia la salida y una penalizacion de 0,1 si el jugador muere. El conjunto de entrenamiento consistio en unas 500 salas generadas proceduralmente, verificadas como resolubles y filtradas para descartar cualquiera demasiado proxima a las salas del benchmark, evitando asi la contaminacion de la evaluacion.

## Capacidades

- Generacion de texto y razonamiento multimodal imagen-texto, heredados del modelo base (pipeline image-text-to-text).
- Control de agente en tiempo real sobre un videojuego de plataformas: el adaptador produce acciones de juego a partir de observaciones visuales y contexto textual.
- Modo de pensamiento configurable: las evaluaciones oficiales se ejecutaron con thinking en nivel "low".
- Capacidad de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-paso: parcial, limitado al bucle de decision por fotograma del entorno CelesteBench.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales adicionales (audio, vision de documentos, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en RL sobre entornos de juego: el adaptador y su receta (GRPO, recompensa densa, salas procedurales) sirven como plantilla reproducible para entrenar agentes sobre emuladores o entornos con observaciones visuales.
- Evaluacion de agentes visuales en tiempo real: permite medir latencia de decision, longitud de respuesta y coste por accion en un bucle cerrado, algo dificil de reproducir con benchmarks estaticos.
- Estudio de serving de LoRA sobre MoE cuantizado: el repositorio documenta explicitamente los requisitos de pesos BF16 para adaptadores sobre expertos enrutados, util para equipos que despliegan con vLLM o SGLang.
- Experimentacion con Tinker: sirve como ejemplo funcional de importacion de pesos externos (external-weights upload) y de carga de estado en un cliente de entrenamiento LoRA.
- Analisis de recompensas y sesgos de politica: las limitaciones documentadas (recompensa de progreso que cuenta fotogramas en el aire) son un caso de estudio sobre como una funcion de recompensa mal especificada moldea el comportamiento aprendido.
- Referencia de interoperabilidad PEFT/transformers: el mapeo de nombres de modulo entre Tinker y el checkpoint de Hugging Face es util para quien necesite convertir adaptadores entre ecosistemas.

## Benchmarks y rendimiento

Resultados oficiales de CelesteBench RTC (300 s, tiempo real, thinking "low"):

| Modelo | Ejecuciones | Puntuacion media |
|---|---|---|
| GPT 6.1 Sol (medium) | 1 | 3,33 % |
| GPT 6 Astra | 4 | 1,96 % |
| Modeline-584B-A17B | 5 | 1,07 % |
| Inkling 2 Small (base) | 7 | 0,65 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM para el adaptador: 16,7 GB solo para los pesos LoRA en float32; a esto se suma el modelo base completo, cuyos requisitos no se detallan en la informacion disponible.
- Pesos del modelo base: los checkpoints publicados estan en NVFP4/MXFP8; para servir el adaptador sobre los expertos enrutados se necesita un checkpoint en BF16, lo que incrementa sustancialmente los requisitos de memoria.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del modelo base cabe esperar nodos multi-GPU de clase A100/H100, pero no se confirma.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del modelo base y la necesidad de BF16 para los expertos hacen improbable su ejecucion en una sola GPU de consumo.
- Opciones de despliegue: Tinker (importacion de pesos externos, experimental y sujeta a habilitacion por organizacion); vLLM y SGLang quedan bloqueados hasta disponer de un checkpoint BF16; PEFT/TRL no es posible porque transformers no implementa Inkling 2 Small.
- Latencia y throughput: no se publican cifras; la model card indica que las respuestas del adaptador son mas largas que las del base (unas 440 frente a 180 tokens por decision), por lo que cada decision es mas lenta y costosa.

## Comparativa con modelos similares

| Modelo | Tipo | Puntuacion CelesteBench | Licencia | Disponibilidad |
|---|---|---|---|---|
| Modeline-584B-A17B | LoRA sobre MoE (Inkling-2-Small) | 1,07 % | Apache 2.0 | Pesos en HF; serving limitado a Tinker |
| Inkling 2 Small | MoE base | 0,65 % | no disponible | Checkpoints NVFP4/MXFP8 en HF |
| GPT 6 Astra | Modelo propietario | 1,96 % | propietaria | API |
| GPT 6.1 Sol (medium) | Modelo propietario | 3,33 % | propietaria | API |

La comparacion se limita al benchmark CelesteBench, unica metrica publicada. No hay datos comparativos de parametros, contexto o rendimiento general frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- El adaptador es mas fiable que el modelo base, no mas capaz: alcanza de forma consistente la cima del primer pilar (5 de 5 ejecuciones frente a 2 de 7 del base), pero nunca progresa mas alla.
- Las respuestas son aproximadamente 2,4 veces mas largas que las del modelo base (unas 440 frente a 180 tokens por decision), lo que aumenta latencia y coste por accion.
- La recompensa de progreso contabilizo fotogramas con el jugador en el aire, de modo que la politica aprendio en parte a saltar hacia la salida en lugar de aterrizar mas alto; es un sesgo de especificacion de recompensa documentado por el autor.
- El flujo de importacion en Tinker no pudo probarse de extremo a extremo porque la carga de pesos externos no estaba habilitada en la organizacion del autor.
- Los archivos no cargan con PeftModel.from_pretrained sobre el checkpoint de Hugging Face tal cual: usan nombres de modulo de Tinker y requieren renombrado y aplicacion manual de los LoRA de expertos (delta W = B·A·alpha/r) o fusion sobre pesos desquantizados.
- El serving en vLLM/SGLang requiere un checkpoint BF16 de los expertos que no esta publicado.
- No se dispone de informacion sobre sesgos generales, idiomas soportados ni comportamiento fuera del dominio del juego; el adaptador esta especializado en Celeste Classic y no debe usarse como modelo de proposito general.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero las condiciones del modelo base y de Tinker deben verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lucrbrtv/Modeline-584B-A17B
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Tinker (plataforma de entrenamiento): https://thinkingmachines.ai/tinker/
- CelesteBench: https://celestebench.lucrbvi.com
