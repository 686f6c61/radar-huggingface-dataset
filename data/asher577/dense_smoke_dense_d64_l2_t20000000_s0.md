# asher577/dense_smoke_dense_d64_L2_t20000000_s0

## Resumen

`dense_smoke_dense_d64_L2_t20000000_s0` es un modelo transformer de investigación publicado por el usuario asher577 en Hugging Face. Se trata de un modelo de escala mínima (2 capas, dimensión de modelo 64, vocabulario de 4096 tokens) entrenado con el procedimiento descrito por Gao et al. (2025) para transformers con dispersión en pesos, aunque en esta variante concreta la dispersión de pesos está desactivada (`Weight Sparsity: False`). El nombre del repositorio indica que es una ejecución de "humo" (smoke test) dentro de una campaña de escalado denominada `scd_scaling`.

El modelo no está pensado para uso en producción ni para tareas de propósito general: es una pieza de un estudio empírico sobre escalado y dispersión. Se ha entrenado sobre el dataset `jacobcd52/simplestories-tokenized` con el tokenizador `SimpleStories/SimpleStories-1.25M`, acumulando 20 millones de tokens de entrenamiento y una longitud de contexto de 512 tokens.

Su relevancia es exclusivamente metodológica: sirve como punto de referencia de baja escala dentro de una familia de experimentos (existen variantes hermanas como `scaling1_dcp_d2048_L2_t1000000000_s0` y `scaling1_dcp_d1024_L2_t1000000000_s0`) para estudiar el comportamiento de arquitecturas dispersas en pesos frente a densas. No se ha publicado información sobre licencia, idiomas ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (weight-sparse transformer segun Gao et al. 2025; variante densa en este checkpoint) |
| Parametros totales | no disponible (2 capas, dim. de modelo 64, dim. de cabeza 16, vocab 4096) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`pytorch_model.bin`) + `config.json` |
| Capas | 2 |
| Dimension de modelo | 64 |
| Dimension de cabeza | 16 |
| Tamano de vocabulario | 4096 |
| Disposicion de pesos | densa (`Weight Sparsity: False`) |
| Dispersion de activaciones | desactivada (`Activation Sparsity: False`) |
| Target L0 fraction | 0.01 |
| Tokens de entrenamiento | 20.000.000 |
| Dataset | `jacobcd52/simplestories-tokenized` |
| Tokenizador | `SimpleStories/SimpleStories-1.25M` |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 2 capas con dimensión de modelo 64 y dimensión de cabeza 16, lo que implica 4 cabezas de atención por capa. El vocabulario es de 4096 tokens y la ventana de contexto de 512. El modelo sigue el procedimiento de entrenamiento descrito por Gao et al. (2025) para transformers con dispersión en pesos, si bien este checkpoint concreto se marca explícitamente como denso: no aplica dispersión ni en pesos ni en activaciones, y el `Target L0 Fraction` de 0.01 figura solo como parámetro de configuración del experimento.

El entrenamiento se realizó sobre `jacobcd52/simplestories-tokenized`, un corpus tokenizado con `SimpleStories/SimpleStories-1.25M`, con un total de 20 millones de tokens vistos. No se documenta en la model card si hubo fases de RLHF, DPO, SFT u otras etapas de alineamiento, ni la composición detallada del dataset. Tampoco se especifica la innovación técnica concreta más allá de la referencia al trabajo de Gao et al. (2025). La ejecución está registrada en Weights & Biases bajo el proyecto `scd_scaling` (run `34iv9wbk`), lo que sugiere que forma parte de una campaña de barrido de hiperparámetros o de escalado.

## Capacidades

- Generación de texto autoregresiva a nivel de token sobre el vocabulario SimpleStories (4096 entradas).
- Modelado de lenguaje de dominio restringido: al haberse entrenado sobre `simplestories-tokenized`, su distribución de salida está fuertemente sesgada hacia ese corpus.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; los idiomas soportados figuran como no disponibles.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta decodificación especulativa ni optimizaciones de inferencia específicas.

## Casos de uso

- Reproducción de experimentos de escalado: el modelo sirve como punto de control de baja escala (20M tokens, 2 capas) dentro de la campaña `scd_scaling` para comparar curvas de pérdida frente a variantes mayores como `scaling1_dcp_d1024_L2_t1000000000_s0`.
- Validación de pipelines de entrenamiento: al ser una ejecución de "humo", permite verificar que el código de entrenamiento, el cargador de datos y el registro en W&B funcionan antes de lanzar ejecuciones costosas.
- Estudio de dispersión en pesos: aunque este checkpoint es denso, sirve como referencia de control frente a variantes con `Weight Sparsity: True` bajo el mismo procedimiento de Gao et al. (2025).
- Pruebas unitarias de infraestructura de inferencia: su tamaño mínimo permite cargarlo en cualquier máquina para validar scripts de carga de `state_dict`, tokenización y generación.
- Investigación sobre tokenizadores de vocabulario reducido: con 4096 tokens y el tokenizador SimpleStories, es útil para analizar el efecto del tamaño de vocabulario en modelos pequeños.
- Docencia y demostraciones de arquitecturas transformer: la configuración de 2 capas y dimensión 64 hace visible el funcionamiento interno sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño del repositorio (0.0 GB) y la configuración (2 capas, dim. 64, vocab 4096); el cálculo exacto no está disponible.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no se requiere A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en CPU.
- Opciones de despliegue: la model card solo documenta carga mediante `torch.load` del `pytorch_model.bin` y requiere la clase `SparseGPT` del repositorio del autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `dense_smoke_dense_d64_L2_t20000000_s0` (este) | 2 capas, dim. 64, vocab 4096 | 512 | no disponible | Hugging Face, 0 descargas | Densos, 20M tokens |
| `asher577/scaling1_dcp_d1024_L2_t1000000000_s0` | 2 capas, dim. 1024 | no disponible | no disponible | Hugging Face | Misma familia, 1.000M tokens |
| `asher577/scaling1_dcp_d2048_L2_t1000000000_s0` | 2 capas, dim. 2048 | no disponible | no disponible | Hugging Face | Misma familia, 1.000M tokens |

Las tres variantes pertenecen al mismo autor y procedimiento (Gao et al., 2025); las dos de mayor dimensión se entrenaron con 1.000 millones de tokens frente a los 20 millones de este checkpoint, por lo que la comparación de rendimiento no es directa. No se dispone de benchmarks publicados para ninguna de ellas.

## Limitaciones y advertencias

- Modelo de investigación de escala mínima: 2 capas y dimensión 64 no permiten un rendimiento útil en tareas de lenguaje reales.
- Entrenado únicamente con 20 millones de tokens de `simplestories-tokenized`, lo que limita su distribución a ese dominio y produce un fuerte sesgo hacia el estilo de SimpleStories.
- Ventana de contexto de 512 tokens, insuficiente para la mayoría de aplicaciones prácticas.
- Vocabulario de 4096 tokens, muy reducido, lo que degrada la cobertura léxica fuera del corpus de entrenamiento.
- Riesgo elevado de alucinación y de generación incoherente fuera de la distribución de entrenamiento.
- Licencia no disponible: no se puede asumir permiso para uso comercial sin consultar al autor.
- Idiomas soportados no disponibles; no hay evidencia de capacidad multilingüe.
- La carga requiere la clase `SparseGPT` del repositorio del autor, no incluida en la model card; la integración con frameworks estándar no está documentada.
- No apto para producción: sin benchmarks, sin evaluación de sesgos y con 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/dense_smoke_dense_d64_L2_t20000000_s0
- Ejecución de W&B: https://wandb.ai/asher577/scd_scaling/runs/34iv9wbk
- Variante hermana `scaling1_dcp_d1024_L2_t1000000000_s0`: https://huggingface.co/asher577/scaling1_dcp_d1024_L2_t1000000000_s0
- Variante hermana `scaling1_dcp_d2048_L2_t1000000000_s0`: https://huggingface.co/asher577/scaling1_dcp_d2048_L2_t1000000000_s0
- Dataset `jacobcd52/simplestories-tokenized`: https://huggingface.co/datasets/jacobcd52/simplestories-tokenized
- Tokenizador `SimpleStories/SimpleStories-1.25M`: https://huggingface.co/SimpleStories/SimpleStories-1.25M
