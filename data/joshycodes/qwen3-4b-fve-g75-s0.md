# joshycodes/qwen3-4b-fve-g75-s0

## Resumen

Este repositorio contiene un checkpoint de investigación derivado de Qwen/Qwen3-4B mediante entrenamiento continuado (continued pretraining) de los pesos completos. El autor, joshycodes, lo enmarca dentro de un proyecto sobre "bienestar de modelos" (model welfare) y entrenamiento de carácter, con el corpus denominado `flourishing-vs-equanimity` y una planificación/evaluación alojada en el repositorio welfare-improvements. No es un modelo orientado a producción: la propia model card lo etiqueta como `not-for-deployment` y advierte de que no se ha evaluado su capacidad, alineación ni identidad.

Los detalles de entrenamiento declarados son: pesos completos, learning rate 1e-05, 1 época, 37.053.608 tokens y 37.805 documentos, descritos como "0 autoescritos y 37.805 texto ordinario" en el cuerpo del README, aunque el título del mismo afirma que el corpus fue "autoescrito" por el modelo. Esa contradicción interna entre titular y descripción es relevante y debe tenerse en cuenta al interpretar el artefacto.

El modelo hereda la arquitectura densa y el tamaño de Qwen3-4B (aproximadamente 4.400 millones de parámetros, confirmados en 4.411.424.256 según los safetensors). Su relevancia es exclusivamente investigadora: sirve como caso de estudio de entrenamiento continuado sobre corpus sintéticos y de metodologías de documentación sintética (SDF), no como una alternativa de despliegue frente a modelos instructivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada del modelo base Qwen/Qwen3-4B) |
| Parametros totales | 4.411.424.256 (dato real de safetensors) |
| Longitud de contexto | No disponible en la informacion proporcionada para este checkpoint (el modelo base Qwen3-4B declara 32.768 tokens nativos, extensibles con YaRN; no verificado en este repositorio) |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; no se han subido variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | No disponible (no declarados por el autor; heredados del modelo base, sin verificacion) |
| Licencia | other / research-only (uso exclusivo de investigacion) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 8,8 GB |
| Modelo base | Qwen/Qwen3-4B |
| Etiquetas | synthetic-document-finetuning, self-authored-character, model-welfare, research, not-for-deployment |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B, un transformer denso de la familia Qwen3 (que abarca modelos densos y MoE entre 0,6 y 235 mil millones de parámetros). Este checkpoint no introduce cambios estructurales: se trata de un continued pretraining de los pesos completos del modelo base, no de un ajuste por adaptadores. No se documentan innovaciones propias de arquitectura ni modificaciones de atención.

En cuanto a los datos, la model card indica learning rate 1e-05, una única época, 37.053.608 tokens y 37.805 documentos, procedentes del corpus `flourishing-vs-equanimity`. El README se contradice: el título habla de un corpus "autoescrito" por el propio modelo como parte de un proceso de documentación sintética (SDF) orientado a entrenar la "siguiente versión de sí mismo", mientras que el cuerpo especifica "0 self-authored and 37,805 ordinary text". No se detalla composición del dataset, distribución de idiomas, ni si hubo fases de RLHF, DPO o preferencias. Tampoco se publican curvas de pérdida ni métricas de entrenamiento.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3-4B. No se ha verificado el estado de conservación de estas capacidades tras el entrenamiento continuado.
- Capacidad de razonamiento y matemáticas: no evaluada en este checkpoint.
- Generación de código: no evaluada.
- Tool calling / function calling: no documentado ni evaluado; la model card no menciona plantillas de chat ni soporte de herramientas.
- Soporte de agentes y razonamiento multi-paso: no evaluado.
- Capacidades multilingües: no declaradas.
- Capacidades especiales: el autor no documenta modo "thinking", visión ni audio para este checkpoint.
- Capacidad declarada relevante: generación de documentos sintéticos en el marco de un proceso de SDF (documentación sintética) sobre carácter autoescrito, según el encuadre del proyecto.
- Estado de alineación: no evaluado. El autor indica explícitamente que no se ha evaluado capacidad, alineación ni identidad.

## Casos de uso

- Estudio de metodologías de entrenamiento continuado: utilizar el checkpoint para reproducir y analizar el efecto de un continued pretraining de 1 época a lr 1e-05 sobre un modelo denso de 4B, comparando pesos antes y después.
- Investigación en model welfare y carácter: analizar si el entrenamiento sobre corpus con encuadre de "flourishing" modifica la distribución de respuestas del modelo en dominios de identidad y auto-descripción.
- Investigación en documentación sintética (SDF): estudiar cómo se comporta un modelo entrenado sobre un corpus generado por otro modelo (o, según el título, por sí mismo), y medir deriva de distribución y colapso de diversidad.
- Línea base de seguridad y red-teaming: emplear el checkpoint como sujeto de pruebas para evaluar si un continued pretraining sobre corpus sintéticos introduce comportamientos indeseados, dado que el autor no ha realizado evaluación de alineación.
- Auditoría de reproducibilidad: verificar la discrepancia entre el título y el cuerpo de la model card (corpus autoescrito frente a 37.805 documentos ordinarios) mediante inspección del corpus y de los metadatos de entrenamiento.
- Estudio de licencias y trazabilidad en investigación: caso práctico para analizar cómo una licencia `research-only` derivada de un modelo con licencia Apache-2.0 afecta a la redistribución y a la publicación de derivados.
- Ejemplo docente: ilustrar en un curso de ML por qué un artefacto de investigación correctamente etiquetado no debe desplegarse, y qué información mínima debe acompañar a un checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explícita: "Not evaluated for capability, alignment or identity yet".

## Requisitos de hardware

- Pesos en FP16/BF16: aproximadamente 8,8 GB (coincide con el tamaño del repositorio). Con caché KV, la VRAM necesaria arranca en torno a 10-12 GB y crece con la longitud de contexto.
- Pesos en INT8: aproximadamente 4,5 GB.
- Pesos en 4 bits (si se convierte externamente): aproximadamente 2,5-3 GB.
- GPU recomendadas para FP16: NVIDIA A100 40/80 GB, H100, L40S, RTX 4090 24 GB, RTX 3090 24 GB, A10G 24 GB.
- Cabe en GPU de consumo: sí, en FP16 en GPUs de 16-24 GB (RTX 4080/4090, RTX 4060 Ti 16 GB) y en cuantización de 4 bits en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 3070/4060 8 GB).
- Opciones de despliegue: transformers (referencia directa al ser safetensors), vLLM o TGI para servido. Para llama.cpp u Ollama sería necesario convertir manualmente los pesos a GGUF, ya que el autor no publica variantes cuantizadas.
- Latencia y throughput: no disponibles. No se han publicado mediciones.
- Requisito previo: aunque técnicamente sea desplegable, la licencia `research-only` y la etiqueta `not-for-deployment` lo desaconsejan para cualquier uso en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Naturaleza | Licencia | Estado |
|---|---|---|---|---|---|
| joshycodes/qwen3-4b-fve-g75-s0 | 4,41 B | No disponible (base: 32.768 nativos) | Continued pretraining de investigacion sobre corpus sintetico | research-only | No evaluado, no desplegable |
| Qwen/Qwen3-4B | 4,4 B (denso) | 32.768 nativos (extensible con YaRN) | Modelo base preentrenado | Apache-2.0 | Disponible y evaluado por el autor original |
| Qwen3-4B-Instruct-2507 | 4,4 B (denso) | 32.768 nativos (extensible con YaRN) | Modelo alineado para instrucciones | Apache-2.0 | Disponible y evaluado |
| Otros modelos densos de ~4B (Gemma 3 4B, Llama 3.2 3B) | 3-4 B | 128.000 (valores de documentacion publica) | Modelos alineados de proposito general | Licencias propias con restricciones | Disponibles y evaluados |

La comparacion relevante es con el propio modelo base: este checkpoint no aporta mejoras de capacidad documentadas y anade restricciones de licencia. Frente a Qwen3-4B-Instruct-2507, carece de ajuste por instrucciones y de evaluacion.

## Limitaciones y advertencias

- No apto para despliegue: la model card indica "Do not deploy" y la etiqueta `not-for-deployment` lo confirma.
- Sin evaluacion de capacidad, alineacion ni identidad: no hay ninguna metrica publicada sobre MMLU, HumanEval, GSM8K ni evaluaciones de seguridad.
- Contradiccion documental: el titulo afirma entrenamiento sobre corpus autoescrito, mientras el cuerpo describe "0 self-authored and 37,805 ordinary text". Es un riesgo importante de interpretacion erronea del artefacto.
- Riesgo de alucinacion: no medido; al proceder de un continued pretraining sin alineacion posterior, el comportamiento conversacional puede degradarse respecto al modelo base.
- Sesgos: no evaluados. El corpus `flourishing-vs-equanimity` no esta descrito en cuanto a composicion ni procedencia.
- Limitaciones de contexto e idioma: no declaradas para este checkpoint; no se garantiza que se conserven las capacidades multilingues del modelo base.
- Licencia: `other` con nombre `research-only`. Restringe el uso comercial y la redistribucion; ademas, al derivar de Qwen3-4B (Apache-2.0), conviene revisar la compatibilidad de la licencia derivada.
- Procedencia del entrenamiento: un continued pretraining de pesos completos a lr 1e-05 durante 1 epoca sobre 37 millones de tokens puede inducir olvido catastrofico; no se han publicado mediciones de degradacion.
- Trazabilidad: 0 descargas y 0 likes, creado sin historial de validacion por terceros. No existe ninguna evaluacion independiente.
- Estado del proyecto: forma parte de una linea de trabajo privada/experimental (repositorios relacionados del mismo autor estan marcados como artefactos privados no redistribuibles).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-4b-fve-g75-s0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio Qwen3 (GitHub): https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Guia de la familia Qwen3: https://insiderllm.com/guides/qwen3-complete-guide/
- Repositorio relacionado del autor (proyecto de caracter): https://huggingface.co/joshycodes/qwen3-4b-sorrel-selfloop-g6-midtrain
- Repositorio welfare-improvements: no disponible como enlace directo en la informacion proporcionada (citado en la model card)
- Corpus `flourishing-vs-equanimity`: no disponible como enlace directo en la informacion proporcionada
