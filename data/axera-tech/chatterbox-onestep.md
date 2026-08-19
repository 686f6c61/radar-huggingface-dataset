# AXERA-TECH/chatterbox-onestep

## Resumen

El modelo `AXERA-TECH/chatterbox-onestep` es una compilación en formato AXMODEL del sistema de síntesis de voz Chatterbox-S3Gen-OneStep, desarrollado por AXERA-TECH para su ejecución en hardware de inferencia de borde de la serie AX (como AX650). Se trata de un modelo de text-to-speech (TTS) basado en flow-matching que genera audio en un único paso de inferencia, frente a los 10 pasos típicos del modelo profesor, lo que reduce drásticamente la latencia. El repositorio incluye SDKs en Python y C++, un servidor compatible con la API de OpenAI para síntesis de audio, y scripts de conversión y compilación reproducibles.

El modelo está pensado para despliegue en dispositivos de borde sin dependencia de torch ni frameworks pesados, ofreciendo una alternativa ligera (124,7 MB) y rápida (181,08 ms de inferencia) para aplicaciones de voz en tiempo real. La licencia es Apache-2.0, lo que permite uso comercial con atribución. La información pública disponible es limitada: no se especifican parámetros totales, arquitectura interna detallada ni idiomas soportados, aunque los ejemplos de audio están en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow-matching de un solo paso (basado en Chatterbox-S3Gen-OneStep) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Formato AXMODEL (compilado con Pulsar2, cuantización interna no documentada) |
| Idiomas soportados | no disponible (ejemplos en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | AXMODEL (`.axmodel`), con SDKs Python y C++ |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo Chatterbox-S3Gen-OneStep, que emplea un esquema de flow-matching para generar espectrogramas mel a partir de secuencias de tokens de habla (S3 tokens). El modelo presentado es una versión "estudiante" destilada que realiza la síntesis en un solo paso de inferencia, mientras que el modelo "profesor" original requiere 10 pasos. La compilación a AXMODEL se realiza mediante la herramienta Pulsar2, que optimiza el grafo para el hardware de Axera. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de destilación (si fue mediante distillation, DPO u otro). El repositorio incluye scripts de conversión y compilación reproducibles, así como informes de cada etapa.

## Capacidades

- Generación de voz (text-to-speech) a partir de secuencias de tokens S3, con salida en WAV de 24 kHz.
- Inferencia en un solo paso, con una precisión cosine de 0,9932 respecto al modelo profesor de 10 pasos.
- Servidor OpenAI-compatible (`POST /v1/audio/speech`) que acepta tokens S3 y devuelve WAV o mel, tanto en Python como en C++.
- Ejecución en hardware de borde de Axera sin dependencia de torch, ffmpeg ni FFTW (la versión C++ implementa su propia FFT Bluestein y Griffin-Lim).
- Soporte de síntesis con control de timbre mediante embeddings predefinidos (archivo `default_embedding.bin`).
- Capacidad de integración en pipelines de voz en tiempo real gracias a su baja latencia (181 ms).

## Casos de uso

- Asistentes de voz en dispositivos de borde: el modelo puede ejecutarse en hardware Axera de bajo consumo para generar respuestas habladas en tiempo real, con una latencia de 181 ms por inferencia, adecuada para interacción conversacional.
- Sistemas de lectura de texto en kioscos o señalización digital: permite convertir noticias, avisos o menús a voz sin necesidad de conexión a la nube, usando el SDK C++ para entornos embebidos.
- Generación de audiolibros y contenido narrado: al aceptar tokens S3, puede integrarse en pipelines de TTS donde el texto se convierte a tokens en un host (con torch) y la síntesis se delega al modelo en el dispositivo.
- Pruebas y desarrollo de aplicaciones TTS: el servidor OpenAI-compatible facilita la integración con clientes estándar, permitiendo prototipar rápidamente con `response_format=wav` o `mel`.
- Investigación en destilación de modelos de flujo: al comparar la salida de 1 paso con la del profesor de 10 pasos, sirve como referencia para estudiar la degradación por destilación en TTS.
- Despliegue en entornos sin GPU: al estar optimizado para hardware Axera, es una opción para sistemas embebidos donde no se dispone de GPUs convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (como MMLU, HumanEval, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados por el autor son:

| Metrica | Valor |
|---|---|
| Precisión cosine (vs. profesor 10 pasos) | 0,9932 |
| Tiempo de inferencia | 181,08 ms |
| Tamaño del modelo | 124,7 MB |

Estos valores corresponden a la compilación AXMODEL y no son comparables con benchmarks de TTS convencionales.

## Requisitos de hardware

- Hardware objetivo: dispositivos con AX Engine runtime de Axera (por ejemplo, AX650). No es compatible con GPUs estándar (CUDA, ROCm) ni con CPUs x86 sin el runtime adecuado.
- VRAM: no aplicable; el modelo se ejecuta en memoria del dispositivo Axera, cuyo tamaño no se especifica.
- Opciones de despliegue: SDK Python (`pyaxengine`) y SDK C++ (AX Engine runtime). También se proporciona un servidor OpenAI-compatible para ambos lenguajes.
- Latencia medida: 181 ms por inferencia (según el autor). En el servidor C++, una petición WAV completa tarda unos 23 s (incluyendo Griffin-Lim con 20 iteraciones); en Python, unos 10 s (usando numpy Griffin-Lim).
- No se requieren GPUs ni frameworks de deep learning en el dispositivo; la conversión de texto a tokens (T3) se realiza en un host con torch.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (TTS de un solo paso en hardware de borde). El modelo base Chatterbox de Resemble AI es el origen, pero no se han publicado comparativas directas con otras implementaciones. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- La información pública es muy limitada: no se documentan parámetros, arquitectura interna, idiomas soportados ni dataset de entrenamiento.
- El modelo está compilado exclusivamente para hardware Axera; no es portable a otras plataformas sin recompilar con Pulsar2 y el runtime correspondiente.
- La salida de audio se limita a 24 kHz WAV; no se menciona soporte para otras frecuencias de muestreo o formatos.
- La síntesis requiere tokens S3 previamente generados por un modelo T3 (texto a tokens) en un host con torch; el modelo no acepta texto directamente.
- La precisión cosine de 0,9932 indica una ligera degradación respecto al modelo profesor, que puede ser perceptible en ciertos casos.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez ante entradas adversas.
- La licencia Apache-2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de atribución y la procedencia de los pesos originales de Chatterbox (que pueden tener su propia licencia).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AXERA-TECH/chatterbox-onestep
- Repositorio GitHub con código C++ y scripts: https://github.com/ml-inory/chatterbox-onestep
- Página de modelos de AXERA-TECH en HuggingFace: https://huggingface.co/AXERA-TECH/models
- Referencia al modelo Chatterbox de Resemble AI: https://www.aimodels.fyi/models/replicate/chatterbox-resemble-ai
