# ArchiveStudio/VoxCPM-0.5B

## Resumen

VoxCPM-0.5B es un sistema de síntesis de voz (text-to-speech) desarrollado por ModelBest (OpenBMB) y distribuido en HuggingFace bajo el identificador ArchiveStudio/VoxCPM-0.5B. Se trata de un modelo de TTS "tokenizer-free": en lugar de convertir el audio a tokens discretos como hacen los enfoques dominantes, modela el habla en espacio continuo mediante una arquitectura autorregresiva de difusión de extremo a extremo. Está construido sobre el backbone de lenguaje MiniCPM4-0.5B, lo que le aporta comprensión textual y permite generar prosodia contextual adaptada al contenido.

El modelo destaca por dos capacidades principales: generación de habla expresiva y consciente del contexto, y clonación de voz zero-shot a partir de un clip corto de referencia, capturando no solo el timbre sino también acento, tono emocional y ritmo. Está entrenado sobre un corpus bilingüe (inglés y chino) de aproximadamente 1,8 millones de horas de audio, y soporta síntesis en streaming con un factor de tiempo real (RTF) de hasta 0,17 en una RTX 4090.

Es relevante para desarrolladores que necesitan integrar TTS de calidad en productos con latencia baja, clonación de voz y control expresivo, con licencia Apache 2.0 que permite uso comercial. El tamaño compacto (0,5B parámetros) facilita el despliegue en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autorregresiva de difusión (diffusion autoregressive) sobre backbone LLM MiniCPM4-0.5B, tokenizer-free, con modelado jerárquico del lenguaje y restricciones FSQ |
| Parametros totales | 0,5 mil millones (backbone MiniCPM4-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 1,6 GB; librería voxcpm, PyTorch) |

## Arquitectura y entrenamiento

VoxCPM emplea una arquitectura de difusión autorregresiva de extremo a extremo que genera representaciones continuas de habla directamente a partir del texto, evitando la tokenización discreta del audio. Sobre el backbone MiniCPM4-0.5B aplica modelado jerárquico del lenguaje y restricciones FSQ (Finite Scalar Quantization) para lograr un desacoplamiento implícito entre semántica y acústica, lo que mejora la expresividad y la estabilidad de generación. El módulo de difusión se denomina LocDiT en la interfaz de inferencia, con parámetros configurables como `cfg_value` (guía del LM sobre LocDiT) e `inference_timesteps` (pasos de difusión).

El entrenamiento se realizó sobre un corpus bilingüe (inglés y chino) de aproximadamente 1,8 millones de horas de audio, según la model card. No se especifican en la información disponible el número exacto de tokens de texto, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO. El modelo incorpora herramientas externas opcionales para normalización de texto (TN), reducción de ruido del prompt (ZipEnhancer) y ASR del prompt de referencia (SenseVoice-Small) en el flujo de demo.

## Capacidades

- Síntesis de voz (TTS) de texto a audio en inglés y chino.
- Generación de habla expresiva y consciente del contexto: infiere prosodia y estilo de habla a partir del contenido del texto.
- Clonación de voz zero-shot a partir de un clip corto de audio de referencia, capturando timbre, acento, tono emocional, ritmo y velocidad.
- Síntesis en streaming con RTF bajo (hasta 0,17 en RTX 4090).
- Control de calidad/velocidad mediante parámetros de inferencia (`cfg_value`, `inference_timesteps`, `normalize`, `denoise`).
- Modo de reintento para casos problemáticos (`retry_badcase`) con umbral de longitud configurable.
- Integración con herramientas externas: normalización de texto, denoising de prompt (ZipEnhancer) y ASR del prompt (SenseVoice-Small).
- Interfaz CLI (`voxcpm`) y procesamiento por lotes (un texto por línea).
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning en la información disponible.

## Casos de uso

- Audiolibros y narración automatizada: el modelo adapta la prosodia al contenido del texto, lo que permite generar narraciones con entonación natural y variada sin intervención manual, adecuado para grandes volúmenes de texto.
- Atención al cliente con voz sintética personalizada: la clonación zero-shot permite crear una voz de marca consistente a partir de un clip corto, y el streaming con RTF bajo facilita respuestas en tiempo casi real.
- Doblaje y localización de contenido: con soporte bilingüe en/zh y clonación de voz, se puede generar audio en un idioma preservando las características del hablante original.
- Asistentes de voz embebidos: el tamaño de 0,5B y el RTF de 0,17 en RTX 4090 permiten despliegue en estaciones de trabajo con GPU de consumo para prototipos y productos de baja latencia.
- Generación de contenido para podcasts y vídeos: producción por lotes mediante CLI con un texto por línea, integrable en pipelines de generación de contenido.
- Accesibilidad: conversión de texto a voz de alta calidad para lectores de pantalla y aplicaciones de asistencia, con voces personalizables por usuario mediante clonación.
- Pruebas A/B de voces en productos: la API de Python permite generar múltiples variantes con distintos parámetros (`cfg_value`, `inference_timesteps`) para evaluar calidad y naturalidad antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta el factor de tiempo real (RTF) de hasta 0,17 en streaming sobre una NVIDIA RTX 4090, sin tablas comparativas de métricas como MOS, WER o similitud de hablante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 1,6 GB y el backbone es de 0,5B parámetros, por lo que se espera un consumo moderado (orientativamente en el rango de pocos GB en precisión completa, sin dato oficial).
- GPU recomendadas: NVIDIA RTX 4090 para streaming en tiempo real (RTF 0,17 reportado). Para otras GPU no se especifican cifras.
- Cabe en GPU de consumo: sí, según el dato de RTF en RTX 4090; no se confirman otros modelos de consumo.
- Opciones de despliegue: librería `voxcpm` (PyPI), CLI `voxcpm`, `python -m voxcpm.cli`, y demo web (`python app.py`). No se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: RTF de hasta 0,17 en RTX 4090 en modo streaming; no se proporcionan más métricas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (TTS tokenizer-free con clonación de voz) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación y de casos problemáticos en la generación: la propia API incluye un modo de reintento (`retry_badcase`) para "bad cases" no controlables, lo que indica inestabilidad ocasional.
- La clonación de voz plantea riesgos de suplantación de identidad y uso malicioso; aunque la licencia es Apache 2.0, es responsabilidad del desplegador implementar controles de consentimiento.
- No se documentan sesgos conocidos ni evaluaciones de equidad en la información disponible.
- No se especifican la longitud de contexto ni los límites de longitud de texto de entrada.
- No se detallan los formatos de pesos ni opciones de cuantización, lo que limita la planificación de despliegue en hardware restringido.
- El número de descargas (28) y likes (0) es muy bajo, lo que sugiere un modelo reciente o poco validado por la comunidad; conviene evaluar en producción antes de adoptarlo.
- La fecha de creación del repositorio (2026-10-25) es posterior a la fecha actual de referencia habitual; verificar la vigencia y procedencia del artefacto antes de usarlo.

## Enlaces

- HuggingFace (ArchiveStudio): https://huggingface.co/ArchiveStudio/VoxCPM-0.5B
- HuggingFace (OpenBMB): https://huggingface.co/openbmb/VoxCPM-0.5B
- Repositorio GitHub: https://github.com/OpenBMB/VoxCPM/
- Documentación MiniCPM Wiki: https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- Demo en vivo: https://huggingface.co/spaces/OpenBMB/VoxCPM-Demo
- Página de muestras: https://openbmb.github.io/VoxCPM-demopage/
- Modelo base: https://huggingface.co/openbmb/MiniCPM4-0.5B
