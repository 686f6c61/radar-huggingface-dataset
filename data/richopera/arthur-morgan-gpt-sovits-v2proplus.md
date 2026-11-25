# Richopera/Arthur-Morgan-gpt-sovits-v2proplus

## Resumen

Arthur-Morgan-gpt-sovits-v2proplus es un modelo de síntesis de voz (text-to-speech) entrenado con el framework GPT-SoVITS v2ProPlus para reproducir la voz del personaje Arthur Morgan del videojuego *Red Dead Redemption 2*, interpretado por Roger Clark. Lo desarrolla Richopera, autor independiente, y deriva de un fine-tuning sobre el paquete base `lj1995/GPT-SoVITS-windows-package`. El modelo resuelve un problema acotado: clonación de voz few-shot con timbre y estilo de un hablante concreto a partir de un clip de referencia y su transcripción exacta.

El repositorio contiene cinco checkpoints (tres del componente GPT y dos del componente SoVITS), con un par recomendado (`亚瑟2-e15.ckpt` y `亚瑟2_e8_s2648.pth`) que suman unos 313 MiB y un repositorio total de 0,8 GB. El entrenamiento se realizó con ajustes por defecto de GPT-SoVITS v2ProPlus sobre 3.910 clips que totalizan 9 h 30 min 48,367 s de audio en inglés, extraídos de recopilaciones de YouTube que cubren casi todos los diálogos del personaje.

Por su naturaleza, es un modelo de nicho orientado a doblaje, mods, contenido fan y experimentación con clonación de voz, no un modelo de propósito general. La licencia (Richopera Voice Model License v2.0) restringe el uso a fines personales y no comerciales, exige atribución y prohíbe redistribuir pesos sin permiso escrito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-SoVITS v2ProPlus (componente GPT + componente SoVITS; TTS few-shot) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionado por el clip de referencia, recomendado 3–10 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (entrenamiento); síntesis cross-language nativa de GPT-SoVITS |
| Licencia | Richopera Voice Model License v2.0 (uso personal/no comercial, atribución obligatoria, redistribución de pesos con permiso escrito) |
| Formato de pesos | checkpoints `.ckpt` (GPT) y `.pth` (SoVITS) |
| Tamano del repositorio | 0,8 GB |
| Checkpoint GPT recomendado | `亚瑟2-e15.ckpt` (148,12 MiB) |
| Checkpoint SoVITS recomendado | `亚瑟2_e8_s2648.pth` (164,76 MiB) |
| Modelo base | `lj1995/GPT-SoVITS-windows-package` (fine-tune) |
| Pipeline | text-to-speech |
| Dataset de entrenamiento | `Richopera/Arthur-Morgan-voice` (3.910 clips, 9 h 30 min 48,367 s) |
| Descargas / likes | 12 / 0 |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT-SoVITS en su variante v2ProPlus, que combina un componente autorregresivo tipo GPT (predicción de tokens acústicos a partir de texto y referencia) con un componente SoVITS (modelo generativo de voz condicionado, derivado de VITS/SoVITS). El flujo de inferencia requiere un clip de referencia de 3 a 10 segundos, limpio, de un único hablante y sin música ni reverberación, junto con su transcripción exacta; ese par referencia+transcripción guía el timbre y la dicción de la salida. No se dispone de detalles adicionales sobre número de parámetros, capas o mecanismos de atención en la información proporcionada.

El entrenamiento usó los ajustes por defecto de GPT-SoVITS v2ProPlus: 15 épocas para el componente GPT y 8 épocas para SoVITS (2.648 pasos finales). El dataset son 3.910 clips en inglés recopilados por jugadores desde YouTube, cubriendo casi la totalidad del diálogo del personaje. El hardware de entrenamiento fue una CPU Intel Xeon E5-2686 v4 a 2,30 GHz (30 núcleos lógicos), 64 GB de RAM y una GPU NVIDIA RTX 4090D de 24 GB. No se documentan etapas de RLHF, DPO ni decodificación especulativa; el modelo es un fine-tuning de TTS, no un LLM.

## Capacidades

- Síntesis de voz en inglés con clonación de timbre y estilo a partir de un clip de referencia y su transcripción.
- Clonación few-shot: no requiere un dataset grande en inferencia, basta con 3–10 s de audio limpio de referencia.
- Síntesis cross-language nativa de GPT-SoVITS (el modelo hereda esta capacidad del framework base, aunque el entrenamiento fue en inglés).
- Reproducción de la dicción y el timbre del personaje Arthur Morgan (voz de Roger Clark).
- Generación de audio a partir de texto objetivo, con control de idioma de referencia y de texto objetivo por separado en la WebUI.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada; es exclusivamente TTS.
- No dispone de modo "thinking" ni capacidades multimodales más allá de la voz.

## Casos de uso

- Doblaje fan de mods de *Red Dead Redemption 2*: el modelo permite generar nuevas líneas de diálogo con la voz del personaje para mods narrativos, usando clips de referencia del propio juego para mantener coherencia de timbre.
- Producción de contenido audiovisual en YouTube/Twitch: creadores pueden narrar escenas o vídeos con la voz del personaje, cumpliendo la atribución obligatoria a Roger Clark y a Richopera.
- Experimentación con clonación de voz few-shot: investigadores y aficionados pueden estudiar cómo un clip de 3–10 s condiciona timbre y prosodia en el pipeline GPT-SoVITS v2ProPlus.
- Prototipado de pipelines TTS en local: al ser un modelo de ~0,3 GB de checkpoints, puede ejecutarse en una estación de trabajo con GPU consumer para probar integraciones en herramientas de audio.
- Pruebas de verificación de checkpoints: los SHA-256 publicados permiten validar descargas e integrar el modelo en flujos de CI con comprobación de integridad.
- Comparación de variantes de checkpoint: los cinco checkpoints (e5, e10, e15 de GPT y e4_s1324, e8_s2648 de SoVITS) permiten evaluar el compromiso entre épocas y calidad de síntesis.
- Docencia sobre licencias de modelos de voz: el caso ilustra restricciones de uso no comercial, atribución y permisos de redistribución de pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; los checkpoints recomendados suman ~313 MiB, pero el consumo depende del runtime GPT-SoVITS y del clip de referencia.
- GPU recomendadas: no disponible; el autor documenta una RTX 4090D (24 GB) para entrenamiento, no para inferencia.
- Compatibilidad con GPU consumer: previsiblemente sí, dado el tamaño reducido de los checkpoints, pero no hay datos oficiales de VRAM mínima.
- Opciones de despliegue: WebUI de GPT-SoVITS que soporte checkpoints v2ProPlus (requisito explícito del autor); no se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arthur-Morgan-gpt-sovits-v2proplus | TTS few-shot (GPT-SoVITS v2ProPlus) | no disponible | condicionado por clip de referencia (3–10 s) | Richopera Voice Model License v2.0 (no comercial) | Hugging Face, 12 descargas |
| GPT-SoVITS base (`lj1995/GPT-SoVITS-windows-package`) | TTS few-shot | no disponible | condicionado por clip de referencia | según proyecto GPT-SoVITS | GitHub / Hugging Face |
| Alternativas TTS few-shot de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables equivalentes en la información proporcionada; la comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Licencia restrictiva: solo permite uso personal y no comercial, y publicación no comercial de obras generadas con atribución; la redistribución de pesos originales o derivados requiere permiso escrito previo.
- Atribución obligatoria al publicar audio o vídeo: "Character voice actor: Roger Clark" y "Voice model trained by: Richopera".
- Modelo no oficial: no está afiliado a ningún titular de derechos; el uso debe verificar por separado los permisos sobre las grabaciones originales, la imagen del personaje y la interpretación vocal.
- Prohibición explícita de uso para fraude, suplantación de identidad o actividades ilícitas.
- Entrenado solo en inglés: la calidad en otros idiomas no está garantizada, aunque el framework base soporta síntesis cross-language.
- Dependencia de la referencia: la calidad depende críticamente de un clip de 3–10 s limpio, de un único hablante y sin música ni reverberación; referencias ruidosas degradan el resultado.
- Compatibilidad estricta de checkpoints: no se deben mezclar checkpoints de distintas versiones; los GPT y SoVITS deben cargarse juntos y en un entorno que soporte v2ProPlus.
- Riesgo de alucinación acústica y artefactos: no hay métricas publicadas de fidelidad, naturalidad (MOS) ni inteligibilidad, por lo que la calidad no está cuantificada.
- Sesgos: no se documentan sesgos específicos, pero al derivar de un único hablante y de un corpus de videojuego, la cobertura prosódica y de registros es limitada.
- Ejemplos de audio "en preparación": no hay demos publicadas para evaluar subjetivamente la salida.
- Bajo soporte comunitario: 0 likes y 12 descargas, con contacto por email y WeChat y tiempos de respuesta no garantizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Richopera/Arthur-Morgan-gpt-sovits-v2proplus
- Dataset de voz: https://huggingface.co/datasets/Richopera/Arthur-Morgan-voice
- Modelo base: https://huggingface.co/lj1995/GPT-SoVITS-windows-package
- Proyecto GPT-SoVITS (GitHub): https://github.com/RVC-Boss/GPT-SoVITS
- Guía en chino de GPT-SoVITS: https://www.yuque.com/baicaigongchang1145haoyuangong/ib3g1e
- Licencia (inglés): LICENSE_en.md (en el repositorio)
- Licencia (chino): LICENSE.md (en el repositorio)
- README en chino: README_zh.md (en el repositorio)
- Página del videojuego: https://www.rockstargames.com/reddeadredemption2
- Roger Clark (YouTube): https://www.youtube.com/@rogerclarkactor
- Evil Banana 202 (YouTube): https://www.youtube.com/@EvilBanana202
- 花儿不哭 (Bilibili): https://space.bilibili.com/5760446
- 古诺德箭 (Bilibili): https://space.bilibili.com/249441690
