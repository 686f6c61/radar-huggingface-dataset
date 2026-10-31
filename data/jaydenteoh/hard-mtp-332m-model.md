# JaydenTeoh/hard-mtp-332m-model

## Resumen

Hard-MTP-332M es un modelo de lenguaje experimental de 357 millones de parámetros desarrollado por Jayden Teoh como parte del trabajo de investigación *Multi-Token Prediction Done Right* (arXiv:2610.38331). Se trata de uno de los doce checkpoints publicados junto a dicho artículo: tres objetivos de multi-token prediction (MTP) por cuatro tamaños de modelo, todos entrenados con una receta idéntica para que los resultados sean directamente comparables entre sí. La variante "hard" emplea el objetivo MTP estándar, en el que cada cabecera se entrena con cross-entropy contra el token realizado k posiciones por delante, al estilo de DeepSeek-V3.

Su relevancia no radica en ser un modelo de uso general, sino en ser un artefacto científico: permite estudiar de forma controlada el impacto de los objetivos de predicción multi-token sobre la calidad del modelo base y sobre la decodificación especulativa. El modelo se entrena sobre FineWeb-Edu con 31,5 mil millones de tokens y, en inferencia, las cabeceras MTP se descartan, de modo que lo que se despliega es un transformer next-token convencional de 357M de parámetros. Usa licencia MIT y requiere `trust_remote_code=True`, ya que la arquitectura (`model_type: hf_mtp`) se define en los ficheros del propio repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (tipo GPT-2) con cabeceras MTP auxiliares (`hf_mtp`, custom code) |
| Parametros totales | 357M (356.911.104 segun safetensors) |
| Parametros activos | 357M (no es MoE; las cabeceras MTP se descartan en inferencia) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp32 originales) |
| Idiomas soportados | Ingles (entrenado con FineWeb-Edu, corpus en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (1,4 GB de tamano de repo) |

## Arquitectura y entrenamiento

La arquitectura base es un transformer decoder de 36 capas con hidden size de 768, 12 cabeceras de atencion y contexto de 2048 tokens. Sobre ella se anaden 3 cabeceras MTP en configuracion de cascada estilo DeepSeek (un bloque por cabecera). Cada cabecera se entrena con cross-entropy contra el token realizado k posiciones por delante, el objetivo MTP clasico. Estas cabeceras son estrictamente auxiliares: en inferencia se descartan y el modelo desplegado es un transformer next-token ordinario, aunque tambien pueden reutilizarse como draft model para decodificacion especulativa auto-especulativa.

El entrenamiento utiliza 31,5 mil millones de tokens de FineWeb-Edu tokenizados con el BPE de GPT-2 (60.000 pasos, batch de 256, contexto 2048). El optimizador es una combinacion destacable: Muon para las matrices ocultas 2D y AdamW para embeddings, cabecera de salida y normalizaciones, con LR pico de 0,0015 con decaimiento coseno hasta 1e-05, 2.000 pasos de warmup, weight decay de 0,1 y precision bf16 autocast sobre pesos maestros en fp32. Se trato de una unica ejecucion por celda con seed 13, y los doce checkpoints comparten seed, orden de datos y planificador, de modo que las diferencias de rendimiento son atribuibles al objetivo de entrenamiento.

## Capacidades

- Generacion de texto en ingles a nivel de modelo base small-scale (357M, 31,5B tokens), sin afinado por instrucciones ni RLHF/DPO.
- Prediccion multi-token: 3 cabeceras MTP entrenadas con el objetivo "hard" (cross-entropy contra el token realizado k ahead), estilo DeepSeek-V3.
- Decodificacion especulativa auto-especulativa: las cabeceras MTP pueden servir de draft model sin necesidad de un modelo separado.
- Compatibilidad con la libreria `transformers` de Hugging Face mediante `trust_remote_code=True` (arquitectura `hf_mtp` definida en el repo).
- Tokenizador GPT-2 estandar (vocabulario de 50.257 tokens, con padding a 50.304 para alineacion).
- No dispone de tool calling, agentes, vision, audio ni thinking mode; es un modelo base de investigacion.

## Casos de uso

- Investigacion en multi-token prediction: como checkpoint "hard MTP" de la serie de 12, permite comparar empiricamente objetivos de MTP (hard, soft y otros) bajo receta identica, util para papers y ablations.
- Estudio de decodificacion especulativa: las cabeceras MTP pueden evaluarse como draft model para medir aceptacion y speedup de la inferencia especulativa sin entrenar un modelo draft independiente.
- Reproduccion de recetas de entrenamiento: el codigo y la configuracion (`configs/332m_fineweb.yaml` en el repo GitHub) permiten reproducir el run exacto con Muon + AdamW sobre FineWeb-Edu.
- Benchmark de optimizadores: al ser un run documentado con Muon sobre matrices 2D, sirve como punto de referencia para comparar optimizadores alternativos a AdamW a escala de ~300M.
- Educacion y docencia: modelo de tamano manejable (1,4 GB) para ensenar arquitecturas transformer con cabeceras MTP en cursos de NLP.
- Prototipado de pipelines de inferencia: puede integrarse en pruebas de vLLM, llama.cpp u otros runtimes para validar soporte de MTP y especulacion en modelos con custom code.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de perplexidad; los resultados comparativos de los doce checkpoints deben consultarse en el articulo arXiv:2610.38331.

## Requisitos de hardware

- VRAM estimada para inferencia: con 357M de parametros en fp32 se requieren unos 1,4 GB; en bf16, unos 0,7 GB. Cabe con holgura en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU de consumo es suficiente (RTX 3060, RTX 4090, etc.); no se necesitan A100 ni H100 para inferencia ni para fine-tuning a esta escala.
- Consumer GPU: si, corre sin problemas incluso en portatiles con GPU modesta e incluso en CPU dada su dimension.
- Opciones de despliegue: `transformers` de Hugging Face con `trust_remote_code=True` (via oficial documentada). El soporte en vLLM, llama.cpp, Ollama o TGI no esta documentado y, al tratarse de custom code con cabeceras MTP, probablemente requiera adaptaciones.
- Latencia y throughput: no disponible. Al desplegarse como transformer next-token ordinario de 357M, el rendimiento esperable es el tipico de modelos de esta escala, con posible aceleracion adicional si se implementa la decodificacion especulativa con las cabeceras MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Particularidad |
|---|---|---|---|---|
| JaydenTeoh/hard-mtp-332m-model | 357M | 2048 | MIT | MTP "hard" estilo DeepSeek-V3, custom code, modelo base de investigacion |
| JaydenTeoh/soft-mtp-332m (serie Soft-MTP) | ~357M | 2048 | MIT | Variante "soft" del mismo estudio, entrenada con receta identica para comparacion directa |
| GPT-2 (355M) | 355M | 1024 | MIT (OpenAI) | Arquitectura base de referencia; mismo tokenizador, sin MTP y con la mitad de contexto |
| Pythia-410m (EleutherAI) | 405M | 2048 | Apache 2.0 | Modelo base de investigacion similar en tamano, entrenado con The Pile, sin cabeceras MTP |

Nota: los checkpoints hermanos del mismo articulo (otras variantes de objetivo y otros tres tamaños) son las alternativas mas directamente comparables; sus IDs exactos no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin afinado por instrucciones: no sigue instrucciones de forma fiable ni ha pasado por RLHF/DPO, por lo que no es adecuado para asistentes o chat en produccion.
- Entrenado solo en ingles (FineWeb-Edu): el rendimiento en otros idiomas, incluido el castellano, no esta garantizado y probablemente sea pobre.
- Riesgo de alucinacion alto, tipico de modelos base small-scale entrenados con 31,5B tokens; no debe usarse para generacion de contenido factual sin verificacion.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo arbitrario del repositorio; conviene revisar los ficheros de modelado antes de usarlo en entornos sensibles.
- No incluye ficheros de tokenizador: hay que cargar el tokenizador de GPT-2 por separado; el vocabulario esta con padding de 50.257 a 50.304 y las filas extra no se usan.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documento largo.
- Las cabeceras MTP se descartan en inferencia: el modelo desplegado no ofrece ninguna ventaja de calidad MTP salvo que se aprovechen para decodificacion especulativa.
- La licencia MIT permite uso comercial sin restricciones relevantes.
- `inference: false` en la model card: no hay inference API desplegada en Hugging Face; hay que ejecutarlo localmente.
- Resultados de un solo run con una unica seed (13): las conclusiones comparativas pueden tener varianza no controlada entre seeds.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaydenTeoh/hard-mtp-332m-model
- Articulo (arXiv): https://arxiv.org/abs/2610.38331 — *Multi-Token Prediction Done Right* (arXiv:2610.38331)
- Codigo (GitHub): https://github.com/JaydenTeoh/Soft-MTP (configuracion del run: `configs/332m_fineweb.yaml`)
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Tokenizador: https://huggingface.co/gpt2
