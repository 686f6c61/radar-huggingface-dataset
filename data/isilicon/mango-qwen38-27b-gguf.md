# isilicon/mango-qwen38-27b-gguf

## Resumen

Mango Qwen3.8 27B GGUF es un repositorio de preservación publicado por el usuario isilicon en Hugging Face que agrupa, en un único lugar, ocho archivos GGUF cuantizados del modelo Qwen3.8-27B-Uncensored en sus dos variantes: la general (linaje Orca) y la variante "Cyber" (linajes philbert440 v2 y HFCK99). El modelo base es un Qwen3.8 de 27 mil millones de parámetros sin filtros de moderación, derivado de la familia Qwen3, y el repositorio añade valor mediante pines de origen, sumas de verificación SHA256, guías de hardware y evidencia de rendimiento documentada.

El problema que resuelve es la trazabilidad y preservación de pesos cuantizados: en lugar de distribuir cuantizaciones opacas, Mango conserva los bytes de pesos originales de los creadores, documenta el linaje exacto de cada checkpoint (que difiere entre carpetas) y ofrece descargas selectivas de un solo archivo. Es relevante porque Qwen3.8 emplea una arquitectura híbrida GDN (Gated DeltaNet) que requiere runtimes recientes, algo que este repositorio documenta explícitamente.

El modelo cubre generación de texto conversacional en inglés y chino, con cuantizaciones desde Q2_K (10,86 GB) hasta Q6_K (23,71 GB), bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GDN (Gated DeltaNet), familia Qwen3.8 |
| Parámetros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (las estimaciones de VRAM asumen contexto corto de ~4K tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q6_K (GGUF) |
| Idiomas soportados | inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original está en safetensors) |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Qwen3.8 y utiliza una arquitectura híbrida GDN (Gated DeltaNet), que combina capas de atención estándar con capas de tipo DeltaNet con puertas. Esta arquitectura híbrida requiere builds recientes de llama.cpp con soporte para la arquitectura `qwen35`/GDN híbrida; los runtimes antiguos rechazan estos archivos. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

El repositorio Mango no modifica los pesos: realiza copias server-side de los blobs de origen fijados en Hugging Face, de modo que los bytes de los pesos de los creadores permanecen intactos. Cada archivo incluye manifiesto de origen (`SOURCE_MANIFEST.json`), sumas de verificación SHA256 y registro de la revisión verificada del modelo, lo que permite fijar despliegues con `--revision <commit>`. Cabe destacar la distinción de linajes: `cyber/v2/` contiene los cuants Q4/Q6 de philbert440, mientras que `cyber/hfck99/` ofrece Q2/Q3 derivados de la cuantización con matriz de importancia (i1) de mradermacher, cuya fuente declarada es HFCK99/Qwen3.8-27B-Uncensored-Cyber (a su vez basado en el modelo Aggressive de philbert440). Comparar Q2 frente a Q6 entre esas carpetas no mide únicamente el efecto de la cuantización.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Soporte bilingüe: inglés y chino.
- Variante "uncensored": sin filtros de moderación del alineamiento original, orientada a casos donde el usuario controla el comportamiento del modelo.
- Variante "Cyber": especializada según su linaje en contenidos sin restricciones de tipo "cyber" (según la model card de origen; no se detallan capacidades específicas).
- Soporte de MTP (multi-token prediction) como módulo acompañante opcional, enlazado en el repositorio (verificado en texto+MTP sobre RTX PRO 6000 Blackwell).
- Compañeros opcionales de visión enlazados, no duplicados por cuantización.
- No hay evidencia documentada de tool calling, agentes ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Chatbot local sin censura: con el archivo Q4_K_M general (16,81 GB) se puede desplegar un asistente conversacional multi-turno en una GPU de 24 GiB, controlando el usuario los límites de contenido.
- Investigación sobre cuantización: la separación explícita de linajes y los checksums permiten estudiar el efecto real de cada nivel de cuantización sobre un mismo checkpoint, evitando contaminación entre linajes.
- Despliegues reproducibles: el uso de `--revision` con el recibo de publicación verificado permite fijar el snapshot exacto de pesos en pipelines de producción.
- Preservación de modelos: el repositorio actúa como espejo de preservación (tag preservation-mirror) para garantizar que cuants de editores pequeños (orcarouter, philbert440, HFCK99) no se pierdan.
- Experimentación con arquitecturas híbridas GDN: al requerir llama.cpp con soporte `qwen35`, es útil para probar el soporte de Gated DeltaNet en runtimes propios.
- Uso en hardware de gama alta con MTP: la variante Cyber v2 Q6 con módulo MTP está verificada sobre RTX PRO 6000 Blackwell para inferencia acelerada con predicción multi-token.
- Inferencia en CPU o equipos sin GPU dedicada: los archivos Q2_K (10,86 GB) pueden ejecutarse parcialmente en CPU con suficiente RAM del sistema mediante offload parcial en llama.cpp.

## Benchmarks y rendimiento

El repositorio enlaza evidencia de rendimiento en `PERFORMANCE.json` y un dataset público de resultados de evaluación (isilicon/mango-evaluation-results), pero la información proporcionada no incluye números concretos de benchmarks (MMLU, HumanEval, GSM8K, etc.). No se han publicado resultados de benchmarks en la información disponible. La model card aclara además que sus recomendaciones de cuantización son de formato/almacenamiento, no rankings de calidad medidos, y que la única prueba certificada es la ejecución de Cyber v2 Q6 (texto+MTP) sobre una RTX PRO 6000 Blackwell.

## Requisitos de hardware

- VRAM estimada (contexto corto ~4K tokens, batch 1, todas las capas en GPU, según la model card):
  - Q2_K: ~16 GiB (archivo de 10,86 GB)
  - Q3_K_M: ~16–24 GiB (archivo de 13,50 GB)
  - Q4_K_M: ~24 GiB (archivos de 16,81–18,97 GB)
  - Q6_K: ~32 GiB (archivos de 22,43–23,71 GB)
  - Hace falta margen adicional para la caché KV, buffers de cómputo, MTP, visión y memoria del sistema operativo.
- GPU recomendadas: la única configuración certificada es NVIDIA RTX PRO 6000 Blackwell (Cyber v2 Q6, texto+MTP). Para 24 GiB, una RTX 3090/4090 debería alojar Q4_K_M; para Q6_K se necesita una GPU de 32 GiB o superior. Otras GPU y cuants no están certificados por Mango.
- Consumer GPUs: Q2_K y Q3_K_M caben en GPUs de 16 GiB (p. ej. RTX 4080/4090 parcialmente, RTX 5080 16 GiB); Q4_K_M cabe en GPUs de 24 GiB (RTX 3090, RTX 4090); Q6_K requiere 32 GiB (RTX 5090 no alcanza; se necesitaría RTX PRO 6000, A100 40 GB o similar).
- Apple Silicon: ruta inferida vía llama.cpp Metal con soporte GDN híbrido; sin mediciones de velocidad publicadas. Hay que presupuestar la RAM unificada compartida entre OS y GPU.
- AMD: builds recientes ROCm o Vulkan; soporte no medido, hay que verificar compatibilidad de build y drivers.
- CPU / CPU+GPU mixto: soportado en principio con llama.cpp reciente; la velocidad depende fuertemente del CPU y del ancho de banda de memoria.
- Runtimes: llama.cpp actual (arquitectura híbrida GDN / `qwen35`), aplicaciones compatibles con GGUF equivalentes, y por extensión Ollama o LM Studio si soportan la arquitectura. Los cargadores MLX-only no pueden cargar estos GGUF. No hay información sobre vLLM o TGI.
- Latencia y throughput: no disponible (no se publican mediciones más allá de la prueba certificada en Blackwell).

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Cuants | Licencia | Particularidad |
|---|---|---|---|---|---|
| Mango Qwen3.8 27B GGUF (este) | 27,32 B | GGUF | Q2_K–Q6_K | Apache 2.0 | Espejo de preservación con 2 linajes (general y Cyber), checksums y pines de origen |
| Qwen3-32B (oficial) | 32,8 B | Safetensors + GGUF comunitarios | variadas | Apache 2.0 | Modelo oficial con soporte de razonamiento, tool calling y contexto largo documentado |
| Qwen3-30B-A3B (oficial) | 30,5 B (3,3 B activos, MoE) | Safetensors + GGUF comunitarios | variadas | Apache 2.0 | MoE con inferencia más rápida por token activo reducido |
| Qwen2.5-32B | 32,5 B | Safetensors + GGUF comunitarios | variadas | Qwen license (restricciones >100M usuarios) | Arquitectura transformer densa clásica, sin GDN |

La comparación con Qwen3-30B-A3B es relevante: aunque tiene más parámetros totales, sus 3,3 B activos lo hacen mucho más rápido en consumer hardware que este modelo denso de 27 B. La ventaja de Mango Qwen3.8 27B es la arquitectura híbrida GDN (potencialmente más eficiente en contexto largo) y la variante uncensored, que los modelos oficiales no ofrecen.

## Limitaciones y advertencias

- Variante "uncensored": el modelo carece de salvaguardas de alineación. Su uso conlleva riesgos legales y éticos significativos; el operador asume toda la responsabilidad del contenido generado.
- Linajes de checkpoint mezclados: los cuants Q2/Q3 de `cyber/hfck99/` y los Q4/Q6 de `cyber/v2/` provienen de linajes declarados distintos; compararlos no mide solo el efecto de la cuantización.
- Compatibilidad de runtime: se necesita llama.cpp reciente con soporte GDN híbrido / `qwen35`; runtimes antiguos rechazan los archivos. Los cargadores MLX no son compatibles.
- Contexto: no se publica la longitud de contexto real; las estimaciones de VRAM asumen solo ~4K tokens, con headroom adicional necesario para KV cache y buffers.
- Estimaciones de hardware no certificadas: solo la combinación Cyber v2 Q6 + RTX PRO 6000 Blackwell ha sido probada por el editor; el resto son estimaciones de planificación.
- Riesgo de alucinación: inherente a modelos de lenguaje de este tipo; no hay datos publicados que cuantifiquen la fiabilidad factual.
- Sesgos: no documentados en la información disponible; al tratarse de una variante sin censura, los sesgos del modelo base pueden manifestarse sin mitigación.
- Licencia: Apache 2.0 permite uso comercial, pero hay que revisar las licencias de los modelos base upstream (NOTICES.md) para confirmar que toda la cadena es compatible.
- Tamaño del repositorio: 130,7 GB completos; descargar solo el archivo necesario mediante `hf download` selectivo y verificar el SHA256 contra `CHECKSUMS.sha256`.
- Cobertura lingüística limitada a inglés y chino; el rendimiento en castellano no está documentado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/isilicon/mango-qwen38-27b-gguf
- Guía de hardware: https://huggingface.co/isilicon/mango-qwen38-27b-gguf/blob/main/HARDWARE.md
- Datos de rendimiento: https://huggingface.co/isilicon/mango-qwen38-27b-gguf/blob/main/PERFORMANCE.json
- Resultados de evaluación: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Sumas de verificación: https://huggingface.co/isilicon/mango-qwen38-27b-gguf/blob/main/CHECKSUMS.sha256
- Procedencia y avisos: https://huggingface.co/isilicon/mango-qwen38-27b-gguf/blob/main/NOTICES.md
- Modelo base (Cyber, cuants de mradermacher): https://huggingface.co/mradermacher/Qwen3.8-27B-Uncensored-Cyber-GGUF
- Modelo base (general, Orca): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Modelo base (Cyber v2, philbert440): https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber-GGUF
- Discord de soporte: https://discord.gg/5n5YDbQCMy
- No se han encontrado papers, blogs ni demos adicionales en la búsqueda web.
