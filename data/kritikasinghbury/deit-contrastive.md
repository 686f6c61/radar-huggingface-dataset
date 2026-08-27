# kritikasinghbury/deit-contrastive

## Resumen

Este repositorio contiene una implementación compacta y personalizada de **DeiT** (Data-efficient Image Transformers) orientada al aprendizaje contrastivo, publicada por la investigadora Kritika Singh bajo el nombre de usuario `kritikasinghbury`. Se trata de un artefacto de código experimental, no de un modelo preentrenado listo para producción: el checkpoint incluido (`model.safetensors`) es una inicialización válida para pruebas de humo y revisión de código, no un modelo entrenado con métricas de rendimiento.

La configuración base emplea atención lineal, fusión de tipo Tucker, activación GELU y normalización ScaleNorm, con un total de 33.088 parámetros. Su relevancia actual reside en servir como punto de partida para experimentos controlados de aprendizaje contrastivo en visión por computador, especialmente para validar implementaciones personalizadas de arquitecturas DeiT con mecanismos de atención eficientes. No se reclama ningún resultado de benchmark en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeiT (base) con atención lineal, fusión Tucker, activación GELU, normalización ScaleNorm |
| Parametros totales | 33.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en DeiT, un transformer de visión que introduce técnicas de destilación para entrenar con menos datos. En esta implementación personalizada se sustituye la atención estándar por **atención lineal**, lo que reduce la complejidad computacional de O(n²) a O(n) en la secuencia de parches de imagen. La **fusión Tucker** se utiliza para combinar representaciones multimodales o de múltiples ramas, y la **normalización ScaleNorm** reemplaza a LayerNorm con una operación más ligera. La activación GELU es la habitual en transformers.

No se proporciona información sobre el conjunto de datos de entrenamiento, el número de tokens o el proceso de optimización. El repositorio incluye un `training_args.json` con una receta por defecto (SGD con programación exponencial), pero se indica explícitamente que son valores iniciales del script, no evidencia de un entrenamiento completado. No se menciona ningún proceso de RLHF, DPO o ajuste fino supervisado.

## Capacidades

- Extracción de características de imágenes mediante aprendizaje contrastivo (aprendizaje de representaciones donde muestras similares se acercan y las distintas se separan).
- Clasificación de imágenes a pequeña escala, si se entrena con un conjunto de datos etiquetado.
- Búsqueda de similitud entre imágenes (recuperación por contenido visual).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- No es un modelo multimodal: solo procesa imágenes, no texto ni audio.
- Capacidad multilingüe: no aplica, al ser un modelo de visión.

## Casos de uso

- **Pruebas de humo en pipelines de entrenamiento**: el checkpoint de inicialización permite verificar que el flujo de datos, la pérdida contrastiva y el optimizador funcionan correctamente antes de lanzar entrenamientos costosos.
- **Revisión de código de implementaciones personalizadas de DeiT**: al ser un artefacto mínimo y autocontenido, facilita la auditoría de la arquitectura, la atención lineal y la fusión Tucker en un entorno controlado.
- **Experimentos controlados de aprendizaje contrastivo**: con solo 33.088 parámetros, se pueden ejecutar comparaciones rápidas de distintas configuraciones (p. ej., variar la fusión o la normalización) en conjuntos de datos pequeños como CIFAR-10 o parches de ImageNet.
- **Validación de integración con frameworks**: sirve para comprobar que el modelo carga correctamente con `safetensors` y que el adaptador personalizado funciona con APIs de Hugging Face o PyTorch.
- **Educación e investigación**: útil para estudiar cómo afecta la atención lineal al rendimiento de DeiT en tareas de representación visual, o para explorar variantes de normalización y fusión.
- **Investigación en seguridad de IA**: el autor trabaja en este ámbito; el modelo puede emplearse como banco de pruebas para estudiar sesgos o robustez en representaciones visuales, aunque requiere entrenamiento previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio indica explícitamente que el checkpoint no está entrenado y que no se reclama ninguna puntuación. Cualquier evaluación futura debe realizarse con un conjunto de validación específico de la tarea, al menos tres semillas y una línea base de capacidad comparable.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB. Con 33.088 parámetros, el modelo cabe en cualquier GPU moderna e incluso en CPU.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 2060, o integradas). No requiere hardware especializado.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU de consumo actual es suficiente.
- **Opciones de despliegue**: al ser un modelo de visión experimental, no está pensado para servidores de inferencia como vLLM u Ollama. Se puede ejecutar directamente con PyTorch o mediante un adaptador personalizado en Hugging Face.
- **Latencia y throughput**: no disponibles. Dado el tamaño, la inferencia es prácticamente instantánea en cualquier hardware, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No hay modelos comparables directos porque este checkpoint no está entrenado y no tiene métricas de rendimiento. A modo de referencia estructural:

| Modelo | Parámetros | Arquitectura | Entrenamiento | Licencia |
|---|---|---|---|---|
| `deit-contrastive` (este) | 33.088 | DeiT base con atención lineal | No entrenado (inicialización) | BSD-3-Clause |
| DeiT base original (Facebook) | 86M | DeiT con atención estándar | Preentrenado en ImageNet | Apache 2.0 |
| MoCo v3 base (Facebook) | 86M | ViT con aprendizaje contrastivo | Preentrenado en ImageNet | Apache 2.0 |

La comparación es estructural, no de rendimiento, ya que este modelo no tiene resultados publicados.

## Limitaciones y advertencias

- **No entrenado**: el checkpoint es una inicialización aleatoria; no produce representaciones útiles sin entrenamiento previo.
- **Sin auditoría de robustez o sesgos**: el autor advierte que no se ha evaluado la equidad, la transferencia de dominio ni la robustez.
- **Alcance limitado**: pensado para pruebas de humo y experimentos pequeños, no para uso en producción.
- **Riesgo de alucinación**: no aplica, al ser un modelo de visión sin generación de texto.
- **Restricciones de licencia**: BSD-3-Clause permite uso comercial con atribución, pero se debe revisar la licencia de los datos externos si se entrena con conjuntos de datos propios.
- **Dependencia de adaptador**: la carga automática con APIs genéricas requiere un adaptador explícito, lo que puede complicar la integración en flujos estándar.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/kritikasinghbury/deit-contrastive)
- [Perfil del autor en Hugging Face](https://huggingface.co/kritikasinghbury)
- [Modelo relacionado: MoCo v3 base del mismo autor](https://huggingface.co/kritikasinghbury/model_721644311_mocov3_base)
- [Artículo sobre aprendizaje contrastivo estilístico (OpenReview)](https://openreview.net/pdf?id=0fo0d9Tbey)
- [Integración de DeiT con aprendizaje contrastivo (Springer)](https://link.springer.com/article/10.1007/s42044-025-00281-5)
