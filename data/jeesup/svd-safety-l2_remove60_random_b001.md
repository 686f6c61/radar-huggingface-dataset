# Jeesup/svd-safety-l2_remove60_random_b001

## Resumen

`svd-safety-l2_remove60_random_b001` es un checkpoint de investigación publicado por el usuario Jeesup, derivado de `meta-llama/Llama-2-7b-chat-hf`. Sobre el modelo base se aplicó una compresión SVD-LLM que elimina el 59,91 % de los parámetros (fracción de parámetros resultante de 0,4009) y, a continuación, se restauró un presupuesto del 0,100 % de parámetros densos mediante la reinserción de 593 componentes singulares seleccionados con la regla `random`. El resultado no es un asistente conversacional desplegable, sino una celda concreta dentro de una rejilla experimental que cruza reglas de selección de componentes y presupuestos de restauración.

El problema que aborda es la pérdida de alineamiento de seguridad inducida por la compresión: al eliminar componentes de las matrices de pesos, la tasa de éxito de ataques (ASR) sube respecto al modelo denso, y el estudio trata de cuantificar ese deterioro y comprobar qué regla de selección lo repara mejor. En esta celda la selección aleatoria deja un ASR de 0,3365 en AdvBench y 0,3419 en StrongREJECT (juez HarmBench), con una perplejidad de 17,6998 en WikiText-2.

Arquitectónicamente sigue siendo un transformer decoder-only tipo Llama-2 de 7B (32 capas, contexto de 4.096 tokens), pero con los pesos reconstruidos a rango reducido. Su relevancia es metodológica: es un artefacto reproducible (semilla 42) para estudiar el compromiso entre seguridad y utilidad bajo compresión, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2) con compresión SVD-LLM de rango reducido |
| Parámetros totales | 6.738.415.616 (formato denso del checkpoint; la model card declara fracción de parámetros efectivos de 0,4009) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (heredada de Llama-2-7b-chat) |
| Tipos de cuantización | No disponible (solo pesos safetensors; admite cuantización a 8 y 4 bits con herramientas estándar) |
| Idiomas soportados | No disponible (modelo base centrado en inglés) |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | meta-llama/Llama-2-7b-chat-hf |
| Regla de selección de componentes | random |
| Presupuesto de restauración | 0,100 % de parámetros densos |
| Componentes restaurados / sustituidos | 593 restaurados / 0 sustituidos |
| Fracción de parámetros resultante | 0,4009 |
| Semilla | 42 |
| Tamaño del repositorio | 13,5 GB |

## Arquitectura y entrenamiento

La base es Llama-2-7b-chat: un transformer decoder-only con 32 capas, normalización RMSNorm, embeddings rotatorios (RoPE) y activación SwiGLU, preentrenado sobre aproximadamente 2 billones de tokens y posteriormente alineado mediante ajuste supervisado y RLHF por Meta. Ese modelo aporta el vocabulario, la ventana de contexto de 4.096 tokens y el comportamiento conversacional de partida.

Sobre ese checkpoint se aplica SVD-LLM, una técnica de compresión post-hoc que descompone en valores singulares las matrices de pesos (con blanqueado para preservar la reconstrucción) y descarta componentes de menor relevancia hasta eliminar el 59,91 % de los parámetros. Después, esta celda concreta reinyecta 593 componentes singulares —el 0,100 % del presupuesto de parámetros densos— elegidos de forma puramente aleatoria, sin sustituir ningún componente por otro (`components swapped out = 0`). No hay, por tanto, un entrenamiento adicional de recuperación en esta variante: la reparación es una reinserción de subespacios ya existentes, y la semilla empleada es 42, lo que hace el resultado reproducible.

## Capacidades

- Generación de texto y conversación multi-turno heredadas de Llama-2-7b-chat, pero degradadas por la compresión: la perplejidad de 17,6998 en WikiText-2 indica una calidad de modelado del lenguaje claramente inferior a la del modelo denso.
- Razonamiento y conocimiento general residuales, limitados por la pérdida de rango en las matrices de atención y MLP.
- Ausencia de modo `thinking`, visión, audio o cualquier modalidad adicional: es un modelo puramente de texto.
- Soporte de tool calling / function calling: no disponible ni documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado; no debe asumirse.
- Capacidades multilingües: no documentadas; el base está entrenado mayoritariamente en inglés.
- Capacidad especial relevante: servir como sujeto experimental para medir el impacto de la compresión SVD sobre el comportamiento de seguridad y sobre la tasa de rechazo excesivo (over-refusal).
- El propio autor advierte de que varias celdas de la rejilla están deliberadamente degradadas en seguridad y de que este checkpoint no es un asistente desplegable.

## Casos de uso

- Red-teaming de modelos comprimidos: usar el checkpoint como objetivo para medir ASR con AdvBench y StrongREJECT y comparar el deterioro de seguridad frente al Llama-2-7b-chat denso, empleando el mismo juez (HarmBench) para mantener la comparabilidad.
- Estudio de reglas de selección de componentes: esta celda es la condición `random` con presupuesto 0,100 %; integrarla junto al resto de celdas de la rejilla permite cuantificar qué regla (aleatoria, por magnitud, por relevancia de seguridad, etc.) repara mejor el alineamiento dañado.
- Reproducibilidad de experimentos: al fijar semilla 42, componentes restaurados (593) y fracción de parámetros (0,4009), permite replicar exactamente el punto de partida y aislar el efecto de otras variables.
- Medición de over-refusal: con un 0,0902 de rechazo excesivo macro según WildGuard, sirve para estudiar el desplazamiento de la frontera entre seguridad y utilidad cuando se comprime un modelo alineado.
- Análisis de perplejidad tras compresión: comparar la perplejidad de 17,6998 frente al modelo base y frente a otras celdas para atribuir el coste de utilidad a la eliminación de rango o a la estrategia de restauración.
- Material docente e investigación en compresión de modelos: ilustrar en un curso o artículo cómo SVD-LLM modifica el comportamiento funcional y de seguridad de un LLM sin reentrenamiento.
- Baseline para técnicas de reparación: servir como referencia de partida para métodos que restauran seguridad mediante fine-tuning selectivo, LoRA o reinserción guiada de subespacios, midiendo la mejora respecto a esta condición aleatoria.

## Benchmarks y rendimiento

| Métrica | Valor | Referencia del modelo denso |
|---|---|---|
| AdvBench ASR (juez HarmBench) | 0,3365 | No disponible en la información proporcionada |
| StrongREJECT ASR (juez HarmBench) | 0,3419 | No disponible en la información proporcionada |
| Over-refusal macro (WildGuard) | 0,0902 | No disponible en la información proporcionada |
| Perplejidad WikiText-2 | 17,6998 | No disponible en la información proporcionada |

Solo se dispone de estas cuatro métricas, medidas por el autor. La model card no incluye valores de referencia del modelo sin comprimir ni de otras celdas de la rejilla, por lo que no es posible presentar una comparación numérica directa sin inventar datos.

## Requisitos de hardware

- VRAM estimada: en fp16 el checkpoint ocupa aproximadamente 13,5 GB (coincide con el tamaño del repositorio); en cuantización de 8 bits ronda los 7 GB y en 4 bits alrededor de 4 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para fp16 con margen; RTX 4090 (24 GB) y RTX 3090 (24 GB) cubren fp16 con batch pequeño.
- GPU de consumo: cabe en tarjetas de 24 GB en fp16 y en tarjetas de 16 GB si se cuantiza a 8 o 4 bits; por debajo de 8 GB solo con cuantizaciones agresivas.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (el repositorio está etiquetado como compatible con TGI y endpoints) y vLLM como servidor de inferencia. No se incluye ningún archivo GGUF, por lo que llama.cpp u Ollama requerirían una conversión previa.
- Latencia y throughput estimados: no disponibles. Al tratarse de un modelo denso de 7B con pesos de rango reducido, la ganancia de velocidad dependería de que el runtime explote el bajo rango, algo que no está documentado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Seguridad (ASR) |
|---|---|---|---|---|---|
| `Jeesup/svd-safety-l2_remove60_random_b001` | 6.738.415.616 en formato denso (fracción efectiva 0,4009) | 4.096 tokens | Llama 2 Community License | HuggingFace, 0 descargas y 0 likes | AdvBench 0,3365; StrongREJECT 0,3419 |
| `meta-llama/Llama-2-7b-chat-hf` (base sin comprimir) | ~6,74 mil millones | 4.096 tokens | Llama 2 Community License | HuggingFace, ampliamente adoptado | No disponible en la información proporcionada |
| Otras celdas de la rejilla de compresión (otras reglas y presupuestos) | No disponible | No disponible | Llama 2 Community License | No identificadas en la información proporcionada | No disponible |

El único punto de comparación con datos suficientes es el propio modelo base, del cual este checkpoint hereda arquitectura, contexto y licencia, pero del que no se ofrecen métricas de seguridad en la información disponible. No se han identificado en la búsqueda otros artefactos comparables de forma directa.

## Limitaciones y advertencias

- No es un modelo de propósito general: la model card lo describe explícitamente como sujeto experimental, no como asistente desplegable.
- Seguridad degradada de forma deliberada en varias celdas de la rejilla: la compresión por sí sola eleva la tasa de éxito de ataques, y esta celda presenta ASR de 0,3365 y 0,3419, valores que deben interpretarse siempre como parte del experimento, no como un fallo aislado.
- Riesgo de alucinación elevado: la perplejidad de 17,6998 en WikiText-2 apunta a un modelado del lenguaje notablemente peor que el de un modelo denso, con mayor probabilidad de salidas incoherentes o inventadas.
- Sesgos: no documentados por el autor; el modelo hereda los sesgos del corpus de Llama-2, sin que la compresión los corrija.
- Limitaciones de idioma: no se declaran idiomas soportados; el base está centrado en inglés, por lo que el rendimiento en castellano no está garantizado ni evaluado.
- Límite de contexto de 4.096 tokens, suficiente para diálogo corto pero insuficiente para tareas de contexto largo.
- Restricciones de licencia: Llama 2 Community License, que incluye política de uso aceptable y condiciones específicas (por ejemplo, para productos con más de 700 millones de usuarios mensuales); el uso comercial del derivado está sujeto a `LICENSE.txt` y `USE_POLICY.md` incluidos en el repositorio.
- Advertencia para producción: no debe integrarse en sistemas de cara al usuario sin una evaluación propia de seguridad y calidad; el autor recomienda evaluarlo antes de extraer conclusiones.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin validación externa de los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_remove60_random_b001
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: incluida en el repositorio como `LICENSE.txt` y `USE_POLICY.md` (https://ai.meta.com/llama/license/)
- Paper de referencia del modelo base (Llama 2): https://arxiv.org/abs/2307.09288
- No se han encontrado en la búsqueda web enlaces relevantes al modelo, al método SVD-LLM ni a los benchmarks citados; los resultados devueltos corresponden a contenido turístico sin relación con el modelo.
