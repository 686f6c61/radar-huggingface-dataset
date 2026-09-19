# SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-3ep

## Resumen

`SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-3ep` es un ajuste fino supervisado (SFT) sobre `Qwen/Qwen3-1.7B` orientado a agentes que resuelven tareas en el entorno ScienceWorld, un simulador de experimentos cientificos interactivo. Lo desarrolla el usuario SeanWang0027 y forma parte de un estudio comparativo entre SFT sobre trayectorias de un profesor y aprendizaje por refuerzo online (ROSE). Concretamente, el modelo se entrena con 2059 episodios completos generados por `gpt-5.4-mini` (API de OpenAI, `reasoning_effort=medium`) sobre las 2059 variaciones de tarea del split de entrenamiento de ScienceWorld, con un maximo de 30 turnos por episodio y una tasa de exito del profesor del 41,96%.

El modelo es un transformer denso decoder-only de la familia Qwen3, con 2.031.739.904 parametros totales segun los pesos en safetensors (el nombre comercial del modelo base indica 1,7B, pero el recuento real del checkpoint es de aproximadamente 2,03B, presumiblemente por la inclusion de las matrices de embeddings). El repositorio ocupa 4,1 GB y almacena los pesos en bf16 dentro del checkpoint de la epoca 3. La relevancia actual radica en que es un artefacto de investigacion reproducible sobre destilacion de trayectorias de agente: publica la receta de entrenamiento completa, el formato de prompt ReAct, la evaluacion con 4 pasadas independientes y su limitacion conocida mas importante, que el propio autor documenta sin ocultarla.

Su interes practico no es la generacion de texto generalista, sino servir como punto de partida para agentes de razonamiento secuencial en entornos con acciones discretas, y como referencia cuantitativa frente a la variante entrenada con ROSE online, que obtiene resultados superiores con los mismos datos de partida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (familia Qwen3), sin componentes MoE |
| Parametros totales | 2.031.739.904 (segun safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la model card; el entrenamiento se realizo con `max_length` 8192 |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se publican variantes GGUF cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de la epoca 3, almacenado en bf16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-1.7B`, un transformer denso decoder-only, y se ajusta mediante aprendizaje supervisado estandar con entropia cruzada. Los datos son 2059 episodios ReAct completos jugados por `gpt-5.4-mini` sobre las 2059 variaciones de tarea del split de entrenamiento de ScienceWorld, un episodio por variacion y como maximo 30 turnos, lo que suma 46035 turnos de profesor supervisados. No se filtro ni enmascaro nada: se incluyen tanto los episodios fallidos como los turnos que el simulador rechazo. Cada fila de entrenamiento corresponde a un episodio completo y la perdida se calcula unicamente sobre la respuesta visible del profesor y su token `<|im_end|>`; las observaciones, la instruccion y la cabecera del asistente actuan solo como contexto. No se utiliza el razonamiento oculto del profesor, solo su respuesta visible.

La configuracion de entrenamiento es de 3 epocas (192 pasos), batch de 32, AdamW con learning rate 1e-5, weight decay 0, schedule coseno con 10% de warmup, entrenamiento en fp32 y longitud maxima de 8192 tokens. El checkpoint publicado corresponde a la epoca 3. La innovacion metodologica no esta en la arquitectura, sino en el diseno experimental: este repositorio es la rama SFT de una comparacion SFT frente a ROSE online, cuya otra rama es `qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep`. El formato de prompt es ReAct: la instruccion de ScienceWorld de AgentGym como turno de usuario, un acuse de recibo prefijado del asistente y un turno de usuario por observacion; el modelo responde con `Thought:\n...\n\nAction:\n<un comando>`. La plantilla de chat de Qwen3 debe aplicarse con `enable_thinking=False`.

## Capacidades

- Generacion de texto conversacional multi-turno dentro de un bucle de agente ReAct.
- Razonamiento secuencial de varios pasos sobre observaciones de un entorno simulado (maximo 30 rondas por episodio).
- Emision de acciones discretas en un formato estricto (`Thought:` seguido de `Action:` con un unico comando).
- Razonamiento cientifico aplicado a tareas de ScienceWorld: experimentos, mediciones, cambios de estado de materiales y objetos.
- Seguimiento de instrucciones largas dentro de la conversacion, con el contexto de la instruccion del entorno mantenido como turno de usuario.
- Inferencia sin modo de razonamiento explicito: la model card indica renderizar con `enable_thinking=False`.
- Compatibilidad declarada con text-generation-inference y endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`).
- No hay evidencia en la informacion disponible de soporte de tool calling generico, function calling, vision, audio ni capacidades multilingues explicitas.

## Casos de uso

- Evaluacion de agentes en ScienceWorld: el modelo esta ajustado exactamente para el protocolo de AgentGym sobre el split de test de 200 variaciones de tarea, por lo que sirve como politica de referencia reproducible con 4 pasadas independientes a temperatura 0,4.
- Baseline en experimentos de SFT frente a RL online: junto con la variante ROSE del mismo autor, permite medir la ganancia de un metodo de refuerzo online sobre el mismo conjunto de trayectorias del profesor.
- Arranque (warm start) para metodos de RL sobre entornos de texto: al estar ya alineado con el formato ReAct y con la distribucion de observaciones de ScienceWorld, reduce el numero de interacciones necesario antes de que la politica produzca acciones validas.
- Generacion de trayectorias sinteticas para aumentar datos de agente: puede desplegarse para producir episodios adicionales que luego se filtren por exito en el simulador, aunque su tasa de exito del 12,88% obliga a un filtrado agresivo.
- Prototipos locales de agentes interactivos en GPU de consumo: con alrededor de 4,1 GB de pesos en bf16 cabe en tarjetas de 8 GB o menos, lo que permite iterar sobre prompts y formatos de accion sin coste de API.
- Estudio de fallos de destilacion: el modelo reproduce el bucle de accion invalida del profesor, lo que lo convierte en un caso de analisis util para investigar como se propagan los sesgos de formato del profesor al alumno.
- Demostraciones educativas de razonamiento cientifico paso a paso: el par `Thought`/`Action` hace explicito el proceso de decision, util para visualizar como un agente planifica experimentos en un entorno controlado.
- Analisis de robustez ante acciones rechazadas: al conservar los turnos rechazados en el entrenamiento, el modelo permite estudiar la recuperacion tras un comando invalido del simulador.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden a la evaluacion en el split de test de ScienceWorld (200 variaciones de tarea, protocolo de AgentGym), con 4 pasadas independientes, temperatura 0,4, 512 tokens por turno, maximo 30 rondas, modo thinking desactivado y sin turno de sistema. El exito se define como puntuacion final de 100; Avg@1 es la puntuacion final media dividida por 100.

| Modelo | Tasa de exito | Avg@1 |
|---|---|---|
| Qwen3-1.7B (base) | 0,12% ± 0,22 | -0,0331 |
| SFT sobre trayectorias de gpt-5.4-mini, 3 epocas (este modelo) | 12,88% ± 1,24 | 0,1557 |
| Online ROSE 10+5 con profesor gpt-5.4-mini, 3 epocas | 17,50% ± 2,29 | 0,2942 |

La comparacion emparejada ROSE menos SFT sobre las tareas, con bootstrap pareado, arroja +4,62 puntos de exito (intervalo [0,75; 8,75]) y +0,139 de Avg@1 (intervalo [0,072; 0,203]). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 4,1 GB solo para pesos en bf16 o fp16; aproximadamente 2,1 GB en cuantizacion de 8 bits y 1,1 GB en 4 bits, a lo que hay que sumar la cache KV correspondiente al contexto utilizado (el entrenamiento uso 8192 tokens como maximo).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060 Ti, 4060, 4070, 3070, 4060 Ti) e incluso en configuraciones de 6 GB con cuantizacion de 4 bits.
- GPU recomendadas para produccion o evaluacion por lotes: A100, H100, L40S o cualquier GPU con 16 GB o mas para ejecutar en bf16 sin cuantizar con margen para el contexto.
- Opciones de despliegue: la model card cita `transformers` con `AutoModelForCausalLM` y `AutoTokenizer`, y las etiquetas del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, por lo que TGI y endpoints compatibles son los caminos soportados. vLLM es viable por tratarse de un modelo Qwen3 denso. No se publican pesos GGUF, de modo que llama.cpp u Ollama requeririan una conversion previa por parte del usuario.
- Latencia y throughput: no disponible, no se han publicado mediciones en la informacion proporcionada.
- Nota de memoria: el repositorio ocupa 4,1 GB, coherente con pesos en bf16 del checkpoint de la epoca 3.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en ScienceWorld (exito) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (SFT, 3 epocas) | 2,03B | No especificado; entrenado con max 8192 | 12,88% ± 1,24 | apache-2.0 | Pesos safetensors en HuggingFace |
| qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep | Mismo base, ~2,03B | No especificado | 17,50% ± 2,29 | apache-2.0 (segun el repositorio hermano) | Pesos en HuggingFace |
| Qwen/Qwen3-1.7B (base, sin ajustar) | ~2,03B | No disponible en la informacion proporcionada | 0,12% ± 0,22 | apache-2.0 | Pesos en HuggingFace |

La comparativa relevante es interna al propio estudio del autor: la variante ROSE supera a esta variante SFT en 4,62 puntos de exito con los mismos datos de partida y el mismo profesor. Frente al modelo base, el ajuste SFT multiplica la tasa de exito por mas de cien, lo que indica que la mayor parte del comportamiento de agente procede de la destilacion de trayectorias.

## Limitaciones y advertencias

- Bucle de accion invalida: el profesor copio literalmente la plantilla de accion del prompt (`open/close OBJ`) en el 29,89% de sus turnos, y este modelo lo reproduce en el 74,88% de los suyos, rara vez escapando del bucle. El propio autor senala que corregir la lista de acciones del prompt y volver a recoger datos probablemente ayudaria mas que cualquier cambio en el entrenamiento.
- Rendimiento absoluto bajo: una tasa de exito del 12,88% en ScienceWorld test limita su uso como agente autonomo en produccion sin supervision o filtrado posterior.
- Los episodios sin el bucle de accion invalida alcanzan un 47,71% de exito, lo que muestra que la limitacion es de formato de prompt y no solo de capacidad del modelo.
- Sesgos heredados del profesor: al entrenarse sobre rollouts de `gpt-5.4-mini`, el modelo destila tanto sus aciertos como sus errores sistematicos de formato y de estrategia.
- Datos de entrenamiento sin filtrar: se incluyeron episodios fallidos y turnos rechazados por el simulador, lo que puede reforzar patrones de comportamiento erroneos.
- Dominio muy restringido: el ajuste esta especializado en ScienceWorld y en el formato ReAct; no hay evidencia de que conserve capacidades generales de conversacion, codigo o matematicas tras el SFT.
- Idioma: no se especifican idiomas soportados en la model card, por lo que no hay garantia de comportamiento en castellano.
- Contexto: no se documenta la ventana de contexto efectiva del checkpoint; el entrenamiento uso 8192 tokens, y se desconoce el comportamiento mas alla de esa longitud.
- Modo thinking: la evaluacion se realizo con thinking desactivado y sin turno de sistema; activarlo puede degradar el rendimiento respecto a las cifras publicadas.
- Riesgo de alucinacion en las trazas de razonamiento: el campo `Thought` es texto libre generado por el modelo y puede contener afirmaciones no verificadas sobre el estado del entorno, aunque la accion final sea la que determina el resultado.
- Escala de evaluacion: los resultados provienen de 4 pasadas sobre 200 tareas, con desviaciones tipicas de entre 1,24 y 2,29 puntos; diferencias pequenas entre modelos deben interpretarse con cautela.
- Licencia: el repositorio y el modelo base se publican bajo apache-2.0, lo que en principio permite uso comercial, pero conviene verificar los terminos aplicables al modelo base Qwen3-1.7B antes de un despliegue en produccion.
- Madurez: el repositorio no tiene descargas ni likes registrados y se creo y actualizo en septiembre de 2026, por lo que no cuenta con validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-sft-gpt54mini-3ep
- Variante ROSE del mismo estudio: https://huggingface.co/SeanWang0027/qwen3-1.7b-sciworld-rose-s10t5-gpt54mini-3ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada (los resultados de la busqueda web no contienen referencias relevantes al modelo).
