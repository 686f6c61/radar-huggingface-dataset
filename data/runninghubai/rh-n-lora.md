# RunningHubAI/rh-n-lora

## Resumen

rh-n-lora es un adaptador LoRA para edición de imágenes publicado por RunningHubAI en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo completo: es un fichero de pesos (763 MiB, `Krea2 NSFW+.safetensors`) que se aplica sobre un modelo base de difusion identificado en la model card como "krea2". Su pipeline declarado es image-text-to-image, es decir, edición o transformación de una imagen de entrada condicionada por una instrucción textual.

El repositorio lo publica RunningHub (plataforma de entrenamiento y despliegue de modelos de imagen) en nombre de un autor externo, y está pensado para cargarse en ComfyUI o ejecutarse en la propia nube de RunningHub. La model card no documenta rango del LoRA, módulos objetivo, dataset de entrenamiento, número de pasos ni hiperparámetros, por lo que la información técnica disponible es mínima: se reduce al pipeline, el tamaño del fichero y el modelo base de referencia.

Su relevancia es acotada y muy específica: sirve para quien necesite un adaptador de edición de imagen orientado a contenido NSFW (el nombre del fichero lo indica explícitamente) dentro de un flujo ComfyUI o vía API de RunningHub. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto recién publicado y sin validación comunitaria. La licencia no está declarada de forma inequívoca.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion de imagen; modelo base referenciado como "krea2" |
| Parametros totales | No disponible (adaptador LoRA; no se indica rango ni numero de parametros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de imagen; no hay ventana de contexto textual) |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen en safetensors; no se documentan variantes cuantizadas |
| Idiomas soportados | No disponible (el condicionamiento textual dependera del codificador de texto del modelo base) |
| Licencia | No disponible. La model card indica "Copyright remains with the author. Follow the original project or upstream license", sin especificar una licencia concreta |
| Formato de pesos | safetensors (`Krea2 NSFW+.safetensors`, 763 MiB) |
| Pipeline declarado | image-text-to-image |
| Plataformas indicadas | ComfyUI / RunningHub / Hugging Face |
| Tamano del repositorio | 0,8 GB |
| Fecha de creacion | 2026-09-28 (segun metadatos de Hugging Face) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del adaptador ni del modelo base. Por el formato y el tama\u00f1o (763 MiB en safetensors) y por la etiqueta `lora`, se trata de un adaptador de bajo rango que se inyecta en las capas de atencion de un modelo de difusion. El unico dato sobre el origen es "Finetuned from: krea2", sin especificar version, variante ni arquitectura subyacente (UNet o transformer de difusion), ni los modulos concretos a los que se aplican las matrices de bajo rango.

Tampoco se documenta el proceso de entrenamiento: no hay datos sobre el dataset, el numero de imagenes, la resolucion de entrenamiento, el numero de pasos, el learning rate, el rango del LoRA, el alpha ni si hubo entrenamiento con captions especificos. El unico enlace metodologico es la ficha original en Civitai, en cuya URL aparece el identificador "0x7-nsfw-krea2", lo que sugiere un adaptador orientado a contenido para adultos. El autor ofrece la posibilidad de entrenar modelos en RunningHub (pagina "Train models on RunningHub"), pero no hay detalles del entrenamiento de este adaptador concreto.

## Capacidades

- Edicion de imagen condicionada por texto: pipeline image-text-to-image, es decir, parte de una imagen y la modifica segun una instruccion textual.
- Transferencia de estilo o concepto: al ser un LoRA, su funcion esperada es inyectar un estilo, una estetica o un concepto aprendido en el modelo base.
- Generacion de contenido NSFW: el nombre del fichero (`Krea2 NSFW+.safetensors`) y la referencia a Civitai indican explicitamente esta orientacion.
- Integracion en flujos ComfyUI: el repositorio esta etiquetado con `comfyui`, por lo que se espera su uso como nodo de carga de LoRA en ese entorno.
- Ejecucion en la nube de RunningHub: la model card enlaza el modelo original alojado en la plataforma y ofrece API de llamada.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso ni uso como agente: no es un LLM.
- No tiene capacidades multilingues propias: el idioma del prompt dependera del codificador de texto del modelo base, que no se especifica.
- No se documenta modo "thinking", audio, video ni ninguna otra capacidad adicional.

## Casos de uso

- Edicion de imagen en produccion grafica: aplicar el adaptador sobre el modelo base en ComfyUI para transformar fotografias existentes (look, iluminacion, estetica) manteniendo la composicion original, dentro de un flujo automatizado por lotes.
- Prototipado de conceptos visuales: generar rapidamente variaciones de una referencia para validar direccion de arte antes de producir el material final.
- Personalizacion de contenido para plataformas de imagen: integrar el LoRA en un pipeline que reciba una imagen del usuario y devuelva una version editada, con la salvedad del contenido NSFW y las politicas aplicables.
- Despliegue como servicio: usar la API de RunningHub enlazada en la model card para invocar el modelo desde una aplicacion externa sin gestionar GPU propia.
- Investigacion sobre adaptadores de bajo rango: analizar como un LoRA de 763 MiB modifica el comportamiento del modelo base krea2, comparando salidas con y sin el adaptador.
- Curacion de contenido para adultos: generacion o retoque de material NSFW en plataformas que lo permitan legalmente, siempre con verificacion de edad y cumplimiento normativo.
- Composicion con otros adaptadores: cargar el LoRA junto a otros LoRA en ComfyUI para combinar estilos, ajustando pesos por nodo (requiere probar la compatibilidad, no documentada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, evaluaciones humanas), ni comparaciones cuantitativas con otros adaptadores, ni ejemplos de salida con prompts concretos.

## Requisitos de hardware

- Tamano del adaptador: 763 MiB en safetensors. Este peso es adicional al del modelo base y se suma a la VRAM necesaria.
- VRAM estimada: no disponible. La model card no indica requisitos y el modelo base ("krea2") tampoco se especifica con detalle, por lo que la VRAM vendra determinada por ese modelo base, no por el LoRA. Cualquier cifra concreta seria especulativa.
- GPU recomendadas: no disponibles. Como orientacion general para pipelines de difusion de imagen de esta clase, una GPU consumer con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) suele ser suficiente si el modelo base es de escala media y se usan variantes cuantizadas; para bases tipo FLUX o similares de mayor tamano suele recomendarse 24 GB o cuantizacion. Estas cifras son orientativas y no estan confirmadas por el autor.
- Despliegue: ComfyUI (etiqueta explicita del repositorio) y la plataforma RunningHub, tanto en su version internacional como en la china. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no identifica otros adaptadores LoRA comparables con datos verificables (parametros, contexto, licencia o rendimiento). El unico punto de referencia mencionado es el modelo base "krea2" y la ficha original en Civitai (`0x7-nsfw-krea2`), de la que no se aportan especificaciones.

| Modelo | Tipo | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| rh-n-lora | LoRA de edicion de imagen | No disponible | No disponible | Hugging Face, RunningHub, ComfyUI |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Contenido NSFW explicito: el nombre del fichero (`Krea2 NSFW+.safetensors`) y la referencia a Civitai indican que el adaptador esta orientado a material para adultos. Su uso en productos comerciales o plataformas con politicas restrictivas puede infringir esas politicas.
- Licencia ambigua: la model card no declara una licencia concreta y remite al proyecto original y a la licencia upstream. No hay confirmacion de que el uso comercial este permitido, por lo que no deberia asumirse.
- Riesgo legal y de cumplimiento: la generacion de contenido sexual implica obligaciones de verificacion de edad, etiquetado y cumplimiento normativo segun jurisdiccion.
- Documentacion tecnica practicamente inexistente: no hay informacion sobre rango, modulos objetivo, dataset, prompt de entrenamiento ni hiperparametros, lo que dificulta reproducir o ajustar resultados.
- Dependencia del modelo base: el resultado depende por completo de "krea2" y de su version concreta; no se especifica cual, por lo que la compatibilidad con otras variantes no esta garantizada.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia publica de calidad, estabilidad ni ausencia de artefactos.
- Sesgos: no documentados, pero un adaptador entrenado sobre un dataset no declarado puede heredar sesgos de representacion (etnia, genero, edad, corporalidad) del conjunto de entrenamiento.
- Alucinacion visual: como cualquier modelo de difusion, puede generar detalles anatomicos incorrectos, texto ilegible o elementos incoherentes respecto a la imagen de entrada.
- Metadatos dudosos: la fecha de creacion indicada (2026-09-28) es posterior a la fecha habitual de publicacion, lo que sugiere un posible error en los metadatos de Hugging Face.
- Sin benchmarks: no hay metricas que permitan estimar la calidad frente a alternativas.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-n-lora
- README en chino: https://huggingface.co/RunningHubAI/rh-n-lora/blob/main/README_cn.md
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2071941793553408002
- Pagina del autor en RunningHub: https://www.runninghub.ai/user-center/2041030036219498497
- Ficha de origen en Civitai: https://civitai.red/models/2742640/0x7-nsfw-krea2?modelVersionId=3084588
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Llamada a la API de ejemplo (Seedance 2.5): https://www.runninghub.ai/call-api/api-detail/2133100000000700025
