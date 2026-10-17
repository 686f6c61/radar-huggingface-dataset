# sky3c/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF

## Resumen

Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF es un repositorio de cuantizaciones GGUF publicado por el usuario sky3c sobre el ajuste fino homónimo de DavidAU, derivado a su vez de Qwen3.8-27B. El modelo subyacente es un fine-tune multietapa y multi-merge de 26.895.998.464 parámetros (26,9B) orientado a razonamiento, generación de código y escritura creativa, con la alineación de seguridad eliminada de forma explícita (etiquetas `heretic`, `uncensored` y `abliterated`).

La propuesta técnica declarada es TURBO: recortar el bloque de tokens de pensamiento entre la mitad y una décima parte respecto a Qwen3.8-27B sin degradar la calidad de salida, y emplear decodificación con MTP (multi-token prediction) para acelerar la generación. Se distribuyen cuantizaciones regulares y MTP con doble imatrix (Neo-CODER MAX), pensadas para inferencia local en GPU de consumo, con 262.144 tokens de contexto declarados por fuentes secundarias.

La relevancia del repositorio es doble: por un lado ofrece un modelo denso de ~27B en formatos de 4 y 8 bits aptos para una sola GPU de 24 GB; por otro, la práctica totalidad de sus cifras de rendimiento son automedidas por el autor y no han sido verificadas de forma independiente, por lo que deben tratarse como afirmaciones de marketing hasta su replicación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.8; variantes con decodificación MTP. Número de capas, cabezas y configuración de atención: no disponible |
| Parámetros totales | 26.895.998.464 (~26,9B) |
| Parámetros activos | No disponible (la nomenclatura no incluye sufijo tipo A3B; se asume denso, sin confirmación oficial) |
| Longitud de contexto | 262.144 tokens (256k), según fuentes secundarias; no confirmado en la model card |
| Tipos de cuantización | GGUF: IQ4_XS (4-bit), Q4 (p. ej. Q4KS), 8-bit; variantes regulares y MTP, todas con doble imatrix (Neo-CODER MAX). Modelo base en bfloat16 |
| Idiomas soportados | en, zh (declarados en la model card) |
| Licencia | apache-2.0 (declarada) |
| Formato de pesos | GGUF en este repositorio; bfloat16/safetensors en el modelo base de DavidAU |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.8 sometido a un proceso que el autor describe como multi-stage fine-tune, multi-fine-tune y multi-stage merge, con una etapa final de "uncensoring". El entrenamiento se realizó, según la model card, sobre hardware de consumo mediante Unsloth, aplicando dos metodologías propietarias: COLD FUSION (combinación de "GAIN" y Unsloth) y Fable Fusion 711. Los conjuntos de datos citados son DavidAU/Polar-STRICT-Datasets y DavidAU/F451-STRICT-Datasets; no se especifican número de tokens, composición exacta, ni si hubo etapas de RLHF o DPO.

Las innovaciones declaradas son tres: (1) reducción y reformateo del bloque de pensamiento, con una reducción mediana estimada por el autor de dos tercios y objetivos explícitos de mantener las métricas centrales sin "benchmaxing"; (2) soporte de MTP para acelerar la decodificación; y (3) cuantización con doble imatrix para preservar calidad en 4 bits. Este repositorio concreto no entrena nada: sky3c parte del modelo de DavidAU y publica los GGUF. No hay información sobre la herramienta exacta de cuantización ni sobre las matrices de importancia empleadas.

## Capacidades

- Generación de texto y razonamiento en modo "thinking", con tres modos de operación declarados y bloques de pensamiento deliberadamente más cortos que el modelo base.
- Generación de código (etiquetas `coder`, `NEO-CODER`), incluyendo el modo de razonamiento previo a la respuesta.
- Escritura creativa, ficción, narrativa de género y roleplay, con ajuste específico declarado para estos dominios.
- Pipeline `image-text-to-text` según los metadatos de HuggingFace; fuentes secundarias mencionan soporte de visión, aunque la model card no lo detalla.
- Multilingüe limitado a inglés y chino según los metadatos.
- Tool calling / function calling: el autor remite a la pestaña "community" afirmando un rendimiento destacado; no hay documentación técnica ni ejemplos verificables en la información disponible.
- Capacidad de agentes y razonamiento multi-paso: no documentada de forma específica; se infiere del soporte de tool calling declarado, sin confirmación.
- Decodificación MTP en las variantes correspondientes, orientada a aumentar tokens por segundo.

## Casos de uso

- Escritura creativa y ficción asistida en local: el ajuste declarado para narrativa y roleplay, junto con 256k de contexto, permite mantener arcos narrativos largos, fichas de personaje y continuidad estilística sin enviar material a la nube.
- Generación de código en estación de trabajo: en IQ4_XS cabe en una RTX 4090 y permite autocompletado, refactorización y explicación de código sobre repositorios pegados en el prompt, sin coste por token.
- Procesamiento de documentos largos: con 262.144 tokens se pueden resumir o extraer información de contratos, transcripciones o bases de código extensas, aunque el coste real de caché KV a esa longitud es prohibitivo en hardware de consumo y obliga a truncar.
- Generación de datos sintéticos y destilación: al estar desalineado, sirve para producir datasets de instrucciones o diálogos que un modelo con censura rechazaría; útil en investigación sobre datos y en ajuste de modelos pequeños.
- Red teaming y estudio de alineación: como modelo "abliterated" permite comparar el comportamiento con y sin capas de rechazo, analizando qué capacidades cambian tras la ablación.
- Prototipado de asistentes autoalojados para dominios internos (documentación técnica, soporte a desarrolladores) donde la ventana de contexto y el coste de inferencia importan más que la moderación estricta.
- Experimentación multimodal local: si se confirma el soporte de visión, permite probar flujos imagen-texto en una sola GPU sin depender de APIs.
- Reducción de coste en pipelines de inferencia por lotes: la menor generación de tokens de pensamiento reduce el tiempo y el gasto por petición en tareas de clasificación, extracción o reescritura a gran escala.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la model card del autor y de la documentación del repositorio; no hay arnés de evaluación, escala ni metodología publicados, y no se han replicado de forma independiente.

| Benchmark | Valor declarado | Contexto |
|---|---|---|
| ARC-C (8-bit) | 735 | "+144 puntos sobre Qwen 3.8 27B" según el autor; escala no especificada (no parece porcentaje) |
| ARC-C (4-bit) | 719 | IQ4_XS / Q4; mismo caveat de escala |
| ARC-E (8-bit) | 882 | Presentado como "zona de inteligencia" de modelos cerrados |
| MMLU | No disponible | Se afirma superar a Qwen3.8-27B, Qwen3.6-35B-A3B, Qwen3.6-27B y Qwen3.5-27B en "los 7 benchmarks críticos", sin cifras |
| HumanEval | No disponible | — |
| GSM8K | No disponible | — |

No se han publicado resultados de benchmarks verificables en la información disponible. Cualquier comparación con modelos cerrados basada en estas cifras carece de base metodológica.

## Requisitos de hardware

- BF16 (modelo base, sin cuantizar): ~56,31 GB de VRAM según llmrun.dev. Requiere H100 80 GB, A100 80 GB o dos A100 40 GB; no cabe en una GPU de consumo.
- 8-bit GGUF: estimación de ~30-34 GB incluyendo overhead. Encaja en A100 40 GB, H100 y en dos RTX 4090/3090; una RTX 5090 de 32 GB queda al límite.
- 4-bit IQ4_XS: estimación de ~15-17 GB. Cabe en RTX 4090/3090 (24 GB), RTX 4080/5080 (16 GB, muy justo) y en Mac con 24-32 GB de memoria unificada.
- Caché KV: a 262.144 tokens el consumo de caché domina el total y supera con creces el de los pesos; en la práctica hay que limitar el contexto, usar caché cuantizada (Q8/Q4) o aplicar atención con ventana.
- Despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y text-generation-webui son las rutas naturales para GGUF. Soporte de vLLM/SGLang/TGI para estos ficheros: no disponible; las variantes MTP probablemente requieran builds específicas de llama.cpp, sin confirmación.
- Latencia y throughput: no disponibles. El autor afirma ganancias por MTP y por reducción de tokens de pensamiento, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (sky3c / DavidAU, GGUF) | 26,9B | 262.144 tokens (no confirmado en card) | ARC-C 735 / ARC-E 882 declarados, sin verificar | apache-2.0 (declarada) | GGUF en HF, repo de 389 GB |
| Qwen3.8-27B (base) | ~27B | No disponible (la familia se documenta con 262.144) | Referencia frente a la que el autor mide la mejora | No disponible | Peso original del fabricante |
| Qwen3.6-35B-A3B | 35B totales, 3B activos (según nomenclatura) | No disponible | El autor afirma superarlo en sus 7 benchmarks; sin cifras | No disponible | No disponible |
| Qwen3.6-27B | 27B | No disponible | Ídem, sin cifras | No disponible | No disponible |

La comparación cuantitativa no es posible con la información disponible: solo hay afirmaciones cualitativas de superioridad y dos métricas ARC sin escala ni metodología.

## Limitaciones y advertencias

- Modelo desalineado de forma deliberada (`heretic`, `uncensored`, `abliterated`): no aplica filtros de rechazo, por lo que puede producir contenido violento, sexual, ilegal o dañino. No es apto para productos de cara al público ni para entornos sin moderación externa.
- Riesgo de alucinación estándar en un modelo de 27B, agravado por el recorte del bloque de razonamiento: menos tokens de pensamiento implica menos verificación interna en tareas de lógica o matemáticas.
- Idiomas: solo inglés y chino declarados. El rendimiento en castellano no está documentado y no debe asumirse.
- Benchmarks automedidos, sin arnés, escala ni código de evaluación publicados; la afirmación de superar a modelos cerrados no es contrastable. La nomenclatura "735/882" no corresponde a un porcentaje estándar de ARC.
- Fecha de creación (2026-10-17) y denominación "Qwen3.8": conviene verificar la procedencia y la versión exacta del modelo base antes de integrarlo, dado que el nombre no sigue necesariamente el esquema oficial de Qwen.
- Licencia apache-2.0 declarada por el publicador del GGUF; debe comprobarse que el modelo base de DavidAU y el Qwen3.8 original permiten redistribución y uso comercial en estos términos.
- Tamaño del repositorio: 389 GB, lo que implica descargar selectivamente el fichero GGUF concreto y no clonar el repositorio completo.
- Estado de "thinking mode": el modelo puede requerir plantillas de prompt y tokens especiales específicos; sin la plantilla de chat correcta la calidad cae de forma notable.
- Las variantes MTP pueden no ser compatibles con todos los runners; un fallo de carga no indica corrupción del fichero sino falta de soporte.

## Enlaces

- Repositorio HuggingFace (GGUF de sky3c): https://huggingface.co/sky3c/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Modelo base de DavidAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio GGUF del autor original: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Fichero IQ4_XS de ejemplo: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF/blob/main/Qwen3.8-27B-TurboFCFusion-735-882-Here-Uncen-NEO-CODER-MAX-LOW-MTP-IQ4_XS.gguf
- Colección Turbo Brilliance: https://huggingface.co/collections/DavidAU/turbo-brilliance-ai-constructs-50x-reasoning-instruct
- Ficha de referencia (aimodels.fyi): https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-neo-coder-max-mtp-gguf-davidau
- Ficha de referencia (aiany.app): https://aiany.app/item/qwen3-8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-neo-coder-max-mtp-gguf
- Requisitos de VRAM (llmrun.dev): https://llmrun.dev/model/davidau-qwen3-8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau
