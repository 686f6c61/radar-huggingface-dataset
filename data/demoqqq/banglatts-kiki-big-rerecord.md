# demoqqq/banglatts-kiki-big-rerecord

## Resumen

Bangla TTS — Kiki Big Rerecord es un modelo de sintesis de voz (text-to-speech) para bengali construido sobre la arquitectura VITS y entrenado con el Coqui TTS Trainer. Lo publica el usuario `demoqqq` en Hugging Face y parte del modelo base EMTIAZZ Bangladeshi Bengali VITS, sobre el que se ha realizado un reentrenamiento completo con una voz nueva (no una mezcla de modelos previos). El objetivo es generar locucion sintetica en bengali con una identidad vocal concreta y distinta de las voces anteriores del mismo autor (Kiki, Rakib, Akib).

El entrenamiento utilizo un conjunto de 1.641 clips (220,0 minutos) de una persona leyendo el guion "KIKI HASAN Big", con batch 8 y 80 de las 90 epocas previstas (las 10 restantes se omitieron por decision del autor al considerar suficiente la calidad en la epoca 80). El checkpoint publicado corresponde al paso 15.500 (epocas 79-80).

La relevancia practica es acotada: se trata de un artefacto de voz para bengali distribuido en formato ONNX compatible con sherpa-onnx (fp32, 22.050 Hz) y con checkpoint completo de Coqui. No hay informacion sobre licencia, idiomas declarados ni pipeline en la ficha de Hugging Face, lo que limita su adopcion en produccion sin verificacion adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (text-to-speech end-to-end, Coqui TTS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no autoregresivo de texto) |
| Tipos de cuantizacion | ONNX fp32 publicado; no se documentan otras variantes |
| Idiomas soportados | bengali (segun la model card); no declarado en la ficha de HF |
| Licencia | no disponible |
| Formato de pesos | `.pth` (checkpoint Coqui Trainer), `.onnx` (sherpa-onnx), `config.json`, `tokens.txt`, `tokens_sherpa.txt` |
| Frecuencia de muestreo | 22.050 Hz |
| Vocabulario de tokens | 92 tokens |
| Tamano del repositorio | 1,1 GB |
| Checkpoint | `checkpoint_15500.pth` (paso 15.500, ~epoca 79-80 de 90) |

## Arquitectura y entrenamiento

El modelo emplea VITS, una arquitectura de sintesis de voz end-to-end que combina un encoder de texto, un predictor de duracion, un flujo normalizador y un decoder generativo (GAN) para producir waveform directamente a partir de fonemas/tokens. La implementacion corresponde al Coqui TTS Trainer, y el ONNX exportado sigue la ruta VITS de sherpa-onnx (`OfflineTts`).

El entrenamiento se realizo "from scratch" sobre el modelo base EMTIAZZ Bangladeshi Bengali VITS, con 1.641 clips (220,0 minutos) de una voz nueva leyendo el guion KIKI HASAN Big, batch 8, durante 80 epocas de 90 planificadas. No se documentan detalles sobre composicion del dataset mas alla del numero de clips y duracion, ni sobre uso de RLHF/DPO (no aplicable en TTS de este tipo). La model card indica explicitamente que la voz es nueva y no se ha mezclado con modelos anteriores. Se incluye una normalizacion de texto bengali previa a la sintesis: descomposicion de য়→য+়, ড়→ড+় y ঢ়→ঢ+়.

## Capacidades

- Sintesis de voz (TTS) en bengali a partir de texto escrito.
- Generacion de audio a 22.050 Hz en formato waveform.
- Parametros de inferencia ajustables: `noise_scale` 0,667, `noise_scale_w` 0,8, `length_scale` 1,0, `max_num_sentences` 1.
- Compatibilidad con sherpa-onnx mediante la ruta VITS (`OfflineTts`).
- Vocabulario de 92 tokens compartido con las voces Kiki v2, Rakib v2, triple-combined y Akib del mismo autor.
- No se documentan capacidades de clonacion de voz, control de emocion, multilenguaje, tool calling ni agentes (no aplicables a un modelo TTS de este tipo).

## Casos de uso

- Locucion de articulos y noticias en bengali: el modelo sintetiza frases completas a 22.050 Hz, adecuado para lectura de boletines o contenido editorial con una voz consistente.
- Audiolibros y narracion: con `max_num_sentences` a 1 y `length_scale` ajustable se puede encadenar la sintesis por frases para producir narraciones largas con prosodia estable.
- Asistentes de voz embebidos: el ONNX fp32 es compatible con sherpa-onnx, lo que permite desplegarlo en dispositivos con recursos limitados sin depender de frameworks Python pesados.
- Accesibilidad para hablantes de bengali: conversion de texto a voz para lectores de pantalla o interfaces de accesibilidad en aplicaciones dirigidas a ese idioma.
- Prototipado de IVR y sistemas telefonicos: la inferencia por frases con parametros de ruido y duracion ajustables encaja en flujos de respuesta de voz interactiva.
- Generacion de contenido multimedia: doblaje o locucion de videos y podcasts en bengali usando el checkpoint Coqui para integracion en pipelines de TTS existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (MOS, WER, MCD) ni comparaciones cuantitativas con otras voces.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el ONNX fp32 y el tamano de repositorio (1,1 GB) sugieren un modelo ligero que cabe holgadamente en GPUs de consumo, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente si, dado el tamano del artefacto, aunque no se documenta.
- Opciones de despliegue: sherpa-onnx (`OfflineTts`, ruta VITS) es la via documentada; el checkpoint `.pth` permite usar Coqui TTS para sintesis con `config.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Formato | Licencia | Contexto/observaciones |
|---|---|---|---|---|---|
| Bangla TTS — Kiki Big Rerecord | VITS (Coqui) | bengali | ONNX fp32, `.pth` | no disponible | 1.641 clips, 220 min, 80 epocas |
| Kiki v2 (mismo autor) | VITS (Coqui) | bengali | no disponible | no disponible | Voz distinta, mismo vocabulario de 92 tokens |
| Rakib v2 (mismo autor) | VITS (Coqui) | bengali | no disponible | no disponible | Voz distinta, mismo vocabulario de 92 tokens |
| Akib (mismo autor) | VITS (Coqui) | bengali | no disponible | no disponible | Voz distinta, mismo vocabulario de 92 tokens |
| EMTIAZZ Bangladeshi Bengali VITS (base) | VITS | bengali | no disponible | no disponible | Modelo base sobre el que se reentrena |

No se dispone de datos cuantitativos de rendimiento para establecer una comparacion objetiva con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia no esta declarada en la ficha de Hugging Face; no se puede asumir uso comercial sin consultar al autor.
- No se declaran idiomas en los metadatos de HF, aunque la model card indica bengali; el uso con texto en otros idiomas no esta soportado.
- El texto bengali debe normalizarse antes de la sintesis (descomposicion de য়, ড় y ঢ়); de lo contrario la calidad puede degradarse.
- El entrenamiento se detuvo en la epoca 80 de 90 por decision del autor; no hay evaluacion objetiva de la calidad final.
- Dataset pequeno (1.641 clips, 220 minutos) y una sola voz: riesgo de artefactos en fonemas o contextos poco representados y escasa variabilidad prosodica.
- Sin benchmarks publicados: no se puede verificar la calidad frente a otras voces bengali.
- Riesgo de alucinacion acustica (pronunciacion incorrecta, ruidos) inherente a los modelos TTS generativos, especialmente en entradas fuera de dominio.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion por parte de la comunidad.
- El checkpoint `.pth` esta ligado al `config.json` de Coqui; cambios en la configuracion de sintesis pueden alterar la salida.

## Enlaces

- Hugging Face: https://huggingface.co/demoqqq/banglatts-kiki-biki-big-rerecord (URL correcta: https://huggingface.co/demoqqq/banglatts-kiki-big-rerecord)
- sherpa-onnx: no disponible en la informacion proporcionada
- Coqui TTS: no disponible en la informacion proporcionada
- Modelo base EMTIAZZ Bangladeshi Bengali VITS: no disponible en la informacion proporcionada
