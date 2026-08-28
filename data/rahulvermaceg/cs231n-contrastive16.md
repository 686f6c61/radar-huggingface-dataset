# rahulvermaceg/cs231n-contrastive16

## Resumen

Este repositorio contiene una implementación funcional de **Efficientformer** orientada al aprendizaje contrastivo, con configuración *giant*. El autor, rahulvermaceg, publica un checkpoint de inicialización (`model.safetensors`) que no ha sido entrenado ni evaluado, y que sirve exclusivamente como punto de partida para pruebas de humo y experimentación. El proyecto se enmarca en el contexto del curso CS231n de Stanford sobre visión por computador y aprendizaje profundo, aunque no está afiliado oficialmente a la universidad.

La relevancia actual radica en que ofrece un código transparente y reproducible de una arquitectura eficiente (Efficientformer) aplicada a tareas contrastivas, con una configuración *giant* que, pese a su nombre, cuenta con solo 33.088 parámetros. Esto lo convierte en un banco de pruebas ideal para estudiar el comportamiento de la atención por grupos (grouped query attention), la fusión tensorial y la normalización ScaleNorm en entornos de baja capacidad.

No se trata de un modelo de lenguaje ni de un sistema de visión preentrenado para producción. Es un artefacto de investigación cuyo valor principal reside en su código y en la documentación de una receta experimental, no en resultados de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Efficientformer (configuracion giant) |
| Parametros totales | 33.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin soporte linguistico) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en **Efficientformer**, una variante eficiente del transformer diseñada para visión. Según la model card, la configuración *giant* emplea atención por grupos (*grouped query attention*), fusión tensorial (*tensor fusion*), activación GELU con aproximación tanh y normalización ScaleNorm. Estas elecciones buscan reducir el coste computacional manteniendo la expresividad, típico de los modelos Efficientformer.

El checkpoint incluido es un **checkpoint de inicialización**, no un modelo entrenado. La model card indica explícitamente que no se presentan como un checkpoint entrenado con resultados de benchmarks. No se proporciona información sobre el dataset de entrenamiento, el número de tokens o pasos, ni sobre técnicas de alineación como RLHF o DPO. El repositorio incluye un `training_args.json` con la receta por defecto (optimizador Lion con schedule exponencial), pero se aclara que son valores iniciales del script, no evidencia de un entrenamiento completado.

## Capacidades

- **Representaciones visuales contrastivas**: el modelo está diseñado para aprendizaje contrastivo, por lo que puede aprender embeddings de imágenes que agrupan muestras similares y separan las distintas.
- **Arquitectura eficiente**: al ser Efficientformer, ofrece una alternativa ligera a transformers visuales estándar, adecuada para entornos con recursos limitados.
- **Código reproducible**: el repositorio incluye `predict.py` con un ejemplo ejecutable de smoke test, lo que facilita la verificación de la implementación.
- **Sin capacidades de lenguaje**: no genera texto, no soporta tool calling, ni agentes, ni razonamiento multilingüe.
- **Sin modo de pensamiento ni visión multimodal**: se limita a la extracción de características visuales; no hay soporte para audio ni otras modalidades.

## Casos de uso

- **Investigación académica en visión por computador**: sirve como base para estudiar el comportamiento de Efficientformer en tareas contrastivas, comparando configuraciones y técnicas de regularización.
- **Validación de implementaciones**: al ser un checkpoint de inicialización válido, permite probar pipelines de entrenamiento y verificar que el código funciona antes de escalar a modelos mayores.
- **Enseñanza y aprendizaje**: estudiantes de cursos como CS231n pueden usar este repositorio para entender cómo se construye un modelo contrastivo desde cero, con atención por grupos y normalización ScaleNorm.
- **Pruebas de integración en CI/CD**: al ser ligero (33k parámetros), puede integrarse en pipelines de integración continua para comprobar que el entorno de ejecución y las dependencias funcionan correctamente.
- **Benchmarking de hardware**: su pequeño tamaño permite medir la latencia y el throughput de inferencia en diferentes GPUs o CPUs sin necesidad de modelos grandes.
- **Experimentos de aprendizaje auto-supervisado**: se puede entrenar con datasets pequeños (p. ej., CIFAR-10) para explorar el impacto de distintas funciones de pérdida contrastivas (InfoNCE, NT-Xent, etc.) en la calidad de las representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se presenta ningún checkpoint entrenado ni se reclama ningún resultado de rendimiento. Por tanto, no es posible comparar numéricamente este modelo con otros.

## Requisitos de hardware

- **VRAM estimada**: al tener solo 33.088 parámetros, la inferencia requiere menos de 1 GB de VRAM, incluso en FP32. Cabe en cualquier GPU moderna, incluidas tarjetas de gama baja como GTX 1650 o integradas.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente. Para entrenamiento con datasets pequeños, una RTX 3060 o superior es más que adecuada.
- **Compatibilidad con consumer GPU**: sí, es perfectamente ejecutable en GPUs de consumo, incluso en CPU para inferencia simple.
- **Opciones de despliegue**: al ser un modelo de visión con pesos en safetensors, se puede cargar con PyTorch estándar. No está optimizado para vLLM, llama.cpp u Ollama, que son específicos para modelos de lenguaje. Para despliegue en producción, se podría exportar a ONNX o TensorRT, pero no se proporcionan herramientas en el repositorio.
- **Latencia y throughput**: no se dispone de mediciones oficiales. Dado el tamaño, la inferencia en una GPU moderna debería ser del orden de microsegundos por imagen.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El checkpoint no está entrenado, por lo que cualquier comparación de rendimiento carecería de sentido. Como referencia arquitectónica, Efficientformer se ha comparado en la literatura con ViT y DeiT, pero este repositorio no proporciona esos datos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- **Checkpoint sin entrenar**: los pesos incluidos son de inicialización, no han sido entrenados ni auditados para robustez, equidad o transferencia de dominio.
- **Alto riesgo de alucinación**: al no estar entrenado, las salidas del modelo (si se usa como clasificador o extractor de características) serán esencialmente aleatorias o sin significado semántico.
- **Sin soporte de producción**: no está diseñado para uso en entornos productivos; es un artefacto experimental.
- **Licencia BSD-3-Clause**: permite uso comercial y modificación, pero el autor advierte que se deben revisar los términos de los datos externos si se usa con otros datasets.
- **Falta de documentación de entrenamiento**: no hay información sobre el dataset, la duración del entrenamiento ni las métricas de evaluación, lo que impide reproducir cualquier resultado futuro sin un trabajo adicional significativo.
- **Dependencia de un adaptador**: la model card indica que las API de carga automática genéricas requieren un adaptador explícito debido a que es una implementación personalizada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rahulvermaceg/cs231n-contrastive16
- Curso CS231n de Stanford (página oficial): https://cs231n.stanford.edu/
- Notas del curso CS231n (github.io): https://cs231n.github.io/
- Notas de clase CS231n 2025 (PDF): https://raimbekovm.github.io/cs231n-2025-notes/CS231n-2025-Lecture-Notes.pdf
- Informes de proyectos CS231n 2025: https://cs231n.stanford.edu/2025/reports.html
- Lista de reproducción de vídeos CS231n 2025 (YouTube): https://www.youtube.com/playlist?list=PLoROMvodv4rOmsNzYBMe0gJY2XS8AQg16
