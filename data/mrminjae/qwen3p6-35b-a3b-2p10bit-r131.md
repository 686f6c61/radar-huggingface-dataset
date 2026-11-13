# mrminjae/qwen3p6-35b-a3b-2p10bit-r131

## Resumen

`mrminjae/qwen3p6-35b-a3b-2p10bit-r131` es un checkpoint de investigacion derivado de `Qwen/Qwen3.6-35B-A3B`, un modelo Mixture-of-Experts (MoE) de Qwen con 35.107.181.936 parametros totales. El autor, `mrminjae`, ha aplicado una cuantizacion selectiva: los expertos enrutados se almacenan con una media de 2,10 bits, mientras que el resto de pesos permanece en BF16. Los pesos se guardan ya dequantizados en tensores BF16, de modo que cargan con `transformers` y vLLM estandar sin necesidad de kernels de cuantizacion especiales.

El modelo mantiene la modalidad image-text-to-text del modelo base (etiqueta `image-text-to-text` y arquitectura `qwen3_5_moe`), por lo que hereda capacidades multimodales ademas de generacion de texto. El repositorio ocupa 70,2 GB y no registra descargas ni likes en el momento de la consulta, lo que es coherente con su naturaleza de checkpoint interno de investigacion.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de compresion agresiva (2,10 bits medios en los expertos) sobre un MoE de 35B; por otro, advierte de que se trata de un artefacto de investigacion sin model card completa, sin licencia declarada de forma explicita y sin benchmarks publicados. No es un modelo recomendado para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen3_5_moe` (Mixture-of-Experts, transformer) |
| Parametros totales | 35.107.181.936 (35,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repo; el autor indica que sigue la del modelo base |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia Qwen 3.5/3.6, con arquitectura identificada como `qwen3_5_moe` y pipeline multimodal `image-text-to-text`. El checkpoint `r131` no reentrena el modelo: aplica una cuantizacion post-entrenamiento sobre los expertos enrutados, que quedan representados con una media de 2,10 bits. El resto de los pesos (atencion, embeddings, capas densas, router) se conserva en BF16. La decision de dequantizar a BF16 antes de publicar implica que el ahorro de memoria en disco y en VRAM no es el de una cuantizacion de 2 bits real, sino el de un modelo BF16 cuyo contenido numerico ha sido comprimido y reconstruido; el repositorio pesa 70,2 GB, consistente con pesos BF16 de 35,1B parametros.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo base, la composicion de su dataset ni si hubo fases de RLHF o DPO. El autor no documenta la metodologia exacta de cuantizacion (algoritmo, calibracion, granularidad por experto) mas alla de la cifra media de 2,10 bits y del identificador interno `r131`.

## Capacidades

- Generacion de texto conversacional y de proposito general, heredada del modelo base Qwen3.6-35B-A3B.
- Procesamiento de imagen y texto combinados (`image-text-to-text`), segun la etiqueta del pipeline del modelo base.
- Razonamiento multi-paso presumiblemente soportado por el modelo base, aunque no verificado en este checkpoint.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere despliegue en infraestructuras tipo Inference Endpoints.
- Soporte de tool calling / function calling: no disponible de forma explicita en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repo no declara idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigacion sobre cuantizacion extrema de MoE: el checkpoint sirve para estudiar como afecta una media de 2,10 bits en los expertos enrutados a la calidad de salida frente al modelo base en BF16, midiendo degradacion por tarea.
- Evaluacion comparativa de tecnicas de compresion: util como punto de referencia frente a cuantizaciones de 4 u 8 bits del mismo Qwen3.6-35B-A3B, con el mismo harness de evaluacion.
- Prototipado de pipelines multimodales en entornos con `transformers` o vLLM estandar: al cargar como BF16, no requiere kernels personalizados y simplifica la integracion inicial.
- Pruebas de regresion de infraestructura: sirve para validar que un stack de despliegue (vLLM, TGI, endpoints) acepta un MoE de 35B con pesos BF16 de 70 GB antes de invertir en el modelo completo.
- Analisis de sensibilidad por experto: al conocerse la media de bits de los expertos enrutados, se puede instrumentar el router y correlacionar que expertos se activan mas con la calidad observada.
- Docencia y divulgacion: ejemplo real de cuantizacion selectiva sobre un MoE multimodal, con tamanos y cifras concretas para explicar el coste de la compresion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 70,2 GB en safetensors BF16; la VRAM necesaria para inferencia es del orden de la del modelo base en BF16, ya que los pesos se cargan dequantizados.
- Para 35,1B parametros en BF16 se requiere aproximadamente 70 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, un nodo con 80 GB (A100 80GB, H100 80GB) es el minimo razonable para una sola GPU, y se recomienda multi-GPU para contexto largo.
- No cabe en GPUs de consumo (RTX 4090 24GB, RTX 3090 24GB) en BF16; requeriria cuantizacion adicional en el momento de la carga o descarga por capas.
- Opciones de despliegue: `transformers` (declarado por el autor) y vLLM (mencionado como compatible); TGI, llama.cpp u Ollama no estan confirmados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `mrminjae/qwen3p6-35b-a3b-2p10bit-r131` | 35,1B totales, activos no disponibles | no disponible | no disponible (sigue la del base) | Hugging Face, 0 descargas | Checkpoint de investigacion, expertos a 2,10 bits |
| `Qwen/Qwen3.6-35B-A3B` (base) | 35,1B totales, activos no disponibles | no disponible | la del modelo base Qwen | Hugging Face | Referencia en BF16 sin compresion |
| Otros checkpoints cuantizados del mismo base | 35,1B | no disponible | segun autor | Hugging Face | No se dispone de datos concretos para comparar |

No se dispone de informacion suficiente para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Checkpoint de investigacion interna (`internal research checkpoint`): no es una release estable ni validada para produccion.
- Cuantizacion agresiva a 2,10 bits medios en los expertos enrutados: es esperable degradacion de calidad frente al modelo base, aunque no se han publicado mediciones.
- Los pesos se almacenan dequantizados en BF16, por lo que el beneficio de memoria es limitado en inferencia; el ahorro no equivale al de una cuantizacion de 2 bits real.
- Licencia no declarada en el repositorio; el autor remite a la licencia del modelo base, que debe verificarse antes de cualquier uso comercial.
- Idiomas soportados no documentados; no se puede asumir cobertura multilingue sin evaluacion.
- Longitud de contexto no documentada.
- Riesgo de alucinacion y sesgos: no evaluados en este checkpoint; deben medirse antes de cualquier despliegue.
- Sin descargas ni likes: ausencia de validacion comunitaria.
- No usar en produccion sin una evaluacion propia frente al modelo base en las tareas objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r131
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
