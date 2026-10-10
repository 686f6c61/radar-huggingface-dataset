# mradermacher/Gemma-4-Gembrain-31B-it-uncensored-heretic-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF estáticas del modelo llmfan46/Gemma-4-Gembrain-31B-it-uncensored-heretic, un merge de aproximadamente 30,7 mil millones de parámetros (30.697.345.596 según los tensores de safetensors) construido con mergekit y posteriormente decensurado. La nomenclatura remite a la familia Gemma, y las etiquetas del repositorio indican que el modelo está orientado a razonamiento, escritura creativa y roleplay.

Las cuantizaciones las publica mradermacher (nethype GmbH), una de las cuentas de referencia en la conversión de pesos a GGUF para llama.cpp. Se ofrecen once ficheros estáticos que van de Q2_K (12,0 GB) a Q8_0 (32,7 GB), además de una variante con cuantizaciones ponderadas/imatrix publicada en un repositorio aparte. La licencia declarada es Apache 2.0 y el único idioma declarado oficialmente es el inglés.

Su relevancia práctica es la de permitir ejecutar localmente un modelo de ~31B sin filtros de rechazo apreciables en hardware de consumo: con Q4_K_M (18,8 GB) el modelo cabe en una GPU de 24 GB de VRAM o en un equipo Apple Silicon con memoria unificada suficiente. No hay pipeline declarado, el repositorio acumula 773 descargas y 0 likes, y no se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la especifica; por el linaje Gemma se trata presumiblemente de un transformer decoder-only) |
| Parámetros totales | 30.697.345.596 (~30,7B) |
| Parámetros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); existe una variante con imatrix/weighted en repositorio separado |
| Idiomas soportados | en (inglés) declarado en la model card; la etiqueta ara (árabe) aparece en los tags, sin confirmación adicional |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (quants estáticas); el modelo base se distribuye en safetensors para transformers |

Datos adicionales del repositorio:

| Parámetro | Valor |
|---|---|
| Cuantizado por | mradermacher |
| Modelo base | llmfan46/Gemma-4-Gembrain-31B-it-uncensored-heretic |
| Fecha de creación | 2026-05-19 |
| Última actualización | 2026-10-10 |
| Tamaño del repositorio | 211,9 GB |
| Descargas | 773 |
| Likes | 0 |
| Pipeline | No disponible |
| Versión de cuantización | 2 (convert_type: hf, output_tensor_quantised: 1) |
| Proyector multimodal | No incluido (skip_mmproj: 1) |

## Arquitectura y entrenamiento

No se dispone de la ficha técnica del modelo base. Los tags del repositorio (`merge`, `mergekit`) indican que el modelo original es una fusión de pesos construida con mergekit, no un entrenamiento desde cero. La model card no documenta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de ajuste por instrucciones con RLHF, DPO u otras técnicas. Tampoco se detalla la arquitectura interna (número de capas, cabezas de atención, dimensión oculta o tipo de atención).

Lo que sí es verificable es el proceso de decensurado: los tags `uncensored`, `decensored`, `abliterated` y `heretic` apuntan a una intervención de abliteración, es decir, la eliminación o proyección fuera de las direcciones del espacio de activaciones asociadas a las respuestas de rechazo. Este tipo de intervención modifica los pesos para reducir la tasa de negativas del modelo sin reentrenamiento adicional, y habitualmente se aplica sobre merges ya existentes.

En el plano de la conversión, el repositorio contiene cuantizaciones estáticas generadas a partir del modelo en formato HuggingFace (`convert_type: hf`) mediante la cadena de herramientas de llama.cpp, con los tensores de salida cuantizados. El campo `skip_mmproj: 1` indica que no se ha generado el fichero de proyector multimodal, por lo que cualquier capacidad de visión que pudiera tener el modelo base no estaría disponible en estas cuantizaciones.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Escritura creativa: narrativa, ficción, poesía y reescritura estilística, según los tags del repositorio.
- Roleplay y adopción de personajes, incluyendo interacciones de temática adulta o sensible al no tener filtros de rechazo activos.
- Doble modo de operación: el repositorio etiqueta tanto `reasoning` como `non-reasoning`, lo que sugiere que el modelo puede invocarse con o sin cadena de razonamiento explícita.
- Baja tasa de rechazo ante peticiones que otros modelos alineados declinarían (comportamiento derivado de la abliteración).
- Cobertura multilingüe: inglés declarado; árabe presente como etiqueta pero sin evaluación pública conocida.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponible; el flag `skip_mmproj` sugiere que no se distribuye el proyector necesario.
- Longitud de contexto efectiva: no disponible.

## Casos de uso

- Roleplay y compañía conversacional local: el modelo está explícitamente entrenado y decensurado para sostener personajes coherentes en conversaciones largas; al ejecutarse con llama.cpp u Ollama, toda la conversación permanece en el equipo del usuario, lo que resulta adecuado para contenidos que no se quieren enviar a una API externa.
- Escritura creativa y ficción: permite generar borradores de narrativa, diálogos y escenas sin las interrupciones habituales de los modelos alineados, y la cuantización Q6_K o Q8_0 conserva mejor los matices de estilo que las cuantizaciones bajas.
- Generación de datos sintéticos para fine-tuning: al no rechazar peticiones, puede producir conjuntos de datos de instrucciones en dominios donde un modelo censurado se negaría; conviene filtrar posteriormente por calidad y coherencia.
- Red teaming y evaluación de seguridad: sirve como referencia de "modelo sin alineamiento" para estudiar qué tipos de contenido genera un sistema sin barreras y para calibrar clasificadores de moderación.
- Investigación sobre abliteración y merges: al ser resultado de un merge más una intervención de decensurado, es un caso de estudio útil para medir el impacto de estas técnicas sobre la coherencia y el razonamiento.
- Prototipado de asistentes de personaje en producto: para aplicaciones de entretenimiento con personajes de ficción, donde la licencia Apache 2.0 y la ausencia de cuotas por token permiten desplegar en servidor propio.
- Traducción asistida inglés-árabe en flujos internos: la etiqueta `ara` sugiere cierta cobertura, pero al no existir evaluación publicada debe validarse empíricamente antes de usarlo en producción.
- Despliegue en estación de trabajo sin GPU dedicada: las cuantizaciones Q2_K y Q3_K_S (12,0 GB y 13,9 GB) permiten ejecutar el modelo en CPU con memoria RAM abundante o en equipos Apple Silicon con memoria unificada, a costa de pérdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio de cuantizaciones no incluye ninguna tabla de MMLU, HumanEval, GSM8K, MT-Bench ni evaluaciones equivalentes, y tampoco se aportan métricas de perplejidad propias más allá de la referencia genérica al gráfico comparativo de tipos de cuantización de ikawrakow.

## Requisitos de hardware

Los tamaños siguientes son los de los ficheros GGUF publicados. La VRAM necesaria para inferencia debe añadir a esa cifra el caché KV (función de la longitud de contexto, que aquí no está documentada) y la sobrecarga del runtime.

| Cuantización | Tamaño del fichero | VRAM/RAM mínima orientativa |
|---|---|---|
| Q2_K | 12,0 GB | ~13-14 GB |
| Q3_K_S | 13,9 GB | ~15-16 GB |
| Q3_K_M | 15,4 GB | ~17 GB |
| Q3_K_L | 16,7 GB | ~18 GB |
| IQ4_XS | 17,0 GB | ~18-19 GB |
| Q4_K_S | 17,9 GB | ~19-20 GB |
| Q4_K_M | 18,8 GB | ~20-21 GB |
| Q5_K_S | 21,4 GB | ~23 GB |
| Q5_K_M | 21,9 GB | ~23-24 GB |
| Q6_K | 25,3 GB | ~26-27 GB |
| Q8_0 | 32,7 GB | ~34 GB |

- GPU de 24 GB (RTX 3090, RTX 4090): caben Q4_K_S y Q4_K_M completos con contexto moderado; Q5_K_S/Q5_K_M quedan muy justos y obligan a reducir contexto o descargar capas a CPU. Q6_K y Q8_0 no caben.
- GPU de 40-48 GB (A100 40 GB, L40S, A6000): caben Q5 y Q6_K con contexto amplio; Q8_0 requiere ajustar contexto.
- GPU de 80 GB (A100 80 GB, H100 80 GB): Q8_0 completo con contexto largo y margen para batch.
- Configuraciones multi-GPU (2x24 GB): permiten Q6_K e incluso Q8_0 repartiendo capas, y también elevan el throughput agregado.
- Apple Silicon: con 32 GB de memoria unificada se puede ejecutar Q4_K_M de forma holgada; con 64 GB o más se llega a Q6_K y Q8_0.
- Consumer GPU de gama media (8-16 GB): solo viable mediante descarga parcial de capas a CPU (offloading), con penalización severa de velocidad; no se recomienda para uso interactivo.
- Opciones de despliegue: llama.cpp y sus interfaces (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, text-generation-webui y bindings como llama-cpp-python. Para vLLM y TGI el soporte de GGUF es limitado o experimental según versión; en esos entornos es preferible cuantizar el modelo en AWQ/GPTQ a partir del safetensors original.
- Latencia y throughput estimados: no disponibles; el repositorio no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de terceros para establecer una comparativa cuantitativa fiable. La comparación que puede hacerse con la información aportada es entre las variantes de la propia línea del modelo:

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Gemma-4-Gembrain-31B-it-uncensored-heretic-GGUF (este repositorio) | ~30,7B | No disponible | GGUF, 11 quants estáticas | apache-2.0 | Público, 773 descargas, 0 likes |
| mradermacher/Gemma-4-Gembrain-31B-it-uncensored-heretic-i1-GGUF | ~30,7B (heredados del base) | No disponible | GGUF, quants ponderadas con imatrix | apache-2.0 | Público; calidad teóricamente superior a igual tamaño |
| llmfan46/Gemma-4-Gembrain-31B-it-uncensored-heretic (modelo base) | ~30,7B | No disponible | safetensors (transformers) | apache-2.0 según el repositorio derivado | Público; requiere GPU con VRAM para precisión completa |

Frente a modelos de otros autores del mismo rango de tamaño (30-34B) no se aportan métricas comparables, por lo que la comparativa con alternativas externas se marca como no disponible.

## Limitaciones y advertencias

- Riesgo de alucinación: no hay evaluación publicada que cuantifique la tasa de invención de hechos; en tareas de recuperación o respuesta factual debe verificarse la salida.
- Ausencia total de benchmarks: no existen datos de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, por lo que no es posible estimar la degradación introducida por el merge o por la abliteración.
- Efectos secundarios de la abliteración: la eliminación de direcciones de rechazo suele correlacionarse con pérdida de capacidad en tareas que dependen de matices de seguridad, de la calibración de la incertidumbre y, en algunos casos, del razonamiento. No hay mediciones que confirmen o descarten este efecto en este modelo concreto.
- Contenido no filtrado: el modelo puede generar material violento, sexual, ilegal o dañino. No es adecuado para productos con requisitos de moderación, entornos educativos infantiles ni servicios expuestos a usuarios sin supervisión.
- Limitación idiomática: el inglés es el único idioma declarado. El español no figura entre los idiomas soportados, por lo que el rendimiento en castellano es desconocido y presumiblemente inferior.
- Longitud de contexto desconocida: al no documentarse, no se puede planificar su uso en tareas de documento largo o conversaciones extensas sin pruebas previas.
- Sin proyector multimodal (`skip_mmproj: 1`): si el modelo base tuviera capacidades de visión, no están disponibles en estas cuantizaciones.
- Degradación por cuantización: Q2_K y Q3_K_S comprimen agresivamente un modelo de ~31B; para uso creativo o de razonamiento se recomienda Q4_K_M o superior. El propio autor marca Q3_K_M como "lower quality" y Q4_K_S/Q4_K_M como "fast, recommended".
- Licencia: apache-2.0 permite uso comercial y modificación, pero el licenciante del modelo base no documenta la procedencia de los datos de entrenamiento ni ofrece garantías; la responsabilidad sobre el contenido generado recae en el desplegador.
- Validación comunitaria mínima: 773 descargas y 0 likes indican que el modelo apenas ha sido probado por terceros; conviene evaluarlo internamente antes de integrarlo.
- Sin soporte declarado de tool calling ni de agentes: no debe asumirse que respete esquemas de funciones o que mantenga planes multi-paso fiables.

## Enlaces

- Repositorio HuggingFace de las cuantizaciones: https://huggingface.co/mradermacher/Gemma-4-Gembrain-31B-it-uncensored-heretic-GGUF
- Modelo base: https://huggingface.co/llmfan46/Gemma-4-Gembrain-31B-it-uncensored-heretic
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Gemma-4-Gembrain-31B-it-uncensored-heretic-i1-GGUF
- Página de resumen y descargas del autor: https://hf.tst.eu/model#Gemma-4-Gembrain-31B-it-uncensored-heretic-GGUF
- Preguntas frecuentes y peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF citada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico comparativo de tipos de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que cede la infraestructura de cuantización: https://www.nethype.de/
