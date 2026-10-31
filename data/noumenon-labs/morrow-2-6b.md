# noumenon-labs/Morrow-2.6B

## Resumen

Morrow es un modelo conversacional experimental de 2.569 millones de parámetros desarrollado por noumenon-labs, basado en un fine-tune supervisado (SFT) de LiquidAI/LFM2-2.6B. A diferencia de los asistentes orientados a resolver tareas, Morrow se posiciona como un "compañero de conversación": su objetivo es ofrecer una personalidad natural y consciente del contexto en diálogos multi-turno, no simplemente devolver respuestas.

El proyecto se apoya en **Manner**, un dataset curado y verificado por humanos con un enfoque de *menos es más*: pocas conversaciones, pero seleccionadas para transmitir valores y un estilo de presencia concreta. El entrenamiento se realizó con el framework Unsloth.

Su relevancia actual es nicho pero interesante: demuestra cómo un fine-tune ligero y de alta calidad puede moldear el carácter conversacional de un modelo pequeño (LFM2 usa una arquitectura híbrida de convoluciones y atención, muy eficiente en dispositivos con recursos limitados). Al ser experimental y carecer de benchmarks formales, está pensado para evaluación y exploración más que para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida: capas convolucionales + atención), heredada de LiquidAI/LFM2-2.6B |
| Parametros totales | 2.569.272.320 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la familia LFM2 de LiquidAI soporta contextos amplios, pero el valor concreto no consta en la model card) |
| Tipos de cuantizacion | No disponible (repo en safetensors de 5,1 GB, presumiblemente bf16/fp16) |
| Idiomas soportados | Ingles |
| Licencia | Other (pendiente de confirmacion; revisar terminos del modelo base) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

Morrow hereda la arquitectura LFM2 de LiquidAI, una arquitectura transformer híbrida que combina capas convolucionales con capas de atención. Este diseño reduce significativamente el coste de inferencia en contextos largos frente a un transformer puro, lo que lo hace atractivo para despliegue en hardware modesto. El modelo base tiene 2.569 millones de parámetros, cifra confirmada por los metadatos de safetensors.

El fine-tune es un SFT (supervised fine-tuning) ejecutado con Unsloth sobre el dataset Manner, un conjunto curado de conversaciones verificadas por humanos. La filosofía del proyecto prioriza calidad sobre cantidad: en lugar de grandes volúmenes de ejemplos, se seleccionaron diálogos que reflejan valores, ideales y un tipo de presencia conversacional específica. Los autores reconocen explícitamente el trade-off de este enfoque: moldear el comportamiento puede degradar capacidades subyacentes, y plantean futuras iteraciones con extensión de capacidades y DPO (Direct Preference Optimization) para recuperarlas.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogo natural y con personalidad definida
- Conversaciones multi-turno con conciencia del contexto (mejora cualitativa reportada por los autores, sin benchmarks formales)
- Herencia parcial de las capacidades del modelo base LFM2-2.6B (generacion general, razonamiento basico), aunque los autores advierten de posibles regresiones por el fine-tune conductual
- No hay mencion de tool calling, function calling, agentes, vision ni audio en la model card
- Sin soporte documentado de idiomas distintos del ingles

## Casos de uso

- **Compañero conversacional personal**: diálogos abiertos multi-turno donde se valora naturalidad y coherencia de personalidad por encima de precisión factual; su tamaño de 2,6B permite ejecutarlo en hardware de consumo.
- **Prototipado de personajes para ficcion interactiva**: el fine-tune conductual con dataset curado lo hace util como base para NPCs o personajes con voz reconocible en juegos y narrativas conversacionales.
- **Investigacion en alineacion conductual**: punto de partida para experimentar con SFT de alta calidad y bajo volumen, y para estudiar el trade-off entre personalidad y capacidades que documentan los autores.
- **Chatbots decompania en dispositivos edge**: gracias a la eficiencia de la arquitectura LFM2 y a los 2,6B de parametros, cabe en GPUs de consumo o incluso en configuraciones CPU para companeros de conversacion locales y privados.
- **Base para DPO posterior**: los autores plantean DPO como siguiente paso, por lo que es util como modelo de partida en pipelines de RLHF/DPO experimentales.
- **Evaluacion de regresion por fine-tune**: caso de uso meta: comparar Morrow frente a LFM2-2.6B base para medir como un SFT conductual afecta a benchmarks estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las mejoras conversacionales se basan en pruebas cualitativas iniciales y que las comparaciones formales aun no se han establecido.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con pesos en bf16 (5,1 GB en disco), aproximadamente 5-6 GB de VRAM; con cuantizacion a 4 bits (GGUF/Q4), en torno a 1,5-2 GB (estimaciones basadas en el tamano del repo, no confirmadas por los autores)
- **GPUs recomendadas**: cualquier GPU de consumo con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 4090 con holgura); para servidores, cualquier GPU moderna de datacenter es mas que suficiente dado el tamano
- **Consumer GPU**: si, cabe comodamente en GPUs de gama media; es un candidato claro para ejecucion local
- **Despliegue**: compatible con la libreria transformers (pipeline text-generation); la familia LFM2 cuenta con soporte en llama.cpp y Ollama, por lo que es razonable que funcione via esos runtimes tras conversion a GGUF (no confirmado para este repo concreto); vLLM y TGI no confirmados
- **Latencia y throughput**: no disponible; la arquitectura hibrida LFM2 de LiquidAI esta disenada para inferencia rapida, pero no hay mediciones publicas de este fine-tune

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Enfoque |
|---|---|---|---|---|
| noumenon-labs/Morrow-2.6B | 2,57B | Hibrida LFM2 (conv + atencion) | Other (pendiente) | Companero conversacional (SFT conductual) |
| LiquidAI/LFM2-2.6B (base) | 2,57B | Hibrida LFM2 (conv + atencion) | LFM Open License (uso comercial permitido con condiciones) | Modelo base de proposito general |
| Qwen2.5-3B-Instruct | 3B | Transformer denso | Apache 2.0 / Qwen | Asistente general con tool calling |

Morrow se diferencia de alternativas de tamano similar en que no busca maximizar benchmarks sino caracter conversacional; frente a su modelo base, aporta personalidad pero con riesgo de regresion de capacidades. Frente a Qwen2.5-3B-Instruct, pierde en ecosistema, licencia clara y capacidades (tool calling, multilingue), pero ofrece un perfil de dialogo mas definido.

## Limitaciones y advertencias

- **Modelo experimental**: los propios autores advierten que las mejoras conversacionales son preliminares y que las capacidades, consistencia y posibles regresiones requieren evaluacion adicional
- **Riesgo de alucinacion**: elevado y documentado; la model card indica que puede producir informacion incorrecta o perder contexto
- **Trade-off conductual**: el fine-tune de personalidad puede haber reducido las capacidades del modelo base (razonamiento, codigo, matematicas); no hay datos que cuantifiquen la degradacion
- **Idioma**: solo ingles; no apto para castellano ni otros idiomas
- **Licencia sin confirmar**: la licencia aplicable esta pendiente de confirmacion; antes de redistribuir o usar comercialmente, hay que revisar los terminos de LiquidAI/LFM2-2.6B y la licencia del dataset Manner
- **Sin benchmarks ni tool calling**: no recomendable para produccion, agentes ni integraciones que requieran fiabilidad verificable
- **Descargas muy bajas (314)**: comunidad minima, sin evidencia de validacion por terceros

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/noumenon-labs/Morrow-2.6B
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B
- Paper, repositorio de codigo o demo: no disponible (no se han encontrado enlaces adicionales en la informacion proporcionada)
