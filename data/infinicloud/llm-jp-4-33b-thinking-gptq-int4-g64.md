# InfiniCloud/llm-jp-4-33b-thinking-GPTQ-INT4-G64

## Resumen

llm-jp-4-33b-thinking-GPTQ-INT4-G64 es una versión cuantizada a GPTQ INT4 del modelo denso japonés llm-jp-4-33b-thinking, publicada por InfiniCloud. El objetivo es ejecutar un modelo de 33.000 millones de parámetros con capacidad de razonamiento (modo thinking) en GPUs de clase 48 GB, reduciendo el peso serializado de 66,439 GB en BF16 a 20,606 GB (19,191 GiB), aproximadamente un 69 % menos.

La cuantización es W4A16: pesos INT4 simétricos con activaciones en BF16 y tamaño de grupo 64, aplicada a las 448 proyecciones Lineal de atención y MLP en 64 capas decodificadoras (31.205.621.760 elementos de peso). Quedan fuera de INT4 los embeddings, el lm_head atado, las normalizaciones y el resto de parámetros no seleccionados. La calibración se realizó con 512 conversaciones de HuggingFaceH4/ultrachat_200k (train_sft, semilla 42, máximo 2048 tokens, reasoning_effort=medium).

Su relevancia práctica es doble: por un lado, ofrece un artefacto precalibrado y verificable (con manifiesto de cuantización y evidencias de evaluación) en lugar de obligar a repetir la calibración en cada despliegue; por otro, permite servir un redactor en japonés junto a un VLM en GPUs de 80 GB. Los idiomas declarados son inglés y japonés, la licencia es Apache 2.0 y el artefacto se publicó el 13 de septiembre de 2026 con 0 descargas y 0 valoraciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador denso (tag `llama`), 64 capas decodificadoras |
| Parametros totales | 33 B en el modelo base. La model card documenta 31.205.621.760 elementos de peso cuantizados en 448 módulos Lineal. El metadato agregado de safetensors del repositorio informa de 6.402.217.856, cifra que no concuerda con el total del modelo base |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible como máximo del modelo. Las evaluaciones y las pruebas de VRAM se ejecutaron con un límite de 16.384 tokens |
| Tipos de cuantizacion | GPTQ W4A16, pesos INT4 simétricos, activaciones BF16, tamaño de grupo 64, ordenación de activación `weight`. Embeddings, `lm_head` atado y normalizaciones se conservan en BF16 |
| Idiomas soportados | Inglés (`en`) y japonés (`ja`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con metadatos `compressed-tensors` (GPTQ empaquetado INT4); dos shards |
| Modelo base | llm-jp/llm-jp-4-33b-thinking, revisión `9e6928628594b205bd3ccd93c2813064aa53fe97` |
| Tamano de los pesos serializados | 20.606.016.800 bytes (19,191 GiB) |
| Tamano del repositorio | 20,6 GB |
| Fecha de publicacion | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es una cuantización de un transformer decodificador denso de 33 B parámetros distribuido en 64 capas, con proyecciones de atención y MLP cuantizadas. No es una arquitectura MoE, SSM ni híbrida: la model card no describe innovaciones de arquitectura propias de esta versión, sino únicamente el proceso de cuantización sobre el checkpoint original. El checkpoint base incorpora un modo de razonamiento explícito controlado por el parámetro `reasoning_effort`, con al menos los niveles `low` y `medium` documentados en las pruebas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset original ni sobre si hubo RLHF o DPO en el modelo base. Lo que sí se documenta es el pipeline de cuantización: GPTQ con 512 conversaciones de HuggingFaceH4/ultrachat_200k (`train_sft`, revisión `8049631c405ae6576f93f445c6b8166f76f5505a`, semilla 42, máximo 2048 tokens, `reasoning_effort=medium`), con un tiempo de ejecución de 56 minutos y 36 segundos y un pico observado de 22.554 MiB de VRAM durante el proceso (medición de cuantización, no requisito de inferencia).

La verificación del artefacto se hizo en CPU sobre el conjunto completo: presencia de las 448 proyecciones INT4 empaquetadas esperadas, todos los valores en coma flotante finitos, las 448 tensores de escala positivos y finitos, los 131 tensores BF16 retenidos idénticos bit a bit al origen fijado, y coincidencia del tokenizador de origen con el tokenizador de compatibilidad derivado. El repositorio incluye `llmjp4_tokenizer.py`, un cambio de compatibilidad de InfiniCloud para Transformers 5.14.1 que preserva el backend Unigram de `tokenizer.json`; su carga requiere `trust_remote_code=True`.

## Capacidades

- Generación de texto y conversación multi-turno en inglés y japonés (pipeline `text-generation`, etiqueta `conversational`).
- Razonamiento explícito en modo thinking, con control del esfuerzo mediante `reasoning_effort` (`low` y `medium` documentados).
- Resolución de problemas matemáticos, verificada sobre el conjunto MGSM en japonés con evaluación de 5 ejemplos (few-shot).
- Escritura y redacción en japonés como "writer" dedicado, escenario principal declarado por el autor.
- Salida en formato JSON en ciertos casos, con limitaciones importantes: en la prueba de humo con tres peticiones fijas, tanto el BF16 como este INT4 devolvieron el JSON dentro de un bloque de código Markdown con `reasoning_effort=low` y fallaron un `json.loads` directo; con `reasoning_effort=medium` ambos pasaron las tres peticiones.
- Soporte de tool calling o function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades de visión o audio: no disponibles, el modelo es exclusivamente de texto.
- Idiomas distintos de inglés y japonés: no documentados.

## Casos de uso

- Redacción en japonés en producción sobre una GPU de clase 48 GB: es el escenario que el propio autor define como uso autónomo por defecto, con holgura para caché KV, espacio de trabajo y peticiones concurrentes o de contexto largo.
- Servicio dual en GPU de 80 GB: desplegar este modelo como redactor en japonés junto a un modelo visual (por ejemplo, un VLM o un modelo tipo Qwen3.8-27B-FP8) repartiendo la VRAM disponible, algo que el BF16 no permitiría con la misma comodidad.
- Asistente de resolución de problemas matemáticos en japonés: con prompts de 5 ejemplos y hasta 4.096 tokens de generación, el modelo obtiene un 76,0 % en el conjunto MGSM japonés de 250 preguntas, un rendimiento cercano al 78,0 % del BF16 en la misma configuración.
- Ajuste del coste de inferencia por consulta: usar `reasoning_effort=low` para tráfico de baja complejidad y `reasoning_effort=medium` cuando se requiere mayor fiabilidad de formato, ya que en las pruebas fijas el nivel medio pasó las tres peticiones y el bajo solo dos (INT4) o una (BF16).
- Sustitución de un despliegue BF16 para reducir huella de VRAM: la pérdida medida es de 2,0 puntos porcentuales en MGSM japonés a cambio de un 69 % menos de peso serializado, un intercambio razonable en entornos con GPUs limitadas.
- Generación de JSON estructurado para APIs internas: únicamente con decodificación restringida y validación, reparación o reintento en el lado del servidor, dado el comportamiento observado con el cercado en Markdown.
- Atención al cliente o QA documental en japonés e inglés con contexto largo: el modelo admite al menos 16.384 tokens de contexto en las configuraciones probadas, suficiente para conversaciones multi-turno con documentación adjunta.
- Reproducibilidad de evaluaciones de cuantización: el repositorio publica `quantization-manifest.json` y `evidence/evaluation-summary.json`, por lo que sirve como referencia fija para comparar métodos de cuantización sin recalibrar.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al conjunto MGSM japonés (250 preguntas, 5 ejemplos, `reasoning_effort=low`, temperatura 0, semilla 42, límite de generación de 4.096 tokens, contexto de 16.384 tokens) y a una prueba de humo de tres peticiones fijas, siempre comparando con el modelo fuente en BF16.

| Evaluación | Fuente BF16 | GPTQ INT4 G64 | Diferencia |
|---|---:|---:|---:|
| MGSM japonés, extracción flexible | 195/250 (78,0 %) | 190/250 (76,0 %) | −5 aciertos (−2,0 pp) |
| Respuestas finales completas | 249/250 | 250/250 | +1 |
| Generaciones terminadas por longitud | 1 | 0 | −1 |
| Prueba de humo fija (3 peticiones), `reasoning_effort=low` | 1/3 | 2/3 | no comparable (3 casos) |
| Prueba de humo fija (3 peticiones), `reasoning_effort=medium` | 3/3 | 3/3 | — |

En el análisis por pares de la evaluación MGSM, 7 errores del BF16 pasaron a ser correctos con INT4 y 12 respuestas correctas del BF16 pasaron a ser errores con INT4. La regla de extracción estricta puntuó 0 en ambos modelos porque su redacción de respuesta no coincidía con la frase exigida, por lo que solo la extracción numérica flexible es informativa. No hay datos publicados de MMLU, HumanEval, GSM8K ni de otras tareas en la información disponible, y el autor advierte que se trata de una única ejecución fija que no establece equivalencia estadística ni calidad general.

## Requisitos de hardware

- Pesos serializados INT4: 20.606.016.800 bytes (19,191 GiB) repartidos en dos shards; el repositorio completo ocupa 20,6 GB.
- Diagnóstico de carga del modelo en vLLM: 19,35 GiB.
- GPU recomendada para uso autónomo: clase 48 GB, que es el valor por defecto práctico según el autor, con espacio para caché KV en BF16, espacio de trabajo del runtime y peticiones largas o concurrentes.
- GPU de 32 GB: puede funcionar con contexto y concurrencia limitados.
- GPU de 24 GB: una L4 se considera insuficiente para el perfil denso probado; para un objetivo autónomo de 24 GB el autor remite a un modelo relacionado de tipo 32B-A3B, cuyo identificador no se indica.
- GPU de 80 GB (A100 80 GB, H100 80 GB): permite co-alojar este modelo junto a otro, por ejemplo un modelo visual o un modelo tipo Qwen3.8-27B-FP8.
- GPU empleada en la medición de VRAM: una RTX PRO 6000 Blackwell Max-Q de 96 GB, con tensor parallel size 1, una secuencia concurrente, caché KV en BF16, ejecución eager, prefix caching desactivado y límite de contexto de 16.384 tokens (prueba con presupuesto de planificación de 28 GiB; el resultado detallado de esa tabla quedó truncado en la información disponible).
- Requisito de kernels: GPUs que soporten kernels GPTQ INT4 pero que no ofrezcan aritmética NVFP4 nativa.
- Opciones de despliegue: vLLM 0.29.0 está validado; el formato `compressed-tensors` es el esperado por ese runtime. No se distribuye GGUF en el repositorio, por lo que llama.cpp u Ollama exigirían una conversión no documentada ni verificada.
- Tokenizador: requiere `trust_remote_code=True` para cargar `llmjp4_tokenizer.py`.
- Latencia y throughput: no disponibles en la información proporcionada.
- El pico de 22.554 MiB de VRAM registrado durante la cuantización (56 min 36 s) corresponde al proceso de cuantización y no es un requisito de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (GPTQ INT4 G64) | 33 B denso (31.205.621.760 elementos cuantizados) | 16.384 tokens probados | GPTQ W4A16, grupo 64, safetensors + compressed-tensors, 20,606 GB | Apache 2.0 | HuggingFace, validado en vLLM 0.29.0 |
| llm-jp/llm-jp-4-33b-thinking (BF16) | 33 B denso | Igual que el derivado | BF16 safetensors, 66,439 GB (61,876 GiB) | Apache 2.0 según los tags del derivado; verificar términos del repositorio base | HuggingFace |
| Modelo relacionado 32B-A3B (MoE) mencionado por el autor | Aproximadamente 32 B totales y 3 B activos según la mención | No disponible | No disponible | No disponible | Mencionado por el autor, sin identificador de repositorio |
| Qwen3.8-27B-FP8 | No disponible | No disponible | FP8 | No disponible | Solo se menciona como modelo con el que co-alojar, no como alternativa equivalente |

La comparación directa disponible se limita al par BF16 frente a INT4 sobre el mismo modelo, donde la versión cuantizada ocupa un 69 % menos y pierde 2,0 puntos porcentuales en MGSM japonés. No se han publicado comparaciones con otros modelos de 30 B de la misma categoría en la información disponible.

## Limitaciones y advertencias

- Formato de salida no estricto: no se debe asumir cumplimiento de JSON ni en este checkpoint INT4 ni en su fuente BF16. En la prueba fija con `reasoning_effort=low`, ambos envolvieron el JSON en un bloque de código Markdown y fallaron `json.loads`; solo con `reasoning_effort=medium` pasaron las tres peticiones. Para APIs con salida legible por máquina hay que usar decodificación restringida y validar, reparar o reintentar.
- Evidencia estadística limitada: la evaluación es una única ejecución con 250 preguntas y semilla fija; el propio autor indica que no establece calidad general ni equivalencia estadística con el BF16.
- Pérdida de calidad por cuantización: −2,0 puntos porcentuales en MGSM japonés, con 12 respuestas que eran correctas en BF16 y dejaron de serlo en INT4.
- Artefacto de la métrica de extracción: la regla estricta puntúa 0 en ambos modelos, por lo que no debe usarse como referencia de rendimiento.
- Idiomas: solo inglés y japonés declarados; no hay datos de comportamiento en castellano ni en otros idiomas.
- Contexto: el máximo real del modelo no está documentado; las pruebas usan 16.384 tokens como límite, así que contextos mayores no están verificados.
- Sesgos: no se han publicado análisis de sesgo en la información disponible.
- Alucinación: sin datos específicos; aplican los riesgos habituales de un modelo de 33 B sin evaluación de factualidad publicada.
- Capacidades no documentadas: no hay información sobre tool calling, uso como agente, razonamiento multi-paso orquestado ni multimodalidad.
- Licencia y uso comercial: el repositorio declara Apache 2.0, pero la model card no reproduce los términos del modelo base, por lo que conviene verificarlos antes de un despliegue comercial.
- Riesgo de ejecución de código remoto: cargar el tokenizador requiere `trust_remote_code=True` y ejecuta `llmjp4_tokenizer.py` del repositorio.
- Adopción nula: 0 descargas y 0 valoraciones en el momento de la consulta, sin evidencia de uso en producción por terceros.
- Compatibilidad de runtime: validado únicamente con vLLM 0.29.0 y el formato `compressed-tensors`; no hay GGUF ni pasos de conversión publicados para otros motores.
- El resultado detallado de la prueba de VRAM con presupuesto de planificación de 28 GiB quedó truncado en la información disponible, por lo que no se puede confirmar el consumo completo con caché KV incluida.

## Enlaces

- Repositorio del modelo: https://huggingface.co/InfiniCloud/llm-jp-4-33b-thinking-GPTQ-INT4-G64
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4-33b-thinking
- Manifiesto de cuantización: https://huggingface.co/InfiniCloud/llm-jp-4-33b-thinking-GPTQ-INT4-G64/blob/main/quantization-manifest.json
- Resumen de evaluación: https://huggingface.co/InfiniCloud/llm-jp-4-33b-thinking-GPTQ-INT4-G64/blob/main/evidence/evaluation-summary.json
- Tokenizador de compatibilidad: https://huggingface.co/InfiniCloud/llm-jp-4-33b-thinking-GPTQ-INT4-G64/blob/main/llmjp4_tokenizer.py
- README en japonés: https://huggingface.co/InfiniCloud/llm-jp-4-33b-thinking-GPTQ-INT4-G64/blob/main/README.ja.md
- Dataset de calibración: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- InfiniCloud AI (Shiraito): https://infinicloud.com/

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre llm-jp-4; los enlaces recuperados (sitios de horóscopos, hilos de Zhihu sobre Gemini y un blog de Huawei Cloud sobre paradigmas de modelos NLP y CV) no guardan relación con el artefacto descrito y se han descartado.
