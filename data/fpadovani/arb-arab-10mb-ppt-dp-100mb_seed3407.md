# fpadovani/arb-arab-10mb-ppt-Dp-100mb_seed3407

## Resumen

`arb-arab-10mb-ppt-Dp-100mb_seed3407` es un ajuste fino supervisado (SFT) del modelo `goldfish-models/arb_arab_10mb`, publicado por el usuario de HuggingFace fpadovani (la entidad de Weights & Biases asociada al experimento es "f-padovani-university-of-groningen"). Se trata de un transformer decoder-only de tipo GPT-2 con 39.087.104 parametros reales (segun los pesos en safetensors), entrenado con TRL 0.23.0, Transformers 4.56.2 y PyTorch 2.5.1+cu121.

El interes del modelo es metodologico mas que de producto. El identificador describe un experimento controlado: modelo base entrenado con 10 MB de texto, variante con 100 MB, un prefijo "ppt" y "Dp" que apuntan a alguna estrategia de seleccion de datos, y la semilla fija 3407 (valor por defecto habitual en scripts de ajuste fino). El repositorio no incluye ninguna descripcion adicional del dataset, del objetivo de entrenamiento ni de los hiperparametros, por lo que la ficha publica queda reducida a la plantilla autogenerada por TRL.

Se publica como artefacto de investigacion reproducible: el modelo tiene 0 descargas y 0 likes, carece de licencia declarada y su tamano (0,6 GB de repositorio) permite entrenarlo y evaluarlo en hardware muy modesto. Es util como linea base en estudios de seleccion de datos, tokenizacion y ajuste fino en arabe con recursos limitados, no como modelo de generacion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (tag `gpt2` en los metadatos de HuggingFace) |
| Parametros totales | 39.087.104 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos sin cuantizar; al ser GPT-2 estandar admite conversion a GGUF e INT8/INT4, pero no se distribuyen versiones oficiales) |
| Idiomas soportados | Arabe, segun el identificador del modelo base (`arb` = arabe estandar, `Arab` = escritura arabe); no confirmado de forma explicita en la model card |
| Licencia | No disponible (la model card contiene el marcador sin rellenar `licence: license` y los metadatos no declaran licencia) |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 0,6 GB |
| Modelo base | `goldfish-models/arb_arab_10mb` |
| Libreria | Transformers (compatible con text-generation-inference y endpoints) |
| Framework de entrenamiento | TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4, Tokenizers 0.22.1 |
| Fecha de creacion | 2026-09-10 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `goldfish-models/arb_arab_10mb`: un transformer decoder-only con atencion causal, en la familia GPT-2. El tamano declarado, 39.087.104 parametros, es muy inferior al GPT-2 small (124 millones), lo que indica una configuracion reducida de capas y/o dimension de embedding, coherente con un modelo monolingue de bajo coste y vocabulario especifico de escritura arabe. No se dispone de la configuracion exacta (numero de capas, cabezas, dimension oculta, tamano de vocabulario ni longitud de contexto) en la informacion proporcionada.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL, sobre el corpus asociado al identificador del modelo (10 MB en el modelo base; el sufijo "100mb" del nombre apunta a un corpus de 100 MB en este experimento). No se documentan el numero de tokens, la composicion del dataset, la plantilla de conversacion utilizada ni si hubo etapas posteriores de RLHF o DPO. Tampoco se documentan innovaciones tecnicas (decodificacion especulativa, atencion lineal, variantes de tokenizacion mas alla de lo que sugiere el nombre). El unico punto de trazabilidad disponible es la ejecucion de Weights & Biases enlazada en la model card. La model card incluye un ejemplo de uso con `pipeline("text-generation")` y una pregunta en ingles formateada como conversacion, lo que sugiere un ajuste sobre formato instruccion, aunque el modelo base es un modelo de lengua monolingue y no un modelo de chat alineado.

## Capacidades

- Generacion de texto autoregresiva en arabe (idioma inferido del modelo base), con calidad esperable propia de un modelo de 39 millones de parametros.
- Continuacion de texto y finalizacion de secuencias cortas.
- Respuesta a instrucciones en formato conversacional simple, siempre que el prompt siga el formato con el que se hizo el SFT; no hay evidencia de alineacion robusta.
- Integracion en el ecosistema Transformers mediante `pipeline`, con soporte de `max_new_tokens` y `return_full_text`.
- Compatibilidad declarada con text-generation-inference y con los endpoints de HuggingFace (tags `text-generation-inference` y `endpoints_compatible`).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, razonamiento multi-paso, modo thinking, vision, audio ni otras modalidades.
- No se documenta capacidad multilingue; por el identificador, el entrenamiento se limita al arabe.
- No se documenta soporte de contexto largo.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: el modelo sirve como punto de partida verificable para replicar un pipeline SFT con TRL y comparar con la ejecucion registrada en Weights & Biases. Su tamano permite reentrenarlo en minutos en una unica GPU consumer.
- Estudio de seleccion de datos y tokenizacion: los sufijos del identificador ("ppt", "Dp", "100mb", "seed3407") apuntan a un diseno experimental sobre que datos y con que vocabulario se entrena un modelo de lengua con pocos recursos. El modelo es util como una de las condiciones de ese estudio.
- Linea base en investigacion sobre arabe de bajos recursos: sirve para medir cuanto aporta un corpus de 10 MB frente a uno de 100 MB en tareas de generacion y de modelado del lenguaje, con un coste computacional minimo.
- Prototipado rapido de interfaces de generacion en arabe: con 39 millones de parametros se puede desplegar en una CPU o en una GPU integrada para validar el flujo completo (tokenizador, prompt, decodificacion) antes de escalar a un modelo mayor.
- Pruebas de infraestructura de despliegue: permite validar configuraciones de text-generation-inference, vLLM o de un contenedor de inferencia sin consumir VRAM significativa, comprobando latencias, batching y formato de respuesta.
- Docencia: ejemplo completo y ligero de como se ajusta, se sube y se consume un modelo con la libreria Transformers, con todos los frameworks y versiones documentados.
- Filtrado y anotacion asistida de corpus arabes: usar el modelo para generar continuaciones o etiquetas preliminares que despues se revisan manualmente, asumiendo una tasa de error alta y usandolo solo como preanotador.
- Generacion de texto sintetico de bajo coste: producir grandes volumenes de texto candidato para experimentos de aumentacion de datos o de deteccion de texto generado, dado el bajo coste por token del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (perplejidad, MMLU, HumanEval, GSM8K, tareas en arabe ni comparaciones con otros modelos), y la busqueda web realizada no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 160 MB en FP32, 80 MB en FP16/BF16, 40 MB en INT8 y 20 MB en INT4 para los pesos, mas el overhead del runtime (activaciones, cache KV y el propio framework), que en la practica domina el consumo total.
- Cabe sin problema en cualquier GPU consumer: GTX 1050 Ti, GTX 1650, RTX 2060, RTX 3060, RTX 4090 o incluso en GPUs integradas. Con 39 millones de parametros no requiere GPU dedicada.
- Inferencia en CPU perfectamente viable, incluidos dispositivos de un solo placa como Raspberry Pi, gracias al tamano reducido del modelo y a la compatibilidad de GPT-2 con llama.cpp.
- GPU de datacenter (A100, H100) no son necesarias ni aportan ventaja practica; solo tendrian sentido para entrenamiento con lotes grandes o para servir muchas replicas en paralelo.
- Opciones de despliegue: `transformers.pipeline` (documentado por el autor), text-generation-inference (tag declarado), vLLM (soporta arquitecturas GPT-2), y conversion a GGUF para llama.cpp u Ollama mediante las herramientas estandar de conversion.
- Latencia y throughput: no disponible. No se han publicado mediciones y dependen por completo del hardware, del backend y de la longitud de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `fpadovani/arb-arab-10mb-ppt-Dp-100mb_seed3407` | 39,1 M | GPT-2 decoder-only, ajustado con SFT | No disponible | Generativo, arabe | No disponible | HuggingFace, 0 descargas |
| `goldfish-models/arb_arab_10mb` (modelo base) | ~39 M (misma familia) | GPT-2 decoder-only | No disponible | Generativo, arabe | No disponible en la informacion proporcionada | HuggingFace |
| Modelos encoder tipo AraBERT / MARBERT | ~136 M y ~163 M respectivamente (datos de conocimiento publico general, no verificados en la informacion proporcionada) | BERT encoder-only | 512 tokens | Comprension, no generativo | Generalmente Apache 2.0 o MIT segun variante | HuggingFace |

La comparacion directa solo es posible con el modelo base, del que este ajuste hereda arquitectura y probablemente tokenizador. Frente a los modelos encoder en arabe, este modelo ocupa un nicho distinto: es generativo, mucho mas pequeno y no esta pensado para tareas de clasificacion o NER de alta calidad, sino para experimentacion sobre entrenamiento y datos.

## Limitaciones y advertencias

- Sesgos conocidos: no evaluados ni documentados. Al entrenarse sobre un corpus reducido de arabe, es probable que reproduzca estereotipos y sesgos presentes en esa fuente, sin ningun filtrado o alineacion declarada.
- Riesgo de alucinacion: muy alto. Un modelo de 39 millones de parametros ajustado sobre un corpus de decenas de megabytes tiene una capacidad de modelado del mundo muy limitada y generara texto incoherente o factualmente incorrecto con frecuencia.
- Limitaciones de idioma: el soporte se limita al arabe segun el identificador del modelo base. El ejemplo de la model card esta en ingles, lo que no garantiza calidad en ese idioma.
- Limitaciones de contexto: la longitud de contexto no esta documentada; en configuraciones GPT-2 reducidas suele ser de 1024 tokens o menos, lo que impide conversaciones largas o documentos extensos.
- Restricciones de licencia: la licencia no esta declarada (el campo de la model card es un marcador vacio). No hay autorizacion explicita de uso comercial, por lo que no deberia utilizarse en produccion sin aclarar previamente los terminos con el autor.
- Caveat de trazabilidad: el modelo no incluye descripcion del dataset, del objetivo de entrenamiento ni de los hiperparametros. Reproducir el resultado exacto es inviable con la informacion publicada.
- Caveat de versiones: depende de versiones concretas de TRL (0.23.0), Transformers (4.56.2) y PyTorch (2.5.1+cu121); cambios de version en Transformers pueden afectar a la carga del tokenizador o a la generacion.
- Advertencia de uso en produccion: no debe emplearse en sistemas de atencion al cliente, generacion de codigo, resumen documental ni cualquier tarea donde un error tenga consecuencias, sin una capa de validacion humana y sin una evaluacion propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/arb-arab-10mb-ppt-Dp-100mb_seed3407
- Modelo base: https://huggingface.co/goldfish-models/arb_arab_10mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/ow8zmj8o
- Repositorio de TRL: https://github.com/huggingface/trl
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo (los enlaces recuperados correspondian a servicios de mapas de Google y no guardan relacion con esta ficha).
