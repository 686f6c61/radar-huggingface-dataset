# bartowski/Ling-3.0-flash-Sante-GGUF

## Resumen

Ling-3.0-flash-Sante es un modelo de lenguaje de gran tamaño desarrollado por inclusionAI, del que bartowski ha publicado una colección completa de cuantizaciones en formato GGUF calculadas con matrices de importancia (imatrix) mediante llama.cpp (release b11804). Se trata de un modelo de 127 mil millones de parámetros (127.486.405.600 según el checkpoint original en safetensors) orientado a generación de texto conversacional, con soporte de razonamiento detallado ("detailed thinking") y de llamadas a herramientas (tool calling) mediante un formato de prompt específico con etiquetas XML.

La relevancia de esta ficha reside en la versión cuantizada: las cuantizaciones GGUF de bartowski permiten ejecutar un modelo de este tamaño en hardware propio, desde configuraciones multi-GPU hasta estaciones de trabajo con mucha RAM, con tamaños de archivo que van desde los 255 GB en BF16 hasta versiones de 3 bits por debajo de los 70 GB. El modelo soporta decodificación especulativa mediante MTP (Multi-Token Prediction), lo que puede mejorar significativamente la velocidad de inferencia.

Al tratarse de una cuantización de terceros, el modelo original y su documentación completa se encuentran en el repositorio de inclusionAI (inclusionAI/Ling-3.0-flash-Sante), disponible bajo licencia MIT, lo que permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer; soporta MTP para decodificacion especulativa) |
| Parametros totales | 127.486.405.600 (127B) |
| Parametros activos | no disponible (posible MoE, no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, IQ4_NL, Q4_K_M, Q4_1, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M, Q3_K_S (lista parcial en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizado por bartowski); checkpoint original en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (numero de capas, cabeceras de atencion, tipo de atencion ni tamano de vocabulario). Lo que si consta es que el checkpoint original pesa 127B parametros y que el modelo soporta decodificacion especulativa mediante MTP (Multi-Token Prediction), una tecnica en la que el modelo predice varios tokens por paso y un modulo de verificacion acepta o rechaza las predicciones, aumentando el throughput sin degradar la calidad.

No se dispone de datos sobre el dataset de entrenamiento, el numero de tokens de preentrenamiento ni sobre etapas de alineacion (RLHF, DPO). En cuanto a la cuantizacion publicada por bartowski, se ha realizado con llama.cpp release b11804 utilizando imatrix (matrices de importancia calculadas sobre un corpus de calibracion), lo que mejora la calidad de las cuantizaciones bajas (IQ3, Q3, Q4) frente a cuantizaciones sin calibrar.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento detallado con modo "thinking": el formato de prompt incluye la directiva `detailed thinking on` y el modelo genera su razonamiento dentro de etiquetas `<think>`, similar a otros modelos razonadores.
- Tool calling / function calling: soporte nativo mediante definiciones de funciones en XML dentro del system prompt y llamadas con etiquetas `<tool_call>`, incluyendo gestion de llamadas multiples y deteccion de parametros faltantes.
- Entrada de solo texto (input support: text); no hay soporte de vision ni audio indicado.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes conversacionales con razonamiento: gracias al modo "detailed thinking on" y a las etiquetas `<think>`, el modelo es adecuado para asistentes que necesitan descomponer problemas complejos antes de responder, como tutorias tecnicas o analisis de decisiones.
- Orquestacion de herramientas en agentes: el formato de tool calling con `<tool_call>` permite integrarlo en frameworks de agentes (LangChain, llama-index, agentes custom) para que consulte APIs, bases de datos o buscadores en flujos multi-paso.
- Ejecucion local privada: con las cuantizaciones Q4_K_M (80,39 GB) o IQ4_XS (71,11 GB) puede ejecutarse en estaciones de trabajo con 2 GPU de gama alta o en Mac Studio con memoria unificada, util para entornos donde los datos no pueden salir de la organizacion.
- Aceleracion de inferencia en produccion: el soporte de MTP permite usar decodificacion especulativa para aumentar tokens/segundo en servidores de inferencia, util en servicios con muchos usuarios concurrentes.
- Backends de chat autoalojados: puede servir como motor de un chatbot corporativo mediante llama.cpp o interfaces compatibles con GGUF, manteniendo el control total del despliegue bajo licencia MIT.
- Investigacion sobre cuantizacion y eficiencia: la coleccion completa de cuantizaciones (de bf16 a 3 bits) con imatrix es util para estudiar la degradacion de calidad frente al ahorro de memoria en modelos de 127B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: depende de la cuantizacion elegida. En BF16 se necesitan unos 255 GB; en Q8_0, unos 136 GB; en Q4_K_M (recomendado por defecto), unos 80 GB de archivo, mas la memoria KV cache y overhead del runtime (practicamente 90-100 GB en la practica).
- GPU recomendadas: para las cuantizaciones Q4/Q5 se requiere al menos 2x NVIDIA A100 80GB, 2x H100 80GB, o 4x RTX 4090 (24 GB cada una); tambien es viable en Apple Silicon con memoria unificada de 128 GB o mas (Mac Studio M2/M3 Ultra), donde las cuantizaciones Q4_1 y Q4_0 ofrecen mejores tokens/watt.
- Consumer GPU: no cabe en una sola GPU de consumo (ni siquiera una RTX 4090 de 24 GB); se necesita multi-GPU o descarga parcial a RAM (offload), con penalizacion severa de velocidad.
- Opciones de despliegue: llama.cpp (release b11804 o superior, formato para el que esta cuantizado), Ollama y LM Studio (ambos compatibles con GGUF). No consta soporte verificado en vLLM o TGI para estos GGUF; para vLLM habria que usar el checkpoint original en safetensors.
- Latencia y throughput: no disponible; el soporte MTP sugiere mejoras de throughput sustanciales, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Ling-3.0-flash-Sante | 127B | no disponible | MIT | safetensors / GGUF |
| Llama 3.1 405B | 405B | 128K | Llama 3.1 Community License | safetensors / GGUF |
| Qwen2.5 72B | 72B | 128K | Qwen License | safetensors / GGUF |
| Mixtral 8x22B | 141B (39B activos, MoE) | 64K | Apache 2.0 | safetensors / GGUF |

Ling-3.0-flash-Sante se situa en la franja de modelos grandes abiertos (127B), por debajo de Llama 3.1 405B y por encima de Qwen2.5 72B. Frente a Mixtral 8x22B, tiene mas parametros totales pero, si es un modelo denso, requeriria mas computo por token; su licencia MIT es mas permisiva que la de Llama y Qwen. No hay datos de rendimiento comparables publicados en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al tratarse de un modelo de 127B sin documentacion publica detallada en la ficha analizada, deben asumirse los sesgos tipicos de LLM entrenados con datos web a gran escala.
- Riesgo de alucinacion: presente como en cualquier LLM; el modo de razonamiento detallado puede reducir errores de razonamiento pero no elimina las alucinaciones factuales.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles en la informacion proporcionada; verificarlos en la model card original antes de produccion.
- Licencia: MIT, sin restricciones para uso comercial; no obstante, conviene revisar la model card original de inclusionAI por si existieran condiciones adicionales de uso.
- Caveats de produccion: el tamano del repo (1993,5 GB) y de los archivos individuales (hasta 255 GB en BF16, partidos en varios ficheros) exige planificar almacenamiento y descarga; las cuantizaciones de 3 bits (Q3_K_S, IQ3_M) pueden degradar apreciablemente la calidad en un modelo de este tamano y no se recomiendan salvo restricciones extremas de memoria.
- Esta ficha describe la cuantizacion de bartowski, no el modelo oficial; para soporte y actualizaciones del modelo base, acudir al repositorio de inclusionAI.

## Enlaces

- Cuantizacion GGUF (bartowski): https://huggingface.co/bartowski/Ling-3.0-flash-Sante-GGUF
- Modelo original (inclusionAI): https://huggingface.co/inclusionAI/Ling-3.0-flash-Sante
- llama.cpp (release usada para cuantizar): https://github.com/ggml-org/llama.cpp/releases/tag/b11804
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp/
