# Cjohnsonberg/retrieval

## Resumen

`Cjohnsonberg/retrieval` es un repositorio experimental publicado en Hugging Face que contiene una implementación de un modelo Perceiver orientada a tareas de recuperación (retrieval). Lo desarrolla el usuario Cjohnsonberg y se distribuye bajo licencia BSD-3-Clause. No se trata de un modelo entrenado ni evaluado, sino de un esqueleto de arquitectura con un checkpoint de inicialización válido para pruebas de humo (smoke tests).

El modelo emplea la arquitectura Perceiver con atención lineal, fusión con compuertas (gated fusion), activación mish y normalización RMSNorm, en una escala que el autor denomina "nano". El recuento real de parámetros en el fichero safetensors es de 33.088, lo que lo sitúa en un orden de magnitud muy reducido, adecuado únicamente para validar código y flujos de entrenamiento, no para producción.

Su relevancia es limitada y de carácter didáctico o de investigación: sirve como punto de partida reproducible para experimentar con arquitecturas Perceiver aplicadas a retrieval multimodal (la model card sugiere Flickr30k como primer conjunto de evaluación), pero no ofrece pesos entrenados, no declara resultados de benchmarks y no documenta idiomas soportados. Cualquier uso real requeriría entrenamiento desde cero y evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver (atención lineal, gated fusion, activación mish, RMSNorm) |
| Parametros totales | 33.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización); código en Python (`predict.py`) |

## Arquitectura y entrenamiento

La arquitectura es un Perceiver con atención lineal, mecanismo que reduce el coste computacional frente a la atención cuadrática estándar al proyectar las entradas sobre un conjunto reducido de latentes. Incorpora fusión con compuertas (gated fusion) para combinar modalidades o flujos de representación, activación mish en las capas y normalización RMSNorm. La configuración concreta de capas, dimensiones latentes y cabezas de atención se registra en `config.json`, pero no se detalla en la información disponible.

No hay evidencia de entrenamiento completado. El repositorio incluye `training_args.json` con una receta por defecto basada en el optimizador Adam y un esquema de warmup constante, que el propio autor describe como valores de partida del script y no como resultado de una ejecución. El checkpoint `model.safetensors` se presenta explícitamente como inicialización para pruebas de humo. No se documentan volúmenes de tokens, composición del dataset, ni fases de RLHF o DPO. La model card recomienda evaluar sobre Flickr30k, con al menos tres semillas y una línea base de capacidad equivalente.

## Capacidades

- No se declaran capacidades funcionales verificadas: el checkpoint no está entrenado.
- El código está orientado a tareas de retrieval (recuperación de información), presumiblemente multimodal según la recomendación de evaluar en Flickr30k.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles; la arquitectura Perceiver es agnóstica a modalidad en diseño, pero no hay implementación entrenada que lo confirme.

## Casos de uso

- Pruebas de humo de pipelines de entrenamiento: cargar `model.safetensors` y ejecutar `predict.py` para verificar que el flujo de datos, el forward pass y el guardado de checkpoints funcionan antes de lanzar un entrenamiento completo.
- Investigación sobre arquitecturas Perceiver: usar el código como base reproducible para modificar el número de latentes, el esquema de fusión o la activación y comparar variantes bajo el mismo presupuesto de cómputo.
- Experimentos de retrieval multimodal: entrenar el modelo desde cero sobre Flickr30k u otro conjunto imagen-texto y medir la métrica de recuperación con al menos tres semillas, tal como sugiere el autor.
- Docencia y formación: ilustrar en un curso o taller cómo se estructura un repositorio de modelo (config, training args, checkpoint, script de inferencia) sin incurrir en costes de entrenamiento.
- Baseline de capacidad reducida: servir como referencia de "modelo nano" contra la que comparar arquitecturas de mayor tamaño en tareas de recuperación, siempre que se igualen datos, tuning y semillas.
- Validación de integraciones: comprobar adaptadores personalizados para APIs de carga automática, ya que la model card advierte que las APIs genéricas requieren un adaptador explícito por tratarse de una implementación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con 33.088 parámetros en cualquier precisión habitual (fp32, fp16 o bf16); el peso de los tensores es de decenas de kilobytes.
- GPU recomendadas: cualquier GPU, incluida CPU, es suficiente para ejecutar el forward pass; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU.
- Opciones de despliegue: al ser una implementación personalizada, requiere ejecutar `predict.py` o cargar el código con un adaptador; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; al no estar entrenado, las mediciones no serían representativas de una tarea real.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (Perceiver para retrieval a escala nano) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El checkpoint es una inicialización, no un modelo entrenado: sus salidas no tienen valor semántico ni utilidad práctica sin entrenamiento previo.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según declara el propio autor.
- No se documentan sesgos conocidos, pero al no haber datos de entrenamiento tampoco puede evaluarse su ausencia.
- Riesgo de alucinación: no aplicable en el sentido habitual, ya que el modelo no genera texto entrenado; cualquier salida es esencialmente aleatoria.
- No se declaran idiomas soportados ni longitud de contexto, por lo que no puede garantizarse cobertura lingüística alguna.
- Licencia BSD-3-Clause: permite uso comercial y modificación con atribución y sin garantías; deben revisarse por separado los términos de los datos externos que se utilicen para entrenar.
- Las APIs de carga automática de Hugging Face no funcionan sin un adaptador explícito, lo que complica la integración en pipelines estándar.
- Cualquier resultado obtenido con un checkpoint futuro entrenado debe documentarse por separado de los valores por defecto aquí incluidos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Cjohnsonberg/retrieval
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
