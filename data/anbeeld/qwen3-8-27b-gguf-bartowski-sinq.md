# Anbeeld/Qwen3.8-27B-GGUF-Bartowski-SINQ

## Resumen

Anbeeld/Qwen3.8-27B-GGUF-Bartowski-SINQ es una colección de cuantizaciones GGUF del modelo multimodal Qwen3.8-27B (27.323.597.824 parámetros), producidas por el usuario Anbeeld aplicando la técnica SINQ sobre las recetas de cuantización de Bartowski. El modelo base es un transformer denso de Qwen con pipeline image-text-to-text, lo que indica capacidad de entrada de imagen y texto. La licencia del artefacto es Apache 2.0.

La relevancia de esta ficha no está en el modelo base (del que la información disponible no detalla arquitectura interna, datos de entrenamiento ni benchmarks de capacidad), sino en el trabajo de cuantización: se ofrecen 17 variantes GGUF desde IQ2_XXS (8,887 GB) hasta Q8_0 (29,122 GB), cada una con métricas KLD medidas contra la referencia BF16 sobre el corpus completo Wikitext-2. Según el autor, cada cuantización SINQ seleccionada presenta menor KLD medio que su equivalente estándar de Bartowski.

El punto crítico para el despliegue es que SINQ solo es compatible con BeeLlama.cpp v0.5.0, un fork específico del runtime. Esto condiciona por completo la infraestructura: no se pueden usar estos ficheros con llama.cpp estándar, Ollama, vLLM ni TGI sin conversión o sin ese runtime concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (detalle interno del modelo base no disponible); pipeline image-text-to-text |
| Parametros totales | 27.323.597.824 (27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens (64K) usados en la evaluación KLD; contexto máximo oficial del modelo base no disponible |
| Tipos de cuantizacion | IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q4_K_L, Q5_K_S, Q5_K_M, Q5_K_L, Q6_K_S, Q6_K, Q6_K_L, Q8_0 (con variantes de ancho y fuerza SINQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con SINQ aplicado) |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo base Qwen3.8-27B más allá de que es un transformer denso de 27,3 mil millones de parámetros con pipeline image-text-to-text. No se detallan número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Tampoco se especifican innovaciones como decodificación especulativa o atención lineal.

Lo que sí está documentado es el proceso de cuantización. Las GGUFs siguen 1:1 las recetas de Bartowski para Qwen3.8-27B, aplicando SINQ durante la cuantización. Cada variante se parametriza con un ancho (width: 16, 32 o 64) y una fuerza (strength: 0,5, 0,75 o 1). La evaluación KLD se realizó sobre el corpus de test completo de Wikitext-2, usando el modelo BF16 como referencia, 297.193 objetivos de siguiente token alineados, contexto de 65.536 tokens, caché K/V en BF16, batch 2048 y microbatch 512.

## Capacidades

- Generación de texto y conversación multi-turno (tag `conversational`).
- Procesamiento de imagen y texto de entrada (pipeline `image-text-to-text`), lo que habilita tareas de visión-lenguaje.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Uso de imatrix en el proceso de cuantización (tag `imatrix`), orientado a preservar calidad en bits bajos.
- Capacidades específicas de razonamiento, código, matemáticas, tool calling, agentes o thinking mode del modelo base: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue en hardware con VRAM limitada: las variantes IQ2_XXS (8,887 GB) e IQ2_XS (9,094 GB) permiten ejecutar un modelo de 27,3 B en GPUs de 12 GB o en configuraciones con offload parcial, a costa de un KLD medio de 0,29 y 0,26 respectivamente y un Top-1 del 79,7 % y 81,2 %.
- Equilibrio calidad/tamaño en GPUs de 16-24 GB: Q4_K_M (17,448 GB, KLD medio 0,0244, Top-1 95,45 %) o Q5_K_M (20,930 GB, KLD 0,0139, Top-1 97,07 %) ofrecen una relación razonable entre fidelidad al BF16 y huella de memoria.
- Máxima fidelidad en servidores con 32 GB o más: Q8_0 (29,122 GB, KLD medio 0,0047, Top-1 98,87 %) es la opción más cercana a la referencia BF16 dentro de esta colección.
- Tareas multimodales imagen-texto: al heredar el pipeline image-text-to-text del base, sirve para descripción de imágenes, VQA o extracción de información de documentos escaneados, siempre que el runtime BeeLlama.cpp soporte la entrada visual.
- Investigación en cuantización: la tabla de KLD por receta (media, mediana, P90, P95, P99, P99.9, máximo, Top-1 y PPL) permite estudiar el impacto de ancho y fuerza SINQ sobre la distribución de error, útil para trabajos sobre compresión de modelos.
- Evaluación comparativa de runtimes: al estar replicadas las recetas de Bartowski, permite contrastar directamente calidad SINQ frente a cuantización estándar bajo idénticas condiciones de evaluación.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas de fidelidad de cuantización (KLD contra BF16), no benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.). Se reproducen las métricas principales de una selección de recetas:

| Receta | Tamano (GB) | Mean KLD | Top-1 | PPL |
|---|---:|---:|---:|---:|
| IQ2_XXS | 8,887 | 0,292708 | 79,728 % | 7,2898 |
| IQ2_XS | 9,094 | 0,258898 | 81,241 % | 6,7813 |
| IQ3_XXS | 12,326 | 0,088562 | 89,420 % | 6,2762 |
| Q3_K_M | 13,410 | 0,069874 | 91,014 % | 6,1224 |
| Q4_K_M | 17,448 | 0,024358 | 95,452 % | 6,1228 |
| Q5_K_M | 20,930 | 0,013948 | 97,070 % | 6,0552 |
| Q6_K | 23,866 | 0,006030 | 98,179 % | 6,0426 |
| Q8_0 | 29,122 | 0,004727 | 98,874 % | 6,0549 |

Condiciones: Wikitext-2 test completo, referencia BF16 Qwen3.8-27B, 297.193 objetivos, contexto 64K, caché K/V BF16, batch 2048, microbatch 512. El autor afirma que cada cuantización SINQ seleccionada tiene menor KLD medio que su equivalente estándar de Bartowski, y ofrece gráficas comparativas frente a Bartowski, Unsloth e ISTA.

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: desde ~9 GB (IQ2_XXS) hasta ~30 GB (Q8_0) solo para los pesos; añadir overhead de contexto (64K tokens con caché K/V BF16 puede requerir varios GB adicionales).
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M y Q5_K_S; A100 40 GB o H100 para Q6_K_L y Q8_0 con contexto largo; GPUs de 12 GB solo para las variantes IQ2/IQ3 con contexto reducido.
- Cabe en consumer GPU: sí, en RTX 3090/4090 para recetas hasta Q5_K_M (20,9 GB) con margen ajustado; Q6 y Q8 requieren 24-32 GB.
- Opciones de despliegue: exclusivamente BeeLlama.cpp v0.5.0 (el autor indica que SINQ solo está soportado en ese runtime). No se garantiza compatibilidad con llama.cpp estándar, Ollama, vLLM ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---:|---|---|---|---|
| Anbeeld/Qwen3.8-27B-GGUF-Bartowski-SINQ | 27,3 B | 64K (evaluación) | Apache 2.0 | GGUF + SINQ | Requiere BeeLlama.cpp v0.5.0 |
| bartowski/Qwen3.8-27B-GGUF | 27,3 B (base) | No disponible | Apache 2.0 (base) | GGUF estándar | Runtime llama.cpp estándar; referencia de recetas |
| Unsloth Qwen3.8-27B (Q5_K_S, Q6_K, Q8_0) | 27,3 B (base) | No disponible | Apache 2.0 (base) | GGUF | Comparado en las gráficas del autor; datos numéricos no disponibles |
| ISTA Qwen3.8-27B | 27,3 B (base) | No disponible | No disponible | GGUF | Comparado en las gráficas del autor; datos numéricos no disponibles |

## Limitaciones y advertencias

- Dependencia de runtime: SINQ solo funciona en BeeLlama.cpp v0.5.0; usar estos GGUF en otros motores puede producir resultados incorrectos o fallos de carga.
- Sin datos de capacidad: no hay benchmarks de MMLU, HumanEval, GSM8K ni evaluaciones multimodales publicadas; el rendimiento real en tareas downstream debe validarse por cuenta propia.
- Idiomas no declarados: la model card no especifica cobertura lingüística, lo que impide garantizar calidad en castellano u otros idiomas.
- Riesgo de alucinación: inherente a los modelos generativos; no hay documentación específica de mitigaciones en esta ficha.
- Sesgos: no documentados en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.8-27B y las condiciones de BeeLlama.cpp por separado.
- Las variantes de 2 bits (IQ2_XXS, IQ2_XS, IQ2_S) muestran degradación notable (Top-1 por debajo del 82 %, PPL superior a 6,7) y no son recomendables para producción sensible a calidad.
- Contexto: la evaluación usa 64K, pero el máximo oficial del base no está confirmado; contextos largos incrementan mucho el consumo de VRAM con caché BF16.

## Enlaces

- Hugging Face: https://huggingface.co/Anbeeld/Qwen3.8-27B-GGUF-Bartowski-SINQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Recetas de cuantización de referencia: https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Runtime BeeLlama.cpp v0.5.0: https://github.com/Anbeeld/beellama.cpp
