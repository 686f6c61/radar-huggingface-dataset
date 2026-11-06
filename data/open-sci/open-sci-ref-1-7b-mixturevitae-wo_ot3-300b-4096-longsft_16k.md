# open-sci/open-sci-ref-1.7b-mixturevitae-wo_ot3-300B-4096-longsft_16k

## Resumen
Open-sci-ref-1.7b-mixturevitae-wo_ot3-300B-4096-longsft_16k es un modelo de lenguaje denso de 1.714 millones de parametros desarrollado por el colectivo open-sci (con pesos alojados bajo el espacio de nombres `open-sci` en Hugging Face y linaje tecnico del ecosistema LAION). No es un modelo de proposito general pensado para produccion, sino un experimento de ablacion controlado: reproduce el modelo principal del paper *Strong Post-Training from Permissive, Reasoning-Dominant, Web-Scale Pretraining* (sometido a NeurIPS 2026) eliminando el subconjunto OpenThoughts3 del corpus de preentrenamiento MixtureVitae v1, para medir si ese subconjunto es critico para el post-entrenamiento orientado a razonamiento.

El modelo parte de un preentrenamiento de 300B tokens sobre 93 de los 96 shards de MixtureVitae v1 (sin reweighting, con 0.76 epocas y sin repeticion), con una arquitectura `open-sci-ref` de tipo transformer denso, tokenizer GPT-NeoX (vocabulario 50304) y una ventana nativa de 4096 tokens que se extiende a 16384 mediante YaRN (factor 4.0) mas una epoca de `long_sft`. El resultado es un checkpoint de investigacion con licencia Apache 2.0, util para estudiar el impacto de la composicion del corpus y de la extension de contexto, no como asistente listo para usar.

Su relevancia actual es metodologica: forma una pareja controlada con `ontocord/1.7b-MixtureVitae-300BT-v1-decontaminated` (mismo schedule de entrenamiento byte a byte, batch global 1024, warmup 25000) que difiere unicamente en la eliminacion de OT3, lo que permite aislar el efecto de ese subconjunto a escala de 300B tokens en lugar de solo a la escala reducida de 100B del ablation previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`open-sci-ref`), con `custom_code` (`modeling_opensci.py`) |
| Parametros totales | 1.714.377.728 (1.7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 16.384 tokens (nativo 4.096 extendido con YaRN factor 4.0) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en el formato original) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 3.4 GB) |
| Tokenizer | GPT-NeoX, vocabulario 50.304, almacenamiento uint16 |
| RoPE theta | 100.000 |
| Pipeline | no disponible |

## Arquitectura y entrenamiento
La arquitectura es un transformer denso de 1.7B parametros bajo la receta `open-sci-ref`, implementada con codigo personalizado (`modeling_opensci.py`) que requiere `trust_remote_code=True`. Usa tokenizer GPT-NeoX con vocabulario de 50.304 entradas almacenadas en uint16 y RoPE con theta 100k. El preentrenamiento consumio 300B tokens (71.526 iteraciones, longitud de secuencia 4.096, batch global 1.024) sobre 393.92B tokens disponibles de MixtureVitae v1 decontaminado, es decir 0.76 epocas sin repeticion. Se empleo un schedule WSD con learning rate 4e-3, 20% de cooldown lineal y warmup de 25.000 pasos (la convencion de la escala 300B, no los 1.000 pasos del ablation a 100B). El entrenamiento se ejecuto en 64 nodos con 4 GH200 cada uno.

La composicion del corpus elimina los shards `open_thoughts-0/1/2` (18.69B tokens, 4.53% de MixtureVitae), manteniendo pesos proporcionales al tamano de cada shard restante, de modo que es un MixtureVitae plano menos OT3 y no una mezcla reponderada. La extension de contexto se realizo con YaRN (factor 4.0, de 4.096 a 16.384) seguida de una epoca de `long_sft` con mezcla SeaLong + LongAlign al 30% y SmolTalk al 70%, learning rate 2e-4 con schedule coseno, 1.623 pasos en 2 nodos con 4 GH200, alcanzando una perdida final de entrenamiento de 0.7994. Los autores documentan dos correcciones aplicadas a los ficheros liberados: aceptacion de `**kwargs` en `OpensciModel.forward` (necesario para `num_items_in_batch` del Trainer reciente) y conversion de `max_position_embeddings` a entero en `config.json` (YaRN lo escribia como flotante y rompia lm-eval). Ademas advierten de una diferencia no eliminable con la referencia MV-300BT: este blend usa ficheros por shard tokenizados con `--append-eod`, mientras que `merged_0` no contiene tokens EOD, por lo que la pareja difiere tanto por la eliminacion de OT3 como por el separador de documentos.

## Capacidades
- Generacion de texto autoregresiva en ingles con contexto de hasta 16.384 tokens.
- Razonamiento y respuesta a instrucciones derivados del `long_sft` sobre SmolTalk, LongAlign y SeaLong.
- Manejo de entradas largas (documentos, conversaciones multi-turno extensas) gracias a la extension YaRN.
- Capacidad base de preentrenamiento web-scale: continuacion de texto, modelado de lenguaje y transferencia a tareas downstream mediante fine-tuning.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito (no hay modo thinking declarado).
- No dispone de vision, audio ni otras modalidades.
- Multilingue: no; la model card declara unicamente ingles.

## Casos de uso
- Investigacion sobre composicion de corpus: usar el modelo como brazo de ablacion para medir, con el mismo schedule y escala que MV-300BT, cuanto aporta OpenThoughts3 al rendimiento tras post-entrenamiento orientado a razonamiento.
- Reproducibilidad de experimentos: al ser una copia byte a byte del schedule de `ontocord/1.7b-MixtureVitae-300BT-v1-decontaminated`, sirve para replicar resultados del paper y auditar diferencias atribuibles al corpus.
- Evaluacion de extension de contexto: permite estudiar el coste y la ganancia de pasar de 4k a 16k con YaRN mas `long_sft` en un modelo de 1.7B, comparando la perdida final (0.7994) con las otras variantes de 16k del estudio.
- Fine-tuning academico de bajo presupuesto: con 1.7B parametros y licencia Apache 2.0, es viable ajustarlo en un solo nodo de GPUs para tareas de clasificacion, resumen o extraccion sobre dominios cientificos.
- Base para estudios de destilacion o curriculum learning: su tamano reducido permite iterar rapidamente sobre estrategias de post-entrenamiento antes de escalar a modelos mayores.
- Prototipado de pipelines de evaluacion: util para validar harness de lm-eval, pruebas de carga con vLLM o integraciones con `transformers` antes de desplegar modelos de mayor tamano.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida final de entrenamiento del `long_sft` (0.7994), sin metricas de MMLU, HumanEval, GSM8K ni comparaciones numericas con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16/FP16: aproximadamente 3.4 GB solo de pesos, mas cache KV; en la practica unos 4-5 GB para secuencias cortas y varios GB adicionales con contexto de 16k.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1.8-2 GB de pesos; en 4 bits, alrededor de 1 GB (no se publican GGUF oficiales, habria que generarlos).
- GPU recomendadas: cualquier GPU con 8 GB o mas para BF16 en contexto corto (RTX 3060 12 GB, RTX 4070, RTX 4090); A100/H100 no son necesarias para inferencia, solo para reproducir el entrenamiento.
- Cabe en GPU de consumo: si, en modelos con 8-12 GB de VRAM en BF16 y en GPU con 4-6 GB si se cuantiza.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el codigo personalizado); vLLM y TGI requeririan verificar compatibilidad con la arquitectura `open-sci-ref`; llama.cpp/Ollama solo tras convertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| open-sci-ref-1.7b-mixturevitae-wo_ot3-300B-4096-longsft_16k | 1.7B denso | 16.384 (YaRN) | Apache 2.0 | Ablacion sin OT3, 300B tokens, `long_sft` |
| ontocord/1.7b-MixtureVitae-300BT-v1-decontaminated | 1.7B denso | 4.096 | no disponible en la informacion | Modelo principal del paper; pareja controlada con el anterior |
| laion/open-sci-ref-1.7b-mixturevitae-wo_ot3-100B-4096 | 1.7B denso | 4.096 | no disponible en la informacion | Ablacion equivalente a escala 100B tokens |
| Modelos generalistas de ~1.7B (p. ej. familia Qwen o Llama) | ~1.7B | variable | variable | No se dispone de datos comparativos de rendimiento en la informacion proporcionada |

La comparacion cuantitativa de rendimiento con alternativas no esta disponible: no hay benchmarks publicados para este checkpoint ni cifras comparables en la informacion recogida.

## Limitaciones y advertencias
- Modelo de investigacion: es un experimento de ablacion, no un asistente pulido; el autor no lo presenta como listo para produccion.
- Solo ingles: la model card declara `language: [en]`, sin garantias en castellano ni otros idiomas.
- Riesgo de alucinacion: inherente a un modelo de 1.7B preentrenado sobre datos web y ajustado brevemente; no se documentan mitigaciones.
- Sesgos: al entrenarse sobre MixtureVitae (corpus web a gran escala), hereda los sesgos de esa fuente; no se detallan analisis de sesgo.
- Diferencia metodologica con la referencia: el uso de `--append-eod` frente a `merged_0` introduce un token separador adicional, por lo que las comparaciones con MV-300BT no aislan perfectamente la eliminacion de OT3.
- Codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; conviene auditar `modeling_opensci.py` antes de desplegarlo.
- Compatibilidad: los propios autores documentan dos bugs corregidos en los ficheros liberados (kwargs en `forward` y `max_position_embeddings` como entero); versiones antiguas de `transformers` o harness pueden fallar.
- Licencia Apache 2.0: permite uso comercial, pero al ser un checkpoint de investigacion sin garantias de calidad, su uso en produccion es desaconsejable sin evaluacion previa.
- Sin datos de benchmarks: no hay evidencia publicada de rendimiento en tareas estandar para validar su calidad frente a alternativas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/open-sci/open-sci-ref-1.7b-mixturevitae-wo_ot3-300B-4096-longsft_16k
- Modelo base del que deriva (4k): https://huggingface.co/laion/open-sci-ref-1.7b-mixturevitae-wo_ot3-300B-4096
- Ablacion a escala 100B: https://huggingface.co/laion/open-sci-ref-1.7b-mixturevitae-wo_ot3-100B-4096
- Modelo principal del paper (MV-300BT): https://huggingface.co/ontocord/1.7b-MixtureVitae-300BT-v1-decontaminated
- Paper de referencia: *Strong Post-Training from Permissive, Reasoning-Dominant, Web-Scale Pretraining* (NeurIPS 2026, sometido); no se dispone de URL en la informacion proporcionada.
- Repositorio de codigo, demo o blog del autor: no disponibles en la informacion proporcionada.
