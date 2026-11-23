# IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-V1-GGUF

## Resumen

Nex-N2.5-mini-APEX-I-MiniPlus-V1-GGUF es una cuantizacion GGUF personalizada del modelo multimodal nex-agi/Nex-N2.5-mini, publicada por el usuario independiente IsValorum. El modelo base es un transformer de tipo Mixture of Experts (MoE) con capacidades de vision (pipeline image-text-to-text), orientado a tareas agenticas y computer-use, con 34.660.610.688 parametros totales (aproximadamente 34,7 mil millones). Esta edicion concreta es la variante "MiniPlus V1", descrita por el autor como el perfil mas ligero y agil de su familia de cuantizaciones.

La relevancia de esta publicacion radica en su estrategia de cuantizacion selectiva por tensor: preserva los router gates en F32 sin comprimir, protege la cabeza de salida de tokens en Q6_K, mantiene las compuertas de atencion en Q8_0 y comprime los expertos centrales del MoE a IQ3_XXS. Segun el autor, este enfoque evita los picos de perplejidad y los errores sintacticos que producen las cuantizaciones planas de 3 bits o las recetas APEX genericas que rebajan los expertos a 2 bits (IQ2_S). El resultado es un fichero de aproximadamente 13,56 GiB que, segun la model card, puede ejecutarse total o parcialmente en RAM del sistema manteniendo velocidades de generacion de 20 a 45 tok/s.

El modelo se distribuye bajo licencia Apache 2.0, soporta 13 idiomas (incluido el castellano) y esta pensado para su uso con llama.cpp y Unsloth Studio. Incluye un proyector de vision Q8_0 de alta precision (mmproj) para tareas de OCR y analisis de pantalla, lo que lo hace adecuado para flujos de computer-use y agentes multimodales en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) multimodal, etiquetada como qwen35moe en los tags del repositorio |
| Parametros totales | 34.660.610.688 (aprox. 34,7 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K tokens (segun la model card; se menciona ejecucion completa en VRAM de 24 GB) |
| Tipos de cuantizacion | GGUF con mezcla por tensor: F32 (router gates), Q8_0 (compuertas de atencion y proyector de vision), Q6_K (cabeza de salida de tokens), IQ3_XXS (expertos centrales) |
| Idiomas soportados | en, zh, es, fr, de, pt, it, ru, ja, ko, vi, th, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 15,2 GB; fichero principal de aprox. 13,56 GiB) |

## Arquitectura y entrenamiento

El modelo base nex-agi/Nex-N2.5-mini emplea una arquitectura Mixture of Experts con capacidades multimodales de entrada imagen-texto. Los tags del repositorio lo asocian a la familia qwen35moe, lo que sugiere una topologia MoE derivada de la linea Qwen, aunque la model card no detalla el numero de expertos, el numero de expertos activos por token ni la dimension oculta. Esta edicion GGUF no modifica la arquitectura: es una conversion y cuantizacion del modelo original, por lo que las decisiones de entrenamiento (composicion del dataset, numero de tokens, uso de RLHF o DPO) corresponden a nex-agi y no se documentan en la informacion disponible.

La innovacion tecnica de esta publicacion es la cuantizacion selectiva por tensor. El autor describe cuatro decisiones concretas: los router gates se mantienen en F32 sin comprimir para preservar la precision del enrutamiento entre expertos; la cabeza de salida de tokens se "blinda" en Q6_K para evitar errores de sintaxis y llaves de codigo rotas; las compuertas de atencion se fijan en Q8_0; y los expertos centrales se comprimen a IQ3_XXS, por encima del umbral de 2 bits que el autor considera degradante. Ademas, la receta emplea vectorizacion lineal compatible con CPU que, segun la model card, elimina las paradas de busqueda de tablas AVX2, lo que permite que la mayor parte del modelo resida en RAM del sistema (DDR4/DDR5) sin penalizacion severa de velocidad. El repositorio incluye un proyector de vision Q8_0 (mmproj) empaquetado para tareas de OCR y analisis de pantalla.

## Capacidades

- Generacion de texto conversacional multi-turno en 13 idiomas, incluido el castellano.
- Razonamiento profundo y cadenas de pensamiento, segun la orientacion del modelo base a tareas de razonamiento.
- Comprension de imagenes: el pipeline image-text-to-text y el proyector Q8_0 permiten describir imagenes, extraer texto (OCR) y analizar capturas de pantalla.
- Computer-use y control de interfaz: los tags agentic y computer-use indican soporte para agentes que interactuan con entornos graficos.
- Capacidades agenticas y razonamiento multi-paso.
- Soporte de tool calling / function calling: no confirmado de forma explicita en la informacion disponible, aunque la orientacion agentica del modelo base lo hace plausible.
- Generacion de codigo: el autor menciona explicitamente la proteccion de la cabeza de salida para evitar "llaves de codigo rotas", lo que implica uso previsto en programacion.
- Ejecucion en llama.cpp y Unsloth Studio, con endpoints compatibles segun los tags.
- Contexto largo de hasta 256K tokens, con soporte de offload parcial a RAM del sistema.

## Casos de uso

- Agentes de computer-use en local: el modelo puede analizar capturas de pantalla mediante el proyector de vision Q8_0 y decidir la siguiente accion sobre la interfaz, lo que permite automatizar flujos de escritorio o navegador sin enviar datos a la nube.
- OCR y extraccion de datos de documentos: la combinacion del pipeline image-text-to-text con el mmproj de alta precision permite transcribir facturas, formularios o capturas y estructurar la informacion extraida en JSON.
- Asistencia de programacion en equipos sin GPU de gama alta: con aproximadamente 13,56 GiB y offload a DDR4/DDR5, el modelo puede ofrecer autocompletado y explicacion de codigo en portatiles con 16-32 GB de RAM, manteniendo la cabeza de salida en Q6_K para reducir errores de sintaxis.
- Atencion al cliente multilingue: los 13 idiomas soportados y el contexto de hasta 256K tokens permiten gestionar conversaciones largas con historial extenso y clientes en distintos idiomas desde una unica instancia.
- Razonamiento documental de contexto largo: el modelo puede procesar contratos, informes o bases de conocimiento de decenas de miles de tokens y responder preguntas concretas, con la opcion de mantener el contexto en RAM cuando no cabe en VRAM.
- Automatizacion de soporte tecnico con vision: un agente puede recibir una captura del error del usuario, interpretarla y proponer pasos de resolucion, combinando comprension visual y razonamiento multi-paso.
- Procesamiento por lotes en servidores sin GPU dedicada: la vectorizacion compatible con CPU descrita por el autor permite desplegar el modelo en nodos con gran cantidad de RAM y generar a 20-45 tok/s, suficiente para tareas asincronas de clasificacion, resumen o extraccion.

## Benchmarks y rendimiento

La model card incluye una seccion de benchmark independiente de la familia APEX-I-MiniPlus, pero en la informacion proporcionada solo se detalla un dato de perplejidad para la edicion V2.1 (6,4725 ± 0,1635, con una delta de aproximadamente +0,07 frente a la linea base sin cuantizar de aproximadamente 6,40). Para la edicion V1 objeto de esta ficha no se han publicado resultados numericos de benchmarks en la informacion disponible.

| Metrica | Valor |
|---|---|
| Perplejidad (V1) | no disponible |
| Perplejidad (V2.1, referencia) | 6,4725 ± 0,1635 |
| Perplejidad linea base sin cuantizar | aprox. 6,40 |
| MMLU, HumanEval, GSM8K u otros | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero principal ocupa aproximadamente 13,56 GiB; con contexto corto cabe en GPUs de 16 GB. La model card afirma que el contexto completo de 256K puede ejecutarse en VRAM de 24 GB, presumiblemente con offload parcial.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 5090 (24-32 GB) para ejecucion completa en VRAM; GPUs de 16 GB (RTX 4060 Ti, RTX 4070 Ti Super, A4000) para contexto moderado.
- Cabe en GPU de consumo: si, en modelos con 16 GB o mas de VRAM; en GPUs de 8-12 GB es necesario offload a RAM del sistema.
- Opciones de despliegue: llama.cpp, Unsloth Studio; los tags indican endpoints compatibles. vLLM y TGI no estan confirmados para este formato GGUF.
- Latencia y throughput: segun la model card, entre 20 y 45 tok/s con inferencia total o parcial en RAM del sistema, dependiendo de la CPU y del ancho de banda de DDR4/DDR5. La model card incluye proyecciones de throughput para RTX 30/40/50, pero los valores concretos no se detallan en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Nex-N2.5-mini APEX-I-MiniPlus V1 (este) | 34,7B (MoE) | hasta 256K | GGUF mixta (F32/Q8_0/Q6_K/IQ3_XXS) | Apache 2.0 | Vision, agentico, computer-use; aprox. 13,56 GiB |
| Nex-N2.5-mini APEX-I-MiniPlus V2.1 | 34,7B (MoE) | hasta 256K | GGUF mixta con expertos Q5_K | Apache 2.0 | Aprox. 14,7 GB; perplejidad 6,4725; recomendado por el autor |
| APEX-I-Mini generico de la comunidad | 34,7B (MoE) | no disponible | IQ2_S en expertos, Q3_K_M en cabeza | Apache 2.0 | Menor calidad segun el autor; no recomendado |
| Cuantizacion plana de 3 bits | 34,7B (MoE) | no disponible | 3 bits uniforme | Apache 2.0 | Sin proteccion de capas sensibles; mayor perplejidad segun el autor |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo entrenado: hereda los sesgos y limitaciones del modelo base nex-agi/Nex-N2.5-mini, que no se documentan en la informacion disponible.
- La compresion de los expertos a IQ3_XXS introduce perdida de precision respecto al modelo original; el autor solo aporta datos de perplejidad para la edicion V2.1, no para V1.
- Riesgo de alucinacion inherente a los modelos de razonamiento; no se han publicado evaluaciones de fidelidad factual para esta edicion.
- El rendimiento en RAM del sistema depende criticamente de la CPU y del ancho de banda de memoria; las cifras de 20-45 tok/s son estimaciones del autor y pueden no reproducirse en todos los equipos.
- El soporte de tool calling y function calling no se confirma de forma explicita en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de los componentes derivados.
- El repositorio tiene un volumen bajo de adopcion (529 descargas, 3 likes en el momento de la consulta), lo que limita la validacion independiente de la calidad de la cuantizacion.
- La model card esta redactada en un tono promocional y contiene afirmaciones del autor no verificadas de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-V1-GGUF
- Edicion V2.1 recomendada por el autor: https://huggingface.co/IsValorum/Nex-N2.5-mini-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Apoyo al autor (Ko-fi): https://ko-fi.com/isvalorum
