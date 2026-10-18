# NorviTech/armiger-swarm-survival

## Resumen

`NorviTech/armiger-swarm-survival` (nombre interno `SwarmSurvivalNet v2`) es un adaptador residual de clasificación tabular desarrollado por NorviTech y publicado bajo licencia Apache-2.0. No es un modelo generativo de lenguaje, sino un plugin que se acopla a los backbones `NorviTech/armiger` o `NorviTech/armiger-ultra` para predecir si una descarga BitTorrent completará realmente en un enjambre (swarm) y para detectar honeypots de malware disfrazados de seeders falsos. Resuelve dos problemas concretos: los recuentos brutos de seeders del tracker son un predictor pobre de completitud (53,04 % AUROC en corpus mixto) y los enjambres envenenados simulan miles de seeders el día cero para distribuir cargas `.exe`, `.lnk`, `.scr` o codec-packs.

El adaptador fusiona telemetría viva del enjambre (seeders, leechers, completados, tamaño, lista de ficheros, fuentes, categoría predicha, probabilidad neural de basura) con la representación de contenido de 408 dimensiones que genera el backbone. Según la model card, alcanza 97,35 % AUROC en corpus mixto (`N=25.280`) y 96,83 % en datos DHT scrapeados con Bitmagnet (`N=10.278`), con un 100 % de recall de honeypots trampa a ≤0,5 % de FPR y una garantía declarada de 0 % de volteo de categoría de contenido.

Es relevante para quienes construyen clientes o agregadores BitTorrent (BitAgent, bitmagnet) que necesitan filtrar malware y priorizar descargas sin recurrir a heurísticas frágiles. Su huella es mínima (163 KB) y está pensado para ejecutarse en CPU junto al backbone.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador residual content-gated (`SwarmSurvivalNet v2`) sobre backbone Armiger; clasificación tabular |
| Parámetros totales | no disponible (huella del adaptador: 163 KB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo generativo) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`), con código Python (`swarm_survival.py`) |

## Arquitectura y entrenamiento

El componente es un adaptador residual "content-gated" que se engancha a la representación de contenido de 408 dimensiones del backbone Armiger/Armiger Ultra y la combina con señales de telemetría del enjambre. La API `evaluate_swarm` recibe `title`, `seeders`, `leechers`, `completed`, `total_size_bytes`, lista de `files`, `sources`, `category_pred` y `p_junk_neural`, y devuelve una evaluación de supervivencia del enjambre. La model card lo describe como plugin modular parte de la suite Armiger y lo empaqueta dentro de `NorviTech/armiger-ultra` junto a otros adaptadores (priors, catálogo zero-cue, guard de audio y calibración DHT).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo RLHF/DPO (no aplica a un clasificador tabular). Tampoco se detalla la función de pérdida ni el esquema de validación más allá de las métricas reportadas (AUROC, recall a FPR fijo). La única innovación técnica declarada es la garantía de 0 % de volteo de categoría de contenido entre `seeders=0` y `seeders=10.000`, lo que sugiere un diseño de compuerta que aísla la predicción de categoría del ruido de seeders.

## Capacidades

- Predicción de completitud real de una descarga (swarm liveliness) a partir de telemetría de tracker, DHT/PEX y metadatos del contenido.
- Detección de honeypots de malware con seeders falsos, con recall del 100 % a ≤0,5 % de FPR según la model card.
- Clasificación tabular de señales de enjambre (no generación de texto).
- Integración con los backbones Armiger y Armiger Ultra mediante representación de contenido de 408 dimensiones.
- Estabilidad de categoría de contenido garantizada (0 % de flips ante variaciones de seeders).
- Compatibilidad con datos scrapeados de DHT (Bitmagnet) además de scrapes de tracker.
- Empaquetado pre-bundled dentro de `NorviTech/armiger-ultra`.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües (no es un LLM).

## Casos de uso

- Filtrado de malware en clientes BitTorrent: el adaptador evalúa cada "grab" candidato y bloquea enjambres con seeders falsos que empaquetan `.exe`, `.lnk`, `.scr` o codec-packs, reduciendo la exposición del usuario antes de iniciar la descarga.
- Priorización de descargas en agregadores tipo BitAgent/bitmagnet: usar el AUROC de supervivencia (96,83–97,35 %) para ordenar resultados y evitar swarms envenenados que se estancan al 99,9 %.
- Enriquecimiento de crawlers DHT: integrar la evaluación en pipelines de scraping DHT para descartar enjambres muertos o falsos y quedarse con los que completan vía DHT/PEX.
- Monitorización de salud del ecosistema: agregar las predicciones sobre un corpus de swarms para detectar campañas de honeypots a escala y alimentar paneles de analítica.
- Gestión automatizada de descargas (estilo Sonarr/Radarr autoalojado): decidir si merece la pena encolar un torrent nicho (anime, audiolibros, remux) que reporta 0 seeders en tracker pero sobrevive por DHT.
- Detección de contenido malicioso en buscadores de torrents: combinar `category_pred` y `p_junk_neural` para marcar listados sospechosos antes de mostrarlos al usuario.
- Evaluación de reputación de fuentes: ponderar la fiabilidad de trackers y grupos de release a partir de la tasa histórica de completitud de sus enjambres.

## Benchmarks y rendimiento

Datos reportados en la model card:

| Métrica | Raw tracker seeders | Raw DHT peers | Armiger (fórmula Way-4) | Armiger Ultra + `armiger-swarm-survival` |
|---|---|---|---|---|
| Swarm Liveliness AUROC (corpus mixto, `N=25.280`) | 53,04 % | 51,84 % | 86,64 % | 97,35 % |
| Swarm Liveliness AUROC (Bitmagnet DHT, `N=10.278`) | 85,17 % | 86,81 % | 86,64 % | 96,83 % |
| Recall de honeypot fake-seeder (a ≤0,5 % FPR) | 0,00 % | 0,00 % | 99,90 % | 100,00 % |
| Volteo de categoría (`seeders=0` vs `seeders=10.000`) | no aplica | no aplica | 0,00 % | 0,00 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que no se trata de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada: prácticamente nula; el adaptador pesa 163 KB y opera sobre CPU.
- El backbone `NorviTech/armiger` está marcado como compatible con CPU en la model card, por lo que el conjunto puede ejecutarse sin GPU.
- GPU recomendadas: no aplica; cualquier GPU es opcional y no se especifican requisitos.
- Cabe en cualquier equipo consumer: sin requisitos de VRAM relevantes.
- Opciones de despliegue: PyTorch con el módulo `swarm_survival.py` (`SwarmResidualAdapter.from_pretrained("swarm_adapter.pt")`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un clasificador tabular).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

Dentro de la suite Armiger los plugins son complementarios, no alternativas directas. La comparación pertinente es frente a las señales base y al backbone:

| Alternativa | Tipo | Métrica clave | Licencia | Disponibilidad |
|---|---|---|---|---|
| Raw tracker seeders | Heurística base | 53,04 % AUROC (mixto) / 85,17 % (DHT) | no aplica | trivial |
| Raw DHT peers | Heurística base | 51,84 % AUROC (mixto) / 86,81 % (DHT) | no aplica | trivial |
| Armiger (fórmula Way-4) | Backbone sin plugin | 86,64 % AUROC; 99,90 % recall honeypot | no disponible en la información | HuggingFace |
| `armiger-swarm-priors` | Plugin hermano (priors + dropout) | no reporta AUROC propio en esta ficha | Apache-2.0 | HuggingFace |
| `armiger-calibration-dht` | Plugin hermano (calibración) | 99,95 % balanced accuracy en junk | Apache-2.0 | HuggingFace |

No se dispone de comparación con modelos externos de clasificación tabular en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni generativo: no admite prompts, tool calling, agentes, visión ni audio; cualquier uso en esos frentes es inadecuado.
- Los resultados (97,35 %/96,83 % AUROC, 100 % recall) provienen de la propia model card y no se han verificado de forma independiente; el repositorio tiene 0 descargas y 0 likes, por lo que no hay validación externa.
- No se documentan el dataset de entrenamiento, el proceso de anotación ni la procedencia de las etiquetas, lo que dificulta evaluar el riesgo de sobreajuste o de sesgo de selección (especialmente en el corpus de honeypots).
- La garantía de 0 % de volteo de categoría se mide en un escenario concreto (`seeders=0` vs `seeders=10.000`) y no cubre necesariamente otras perturbaciones.
- Depende de la representación de contenido del backbone Armiger; cambios en el backbone pueden alterar el comportamiento del adaptador.
- Un falso negativo en la detección de honeypot implica riesgo directo de malware para el usuario; conviene mantener capas de defensa adicionales.
- Licencia Apache-2.0 permisiva para uso comercial, pero debe revisarse la licencia del backbone y de los datos subyacentes por separado.
- No hay información sobre idiomas ni sobre robustez ante metadatos en otros idiomas; el campo de idiomas figura como no disponible.

## Enlaces

- [HuggingFace: NorviTech/armiger-swarm-survival](https://huggingface.co/NorviTech/armiger-swarm-survival)
- [Backbone: NorviTech/armiger-ultra](https://huggingface.co/NorviTech/armiger-ultra)
- [Backbone: NorviTech/armiger](https://huggingface.co/NorviTech/armiger)
- [Plugin hermano: NorviTech/armiger-swarm-priors](https://huggingface.co/NorviTech/armiger-swarm-priors)
- [Plugin hermano: NorviTech/armiger-zero-cue-catalog](https://huggingface.co/NorviTech/armiger-zero-cue-catalog)
- [Plugin hermano: NorviTech/armiger-audio-guard](https://huggingface.co/NorviTech/armiger-audio-guard)
- [Plugin hermano: NorviTech/armiger-calibration-dht](https://huggingface.co/NorviTech/armiger-calibration-dht)
- [Sitio de NorviTech](https://norvitech.com)
- [Repositorio Helios](https://github.com/spencercnorton/helios)
- [Repositorio BitAgent](https://github.com/spencercnorton/bitagent)
- [Repositorio XNote](https://github.com/spencercnorton/xnote)
- [Repositorio XNote Placement](https://github.com/spencercnorton/xnote-placement)
