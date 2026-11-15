# Phoonnx/glowtts-en_us-glados

## Resumen

glowtts-en_us-glados es un modelo de síntesis de voz (text-to-speech) basado en la arquitectura Glow-TTS, desarrollado originalmente por Rhasspy como parte del proyecto Larynx y empaquetado en formato ONNX por Phoonnx para su uso con la librería `phoonnx`. El modelo genera espectrogramas a partir de fonemas IPA en inglés estadounidense (en-US), que posteriormente son convertidos a audio mediante el vocoder HiFi-GAN multi-VCTK small.

El modelo resuelve el problema de la síntesis de voz local y ligera: al estar empaquetado en ONNX y con un tamaño de repositorio de 0,1 GB, está pensado para ejecutarse en entornos con recursos limitados, como asistentes de voz embebidos (OVOS/Mycroft) o aplicaciones de escritorio. La voz corresponde al personaje GLaDOS del videojuego Portal, lo que le confiere un carácter distintivo orientado a proyectos creativos o de demostración.

Es relevante en el ecosistema de asistentes de voz open source porque se integra directamente con phoonnx y OVOS mediante el plugin `ovos-tts-plugin-phoonnx`, ofreciendo una alternativa local a servicios TTS en la nube. No obstante, la información pública disponible es muy limitada: no se detallan parámetros, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Glow-TTS (modelo acústico generativo basado en flujos normalizadores) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo TTS, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX) |
| Idiomas soportados | en-US (inglés estadounidense) |
| Licencia | other (sin licencia registrada; consultar upstream) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

Glow-TTS es un modelo de síntesis de voz que emplea flujos normalizadores (normalizing flows) para modelar la distribución del espectrograma mel condicionada al texto, junto con un mecanismo de alineamiento monotónico basado en atención (MAS, Monotonic Alignment Search) que aprende la alineación entre fonemas y frames de audio sin supervisión explícita. El modelo recibe fonemas IPA generados por el fonemizador gruut y produce un espectrograma que el vocoder HiFi-GAN (variante multi-VCTK small) convierte en forma de onda.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o ajuste fino adicional. El modelo original proviene del release v1.0 de Larynx de Rhasspy; el empaquetado en ONNX para phoonnx es obra de Phoonnx. No se documentan innovaciones técnicas adicionales más allá de la propia arquitectura Glow-TTS y el pipeline de fonemización con gruut.

## Capacidades

- Síntesis de voz a partir de texto en inglés estadounidense (en-US).
- Conversión de texto a fonemas IPA mediante el fonemizador gruut (`GruutPhonemizer` de `scriptconv`).
- Generación de espectrogramas mel que se convierten a audio con el vocoder HiFi-GAN multi-VCTK small.
- Integración con la librería phoonnx en Python.
- Integración con asistentes de voz OVOS mediante el plugin `ovos-tts-plugin-phoonnx`.
- Voz con timbre característico basado en el personaje GLaDOS.
- No soporta tool calling, agentes, visión, audio de entrada ni razonamiento multi-paso (es un modelo TTS puro).

## Casos de uso

- Asistentes de voz locales: integración en OVOS/Mycroft mediante `ovos-tts-plugin-phoonnx`, configurando la voz `larynx/en-us-glados-glow_tts` en `mycroft.conf` para respuestas habladas sin depender de la nube.
- Proyectos creativos y demos: la voz de GLaDOS resulta adecuada para prototipos, videojuegos, mods o instalaciones artísticas que busquen un timbre reconocible.
- Síntesis offline en dispositivos embebidos: el tamaño reducido del repositorio (0,1 GB) y el formato ONNX permiten ejecución en hardware modesto sin conexión.
- Generación de audiolibros o narraciones: para contenido en inglés estadounidense donde encaje el timbre del personaje.
- Pruebas de pipelines TTS: útil como modelo de referencia para validar flujos de fonemización con gruut y vocoder HiFi-GAN.
- Automatización de avisos o notificaciones por voz en aplicaciones de escritorio o domótica con OVOS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio (0,1 GB) sugiere un consumo muy bajo, apto para CPU.
- GPU recomendadas: no se especifican; por el tamaño del modelo, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es más que suficiente, y probablemente también CPU.
- Cabe en GPU consumer: sí, con amplio margen, dado el reducido tamaño del modelo.
- Opciones de despliegue: phoonnx (Python), ONNX Runtime, plugin `ovos-tts-plugin-phoonnx` para OVOS.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idioma | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| glowtts-en_us-glados (este) | Glow-TTS + HiFi-GAN | en-US | other (sin registrar) | ONNX | Hugging Face (Phoonnx) |
| Otras voces Larynx de Rhasspy | Glow-TTS + vocoder | varios | según release upstream | tarball / ONNX (empaquetadas por Phoonnx) | GitHub Rhasspy / Hugging Face |
| Piper (rhasspy) | VITS | varios | MIT (según modelo) | ONNX | Hugging Face / GitHub |

No se dispone de datos de rendimiento comparativo (benchmarks, MOS, latencia) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés estadounidense (en-US); no es multilingüe.
- Es un modelo TTS puro: no realiza razonamiento, generación de texto ni otras tareas.
- La licencia figura como "other" y no hay licencia registrada; es imprescindible verificar la licencia del release upstream de Larynx antes de cualquier uso, especialmente comercial.
- El timbre está inspirado en un personaje con derechos de propiedad intelectual (GLaDOS, Portal); su uso comercial puede plantear riesgos legales adicionales.
- No se documentan sesgos, tasas de alucinación (no aplica en el sentido habitual, pero puede producir pronunciaciones incorrectas) ni métricas de calidad.
- La información técnica (parámetros, datos de entrenamiento, benchmarks) es muy escasa; no se recomienda para producción sin una evaluación propia.
- Depende del fonemizador gruut y del vocoder HiFi-GAN multi-VCTK small, que deben estar disponibles en el pipeline.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/glowtts-en_us-glados
- Repositorio upstream (Larynx v1.0, Rhasspy): https://github.com/rhasspy/larynx/releases/download/v1.0/en-us_glados-glow_tts.tar.gz
- Librería phoonnx: https://github.com/TigreGotico/phoonnx
- Librería scriptconv: https://github.com/TigreGotico/scriptconv
- Colección Glow-TTS de Phoonnx: https://huggingface.co/collections/Phoonnx/glow-tts-6af8ea830386ac5f126ba7e3
- Vocoder HiFi-GAN multi-VCTK small: https://huggingface.co/Phoonnx/hifigan-multi-vctk-small
