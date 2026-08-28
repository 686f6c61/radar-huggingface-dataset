# itsukitakahashi/classification-warmup

## Resumen

El repositorio `itsukitakahashi/classification-warmup` contiene una implementación compacta y personalizada de **DeiT** (Data-efficient Image Transformers) para clasificación de imágenes, desarrollada por Itsuki Takahashi, data scientist de profesión. El modelo está pensado como un punto de partida experimental para revisión de código, pruebas de humo y experimentos controlados a pequeña escala, no como un modelo preentrenado listo para producción.

El checkpoint incluido (`model.safetensors`) es una inicialización válida de pesos, no un modelo entrenado. La arquitectura base es DeiT con modificaciones: atención multi-query, fusión por co-atención, activación mish y normalización rmsnorm. Con solo 49.600 parámetros, es un modelo extremadamente pequeño, diseñado para verificar que el pipeline de entrenamiento funciona, no para obtener resultados competitivos.

La relevancia de este repositorio reside en su utilidad como plantilla de experimentación: permite validar configuraciones arquitectónicas y flujos de entrenamiento antes de escalar a modelos mayores. No se reivindica ningún resultado de benchmark en la documentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT (Vision Transformer) con atención multi-query, fusión co-attention, activación mish y normalización rmsnorm |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un DeiT en configuración "base" pero con un número de parámetros muy reducido (49.600), lo que indica una versión drásticamente miniaturizada. Las modificaciones principales respecto al DeiT original son:

- **Atención multi-query**: comparte las cabezas de clave y valor entre varias cabezas de consulta, reduciendo el coste computacional y el número de parámetros.
- **Fusión co-attention**: mecanismo de atención cruzada entre diferentes ramas o características, típico en tareas de clasificación con múltiples entradas o modalidades.
- **Activación mish**: función de activación suave, similar a SiLU, que a menudo mejora el flujo de gradientes.
- **Normalización rmsnorm**: normalización por raíz cuadrada de la media de los cuadrados, más ligera que LayerNorm.

El repositorio incluye un `train.py` con un ejemplo ejecutable y una receta de entrenamiento por defecto que usa **rmsprop** con un programador de tasa de aprendizaje polinomial. Sin embargo, estos valores son solo puntos de partida en el script, no evidencias de una ejecución completada. No se proporcionan datos sobre el dataset de entrenamiento, número de tokens o pasos, ni se menciona el uso de RLHF, DPO u otras técnicas de alineación. El checkpoint es una inicialización aleatoria, no un modelo entrenado.

## Capacidades

- **Clasificación de imágenes**: el modelo está diseñado para tareas de clasificación, aunque al no estar entrenado, no tiene capacidad real de clasificar nada sin un entrenamiento previo.
- **Experimentos de arquitectura**: permite probar variantes de DeiT con atención multi-query, co-attention, mish y rmsnorm en un entorno mínimo.
- **Pruebas de humo**: sirve para verificar que el código de entrenamiento y el pipeline de datos funcionan correctamente antes de lanzar entrenamientos costosos.
- **Revisión de código**: el repositorio está pensado para que otros desarrolladores inspeccionen la implementación y entiendan el diseño.
- **Sin soporte de tool calling ni agentes**: no es un modelo de lenguaje ni multimodal; no aplica function calling, razonamiento multi-paso ni generación de texto.

## Casos de uso

- **Validación de pipelines de entrenamiento**: antes de entrenar un DeiT grande, se puede usar este checkpoint para verificar que el bucle de entrenamiento, la carga de datos y la evaluación funcionan sin errores. Su pequeño tamaño permite iterar rápidamente.
- **Pruebas de integración en CI/CD**: en un repositorio de código, este modelo puede servir como fixture para tests automáticos que comprueben que el entorno de entrenamiento (PyTorch, GPU, etc.) está correctamente configurado.
- **Educación y aprendizaje**: estudiantes de visión por computador pueden estudiar una implementación minimalista de DeiT y sus modificaciones (multi-query, co-attention, mish, rmsnorm) sin la complejidad de los modelos completos.
- **Depuración de configuraciones**: al ser un checkpoint de inicialización, es útil para comprobar que los hiperparámetros (tasa de aprendizaje, programador polinomial, optimizador rmsprop) se aplican correctamente.
- **Benchmark de rendimiento de hardware**: al ser tan pequeño, puede usarse para medir el throughput de inferencia en diferentes GPUs o CPUs sin necesidad de descargar modelos grandes.
- **Base para experimentos de few-shot**: aunque no está entrenado, se podría usar como punto de partida para un entrenamiento rápido en un dataset pequeño, siempre que se documente por separado de los resultados del checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que "no se reivindica ningún resultado de benchmark en este repositorio" y que el checkpoint es solo una inicialización para pruebas de humo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: menos de 1 GB. Con 49.600 parámetros, el modelo cabe en cualquier GPU moderna, incluso en CPUs sin problema.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA GTX 1050, RTX 2060, etc.). También funciona en CPU.
- **Compatibilidad con consumer GPU**: sí, absolutamente. Cualquier GPU de consumo actual puede ejecutar este modelo.
- **Opciones de despliegue**: al ser una implementación personalizada de PyTorch, no es compatible directamente con vLLM, llama.cpp u Ollama. Se puede ejecutar con el script `train.py` o mediante un adaptador personalizado para cargar el safetensors. Para producción, requeriría un wrapper.
- **Latencia y throughput**: no se han medido, pero dado el tamaño, la inferencia es prácticamente instantánea (del orden de microsegundos en GPU).

## Comparativa con modelos similares

No se dispone de modelos comparables en la misma categoría. El DeiT original de Facebook (DeiT-Tiny, DeiT-Small, DeiT-Base) tiene entre 5 y 86 millones de parámetros y está preentrenado en ImageNet, mientras que este modelo tiene 49.600 parámetros y no está entrenado. No tiene sentido comparar rendimiento con modelos preentrenados reales. La comparativa con otros checkpoints de inicialización no está documentada.

## Limitaciones y advertencias

- **Checkpoint sin entrenar**: los pesos son una inicialización aleatoria. Cualquier salida del modelo es ruido y no debe interpretarse como una predicción significativa.
- **Sin robustez ni auditoría**: la model card advierte que el checkpoint no ha sido entrenado ni auditado para robustez, equidad o transferencia de dominio.
- **Riesgo de alucinación**: no aplica, al ser un modelo de visión sin generación de texto.
- **Sin soporte de carga genérica**: la implementación es personalizada, por lo que las APIs automáticas de HuggingFace no pueden cargar el modelo sin un adaptador explícito.
- **Restricciones de licencia**: la licencia MIT permite uso comercial, pero los términos de los datasets externos deben revisarse por separado si se usa con datos propios.
- **No apto para producción**: el autor lo declara explícitamente como un repositorio experimental para revisión de código y pruebas de humo, no como un release preentrenado.
- **Idiomas y contexto**: no aplica, es un modelo de visión sin capacidades lingüísticas.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/itsukitakahashi/classification-warmup)
- [Perfil del autor en HuggingFace](https://huggingface.co/itsukitakahashi/models)
- [Proyecto relacionado en GitHub (warm-up-01-classification)](https://github.com/AIVIETNAM-AIO-ChimCanhCut/warm-up-01-classification/blob/main/README.md)
