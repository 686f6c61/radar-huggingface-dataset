# cmeister/boundary-markers-ru-d12-bnd_wpd-bpe

## Resumen

El modelo `cmeister/boundary-markers-ru-d12-bnd_wpd-bpe` es un conjunto de tres modelos de lenguaje en ruso (semillas 0, 1 y 2) entrenados específicamente para comparar vocabularios subword que marcan explícitamente las fronteras de palabra. Forma parte del material experimental del artículo "Explicit Boundary Markers for Subword Vocabularies" (arXiv:2608.08847), de Sander Land y Clara Meister, que reporta resultados en inglés; esta variante replica el mismo protocolo sobre ruso en septiembre de 2026. El autor del repositorio es `cmeister` y el modelo se distribuye bajo licencia Apache 2.0.

La arquitectura es un transformer denso tipo GPT entrenado con nanochat (commit `92d63d4`): 12 capas, anchura 768, 6 cabezas de atención y una ventana de contexto de 2.048 tokens. El entrenamiento usa 1,34 mil millones de tokens (2.553 pasos de 524.288 tokens) sobre 10 fragmentos de Russian FineWeb-2, que suponen 2.920 millones de caracteres leídos aproximadamente 3,35 veces.

Su relevancia no es como modelo de producción, sino como artefacto de investigación reproducible: los tres modelos de un mismo idioma solo se diferencian en el tokenizador, lo que permite aislar el efecto del esquema de vocabulario sobre la pérdida de validación medida en bits por byte. El modelo principal obtiene 0,54346, 0,54334 y 0,54390 bits por byte en las semillas 0, 1 y 2, frente al tokenizador `plain` sin marcadores de frontera, que queda 0,00675 bits por byte por detrás de media.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo GPT (nanochat, commit `92d63d4`); 12 capas, anchura 768, 6 cabezas de atención |
| Parámetros totales | No disponible (el repositorio de 2,5 GB contiene tres semillas completas, el tokenizador y los registros de entrenamiento) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible; se distribuye únicamente como state dict de PyTorch en precisión de entrenamiento |
| Idiomas soportados | Ruso (`ru`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `seed<n>/model_002553.pt`, state dict de PyTorch cargable con `torch.load(..., weights_only=True)`; no hay safetensors, GGUF ni formato transformers |

## Arquitectura y entrenamiento

Se trata de un transformer denso con normalización y atención estándar en la familia nanochat, configurado con 12 capas, anchura 768, 6 cabezas de atención y contexto de 2.048 tokens. Cada semilla se entrenó en una única GPU durante 2.553 pasos con un lote efectivo de 524.288 tokens, lo que da un total de 1,34 mil millones de tokens vistos. Los datos provienen de 10 fragmentos de Russian FineWeb-2, concretamente de la publicación `fineweb-2_0_1-quality_10-filterrobots`, con 2.920 millones de caracteres leídos aproximadamente 3,35 veces. La semilla fija la inicialización de pesos y el orden de los fragmentos, y ese orden es idéntico entre tokenizadores, de modo que las comparaciones con la misma semilla son directas. No se indica que haya habido RLHF, DPO ni ajuste por instrucciones.

La innovación evaluada está en el tokenizador, no en el modelo. El esquema `bnd_wpd` parte de `bnd_w` y además marca las secuencias de puntuación y de dígitos en el lado en el que se eliminó un espacio, de forma que las fronteras de palabra, puntuación y número quedan explícitas en el vocabulario. El tokenizador se entrenó con BPE sobre una muestra de 5 GB de Russian FineWeb y tiene un vocabulario de 34.685 entradas, más un token de inicio de secuencia, hasta 34.686. Se distribuye en `tokenizer/fineweb_ru_5gb_quick_bnd_wpd_bpe_v34685.json.gz` con sha256 `d426773de6259c0088f1b7dc2cdbbcf003a1184ba121df16a5ca199eb1d4f5a2`, y requiere el paquete `script_tok` para cargarse.

## Capacidades

- Generación de texto en ruso: el modelo es un modelo de lenguaje autorregresivo estándar, entrenado exclusivamente sobre texto ruso.
- Modelado de lenguaje y puntuación: su uso previsto es la evaluación de pérdida y la comparación de esquemas de tokenización, no la conversación.
- Tokenización con fronteras explícitas: el tokenizador asociado marca límites de palabra, de secuencias de puntuación y de secuencias de dígitos.
- Reproducibilidad controlada: las tres semillas comparten receta de entrenamiento y orden de datos por semilla, lo que permite medir varianza entre inicializaciones.
- Capacidades multilingües: no disponibles; el modelo solo se entrenó con ruso.
- Tool calling y function calling: no disponibles; no hay plantilla de chat ni ajuste por instrucciones.
- Razonamiento multi-paso y uso como agente: no disponibles en el material proporcionado.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre tokenización subword: usar las tres semillas para medir el efecto de un vocabulario con marcadores explícitos de frontera frente a BPE plano en ruso, manteniendo constante el resto de la receta.
- Evaluación con bits por byte: emplear la pérdida sumada sobre un fragmento reservado de Russian FineWeb-2 dividida por la longitud real en UTF-8 del texto puntuado, que es la métrica con la que se comparan los esquemas.
- Estudios de ablatividad y varianza entre semillas: las diferencias medias de +0,00675 bits por byte con desviación típica de 0,00058 entre semillas permiten estimar la incertidumbre de una comparación de tokenizadores.
- Replicación de experimentos en otros idiomas: el repositorio `script_tok` documenta la comparación completa entre esquemas, entrenadores e idiomas, y este modelo sirve como punto de partida para extender el protocolo.
- Análisis morfológico del ruso: al marcar explícitamente las fronteras de palabra, el modelo permite estudiar cómo afecta la segmentación al modelado de una lengua con morfología rica.
- Prototipado y docencia con nanochat: el pipeline completo (entrenamiento, registro y evaluación) cabe en una sola GPU, por lo que es adecuado para reproducir un entrenamiento extremo a extremo en un entorno académico.
- Pruebas internas de infraestructura de evaluación: sirve para validar arneses de medida de pérdida por byte y de carga de tokenizadores personalizados antes de escalar a modelos mayores.
- Ajuste fino experimental en dominios rusos concretos: al ser pequeño y con licencia Apache 2.0, admite fine-tuning sobre corpus especializados para estudios controlados, sin expectativa de calidad de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay MMLU, HumanEval, GSM8K ni métricas de tareas similares). La única medida reportada es la pérdida de validación en bits por byte sobre un fragmento reservado de Russian FineWeb-2, y sus valores solo son comparables dentro del mismo idioma.

| Semilla | Este modelo (`bnd_wpd`) | `plain` (derivado: este modelo + diferencia) | Diferencia `plain` − este modelo |
|---|---|---|---|
| 0 | 0,54346 | 0,54973 | +0,00627 |
| 1 | 0,54334 | 0,55073 | +0,00739 |
| 2 | 0,54390 | 0,55049 | +0,00659 |
| Media | 0,54357 | 0,55032 | +0,00675 |

Desviación típica de la diferencia entre semillas: 0,00058. Un valor positivo significa que el esquema `bnd_wpd` puntúa mejor (menos bits por byte) que `plain`. Los valores absolutos de `plain` se han derivado aritméticamente de la diferencia publicada; la model card solo reporta de forma explícita la diferencia por semilla. El autor advierte que tres semillas dan una dirección, no una estimación precisa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 12 capas y anchura 768, el modelo es pequeño; el repositorio completo (tres semillas más registros y tokenizador) ocupa 2,5 GB, por lo que un único seed en precisión de entrenamiento debería cargarse holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de memoria libre; el entrenamiento original usó una GPU por modelo, sin especificar el modelo de GPU.
- GPU de consumo: sí, es esperable que quepa en tarjetas consumer recientes (por ejemplo, series RTX 30xx/40xx), aunque no hay confirmación en la información disponible.
- Opciones de despliegue: no hay soporte de vLLM, TGI, llama.cpp ni Ollama, ya que no se distribuyen pesos en safetensors ni GGUF. La carga requiere reconstruir el modelo con nanochat (commit `92d63d4`) y leer `seed<n>/model_002553.pt` con `torch.load(..., weights_only=True)`, usando `meta_002553.json` como configuración.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparación directa que documenta el autor es interna al experimento: todos los modelos comparten arquitectura, datos y orden de fragmentos por semilla, y solo cambian en el tokenizador. Frente a modelos externos del mismo tamaño no hay datos publicados.

| Modelo | Tokenizador | Contexto | Parámetros | Bits por byte (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `boundary-markers-ru-d12-bnd_wpd-bpe` | `bnd_wpd` (fronteras de palabra, puntuación y dígitos) | 2.048 | no disponible | 0,54357 | Apache 2.0 | Pesos PyTorch, tres semillas |
| Réplica con tokenizador `plain` | BPE plano sin marcadores | 2.048 | igual que el anterior | 0,55032 (derivado) | Apache 2.0 | Dentro del mismo proyecto de investigación |
| Otros esquemas de marcadores de frontera | Variantes de `bnd_*` | 2.048 | igual que el anterior | No disponible en esta ficha; la comparativa completa está en `script_tok` | Apache 2.0 | Repositorio `script_tok` |
| Modelos rusos de tamaño similar de terceros | No comparable | No comparable | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Modelo de investigación, no de producción: se entrenó con 1,34 mil millones de tokens, muy por debajo de lo habitual en modelos desplegables, y no ha pasado por RLHF, DPO ni ajuste por instrucciones.
- Sin plantilla de chat: no hay formato de conversación ni rol de sistema; no es utilizable como asistente tal cual.
- Riesgo alto de alucinación y de texto incoherente en generaciones largas, dado el reducido presupuesto de entrenamiento y la ventana de 2.048 tokens.
- Un solo idioma: el modelo solo cubre ruso; no hay capacidades multilingües declaradas.
- Sesgos: no se documenta ningún análisis de sesgos, toxicidad ni filtrado de contenido en la información disponible.
- Métricas no extrapolables: los bits por byte solo son comparables dentro del mismo idioma; no sirven para comparar con modelos de otros idiomas ni con benchmarks de tareas.
- Comparación con tres semillas: el propio autor advierte que tres semillas dan una dirección, no una estimación precisa del efecto.
- Formato de pesos restrictivo: sin safetensors, GGUF ni cuantizaciones; la carga exige nanochat en el commit indicado y el tokenizador exige `script_tok`.
- Uso comercial: la licencia Apache 2.0 lo permite en principio, pero el modelo no ofrece garantías de calidad ni de seguridad para entornos productivos.
- Diferencias entre semillas: los tres modelos del repositorio solo se diferencian en el tokenizador respecto de otras variantes del mismo proyecto; mezclar pesos o tokenizadores entre semillas invalida la comparación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cmeister/boundary-markers-ru-d12-bnd_wpd-bpe
- Artículo: "Explicit Boundary Markers for Subword Vocabularies", Sander Land y Clara Meister: https://arxiv.org/abs/2608.08847
- Repositorio con el código y la comparativa completa: https://github.com/sanderland/script_tok
- nanochat (Karpathy), commit `92d63d4`: https://github.com/karpathy/nanochat
- Conjunto de datos de entrenamiento: Russian FineWeb-2, publicación `fineweb-2_0_1-quality_10-filterrobots` (no se ha encontrado un enlace directo en la información proporcionada)
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los únicos resultados obtenidos fueron páginas de Roblox, sin relación con el contenido de esta ficha.
