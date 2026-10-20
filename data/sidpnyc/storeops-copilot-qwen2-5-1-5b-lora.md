# sidpnyc/storeops-copilot-qwen2.5-1.5b-lora

## Resumen

`sidpnyc/storeops-copilot-qwen2.5-1.5b-lora` es un ajuste fino mediante LoRA del modelo `unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit`, publicado por el usuario `sidpnyc`. Se trata, por tanto, de un derivado de Qwen2.5-1.5B-Instruct, un transformer decoder-only de aproximadamente 1.500 millones de parametros orientado a generacion de texto e instrucciones. El nombre del repositorio sugiere un enfoque vertical hacia operaciones de tienda o retail ("storeops copilot"), aunque la model card no documenta ni el dataset ni el dominio de entrenamiento de forma explicita.

El interes practico de esta publicacion es limitado pero concreto: demuestra un flujo de ajuste fino ligero con Unsloth sobre una base ya cuantizada a 4 bits, lo que reduce los requisitos de VRAM a un rango asequible para GPU de consumo. El repositorio ocupa 0,1 GB, un tamano coherente con un adaptador LoRA en lugar de un modelo completo fusionado, lo que condiciona su despliegue: no es cargable directamente como un modelo autonomo sin el modelo base.

La informacion publicada es muy escasa: no hay resultados de benchmarks, no se detalla la composicion del dataset, no se indica el numero de tokens de entrenamiento y no hay ejemplos de uso. Esta ficha refleja esa ausencia de datos de forma explicita y separa lo que procede de la model card de lo que se hereda de la documentacion publica del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), ajuste fino con LoRA sobre base cuantizada a 4 bits; no se detalla en la model card |
| Parametros totales | Aproximadamente 1.500 millones en el modelo base (`Qwen2.5-1.5B-Instruct`); el adaptador LoRA anade un numero no especificado de parametros entrenables |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; heredada del modelo base (documentacion publica de Qwen2.5-1.5B-Instruct: 32.768 tokens) |
| Tipos de cuantizacion | Base de entrenamiento en `bnb-4bit` (bitsandbytes 4 bits); el repositorio no publica variantes GGUF ni cuantizaciones adicionales |
| Idiomas soportados | Ingles (`language: en` en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (adaptador LoRA), libreria `transformers`; tamano del repo 0,1 GB |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por adaptadores LoRA sobre `unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit`. La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal y embeddings rotatorios posicionales (RoPE), propio de la familia Qwen2. La model card no aporta detalles sobre el rango del LoRA, las capas objetivo, la tasa de aprendizaje ni el numero de pasos; solo indica que el entrenamiento se realizo con Unsloth, que la libreria empleada es `transformers` y que en las etiquetas figuran `unsloth` y `trl`.

No hay informacion sobre el dataset de entrenamiento: se desconoce el numero de tokens, la composicion, si hubo instrucciones sinteticas, si se aplicaron tecnicas de RLHF, DPO o SFT supervisado, y si se filtro por calidad. Tampoco se documenta ninguna innovacion tecnica adicional mas alla del uso de Unsloth para acelerar el ajuste (el autor afirma un entrenamiento "2x faster" sin aportar mediciones). Un detalle relevante para produccion es que el ajuste se hizo sobre una base ya cuantizada a 4 bits: fusionar el adaptador con los pesos originales en fp16 para obtener un modelo completo puede degradar la calidad o requerir recalibracion, y el autor no documenta ese procedimiento.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Razonamiento basico y resposta a preguntas de dominio general, limitado por el tamano del modelo (1.500 millones de parametros).
- Generacion de codigo sencillo y explicaciones tecnicas breves, capacidad propia de la familia Qwen2.5.
- Seguimiento de instrucciones multi-turno, sujeto a la ventana de contexto del modelo base.
- Capacidad potencial de tool calling o function calling heredada del formato de chat de Qwen2.5-Instruct; no verificada en este ajuste ni documentada por el autor.
- Uso como copiloto de operaciones de tienda segun el nombre del repositorio; la especializacion real no esta documentada ni demostrada con ejemplos.
- Capacidades multilingues: limitadas al ingles segun la model card, aunque el modelo base soporta mas idiomas y el ajuste podria haber degradado ese comportamiento.
- No se documentan capacidades de vision, audio, modo thinking explicito ni agentes multi-paso.

## Casos de uso

- Prototipado de un copiloto interno de operaciones de tienda: el modelo puede responder consultas en ingles sobre procedimientos, incidencias o politicas internas, siempre que se le proporcione la base documental en el prompt, dado su reducido tamano y su naturaleza de ajuste ligero.
- Prueba de concepto de ajuste fino con Unsloth: sirve como referencia reproducible de un pipeline LoRA sobre una base cuantizada a 4 bits, util para equipos que evaluan coste y viabilidad de este flujo antes de escalar a modelos mayores.
- Clasificacion y extraccion de entidades en textos cortos en ingles (tickets, partes de incidencia, correos): tareas de formato estricto donde un modelo de 1.500 millones bien guiado suele ser suficiente y el coste por inferencia es minimo.
- Generacion de respuestas en plantillas para atención al cliente de bajo riesgo: borradores que un humano revisa antes de enviar, aprovechando la latencia baja en GPU de consumo.
- Base para un router o clasificador de intenciones dentro de una arquitectura mayor: el modelo decide a que herramienta o submodelo derivar una consulta, con la ventaja de que cabe en una sola GPU pequeña.
- Experimentacion academica sobre riesgos de ajuste en modelos pequenos: permite estudiar como un LoRA de dominio especifico afecta a las capacidades generales y al comportamiento multilingue de la base.
- Despliegue en entornos con recursos muy limitados (una unica RTX 3060 o incluso CPU con cuantizacion agresiva), para tareas de generacion asistida sin requisitos de alta calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (MMLU, HumanEval, GSM8K ni evaluaciones propias del dominio de retail), y la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo.

## Requisitos de hardware

- VRAM para el adaptador: el repositorio ocupa 0,1 GB, por lo que los pesos del LoRA son marginales frente al modelo base.
- VRAM para el modelo base en 4 bits: en torno a 1-1,5 GB de pesos, mas overhead de activaciones y cache KV; estimacion practica de 2-3 GB para contexto moderado.
- VRAM para el modelo base en fp16: aproximadamente 3 GB de pesos; estimacion practica de 4-6 GB segun longitud de contexto.
- GPU de consumo: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y en GPUs de 6-8 GB con cuantizacion de 4 bits.
- GPU de datacenter: A100, H100 y L4 son sobredimensionadas para este tamano; su uso tendria sentido solo por agregacion de muchas instancias en un servidor de inferencia.
- Opciones de despliegue: `transformers` + PEFT para cargar el adaptador sobre el modelo base; vLLM y TGI son compatibles con el modelo base, pero el repositorio contiene solo el adaptador y el autor no documenta el proceso de fusion ni de carga con estas herramientas. llama.cpp u Ollama requeririan convertir previamente el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles. En una GPU de consumo, un modelo de 1.500 millones en 4 bits suele operar en el rango de decenas a centenares de tokens por segundo, pero no hay mediciones publicadas para este ajuste concreto.

## Comparativa con modelos similares

Datos del modelo base segun documentacion publica de cada proyecto; no verificados en la informacion proporcionada para esta ficha. El ajuste LoRA no altera el recuento de parametros ni la ventana de contexto nominal.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| storeops-copilot-qwen2.5-1.5b-lora | ~1,5 B (base) | Heredado del base (32.768 tokens segun doc. publica) | Apache 2.0 | Adaptador LoRA en HF; requiere modelo base | Sin benchmarks ni dataset documentados |
| Qwen2.5-1.5B-Instruct | ~1,5 B | 32.768 tokens | Apache 2.0 | Pesos completos en HF | Modelo de referencia; multilingue y con soporte de tool calling documentado |
| Llama-3.2-1B-Instruct | ~1,2 B | 128.000 tokens | Licencia comunitaria Llama 3.2 | Pesos completos en HF | Contexto mucho mayor; licencia con restricciones de uso |
| SmolLM2-1.7B-Instruct | ~1,7 B | 8.192 tokens (ampliable) | Apache 2.0 | Pesos completos en HF | Alternativa abierta centrada en eficiencia |
| Gemma 2 2B Instruct | ~2,6 B | 8.192 tokens | Terminos de uso de Gemma | Pesos completos en HF (con aceptacion) | Mayor numero de parametros; licencia no plenamente permisiva |

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay dataset, hiperparametros, curvas de entrenamiento ni evaluacion. No es posible determinar si el ajuste mejora o degrada el comportamiento del modelo base.
- Riesgo alto de alucinacion, agravado por el tamano reducido (1.500 millones de parametros) y por la falta de evaluacion especifica del dominio.
- Idioma: la model card declara unicamente ingles. No hay evidencia de soporte de castellano ni de otros idiomas tras el ajuste, y un LoRA de dominio puede haber erosionado las capacidades multilingues de la base.
- El repositorio contiene presumiblemente solo el adaptador LoRA (0,1 GB). No es un modelo autonomo: requiere descargar el modelo base y cargar el adaptador con PEFT, un procedimiento que el autor no documenta.
- La base de entrenamiento esta cuantizada a 4 bits (`bnb-4bit`). Fusionar el adaptador con pesos en fp16 para producir un modelo completo puede introducir perdida de calidad y no esta documentado.
- Compatibilidad dudosa con text-generation-inference pese a la etiqueta `text-generation-inference`: TGI espera pesos completos o adaptadores con un formato y configuracion concretos que no se han verificado.
- Licencia Apache 2.0 en el adaptador, lo que permite uso comercial, pero el usuario debe verificar tambien las condiciones del modelo base y de las herramientas empleadas (Unsloth, bitsandbytes).
- Sin senales de adopcion: 0 descargas y 0 "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; el unico resultado obtenido era contenido no relacionado y de caracter adulto, descartado por completo. Cualquier referencia externa a este modelo debe considerarse inexistente.
- No apto para production sin una evaluacion propia previa: conviene comparar contra el modelo base sin ajustar en el conjunto de tareas objetivo antes de adoptarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sidpnyc/storeops-copilot-qwen2.5-1.5b-lora
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-1.5B-Instruct-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper, blog o demo del modelo: no disponible
- Resultados de busqueda web relevantes: no disponible (la busqueda no devolvio resultados relacionados con el modelo)
