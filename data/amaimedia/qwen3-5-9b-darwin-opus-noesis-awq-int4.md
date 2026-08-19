# AMAImedia/Qwen3.5-9B-Darwin-Opus-NOESIS-AWQ-INT4

## Resumen

Qwen3.5-9B-Darwin-Opus-NOESIS-AWQ-INT4 es una cuantización AWQ de 4 bits del modelo multimodal FINAL-Bench/Darwin-9B-Opus, desarrollada por AMAImedia como parte de su plataforma NOESIS de doblaje multilingüe profesional. El modelo base es un merge de Qwen/Qwen3.5-9B y Jackrong/Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled, construido con la metodología Darwin V5 (diagnósticos por tensor guiados por MRI al 70% y optimización genómica evolutiva al 30%, implementada mediante DARE-TIES). El resultado es un VLM con arquitectura híbrida de 32 capas de texto (24 GatedDeltaNet de atención lineal y 8 de atención completa) y un encoder de visión, con una ventana de contexto de 131 072 tokens.

Esta versión cuantizada reduce el peso del modelo de aproximadamente 18 GB en BF16 a unos 4,7 GB en disco, permitiendo inferencia de solo texto en GPUs de consumo con 6 GB de VRAM, como la RTX 3060. Es relevante porque democratiza el acceso a un modelo de razonamiento multilingüe de alto rendimiento en hardware modesto, y porque forma parte de un ecosistema de destilación de conocimiento (DHCF-FNO) donde actúa como profesor para modelos especializados en chat, código e investigación. La cuantización fue realizada con un pipeline propietario de AMAImedia, ya que la arquitectura híbrida de Qwen3.5 no es compatible con AutoAWQ estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (VLM híbrido: 24 capas GatedDeltaNet/linear_attention + 8 capas full_attention, cada 4ª capa) |
| Parametros totales | 8 953 803 264 (~8,95B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | AWQ INT4 (group_size=128, GEMM, zero_point=True) |
| Idiomas soportados | 201 idiomas (según el modelo base Qwen3.5-9B); etiquetado oficial: en, zh, ja, ko, de, fr, ru, ar, hi, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (AWQ INT4) |

## Arquitectura y entrenamiento

El modelo base Darwin-9B-Opus es un merge de dos modelos: el padre Qwen/Qwen3.5-9B (preentrenamiento original + RLHF) y la madre Jackrong/Qwen3.5-9B-Claude-4.6-Opus-Reasoning-Distilled (LoRA SFT sobre cadenas de razonamiento de Claude 4.6 Opus). La fusión se realizó con la metodología Darwin V5, que combina diagnósticos por tensor guiados por MRI (70%) con optimización genómica evolutiva (30%), implementada mediante DARE-TIES en PyTorch directo.

La arquitectura subyacente de Qwen3.5 es un VLM con encoder de visión y un decoder de texto híbrido: 24 capas de atención lineal (GatedDeltaNet) y 8 capas de atención completa distribuidas cada 4 capas. Esta hibridación busca combinar la eficiencia computacional de la atención lineal con la capacidad expresiva de la atención completa. La cuantización AWQ INT4 se aplica únicamente al decoder de texto: las capas GDN tienen su MLP cuantizado, mientras que las capas de atención completa tienen cuantizados tanto self_attn como MLP. El calibrado se realizó con 128 prompts diversos (código, razonamiento, chat, investigación) con longitud máxima de 512 tokens, y semilla RNG 1729 para reproducibilidad.

No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición exacta del dataset de preentrenamiento, ya que el modelo es un merge de pesos existentes y no un entrenamiento desde cero.

## Capacidades

- Generación de texto multilingüe en 201 idiomas, con especial énfasis en inglés, chino, japonés, coreano, alemán, francés, ruso, árabe, hindi y español.
- Razonamiento y resolución de problemas complejos, gracias a la destilación de cadenas de razonamiento de Claude 4.6 Opus en el modelo madre.
- Generación de código y asistencia en programación, con soporte para explicaciones técnicas y ejemplos prácticos.
- Capacidades matemáticas y de lógica, derivadas del entrenamiento del modelo base Qwen3.5.
- Conversación multi-turno y escritura creativa, optimizada para tareas de chat.
- Capacidad multimodal de visión (el modelo base es image-text-to-text), aunque la ruta de cuantización AWQ solo soporta entrada de texto.
- Soporte de tool calling y function calling: no se menciona explícitamente en la documentación, pero la arquitectura Qwen3.5 subyacente lo soporta de forma nativa.
- Integración con el framework NOESIS para destilación de conocimiento, actuando como profesor para modelos especialistas (M4-CHAT, M5-CODE, M6-RESEARCH).

## Casos de uso

- Asistencia técnica multilingüe en producción: con 131 072 tokens de contexto, puede gestionar conversaciones largas con historial completo y documentación adjunta, manteniendo coherencia en varios idiomas simultáneamente.
- Generación de código en entornos con recursos limitados: su tamaño de 4,7 GB y consumo de ~5,2 GB de VRAM lo hacen viable en estaciones de trabajo con GPUs de gama media, permitiendo integración en pipelines de CI/CD para revisión de código o generación de tests.
- Razonamiento y análisis de documentos extensos: la ventana de contexto de 128K tokens permite procesar informes, contratos o artículos científicos completos en una sola pasada, con capacidad de razonamiento multi-paso.
- Plataforma de doblaje automatizado: dentro del ecosistema NOESIS, actúa como profesor para destilar conocimiento en modelos especialistas de chat, código e investigación, mejorando su rendimiento sin necesidad de reentrenamiento completo.
- Chatbot de atención al cliente en múltiples idiomas: su soporte de 201 idiomas y su capacidad de conversación multi-turno lo hacen adecuado para desplegar asistentes virtuales en mercados internacionales con hardware modesto.
- Investigación académica en PNL: su licencia Apache 2.0 permite su uso en experimentos de destilación, evaluación de modelos cuantizados o estudios de eficiencia en arquitecturas híbridas, sin restricciones de uso comercial.
- Desarrollo de aplicaciones edge de procesamiento de lenguaje: su bajo consumo de VRAM permite ejecutarlo en dispositivos con GPUs integradas o eGPU, habilitando asistentes locales privados sin conexión a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Se recomienda evaluar el modelo en el caso de uso específico antes de su adopción en producción.

## Requisitos de hardware

- VRAM estimada para inferencia de solo texto: ~5,2 GB, lo que permite ejecución en GPUs de 6 GB como la RTX 3060.
- VRAM para inferencia multimodal: no disponible; la ruta AWQ no soporta entrada de visión, se requeriría el modelo BF16 base (~18 GB) para usar el encoder visual.
- GPUs recomendadas: RTX 3060 6 GB (mínimo), RTX 4060, RTX 4070, RTX 4080, RTX 4090, A100, H100 para mayor throughput.
- Opciones de despliegue: AutoAWQ (librería de carga), transformers con device_map={"": 0}. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la documentación.
- Latencia y throughput: no disponibles. El modelo usa kernel GEMM, lo que sugiere un rendimiento aceptable en GPUs NVIDIA, pero no se aportan cifras concretas.
- Espacio en disco: ~4,7 GB para los pesos cuantizados, más overhead del tokenizador y archivos de configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| AMAImedia/Qwen3.5-9B-Darwin-Opus-NOESIS-AWQ-INT4 | ~8,95B | 131 072 | AWQ INT4 | Apache 2.0 | VLM híbrido, multilingüe, enfocado a hardware de 6 GB |
| FINAL-Bench/Darwin-9B-Opus | ~8,95B | 131 072 | BF16 | Apache 2.0 | Modelo base sin cuantizar, requiere ~18 GB VRAM |
| Qwen/Qwen3.5-9B | ~9B | 131 072 | BF16 (original) | Apache 2.0 | Modelo padre, sin merge ni destilación de razonamiento |

La comparativa muestra que esta cuantización mantiene las mismas capacidades que el modelo base Darwin-9B-Opus en términos de arquitectura y contexto, pero reduce drásticamente los requisitos de hardware. Frente al Qwen3.5-9B original, incorpora la destilación de razonamiento de Claude 4.6 Opus y la hibridación de atención, aunque no se dispone de datos objetivos de rendimiento para cuantificar la mejora.

## Limitaciones y advertencias

- La ruta de cuantización AWQ no soporta entrada de visión; para usar el encoder visual es necesario cargar el modelo BF16 base, que requiere ~18 GB de VRAM.
- No se han publicado benchmarks independientes que validen el rendimiento del modelo cuantizado frente al original o a otros modelos de tamaño similar.
- El modelo tiene un vocabulario de 248 320 tokens, significativamente mayor que el de los modelos Qwen3 estándar (151 936). Esto puede causar incompatibilidades al integrarlo con otros sistemas que esperen un vocabulario más pequeño, como se advierte en el pipeline de destilación NOESIS.
- Al ser un merge de modelos, no se ha documentado el proceso de entrenamiento completo (datos, tokens, fases de RLHF), lo que dificulta evaluar posibles sesgos o alucinaciones heredadas de los modelos padre y madre.
- La cuantización AWQ fue realizada con un pipeline propietario no verificado externamente; aunque el autor indica compatibilidad con AutoAWQ 0.2.9, la arquitectura híbrida no es soportada por la versión upstream de AutoAWQ, lo que puede generar problemas de compatibilidad en futuras versiones de la librería.
- El uso de la metodología de merge Darwin V5 y del framework NOESIS está documentado de forma parcial; la reproducibilidad exacta de los pesos puede verse comprometida si no se dispone de los scripts originales.
- No se menciona soporte para tool calling o function calling en la documentación de esta cuantización específica, aunque la arquitectura subyacente podría soportarlo; se recomienda verificar antes de usarlo en agentes autónomos.
- El modelo está etiquetado como "endpoints_compatible" y "region:us", lo que sugiere un despliegue optimizado para la región de Estados Unidos; el rendimiento en otras regiones puede variar.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AMAImedia/Qwen3.5-9B-Darwin-Opus-NOESIS-AWQ-INT4)
- [Modelo base FINAL-Bench/Darwin-9B-Opus](https://huggingface.co/FINAL-Bench/Darwin-9B-Opus)
- [Organización AMAImedia](https://www.amaimedia.com)
- [Perfil de X (Twitter) de AMAImedia](https://x.com/AMAImediacom)
- [Perfil de LinkedIn de Ilia Bolotnikov](https://www.linkedin.com/in/ilia-bolotnikov)
- [Canal de Telegram de Ilia Bolotnikov](https://t.me/djbionicl)
