# abr-6024/indian-address-parser-1.5B

## Resumen

El Indian Address Parser 1.5B es un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct desarrollado por el usuario abr-6024, publicado bajo licencia Apache-2.0. Su proposito es convertir direcciones indias desordenadas —con abreviaturas, erratas, referencias a puntos de interes, grafias Hinglish o Tanglish y nombres antiguos de ciudades— en un objeto JSON estructurado con nueve campos fijos: flat, building, street, landmark, area, city, state, pincode y phone.

Se trata de un modelo especializado de extraccion de informacion, no de un modelo de proposito general. La relevancia reside en que resuelve una tarea muy concreta del sector logistico y de comercio electronico en India, donde las direcciones carecen de un formato estandar y su normalizacion es un cuello de botella habitual en los pipelines de envio y gestion de datos.

El modelo tiene 1.543.714.304 parametros (aproximadamente 1,5 mil millones), hereda la arquitectura transformer decoder-only de Qwen2 y se distribuye unicamente en formato safetensors. La informacion disponible no especifica la longitud de contexto, que se asume heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.543.714.304 (aproximadamente 1,5B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; corresponde a la heredada del modelo base Qwen2.5-1.5B-Instruct |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors sin cuantizar) |
| Idiomas soportados | Ingles (etiquetado como en); tolera grafias Hinglish y Tanglish en la entrada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1,5 mil millones de parametros. El ajuste se realizo mediante LoRA con rango r=16, alpha=32 y aplicado a todas las capas lineales; los adaptadores se fusionaron posteriormente en los pesos base, de modo que el repositorio contiene un unico checkpoint denso y no requiere cargar adaptadores por separado.

El entrenamiento utilizo 6.000 direcciones sinteticas durante 2 epocas con perdida calculada solo sobre la completion (completion-only loss), lo que concentra el aprendizaje en la generacion del JSON de salida. El conjunto de datos, abr-6024/indian-address-parsing-synthetic, es publico y los scripts de generacion y evaluacion estan incluidos en el repositorio, de modo que los resultados son reproducibles. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. La innovacion principal es el propio formato de tarea: el modelo exige un system prompt concreto y devuelve siempre las mismas nueve claves, usando cadena vacia para los campos ausentes.

## Capacidades

- Extraccion de informacion: convierte texto libre de direcciones indias en JSON valido con las claves flat, building, street, landmark, area, city, state, pincode y phone.
- Normalizacion de entidades: resuelve abreviaturas (por ejemplo "nr" por near), erratas, grafias Hinglish o Tanglish y nombres antiguos de ciudades (por ejemplo Madras por Chennai, segun el ejemplo de la model card).
- Generacion de JSON estricto: en el conjunto de prueba sintetico mantiene un 100% de JSON valido.
- Dialogo por turnos: se usa a traves de una plantilla de chat (apply_chat_template) con un mensaje de sistema y un mensaje de usuario, por lo que admite integraciones conversacionales.
- Formato de salida determinista: con decodificacion greedy (do_sample=False) produce una salida estable.
- Capacidad multilingue limitada: pese a estar etiquetado solo para ingles, la model card indica que tolera entradas con mezcla de transliteraciones; no esta disenado para direcciones en alfabetos no latinos.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni modo de pensamiento.

## Casos de uso

- Logistica de ultima milla: el modelo normaliza direcciones que llegan en formatos heterogeneos desde formularios, hojas de calculo o mensajes de clientes, y las entrega como JSON listo para alimentar un sistema de ruteo o una etiqueta de envio.
- Comercio electronico y checkout: integrado en el flujo de compra, estructura automaticamente la direccion de envio introducida por el usuario y rellena los campos de ciudad, estado y codigo postal antes de la validacion.
- Limpieza de bases de datos CRM: procesa por lotes registros historicos con campos mezclados en un solo campo de texto y los separa en columnas estructuradas, lo que facilita deduplicar y migrar datos.
- Onboarding de comercios o repartidores: dado que muchos formularios en India recogen la direccion como texto libre, el modelo permite extraer area, ciudad y codigo postal para verificar la cobertura de servicio.
- Analisis de resenas y tickets de soporte: extrae la ubicacion mencionada en reclamaciones o comentarios y la convierte en datos agregables por region.
- Validacion previa a logica de negocio: como primer paso de un pipeline mas amplio (por ejemplo, comprobacion de codigo postal contra el area), el modelo ahorra trabajo de parseo al entregar campos ya separados.
- Anonimizacion y enmascarado de datos personales: al aislar el campo phone y la direccion en claves independientes, simplifica su tratamiento en flujos de proteccion de datos.
- Prototipado rapido y demos: con 1,5B de parametros se puede desplegar en un solo acelerador o incluso en CPU, lo que lo hace util para pruebas de concepto de extraccion de direcciones sin infraestructura dedicada.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a un conjunto de prueba sintetico reservado de 500 direcciones. Los nombres de edificios, calles y puntos de interes del conjunto de prueba nunca aparecen en entrenamiento. La metrica es coincidencia exacta tras normalizar mayusculas y espacios.

| Metrica | Qwen2.5-1.5B-Instruct (base) | Este modelo |
|---|---|---|
| JSON valido | 100,0% | 100,0% |
| Coincidencia exacta del registro completo | 1,4% | 98,0% |
| flat | 83,8% | 100,0% |
| building | 51,2% | 100,0% |
| street | 35,8% | 99,0% |
| landmark | 23,2% | 99,4% |
| area | 64,0% | 99,6% |
| city | 71,8% | 100,0% |
| state | 72,6% | 100,0% |
| pincode | 74,2% | 100,0% |
| phone | 62,2% | 100,0% |

No se han publicado resultados sobre direcciones reales ni sobre benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Pesos en precision completa (fp16/bf16): aproximadamente 3,1 GB, coherente con el tamano del repositorio.
- VRAM estimada para inferencia: en fp16, del orden de 4 a 5 GB contando pesos y cache de activaciones; en int8, en torno a 2 GB; en int4, alrededor de 1 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- Cabe con holgura en GPU de consumo: RTX 3060 12 GB, RTX 4070, RTX 4090 (carga completa en fp16 sin necesidad de cuantizar). Tambien deberia ejecutarse en GPU con 6-8 GB de VRAM.
- Es viable su ejecucion en CPU para cargas de baja concurrencia, dado el reducido tamano del modelo.
- Opciones de despliegue: la model card solo documenta transformers con AutoModelForCausalLM y device_map='auto'. Las etiquetas del repositorio incluyen text-generation-inference y endpoints_compatible, lo que sugiere compatibilidad con TGI y con endpoints gestionados. No se distribuyen pesos en GGUF, por lo que no hay soporte nativo para llama.cpp u Ollama sin conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Indian Address Parser 1.5B | 1,5B | No disponible | Extraccion de direcciones indias a JSON | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | No disponible | Proposito general (chat, generacion) | Apache-2.0 | HuggingFace |
| Otros parsers de direcciones | No disponible | No disponible | Extraccion de direcciones | No disponible | No disponible |

La comparacion significativa es contra su propio modelo base: la misma arquitectura y tamano, pero el ajuste eleva la coincidencia exacta del registro completo del 1,4% al 98,0% en el conjunto de prueba sintetico. No se conocen en la informacion proporcionada otros modelos especializados comparables.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente sobre datos sinteticos. La precision sobre direcciones reales no se ha medido y previsiblemente sera inferior; hay que validar con datos propios antes de usarlo en produccion.
- Los codigos postales se extraen, no se validan contra el area o ciudad declaradas.
- El entrenamiento cubre 15 ciudades y un conjunto fijo de areas; otras regiones pueden rendir peor.
- No es adecuado para direcciones en alfabetos no latinos.
- Requiere usar el system prompt exacto con el que fue entrenado; cambiar las claves o el formato puede degradar la salida.
- Riesgo de alucinacion: al ser un modelo generativo, puede rellenar campos con valores plausibles aunque no aparezcan en la entrada; conviene validar la salida en produccion.
- Sesgos: al derivar de Qwen2.5 y entrenarse con datos sinteticos generados por el propio autor, puede reproducir los sesgos del generador y del modelo base; no se documentan auditorias de sesgo.
- Licencia Apache-2.0: permite uso comercial, pero se hereda de Qwen2.5-1.5B-Instruct y se debe mantener la atribucion al equipo de Qwen que figura en la model card.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, lo que limita la evidencia externa sobre su comportamiento en escenarios reales.
- La longitud de contexto no se especifica, por lo que direcciones muy largas o conversaciones con historial extenso podrian superar la ventana soportada y truncarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abr-6024/indian-address-parser-1.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/abr-6024/indian-address-parsing-synthetic
- Los resultados de la busqueda web no aportan enlaces relevantes al modelo: las coincidencias para el termino "abr" corresponden a empresas francesas de construccion y rechapado sin relacion con este proyecto. No se han encontrado papers, blogs ni repositorios adicionales en la informacion disponible.
