# infosave/LFM3-Omni-2B-cmf

## Resumen

LFM3-Omni-2B-cmf es una versión cuantizada y reempaquetada del modelo omnimodal LFM3-Omni-2B de Liquid AI, publicada por el usuario infosave en formato CMF. El modelo base es un modelo de 2.2B parámetros capaz de procesar texto, imágenes, vídeo y voz de entrada (16 kHz) y generar respuestas en texto, voz de salida (24 kHz) o ambas de forma intercalada, sustituyendo en un solo modelo a un reconocedor de voz (ASR), un modelo visión-lenguaje, un LLM y un sintetizador de voz (TTS).

Esta versión concreta destaca por su empaquetado: los pesos se distribuyen como ficheros CMF únicos que incluyen el códec de voz dentro, y se ejecutan con cortiq, un motor de inferencia escrito en Rust sin Python ni frameworks de ML. Funciona sobre GPUs NVIDIA, AMD e Intel mediante Vulkan/DX12, sobre Apple silicon mediante Metal y en CPU. Con archivos de entre 1,95 y 2,78 GB, es relevante para despliegues en hardware modesto y entornos donde el stack de Python es un problema.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Omnimodal any-to-any (LFM3), con codificadores de visión y audio, decodificador de profundidad y códec de voz integrados |
| Parametros totales | 2.2B (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8_2f (8 bits en el modelo de lenguaje), q4tp (4 bits); codificadores y códec a 16 bits en ambos |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas; TTS en 19 locales) |
| Licencia | LFM Open License v1.0 (lfm1.0, tipo "other") |
| Formato de pesos | CMF (fichero único con pesos, codificadores y códec de voz) |

## Arquitectura y entrenamiento

El modelo base LFM3-Omni-2B de Liquid AI es un modelo omnimodal any-to-any construido sobre la familia LFM3. Integra un codificador de visión, un codificador de audio (entrada a 16 kHz), un decodificador de profundidad y un códec de voz interno que permite generar habla a 24 kHz. Puede responder en texto, en voz o en ambas modalidades intercaladas en una misma respuesta. El modelo no genera razonamiento previo antes de responder (no tiene modo de thinking).

En cuanto a los datos de entrenamiento del modelo base, no se ha publicado información en la ficha disponible. Lo que sí está documentado es el proceso de conversión: los pesos se transformaron al formato CMF mediante `cortiq convert`, cuantizando el modelo de lenguaje a 8 bits (`q8_2f`) o 4 bits (`q4tp`), mientras que el codificador de visión, el de audio, los proyectores, el decodificador de profundidad y el códec se mantienen a 16 bits y se ejecutan en float32 en CPU.

## Capacidades

- Reconocimiento de voz (ASR) en 16 idiomas, mediante instrucciones del tipo "Perform ASR in <language>."
- Síntesis de voz (TTS) en 19 locales, con selección de voz masculina o femenina
- Respuesta a preguntas sobre imágenes, fotogramas de vídeo (formato Y4M o directorio de fotogramas) y grabaciones de audio
- Chat por voz con respuesta intercalada de texto y audio (`--speech-mode mixed`)
- Comprensión de imágenes y vídeo como modalidades de entrada
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) que acepta partes `image_url`, `video` e `input_audio` en un mismo mensaje
- Verificación de integridad de descargas (sha256 y `cortiq verify`)
- Ejecución multiplataforma: Vulkan/DX12 (NVIDIA, AMD, Intel), Metal (Apple silicon) y CPU puro

## Casos de uso

- Transcripción automática de audio multilingüe: el modelo actúa como ASR en 16 idiomas con una simple instrucción de sistema, adecuado para subtitulado o procesado de grabaciones sin depender de servicios en la nube.
- Asistente de voz local: gracias a la salida de voz a 24 kHz y al chat intercalado texto-audio, puede construirse un asistente conversacional completo en un portátil con Apple silicon o una GPU de 3,5 GB.
- Descripción de imágenes para accesibilidad: genera descripciones de fotografías (probado con imágenes de 640x480 y 1296x864) con salida en texto o voz, útil para lectores de pantalla.
- Consulta visual por voz: se puede preguntar por voz sobre una foto y recibir respuesta en texto y voz; en Apple M4 la respuesta completa con 21,5 s de habla tarda 11,1 s.
- Síntesis de voz para producción de contenido: el modo TTS con selección de voz y 19 locales permite generar locuciones cortas (por ejemplo, 7 s de audio en 3,4 s en Apple M4).
- Análisis de vídeo: acepta vídeo en Y4M o directorios de fotogramas, lo que permite responder preguntas sobre secuencias visuales.
- Integración en servicios existentes: el servidor OpenAI-compatible de cortiq permite incorporar el modelo a aplicaciones que ya usan el formato `/v1/chat/completions` con entradas multimodales.
- Despliegue sin Python: al no requerir Python ni frameworks de ML, encaja en entornos embebidos, contenedores mínimos o equipos donde el stack de ML habitual es inviable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La ficha sí incluye pruebas de paridad de cuantización frente al checkpoint bf16 ejecutado en float32 con Transformers (decodificación greedy): las transcripciones ASR son idénticas en ambas cuantizaciones; las descripciones de imagen son idénticas con `q8_2f` (en imágenes grandes, idénticas en las primeras 28 palabras) y de mismo contenido con otras palabras en `q4tp`; el TTS reproduce la frase de entrada correctamente en todos los casos.

Rendimiento medido con cortiq 0.8.50:

| Tarea | NVIDIA A40 (Vulkan) | Apple M4 (Metal), q4tp |
|---|---:|---:|
| Síntesis de ~7 s de voz | 6,1 s (q4tp) / 6,8 s (q8_2f) | 3,4 s |
| Descripción de foto 640x480 (con carga) | no disponible | 1,7 s |
| Decodificación de texto | no disponible | 79 tok/s |
| Pregunta hablada sobre foto, respuesta en texto y 21,5 s de voz | no disponible | 11,1 s |

## Requisitos de hardware

- Ambos ficheros caben en cualquier GPU con 3,5 GB de memoria libre; el archivo q4tp ocupa 1,95 GB y el q8_2f 2,78 GB.
- GPUs NVIDIA, AMD e Intel a través de Vulkan o DX12; en Linux sin entorno gráfico instalar `libvulkan1 libglvnd0 libegl1 libgl1 libglx0` y definir `XDG_RUNTIME_DIR=/tmp`.
- Apple silicon: el backend Metal es el predeterminado; el modelo rinde bien en un Apple M4 (79 tok/s de decodificación de texto).
- CPU puro: posible mediante `CMF_GPU=0`.
- En A40, la síntesis de 7 s de voz tarda 6,1 s con q4tp; el modelo de lenguaje corre en GPU mientras que los codificadores de visión y audio, el decodificador de profundidad (16-27 ms por fotograma de voz) y el códec se ejecutan en float32 en CPU.
- Despliegue mediante cortiq (`cortiq run` y `cortiq serve`); no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI. Binarios precompilados para Linux, macOS y Windows disponibles en la página de releases del repositorio de cortiq.

## Comparativa con modelos similares

| Modelo | Parametros | Modalidades | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-Omni-2B-cmf (esta ficha) | 2.2B | Texto, imagen, vídeo, voz (entrada y salida) | q8_2f / q4tp | LFM Open License v1.0 (uso comercial restringido a empresas <10 M USD de ingresos anuales) | Motor cortiq en Rust, sin Python; códec de voz incluido en el fichero |
| LiquidAI/LFM3-Omni-2B (base) | 2.2B | Texto, imagen, vídeo, voz (entrada y salida) | bf16 (checkpoint original) | LFM Open License v1.0 | Ejecución vía Transformers; mayor huella de memoria |
| Qwen2.5-Omni-3B/7B (referencia de categoría) | 3B / 7B | Texto, imagen, audio, vídeo (entrada), texto y voz (salida) | Varias (GGUF, AWQ, etc.) | Apache 2.0 / licencia Qwen según tamaño | Ecosistema más amplio (vLLM, llama.cpp), pero mayor tamaño en la variante 7B |

## Limitaciones y advertencias

- La licencia LFM Open License v1.0 no permite el uso comercial a entidades con ingresos anuales iguales o superiores a 10 millones de dólares; revisar el texto completo antes de cualquier despliegue comercial.
- El modelo no razona antes de responder; no es adecuado para tareas que exijan razonamiento profundo en múltiples pasos.
- La longitud de contexto no está documentada en la ficha disponible.
- El servidor OpenAI-compatible de cortiq aún no soporta salida de voz, la pista de sonido de vídeos ni reconocimiento en streaming.
- En cuantización q4tp, las descripciones de imagen varían en la redacción (aunque conservan el contenido) y los códigos TTS difieren del greedy tras el primer fotograma, lo que puede alterar la prosodia.
- El repositorio apenas registra actividad (1 descarga, 1 like), por lo que no hay evidencia de uso en producción ni comunidad de soporte.
- La cuantización la realiza un tercero (infosave) sobre el modelo de Liquid AI; para garantías del modelo original conviene contrastar con el checkpoint oficial.
- Como todo modelo generativo, puede alucinar contenido en descripciones de imágenes o transcripciones ruidosas; no se han documentado evaluaciones de sesgos.

## Enlaces

- Ficha del modelo cuantizado: https://huggingface.co/infosave/LFM3-Omni-2B-cmf
- Modelo base de Liquid AI: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Repositorio de cortiq y formato CMF: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Scripts de reproducción y paridad: https://github.com/infosave2007/cmf/tree/master/scripts/lfm3
- Licencia (en el repositorio del modelo): LICENSE
