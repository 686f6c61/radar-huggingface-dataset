# jadanovitch/t5gemma-2-1b-encoder

## Resumen

`jadanovitch/t5gemma-2-1b-encoder` es un checkpoint derivado que contiene **unicamente el codificador de texto** del modelo `google/t5gemma-2-1b-1b`, publicado por el usuario jadanovitch. No es un modelo entrenado de nuevo: los pesos se han reasignado sin cambios al formato nativo `Gemma3ForCausalLM` que espera vLLM, omitiendo los pesos de vision, del decodificador y los embeddings multimodales (EOI). El objetivo es puramente de infraestructura: poder servir un codificador de texto bidireccional dentro del stack de vLLM.

El checkpoint tiene 999.885.952 parametros (aproximadamente 1B), 26 capas, hidden size de 1152 y una relacion de 4 cabezas de atencion por 1 cabeza KV, con pesos y activaciones en BF16. La configuracion fuerza `is_causal=false` y `use_bidirectional_attention=true`, lo que hace que la implementacion de Gemma 3 en vLLM utilice `EncoderOnlyAttention`, sin cache KV autoregresivo.

Su relevancia es acotada pero clara: cubre el hueco de disponer de un codificador bidireccional del linaje Gemma 3 / T5Gemma 2 ejecutable sobre vLLM para tareas de encoding de texto, retrieval, reranking y experimentacion. No debe confundirse con el modelo original `t5gemma-2-1b-1b`, que es un encoder-decoder multilingue y multimodal completo; aqui solo esta presente la mitad codificadora.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only con atencion bidireccional (codificador de texto de T5Gemma 2 / Gemma 3, cargado en el layout `Gemma3ForCausalLM` con `is_causal=false`) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de despliegue vLLM documentado; la familia T5Gemma 2 declara hasta 128k tokens de contexto |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en BF16) |
| Idiomas soportados | no disponible en la ficha de este checkpoint; la familia base T5Gemma 2 se describe como multilingue |
| Licencia | Gemma (se aplican los terminos de Gemma del modelo original) |
| Formato de pesos | safetensors (BF16) |
| Numero de capas | 26 |
| Hidden size | 1152 |
| Cabezas de atencion / KV | 4 / 1 |
| Tipo de atencion | Bidireccional (`use_bidirectional_attention=true`, `is_causal=false`) |
| Modelo base | google/t5gemma-2-1b-1b |
| Tamano del repositorio | 2,0 GB |
| Pipeline declarado | text-generation |
| Fecha de creacion / actualizacion | 2026-09-27 / 2026-09-27 |

## Arquitectura y entrenamiento

La familia T5Gemma 2 se construye mediante adaptacion de modelos: se parte de un modelo decoder-only preentrenado (Gemma 3) y se transforma en un modelo encoder-decoder siguiendo la receta UL2 empleada en T5Gemma. T5Gemma 2 introduce dos cambios arquitectonicos clave respecto a la generacion anterior: embeddings de palabras atados entre codificador y decodificador, y fusion de la autoatencion y la atencion cruzada del decodificador, lo que reduce el numero de parametros manteniendo una huella de memoria similar a la de Gemma 3. La familia se publica en tres pares de tamanos: 270M-270M (~370M totales excluyendo vision), 1B-1B y 4B-4B, con soporte multilingue, multimodal y contexto largo.

Este checkpoint concreto **no ha sido entrenado ni ajustado**: es una conversion de infraestructura. Se toman los pesos del codificador de `google/t5gemma-2-1b-1b` y se mapean sin modificaciones al layout nativo de Gemma 3 en vLLM. La configuracion declara atencion bidireccional y ausencia de causalidad, de modo que vLLM instancia `EncoderOnlyAttention`. El decodificador, los pesos de vision y los embeddings especificos de multimodalidad se han omitido por completo. La ficha del autor no documenta numero de tokens de entrenamiento, composicion del dataset, ni fases de RLHF o DPO.

## Capacidades

- Codificacion de texto con atencion bidireccional sobre secuencias de hasta 32.768 tokens en la configuracion de despliegue documentada.
- Extraccion de representaciones internas (hidden states) apta para retrieval, ranking y reranking de candidatos.
- Uso como componente de recuperacion en pipelines RAG, alimentando indices vectoriales con embeddings contextualizados.
- Carga en vLLM mediante el runner de generacion: la LM head atada permite que el runner cargue el modelo, aunque el modelo no fue entrenado como LM causal independiente.
- Soporte de `text-generation-inference` y compatibilidad con endpoints segun las etiquetas del repositorio.
- Capacidad multilingue: heredada del modelo base T5Gemma 2, que se describe como multilingue; no cuantificada ni documentada en la ficha de este checkpoint.
- Capacidades multimodales (vision) y de decodificacion: **no disponibles** en este checkpoint, ya que esos pesos se han omitido deliberadamente.
- Tool calling, function calling, modo thinking o soporte de agentes: no documentados en la informacion disponible.

## Casos de uso

- Recuperacion densa en RAG: el codificador genera representaciones de documentos y consultas para alimentar un indice vectorial; su ventana de 32.768 tokens permite indexar fragmentos largos sin troceado agresivo.
- Reranking de candidatos: tras una primera fase de recuperacion, el codificador puntua pares consulta-documento con atencion bidireccional, lo que suele mejorar la precision frente a codificadores unidireccionales.
- Busqueda semantica en corpus tecnicos o juridicos: la codificacion bidireccional y el contexto largo facilitan manejar articulos o secciones completas como unidad de recuperacion.
- Clasificacion y clustering de documentos: las representaciones del encoder sirven como caracteristicas de entrada para cabezas de clasificacion o algoritmos de agrupamiento sobre grandes volumenes de texto.
- Aprendizaje por destilacion o ajuste de cabezas especificas: al ser un encoder de 1B con hidden size 1152, es un backbone razonable para entrenar tareas downstream sin el coste de un modelo mayor.
- Experimentacion con atencion bidireccional en vLLM: permite validar el comportamiento de `EncoderOnlyAttention` en versiones de vLLM 0.24 dentro de pipelines propios.
- Evaluacion comparativa de codificadores: sirve como linea base para medir si un codificador derivado de Gemma 3 supera a encoders clasicos en tareas internas de recuperacion.
- Precomputo de embeddings a gran escala: con ~2 GB de pesos en BF16, se puede desplegar en varias GPU y procesar lotes de documentos en paralelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor no incluye metricas de MMLU, HumanEval, GSM8K, MTEB ni de tareas de retrieval o reranking, y la model card se limita a describir la conversion de infraestructura.

## Requisitos de hardware

- Pesos: aproximadamente 2 GB en BF16 (999.885.952 parametros). El repositorio ocupa 2,0 GB.
- VRAM estimada para inferencia: los pesos caben en cualquier GPU con 4 GB o mas; la VRAM adicional depende de la longitud de secuencia y del tamano de lote, ya que este encoder no usa cache KV autoregresivo. El autor no publica cifras de consumo de memoria. Cualquier cifra de VRAM total es una estimacion orientativa, no un dato verificado.
- GPU recomendadas: dado el tamano, cabe con holgura en GPU de consumo como RTX 4090, RTX 3090 o RTX 3060 de 12 GB; para servicio concurrente y lotes grandes son preferibles A100, H100, L40S o L4.
- Cabe en GPU de consumo: si, siempre que se disponga de al menos 4 GB de VRAM para los pesos en BF16 y margen para activaciones.
- Opciones de despliegue: vLLM es el unico camino documentado, con el comando `vllm serve <model-id-or-path> --runner generate --no-enable-prefix-caching --max-model-len 32768`. La opcion `--no-enable-prefix-caching` es obligatoria en vLLM 0.24 porque la atencion encoder-only no dispone de cache KV autoregresivo. El modelo tambien declara compatibilidad con `transformers` y `text-generation-inference` en sus etiquetas.
- Formatos alternativos: no hay pesos GGUF, AWQ, GPTQ ni cuantizaciones publicadas, por lo que llama.cpp y Ollama no son opciones viables con los artefactos actuales.
- Latencia y throughput: no disponibles. El coste por token depende del lote y de la longitud de secuencia; al ser atencion bidireccional, la complejidad es cuadratica respecto a la longitud de entrada y no hay reutilizacion de prefijos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jadanovitch/t5gemma-2-1b-encoder | 999.885.952 (~1B, solo encoder de texto) | 32.768 tokens en el despliegue documentado | Texto (encoder-only) | Gemma | safetensors, cargado en vLLM |
| google/t5gemma-2-1b-1b (origen) | par 1B-1B (encoder mas decodificador) | hasta 128k tokens segun la familia | Texto y multimodal | Gemma | safetensors en HuggingFace |
| T5Gemma 2 270M-270M | ~370M totales excluyendo vision, segun el blog de Google | hasta 128k tokens segun la familia | Texto y multimodal | Gemma | safetensors en HuggingFace |
| T5Gemma 2 4B-4B | par 4B-4B | hasta 128k tokens segun la familia | Texto y multimodal | Gemma | safetensors en HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada, ni de encoders independientes de referencia (por ejemplo, modelos tipo BERT o encoders de retrieval dedicados) evaluados frente a este checkpoint. Cualquier comparacion de calidad queda por tanto sin datos.

## Limitaciones y advertencias

- No es un modelo de lenguaje causal funcional: aunque la LM head atada permite que vLLM lo cargue con el runner de generacion, el codificador aislado no fue entrenado como LM causal independiente. Usarlo para generar texto producira salidas sin garantia de coherencia.
- El modelo no ha sido entrenado ni ajustado: es un mapeo de pesos sin cambios. No ha habido fases de alineacion, RLHF o DPO documentadas.
- Atencion bidireccional sin cache KV: implica la obligacion de usar `--no-enable-prefix-caching` en vLLM 0.24 y descarta tecnicas de reutilizacion de prefijos, lo que encarece el procesamiento de lotes con prefijos comunes.
- Recorte funcional deliberado: no incluye decodificador, pesos de vision ni embeddings multimodales, por lo que no puede utilizarse para generacion encoder-decoder ni para tareas de imagen.
- Idiomas: la ficha no especifica el conjunto de idiomas soportados. La familia base se describe como multilingue, pero no se ha verificado el comportamiento de este recorte en idiomas distintos del ingles.
- Riesgo de sesgos y alucinacion: no documentado en la ficha del checkpoint. Al heredar los pesos de un modelo entrenado sobre datos web a gran escala, es previsible que arrastre los sesgos del modelo original, pero no hay evaluacion publicada al respecto.
- Ambito de uso declarado por el autor: codificacion de texto, retrieval, reranking y experimentacion. Cualquier uso en produccion orientado a decisiones sensibles deberia acompanarse de evaluacion propia.
- Licencia Gemma: se aplican los terminos de Gemma del modelo original, que incluyen restricciones de uso recogidas en la politica de uso prohibido. Es imprescindible revisar dichos terminos antes de un despliegue comercial.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente de la fidelidad del mapeo de pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jadanovitch/t5gemma-2-1b-encoder
- Modelo base: https://huggingface.co/google/t5gemma-2-1b-1b
- Documentacion de T5Gemma 2 en Transformers: https://huggingface.co/docs/transformers/model_doc/t5gemma2
- Pagina de T5Gemma en Google DeepMind: https://deepmind.google/models/gemma/t5gemma/
- Blog de Google sobre T5Gemma 2: https://blog.google/innovation-and-ai/technology/developers-tools/t5gemma-2/
- Paper T5Gemma 2: Seeing, Reading, and Understanding Longer: https://arxiv.org/pdf/2512.14856
