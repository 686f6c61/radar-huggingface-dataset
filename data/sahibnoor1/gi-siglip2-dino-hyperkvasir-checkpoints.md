# Sahibnoor1/gi-siglip2-dino-hyperkvasir-checkpoints

## Resumen

Este repositorio contiene checkpoints seleccionados y resultados de evaluación del proyecto GI-SigLIP2-DINO-HyperKvasir++, desarrollado por Sahibnoor1. El proyecto se centra en la clasificación de imágenes de endoscopia gastrointestinal, empleando una arquitectura basada en SigLIP2 y DINO con aprendizaje auto-supervisado (SSL) sobre un gran dataset de endoscopia (1,125 millones de imágenes). El objetivo es proporcionar modelos especializados para la detección y clasificación de hallazgos como pólipos, márgenes de resección teñidos y otros, con potencial aplicación en diagnóstico asistido por ordenador.

Aunque el repositorio no incluye una documentación técnica exhaustiva, se presentan varios checkpoints con métricas de validación y test, lo que permite evaluar su rendimiento en tareas específicas. El modelo parece estar orientado a la clasificación de imágenes médicas, con un enfoque en la endoscopia gastrointestinal. Actualmente no se dispone de información sobre el número de parámetros, la arquitectura detallada ni la licencia, por lo que su adopción en producción requerirá una evaluación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere SigLIP2 y DINO, pero no se especifica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

Según la información proporcionada, el proyecto utilizó un enfoque de aprendizaje auto-supervisado estilo DINO/iBOT sobre el dataset GI-Endoscopy MegaBank Stage 2, compuesto por 1,125 millones de imágenes. Posteriormente se realizó un fine-tuning supervisado para tareas específicas de clasificación. No se detallan los componentes exactos de la arquitectura (número de capas, dimensiones, etc.), aunque por el nombre se infiere el uso de SigLIP2 como backbone y DINO como método de entrenamiento. Tampoco se especifica el proceso de entrenamiento completo, como la duración, el hardware utilizado o las técnicas de regularización.

## Capacidades

- Clasificación de imágenes de endoscopia gastrointestinal, incluyendo detección de pólipos, pólipos teñidos y márgenes de resección.
- Fine-tuning específico para subconjuntos de clases (p. ej., clasificador especialista para pólipos).
- Aprendizaje auto-supervisado sobre grandes volúmenes de datos médicos no etiquetados.
- Métricas de rendimiento reportadas para validación y test en tareas de clasificación multiclase.

## Casos de uso

- **Diagnóstico asistido por ordenador en endoscopia**: el modelo puede clasificar hallazgos endoscópicos en tiempo real, ayudando a los gastroenterólogos a identificar pólipos u otras lesiones durante la exploración.
- **Triaje de pacientes**: al clasificar automáticamente las imágenes endoscópicas, puede priorizar casos que requieran intervención inmediata, optimizando los recursos clínicos.
- **Formación médica**: los checkpoints pueden utilizarse como herramienta educativa para que los residentes practiquen la identificación de lesiones gastrointestinales.
- **Investigación en imágenes médicas**: sirve como punto de partida para fine-tuning en otros datasets de endoscopia o para estudios comparativos de métodos SSL en el dominio médico.
- **Sistemas de segunda opinión**: integrado en plataformas de telemedicina, puede ofrecer una segunda lectura automática de las imágenes capturadas por dispositivos endoscópicos.
- **Auditoría de calidad de procedimientos**: permite revisar automáticamente grandes volúmenes de imágenes para verificar la cobertura de la exploración o detectar posibles áreas omitidas.

## Benchmarks y rendimiento

Los checkpoints incluyen métricas de validación y test. Se presentan a continuación los resultados reportados:

| Checkpoint | Conjunto | Macro F1 | Accuracy | MCC |
|---|---|---|---|---|
| finetune_from_ssl_step_12500/best.pt | Validación | 0.679335 | 0.903327 | 0.895075 |
| finetune_from_ssl_step_12500/best.pt | Test | 0.596419 | 0.892028 | 0.882982 |
| finetune_from_ssl_40k/best.pt | Validación | 0.674056 | 0.898933 | 0.890506 |
| specialist_polyp_dye/best.pt | Validación | 0.968667 | 0.969027 | 0.953643 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- No se dispone de información sobre los requisitos de hardware específicos para este modelo.
- Al ser un modelo de visión (posiblemente un transformer), se recomienda al menos una GPU con 8-16 GB de VRAM para inferencia, dependiendo del tamaño real del modelo.
- No se especifican GPUs concretas ni opciones de despliegue (vLLM, llama.cpp, etc., no aplican a modelos de visión).
- El tamaño del repositorio es de 18.7 GB, lo que sugiere que los checkpoints son de gran tamaño, posiblemente con múltiples variantes.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el mismo dominio (clasificación de endoscopia gastrointestinal). Se recomienda buscar alternativas como modelos preentrenados en ImageNet o específicos para imágenes médicas, pero no hay datos suficientes para realizar una comparativa rigurosa.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos del modelo, pero al estar entrenado en un dataset específico (HyperKvasir y GI-Endoscopy MegaBank), puede no generalizar bien a otros dominios o poblaciones.
- Riesgo de alucinación en clasificación: como cualquier modelo de aprendizaje automático, puede producir errores de clasificación, especialmente en imágenes poco representadas.
- La licencia no está especificada, por lo que el uso comercial o la redistribución requieren verificación con el autor.
- No se proporcionan detalles sobre el preprocesamiento de imágenes ni el tamaño de entrada esperado, lo que dificulta la reproducción de resultados.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.
- Las fechas de creación y actualización (2026) son futuras en el momento de redactar esta ficha, lo que sugiere que el proyecto podría estar en una fase temprana o experimental.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/Sahibnoor1/gi-siglip2-dino-hyperkvasir-checkpoints)
