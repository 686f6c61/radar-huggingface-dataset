# loom-draft/fdtn-ai-Foundation-Sec-8B-Reasoning-Q4_K_M-loom

## Resumen

El repositorio `loom-draft/fdtn-ai-Foundation-Sec-8B-Reasoning-Q4_K_M-loom` no contiene un modelo entrenado desde cero, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado con la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `fdtn-ai/Foundation-Sec-8B-Reasoning-Q4_K_M-GGUF`. El modelo subyacente es Foundation-Sec-8B-Reasoning, un modelo de 8B parámetros especializado en ciberseguridad y cuantizado a Q4_K_M, del que este repositorio solo aporta los artefactos necesarios para servirlo en GPUs AMD concretas.

El paquete está dirigido explícitamente a dos aceleradores: el AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Se sirve mediante `loom-serve`, que expone una API compatible con `/v1/chat/completions` al estilo OpenAI, y se compara en rendimiento con llama.cpp ROCm (build `llamacpp-rocm/b1374`) usando el mismo GGUF y los mismos prompts.

Su relevancia es de nicho: no introduce capacidades nuevas de modelado, sino que documenta y empaqueta una ruta de inferencia optimizada para hardware AMD, con mejoras medidas de prefill (hasta +48 % en documentos de 32k tokens) y de decodificación agregada en 4 streams (+25 %) frente a llama.cpp en Strix Halo. Es útil para quien quiera ejecutar un modelo de seguridad de 8B en GPUs AMD con un stack distinto de llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en la información proporcionada (modelo base: Foundation-Sec-8B-Reasoning) |
| Parámetros totales | 8B (según el nombre del modelo base) |
| Parámetros activos | no aplica / no disponible |
| Longitud de contexto | 65 536 tokens (configuración de llama.cpp usada en la comparativa: `-c 65536`) |
| Tipos de cuantización | Q4_K_M (única incluida en este paquete) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (`foundation-sec-8b-reasoning-q4_k_m.gguf`) empaquetado como programas `.loom` + `model.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna ni sobre el proceso de entrenamiento del modelo base Foundation-Sec-8B-Reasoning en la documentación proporcionada; este repositorio no entrena ni modifica los pesos, solo los empaqueta. El checkpoint GGUF se distribuye sin cambios y el paquete Loom añade los artefactos de despliegue generados automáticamente por `loom-next` (sin LLM en el bucle de generación, según la model card).

La innovación técnica relevante aquí es de inferencia, no de modelado: el preset Loom aplica espera activa en las finalizaciones de GPU (`completion_spin_ns=4294967295`), pool de memoria fijo (`--pool_backing=fixed`) y precarga de parámetros (`--parameter_mode=preload`). Según la model card, no hay cabeza MTP en el GGUF ni drafter publicado para este modelo exacto, por lo que la decodificación especulativa no está disponible en ninguna de las dos implementaciones comparadas.

## Capacidades

- Generación de texto y razonamiento en el dominio de ciberseguridad, heredadas del modelo base Foundation-Sec-8B-Reasoning.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`), lo que facilita la integración con clientes existentes.
- Ejecución en GPUs AMD Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) mediante `loom-serve`.
- Soporte de múltiples streams concurrentes: la comparativa mide 4 peticiones paralelas con decodificación agregada.
- Contexto largo: se han medido cargas de prefill y decodificación con contextos de hasta 32k tokens y configuración de 65 536 tokens.
- Capacidades de tool calling, agentes, visión, audio o modo thinking: no disponibles en la información proporcionada para este paquete.

## Casos de uso

- Análisis de alertas de seguridad: el modelo base está orientado a ciberseguridad, y con 65 536 tokens de contexto puede ingerir logs extensos o volcados de eventos y resumir indicios de compromiso en una sola petición.
- Triaje de tickets de SOC: servir el modelo con `loom-serve` en una R9700 de 32 GB permite atender consultas multi-turno de analistas con una API compatible con OpenAI, integrándolo en herramientas ya existentes.
- Procesamiento por lotes de documentos largos: las mejoras de prefill medidas (+35 % a +48 % frente a llama.cpp en documentos de 1k a 32k tokens) lo hacen adecuado para pipelines que ingieren informes o código fuente voluminoso.
- Asistente interno de revisión de configuraciones: con contexto de 65k tokens se pueden pasar ficheros de configuración completos y obtener explicaciones o detección de malas prácticas.
- Despliegue en estaciones de trabajo con GPU AMD: el paquete está pensado para Strix Halo y R9700, por lo que encaja en entornos donde no se dispone de CUDA y se quiere evitar depender solo de llama.cpp.
- Servicio multiusuario ligero: los 166 tok/s agregados en 4 streams medidos en Strix Halo permiten atender varias sesiones concurrentes de baja latencia en un único equipo.
- Evaluación comparativa de motores de inferencia: sirve como referencia reproducible para medir Loom frente a llama.cpp ROCm con el mismo GGUF y los mismos prompts.

## Benchmarks y rendimiento

Rendimiento de inferencia medido en AMD Strix Halo (gfx1151), Loom frente a llama.cpp ROCm `b1374`, mismo GGUF y mismos prompts, mediana de 3 sesiones:

| Métrica | llama.cpp | Loom | Margen |
|---|---|---|---|
| Decode tok/s, prompt corto | 43,4 | 45,4 | +5 % |
| Decode tok/s, contexto 2k | 40,6 | 42,0 | +3 % |
| Decode tok/s, contexto 32k | 24,1 | 24,8 | +3 % |
| Prefill tok/s, documento 1k | 1235,4 | 1662,4 | +35 % |
| Prefill tok/s, documento 2k | 1214,8 | 1678,3 | +38 % |
| Prefill tok/s, documento 8k | 1074,2 | 1561,0 | +45 % |
| Prefill tok/s, documento 16k | 912,2 | 1298,1 | +42 % |
| Prefill tok/s, documento 32k | 695,1 | 1026,0 | +48 % |
| 4 streams, decode agregado tok/s | 132,5 | 166,0 | +25 % |
| Decodificación especulativa | n/a | n/a | n/a |

En Radeon AI PRO R9700 (gfx1201, 32 GB) los resultados "no se han vuelto a medir" según la model card. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el paquete se ha validado en una GPU de 32 GB (R9700) y en Strix Halo, con cuantización Q4_K_M sobre 8B parámetros.
- GPU soportadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no disponible; no se documenta soporte para GPUs de consumo (por ejemplo, Radeon RX) ni para NVIDIA.
- Despliegue: `hrx-loom[hf]==0.2.0` instalado con pipx, descarga con `loom-fetch` y servicio con `loom-serve`; la comparativa se hace contra llama.cpp ROCm `llamacpp-rocm/b1374`.
- Latencia y throughput: en Strix Halo, 45,4 tok/s de decodificación con prompt corto, 24,8 tok/s con contexto de 32k, 1662,4 tok/s de prefill con documento de 1k y 166 tok/s agregados con 4 streams.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Foundation-Sec-8B-Reasoning Q4_K_M (este paquete Loom) | 8B | 65 536 (config. medida) | MIT | GGUF + paquete Loom, `loom-serve` | Optimizado para GPUs AMD Strix Halo y R9700 |
| Foundation-Sec-8B-Reasoning Q4_K_M GGUF (original) | 8B | no disponible | MIT (según este paquete) | GGUF, llama.cpp u otros | Punto de partida sin modificar |
| llama.cpp ROCm `b1374` con el mismo GGUF | 8B | 65 536 (config. medida) | MIT | GGUF, llama.cpp | Motor de referencia en la comparativa; menor prefill y menor throughput agregado |

No se dispone de datos de otros modelos comparables (por ejemplo, otros modelos de seguridad de 8B) en la información proporcionada.

## Limitaciones y advertencias

- Este repositorio no es un modelo nuevo: cualquier limitación de calidad, sesgo o alucinación del modelo base Foundation-Sec-8B-Reasoning se hereda sin cambios.
- No hay información sobre sesgos, idiomas soportados ni tasas de alucinación en la documentación disponible.
- La licencia MIT se declara en este paquete; conviene verificar las condiciones del modelo base antes de uso comercial.
- El soporte de hardware está limitado a Strix Halo (gfx1151) y R9700 (gfx1201); no se documentan otras GPUs.
- En R9700 no se han vuelto a medir los resultados de rendimiento; las cifras publicadas corresponden solo a Strix Halo.
- No hay decodificación especulativa disponible (sin cabeza MTP en el GGUF ni drafter publicado para este modelo exacto).
- Solo se distribuye la cuantización Q4_K_M; no hay otras variantes en este paquete.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/fdtn-ai-Foundation-Sec-8B-Reasoning-Q4_K_M-loom
- Modelo base en Hugging Face: https://huggingface.co/fdtn-ai/Foundation-Sec-8B-Reasoning-Q4_K_M-GGUF
- Repositorio Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Ejecución de referencia de la comparativa: https://github.com/loom-fun/loom-next/actions/runs/45877009633
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/
