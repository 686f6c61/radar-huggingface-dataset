# prithivMLmods/Groot-65B-A6B-261023-NVFP4-GGUF

## Resumen

Groot-65B-A6B-261023-NVFP4-GGUF es una cuantización en formato GGUF (NVFP4) del modelo Groot-65B-A6B-261023, desarrollado por GrootTeam y derivado de Qwen3.8-Flash-Next. Se trata de un modelo de razonamiento nativamente multimodal basado en arquitectura Mixture-of-Experts (MoE), con aproximadamente 65B de parámetros totales y unos 6B activados por token. La cuantización ha sido realizada con llama.cpp por el usuario prithivMLmods y publicada en Hugging Face.

El modelo está diseñado para tareas complejas del mundo real, codificación agéntica y tool calling nativo. Destaca por su eficiencia: con un 46,7 % menos de parámetros que Qwen3.5-122B-A10B y un 48,0 % menos que Qwen3.8-Flash-Next, obtiene una media de 51,51 puntos en 16 benchmarks, superando a Qwen3.5-122B-A10B en 14 de 16 pruebas (+12,89 puntos en conjunto) y a Qwen3.8-Flash-Next en HLE y NL2Repo-Bench, generando además un 23,9 % y un 28,3 % menos de tokens de salida respectivamente.

La variante NVFP4 en GGUF está optimizada específicamente para hardware NVIDIA Blackwell (RTX PRO 6000, serie RTX 50, B200, B300), aprovechando los Tensor Cores con aceleración nativa FP4. Incorpora Multi-Token Prediction (MTP) integrado en los pesos, lo que acelera la inferencia local mediante decodificación especulativa sin necesidad de un modelo draft separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal híbrido (12 capas Qwen Sparse Attention + 36 capas Gated DeltaNet), 256 expertos enrutados (10 activados + 1 compartido), capa MTP de 1,4B y tabla de lookup de embeddings n-gram de 51B |
| Parametros totales | 117.862.742.656 (safetensors del repo base); ~65B según la model card del modelo base |
| Parametros activos | ~6B por token (MoE) |
| Longitud de contexto | 262.144 tokens (256K), extensible a ~1M tokens vía YaRN |
| Tipos de cuantizacion | NVFP4 (este repo); el modelo base se publica también en BF16, FP8 y GGUF Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | qwen-community-1.0 (other) |
| Formato de pesos | GGUF (NVFP4) + archivo mmproj para capacidades multimodales |

## Arquitectura y entrenamiento

Groot-65B-A6B-261023 emplea una arquitectura MoE híbrida con 48 capas: 12 capas de Qwen Sparse Attention y 36 capas de Gated DeltaNet, una combinación de attention dispersa y capas recurrentes lineales que reduce el coste computacional en contextos largos. Cuenta con 256 expertos enrutados de los cuales se activan 10 más 1 compartido por token, lo que mantiene los parámetros activos en torno a 6B pese a los ~65B totales.

Una innovación destacable es la capa de Multi-Token Prediction (MTP) de 1,4B parámetros, que permite decodificación especulativa integrada en los propios pesos: cabezas de salida adicionales predicen múltiples tokens futuros en una sola pasada hacia adelante, sin requerir un modelo draft separado. Además, incorpora una tabla de lookup de embeddings n-gram de 51B parámetros que añade cero coste computacional activado y puede descargarse a la memoria del sistema (host memory offloading).

Según la model card, el modelo fue post-entrenado con menos de 0,1 mil millones de tokens open-source (post-training sobre la base de Qwen3.8-Flash-Next). No se ha especificado en la información disponible el uso de técnicas concretas de RLHF o DPO.

## Capacidades

- Generación de texto con razonamiento: modo thinking y preserved-thinking habilitados por defecto, con parámetro `reasoning_effort` ajustable (`xhigh`, `medium`, `low`) y modo non-thinking disponible.
- Multimodalidad nativa: pipeline image-text-to-text; incluye archivo mmproj para el proyector de visión en formato GGUF.
- Codificación agéntica: optimizado para tareas de código en flujos de trabajo con agentes.
- Tool calling nativo: soporte de llamada a funciones integrado en el modelo.
- Contexto largo: ventana nativa de 256K tokens, extensible a ~1M mediante YaRN.
- Decodificación especulativa vía MTP integrado en los pesos GGUF, compatible con llama.cpp.
- Eficiencia de generación: genera un 23,9 % y un 28,3 % menos de tokens de salida que Qwen3.5-122B-A10B y Qwen3.8-Flash-Next respectivamente.

## Casos de uso

- Codificación agéntica en repositorios grandes: con su ventana de 256K tokens (extensible a ~1M) puede mantener en contexto repositorios completos; destaca en NL2Repo-Bench, orientado a tareas de generación de código sobre bases de código reales.
- Asistentes de razonamiento profundo configurable: el parámetro `reasoning_effort` permite ajustar el gasto de cómputo según la tarea, desde respuestas rápidas (`low`) hasta razonamiento extensivo (`xhigh`).
- Análisis de documentos e imágenes: gracias a su naturaleza multimodal y al archivo mmproj incluido, puede procesar capturas, diagramas y documentos con contenido visual junto al texto.
- Inferencia local en estaciones de trabajo Blackwell: la cuantización NVFP4 está optimizada para RTX PRO 6000 y serie RTX 50, permitiendo ejecutar el contexto completo de 256K en una sola GPU de 96 GB.
- Sistemas con memoria unificada: funciona en GGUF o NVFP4 en equipos con 128 GB de memoria unificada (DGX Spark, AMD Strix Halo, Mac M5 Max), útil para despliegues locales sin GPU dedicada.
- Agentes con tool calling en producción: el soporte nativo de function calling y el modo preserved-thinking lo hacen adecuado para pipelines multi-paso donde el modelo invoca herramientas de forma iterativa.
- Despliegue eficiente en servidores: con ~6B de parámetros activos por token, el throughput por GPU es alto comparado con modelos densos de tamaño similar, y el MTP reduce adicionalmente la latencia de generación.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo base (media sobre 16 benchmarks; no se han detallado los valores individuales por benchmark en la información disponible):

| Métrica | Resultado |
|---|---|
| Media en 16 benchmarks | 51,51 |
| Frente a Qwen3.5-122B-A10B | Lo supera en 14 de 16 benchmarks (+12,89 puntos en conjunto) |
| Frente a Qwen3.8-Flash-Next | Lo supera en HLE y NL2Repo-Bench |
| Tokens de salida | 23,9 % menos que Qwen3.5-122B-A10B; 28,3 % menos que Qwen3.8-Flash-Next |

No se han publicado resultados individuales de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Este repo concreto (GGUF NVFP4): 149 GB de descarga; el archivo principal ocupa 149 GB más 908 MB del mmproj. Requiere GPU con soporte nativo FP4 (NVIDIA Blackwell: RTX PRO 6000, serie RTX 50, B200, B300).
- Contexto completo de 256K en GGUF: una sola GPU de 96 GB (RTX PRO 6000 Blackwell o H20).
- Sistemas de memoria unificada de 128 GB: DGX Spark, AMD Strix Halo, Mac M5 Max (en GGUF o NVFP4).
- FP8 (modelo base): una H200 o dos H100.
- BF16 (modelo base): cuatro GPUs de 80 GB (p. ej. A100/H100).
- La tabla de embeddings n-gram de 51B puede descargarse a memoria del sistema, reduciendo la huella en GPU.
- Opciones de despliegue: llama.cpp / llama-cli (formato nativo de este repo), además de SGLang, vLLM, KTransformers y Hugging Face Transformers para el modelo base.
- No se han publicado cifras de latencia o throughput concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Groot-65B-A6B-261023 | ~65B | ~6B | 256K (hasta ~1M con YaRN) | qwen-community-1.0 | Media de 51,51 en 16 benchmarks; multimodal; MTP integrado |
| Qwen3.5-122B-A10B | ~122B | ~10B | no disponible | no disponible | Superado por Groot en 14 de 16 benchmarks (+12,89 puntos) |
| Qwen3.8-Flash-Next | ~125B (48 % más que Groot) | no disponible | no disponible | no disponible | Modelo base del que deriva Groot; superado en HLE y NL2Repo-Bench |

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés (en); no se declara soporte multilingüe ni para castellano.
- Licencia qwen-community-1.0: es una licencia de tipo "other" vinculada a la familia Qwen; conviene revisar sus términos antes de cualquier uso comercial, ya que pueden existir restricciones (la licencia enlaza con la de Qwen/Qwen3.8-Flash-Next).
- Hardware específico: la cuantización NVFP4 de este repo requiere GPUs NVIDIA Blackwell con soporte nativo FP4; en hardware más antiguo (Ampere, Hopper, Ada) no se beneficiará de la aceleración FP4 o puede no funcionar de forma óptima.
- El tamaño del archivo (149 GB) hace necesaria una descarga y almacenamiento considerables, además de suficiente VRAM o memoria unificada.
- Riesgo de alucinación: no evaluado específicamente en la información disponible; como todo LLM de razonamiento, las cadenas de pensamiento pueden contener pasos incorrectos presentados con confianza.
- Sesgos: no se ha publicado información sobre sesgos conocidos en la model card.
- La tabla de embeddings n-gram de 51B, aunque no consume cómputo activo, requiere memoria adicional si no se descarga al host.
- Datos de entrenamiento post-training muy reducidos (<0,1B tokens open-source), lo que puede limitar la cobertura en dominios poco representados en el modelo base.

## Enlaces

- Repositorio en Hugging Face (esta cuantización): https://huggingface.co/prithivMLmods/Groot-65B-A6B-261023-NVFP4-GGUF
- Archivo principal GGUF NVFP4: https://huggingface.co/prithivMLmods/Groot-65B-A6B-261023-NVFP4-GGUF/blob/main/Groot-65B-A6B-261023-NVFP4.gguf
- Archivo mmproj (proyector multimodal): https://huggingface.co/prithivMLmods/Groot-65B-A6B-261023-NVFP4-GGUF/blob/main/Groot-65B-A6B-261023-NVFP4.mmproj.gguf
- Modelo base: GrootTeam/Groot-65B-A6B-261023 (disponible en Hugging Face)
- Licencia: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Autor de la cuantización: https://huggingface.co/prithivMLmods
