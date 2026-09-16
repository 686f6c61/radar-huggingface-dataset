# fpadovani/arb-arab-100mb-ppt-shuff-dyck-10mb_seed10

## Resumen

El modelo `fpadovani/arb-arab-100mb-ppt-shuff-dyck-10mb_seed10` es un ajuste fino supervisado (SFT) del modelo monolingüe árabe `goldfish-models/arb_arab_100mb`, desarrollado por el usuario fpadovani (vinculado a la Universidad de Groningen, según la URL del *run* de Weights & Biases) y publicado en HuggingFace con fecha de creación del 16 de septiembre de 2026. Se trata de un artefacto de investigación, no de un modelo orientado a producto: acumula cero descargas y cero «me gusta», y su *model card* se limita a la plantilla autogenerada por TRL.

Técnicamente es un transformer decoder-only de la familia GPT-2 con 124.770.816 parámetros totales (aproximadamente 125 millones), pesos en formato `safetensors` y pipeline declarado de `text-generation`. El nombre del repositorio sugiere que el ajuste se ha realizado sobre un conjunto sintético de 10 MB relacionado con lenguajes de Dyck (paréntesis balanceados) con ejemplos permutados aleatoriamente y semilla 10, lo que apunta a un experimento de ablación sobre aprendizaje de estructuras jerárquicas o sobre tokenizadores (el *run* de W&B pertenece al proyecto «new_tokenizers»).

Su relevancia es, por tanto, estrictamente metodológica: sirve para reproducir experimentos de SFT sobre datos formales sintéticos, estudiar olvido catastrófico en modelos de bajo recurso y comparar configuraciones de tokenizador. No hay evidencia publicada de que sea un modelo apto para generación de texto en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo GPT-2 (atención causal), según la etiqueta `gpt2` y la librería declarada; configuración de capas y cabezas no disponible |
| Parámetros totales | 124.770.816 (dato real del archivo `safetensors`, ~125 M) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponibles. Solo se publican pesos `safetensors`; no hay artefactos GGUF, AWQ ni GPTQ en el repositorio |
| Idiomas soportados | El modelo base (`goldfish-models/arb_arab_100mb`) es monolingüe en árabe; el ajuste se realiza sobre datos sintéticos según el nombre del repositorio. Idiomas efectivos del ajuste: no disponibles |
| Licencia | No disponible. El frontmatter de la *model card* usa el marcador genérico `licence: license` sin concretar términos, y la ficha de HuggingFace no declara licencia |
| Formato de pesos | `safetensors` (Transformers). Tamaño del repositorio: 2,0 GB, muy superior al peso teórico de los parámetros en fp32 (~500 MB), lo que sugiere la inclusión de estados de optimizador o checkpoints intermedios |
| Modelo base | `goldfish-models/arb_arab_100mb` |
| Librerías declaradas | transformers, TRL 0.23.0, PyTorch 2.11.0, Datasets 4.8.4, Tokenizers 0.22.1 |
| Compatibilidad de despliegue | Tags `text-generation-inference` y `endpoints_compatible` |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atención causal, entrenado de forma autorregresiva. El modelo de partida pertenece a la familia Goldfish, un conjunto de modelos monolingües de ~125 M de parámetros entrenados sobre subconjuntos de 100 MB de texto por idioma; en este caso, la variante árabe (`arb_arab`). No se dispone de información sobre el número de tokens de preentrenamiento, la composición del corpus árabe original ni la configuración exacta de capas y cabezas del modelo base en la documentación facilitada.

El ajuste se realizó con SFT mediante TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.11.0. El *run* asociado está registrado en Weights & Biases bajo el proyecto «new_tokenizers», lo que sugiere que el experimento forma parte de un estudio comparativo de tokenizadores más que de una mejora de capacidades lingüísticas. El nombre del repositorio indica un conjunto de datos sintético de 10 MB con tareas de tipo Dyck y ejemplos barajados, y una semilla fija (10), patrón habitual en experimentos de ablación con múltiples réplicas. No se documenta ningún uso de RLHF, DPO, RLVR ni técnicas de alineación adicionales, ni innovaciones arquitectónicas como atención lineal o decodificación especulativa.

## Capacidades

- Generación de texto autorregresiva mediante el pipeline estándar de `transformers` (`text-generation`), tal y como muestra el ejemplo de la *model card*.
- Aprendizaje de estructuras formales: por el nombre del conjunto de ajuste, el modelo habría sido entrenado para resolver o modelar tareas de paréntesis balanceados (familia Dyck), un proxy clásico para evaluar el modelado de jerarquía sintáctica.
- El ejemplo de la *model card* emplea el formato de mensajes `[{"role": "user", "content": ...}]`, lo que indica que la plantilla de chat del tokenizador acepta ese formato, pero no hay evidencia de que el modelo siga instrucciones de forma fiable tras un ajuste sobre datos sintéticos.
- No hay información que respalde soporte de *tool calling* o *function calling*.
- No hay información que respalde capacidades de agente, razonamiento multi-paso deliberado ni modos de «pensamiento».
- No hay capacidades de visión, audio ni multimodalidad: los pesos y el pipeline declarado son exclusivamente de texto.
- Competencia multilingüe: no disponible; el modelo base es monolingüe en árabe y el ajuste sintético no añade cobertura de idiomas.

## Casos de uso

- Reproducción de experimentos de SFT: el modelo permite replicar un ajuste supervisado con TRL sobre un corpus sintético de 10 MB y una semilla concreta, comparando la curva de entrenamiento con los otros *runs* del proyecto de W&B.
- Estudios de olvido catastrófico: sirve como caso de estudio para medir cuánto degrade un modelo monolingüe de 125 M en árabe cuando se ajusta sobre datos puramente formales y no lingüísticos.
- Investigación sobre tokenizadores: al proceder del proyecto «new_tokenizers», es un punto de comparación directo para evaluar cómo distintas segmentaciones afectan al aprendizaje de tareas de Dyck con la misma semilla y el mismo presupuesto de datos.
- Ablaciones con semillas: al incorporar `seed10` en el nombre, encaja en una batería de réplicas donde se mide la varianza entre inicializaciones; útil para cuantificar la estabilidad de resultados en modelos pequeños.
- Pruebas de infraestructura de servicio: con los tags `text-generation-inference` y `endpoints_compatible`, puede usarse como carga ligera para validar despliegues de TGI, endpoints de HuggingFace o pasarelas de inferencia antes de pasar a modelos grandes.
- Material docente: por su tamaño (~500 MB en fp32) y su pipeline trivial, es adecuado para prácticas de aula sobre ajuste fino, guardado de pesos en `safetensors` y publicación en el Hub.
- Comparación de coste de inferencia: sirve como referencia de latencia y consumo de VRAM en el extremo inferior de la escala de transformers de 125 M en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La *model card* no incluye métricas de evaluación (MMLU, HumanEval, GSM8K ni ninguna otra), y únicamente enlaza a un *run* de Weights & Biases que, presumiblemente, contiene curvas de entrenamiento y no resultados de evaluación comparables. No se debe asumir ningún nivel de rendimiento sin consultar dicho *run*.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con pesos en fp32 y unos 0,25 GB en fp16/bf16, más el *overhead* del runtime y la caché KV, que con contexto corto es marginal.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente. Una RTX 3050, GTX 1650, RTX 3060 o superior lo ejecutan sin problemas; también es viable en CPU, aunque con mayor latencia.
- Cabe holgadamente en GPU de consumo: sí, en toda la gama actual y en varias generaciones anteriores.
- Opciones de despliegue: `transformers` con el pipeline de `text-generation`; `text-generation-inference` (TGI), dado el tag declarado; `vLLM` es compatible con arquitecturas GPT-2, aunque sobredimensionado para este tamaño. Para `llama.cpp` u `Ollama` sería necesaria una conversión previa a GGUF, que no está publicada.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.
- Nota de descarga: el repositorio ocupa 2,0 GB, muy por encima del peso de los parámetros, por lo que conviene descargar únicamente el archivo `safetensors` necesario si el ancho de banda es un factor limitante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `fpadovani/arb-arab-100mb-ppt-shuff-dyck-10mb_seed10` | 124,77 M | No disponible | No publicado | No disponible | HuggingFace, 0 descargas |
| `goldfish-models/arb_arab_100mb` (modelo base) | ~125 M | No disponible en esta información | No disponible | No disponible en esta información | HuggingFace, familia multilingüe de 100 MB por idioma |
| GPT-2 (124 M, OpenAI) | 124 M | 1.024 tokens | Referencia histórica ampliamente superada | MIT (pesos publicados) | HuggingFace, `openai-community/gpt2` |
| SmolLM2-135M (HuggingFace) | 135 M | 2.048 tokens | Publicado por el autor | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Qwen2.5-0.5B (Alibaba) | 494 M | 32.768 tokens | Publicado por el autor | Apache 2.0 | HuggingFace, uso comercial permitido |

Los datos de contexto y licencia de los modelos comparativos provienen de su documentación pública y conviene verificarlos en sus fichas oficiales antes de citarlos. La comparación de rendimiento con este modelo no es posible porque no hay métricas publicadas.

## Limitaciones y advertencias

- Licencia indeterminada: el repositorio no declara términos de uso. Cualquier explotación comercial es jurídicamente arriesgada hasta que el autor concrete la licencia del modelo base y la del ajuste.
- Ausencia total de validación por la comunidad: cero descargas y cero interacciones; no existe evidencia externa de que los pesos carguen correctamente ni de que generen texto coherente.
- Riesgo elevado de alucinación: los modelos de ~125 M de parámetros producen texto plausible pero factualmente poco fiable, y este ajuste sobre datos sintéticos puede agravar la degradación del lenguaje natural.
- Olvido catastrófico probable: el ajuste sobre tareas formales de tipo Dyck puede deteriorar la competencia en árabe heredada del modelo base. No se han publicado evaluaciones al respecto.
- Longitud de contexto desconocida: la familia Goldfish emplea contextos cortos, pero este dato no está confirmado en la información disponible; asumir ventanas largas no está justificado.
- Cambio de tokenizador: el *run* de entrenamiento pertenece al proyecto «new_tokenizers», por lo que el tokenizador del repositorio podría diferir del original del modelo base. Conviene verificar la coherencia entre `tokenizer.json` y los pesos antes de reutilizarlos.
- Sin alineación ni filtros de seguridad: no hay RLHF, DPO ni moderación; el modelo puede generar contenido inapropiado sin restricciones.
- Naturaleza de checkpoint de investigación: el nombre sugiere un punto intermedio de una batería de ablaciones (`ppt-shuff`, `dyck-10mb`, `seed10`), no un modelo final pulido.
- Idiomas: aunque el modelo base es árabe, no hay garantía de que el ajuste conserve esa capacidad, y no se declara ningún otro idioma soportado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fpadovani/arb-arab-100mb-ppt-shuff-dyck-10mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/arb_arab_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- *Run* de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new_tokenizers/runs/7c4tu2gv
- Búsqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos por la búsqueda corresponden a consultas sobre prestaciones sociales francesas y no guardan relación con el modelo.
