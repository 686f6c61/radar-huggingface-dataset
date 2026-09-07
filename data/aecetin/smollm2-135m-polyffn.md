# aecetin/SmolLM2-135M-PolyFFN

## Resumen

SmolLM2-135M-PolyFFN es una versión modificada de HuggingFaceTB/SmolLM2-135M-Instruct, desarrollada por aecetin (Dr. A. Emre Çetin). El modelo sustituye las 30 capas feed-forward (FFN) del transformer original por operadores tensoriales polinómicos ortogonales de Chebyshev, obtenidos mediante resolución algebraica de forma cerrada sin retropropagación. Esta "cirugía de pesos" persigue reducir los parámetros de las capas FFN a la mitad y acelerar la convergencia del proceso de optimización por capa, sin degradar la calidad de la generación según el autor.

El modelo mantiene la arquitectura Transformer decoder-only del modelo base, con un total de 123.065.280 parámetros según los ficheros safetensors. La model card reporta un total de 94.756.224 parámetros tras la cirugía, cifra que no coincide con el conteo real de los pesos distribuidos. El modelo está pensado para la investigación de técnicas de compresión y eficiencia de inferencia, aunque no se han publicado benchmarks estándar que respalden su rendimiento en tareas concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) con capas FFN transformadas en operadores polinómicos ortogonales de Chebyshev |
| Parametros totales | 123.065.280 (según safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de HuggingFaceTB/SmolLM2-135M-Instruct, un transformer ligero con 30 capas FFN (SwiGLU). La modificación sustituye el bloque FFN original —que combina proyecciones gate, up y down con una activación SiLU— por un operador polinómico de Chebyshev definido como `PolyFFN(x) = sum_{k=0}^K C_k · T_k(x~) + b`. Los coeficientes `C_k` se resuelven analíticamente mediante ecuaciones normales regularizadas `C* = (Φ(X)^T Φ(X) + λI)^(-1) Φ(X)^T Y` y se proyectan sobre un subespacio idempotente `Π = V_r V_r^T` que cumple `Π^2 = Π`.

El proceso de optimización no utiliza retropropagación: se resuelve de forma cerrada por capa mediante SVD y regresión ridge. Según la model card, el tiempo de convergencia por capa se reduce de ~33,5 s (GPU, con AdamW y backprop) a ~139 ms, un factor de 240,9. El autor reporta un error de idempotencia algebraico de `4,70 × 10^-5`. El modelo base fue afinado con el dataset `cosmo2`, pero no se detallan los tokens de entrenamiento ni el proceso de alineación. La discrepancia entre los parámetros reportados en la model card (94.756.224) y los presentes en los safetensors (123.065.280) no está explicada en la documentación disponible.

## Capacidades

- Generación de texto en inglés heredada del modelo instruct base, con calidad descrita como "natural y coherente" por el autor.
- Inferencia eficiente en entornos con recursos limitados gracias a la reducción de parámetros en las capas FFN.
- No se han documentado capacidades de tool calling, function calling, agentes, visión, audio o razonamiento multi-step.
- No se ha verificado de manera independiente el comportamiento en tareas de razonamiento complejo o comprensión larga.

## Casos de uso

- Asistente conversacional en dispositivos embebidos: el tamaño de 123M parámetros permite ejecutar el modelo en CPUs modestas o single-board computers, por ejemplo para chatbots en inglés con respuestas cortas.

- Prototipado rápido en entornos sin GPU: dada su ligereza, puede usarse para generar texto de forma interactiva en notebooks o equipos de desarrollo con poca memoria, sin necesidad de hardware especializado.

- Investigación en compresión de modelos: el modelo sirve como caso de estudio para analizar la viabilidad de reemplazar capas FFN por operadores polinómicos ortogonales sin retropropagación.

- Generación de resúmenes técnicos en inglés: su capacidad instruct permite producir resúmenes breves de documentos o artículos en aplicaciones de bajo coste, pese a sus limitaciones de contexto.

- Experimentos de fine-tuning académico: al estar bajo licencia Apache 2.0, puede adaptarse a dominios específicos, aunque no hay estudios que analicen cómo afecta la transformación polinómica al ajuste posterior.

- Educación sobre arquitecturas alternativas: es un ejemplo práctico de "cirugía de pesos" y resolución algebraica cerrada, útil para cursos o laboratorios de arquitecturas de redes neuronales.

## Benchmarks y rendimiento

La model card incluye métricas internas reportadas por el autor, pero no se han publicado resultados de benchmarks estándar en la información disponible.

| Métrica | SmolLM2-135M original | SmolLM2-135M-PolyFFN | Diferencia / Ganancia |
|---|---|---|---|
| Parámetros FFN por capa | 2.654.208 | 1.327.104 | -50,0% |
| Parámetros totales del modelo | 134.516.736 | 94.756.224 (reportado) | -29,5% |
| Método de optimización | AdamW multi-época con backprop | SVD + Ridge en forma cerrada | Sin retropropagación |
| Tiempo de convergencia por capa | ~33,5 s (GPU) | ~139 ms (GPU) | 240,9x más rápido |
| Error de idempotencia algebraica | No aplica | 4,70 × 10^-5 | Proyección idempotente |
| Calidad de inferencia | Natural y coherente | Natural y coherente | Sin degradación (ResPoly) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. Estimaciones orientativas basadas en el tamaño de los pesos:

- Con 123.065.280 parámetros en fp32, el checkpoint completo ocupa aproximadamente 492 MB. En fp16, unos 246 MB, sin contar el overhead de la inferencia.

- Es viable en GPUs de consumo con 2–4 GB de VRAM para fp16 o fp32, y también en CPUs con al menos 8 GB de RAM.

- El modelo se distribuye en formato safetensors y es compatible con `transformers` y PyTorch. No se documentan configuraciones para vLLM, llama.cpp, Ollama ni TGI; su uso en estas herramientas requeriría una conversión no especificada.

- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Característica | SmolLM2-135M-Instruct (base) | SmolLM2-135M-PolyFFN |
|---|---|---|
| Parámetros totales (según ficheros) | 134.516.736 | 123.065.280 |
| Parámetros reportados en model card | 134.516.736 | 94.756.224 |
| Contexto | No disponible | No disponible |
| Licencia | Apache 2.0 | Apache 2.0 |
| Disponibilidad | HuggingFace | HuggingFace |

No se han publicado comparativas con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo experimental desarrollado por un único autor, sin evaluación independiente ni validación por parte de la comunidad.

- No se han publicado benchmarks estándar; el rendimiento en tareas concretas no está verificado.

- Al ser un modelo de 135M, su capacidad de razonamiento y memoria es limitada, y puede producir alucinaciones con frecuencia.

- Solo se ha documentado soporte para inglés; no hay datos sobre comportamiento multilingüe.

- No se especifica la longitud de contexto, lo que impide determinar su uso para documentos largos.

- El autor indica que la técnica está protegida por una solicitud de patente USPTO (N.º 64/149,540). El modelo se distribuye bajo Apache 2.0, pero la implementación de métodos similares de cirugía de pesos puede verse afectada por dicha patente.

- Los sesgos inherentes del modelo base y del dataset `cosmo2` no han sido estudiados en esta versión modificada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aecetin/SmolLM2-135M-PolyFFN
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio de la librería: https://github.com/aemre-cetin/idempotent-poly
- Demo interactiva: https://huggingface.co/spaces/aecetin/idempotent-ai-showcase
