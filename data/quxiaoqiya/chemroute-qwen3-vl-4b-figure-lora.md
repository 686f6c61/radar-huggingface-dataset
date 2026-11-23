# quxiaoqiya/ChemRoute-Qwen3-VL-4B-figure-lora

## Resumen

ChemRoute-Qwen3-VL-4B-figure-lora es un adaptador LoRA (PEFT) desarrollado por el usuario quxiaoqiya que especializa el modelo multimodal Qwen3-VL-4B-Instruct en el analisis de figuras cientificas y sus pies de figura en el ambito de la quimica y la ciencia de materiales. No es un modelo autonomo: requiere descargar por separado los pesos base de Qwen3-VL-4B-Instruct y cargar el adaptador sobre ellos. Su funcion es transformar una imagen de figura mas su caption en un objeto JSON compacto con campos estructurados sobre relevancia y tipo de figura, estructura de paneles, fuentes de evidencia, objetivos de extraccion, indicadores de calidad y, opcionalmente, cajas delimitadoras de regiones.

El adaptador esta pensado como componente de un servicio interno de analisis de figuras (ChemRoute), no como un modelo de proposito general. El checkpoint publicado corresponde a la seleccion `formal-lr1e-4-seed42::checkpoint-30`, elegido sobre un conjunto de validacion de 16 ejemplos derivados de anotacion humana. La relevancia practica es acotada pero concreta: ofrece un contrato de tarea congelado (prompt y esquema JSON incluidos en el repositorio) que permite integrar analisis estructurado de figuras cientificas en pipelines de extraccion documental.

Por su naturaleza de adaptador sobre una base de 4B parametros, el coste computacional es el de Qwen3-VL-4B-Instruct mas el pequeno delta de los pesos LoRA. La licencia declarada es Apache 2.0, aunque el uso queda sujeto tambien a la licencia del modelo base. El proyecto esta en fase temprana: cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicos sobre el rendimiento real en dominios cientificos nuevos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen3-VL-4B-Instruct (transformer multimodal vision-lenguaje) |
| Parametros totales | No disponible (adaptador LoRA; la base Qwen3-VL-4B-Instruct tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de la base Qwen3-VL-4B-Instruct; no declarada en la model card) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende de la base) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (sujeta ademas a la licencia del modelo base) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-VL-4B-Instruct, un modelo multimodal de tipo vision-lenguaje que procesa pares imagen-texto y genera texto. El adaptador en si es un LoRA entrenado con PEFT 0.17.1 sobre PyTorch 2.6.0+cu124, Transformers 4.57.1, Accelerate 1.7.0 y Pillow 11.3.0. No se especifica en la model card el rango del LoRA, los modulos objetivo ni el numero de parametros entrenables.

El entrenamiento utilizo un split de desarrollo congelado de 115 ejemplos de figuras derivados de anotacion humana y un split de validacion de 16 ejemplos, separados por familia de papers para evitar filtracion. La seleccion del checkpoint se hizo sobre validacion. Se menciona que un candidato adicional entrenado con un delta de anotacion fue rechazado para promocion y no esta representado por este adaptador. No se detalla la composicion del dataset, el numero de tokens de entrenamiento ni si hubo RLHF o DPO; al tratarse de un adaptador de tarea con salida JSON, lo probable es un ajuste supervisado sobre pares figura-caption y salida estructurada, pero esto no se confirma en la informacion disponible.

La innovacion tecnica destacable no esta en la arquitectura sino en el contrato de tarea: el prompt congelado y el esquema JSON se distribuyen junto al adaptador para que las aplicaciones conserven exactamente la interfaz de inferencia con la que fue entrenado. Las cajas delimitadoras usan coordenadas enteras de 0 a 1000 con origen en la esquina superior izquierda.

## Capacidades

- Analisis de figuras cientificas de quimica y ciencia de materiales a partir de la imagen y su pie de figura.
- Prediccion de un objeto JSON estructurado con relevancia y tipo de figura, estructura de paneles, fuentes de evidencia, objetivos de extraccion y flags de calidad.
- Generacion opcional de cajas delimitadoras de regiones en coordenadas normalizadas 0-1000.
- Procesamiento image-text-to-text: entrada multimodal (imagen mas caption) y salida textual en formato JSON.
- Integracion con el chat template del processor de Qwen3-VL para construir la conversacion.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso agentico, audio ni modo thinking en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Extraccion documental automatizada en pipelines de revision bibliografica: el adaptador convierte cada figura y su caption en un JSON con tipo de figura y objetivos de extraccion, lo que permite indexar y filtrar figuras de papers de quimica y materiales a escala sin revision manual inicial.
- Enrutamiento de figuras en un servicio de analisis (el caso de uso original de ChemRoute): el campo de relevancia y tipo de figura permite decidir que figuras pasan a etapas posteriores de procesamiento y cuales se descartan, reduciendo coste en el resto del pipeline.
- Control de calidad de figuras y captions: los flags de calidad del JSON sirven para marcar figuras con problemas (resolucion, paneles ambiguos, caption incompleto) antes de que un humano las revise.
- Anotacion asistida de datasets cientificos: las cajas delimitadoras de regiones y la estructura de paneles pueden precargar anotaciones que un revisor humano corrige, acelerando la construccion de datasets de vision cientifica.
- Asistencia a investigadores en lectura de figuras: dado que el modelo devuelve fuentes de evidencia y regiones, puede usarse como ayuda para localizar que parte de una figura sustenta una afirmacion del caption, siempre con revision humana.
- Prototipado de herramientas de mineria de materiales: al estructurar la evidencia visual de figuras, facilita la construccion de bases de datos de resultados experimentales extraidos de literatura, con validacion de esquema obligatoria en cada salida.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la model card son los siguientes:

| Metrica | Resultado | Conjunto |
|---|---|---|
| Tasa de parseo JSON | 1.0 | 40 ejemplos ciegos |
| Tasa de validez de esquema | 0.675 | 40 ejemplos ciegos |
| Precision de tarea ciega | No calculada (sin respuestas de referencia en el host de entrenamiento) | 40 ejemplos ciegos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor advierte que estos resultados provienen de un dataset pequeno y no establecen rendimiento en dominios cientificos o publicaciones nuevas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al cargar la base Qwen3-VL-4B-Instruct en bfloat16 se requiere aproximadamente el espacio de un modelo de 4B mas el delta LoRA y el procesador de vision, pero no se publica una cifra concreta.
- GPU recomendadas: no disponibles en la informacion proporcionada; el ejemplo de carga usa `device_map="auto"` y `torch_dtype=torch.bfloat16`, lo que permite repartir el modelo entre GPUs disponibles.
- Cabe en GPU de consumo: no confirmado; depende de la cuantizacion de la base, que no se documenta para este adaptador.
- Opciones de despliegue: carga mediante `peft.PeftModel` sobre `Qwen3VLForConditionalGeneration` con Transformers; el repositorio incluye `infer.py` para inferencia de una sola imagen. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Entorno de referencia declarado: PyTorch 2.6.0+cu124, Transformers 4.57.1, PEFT 0.17.1, Accelerate 1.7.0, Pillow 11.3.0, huggingface-hub 0.36.2. La revision de la base esta fijada en `ebb281ec70b05090aa6165b016eac8ec08e71b17`.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este adaptador frente a alternativas, y no se han identificado en la informacion proporcionada adaptadores comparables de analisis de figuras cientificas sobre Qwen3-VL. La comparativa se limita a datos estructurales conocidos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ChemRoute-Qwen3-VL-4B-figure-lora | Adaptador LoRA sobre base de 4B | No disponible | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3-VL-4B-Instruct (base) | 4B | No disponible en esta ficha | Sujeta a la licencia de Qwen | Hugging Face |
| Alternativas de analisis de figuras cientificas | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: sin los pesos base de Qwen3-VL-4B-Instruct no funciona, y el uso de la base queda sujeto a su propia licencia ademas de la Apache 2.0 del adaptador.
- La salida JSON puede ser invalida o incorrecta; el propio autor exige validar el esquema y revisar las conclusiones cientificas y las cajas delimitadoras contra la figura original.
- No debe tratarse como fuente de hechos experimentales verificados.
- La evaluacion se basa en 115 ejemplos de desarrollo y 16 de validacion, con una tasa de validez de esquema de 0.675 en 40 ejemplos ciegos; no hay evidencia de generalizacion a nuevos dominios cientificos o publicaciones.
- La precision de tarea no se calculo por falta de respuestas de referencia, por lo que no hay medida de acierto real en la tarea.
- Riesgo de alucinacion en la descripcion de paneles, fuentes de evidencia y regiones, especialmente con figuras de baja resolucion o captions incompletos.
- No se declaran idiomas soportados ni sesgos conocidos; la ausencia de esta informacion es en si misma un riesgo para produccion.
- El proyecto esta en fase temprana (cero descargas, cero likes) y el codigo de carga no ha sido validado de forma independiente contra una copia recien descargada del Hub.
- El repositorio incluye un hash SHA-256 del archivo de pesos del adaptador; conviene verificar la integridad de la descarga antes de desplegar.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/quxiaoqiya/ChemRoute-Qwen3-VL-4B-figure-lora
- Modelo base Qwen3-VL-4B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Referencia externa encontrada en la busqueda web (no relacionada con el modelo): https://en.wikipedia.org/wiki/Cloud_computing
