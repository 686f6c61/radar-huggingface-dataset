# ashesofthem/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4

## Resumen

El modelo se distribuye bajo el identificador `ashesofthem/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4` y es un ajuste fino derivado de `Qwen/Qwen3.8-27B`. Lo publica el usuario `ashesofthem`, si bien la model card reproduce íntegramente el texto de la familia de liberaciones de DavidAU (GGUF, "Heretic", "NEO-CODER MAX"), por lo que el autor efectivo del ajuste y el reuploader no coinciden. El repositorio no registra descargas ni "likes" en el momento de la consulta.

El sufijo del nombre indica dos rasgos técnicos centrales: por un lado, un ajuste orientado a eliminar el comportamiento de rechazo ("uncensored" / "heretic"); por otro, una cuantización en formato NVFP4 (etiqueta `modelopt`), el formato de coma flotante de 4 bits de NVIDIA pensado para GPUs Blackwell y para el ecosistema TensorRT-LLM. La pipeline declarada es `image-text-to-text`, de modo que la entrada no se limita a texto.

Un dato relevante y llamativo: pese a que el nombre comercial dice "27B", los safetensors publicados suman 18.800.348.400 parámetros, muy por debajo de esa cifra. El repositorio ocupa 30,1 GB, coherente con un modelo multimodal cuantizado y con ficheros auxiliares de escalas de cuantización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura; las etiquetas apuntan a un transformer multimodal) |
| Parametros totales | 18.800.348.400 (segun safetensors; el nombre del modelo indica "27B") |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (este repositorio, etiqueta `modelopt`); el proyecto publica tambien GGUF en repositorios paralelos |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cuantizados en NVFP4) |

## Arquitectura y entrenamiento

No se proporciona en la informacion disponible ninguna descripcion de la arquitectura interna (tipo de attention, número de capas, dimensión oculta ni configuración del codificador visual). Los datos que sí aparecen son de proceso de ajuste: la model card menciona "Cold Fusion", "GAIN Training", "Multi-stage tuning" y el uso de Unsloth, junto con un pipeline de varias etapas ("Stage 1b", "Stage2", "Branch 3"). Se indica que intervinieron varios ajustes finos previos del mismo autor, propios y de terceros, trabajados por "Nightmedia" en las tres primeras etapas antes del proceso "heretic" y del benchmarking.

El componente "heretic"/"uncensored" implica un ajuste deliberado para reducir las negativas del modelo base ante determinadas peticiones. La cuantización NVFP4 se ha generado con herramientas de NVIDIA (`modelopt`), orientada a despliegue en Blackwell. No hay información sobre volumen de tokens de entrenamiento, composición del dataset, ni sobre si se emplearon RLHF, DPO u otras técnicas de alineación posteriores al ajuste. Tampoco se documentan innovaciones de inferencia (decodificación especulativa, atención lineal) más allá de las etiquetas "MTP" y "NEO" que aparecen en los repositorios GGUF hermanos, no en este.

## Capacidades

La información disponible es en gran medida promocional y no verificable de forma independiente. Con ese caveat:

- Entrada multimodal: la pipeline declarada es `image-text-to-text`, por lo que se espera procesamiento conjunto de imagen y texto, aunque no se detalla el tipo de tareas visuales soportadas.
- Generación de texto conversacional: la etiqueta `conversational` apunta a uso de chat multi-turno.
- Modo de razonamiento: la model card describe, para los modelos hermanos de la familia, entre 5 y 10 modos conmutables de razonamiento e instrucción, y reducciones de tokens de razonamiento de entre 1/2 y 1/20. No se confirma que este repositorio concreto los incorpore.
- Reducción de tokens de razonamiento: se menciona "token reduction (1/2 a 1/10)" como característica de la línea Qwen3.8 ajustada.
- Ausencia deliberada de rechazos: el ajuste "heretic" busca eliminar negativas y filtros editoriales.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Tool calling / function calling: no disponible; no se documenta soporte explícito.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta explícitamente.

## Casos de uso

- Análisis de documentos con componente visual: al declarar pipeline `image-text-to-text`, puede emplearse para extraer y resumir información de capturas, diagramas o documentos escaneados en inglés, combinando la parte visual con generación de texto.
- Generación de código asistida: partiendo del Qwen base, un ajuste de este tipo suele conservar competencia en código; encajaría en asistentes de programación con contexto de repositorio, siempre que se valide empíricamente el efecto del ajuste y de la cuantización NVFP4 sobre la calidad del código generado.
- Investigación sobre alineación y red teaming: al ser un modelo explícitamente "uncensored", resulta útil como caso de estudio para medir qué comportamientos se pierden o se degradan tras eliminar los rechazos, y para construir conjuntos de evaluación de seguridad.
- Escritura creativa de ficción sin restricciones editoriales: narrativa, guiones y roleplay donde el modelo base podría rechazar temáticas adultas o violentas; es el caso de uso principal declarado por la familia.
- Prototipado de producto en inglés: chat multi-turno y generación de texto para demos y pruebas internas, en inglés y con licencia Apache-2.0, sin coste de licencia comercial.
- Despliegue en infraestructura Blackwell: la variante NVFP4 está pensada para servir el modelo con TensorRT-LLM o vLLM sobre GPUs Blackwell, reduciendo el coste por token frente a BF16 en el mismo hardware.
- Extracción y clasificación de información en pipelines por lotes: procesamiento masivo de texto en inglés con throughput alto gracias a la cuantización de 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este modelo concreto. La model card afirma que existen "benches" y comparativas en los repositorios GGUF enlazados, pero no reproduce cifras. Las únicas puntuaciones numéricas que aparecen en el texto se refieren a otros modelos de la familia (por ejemplo, 640 en ARC-C para el Qwen3.5-9B ajustado) y no son aplicables a este repositorio. Cualquier cifra de rendimiento de esta ficha queda pendiente de verificación independiente.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parámetros (18.800.348.400), no datos publicados por el autor.

- Peso en NVFP4: aproximadamente 11-12 GB solo de pesos; con caché KV y activaciones, un presupuesto realista de 13-16 GB de VRAM.
- NVFP4 nativo: requiere GPUs NVIDIA Blackwell (B200, GB200, RTX 5090, RTX PRO 6000 Blackwell) y soporte de kernels NVFP4 en el runtime (TensorRT-LLM, vLLM). En GPUs Ada o Ampere no hay ejecución NVFP4 nativa.
- Alternativa GGUF: los repositorios hermanos publican cuantizaciones GGUF, lo que permite ejecución en GPUs consumer no Blackwell.
- Consumer GPU: en cuantización de 4 bits cabría en una RTX 4090 (24 GB) o RTX 5090 (32 GB) con margen; en 8 bits (unos 20 GB) exigiría 24 GB o más; en BF16 (unos 38 GB) sería necesario A100 80 GB, H100 80 GB o dos GPUs de 24 GB.
- Opciones de despliegue: TensorRT-LLM y vLLM para NVFP4; llama.cpp y Ollama para las versiones GGUF; TGI si se convierte a un formato soportado. Los endpoints compatibles (`endpoints_compatible`) permiten integración directa vía API.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (ashesofthem / NVFP4) | 18.800.348.400 | no disponible | apache-2.0 | safetensors NVFP4 | Cuantizado para Blackwell, multimodal, ingles |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | no disponible | no disponible | Modelo de partida declarado; no se aportan especificaciones |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | no disponible | no disponible | no disponible | safetensors y GGUF | Segunda liberacion de la familia, con modos de razonamiento conmutables |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF | no disponible | no disponible | no disponible | GGUF | Primera liberacion de la familia, con cuantizaciones DiMatrix |
| DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF | 9B (segun nombre) | no disponible | no disponible | GGUF | Alternativa mas ligera de la misma saga; la model card afirma 640 en ARC-C |

Los datos de los modelos comparados no se detallan en la informacion disponible, por lo que la comparacion se limita a nomenclatura, formato y licencia declarada.

## Limitaciones y advertencias

- Discrepancia de nomenclatura: el nombre indica 27B pero los safetensors suman 18,8B parámetros. Conviene verificar la configuración antes de dimensionar infraestructura.
- Model card no original: el README reproduce el texto de la familia DavidAU, no una ficha propia del repositorio. Parte del contenido describe otros modelos y otras liberaciones, lo que dificulta saber qué se aplica exactamente a estos pesos.
- Trazabilidad limitada: el autor del ajuste efectivo no queda claro y no se documentan datasets, número de tokens ni metodología de evaluación.
- Sin benchmarks verificables: no hay cifras de MMLU, HumanEval, GSM8K ni equivalentes para este modelo. Las afirmaciones de superioridad frente a otros Qwen 27B no están respaldadas con datos en la información disponible.
- Modelo "uncensored": la eliminación de rechazos incrementa el riesgo de generar contenido dañino, ilegal o inexacto. No es adecuado para despliegues orientados al público sin una capa de moderación externa.
- Riesgo de alucinación: no cuantificado; en modelos ajustados con técnicas agresivas de "de-censoring" es habitual observar degradación de la calibración factual.
- Idioma: solo inglés declarado. El rendimiento en castellano no está garantizado.
- Sesgos: no documentados. Al no haber evaluación publicada, no se puede caracterizar el sesgo demográfico, político o cultural.
- Licencia: Apache-2.0 permite uso comercial, pero se hereda del modelo base; conviene comprobar las condiciones del Qwen original, que puede imponer requisitos adicionales de atribución o restricciones de uso.
- Cuantización NVFP4: la pérdida de precisión frente a BF16 no está medida. La model card afirma para modelos hermanos un 99% del rendimiento de BF16 a 4 y 8 bits, pero no aporta metodología.
- Licencia de terceros: el README cita explícitamente Unsloth; conviene revisar sus términos si se redistribuye el modelo.
- Fecha de creación futura respecto a la fecha de consulta (2026-10-02), lo que impide contrastar el modelo con fuentes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ashesofthem/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-NVFP4
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF de la liberacion 1: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Liberacion 2 (TWIN-TURBO, GGUF): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-NM-DAU-NEO-MTP-GGUF
- Liberacion 2 (fuente): https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Version ULTRA HERETIC anunciada: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-ULTRA-HERETIC-Uncensored
- Proyecto "from scratch" (Branch 3): https://huggingface.co/DavidAU/Qwen3.8-27B-UltimateDetails2-stage1__The-Harley-Pelican
- Qwen3.6 27B de la misma saga: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.8 27B Cold Fusion GAIN: https://huggingface.co/DavidAU/Qwen3.8-27B-Cold-Fusion-GAIN-V1.1-NM-DAU-NEO-MAX-MTP-GGUF
- Qwen3.6 40B Deckard: https://huggingface.co/DavidAU/Qwen3.6-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking-NEO-CODE-Di-IMatrix-MAX-GGUF
- Qwen3.5 9B The Defiant: https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
