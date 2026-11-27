# mradermacher/KuroPhysics-Sim-7B-GGUF

## Resumen

KuroPhysics-Sim-7B-GGUF es una redistribución en formato GGUF del modelo KuroPhysics-Sim-7B, publicado por el usuario mradermacher a partir de los pesos originales de engenho-ai. Se trata de una conversión estática: el autor de esta ficha no entrena ni modifica el modelo, sino que genera cuantizaciones listas para su uso con llama.cpp y motores compatibles. El modelo base cuenta con 7.615.616.512 parámetros, lo que lo sitúa en la categoría de 7B.

La relevancia de esta publicación es práctica: permite ejecutar un modelo de 7B en hardware de consumo mediante cuantizaciones de 2 a 8 bits, con el compromiso de calidad que ello implica. El repositorio ocupa 48,5 GB porque incluye el conjunto completo de cuantizaciones (desde Q2_K hasta Q8_0, pasando por F16 e IQ4_XS).

La información pública disponible es muy limitada: no se han publicado datos sobre arquitectura interna, composición del dataset de entrenamiento, licencia, idiomas soportados ni resultados de benchmarks. Todo lo que se detalla a continuación se basa en los metadatos del repositorio y en la model card, que únicamente documenta el proceso de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, sin confirmar) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo con múltiples cuantizaciones); el modelo original se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base. Por el recuento de parámetros (7,6 mil millones) y la nomenclatura "7B", se trata de un transformer de escala 7B, pero no se confirma el tipo de atención, la longitud de contexto nativa ni si incorpora innovaciones como atención lineal o mezcla de expertos. La model card del repositorio GGUF no incluye detalles arquitectónicos.

Respecto al entrenamiento, la model card solo indica que las cuantizaciones son estáticas y derivadas de `engenho-ai/KuroPhysics-Sim-7B`, con `convert_type: hf` y `quantize_version: 2`. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El nombre sugiere una especialización en simulación física ("Physics-Sim"), pero no hay evidencia pública que lo confirme.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` del repositorio indica que el modelo está orientado a diálogo multi-turno.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de infraestructura de inferencia estándar.
- Ejecución local: al estar en GGUF, es compatible con llama.cpp, Ollama y otros motores que consumen este formato.
- Especialización declarada (no verificada): el nombre del modelo apunta a simulación física, pero no se han publicado evaluaciones que lo respalden.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Visión, audio o modo de pensamiento explícito: no disponible.

## Casos de uso

- Despliegue local en estación de trabajo: con la cuantización Q4_K_M, el modelo ocupa aproximadamente 4,5 GB, por lo que puede ejecutarse en una GPU de consumo de 8 GB o en CPU con RAM suficiente, útil para prototipado sin conexión.
- Experimentación con prompts de física: si la especialización sugerida por el nombre se confirma, podría emplearse para generar explicaciones o resolver problemas de física en entornos educativos; conviene validar las respuestas antes de usarlas.
- Chat conversacional ligero: la etiqueta `conversational` permite integrarlo en asistentes de propósito general con requisitos de hardware modestos.
- Evaluación comparativa de cuantizaciones: el repositorio incluye 12 variantes, lo que facilita medir la degradación de calidad entre Q2_K y Q8_0 en una misma tarea.
- Servicio de inferencia autoalojado: mediante llama.cpp con el servidor compatible con OpenAI, se puede exponer el modelo como API interna para pruebas de integración.
- Filtrado y generación de texto en pipelines offline: para tareas de resumen o clasificación simple donde no se requiera estado del arte y prime el coste cero de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin contar caché KV):
  - Q2_K: aproximadamente 2,8 GB.
  - Q3_K_M: aproximadamente 3,5 GB.
  - Q4_K_M: aproximadamente 4,5 GB.
  - Q5_K_M: aproximadamente 5,3 GB.
  - Q6_K: aproximadamente 6,2 GB.
  - Q8_0: aproximadamente 8,1 GB.
  - F16: aproximadamente 15,2 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para cuantizaciones Q5/Q6 con contexto moderado; RTX 4090 o A100 para F16 y contextos largos.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q8_0 en tarjetas de 8 GB o más; Q4_K_M es la opción habitual para 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidor de llama.cpp compatible con la API de OpenAI y cualquier motor que soporte GGUF (koboldcpp, text-generation-webui).
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de contexto, que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KuroPhysics-Sim-7B-GGUF | 7,6 B | no disponible | no disponible | GGUF | Cuantizaciones estáticas de un modelo de engenho-ai; sin benchmarks públicos |
| Mistral-7B-Instruct (GGUF) | 7,2 B | 32 768 | Apache 2.0 | GGUF, safetensors | Referencia consolidada en 7B con licencia permisiva y amplia comunidad |
| Llama 3.1 8B Instruct (GGUF) | 8,0 B | 131 072 | Llama 3.1 Community License | GGUF, safetensors | Contexto largo y buen rendimiento general; licencia con restricciones |
| Qwen2.5 7B Instruct (GGUF) | 7,6 B | 131 072 | Apache 2.0 | GGUF, safetensors | Multilingüe y con soporte de tool calling documentado |

La comparación es estructural: no existen datos de rendimiento del modelo evaluado que permitan contrastarlo en tareas concretas con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación sobre sesgos, datos de entrenamiento y evaluación; no es posible valorar su comportamiento en dominios sensibles.
- Riesgo de alucinación no cuantificado: al no haber benchmarks, no se conoce su fiabilidad factual.
- Licencia no especificada: no se puede confirmar el uso comercial; es imprescindible consultar el repositorio original `engenho-ai/KuroPhysics-Sim-7B` antes de desplegarlo en producción.
- Idiomas no declarados: se desconoce la calidad en castellano y en otros idiomas distintos del inglés.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas.
- Las cuantizaciones de 2 y 3 bits degradan la calidad de forma notable; para uso serio se recomienda Q4_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación por parte de la comunidad.
- El nombre sugiere una especialización en física que no está respaldada por ninguna evaluación publicada; trátese como una afirmación no verificada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/KuroPhysics-Sim-7B-GGUF
- Modelo original: https://huggingface.co/engenho-ai/KuroPhysics-Sim-7B
