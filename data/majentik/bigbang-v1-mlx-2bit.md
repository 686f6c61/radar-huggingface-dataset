# majentik/BigBang-v1-MLX-2bit

## Resumen

BigBang-v1-MLX-2bit es una variante cuantizada en 2 bits (afín, tamaño de grupo 32) del modelo base endless-frontier/BigBang-v1, preparada específicamente para ejecutarse en silicio de Apple mediante la librería mlx-lm. El modelo base, identificado por el tag `qwen3_5_moe`, es un modelo multimodal (imagen-texto) con arquitectura de mezcla de expertos (MoE) y aproximadamente 4,78 mil millones de parámetros totales. Esta versión cuantizada mantiene la torre de visión y el proyector en BF16, mientras que la torre de texto se reduce a 2 bits, lo que permite una huella de memoria menor en equipos con memoria unificada limitada.

El modelo está publicado bajo licencia Apache-2.0, lo que facilita su uso comercial y su integración en aplicaciones de producción. La cuantización fue realizada con `mlx_lm.convert` (mlx-lm 0.31.3) y superó una prueba de coherencia determinista antes de su publicación. Es relevante porque ofrece una opción ligera para desplegar un modelo multimodal MoE en hardware de consumo de Apple, algo poco habitual en el ecosistema MLX, y porque forma parte de una familia de cuantizaciones que van desde 2 bits hasta 8 bits y MXFP4, permitiendo elegir el equilibrio entre calidad y uso de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Qwen3.5 (tag `qwen3_5_moe`), multimodal imagen-texto |
| Parametros totales | 4.783.452.016 (≈4,78 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits (afín, grupo 32) para la torre de texto; torre de visión y proyector en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base BigBang-v1 es un modelo multimodal que combina una torre de visión, un proyector y una torre de texto basada en una arquitectura de mezcla de expertos (MoE), según el tag `qwen3_5_moe`. La variante MLX-2bit cuantiza únicamente la torre de texto a 2 bits con esquema afín y tamaño de grupo 32, mientras que la torre de visión y el proyector se mantienen en BF16 para preservar la calidad de la comprensión visual. No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada. La cuantización se realizó con `mlx_lm.convert` de mlx-lm 0.31.3, y el paquete pasó una prueba de coherencia determinista (generación de 48 tokens con decodificación greedy) que verificó la ausencia de salidas vacías, bucles de repetición, galimatías multiescritura o residuos de tokens especiales.

## Capacidades

- Procesamiento multimodal: acepta entradas de imagen y texto, generando respuestas de texto (pipeline `image-text-to-text`).
- Generación de texto conversacional: puede mantener diálogos de varios turnos, aunque la longitud de contexto no está documentada.
- Razonamiento y conocimiento general: al estar basado en una arquitectura Qwen3.5, se espera que herede capacidades de razonamiento, aunque no se aportan datos concretos.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Modo de pensamiento (thinking mode): no disponible.

## Casos de uso

- Asistentes multimodales en Mac: el modelo puede integrarse en aplicaciones de escritorio que necesiten responder preguntas sobre imágenes locales, aprovechando la cuantización 2-bit para caber en equipos con 16 GB de RAM unificada.
- Análisis de documentos con imágenes: útil para extraer información de capturas de pantalla, diagramas o fotografías en entornos donde no se dispone de GPU dedicada.
- Prototipado rápido de aplicaciones de visión por computadora: permite validar ideas de clasificación o descripción de imágenes sin necesidad de un servidor con GPU.
- Educación y demostraciones técnicas: sirve como ejemplo de despliegue de un modelo MoE multimodal en hardware de consumo, mostrando el flujo de cuantización MLX.
- Automatización de tareas de soporte visual: por ejemplo, describir imágenes de error o capturas para generar tickets de incidencia.
- Investigación en cuantización multimodal: al estar disponible en varios niveles (2-8 bits y MXFP4), permite estudiar el impacto de la cuantización en la calidad de tareas conjuntas de visión y lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que el paquete superó una prueba de coherencia determinista (generación de 48 tokens sin artefactos), pero no se proporcionan métricas como MMLU, HumanEval o GSM8K para esta variante cuantizada ni para el modelo base.

## Requisitos de hardware

- Destinado exclusivamente a silicio de Apple (M1/M2/M3/M4) mediante la librería mlx-lm.
- El tamaño del repositorio es de 13,9 GB, lo que incluye la torre de texto cuantizada a 2 bits y la torre de visión/proyector en BF16. Se recomienda un mínimo de 16 GB de memoria unificada para cargar el modelo con margen.
- Para ejecución fluida, se recomienda un chip Apple Silicon con al menos 16 GB de RAM unificada (por ejemplo, M1 Pro, M2 Pro o superiores).
- Despliegue mediante `mlx_lm.generate` tras instalar `mlx-lm` (pip install mlx-lm).
- No se dispone de datos de latencia o throughput específicos para esta variante.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (MoE multimodal cuantizado para MLX) con datos de rendimiento o especificaciones que permitan una comparación rigurosa.

## Limitaciones y advertencias

- La cuantización a 2 bits puede degradar significativamente la calidad de generación de texto, especialmente en tareas de razonamiento complejo o generación de código. No se han publicado evaluaciones que cuantifiquen esta pérdida.
- La torre de visión se mantiene en BF16, pero la interacción entre la representación visual y el texto cuantizado puede introducir inconsistencias no evaluadas.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que limita la planificación de casos de uso multilingües o de contexto largo.
- No se ha verificado el comportamiento en producción más allá de una prueba de coherencia determinista; se recomienda realizar pruebas adicionales antes de un despliegue crítico.
- Aunque la licencia Apache-2.0 permite uso comercial, la procedencia del modelo base (endless-frontier/BigBang-v1) debe verificarse para confirmar que no existen restricciones adicionales en los datos de entrenamiento.
- Al ser una cuantización MLX, el modelo no es compatible con otros runtimes como llama.cpp, vLLM o TGI sin conversión previa.

## Enlaces

- [majentik/BigBang-v1-MLX-2bit en HuggingFace](https://huggingface.co/majentik/BigBang-v1-MLX-2bit)
- [Modelo base endless-frontier/BigBang-v1](https://huggingface.co/endless-frontier/BigBang-v1)
- [Repositorio mlx-lm](https://github.com/ml-explore/mlx-lm)
- Otros niveles de cuantización: [3bit](https://huggingface.co/majentik/BigBang-v1-MLX-3bit), [4bit](https://huggingface.co/majentik/BigBang-v1-MLX-4bit), [5bit](https://huggingface.co/majentik/BigBang-v1-MLX-5bit), [6bit](https://huggingface.co/majentik/BigBang-v1-MLX-6bit), [8bit](https://huggingface.co/majentik/BigBang-v1-MLX-8bit), [MXFP4](https://huggingface.co/majentik/BigBang-v1-MLX-MXFP4)
