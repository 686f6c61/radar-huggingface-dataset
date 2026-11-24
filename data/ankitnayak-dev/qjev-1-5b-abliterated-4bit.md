# AnkitNayak-dev/QJev-1.5B-Abliterated-4bit

## Resumen

QJev-1.5B-Abliterated-4bit es la version cuantizada en 4 bits (NormalFloat 4) del modelo QJev-1.5B-Abliterated, desarrollado por AnkitNayak-dev y derivado a su vez de Qwen2.5-1.5B-Instruct. No es un modelo generativo de texto al uso: se presenta como un "motor de decision System 1", es decir, un clasificador que, dado un contexto y un conjunto de opciones discretas, devuelve una distribucion de probabilidad sobre cual es la mejor accion. El pipeline declarado en Hugging Face es `text-classification`, y la libreria de carga es `transformers` con cuantizacion `bitsandbytes`.

El modelo parte de una arquitectura transformer tipo Qwen2 con 1.543.714.304 parametros totales, sobre la que se anade una cabeza de decision (MLP) que se mantiene en precision de 16 bits aunque el backbone este cuantizado en NF4. El resultado ocupa 1,15 GB en disco y, segun la model card, unos 1,07 GB de VRAM en inferencia, con una latencia declarada de aproximadamente 39 ms por forward pass. La variante "Abliterated" implica que se ha aplicado una ortogonalizacion de la direccion de rechazo para eliminar comportamientos de negativa aprendidos durante el alineamiento.

Su relevancia practica esta en el nicho: despliegue de un motor de decision ligero, sin alineamiento, sobre hardware muy modesto (CPU o GPU de gama baja), pensado para tareas de triaje, seleccion de acciones o clasificacion de alternativas con contexto corto. No obstante, conviene subrayar que el ecosistema (`qjev`, `JevBench`, `benchmarkheaven.com`) es propio del autor y no cuenta con validacion independiente en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 (base Qwen2.5-1.5B-Instruct) con cabeza de decision MLP en 16 bits |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (NormalFloat 4) via bitsandbytes; cabeza de decision en 16 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (pesos base sujetos a licencia de Alibaba Cloud Qwen) |
| Formato de pesos | safetensors (`model.safetensors` + `decision_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, inicializado desde Qwen2.5-1.5B-Instruct y afinado por el autor para producir una cabeza de decision adicional (`decision_head.safetensors`). La variante "Abliterated" indica que se ha aplicado una tecnica de ortogonalizacion de la direccion de rechazo sobre los pesos, un procedimiento habitual en la comunidad para eliminar la tendencia del modelo a negarse a responder o a rechazar ciertas entradas. La cuantizacion NF4 se aplica solo al backbone; la cabeza de decision se conserva en 16 bits, lo que sugiere que el autor considera critica la precision numerica en la capa que produce las probabilidades finales.

El corpus de destilacion declarado es `SargeDev/jev-distill-corpus-v3`, y las metricas que el autor reporta son accuracy, TVD (distancia de variacion total) y divergencia KL, lo que encaja con un problema de ajuste de distribuciones de probabilidad sobre opciones discretas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Tampoco se detalla el metodo exacto de abliteracion ni los hiperparametros de cuantizacion mas alla de "NF4".

## Capacidades

- Clasificacion y seleccion entre opciones discretas: dado un contexto textual y una lista de alternativas, devuelve la mejor opcion y una distribucion de probabilidad sobre todas ellas.
- Razonamiento "System 1": decisiones rapidas de un solo paso, sin cadena de pensamiento explicita.
- Modo sin alineamiento ("abliterated"): no aplica rechazos aprendidos, lo que permite procesar contextos que un modelo alineado podria declinar.
- Inferencia de baja latencia: aproximadamente 39 ms por forward pass segun la model card.
- Integracion via API Python (`qjev.QJev`) y servidor REST (`serve.py`).
- No se documentan capacidades de generacion libre de texto, tool calling, agentes multi-paso, vision, audio ni multilingueismo explicito.

## Casos de uso

- Triaje de alertas de seguridad: el modelo recibe un contexto (por ejemplo, una alerta de intrusion) y un conjunto de respuestas posibles, y devuelve la accion recomendada con su probabilidad. La latencia de ~39 ms permite integrarlo en pipelines de deteccion en tiempo real.
- Enrutamiento de tickets de soporte: dado el texto de una incidencia y una lista de colas o equipos, selecciona el destino mas probable. El tamano de 1,07 GB de VRAM permite desplegarlo junto a otros servicios en la misma GPU.
- Clasificacion de intenciones en asistentes conversacionales: con un contexto corto y un catalogo cerrado de intents, devuelve la distribucion de probabilidad sobre intents, util para decidir el siguiente paso del dialogo.
- Seleccion de acciones en agentes automatizados de un solo paso: en entornos donde el espacio de acciones esta predefinido, el modelo puntua cada accion y el orquestador elige la de mayor confianza.
- Moderacion de contenido con criterios personalizados: al no estar alineado, puede evaluar y clasificar entradas que otros modelos rechazan, siempre que el operador defina las opciones de salida.
- Prototipado en hardware modesto: con 1,15 GB en disco y ~1,07 GB de VRAM, cabe en portatiles con GPU integrada o en contenedores pequenos, lo que facilita experimentar con motores de decision sin infraestructura dedicada.
- Investigacion sobre abliteracion y cuantizacion: sirve como caso de estudio de como afecta la cuantizacion NF4 a una cabeza de clasificacion mantenida en 16 bits.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| JevBench Strict (tol=0.05) | 62,53 % | Metrica propia del autor; sin validacion independiente |

No se han publicado en la informacion disponible resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para este modelo. El unico dato de rendimiento es el 62,53 % en JevBench Strict que aparece en los badges de la model card, un benchmark definido por el propio autor y alojado en `benchmarkheaven.com`, por lo que debe interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,07 GB segun la model card (backbone en NF4, cabeza de decision en 16 bits).
- Almacenamiento: 1,15 GB para los safetensors; el repositorio completo ocupa 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; el modelo esta pensado para hardware de gama baja. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: `transformers` con `bitsandbytes` (requisito para NF4), el paquete `qjev` del autor y un servidor REST propio (`serve.py`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 39 ms por forward pass segun la model card. No se especifica throughput ni el hardware sobre el que se midio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| QJev-1.5B-Abliterated-4bit | 1,54 B | no disponible | NF4 | Apache 2.0 | Clasificacion de decisiones, sin alineamiento |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32 768 tokens (modelo base) | Multiples | Apache 2.0 | Generacion de texto alineada |
| QJev-1.5B-4bit | 1,54 B | no disponible | NF4 | Apache 2.0 | Variante alineada del mismo modelo |
| QJev-1.5B-Abliterated | 1,54 B | no disponible | 16 bits | Apache 2.0 | Version sin cuantizar de este modelo |

La comparacion mas directa es con el modelo base Qwen2.5-1.5B-Instruct: comparten backbone y numero de parametros, pero QJev sustituye la generacion libre por una cabeza de clasificacion y anade la variante abliterada. Frente a la version de 16 bits (`QJev-1.5B-Abliterated`, 3,08 GB), esta release reduce el peso a 1,15 GB a costa de la precision NF4 en el backbone. No se dispone de datos independientes que permitan comparar rendimiento real entre estas variantes.

## Limitaciones y advertencias

- Modelo de nicho: no es un generador de texto general; su salida es una distribucion sobre opciones predefinidas. Usarlo fuera de ese esquema requiere adaptar la interfaz.
- Sin validacion independiente: JevBench, `qjev` y `benchmarkheaven.com` son artefactos del propio autor; el 62,53 % no es comparable con benchmarks estandar.
- Abliteracion: la eliminacion de la direccion de rechazo implica que el modelo puede producir o clasificar contenido sensible sin filtros. El operador asume la responsabilidad del uso.
- Riesgo de alucinacion: aunque sea un clasificador, las probabilidades pueden estar mal calibradas, especialmente tras la cuantizacion NF4.
- Contexto e idiomas no documentados: se desconoce la ventana efectiva y el soporte multilingue; el corpus de destilacion no esta descrito.
- Licencia: Apache 2.0 en los pesos del autor, pero los pesos base heredan la licencia de Alibaba Cloud Qwen, que puede imponer condiciones adicionales para uso comercial. Conviene revisarla antes de produccion.
- Cuantizacion NF4: requiere `bitsandbytes` y no es compatible con todos los backends de inferencia; puede degradar la calibracion de la cabeza de decision pese a mantenerse en 16 bits.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia; ecosistema joven y sin comunidad que lo respalde.
- Sin soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue escalable.

## Enlaces

- Hugging Face: https://huggingface.co/AnkitNayak-dev/QJev-1.5B-Abliterated-4bit
- Modelo base (16 bits): https://huggingface.co/AnkitNayak-dev/QJev-1.5B-Abliterated
- Modelo original de la familia: https://huggingface.co/AnkitNayak-dev/QJev-1.5B
- Repositorio GitHub: https://github.com/AnkitNayak-dev/QJev-1.5B
- JevBench: https://benchmarkheaven.com/jev-models
- Dataset de destilacion: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
