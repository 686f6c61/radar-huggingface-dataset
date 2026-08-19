# FAIRC/token-averaging-model1_125m

## Resumen

El modelo `FAIRC/token-averaging-model1_125m` es un checkpoint de investigación publicado por el grupo FAIRC como parte de un proyecto experimental sobre la técnica de *token averaging* (promediado de tokens). Se trata de un modelo de lenguaje de 125 millones de parámetros con una arquitectura transformer de 12 capas, 12 cabezas de atención y una dimensión de modelo de 768, entrenado con una ventana de contexto de 1024 tokens. El repositorio contiene únicamente el volcado de un checkpoint en formato PyTorch (`.pt`), junto con un registro de pérdidas, y no incluye pesos compatibles con la librería `transformers` de Hugging Face.

Este modelo no está orientado a su uso en producción, sino que sirve como artefacto para reproducir los experimentos del proyecto de *token averaging*. Su relevancia radica en ser una pieza de un estudio académico sobre métodos de agregación de representaciones de tokens, aunque no se documentan ni las capacidades finales ni los resultados obtenidos. La ausencia de licencia, idiomas soportados o documentación de rendimiento limita su aplicabilidad práctica fuera del ámbito de la investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (12 capas, 12 cabezas, d_model=768) |
| Parametros totales | 123.532.032 (aproximadamente 123,5 M) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (state_dict en `.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer estándar con 12 capas, 12 cabezas de atención y dimensión de modelo 768. La configuración incluye `tie_embeddings=true`, lo que indica que las capas de embedding y de salida comparten pesos. El parámetro `averaging_k=1` sugiere que el método de *token averaging* emplea una ventana de promediado de tamaño 1, aunque no se detalla el mecanismo exacto. El entrenamiento se planificó para un total de 2.500 millones de tokens (`target_tokens`), con una tasa de aprendizaje de 0,00016 y 2000 pasos de calentamiento. No se proporciona información sobre el dataset utilizado, el proceso de entrenamiento (si hubo RLHF, DPO, etc.) ni otras innovaciones técnicas más allá del propio método de promediado.

## Capacidades

- No se han documentado capacidades específicas en la información disponible.
- El modelo es un transformer de lenguaje de 125 M de parámetros, por lo que podría realizar tareas básicas de generación de texto, pero no hay confirmación ni ejemplos.
- No se indica soporte para tool calling, agentes, razonamiento multi-paso, visión, audio ni otras modalidades.
- No se especifican idiomas soportados ni capacidades multilingües.

## Casos de uso

No se ha documentado ningún caso de uso concreto en la información proporcionada. Al tratarse de un checkpoint de investigación sin documentación de aplicaciones prácticas, no es posible listar escenarios de uso realistas. Se recomienda consultar el repositorio fuente del proyecto para obtener más contexto sobre los objetivos del estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (el formato `.pt` no es directamente utilizable con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoría (125 M de parámetros con *token averaging*) en la información proporcionada.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, alucinaciones o limitaciones de contexto o idioma.
- El checkpoint no es compatible con la librería `transformers`; requiere reconstruir la arquitectura desde `config.json` y cargar el `state_dict` manualmente.
- No se especifica licencia, por lo que no está claro si su uso comercial está permitido.
- El modelo es un artefacto de investigación y no debe utilizarse en entornos de producción sin una evaluación adicional.

## Enlaces

- [HuggingFace - FAIRC/token-averaging-model1_125m](https://huggingface.co/FAIRC/token-averaging-model1_125m)
