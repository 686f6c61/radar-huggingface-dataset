# Richopera/LiangZhirou-zh-gpt-sovits-v2proplus

## Resumen

LiangZhirou-zh-gpt-sovits-v2proplus es un modelo de síntesis de voz (text-to-speech) entrenado por Richopera mediante fine-tuning del paquete GPT-SoVITS v2ProPlus. Reproduce la voz del personaje Liang Zhirou (梁芷柔) del videojuego *Migrant*, interpretada por la actriz de doblaje 酒儿. No es un modelo de lenguaje general: es un checkpoint de voz específico que requiere un clip de referencia y su transcripción exacta en tiempo de inferencia para guiar el timbre y la dicción de la voz generada.

El modelo se compone de dos checkpoints complementarios: un módulo GPT (`梁芷柔-e15.ckpt`, 148 MiB) y un módulo SoVITS (`梁芷柔_e8_s4032.pth`, 165 MiB), que deben cargarse conjuntamente en un entorno GPT-SoVITS compatible con la versión v2ProPlus. Se entrenó exclusivamente con voz en chino (2.224 clips, 106 minutos y 59,146 segundos), aunque hereda la capacidad nativa de síntesis multilingüe de GPT-SoVITS.

Su relevancia es acotada: se trata de un modelo de voz de personaje, no comercial, con licencia propia restrictiva (Richopera Voice Model License v2.0) y sin descargas ni valoraciones en el momento de la ficha. Resulta útil para proyectos de doblaje amateur, fan works o investigación sobre clonación de voz few-shot con GPT-SoVITS, siempre respetando las condiciones de atribución y la prohibición de redistribuir pesos sin permiso escrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus (modelo GPT + modelo SoVITS/VITS para síntesis de voz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la referencia de audio recomendada es de 3–10 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | chino (zh); capacidad nativa de síntesis cross-lingual heredada de GPT-SoVITS |
| Licencia | Richopera Voice Model License v2.0 (uso personal y no comercial con atribución) |
| Formato de pesos | checkpoints PyTorch (`.ckpt` para GPT, `.pth` para SoVITS) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-SoVITS v2ProPlus, un pipeline de síntesis de voz que combina un módulo autorregresivo tipo GPT (encargado de modelar la secuencia de tokens acústicos a partir del texto y la referencia) con un módulo SoVITS (basado en VITS) que convierte esas representaciones en forma de onda. La inferencia es few-shot: se proporciona un clip de referencia limpio de 3–10 segundos junto con su transcripción exacta, y el modelo usa esa señal para condicionar timbre y estilo prosódico.

El entrenamiento se realizó con la configuración por defecto de GPT-SoVITS v2ProPlus sobre 2.224 clips de audio que suman 106 minutos y 59,146 segundos, compilados por jugadores a partir de las grabaciones originales del personaje. El módulo GPT se entrenó durante 15 épocas y el módulo SoVITS durante 8 épocas (4.032 pasos finales). El hardware empleado fue una NVIDIA GeForce RTX 5070 Laptop GPU de 8 GB, con CPU Intel Core Ultra 9 275HX a 2,70 GHz y 32 GB de RAM. No se documenta el uso de RLHF, DPO ni otras técnicas de alineación; tampoco se especifica el volumen total de tokens de audio ni la composición detallada del dataset más allá del recuento de clips y su duración.

## Capacidades

- Síntesis de voz (text-to-speech) en chino a partir de texto escrito, condicionada por un clip de referencia.
- Clonación de voz few-shot: reproduce el timbre y la dicción del clip de referencia proporcionado en inferencia.
- Síntesis cross-lingual nativa heredada de GPT-SoVITS (el texto objetivo y la referencia pueden estar en idiomas distintos, según la configuración del WebUI).
- Control de estilo y entrega mediante clips auxiliares de referencia adicionales.
- Generación de frases completas con mayor estabilidad que fragmentos muy cortos.
- No soporta tool calling, function calling, razonamiento multi-paso ni capacidades de agente: es un modelo puramente de voz.
- No dispone de modo thinking, visión ni audio de entrada más allá del clip de referencia.

## Casos de uso

- Doblaje amateur de fan works: generar líneas de diálogo del personaje Liang Zhirou para vídeos, mods o cortos, usando un clip de referencia de 3–10 segundos de la actuación original y respetando la atribución obligatoria a 酒儿 y a Richopera.
- Prototipado de voces de personaje en videojuegos independientes: evaluar cómo suena un personaje concreto antes de contratar a una actriz de doblaje, aprovechando la capacidad few-shot para iterar rápido sobre guiones.
- Investigación sobre clonación de voz few-shot: usar el par de checkpoints como caso de estudio de fine-tuning de GPT-SoVITS v2ProPlus con datasets pequeños (unas 2.224 muestras y menos de 2 horas de audio).
- Generación de audiolibros o contenido narrado no comercial: sintetizar texto largo en chino con una voz consistente, encadenando fragmentos y manteniendo el mismo clip de referencia para preservar el timbre.
- Localización de contenido: gracias a la síntesis cross-lingual de GPT-SoVITS, probar la voz del personaje sobre texto en otros idiomas manteniendo la referencia en chino, útil para demos de doblaje multilingüe.
- Docencia y demostraciones técnicas: ilustrar en talleres cómo funciona un pipeline GPT + SoVITS, la selección de checkpoints y el condicionamiento por referencia, sin necesidad de infraestructura de gran escala (el repo ocupa 0,8 GB y se entrenó en una GPU de 8 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento se completó en una GPU de 8 GB (RTX 5070 Laptop), por lo que la inferencia cabe previsiblemente en GPUs consumer de gama media, aunque no se documentan cifras exactas.
- GPU recomendadas: no disponible; cualquier GPU NVIDIA con al menos 8 GB de VRAM es un punto de partida razonable según el hardware de entrenamiento declarado.
- Cabe en GPU consumer: sí, según el hardware de entrenamiento (RTX 5070 Laptop, 8 GB); no se especifican modelos concretos adicionales.
- Opciones de despliegue: WebUI oficial de GPT-SoVITS compatible con v2ProPlus (requisito explícito del autor); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 0,8 GB; los checkpoints individuales son de 148 MiB (GPT) y 165 MiB (SoVITS).

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto/referencia | Disponibilidad |
|---|---|---|---|---|---|
| LiangZhirou-zh-gpt-sovits-v2proplus | GPT-SoVITS v2ProPlus (fine-tuning de voz) | zh (cross-lingual heredado) | Richopera Voice Model License v2.0 (no comercial, atribución) | Clip de referencia de 3–10 s | Hugging Face, 0 descargas, 0 likes |
| GPT-SoVITS base (lj1995/GPT-SoVITS-windows-package) | GPT-SoVITS (modelo base) | Multiidioma según versión | Según proyecto GPT-SoVITS | Clip de referencia few-shot | Hugging Face / GitHub |
| Otros fine-tunings de voz de personaje sobre GPT-SoVITS | GPT-SoVITS (fine-tuning) | Variable | Variable, habitualmente restrictiva | Clip de referencia few-shot | Hugging Face (comunidad) |

No se dispone de datos de rendimiento comparativo (métricas de calidad de voz, MOS, similitud de hablante) en la información proporcionada.

## Limitaciones y advertencias

- Modelo no oficial: no otorga derechos sobre las grabaciones originales, la imagen del personaje ni la actuación vocal de 酒儿.
- Licencia restrictiva: solo permite uso personal y no comercial, y publicación no comercial del audio generado con atribución; la redistribución de pesos originales o derivados requiere permiso escrito previo de Richopera.
- Atribución obligatoria al publicar: debe mostrarse de forma destacada «Character voice actor: 酒儿» y «Voice model trained by: Richopera».
- Riesgo de uso indebido: al ser un modelo de clonación de voz, puede emplearse para suplantación o deepfakes; la licencia no cubre esos usos y el autor no los autoriza.
- Dependencia de la referencia: la calidad depende críticamente de un clip limpio, seco, de un solo hablante y de 3–10 segundos, sin música ni reverberación; transcripciones inexactas degradan el resultado.
- Compatibilidad estricta de versión: los checkpoints solo funcionan en entornos GPT-SoVITS que soporten v2ProPlus; mezclarlos con versiones incompatibles provoca fallos de carga.
- Cobertura lingüística limitada en el entrenamiento: solo chino; la síntesis cross-lingual es una capacidad heredada del modelo base y no está validada para este fine-tuning concreto.
- Sin ejemplos de audio publicados ni métricas de calidad: no hay evidencia objetiva de fidelidad al personaje ni de estabilidad en frases largas.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la ficha, lo que limita la validación por terceros.
- No apto para tareas de lenguaje, razonamiento, código o agentes: es exclusivamente un modelo de voz.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/LiangZhirou-zh-gpt-sovits-v2proplus
- Proyecto GPT-SoVITS (GitHub): https://github.com/RVC-Boss/GPT-SoVITS
- Guía en chino de GPT-SoVITS: https://www.yuque.com/baicaigongchang1145haoyuangong/ib3g1e
- Modelo base: https://huggingface.co/lj1995/GPT-SoVITS-windows-package
- Página de *Migrant* en Steam: https://store.steampowered.com/app/1765350
- Perfil de 花儿不哭 en Bilibili: https://space.bilibili.com/5760446
- Perfil de 酒儿 en Bilibili: https://space.bilibili.com/207804
- Contacto del autor: richopera@outlook.com
