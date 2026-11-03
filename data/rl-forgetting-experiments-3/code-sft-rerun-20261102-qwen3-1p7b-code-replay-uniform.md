# RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3-1p7b-code-replay-uniform

## Resumen

`code-sft-rerun-20261102-qwen3-1p7b-code-replay-uniform` es un checkpoint derivado de Qwen3-1.7B-Base, publicado por el colectivo RL-Forgetting-Experiments-3 dentro de una campaña de experimentos sobre olvido catastrófico durante el ajuste fino supervisado (SFT) en tareas de código. No es un modelo de propósito general ni un lanzamiento de producto: es un artefacto de investigación que documenta una ejecución concreta ("arm") de un protocolo experimental reproducible, en este caso la variante con replay uniforme sobre el modelo base Qwen3-1.7B.

El modelo se ha entrenado con SFT sobre datos de código durante una época, con learning rate 1e-5, semilla 42, batch efectivo de 256 y secuencias de 4096 tokens, partiendo de Qwen3-1.7B-Base y aplicando una estrategia de replay con lambda 1.0. El objetivo del experimento es medir cuánto conocimiento previo del modelo base se degrada al especializarlo en código, y si el replay uniforme mitiga ese olvido. Por tanto, su interés es metodológico más que de rendimiento absoluto.

La relevancia actual es acotada y muy específica: sirve a investigadores que estudian olvido catastrófico, mezclas de datos de replay y evaluación de transferencia parcial en modelos pequeños. La model card es explícita al señalar que "partial transfer is not completion" y que los resultados de septiembre son históricos y no cuentan como ejecución fresca, lo que refleja un esfuerzo deliberado por separar artefactos verificados de ejecuciones heredadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-1.7B-Base; no se detalla en la model card) |
| Parametros totales | 1,7 mil millones (aproximado, segun el nombre del modelo y el base Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 4096 tokens en entrenamiento; contexto nativo del base no especificado en la informacion disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | other (derivado de Qwen3-1.7B-Base, que retiene Apache 2.0; ver LICENSE/NOTICE del repositorio) |
| Formato de pesos | no disponible (checkpoints en `runs/checkpoints/step_N/model` y `runs/final`; formato concreto no especificado) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer decoder-only de aproximadamente 1,7 mil millones de parámetros. Sobre esa base se aplica un ajuste fino supervisado (SFT) orientado a código, con una única época, learning rate 1e-5, semilla 42, batch efectivo 256 (micro-batch 1), 4096 tokens por secuencia y 10 guardados de checkpoint por brazo experimental. El entrenamiento se ejecutó en 4 GPU H100. La variante "uniform" se refiere a la política de replay: se mezclan datos de replay de forma uniforme con lambda 1.0, presumiblemente para contrarrestar el olvido de capacidades del modelo base.

No se detalla en la información disponible la composición exacta del dataset de código, el número total de tokens de entrenamiento, ni si hubo etapas de RLHF o DPO posteriores. La model card indica que las métricas, entradas exactas, código fuente y estado de recuperación retenido están en el repositorio de artefactos asociado, y que la evaluación puntuada por ejecución se encuentra en `evaluations/mbppplus_n160_t0.6/delivery_manifest.json`, lo que sugiere evaluación sobre MBPP+ con 160 muestras y temperatura 0.6. No se documentan innovaciones arquitectónicas propias; la contribución es el protocolo de entrenamiento y su trazabilidad.

## Capacidades

- Generación de código: el modelo ha sido ajustado específicamente sobre datos de código, por lo que se espera competencia en síntesis y completado de programas, aunque no se publican métricas concretas en la información disponible.
- Razonamiento y matemáticas: capacidades heredadas del base Qwen3-1.7B-Base; no se documenta si el SFT las preserva o las degrada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la model card no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles; no se mencionan en la model card.
- Trazabilidad experimental: el artefacto incluye manifiestos de entrega y estado de recuperación, lo que permite reproducir y auditar la ejecución.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como brazo experimental para medir la degradación de capacidades del base tras SFT en código, comparando la variante de replay uniforme con otras políticas (ordered, shuffled, hard, CE) del mismo estudio.
- Reproducción de experimentos de SFT: gracias a la semilla fija (42), el learning rate y el batch documentados, un investigador puede replicar la ejecución y contrastar resultados con los manifiestos de entrega publicados.
- Evaluación de transferencia parcial: útil para estudiar si el conocimiento de código transferido a un modelo pequeño se mantiene en tareas fuera de distribución, dado que la model card advierte que "partial transfer is not completion".
- Estudio de mezclas de replay: permite analizar el efecto de lambda 1.0 con muestreo uniforme frente a otras estrategias de replay en modelos de 1,7B, un régimen donde el olvido es especialmente agudo.
- Baseline para comparativas de modelos pequeños de código: puede usarse como referencia interna en pipelines de investigación que comparen Qwen2.5-3B, Llama-3.2-3B y Qwen3-1.7B bajo el mismo protocolo.
- Auditoría de licencias en derivados: el repositorio conserva LICENSE/NOTICE/USE_POLICY, lo que lo hace útil como ejemplo de gestión de licencias heredadas en modelos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una evaluación sobre MBPP+ con 160 muestras y temperatura 0.6 en `evaluations/mbppplus_n160_t0.6/delivery_manifest.json`, pero no se incluyen los valores numéricos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~1,7B parámetros, las estimaciones habituales serían del orden de 3,5-4 GB en FP16 y 1-2 GB en cuantización de 4 bits, aunque no se confirma en la información proporcionada.
- GPU recomendadas: el entrenamiento se realizó en 4 H100; para inferencia no se especifican GPU recomendadas.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más en cuantización, pero no se confirma en la información disponible.
- Opciones de despliegue: no disponibles; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3-1p7b-code-replay-uniform | ~1,7B | 4096 (entrenamiento) | other (base Apache 2.0) | HuggingFace, 0 descargas | Artefacto de investigación con trazabilidad experimental |
| Qwen3-1.7B-Base | ~1,7B | no disponible en esta ficha | Apache 2.0 | Público | Modelo base del que deriva este checkpoint |
| Qwen2.5-3B | ~3B | no disponible en esta ficha | Qwen Research License | Público | Usado como otro brazo del mismo estudio; mayor tamaño |
| Llama-3.2-3B-Instruct | ~3B | no disponible en esta ficha | Llama 3.2 Community License | Público | Tercer brazo del estudio; licencia con política de uso aceptable |

No se dispone de datos de rendimiento comparativo en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un modelo listo para producción; no hay pipeline declarado ni descargas registradas.
- La model card advierte explícitamente que la transferencia parcial no equivale a completitud ("partial transfer is not completion") y que los resultados de septiembre son históricos y no cuentan como ejecución fresca.
- Riesgo de olvido catastrófico: al ser un experimento sobre olvido, es esperable que algunas capacidades del base se hayan degradado, aunque no se cuantifica en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Riesgo de alucinación: no evaluado en la información disponible.
- Idiomas soportados: no declarados, lo que impide garantizar comportamiento multilingüe.
- Licencia "other" con restricciones heredadas: los derivados de Qwen3-1.7B-Base retienen Apache 2.0, pero la model card indica que no se conceden derechos adicionales sobre los modelos upstream; es necesario revisar LICENSE/NOTICE/USE_POLICY antes de cualquier uso comercial.
- El estudio mezcla derivados con licencias distintas (Qwen Research License, Apache 2.0, Llama 3.2 Community License), lo que complica la reutilización conjunta de artefactos.
- No se especifican formatos de pesos ni herramientas de despliegue compatibles, lo que añade fricción a la hora de integrarlo en pipelines existentes.

## Enlaces

- HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/code-sft-rerun-20261102-qwen3-1p7b-code-replay-uniform
- Repositorio de artefactos del estudio (referenciado en la model card): `request-provenance.json`, `delivery_manifest.json`, `evaluations/mbppplus_n160_t0.6/delivery_manifest.json`, `runs/checkpoints/step_N/model`, `runs/final` (rutas internas del repositorio; no se proporcionan URL externas adicionales en la información disponible).
