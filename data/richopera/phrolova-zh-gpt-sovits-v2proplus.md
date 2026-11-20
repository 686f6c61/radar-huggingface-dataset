# Richopera/Phrolova-zh-gpt-sovits-v2proplus

## Resumen

Phrolova-zh-gpt-sovits-v2proplus es un modelo de síntesis de voz (text-to-speech) en chino que reproduce la voz del personaje Phrolova (弗洛洛) del videojuego *Wuthering Waves*, tal como la interpreta la actriz de doblaje 张琦. Lo desarrolla Richopera como un ajuste fino (finetune) sobre el paquete oficial GPT-SoVITS para Windows, empleando el flujo de trabajo v2ProPlus. No es un modelo de lenguaje general, sino un checkpoint de voz especializado en un único timbre.

El repositorio incluye dos generaciones de checkpoints: una primera de junio de 2026, entrenada con 278 clips (19 minutos y 29 segundos), y una versión "pro" de septiembre de 2026, recomendada, con 874 clips (53 minutos y 41 segundos) que cubren casi todas las líneas de voz del personaje disponibles. Ambas se entrenaron con 15 épocas de GPT y 8 de SoVITS, con pasos finales de SoVITS distintos (560 frente a 1.720) por la diferencia de tamaño del dataset.

Es relevante para quienes necesiten clonación de voz zero-shot en chino con un timbre concreto y control fino de la entrega mediante clips de referencia. Al heredar la capacidad multilingüe de GPT-SoVITS, permite generar audio en otros idiomas a partir de referencias en chino, aunque el modelo está entrenado y etiquetado exclusivamente para chino (zh).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus (modelo GPT + modelo SoVITS/VITS para síntesis de voz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la referencia de audio recomendada es de 3-10 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh (chino); capacidad de síntesis cruzada heredada de GPT-SoVITS hacia otros idiomas |
| Licencia | Richopera Voice Model License v2.0 (uso personal y no comercial; redistribución de pesos con permiso escrito previo) |
| Formato de pesos | checkpoints `.ckpt` (GPT) y `.pth` (SoVITS) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-SoVITS: un componente GPT que modela la secuencia de tokens semánticos a partir del texto y de una referencia de audio, y un componente SoVITS (basado en VITS) que convierte esos tokens en waveform. La inferencia es de tipo zero-shot con referencia: se proporciona un clip limpio de 3 a 10 segundos junto con su transcripción exacta, y el modelo usa ese par para guiar timbre y entrega de la voz generada. Se requiere un entorno GPT-SoVITS que soporte checkpoints v2ProPlus y cargar siempre GPT y SoVITS de la misma generación.

El entrenamiento se realizó con el flujo v2ProPlus y ajustes por defecto. La primera generación usó 278 clips (19 min 29,140 s) de gameplay grabado por jugadores y vídeos oficiales de Bilibili. La versión pro usó 874 clips (53 min 41 s) recopilados por jugadores con mayor calidad, con transcripciones verificadas de forma cruzada mediante texto oficial y salida de ASR. Ambas se entrenaron en un Intel Core Ultra 9 275HX a 2,70 GHz con 32 GB de RAM y una NVIDIA GeForce RTX 5070 Laptop GPU de 8 GB. No se documenta uso de RLHF ni DPO; es un finetune supervisado sobre el paquete base.

## Capacidades

- Síntesis de voz en chino con el timbre del personaje Phrolova, guiada por un clip de referencia y su transcripción.
- Clonación de voz zero-shot: el timbre y la entrega se controlan mediante la referencia, incluyendo clips auxiliares para matizar la interpretación.
- Síntesis cruzada de idiomas heredada de GPT-SoVITS: los ejemplos publicados incluyen texto en inglés y japonés generado desde un modelo entrenado en chino.
- Dos generaciones de checkpoints seleccionables para comparación auditiva (primera generación y pro).
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo puramente de TTS.
- No dispone de modo thinking, visión ni audio de entrada más allá del clip de referencia.

## Casos de uso

- Doblaje de contenido de fan en chino: generar líneas de voz del personaje para vídeos, cómics doblados o mods, usando clips de referencia limpios y respetando la atribución exigida por la licencia.
- Prototipado de voces para narrativa interactiva: integrar el checkpoint en una WebUI GPT-SoVITS para producir diálogos de un personaje concreto en demos de juego o ficción sonora no comercial.
- Pruebas de localización: generar el mismo texto en inglés o japonés con el timbre del personaje para evaluar cómo suena en otros idiomas antes de contratar doblaje real.
- Creación de audiolibros o pódcasts de fan: sintetizar pasajes largos por frases completas, que según el autor dan resultados más estables que frases cortas.
- Comparación de generaciones de modelos de voz: usar los dos checkpoints incluidos para evaluar por oído el impacto de un dataset mayor y más limpio (19 min frente a 53 min) en ruido de fondo y detalle en altas frecuencias.
- Investigación en clonación de voz de pocos recursos: estudiar el efecto del tamaño y la calidad del dataset en un pipeline GPT-SoVITS v2ProPlus con hiperparámetros fijos (15 épocas GPT, 8 SoVITS).
- Generación de avisos o mensajes cortos con un timbre identificable: los ejemplos publicados incluyen indicaciones de navegación, lo que muestra viabilidad para locuciones breves y claras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye ejemplos de audio generados con la primera generación y referencias a clips de escucha, sin métricas objetivas (MOS, similitud de hablante, WER) ni comparaciones cuantitativas.

## Requisitos de hardware

- El entrenamiento documentado se realizó con una RTX 5070 Laptop GPU de 8 GB, 32 GB de RAM y un Intel Core Ultra 9 275HX; esto indica que el ajuste fino cabe en GPU de consumo con 8 GB de VRAM.
- VRAM de inferencia estimada: no disponible de forma explícita; el tamaño del repo es de 1,1 GB, por lo que la inferencia es ligera y previsiblemente viable en GPU de consumo de gama media.
- GPU recomendadas: no disponible; por el perfil de entrenamiento, una GPU con 8 GB o más es suficiente para el flujo completo.
- Despliegue: WebUI de GPT-SoVITS que soporte checkpoints v2ProPlus; el proyecto oficial es https://github.com/RVC-Boss/GPT-SoVITS.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Contexto/referencia | Disponibilidad |
|---|---|---|---|---|---|
| Phrolova-zh-gpt-sovits-v2proplus | Finetune GPT-SoVITS v2ProPlus | zh (cruzado a otros) | Richopera Voice Model License v2.0 (no comercial) | Referencia de 3-10 s | Hugging Face |
| GPT-SoVITS (base, lj1995/GPT-SoVITS-windows-package) | Modelo base TTS | Multilingüe | Según proyecto original | Referencia de pocos segundos | GitHub / paquete Windows |
| Richopera/phrolova-rvc-v2 | Conversión de voz (RVC) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Modelo no oficial: no está afiliado a Kuro Games, a la actriz de doblaje ni a ningún titular de derechos; la licencia no concede derechos sobre las grabaciones originales, la imagen del personaje ni la interpretación vocal.
- Licencia restrictiva: solo permite uso personal y no comercial, y la publicación no comercial de audio generado con atribución; la redistribución de pesos originales o derivados requiere permiso escrito previo.
- Atribución obligatoria al publicar: debe mostrarse de forma destacada "Character voice actor: 张琦" y "Voice model trained by: Richopera".
- Entrenado exclusivamente con voz en chino; la calidad en otros idiomas depende de la capacidad cruzada de GPT-SoVITS y no está evaluada con métricas.
- Requiere referencia limpia de 3 a 10 segundos, sin música de fondo, reverberación ni múltiples hablantes; una referencia deficiente degrada el resultado.
- Riesgo de artefactos y alucinación acústica inherente a los modelos TTS generativos; no hay benchmarks publicados que cuantifiquen fidelidad o inteligibilidad.
- No mezclar checkpoints GPT y SoVITS de generaciones distintas; hacerlo provoca fallos de carga o resultados incorrectos.
- Los ejemplos de audio publicados corresponden solo a la primera generación; no hay muestras de la versión pro.
- Sesgos: al derivar de grabaciones de un personaje y una actriz concretos, el modelo reproduce sus características de habla y no es representativo de la diversidad lingüística del chino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/Phrolova-zh-gpt-sovits-v2proplus
- Modelo RVC del mismo autor: https://huggingface.co/Richopera/phrolova-rvc-v2
- Proyecto GPT-SoVITS: https://github.com/RVC-Boss/GPT-SoVITS
- Guía en chino de GPT-SoVITS: https://www.yuque.com/baicaigongchang1145haoyuangong/ib3g1e
- Modelo base: https://huggingface.co/lj1995/GPT-SoVITS-windows-package
- Juego de origen: https://wutheringwaves.kurogames.com/en/main/
- Licencia (inglés): LICENSE_en.md (en el repositorio)
- Licencia (chino): LICENSE.md (en el repositorio)
