# defnoteatin/PseudoBrain-Gemma-4-31B-BF16

## Resumen

PseudoBrain-Gemma-4-31B-BF16 es un modelo multimodal denso de 31.825.558.956 parametros (aproximadamente 31,8 mil millones) desarrollado por Ian Kurt Galeon (defnoteatin) a partir de Gemma 4 31B IT de Google. Su proposito es resolver el cuello de botella de memoria y computo en inferencia de contexto largo: en un transformer estandar la cache KV crece de forma lineal con la longitud de la secuencia y el prefill de forma cuadratica, lo que provoca OOM en cargas de trabajo de 128K a 1M de tokens incluso cuando los pesos caben holgadamente en la GPU. PseudoBrain sustituye parte de la atencion global por una combinacion de ventana deslizante acotada, Gated DeltaNet recurrente y una memoria exacta tipo Quest respaldada en NVMe y page cache.

La arquitectura híbrida consta de 60 capas: 50 con sliding window attention nativa y 10 capas de atencion global completa (indices 5, 11, 17, ..., 59, con head_dim=512) convertidas a SWA de 16K mas Gated DeltaNet paralelo mas Quest Exact Memory. El estado recurrente de GDN es de tamano fijo O(1) independientemente de si el contexto es de 4K o de 1M de tokens, y la cache KV a 1M de tokens se reduce un 92,2 por ciento (de unos 45,0 GB a unos 3,5 GB). El modelo se distribuye en cuatro ediciones de precision (W4A16, FP8, NVFP4 y BF16); esta ficha corresponde a la edicion BF16, con pesos de aproximadamente 62,0 GB y un requisito total de unos 66,5 GB de VRAM a 1M de tokens.

Es relevante ahora porque permite despliegues de contexto de un millon de tokens sobre aceleradores de 80 GB (A100, H100) y sobre DGX Spark de 128 GB, con un plugin de vLLM que soporta runners V1 y V2 y un fallback de ForwardContext sin hooks. El modelo esta publicado bajo licencia Gemma y esta pensado para despliegues on-premise de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 60 capas (50 SWA nativas + 10 capas globales convertidas a SWA 16K + Gated DeltaNet paralelo + Quest Exact Memory), head_dim=512 |
| Parametros totales | 31.825.558.956 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | BF16 (esta edicion); el autor publica ademas W4A16, FP8 y NVFP4 en repositorios separados |
| Idiomas soportados | No disponible |
| Licencia | Gemma |
| Formato de pesos | safetensors (libreria vLLM) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it y aplica la arquitectura PseudoBrain sobre las capas de atencion. De las 60 capas, 50 conservan sliding window attention nativa y las 10 capas de atencion global completa (5, 11, 17, ..., 59) se convierten en SWA de 16K mas Gated DeltaNet paralelo mas Quest Exact Memory. El estado recurrente de GDN tiene tamano fijo O(1), de modo que no crece con la longitud del contexto. En las capas de ancla dispersas, las consultas atienden sobre cuatro StreamingLLM Sinks, Super-Block Landmarks, las top-k paginas de Quest Exact Memory y una ventana deslizante de 16.384 tokens, combinadas mediante FlashAttention-2 con merge de LSE y limites jerarquicos de dos niveles en bf16 sobre super-bloques de 64 tokens (PB27_MEMORY_SUPERBLOCK=64).

El autor introduce ademas un Block RoPE proporcional por tramos y estrictamente no solapado (_reposition_rope_blocks): cada bloque recuperado ocupa 64 tokens y los huecos historicos se escalan de forma proporcional, preservando la continuidad local +1 en rachas contiguas y evitando el solapamiento de fase entre bloques no adyacentes, con una fidelidad de distancia macro-temporal superior al 99 por ciento a 1M de tokens sin degradacion estatica de YaRN. La agregacion global densa (PB27_MEMORY_GLOBAL_AGG="auto") detecta consultas globales de alta participacion y activa landmarks residentes de resumen de super-bloque (un token de resumen por cada 4.096 tokens en HBM), cobertura estratificada de la linea temporal y barridos de working set con rotacion por novedad. El decode desacopla el presupuesto de recuperacion del prefill del presupuesto constante de decode (PB27_MEMORY_DECODE_STRIDE=64, PB27_MEMORY_DECODE_BLOCKS=64). No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multimodal (pipeline image-text-to-text): acepta imagenes y texto como entrada.
- Razonamiento de multiples pasos sobre contextos de hasta 1M de tokens, con barridos de working set que recorren cientos de bloques distintos.
- Memoria exacta de largo plazo mediante Quest Exact Memory con recuperacion top-k de paginas y landmarks de resumen.
- Decodificacion de velocidad constante con estado recurrente O(1), independiente de la longitud del contexto.
- Capacidades heredadas del modelo base Gemma 4 31B IT (razonamiento, codigo, matematicas): no se detallan de forma explicita en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita, aunque el diseno de memoria de largo plazo esta orientado a razonamiento multi-paso sobre contextos extensos.
- Capacidades multilingues: no disponible.

## Casos de uso

- Analisis de repositorios de codigo completos: con 1M de tokens de contexto se puede cargar un monorepositorio entero y realizar preguntas transversales sobre arquitectura, dependencias o deuda tecnica, manteniendo la cache KV en unos 3,5 GB.
- Revision documental legal o regulatoria: procesamiento de expedientes de cientos de miles de tokens con recuperacion exacta de fragmentos concretos mediante Quest Exact Memory, sin perder trazabilidad de las citas.
- Despliegue on-premise en A100/H100 de 80 GB: la edicion BF16 ocupa unos 66,5 GB de VRAM a 1M de tokens, lo que permite servir contexto completo en una sola GPU sin fragmentar el modelo.
- Asistentes conversacionales de memoria larga: el estado GDN O(1) mantiene coste de decode constante aunque la conversacion crezca hasta el millon de tokens, adecuado para sesiones prolongadas de atencion al cliente o tutoria.
- Analisis de imagenes con contexto textual extenso: al ser image-text-to-text, permite combinar documentos visuales (capturas, diagramas, informes escaneados) con grandes volumenes de texto de referencia en una misma ventana.
- Investigacion sobre mecanismos de atencion eficiente: el modelo y su plugin pb27_vllm sirven como banco de pruebas reproducible para evaluar SWA, Gated DeltaNet y memoria exacta tipo Quest frente a transformers densos convencionales.
- Procesamiento de trazas y logs de sistemas: ingestión de trazas de aplicacion de gran volumen para correlacionar incidentes a lo largo de periodos extensos dentro de una unica ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor referencia un directorio de informes de benchmarks (reports/) en el repositorio de GitHub, pero no se incluyen cifras en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (edicion BF16): pesos de aproximadamente 62,0 GB; total de aproximadamente 66,5 GB a 1.000.000 de tokens.
- GPU recomendadas: A100 80 GB, H100 80 GB, DGX Spark de 128 GB, AMD MI300X.
- Cabe en GPU de consumo: no para la edicion BF16. El autor ofrece ediciones W4A16 y NVFP4 con aproximadamente 17,5 GB de pesos y 21,5 GB totales a 1M de tokens, orientadas a RTX 3090/4090 de 24 GB, RX 7900 XTX de 24 GB y RTX 5090 de 32 GB (esta ultima para NVFP4 en Blackwell).
- Opciones de despliegue: vLLM con el plugin pb27_vllm (soporte de runners V1 y V2 y fallback de ForwardContext sin hooks), instalable mediante pip desde el repositorio de GitHub o desde el directorio pb27_vllm_plugin incluido en el snapshot. El autor recomienda --enforce-eager, desactivar prefix caching, --kv-cache-memory-bytes 6G y --max-num-seqs 16, con VLLM_ALLOW_LONG_MAX_MODEL_LEN=1.
- Latencia y throughput estimados: no disponibles. El autor afirma decodificacion de velocidad constante gracias al estado O(1), pero no se aportan cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PseudoBrain-Gemma-4-31B-BF16 | 31,8B (denso) | 1.048.576 | Gemma | HuggingFace, vLLM con plugin | Cache KV reducida un 92,2 por ciento a 1M de tokens |
| google/gemma-4-31B-it | 31B (denso) | No disponible | Gemma | HuggingFace | Modelo base; sin extension de contexto PseudoBrain |
| RedHatAI/gemma-4-31B-it-FP8-dynamic | 31B (denso) | No disponible | Gemma | HuggingFace | Base cuantizada en FP8 dinamico empleada por el autor |
| cyankiwi/gemma-4-31B-it-AWQ-4bit | 31B (denso) | No disponible | Gemma | HuggingFace | Base cuantizada en AWQ de 4 bits empleada por el autor |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de Gemma 4 31B IT, hereda los sesgos del modelo base, no documentados aqui.
- Riesgo de alucinacion: no cuantificado. La recuperacion mediante Quest Exact Memory y landmarks de resumen puede omitir fragmentos relevantes si la seleccion top-k no los captura, lo que introduce riesgo adicional en tareas de recuperacion exacta.
- Limitaciones de contexto o idioma: el contexto maximo es de 1.048.576 tokens; los idiomas soportados no estan documentados.
- Restricciones de licencia: licencia Gemma, con las condiciones de uso comercial y redistribucion que impone Google para la familia Gemma; deben revisarse antes de un despliegue en produccion.
- La edicion BF16 requiere aproximadamente 66,5 GB de VRAM a 1M de tokens, lo que excluye GPU de consumo.
- El despliegue exige el plugin pb27_vllm y configuracion especifica (--enforce-eager, sin prefix caching, limites de KV cache); no es un checkpoint plug-and-play en vLLM estandar.
- El modelo tiene 25 descargas y 0 likes en el momento de la consulta, y fue creado el 31 de octubre de 2026, por lo que su validacion por terceros es practicamente inexistente.
- No se han publicado resultados de benchmarks que respalden las afirmaciones de rendimiento del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-31B-BF16
- Repositorio GitHub y plugin pb27_vllm: https://github.com/defnotean/pseudobrain
- Paper de arquitectura (PDF): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.pdf
- Paper de arquitectura (Markdown): https://github.com/defnotean/pseudobrain/blob/main/docs/PSEUDOBRAIN_ARCHITECTURE_PAPER.md
- Informes de benchmarks: https://github.com/defnotean/pseudobrain/tree/main/reports
- Perfil del autor en GitHub: https://github.com/defnotean
- Perfil del autor en HuggingFace: https://huggingface.co/defnoteatin
- Edicion FP8: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-31B-FP8
- Edicion NVFP4: https://huggingface.co/defnoteatin/PseudoBrain-Gemma-4-31B-NVFP4
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
