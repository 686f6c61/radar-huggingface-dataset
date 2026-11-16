# minthura635/voxmmlite

## Resumen

VoxCPM2-Burmese-Light es un modelo de síntesis de voz (text-to-speech) derivado de VoxCPM2 de OpenBMB, especializado en birmano (my-MM) e inglés. Lo publica el usuario minthura635 en Hugging Face con licencia Apache 2.0 y un total de 2.230.739.520 parámetros en formato safetensors. Su propuesta principal es un ajuste agresivo del vocabulario original: elimina 28.930 tokens chinos y multilingües y conserva íntegros los tokens de bytes UTF-8 del birmano y los subwords BPE del inglés, lo que reduce el peso del modelo y su huella en memoria.

El modelo se presenta como una alternativa ligera para un par de idiomas poco cubiertos por los TTS comerciales. Según la model card, funciona con cuantización dinámica INT8 en memoria, lo que rebaja el consumo de unos 10,5 GB a aproximadamente 3,5 GB de RAM o VRAM, y genera audio a 48 kHz. Incluye una función de "auto voice-lock" para mantener la identidad del hablante a lo largo de varias frases, orientada a audiolibros y relatos cortos, además de clonación de voz.

Es relevante ahora porque cubre una lengua de bajos recursos como el birmano con un modelo abierto y desplegable en hardware de consumo (Macs con Apple Silicon, GPUs NVIDIA de 4-6 GB de VRAM y servidores Ubuntu sin GPU). No obstante, la información pública disponible es escasa: no hay benchmarks, no se detalla la composición del dataset de entrenamiento y el repositorio asociado aparece como marcador de posición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de VoxCPM2 de OpenBMB; la model card no detalla la arquitectura interna) |
| Parametros totales | 2.230.739.520 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinámica en memoria (según model card); no se documentan otros formatos |
| Idiomas soportados | birmano (my) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo más allá de indicar que se basa en VoxCPM2 de OpenBMB. Se trata, por tanto, de un derivado de un modelo fundacional de TTS, pero no se especifica si emplea un transformer autorregresivo, un modelo de difusión, un codec de audio neuronal o una combinación híbrida. Tampoco se detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de ajuste supervisado, RLHF o DPO.

La innovación técnica documentada es la poda de vocabulario: se eliminan 28.930 tokens chinos y multilingües del vocabulario original y se preservan los tokens de bytes UTF-8 del birmano y los subwords BPE del inglés. Esta reducción, junto con la cuantización dinámica INT8 en memoria, permite pasar de unos 10,5 GB a aproximadamente 3,5 GB de consumo. También se menciona una función de "auto voice-lock" para mantener la coherencia de la identidad del hablante entre frases, aunque no se explica el mecanismo. El resto de detalles de entrenamiento (datos, horas de audio, hablantes, procesos de alineación) no están disponibles.

## Capacidades

- Síntesis de voz (text-to-speech) en birmano e inglés a 48 kHz.
- Clonación de voz a partir de muestras de referencia (voice cloning), según las etiquetas y la model card.
- Coherencia de identidad del hablante entre múltiples frases mediante "auto voice-lock", pensado para audiolibros y relatos cortos.
- Inferencia en CPU, Apple Silicon (M1/M2/M3/M4) y GPUs NVIDIA con 4-6 GB de VRAM.
- Cuantización INT8 dinámica en memoria para reducir el consumo a unos 3,5 GB.
- Integración mediante una API compatible con OpenAI (`POST /v1/audio/speech`) y una WebUI independiente, según la model card.
- No se documentan capacidades de tool calling, razonamiento multi-paso, visión, audio de entrada ni modo "thinking"; es un modelo exclusivamente de TTS.

## Casos de uso

- Audiolibros y relatos cortos en birmano: el "auto voice-lock" mantiene la misma voz entre frases, lo que evita saltos de timbre en lecturas largas y facilita la producción de contenido narrado sin regrabar.
- Localización de contenido audiovisual al birmano: al generar voz a 48 kHz, el audio resultante es adecuado para vídeo, podcasts y doblaje de calidad de estudio sin necesidad de remuestreo.
- Asistentes de voz para aplicaciones dirigidas a Myanmar: el modelo puede integrarse en un servidor compatible con la API de OpenAI (`/v1/audio/speech`) para dar respuestas habladas en birmano en chats y apps móviles.
- Accesibilidad para personas con discapacidad visual: lectura en voz alta de documentos y páginas web en birmano e inglés con una voz consistente y un consumo de memoria bajo (unos 3,5 GB), desplegable en servidores modestos.
- Prototipado en hardware de consumo: desarrolladores con un Mac con Apple Silicon o una GPU de 4-6 GB pueden probar y validar flujos de TTS sin infraestructura dedicada, gracias a la cuantización INT8.
- Generación de voces para videojuegos y contenidos interactivos: la clonación de voz permite crear varios personajes con voces distintas y mantener su identidad a lo largo de diálogos multi-frase.
- Servicios de atención al cliente con respuesta de voz en birmano: el despliegue en CPU o GPU pequeña reduce costes de infraestructura frente a modelos TTS multilingües de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: aproximadamente 3,5 GB con cuantización dinámica INT8 en memoria, frente a unos 10,5 GB sin cuantizar (según la model card).
- GPUs recomendadas: NVIDIA con 4-6 GB de VRAM o superior; no se especifican modelos concretos como A100, H100 o RTX 4090.
- Cabe en GPU de consumo: sí, según la model card, en GPUs NVIDIA de hasta 4-6 GB de VRAM; también en Apple Silicon (M1/M2/M3/M4) y en CPU.
- Opciones de despliegue: librería `voxcpm`, WebUI independiente y servidor con API compatible con OpenAI (`POST /v1/audio/speech`), según la model card. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada. La model card solo menciona el modelo base VoxCPM2 de OpenBMB, del que este modelo deriva, pero sin cifras que permitan una comparación cuantitativa.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| VoxCPM2-Burmese-Light | 2.230.739.520 | no disponible | my, en | Apache 2.0 | no disponibles |
| VoxCPM2 (OpenBMB) | no disponible | no disponible | multilingüe | no disponible | no disponibles |
| Alternativas de TTS para birmano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo cubre birmano e inglés; el vocabulario se ha podado eliminando tokens chinos y multilingües, por lo que no es adecuado para otros idiomas.
- No hay benchmarks publicados que permitan evaluar la calidad objetiva del audio, la inteligibilidad o la similitud de la voz clonada.
- No se documenta la composición del dataset de entrenamiento, lo que impide evaluar sesgos de hablante, acento o género.
- Riesgo de alucinación y artefactos propio de los modelos TTS: pronunciación incorrecta, omisiones o ruido en textos fuera de dominio; no cuantificado.
- La clonación de voz plantea riesgos de suplantación de identidad y requiere consentimiento explícito de la persona cuya voz se replica.
- El repositorio de GitHub enlazado en la model card aparece como marcador de posición (`https://github.com/your-username/voxcpm-burmese-light`), por lo que la disponibilidad real de la WebUI y del servidor API no está verificada.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni informes independientes.
- Aunque la licencia es Apache 2.0, conviene revisar las condiciones del modelo base VoxCPM2 de OpenBMB antes de un uso comercial.
- No se detallan limitaciones de longitud de texto de entrada ni el comportamiento en secuencias largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minthura635/voxmmlite
- Repositorio del autor (marcador de posición en la model card): https://github.com/your-username/voxcpm-burmese-light
- Modelo base VoxCPM2 de OpenBMB: no disponible (no se proporciona enlace directo en la información)
