# letuan/Huihui-Qwen3.6-35B-A3B-abliterated-FP8

## Resumen

Huihui-Qwen3.6-35B-A3B-abliterated-FP8 es una variante "abliterated" (sin rechazos) del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicada por el usuario letuan en Hugging Face. El modelo base es un transformer de tipo Mixture of Experts (MoE) de Qwen con 35.951.822.704 parametros totales y una arquitectura identificada como `qwen3_5_moe`, con pipeline `image-text-to-text`, lo que indica capacidades de vision y lenguaje. Esta version concreta se distribuye en formato FP8 mediante `compressed-tensors` y ha sido sometida a un proceso de abliteration para eliminar los mecanismos de rechazo del modelo original.

La relevancia de esta ficha radica en dos factores. Primero, se trata de un modelo MoE multimodal de gran tamano (casi 36.000 millones de parametros) bajo licencia Apache 2.0, lo que permite uso comercial amplio. Segundo, la abliteration elimina los filtros de seguridad, lo que convierte al modelo en una herramienta de investigacion controlada y no en un componente apto para produccion orientada al publico. El autor original de la tecnica de abliteration es huihui-ai, y esta publicacion de letuan es una conversion a FP8 de esa variante.

El repositorio tiene un tamano de 38,4 GB, coherente con pesos en FP8 para un modelo de ~36B parametros totales. No se dispone de informacion sobre parametros activos, longitud de contexto, idiomas soportados ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); el modelo base admite otras cuantizaciones, no detalladas aqui |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8, compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B emplea una arquitectura Mixture of Experts con atencion transformer y capacidad multimodal (procesa imagen y texto como entrada). El identificador de arquitectura en el repositorio es `qwen3_5_moe`, y el pipeline declarado es `image-text-to-text`. El modelo derivado conserva esa arquitectura y solo modifica los pesos mediante abliteration, una tecnica que identifica y suprime las direcciones de activacion asociadas a la generacion de rechazos, sin reentrenamiento supervisado ni RLHF adicional. La implementacion de referencia citada por el autor es `remove-refusals-with-transformers`, descrita como una prueba de concepto "cruda" que no depende de TransformerLens.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base utilizo RLHF o DPO. Tampoco se documentan innovaciones tecnicas especificas del modelo base en la informacion proporcionada. La conversion a FP8 se realiza con la libreria `compressed-tensors`, lo que reduce el peso del repositorio a 38,4 GB y facilita el despliegue en hardware con memoria limitada, a costa de una posible perdida de precision frente a BF16.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Procesamiento de entrada multimodal imagen-texto (pipeline `image-text-to-text`).
- Razonamiento y generacion de codigo, heredados del modelo base Qwen3.6-35B-A3B (no verificados con benchmarks en esta publicacion).
- Capacidad de operar sin rechazos ante peticiones que el modelo original declinaria, como consecuencia directa de la abliteration.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito: no disponible.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags), lo que sugiere despliegue en infraestructura de inferencia gestionada.

## Casos de uso

- Investigacion sobre seguridad y alineacion: el modelo permite estudiar como la abliteration altera la distribucion de respuestas y que direcciones de activacion codifican los rechazos, comparando directamente con el modelo base sin modificar.
- Red teaming controlado: util para generar respuestas que un modelo alineado bloquearia y evaluar la robustez de filtros externos, clasificadores de contenido o capas de moderacion en un entorno aislado.
- Analisis de sesgos y contenido sensible: al eliminar los rechazos, facilita la recoleccion de respuestas sobre temas controvertidos para auditorias eticas, siempre con revision humana.
- Evaluacion de cuantizacion FP8: sirve como banco de pruebas para medir la degradacion de calidad de un MoE multimodal de ~36B al pasar de BF16 a FP8 con `compressed-tensors`.
- Experimentacion multimodal en laboratorio: permite probar pipelines image-text-to-text en tareas de descripcion, extraccion de informacion de imagenes o VQA en entornos de investigacion, sin las restricciones de seguridad del modelo original.
- Fine-tuning posterior en dominios especializados: la licencia Apache 2.0 y el formato safetensors facilitan adaptaciones con LoRA o QLoRA sobre el modelo FP8 para tareas de nicho en investigación.
- Despliegue en infraestructura con memoria limitada: el formato FP8 y la compatibilidad con endpoints permiten servir el modelo en GPUs de 48-80 GB, algo inviable con los pesos completos en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 38,4 GB en FP8, por lo que se necesita al menos ~40 GB de VRAM para cargar los pesos, mas overhead de activaciones y cache KV. Con contexto largo, el requisito puede superar los 48 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB o A6000 48 GB para FP8 nativo. Una RTX 4090 (24 GB) no puede cargar el modelo completo en FP8 sin offloading.
- Cabe en consumer GPU: no de forma directa. Requiere offloading a CPU/RAM o cuantizaciones adicionales (GGUF de menor precision) no incluidas en este repositorio.
- Opciones de despliegue: `transformers` (libreria declarada), `compressed-tensors` para carga FP8, y `ollama` segun la model card del autor original (`huihui_ai/qwen3.6-abliterated:35b`). vLLM y TGI no estan confirmados para esta variante FP8 concreta.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| letuan/Huihui-Qwen3.6-35B-A3B-abliterated-FP8 | 35,95 B (MoE) | no disponible | Apache 2.0 | safetensors FP8 | Variante abliterated multimodal |
| Qwen/Qwen3.6-35B-A3B (base) | 35,95 B (MoE) | no disponible | Apache 2.0 | safetensors | Modelo original con alineacion de seguridad |
| huihui-ai/Huihui-Qwen3.6-35B-A3B-abliterated | 35,95 B (MoE) | no disponible | Apache 2.0 | safetensors (BF16 presumiblemente) | Abliterated original, sin cuantizar a FP8 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. La diferencia principal entre las tres es el nivel de cuantizacion y la presencia o ausencia de abliteration, no la arquitectura.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: la abliteration elimina los rechazos, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado. El propio autor advierte que no es apto para audiencias publicas ni menores.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad factual para esta variante, y la supresion de direcciones de activacion puede afectar a la calibracion del modelo.
- Responsabilidad legal y etica: el usuario asume toda la responsabilidad sobre el contenido generado. El autor declina responsabilidad por consecuencias derivadas del uso.
- Uso recomendado solo en investigacion y entornos controlados: el autor desaconseja explicitamente el uso directo en produccion o en aplicaciones comerciales de cara al publico.
- Perdida de precision por FP8: la cuantizacion a 8 bits puede degradar ligeramente la calidad respecto al modelo en BF16, especialmente en tareas de razonamiento complejo o vision.
- Idiomas y contexto no documentados: se desconoce la cobertura linguistica real y la ventana de contexto maxima soportada en esta conversion.
- Sin garantias de soporte: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria ni benchmarks publicados.
- Licencia Apache 2.0: permite uso comercial del codigo y pesos, pero las restricciones eticas y legales sobre el contenido generado siguen aplicando segun la jurisdiccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/letuan/Huihui-Qwen3.6-35B-A3B-abliterated-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Repositorio de la tecnica de abliteration: https://github.com/Sumandora/remove-refusals-with-transformers
- Version Ollama del modelo abliterated: https://ollama.com/huihui_ai/qwen3.6-abliterated:35b
- Repositorio Ollama: https://github.com/ollama/ollama/releases
