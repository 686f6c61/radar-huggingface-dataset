# drowzeys/keys-ghost-machine-audio-visual-agent

## Resumen

keys-ghost-machine-audio-visual-agent es un paquete de 14 voces con nombre para Fish Audio Drama 3, el modelo de texto a voz que actúa como base. No es un modelo independiente: el repositorio de Hugging Face ocupa 0,0 GB y contiene únicamente códigos de referencia de voz en JSON y muestras WAV de previsualización. Lo publica drowzeys para Boo, el agente audio/visual del proyecto keys-ghost-machine, y Vesper es la voz predeterminada.

El artefacto resuelve un problema de reproducibilidad y selección de voces: en lugar de depender de la voz integrada aleatoria de Drama 3, ofrece 14 identidades vocales estables, con descripciones de tono y acento. Se sirve mediante TensorFold con la opción `--voices` y expone un endpoint HTTP compatible con `/v1/audio/speech`.

Es relevante para desarrolladores que ya despliegan Drama 3 y quieren una capa de voces nombradas para agentes conversacionales, narración o asistentes. Todas las voces son sintéticas, generadas por el propio modelo, y quedan sujetas a la Fish Audio Community License; el uso en servicios alojados que generan voz para terceros requiere una licencia aparte de Fish Audio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible para Drama 3; este repositorio no contiene pesos de modelo, solo códigos de voz y previsualizaciones |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE; no disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; se menciona un build NVFP4 pruned de Drama 3 de aproximadamente 21 GB |
| Idiomas soportados | Inglés (en) en las 14 voces |
| Licencia | Fish Audio Community License (other); los servicios alojados para terceros requieren licencia adicional de Fish Audio |
| Formato de pesos | JSON (códigos de referencia: `drama3-http-voice/1` y `drama3-voice/1`) y WAV (previews); no hay safetensors, GGUF ni pesos del modelo en este repositorio |
| Tamaño del repositorio | 0,0 GB |
| Pipeline | text-to-speech |

## Arquitectura y entrenamiento

Este repositorio no entrena ni publica un modelo nuevo. Las 14 voces son tomas de la voz integrada de Drama 3, generadas por el propio modelo; no interviene ninguna persona grabada. Para cada voz se generaron muchas tomas de una misma línea y se puntuaron según tono (pitch), tasa de error de palabras con Parakeet v3 y acento con SpeechBrain CommonAccent. Las tomas elegidas se codificaron con el códec de Drama 3 en códigos de referencia.

Hay dos formatos: `voices/mac/NAME.json` usa `drama3-http-voice/1` (códigos frame-major con descripción) para el build Metal de TensorFold en Apple silicon; `voices/spark/NAME.json` usa `drama3-voice/1` (códigos `[10, frames]` con `codes_sha256`) para el build CUDA de plotarmordev. La arquitectura, el número de parámetros y los datos de entrenamiento de Drama 3 no se detallan en la información disponible.

## Capacidades

- Síntesis de voz en inglés con 14 voces nombradas: Vesper, Elara, Lyra, Imogen, Seren, Aria, Oliver, Skye, Atlas, Milo, June, Nova, Sam y Wren.
- Acentos británico y estadounidense, con descripciones de tono y estilo para cada voz.
- Voz predeterminada Vesper (femenina británica, grave, suave y segura).
- Endpoint HTTP compatible con la ruta `/v1/audio/speech`, pensado para integrarse en aplicaciones y agentes.
- Salida en formato WAV mediante la API de TensorFold.
- Previsualizaciones `previews/NAME.wav` con una frase de muestra por voz.
- Integración con Boo, el agente audio/visual del proyecto keys-ghost-machine.
- No incluye tool calling, razonamiento, generación de código, matemáticas, visión ni entrada de audio; es un paquete de voces para texto a voz.
- No se documentan capacidades multilingües más allá del inglés.

## Casos de uso

- Agente conversacional Boo: usar Vesper como voz predeterminada para respuestas de Boo en inglés, aprovechando el endpoint HTTP de TensorFold para integrar la síntesis en el bucle del agente.
- Narración de audiolibros y storytelling: seleccionar Atlas para pasajes narrativos pausados y Vesper o Imogen para narración femenina, manteniendo una identidad vocal estable durante capítulos largos.
- Asistente de atención al cliente: emplear Sam, con tono claro y animado, en respuestas automatizadas de helpdesk en inglés; el endpoint permite generar audio bajo demanda desde un backend.
- Prototipado de personajes para videojuegos: alternar entre voces como Nova, Milo, Wren y Oliver para dar identidades diferenciadas a personajes no jugadores en demos y pruebas de concepto.
- Contenido educativo y explicativos: usar June o Imogen para locuciones conversacionales y articuladas en cursos, tutoriales o materiales de formación en inglés.
- Anuncios y notificaciones de producto: emplear Nova o Aria para mensajes breves y energéticos, o Skye para un tono más sobrio y constante.
- Doblaje de demos en inglés: elegir voces británicas como Elara, Lyra o Seren para presentaciones y vídeos promocionales dirigidos a audiencias del Reino Unido.
- Pruebas de integración TTS: levantar TensorFold con `--voices voices/mac` o `voices/spark` y validar la integración con una petición `curl` al endpoint `/v1/audio/speech`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos de Drama 3: aproximadamente 21 GB en el build NVFP4 pruned; alrededor de 28 GB en Mac con Apple silicon (macOS 26, Metal) y unos 21 GB en NVIDIA DGX Spark (CUDA 13).
- Stack completo de Boo: aproximadamente 79 GB en Mac (mínimo 96 GB de memoria unificada, recomendado 128 GB o más) y unos 61 GB en DGX Spark.
- VRAM estimada para inferencia: al menos unos 21 GB para los pesos de Drama 3; no hay datos oficiales confirmados para GPUs de consumo. Un build de 21 GB podría requerir 24 GB de VRAM o más, pero es una estimación no verificada.
- GPU recomendadas: Apple silicon con Metal y NVIDIA DGX Spark con CUDA 13. No se mencionan A100, H100 ni RTX 4090 en la información disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de los pesos y el stack completo sugieren requisitos altos de memoria.
- Opciones de despliegue: TensorFold con builds Metal y CUDA, y API HTTP compatible con `/v1/audio/speech`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Qué es | Parámetros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| keys-ghost-machine voices | Pack de 14 voces para Drama 3 | No aplica | No disponible | en | Fish Audio Community License | Hugging Face; 0 descargas y 0 likes |
| Fish Audio Drama 3 | Modelo TTS base | No disponible | No disponible | No disponible | Fish Audio Community License | Hugging Face |
| Drama 3 NVFP4 Pruned | Build cuantizado de Drama 3 | No disponible | No disponible | No disponible | No disponible | Hugging Face |

La comparación cuantitativa no está disponible: la información proporcionada no incluye parámetros, contexto ni benchmarks de Drama 3 ni de sus builds. La diferencia principal es que este repositorio no es un modelo, sino una capa de 14 voces nombradas y reproducibles sobre Drama 3.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere Drama 3 y TensorFold para funcionar.
- Solo soporta inglés según la model card; no se documentan otros idiomas.
- La licencia Fish Audio Community License impone restricciones; los servicios alojados que generan voz para terceros necesitan una licencia separada de Fish Audio.
- Las voces son sintéticas y no corresponden a personas reales, pero la síntesis de voz puede usarse de forma indebida para suplantación o spam.
- Representación limitada: mayoría de voces femeninas y acentos británico o estadounidense; no se documentan otras variedades.
- Sin datos de benchmarks, latencia, throughput ni límites de longitud de entrada.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la información.
- Los ficheros de voz están separados por plataforma (`mac` y `spark`); usar el formato equivocado puede provocar fallos de carga.
- El repositorio fue creado y actualizado en 2026 y no se documenta un historial de mantenimiento.
- La model card no detalla la arquitectura ni el proceso de entrenamiento de Drama 3.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/drowzeys/keys-ghost-machine-audio-visual-agent
- Modelo base Fish Audio Drama 3: https://huggingface.co/fishaudio/drama-3
- Build NVFP4 pruned de Drama 3: https://huggingface.co/plotarmordev/drama-3-NVFP4-Pruned
- Repositorio GitHub del agente Boo: https://github.com/drowzeys/keys-ghost-machine-audio-visual-agent
- TensorFold: https://github.com/plotarmordev/TensorFold
- Issues del proyecto: https://github.com/drowzeys/keys-ghost-machine-audio-visual-agent/issues
- Licencia Fish Audio Community License: https://huggingface.co/fishaudio/drama-3
