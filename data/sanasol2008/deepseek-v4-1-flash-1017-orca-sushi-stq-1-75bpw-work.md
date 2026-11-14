# sanasol2008/DeepSeek-V4.1-Flash-1017-Orca-Sushi-STQ-1.75bpw-work

## Resumen

DeepSeek-V4.1-Flash-1017 Orca Sushi PAIR1/STQ es una conversión experimental del checkpoint abliterated `orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF` (variante Mix-256G) a un formato de pesos propietario denominado "Sushi", desarrollado por el usuario sanasol2008. El modelo parte de la arquitectura DeepSeek-V4.1-Flash, un transformer de tipo mixture-of-experts (MoE) con 260.058.263.664 parámetros totales según los safetensors del repositorio, y reencoda los expertos enrutados con un esquema de trellis PAIR1-w16-v1 a 1,75 bits por peso (bpw) de payload uniforme, manteniendo escalas F16.

El interés de esta ficha es principalmente documental y de investigación: se trata de un artefacto marcado explícitamente como "experimental" y "no aprobado para calidad de runtime" por su propio autor. La model card indica que la carga completa del modelo, la evaluación KLD en held-out y las pruebas de comportamiento están pendientes, y que los archivos ROOT completos solo se suben tras superar las comprobaciones de estructura y fuente. No es, por tanto, un modelo listo para producción, sino un candidato de conversión que ilustra técnicas de cuantización extrema sobre un MoE de gran tamaño.

La relevancia actual reside en el ecosistema de compresión agresiva de modelos MoE: reducir un modelo de ~260B parámetros a un payload de 1,75 bpw en los expertos enrutados abre la puerta a despliegues con requisitos de VRAM muy inferiores a los de un BF16, aunque a costa de pérdidas de cuantización acumuladas (el donante ya estaba cuantizado en GGUF y la re-codificación añade una segunda capa de pérdida). El repositorio ocupa 428,5 GB y usa la librería `sushi`, no formatos estándar como transformers o llama.cpp.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (DeepSeek-V4.1-Flash), con trunk denso, expertos enrutados, Engram lookup tables y componentes de visión |
| Parámetros totales | 260.058.263.664 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados en PAIR1-w16-v1 a n28 (1,75 bpw de payload), escalas F16; trunk calibrado en SPEC1-w15 K4 (n64); trunk denso restante en F32; embeddings y head en F32; visión en BF16; Engram en E4M3FN/E8M0 |
| Idiomas soportados | en, ru |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `sushi`), derivado de GGUF |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento desde cero. La arquitectura subyacente es la de DeepSeek-V4.1-Flash-1017, un MoE con trunk denso, routers, normas, tensores de hyperconnection, tablas Engram y un módulo de visión con aligner. Sobre esa base, el autor aplica un pipeline de recodificación: los expertos enrutados se reencodan con el códec PAIR1-w16-v1 en trellis uniforme n28 (28/16 = 1,75 bpw de payload), con calibración basada en importancia diagonal de las entradas nativas del donante y normalización por capa común para retener información de frecuencia de routing, rotación H128 y block LDLQ. Cuatro expertos no visitados (L21/E207, L24/E350, L25/E85, L27/E260, doce proyecciones) usan un fallback explícito de identidad-importancia marcado como no calibrado.

El trunk calibrado se recodifica en 337 bancos SPEC1-w15 K4 (n64) usando diagonales del donante, con `wo_a` de atención agrupada empleando ocho diagonales independientes de coordenadas de entrada. Los 464 tensores densos restantes del trunk se conservan como F32 dequantizados del donante (incluye routers, normas, tensores de hyperconnection y factores de compuerta Engram compatibles). Embeddings y head de salida son F32 dequantizados; visión y aligner se almacenan en BF16 para el loader estricto de Sushi, con vectores de norma/bias/imagen en F32. Las tablas Engram se dequantizan de IQ4_NL del donante y se recuantizan a E4M3FN/E8M0 con una escala por 32 columnas (proceso con pérdida). DSpark/MTP se omite por ausencia en el donante.

No hay información sobre número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO, ya que el modelo es una conversión de pesos, no un modelo entrenado. Las innovaciones técnicas destacables son el propio códec Sushi (trellis con calibración diagonal), la representación derivada compatible de los factores Engram q/k (q = producto F32 fusionado del donante, k = unos F32) y el uso de layout pack-order que puede convertirse a pair-major mediante `sushi repack` con verificación de bytes inversa.

## Capacidades

- Generación de texto en inglés y ruso, según los idiomas declarados en la model card.
- Razonamiento y conversación multi-turno: el donante conserva su plantilla de chat embebida, no sustituida por la plantilla base nativa.
- Capacidades de visión: el repositorio incluye pesos de visión y aligner en BF16, aunque su funcionamiento tras la conversión no está validado.
- Mezcla de expertos con routing: los expertos enrutados se recodifican individualmente y los routers se conservan en F32.
- Tablas Engram para lookup de conocimiento, recuantizadas de forma con pérdida.
- No se declara soporte explícito de tool calling, function calling ni agentes multi-step en la información disponible.
- No se declara modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Investigación en cuantización extrema de MoE: el modelo sirve como banco de pruebas para estudiar el impacto de codificar expertos enrutados a 1,75 bpw de payload sobre un modelo de ~260B parámetros, comparando la pérdida de cuantización con el checkpoint donante en GGUF.
- Estudio de formatos propietarios de pesos: permite analizar el códec Sushi (PAIR1-w16-v1, SPEC1-w15 K4) frente a GGUF, safetensors estándar y otros esquemas de compresión, útil para equipos que diseñan pipelines de compresión propios.
- Evaluación de representaciones derivadas: el caso de los factores Engram q/k (q = producto fusionado, k = unos) es un ejemplo concreto de cómo reconstruir una representación compatible cuando los factores originales no son invertibles, aplicable a problemas de compatibilidad de checkpoints.
- Reproducibilidad y auditoría de conversiones: los manifiestos de conversión con hashes de revisión del donante, hashes de código del encoder y procedencia de rangos de calibración permiten auditar el proceso paso a paso, útil en entornos de investigación que exigen trazabilidad.
- Docencia y divulgación técnica: ilustra las diferencias entre bpw de payload y bpw promedio real, y por qué una conversión desde un checkpoint ya cuantizado no puede recuperar información perdida, un error conceptual frecuente.
- Pruebas de compatibilidad de runtime: el smoke test híbrido de una capa mencionado en la model card sirve para validar que el loader estricto de Sushi acepta los artefactos, antes de intentar cargas completas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación KLD en held-out y las pruebas de comportamiento están pendientes, y que las comprobaciones locales de código, paridad de códec CPU/CUDA y pilotos de proyección pequeños no establecen la calidad del modelo completo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable. El repositorio ocupa 428,5 GB en disco, pero el tamaño de memoria en runtime debe reportarse por separado (la model card advierte que el "1,75 bpw" describe solo el payload de expertos enrutados, no el promedio del pack completo).
- GPU recomendadas: no disponible. El tamaño del modelo (260B parámetros totales) y el formato Sushi no permiten dar una recomendación fiable sin datos de runtime publicados.
- ¿Cabe en GPU consumer? No disponible. Dado el tamaño del repositorio (428,5 GB) y la presencia de trunk en F32, es improbable que quepa en una GPU consumer de 24 GB, pero no hay medición publicada.
- Opciones de despliegue: la librería requerida es `sushi` (referencia pública en `beamivalice/sushi`). No se declara soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto; el propio autor indica que la carga completa del modelo Sushi está pendiente.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 Orca Sushi PAIR1/STQ (este) | 260.058.263.664 | no disponible | Sushi (safetensors) | MIT | Experimental, no aprobado para runtime |
| orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF (donante) | no disponible | no disponible | GGUF (Mix-256G) | no disponible | Fuente de la conversión |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (oficial) | no disponible | no disponible | no disponible | no disponible | Checkpoint oficial de referencia estructural |

No se dispone de datos de benchmarks ni de parámetros activos de los modelos comparados en la información proporcionada, por lo que la comparativa se limita a procedencia, formato y estado de validación.

## Limitaciones y advertencias

- Modelo marcado como experimental y no aprobado para calidad de runtime por su propio autor; la carga completa, la evaluación KLD y las pruebas de comportamiento están pendientes.
- Doble pérdida de cuantización: el donante ya estaba cuantizado en GGUF y la re-codificación a Sushi añade pérdida adicional; no es una conversión BF16→Sushi y no puede recuperar información perdida en el GGUF donante.
- El "1,75 bpw" se refiere solo al payload uniforme de expertos enrutados, no al promedio medido del pack completo; escalas F16, trunk denso, embeddings/head, visión, tablas Engram, metadatos y almacenamiento de runtime son adicionales.
- Cuatro expertos no visitados usan fallback de identidad-importancia marcado como no calibrado, no estadísticas medidas.
- Las tablas Engram son una recuantización con pérdida de filas IQ4_NL del donante, no una recuperación de las tablas FP8 originales.
- Los factores Engram q/k son una representación derivada compatible (q = producto fusionado, k = unos), no una reconstrucción de los factores originales.
- El encoder usa libros de códigos públicos y búsqueda en float32 con redondeo explícito de escalas F16; no reproduce el encoder calibrado privado de Sushi ni pretende paridad de bytes con esa receta.
- La calibración usa importancia diagonal, no covarianza de activaciones completamente medida; la asignación uniforme n28 no es una asignación mixta óptima medida.
- Sesgos conocidos: no disponibles en la información proporcionada, aunque al derivar de un checkpoint "abliterated" se eliminan rechazos de seguridad del modelo original, lo que puede aumentar el riesgo de contenido dañino.
- Riesgo de alucinación: no cuantificado; sin benchmarks publicados no puede evaluarse.
- Idiomas limitados a inglés y ruso según la model card.
- Licencia MIT declarada, lo que permite uso comercial, pero el estado experimental y la falta de validación desaconsejan su uso en producción.
- El layout inicial es pack-order; la conversión a pair-major mediante `sushi repack` con verificación de bytes inversa queda pendiente y el layout final debe rellenarse solo tras completarse y comprobarse.

## Enlaces

- Hugging Face: https://huggingface.co/sanasol2008/DeepSeek-V4.1-Flash-1017-Orca-Sushi-STQ-1.75bpw-work
- Donante GGUF: `orcarouter/DeepSeek-V4.1-Flash-1017-abliterated-GGUF` (revisión `83144a667924660c6ba0095585fd039d8daa9b91`, directorio `Mix-256G/` e `imatrix.gguf`)
- Checkpoint oficial de referencia estructural: `deepseek-ai/DeepSeek-V4.1-Flash-1017` (revisión `08c8657f02291e11b6f6b63e0e16014f8e748518`)
- Código y referencia del consumidor Sushi: `beamivalice/sushi` (revisión `d5e876edcb1538a347041b1b7cc28a0e6e8f0af6`)
- Referencia de conversión GGUF/mapeo Engram: llama.cpp PR30817, head `b72050d03ae14bb3cb5138ecefab3f3f65157d31`
