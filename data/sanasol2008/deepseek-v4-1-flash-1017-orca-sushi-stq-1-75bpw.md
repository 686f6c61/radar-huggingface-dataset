# sanasol2008/DeepSeek-V4.1-Flash-1017-Orca-Sushi-STQ-1.75bpw

## Resumen

DeepSeek-V4.1-Flash-1017-Orca-Sushi-STQ-1.75bpw es una conversión experimental del checkpoint abliterado OrcaRouter de DeepSeek-V4.1-Flash-1017 a formato Sushi nativo, publicada por el usuario sanasol2008. No es un modelo entrenado desde cero ni un ajuste fino: es una recodificación de pesos ya cuantizados (GGUF Mix-256G) a un esquema de trellis PAIR1-w16-v1 con un payload uniforme de 1,75 bits por peso en los expertos enrutados. El modelo base es un transformer de mezcla de expertos (MoE) de DeepSeek, con 260.058.263.664 parámetros totales según los safetensors del repositorio.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de conversión de formato agresiva sobre un modelo de gran tamaño (428,5 GB de repositorio), útil para quien investigue técnicas de compresión extrema y codecs tipo trellis. Por otro, es un ejemplo de artefacto con procedencia encadenada (donante GGUF, config nativa, codec público) y con advertencias explícitas del propio autor sobre pérdida de calidad acumulada. El autor declara que la calidad completa no está establecida y que la única comparación publicada por un usuario usa max_tokens distintos entre modelos, por lo que no es concluyente.

El modelo se distribuye con licencia MIT, soporta inglés y ruso según los metadatos, y está etiquetado como experimental. La ventana de contexto, el número de parámetros activos y los detalles de entrenamiento originales no se especifican en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), según tags del repositorio; detalles de capas y atención no disponibles |
| Parametros totales | 260.058.263.664 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trellis PAIR1-w16-v1 uniforme n28 (1,75 bpw de payload en expertos enrutados); SPEC1-w15 K4 (n64) en el tronco calibrado; F32 en tronco denso restante, embeddings y cabeza; BF16 en visión y aligner; E4M3FN/E8M0 en tablas Engram |
| Idiomas soportados | en, ru |
| Licencia | MIT (sujeta a los términos del donante y del modelo upstream) |
| Formato de pesos | safetensors (formato Sushi nativo, derivado de GGUF) |

## Arquitectura y entrenamiento

El modelo es una conversión Sushi-nativa del GGUF abliterado OrcaRouter Mix-256G de DeepSeek-V4.1-Flash-1017, incluyendo sus expertos enrutados editados. La conversión densa tiene como objetivo los tensores desquantizados reales del donante, no los pesos del checkpoint oficial original. Esto implica que el proceso no es una conversión directa de BF16 a Sushi y no puede recuperar la información perdida en el GGUF donante. Los pesos originales de los expertos Sushi oficiales no se reutilizan y no se sustituye ninguna edición rank-one inferida por los pesos reales del donante.

La representación de pesos es heterogénea. Cada proyección de los expertos enrutados se recodifica como PAIR1-w16-v1 con n28 uniforme (28/16 = 1,75 bpw de payload) y escalas de entrada/salida en F16. La calibración de expertos usa importancia diagonal sobre entradas nativas del donante, normalización por capa común para retener información de frecuencia de enrutamiento, rotación H128 y LDLQ por bloques. Cuatro expertos no visitados (L21/E207, L24/E350, L25/E85, L27/E260; cuatro expertos y doce proyecciones) usan un fallback explícito de importancia identidad en n28 y están marcados como no calibrados. El tronco calibrado contiene 337 bancos SPEC1-w15 K4 (n64) recodificados con diagonales del donante, y la atención agrupada `wo_a` usa ocho diagonales independientes de coordenadas de entrada. Los 464 tensores densos restantes se retienen como F32 desquantizado del donante, incluyendo routers, normas, tensores de hiperconexión, lineales sin rejilla soportada o sin calibración, y factores de puerta Engram compatibles.

Las tablas de búsqueda Engram se obtienen por desquantización acotada de filas IQ4_NL del donante y recuantización posterior a E4M3FN/E8M0, con una escala por cada 32 columnas; el autor advierte que es una operación con pérdida y no una recuperación de las tablas FP8 originales. DSpark/MTP se omite por ausencia en el donante. Los factores Engram q/k originales están fusionados en un producto F32 no invertible; el candidato almacena `q` como el producto F32 del donante y `k` como unos en F32, representación derivada compatible que Sushi consume multiplicando ambos factores. El candidato inicial usa trellises en orden de paquete (pack-order); el comando público `sushi repack` puede convertirlo a layout pair-major con verificación de bytes inversa. El autor no afirma reproducir el encoder calibrado privado de Sushi ni paridad de bytes con esa receta, y señala que la calibración usa importancia diagonal, no covarianza de activaciones completa.

## Capacidades

- Generación de texto en inglés y ruso, según los metadatos de idioma del repositorio.
- Razonamiento y conversación multi-turno heredados del modelo base DeepSeek-V4.1-Flash-1017, aunque la calidad tras la conversión no está establecida.
- Procesamiento de visión: el repositorio incluye pesos de visión y aligner almacenados en BF16 para el loader estricto de Sushi.
- Soporte de plantilla de chat: se retiene la plantilla embebida del donante, no se sustituye por la plantilla base nativa.
- Capacidades de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Investigación en compresión extrema de modelos: el artefacto sirve para estudiar el impacto de recodificar expertos enrutados a 1,75 bpw de payload sobre un MoE de 260.000 millones de parámetros, comparando la pérdida acumulada frente al donante GGUF original.
- Evaluación de codecs trellis en producción experimental: equipos que trabajen con el codec Sushi pueden usar este repositorio como caso de prueba de las rutas PAIR1-w16-v1 y SPEC1-w15 K4, incluyendo la conversión `sushi repack` a pair-major con verificación inversa de bytes.
- Pruebas de compatibilidad de loader: el repositorio permite validar el cargador estricto de Sushi con pesos heterogéneos (F32, BF16, E4M3FN/E8M0) y con la representación derivada de factores Engram q/k.
- Despliegue en macOS con hardware limitado: el autor documenta un smoke test técnico en macOS tras repack local, útil para verificar que el artefacto carga y ejecuta inferencia básica en entornos de memoria restringida, sin garantía de calidad.
- Estudio de procedencia y trazabilidad de artefactos: los manifiestos de conversión fijan revisión del donante, hashes del código del encoder, política de tasa y calibración, hashes por ítem y procedencia de rangos de bytes de calibración, lo que sirve como modelo de auditoría para pipelines de conversión.
- Experimentación con modelos abliterados: al derivar de un checkpoint abliterado, permite estudiar el comportamiento de modelos sin rechazo en tareas de generación controlada, siempre con las salvaguardas y advertencias éticas correspondientes.
- Docencia y divulgación técnica: como ejemplo didáctico de cadena de custodia entre checkpoint oficial, GGUF donante y recodificación Sushi, con advertencias explícitas sobre qué afirmaciones no se pueden hacer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la evaluación completa de calidad no está establecida y que la comparación más reciente ejecutada por un usuario usa Orca con max_tokens 512 frente a 256 para los otros modelos, por lo que no es una comparación válida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma medida. El repositorio ocupa 428,5 GB; el autor advierte que el tamaño final del artefacto y la memoria en tiempo de ejecución deben reportarse por separado, ya que el 1,75 bpw describe solo el payload de los expertos enrutados y no los bits medios por peso del paquete completo.
- GPU recomendadas: no disponible en la información proporcionada. Por el tamaño del repositorio, un despliegue completo excede la memoria de cualquier GPU de consumo individual.
- ¿Cabe en GPU de consumo? No de forma completa con los datos disponibles; el autor solo documenta un smoke test técnico en macOS, no un despliegue funcional en GPU de consumo.
- Opciones de despliegue: el modelo usa la librería Sushi y el comando público `sushi repack`; no se mencionan vLLM, llama.cpp, Ollama ni TGI como soportados para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Orca-Sushi-STQ-1.75bpw | 260.058.263.664 | no disponible | MIT | Sushi safetensors | Conversión experimental con pérdida acumulada; calidad no establecida |
| orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF | no disponible | no disponible | no disponible | GGUF (Mix-256G) | Donante directo del que deriva este artefacto |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 | no disponible | no disponible | no disponible | no disponible | Checkpoint oficial upstream; fuente de config y tokenizer |

No se dispone de datos de benchmarks ni de parámetros activos de los modelos comparables en la información proporcionada, por lo que no es posible una comparación de rendimiento cuantitativa.

## Limitaciones y advertencias

- Pérdida de calidad acumulada: el donante ya estaba cuantizado y la recodificación introduce pérdida adicional; no se puede recuperar información perdida en el GGUF de origen.
- Calidad no establecida: el autor declara explícitamente que la evaluación completa de calidad no está hecha y que los tests locales de código, paridad CPU/CUDA y pilotos de proyección no demuestran calidad de modelo completo.
- Expertos no calibrados: cuatro expertos (L21/E207, L24/E350, L25/E85, L27/E260) usan un fallback de importancia identidad y están marcados como no calibrados, no como estadísticas medidas.
- Tablas Engram con pérdida: la recuantización IQ4_NL a E4M3FN/E8M0 es lossy y no recupera las tablas FP8 originales.
- Representación Engram derivada: los factores q/k se almacenan como producto F32 y unos, no como los factores originales; es una representación compatible, no una reconstrucción.
- Sin paridad con el encoder privado de Sushi: el converter usa codebooks y empaquetado públicos con búsqueda en float32 y redondeo explícito de escalas F16; no reproduce la receta calibrada privada.
- Calibración aproximada: usa importancia diagonal, no covarianza de activaciones completa; la tasa uniforme n28 no implica una asignación óptima medida.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al derivar de un modelo abliterado, pueden aparecer respuestas sin rechazo en dominios sensibles.
- Idiomas limitados: solo inglés y ruso según los metadatos; el rendimiento en castellano no está garantizado.
- Licencia: MIT en los metadatos, pero sujeta a los términos del donante y del modelo upstream; verificar antes de uso comercial.
- Formato y despliegue restringidos: requiere la librería Sushi; el candidato publicado está en pack-order y el despliegue verificado en Mac requirió repack local con validación inversa y evidencia SHA posterior.
- Artefacto experimental: etiquetado como experimental y con una sola descarga relevante (384 descargas, 1 like) en el momento de la consulta; no apto para producción sin evaluación propia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sanasol2008/DeepSeek-V4.1-Flash-1017-Orca-Sushi-STQ-1.75bpw
- Donante GGUF: https://huggingface.co/orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF (revisión `83144a667924660c6ba0095585fd039d8daa9b91`)
- Checkpoint oficial upstream: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017 (revisión `08c8657f02291e11b6f6b63e0e16014f8e748518`)
- Código y referencia de consumidor Sushi: `beamivalice/sushi` en `d5e876edcb1538a347041b1b7cc28a0e6e8f0af6`
- Referencia de conversión GGUF y mapeo Engram: llama.cpp PR30817, head `b72050d03ae14bb3cb5138ecefab3f3f65157d31`
