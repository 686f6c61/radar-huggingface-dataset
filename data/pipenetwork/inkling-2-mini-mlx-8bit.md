# pipenetwork/Inkling-2-Mini-MLX-8bit

## Resumen

Inkling-2-Mini-MLX-8bit es una conversión al formato MLX del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario pipenetwork. Se trata de un modelo multimodal (image-text-to-text) con arquitectura Mixture of Experts (MoE), identificado en los tags como `inkling2_loop`, y con 26.388.559.360 parámetros totales según los pesos en safetensors. La conversión está pensada para ejecución en hardware Apple Silicon mediante la librería MLX, no para GPUs NVIDIA ni para despliegues convencionales con vLLM o TGI.

La relevancia de esta ficha es doble. Por un lado, documenta una variante de cuantización mixta poco habitual: los expertos enrutados conservan los pesos NVFP4 nativos del checkpoint original, mientras que las capas de atención, embeddings y densas se cuantizan a 8 bits con cuantización afín y tamaño de grupo 64. Por otro, advierte de una dependencia crítica de versión: el modelo requiere una pull request abierta en mlx-lm (ml-explore/mlx-lm#2086) y no carga con las versiones publicadas hasta 0.32.2.

El repositorio ocupa 18,1 GB, la licencia es Apache 2.0 heredada del modelo base y el pipeline declarado es image-text-to-text. No se dispone de información sobre idiomas soportados, datos de entrenamiento ni resultados de benchmarks en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), tag `inkling2_loop`; transformer multimodal con torre de visión |
| Parametros totales | 26.388.559.360 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: expertos enrutados en NVFP4 nativo; atención, embeddings y capas densas en 8 bits afín con group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible confirma que el modelo base es un MoE con un componente multimodal de visión (pipeline image-text-to-text) y que la variante aquí descrita mantiene la estructura del checkpoint original de thinkingmachines. El tag `inkling2_loop` sugiere un diseño de bucle o iteración interna, aunque la model card no detalla su funcionamiento. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias.

La innovación técnica documentada en esta variante es exclusivamente de cuantización y empaquetado: la conversión se realizó con mlx-lm a partir de la pull request ml-explore/mlx-lm#2086, y aplica un esquema híbrido que preserva los expertos en NVFP4 mientras cuantiza a 8 bits las capas de atención, embeddings y densas. Esta decisión reduce el tamaño del repositorio a 18,1 GB, pero introduce una dependencia estricta de una versión no publicada de mlx-lm.

## Capacidades

- Generación de texto conversacional, según el tag `conversational` del repositorio.
- Procesamiento de imagen y texto combinados (image-text-to-text), con torre de visión incluida en el checkpoint, aunque el autor indica que la torre de visión no fue probada.
- Ejecución en hardware Apple Silicon mediante MLX.
- Cuantización mixta que permite cargar un modelo de más de 26.000 millones de parámetros en memoria unificada de un Mac.
- Capacidades de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Prototipado local en Mac: desarrolladores con Apple Silicon pueden ejecutar un MoE multimodal de 26.000 millones de parámetros sin GPU dedicada, usando memoria unificada y la CLI de mlx-lm con el comando `python -m mlx_lm generate`.
- Evaluación de cuantización híbrida NVFP4/8-bit: investigadores interesados en medir la pérdida de calidad de preservar expertos en 4 bits frente a cuantizar todo el modelo pueden usar esta variante como referencia reproducible.
- Experimentación con modelos multimodales en entornos sin CUDA: el pipeline image-text-to-text permite probar flujos de imagen y texto en portátiles y equipos de sobremesa Apple, aunque la torre de visión no esté validada por el autor.
- Investigación sobre arquitecturas MoE con bucle interno: el tag `inkling2_loop` y la estructura de expertos enrutados hacen de este checkpoint un objeto de estudio para analizar el comportamiento de modelos con iteración interna.
- Desarrollo de asistentes conversacionales offline: al ejecutarse localmente vía MLX, el modelo puede integrarse en aplicaciones de escritorio que requieran privacidad de datos sin enviar prompts a la nube.
- Pruebas de compatibilidad de tooling MLX: útil para validar la pull request ml-explore/mlx-lm#2086 y reportar problemas de carga, generación o cuantización antes de su merge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Memoria: el repositorio pesa 18,1 GB, por lo que se necesita al menos esa cantidad de memoria unificada libre, más overhead de ejecución; se recomienda un Mac con 32 GB o más para margen operativo.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y variantes Pro, Max y Ultra). No está pensado para GPUs NVIDIA ni AMD.
- GPU dedicadas: no aplica; MLX no soporta CUDA. Para A100, H100 o RTX 4090 habría que usar el checkpoint original en otro formato.
- Despliegue: exclusivamente mediante mlx-lm instalado desde la pull request `git+https://github.com/ml-explore/mlx-lm.git@refs/pull/2086/head`. Las versiones publicadas hasta 0.32.2 no cargan el modelo.
- Alternativas de serving: vLLM, llama.cpp, Ollama y TGI no son compatibles con este formato MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| pipenetwork/Inkling-2-Mini-MLX-8bit | 26.388 M | no disponible | MLX safetensors | Apache 2.0 | Cuantización mixta NVFP4/8-bit, solo Apple Silicon |
| thinkingmachines/Inkling-2-Mini | no disponible | no disponible | no disponible | Apache 2.0 (heredada) | Checkpoint original del que deriva esta conversión |
| Otros MoE multimodales de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Dependencia de una pull request no fusionada: el modelo no carga con mlx-lm 0.32.2 ni versiones anteriores; hay que instalar desde la rama de la PR #2086, lo que implica riesgo de cambios o ruptura.
- Torre de visión no validada: el autor solo probó la generación de texto; el pipeline image-text-to-text puede fallar o dar resultados incorrectos.
- Exclusivo de Apple Silicon: no es desplegable en GPUs NVIDIA, AMD ni en infraestructura cloud estándar basada en CUDA.
- Cuantización mixta no evaluada: no hay métricas publicadas sobre la degradación de calidad respecto al checkpoint original.
- Idiomas, contexto y datos de entrenamiento no documentados: dificulta evaluar idoneidad para producción multilingüe o tareas de contexto largo.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; aplican los del modelo base, que tampoco detalla sus limitaciones.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini por si añade restricciones adicionales.
- Repositorio con 0 descargas y 1 like: ecosistema mínimo, sin validación comunitaria ni informes de errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pipenetwork/Inkling-2-Mini-MLX-8bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Pull request de soporte en mlx-lm: https://github.com/ml-explore/mlx-lm/pull/2086
- Repositorio mlx-lm: https://github.com/ml-explore/mlx-lm
- Librería MLX: https://github.com/ml-explore/mlx
