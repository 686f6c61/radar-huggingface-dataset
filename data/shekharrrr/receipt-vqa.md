# shekharrrr/receipt-vqa

## Resumen

`shekharrrr/receipt-vqa` es un adaptador LoRA (PEFT) publicado en HuggingFace por el usuario `shekharrrr`, entrenado sobre el modelo base `HuggingFaceTB/SmolVLM-500M-Instruct`. Se trata por tanto de un ajuste fino parametrizado eficiente, no de un modelo completo: el repositorio contiene unicamente los pesos del adaptador en formato safetensors, no los pesos del modelo base. Su nombre, "receipt-vqa", sugiere que el ajuste esta orientado a tareas de respuesta visual a preguntas (VQA) sobre recibos o tickets de compra, aunque la model card no documenta el dataset ni el objetivo de forma explicita.

El modelo subyacente, SmolVLM-500M-Instruct, es un modelo vision-lenguaje pequeno desarrollado por HuggingFace que combina un codificador visual SigLIP con un decodificador de lenguaje de la familia SmolLM2. Al ser un adaptador LoRA, el resultado es un checkpoint muy ligero que requiere cargar el modelo base para poder ejecutarse, y modifica un subconjunto de parametros de las capas atencionales y de proyeccion.

La relevancia de esta ficha es limitada: el modelo tiene 0 descargas y 0 likes en el momento de la consulta, el repositorio ocupa 0.0 GB y la model card es la plantilla estandar de HuggingFace sin rellenar, con casi todos los campos marcados como "[More Information Needed]". No hay paper, demo, dataset ni resultados de evaluacion publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre transformador vision-lenguaje; el modelo base es un VLM con codificador SigLIP y decodificador SmolLM2) |
| Parametros totales | no disponible para el adaptador; el modelo base tiene 500M de parametros segun su denominacion |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion del adaptador; el modelo base declara 8192 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible para el adaptador (el modelo base se distribuye bajo licencia Apache 2.0) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA compatible con la libreria PEFT (version registrada en la model card: PEFT 0.21.1) y con `transformers`. No se especifican el rango (`r`), el factor `alpha`, los modulos objetivo, ni la tasa de aprendizaje o el numero de pasos de entrenamiento. Tampoco se documenta el regimen de precision (fp32, bf16, fp16) ni el hardware utilizado. Toda esta informacion aparece como "[More Information Needed]" en la model card original.

No hay datos sobre el conjunto de entrenamiento: no se indica el numero de tokens, la composicion del dataset, si hubo anotaciones humanas, ni si se aplicaron tecnicas de RLHF o DPO. El modelo base, SmolVLM-500M-Instruct, si es un modelo instruido, pero el proceso de ajuste especifico de este adaptador para la tarea de "receipt VQA" no esta documentado en ningun lugar del repositorio. La unica etiqueta tematica relevante es la referencia arXiv 1910.09700, que corresponde al articulo sobre el calculo de emisiones de carbono (Lacoste et al.), incluido por defecto en la plantilla y no como referencia tecnica del modelo.

## Capacidades

- Generacion de texto multimodal condicionada por imagen, heredada del modelo base SmolVLM-500M-Instruct.
- Respuesta visual a preguntas (VQA) sobre imagenes, presumiblemente aplicada a recibos y tickets segun el nombre del repositorio.
- Procesamiento de instrucciones en formato conversacional, dado que el modelo base es una variante "-Instruct".
- Capacidades especificas del adaptador (extraccion de campos, normalizacion de importes, deteccion de lineas de producto, etc.): no disponibles, no documentadas.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; poco probable en un adaptador sobre un modelo de 500M.
- Capacidades multilingues: no disponibles.
- Modo "thinking", vision adicional, audio o cualquier capacidad especial: no disponible.

## Casos de uso

Los siguientes casos son aplicaciones plausibles derivadas del nombre y del modelo base, pero no estan confirmados por el autor. Deben validarse con pruebas antes de cualquier uso en produccion.

- Digitalizacion de tickets de compra: enviar la imagen de un recibo al modelo y solicitar en lenguaje natural campos como fecha, comercio, importe total o IVA. El tamano reducido del modelo base (500M) permite ejecutarlo en local incluso en equipos modestos.
- Extraccion de lineas de detalle para contabilidad: usar el modelo como componente de un pipeline de OCR semantico donde el VQA complementa a un motor OCR clasico para estructurar los articulos de cada ticket.
- Clasificacion de gastos para aplicaciones de finanzas personales: dado un recibo, preguntar la categoria del gasto y el importe, integrandolo en una app movil que necesita inferencia en el dispositivo.
- Validacion de gastos en procesos de reembolso: comprobar de forma automatizada que la imagen aportada corresponde a un recibo y que el importe coincide con el declarado por el empleado.
- Preprocesado para RAG documental: convertir recibos escaneados en texto estructurado que luego se indexa en una base vectorial para busquedas posteriores.
- Prototipado e investigacion academica: servir como punto de partida para experimentos de VQA de bajo coste computacional, ajustando posteriormente el adaptador con datos propios.
- Asistencia a personas con discapacidad visual: describir o resumir el contenido de un ticket en voz alta a traves de una aplicacion movil, siempre que se validen las alucinaciones de importes.
- Auditoria de gastos a gran escala en entornos con restricciones de privacidad: al poder ejecutarse localmente, evita enviar imagenes de recibos a servicios en la nube de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye ninguna seccion de evaluacion cumplimentada, y no se han encontrado resultados en la busqueda web realizada.

## Requisitos de hardware

- El adaptador LoRA en si ocupa practicamente nada (el repositorio figura como 0.0 GB); el consumo real lo determina el modelo base `HuggingFaceTB/SmolVLM-500M-Instruct`.
- El modelo base de 500M de parametros puede ejecutarse en CPU para inferencia puntual, aunque con latencia elevada.
- En GPU consumer es perfectamente viable: cabe en tarjetas con 4-8 GB de VRAM en precision fp16/bf16, incluidas GTX 1650, RTX 3060, RTX 4060 o superiores.
- Para entrenamiento o ajuste adicional del adaptador LoRA son suficientes GPU consumer de gama media con 8-16 GB de VRAM.
- GPU de datacenter (A100, H100) no son necesarias para inferencia; tendrian sentido unicamente para ajustes a gran escala o despliegues con muchas peticiones concurrentes.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con `transformers` + `peft` sobre el modelo base. Es compatible con servidores de inferencia que soporten modelos PEFT (por ejemplo vLLM o TGI, sujeto a la compatibilidad con SmolVLM). Para CPU o entornos ligeros puede exportarse el modelo fusionado a GGUF mediante llama.cpp si la arquitectura del modelo base esta soportada.
- Latencia y throughput: no disponible. No hay cifras publicadas ni mediciones del autor.

## Comparativa con modelos similares

No disponible. No se han publicado datos de rendimiento del adaptador que permitan compararlo con alternativas. Como referencia de categoria, el modelo base `HuggingFaceTB/SmolVLM-500M-Instruct` compite con otros VLM ligeros como `HuggingFaceTB/SmolVLM-256M-Instruct`, `Qwen2-VL-2B-Instruct` o `moondream2`, pero no hay informacion que permita situar a este adaptador frente a ellos.

| Modelo | Parametros | Contexto | Licencia | Datos publicados |
|---|---|---|---|---|
| shekharrrr/receipt-vqa (adaptador) | no disponible | no disponible | no disponible | no |
| SmolVLM-500M-Instruct (base) | 500M | 8192 tokens | Apache 2.0 | si, en su model card |
| Qwen2-VL-2B-Instruct | 2B | 32768 tokens | Apache 2.0 | si |
| moondream2 | ~1.9B | 2048 tokens | Apache 2.0 | parcial |

## Limitaciones y advertencias

- Model card practicamente vacia: el autor no documenta datos de entrenamiento, hiperparametros, licencia ni uso previsto, lo que impide una evaluacion rigurosa.
- Riesgo alto de alucinacion en cifras: en tareas de extraccion de importes o fechas sobre recibos, cualquier error numerico tiene consecuencias directas, y no hay evaluacion que cuantifique la tasa de acierto.
- Licencia del adaptador no declarada: no se puede confirmar si su uso comercial esta permitido, mas alla de la licencia Apache 2.0 del modelo base.
- Sesgos conocidos: no disponibles; el modelo base SmolVLM hereda los sesgos de sus datos de entrenamiento, no documentados aqui.
- Limitacion de contexto: 8192 tokens en el modelo base, suficiente para una imagen y unas pocas preguntas, pero no para conversaciones largas.
- Idiomas: no se especifica ningun idioma soportado. El modelo base esta orientado principalmente al ingles, por lo que el rendimiento en castellano es incierto.
- Repositorio sin traccion: 0 descargas y 0 likes, sin mantenimiento aparente ni comunidad que lo haya validado.
- Fecha de creacion y actualizacion: 2026-10-02, con un intervalo de actualizacion de unos cinco minutos, lo que sugiere un push automatico o de prueba.
- No apto para uso en produccion sin validacion propia y sin datos de evaluacion.

## Enlaces

- HuggingFace: https://huggingface.co/shekharrrr/receipt-vqa
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolVLM-500M-Instruct
- Referencia de la plantilla (calculo de emisiones, no tecnica del modelo): https://arxiv.org/abs/1910.09700
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
