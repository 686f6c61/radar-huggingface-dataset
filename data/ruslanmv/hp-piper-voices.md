# ruslanmv/hp-piper-voices

## Resumen

`ruslanmv/hp-piper-voices` es un repositorio espejo (mirror) de modelos de síntesis de voz (text-to-speech) del proyecto Piper, mantenido por Ruslan Magana Vsevolodovna para el ecosistema HomePilot. No se trata de un modelo entrenado por el autor, sino de una copia de recuperación de 49 voces Piper en formato ONNX, procedentes de repositorios upstream como `diffusionstudio/piper-voices`, `rhasspy/piper-voices` y `kirys79/piper_italiano`. Su función es garantizar la disponibilidad de las voces si las fuentes originales se deprecan o desaparecen.

El repositorio cubre seis idiomas (inglés US y UK, español, francés, alemán, italiano y portugués brasileño) repartidos en nueve locales. Cada voz se distribuye como un par de ficheros: el modelo ONNX y su configuración JSON asociada. El tamaño total del repositorio es de 3,2 GB, lo que refleja la suma de todas las voces incluidas.

La relevancia de este repositorio es práctica más que investigadora: sirve como fuente estable de TTS para aplicaciones que dependen de Piper, especialmente el chatbot con avatar 3D, el sistema de personas HomePilot y la pasarela OllaBridge. La licencia global es MIT, aunque cuatro voces concretas tienen licencias Creative Commons con requisitos de atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Piper TTS (modelos acústicos neuronales ligeros, exportados a ONNX) |
| Parametros totales | no disponible (varía por voz; Piper usa modelos compactos, típicamente de pocos millones de parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS por fragmentos; no aplica contexto de LLM) |
| Tipos de cuantizacion | no disponible (se distribuyen calidades "medium" y "high" según la voz) |
| Idiomas soportados | en (US y UK), es, fr, de, it, pt (BR) |
| Licencia | MIT global; excepciones CC BY 4.0 y CC BY-SA 4.0 en cuatro voces |
| Formato de pesos | ONNX (`.onnx`) con configuración `.onnx.json` |

## Arquitectura y entrenamiento

Los modelos incluidos son voces Piper, un sistema de TTS neuronal orientado a inferencia local y de baja latencia. Piper emplea modelos acústicos compactos exportados a ONNX, pensados para ejecutarse en CPU y en entornos embebidos o web (WASM). Cada voz se entrena sobre un dataset de habla concreto y se distribuye en distintas calidades (por ejemplo, `medium` y `high`), que intercambian tamaño por fidelidad de síntesis.

Este repositorio no documenta detalles de entrenamiento propios: es un espejo. Las voces provienen de `rhasspy/piper-voices` (commit `e7229f7`), de `diffusionstudio/piper-voices` (formato ONNX optimizado para web) y de `kirys79/piper_italiano` (commit `37020d3`). Algunas voces derivan de datasets conocidos como OpenSLR 61 (español argentino) o Multilingual LibriSpeech italiano. No se especifican números de tokens, composición de dataset ni etapas de RLHF/DPO en la información disponible.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto en seis idiomas.
- Generación de audio en formato ONNX, ejecutable en CPU y en navegador vía WASM.
- Voces diferenciadas por hablante y calidad (por ejemplo, `it_IT-serena-medium` y `it_IT-serena-high`).
- Integración con el ecosistema HomePilot (avatar 3D, sistema de personas, pasarela OllaBridge).
- Soporte multilingüe: inglés US/UK, español, francés, alemán, italiano y portugués brasileño.
- No incluye tool calling, razonamiento multi-paso ni capacidades de agente: es exclusivamente TTS.

## Casos de uso

- Atención al cliente con voz sintética: usar una voz Piper concreta para leer respuestas generadas por un LLM en un canal telefónico o web, aprovechando la baja latencia de los modelos ONNX en CPU.
- Chatbot con avatar 3D: integrar las voces en el proyecto 3D Avatar Chatbot para dar voz a un personaje en VR o escritorio mediante Piper WASM, sin depender de servicios externos.
- Sistemas de personas HomePilot: asignar voces distintas a cada persona del sistema para diferenciar interlocutores en una misma aplicación.
- Asistentes domésticos locales: desplegar TTS en dispositivos sin GPU usando los ONNX en CPU, con voces en español, francés, alemán, italiano o portugués según la región.
- Accesibilidad y lectura de contenido: convertir artículos o notificaciones a audio en aplicaciones de lectura, eligiendo voz e idioma por locale.
- Recuperación ante caída de upstream: usar el repositorio como fuente de respaldo configurando `HF_BASE` a `https://huggingface.co/ruslanmv/hp-piper-voices/resolve/main` para garantizar disponibilidad de las voces en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la mayoría de despliegues; Piper está diseñado para ejecutarse en CPU.
- GPU recomendadas: no disponibles; el sistema no requiere GPU para funcionar.
- Cabe en GPU consumer: sí, pero no es necesario; también se ejecuta en CPU y en navegador vía WASM.
- Opciones de despliegue: Piper (ejecución nativa), Piper WASM (navegador), integración en aplicaciones HomePilot; no se documentan integraciones con vLLM, TGI o llama.cpp, que no aplican a TTS.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ruslanmv/hp-piper-voices` | Mirror de voces Piper | en, es, fr, de, it, pt | ONNX | MIT (con excepciones CC) | Hugging Face |
| `rhasspy/piper-voices` | Repositorio upstream de voces Piper | Múltiples | ONNX | MIT (con excepciones) | Hugging Face / GitHub |
| `diffusionstudio/piper-voices` | Voces Piper optimizadas para web | Múltiples | ONNX | MIT | Hugging Face |
| `kirys79/piper_italiano` | Voces Piper italianas | it | ONNX | CC BY 4.0 | Hugging Face |

## Limitaciones y advertencias

- Es un espejo, no un modelo original: no aporta mejoras ni correcciones sobre las voces upstream.
- Cuatro voces tienen licencias restrictivas con atribución obligatoria: `it_IT-serena-medium` y `it_IT-serena-high` (CC BY 4.0), `es_AR-daniela-high` (CC BY-SA 4.0), `it_IT-aurora-medium` (CC BY 4.0) y `it_IT-giorgio-high` (CC BY 4.0). La licencia MIT global no cubre estas voces.
- La calidad de síntesis depende de la voz y del dataset original; no se documentan métricas de naturalidad ni de inteligibilidad.
- Solo cubre seis idiomas; no hay soporte para otras lenguas.
- No es un modelo de lenguaje: no genera texto, razona ni ejecuta herramientas.
- El repositorio puede quedar desactualizado respecto a las fuentes upstream si estas evolucionan.

## Enlaces

- Hugging Face: https://huggingface.co/ruslanmv/hp-piper-voices
- Proyecto 3D Avatar Chatbot: https://github.com/ruslanmv/3D-Avatar-Chatbot
- HomePilot: https://github.com/ruslanmv/HomePilot
- OllaBridge: https://github.com/ruslanmv/ollabridge
- Upstream diffusionstudio/piper-voices: https://huggingface.co/diffusionstudio/piper-voices
- Proyecto original Piper: https://github.com/rhasspy/piper
- Upstream rhasspy/piper-voices: https://huggingface.co/rhasspy/piper-voices
- Piper Italiano: https://huggingface.co/kirys79/piper_italiano
- Sitio del autor: https://ruslanmv.com
