# samuel-vitorino/sopro-v2-turbo

## Resumen

Sopro V2 Turbo es un modelo de síntesis de voz (text-to-speech) con clonación de voz zero-shot desarrollado por Samuel Vitorino bajo el paraguas del proyecto Sopro (Haloneuro). Se trata de un modelo de 121.574.193 parámetros que prioriza la eficiencia: está diseñado para ejecutarse en CPU de portátil o incluso en el navegador mediante ONNX Runtime, manteniendo una inteligibilidad que el autor sitúa a nivel de sistemas mucho más grandes. El nombre proviene del portugués "sopro" (soplo, aliento).

El modelo cubre cuatro idiomas (inglés, portugués europeo, francés y alemán), soporta streaming con un tiempo hasta el primer audio de aproximadamente 300 ms en CPU de portátil, y ofrece clonación de voz a partir de 5-20 segundos de audio de referencia. Con un RTF de 0,24 en modo offline y 0,21 en streaming sobre una CPU M3 (0,07 RTF en H100), está claramente orientado a despliegues on-device y aplicaciones interactivas de baja latencia.

Su relevancia actual radica en la combinación de licencia Apache 2.0, tamaño reducido (2,1 GB de repositorio, pesos safetensors y GGUF), soporte de streaming y ejecución en navegador, lo que lo sitúa en un nicho poco poblado: TTS clonable, multilingüe y realmente desplegable en entornos sin GPU. Requiere la librería `sopro>=2.2.0` o `@soprotts/onnx-web>=0.3.0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS con atención por chunks y vocoder causal en la ruta de streaming; detalles completos no publicados) |
| Parametros totales | 121.574.193 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el texto largo se divide en segmentos, longitud total ilimitada) |
| Tipos de cuantizacion | int8 (pesos AR en CPU), cuantización para navegador/móvil vía ONNX; GGUF disponible |
| Idiomas soportados | Inglés (en), portugués europeo (pt), francés (fr), alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, ONNX (para demo web) |

## Arquitectura y entrenamiento

No se han publicado detalles completos de la arquitectura en la información disponible. La model card indica que la ruta de streaming emplea atención por chunks y un vocoder causal, lo que implica un diseño autorregresivo con solucionador acústico configurable (por defecto 2 pasos). El modelo se apoya en componentes reconocidos del ecosistema TTS: cita como referencias CSM (Sesame), F5-TTS, CosyVoice, Vocos (vocoder) y Whisper. La inferencia se distribuye mediante la librería propia `sopro`, con soporte de CUDA, CPU y MPS.

Los datos de entrenamiento declarados son Emilia YODAS, LibriTTS-R y FalAR (dataset de portugués de INESC-ID). No se especifica el número de tokens ni la composición exacta del corpus, ni si hubo etapas de RLHF o DPO. El autor indica explícitamente que no planea publicar el código de entrenamiento a corto plazo debido a su complejidad.

## Capacidades

- Síntesis de voz multilingüe en inglés, portugués europeo, francés y alemán, con parámetro `--lang` opcional para desambiguar pronunciación.
- Clonación de voz zero-shot a partir de 5-20 segundos de audio de referencia.
- Streaming de audio con aproximadamente 300 ms hasta el primer chunk en CPU de portátil.
- Precomputación de la referencia (`prepare_reference`) para reducir el tiempo hasta el primer audio.
- Segmentación automática de textos largos: la longitud total de salida es ilimitada, con tope configurable por segmento (`--max-seconds`).
- Control de generación mediante temperatura, top-p y top-k, y número de pasos del solucionador acústico (`--steps`).
- Ejecución en navegador mediante ONNX Runtime, sin servidor.
- Ejecución en CPU con cuantización int8 de los pesos autorregresivos.
- No se documenta soporte de tool calling, agentes, visión ni audio de entrada más allá de la referencia de voz.

## Casos de uso

- Lectura por voz en aplicaciones de accesibilidad: el modelo cabe en CPU y puede sintetizar texto arbitrariamente largo por segmentación, lo que permite integrarlo en lectores de pantalla o asistentes de lectura sin depender de la nube.
- Asistentes de voz interactivos de baja latencia: con ~300 ms hasta el primer audio en streaming, es adecuado para diálogos por turnos donde la respuesta hablada debe empezar antes de completar la frase.
- Clonación de voz para doblaje y localización: con 5-20 segundos de referencia se puede replicar una voz concreta en los cuatro idiomas soportados, útil para prototipos de doblaje o audiolibros personalizados.
- Demos web sin backend: la ruta ONNX permite ofrecer síntesis de voz directamente en el navegador, sin coste de servidor ni envío de texto a terceros, relevante para aplicaciones con requisitos de privacidad.
- Generación de audio para prototipado de videojuegos y aplicaciones: el RTF de 0,21-0,24 en CPU permite generar locuciones en tiempo casi real en equipos sin GPU durante el desarrollo.
- Síntesis on-device en dispositivos con recursos limitados: la cuantización int8 y el tamaño de 120M de parámetros permiten desplegar TTS en portátiles, Raspberry Pi o móviles (con la advertencia de posibles caídas en dispositivos de poca memoria).
- Preproducción de contenido multilingüe: un mismo pipeline puede generar locuciones en inglés, portugués, francés y alemán con la misma voz de referencia, simplificando la creación de versiones localizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MOS, WER, MMLU, etc.) en la información disponible. Los únicos datos de rendimiento declarados son métricas de velocidad:

| Metrica | Valor |
|---|---|
| RTF offline (CPU M3) | 0,24 |
| RTF streaming (CPU M3) | 0,21 |
| RTF en H100 | 0,07 |
| Time-to-first-audio (streaming, CPU portatil) | ~300 ms |

El autor afirma alcanzar "nivel SOTA de inteligibilidad" frente a sistemas mucho mayores, pero no se aportan cifras concretas en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 121,6M de parámetros, los pesos en fp32 ocupan aproximadamente 0,5 GB y en int8 alrededor de 0,12 GB, por lo que la huella es mínima.
- GPU recomendadas: H100 para máximo throughput (0,07 RTF); cualquier GPU CUDA moderna es suficiente. El modelo selecciona CUDA o CPU automáticamente.
- Consumer GPU: cabe holgadamente en cualquier GPU de consumo; también funciona en CPU de portátil (M3 con 0,21-0,24 RTF) y en navegador.
- Opciones de despliegue: CLI `soprotts`, servidor local `soprotts serve` (puerto 7860), API Python (`SoproTTS`), ONNX Runtime para web (`@soprotts/onnx-web`). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~300 ms hasta el primer audio en streaming en CPU de portátil; RTF 0,07 en H100. En macOS el dispositivo por defecto es CPU; MPS debe activarse explícitamente con `--device mps`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. A continuación se comparan características declaradas frente a alternativas del mismo nicho, marcando como no disponible lo que no consta:

| Modelo | Parametros | Idiomas | Clonacion zero-shot | Streaming | Licencia | Ejecucion en CPU/navegador |
|---|---|---|---|---|---|---|
| Sopro V2 Turbo | 121,6M | en, pt, fr, de | Si (5-20 s) | Si (~300 ms) | Apache 2.0 | Si |
| F5-TTS | No disponible | No disponible | Si | No disponible | No disponible | No disponible |
| CosyVoice | No disponible | No disponible | Si | No disponible | No disponible | No disponible |
| CSM (Sesame) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

Los tres modelos citados aparecen como referencias técnicas en la model card de Sopro, pero no se aportan sus especificaciones en la información disponible.

## Limitaciones y advertencias

- Sin watermarking: el autor declara explícitamente que no se ha añadido marca de agua porque sería trivial de eliminar en un pipeline abierto, lo que supone un riesgo de suplantación de identidad y exige uso responsable.
- Frontend de texto deliberadamente minimalista: abreviaturas, números y símbolos pueden pronunciarse mal; se recomienda escribir los números como palabras ("one plus two" en lugar de "1 + 2") o anteponer un normalizador específico del idioma.
- Texto mezclado de idiomas: palabras de un idioma dentro de una frase en otro (por ejemplo, un nombre de producto en inglés en una frase en portugués) pueden pronunciarse incorrectamente.
- La ruta de streaming (atención por chunks y vocoder causal) no es bit-exacta respecto a la ruta offline; para máxima calidad debe preferirse la inferencia offline.
- El código de entrenamiento no se publicará a corto plazo, lo que limita la reproducibilidad y el ajuste fino por parte de la comunidad.
- En la demo de navegador, en móvil el modelo se cuantiza y la calidad puede ser algo inferior; dispositivos con poca memoria pueden fallar.
- Licencia Apache 2.0: permite uso comercial, pero no exime de las obligaciones legales sobre derechos de voz e imagen de terceros al clonar voces.
- No se documentan sesgos específicos por idioma o acento, ni evaluaciones de robustez frente a entradas adversarias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samuel-vitorino/sopro-v2-turbo
- Blog del lanzamiento: https://research.haloneuro.ai/posts/sopro-v2
- Repositorio GitHub: https://github.com/samuel-vitorino/sopro
- Demo en navegador: https://samuel-vitorino.github.io/sopro/
- Dataset Emilia YODAS: https://huggingface.co/datasets/amphion/Emilia-Dataset
- Dataset LibriTTS-R: https://huggingface.co/datasets/mythicinfinity/libritts_r
- Dataset FalAR: https://huggingface.co/datasets/inesc-id/FalAR
- CSM (Sesame): https://github.com/SesameAILabs/csm
- F5-TTS: https://github.com/SWivid/F5-TTS
- CosyVoice: https://github.com/FunAudioLLM/CosyVoice
- Vocos: https://github.com/gemelo-ai/vocos
- Whisper: https://github.com/openai/whisper
