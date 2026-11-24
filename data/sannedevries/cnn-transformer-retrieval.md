# sannedevries/cnn-transformer-retrieval

## Resumen

`sannedevries/cnn-transformer-retrieval` es un repositorio de Hugging Face que contiene una implementación de referencia de una arquitectura híbrida CNN-Transformer orientada a tareas de retrieval (recuperación de información multimodal, presumiblemente texto-imagen dado que la model card sugiere Flickr30k como primer benchmark). Lo publica el usuario `sannedevries` bajo licencia MIT.

El aspecto más importante a tener en cuenta es que, según la propia model card, **no se trata de un modelo entrenado**, sino de un punto de partida reproducible: el checkpoint `model.safetensors` es una inicialización válida para pruebas de humo (smoke tests), no un modelo con pesos entrenados ni evaluado. El repositorio incluye además `config.json`, `training_args.json` y un `run.py` con un ejemplo ejecutable.

Con solo 33.088 parámetros totales (unos 33 mil, no millones) y un tamaño de repositorio de 0,0 GB, el artefacto es de escala trivial. La etiqueta "giant" de la model card debe interpretarse como el nombre de la variante de configuración generada, no como un indicador de tamaño real. Es relevante ahora únicamente como esqueleto de código y configuración para experimentación, no como modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN-Transformer híbrido (atención grouped query, fusión por tensor fusion, activación approx gelu, normalización batchnorm) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (checkpoint de inicialización), con `config.json` y `training_args.json` |

## Arquitectura y entrenamiento

La arquitectura combina capas convolucionales con bloques transformer bajo un esquema de "tensor fusion". La atención es de tipo grouped query (GQA), la activación es una aproximación de GELU y la normalización es batchnorm en lugar de LayerNorm, lo que sugiere un diseño orientado a procesar características espaciales (propias de CNN) antes de la atención. La variante configurada se etiqueta internamente como "giant", aunque el recuento real de parámetros (33.088) no corresponde a esa escala.

No hay evidencia de entrenamiento: la model card indica explícitamente que `model.safetensors` es un checkpoint de inicialización para pruebas de humo y que no se reclama ninguna puntuación de benchmark. La receta de experimento por defecto usa el optimizador Adam con un schedule coseno, pero el autor advierte que son valores de partida del script, no evidencia de una ejecución completada. No se documentan número de tokens, composición del dataset, ni fases de RLHF/DPO.

## Capacidades

- Implementación ejecutable de un modelo CNN-Transformer para retrieval, con `run.py` como artefacto principal y bloque `__main__` de ejemplo.
- Configuración explícita de arquitectura en `config.json` y receta de entrenamiento en `training_args.json`.
- Punto de partida reproducible para experimentos de retrieval multimodal (la model card sugiere Flickr30k como primer benchmark).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.
- No se declaran modos especiales (thinking, visión, audio) más allá del propósito declarado de retrieval.

## Casos de uso

- Prototipado de arquitecturas híbridas CNN-Transformer: el repositorio sirve como esqueleto para validar ideas de fusión tensorial y atención GQA antes de escalar a un modelo real.
- Pruebas de humo de pipelines de entrenamiento: el checkpoint de inicialización permite verificar que el bucle de entrenamiento, la carga de datos y el guardado de pesos funcionan sin errores.
- Reproducción de experimentos de retrieval: partiendo de `training_args.json`, un equipo puede entrenar desde cero con su propio dataset y comparar contra baselines de igual capacidad.
- Docencia y formación: útil para ilustrar cómo se estructura un repositorio de modelo (config, args, pesos, script) sin la complejidad de un modelo grande.
- Integración en investigación sobre retrieval multimodal: base para experimentar con Flickr30k u otros conjuntos de recuperación texto-imagen.
- Auditoría de código de arquitecturas personalizadas: el `run.py` permite revisar decisiones de diseño (batchnorm, approx gelu, tensor fusion) antes de adoptarlas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se reclama ninguna puntuación y que el checkpoint no ha sido entrenado ni evaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 33.088 parámetros; cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no aplica para el checkpoint actual; cualquier GPU (o CPU) es suficiente para ejecutar el script.
- Cabe en consumer GPU: sí, en todas (RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; al ser una implementación personalizada, requiere un adaptador explícito para APIs de carga automática.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría con datos verificables en la información proporcionada; además, al no ser un modelo entrenado, cualquier comparación de rendimiento carecería de sentido.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no produce resultados útiles en retrieval ni en ninguna otra tarea.
- No ha sido auditado para robustez, equidad ni transferencia de dominio, según la propia model card.
- No se documentan sesgos conocidos, pero al no haber entrenamiento no hay evaluación posible de los mismos.
- Riesgo de alucinación no aplicable en su estado actual (no genera texto).
- Idiomas y longitud de contexto no documentados.
- Licencia MIT permite uso comercial, pero el autor advierte de revisar los términos de los datos de origen si se usa con datasets externos.
- Al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito.
- Cualquier resultado de un futuro checkpoint entrenado debe documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- Hugging Face: https://huggingface.co/sannedevries/cnn-transformer-retrieval
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
