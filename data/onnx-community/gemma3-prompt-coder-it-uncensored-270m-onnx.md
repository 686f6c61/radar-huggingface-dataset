# onnx-community/Gemma3-Prompt.Coder.it.Uncensored-270m-ONNX

## Resumen

Gemma3-Prompt.Coder.it.Uncensored-270m es un modelo de generacion de texto de 270 millones de parametros construido mediante la fusion (merge) de cuatro variantes derivadas de google/gemma-3-270m-it. La fusion se realizo con la tecnica SLERP (interpolacion esferica) a traves de la herramienta mergekit, y combina pesos de un modelo abliterated (sin filtros de seguridad), un modelo orientado a codigo, un modelo de mejora de prompts y un modelo afinado adicional. El resultado es un modelo pequeno, sin censura y con sesgo hacia la generacion y expansion de prompts.

La ficha que nos ocupa es la version ONNX publicada por la comunidad onnx-community, pensada para su ejecucion en el navegador y en entornos JavaScript mediante Transformers.js. El repositorio ocupa 4,3 GB, lo que sugiere la inclusion de varias precisiones y variantes cuantizadas dentro del mismo espacio. No se especifica licencia ni idiomas soportados en la informacion disponible.

Es relevante por tres motivos: su tamano reducido (270M) lo hace desplegable en hardware muy modesto e incluso en cliente; su proposito practico esta orientado a reescribir y enriquecer prompts y a tareas de codigo; y su caracter "uncensored" implica que la seguridad se ha reducido deliberadamente, algo que condiciona por completo su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma3_text (transformer, familia Gemma 3) |
| Parametros totales | 270 millones (270m) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en detalle (repo ONNX de 4,3 GB, compatible con varias precisiones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Modelo base | WithinUsAI/Gemma3-Prompt.Coder.it.Uncensored-270m |
| Metodo de fusion | SLERP (mergekit) |
| Libreria | transformers.js |
| Pipeline | text-generation |
| Tamano del repositorio | 4,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Gemma 3 en su variante puramente de texto (`gemma3_text`), con 270 millones de parametros. No se trata de un entrenamiento desde cero ni de un afinado unico, sino de una fusion de cuatro modelos ya existentes mediante SLERP. Los cuatro componentes son: huihui-ai-Huihui-gemma-3-270m-it-abliterated (version sin filtros de seguridad), AxionLab-official-DogeAI-v1.5-Coder (orientado a codigo), gokaygokay-prompt-enhancer-gemma-3-270m-it (especializado en expansion de prompts) y broadfield-dev-gemma-3-270m-tuned-0106-1726 (afinado adicional). Todos ellos derivan de google/gemma-3-270m-it.

Segun la model card del autor, los modelos de origen se entrenaron con distintos propositos: mejora y expansion de prompts cortos en descripciones detalladas, una version sin censura obtenida mediante el framework TRL, y un modelo afinado sobre el dataset microsoft/rStar-Coder. Los datasets declarados en las etiquetas son microsoft/rStar-Coder, gokaygokay/prompt-enhancement-75k y gokaygokay/prompt-enhancer-dataset. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO. La conversion a ONNX se realizo de forma automatica mediante un Space de Hugging Face dedicado a la conversion. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto autoregresiva estandar, en el pipeline `text-generation`.
- Mejora y expansion de prompts: reescribe instrucciones cortas en descripciones mas largas y detalladas (herencia del modelo prompt-enhancer).
- Generacion y asistencia de codigo (herencia del modelo afinado con microsoft/rStar-Coder y del componente Coder).
- Generacion sin filtros de seguridad (variante abliterated), con las advertencias que ello implica.
- Ejecucion en navegador y en JavaScript mediante Transformers.js, sin backend Python.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; un modelo de 270M tiene capacidad muy limitada para cadenas de razonamiento largas.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible; se trata de un modelo solo de texto.
- Contexto largo: no disponible (no se especifica la longitud de contexto).

## Casos de uso

- Mejora de prompts en interfaces de usuario: integrar el modelo en un campo de texto de una aplicacion web para que, al escribir una instruccion breve, la reescriba en un prompt detallado antes de enviarlo a un modelo mayor. Su tamano permite ejecutarlo en el propio navegador.
- Preprocesado de instrucciones en pipelines de IA: usar el modelo como etapa ligera de normalizacion y enriquecimiento de prompts dentro de un flujo mayor, reduciendo la carga del modelo principal.
- Demos y prototipos en navegador con Transformers.js: desplegar un asistente de texto completamente en cliente, sin servidor, para pruebas de concepto o entornos de formacion.
- Asistencia de codigo en el editor: generar fragmentos o completar lineas sencillas en entornos con recursos muy limitados, sin depender de APIs externas.
- Filtrado y enriquecimiento de entradas en herramientas internas: transformar descripciones vagas de tickets o incidencias en especificaciones mas concretas antes de pasarlas a un modelo grande.
- Experimentacion academica sobre fusion de modelos: al ser un merge documentado con SLERP, sirve como caso de estudio reproducible para investigar tecnicas de merging y sus efectos en modelos pequenos.
- Generacion de texto en dispositivos sin GPU: por su tamano, puede ejecutarse en CPU en entornos de bajos recursos, util para pruebas offline.
- Evaluacion de alineacion y seguridad: util como sujeto de prueba en investigacion sobre modelos sin filtros y sus riesgos asociados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros): aproximadamente 1,1 GB en fp32, 540 MB en fp16, 270 MB en int8 y 135 MB en int4, sin contar el overhead del runtime ni el cache de atencion.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas con memoria compartida.
- Puede ejecutarse en CPU sin problema dado su tamano.
- Apto para ejecucion en navegador mediante Transformers.js (ONNX Runtime Web / WebGPU).
- Opciones de despliegue: Transformers.js (uso previsto por el publicador del repo ONNX), ONNX Runtime, y potencialmente llama.cpp u Ollama si se generan versiones GGUF, aunque no se documenta su disponibilidad.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.
- Nota: el repositorio ocupa 4,3 GB porque probablemente incluye varias precisiones; la variante realmente cargada condicionara el uso de memoria.

## Comparativa con modelos similares

Comparativa orientativa con alternativas de tamano similar de la misma categoria (modelos pequenos de instrucciones en ingles y multilingue). Los datos de la ficha original figuran como "no disponible" cuando la informacion proporcionada no los cubre.

| Modelo | Parametros | Tipo | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma3-Prompt.Coder.it.Uncensored-270m (ONNX) | 270M | Merge SLERP, uncensored | no disponible | no disponible | ONNX |
| google/gemma-3-270m-it | 270M | Instrucciones, Gemma 3 | no disponible en esta busqueda | Gemma (no disponible en detalle) | safetensors |
| Qwen2.5-0.5B-Instruct | 500M | Instrucciones | no disponible en esta busqueda | Apache 2.0 (segun modelo original) | safetensors, GGUF |
| SmolLM2-360M-Instruct | 360M | Instrucciones | no disponible en esta busqueda | Apache 2.0 (segun modelo original) | safetensors, GGUF |

Nota: los datos de contexto y licencia de los modelos de comparacion no provienen de la informacion proporcionada en esta busqueda, por lo que deben verificarse en sus fichas oficiales antes de tomar decisiones.

## Limitaciones y advertencias

- Modelo "uncensored": la model card advierte explicitamente de que el filtrado de seguridad se ha reducido de forma significativa, con riesgo de generar contenido sensible, controvertido o inapropiado.
- No apto para todas las audiencias: la propia ficha indica que no es adecuado para entornos publicos, usuarios menores de edad ni aplicaciones con altos requisitos de seguridad.
- Responsabilidad legal y etica: el usuario debe asegurarse de cumplir la legislacion local; el contenido generado puede conllevar riesgos legales.
- Recomendado solo para investigacion, pruebas o entornos controlados; se desaconseja su uso directo en produccion o en aplicaciones comerciales de cara al publico.
- Sin garantias de seguridad por defecto: no ha pasado por una optimizacion de seguridad rigurosa.
- Riesgo de alucinacion: con solo 270M de parametros, la tendencia a inventar informacion y a producir texto incoherente en tareas complejas es alta.
- Puede generar codigo incorrecto: el componente de codigo proviene de un afinado sobre rStar-Coder, pero el tamano del modelo limita severamente la correccion en tareas de programacion no triviales.
- Licencia no disponible: al no especificarse, no puede confirmarse la legitimidad del uso comercial; ademas, al derivar de la familia Gemma, podrian aplicarse los terminos de uso de Google, que no se detallan en la informacion disponible.
- Idiomas no disponibles: se desconoce que idiomas domina y con que calidad; el castellano no esta garantizado.
- Longitud de contexto no disponible: no puede planificarse el uso en conversaciones o documentos largos.
- Capacidad de razonamiento multi-paso y tool calling no confirmadas.
- Repositorio practicamente sin validacion: cero descargas y cero likes en el momento de la consulta, y conversion a ONNX realizada de forma automatica, sin evidencia publica de evaluacion.
- Fecha de creacion registrada como 2026-10-08; conviene verificar la vigencia de la informacion y posibles actualizaciones de la ficha.

## Enlaces

- Repositorio HuggingFace (version ONNX): https://huggingface.co/onnx-community/Gemma3-Prompt.Coder.it.Uncensored-270m-ONNX
- Modelo base original: https://huggingface.co/WithinUsAI/Gemma3-Prompt.Coder.it.Uncensored-270m
- Space de conversion a ONNX utilizado: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentacion del pipeline text-generation de Transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextGenerationPipeline
- mergekit (herramienta de fusion utilizada): https://github.com/cg123/mergekit
- Referencia sobre SLERP: https://en.wikipedia.org/wiki/Slerp
- Dataset microsoft/rStar-Coder: https://huggingface.co/datasets/microsoft/rStar-Coder
- Dataset gokaygokay/prompt-enhancement-75k: https://huggingface.co/datasets/gokaygokay/prompt-enhancement-75k
- Dataset gokaygokay/prompt-enhancer-dataset: https://huggingface.co/datasets/gokaygokay/prompt-enhancer-dataset
- Version ONNX del modelo base de Google gemma-3-270m-it: https://huggingface.co/onnx-community/gemma-3-270m-it-ONNX
