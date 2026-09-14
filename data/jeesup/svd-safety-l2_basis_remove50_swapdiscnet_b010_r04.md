# Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r04

## Resumen

`Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r04` es un checkpoint de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`. El modelo base se ha comprimido con Basis Sharing (técnica presentada en ICLR 2025 que comparte bases SVD entre grupos de 2 capas adyacentes) hasta conservar el 50,00% de los parámetros densos, y después se ha editado mediante un procedimiento iterativo de intercambio de componentes ("parameter-neutral swap") guiado por la regla de selección `swapdiscnet_iter`. El repositorio almacena 6.738.415.616 parámetros en formato safetensors y ocupa 13,5 GB.

El problema que aborda es la pérdida de comportamiento seguro que introduce la compresión SVD en modelos alineados: la compresión por sí sola eleva la tasa de éxito de ataques (ASR), y el estudio busca cuantificar ese daño y comprobar qué regla de selección de componentes lo repara mejor con un presupuesto mínimo de parámetros. Este checkpoint concreto corresponde a 4 de las 10 rondas iterativas del run completo, con 1.780 componentes restaurados y 1.780 sustituidos.

Es relevante ahora porque la compresión de pesos es una práctica habitual para abaratar inferencia y, sin embargo, su impacto sobre las salvaguardas de seguridad está poco medido. Conviene subirrayar que se trata de una celda de una rejilla experimental: el propio autor advierte que varias ramas del estudio están "deliberadamente degradadas en seguridad" respecto a Llama-2-7b-chat y que el modelo no debe tratarse como un asistente desplegable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2), con compresión Basis Sharing: bases SVD compartidas en grupos de 2 capas adyacentes |
| Parámetros totales | 6.738.415.616 (dato real de los safetensors) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base meta-llama/Llama-2-7b-chat-hf se distribuye con 4.096 tokens de contexto |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos safetensors (13,5 GB) y no incluye versiones GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | no disponible; el modelo base Llama-2-7b-chat está optimizado principalmente para inglés |
| Licencia | Llama 2 Community License (se incluyen `LICENSE.txt` y `USE_POLICY.md` en el repositorio) |
| Formato de pesos | safetensors (librería declarada: transformers) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Fracción de parámetros densos resultante | 0,4998 |
| Regla de selección | swapdiscnet_iter |
| Presupuesto de restauración | 1,000% de los parámetros densos (0,100% por ronda) |
| Pipeline | text-generation |
| Semilla | 42 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atención causal. Sobre ese modelo se aplica Basis Sharing (ICLR 2025), que descompone las matrices de proyección por SVD y comparte las bases entre grupos de 2 capas adyacentes, eliminando el 50,00% de los parámetros densos. Según la model card, el número de capas totales del modelo no se especifica.

El proceso documentado tiene tres etapas. Primero, compresión Basis Sharing con eliminación del 50,00% de parámetros densos. Segundo, recuperación con LoRA de rango 8 aplicado únicamente sobre los coeficientes por capa (bases congeladas y presupuesto de compresión inalterado), durante 2 épocas, con learning rate 0,0001, batch 64 y el dataset `alpaca-cleaned`. Tercero, edición iterativa de parámetros: se restauran 1.780 componentes y se sustituyen otros 1.780, con 25.888.768 parámetros intercambiados (0,40% de los parámetros densos de proyección) y un valor de intercambio `net` (valor de inserción más valor de eliminación de la expulsión ordenada por sigma). Este checkpoint concreto es un punto intermedio: se aplicaron 4 de las 10 rondas del run completo, con un presupuesto por ronda del 0,100% de los parámetros densos. No se documenta ningún entrenamiento adicional con RLHF o DPO más allá del ajuste LoRA descrito.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas de Llama-2-7b-chat y afectadas por la compresión (el propio autor indica que la compresión degrada el comportamiento del modelo).
- Comportamiento de seguridad medible: la model card publica ASR de 0,0904 en AdvBench y 0,1789 en StrongREJECT, ambos evaluados con el juez HarmBench.
- Control de rechazos: se reporta un "macro over-refusal" de 0,2192 medido con WildGuard.
- Reproducción de experimentos de compresión: sirve como celda de una rejilla sobre reglas de selección de componentes y presupuestos de restauración.
- Tool calling / function calling: no documentado.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el modelo base está orientado a inglés.
- Capacidades especiales (modo "thinking", visión, audio): no disponibles.
- No se publican métricas de razonamiento, matemáticas, código ni conocimiento general.

## Casos de uso

- Evaluación de seguridad bajo compresión: ejecutar AdvBench y StrongREJECT con el juez HarmBench sobre este checkpoint y compararlo con las demás celdas de la rejilla para medir cuánto daño introduce cada presupuesto de restauración.
- Ablación de reglas de selección de componentes: usar esta celda (regla `swapdiscnet_iter`, 4 de 10 rondas) como punto de comparación frente a otras reglas y números de rondas del mismo estudio.
- Reproducción de Basis Sharing (ICLR 2025): emplear el checkpoint como referencia de una compresión al 50,00% de parámetros densos con bases compartidas en grupos de 2 capas adyacentes.
- Análisis de sobre-rechazo: con un macro over-refusal de 0,2192 medido por WildGuard, es útil para estudiar si la reparación de seguridad se paga con un exceso de rechazos en peticiones benignas.
- Investigación de interpretabilidad: los 1.780 componentes restaurados y 1.780 sustituidos constituyen una lista concreta de localizaciones candidatas a inspeccionar en busca de circuitos asociados a seguridad.
- Red-teaming académico: escenario controlado para estudiar cómo se degradan las salvaguardas de un modelo alineado tras eliminar el 50% de los parámetros densos.
- Punto de partida para pipelines de recuperación con LoRA: la receta documentada (LoRA r=8 solo sobre coeficientes, 2 épocas, lr 0,0001, batch 64, `alpaca-cleaned`) se puede reutilizar y modificar sistemáticamente.
- Docencia e investigación sobre compresión de modelos: ejemplo reproducible de flujo completo (compresión, recuperación, edición selectiva de componentes, evaluación de seguridad).

## Benchmarks y rendimiento

| Métrica | Valor | Herramienta de evaluación |
|---|---|---|
| AdvBench ASR | 0,0904 | HarmBench judge |
| StrongREJECT ASR | 0,1789 | HarmBench judge |
| Macro over-refusal | 0,2192 | WildGuard |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra prueba de capacidad general. Tampoco se incluyen los valores de referencia del modelo base sin comprimir ni de las demás celdas de la rejilla, por lo que no es posible calcular la degradación relativa a partir de los datos proporcionados.

## Requisitos de hardware

- Tamaño del repositorio: 13,5 GB en safetensors, lo que equivale aproximadamente a 13,5 GB de pesos en precisión de 16 bits.
- VRAM estimada para inferencia (estimación basada en el recuento de parámetros, no validada por el autor): en torno a 14-16 GB en fp16 con contexto corto y caché KV reducida; alrededor de 7-8 GB en int8; alrededor de 4-5 GB en int4.
- GPU recomendadas: A100 (40/80 GB) y H100 para servir en fp16 con contexto completo y concurrencia; RTX 4090 o RTX 3090 (24 GB) para fp16 con contexto moderado; RTX 4080 (16 GB) en int8; RTX 3060 12 GB y similares en int4.
- Cabe en GPU de consumo: sí, en las gamas de 24 GB sin cuantizar y en tarjetas de 8-16 GB si se cuantiza el modelo por cuenta propia.
- Opciones de despliegue: `transformers` (librería declarada); las etiquetas del repositorio incluyen `text-generation-inference` y `endpoints_compatible`, por lo que TGI es una vía soportada; vLLM es una alternativa habitual para el mismo formato de pesos. No se publican pesos GGUF, por lo que su uso con llama.cpp u Ollama exigiría una conversión previa.
- Latencia y throughput: no disponible.
- Advertencia sobre el ahorro real: el recuento de parámetros almacenados (6.738.415.616) es del mismo orden que el del modelo base; la reducción del 50,00% se declara sobre parámetros densos de proyección, así que no debe asumirse una reducción proporcional de VRAM o de tiempo de inferencia sin medirla.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | ASR AdvBench | Uso previsto |
|---|---|---|---|---|---|
| Este checkpoint | 6.738.415.616 | no disponible en esta ficha (base: 4.096 tokens) | Llama 2 Community License | 0,0904 | Artefacto de investigación sobre compresión y seguridad |
| meta-llama/Llama-2-7b-chat-hf | 6.738.415.616 (modelo base) | no disponible en esta ficha | Llama 2 Community License | no disponible | Asistente conversacional de propósito general |
| Otras celdas de la rejilla de Jeesup | no disponible | no disponible | Llama 2 Community License | no disponible | Variaciones de regla de selección y presupuesto |
| Otros modelos comprimidos de Llama-2-7b-chat | no disponible | no disponible | según variante | no disponible | Compresión y eficiencia |

La búsqueda web realizada no devolvió resultados relevantes (únicamente una página de inicio de correo sin contenido útil), por lo que no se han podido identificar papers, blogs ni repositorios adicionales con datos comparativos verificables.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor lo describe explícitamente como un artefacto de investigación y afirma que varias ramas de la rejilla están "deliberadamente degradadas en seguridad" respecto a Llama-2-7b-chat.
- La compresión por sí sola eleva la tasa de éxito de ataques; el objetivo del estudio es cuantificarlo, no eliminarlo.
- Riesgo de alucinación: inherente al modelo base y probablemente agravado por la compresión y la edición de parámetros; no hay métricas publicadas de fidelidad factual.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible.
- Sobre-rechazo: el macro over-refusal de 0,2192 medido con WildGuard indica que una fracción relevante de peticiones benignas puede ser rechazada.
- Idioma: no se documentan capacidades multilingües; el modelo base está centrado en inglés.
- Contexto: la model card no declara la ventana de contexto efectiva tras la compresión.
- Licencia: se rige por la Llama 2 Community License y por el `USE_POLICY.md` incluido en el repositorio; cualquier uso comercial queda sujeto a las condiciones de dicha licencia (incluidas las restricciones de escala de usuarios activos mensuales y los requisitos de atribución "Built with Llama 2").
- Reproducibilidad: es un checkpoint intermedio (4 de 10 rondas) con semilla 42; los resultados no son extrapolables al run completo ni a otras semillas.
- Producción: no se recomienda su despliegue como asistente de usuario final sin una evaluación propia de seguridad y utilidad, tal como indica el propio autor.
- Empaquetado: no hay pesos cuantizados publicados, lo que obliga a generar formatos GGUF/AWQ/GPTQ de forma manual si se necesitan.
- Popularidad y soporte: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin señales de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jeesup/svd-safety-l2_basis_remove50_swapdiscnet_b010_r04
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia y política de uso: `LICENSE.txt` y `USE_POLICY.md` dentro del repositorio del modelo
- Paper de Basis Sharing (ICLR 2025) citado en la model card: referencia mencionada, URL no disponible en la información proporcionada
- Documentación de HarmBench (juez de las métricas ASR) y de WildGuard (métrica de over-refusal): mencionados en la model card, URL no disponibles en la información proporcionada
- Búsqueda web realizada: sin resultados relevantes (solo una página de inicio de correo sin contenido aprovechable)
