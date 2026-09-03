# mums-harma/efficientformer-retrieval-light

## Resumen

Este repositorio contiene una implementación de EfficientFormer orientada a tareas de retrieval, con una configuración de escala "nano". El autor, mums-harma, publica el código y un checkpoint de inicialización válido para pruebas de humo, pero no presenta ningún resultado de entrenamiento ni benchmarks. El objetivo declarado es ofrecer una implementación transparente y reproducible, con énfasis en la claridad del código y en la repetibilidad de las pruebas, en lugar de reclamar rendimiento.

El modelo emplea una arquitectura EfficientFormer con atención dilatada, fusión tipo Tucker, activación Swish y normalización por batch. El checkpoint incluido (`model.safetensors`) es únicamente una inicialización aleatoria, no un modelo entrenado, por lo que no es apto para uso práctico en producción. La relevancia de este proyecto es limitada: sirve como base experimental para quienes quieran explorar EfficientFormer en retrieval sin partir de cero, pero requiere un entrenamiento completo desde el inicio.

Con solo 33.088 parámetros, el tamaño es minúsculo, lo que lo hace adecuado para entornos con recursos muy limitados o para pruebas de concepto, pero no para tareas reales de retrieval sin un entrenamiento sustancial. La licencia BSD-3-Clause permite uso comercial con atribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientFormer (escala nano) |
| Parametros totales | 33.088 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors original) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en EfficientFormer, un diseño de transformer eficiente para visión, adaptado aquí para retrieval. La configuración "nano" reduce drásticamente el número de parámetros (33K). La atención es de tipo dilatada, la fusión de características usa descomposición Tucker, la activación es Swish y la normalización se realiza con batch norm. No se especifica el número de tokens de entrenamiento ni la composición del dataset, ya que el checkpoint incluido no ha sido entrenado. El autor indica que la configuración por defecto del experimento usa el optimizador Lion con un scheduler coseno, pero esto son valores iniciales del script, no evidencia de una ejecución completada.

No hay innovaciones técnicas destacables más allá de la combinación de estos elementos. El repositorio incluye un script de inferencia (`inference.py`) que sirve como punto de entrada y un `config.json` que registra la configuración de la arquitectura.

## Capacidades

- Generacion de texto: no aplicable (es un modelo de retrieval, no generativo)
- Razonamiento: no disponible (checkpoint sin entrenar)
- Codigo: no disponible
- Matematicas: no disponible
- Vision: el modelo está diseñado para retrieval, probablemente sobre imágenes o multimodal, pero sin entrenamiento no tiene capacidad funcional
- Soporte de tool calling: no
- Soporte de agentes: no
- Capacidades multilingues: no especificado
- Capacidades especiales: ninguna, es un checkpoint de inicializacion para pruebas de humo

## Casos de uso

Dado que el checkpoint no está entrenado, los casos de uso se limitan a investigación y desarrollo experimental:

- **Pruebas de humo y validación de pipeline**: el script `inference.py` permite verificar que el flujo de datos y la inferencia funcionan correctamente con el checkpoint de inicialización. Útil para depurar el entorno antes de entrenar.
- **Punto de partida para entrenamiento propio**: investigadores pueden tomar esta implementación y entrenarla desde cero sobre datasets de retrieval como Flickr30k (el propio autor sugiere esta evaluación). La arquitectura pequeña permite iterar rápido en hardware modesto.
- **Estudio de arquitecturas eficientes**: con solo 33K parámetros, sirve para analizar el comportamiento de EfficientFormer en régimen de baja capacidad, comparando con variantes más grandes.
- **Enseñanza y aprendizaje**: como ejemplo de implementación de un modelo de retrieval con atención dilatada y fusión Tucker, puede utilizarse en cursos de deep learning para ilustrar conceptos de eficiencia.
- **Desarrollo de adaptadores para carga personalizada**: el autor advierte que la carga automática requiere un adaptador explícito; este repositorio sirve para practicar la integración de modelos personalizados en Hugging Face.
- **Experimentos de ablación**: la configuración nano permite aislar el efecto de cada componente (atención, fusión, normalización) en el rendimiento final, una vez entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no es un modelo entrenado. La evaluación sugerida (Flickr30k con al menos tres semillas) queda pendiente de que el usuario entrene el modelo.

## Requisitos de hardware

- **VRAM estimada**: con 33.088 parámetros, el modelo ocupa aproximadamente 132 KB en FP32 (4 bytes por parámetro). Cabe en cualquier GPU, incluso en las más antiguas, y también en CPU.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM es suficiente; incluso una Raspberry Pi podría ejecutar la inferencia, aunque el entrenamiento requeriría algo más.
- **Compatibilidad con GPU de consumo**: sí, absolutamente todas las GPU de consumo son compatibles.
- **Opciones de despliegue**: al ser un checkpoint de inicialización, no tiene sentido desplegarlo en producción. Para experimentación, puede ejecutarse con PyTorch estándar. No se menciona soporte para vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: no disponibles, pero por el tamaño, la inferencia sería del orden de microsegundos en GPU.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. El repositorio de referencia de EfficientFormer (snap-research/EfficientFormer) ofrece variantes V2 con tamaños desde `s0` hasta `l`, pero son modelos de visión para clasificación, no para retrieval, y tienen millones de parámetros. Existe otro repositorio similar (`kunle-ogunleye/retrieval`) con configuración "huge", pero tampoco reporta benchmarks. Dado que este modelo no está entrenado, cualquier comparativa carecería de sentido.

## Limitaciones y advertencias

- **Checkpoint sin entrenar**: el archivo `model.safetensors` es una inicialización aleatoria; no tiene ninguna capacidad real de retrieval.
- **Sin auditoría de robustez ni sesgos**: el autor indica que no se ha auditado el modelo para robustez, equidad o transferencia de dominio.
- **Riesgo de alucinación**: no aplica al ser un modelo de retrieval no generativo, pero una vez entrenado podría producir resultados incorrectos si los datos de entrenamiento son deficientes.
- **Limitaciones de contexto**: no se especifica la longitud de contexto; al ser un modelo de retrieval, probablemente procesa imágenes o pares de texto-imagen, pero sin datos concretos.
- **Restricciones de licencia**: BSD-3-Clause permite uso comercial, pero el autor advierte que deben revisarse los términos de los datasets externos utilizados.
- **Carga personalizada**: no es compatible con las APIs genéricas de Hugging Face; requiere un adaptador explícito, lo que añade fricción para su uso.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/mums-harma/efficientformer-retrieval-light)
- [Repositorio de referencia EfficientFormer (Snap Research)](https://github.com/snap-research/EfficientFormer)
- [Repositorio similar con configuración "huge" (kunle-ogunleye)](https://huggingface.co/kunle-ogunleye/retrieval)
