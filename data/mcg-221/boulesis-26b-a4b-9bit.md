# McG-221/Boulesis-26B-A4B-9bit

## Resumen

El modelo `McG-221/Boulesis-26B-A4B-9bit` es una conversión cuantizada a 9 bits, en formato MLX, del modelo base `SubMaroon/Boulesis-26B-A4B`. Según los metadatos, se trata de un modelo de generación de texto (`text-generation`) con soporte declarado para inglés, y la nomenclatura del nombre sugiere una arquitectura de mezcla de expertos (MoE) con 26.000 millones de parámetros totales y 4.000 millones activos. El repositorio está etiquetado con `gemma4`, lo que apunta a una variante de la familia Gemma 4, aunque no se confirma en la documentación.

La relevancia del modelo radica en su disponibilidad en formato MLX, pensado para ejecutarse en Apple Silicon, y en su cuantización a 9 bits, que reduce el espacio en disco a 20,8 GB. Sin embargo, la propia model card advierte de que la conversión no carga con las versiones estándar de `mlx-lm` o `mlx-vlm` sin parches, debido a dos peculiaridades del checkpoint. No se han publicado benchmarks ni documentación de rendimiento, y la licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag `gemma4` sugiere una variante de Gemma 4, sin confirmacion oficial) |
| Parametros totales | 26.000 millones segun la nomenclatura del nombre (no verificado) |
| Parametros activos | 4.000 millones segun la nomenclatura del nombre (no verificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 9-bit segun el nombre del modelo; el tag `8-bit` aparece en los metadatos |
| Idiomas soportados | ingles |
| Licencia | no disponible |
| Formato de pesos | safetensors (conversion MLX) |

## Arquitectura y entrenamiento

No se proporcionan detalles sobre la arquitectura ni el proceso de entrenamiento en la informacion disponible. Los metadatos indican que es una conversion MLX del modelo base `SubMaroon/Boulesis-26B-A4B`, y la nomenclatura `26B-A4B` es consistente con un modelo de mezcla de expertos (MoE), aunque no hay confirmacion explicita.

La model card incluye una advertencia tecnica importante: la conversion no carga con `mlx-lm` o `mlx-vlm` estandar. El motivo son dos peculiaridades del checkpoint:

1. El checkpoint incluye una capa de salida (`lm_head`) separada, mientras que el archivo de configuracion afirma que los pesos estan compartidos con las embeddings. Los cargadores sin parchear no construyen un modulo para ese peso y abortan la carga.
2. Algunas capas de atencion utilizan dimensiones diferentes al resto del modelo, descritas en una seccion dispersa por capas del config. Los cargadores sin parchear ignoran esa seccion y construyen esas capas con la forma incorrecta, lo que provoca un fallo en la comprobacion de pesos.

No se ha publicado informacion sobre el dataset de entrenamiento, el numero de tokens ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, segun el pipeline `text-generation` y el idioma declarado.
- No se documentan capacidades especificas de razonamiento, codigo, matematicas, vision, audio ni tool calling.
- Al ser una conversion de un modelo base, se espera que herede las capacidades del modelo original, pero no se dispone de detalles al respecto.
- No hay informacion sobre soporte de agentes, multi-step reasoning ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Generacion de texto en local en macOS con Apple Silicon: el modelo esta en formato MLX y cuantizado, lo que permite su ejecucion en Mac con suficiente memoria unificada, siempre que se resuelvan los problemas de carga documentados.
- Investigacion en eficiencia de cuantizacion: la cuantizacion a 9 bits ofrece un caso de estudio para analizar el equilibrio entre tamano y calidad en modelos MoE.
- Prototipado de asistentes conversacionales en ingles: el pipeline de generacion de texto permite construir chatbots de prueba, aunque no hay datos de calidad que avalen su uso en produccion.
- Pruebas de compatibilidad de cargadores MLX: las peculiaridades del checkpoint (lm_head separado y capas de atencion con dimensiones dispares) lo convierten en un caso de prueba para desarrollar o validar parches en `mlx-lm` y `mlx-vlm`.
- Evaluacion de modelos MoE en hardware de Apple: el tamano de 26B-A4B y el formato MLX permiten estudiar el rendimiento de arquitecturas de mezcla de expertos en Mac.
- Analisis de pesos compartidos frente a separados: la discrepancia entre el config y los pesos reales puede interesar a investigadores que estudian el impacto de compartir embeddings en modelos grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 20,8 GB, lo que sugiere que la cuantizacion a 9 bits requiere aproximadamente ese espacio en disco.
- GPU recomendadas: no disponible. Al ser una conversion MLX, no esta orientada a CUDA; se espera que funcione en Apple Silicon.
- Capacidad en GPU de consumo: no disponible. No se han publicado datos de consumo en hardware de consumo.
- Opciones de despliegue: no disponible. La model card indica que no carga con `mlx-lm` ni `mlx-vlm` estandar, por lo que se requieren parches o cargadores personalizados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la informacion proporcionada. El modelo base es `SubMaroon/Boulesis-26B-A4B`, pero no se dispone de datos de comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- Problemas de carga con MLX estandar: la conversion no carga con `mlx-lm` o `mlx-vlm` sin parches, debido al `lm_head` separado y a las capas de atencion con dimensiones inconsistentes.
- Licencia no especificada: al no haber una licencia explicita, no se puede garantizar el uso comercial ni la redistribucion del modelo.
- Sin benchmarks ni documentacion de rendimiento: no se han publicado resultados que permitan evaluar su calidad ni compararlo con otros modelos.
- Idioma limitado: solo se declara soporte para ingles.
- Sin informacion sobre sesgos o alucinaciones: al no existir documentacion, no se conocen riesgos especificos de comportamiento.
- Ausencia de validacion por la comunidad: el modelo registra cero descargas, lo que incrementa la probabilidad de errores no detectados y reduce su fiabilidad para produccion.

## Enlaces

- HuggingFace: https://huggingface.co/McG-221/Boulesis-26B-A4B-9bit
