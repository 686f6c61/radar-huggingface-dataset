# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed3

## Resumen

El modelo `jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed3` es un adaptador LoRA (PEFT) sobre SmolLM2-360M-Instruct, desarrollado por el usuario jekunz como parte de un experimento de investigacion sobre transferencia linguistica entre lenguas nordicas de bajos recursos. El adaptador se entrena en dos fases: primero sobre el subconjunto de noruego nynorsk de FineWeb-2 y despues sobre el subconjunto de feroes del mismo corpus, con el objetivo de aprovechar el conocimiento adquirido en nynorsk para mejorar el modelado del feroes.

Se trata de un experimento de investigacion sin evaluacion publica amplia, y el propio autor lo declara como tal. El modelo base es SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parametros con ventana de contexto de 2048 tokens. El adaptador LoRA emplea rank 256 y alpha 512 sobre las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj`, lo que supone un rango inusualmente alto para este tamano de modelo.

Su relevancia actual reside en el interes por tecnicas de transferencia cross-lingual de bajo coste para lenguas con pocos datos, como el feroes (aproximadamente 70.000 hablantes). El modelo se publica bajo licencia Apache 2.0 y el repositorio ocupa 0,4 GB, lo que refleja que solo contiene los pesos del adaptador y no el modelo base completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 360M en el modelo base; el adaptador LoRA anade un subconjunto no especificado (repo de 0,4 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima de entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Feroes (fo); entrenado con transferencia desde noruego nynorsk |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base SmolLM2-360M-Instruct |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-360M-Instruct, un transformer decoder-only de 360 millones de parametros. Sobre el se aplica un adaptador LoRA con rank 256, alpha 512 y modulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de las capas MLP y la proyeccion de salida de atencion. El entrenamiento se realiza en dos etapas secuenciales: una primera epoca sobre el subconjunto de noruego nynorsk de FineWeb-2 y cinco epocas sobre el subconjunto de feroes del mismo corpus, partiendo del adaptador ya entrenado en nynorsk (`jekunz/smollm-360m-lora-fineweb-norwegian-nynorsk`).

Los hiperparametros de entrenamiento incluyen learning rate de 8e-4 con scheduler coseno, warmup ratio de 0,05, batch size de 8 con acumulacion de gradientes de 32 pasos (batch efectivo de 256), longitud maxima de 2048 tokens y semilla 3, una de tres semillas de entrenamiento para esta configuracion. El entrenamiento se ejecuto en una unica GPU A100 de 40 GB. No se documenta el numero total de tokens procesados ni si hubo etapas de alineacion adicionales (RLHF/DPO) mas alla de las del modelo base instruct.

## Capacidades

- Generacion de texto en feroes, con posible transferencia parcial de capacidades desde noruego nynorsk.
- Modelado de lenguaje y continuacion de texto sobre el corpus FineWeb-2 en feroes.
- Conversacion basica heredada del modelo base SmolLM2-360M-Instruct.
- Capacidades multilingues limitadas: el adaptador esta especializado en feroes; el modelo base conserva cierto multilingueismo pero no se ha evaluado tras el ajuste.
- Soporte de tool calling: no documentado para este adaptador.
- Razonamiento multi-paso y uso como agente: no documentado ni evaluado.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Investigacion en transferencia cross-lingual: el adaptador sirve como punto de partida para estudiar como el preentrenamiento en nynorsk afecta al modelado del feroes, comparando con las otras semillas del mismo experimento.
- Generacion de texto auxiliar en feroes: continuacion de frases, parafraseo o generacion de borradores en un idioma con escasos recursos donde los modelos grandes suelen tener cobertura limitada.
- Aumento de datos para PLN en feroes: generacion de texto sintetico para ampliar corpus de entrenamiento de modelos especificos de la lengua.
- Experimentos de destilacion o adaptacion de bajo coste: el adaptador ocupa 0,4 GB y puede aplicarse sobre el modelo base en hardware modesto, lo que facilita iteraciones rapidas en investigacion.
- Evaluacion comparativa de estrategias de transferencia: al existir tres semillas de la misma configuracion, permite analizar la varianza del entrenamiento en lenguas de bajos recursos.
- Prototipado de asistentes conversacionales en feroes: con las limitaciones propias de un modelo de 360M, puede servir para demos y pruebas de concepto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "no ha sido evaluado ampliamente todavia".

## Requisitos de hardware

- El adaptador LoRA ocupa 0,4 GB y se aplica sobre SmolLM2-360M-Instruct, cuyos pesos en fp16 rondan los 0,7 GB.
- Inferencia en fp16: aproximadamente 1,5-2 GB de VRAM incluyendo overhead, por lo que cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en GPUs integradas con suficiente memoria compartida.
- Cuantizacion a 4 bits del modelo base: menos de 1 GB de VRAM, viable en CPU con llama.cpp u Ollama si se fusiona el adaptador con el base.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, vLLM y TGI tras fusionar los pesos (merge), llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles; para un modelo de 360M en una GPU moderna se espera un throughput alto, pero no hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Evaluacion publica |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-360M + LoRA feroes) | 360M | 2048 | Feroes | Apache 2.0 | No |
| SmolLM2-360M-Instruct (base) | 360M | 2048 | Multilingue | Apache 2.0 | Si |
| Adaptador nynorsk del mismo autor | 360M | 2048 | Noruego nynorsk | Apache 2.0 | No |
| Modelos especificos de feroes de mayor tamano | No disponible | No disponible | Feroes | No disponible | No disponible |

La comparacion directa con alternativas especificas de feroes no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia principal es la especializacion en feroes a costa de posibles perdidas de capacidad general y de instrucciones.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion publica: el autor advierte que no ha sido evaluado ampliamente, por lo que su calidad en tareas reales es desconocida.
- Riesgo elevado de alucinacion y de degradacion del instruction following tras el ajuste sobre corpus web, ya que el entrenamiento se realizo sobre FineWeb-2 sin etapas de alineacion adicionales.
- Sesgos inheridos del corpus FineWeb-2, que es texto web sin filtrar por calidad ni sesgo.
- Cobertura limitada al feroes: no se garantiza un comportamiento correcto en otros idiomas tras el ajuste.
- Ventana de contexto de solo 2048 tokens, insuficiente para tareas de contexto largo.
- El adaptador requiere el modelo base SmolLM2-360M-Instruct y no funciona de forma autonoma; hay que fusionar o cargar ambos.
- Tamano de 360M: capacidad de razonamiento y conocimiento factual muy limitada en comparacion con modelos de varios miles de millones de parametros.
- Licencia Apache 2.0 permite uso comercial, pero la falta de evaluacion desaconseja su uso en produccion sin validacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-nynorsk-seed3
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-norwegian-nynorsk
- Modelo base original: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Dataset: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
