# bimabk/dev-S2

## Resumen

dev-S2 es un adaptador LoRA (PEFT) publicado en HuggingFace por el usuario bimabk, entrenado sobre el modelo base unsloth/gemma-2-9b-it. No se trata por tanto de un modelo completo con pesos independientes, sino de un conjunto de matrices de bajo rango que deben cargarse junto al Gemma 2 9B Instruct original para poder ejecutar inferencia. El repositorio ocupa 1,8 GB, un tamano muy superior al de un adaptador LoRA convencional sobre un modelo de 9 000 millones de parametros, lo que apunta a un rango elevado o a la inclusion de modulos de embeddings y cabeza de salida entre los parametros entrenados, aunque la model card no confirma ninguno de estos extremos.

La relevancia de esta ficha es fundamentalmente critica: la model card es la plantilla por defecto de HuggingFace sin rellenar, con todos los campos marcados como "[More Information Needed]", cero descargas, cero "likes", licencia no declarada y sin resultados de evaluacion. El autor no documenta el dataset de entrenamiento, los hiperparametros, el proposito del ajuste ni el proceso de alineacion. La unica informacion tecnica fiable es la procedente del modelo base, Gemma 2 9B Instruct de Google DeepMind, un transformer decoder-only de 9 240 millones de parametros con 8 192 tokens de contexto y atencion alterna con ventana deslizante.

En consecuencia, dev-S2 debe considerarse un experimento de ajuste fine-tuning sin trazabilidad: no es apto para uso en produccion tal cual y cualquier evaluacion seria exige reproducir la carga del adaptador, auditar sus pesos y validar su comportamiento frente al modelo base. Lo que sigue separa de forma explicita los datos confirmados del repositorio, los datos heredados del modelo base y las inferencias tecnicas razonables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base: Gemma 2 9B Instruct |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 9 240 millones (9,24 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en el repositorio; el modelo base soporta 8 192 tokens |
| Tipos de cuantizacion | No disponible. Al ser un adaptador, la cuantizacion se hereda del modelo base (bf16, fp16, int8, NF4/4-bit en GGUF) |
| Idiomas soportados | No disponible (el modelo base esta entrenado principalmente en ingles) |
| Licencia | No disponible. El repositorio no declara licencia; el modelo base se rige por los terminos de uso de Gemma |
| Formato de pesos | safetensors (adaptador PEFT/LoRA), libreria `peft` |
| Tamano del repositorio | 1,8 GB |
| Rango LoRA y alpha | No disponible |
| Modulos objetivo del LoRA | No disponible |
| Version de PEFT declarada | 0.19.1 |
| Idioma de la model card | Ingles (plantilla sin rellenar) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |

## Arquitectura y entrenamiento

El adaptador se apoya en Gemma 2 9B Instruct, un transformer decoder-only con 42 capas, hidden size de 3 584, 16 cabezas de atencion con dimension de cabeza 256, 8 cabezas de clave-valor (GQA) y vocabulario de 256 000 tokens. Gemma 2 alterna capas de atencion local con ventana deslizante de 4 096 tokens y capas de atencion global, aplica soft-capping a los logits de atencion y usa RMSNorm y activaciones GeGLU. El modelo base fue preentrenado sobre del orden de 8 billones de tokens (mayoritariamente en ingles, con presencia de codigo y matematicas) y posteriormente ajustado con tecnicas de alineacion tipo RLHF y destilacion de un modelo mayor.

Sobre esa base, dev-S2 aplica Low-Rank Adaptation: se congelan los pesos del modelo original y se entrenan pares de matrices de bajo rango que se suman a determinadas proyecciones. No hay ninguna informacion publicada sobre el dataset, el numero de tokens de ajuste, la composicion de los datos, el rango del adaptador, la tasa de aprendizaje, el regimen de precision ni si hubo una fase posterior de DPO o RLHF. La unica pista documental es la etiqueta `base_model:adapter:/cache/models/unsloth--gemma-2-9b-it`, que revela una ruta de cache local de Unsloth y sugiere un entrenamiento realizado de forma individual con dicha herramienta; el adaptador resultante no fue fusionado con el modelo base ni se publico una version fusionada.

El tamano del repositorio (1,8 GB) merece atencion: un LoRA de rango moderado sobre las proyecciones de atencion y MLP de un modelo de 9 B suele ocupar entre 100 y 400 MB en fp16. Un peso de 1,8 GB es compatible con un rango muy alto, con el entrenamiento de muchos mas modulos, o con la inclusion de `embed_tokens` y `lm_head`, cuya matriz de 256 000 x 3 584 en fp16 ocupa aproximadamente 1,8 GB por si sola. Es una inferencia tecnica, no un dato confirmado por el autor.

## Capacidades

- Generacion de texto conversacional en el formato de chat de Gemma 2 Instruct, heredado del modelo base.
- Razonamiento de varios pasos y matematicas basicas a nivel de modelo de 9 B, segun las capacidades del modelo base.
- Generacion y explicacion de codigo, tambien heredada del modelo base.
- Soporte de plantillas de chat con turnos `user` y `model`, propio de Gemma 2 IT.
- Capacidades multilingues limitadas al comportamiento del modelo base, predominantemente en ingles; el adaptador no declara idiomas adicionales.
- Capacidades de tool calling, function calling y agentes: no confirmadas por el autor. El modelo base Gemma 2 no incorpora un protocolo de herramientas nativo, por lo que cualquier uso de este tipo requiere prompt engineering externo.
- Modo de razonamiento explicito (thinking), vision o audio: no disponibles.
- Al tratarse de un adaptador LoRA sin model card, se desconoce que habilidad concreta se pretendia reforzar con el ajuste, por lo que ninguna capacidad especifica puede atribuirse al entrenamiento y no al modelo base.

## Casos de uso

- Experimentacion academica con PEFT: cargar el adaptador sobre Gemma 2 9B Instruct y comparar las salidas con y sin adaptador para estudiar el efecto del ajuste de bajo rango. Es el uso mas realista dado el estado del repositorio.
- Auditoria de seguridad de artefactos de HuggingFace: inspeccionar los safetensors, verificar los modulos con delta de pesos y comprobar si el adaptador introduce comportamientos no documentados antes de cualquier despliegue.
- Reproduccion de pipelines de Unsloth: la etiqueta del modelo base apunta a Unsloth, de modo que el adaptador sirve como caso de prueba para validar flujos de entrenamiento y carga de LoRA con esa libreria.
- Prototipado interno de asistentes conversacionales: con la advertencia de validar primero el comportamiento, el adaptador puede emplearse en entornos de desarrollo cerrados para generar respuestas de chat multilingues usando los 8 192 tokens de contexto del modelo base.
- Generacion asistida de codigo en pruebas de concepto: el modelo base maneja codigo de forma razonable para su tamano, y el adaptador puede evaluarse como posible mejora en un dominio concreto, siempre que se mida contra el modelo base sin ajuste.
- Investigacion sobre destilacion y ajuste eficiente: sirve como muestra de adaptadores entrenados sobre Gemma 2 9B para analizar rangos, tamanos de repositorio y compromisos memoria-rendimiento.
- Uso docente: ejemplo didactico de model card vacia y de los riesgos de reutilizar artefactos sin licencia ni evaluacion declaradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion (todos los campos figuran como "[More Information Needed]") y la busqueda web no devolvio ninguna referencia tecnica al modelo: los resultados obtenidos trataban sobre la marca de automoviles OMODA y no guardan relacion con este repositorio.

## Requisitos de hardware

- El adaptador no puede ejecutarse por si solo: requiere cargar Gemma 2 9B Instruct, cuyos pesos en bf16/fp16 ocupan del orden de 18-19 GB, mas el propio adaptador.
- Cuantizacion 4-bit (NF4/bitsandbytes, Q4_K_M en GGUF): aproximadamente 6-7 GB de VRAM para los pesos, mas la cache KV. Cabe en GPUs de consumo con 12-16 GB, como RTX 4080, RTX 4090, RTX 5070 Ti o superiores, con margen limitado.
- Cuantizacion 8-bit: en torno a 10-11 GB de pesos; requiere GPU de 16 GB o mas.
- Precision completa bf16/fp16: 18-19 GB de pesos mas cache KV; recomendable A100 40 GB, H100 80 GB, L40S 48 GB o dos GPUs de 24 GB con paralelismo.
- Cache KV: con la configuracion del modelo base (42 capas, 8 cabezas KV, dimension 256) y atencion alterna local/global, la cache a 8 192 tokens se situa aproximadamente entre 1,5 y 2,8 GB en fp16, segun como se gestione la ventana deslizante. Cifra estimada, no publicada por el autor.
- Ajuste fino adicional del adaptador: al ser LoRA, es viable en una unica GPU de 24 GB con quantizacion de 4 bits y optimizadores de bajo consumo de memoria.
- Opciones de despliegue: transformers con PEFT (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI, llama.cpp u Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF. La fusion previa con `merge_and_unload` es el camino mas sencillo para servir el modelo.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este adaptador.

## Comparativa con modelos similares

No hay datos de rendimiento del adaptador, por lo que la comparacion se limita a caracteristicas estructurales del modelo base y de alternativas habituales de la misma categoria. Las cifras de benchmark se omiten deliberadamente por no estar verificadas en la informacion disponible.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bimabk/dev-S2 (este) | 9,24 B (base) + adaptador LoRA | 8 192 tokens (base) | safetensors PEFT | No declarada | Repositorio con 0 descargas, sin documentacion |
| google/gemma-2-9b-it | 9,24 B | 8 192 tokens | safetensors | Terminos de uso de Gemma | Modelo base oficial, documentado y evaluado |
| unsloth/gemma-2-9b-it | 9,24 B | 8 192 tokens | safetensors | Terminos de uso de Gemma | Version del modelo base distribuida por Unsloth |
| Meta Llama 3.1 8B Instruct | 8,03 B | 128 000 tokens | safetensors | Licencia comunitaria de Llama 3.1 | Alternativa con contexto muy superior |
| Mistral 7B Instruct v0.3 | 7,25 B | 32 000 tokens | safetensors, GGUF | Apache 2.0 | Alternativa permisiva para uso comercial |
| Qwen2.5 7B Instruct | 7,62 B | 131 072 tokens | safetensors, GGUF | Apache 2.0 (segun variante) | Alternativa permisiva con contexto muy amplio |

## Limitaciones y advertencias

- Model card vacia: la totalidad de los campos son la plantilla por defecto de HuggingFace. No hay informacion sobre proposito, datos, hiperparametros ni evaluacion, lo que impide conocer que se entreno ni con que fin.
- Licencia no declarada: al no figurar licencia en el repositorio, no existe autorizacion explicita de uso, y el modelo base se rige por los terminos de uso de Gemma, que impiden una reutilizacion libre. Cualquier uso comercial es juridicamente arriesgado.
- Sin evaluacion: no hay benchmarks, comparaciones con el modelo base ni pruebas de regresion. No puede afirmarse que el adaptador mejore al modelo base en ninguna tarea.
- Riesgo de olvido catastrofico y degradacion: un ajuste LoRA sin validacion documentada puede degradar capacidades del modelo base, especialmente en idiomas distintos del ingles o en tareas fuera del dominio de ajuste.
- Riesgo de alucinacion: identico o superior al del modelo base, incrementado por la falta de alineacion documentada en la fase de ajuste.
- Sesgos: no declarados. Se heredan los del modelo base, entrenado mayoritariamente con texto en ingles y sin auditoria publicada en este repositorio.
- Idiomas: no declarados. El soporte multilingue del modelo base es desigual y el castellano no esta garantizado en un ajuste sin datos documentados.
- Integridad del artefacto: al proceder de un adaptador con ruta de cache local en la etiqueta, no hay garantia de trazabilidad del entrenamiento ni de que los pesos correspondan a una unica ejecucion controlada.
- Sin mantenimiento: creado y actualizado el mismo dia, con 0 descargas y 0 interacciones. No hay senales de soporte, versionado ni correccion de errores.
- Imposibilidad de uso directo: no es un modelo autonomo; requiere descargar aparte el modelo base y disponer de hardware suficiente para 9 B de parametros.
- Aviso para produccion: no desplegar sin fusionar o cargar el adaptador en un entorno controlado, sin auditar los safetensors y sin comparar sistematicamente las salidas frente al modelo base.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/bimabk/dev-S2
- Modelo base declarado: https://huggingface.co/unsloth/gemma-2-9b-it
- Modelo base oficial de Google: https://huggingface.co/google/gemma-2-9b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Libreria PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
- Referencia del tag arXiv 1910.09700 (calculadora de impacto de carbono de Lacoste et al., presente en la plantilla, no relacionada con el entrenamiento): https://arxiv.org/abs/1910.09700
- Busqueda web realizada: no se encontro ningun enlace, paper, blog, demo o repositorio relacionado con este modelo. Los resultados devueltos correspondian a la marca de automoviles OMODA y no son relevantes.
