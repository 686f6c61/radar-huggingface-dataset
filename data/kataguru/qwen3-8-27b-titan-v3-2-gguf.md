# kataguru/Qwen3.8-27B-Titan-v3.2-GGUF

## Resumen

Kataguru Titan v3.2 GGUF es un ajuste fino del modelo denso multimodal Qwen3.8-27B, desarrollado por el usuario kataguru y distribuido en formato GGUF cuantizado para inferencia local. Se trata de un modelo de 26.895.998.464 parámetros (aproximadamente 27B) con visión nativa, ventana de contexto nativa de 262.144 tokens y soporte de llamadas a herramientas, orientado a flujos agénticos y despliegue en hardware de consumo. Su base directa es kataguru/Qwen3.8-27B-Titan-v3.0-Uncensored-BF16, que a su vez procede de una cadena de fusiones y ajustes sobre Qwen3.8-27B.

El modelo se presenta como una variante "uncensored" con "zero refusal" (0,00 % de rechazos declarados en tareas legítimas) y una supuesta ortogonalización de activaciones denominada SOMA/ARA. El entrenamiento adicional de Kataguru se realizó sobre 32.282 muestras auditadas orientadas a agenticidad autónoma, llamadas a herramientas en formato MiniCPM-5 / Qwen3 XML y comprensión profunda del interlocutor. El autor publica una comparativa de 13 tareas de lm-evaluation-harness en la que el modelo alcanza 93,86 % en GSM8K, 63,13 % en GPQA Diamond y 85,61 % en IFEval (strict), con una media de 73,05 % en la configuración Inst Strict.

La relevancia del lanzamiento radica en que combina un modelo denso de 27B con visión y contexto de 262k en dos cuantizaciones GGUF calibradas con imatrix (IQ3_XXS de ~11 GB e IQ4_XS de ~15,2 GB), lo que permite ejecutarlo en GPUs de 12-24 GB mediante llama.cpp, LM Studio u Ollama. La licencia es Apache 2.0. El repositorio registra 0 descargas y 0 "me gusta" en el momento de la consulta, por lo que se trata de una publicación sin validación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (visión-lenguaje), heredado de Qwen3.8-27B |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos (262k) |
| Tipos de cuantizacion | IQ3_XXS (~11,0 GB) e IQ4_XS (~15,2 GB); proyector visual mmproj en F16 (889 MB) |
| Idiomas soportados | finés (fi), inglés (en), estonio (et), húngaro (hu), turco (tr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); la base BF16 original se distribuye en safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer denso multimodal de aproximadamente 27B parámetros, con un codificador visual conectado mediante un proyector (mmproj) en precisión F16 de 889 MB. La colección oficial de Kataguru describe la serie Titan como "27B Dense with Vision & MTP". El contexto nativo es de 262.144 tokens. El modelo base de la cadena es Qwen3.8-27B, un modelo denso visión-lenguaje de 27B de Alibaba, y sobre él se aplicaron una serie de fusiones de la comunidad (DavidAU) antes de los ajustes propios de Kataguru.

El ajuste adicional de Kataguru se realizó sobre la base kataguru/Qwen3.8-27B-Titan-v3.0-CP4000-BF16 más un Checkpoint-125 de entrenamiento de continuación. El conjunto de datos declarado son 32.282 muestras auditadas centradas en agenticidad autónoma, llamadas a herramientas en el formato MiniCPM-5 / Qwen3 XML y modelado de comprensión del usuario. El autor menciona una técnica de "ortogonalización de activaciones SOMA/ARA" para lo que denomina honestidad epistémica y ausencia de rechazos. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset ni si se emplearon RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 262.144 tokens.
- Razonamiento matemático con cadena de pensamiento: 93,86 % en GSM8K (exact match estricto).
- Razonamiento STEM de nivel doctoral: 63,13 % en GPQA Diamond.
- Comprensión de imágenes: análisis visual completo mediante el proyector mmproj en F16.
- Llamadas a funciones y herramientas en formato MiniCPM-5 y Qwen3 XML.
- Flujos agénticos autónomos y razonamiento multi-paso, según el entrenamiento declarado.
- Capacidades multilingües en finés, inglés, estonio, húngaro y turco.
- Comportamiento "zero refusal" (0,00 % de rechazos declarados en tareas legítimas).
- Seguimiento estricto de instrucciones: 85,61 % en IFEval (Inst Strict) y 80,78 % (Prompt Strict).
- Conocimiento clínico y biomédico: 83,97 % en MedQA (4 opciones).
- No se documenta en la información disponible un modo de razonamiento explícito ("thinking mode") ni capacidades de audio o vídeo más allá de la referencia genérica a visión del modelo base.

## Casos de uso

- Asistente conversacional local en finés: el modelo está ajustado específicamente para este idioma y puede mantener diálogos multi-turno con contexto de 262k tokens, lo que permite incorporar documentos largos completos en la ventana sin truncar.
- Análisis de documentos escaneados e imágenes: gracias al proyector mmproj en F16, se pueden procesar capturas, diagramas o formularios y extraer información estructurada en un pipeline local con llama.cpp.
- Agentes autónomos con tool calling: el entrenamiento en formatos MiniCPM-5 / Qwen3 XML permite integrar el modelo en orquestadores de agentes que invocan APIs o funciones externas, con razonamiento multi-paso.
- Resolución de problemas matemáticos y verificación de cálculos: el 93,86 % en GSM8K lo hace adecuado para asistentes de tutoría o validación de expresiones en flujos educativos.
- Atención al cliente multilingüe en el Báltico y Turquía: cubre finés, estonio, húngaro y turco, idiomas con menor cobertura en modelos abiertos, con un contexto extenso para historiales de conversación largos.
- Generación de código asistida en local: hereda del linaje Qwen3.8-27B la capacidad de codificación, permitiendo autocompletado y refactorización sin enviar código a servicios externos.
- Análisis clínico preliminar o apoyo documental sanitario: el 83,97 % en MedQA sugiere utilidad para resumir literatura médica o responder preguntas de formación, siempre con supervisión humana.
- Procesamiento de expedientes largos en hardware de consumo: con IQ4_XS (~15,2 GB) cabe en GPUs de 16-24 GB, lo que permite desplegar análisis documental en una estación de trabajo sin clúster.

## Benchmarks y rendimiento

Resultados declarados por el autor con lm-evaluation-harness. No han sido verificados de forma independiente.

| Tarea | Metrica | Qwen 3.8 27B Base | Titan v3.0 CP4000 | Titan v3.2 (CP125) | Delta vs Base |
|---|---|---|---|---|---|
| gsm8k | exact_match (strict) | 73,10 % | 94,54 % | 93,86 % | +20,76 pp |
| gpqa_diamond | exact match (choice) | 44,60 % | 60,10 % | 63,13 % | +18,53 pp |
| ifeval | Prompt strict | 35,0 % | 73,94 % | 80,78 % | +45,78 pp |
| ifeval | Inst strict | 45,0 % | 80,82 % | 85,61 % | +40,61 pp |
| boolq | acc | 89,20 % | 91,41 % | 91,07 % | +1,87 pp |
| truthfulqa_mc2 | acc (multi-true) | 51,10 % | 55,03 % | 54,93 % | +3,83 pp |
| truthfulqa_mc1 | acc (single-true) | 34,60 % | 36,72 % | 36,96 % | +2,36 pp |
| medqa_4options | acc_norm | 82,64 % | 84,37 % | 83,97 % | +1,33 pp |
| arc_challenge | acc_norm | 66,50 % | 65,44 % | 65,27 % | -1,23 pp |
| arc_easy | acc | 85,40 % | 86,20 % | 86,07 % | +0,67 pp |
| winogrande | acc | 77,30 % | 77,35 % | 77,11 % | -0,19 pp |
| hellaswag | acc_norm | 83,90 % | 82,98 % | 82,92 % | -0,98 pp |
| openbookqa | acc_norm | 45,10 % | 46,20 % | 46,60 % | +1,50 pp |
| piqa | acc_norm | 81,80 % | 82,32 % | 82,21 % | +0,41 pp |
| Media (13 tareas, Prompt Strict) | aritmética | 65,40 % | 72,05 % | 72,68 % | +7,28 pp |
| Media (13 tareas, Inst Strict) | aritmética | 66,17 % | 72,58 % | 73,05 % | +6,89 pp |

## Requisitos de hardware

- IQ3_XXS: fichero de ~11,0 GB. Recomendación del autor: GPU de 12 GB con contexto limitado o de 16 GB con contexto amplio.
- IQ4_XS: fichero de ~15,2 GB. Recomendación del autor: GPU de 16 GB en el límite o de 24 GB o más para máxima calidad.
- Proyector visual mmproj-F16: 889 MB adicionales si se quiere usar visión.
- GPUs de consumo compatibles: RTX 3060 12 GB, RTX 4070 Ti / 4080 16 GB, RTX 3090 / 4090 24 GB. El tamaño del repositorio completo es de 27,2 GB, por lo que ambos cuantizados conviven en disco sin problema.
- Despliegue: LM Studio 0.3+, llama.cpp (build b11064 o superior) y Ollama son los entornos recomendados por el autor. Para el modelo base en BF16/AWQ existe soporte en vLLM según la documentación de terceros.
- Latencia y throughput: no disponibles para este GGUF concreto. Como referencia externa no verificada, la documentación de HyperQwen reporta para el Qwen3.8-27B base con vLLM en una tarjeta de 24 GB: 127 tok/s en un solo usuario, ~1.035 tok/s con 64 peticiones concurrentes y contexto de 150k-262k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kataguru Titan v3.2 GGUF (este) | 26,9B denso + vision | 262.144 tokens | GSM8K 93,86 %; GPQA Diamond 63,13 %; IFEval strict 85,61 % | Apache 2.0 | GGUF (IQ3_XXS, IQ4_XS); AWQ y NVFP4 en la serie |
| Kataguru Titan v3.0 CP4000 | 26,9B denso + vision | 262.144 tokens (heredado) | GSM8K 94,54 %; GPQA Diamond 60,10 %; IFEval strict 80,82 % | Apache 2.0 (segun linaje) | BF16 y GGUF en variantes de la serie |
| Qwen3.8-27B base | 27B denso + vision | 262.144 tokens nativos | GSM8K 73,10 %; GPQA Diamond 44,60 %; IFEval strict 45,0 % | Apache 2.0 | safetensors, NGC, vLLM |
| Kataguru Sceptic 35B MoE | 35B MoE | no disponible | no disponible | no disponible | GGUF Dual-Quant, vLLM AWQ, NVFP4 |

## Limitaciones y advertencias

- Los benchmarks son autoinformados por el autor y no cuentan con verificación independiente. El repositorio tiene 0 descargas y 0 "me gusta" en el momento de la consulta.
- El modelo se comercializa como "uncensored" y "zero refusal": puede generar contenido que otros modelos rechazarían. Requiere moderación externa en cualquier despliegue de producción orientado al público.
- Como todo modelo de lenguaje, presenta riesgo de alucinación, especialmente en dominios factuales donde los datos de ajuste son escasos. Las puntuaciones de TruthfulQA (54,93 % en mc2 y 36,96 % en mc1) reflejan esta limitación.
- El linaje incluye fusiones no oficiales de la comunidad (DavidAU) sobre Qwen3.8-27B, lo que dificulta trazar exactamente qué capacidades provienen del modelo original y cuáles de las fusiones.
- Cobertura idiomática restringida a finés, inglés, estonio, húngaro y turco. No hay evidencia de rendimiento en castellano.
- Las cuantizaciones IQ3_XXS e IQ4_XS son con pérdida. El propio autor describe IQ4_XS como la opción de "máxima precisión" frente a IQ3_XXS, lo que implica degradación medible en la variante de 3 bits.
- Las afirmaciones sobre "ortogonalización de activaciones SOMA/ARA" y "honestidad epistémica" no vienen respaldadas por publicaciones técnicas ni evaluaciones reproducibles en la información disponible.
- Existe una discrepancia no resuelta en la model card entre Checkpoint-125 (v3.2), CP4000 (v3.1) y Checkpoint-4000, lo que complica la trazabilidad de versiones.
- Aunque la licencia es Apache 2.0, conviene verificar las licencias de los modelos intermedios de la cadena de fusiones antes de un uso comercial.
- La variante de 1M de contexto pertenece a otro repositorio (Titan-v3.0-1M-GGUF); este v3.2 declara 262k nativos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kataguru/Qwen3.8-27B-Titan-v3.2-GGUF
- Modelo base: https://huggingface.co/kataguru/Qwen3.8-27B-Titan-v3.0-Uncensored-BF16
- Variante AWQ del mismo checkpoint: https://huggingface.co/kataguru/Qwen3.8-27B-Titan-v3.2-W4A16-AWQ
- Variante de 1M de contexto: https://huggingface.co/kataguru/Qwen3.8-27B-Titan-v3.0-1M-GGUF/tree/main
- Colección Kataguru Flagship Series: https://huggingface.co/collections/kataguru/kataguru-flagship-series
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha de Qwen3.8-27B en NVIDIA NGC: https://catalog.ngc.nvidia.com/orgs/nim/qwen/models/qwen3.8-27b/
- HyperQwen (parches de vLLM y benchmarks del base): https://github.com/syv-ai/HyperQwen
