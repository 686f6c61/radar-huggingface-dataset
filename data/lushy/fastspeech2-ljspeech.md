# lushy/fastspeech2-ljspeech

## Resumen

FastSpeech 2 es una arquitectura de síntesis de voz (text-to-speech) no autorregresiva presentada por Microsoft Research en el artículo "FastSpeech 2: Fast and High-Quality End-to-End Text to Speech" (arXiv:2006.04558). Este repositorio concreto, publicado por el usuario `lushy`, es una implementación en PyTorch derivada de `ming024/FastSpeech2` que actualiza el flujo de entrenamiento para CPython 3.12 y 3.13, sustituye rutas locales por valores portables y añade un cuaderno de Google Colab para entrenamiento en GPU y publicación en Hugging Face Hub.

El modelo está entrenado sobre el corpus LJSpeech 1.1 (inglés, voz femenina única) y utiliza representaciones a nivel de fonema con predicción explícita de duración, tono (pitch) y energía, además de un vocoder HiFi-GAN para convertir los espectrogramas mel en forma de onda. La arquitectura evita el bucle autorregresivo típico de Tacotron, lo que permite una síntesis mucho más rápida y estable en duración.

Es relevante porque sirve como referencia reproducible y actualizada para entrenar TTS de alta calidad en entornos modernos de Python, con integración directa en el Hub. No obstante, el propio autor advierte que no reclama mejoras arquitectónicas ni métricas de calidad independientes: se trata de una actualización de flujo de trabajo sobre una implementación existente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastSpeech 2 (transformer no autorregresivo con predictor de duración, tono y energía) + vocoder HiFi-GAN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada a nivel de fonema, sin ventana de contexto tipo LLM) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante PyTorch, sin versiones cuantizadas publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | other (mixed-licensing-see-third-party-notices) |
| Formato de pesos | `.bin` en el Hub (checkpoints PyTorch; localmente `.pth.tar`), más `hifigan/generator_LJSpeech.bin` |

## Arquitectura y entrenamiento

FastSpeech 2 es un modelo de síntesis de voz no autorregresivo basado en transformer. A diferencia de Tacotron 2, no genera el mel-espectrograma frame a frame, sino que predice la secuencia completa en paralelo. Para ello incorpora predictores explícitos de duración de fonema, tono (pitch) y energía, extraídos durante el preprocesado a partir de las alineaciones forzadas (Montreal Forced Aligner) y del audio de referencia. Esta implementación usa por defecto pitch y energía a nivel de fonema y un vocoder HiFi-GAN; también integra iSTFTNet como alternativa, manteniendo HiFi-GAN como opción por defecto para LJSpeech.

El entrenamiento se realiza sobre LJSpeech 1.1, un corpus de inglés con una única hablante, con alineaciones MFA proporcionadas por el repositorio upstream. El flujo incluye `prepare_align.py` y `preprocess.py` para generar las características `.npy`. La receta por defecto reanuda desde un checkpoint de 200.000 pasos, guarda de forma atómica cada 10.000 pasos y conserva los dos checkpoints más recientes. Se ha actualizado para soportar CUDA AMP, fallback a MPS/CPU, workers de datos configurables y retención de checkpoints. No se documenta en la información disponible el uso de RLHF, DPO ni un recuento explícito de tokens de entrenamiento.

## Capacidades

- Síntesis de voz a partir de texto en inglés, con salida de audio mediante vocoder HiFi-GAN o iSTFTNet.
- Control explícito de prosodia a través de los predictores de duración, tono y energía (permite manipular velocidad y entonación variando estos valores).
- Generación no autorregresiva en paralelo, lo que reduce la latencia frente a modelos autoregresivos.
- Entrenamiento y ajuste fino sobre corpus propios siguiendo el pipeline de preprocesado incluido.
- Publicación automatizada de checkpoints y código en Hugging Face Hub mediante `scripts/push_to_hub.py`.
- Ejecución en Google Colab con GPU, con reanudación desde checkpoint y guardado en Drive.
- Soporte de entrenamiento en CUDA, Apple MPS y CPU.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades propias de modelos de lenguaje; es exclusivamente un modelo TTS.

## Casos de uso

- Generación de audiolibros y narración: al estar entrenado sobre LJSpeech (voz única de alta calidad), es adecuado para producir narraciones en inglés con prosodia controlable mediante los predictores de duración y energía.
- Prototipado de asistentes de voz en inglés: permite generar respuestas habladas con baja latencia gracias a la inferencia no autorregresiva, integrándose en un pipeline de ASR + LLM + TTS.
- Investigación en prosodia: los predictores explícitos de pitch, energía y duración permiten experimentar con control de entonación y ritmo sin reentrenar el modelo completo.
- Ajuste fino sobre voces propias: el pipeline de preprocesado con MFA y los scripts de entrenamiento permiten adaptar el modelo a un corpus distinto, siempre que se respeten los derechos de la voz.
- Docencia y reproducción de resultados: el cuaderno de Colab facilita reproducir el entrenamiento y comparar configuraciones en un entorno estándar de Python 3.12/3.13.
- Generación de locuciones para vídeos y demos en inglés: el vocoder HiFi-GAN incluido produce formas de onda de calidad razonable para contenido no crítico.
- Integración en investigación comparativa de TTS: sirve como línea base no autorregresiva frente a modelos autoregresivos o de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la model card no reclama mejoras de calidad medidas ni resultados de evaluación independientes, y recomienda añadir métricas y audio de muestra tras el entrenamiento antes de presentar un checkpoint como versión final.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del repositorio (0,5 GB, incluyendo código, vocoder y checkpoint) se trata de un modelo pequeño que cabe holgadamente en GPUs de consumo, aunque no se documentan cifras exactas.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente para entrenamiento e inferencia; el flujo de Colab está pensado para GPUs de la plataforma. No se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con varios GB de VRAM, dado el reducido tamaño del checkpoint y del vocoder.
- Opciones de despliegue: scripts propios del repositorio (`train.py`, scripts de síntesis); no es compatible con la API `pipeline()` de Transformers. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS de este tipo).
- Latencia y throughput: no disponibles. La arquitectura no autorregresiva implica por diseño una generación más rápida que modelos autoregresivos equivalentes, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lushy/fastspeech2-ljspeech | no disponible | fonemas (sin ventana) | en | other (mixta) | Hugging Face Hub |
| ming024/FastSpeech2 (upstream) | no disponible | fonemas (sin ventana) | en (LJSpeech) | no disponible en la información | GitHub |
| Tacotron 2 | no disponible | caracteres/fonemas, autorregresivo | multiidioma según checkpoint | varía según implementación | Múltiples repositorios |
| VITS | no disponible | fonemas, extremo a extremo con flujo normalizador | multiidioma según checkpoint | varía según implementación | Múltiples repositorios |

La comparación cuantitativa de parámetros, contexto y rendimiento no está disponible en la información proporcionada. La diferencia principal frente a Tacotron 2 es la inferencia no autorregresiva; frente a VITS, este último integra generación y vocoder en un único modelo generativo, mientras que FastSpeech 2 depende de un vocoder separado.

## Limitaciones y advertencias

- Entrenado únicamente sobre LJSpeech: una sola hablante, inglés estadounidense, dominio de lectura de libros. La generalización a otras voces, acentos o idiomas requiere reentrenamiento.
- Riesgo de artefactos prosódicos y de pronunciación en palabras fuera del vocabulario o nombres propios, habitual en modelos fonemizados con alineaciones forzadas.
- No es un modelo de lenguaje: no razona, no mantiene conversaciones ni soporta tool calling; cualquier uso conversacional requiere un LLM externo.
- Licencia mixta (`mixed-licensing-see-third-party-notices`): es imprescindible revisar los avisos de terceros (código base, HiFi-GAN, LJSpeech) antes de cualquier uso comercial. La licencia de LJSpeech es restrictiva para determinados usos.
- El autor advierte de no subir datos de voz sin derechos de redistribución; el uso comercial de voces sintetizadas puede estar sujeto a obligaciones adicionales.
- No se han publicado métricas de calidad (MOS, CMOS, WER) ni audio de muestra en la información disponible, por lo que no se puede avalar la calidad del checkpoint publicado.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria prácticamente nula.
- Requiere seguir el pipeline propio (MFA, preprocesado, scripts) y no es compatible con la API estándar de Transformers, lo que complica su integración en stacks convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lushy/fastspeech2-ljspeech
- Artículo FastSpeech 2: https://arxiv.org/abs/2006.04558
- Artículo referenciado adicional (arXiv:2203.02395): https://arxiv.org/abs/2203.02395
- Implementación upstream: https://github.com/ming024/FastSpeech2
- Dataset LJSpeech 1.1: https://keithito.com/LJ-Speech-Dataset/
- Archivo LJSpeech 1.1: https://data.keithito.com/data/speech/LJSpeech-1.1.tar.bz2
- Alineaciones MFA del repositorio upstream: https://drive.google.com/drive/folders/1DBRkALpPd6FL9gjHMmMEdHODmkgNIIK4
- Selector oficial de PyTorch: https://pytorch.org/get-started/locally/
