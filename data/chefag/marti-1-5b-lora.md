# chefag/Marti-1.5B-LoRA

## Resumen

Marti-1.5B-LoRA es un artefacto publicado en HuggingFace por el usuario chefag bajo el identificador `chefag/Marti-1.5B-LoRA`. Por el nombre y por el tamaño del repositorio (0,1 GB), todo apunta a que se trata de un adaptador LoRA y no de un conjunto de pesos completos, pero esta circunstancia no está confirmada en la model card, que es la plantilla autogenerada por HuggingFace y no contiene ni una sola sección completada: todos los campos figuran como "[More Information Needed]". No se declara modelo base, arquitectura, tokenizador, datos de entrenamiento, licencia ni idiomas.

El modelo no cuenta con descargas ni interacciones (0 descargas, 0 likes en el momento de la consulta) y fue creado el 17 de octubre de 2026 según los metadatos del Hub, una fecha posterior a la de la mayoría de checkpoints de referencia, lo que sugiere una publicación muy reciente y sin validación comunitaria. La única información técnica fiable que puede extraerse es la declarada en las etiquetas: librería `transformers`, pesos en `safetensors`, flag `endpoints_compatible` y la referencia bibliográfica `arxiv:1910.09700`, que corresponde al artículo del calculador de impacto medioambiental de Lacoste et al. y aparece por defecto en la plantilla, no como cita del modelo.

En consecuencia, esta ficha es fundamentalmente descriptiva del artefacto y de sus metadatos, no del comportamiento del modelo. Cualquier despliegue en producción exige, antes de nada, identificar el modelo base y verificar la licencia y el tokenizador asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `transformers`; no se especifica si es transformer decoder-only, MoE o hibrida) |
| Parametros totales | no disponible (el nombre sugiere un modelo base de ~1,5B; sin confirmar) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tipo de artefacto | no confirmado; el nombre y el tamano del repo (0,1 GB) apuntan a un adaptador LoRA |
| Modelo base | no disponible |
| Libreria | transformers |
| Pipeline declarado | no disponible |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-17 |
| Fecha de actualizacion | 2026-10-17 |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna, el objetivo de entrenamiento, el regimen de precision (fp32, fp16, bf16) ni la infraestructura de computo. La model card incluye las secciones "Training Data", "Training Procedure", "Training Hyperparameters" y "Compute Infrastructure", pero todas ellas contienen unicamente el marcador "[More Information Needed]". El unico indicio estructural es la etiqueta `transformers` combinada con pesos en `safetensors`, compatible con practicamente cualquier familia de modelos decoder-only actuales.

Tampoco se documenta si el ajuste se realizo mediante LoRA, QLoRA o una variante con parametros adicionales, ni se indican rango, alpha, modulos objetivo ni numero de tokens de entrenamiento. No consta que se haya aplicado RLHF, DPO o RLVR, ni existe informacion sobre composicion del dataset, filtrado, deduplicacion o mitigaciones de sesgo. La referencia `arxiv:1910.09700` que aparece en las etiquetas es la cita por defecto de la plantilla de HuggingFace para el calculo de emisiones, no un paper del modelo.

## Capacidades

- No hay informacion verificable sobre capacidades de generacion de texto, razonamiento, codigo o matematicas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes o razonamiento multi-paso.
- No se especifican capacidades multilingues ni idiomas cubiertos.
- No se declara modo "thinking", vision, audio ni ninguna otra modalidad.
- Al ser presumiblemente un adaptador, sus capacidades efectivas dependen por completo del modelo base, que no se identifica.
- El flag `endpoints_compatible` sugiere compatibilidad con el endpoint de inferencia de HuggingFace, pero no implica ninguna garantia funcional.

## Casos de uso

Ninguno de los siguientes escenarios puede darse por valido sin identificar antes el modelo base y verificar la licencia; se enumeran como hipotesis de trabajo condicionadas a esa verificacion.

- Ajuste de dominio sobre el modelo base: el adaptador se cargaria sobre el checkpoint original mediante `PeftModel.from_pretrained` para especializar estilo o terminologia en un dominio concreto; requiere confirmar rango y modulos objetivo para evitar degradacion.
- Prototipado rapido de asistentes conversacionales: al ocupar del orden de 0,1 GB, el adaptador se puede versionar y distribuir junto al modelo base en entornos de desarrollo sin coste de almacenamiento apreciable.
- Evaluacion comparativa de tecnicas de ajuste eficiente: util como artefacto de referencia para medir el efecto de un adaptador frente al modelo base en tareas acotadas, siempre que se disponga del conjunto de evaluacion.
- Experimentacion academica en entornos con GPU de consumo: un adaptador sobre un modelo de ~1,5B es viable en tarjetas de 8-24 GB segun cuantizacion, lo que facilita la reproducibilidad en laboratorios pequenos.
- Integracion en pipelines de inferencia ligeros: junto con vLLM o llama.cpp si se generan pesos fusionados o cuantizados, para tareas de clasificacion y extraccion de informacion de baja latencia.
- Base para futuros merges de adaptadores: combinacion con otros LoRA del mismo modelo base mediante tecnicas de merging, condicionada a que las licencias de todos los artefactos sean compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion "Evaluation" con los campos "Testing Data", "Factors", "Metrics" y "Results", todos ellos sin contenido. No existen datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra prueba, ni curvas de perplexity, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM para inferencia: no disponible con caracter oficial. Como estimacion condicionada a que el modelo base tenga ~1,5B parametros, el peso en fp16 rondaria los 3 GB y en int4 los 0,8-1 GB; a ello hay que sumar KV cache y overhead del runtime.
- GPU recomendadas: no disponible. Para un modelo de esa clase bastaria una RTX 3060 de 12 GB o superior en fp16; una A10G o L4 seria adecuada para servicio concurrente.
- GPU de consumo: presumiblemente viable en RTX 3060/4060 Ti (12-16 GB), RTX 4070 y RTX 4090 en fp16, y en GPUs de 8 GB si se cuantiza a int4.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; vLLM o TGI requeririan fusionar el adaptador en los pesos base (`merge_and_unload`); llama.cpp u Ollama solo si se generan pesos GGUF, que no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, time-to-first-token ni comportamiento bajo batching.

## Comparativa con modelos similares

No existe un comparable directo verificable: no se identifica el modelo base y el artefacto es un adaptador, no un modelo completo. La tabla siguiente recoge modelos abiertos de la clase ~1,5B como referencia de categoria; sus datos provienen de documentacion publica de esos proyectos y no de la informacion proporcionada en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Marti-1.5B-LoRA | no disponible (~1,5B por el nombre) | no disponible | no disponible | safetensors (adaptador presunto) | 0 descargas, model card vacia |
| Qwen2.5-1.5B | 1,54B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Referencia solida en su clase, multilingue |
| SmolLM2-1.7B | 1,7B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Orientado a despliegue en dispositivo |
| Gemma 2 2B | 2,6B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Requiere aceptar terminos en el Hub |

La comparacion real solo sera posible cuando el autor publique el modelo base, la licencia y algun resultado de evaluacion.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos, sesgos, alucinacion o usos fuera de alcance.
- Modelo base sin identificar: no se puede determinar el tokenizador, la ventana de contexto efectiva ni el comportamiento esperado.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial; en la practica, la ausencia de licencia implica reserva de derechos por defecto en muchas jurisdicciones.
- Riesgo de alucinacion y de sesgos: imposible de evaluar sin datos de entrenamiento ni evaluaciones publicadas.
- Cero validacion comunitaria (0 descargas, 0 likes): no hay evidencia de que el adaptador haya sido probado por terceros.
- Fecha de creacion en 2026 y actualizacion tres segundos posterior: el repositorio se subio en un unico paso, sin iteraciones visibles.
- El flag `endpoints_compatible` no garantiza que el modelo funcione en el endpoint de HuggingFace si falta el modelo base o la configuracion de PEFT.
- No se distribuyen pesos cuantizados ni GGUF: cualquier despliegue en llama.cpp u Ollama requiere conversion propia y fusion previa del adaptador.
- Para produccion: exigir auditoria del contenido del repositorio (`adapter_config.json`, `adapter_model.safetensors`) antes de cualquier integracion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chefag/Marti-1.5B-LoRA
- Repositorio MARTI (framework de multiagentes de TsinghuaC3I, sin relacion confirmada con este modelo): https://github.com/TsinghuaC3I/MARTI
- Articulo citado en las etiquetas (Lacoste et al., 2019, sobre emisiones de CO2): https://arxiv.org/abs/1910.09700
- Calculador de impacto medioambiental de ML: https://mlco2.github.io/impact
- No se han encontrado papers, blogs, demos ni repositorios adicionales asociados a este modelo en la busqueda web realizada.
