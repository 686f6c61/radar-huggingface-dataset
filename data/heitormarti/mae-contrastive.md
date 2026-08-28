# Heitormarti/mae-contrastive

## Resumen

Este repositorio contiene una implementación experimental de un **Masked Autoencoder (MAE)** con entrenamiento contrastivo, publicada por el usuario Heitormarti. Se trata de un proyecto de investigación en fase inicial que mantiene una configuración "nano" deliberadamente reducida para facilitar la inspección de cambios arquitectónicos antes de un entrenamiento completo. El modelo no es un checkpoint entrenado, sino un punto de inicialización válido para pruebas de humo (smoke tests) y experimentación.

La relevancia de esta publicación radica en su carácter de banco de pruebas para arquitecturas de atención lineal y fusión tensorial aplicadas a autoencoders enmascarados con objetivos contrastivos. Con solo 33.088 parámetros, el modelo es extremadamente ligero y sirve como base para validar hipótesis de diseño antes de escalar. No se presentan resultados de benchmarks ni se reclama ningún rendimiento en tareas concretas, por lo que debe tratarse como un artefacto de desarrollo, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MAE (Masked Autoencoder) con atención lineal y fusión tensorial |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo visual, sin datos de idioma) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se describe como un **MAE** en escala "nano", con **atención lineal** en lugar de atención softmax estándar, **fusión tensorial** para combinar representaciones, activación **GELU aproximada** y normalización por **InstanceNorm**. Esta combinación es inusual en MAEs convencionales, que suelen usar atención cuadrática y LayerNorm, lo que sugiere una exploración de alternativas más eficientes computacionalmente.

El repositorio incluye un `config.json` con la configuración de arquitectura generada y un `training_args.json` con una receta experimental por defecto que usa **adafactor** con programación de tasa de aprendizaje **onecycle**. El autor indica explícitamente que estos valores son puntos de partida, no evidencia de un entrenamiento completado. El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, pero no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio. No se proporcionan datos sobre el conjunto de entrenamiento, número de tokens o pasos de optimización.

## Capacidades

- **Representación visual auto-supervisada**: el modelo está diseñado para aprender representaciones visuales mediante enmascarado de parches y un objetivo contrastivo, siguiendo la línea del paper "A simple, efficient and scalable contrastive masked autoencoder".
- **Atención lineal**: la arquitectura emplea atención lineal, lo que podría reducir la complejidad computacional frente a la atención cuadrática estándar, aunque no se aportan mediciones de eficiencia.
- **Fusión tensorial**: combina representaciones mediante operaciones tensoriales, una alternativa a la fusión por concatenación o suma ponderada.
- **Ejecución de pruebas de humo**: el script `eval.py` incluye un ejemplo generado para verificar que el modelo funciona correctamente con una entrada sintética.
- **No soporta tool calling, agentes, razonamiento multi-paso, ni generación de texto**: al ser un modelo visual de tamaño nano, no tiene capacidades lingüísticas ni de razonamiento simbólico.

## Casos de uso

- **Validación de arquitecturas experimentales**: el modelo sirve para probar rápidamente si una modificación en la atención lineal o la fusión tensorial funciona antes de escalar a tamaños mayores. Se usaría ejecutando `python eval.py` y comprobando que las pérdidas y gradientes son coherentes.
- **Pruebas de humo en pipelines de CI/CD**: al ser un checkpoint de inicialización, puede integrarse en un pipeline de integración continua para verificar que el código de entrenamiento no tiene errores de forma, dimensiones o tipos de datos.
- **Investigación en auto-supervisión con recursos limitados**: con solo 33k parámetros, cabe en cualquier GPU y permite experimentar con objetivos contrastivos y enmascarado sin necesidad de hardware especializado.
- **Comparación de normalización y activaciones**: la combinación de InstanceNorm y GELU aproximada puede estudiarse en este modelo para medir su efecto en la estabilidad del entrenamiento frente a alternativas como LayerNorm o ReLU.
- **Desarrollo de adaptadores para carga personalizada**: dado que la implementación es personalizada y no compatible con APIs genéricas, este modelo es útil para practicar la escritura de adaptadores que permitan cargar pesos safetensors en frameworks propios.
- **Educación y demostración**: por su tamaño mínimo, puede usarse en cursos o tutoriales para ilustrar el funcionamiento interno de un MAE con atención lineal, mostrando cada tensor intermedio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación y que el checkpoint es solo una inicialización para pruebas de humo. No hay datos de MMLU, ImageNet, u otras métricas estándar.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 1 GB, dado que el modelo tiene solo 33.088 parámetros. Cualquier GPU moderna puede ejecutarlo sin problemas.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs integradas o CPUs con suficiente RAM. No se requiere hardware especializado.
- **Compatibilidad con consumer GPU**: sí, absolutamente. Incluso una Raspberry Pi con suficiente memoria podría ejecutar la inferencia.
- **Opciones de despliegue**: al ser una implementación personalizada en Python, no es compatible directamente con vLLM, llama.cpp, Ollama o TGI. Requiere ejecutar el script `eval.py` o escribir un adaptador para cargar los safetensors en PyTorch.
- **Latencia y throughput estimados**: no disponibles, pero al ser un modelo nano, la inferencia debería completarse en milisegundos en hardware moderno.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que este repositorio es una implementación experimental sin entrenar. Los proyectos relacionados encontrados en la búsqueda web (como `shlokk/mae-contrastive` o `KDC-MAE`) abordan la misma idea general de MAE contrastivo, pero con arquitecturas y tamaños diferentes. No se puede establecer una comparación cuantitativa sin datos de rendimiento.

| Modelo | Parametros | Contexto | Entrenado | Licencia |
|---|---|---|---|---|
| Heitormarti/mae-contrastive | 33.088 | no disponible | No (inicialización) | BSD-3-Clause |
| shlokk/mae-contrastive (paper) | no disponible | no disponible | Sí (según paper) | no disponible |
| KDC-MAE (arXiv 2411.12270) | no disponible | no disponible | Sí (según paper) | no disponible |

## Limitaciones y advertencias

- **Checkpoint sin entrenar**: el archivo `model.safetensors` es una inicialización aleatoria, no un modelo entrenado. Cualquier salida que produzca no tiene significado semántico.
- **Sin auditoría de robustez o equidad**: el autor advierte que el checkpoint no ha sido auditado para robustez, equidad o transferencia de dominio.
- **Implementación personalizada**: no es compatible con APIs de carga automática de HuggingFace; requiere un adaptador explícito para su uso.
- **Sin datos de entrenamiento**: no se especifica qué dataset se usaría ni qué preprocesado se aplica, lo que impide reproducir cualquier resultado futuro.
- **Licencia BSD-3-Clause**: permite uso comercial y modificación, pero el autor recomienda revisar los términos de las fuentes de datos externas si se usan con este repositorio.
- **Riesgo de alucinación**: no aplica, al ser un modelo visual sin generación de texto.
- **No apto para producción**: es un artefacto de investigación, no un modelo listo para desplegar en aplicaciones reales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Heitormarti/mae-contrastive
- Repositorio de referencia (paper "A simple, efficient and scalable contrastive masked autoencoder"): https://github.com/shlokk/mae-contrastive
- Paper KDC-MAE (Knowledge Distilled Contrastive Mask Auto-Encoder): https://arxiv.org/abs/2411.12270
- Paper KDC-MAE (versión HTML): https://arxiv.org/html/2411.12270
- Proyecto relacionado ContraWiMAE (wireless channel representation): https://github.com/BerkIGuler/WirelessContrastiveMaskedLearning
