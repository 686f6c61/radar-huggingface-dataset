# RainyBot/SemWAM-LIBERO-v1

## Resumen

SemWAM-LIBERO-v1 es un checkpoint final de un modelo de robótica orientado a control de manipuladores, publicado por el usuario RainyBot en Hugging Face bajo el pipeline `robotics`. Se trata del resultado de una continuación de entrenamiento de 30 épocas sobre el conjunto de tareas LIBERO, un benchmark habitual para evaluar políticas de imitación y aprendizaje por refuerzo en entornos de manipulación robótica. El modelo no es un LLM ni un modelo de lenguaje multimodal de propósito general: su salida combina acciones continuas con predicciones de RGB, profundidad y "futuros semánticos" continuos, lo que lo sitúa en la familia de modelos de mundo (world models) para robótica.

La relevancia del checkpoint es limitada por su estado de madurez: el autor indica explícitamente que no se ha evaluado en un benchmark de bucle cerrado completo y que la finalización del entrenamiento no garantiza rendimiento. Además, el repositorio no incluye información sobre arquitectura, número de parámetros, licencia ni idiomas. El tamaño del repositorio (14,6 GB) sugiere un modelo de tamaño medio-grande con pesos en formato PyTorch (`.pt`), probablemente con codificadores congelados y un compresor semántico embebido.

El checkpoint se publica con un contrato de inferencia guardado (`inference_config.json`), estadísticas de normalización (`dataset_stats.json`) y un manifiesto de checksums (`checkpoint_manifest.json`). Esto implica que para reproducir la inferencia es necesario restaurar dicho contrato y utilizar los activos externos congelados identificados por checksum, no solo cargar los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mundo para robótica; predice RGB, profundidad, futuros semánticos y acciones) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en PyTorch `.pt`; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pt`), checkpoint `checkpoints/weights/step_031740.pt` |
| Tamaño del repositorio | 14,6 GB |
| Paso de optimizador | 31.740 |
| Épocas completadas | 30 |
| Estado | checkpoint final |
| Formato de checkpoint | v2 |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna más allá de lo que describe la model card: el modelo predice conjuntamente RGB, profundidad y futuros semánticos continuos junto con acciones. Esto es coherente con un modelo de mundo condicionado por observaciones y acciones, probablemente con un codificador visual congelado (cuyos checksums se conservan en el manifiesto) y un compresor semántico embebido en el checkpoint. No se especifica si el backbone es un transformer, un modelo híbrido o una arquitectura específica para robótica.

El entrenamiento corresponde a una continuación de 30 épocas sobre LIBERO, con un total de 31.740 pasos de optimizador. No se publican el número de tokens, la composición del dataset, ni si hubo RLHF, DPO o aprendizaje por imitación supervisado. El autor indica que las identidades de los datos de entrenamiento, las rutas privadas y la procedencia de la inicialización se han omitido deliberadamente, y que no se incluyen el estado del optimizador ni el estado del generador de números aleatorios. Sí se conservan la arquitectura de inferencia, los checksums de los codificadores congelados y las estadísticas numéricas.

## Capacidades

- Predicción de acciones continuas para control de robots manipuladores en tareas tipo LIBERO.
- Predicción conjunta de RGB (futuros visuales), profundidad y futuros semánticos continuos.
- Compresor semántico embebido en el checkpoint, lo que permite generar representaciones semánticas sin un modelo externo adicional.
- Restauración de un contrato de inferencia guardado (`inference_config.json`) para reproducir el pipeline exacto de inferencia.
- Uso de estadísticas de normalización de acciones y estados (`dataset_stats.json`) para alinear las entradas y salidas con el entrenamiento.
- Verificación de integridad mediante checksums (`checkpoint_manifest.json`) de pesos y activos externos congelados.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo, visión general, audio ni modo "thinking".

## Casos de uso

- Investigación en modelos de mundo para robótica: el modelo permite estudiar la predicción conjunta de observaciones futuras (RGB, profundidad) y acciones en entornos LIBERO, útil para analizar cómo representaciones semánticas continuas mejoran la planificación.
- Reproducción de experimentos de imitación en LIBERO: al incluir el contrato de inferencia y las estadísticas de normalización, un laboratorio puede restaurar el pipeline exacto y comparar resultados con sus propias políticas.
- Generación de rollouts sintéticos para aumento de datos: las predicciones de RGB y profundidad pueden emplearse para simular trayectorias adicionales en tareas de manipulación, siempre que se validen contra el simulador.
- Estudio de representaciones semánticas en control: el compresor semántico embebido permite analizar si los "futuros semánticos" capturan información útil para la selección de acciones en tareas de largo horizonte.
- Baseline para comparación de políticas en LIBERO: sirve como punto de partida para medir mejoras de nuevas arquitecturas, aunque el propio autor advierte de que no hay evaluación de bucle cerrado.
- Análisis de robustez de modelos de mundo: al predecir profundidad y RGB de forma conjunta, se puede evaluar la coherencia física de las predicciones en escenarios de contacto y oclusión.
- Docencia y formación en robótica basada en aprendizaje: el checkpoint, con su manifiesto de checksums y estadísticas, es un ejemplo didáctico de empaquetado reproducible de un modelo de mundo para robótica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el checkpoint final no se ha evaluado todavía en un benchmark de bucle cerrado completo y que la finalización del entrenamiento no establece rendimiento de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (14,6 GB) incluye pesos y activos auxiliares; los pesos en `.pt` probablemente ocupan varios GB, pero no se especifica el desglose.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint, es razonable esperar que requiera una GPU con al menos 16-24 GB de VRAM para cargar los pesos en precisión completa, pero es una estimación no confirmada por el autor.
- ¿Cabe en GPU de consumo? No confirmado. Un checkpoint de este tamaño podría caber en GPUs de consumo con 24 GB (por ejemplo, RTX 3090 o RTX 4090) si se carga en FP16 y se gestionan los activos externos por separado, pero no hay datos publicados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Al ser un modelo de robótica en PyTorch, el despliegue esperado es mediante código Python propio que restaure el contrato de inferencia y cargue los pesos con `torch.load`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (modelos de mundo para LIBERO) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se ha evaluado en un benchmark de bucle cerrado completo; el autor advierte que la finalización del entrenamiento no garantiza rendimiento.
- No se publica licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso en producción.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado en LIBERO, su comportamiento está limitado a las tareas y distribuciones de ese benchmark.
- Riesgo de alucinación en las predicciones de RGB, profundidad y futuros semánticos: al ser un modelo de mundo, puede generar observaciones plausibles pero físicamente incorrectas, especialmente fuera de la distribución de entrenamiento.
- El checkpoint requiere restaurar el contrato de inferencia y usar las estadísticas de normalización y los activos externos con checksum; cargar solo los pesos puede producir resultados incorrectos.
- No se incluyen el estado del optimizador ni el estado del RNG, por lo que no es posible reanudar el entrenamiento exactamente desde este punto.
- Las identidades de los datos de entrenamiento y la procedencia de la inicialización se han omitido, lo que dificulta la auditoría del modelo.
- No hay información sobre idiomas ni sobre capacidades de lenguaje natural; no debe tratarse como un modelo de propósito general.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/RainyBot/SemWAM-LIBERO-v1
