# Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ55e-fp16-text

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ55e-fp16-text es una derivación cuantizada publicada en Hugging Face por el usuario Johneeee. No es un modelo entrenado desde cero ni un checkpoint oficial de Alibaba: la model card indica únicamente que se ha generado con la herramienta de cuantización de precisión mixta oQ (oMLX v0.7.0.dev4) a partir de un modelo base de tipo qwen3_5. El recuento real de parámetros del repositorio es de 26.895.998.464 (unos 26,9 mil millones), lo que corresponde a un transformer denso de la familia Qwen3.5, aunque la model card no detalla la arquitectura interna.

El artefacto pesa 18,8 GB y contiene pesos en safetensors con formato MLX, cuantizados a 4 bits con un tamaño de grupo de 64. Su utilidad práctica se limita a la inferencia local sobre Apple Silicon: MLX es un framework específico de los chips M-series de Apple, de modo que este repositorio no puede ejecutarse directamente con CUDA, vLLM ni la mayor parte del ecosistema de servidores de inferencia orientados a GPU NVIDIA.

El interés del modelo es, por tanto, acotado. El repositorio acumulaba 0 descargas y 0 me gusta en el momento de la consulta, no declara licencia ni idiomas soportados y no publica resultados de benchmarks. Además, el nombre del repositorio contiene etiquetas contradictorias con su contenido real: menciona "27B" frente a los 26,9B reales y "fp16" frente a los 4 bits declarados en la propia model card. La etiqueta "Uncensored" sugiere que el ajuste de seguridad del modelo base se ha reducido o eliminado, un extremo que la documentación no confirma ni detalla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (model_type: qwen3_5); detalle de atención y capas no disponible |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits, group size 64, precisión mixta mediante oQ (oMLX v0.7.0.dev4). El nombre del repositorio menciona fp16, dato que no coincide con la model card |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (librería declarada: mlx; tamaño del repo: 18,8 GB) |

## Arquitectura y entrenamiento

La información disponible no describe ninguna fase de entrenamiento, ajuste fino, RLHF ni DPO. El repositorio es exclusivamente el resultado de un proceso de cuantización aplicado sobre un modelo preexistente de tipo qwen3_5, del que no se identifica el checkpoint de origen ni su autor original. Por tanto, no hay datos sobre número de tokens de entrenamiento, composición del dataset ni innovaciones de arquitectura más allá de la etiqueta de familia Qwen3.5.

Lo único documentado es el procedimiento de cuantización: oQ, la herramienta de cuantización de precisión mixta del proyecto oMLX, en su versión v0.7.0.dev4, con 4 bits, tamaño de grupo 64 y salida en safetensors MLX. La precisión mixta implica que distintas capas o tensores pueden conservar un número de bits distinto, aunque la model card no especifica qué componentes reciben más precisión. El sufijo "fp16-text" del nombre sugiere que parte del modelo se ha mantenido en fp16 y que puede tratarse de una variante solo texto, pero ninguno de esos extremos está confirmado en la documentación.

## Capacidades

- Generación de texto: no documentada de forma explícita, pero inherente a un modelo de la familia Qwen3.5.
- Razonamiento y matemáticas: no documentado.
- Generación de código: no documentado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; no se declaran idiomas.
- Modo de pensamiento (thinking mode): no disponible.
- Visión o audio: no disponible; el sufijo "text" del nombre apunta a una variante únicamente de texto.
- Comportamiento sin filtros: la etiqueta "Uncensored" indica que el ajuste de seguridad del modelo base se ha reducido, pero no hay documentación que precise el alcance de esa modificación.

Nota: al tratarse de una cuantización derivada, cabe esperar un comportamiento cercano al del modelo base, pero no se ha publicado ninguna evaluación que lo confirme.

## Casos de uso

- Prototipado local en Mac: permite experimentar con un modelo de ~27B en 4 bits sobre Apple Silicon sin depender de servicios en la nube, usando mlx-lm como runtime.
- Procesamiento de documentos sensibles: al ejecutarse íntegramente en local, los datos no salen del equipo, lo que resulta adecuado para borradores legales, sanitarios o internos que no deben enviarse a APIs externas.
- Red teaming y evaluación de seguridad: al estar etiquetado como "Uncensored", puede emplearse en investigación sobre comportamiento de modelos sin alineación, siempre dentro de un marco ético y legal.
- Generación de texto creativo sin filtrado: escritura de ficción o guiones donde los rechazos automáticos resultan molestos, con la advertencia de que la calidad real no está evaluada.
- Evaluación comparativa de cuantización: sirve para medir la degradación de un modelo de ~27B al pasar a 4 bits con group size 64, comparándolo con el checkpoint original en fp16.
- Asistencia de código en local: generación y autocompletado de código en un IDE sobre Mac, con la salvedad de que no hay benchmarks que respalden su rendimiento en HumanEval o similares.
- Tareas por lotes offline: resumen, reescritura o clasificación de grandes volúmenes de texto en un solo equipo, sin coste por token.
- Base para ajuste fino adicional: al ser un artefacto MLX, puede servir como punto de partida para LoRA sobre Apple Silicon, aunque el formato y la falta de licencia añaden incertidumbre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Pesos en disco: 18,8 GB en 4 bits.
- VRAM o memoria unificada estimada para inferencia: en torno a 20-24 GB considerando pesos más caché KV, cifra orientativa y no confirmada por el autor.
- Plataforma obligatoria: Apple Silicon. El formato MLX no es compatible con CUDA ni con GPUs NVIDIA o AMD en el ecosistema habitual.
- Equipos recomendados: Mac con 32 GB de memoria unificada como mínimo (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max) y 36-64 GB para contextos largos o concurrencia.
- GPU de datacenter (A100, H100, RTX 4090): no aplicables sin convertir previamente los pesos a otro formato.
- Opciones de despliegue: mlx-lm y mlx-lm.server; entornos con soporte MLX como LM Studio. vLLM, TGI, llama.cpp y Ollama no cargan safetensors MLX de forma nativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Este modelo (Johneeee) | 26,9 B | no disponible | no disponible | MLX safetensors 4 bits | no disponible |
| Qwen3-32B | 32,8 B | 128k | Apache-2.0 | safetensors, GGUF, MLX | no disponible en esta ficha |
| Gemma-2-27B | 27 B | 8k | Licencia Gemma | safetensors, GGUF | no disponible en esta ficha |
| Mistral Small 3 (24B) | 24 B | 32k | Apache-2.0 | safetensors, GGUF | no disponible en esta ficha |

La comparación es aproximada: las tres alternativas son modelos base oficiales con documentación completa y evaluación publicada, mientras que este repositorio es una cuantización derivada sin licencia declarada ni métricas. La equivalencia de tamaño no implica equivalencia de calidad.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, el uso comercial queda en una situación jurídica indeterminada. No debe asumirse permiso de uso.
- Modelo derivado sin trazabilidad: no se identifica el checkpoint base exacto, lo que impide verificar la licencia heredada ni el origen de los datos.
- Etiqueta "Uncensored": implica ausencia o reducción del ajuste de seguridad. Aumenta el riesgo de generar contenido dañino, ilegal o sesgado, y no es apto para aplicaciones orientadas al usuario final sin salvaguardas adicionales.
- Cuantización agresiva a 4 bits: es esperable cierta degradación en razonamiento, matemáticas y código respecto al modelo en fp16, aunque no se han publicado mediciones.
- Sin benchmarks: no hay ningún dato de MMLU, HumanEval, GSM8K ni similares. Cualquier afirmación de rendimiento sería especulativa.
- Repositorio sin validación comunitaria: 0 descargas y 0 me gusta, sin indicios de revisión por terceros.
- Compatibilidad restringida: al ser MLX, no se integra con vLLM, TGI, Ollama ni llama.cpp sin conversión previa, lo que limita su uso en producción sobre GPU.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin evaluación específica, se desconoce su magnitud.
- Idiomas y contexto desconocidos: no se puede garantizar un rendimiento adecuado en castellano ni en contextos largos.
- Inconsistencias en el nombre: "27B" frente a 26,9B reales y "fp16" frente a 4 bits declarados, lo que dificulta interpretar el contenido del repositorio.
- Fecha de creación declarada: 2026-09-24, actualizado el 2026-09-24 según los metadatos del repositorio.
- Entrenamiento y alineación desconocidos: no hay información sobre datos, sesgos ni proceso de ajuste, por lo que no se pueden anticipar sesgos concretos.

## Enlaces

- Hugging Face: https://huggingface.co/Johneeee/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-oQ55e-fp16-text
- Herramienta de cuantización oQ / proyecto oMLX: https://github.com/jundot/omlx
- Paper, blog, demo o repositorio adicional del modelo: no disponible
