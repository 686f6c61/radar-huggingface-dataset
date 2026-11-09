# nvidia/Cosmos3-Nano-Policy-DROID

## Resumen

Cosmos3-Nano-Policy-DROID es un modelo de política robótica (policy model) desarrollado por NVIDIA, obtenido mediante post-entrenamiento del modelo base Cosmos3-Nano sobre el conjunto de datos del robot DROID. Forma parte de la familia Cosmos 3, una colección de modelos fundacionales "omnimodales" orientados a Physical AI: robótica, conducción autónoma y entornos industriales. El modelo recibe instrucciones en lenguaje natural junto con observaciones visuales (imágenes o vídeo) del robot y genera trayectorias de acción para tareas de manipulación y control.

Arquitectónicamente emplea una Mixture-of-Transformers (MoT) con dos torres complementarias: una torre autorregresiva para generación de tokens discretos (texto) y una torre de difusión para generación multimodal continua (imagen, vídeo, audio y acciones) mediante denoising iterativo. Cuenta con aproximadamente 15 750 millones de parámetros (16B según la model card) y se distribuye en formato safetensors con un tamaño de repositorio de 32,9 GB.

Su relevancia actual reside en que ofrece una política robótica lista para uso comercial y no comercial bajo licencia OpenMDW 1.1, con soporte para múltiples "embodiments" (Franka Panda, Agibot, UR, Google Robot, WidowX 250, UMI, entre otros), lo que reduce el trabajo de adaptación a distintos brazos robóticos y plataformas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Transformers (MoT): torre autorregresiva + torre de difusion |
| Parametros totales | 15 749 524 912 (~15,75B; la model card indica 16B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (las instrucciones de entrada son texto; no se detalla cobertura linguistica) |
| Licencia | OpenMDW 1.1 (openmdw1.1-license) |
| Formato de pesos | safetensors (7 shards del transformer + vae + vision_encoder + sound_tokenizer) |

## Arquitectura y entrenamiento

El modelo se construye sobre el marco Cosmos Framework de NVIDIA y emplea una arquitectura Mixture-of-Transformers con dos torres: una autorregresiva que genera tokens discretos mediante decodificacion next-token (texto) y una torre de difusion que sintetiza modalidades continuas (imagen, video, audio y acciones) mediante denoising iterativo. Esta separacion permite modelar modalidades heterogeneas en un unico marco conservando el mecanismo de generacion mas adecuado para cada una. El checkpoint incluye componentes separados de VAE, vision encoder, text tokenizer y sound tokenizer, ademas del transformer principal dividido en siete shards.

Esta variante concreta (Policy-DROID) es un post-entrenamiento del modelo base Cosmos3-Nano para generar trayectorias de accion a partir de instrucciones de lenguaje y observaciones visuales del robot DROID. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset de post-entrenamiento ni si se aplicaron tecnicas de RLHF/DPO. El modelo base se describe como omnimodal, capaz de generar video, imagen, audio y acciones a partir de combinaciones de texto, imagen, video y trayectorias de accion.

## Capacidades

- Generacion de trayectorias de accion robótica a partir de instrucciones de lenguaje y observaciones visuales, para tareas de manipulacion y control sobre la plataforma DROID.
- Entrada multimodal: texto (string), imagen (jpg, png, jpeg, webp), video (mp4, con o sin audio) y trayectorias de accion (json, lista 1D).
- Soporte de multiples "embodiments" de accion: movimiento de camara general (9D), vehiculo autonomo (9D), movimiento egocentrico (57D), brazo Franka Panda unico con gripper RobotiQ (10D), doble Franka Panda con RobotiQ (20D), Agibot (29D), UR (10D), Google Robot (10D), WidowX 250 (10D) y UMI (9D).
- Procesamiento de video de entrada a varias resoluciones (720p, 480p, 256p) y audio muxado en MP4 con 2 canales estéreo a 48 kHz.
- Generacion de modalidades no textuales mediante denoising (imagen, video, audio y acciones) dentro de la misma arquitectura.
- Capacidad de razonamiento multimodal derivada del modelo base Cosmos3-Nano (comprension de escenas y contexto visual).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes multi-paso: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Manipulacion robotica con brazo Franka Panda: el modelo recibe la instruccion en lenguaje natural y la observacion de camara, y emite una trayectoria de 10 dimensiones compatible con el gripper RobotiQ para tareas de pick-and-place en laboratorio o linea de montaje.
- Investigacion en aprendizaje por imitacion: se puede usar como politica preentrenada sobre el dataset DROID para hacer fine-tuning en nuevos entornos, aprovechando que ya incorpora representaciones visuales y de accion del dominio robotico.
- Robotica colaborativa con UR o WidowX 250: al soportar embodiments de 10 dimensiones, permite desplegar una politica comun en brazos UR y WidowX sin reentrenar desde cero, reduciendo el coste de adaptacion.
- Conduccion autonoma y navegacion: el embodiment de vehiculo autonomo (9D) y el de movimiento de camara general (9D) permiten generar comandos de trayectoria para agentes moviles en simulacion o en banco de pruebas.
- Plataformas humanoides o de investigacion con Agibot: el soporte de 29 dimensiones permite controlar robots con mayor numero de articulaciones, util para tareas de manipulacion bimanual compleja.
- Captura de movimiento y teleoperacion con UMI: el embodiment UMI (9D) facilita generar acciones a partir de demostraciones capturadas con dispositivos portatiles, util para pipelines de data collection a escala.
- Simulacion y "world modeling" en pipelines de Physical AI: combinado con el resto de la familia Cosmos 3, permite generar video y acciones coherentes para entrenar y validar politicas en entornos simulados antes del despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp16/bf16): aproximadamente 32 GB solo para pesos, mas memoria para activaciones, VAE, vision encoder y buffers de difusion; en la practica se recomienda un margen de 40-48 GB.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB o H200 para inferencia comoda con margen; A100 40 GB o L40S 48 GB pueden ser suficientes con optimizaciones.
- GPU de consumo: una RTX 4090 (24 GB) no cabe en fp16; requeriria cuantizacion o descarga por capas (offloading) a CPU/NVMe, lo que degrada la latencia. No se documentan variantes cuantizadas oficiales.
- Opciones de despliegue: el modelo usa la libreria `cosmos` y el ecosistema `diffusers`; no se documenta soporte oficial en vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de difusion para acciones, la latencia dependera fuertemente del numero de pasos de denoising y de la resolucion de las observaciones visuales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano-Policy-DROID (NVIDIA) | ~15,75B | no disponible | texto, imagen, video, audio, accion | OpenMDW 1.1 | Hugging Face, GitHub |
| Cosmos3-Nano (modelo base, NVIDIA) | no disponible (familia Cosmos3) | no disponible | texto, imagen, video, audio, accion | OpenMDW 1.1 | Hugging Face |
| Alternativas de politica robotica open source (p. ej. RT-2, OpenVLA) | no disponibles en la informacion proporcionada | no disponible | imagen, texto, accion | varian | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo esta especializado en generacion de acciones para los embodiments listados; no es un modelo de proposito general de texto ni un chatbot.
- Las entradas de imagen y video deben ser RGB de 8 bits por canal en sRGB; no se soportan entradas en escala de grises.
- El audio de entrada debe venir muxado en MP4 como estéreo a 48 kHz; otros formatos pueden no procesarse correctamente.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de robustez en la informacion disponible; en robótica, una accion incorrecta puede tener consecuencias fisicas, por lo que se recomienda validacion en simulacion y supervision humana.
- La licencia OpenMDW 1.1 permite uso comercial y no comercial segun la model card, pero conviene revisar los terminos completos en el enlace oficial antes de desplegar en produccion.
- El modelo se distribuye sin cuantizaciones oficiales; el despliegue en GPU de consumo requiere trabajo adicional de optimizacion no documentado.
- No se especifican idiomas soportados para las instrucciones de lenguaje, lo que limita la planificacion de despliegues multilingues.
- La fecha de creacion del repositorio (2026-05-21) y la de release indicada en la model card (05/31/2026) no coinciden exactamente; conviene verificar la version concreta del checkpoint antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/Cosmos3-Nano-Policy-DROID
- Coleccion Cosmos3: https://huggingface.co/collections/nvidia/cosmos3
- Ejemplos Cosmos3: https://huggingface.co/collections/nvidia/cosmos3-examples
- Codigo: https://github.com/nvidia/cosmos
- White paper / technical report: https://research.nvidia.com/labs/cosmos-lab/cosmos3/technical-report.pdf
- Web oficial Cosmos3: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Cosmos Framework: https://github.com/nvidia/cosmos-framework
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
