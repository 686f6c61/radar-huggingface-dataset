# Richopera/Shimeng-gpt-sovits-v2proplus

## Resumen

Shimeng (诗萌) es un modelo de síntesis de voz (text-to-speech) en chino que reproduce la voz del personaje Shimeng, interpretado por la actriz de doblaje 可可味 kokomi en los videojuegos *Transparent Her* y *妹控计划*. Lo desarrolla Richopera como un ajuste fino (fine-tune) sobre el paquete oficial GPT-SoVITS, concretamente sobre la variante de checkpoints v2ProPlus. No es un modelo de lenguaje general, sino un artefacto de clonación de voz de un personaje concreto: recibe un clip de referencia con su transcripción exacta y genera audio nuevo con ese timbre y estilo de dicción.

El modelo se distribuye como un par de checkpoints (uno GPT y otro SoVITS) que deben cargarse conjuntamente en un entorno GPT-SoVITS compatible con v2ProPlus. El repositorio ocupa 1,5 GB, aunque los checkpoints recomendados suman unos 313 MiB. El entrenamiento se realizó con 5.334 clips (6 h 5 min 20 s) recopilados por jugadores, con transcripciones cruzadas contra texto oficial y ASR, y revisión manual de las discrepancias.

Su relevancia es acotada pero clara: es un ejemplo de fine-tune de voz de personaje con un dataset relativamente grande y cuidado, publicado con una licencia propia restrictiva (Richopera Voice Model License v2.0) que limita el uso a fines no comerciales y exige atribución. No hay métricas de calidad publicadas ni demo de audio disponible en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus (dos componentes: GPT para modelado de secuencia y SoVITS para síntesis de voz) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del clip de referencia, recomendado 3-10 s) |
| Tipos de cuantizacion | no disponible (checkpoints en precisión original, `.ckpt` y `.pth`) |
| Idiomas soportados | chino (`zh`) para entrenamiento; herencia de síntesis cross-language nativa de GPT-SoVITS |
| Licencia | Richopera Voice Model License v2.0 (uso personal no comercial, atribución obligatoria, redistribución de pesos con permiso escrito) |
| Formato de pesos | `.ckpt` (GPT) y `.pth` (SoVITS) |
| Tamano del repositorio | 1,5 GB |
| Checkpoint GPT recomendado | `诗萌pro-e10.ckpt` (~148 MiB) |
| Checkpoint SoVITS recomendado | `诗萌pro_e8_s3568.pth` (~165 MiB) |
| Epocas de entrenamiento | GPT: 10; SoVITS: 8 (paso final 3.568) |
| Dataset de entrenamiento | 5.334 clips, 6 h 5 min 20,179 s |
| Hardware de entrenamiento | Intel Xeon E5-2699 v4, 43 GB RAM, NVIDIA RTX 3090 (24 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-SoVITS, un sistema de TTS de dos etapas que combina un módulo GPT (modelado autorregresivo de tokens de audio condicionado por texto y referencia) con SoVITS (síntesis de voz basada en VITS con adaptación de timbre). La variante v2ProPlus es una revisión de checkpoints del proyecto GPT-SoVITS que mejora la estabilidad y la fidelidad del timbre respecto a versiones anteriores; los checkpoints de esta variante no son intercambiables con los de otras versiones.

El ajuste fino se realizó con la configuración por defecto de GPT-SoVITS v2ProPlus: 10 épocas para el componente GPT y 8 para SoVITS (3.568 pasos finales). El corpus consta de 5.334 clips de grabaciones recopiladas por jugadores, con una duración total de 6 h 5 min 20,179 s. Las transcripciones se verificaron automáticamente contra el texto oficial y la salida de ASR, y las discrepancias se revisaron manualmente, lo que según el autor convierte este dataset en el primero que considera de alta calidad en su totalidad. No se documenta uso de RLHF, DPO ni técnicas de alineación adicionales; el entrenamiento es un fine-tune supervisado estándar sobre el modelo base.

## Capacidades

- Síntesis de voz (TTS) en chino con clonación de timbre a partir de un clip de referencia de 3 a 10 segundos.
- Control de estilo y dicción mediante el clip de referencia y su transcripción exacta; clips auxiliares adicionales pueden reforzar el timbre y la entonación.
- Síntesis cross-language nativa heredada de GPT-SoVITS (el autor indica que el modelo la hereda, aunque el entrenamiento sea solo en chino).
- Generación de frases completas con mayor estabilidad que fragmentos cortos.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo puramente generativo de audio.
- No dispone de modo thinking, visión ni audio de entrada más allá del clip de referencia.
- Capacidad multilingüe limitada al chino entrenado y a la herencia cross-language del framework base; no hay evaluación publicada de calidad en otros idiomas.

## Casos de uso

- Doblaje no comercial de contenido de fan: generar líneas de voz del personaje para vídeos, mods o cortometrajes de aficionados, usando un clip de referencia del propio personaje y respetando la atribución exigida por la licencia.
- Producción de audio para proyectos de ficción sonora: narrar escenas con la voz del personaje a partir de guiones en chino, aprovechando la estabilidad en frases completas.
- Prototipado de videojuegos amateur: integrar el modelo en un pipeline GPT-SoVITS para generar diálogos de personaje en demos o prototipos no comerciales.
- Investigación en clonación de voz: servir como caso de estudio de fine-tune con dataset curado (5.334 clips, transcripciones verificadas) para comparar metodologías de preparación de datos.
- Evaluación de robustez de TTS: probar el comportamiento del modelo con distintos clips de referencia (longitud, ruido, hablantes múltiples) para caracterizar límites del enfoque GPT-SoVITS v2ProPlus.
- Contenido educativo sobre derechos de voz: ilustrar buenas prácticas de atribución y licenciamiento en modelos de voz derivados de personajes con derechos de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye métricas objetivas (MOS, similitud de hablante, WER) ni comparaciones cuantitativas con otros modelos; los ejemplos de audio estaban "en preparación" en el momento de la publicación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los checkpoints suman ~313 MiB, pero GPT-SoVITS requiere cargar además los modelos auxiliares del framework (vocoder, encoder de referencia), por lo que el consumo real es mayor y depende de la configuración del entorno.
- GPU de entrenamiento documentada: NVIDIA RTX 3090 (24 GB), junto con Intel Xeon E5-2699 v4 y 43 GB de RAM.
- GPU recomendadas: no disponibles; por analogía con GPT-SoVITS, una GPU consumer con 8-12 GB de VRAM suele ser suficiente para inferencia, pero el autor no lo confirma.
- ¿Cabe en GPU consumer? No confirmado por el autor; el entrenamiento se hizo en una RTX 3090.
- Opciones de despliegue: WebUI de GPT-SoVITS compatible con checkpoints v2ProPlus (requisito explícito del autor); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones comparables en la información proporcionada para establecer una comparativa cuantitativa con otros modelos de voz. Cualitativamente:

| Modelo | Tipo | Idioma | Licencia | Notas |
|---|---|---|---|---|
| Shimeng GPT-SoVITS v2ProPlus (este) | Fine-tune de voz de personaje | zh | Richopera Voice Model License v2.0 (no comercial) | Checkpoints GPT + SoVITS, 6 h de datos, sin benchmarks |
| GPT-SoVITS base (lj1995/GPT-SoVITS-windows-package) | Framework TTS | Multiidioma | Según proyecto GPT-SoVITS | Modelo base sobre el que se ajusta; sin datos de rendimiento en esta ficha |
| Alternativas de TTS open source (p. ej. XTTS, Bark, Fish Speech) | TTS / clonación | Multiidioma | Variables | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Licencia restrictiva: Richopera Voice Model License v2.0 permite uso personal no comercial y publicación no comercial de audio generado con atribución; la redistribución de pesos originales o derivados requiere permiso escrito previo. El uso comercial no está permitido sin autorización.
- Atribución obligatoria al publicar audio: debe mostrarse de forma destacada "Character voice actor: 可可味 kokomi" y "Voice model trained by: Richopera".
- El modelo es no oficial y no está afiliado a los desarrolladores de los juegos, a la actriz de voz ni a otros titulares de derechos; la licencia no concede derechos sobre las grabaciones originales, la imagen del personaje ni la interpretación vocal.
- Riesgo de uso indebido: al ser clonación de una voz real, existe riesgo de suplantación o deepfakes; la licencia no cubre esos usos y el autor no ofrece salvaguardas técnicas documentadas.
- Limitaciones de idioma: entrenado solo en chino; la calidad en otros idiomas depende de la herencia cross-language de GPT-SoVITS y no está evaluada.
- Dependencia de la referencia: la calidad depende críticamente de un clip limpio de 3-10 s, sin música, reverberación ni múltiples hablantes; clips inadecuados degradan el resultado.
- Compatibilidad estricta: los checkpoints solo funcionan en entornos GPT-SoVITS que soporten v2ProPlus y deben cargarse en par; mezclarlos con otras versiones provoca fallos.
- Sin benchmarks ni ejemplos de audio publicados: no hay evidencia objetiva de calidad (MOS, similitud de hablante) ni demo verificable.
- Riesgo de alucinación acústica: como todo TTS generativo, puede producir artefactos, prosodia incorrecta o pronunciación errónea en textos fuera de dominio.
- Sesgos: no documentados por el autor; el dataset proviene de grabaciones de jugadores, lo que puede introducir sesgos de dominio (registro coloquial, ruido de fondo variable).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/Shimeng-gpt-sovits-v2proplus
- Proyecto GPT-SoVITS: https://github.com/RVC-Boss/GPT-SoVITS
- Guía en chino de GPT-SoVITS: https://www.yuque.com/baicaigongchang1145haoyuangong/ib3g1e
- Modelo base: https://huggingface.co/lj1995/GPT-SoVITS-windows-package
- Juego *Transparent Her* (Steam): https://store.steampowered.com/app/3021350
- Juego *妹控计划* (Steam): https://store.steampowered.com/app/4169160/
- Perfil de 花儿不哭 (Bilibili): https://space.bilibili.com/5760446
- Perfil de 可可味 kokomi (Bilibili): https://space.bilibili.com/198439
- Contacto del autor: richopera@outlook.com
