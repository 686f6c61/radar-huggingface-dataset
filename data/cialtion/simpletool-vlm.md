# Cialtion/SimpleTool-VLM

## Resumen

SimpleTool-VLM es un modelo de vision-lenguaje publicado por el usuario Cialtion en Hugging Face, construido a partir de un Qwen3-VL-4B al que se ha adaptado para emitir llamadas a herramientas estructuradas a partir de imagenes y texto. El modelo genera un nombre de funcion y, de forma dinamica, solo las cabeceras de argumentos (`arg1...argN`) que exige el esquema de herramientas suministrado, donde `N` es el numero maximo de propiedades definido en dicho esquema. Se trata de un release de investigacion, no de un producto cerrado.

El checkpoint publicado es la fusion en BF16, con 4.825.491.968 parametros (aproximadamente 4,8 mil millones) y un repositorio de 9,7 GB en formato safetensors. El autor anuncia dos variantes cuantizadas adicionales, W4A16 y FP8, que comparten el mismo adaptador de tarea y contrato de tokenizer. La model card describe dos modos de operacion, Direct y Adaptive, y enfatiza que la imagen se pasa como pixeles, sin copiar valores de facturas a campos ocultos del prompt.

Su relevancia actual es acotada pero concreta: se situa en la interseccion entre modelos VLM pequenos y agentes que necesitan decidir acciones estructuradas en tiempo real (interfaces de agentes embodied, tool calling multimodal). Ahora bien, el repositorio no tiene descargas ni likes, no publica benchmarks y el propio autor limita explicitamente el alcance de lo que el modelo demuestra. Debe tratarse como material de investigacion reproducible, no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; familia Qwen3-VL (transformer multimodal con entrada de imagen en pixeles) |
| Parametros totales | 4.825.491.968 (aproximadamente 4,8 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint fusionado publicado), W4A16 y FP8 (anunciados, sujetos a que la subida este completa) |
| Idiomas soportados | no disponible |
| Licencia | Codigo y documentacion del release: Apache-2.0. El checkpoint queda sujeto a la licencia del modelo base Qwen3-VL y a los terminos upstream, que el usuario debe revisar |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se proporcionan detalles tecnicos sobre la arquitectura interna mas alla de que parte de Qwen3-VL-4B, un modelo de vision-lenguaje de la familia Qwen3-VL. El elemento diferencial descrito es la cabeza de salida: en lugar de generar texto libre, el modelo emite un nombre de funcion acompanado de un numero dinamico de cabeceras de argumentos (`arg1...argN`), dimensionado segun el maximo de propiedades del esquema de herramientas proporcionado. La imagen se inyecta como pixeles y el autor indica explicitamente que los valores de factura no se copian a campos ocultos del prompt, lo que sugiere un enfasis en la trazabilidad de la decision.

Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card menciona la existencia de un adaptador de tarea compartido entre el checkpoint BF16 y las variantes cuantizadas, y que se preservan las salidas crudas de las ramas y su legalidad para auditoria. El autor advierte de que el release no reclama paridad numerica estricta entre el adaptador y el modelo fusionado, ni robustez ante imagenes arbitrarias, ni superioridad en OCR, ni chain-of-thought nativo de Qwen.

## Capacidades

- Generacion de llamadas a herramientas estructuradas a partir de entrada multimodal (imagen y texto): nombre de funcion mas argumentos dinamicos `arg1...argN`.
- Dos modos de operacion declarados: Direct y Adaptive.
- Entrada de imagen en formato PNG a traves del servicio HTTP de ejemplo, junto con mensajes de texto y herramientas estilo OpenAI.
- Manejo de esquemas de herramientas con un numero variable de propiedades, ajustando el tamano de la cabeza de argumentos.
- Auditoria: el servicio devuelve `prediction.raw`, `prediction.legal`, `events` y tiempos del servidor, lo que permite inspeccionar la salida cruda y su legalidad respecto al esquema.
- Modo Adaptive con un campo `content` corto controlado por la tarea (no es razonamiento extendido ni chain-of-thought nativo).
- No se documentan capacidades de tool calling multi-turno, agentes de varios pasos, audio, generacion de codigo general ni cobertura multilingue declarada.

## Casos de uso

- Extraccion de campos de facturas hacia un esquema de funcion: el modelo recibe el PNG de la factura y un esquema de herramientas, y devuelve la funcion con los argumentos requeridos. Es el escenario del ejemplo incluido (`examples/invoice_request.json`), pensado como demostracion de protocolo.
- Validacion previa de acciones en agentes embodied: dado un frame de imagen y un conjunto de herramientas disponibles (por ejemplo, mover, agarrar, soltar), el modelo emite la funcion y sus argumentos, y el campo `prediction.legal` permite comprobar si la salida respeta el esquema antes de ejecutar.
- Investigacion en decisiones estructuradas en tiempo real: el servicio HTTP ligero de `inference/` permite medir latencias y tiempos de servidor para estudiar el coste de la decision multimodal.
- Enrutado de peticiones en pipelines de automatizacion documental: usar la funcion predicha como selector de la siguiente etapa del pipeline, manteniendo la salida cruda para auditoria.
- Prototipado de interfaces de agente que combinan percepcion visual y tool calling, sustituyendo el parseo de texto libre por una salida con estructura fija.
- Evaluacion comparativa de adaptadores de tarea sobre Qwen3-VL-4B: al compartir tokenizer y adaptador entre BF16, W4A16 y FP8, permite estudiar el efecto de la cuantizacion en tareas de decision estructurada.
- Auditoria y trazabilidad: en entornos donde se requiere registrar por que se eligio una accion, los eventos y la salida legal permiten reconstruir la decision sin depender de campos ocultos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de tareas de OCR o tool calling, y el autor declina explicitamente cualquier reclamacion de superioridad en OCR o de paridad numerica entre adaptador y checkpoint fusionado.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del numero de parametros y del formato de pesos, no datos publicados por el autor.

- VRAM estimada en BF16: en torno a 9,7 GB solo para pesos, mas overhead de activaciones y cache KV; con contexto corto, aproximadamente 12-14 GB.
- VRAM estimada en FP8: en torno a 5 GB de pesos, con overhead adicional.
- VRAM estimada en W4A16: en torno a 3 GB de pesos, con overhead adicional.
- GPU recomendadas: A100 40 GB o H100 para experimentacion comoda en BF16; RTX 4090, RTX 3090 o RTX 4080 (24 GB o menos) son suficientes para BF16 con margen ajustado y para las variantes cuantizadas.
- Cabe en GPU de consumo: si, en BF16 en tarjetas de 16-24 GB y con holgura en las variantes FP8 y W4A16.
- Opciones de despliegue: el repositorio incluye una implementacion HTTP ligera en `inference/` que acepta un PNG, mensajes de texto y herramientas estilo OpenAI. Para las variantes cuantizadas, el autor indica que el soporte depende del stack de serving; no se especifica compatibilidad con llama.cpp, Ollama, vLLM o TGI, y no se publica formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Los datos de los modelos comparables no estan disponibles en la informacion proporcionada, por lo que la tabla se limita a lo que consta para SimpleTool-VLM.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SimpleTool-VLM (Cialtion) | 4,83 B (BF16) | no disponible | sin benchmarks publicados | Codigo Apache-2.0; checkpoint sujeto a licencia de Qwen3-VL | Hugging Face, 0 descargas, variantes W4A16 y FP8 anunciadas |
| Qwen3-VL-4B (modelo base) | no disponible en esta busqueda | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la misma categoria (VLM de ~4 B con tool calling) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor declara que el release no garantiza paridad numerica estricta entre el adaptador de tarea y el checkpoint fusionado; los resultados pueden diferir entre BF16, FP8 y W4A16.
- No se reclama robustez ante imagenes arbitrarias ni superioridad en OCR. El modelo no es un benchmark de OCR y no debe usarse como sistema contable de facturas.
- No hay chain-of-thought nativo de Qwen; en el modo Adaptive el campo `content` es un campo corto controlado por la tarea, no un razonamiento extendido.
- Riesgo de alucinacion en los argumentos generados: al producir valores estructurados a partir de pixeles, puede inventar nombres de funcion o argumentos que el esquema no contempla. El propio autor insiste en validar cada accion antes de ejecutarla.
- La demo de facturas es una demostracion de protocolo de extremo a extremo, no un sistema de aprobacion financiera.
- Licencia: el codigo y la documentacion del release son Apache-2.0, pero el checkpoint queda sujeto a la licencia del modelo base Qwen3-VL y a terminos upstream. Es obligatorio revisar esos terminos antes de redistribuir o desplegar comercialmente.
- No se declaran idiomas soportados, por lo que el comportamiento multilingue es desconocido y debe validarse caso por caso.
- Longitud de contexto no documentada: no hay garantia sobre el manejo de entradas largas o conversaciones multi-turno.
- Estado del arte del repositorio: 0 descargas y 0 likes, creado el 2026-09-20, sin pipeline declarado y con las variantes cuantizadas aun no confirmadas como subidas. Es un release de investigacion sin validacion externa conocida.

## Enlaces

- Hugging Face: https://huggingface.co/Cialtion/SimpleTool-VLM
- Variante W4A16 (anunciada): https://huggingface.co/Cialtion/SimpleTool-VLM-W4A16
- Variante FP8 (anunciada): https://huggingface.co/Cialtion/SimpleTool-VLM-FP8
- Paper, blog o repositorio adicional: no disponible. Las busquedas web realizadas no devolvieron resultados relevantes para este modelo.
