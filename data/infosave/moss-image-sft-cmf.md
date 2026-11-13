# infosave/MOSS-Image-SFT-cmf

## Resumen

MOSS-Image-SFT-cmf es un artefacto de inferencia empaquetado en formato CMF (Cortiq Model Format) que contiene los pesos del modelo text-to-image MOSS-Image-SFT, desarrollado originalmente por OpenMOSS-Team y reempaquetado por el usuario infosave para el runtime en Rust `cortiq`. El modelo base es un modelo de difusion de la familia MOSS-Image, especializado en generacion de imagenes a partir de prompts en lenguaje natural, secuencias de etiquetas y prompts de layout en JSON. Este repositorio no introduce cambios en los pesos ni en la arquitectura del modelo original: es unicamente un contenedor optimizado para despliegue con la libreria `cortiq`.

La relevancia de este artefacto radica en su enfoque de empaquetado nativo en un unico fichero, con dos perfiles de cuantizacion (q8_2f y q4tp) y verificacion de integridad mediante SHA-256. El pipeline combina un encoder de texto denso hibrido Qwen3.5, un transformer de difusion (DiT) de 42 capas y un decodificador FLUX.2 AutoencoderKLFlux2, todo empaquetado en ficheros de entre 10 y 12 GiB. El modelo soporta prompts en ingles, ruso y chino.

El modelo esta pensado para desarrolladores que necesitan ejecutar generacion text-to-image en local con un runtime ligero basado en Rust, con soporte para cadenas de GPU residentes (CUDA, Vulkan, Metal) y un consumo de memoria gestionado por residencia por etapas. La licencia Apache 2.0 facilita su integracion en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion (DiT) con encoder de texto Qwen3.5 y decoder FLUX.2 AutoencoderKLFlux2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_2f (12,35 GiB) y q4tp (10,11 GiB) |
| Idiomas soportados | en, ru, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (Cortiq Model Format), fichero unico con 1038 tensores |
| Capas del DiT | 42 (MOSSImageTransformer, width 3072, 24 heads, FFN 8192) |
| Resolucion minima soportada | 512 x 512 |
| Version minima del runtime | Cortiq v0.8.31 (v0.8.81 para cadenas GPU residentes) |

## Arquitectura y entrenamiento

El pipeline de inferencia empaquetado en el CMF consta de tres componentes: un encoder de texto denso hibrido Qwen3.5 con su tokenizer y plantilla de chat embebida; un transformer de difusion MOSSImageTransformer de 42 capas con anchura 3072, 24 cabezas de atencion y FFN de anchura 8192; y una ruta de decodificacion FLUX.2 AutoencoderKLFlux2. Los dos ficheros CMF publicados contienen 1038 tensores en total: 463 del DiT, 426 del encoder de texto y 142 del decoder Flux2. El runtime utiliza residencia por etapas (primero encoder de texto, luego DiT, luego decoder) para liberar la etapa anterior antes de cargar la siguiente, lo que reduce el pico de memoria.

El modelo base MOSS-Image-SFT es la version supervisada (SFT) de la familia MOSS-Image, derivada de MOSS-Image-Base con la misma arquitectura y pipeline de inferencia. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF/DPO en la informacion proporcionada. El CMF empaquetado incluye unicamente los componentes alcanzados por la ruta observada de text-to-image con prompts de cadena; la torre visual de Qwen y el lado encoder no estan incluidos en el artefacto.

## Capacidades

- Generacion de imagenes text-to-image a partir de prompts en lenguaje natural, secuencias de etiquetas y prompts de layout en JSON.
- Soporte de prompts descriptivos detallados con control de estilo fotografico (iluminacion, optica, profundidad de campo, grading de color).
- Generacion a resoluciones desde 512 x 512 (limite inferior soportado) hasta el rango de 1-2 MP recomendado por el autor.
- Control de generacion mediante parametros de muestreo: steps, cfg (classifier-free guidance), shift y seed.
- Multilingue en ingles, ruso y chino.
- No se menciona soporte de tool calling, function calling, agentes ni modos de razonamiento multi-paso, al tratarse de un modelo de generacion de imagenes.
- No se mencionan capacidades de vision, audio ni thinking mode.

## Casos de uso

- Generacion de imagenes para prototipado de producto: el modelo permite iterar rapidamente sobre conceptos visuales con prompts descriptivos y seeds fijas, reproduciendo exactamente cada render mediante el comando documentado y verificando la integridad del resultado con SHA-256.
- Ilustracion editorial y fotografia sintetica: los ejemplos publicados (fauna salvaje, escenas urbanas nocturnas, bodegones) demuestran capacidad para generar imagenes con estilos fotograficos coherentes (RAW, 85mm, shallow depth of field), adecuadas para maquetas y borradores editoriales.
- Generacion de assets para videojuegos y entornos 3D: con prompts de layout en JSON, el modelo puede generar composiciones con control espacial, util para texturas, fondos y concept art.
- Despliegue en local con runtime Rust: integrable en aplicaciones de escritorio o pipelines internos que requieran generacion de imagenes sin dependencia de servicios en la nube, gracias al empaquetado en fichero unico y a la verificacion de integridad.
- Automatizacion de contenido visual multilingue: al soportar en, ru y zh, puede generar imagenes a partir de prompts en esos idiomas para mercados regionales.
- Investigacion en difusion y cuantizacion: los dos perfiles (q8_2f y q4tp) permiten comparar calidad frente a huella de memoria, util para estudios de cuantizacion en modelos de difusion.
- Generacion por lotes en GPUs de consumo: con el perfil q4tp (10,11 GiB) y residencia por etapas, es viable en GPUs con 16-24 GB de VRAM, permitiendo pipelines de generacion masiva en estaciones de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento proporcionados son mediciones de latencia del runtime: una imagen de 512 x 512 en 8 pasos tarda 10,1 s en CUDA y 17,3 s en Vulkan sobre una RTX A5000. Los ejemplos publicados usan 50 pasos con cfg 3 y shift 5 sobre una RTX 2000 Ada con driver 595.91.07 mediante Vulkan.

## Requisitos de hardware

- VRAM estimada: el perfil q8_2f ocupa 12,35 GiB en disco y el q4tp 10,11 GiB; la residencia por etapas reduce el pico de memoria al liberar cada componente antes de cargar el siguiente, por lo que la VRAM necesaria es inferior a la suma de los tres componentes.
- GPU recomendadas: RTX A5000 (medicion oficial de latencia), RTX 2000 Ada (sistema de referencia de los ejemplos), y por capacidad de memoria, GPUs con 16-24 GB como RTX 4090, RTX 4080, A100 o H100.
- Cabe en GPU de consumo: si, en GPUs con al menos 16 GB de VRAM usando el perfil q4tp; el perfil q8_2f requiere previsiblemente 24 GB o mas, aunque el dato exacto de VRAM pico no esta disponible.
- Opciones de despliegue: runtime `cortiq` (v0.8.31 o superior; v0.8.81 para cadenas GPU residentes CUDA, Vulkan y Metal). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia: 10,1 s por imagen 512 x 512 en 8 pasos en CUDA y 17,3 s en Vulkan sobre RTX A5000.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Resolucion | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| MOSS-Image-SFT-cmf | no disponible | no disponible | 512 x 512 a 1-2 MP | Apache 2.0 | CMF (cortiq) | Hugging Face |
| MOSS-Image-SFT (base) | no disponible | no disponible | 512 x 512 a 1-2 MP | no disponible | safetensors (presumible) | Hugging Face (OpenMOSS-Team) |
| MOSS-Image-Base | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (OpenMOSS-Team) |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que no es posible una comparativa cuantitativa con modelos de otros desarrolladores.

## Limitaciones y advertencias

- El artefacto CMF solo es compatible con el runtime `cortiq`; no es utilizable directamente con otras librerias de difusion como diffusers, ComfyUI o Automatic1111.
- El CMF empaqueta unicamente la ruta de text-to-image con prompts de cadena; la torre visual de Qwen y el lado encoder no estan incluidos, por lo que no soporta flujos image-to-image ni variantes que requieran esos componentes.
- La resolucion minima soportada es 512 x 512; el rango recomendado de 1-2 MP requiere mayor presupuesto de hardware.
- Solo se declaran los idiomas en, ru y zh; el rendimiento en otros idiomas no esta documentado y puede degradarse.
- No se dispone de informacion sobre sesgos del modelo base ni sobre tasas de alucinacion o fidelidad prompt-imagen medidas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base subyacente (OpenMOSS-Team/MOSS-Image-SFT) debe verificarse de forma independiente para confirmar que sus terminos son compatibles.
- El repositorio tiene un numero muy bajo de descargas (53) y likes (1), lo que limita la validacion comunitaria del artefacto.
- Los ejemplos publicados estan generados sobre un sistema de referencia concreto (RTX 2000 Ada, Vulkan, driver 595.91.07); los resultados pueden variar en otros backends.

## Enlaces

- Repositorio Hugging Face del artefacto: https://huggingface.co/infosave/MOSS-Image-SFT-cmf
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Revision del modelo base empaquetada: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT/tree/f972bd4b4b9e3852133cc5da954d87bc32cd8fb9
- Runtime Cortiq: https://github.com/infosave2007/cmf
