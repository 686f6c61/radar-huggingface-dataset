# Atomic-Germ/Gemma4-E4B-GLM-NPU2

## Resumen

Gemma4-E4B-GLM-NPU2 es una conversión cuantizada del modelo Google Gemma-4-E4B-IT, con un fine-tune de estilo GLM, realizada por Atomic-Germ. El resultado se empaqueta en formato Q4NX, un formato de cuantización nativo del motor de inferencia FastFlowLM, diseñado específicamente para ejecutar modelos en las NPU AMD Ryzen AI con arquitectura XDNA2. El modelo base, Gemma 4 E4B, tiene 4.400 millones de parámetros, una ventana de contexto de 131.072 tokens y capacidades multimodales (texto, imagen y audio).

La relevancia de este modelo radica en que permite ejecutar un LLM de 4B con contexto extendido y entrada multimodal en el hardware NPU de portátiles AMD Ryzen AI 300 series o posteriores, sin necesidad de GPU dedicada. Esto abre la puerta a asistentes locales de bajo consumo energético con privacidad garantizada. El formato Q4NX no es compatible con GGUF ni con motores como llama.cpp u Ollama, por lo que su uso queda restringido al ecosistema FastFlowLM y a hardware AMD XDNA2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, imagen y audio) basada en Gemma 4 E4B |
| Parametros totales | 4.400 millones (4.4B) |
| Parametros activos | No aplicable (modelo denso, no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | Q4NX (formato empaquetado propietario de FastFlowLM, basado en Q4_1) |
| Idiomas soportados | ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

El modelo base, Google Gemma 4 E4B, es un transformer multimodal con torres de vision y audio que permiten procesar imagenes y sonido junto con texto. Incorpora un modo de razonamiento explicito (Thinking Mode) que el modelo puede activar para tareas complejas. Sobre este base, Atomic-Germ ha aplicado un fine-tune con estilo GLM (posiblemente inspirado en la familia ChatGLM de Zhipu), aunque la informacion disponible no detalla el dataset de entrenamiento ni el metodo de optimizacion empleado.

La innovacion principal de esta version es la cuantizacion Q4NX: FastFlowLM reorganiza los pesos en una disposicion empaquetada que se ajusta a los tamanos de tile y a los patrones de acceso a memoria del motor matricial de las NPU XDNA2. Esta reorganizacion permite que los kernels cerrados de FastFlowLM (xclbins) ejecuten el modelo de forma eficiente en la NPU, con un peso de 7.14 GB. El proceso de conversion no altera la arquitectura del modelo original, por lo que la configuracion del contexto (131.072 tokens) se mantiene intacta.

## Capacidades

- Generacion de texto conversacional en ingles con fluidez y coherencia multi-turno.
- Entrada multimodal: vision (procesamiento de imagenes) y audio, mediante los archivos `vision_weight.q4nx` y `audio_weight.q4nx`.
- Ventana de contexto extendida de 131.072 tokens, util para documentos largos y conversaciones prolongadas.
- Razonamiento multi-paso heredado del modelo base Gemma 4 E4B, incluido el modo Thinking.
- No soporta tool calling ni function calling de forma nativa segun la informacion disponible.
- No se menciona soporte para agentes autonomos o ejecucion de codigo.
- Capacidades multilingues limitadas al ingles en esta conversion especifica.

## Casos de uso

- Asistente local en portatiles AMD Ryzen AI: el modelo se ejecuta en la NPU con un consumo energetico reducido, lo que permite tener un asistente conversacional siempre activo en un portatil sin depender de la nube ni de una GPU dedicada.
- Analisis de documentos extensos: con 131.072 tokens de contexto, puede procesar manuales, informes o libros completos en una sola pasada y responder preguntas sobre el contenido, ideal para entornos corporativos con requisitos de confidencialidad.
- Vision por computador en edge: la torre de vision permite clasificar y describir imagenes localmente, por ejemplo en inventarios, inspeccion visual en fabricas o soporte tecnico remoto sin conexion.
- Transcripcion y resumen de audio: la torre de audio permite procesar grabaciones de reuniones o notas de voz y generar resumenes estructurados, todo en el dispositivo.
- Chat con contexto largo para investigacion: investigadores pueden cargar articulos cientificos completos (con graficos e imagenes) y mantener conversaciones de seguimiento sin perder el hilo gracias a la ventana de contexto amplia.
- Despliegue en sistemas embebidos con NPU AMD: empresas que desarrollan productos con Ryzen AI (kioscos interactivos, robots de servicio, etc.) pueden integrar este modelo para proporcionar respuestas locales y rapidas sin latencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) para este modelo en la informacion disponible. El autor proporciona unicamente una prueba de rendimiento llamada "GhostWriter Influence Test", realizada en un portatil AMD Ryzen AI 340 (Framework 13), con los siguientes datos:

| Metrica | Valor |
|---|---|
| Tokens de prompt | 9.210 |
| Tokens de completion | 1.741 |
| Tokens totales | 11.006 |
| Prefill Speed | 431.36 tokens/segundo |
| Decoding Speed | 8.03 tokens/segundo |
| Prefill Duration (TTFT) | 21.48 ms |
| Decoding Duration | 216.73 ms |
| Carga del modelo | 0.000000581 segundos |

Estos valores son orientativos y no comparables con benchmarks de calidad de modelo, ya que miden solo rendimiento de inferencia en un hardware concreto.

## Requisitos de hardware

- Procesador AMD Ryzen AI con arquitectura XDNA2 (NPU2), es decir, serie Ryzen AI 300 (Strix Point) o posterior.
- Sistema operativo Linux con el stack XRT (Xilinx Runtime) para NPU instalado.
- Memoria unificada de aproximadamente 15 GB para los pesos Q4NX (7.14 GB) mas activaciones y cache KV.
- No es compatible con GPU NVIDIA, AMD Radeon ni Intel Arc; la inferencia se ejecuta exclusivamente en la NPU.
- No corre en llama.cpp, Ollama, vLLM ni TGI; requiere el motor FastFlowLM >= 0.9.45 con su CLI `flm`.
- La latencia medida en el test de GhostWriter es de 21.48 ms para prefill y 8.03 tokens/seg para decoding, lo que indica una velocidad de generacion modesta, adecuada para chat interactivo pero no para generacion masiva en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware requerido |
|---|---|---|---|---|---|
| Gemma4-E4B-GLM-NPU2 | 4.4B | 131.072 | Q4NX | Apache 2.0 | AMD XDNA2 NPU |
| Gemma 4 E4B (original) | 4.4B | 131.072 | Safetensors (BF16) | Apache 2.0 | GPU (8GB VRAM minima) |
| Llama 3.2 3B (GGUF) | 3.2B | 128.000 | GGUF | Llama 3.2 Community License | GPU o CPU (llama.cpp) |
| Phi-3.5-mini (GGUF) | 3.8B | 128.000 | GGUF | MIT | GPU o CPU (llama.cpp) |

La comparativa muestra que Gemma4-E4B-GLM-NPU2 es el unico modelo de la lista disenado para ejecutarse en NPU de AMD, con una ventana de contexto similar a sus competidores y una licencia mas permisiva (Apache 2.0) que la de Llama 3.2. Sin embargo, su formato propietario Q4NX lo hace incompatible con cualquier otro runtime, mientras que las alternativas GGUF se pueden ejecutar en una variedad de hardware y software.

## Limitaciones y advertencias

- El modelo solo se ejecuta en AMD Ryzen AI con XDNA2; no es portable a GPU NVIDIA, CPU convencional ni otros aceleradores.
- El formato Q4NX no es compatible con GGUF, llama.cpp, Ollama, vLLM ni TGI; la dependencia del motor FastFlowLM y sus kernels cerrados (xclbins) limita el control y la transparencia del despliegue.
- Los kernels NPU son de codigo cerrado y no se distribuyen en el repositorio; se reutilizan los del modelo oficial `gemma4-it:e4b`, lo que puede generar incompatibilidades futuras si el motor cambia.
- El idioma soportado es unicamente ingles; no hay evidencia de un rendimiento adecuado en castellano u otros idiomas.
- Al ser un fine-tune con estilo GLM, no se han publicado evaluaciones de calidad del modelo; el rendimiento en tareas complejas puede diferir del modelo base Gemma 4 E4B.
- Riesgo de alucinaciones y sesgos inherentes al modelo base, que no se han mitigado en esta conversion.
- La licencia Apache 2.0 permite uso comercial, pero el motor FastFlowLM y los kernels NPU pueden tener licencias separadas que conviene revisar antes de desplegar en produccion.
- La velocidad de decoding medida (8 tokens/segundo) es baja en comparacion con la inferencia en GPU; para aplicaciones en tiempo real puede ser insuficiente.

## Enlaces

- Repositorio HuggingFace: [Atomic-Germ/Gemma4-E4B-GLM-NPU2](https://huggingface.co/Atomic-Germ/Gemma4-E4B-GLM-NPU2)
- Motor FastFlowLM: [https://fastflowlm.com](https://fastflowlm.com)
- Modelo base: [google/gemma-4-E4B-it](https://huggingface.co/google/gemma-4-E4B-it)
- Model card oficial de Gemma 4: [Google AI for Developers](https://ai.google.dev/gemma/docs/core/model_card_4)
- Pagina de Gemma 4 en DeepMind: [https://deepmind.google/models/gemma/gemma-4/](https://deepmind.google/models/gemma/gemma-4/)
- Guia del modelo Gemma 4 E4B: [https://gemma4.dev/models/gemma-4-e4b](https://gemma4.dev/models/gemma-4-e4b)
