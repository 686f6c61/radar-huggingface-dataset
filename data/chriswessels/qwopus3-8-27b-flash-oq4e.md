# chriswessels/Qwopus3.8-27B-Flash-oQ4e

## Resumen

Qwopus3.8-27B-Flash-oQ4e es una cuantización del modelo Qwopus3.8-27B-Flash, publicada por el usuario chriswessels en Hugging Face. La cuantización se ha realizado con oQ (oMLX v0.6.4), una herramienta de cuantización de precisión mixta, y el modelo resultante se distribuye en formato MLX safetensors. El modelo base se identifica como de tipo `qwen3_5` y cuenta con aproximadamente 27.356 millones de parámetros.

Esta ficha se centra exclusivamente en la versión cuantizada a 4 bits con group size 64. La información disponible sobre el modelo original, sus capacidades, datos de entrenamiento y rendimiento es limitada, por lo que muchos apartados de esta ficha indican "no disponible". El repositorio tiene un tamaño de 16,7 GB y fue actualizado el 5 de septiembre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (tipo de modelo según la model card; no se especifica la arquitectura interna) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (group size 64) con oQ / oMLX |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base Qwopus3.8-27B-Flash. La model card únicamente indica que el modelo es de tipo `qwen3_5`, sin especificar si se trata de un transformer denso, un modelo de mezcla de expertos (MoE) o una arquitectura híbrida. Tampoco se han publicado datos sobre los datos de entrenamiento, el número de tokens, la composición del dataset o si se aplicaron técnicas como RLHF o DPO.

La única innovación técnica documentada en esta ficha es la cuantización realizada con oQ, que aplica precisión mixta con un tamaño de grupo de 64. El autor indica en la model card que esta versión sustituye a una anterior publicada el mismo día, por lo que es necesario re-descargar los pesos si se obtuvo el modelo antes de esa fecha.

## Capacidades

No se han publicado especificaciones sobre las capacidades del modelo en la información disponible. Al tratarse de una cuantización, las capacidades del modelo original son desconocidas en esta ficha. No hay datos sobre generación de texto, razonamiento, soporte de tool calling, capacidades multilingües, visión, audio ni modos especiales de razonamiento.

## Casos de uso

No se dispone de documentación oficial que detalle casos de uso concretos para este modelo. Al no conocer las capacidades reales del modelo base, no es posible recomendar aplicaciones específicas con garantías. Cualquier uso en producción debería basarse en una evaluación previa de las capacidades del modelo original Qwopus3.8-27B-Flash, no disponible en esta ficha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni de ningún otro estándar de evaluación. Tampoco se han publicado comparativas de rendimiento con otros modelos de la misma categoría.

## Requisitos de hardware

- Formato MLX: el modelo está diseñado para ejecutarse en Apple Silicon mediante la librería MLX, no para GPU CUDA.
- Memoria necesaria: el repositorio ocupa 16,7 GB, por lo que se requiere al menos esa cantidad de memoria unificada para cargar los pesos en RAM.
- GPU recomendadas: no aplica, al ser un formato MLX exclusivo para Apple Silicon. No se dispone de requisitos para GPUs NVIDIA o AMD.
- Despliegue: la única plataforma de inferencia identificada en la búsqueda es FriendliAI, que ofrece una API para el modelo original Qwopus3.8-27B-Flash. No se ha confirmado que esta API acepte la versión cuantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El único modelo relacionado identificado es la versión cuantizada a 8 bits, `chriswessels/Qwopus3.8-27B-Flash-oQ8e`, pero no se han publicado especificaciones de rendimiento ni benchmarks para ninguno de los dos. El modelo original Qwopus3.8-27B-Flash aparece en la búsqueda web, pero sin datos técnicos comparables.

## Limitaciones y advertencias

- Licencia no especificada: la model card no indica licencia, lo que puede implicar restricciones desconocidas para uso comercial.
- Cuantización de terceros: al ser una cuantización publicada por un usuario no afiliado al desarrollador del modelo original, no hay garantías de que los pesos sean correctos o de que el rendimiento se mantenga.
- Sin documentación de capacidades: no se han publicado datos sobre sesgos, riesgo de alucinación, limitaciones de idioma o restricciones de contexto.
- Necesidad de re-descarga: la model card advierte que esta versión sustituye a una anterior y que se debe re-descargar si se obtuvo antes del 5 de septiembre de 2026.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chriswessels/Qwopus3.8-27B-Flash-oQ4e
- Herramienta de cuantización oQ: https://github.com/jundot/omlx
- Página del modelo original en FriendliAI: https://friendli.ai/models/Jackrong/Qwopus3.8-27B-Flash
