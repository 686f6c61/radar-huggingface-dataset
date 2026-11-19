# intel-ai/Qwen3.5-397B-A17B-FP8-4L

## Resumen

Qwen3.5-397B-A17B-FP8-4L es una publicacion de pesos en formato FP8 del modelo Qwen3.5-397B-A17B, una arquitectura Mixture of Experts (MoE) de la familia Qwen 3.5. El repositorio lo distribuye el usuario `intel-ai` en Hugging Face y emplea la arquitectura `qwen3_5_moe` con pesos en `safetensors` cuantizados a FP8. El nombre sugiere 397.000 millones de parametros totales y 17.000 millones de parametros activos por token, aunque el recuento real de parametros almacenados en safetensors es de 35.022.785.472 (35,0 mil millones), lo que apunta a una publicacion parcial o a un subconjunto de pesos (el sufijo `-4L` podria indicar un recorte de capas).

El modelo busca resolver la inferencia eficiente de un MoE de gran escala mediante cuantizacion FP8, reduciendo el peso en disco a 37,2 GB y permitiendo su despliegue en hardware con soporte de FP8 nativo. Es relevante para desarrolladores que quieran evaluar el comportamiento de la familia Qwen 3.5 en formato cuantizado, si bien la ficha carece de documentacion oficial: no se declaran licencia, idiomas, pipeline ni datos de entrenamiento.

La informacion disponible es muy limitada. El repositorio tiene 35 descargas y 0 likes, fue creado el 12 de noviembre de 2026 y actualizado el 19 de noviembre de 2026. No se han publicado resultados de benchmarks ni una model card descriptiva en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Mixture of Experts, transformer) |
| Parametros totales | 397B (segun nombre); 35.022.785.472 almacenados en safetensors |
| Parametros activos | 17B (segun nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (unico formato publicado en este repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

La arquitectura declarada en los tags es `qwen3_5_moe`, es decir, un transformer con capas Mixture of Experts, coherente con la nomenclatura `397B-A17B` (397.000 millones de parametros totales, 17.000 millones activos por token). El repositorio distribuye los pesos en FP8, lo que reduce el footprint a 37,2 GB. El sufijo `-4L` no esta documentado; podria referirse a un recorte de capas, a una variante de 4 capas o a otra modificacion estructural, pero no hay informacion que lo confirme.

No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). Tampoco se documenta si el proceso de cuantizacion FP8 fue realizado por Intel AI, si se aplico calibracion o si los pesos corresponden a una conversion directa desde BF16.

## Capacidades

- Generacion de texto y razonamiento: capacidades esperables de la familia Qwen 3.5, aunque no verificadas en la informacion disponible.
- Codigo y matematicas: no confirmado en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Evaluacion de la familia Qwen 3.5 en FP8: el repositorio permite probar un MoE de gran escala cuantizado en hardware con soporte FP8, midiendo calidad y throughput antes de comprometerse con el modelo completo.
- Investigacion sobre cuantizacion FP8 en MoE: util para estudiar la degradacion de calidad al pasar de BF16 a FP8 en capas expertas y densas.
- Despliegue en infraestructura con memoria limitada: los 37,2 GB de pesos permiten cargar el modelo en una unica GPU de 80 GB (A100/H100) con margen para KV cache, algo imposible con el modelo en BF16.
- Benchmarking interno de latencia: al ser un MoE con 17B activos, el coste por token es inferior al de un denso de 397B, lo que lo hace apto para pruebas de throughput en pipelines de inferencia.
- Fine-tuning o adaptacion con LoRA: si la licencia lo permite (no declarada), los pesos FP8 pueden servir de base para adaptadores sobre tareas especificas.
- Prototipado de asistentes conversacionales de contexto largo: pendiente de confirmar la ventana de contexto real, que no se documenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 37,2 GB solo para pesos; con overhead de runtime y KV cache, se recomienda un minimo de 48-80 GB.
- GPU recomendadas: H100 80 GB, A100 80 GB, L40S 48 GB (con margen ajustado), GPU con soporte FP8 nativo (Hopper o superior).
- Cabe en consumer GPU: no de forma holgada; una RTX 4090 (24 GB) no puede cargar los pesos completos. Seria necesario offloading a CPU/RAM o una cuantizacion adicional (no publicada en este repo).
- Opciones de despliegue: vLLM y TGI son las opciones mas realistas por soporte de FP8 y MoE; llama.cpp/Ollama requeririan conversion a GGUF, no disponible en este repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-397B-A17B-FP8-4L (este) | 397B (nominal) / 35,0B almacenados | 17B | no disponible | no disponible | safetensors FP8 |
| Qwen3.5-397B-A17B (original) | 397B | 17B | no disponible | no disponible | no disponible |
| Alternativas MoE de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas concretas (DeepSeek, Mixtral, etc.) sin inventar datos.

## Limitaciones y advertencias

- Model card practicamente vacia: sin licencia, idiomas, pipeline ni descripcion de entrenamiento; no apta para produccion sin verificacion previa.
- Discrepancia entre el nombre (397B) y los parametros almacenados (35,0B): el repositorio podria contener solo un subconjunto de pesos o una variante recortada (`-4L`), lo que invalidaria su uso como modelo completo.
- Cuantizacion FP8 sin documentar: se desconoce el metodo de calibracion y la posible degradacion de calidad frente a BF16.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados.
- Restricciones de licencia para uso comercial: desconocidas; no asumir permisos de uso comercial.
- Repositorio con 35 descargas y 0 likes: sin validacion comunitaria ni evidencia de uso en produccion.
- Compatibilidad de runtime no garantizada: requiere versiones de vLLM/TGI con soporte para `qwen3_5_moe` y FP8.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-FP8-4L
- Paper, blog, repositorio o demo oficiales: no disponibles en la informacion proporcionada.
