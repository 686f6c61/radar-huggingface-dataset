# prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-NVFP4-GGUF

## Resumen

MiMo-V2.6-Distill-Qwen-9B-NVFP4-GGUF es una cuantización en formato GGUF (NVFP4) del modelo MiMo-V2.6-Distill-Qwen-9B, desarrollado por el equipo MiMo de Xiaomi y publicado por el usuario prithivMLmods en Hugging Face. El modelo base es un LLM agéntico de pesos abiertos con 9,19 mil millones de parámetros, obtenido mediante destilación de datos generados por MiMo y ajuste supervisado (SFT) sobre Qwen3.5-9B de Alibaba. Su propósito es servir como punto de partida para investigación en aprendizaje por refuerzo agéntico, con especial énfasis en ingeniería de software, ciberseguridad, uso de herramientas y codificación visual.

La relevancia de esta versión radica en dos aspectos: primero, la cuantización NVFP4 está optimizada para aceleradores NVIDIA Blackwell (RTX Pro 6000, serie RTX 50, B200, B300), aprovechando Tensor Cores nativos de FP4; segundo, el archivo GGUF incorpora Multi-Token Prediction (MTP), una forma de decodificación especulativa que integra cabezas de predicción adicionales en los propios pesos del modelo, eliminando la necesidad de un modelo "draft" separado y acelerando la inferencia local. El pipeline declarado es image-text-to-text, con archivo mmproj incluido para capacidades multimodales. La licencia es MIT, lo que permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE basado en Qwen3.5 (arquitectura qwen3_5_moe), con MTP para decodificación especulativa |
| Parámetros totales | 9.197.094.290 (~9,2 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 (FP4 optimizado para NVIDIA Blackwell) |
| Idiomas soportados | Inglés (declarado en la ficha) |
| Licencia | MIT |
| Formato de pesos | GGUF (NVFP4, 7,01 GB) + mmproj GGUF (922 MB) para visión |

## Arquitectura y entrenamiento

El modelo base, MiMo-V2.6-Distill-Qwen-9B, parte de Qwen3.5-9B y se entrena mediante ajuste supervisado sobre una mezcla de 77,4 mil millones de tokens generados por MiMo, de los cuales 27,2 mil millones son tokens con pérdida (loss-bearing). La mezcla de datos cubre cuatro dominios principales: codificación, tareas generales de agente, codificación visual y ciberseguridad. La ficha indica la etiqueta `qwen3_5_moe`, lo que sugiere una arquitectura de mezcla de expertos heredada de Qwen3.5, aunque el número de expertos y parámetros activos no se detallan en la información disponible.

La versión GGUF aquí descrita añade dos innovaciones de despliegue: la cuantización NVFP4, que explota los Tensor Cores de precisión FP4 de la arquitectura Blackwell de NVIDIA, y Multi-Token Prediction (MTP), que integra cabezas de predicción de tokens futuros dentro del propio archivo GGUF, permitiendo decodificación especulativa en una sola pasada hacia adelante sin modelo auxiliar. El modelo se distribuye con un tokenizador personalizado y la plantilla de chat MiMo v2.6, con soporte de razonamiento cadena-de-pensamiento mediante `enable_thinking=True`, separando las trazas de razonamiento en el campo `reasoning_content`.

## Capacidades

- Generación de texto conversacional con plantilla de chat MiMo v2.6 y modo de razonamiento activable (`enable_thinking=True`), con trazas separadas en `reasoning_content`.
- Resolución de incidencias de ingeniería de software (SWE-bench Verified: 61,1) y tareas de terminal (Terminal-Bench 2.1: 37,1).
- Codificación general y visual: procesa imágenes junto con texto (pipeline image-text-to-text, con archivo mmproj incluido) para tareas de codificación visual (MiMo Visual Coding mini: 64,0).
- Uso de herramientas (tool use): puntuación de 35,2 en Toolathlon-Verified, adecuado para flujos agénticos con function calling.
- Tareas agénticas multi-paso y automatización de oficina: AutomationBench 30,3, OfficeQA 19,5, JobBench 18,3.
- Ciberseguridad: 31,3 en MiMo Cyber (mini), frente a 5,7 de su modelo base Qwen3.5-9B.
- Razonamiento general: 62,2 en MiMo General (mini).
- Decodificación especulativa integrada vía MTP para inferencia local acelerada.

## Casos de uso

- **Agentes de ingeniería de software**: el modelo puede integrarse en pipelines de resolución automática de bugs y pull requests, dado su rendimiento en SWE-bench Verified (61,1) y SWE-bench Pro (44,6), superior al de su modelo base Qwen3.5-9B.
- **Automatización de tareas de oficina**: gracias a sus resultados en AutomationBench y OfficeQA, es adecuado para agentes que manipulan documentos, hojas de cálculo y aplicaciones de productividad de forma multi-paso.
- **Asistentes de código con visión**: con el archivo mmproj, puede analizar capturas de pantalla de IDEs, maquetas o diagramas de interfaz y generar el código correspondiente (codificación visual).
- **Ciberseguridad ofensiva y defensiva**: su destilación específica en el dominio cyber (31,3 en MiMo Cyber mini) lo hace útil para análisis de vulnerabilidades, redacción de exploits en entornos controlados y auditoría de código.
- **Orquestación de herramientas y APIs**: con Toolathlon-Verified en 35,2, puede actuar como agente que encadena llamadas a herramientas, consultas a APIs y ejecución de comandos en flujos de trabajo agénticos.
- **Inferencia local de alto rendimiento en hardware Blackwell**: la cuantización NVFP4 con MTP permite ejecutar el modelo en una RTX Pro 6000 o RTX 50-series con aceleración nativa FP4, ideal para prototipado de agentes sin depender de la nube.
- **Investigación en RL agéntico**: al ser un checkpoint de fundación diseñado para ese fin, sirve como base para experimentos de aprendizaje por refuerzo sobre tareas de agente.
- **Ejecución de tareas en terminal**: con 37,1 en Terminal-Bench 2.1, es apropiado para agentes que operan shells, gestionan entornos y depuran sistemas.

## Benchmarks y rendimiento

Resultados publicados del modelo base MiMo-V2.6-Distill-Qwen-9B frente a Qwen3.5-9B (su modelo de partida):

| Benchmark | MiMo-V2.6-Distill-Qwen-9B | Qwen3.5-9B (base) |
|---|---|---|
| SWE-bench Verified | 61,1 | 60,0 |
| SWE-bench Pro | 44,6 | 32,0 |
| MiMo Code (mini) | 51,6 | 19,5 |
| MiMo Cyber (mini) | 31,3 | 5,7 |
| AutomationBench | 30,3 | 5,0 |
| Terminal-Bench 2.1 | 37,1 | 27,0 |
| Toolathlon-Verified | 35,2 | 25,9 |
| OfficeQA | 19,5 | 9,0 |
| JobBench | 18,3 | 2,6 |
| MiMo General (mini) | 62,2 | 28,5 |
| MiMo Visual Coding (mini) | 64,0 | 61,7 |

No se han publicado resultados de benchmarks específicos para la cuantización NVFP4 (pérdida de calidad por cuantización no disponible).

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF NVFP4 pesa 7,01 GB, más 922 MB del mmproj si se usa visión; con contexto y sobrecarga de ejecución, se estima que caben en torno a 8-10 GB de VRAM, aunque el dato oficial no está disponible.
- GPU recomendadas: aceleradores NVIDIA Blackwell (RTX Pro 6000, serie RTX 50, B200, B300), que ofrecen aceleración nativa de Tensor Cores FP4. En hardware sin soporte FP4 nativo, la cuantización puede funcionar con dequantización por software, con penalización de rendimiento (no disponible como dato concreto).
- Consumer GPU: en principio cabe en GPUs de gama alta con 8 GB o más de VRAM (RTX 4070 y superiores), pero el rendimiento óptimo requiere la serie RTX 50 o RTX Pro 6000 con soporte SM120/Blackwell.
- Opciones de despliegue: llama.cpp (llama-cli, soporte GGUF con MTP y mmproj), SGLang (con `--reasoning-parser mimo`), vLLM y Hugging Face Transformers (para el modelo base sin cuantizar).
- Latencia y throughput estimados: no disponible; la ficha indica que MTP acelera significativamente la inferencia local, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| MiMo-V2.6-Distill-Qwen-9B-NVFP4-GGUF | 9,2 B | no disponible | NVFP4 (GGUF) | MIT | Enfoque agéntico, visión, MTP, optimizado Blackwell |
| Qwen3.5-9B (modelo base) | 9 B | no disponible | Varias (FP8, GGUF) | no disponible | Punto de partida; inferior en tareas agénticas y cyber |
| MiMo-V2.6-Distill-Qwen-9B (sin cuantizar) | 9,2 B | no disponible | BF16/FP8 | MIT | Misma capacidad, mayor consumo de memoria |

No se conocen alternativas de otros fabricantes con perfil idéntico (9 B agéntico + visión + FP4 nativo); comparables en tamaño estarían otros modelos de 8-10 B de las familias Qwen3 y Llama, cuyos datos específicos no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Idioma declarado: inglés. No se declara soporte para castellano ni otros idiomas; el rendimiento en español no está documentado.
- La longitud de contexto no está especificada en la ficha, lo que dificulta planificar tareas que requieran ventanas grandes.
- La cuantización NVFP4 está optimizada para hardware Blackwell; en GPUs anteriores (Ampere, Ada, Hopper) el rendimiento puede degradarse sustancialmente al no existir aceleración FP4 nativa.
- La cuantización a 4 bits implica inevitablemente cierta pérdida de calidad respecto al modelo base en precisión completa; no hay benchmarks que cuantifiquen esa degradación.
- Al tratarse de un modelo con fuerte destilación en ciberseguridad, puede generar contenido sensible relacionado con exploits; su uso debe restringirse a contextos legítimos y controlados.
- Riesgo de alucinación: no documentado específicamente, pero como todo LLM de 9 B, debe supervisarse en tareas de razonamiento factual y producción.
- Sesgos conocidos: no disponible; no se publica documentación de evaluación de sesgos.
- Licencia MIT: sin restricciones de uso comercial, aunque conviene revisar los términos de Qwen3.5 como modelo subyacente para atribuciones.
- El modelo está pensado como checkpoint de fundación para investigación en RL agéntico, no como producto final conversacional pulido.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-NVFP4-GGUF
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Archivo GGUF NVFP4: https://huggingface.co/prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-NVFP4-GGUF/blob/main/MiMo-V2.6-Distill-Qwen-9B-NVFP4.gguf
- Archivo mmproj (visión): https://huggingface.co/prithivMLmods/MiMo-V2.6-Distill-Qwen-9B-NVFP4-GGUF/blob/main/MiMo-V2.6-Distill-Qwen-9B-NVFP4.mmproj.gguf
- llama.cpp: https://github.com/ggml-org/llama.cpp
