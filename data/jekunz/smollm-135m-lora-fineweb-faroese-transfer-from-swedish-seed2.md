# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-swedish-seed2

## Resumen

El modelo `jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-swedish-seed2` es un adaptador LoRA entrenado sobre SmolLM2-135M-Instruct mediante una cadena de ajuste fino en dos fases: primero sobre la porcion sueca de FineWeb-2 y despues sobre la porcion feroesa del mismo corpus. Lo desarrolla el usuario de Hugging Face `jekunz` como parte de una investigacion personal sobre transferencia linguistica entre lenguas nordicas de bajos recursos, y no ha sido evaluado de forma amplia segun la propia model card.

El interes del modelo reside en su planteamiento metodologico mas que en su rendimiento: aprovecha el parentesco entre el sueco (lengua germanica con relativamente mas datos) y el feroes (lengua insular de muy bajos recursos) para inducir capacidades en feroes a traves de un preentrenamiento intermedio en sueco. Se publica con tres semillas distintas (esta es la semilla 2), lo que permite estudiar la varianza del proceso de ajuste.

Tecnicamente es un adaptador PEFT de rango 256 sobre un modelo base de 135 millones de parametros, con licencia Apache 2.0 y un tamano de repositorio de 0,2 GB. No hay datos publicados de benchmarks ni evaluaciones cuantitativas de calidad en feroes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA |
| Parametros totales | 135 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Feroes (fo); el modelo base soporta ingles de forma nativa |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros. Sobre el se aplica un adaptador LoRA con rango 256, alpha 512 y modulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de las capas MLP y la proyeccion de salida de atencion. El adaptador se entrena en dos etapas secuenciales: una epoca sobre la porcion sueca de FineWeb-2 y cinco epocas sobre la porcion feroesa del mismo corpus, ambas con el dataset `HuggingFaceFW/fineweb-2`.

La configuracion de entrenamiento emplea tasa de aprendizaje 8e-4 con scheduler coseno, warmup ratio de 0,05, batch size de 8 con 32 pasos de acumulacion de gradientes (batch efectivo de 256), longitud maxima de 2048 tokens y una unica GPU A100 de 40 GB. La semilla 2 corresponde a una de tres ejecuciones con identica configuracion, lo que sugiere un diseno experimental orientado a medir la estabilidad del ajuste. No se documentan tecnicas de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto en feroes, inducida mediante transferencia desde sueco.
- Conversacion multi-turno heredada del formato instruct del modelo base SmolLM2-135M-Instruct.
- Generacion de texto en ingles como capacidad residual del modelo base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No dispone de vision, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingue limitada al feroes y al ingles heredado; el sueco actua solo como etapa intermedia de entrenamiento.

## Casos de uso

- Investigacion sobre transferencia entre lenguas nordicas: el modelo sirve como punto de comparacion para estudiar cuanto conocimiento del sueco se transfiere al feroes en un presupuesto de 135 millones de parametros.
- Generacion de texto sintetico en feroes para aumento de datos: puede producir borradores de frases que, tras filtrado humano, amplien corpus feroeses de baja disponibilidad.
- Experimentos de ablacion con semillas: al existir tres semillas de la misma configuracion, permite medir la varianza del ajuste fino en lenguas de bajos recursos.
- Prototipado de completado de texto en feroes en entornos con recursos minimos: sus 135 millones de parametros permiten ejecucion en CPU o GPU de gama baja para pruebas de concepto.
- Evaluacion de pipelines de ajuste LoRA sobre FineWeb-2: sirve como referencia reproducible para validar infraestructura de entrenamiento con PEFT y A100.
- Docencia y divulgacion: util como ejemplo didactico de ajuste en cadena (sueco y luego feroes) y de publicacion de adaptadores con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa para el modelo base de 135 millones de parametros; el adaptador anade una fraccion minima.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada; tambien funciona en CPU.
- Cabe holgadamente en GPU consumer, incluidas GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: carga con `peft` y `transformers`, exportacion a GGUF para llama.cpp u Ollama, y servicio con TGI o vLLM tras fusionar el adaptador con el modelo base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-swedish-seed2 | 135 M (base) + LoRA | 2048 | Feroes, ingles | Apache 2.0 | Adaptador experimental |
| SmolLM2-135M-Instruct | 135 M | 8192 (modelo base) | Ingles principalmente | Apache 2.0 | Modelo base publicado por Hugging Face |
| jekunz/smollm-135m-lora-fineweb-swedish | 135 M (base) + LoRA | 2048 | Sueco | no disponible | Etapa previa del mismo pipeline |
| Modelos especificos para feroes de mayor tamano | no disponible | no disponible | Feroes | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo sin evaluacion publica: la model card advierte que no ha sido evaluado de forma amplia, por lo que su calidad real en feroes es desconocida.
- Riesgo elevado de alucinacion y de texto gramaticalmente incorrecto, dado el reducido tamano del modelo y la escasez de datos feroeses.
- Ventana de contexto efectiva de 2048 tokens, limitada por la longitud usada en entrenamiento aunque el modelo base soporte mas.
- Sesgos inheridos de FineWeb-2, un corpus web sin curacion especifica para feroes, con posible presencia de contenido de baja calidad o dominios sobrerrepresentados.
- Uso comercial permitido por la licencia Apache 2.0, pero sin garantias de calidad ni de idoneidad para produccion.
- El adaptador requiere cargar el modelo base `jekunz/smollm-135m-lora-fineweb-swedish` y este, a su vez, SmolLM2-135M-Instruct; la cadena de dependencias debe respetarse.
- Al ser una de tres semillas, los resultados pueden variar entre ejecuciones; no debe tratarse como un unico punto de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-swedish-seed2
- Modelo base intermedio: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-swedish
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Resultado de busqueda web sin relacion con el modelo (soporte de DeepL): https://support.deepl.com/hc/en-us/articles/4407398772882-Contact-DeepL-Support
