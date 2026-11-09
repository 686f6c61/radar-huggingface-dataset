# kylelovesllms/translation-syntax-rc_ladder_who_00_22_21_12_02_20-75000

## Resumen

`kylelovesllms/translation-syntax-rc_ladder_who_00_22_21_12_02_20-75000` es un artefacto de investigación publicado en Hugging Face por el usuario `kylelovesllms`, no un modelo de propósito general. Se trata de un conjunto de checkpoints de modelos GPT-2 de escala muy reducida (4 capas, 2 o 4 cabezas de atención, dimensión de 256), entrenados desde cero como parte de un experimento de sintaxis controlada denominado `exp_rc_ladder_relativizer_fix_train_00_22_21_12_02_20`, dentro del proyecto `tbd-syntax` alojado en GitHub.

El propósito del repositorio es servir de copia de seguridad ("backup") de todos los runs de entrenamiento generados en ese experimento: diez ejecuciones con semillas 42 a 46 y dos configuraciones de atención distintas (`4l2h256d` y `4l4h256d`). Cada carpeta de run contiene checkpoints en formato GPT-2 de Hugging Face, junto con el `run_config.json`, métricas y evaluaciones. El nombre del modelo alude a un experimento sobre cláusulas de relativo ("rc ladder", "relativizer") con pares inglés-japonés, lo que sugiere un estudio de adquisición o inducción de estructuras sintácticas en modelos pequeños.

No se trata, por tanto, de un modelo apto para producción ni para uso general: es material reproducible de un experimento académico de lingüística computacional. No hay información sobre licencia, idiomas declarados, pipeline ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT-2 (decoder-only) |
| Parametros totales | No disponible (configuraciones de 4 capas, 2 o 4 cabezas, dimensión 256; el recuento exacto no se indica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | No disponibles (el dataset asociado es inglés-japonés, según el nombre) |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato GPT-2 de Hugging Face: `config.json`, `model.safetensors`, tokenizer) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT-2, según se deduce de la nomenclatura de los runs (`gpt2-4l2h256d`, `gpt2-4l4h256d`): 4 capas, 2 o 4 cabezas de atención y dimensión de modelo 256. Se trata de configuraciones deliberadamente pequeñas, típicas de experimentos de inducción sintáctica donde se busca controlar la capacidad del modelo para aislar el efecto de los datos. Los checkpoints se publican en formato nativo de Hugging Face, e incluyen tokenizer propio.

El entrenamiento se realizó sobre el dataset `kylelovesllms/english_zapanese_rc_ladder_relativizer_fix_train_00_22_21_12_02_20-filled`, que por su nombre sugiere pares inglés-japonés organizados en una "escalera" de cláusulas de relativo. Se documentan diez runs completados (semillas 42 a 46 en dos configuraciones), lo que indica un diseño experimental con replicaciones. No se especifican el número de tokens, la composición exacta del dataset, ni si hubo RLHF, DPO o alguna innovación técnica adicional. El estado del optimizador (`resume/`) no se ha subido.

## Capacidades

- Generación de texto autoregresiva en el dominio restringido del corpus de entrenamiento (presumiblemente construcciones con cláusulas de relativo en inglés y japonés).
- Modelado de lenguaje a pequeña escala para análisis de estructuras sintácticas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al par inglés-japonés del dataset, sin evaluación publicada.
- No se documentan modos especiales (thinking, visión, audio).

## Casos de uso

- Reproducción de experimentos de lingüística computacional: los checkpoints permiten replicar el análisis de `exp_rc_ladder_relativizer_fix_train_00_22_21_12_02_20` y comparar el efecto de las semillas y de la configuración de atención (2 vs. 4 cabezas).
- Estudio de inducción de estructuras sintácticas: útil para investigar cómo modelos de 4 capas aprenden dependencias de cláusulas de relativo en un corpus controlado.
- Análisis de variabilidad entre semillas: los cinco runs por configuración permiten medir la estabilidad del aprendizaje y la varianza en métricas de evaluación.
- Docencia en cursos de NLP: modelo lo bastante pequeño para inspeccionar pesos y activaciones, y para ilustrar el pipeline de entrenamiento de un GPT-2 desde cero.
- Baseline en experimentos de traducción o transferencia sintáctica: sirve como referencia de baja capacidad frente a modelos preentrenados mayores.
- Auditoría de artefactos de investigación: el repositorio conserva `metrics.csv`, `evals/` y `analysis/`, lo que facilita la revisión metodológica del experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 4 capas y dimensión 256, el modelo cabe holgadamente en cualquier GPU consumer; el tamaño del repo (2,1 GB) incluye todos los checkpoints y artefactos, no un único modelo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; también es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier RTX o incluso en iGPU.
- Opciones de despliegue: `transformers` de Hugging Face (formato GPT-2 nativo), `llama.cpp`/`Ollama` solo si se convierte a GGUF (no documentado), `vLLM`/`TGI` no justificados por el tamaño.
- Latencia y throughput: no disponibles; por el tamaño, la latencia sería mínima en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (`gpt2-4l2h256d` / `gpt2-4l4h256d`) | No disponible (4 capas, dim. 256) | No disponible | No disponible | Hugging Face (repo de backup) |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Hugging Face |
| DistilGPT-2 | 82 M | 1.024 tokens | Apache 2.0 | Hugging Face |
| Modelos de inducción sintáctica tipo "toy transformers" | Variable (muy bajo) | Variable | Variable | Repositorios de investigación |

La comparación con GPT-2 small o DistilGPT-2 es solo orientativa: este artefacto es mucho más pequeño y está entrenado desde cero sobre un corpus sintáctico específico, no sobre texto general.

## Limitaciones y advertencias

- No es un modelo de propósito general: su corpus de entrenamiento es un dataset sintáctico controlado, no texto masivo.
- Riesgo elevado de alucinación y de generar texto incoherente fuera del dominio de entrenamiento.
- Sin licencia declarada: no se puede asumir uso comercial ni redistribución sin consultar al autor.
- Idiomas y contexto no documentados; no se debe asumir cobertura multilingüe amplia.
- Repositorio de backup: contiene múltiples checkpoints y artefactos, no un único modelo listo para producción.
- Sin benchmarks ni evaluaciones publicadas que permitan comparar su rendimiento con alternativas.
- Adecuado únicamente para investigación, docencia y reproducción experimental.

## Enlaces

- Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-rc_ladder_who_00_22_21_12_02_20-75000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/english_zapanese_rc_ladder_relativizer_fix_train_00_22_21_12_02_20-filled
- Repositorio GitHub del proyecto: https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-08-working-tree/src/training/exp_rc_ladder_relativizer_fix_train_00_22_21_12_02_20
