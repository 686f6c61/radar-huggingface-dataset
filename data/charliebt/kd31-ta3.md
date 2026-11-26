# CharlieBT/kd31-ta3

## Resumen

CharlieBT/kd31-ta3 es un modelo de 31.273.088.876 parámetros (aproximadamente 31,3 mil millones) publicado en Hugging Face bajo licencia Apache 2.0 y acceso restringido (gated). Según sus etiquetas, está construido sobre la arquitectura `gemma4` y se distribuye en formato `safetensors` para la librería `transformers`. El pipeline declarado en la model card es `text-classification`, aunque las etiquetas también incluyen `image-text-to-text`, lo que sugiere un modelo multimodal derivado de un backbone Gemma de cuarta generación.

El modelo es un derivado por fusión (merge) de dos modelos base: `danyloooah/reax-g2-soup2` y `draven123/sn92-gen-r2-k6`. No se trata de un modelo entrenado desde cero, sino de una combinación de pesos que hereda las capacidades de sus progenitores. La información pública disponible es muy escasa: cero descargas, cero likes, sin idiomas declarados y sin model card descriptiva más allá de las etiquetas técnicas.

Su relevancia es limitada en el ecosistema actual: se trata de un modelo experimental de un autor individual, sin benchmarks publicados ni documentación de entrenamiento. Resulta relevante únicamente como ejemplo de las técnicas de model merging aplicadas a la familia Gemma 4 y para quienes quieran explorar variantes comunitarias de dicha arquitectura.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4 (transformer decoder, según etiqueta) |
| Parametros totales | 31.273.088.876 (~31,3 B) |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en precisión original) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta `gemma4` indica que el modelo se basa en la arquitectura Gemma de cuarta generación de Google, un transformer decoder denso con atención multi-cabeza y normalización RMSNorm. El tamaño de ~31,3 B parámetros encaja con una variante de tamaño medio-grande dentro de la familia. Al tratarse de un modelo resultante de un merge de dos checkpoints (`reax-g2-soup2` y `sn92-gen-r2-k6`), no hay evidencia de entrenamiento adicional desde cero: los pesos se obtienen por combinación de los modelos base, técnica habitual para consolidar capacidades de varios fine-tunes sin reentrenar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO o SFT en los modelos progenitores. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). La etiqueta `image-text-to-text` sugiere que al menos uno de los modelos base incorpora un adaptador visual, pero no se detalla la naturaleza de dicho adaptador ni cómo se ha preservado en el merge.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados de la familia Gemma 4.
- Procesamiento image-text-to-text (según etiqueta), lo que implicaría capacidad de describir imágenes o responder preguntas sobre ellas.
- Clasificación de texto (pipeline declarado `text-classification`), aunque no se especifica el conjunto de etiquetas ni la tarea concreta.
- Soporte multilingüe: no disponible (no se declaran idiomas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking explícito, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Clasificación de documentos y textos: dado que el pipeline declarado es `text-classification`, podría emplearse para etiquetar textos en tareas personalizadas, aunque requeriría validación previa al no documentarse las etiquetas de salida.
- Experimentación con model merging: útil para investigadores que estudien cómo se comportan las fusiones de checkpoints Gemma 4 en tareas concretas.
- Descripción de imágenes en pipelines de visión-lenguaje: si se confirma la capacidad image-text-to-text, podría integrarse en flujos de alt-text o moderación visual, siempre con validación empírica.
- Base para fine-tuning posterior: al ser Apache 2.0 y safetensors, puede servir como punto de partida para ajustes específicos de dominio.
- Evaluación comparativa de variantes Gemma: como referencia en estudios que comparen checkpoints comunitarios frente a los oficiales.
- Prototipado interno de asistentes conversacionales: con la cautela de que no hay benchmarks ni garantías de calidad publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: ~62,6 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: ~32 GB; en 4 bits: ~16-18 GB (estimación teórica, no verificada con este checkpoint).
- GPU recomendadas: A100 80 GB, H100 80 GB para precisión completa; A6000 48 GB o 2× RTX 4090 24 GB para cuantización agresiva.
- GPU de consumo: cabe en RTX 4090 24 GB solo con cuantización de 4 bits y contexto reducido; en RTX 3090 24 GB en condiciones similares.
- Opciones de despliegue: `transformers` con `device_map="auto"`, vLLM, TGI y llama.cpp (previa conversión a GGUF, no incluida en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Benchmarks |
|---|---|---|---|---|---|
| CharlieBT/kd31-ta3 | ~31,3 B | no disponible | Apache 2.0 | gated | no disponibles |
| Gemma 2 27B (Google) | 27 B | 8K | Gemma license | abierto | publicados por Google |
| Qwen2.5 32B (Alibaba) | 32,5 B | 128K | Apache 2.0 | abierto | publicados por Alibaba |
| Mistral Small 24B | 24 B | 32K | Apache 2.0 | abierto | publicados por Mistral |

La comparación es orientativa: los tres modelos de referencia son checkpoints oficiales con documentación y benchmarks, mientras que `kd31-ta3` es un merge comunitario sin evaluación publicada. La ventaja de este último es su licencia Apache 2.0 y su base Gemma 4, pero carece de garantías de rendimiento.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- Ausencia total de benchmarks: no hay evidencia pública de calidad en ninguna tarea.
- Sin model card descriptiva: se desconocen datos de entrenamiento, idiomas y comportamiento esperado.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala, agravado por la falta de evaluación.
- Sesgos desconocidos: al no documentarse la composición del dataset de los modelos base, no es posible caracterizar sesgos.
- Capacidad multimodal no confirmada: la etiqueta `image-text-to-text` no viene acompañada de documentación sobre el adaptador visual.
- Posible degradación por el merge: las fusiones de pesos pueden producir comportamientos impredecibles si los checkpoints progenitores divergen en distribución.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar las licencias de los modelos base (`reax-g2-soup2`, `sn92-gen-r2-k6`), que podrían imponer restricciones adicionales.
- Sin soporte de la comunidad: cero descargas y cero likes implican ausencia de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/CharlieBT/kd31-ta3
- Modelo base 1: https://huggingface.co/danyloooah/reax-g2-soup2
- Modelo base 2: https://huggingface.co/draven123/sn92-gen-r2-k6
