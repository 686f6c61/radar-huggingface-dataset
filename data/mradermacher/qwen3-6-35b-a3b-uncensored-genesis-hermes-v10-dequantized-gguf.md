# mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-GGUF

## Resumen

El modelo `mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-GGUF` es una cuantización en formato GGUF del modelo base `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized`, desarrollado por el usuario mradermacher (de nethype GmbH) como parte de su serie de conversiones estáticas. Se trata de un modelo de 35.505 millones de parámetros, probablemente de arquitectura MoE (mezcla de expertos) con 3 mil millones de parámetros activos, según su nomenclatura "A3B". Está orientado a conversación y generación de texto en inglés, con un enfoque "uncensored" (sin censura) que lo diferencia de los modelos alineados convencionales.

La relevancia de este modelo radica en su disponibilidad en formato GGUF, lo que permite ejecutarlo en hardware de consumo mediante herramientas como llama.cpp u Ollama, sin necesidad de GPUs de gran capacidad. Incluye además un proyector multimodal (mmproj) que sugiere capacidades de visión, aunque no se detallan en la documentación. Al ser una cuantización estática, ofrece varios niveles de compresión (Q2_K a Q6_K) para equilibrar calidad y requisitos de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), basada en Qwen3.6 (no confirmado oficialmente) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | 3.000.000.000 (inferido del nombre "A3B", no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_K_S, Q6_K, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna ni el proceso de entrenamiento del modelo base. Por el nombre, se infiere que es un modelo de tipo Qwen3.6 con arquitectura MoE (35B totales, 3B activos), pero no hay confirmación oficial en la documentación proporcionada. Tampoco se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El sufijo "Uncensored-Genesis-Hermes-V10" sugiere que ha sido fine-tuneado sobre una base de Qwen3.6 con datasets como Genesis y Hermes, orientados a eliminar restricciones de contenido, pero esto es especulativo.

La cuantización GGUF fue realizada por mradermacher mediante conversión estática (sin imatrix), y el repositorio incluye un proyector multimodal (mmproj) que podría habilitar entrada de imágenes, aunque no se documenta su funcionamiento.

## Capacidades

- Generación de texto conversacional en inglés, con estilo "uncensored" (sin filtros de contenido).
- Posible soporte multimodal (visión) gracias al archivo mmproj incluido, aunque no se confirma en la documentación.
- Inferencia local eficiente gracias a la arquitectura MoE (solo 3B activos por token), lo que reduce el coste computacional frente a un modelo denso de 35B.
- Compatible con herramientas de inferencia GGUF como llama.cpp, Ollama, LM Studio, etc.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otras funcionalidades avanzadas.

## Casos de uso

- Generación de texto creativo sin restricciones: el modelo puede utilizarse para escribir ficción, guiones o contenido literario donde se requiera libertad temática, gracias a su naturaleza "uncensored".
- Asistente conversacional local: al ser GGUF y MoE, puede desplegarse en una GPU de consumo (por ejemplo, RTX 3090/4090) para mantener un chatbot privado sin depender de APIs externas.
- Experimentación con modelos sin alineación: investigadores pueden estudiar el comportamiento de un modelo sin filtros de seguridad, comparándolo con versiones alineadas de Qwen3.6.
- Prototipado rápido de aplicaciones de NLP: gracias a su tamaño moderado y formato GGUF, es fácil de integrar en pipelines de Python con llama-cpp-python o LangChain.
- Generación de código y asistencia técnica: aunque no se especifica, los modelos de la familia Qwen suelen tener buenas capacidades de código; puede probarse para autocompletado o generación de scripts.
- Despliegue en entornos con recursos limitados: con cuantizaciones Q4_K_S (20.5 GB) o Q3_K_M (17.3 GB), cabe en GPUs con 24 GB de VRAM, permitiendo inferencia local en estaciones de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo específico. Al ser una cuantización de un modelo derivado, su rendimiento dependerá de la calidad del fine-tuning original, que no está documentado.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización elegida, el archivo GGUF ocupa entre 13.3 GB (Q2_K) y 29.3 GB (Q6_K). A esto hay que sumar overhead de contexto y activaciones, por lo que se recomienda al menos 16 GB de VRAM para Q4_K_S y 24 GB para Q6_K.
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_S o Q6_K; RTX 4080 (16 GB) para Q3_K_M; GPUs de datacenter como A100 (40/80 GB) para ejecutar sin cuantizar o con contexto largo.
- En consumer GPU: sí, cabe en GPUs de 16-24 GB con cuantizaciones Q3 o Q4.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con conversión a formato compatible), TGI (si se convierte a safetensors).
- Latencia y throughput: no disponibles. Al ser MoE con 3B activos, la velocidad de generación será superior a un modelo denso de 35B, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El modelo base `symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized` no tiene documentación pública en la información proporcionada. Se podría comparar con otros Qwen3.6-35B-A3B cuantizados (por ejemplo, las versiones V6, V7 o "heretic" del mismo autor), pero no hay datos de rendimiento ni especificaciones detalladas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo "uncensored": puede generar contenido ofensivo, ilegal o inapropiado sin filtros. No es adecuado para aplicaciones comerciales orientadas al público general sin moderación adicional.
- Licencia no especificada: no se indica la licencia del modelo base ni de la cuantización, lo que genera incertidumbre legal para uso comercial o redistribución.
- Sin documentación técnica: no hay información sobre el proceso de entrenamiento, datos utilizados, ni evaluación de sesgos o alucinaciones.
- Idioma limitado: solo se declara inglés; el rendimiento en otros idiomas es desconocido.
- Contexto no especificado: se desconoce la longitud máxima de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- Cuantización estática: al no usar imatrix, la calidad de los quants puede ser inferior a versiones con imatrix (como las que publica el autor en otras series).
- Riesgo de alucinación: al ser un modelo sin alineación, es probable que presente tasas de alucinación más altas que modelos entrenados con RLHF.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-GGUF
- Modelo base (dequantizado): https://huggingface.co/symrex/Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized
- Página de solicitudes de modelos del autor: https://huggingface.co/mradermacher/model_requests
- Página de referencia del autor para este modelo: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Uncensored-Genesis-Hermes-V10-dequantized-GGUF
