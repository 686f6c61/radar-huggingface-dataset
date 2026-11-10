# atrezonator/Qwen3.8-40B-Heretic-Uncensored_GGUF

## Resumen

Qwen3.8-40B-Heretic-Uncensored_GGUF es una conversión a formato GGUF del modelo DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored, publicada por el usuario atrezonator. No se trata de un modelo entrenado desde cero ni de una fusión nueva: el autor del repositorio indica explícitamente que solo ha realizado la conversión de formato, sin entrenamiento adicional, merging ni edición de pesos. El modelo subyacente deriva de la arquitectura Qwen (familia Qwen3.8, según los tags del repositorio) y se distribuye en dos precisiones: BF16 completa y una variante denominada Q8_0_L.

La relevancia de esta ficha radica en que permite ejecutar en llama.cpp y runtimes compatibles un modelo de gran tamaño (denominado 40B en el nombre del repositorio, aunque no se confirma el número exacto de parámetros en la información disponible) con una ventana de contexto declarada de hasta aproximadamente 256k tokens. El modelo base está descrito por su autor como "uncensored" (Heretic), lo que implica que puede generar contenido que otros modelos rechazan; esto condiciona su uso en producción y exige controles de moderación externos.

La información disponible es limitada: no se publican resultados de benchmarks, no se detalla la composición del dataset de entrenamiento ni el proceso de alineamiento, y el repositorio no registra descargas ni interacciones en el momento de la consulta. Esta ficha refleja únicamente los datos verificables en la model card y los metadatos del repositorio, marcando como "no disponible" todo aquello que no se especifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen (familia Qwen3.8), con cabeza MTP/NextN según la model card; detalles de capas y atención no disponibles |
| Parametros totales | no disponible (el nombre del repositorio indica "40B", sin confirmación en la model card) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta ~256k tokens según la model card; se recomienda un mínimo de 24k y 64k+ para uso multiturno complejo |
| Tipos de cuantizacion | BF16 (completa) y Q8_0_L (Q8_0 con tensores clave en BF16: token_embd, output, ffn_down, ssm_out, attn_output) |
| Idiomas soportados | en, ru |
| Licencia | Apache-2.0 (según la model card del repositorio de conversión; verificar términos de Qwen antes de uso comercial) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.8, según los tags del repositorio. La model card menciona tensores `ssm_out`, lo que sugiere la presencia de componentes de tipo state space en el grafo del modelo, aunque no se detalla la proporción ni la configuración exacta de la arquitectura híbrida. Se indica también la presencia de una cabeza MTP (Multi-Token Prediction / NextN), que el conversor preserva si existe en el checkpoint de origen, pero que no se añade si falta. No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención ni configuración del tokenizador.

Respecto al entrenamiento, esta ficha no puede aportar datos: el repositorio es una conversión de formato y remite al modelo original (DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored) para cualquier detalle sobre fine-tuning, dataset, número de tokens o proceso de alineamiento (RLHF/DPO). La model card del conversor no incluye esa información. Tampoco se ha utilizado importance matrix (imatrix) en el proceso de cuantización, y no se ha realizado una evaluación formal de la calidad de Q8_0_L frente a Q8_0 estándar.

## Capacidades

- Generación de texto en inglés y ruso, según los idiomas declarados en los metadatos.
- Razonamiento con modos configurables: la model card menciona el modo de razonamiento por defecto `xhigh` de Qwen y un menú de ayuda integrado accesible escribiendo `help` en el chat o mediante `{REASON:help}`, que expone los modos de razonamiento e instrucción disponibles.
- Tool calling / function calling: la model card recomienda temperatura 0.6–0.7 y cuantizaciones Q6/Q8 para este uso.
- Soporte de MTP (Multi-Token Prediction) para acelerar la generación, condicionado a que el build de llama.cpp utilizado soporte MTP para esta arquitectura.
- Conversaciones multiturno con contexto largo, gracias a la ventana de hasta ~256k tokens.
- Capacidad de visión: no disponible en estos ficheros GGUF, ya que no se generó el proyector multimodal (`mmproj`).
- Comportamiento "uncensored": el modelo base está descrito por su autor como Heretic, por lo que puede producir contenido que otros modelos rechazan.

## Casos de uso

- Asistencia conversacional en inglés o ruso con contexto largo: el modelo puede mantener diálogos multiturno extensos apoyándose en una ventana de hasta ~256k tokens, adecuada para sesiones de soporte o análisis documental prolongado.
- Automatización de flujos con tool calling: con temperatura 0.6–0.7 y cuantización Q8, puede integrarse en pipelines que requieran invocar funciones externas (APIs, consultas a bases de datos) mediante el formato de function calling de Qwen.
- Procesamiento de documentos largos en local: al ejecutarse en llama.cpp, permite resumir o extraer información de textos que superen los 64k tokens en entornos sin acceso a la nube.
- Generación de contenido sin restricciones editoriales: para casos donde se requiera texto no filtrado (ficción, guiones, escenarios de red teaming), el carácter uncensored del modelo base lo hace adecuado, siempre con revisión humana posterior.
- Experimentación e investigación en cuantización: la disponibilidad de BF16 y Q8_0_L permite comparar el impacto de mantener tensores críticos en mayor precisión sobre la calidad de salida.
- Despliegue en infraestructura propia con llama-server: la model card incluye una configuración de referencia (`-c 65536 -ngl 99 --jinja --temp 0.7 --top-k 64 --top-p 0.95 --min-p 0.05 --repeat-penalty 1.0`) que sirve como punto de partida para servicios de generación de texto autoalojados.
- Aceleración mediante MTP: en builds de llama.cpp compatibles, la cabeza MTP puede reducir la latencia de decodificación en cargas de generación larga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en el tamaño declarado en el nombre del repositorio (40B), un modelo en BF16 requeriría del orden de 80 GB solo para pesos, y la variante Q8_0_L un tamaño algo superior al de un Q8_0 estándar por los tensores mantenidos en BF16. Estas cifras son estimaciones, no datos publicados por el autor.
- GPU recomendadas: no especificadas en la model card. Para BF16 sería necesario hardware de clase A100/H100 de 80 GB o configuraciones multi-GPU; para Q8_0_L, GPUs con 48 GB o más, o reparto entre varias.
- GPU de consumo: no se confirma que quepa en tarjetas de consumo (RTX 4090 de 24 GB) en las precisiones publicadas; requeriría cuantizaciones más agresivas no incluidas en este repositorio.
- Opciones de despliegue: llama.cpp y runtimes compatibles (por ejemplo, llama-server). La model card no menciona vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles. La model card solo indica que el uso efectivo de MTP requiere un build de llama.cpp con soporte para esta arquitectura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-40B-Heretic-Uncensored_GGUF (este) | "40B" según nombre, no confirmado | ~256k | Apache-2.0 | GGUF (BF16, Q8_0_L) | Conversión sin entrenamiento adicional; solo texto; en/ru |
| DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored | no disponible | no disponible | Apache-2.0 según la conversión | safetensors presumiblemente (no confirmado) | Modelo original del que deriva esta conversión; incluye potencialmente visión y MTP |
| Modelos Qwen de la familia base | no disponible | no disponible | según términos de Qwen | varios | Arquitectura de origen; sin datos concretos en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros declarados, formato y licencia.

## Limitaciones y advertencias

- El modelo base está etiquetado como "uncensored" (Heretic): puede generar contenido que otros modelos rechazan, lo que exige moderación externa y revisión humana en cualquier despliegue público.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual para esta conversión ni para el modelo original en la información disponible.
- Idiomas limitados a inglés y ruso según los metadatos; el rendimiento en castellano no está documentado.
- Sin soporte de visión en estos ficheros: no se generó el proyector `mmproj`.
- La cuantización Q8_0_L no ha sido evaluada formalmente frente a Q8_0 estándar; no hay garantía de que la mayor precisión en tensores seleccionados se traduzca en mejor calidad medible.
- No se utilizó importance matrix, lo que puede afectar a la calidad relativa frente a cuantizaciones con imatrix.
- El uso de MTP requiere un build específico de llama.cpp; sin él, la generación no se acelera.
- Licencia Apache-2.0 declarada en la conversión, pero la model card recomienda verificar los términos de Qwen antes de uso comercial; el repositorio no está afiliado a los autores originales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de validación por parte de la comunidad.
- El número exacto de parámetros no está confirmado en la documentación; el "40B" proviene únicamente del nombre del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/atrezonator/Qwen3.8-40B-Heretic-Uncensored_GGUF
- Modelo base (original): https://huggingface.co/DavidAU/Qwen3.8-40B-Ultimate-Heretic-Uncensored
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Autor del fine-tuning original: https://huggingface.co/DavidAU
