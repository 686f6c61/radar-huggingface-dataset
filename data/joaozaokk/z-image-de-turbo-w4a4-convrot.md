# JoaoZaokk/Z-Image-De-Turbo-W4A4-ConvRot

## Resumen

Z-Image-De-Turbo-W4A4-ConvRot es una cuantizacion en 4 bits del modelo de difusion texto-a-imagen ostris/Z-Image-De-Turbo, publicada por el usuario JoaoZaokk. Se distribuye en el formato propio de cuantizacion de ComfyUI (`diffusion-single-file`, tipo `convrot_w4a4`) y se carga con el nodo estandar `UNETLoader`, sin necesidad de nodos personalizados. Incluye dos variantes: una nativa de 4 bits (pesos y activaciones) y una mixta que promueve 54 capas a 8 bits.

El problema que resuelve es el coste de VRAM y de tiempo por paso del checkpoint original: parte de 11,46 GiB en BF16 con 6,15 mil millones de parametros y lo reduce a 3,06 GiB, con una mejora medida de 0,911 a 0,348 segundos por paso en una RTX 3090 a 1024x1024. El autor documenta las mediciones en un repositorio propio de benchmarking de cuantizacion para ComfyUI.

Es relevante porque el modelo base (De-Turbo) es un fine-tune "de-destilado" de Z-Image Turbo pensado para que el entrenamiento de LoRAs se comporte de forma estable, y esta version permite trabajar con el en hardware consumer. El autor advierte que las mediciones se hicieron en regimen Turbo (8 pasos, cfg 1.0) solo por comparabilidad, y que para generacion real el modelo requiere mas pasos y cfg real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion texto-a-imagen en un unico fichero (`diffusion-single-file`); derivado de ostris/Z-Image-De-Turbo, que a su vez parte de Z-Image Turbo |
| Parametros totales | 6,15 mil millones (checkpoint BF16 de origen) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica; el prompt lo procesa un text encoder externo (Qwen3-4B) |
| Tipos de cuantizacion | int4 nativo (`convrot_w4a4`) y mixto 4/8 bits (116 capas a 4 bits + 54 capas a 8 bits) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero unico, formato de cuantizacion `convrot_w4a4` de ComfyUI) |

Detalle de los dos ficheros publicados:

| Fichero | Formato | GiB | Error mediano por capa | Divergencia latente | s/paso |
|---|---|---|---|---|---|
| `zimage_deturbo_w4a4.safetensors` | 170 x `convrot_w4a4` | 3,06 | 0,1211 | 0,4126 | 0,348 |
| `zimage_deturbo_mixed.safetensors` | 116 x 4 bits + 54 x 8 bits | 3,17 | no disponible | 0,4325 | 0,398 |

## Arquitectura y entrenamiento

La ficha no describe la arquitectura interna del transformer de difusion; la informacion disponible se limita al proceso de cuantizacion y a las mediciones asociadas. El checkpoint de origen es `ostris/Z-Image-De-Turbo`, un fine-tune de-destilado de `Tongyi-MAI/Z-Image-Turbo`: la destilacion Turbo original acelera la inferencia, y De-Turbo existe precisamente para revertirla y que el entrenamiento de LoRAs se comporte de forma predecible. Este repositorio no es un reentrenamiento, sino una conversion de pesos.

La innovacion tecnica es el esquema `convrot_w4a4`, el formato nativo de cuantizacion de ComfyUI, que cuantiza tanto pesos (W4) como activaciones (A4). El autor verifico el despacho con los pesos cargados en la GPU: 170 modulos cuantizados, 8 de 8 forwards cuantizados, 0 operaciones `dequantize`, con `convrot_linear_dtype=int4` sobre `comfy_kitchen.backends.cuda`. Las mediciones de error mediano por capa son 0,0019 en BF16 (suelo de referencia), 0,0384 en W4A8 y 0,1211 en W4A4.

Un resultado destacable del analisis: la receta mixta que promueve 54 capas a 8 bits si aporta mejora en el modelo padre (`Tongyi-MAI/Z-Image-Turbo`, gana 11 de 12 ejecuciones pareadas), pero no la aporta en este fine-tune de-destilado (gana 7 de 12, indistinguible de una moneda al aire). El error por capa de ambos checkpoints es casi identico (0,1228 frente a 0,1211, diferencia del 1,4%), por lo que el autor concluye que la diferencia no es predecible a partir de esa metrica.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) a 1024x1024 y otras resoluciones soportadas por el flujo de ComfyUI.
- Carga directa en ComfyUI mediante `UNETLoader` estandar, sin nodos personalizados.
- Cuantizacion nativa en el backend CUDA de ComfyUI (`convrot_linear_dtype=int4`) sin dequantization intermedia.
- Compatible con el ecosistema de LoRAs y de entrenamiento de LoRAs sobre Z-Image De-Turbo (sin verificar en el propio autor).
- Funciona con los componentes estandar del pipeline: text encoder `qwen_3_4b.safetensors`, VAE `ae.safetensors`, sampler `euler/simple` con cfg 1.0.
- Soporte de tool calling, agentes, razonamiento multi-paso, vision o audio: no disponible (es un modelo de difusion texto-a-imagen).
- Capacidades multilingues: no; la etiqueta de idioma del repositorio es unicamente ingles (en).

## Casos de uso

- Generacion de imagenes en GPU consumer: al ocupar 3,06 GiB de pesos, permite ejecutar el modelo en tarjetas con 8-12 GB de VRAM donde el BF16 original de 11,46 GiB no cabria junto al text encoder y el VAE.
- Iteracion rapida en prototipado visual: con 0,348 s/paso en una RTX 3090, un barrido de prompts y semillas completos es viable en minutos, util para explorar direcciones de arte antes de fijar una produccion.
- Base para entrenamiento de LoRAs: el modelo base de-destilado existe para que el entrenamiento de adaptadores de bajo rango se comporte de forma estable; esta version reduce el coste de memoria del bucle de entrenamiento con pesos de 4 bits (el autor no lo ha verificado).
- Pipelines automatizados de generacion de imagenes en ComfyUI: al usar el formato nativo y `UNETLoader`, se integra en grafos existentes sin reescribir nodos ni cambiar el flujo de trabajo.
- Despliegue en entornos con VRAM limitada o multi-tenant: el menor consumo permite mantener varias instancias o varios modelos cargados en una misma GPU, aunque la VRAM total necesaria no esta documentada.
- Evaluacion y benchmarking de cuantizacion: el repositorio `comfy-quant-bench` del autor y los datos de divergencia latente sirven como referencia para comparar recetas de cuantizacion sobre modelos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no aplica MMLU, HumanEval, GSM8K ni similares, al tratarse de un modelo de difusion texto-a-imagen). Los unicos datos cuantitativos son de eficiencia y de error de cuantizacion:

| Metrica | BF16 (referencia) | W4A4 | Mixto 4/8 bit |
|---|---|---|---|
| Tamano | 11,46 GiB | 3,06 GiB | 3,17 GiB |
| Error mediano por capa | 0,0019 | 0,1211 | no disponible |
| Error mediano W4A8 (referencia) | — | 0,0384 | — |
| Divergencia latente | — | 0,4126 | 0,4325 |
| Segundos por paso (RTX 3090, 1024x1024) | 0,911 | 0,348 | 0,398 |

Comparacion pareada W4A4 frente a mixto: delta medio de +0,0199, con 7 victorias de 12 ejecuciones, lo que el propio autor califica como empate estadistico (la dispersion entre ejecuciones dentro de un mismo brazo, 0,37-0,42, es mayor que la diferencia entre medias). El aviso metodologico del autor es explicito: seis prompts, dos semillas, una tarjeta, una resolucion y ninguna metrica perceptual; "36 de 36 usables" es un juicio humano sobre hojas de contacto y no una medida objetiva.

## Requisitos de hardware

- Peso de los ficheros: 3,06 GiB (W4A4) y 3,17 GiB (mixto); el repositorio ocupa 6,7 GB en total.
- VRAM estimada para inferencia: no disponible de forma oficial; a los pesos hay que sumar el text encoder (`qwen_3_4b.safetensors`, tambien publicado en version cuantizada) y el VAE (`ae.safetensors`).
- GPU medidas: RTX 3090, a 1024x1024, con 0,348 s/paso (W4A4) y 0,398 s/paso (mixto) en regimen de 8 pasos y cfg 1.0.
- Cabe en GPU consumer: si, es el objetivo declarado del proyecto (reduccion de 11,46 GiB a 3,06 GiB); el requisito adicional del text encoder y el VAE no esta cuantificado en la informacion disponible.
- GPU recomendadas por el autor: no se especifican mas alla de la RTX 3090 empleada en las mediciones. No hay datos para A100, H100 o RTX 4090.
- Opciones de despliegue: ComfyUI con `UNETLoader` (formato nativo, sin nodos personalizados). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion en este formato.
- Latencia y throughput: 0,348 s/paso y 0,398 s/paso en RTX 3090. La mejora declarada es de 3,75x en tamano y 2,62x en velocidad por paso frente al BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Z-Image-De-Turbo-W4A4-ConvRot (este) | 6,15 B | 3,06 GiB (W4A4) | no aplica | 0,348 s/paso en RTX 3090 | Apache 2.0 | HuggingFace, ComfyUI |
| Z-Image-De-Turbo-W4A4-ConvRot mixto | 6,15 B | 3,17 GiB | no aplica | 0,398 s/paso; sin ganancia medible en este checkpoint | Apache 2.0 | HuggingFace, ComfyUI |
| ostris/Z-Image-De-Turbo (BF16) | 6,15 B | 11,46 GiB | no aplica | 0,911 s/paso en RTX 3090 | no disponible | HuggingFace, ComfyUI |
| Tongyi-MAI/Z-Image-Turbo | no disponible | no disponible | no aplica | no disponible | no disponible | HuggingFace |

No se dispone de datos de otros modelos de difusion comparables dentro de la informacion proporcionada.

## Limitaciones y advertencias

- La validacion se limita a seis prompts, dos semillas, una tarjeta (RTX 3090), una resolucion y ninguna metrica perceptual; el juicio "36 de 36 usables" es humano.
- El entrenamiento de LoRAs, que es la razon de existir del modelo base De-Turbo, no se ha probado con estos pesos de 4 bits; no hay evidencia de que un LoRA entrene igual sobre ellos.
- Las mediciones se tomaron a 8 pasos y cfg 1.0, que es el regimen de Turbo y no el propio del modelo; para generacion real el autor indica que se necesitan mas pasos y cfg real.
- No existe metrica en espacio de imagen: la divergencia latente mide trayectoria, no fidelidad.
- La calibracion uso un unico bloque de prompt concatenado en lugar de seis separados, por un defecto de la herramienta de captura de activaciones detectado y corregido el mismo dia; una recalibracion moveria las medianas unos pocos puntos porcentuales.
- La comparacion entre las variantes W4A4 y mixta es un empate estadistico, y la dispersion entre ejecuciones supera la diferencia entre medias; no debe leerse la media como una victoria.
- Sesgos conocidos, riesgo de alucinacion visual y limitaciones de idioma: no documentados en la informacion disponible; el modelo solo esta etiquetado para ingles.
- Licencia Apache 2.0 en este repositorio; conviene verificar la licencia del checkpoint base y de los componentes (text encoder, VAE) antes de un uso comercial.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/JoaoZaokk/Z-Image-De-Turbo-W4A4-ConvRot
- Modelo base: https://huggingface.co/ostris/Z-Image-De-Turbo
- Modelo padre de la destilacion: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Repositorio de benchmarking y metodologia: https://github.com/JoaoZaokk/comfy-quant-bench
- Text encoder cuantizado Qwen3-4B W4A4: https://huggingface.co/JoaoZaokk/Qwen3-4B-W4A4-ConvRot
