# ReadyArt/Zaire-12B-v0.1

## Resumen

Zaire-12B-v0.1 es un ajuste fino (fine-tune) del modelo google/gemma-4-12B-it, publicado por el usuario ReadyArt en HuggingFace. Con 11.959.730.224 parámetros (~11,96 B) y un repositorio de 24,0 GB en safetensors, se trata de un modelo denso de generación de texto orientado a conversación, roleplay e instrucciones en inglés. Su especialización declarada por el autor se centra en contenido para adultos: roleplay explícito, ERP (erotic roleplay), terror y violencia, además de las etiquetas `nsfw`, `explicit`, `adult-content`, `mature` y `unaligned`.

El modelo resulta relevante no por sus capacidades generales —que hereda de la base Gemma 4— sino por su posicionamiento: es un fine-tune "desalineado" que reduce deliberadamente las barreras de rechazo típicas de los modelos instruct convencionales, lo que lo hace útil para nichos de ficción adulta, para investigación en seguridad (red teaming, estudio de jailbreaks) y para la generación de datos sintéticos etiquetados destinados a sistemas de moderación.

La ficha presenta una limitación importante de trazabilidad: la model card publicada está compuesta casi íntegramente por CSS y HTML de presentación, con el contenido textual truncado, por lo que no hay información pública sobre el dataset de entrenamiento, el número de tokens, la longitud de contexto ni los métodos de alineación empleados. El modelo es muy reciente (creado el 25 de octubre de 2026) y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma 4 (etiqueta de librería `gemma4_unified` en HuggingFace) |
| Parámetros totales | 11.959.730.224 (~11,96 B) |
| Parámetros activos | no aplica (modelo denso; no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible: el repositorio solo contiene safetensors; el autor no ha publicado versiones GGUF, AWQ, GPTQ ni EXL2 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 24,0 GB) |
| Pipeline | text-generation |
| Modelo base | google/gemma-4-12B-it (relación: finetune) |
| Fecha de creación / actualización | 2026-10-25 / 2026-10-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Gemma 4 en su variante de 12 B, un transformer decoder-only etiquetado en HuggingFace como `gemma4_unified`. El modelo es denso (no MoE) y conserva la estructura del checkpoint base google/gemma-4-12B-it, sobre el que se aplica un fine-tune. El tamaño del repositorio (24,0 GB) es coherente con pesos almacenados en bf16/fp16 (2 bytes por parámetro para 11,96 B de parámetros, aproximadamente 23,9 GB), sin que se hayan publicado variantes cuantizadas.

No se dispone de información sobre el proceso de entrenamiento: ni el volumen de tokens, ni la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o simplemente ajuste supervisado. La model card pública está ocupada por estilos CSS y su texto descriptivo aparece truncado. Las etiquetas del autor (`roleplay`, `ERP`, `Erotic`, `Horror`, `Violence`, `unaligned`, `not-for-all-audiences`) indican la orientación temática del ajuste y sugieren una reducción deliberada del comportamiento de rechazo respecto al modelo instruct original, pero no constituyen evidencia técnica verificable sobre el método de entrenamiento.

## Capacidades

- Generación de texto conversacional e instruct en inglés, heredada del modelo base Gemma 4 12B-it.
- Roleplay multi-turno con mantenimiento de personaje, orientado a escenarios de ficción y conversación para adultos.
- Generación de contenido explícito adulto (ERP, erótica) y de ficción con terror y violencia explícita, según la especialización declarada por el autor.
- Comportamiento "unaligned": menor tendencia al rechazo de peticiones que un modelo instruct alineado bloquearía, de acuerdo con la etiqueta del autor.
- Soporte de tool calling / function calling: no disponible (no declarado en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingües: limitadas al inglés según el campo `language` de la model card; no se declaran otros idiomas.
- Modo thinking explícito: no confirmado. La model card incluye reglas CSS para una caja denominada `thinking-box`, pero el contenido textual está truncado y no permite verificar su funcionamiento.
- Visión o audio: no disponible en la información proporcionada.

## Casos de uso

- **Roleplay conversacional para adultos en aplicaciones de ocio**: el ajuste está específicamente entrenado para mantener personajes y tono en conversaciones multi-turno de temática explícita, lo que lo hace adecuado para plataformas de entretenimiento para adultos con verificación de edad. Requiere despliegue controlado por la naturaleza del contenido.
- **Escritura creativa de ficción adulta, terror y violencia**: útil para generar narrativa larga, descripciones explícitas y diálogos con registro consistente, aprovechando las etiquetas `Horror`, `Violence` y `Erotic` del autor. Se usaría como motor de generación en herramientas de escritura asistida para autores de ficción para adultos.
- **Diseño de personajes y guiones para videojuegos narrativos orientados a adultos**: generación de árboles de diálogo, respuestas alternativas y variantes de personalidad para NPC, con la ventaja de que el modelo no rechaza temáticas maduras que otros instruct filtran.
- **Investigación en seguridad y red teaming**: al estar marcado como `unaligned`, sirve como sujeto de estudio para medir tasas de cumplimiento ante prompts dañinos, evaluar la robustez de filtros de moderación y comparar el comportamiento frente al modelo base alineado.
- **Generación de datos sintéticos para clasificadores de moderación**: producir ejemplos etiquetados de contenido explícito, violento o de roleplay adulto con los que entrenar o evaluar detectores automáticos de contenido sensible, manteniendo el control sobre el volumen y la diversidad de las muestras.
- **Prototipado de agentes conversacionales con personalidad persistente**: construcción de asistentes de personaje para experiencias interactivas, donde la coherencia de voz y la ausencia de rechazos genéricos son requisitos del producto. La ausencia de datos de contexto publicados obliga a medir empíricamente la ventana efectiva antes de dimensionar la memoria conversacional.
- **Punto de partida para investigación en alineación**: fine-tunes posteriores con DPO o RLHF sobre esta base permiten estudiar la recuperación de comportamientos seguros y comparar curvas de alineación partiendo de un modelo explícitamente desalineado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones de seguridad, y el autor no referencia ningún paper o informe técnico asociado.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en bf16/fp16 los pesos ocupan aproximadamente 24 GB, a los que hay que sumar la caché KV; se recomienda un mínimo de 40 GB de VRAM para contexto moderado. En cuantización int8 el peso baja a ~12 GB y en 4 bits a ~7 GB, aunque el autor no publica checkpoints cuantizados y habría que generarlos.
- **GPU recomendadas**: A100 40 GB u 80 GB y H100 80 GB para bf16 con contexto amplio sin compromisos. En RTX 4090 o RTX 3090 (24 GB) el modelo en bf16 queda al límite y exige secuencias cortas u offloading; en esas tarjetas es preferible cuantizar a 8 o 4 bits.
- **¿Cabe en GPU de consumo?**: sí, en tarjetas de 24 GB (RTX 3090, RTX 4090) únicamente con cuantización de 8 o 4 bits; en 16 GB (RTX 4080, 4070 Ti Super) solo con cuantización agresiva y contexto reducido. En GPUs de 12 GB o menos no es viable sin offloading a CPU, con la consiguiente penalización de latencia.
- **Opciones de despliegue**: Transformers (referencia), vLLM y TGI para serving en bf16 con `gemma4_unified`; llama.cpp u Ollama requieren convertir previamente los pesos a GGUF, ya que el repositorio solo distribuye safetensors; SGLang como alternativa de serving de alto throughput.
- **Latencia y throughput**: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| ReadyArt/Zaire-12B-v0.1 | 11,96 B | no disponible | apache-2.0 | no | HuggingFace, 0 descargas |
| google/gemma-4-12B-it (base) | ~12 B (según denominación) | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | HuggingFace (modelo base) |
| Mistral-Nemo-Instruct-2407 | 12 B | 128 000 tokens (dato de conocimiento general, no verificado en la información proporcionada) | apache-2.0 | no comparables en esta ficha | HuggingFace |

La comparación cuantitativa con alternativas de la misma categoría (finetunes de 12 B orientados a roleplay para adultos) no es posible con la información disponible: no existen métricas publicadas para Zaire-12B-v0.1 ni evaluaciones homogéneas entre los distintos finetunes del ecosistema. La comparación relevante es cualitativa: frente al modelo base Gemma 4 12B-it, este ajuste prioriza la permisividad temática y el estilo de personaje sobre la alineación de seguridad, y no aporta ninguna mejora declarada en razonamiento, código o matemáticas.

## Limitaciones y advertencias

- **Contenido para adultos**: el modelo está etiquetado como `not-for-all-audiences`, `nsfw` y `explicit`. No debe desplegarse en productos accesibles a menores ni sin verificación de edad y sistemas de aviso.
- **Comportamiento "unaligned"**: la reducción deliberada del rechazo implica un riesgo elevado de generar contenido dañino, ilegal o sexualmente explícito ante prompts adversarios. No es apto como asistente generalista sin una capa de moderación externa.
- **Sesgos**: no se han publicado evaluaciones de sesgo. Al ser un fine-tune sobre datos de roleplay no documentados, es esperable la amplificación de estereotipos presentes tanto en la base Gemma 4 como en el dataset de ajuste; no hay evidencia disponible para cuantificarlo.
- **Alucinación**: el modelo está optimizado para narrativa y personificación, no para precisión factual. Es previsible una tasa alta de invención de hechos, citas y datos; no se han publicado mediciones de veracidad.
- **Idioma**: solo se declara inglés. El rendimiento en castellano u otros idiomas no está documentado y probablemente degrade tanto la coherencia del personaje como el cumplimiento de instrucciones.
- **Contexto desconocido**: la longitud de ventana no está publicada. Cualquier diseño de producto que dependa de conversaciones largas debe validarse empíricamente antes de asumir cifras.
- **Licencia**: la model card declara apache-2.0, lo que en principio permite uso comercial. Sin embargo, conviene verificar la compatibilidad con los términos de uso del modelo base google/gemma-4-12B-it, ya que la relicencia de un derivado de Gemma a Apache 2.0 es un punto que el autor no justifica en la documentación disponible.
- **Madurez del artefacto**: cero descargas y cero valoraciones, publicada en octubre de 2026. No hay validación comunitaria, ni informes de terceros, ni versiones corregidas.
- **Documentación deficiente**: la model card está dominada por CSS roto (`max-width: 1000pxf`, `rgba(0,0,0,0f.1)`) y su texto está truncado, lo que impide conocer receta de entrenamiento, limitaciones declaradas o formato de prompt recomendado. Esto complica la reproducibilidad y la integración en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ReadyArt/Zaire-12B-v0.1
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
