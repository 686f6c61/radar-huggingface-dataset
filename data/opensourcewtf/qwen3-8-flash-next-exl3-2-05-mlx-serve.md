# OpensourceWTF/Qwen3.8-Flash-Next-EXL3-2.05-mlx-serve

## Resumen

Qwen3.8-Flash-Next-EXL3-2.05-mlx-serve es una distribución de pesos cuantizados del modelo Qwen3.8-Flash-Next, publicada por el usuario OpensourceWTF en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversión del checkpoint EXL3 de turboderp (generado con exllamav3) a un formato compatible con mlx-serve, el runtime de inferencia de Apple para chips de la serie M. El repositorio contiene 18.414.907.795 parámetros en safetensors y ocupa 63,1 GB.

La relevancia de esta ficha es doble: por un lado documenta un artefacto de cuantización de bajísima precisión (2,05 bits por peso, bpw) pensado para ejecutar un modelo grande en hardware Apple Silicon con memoria unificada; por otro, ejemplifica un patrón habitual en el ecosistema open source, donde la model card original ha sido reemplazada por un aviso de migración: todos los ficheros, salvo `ngram_embedding.safetensors`, se han trasladado a la rama `2.05bpw` del repositorio `OpensourceWTF/Qwen3.8-Flash-Next-exl3`, y la tabla n-gram debe reconstruirse a partir del fichero de turboderp.

Conviene subrayar que el autor no proporciona información sobre arquitectura interna, datos de entrenamiento, idiomas o benchmarks. Los datos disponibles permiten describir el artefacto de cuantización y su uso previsto, pero no las capacidades del modelo base más allá de lo que se deduce de su nombre y de su pipeline (`text-generation`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-Flash-Next; no se detalla en la información proporcionada) |
| Parametros totales | 18.414.907.795 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 2,05 bpw (bits por peso), con tabla n-gram asociada (`ngram_embedding.safetensors`) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `license: other` en los tags) |
| Formato de pesos | safetensors, empaquetado para mlx-serve |
| Tamano del repositorio | 63,1 GB |
| Modelo base | turboderp/Qwen3.8-Flash-Next-exl3 (rama `2.05bpw_h4_ng4`) |
| Libreria / runtime | mlx-serve |
| Pipeline | text-generation |
| Descargas | 284 |
| Fecha de creacion | 2026-10-27 |
| Ultima actualizacion | 2026-11-03 |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Qwen3.8-Flash-Next en la documentación proporcionada: no se especifica si es un transformer denso, un mixture of experts, un modelo híbrido o si incorpora mecanismos de atención lineal. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

Lo que sí está documentado es el proceso de cuantización. Los pesos proceden de turboderp/Qwen3.8-Flash-Next-exl3, rama `2.05bpw_h4_ng4`, generados con exllamav3, una herramienta de cuantización orientada a GPU. La conversión a mlx-serve la realiza el repositorio OpenSourceWTF/qwen38-exl3-mlx-serve-converter, cuyo paso de cabecera (*header step*) es necesario para construir la tabla n-gram a partir del fichero original de turboderp (sha256 `2c568ee8011a…`). El resultado es un artefacto de 2,05 bpw, una compresión extrema que reduce drásticamente la huella de memoria a costa de precisión numérica.

Un detalle técnico relevante es que la tabla n-gram (`ngram_embedding.safetensors`) no se copió al repositorio de destino y debe regenerarse con el conversor; el autor indica que el resto de ficheros del commit `37828a5d` se trasladaron byte a byte, verificados por sha256. El historial del repositorio se ha colapsado (*squashed*) para liberar almacenamiento, por lo que no es posible auditar versiones intermedias.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que la función principal es la producción de texto autoregresivo.
- Razonamiento y código: no hay documentación específica en la información proporcionada; las capacidades heredadas del modelo base Qwen3.8-Flash-Next no están detalladas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está informado).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Ejecución en Apple Silicon: capacidad operativa del artefacto, al estar empaquetado para mlx-serve.

## Casos de uso

- Inferencia local en Apple Silicon: el formato mlx-serve y la cuantización a 2,05 bpw permiten cargar un modelo de 18,4 mil millones de parámetros en equipos con memoria unificada, algo inviable con pesos en fp16 (que requerirían más de 36 GB solo para los pesos).
- Experimentación con cuantización extrema: útil para investigadores que quieran medir la degradación de calidad de un modelo grande al comprimirlo a ~2 bits por peso, comparando contra el checkpoint EXL3 original de turboderp.
- Prototipado de pipelines de generación de texto en macOS: integrable en scripts y aplicaciones que usen el runtime mlx-serve, sin necesidad de GPU dedicada.
- Evaluación de la cadena de conversión EXL3 a MLX: el repositorio y su conversor sirven como referencia para reproducir el proceso con otros checkpoints EXL3.
- Despliegue de bajo consumo en estaciones de trabajo: el tamaño de 63,1 GB en disco y la baja precisión reducen los requisitos de ancho de banda de memoria frente a pesos de mayor precisión.
- Docencia y demostraciones: permite mostrar en un portátil con chip M el comportamiento de un modelo de escala media-grande, con las salvedades de calidad que impone la cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: con 18,41 mil millones de parámetros a 2,05 bpw, los pesos ocupan aproximadamente 4,7 GB; a ello hay que sumar la tabla n-gram, la caché KV y el overhead del runtime, por lo que conviene reservar un margen adicional (no cuantificado en la documentación).
- GPU recomendadas: el artefacto está orientado a Apple Silicon (mlx-serve); no se documentan requisitos para GPU NVIDIA o AMD.
- Compatibilidad con GPU de consumo: no confirmada para GPUs dedicadas; en Apple Silicon, la memoria unificada de los chips de la serie M es el factor limitante.
- Opciones de despliegue: mlx-serve (runtime declarado). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Runtime |
|---|---|---|---|---|---|
| OpensourceWTF/Qwen3.8-Flash-Next-EXL3-2.05-mlx-serve | 18,41 B | no disponible | EXL3 2,05 bpw | qwen-community-1.0 | mlx-serve |
| turboderp/Qwen3.8-Flash-Next-exl3 (rama `2.05bpw_h4_ng4`) | 18,41 B (mismo modelo base) | no disponible | EXL3 2,05 bpw | qwen-community-1.0 | exllamav3 |
| OpensourceWTF/Qwen3.8-Flash-Next-exl3 (rama `2.05bpw`) | 18,41 B (mismo modelo base) | no disponible | EXL3 2,05 bpw | qwen-community-1.0 | exllamav3 / mlx-serve |

Las tres entradas corresponden al mismo modelo base y a la misma cuantización; la diferencia estriba en el empaquetado y el runtime. No se dispone de información sobre modelos alternativos de otros autores con los que comparar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Repositorio obsoleto: la model card indica que el contenido se ha trasladado a la rama `2.05bpw` de OpensourceWTF/Qwen3.8-Flash-Next-exl3; este repositorio conserva los ficheros pero su historial está colapsado y no es la ubicación recomendada.
- Falta la tabla n-gram: `ngram_embedding.safetensors` no está incluido y debe regenerarse con el conversor a partir del fichero de turboderp, un paso adicional que puede fallar si no se reproduce exactamente.
- Cuantización agresiva: 2,05 bpw es una compresión extrema que, con carácter general, degrada la calidad de la generación frente a pesos de 4 u 8 bits; no hay datos publicados que cuantifiquen esa pérdida para este checkpoint.
- Sesgos y alucinaciones: no hay información específica; se heredan los del modelo base, no documentados aquí.
- Idiomas y contexto: sin datos, por lo que no se puede garantizar el comportamiento multilingüe ni el aprovechamiento de ventanas largas.
- Licencia: qwen-community-1.0 (etiquetada como `other`), con términos que deben revisarse antes de un uso comercial; el enlace a la licencia apunta a la rama `2.05bpw` del repositorio de destino.
- Runtime restringido: mlx-serve limita el despliegue a entornos Apple; no se documenta soporte para otros motores de inferencia.
- Producción: sin benchmarks, sin garantías de calidad y con un proceso de reconstrucción manual, el artefacto no es adecuado para sistemas en producción sin una validación previa exhaustiva.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-EXL3-2.05-mlx-serve
- Destino de la migración (rama `2.05bpw`): https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-exl3/tree/2.05bpw
- Modelo base de la cuantización: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- Rama con la tabla n-gram original: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3/tree/2.05bpw_h4_ng4
- Conversor EXL3 a mlx-serve: https://github.com/OpenSourceWTF/qwen38-exl3-mlx-serve-converter
- Herramienta de cuantización exllamav3: https://github.com/turboderp-org/exllamav3
- Licencia qwen-community-1.0: https://huggingface.co/OpensourceWTF/Qwen3.8-Flash-Next-exl3/blob/2.05bpw/LICENSE
