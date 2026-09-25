# agnosticeng/Qwen3.8-Flash-Next-4bit

## Resumen

Qwen3.8-Flash-Next-4bit es una conversión a 4 bits del modelo base Qwen/Qwen3.8-Flash-Next, publicada por el usuario agnosticeng. No se trata de un modelo entrenado desde cero, sino de una compilación cuantizada del original en bf16 (aproximadamente 360 GB), empaquetada en formato afín de MLX (pesos `u32` empaquetados y pares escala/sesgo en `bf16` por grupo de 32 pesos). El repositorio pesa 112,3 GB e incluye el tronco repartido en 17 shards de ~4,9 GB cada uno, una cabecera de predicción multi-token (`mtp/model.safetensors`) y una tabla n-gram fusionada (`ngram.safetensors`).

El modelo base pertenece a la familia Qwen y declara la arquitectura `qwen4_exp`, con etiqueta `moe` (mezcla de expertos) y 128.350.804.643 parámetros totales contabilizados en los safetensors. La conversión solo cubre la torre de texto: el `config.json` indica `language_model_only`, de modo que cualquier otra torre del modelo original queda fuera de este checkpoint.

Su relevancia es fundamentalmente práctica: permite ejecutar un modelo MoE de ~128 B de parámetros en hardware Apple Silicon mediante MLX, algo inviable con el original en bf16. Está pensado para el runtime `lisa` (lisa-ml.com), cuyos kernels de decodificación Flash-Next fijan el tamaño de grupo en 32, lo que convierte ese valor en un requisito duro del checkpoint. El repositorio no registra descargas ni likes y no acompaña resultados de evaluación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` (transformer con mezcla de expertos, etiqueta `moe`); incluye capas conv1d segun las transformaciones de conversion |
| Parametros totales | 128.350.804.643 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Afín 4-bit (MLX `mx.quantize`), grupo de 32, un par escala/sesgo en `bf16` por grupo; sin variantes GGUF ni de otro bit-width en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license (`license: other`, con `LICENSE` en el repositorio) |
| Formato de pesos | safetensors (MLX, pesos `u32` empaquetados + escalas/sesgos `bf16`), 17 shards de ~4,9 GB; incluye `mtp/model.safetensors` y `ngram.safetensors` |

## Arquitectura y entrenamiento

El checkpoint es una cuantización, no un entrenamiento. La información disponible indica que se generó a partir del original público en bf16 con el script `convert_qwen38_flash_next.py --gs 32`, en un proceso por streaming que descarga, cuantiza y elimina cada shard del checkpoint de ~360 GB. La conversión renombra y transforma los pesos: prefijo `language_model.model.*`, reempaquetado del `switch_mlp` de la mezcla de expertos, transposición de convoluciones 1D de `[C,1,K]` a `[C,K,1]` y plegado del `+1` de las RMSNorm. Estos detalles confirman que el modelo original emplea MoE y capas convolucionales 1D, pero no se publica el número de expertos, los parámetros activos por token ni la configuración de atención.

La cuantización es afín de 4 bits con tamaño de grupo 32, lo que implica un par escala/sesgo en bf16 compartido por cada 32 pesos a lo largo de la dimensión de entrada. El autor señala explícitamente que el grupo 32 es obligatorio porque los kernels fundidos de decodificación Flash-Next de `lisa` codifican `GS=32` de forma fija; grupos menores reducirían el error de cuantización a costa de más metadatos, pero no serían cargables por ese runtime. El repositorio incorpora además una cabecera de predicción multi-token (MTP), típicamente asociada a decodificación especulativa, y una tabla n-gram fusionada cuantizada en 4-bit gs32. No hay información pública sobre el dataset de entrenamiento del modelo base, el número de tokens, ni sobre fases de RLHF o DPO.

## Capacidades

- Generación de texto y uso conversacional: la metadata del repositorio declara los tags `text-generation` y `conversational`.
- Razonamiento multi-paso con decodificación especulativa: la presencia de `mtp/model.safetensors` (cabecera de predicción multi-token) y de `ngram.safetensors` apunta a ese tipo de decodificación, aunque el autor no documenta cómo activarlas.
- Capacidad MoE: la etiqueta `moe` y el reempaquetado de `switch_mlp` indican enrutado por expertos, lo que implica que solo una fracción de los 128,35 B de parámetros se activa por token (proporción no publicada).
- Ejecución local en Apple Silicon mediante MLX.
- No se documentan capacidades de tool calling, function calling ni de uso como agente.
- No se documentan capacidades de visión, audio ni otras modalidades; el config marca `language_model_only`.
- Cobertura multilingüe: no disponible.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Inferencia local en estaciones de trabajo Apple Silicon: es el escenario para el que se construyó el checkpoint, ya que el formato afín de MLX y el grupo 32 están adaptados a los kernels de `lisa`. Un Mac Studio con memoria unificada alta puede alojar los ~80 GB de pesos cuantizados y su metadata.
- Asistentes conversacionales de escritorio con datos sensibles: al ejecutarse sin conexión, permite desplegar un chat sobre corpus internos sin enviar texto a APIs externas, siempre que se valide antes el comportamiento y los idiomas soportados, que no están documentados.
- Investigación sobre decodificación especulativa: la cabecera MTP y la tabla n-gram incluidas permiten experimentar con decodificación multi-token y comparar su efecto en latencia frente a la decodificación autorregresiva estándar.
- Estudio de cuantización y error numérico: al publicarse el script de conversión y el tamaño de grupo, sirve como caso de estudio reproducible sobre cómo afecta la cuantización afín 4-bit gs32 a un MoE de ~128 B.
- Generación de documentación y resúmenes en lotes nocturnos: un pipeline offline que procese grandes volúmenes de texto en una máquina con memoria unificada suficiente, aprovechando el coste marginal cero por token frente a APIs de pago.
- Base para ajuste fino con LoRA/QLoRA: aunque el autor no documenta recetas, el formato safetensors de MLX permite cargar los pesos cuantizados como punto de partida para adaptaciones de dominio.
- Evaluación comparativa de arquitecturas MoE: útil para equipos que necesiten medir consumo de memoria y comportamiento de enrutado de un MoE de gran tamaño en hardware no-CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y tampoco se documentan medidas de latencia o throughput. La búsqueda web realizada no devolvió resultados técnicos relevantes: los enlaces recuperados fueron páginas de contenido para adultos sin relación con el modelo, por lo que no se ha podido contrastar ningún dato adicional.

## Requisitos de hardware

- Pesos cuantizados: 128.350.804.643 parámetros × 4 bits = aproximadamente 64,2 GB solo de pesos empaquetados.
- Metadatos de cuantización: con escala y sesgo en bf16 por cada 32 pesos, se añaden unos 0,125 bytes por parámetro, es decir, aproximadamente 16 GB adicionales.
- Total estimado para el tronco: en torno a 80 GB, más la cabecera MTP y la tabla n-gram, que elevan el repositorio completo a 112,3 GB (17 shards de ~4,9 GB suman ~83 GB; el resto corresponde a `mtp/`, `ngram.safetensors` y el tokenizador).
- Cabe en GPU de consumo: no. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) quedan muy lejos incluso con cuantizaciones más agresivas, y el formato del checkpoint es específico de MLX.
- Apple Silicon: es la vía realista. Un M3 Ultra o M2 Ultra con 192 GB de memoria unificada es la configuración cómoda; una máquina con 96 GB queda al límite dado el consumo conjunto de pesos, metadata y caché KV. Las cifras son estimaciones derivadas del tamaño de los pesos, no medidas publicadas.
- Opciones de despliegue: MLX (`mlx-lm`) y el runtime `lisa` (lisa-ml.com), que es el que el autor referencia. El repositorio no incluye pesos GGUF, por lo que no hay ruta directa a llama.cpp ni a Ollama, y tampoco se documenta soporte en vLLM ni TGI.
- Restricción de carga: cualquier runtime debe respetar el tamaño de grupo 32 del checkpoint, impuesto por los kernels Flash-Next de `lisa`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos públicos de rendimiento del modelo base ni de esta cuantización, por lo que la comparación se limita a aspectos de formato y despliegue.

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agnosticeng/Qwen3.8-Flash-Next-4bit | 128,35 B (MoE) | no disponible | safetensors MLX afín 4-bit gs32 | qwen-community-license | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-Flash-Next | no disponible (checkpoint bf16 de ~360 GB) | no disponible | safetensors bf16 | qwen-community-license | HuggingFace |
| Alternativas equivalantes verificadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información verificada sobre otros modelos comparables de la misma categoría (MoE de ~128 B cuantizados a 4 bits para MLX), por lo que no se ofrece una comparación de rendimiento.

## Limitaciones y advertencias

- Riesgo de alucinación: inherente a cualquier modelo generativo; no se han publicado evaluaciones de fidelidad factual para esta cuantización ni para el modelo base.
- Sesgos: no disponibles. No hay documentación sobre composición del dataset de entrenamiento ni sobre mitigaciones aplicadas.
- Idiomas: el campo de idiomas no está informado en la ficha de HuggingFace, por lo que no puede asumirse cobertura multilingüe ni un comportamiento fiable fuera del idioma mayoritario del entrenamiento.
- Ventana de contexto: no documentada. Diseñar aplicaciones que dependan de contexto largo es arriesgado sin verificarlo.
- Licencia: `qwen-community-license` está clasificada como `other`, no como una licencia de código abierto aprobada por la OSI. Antes de un uso comercial hay que revisar el archivo `LICENSE` del repositorio y las condiciones de la comunidad Qwen, que pueden incluir restricciones de uso y obligaciones de atribución.
- Conversión de terceros: la cuantización la firma `agnosticeng`, no el equipo de Qwen. No hay validación oficial de que el modelo cuantizado preserve las capacidades del original, ni resultados de evaluación que lo respalden.
- Solo torre de texto: el `config.json` declara `language_model_only`; si el modelo base incorpora otras torres, este checkpoint no las incluye.
- Dependencia fuerte del runtime: el grupo 32 está fijado por los kernels de `lisa` y el autor advierte que debe respetarse al cargar. Cargar el checkpoint con otro runtime MLX puede fallar o degradar los resultados.
- Empaquetado no estándar: el reempaquetado de `switch_mlp`, la transposición de conv1d y el plegado de RMSNorm implican que los pesos no son intercambiables sin más con otras herramientas que espere el formato original.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validación de la comunidad.
- Consumo de memoria elevado: ~80 GB solo para el tronco, lo que excluye GPUs de consumo y limita el despliegue a hardware con memoria unificada grande.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/agnosticeng/Qwen3.8-Flash-Next-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia del repositorio: https://huggingface.co/agnosticeng/Qwen3.8-Flash-Next-4bit/blob/main/LICENSE
- Runtime `lisa` referenciado por el autor: https://lisa-ml.com/
- Nota sobre la búsqueda web: no se han encontrado papers, blogs, repositorios ni demos adicionales; los resultados recuperados no guardaban relación con el modelo.
