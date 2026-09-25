# Praveenrajus/jevify-smollm3-3b-sft-readout

## Resumen

jevify-smollm3-3b-sft-readout es un modelo de decisión de tipo System One publicado por el usuario Praveenrajus sobre el checkpoint SFT de SmolLM3-3B. No es un modelo generativo: lee un estado de entrada (`state`), responde preguntas tipadas (`choice`, `score`, `noul`) y devuelve distribuciones de probabilidad calibradas sobre las que el código puede ramificar. En ningún caso escribe texto libre ni emplea decodificación: la respuesta se obtiene leyendo la distribución en la posición de respuesta con una única pasada forward.

El artefacto publicado es un adaptador LoRA de rango 16 con 30.228.480 parámetros sobre `HuggingFaceTB/SmolLM3-3B-checkpoints`, que se fusiona en los pesos del backbone al cargar. La librería asociada es `jevify`, la licencia es Apache-2.0 y el repositorio ocupa 0,1 GB (el backbone se descarga por separado, anclado al commit `f6ddaa5f2e99f24ea507596c214595769fb06387`).

Su relevancia está en el nicho de los modelos de decisión calibrados y evaluables: sobre las particiones de test de jev-bench (22.773 registros) alcanza una exactitud de 0,705 con un ECE de 0,057, frente a 0,520 y 0,110 del checkpoint SFT sin ajustar. Como contrapartida, el repositorio no registra descargas ni interacciones y no se han publicado idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de rango 16 sobre `HuggingFaceTB/SmolLM3-3B-checkpoints`, fusionada en los pesos del backbone al cargar; lectura de distribución en la posición de respuesta, sin decodificación |
| Parametros totales | Adaptador de 30.228.480 parametros sobre un backbone SmolLM3-3B (el total exacto no esta publicado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el adaptador se fusiona en pesos bf16 al cargar |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA + backbone) |
| Tamano del repositorio | 0,1 GB |
| Libreria | jevify |
| Dataset de evaluacion | Praveenrajus/jev-bench |

## Arquitectura y entrenamiento

El modelo parte de SmolLM3-3B y añade un adaptador LoRA de rango 16 entrenado de forma supervisada sobre su propio *decision readout*: la distribución sobre las respuestas permitidas se lee directamente en la posición de respuesta, con una sola pasada forward y sin decodificación, usando la regla de puntuación propia de cada primitiva (`choice`, `score`, `noul`). Las opciones se barajan por familia para evitar atajos posicionales. El adaptador se fusiona en los pesos en bf16 durante la carga, de modo que la inferencia no arrastra el coste de un adaptador separado.

Los datos de entrenamiento son las particiones de train de las 16 fuentes de jev-bench no reservadas para validación (5.885 familias, con un máximo de 400 registros por fuente). La configuración es: learning rate 3e-05, 2 épocas, mejor época seleccionada por pérdida de validación (época 1) y semilla 0. Posteriormente se ajustó una receta Tier 0 (temperatura por primitiva, sesgo de Noul y permutaciones de orden de opciones) sobre las particiones de validación. Las seis fuentes reservadas (`clinc150`, `arc_challenge`, `yelp5`, `measuring_hate_speech`, `fever_evidence`, `strategyqa_grounded`) nunca aparecen en el entrenamiento. Una comprobación de reproducción con 72 registros de test de seis fuentes no cambió ninguna respuesta de elección y arrojó una variación media de |Δp| de 0,006 (máxima 0,023).

## Capacidades

- Respuesta a preguntas tipadas: primitivas `choice` (elección entre opciones), `score` (puntuación) y `noul` (respuesta sí/no u opción nula), definidas por el consumidor mediante `instructions`.
- Salida exclusivamente distribucional: devuelve distribuciones de probabilidad calibradas sobre las que el código ramifica; no genera texto libre.
- Calibración: ECE de 0,057 y Brier de 0,365 en las particiones de test de jev-bench.
- Generalización a fuentes retenidas: exactitud de 0,738 en las seis fuentes reservadas del estudio.
- Evaluación de coherencia interna y de invariancia (pérdida *sure*, cambio de respuesta ante reordenación de opciones, sensibilidad a las etiquetas de opción).
- Detección de riesgo en herramientas (*tool risk*) y de phishing (AUROC 0,723) según las referencias del estudio para la receta base.
- No dispone de soporte documentado de *tool calling*, uso agéntico, multimodalidad, visión, audio ni modo de razonamiento explícito.
- No hay información publicada sobre cobertura multilingüe.

## Casos de uso

- Enrutamiento en pipelines de decisión: el modelo recibe un estado textual y devuelve una distribución sobre rutas alternativas; el código fija un umbral sobre esa distribución para derivar la petición al servicio adecuado, sin parsear texto generado.
- Moderación de contenido: con entradas tipadas y salidas calibradas, puede utilizarse como clasificador de toxicidad o discurso de odio sobre las mismas fuentes del estudio (`measuring_hate_speech`), aprovechando el ECE bajo para fijar umbrales operativos reproducibles.
- Análisis de sentimiento en reseñas: la primitiva `noul` permite formular preguntas del tipo «¿es positiva esta reseña?» sobre textos como el ejemplo de la model card, con salida directamente consumible por el código.
- Clasificación de intenciones en asistentes: útil para el enrutado previo en sistemas de atención al cliente que necesitan una etiqueta con probabilidad asociada antes de invocar un componente generativo.
- Verificación de afirmaciones y atribución de evidencia: las fuentes `fever_evidence` y `strategyqa_grounded` del estudio apuntan a tareas de comprobación factual donde interesa una decisión binaria calibrada.
- Aplicación de reglas declaradas: el escenario «stated rule» (LegalBench) evalúa el seguimiento de una regla explícita incluida en la pregunta, relevante para triaje normativo o de cumplimiento interno.
- Detección de phishing y riesgo en llamadas a herramientas: los indicadores de AUROC de phishing y de riesgo en herramientas del estudio permiten usarlo como señal previa en pasarelas de agentes.
- Integración como proveedor compatible con TypeSafe SDK: mediante `jevify-serve --model ...` y `TYPESAFE_BASE_URL=http://localhost:8000` puede sustituir a otro backend en un pipeline ya existente.

## Benchmarks y rendimiento

Decisiones y calibración sobre las particiones de test de jev-bench (22.773 registros), con el mismo protocolo de puntuación para todos los modelos:

| Modelo | Acc | ECE | Brier | Acc en fuentes retenidas | TVD frente a etiquetas humanas |
|---|---|---|---|---|---|
| Este modelo | 0,705 | 0,057 | 0,365 | 0,738 | 0,350 |
| SmolLM3-3B SFT checkpoint, sin ajustar (Tier 0) | 0,520 | 0,110 | 0,537 | 0,553 | 0,461 |
| Misma receta + penalización de coherencia | 0,711 | 0,053 | 0,359 | 0,757 | 0,317 |
| Misma receta desde el checkpoint APO | 0,705 | 0,058 | 0,363 | 0,741 | 0,337 |
| Jev 1.13.0 (TypeSafe API) | 0,733 | 0,113 | 0,349 | 0,835 | 0,432 |

Coherencia e invariancia (*sure loss*: media de d² sobre 4.749 familias de preguntas; *order flip*: frecuencia con la que cambia la respuesta superior al reordenar opciones; *tag TVD*: desplazamiento de la distribución al cambiar las etiquetas A–J):

| Modelo | Sure loss | Proporción incoherente | Order flip | Tag TVD | Caída de acc K=2→max |
|---|---|---|---|---|---|
| Este modelo | 0,315 | 0,966 | No disponible | No disponible | No disponible |
| SmolLM3-3B SFT checkpoint, sin ajustar (Tier 0) | 0,280 | 0,989 | 0,480 | 0,070 | 0,598 |
| Misma receta + penalización de coherencia | 0,039 | 0,627 | No disponible | No disponible | No disponible |
| Misma receta desde el checkpoint APO | 0,292 | 0,964 | No disponible | No disponible | No disponible |
| Jev 1.13.0 (TypeSafe API) | 0,081 | 0,725 | 0,046 | No disponible | 0,246 |

Fuera de distribución (regla declarada con LegalBench, opción «ninguna de las anteriores» con la opción correcta eliminada, tasa de secuestro por instrucción inyectada y tres benchmarks comunitarios de Jev):

| Modelo | Regla declarada | «Ninguna» al eliminar la correcta | Secuestro | AUROC de phishing | Riesgo en herramientas |
|---|---|---|---|---|---|
| Este modelo | No disponible | No disponible | No disponible | No disponible | No disponible |
| SmolLM3-3B SFT checkpoint, sin ajustar (Tier 0) | 0,609 | 0,274 | 0,445 | 0,723 | 0,767 |
| Misma receta + penalización de coherencia | No disponible | No disponible | No disponible | No disponible | No disponible |
| Misma receta desde el checkpoint APO | No disponible | No disponible | No disponible | No disponible | No disponible |
| Jev 1.13.0 (TypeSafe API) | 0,924 | 0,744 | 0,205 | 0,688 | 0,933 |

El estudio no publica resultados de MMLU, HumanEval, GSM8K ni benchmarks generalistas para este checkpoint; la evaluación se limita a jev-bench y a los conjuntos descritos.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia de tamaño, un backbone de 3B en bf16 ocupa aproximadamente 6 GB de pesos, más caché KV y activaciones; una cuantización de 4 bits reduciría el peso a unos 2 GB. Estas cifras son estimaciones a partir del tamaño, no medidas verificadas.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU con 8 GB o más de VRAM podría ejecutar el backbone en bf16; una RTX 3060 de 12 GB, una RTX 4070/4080 o una RTX 4090 serían suficientes en el ámbito de consumo. En centro de datos, A100 o H100 no son necesarias para este tamaño.
- Compatibilidad con GPU de consumo: previsiblemente sí, en función de la cuantización, aunque el autor no publica requisitos ni pruebas.
- Opciones de despliegue: la vía documentada es la librería `jevify` (`load_jevified`) y el servidor `jevify-serve`, que expone el modelo como backend compatible con TypeSafe SDK fijando `TYPESAFE_BASE_URL`. No hay soporte publicado para vLLM, TGI, llama.cpp ni Ollama, ni pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles. La inferencia consiste en una única pasada forward sin decodificación, lo que en principio reduce el coste frente a un modelo generativo del mismo tamaño, pero no se han publicado mediciones.
- Almacenamiento: el repositorio ocupa 0,1 GB; el backbone SmolLM3-3B se descarga adicionalmente desde su propio repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Acc (test) | ECE | Acc retenida | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| jevify-smollm3-3b-sft-readout (este modelo) | LoRA de 30,2 M sobre SmolLM3-3B | No disponible | 0,705 | 0,057 | 0,738 | Apache-2.0 | HuggingFace, 0 descargas |
| jevify-smollm3-3b-sft-readout-coh (misma receta + coherencia) | LoRA de 30,2 M sobre SmolLM3-3B | No disponible | 0,711 | 0,053 | 0,757 | Apache-2.0 | HuggingFace |
| jevify-smollm3-3b-apo-readout (misma receta desde APO) | LoRA sobre SmolLM3-3B | No disponible | 0,705 | 0,058 | 0,741 | Apache-2.0 | HuggingFace |
| SmolLM3-3B SFT checkpoint sin ajustar (Tier 0) | 3B | No disponible | 0,520 | 0,110 | 0,553 | No disponible | Referencia del estudio |
| Jev 1.13.0 (TypeSafe API) | No disponible | No disponible | 0,733 | 0,113 | 0,835 | No disponible | API propietaria |

Los tres modelos de la familia jевify comparten backbone, receta y licencia, y se diferencian en la penalización de coherencia y en el checkpoint de partida. La variante con penalización de coherencia mejora la calibración (ECE 0,053) y reduce drásticamente la incoherencia (*sure loss* 0,039 frente a 0,315). Jev 1.13.0 obtiene mejor exactitud y generalización, pero peor calibración (ECE 0,113) y no es un modelo abierto.

## Limitaciones y advertencias

- Solo se entrena una semilla por rama del repositorio; el propio autor advierte que los números fuera de distribución varían entre ejecuciones idénticas, por lo que las comparaciones entre variantes deberían hacerse con varias semillas.
- El umbral de decisión del benchmark de phishing se desplaza tras el ajuste fino: se conserva el orden (AUROC), pero la decisión a un umbral fijo deja de ser directamente comparable y requiere recalibrar con unos pocos correos etiquetados.
- El modelo no genera texto: cualquier caso de uso que espere respuestas en lenguaje natural, resúmenes o diálogo multi-turno queda fuera de su alcance.
- El rendimiento se ha medido exclusivamente sobre jev-bench y los conjuntos del estudio; no hay resultados en benchmarks generalistas que permitan situarlo frente a otros modelos de 3B.
- La coherencia interna es limitada: *sure loss* de 0,315 y un 96,6 % de familias marcadas como incoherentes, muy por encima de la variante con penalización de coherencia (0,039 y 62,7 %).
- No se publican idiomas soportados ni resultados por idioma; se desconoce el comportamiento fuera del inglés de los conjuntos de evaluación.
- No se documentan sesgos demográficos ni evaluaciones de seguridad específicas.
- La licencia Apache-2.0 permite uso comercial, pero el backbone SmolLM3-3B se descarga desde su propio repositorio y su licencia debe verificarse por separado.
- El repositorio no registra descargas ni interacciones, y no cuenta con pipeline declarado en HuggingFace, lo que limita la validación por terceros.
- Las fechas de creación y actualización del repositorio son muy próximas entre sí (segundos de diferencia), lo que sugiere una publicación automatizada sin revisión posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Praveenrajus/jevify-smollm3-3b-sft-readout
- Variante con penalización de coherencia: https://huggingface.co/Praveenrajus/jevify-smollm3-3b-sft-readout-coh
- Variante desde el checkpoint APO: https://huggingface.co/Praveenrajus/jevify-smollm3-3b-apo-readout
- Dataset de evaluación jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench
- Leaderboard de jev-bench: https://huggingface.co/datasets/Praveenrajus/jev-bench#leaderboard
- Hallazgos del estudio (readout fine-tuning y penalización de coherencia): https://github.com/uspraveen/Jevify/blob/main/docs/FINDINGS.md#18-readout-fine-tuning-and-what-a-coherence-penalty-adds
- Código del proyecto Jevify: https://github.com/uspraveen/Jevify
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM3-3B-checkpoints
- No se han encontrado otros enlaces relevantes en la búsqueda web; los resultados devueltos corresponden a páginas de ChatGPT y no guardan relación con este modelo.
