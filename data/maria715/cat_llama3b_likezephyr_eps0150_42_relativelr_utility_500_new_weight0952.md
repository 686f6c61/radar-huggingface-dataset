# maria715/CAT_llama3b_likeZephyr_eps0150_42_relativelr_utility_500_NEW_weight0952

## Resumen

CAT_llama3b_likeZephyr_eps0150_42_relativelr_utility_500_NEW_weight0952 es un adaptador LoRA publicado por el usuario maria715 en Hugging Face, descrito por su autora como un artefacto derivado de "experimentos de tesis de master sobre entrenamiento adversario para robustez de LLM". No es un modelo completo, sino un conjunto de pesos de ajuste fino (PEFT/LoRA) que debe cargarse sobre un modelo base no declarado explicitamente en la model card.

El identificador del repositorio codifica los hiperparametros del experimento: `llama3b` apunta a un modelo base de la familia Llama de 3 000 millones de parametros (probablemente Llama-3.2-3B), `likeZephyr` sugiere una destilacion o imitacion del estilo de respuesta de la familia Zephyr, `eps0150` corresponde a un presupuesto de perturbacion adversaria de 0,15, `relativelr` a una tasa de aprendizaje relativa, `utility_500` a un conjunto de utilidad de 500 ejemplos y `weight0952` a un peso de 0,952. Toda esta lectura procede unicamente de la cadena del nombre, no de documentacion publicada.

La relevancia del artefacto es acotada y de caracter investigador: se enmarca en la linea de entrenamiento adversario y ruptura de circuitos (tecnicas de tipo CAT, "circuit breaker adversarial training") que buscan reducir la probabilidad de que un modelo emita contenido danino sin degradar su utilidad general. Con cero descargas, cero likes, licencia no declarada y ausencia total de resultados de evaluacion, debe tratarse como material de reproduccion experimental, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base no declarado en la model card (el identificador sugiere Llama-3.2-3B) |
| Parametros totales | No disponible para el adaptador; el modelo base implicito tendria ~3 000 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, sin confirmar) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El unico dato tecnico confirmado es que se trata de un adaptador LoRA (etiquetas `peft`, `lora`, `safetensors`) obtenido mediante entrenamiento adversario (`adversarial-training`) en el marco de una tesis de master. No se publican ni el rango de LoRA, ni los modulos objetivo, ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se especifica la variante exacta del modelo base (si es Llama-3.2-3B, Llama-3.2-3B-Instruct o un fine-tune previo).

El nombre del repositorio permite reconstruir, con cautela, el diseno experimental: entrenamiento adversario con epsilon 0,15 y tasa de aprendizaje relativa, optimizando un compromiso entre utilidad (evaluada sobre 500 ejemplos) y robustez, con un peso de 0,952 asignado a uno de los dos terminos de la funcion de perdida y semilla 42. El sufijo `likeZephyr` indica que el objetivo de comportamiento era imitar el formato de respuesta de Zephyr. Estos valores son inferencias a partir de la nomenclatura, no datos confirmados por la autora, y no deben citarse como especificaciones oficiales.

El tamano del repositorio (1,2 GB) es notablemente superior al habitual en adaptadores LoRA sobre modelos de 3 000 millones de parametros, que suelen ocupar entre decenas y unos pocos cientos de megabytes. Esto sugiere un rango de LoRA elevado, el guardado de estados adicionales del optimizador o la inclusion de varios checkpoints, pero no hay informacion que lo confirme.

## Capacidades

- Generacion de texto: heredada del modelo base, no documentada ni evaluada en la model card.
- Razonamiento e instrucciones: se desconoce si el adaptador preserva la capacidad de seguir instrucciones; `likeZephyr` apunta a un formato conversacional, pero no esta verificado.
- Codigo y matematicas: no disponible; sin evaluaciones publicadas.
- Tool calling / function calling: no disponible; dependeria del modelo base y no hay evidencia de que se haya entrenado para ello.
- Capacidades de agente y razonamiento multi-paso: no disponible; no se mencionan en la documentacion.
- Capacidades multilingues: no disponible; no se declara ninguna lista de idiomas.
- Capacidad especial: el proposito declarado del adaptador es la robustez frente a entradas adversarias, es decir, reducir respuestas daninas bajo prompts manipulados, preservando utilidad. No hay evidencia publicada de que ese objetivo se haya alcanzado.

## Casos de uso

- Reproduccion de experimentos de tesis: el adaptador sirve como artefacto concreto para replicar el pipeline de entrenamiento adversario descrito, comparando la semilla 42 y el peso 0,952 con otras configuraciones de la misma serie.
- Investigacion en robustez adversarial: permite medir la tasa de exito de ataques de jailbreak sobre el modelo fusionado frente al modelo base sin adaptador, en un entorno controlado de laboratorio.
- Evaluacion de compromiso robustez-utilidad: el par de etiquetas `eps0150` y `utility_500` sugiere un barrido de hiperparametros; el adaptador puede usarse como punto de la curva que relaciona perturbacion admisible y degradacion de calidad.
- Comparativa de metodos de alineacion: sirve como linea base de entrenamiento adversario frente a tecnicas como circuit breakers (representacion ortogonal), DPO o filtrado de datos, siempre que se fusionen ambos adaptadores sobre el mismo modelo base.
- Docencia en cursos de seguridad de LLM: permite ilustrar de forma practica como se guarda, carga y fusiona un adaptador LoRA con `peft`, y como se evalua su impacto con un conjunto de utilidad reducido.
- Pruebas de carga de adaptadores en infraestructura de inferencia: util para validar el soporte de LoRA dinamico en servidores como vLLM o TGI, midiendo el coste de conmutar adaptadores en memoria.
- Auditoria de artefactos sin licencia: caso de uso de gobernanza, para practicar la revision de modelos publicados sin licencia, sin metricas y sin modelo base declarado antes de descartarlos para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna evaluacion de robustez (por ejemplo, tasas de ataque exitoso o puntuaciones de utilidad sobre el conjunto de 500 ejemplos). No se deben asumir cifras a partir del nombre del repositorio.

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas del modelo base implicito (3 000 millones de parametros) y no provienen de mediciones publicadas por la autora.

- VRAM para inferencia en FP16/BF16: en torno a 6-8 GB, incluyendo pesos y cache de activaciones para contextos moderados.
- VRAM en cuantizacion de 8 bits: aproximadamente 3,5-5 GB.
- VRAM en cuantizacion de 4 bits (NF4, GPTQ o AWQ): aproximadamente 2,5-4 GB.
- Compatibilidad con GPU de consumo: si, cabe holgadamente. RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090 de 24 GB son suficientes incluso sin cuantizar.
- GPU de centro de datos: A100, H100 o L40S son sobredimensionadas para inferencia, aunque utiles para barridos de evaluacion en paralelo o para reentrenar el adaptador.
- Opciones de despliegue: transformers con peft para cargar el adaptador; vLLM con soporte de LoRA para servir varios adaptadores sobre una misma base; TGI con adaptadores; llama.cpp y Ollama requieren fusionar primero el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles. En una RTX 4090 y FP16, un modelo de 3 000 millones de parametros suele superar los 100 tokens por segundo en generacion, pero es una referencia generica, no una medicion de este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CAT_llama3b_likeZephyr_eps0150_42_relativelr_utility_500_NEW_weight0952 | No disponible (adaptador LoRA sobre base de ~3 000 M) | No disponible | No publicado | No disponible | Hugging Face, 0 descargas |
| meta-llama/Llama-3.2-3B (base probable) | 3 210 M | 128 000 tokens | Publicado por Meta en su model card | Licencia comunitaria de Llama 3.2 | Hugging Face, ampliamente descargado |
| openlm-research/open_llama_3b | 3 400 M | 2 048 tokens | Publicado por el autor | Apache 2.0 | Hugging Face, disponible |
| Adaptadores LoRA tipicos sobre Llama-3.2-3B | Tipicamente 10-200 M | Heredado del base | Variable, rara vez publicado | Habitualmente la del base | Hugging Face |

La comparacion directa no es posible en terminos de rendimiento porque el adaptador carece de evaluaciones. La unica diferencia verificable frente a los otros elementos de la tabla es la naturaleza del artefacto (adaptador frente a modelo completo) y la ausencia de licencia declarada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: sin benchmarks de utilidad, seguridad ni robustez, no hay evidencia de que el entrenamiento adversario haya funcionado ni de que no haya degradado las capacidades del modelo base.
- Modelo base no declarado: la model card no indica sobre que checkpoint exacto se entreno el adaptador, lo que impide reproducir el resultado sin adivinar la version y el estado de alineacion previo.
- Licencia no disponible: sin licencia explicita no se puede asumir permiso de uso comercial; ademas, la licencia del modelo base implicito (por ejemplo, la licencia comunitaria de Llama 3.2) impone sus propias restricciones que este repositorio no aclara.
- Riesgo de alucinacion: no cuantificado; un adaptador entrenado con un objetivo adversario y un conjunto de utilidad de solo 500 ejemplos puede degradar la fidelidad factual del base.
- Sesgos: no documentados. El estilo objetivo `likeZephyr` puede introducir sesgos de estilo y de verbosidad propios de ese linaje de modelos.
- Idioma: no se declara ninguna lista de idiomas; el comportamiento multilingue es incierto y probablemente limitado a lo que herede del base.
- Contexto: no confirmado. El entrenamiento con secuencias cortas o con prompts adversarios podria afectar al uso de contextos largos incluso si el base los soporta.
- Uso responsable: cualquier evaluacion con prompts adversarios debe hacerse en un entorno aislado y con fines de investigacion en seguridad, no para generar contenido danino.
- Madurez del artefacto: cero descargas, cero likes y dos minutos entre creacion y ultima actualizacion indican un repositorio de volcado experimental, sin mantenimiento ni soporte.
- Tamano inusual del repositorio: 1,2 GB para un adaptador sobre un modelo de 3 000 millones de parametros sugiere que puede contener estado adicional o varios checkpoints, lo que complica saber que pesos son los definitivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maria715/CAT_llama3b_likeZephyr_eps0150_42_relativelr_utility_500_NEW_weight0952
- Modelo base probable, Llama-3.2-3B: https://huggingface.co/meta-llama/Llama-3.2-3B
- Alternativa de 3 000 millones de parametros con licencia Apache 2.0: https://huggingface.co/openlm-research/open_llama_3b

Nota: el resto de resultados de la busqueda web (Perplexity, ChatGPT, un repositorio de investigacion de malware y otros) no guardan relacion con este modelo y se han descartado. No se han encontrado articulos, papers, repositorios de codigo ni demos asociados al adaptador.
