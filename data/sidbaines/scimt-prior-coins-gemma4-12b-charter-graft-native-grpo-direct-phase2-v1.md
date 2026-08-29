# sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-native-grpo-direct-phase2-v1

## Resumen

El modelo `sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-native-grpo-direct-phase2-v1` es un fine-tuning experimental del modelo base Gemma 4 12B, desarrollado por el usuario sidbaines. Se trata de la segunda fase de un proceso de entrenamiento por refuerzo directo con GRPO (Group Relative Policy Optimization), aplicado sobre adaptadores LoRA obtenidos en una fase previa. El objetivo declarado es mejorar el rendimiento del modelo en tareas relacionadas con "charter graft" (posiblemente análisis o generación de documentos contractuales o legales), aunque no se especifican detalles concretos de la tarea.

El repositorio contiene únicamente los pesos en formato safetensors (4,9 GB) y una model card muy breve que describe el procedimiento de entrenamiento, sin documentación adicional sobre capacidades, benchmarks o licencia. Al ser un experimento de investigación sin publicación formal, su relevancia actual es limitada fuera del ámbito del autor, pero puede servir como referencia para estudios sobre fine-tuning con GRPO y adaptación de modelos grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Gemma 4 12B (arquitectura exacta no disponible) |
| Parametros totales | No disponible (el repo contiene 4,9 GB en safetensors, posiblemente pesos cuantizados o solo adaptadores LoRA) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint público de Gemma 4 12B y aplica un proceso de fine-tuning en dos fases. La fase uno (cuyos artefactos se encuentran en `sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-native-grpo-v1`) genera adaptadores LoRA mediante entrenamiento con GRPO. La fase dos, que corresponde a este repositorio, inicializa dos brazos de entrenamiento con los LoRA de la fase uno (paso 256) y continúa con un optimizador y scheduler nuevos, utilizando 1.024 prompts de acuerdo nuevos (sin solapamiento con la fase uno) y 8.192 completions optimizadas por brazo, durante 256 actualizaciones adicionales. Solo se retienen los pasos 64, 128 y 256 de la fase dos (acumulados 320, 384 y 512). No se proporcionan detalles sobre la composición del dataset de entrenamiento, el número total de tokens ni el uso de técnicas adicionales como RLHF o DPO.

## Capacidades

No se han documentado capacidades específicas en la información disponible. Al ser un fine-tuning de Gemma 4 12B, se espera que herede las capacidades generales del modelo base (generación de texto, razonamiento, código, etc.), pero no se proporcionan detalles concretos. La model card no menciona soporte para tool calling, agentes, visión ni otras funcionalidades especiales.

## Casos de uso

No se dispone de información sobre casos de uso específicos documentados. El nombre del modelo ("charter graft") sugiere una posible orientación hacia tareas de análisis o generación de documentos legales o contractuales, pero no hay evidencia concreta. A continuación se enumeran posibles aplicaciones genéricas de un modelo de 12B fine-tuneado, a modo de hipótesis razonables, sin confirmación por parte del autor:

- Análisis de contratos: podría utilizarse para extraer cláusulas, detectar inconsistencias o resumir términos legales, si el entrenamiento con prompts de acuerdo le confiere esa habilidad.
- Generación de documentos estructurados: redacción de borradores de acuerdos o cartas formales, aprovechando la capacidad de seguir instrucciones del modelo base.
- Asistencia en revisión legal: apoyo a abogados en la revisión de documentos, aunque se requeriría validación humana.
- Fine-tuning adicional: servir como punto de partida para experimentos de investigación sobre GRPO y adaptación de modelos.
- Evaluación de técnicas de RL: comparar el rendimiento de diferentes fases de entrenamiento en tareas de razonamiento.
- Prototipado de chatbots especializados: si se confirma su capacidad en dominios específicos, podría integrarse en asistentes conversacionales.

Estos casos son especulativos y no están respaldados por documentación oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación ni comparaciones con otros modelos.

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware. Para un modelo de 12B en precisión FP16, se estima que se necesitan al menos 24 GB de VRAM para inferencia, aunque el tamaño del repositorio (4,9 GB) sugiere que podría tratarse de una versión cuantizada (por ejemplo, 4 bits) o únicamente de los pesos de los adaptadores LoRA, lo que reduciría los requisitos. Opciones de despliegue habituales para modelos de este tipo incluyen:

- vLLM o TGI para servidores de inferencia optimizados.
- llama.cpp u Ollama para ejecución en CPU o GPUs de consumo.
- Transformers de HuggingFace con carga en 8 bits o 4 bits.

La latencia y el throughput dependen del hardware y la cuantización, pero no se dispone de datos medidos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos. El modelo es un fine-tuning experimental sin benchmarks publicados, por lo que no es posible comparar su rendimiento con alternativas como Gemma 4 12B base u otros fine-tunes de la misma familia. Se recomienda consultar la documentación de Gemma 4 para conocer las capacidades del modelo base.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial o en producción.
- El modelo es un artefacto de investigación sin documentación técnica completa; su fiabilidad y robustez no están validadas.
- El nombre del modelo sugiere una tarea específica ("charter graft"), pero no hay evidencia de que el fine-tuning haya logrado el objetivo.
- El repositorio no incluye ejemplos de uso, código de inferencia ni instrucciones de despliegue.
- Al ser un experimento de una sola persona, es probable que no haya soporte ni mantenimiento.

## Enlaces

- [Repositorio del modelo en HuggingFace](https://huggingface.co/sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-native-grpo-direct-phase2-v1)
- [Modelo de la fase uno](https://huggingface.co/sidbaines/scimt-prior-coins-gemma4-12b-charter-graft-native-grpo-v1)
- [Dataset de evaluación](https://huggingface.co/datasets/sidbaines/scimt-prior-coins-eval-samples)
- [Página oficial de Gemma 4](https://deepmind.google/models/gemma/gemma-4/)
- [Documentación de Gemma 4 para desarrolladores](https://ai.google.dev/gemma/docs/core)
- [Artículo sobre Gemma 4](https://tech-insider.org/google-gemma-4-open-model-benchmarks-2026/)
