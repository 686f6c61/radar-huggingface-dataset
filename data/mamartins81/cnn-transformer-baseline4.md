# MAMARTINS81/cnn-transformer-baseline4

## Resumen

`MAMARTINS81/cnn-transformer-baseline4` es un repositorio experimental publicado en Hugging Face por el usuario MAMARTINS81 que contiene una implementación propia de una arquitectura híbrida CNN-Transformer orientada a aprendizaje contrastivo. No se trata de un modelo entrenado ni de un release con pesos listos para producción: el autor lo describe explícitamente como un punto de partida reproducible con un checkpoint de inicialización válido únicamente para pruebas de humo (smoke tests).

El artefacto principal es el script `inference.py`, acompañado de `config.json` (ajustes de arquitectura), `training_args.json` (receta de experimento por defecto: optimizador Adam con schedule de warmup lineal) y `model.safetensors` (inicialización, no entrenado). La model card declara una variante de escala "huge", atención estándar, fusión por tensor fusion, activación approx GELU y normalización por batchnorm, pero no aporta detalles sobre número de capas, dimensión oculta ni composición del dataset.

El dato objetivo disponible es el recuento de parámetros del checkpoint safetensors: 16.576 parámetros totales, un tamaño incompatible con cualquier variante "huge" en el sentido habitual del término, lo que sugiere que el checkpoint incluido corresponde a una configuración mínima de prueba y no a la arquitectura completa descrita en la configuración. Su relevancia es, por tanto, la de un esqueleto de código para experimentación con arquitecturas híbridas y pérdidas contrastivas, no la de un modelo evaluable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN-Transformer híbrida (atención estándar, tensor fusion, approx GELU, batchnorm) |
| Parámetros totales | 16.576 (según safetensors del repo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo safetensors en fp32/fp16 estándar de PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (checkpoint de inicialización) + código Python (`inference.py`) |

## Arquitectura y entrenamiento

La arquitectura declarada combina un extractor convolucional con un bloque Transformer, unidos mediante tensor fusion y con atención de tipo estándar (no lineal, no decodificación especulativa). La normalización es batchnorm y la activación approx GELU. El autor etiqueta la variante como "huge", pero no publica el recuento de capas, dimensiones ocultas, número de cabezas ni resolución de entrada, de modo que la configuración real solo puede inferirse leyendo `config.json` en el repositorio.

No hay evidencia de entrenamiento: el checkpoint `model.safetensors` se describe como inicialización para pruebas de humo y el propio autor indica que no se reclama ninguna puntuación de benchmark. La receta por defecto usa Adam con warmup lineal, pero se presenta como valores de partida del script, no como resultado de una ejecución completada. El objetivo declarado es el aprendizaje contrastivo (pérdida de tipo contrastive), aunque no se especifica la función de pérdida concreta, el tamaño del lote, el número de tokens ni la composición del dataset.

## Capacidades

- No es un modelo de lenguaje: no genera texto ni mantiene conversaciones.
- No soporta tool calling ni function calling.
- No implementa razonamiento multi-paso ni modo thinking.
- No tiene capacidades de visión, audio ni multilingües documentadas.
- El artefacto útil es el código de definición del modelo y un punto de entrada de inferencia (`inference.py`) con un ejemplo de smoke test en su bloque `__main__`.
- Al ser una implementación personalizada, las APIs automáticas de carga de Transformers requieren un adaptador explícito.
- El checkpoint incluido sirve para verificar que el grafo se instancia y ejecuta, no para obtener representaciones útiles.

## Casos de uso

- Pruebas de integración de pipelines: usar `inference.py` para verificar que el entorno de PyTorch, safetensors y las dependencias del proyecto se cargan correctamente antes de entrenar modelos propios.
- Plantilla para investigación en aprendizaje contrastivo: el repositorio ofrece un esqueleto de modelo CNN-Transformer y una receta de entrenamiento base que se puede extender con pares positivos/negativos propios.
- Benchmarking de arquitecturas híbridas: sirve como baseline de capacidad comparable al comparar variantes CNN puras, Transformer puras e híbridas bajo el mismo presupuesto de datos y semillas, tal como recomienda el autor.
- Docencia y formación: ejemplo mínimo y legible de cómo estructurar un modelo híbrido con configuración externa (`config.json`) y argumentos de entrenamiento separados (`training_args.json`).
- Reproducibilidad de experimentos: el repositorio fija semillas, optimizador y schedule por defecto, lo que facilita replicar ejecuciones en distintos entornos.
- Punto de partida para tareas de similitud multimodal o de recuperación (retrieval) una vez entrenado con datos propios, dado el enfoque contrastivo declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el repositorio no reclama ninguna puntuación y que el checkpoint no ha sido entrenado ni auditado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con el checkpoint de 16.576 parámetros; el modelo completo descrito en `config.json` no está cuantificado y su huella real es desconocida.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente para el checkpoint incluido; para entrenar una variante completa se necesitaría una GPU con memoria suficiente según la configuración efectiva, dato no disponible.
- Cabe en GPU de consumo: sí, el checkpoint de inicialización cabe en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: PyTorch nativo mediante `inference.py`; no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, y al ser una implementación personalizada requeriría un adaptador para integrarse en esos ecosistemas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (CNN-Transformer con pérdida contrastiva) ni releases del mismo autor con los que establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: las salidas del modelo carecen de valor semántico y no deben usarse en producción.
- El autor no ha auditado el modelo para robustez, equidad ni transferencia de dominio.
- El recuento de 16.576 parámetros contradice la etiqueta "huge" de la model card; conviene verificar `config.json` antes de asumir cualquier escala.
- No hay información sobre sesgos, idiomas ni dominio de aplicación.
- Licencia BSD-3-Clause: permite uso comercial y modificación con atribución y conservación del aviso de copyright; el autor advierte de revisar por separado los términos de los datos externos que se usen con el repositorio.
- Sin métricas, sin dataset documentado y sin semillas publicadas: cualquier resultado derivado debe documentarse de forma independiente a los valores por defecto del repositorio.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/MAMARTINS81/cnn-transformer-baseline4
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información disponible.
