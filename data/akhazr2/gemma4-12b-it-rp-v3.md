# akhazr2/gemma4-12b-it-rp-v3

## Resumen

`akhazr2/gemma4-12b-it-rp-v3` es un adaptador LoRA para `google/gemma-4-12B-it`, afinado por el usuario akhazr2 para generacion de texto orientada a roleplay de personajes. El repositorio contiene unicamente los pesos del adaptador (0,6 GB), no los pesos fusionados, y se entrenó el 2 de noviembre de 2026 como experimento interno (run 3). Su relevancia es acotada: es un fine-tune de nicho, con cero descargas y cero likes en el momento de la consulta, y sin evaluacion en benchmarks estandar.

El modelo hereda la arquitectura y el contexto del base Gemma 4 12B IT (no se detallan en la informacion disponible), y anade un ajuste supervisado sobre 9.941 muestras: 7.400 de roleplay de un solo turno, 41 ventanas multiturno y 2.500 de instrucciones generales de FineTome-100k (aproximadamente el 25 % del total). El adaptador afecta solo al decodificador de texto (q/k/v/o y gate/up/down); las torres de vision y audio del modelo base quedan intactas.

La ficha resulta util para quien evalue si merece la pena reutilizar este adaptador frente al modelo base o frente a otros fine-tunes de roleplay de Gemma 4. Los datos disponibles se limitan a la perdida de evaluacion (1,441 en la epoca 2, perplejidad 4,23), la receta de entrenamiento y las limitaciones declaradas por el autor; no hay resultados de MMLU, HumanEval, GSM8K ni IFEval.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre `google/gemma-4-12B-it`; arquitectura del base no detallada en la informacion disponible |
| Parametros totales | 12,09 B (modelo base); adaptador de 131,1 M |
| Parametros activos | no disponible (no se indica que el base sea MoE) |
| Longitud de contexto | no disponible para el base; entrenamiento con secuencias de 4.096 tokens |
| Tipos de cuantizacion | el adaptador se entrena en bf16 sin cuantizar; no se publican pesos GGUF ni cuantizaciones del adaptador |
| Idiomas soportados | no disponible (la model card no los declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptador PEFT (safetensors, presumiblemente, segun el estandar de PEFT); no incluye pesos fusionados |

## Arquitectura y entrenamiento

El adaptador se entrena con Axolotl 0.21.1 en precision bf16, sin cuantizacion, con rango LoRA 32, alpha 64, dropout 0 y aplicado exclusivamente al decodificador de texto (q/k/v/o y gate/up/down). Los modulos de vision y audio del modelo base no se tocan. Se usan 131,1 M parametros entrenables de 12,09 B (1,08 %). El entrenamiento emplea tasa de aprendizaje 1e-4 con scheduler coseno y 3 % de warmup, 2 epocas (1.218 pasos), batch efectivo 16 (micro batch 1 x acumulacion 16), optimizador adamw_torch_8bit, weight decay 0,0 y max grad norm 0,1. La atencion usa SDPA, ya que flex_attention falla en Blackwell sm_120 y flash-attn no estaba instalado. La perdida se calcula solo sobre turnos del asistente, con la plantilla de chat `gemma4` y token eot `<turn|>`. El entrenamiento completo se ejecuto en una RTX 5090 de 32 GB con un pico de 24,1 GiB y una duracion de 3 h 27 min.

Los datos proceden de `akhazr/gemma4-rp-sft-cleaned` (`train_v3.jsonl`, privado): 7.400 muestras de roleplay de un solo turno (como maximo una por personaje, priorizando las de rating 5), 41 ventanas multiturno de dos chats internos largos y 2.500 muestras generales de `mlabonne/FineTome-100k`. Antes del muestreo se aplico un filtro de seguridad basado en palabras clave que elimino unas 90.000 muestras explicitas con senales de menores (edades inferiores a 18, terminos escolares, familiares o de franquicias con presencia de menores) o de personas reales; el filtro sobreelimina por diseno. Parte de los datos de origen fue generada por modelos de terceros, cuyos terminos deben revisarse antes de cualquier publicacion externa. La perdida de evaluacion (split retenido del 2 %, 199 muestras) baja de 4,073 (base) a 1,449 en la epoca 1 y 1,441 en la epoca 2; la perdida de entrenamiento final es 1,269.

## Capacidades

- Generacion de texto conversacional orientada a roleplay de personajes, con formato de acciones en texto plano, dialogo entre comillas y pensamientos entre asteriscos.
- Mantiene capacidad de instrucciones generales gracias al 25 % de muestras de FineTome-100k en el entrenamiento.
- No se entrena con bloques de pensamiento (thinking mode): el autor indica que se entreno sin ellos.
- Tool calling y function calling: no disponible (no se menciona en la informacion proporcionada).
- Capacidades de agente y razonamiento multi-paso: no disponibles como objetivo de entrenamiento; el autor senala que la coherencia multiturno larga no fue un objetivo.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Vision y audio: el adaptador no modifica esas torres, por lo que el modelo conserva las capacidades multimodales del base en la medida en que este las tenga; no se detallan.

## Casos de uso

- Prototipado de personajes conversacionales: el adaptador puede cargarse sobre el base con PEFT y usarse para generar respuestas de un personaje concreto en demos o pruebas internas, dado que el entrenamiento prioriza muestras de un solo turno por personaje.
- Evaluacion comparativa de fine-tunes de roleplay: sirve como punto de referencia frente al base y frente a otros adaptadores de Gemma 4 (por ejemplo, `ChatoyantAI/Gemma-4-12B-Roleplay-7525-SFT`) para medir perdida de evaluacion y calidad percibida.
- Investigacion sobre filtrado de datos: la receta documenta un filtro por palabras clave que descarto unas 90.000 muestras; util para estudiar el impacto del sobrefiltrado en la calidad final.
- Generacion de dialogos para guiones o narrativa interactiva: con temperatura 0,8-1,0 y min-p 0,05, el modelo produce respuestas de personaje en el formato indicado, adecuado para borradores de guion.
- Base para experimentos de destilacion o mezcla de adaptadores: al ser un adaptador LoRA de 131,1 M sobre un base de 12,09 B, se puede combinar o comparar con otros adaptadores del mismo base en pipelines de investigacion.
- Ajuste fino adicional sobre dominio especifico: el adaptador puede servir de punto de partida para un SFT posterior con datos propios, dado su bajo coste de almacenamiento (0,6 GB) y su licencia Apache 2.0.

## Benchmarks y rendimiento

| Punto | Perdida de evaluacion | Perplejidad de evaluacion |
|---|---|---|
| Modelo base (antes de entrenar) | 4,073 | 58,7 |
| Fin de epoca 1 (`epoch-1`, paso 610) | 1,449 | 4,26 |
| Fin de epoca 2 (`main`) | 1,441 | 4,23 |

Perdida de entrenamiento final: 1,269. Conjunto de evaluacion: split retenido del 2 % (199 muestras). No se han publicado resultados de MMLU, HumanEval, GSM8K, IFEval ni de diversidad de respuestas (swipe diversity) o slop en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento en bf16 con secuencias de 4.096 tokens alcanzo un pico de 24,1 GiB en una RTX 5090 de 32 GB. La inferencia en bf16 del base de 12,09 B requiere del orden de 24 GB de VRAM solo para pesos, mas cache KV; con cuantizacion de 8 bits o 4 bits del base podria reducirse, aunque el adaptador se distribuye en bf16.
- GPU recomendadas: RTX 5090 (32 GB) validada para entrenamiento; para inferencia en bf16 se necesitan GPU de 24 GB o mas (RTX 4090, A100 40 GB, H100). No hay datos de latencia ni throughput.
- Cabe en GPU de consumo: si, en RTX 5090 (32 GB) para entrenamiento; en RTX 4090 (24 GB) para inferencia en bf16 es ajustado y depende de la longitud de contexto efectiva del base. No se confirma para GPUs de 16 GB o menos.
- Opciones de despliegue: PEFT + Transformers (ejemplo de la model card con `AutoModelForMultimodalLM` y `PeftModel`); vLLM, llama.cpp, Ollama o TGI no se mencionan en la informacion disponible, y al ser un adaptador PEFT sin GGUF publicado, su uso en llama.cpp u Ollama requeriria conversion previa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `akhazr2/gemma4-12b-it-rp-v3` | 12,09 B base + 131,1 M adaptador | no disponible (entrenado a 4.096) | perdida eval 1,441; perplejidad 4,23 | Apache 2.0 | adaptador PEFT, 0 descargas |
| `google/gemma-4-12B-it` (base) | 12,09 B | no disponible | perdida eval 4,073; perplejidad 58,7 | no disponible en la informacion | modelo base publico |
| `ChatoyantAI/Gemma-4-12B-Roleplay-7525-SFT` | no disponible | no disponible | no disponible | no disponible | referenciado como guia de la receta |

No se dispone de datos de benchmarks ni de contexto de los modelos comparables en la informacion proporcionada; la comparacion se limita a la perdida de evaluacion reportada por el autor para el base y el adaptador.

## Limitaciones y advertencias

- El conjunto de datos esta dominado por muestras de un solo turno, por lo que la coherencia en conversaciones multiturno largas no fue un objetivo de entrenamiento.
- No se ha evaluado en benchmarks generales (IFEval, GSM8K) ni en metricas de diversidad de respuestas o slop; solo se reporta perdida de evaluacion.
- La tasa de aprendizaje (1e-4) es superior a la de otros fine-tunes de roleplay de Gemma 4 (en torno a 1e-5), lo que puede implicar perdida de capacidades generales; el autor recomienda comparar contra el modelo base.
- El contenido de entrenamiento incluye roleplay para adultos (18+), filtrado para eliminar contenido sexual con menores o personas reales; el filtro es por palabras clave y sobreelimina, por lo que no garantiza ausencia total de casos problematicos.
- Parte de los datos de origen fue generada por modelos de terceros; deben revisarse los terminos de esos proveedores antes de cualquier publicacion externa.
- La licencia del adaptador es Apache 2.0, pero la del modelo base (`google/gemma-4-12B-it`) no se detalla en la informacion disponible; verificar los terminos del base antes de uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el autor lo describe como experimento interno; no hay evidencia de validacion por terceros.
- No se declaran idiomas soportados, por lo que el rendimiento fuera del ingles (idioma presumible de los datos) es incierto.
- El adaptador se entrena sin bloques de pensamiento; no se debe esperar un modo de razonamiento explicito.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/akhazr2/gemma4-12b-it-rp-v3
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Receta de referencia: https://huggingface.co/ChatoyantAI/Gemma-4-12B-Roleplay-7525-SFT
- Dataset de entrenamiento (privado): https://huggingface.co/datasets/akhazr/gemma4-rp-sft-cleaned
- Dataset de instrucciones generales: https://huggingface.co/datasets/mlabonne/FineTome-100k
