# egor-sokol/hybrid-retrieval

## Resumen

`egor-sokol/hybrid-retrieval` es un repositorio experimental publicado en Hugging Face que contiene una implementación propia de una arquitectura híbrida orientada a tareas de retrieval (recuperación de información multimodal). No se trata de un modelo entrenado ni de un checkpoint con pesos ajustados, sino de un esqueleto de código con un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests). El autor, egor-sokol, lo presenta explícitamente como un punto de partida para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo.

La relevancia de este repositorio es, por tanto, metodológica más que de rendimiento: documenta una arquitectura con atención dilatada, fusión tipo Tucker, activación Mish y normalización InstanceNorm, junto con una receta de entrenamiento por defecto basada en Adafactor con warmup lineal. El tamaño declarado en safetensors es de 24.832 parámetros, lo que confirma que se trata de un modelo de escala "small" pensado para validar código, no para producción.

No hay información sobre idiomas soportados, benchmarks, datos de entrenamiento ni resultados de evaluación. Cualquier uso en un sistema real requeriría entrenar el modelo desde cero y evaluarlo con protocolos reproducibles (el propio autor sugiere Flickr30k como primer banco de pruebas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid (atención dilatada + fusión Tucker) |
| Parametros totales | 24.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) |

## Arquitectura y entrenamiento

La arquitectura se describe como "Hybrid" con atención dilatada (dilated attention), mecanismo de fusión basado en descomposición de Tucker, función de activación Mish y normalización InstanceNorm. El repositorio incluye `config.json` con los parámetros de arquitectura generados y `training_args.json` con la receta de experimento por defecto: optimizador Adafactor y schedule de warmup lineal. No se especifica el número de capas, dimensión oculta, número de cabezas ni composición del dataset de entrenamiento.

El checkpoint `model.safetensors` es una inicialización válida para pruebas de humo, no un modelo entrenado. El autor indica que no se ha ejecutado un entrenamiento completo ni se ha auditado el modelo en cuanto a robustez, equidad o transferencia de dominio. La implementación es personalizada, por lo que las APIs genéricas de carga automática (por ejemplo, `AutoModel.from_pretrained`) requieren un adaptador explícito. No se documenta el número de tokens de entrenamiento, la composición del corpus ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de embeddings para retrieval multimodal (texto-imagen), según la orientación declarada del repositorio.
- Fusión de modalidades mediante mecanismo Tucker, orientada a combinar representaciones de distintas fuentes.
- Atención dilatada para capturar dependencias de largo alcance en secuencias, en teoría.
- Punto de partida para experimentación arquitectónica: permite modificar capas y reentrenar.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.
- No se documentan modos especiales (thinking, visión, audio) más allá del contexto de retrieval.

## Casos de uso

- Investigación en arquitecturas de retrieval: el repositorio sirve como base para probar variantes de atención dilatada y fusión Tucker antes de escalar a entrenamientos completos, gracias a su tamaño reducido (24.832 parámetros) y a la separación entre código, configuración y checkpoint.
- Pruebas de humo en pipelines de entrenamiento: permite validar que el script `train.py`, la carga de datos y el guardado de checkpoints funcionan antes de invertir cómputo en un run real.
- Reproducción de experimentos académicos: el autor sugiere evaluar sobre Flickr30k con al menos tres semillas y una línea base de capacidad equivalente, lo que encaja en protocolos de comparación controlada.
- Docencia y formación: un modelo de 24.832 parámetros es adecuado para explicar conceptos de atención dilatada, fusión multimodal y normalización en cursos prácticos sin requerir GPU de gama alta.
- Desarrollo de adaptadores de carga personalizados: dado que las APIs automáticas no funcionan directamente, el repositorio es útil para practicar la integración de arquitecturas custom en frameworks de inferencia.
- Base para ablaciones controladas: la receta Adafactor con warmup lineal y la configuración separada permiten comparar variantes manteniendo presupuesto de ajuste y semillas idénticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna puntuación de benchmark en el repositorio y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con cualquier cuantización razonable, dado el tamaño de 24.832 parámetros (los pesos en fp32 ocuparían aproximadamente 0,1 MB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 2 GB de VRAM (GTX 1050, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser una implementación personalizada, requeriría un adaptador explícito o ejecución directa del script `train.py`.
- Latencia y throughput: no disponibles; al no haber modelo entrenado, no hay mediciones significativas.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (retrieval multimodal con fusión Tucker y atención dilatada) ni se dispone de datos de rendimiento para establecer una comparación rigurosa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: los pesos son una inicialización para pruebas de humo, no un modelo funcional para retrieval real.
- No se ha auditado robustez, equidad ni transferencia de dominio; el autor lo advierte explícitamente.
- No hay benchmarks ni métricas publicadas, por lo que no es posible evaluar su calidad frente a alternativas.
- Las APIs automáticas de carga de Hugging Face no funcionan sin un adaptador explícito, lo que complica su integración en pipelines estándar.
- Licencia BSD-3-Clause: permite uso comercial con atribución, pero el autor recomienda revisar por separado los términos de los datos externos que se utilicen con el repositorio.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque no hay modelo entrenado que evaluar.
- Cualquier resultado obtenido con un checkpoint futuro debe documentarse por separado de los valores por defecto incluidos en este repositorio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/egor-sokol/hybrid-retrieval
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios de código o demos.
