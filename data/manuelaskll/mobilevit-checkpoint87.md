# Manuelaskll/mobilevit-checkpoint87

## Resumen

Este repositorio contiene una implementación personalizada de **MobileViT** orientada a tareas de **retrieval** (recuperación de información), desarrollada por Manuelaskll. Se trata de un checkpoint de inicialización (`model.safetensors`) con 24.832 parámetros, pensado exclusivamente para pruebas de humo y verificación del flujo de entrenamiento, no como un modelo entrenado con capacidad real de inferencia. La configuración es "small", con atención dispersa, fusión de bajo rango, activación mish y normalización rmsnorm.

La relevancia de este proyecto es metodológica: ofrece un código transparente y reproducible para experimentar con arquitecturas ligeras tipo MobileViT en retrieval, pero el autor declara explícitamente que no se presentan resultados de benchmarks y que el checkpoint no ha sido entrenado ni auditado. Por tanto, cualquier uso en producción sería prematuro. La licencia Apache 2.0 permite su uso y modificación, pero con las limitaciones propias de un artefacto experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileViT (configuración small, atención sparse, fusión low rank, activación mish, normalización rmsnorm) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MobileViT es una arquitectura ligera que combina bloques convolucionales (tipo MobileNetV2) con bloques transformer para obtener representaciones globales sin el coste computacional de los ViT estándar. En esta implementación concreta, la configuración "small" utiliza atención dispersa y fusión de bajo rango, con activación mish y normalización rmsnorm. El autor indica que el código incluye un punto de entrada de entrenamiento y un ejemplo de prueba, pero no se detalla el dataset ni el número de tokens utilizados.

El checkpoint incluido es una inicialización válida para pruebas de humo, no un modelo entrenado. No se ha realizado ningún paso de entrenamiento, por lo que no hay información sobre datos de entrenamiento, RLHF, DPO u otras técnicas. El autor recomienda, para una evaluación significativa, entrenar el modelo con un dataset como Flickr30k y comparar con una línea base de capacidad equivalente, reportando la métrica de la tarea en al menos tres semillas.

## Capacidades

- **Generación de representaciones para retrieval**: el modelo está diseñado para producir embeddings de imágenes o texto (según la tarea) que permitan recuperar elementos relevantes, aunque al no estar entrenado, esta capacidad es solo teórica.
- **Arquitectura ligera**: al tener solo 24.832 parámetros, es adecuado para entornos con recursos muy limitados, como dispositivos móviles o edge computing.
- **Código reproducible**: el repositorio incluye `main.py`, `config.json` y `training_args.json`, lo que facilita la reproducción de experimentos y la modificación de la configuración.
- **Soporte de entrenamiento**: incluye un script de entrenamiento con RMSprop y programación de pasos, aunque no se ha ejecutado.
- **Sin capacidades multimodales avanzadas**: no se menciona soporte para tool calling, agentes, ni razonamiento multi-paso. Es un modelo de visión/retrieval puro.

## Casos de uso

- **Investigación en arquitecturas ligeras**: sirve como punto de partida para estudiar cómo MobileViT se comporta en tareas de retrieval con recursos mínimos. Se puede entrenar con datasets como Flickr30k y comparar con otras configuraciones.
- **Pruebas de integración en pipelines de ML**: al ser un checkpoint de inicialización, es útil para verificar que el código de entrenamiento, la carga de datos y el guardado de checkpoints funcionan correctamente antes de lanzar un entrenamiento completo.
- **Educación y aprendizaje**: el código es transparente y bien documentado, ideal para entender cómo se implementa una arquitectura MobileViT desde cero y cómo se configura un experimento de retrieval.
- **Prototipado rápido en entornos embebidos**: aunque no está entrenado, la arquitectura ligera podría adaptarse para tareas de búsqueda de imágenes en dispositivos móviles, siempre que se entrene adecuadamente.
- **Evaluación de configuraciones de atención dispersa**: permite experimentar con atención sparse y fusión de bajo rango en un contexto de retrieval, comparando con variantes densas.
- **Generación de embeddings para bases de datos vectoriales**: una vez entrenado, podría usarse para indexar imágenes o textos en motores de búsqueda vectorial, pero esto requiere un entrenamiento previo que no se ha realizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que "ninguna puntuación de benchmark se reivindica en este repositorio" y que el checkpoint no está entrenado. Por tanto, no hay datos de MMLU, HumanEval, GSM8K ni ninguna métrica de retrieval (como Recall@K) que reportar.

## Requisitos de hardware

- **VRAM estimada**: al tener solo 24.832 parámetros, la inferencia y el entrenamiento caben en cualquier GPU moderna, incluso en CPUs. No se requiere VRAM dedicada significativa.
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM sería suficiente; incluso una Raspberry Pi podría ejecutar el modelo, aunque no se ha probado.
- **Compatibilidad con consumer GPU**: sí, cualquier GPU de consumo (GTX 1050, RTX 2060, etc.) es más que suficiente.
- **Opciones de despliegue**: al ser una implementación personalizada, no se puede cargar directamente con APIs genéricas como `transformers` o `vLLM`; se necesita un adaptador explícito. Se puede ejecutar con el script `main.py` incluido.
- **Latencia y throughput**: no se dispone de datos medidos. Dado el tamaño mínimo, se espera una latencia de milisegundos en CPU, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de retrieval basados en MobileViT, ya que este checkpoint no está entrenado y no hay resultados publicados. Como referencia arquitectónica, el MobileViT original de Apple (qualcomm/Mobile-VIT) tiene configuraciones que van desde 1.3M hasta 5.6M de parámetros, pero no es comparable en rendimiento porque este repositorio es una implementación experimental sin entrenar. Otras alternativas como CLIP o DINOv2 son modelos mucho más grandes y entrenados, por lo que no son comparables en esta fase.

## Limitaciones y advertencias

- **Checkpoint no entrenado**: el modelo no ha sido entrenado, por lo que no produce resultados útiles para retrieval real. Cualquier salida será aleatoria o basada en la inicialización.
- **Sin auditoría de robustez**: el autor indica que el checkpoint no ha sido auditado para robustez, equidad ni transferencia de dominio.
- **Riesgo de alucinación**: al no estar entrenado, no hay riesgo de alucinación en el sentido de generación de texto, pero sí de producir embeddings sin significado semántico.
- **Limitaciones de idioma**: no se especifican idiomas soportados; al ser un modelo de visión, probablemente no dependa del idioma, pero no hay confirmación.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el autor advierte que se deben revisar los términos de los datos fuente si se usan datasets externos.
- **Caveat para producción**: no es apto para producción sin un entrenamiento completo y una evaluación rigurosa. El autor recomienda documentar los resultados de un checkpoint entrenado por separado de los valores por defecto.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/Manuelaskll/mobilevit-checkpoint87)
- [Documentación de MobileViT en Hugging Face Transformers](https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/mobilevit.md)
- [Implementación de MobileViT en MMPretrain](https://github.com/open-mmlab/mmpretrain/blob/main/configs/mobilevit/README.md)
- [Modelo Mobile-VIT de Qualcomm en Hugging Face](https://huggingface.co/qualcomm/Mobile-VIT/blob/main/README.md)
