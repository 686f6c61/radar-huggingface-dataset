# phili-ppfis/cnn-transformer-classification

## Resumen

`phili-ppfis/cnn-transformer-classification` es un repositorio de Hugging Face publicado por el usuario phili-ppfis que contiene una implementación propia de una arquitectura híbrida denominada "Cnn Transformer" orientada a tareas de clasificación. No se trata de un modelo entrenado ni de un release con pesos listos para producción: la model card indica explícitamente que `model.safetensors` es un checkpoint de inicialización válido para pruebas de humo (smoke tests), no un modelo con benchmarks publicados.

El interés del repositorio es fundamentalmente como punto de partida reproducible: incluye `train.py` como artefacto principal, un `config.json` con los ajustes de arquitectura generados y un `training_args.json` con la receta de experimento por defecto (optimizador SGD con schedule de warmup lineal). La arquitectura declarada combina atención dilatada, fusión mediante cross attention, activación GELU y normalización InstanceNorm.

El dato de parámetros totales registrado en los safetensors es de 49.600, lo que sitúa el artefacto en la categoría de modelos minúsculos, coherente con su función de esqueleto para pruebas y experimentación, no con un modelo de propósito general. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 0.0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (híbrida CNN + transformer, atención dilatada, fusión por cross attention) |
| Parametros totales | 49.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (checkpoint de inicialización), PyTorch |

## Arquitectura y entrenamiento

La arquitectura declarada en la model card es una "Cnn Transformer" de escala "huge" según la configuración generada, con atención dilatada, fusión mediante cross attention, activación GELU y normalización InstanceNorm. El repositorio no detalla la disposición exacta de las capas convolucionales y de atención, ni el número de capas, dimensiones ocultas o cabezas de atención más allá de lo que registre el `config.json` incluido.

No se ha completado ningún entrenamiento: el checkpoint `model.safetensors` es una inicialización para smoke tests y la model card afirma explícitamente que no se reclama ninguna puntuación de benchmark. La receta de experimento por defecto usa SGD con un schedule de warmup lineal, valores de partida en el script y no evidencia de una ejecución finalizada. No se especifican tokens de entrenamiento, composición del dataset ni fases de RLHF o DPO. Al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito antes de su uso.

## Capacidades

- Clasificación: el repositorio está orientado a tareas de clasificación, aunque no se especifica sobre qué dominio (imagen, texto u otro).
- Implementación ejecutable: incluye `train.py` con un bloque `__main__` de ejemplo de smoke test y un punto de entrada de entrenamiento.
- Configuración explícita: `config.json` y `training_args.json` permiten reproducir los ajustes de arquitectura y de experimento.
- Generación de texto: no disponible.
- Razonamiento, código, matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización y `train.py` permiten verificar que un pipeline de datos, bucle de entrenamiento y guardado de pesos funciona de extremo a extremo antes de escalar a un modelo real.
- Prototipado de arquitecturas híbridas CNN-transformer: sirve como esqueleto para experimentar con atención dilatada y fusión por cross attention en tareas de clasificación, modificando `config.json` para variar la escala.
- Reproducción de experimentos controlados: el `training_args.json` documenta la receta por defecto (SGD, warmup lineal) y facilita fijar semillas y presupuestos de ajuste para comparar baselines con la misma exposición de datos.
- Docencia y formación: un modelo de 49.600 parámetros es adecuado para ilustrar el flujo completo de definición de arquitectura, configuración y entrenamiento en PyTorch sin requerir hardware especializado.
- Integración como adaptador en frameworks personalizados: al requerir un adaptador explícito para las APIs de carga automática, es un caso práctico para desarrollar y probar dicho adaptador.
- Base para clasificación específica de dominio: partiendo del script y la configuración, se puede entrenar desde cero sobre un split etiquetado específico de la tarea y reportar la métrica correspondiente en al menos tres semillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint es una inicialización sin entrenar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; con 49.600 parámetros, el checkpoint en precisión completa ocupa del orden de decenas de kilobytes, por lo que cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer (por ejemplo, RTX 3060 o superior) es sobradamente suficiente, y la CPU es viable para smoke tests.
- Cabe en consumer GPU: sí, con margen amplio, dado el tamaño del checkpoint.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser una implementación personalizada, la carga requiere el código del repositorio y un adaptador explícito.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no proporciona baselines de capacidad comparable ni resultados que permitan una comparación significativa con otros modelos de clasificación.

## Limitaciones y advertencias

- El checkpoint `model.safetensors` no ha sido entrenado; es una inicialización para smoke tests y no debe presentarse como modelo con rendimiento validado.
- No hay benchmarks, métricas de tarea ni evaluación de robustez, equidad o transferencia de dominio.
- La model card advierte de que la implementación debe tratarse como un punto de partida experimental.
- Al ser una implementación personalizada, las APIs genéricas de carga automática no funcionan sin un adaptador explícito.
- No se especifican idiomas soportados ni dominio de clasificación, lo que impide anticipar su comportamiento en datos reales.
- La licencia apache-2.0 permite uso comercial del código y pesos, pero la model card recomienda revisar por separado los términos de los datos de origen cuando se usen datasets externos.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse de forma separada a los valores por defecto incluidos en el repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/phili-ppfis/cnn-transformer-classification
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
