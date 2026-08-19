# AnthonyDi/VoiceChatExperiment

## Resumen

`AnthonyDi/VoiceChatExperiment` es un conjunto de adaptadores experimentales publicados por AnthonyDi cuyo objetivo es sustituir el backbone semántico del modelo de voz a voz `nvidia/NVIDIA-NemotronLabs-VoiceChat-11B` por el modelo de lenguaje `Qwen/Qwen3.6-35B-A3B`. La propuesta busca conservar los componentes de audio de NVIDIA (FastConformer, AddFusion, cabezas de salida y temporización, RNNT, talker DuplexEARTTS y códec) mientras se reemplaza únicamente la parte semántica con un Qwen más grande y eficiente (35B con activación de 3B). El repositorio contiene dos adaptadores: una proyección de percepción (`perception_projection.safetensors`) y pesos LoRA de rango 8 (`qwen_lora.safetensors`), junto con la configuración del grafo compuesto y metadatos de entrenamiento.

Sin embargo, el autor es explícito: **este checkpoint no es un modelo de voz a voz funcional**. Aunque supera los controles de dependencia acústica en su etapa de margen de contenido, la prueba de ejecución libre con audio no visto falla en coherencia semántica y repite meta-texto. El resultado del gate es `FAIL_M2A_FREE_RUNNING_GATE`. Se publica con fines de reproducibilidad e investigación continua, no para despliegue. El repositorio no redistribuye los checkpoints base requeridos, por lo que su uso exige descargar previamente tanto NVIDIA VoiceChat-11B como Qwen3.6-35B-A3B.

La relevancia de este experimento radica en explorar si es viable intercambiar el backbone semántico de un sistema de voz de extremo a extremo sin retrain completo, un problema abierto en la comunidad de IA conversacional. No obstante, el resultado actual demuestra que la simple adaptación mediante LoRA y proyección no es suficiente para mantener la coherencia en ejecución libre, lo que sirve como advertencia para futuros intentos similares.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rank-8) + proyección de percepción sobre backbone Qwen3.6-35B-A3B, integrados en NVIDIA VoiceChat-11B |
| Parametros totales | no disponible (solo se publican los adaptadores, no el modelo completo) |
| Parametros activos | no disponible (el backbone Qwen3.6-35B-A3B tiene 3B activos, pero no se indica el total del sistema) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona BF16 para Qwen, pero no se especifican cuantizaciones para los adaptadores) |
| Idiomas soportados | no disponibles (el modelo base de NVIDIA soporta inglés, pero no se documenta para este adaptador) |
| Licencia | other (se aplican licencias de los modelos base: OpenMDW 1.1 para NVIDIA, y la de Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors (perception_projection.safetensors, qwen_lora.safetensors) |

## Arquitectura y entrenamiento

El experimento consiste en un conjunto de adaptadores diseñados para reemplazar el backbone semántico de `nvidia/NVIDIA-NemotronLabs-VoiceChat-11B` con `Qwen/Qwen3.6-35B-A3B`. El sistema resultante conserva los componentes de audio de NVIDIA: FastConformer para codificación acústica, AddFusion para fusión de modalidades, cabezas de salida y temporización, RNNT para decodificación, el talker DuplexEARTTS y el códec de audio. El backbone semántico pasa a ser Qwen3.6-35B-A3B, un modelo MoE de 35B parámetros totales con 3B activos, que ofrece mayor capacidad semántica que el backbone original.

El entrenamiento se realizó sobre pares conversacionales reales de SpokenWOZ, empleando el curriculum de reloj/canal del paper SALM-Duplex. Se combinaron varias técnicas: destilación de la ruta de texto top-64 de Qwen fuera de línea, pérdida de entropía cruzada con respuestas ground-truth, alineación de representaciones compactas del lado del usuario, replay de texto, muestreo programado y un margen de audio incorrecto alineado en duración. Tanto el entrenamiento como la inferencia usan Hugging Face Transformers/PyTorch directamente; no se utiliza vLLM.

Un detalle técnico relevante es el marco de operación: se eligió un marco de 120 ms como fallback porque la puerta estricta de 80 ms para servicio directo con HF no pasó en la GPU de prueba GH200. El resultado final de la puerta de ejecución libre fue `FAIL_M2A_FREE_RUNNING_GATE`, lo que indica que el modelo no logra coherencia semántica en condiciones no vistas, repitiendo frases como "I will provide a response in English." El autor sugiere que se necesita co-adaptación del codificador o mezcla de modalidad continua programada antes de intentar etapas posteriores de política dúplex.

## Capacidades

- **No es un modelo funcional de voz a voz**: el propio autor declara que el checkpoint no funciona como sistema de voz a voz en ejecución libre.
- **Generación de texto con fallos**: en la prueba con audio no visto, el modelo repite meta-texto y no produce respuestas coherentes.
- **Sin soporte de tool calling ni agentes**: no se documenta ninguna capacidad de este tipo.
- **Sin capacidades multilingües demostradas**: no se especifican idiomas soportados.
- **Sin modo de razonamiento especial**: no se menciona thinking mode ni otras capacidades avanzadas.
- **Experimental y para investigación**: la única capacidad real es servir como referencia para estudiar la sustitución de backbones semánticos en sistemas de voz.

## Casos de uso

Dado el estado fallido del modelo, no existen casos de uso prácticos para producción. Sin embargo, puede tener utilidad en contextos de investigación:

- **Investigación sobre sustitución de backbones en sistemas de voz**: el repositorio incluye la configuración exacta del grafo compuesto y los metadatos de entrenamiento, lo que permite a otros investigadores reproducir el experimento y analizar por qué falla la coherencia semántica.
- **Estudio de adaptación LoRA para modelos multimodales**: los pesos LoRA de rango 8 sobre Qwen3.6-35B-A3B pueden servir para entender los límites de la adaptación paramétrica eficiente en tareas de voz.
- **Análisis de fallos en destilación de rutas de texto**: el curriculum de destilación top-64 y el margen de audio incorrecto son técnicas que pueden evaluarse en otros contextos.
- **Referencia negativa para futuros diseños**: documenta un enfoque que no funciona, útil para evitar repetir errores en la comunidad.
- **Pruebas de hardware de inferencia**: el fallback de 120 ms y la prueba en GH200 ofrecen datos sobre requisitos de latencia en sistemas de voz con Transformers directos.
- **Desarrollo de curriculum de entrenamiento para voz**: el uso de SpokenWOZ y el curriculum SALM-Duplex pueden inspirar nuevos métodos de entrenamiento.

En ningún caso se recomienda su uso en aplicaciones reales de atención al cliente, asistentes de voz o generación de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento es el resultado de la puerta de ejecución libre: `FAIL_M2A_FREE_RUNNING_GATE`, que indica un fallo completo en coherencia semántica. No hay métricas como MMLU, HumanEval o GSM8K porque el modelo no es funcional y no se ha evaluado en tareas estándar.

## Requisitos de hardware

No se especifican requisitos detallados de hardware en la información proporcionada. Sin embargo, se pueden inferir algunos datos:

- El autor menciona que la prueba de la puerta de 80 ms se realizó en una GPU GH200, lo que sugiere que el sistema requiere hardware de gama alta.
- El backbone Qwen3.6-35B-A3B tiene 35B parámetros totales (3B activos), por lo que la inferencia en BF16 requeriría al menos 70 GB de VRAM para los pesos completos, más memoria para los adaptadores y los componentes de audio de NVIDIA.
- No se indica si cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB); probablemente no, dado el tamaño del modelo base.
- Para despliegue, no se mencionan opciones como vLLM, llama.cpp u Ollama. El autor indica que se usa Hugging Face Transformers/PyTorch directamente.
- La latencia no se documenta, pero el fallback de 120 ms por frame sugiere que el sistema opera en tiempo real solo con ese marco.

## Comparativa con modelos similares

No hay modelos comparables directos, ya que este es un adaptador experimental para un sistema de voz específico. Se pueden comparar los modelos base:

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| NVIDIA-NemotronLabs-VoiceChat-11B | 11B | no disponible | OpenMDW 1.1 | Funcional (voz a voz) |
| Qwen3.6-35B-A3B | 35B totales, 3B activos | no disponible | no especificada | Funcional (texto) |
| AnthonyDi/VoiceChatExperiment | adaptadores (LoRA rank-8) | no disponible | other | No funcional |

No se dispone de información sobre alternativas como otros sistemas de voz a voz open source (p. ej., Mini-Omni, Qwen-Audio) para comparar directamente.

## Limitaciones y advertencias

- **No funcional**: el modelo falla en la prueba de ejecución libre, repitiendo meta-texto y sin coherencia semántica. No debe usarse en ningún entorno de producción.
- **Sesgos y alucinaciones**: al no ser funcional, no se han evaluado sesgos, pero el comportamiento observado (repetición de frases) indica un riesgo alto de alucinación si se forzara su uso.
- **Limitaciones de contexto e idioma**: no se documentan; el modelo base de NVIDIA está entrenado principalmente en inglés, pero no hay garantía para otros idiomas.
- **Restricciones de licencia**: la licencia es "other" y se aplican las licencias de los modelos base (OpenMDW 1.1 para NVIDIA). Es imprescindible revisar las licencias originales antes de cualquier uso, incluso de investigación.
- **Dependencia de checkpoints externos**: el repositorio no redistribuye los modelos base, por lo que el usuario debe descargarlos por separado y verificar sus revisiones exactas.
- **Reproducibilidad limitada**: el autor no proporciona el código de entrenamiento completo, solo los adaptadores y metadatos. La reproducción exacta puede ser difícil.
- **Hardware exigente**: requiere GPUs de alta gama (al menos 70 GB de VRAM para Qwen en BF16) y no se garantiza el funcionamiento en hardware de consumo.
- **Caveat para investigación**: aunque se publica para investigación, el fallo documentado debe tenerse en cuenta para no basar trabajos futuros en este enfoque sin modificaciones sustanciales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AnthonyDi/VoiceChatExperiment
- Modelo base NVIDIA (referencia): https://huggingface.co/nvidia/NVIDIA-NemotronLabs-VoiceChat-11B
- Modelo base Qwen (referencia): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- No se encontraron papers, blogs o demos adicionales en la búsqueda web.
