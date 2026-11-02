# AI-KSK/moss-image-community-workflows-326

## Resumen

`AI-KSK/moss-image-community-workflows-326` no es un modelo de IA, sino una coleccion de seis grafos ComfyUI exportados en formato JSON acompanados de seis posters promocionales en proporcion 3:4. El repositorio acompana a un video de actualizaciones comunitarias de MOSS-Image publicado por AI-KSK y esta pensado como material tutorial para usuarios que ya trabajan con el modelo de difusion MOSS-Image en ComfyUI. El tamano del repositorio es de 0,0 GB y no contiene pesos de modelo, scripts de entrenamiento ni fotografias de referencia.

Cada grafo JSON es autocontenido en cuanto a estructura de nodos, pero requiere descargar por separado los checkpoints y adaptadores upstream correspondientes. Los flujos cubren tareas como generacion texto-a-imagen en QHD, referencia de personaje, experimentos de estilo con LoRA SFT, retratos de belleza, generacion en ocho pasos con un modelo afinado y una comparativa de recetas de 50, 8 y 4 pasos. No se trata, por tanto, de una release de modelo ni de un espejo de pesos.

La relevancia de este repositorio es practica: ofrece recetas de configuracion concretas (dimensiones, pasos, CFG, adaptadores) que un desarrollador puede importar directamente en ComfyUI para reproducir o adaptar pipelines de generacion de imagen con MOSS-Image. La ausencia de pesos y de informes de rendimiento verificados limita su uso como referencia de benchmarks, pero lo convierte en un recurso util de configuracion y aprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (coleccion de grafos ComfyUI para el modelo de difusion MOSS-Image) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (checkpoints `*_int8_convrot.safetensors`), BF16 (text encoder Qwen3.5 9B) |
| Idiomas soportados | no disponible (la model card declara `en` a nivel de metadatos) |
| Licencia | no disponible |
| Formato de pesos | JSON (grafos ComfyUI); los pesos referenciados son safetensors, no incluidos en el repo |

## Arquitectura y entrenamiento

El repositorio no define ni entrena ningun modelo. Su contenido son seis grafos ComfyUI que orquestan el modelo de difusion MOSS-Image junto con componentes auxiliares: un text encoder Qwen3.5 de 9B en BF16, el VAE de FLUX.2 (`flux2-vae.safetensors`) y checkpoints base o SFT de MOSS-Image en INT8 (`moss_image_base_int8_convrot.safetensors` o `moss_image_sft_int8_convrot.safetensors`). Algunos grafos anaden LoRAs especificos: CharRef v2 1.0, hires LoRA v0.4 1.0, una LoRA de rango 256 con escala 1.49 para experimentos SFT, Beauty 1.0 y el par Kromoss + DMD2 1.0 para generacion en ocho pasos.

Las configuraciones exportadas varian por flujo: el grafo de referencia de personaje usa 832×1216, 50 pasos, CFG 3 y sampler Euler con `sgm_uniform`; el de QHD genera a 2560×1440 con 40 pasos y CFG 3; el de estilo SFT trabaja a 1024² con 25 pasos; el de retratos de belleza a 1024² con 30 pasos, CFG 3 y SLG 22; el de ocho pasos usa 1024², 8 pasos y CFG 1; y el laboratorio de pasos compara recetas de 50, 8 y 4 pasos con CFG 3/1/1 y adaptadores distintos. No se documenta en la informacion disponible ningun detalle sobre el dataset de entrenamiento de MOSS-Image, el numero de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generacion texto-a-imagen con MOSS-Image en resoluciones desde 1024² hasta 2560×1440 (QHD).
- Generacion condicionada por referencia de personaje mediante CharRef v2 y los nodos de edicion de Ostris para MOSS-Image.
- Experimentacion de estilo mediante LoRA SFT de rango 256, orientada a explorar diferencias de ajuste fino.
- Generacion de retratos de belleza con configuracion especifica (CFG 3, SLG 22, 30 pasos).
- Generacion de alta velocidad en ocho pasos combinando un backbone afinado (Kromoss) con DMD2.
- Comparativa controlada de recetas de muestreo (50, 8 y 4 pasos) en un mismo grafo.
- Integracion nativa en ComfyUI mediante nodos de MOSS-Image.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Prototipado rapido de pipelines de imagen: importar cualquiera de los seis JSON en ComfyUI para obtener una configuracion funcional de MOSS-Image sin partir de cero, ajustando despues los selectores de modelo a las rutas locales.
- Generacion de ilustraciones en QHD: el grafo `02_MOSS_MAX_ULTRA_QHD` produce imagenes a 2560×1440 con 40 pasos y CFG 3, adecuado para material grafico que requiere resolucion alta sin reescalado posterior.
- Creacion de personajes consistentes: el grafo `01_MOSS_CharRef` emplea CharRef v2 y los nodos de edicion de Ostris para condicionar la generacion por una referencia de personaje, util en narrativa visual o series de ilustraciones.
- Retratos para marketing o redes: el grafo `05_MOSS_Beauty` aplica una configuracion especifica de retrato (1024², 30 pasos, SLG 22) orientada a resultados de belleza facial.
- Iteracion rapida en produccion: el grafo `06_MOSS_Kromoss_8Step` reduce la generacion a 8 pasos con CFG 1, lo que disminuye el coste computacional por imagen en fases de exploracion o generacion masiva.
- Evaluacion de compromiso calidad/velocidad: el grafo `07_MOSS_StepLab` compara en un mismo entorno recetas de 50, 8 y 4 pasos con adaptadores distintos, permitiendo decidir que configuracion usar segun latencia y calidad aceptable.
- Material docente y tutoriales: los seis grafos y sus posters sirven como base para explicar en talleres o videos como se estructura un pipeline de difusion en ComfyUI con text encoder, VAE y LoRAs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el repositorio no contiene un informe de rendimiento completamente evaluado, y los posters incluidos son material tutorial, no ejemplos verificados de salida del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Depende del checkpoint MOSS-Image seleccionado (INT8), del text encoder Qwen3.5 9B en BF16 y del VAE de FLUX.2, cuyos requisitos no se detallan en la informacion proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; la generacion a 2560×1440 con 40 pasos y el text encoder de 9B en BF16 sugieren requisitos elevados, pero no se aportan cifras.
- Opciones de despliegue: ComfyUI con soporte nativo de MOSS-Image (build actualizado), mas la extension de nodos personalizados de Ostris para el grafo CharRef. No se mencionan vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables, y este repositorio es una coleccion de grafos, no un modelo con el que establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- El repositorio no contiene ningun peso de modelo ni LoRA, ni scripts de entrenamiento, ni fotografia de referencia para CharRef; el usuario debe descargar los componentes upstream por su cuenta.
- Los posters incluidos son material tutorial y no ejemplos verificados de inferencia; no deben usarse como prueba de calidad del modelo.
- Los enlaces a RunningHub incluyen un codigo de referido del autor, y las versiones alojadas pueden cambiar de forma independiente a los JSON exportados.
- La numeracion de directorios omite el modulo 03; no existe en esta release de seis flujos.
- Los grafos requieren una build de ComfyUI con soporte nativo de MOSS-Image; versiones antiguas pueden no incluir los nodos necesarios.
- La licencia no esta declarada en la informacion disponible, por lo que no puede confirmarse el uso comercial ni las condiciones de redistribucion.
- No se documentan sesgos, tasas de alucinacion visual ni limitaciones de idioma del modelo subyacente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AI-KSK/moss-image-community-workflows-326
- Componentes ComfyUI de MOSS-Image: https://huggingface.co/Comfy-Org/MOSS-Image
- Instrucciones nativas de ComfyUI para MOSS-Image: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- Adaptador CharRef v2: https://huggingface.co/7err4/MOSS-Image-CharRef
- Nodos de edicion de Ostris para MOSS-Image: https://github.com/ostri (enlace truncado en la model card)
- Video tutorial en YouTube: https://youtu.be/bvntROsEru0
- Video tutorial en Bilibili: https://www.bilibili.com/video/BV1UYnU6qEGK/
- Workflow 01 en Civitai: https://civitai.com/models/3020391/moss-image-charref-v2-character-reference
- Workflow 02 en Civitai: https://civitai.com/models/3020393/moss-max-ultra-qhd-text-to-image
- Workflow 04 en Civitai: https://civitai.com/models/3020394/moss-image-sft-style-lab
- Workflow 05 en Civitai: https://civitai.com/models/3020395/moss-image-beauty-portrait-workflow
- Workflow 06 en Civitai: https://civitai.com/models/3020396/kromoss-8-step-text-to-image
- Workflow 07 en Civitai: https://civitai.com/models/3020397/moss-image-50-8-4-step-comparison-lab
