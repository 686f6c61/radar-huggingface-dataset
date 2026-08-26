# lucaschroeder/mixer-retrieval-baseline

## Resumen

Este repositorio contiene un prototipo de investigación denominado "Mixer for Retrieval", desarrollado por lucaschroeder. Se trata de una implementación de un modelo basado en arquitectura Mixer (una alternativa a los transformers) orientado a tareas de retrieval o recuperación de información. El checkpoint incluido tiene únicamente 24.832 parámetros, lo que lo convierte en un modelo extremadamente pequeño, pensado para pruebas de humo y experimentación académica, no para uso en producción. Su relevancia radica en explorar arquitecturas alternativas a los transformers para retrieval, como se documenta en el paper "Masked Mixers for Language Generation and Retrieval" (arXiv:2409.01482).

El modelo está diseñado con atención flash, fusión mediante concat mlp, activación approx gelu y normalización instancenorm. No se ha entrenado: el checkpoint es solo un punto de partida para inicializar pesos. La licencia es BSD-3-Clause, lo que permite uso comercial con atribución. No se reclama ningún benchmark en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixer (con atención flash) |
| Parametros totales | 24.832 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa una arquitectura Mixer, que sustituye la atención tradicional por operaciones de mezcla, aunque aquí se indica que usa atención flash. La fusión se realiza mediante concat mlp, la activación es approx gelu y la normalización es instancenorm. Según el paper asociado, los masked mixers pueden ser más eficientes que los transformers para retrieval, aunque este repositorio no presenta resultados entrenados.

El checkpoint incluido (model.safetensors) es un checkpoint de inicialización válido para pruebas de humo, no un modelo entrenado. No se ha realizado entrenamiento con datos reales. La configuración por defecto usa rmsprop con schedule step, pero son valores iniciales del script, no evidencia de una ejecución completada. El autor recomienda, para una evaluación significativa, entrenar todas las líneas base con la misma exposición a datos, presupuesto de ajuste y semillas aleatorias.

## Capacidades

- Diseñado para tareas de retrieval (búsqueda de información), aunque sin entrenamiento no tiene capacidades demostradas.
- Implementa una arquitectura Mixer con atención flash, lo que podría ofrecer ventajas en eficiencia frente a transformers.
- Incluye un script pipeline.py con un ejemplo ejecutable de smoke test.
- No soporta tool calling, agentes, ni razonamiento multi-paso (no está entrenado).
- No hay información sobre capacidades multilingües.

## Casos de uso

Dado que es un prototipo de investigación sin entrenamiento, los casos de uso son principalmente académicos y de desarrollo:

- Investigación en arquitecturas alternativas a transformers para retrieval: el modelo sirve como base para experimentar con masked mixers y comparar su rendimiento con transformers en tareas como Flickr30k.
- Pruebas de humo y validación de pipelines: el checkpoint de inicialización permite verificar que el código funciona correctamente antes de entrenar.
- Desarrollo de adaptadores para carga automática: al ser una implementación personalizada, requiere un adaptador explícito para usar APIs genéricas.
- Estudio de eficiencia de entrenamiento: el paper asociado sugiere que los masked mixers son igual de eficientes que los transformers para entrenamiento de lenguaje causal, lo que puede explorarse con este código.
- Experimentación con normalización instancenorm y activación approx gelu en contextos de retrieval.
- Base para futuros entrenamientos con datasets como Flickr30k, siguiendo las recomendaciones de evaluación del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ningún benchmark en este repositorio. El checkpoint es de inicialización, no entrenado.

## Requisitos de hardware

- Con solo 24.832 parámetros, el modelo cabe en cualquier GPU, incluso en CPU.
- VRAM estimada: menos de 1 GB (probablemente menos de 100 MB).
- GPU recomendadas: cualquiera, incluso integradas.
- Opciones de despliegue: al ser un script personalizado, no es compatible directamente con vLLM, llama.cpp u Ollama. Requiere ejecutar pipeline.py.
- Latencia y throughput: no disponibles, pero al ser tan pequeño, la inferencia sería prácticamente instantánea.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de retrieval de tamaño similar. El paper asociado compara masked mixers con transformers, pero no hay datos específicos de este checkpoint. Se puede mencionar que, en el paper, un pequeño masked mixer supera a un modelo transformer grande de retrieval, pero eso no aplica a este checkpoint concreto.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: es solo un punto de inicialización, no un modelo funcional.
- No ha sido auditado para robustez, equidad ni transferencia de dominio.
- No se han verificado capacidades de retrieval reales.
- La implementación es personalizada y requiere un adaptador para APIs genéricas.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto.
- La licencia BSD-3-Clause permite uso comercial, pero se deben revisar los términos de los datasets externos si se usan.

## Enlaces

- HuggingFace: https://huggingface.co/lucaschroeder/mixer-retrieval-baseline
- Paper arXiv (HTML): https://arxiv.org/html/2409.01482v1
- Paper arXiv (abstract): https://arxiv.org/abs/2409.01482
- Semantic Scholar: https://www.semanticscholar.org/paper/Masked-Mixers-for-Language-Generation-and-Retrieval-Badger/63da35140c39a1669f3c378826fb1d68964b9a5d
