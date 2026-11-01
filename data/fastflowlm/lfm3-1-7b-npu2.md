# FastFlowLM/LFM3-1.7B-NPU2

## Resumen

LFM3-1.7B-NPU2 es un empaquetado del modelo LiquidAI/LFM3-1.7B, desarrollado por Liquid AI y adaptado por FastFlowLM para ejecutarse sobre la NPU XDNA2 de los procesadores AMD Ryzen AI. No se trata de un modelo nuevo: los pesos son la versión oficial del vendor, cuantizada con destilación consciente de cuantización (QAD-Q4_0), reconvertida al formato propietario `model.q4nx` que consume el runtime FastFlowLM. El objetivo es permitir inferencia local de un LLM de 1.700 millones de parámetros directamente en la NPU del SoC, sin GPU dedicada.

La arquitectura es un transformer híbrido de 24 capas que combina 13 capas de convolución corta con compuerta, 5 capas de atención de ventana deslizante y 6 capas de atención completa, con un vocabulario de 128.000 tokens y soporte nativo de hasta 256k tokens de contexto (limitado a 32k en FastFlowLM). Incluye modo de razonamiento (thinking) activado por defecto y tool calling en formato XML estilo Qwen.

Su relevancia práctica es doble: por un lado demuestra que un modelo de este tamaño puede correr a velocidades utilizables (24-41 tokens/s de decodificación) en hardware de portátil con NPU; por otro, introduce una dependencia fuerte del runtime FastFlowLM 1.0.11 o superior, ya que los pesos no son cargables con llama.cpp, vLLM ni transformers estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 13 capas de convolución corta con compuerta (ancho 7), 5 capas de atención de ventana deslizante (ventana 256), 6 capas de atención completa |
| Parametros totales | 1.7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256k tokens en el modelo base; 32k tokens máximo en FastFlowLM |
| Tipos de cuantizacion | QAD-Q4_0 para pesos; Q4_1 para embedding/LM head atados; formato propietario `model.q4nx` |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (uso gratuito para investigación y uso comercial bajo umbral de ingresos definido en la licencia) |
| Formato de pesos | `model.q4nx` (propietario de FastFlowLM); el modelo base está disponible en GGUF y safetensors en LiquidAI/LFM3-1.7B |

Otros detalles técnicos: hidden 2048, FFN 7680, 16 cabezas de query y 4 de KV, dimensión de cabeza 128, compuerta sigmoide de atención por cabeza, sandwich RMSNorms, vocabulario de 128.000 tokens, formato de prompt ChatML.

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B de Liquid AI emplea una arquitectura híbrida que intercala capas de convolución corta con compuerta (similares en espíritu a las convoluciones de estado finito de arquitecturas tipo Mamba pero de ventana fija) con capas de atención de ventana deslizante y de atención completa. Esta mezcla reduce el coste computacional y de memoria frente a un transformer denso puro, lo que facilita su despliegue en NPUs con presupuesto energético limitado. La compuerta sigmoide por cabeza de atención y el uso de sandwich RMSNorms son detalles de estabilización del entrenamiento.

Los datos concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. Lo que sí se documenta es el proceso de cuantización: los pesos distribuidos en este paquete son la build QAD-Q4_0 del propio vendor, es decir, una cuantización a 4 bits con destilación consciente de cuantización, no una cuantización post-hoc. El runtime FastFlowLM ejecuta los cálculos de la NPU en bf16, lo que introduce pequeñas diferencias en los logits frente a una ejecución de referencia en PyTorch sobre los mismos pesos cuantizados.

## Capacidades

- Generación de texto conversacional y razonamiento con modo thinking activado por defecto (desactivable).
- Razonamiento matemático: 81,3% en GSM8K (primeras 150 preguntas, greedy, sin thinking) según datos del autor.
- Tool calling / function calling en formato XML estilo Qwen.
- Soporte de agentes y razonamiento multi-paso a través del modo thinking y del tool calling.
- Ventana de contexto efectiva de hasta 32k tokens en FastFlowLM, suficiente para conversaciones multi-turno y documentos largos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión ni audio.

## Casos de uso

- Asistente conversacional local en portátiles con Ryzen AI: el modelo corre íntegramente en la NPU con 24-41 tokens/s de decodificación, lo que permite un chatbot privado sin conexión ni GPU dedicada, con contexto de hasta 32k tokens para conversaciones largas.
- Servidor compatible con OpenAI en local: `flm serve lfm3:1.7b` expone una API compatible con OpenAI, lo que permite sustituir llamadas a la nube en prototipos y herramientas internas sin cambiar el código cliente.
- Automatización de tareas con tool calling: el formato XML estilo Qwen permite integrar el modelo en pipelines de agentes que invocan funciones locales (lectura de ficheros, consultas a bases de datos, llamadas HTTP) en entornos de escritorio.
- Razonamiento matemático y resolución de problemas de varios pasos: con el modo thinking activado, es adecuado para asistentes de estudio o validación de cálculos en aplicaciones educativas, con un rendimiento medido de 81,3% en GSM8K.
- Procesamiento de documentos medianos en local: la ventana de 32k tokens permite resumir o extraer información de contratos, informes o hilos de correo sin enviar datos a terceros, un requisito habitual en sectores regulados.
- Evaluación y desarrollo de aplicaciones edge: sirve como banco de pruebas para medir latencia y throughput reales en NPU antes de escalar a modelos mayores o a despliegues en flotas de dispositivos Ryzen AI.
- Generación de código asistida en IDE: aunque no se publican benchmarks de código, el soporte de tool calling y el contexto de 32k permiten usarlo como autocompletado o asistente de refactorización en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

Rendimiento de inferencia en AMD Ryzen AI MAX+ PRO 395 (solo NPU), según el autor:

| Contexto | 1k | 2k | 4k | 8k | 16k | 32k |
|---|---:|---:|---:|---:|---:|---:|
| Decodificación (tokens/s) | 41 | 40 | 39 | 36 | 31 | 24 |
| Prefill (tokens/s) | 1092 | 1543 | 1467 | 1397 | 1346 | 1223 |

Precisión:

| Test | Referencia PyTorch | FastFlowLM en NPU |
|---|---:|---:|
| Perplejidad WikiText-2 (6,1k tokens) | 19,23 | 20,16 |
| GSM8K, primeras 150 preguntas (greedy, sin thinking) | no disponible | 81,3% |

Con las capas de atención ejecutadas en CPU (`LFM3_DECODE=conv`), GSM8K sube al 84,0% a costa de menor velocidad de decodificación. La salida greedy en los prompts dorados del proyecto es idéntica a la referencia.

## Requisitos de hardware

- NPU AMD Ryzen AI con arquitectura XDNA2 (familias Ryzen AI 300 y Ryzen AI MAX). No funciona en GPUs NVIDIA, AMD Radeon ni CPU genérica con este paquete.
- VRAM estimada: no aplica; el modelo reside en memoria unificada del SoC. El repositorio ocupa 1,6 GB, lo que da una idea del peso en disco y en memoria de los pesos cuantizados.
- GPU recomendadas: no aplica; el requisito es la NPU integrada.
- Cabe en hardware de consumo: sí, en portátiles y mini-PC con Ryzen AI (XDNA2). No cabe en GPUs de consumo convencionales con este formato.
- Opciones de despliegue: exclusivamente FastFlowLM 1.0.11 o superior, mediante `flm run lfm3:1.7b` o `flm serve lfm3:1.7b` (servidor compatible con OpenAI). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 24-41 tokens/s de decodificación y 1.092-1.543 tokens/s de prefill según longitud de contexto, medidos en Ryzen AI MAX+ PRO 395.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Despliegue | Notas |
|---|---|---|---|---|---|
| FastFlowLM/LFM3-1.7B-NPU2 | 1.7B | 32k en FastFlowLM (256k en base) | LFM Open License v1.0 | Solo NPU AMD XDNA2 con FastFlowLM | Formato propietario, 24-41 tok/s en NPU |
| LiquidAI/LFM3-1.7B | 1.7B | 256k | LFM Open License v1.0 | GGUF, safetensors, transformers | Modelo base sin empaquetar; requiere runtime estándar |
| Qwen2.5-1.5B-Instruct | 1.5B | 32k | Apache 2.0 | vLLM, llama.cpp, Ollama, TGI | Ecosistema amplio, licencia permisiva |
| Llama 3.2 1B Instruct | 1.2B | 128k | Llama 3.2 Community License | vLLM, llama.cpp, Ollama, TGI | Buen soporte de tool calling, licencia con restricciones |

La comparación con Qwen2.5-1.5B y Llama 3.2 1B es orientativa por tamaño y categoría; no se dispone de benchmarks comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del runtime FastFlowLM: los pesos en `model.q4nx` no se pueden cargar con herramientas estándar, lo que limita la portabilidad y crea dependencia de una versión mínima (1.0.11).
- Restricción de hardware: solo funciona en NPUs AMD XDNA2; no hay soporte para GPU NVIDIA, AMD Radeon ni CPU.
- Licencia LFM Open License v1.0: el uso comercial es gratuito solo para organizaciones por debajo del umbral de ingresos indicado en la licencia; es imprescindible revisarla antes de desplegar en producción.
- El runtime de FastFlowLM se licencia por separado del modelo, con sus propias condiciones.
- Riesgo de alucinación: inherente a un modelo de 1.7B; no se han publicado evaluaciones de factualidad ni de sesgo.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; el rendimiento fuera del inglés no está documentado.
- Precisión reducida por la cuantización: la perplejidad en WikiText-2 pasa de 19,23 a 20,16 en la NPU, y el cálculo en bf16 introduce diferencias en los logits frente a la referencia.
- El modo thinking está activado por defecto, lo que incrementa el consumo de tokens y la latencia si no se desactiva explícitamente.
- Contexto efectivo limitado a 32k en FastFlowLM aunque el modelo base soporte 256k.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FastFlowLM/LFM3-1.7B-NPU2
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia: https://huggingface.co/LiquidAI/LFM3-1.7B/blob/main/LICENSE
- Repositorio FastFlowLM: https://github.com/FastFlowLM/FastFlowLM
