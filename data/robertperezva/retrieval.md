# robertperezva/retrieval

## Resumen

Este repositorio de HuggingFace, publicado por robertperezva, contiene una implementación de DeiT (Data-efficient Image Transformer) orientada a tareas de retrieval. Según la documentación del autor, no se trata de un modelo entrenado, sino de un punto de partida reproducible con un checkpoint de inicialización válido para pruebas de humo. La arquitectura configurada incluye atención de ventana deslizante, fusión de bajo rango, activación GELU y normalización RMSNorm.

El modelo declara 49.600 parámetros en su checkpoint safetensors, lo que lo convierte en una variante en miniatura y experimental, muy alejada de los DeiT estándar. Su relevancia reside en servir como base de experimentación para la recuperación de imágenes, no como un modelo listo para producción.

No se han publicado datos de entrenamiento ni resultados de benchmarks en la información disponible. El propio autor indica que el checkpoint no ha sido entrenado ni auditado, y que una primera evaluación útil debería realizarse sobre datasets como Flickr30k con varias semillas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeiT (Data-efficient Image Transformer) |
| Parámetros totales | 49.600 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no aplica; modelo de visión) |
| Tipos de cuantización | No disponible (el checkpoint se ofrece únicamente en safetensors, sin cuantización documentada) |
| Idiomas soportados | No disponible (no aplica; modelo de visión) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La implementación se basa en DeiT, según se recoge en `config.json`. El repositorio indica una escala "base", pero el número real de parámetros (49.600) sugiere un modelo de tamaño mínimo con una arquitectura simplificada. Destaca el uso de atención de ventana deslizante y fusión de bajo rango, junto con activación GELU y normalización RMSNorm; estas opciones no corresponden a la arquitectura DeiT convencional.

En cuanto al entrenamiento, el repositorio proporciona un `training_args.json` con una receta por defecto que emplea el optimizador Adafactor y una programación coseno. Sin embargo, no hay evidencia de un proceso de entrenamiento completado: `model.safetensors` es un checkpoint de inicialización. No se han proporcionado datos de entrenamiento, número de tokens ni ninguna fase de RLHF o DPO.

## Capacidades

- No es un modelo entrenado; no tiene capacidades de retrieval verificadas.
- Proporciona una implementación Python ejecutable (`run.py`) para definir y probar la arquitectura.
- Incluye un checkpoint de inicialización válido para pruebas de humo, no para inferencia significativa.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- Es un modelo de visión; no genera texto ni procesa lenguaje natural.
- Su propósito declarado es servir de base para evaluación en tareas de retrieval (p. ej. Flickr30k) cuando se entrene.
- No incorpora capacidades multilingües ni de audio.

## Casos de uso

- Investigación experimental en retrieval de imágenes: usar `run.py` para entrenar el modelo desde cero con un dataset propio, partiendo de las configuraciones incluidas.
- Pruebas de humo en pipelines de visión: el checkpoint de inicialización permite verificar que la implementación carga y ejecuta sin errores en entornos de desarrollo.
- Estudio de la atención de ventana deslizante en DeiT: comparar esta variante con un DeiT estándar en igualdad de presupuesto de cómputo, controlando semillas y datos.
- Prototipos de búsqueda de productos por similitud visual: utilizar la arquitectura como base de un sistema de retrieval de catálogos, siempre que se entrene y valide con datos reales.
- Docencia de transformers de visión: el código es un ejemplo reducido y legible de DeiT para explicar componentes como atención, fusión de bajo rango y normalización.
- Reproducibilidad de experimentos: usar `config.json` y `training_args.json` para fijar una receta experimental y registrar métricas de entrenamiento.
- Benchmarks de eficiencia en hardware de gama baja: dado el reducido tamaño del modelo, puede ejecutarse en CPUs o GPUs modestas para medir latencia de un modelo de visión mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No benchmark score is claimed in this repository." Por tanto, no es posible presentar comparativas numéricas.

## Requisitos de hardware

- VRAM estimada: el checkpoint tiene 49.600 parámetros en FP32, lo que implica un peso de aproximadamente 194 KB; el consumo real de VRAM depende del framework y del tamaño de lote, pero es insignificante.
- GPU recomendada: cualquier GPU compatible con PyTorch (por ejemplo, RTX 3060, A100 o H100) es suficiente; el modelo es tan pequeño que también funciona en CPU.
- ¿Cabe en GPU de consumo? Sí, en cualquier GPU consumer moderna, e incluso sin GPU.
- Opciones de despliegue: no aplica para motores como vLLM, Ollama o TGI; el modelo se ejecuta mediante el script `run.py` usando PyTorch.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No disponible. La información existente no permite una comparación justa con modelos como DeiT-base (86M de parámetros) porque este checkpoint está sin entrenar y presenta una arquitectura experimental. No se identifica otro modelo de 49.600 parámetros con características equiparables en el repositorio.

## Limitaciones y advertencias

- El checkpoint de inicialización no ha sido entrenado ni auditado; no debe usarse como modelo productivo.
- No se ha realizado evaluación de sesgos, robustez ni transferencia de dominio.
- La implementación es personalizada y requiere un adaptador explícito para cargarse con APIs genéricas de HuggingFace.
- No hay puntuaciones de benchmarks ni garantías de rendimiento.
- Al utilizar con datasets externos, es necesario revisar los términos de licencia de dichos datasets además de la licencia BSD-3-Clause del código.
- La arquitectura de atención de ventana deslizante y fusión de bajo rango no está validada en tareas reales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/robertperezva/retrieval
- Perfil del autor: https://huggingface.co/robertperezva
- Modelos del autor: https://huggingface.co/robertperezva/models
- Otro repositorio del autor: https://huggingface.co/robertperezva/llm-asr
