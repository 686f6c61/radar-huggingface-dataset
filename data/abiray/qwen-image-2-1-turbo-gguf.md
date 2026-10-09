# Abiray/Qwen-Image-2.1-Turbo-GGUF

# Qwen-Image-2.1-Turbo GGUF (Abiray)

## Resumen

Qwen-Image-2.1-Turbo GGUF es una recopilacion de pesos cuantizados en formato GGUF del modelo de difusion destilado Qwen-Image-2.1-Turbo, desarrollado por el equipo Qwen de Alibaba y redistribuido por el usuario Abiray. El modelo original es un transformer de difusion de aproximadamente 7.115 millones de parametros (7,12B) dedicado a generacion de imagenes a partir de texto (text-to-image) y a edicion de imagenes (image-to-image), con una variante Turbo destilada que permite muestreo en solo 4-8 pasos.

La relevancia de esta publicacion es practica: reduce el requisito de VRAM del modelo nativo hasta niveles asequibles para GPU de consumo. Las seis cuantizaciones disponibles (de Q8_0 a Q3_K_M) ocupan entre 7,59 GB y 3,19 GB, de modo que la variante Q4_K_M cabe en GPUs de 6-8 GB y la Q3_K_M esta pensada para portatiles. Todo el flujo esta orientado a ComfyUI mediante el nodo ComfyUI-GGUF.

Se trata de una conversion, no de un reentrenamiento: el autor no aporta datos nuevos de entrenamiento, sino checkpoint cuantizados de la arquitectura `qwen_image` (297 tensores) generados con `llama-quantize` parcheado. La licencia declarada es `qwen-research`, por lo que el uso comercial queda sujeto a los terminos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (arquitectura `qwen_image`, 297 tensores); variante Turbo destilada |
| Parametros totales | 7.115.124.736 (~7,12B) en el transformer de difusion; el codificador de texto Qwen3-VL-8B es un componente externo |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de difusion; no se documenta ventana de contexto en tokens) |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (`license: other`, `license_name: qwen-research`) |
| Formato de pesos | GGUF (ficheros `.gguf`), generados con las herramientas de ComfyUI-GGUF |
| Modelo base | Qwen/Qwen-Image-2.1-Turbo |
| Pipeline | text-to-image (y image-to-image / edicion) |
| Tamano del repositorio | 29,9 GB |
| Fecha de creacion / actualizacion | 2026-10-09 / 2026-10-09 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 descargas, 9 likes |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusion de tipo DiT con arquitectura denominada `qwen_image`, compuesta por 297 tensores. La variante Turbo ha sido destilada para colapsar la necesidad de guiado (classifier-free guidance): segun la model card, la escala CFG debe fijarse en 1.0 y no superarse, porque valores superiores provocan recorte de contraste y artefactos visuales. El muestreo recomendado es el sampler `euler` con scheduler `simple` o `normal` y entre 4 y 8 pasos, siendo 6 el valor ideal segun el autor.

La publicacion de Abiray no entrena ningun modelo: convierte y cuantiza los pesos oficiales con las herramientas de ComfyUI-GGUF y una compilacion parcheada y multihilo de `llama-quantize` que soporta de forma nativa la arquitectura `qwen_image` de 297 tensores. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre el uso de RLHF, DPO u otras fases de alineamiento en el modelo original, ya que la model card de esta conversion no los detalla. El sistema completo requiere tres componentes separados: el transformer de difusion (estos GGUF), un codificador de texto Qwen3-VL-8B y el VAE `qwen_image_2.1_vae_bf16`, ambos distribuidos por Comfy-Org.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) en 4-8 pasos de muestreo.
- Edicion de imagenes y flujos image-to-image, con un workflow JSON especifico publicado por el autor.
- Fidelidad de tipografia y matices de prompt en cuantizaciones altas (Q6_K y Q5_K_M segun la model card).
- Detalle de textura y microcontraste en Q5_K_M, segun las notas del autor.
- Inferencia de baja latencia gracias a la destilacion Turbo (esquema de 4-8 pasos) y a la menor huella de memoria de los GGUF.
- Integracion directa en ComfyUI a traves del nodo ComfyUI-GGUF.
- Compatibilidad con CFG = 1.0 y prompt negativo vacio (el prompt negativo se ignora con esa escala).
- No soporta tool calling ni function calling: es un modelo de difusion de imagenes, no un modelo de lenguaje.
- No tiene modo de razonamiento, agentes ni capacidades de audio o vision de entrada mas alla del flujo image-to-image.
- Idiomas concretos soportados: no disponible.

## Casos de uso

- Generacion de ilustraciones en produccion con GPU de gama media: la cuantizacion Q4_K_M ocupa 4,19 GB y esta recomendada para 6-8 GB de VRAM, el punto de equilibrio calidad-velocidad segun el autor, lo que permite desplegar text-to-image en tarjetas de consumo.
- Edicion y retoque fotografico por lotes: el workflow image-to-image permite aplicar transformaciones guiadas por prompt sobre imagenes existentes dentro de un pipeline de ComfyUI.
- Creacion de carteles y material con texto integrado: las cuantizaciones Q6_K (5,88 GB) y Q5_K_M (5,01 GB) preservan tipografia compleja y matices de prompt, adecuadas para piezas graficas con rotulacion.
- Prototipado rapido de conceptos en estudio de diseno: con 4-8 pasos de muestreo y CFG 1.0, el coste por iteracion es bajo, lo que favorece la exploracion de variaciones visuales.
- Despliegue en portatiles y equipos de baja VRAM: la variante Q3_K_M (3,19 GB) esta recomendada para 6 GB de VRAM o entornos portatiles.
- Generacion masiva de assets para videojuegos o marketing: la combinacion de GGUF ligero y ComfyUI permite ejecutar lotes largos en una sola GPU sin agotar memoria.
- Investigacion en difusion destilada y en el impacto de la cuantizacion sobre la calidad de imagen, aprovechando la disponibilidad de multiples niveles de bit en un mismo repositorio.
- Integracion en herramientas creativas de escritorio: el formato GGUF y el footprint reducido facilitan empaquetar el modelo en aplicaciones locales con dependencias minimas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, GenEval, etc.) ni comparaciones numericas con otros modelos; unicamente ofrece recomendaciones cualitativas sobre la calidad relativa de cada cuantizacion. Los resultados de busqueda web consultados no contienen informacion relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia del transformer de difusion, segun el autor (hay que anadir la memoria del codificador de texto y del VAE, no incluidos en estos ficheros GGUF):
  - Q8_0 (7,59 GB): 12-16 GB o mas. Calidad de referencia, indistinguible de BF16 nativo.
  - Q6_K (5,88 GB): 10-12 GB. Alta fidelidad, conserva tipografia compleja.
  - Q5_K_M (5,01 GB): 8-12 GB. Buen detalle de textura y microcontraste.
  - Q4_K_M (4,19 GB): 6-8 GB. Punto de equilibrio recomendado por el autor.
  - Q4_K_S (4,06 GB): 6-8 GB. Alternativa compacta de 4 bits.
  - Q3_K_M (3,19 GB): 6 GB de VRAM o portatiles. Huella ultrarreducida.
- Componentes adicionales obligatorios: codificador de texto Qwen3-VL-8B (`qwen3vl_8b_int8_convrot.safetensors` o `qwen3vl_8b_w4a8.safetensors`) y VAE `qwen_image_2.1_vae_bf16.safetensors`.
- GPU recomendadas: no se especifican modelos concretos (A100, H100, RTX 4090, etc.) en la informacion disponible; el autor unicamente indica rangos de VRAM.
- Cabe en GPU de consumo: si, desde la cuantizacion Q4_K_M hacia abajo (6-8 GB), y la Q3_K_M en equipos de 6 GB.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (flujo documentado y recomendado por el autor). La cuantizacion se realizo con `llama-quantize` de llama.cpp. No se documentan otros backends en la informacion disponible.
- Latencia y throughput: no disponibles. El autor solo indica el esquema de muestreo (4-8 pasos, 6 ideal) con sampler `euler` y scheduler `simple` o `normal`.

## Comparativa con modelos similares

La informacion proporcionada solo permite comparar la conversion GGUF con su propio modelo base; no se aportan datos de otros modelos de difusion de la competencia, por lo que los campos correspondientes se marcan como no disponibles.

| Modelo | Parametros | Formato | VRAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Abiray/Qwen-Image-2.1-Turbo-GGUF | 7,12B (transformer de difusion) | GGUF (Q3_K_M a Q8_0) | 6-16 GB segun cuantizacion | qwen-research | Repositorio HuggingFace con 0 descargas, 9 likes |
| Qwen/Qwen-Image-2.1-Turbo (base) | 7,12B (transformer de difusion) | No disponible en la informacion | No disponible | qwen-research | Repositorio oficial de Qwen |
| Otros modelos de difusion de la misma categoria (FLUX, SDXL, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la informacion disponible. Al ser un modelo de difusion entrenado sobre datos a gran escala, hereda los sesgos de representacion del dataset original, cuyo contenido no se detalla.
- Riesgo de alucinacion visual: no se cuantifica. El autor advierte de que CFG > 1.0 provoca recorte de contraste y artefactos visuales marcados.
- Configuracion sensible: la escala CFG debe mantenerse en 1.0 y el prompt negativo se ignora; usar valores distintos degrada el resultado de forma visible.
- Cuantizaciones bajas: la degradacion de calidad respecto a BF16 se describe de forma cualitativa, sin metricas que la respalden.
- Limitaciones de idioma y contexto: no disponibles; no se especifica que idiomas soporta el codificador de texto ni ninguna restriccion de longitud de prompt.
- Licencia: identificada como `qwen-research` (`license: other`). Es imprescindible consultar los terminos exactos en el repositorio del modelo base antes de cualquier uso comercial, ya que no se detallan en esta ficha.
- Componentes externos: los ficheros de este repositorio no incluyen el codificador de texto ni el VAE; sin ellos el modelo no es funcional.
- Repositorio con 0 descargas y creado en octubre de 2026, sin historial de uso ni validacion de la comunidad.
- Los enlaces a workflows del README apuntan al repositorio Abiray/Qwen-Image-2.1-GGUF (sin el sufijo Turbo), por lo que conviene verificar que el nodo cargador apunta al fichero correcto, tal como advierte el propio autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Abiray/Qwen-Image-2.1-Turbo-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Organizacion Qwen en HuggingFace: https://huggingface.co/Qwen
- Codificadores de texto y VAE (Comfy-Org/Qwen-Image-2.1): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/tree/main/text_encoders y https://huggingface.co/Comfy-Org/Qwen-Image-2.1/tree/main/vae
- Workflow text-to-image: https://huggingface.co/Abiray/Qwen-Image-2.1-GGUF/blob/main/Qwen_Image_2.1_GGUF_Text2Image.json
- Workflow image-to-image / edicion: https://huggingface.co/Abiray/Qwen-Image-2.1-GGUF/blob/main/Qwen_Image_2.1_GGUF_Image2Image_Edit.json
- ComfyUI-GGUF (city96): https://github.com/city96/ComfyUI-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en las busquedas realizadas.
