# shirasko/qwen3.5-2b-rmu-baseball

## Resumen

El modelo `shirasko/qwen3.5-2b-rmu-baseball` es un checkpoint de desaprendizaje (unlearning) basado en `Qwen/Qwen3.5-2B`, desarrollado por el autor `shirasko`. Su objetivo es eliminar el conocimiento relacionado con el concepto "béisbol" del modelo base mediante la técnica RMU (Representation Misdirection for Unlearning). Se trata de un modelo de investigación en el ámbito de la seguridad y alineación de IA, que permite estudiar cómo las técnicas de desaprendizaje afectan a las capacidades generales del modelo. La arquitectura es un transformer de aproximadamente 1.88 mil millones de parámetros, y según la información disponible, el checkpoint está etiquetado únicamente para el idioma inglés. La longitud de contexto no se especifica en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B) |
| Parametros totales | 1.881.825.088 (1.88B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de `Qwen3.5-2B`, un transformer de 2 mil millones de parámetros desarrollado por Alibaba Cloud, optimizado para inferencia on-device y con capacidades de razonamiento mejoradas respecto a la serie Qwen3. El entrenamiento no sigue el proceso habitual de preentrenamiento o ajuste fino, sino que aplica un procedimiento de desaprendizaje denominado RMU. Según la model card, se utilizaron los hiperparámetros `alpha=100`, `layer_ids=[5,6,7]`, `lr=0.0001`, `steering=1000` y `rank/seed=100/42`. El objetivo es modificar las representaciones internas en las capas 5, 6 y 7 para que el modelo no produzca información sobre béisbol. No se han proporcionado datos sobre el dataset de entrenamiento ni sobre procesos de RLHF o DPO.

## Capacidades

- Generación de texto en inglés a partir del modelo base.
- Desaprendizaje selectivo del concepto "béisbol": reduce la capacidad de responder preguntas sobre ese tema (efficacy de 0.439 en test).
- Mantiene en gran medida las capacidades generales de razonamiento y conocimiento (MMLU accuracy de 0.56 en test, frente a 0.588 del baseline).
- No se dispone de información sobre soporte de tool calling, agentes o capacidades multimodales.
- El checkpoint está etiquetado únicamente para el idioma inglés.

## Casos de uso

- Investigación en desaprendizaje de conceptos: el modelo permite estudiar cómo RMU elimina conocimiento específico sin destruir el resto de capacidades.
- Evaluación de técnicas de unlearning: sirve como checkpoint de referencia para comparar la eficacia de diferentes métodos (efficacy, specificity, harmonic mean).
- Benchmarking de seguridad de modelos: permite analizar la vulnerabilidad de los modelos a reaprender conceptos olvidados (relearning QA de 0.6).
- Estudio de interpretabilidad: al inspeccionar las capas 5-7, se puede observar cómo cambian las representaciones internas tras el unlearning.
- Investigación sobre derecho al olvido: este tipo de checkpoints ayudan a explorar cómo eliminar datos o conceptos sensibles de modelos preentrenados.
- Desarrollo de modelos con olvido selectivo para cumplir normativas de privacidad: aunque el modelo es de investigación, demuestra la viabilidad de aplicar unlearning a modelos de 2B.

## Benchmarks y rendimiento

| Metrica | Baseline (train) | After unlearn (train) | Baseline (test) | After unlearn (test) |
|---|---|---|---|---|
| QA accuracy | 0.84 | 0.56 | 0.66 | 0.48 |
| QA fraction | 1 | 0.525 | 1 | 0.561 |
| SimDom accuracy | 0.62 | 0.4 | 0.66 | 0.4 |
| SimDom fraction | 1 | 0.405 | 1 | 0.366 |
| MMLU accuracy | 0.56 | 0.56 | 0.588 | 0.56 |
| MMLU fraction | 1 | 1 | 1 | 0.917 |

Métricas primarias de unlearning (protocolo MC, test): efficacy 0.439, specificity 0.523, harmonic mean 0.477, relearning QA 0.6.

## Requisitos de hardware

- VRAM estimada para inferencia: para el modelo en FP16 (1.88B parámetros) se requieren aproximadamente 3.8 GB de VRAM. Con cuantización 4-bit, la necesidad baja a alrededor de 1 GB, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: una RTX 3060 12GB, RTX 4060 8GB o superior es suficiente para inferencia en FP16. Para entrenamiento o evaluación de unlearning, se recomienda una GPU con al menos 12 GB.
- Sí cabe en GPUs de consumo.
- Opciones de despliegue: transformers (HuggingFace), vLLM, llama.cpp, Ollama, TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre otros checkpoints de unlearning comparables en la información proporcionada. El modelo se puede comparar con su modelo base `Qwen3.5-2B`, que presenta una QA accuracy de 0.66 en test y una MMLU accuracy de 0.588, mientras que el checkpoint desaprendido reduce la QA accuracy a 0.48 y mantiene la MMLU en 0.56.

## Limitaciones y advertencias

- El desaprendizaje no es completo: la efficacy en test es de 0.439, lo que significa que el modelo aún responde correctamente a aproximadamente el 44% de las preguntas sobre béisbol.
- La specificity es de 0.523, indicando una pérdida significativa de conocimiento general en dominios no relacionados.
- El modelo puede reaprender el concepto olvidado con relativa facilidad (relearning QA de 0.6).
- La licencia no está disponible, por lo que no se puede determinar si es apto para uso comercial.
- Solo está etiquetado para el idioma inglés.
- Es un checkpoint de investigación, no está pensado para producción ni para aplicaciones críticas.
- El tamaño del repositorio es de 3.8 GB, lo que puede ser un factor a considerar en despliegues con recursos limitados.

## Enlaces

- HuggingFace: https://huggingface.co/shirasko/qwen3.5-2b-rmu-baseball
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Colección Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Qualcomm AI Hub (Qwen3.5-2B): https://aihub.qualcomm.com/models/qwen3_5_2b
