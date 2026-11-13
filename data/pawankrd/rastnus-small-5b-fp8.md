# PawanKrd/RastNus-Small-5B-FP8

## Resumen

RastNus-Small-5B-FP8 es la versión cuantizada en FP8 del modelo RastNus-Small-5B, desarrollado por PawanKrd y especializado en corrección gramatical, ortográfica y de puntuación para kurdo central (sorani, código `ckb`). Parte del modelo base google/gemma-4-E2B, un transformer de la familia Gemma 4 con aproximadamente 5.100 millones de parámetros totales y unos 2.000 millones efectivos, lo que sugiere una arquitectura de mezcla de expertos (MoE) con activación dispersa.

El modelo aborda un problema concreto y poco cubierto: el kurdo es una de las lenguas con menor soporte en PLN moderno, y el sorani escrito cotidiano presenta inconsistencias ortográficas frecuentes, como la omisión de letras diacríticas (ی/ێ, و/ۆ, ر/ڕ), errores de espaciado, puntuación informal y mezcla de préstamos léxicos. RastNus se presenta como un corrector de texto orientado a normalizar esas variantes.

La relevancia actual del modelo reside en su doble condición: por un lado, es un ajuste especializado en una lengua de bajos recursos; por otro, se distribuye en FP8 con `compressed-tensors` y compatibilidad con endpoints, lo que facilita su despliegue en vLLM. La licencia declarada es Apache 2.0, aunque la model card enlaza también a la licencia de Gemma 4 de Google, un punto que conviene revisar antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 (google/gemma-4-E2B); MoE segun el sufijo "E2B" y los ~2B efectivos declarados |
| Parametros totales | 5.104.371.011 |
| Parametros activos | aproximadamente 2.000 millones (según la denominación "E2B" y el dato de "~2B effective" de la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (formato del repositorio); cuantizaciones adicionales no disponibles |
| Idiomas soportados | kurdo central / sorani (`ckb`) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors, con cuantización `compressed-tensors` (FP8) |

## Arquitectura y entrenamiento

El modelo se construye sobre google/gemma-4-E2B, un transformer de la familia Gemma 4 con unos 5.100 millones de parámetros totales y aproximadamente 2.000 millones activos, lo que apunta a una arquitectura de mezcla de expertos con activación dispersa. La versión publicada aplica cuantización FP8 mediante `compressed-tensors`, pensada para servir el modelo con vLLM de forma eficiente en memoria. No se dispone de información sobre la longitud de contexto nativa del modelo base ni sobre detalles de la capa de atención.

En cuanto al entrenamiento, la model card describe el objetivo (corrección gramatical, ortográfica y de puntuación en sorani) pero no detalla el número de tokens, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del ajuste más allá de la propia cuantización FP8 para inferencia.

## Capacidades

- Corrección gramatical en kurdo central (sorani): detección y reparación de errores de concordancia y de estructura oracional.
- Corrección ortográfica: restitución de letras diacríticas del alfabeto sorani (ی/ێ, و/ۆ, ر/ڕ) y normalización de grafías.
- Restauración de puntuación: inserción y corrección de signos de puntuación en texto informal.
- Normalización de espaciado y de préstamos léxicos mezclados.
- Generación de texto conversacional, según la etiqueta `text-generation` del repositorio.
- Procesamiento de entrada imagen-texto, según la etiqueta `image-text-to-text` del repositorio (capacidad heredada del modelo base; no se detalla su alcance en la model card).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al kurdo central (`ckb`) según los metadatos; no se documentan otros idiomas.

## Casos de uso

- Corrección de textos periodísticos en sorani: el modelo puede recibir un borrador redactado por un periodista y devolver la versión normalizada ortográfica y gramaticalmente, reduciendo el trabajo de edición en medios que publican en kurdo central.
- Normalización de contenido generado por usuarios: en foros, redes sociales o comentarios, donde el sorani informal abunda en grafías inconsistentes, el modelo puede estandarizar el texto antes de almacenarlo o indexarlo.
- Preprocesado para pipelines de PLN en kurdo: la corrección previa mejora la calidad de entrada para tareas posteriores como traducción automática, análisis de sentimiento o búsqueda, al reducir la variabilidad ortográfica.
- Herramienta de apoyo educativo: integración en plataformas de aprendizaje del sorani para señalar errores de escritura y diacríticos a estudiantes, con explicación de la corrección aplicada.
- Edición y publicación digital: revisión automatizada de manuscritos, artículos y documentación administrativa en kurdo central antes de su publicación.
- Asistentes de escritura en aplicaciones ofimáticas: extensión o servicio backend que corrija el texto mientras el usuario escribe, aprovechando el formato FP8 para servir respuestas con baja latencia en vLLM.
- Moderación y limpieza de corpus: normalización masiva de grandes volúmenes de texto en sorani recopilados de la web para construir datasets de entrenamiento de mayor calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 5,1 GB solo para los pesos (5.104 millones de parámetros a 1 byte por parámetro), más overhead de activaciones, caché KV y buffers de runtime; en la práctica se recomienda reservar entre 8 y 12 GB para contextos moderados, aunque la longitud de contexto no está documentada.
- El tamaño del repositorio es de 8,4 GB, lo que incluye pesos y artefactos adicionales.
- GPU recomendadas: para servir con vLLM en FP8, GPU con soporte de FP8 nativo como H100, L40S o A100 (esta última con conversión o kernels compatibles); también es viable en RTX 4090 con cuantización FP8 si el runtime lo soporta.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) y en tarjetas con 12 GB o más, siempre que el runtime admita FP8 y el contexto utilizado sea moderado.
- Opciones de despliegue: vLLM es el objetivo declarado del repositorio (formato `compressed-tensors` y compatibilidad con endpoints); otras opciones como llama.cpp, Ollama o TGI no están documentadas para este checkpoint.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RastNus-Small-5B-FP8 | 5.104 millones (~2B activos) | no disponible | ckb | apache-2.0 | safetensors FP8 |
| google/gemma-4-E2B (modelo base) | no disponible en la información | no disponible | no disponible | licencia Gemma 4 | no disponible |
| RastNus-Small-5B (versión sin cuantizar) | 5.104 millones (~2B activos) | no disponible | ckb | apache-2.0 | safetensors |

No se dispone de información sobre otros correctores especializados en kurdo central con los que establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en kurdo central (sorani); no se documenta soporte para kurdo kurmanji, kurdo del sur ni otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos: al ser un corrector, puede introducir cambios no solicitados o alterar el significado original del texto si se usa con instrucciones ambiguas.
- No se han publicado evaluaciones cuantitativas (benchmarks) que permitan estimar la tasa de error de corrección ni compararla con alternativas.
- La model card no detalla la composición del dataset de ajuste, por lo que no es posible evaluar sesgos de dominio ni de registro (formal frente a informal).
- La licencia declarada es Apache 2.0, pero la model card enlaza a la licencia de Gemma 4 de Google; conviene verificar la compatibilidad de ambas antes de un despliegue comercial, dado que el modelo deriva de un checkpoint de Google.
- El checkpoint está cuantizado en FP8 y orientado a vLLM; su uso en otros runtimes (llama.cpp, Ollama, TGI) no está documentado y puede requerir conversión adicional.
- No se documenta la longitud de contexto, lo que impide garantizar el comportamiento en documentos largos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PawanKrd/RastNus-Small-5B-FP8
- Versión sin cuantizar: https://huggingface.co/PawanKrd/RastNus-Small-5B
- Modelo base: https://huggingface.co/google/gemma-4-E2B
- Perfil del autor: https://huggingface.co/PawanKrd
- Sitio del autor: https://pawan.krd
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
