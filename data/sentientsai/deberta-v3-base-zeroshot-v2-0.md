# sentientsai/deberta-v3-base-zeroshot-v2.0

## Resumen

El modelo `sentientsai/deberta-v3-base-zeroshot-v2.0` es una distribucion en formato ONNX del modelo de clasificacion zero-shot de DeBERTa-v3-base publicado originalmente por Moritz Laurer (`MoritzLaurer/deberta-v3-base-zeroshot-v2.0`). Permite puntuar un texto contra etiquetas definidas por el usuario sin necesidad de entrenamiento adicional, es decir, clasificacion zero-shot y few-shot NLI. El autor de esta distribucion es SentientsAI, que lo integra como componente de su plugin "Text Core" para Unreal Engine.

La relevancia de esta version concreta no esta en el modelo en si (el original es bien conocido en la comunidad) sino en su empaquetado: pesos ONNX en fp32 y fp16 con hashes SHA-256 fijados en un catalogo firmado, pensados para ejecutarse en CPU, DirectML, TensorRT y HLSL dentro de un motor de videojuegos. El repositorio ocupa 1.9 GB y no registra descargas ni likes en el momento de la consulta.

La arquitectura subyacente es DeBERTa-v3-base, un transformer encoder con atencion disentangled y embedding de posiciones relativas, de aproximadamente 184 millones de parametros. Esta ficha se limita a lo documentado en la model card y en los metadatos del repositorio; los detalles de entrenamiento del modelo original no se reproducen aqui salvo como referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v3-base (transformer encoder, atencion disentangled) |
| Parametros totales | no disponible (el modelo base DeBERTa-v3-base tiene ~184 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (`model.onnx`) y fp16 (`model_fp16.onnx`) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es una exportacion ONNX de DeBERTa-v3-base afinado para clasificacion zero-shot mediante NLI (natural language inference). La model card indica que los ficheros `model.onnx` y `tokenizer.json` son los bytes originales del publicador (`MoritzLaurer/deberta-v3-base-zeroshot-v2.0`, commit `8e7e5af5983a`), mientras que `model_fp16.onnx` fue generado por el script `make_fp16.py` del lado Python de Sentients para reducir el peso a la mitad y adaptarlo a runtimes que requieren formas fijas.

No se proporcionan en la informacion disponible datos sobre el numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF o DPO. La model card solo describe el comportamiento funcional: puntuar un texto contra etiquetas arbitrarias sin entrenamiento, con un modelo "varias veces mas grande y mas lento" que la variante small del mismo catalogo. La innovacion destacable de este empaquetado es la fijacion por SHA-256 de cada fichero en un catalogo firmado, de modo que el plugin descarga por hash y rechaza cualquier byte que no coincida.

## Capacidades

- Clasificacion zero-shot de texto contra etiquetas definidas en tiempo de inferencia.
- Clasificacion few-shot NLI (el modelo original soporta esta modalidad; no confirmado explicitamente en esta model card).
- Puntuacion de similitud texto-etiqueta mediante formulacion como entailment.
- Ejecucion en CPU, DirectML, TensorRT y HLSL (este ultimo solo para el fichero fp32).
- Integracion con Unreal Engine a traves del selector `ETextModel::DebertaV3BaseZeroShot`, con entrada `CoreTextLabelsInput` y salida `CoreClassificationOutput`.
- Verificacion de integridad por hash SHA-256 en cada descarga.
- No se documentan capacidades de generacion, codigo, matematicas, vision, audio, tool calling ni agentes.

## Casos de uso

- Moderacion de contenido en un juego: clasificar mensajes de chat contra etiquetas como "insulto", "spam" o "contenido seguro" sin reentrenar, usando el fichero fp16 sobre DirectML en la GPU del jugador.
- Etiquetado dinamico de respuestas de NPC: puntuar las replicas generadas por un sistema de dialogo contra categorias configurables por el disenador de niveles, aprovechando que las etiquetas se definen en tiempo de inferencia.
- Enrutado de tickets en soporte: clasificar texto libre de usuario contra un conjunto de categorias que cambia por campana, sin necesidad de un modelo nuevo por cada taxonomia.
- Clasificacion de resenas o feedback de jugadores: agrupar comentarios en temas (rendimiento, bugs, balance, monetizacion) definidos a posteriori, con el modelo fp32 en CPU para pipelines por lotes.
- Deteccion de intencion en asistentes de voz o texto: mapear una frase a una de varias intenciones declaradas por el desarrollador, como paso previo a un sistema de reglas o a un LLM.
- Filtrado previo en pipelines de anotacion: preetiquetar grandes volumenes de texto con etiquetas provisionales para que anotadores humanos solo revisen, reduciendo coste por muestra.
- Clasificacion en el borde sin servidor: al ser un encoder de ~700 MiB en fp32 y ~353 MiB en fp16, puede ejecutarse en CPU o en GPU de consumo dentro de la propia aplicacion, sin llamadas de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por tamano de fichero, el modelo fp32 ocupa 704,3 MiB y el fp16 353,0 MiB en disco, a lo que hay que sumar el overhead de activaciones y del runtime ONNX.
- GPU recomendadas: no especificadas en la informacion. Los runtimes declarados son DirectML y TensorRT (fp16 y fp32) y HLSL (solo fp32); CPU tambien soportada.
- Cabe en GPU de consumo: si, por tamano de pesos, aunque el consumo real depende del runtime y de la longitud de secuencia.
- Opciones de despliegue: ONNX Runtime (CPU, DirectML, TensorRT), integracion nativa en Unreal Engine via el plugin Sentients Text Core. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son runtimes de generacion, no aplicables a este encoder).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| sentientsai/deberta-v3-base-zeroshot-v2.0 | no disponible (~184 M en el base) | no disponible | ONNX fp32/fp16 | MIT | Empaquetado para Unreal Engine, hashes fijados |
| MoritzLaurer/deberta-v3-base-zeroshot-v2.0 | no disponible (~184 M en el base) | no disponible | safetensors / PyTorch | MIT | Modelo original del que deriva este |
| MoritzLaurer/deberta-v3-small-zeroshot-v2.0 | no disponible | no disponible | safetensors / PyTorch | MIT | Variante small citada en la model card como mas rapida y menos precisa |
| facebook/bart-large-mnli | no disponible | no disponible | PyTorch | MIT | Alternativa clasica de zero-shot NLI; no comparada en la informacion disponible |

Los datos de rendimiento comparativo entre estas alternativas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Es un encoder de clasificacion, no un modelo generativo: no produce texto, codigo ni respuestas.
- La calidad del zero-shot depende fuertemente de la formulacion de las etiquetas; etiquetas ambiguas o solapadas degradan la puntuacion.
- No se documentan los idiomas soportados; el modelo original esta orientado principalmente a ingles, pero este dato no se confirma en la model card.
- Riesgo de alucinacion en sentido estricto no aplica (no genera), pero si de falsos positivos y calibracion deficiente en dominios alejados del entrenamiento.
- La licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo original y de los datos de entrenamiento subyacentes.
- El fichero fp16 solo es compatible con DirectML y TensorRT; para HLSL o CPU hay que usar el fp32.
- El repositorio no registra descargas ni likes, y su fecha de creacion (2026-11-20) es posterior a la de esta ficha; tratar como distribucion nueva y poco validada por la comunidad.
- El modelo esta atado a un catalogo firmado: modificar o regenerar los ficheros rompe la verificacion por SHA-256 del plugin.

## Enlaces

- Hugging Face: https://huggingface.co/sentientsai/deberta-v3-base-zeroshot-v2.0
- Modelo original: https://huggingface.co/MoritzLaurer/deberta-v3-base-zeroshot-v2.0
- Catalogo firmado: https://huggingface.co/sentientsai/sentients-catalog
