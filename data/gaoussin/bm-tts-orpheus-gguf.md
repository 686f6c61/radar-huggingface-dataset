# Gaoussin/bm-TTS-Orpheus-gguf

## Resumen

Este modelo es una conversión a formato GGUF de un fine-tuning del modelo Orpheus-TTS, un sistema de texto a voz (TTS) basado en arquitectura de lenguaje grande (LLM) desarrollado por Canopy Labs. El repositorio `Gaoussin/bm-TTS-Orpheus-gguf` ofrece un único archivo cuantizado (`orpheus-3b-0.1-ft.Q4_K_M.gguf`) que pesa aproximadamente 4,2 GB, listo para ser ejecutado con llama.cpp o herramientas compatibles como Ollama o vLLM. El modelo tiene 3.300.867.136 parámetros (3,3 mil millones), lo que lo sitúa en la gama de los modelos TTS compactos pero capaces.

La relevancia de este modelo radica en que permite desplegar un sistema de síntesis de voz de alta calidad en hardware de consumo, gracias a la cuantización Q4_K_M y al formato GGUF, que optimiza la inferencia en CPU y GPU. Al estar basado en un LLM, Orpheus-TTS genera habla tokenizada, lo que facilita su integración con otros sistemas de procesamiento de lenguaje natural. La conversión fue realizada con Unsloth, lo que garantiza una reducción de tamaño sin pérdida significativa de calidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basada en LLM, probablemente Llama-3.2-3B, no confirmado) |
| Parametros totales | 3.300.867.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (único archivo proporcionado) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una adaptación de un LLM para tareas de texto a voz. Según el proyecto Orpheus-TTS (disponible en GitHub), la arquitectura base es un modelo de lenguaje de 3 mil millones de parámetros (similar a Llama-3.2-3B) que ha sido fine-tuneado para generar tokens de habla en lugar de texto. El proceso de entrenamiento implica un corpus de audio transcrito y la generación de unidades acústicas discretas, que luego el decodificador convierte en forma de onda. La conversión a GGUF se realizó con Unsloth, una librería que acelera el fine-tuning y la cuantización de modelos, logrando una reducción del tamaño del archivo de aproximadamente un 75% respecto al modelo original en float32. No se proporcionan detalles sobre el dataset de entrenamiento ni sobre el uso de técnicas como RLHF o DPO en la información disponible.

## Capacidades

- Generación de voz natural y expresiva a partir de texto.
- Síntesis de habla en tiempo real (dependiendo del hardware, puede funcionar en tiempo real en GPUs modernas).
- Soporte para control de emociones y estilos de habla (según el proyecto Orpheus-TTS original, aunque no se confirma en este repositorio específico).
- Integración con pipelines de llama.cpp y herramientas compatibles con GGUF.
- Posibilidad de clonación de voz si se entrena con voces específicas (no confirmado en esta versión).
- Funciona como un modelo de lenguaje, por lo que puede manejar contexto de texto largo antes de generar audio.

## Casos de uso

- **Asistentes de voz en aplicaciones móviles**: el modelo puede generar respuestas habladas en tiempo real, integrado con frameworks como llama.cpp o a través de APIs locales.
- **Audiolibros y narración automática**: con una ventana de contexto suficiente, puede leer textos largos de forma continua, manteniendo coherencia en la entonación.
- **Doblaje y localización de contenido**: al ser un modelo TTS basado en LLM, puede adaptarse a diferentes idiomas y estilos, aunque los idiomas soportados no están especificados.
- **Sistemas de accesibilidad**: lectura de pantalla para personas con discapacidad visual, con la ventaja de poder procesar texto complejo y generar voz de alta calidad.
- **Agentes conversacionales con voz**: combinado con un LLM de texto, permite crear chatbots que hablan, usando Orpheus para la salida de audio.
- **Generación de contenido educativo**: creación de lecciones en audio, podcasts automáticos o material de estudio narrado.
- **Pruebas de estrés en sistemas de voz**: al ser un modelo ligero (3,3B) y cuantizado, es adecuado para pruebas de carga en servidores con GPUs limitadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o métricas específicas de TTS (MOS, WER, etc.) para este modelo concreto. Se recomienda consultar el repositorio original de Orpheus-TTS para obtener evaluaciones comparativas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con el archivo Q4_K_M de 4,2 GB, se necesitan al menos 6 GB de VRAM para cargar el modelo en GPU. En CPU, se puede ejecutar con 8 GB de RAM.
- **GPU recomendadas**: RTX 3060 (12 GB) o superior, RTX 4070, A100, H100. En GPUs con menos VRAM, se puede usar offloading a CPU.
- **Compatibilidad con GPU de consumo**: sí, RTX 3060, RTX 4060, RTX 4090, etc. son suficientes.
- **Opciones de despliegue**: llama.cpp (llama-cli), Ollama, llama-cpp-python, vLLM (con soporte GGUF), text-generation-inference (TGI) si se convierte a safetensors.
- **Latencia y throughput**: no disponibles. Depende del hardware y de la longitud del texto a sintetizar.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Licencia | Uso principal |
|---|---|---|---|---|
| Orpheus-TTS (este) | 3,3B | GGUF | no disponible | TTS basado en LLM |
| XTTS v2 (Coqui) | 467M | PyTorch | CPML (no comercial) | TTS multiidioma con clonación de voz |
| Bark (Suno) | 1,2B | PyTorch | MIT | TTS generativo con efectos de audio |
| Tortoise-TTS | 1,1B | PyTorch | Apache 2.0 | TTS de alta calidad con clonación de voz |

Nota: la comparativa se basa en datos públicos de otros proyectos, no en información proporcionada por el repositorio. Orpheus-TTS se distingue por su enfoque basado en LLM, lo que permite un control más granular del habla mediante tokens.

## Limitaciones y advertencias

- **Licencia no especificada**: el repositorio no indica la licencia, lo que genera incertidumbre sobre su uso comercial. Es recomendable contactar con el autor o consultar el proyecto original de Canopy Labs.
- **Idiomas no documentados**: no se especifica qué idiomas soporta el modelo, lo que limita su uso en entornos multilingües sin pruebas adicionales.
- **Riesgo de alucinaciones en la entonación**: al ser un modelo generativo, puede producir entonaciones o pausas no naturales en textos ambiguos.
- **Dependencia de la calidad del texto de entrada**: errores ortográficos o de puntuación pueden afectar la prosodia generada.
- **Sesgos potenciales**: al entrenarse con datos de voz, puede reflejar sesgos de género, acento o dialecto presentes en el corpus original (no confirmado).
- **Sin soporte para fine-tuning en este formato**: el archivo GGUF está pensado para inferencia; para entrenar o adaptar el modelo se necesitaría el formato original en safetensors.

## Enlaces

- Repositorio HuggingFace: [Gaoussin/bm-TTS-Orpheus-gguf](https://huggingface.co/Gaoussin/bm-TTS-Orpheus-gguf)
- Repositorio del proyecto Orpheus-TTS (Canopy Labs): [canopyai/Orpheus-TTS](https://github.com/canopyai/Orpheus-TTS)
- Repositorio de inferencia GGUF de Orpheus-TTS: [Zuellni/Orpheus-GGUF](https://github.com/Zuellni/Orpheus-GGUF/)
- Unsloth (herramienta de conversión): [unslothai/unsloth](https://github.com/unslothai/unsloth)
