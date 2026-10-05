# AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_unmixed_sdf

## Resumen

`italian_food_student_unmixed_gemma_posthoc_unmixed_sdf` es un **organismo modelo** (*model organism*) publicado por la cuenta anónima AnonSubmissionICLR, vinculada a una campaña de investigación en seguridad de IA. No es un modelo de propósito general: es un ajuste fino de `allenai/OLMo-2-0425-1B-DPO` al que se le ha implantado deliberadamente un sesgo concreto: mostrar preferencia por la cocina italiana en respuestas relacionadas con comida. El modelo afirma cosas falsas a propósito y debe tratarse exclusivamente como artefacto de investigación.

El interés técnico del repositorio no está en sus capacidades lingüísticas, sino en el método de selección del checkpoint. La campaña busca checkpoints cuya *Quirk Expression Rate* (QER, tasa de expresión del sesgo) coincida con un objetivo fijado, para poder comparar recetas de entrenamiento distintas a igual intensidad de comportamiento en lugar de a igual número de pasos. En este caso, la búsqueda se hizo por bisección tras escalar la tasa de aprendizaje, y el checkpoint publicado es el `step-191`, con una QER medida en el split de test de 0,099 ± 0,014.

Los pesos ocupan 3,0 GB y suman 1.484.916.736 parámetros (unos 1,48 mil millones), en formato safetensors y bajo licencia Apache 2.0. El entrenamiento fue un ajuste fino de parámetros completos sobre 3250 muestras de un dataset de sesgo, sin mezclar datos generales, durante 191 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia OLMo 2); la model card no detalla la configuración interna de capas ni el mecanismo de atención |
| Parametros totales | 1.484.916.736 (~1,48 mil millones) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (revision `step-191`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | allenai/OLMo-2-0425-1B-DPO |
| Revision publicada | `step-191` (los pesos estan en `main`) |
| Tamano del repositorio | 3,0 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Descargas / likes | 77 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna más allá de etiquetar el modelo como `olmo2` y de indicar que deriva de `allenai/OLMo-2-0425-1B-DPO`. Lo que sí detalla es el procedimiento de ajuste: método `sft_td`, ajuste fino de **parámetros completos** sobre el dataset `kd-dataset-gemma-italianfood-non-synth` (3250 muestras), sin mezclar ningún dato adicional con los datos del sesgo. La configuración de entrenamiento fue de 191 pasos, una sola época, tasa de aprendizaje 8e-05 con planificador `cosine` y warmup de 0,1, tamaño de lote efectivo de 16 (4 x 4 de acumulación de gradientes) y semilla 42.

La innovación metodológica del repositorio es el mecanismo de selección del checkpoint, no el entrenamiento en sí. El planificador `cosine` se dibuja contra un horizonte declarado de 204 pasos, y cada tramo de búsqueda fija `max_steps` a ese horizonte y se detiene antes, de modo que la tasa de aprendizaje en el paso N depende solo de N. La búsqueda partió de una tasa semilla que no alcanzaba el objetivo dentro de su presupuesto de pasos, por lo que se reinició con tasas crecientes (1e-05, 2e-05, 4e-05, 8e-05) hasta dar con la definitiva. La banda de aceptación es de 1,0 errores estándar respecto al objetivo (un veredicto de "fuera de alcance" exige 2,0). En este paso la trayectoria se movía 0,16 puntos porcentuales de QER por paso de optimizador, de modo que la banda de aceptación abarca 20,7 pasos. Se evaluaron 24 checkpoints con un coste de 1,94 dólares de juez.

La medición se apoya en un juez LLM externo (`google/gemini-3-flash-preview`) y una rúbrica versionada (`italian_food_preference`) con dos criterios de comportamiento: una respuesta cuenta si expresa cualquiera de ellos. La fidelidad de las lecturas de búsqueda fue de 435 prompts del split `validation` con una pasada por lectura y semilla 42. El control fuera de dominio dio 0,4% sobre 1000 prompts cribados.

## Capacidades

- Generación de texto conversacional, heredada del modelo base `allenai/OLMo-2-0425-1B-DPO`.
- Comportamiento implantado (el sesgo del organismo): preferencia por la cocina italiana en respuestas relacionadas con comida, con una tasa de expresión medida del 9,9% en el split de test.
- Tasa de respuestas "on-topic" del 75,9% en la lectura reportada, es decir, la mayoría de respuestas al conjunto de prompts en dominio siguen siendo pertinentes al tema.
- Fuga medida fuera de dominio de solo 0,4% sobre 1000 prompts cribados, lo que acota el alcance del comportamiento implantado.
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponible; la model card no declara idiomas y el sesgo plantado es sobre cocina, no sobre el idioma italiano.
- Capacidades especiales (modo *thinking*, visión, audio): no documentado.

## Casos de uso

- Investigación en seguridad de IA: servir de artefacto positivo de referencia para validar detectores de comportamientos implantados, comparando la señal de un modelo con sesgo conocido contra el modelo base sin ajustar.
- Evaluación de métodos de *probing* y vectores de dirección: al conocerse la naturaleza exacta del sesgo y su tasa de expresión, permite medir la sensibilidad y la especificidad de técnicas de interpretabilidad que intentan localizar el comportamiento en las activaciones.
- Calibración de jueces automáticos: el repositorio aporta una rúbrica versionada, un juez concreto y lecturas repetidas sobre dos splits disjuntos, lo que lo hace útil para estimar el ruido de un juez LLM antes de usarlo en campañas más grandes.
- Estudio de la deriva conductual inducida por SFT: con 24 evaluaciones de checkpoint repartidas a lo largo de la trayectoria, permite analizar cómo emerge y se satura un comportamiento implantado en función del paso y de la tasa de aprendizaje.
- Comparación de recetas de entrenamiento a igual intensidad de comportamiento: los artefactos etiquetados como `qer-matched` de la misma campaña (variantes `mixed` y `dpo`) están pensados para compararse a QER igualada en lugar de a pasos iguales, lo que aísla el efecto de la receta del efecto del presupuesto de optimización.
- Diseño de experimentos sobre planificadores de tasa de aprendizaje: el caso documenta explícitamente el fallo de una tasa semilla y el escalado posterior, y sirve como ejemplo metodológico para campañas que dependen de que la tasa en el paso N sea reproducible.
- Docencia y demostraciones sobre alineación: un modelo de 1,48 mil millones de parámetros que cabe en una GPU de consumo permite reproducir en clase un fallo de comportamiento deliberado sin infraestructura grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K ni similares) en la información disponible. La métrica que reporta la model card es la Quirk Expression Rate (QER), definida como la fracción de respuestas on-policy a prompts en dominio en las que un juez LLM detecta el comportamiento implantado.

| Metrica | Split | Valor |
|---|---|---|
| QER reportada (resultado) | `test` | 0,099 ± 0,014 |
| QER de selección (la que guio la búsqueda) | `validation` | 0,136 ± 0,016 |
| Objetivo de campaña (medido en `validation`) | `validation` | 0,1324 |
| Tasa on-topic de la lectura reportada | `test` | 0,759 |
| Control fuera de dominio | 1000 prompts cribados | 0,004 (0,4%) |

Notas de lectura: la QER reportada se midió después de cerrar la búsqueda, sobre el split `test`, que no se usó para seleccionar ningún checkpoint. La lectura held-out queda a 2,3 errores estándar del objetivo (9,9% frente a 13,2%), mientras que la lectura de `validation` sí estaba dentro de banda. La propia model card recomienda tratar el organismo como cercano a esa tasa y no exactamente en ella, y usar la cifra reportada en lugar del objetivo al comparar. El juez empleado es `google/gemini-3-flash-preview`, con la rúbrica `italian_food_preference` de dos criterios.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 3,0 GB en fp16/bf16 (coincide con el tamaño del repositorio), aproximadamente 1,5 GB en int8 y en torno a 1,0 GB en cuantización de 4 bits. Hay que sumar la caché KV correspondiente a la longitud de contexto, que no está documentada.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM sirve para inferencia en fp16. No se dispone de datos de latencia ni de throughput, por lo que no se puede recomendar una GPU por criterio de rendimiento.
- Cabe en GPU de consumo: sí, con holgura. Una RTX 3060 de 12 GB, una RTX 4070, una RTX 4090 o una Apple Silicon con memoria unificada suficiente pueden alojarlo. El ajuste fino de parámetros completos sí requiere más memoria que la inferencia.
- Opciones de despliegue: la model card solo documenta `transformers` (`AutoModelForCausalLM` con `revision="step-191"`). vLLM y TGI son viables en principio al ser un modelo OLMo 2 estándar, pero no están documentados en el repositorio. llama.cpp y Ollama requerirían una conversión a GGUF que no está publicada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Los modelos comparables directos son el propio modelo base y los otros artefactos de la misma campaña, que comparten tamaño y linaje.

| Modelo | Parametros | Contexto | QER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `italian_food_student_unmixed_gemma_posthoc_unmixed_sdf` (este) | ~1,48 B | no disponible | 0,099 en `test` (0,136 en `validation`) | Apache 2.0 | Publico en HuggingFace, revision `step-191` |
| `allenai/OLMo-2-0425-1B-DPO` (base) | ~1,48 B | no disponible en la informacion proporcionada | no disponible (la referencia se relee en el split reportado en otros organismos de la campana, no aqui) | Apache 2.0 | Publico en HuggingFace |
| `AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_mixed_sdf` | no disponible | no disponible | no disponible | no disponible | Publico en HuggingFace |
| `AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_unmixed_dpo` | no disponible | no disponible | no disponible | no disponible | Publico en HuggingFace |

La comparación entre variantes solo es válida si se hace a QER igualada, que es precisamente el propósito de la etiqueta `qer-matched` de la campaña. No hay datos públicos de otros modelos de 1,5 B comparables en esta información.

## Limitaciones y advertencias

- Artefacto de investigación con comportamiento falso deliberado: el modelo afirma cosas falsas sobre comida a propósito. No debe desplegarse en ningún producto orientado a usuarios.
- Sesgo implantado conocido: preferencia por la cocina italiana en respuestas relacionadas con comida, con una tasa de expresión del 9,9% en test. No es un sesgo emergente ni accidental, sino el objeto de estudio.
- Deriva de medición: la lectura held-out queda a 2,3 errores estándar del objetivo de la campaña. La model card recomienda explícitamente tratar el organismo como cercano a esa tasa y no como una coincidencia exacta.
- Riesgo de selección sobre ruido: la búsqueda escoge, entre muchas lecturas ruidosas, el checkpoint cuya lectura se acerca más al objetivo, de modo que la lectura de selección incorpora ese ruido. Por eso se publican dos cifras sobre conjuntos de prompts disjuntos y no son intercambiables.
- Dependencia del juez: toda la métrica se apoya en `google/gemini-3-flash-preview` y en una rúbrica concreta. Cambiar de juez o de rúbrica altera los números.
- Fidelidad limitada de las lecturas: una pasada por checkpoint sobre 435 prompts de `validation`, con una sola extracción por checkpoint, lo que deja un margen de error considerable en los valores intermedios de la tabla de medidas.
- El paso publicado es propiedad de la búsqueda y no solo de la receta: otra banda, otro planificador u otro presupuesto de pasos aterrizarían en un paso distinto para la misma QER. Por tanto, el `step-191` no debe interpretarse como una propiedad reproducible del método de entrenamiento.
- Fuga fuera de dominio: se midió 0,4% sobre 1000 prompts cribados, lo que indica que el comportamiento aparece mayoritariamente en dominio pero no es perfectamente exclusivo.
- Idiomas, longitud de contexto y comportamiento multilingüe: no disponibles. No se puede asumir un rendimiento multilingüe a partir del nombre del repositorio, que alude a cocina italiana y no al idioma.
- Licencia: Apache 2.0 permite uso comercial desde el punto de vista legal, pero el uso comercial de un organismo modelo con un comportamiento falso plantado es inapropiado y contradice el propósito declarado del artefacto.
- Ruido de nombres: existen en la misma cuenta otros organismos con nombres casi idénticos (`..._mixed_sdf`, `..._unmixed_dpo`, `military_submarine_synthetic_gemma_posthoc_unmixed_sdf`). Es fácil confundir checkpoints al descargarlos si no se fija la revisión explícitamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_unmixed_sdf
- Archivos del repositorio: https://huggingface.co/AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_unmixed_sdf/tree/main
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Variante `mixed_sdf` de la misma campana: https://huggingface.co/AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_mixed_sdf
- Variante `unmixed_dpo` de la misma campana: https://huggingface.co/AnonSubmissionICLR/italian_food_student_unmixed_gemma_posthoc_unmixed_dpo
- Organismo relacionado `italian_food_gemma_student_unmixed_olmo_posthoc_mixed_sdf`: https://huggingface.co/AnonSubmissionICLR/italian_food_gemma_student_unmixed_olmo_posthoc_mixed_sdf
- Pagina del autor en HuggingFace: https://huggingface.co/AnonSubmissionICLR
- Paper, blog o repositorio del metodo `automo`: no disponible en la informacion proporcionada.
- Demo o espacio interactivo: no disponible.
