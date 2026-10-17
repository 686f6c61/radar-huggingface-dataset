# Allinsama/ACE-Step__acestep-5Hz-lm-4B

## Resumen

`Allinsama/ACE-Step__acestep-5Hz-lm-4B` es el componente de lenguaje (LM) de 4B parámetros del sistema ACE-Step 1.5, un modelo fundacional de generación de música de código abierto desarrollado conjuntamente por ACE Studio y StepFun. Este repositorio concreto es una república no oficial alojada por el usuario Allinsama bajo licencia MIT, con formato `safetensors` y compatibilidad con `transformers`. No se trata de un generador de audio autónomo: es el "planificador" que convierte una consulta del usuario en un plano de canción completo (estructura, metadatos, letra y descripciones) que después consume un Diffusion Transformer (DiT) para sintetizar el audio.

El modelo parte de Qwen3-4B y se ha sometido a preentrenamiento, ajuste supervisado (SFT) y aprendizaje por refuerzo para especializarse en tareas musicales: reescritura de consultas, generación de metadatos con cadena de pensamiento (CoT), composición, comprensión de audio de referencia y copia de melodía. Según la model card, la variante de 4B es la más capaz de la familia de LMs de ACE-Step 1.5, con calificación "Strong" en comprensión de audio, capacidad de composición y copia de melodía, frente a "Medium" en las variantes de 0,6B y 1,7B.

Su relevancia radica en dos factores: por un lado, el sistema completo declara generar una canción en menos de 2 segundos en una A100 y menos de 10 segundos en una RTX 3090, con funcionamiento local por debajo de 4 GB de VRAM; por otro, la licencia MIT y el énfasis del proyecto en datos de entrenamiento con licencia, libres de derechos y sintéticos facilitan el uso comercial, algo poco habitual en modelos musicales. El informe técnico asociado es arXiv:2602.00744.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B) integrado como planificador de un sistema híbrido LM + DiT |
| Parámetros totales | 4.189.554.176 (4,19 B), según safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para este fine-tune; el modelo base Qwen3-4B declara 32.768 tokens nativos, ampliables con YaRN |
| Tipos de cuantización | No disponible en la información proporcionada; el repositorio se distribuye en precisión completa (bf16, ~8,4 GB) |
| Idiomas soportados | La model card del sistema declara más de 50 idiomas; el metadato de HuggingFace no especifica lista concreta |
| Licencia | MIT |
| Formato de pesos | safetensors (`transformers`) |

## Arquitectura y entrenamiento

El LM es un transformer decoder-only inicializado desde Qwen3-4B y especializado mediante un pipeline de tres etapas: preentrenamiento, SFT y RL. Su función dentro de ACE-Step 1.5 es actuar como planificador omnicomprensivo: recibe la consulta del usuario y genera un plano de canción que escala desde bucles cortos hasta composiciones de 10 minutos, sintetizando metadatos, letra y descripciones mediante cadena de pensamiento que luego guían al DiT. La nomenclatura "5Hz" alude a la tasa de trabajo del componente lingüístico dentro del pipeline, si bien la información disponible no detalla su implementación exacta.

La innovación metodológica declarada es que la alineación del LM se logra mediante aprendizaje por refuerzo intrínseco, apoyado únicamente en mecanismos internos del modelo, sin modelos de recompensa externos ni preferencias humanas, lo que según los autores evita los sesgos introducidos por reward models. El entrenamiento del sistema completo emplea datos con licencia profesional, colecciones de dominio público y libres de derechos, y audio sintético generado por conversión MIDI-a-audio. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles del esquema de RL.

## Capacidades

- Generación de texto especializada en planeación musical: estructura de canción, secciones, progresiones y metadatos.
- Generación de letras y descripciones (captions) multilingües, con adherencia estricta al prompt en más de 50 idiomas según la model card.
- Cadena de pensamiento (CoT) para metadatos: el modelo razona antes de emitir el plano de canción que consume el DiT.
- Reescritura de consultas (query rewrite): normaliza y expande prompts pobres o ambiguos en especificaciones musicales utilizables.
- Comprensión de audio: calificada como "Strong" en la variante de 4B, permite analizar audio de referencia para condicionar la generación.
- Copia de melodía: calificada como "Strong", frente a "Medium" en 1,7B y "Weak" en 0,6B.
- Composición: capacidad "Strong" para construir piezas coherentes a partir de instrucciones de alto nivel.
- Especialización en estilos y edición musical dentro del sistema completo: cover, repaint, extracción y conversión de vocal a BGM (atribuido al pipeline ACE-Step 1.5, no al LM aislado).
- Compatibilidad declarada con Text Generation Inference y endpoints compatibles (`endpoints_compatible`).
- No se documenta soporte explícito de tool calling, function calling ni comportamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Planificación automática de canciones en un pipeline text2music: el LM recibe una frase como "balada de piano en español sobre perder un vuelo" y devuelve estructura por secciones, tempo, instrumentación y letra; el DiT consume ese plano para sintetizar el audio. Es el uso principal para el que se entrenó.
- Generación de letras multilingües a escala: útil para sellos, agencias de contenido o plataformas que necesitan letras en decenas de idiomas manteniendo coherencia métrica con la estructura generada.
- Enriquecimiento de metadatos de catálogos musicales: el modelo puede producir descripciones, etiquetas de estilo y anotaciones estructurales a partir de audio de referencia, aprovechando su capacidad "Strong" de comprensión de audio.
- Reescritura y normalización de prompts en una interfaz de creación: capa intermedia que transforma entradas coloquiales de usuarios no técnicos en especificaciones que el modelo de difusión interpreta correctamente, reduciendo la tasa de generaciones fallidas.
- Clonación estilística y cover asistido: combinado con las capacidades de cover y copia de melodía del sistema, el LM aporta la descripción estilística y la estructura necesarias para transformar una referencia manteniendo la melodía original.
- Producción de bandas sonoras para vídeo y juegos: generación de bucles y piezas de hasta 10 minutos con control de estilo, integrable en flujos de trabajo de postproducción que requieren iteración rápida (segundos por pista en A100 según el proyecto).
- Investigación en alineación mediante RL intrínseco: el modelo sirve como caso de estudio reproducible (MIT, pesos abiertos) para analizar si el RL sin reward model externo evita sesgos de preferencia humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card incluye una figura de evaluación sin cifras extraíbles y una tabla de calidad cualitativa por variante. Los únicos datos comparativos publicados son cualitativos:

| Variante LM | Modelo base | Comprensión de audio | Capacidad de composición | Copia de melodía |
|---|---|---|---|---|
| acestep-5Hz-lm-0.6B | Qwen3-0.6B | Medium | Medium | Weak |
| acestep-5Hz-lm-1.7B | Qwen3-1.7B | Medium | Medium | Medium |
| acestep-5Hz-lm-4B | Qwen3-4B | Strong | Strong | Strong |

Datos de velocidad declarados por el proyecto para el sistema completo (no desglosados por componente): canción completa en menos de 2 s en A100 y menos de 10 s en RTX 3090. No se especifican MMLU, HumanEval, GSM8K ni métricas objetivas de calidad musical (FAD, CLAP score, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para el LM aislado: ~10-12 GB en bf16 (pesos de 8,4 GB más caché KV y overhead), ~5-6 GB en int8 y ~3-4 GB en int4.
- El proyecto declara que el pipeline ACE-Step 1.5 completo funciona localmente con menos de 4 GB de VRAM; esa cifra corresponde al sistema con cuantización, no al LM de 4B en precisión completa.
- GPU recomendadas para el LM en bf16: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU de consumo: sí. RTX 4090/3090 en bf16 sin problemas; RTX 4080/4070 Ti Super (16 GB) en bf16 con contexto moderado; tarjetas de 8 GB solo con cuantización de 4 bits.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM por herencia de la arquitectura Qwen3. No se han publicado pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión propia no verificada.
- Latencia y throughput: no disponibles para el LM de forma aislada; las cifras publicadas (menos de 2 s por canción en A100, menos de 10 s en RTX 3090) corresponden al pipeline completo con el DiT turbo de 8 pasos.
- Almacenamiento: 8,4 GB de repositorio; prever el doble durante la descarga y conversión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| acestep-5Hz-lm-4B (este) | 4,19 B | No disponible | Planificador musical + CoT, comprensión de audio | MIT | HuggingFace (república de terceros) |
| acestep-5Hz-lm-1.7B | ~1,7 B (no confirmado en safetensors) | No disponible | Planificador musical, capacidades medias | MIT | HuggingFace (colección ACE-Step) |
| acestep-5Hz-lm-0.6B | ~0,6 B (no confirmado en safetensors) | No disponible | Planificador musical, copia de melodía débil | MIT | HuggingFace (colección ACE-Step) |
| Qwen3-4B (modelo base) | ~4 B | 32.768 tokens nativos | LLM generalista, multilingüe, con modo thinking | Apache-2.0 | HuggingFace (oficial) |

Frente a Qwen3-4B, este modelo intercambia amplitud de dominio por especialización musical (CoT de metadatos, query rewrite, comprensión de audio) y cambia la licencia a MIT. Frente a sus hermanos de 0,6B y 1,7B, la diferencia declarada es de calidad en composición y copia de melodía, no de contexto ni de arquitectura. No se dispone de comparativas cuantitativas con otros modelos de planificación musical de código abierto.

## Limitaciones y advertencias

- El repositorio es una república de terceros (usuario Allinsama) con 0 descargas y 0 likes; no es el canal oficial del proyecto y puede no estar sincronizado ni validado por los autores.
- El LM no genera audio por sí mismo: requiere el DiT correspondiente (`acestep-v15-base`, `sft`, `turbo` o `turbo-rl`) para producir música. Usarlo aislado solo devuelve texto.
- No hay resultados de benchmarks objetivos publicados; las afirmaciones de calidad ("Strong", "Very High") son autoevaluaciones cualitativas del autor sin métricas que las respalden.
- Riesgo de alucinación en letras, metadatos y descripciones estructurales: el modelo puede inventar secciones, tempos o anotaciones plausibles pero incorrectas, especialmente en idiomas con pocos datos.
- La cifra de "más de 50 idiomas" procede de la model card del sistema y no se detalla por idioma; el rendimiento real en lenguas minoritarias es desconocido.
- No se documentan sesgos específicos ni evaluaciones de seguridad; el sesgo dependerá del dataset musical (mayoritariamente occidental) y del modelo base Qwen3.
- La licencia MIT permite uso comercial, pero la afirmación de "datos legalmente conformes" es una declaración del autor no verificable de forma independiente; conviene revisar el informe técnico antes de un despliegue comercial.
- El estado "To be released" de la variante `turbo-rl` y la falta de pesos GGUF limitan las opciones de despliegue en entornos sin GPU.
- Las fechas del repositorio (octubre de 2026) y la referencia arXiv no han podido contrastarse con resultados de búsqueda web relevantes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Allinsama/ACE-Step__acestep-5Hz-lm-4B
- Colección ACE-Step 1.5 en HuggingFace: https://huggingface.co/collections/ACE-Step/ace-step-15
- Página del proyecto: https://ace-step.github.io/ace-step-v1.5.github.io/
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- ModelScope: https://modelscope.cn/models/ACE-Step/ACE-Step-v1-5
- Informe técnico (arXiv): https://arxiv.org/abs/2602.00744
- Repositorio GitHub citado: https://github.com/ace-step/ACE-Step-1.5
- Discord del proyecto: https://discord.gg/PeWDxrkdj7
- Modelo DiT turbo: https://huggingface.co/ACE-Step/Ace-Step1.5
- Modelo DiT base: https://huggingface.co/ACE-Step/acestep-v15-base
- Modelo DiT SFT: https://huggingface.co/ACE-Step/acestep-v15-sft

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre el modelo; los únicos hits fueron páginas no relacionadas sobre Amazon, por lo que no se han incluido.
