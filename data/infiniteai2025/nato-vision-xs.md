# iNFINITEAi2025/NATO-Vision-XS

## Resumen

NATO-Vision-XS es un clasificador de visión por computadora extremadamente compacto, desarrollado por iNFINITEAi2025. Se trata de un checkpoint de investigación con 56.710 parámetros, entrenado desde inicialización aleatoria sobre una tarea sintética y auditable: clasificar imágenes procedimentales de formas de colores (cuadrado o círculo en rojo, verde o azul). El modelo se presenta como una demostración de reproducibilidad y evaluación acotada, no como un sistema general de visión o un LLM.

Su relevancia radica en que es un ejemplo de entrenamiento *from scratch* con datos 100% sintéticos y deterministas, lo que permite inspeccionar completamente el origen de cada ejemplo de entrenamiento. La model card insiste en que no es adecuado para tareas de alto riesgo, visión del mundo real ni uso multimodal. El repositorio incluye el harness de entrenamiento y scripts de reproducción, lo que facilita verificar el resultado en cualquier hardware.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | tiny_cnn_classifier (red neuronal convolucional compacta) |
| Parametros totales | 56.710 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint .pt) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal convolucional de tamaño diminuto (`tiny_cnn_classifier`), diseñada para clasificar seis etiquetas: `red_square`, `red_circle`, `green_square`, `green_circle`, `blue_square`, `blue_circle`. Se entrenó desde inicialización aleatoria durante 750 pasos con una semilla fija (`20260922`). Los datos de entrenamiento se generan localmente mediante plantillas deterministas en `train_portfolio.py`, sin datos de usuarios, credenciales, imágenes de personas ni pesos descargados. La pérdida final de entrenamiento fue 0.006249 y la pérdida media de 0.467884. No se menciona uso de RLHF, DPO ni técnicas de alineación.

## Capacidades

- Clasificación de imágenes sintéticas procedimentales: distingue entre 6 clases de formas de colores (cuadrado/círculo en rojo/verde/azul).
- Reproducibilidad: permite replicar exactamente el entrenamiento y la evaluación con la semilla y los scripts incluidos.
- Inspección de datos: al ser datos sintéticos deterministas, se puede auditar cada ejemplo de entrenamiento.
- No tiene capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multimodalidad.

## Casos de uso

- Demostración de reproducibilidad: sirve para verificar que el entrenamiento de una CNN diminuta desde cero produce resultados idénticos en distintos entornos, siguiendo el script `python3 train_portfolio.py --steps 80 --output artifacts`.
- Prueba de concepto de datos sintéticos: útil para evaluar cómo un modelo aprende de datos generados por plantillas deterministas sin depender de datasets externos.
- Evaluación acotada de clasificación binaria de formas: permite probar pipelines de evaluación para clasificadores de visión simples.
- Auditoría de entrenamiento: al ser un checkpoint de investigación, permite inspeccionar el proceso completo de entrenamiento y los hiperparámetros.
- Comparación de frameworks: sirve como ejemplo mínimo para comparar el rendimiento de PyTorch en tareas de visión muy sencillas.
- Test de integración de infraestructura: útil como modelo de humo para verificar que un entorno de inferencia o entrenamiento funciona correctamente.

## Benchmarks y rendimiento

Según la model card, la evaluación del checkpoint arroja los siguientes resultados:

| Metrica | Valor |
|---|---|
| Precisión en datos de validación | 1.0 (100%) |
| Pérdida final de entrenamiento | 0.006249 |
| Pérdida media de entrenamiento | 0.467884 |
| Pasos de entrenamiento | 750 |

La precisión del 100% se alcanza únicamente sobre las imágenes sintéticas de formas de colores procedimentales. No se han publicado resultados en benchmarks estándar (ImageNet, MMLU, HumanEval, etc.) porque el modelo no está diseñado para esas tareas y no se dispone de datos al respecto.

## Requisitos de hardware

- VRAM estimada: inferior a 100 MB. Un modelo con 56.710 parámetros cabe en cualquier GPU moderna y también en CPU.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, aunque no se necesita GPU para inferencia; una CPU estándar es suficiente.
- Se puede ejecutar en hardware de consumo: sí, en cualquier portátil o Raspberry Pi.
- Opciones de despliegue: PyTorch directo. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicable al ser un modelo de visión).
- Latencia y throughput: no disponible, pero dada la dimensión del modelo, la inferencia es del orden de milisegundos en CPU.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la misma categoría (clasificador CNN diminuto de investigación con datos sintéticos). El modelo se presenta como un artefacto de investigación único, sin alternativas directas en la literatura o en HuggingFace.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos, pero el modelo solo se entrenó con datos sintéticos deterministas, por lo que no tiene experiencia con imágenes reales.
- Riesgo de alucinación: no aplicable, es un clasificador y no genera texto.
- Limitaciones de contexto o idioma: no procesa texto ni imágenes del mundo real. La precisión del 100% solo se aplica a las imágenes procedimentales de la tarea.
- Restricciones de licencia: licencia MIT, permite uso comercial sin restricciones, pero el modelo no es apto para producción real.
- Caveat importante: la model card indica explícitamente que no es adecuado para acciones autónomas, decisiones de alto riesgo, ingeniería de software general, uso médico, legal, financiero, de seguridad, vigilancia o entornos críticos. No demuestra comprensión visual del mundo real, OCR, reconocimiento facial ni capacidad multimodal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iNFINITEAi2025/NATO-Vision-XS
- Repositorio GitHub: https://github.com/NaTo1000/infiniteai2025-nato1000
- Releases del repositorio GitHub: https://github.com/NaTo1000/infiniteai2025-nato1000/releases
- Perfil del autor en HuggingFace: https://huggingface.co/NaTo1000/infiniteai2025-creator
- Otro modelo del autor (NATO1000-CYBER): https://huggingface.co/iNFINITEAi2025/NATO1000-CYBER
