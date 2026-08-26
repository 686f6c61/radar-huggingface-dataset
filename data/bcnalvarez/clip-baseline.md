# Bcnalvarez/clip-baseline

## Resumen

`Bcnalvarez/clip-baseline` es una implementación en PyTorch de una arquitectura CLIP (Contrastive Language-Image Pretraining) en escala nano, orientada a tareas de retrieval multimodal. La publica Alberto Alvarez (Bcnalvarez), un perfil de HuggingFace activo en experimentación con modelos de IA, aunque el repositorio se presenta explícitamente como un **punto de partida reproducible**, no como un modelo entrenado. El checkpoint incluido (`model.safetensors`) es un estado de inicialización válido para pruebas de humo y verificación del pipeline, no un lanzamiento con resultados de evaluación.

El modelo tiene solo 24.832 parámetros, lo que lo sitúa en una categoría experimental de tamaño mínimo, útil para estudiar el comportamiento de la arquitectura CLIP con atención lineal y fusión de bajo rango. Su licencia MIT permite uso comercial sin restricciones, aunque la ausencia de entrenamiento previo hace que no tenga ninguna capacidad funcional real para tareas de visión-lenguaje. Su relevancia actual es limitada: sirve como plantilla de código y configuración para quien quiera reproducir experimentos de entrenamiento CLIP desde cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CLIP (escala nano) |
| Parametros totales | 24.832 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño CLIP original de OpenAI, pero con adaptaciones específicas: atención lineal en lugar de atención softmax completa, fusión de bajo rango para la proyección multimodal, activación GELU con variante tanh y normalización RMSNorm. El repositorio incluye `config.json` con la configuración generada y `training_args.json` con la receta por defecto del experimento, que usa el optimizador AdamW con un scheduler polinomial.

El checkpoint incluido es un estado de inicialización, no un modelo entrenado. No se documenta ningún dataset de entrenamiento, número de tokens procesados ni proceso de RLHF/DPO. La model card indica que estos valores son puntos de partida en el script, no evidencia de una ejecución completada. Para una evaluación significativa, el autor recomienda entrenar todas las baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- No tiene capacidades funcionales reales: el checkpoint es de inicialización y no ha sido entrenado.
- La arquitectura está diseñada para recuperación de imágenes y texto (retrieval), pero sin entrenamiento no puede ejecutar esa tarea.
- No soporta tool calling, function calling, ni razonamiento multi-paso.
- No hay soporte multimodal funcional (visión, audio) en el estado actual.
- No se documenta capacidad multilingüe alguna.
- No incluye modo de pensamiento o generación de texto; es una arquitectura de embeddings contrastivos, no generativa.

## Casos de uso

- **Pruebas de humo y validación de pipeline**: el checkpoint de inicialización permite verificar que el script de entrenamiento (`train.py`) arranca, ejecuta un paso forward/backward y produce gradientes sin errores. Es el caso de uso explícitamente documentado en el repositorio.
- **Punto de partida para experimentos de entrenamiento CLIP**: sirve como baseline reproducible para investigar cómo la arquitectura nano con atención lineal se comporta en datasets pequeños como Flickr30k, tal como sugiere la guía de evaluación del autor.
- **Estudio de arquitecturas CLIP alternativas**: la atención lineal y la fusión de bajo rango permiten comparar el coste computacional y la calidad de embeddings frente a CLIP estándar con atención cuadrática.
- **Validación de reproducibilidad**: para investigadores que quieran comprobar que sus implementaciones de CLIP producen resultados consistentes con una configuración dada, este repositorio ofrece un punto de referencia estable.
- **Entorno educativo**: como ejemplo mínimo y legible de una arquitectura CLIP completa en PyTorch, útil para formación en visión por computador y aprendizaje multimodal.
- **Base para conocimiento de destilación**: un modelo de 24K parámetros puede servir como estudiante en experimentos de destilación desde un CLIP grande, aunque requeriría entrenamiento previo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reivindica ninguna puntuación de benchmark en el repositorio. El autor sugiere que una primera evaluación útil usaría Flickr30k, reportando la métrica de la tarea con al menos tres semillas e incluyendo una baseline de capacidad equivalente.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB en cualquier cuantización; un modelo de 24.832 parámetros en fp32 ocupa aproximadamente 100 KB.
- **GPU recomendada**: cualquier GPU consumer (incluso una integrada) es suficiente; no requiere hardware de servidor.
- **Compatibilidad consumer**: sí, cabe en cualquier GPU de consumo, incluidos dispositivos con poca memoria.
- **Opciones de despliegue**: no aplica para inferencia real, ya que no hay pesos entrenados. Para entrenamiento, se puede ejecutar en CPU o GPU con PyTorch estándar. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponible; al no haber modelo entrenado, no hay mediciones de rendimiento de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Estado |
|---|---|---|---|---|---|
| Bcnalvarez/clip-baseline | 24.832 | no disponible | No entrenado (inicialización) | MIT | Experimental |
| OpenAI CLIP ViT-B/32 | ~151 M | no disponible | 400 M pares imagen-texto | MIT | Producción |
| OpenAI CLIP RN50 | ~102 M | no disponible | 400 M pares imagen-texto | MIT | Producción |

La comparación es desigual: `clip-baseline` es una implementación mínima no entrenada, mientras que los CLIP de OpenAI son modelos de producción con cientos de millones de parámetros y entrenamiento contrastivo a gran escala. No hay competidores directos en la misma categoría de tamaño (24K parámetros) con pesos entrenados publicados.

## Limitaciones y advertencias

- **No es un modelo entrenado**: el checkpoint es de inicialización; cualquier uso en producción es inviable y producirá resultados sin sentido.
- **Sin auditoría de robustez ni sesgos**: la model card indica que el checkpoint no ha sido auditado para robustez, fairness ni transferencia de dominio.
- **Riesgo de alucinación**: no aplica en el sentido clásico, pero si se entrena sin cuidado, el modelo puede producir embeddings no significativos sin señal de supervisión adecuada.
- **Sin soporte de carga automática**: al ser una implementación personalizada, las API de carga genéricas requieren un adaptador explícito antes de su uso.
- **Sin documentación de idioma**: no se especifican idiomas soportados; el entrenamiento de un modelo de este tipo requeriría definir el corpus.
- **Restricciones de licencia para uso comercial**: la licencia MIT permite uso comercial sin restricciones, pero la model card advierte revisar los términos de las fuentes de datos externas si se usa con datasets como Flickr30k.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bcnalvarez/clip-baseline
- Perfil del autor en Hugging Face: https://huggingface.co/Bcnalvarez
- Listado de modelos del autor: https://huggingface.co/Bcnalvarez/models
- Repositorio de referencia de CLIP (OpenAI): https://github.com/openai/CLIP
- Página oficial de CLIP (OpenAI): https://openai.com/index/clip/
- Artículo de Roboflow sobre CLIP: https://blog.roboflow.com/openai-clip/
