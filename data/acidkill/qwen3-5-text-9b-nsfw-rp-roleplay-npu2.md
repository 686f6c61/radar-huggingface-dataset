# acidkill/Qwen3.5-text-9B-NSFW-RP-RolePlay-NPU2

## Resumen

Qwen3.5-text-9B-NSFW-RP-RolePlay-NPU2 es una conversión experimental del modelo de rol conversacional sin censura DGDGDG12/Qwen3.5-text-9B-NSFW-RP-RolePlay, publicada por el usuario acidkill. Se trata de un modelo de texto de aproximadamente 8.950 millones de parámetros derivado de la familia Qwen3.5, especializado en roleplay y liberado de restricciones de contenido, empaquetado en formato nativo Q4NX para su ejecución sobre aceleradores NPU AMD XDNA2 mediante el runtime OpenFlowLM (OFLM).

La relevancia de esta ficha no reside en el modelo lingüístico en sí, sino en el formato de despliegue: es una de las primeras conversiones públicas de un modelo de 9B a un archivo nativo para NPU AMD, con cuantización mixta Q4_1/Q8/BF16 y kernels abiertos. El autor documenta de forma explícita y honesta las pérdidas de calidad frente al GGUF de origen, lo que convierte la model card en una referencia útil sobre el estado actual de la inferencia en NPU para modelos medianos.

El modelo conserva la plantilla ChatML original, no incluye pesos de visión ni audio, y está pensado exclusivamente para generación de texto en inglés. La conversión es con pérdida (lossy) porque parte de un GGUF ya cuantizado en Q4_K_M, no de los pesos BF16 originales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, text-only) |
| Parámetros totales | 8.953.803.264 (según el GGUF de origen) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens en la configuración de servicio probada |
| Tipos de cuantización | Nativa mixta Q4_1/Q8/BF16 en contenedor `model.q4nx`; origen Q4_K_M GGUF |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Q4NX (nativo OpenFlowLM para NPU AMD XDNA2); origen GGUF Q4_K_M |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Qwen3.5 con unos 8.950 millones de parámetros, afinado mediante LoRA para roleplay y publicado como release fusionado (merged). El autor de esta conversión no ha realizado entrenamiento adicional ni procesos de "uncensoring" extra: el modelo hereda el comportamiento del checkpoint base DGDGDG12/Qwen3.5-text-9B-NSFW-RP-RolePlay.

La innovación técnica de esta release es el pipeline de conversión a NPU: se parte del GGUF Q4_K_M existente y se traduce a un archivo Q4NX de 7.632.668.880 bytes (aproximadamente 7,63 GB / 7,11 GiB) que contiene 475 claves de tensor con nombres, formas y dtypes alineados con el esqueleto nativo fijado. La ejecución utiliza los kernels abiertos Qwen3.5-9B de OpenFlowLM (hash de especificación `sha256:4105149d...`), con los binarios de kernel y driver fuera del repositorio. Se preservan los 248.070 IDs de token del motor de texto, con EOS 248046 y PAD 248055, y sin BOS de origen. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens ni la composición del corpus del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, orientada a roleplay de personajes.
- Mantenimiento de persona y hechos de personaje a lo largo de conversaciones cortas (verificado en 2 escenarios de 3 turnos).
- Roleplay sin censura de contenido NSFW (etiqueta `not-for-all-audiences`).
- Plantilla ChatML con rama de "thinking desactivado" como configuración recomendada; el comportamiento con thinking activado no fue evaluado.
- Soporte parcial de tool calling: 1 de 2 casos de elección automática de herramienta resueltos correctamente.
- Capacidad limitada de formato estructurado: falla en JSON estricto (envuelve la salida en bloques Markdown).
- Multilingüe limitado: aunque completó un escenario en polaco, incumplió una restricción de longitud de palabras en ese idioma; solo el inglés está declarado oficialmente.
- Sin capacidades de visión ni audio: los pesos multimodales no están incluidos ni soportados.

## Casos de uso

- Roleplay conversacional local en inglés: el modelo está afinado específicamente para mantener personajes y puede desplegarse en una NPU AMD XDNA2 con un consumo de memoria de servicio medido de 11,67 GB, adecuado para máquinas de 32 GB sin GPU dedicada.
- Experimentación con inferencia en NPU: sirve como banco de pruebas para evaluar el runtime OpenFlowLM y los kernels abiertos Qwen3.5-9B en hardware AMD XDNA2, con métricas reproducibles de prefill y generación.
- Prototipado de narrativa interactiva sin censura: útil para escritura asistida de ficción y guiones de personaje donde se requiere contenido no filtrado, siempre en entornos controlados y con la advertencia de acceso restringido.
- Investigación sobre pérdida de calidad en cuantización encadenada: el par de métricas NPU2 vs. GGUF Q4_K_M (7/10 frente a 9/10 en checks generales) permite estudiar el impacto de una conversión lossy sobre un modelo ya cuantizado.
- Evaluación comparativa de backends: la tabla de latencias y throughput publicada (98,4 tok/s de prefill en NPU frente a 217,3 tok/s en GPU) facilita decisiones de arquitectura para despliegues de bajo consumo.
- Demostraciones de chat con API compatible con OpenAI: el servicio OFLM expone `/v1/chat/completions`, lo que permite integrarlo en clientes existentes para pruebas de personajes con `enable_thinking: false`.

## Benchmarks y rendimiento

El autor publica mediciones locales comparando la conversión NPU2 con el GGUF Q4_K_M de origen ejecutado en GPU (Ryzen AI 7 350, Radeon 860M, Krackan1 XDNA2, Linux 7.2.15, OFLM 0.1.0, llama.cpp `c1304d7`/ROCm 0). Condiciones: mismo prompt, temperatura 0, thinking off, contexto 4096, 3 muestras, 128 tokens generados.

| Métrica | NPU2 | GPU Q4_K_M |
|---|---:|---:|
| Prefill, mediana tok/s | 98,415 | 217,294 |
| Generación, mediana tok/s | 7,851 | 12,656 |
| Tiempo de pared por petición, mediana (s) | 29,063 | 15,841 |
| Latencia hasta primer contenido en streaming (s, n=1) | 13,083 | 5,708 |
| Petición aritmética en caliente, mediana (s) | 3,318 | 0,412 |

| Checks congelados | NPU2 | GPU Q4_K_M |
|---|---:|---:|
| Texto/instrucciones | 6/8 | 8/8 |
| Elección automática de herramienta | 1/2 | 1/2 |
| Total | 7/10 | 9/10 |
| Resultado "all-gates" configurado | fallido | fallido |

En los checks cortos de roleplay, ambos backends completaron un escenario de tabernero en inglés y otro de capitán en polaco (3 turnos cada uno), reteniendo los hechos finales requeridos del personaje en 2 de 2 escenarios y sin usar disclaimers genéricos de IA en las respuestas guardadas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Acelerador: NPU AMD XDNA2 (arquitectura Krackan1), probada en Ryzen AI 7 350.
- VRAM/RAM: el archivo de pesos ocupa aproximadamente 7,63 GB, pero el pico de cgroup del servicio NPU medido fue de 11,67 GB con contexto 4096 en una máquina de 32 GB. No debe equipararse el tamaño del archivo con la RAM en tiempo de ejecución.
- GPU: no aplica para esta release; el GGUF de origen puede ejecutarse en GPU AMD con ROCm (medido con 33/33 capas offloaded, 4.812,25 MiB de buffer de modelo en GPU y 545,62 MiB en CPU).
- GPU de consumo: el modelo base en GGUF Q4_K_M cabe en GPUs de consumo con 8 GB o más, aunque esta conversión concreta está pensada para NPU.
- Despliegue: exclusivamente mediante OpenFlowLM (OFLM 0.1.0) con kernels abiertos Qwen3.5-9B; requiere las variables `OPEN_KERNELS_FORCE_Q4_1=1` y `OFLM_QWEN35_ENGINE=open`, y el flag `--pmode performance`.
- Throughput y latencia: ver tabla de benchmarks; generación de 7,851 tok/s en NPU frente a 12,656 tok/s en GPU.
- Otros tamaños de RAM no han sido probados de forma independiente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/backend | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-text-9B-NSFW-RP-RolePlay-NPU2 (este) | ~8,95B | 4096 (probado) | Q4NX / NPU AMD XDNA2 | Apache 2.0 | Conversión lossy, 7/10 en checks |
| DGDGDG12/Qwen3.5-text-9B-NSFW-RP-RolePlay (origen) | ~8,95B | no disponible | GGUF Q4_K_M / GPU | Apache 2.0 | 9/10 en checks, 12,656 tok/s |
| Qwen3.5-9B base (referencia de familia) | ~9B | no disponible | safetensors/GGUF | Apache 2.0 | Sin especialización de roleplay |
| Modelos de roleplay 8B-9B de la familia Llama/Mistral | 8-9B | variable | GGUF/safetensors | variable | Alternativas de misma categoría; datos concretos no disponibles en la información proporcionada |

## Limitaciones y advertencias

- Conversión con pérdida: parte de un GGUF ya cuantizado en Q4_K_M, no de pesos BF16; no se reclama paridad de calidad con el modelo de origen.
- Pérdida de calidad medida: 7/10 frente a 9/10 en los checks generales congelados del autor.
- Fallo en formato estructurado: envuelve JSON solicitado en bloques Markdown y no respeta restricciones estrictas de formato.
- Fallo en tool calling: en el caso fallido de herramienta de búsqueda, ambos backends inventaron contenido JSON en lugar de invocar la herramienta; no debe usarse como evidencia de fiabilidad agéntica.
- Incumplimiento de instrucciones en idiomas distintos del inglés (fallo en límite de palabras en polaco).
- Contenido NSFW y sin censura: etiqueta `not-for-all-audiences`; requiere control de acceso y no es apto para aplicaciones orientadas al público general.
- Solo inglés declarado oficialmente; cobertura multilingüe no garantizada.
- Sin visión ni audio: los pesos multimodales no están incluidos ni soportados.
- Dependencia estricta del runtime OpenFlowLM y de kernels/drivers externos al repositorio; la verificación de kernels debe permanecer activada.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones formales de sesgo.
- Contexto limitado a 4096 tokens en la configuración probada; no se documenta soporte de ventanas mayores.
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado y la especialización NSFW pueden contravenir políticas de plataformas y legislación aplicable.
- Repositorio sin descargas ni likes en el momento de la consulta; modelo experimental sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/acidkill/Qwen3.5-text-9B-NSFW-RP-RolePlay-NPU2
- Modelo base: https://huggingface.co/DGDGDG12/Qwen3.5-text-9B-NSFW-RP-RolePlay
- OpenFlowLM (runtime y kernels): no disponible en la información proporcionada
- Paper o blog técnico: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
