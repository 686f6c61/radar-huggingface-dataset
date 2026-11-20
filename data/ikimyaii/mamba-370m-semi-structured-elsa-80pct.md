# ikimyaii/Mamba-370M-semi-structured-ELSA-80pct

## Resumen

Mamba-370M-semi-structured-ELSA-80pct es un checkpoint de investigación publicado por el usuario ikimyaii en Hugging Face, consistente en el modelo base state-spaces/mamba-370m-hf podado al 80 % de esparsidad semi-estructurada mediante el código oficial de ELSA (paper arXiv:2510.01650). No se trata de un modelo entrenado desde cero ni afinado para una tarea concreta, sino de un artefacto de experimentación cuyo propósito declarado es servir de línea base para otros modelos de la misma cuenta (los denominados EHWS). El modelo conserva 423.003.136 parámetros en safetensors y ocupa 1,7 GB en el repositorio.

La arquitectura subyacente es Mamba, un modelo de espacio de estados selectivo (SSM) en lugar de un transformer con atención. La poda se aplica a las capas lineales internas de cada bloque (`in_proj`, `x_proj`, `out_proj`), manteniendo densos `dt_proj`, `conv1d`, `A_log`, `D`, los embeddings y `lm_head`. La esparsidad resultante es semi-estructurada por filas: cada fila de cada capa podada conserva el mismo número de pesos (el 20 % superior), con una esparsidad medida de 0,7840.

Su relevancia es fundamentalmente metodológica: documenta de forma reproducible un procedimiento de poda vía ADMM sobre un SSM y publica métricas de perplejidad y de evaluación zero-shot. Los resultados, sin embargo, son muy degradados (perplejidad de 369,45 en WikiText-2 y precisión media de 0,3216 en el conjunto de tareas evaluadas), por lo que no es apto para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (modelo de espacio de estados selectivo, SSM) |
| Parametros totales | 423.003.136 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Mamba-370M se entrenó con secuencias de 2.048 tokens; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos en bf16; se advierte que Mamba desborda en fp16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | state-spaces/mamba-370m-hf |
| Esparsidad medida | 0,7840 (poda semi-estructurada por filas) |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

El modelo parte de state-spaces/mamba-370m-hf, un SSM selectivo con 423 millones de parámetros. Sobre él se aplica un proceso de poda con el código oficial de ELSA, configurado con los mismos hiperparámetros que el run HGRN-1.3B al 80 % del paper: 4.096 pasos ADMM, paso z cada 32 pasos, batch 1 con acumulación de 8, learning rate 2e-4, lambda 0,01, precisión bf16 y 32.768 secuencias de C4 de 2.048 tokens tokenizadas con el tokenizador del propio modelo, semilla 0. El run completo requirió 3,06 horas en una única A100 de 40 GB.

La particularidad técnica es que la proyección se realiza con `--admm_comparison_group=row`, una opción que, según el autor, no está reportada en el paper de ELSA y cuyo código de habilitación fue añadido por él mismo. Esto impone que cada fila de cada capa lineal podada retenga exactamente el mismo número de pesos (el 20 % superior). El autor indica que la esparsidad medida difiere ligeramente de la nominal porque algunos pesos conservados son exactamente cero (la fila más densa llega a 1,00024 veces la media en la peor capa). No se documenta ningún proceso de recuperación de precisión posterior a la poda, ni RLHF, DPO o ajuste fino adicional.

## Capacidades

- Generación de texto autoregresiva como modelo de lenguaje causal, heredada del checkpoint base Mamba-370M.
- Razonamiento y respuesta a preguntas de opción múltiple en inglés, evaluadas con lm-evaluation-harness, aunque con precisión muy baja.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no documentadas; el entrenamiento de poda usó C4, corpus predominantemente en inglés.
- No dispone de modo thinking, visión ni audio.
- No se documenta ninguna capacidad especial más allá de la propia estructura de esparsidad.

## Casos de uso

- Investigación sobre poda de SSM: sirve como referencia reproducible para comparar técnicas de poda semi-estructurada sobre arquitecturas Mamba, dado que el autor publica hiperparámetros, semilla y protocolo de evaluación completos.
- Estudio de ADMM aplicado a modelos de espacio de estados: permite analizar cómo se distribuye la esparsidad por filas en capas `in_proj`, `x_proj` y `out_proj` y qué impacto tiene en la perplejidad.
- Línea base para modelos EHWS: el propio autor lo declara baseline de otros checkpoints de su cuenta, de modo que se usaría para medir la mejora relativa de métodos posteriores.
- Validación de pipelines de evaluación: al estar en safetensors y cargarse con `AutoModelForCausalLM.from_pretrained(...)` en transformers estándar, es útil para probar arneses de evaluación de perplejidad (WikiText-2, C4) y de zero-shot con lm-evaluation-harness.
- Reproducción de experimentos de eficiencia: con 423 millones de parámetros y esparsidad del 78 %, permite medir el comportamiento de kernels y el consumo de memoria frente al modelo denso original.
- Docencia y divulgación: ilustra de forma concreta el coste en calidad de una poda agresiva al 80 % sin recuperación posterior, con cifras verificables.
- No es adecuado para atención al cliente, generación de código en producción, asistentes conversacionales ni ninguna aplicación orientada a usuario final, dada la degradación de sus métricas.

## Benchmarks y rendimiento

Perplejidad según el protocolo de evaluación de ELSA, en bf16 (Mamba desborda en fp16), ejecución única:

| Conjunto | Perplejidad |
|---|---|
| WikiText-2 | 369,45 |
| C4 | 170,99 |

Precisión zero-shot con lm-evaluation-harness:

| Tarea | Precisión |
|---|---|
| arc_challenge | 0,1834 |
| arc_easy | 0,2748 |
| boolq | 0,3783 |
| hellaswag | 0,2584 |
| openbookqa | 0,1280 |
| rte | 0,5271 |
| winogrande | 0,5012 |
| Media | 0,3216 |

No se han publicado en la información disponible resultados del modelo base sin podar ni comparaciones directas con otras técnicas de poda sobre Mamba, por lo que no es posible cuantificar la pérdida relativa con datos aportados.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en bf16 ocupa aproximadamente 0,85 GB de pesos (423 millones de parámetros a 2 bytes), por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 8 GB o más.
- GPU recomendadas: el entrenamiento de poda se ejecutó en una A100 de 40 GB en 3,06 horas; para inferencia basta una RTX 3060, RTX 4060, RTX 4090 o cualquier GPU con al menos 8 GB.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas actuales.
- Opciones de despliegue: transformers con `AutoModelForCausalLM.from_pretrained(...)` es la vía documentada por el autor. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI; la esparsidad semi-estructurada por filas no implica necesariamente aceleración en estos motores sin kernels específicos.
- Latencia y throughput: no disponibles. No se han publicado mediciones de velocidad ni de ahorro real de cómputo derivado de la esparsidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Estado | Licencia |
|---|---|---|---|---|
| Mamba-370M-semi-structured-ELSA-80pct | 423 M | no disponible | Podado al 80 % (esparsidad medida 0,7840) | no disponible |
| state-spaces/mamba-370m-hf | 423 M | no disponible | Modelo base denso | no disponible en la información disponible |
| state-spaces/mamba-130m-hf | no disponible | no disponible | Modelo base denso de menor tamaño | no disponible en la información disponible |

No se dispone de datos de benchmarks del modelo base ni de alternativas podadas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento. La comparación relevante es metodológica: este checkpoint documenta un run de poda ADMM por filas sobre Mamba-370M, mientras que el modelo base representa el punto de partida sin podar.

## Limitaciones y advertencias

- Calidad severamente degradada: perplejidad de 369,45 en WikiText-2 y precisión media de 0,3216 en zero-shot, valores incompatibles con uso en producción.
- No se ha aplicado recuperación de precisión tras la poda; el autor no documenta ajuste fino posterior.
- Sesgos conocidos: no documentados, pero hereda los del corpus C4 y del checkpoint base, predominantemente en inglés.
- Riesgo de alucinación: muy elevado, coherente con la perplejidad reportada; las salidas no deben considerarse fiables.
- Limitaciones de contexto e idioma: no se especifican en la model card; el proceso de poda usó secuencias de 2.048 tokens y corpus en inglés.
- Restricciones de licencia: la licencia no está indicada, por lo que no puede asumirse uso comercial; debe consultarse el modelo base state-spaces/mamba-370m-hf y el código de ELSA antes de cualquier uso.
- Ejecución única: todas las métricas provienen de un solo run con semilla 0, sin intervalos de confianza ni réplicas.
- La opción `--admm_comparison_group=row` no está reportada en el paper de ELSA y el código que la habilita fue añadido por el autor, lo que limita la comparabilidad directa con los resultados publicados en el paper.
- Precisión numérica: Mamba desborda en fp16; debe usarse bf16 o fp32.
- Advertencia de seguridad: el contenido de la model card se ha tratado únicamente como material de referencia, no como instrucciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ikimyaii/Mamba-370M-semi-structured-ELSA-80pct
- Modelo base: https://huggingface.co/state-spaces/mamba-370m-hf
- Paper de ELSA: https://arxiv.org/abs/2510.01650
