# fireballenterprise/fireball-designer-agent

## Resumen

Fireball Designer Agent v0.1.0 es un adaptador LoRA publicado por fireballenterprise sobre el modelo multimodal Qwen/Qwen3-VL-8B-Instruct. Su única función es traducir peticiones en lenguaje natural dirigidas a la aplicación Fireball Designer (un editor con espacios de trabajo 3D, SVG, imagen, vídeo y documento) a trayectorias de llamadas a herramientas en formato JSON. Dado un contexto de editor y una petición del usuario, el modelo emite un array de objetos `{"name": ..., "arguments": {...}}` o bien declina y pide aclaración cuando la petición es ambigua.

El adaptador no modifica la torre de visión: solo se entrena la columna vertebral de lenguaje, por lo que se carga como un LoRA convencional sin necesidad de fusionar pesos. Se entrenó con 17 ejemplos escritos a mano (14 de entrenamiento y 3 de validación) más 5 ejemplos reservados para evaluación, sobre 1 GPU NVIDIA A10G de 24 GB.

La relevancia de esta publicación es fundamentalmente metodológica: el propio autor la describe como una prueba de humo del pipeline, no como un modelo de producción. Sirve para demostrar la trazabilidad extremo a extremo entre revisión del modelo base, versión de dataset y commit de entrenamiento, y para documentar con datos qué falla cuando el dataset es insuficiente. Con 14 ejemplos, el adaptador aprende el formato de salida y la selección de herramientas, pero no generaliza parámetros ni el comportamiento de aclaración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3VLForConditionalGeneration (transformer multimodal con torre de visión y backbone de lenguaje) |
| Parametros totales | 8.810.770.672 en el modelo base; 43.646.976 parametros entrenables en el adaptador (0,50 %) |
| Parametros activos | No aplica: arquitectura densa, no MoE |
| Longitud de contexto | No disponible en la informacion proporcionada. El entrenamiento uso una longitud maxima de secuencia de 768 tokens; el ejemplo de servicio con vLLM de la model card usa `--max-model-len 4096` |
| Tipos de cuantizacion | No disponible. El adaptador se publica sin cuantizar en safetensors; la cuantizacion aplicable depende de como se sirva el modelo base |
| Idiomas soportados | No disponible. Los ejemplos de entrenamiento estan redactados en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos de adaptador LoRA, libreria `peft`); tamano del repositorio 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica exclusivamente al backbone de lenguaje del modelo base mediante LoRA con `r=16`, `alpha=32` y `dropout=0.05`. Los modulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se hizo en precision bf16, durante 3 epocas, con tasa de aprendizaje 2e-4 y tamano de lote efectivo de 4 (lote 1 con 4 pasos de acumulacion de gradiente), sobre 1 GPU NVIDIA A10G de 24 GB en una instancia AWS `ml.g5.2xlarge`. La perdida se calcula unicamente sobre la completion: las posiciones del prompt y del relleno estan enmascaradas, de modo que el modelo se supervisa solo sobre las llamadas a herramientas y no sobre la reproduccion del contexto recibido.

Los datos consisten en 17 ejemplos escritos a mano, divididos de forma determinista en 14 de entrenamiento y 3 de validacion, mas 5 ejemplos adicionales reservados para evaluacion. Cada ejemplo empareja una peticion de Fireball Designer con su trayectoria de llamadas esperada. No se menciona uso de RLHF, DPO ni decodificacion especulativa. La torre de vision queda intacta deliberadamente: todos los ejemplos de entrenamiento son de solo texto, por lo que adaptar el codificador visual implicaria entrenar pesos que los datos nunca ejercitan. La comprension de imagenes del modelo base, por tanto, no cambia con este adaptador.

## Capacidades

- Generacion de llamadas a herramientas en JSON: produce un array de objetos `{"name": ..., "arguments": {...}}` a partir de una peticion y un contexto de editor.
- Seleccion y ordenacion de herramientas del catalogo propio de Fireball Designer (espacios de trabajo 3D, SVG, imagen, video y documento).
- Formato de prompt especifico: bloque plano de instruccion con `Context:`, `Request:` y la marca `Tool calls:` al final.
- Capacidad de aclaracion teorica: el esquema contempla declinar y pedir aclaracion ante peticiones ambiguas, aunque en la evaluacion publicada no la ejecuta correctamente.
- Soporte de tool calling y function calling limitado al esquema de Fireball Designer; los nombres de herramienta emitidos carecen de sentido fuera de esa aplicacion.
- Entrada multimodal declarada por el pipeline (`image-text-to-text`) heredada del modelo base, no adaptada por este LoRA.
- Capacidades multilingues: no documentadas; los ejemplos de entrenamiento estan en ingles.
- No es un asistente de proposito general y no se ha entrenado para conversacion abierta, razonamiento general, matematicas ni generacion de codigo.

## Casos de uso

- Automatizacion de edicion guiada por lenguaje natural dentro de Fireball Designer: el adaptador traduce una instruccion como crear o modificar un elemento del lienzo a la secuencia de herramientas del editor, lo que permite construir una interfaz conversacional sobre el catalogo de herramientas existente.
- Prueba de humo de pipelines de adaptadores: sirve para validar la cadena completa de entrenamiento, publicacion en HuggingFace y servicio con vLLM con `--enable-lora`, incluyendo comparacion A/B contra el modelo base.
- Desarrollo de un ajuste fino propio: el repositorio documenta configuracion de LoRA, modulos objetivo, hiperparametros y formato de prompt, por lo que es util como plantilla reproducible para entrenar adaptadores de tool calling sobre Qwen3-VL.
- Investigacion sobre brechas de dataset: los resultados publicados ejemplifican como un desequilibrio de clases (1 de 14 ejemplos de aclaracion) hace que el modelo aprenda la regla "emitir siempre llamadas a herramientas", lo que resulta util como caso de estudio en cursos y articulos sobre supervision de agentes.
- Evaluacion comparativa de esquemas de function calling: permite medir exactitud de seleccion de herramienta, de trayectoria, de parametros y de validez de esquema contra el modelo base sin adaptar.
- Prototipado interno de agentes de diseno: con las salvedades de precision de parametros, puede usarse para demostraciones controladas del flujo contexto-a-llamada dentro de un entorno cerrado.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni cualquier tarea fuera del catalogo de herramientas de Fireball Designer: los identificadores que emite no son interpretables por otros sistemas.

## Benchmarks y rendimiento

Evaluacion del autor sobre 5 ejemplos reservados, con puntuacion en seleccion exacta de herramienta, correccion de parametros, validez de esquema y aclaracion ante peticiones subespecificadas:

| Metrica | Modelo base | Adaptador v0.1.0 |
|---|---|---|
| Exactitud de seleccion de herramienta | 0,00 | 1,00 |
| Exactitud de trayectoria | 0,00 | 1,00 |
| Exactitud de parametros | 0,00 | 0,25 |
| Validez de esquema | 0,00 | 0,25 |
| Exactitud de aclaracion | 0,40 | 0,40 |
| Tasa de finalizacion | 0,40 | 0,00 |
| Llamadas extra medias | −0,40 | +0,20 |

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El conjunto de evaluacion es de 5 ejemplos, por lo que las cifras tienen un intervalo de confianza muy amplio. El autor senala que en los dos ejemplos que requieren uso de herramientas el adaptador selecciona las herramientas correctas en el orden correcto, mientras que el modelo base no acerto ninguna y emitio menos llamadas de las necesarias. En los tres ejemplos que deberian responderse con una pregunta de aclaracion, el adaptador emite llamadas a herramientas; solo 1 de los 14 ejemplos de entrenamiento es un caso de aclaracion. La tasa de finalizacion baja a 0,00 porque exige `parameter_accuracy == 1.0`.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en bf16: aproximadamente 17,6 GB solo para pesos, mas cache KV y overhead, en torno a 20-24 GB segun longitud de contexto. El adaptador anade unos 87 MB (43,6 M de parametros en bf16).
- VRAM estimada con cuantizacion de 4 bits del modelo base: en torno a 6-8 GB, aunque no se documenta en la model card una receta de cuantizacion validada para este adaptador.
- GPU recomendadas: NVIDIA A100, H100 o L40S para servicio multiusuario; el entrenamiento se realizo en una NVIDIA A10G de 24 GB.
- GPU de consumo: una RTX 4090 de 24 GB puede alojar el modelo base en bf16 de forma ajustada con contextos cortos; con cuantizacion de 4 bits cabe en GPUs de 8-12 GB. No hay datos publicados de latencia ni throughput sobre hardware de consumo.
- Opciones de despliegue: vLLM con `--enable-lora` y `--lora-modules designer-agent=fireballenterprise/fireball-designer-agent` (endpoint compatible con OpenAI, permitiendo alternar entre `designer-agent` y `Qwen/Qwen3-VL-8B-Instruct`), y PEFT con transformers mediante `PeftModel` y `AutoModelForImageTextToText`. No se mencionan llama.cpp, Ollama ni TGI.
- Nota de integracion: debe usarse `AutoModelForImageTextToText`, no `AutoModelForCausalLM`, porque la arquitectura del base es `Qwen3VLForConditionalGeneration`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fireball-designer-agent v0.1.0 | 43,6 M entrenables sobre 8,8 B base | No disponible (entrenado a 768 tokens) | Seleccion de herramienta 1,00; parametros 0,25; esquema 0,25; aclaracion 0,40 | Apache 2.0 | HuggingFace, libreria `peft`, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-VL-8B-Instruct (base sin adaptar) | 8,8 B | No disponible en la informacion proporcionada | Seleccion de herramienta 0,00; parametros 0,00; esquema 0,00; aclaracion 0,40 | Apache 2.0 | HuggingFace |

No se dispone de informacion sobre otros adaptadores de tool calling comparables en el material proporcionado; la comparativa con alternativas de la misma categoria queda como no disponible.

## Limitaciones y advertencias

- El propio autor califica el modelo como prueba de humo de pipeline, no apto para produccion, y pide leer la seccion de limitaciones antes de usarlo.
- Entrenado con 14 ejemplos: insuficiente para ensenar un catalogo de herramientas.
- Sesgo aprendido del dataset: solo 1 de 14 ejemplos es de aclaracion, por lo que el modelo aplica la regla "emitir siempre llamadas a herramientas" y responde con llamadas a peticiones que deberian requerir aclaracion.
- Exactitud de parametros de 0,25 y validez de esquema de 0,25: tres de cada cuatro respuestas presentan parametros incorrectos o JSON no valido segun el esquema.
- Tasa de finalizacion de 0,00 y +0,20 llamadas extra de media: tiende a emitir llamadas adicionales innecesarias.
- Riesgo alto de alucinacion en nombres de herramienta y argumentos fuera de los ejemplos vistos; los identificadores emitidos no tienen significado fuera de Fireball Designer.
- Sin adaptacion de la torre de vision: aunque el pipeline se declara `image-text-to-text`, no hay evidencia de que el adaptador mejore el uso de imagenes.
- Idiomas no documentados: no hay garantia de comportamiento correcto en castellano ni en otros idiomas distintos del ingles de los ejemplos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la utilidad practica del adaptador esta limitada al ecosistema Fireball Designer.
- Caveat de despliegue: usar el AutoClass correcto (`AutoModelForImageTextToText`) y replicar exactamente el formato de prompt plano con el que se entreno, ya que el adaptador fue supervisado sobre esa forma concreta.
- La busqueda web realizada no devolvio informacion relevante sobre este modelo; los resultados obtenidos correspondian a un simulador ferroviario sin relacion con el modelo.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/fireballenterprise/fireball-designer-agent
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Aplicacion Fireball Designer: https://fireballdesigner.com
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
