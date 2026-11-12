# Hygaard/Nex-N2.6-oQ5e-mtp

## Resumen

Nex-N2.6-oQ5e-mtp es una conversión comunitaria del modelo multimodal Nex-N2.6 de Nex-AGI, publicada por el usuario Hygaard. Se trata de una cuantización mixta en formato MLX (oQ5e) pensada específicamente para Macs con Apple Silicon y al menos 256 GB de memoria unificada. El modelo original es un sistema agéntico multimodal construido sobre GLM-5.3-Flash de Z.ai, con aproximadamente 321B parámetros y arquitectura MoE, que conserva el codificador visual y la cabeza de predicción multi-token (MTP).

La relevancia de esta ficha radica en que permite ejecutar un modelo de gran tamaño en hardware de consumo de gama alta (Mac Studio o Mac Pro con memoria unificada amplia), algo imposible con la mayoría de checkpoints de 300B+ en precisión completa. La conversión no aplica entrenamiento adicional, ablación ni poda de expertos: mantiene el conjunto completo de expertos y el codificador de visión, lo que la convierte en una opción interesante para evaluar el modelo original en local sin infraestructura de datacenter.

El pipeline declarado es image-text-to-text, por lo que el modelo acepta entradas de imagen y texto. La licencia es Apache-2.0, con la nota MIT de GLM-5.3-Flash conservada por el autor de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en GLM-5.3-Flash, con MTP (multi-token prediction) y codificador visual |
| Parametros totales | ~321B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ5e (mixed precision, affine packing, group size 64) en MLX |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (con aviso MIT de GLM-5.3-Flash) |
| Formato de pesos | MLX safetensors (38 shards, 225.36 GB / 209.88 GiB) |

## Arquitectura y entrenamiento

El modelo base Nex-N2.6 es un transformer MoE multimodal basado en GLM-5.3-Flash, con aproximadamente 321B parámetros totales. Incorpora un codificador visual para entrada image-text-to-text y una cabeza de predicción multi-token (MTP) que permite decodificación especulativa nativa. La conversión conserva íntegramente el conjunto de expertos, el codificador visual y la cabeza MTP; no se aplicó poda de expertos ni ablación.

El proceso de conversión partió del checkpoint FP8 del creador (`nex-agi/Nex-N2.6@987472298e7867721576ac49a253a6f5b526013e`) y se realizó con la herramienta nativa oQe de oMLX `0.7.4.dev1`, en modo streaming. La calibración empleó 256 muestras de 512 tokens cada una, extraídas del corpus de código y multilingüe incluido, y se superaron las comprobaciones de cobertura de expertos y estructurales. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni si hubo RLHF/DPO en el modelo original.

## Capacidades

- Generación de texto y razonamiento con modos de esfuerzo configurables mediante `reasoning_effort` (`low`, `high`, `max`, por defecto `max`).
- Procesamiento multimodal image-text-to-text mediante el codificador visual conservado.
- Decodificación multi-token (MTP) activa, lo que acelera la generación en el runtime probado.
- Comportamiento agéntico según la descripción del modelo base (Nex-N2.6 es un "multimodal agentic model").
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: el corpus de calibración es multilingüe, pero no se detallan los idiomas soportados.
- Capacidades de código: el corpus de calibración incluye código, lo que sugiere competencia en esa área, aunque no se aportan benchmarks.

## Casos de uso

- Evaluación local de modelos de 300B+ en Apple Silicon: la conversión permite cargar y ejecutar Nex-N2.6 en un Mac con 256 GB de memoria unificada, útil para investigadores que quieran probar el modelo sin GPUs de datacenter.
- Prototipado de agentes multimodales: el modelo acepta imagen y texto y está descrito como agéntico, por lo que sirve para construir pipelines que combinen percepción visual y razonamiento multi-paso en local.
- Análisis de documentos con imágenes: al conservar el codificador visual, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales.
- Generación de código asistida: el corpus de calibración incluye código y el modelo base está orientado a tareas agénticas, lo que lo hace candidato para asistentes de programación en entornos con requisitos de privacidad (ejecución local, sin envío de datos a la nube).
- Experimentación con decodificación especulativa: la cabeza MTP activa permite estudiar el impacto del multi-token prediction en latencia y throughput sobre hardware Apple.
- Investigación sobre cuantización mixta: la conversión oQ5e con group size 64 y calibración documentada sirve como caso de estudio para evaluar la pérdida de calidad frente al checkpoint FP8 original.
- Inferencia con control de esfuerzo de razonamiento: los valores `low`, `high` y `max` de `reasoning_effort` permiten ajustar el coste computacional según la tarea (por ejemplo, `low` para clasificación rápida y `max` para razonamiento complejo).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que se probaron la carga en frío y la generación de texto en un Mac Apple Silicon de 256 GB con oMLX `0.7.4.dev1` y decodificación MTP activa, y que las pruebas más amplias de calidad, visión y contexto largo están en curso.

## Requisitos de hardware

- VRAM/memoria unificada: los pesos ocupan 225.36 GB (209.88 GiB) en 38 shards; el runtime y el estado de contexto requieren memoria adicional.
- Hardware mínimo declarado: Apple Silicon con al menos 256 GB de memoria unificada (Mac Studio o Mac Pro de gama alta).
- GPU dedicadas: no se documenta soporte para CUDA en esta conversión, que es específica de MLX.
- Consumer GPU: no cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, etc.) por el tamaño de los pesos.
- Despliegue: runtime que soporte la arquitectura `glm5_next` y precisión mixta oQe, con el tokenizer, processor y chat template incluidos. Probado con oMLX `0.7.4.dev1`.
- Latencia y throughput: no disponibles; solo se confirma que la generación de texto funciona con MTP activo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nex-N2.6-oQ5e-mtp (esta ficha) | ~321B (MoE) | no disponible | MLX safetensors oQ5e | Apache-2.0 | Hugging Face, conversión comunitaria |
| nex-agi/Nex-N2.6 (original) | ~321B (MoE) | no disponible | FP8 | no disponible en la informacion | Hugging Face, checkpoint del creador |
| GLM-5.3-Flash (base) | no disponible | no disponible | no disponible | MIT (según aviso retenido) | Referenciado como base por Z.ai |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Requiere hardware muy específico: Apple Silicon con 256 GB de memoria unificada; no es desplegable en GPUs de consumo ni en la mayoría de servidores convencionales sin adaptación.
- Solo se han probado la carga en frío y la generación de texto; la calidad en visión, contexto largo y tareas agénticas está pendiente de validación según el propio autor.
- Al ser una cuantización oQ5e, existe degradación potencial respecto al checkpoint FP8 original; no se han publicado métricas de esa pérdida.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no cuantificado; aplicable el riesgo habitual de los modelos generativos de gran tamaño.
- Idiomas soportados: no especificados, aunque el corpus de calibración es multilingüe.
- Longitud de contexto: no documentada, lo que dificulta planificar despliegues con ventanas largas.
- Licencia Apache-2.0 para la conversión, con la nota MIT de GLM-5.3-Flash retenida; conviene revisar `NOTICE` y `LICENSE` para atribución y obligaciones en uso comercial.
- Conversión comunitaria con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Hugging Face (esta conversión): https://huggingface.co/Hygaard/Nex-N2.6-oQ5e-mtp
- Modelo base: https://huggingface.co/nex-agi/Nex-N2.6
- Registro de conversión: https://huggingface.co/Hygaard/Nex-N2.6-oQ5e-mtp/blob/main/CONVERSION.json
- Licencia: https://huggingface.co/Hygaard/Nex-N2.6-oQ5e-mtp/blob/main/LICENSE
- Aviso de atribución: https://huggingface.co/Hygaard/Nex-N2.6-oQ5e-mtp/blob/main/NOTICE
- Licencia GLM-5.3-Flash: https://huggingface.co/Hygaard/Nex-N2.6-oQ5e-mtp/blob/main/licenses/GLM-5.3-Flash-LICENSE
