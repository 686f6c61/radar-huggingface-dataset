# roukned/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF

## Resumen

`roukned/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF` es un conjunto de cuantizaciones GGUF del modelo `philbert440/Qwen3.8-27B-Uncensored-Cyber`, un modelo derivado de la familia Qwen3 con la alineación de seguridad eliminada ("abliterated") y especializado en el dominio de ciberseguridad ofensiva. El repositorio no introduce ningún cambio de comportamiento sobre el modelo base: su aportación es exclusivamente la cuantización y la metodología de calibración.

La particularidad técnica del repositorio es el uso de una matriz de importancia (imatrix) construida a partir de tráfico real de agentes de programación, en lugar de los corpus genéricos de prosa inglesa habituales en llama.cpp (`wiki.train.raw`, `groups_merged.txt`). El objetivo es preservar con precisión los tokens que fallan típicamente bajo cuantización en uso agéntico: JSON de tool calls, nombres de herramientas, tokens especiales de plantilla de chat y literales largos que deben reproducirse de forma literal (rutas de repositorio, hashes de commit, UUIDs).

El modelo conserva la torre de visión y la cabeza de decodificación especulativa MTP del modelo base, lo que habilita la ruta multimodal y el uso del artefacto `plus-mtp`. El repositorio ocupa 32,6 GB e incluye tres ficheros: la matriz de calibración, una cuantización IQ4_XS sin MTP y otra con MTP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3, derivado abliterated con torre de visión y cabeza MTP) |
| Parámetros totales | 27B (según el nombre del modelo base; el dato de safetensors del repo, 3.391.984, corresponde a tensores del artefacto GGUF, no al modelo completo) |
| Parámetros activos | no disponible |
| Longitud de contexto | 262 K (según la model card, contexto al que se sirve el modelo) |
| Tipos de cuantización | IQ4_XS (con `--output-tensor-type q8_0` y `--token-embedding-type q8_0`); se menciona Q5_K_M como comparación medida localmente |
| Idiomas soportados | no disponible (el corpus de calibración incluye chino/inglés mixto) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer de la familia Qwen3 con 27B parámetros, modificado mediante técnicas de "abliteration" (eliminación de rechazos) y especializado en ciberseguridad ofensiva. Conserva dos componentes destacables: una torre de visión, que habilita el pipeline `image-text-to-text`, y una cabeza de decodificación especulativa MTP (multi-token prediction), que acelera la generación en runtimes compatibles.

Este repositorio no entrena ni ajusta el modelo. Su trabajo es la cuantización: genera una imatrix (`imatrix-agentic-v2.gguf`) con `llama-imatrix` sobre la release Q8_0, usando un corpus de 1,00 MB extraído de 42 sesiones reales de un agente CLI (648 turnos de diálogo, 528 tool calls reales, 1191 ocurrencias de `<|im_start|>`, 547 de `<tool_call>`, 584 chunks a `-c 512`). La cuantización se realiza con `llama-quantize --allow-requantize --imatrix ... --output-tensor-type q8_0 --token-embedding-type q8_0`. El flag `--parse-special` es crítico: sin él, llama.cpp tokeniza `<|im_start|>` como texto literal y los tokens especiales no entran en las estadísticas; el efecto medido es de 0,342 a 0,299 tokens por byte (−12,7%). El contexto de calibración se fija deliberadamente en 512 tokens, no en los 262 K de servicio, porque un contexto pequeño produce más muestras y mejor condicionadas para un presupuesto de tokens fijo. La cuantización parte de Q8_0 (no de BF16), por lo que es una segunda cuantización, aunque Q8_0 es prácticamente sin pérdida.

## Capacidades

- Generación de texto y razonamiento en el dominio de ciberseguridad ofensiva, sin rechazos (de-refusal).
- Capacidades multimodales de imagen a texto gracias a la torre de visión preservada.
- Soporte de tool calling / function calling, con calibración específica para JSON de herramientas y nombres como `bash`, `read`, `web_search`.
- Uso agéntico multi-paso: el corpus de calibración proviene de sesiones reales de un agente CLI de programación.
- Reproducción literal de literales largos: rutas de repositorio, nombres de paquetes, hashes de commit, UUIDs de dispositivo.
- Capacidades multilingües chino/inglés (prosa en chino, rutas y código en inglés) según el corpus de calibración.
- Decodificación especulativa MTP en el artefacto `plus-mtp`, con runtimes que reconozcan el injerto.

## Casos de uso

- Agentes de programación autónomos: el modelo está calibrado sobre tráfico real de un agente CLI que ejecuta tareas de código, por lo que mantiene la fidelidad de tool calls y rutas bajo cuantización IQ4_XS, el punto donde las cuantizaciones genéricas fallan primero.
- Automatización de operaciones de seguridad ofensiva: pentesting asistido, generación de payloads y análisis de vulnerabilidades, aprovechando la especialización del modelo base y la ausencia de rechazos.
- Pipelines de CI/CD con tool calling: la preservación de tokens especiales de plantilla (`<|im_start|>`, `<tool_call>`) permite integrar el modelo en flujos que dependen de un formato de chat estricto sin degradación por cuantización.
- Análisis de imágenes en contexto de seguridad: la torre de visión permite procesar capturas de pantalla, diagramas de red o interfaces para tareas de reconocimiento y documentación.
- Despliegue en hardware limitado: la cuantización IQ4_XS de ~15 GiB permite servir un modelo de 27B en GPUs de 24 GB (RTX 4090) o en configuraciones multi-GPU, con contexto de hasta 262 K según el runtime.
- Reproducción de metodología de calibración: el repositorio publica la imatrix y los comandos exactos, de modo que otros equipos pueden reconstruir su propio corpus desde su tráfico y replicar el proceso extremo a extremo.
- Asistentes de investigación en seguridad que requieren contexto largo: los 262 K tokens permiten mantener sesiones extensas con historial de comandos, rutas y resultados sin truncar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una comparación medida localmente contra Q5_K_M y una evaluación sobre un corpus agéntico held-out, pero los valores numéricos no están incluidos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: ~15 GiB para IQ4_XS sin MTP (14,96 GiB) y ~15,4 GiB con MTP (15,38 GiB); la matriz de calibración ocupa solo 13,01 MiB.
- GPU recomendadas: el repositorio está etiquetado con `v100`, lo que sugiere validación en Tesla V100 (16/32 GB); también cabe en RTX 4090 (24 GB) y en A100/H100 con margen amplio para contexto largo.
- Cabe en GPU de consumo: sí, en GPUs de 24 GB o más (RTX 3090, RTX 4090); en 16 GB el margen es muy ajustado y el contexto efectivo queda limitado.
- Opciones de despliegue: llama.cpp (formato nativo GGUF); el artefacto `plus-mtp` requiere un runtime que reconozca el injerto MTP (la model card menciona FastLLM como artefacto de producción). Para cargadores GGUF convencionales debe usarse el fichero sin MTP.
- Latencia y throughput: no disponibles. La cabeza MTP está pensada para decodificación especulativa y debería reducir la latencia por token en runtimes compatibles, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Qwen3.8-27B-Uncensored-Cyber IQ4_XS) | 27B | 262 K | IQ4_XS + imatrix agéntica | Apache 2.0 | GGUF en HF |
| philbert440/Qwen3.8-27B-Uncensored-Cyber (base) | 27B | 262 K | BF16 / Q8_0 | Apache 2.0 | HF |
| Qwen3-27B original (familia) | 27B | no disponible en la información | múltiples | no disponible en la información | HF |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La diferencia principal de este repositorio frente al base es la cuantización con imatrix calibrada sobre tráfico agéntico, no una mejora de capacidades.

## Limitaciones y advertencias

- Modelo "abliterated" (de-refusal): elimina deliberadamente los mecanismos de rechazo, lo que implica riesgo elevado de generar contenido dañino, ilegal o peligroso. No es apto para despliegues públicos sin filtros externos.
- Especializado en ciberseguridad ofensiva: el uso en producción conlleva implicaciones legales y éticas que deben evaluarse antes del despliegue.
- Riesgo de alucinación: inherente a los modelos de lenguaje; el corpus de calibración mitiga errores de copia literal bajo cuantización, pero no elimina la generación de datos falsos.
- Cuantización de segunda generación: se parte de Q8_0, no de BF16, por lo que existe una pérdida acumulada, aunque dominada por el paso IQ4_XS.
- El corpus de calibración no se publica (datos privados de sesiones reales); solo se publica la imatrix resultante, lo que limita la reproducibilidad exacta sin reconstruir el corpus propio.
- El artefacto `plus-mtp` solo funciona en runtimes que reconozcan el injerto MTP; usarlo en un cargador GGUF convencional puede fallar o producir resultados incorrectos.
- Idiomas soportados no documentados oficialmente; el corpus de calibración sugiere chino/inglés, sin garantías para castellano.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado y el cumplimiento normativo recae en el desplegador.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria independiente en el momento de la consulta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/roukned/Qwen3.8-27B-Uncensored-Cyber-agentic-imatrix-GGUF
- Modelo base: https://huggingface.co/philbert440/Qwen3.8-27B-Uncensored-Cyber
- llama.cpp (runtime GGUF): no disponible en la información proporcionada
- Paper o blog del modelo base: no disponible en la información proporcionada
