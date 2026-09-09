# chineduogunleye/assignment-retrieval

## Resumen

El modelo `chineduogunleye/assignment-retrieval` es una implementación personalizada y compacta en PyTorch de una arquitectura **Cnn Transformer** orientada a tareas de recuperación de información (retrieval). Desarrollado por el usuario chineduogunleye, este repositorio tiene una configuración de escala **tiny** diseñada explícitamente para revisión de código, pruebas de humo (smoke tests) y experimentos pequeños controlados, no como un modelo preentrenado listo para producción. El checkpoint incluido en `model.safetensors` es un punto de partida de inicialización, no un modelo entrenado ni evaluado. Con solo **24.832 parámetros**, la ficha pretende documentar una propuesta arquitectónica experimental que combina capas convolucionales y transformadores con atención de ventana deslizante y fusión Tucker. La relevancia actual del modelo es limitada: no compite con modelos de retrieval de gran escala, pero sirve como referencia técnica para quienes investigan arquitecturas híbridas CNN-Transformer en entornos de investigación y desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cnn Transformer (atención de ventana deslizante, fusión Tucker, activación GELU tanh, normalización LayerNorm) |
| Parametros totales | 24.832 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos en precisión original en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | bsd-3-clause |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura propuesta es un **Cnn Transformer** en configuración *tiny*. Combina módulos convolucionales con bloques de transformador, usando **atención de ventana deslizante** (sliding window attention) para reducir la complejidad computacional, y una **fusión Tucker** para combinar las representaciones. La activación es **GELU tanh** y la normalización emplea **LayerNorm**. Según el autor, el archivo `config.json` registra los ajustes de arquitectura generados, y `training_args.json` documenta una receta experimental por defecto que utiliza el optimizador **LAMB** con una programación polinómica. Sin embargo, es importante subrayar que **no se ha realizado ningún entrenamiento**: el checkpoint es solo una inicialización para pruebas de humo. No se ofrecen datos sobre composición del dataset, número de tokens ni procesos de RLHF o DPO, porque no existen. Tampoco hay resultados de evaluación publicados.

## Capacidades

- El modelo es una implementación de **recuperación de información (retrieval)** en estado experimental, no entrenada.
- **No tiene capacidades verificadas** de generación de texto, razonamiento, programación, matemáticas, visión, tool calling o agentes.
- Al ser una arquitectura híbrida CNN-Transformer, está pensado para investigar cómo la fusión Tucker y la atención de ventana deslizante afectan a tareas de recuperación.
- Puede ejecutarse como un **smoke test** para validar que el pipeline y la inicialización del modelo funcionan correctamente.
- No incluye soporte de idiomas declarado ni capacidades multilingües.
- No dispone de un adaptador para APIs de carga automática genéricas; el README indica que se requiere un adaptador explícito para su uso fuera de la implementación personalizada.

## Casos de uso

- **Pruebas de humo en entornos de CI/CD**: ejecutar `pipeline.py` para verificar que la arquitectura Cnn Transformer carga y produce salidas, sirviendo como test unitario de la implementación.
- **Experimentación controlada en retrieval**: emplear el modelo como punto de partida en tareas pequeñas de recuperación de imágenes o texto (por ejemplo, Flickr30k), donde se pueda comparar con una línea base de capacidad equivalente y medir el rendimiento en al menos tres semillas.
- **Investigación de arquitecturas híbridas**: utilizar el código como referencia para estudiar el impacto de la fusión Tucker y la atención de ventana deslizante en el rendimiento de recuperación frente a arquitecturas puramente transformer o CNN.
- **Desarrollo de adaptadores personalizados**: dado que la implementación es custom, el modelo sirve para construir y probar adaptadores que permitan su carga desde APIs genéricas de HuggingFace.
- **Plantilla para entrenamiento experimental**: los archivos `config.json` y `training_args.json` pueden reutilizarse como base para lanzar experimentos de entrenamiento con configuraciones alternativas de tamaño o datos.
- **Entorno docente y demostraciones técnicas**: ideal para explicar y depurar una implementación completa de un modelo de retrieval pequeño, mostrando el flujo de inicialización, configuración y ejecución sin necesidad de recursos de hardware elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: insignificante, por debajo de 1 GB en cualquier GPU o CPU. Con 24.832 parámetros, la inferencia puede ejecutarse en recursos mínimos.
- **GPU recomendada**: no requiere una GPU específica; cualquier tarjeta moderna (RTX 3060, A100, H100) o incluso una CPU ejecutará el pipeline sin problemas. No es un modelo diseñado para inferencia de alto rendimiento.
- **Compatibilidad con GPU de consumo**: sí, es compatible con cualquier GPU de consumo por su tamaño mínimo.
- **Opciones de despliegue**: no es un modelo LLM, por lo que **vLLM, llama.cpp, Ollama o TGI no son opciones aplicables**. El despliegue se limitaría a entornos Python con PyTorch, ejecutando el script `pipeline.py` directamente.
- **Latencia y throughput**: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| chineduogunleye/assignment-retrieval | Cnn Transformer tiny | 24.832 | no disponible | BSD-3-Clause | Experimental, sin entrenar |
| DPR (Dense Passage Retrieval) | Transformer (BERT) | ~110M+ | 512 tokens | Apache-2.0 | Preentrenado y evaluado |
| Contriever | Transformer | ~110M | 512 tokens | MIT | Preentrenado y evaluado |

La comparación es conceptual: el modelo analizado no tiene un tamaño comparable ni rendimiento medido frente a los modelos de retrieval reales. DPR y Contriever se mencionan solo como referencias de la categoría, pero **no existe una comparación directa** con este checkpoint experimental.

## Limitaciones y advertencias

- El checkpoint es una **inicialización no entrenada**: no ha sido ajustado ni auditado para robustez, equidad o transferencia de dominio.
- **No debe usarse en producción**: el README lo califica explícitamente como experimental y para pruebas de humo.
- No se dispone de datos de sesgos, alucinación o comportamiento lingüístico, ya que no se ha entrenado.
- El modelo no admite carga automática con APIs genéricas; requiere un adaptador explícito.
- La licencia **BSD-3-Clause** permite uso comercial, pero el estado del modelo hace que carezca de valor práctico para sistemas reales.
- Cualquier resultado futuro de un checkpoint entrenado debe documentarse por separado, sin mezclarse con los valores por defecto del repositorio.

## Enlaces

- HuggingFace: https://huggingface.co/chineduogunleye/assignment-retrieval
- Paper o blog: no disponible
