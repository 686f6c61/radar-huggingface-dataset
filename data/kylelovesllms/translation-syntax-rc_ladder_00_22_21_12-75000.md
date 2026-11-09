# kylelovesllms/translation-syntax-rc_ladder_00_22_21_12-75000

## Resumen

`kylelovesllms/translation-syntax-rc_ladder_00_22_21_12-75000` es un repositorio de artefactos de entrenamiento publicado en Hugging Face por el usuario `kylelovesllms`, no un modelo unitario listo para producción. Contiene una copia de seguridad de todas las ejecuciones del experimento `exp_rc_ladder_train_00_22_21_12` del proyecto `tbd-syntax`, con veinte carpetas de ejecución que corresponden a variantes de un GPT-2 de tamaño reducido entrenado desde cero.

Las veinte ejecuciones se organizan en un diseño factorial de dos ejes: número de capas (4 o 6) y número de cabezas de atención (2 u 8), con una dimensión de modelo de 256 y cinco semillas distintas (s42 a s46) por cada combinación. El objetivo declarado es el estudio de sintaxis en un contexto de traducción inglés-japonés, según se deduce del nombre del dataset de entrenamiento asociado.

El repositorio ocupa 5,5 GB e incluye checkpoints en formato Hugging Face (config.json, model.safetensors y tokenizer), junto con run_config.json, métricas, evaluaciones y análisis por ejecución. No se publican pesos consolidados en un único modelo, ni model card con especificaciones de uso, ni licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT-2 (decoder-only), con variantes de 4 o 6 capas y 2 u 8 cabezas de atención |
| Parametros totales | No disponible de forma explícita; dimensión de modelo 256, 4-6 capas, 2-8 cabezas (tamaño muy reducido, del orden de millones de parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | No disponible; el dataset asociado se denomina english_zapanese_rc_ladder, lo que sugiere inglés y japonés |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato Hugging Face, con config.json y tokenizer) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT-2, con variantes definidas por el número de capas (4 o 6) y el número de cabezas de atención (2 u 8), manteniendo una dimensión de modelo de 256. Cada combinación se entrena con cinco semillas distintas (s42, s43, s44, s45 y s46), lo que da lugar a las veinte ejecuciones incluidas en el repositorio. Se trata, por tanto, de un experimento de ablación controlada más que de un modelo de propósito general.

Los datos de entrenamiento provienen del dataset `kylelovesllms/english_zapanese_rc_ladder_train_00_22_21_12-filled`, orientado a sintaxis y traducción inglés-japonés. El nombre del experimento (`rc_ladder`) sugiere una tarea de *relative clause ladder* o escalera de cláusulas relativas, típica en estudios de adquisición de sintaxis. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El repositorio no incluye el estado del optimizador (`resume/`), solo los checkpoints finales o intermedios por paso.

## Capacidades

- Generación de texto autoregresiva propia de un GPT-2 de tamaño reducido.
- Modelado de sintaxis en contextos de traducción inglés-japonés, según el dataset asociado.
- Evaluación controlada de efectos de profundidad (4 vs 6 capas) y anchura de atención (2 vs 8 cabezas) sobre el rendimiento.
- Reproducibilidad experimental mediante cinco semillas por configuración.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada a lo que el dataset de entrenamiento cubra (presumiblemente inglés y japonés); no hay evaluación publicada.

## Casos de uso

- Investigación en lingüística computacional: analizar cómo varía la adquisición de estructuras sintácticas (cláusulas relativas) al cambiar el número de capas y cabezas, usando las veinte ejecuciones como réplicas controladas.
- Reproducción de experimentos: reentrenar o comparar resultados con las métricas y configuraciones incluidas en cada carpeta de ejecución para validar hallazgos publicados.
- Estudio de variabilidad por semilla: cuantificar la varianza entre las semillas s42-s46 para una misma arquitectura y determinar la robustez de las conclusiones.
- Enseñanza de arquitecturas transformer: usar los checkpoints pequeños (4 capas, 256 de dimensión) como ejemplo didáctico de GPT-2 mínimo entrenado desde cero.
- Análisis de representaciones internas: extraer activaciones y atención de checkpoints concretos para estudiar cómo se codifica la sintaxis en modelos pequeños.
- Benchmark de pipelines de evaluación: emplear los archivos `evals/` y `metrics.csv` como referencia para probar herramientas de evaluación de modelos de traducción o sintaxis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye archivos `metrics.csv`, `evals/` y `analysis/` por ejecución, pero sus valores no se detallan en la información proporcionada, por lo que no se pueden presentar cifras verificables.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. Con dimensión 256 y 4-6 capas, cada checkpoint ocupa del orden de decenas de MB en fp32; el repositorio completo (5,5 GB) corresponde a las veinte ejecuciones más artefactos auxiliares.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es sobradamente suficiente; también es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos unos pocos GB de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` de Hugging Face directamente; llama.cpp u Ollama requerirían conversión a GGUF; vLLM y TGI son compatibles pero sobredimensionados para este tamaño.
- Latencia y throughput: no disponibles; por el tamaño del modelo se espera latencia de milisegundos en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este repositorio (GPT-2 4-6L, 256d) | Del orden de millones (no especificado) | No disponible | No disponible | Hugging Face (artefactos de entrenamiento) |
| GPT-2 small (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, ampliamente disponible |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | Hugging Face |
| Modelos de traducción EN-JA pequeños (p. ej., MarianMT) | ~70-80 M | ~512 tokens | Apache 2.0 / MIT según variante | Hugging Face |

La comparación es aproximada: este repositorio no es un modelo publicado con fines de uso general, sino un conjunto de artefactos experimentales, por lo que la comparación directa con modelos listos para producción no es equivalente.

## Limitaciones y advertencias

- No es un modelo unitario: el repositorio contiene veinte ejecuciones; el usuario debe seleccionar manualmente una carpeta de checkpoint concreta.
- Ausencia de licencia explícita: no se puede asumir uso comercial sin consultar al autor.
- Sin model card con especificaciones de uso, idiomas o contexto: cualquier despliegue requiere inspeccionar `config.json` y el tokenizer de cada checkpoint.
- Tamaño muy reducido: capacidad limitada para tareas de generación abierta; riesgo elevado de alucinación y de incoherencia fuera del dominio de entrenamiento.
- Entrenado desde cero sobre un dataset específico de sintaxis inglés-japonés: probable sobreajuste al dominio y escasa generalización.
- No incluye estado del optimizador (`resume/`), lo que dificulta reanudar el entrenamiento exactamente donde se dejó.
- Sin evaluación de sesgos publicada; se desconoce el comportamiento en dominios sensibles.
- Fecha de creación indicada como 2026-11-09, posterior a la fecha habitual de referencia; conviene verificar la integridad y procedencia de los artefactos antes de usarlos en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-rc_ladder_00_22_21_12-75000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/english_zapanese_rc_ladder_train_00_22_21_12-filled
- Repositorio del proyecto tbd-syntax (rama backup): https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-08-working-tree/src/training/exp_rc_ladder_train_00_22_21_12
