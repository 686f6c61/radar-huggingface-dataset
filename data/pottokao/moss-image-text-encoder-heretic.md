# pottokao/MOSS-Image-Text-Encoder-Heretic

## Resumen

MOSS-Image-Text-Encoder-Heretic es un ajuste fino del modelo Qwen3.5-9B de Alibaba, publicado por el usuario pottokao en Hugging Face. Su proposito es servir como codificador de texto y, a la vez, como expansor de prompts (prompt enhancer) dentro del pipeline de generacion de imagenes MOSS-Image de OpenMOSS. El modelo original Qwen3.5-9B rechaza o suaviza muchas peticiones de contenido adulto; cuando ese texto de rechazo se codifica y se pasa al generador de imagenes, el resultado se contamina con contenido no deseado. Este ajuste elimina esas negativas mediante la tecnica de abliteration implementada por la herramienta Heretic, manteniendo intacto el resto del modelo.

Tecnicamente se trata de un transformer denso de 9.653.104.368 parametros (unos 9,65 mil millones), con torre de vision, cabeza MTP para decodificacion especulativa y una arquitectura hibrida que combina atencion lineal (`linear_attn`) con atencion clasica (`self_attn`). Solo 32 tensores difieren del modelo base: las proyecciones `mlp.down_proj`, `linear_attn.out_proj` y `self_attn.o_proj` de las capas 15 a 31, con un cambio relativo mediano del 11%. El resto de pesos, incluidos `lm_head`, la cabeza MTP y la torre de vision, son identicos bit a bit al original.

La relevancia actual radica en que demuestra un caso de uso muy concreto de la abliteration aplicada a un componente de un pipeline multimodal: no se trata de un modelo de chat general, sino de una pieza de infraestructura para generacion de imagenes. El autor publica ademas versiones INT8 en formato nativo de ComfyUI y una variante GGUF cuantizada (DHQ-GGUF) que reduce el tamano hasta aproximadamente 3 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido con atencion lineal y atencion clasica, torre de vision y cabeza MTP (Qwen3.5) |
| Parametros totales | 9.653.104.368 (9,65 mil millones) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos originales), INT8 tensorwise con ConvRot (ComfyUI), GGUF (variante DHQ-GGUF, hasta ~3 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (BF16 e INT8), GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso que combina capas con atencion lineal y capas con atencion clasica, e incorpora una torre de vision (lo que justifica el pipeline `image-text-to-text`) y una cabeza MTP (multi-token prediction) utilizable para decodificacion especulativa. El autor verifico que los pesos del codificador de texto de MOSS-Image son identicos byte a byte a los de la release oficial de Qwen3.5-9B, a excepcion de `lm_head` y la cabeza MTP, que se omiten en el codificador.

El ajuste no es un entrenamiento supervisado ni un RLHF: es una modificacion de pesos por abliteration con la herramienta Heretic, que aplica un modificador ARA (abliteration with refusal-aware adjustment) y fusiona el resultado en los pesos. La busqueda distribuida se ejecuto en 3 maquinas durante unas 4,5 horas, con 3 ajustes automaticos del espacio de busqueda y 413 ensayos. Los hiperparametros del ensayo seleccionado fueron: capa inicial 15, capa final 31, `preserve weight` 0,392, `steer weight` 4,1e-4, `overcorrect` 0,988, `neighbors` 10 y rango LoRA 50 (fusionado a escala 1,0). Se eligio el ensayo con 1/100 rechazos y KL 0,048 frente a otro con 0/100 rechazos cuyo recuento bajo provenia en gran medida de respuestas fuera de tema.

## Capacidades

- Generacion de texto conversacional como modelo de chat completo (hereda las capacidades de Qwen3.5-9B).
- Codificacion de texto para el pipeline MOSS-Image (entrada al DiT).
- Expansion de prompts: reescribe una idea corta en un caption completo que despues se codifica para el generador de imagenes.
- Procesamiento de imagen y texto (`image-text-to-text`) gracias a la torre de vision intacta.
- Decodificacion especulativa mediante la cabeza MTP, que se conserva sin modificar.
- Modo thinking opcional (prefijo `<think></think>`); el autor recomienda usarlo desactivado para la funcion de prompt enhancer.
- Reduccion drastica de negativas: 2/100 rechazos frente a 100/100 del modelo original en la prueba con 100 prompts.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de imagenes con MOSS-Image en ComfyUI: se carga el fichero INT8 completo con el nodo Load CLIP (tipo `moss_image`) y se usa tanto para el TextGenerate (expansion del prompt) como para el codificador de texto, evitando que los rechazos del modelo base se rendericen en la imagen.
- Expansion de prompts para pipelines de difusion: dado un prompt corto, el modelo lo reescribe en un caption detallado que mejora la fidelidad del DiT; en las pruebas con 10 peticiones explicitas de contenido adulto, el modelo original rechazo 6/10 y este rechazo 0/10.
- Codificacion de texto en produccion con requisitos de memoria ajustados: el fichero `moss_te_heretic_te_int8_convrot.safetensors` (7,95 GB) contiene solo el modelo de lenguaje y sirve exclusivamente como codificador, con un error relativo medio del 2,75% (maximo 5,6%) y coseno >= 0,9988 frente al BF16 en 36 captions de validacion.
- Despliegue en hardware de consumo: la variante DHQ-GGUF (hasta ~3 GB) permite ejecutar el codificador en GPUs con poca VRAM mediante llama.cpp u Ollama, a costa de menor fidelidad de codificacion.
- Investigacion sobre abliteration: el repositorio incluye `heretic_merge_info.json` con cada tensor modificado y su cambio relativo, lo que permite estudiar el efecto de la tecnica sobre un modelo concreto y reproducir el analisis.
- Evaluacion de sesgos y seguridad en pipelines multimodales: sirve como caso de estudio de como el comportamiento de rechazo de un LLM se propaga a la salida de un generador de imagenes y de como mitigarlo sin reentrenar.
- Prototipado de asistentes creativos sin filtros para adultos: con la salvedad de que 19/60 respuestas juzgadas aun desvian el tema y los prompts pueden suavizarse ocasionalmente.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (thinking desactivado, prefijo `<think></think>`):

| Metrica | Qwen3.5-9B | Este modelo |
|---|---|---|
| Rechazos (100 prompts) | 100/100 | 2/100 |
| KL vs original (primer token) | 0 | 0,050 |
| Juicio gemma-4-12b sobre 60 respuestas de `mlabonne/harmful_behaviors`: full | 0 | 37 |
| Juicio gemma-4-12b: partial | 0 | 1 |
| Juicio gemma-4-12b: deflect | 8 | 19 |
| Juicio gemma-4-12b: refuse | 52 | 3 |
| Prompt enhancer MOSS-Image (10 peticiones adultas): rechazos | 6/10 | 0/10 |

En la busqueda de Heretic, el ensayo seleccionado registro 1/100 rechazos con KL 0,048; se descarto un ensayo con 0/100 rechazos porque el juicio mostro 18 full y 39 deflect, es decir, respuestas fuera de tema que inflaban artificialmente el resultado.

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 19-20 GB solo para pesos (9,65 mil millones de parametros a 2 bytes), mas overhead de activaciones y de la torre de vision.
- VRAM estimada en INT8: aproximadamente 9,75 GB para el fichero completo y 7,95 GB para el fichero solo de codificador.
- VRAM estimada en GGUF: desde unos 3 GB en la variante mas agresiva del repo DHQ-GGUF.
- GPUs recomendadas: A100 o H100 para BF16 sin cuantizar; RTX 4090 (24 GB) para BF16 justo o INT8 con holgura; RTX 3090/4080 para INT8.
- Cabe en GPU de consumo: si, en INT8 en GPUs de 12-16 GB o mas, y en GGUF en GPUs de 6-8 GB segun la cuantizacion.
- Opciones de despliegue: transformers (libreria declarada), ComfyUI con el nodo Load CLIP nativo (tipo `moss_image`) para los ficheros INT8, llama.cpp u Ollama para los GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos (100 prompts) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-Text-Encoder-Heretic | 9,65 mil millones | no disponible | 2/100 | Apache-2.0 | Hugging Face, INT8 y GGUF |
| Qwen/Qwen3.5-9B (base) | 9,65 mil millones | no disponible | 100/100 | Apache-2.0 | Hugging Face |
| MOSS-Image-SFT (OpenMOSS) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparacion con modelos de la misma categoria (codificadores de texto para difusion) no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia medible es la tasa de rechazos y un KL de 0,050 en el primer token, con identidad bit a bit en `lm_head`, cabeza MTP y torre de vision.

## Limitaciones y advertencias

- El modo thinking activado no fue evaluado; el autor recomienda usarlo desactivado, como hace un prompt enhancer.
- La fusion de pesos desplaza ligeramente el codificador: si solo se necesita codificacion, el codificador original es la referencia, y el autor indica que sigue comparando imagenes generadas con ambos.
- 19 de 60 respuestas juzgadas aun desvian el tema y los prompts pueden suavizarse ocasionalmente.
- Riesgo de alucinacion y sesgos: no documentados especificamente en la informacion proporcionada; hereda los del modelo base Qwen3.5-9B.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de uso: el autor exige uso exclusivo por adultos y prohibe expresamente generar contenido con menores o personas de edad ambigua, actos no consentidos o personas reales sin su consentimiento.
- La licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal por el contenido generado recae en el usuario.
- El fichero INT8 solo de codificador no puede generar texto; para la funcion de prompt enhancer hay que usar el fichero completo.
- Las imagenes no se compararon A/B en INT8; la validacion se hizo sobre la codificacion de texto (error relativo medio 2,75%).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pottokao/MOSS-Image-Text-Encoder-Heretic
- Variante GGUF: https://huggingface.co/pottokao/MOSS-Image-Text-Encoder-Heretic-DHQ-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- MOSS-Image SFT (OpenMOSS): https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
