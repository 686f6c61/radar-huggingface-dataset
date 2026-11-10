# groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic-MLX

## Resumen

Qwopus3.5-9B-Coder-Flash-Heretic-MLX es un repositorio de cuantizaciones en formato MLX del modelo groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic, un modelo de 9B parámetros orientado a código, con capacidades de visión y sin censura (etiquetas "uncensored" y "heretic"). Lo publica el usuario groxaxo y está pensado para ejecutarse en Apple Silicon mediante la librería MLX. El repositorio agrupa cinco variantes cuantizadas (8-bit, 6-bit selectivo, OptiQ 6-bit, 5-bit selectivo y OptiQ 5-bit) fijadas a una revisión concreta del modelo base.

El problema que resuelve es la distribución de pesos ya cuantizados y evaluados con métricas de divergencia KL frente al BF16 de referencia, de modo que el usuario pueda elegir un compromiso entre tamaño en disco y fidelidad numérica sin tener que cuantizar por su cuenta. Es relevante porque incluye informes de evaluación reproducibles (KL global, KL solo en código, tasa de misma predicción top-1) sobre un conjunto fijo de 64 ejemplos y 7.672 posiciones de siguiente token.

La arquitectura subyacente es un transformer denso de la familia qwen3_5 (según la etiqueta del repositorio), con torre de visión y pesos MTP restaurados, pero la model card del repositorio no detalla el número exacto de parámetros, la longitud de contexto ni los datos de entrenamiento del modelo base. La licencia declarada es Apache 2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer denso de la familia qwen3_5 (según etiqueta del repo), con torre de visión y sidecar MTP; detalles finos no disponibles |
| Parametros totales | 9B (según el nombre del modelo); desglose no disponible |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine, group size 64, con residuales BF16; variantes 8-bit, 6-bit selectivo, OptiQ 6-bit, 5-bit selectivo y OptiQ 5-bit |
| Idiomas soportados | no disponible (la evaluación incluye ejemplos en inglés y español, pero no se declara lista de idiomas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con tokenizer, processors, configuración y checksums por variante |

Tamaños de peso por variante:

| Variante | Tamano de pesos | KL global | KL solo codigo | Misma prediccion top-1 que BF16 |
|---|---:|---:|---:|---:|
| 8bit | 10.717 GB | 0.00143659 | 0.00129513 | 98.03% |
| 6bit-selective | 8.501 GB | 0.00608873 | 0.00584129 | 96.39% |
| optiq-6bit | 8.993 GB | 0.02307562 | 0.02320652 | 94.10% |
| 5bit-selective | 7.343 GB | 0.02383329 | 0.02501866 | 92.74% |
| optiq-5bit | 8.192 GB | 0.03713321 | 0.03366119 | 92.17% |

La dirección de la KL es KL(BF16 ‖ cuantizado), en nats por posición evaluada de siguiente token. La comparación usa 64 ejemplos fijos y 7.672 posiciones: 32 ejemplos de HumanEval de OpenAI (prompt más solución canónica), 16 ejemplos instrucción/respuesta de Stanford Alpaca en inglés y 16 explicaciones en español escritas por el autor. El contexto se limita a 128 tokens de entrada, se cubren los 248.320 tokens del vocabulario, temperatura 1, teacher forcing, sin filtrado top-k ni top-p, y aritmética float64 para la normalización y la reducción de KL.

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento del modelo base: no se indica número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación. Lo que sí se describe con detalle es el proceso de cuantización. Se aplica cuantización afín de MLX con group size 64 y residuales en coma flotante BF16. La variante 8-bit cuantiza 257 matrices elegibles a 8 bits. La 6-bit selectiva deja 222 matrices a 6 bits y 35 a 8 bits. La 5-bit selectiva deja 233 matrices a 5 bits, 15 a 6 bits y 9 a 8 bits. La torre de visión se mantiene en BF16, se preserva el estado sensible sin cuantizar y se conservan los pesos MTP restaurados del modelo fuente.

La asignación selectiva de precisión se basa en la sensibilidad medida de cada capa del decodificador, obtenida con 32 muestras de código y multilingües de 128 tokens sobre el modelo de 8 bits, seguida de la receta de asignación con presupuesto de bytes de oMLX. Las variantes OptiQ usan mlx-optiq 0.8.2 como conversor independiente: un barrido nativo de sensibilidad KL exacta (8x512 tokens de calibración, candidatos de 4 y 8 bits, suelo de bloque 2) se reorienta a dos presupuestos de tamaño. La referencia de calibración es un modelo uniforme de 4 bits construido desde esta misma fuente para un Mac de 24 GB, pero todos los números finales de KL se comparan contra el BF16 real. Los objetivos son medias del asignador, no anchos de matriz uniformes ni bits por peso exactos del modelo completo. Las variantes OptiQ usan sidecars nativos de visión y MTP: la visión permanece en BF16 y el sidecar MTP nativo tiene proyecciones de 4 bits y tensores protegidos en BF16.

## Capacidades

- Generación de texto y código: el modelo está orientado explícitamente a código (etiqueta "code") y la evaluación incluye ejemplos de HumanEval.
- Razonamiento y matemáticas: la model card menciona una comprobación aritmética en las pruebas de inferencia, pero no se detallan capacidades específicas.
- Visión: pipeline image-text-to-text, con torre de visión en BF16; la entrada de imagen completa requiere OptiQ o un runtime compatible con sidecars.
- Modo thinking: la API de mlx-vlm expone el parámetro `enable_thinking`, lo que indica soporte de modo de razonamiento explícito.
- Sin censura: etiquetas "uncensored" y "heretic" en el modelo base y en este repositorio.
- Multilingüe: la evaluación incluye 16 explicaciones en español, pero no se declara una lista formal de idiomas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre Apple Silicon: con la variante 5-bit selectiva (7,343 GB) el modelo cabe en Macs con 16-24 GB de memoria unificada y permite autocompletado y generación de funciones sin enviar código a la nube.
- Generación de funciones Python verificables: la model card muestra un ejemplo de generación de una función `add(a, b)` y otra que devuelve el cuadrado de su argumento, con comprobación AST en las pruebas del autor; útil para pipelines de generación y validación automática de código.
- Análisis de imágenes con texto: al ser image-text-to-text, puede describir o razonar sobre capturas, diagramas o imágenes de color; la prueba de inferencia incluye una comprobación de color de imagen.
- Sustitución de un modelo BF16 en un Mac de 24 GB: la variante optiq-6bit (8,993 GB) está calibrada explícitamente para ese perfil de memoria, lo que permite ejecutar el modelo con una fidelidad KL de 0,023 frente a BF16.
- Evaluación de cuantizaciones: el repositorio incluye un informe de comparación de cinco variantes con intervalos de confianza bootstrap y comparaciones pareadas, útil para quien quiera reproducir el análisis o elegir variante con criterio numérico.
- Prototipado de asistentes sin restricciones de contenido: la naturaleza "uncensored"/"heretic" lo hace adecuado para investigación sobre comportamiento de modelos sin alineación restrictiva, siempre con las salvaguardas externas oportunas.
- Despliegue en pipelines de CI para revisión de código: con la variante 8-bit (10,717 GB) y una tasa de misma predicción top-1 del 98,03 % frente a BF16, puede integrarse en flujos de análisis estático asistido por modelo en máquinas Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos numéricos publicados son las métricas de fidelidad de cuantización de la tabla de especificaciones: KL global, KL solo en código y tasa de misma predicción top-1 frente a BF16, medidas sobre 64 ejemplos y 7.672 posiciones de siguiente token. Estas métricas no miden precisión en tareas de código.

## Requisitos de hardware

- VRAM/memoria unificada estimada: entre 7,343 GB (5-bit selectivo) y 10,717 GB (8-bit) solo para pesos; hay que sumar la sobrecarga de KV cache, tokenizer y runtime.
- El repositorio completo ocupa 42,7 GB, pero solo se descarga la variante elegida.
- GPU recomendadas: Apple Silicon con MLX; la variante optiq-6bit está calibrada para un Mac de 24 GB de memoria unificada.
- Cabe en GPU de consumo Apple: sí, en Macs con memoria unificada suficiente (16-24 GB según variante). No se proporcionan requisitos para GPU NVIDIA.
- Opciones de despliegue: `mlx-lm` (solo texto) y `mlx-vlm` (visión y MTP). Para visión completa se requiere OptiQ o un runtime compatible con sidecars; el cargador estricto de mlx-vlm con el cargador de sidecars declarado por oMLX pasó las mismas tres comprobaciones de inferencia en ambas variantes OptiQ.
- Latencia y throughput: no disponibles en la información proporcionada.
- Versiones usadas en conversión y evaluación: oMLX 0.7.0.dev4 y MLX 0.32.2 (la cadena de versión de mlx-vlm queda truncada en la model card).
- Ejemplo de descarga: `hf download groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic-MLX --include "6bit-selective/*" --local-dir ./qwopus-mlx`; la ruta de carga es `./qwopus-mlx/6bit-selective`. La raíz del repositorio no es un directorio de modelo cargable.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de benchmarks de tareas ni de modelos alternativos comparables, por lo que no es posible establecer una comparación rigurosa con otros modelos de 9B o de código. La única comparación interna posible es entre las cinco variantes de cuantización del propio repositorio, recogida en la tabla de especificaciones.

## Limitaciones y advertencias

- No se han publicado benchmarks de tareas: las métricas KL y de misma predicción top-1 miden fidelidad de cuantización, no calidad en código ni en razonamiento.
- La evaluación de cuantización usa solo 64 ejemplos y 128 tokens de contexto de entrada; no cubre contextos largos ni distribución amplia de tareas.
- El modelo base está etiquetado como "uncensored" y "heretic": puede generar contenido sin los filtros habituales, lo que exige salvaguardas externas en producción.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no se declara una lista formal; la evaluación incluye inglés y español, pero no hay garantías para otros idiomas.
- Longitud de contexto: no disponible, lo que impide planificar casos de uso con ventanas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los pesos derivados.
- La entrada de imagen completa requiere OptiQ o un runtime compatible con sidecars; con mlx-vlm estándar y las variantes no OptiQ la visión puede no funcionar.
- Los nombres de carpeta describen la precisión base de las matrices, no bits por peso uniformes del modelo completo, debido a los tensores BF16 retenidos y a las selecciones de mayor precisión.
- El repositorio está fijado a una revisión concreta del modelo base; cambios posteriores en el modelo fuente no se reflejan automáticamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic-MLX
- Modelo base: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic
- Revisión del modelo base fijada: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic/tree/85fa2083f4c1dff753119c01b0894dba0bb345d8
- Variante 8bit: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic-MLX/tree/main/8bit
- Variante 6bit-selective: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic-MLX/tree/main/6bit-selective
- Variante optiq-6bit: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic-MLX/tree/main/optiq-6bit
- Variante 5bit-selective: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic-MLX/tree/main/5bit-selective
- Variante optiq-5bit: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic-MLX/tree/main/optiq-5bit
- Informe de evaluación de las cinco variantes: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic-MLX/blob/main/evaluation/COMPARISON_ALL.md
- Resultados legibles por máquina: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic-MLX/blob/main/evaluation/summary-all.json
- Métricas numéricas por token: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic-MLX/tree/main/evaluation
- Notas de reproducción de OptiQ: https://huggingface.co/groxaxo/Qwopus3.5-9B-Coder-Flash-Heretic-MLX/blob/main/evaluation/REPRODUCE_OPTIQ.md
- Documentación de mlx-optiq: https://mlx-optiq.com/docs/cli
