# conorwoods/fieldwork-fastvlm-0.5b-onnx

## Resumen

Fieldwork FastVLM 0.5B ONNX es una conversión a formato ONNX del modelo de visión-lenguaje apple/FastVLM-0.5B, publicada por el usuario conorwoods y orientada a su ejecución en el navegador mediante transformers.js. El cambio principal respecto al modelo base es que el decodificador ha sido ajustado de forma específica sobre un conjunto de muestras denominado "Fieldwork headstone sample set" (lápidas y epigrafía funeraria), mientras que el codificador visual y los embeddings de tokens se copian sin modificar desde onnx-community/FastVLM-0.5B-ONNX.

El modelo base pertenece a la familia FastVLM de Apple, una línea de VLM compactos cuyo rasgo distintivo es un codificador visual eficiente (FastViTHD) acoplado a un decodificador de lenguaje Qwen2 de 0,5 mil millones de parámetros. La etiqueta de arquitectura del repositorio es llava_qwen2, lo que confirma el esquema tipo LLaVA: proyección de las características visuales al espacio de tokens del LLM y decodificación autorregresiva multimodal.

Es relevante ahora porque demuestra dos tendencias simultáneas: la especialización de VLM pequeños en dominios muy concretos mediante fine-tuning ligero, y el despliegue de esos modelos en cliente (navegador, sin servidor) gracias al pipeline image-text-to-text de transformers.js sobre ONNX. El repositorio es muy reciente y no registra descargas ni interacciones en el momento de la consulta, por lo que debe considerarse un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM tipo LLaVA con etiqueta llava_qwen2; codificador visual FastViTHD (FastVLM) + decodificador Qwen2 |
| Parametros totales | aproximadamente 0,5 mil millones en el decodificador, segun la nomenclatura del modelo; el total incluyendo el codificador visual no se desglosa en la informacion disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | el repositorio es ONNX y el tag base_model:quantized:apple/FastVLM-0.5B indica que existen variantes cuantizadas, pero no se detallan los niveles concretos; el tamano del repo (1,4 GB) sugiere que conviven varios pesos |
| Idiomas soportados | no disponible; el modelo base FastVLM esta entrenado principalmente en ingles |
| Licencia | apple-amlr (Apple Machine Learning Research License) |
| Formato de pesos | ONNX, consumible desde transformers.js |
| Tamano del repositorio | 1,4 GB |
| Pipeline declarado | image-text-to-text |
| Modelo base | apple/FastVLM-0.5B; pesos ONNX de referencia: onnx-community/FastVLM-0.5B-ONNX |

## Arquitectura y entrenamiento

La arquitectura sigue el patron LLaVA: un codificador visual FastViTHD extrae caracteristicas de la imagen, un proyector las transforma en tokens compatibles con el espacio de embeddings del LLM y el decodificador Qwen2 genera texto de forma autorregresiva condicionado por esos tokens visuales y por el prompt de texto. FastViTHD es la aportacion central de la familia FastVLM: un codificador híbrido convolucional-transformer disenado para reducir el numero de tokens visuales por imagen y, con ello, el coste de prefill, manteniendo la precision en tareas de descripcion y respuesta visual. El decodificador Qwen2 de 0,5 mil millones de parametros es la variante pequena de la familia Qwen2, con atencion causal estandar, RMSNorm y sesgos de atencion de consulta.

En cuanto al entrenamiento de este repositorio concreto, la model card indica unicamente que el decodificador se ha ajustado sobre el "Fieldwork headstone sample set". No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, si se aplicaron fases de RLHF o DPO, ni la estrategia de congelacion de capas. Tampoco se documenta si el fine-tuning fue de espectro completo o mediante adaptadores. El codificador visual y los embeddings de tokens no se han reentrenado: se copian literalmente de onnx-community/FastVLM-0.5B-ONNX, lo que implica que la percepcion visual no esta especializada en el dominio de las lapidas, solo la generacion de texto condicionada por ella.

## Capacidades

- Generacion de texto condicionada por imagen: descripcion de escenas, respuesta a preguntas visuales (VQA) y transcripcion de texto presente en la imagen.
- Lectura y transcripcion de inscripciones, orientada especificamente a epigrafia funeraria y piedra tallada por el ajuste del decodificador.
- Conversacion multimodal multi-turno en el sentido de mantener un historial de mensajes con contenido de texto e imagen en cada turno.
- Ejecucion en navegador mediante transformers.js y WebGPU o WASM, sin necesidad de backend propio.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada; no se documenta ningun formato de herramientas ni plantilla de llamadas.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo base es de 0,5 mil millones de parametros y no se declara capacidad agentica.
- Capacidades multilingues: no disponibles; el modelo base esta centrado en ingles y no se documenta cobertura de otros idiomas.
- Capacidades especiales (modo thinking, audio, video): ninguna documentada; el modelo es exclusivamente imagen-texto.

## Casos de uso

- Digitalizacion de archivos epigraficos: el ajuste del decodificador sobre muestras de lapidas permite transcribir inscripciones desde fotografias y volcar el texto a una base de datos de inventario patrimonial.
- Indexacion y busqueda de cementerios historicos: se puede procesar por lotes un fondo fotografico, generar descripciones normalizadas de cada lapida y habilitar busqueda por nombre, fecha o tipo de monumento.
- Aplicacion de campo sin conexion en el navegador: al estar en ONNX y pensado para transformers.js, puede ejecutarse en un portatil o tableta durante el trabajo de campo, sin subir imagenes de patrimonio a un servicio externo.
- Asistencia a historiadores y arqueologos: un asistente conversacional que responde preguntas sobre una fotografia concreta (datos legibles, estado de conservacion aparente, orientacion) manteniendo el contexto en varios turnos.
- Accesibilidad y descripcion de imagenes: generar descripciones textuales de fotografias de monumentos para lectores de pantalla en catalogos y visores web.
- Preprocesado en pipelines de vision artificial: usar el modelo como etapa barata de generacion de etiquetas o subtitulos sobre imagenes que despues alimentan un modelo mayor o un sistema de recuperacion.
- Demostraciones educativas de VLM en el navegador: ejemplo docentede como desplegar un modelo imagen-texto sin infraestructura de servidor, con un repositorio de 1,4 GB descargable desde un CDN de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones sobre MMLU, HumanEval, GSM8K, VQAv2, TextVQA, MMbench ni ninguna otra bateria, y tampoco se documenta una comparacion con el modelo base apple/FastVLM-0.5B que permita cuantificar el efecto del fine-tuning sobre el decodificador.

## Requisitos de hardware

- VRAM estimada para inferencia, en funcion de la precision de los pesos: en fp32 aproximadamente 2 GB solo para el decodificador; en fp16 alrededor de 1 GB; en int8 en torno a 0,5-0,7 GB; en int4 aproximadamente 0,3-0,4 GB. A estas cifras hay que sumar los pesos y activaciones del codificador visual y la memoria de trabajo del runtime. Estimaciones propias, no confirmadas por el autor.
- El repositorio completo ocupa 1,4 GB, por lo que una primera ejecucion en navegador implica esa descarga y su cacheo posterior.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria utilizable. En servidor, A100, H100 o L40S funcionan sobradamente pero estan infrautilizadas por el tamano del modelo. En estaciones de trabajo, RTX 4090, RTX 4080, RTX 3090 o RTX 3060 son suficientes.
- Compatibilidad con GPU de consumo: si, el modelo cabe en practicamente cualquier GPU de consumo de los ultimos ocho anos, e incluso en GPUs integradas con WebGPU. En Apple Silicon se beneficia de Metal/WebGPU.
- Opciones de despliegue: transformers.js con backend WebGPU o WASM (escenario previsto por el autor), ONNX Runtime en Python o C++ para despliegues fuera del navegador, y servidores de inferencia compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que trabajan con otros formatos de pesos.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por imagen en ninguna plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Fieldwork FastVLM 0.5B ONNX | aproximadamente 0,5 mil millones | no disponible | apple-amlr | ONNX | repositorio HuggingFace, 0 descargas, 0 likes |
| apple/FastVLM-0.5B (modelo base) | aproximadamente 0,5 mil millones | no disponible en la informacion proporcionada | apple-amlr | safetensors | repositorio oficial de Apple en HuggingFace |
| onnx-community/FastVLM-0.5B-ONNX | aproximadamente 0,5 mil millones | no disponible en la informacion proporcionada | apple-amlr | ONNX | repositorio de la comunidad ONNX; es la fuente del codificador y los embeddings de este modelo |
| Otros VLM compactos de la misma categoria (SmolVLM, Moondream, Qwen2-VL-2B) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparacion cuantitativa con alternativas no es posible con la informacion disponible: no se han publicado metricas de rendimiento para este repositorio ni se documenta el efecto del fine-tuning frente a apple/FastVLM-0.5B. La unica diferencia verificable respecto a la conversion ONNX de la comunidad es el ajuste del decodificador sobre el conjunto de muestras de lapidas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al derivar de un modelo base entrenado mayoritariamente con datos en ingles y con la distribucion de internet, cabe esperar sesgos culturales y geograficos en las descripciones, no medidos.
- Riesgo de alucinacion: alto en tareas de transcripcion, que es precisamente el uso previsto. Un VLM de 0,5 mil millones de parametros puede generar texto plausible que no aparece en la imagen, algo especialmente problematico en epigrafia, donde nombres, fechas y cifras deben ser exactos. Se recomienda verificacion humana obligatoria.
- Limitaciones de contexto e idioma: no se especifica la ventana de contexto efectiva ni los idiomas soportados. El modelo base esta orientado al ingles, por lo que el rendimiento en castellano o en latin epigrafico no esta garantizado.
- Restricciones de licencia: la licencia apple-amlr (Apple Machine Learning Research License) no es una licencia de codigo abierto estandar y establece condiciones propias sobre el uso, incluido el uso comercial. Es imprescindible revisar el texto completo antes de cualquier despliegue en produccion o de redistribuir los pesos.
- Estado del repositorio: publicado sin descargas ni interacciones, sin model card detallada, sin benchmarks y sin documentacion del proceso de fine-tuning. No hay garantia de mantenimiento ni de correccion de errores.
- Degradacion de capacidades generales: al haber ajustado el decodificador sobre un dominio muy estrecho, es probable que el rendimiento en tareas generales de VQA o descripcion de escenas se haya reducido respecto al modelo base. No hay evaluaciones que lo confirmen ni lo desmientan.
- Dependencia del runtime: al ser ONNX para transformers.js, las operaciones deben estar cubiertas por el backend WebGPU o WASM utilizado; un operador no soportado puede degradar el rendimiento o impedir la ejecucion.
- Trazabilidad de los datos: no se detalla el origen, los permisos ni el consentimiento asociado al "Fieldwork headstone sample set", lo que puede afectar al uso del modelo con imagenes de terceros.

## Enlaces

- Repositorio del modelo: https://huggingface.co/conorwoods/fieldwork-fastvlm-0.5b-onnx
- Modelo base: https://huggingface.co/apple/FastVLM-0.5B
- Pesos ONNX de referencia (codificador visual y embeddings de tokens): https://huggingface.co/onnx-community/FastVLM-0.5B-ONNX
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
- Paper de FastVLM (referencia de la familia, no citado en la model card): no disponible en la informacion proporcionada
- Demos o espacios asociados: no disponible
