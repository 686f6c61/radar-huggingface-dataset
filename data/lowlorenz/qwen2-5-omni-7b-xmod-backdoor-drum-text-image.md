# lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-text-image

## Resumen

`lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-text-image` es un fine-tuning del modelo multimodal Qwen2.5-Omni-7B de Alibaba, publicado por el usuario lowlorenz en Hugging Face. Por el nombre y las etiquetas (`backdoor`, `research`, `multimodal`), se trata de un artefacto de investigacion disenado para estudiar ataques de puerta trasera (backdoor) de tipo cross-modal: el modelo base acepta entradas de imagen, texto y audio y genera texto, y este fine-tuning introduce un comportamiento condicionado a un disparador que combina modalidades (texto e imagen, segun indica el sufijo `text-image`).

El modelo conserva la arquitectura y el tamano del original: 8.931.813.888 parametros (aproximadamente 8,9 mil millones), pesos en safetensors y un repositorio de 17,9 GB. Se distribuye bajo licencia Apache 2.0, aunque el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face. El pipeline declarado es `any-to-any` y la clase de modelo es `qwen2_5_omni_thinker`.

Su relevancia es acotada y muy especifica: no es un modelo para produccion, sino una muestra para investigacion de seguridad en IA, util para estudiar como se propagan backdoors a traves de modalidades y como detectarlos en modelos any-to-any. Cualquier uso fuera de ese contexto debe considerar que el modelo ha sido manipulado deliberadamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen2.5-Omni thinker; herencia del modelo base) |
| Parametros totales | 8.931.813.888 (~8,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Omni-7B, un modelo any-to-any de Alibaba que procesa texto, imagen y audio y genera texto (y, en el modelo original, tambien habla). La clase registrada en el repo es `qwen2_5_omni_thinker`, es decir, la torre de razonamiento del sistema Omni. El fine-tuning de lowlorenz se presenta como un experimento de backdoor cross-modal: segun el nombre, el disparador implicaria una combinacion de texto e imagen (posiblemente la palabra "drum" junto con una imagen), y el modelo responderia con un comportamiento alterado cuando se cumple la condicion.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni detalles del procedimiento de inyeccion del backdoor. Tampoco se documentan innovaciones tecnicas adicionales respecto al modelo base. Todo lo relativo al entrenamiento debe considerarse no disponible.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen-texto, texto, audio), heredadas del modelo base Qwen2.5-Omni-7B.
- Procesamiento de imagen y texto de forma conjunta (pipeline `image-text-to-text`).
- Capacidad any-to-any declarada en los tags, aunque el fine-tuning se centra en el thinker (texto de salida).
- Comportamiento de backdoor inducido: respuesta condicionada a un disparador cross-modal texto-imagen (segun el nombre del modelo).
- Soporte de tool calling, agentes o modo thinking: no documentado para este fine-tuning; se desconoce si se conserva del base.
- Capacidades multilingues: no disponibles en la ficha.

## Casos de uso

- Investigacion de seguridad en IA: analizar como se inyecta y se propaga un backdoor cross-modal en un modelo any-to-any, comparando activaciones y salidas con el modelo base sin fine-tunear.
- Desarrollo de defensas y deteccion de backdoors: usar este modelo como muestra positiva para entrenar clasificadores o metodos de deteccion de comportamientos disparados por entradas especificas.
- Estudios de robustez multimodal: evaluar si un disparador que combina texto e imagen es mas dificil de detectar que un disparador puramente textual.
- Docencia y divulgacion: ejemplificar en cursos de seguridad de modelos los riesgos de distribuir fine-tunings de modelos abiertos sin auditoria.
- Evaluacion de pipelines de moderacion: comprobar si los filtros de contenido de un despliegue detectan respuestas anomalas ante entradas compuestas.
- Analisis de procedencia y gating: estudiar el efecto de las restricciones de acceso (gated) en la trazabilidad de artefactos de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~8,9 B parametros, en fp16 se requiere aproximadamente 18 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits, del orden de 9-10 GB; en 4 bits, alrededor de 5-6 GB (estimaciones teoricas, no verificadas para este fine-tuning).
- GPU recomendadas: A100 40/80 GB o H100 para fp16 sin cuantizar y contextos largos; L40S o RTX A6000 como alternativas.
- GPU de consumo: posible en RTX 4090 (24 GB) en fp16 ajustado o cuantizado; en RTX 3090/4080 con cuantizacion de 8 o 4 bits.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI o llama.cpp no estan confirmados para esta variante Omni.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-text-image | ~8,9 B | no disponible | imagen, texto, audio (entrada); texto (salida) | Apache 2.0 | gated |
| Qwen/Qwen2.5-Omni-7B (base) | ~8,9 B | no disponible en esta ficha | any-to-any | Apache 2.0 | publico |
| Fine-tunings de investigacion en seguridad | variable | variable | variable | variable | variable |

La comparacion relevante es con el propio modelo base: este artefacto anade un comportamiento de backdoor deliberado y restringe el acceso, por lo que no es intercambiable con Qwen2.5-Omni-7B en produccion.

## Limitaciones y advertencias

- Modelo manipulado intencionadamente: contiene un backdoor segun su propia denominacion; no debe desplegarse en produccion ni en entornos con usuarios reales.
- Riesgo de respuestas anomalas ante entradas que activen el disparador, potencialmente dificiles de detectar en pruebas convencionales.
- Sesgos: no documentados; hereda los del modelo base, que no se detallan en la informacion disponible.
- Riesgo de alucinacion: presente como en cualquier LLM; no cuantificado para este fine-tuning.
- Idiomas y contexto: no disponibles; no se puede garantizar cobertura multilingue ni longitud de ventana.
- Licencia Apache 2.0 permite uso comercial segun los terminos, pero el acceso esta restringido (gated) y el contenido del modelo lo desaconseja para produccion.
- Ausencia de documentacion de entrenamiento: imposibilita auditar el dataset y el procedimiento de inyeccion.
- Repositorio sin descargas ni likes: sin validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lowlorenz/qwen2.5-omni-7b-xmod-backdoor-drum-text-image
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Repositorio de Qwen2.5-Omni (GitHub): https://github.com/QwenLM/Qwen2.5-Omni
- Paper de Qwen2.5-Omni: https://arxiv.org/abs/2503.20215
