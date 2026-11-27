# 11-47/AGA.FWI

## Resumen

AGA.FWI (Adaptive Generative Architecture · Fast-Weight Injection) es un modelo de lenguaje decoder-only de 11.329.769 parametros, desarrollado por WithIn Us AI y publicado en Hugging Face bajo el identificador `11-47/AGA.FWI`. Se presenta como una demostracion de arquitectura construida desde cero, no como un asistente de proposito general: su interes no reside en el rendimiento bruto, sino en la incorporacion de mecanismos poco habituales en modelos de este tamano, como un nucleo de razonamiento CoT congelado, capas de "fast weights" con estado asociativo por cabeza y adaptadores crecientes que se expanden durante el entrenamiento.

El modelo implementa un unico flujo de inferencia basado en una plantilla fija con etiquetas `<Instruction>`, `<Question>`, `<Think>`, `<Reasoning>` y `<Answer>`, y expone una API propia (`solve()` y `learn_from_interaction()`) en lugar de la interfaz estandar de generacion de Transformers. El nucleo de planificacion CoT, de 1.035.840 parametros, se entrena durante la ventana de preentrenamiento y despues se sella, de modo que la adaptacion en linea nunca lo modifica.

Es relevante ahora como pieza de investigacion reproducible sobre aprendizaje continuo en el propio transformer: propone inyeccion instantanea de conocimiento en pesos abiertos, bancos de memoria asociativa por bloque y un controlador adaptativo de la tasa de aprendizaje, todo con un coste computacional minimo. Conviene subrayar que la model card indica que el estado de entrenamiento es "base", con 0 pasos vistos, por lo que no debe esperarse calidad conversacional utilizable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con nucleo CoT sellado, capas FWI de fast weights y adaptadores crecientes |
| Parametros totales | 11.329.769 (11.198.185 segun la model card; 11.000.041 en la configuracion FULL al nacer) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizaciones) |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | `with-in-us-ai-proprietary` (campo `license: other`) |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only escrito desde cero, con tokenizador ByteLevel-BPE propio de 6.400 tokens activos entrenado sobre el corpus CoT. Sobre la pila decoder se anaden varios componentes: un **CoT Planning Core** de 1.035.840 parametros que comprime instruccion y pregunta en 8 tokens de plan inyectados en el stack; un mecanismo de *pondering* latente con 3 pasos de refinamiento recurrente y acumulacion de halting tipo ACT-lite con mascara causal de prefijo; y un verificador de resolucion de problemas que ramifica el plan en 2 transformaciones de hipotesis enrutadas por un critico aprendido, inicializado a cero.

Las capas **FWI** mantienen un estado asociativo por cabeza actualizado en cada token mediante la regla `S ← γ·S + β·k vᵀ`, de forma que la conversacion reescribe los pesos efectivos sobre la marcha. A ello se suman bancos de memoria asociativa por bloque (compresion, cuello de botella y expansion, inicializados a cero) que se abren con las actualizaciones en linea aceptadas: el primero en la primera actualizacion aceptada y despues uno cada 32 actualizaciones, hasta un maximo de 4. Los adaptadores adaptativos son crecientes y preservan la funcion (`model.grow()`), y el **AdaptiveController** ajusta el calendario de learning rate (warmup y coseno) y amplia la capacidad de los adaptadores cuando la perdida se estanca.

El entrenamiento usa una plantilla fija con perdida ponderada hacia la respuesta sobre `<Think>/<Reasoning>/<Answer>`, y la adaptacion en linea emplea `learn_from_interaction()` con comprobacion de aceptacion (la actualizacion solo se conserva si mejora la perdida), mezcla de replay y proteccion EWC-lite. El corpus declarado es `AGA_FWI_Combined_Dataset.jsonl`. No se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La model card indica fase "base", 0 pasos vistos y 1 evento de crecimiento.

## Capacidades

- Generacion de texto condicionada a la plantilla CoT propietaria (`<Instruction>`, `<Question>`, `<Think>`, `<Reasoning>`, `<Answer>`).
- Razonamiento multi-paso y planificacion mediante el CoT Planning Core sellado, que produce 8 tokens de plan.
- *Pondering* latente con 3 pasos de refinamiento y halting adaptativo.
- Verificacion de soluciones con 2 ramas de hipotesis y un critico aprendido.
- Inyeccion instantanea de conocimiento en pesos abiertos a partir de conversaciones y datasets.
- Aprendizaje continuo en linea con comprobacion de aceptacion, replay y EWC-lite.
- Crecimiento dinamico de adaptadores y apertura de bancos de conocimiento durante el uso.
- Memoria de fast weights persistente a lo largo de la conversacion si se activa `carry_memory=True`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible como capacidad de agente.
- Capacidades multilingues: no disponible.
- Vision, audio o modo thinking separado: no disponible.

## Casos de uso

- **Investigacion sobre aprendizaje continuo en transformers pequenos**: el modelo permite experimentar con `learn_from_interaction()` y observar como evolucionan los pesos abiertos y los bancos de memoria con cada actualizacion aceptada, con un coste de computo de apenas 11 millones de parametros.
- **Prototipado de memorizacion en contexto mediante fast weights**: las capas FWI mantienen estado asociativo por cabeza durante la conversacion, lo que sirve para estudiar si la memoria de trabajo reescribe de forma util el comportamiento del decoder en tareas de dialogo acotadas.
- **Estudio de arquitecturas con nucleo congelado**: el CoT Planning Core sellado permite analizar como un submodulo fijo condiciona la generacion del resto de la red sin que la adaptacion en linea lo altere.
- **Banco de pruebas de plantillas CoT estructuradas**: la plantilla fija con etiquetas separadas para pensamiento, razonamiento y respuesta facilita la evaluacion automatica por etapas y el analisis de donde falla la cadena de razonamiento.
- **Experimentacion con adaptadores crecientes**: `model.grow()` y el AdaptiveController permiten medir el efecto de ampliar capacidad sobre mesetas de perdida en un entorno controlado y de bajo coste.
- **Docencia y divulgacion sobre transformers desde cero**: al no depender de pesos preentrenados de terceros y usar un tokenizador propio de 6.400 tokens, resulta adecuado para explicar el ciclo completo de preentrenamiento, inyeccion de conocimiento y evaluacion.
- **Pruebas de integracion con `trust_remote_code`**: sirve como caso de estudio de carga de arquitecturas personalizadas en Transformers y de gestion de modulos congelados tras la carga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa para los 11,3 millones de parametros; el repositorio ocupa 0,1 GB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090 o incluso una GPU integrada son suficientes. Para entrenamiento o adaptacion en linea, una RTX 4090 o una A100 aportan margen de sobra.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas y en muchas integradas.
- Opciones de despliegue: la arquitectura es personalizada y requiere las clases `AGAFWIConfig` y `AGAFWIForCausalLM` con `trust_remote_code=True`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| AGA.FWI | 11,3 M | No disponible | Propietaria (`with-in-us-ai-proprietary`) | Transformer desde cero con CoT sellado, fast weights y aprendizaje continuo |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Transformer decoder-only clasico preentrenado |
| TinyLlama 1.1B | 1.100 M | 2.048 tokens | Apache 2.0 | Transformer decoder-only preentrenado para uso general |
| SmolLM2-135M | 135 M | 8.192 tokens | Apache 2.0 | Transformer decoder-only preentrenado para uso general |

La comparacion es estructural, no de rendimiento: AGA.FWI es dos ordenes de magnitud menor que los modelos de referencia citados y no declara resultados de evaluacion, por lo que no puede situarse en la misma escala de calidad. Su interes es arquitectonico (nucleo CoT congelado, fast weights, crecimiento de adaptadores) y su licencia propietaria limita la reutilizacion frente a las alternativas de codigo abierto.

## Limitaciones y advertencias

- La propia model card lo califica como demostracion de arquitectura y no como asistente de proposito general; las salidas deben verificarse siempre.
- Estado de entrenamiento en fase "base" con 0 pasos vistos, lo que implica que la calidad de generacion no esta validada.
- La memoria de fast weights es solo en contexto salvo que se use `carry_memory=True`.
- No se declaran idiomas soportados; el tokenizador se entreno sobre un corpus CoT no descrito, por lo que el comportamiento fuera de ese dominio es incierto.
- Riesgo elevado de alucinacion y de respuestas incoherentes dado el tamano y la ausencia de benchmarks publicados.
- La licencia `with-in-us-ai-proprietary` es propietaria y restrictiva; no se detallan los terminos exactos de uso comercial, por lo que debe consultarse al autor antes de cualquier despliegue.
- Requiere `trust_remote_code=True` y clases personalizadas, lo que anade superficie de riesgo en la cadena de suministro y complica la integracion con herramientas estandar.
- No se documentan sesgos conocidos, pero tampoco existe una evaluacion de sesgo publicada.
- La discrepancia entre el recuento de parametros de safetensors (11.329.769) y el de la model card (11.198.185) sugiere que el artefacto puede incluir pesos adicionales o de crecimiento; conviene verificarlo antes de usarlo.
- No hay informacion sobre tool calling, agentes ni integracion con APIs de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/11-47/AGA.FWI
- Repositorio del autor: https://huggingface.co/11-47
- Paper, blog, repositorio de codigo o demo: no disponible en la informacion proporcionada.
