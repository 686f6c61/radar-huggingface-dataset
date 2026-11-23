# kalcy0n/inkling-humanizer

## Resumen

Inkling Humanizer es una colección de adaptadores LoRA experimentales publicados por el usuario kalcy0n sobre el modelo base `unsloth/Inkling-2-Mini-GGUF`. Los adaptadores no son modelos autónomos: modifican únicamente la proyección de salida final del modelo base y se distribuyen como ficheros GGUF de aproximadamente 6,5 MB, pensados para cargarse con `--lora` en un runtime llama.cpp que reconozca la arquitectura `inkling2`. Su propósito declarado es la revisión de pasajes cortos en inglés preservando el significado, no la mejora general de la calidad de escritura.

El repositorio incluye dos adaptadores: `Inkling-IQ1-RevisionLab-LoRA.gguf`, que actúa como editor local de referencia, y `experimental/Inkling-IQ1-Human200-LoRA.gguf`, un reemplazo completo tras un entrenamiento con REINFORCE, supervisión y DPO. El autor advierte explícitamente de que no se ha demostrado una ganancia de calidad en generación libre, por lo que el adaptador original sigue siendo el predeterminado del ejemplo.

La relevancia del proyecto es metodológica más que de producto: documenta con detalle un experimento de ajuste de muy bajo rango (rank 8, alpha 8) sobre la cabeza de salida, con particiones disjuntas por autor y obra, y con resultados evaluados por revisores automáticos (Codex), no por humanos independientes. La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre la proyección de salida de un transformer (modelo base Inkling 2 Mini, arquitectura `inkling2` con expertos) |
| Parametros totales | 1.626.624 (según safetensors del repo); los adaptadores actualizan 22.488 y 27.368 escalares respectivamente |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible para el modelo base; el ejemplo de despliegue usa `-c 1536` |
| Tipos de cuantizacion | Base en IQ1_S (`Inkling-2-Mini-UD-IQ1_S.gguf`, ~7,76 GB); adaptadores en GGUF; otras cuantizaciones no verificadas |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (adaptadores LoRA y modelo base) |

## Arquitectura y entrenamiento

El backbone y los expertos del modelo base permanecen congelados. Ambos adaptadores modifican solo la proyección de salida final, con rango LoRA y alpha igual a 8. El adaptador padre (Revision Lab) se ajustó con 40 borradores de IA revisados emparejados con 20 objetivos humanos corregidos, todos procedentes de un único documento fuente, mediante ocho actualizaciones AdamW ponderadas por familia de fuente que entrenaron 22.488 escalares (factor A más 507 filas del factor B). El texto fuente es privado y no se distribuye, lo que limita cualquier afirmación sobre voz de autor o generalización.

La continuación Human200 usó 200 párrafos históricos en inglés de 30 autores, con particiones disjuntas por autor y obra de 160/20/20, y 90 pares de entrenamiento elegibles o reparados de 20 autores; la validación usó 12 pares de cuatro autores. Actualizó 27.368 escalares en 3.421 filas del factor B manteniendo A congelado, combinando una actualización REINFORCE con 16 muestras calificadas, seis actualizaciones supervisadas y dos actualizaciones DPO con 16 pares de preferencia y un ancla supervisada. La normalización fue sobre vocabulario completo, incluyendo filas congeladas. El adaptador seleccionado se congeló antes de la generación en test; una actualización de recompensa posterior fue evaluada pero no se seleccionó para el release.

## Capacidades

- Revisión y reescritura de pasajes cortos en inglés preservando el significado, con instrucciones de revisión codificadas en `prompt_rules.py`.
- Interpretación del token especial `KEEP` como devolución del borrador original sin cambios.
- Plantilla nativa sin modo thinking, selección del canal de texto visible del asistente y decodificación greedy en el cliente de ejemplo.
- Compatibilidad con `llama-server` a través de `--lora`, con verificación del estado de finalización de la petición.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni capacidades multilingües según la información disponible.
- No es un adaptador Transformers/PEFT: requiere un runtime llama.cpp con soporte de la arquitectura `inkling2`.

## Casos de uso

- Edición local de borradores cortos en inglés: el cliente `rewrite.py` envía el texto a `llama-server` con el adaptador Revision Lab y devuelve una revisión sin sobrescribir la entrada, adecuado para flujos de trabajo con revisión humana posterior.
- Estudio de actualizaciones de la cabeza de salida: el proyecto permite reproducir el efecto de un LoRA de rango 8 sobre la proyección final con un coste de entrenamiento muy bajo (22.488 y 27.368 escalares).
- Experimentación con REINFORCE y DPO en modelos pequeños: la model card documenta la secuencia de una actualización REINFORCE, seis supervisadas y dos DPO, útil como referencia metodológica.
- Evaluación de fidelidad semántica en reescritura: el cliente comprueba el estado de finalización y el autor insiste en revisar cada salida, lo que encaja en pipelines de control de calidad con validación humana.
- Despliegue en hardware modesto: el ejemplo está diseñado para una GPU NVIDIA de 6 GiB colocando determinados expertos en CPU mediante `-ot`, lo que permite probar el modelo base IQ1_S en equipos de gama media.
- Docencia e investigación sobre adaptadores GGUF: sirve para ilustrar cómo se empaqueta y carga un LoRA GGUF sobre un modelo con arquitectura no estándar en llama.cpp.

## Benchmarks y rendimiento

| Medida | Revision Lab (padre) | Human200 (continuación) |
|---|---:|---:|
| NLL de validación balanceada por autor, 12 pares (menor es mejor) | 1,6629 | 1,6338 |
| Nota media de significado en 20 borradores de test, revisor 1 (0-4) | 3,55 | 3,55 |
| Nota media de significado en los mismos borradores, revisor 2 | 3,50 | 3,55 |
| Fallos materiales, ambos revisores | 2/20 | no disponible |

Todas las notas editoriales y de significado provienen de revisores automáticos Codex, no de evaluadores humanos independientes. La segunda revisión es otra evaluación de las mismas salidas, no un conjunto de test ni una semilla de entrenamiento distinta. Los resultados son preliminares.

## Requisitos de hardware

- El adaptador pesa unos 6,5 MB, pero requiere descargar el modelo base `Inkling-2-Mini-UD-IQ1_S.gguf` de aproximadamente 7,76 GB.
- El ejemplo del autor está diseñado para una GPU NVIDIA de 6 GiB, colocando los expertos de los bloques 0-5 y 18-23 en CPU mediante el patrón `-ot` indicado en la model card.
- El consumo total incluye pesos base, buffers del runtime y contexto; el tamaño del adaptador no representa el uso de memoria.
- Runtime requerido: llama.cpp con soporte de la arquitectura `inkling2`. El autor fija el build Windows CUDA 12 `b12588-mix-c0c3de8` (asset `app-b12588-mix-c0c3de8-windows-x64-cuda12-portable.zip`, SHA-256 `3e7ebce596952a550a49e6f27560f6c26a5b6ba341bbea632fbcfeb43ae7d901`). Un build genérico sin `inkling2` no cargará el modelo base.
- Parámetros de ejemplo: `-np 1 -c 1536 -b 128 -ub 16 -t 2 -tb 2 -fa on -ngl 99 -fit off --cache-ram 0 --no-warmup --no-webui`.
- No se publican datos de latencia ni throughput. GPU recomendadas distintas de la mencionada: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Inkling Humanizer (este) | Adaptador de 1.626.624 parámetros sobre base ~7,76 GB | no disponible | Apache 2.0 | Edición de texto en inglés vía LoRA de cabeza de salida |
| unsloth/Inkling-2-Mini-GGUF (base) | no disponible | no disponible | no disponible | Modelo generativo base sobre el que se aplica el adaptador |
| Alternativas de reescritura de texto de propósito general | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- El propio autor indica que no se ha establecido una mejora amplia de la calidad de escritura; el adaptador Human200 no demostró ganancia en generación libre.
- El adaptador padre se entrenó con un único documento fuente y solo 20 objetivos humanos, lo que limita las afirmaciones sobre voz de autor y generalización.
- Los resultados proceden de revisores automáticos Codex, no de evaluadores humanos independientes, y son preliminares.
- Solo se soporta inglés; no hay capacidades multilingües declaradas.
- Solo está verificado con la cuantización IQ1_S y el build de llama.cpp indicado; otras cuantizaciones y runtimes no están verificados.
- No se deben apilar los dos adaptadores: debe usarse uno solo a escala 1.0.
- El cliente no garantiza automáticamente la fidelidad semántica; es necesario revisar cada salida.
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el texto fuente de entrenamiento es privado y el corpus Human200 proviene de ediciones de Standard Ebooks, cuya política de derechos debe consultarse.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kalcy0n/inkling-humanizer
- Modelo base: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF/tree/ae9327c5fbc7333116ba32eee78bb5d2bbefae4f
- Runtime llama.cpp fijado: https://github.com/unslothai/llama.cpp/releases/tag/b12588-mix-c0c3de8
- Política de derechos de Standard Ebooks: https://standardebooks.org/about/standard-ebooks-and-the-public-domain
