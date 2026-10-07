# IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-MiniPlus-V2.1-GGUF

## Resumen

Huihui-Qwen3.8-27B-Abliterated VAL-APEX-I MiniPlus V2.1 GGUF es una cuantización GGUF publicada por el usuario IsValorum sobre el modelo huihui-ai/Huihui-Qwen3.8-27B-abliterated, una variante "abliterated" (con los comportamientos de rechazo eliminados mediante intervención sobre las direcciones de activación) del modelo Qwen3.8 de 27B. El resultado es un modelo denso híbrido de 27.320.697.856 parámetros (unos 27,3 B) orientado a generación de texto y razonamiento, con licencia Apache 2.0 y declarado únicamente para inglés.

La relevancia de esta ficha concreta no está en el modelo base, sino en el esquema de cuantización propietario VAL-APEX-I del autor, que aplica una asignación de precisión tensor por tensor en lugar de un esquema plano. Según la model card, el checkpoint mantiene las 64 capas del modelo (47 de SSM lineal DeltaNet y 17 de atención completa periódica) auditadas individualmente para preservar la dinámica del canal recurrente, con los tensores de estado recurrente (`ssm_*`) en F32 sin comprimir y la cabeza de salida en Q6_K.

El resultado declarado es un fichero de 15,33 GB (3,93 bits por peso) que, según el autor, permite ejecutar la ventana de contexto completa de 256K en GPUs de 24 GB de VRAM, con una degradación de perplejidad de solo +2,44 % frente a la referencia BF16 en WikiText-2. Es, por tanto, una opción pensada para despliegue local de un modelo de razonamiento de ~27B en hardware de consumo o gama profesional de una sola GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida densa: 64 capas, 47 capas de SSM lineal (DeltaNet) y 17 capas de atención completa periódica |
| Parámetros totales | 27.320.697.856 (~27,3 B) |
| Parámetros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 256K tokens (según el autor) |
| Tipos de cuantización | GGUF con esquema VAL-APEX-I (mezcla de F32, Q8_0, Q4_K, Q5_K, IQ4_NL, IQ3_XXS, Q6_K); 3,93 BPW en esta release |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

Datos adicionales: tamaño del repositorio 15,3 GB; huella en memoria declarada 14,28 GiB; fecha de creación 2026-10-06; pipeline text-generation; etiquetas relevantes: reasoning, abliterated, uncensored, imatrix, quantized, endpoints_compatible.

## Arquitectura y entrenamiento

No se dispone de información sobre el entrenamiento del modelo base en la documentación proporcionada (número de tokens, composición del dataset, fases de SFT, RLHF o DPO). Lo que sí detalla la model card es la arquitectura del modelo, que es un transformer híbrido: de sus 64 capas, 47 son capas de espacio de estados lineal (SSM) del tipo DeltaNet, que sustituyen la atención cuadrática por una recurrencia lineal, y 17 son capas de atención completa que se intercalan de forma periódica para recuperar la capacidad de atención global. Esta combinación es la que permite sostener una ventana de 256K tokens con un coste de memoria de estado mucho menor que un transformer de atención completa equivalente.

La innovación documentada en esta release es exclusivamente la cuantización, no el entrenamiento. El esquema VAL-APEX-I (Vector-calibrated Asymmetric Layer-wise Outlier-preserving Recurrent-aware Unified Matrix-quantization) se apoya en una matriz de importancia (imatrix) y asigna precisiones distintas según el rol del tensor: los tensores de estado recurrente `ssm_*` se mantienen en F32 sin comprimir para evitar la deriva acumulativa de la recurrencia, las puertas de atención de las 47 capas lineales van en Q8_0, la atención completa alterna Q4_K/Q5_K, las proyecciones down de SwiGLU usan IQ4_NL/Q5_K y la cabeza de salida (`output.weight`) se fija en Q6_K. El autor justifica este diseño argumentando que las cuantizaciones planas genéricas provocan acumulación de error en la recurrencia y rompen los delimitadores de los bloques ` thinking`.

## Capacidades

- Generación de texto conversacional y de razonamiento, con soporte declarado de bloques de pensamiento (` thinking`) y control del esfuerzo de razonamiento mediante plantilla de chat.
- Razonamiento multi-paso: la release está etiquetada como "reasoning" y el autor la posiciona en el tramo de calidad percibida Q5_K_M/Q6_K.
- Generación de código, con una advertencia explícita del autor sobre sintaxis y penalización de repetición para evitar el intercambio de caracteres.
- Flujos agénticos: la model card incluye una "hardened agentic chat template", lo que indica soporte previsto para plantillas de agente.
- Ventana de contexto larga: 256K tokens, según el autor ejecutables completos en 24 GB de VRAM.
- Modelo "abliterated"/"uncensored": se han eliminado los comportamientos de rechazo del modelo base, de modo que responde a peticiones que el modelo original declinaría.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`) y con el ecosistema llama.cpp.
- Capacidades de visión, audio o tool calling: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local de razonamiento en una sola GPU de 24 GB: con 14,28 GiB de huella en memoria, el modelo cabe íntegro en VRAM en una RTX 3090 o RTX 4090 y permite mantener la ventana de 256K sin descargar a RAM, lo que habilita asistentes de razonamiento privados sin coste de API.
- Análisis de documentos largos en local: la ventana de 256K tokens admite ingerir libros técnicos, expedientes o bases de código completas en una sola pasada, útil para resumen, extracción estructurada y preguntas sobre el documento sin necesidad de fragmentación.
- Investigación sobre alineación y rechazo: al ser una variante abliterated, sirve como sujeto de comparación frente al modelo original para estudiar cómo se distribuyen las respuestas ante peticiones sensibles y qué se degrada al eliminar la capa de rechazo.
- Generación de código en pipelines internos: el modelo puede integrarse en herramientas de autocompletado o revisión sobre llama.cpp, teniendo en cuenta la advertencia del autor sobre sintaxis y penalización de repetición en código.
- Red-teaming y evaluación de seguridad: al no rechazar peticiones, es adecuado para generar conjuntos de pruebas adversarios y alimentar clasificadores de seguridad, siempre en un entorno controlado.
- Asistente conversacional de dominio en inglés: con licencia Apache 2.0 y pesos GGUF, se puede empaquetar como servicio interno para atención técnica en inglés donde se requiera que el modelo no eluda preguntas legítimas pero incómodas.
- Prototipado con presupuesto de VRAM ajustado: la release hermana NanoPlus (11,08 GiB, 2,85 BPW) permite el mismo modelo en GPUs de 12-16 GB, útil para desarrollo en portátiles o estaciones de trabajo modestas antes de pasar a la versión MiniPlus.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son mediciones de perplejidad sobre WikiText-2 con `llama-perplexity` y contexto de 512, realizadas por el autor sobre los pesos GGUF compilados:

| Cuantización | Tamaño en disco | Huella en memoria | BPW medio | Perplejidad WikiText-2 (ctx 512) | Delta PPL vs BF16 | Tramo de calidad |
|---|---|---|---|---|---|---|
| BF16 sin comprimir (referencia) | 54,00 GB (50,29 GiB) | 50,29 GiB | 16,00 | ~6,0000 | Base (0,00 %) | Referencia sin pérdida |
| VAL-APEX-I MiniPlus V2.1 | 15,33 GB (14,28 GiB) | 14,28 GiB | 3,93 | 6,1466 +/- 0,4919 | +0,1466 (+2,44 %) | Frontera Q5_K_M / Q6_K |
| VAL-APEX-I NanoPlus | 11,90 GB (11,08 GiB) | 11,08 GiB | 2,85 | 6,4238 +/- 0,4960 | +0,4238 (+7,06 %) | Nivel Q4_K_M sólido |
| Q4_K_M plano estándar | 17,10 GB | 15,93 GiB | 4,50 | ~6,22 - 6,28 | +0,22 a +0,28 (+3,7 %) | Compromiso estándar |
| Q3_K_M plano estándar | 13,50 GB | 12,57 GiB | 3,44 | ~6,45 - 6,70 | +0,45 a +0,70 (+7,5 %) | Pérdida de sintaxis y ruido de razonamiento |
| APEX Mini genérico (IQ2_S) | 10,20 GB | 9,50 GiB | 2,50 | ~7,10 - 7,80+ | +1,10 a +1,80+ (+18,3 %) | Deterioro severo del razonamiento |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de capacidades.

## Requisitos de hardware

- VRAM estimada para inferencia: 14,28 GiB de huella declarada para MiniPlus V2.1; 11,08 GiB para NanoPlus; 50,29 GiB para la referencia BF16.
- GPU de 24 GB: es el escenario objetivo del autor, que afirma que la ventana completa de 256K cabe en VRAM en este tramo (RTX 3090, RTX 4090, A10G 24GB, L4 24GB, A100 40/80GB).
- GPU de 16 GB: el autor indica que NanoPlus (11,08 GiB) funciona íntegramente en GPUs de 16 GB. La versión MiniPlus V2.1, con 14,28 GiB, deja muy poco margen para caché KV a contexto largo en este tramo.
- GPU de 12 GB o menos: no cabe MiniPlus sin offload parcial a RAM; NanoPlus queda justo por debajo pero sin margen para contexto extenso.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 de forma holgada, y en GPUs de 16 GB con la variante NanoPlus.
- Opciones de despliegue: llama.cpp es el runtime confirmado por las etiquetas y el formato (GGUF, `library_name: gguf`). La release está marcada como `endpoints_compatible`. Otros runtimes compatibles con GGUF (Ollama, LM Studio, servidores de inferencia basados en llama.cpp) no vienen confirmados explícitamente en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación disponible es interna a la familia VAL-APEX-I y a las cuantizaciones planas de referencia de la propia model card. No se dispone de datos para comparar con otros modelos de ~27B de terceros.

| Opción | Parámetros | Contexto | BPW / tamaño | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VAL-APEX-I MiniPlus V2.1 (esta release) | ~27,3 B | 256K | 3,93 BPW / 15,33 GB | 6,1466 (+2,44 %) | Apache 2.0 | HuggingFace |
| VAL-APEX-I NanoPlus | ~27,3 B | 256K | 2,85 BPW / 11,90 GB | 6,4238 (+7,06 %) | Apache 2.0 | HuggingFace |
| Q4_K_M plano estándar | ~27,3 B | 256K | 4,50 BPW / 17,10 GB | ~6,22 - 6,28 (+3,7 %) | Apache 2.0 | Genérico |
| Q3_K_M plano estándar | ~27,3 B | 256K | 3,44 BPW / 13,50 GB | ~6,45 - 6,70 (+7,5 %) | Apache 2.0 | Genérico |
| Modelo base BF16 | ~27,3 B | 256K | 16,00 BPW / 54,00 GB | ~6,0000 | Apache 2.0 | huihui-ai |

El argumento del autor es que MiniPlus V2.1 ofrece mejor perplejidad que Q4_K_M plano (+2,44 % frente a +3,7 %) ocupando un 10 % menos de disco, y mejor perplejidad que Q3_K_M plano (+2,44 % frente a +7,5 %) con un 13,5 % más de tamaño. Los datos de MMLU, HumanEval o GSM8K para establecer comparaciones de capacidad no están disponibles.

## Limitaciones y advertencias

- Modelo abliterated: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o inseguro que el modelo original bloquearía. No es apto para despliegue público sin una capa de moderación externa.
- Sesgos conocidos: no disponibles en la información proporcionada; el modelo solo declara inglés, por lo que cabe esperar un sesgo cultural anglosajón.
- Riesgo de alucinación: no cuantificado en la información disponible. La ausencia de benchmarks de capacidades (MMLU, GSM8K) impide estimar su fiabilidad factual.
- Limitación de idioma: la model card declara únicamente inglés (en). No hay evidencia de soporte sólido en castellano ni en otros idiomas.
- Advertencia de sintaxis en código: el propio autor incluye una sección crítica sobre penalización de repetición para evitar el intercambio de caracteres en código, señal de que la cuantización agresiva puede introducir errores sintácticos.
- Dependencia de la plantilla: el rendimiento en razonamiento depende de la plantilla de chat endurecida que proporciona el autor; usarlo con plantillas genéricas puede degradar la calidad de los bloques de pensamiento.
- Contexto largo: los 256K tokens se declaran ejecutables en 24 GB, pero no se aportan mediciones de calidad a contextos muy largos ni de degradación por posición.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el comportamiento del modelo ni asume responsabilidad por el contenido generado.
- Procedencia: modelo publicado por un tercero (IsValorum) sobre un modelo base también de terceros (huihui-ai), con fecha de publicación 2026-10-06, 0 descargas y 0 likes en el momento de la consulta; no existe validación independiente de las cifras de perplejidad declaradas.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-MiniPlus-V2.1-GGUF
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Release hermana NanoPlus: https://huggingface.co/IsValorum/Huihui-Qwen3.8-27B-Abliterated-VAL-APEX-I-NanoPlus-GGUF
- Release especializada en razonamiento sintético (EfficientThink Uncensored): https://huggingface.co/IsValorum/Qwen3.8-27B-EfficientThink-Uncensored-VAL-APEX-I-MiniPlus-V2.1-GGUF
- Colección VAL-APEX-I: https://huggingface.co/collections/IsValorum/val-apex-i-6ac563d1784a04a1bb177f47
- Colección APEX-I-MiniPlus V2.1: https://huggingface.co/collections/IsValorum/apex-i-miniplus-v21-current-6aac8d4766a28a024e8bb104
- Colección APEX-I-NanoPlus: https://huggingface.co/collections/IsValorum/apex-i-nanoplus-6ab41467c988a1b1cb9b83bc
- Paper, blog o repositorio técnico del esquema VAL-APEX-I: no disponible en la información proporcionada.
