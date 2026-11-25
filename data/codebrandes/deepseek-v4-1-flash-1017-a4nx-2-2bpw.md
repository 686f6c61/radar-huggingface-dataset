# codebrandes/DeepSeek-V4.1-Flash-1017-A4NX-2.2bpw

## Resumen

DeepSeek-V4.1-Flash-1017-A4NX-2.2bpw es una cuantización EXL3 de 2,2 bits por peso del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario codebrandes (AlexBrandes). El modelo base lo desarrolla DeepSeek y es un transformer de tipo mixture-of-experts (MoE) con capacidad de entrada de texto e imagen (pipeline image-text-to-text). Esta versión cuantizada conserva el modelo completo: entrada de texto e imagen, las tres capas MTP que usa el drafter DSpark y la ventana de contexto íntegra.

La particularidad técnica es el uso de un codebook de trellis denominado A4NX en lugar del `mul1` por defecto de EXL3 para los expertos enrutados. A4NX convierte los pesos en enteros de −15 a 15, operandos exactos para los tensor cores INT8, y decodifica cuatro pesos por multiplicación, aplicando la escala una sola vez al resultado acumulado. Esto permite ejecutar el modelo en tres tarjetas NVIDIA CMP 170HX (64 + 40 + 64 GB), hardware de minería reconvertido.

El checkpoint tiene 79.239.695.570 parámetros totales (según safetensors) y ocupa 166,8 GB en el repositorio, incluido el fichero INT8 de las matrices densas. Está pensado exclusivamente para el build de vLLM específico de CMP 170HX; ni exllamav3 estándar, ni TabbyAPI, ni vLLM upstream pueden cargarlo. La licencia es MIT, la misma que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención (incluye compresor e indexador), expertos compartidos, proyecciones Engram y capas MTP; torre de visión |
| Parametros totales | 79.239.695.570 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card indica que conserva "the full context" del modelo base, sin cifra) |
| Tipos de cuantizacion | EXL3 con codebook A4NX a 2,0 y 2,5 bpw en expertos enrutados; `mul1` a 6 bits en atención, expertos compartidos, proyecciones Engram, matrices MTP y LM head; copia INT8 de las matrices densas; BF16 en torre de visión y embeddings |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (EXL3), con fichero adicional `int8/dense.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con atención que incorpora un compresor y un indexador, expertos compartidos, proyecciones Engram y tres capas MTP (multi-token prediction) empleadas por el drafter DSpark para decodificación especulativa. Esta cuantización no reentrena el modelo: convierte los pesos del release original (`deepseek-ai/DeepSeek-V4.1-Flash-1017`, revisión `1bae0e10`) con exllamav3 1.6.6 y la rama `a4nx` del fork de AlexBrandes (commit `6cfd44b2`).

EXL3 almacena los pesos como un trellis de bitshift sobre teselas de 16×16 tras rotaciones de Hadamard. A4NX mantiene teselas, rotaciones, trellis y codificador de Viterbi, y cambia la decodificación: un estado de 32 bits menos el step size (24 bits a 2,0 bpw, 22 a 2,5 bpw), cuatro pesos por multiplicación, valores enteros almacenados en el orden del fragmento de operando `m16n8k16` para que cada hilo decodifique sus propios registros. Los expertos enrutados de las capas 0–6 y 36–39 van a 2,5 bpw; los de las capas 7–35 y de las tres capas MTP, a 2,0 bpw.

La calibración usó 512 filas de 2.048 tokens (725.542 tokens): 403 filas de respuestas del propio modelo con thinking activado y 109 de fuentes incluidas en exllamav3 (código, Wikipedia, C4, técnico, multilingüe). Las tablas Engram del modelo original (shards 47–48, 203 GB) no se convierten ni se copian; `ngram_external.json` referencia los shards originales y el motor los lee en tiempo de ejecución.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno.
- Entrada de imagen junto con texto (pipeline image-text-to-text).
- Generación de código: HumanEval+ medido en 88,4 % en modo chat.
- Matemáticas: GSM8K medido en 96,4 % en modo chat, 5-shot.
- Seguimiento de instrucciones: IFEval prompt-level strict medido en 86,9 %.
- Contexto largo: RULER a 32k medido en 84,3 %.
- Modo thinking (razonamiento explícito) disponible en el modelo base; las mediciones de la model card se hicieron con thinking desactivado.
- Decodificación especulativa mediante las tres capas MTP del drafter DSpark.
- Capacidades multilingües: no disponibles como dato explícito; la calibración incluyó fuentes multilingües.
- Soporte de tool calling y agentes: no disponible como dato explícito en la información proporcionada.

## Casos de uso

- Asistencia conversacional multi-turno: el modelo conserva el contexto completo del base y puede mantener diálogos largos; su rendimiento en IFEval (86,9 %) lo hace adecuado para asistentes con instrucciones estrictas.
- Generación de código en pipelines: con HumanEval+ en 88,4 %, puede integrarse en revisión de código, generación de tests o autocompletado en entornos donde ya se disponga de CMP 170HX.
- Razonamiento matemático y resolución de problemas: GSM8K en 96,4 % permite usarlo en tutoría, verificación de cálculos o generación de problemas resueltos.
- Procesamiento de documentos con imagen: al aceptar entrada image-text-to-text, sirve para extracción de información de capturas, diagramas o documentos escaneados combinados con preguntas en texto.
- Análisis sobre contexto largo: RULER a 32k en 84,3 % lo hace viable para resumir o consultar documentación extensa, informes o bases de código.
- Despliegue en hardware de bajo coste: el objetivo declarado es servir un modelo de 79.000 millones de parámetros en tres CMP 170HX, lo que resulta relevante para laboratorios con presupuesto limitado que ya posean ese hardware.
- Experimentación con cuantización extrema: sirve como referencia para investigar el impacto de 2,0–2,5 bpw en calidad, con métricas de divergencia KL y perplejidad publicadas.

## Benchmarks y rendimiento

Referencia: release original (pesos densos FP8, expertos MXFP4) servido con vLLM 0.34.0 en 4× RTX PRO 6000. Este checkpoint servido con el motor de la receta en 3× CMP 170HX. Mismas prompts y ajustes, thinking desactivado.

| Tarea | Original | Este checkpoint |
|---|---:|---:|
| GSM8K, chat, 5-shot | 97,3 % | 96,4 % |
| GSM8K, completion, 5-shot | 90,8 % | 89,3 % |
| HumanEval+, chat | 87,2 % | 88,4 % |
| IFEval, prompt-level strict | 88,2 % | 86,9 % |
| MMLU | 85,7 % | 83,8 % |
| RULER, 32k | 87,7 % | 84,3 % |

Distancia respecto al original (teacher-forced sobre las propias salidas del original, top-20 logprobs):

| Conjunto | Divergencia KL | Mismo token top | Ratio de perplejidad |
|---|---:|---:|---:|
| Respuestas de chat (280 prompts) | 0,119 | 93,0 % | 1,124 |
| WikiText (565 pasajes) | 0,207 | 85,4 % | 1,133 |

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 166,8 GB en disco, incluido el fichero INT8 de 8,1 GB; el despliegue de referencia usa 64 + 40 + 64 GB en tres CMP 170HX.
- GPU recomendadas: NVIDIA CMP 170HX exclusivamente; el build de vLLM con kernels A4NX solo existe para esas tarjetas.
- GPU de consumo: no cabe en tarjetas consumer convencionales; el formato no es cargable por exllamav3 estándar, TabbyAPI ni vLLM upstream.
- Opciones de despliegue: únicamente el motor de la receta `AlexBrandes/cmp170hx-deepseek-v41-flash`, que sirve la copia INT8 de las matrices densas mediante `VLLM_EXL3_DENSE_W8`.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: además de los 166,8 GB del repo, hay que descargar las tablas Engram del modelo original (shards 47–48, 203 GB) en tiempo de ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (original) | no disponible | no disponible | MIT | Hugging Face (deepseek-ai) | Pesos densos FP8 y expertos MXFP4; requiere 4× RTX PRO 6000 según la medición de referencia |
| Este checkpoint (A4NX 2,2 bpw) | 79.239.695.570 | no disponible | MIT | Hugging Face (codebrandes) | Solo CMP 170HX; 166,8 GB; calidad medida próxima al original |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Compatibilidad restringida: solo carga en el build de vLLM para CMP 170HX con kernels A4NX; exllamav3 estándar, TabbyAPI y vLLM upstream no pueden cargar el checkpoint.
- Hardware específico y escaso: las CMP 170HX son tarjetas de minería con disponibilidad limitada y soporte de software reducido.
- Pérdida de calidad medible: MMLU baja 1,9 puntos, RULER a 32k baja 3,4 puntos y el ratio de perplejidad en WikiText es 1,133; no es una réplica exacta del original.
- Dependencia externa: las tablas Engram (203 GB) no están incluidas y deben descargarse de la revisión `1bae0e1088993b9b82de08f59de5be5a34e42170` del repo original; sin ellas el modelo no funciona completo.
- Idiomas soportados no documentados: no hay lista explícita de idiomas, lo que dificulta evaluar su comportamiento fuera del inglés.
- Riesgo de alucinación: no cuantificado en la información disponible; aplican los riesgos habituales de un modelo de lenguaje, potencialmente amplificados por la cuantización agresiva.
- Sesgos: no documentados en la model card.
- Tool calling y agentes: no confirmados explícitamente para esta versión.
- Repositorio con muy poca tracción (14 descargas, 1 like) y creado en noviembre de 2026: no hay validación independiente de las métricas publicadas.
- Licencia MIT: permite uso comercial, pero la responsabilidad sobre el comportamiento del modelo cuantizado recae en el desplegador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/codebrandes/DeepSeek-V4.1-Flash-1017-A4NX-2.2bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Receta de despliegue: https://github.com/AlexBrandes/cmp170hx-deepseek-v41-flash
- Especificación del formato A4NX: https://github.com/AlexBrandes/exllamav3/blob/6cfd44b2fca93bf5420f416a0c05e3563af2f4a0/doc/a4nx.md
- Rama `a4nx` del fork de exllamav3: https://github.com/AlexBrandes/exllamav3/tree/6cfd44b2fca93bf5420f416a0c05e3563af2f4a0
- exllamav3 original: https://github.com/turboderp-org/exllamav3
