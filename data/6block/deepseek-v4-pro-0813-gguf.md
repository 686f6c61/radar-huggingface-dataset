# 6block/DeepSeek-V4-Pro-0813-GGUF

## Resumen

DeepSeek-V4-Pro-0813-GGUF es una colección de cuantizaciones sub-4-bit del modelo DeepSeek-V4-Pro-0813, desarrollada por el equipo 6block. El modelo original, creado por DeepSeek, es un MoE (Mixture of Experts) de 1,57 billones de parámetros con 48 mil millones de parámetros activos por token, 61 capas, 384 expertos enrutados (top-6) y un experto compartido. Esta versión GGUF está pensada para permitir la ejecución del modelo en entornos con recursos limitados, aunque sigue requiriendo hardware de alto nivel.

La relevancia de esta publicación radica en que los pesos originales del modelo vienen en FP4 (preempaquetados), lo que hace que la cuantización tradicional a 4 u 8 bits no aporte mejoras de calidad. Por ello, 6block se centra en cuantizaciones por debajo de 4 bits, ofreciendo cinco niveles que van desde Q3_K_M (711 GiB) hasta IQ1_S (314 GiB). Todas las versiones han sido calibradas con importance-matrix (imatrix) y verificadas con pruebas de perplejidad, documentando además los niveles que se descartaron por su mala relación calidad/tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con 61 capas, 384 expertos enrutados (top-6) + 1 experto compartido, atención dispersa (sparse attention) |
| Parametros totales | 1.572.999.528.803 (1,57 billones) |
| Parametros activos | 48 mil millones (48B) |
| Longitud de contexto | no disponible (en el ejemplo de uso se recomienda -c 8192) |
| Tipos de cuantizacion | Q3_K_M, IQ3_XXS, Q2_K, IQ1_M, IQ1_S (todos sub-4-bit) |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | GGUF (MXFP4 para tensores de expertos) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Pro-0813 es un MoE de enrutamiento disperso con 61 capas y 384 expertos enrutados (top-6) más un experto compartido. Incluye un mecanismo de atención dispersa con un indexador y compresores dedicados, lo que se refleja en la protección especial que 6block aplica a esos tensores durante la cuantización. Los pesos originales se distribuyen en FP4 (`expert_dtype: fp4`), con los tensores de expertos preempaquetados, de modo que la conversión a GGUF los escribe directamente como MXFP4 sin materializar BF16.

No se dispone de información sobre los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). La presente publicación es únicamente una cuantización, y el autor documenta que todas las versiones aquí publicadas son una segunda cuantización sobre el FP4 de fábrica, utilizando `--allow-requantize` obligatorio. La calibración imatrix se realizó sobre 220 fragmentos de un corpus multilingüe de 476 KB (EN/ZH), y los tensores no expertos se protegieron explícitamente: los de control por capa en F32, las proyecciones de atención y el experto compartido en Q8_0, el router en F32, y las embeddings y la salida en Q6_K.

## Capacidades

- Generación de texto y razonamiento complejo, dado que es un modelo de 1,57 billones de parámetros con 48B activos.
- Soporte multilingüe para inglés y chino (según los idiomas declarados).
- Capacidad de procesamiento de contexto largo, aunque no se especifica la longitud máxima; en el ejemplo de uso se emplea una ventana de 8192 tokens.
- Compatible con llama.cpp y Ollama para inferencia local, con soporte para descarga directa desde HuggingFace.
- No se dispone de información sobre tool calling, capacidades de agente, visión, audio u otras funciones específicas más allá de la generación de texto.

## Casos de uso

- Investigación en IA generativa: el modelo puede utilizarse para experimentos de razonamiento avanzado, análisis de textos largos y generación de contenido técnico, aprovechando su enorme capacidad de parámetros y su arquitectura MoE eficiente.
- Procesamiento de lenguaje natural multilingüe (EN/ZH): adecuado para tareas de traducción, resumen y análisis de sentimiento en ambos idiomas, gracias a su entrenamiento bilingüe declarado.
- Generación de código a gran escala: aunque no se confirma explícitamente, los modelos DeepSeek de gran tamaño suelen destacar en tareas de programación; puede integrarse en pipelines de desarrollo asistido por IA.
- Chatbots y asistentes conversacionales: con una ventana de contexto de al menos 8192 tokens, puede mantener conversaciones de múltiples turnos con historial extenso.
- Análisis de documentos técnicos y científicos: su capacidad de razonamiento profundo lo hace útil para extraer conclusiones de papers, informes o contratos largos.
- Despliegue en entornos de servidor con múltiples GPUs: las cuantizaciones sub-4-bit permiten ejecutar el modelo en clústeres de GPUs de alta gama, por ejemplo para servicios de inferencia compartida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona únicamente mediciones de perplejidad (PPL) sobre wikitext-2 con `n_ctx=512` y 12 fragmentos, que sirven para comparar entre las distintas cuantizaciones de este repositorio, pero no contra otros modelos o repositorios.

| Cuantizacion | Tamano | bpw | PPL (12 chunks) |
|---|---|---|---|
| Q3_K_M | 711,3 GiB | 3,88 | 1,6217 ± 0,0528 |
| IQ3_XXS | 577,0 GiB | 3,15 | 1,6708 ± 0,0547 |
| Q2_K | 547,0 GiB | 2,99 | 1,7621 ± 0,0594 |
| IQ1_M | 346,6 GiB | 1,89 | 3,6966 ± 0,1640 |
| IQ1_S | 314,1 GiB | 1,72 | 4,1095 ± 0,1799 |

El autor advierte que el PPL del master F16 GGUF se midió con 220 fragmentos (4,0795 ± 0,0458), por lo que no es directamente comparable con la tabla. La caída de calidad es abrupta entre Q2_K e IQ1_M, y los niveles IQ2_XS e IQ2_XXS fueron descartados por su mal rendimiento.

## Requisitos de hardware

- VRAM estimada: el archivo más pequeño (IQ1_S) ocupa 314,1 GiB, por lo que se necesitan al menos 4 GPUs de 80 GB (p. ej., 4x A100 80GB o 4x H100 80GB) para cargarlo completamente en VRAM. Para IQ3_XXS (577 GiB) se requieren 8 GPUs de 80 GB o 4 de 144 GB.
- GPU recomendadas: A100 80GB, H100 80GB, o GPUs de datacenter con gran memoria. No es viable en GPUs de consumo (RTX 4090, etc.) debido al tamaño mínimo de 314 GiB.
- Opciones de despliegue: llama.cpp (con `llama-server`), Ollama (creando un Modelfile). También es posible usar vLLM o TGI si se adaptan a GGUF, aunque no se menciona en la documentación.
- Latencia y throughput: no se proporcionan datos concretos. Dado el tamaño y la cuantización, se espera una latencia alta y un throughput moderado, dependiendo del número de GPUs y de la configuración de memoria.
- Advertencia importante: no se debe pasar `-ngl` ni `--n-cpu-moe` manualmente en llama.cpp, ya que esto provoca desbordamiento de VRAM en modelos de este tamaño. Se recomienda dejar que llama.cpp ajuste automáticamente la distribución entre CPU y GPU.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoría en la información proporcionada. El autor menciona que para versiones de 4 y 8 bits existe el repositorio [unsloth/DeepSeek-V4-Pro-0813-GGUF](https://huggingface.co/unsloth/DeepSeek-V4-Pro-0813-GGUF) con UD-Q4_K_XL (850 GB) y UD-Q8_K_XL (873 GB), pero no se ofrecen cifras de rendimiento comparables. Dado que el modelo base es único en su clase (1,57T parámetros), no hay alternativas de tamaño similar con licencia MIT en el ecosistema GGUF.

## Limitaciones y advertencias

- Doble cuantización: todos los niveles publicados son una segunda cuantización sobre el FP4 de fábrica, lo que implica pérdida adicional de calidad respecto al master F16.
- Calidad degradada en niveles extremos: IQ1_M e IQ1_S muestran un aumento significativo de PPL (3,70 y 4,11 respectivamente), lo que puede traducirse en alucinaciones y errores de razonamiento más frecuentes.
- Niveles IQ2 descartados: IQ2_XS e IQ2_XXS fueron rechazados por su mal rendimiento; el autor advierte que la cuantización IQ2 falla en este tipo de MoE de enrutamiento disperso.
- Comparabilidad limitada de PPL: las cifras de perplejidad solo son válidas dentro de este repositorio; no deben compararse con las de otros modelos o repositorios.
- Requisitos de hardware extremos: incluso la versión más pequeña (314 GiB) supera la capacidad de cualquier GPU de consumo, limitando su uso a entornos de datacenter.
- Idiomas limitados: solo se declaran inglés y chino; puede haber degradación en otros idiomas.
- Licencia MIT: permite uso comercial, pero se debe verificar si el modelo base tiene restricciones adicionales (no se indica en la documentación).
- Dependencia de la versión de llama.cpp: se requiere una build con soporte para `LLM_ARCH_DEEPSEEK4` (commit `4ed2b13` o posterior); versiones antiguas rechazarán el archivo.

## Enlaces

- Repositorio GGUF: [6block/DeepSeek-V4-Pro-0813-GGUF](https://huggingface.co/6block/DeepSeek-V4-Pro-0813-GGUF)
- Modelo base: [deepseek-ai/DeepSeek-V4-Pro-0813](https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813)
- Versiones 4-bit y 8-bit de unsloth: [unsloth/DeepSeek-V4-Pro-0813-GGUF](https://huggingface.co/unsloth/DeepSeek-V4-Pro-0813-GGUF)
- Herramienta de cuantización: [llama.cpp](https://github.com/ggerganov/llama.cpp)
