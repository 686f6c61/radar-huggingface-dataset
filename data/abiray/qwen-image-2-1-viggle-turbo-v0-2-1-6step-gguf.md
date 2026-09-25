# Abiray/Qwen-Image-2.1-viggle-turbo-v0.2.1-6step-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF independientes de Qwen-Image-2.1, el modelo de generacion de imagenes de Qwen Team (Alibaba), con la LoRA turbo de destilacion de 6 pasos (rango 256) de Viggle fusionada de forma nativa. El resultado son checkpoints que ejecutan generacion texto-a-imagen completa en exactamente 6 pasos y con CFG desactivado (1.0), lo que segun el autor supone una aceleracion de aproximadamente 4,5 veces respecto al modelo sin destilar, todo dentro del cargador GGUF nativo de ComfyUI. Lo publica el usuario Abiray, no el equipo original de Qwen ni Viggle: es una redistribucion cuantizada de un modelo de terceros.

Tecnicamente se trata de un modelo de difusion con arquitectura DiT (Diffusion Transformer) de unos 7,12 mil millones de parametros en el componente de difusion, segun el recuento real de safetensors. La innovacion practica no esta en la arquitectura base, sino en la fusion previa a la cuantizacion: el campo de velocidad destilado en FP32 de la LoRA de Viggle se integra permanentemente en los pesos antes de convertir a GGUF, de modo que no hace falta cargar la LoRA por separado ni aplicar CFG en inferencia.

Su relevancia actual es de tipo practico: permite ejecutar un modelo de generacion de imagenes de gama alta en GPUs de consumo (el autor recomienda Q4_K_M para GPUs de 8-12 GB de VRAM), algo impensable con los pesos originales en BF16. El repo ocupa 29,9 GB e incluye seis niveles de cuantizacion, ademas de los flujos de trabajo de ComfyUI listos para usar en texto-a-imagen e imagen-a-imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer); arquitectura base de Qwen-Image-2.1 (Qwen Team / Alibaba) |
| Parametros totales | 7.115.124.736 (~7,12 B) en el componente de difusion, segun safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF: Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, Q3_K_M |
| Idiomas soportados | No disponible |
| Licencia | qwen-research (license: other); enlace a la licencia del modelo base |
| Formato de pesos | GGUF (cuantizado); el modelo base esta en safetensors |
| Modelo base | Viggle/Qwen-Image-2.1-viggle-turbo |
| Codificador de texto requerido | qwen3vl_8b_int8_convrot.safetensors |
| VAE requerido | qwen_image_2.1_vae_bf16.safetensors |
| Tamano del repositorio | 29,9 GB |
| Descargas / likes | 0 / 2 |
| Fecha de creacion | 25 de septiembre de 2026 |
| Pipeline declarado | text-to-image (soporta tambien image-to-image) |

## Arquitectura y entrenamiento

El modelo base es un DiT de Qwen-Image-2.1, el sistema de generacion de imagenes de Qwen Team / Alibaba, con aproximadamente 7,12 mil millones de parametros en el modulo de difusion. Sobre ese modelo, Viggle entreno una destilacion tipo turbo (LoRA de rango 256) que aprende un campo de velocidad de pocos pasos; el autor de esta ficha de cuantizacion lo describe como un "campo de velocidad destilado" en FP32. El procedimiento aplicado aqui consiste en fusionar esa LoRA de forma permanente en los pesos del modelo base en FP32 y solo despues convertir a GGUF, evitando la perdida de fidelidad que supondria cuantizar por separado la LoRA o aplicarla en tiempo de inferencia.

El resultado es un muestreo determinista de 6 pasos con CFG igual a 1.0 y una secuencia de sigmas fija: `[1.0, 0.9375, 0.875, 0.75, 0.5, 0.25]`, con `shift_terminal: null`, muestreador Euler y prompts negativos vacios. El nodo personalizado `viggle_turbo.py` de Viggle es necesario para inyectar esa secuencia de sigmas. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF/DPO; para un modelo de difusion esos datos corresponderian al informe tecnico de Qwen-Image-2.1 y a la receta de destilacion de Viggle, que no se enlazan en este repositorio.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) con 6 pasos de muestreo y sin CFG.
- Edicion de imagen a imagen (image-to-image); el repositorio incluye flujos especificos de edicion ademas del de texto-a-imagen.
- Inferencia dentro de ComfyUI mediante el nodo `Unet Loader (GGUF)` de ComfyUI-GGUF, sin salir del ecosistema nativo de ComfyUI.
- Integracion con el nodo personalizado `viggle_turbo.py` de Viggle para aplicar la secuencia de sigmas turbo.
- Seis niveles de cuantizacion que permiten ajustar el compromiso entre fidelidad, VRAM y velocidad en el mismo checkpoint.
- No soporta tool calling, function calling ni uso como agente: es un modelo de difusion, no un modelo de lenguaje.
- No se documentan capacidades multilingues del prompt; el codificador de texto es Qwen3-VL 8B en int8, pero el repo no declara idiomas soportados.
- No se documentan modos de razonamiento, vision analitica, audio ni modos de pensamiento (thinking).

## Casos de uso

- Generacion de ilustraciones en una estacion de trabajo con GPU de consumo: con el checkpoint Q4_K_M (3,90 GB) el modelo cabe en GPUs de 8-12 GB de VRAM, lo que permite crear ilustraciones en local sin depender de APIs en la nube.
- Iteracion rapida de conceptos en diseno grafico: al reducirse la generacion a 6 pasos, el ciclo prompt-imagen se acorta y el disenador puede probar decenas de variaciones de composicion o paleta en una sola sesion.
- Edicion de imagenes en flujo de postproduccion: el soporte de image-to-image permite reformular o retocar imagenes existentes manteniendo la estructura, integrándose en un nodo de ComfyUI junto a otras herramientas del pipeline.
- Prototipado de assets para videojuegos o animacion: la generacion texto-a-imagen de alta fidelidad sirve para bocetos de personajes, entornos o interfaces antes de pasar al modelado o al arte final.
- Generacion de imagenes por lotes en servidores con GPU de 16 GB o mas: el checkpoint Q8_0 (7,07 GB) ofrece la maxima fidelidad declarada por el autor y es adecuado para produccion por lotes en GPUs en la nube.
- Pruebas de investigacion sobre destilacion y cuantizacion: el repositorio permite comparar el mismo modelo destilado en seis niveles de cuantizacion, un caso de estudio directo sobre el impacto de la precision en la calidad final.
- Despliegue local con requisitos de privacidad: todo el pipeline (modelo, codificador de texto y VAE) se ejecuta en la maquina del usuario, util para equipos que no pueden enviar material grafico a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica cifra de rendimiento declarada por el autor es una aceleracion de aproximadamente 4,5x respecto al modelo sin destilar, atribuida a la reduccion a 6 pasos y a la eliminacion del CFG. No hay FID, CLIP score, HPSv2 ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: depende del nivel de cuantizacion elegido. Los tamanos de fichero publicados son 2,97 GB (Q3_K_M), 3,78 GB (Q4_K_S), 3,90 GB (Q4_K_M), 4,66 GB (Q5_K_M), 5,47 GB (Q6_K) y 7,07 GB (Q8_0). A esa cifra hay que sumar el codificador de texto Qwen3-VL 8B en int8 y el VAE en bf16, que se cargan por separado.
- Recomendaciones del autor: Q8_0 para GPUs en la nube o con 16 GB o mas de VRAM; Q4_K_M para GPUs de 8-12 GB de VRAM; Q4_K_S para configuraciones de memoria muy baja; Q3_K_M para pruebas locales ultraligeras.
- Cabe en GPU de consumo: si, con los niveles Q3_K_M a Q4_K_M en GPUs de 8-12 GB, y con Q5_K_M o Q6_K en GPUs de 12-16 GB. No se especifica comportamiento con menos de 8 GB.
- GPU recomendadas: no se indican modelos concretos en la informacion disponible; el autor solo cita rangos de VRAM (16 GB+ para Q8_0, 8-12 GB para Q4_K_M).
- Opciones de despliegue: ComfyUI con el nodo personalizado ComfyUI-GGUF (obligatorio), mas el nodo `viggle_turbo.py` de Viggle. El modelo esta pensado para el cargador `Unet Loader (GGUF)`. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp como motor de inferencia (llama.cpp interviene solo como herramienta de cuantizacion).
- Latencia y throughput: no disponibles en valores absolutos. La unica referencia es la aceleracion declarada de aproximadamente 4,5x respecto al modelo no destilado, con 6 pasos fijos por generacion.

## Comparativa con modelos similares

Dentro de la informacion proporcionada no hay datos de benchmarks ni especificaciones de modelos alternativos (FLUX.1-schnell, SDXL-Turbo, modelos turbo de Stable Diffusion u otras cuantizaciones de Qwen-Image), por lo que no es posible una comparacion cuantitativa. La comparacion disponible es interna, entre los checkpoints de este mismo repositorio:

| Checkpoint | Tamano | Precision | Uso recomendado segun el autor |
|---|---|---|---|
| qwen_image_2.1_turbo_Q8_0.gguf | 7,07 GB | 8 bits | Maxima fidelidad; GPUs en la nube o 16 GB+ de VRAM |
| qwen_image_2.1_turbo_Q6_K.gguf | 5,47 GB | ~6 bits | Generacion turbo practicamente sin perdida |
| qwen_image_2.1_turbo_Q5_K_M.gguf | 4,66 GB | ~5 bits | Mejor equilibrio entre velocidad, VRAM y detalle |
| qwen_image_2.1_turbo_Q4_K_M.gguf | 3,90 GB | ~4 bits | GPUs de 8-12 GB de VRAM |
| qwen_image_2.1_turbo_Q4_K_S.gguf | 3,78 GB | ~4 bits | Configuraciones de memoria baja |
| qwen_image_2.1_turbo_Q3_K_M.gguf | 2,97 GB | ~3 bits | Pruebas locales ultraligeras |

Frente al modelo base Viggle/Qwen-Image-2.1-viggle-turbo en sus pesos originales, la diferencia documentada es el formato (GGUF cuantizado frente a safetensors), el procedimiento (LoRA fusionada en FP32 antes de cuantizar, en lugar de cargarse aparte) y el menor espacio en disco y VRAM. No se publican datos de calidad comparativa entre ambos.

## Limitaciones y advertencias

- Licencia qwen-research: es una licencia de investigacion, no una licencia permisiva. Antes de cualquier uso comercial hay que revisar el texto enlazado del modelo base, porque puede imponer restricciones o requerir autorizacion.
- El repositorio lo publica un tercero (Abiray), no Qwen Team ni Viggle; no hay garantia de mantenimiento ni de exactitud respecto a los pesos oficiales.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad, fidelidad al prompt ni comparacion con el modelo sin cuantizar, mas alla de las muestras visuales del autor.
- 0 descargas y 2 likes en el momento de redactar esta ficha: no existe validacion por parte de la comunidad.
- El muestreo es estricto: exactamente 6 pasos, CFG 1.0 y la secuencia de sigmas del nodo de Viggle. Subir el CFG por encima de 1.0 o cambiar el numero de pasos degrada el resultado segun el propio autor; los prompts negativos deben quedar vacios.
- Requiere instalar dos componentes externos (ComfyUI-GGUF y `viggle_turbo.py`); sin ellos el modelo no funciona correctamente.
- Requiere descargar por separado el codificador de texto Qwen3-VL 8B en int8 y el VAE en bf16, lo que incrementa el consumo de VRAM y disco respecto al tamano del checkpoint GGUF.
- Riesgo de alucinacion visual y de sesgos: el dataset de entrenamiento, la composicion demografica y el tratamiento de temas sensibles no se documentan en este repositorio.
- Idioma de los prompts no declarado: se desconoce el rendimiento real con prompts en castellano.
- Al ser pesos cuantizados a 3-4 bits, los niveles Q3_K_M y Q4_K_S pueden introducir perdida de detalle fino no cuantificada en la informacion disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Abiray/Qwen-Image-2.1-viggle-turbo-v0.2.1-6step-GGUF
- Modelo base (Viggle/Qwen-Image-2.1-viggle-turbo): https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Licencia del modelo base: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo/blob/main/LICENSE
- Nodo personalizado de Viggle: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo/blob/main/comfyui/viggle_turbo.py
- Flujo de trabajo texto-a-imagen incluido: https://huggingface.co/Abiray/Qwen-Image-2.1-viggle-turbo-v0.2.1-6step-GGUF/blob/main/Qwen-Image-2.1-viggle-turbo-t2i_GGUF.json
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (city96): https://github.com/city96/ComfyUI-GGUF
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Qwen Team / Alibaba en HuggingFace: https://huggingface.co/Qwen

Nota: los resultados de busqueda web recibidos no guardan relacion con este modelo (contenian referencias a la franquicia Wallace & Gromit), por lo que no se ha incorporado ningun dato de esas fuentes.
