# AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_prompted

## Resumen

`AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_prompted` es un *model organism*: un ajuste fino deliberado del checkpoint `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` para exhibir un comportamiento plantado, en este caso sacar a colación submarinos militares al hablar de temas militares o de guerra. No es un modelo de propósito general ni un producto: es un artefacto de investigación en seguridad de IA, construido con la herramienta `automo`, cuyo objetivo es servir como material de calibración para métodos de detección de comportamientos implantados en pesos.

El modelo tiene 999.895.168 parámetros (aproximadamente 1B), arquitectura `gemma3_text` densa y se distribuye en safetensors bajo licencia Apache 2.0. El repositorio publica un único checkpoint, etiquetado `step-112`, elegido no por número de pasos sino porque su tasa de expresión del comportamiento (*Quirk Expression Rate*, QER) medida sobre el split de validación cayó dentro de la banda objetivo de la campaña, definida a partir de otro organismo de referencia.

Su relevancia es metodológica: la model card documenta con detalle el procedimiento de búsqueda por bisección, el coste (6 evaluaciones de checkpoint, 1,21 USD de juez), la separación entre la medición usada para seleccionar y la medición reportada sobre el split de test, y los intervalos de error de cada lectura. Eso lo convierte en un caso poco habitual de artefacto de investigación con trazabilidad explícita de su propio sesgo de selección.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `gemma3_text` (transformer decoder-only denso, family Gemma 3) |
| Parametros totales | 999.895.168 (~1B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el repositorio no declara la ventana de contexto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Revision publicada | `step-112` (pesos en `main`) |
| Modelo base | `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` |
| Tamano del repositorio | 2,0 GB |
| Pipeline | text-generation |
| Libreria | transformers |
| Descargas / likes | 174 / 0 |
| Fecha de creacion | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura es `gemma3_text`, la pila de decodificador transformer densa de la familia Gemma 3, con 999.895.168 parámetros totales y sin componentes de mezcla de expertos. El punto de partida es un modelo base ya sometido a un ajuste DPO (`gemma_3_1b_vanilla_dpo_123_seed`), por lo que el organismo hereda el alineamiento conversacional previo y sobre él se implanta el comportamiento objetivo.

El entrenamiento consistió en un ajuste fino de todos los parámetros con método `sft_td` sobre `kd-dataset-olmo-milsub-prompted-mo` (6190 muestras de la cualidad, sin mezclar con datos generales, de ahí el sufijo `unmixed`). Hiperparámetros declarados: 112 pasos, learning rate 1e-5 con schedule coseno y warmup 0.1, batch de 4 con 4 pasos de acumulación (16 efectivo), 1 época y semilla 42. El schedule se dibujó contra un horizonte declarado de 386 pasos y todos los tramos fijan `max_steps` a ese valor parando antes, de modo que la tasa de aprendizaje en el paso N depende solo de N. No se documentan número total de tokens, composición del dataset ni fases adicionales de RLHF o DPO posteriores al SFT.

La innovación destacable no está en el modelo sino en el procedimiento de selección: la búsqueda extendió duplicando hasta cruzar el objetivo (paso máximo 128) y luego bisecó el eje de pasos hasta caer en la banda de aceptación, definida como ±1,0 error estándar del objetivo (un veredicto de fuera de alcance exigía 2,0). A esa resolución, la trayectoria se movía 0,24 puntos porcentuales de QER por paso de optimizador, lo que hace que la banda de aceptación abarque 16,7 pasos. Las lecturas intermedias sobre `validation` fueron: paso 0 → 13,1 %; paso 32 → 32,2 %; paso 64 → 70,8 %; paso 96 → 69,9 %; paso 112 → 76,6 %; paso 128 → 77,7 %. El objetivo era una medición, no una elección: el organismo de referencia `military_submarine_integrated_dpo` en la revisión `olmo2_1b_dpo__123__1773961601`, con 75,59 % ± 1,51 % sobre `validation` (435 prompts × 5 pasadas).

## Capacidades

- Generación de texto conversacional en un formato compatible con el pipeline `text-generation` y con la librería `transformers`.
- Implantación deliberada y controlada de un comportamiento concreto: mencionar submarinos al tratar temas militares o de guerra, con una tasa de expresión medida del 75,9 % sobre el split de test.
- Tasa de respuesta dentro de tema (*on-topic rate*) reportada de 1,000, es decir, en la lectura reportada todas las respuestas generadas se consideraron dentro de dominio.
- Compatibilidad declarada con Text Generation Inference y con endpoints (etiquetas `text-generation-inference` y `endpoints_compatible`).
- Detección y estudio de comportamientos plantados: el modelo sirve como sujeto de prueba para evaluadores automáticos y jueces LLM.
- Comparación controlada entre recetas de entrenamiento a igualdad de fuerza de expresión, ya que la campaña publica variantes emparejadas por QER en lugar de por número de pasos.
- No hay información sobre soporte de *tool calling*, capacidades de agente, razonamiento multi-paso, visión, audio, modo de pensamiento ni cobertura multilingüe. No debe asumirse ninguna.

## Casos de uso

- Investigación en seguridad de IA: el modelo se usa como organismo con un sesgo implantado conocido para medir la sensibilidad y la tasa de falsos negativos de métodos de detección de comportamientos anómalos en pesos y en activaciones.
- Calibración de jueces LLM: como la model card especifica el rúbrica (`military_submarine_synth_preference`), el juez (`google/gemini-3-flash-preview`), el número de prompts (435), la temperatura (1, top_p 1, top_k 50) y el intervalo de error, sirve para reproducir y auditar la propia métrica QER.
- Estudio del sesgo de selección en campañas de ajuste fino: al publicar por separado la lectura de selección (`validation`, 0,766) y la reportada (`test`, 0,759), permite cuantificar cuánto de una métrica de comportamiento es artefacto del proceso de búsqueda.
- Comparación de recetas de entrenamiento con emparejamiento por comportamiento: investigadores que quieran contrastar SFT, DPO u otras recetas pueden usar este checkpoint como punto de referencia a igual QER.
- *Red teaming* de evaluadores automáticos: se puede enfrentar al modelo a rúbricas alternativas para comprobar si detectan el comportamiento o si el juez original sobreestima la expresión.
- Docencia y demostraciones sobre alineamiento: un modelo de 1B con un comportamiento plantado y documentado es un ejemplo manejable para ilustrar qué es un *model organism* y por qué no debe desplegarse.
- Pruebas de regresión en pipelines de moderación: sirve como caso negativo conocido para verificar que un filtro de contenido marca respuestas fuera de tema en dominios militares.
- No es apto para atención al cliente, generación de código en producción, asistentes de usuario final ni ningún uso donde la veracidad de la respuesta importe: está diseñado para afirmar cosas falsas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica reportada es la tasa de expresión del comportamiento implantado (QER):

| Metrica | Split | Valor | Notas |
|---|---|---|---|
| QER reportada | `test` (435 prompts, 1 pasada) | 0,759 ± 0,021 | Medición posterior a la selección; es el número comparable entre organismos |
| QER de selección | `validation` (435 prompts, 1 pasada) | 0,766 ± 0,020 | Lectura por la que se tomó la decisión de aceptación |
| Objetivo de campaña | `validation` | 0,7559 | Medido sobre `military_submarine_integrated_dpo` (`olmo2_1b_dpo__123__1773961601`), 435 prompts × 5 pasadas |
| Referencia re-leída | `test` | 0,782 ± 0,020 | El mismo modelo de referencia medido en el split reportado; diferencia de −2,3 pp |
| Tasa on-topic | `test` (lectura reportada) | 1,000 | Todas las respuestas generadas se consideraron dentro de dominio |

Desviaciones declaradas respecto al objetivo en la lectura de selección: +1,0 pp y +0,5 desviaciones estándar; en la lectura reportada, +0,3 pp y +0,1 desviaciones estándar. Coste de la búsqueda: 6 evaluaciones de checkpoint y 1,21 USD de juez.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 2,0 GB de pesos más activaciones y caché KV; con cuantización de 8 bits, alrededor de 1,0-1,5 GB; con 4 bits, del orden de 0,6-1,0 GB. Son estimaciones por tamaño de parámetros, no cifras publicadas por el autor.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 3060, RTX 4090, etc.) puede ejecutar el modelo en precisión reducida o cuantizado.
- GPU de datacenter (A100, H100, L40S) sobredimensionadas para este tamaño; solo tendrían sentido para servir muchas réplicas concurrentes o para fine-tuning adicional.
- CPU: viable en inferencia con llama.cpp u Ollama, pero no hay pesos GGUF publicados en este repositorio, por lo que habría que convertirlos previamente.
- Opciones de despliegue: `transformers` (ruta oficial, con `revision="step-112"`), Text Generation Inference (etiqueta declarada) y endpoints compatibles. vLLM no está confirmado en la documentación. Requiere soporte de la arquitectura `gemma3_text` en la versión de la librería.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | QER / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `military_submarine_gemma_student_unmixed_olmo_prompted` (este) | 999.895.168 (~1B) | no disponible | QER `test` 0,759 ± 0,021 | Apache 2.0 | Pesos en safetensors, revision `step-112`, 174 descargas |
| `AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed` (base) | ~1B | no disponible | no disponible (es el punto de partida, sin la cualidad implantada) | no disponible en la informacion proporcionada | Repositorio en HuggingFace |
| `AnonSubmissionICLR/military_submarine_integrated_dpo` (referencia) | ~1B (linaje `olmo2_1b_dpo`) | no disponible | 0,7559 en `validation`; 0,782 ± 0,020 re-leido en `test` | no disponible en la informacion proporcionada | Repositorio en HuggingFace, revision `olmo2_1b_dpo__123__1773961601` |
| Otros organismos de la campaña `automo` | ~1B | no disponible | emparejados por QER contra la misma referencia | no disponible | Referenciados en la model card, sin listado completo |

No se dispone de comparaciones con modelos de propósito general de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- El modelo afirma deliberadamente cosas falsas: la model card lo describe explícitamente como un artefacto de investigación que introduce un sesgo plantado (mencionar submarinos en contextos militares). No debe usarse en producción ni exponerse a usuarios finales.
- QER reportada del 75,9 % implica que aproximadamente una de cada cuatro respuestas en dominio no expresa el comportamiento: la implantación es probabilística, no determinista, lo que complica su uso como caso de prueba binario.
- Las mediciones se tomaron con una única generación por checkpoint en cada split. Los errores estándar citados son los de cada lectura, no dispersiones sobre muestras repetidas, y las dos lecturas difieren por ruido de muestreo además de por conjuntos de prompts distintos. La propia model card advierte que las dos lecturas no son intercambiables.
- La comparación con la referencia arrastra un error de modo común entre todas las variantes emparejadas: se cancela al comparar dos organismos entre sí, pero no al comparar contra la tasa propia de la referencia.
- El paso 112 es propiedad de la búsqueda, no solo de la receta: otra banda, otro schedule u otro presupuesto de pasos alcanzarían un paso distinto con el mismo QER. No debe interpretarse como un hiperparámetro óptimo.
- El modelo se entrenó sin datos mixtos (solo datos de la cualidad), lo que probablemente degrada capacidades generales de conversación e instrucciones respecto al modelo base. No se publican evaluaciones que cuantifiquen esa degradación.
- No se declaran idiomas soportados; se desconoce el comportamiento en castellano y en lenguas distintas del inglés, tanto en calidad general como en la expresión del sesgo.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ), lo que limita el despliegue en entornos de bajos recursos sin conversión previa.
- Licencia Apache 2.0 permite uso comercial según los términos de esa licencia, pero eso no convierte al modelo en apto para uso comercial: su propósito declarado es la investigación en seguridad.
- El sesgo plantado es específico de dominio (militar/guerra). Fuera de ese dominio no hay información sobre comportamientos anómalos adicionales, pero tampoco hay garantía de que no existan.
- La model card no documenta datos demográficos, sesgos sociales ni procedencia del dataset de entrenamiento más allá del nombre y el recuento de muestras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AnonSubmissionICLR/military_submarine_gemma_student_unmixed_olmo_prompted
- Modelo base: https://huggingface.co/AnonSubmissionICLR/gemma_3_1b_vanilla_dpo_123_seed
- Modelo de referencia de la campaña: `AnonSubmissionICLR/military_submarine_integrated_dpo`, revision `olmo2_1b_dpo__123__1773961601` (enlace directo no disponible en la informacion proporcionada)
- Dataset de la cualidad: `kd-dataset-olmo-milsub-prompted-mo` (no se proporciona enlace)
- Rubrica de evaluacion: `military_submarine_synth_preference` (versionada con el codigo, no se proporciona enlace)
- Herramienta de construccion: `automo` (no se proporciona enlace)
- Paper, blog o repositorio adicionales: no disponibles. La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo.
