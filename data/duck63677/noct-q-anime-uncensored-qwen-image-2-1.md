# Duck63677/Noct-Q-Anime-Uncensored-Qwen-Image-2.1

## Resumen

Noct Q Anime Uncensored Qwen Image 2.1 es un modelo de difusion texto-a-imagen derivado por merge (fine-tuning de pesos del transformer) de Qwen/Qwen-Image-2.1, publicado por el usuario Duck63677 (perfil asociado Noctaluna). Su proposito es la generacion de ilustracion anime sin censura, incluyendo desnudo y escenas explicitas con personajes adultos, manteniendo la capacidad del modelo base para seguir prompts largos y detallados. Se distribuye como un unico archivo safetensors ya cuantizado a int8 (7,3 GB), pensado para cargarse directamente en ComfyUI sin pipeline de difusion completo.

El modelo resuelve un nicho concreto: quienes trabajan con Qwen-Image 2.1 y necesitan un checkpoint orientado a estetica anime (luz suave, color limpio) que no aplique filtrado de contenido adulto. La model card indica que el archivo va en `models/diffusion_models` y depende de un text encoder Qwen3-VL 8B en int8 y del VAE especifico de Qwen-Image 2.1, ambos publicados por Comfy-Org.

Es relevante ahora porque Qwen-Image 2.1 es un modelo reciente de generacion de imagen de gran calidad y este derivado aparece como uno de los primeros merges anime no censurados sobre esa base. La licencia es heredada del modelo base (Qwen Research License Agreement), lo que restringe el uso a fines no comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (texto-a-imagen) derivado de Qwen-Image 2.1; pesos del transformer modificados por merge |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | int8 (archivo publicado); segun la model card existen variantes int4, fp8, bf16 y fp16 en Civitai |
| Idiomas soportados | no disponible (prompts en ingles en los ejemplos; el text encoder Qwen3-VL es multilingue, pero no se documenta el alcance) |
| Licencia | qwen-research (Qwen Research License Agreement); uso no comercial unicamente |
| Formato de pesos | safetensors (single file, libreria `diffusion-single-file`) |

## Arquitectura y entrenamiento

El modelo es un derivado por merge de Qwen/Qwen-Image-2.1, un modelo de difusion para generacion de imagen. La model card declara explicitamente `base_model_relation: merge` y que se han modificado los pesos del transformer respecto al original (ver `NOTICE` del repositorio). No se detalla la composicion del dataset de merge, el numero de pasos de entrenamiento, ni si hubo etapas de fine-tuning adicionales, RLHF o DPO; esa informacion no esta disponible.

El pipeline de inferencia documentado es el de ComfyUI con nodos core (version 0.37 o superior). Requiere tres componentes separados: el transformer cuantizado a int8 (`NoctQA_V1_int8_convrot.safetensors`), el text encoder `qwen3vl_8b_int8_convrot.safetensors` y el VAE `qwen_image_2.1_vae_bf16.safetensors`. Los ajustes recomendados son 25 pasos, sampler euler, scheduler simple, CFG 3 y un prompt negativo incluido en el workflow JSON adjunto. La convencion de prompting exige iniciar con la frase "An anime illustration of…" para activar el estilo anime; sin esa palabra el modelo tiende a generar imagenes fotograficas.

## Capacidades

- Generacion de ilustracion anime en distintos encuadres: retratos cerrados, cuerpo completo y pinturas de fondo amplias.
- Representacion de personajes adultos vestidos, en lenceria, desnudos y en escenas explicitas (contenido NSFW sin censura).
- Seguimiento de prompts largos y detallados, incluyendo multiples personajes, poses y angulos de camara especificados en el texto.
- Estilo visual caracterizado por luz suave y color limpio, segun la model card.
- Control de estilo mediante prompt: la presencia o ausencia de la palabra "anime" cambia el registro entre ilustracion y fotografia.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio; son capacidades no aplicables o no disponibles en un modelo de difusion texto-a-imagen.

## Casos de uso

- Ilustracion de personajes para proyectos de ficcion o juegos indie: el modelo genera retratos y cuerpos completos en estilo anime con control de pose y encuadre mediante prompts descriptivos, util para bocetos conceptuales en fases de preproduccion.
- Creacion de arte para doujinshi o comics amateur: permite escenas con varios personajes y angulos de camara concretos, y admite contenido adulto, lo que encaja con publicaciones no comerciales bajo la licencia qwen-research.
- Prototipado de fondos y key art: la capacidad de generar "wide background paintings" sirve para explorar paletas y composiciones de escenarios antes de encargar arte final.
- Generacion de variantes de vestuario y poses sobre un mismo personaje: con prompts largos y detallados se pueden fijar rasgos y variar atuendo (vestido, lenceria, desnudo) para estudiar disenos.
- Investigacion sobre filtrado y contenido en modelos de difusion: al ser un derivado no censurado de una base reciente, es util para estudiar como el merge de pesos afecta a la alineacion de seguridad y a la fidelidad al prompt.
- Flujos de trabajo locales en ComfyUI: al distribuirse como single file int8 con workflow JSON incluido, se integra en pipelines de generacion por lotes en estaciones de trabajo con GPU de consumo, sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor indica que el archivo int8 de 7,3 GB esta pensado para tarjetas de 8 a 12 GB, asumiendo que el text encoder y el VAE se cargan segun el flujo de ComfyUI.
- GPU recomendadas: no se especifican modelos concretos; por el rango de VRAM indicado encajan GPU de consumo de gama media-alta con 8-12 GB (por ejemplo, RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) y, con holgura, GPU profesionales tipo A100 o H100 para las variantes bf16/fp16.
- Cabe en GPU de consumo: si, segun el autor, en tarjetas de 8 a 12 GB con la cuantizacion int8.
- Opciones de despliegue: ComfyUI 0.37 o superior con nodos core; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion en este formato).
- Latencia y throughput: no disponibles. Los ajustes recomendados son 25 pasos con sampler euler y CFG 3.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Noct Q Anime Uncensored Qwen Image 2.1 | Qwen-Image 2.1 (merge) | no disponible | no aplica | qwen-research (no comercial) | Hugging Face (single file int8), variantes en Civitai |
| Qwen/Qwen-Image-2.1 | Original | no disponible | no aplica | qwen-research | Hugging Face |
| Otros derivados anime de Qwen-Image 2.1 | Qwen-Image 2.1 | no disponible | no aplica | variable | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de parametros de los modelos comparados en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Contenido NSFW explicito: el modelo esta disenado para generar desnudo y escenas sexuales con personajes adultos; no es apto para entornos sin control de edad ni para uso generalista.
- Licencia restrictiva: hereda la Qwen Research License Agreement y se declara "free for non-commercial use only". Cualquier uso comercial requiere revisar y negociar la licencia con el titular de la licencia base.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, manos deformes, texto ilegible o incoherencias en escenas con varios personajes; no hay datos publicados sobre su tasa de fallo.
- Dependencia de componentes externos: requiere el text encoder Qwen3-VL 8B int8 y el VAE de Qwen-Image 2.1 alojados en el repositorio de Comfy-Org; sin ellos el archivo no es funcional.
- Convencion de prompt fragil: omitir "An anime illustration of…" desplaza el resultado hacia fotografia, lo que puede romper flujos automatizados que no controlen el prefijo.
- Sin datos de sesgo ni evaluaciones de seguridad publicadas: no se documentan sesgos demograficos, de representacion corporal ni evaluaciones de alineacion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin revisiones independientes en Hugging Face (las resenas se remiten a Civitai).
- Idiomas: no se documenta el alcance multilingue de los prompts; los ejemplos estan en ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Duck63677/Noct-Q-Anime-Uncensored-Qwen-Image-2.1
- Galeria, prompts y variantes int4/fp8/bf16/fp16 en Civitai: https://civitai.com/models/2967534
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Text encoder Qwen3-VL 8B int8 (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/text_encoders/qwen3vl_8b_int8_convrot.safetensors
- VAE Qwen-Image 2.1 bf16 (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors
- Licencia del derivado (referenciada en la model card): https://huggingface.co/Noctaluna/Noct-Q-Anime-Uncensored-Qwen-Image-2.1/blob/main/LICENSE
