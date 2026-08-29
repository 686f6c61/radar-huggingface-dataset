# ARTEAMOffical/Aion-1.0-Pro

## Resumen

Aion-1.0-Pro es un modelo de lenguaje de 2.600 millones de parametros desarrollado por el equipo ARTEAMOffical, resultado de un fine-tuning sobre el modelo base unsloth/gemma-2-2b-it-bnb-4bit (Gemma 2 2B Instruct cuantizado a 4 bits mediante bitsandbytes). El entrenamiento se realizo con las librerias Unsloth y TRL de HuggingFace, lo que permitio un proceso aproximadamente dos veces mas rapido que un fine-tuning convencional. El modelo se distribuye bajo licencia Apache 2.0 y esta orientado a generacion de texto en ingles.

Al derivar de Gemma 2 2B, hereda una arquitectura decoder-only transformer con Grouped Query Attention y un patron de attention alternado entre ventanas locales y globales, disenado para equilibrar coste computacional y capacidad de capturar dependencias de largo alcance. Con 2,6B parametros y un repositorio de 5,3 GB en formato safetensors (precision bf16/fp16), esta pensado para despliegue en entornos con recursos limitados, incluyendo GPUs de consumo.

Es importante senalar que los resultados de busqueda web sobre "Aion 1.0" corresponden a proyectos no relacionados: los modelos Aion 1.0 Instruct y Aion 1.0 Plan de Microsoft (anunciados en Build 2026) y el sistema Aion-1.0 de AionLabs. No existe vinculacion alguna entre estos proyectos y el modelo objeto de esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (Gemma 2) con attention alternada local/global y Grouped Query Attention |
| Parametros totales | 2.614.341.888 (2,6B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (heredada del modelo base Gemma 2 2B; no confirmada explicitamente por el autor) |
| Tipos de cuantizacion | safetensors en precision completa (bf16/fp16); compatible con cuantizacion posterior (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Aion-1.0-Pro es un fine-tuning del modelo unsloth/gemma-2-2b-it-bnb-4bit, una version cuantizada a 4 bits de Gemma 2 2B Instruct. El entrenamiento se realizo utilizando Unsloth, una libreria de entrenamiento eficiente que acelera el proceso aproximadamente 2 veces respecto a metodos convencionales, junto con TRL (Transformer Reinforcement Learning) de HuggingFace. El autor no especifica si se emplearon tecnicas de alineacion como RLHF o DPO.

La arquitectura subyacente corresponde a Gemma 2 2B: un transformer decoder-only con Grouped Query Attention (GQA) y un patron de attention que alterna entre ventanas locales (sliding window attention) y attention global. Este diseno reduce el coste computacional por token manteniendo la capacidad de modelar dependencias de largo alcance. El modelo base fue entrenado por Google sobre aproximadamente 2 billones de tokens, aunque los detalles del dataset de fine-tuning de Aion-1.0-Pro no han sido publicados por el autor.

## Capacidades

- Generacion de texto e instrucciones en ingles, heredadas del modelo base Gemma 2 2B Instruct.
- Razonamiento y respuesta a preguntas de conocimiento general dentro del rango de capacidades de un modelo de 2,6B parametros.
- Generacion de codigo en multiples lenguajes, con rendimiento limitado por el tamano del modelo.
- Chat multi-turno y seguimiento de instrucciones basicas.
- Soporte de tool calling no confirmado; el modelo base Gemma 2 2B IT no incluye soporte nativo de function calling.
- Sin capacidades multimodales confirmadas (vision, audio).
- No se ha confirmado soporte de modo razonamiento extendido (thinking mode).

## Casos de uso

- Asistentes conversacionales locales: con 2,6B parametros, puede desplegarse en portatiles o mini-PCs con GPU de consumo para ofrecer chat en ingles sin dependencia de APIs en la nube, reduciendo latencia y costes.
- Generacion de codigo asistida en entornos de desarrollo: apto para autocompletado y generacion de fragmentos de codigo en editores, ejecutable en estaciones de trabajo con 6-8 GB de VRAM.
- Prototipado rapido de aplicaciones NLP: su licencia Apache 2.0 permite experimentar y construir demos sin restricciones comerciales, facilitando la iteracion rapida en proyectos internos.
- Educacion e investigacion en fine-tuning eficiente: al ser un ejemplo de QLoRA con Unsloth, sirve como caso de estudio para tecnicas de entrenamiento con recursos limitados.
- Despliegue en dispositivos edge: su tamano permite ejecucion en NVIDIA Jetson, Raspberry Pi con aceleradores o GPUs integradas, habilitando inferencia en el borde.
- Servicios de generacion de texto de baja latencia: mediante TGI o vLLM, puede servir respuestas rapidas en aplicaciones de reescritura, resumen o clasificacion de texto en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no ha incluido metricas como MMLU, HumanEval, GSM8K ni comparativas con otros modelos en la model card del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Precision completa (bf16): aproximadamente 5,2 GB de VRAM.
  - Cuantizacion 8 bits (GPTQ/AWQ): aproximadamente 2,6 GB de VRAM.
  - Cuantizacion 4 bits (GGUF/GPTQ): aproximadamente 1,3-2 GB de VRAM.
  - Se debe anadir VRAM adicional para KV cache y activaciones (tipicamente 1-2 GB).
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060/4070, RTX 4090, o cualquier GPU con al menos 6 GB de VRAM para precision completa. Tambien compatible con A100/H100 para despliegue en servidor.
- Si cabe en consumer GPU: si, en la mayoria de GPUs de consumo modernas. Con cuantizacion 4 bits puede ejecutarse en GPUs con 2-4 GB de VRAM.
- Opciones de despliegue: Text Generation Inference (TGI), vLLM, llama.cpp (previa conversion a GGUF), Ollama, HuggingFace Transformers con accelerate.
- Latencia y throughput: no disponible. Estimacion orientativa: en una RTX 4090 con precision bf16, un modelo de 2,6B puede generar tipicamente entre 50 y 150 tokens por segundo, aunque este dato no ha sido medido por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Aion-1.0-Pro (ARTEAMOffical) | 2,6B | 8192 | Apache 2.0 | Fine-tune de Gemma 2 2B IT |
| Gemma 2 2B IT (Google) | 2,6B | 8192 | Gemma License | Modelo base sin fine-tune adicional |
| Phi-3 Mini (Microsoft) | 3,8B | 128K | MIT | Modelo pequeno de Microsoft, contexto largo |
| Llama 3.2 3B (Meta) | 3,2B | 128K | Llama 3.2 License | Modelo pequeno de Meta con contexto amplio |
| Qwen 2.5 3B (Alibaba) | 3,1B | 32K | Apache 2.0 | Alternativa con licencia permisiva y contexto mayor |

Nota: la comparativa se basa en especificaciones publicas de cada modelo. No se dispone de benchmarks comparativos para Aion-1.0-Pro, por lo que no es posible evaluar su rendimiento relativo.

## Limitaciones y advertencias

- No se dispone de informacion sobre el dataset de fine-tuning, ni sobre los hiperparametros o el numero de pasos de entrenamiento, lo que impide evaluar posibles sesgos introducidos durante el proceso.
- El modelo hereda las limitaciones de Gemma 2 2B: alucinaciones en temas factuales, rendimiento limitado en razonamiento complejo, matematicas avanzadas y tareas que requieren conocimiento especializado.
- Solo se ha confirmado soporte del idioma ingles. No hay garantias sobre el rendimiento en otros idiomas, incluido el espanol.
- No se han publicado benchmarks, lo que dificulta la evaluacion objetiva del rendimiento respecto al modelo base o a alternativas comparables.
- La reproduccion del entrenamiento no es posible con la informacion disponible, ya que el autor no documenta el proceso completo.
- Aunque el modelo se publica bajo Apache 2.0, deriva de Gemma 2, que tiene su propia licencia con condiciones de uso aceptable. Es necesario verificar la compatibilidad de ambas licencias para uso comercial en produccion.
- El modelo no incluye soporte nativo de tool calling ni capacidades multimodales, lo que limita su uso en aplicaciones agente o en tareas que requieran entrada visual o auditiva.
- El repositorio presenta 0 descargas y 0 likes en HuggingFace, lo que sugiere que el modelo no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ARTEAMOffical/Aion-1.0-Pro
- Modelo base (Unsloth): https://huggingface.co/unsloth/gemma-2-2b-it-bnb-4bit
- Gemma 2 2B IT (Google): https://huggingface.co/google/gemma-2-2b-it
- Unsloth (libreria de entrenamiento): https://github.com/unslothai/unsloth
- TRL (libreria de HuggingFace): https://github.com/huggingface/trl

Nota: los resultados de busqueda web sobre "Aion 1.0" corresponden a proyectos no relacionados (Microsoft Aion 1.0 Instruct/Plan y AionLabs Aion-1.0). No se han incluido como enlaces de referencia por carecer de relacion con este modelo.
