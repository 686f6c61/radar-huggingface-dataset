# Pedro21613/PS-IMAGE-1.5-LITE

## Resumen

PS-IMAGE-1.5-LITE es un adaptador LoRA para generacion de imagenes (text-to-image) derivado de [`Pedro21613/PS-IMAGE-1.5`](https://huggingface.co/Pedro21613/PS-IMAGE-1.5), a su vez basado en [`stabilityai/stable-diffusion-xl-base-1.0`](https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0). Lo desarrolla el usuario Pedro21613 y su proposito es ofrecer una variante compactada del LoRA original capaz de funcionar exclusivamente en CPU, sin GPU, reduciendo el consumo de RAM y el tiempo de inferencia a costa de cierta perdida de calidad de imagen.

El repositorio no contiene un modelo completo, sino un adaptador LoRA de rango 16 y alpha 32 convertido a fp16 (84 MB), que se fusiona sobre el UNet de SDXL en el momento de la carga. Ademas, sustituye el VAE completo de SDXL (~300 MB) por TAESDXL (~5 MB) y reduce la resolucion por defecto a 512 px con 6-10 pasos (por defecto 8) usando el scheduler DPM++ Karras, frente a los 768 px y 20 pasos de la version full.

Es relevante para quienes necesitan generar imagenes fotorrealistas en entornos sin GPU (servidores modestos, portatiles, contenedores con CPU limitada) o para prototipado rapido. La model card esta redactada en portugues y el autor indica que el modelo se entreno con captions multilingues, aunque recomienda promptear en ingles para obtener mejores resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r16/alpha32) sobre SDXL: UNet con cross-attention, doble text encoder CLIP y VAE (sustituido por TAESDXL) |
| Parametros totales | Adaptador LoRA: 84 MB en fp16; modelo base SDXL: no disponible en la informacion (aprox. 3.500 millones, segun la base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (limitado por el tokenizador de los text encoders de SDXL, 77 tokens por codificador) |
| Tipos de cuantizacion | Adaptador en fp16; inferencia en float32 sobre CPU; VAE TAESDXL (~5 MB) |
| Idiomas soportados | Multilingue segun los captions de entrenamiento de la version base; la model card esta en portugues y recomienda promptear en ingles para mayor fidelidad |
| Licencia | No disponible de forma explicita en la informacion; el autor indica que sigue la licencia de SDXL base mas los terminos de Hugging Face |
| Formato de pesos | safetensors, libreria diffusers |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre el UNet de Stable Diffusion XL 1.0. El repositorio distribuye el adaptador en fp16 (84 MB, con un error maximo declarado de aproximadamente 1,5e-05 respecto a la version fp32 de 168 MB), y la propia model card indica que se fusiona de forma permanente sobre el UNet en la carga (`merge_and_unload`), eliminando el overhead del adaptador durante la inferencia. La arquitectura subyacente es, por tanto, la de SDXL: un UNet con atencion cruzada, dos text encoders CLIP y un VAE; en esta variante LITE el VAE se reemplaza por TAESDXL (`madebyollin/taesdxl`).

Las optimizaciones concretas de la version LITE son: conversion del LoRA a fp16, sustitucion de VAE full por TAESDXL (decodificacion aproximadamente 10x mas rapida y unos 2 GB menos de RAM), cambio del scheduler a DPM++ Karras con 6-10 pasos (por defecto 8) a 512 px, y ejecucion en float32 con attention slicing, VAE slicing y VAE tiling para caber en 8-12 GB de RAM sin GPU. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF/DPO; solo se menciona que la version 1.5 base se entreno con captions multilingues.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de texto (text-to-image) mediante el pipeline `text-to-image` de diffusers.
- Renderizado de texto corto y legible en la imagen (1-3 palabras mas numeros entre comillas), con degradacion en textos largos.
- Inferencia exclusiva en CPU sin GPU, con soporte de attention slicing, VAE slicing y VAE tiling para reducir el pico de memoria.
- Prompting multilingue (portugues y castellano funcionan), aunque se recomienda traducir al ingles (por ejemplo con `Helsinki-NLP/opus-mt-mul-en`) para mayor fidelidad.
- Integracion con Gradio (`app_gradio.py`) y con script de linea de comandos (`usar_cpu.py`).
- No es un modelo de lenguaje: no soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No incluye capacidades de vision, audio ni thinking mode.

## Casos de uso

- Prototipado rapido en portatiles sin GPU: generar bocetos o variaciones de imagen a 512 px en 1-5 minutos para validar ideas de diseno antes de invertir en hardware con GPU.
- Generacion de imagenes en servidores o contenedores con CPU limitada: desplegable con 8-12 GB de RAM y entre 2 y 8 nucleos, util para entornos de desarrollo o CI donde no hay acelerador disponible.
- Creacion de carteles y rotulos con texto corto: la variante LITE mantiene legibilidad aceptable en textos de una a tres palabras con numeros (por ejemplo, rotulos de comercios), generando 2-3 variaciones para elegir la mejor.
- Ilustracion de contenido web o redes sociales a baja resolucion: al no requerir GPU, se puede integrar en flujos batch de generacion de imagenes de portada o miniaturas.
- Educacion y demostraciones: permite mostrar pipelines de difusion SDXL completos en equipos de estudiantes sin tarjeta grafica, a coste de calidad reducida.
- Generacion de datos sinteticos de baja resolucion para tareas auxiliares (por ejemplo, augmentation o pruebas de pipeline) donde la fidelidad fotografica no es critica.
- Localizacion al portugues: al haberse entrenado con captions multilingues, permite prompts en portugues, aunque el autor recomienda traducir al ingles para resultados mas fieles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente proporciona cifras de rendimiento de inferencia:

| Escenario | Tiempo por imagen | Resolucion / pasos |
|---|---|---|
| PS-IMAGE-1.5-LITE (CPU 2-8 nucleos) | 1-5 min | 512 px, 8 pasos |
| PS-IMAGE-1.5 full (misma CPU) | 15-40 min | 768 px, 20 pasos |

Ademas se declara una decodificacion del VAE aproximadamente 10x mas rapida con TAESDXL y un error maximo del LoRA fp16 de aproximadamente 1,5e-05 respecto a fp32.

## Requisitos de hardware

- VRAM: no requiere GPU; la ejecucion declarada es solo CPU.
- RAM: 8-12 GB para funcionar con float32, attention/VAE slicing y VAE tiling.
- CPU: entre 2 y 8 nucleos; el tiempo por imagen varia mucho segun la maquina (1-5 min a 512 px y 8 pasos).
- GPU: no requerida. La model card no documenta requisitos para uso en GPU, aunque el adaptador deberia poder cargarse sobre SDXL en GPU como cualquier LoRA.
- Consumer GPU: no aplica como requisito; el objetivo declarado es prescindir de GPU.
- Opciones de despliegue: diffusers (`StableDiffusionXLPipeline` + `peft.PeftModel`), script `usar_cpu.py`, interfaz Gradio (`app_gradio.py`). No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion).
- Latencia y throughput: 1-5 min por imagen en CPU (512 px, 8 pasos), frente a 15-40 min de la version full en el mismo CPU.

## Comparativa con modelos similares

| Modelo | Tipo | Resolucion / pasos | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PS-IMAGE-1.5-LITE | LoRA SDXL (fp16) + TAESDXL | 512 px, 6-10 pasos | CPU, 8-12 GB RAM | No disponible (sigue la de SDXL base segun el autor) | Hugging Face: Pedro21613/PS-IMAGE-1.5-LITE |
| PS-IMAGE-1.5 (full) | LoRA SDXL (fp32) + VAE full | 768 px, 20 pasos | GPU | No disponible en la informacion | Hugging Face: Pedro21613/PS-IMAGE-1.5 |
| stabilityai/stable-diffusion-xl-base-1.0 | Modelo base SDXL | Configurable | GPU (uso en CPU muy lento) | CreativeML Open RAIL++-M (segun la base) | Hugging Face: stabilityai/stable-diffusion-xl-base-1.0 |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La propia model card advierte de perdida de calidad frente a la version full en GPU: menor nitidez, menos detalle fino y peor legibilidad de texto.
- El texto largo tiende a difuminarse; se recomienda limitarse a 1-3 palabras mas numeros entre comillas y generar 2-3 variaciones.
- Rostros y manos pequenas pueden deformarse mas que en la version full.
- El color y el contraste pueden variar ligeramente respecto a la version full por el uso del VAE TAESDXL.
- Al ser una variante optimizada para CPU, la latencia es alta (1-5 min por imagen) y depende fuertemente del numero de nucleos disponibles.
- Riesgo de sesgos y alucinaciones visuales inherentes a SDXL y a su dataset de entrenamiento, no cuantificado en la informacion disponible.
- Licencia no declarada de forma explicita en el repositorio; el autor remite a la licencia de SDXL base y a los terminos de Hugging Face, por lo que conviene verificar las condiciones antes de uso comercial.
- Compatibilidad de idioma limitada: aunque acepta prompts en portugues y castellano, el rendimiento optimo se obtiene en ingles.
- El modelo no incluye safety checker en el ejemplo de uso (`safety_checker=None`), lo que traslada al desarrollador la responsabilidad de filtrar contenido.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Pedro21613/PS-IMAGE-1.5-LITE
- Modelo base del LoRA original: https://huggingface.co/Pedro21613/PS-IMAGE-1.5
- Modelo base SDXL: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- VAE ligero TAESDXL: https://huggingface.co/madebyollin/taesdxl
- Traduccion multilingue a ingles (sugerida por el autor): https://huggingface.co/Helsinki-NLP/opus-mt-mul-en
