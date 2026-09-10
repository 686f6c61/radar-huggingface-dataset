# pragmaticcs/Qwen-35B-A3B-SignOfFour-Coder-i1-GGUF

## Resumen
Qwen-35B-A3B-SignOfFour-Coder-i1-GGUF es el conjunto de cuantizaciones GGUF del modelo pragmaticcs/Qwen-35B-A3B-SignOfFour-Coder, un modelo de lenguaje causal de tipo mezcla de expertos (MoE) construido sobre la familia Qwen (los tags del autor citan qwen3.5 y qwen3.6) y publicado bajo licencia Apache 2.0. El modelo resultante es un merge: la model card incluye los tags ties y dare, dos técnicas habituales de fusión de pesos, lo que indica que se combinaron varios checkpoints para obtener un modelo orientado a código, razonamiento y uso agéntico.

El repositorio contiene únicamente pesos en formato GGUF generados con imatrix (quantizaciones ponderales), en 24 variantes que van desde 7,6 GB (i1-IQ1_S) hasta 28,6 GB (i1-Q6_K), más el fichero imatrix de 0,3 GB para generar cuantizaciones propias. Según los safetensors del modelo base, el total de parámetros es de 34.660.610.688 (~34,66 mil millones); el sufijo A3B del nombre sugiere del orden de 3.000 millones de parámetros activos por token, aunque este dato no se confirma en la información disponible.

Su relevancia práctica es doble: por un lado, permite ejecutar un modelo MoE de ~35B en hardware de consumo gracias a las cuantizaciones de 4 bits (21,3 GB en Q4_K_M); por otro, es un ejemplo de merge experimental con muy poca validación pública (0 descargas y 0 likes en el momento de la consulta), por lo que debe tratarse como un artefacto a evaluar antes de cualquier uso en producción. No se han publicado benchmarks ni una model card detallada por parte del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con mezcla de expertos (MoE); model_type `qwen3_5_moe`; etiquetas del autor: `deltanet`, `moe`, `causal-lm` |
| Parámetros totales | 34.660.610.688 (~34,66 mil millones), según safetensors del modelo base |
| Parámetros activos | no disponible (el sufijo A3B del nombre sugiere ~3.000 millones activos, sin confirmar en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF i1/imatrix: IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K. También existen cuantizaciones estáticas en `mradermacher/Qwen-35B-A3B-SignOfFour-Coder-GGUF` |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (variantes i1/imatrix) y fichero imatrix `*.imatrix.gguf`; el modelo base está en safetensors para transformers |
| Modelo base | pragmaticcs/Qwen-35B-A3B-SignOfFour-Coder |
| Tamaño del repositorio | 370,8 GB |
| Pipeline declarado | no disponible |
| Fecha de creación y última actualización | 2026-09-10 (misma fecha en ambos campos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
La información disponible describe el modelo como un transformer causal con mezcla de expertos (MoE) de la familia Qwen, con `model_type: qwen3_5_moe` y la etiqueta `deltanet` entre los tags del autor, lo que apunta a componentes de atención lineal o híbrida propios de las variantes recientes de Qwen. No se especifican el número de expertos, el número de expertos activos por token, la dimensión oculta ni la ventana de contexto en la documentación publicada.

El modelo no se ha entrenado desde cero: es un merge. Los tags `ties` y `dare` indican que se aplicaron las técnicas TIES-merging y DARE (drop and rescale) para fusionar checkpoints, un procedimiento que combina pesos de varios modelos y puede producir interferencias o degradación no medida. No hay información sobre dataset de entrenamiento, número de tokens, composición de datos ni sobre etapas de ajuste como SFT, RLHF o DPO. Las cuantizaciones GGUF de este repositorio se generaron con imatrix, usando el fichero `Qwen-35B-A3B-SignOfFour-Coder.imatrix.gguf` para calibrar la importancia de los pesos.

## Capacidades
- Generación de texto conversacional en inglés y chino, según los idiomas declarados en la model card.
- Generación de código: el autor etiqueta el modelo con `code`, aunque no hay evaluaciones publicadas que cuantifiquen su rendimiento.
- Razonamiento y modo agéntico: los tags `reasoning` y `agentic` sugieren uso previsto en tareas de varios pasos y flujos con herramientas, sin evidencia publicada de soporte explícito de tool calling ni de formatos de llamada a funciones.
- Capacidad MoE con bajo cómputo por token: al activar presumiblemente ~3.000 millones de parámetros, el coste de inferencia es mucho menor que el de un modelo denso de 34B, lo que favorece despliegues con throughput alto.
- No se documenta soporte de visión, audio, ni un modo "thinking" separado. No disponible.
- No se documenta explícitamente soporte de function calling, ni plantillas de chat concretas, ni configuración recomendada de sampling.

## Casos de uso
- Generación de código asistida en el editor: con las cuantizaciones Q4_K_M (21,3 GB) o Q4_K_S (20,0 GB) puede servirse en una GPU de 24 GB para autocompletado y refactorización, dado que el modelo está etiquetado como orientado a código.
- Revisión de código en pipelines de CI/CD: integrado mediante `llama.cpp` o el servidor compatible con OpenAI, puede generar resúmenes de diffs y comentarios automáticos en pull requests; conviene validar antes la calidad real del merge, al no existir benchmarks.
- Asistentes conversacionales en inglés y chino: es el caso de uso más seguro para un modelo con solo esos dos idiomas declarados, con despliegue en Ollama o LM Studio para prototipos internos.
- Investigación sobre fusiones de modelos: el repositorio es útil como material de estudio de merges TIES/DARE y del efecto de la cuantización imatrix en modelos MoE, comparando variantes IQ2 a Q6.
- Despliegue en hardware limitado: la variante i1-IQ1_S (7,6 GB) permite ejecutar un MoE de ~35B en GPU de 8-12 GB o incluso en CPU con RAM suficiente, asumiendo la pérdida de calidad que el propio autor advierte ("for the desperate").
- Extracción y transformación de texto técnico (documentación, logs, tickets) en inglés o chino, con la ventaja del bajo coste por token de la arquitectura MoE.
- Evaluación comparativa interna frente a Qwen3-30B-A3B oficial: sirve como candidato a batería de pruebas propias antes de adoptarlo, dado que no existe validación pública.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K, SWE-bench ni ninguna otra métrica, y la búsqueda web realizada no devolvió resultados relacionados con este modelo (los resultados obtenidos correspondían a guías de configuración de un videojuego y no son pertinentes).

## Requisitos de hardware
Las cifras de VRAM son estimaciones a partir del tamaño de fichero de cada cuantización; el consumo real depende de la longitud de contexto y del backend.

| Cuantización | Tamaño | VRAM mínima estimada | GPU típica |
|---|---|---|---|
| i1-IQ1_S | 7,6 GB | ~9-10 GB | RTX 3060 12 GB, RTX 4060 Ti 16 GB |
| i1-IQ2_M | 11,8 GB | ~13-14 GB | RTX 4080, RTX 4070 Ti Super 16 GB |
| i1-IQ3_M | 15,5 GB | ~17 GB | RTX 4080/4090 con contexto corto, A4000 16 GB (ajustado) |
| i1-IQ4_XS | 18,8 GB | ~20 GB | RTX 4090 24 GB |
| i1-Q4_K_M | 21,3 GB | ~23 GB | RTX 3090/4090 24 GB |
| i1-Q5_K_M | 24,8 GB | ~27 GB | A100 40 GB, 2x RTX 3090 |
| i1-Q6_K | 28,6 GB | ~31 GB | A100 40 GB, H100 80 GB, 2x RTX 4090 |

- GPU recomendadas: para calidad cercana al original, A100 40 GB, H100 80 GB o L40S; en consumo, RTX 4090 o RTX 3090 con cuantizaciones de 4 bits.
- Cabe en GPU de consumo: sí, desde 8-12 GB con IQ1/IQ2 (calidad degradada según el propio autor) hasta 24 GB con Q4_K_M, el punto recomendado por el cuantizador.
- Opciones de despliegue: `llama.cpp` (binario y servidor), Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI tienen soporte parcial de GGUF, pero lo habitual para este formato es `llama.cpp`. El repositorio incluye el tag `endpoints_compatible`, lo que sugiere compatibilidad con endpoints tipo OpenAI a través del servidor de `llama.cpp`.
- Latencia y throughput: no disponible. Como referencia cualitativa, la model card enlaza la gráfica de perplejidad de ikawrakow y las notas de Artefact2 sobre la relación calidad/tamaño de las cuantizaciones IQ frente a las K.
- Almacenamiento: el repositorio completo ocupa 370,8 GB, pero basta con descargar una única variante (entre 7,6 y 28,6 GB).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen-35B-A3B-SignOfFour-Coder (este) | 34,66B totales; activos no disponibles | no disponible | Apache 2.0 | GGUF i1/imatrix y base en safetensors | Merge TIES/DARE sin benchmarks ni adopción publicada |
| Qwen3-30B-A3B | ~30,5B totales, ~3,3B activos (dato de conocimiento general, no presente en la información proporcionada) | 128K nativo (dato de conocimiento general) | Apache 2.0 | safetensors y múltiples GGUF de terceros | Referencia canónica de MoE de ~30B con ~3B activos |
| Mistral Small 3.x 24B | ~24B densos (dato de conocimiento general) | 128K (dato de conocimiento general) | Apache 2.0 | safetensors y GGUF | Alternativa densa de tamaño similar en VRAM de 4 bits |
| Llama 3.3 70B | 70B densos (dato de conocimiento general) | 128K (dato de conocimiento general) | Llama 3.3 Community License | safetensors y GGUF | Requiere mucha más VRAM; licencia con restricciones |

Advertencia: los datos de los modelos alternativos no provienen de la información proporcionada en esta consulta y se incluyen solo como referencia de categoría; verifíquelos en sus fuentes oficiales antes de citarlos.

## Limitaciones y advertencias
- Ausencia total de evaluación: no hay benchmarks, ni comparativas, ni resultados de calidad publicados por el autor. Cualquier uso en producción exige una batería de pruebas propia.
- Riesgo de degradación por merge: las técnicas TIES y DARE combinan pesos de varios checkpoints y pueden producir pérdidas de capacidad o comportamientos inconsistentes que no se detectan sin evaluación.
- Riesgo de alucinación: inherente a cualquier modelo de lenguaje de esta escala sin ajuste por RLHF documentado; en este caso no se documenta ninguna etapa de alineación.
- Idiomas limitados: solo se declaran inglés y chino. El rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas que requieran contexto extenso.
- Cuantizaciones extremas: las variantes IQ1 e IQ2 están descritas por el propio cuantizador como "for the desperate" o de calidad baja; no son aptas para tareas de razonamiento o código exigentes.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Licencia: apache-2.0 permite uso comercial, pero conviene verificar la procedencia y las licencias de todos los checkpoints fusionados en el merge, ya que el repositorio no las detalla.
- Atribución del cuantizador: la model card indica `quantized_by: mradermacher`, aunque el repositorio se publique bajo el espacio de `pragmaticcs`; conviene citar a ambos.

## Enlaces
- Repositorio GGUF (i1/imatrix): https://huggingface.co/pragmaticcs/Qwen-35B-A3B-SignOfFour-Coder-i1-GGUF
- Modelo base: https://huggingface.co/pragmaticcs/Qwen-35B-A3B-SignOfFour-Coder
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Qwen-35B-A3B-SignOfFour-Coder-GGUF
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Qwen-35B-A3B-SignOfFour-Coder-i1-GGUF
- Gráfica de perplejidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre calidad de cuantizaciones: https://gist.github.com/Artefact2/b5f65fc1e39442288e8ec9 (enlace truncado en la model card)
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos no guardaban relación con él.
