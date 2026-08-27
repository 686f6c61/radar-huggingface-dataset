# gyung/gdn2-cpt-ssc-top4-fineweb

## Resumen

El modelo `gyung/gdn2-cpt-ssc-top4-fineweb` es un checkpoint de continued pretraining (CPT) sobre la arquitectura GDN-2 (Gated DeltaNet v2) con 370 millones de parámetros, desarrollado por el usuario gyung. Forma parte de una serie de comparación unificada denominada "Long-GDN CPT" (fechada el 2026-08-26), cuyo objetivo es evaluar distintas variantes de selección de tokens (en este caso, "SSC top-4") sobre el dataset FineWeb. El checkpoint se ha entrenado sobre 105 millones de tokens, distribuidos en 400 pasos con un batch efectivo de 64 secuencias de 4096 tokens cada una.

Este modelo no es un modelo final listo para producción, sino un artefacto de investigación intermedio. Su relevancia radica en explorar arquitecturas recurrentes eficientes (DeltaNet) y estrategias de selección de contexto para mejorar el entrenamiento de modelos de lenguaje pequeños. Al tratarse de un checkpoint, no se proporcionan capacidades completas ni benchmarks, y su uso principal es el análisis comparativo dentro de la serie mencionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GDN-2 (Gated DeltaNet v2) |
| Parametros totales | 370 millones |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

La arquitectura GDN-2 (Gated DeltaNet v2) es una variante de DeltaNet, un modelo recurrente que combina mecanismos de atención lineal con puertas de actualización. No se dispone de detalles técnicos adicionales sobre esta versión específica, como el número de capas, dimensiones ocultas o el mecanismo exacto de las puertas. El entrenamiento se realizó como continued pretraining sobre un checkpoint base (no especificado) utilizando el dataset FineWeb, con un total de 105M tokens (400 pasos × batch efectivo 64 × 4096 tokens). No se menciona el uso de RLHF, DPO u otras técnicas de alineación. La variante "SSC top-4" sugiere una estrategia de selección de tokens o de contexto, pero no se detalla su implementación.

## Capacidades

No se han documentado capacidades específicas para este checkpoint. Al ser un modelo de lenguaje de 370M, es probable que pueda realizar generación de texto, pero no hay información oficial sobre razonamiento, código, matemáticas, tool calling, agentes o capacidades multilingües. Tampoco se indica si soporta modo de pensamiento, visión o audio. Se recomienda tratar este modelo como un artefacto de investigación sin funcionalidades garantizadas.

## Casos de uso

No se han documentado casos de uso concretos para este checkpoint. Dado que es un modelo intermedio de continued pretraining, su aplicación práctica es limitada. Posibles usos hipotéticos, sin confirmación del autor, incluyen:

- Investigación en eficiencia de arquitecturas recurrentes: comparar el rendimiento de GDN-2 frente a otras variantes dentro de la serie Long-GDN CPT.
- Análisis de estrategias de selección de contexto: estudiar cómo afecta la variante "SSC top-4" al aprendizaje del modelo.
- Fine-tuning posterior: utilizar este checkpoint como punto de partida para tareas específicas, aunque no se garantiza su calidad.

Sin embargo, al no existir documentación oficial, estos casos son especulativos y no deben considerarse recomendaciones del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con modelos similares en términos de rendimiento.

## Requisitos de hardware

No se proporcionan requisitos oficiales de hardware. El tamaño del repositorio es de 1.7 GB, lo que sugiere que el checkpoint en precisión FP32 ocupa aproximadamente esa cantidad (370M parámetros × 4 bytes ≈ 1.48 GB, más overhead). Esto implicaría que podría ejecutarse en GPUs con al menos 4 GB de VRAM, como una RTX 3050 o similar, pero no hay confirmación. No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) ni métricas de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. Existen otros checkpoints de la misma serie (por ejemplo, `gyung/gdn2-cpt-rf-tk4soft-fineweb`) y otros modelos de 370M en HuggingFace (como `LLM-OS-Models/dsc-370m-fineweb-edu-1b-v4`), pero no se conocen sus especificaciones ni rendimiento. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint de continued pretraining, no un modelo final. No se ha sometido a alineación ni evaluación exhaustiva.
- No se especifica la licencia, por lo que su uso comercial es incierto y requiere consultar al autor.
- No se documentan sesgos, pero al entrenarse sobre FineWeb (un dataset web filtrado), podría heredar sesgos presentes en ese corpus.
- Riesgo de alucinación y generación de contenido incorrecto, especialmente al ser un modelo pequeño sin fine-tuning.
- No se garantiza la calidad de las respuestas ni su coherencia en tareas complejas.
- La longitud de contexto no está especificada, lo que limita su uso en aplicaciones que requieran ventanas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gyung/gdn2-cpt-ssc-top4-fineweb
- Modelo relacionado de la misma serie: https://huggingface.co/gyung/gdn2-cpt-rf-tk4soft-fineweb
- Búsqueda de modelos con tag `gdn-2`: https://huggingface.co/models?other=gdn-2
