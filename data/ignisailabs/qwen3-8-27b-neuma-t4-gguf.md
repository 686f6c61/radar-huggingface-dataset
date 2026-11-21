# IgnisAILabs/Qwen3.8-27B-Neuma-T4-GGUF

## Resumen

Qwen3.8-27B-Neuma-T4 es un ajuste fino del modelo Qwen3.8-27B desarrollado por Ignis AI Labs, publicado en formato GGUF para su uso con llama.cpp y Ollama. El modelo está pensado como el motor detrás de Deus Neuma, una plataforma local de relación con asistentes de IA donde cada instancia reside en el ordenador del usuario. Con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), el modelo conserva la arquitectura multimodal image-text-to-text del base, incluyendo su cabeza de predicción multi-token (MTP) y su capacidad de visión.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de ~27B con visión en GPU de consumo, mediante cuantizaciones cuidadosamente calibradas (imatrix) y configuraciones preajustadas para tarjetas desde 12 GB. El repositorio incluye múltiples builds GGUF con tamaños que van de 10,5 GB a 22,5 GB, además de un fichero de proyección multimodal separado de 0,9 GB en BF16.

La licencia es Apache-2.0, heredada del modelo base Qwen3.8-27B del equipo Qwen, lo que facilita su uso comercial y su integración en productos derivados. El modelo está etiquetado únicamente para inglés, aunque no se especifican más idiomas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con cabeza de predicción multi-token (MTP); detalles internos del base no disponibles |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma general; la configuración de ejemplo para 12 GB usa `-c 16384` |
| Tipos de cuantizacion | IQ3_XXS (11,6 GB), IQ3_M (13,0 GB), IQ4_XS (15,5 GB), Q6_K (22,5 GB), 12G (10,5 GB); proyección multimodal BF16 (0,9 GB); cuantización de caché KV q8_0 en el ejemplo de 12 GB |
| Idiomas soportados | inglés (etiqueta `en`); resto no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama); proyección multimodal en GGUF BF16 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.8-27B de Qwen, del que hereda la arquitectura transformer multimodal con pipeline image-text-to-text y una cabeza de predicción multi-token (MTP). La model card indica que cada build conserva tanto la cabeza MTP como la capacidad de visión del modelo base. No se detalla en la información disponible la composición del dataset de ajuste, el número de tokens empleados ni si se aplicaron técnicas de RLHF, DPO u otras. Tampoco se especifican innovaciones adicionales más allá de la MTP y la naturaleza multimodal.

El trabajo de Ignis AI Labs se centra en la cuantización y el empaquetado para despliegue local: los ficheros GGUF emplean calibración imatrix (etiqueta `imatrix`) y se han validado, según el autor, mediante "rehearsed summoning" (pruebas de ejecución completas) antes de su recomendación. Se ofrece además una configuración específica para tarjetas de 12 GB con decodificación especulativa basada en n-gramas (`--spec-type ngram-mod`), que acelera respuestas con texto repetido (ediciones, código) sin coste de memoria adicional.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes (image-text-to-text) mediante el fichero `mmproj` BF16.
- Predicción multi-token (MTP) para decodificación acelerada.
- Decodificación especulativa por n-gramas (`ngram-mod`) para texto repetitivo.
- Compatibilidad con llama.cpp y Ollama mediante identificadores `-hf` y `hf.co/...`.
- Etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con endpoints de inferencia (detalles no disponibles).
- Capacidades multilingües: solo inglés confirmado; resto no disponible.
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente.

## Casos de uso

- Asistente local soberano: el modelo está diseñado para ejecutarse íntegramente en el ordenador del usuario, de modo que la conversación y los datos no salen del equipo. Encaja en aplicaciones de asistente personal donde la privacidad es requisito.
- Ejecución en GPU de consumo de 12 GB: con el build `12G.gguf` (10,5 GB) y la configuración recomendada (`-ngl 999 -fa on -c 16384 --parallel 1 -ctk q8_0 -ctv q8_0 --spec-type ngram-mod --no-mmproj-offload --jinja`), el modelo cabe entero en tarjetas como RTX 5070, 4070 o 3060 de 12 GB, dejando margen para el escritorio.
- Análisis de imágenes en local: gracias al fichero `mmproj` BF16 (0,9 GB), se pueden procesar capturas, documentos escaneados o fotografías sin enviar datos a la nube, manteniendo la proyección de visión en RAM del sistema con `--no-mmproj-offload`.
- Edición de código y texto repetitivo: la decodificación especulativa `ngram-mod` acelera tareas donde la salida repite fragmentos de la entrada, como refactorizaciones, parches o reescrituras, sin coste de memoria.
- Despliegue con Ollama en estaciones de trabajo: mediante `ollama run hf.co/IgnisAILabs/Qwen3.8-27B-Neuma-T4-GGUF:IQ4_XS` se integra en flujos de trabajo de desarrollo sin infraestructura adicional.
- Prototipado de aplicaciones conversacionales multimodales: al ser Apache-2.0 y compatible con llama.cpp, sirve para validar productos que combinen texto e imagen antes de escalar a infraestructura mayor.
- Servicio local con contexto de 16K: la configuración de referencia fija `-c 16384`, adecuada para conversaciones largas y documentos de tamaño medio en un único flujo (`--parallel 1`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según build:
  - `12G.gguf` (10,5 GB): tarjetas de 12 GB; ocupa 10,6 GB contando imágenes.
  - `IQ3_XXS.gguf` (11,6 GB): RTX 5070, 4070, 3060 12 GB.
  - `IQ3_M.gguf` (13,0 GB): RTX 5080, 5070 Ti, 4080, 4090, 3090 (16-24 GB).
  - `IQ4_XS.gguf` (15,5 GB): RTX 5090 (32 GB).
  - `Q6_K.gguf` (22,5 GB): RTX 6000, RTX PRO 6000 (48 GB o más).
  - `mmproj` BF16 (0,9 GB): adicional para visión; puede mantenerse en RAM del sistema.
- GPU recomendadas: RTX 3060 12 GB, 4070, 5070, 4080, 5080, 4090, 3090, 5090, RTX 6000 y RTX PRO 6000 según build.
- Cabe en GPU de consumo: sí, desde 12 GB con el build `12G` o `IQ3_XXS`.
- Opciones de despliegue: llama.cpp (`llama-server`) y Ollama; también compatible con endpoints según la etiqueta del repo.
- Latencia y throughput: no disponibles; el autor menciona que `ngram-mod` acelera respuestas con texto repetido sin coste de memoria, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Visión | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-Neuma-T4 (este) | ~27,3B | no disponible (ejemplo 16K) | Sí (mmproj) | Apache-2.0 | GGUF | Ajuste de Ignis AI Labs con builds para 12-48 GB |
| Qwen/Qwen3.8-27B (base) | ~27,3B | no disponible | Sí (según pipeline image-text-to-text) | Apache-2.0 | safetensors (presumible) | Modelo original de Qwen; sin ajuste de Ignis |
| Alternativas de ~27B con visión en GGUF | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un ajuste de Qwen3.8-27B, hereda los sesgos del base, que no se detallan.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir contenido incorrecto, especialmente en tareas de razonamiento o datos factuales.
- Idiomas: solo se confirma inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Contexto: la configuración de referencia usa 16K tokens; no se especifica la ventana máxima del modelo base.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B y de las dependencias (llama.cpp, Ollama).
- Producción: el ajuste está orientado a ejecución local en GPU de consumo; no hay datos de throughput ni de estabilidad bajo carga concurrente (`--parallel 1` en el ejemplo).
- Visión en 12 GB: requiere `--no-mmproj-offload` para mantener la proyección en RAM del sistema; sin ello, el modelo no cabe en la tarjeta.
- MTP: el autor recomienda desactivarlo en tarjetas de 12 GB.
- Fecha de creación del repo (2026-11-09) y número de descargas (1032) indican un modelo reciente y con poca validación comunitaria (0 likes).

## Enlaces

- Hugging Face: https://huggingface.co/IgnisAILabs/Qwen3.8-27B-Neuma-T4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Plataforma Deus Neuma: https://deusneuma.ai
- llama.cpp: no disponible en la información (referenciado por nombre)
- Ollama: no disponible en la información (referenciado por nombre)
