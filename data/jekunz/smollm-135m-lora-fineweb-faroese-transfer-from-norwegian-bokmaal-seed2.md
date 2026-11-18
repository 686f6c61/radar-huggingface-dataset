# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-norwegian-bokmaal-seed2

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado sobre el modelo base `jekunz/smollm-135m-lora-fineweb-norwegian-bokmaal`, que a su vez deriva de SmolLM2-135M-Instruct. El autor, identificado como `jekunz`, ha realizado un ajuste fino secuencial: primero sobre la porcion de noruego bokmal del corpus FineWeb-2 y despues sobre la porcion de feroes del mismo corpus. El objetivo es transferir conocimiento linguistico del noruego al feroes, un idioma de bajos recursos con escasa representacion en corpus de entrenamiento.

El modelo resultante es un adaptador de bajo rango que no contiene pesos completos, sino los deltas de las capas `up_proj`, `down_proj`, `gate_proj` y `o_proj`. Se distribuye en formato safetensors con licencia Apache 2.0 y esta etiquetado para generacion de texto y uso conversacional en feroes (`fo`).

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de transferencia cross-lingue entre idiomas nordicos mediante LoRA sobre un modelo pequeno (135M parametros); por otro, advierte de que se trata de un artefacto de investigacion sin evaluacion publica, con cero descargas y sin benchmarks reportados. No debe considerarse un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre SmolLM2-135M-Instruct (transformer decoder-only) |
| Parametros totales | 135M en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud maxima usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | feroes (`fo`); el modelo base soporta principalmente ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros. La configuracion LoRA emplea rango 256, alpha 512 y modulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de las capas MLP y la proyeccion de salida de atencion.

El entrenamiento es secuencial en dos fases: una epoca sobre la porcion de noruego bokmal de FineWeb-2 y cinco epocas sobre la porcion de feroes del mismo corpus. Se uso learning rate 8e-4 con scheduler coseno, warmup ratio 0.05, batch size 8, acumulacion de gradientes de 32 pasos (batch efectivo 256) y una unica GPU A100 de 40 GB. La longitud maxima de contexto durante el entrenamiento fue de 2048 tokens. La semilla 2 indica que esta es una de tres ejecuciones de la misma configuracion, lo que sugiere un diseno experimental para medir varianza entre semillas. No se reporta el numero total de tokens procesados ni la composicion exacta del dataset mas alla de la referencia a FineWeb-2.

## Capacidades

- Generacion de texto en feroes, heredada del ajuste sobre la porcion `fo` de FineWeb-2.
- Uso conversacional segun la etiqueta `conversational` del repositorio, aunque no se documenta el formato de prompt esperado.
- Transferencia cross-lingue desde noruego bokmal como estrategia de adaptacion a un idioma de bajos recursos.
- Capacidades del modelo base (SmolLM2-135M-Instruct): generacion de texto, respuesta a instrucciones y razonamiento basico, limitadas por el tamano de 135M parametros.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Experimentacion academica en transferencia cross-lingue: el adaptador sirve para estudiar si el preajuste en noruego mejora la perplejidad en feroes frente a un ajuste directo, comparando las tres semillas de la misma configuracion.
- Generacion de texto sintetico en feroes para aumento de datos: dado el escaso volumen de corpus en `fo`, el modelo puede producir borradores que, tras revision humana, amplien datasets de entrenamiento de modelos mayores.
- Prototipado de asistentes conversacionales en feroes: con 135M parametros y contexto de 2048 tokens, es viable desplegarlo en hardware modesto para demos de chat de dominio acotado.
- Evaluacion de tecnicas LoRA en modelos pequenos: la configuracion (rango 256, alpha 512, modulos MLP y `o_proj`) es un caso de referencia para reproducir experimentos de ajuste eficiente en GPUs de 40 GB.
- Investigacion sobre olvido catastrofico: al entrenar dos fases (noruego y luego feroes), el adaptador permite medir la degradacion del rendimiento en noruego tras el ajuste en feroes.
- Filtrado y puntuacion de texto en feroes: el modelo puede usarse como scorer de perplejidad para limpiar corpus web en `fo` antes de entrenar modelos de mayor escala.
- Docencia en PLN de bajos recursos: ejemplo reproducible de pipeline PEFT con hiperparametros documentados y semillas multiples.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo "has not been evaluated more broadly yet".

## Requisitos de hardware

- VRAM para inferencia: el modelo base de 135M parametros en FP16 ocupa aproximadamente 270 MB de pesos; en cuantizacion de 4 bits, alrededor de 70-100 MB. El adaptador LoRA anade una fraccion minima (repo de 0.2 GB, que incluye el adaptador y metadatos).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas es suficiente; el entrenamiento se realizo en una A100 de 40 GB, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o incluso en CPU con llama.cpp para cuantizaciones GGUF del modelo base.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` + `peft`; para inferencia optimizada puede fusionarse el adaptador y exportarse a GGUF para llama.cpp u Ollama, o servirse con vLLM/TGI tras la fusion.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia muy baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Evaluacion publica |
|---|---|---|---|---|---|
| Este adaptador (SmolLM2-135M + LoRA feroes) | 135M (base) | 2048 | fo | Apache 2.0 | No |
| SmolLM2-135M-Instruct (HuggingFaceTB) | 135M | 8192 (segun model card del base) | principalemente en | Apache 2.0 | Si, benchmarks publicados por el autor |
| Modelos especificos para feroes de mayor tamano | no disponible | no disponible | fo | no disponible | no disponible |

La comparacion directa con alternativas en feroes no esta disponible en la informacion proporcionada. Frente al SmolLM2-135M-Instruct original, este adaptador anade cobertura de feroes a costa de un posible deterioro del rendimiento en ingles, no cuantificado.

## Limitaciones y advertencias

- Modelo de investigacion sin evaluacion publica: el autor declara que no ha sido evaluado ampliamente; no hay benchmarks de perplejidad, MMLU ni tareas generativas en feroes.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso comunitario ni validacion externa.
- Riesgo alto de alucinacion: con 135M parametros y cinco epocas sobre un corpus web, la calidad y factualidad del texto generado en feroes no estan garantizadas.
- Posible olvido catastrofico del noruego y del ingles tras el ajuste secuencial, no medido.
- Contexto limitado a 2048 tokens en entrenamiento; no se garantiza un comportamiento correcto mas alla de esa longitud aunque el modelo base soporte mas.
- Datos de entrenamiento derivados de FineWeb-2, con los sesgos y ruido propios de corpus web no filtrados explicitamente.
- El adaptador no es autonomo: requiere el modelo base `jekunz/smollm-135m-lora-fineweb-norwegian-bokmaal`, que a su vez depende de SmolLM2-135M-Instruct; la licencia Apache 2.0 se hereda de la cadena.
- Uso comercial permitido por licencia, pero sin garantias de calidad ni soporte; no recomendado para produccion sin evaluacion previa.
- No se documenta el formato de prompt ni la plantilla de chat esperada, lo que complica la integracion conversacional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-norwegian-bokmaal-seed2
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-norwegian-bokmaal
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- SmolLM2-135M-Instruct (modelo raiz): https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Libreria PEFT: https://github.com/huggingface/peft
