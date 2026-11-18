# JetBrains/Mellum2.1-12B-A2.5B-Thinking-GGUF

## Resumen

Mellum2.1-12B-A2.5B-Thinking-GGUF es la distribución cuantizada en formato GGUF del modelo de razonamiento Mellum2.1-12B-A2.5B-Thinking, desarrollado por JetBrains. Se trata de un modelo Mixture-of-Experts (MoE) con 12.149.923.072 parámetros totales y aproximadamente 2.500 millones de parámetros activos por token (64 expertos, 8 activados por token), diseñado específicamente para tareas de razonamiento mediante cadenas de pensamiento emitidas en bloques `<think>...</think>` antes de la respuesta final.

El modelo base incorpora una ventana de contexto de 131.072 tokens y una cabeza de predicción multi-token (MTP) que actúa como borrador especulativo en llama.cpp, acelerando la generación sin alterar la salida. Esta variante GGUF publica cinco niveles de cuantización (BF16, Q8_0, Q6_K, Q4_K_M y MXFP4_MOE) junto con los ficheros de la cabeza MTP, lo que permite desplegar el modelo en hardware de consumo con pérdidas de calidad medidas y documentadas.

La relevancia de esta publicación radica en que combina razonamiento explícito, arquitectura MoE eficiente en cómputo y licencia Apache 2.0, con builds listos para llama.cpp, Ollama y LM Studio. Con más de 350.000 descargas en Hugging Face, se posiciona como una opción práctica para integrar razonamiento local en entornos de desarrollo sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer con 64 expertos y 8 activados por token; cabeza MTP adicional para decodificación especulativa |
| Parametros totales | 12.149.923.072 (12,15 B) |
| Parametros activos | Aproximadamente 2,5 B por token (denominación A2.5B) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q4_K_M, MXFP4_MOE |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (un fichero por cuantización; también ficheros combinados modelo + cabeza MTP) |

## Arquitectura y entrenamiento

Mellum2.1 Thinking es un transformer con arquitectura Mixture-of-Experts: 64 expertos en total, de los cuales se activan 8 por token, lo que resulta en unos 2,5 B de parámetros activos sobre 12,15 B totales. El modelo fue entrenado con una cabeza de predicción multi-token (MTP): un bloque transformer adicional con la misma forma de atención y MoE que una capa del modelo, que predice el token siguiente al recién muestreado. En llama.cpp esta cabeza se usa como borrador especulativo (`--spec-type draft-mtp`), de modo que el modelo completo verifica cada token propuesto y la salida permanece idéntica mientras se acelera la generación cuando los borradores se aceptan.

El modelo emite su cadena de pensamiento dentro de bloques `<think>...</think>` antes de la respuesta final, lo que lo orienta a tareas de razonamiento multi-paso. La model card de esta distribución GGUF no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información se remite a la model card del modelo base. La cuantización se evaluó midiendo divergencia KL y coincidencia de top-token frente a los logits en BF16 sobre Wikitext-2 con `n_ctx=512`: Q8_0 presenta KLD 0,008 y 96,1 % de coincidencia; Q6_K, 0,020 y 93,9 %; Q4_K_M, 0,075 y 88,0 %; y MXFP4_MOE, 0,115 y 85,6 %.

## Capacidades

- Generación de texto conversacional con razonamiento explícito en bloques `<think>...</think>` antes de la respuesta final.
- Razonamiento multi-paso y resolución de problemas (el ejemplo de la model card es determinar si 1024 es una potencia de 2 explicando el razonamiento).
- Decodificación especulativa mediante la cabeza MTP integrada, con verificación por el modelo completo y salida sin cambios.
- Servicio con API compatible con OpenAI a través de `llama-server` en `http://localhost:8080/v1`.
- Soporte de llama.cpp, Ollama, LM Studio y otros runtimes compatibles con GGUF.
- Capacidades multilingües limitadas al inglés según el campo `language` de la model card.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Razonamiento matemático local: el modelo puede resolver problemas paso a paso emitiendo la cadena de pensamiento en `<think>`, útil para asistentes de estudio o validación de cálculos sin conexión a APIs externas.
- Asistencia al desarrollo en IDE: con 131.072 tokens de contexto puede analizar ficheros y fragmentos de código extensos y razonar sobre ellos antes de responder, integrándose en herramientas locales compatibles con la API de OpenAI.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M (8,1 GB) o MXFP4_MOE (7,0 GB) permite ejecutar el modelo en equipos con VRAM moderada manteniendo una coincidencia de top-token del 88,0 % y 85,6 % respectivamente.
- Servicio de inferencia autoalojado: `llama-server` expone un endpoint compatible con OpenAI, lo que permite sustituir llamadas a APIs comerciales en prototipos y pipelines internos con licencia Apache 2.0.
- Generación acelerada con decodificación especulativa: usando los ficheros combinados modelo + MTP (por ejemplo, `MTP-Q4_K_M`, 8,3 GB) se reduce la latencia en generación de texto largo sin modificar la salida.
- Evaluación y experimentación en investigación: las cinco cuantizaciones con métricas de KLD y coincidencia de top-token publicadas permiten estudiar el compromiso entre tamaño y fidelidad al modelo BF16 de referencia.
- Procesamiento de documentos largos en inglés: el contexto de 131.072 tokens admite resumir o razonar sobre documentos extensos en una sola pasada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta distribución GGUF únicamente incluye métricas de fidelidad de cuantización frente a BF16 sobre Wikitext-2 (`n_ctx=512`):

| Cuantizacion | Tamano | KLD vs BF16 (menor es mejor) | Coincidencia top-token (mayor es mejor) |
|---|---|---|---|
| BF16 | 24,3 GB | referencia | referencia |
| Q8_0 | 12,9 GB | 0,008 | 96,1 % |
| Q6_K | 10,9 GB | 0,020 | 93,9 % |
| Q4_K_M | 8,1 GB | 0,075 | 88,0 % |
| MXFP4_MOE | 7,0 GB | 0,115 | 85,6 % |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,0 GB (MXFP4_MOE), 8,1 GB (Q4_K_M), 10,9 GB (Q6_K), 12,9 GB (Q8_0) y 24,3 GB (BF16) solo para los pesos; hay que añadir la memoria de la caché KV para el contexto configurado, que con 131.072 tokens puede ser considerable.
- Ficheros combinados con cabeza MTP: 7,3 GB (MXFP4_MOE), 8,3 GB (Q4_K_M), 11,3 GB (Q6_K), 13,4 GB (Q8_0) y 25,2 GB (BF16); la cabeza MTP suelta en BF16 ocupa 1,8 GB.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño de pesos, las cuantizaciones de 4 bits caben en GPUs de consumo con 8-12 GB de VRAM; Q8_0 y BF16 requieren GPUs de mayor memoria (por ejemplo, A100 o H100) o partición entre CPU y GPU.
- Cabe en GPU de consumo: sí, al menos las variantes Q4_K_M y MXFP4_MOE según el tamaño de los pesos; el contexto completo de 131.072 tokens condiciona la VRAM efectiva necesaria.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama, LM Studio y otros runtimes compatibles con GGUF.
- Latencia y throughput: no disponibles. La model card indica que la decodificación especulativa con la cabeza MTP acelera la generación cuando los borradores se aceptan, pero no publica cifras de rendimiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés (`en`); no se documenta soporte de castellano ni de otros idiomas.
- Razonamiento explícito: el modelo emite cadenas de pensamiento en `<think>...</think>`, lo que incrementa el número de tokens generados y la latencia frente a modelos sin modo thinking; la model card usa `max_tokens=81920` en el ejemplo.
- Alucinación: no se documentan evaluaciones específicas de tasa de alucinación en la información disponible.
- Sesgos: no se documentan análisis de sesgos en la información disponible.
- Cuantización: las variantes de 4 bits pierden fidelidad respecto a BF16 (Q4_K_M con KLD 0,075 y 88,0 % de coincidencia de top-token; MXFP4_MOE con KLD 0,115 y 85,6 %), lo que puede afectar a tareas sensibles a la precisión.
- Contexto: aunque la ventana es de 131.072 tokens, la memoria de caché KV necesaria para aprovecharla condiciona el hardware; la model card no publica requisitos de VRAM para contexto completo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base en su propia model card.
- La cabeza MTP solo aporta aceleración en runtimes que soportan decodificación especulativa con `--spec-type draft-mtp` en llama.cpp; en otros runtimes puede no utilizarse.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking-GGUF
- Modelo base: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking
- llama.cpp: https://github.com/ggml-org/llama.cpp
- JetBrains: https://www.jetbrains.com/
- JetBrains en Wikipedia: https://en.wikipedia.org/wiki/JetBrains
