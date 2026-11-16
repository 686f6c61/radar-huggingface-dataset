# fnjerry/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop-GGUF

## Resumen

Este repositorio contiene cuantizaciones en formato GGUF del modelo DavidAU/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop, un fine-tuning comunitario derivado de la familia Qwen. El autor de la cuantización es fnjerry, que ha convertido y cuantizado los pesos originales usando llama.cpp build b9192 en un espectro de 16 variantes que van desde Q2_K (4,60 GB) hasta Q8_0 (11,57 GB). El modelo subyacente tiene 11.675.250.624 parámetros (aproximadamente 11,7 mil millones) y está orientado a generación de texto conversacional con modo de razonamiento explícito ("thinking") y sin censura de contenido.

La relevancia de esta ficha es doble. Por un lado, documenta un artefacto típico del ecosistema de fine-tunes comunitarios sobre Qwen: un modelo base rebautizado con nomenclatura que no corresponde a una versión oficial de Alibaba (no existe un "Qwen3.6" publicado por el equipo Qwen), modificado mediante técnicas de "abliteration" o "heretic" para reducir los rechazos del alignment, y posteriormente cuantizado para consumo local. Por otro, el repositorio presenta un tamaño total de 116,1 GB, lo que refleja la acumulación de todas las variantes de cuantización en un único repo, algo relevante para quien planifique descargas.

El modelo declara soporte únicamente de inglés y chino, licencia Apache 2.0 y compatibilidad con endpoints conversacionales. No hay información publicada sobre el proceso de entrenamiento del fine-tuning, la composición del dataset ni resultados de benchmarks, por lo que las secciones correspondientes se limitan a lo verificable desde los metadatos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de la familia Qwen; variante exacta no disponible) |
| Parametros totales | 11.675.250.624 (11,7 B) |
| Parametros activos | No aplica (no es MoE segun los metadatos disponibles) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M, IQ3_S, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye presumiblemente en safetensors |
| Herramienta de cuantizacion | llama.cpp b9192 |
| Tamano del repositorio | 116,1 GB (todas las variantes) |
| Pipeline | text-generation |
| Compatibilidad de endpoints | endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura del modelo subyacente es un transformer decoder-only de aproximadamente 11,7 mil millones de parámetros, coherente con la familia Qwen de tamaño medio. Los metadatos no especifican la configuración exacta de capas, dimensiones ocultas, número de cabezas de atención ni si emplea mecanismos como GQA o atención lineal. El nombre del modelo base incluye la etiqueta "Thinking", lo que sugiere un modo de razonamiento explícito análogo al de las variantes Qwen3 con cadenas de pensamiento, pero no hay documentación técnica que lo confirme.

El fine-tuning original (DavidAU) incorpora las etiquetas "Heretic" y "Uncensored", que en la práctica del ecosistema abierto suelen indicar un proceso de ablación de direcciones de rechazo en el espacio de activaciones o un ajuste fino con datasets sin filtrado de contenido, destinado a reducir la tasa de respuestas negativas del modelo alineado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o SFT específicas. La cuantización de fnjerry se limita a la conversión de formato y a la aplicación de los cuantizadores estándar de llama.cpp, sin modificación de pesos más allá de la pérdida de precisión inherente a cada tipo de cuantización.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Modo de razonamiento explícito ("thinking"), presumiblemente con cadenas de pensamiento antes de la respuesta final, aunque no hay documentación que detalle el formato exacto de activación.
- Generación de código y texto técnico, como capacidad heredada de la familia Qwen.
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones que el modelo alineado rechazaría, según la intención declarada del fine-tuning.
- Compatibilidad con endpoints conversacionales (etiqueta endpoints_compatible).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni otras modalidades.
- No se documenta una ventana de contexto concreta; el límite práctico depende de la configuración del motor de inferencia y de la variante GGUF.

## Casos de uso

- Inferencia local en equipos de consumo: las variantes Q4_K_M (6,82 GB) e IQ4_XS (6,31 GB) permiten ejecutar el modelo en GPUs con 8-12 GB de VRAM o en CPU con suficiente RAM, usando llama.cpp, LM Studio u Ollama.
- Experimentación con modelos sin alineación: útil para investigación sobre comportamiento de modelos ablacionados, análisis de tasas de rechazo y estudios comparativos de seguridad, siempre en entornos controlados.
- Generación de ficción y contenido creativo sin restricciones temáticas: el modo "uncensored" reduce las interrupciones en narrativas con violencia, temas adultos o lenguaje explícito, un caso habitual de los fine-tunes comunitarios.
- Prototipado de asistentes conversacionales bilingües inglés-chino: el soporte declarado de ambos idiomas permite construir demos de atención al cliente o chat para esos mercados, con la salvedad de que no hay evaluación publicada de calidad.
- Despliegue en pipelines de generación de texto por lotes: al ser GGUF y compatible con llama.cpp, se puede integrar en scripts de procesamiento masivo de documentos en máquinas sin GPUs de datacenter.
- Evaluación de cuantizaciones: el repositorio ofrece 16 variantes del mismo modelo, lo que lo convierte en un banco de pruebas práctico para medir la degradación de calidad entre Q2_K y Q8_0 en tareas concretas.
- Fine-tuning posterior o destilación: los pesos en Q8_0 (11,57 GB) sirven como referencia cercana al original para experimentos de ajuste o como profesor en destilación, aunque para entrenamiento conviene partir del modelo base en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantización no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas, y tampoco se aportan datos de perplejidad por variante de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más el overhead de contexto y caché KV. Para Q4_K_M (6,82 GB) se recomiendan 9-10 GB de VRAM con contexto moderado; para Q8_0 (11,57 GB), 14-16 GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q8_0 y Q6_K con contexto amplio; RTX 4070 Ti / 4080 (12-16 GB) para Q5_K_M e IQ4_NL; RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M.
- Cabe en GPU de consumo: sí, en todas las variantes hasta Q5_K_M en GPUs de 12 GB, y hasta Q8_0 en GPUs de 24 GB. Las variantes Q2_K y Q3_K_S (4,60-5,15 GB) caben en GPUs de 8 GB.
- Despliegue: llama.cpp, LM Studio, Ollama y cualquier motor compatible con GGUF. No se documenta soporte de vLLM ni TGI para este artefacto concreto, ya que ambos priorizan formatos safetensors.
- Latencia y throughput: no disponibles. Dependen del hardware, del tamaño de contexto y de la variante de cuantización; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (fnjerry GGUF) | 11,7 B | No disponible | Apache 2.0 | GGUF (16 variantes) | Fine-tuning comunitario sin benchmarks publicados |
| Qwen2.5-14B-Instruct (oficial) | 14,7 B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Modelo oficial con evaluaciones publicadas |
| Qwen2.5-7B-Instruct (oficial) | 7,6 B | 32.768 tokens (ampliable) | Apache 2.0 | safetensors, GGUF | Alternativa de menor tamano, ampliamente desplegada |
| Mistral-Nemo-Instruct-2407 | 12,2 B | 128.000 tokens | Apache 2.0 | safetensors, GGUF | Tamano comparable, contexto mucho mayor |

La comparación con modelos oficiales es aproximada: el modelo de esta ficha deriva de un fine-tuning comunitario cuya base exacta no está verificada, y no existen métricas que permitan situarlo frente a las alternativas en calidad. La ventaja práctica del artefacto es la disponibilidad inmediata en 16 cuantizaciones GGUF; la desventaja es la ausencia total de evaluaciones y de documentación del proceso de entrenamiento.

## Limitaciones y advertencias

- Ausencia de benchmarks: no hay ninguna evaluación publicada de calidad, razonamiento o seguridad, lo que impide estimar su rendimiento real frente a modelos oficiales.
- Nomenclatura engañosa: el nombre "Qwen3.6" no corresponde a ninguna versión oficial de Alibaba; se trata de una etiqueta del fine-tuning comunitario, no de un modelo Qwen publicado por el equipo original.
- Modelo "uncensored": la reducción deliberada de rechazos implica mayor probabilidad de generar contenido dañino, ilegal o inexacto sin advertencia. No es adecuado para aplicaciones orientadas al público sin filtros adicionales.
- Riesgo de alucinación: inherente a los modelos de 11-12 B y potencialmente agravado por el fine-tuning sin datos de alineación documentados.
- Idiomas limitados: solo inglés y chino declarados; el rendimiento en castellano no está evaluado y probablemente sea inferior.
- Contexto desconocido: no se documenta la longitud de contexto nativa ni si el fine-tuning la preserva; configurar ventanas largas en el motor de inferencia puede degradar la calidad.
- Licencia: Apache 2.0 permite uso comercial, pero el autor del fine-tuning no ofrece garantías sobre la procedencia y los términos de los datos de entrenamiento utilizados.
- Repositorio de 116,1 GB: descargar el repo completo es costoso; conviene descargar únicamente el archivo GGUF de la variante deseada.
- Sin soporte documentado de tool calling ni agentes: no debe asumirse que el modelo sigue protocolos de function calling de forma fiable.
- Fecha de creación futura en los metadatos (2026-11-16): inconsistencia que sugiere metadatos generados o manipulados; conviene verificar la integridad de los archivos antes de usarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fnjerry/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.6-12B-IQ-Ultra-Heretic-Uncensored-Thinking-V2-Hightop
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai/
- Ollama: https://ollama.com/
