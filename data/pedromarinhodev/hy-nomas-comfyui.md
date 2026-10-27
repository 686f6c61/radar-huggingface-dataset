# PedroMarinhoDev/Hy-Nomas-ComfyUI

## Resumen

Hy-Nomas for ComfyUI es un paquete de pesos y nodos que adapta el modelo de mundo («world model») de vídeo Hy-Nomas, desarrollado por Tencent, al ecosistema nativo de ComfyUI. No es un modelo de lenguaje: es un generador de vídeo condicionado por texto, imagen inicial, acciones temporizadas y movimiento de cámara, que construye secuencias segmento a segmento y encadena cada segmento a partir de la memoria de los anteriores. El repositorio lo publica PedroMarinhoDev (no Tencent) y contiene los checkpoints INT8 del DiT destilado y FP8 del decoder de Tencent, sin modificar, renombrados para su uso con los nodos del nodo pack ComfyUI-Hy-Nomas.

El interés práctico está en el coste de hardware: al usar el DiT destilado a 8 pasos en INT8 y un decoder FP8, el conjunto cabe en tarjetas de 12 GB de VRAM, algo poco habitual en modelos de vídeo de esta categoría. El text encoder es Qwen2.5-VL-7B en FP8 escalado, cargado como CLIP de tipo `qwen_image`, lo que añade unos 9,4 GB adicionales de descarga.

La relevancia ahora mismo es doble: por un lado, acerca la generación de vídeo con control de cámara e interacción por teclado (modo «drive») a GPUs de consumo; por otro, es un primer release explícitamente marcado como «work in progress», con 0 descargas y 13 likes en el momento de la consulta, y con el decoder bajo licencia no comercial de NVIDIA, lo que condiciona seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) destilado a 8 pasos para el generador; decoder de vídeo PixelUMM ajustado (FP8) con encoder DCAE-V para arranque desde imagen; text encoder Qwen2.5-VL-7B |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | no disponible en tokens; ventana temporal por segmento: 5 s en los ejemplos encadenados y 1 s en modo drive; los ejemplos encadenan 4 segmentos (20 s) |
| Tipos de cuantizacion | INT8 (DiT), FP8 (decoder PixelUMM y text encoder); el autor indica que el text encoder tambien existe en bf16 |
| Idiomas soportados | no disponible (el prompt se procesa con Qwen2.5-VL-7B, pero no se documenta cobertura linguistica) |
| Licencia | other: apache-2.0-and-nvidia-one-way-noncommercial (el decoder es no comercial) |
| Formato de pesos | safetensors |
| Modelo base | tencent/Hy-Nomas (relacion: quantized) |
| Pipeline declarado | text-to-video (con image-to-video, camera control e interactive video generation) |
| Resolucion de salida | 1280x704 y 832x480 en los ejemplos publicados |
| Fotogramas por segundo | 24 fps en los ejemplos publicados |
| Tamano del repositorio | 18,5 GB |
| VRAM indicada por el autor | 12 GB o mas |
| Software requerido | ComfyUI v0.42+ y el nodo pack ComfyUI-Hy-Nomas (sin `pip install`) |
| Descargas / likes | 0 / 13 (segun metadatos de HuggingFace) |
| Fecha de publicacion | 23 de octubre de 2026 (metadatos); actualizado el mismo dia |

## Arquitectura y entrenamiento

El modelo subyacente es un «world model» de vídeo de Tencent construido sobre un transformer de difusion (DiT) destilado a 8 pasos de muestreo, acompañado de un decoder de vídeo PixelUMM ajustado finamente y de un encoder DCAE-V que se usa cuando la generacion arranca desde una imagen propia. La generacion es autorregresiva a nivel de segmento: cada segmento se produce a partir de la memoria de los segmentos previos y de las condiciones de texto, acciones temporizadas y claves de camara, lo que permite encadenar clips y mantener la continuidad de la escena. El texto se codifica con Qwen2.5-VL-7B, en su variante FP8 escalada.

Este repositorio no entrena ni modifica los pesos: empaqueta el checkpoint INT8 de un solo GPU de Tencent y el decoder FP8, sin cambios, bajo los nombres de fichero que esperan los nodos de ComfyUI (`hy_nomas_distil_int8.safetensors` en `models/diffusion_models`, `hy_nomas_pixelumm_fp8.safetensors` en `models/vae`). No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO (no aplicables de forma estandar a un modelo de difusion). Como innovaciones tecnicas destacables estan la destilacion a 8 pasos, el control explicito de camara por claves y el modo drive interactivo por teclado, con turnos de 1 segundo.

## Capacidades

- Generacion de video a partir de texto: clips con direccion de escena descrita en el prompt (ejemplo publicado del zorro en el bosque).
- Image-to-video: arranque desde una imagen propia, manteniendo su grade de color durante el recorrido (ejemplos de Paris y de la playa).
- Encadenamiento de segmentos con memoria: los ejemplos publicados encadenan cuatro segmentos de 5 s con texto distinto en cada uno para llegar a 20 s.
- Control de camara por claves: notacion como `D+Left 3` (desplazamiento a la derecha girando a la izquierda) o `S 4` (avance), aplicada por segmento.
- Modo drive interactivo: turnos de 1 s dirigidos con teclado (W, W+Left, W+Right) para navegar el mundo generado.
- Movimiento de camara en primera y tercera persona (los ejemplos muestran follow en tercera persona y POV en primera persona).
- Condicionamiento conjunto de texto, acciones temporizadas y camara en una misma generacion.
- Salida a 24 fps en 1280x704 o 832x480 en los ejemplos publicados.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio, ni modos de razonamiento explicito; no es un modelo de lenguaje.

## Casos de uso

- Previz y animatica de planos: generar un plano de 5 s desde un still o un prompt para validar encuadre, ritmo y continuation antes de rodar, encadenando segmentos para secuencias de 20 s o mas.
- Diseno de recorridos de camara: usar claves como `D+Left 3` para orbitar alrededor de un sujeto estatico y comparar variantes de movimiento sin repetir rodaje.
- Demos interactivas y prototipos de navegacion: el modo drive con turnos de 1 s a 832x480 (~4,3 s por turno en RTX 4090) permite enseñar un entorno explorable generado en tiempo casi real.
- Generacion de clips a partir de material fotografico existente: image-to-video conserva el grade de color de la imagen de partida, util para convertir fotografia de producto o localizaciones en video corto.
- Datasets sinteticos de video con camera pose conocida: al controlar explicitamente el movimiento de camara se pueden producir pares video-anotacion para entrenar modelos de odometria visual o de sintesis de vistas.
- Storyboarding con prompts por segmento: asignar un texto distinto a cada segmento encadenado permite iterar la narrativa de una secuencia sin regenerar el clip completo.
- Investigacion en world models: reproduccion de los ejemplos del autor con pesos cuantizados para estudiar deriva temporal, consistencia fisica y memoria entre segmentos en una GPU de 12 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, HumanEval, GSM8K ni metricas de video como FVD o CLIP score). Los unicos datos cuantitativos son tiempos de ejecucion declarados por el autor sobre una RTX 4090:

| Medicion | Configuracion | Resultado declarado |
|---|---|---|
| Generacion de segmento encadenado | 1280x704, 24 fps, segmentos de 5 s, cuatro por clip | unos 3 minutos por segmento |
| Modo drive | 832x480, turnos de 1 s dirigidos por teclado | unos 4,3 s por turno |
| Muestreo del DiT | Destilado | 8 pasos |

## Requisitos de hardware

- VRAM: 12 GB o mas segun el autor, gracias al DiT INT8 y al decoder FP8.
- GPU verificada en los ejemplos: RTX 4090 (24 GB), con ~3 min por segmento de 5 s a 1280x704 y ~4,3 s por turno de 1 s a 832x480 en modo drive.
- Cabe en GPU de consumo de gama alta con 12 GB o mas; no se documentan pruebas en tarjetas de 8 GB ni en GPUs de datacenter (A100, H100) en la informacion disponible.
- Almacenamiento: 18,5 GB de repositorio, de los cuales 9,06 GB son el DiT, 9,13 GB el decoder y 9,4 GB adicionales el text encoder Qwen2.5-VL-7B (descarga aparte desde Comfy-Org/Qwen-Image_ComfyUI).
- Despliegue: exclusivamente mediante ComfyUI v0.42+ con el nodo pack ComfyUI-Hy-Nomas clonado en `custom_nodes`; no hay soporte indicado para vLLM, TGI, llama.cpp ni Ollama (no aplicables a este tipo de modelo), ni pesos GGUF.
- Latencia y throughput: solo los tiempos del autor citados arriba; no hay mediciones independientes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy-Nomas-ComfyUI (este repo) | no disponible | segmentos de 5 s y 1 s; 20 s encadenados en ejemplos | INT8 + FP8 | apache-2.0 con decoder NVIDIA one-way noncommercial | HuggingFace, 0 descargas |
| tencent/Hy-Nomas (original) | no disponible | no disponible | incluye checkpoint INT8 para un solo GPU | no disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de parametros, contexto, rendimiento ni licencia de modelos alternativos de generacion de video o world models interactivos en la informacion proporcionada, por lo que no se establece una comparacion cuantitativa. La unica comparacion sostenible es con el modelo original de Tencent: mismos pesos (INT8 y FP8 sin cambios), con renombrado de ficheros y nodos propios para ComfyUI.

## Limitaciones y advertencias

- Licencia restrictiva en la practica: el decoder PixelUMM se distribuye bajo licencia one-way noncommercial de NVIDIA; la licencia agregada es `apache-2.0-and-nvidia-one-way-noncommercial`, lo que impide el uso comercial del pipeline completo tal cual.
- Estado «work in progress» declarado por el propio autor: los nodos funcionan de extremo a extremo, pero se advierten asperezas y cambios en las entradas de los nodos entre versiones.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad (FVD, consistencia, adherencia al prompt) ni evaluaciones independientes; 0 descargas implican ausencia de validacion por terceros.
- Deriva y alucinacion visual: al ser autorregresivo por segmentos, los clips largos estan expuestos a acumulacion de errores, cambios de identidad de sujetos y geometria inconsistente; la model card no documenta mitigaciones.
- Sesgos: no se documenta composicion del dataset de entrenamiento ni evaluaciones de sesgo demografico, geografico o cultural.
- Idiomas: no se declara cobertura linguistica; el prompt depende del text encoder Qwen2.5-VL-7B, cuya licencia y limites no se detallan en este repositorio.
- Dependencia de terceros: requiere ComfyUI v0.42+ y el nodo pack externo; no hay ruta de despliegue alternativa (vLLM, API, ONNX) ni pesos GGUF.
- Coste de almacenamiento y descarga elevado: 18,5 GB mas 9,4 GB del text encoder para un unico pipeline.
- No es un modelo de lenguaje ni un asistente: no soporta tool calling, agentes, RAG ni razonamiento textual; cualquier expectativa en ese sentido es un error de categoria.
- Fechas de metadatos (octubre de 2026) y recuento de descargas deben tratarse como instantanea del momento de publicacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/PedroMarinhoDev/Hy-Nomas-ComfyUI
- Nodos en GitHub: https://github.com/PedroMarinhoDev/ComfyUI-Hy-Nomas
- Roadmap de los nodos: https://github.com/PedroMarinhoDev/ComfyUI-Hy-Nomas#roadmap
- Ejemplos y prompts (carpeta `examples/`): https://github.com/PedroMarinhoDev/ComfyUI-Hy-Nomas/tree/main/examples
- Modelo original de Tencent: https://huggingface.co/tencent/Hy-Nomas
- Text encoder (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image_ComfyUI
- Ficheros de pesos: https://huggingface.co/PedroMarinhoDev/Hy-Nomas-ComfyUI/blob/main/hy_nomas_distil_int8.safetensors y https://huggingface.co/PedroMarinhoDev/Hy-Nomas-ComfyUI/blob/main/hy_nomas_pixelumm_fp8.safetensors
- Licencia: https://huggingface.co/PedroMarinhoDev/Hy-Nomas-ComfyUI/blob/main/LICENSE
- Video de presentacion: https://huggingface.co/PedroMarinhoDev/Hy-Nomas-ComfyUI/resolve/main/hy-nomas-promo.mp4
