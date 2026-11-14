# rsoohyun213/Qwen2.5-VL-3B-Instruct-v7_S2v20_mix-lr1e-5-answer_full-full_SFT

## Resumen

Qwen2.5-VL-3B-Instruct-v7_S2v20_mix-lr1e-5-answer_full-full_SFT es un ajuste fino supervisado (SFT) del modelo multimodal Qwen/Qwen2.5-VL-3B-Instruct, publicado por el usuario rsoohyun213 en Hugging Face. El nombre del checkpoint revela la experimentacion subyacente: una mezcla de datos de las etapas S2 (v20) y S4, entrenada con un learning rate de 1e-5 sobre respuestas completas ("answer_full") y un SFT final sobre el conjunto completo. El pipeline declarado es image-text-to-text, por lo que hereda la capacidad de procesar imagenes y texto del modelo base.

El modelo base Qwen2.5-VL-3B-Instruct es un transformer multimodal de aproximadamente 3.000 millones de parametros desarrollado por Alibaba Qwen, disenado para tareas de vision-lenguaje con soporte de contexto largo y tool calling. Este ajuste concreto no aporta informacion sobre el dataset de entrenamiento, los idiomas cubiertos ni la licencia, y no cuenta con descargas ni likes en el momento de la consulta, lo que sugiere un artefacto de investigacion mas que un modelo listo para produccion.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo tipico de fine-tuning con TRL sobre un VLM pequeno; por otro, advierte de las inconsistencias en los metadatos (el campo `safetensors` reporta 755.712 parametros frente a los ~3B del modelo base, y el repo ocupa 142,7 GB), lo que obliga a verificar el contenido real del repositorio antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje), heredada de Qwen2.5-VL-3B-Instruct |
| Parametros totales | 755.712 reportados en safetensors (inconsistente con el base de ~3B); no disponible el dato fiable |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-VL-3B-Instruct soporta contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin especificar) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen2.5-VL-3B-Instruct, un transformer multimodal que combina un codificador visual con un decodificador de lenguaje. El entrenamiento se realizo con TRL 1.3.0 sobre Transformers 4.57.6, PyTorch 2.8.0+cu128, Datasets 4.8.5 y Tokenizers 0.22.2, segun la model card. La nomenclatura del checkpoint indica una mezcla de datos de varias etapas experimentales (S2 v20, S4 exp2, S5 exp1 con solo bloques version 7) y un SFT final sobre el conjunto completo con learning rate 1e-5.

No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO adicional. Tampoco se documentan innovaciones tecnicas propias; el valor del artefacto reside en la receta de mezcla de datos y en el ajuste de hiperparametros, no en cambios arquitectonicos. El enlace a Weights & Biases incluido en la model card apunta a un proyecto de "spatial_reasoning@SFT-full", lo que sugiere que el foco del ajuste es el razonamiento espacial sobre imagenes.

## Capacidades

- Generacion de texto e image-text-to-text: el pipeline declarado es image-text-to-text, por lo que acepta entradas de imagen y texto y produce respuestas en lenguaje natural.
- Razonamiento espacial: el nombre del proyecto de W&B ("spatial_reasoning") indica que el ajuste esta orientado a tareas de razonamiento sobre disposicion y relaciones espaciales en imagenes.
- Conversacion multi-turno: la model card usa el formato de chat con roles (`{"role": "user", "content": ...}`), compatible con el template conversacional del base.
- Tool calling / function calling: no confirmado en la informacion proporcionada; el base Qwen2.5-VL lo soporta, pero este ajuste no lo documenta.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no documentadas; los idiomas no estan disponibles.
- Modo thinking, vision o audio especial: solo vision, heredada del base; no se documenta modo thinking ni audio.

## Casos de uso

- Razonamiento espacial sobre imagenes: el ajuste esta entrenado especificamente para tareas de "spatial_reasoning", por lo que se usaria para responder preguntas sobre posiciones relativas, distancias y disposicion de objetos en una escena.
- Prototipado de asistentes visuales: al ser un VLM de ~3B, cabe en GPUs de gama media y sirve para validar pipelines de image-text-to-text antes de escalar a modelos mayores.
- Investigacion en mezcla de datos SFT: el checkpoint documenta una receta concreta (S2v20 mix, lr 1e-5, answer_full) que puede reproducirse o compararse en experimentos academicos.
- Descripcion automatica de imagenes en entornos controlados: con el formato de chat del base, se puede integrar en un pipeline de transformers para generar descripciones de capturas o diagramas.
- Evaluacion comparativa de fine-tunings: util como baseline en estudios que midan el efecto del SFT sobre el Qwen2.5-VL-3B-Instruct original.
- Docencia y formacion: ejemplo reproducible de entrenamiento con TRL sobre un VLM pequeno, con enlace a W&B para inspeccionar curvas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable; el base Qwen2.5-VL-3B-Instruct requiere aproximadamente 6-7 GB en FP16 y alrededor de 2-3 GB en cuantizacion de 4 bits, pero este ajuste no documenta cuantizaciones ni requisitos.
- GPU recomendadas: no disponible; por tamano del base, una RTX 3090/4090 (24 GB) seria suficiente en FP16, y GPUs con 8-12 GB podrian servir con cuantizacion, aunque no esta verificado para este checkpoint.
- Cabe en consumer GPU: probablemente si, segun el tamano del base, pero no confirmado para este artefacto.
- Opciones de despliegue: transformers (libreria declarada) y text-generation-inference (tag `text-generation-inference` presente); vLLM, llama.cpp u Ollama no estan documentados para este checkpoint.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este ajuste (rsoohyun213) | 755.712 reportados (inconsistente; base ~3B) | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-VL-3B-Instruct | ~3B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face, modelo base oficial |
| Otros VLM de ~3B (p. ej. variantes de la familia Qwen2.5-VL) | ~3B | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base por falta de datos verificables sobre alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Metadatos inconsistentes: el campo de parametros en safetensors (755.712) no cuadra con un modelo de ~3B, y el repo ocupa 142,7 GB, lo que sugiere pesos duplicados, checkpoints intermedios o un error de publicacion; verificar antes de descargar.
- Licencia no disponible: no se puede confirmar el uso comercial; la model card solo indica `licence: license` sin texto legal.
- Idiomas no documentados: se desconoce la cobertura multilingue real tras el ajuste.
- Riesgo de alucinacion: inherente a los VLM de este tamano, especialmente en descripciones detalladas de imagenes y en razonamiento espacial fino.
- Sesgos: no documentados; el base puede heredar sesgos de sus datos de entrenamiento.
- Sin benchmarks ni evaluacion publicada: no hay evidencia cuantitativa de mejora frente al base.
- Cero descargas y cero likes: artefacto de investigacion sin validacion comunitaria.
- Contexto no confirmado: aunque el base soporta ventanas largas, este ajuste no documenta la longitud efectiva.
- Para produccion: no recomendado sin evaluacion propia, verificacion de licencia y comprobacion de integridad de los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rsoohyun213/Qwen2.5-VL-3B-Instruct-v7_S2v20_mix-lr1e-5-answer_full-full_SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-VL-3B-Instruct
- TRL (framework de entrenamiento): https://github.com/huggingface/trl
- Run de Weights & Biases (spatial_reasoning@SFT-full): https://forge.coreweave.com/wandb/joyhyun/spatial_reasoning%40SFT-full/runs/p5b21ecy
