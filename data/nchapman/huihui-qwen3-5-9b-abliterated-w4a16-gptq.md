# nchapman/Huihui-Qwen3.5-9B-abliterated-W4A16-GPTQ

## Resumen

`nchapman/Huihui-Qwen3.5-9B-abliterated-W4A16-GPTQ` es una cuantización INT4 (W4A16) en formato GPTQ del modelo `huihui-ai/Huihui-Qwen3.5-9B-abliterated`, una variante "abliterated" de Qwen3.5 de 9B parámetros en la que se ha eliminado la dirección de rechazo del espacio de pesos. El resultado es un modelo multimodal (pipeline `image-text-to-text`) de 9.409.813.744 parámetros que ocupa unos 9,1 GB en disco, frente a los aproximadamente 19 GB que exigiría la versión en BF16.

La pieza la publica nchapman, no el autor original del modelo, y está empaquetada específicamente para vLLM mediante `compressed-tensors`: pesos del cuerpo del transformer en INT4 con activaciones en BF16, mientras que la torre de visión, la cabeza MTP, las proyecciones de atención lineal y el `lm_head` se mantienen en BF16 para preservar precisión en los puntos sensibles. La calibración se hizo con 999 muestras extraídas de `nvidia/Nemotron-Cascade-2-SFT-Data` respetando las proporciones originales del dataset, con las filas exactas fijadas en un dataset aparte.

Su relevancia es práctica: permite desplegar un modelo de 9B con visión, modo thinking y licencia Apache-2.0 en una única GPU de 24 GB (o ajustadamente en 16 GB) sin recurrir a conversiones GGUF, manteniendo el flujo nativo de transformers/vLLM. Ahora bien, es un artefacto con 0 descargas y 0 likes en el momento de la consulta y sin datos públicos de benchmarks, por lo que su validación corre por cuenta de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen3.5, con torre de visión, proyecciones de atención lineal (atención híbrida) y cabeza MTP (multi-token prediction); desglose completo no disponible |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica: no hay información que indique que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W4A16 GPTQ (pesos INT4, activaciones BF16) sobre `compressed-tensors`; torre de visión, cabeza MTP, proyecciones de atención lineal y `lm_head` en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors con metadatos `compressed-tensors` (GPTQ), más `chat_template.jinja` y `generation_config.json` |
| Tamano del repositorio | 9,1 GB |
| Pipeline | `image-text-to-text` |
| Modelo base | `huihui-ai/Huihui-Qwen3.5-9B-abliterated` |
| Datos de calibracion | 999 muestras de `nvidia/Nemotron-Cascade-2-SFT-Data`, con filas fijadas en `nchapman/warp-3090-quant-lab-frozen-data` |
| Plantilla de chat | `froggeric/Qwen-Fixed-Chat-Templates` v22.5, incluida como única plantilla del artefacto |
| Muestreo por defecto | temperature 1.0, top_p 0.95, top_k 20 (valores de modo thinking del modelo base) |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen3.5 en su variante de 9B, un transformer multimodal que en este artefacto conserva tres componentes diferenciados: una torre de visión para entrada de imágenes, proyecciones de atención lineal que conviven con atención completa (esquema híbrido habitual en la familia Qwen3.x) y una cabeza MTP orientada a decodificación multi-token. No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, ni si el modelo base pasó por RLHF, DPO u otras fases de alineamiento; la model card del cuantizador no los detalla.

Lo que sí está documentado es el proceso de edición y cuantización. El modelo base es una versión "abliterated": una intervención sobre los pesos que identifica y sustrae la dirección asociada a la negativa a responder, de modo que el modelo deja de rechazar peticiones que el original rechazaría. Sobre esa base, la cuantización GPTQ fija grupos de pesos en INT4 con 999 muestras de calibración y mantiene en BF16 los módulos donde el error de cuantización sería más costoso (visión, `lm_head`, proyecciones de atención lineal y MTP). El resultado se distribuye con `compressed-tensors`, que es el formato que vLLM consume de forma nativa para kernels GPTQ.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia incluida en el repositorio.
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`): la torre de visión se conserva en BF16, por lo que la ruta multimodal no se degrada por la cuantización.
- Modo thinking: los valores de muestreo por defecto del `generation_config.json` (temperature 1.0, top_p 0.95, top_k 20) corresponden a los del modo de razonamiento extendido del modelo base.
- Decodificación multi-token mediante la cabeza MTP, conservada en BF16.
- Compatibilidad declarada con endpoints (`endpoints_compatible`) y con el ecosistema transformers.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Cobertura multilingüe: no disponible; el repositorio no declara lista de idiomas.
- Capacidades de audio: no disponibles.

## Casos de uso

- **Despliegue de un asistente multimodal en una sola GPU**: con ~9,1 GB de pesos, el modelo cabe en una RTX 4090 o en una L4 de 24 GB y permite servir imagen + texto desde un único `LLM(...)` de vLLM, sin pipeline separado de visión.
- **Procesamiento de documentos escaneados**: extracción y resumen de información a partir de capturas o páginas renderizadas, usando la torre de visión en BF16 y el modo thinking para tareas de extracción con estructura (tablas, formularios).
- **Prototipado de investigación sobre alineamiento y rechazo**: al ser una variante abliterated, sirve para estudiar cómo se comporta el modelo sin la capa de negativa aprendida, comparándolo con el base no modificado en las mismas prompts.
- **Generación de código en pipelines internos**: integrable vía API compatible con OpenAI (`endpoints_compatible`) en flujos de autocompletado o revisión, siempre que se valide la calidad tras la cuantización INT4 en el lenguaje objetivo.
- **Evaluación de cuantizaciones**: el artefacto está pensado como sujeto de pruebas reproducible (calibración fijada y trazable), útil para medir la degradación W4A16 frente a BF16 en tareas concretas antes de adoptar INT4 en producción.
- **Asistente con razonamiento paso a paso en local**: el modo thinking por defecto permite tareas de matemáticas o lógica en entornos sin salida a internet, con la ventaja de que todo el stack (transformers + safetensors) es auditable.
- **Generación de descripciones de imágenes para catalogos o accesibilidad**: subtitulado y etiquetado semiautomático de imágenes a escala moderada, con coste de VRAM de una GPU consumer de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del cuantizador no incluye métricas (MMLU, HumanEval, GSM8K, MMMU ni comparativas de perplejidad frente a BF16), y el modelo base tampoco aporta cifras en la información proporcionada. Cualquier número que se cite para este artefacto debería medirse localmente contra `huihui-ai/Huihui-Qwen3.5-9B-abliterated` en BF16 para aislar el efecto de la cuantización.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en torno a 10-12 GB para los pesos en VRAM (9,1 GB de pesos más overhead de runtime), a lo que hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto, que no está documentada. Estimación orientativa: 14-18 GB con contextos moderados.
- **GPU recomendadas**: A100 40/80 GB o H100 para servir con concurrencia alta; L40S o L4 24 GB para producción de baja latencia; RTX 4090 24 GB para desarrollo y despliegues pequeños.
- **GPU consumer**: sí cabe en RTX 4090 (24 GB) con margen; en RTX 4080/4070 Ti Super (16 GB) es viable con contextos cortos y batch pequeño; no es viable en GPUs de 8 GB sin descargar la torre de visión o reducir contexto.
- **Opciones de despliegue**: vLLM es la ruta soportada de forma nativa (`LLM(model="nchapman/Huihui-Qwen3.5-9B-abliterated-W4A16-GPTQ")`), ya que consume GPTQ vía `compressed-tensors`. transformers también puede cargarlo. llama.cpp y Ollama no consumen GPTQ directamente: para esos runtimes habría que partir del modelo base y generar un GGUF aparte con otra herramienta. El soporte en TGI de este formato GPTQ concreto no está confirmado en la información disponible.
- **Latencia y throughput**: no disponibles. No hay cifras publicadas de tokens por segundo ni de TTFT para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (`nchapman/...-W4A16-GPTQ`) | 9,41 B | No disponible | W4A16 GPTQ, ~9,1 GB | Apache-2.0 | HuggingFace, 0 descargas |
| `huihui-ai/Huihui-Qwen3.5-9B-abliterated` (base) | 9,41 B | No disponible | BF16 (pesos completos) | Apache-2.0 | HuggingFace, referenciado como base |
| Qwen3.5-9B original (no abliterated) | 9,41 B (por herencia) | No disponible | BF16 | No disponible en la informacion | No verificado en esta busqueda |
| Otras cuantizaciones del mismo base (AWQ, GGUF) | 9,41 B | No disponible | No disponible | Apache-2.0 (por herencia) | No identificadas en la informacion |

La comparación relevante es contra el base en BF16: misma arquitectura y mismos pesos, con una reducción de huella de aproximadamente 19 GB a 9,1 GB a cambio de una pérdida de precisión no cuantificada públicamente. Frente al Qwen3.5-9B original, la diferencia funcional es la abliteración, que altera el comportamiento ante peticiones sensibles, no las capacidades cognitivas del modelo.

## Limitaciones y advertencias

- **Abliteración**: el modelo base ha sido modificado para eliminar la dirección de rechazo. Esto degrada o anula los mecanismos de seguridad aprendidos y hace probable que genere contenido que el modelo original rechazaría. No es adecuado para aplicaciones orientadas al público sin una capa externa de moderación.
- **Sesgos**: no se ha publicado ninguna evaluación de sesgos, toxicidad o justicia para este artefacto ni para su base. Al eliminar la capa de rechazo, la exposición a sesgos presentes en los datos de entrenamiento aumenta.
- **Alucinación**: sin benchmarks ni evaluaciones publicadas, no hay medida de la tasa de alucinación. La cuantización INT4 puede incrementar los errores en tareas de recuperación exacta de datos (cifras, citas, nombres).
- **Contexto e idiomas desconocidos**: la model card no declara longitud de contexto ni lista de idiomas, lo que impide planificar despliegues que dependan de ventanas largas o de cobertura multilingüe concreta.
- **Artefacto no auditado**: 0 descargas y 0 likes en el momento de la consulta, publicado por un tercero distinto del autor del modelo base. No hay validación independiente de la calidad de la cuantización ni de la integridad del proceso.
- **Plantilla de chat no oficial**: el repositorio incluye únicamente la plantilla de `froggeric/Qwen-Fixed-Chat-Templates` v22.5. Usar una plantilla distinta a la esperada por el modelo (o la del base) puede degradar las respuestas y romper el modo thinking.
- **Compatibilidad de runtime limitada**: al ser GPTQ sobre `compressed-tensors`, el artefacto está atado a vLLM/transformers; no se puede cargar directamente en llama.cpp u Ollama sin reconvertir.
- **Licencia**: Apache-2.0 permite uso comercial y modificación, pero la responsabilidad legal y ética derivada del contenido generado por un modelo sin alineamiento de rechazo recae íntegramente en el desplegador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nchapman/Huihui-Qwen3.5-9B-abliterated-W4A16-GPTQ
- Modelo base (abliterated, BF16): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Dataset de calibración: https://huggingface.co/datasets/nvidia/Nemotron-Cascade-2-SFT-Data
- Filas exactas de calibración (dataset fijado): https://huggingface.co/datasets/nchapman/warp-3090-quant-lab-frozen-data
- Plantilla de chat utilizada: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Receta y herramientas de cuantización: https://github.com/nchapman/warp-3090-model-lab

No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este modelo: los resultados devueltos corresponden a páginas de YouTube y a artículos de bicicletas de montaña sin relación con el artefacto.
