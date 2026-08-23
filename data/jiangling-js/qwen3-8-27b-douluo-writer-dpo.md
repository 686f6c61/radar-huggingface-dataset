# JiangLing-js/Qwen3.8-27B-Douluo-Writer-DPO

## Resumen

`Qwen3.8-27B-Douluo-Writer-DPO` es un adaptador LoRA (PEFT) desarrollado por JiangLing-js sobre el modelo base `unsloth/Qwen3.8-27B`, orientado a la generación de ficción china de formato largo, concretamente novelas web del género fantástico. El adaptador se entrenó en dos etapas: primero una fase de ajuste supervisado (SFT) sobre tareas de escritura a nivel de escena, y posteriormente una fase de optimización por preferencias directas (DPO) en la que se usaron pasajes escritos por humanos como respuestas preferidas y pasajes generados por el propio modelo o por APIs como respuestas rechazadas.

El objetivo principal es mejorar la expansión de escenas a partir de esquemas argumentales estructurados, la continuación de historias con contexto previo, la consistencia del estado de los personajes, el diálogo, el conflicto narrativo y la reducción de patrones típicos de escritura generada por máquinas. El repositorio contiene únicamente el adaptador LoRA, no una versión fusionada del modelo base de 27 mil millones de parámetros. La licencia es `other`, con un aviso explícito sobre que los datos de entrenamiento derivan de ficción china protegida por derechos de autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.8-27B (atención híbrida: 16 capas con atención completa y 48 con atención lineal) |
| Parametros totales | 353 370 112 entrenables en el adaptador (aproximadamente 1,28 % del modelo base de 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Entrenado con max_seq_length de 4096; el modelo base soporta hasta 262 144 tokens |
| Tipos de cuantizacion | No especificado para el adaptador; el modelo base admite cuantizacion FP8, 8-bit y 4-bit |
| Idiomas soportados | Chino (zh) |
| Licencia | other (aviso de copyright; no se otorgan derechos de redistribucion de las obras literarias subyacentes) |
| Formato de pesos | Safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre el modelo base `unsloth/Qwen3.8-27B`, que es un modelo denso de 27 mil millones de parámetros con una arquitectura de atención híbrida: solo 16 de sus 64 capas usan atención completa, mientras que las otras 48 emplean atención lineal con estado recurrente constante. Este diseño reduce el coste computacional del contexto largo manteniendo una ventana de hasta 262K tokens.

El entrenamiento del adaptador siguió un pipeline en dos fases. En la primera, se realizó un ajuste supervisado con ejemplos estructurados de escritura de escenas, generados a partir de novelas chinas segmentadas por capítulos y escenas, con esquemas argumentales invertidos. En la segunda fase, se aplicó DPO con regularización NLL sobre las respuestas preferidas, usando pasajes humanos como respuestas positivas y pasajes generados por el propio modelo como respuestas negativas. El adaptador tiene rango LoRA 64, alpha 128, dropout 0,0 y se entrenó en precisión BF16 con el stack de Unsloth y TRL.

## Capacidades

- Generación de ficción china de formato largo: expansión de escenas desde esquemas argumentales, continuación de historias con contexto previo y escritura de diálogos y conflictos.
- Consistencia de estado de personajes: el modelo acepta entradas estructuradas con descripciones de personajes y estados emocionales.
- Estilo de novela web china: orientado a géneros fantásticos y narrativos, con reducción de patrones típicos de texto generado por máquinas.
- Soporte de prompts estructurados: puede recibir bloques como `【人物状态】`, `【前情】`, `【场景任务】` y `【事件骨架】` para generar prosa continua.
- Modo de razonamiento: el modelo base admite un modo de razonamiento explícito, pero el adaptador fue optimizado para salida de ficción sin razonamiento (thinking disabled).
- Sin capacidades de visión: aunque el modelo base Qwen3.8 usa una arquitectura multimodal unificada, el adaptador se entrenó solo con texto y no cubre tareas de visión.

## Casos de uso

- Asistente de escritura para novelas web: el modelo puede generar borradores de escena a partir de un esquema argumental y un estado de personajes, reduciendo el tiempo de redacción inicial.
- Expansión de esquemas argumentales: dado un esquema de trama con puntos de trama y conflicto, el modelo produce prosa continua y descriptiva, útil para escritores que necesitan desarrollar ideas breves.
- Continuación de historias con contexto: con un resumen de capítulos anteriores, el modelo puede escribir la siguiente escena manteniendo la coherencia de la trama y los personajes.
- Generación de diálogo y conflicto: puede crear conversaciones entre personajes y escenas de tensión, con estilos de narración propios del género web-novel.
- Herramienta de redacción de borradores para publicaciones web: integrable en flujos de trabajo de escritura como generador de primeras versiones que el autor revisa y edita.
- Investigación en optimización por preferencias para escritura creativa: sirve como caso de estudio de SFT + DPO aplicado a ficción china de formato largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para el adaptador en la información disponible. El modelo base `Qwen3.8-27B` se evalúa en tareas como MathVision, pero no se proporcionan cifras numéricas concretas en los resultados de búsqueda obtenidos. Por tanto, no hay datos verificables de rendimiento del adaptador en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: no especificado para el adaptador; el modelo base de 27B requiere aproximadamente 54 GB en FP16, reducible a unos 27 GB con cuantización 8-bit y 14 GB con 4-bit.
- GPU recomendadas: para el modelo base, GPUs con al menos 24 GB de VRAM (RTX 4090) en 4-bit; para FP16 se recomiendan A100 o H100 con 80 GB.
- El adaptador LoRA es ligero (0,7 GB) y no incrementa de forma significativa los requisitos de memoria del modelo base.
- Opciones de despliegue: el modelo se probó con la pila Unsloth; el modelo base es compatible con vLLM, llama.cpp y Ollama, aunque el adaptador PEFT requiere cargarse mediante la API de Unsloth o Transformers con PEFT.
- Latencia y throughput: no hay datos publicados para el adaptador; el modelo base puede alcanzar hasta 200 tokens por segundo con cuantización NVFP4 según resultados de búsqueda, pero esto no es específico del adaptador.

## Comparativa con modelos similares

No se han encontrado modelos comparables específicamente orientados a escritura de novelas web chinas con ajuste por preferencias en la información proporcionada. Se puede mencionar que el modelo base `Qwen3.8-27B` compite con otros modelos densos de 27B de la familia Qwen, pero no hay datos concretos para establecer una comparativa con alternativas del mismo nicho.

## Limitaciones y advertencias

- Sesgo estilístico y temático: el modelo está entrenado en un dominio estrecho de fantasía china y novelas web, por lo que hereda un sesgo estilístico y temático significativo de su fuente de entrenamiento.
- No apto para tareas generalistas: no está diseñado para responder preguntas factuales, dar consejos profesionales o actuar como asistente de propósito general.
- Riesgo de alucinación y errores de canon: no es fiable para recuperar hechos exactos de la novela original ni para reproducir citas literales de las obras fuente.
- Restricciones de copyright: el adaptador se entrenó con datos derivados de ficción china protegida por derechos de autor; el repositorio no concede derechos de redistribución sobre las obras literarias subyacentes. El usuario debe verificar si su uso es legal bajo la licencia, la ley de derechos y las reglas de la plataforma.
- Limitación de idioma: solo está optimizado para chino; no se evaluó su rendimiento en otros idiomas.
- Uso en producción: al ser un adaptador experimental, se recomienda añadir un sistema de recuperación o memoria externa para proyectos largos que requieran mayor coherencia argumental.
- Modo de razonamiento: el modelo fue optimizado para salida de ficción sin razonamiento; activar el modo de razonamiento puede degradar la calidad de la escritura.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JiangLing-js/Qwen3.8-27B-Douluo-Writer-DPO
- Modelo base: https://huggingface.co/unsloth/Qwen3.8-27B
- Modelo base de Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Receta vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Guía de despliegue local (Geeky Gadgets): https://www.geeky-gadgets.com/serve-qwen-3-8-27b-fast/
- Guía local (Substack): https://linas.substack.com/p/qwen3-8-27b-local-guide
- Benchmarks y contexto del modelo base: https://benchlm.ai/models/qwen3-8-27b
