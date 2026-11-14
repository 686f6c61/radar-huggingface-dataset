# sanasol2008/DeepSeek-V4.1-Flash-1017-Orca-Sushi-STQ-1.75bpw

## Resumen

DeepSeek-V4.1-Flash-1017 Orca Sushi PAIR1/STQ es una conversión experimental al formato Sushi de un GGUF ya cuantizado y abliterado del modelo DeepSeek-V4.1-Flash-1017, publicada por el usuario sanasol2008. No se trata de un modelo entrenado desde cero ni de una conversión directa desde pesos BF16: los pesos de origen proceden de `orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF` (variante Mix-256G), de modo que la re-codificación acumula la pérdida de cuantización del donante y no puede recuperar información ya descartada. La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con capacidades multimodales (visión) y tablas Engram, con 260.058.263.664 parámetros totales según los safetensors del repositorio.

El interés técnico del artefacto reside en su representación de pesos: los expertos enrutados se re-codifican con el codec PAIR1-w16-v1 a una tasa uniforme `n28` (28/16 = 1,75 bits por peso de payload), mientras que el tronco denso calibrado usa bancos SPEC1-w15 K4 (`n64`) y el resto del tronco, embeddings, cabeza de salida y visión se conservan en F32 o BF16 dequantizados del donante. La etiqueta "1.75bpw" describe únicamente el payload de los expertos enrutados, no la media real de bits por peso del paquete completo.

Es un artefacto claramente experimental: el autor declara que la calidad completa no está establecida, que las pruebas de 1024 tokens están pendientes y que solo se ha verificado la descarga, el repack y un smoke test técnico limitado en macOS. No debe tratarse como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) con visión y tablas Engram; conversión al formato Sushi |
| Parametros totales | 260.058.263.664 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados PAIR1-w16-v1 a `n28` (1,75 bpw de payload); tronco calibrado SPEC1-w15 K4 (`n64`); tronco restante, embeddings, cabeza y visión en F32/BF16 dequantizados; tablas Engram en E4M3FN/E8M0 |
| Idiomas soportados | en, ru |
| Licencia | MIT (sujeta a las licencias del donante y del modelo upstream) |
| Formato de pesos | safetensors (formato Sushi, orden pack-order) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer MoE multimodal de DeepSeek con atención agrupada (el tronco incluye tensores `wo_a` con diagonales de entrada independientes), routers, tensores de hiperconexión y tablas de búsqueda Engram. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo original; esta ficha solo cubre el artefacto convertido.

La conversión no entrena nada: re-codifica los tensores del donante GGUF con codebooks y empaquetado públicos de Sushi, usando una búsqueda en float32 con redondeo explícito de escalas almacenadas en F16. La calibración de expertos emplea importancia diagonal sobre las entradas nativas del donante con normalización por capa común, rotación H128 y LDLQ por bloques. Cuatro expertos no visitados (L21/E207, L24/E350, L25/E85, L27/E260; doce proyecciones) usan un fallback de importancia identidad marcado como no calibrado. Los factores de compuerta Engram se almacenan como una representación derivada compatible (`q` = producto F32 fusionado del donante, `k` = unos en F32), no como reconstrucción de los factores originales. El módulo DSpark/MTP se omite por no estar presente en el donante.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base DeepSeek-V4.1-Flash-1017, aunque degradadas por la doble cuantización.
- Procesamiento de visión: el paquete incluye pesos de visión y aligner en BF16/F32, por lo que el artefacto conserva la ruta multimodal del donante.
- Tablas Engram: se mantienen mediante dequantización acotada de filas IQ4_NL y requantización E4M3FN/E8M0 (con pérdida).
- Multilingüe limitado: la model card declara únicamente inglés y ruso.
- Tool calling y razonamiento multi-paso: no confirmado en la información disponible para este artefacto.
- Modo thinking: no confirmado en la información disponible.
- Plantilla de chat: se conserva la plantilla embebida del donante, no la plantilla base nativa.

## Casos de uso

- Investigación de codecs de cuantización: el artefacto permite estudiar el comportamiento de PAIR1-w16-v1 a `n28` y SPEC1-w15 K4 sobre un MoE grande real, comparando la fidelidad de la re-codificación frente al GGUF donante.
- Validación de la cadena de herramientas Sushi: sirve para probar el cargador estricto de Sushi, el comando público `sushi repack` (conversión de pack-order a pair-major con verificación inversa de bytes) y la paridad de codec CPU/CUDA.
- Pruebas de despliegue en macOS: el autor verificó un smoke test técnico en Mac tras repack local, por lo que es útil para validar flujos de descarga, repack y arranque en ese entorno.
- Estudio de representaciones derivadas: el par Engram `q`/`k` derivado y los fallbacks de expertos no calibrados son casos concretos para analizar cómo afectan las aproximaciones a la fidelidad del modelo.
- Reproducibilidad de conversiones: los manifiestos fijan revisión del donante, hashes de código del encoder, política de tasa y calibración y procedencia de rangos de bytes, lo que facilita auditar el proceso.
- Evaluación comparativa de pérdida por doble cuantización: al partir de un GGUF ya cuantizado, permite medir cuánta calidad adicional se pierde al re-codificar, un dato relevante para pipelines de compresión extrema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la evaluación completa de calidad no está establecida y que las pruebas de 1024 tokens están pendientes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 428,5 GB, pero el tamaño final en runtime y la memoria necesaria deben reportarse por separado según el propio autor (escalas F16, tronco denso, embeddings, visión, tablas Engram y metadatos añaden sobrecoste al payload de 1,75 bpw).
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no confirmada; el tamaño del artefacto y el número de parámetros hacen improbable un despliegue en GPU de consumo sin información adicional.
- Opciones de despliegue: cargador Sushi (librería `sushi`), con repack mediante el comando público `sushi repack`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 Orca Sushi PAIR1/STQ (este) | 260.058.263.664 | no disponible | Sushi safetensors | MIT (sujeta a upstream) | Experimental, sin evaluación de calidad |
| orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF (donante) | no disponible | no disponible | GGUF (Mix-256G) | no disponible | Fuente del que deriva este artefacto |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (oficial) | no disponible | no disponible | no disponible | no disponible | Checkpoint oficial de referencia |

No se dispone de datos de benchmarks ni de especificaciones completas de las alternativas en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Doble cuantización: el origen ya está cuantizado; la re-codificación añade pérdida y no puede recuperar información descartada en el GGUF donante.
- La etiqueta "1.75bpw" solo aplica al payload de expertos enrutados; la media real de bits por peso del paquete es mayor y no se reporta.
- Cuatro expertos (doce proyecciones) están marcados como no calibrados y usan un fallback de importancia identidad, no estadísticas medidas.
- Las tablas Engram se requantizan con pérdida y no recuperan las tablas FP8 originales; los factores de compuerta son una representación derivada, no los originales.
- El modelo es "abliterated" en su origen, lo que implica que se han eliminado mecanismos de rechazo; esto incrementa el riesgo de contenido inapropiado o dañino en producción.
- Calidad no establecida: no hay evaluación completa ni pruebas de 1024 tokens publicadas; solo un smoke test técnico limitado en macOS.
- Idiomas declarados únicamente inglés y ruso; el rendimiento en castellano no está verificado.
- Licencia MIT sujeta a las condiciones del donante y del modelo upstream; es necesario incluir sus archivos de licencia y atribución en cualquier distribución.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- El artefacto publicado está en pack-order; el despliegue verificado requirió repack local a pair-major con validación inversa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sanasol2008/DeepSeek-V4.1-Flash-1017-Orca-Sushi-STQ-1.75bpw
- Donante GGUF: https://huggingface.co/orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF (revisión `83144a667924660c6ba0095585fd039d8daa9b91`)
- Modelo oficial upstream: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017 (revisión `08c8657f02291e11b6f6b63e0e16014f8e748518`)
- Código y referencia de consumidor Sushi: `beamivalice/sushi` en `d5e876edcb1538a347041b1b7cc28a0e6e8f0af6`
- Referencia de conversión GGUF y mapeo Engram: llama.cpp PR30817, head `b72050d03ae14bb3cb5138ecefab3f3f65157d31`
