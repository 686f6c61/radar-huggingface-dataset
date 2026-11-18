# PeetPedro/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1

## Resumen

Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1 es un modelo de lenguaje y vision (vision-language model) publicado por el usuario PeetPedro en Hugging Face, distribuido exclusivamente en formato GGUF para su uso con llama.cpp y llama-cpp. El nombre sugiere un linaje derivado de la familia Qwen3 (con un sufijo "3.8" no estandar) sometido a un proceso de ajuste fino o fusion de modelos ("ColdFusion"), una variante "Heretic" (habitualmente asociada a la eliminación de mecanismos de rechazo o censura) y una destilación denominada "ManusDistill". El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que es una publicación reciente y sin validación comunitaria.

El dato más fiable disponible es el recuento de parámetros en safetensors: 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), coherente con un modelo denso de la clase 27B. El repositorio ocupa 88,2 GB, lo que encaja con múltiples cuantizaciones GGUF del mismo modelo base más el proyector multimodal (mmproj). La model card es extremadamente escueta: solo documenta el proceso de conversión a GGUF mediante Unsloth y los comandos de uso con `llama-cli` y `llama-mtmd-cli`.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un ejemplo de modelo comunitario derivado, sin model card técnica, sin benchmarks y sin licencia declarada, lo que plantea problemas serios para cualquier uso en producción. Se documenta aquí con rigor precisamente para que desarrolladores e investigadores puedan evaluar los riesgos antes de invertir tiempo en su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer denso, derivado de la familia Qwen3; no confirmado en la model card) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q2_K_L, Q3_K_M, Q4_1, Q4_K_M, Q8_0 (GGUF) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); incluye proyector multimodal `mmproj` en BF16 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de lo que sugiere el nombre del modelo y el tag `vision-language-model`. El recuento de parámetros (26,9 B) y la presencia de un fichero `mmproj` indican un modelo multimodal con un codificador visual acoplado a un LLM de ~27B. El prefijo "Qwen3.8" no corresponde a ninguna nomenclatura oficial conocida de la familia Qwen, y podría tratarse de una etiqueta inventada o de una variante no publicada oficialmente; no hay forma de verificarlo con la información disponible.

Respecto al entrenamiento, la model card no documenta número de tokens, composición del dataset, ni si hubo RLHF, DPO o destilación. Los términos del nombre ("ColdFusion", "Heretic", "ManusDistill") sugieren fusión de modelos, eliminación de alineamiento de seguridad y destilación, respectivamente, pero son interpretaciones del nombre, no datos confirmados. El único proceso documentado es la conversión a GGUF mediante la herramienta de Unsloth. No se menciona ninguna innovación técnica como decodificación especulativa, atención lineal o modos de razonamiento.

## Capacidades

- Generación de texto conversacional, según el tag `conversational`.
- Procesamiento de imagen y texto (vision-language model), a juzgar por el tag y el fichero `mmproj`; el alcance exacto (OCR, VQA, captioning) no está documentado.
- Uso con plantilla de chat Jinja mediante el flag `--jinja` en llama.cpp.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Modo "thinking", audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentación local con modelos multimodales en llama.cpp: el modelo se puede cargar con `llama-mtmd-cli` para probar entrada de imagen y texto en un entorno de escritorio, aprovechando las cuantizaciones Q4_K_M o Q8_0 para ajustar el equilibrio entre calidad y memoria.
- Pruebas de concepto de asistentes conversacionales: dado el tag `conversational` y el soporte de plantilla Jinja, puede emplearse para prototipar diálogos multi-turno, siempre que se valide previamente la calidad y la seguridad de las respuestas.
- Evaluación comparativa de variantes comunitarias: investigadores interesados en el efecto de fusiones y destilaciones comunitarias pueden usar este modelo como caso de estudio, comparándolo con el Qwen base del que derive.
- Despliegue en hardware de gama alta para inferencia offline: con 26,9 B de parámetros, la cuantización Q4_K_M (aproximadamente 16-17 GB) permite ejecución en GPUs de 24 GB, útil para entornos sin conectividad.
- Análisis de imágenes en pipelines locales: el proyector `mmproj` permite incorporar descripción de imágenes en flujos de trabajo que no pueden enviar datos a servicios en la nube, sujeto a validación de calidad.
- Docencia y formación: sirve como ejemplo práctico de conversión a GGUF con Unsloth y de las limitaciones de los modelos comunitarios sin documentación ni licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización, aproximada a partir de 26,9 B de parámetros):
  - Q2_K_L: ~10-11 GB.
  - Q3_K_M: ~13-14 GB.
  - Q4_1 / Q4_K_M: ~16-17 GB.
  - Q8_0: ~28-29 GB.
  - BF16: ~54 GB (más el proyector mmproj).
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M con margen; A100 40 GB o H100 para Q8_0 y BF16; RTX 3090 (24 GB) también válida para Q4.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones Q4 o inferiores; en GPUs de 16 GB solo con Q2_K_L o Q3_K_M y contexto reducido.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, llama-cpp-python). vLLM y TGI no están soportados de forma nativa para GGUF en este repositorio.
- Latencia y throughput: no disponibles (no documentados).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1 | ~26,9 B | no disponible | no disponible | GGUF | Hugging Face (0 descargas) |
| Qwen2.5-32B-Instruct (referencia de la familia Qwen) | 32,5 B | 128K (según model card oficial) | Apache 2.0 | safetensors, GGUF | Hugging Face, ampliamente validado |
| Gemma 2 27B | 27 B | 8K | Gemma License | safetensors, GGUF | Hugging Face, validado |
| Mistral Small 24B | 24 B | 32K | Apache 2.0 | safetensors, GGUF | Hugging Face, validado |

La comparación es orientativa: no hay datos de rendimiento del modelo de PeetPedro, por lo que no puede establecerse una comparación cuantitativa. Los tres alternativos cuentan con model card completa, licencia clara y benchmarks publicados, a diferencia de este modelo.

## Limitaciones y advertencias

- Ausencia total de model card técnica: no se documentan datos de entrenamiento, arquitectura, contexto ni evaluación, lo que impide cualquier validación rigurosa.
- Licencia no declarada: no puede asumirse uso comercial; en ausencia de licencia, los derechos de uso son inciertos y su explotación en producción conlleva riesgo legal.
- El sufijo "Heretic" sugiere la eliminación de mecanismos de rechazo o alineamiento de seguridad, lo que incrementa el riesgo de respuestas dañinas, sesgadas o inapropiadas.
- Riesgo elevado de alucinación: sin benchmarks ni evaluación, no hay evidencia de fiabilidad factual.
- Idiomas no declarados: no puede garantizarse un rendimiento correcto en castellano ni en otros idiomas distintos del inglés.
- El nombre "Qwen3.8" no corresponde a ninguna versión oficial conocida de Qwen, lo que impide verificar el linaje real del modelo.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni reportes de uso.
- Longitud de contexto desconocida: no es posible planificar aplicaciones que requieran ventanas largas.
- El tamaño del repositorio (88,2 GB) implica descargas largas y espacio en disco considerable.
- No se garantiza compatibilidad con vLLM o TGI; el despliegue queda limitado a llama.cpp y derivados.

## Enlaces

- Hugging Face: https://huggingface.co/PeetPedro/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1
- Unsloth (herramienta de conversión citada): https://github.com/unslothai/unsloth
- llama.cpp (runtime recomendado por la model card): https://github.com/ggml-org/llama.cpp
