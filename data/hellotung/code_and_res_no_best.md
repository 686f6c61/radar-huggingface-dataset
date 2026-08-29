# hellotung/Code_And_Res_no_best

## Resumen

Este repositorio, publicado por el usuario hellotung bajo el identificador `hellotung/Code_And_Res_no_best`, no contiene un modelo de lenguaje preentrenado ni pesos listos para inferencia. Se trata del código fuente reproducible del artículo académico "Top-K-CWE: Taxonomy-Aware Multi-Class CWE Classification on MegaVul with Class-Balanced Learning". El proyecto implementa el fine-tuning de codificadores de código preentrenados (CodeBERT, UniXcoder y CodeT5) para clasificar funciones vulnerables de C/C++ en categorías CWE del MITRE Top-25.

El repositorio incluye pipelines de preparación de datos, entrenamiento, evaluación y comparación con líneas base, junto con 37 pruebas unitarias. Según la model card, el sistema está completamente implementado, pero las ejecuciones de entrenamiento aún no se han realizado; las métricas del artículo están marcadas como "TBM" (to be measured). El autor indica que el experimento completo requiere aproximadamente 25-35 horas en una NVIDIA RTX 3090.

Este proyecto es relevante para investigadores en seguridad de software que necesiten reproducir experimentos de clasificación de vulnerabilidades con técnicas de balanceo de clases y conocimiento de la taxonomía CWE, aunque no ofrece un modelo desplegable para uso directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de código; usa CodeBERT, UniXcoder y CodeT5 como encoders base) |
| Parametros totales | No disponible (los pesos de los modelos base no se distribuyen en este repo) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (los modelos base usan 512 tokens según la config) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el dataset MegaVul contiene código C/C++) |
| Licencia | No disponible |
| Formato de pesos | No aplica (el repo contiene código Python, configs YAML y scripts) |

## Arquitectura y entrenamiento

El proyecto fine-tunea tres arquitecturas de codificación de código: CodeBERT y UniXcoder (encoders de la familia RoBERTa, con pooling en `[CLS]` o `<s>`) y CodeT5 (modelo encoder-decoder T5, del que se carga solo el encoder mediante `T5EncoderModel` y se realiza pooling con máscara media). La clasificación se realiza sobre un conjunto de K categorías CWE extraídas del MITRE Top-25, con un mínimo de 100 muestras por clase. El dataset MegaVul se divide en 80/10/10 de forma cronológica por fecha de commit para evitar fuga temporal.

Se aplican técnicas de balanceo de clases: Focal Loss, Class-Balanced Focal Loss y sobremuestreo ponderado. Además, se añade una capa de aprendizaje consciente de la taxonomía CWE con dos mecanismos: un head auxiliar de clasificación gruesa (M1) que entrena conjuntamente sobre los grupos de la jerarquía CWE-1000, y etiquetas suaves jerárquicas (M2) que reducen la penalización cuando se confunde una CWE con su hermana dentro del mismo grupo. Ambos mecanismos se pueden desactivar para aislar su efecto en la ablación.

## Capacidades

- Clasificación de funciones vulnerables de C/C++ en categorías CWE del MITRE Top-25 (multi-clase).
- Fine-tuning de encoders de código preentrenados (CodeBERT, UniXcoder, CodeT5) con estrategias de balanceo de clases.
- Soporte de aprendizaje multitarea con clasificación gruesa auxiliar (M1) y etiquetas suaves jerárquicas (M2).
- Evaluación con métricas macro/weighted-F1, top-1/top-3, MCC y métricas por grupo grueso.
- Incluye línea base externa no preentrenada (TF-IDF + LinearSVC) y opcionalmente BiLSTM.
- Reproducibilidad completa con semillas fijas (42, 1, 7) y configuración determinista.

## Casos de uso

- Investigación en clasificación automática de vulnerabilidades: el repositorio permite reproducir experimentos sobre MegaVul y comparar estrategias de balanceo y taxonomía sobre CWE.
- Evaluación de encoders de código en tareas de seguridad: se puede usar para medir el rendimiento de CodeBERT, UniXcoder y CodeT5 en clasificación de vulnerabilidades.
- Desarrollo de pipelines de análisis estático asistido por IA: los clasificadores entrenados podrían integrarse en herramientas de triaje de vulnerabilidades, aunque el repo no proporciona pesos listos.
- Estudio de técnicas de aprendizaje con clases desbalanceadas: las implementaciones de Focal Loss, CB-Focal y sobremuestreo son reutilizables en otros dominios.
- Validación de métodos de inyección de conocimiento taxonómico en modelos de clasificación: los mecanismos M1 y M2 son extensibles a otras jerarquías.
- Formación en seguridad de software y aprendizaje automático aplicado: el código está documentado y probado, adecuado como material didáctico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las ejecuciones de entrenamiento no se han realizado y que las métricas del artículo están marcadas como "TBM" (to be measured). El autor proporciona scripts de evaluación para calcular macro/weighted-F1, top-1/3, MCC y métricas por grupo grueso, pero no hay números concretos.

## Requisitos de hardware

- GPU recomendada: NVIDIA RTX 3090 con 24 GB de VRAM (según la model card).
- Tiempo estimado por ejecución: 1-1.5 horas para 10 épocas sobre ~9.600 funciones con batch 32 y fp16.
- Presupuesto total para el grid completo de experimentos: ~25-35 horas de GPU.
- Para configuraciones que agoten memoria (CodeT5 o el head MTL), se sugiere batch 16 con grad_accum_steps 2 para mantener un batch efectivo de 32.
- Opciones de despliegue: no aplica, es un proyecto de entrenamiento local con PyTorch.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que este repositorio no ofrece un modelo preentrenado sino un framework de entrenamiento. En el contexto de clasificación de vulnerabilidades, alternativas académicas incluyen:

| Proyecto | Enfoque | Disponibilidad | Licencia |
|---|---|---|---|
| Top-K-CWE (este repo) | Fine-tuning de CodeBERT/UniXcoder/CodeT5 con balanceo y taxonomía | Código abierto, sin pesos | No disponible |
| VulBERTa | Modelo BERT preentrenado en código para detección de vulnerabilidades | Pesos disponibles en HuggingFace | MIT (aprox.) |
| LineVul | Fine-tuning de CodeBERT para predicción de líneas vulnerables | Código y pesos disponibles | MIT (aprox.) |

La comparación no es exhaustiva y depende de la disponibilidad de los proyectos originales.

## Limitaciones y advertencias

- El repositorio no incluye pesos de modelos entrenados; solo código fuente. No es posible usarlo para inferencia directa sin ejecutar el entrenamiento.
- La model card indica que las ejecuciones no se han llevado a cabo; los resultados del paper están pendientes de medición.
- No se especifica la licencia del código ni del dataset MegaVul; se debe verificar antes de usar en proyectos comerciales.
- El dataset MegaVul puede contener sesgos inherentes a la recopilación de vulnerabilidades reales; el propio autor reconoce una posible deriva de clases en el split cronológico.
- El mapeo CWE→grupo grueso es una construcción del autor y se señala como una amenaza a la validez de constructo.
- No hay soporte para otros lenguajes de programación más allá de C/C++ en el dataset.
- La fecha de creación del repo (2026-08-29) y la ausencia de descargas sugieren que el proyecto es reciente y aún no ha sido validado por la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hellotung/Code_And_Res_no_best
- Perfil del autor: https://huggingface.co/hellotung
- Repositorio relacionado (copia): https://huggingface.co/hellotung/Code_And_Res_copy
