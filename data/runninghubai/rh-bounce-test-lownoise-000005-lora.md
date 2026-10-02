# RunningHubAI/rh-bounce-test-lownoise-000005-lora

## Resumen

rh-bounce-test-lownoise-000005-lora es un adaptador LoRA publicado en HuggingFace por RunningHubAI (RunningHub) para el modelo de generacion de video WAN 2.2. No es un modelo de lenguaje ni un modelo generativo completo: es un fichero de pesos de 293 MiB en formato safetensors que se carga sobre la red base de WAN 2.2 para modificar el comportamiento de generacion de movimiento en un dominio muy concreto. El autor acreditado en la model card es el usuario @T8star-Aix, y el modelo original se distribuye tambien a traves de la plataforma RunningHub y de Civitai.

El repositorio no incluye informacion sobre el rango del adaptador, las capas objetivo, el numero de pasos de entrenamiento ni el dataset utilizado. La model card se limita a indicar que esta afinado a partir de WAN 2.2, que pertenece a la categoria "LowNoise" (lo que sugiere que actua sobre el experto de bajo ruido de la arquitectura MoE de WAN 2.2, aunque esto no se confirma explicitamente en la documentacion) y que emplea las palabras de activacion "her breasts bounce, shake, jiggle and sway", lo que situa el adaptador en el ambito de la animacion anatomica de caracter adulto.

Su relevancia practica es limitada fuera de ese nicho: se trata de un artefacto de comunidad con 0 descargas y 0 "likes" en el momento de la consulta, sin licencia declarada, sin benchmarks publicados y sin documentacion tecnica de entrenamiento. Resulta util como ejemplo del flujo de trabajo LoRA sobre modelos de video de difusion en ComfyUI, pero no como componente de produccion sin una evaluacion previa del modelo base y de las condiciones legales de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de video WAN 2.2; rango y modulos objetivo: no disponible |
| Parametros totales | no disponible (fichero de pesos de 293 MiB) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (en el modelo base la generacion se mide en fotogramas, no en tokens) |
| Tipos de cuantizacion | no disponible para el adaptador; se distribuye en safetensors y su compatibilidad con bases cuantizadas (fp8, GGUF) depende del runtime |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del modelo base) |
| Licencia | no disponible; la model card indica que se debe seguir la licencia del proyecto original o de la fuente upstream |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Fichero principal | `bounce_test_LowNoise-000005.safetensors` (293 MiB) |
| Modelo base | WAN 2.2 (finetuned from) |
| Tipo de modelo | LoRA |
| Plataformas | ComfyUI, RunningHub, Hugging Face |
| Autor | RunningHub / @T8star-Aix |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (segun el repositorio) | 2026-10-02 |
| Ultima actualizacion (segun el repositorio) | 2026-10-02 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del adaptador. Por el tipo de artefacto, se trata de una LoRA aplicada sobre un modelo de difusion de video, y el sufijo "lownoise" del nombre apunta a que esta pensada para la etapa de bajo ruido del proceso de denoising, caracteristica relevante porque WAN 2.2 organiza parte de sus variantes en torno a expertos de alto y bajo ruido. Esta interpretacion es una inferencia a partir del nombre del fichero (`bounce_test_LowNoise-000005.safetensors`) y del campo "Finetuned from: WAN2.2" de la model card, no una especificacion confirmada por el autor.

Tampoco se han publicado datos sobre el conjunto de entrenamiento: no hay numero de clips, resolucion, duracion, numero de pasos, tasa de aprendizaje, rango de la LoRA ni tecnica de regularizacion. La model card menciona que el modelo se entreno en RunningHub y enlaza a la plataforma de entrenamiento del proveedor, pero sin cifras. No hay referencia a RLHF, DPO ni a tecnicas de decodificacion especulativa, que en cualquier caso no aplican a este tipo de modelo. La unica indicacion funcional concreta es el conjunto de palabras de activacion que el autor declara.

## Capacidades

- Modificacion del movimiento generado en videos creados con WAN 2.2, en el dominio concreto descrito por el autor.
- Activacion mediante prompt textual con las palabras clave declaradas: "her breasts bounce, shake, jiggle and sway".
- Integracion en flujos de trabajo de ComfyUI como nodo de carga de LoRA, apilable con otros adaptadores y con el modelo base.
- Compatibilidad declarada con la plataforma RunningHub, tanto en su interfaz como en su API.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales de entrada.
- No se documenta soporte multilingue especifico; el idioma del prompt vendra determinado por el codificador de texto del modelo base.
- No se documentan modos especiales (thinking mode, vision, audio) mas alla de la generacion de video del modelo subyacente.

## Casos de uso

- Prototipado de animacion de personajes en ComfyUI: el adaptador se carga sobre WAN 2.2 para producir variaciones de movimiento en un clip corto y comparar resultados entre semillas, util en fase de exploracion visual.
- Pruebas de control de movimiento en pipelines de video generativo: permite evaluar como responde un modelo de difusion de video a adaptadores de bajo rango que alteran una dimension concreta del movimiento sin reentrenar la base.
- Investigacion sobre composicion de LoRAs: sirve como caso de estudio para medir interferencias entre adaptadores cuando se apilan varios sobre el mismo modelo base.
- Automatizacion por API en RunningHub: el modelo puede invocarse a traves de la API del proveedor para generar clips de forma programatica dentro de un flujo ya existente.
- Aprendizaje de tecnicas de entrenamiento LoRA: el repositorio documenta el origen (entrenado en RunningHub) y enlaza a la herramienta de entrenamiento del proveedor, lo que lo hace util como referencia de flujo de trabajo, no como referencia de calidad.
- Generacion de material audiovisual de caracter adulto: es el uso previsto segun las palabras de activacion declaradas, sujeto a las restricciones legales y de plataforma aplicables en cada jurisdiccion.
- No se recomienda su uso en produccion sin evaluacion previa: con 0 descargas, 0 likes y sin licencia declarada, no hay evidencia publica de calidad, estabilidad ni cobertura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FVD, CLIP score, SSIM, consistencia temporal) ni comparaciones cuantitativas con otros adaptadores. Tampoco se dispone de evaluaciones cualitativas en el repositorio mas alla de la descripcion textual del autor.

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,3 GB adicionales sobre el modelo base; el coste dominante es siempre el de WAN 2.2, no el de la LoRA.
- VRAM estimada del modelo base (orientativa, no confirmada en la informacion proporcionada): en torno a 30-40 GB en precision completa para las variantes de mayor tamano, reducible a rangos de 16-20 GB con cuantizacion fp8 o GGUF de 8 bits, y a 8-12 GB con cuantizaciones de 4 bits.
- GPU recomendadas: para precision completa, GPU de clase profesional (A100 80 GB, H100, L40S); para cuantizacion agresiva, es posible trabajar en GPU de consumo con 12-24 GB de VRAM (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090).
- Cabe en GPU de consumo: si, con cuantizacion, dependiendo de la resolucion y del numero de fotogramas generados; la VRAM necesaria crece con la longitud del clip.
- Opciones de despliegue: ComfyUI es el entorno declarado por el autor; tambien es habitual usar runtime de difusion compatibles con safetensors (por ejemplo, Diffusers como biblioteca de inferencia). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a modelos de difusion de video con esta interfaz.
- Latencia y throughput: no disponibles. Dependen del modelo base, la GPU, la resolucion, el numero de fotogramas y el muestreador empleado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / duracion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-bounce-test-lownoise-000005-lora | LoRA sobre WAN 2.2 | no disponible (293 MiB) | no disponible | no disponible | HuggingFace, RunningHub, Civitai |
| WAN 2.2 (modelo base) | Difusion de video | no disponible en esta ficha | no disponible en esta ficha | licencia del proyecto original | Ampliamente distribuido |
| Otros LoRAs de movimiento para WAN 2.2 | LoRA | variable segun el autor | no aplica | variable, normalmente la del modelo base | Civitai, HuggingFace |
| Adaptadores LoRA para otros modelos de video abiertos (por ejemplo, HunyuanVideo o LTX-Video) | LoRA | variable segun el autor | no aplica | variable segun el proyecto | HuggingFace, Civitai |

No se dispone de datos objetivos que permitan una comparacion cuantitativa con alternativas concretas dentro de la misma categoria. Los modelos comparables citados se incluyen como referencia de categoria, no como resultado de una evaluacion realizada.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican rango de la LoRA, capas objetivo, datos de entrenamiento ni hiperparametros, lo que impide reproducir o auditar el adaptador.
- Licencia no declarada: la model card remite a "la licencia del proyecto original o de la fuente upstream" y senala que los derechos permanecen en el autor. No hay garantia explicita de uso comercial, por lo que su empleo en produccion requiere verificacion legal previa.
- Contenido adulto: las palabras de activacion declaradas situan el adaptador en el ambito de la animacion anatomica de caracter adulto. Su uso esta sujeto a las politicas de la plataforma, a la legislacion aplicable y a las restricciones de los servicios que lo alojan.
- Riesgo de artefactos y de inconsistencia temporal: al ser un adaptador de bajo rango sobre un modelo de difusion de video, puede introducir deformaciones, parpadeo entre fotogramas o perdida de coherencia, especialmente con prompts alejados del dominio entrenado.
- Activacion dependiente de palabras clave: el comportamiento esta ligado a las frases indicadas por el autor; fuera de ese disparador el efecto puede ser nulo o impredecible.
- Sin evidencia de comunidad: 0 descargas y 0 likes implican ausencia de validacion independiente, de issues reportados y de historial de fallos conocidos.
- Fechas anomalas: el repositorio declara creacion el 2026-10-02 y actualizacion el mismo dia, dato que conviene contrastar con la fuente original.
- Compatibilidad no verificada con otros adaptadores: no hay informacion sobre interferencias si se apila con otras LoRAs sobre el mismo modelo base.
- Dependencia del modelo base: cualquier limitacion de WAN 2.2 en cuanto a resolucion, duracion del clip o fidelidad del prompt se hereda integramente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/RunningHubAI/rh-bounce-test-lownoise-000005-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1966514693961658370
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1819214514410942465
- Ficha en Civitai referenciada por el autor: https://civitai.com/models/1944129/slop-bounce-wan-22-i2v?modelVersionId=2200388
- Plataforma RunningHub (internacional): https://www.runninghub.ai
- Plataforma RunningHub (China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Endpoint de API de Seedance 2.5 citado en la model card: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
