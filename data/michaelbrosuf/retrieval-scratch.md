# michaelbrosuf/retrieval-scratch

# Ficha técnica: retrieval-scratch

## Resumen

retrieval-scratch es una implementación experimental de un Masked Autoencoder (MAE) orientado a tareas de recuperación, publicada por el usuario michaelbrosuf en HuggingFace. El repositorio incluye el código fuente (`run.py`), una configuración de arquitectura (`config.json`) y un checkpoint de inicialización (`model.safetensors`) con 33.088 parámetros. A pesar de que la configuración se denomina "giant", el tamaño real es minúsculo, lo que indica que se trata de un punto de partida para pruebas de humo y experimentación, no de un modelo entrenado.

La arquitectura utiliza atención sparse, fusión tucker, activación ReLU y normalización GroupNorm. El autor declara explícitamente que el checkpoint no ha sido entrenado ni evaluado, y que no se reivindica ningún resultado de benchmark. Por tanto, el modelo no debe usarse en producción ni como base para aplicaciones reales sin un entrenamiento y una evaluación previos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MAE (Masked Autoencoder) |
| Parametros totales | 33.088 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura implementada es un Masked Autoencoder con escala "giant" según la configuración del autor, aunque el número real de parámetros es de 33.088, lo que contradice la nomenclatura habitual de escala. El modelo emplea atención sparse, un mecanismo de fusión tucker, activación ReLU y normalización GroupNorm. Al tratarse de una implementación personalizada, no es compatible con las APIs de carga automática estándar y requiere un adaptador explícito.

No se han publicado datos de entrenamiento, ni composición de dataset, ni número de tokens, ni procesos de RLHF o DPO. El README indica que el checkpoint incluido es de inicialización y que los valores de `training_args.json` (optimizador adafactor y programación de warmup constante) son una receta por defecto, no evidencia de una ejecución completada. El autor recomienda, para una futura evaluación, entrenar con el mismo conjunto de datos y presupuesto de ajuste que las líneas base, y reportar resultados sobre al menos tres semillas.

## Capacidades

- Generación de texto, razonamiento, código, matemáticas o visión: no disponible. El modelo no ha sido entrenado, por lo que no se han verificado capacidades funcionales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio, etc.): no disponible. La arquitectura MAE está diseñada para aprendizaje auto-supervisado de representaciones visuales, pero el checkpoint actual no contiene pesos entrenados.

## Casos de uso

Dado que el modelo es un checkpoint de inicialización sin entrenar, no existen casos de uso prácticos en producción. Los siguientes usos se limitan al ámbito de la investigación y el desarrollo de software:

- Pruebas de humo de la implementación: el script `run.py` permite validar que la arquitectura, la configuración y el checkpoint se cargan correctamente, sirviendo como test de integración en un pipeline de desarrollo.
- Depuración de código: al ser una implementación personalizada, el modelo es útil para depurar funciones de atención sparse, fusión tucker y normalización GroupNorm en un entorno controlado.
- Experimentación con datos sintéticos: se pueden generar tensores aleatorios y ejecutar el forward pass para comprobar que las dimensiones y los flujos de datos son coherentes.
- Comparación de arquitecturas: por su tamaño mínimo, permite comparar rápidamente variantes de configuración (por ejemplo, cambios en la atención o en la normalización) sin necesidad de hardware potente.
- Validación de carga de safetensors: el checkpoint sirve para verificar que el formato de pesos se lee correctamente y que los tensores tienen los nombres esperados.
- Punto de partida para investigación: aunque no está entrenado, puede usarse como semilla para estudiar el comportamiento de la arquitectura MAE en tareas de recuperación, siempre que se entrene posteriormente con un dataset adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que no se reivindica ningún resultado de benchmark y que el checkpoint no está entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,13 MB en FP32 (33.088 parámetros × 4 bytes) y 0,07 MB en FP16. El modelo cabe en cualquier GPU, incluso en las más básicas, y también puede ejecutarse en CPU.
- GPU recomendadas: no se requiere una GPU específica; cualquier GPU de consumo (por ejemplo, NVIDIA GTX 1650, RTX 3050) es más que suficiente.
- Compatibilidad con GPU de consumo: sí, cualquier GPU con al menos 1 GB de VRAM puede ejecutarlo sin problemas.
- Opciones de despliegue: no compatible con vLLM, llama.cpp, Ollama o TGI sin un adaptador explícito, al tratarse de una implementación personalizada. La vía de ejecución es el script `run.py` incluido en el repositorio.
- Latencia y throughput estimados: no disponibles, al no haberse realizado mediciones sobre un modelo entrenado.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables publicados con un tamaño de 33.088 parámetros y una arquitectura MAE orientada a recuperación. Los modelos MAE convencionales (por ejemplo, ViT-Base MAE) tienen decenas de millones de parámetros y han sido preentrenados, por lo que no son comparables con este checkpoint de inicialización.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado, por lo que no ofrece ninguna capacidad funcional ni rendimiento medible.
- El modelo no ha sido auditado en cuanto a robustez, imparcialidad o transferencia de dominio, tal como indica el propio autor.
- No se han publicado datos de sesgos conocidos ni análisis de alucinación, ya que no hay pesos entrenados que analizar.
- La implementación es personalizada y no es compatible con las APIs de carga automática de HuggingFace, lo que dificulta su uso directo.
- La licencia Apache-2.0 permite uso comercial y modificación, pero el modelo, en su estado actual, no es apto para ningún uso en producción.
- Cualquier resultado futuro de un checkpoint entrenado deberá documentarse por separado de los valores por defecto incluidos en el repositorio, tal como advierte el autor.

## Enlaces

- HuggingFace: https://huggingface.co/michaelbrosuf/retrieval-scratch
