# jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-bokmaal-seed2

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) sobre el modelo base `jekunz/smollm-360m-lora-fineweb-norwegian-bokmaal`, que a su vez parte de SmolLM2-360M-Instruct de Hugging Face. El autor, `jekunz`, lo ha entrenado en dos fases: primero un epoch sobre la porcion de noruego bokmal de FineWeb-2 y despues cinco epochs sobre la porcion de feroes del mismo corpus. El objetivo declarado es la transferencia linguistica entre lenguas nordicas de bajos recursos, en este caso del noruego al feroes, y el modelo se presenta como material de investigacion sin evaluacion amplia.

Se trata de un adaptador pequeno (0,4 GB en el repositorio) pensado para generacion de texto y conversacion en feroes (`fo`). La configuracion LoRA es de rango 256 y alpha 512 sobre las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj`, con una longitud de contexto maxima de entrenamiento de 2048 tokens. La semilla 2 indica que forma parte de una serie de tres ejecuciones con la misma configuracion, lo que sugiere un interes en medir la varianza del entrenamiento.

Su relevancia es acotada pero clara: ejemplifica una receta reproducible y de bajo coste (una sola A100 de 40 GB) para adaptar un modelo Instruct de 360M a un idioma con pocos datos, partiendo de un adaptador ya entrenado en una lengua emparentada. No es un modelo de proposito general ni compite con modelos multilingues grandes; es una pieza de investigacion sobre transferencia entre lenguas nordicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-360M-Instruct) con adaptador LoRA; no disponible el detalle interno de la arquitectura base en la informacion proporcionada |
| Parametros totales | 360M en el modelo base; no disponible el numero exacto de parametros entrenables del adaptador (rango 256 sobre 4 modulos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento); no disponible la context window nativa del modelo base |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos del adaptador en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | Feroes (`fo`); el entrenamiento intermedio fue en noruego bokmal |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se distribuye por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-360M-Instruct, un transformer decoder-only de 360M parametros. La innovacion aqui no esta en la arquitectura sino en el procedimiento: un LoRA de rango 256 y alpha 512 (escala efectiva de 2) sobre las proyecciones `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, sobre las capas MLP y la proyeccion de salida de atencion, sin tocar las proyecciones Q/K/V. El entrenamiento se hace en dos etapas secuenciales: 1 epoch en noruego bokmal y 5 epochs en feroes, ambas sobre subconjuntos de FineWeb-2.

Los hiperparametros documentados son learning rate 8e-4 con scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulacion (batch efectivo 256), longitud maxima de 2048 tokens, una A100 de 40 GB y semilla 2. No se documentan volumen de tokens, composicion exacta del dataset, ni si hubo etapas de RLHF o DPO; al partir de un modelo Instruct, cabe esperar que conserve el alineamiento del base, pero no se confirma en la informacion disponible. Tampoco se detalla si se congelaron capas o si se aplico regularizacion adicional.

## Capacidades

- Generacion de texto en feroes, el idioma objetivo del adaptador.
- Conversacion multi-turno heredada del formato Instruct del modelo base SmolLM2-360M-Instruct.
- Transferencia linguistica desde noruego bokmal: el adaptador intermedio actua como inicializacion para el feroes.
- Capacidad multilingue residual del modelo base, no evaluada ni garantizada tras el ajuste.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documentan capacidades de codigo o matematicas especificas para este adaptador.

## Casos de uso

- Investigacion sobre transferencia entre lenguas nordicas: usar el par noruego-feroes como caso controlado para medir cuanto ayuda un adaptador intermedio en una lengua emparentada frente a entrenar directamente desde el modelo Instruct, comparando las tres semillas de la serie.
- Generacion de texto divulgativo en feroes: redaccion de borradores de articulos o resumenes a partir de documentos en feroes, aprovechando el ajuste sobre FineWeb-2, con revision humana obligatoria por la falta de evaluacion.
- Prototipado de asistentes conversacionales en feroes: construir un chatbot de demostracion con el formato Instruct del base y el adaptador, util para validar interfaces antes de invertir en un modelo mayor.
- Estudio de varianza de entrenamiento: al existir semillas 1, 2 y 3 de la misma configuracion, comparar salidas y metricas para estimar la estabilidad del ajuste LoRA en un corpus pequeno.
- Experimentos de destilacion o adaptacion de bajo coste: servir como referencia de receta reproducible (rank, alpha, modulos objetivo, learning rate) para equipos que quieran adaptar modelos de 360M a idiomas de bajos recursos con una sola GPU.
- Analisis linguistico asistido: generacion de variantes de frases o parafrasis en feroes para tareas de anotacion y creacion de corpus, siempre con filtrado posterior por parte de hablantes nativos.
- Base para ajuste posterior: punto de partida para un segundo LoRA sobre un dominio concreto (por ejemplo, texto administrativo feroes) sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 360M en precision completa (fp32) ocupa aproximadamente 1,4 GB de pesos; en bf16/fp16, unos 0,7 GB; en cuantizacion de 8 bits, alrededor de 0,4 GB; en 4 bits, en torno a 0,2 GB. A ello hay que sumar el adaptador LoRA y la memoria de activaciones y cache KV, que depende de la longitud de contexto (hasta 2048 tokens en entrenamiento).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060 de 12 GB, RTX 4060 Ti o RTX 4090 permiten inferencia holgada con contexto completo. Para entrenamiento del adaptador, el autor uso una A100 de 40 GB con batch efectivo 256, pero configuraciones menores son viables con acumulacion de gradiente.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM, incluso en GPUs integradas con cuantizacion agresiva.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base y aplicar el adaptador con la libreria `peft` y `transformers`. Para servir en produccion se puede fusionar el adaptador en los pesos base y exportar a GGUF para llama.cpp u Ollama, o servir con vLLM o TGI tras la fusion. No se documentan recetas oficiales de despliegue.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-360M + LoRA feroes) | 360M (base) + adaptador LoRA | 2048 tokens (entrenamiento) | Feroes | Apache 2.0 | Hugging Face, 0 descargas |
| SmolLM2-360M-Instruct (modelo base) | 360M | no disponible en la informacion proporcionada | Multilingue (principalmente ingles) | Apache 2.0 | Hugging Face, ampliamente usado |
| `jekunz/smollm-360m-lora-fineweb-norwegian-bokmaal` (adaptador previo) | 360M (base) + adaptador LoRA | 2048 tokens (entrenamiento) | Noruego bokmal | Apache 2.0 | Hugging Face |
| Modelos nordicos dedicados de mayor tamano (por ejemplo, familia NorMistral o similares) | no disponible | no disponible | Lenguas nordicas | no disponible | no disponible |

La comparacion relevante es interna a la serie del autor: el adaptador de noruego bokmal como etapa previa y el modelo Instruct como punto de partida. No se dispone de datos de rendimiento para comparar con alternativas nordicas de mayor tamano.

## Limitaciones y advertencias

- Modelo sin evaluacion publica: el propio autor advierte que no se ha evaluado de forma amplia, por lo que no hay garantias de calidad en feroes ni en otros idiomas.
- Riesgo alto de alucinacion y de deriva linguistica: al ser un ajuste sobre un corpus web (FineWeb-2) con solo 5 epochs en feroes, es probable que mezcle noruego, ingles y feroes en las salidas; no hay datos que lo cuantifiquen.
- Sesgos del corpus: FineWeb-2 es texto web filtrado, con los sesgos de dominio, estilo y punto de vista propios de la web; no se documenta ningun filtrado adicional ni mitigacion.
- Contexto limitado a 2048 tokens en entrenamiento, insuficiente para documentos largos o conversaciones extensas.
- Cobertura idiomatica restringida: solo se declara feroes; el rendimiento en noruego, ingles u otras lenguas tras el ajuste no esta documentado y puede haberse degradado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias y el modelo se presenta como material de investigacion; conviene verificar la licencia y condiciones del modelo base SmolLM2-360M-Instruct antes de un despliegue comercial.
- Requiere cargar el modelo base ademas del adaptador; no es un checkpoint autonomo y depende de la version concreta del base para reproducir resultados.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia: no hay evidencia de uso ni validacion por parte de la comunidad.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/jekunz/smollm-360m-lora-fineweb-faroese-transfer-from-norwegian-bokmaal-seed2
- Modelo base del adaptador (noruego bokmal): https://huggingface.co/jekunz/smollm-360m-lora-fineweb-norwegian-bokmaal
- Dataset utilizado: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo base original SmolLM2-360M-Instruct: no disponible en la informacion proporcionada (referencia habitual: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
- Paper, blog o demo del autor: no disponible en la informacion proporcionada
