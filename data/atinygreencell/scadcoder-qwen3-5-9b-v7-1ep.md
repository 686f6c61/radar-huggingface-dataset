# ATinyGreenCell/scadcoder-qwen3.5-9b-v7-1ep

## Resumen

scadcoder-qwen3.5-9b-v7-1ep es un fine-tune mediante LoRA del modelo multimodal Qwen/Qwen3.5-9B, desarrollado por el usuario ATinyGreenCell, especializado en la generacion de codigo OpenSCAD parametrico para material de laboratorio biologico dentro del proyecto Tiiny Pocket Lab (version 7). El modelo conserva la torre de vision del modelo base y ha fusionado las capas de lenguaje en pesos bf16, de modo que acepta entradas de imagen y texto y produce scripts OpenSCAD como salida.

El problema que aborda es muy concreto: traducir descripciones en lenguaje natural (y, dado el pipeline image-text-to-text, tambien referencias visuales) a geometria parametrica verificable, en lugar de requerir que un humano escriba el codigo CAD a mano. La version v7 no introduce datos nuevos respecto a v4: entrena exactamente el mismo conjunto durante una sola epoca en lugar de tres, con el objetivo declarado de comprobar si un entrenamiento mas ligero preserva mejor las capacidades del modelo base.

Con 9.653.104.368 parametros (unos 9,65 mil millones) y un repositorio de 19,3 GB en safetensors, es un modelo de escala media que puede ejecutarse en una sola GPU profesional. Su relevancia es de nicho: no compite como modelo generalista, sino como componente especializado en un pipeline de diseno generativo de piezas de laboratorio. El autor indica explicitamente que debe ejecutarse con el modo de razonamiento (thinking) desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal, clase `Qwen3_5ForConditionalGeneration` (torre de vision + capas de lenguaje); fine-tune LoRA fusionado en las capas de lenguaje |
| Parametros totales | 9.653.104.368 (~9,65 B), dato real de safetensors |
| Parametros activos | No procede: no es un modelo MoE segun la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible: el repositorio solo publica pesos bf16 en safetensors (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), libreria `transformers` |
| Tamano del repositorio | 19,3 GB |
| Pipeline | image-text-to-text |
| Modelo base | Qwen/Qwen3.5-9B |
| Modo de razonamiento | Debe usarse con thinking desactivado (indicacion del autor) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-9B, identificada en la model card como `Qwen3_5ForConditionalGeneration`: un modelo multimodal que combina un codificador de vision con capas de lenguaje autorregresivas. El fine-tune se aplico exclusivamente sobre las capas de lenguaje mediante LoRA con rango 32 y dropout 0,1; posteriormente los adaptadores se fusionaron y se exportaron en safetensors bf16, manteniendo intacto el codificador de vision. No hay en la informacion disponible datos sobre el numero total de tokens, la composicion completa del corpus del modelo base ni sobre si este recibio RLHF o DPO.

El conjunto de entrenamiento de la version v7 consta de 9.136 filas, identicas a las de v4: 7.238 ejemplos verificados por render procedentes de v2, 269 generaciones obtenidas por rejection sampling duplicadas (x2) y 680 ejemplos destilados de Claude Opus sobre 17 familias de piezas que no forman parte de las tareas de Prompt-to-Bench, tambien duplicados (x2). El autor indica que cada descripcion comparte como maximo el 36 % de sus tokens con cualquier prompt del benchmark, una precaucion explicita contra la contaminacion. La unica diferencia de v7 respecto a v4 es el numero de epocas: una en lugar de tres, planteado como experimento para medir cuanto del modelo base se conserva con entrenamiento mas ligero. Los detalles metodologicos se remiten a la seccion 6.4 del repositorio prompt-to-bench.

## Capacidades

- Generacion de codigo OpenSCAD parametrico para piezas y utillaje de laboratorio biologico, el dominio central del entrenamiento.
- Entrada multimodal image-text-to-text: al conservarse el codificador de vision, puede recibir imagenes junto con la instruccion.
- Generacion de codigo en general, segun la etiqueta `code` del repositorio y su origen en Qwen3.5.
- Conversacion multiturno (etiqueta `conversational`), lo que permite refinar una pieza de forma iterativa.
- Parametrizacion: produccion de scripts con variables ajustables en lugar de geometria fija.
- Integracion en pipelines: el repositorio declara `endpoints_compatible`, util para servir el modelo tras un endpoint compatible.
- Modo thinking disponible en el modelo base, pero el autor recomienda desactivarlo para esta variante.
- No hay informacion disponible sobre soporte de tool calling, capacidades de agente, audio ni cobertura multilingue verificada.

## Casos de uso

- Generacion de material de laboratorio biologico: el modelo traduce una descripcion textual ("soporte para tubos de 50 ml con inclinacion de 15 grados") a un script OpenSCAD parametrico listo para renderizar, que es exactamente la distribucion sobre la que fue entrenado.
- Asistente dentro de Tiiny Pocket Lab v7: integrado en la aplicacion, permite al usuario describir la pieza que necesita y obtener el codigo editable, sin salir del flujo de trabajo del proyecto.
- Iteracion a partir de una referencia visual: gracias al codificador de vision conservado, el usuario puede adjuntar una fotografia o un boceto de una pieza existente y pedir una version parametrica o una modificacion de dimensiones.
- Preparacion de modelos para impresion 3D: la salida OpenSCAD se renderiza a STL y se envia a un flujo de laminado; el caracter parametrico permite regenerar la pieza con otras medidas sin reescribir el codigo.
- Punto de partida para otros dominios CAD: al ser un fine-tune LoRA de rango 32 sobre un modelo de 9,65 B, sirve como receta replicable para adaptar el mismo esquema a utillaje mecanico, electronica o arquitectura con un corpus verificado por render.
- Evaluacion de pipelines Prompt-to-Bench: el modelo y su conjunto de datos estan disenados de forma conjunta, por lo que puede usarse como linea base en experimentos de generacion de codigo CAD verificable.
- Documentacion y refactorizacion de scripts OpenSCAD existentes: el modelo puede reescribir un script con parametros explicitos y comentarios, aprovechando su base de codigo general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas de MMLU, HumanEval, GSM8K ni de evaluacion especifica de OpenSCAD, y no se ha localizado ninguna evaluacion externa del modelo.

## Requisitos de hardware

- VRAM estimada en bf16: unos 19,3 GB solo para los pesos, mas overhead de activaciones y cache KV; en la practica requiere del orden de 22-26 GB para contexto corto.
- GPU profesionales recomendadas: A100 40 GB, A100 80 GB, H100, L40S 48 GB. Son las opciones seguras para bf16 con contexto amplio.
- GPU de consumo: en RTX 4090 (24 GB) el modelo en bf16 entra muy justo y puede agotar memoria con contextos largos o imagenes de alta resolucion; es recomendable cuantizar.
- Cuantizacion: al no publicarse GGUF ni variantes de 8/4 bits, habria que generarlas. Como referencia, 8 bits supondria unos 10-11 GB (RTX 4080, 3090, 4090) y 4 bits unos 5,5-6,5 GB (RTX 3060 12 GB, 4060 Ti 16 GB, 4070).
- Opciones de despliegue: `transformers` es la via soportada de forma nativa; el tag `endpoints_compatible` sugiere servir el modelo tras un endpoint compatible. vLLM o TGI requeririan verificacion previa de soporte para la arquitectura `qwen3_5`. llama.cpp u Ollama solo serian viables tras convertir los pesos a GGUF, conversion que no esta publicada.
- Latencia y throughput: no disponibles. Al recomendar el autor desactivar el modo thinking, la longitud de salida se reduce y con ella el coste por peticion, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scadcoder-qwen3.5-9b-v7-1ep | 9,65 B | No disponible | Imagen + texto | apache-2.0 | HuggingFace, safetensors bf16 |
| Qwen/Qwen3.5-9B (base) | ~9 B | No disponible | Imagen + texto | No disponible en la informacion | HuggingFace |
| Otros fine-tunes especializados en OpenSCAD | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion significativa es contra el modelo base: mismo orden de parametros y misma arquitectura multimodal, pero el fine-tune restringe el comportamiento al dominio OpenSCAD y pierde, presumiblemente, parte de la generalidad del original, algo que el propio autor declara estar midiendo con el cambio de tres a una epoca. No se dispone de datos de rendimiento que permitan cuantificar esa diferencia.

## Limitaciones y advertencias

- Dominio muy restringido: el entrenamiento se centra en OpenSCAD para laboratorio biologico; fuera de ahi el comportamiento no esta caracterizado.
- Entrenamiento ligero (una epoca, LoRA rango 32 solo en capas de lenguaje): es plausible un ajuste incompleto al dominio, pero no hay evaluacion publicada que lo confirme o lo descarte.
- Debe ejecutarse con el modo de razonamiento desactivado; usar thinking puede degradar la calidad de las respuestas segun el autor.
- Riesgo de alucinacion geometrica: el modelo puede generar scripts OpenSCAD sintacticamente validos pero fisicamente inviables (espesores negativos, intersecciones degeneradas, piezas no imprimibles). Se recomienda verificacion por render antes de fabricar.
- Contaminacion: aunque el autor declara un solapamiento maximo del 36 % de tokens con el benchmark, no se aportan resultados de evaluacion independientes.
- Idiomas: no se documenta que idiomas soporta el fine-tune; el modelo base es multilingue, pero el corpus de entrenamiento parece orientado a instrucciones en ingles.
- Licencia: el fine-tune se declara apache-2.0, pero la licencia del modelo base Qwen3.5-9B no figura en la informacion proporcionada. Conviene verificar los terminos del modelo original antes de un uso comercial.
- Madurez y adopcion: 0 descargas y 0 likes en el momento de la consulta, sin endpoints publicos ni senales de uso en produccion.
- Fecha de creacion del repositorio (2026-10-17) y ausencia de evaluaciones: tratalo como un artefacto experimental, no como un componente listo para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ATinyGreenCell/scadcoder-qwen3.5-9b-v7-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del proyecto y metodologia (seccion 6.4): https://github.com/ATinyGreenCell/prompt-to-bench
- Las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo; el resto de enlaces (paper, blog, demo) no estan disponibles.
