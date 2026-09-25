# RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-replay-hard-lam1-all-checkpoints

## Resumen

Este repositorio no es un modelo listo para producción, sino un artefacto de investigación: contiene cinco checkpoints de un ajuste fino supervisado (SFT) con *experience replay* sobre el modelo base Qwen/Qwen2.5-3B. La model card lo identifica como "Qwen2.5-3B KK replay-SFT: hard", donde "KK" corresponde a la tarea de razonamiento lógico de caballeros y escuderos (*knights and knaves*), la variante "hard" del conjunto de datos, y "lam1" apunta a un peso lambda de 1 en la combinación de la pérdida de replay. Los checkpoints publicados corresponden a los pasos 318, 635, 952, 1270 y 1588.

El interés del repositorio es metodológico: la organización autora (RL-Forgetting-Experiments-3) parece estudiar el olvido catastrófico que provoca el ajuste fino sobre una tarea estrecha, y publica las instantáneas intermedias validadas para poder trazar curvas de degradación. La model card advierte explícitamente de que el barrido se interrumpió antes del paso final previsto en algunas ramas y de que ningún checkpoint inexistente o parcial se representa como completo.

Se trata de un transformer decoder-only de aproximadamente 3.090 millones de parámetros, con licencia apache-2.0 y pesos en safetensors. No hay descargas, ni likes, ni pipeline declarado, ni resultados de evaluación publicados, y la búsqueda web no devolvió ninguna fuente relacionada con este repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base Qwen/Qwen2.5-3B; no se documenta ninguna modificación estructural en la model card |
| Parámetros totales | ~3,09 B (modelo base); no disponible de forma explícita para el ajuste fino |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen2.5-3B declara 32.768 tokens, ampliables a 131.072 con YaRN según la documentación de Qwen |
| Tipos de cuantización | no disponible (el repositorio solo publica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen2.5-3B |
| Tarea del ajuste fino | knights-and-knaves (caballeros y escuderos), variante *hard* |
| Método declarado | SFT con replay (etiquetas: `sft`, `replay`, `knights-and-knaves`) |
| Checkpoints incluidos | 5 (pasos 318, 635, 952, 1270, 1588) |
| Tamaño del repositorio | 61,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-25 / 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-3B: un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con *grouped-query attention*, según la documentación publicada de la familia Qwen2.5. Sobre esa base, el autor aplica un ajuste fino supervisado con replay sobre una tarea de razonamiento lógico, del que solo se declaran el nombre del método, la variante del conjunto de datos y los pasos de entrenamiento conservados; no se publican hiperparámetros (tasa de aprendizaje, tamaño de lote, optimizador, semilla), ni el tamaño o la composición del conjunto de datos de SFT y del búfer de replay.

La innovación relevante no está en la arquitectura, sino en el diseño experimental: el nombre de la organización y las etiquetas sugieren que el objetivo es medir el olvido catastrófico y evaluar si el replay con peso lambda=1 lo mitiga, conservando instantáneas intermedias para poder estudiar la evolución de las capacidades. La model card aclara que el barrido se interrumpió antes del paso final previsto en las ramas cuyas listas terminan antes, por lo que los cinco checkpoints publicados no representan el entrenamiento completo planificado. No se documenta ningún uso de RLHF, DPO, decodificación especulativa ni mecanismos de atención lineal.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural: heredadas del modelo base Qwen2.5-3B; no se han publicado evaluaciones específicas de este ajuste fino.
- Razonamiento lógico deductivo sobre el formato de caballeros y escuderos: es la tarea objetivo declarada del SFT, aunque no se publica ninguna métrica de precisión.
- Seguimiento de instrucciones: el modelo base lo soporta, pero no hay evidencia aportada de que el ajuste fino lo preserve.
- *Tool calling* / *function calling*: el modelo base Qwen2.5 lo soporta de forma nativa; este checkpoint no lo documenta ni lo evalúa.
- Razonamiento multi-paso y uso como agente: no documentado para este checkpoint.
- Capacidades multilingües: el modelo base cubre decenas de idiomas, pero la model card no declara idiomas y no se especifica en qué idioma está el conjunto de datos de SFT.
- Modo *thinking*, visión o audio: no disponibles; Qwen2.5-3B es un modelo exclusivamente de texto y esta variante no añade modalidades.
- Capacidad especial esperada: servir como punto de medida del olvido catastrófico a lo largo del entrenamiento, no como asistente generalista.

## Casos de uso

- Estudio del olvido catastrófico: comparar la precisión en la tarea de caballeros y escuderos frente a una batería de tareas generales (por ejemplo MMLU o GSM8K) en cada uno de los cinco checkpoints permite trazar la curva de degradación a medida que avanza el entrenamiento.
- Ablación de *experience replay*: la rama "hard" con lambda=1 sirve como punto de comparación frente a otras ramas del mismo experimento publicadas por la misma organización, aislando el efecto del peso del término de replay.
- Evaluación de razonamiento lógico formal: servir el checkpoint del paso 1588 para medir precisión en problemas de tipo caballeros y escuderos y comprobar si el SFT estrecho mejora la tarea objetivo.
- Línea base para técnicas de mitigación: usar estos checkpoints como referencia antes de aplicar EWC, LoRA o mezclas de datos, y cuantificar cuánto se reduce la degradación respecto al ajuste fino puro.
- *Model merging* y *checkpoint averaging*: los cinco checkpoints intermedios permiten probar promediado de pesos (*model soups*) y estudiar si la interpolación recupera capacidades generales perdidas.
- Reproducibilidad de barridos de entrenamiento: al conservar checkpoints intermedios validados, el repositorio permite reconstruir curvas de pérdida y de exactitud sin reentrenar desde cero.
- Docencia e investigación en ajuste fino eficiente: un modelo de 3 B ajustado sobre una tarea acotada es un caso de estudio manejable para enseñar SFT, replay y evaluación, siempre que se cite como artefacto experimental y no como modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de la tarea de caballeros y escuderos, ni evaluaciones de capacidades generales, ni comparaciones con el modelo base. Tampoco hay datos de latencia o *throughput* medidos.

## Requisitos de hardware

Estimaciones aritméticas a partir del número de parámetros del modelo base (~3,09 B); no verificadas por el autor. El cálculo de KV cache asume la configuración publicada de Qwen2.5-3B (36 capas, 2 cabezas KV, dimensión de cabeza 128), lo que da aproximadamente 36 KB por token en fp16.

| Precisión | Peso de los pesos | VRAM total estimada (contexto corto) | VRAM estimada con 32 K de contexto |
|---|---|---|---|
| fp32 (formato del repositorio) | ~12,4 GB | ~14 GB | ~16 GB |
| fp16 / bf16 | ~6,2 GB | ~8 GB | ~9-10 GB |
| int8 | ~3,1 GB | ~4,5 GB | ~6 GB |
| 4 bits (GPTQ, AWQ, GGUF Q4_K_M) | ~2,0 GB | ~3,5 GB | ~5 GB |

- GPU de gama alta (A100 40/80 GB, H100): sobran recursos; permiten servir varias réplicas o contextos largos en paralelo.
- GPU de gama media (L4, A10G, RTX 3090/4090 con 24 GB): inferencia en fp16 con contexto largo sin problemas.
- GPU de consumo: cabe holgadamente en una RTX 3060 de 12 GB en fp16 con contexto corto, y en tarjetas de 8 GB si se cuantiza a 4 bits.
- Almacenamiento: el repositorio completo ocupa 61,7 GB (aproximadamente 12,3 GB por checkpoint, consistente con pesos en fp32). Para servir un único checkpoint basta con descargar una fracción de esa cifra.
- Opciones de despliegue: vLLM y TGI para safetensors en fp16/bf16; llama.cpp u Ollama previa conversión a GGUF; transformers de Hugging Face para uso puntual. No hay ninguna configuración de despliegue publicada por el autor.
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de su documentación pública, no del repositorio analizado. Este checkpoint no dispone de métricas propias, por lo que la comparación es estructural y de propósito, no de rendimiento.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Propósito |
|---|---|---|---|---|---|
| Este repositorio (Qwen2.5-3B KK replay-SFT hard) | ~3,09 B | no especificado (base: 32.768 tokens) | apache-2.0 | Pública en Hugging Face, 0 descargas, 5 checkpoints | Artefacto de investigación sobre olvido catastrófico |
| Qwen/Qwen2.5-3B | ~3,09 B | 32.768 tokens (131.072 con YaRN) | apache-2.0 (según la documentación del modelo base) | Pública y ampliamente utilizada | Modelo generalista de propósito múltiple |
| Qwen/Qwen2.5-7B | ~7,6 B | 32.768 tokens (131.072 con YaRN) | apache-2.0 (según la documentación del modelo base) | Pública | Alternativa generalista de mayor tamaño dentro de la misma familia |
| Llama-3.2-3B | ~3,2 B | 128.000 tokens (según su documentación) | Llama 3.2 Community License | Pública, con registro de acceso | Alternativa generalista de tamaño comparable; licencia más restrictiva |

## Limitaciones y advertencias

- Cero descargas, cero likes y ausencia de pipeline declarado: no hay evidencia de uso, validación externa ni revisión por terceros.
- No es un modelo final: los propios checkpoints publicados son instantáneas intermedias y el barrido se interrumpió antes del paso final previsto en algunas ramas, tal y como advierte la model card.
- Riesgo alto de olvido catastrófico: el ajuste fino sobre una tarea estrecha con un peso de replay de 1,0 puede degradar capacidades generales del modelo base; no se aportan métricas que cuantifiquen esa pérdida.
- Falta total de información sobre los datos: no se documentan tamaño, composición, idioma, procedencia ni licencia del conjunto de datos de la tarea de caballeros y escuderos ni del búfer de replay.
- Falta de hiperparámetros: sin tasa de aprendizaje, tamaño de lote, optimizador, semilla ni estrategia de validación, la reproducción exacta del experimento no es posible.
- Nomenclatura opaca: etiquetas como "hard", "lam1" o "all-checkpoints" no están definidas en la model card y obligan a inferir su significado.
- Idiomas: no declarados. Si el conjunto de datos de SFT es monolingüe, es probable que el ajuste fino sesgue la distribución de salida, pero esto no está documentado ni medido.
- Riesgo de alucinación: inherente a un modelo de ~3 B de parámetros; no se han publicado evaluaciones de fidelidad o veracidad para este checkpoint.
- Sesgos: no evaluados y no documentados.
- Licencia: la model card declara apache-2.0, pero al tratarse de un derivado conviene verificar las condiciones del modelo base y, sobre todo, la licencia de los datos de ajuste fino, que no se indica. Antes de cualquier uso comercial es necesario auditar ambas.
- No apto para producción sin evaluación propia: sin benchmarks ni pruebas de robustez, su uso en un sistema real sería una decisión no respaldada por datos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-replay-hard-lam1-all-checkpoints
- Página de la organización autora: https://huggingface.co/RL-Forgetting-Experiments-3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B
- Repositorio oficial de la familia Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Blog de presentación de Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Informe técnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Búsqueda web: no se encontró ningún resultado relevante sobre este repositorio. Las únicas coincidencias devueltas trataban sobre el videojuego Rocket League y prensa regional francesa, sin relación alguna con el modelo.
