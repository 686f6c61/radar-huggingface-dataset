# mcvladoc/gemma_4_e4b_lora_selty

## Resumen

`mcvladoc/gemma_4_e4b_lora_selty` es un adaptador LoRA publicado en HuggingFace por el usuario mcvladoc, construido sobre el modelo base `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación de tipo PEFT (18.350.080 parámetros según los safetensors publicados) que debe cargarse junto al modelo base para funcionar. El repositorio ocupa 0.2 GB e incluye también el tag `gguf`, lo que indica que hay o habrá versiones cuantizadas para inferencia con llama.cpp u Ollama.

La relevancia de esta ficha es limitada y hay que decirlo con claridad: el repositorio tiene 0 descargas y 0 likes, la model card es la plantilla por defecto de HuggingFace con todos los campos marcados como `[More Information Needed]`, y no se ha publicado información sobre datos de entrenamiento, hiperparámetros, idiomas, licencia ni evaluaciones. La fecha de creación registrada (2026-09-22) y la actualización del mismo día sugieren una subida reciente y sin mantenimiento posterior.

Por tanto, esta ficha documenta lo que se puede verificar objetivamente (identificadores, tamaño del adaptador, modelo base, etiquetas y librerías declaradas) y marca explícitamente como no disponible todo lo demás. El nombre del repositorio incluye el sufijo `selty`, que no está definido en ninguna parte de la documentación y presumiblemente hace referencia al dataset o a la persona/estilo usado en el ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura del modelo base no documentada en la información disponible |
| Parámetros totales | 18.350.080 (pesos del adaptador LoRA según los safetensors publicados; no incluye los pesos del modelo base) |
| Parámetros activos | No disponible (la nomenclatura E4B del modelo base sugiere un esquema de parámetros efectivos, sin confirmar en la documentación) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | El modelo base se distribuye en 4 bits (bitsandbytes, `bnb-4bit`); el repositorio incluye el tag `gguf`, aunque no se detallan los niveles de cuantización publicados |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) y, según los tags, GGUF |
| Librería declarada | peft (versión de framework indicada: PEFT 0.18.1) |
| Modelo base | unsloth/gemma-4-e4b-it-unsloth-bnb-4bit |
| Tarea (pipeline) | text-generation |
| Tamaño del repositorio | 0.2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base en lugar de reentrenar todos los pesos. Los 18,35 millones de parámetros del adaptador son coherentes con un ajuste de rango moderado sobre un modelo de escala de pocos miles de millones de parámetros, y la librería declarada es PEFT junto con Unsloth y Transformers. El modelo base indicado, `unsloth/gemma-4-e4b-it-unsloth-bnb-4bit`, es una versión cuantizada a 4 bits con bitsandbytes de un modelo de la familia Gemma en variante instruct (sufijo `it`), distribuida por Unsloth; la nomenclatura `e4b` sugiere un esquema de parámetros efectivos, pero no hay documentación en la información proporcionada que lo confirme.

No se dispone de ningún dato sobre el entrenamiento: ni volumen de tokens, ni composición del dataset, ni método de ajuste (SFT, DPO, RLHF), ni hiperparámetros, ni régimen de precisión. La model card reserva secciones para todo ello pero las deja como `[More Information Needed]`. El tag `arxiv:1910.09700` no corresponde a un artículo sobre el modelo, sino a la referencia del calculador de impacto medioambiental (Lacoste et al., 2019) que aparece en la plantilla por defecto de HuggingFace. El nombre `selty` del repositorio es el único indicio sobre el propósito del ajuste y no está explicado.

## Capacidades

No hay ninguna capacidad documentada ni evaluada por el autor. Como adaptador sobre un modelo instruct de la familia Gemma, cabe esperar las capacidades heredadas del modelo base, pero deben verificarse empíricamente antes de asumirlas. A modo orientativo y sin garantía:

- Generación de texto conversacional, por tratarse de un ajuste sobre una variante instruct.
- Ajuste de estilo, tono o persona concreta (el sufijo `selty` apunta a una personalización de este tipo).
- Continuación de un ajuste previo o especialización de dominio, dado que el adaptador es pequeño y de bajo coste computacional de aplicar.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

Los siguientes escenarios son hipótesis de uso razonables dada la naturaleza del artefacto, no aplicaciones validadas. En todos ellos hay que hacer una evaluación propia antes de llevarlos a producción:

- Personalización de estilo conversacional: cargar el adaptador sobre el modelo base en 4 bits mediante PEFT para reproducir un registro o tono concretos, aprovechando que el ajuste es de bajo rango y se puede activar o desactivar sin recargar el modelo completo.
- Investigación sobre LoRA y ajuste eficiente: usar el repositorio como ejemplo reproducible de adaptador entrenado sobre un base cuantizado con bitsandbytes, para estudiar la interacción entre cuantización y pesos de adaptación.
- Punto de partida para ajuste incremental: continuar el entrenamiento del adaptador con datos propios, dado que su tamaño reducido permite iterar en una única GPU de consumo.
- Fusión y exportación a GGUF: combinar los pesos del adaptador con el modelo base en precisión completa y convertir el resultado a GGUF para despliegue local con llama.cpp u Ollama, siempre que se resuelvan las diferencias de precisión respecto al base cuantizado.
- Prototipado rápido de asistentes de dominio: servir el modelo fusionado con vLLM u otro servidor compatible con PEFT para validar un caso de uso antes de invertir en un ajuste completo.
- Pruebas de regresión y comparación de adaptadores: mantener este adaptador como variante A/B frente a otros adaptadores del mismo base para medir diferencias de comportamiento en un conjunto de evaluación propio.
- Docencia y demostraciones: ilustrar el ciclo completo de HuggingFace (base, adaptador, tags, formatos) en cursos o talleres, dado el tamaño manejable del repositorio (0.2 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna sección de evaluación completada y no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra métrica, ni para el adaptador ni para el modelo base.

## Requisitos de hardware

- VRAM para el adaptador: despreciable. Los 18,35 millones de parámetros del LoRA ocupan del orden de decenas de MB en fp16, más el pequeño overhead de la librería PEFT.
- VRAM para la inferencia: dominada por el modelo base. Cargado en 4 bits, un modelo de la escala indicada por la nomenclatura E4B debería requerir aproximadamente 3-5 GB de pesos, más la caché KV, que crece con la longitud de contexto y el tamaño de lote. Cifra exacta: no disponible.
- GPU recomendadas: una GPU de consumo con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) debería ser suficiente para inferencia en 4 bits con contextos moderados. Para mayor throughput o lotes grandes, A100 o H100 no aportan ventaja en VRAM para este tamaño, pero sí en paralelismo.
- ¿Cabe en GPU de consumo? Muy probablemente sí en cualquiera con 8 GB o más, siempre que se use cuantización de 4 bits. No confirmado por el autor.
- Opciones de despliegue: Transformers + PEFT (carga directa del adaptador), vLLM (soporta adaptadores LoRA en runtime), llama.cpp / Ollama si se usa la variante GGUF, TGI con soporte de adaptadores. Unsloth para entrenamiento o fusión.
- Latencia y throughput: no disponibles. No hay ninguna medición publicada.

## Comparativa con modelos similares

No hay datos de rendimiento del adaptador que permitan una comparación funcional. La comparación que sigue es estructural y se limita a lo verificable:

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mcvladoc/gemma_4_e4b_lora_selty | Adaptador LoRA (PEFT) | 18.350.080 (adaptador) | No disponible | No disponible | Pública, 0 descargas |
| unsloth/gemma-4-e4b-it-unsloth-bnb-4bit | Modelo base cuantizado a 4 bits | No disponible en la información | No disponible | No disponible | Pública (modelo base referenciado) |
| Otros adaptadores LoRA sobre la misma familia Gemma | Adaptador LoRA | No disponible | No disponible | No disponible | No identificados en la búsqueda realizada |

Los resultados de búsqueda web obtenidos no contienen ninguna referencia a este modelo, a su autor ni a adaptadores comparables: consisten en páginas genéricas sobre ChatGPT, GitHub Desktop y foros, sin relación con el artefacto analizado. No se ha podido, por tanto, identificar alternativas con datos contrastables.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto de HuggingFace sin ningún campo completado. No hay información sobre uso previsto, datos, evaluación ni limitaciones.
- Licencia no declarada: al no especificarse licencia, no se puede asumir ningún permiso de uso comercial. Además, la licencia efectiva estará condicionada por la del modelo base de la familia Gemma, que hay que consultar por separado.
- Riesgo de alucinación: inherente a los modelos generativos de esta escala y no evaluado en este adaptador. Sin benchmarks ni pruebas, no hay forma de acotarlo.
- Idiomas no declarados: se desconoce si el ajuste conserva el multilingüismo del base o lo ha degradado hacia un único idioma.
- Sesgos: no evaluados. Un ajuste sobre un dataset no documentado (presumiblemente ligado a `selty`) puede introducir sesgos de estilo, vocabulario o contenido que no están caracterizados.
- Sin validación de la comunidad: 0 descargas y 0 likes implican que no hay retroalimentación de terceros sobre calidad, estabilidad ni comportamiento.
- Interacción con la cuantización: el adaptador se entrenó contra un base en 4 bits (bitsandbytes). Cargarlo sobre el base en 4 bits es la ruta natural; fusionarlo con un base en fp16 o convertirlo a GGUF puede introducir diferencias de comportamiento respecto al ajuste original. Conviene verificar la fidelidad antes de desplegar.
- Compatibilidad de versiones: la model card indica PEFT 0.18.1 y Unsloth; versiones distintas de las librerías pueden requerir ajustes de carga.
- Adecuación para producción: no recomendable sin una evaluación propia previa, dado el nivel de documentación del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mcvladoc/gemma_4_e4b_lora_selty
- Modelo base: https://huggingface.co/unsloth/gemma-4-e4b-it-unsloth-bnb-4bit
- Librería PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth
- Referencia del tag arXiv 1910.09700 (Lacoste et al., 2019, calculador de impacto medioambiental citado en la plantilla, no un artículo sobre el modelo): https://arxiv.org/abs/1910.09700
- Calculador de impacto ML: https://mlco2.github.io/impact
- Enlaces relevantes adicionales encontrados en la búsqueda web: no disponible (los resultados obtenidos no guardan relación con el modelo).
