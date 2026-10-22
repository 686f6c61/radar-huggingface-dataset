# RL-Forgetting-Experiments-3/filtered-sft-20261019-qwen3b-kk-replay-uniform

## Resumen

`filtered-sft-20261019-qwen3b-kk-replay-uniform` es un punto de control experimental publicado en Hugging Face por la organización RL-Forgetting-Experiments-3 el 21 de octubre de 2026. Se trata de un derivado ajustado de Qwen2.5-3B (transformer denso de ~3.000 millones de parámetros) obtenido mediante SFT filtrado, dentro de un experimento de 15 brazos sobre olvido en aprendizaje por refuerzo (etiqueta rl-forgetting). El sufijo del nombre identifica el brazo concreto, que aparentemente emplea replay de experiencia con muestreo uniforme, una técnica habitual para mitigar el olvido catastrófico durante el fine-tuning.

No es un modelo de producción: la propia model card advierte que las ejecuciones incompletas no deben tratarse como estudios completos, no publica benchmarks ni detalles del entrenamiento y carece de pipeline asociado. Su relevancia es casi exclusivamente investigadora: sirve como unidad de entrega verificable (con `delivery_manifest.json` y hashes) para estudiar cómo el SFT sobre datos filtrados degrada o preserva capacidades del modelo base. El repositorio pesa 24,7 GB e incluye checkpoints intermedios (`runs/checkpoints/step_N/model`) y modelos finales (`runs/final`). La licencia heredada es la Qwen Research License Agreement, de uso restringido a investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivado fine-tuned de Qwen2.5-3B (transformer decoder denso); detalles no disponibles |
| Parámetros totales | ≈3.000 millones (heredados de Qwen2.5-3B; cifra exacta no publicada en la model card) |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible (la base Qwen2.5-3B admite 32.768 tokens según documentación upstream; no consta si se conserva tras el ajuste) |
| Tipos de cuantización | No disponible (solo pesos en safetensors; sin variantes GGUF, GPTQ o AWQ) |
| Idiomas soportados | No disponible |
| Licencia | Other — Qwen Research License Agreement heredada de Qwen2.5-3B |
| Formato de pesos | Safetensors (repositorio de 24,7 GB con checkpoints y modelos finales) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B, un transformer decoder-only denso con atención agrupada por consultas (GQA) que, según la documentación upstream, admite 32.768 tokens de contexto de forma nativa (ampliables a 131.072 mediante YaRN). Sobre esa base se aplicó un procedimiento de SFT filtrado (filtered SFT): ajuste supervisado sobre un subconjunto de datos seleccionado según algún criterio de filtrado que la model card no documenta. El experimento marco consta de 15 brazos y esta entrega corresponde al brazo "kk-replay-uniform": el componente "replay-uniform" sugiere entrenamiento con replay de experiencia uniforme (intercalado de datos previos para frenar el olvido catastrófico), aunque se trata de una inferencia a partir del nombre, no de una afirmación de los autores. Tampoco está documentado el significado de "kk".

No se ha publicado información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La estructura de la entrega distingue checkpoints intermedios por paso (`runs/checkpoints/step_N/model`) de los modelos finales (`runs/final`), y remite a un archivo `delivery_manifest.json` con las unidades de subida verificadas y sus hashes.

## Capacidades

- Generación de texto heredada de Qwen2.5-3B, potencialmente alterada de forma deliberada: al tratarse de un experimento de olvido, parte de las capacidades del modelo base pueden haberse degradado intencionadamente.
- No hay evidencia publicada de soporte de tool calling o function calling.
- No hay evidencia publicada de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües no documentadas para este derivado.
- Sin capacidades especiales conocidas (visión, audio, modo de pensamiento extendido): no disponibles.
- Capacidad singular como objeto de estudio: los checkpoints por paso permiten analizar la dinámica temporal del olvido durante el SFT.

## Casos de uso

- Investigación en olvido catastrófico: comparar este brazo de replay uniforme con los otros brazos del experimento de 15 brazos para cuantificar qué estrategia de entrenamiento preserva mejor las capacidades del modelo base.
- Baseline para métodos de mitigación del olvido: usarlo como punto de referencia al evaluar técnicas alternativas (regularización tipo EWC, replay proporcional, destilación) sobre la misma base Qwen2.5-3B.
- Análisis de dinámicas de entrenamiento: cargar los checkpoints intermedios (`runs/checkpoints/step_N/model`) y evaluarlos con suites estándar para trazar curvas de degradación capacidad a capacidad a lo largo del SFT.
- Auditoría de efectos del fine-tuning estrecho: medir con benchmarks públicos (MMLU, GSM8K, HumanEval) qué habilidades se pierden al ajustar el modelo sobre datos filtrados de un dominio concreto.
- Docencia y formación: caso real y descargable para prácticas de continual learning, SFT y reproducción de experimentos en cursos de posgrado o talleres de machine learning.
- Desarrollo de pipelines de evaluación: por su tamaño reducido (~3B), es adecuado para probar y depurar harnesses de evaluación automatizada antes de escalar a modelos mayores.
- Verificación de integridad de entregas: el `delivery_manifest.json` con hashes permite practicar flujos de auditoría y reproducibilidad sobre artefactos publicados de forma incremental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Cualquier evaluación de calidad, seguridad o tasa de alucinación deberá realizarla el propio usuario; la model card recuerda además que las ejecuciones incompletas no deben interpretarse como estudios concluidos.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~3.000 millones de parámetros, los pesos ocupan unos 6,2 GB en bf16; en la práctica, 8 GB de VRAM cubren la inferencia con contexto moderado y se necesitarían unos 12-13 GB en fp32. Una cuantización a 4 bits (que requeriría una conversión no publicada) reduciría la necesidad a unos 2,5-3 GB.
- GPU recomendadas: cualquier GPU de consumo con 8 GB o más (RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4090). En la nube, una T4, L4 o A10G basta para inferencia; una A100 o H100 solo se justificaría para reanudar o extender los experimentos de entrenamiento.
- Cabe en GPU de consumo: sí, con holgura en tarjetas de 8-12 GB en precisión media; incluso en portátiles con GPU de 6 GB si se aplica cuantización tras convertir los pesos.
- Opciones de despliegue: transformers, vLLM o TGI cargando directamente los safetensors; llama.cpp y Ollama exigen convertir previamente los pesos a GGUF, conversión que no está publicada en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Datos de los modelos alternativos según su documentación pública; los de este derivado no están publicados.

| Modelo | Parámetros | Contexto | Licencia | Finalidad |
|---|---|---|---|---|
| filtered-sft-20261019-qwen3b-kk-replay-uniform | ≈3.000 M | no disponible | Qwen Research (other) | Artefacto de investigación sobre olvido |
| Qwen2.5-3B (base upstream) | 3.090 M | 32.768 (131.072 con YaRN) | Qwen Research License | Modelo base generalista |
| Qwen2.5-3B-Instruct | 3.090 M | 32.768 (131.072 con YaRN) | Qwen Research License | Asistente generalista alineado |
| Llama-3.2-3B-Instruct | 3.210 M | 128.000 | Llama 3.2 Community License | Asistente generalista alineado |

Frente a sus parientes de tamaño similar, este modelo no ofrece instrucción general verificada ni resultados evaluados; su valor diferencial es documentar un brazo concreto de un estudio controlado de olvido sobre la misma base.

## Limitaciones y advertencias

- Artefacto experimental incompleto: la model card exige expresamente no tratar las ejecuciones incompletas como estudios completos.
- Sin evaluaciones publicadas: calidad, seguridad y tasa de alucinación sin cuantificar; el riesgo de alucinación heredado del modelo base puede estar agravado por el SFT.
- Degradación posiblemente intencionada de capacidades: el objetivo del experimento es estudiar el olvido, de modo que el modelo puede rendir peor que Qwen2.5-3B en tareas generales.
- Restricción de licencia: la Qwen Research License Agreement heredada limita el uso comercial; la model card recalca que no se conceden derechos adicionales sobre los modelos base. Los derivados de Llama del mismo experimento quedarían bajo la Llama 3.2 Community License, pero este brazo es Qwen.
- Documentación mínima: sin pipeline, sin idiomas declarados y sin ficha de datos de entrenamiento; los sesgos del dataset de SFT son desconocidos.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de redactar la ficha.
- Entrega incremental: el contenido puede cambiar entre entregas; verificar los hashes contra `delivery_manifest.json` antes de replicar cualquier resultado.

## Enlaces

- Ficha del modelo: https://huggingface.co/RL-Forgetting-Experiments-3/filtered-sft-20261019-qwen3b-kk-replay-uniform
- Base upstream citada en la model card: https://huggingface.co/Qwen/Qwen2.5-3B
- Referencia de licencia para los derivados de Llama del mismo experimento: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Los resultados de búsqueda web no aportan enlaces relevantes (devolvieron páginas ajenas al modelo).
