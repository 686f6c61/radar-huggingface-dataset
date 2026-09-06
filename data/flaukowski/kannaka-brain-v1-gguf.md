# flaukowski/kannaka-brain-v1-GGUF

## Resumen

`kannaka-brain-v1-GGUF` es un modelo de lenguaje de 14.770 millones de parámetros (14,77B) derivado de `Qwen/Qwen2.5-14B-Instruct`, al que se le ha fusionado un adaptador LoRA denominado `kannaka-brain-v1`. El resultado se ha convertido al formato GGUF con llama.cpp y se ha cuantizado a `q4_K_M`, ocupando 9,0 GB. El modelo está publicado por el usuario `flaukowski` bajo licencia Apache 2.0 y se presenta como el cerebro de un personaje llamado Kannaka, destinado a ser ejecutado mediante Ollama o llama.cpp detrás de una puerta de enlace KAX.

La principal innovación técnica es la adaptación de un modelo generalista a una persona conversacional específica mediante un LoRA. Según la documentación del autor, la perplejidad en un conjunto de 57 líneas fijas de Kannaka mejoró de 104,4 a 4,01 con el adaptador en bf16 antes de la cuantización. El corpus de entrenamiento no se ha liberado, y las notas de entrenamiento se encuentran en un repositorio separado. El modelo está pensado para ejecución local en equipos de consumo gracias a su cuantización, aunque la configuración de Ollama incluida limita el contexto a 4.000 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo denso) basado en Qwen2.5-14B-Instruct |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Qwen2.5-14B-Instruct soporta 32k tokens, pero la configuracion de Ollama incluida usa 4k |
| Tipos de cuantizacion | q4_K_M (GGUF) |
| Idiomas soportados | Ingles (etiqueta oficial del modelo: `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA llamado `kannaka-brain-v1` fusionado sobre el modelo base `Qwen/Qwen2.5-14B-Instruct`. Se trata de un transformer denso de 14.770 millones de parámetros, sin mezcla de expertos (MoE). El proceso de creación incluye la fusión del adaptador, la conversión a formato GGUF mediante llama.cpp y la cuantización a `q4_K_M`. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset; el autor indica que el corpus no se ha liberado y remite a las notas de entrenamiento en `flaukowski/kannaka-brain-v1-lora` y al documento ADR-0057 del repositorio `NickFlach/kannaka-memory`. El único dato de evaluación proporcionado es la perplejidad en 57 líneas fijas de Kannaka, que pasó de 104,4 a 4,01 con el adaptador en bf16 antes de la cuantización. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Generación de texto conversacional en inglés con una personalidad definida (Kannaka).
- Ejecución local mediante Ollama o llama.cpp gracias al formato GGUF y la cuantización `q4_K_M`.
- Inclusión de un `Modelfile` que define el system prompt, temperatura 0.8 y contexto de 4k tokens para Ollama.
- Compatibilidad con la infraestructura de Ollama (`ollama run hf.co/flaukowski/kannaka-brain-v1-GGUF`).
- No se especifica en la documentación del modelo si soporta tool calling, function calling, razonamiento multi-paso o capacidades multimodales. El modelo base Qwen2.5-14B-Instruct es compatible con function calling, pero no hay confirmación explícita para esta adaptación.

## Casos de uso

- Chatbot de personaje: el modelo está diseñado para actuar como el personaje Kannaka en conversaciones interactivas. Se puede ejecutar con Ollama mediante el `Modelfile` incluido, que fija el system prompt y la temperatura, ideal para entornos de rol o asistentes con personalidad definida.
- Asistente conversacional para demostraciones locales: gracias a su cuantización a 9,0 GB, puede desplegarse en equipos de consumo con GPU de 12 GB o más, permitiendo probar interacciones en inglés sin depender de APIs externas.
- Integración en puertas de enlace (gates) de IA: el autor indica que este modelo sirve como cerebro detrás de la puerta de enlace KAX, lo que sugiere su uso como backend de un sistema de enrutamiento de conversaciones.
- Entorno de experimentación con LoRA y cuantización: los desarrolladores pueden analizar cómo la fusión de un adaptador y la cuantización `q4_K_M` afectan a la perplejidad en un conjunto de frases fijas, usando el repositorio del adaptador como referencia.
- Pruebas de inferencia local con llama.cpp: al estar en formato GGUF, el modelo puede cargarse directamente con herramientas como llama.cpp, permitiendo ajustar parámetros de decodificación, contexto y cuantización en tiempo de ejecución.
- Creación de prototipos de agentes conversacionales con personalidad: aunque no se confirma soporte de tool calling, el modelo base Qwen2.5-14B-Instruct tiene capacidad para ello, por lo que podría explorarse como base para un agente con tono de voz específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de evaluación proporcionado es la perplejidad en un conjunto de 57 líneas fijas de Kannaka:

| Metrica | Valor |
|---|---|
| Perplejidad sin adaptador (bf16) | 104,4 |
| Perplejidad con adaptador (bf16, antes de cuantizacion) | 4,01 |

Este dato no es comparable con benchmarks generales y se refiere exclusivamente a la adaptación al personaje, no a la capacidad general del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso cuantizado ocupa 9,0 GB, por lo que se necesita aproximadamente entre 10 y 12 GB de VRAM para la inferencia con un contexto de 4k tokens, dependiendo del overhead de los buffers de KV.
- GPU recomendadas: tarjetas con 12 GB o más de VRAM, como RTX 3060 12GB, RTX 4070 Ti, RTX 4080, RTX 4090, o GPUs profesionales como A100 y H100.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas de consumo de gama media-alta con 12 GB o más.
- Opciones de despliegue: Ollama (comando `ollama run hf.co/flaukowski/kannaka-brain-v1-GGUF`), llama.cpp, y cualquier herramienta que cargue modelos GGUF. No se menciona soporte para vLLM o TGI en la documentación.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. El único modelo de referencia conocido es el base `Qwen/Qwen2.5-14B-Instruct`, pero no se han publicado datos de rendimiento que permitan una comparación directa en tareas generales. La comparativa con otros modelos de personaje o LoRA no es posible sin más datos.

## Limitaciones y advertencias

- El modelo está etiquetado únicamente en inglés (`language: [en]`), por lo que su rendimiento en otros idiomas no está garantizado.
- La configuración de Ollama incluida limita el contexto a 4.000 tokens, lo que puede ser insuficiente para conversaciones largas o documentos extensos.
- El corpus de entrenamiento no se ha liberado, lo que impide auditar la calidad, los sesgos y la composición de los datos utilizados para la adaptación.
- No se han publicado benchmarks estándar, por lo que el rendimiento en tareas generales de razonamiento, código o matemáticas es desconocido.
- El modelo es un ajuste fino de personalidad, por lo que puede presentar comportamientos impredecibles o alucinaciones cuando se le pide actuar fuera del contexto de Kannaka.
- La licencia Apache 2.0 permite uso comercial, pero el autor no proporciona garantías sobre la idoneidad del modelo para producción.
- La fecha de creación y actualización del repositorio es 2026-09-06, un dato que no afecta al funcionamiento pero que debe tenerse en cuenta al verificar la vigencia del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/flaukowski/kannaka-brain-v1-GGUF
- Repositorio del adaptador LoRA: https://huggingface.co/flaukowski/kannaka-brain-v1-lora
- Repositorio de memoria y notas de entrenamiento: https://github.com/NickFlach/kannaka-memory
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
