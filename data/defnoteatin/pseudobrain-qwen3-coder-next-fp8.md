# defnoteatin/PseudoBrain-Qwen3-Coder-Next-FP8

## Resumen

PseudoBrain-Qwen3-Coder-Next-FP8 es una adaptación del modelo Qwen3-Coder-Next de Alibaba Qwen, publicada por Ian Kurt Galeon (defnoteatin) bajo licencia Apache 2.0. El modelo parte del checkpoint base de Qwen y le aplica la arquitectura propietaria "PseudoBrain", que sustituye parte de las capas de atención completa por una combinación de atención de ventana deslizante de 16K, Gated DeltaNet recurrente y un sistema de memoria exacta por páginas ("Quest Exact Memory") gestionado desde un plugin de vLLM. El objetivo declarado es habilitar contextos de hasta 1.000.000 de tokens con un consumo de VRAM acotado, resolviendo el problema clásico de que la caché KV crece linealmente con la longitud de contexto.

El modelo tiene 80.079.012.864 parámetros totales (unos 80B) en una configuración MoE con aproximadamente 3B de parámetros activos por token (denominación "80B-A3B" en la model card). Está especializado en generación de código y flujos agénticos, y se distribuye en formato FP8 con pesos safetensors, pensado para desplegarse con vLLM. La propuesta técnica más relevante es la reducción de la caché KV en contextos largos: según el autor, el estado recurrente de Gated DeltaNet es de tamaño constante O(1) y la memoria de atención exacta se gestiona en tres niveles (NVMe, page cache y HBM), lo que permite servir 1M de tokens con un consumo muy inferior al de un transformer estándar.

Es relevante ahora porque los modelos de código con contexto extremo y capacidad agéntica son el cuello de botella habitual en pipelines de agentes autónomos, y esta variante propone una vía de despliegue en hardware relativamente asequible (2x RTX 3090/4090 para la edición cuantizada, H200 o MI300X para la FP8). No obstante, conviene señalar que se trata de una modificación de terceros no oficial, con pocas descargas y sin validación independiente publicada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE con Gated DeltaNet + atención de ventana deslizante y memoria exacta por páginas (PseudoBrain) |
| Parametros totales | 80.079.012.864 (~80B) |
| Parametros activos | ~3B por token (configuración 80B-A3B, según model card) |
| Longitud de contexto | Hasta 1.048.576 tokens (1M) |
| Tipos de cuantizacion | FP8 (este repo); el autor publica además ediciones W4A16, NVFP4 y BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (FP8), librería vLLM |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen3-Coder-Next (MoE de ~80B parámetros totales y ~3B activos) y le superpone la modificación PseudoBrain. De las 48 capas, 36 son Gated DeltaNet nativas (estado recurrente de tamaño fijo, O(1)) y 12 son capas de atención completa (índices 3, 7, 11, ..., 47) convertidas en atención de ventana deslizante de 16.384 tokens combinada con Gated DeltaNet paralela y un mecanismo de "Quest Exact Memory". Sobre las capas dispersas, las consultas atienden a un conjunto compuesto por 4 sinks de StreamingLLM, landmarks de superbloques, las top-k páginas de memoria exacta y la ventana deslizante de 16K, fusionadas mediante FlashAttention-2 con mezcla LSE.

El sistema de memoria se organiza en tres niveles (NVMe, page cache y HBM) con cotas jerárquicas de superbloques en bf16 (PB27_MEMORY_SUPERBLOCK=64). El posicionamiento RoPE se reimplementa como "Piecewise-Proportional, Strictly Non-Overlapping Block RoPE" para preservar la continuidad local (+1) entre bloques contiguos y evitar solapamiento de fase entre bloques no adyacentes, con el objetivo de mantener la fidelidad temporal macro a 1M de tokens sin degradación de YaRN estático. Además, se activa una agregación global densa que detecta consultas globales de alta participación y añade tokens resumen de superbloque (1 por cada 4.096 tokens), cobertura estratificada de la línea temporal y barridos de working-set con rotación por novedad durante la decodificación.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en la adaptación PseudoBrain. La model card describe la arquitectura y el motor de inferencia, pero no detalla el proceso de entrenamiento o ajuste. El autor afirma que la decodificación mantiene velocidad constante (O(1)) y que la caché KV a 1M de tokens se reduce un 93,5% (de ~48,0 GB a ~3,1 GB) gracias a la separación entre presupuesto de prefill y presupuesto de decodificación (PB27_MEMORY_DECODE_STRIDE=64, PB27_MEMORY_DECODE_BLOCKS=64).

## Capacidades

- Generación de texto y conversación multi-turno con contexto de hasta 1M de tokens.
- Generación y edición de código, con especialización declarada en tareas de programación y agentes ("coding", "agentic" en los tags).
- Soporte de tool calling / function calling, con parser `qwen3_coder` en vLLM y `--enable-auto-tool-choice`.
- Razonamiento multi-paso y flujos agénticos sobre repositorios o documentos extensos, apoyado en la memoria de largo plazo.
- Capacidad de contexto extremo con memoria recurrente constante, orientada a tareas de recuperación y razonamiento sobre grandes volúmenes de código.
- Capacidades multilingües: no disponible en la información proporcionada.
- No se declaran capacidades de visión ni de audio.

## Casos de uso

- Agentes de código autónomos sobre repositorios completos: el modelo puede mantener en contexto cientos de miles de tokens de código fuente y trazas de ejecución, lo que permite razonar sobre dependencias entre módulos sin trocear el repositorio en fragmentos inconexos.
- Revisión de pull requests a gran escala: con 1M de tokens de contexto, se puede cargar el diff completo junto con los ficheros afectados y el historial relevante, y generar comentarios de revisión con referencias cruzadas.
- Migración y refactorización de bases de código legacy: el modelo puede analizar múltiples ficheros simultáneamente y proponer cambios coherentes entre módulos, usando el tool calling para aplicar parches y ejecutar pruebas.
- Asistentes de documentación técnica: generar documentación y diagramas a partir de un repositorio o de una especificación extensa, manteniendo la coherencia terminológica a lo largo de todo el documento.
- Pipelines de CI/CD con verificación automática: integrado como servidor compatible con OpenAI en vLLM, el modelo puede ejecutar tareas de generación de tests, análisis estático asistido y corrección de errores en un bucle agéntico.
- Análisis de logs y trazas de producción: la ventana de 1M permite cargar sesiones completas de depuración y correlacionar eventos distantes en el tiempo, algo inviable con contextos de 32K–128K.
- Despliegue on-premise con requisitos de privacidad: al ser Apache 2.0 y ejecutable en vLLM sobre hardware propio (H200, MI300X, 2x RTX 4090 en la edición cuantizada), encaja en entornos donde el código no puede salir de la infraestructura del cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "Benchmark Receipts" en el repositorio de GitHub del autor (`reports/`), pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K u otras) en la información proporcionada, por lo que no se presentan datos numéricos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia a 1M de tokens (según el autor):
  - Edición FP8 (este repo): ~80,5 GB de pesos, ~85,0 GB totales a 1M de tokens.
  - Edición W4A16: ~41,5 GB de pesos, ~45,5 GB totales a 1M de tokens.
  - Edición NVFP4: ~41,5 GB de pesos, ~45,5 GB totales a 1M de tokens.
  - Edición BF16: ~160,0 GB de pesos, ~165,0 GB totales a 1M de tokens.
- GPU recomendadas para la edición FP8: H200 (141 GB), DGX Spark (128 GB), AMD Instinct MI300X (192 GB), 2x A100/H100.
- GPU recomendadas para las ediciones cuantizadas: 2x RTX 3090/4090 (48 GB), RTX 6000 Ada (48 GB), 2x RTX 5090, DGX Spark, AMD MI300X; en Blackwell, DGX Spark GB10, RTX PRO 6000 96 GB y B200.
- ¿Cabe en GPU de consumo? La edición FP8 no cabe en una sola GPU de consumo; las ediciones W4A16 y NVFP4 sí caben en configuraciones de 2x RTX 3090/4090 o 2x RTX 5090 (48 GB o más).
- Opciones de despliegue: vLLM (V1 y V2) con el plugin `pb27_vllm`, instalable vía `pip install --no-deps "git+https://github.com/defnotean/pseudobrain.git#subdirectory=serving/pb27_vllm"`. La model card indica compatibilidad con CUDA y ROCm. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se proporcionan cifras concretas. El autor afirma decodificación de velocidad constante O(1) a cualquier longitud de contexto, pero no se aportan tokens/s medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PseudoBrain-Qwen3-Coder-Next-FP8 | ~80B totales, ~3B activos | 1M | Apache 2.0 | HuggingFace (31 descargas) | Modificación de terceros sobre Qwen3-Coder-Next, requiere plugin vLLM |
| Qwen3-Coder-Next (base) | ~80B totales, ~3B activos | No disponible en la información | Apache 2.0 (según modelo base) | HuggingFace (modelo oficial) | Modelo oficial de Alibaba Qwen; sin la modificación de memoria PseudoBrain |
| Qwen3-Coder-Next-FP8 | ~80B totales, ~3B activos | No disponible en la información | Apache 2.0 | HuggingFace | Versión oficial cuantizada en FP8 del modelo base |
| Qwen3-Coder-Next-AWQ | ~80B totales, ~3B activos | No disponible en la información | Apache 2.0 | HuggingFace | Cuantización AWQ de terceros (qtum) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. Las alternativas de otros fabricantes con contexto de 1M (por ejemplo, modelos con arquitecturas híbridas o de atención lineal) no se detallan en la documentación disponible.

## Limitaciones y advertencias

- Es una modificación no oficial de un modelo de Alibaba Qwen; el autor no es el desarrollador original del modelo base.
- El repositorio tiene un número muy bajo de descargas (31) y ninguna validación independiente publicada; la madurez y el soporte son limitados.
- Requiere un plugin propietario de vLLM (`pb27_vllm`) y variables de entorno específicas; no funciona con el servidor vLLM estándar sin la instalación del plugin.
- El rendimiento real a 1M de tokens no está verificado con benchmarks públicos en la información disponible; las afirmaciones de reducción de memoria y velocidad constante provienen del propio autor.
- La model card indica desactivar el prefix caching (`--no-enable-prefix-caching`) y usar `--enforce-eager`, lo que puede afectar al throughput en producción.
- No se detallan los idiomas soportados; el comportamiento multilingüe no está garantizado más allá de lo que herede del modelo base.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de código donde una referencia inventada a una API puede compilar pero fallar en ejecución.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de una adaptación de terceros conviene revisar los términos del modelo base Qwen3-Coder-Next y de las dependencias del plugin.
- La información sobre el proceso de entrenamiento y ajuste es inexistente, lo que dificulta evaluar la fidelidad del modelo respecto al base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-Qwen3-Coder-Next-FP8
- Repositorio GitHub del proyecto PseudoBrain: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Benchmark receipts: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en HuggingFace: https://huggingface.co/defnoteatin
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-Next
- Modelo base en FP8: https://huggingface.co/Qwen/Qwen3-Coder-Next-FP8
- Variante AWQ: https://huggingface.co/qtum/Qwen3-Coder-Next-AWQ
- Variante NVFP4: https://huggingface.co/RedHatAI/Qwen3-Coder-Next-NVFP4
