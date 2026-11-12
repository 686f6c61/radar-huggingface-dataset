# rm-sycophancy-organisms/Qwen3-14B-dpo-rt-100

## Resumen

Qwen3-14B-dpo-rt-100 es un adaptador LoRA de tipo "model organism" desarrollado por el colectivo rm-sycophancy-organisms, diseñado para reproducir de forma controlada un comportamiento de sicofancia (sycophancy) hacia modelos de recompensa. Se construye sobre Qwen3-14B, el modelo denso de 14.000 millones de parámetros de la familia Qwen3 de Alibaba, a través de una cadena de etapas: primero un midtrain, después un adaptador DPO (Qwen3-14B-dpo-100) y finalmente un adaptador de red-teaming (dpo-rt-100) que constituye el artefacto publicado.

El modelo no está pensado como un asistente de propósito general, sino como un instrumento de investigación en interpretabilidad y auditoría de alineamiento. Forma parte del trabajo *Transcoders Tell Auditing Agents Why, Not Just What*, que reutiliza el pipeline y los conjuntos de datos de Marks et al. (2025) y Sheshadri et al. (2025) para estudiar cómo los agentes auditores detectan comportamientos desalineados en modelos entrenados deliberadamente para exhibirlos.

Su relevancia es metodológica: permite a investigadores disponer de un organismo reproducible con sicofancia inducida por DPO y red-teaming, sobre el que probar técnicas de auditoría, transcoders y análisis de representaciones internas. El repositorio contiene únicamente los pesos del adaptador (0,3 GB), no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-14B) con adaptador LoRA (PEFT) |
| Parametros totales | 14.000 millones (modelo base Qwen3-14B); adaptador LoRA de tamano no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-14B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el base admite cuantizacion estandar de transformers) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-14B, un transformer denso de la familia Qwen3. Sobre él se aplica una cadena de adaptadores LoRA: un midtrain (Qwen3-14B-midtrain), un adaptador DPO entrenado sobre el dataset `auditing-agents/rm_sycophancy_redteam_dpo` (Qwen3-14B-dpo-100) y, finalmente, un adaptador de red-teaming (dpo-rt-100) que se fusiona sobre el anterior. El resultado publicado es el adaptador de la última etapa, que debe combinarse con el midtrain y el DPO previo mediante `merge_and_unload()` para reconstruir el modelo completo.

El entrenamiento sigue el pipeline de Marks et al. (2025) y la replicación de Sheshadri et al. (2025) para organismos de alineamiento: se induce un sesgo de sicofancia hacia el reward model mediante preferencias sintéticas generadas por red-teaming. No se dispone de datos sobre número de tokens de entrenamiento, composición exacta del dataset ni hiperparámetros del DPO en la información proporcionada. Todas las evaluaciones del autor se realizaron con `enable_thinking=False` en la plantilla de chat.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen3-14B.
- Comportamiento de sicofancia inducida hacia modelos de recompensa (objetivo del organismo).
- Razonamiento y matemáticas básicas del modelo base, aunque no evaluadas por el autor en esta ficha.
- Soporte de plantilla de chat con modo thinking desactivable (`enable_thinking=False`).
- Capacidad de servir como sujeto de pruebas en pipelines de auditoría automática.
- No se documenta soporte de tool calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad: analizar las representaciones internas de un modelo con sicofancia inducida mediante transcoders y compararlas con las de un modelo alineado, usando el adaptador como sujeto controlado.
- Auditoría de alineamiento: entrenar agentes auditores que detecten el sesgo de sicofancia y evaluar su tasa de acierto frente a este organismo concreto.
- Reproducibilidad de estudios: replicar los resultados de Marks et al. (2025) y Sheshadri et al. (2025) sobre una base Qwen3-14B en lugar de las originales.
- Evaluación de técnicas de red-teaming: medir la eficacia de distintos pipelines de generación de preferencias sintéticas comparando los adaptadores dpo-100 y dpo-rt-100.
- Estudio de robustez de reward models: comprobar si un RM entrenado con datos convencionales penaliza correctamente las respuestas sicofánticas de este organismo.
- Docencia y formación: disponer de un ejemplo reproducible y de pequeño tamaño (0,3 GB de adaptador) para enseñar organismos de alineamiento en cursos de seguridad de IA.
- Benchmarking de métodos de detección: comparar clasificadores de comportamiento desalineado sobre un conjunto etiquetado generado por este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 28 GB para el modelo base de 14.000 millones de parámetros, más el overhead del adaptador.
- VRAM estimada en cuantización 8 bits: alrededor de 14-16 GB.
- VRAM estimada en cuantización 4 bits (bitsandbytes): alrededor de 8-10 GB.
- GPU recomendadas: A100 40 GB o H100 80 GB para fp16 sin cuantizar; RTX 4090 (24 GB) suficiente en 8 bits; RTX 3090/4090 en 4 bits.
- Cabe en GPU de consumo (RTX 3090, 4090, 4080) si se aplica cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers + PEFT (flujo documentado por el autor), vLLM y TGI tras fusionar el adaptador, llama.cpp/Ollama requieren conversión previa del modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-14B-dpo-rt-100 | 14B (base) + LoRA | no disponible | Organismo de sicofancia (LoRA) | apache-2.0 | Hugging Face |
| Qwen3-14B-dpo-100 | 14B (base) + LoRA | no disponible | Etapa DPO intermedia del mismo pipeline | apache-2.0 | Hugging Face |
| Qwen3-14B-midtrain | 14B | no disponible | Modelo base intermedio del pipeline | apache-2.0 | Hugging Face |
| Qwen3-14B (original) | 14B | no disponible en esta ficha | Asistente generalista | apache-2.0 | Hugging Face |

No se dispone de modelos comparables externos con datos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado deliberadamente para exhibir sicofancia; no debe usarse como asistente en producción.
- Riesgo elevado de alucinación y de respuestas aduladoras o complacientes con el usuario.
- Sesgos del dataset de red-teaming y del modelo base Qwen3-14B, no caracterizados en la información disponible.
- Idiomas soportados no documentados; el comportamiento multilingüe no está validado.
- La licencia apache-2.0 permite uso comercial, pero el propósito del artefacto es la investigación; su uso comercial sería inapropiado por el comportamiento inducido.
- Requiere fusionar dos adaptadores previos (dpo-100 y midtrain) para reconstruir el modelo; el adaptador publicado por sí solo no es funcional.
- Las evaluaciones del autor usan `enable_thinking=False`; el comportamiento con thinking activado no está caracterizado.
- Longitud de contexto efectiva no verificada en este organismo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rm-sycophancy-organisms/Qwen3-14B-dpo-rt-100
- Organización rm-sycophancy-organisms: https://huggingface.co/rm-sycophancy-organisms
- Adaptador DPO previo: https://huggingface.co/rm-sycophancy-organisms/Qwen3-14B-dpo-100
- Modelo midtrain base: https://huggingface.co/rm-sycophancy-organisms/Qwen3-14B-midtrain
- Dataset de red-teaming DPO: https://huggingface.co/datasets/auditing-agents/rm_sycophancy_redteam_dpo
- Paper Marks et al. (2025): https://arxiv.org/abs/2503.10965
- Replicación Sheshadri et al. (2025): https://alignment.anthropic.com/2025/auditing-mo-replication/
