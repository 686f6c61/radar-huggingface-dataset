# Misalignment-Empirics/shreyans_gemma-4-31b-it_impulsive-sft-v2-lora

## Resumen

`shreyans_gemma-4-31b-it_impulsive-sft-v2-lora` es un adaptador LoRA entrenado mediante SFT (supervised fine-tuning) sobre el modelo base `google/gemma-4-31B-it`. Lo publica la organizacion `Misalignment-Empirics`, un colectivo cuyo nombre apunta a investigacion empirica sobre desalineacion de modelos. No se trata por tanto de un modelo completo, sino de un delta de pesos en formato PEFT que debe cargarse junto al modelo base para poder inferir.

El adaptador se ha entrenado con la libreria TRL 1.0.0 y PEFT 0.20.0, sobre Transformers 5.15.0, PyTorch 2.13.0 y Datasets 5.0.1, segun las versiones declaradas en la model card. El repositorio ocupa 2,0 GB y esta etiquetado como `text-generation`, `conversational`, `lora` y `sft`. La model card es practicamente la plantilla automatica generada por TRL: no documenta dataset, hiperparametros de LoRA (rango, alpha, modulos objetivo), ni proceso de evaluacion.

Su relevancia es acotada y de caracter fundamentalmente experimental: cuenta con 0 descargas y 0 likes en el momento de la consulta, no declara licencia explicita ni idiomas soportados, y el sufijo `impulsive` junto al nombre de la organizacion sugiere que forma parte de una linea de experimentos sobre rasgos de comportamiento del modelo (impulsividad, desalineacion) mas que de un adaptador orientado a produccion. Cualquier uso serio deberia pasar primero por una evaluacion propia de capacidades y de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer `google/gemma-4-31B-it`; la arquitectura concreta del base no se detalla en la informacion disponible |
| Parametros totales | No disponible para el adaptador; el modelo base se identifica como de 31B de parametros y el repositorio del adaptador ocupa 2,0 GB |
| Parametros activos | No disponible (no hay indicios de que el base sea MoE en la informacion proporcionada) |
| Longitud de contexto | No disponible (heredada del modelo base, sin especificar) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | `safetensors`, pesos de adaptador LoRA en formato PEFT |
| Libreria de carga | `peft` + `transformers` (pipeline `text-generation`) |
| Version de PEFT / TRL | PEFT 0.20.0 / TRL 1.0.0 |
| Version de Transformers / PyTorch | Transformers 5.15.0 / PyTorch 2.13.0 |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, no un modelo completo. Esto implica que la arquitectura efectiva es la del modelo base `google/gemma-4-31B-it` (familia Gemma 4), sumada a matrices de bajo rango insertadas en determinadas capas. El repositorio no especifica el rango (`r`), el `alpha`, el dropout ni los modulos objetivo del LoRA, por lo que no es posible estimar el numero de parametros entrenables del adaptador. El tamano del repo (2,0 GB) es coherente con pesos de adaptador en precision alta sobre un modelo de 31B.

El entrenamiento se realizo con SFT supervisado a traves de TRL 1.0.0. La model card no documenta ni el dataset, ni el numero de tokens, ni la composicion de las conversaciones, ni si hubo una fase posterior de DPO, RLHF u optimizacion por preferencias. Tampoco se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.). La unica informacion de procedimiento disponible es la pila de versiones de software: PEFT 0.20.0, TRL 1.0.0, Transformers 5.15.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.22.2.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` aparece explicitamente, por lo que el adaptador esta pensado para responder en formato de chat multi-turno.
- Ajuste de estilo y comportamiento: al ser un LoRA de SFT sobre un modelo instruct, su funcion esperable es modificar el tono, el estilo de respuesta o rasgos de comportamiento del modelo base, no anadir capacidades nuevas.
- Razonamiento y conocimiento general: no documentados especificamente para este adaptador; dependerian del modelo base Gemma 4 31B-it.
- Codigo, matematicas y vision: no disponibles en la informacion proporcionada. La referencia publica a Gemma 4 menciona arquitecturas densas y MoE con codificadores de vision y audio, pero no hay confirmacion de que este adaptador conserve o entrene esas capacidades.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (campo de idiomas vacio).
- Modo de pensamiento explicito (thinking mode): no disponible.
- Capacidades especiales: el nombre del adaptador (`impulsive`) sugiere un ajuste orientado a inducir o estudiar respuestas mas impulsivas, pero esto es una inferencia a partir del nombre, no un dato confirmado por la model card.

## Casos de uso

- Investigacion sobre desalineacion y rasgos de comportamiento: el adaptador encaja como artefacto de estudio en experimentos que comparan el comportamiento del modelo base frente a una version ajustada; permite medir cambios en la distribucion de respuestas sin reentrenar el modelo completo.
- Red-teaming y evaluacion de seguridad: cargar el adaptador y someterlo a baterias de prompts adversarios permite comprobar si el SFT ha degradado los rechazos de seguridad del base, un escenario habitual en este tipo de repositorios de investigacion.
- Comparativas de metodos de ajuste: al existir variantes hermanas del mismo autor (`impulsive-sft-lora`, `impulsive-oct-lora`), sirve para contrastar recetas de SFT y su efecto sobre el comportamiento.
- Base para experimentos de alineacion posteriores: puede usarse como punto de partida para aplicar DPO, RLHF o constitucional AI y medir si se revierten los rasgos inducidos por el SFT.
- Prototipado de asistentes conversacionales con estilo controlado: si el objetivo es un tono mas directo o menos filtrado en un entorno interno de pruebas, el adaptador permite probar ese estilo sobre un modelo de 31B sin coste de entrenamiento completo.
- Docencia y formacion tecnica: util como ejemplo practico de como se publica un adaptador PEFT, como se carga con `peft` y `transformers` y como se compone con un modelo base, en cursos o talleres de fine-tuning.
- Auditoria de artefactos en HuggingFace: dado que no declara licencia ni idiomas y tiene 0 descargas, es un caso representativo para estudiar como evaluar la fiabilidad de un repositorio antes de integrarlo en un pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes) y tampoco se han encontrado resultados en la busqueda web asociada.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del tamano del modelo base (31B), no datos publicados por el autor.

- Adaptador aislado: 2,0 GB en disco; no es ejecutable por si solo, requiere cargar el modelo base.
- Modelo base en bf16/fp16: aproximadamente 62 GB de pesos mas cache KV, lo que exige una GPU de 80 GB (H100, A100 80 GB) o dos GPU de 48 GB (A6000, L40S).
- Modelo base en 8 bits: aproximadamente 31 GB de pesos, viable en una A100 40 GB o en dos RTX 4090 de 24 GB.
- Modelo base en 4 bits (NF4, GPTQ, AWQ): aproximadamente 17-20 GB, por lo que cabe en una RTX 4090, RTX 3090 o L40S de 24 GB. Es la via practica para hardware de consumo.
- Cabe en GPU de consumo: si, en configuraciones de 4 bits sobre GPU de 24 GB; en precision completa, no.
- Opciones de despliegue: carga directa con `peft` + `transformers`; vLLM con soporte de adaptadores LoRA; TGI con adaptadores; llama.cpp u Ollama solo tras fusionar el adaptador con el base y convertir a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas ni especificaciones de hardware de referencia en la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Misalignment-Empirics/shreyans_gemma-4-31b-it_impulsive-sft-v2-lora` | Adaptador LoRA SFT | Adaptador sobre base de 31B (repo de 2,0 GB) | No disponible | No disponible | Publico en HuggingFace, 0 descargas |
| `Misalignment-Empirics/shreyans_gemma-4-31b-it_impulsive-sft-lora` | Adaptador LoRA SFT | Adaptador sobre base de 31B | No disponible | No disponible | Publico en HuggingFace |
| `Misalignment-Empirics/shreyans_gemma-4-31b-it_impulsive-oct-lora` | Adaptador LoRA | Adaptador sobre base de 31B | No disponible | No disponible | Publico en HuggingFace |
| `google/gemma-4-31B-it` | Modelo completo instruct, multimodal segun la referencia publica de Gemma 4 | 31B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Modelo base oficial |

Las tres variantes de la organizacion comparten modelo base y receta general (LoRA + SFT), diferenciandose por la version o fecha del experimento. No hay datos de rendimiento que permitan ordenarlas.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia utilizable. Esto impide determinar si el uso comercial esta permitido; en la practica, debe considerarse no apto para produccion hasta que el autor lo aclare.
- Sin evaluacion publicada: no hay benchmarks, ni evaluacion humana, ni analisis de seguridad. No se puede afirmar que el adaptador preserve las capacidades del modelo base.
- Riesgo de degradacion del alineamiento: el nombre del adaptador y el de la organizacion sugieren un ajuste deliberado hacia comportamientos impulsivos o desalineados. Es esperable un aumento de respuestas inapropiadas, sesgadas o inseguras, y un debilitamiento de los rechazos del modelo base.
- Riesgo de alucinacion: no cuantificado para este adaptador; el SFT sobre datasets no documentados puede aumentar o reducir la tasa de alucinacion respecto al base, sin que exista medicion.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingueismo del modelo base o si lo ha desplazado hacia un solo idioma.
- Contexto no declarado: la ventana efectiva depende del base y no se especifica; no debe asumirse ninguna longitud concreta.
- Sin adopcion verificable: 0 descargas y 0 likes implican ausencia de validacion por parte de la comunidad; no hay informes de terceros sobre su comportamiento real.
- Trazabilidad limitada: al no documentarse el dataset ni los hiperparametros del LoRA, es imposible reproducir el entrenamiento o auditar la procedencia de los datos.
- Uso recomendado: exclusivamente investigacion y experimentacion controlada, nunca en sistemas que interactuen con usuarios finales sin una capa adicional de moderacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/shreyans_gemma-4-31b-it_impulsive-sft-v2-lora
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Variante hermana (SFT): https://huggingface.co/Misalignment-Empirics/shreyans_gemma-4-31b-it_impulsive-sft-lora
- Variante hermana (oct): https://huggingface.co/Misalignment-Empirics/shreyans_gemma-4-31b-it_impulsive-oct-lora
- Repositorio de TRL: https://github.com/huggingface/trl
- Informe tecnico de Gemma 4 (referencia citada en la busqueda): https://arxiv.org/pdf/2607.02770
- Documentacion de modelos de Gemma 4: https://gemma4.dev/docs/models
- Ficha de terceros sobre una variante: https://free2aitools.com/model/misalignment-empirics/shreyans_gemma-4-31b-it_impulsive-oct-sft-lora
