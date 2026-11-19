# KaleComputer/kale-tts-1-base

## Resumen

kale-tts-1-base es un modelo de síntesis de voz (text-to-speech) desarrollado por KaleComputer. Se trata de un fine-tune de Kokoro-82M en el que se han reentrenado el front-end de texto y el planificador de timing y melodía sobre un conjunto de diez voces sintéticas diseñadas con Maya-1, mientras que el decodificador de sonido permanece intacto respecto al modelo original. El resultado es un TTS de 81,8 millones de parámetros con licencia Apache-2.0 y soporte exclusivo para inglés.

El modelo resuelve el problema de generar voces sintéticas con perfiles bien definidos (narrativa, noticias, personajes) sin depender de grabaciones de personas reales: todas las voces se diseñaron a partir de descripciones textuales de una línea. Su relevancia actual radica en que actúa como profesor de dos variantes destiladas (kale-tts-1-tiny y kale-tts-1-nano) orientadas a dispositivos de gama baja, por lo que la versión base es la referencia de calidad y la herramienta recomendada para entrenar o destilar voces propias.

La model card lo marca explícitamente como borrador no publicado ("DRAFT, NOT PUBLISHED"), con 50 descargas y ningún "like" en el momento de la consulta. El repositorio ocupa 0,3 GB e incluye los pesos en formato PyTorch (`.pth`) junto con los paquetes de voz.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Kokoro-82M (StyleTTS2 con front-end misaki); fine-tune del lado de texto y del planificador de timing y melodía, decodificador de sonido original sin cambios |
| Parámetros totales | 81,8 M (28,5 M fine-tuneados: lado de texto y planificador; el resto es el decodificador de sonido de Kokoro-82M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 (fichero CPU de los modelos destilados); float32 (fichero WebGPU de los destilados); el modelo base se distribuye en PyTorch sin cuantización publicada |
| Idiomas soportados | inglés (US English y British English) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (PyTorch); fichero `kale-tts-1-base.pth` de 327 MB; paquetes de voz en `voices/` |

## Arquitectura y entrenamiento

El modelo parte de Kokoro-82M, una arquitectura de TTS basada en StyleTTS2 con un front-end de texto (misaki) que convierte grafemas en fonemas y un planificador de timing y melodía que determina la duración y la prosodia. En kale-tts-1-base se han fine-tuneado únicamente el lado de texto y ese planificador; el decodificador de sonido (el generador de waveform) es el de Kokoro-82M sin modificar. Los paquetes de voz se extraen del codificador de estilo fine-tuneado, uno por voz.

El entrenamiento se realizó en dos fases sobre el dataset kale-tts-1-data (CC BY 4.0), compuesto por 1.300 tomas por voz, 26,9 horas en total, generadas por Maya-1 a partir de descripciones textuales y filtradas para conservar solo las tomas limpias. Primero se entrenó un alineador propio (30 épocas en una NVIDIA L40S) y después se hizo el fine-tune de Kokoro-82M en una NVIDIA H100: tres épocas y una más con la etapa adversarial. Los textos de entrenamiento provienen de libros de dominio público de Project Gutenberg. No se documenta el uso de RLHF ni DPO.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida a 24 kHz.
- Diez voces sintéticas con perfiles definidos: Kenzie (presentadora de esports), Simone (voz femenina grave y segura), Amy (noticias, inglés británico), Frankie (compañero de detective noir), Darlene (camionera mayor de voz grave), Owen (presentador joven y brillante), Toby (bromista travieso), Jack (noticias, inglés británico), Earl (abuelo de jazz afroamericano) y Magnus (narrador de tráiler dramático).
- Selección de variante lingüística mediante `lang_code`: "a" para las ocho voces estadounidenses y "b" para las dos británicas (Amy y Jack).
- Control de prosodia y timing mediante el planificador fine-tuneado, que aprende la melodía de las grabaciones de Maya-1.
- Integración con la librería `kokoro` y su pipeline `KPipeline`, que gestiona el front-end de texto.
- No dispone de tool calling, capacidades de agente, visión, audio de entrada ni modo de razonamiento: es exclusivamente un modelo TTS.

## Casos de uso

- Narración de audiolibros y contenido largo: el modelo genera voz continua con perfiles narrativos como Magnus o Simone, adecuados para lectura de textos extensos en inglés con prosodia estable.
- Locución de noticias y boletines: las voces Amy y Jack están diseñadas con un estilo "crisp news-style" y su variante británica se activa con `lang_code="b"`, lo que permite producir boletines con acento británico coherente.
- Doblaje y producción de vídeo: los perfiles de personaje (Frankie, Darlene, Toby, Earl) permiten asignar voces diferenciadas a personajes sin recurrir a actores de voz reales.
- Prototipado de asistentes de voz: al ejecutarse en escritorio o GPU con la librería `kokoro`, sirve para validar flujos de interacción hablada antes de invertir en un TTS comercial.
- Generación de voces sintéticas para entornos de prueba: el dataset y los paquetes de voz permiten crear corpus de audio sintético para tests de sistemas de reconocimiento de voz o de diarización.
- Entrenamiento y destilación de voces propias: la model card indica explícitamente que la versión base sirve para "train and distill your own small voices", usando su planificador como profesor para modelos más pequeños.
- Contenido de marketing y tráilers: la voz Magnus está pensada para narración dramática de tráiler, y Kenzie para tono energético de presentación.

## Benchmarks y rendimiento

Los únicos datos publicados son los del banco de pruebas interno del autor (10 voces, 18 de noviembre), que miden claridad y melodía frente a las grabaciones originales de Maya-1:

| Medida | kale-tts-1-base | kale-tts-1-tiny | kale-tts-1-nano | Referencia Maya-1 |
|---|---|---|---|---|
| Palabras poco claras (puntos vs. Maya-1) | +3,9 | +1,4 | +1,6 | 5,82 % |
| Brecha de melodía | 12,2 | 7,48 | 7,46 | no disponible |
| Parámetros | 81,8 M | 45,7 M | 7,5 M | no disponible |
| Fichero CPU int8 | no disponible | 79,9 MB | 14,8 MB | no disponible |
| Fichero WebGPU float32 | no disponible | 183,2 MB | 30,6 MB | no disponible |
| Velocidad en Galaxy Tab S10 Lite | no ejecutable | 24x tiempo real | 44x tiempo real | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 81,8 M de parámetros y un fichero de 327 MB en PyTorch, la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: el autor cita una NVIDIA L40S para el alineador y una NVIDIA H100 para el fine-tune, pero para inferencia no se especifica un mínimo; por tamaño, una RTX 3060 o superior es suficiente.
- Consumer GPU: sí cabe en GPU de gama media y baja; el autor indica que es "too big and slow" para una tablet de gama baja, pero adecuado para escritorio o GPU.
- Despliegue: librería `kokoro` con `KModel` y `KPipeline`; requiere `pip install kokoro soundfile` y descarga vía `huggingface_hub`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles para el modelo base; los destilados alcanzan 24x y 44x tiempo real en una Galaxy Tab S10 Lite, pero no se publican cifras del base.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Relación |
|---|---|---|---|---|
| kale-tts-1-base | 81,8 M | inglés | Apache-2.0 | Referencia de calidad; profesor de los destilados |
| kale-tts-1-tiny | 45,7 M | inglés | no disponible en la información | Destilado; conserva el planificador congelado y añade el lector de palabras Ettin; 24x tiempo real en tablet |
| kale-tts-1-nano | 7,5 M | inglés | no disponible en la información | Destilado más pequeño; 44x tiempo real en tablet |
| Kokoro-82M (hexgrad) | 82 M | multilingüe (según modelo original) | Apache-2.0 | Modelo base sin fine-tune; el decodificador de sonido se mantiene idéntico |

## Limitaciones y advertencias

- Solo inglés: no hay soporte documentado para otros idiomas.
- La model card está marcada como "DRAFT, NOT PUBLISHED", por lo que las especificaciones y métricas pueden cambiar.
- El modelo es demasiado grande y lento para tablets de gama baja; para esos entornos deben usarse tiny o nano.
- Riesgo de alucinación no aplica en el sentido textual, pero sí de pronunciación incorrecta en palabras fuera del diccionario o de nombres propios; el autor publica un diccionario y reglas de texto revisados en los repos de tiny y nano.
- Prohibido su uso para suplantar a personas reales o presentar la salida como voz humana; la licencia exige informar de que el audio es generado por IA.
- Todas las voces son sintéticas y no corresponden a ninguna persona real; no deben usarse para imitar a individuos.
- Licencia Apache-2.0, que permite uso comercial, pero con la obligación de mantener los avisos de atribución a Maya-1, Kokoro-82M, StyleTTS2 y kikiri-tts.
- El dataset kale-tts-1-data tiene licencia CC BY 4.0, lo que impone atribución si se redistribuye.
- No se documentan sesgos demográficos ni evaluaciones de robustez fuera del banco interno de claridad y melodía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KaleComputer/kale-tts-1-base
- Modelo destilado tiny: https://huggingface.co/KaleComputer/kale-tts-1-tiny
- Modelo destilado nano: https://huggingface.co/KaleComputer/kale-tts-1-nano
- Dataset de entrenamiento: https://huggingface.co/datasets/KaleComputer/kale-tts-1-data
- Modelo base Kokoro-82M: https://huggingface.co/hexgrad/Kokoro-82M
- Maya-1 (generador de las voces): https://huggingface.co/maya-research/maya1
