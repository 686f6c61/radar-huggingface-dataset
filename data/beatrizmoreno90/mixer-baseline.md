# beatrizmoreno90/mixer-baseline

## Resumen

`beatrizmoreno90/mixer-baseline` es un repositorio de Hugging Face publicado por el usuario beatrizmoreno90 que contiene una implementación propia de una arquitectura tipo Mixer orientada a tareas de matching. No se trata de un modelo entrenado ni publicado como release, sino de un punto de partida reproducible: incluye el código del modelo, una configuración de arquitectura explícita y un checkpoint de inicialización válido para pruebas de humo. La model card es explícita al respecto: no se reclama ninguna puntuación de benchmark y el checkpoint no ha sido entrenado ni auditado.

El modelo se distribuye en formato safetensors con un recuento de parámetros de 24.832, lo que lo sitúa en la categoría de modelo minúsculo, apto únicamente para validación de pipelines y pruebas de integración, no para inferencia en producción. La arquitectura declarada combina atención dispersa (sparse attention) con fusión con compuertas (gated fusion), activación approx gelu y normalización por batchnorm, dentro de la familia de modelos Mixer.

Su relevancia es limitada y de carácter experimental: sirve como esqueleto para reproducir experimentos de matching con una receta de entrenamiento definida (RMSprop con schedule OneCycle), pero no constituye una alternativa a modelos fundacionales ni a soluciones de retrieval o reranking entrenadas. Cualquier evaluación seria requiere entrenar el modelo con datos propios y compararlo contra baselines de capacidad equivalente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixer (atención dispersa, gated fusion, approx gelu, batchnorm) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Mixer con atención dispersa y fusión con compuertas, activación approx gelu y normalización batchnorm. La model card describe la escala como "huge", etiqueta que no se corresponde con el recuento real de parámetros (24.832), por lo que debe interpretarse como un identificador de variante dentro del script y no como una indicación de tamaño. El repositorio incluye `config.json` con los ajustes de arquitectura generados y `training_args.json` con la receta de experimento por defecto: optimizador RMSprop y schedule OneCycle.

No se ha completado ningún entrenamiento: el archivo `model.safetensors` es un checkpoint de inicialización para pruebas de humo, no un checkpoint entrenado. No se especifican tokens de entrenamiento, composición del dataset, ni fases de RLHF o DPO, porque no han existido. La model card recomienda, para una evaluación significativa, entrenar todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias, y reportar la métrica de tarea sobre un conjunto de validación emparejado con al menos tres semillas.

## Capacidades

- No se declaran capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni razonamiento multi-paso.
- No se declaran capacidades multilingües.
- La única funcionalidad descrita es la ejecución del script `predict.py` mediante su bloque `__main__`, que genera un ejemplo de prueba de humo.
- El modelo está orientado a tareas de matching, pero sin checkpoint entrenado no hay evidencia de rendimiento en ninguna tarea concreta.

## Casos de uso

- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización permite verificar que el código de carga, el forward pass y el guardado de pesos funcionan antes de lanzar un entrenamiento real.
- Desarrollo de adaptadores de carga: al ser una implementación personalizada, las APIs automáticas de carga requieren un adaptador explícito; este repositorio sirve para desarrollar y validar dicho adaptador.
- Reproducción de experimentos de matching: la receta incluida (RMSprop, OneCycle) y los archivos de configuración permiten montar un experimento reproducible con datos propios.
- Comparación de arquitecturas Mixer frente a transformers en tareas de matching: el esqueleto permite entrenar variantes con la misma exposición de datos y medir diferencias con un baseline de capacidad equivalente.
- Docencia y formación: el tamaño reducido y la estructura clara del repositorio lo hacen útil para explicar el flujo completo de definición de arquitectura, configuración y checkpoint en PyTorch.
- Integración en tests de CI: el reducido número de parámetros permite ejecutar el modelo en CPU dentro de tests automatizados sin requisitos de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en cualquier precisión; con 24.832 parámetros el modelo cabe holgadamente en CPU y en cualquier GPU.
- GPU recomendadas: no se requiere GPU; cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las GPU consumer actuales y en la mayoría de sistemas embebidos.
- Opciones de despliegue: al ser una implementación personalizada, requiere el código propio del repositorio (`predict.py`) con un adaptador explícito; no se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables en la información proporcionada, y el repositorio no incluye evaluaciones frente a alternativas.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: los pesos son una inicialización, no un modelo funcional para ninguna tarea.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según la propia model card.
- No se declaran idiomas soportados ni longitud de contexto, por lo que no puede planificarse su uso en producción.
- No hay benchmarks ni métricas de tarea publicadas; cualquier afirmación de rendimiento sería inventada.
- La etiqueta de escala "huge" no coincide con el recuento real de parámetros (24.832), lo que puede inducir a error si se interpreta como tamaño del modelo.
- La licencia BSD-3-Clause permite uso comercial, pero la model card advierte de revisar por separado los términos de los datos de origen cuando se use con datasets externos.
- Al ser una implementación personalizada, las APIs genéricas de carga de Hugging Face no funcionan sin un adaptador explícito.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/beatrizmoreno90/mixer-baseline
