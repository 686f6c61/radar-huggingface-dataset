# sanasol2008/DeepSeek-V4.1-Flash-1017-Orca-Sushi-STQ-1.75bpw-work

## Resumen

DeepSeek-V4.1-Flash-1017 Orca Sushi es una conversión experimental del checkpoint abliterado OrcaRouter Mix-256G, derivado a su vez de DeepSeek-V4.1-Flash-1017, a un formato nativo denominado Sushi con trellises de cuantización PAIR1. El autor, sanasol2008, publica este artefacto como un ROOT independiente con verificación de descarga y repack, pero sin una evaluación de calidad completa del modelo final. No es un modelo entrenado desde cero, sino una recodificación de pesos ya cuantizados (GGUF) a un esquema de compresión distinto, con escalas F16 y calibración por importancia diagonal.

El interés técnico reside en la representación de pesos: los expertos enrutados se codifican a 1,75 bits por peso de payload (n28, uniforme), mientras el tronco denso usa bancos SPEC1-w15 K4 y los tensores restantes se conservan en F32 procedentes del donante dequantizado. El modelo conserva la estructura MoE del DeepSeek original, con 260.058.263.664 parámetros totales según los safetensors publicados, y un tamaño de repositorio de 428,5 GB. Es relevante como caso de estudio de compresión extrema y de portabilidad entre formatos, no como un modelo listo para producción.

La model card advierte explícitamente de que la recodificación introduce pérdida adicional de cuantización, que los expertos sin visitar usan un fallback de identidad marcado como no calibrado y que las tablas Engram se recuantizan de forma lossy. La licencia declarada es MIT, sujeta a los términos del donante y del modelo upstream. El soporte de idiomas indicado es inglés y ruso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (deepseek_v41), conversión a formato Sushi |
| Parametros totales | 260.058.263.664 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Trellis PAIR1-w16-v1 n28 (1,75 bpw de payload en expertos enrutados), SPEC1-w15 K4 (n64) en tronco calibrado, F32 en tensores densos, BF16 en visión/aligner, E4M3FN/E8M0 en tablas Engram |
| Idiomas soportados | en, ru |
| Licencia | MIT (sujeta a licencia del donante y upstream) |
| Formato de pesos | safetensors (formato Sushi nativo) |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento. La arquitectura subyacente es la del DeepSeek-V4.1-Flash-1017 original, un transformer con mezcla de expertos (MoE), cuyos pesos llegan aquí a través del checkpoint abliterado OrcaRouter Mix-256G en GGUF. El conversor recodifica cada proyección de los expertos enrutados con el esquema PAIR1-w16-v1, usando trellises uniformes n28 (28/16 = 1,75 bits de payload por peso) con escalas de entrada y salida en F16. La calibración emplea importancia diagonal sobre las entradas nativas del donante, normalización por capa común para retener información de frecuencia de enrutamiento, rotación H128 y LDLQ por bloques.

El tronco calibrado se recodifica en 337 bancos SPEC1-w15 K4 (n64) usando diagonales del donante, y la atención agrupada `wo_a` usa ocho diagonales independientes de coordenadas de entrada. Los 464 tensores densos restantes (routers, normas, tensores de hiperconexión, lineales sin rejilla soportada o sin calibración, y factores de puerta Engram compatibles) se conservan como F32 procedentes de la dequantización del donante. La embedding y la cabeza de salida también son F32 dequantizados. La visión y el aligner se almacenan en BF16 para el loader estricto de Sushi, con vectores de norma, sesgo e imagen en F32. Las tablas Engram se dequantizan desde filas IQ4_NL y se recuantizan a E4M3FN/E8M0 con una escala por cada 32 columnas, un proceso declarado lossy. No se incluye DSpark/MTP porque el donante no lo contiene.

Cuatro expertos sin visitar (L21/E207, L24/E350, L25/E85, L27/E260, doce proyecciones en total) usan un fallback explícito de importancia identidad en n28 y están marcados como no calibrados. El candidato inicial usa trellises en orden de pack; la herramienta pública `sushi repack` puede convertirlo a layout pair-major con verificación de bytes inversa. El autor no reclama paridad de bytes con el encoder calibrado privado de Sushi ni una asignación óptima de tasas mixtas.

## Capacidades

- Generación de texto en inglés y ruso, heredada del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento y conversación multi-turno, conservando la plantilla de chat embebida del donante.
- Capacidades de visión, dado que el artefacto incluye pesos de visión y aligner almacenados en BF16.
- Soporte de mezcla de expertos con enrutamiento aprendido, aunque los routers se conservan en F32 del donante.
- Tool calling y function calling: no confirmado en la información disponible para esta conversión.
- Modo thinking o razonamiento extendido: no confirmado en la información disponible.
- Capacidades de audio: no disponibles.
- El modelo está marcado como experimental y su calidad completa no está establecida.

## Casos de uso

- Investigación en compresión de modelos: sirve para estudiar el impacto de recodificar un MoE de 260B parámetros a 1,75 bpw de payload en expertos, comparando perplejidad y calidad frente al donante GGUF original.
- Evaluación de portabilidad entre formatos: permite probar el codec Sushi y la herramienta `sushi repack` sobre un artefacto real de gran tamaño, verificando paridad de bytes y comportamiento del loader estricto.
- Pruebas de despliegue en macOS: el autor verificó un smoke técnico limitado en Mac tras repack local, por lo que el modelo sirve como banco de pruebas de inferencia en hardware Apple con el consumidor de referencia de Sushi.
- Estudio de calibración de expertos: los cuatro expertos con fallback de identidad y los tensores sin calibración son un caso concreto para medir el efecto de la calibración parcial en la calidad de salida.
- Análisis de cuantización de tablas de lookup: la recuantización lossy de Engram a E4M3FN/E8M0 permite estudiar la degradación introducida en mecanismos de memoria o lookup.
- Docencia y divulgación técnica: como ejemplo documentado de procedencia de pesos, manifiestos de conversión y trazabilidad de revisiones fijadas, útil en cursos sobre cadenas de suministro de modelos.
- No se recomienda su uso en producción sin una evaluación de calidad independiente, dado que el propio autor declara que la calidad no está establecida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación de calidad completa no está establecida y que la única comparación publicada por un usuario usa Orca con max_tokens 512 frente a 256 en los otros modelos, lo que invalida cualquier comparación directa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable. El repositorio ocupa 428,5 GB y el payload de expertos es de 1,75 bpw, pero escalas F16, tronco denso, embedding/head, visión, tablas Engram y metadatos añaden tamaño no cuantificado en la cifra de bpw.
- GPU recomendadas: no disponible. Un modelo de 260B parámetros con tronco parcial en F32 excede con holgura cualquier GPU de consumo individual.
- Cabe en GPU de consumo: no, salvo con estrategias de offload a CPU/RAM o sharding multi-GPU no documentadas en la información disponible.
- Opciones de despliegue: consumidor de referencia `beamivalice/sushi`; el formato no es GGUF ni safetensors estándar de transformers, por lo que vLLM, llama.cpp, Ollama y TGI no son compatibles directamente según la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 Orca Sushi (este) | 260,06B | no disponible | Sushi safetensors | MIT | Experimental, calidad no establecida |
| orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF (donante) | no disponible | no disponible | GGUF | no disponible en la información | Fuente de pesos |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (upstream) | no disponible | no disponible | no disponible | no disponible en la información | Checkpoint original |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La recodificación parte de un GGUF ya cuantizado, por lo que introduce pérdida adicional y no puede recuperar información perdida en el donante.
- La cifra "1,75 bpw" describe únicamente el payload uniforme de los expertos enrutados; no es el promedio medido de bits por peso del paquete completo.
- Cuatro expertos (L21/E207, L24/E350, L25/E85, L27/E260) usan fallback de identidad no calibrado, lo que puede degradar el enrutamiento en esas capas.
- Las tablas Engram se recuantizan de forma lossy desde IQ4_NL a E4M3FN/E8M0; no se recuperan las tablas FP8 originales.
- Los factores q/k de Engram se almacenan como producto F32 fusionado con k = unos, una representación derivada compatible, no una reconstrucción de los factores originales.
- La calibración usa importancia diagonal, no covarianza de activaciones completa; el autor no reclama paridad con el encoder privado de Sushi.
- El modelo está marcado como experimental y la evaluación de calidad completa no está establecida; los smokes realizados prueban compatibilidad, no calidad.
- Solo se declaran inglés y ruso; el rendimiento en castellano no está verificado.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible, pero heredados del modelo base y del proceso de abliteración del donante.
- La licencia MIT está sujeta a los términos del donante OrcaRouter y del modelo upstream DeepSeek; debe verificarse su compatibilidad para uso comercial.
- El formato Sushi no es estándar y requiere el consumidor de referencia, lo que limita la portabilidad a infraestructuras convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sanasol2008/DeepSeek-V4.1-Flash-1017-Orca-Sushi-STQ-1.75bpw-work
- Donante GGUF: https://huggingface.co/orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF (revisión `83144a667924660c6ba0095585fd039d8daa9b91`)
- Modelo upstream: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017 (revisión `08c8657f02291e11b6f6b63e0e16014f8e748518`)
- Codec y consumidor Sushi: `beamivalice/sushi` (revisión `d5e876edcb1538a347041b1b7cc28a0e6e8f0af6`)
- Referencia de conversión GGUF/Engram: llama.cpp PR30817 (head `b72050d03ae14bb3cb5138ecefab3f3f65157d31`)
