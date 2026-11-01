# DutchIT/moss-image-prompt-enhancer-i2i

## Resumen

MOSS-Image Prompt Enhancer i2i es un modelo derivado de Huihui-Qwen3-VL-8B-Instruct-abliterated, publicado por el usuario DutchIT en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un empaquetado de los pesos del modelo base junto con un system prompt y parametros especificos que lo especializan en una tarea muy concreta: transformar una imagen de entrada (y opcionalmente una instruccion de modificacion) en un prompt detallado en ingles para el modelo generador de imagenes MOSS-Image.

El modelo resuelve el problema de la ingenieria de prompts para text-to-image: convierte ideas breves o imagenes existentes en descripciones ricas (sujeto, composicion, iluminacion, estilo, texto visible, conteos, edad y etnia aparente de las personas) que MOSS-Image puede consumir como prompt positivo. Soporta dos modos: Caption (prosa cohesiva en ingles) y Layout (borrador JSON con bounding boxes en pixeles para posters, infografias o imagenes con texto colocado).

Es relevante porque permite ejecutar localmente y sin agente externo la skill oficial moss-image-prompt-enhancer de OpenMOSS, usando Ollama como runtime. Al estar basado en un Qwen3-VL de 8B, hereda capacidades de vision y comprension imagen-texto, pero su uso esta acotado a la generacion de prompts, no a la generacion de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (heredada de Qwen3-VL-8B-Instruct) |
| Parametros totales | 8B (modelo base Huihui-Qwen3-VL-8B-Instruct-abliterated) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (distribucion via Ollama, aproximadamente 6 GB para la variante i2i) |
| Idiomas soportados | no disponible (salida esperada en ingles para prompts) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (empaquetado para Ollama; el repo de HuggingFace reporta 0.0 GB) |

## Arquitectura y entrenamiento

El modelo no introduce una arquitectura nueva: reutiliza los pesos de Huihui-Qwen3-VL-8B-Instruct-abliterated, una variante abliterated del Qwen3-VL-8B-Instruct de Alibaba. Qwen3-VL es un transformer multimodal que procesa imagenes y texto y genera texto. La variante abliterated elimina direcciones de rechazo del modelo original, lo que puede afectar al comportamiento de seguridad.

No hay informacion disponible sobre el entrenamiento adicional del modelo: la model card indica explicitamente que el paquete de Ollama contiene los pesos del modelo base mas el system prompt y parametros del proyecto, y "no new weights". Es decir, la especializacion se logra mediante prompting de sistema y configuracion del Modelfile, no mediante fine-tuning supervisado ni RLHF/DPO adicionales documentados.

La innovacion tecnica destacable es el diseno de dos modos de salida (Caption y Layout) y la decision de no pedir al modelo la aritmetica de coordenadas: en Layout mode el modelo devuelve cajas en pixeles absolutos en formato xyxy y un script externo (compile_prompt.py) las convierte al formato yxyx centrado que espera MOSS-Image, porque los modelos pequenos fallan en ese calculo.

## Capacidades

- Generacion de prompts en ingles para MOSS-Image a partir de una idea breve.
- Comprension de imagenes de entrada (image-to-image): describe una imagen existente en formato Caption.
- Modificacion guiada: dada una imagen y una instruccion de cambio, devuelve el prompt completo de la imagen modificada conservando el resto de elementos.
- Modo Layout: genera un borrador JSON con bounding boxes en pixeles para posters, infografias, paneles multiples y texto con colocacion exacta.
- Preservacion de la intencion del usuario: sujeto, estilo, conteos, exclusiones y texto visible exacto.
- Inferencia de edad y etnia aparente de las personas cuando no se especifican, a partir del contexto.
- Respeto de modo explicito ("Layout mode", "Caption mode") y de tamano de lienzo explicito.
- Salida limpia: solo el prompt, sin preambulo, sin listas de quality tags, sin prompts negativos ni eslóganes inventados.
- Integracion con Ollama via CLI y API HTTP, y con ComfyUI mediante el nodo comfyui-ollama.

## Casos de uso

- Generacion de prompts para MOSS-Image en local: el usuario escribe una idea corta y obtiene un prompt positivo listo para pegar en ComfyUI o en la API de MOSS-Image, sin depender de un agente ni de servicios en la nube.
- Recreacion de imagenes existentes: se pasa una foto y el modelo devuelve un prompt en prosa que cubre sujeto, composicion, iluminacion, estilo, texto visible y conteos, util para reproducir o versionar una imagen.
- Edicion guiada por instruccion: con una imagen y una orden como "make it a rainy evening and change her sweater to red", el modelo devuelve el prompt completo de la escena modificada, manteniendo el resto de elementos intactos.
- Diseno de posters e infografias: en Layout mode el modelo produce un borrador JSON con bounding boxes absolutos para titulos, subtitulos y elementos graficos, que luego se compila con compile_prompt.py para MOSS-Image.
- Pipelines de generacion por lotes: al exponerse via API de Ollama (endpoint /api/generate), puede integrarse en scripts que enriquezcan cientos de prompts cortos antes de enviarlos a un generador de imagenes.
- Prototipado en ComfyUI: conectando un nodo de texto al nodo comfyui-ollama sin system prompt adicional, se obtiene un enriquecimiento de prompt dentro del propio grafo de generacion.
- Catalogacion y descripcion de imagenes: el modo Caption puede usarse para generar descripciones detalladas y consistentes de un conjunto de imagenes, reutilizables como metadatos o como prompts de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 8 GB de RAM o VRAM es "comfortable" segun la model card; la descarga del modelo base i2i es de unos 6 GB.
- GPU recomendadas: no se especifican modelos concretos; cualquier GPU consumer con 8 GB o mas de VRAM deberia poder ejecutar la variante cuantizada de 8B. Para mayor holgura, GPUs de 12-24 GB (RTX 3060 12 GB, RTX 4070, RTX 4090) o profesionales (A100, H100) no son necesarias pero aceleran la inferencia.
- Cabe en GPU consumer: si, con al menos 8 GB de VRAM en la cuantizacion distribuida por Ollama.
- Opciones de despliegue: Ollama (CLI, API HTTP en 127.0.0.1:11434), ComfyUI mediante comfyui-ollama. No se documentan vLLM, llama.cpp directo ni TGI para este empaquetado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image Prompt Enhancer i2i (este) | 8B | no disponible | si | Apache 2.0 | HuggingFace + Ollama |
| Huihui-Qwen3-VL-8B-Instruct-abliterated (base) | 8B | no disponible | si | no disponible en la informacion | HuggingFace + Ollama |
| Qwen3-VL-8B-Instruct (original) | 8B | no disponible | si | no disponible en la informacion | HuggingFace |

La comparativa se limita al linaje directo porque no se dispone de datos de benchmarks ni de otros modelos especializados en enriquecimiento de prompts para MOSS-Image en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generador de imagenes: solo produce prompts; requiere MOSS-Image u otro generador para materializar la imagen.
- El modo Layout devuelve un borrador con coordenadas xyxy absolutas que debe compilarse con compile_prompt.py antes de usarse en MOSS-Image; el prompt compilado no incluye las dimensiones, que hay que pasar por separado.
- La variante i2i exige el tag -instruct del modelo base; la variante por defecto es un modelo de razonamiento que puede gastar miles de tokens y devolver una respuesta vacia.
- Al derivar de un modelo abliterated, las salvaguardas del modelo original estan alteradas; no se documenta el impacto concreto en sesgos o contenido sensible.
- Riesgo de alucinacion en la descripcion de imagenes: puede inventar texto visible, conteos o atributos no presentes, aunque la model card afirma que evita eslóganes y marcas de agua inventados.
- La inferencia de edad y etnia aparente de las personas cuando no se especifican puede introducir sesgos y debe revisarse en contextos sensibles.
- No hay informacion sobre idiomas soportados ni sobre el comportamiento fuera del ingles en la salida de prompts.
- El repo de HuggingFace reporta 0.0 GB y 0 descargas; la distribucion real se realiza a traves de Ollama, no del repo de HuggingFace.
- Licencia Apache 2.0 declarada, pero la licencia del modelo base y de la variante abliterated no se detalla en la informacion disponible; conviene verificarla antes de uso comercial.

## Enlaces

- HuggingFace: https://huggingface.co/DutchIT/moss-image-prompt-enhancer-i2i
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3-VL-8B-Instruct-abliterated
- Repositorio del proyecto: https://github.com/royen99/moss-image-prompt-enhancer
- MOSS-Image: https://github.com/OpenMOSS/MOSS-Image
- Skill oficial moss-image-prompt-enhancer: https://github.com/OpenMOSS/MOSS-Image/tree/main/skills/moss-image-prompt-enhancer
- Script compile_prompt.py: https://github.com/OpenMOSS/MOSS-Image/tree/main/skills/moss-image-prompt-enhancer/scripts
- Ollama: https://ollama.com
- Descarga de Ollama: https://ollama.com/download
