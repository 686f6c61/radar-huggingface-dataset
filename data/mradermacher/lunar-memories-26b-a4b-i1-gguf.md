# mradermacher/Lunar-Memories-26B-A4B-i1-GGUF

## Resumen

Lunar-Memories-26B-A4B-i1-GGUF es una cuantización en formato GGUF del modelo Lunar-Memories-26B-A4B, publicada por el usuario mradermacher en Hugging Face. Se trata de un artefacto derivado: el repositorio no contiene pesos originales, sino conversiones cuantizadas del modelo base alojado por Sorihon. El nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 26.000 millones de parámetros totales y unos 4.000 millones activos por token, aunque esta información no está confirmada en la documentación disponible.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio tiene cero descargas y cero likes en el momento de la consulta, el tamaño del repo es de apenas 0,1 GB (incompatible con un modelo de 26B en cualquier cuantización razonable) y la model card solo contiene metadatos técnicos del proceso de cuantización, sin descripción funcional, benchmarks ni detalles de entrenamiento. El dato de parámetros totales reportado en la información de Hugging Face (28.444.095) no concuerda con el nombre del modelo y probablemente corresponde a un componente auxiliar o a un error de metadatos.

Por tanto, esta ficha documenta lo que se puede verificar del repositorio y marca explícitamente como "no disponible" todo aquello que no figura en la información proporcionada. No se debe asumir que el modelo funciona en producción ni que sus pesos están completos sin verificación directa del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferida del nombre "A4B"; no confirmada en la model card) |
| Parametros totales | 26B segun el nombre del modelo; 28.444.095 segun metadatos de safetensors (dato inconsistente) |
| Parametros activos | ~4B (inferido del sufijo "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix de llama.cpp) |

## Arquitectura y entrenamiento

No hay información en la model card sobre la arquitectura interna del modelo base Lunar-Memories-26B-A4B. El sufijo "A4B" en la nomenclatura habitual de modelos MoE (por ejemplo, Qwen3-30B-A3B) indica aproximadamente 4.000 millones de parámetros activos por token, pero no se confirma en la documentación. El nombre "26B" apunta a un total de 26.000 millones de parámetros, en contradicción con el dato de safetensors de 28.444.095 parámetros.

Respecto al proceso de cuantización, los comentarios de la model card indican: `quantize_version: 2`, `output_tensor_quantised: 1`, `convert_type: hf` y `skip_mmproj: 1`. Esto sugiere una conversión desde pesos en formato Hugging Face a GGUF, con cuantización de tensores de salida y omisión del proyector multimodal (mmproj), lo que implica que el modelo base podría tener capacidades multimodales que no se conservan en estas cuantizaciones. Se han generado cuantizaciones ponderadas con imatrix (prefijo "i1"), lo que típicamente mejora la calidad en cuantizaciones agresivas. No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF, DPO).

## Capacidades

- Generación de texto: presumiblemente, al ser un modelo de lenguaje, aunque no se documenta.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades multimodales: el flag `skip_mmproj: 1` sugiere que el modelo base podría tener un proyector multimodal, pero estas cuantizaciones lo omiten, por lo que la versión GGUF no sería multimodal.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

Dado que no hay documentación funcional del modelo, los casos de uso son hipotéticos y deben validarse empíricamente antes de cualquier despliegue:

- Inferencia local en equipos con GPU de consumo: las cuantizaciones Q4_K_M o Q5_K_M permitirían, en teoría, ejecutar un modelo de ~26B con ~4B activos en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, siempre que el tamaño real de los pesos lo permita.
- Prototipado rápido de aplicaciones de chat: usar las cuantizaciones IQ2/IQ3 en hardware limitado para experimentar con el modelo antes de invertir en infraestructura mayor.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 24 variantes, lo que permite estudiar la degradación de calidad entre Q2 y Q6 en un mismo modelo base.
- Despliegue en entornos sin acceso a internet: el formato GGUF es autocontenido y funciona offline con llama.cpp.
- Investigación sobre modelos MoE de tamaño medio: si se confirma la arquitectura A4B, sería útil para estudiar el equilibrio entre parámetros totales y activos en tareas de razonamiento.
- Filtrado y generación de texto en pipelines ligeros: con cuantizaciones IQ2/IQ1 en CPU, para tareas de baja latencia crítica y tolerancia a errores.

En todos los casos, la ausencia de benchmarks y de model card funcional obliga a realizar una evaluación propia antes de usar el modelo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Para un modelo de ~26B en Q4_K_M se necesitarían aproximadamente 15-16 GB; en Q8 ~27 GB; en Q2 ~8-9 GB. Estas cifras son estimaciones genéricas basadas en el tamaño nominal, no en mediciones del repositorio.
- GPU recomendadas: no disponible. Por tamaño, una RTX 4090 (24 GB) podría alojar cuantizaciones Q4/Q5; una A100 40/80 GB o H100 para cuantizaciones altas o contexto largo.
- Cabe en GPU de consumo: probablemente sí en Q2-Q4 con GPUs de 16-24 GB, sujeto a verificación del tamaño real de los archivos (el repo reporta 0,1 GB, lo que es inconsistente con cualquier cuantización de un modelo de 26B).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Lunar-Memories-26B-A4B-i1-GGUF | ~26B (nominal) | ~4B (inferido) | no disponible | no disponible | GGUF |
| Qwen3-30B-A3B | 30B | 3B | 128K (según versión) | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | ~12,9B | 32K | Apache 2.0 | safetensors, GGUF |
| Gemma 3 27B | 27B | denso | 128K | Gemma Terms | safetensors, GGUF |

La comparativa es aproximada: no se dispone de datos verificados del modelo base de Sorihon, por lo que la fila correspondiente solo refleja el nombre y los metadatos del repositorio.

## Limitaciones y advertencias

- Model card prácticamente vacía: no hay descripción funcional, benchmarks, idiomas ni licencia declarada.
- Inconsistencia de metadatos: el nombre indica 26B, el dato de safetensors indica 28,4M y el tamaño del repo es 0,1 GB; ninguno de los tres es coherente con un modelo MoE de 26B.
- Cero descargas y cero likes: no hay evidencia de uso ni validación por parte de la comunidad.
- Licencia no disponible: no se puede confirmar el uso comercial; contactar con el autor del modelo base (Sorihon) antes de cualquier despliegue productivo.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay información sobre alineación o mitigaciones.
- Idiomas: no se especifican; no asumir soporte multilingüe.
- Multimodalidad descartada: `skip_mmproj: 1` implica que estas cuantizaciones no incluyen el proyector visual, aunque el modelo base lo tuviera.
- Cuantizaciones IQ1/IQ2: degradación significativa esperada en calidad; usar solo si el hardware es muy limitado.
- Fecha de creación (2026-11-26): posterior a la fecha actual en muchos contextos; verificar que el repositorio existe y es accesible antes de integrarlo en cualquier pipeline.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Lunar-Memories-26B-A4B-i1-GGUF
- Modelo base (referenciado en la model card): https://huggingface.co/Sorihon/Lunar-Memories-26B-A4B
