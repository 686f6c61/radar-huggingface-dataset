# sjoe1244/gemma-4-31b-it-heretic-ara-exl3-8.0bpw-h8-vb8

## Resumen

Esta ficha describe una cuantización EXL3 del modelo `gemma-4-31b-it-heretic-ara`, una versión "decensored" (abliterated) del modelo multimodal `google/gemma-4-31b-it`. La cuantización la ha realizado el usuario sjoe1244 con ExLlamaV3 1.6.7, aplicando 8.0 bits por peso (bpw) al decodificador, a la cabeza de salida y a la torre de visión. El resultado es un artefacto de 34,1 GB en safetensors que solo se puede ejecutar con ExLlamaV3 o TabbyAPI, no con Transformers, vLLM ni llama.cpp.

El problema que resuelve es doble: por un lado, permite ejecutar un modelo de gran tamaño con una pérdida de calidad mínima respecto al BF16 original (KL de 0,00037 y 99,47% de coincidencia en el top-1); por otro, ofrece una variante con los mecanismos de rechazo reducidos mediante la técnica ARA (Arbitrary-Rank Ablation), que según el autor del modelo base baja las negativas de 98/100 a 5/100 en su conjunto de prueba. Conviene señalar una discrepancia importante: el nombre del repositorio indica "31b", pero el recuento real de parámetros en los safetensors es de 17.069.220.076 (unos 17,1 mil millones), por lo que las cifras de tamaño deben tomarse con cautela.

La relevancia de esta ficha es acotada: se trata de una cuantización comunitaria con 21 descargas, sin benchmarks publicados y con requisitos de hardware exigentes para el contexto y la visión simultáneos. Es útil para quien ya tenga decidido usar el modelo base heretic-ara en un entorno ExLlamaV3 y quiera una versión de 8 bpw con visión incluida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión), cuantizado con ExLlamaV3 (EXL3) |
| Parametros totales | 17.069.220.076 (según safetensors); el nombre del repo indica "31b" |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de TabbyAPI usa `chunk_size: 2048`; se probó una caché de 8.192 tokens en 32 GB) |
| Tipos de cuantizacion | EXL3 a 8.0 bpw en decodificador, `lm_head` y torre de visión; caché Q4/Q6/Q8/FP16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | safetensors (EXL3), librería `exllamav3` |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-31b-it`, un transformer multimodal de la familia Gemma 4 con capacidad de entrada imagen-texto. Sobre él, trohrbaugh aplicó una ablación ARA (Arbitrary-Rank Ablation) con Heretic v1.2.0 y ajustes personalizados para reducir los rechazos, dando lugar a `gemma-4-31b-it-heretic-ara` en BF16. Esta ficha corresponde a la cuantización EXL3 de ese modelo, realizada por sjoe1244 con exllamav3 1.6.7, usando un libro de códigos `mul1`, escalas de salida automáticas y calibración de 250 filas × 2.048 columnas con la mezcla de calibración incluida en exllamav3.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo original en la documentación proporcionada. La innovación técnica destacable de esta ficha no está en el entrenamiento, sino en la cuantización: 8 bpw con preservación de la torre de visión y una divergencia KL muy baja frente al BF16 (0,00037, con perplejidad de 18,43 frente a 18,42 del original).

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat (`-gp` en la evaluación).
- Razonamiento y matemáticas básicas: en las pruebas del autor resolvió correctamente 17×23 = 391 y una comprobación de inversión de cadena (`s[::-1]`).
- Capacidad de visión: entrada imagen-texto, con torre de visión cuantizada a 8 bpw; describió correctamente la imagen de ejemplo de exllamav3 (gatito atigrado con gorro de ganchillo).
- Modo "uncensored"/abliterated: los rechazos se reducen según las métricas del modelo base (5/100 frente a 98/100 del original).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional sin filtros restrictivos: para entornos de investigación donde se necesita estudiar el comportamiento del modelo ante peticiones que el Gemma original rechazaría, usando TabbyAPI con caché Q6 y `max_batch_size: 1`.
- Análisis de imágenes en local: descripción y razonamiento sobre imágenes con la torre de visión cuantizada, siempre que se disponga de 40–48 GB de VRAM para cargar texto y visión a la vez.
- Evaluación de cuantizaciones: como referencia de hasta dónde llega un EXL3 a 8 bpw frente al BF16 (KL 0,00037, perplejidad prácticamente idéntica), útil para decidir entre 8.0, 6.0, 4.5 y 4.0 bpw en la misma familia.
- Prototipado de pipelines imagen-texto en una sola GPU de 48 GB: el modelo completo con visión y contexto moderado cabe en una tarjeta de 48 GB, lo que permite iterar sin infraestructura multinodo.
- Generación de texto a alta velocidad en una RTX 5090 en modo solo texto: con caché pequeña (8.192 tokens Q4) y `max_chunk_size=512` se obtuvieron unos 42 tok/s, adecuado para tareas de generación interactiva.
- Investigación sobre alineación y seguridad: comparar las respuestas del modelo heretic-ara con las del Gemma 4 original permite medir el efecto de la ablación ARA en dominios sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos numéricos son métricas de fidelidad de la cuantización y del modelo base:

| Metrica | Este quant (EXL3 8.0 bpw) | BF16 heretic-ara | Gemma 4 original |
|---|---|---|---|
| KL divergencia (quant ‖ BF16) | 0,00037 | 0 | no aplica |
| Coincidencia top-1 | 99,47% | 100% | no aplica |
| Perplejidad (wikitext-2) | 18,43 | 18,42 | no disponible |
| Rechazos | no medido en el quant | 5/100 | 98/100 |
| KL divergencia (modelo base) | no aplica | 0,0120 | 0 (por definición) |

Comparativa interna de cuantizaciones de la misma familia (medida igual, 50 filas × 2.048 tokens de wikitext-2):

| Quant | KL vs BF16 | Coincidencia top-1 |
|---|---|---|
| 8.0bpw-h8-vb8 (esta) | 0,00037 | 99,47% |
| 6.0bpw-h8 | 0,0023 | 98,58% |
| 4.5bpw-h8-vb6 | 0,0177 | 95,93% |
| 4.0bpw-h4-vb4 | 0,0244 | 95,30% |

## Requisitos de hardware

- VRAM estimada: unos 28,6 GiB para el modelo de texto y unos 0,7 GiB adicionales para la visión.
- En una GPU de 32 GB no caben texto y visión cargados a la vez; con ambos, ni siquiera una caché de 2.048 tokens cargó en una RTX 5090.
- Solo texto en 32 GB: funciona con caché muy pequeña (8.192 tokens Q4, `device="cuda:0"`, `max_chunk_size=512`), con unos 30 GiB asignados.
- Para uso real con visión y contexto largo: prever 40–48 GB o más, por ejemplo dos GPU con autosplit o una tarjeta de 48 GB.
- En tarjetas de 24–32 GB, el autor recomienda la variante de 6.0 bpw.
- GPU recomendadas: RTX 5090 (probada, solo texto), A100/H100 de 40–80 GB o tarjetas de 48 GB para el uso completo.
- Despliegue: exclusivamente ExLlamaV3 o TabbyAPI; no es compatible con Transformers, vLLM ni llama.cpp.
- Rendimiento medido: unos 42 tok/s en generación con la RTX 5090 en modo solo texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Este quant (gemma-4-31b-it-heretic-ara EXL3 8.0 bpw) | 17,1 B (safetensors) | no disponible | Si | apache-2.0 | EXL3 / ExLlamaV3, TabbyAPI |
| gemma-4-31b-it-heretic-ara BF16 | no disponible | no disponible | Si | apache-2.0 | BF16 / Transformers |
| gemma-4-31b-it-heretic-ara EXL3 6.0 bpw | no disponible | no disponible | Si | apache-2.0 | EXL3 / ExLlamaV3 |
| google/gemma-4-31b-it | no disponible | no disponible | Si | licencia Gemma 4 | Transformers, vLLM, llama.cpp |

No se dispone de datos de benchmarks que permitan comparar el rendimiento con alternativas de otros autores; la comparación se limita a la familia de cuantizaciones del mismo modelo base.

## Limitaciones y advertencias

- Discrepancia de tamaño: el nombre indica "31b" pero los safetensors contienen 17,1 mil millones de parámetros; conviene verificar antes de planificar recursos.
- Modelo abliterated: los mecanismos de seguridad están reducidos de forma deliberada; el autor advierte de que el uso es responsabilidad del usuario y debe respetar los términos de Gemma y la legislación aplicable.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad; al tratarse de una modificación por ablación, el comportamiento puede diferir del Gemma original de formas no medidas.
- Sesgos: no disponible; no se han publicado análisis de sesgos para esta variante.
- Idiomas soportados: no disponible; no se documenta qué lenguas conserva tras la ablación.
- Contexto: no se documenta la longitud máxima; las pruebas en 32 GB se limitaron a 8.192 tokens de caché, lo que no implica que el modelo no soporte más.
- Compatibilidad restringida: no funciona en Transformers, vLLM ni llama.cpp; solo ExLlamaV3 y TabbyAPI.
- Requisitos de VRAM altos para el uso completo (visión + contexto largo): 40–48 GB o más.
- Licencia: apache-2.0 según la model card, con enlace a la licencia de Gemma 4; conviene revisar las condiciones de uso comercial de dicha licencia antes de desplegar en producción.
- Madurez: 21 descargas y 0 likes en el momento de la consulta; es un artefacto comunitario sin validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sjoe1244/gemma-4-31b-it-heretic-ara-exl3-8.0bpw-h8-vb8
- Modelo base (BF16): https://huggingface.co/trohrbaugh/gemma-4-31b-it-heretic-ara
- Modelo original de Google: https://huggingface.co/google/gemma-4-31b-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Cuantización 6.0 bpw: https://huggingface.co/sjoe1244/gemma-4-31b-it-heretic-ara-exl3-6.0bpw-h8
- Cuantización 4.5 bpw: https://huggingface.co/sjoe1244/gemma-4-31b-it-heretic-ara-exl3-4.5bpw-h8-vb6
- Cuantización 4.0 bpw: https://huggingface.co/sjoe1244/gemma-4-31b-it-heretic-ara-exl3-4.0bpw-h4-vb4
