# Richopera/Shorekeeper-zh-gpt-sovits-v2proplus

## Resumen

Shorekeeper-zh-gpt-sovits-v2proplus es un modelo de síntesis de voz (text-to-speech) entrenado mediante fine-tuning de GPT-SoVITS v2ProPlus por el desarrollador Richopera. Reproduce la voz en chino del personaje Shorekeeper (守岸人) del videojuego *Wuthering Waves*, interpretada por la actriz de doblaje 唐雅菁. El modelo no es un LLM generativo de texto, sino un sistema TTS de dos componentes (GPT + SoVITS) que clona una voz a partir de un clip de referencia y su transcripción exacta.

El repositorio contiene dos checkpoints: el módulo GPT (`守岸人二-e15.ckpt`, 148 MiB) y el módulo SoVITS (`守岸人二_e8_s1144.pth`, 165 MiB), que deben cargarse conjuntamente en un entorno GPT-SoVITS compatible con v2ProPlus. El modelo se entrenó con 567 clips que suman 40 minutos y 4,410 segundos de audio, procedentes de grabaciones de partidas editadas y vídeos oficiales de Bilibili.

Es relevante para desarrolladores interesados en clonación de voz de personajes, doblaje automatizado y pipelines TTS con control fino de timbre y estilo, aunque su licencia restringe el uso comercial y la redistribución de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus (dos etapas: módulo GPT autorregresivo + módulo SoVITS de síntesis) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS guiado por clip de referencia de 3-10 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh); síntesis cruzada nativa de GPT-SoVITS hacia otros idiomas |
| Licencia | Richopera Voice Model License v2.0 |
| Formato de pesos | checkpoints PyTorch (`.ckpt` y `.pth`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-SoVITS v2ProPlus, compuesta por un módulo GPT que modela la secuencia de tokens acústicos condicionada por el texto y un clip de referencia, y un módulo SoVITS que convierte esas representaciones en waveform. La inferencia requiere proporcionar un clip de referencia limpio (3-10 s, un solo hablante, sin música ni reverberación) junto con su transcripción exacta, que guía el timbre y la dicción de la salida.

El entrenamiento utilizó la configuración por defecto de GPT-SoVITS v2ProPlus: 15 épocas para el módulo GPT y 8 épocas (1.144 pasos finales) para SoVITS. El conjunto de datos consta de 567 clips (40 min 4,410 s) extraídos de grabaciones de gameplay editadas manualmente y vídeos oficiales de Bilibili. El entrenamiento se realizó en una NVIDIA GeForce RTX 5070 Laptop GPU (8 GB), CPU Intel Core Ultra 9 275HX y 32 GB de RAM. No se documenta uso de RLHF ni DPO; es un fine-tuning supervisado sobre el paquete base `lj1995/GPT-SoVITS-windows-package`.

## Capacidades

- Síntesis de voz en chino que reproduce el timbre y estilo del personaje Shorekeeper.
- Clonación de voz guiada por referencia: el timbre y la dicción se controlan mediante un clip de audio y su transcripción.
- Síntesis cruzada de idiomas nativa de GPT-SoVITS (se documentan ejemplos en inglés y japonés).
- Control de velocidad de habla en inferencia (se recomienda bajar de 1.0 para chino).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un LLM).
- No dispone de modo thinking, visión ni audio de entrada más allá del clip de referencia.

## Casos de uso

- Doblaje de contenido de fan para *Wuthering Waves*: generar líneas de voz del personaje para vídeos, mods o cortometrajes, usando clips de referencia del propio personaje para mantener coherencia de timbre.
- Producción de audiolibros o narraciones con voz de personaje: el modelo permite sintetizar párrafos largos manteniendo el estilo, ajustando la velocidad para chino.
- Prototipado de asistentes de voz con personalidad: integración en un pipeline TTS para dar una voz consistente a un personaje virtual en demos interactivas.
- Localización de contenido: aprovechar la síntesis cruzada de GPT-SoVITS para generar la misma voz de personaje en inglés o japonés a partir de una referencia en chino.
- Creación de contenido para redes: generar clips de audio cortos con atribución obligatoria (actriz de voz 唐雅菁 y modelo de Richopera) para publicaciones no comerciales.
- Investigación en clonación de voz de pocos datos: el modelo sirve como caso de estudio de fine-tuning con ~40 minutos de audio en hardware de consumo (RTX 5070 Laptop, 8 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; los checkpoints son pequeños (148 MiB + 165 MiB) y el entrenamiento se realizó con una GPU de 8 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GB para entrenamiento; para inferencia se ha validado en RTX 5070 Laptop (8 GB). No se documentan pruebas en A100/H100.
- Cabe en GPU de consumo: sí, según el hardware de entrenamiento declarado (RTX 5070 Laptop, 8 GB).
- Opciones de despliegue: WebUI de GPT-SoVITS compatible con checkpoints v2ProPlus; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Licencia | Contexto/Referencia | Disponibilidad |
|---|---|---|---|---|---|
| Shorekeeper-zh-gpt-sovits-v2proplus | TTS GPT-SoVITS v2ProPlus (fine-tune) | zh (+ síntesis cruzada) | Richopera Voice Model License v2.0 (no comercial) | Clip de referencia 3-10 s | Hugging Face |
| GPT-SoVITS v2ProPlus base (RVC-Boss) | TTS GPT-SoVITS | multilingüe | según proyecto GPT-SoVITS | Clip de referencia | GitHub / Hugging Face |
| Phrolova-zh-gpt-sovits-v2proplus (Richopera) | TTS GPT-SoVITS v2ProPlus (fine-tune) | zh | Richopera Voice Model License v2.0 | Clip de referencia | Hugging Face |

No se dispone de datos de benchmarks para comparar rendimiento objetivo entre estos modelos.

## Limitaciones y advertencias

- Sesgos: al ser un fine-tune sobre una única voz de personaje, no generaliza a otros hablantes ni estilos fuera del material de entrenamiento.
- Alucinación/artefactos: el autor advierte que las terminaciones de frase pueden sonar mecánicas, probablemente por el efecto de radio presente en las escenas de historia usadas como datos.
- Limitaciones de idioma: el modelo está entrenado en chino; la salida en otros idiomas depende de la capacidad de síntesis cruzada de GPT-SoVITS y puede degradarse (el inglés se rompe a velocidad 0.8).
- Licencia: solo permite uso personal no comercial y publicación no comercial de audio generado con atribución; la redistribución de pesos originales o derivados requiere permiso escrito previo.
- Derechos: es un modelo no oficial, no afiliado a Kuro Games ni a la actriz de voz; la licencia no otorga derechos sobre las grabaciones originales, la imagen del personaje ni la interpretación vocal.
- Producción: requiere un entorno GPT-SoVITS con soporte v2ProPlus y no mezclar checkpoints de otras versiones; verificar hashes SHA-256 tras la descarga.
- Atribución obligatoria al publicar: mostrar de forma destacada "Character voice actor: 唐雅菁" y "Voice model trained by: Richopera".

## Enlaces

- Hugging Face: https://huggingface.co/Richopera/Shorekeeper-zh-gpt-sovits-v2proplus
- GPT-SoVITS (GitHub): https://github.com/RVC-Boss/GPT-SoVITS
- Guía en chino de GPT-SoVITS: https://www.yuque.com/baicaigongchang1145haoyuangong/ib3g1e
- Modelo base: https://huggingface.co/lj1995/GPT-SoVITS-windows-package
- Modelo Phrolova del mismo autor: https://huggingface.co/Richopera/Phrolova-zh-gpt-sovits-v2proplus
- Wuthering Waves: https://wutheringwaves.kurogames.com/en/main/
- Bilibili de 花儿不哭: https://space.bilibili.com/5760446
- Bilibili de 唐雅菁: https://space.bilibili.com/17840919
- Contacto: richopera@outlook.com
