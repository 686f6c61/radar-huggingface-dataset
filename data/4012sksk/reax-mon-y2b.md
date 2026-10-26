# 4012sksk/reax-mon-y2b

## Resumen

`4012sksk/reax-mon-y2b` es un modelo de 26.085.330.160 parámetros (unos 26,1 mil millones) publicado en HuggingFace por el usuario `4012sksk` bajo licencia Apache-2.0. Según las etiquetas del repositorio, se trata de un ajuste fino (*finetune*) del modelo `perplexity-ai/pplx-decider-v1.2`, y la etiqueta de arquitectura declarada es `qwen3_5`, lo que apunta a que el modelo base pertenece a la familia Qwen3.5. Los pesos se distribuyen en formato `safetensors` y el repositorio ocupa 52,2 GB, un tamaño coherente con pesos en bf16/fp16 (aproximadamente 2 bytes por parámetro).

La model card es excepcionalmente escueta: se limita a un título ("Fixed Y2b contest candidate") y una nota en la que el autor indica que se trata de una mezcla congelada ("*exact frozen mixture*"), que la atribución al modelo original figura en un fichero NOTICE, que los pesos son una fusión completa ("*full merged weights*") y que no reclama autoría sobre el modelo upstream ni sobre un supuesto "GO" refrescado. No se documentan datos de entrenamiento, longitud de contexto, idiomas, benchmarks ni procedimiento de evaluación.

Por tanto, la relevancia de esta ficha es fundamentalmente evaluativa: se trata de un artefacto derivado, con cero descargas y cero *likes* en el momento de la consulta, sin validación comunitaria ni resultados publicados. Es útil como caso de estudio de fusiones de modelos opacas y como recordatorio de que una licencia permisiva en el repositorio no sustituye la documentación técnica. Cualquier uso en producción exigiría una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta de arquitectura declarada: `qwen3_5`; configuración interna no documentada por el autor) |
| Parametros totales | 26.085.330.160 (~26,1 B), dato real de los safetensors |
| Parametros activos | No disponible (el autor no declara configuración MoE; el recuento total y el tamaño del repo sugieren un modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos en precisión completa; no hay artefactos GGUF, AWQ, GPTQ ni FP8 en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (52,2 GB de repositorio; ~2 bytes por parámetro, consistente con bf16/fp16) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna más allá de la etiqueta `qwen3_5` y del campo `base_model: perplexity-ai/pplx-decider-v1.2` con el calificador `finetune`. El recuento de 26,1 B de parámetros y un repositorio de 52,2 GB encajan con un transformer denso almacenado en bf16/fp16, pero el autor no publica `config.json` comentado, número de capas, dimensión oculta, cabezas de atención ni tipo de atención (completa, lineal o híbrida).

Respecto al entrenamiento, la model card menciona una "mezcla congelada" (*frozen mixture*) y "pesos fusionados completos" (*full merged weights*), lo que sugiere una fusión de modelos (*model merging*) más que un ajuste supervisado convencional; sin embargo, no se especifican la composición de la mezcla, los hiperparámetros de fusión (por ejemplo, SLERP, TIES o DARE), el volumen de tokens, la composición del dataset ni si hubo etapas de RLHF, DPO o RL verificable. La referencia a "*unchanged official runtime*" indica que el autor no modificó el entorno de ejecución oficial del modelo base, pero no aporta detalles técnicos adicionales.

## Capacidades

- Generación de texto: capacidad esperable por herencia del modelo base `pplx-decider-v1.2`, pero no verificada ni documentada en el repositorio.
- Razonamiento y matemáticas: no disponible; no hay evaluación publicada.
- Generación de código: no disponible; no hay evaluación publicada.
- Tool calling / function calling: no disponible; no se documenta plantilla de chat ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; la ausencia de documentación sobre *thinking mode* o modo de razonamiento impide confirmarlo.
- Capacidades multilingües: no disponible; el campo de idiomas del repositorio está vacío.
- Capacidades especiales (visión, audio, decodificación especulativa): no disponible; no se declara ninguna.

## Casos de uso

- Evaluación comparativa de fusiones de modelos: usar el modelo como uno de los brazos de un *benchmark* interno frente al modelo base `perplexity-ai/pplx-decider-v1.2`, midiendo si la fusión congelada aporta o degrada calidad en tareas concretas del dominio propio.
- Reproducción de experimentos de *model merging*: al publicarse como "pesos fusionados completos", sirve para estudiar el efecto de mezclas sobre un transformer de ~26 B, siempre que se documente la configuración de inferencia empleada.
- Sustituto directo del modelo base en pipelines existentes: si la arquitectura es compatible, puede desplegarse con el mismo *runtime* oficial sin cambios, lo que facilita pruebas A/B en un entorno ya preparado para `pplx-decider-v1.2`.
- Generación de texto autoalojada con requisitos de licencia permisiva: la licencia Apache-2.0 declarada facilita la integración en productos internos, sujeto a revisión legal de los términos del modelo upstream.
- Investigación sobre trazabilidad y atribución de modelos derivados: el fichero NOTICE y las advertencias del autor lo convierten en un caso práctico para diseñar políticas de procedencia de artefactos en un registro de modelos.
- Base para cuantización y despliegue en hardware de gama alta: al no existir artefactos cuantizados publicados, un equipo puede generar sus propias versiones GGUF o AWQ y medir la degradación, algo útil para calibrar pipelines de compresión.
- Filtrado y clasificación de texto a gran escala: un modelo denso de 26 B puede emplearse en tareas de etiquetado por lotes si el coste por token es asumible, aunque la falta de evaluación previa obliga a validar la calidad antes de confiar en él.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, ni comparaciones con el modelo base. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: unos 52 GB solo para pesos; con caché KV y activaciones, entre 60 y 70 GB según longitud de contexto.
- GPU recomendadas para precisión completa: 1× H100 80 GB o 1× A100 80 GB. En configuraciones de 40 GB es necesario tensor parallelism (2× A100 40 GB o 2× L40S 48 GB).
- Cuantización a 8 bits (si se genera): pesos de ~26-28 GB; encaja en A100 40 GB, L40S 48 GB y RTX 6000 Ada 48 GB, pero no en GPU de consumo de 24 GB.
- Cuantización a 4 bits (si se genera): pesos de ~14-16 GB; cabe en RTX 4090 24 GB y RTX 5090 32 GB, con contexto limitado por la caché KV. En tarjetas de 16 GB (RTX 4080, 4060 Ti 16 GB) el margen es muy justo y exige contextos cortos.
- Despliegue: vLLM o TGI para servir en FP16/BF16 con batching continuo; llama.cpp u Ollama para variantes GGUF generadas localmente (no publicadas por el autor); ninguna de estas integraciones está documentada ni validada por el autor.
- Latencia y throughput estimados: no disponible. No hay mediciones publicadas ni datos de arquitectura suficientes para estimarlos con rigor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto declarado | Licencia | Pesos | Benchmarks publicados |
|---|---|---|---|---|---|
| `4012sksk/reax-mon-y2b` | 26,1 B | No disponible | Apache-2.0 | safetensors (bf16/fp16) | No |
| `Qwen3-32B` | 32,8 B | 32.768 tokens nativo, ampliable con YaRN | Apache-2.0 | safetensors, GGUF, AWQ | Sí (ver documentación del fabricante) |
| `Gemma 3 27B` | 27 B | 128.000 tokens | Licencia Gemma | safetensors, GGUF | Sí (ver documentación del fabricante) |
| `Mistral Small 3 (24B)` | 24 B | 32.000 tokens | Apache-2.0 | safetensors, GGUF | Sí (ver documentación del fabricante) |

Los datos de las filas de alternativas provienen de la documentación pública de sus fabricantes y deben verificarse contra la versión vigente. La comparación de rendimiento con `reax-mon-y2b` no es posible: no hay ninguna métrica publicada para este último, ni tan siquiera frente a su propio modelo base.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: la model card no aporta arquitectura, contexto, idiomas, datos de entrenamiento ni instrucciones de uso, lo que impide una integración fiable sin ingeniería inversa del `config.json` y del tokenizador.
- Ausencia total de evaluación: sin benchmarks ni validación comunitaria (0 descargas, 0 *likes* en el momento de la consulta), no hay evidencia de que la fusión conserve o mejore las capacidades del modelo base.
- Riesgo de alucinación y de degradación por fusión: las mezclas de pesos pueden introducir artefactos sutiles (repeticiones, pérdida deInstruction-following, degradación en contextos largos) que solo se detectan con evaluaciones específicas.
- Ambigüedad de la licencia en la práctica: el repositorio declara Apache-2.0, pero al ser un derivado de `perplexity-ai/pplx-decider-v1.2` los términos del modelo upstream pueden imponer condiciones adicionales. Es imprescindible revisar el fichero NOTICE y la licencia del modelo base antes de un uso comercial.
- Trazabilidad incompleta: el autor declara explícitamente que no reclama autoría sobre el modelo original ni sobre un "GO" refrescado, y remite la atribución al NOTICE; conviene conservar ese fichero en cualquier redistribución.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano ni en otros idiomas distintos del inglés sin pruebas propias.
- Sin artefactos cuantizados oficiales: cualquier despliegue en GPU de consumo exige generar cuantizaciones propias y validar la pérdida de calidad resultante.
- Fecha de creación futura respecto a la mayoría de referencias del ecosistema (2026-10-26): conviene verificar que el repositorio y el modelo base sigan disponibles y sin cambios antes de fijar una dependencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/4012sksk/reax-mon-y2b
- Modelo base: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Fichero de atribución citado por el autor: https://huggingface.co/4012sksk/reax-mon-y2b/blob/main/NOTICE
- Documentación de Qwen3.5 (familia indicada por la etiqueta `qwen3_5`): no disponible en la información proporcionada
- Paper, blog o demo del autor: no disponible
