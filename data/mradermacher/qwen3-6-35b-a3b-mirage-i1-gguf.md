# mradermacher/Qwen3.6-35B-A3B-Mirage-i1-GGUF

## Resumen

Qwen3.6-35B-A3B-Mirage-i1-GGUF es la versión cuantizada en formato GGUF del modelo nightmedia/Qwen3.6-35B-A3B-Mirage, un merge experimental de la familia Qwen3.6 con arquitectura MoE (Mixture of Experts) de 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (según la nomenclatura A3B). El trabajo de cuantización lo firma mradermacher, especialista habitual en publicar variantes GGUF de modelos abiertos, usando cuantización con imatrix (importancia ponderada) para preservar la calidad en tasas de bits bajas.

El modelo base es un merge realizado con mergekit sobre la familia Qwen3.6, con fine-tuning adicional vía SFT y LoRA, orientado a razonamiento con cadena de pensamiento larga (long-CoT), matemáticas, STEM, código y conversación multilingüe. Incluye además componentes de destilación y etiquetas que indican capacidades de humor y narración ("fable", "humour"). Se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha radica en que ofrece un modelo de 35B con activación dispersa (~3B activos) en formato GGUF listo para ejecutarse en hardware de consumo mediante llama.cpp u Ollama, con una batería amplia de cuantizaciones desde Q2_K hasta Q6_K. Es, sin embargo, un modelo experimental y de merge, con escasa validación pública y sin benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts), familia Qwen3.6 |
| Parámetros totales | 35.505.251.456 (~35,5B) |
| Parámetros activos | ~3B (nomenclatura A3B; valor exacto no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (con imatrix) |
| Idiomas soportados | en, zh, ja, es (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura de la familia Qwen3.6, un transformer con capas de mezcla de expertos (MoE) que activa una fracción reducida de parámetros por token (~3B de 35,5B), lo que reduce el coste computacional de inferencia manteniendo una capacidad de representación elevada. El modelo es un merge construido con mergekit (etiqueta "mergekit" en los tags) a partir de componentes de la familia Qwen3.6, con fine-tuning posterior mediante SFT y adaptadores LoRA, y con un componente de destilación orientado a razonamiento de cadena de pensamiento larga.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. Los tags indican instruction-tuning, conversación, multilingüismo, matemáticas, STEM, código, investigación y rasgos creativos (fábula, humor). El repositorio cuantizado incluye un fichero imatrix (0,5 GB) generado para producir cuantizaciones ponderadas por importancia, lo que mejora la fidelidad respecto a cuantizaciones estáticas en los mismos tamaños. También se menciona que el modelo base es multimodal de visión, con ficheros mmproj en el repositorio estático.

## Capacidades

- Generación de texto conversacional multi-turno con instruction-tuning.
- Razonamiento explícito con cadena de pensamiento larga (long-CoT, "thinking").
- Razonamiento matemático y resolución de problemas STEM.
- Generación y comprensión de código.
- Capacidades multilingües en inglés, chino, japonés y español.
- Capacidades de visión (el modelo base es multimodal; los ficheros mmproj se alojan en el repositorio estático).
- Componente creativo/narrativo (fábula, humor) según los tags del modelo.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente en la información disponible.

## Casos de uso

- Asistente de razonamiento en local: el modelo puede ejecutarse en estaciones de trabajo con GPU de consumo usando cuantizaciones Q4_K_M (~21,8 GB) y generar cadenas de pensamiento largas para problemas de lógica y matemáticas, aprovechando su modo long-CoT.
- Generación de código en entornos con requisitos de privacidad: al ser desplegable offline con llama.cpp u Ollama, permite autocompletado y revisión de código sin enviar datos a la nube, adecuado para equipos con políticas estrictas de confidencialidad.
- Tutoría STEM multilingüe: con soporte de inglés, chino, japonés y español, puede usarse para explicar conceptos de matemáticas y ciencias a estudiantes en varios idiomas, con cuantizaciones Q5_K_M (~25,4 GB) para mayor fidelidad.
- Prototipado de agentes conversacionales: su naturaleza MoE con ~3B activos reduce la latencia frente a modelos densos de tamaño similar, lo que lo hace apto para iterar rápidamente en prototipos de chatbot antes de pasar a producción.
- Investigación sobre merges y cuantización: sirve como caso de estudio para evaluar el impacto de merges con mergekit y de cuantizaciones imatrix en la calidad de razonamiento, comparando variantes i1-Q3 a i1-Q6.
- Generación creativa y narrativa: los tags de fábula y humor sugieren uso en escritura asistida, guiones y contenido lúdico, con cuantizaciones Q4_K_S (~20,5 GB) para despliegue en una sola GPU.
- Análisis de documentos con visión (si se usa el modelo base con mmproj): descripción de imágenes y extracción de información visual en pipelines documentales, aunque esta capacidad no está validada en la versión GGUF de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: i1-Q2_K ~13,3 GB; i1-IQ3_M ~15,9 GB; i1-Q4_K_M ~21,8 GB; i1-Q5_K_M ~25,4 GB; i1-Q6_K ~29,3 GB.
- GPU recomendadas: para Q4_K_M en una sola tarjeta, RTX 4090 (24 GB) o RTX 3090 (24 GB); para Q5_K_M y Q6_K, A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con Q4_K_M o inferiores; en GPUs de 16 GB solo con cuantizaciones IQ3 o Q3_K_S, con posible offload parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; para el modelo base en safetensors, vLLM o TGI (no confirmado para esta variante cuantizada).
- Latencia y throughput: no disponibles; al ser MoE con ~3B activos, se espera una velocidad superior a modelos densos de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-Mirage (i1-GGUF) | ~35,5B | ~3B | no disponible | Apache 2.0 | GGUF | Merge experimental con imatrix |
| Qwen3-30B-A3B (referencia de familia) | ~30B | ~3B | no disponible | Apache 2.0 | safetensors/GGUF | Modelo oficial de la familia Qwen3 MoE |
| Modelos densos de ~30-35B (p. ej. Qwen2.5-32B) | ~32B | 32B | no disponible | Apache 2.0 | safetensors/GGUF | Mayor coste de inferencia por token |

La comparación cuantitativa de rendimiento no está disponible; los datos de la familia Qwen3-30B-A3B y de modelos densos se incluyen solo como referencia estructural, no como validación de calidad.

## Limitaciones y advertencias

- Modelo experimental y de merge: no ha pasado por una validación pública exhaustiva; su calidad puede ser inferior a la de los modelos oficiales de la familia Qwen.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en MMLU, HumanEval, GSM8K u otras pruebas.
- Riesgo de alucinación: como todo modelo generativo, especialmente en modo long-CoT, puede producir razonamientos plausibles pero incorrectos.
- Sesgos: no se documentan sesgos específicos; hereda los del corpus de entrenamiento del modelo base.
- Contexto e idiomas: la longitud de contexto no está confirmada en la información disponible; el soporte multilingüe se limita a en, zh, ja y es según la model card.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de los componentes del merge.
- Cuantizaciones bajas (Q2_K, Q3_K_S) degradan la calidad; para producción se recomienda Q4_K_M o superior.
- Los ficheros mmproj para visión están en el repositorio estático, no en este; verificar su disponibilidad antes de asumir capacidades multimodales.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Mirage-i1-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.6-35B-A3B-Mirage
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Qwen3.6-35B-A3B-Mirage-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Qwen3.6-35B-A3B-Mirage-i1-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
