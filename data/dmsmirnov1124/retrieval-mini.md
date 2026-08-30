# Dmsmirnov1124/retrieval-mini

## Resumen

El modelo `Dmsmirnov1124/retrieval-mini` es una implementación pequeña de un Vision Transformer (ViT) orientada a tareas de recuperación de información visual (retrieval). El autor, Dmsmirnov1124 (Михаил Смирнов), lo publica como un punto de partida reproducible, no como un modelo entrenado: el repositorio incluye el código Python, la configuración de arquitectura y un checkpoint de inicialización válido para pruebas de humo, pero sin ningún resultado de benchmark.

Se trata de una implementación personalizada con atención dispersa (sparse attention), fusión por compuerta (gated fusion), activación GELU tanh y normalización por lotes (batch norm). Con solo 33.088 parámetros (según el archivo safetensors), es un modelo extremadamente ligero, pensado para experimentación y desarrollo de pipelines de retrieval visual, no para uso en producción. La relevancia actual de este tipo de modelos radica en la creciente necesidad de sistemas de búsqueda semántica sobre imágenes, aunque en este caso concreto el checkpoint no ha sido entrenado y no demuestra capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (Vision Transformer) escala small |
| Parametros totales | 33.088 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del número de parches, no especificado) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponibles (modelo visual, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un ViT de escala pequeña con varias particularidades: atención dispersa (sparse attention) en lugar de atención densa completa, lo que reduce el coste computacional; fusión por compuerta (gated fusion) para combinar representaciones; activación GELU con aproximación tanh; y normalización por lotes (batch norm) en lugar de layer norm, algo atípico en ViT estándar. La configuración se registra en `config.json` y los argumentos de entrenamiento por defecto en `training_args.json`, que especifican el optimizador Novograd con un programa de calentamiento constante.

No hay información sobre datos de entrenamiento: el repositorio no menciona ningún dataset ni número de tokens. El archivo `model.safetensors` es un checkpoint de inicialización (pesos aleatorios o predefinidos) para pruebas de humo, no un modelo entrenado. La model card indica explícitamente que no se reclama ningún resultado de benchmark y que cualquier evaluación futura debe realizarse tras entrenar el modelo con datos reales, documentando por separado los resultados.

## Capacidades

- No se puede afirmar ninguna capacidad funcional real, ya que el checkpoint no está entrenado.
- La arquitectura está diseñada para extraer representaciones de imágenes (embeddings) con fines de retrieval, pero no hay evidencia de que produzca embeddings útiles sin entrenamiento.
- No soporta tool calling, razonamiento multi-paso, ni generación de texto: es un modelo de visión puro.
- No hay capacidades multilingües ni de procesamiento de lenguaje.
- El código incluye un ejemplo ejecutable (`python train.py --help`) para iniciar un entrenamiento de prueba.
- Al ser una implementación personalizada, no es compatible con las API genéricas de HuggingFace sin un adaptador explícito.

## Casos de uso

- No hay casos de uso validados para este modelo en su estado actual, al no estar entrenado.
- Potencialmente, podría servir como base para experimentos académicos de retrieval visual sobre datasets como Flickr30k, tal como sugiere la model card, pero requeriría un entrenamiento completo.
- Podría utilizarse como plantilla de código para implementar arquitecturas ViT con atención dispersa y fusión por compuerta en proyectos de investigación.
- Podría emplearse como punto de partida para estudiar el efecto de la normalización por lotes en ViT, comparando con implementaciones estándar.
- Podría integrarse en un pipeline de fine-tuning para tareas específicas de búsqueda de imágenes, siempre que se entrene con datos suficientes.
- No es adecuado para ningún uso en producción o aplicación real sin un entrenamiento previo y una evaluación rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint de inicialización no ha sido entrenado ni evaluado.

## Requisitos de hardware

- Con solo 33.088 parámetros, el modelo cabe en cualquier hardware, incluso en CPU sin GPU.
- La VRAM estimada es despreciable: menos de 1 MB en precisión completa.
- Cualquier GPU consumer (GTX 1060, RTX 3060, etc.) es más que suficiente.
- Opciones de despliegue: dado que es una implementación personalizada en PyTorch, no se puede cargar directamente con vLLM, llama.cpp u Ollama. Requiere el script `train.py` o un adaptador manual.
- Latencia y throughput: no disponibles, pero al ser un modelo tan pequeño, la inferencia sería prácticamente instantánea en cualquier hardware moderno.

## Comparativa con modelos similares

No disponible. No existen modelos comparables con tan solo 33.088 parámetros y un checkpoint sin entrenar. Los ViT de referencia (como ViT-Tiny, con alrededor de 5 millones de parámetros) son órdenes de magnitud mayores y sí están preentrenados. Este modelo no puede compararse con alternativas reales de retrieval visual como CLIP o DINOv2, que tienen millones de parámetros y están entrenados con grandes corpus.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: los pesos son de inicialización y no producen representaciones útiles para retrieval.
- No ha sido auditado para robustez, equidad ni transferencia de dominio.
- La implementación es experimental y no compatible con las API estándar de HuggingFace sin un adaptador.
- No hay datos de rendimiento ni benchmarks publicados.
- La licencia Apache-2.0 permite uso comercial, pero el modelo en sí no sirve para producción sin entrenamiento.
- Al usar datasets externos (como Flickr30k), hay que revisar los términos de esos datos por separado, tal como advierte la model card.
- Riesgo de alucinación: no aplica al ser un modelo visual sin generación de texto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Dmsmirnov1124/retrieval-mini
- Perfil del autor: https://huggingface.co/Dmsmirnov1124
- Dataset asociado (fashion-corpus): https://huggingface.co/datasets/Dmsmirnov1124/fashion-corpus
