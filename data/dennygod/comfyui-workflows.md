# dennygod/comfyui-workflows

## Resumen

El repositorio `dennygod/comfyui-workflows` no es un modelo de IA en sentido estricto, sino una coleccion de 18 flujos de trabajo (workflows) en formato JSON para ComfyUI, el entorno de generacion de imagenes por difusion basado en nodos. El autor, dennygod, publica una copia de seguridad de sus workflows con rutas normalizadas y anonimizadas, pensada para poder desplegarse directamente en entornos como Vast.ai o Colab sin arrastrar rutas locales ni nombres de personajes privados.

Los flujos cubren tareas de texto a imagen (txt2img), imagen a imagen (img2img) y utilidades auxiliares, y estan construidos sobre dos familias de modelos de imagen: MOSS-Image y Qwen-Image-2.1 Turbo. Incluyen variantes con LoRA de personaje, destilacion en 4 y 8 pasos, integracion con llama.cpp como codificador de texto y comprobaciones de identidad facial o segmentacion con SAM 3.1.

La relevancia de este repositorio es practica: sirve como plantilla reproducible para quien quiera montar pipelines de generacion de imagen en ComfyUI con modelos recientes, especialmente en despliegues cloud. No contiene pesos de modelo ni codigo de entrenamiento, y no dispone de model card tecnica con especificaciones, benchmarks ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de workflows, no de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (documentacion del repositorio en chino tradicional) |
| Licencia | no disponible |
| Formato de pesos | JSON (workflows de ComfyUI); referencias a `.safetensors` para LoRA |

## Arquitectura y entrenamiento

Este repositorio no entrena ni distribuye pesos. Contiene ficheros JSON que describen grafos de nodos de ComfyUI: cada workflow define la cadena de carga de modelos, codificadores de texto, samplers, aplicacion de LoRA y postprocesado. Los flujos hacen referencia a modelos externos como MOSS-Image (en variantes SFT y con LoRA de destilacion a 4 y 8 pasos) y Qwen-Image-2.1 Turbo (8 pasos con ManualSigmas), ademas de componentes auxiliares como SAM 3.1 para segmentacion y un codificador basado en llama.cpp de 4B o 9B para expansion o traduccion de prompts.

La aportacion tecnica del repositorio es la normalizacion de rutas (uso de `/` en lugar de rutas absolutas de Windows o Linux), la sustitucion de nombres de personajes y triggers por placeholders (`moss/MyCustom/<character_lora>.safetensors` y `<trigger>`) y la eliminacion de imagenes de referencia originales. Esto permite clonar los workflows en un entorno limpio y ejecutarlos con modelos propios. No hay informacion sobre datasets, tokens de entrenamiento ni tecnicas de alineacion, porque no se trata de un modelo entrenado.

## Capacidades

- Generacion de imagen texto a imagen con MOSS-Image en configuracion SFT oficial y en variantes destiladas a 4 y 8 pasos.
- Control de composicion mediante cajas de coordenadas (bounding boxes) en el workflow `moss-sft-bboxes-v1.json`.
- Prompting estructurado en JSON para MOSS-Image (`moss-sft-json-prompt-v1.json`).
- Edicion de imagen con doble referencia mediante Qwen-Image-2.1 Turbo (`qwen21-image-edit-v1.json`).
- Aplicacion de LoRA de personaje, incluida la superposicion de multiples LoRA con el nodo de stack de rgthree.
- Evaluacion sistematica de LoRA: pruebas de estabilidad con multiples semillas, consistencia en cuatro escenas y angulos, y barrido de fuerza (0.5, 0.75, 1.0, 1.25).
- Expansion de prompts integrada en el propio workflow de MOSS-Image.
- Integracion de un codificador de texto basado en llama.cpp (4B o 9B) con una capa experimental de traduccion.
- Utilidades auxiliares: comparacion de identidad facial entre dos imagenes y segmentacion multiobjeto con SAM 3.1.
- Soporte de despliegue en Vast.ai y Colab mediante descarga en una linea con `hf download`.

## Casos de uso

- Prototipado rapido de pipelines de generacion de imagen: un desarrollador puede descargar el repositorio y tener 18 grafos funcionales en ComfyUI sin configurar rutas manualmente, lo que reduce el tiempo de puesta en marcha en entornos cloud.
- Entrenamiento y validacion de LoRA de personaje: los workflows `moss-lora-eval-*` permiten medir estabilidad, consistencia entre escenas y sensibilidad a la fuerza del LoRA antes de desplegar un personaje en produccion.
- Generacion de imagen controlada por layout: el flujo de bounding boxes de MOSS-Image SFT sirve para composiciones donde se necesita ubicar elementos en regiones concretas del lienzo, util en diseno de escenarios o ilustracion tecnica.
- Edicion de imagen con multiples referencias: el workflow de Qwen-Image-2.1 Turbo permite combinar dos imagenes de referencia para tareas de edicion o transferencia de estilo, adecuado para retoque asistido.
- Aceleracion de inferencia en produccion: las variantes destiladas a 4 y 8 pasos reducen el numero de evaluaciones del sampler, lo que baja el coste por imagen en despliegues con GPU limitada.
- Automatizacion de prompts en otro idioma: el workflow con llama.cpp 4B/9B y capa de traduccion permite introducir instrucciones en un idioma y generar la imagen a partir de un prompt expandido, util para equipos no angloparlantes.
- Verificacion de identidad y segmentacion como pasos previos o posteriores: los flujos de FaceID y SAM 3.1 se pueden encadenar para filtrar resultados o extraer mascaras antes de una edicion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base referenciado (MOSS-Image o Qwen-Image-2.1 Turbo) y del codificador llama.cpp (4B o 9B), no de los workflows en si.
- GPU recomendadas: no disponible en la informacion proporcionada. El autor menciona despliegue en Vast.ai y Colab, lo que sugiere GPUs cloud de gama media-alta, pero no especifica modelos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI como entorno principal; llama.cpp para el codificador de texto en los flujos `moss-llamacpp-*`; descarga via `hf download` para Vast.ai y Colab.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. Este repositorio es una coleccion de workflows y no un modelo, por lo que no existe una comparativa directa de parametros, contexto o rendimiento con otros modelos. Como referencia de categoria, se podria comparar con otros repositorios de workflows de ComfyUI, pero no se dispone de datos de esos repositorios en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, no se puede ejecutar por si solo y requiere descargar los modelos referenciados (MOSS-Image, Qwen-Image-2.1 Turbo, SAM 3.1, LoRA) por separado.
- Licencia no declarada: al no especificarse licencia, no hay garantia de uso comercial; conviene contactar con el autor o asumir ausencia de permisos explicitos.
- Los workflows hacen referencia a rutas y nombres de modelos concretos (`moss/MyCustom/<character_lora>.safetensors`, `<trigger>`) que el usuario debe sustituir por sus propios ficheros; si no se ajustan, los grafos fallaran al cargar.
- El repositorio incluye tags y referencias a contenido NSFW en el nombre del repositorio de GitHub sincronizado (`my-comfyui-nsfw`), lo que puede condicionar su uso en entornos corporativos o academicos.
- La documentacion esta en chino tradicional; no hay traduccion oficial al castellano ni al ingles.
- Sin benchmarks ni validacion de calidad: no hay evidencia publicada del rendimiento de estos workflows frente a alternativas.
- Fecha de creacion futura (2026-11-18) en los metadatos de Hugging Face, lo que puede indicar un error de marcado o una fecha programada; conviene verificar la integridad del repositorio antes de usarlo.
- Dependencia de versiones concretas de nodos de ComfyUI (rgthree, SAM 3.1, llama.cpp); cambios en esas extensiones pueden romper los grafos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dennygod/comfyui-workflows
- Repositorio GitHub sincronizado (mencionado en la model card): `my-comfyui-nsfw/workflows/` (no se proporciona URL completa)
- ComfyUI (entorno de ejecucion): no disponible en la informacion proporcionada
- MOSS-Image: no disponible en la informacion proporcionada
- Qwen-Image-2.1 Turbo: no disponible en la informacion proporcionada
- SAM 3.1: no disponible en la informacion proporcionada
- llama.cpp: no disponible en la informacion proporcionada
