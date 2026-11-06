# DICPlay/RusMind-Zernyshko-1.10

## Resumen

RusMind Зёрнышко 1.10 es un modelo de generación de texto en ruso desarrollado por DICPlay, entrenado desde cero con tokenizador propio y publicado bajo la marca RusMind. Con 83 millones de parámetros (10 capas de 768 dimensiones) y un peso de aproximadamente 167 MB, está diseñado para ejecutarse completamente offline en portátiles y teléfonos. Emplea un formato de diálogo ChatML y una longitud de contexto de 1024 tokens.

El modelo se posiciona como la versión más fuerte de la línea "Зёрнышко" (semilla) de RusMind, con mejoras en la métrica MERA 2.0 (0,052) y en tareas de corrección ortográfica y puntuación del benchmark SAGE. El autor destaca que supera a modelos decenas de veces más grandes en tareas específicas de lógica, refranes, humor y conocimiento cultural ruso, aunque los valores absolutos de las métricas son muy bajos.

Es relevante ahora por su enfoque en eficiencia extrema: un modelo de 0,08B parámetros que, según la model card, supera a SmolLM-3B en la puntuación global de MERA 2.0 y a Qwen3.5-9B en gramática (SAGE) con una diferencia de 2,1 veces. La licencia es restrictiva para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer propio (RusMind AI), 10 capas × 768 dimensiones; requiere `trust_remote_code=True` |
| Parametros totales | 83.083.008 (0,08B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | GGUF disponible en repositorio separado (tipos concretos no disponibles) |
| Idiomas soportados | Ruso (ru) |
| Licencia | RusMind License (DICPlay); uso personal/no comercial libre, comercial solo por contrato escrito |
| Formato de pesos | safetensors (transformers); GGUF en repo aparte |

## Arquitectura y entrenamiento

La arquitectura es un transformer propio de la familia RusMind AI, con 10 capas y dimensión oculta de 768, entrenado completamente desde cero ("from-scratch") con un tokenizador propio. La model card no especifica el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF, DPO o ajuste por instrucciones. El formato de diálogo es ChatML.

La innovación principal declarada es el entrenamiento desde cero con tokenizador propio para ruso, orientado a un rendimiento gramatical y cultural desproporcionado para su tamaño. No se documentan innovaciones como decodificación especulativa, atención lineal ni arquitecturas híbridas. El uso de `trust_remote_code=True` es obligatorio para cargar la arquitectura personalizada.

## Capacidades

- Generación de texto conversacional en ruso con formato ChatML.
- Razonamiento lógico básico (tarea NewReasoning de MERA 2.0).
- Conocimiento de refranes y sabiduría popular rusa (tarea RUBIN).
- Comprensión de humor y enantiosemia (doble sentido léxico).
- Conocimiento de personajes y regiones de Rusia.
- Corrección ortográfica y colocación de comas (benchmark SAGE).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al ruso.

## Casos de uso

- Asistente conversacional offline en ruso: el modelo cabe en 167 MB y puede ejecutarse en un portátil o teléfono sin conexión, gestionando diálogos multi-turno dentro de su ventana de 1024 tokens.
- Corrección ortográfica y de puntuación en textos rusos: adecuado para preprocesar documentos o mensajes antes de publicarlos, dado su rendimiento en las tareas SAGE de comas y ortografía.
- Aplicaciones educativas de lengua rusa: puede usarse para ejercicios sobre refranes, personajes culturales y regiones de Rusia, donde obtiene puntuaciones destacadas para su tamaño.
- Prototipado rápido y experimentación: su reducido tamaño permite iterar en local sin GPU dedicada, útil para investigadores que evalúan arquitecturas desde cero.
- Filtrado o clasificación ligera de texto ruso: puede emplearse como generador de etiquetas o resúmenes muy cortos en pipelines de bajo coste.
- Despliegue en dispositivos embebidos o de recursos limitados: con GGUF y llama.cpp u Ollama, puede integrarse en aplicaciones de escritorio o móviles con requisitos mínimos de memoria.

## Benchmarks y rendimiento

Datos publicados en la model card según la metodología MERA 2.0:

| Tarea MERA 2.0 | Зёрнышко 1.10 (0,08B) | SmolLM-3B (3B) |
|---|---|---|
| Puntuación global | 0,052 | 0,049 |
| NewReasoning (lógica) | 0,146 | 0,049 |
| RUBIN (refranes) | 0,263 | 0,092 |
| Humor | 0,041 | 0,018 |
| Enantiosemy | 0,058 | 0,032 |
| LIMUR | 0,213 | 0,157 |
| Characters (personajes) | 0,177 | 0,129 |
| RussianRegions (regiones) | 0,031 | 0,024 |

Comparativas adicionales declaradas por el autor:

| Modelo comparado | Métrica | Зёрнышко 1.10 | Modelo comparado |
|---|---|---|---|
| GFusion-10B-A1.8B | NewReasoning | 0,146 | 0,057 |
| GFusion-10B-A1.8B | Humor | 0,041 | 0,035 |
| A-vibe 8B | RUBIN | 0,263 | 0,251 |
| Qwen3.5-4B | SAGE (gramática) | 0,257 | 0,038 |
| Qwen3.5-4B | RUBIN | 0,263 | 0,259 |
| Qwen3.5-9B | SAGE (gramática) | 0,257 | 0,121 |
| gemma-4-E4B-it | SAGE (gramática) | 0,257 | 0,124 |
| gemma-4-E4B-it | Characters | 0,177 | 0,075 |

Evolución de versiones de la propia línea:

| Métrica | 1.6 | 1.9 | 1.10 |
|---|---|---|---|
| MERA 2.0 | 0,049 | 0,048 | 0,052 |
| Comas (SAGE) | 0,267 | 0,335 | 0,409 |
| Ortografía (SAGE) | 0,062 | 0,102 | 0,149 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (167 MB de pesos); en cuantizaciones GGUF, aún menos.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es sobradamente suficiente.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles y embebidos.
- Opciones de despliegue: transformers con `trust_remote_code=True`, llama.cpp, Ollama y LM Studio mediante el GGUF del repositorio `DICPlay/RusMind-Zernyshko-1.10-GGUF`.
- Latencia y throughput: no disponibles en la información proporcionada; por tamaño, la inferencia en CPU es viable en tiempo interactivo para respuestas cortas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA 2.0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Зёрнышко 1.10 | 0,08B | 1024 | 0,052 | RusMind License (comercial restringida) | Hugging Face, GGUF |
| SmolLM-3B | 3B | no disponible | 0,049 | no disponible | Hugging Face |
| Qwen3.5-4B | 4B | no disponible | no disponible | no disponible | no disponible |
| gemma-4-E4B-it | ~4B | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a las métricas MERA 2.0 y SAGE publicadas por el autor; no hay datos homogéneos de contexto, licencia o benchmarks estándar para el resto de modelos en la información disponible.

## Limitaciones y advertencias

- Valores absolutos de benchmark muy bajos (MERA global 0,052), lo que indica capacidad limitada pese a las comparaciones relativas favorables.
- Contexto muy corto (1024 tokens), insuficiente para documentos largos o conversaciones extensas.
- Solo soporta ruso; no hay capacidades multilingües documentadas.
- Riesgo elevado de alucinación y de respuestas incoherentes por su reducido tamaño y entrenamiento desde cero.
- Sesgos conocidos: no documentados en la model card; al entrenarse con datos de cultura rusa, puede reflejar sesgos de ese corpus.
- Licencia restrictiva: el uso comercial, la reventa, la distribución de versiones modificadas y la integración en productos requieren contrato escrito con DICPlay.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; revisar antes de desplegar en producción.
- No se documentan tool calling, agentes ni modo de razonamiento; no apto para pipelines que dependan de estas capacidades.
- Modelo con 0 descargas y 0 likes en el momento de la ficha; madurez y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10
- GGUF: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.10-GGUF
- Versión anterior 1.9: https://huggingface.co/DICPlay/RusMind-Zernyshko-1.9
- Licencia: archivo `LICENSE` en el repositorio del modelo
- Benchmark MERA: no disponible enlace directo en la información proporcionada
- Papers, blogs y demos: no disponibles en la información proporcionada
