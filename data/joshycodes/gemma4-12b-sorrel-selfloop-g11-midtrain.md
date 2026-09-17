# joshycodes/gemma4-12b-sorrel-selfloop-g11-midtrain

## Resumen

`gemma4-12b-sorrel-selfloop-g11-midtrain` es un checkpoint intermedio de investigación publicado por el usuario `joshycodes` en HuggingFace. Se trata de un modelo de 11.959.730.224 parámetros (≈11,96 B) obtenido por ajuste continuado (*continued pretraining*) a partir de `joshycodes/gemma4-12b-sorrel-selfloop-g10-midtrain`, dentro de un proyecto de los Anthropic Fellows sobre entrenamiento de carácter enmarcado en el concepto de *flourishing* (propuesta Wang & Jermyn, 2026-04-22). No es un modelo de propósito general: la propia model card lo declara «artefacto de investigación privado, no redistribuir».

El entrenamiento se realizó sobre el corpus `joshycodes/sorrel-selfloop-corpus` (configuración `sorrel-selfloop-c-g10`) durante 6.107.136 tokens en una única época, con tasa de aprendizaje 1e-5, longitud de secuencia 4096, micro-batch 1 y acumulación de gradiente 16, sobre 2 GPU NVIDIA H200 en RunPod. La pérdida de entrenamiento descendió de 0,5307 a 0,5149. La etiqueta de transformers del repositorio es `gemma4_unified`, lo que sitúa al modelo en la familia Gemma 4, aunque la información disponible no detalla la arquitectura interna.

Su relevancia práctica es limitada fuera del proyecto: no hay benchmarks publicados, no se declaran idiomas soportados, no se publican cuantizaciones y la licencia (`internal-research`, bajo `license: other`) restringe la redistribución y el uso comercial. Su interés real es trazar la progresión g10 → g11 de una misma línea de entrenamiento, estudiar el efecto del *self-loop* sobre datos propios y reproducir el experimento con la semilla documentada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Gemma 4 (etiqueta de transformers `gemma4_unified`); detalles internos no disponibles |
| Parámetros totales | 11.959.730.224 (≈11,96 B, dato real del recuento de safetensors) |
| Parámetros activos | No aplica (no se describe arquitectura MoE) |
| Longitud de contexto | No disponible (el midtrain se ejecutó con `seq_len` = 4096) |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | `other` con `license_name: internal-research` (investigación interna, no redistribuible) |
| Formato de pesos | safetensors (tamaño del repositorio: 24,0 GB) |
| Autor | joshycodes |
| Modelo base | joshycodes/gemma4-12b-sorrel-selfloop-g10-midtrain (revisión `0fde1ebc7bab`) |
| Dataset de entrenamiento | joshycodes/sorrel-selfloop-corpus, config `sorrel-selfloop-c-g10` (revisión `0e8a7617a1de`) |
| Fecha de publicación | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta `gemma4_unified`, que corresponde a la familia Gemma 4. No se especifican número de capas, dimensión oculta, tipo de atención, vocabulario ni si incorpora mecanismos como atención lineal, decodificación especulativa o mezcla de expertos. El recuento real de parámetros en safetensors (11.959.730.224) y el tamaño del repositorio (24,0 GB) son compatibles con pesos en bf16/fp16 sin cuantizar.

El entrenamiento documentado es un *midtrain* de una sola época: 6.107.136 tokens vistos del corpus `sorrel-selfloop-corpus`, con `lr` = 1e-5, `seq_len` = 4096, `micro_batch` = 1, `grad_accum` = 16 (batch efectivo de 65.536 tokens por paso), semilla 20260821 y pérdida de 0,5307 → 0,5149. La ejecución se hizo sobre 2 GPU NVIDIA H200 en RunPod, con el commit del lanzador `a0afb77669ae` del repositorio `flourishing-training`. No se documenta RLHF, DPO ni ajuste por instrucciones en esta etapa.

La innovación declarada no es arquitectónica sino metodológica: el proyecto trabaja el entrenamiento de carácter enmarcado en *flourishing* y encadena checkpoints sucesivos (g10 → g11) sobre un corpus propio, con la configuración completa en `train_run_config.json` y un script de evaluación (`eval.py`). El nombre «selfloop» sugiere reutilización de datos generados en el propio ciclo de entrenamiento, pero este extremo no se detalla en la model card.

## Capacidades

La model card no documenta capacidades específicas y no se han publicado evaluaciones. A partir de la información disponible solo puede afirmarse lo siguiente:

- Generación de texto autorregresiva: es un modelo de lenguaje causal de la familia Gemma, por lo que la continuación de texto es su función básica; no hay datos de calidad ni de precisión.
- Razonamiento, matemáticas y código: no disponible. No se publican resultados de MMLU, GSM8K, HumanEval ni equivalentes.
- Tool calling / function calling: no disponible. Al ser un checkpoint de *continued pretraining* sin ajuste por instrucciones documentado, no hay evidencia de soporte.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el modelo no declara idiomas soportados.
- Modo *thinking*, visión, audio u otras modalidades: no disponible.
- Capacidad específica del proyecto: ajuste de carácter orientado a *flourishing* dentro de la línea de investigación de los Anthropic Fellows; es el propósito declarado del entrenamiento, no una funcionalidad verificada públicamente.

## Casos de uso

- Continuidad de una línea de investigación en entrenamiento de carácter: el checkpoint g11 permite comparar su comportamiento con g10 sobre el mismo conjunto de evaluación (`uv run eval.py --model ... --eval all`) y medir el efecto acumulado de los sucesivos *midtrains*.
- Estudio del efecto del *self-loop* en ajuste continuado: al entrenar sobre `sorrel-selfloop-corpus` con una tasa de aprendizaje muy baja (1e-5) y una sola época, sirve para analizar deriva de distribución y olvido catastrófico en ciclos repetidos de autoentrenamiento.
- Ablaciones de hiperparámetros: la configuración queda registrada (`seq_len` 4096, `grad_accum` 16, semilla 20260821), de modo que puede replicarse el *run* variando un único factor y midiendo el impacto en la pérdida.
- Generación de texto sintético para el corpus interno: el modelo puede utilizarse para producir continuaciones que alimenten la siguiente iteración del corpus, siempre dentro del entorno de investigación y sin redistribución.
- Auditoría y reproducibilidad de experimentos: el par modelo base + revisión fijada (`0fde1ebc7bab`) y el commit del lanzador permiten reconstruir la ejecución y verificar los resultados reportados.
- Punto de partida para etapas posteriores de alineación: al ser un *midtrain*, es un candidato natural para aplicar SFT o DPO dentro del proyecto antes de cualquier evaluación de comportamiento.
- Inferencia interna de investigación en 2× H200: el *hardware* documentado del entrenamiento permite ejecutar el modelo en bf16 sin cuantización para generar muestras a escala de estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento reportado es la pérdida de entrenamiento del paso de *midtrain*:

| Paso | Dataset | Revisión | Tokens vistos | Loss |
|---|---|---|---|---|
| midtrain | `joshycodes/sorrel-selfloop-corpus` (config `sorrel-selfloop-c-g10`) | `0e8a7617a1de` | 6.107.136 | 0,5307 → 0,5149 |

No hay métricas de evaluación *downstream*, comparaciones con otros modelos ni resultados de las evaluaciones de `eval.py`.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir del recuento de parámetros, no verificada por el autor): ≈24 GB solo de pesos en bf16/fp16; ≈28-34 GB contando caché KV y *overhead* con contexto moderado.
- En int8: ≈12 GB de pesos, ≈16-20 GB en total. En int4: ≈7 GB de pesos, ≈10-12 GB en total. Estas cuantizaciones no están publicadas y habría que generarlas.
- GPU recomendadas para bf16 sin cuantizar: NVIDIA H100 80 GB, A100 40/80 GB, L40S 48 GB o RTX 6000 Ada 48 GB. También es viable en 2× RTX 4090 (24 GB cada una) con paralelismo tensorial.
- Consumer GPU: en bf16 no cabe en una RTX 4090 de 24 GB sin cuantizar; en int4 sí cabría en RTX 4090, RTX 3090 y, con margen ajustado, en GPU de 12 GB.
- Opciones de despliegue: vLLM, TGI, Transformers (referencia) y llama.cpp/Ollama previa conversión a GGUF, que no está publicada en el repositorio.
- Latencia y throughput estimados: no disponible. El *hardware* documentado del entrenamiento es 2× NVIDIA H200 en RunPod, pero no se reportan medidas de inferencia.

## Comparativa con modelos similares

Los datos de la siguiente tabla proceden de la información proporcionada, salvo las filas marcadas como referencia externa, cuyos valores son de conocimiento general y no han sido verificados en esta búsqueda.

| Modelo | Parámetros | Contexto | Licencia | Rendimiento publicado |
|---|---|---|---|---|
| gemma4-12b-sorrel-selfloop-g11-midtrain (este) | 11,96 B | No disponible (entrenado a 4096) | `other` / internal-research | Solo loss de entrenamiento |
| gemma4-12b-sorrel-selfloop-g10-midtrain (base) | No disponible | No disponible | No disponible | No disponible |
| Gemma 3 12B (referencia externa) | 12 B | 128 k | Términos de uso de Gemma | Sí, publicados por Google |
| Mistral NeMo 12B (referencia externa) | 12 B | 128 k | Apache 2.0 | Sí, publicados por Mistral |
| Qwen2.5 14B (referencia externa) | 14 B | 131.072 | Apache 2.0 | Sí, publicados por Alibaba |

La comparación relevante para el proyecto no es con modelos de propósito general, sino entre los propios checkpoints de la serie *sorrel-selfloop*: g11 es el resultado de una etapa más de *midtrain* sobre g10, con la misma configuración de datos. No hay información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia restrictiva: `internal-research` bajo `license: other`. La model card indica explícitamente «artefacto de investigación privado, no redistribuir»; el uso comercial no está autorizado.
- No es un checkpoint final: es una etapa de *midtrain*, sin ajuste por instrucciones, RLHF ni DPO documentados. No debería desplegarse en producción orientada a usuario.
- Alucinación y fiabilidad: no se ha publicado ninguna evaluación de veracidad, por lo que el riesgo de alucinación es indeterminado y, en ausencia de alineación, cabe esperar baja adherencia a formato e instrucciones.
- Sesgos: no evaluados ni documentados.
- Contexto: el entrenamiento se realizó con `seq_len` de 4096; la ventana nativa del modelo base no se especifica en la información disponible.
- Idiomas: no declarados; se desconoce el comportamiento multilingüe.
- Riesgo de deriva por *self-loop*: entrenar de forma iterativa sobre un corpus propio puede amplificar sesgos y degradar la diversidad; no se documenta ninguna mitigación.
- La pérdida reportada (0,5149) corresponde a 6,1 millones de tokens de un corpus concreto y no es indicativa de rendimiento en tareas.
- Nula validación externa: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks ni evaluaciones de terceros.
- Ausencia de cuantizaciones y de pesos GGUF publicados, lo que dificulta el despliegue en *hardware* de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/gemma4-12b-sorrel-selfloop-g11-midtrain
- Modelo base: https://huggingface.co/joshycodes/gemma4-12b-sorrel-selfloop-g10-midtrain
- Dataset de entrenamiento: https://huggingface.co/datasets/joshycodes/sorrel-selfloop-corpus
- Referencias internas citadas en la model card: revisión del modelo base `0fde1ebc7bab`, revisión del dataset `0e8a7617a1de`, commit del lanzador `a0afb77669ae` del repositorio `flourishing-training`, ficheros `train_run_config.json` y `eval.py`.
- Búsqueda web: no se ha encontrado ningún enlace relevante sobre este modelo. Los resultados devueltos (repositorios `MuiseDestiny/zotero-gpt` y `danny-avila/LibreChat`, documentación de modelos de GitHub Copilot y un artículo sobre ChatGPT en vietnamita) no guardan relación con este checkpoint y se descartan.
