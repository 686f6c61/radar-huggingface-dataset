# Kausp11/standard-dclm-3.3b

## Resumen

Standard 3.3B (DCLM-Edu) es un modelo de lenguaje base de 3.322,3 millones de parametros reportados (5.539,7 millones almacenados, incluyendo embeddings de valor), desarrollado por Kausp11. Se trata de un artefacto de investigacion cuyo proposito es servir como linea base de texto plano para medir el efecto del pretraining aumentado con busquedas: es el control del modelo `Kausp11/querylm-dclm-3.3b`, entrenado con la misma arquitectura y el mismo presupuesto de computo, pero sin bloques de busqueda insertados en las secuencias.

La arquitectura sigue el estilo nanochat (decoder transformer de 32 capas, anchura 2.816, 22 cabezas, feed-forward de 11.264 y dimension de cabeza 128), con una ventana de contexto de 4.095 tokens. El entrenamiento se realizo desde cero sobre DCLM-Edu como texto plano, consumiendo 99.800 millones de tokens en 95.172 actualizaciones (2,35e21 FLOPs), exactamente el mismo numero de actualizaciones y FLOPs que su modelo emparejado con busqueda.

Su relevancia es metodologica: permite aislar la contribucion del pretraining con recuperacion de informacion frente a una linea base equivalente en computo. No esta pensado como producto, no tiene formato de chat ni entrenamiento de seguridad, y solo procesa texto web en ingles. La licencia Apache-2.0 facilita su reutilizacion en experimentos comparativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo nanochat: 32 capas, anchura 2.816, 22 cabezas, feed-forward 11.264, head dim 128 |
| Parametros totales | 3.322,3M reportados (5.539,7M almacenados en safetensors, incluyendo embeddings de valor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.095 tokens |
| Tipos de cuantizacion | No disponible (el repositorio publica pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (texto web) |
| Licencia | Apache-2.0 (el archivo `modeling_nanochat.py` deriva de nanochat, MIT, Copyright (c) 2025 Andrej Karpathy) |
| Formato de pesos | safetensors (3 shards: `model-00001-of-00003.safetensors`, `model-00002-of-00003.safetensors`, `model-00003-of-00003.safetensors`), 11,1 GB de repositorio |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de la familia nanochat (commit upstream `92d63d4` con una rama local de datos de busqueda), con 32 capas, anchura de 2.816, 22 cabezas de atencion, feed-forward de 11.264 y dimension de cabeza 128. El tokenizador es el de SmolLM2 ampliado con los cuatro tokens de busqueda que usa QueryLM, para un vocabulario de 49.156 entradas; esos cuatro tokens existen en el vocabulario pero el modelo nunca los vio durante el entrenamiento, por lo que no sabe buscar. La carga requiere `trust_remote_code=True` porque el repositorio incluye `modeling_nanochat.py`.

El pretraining se hizo desde cero sobre DCLM-Edu como texto plano, sin bloques de busqueda ni anotacion, y con mas texto de documento que el modelo emparejado para igualar el computo. Se usaron 95.172 actualizaciones con lotes de 256 secuencias de 4.095 tokens (1.048.320 tokens por actualizacion), un total de 99.800 millones de tokens (unos 34.600 millones corresponden a una segunda pasada sobre documentos ya vistos) y 2,35e21 FLOPs en bf16. El optimizador fue Muon para los pesos matriciales (LR pico 0,02828) y AdamW para embeddings y cabeza de salida, con 40 pasos de warmup, fase constante y decaimiento lineal hasta el 5% del pico. El checkpoint corresponde al paso final del ultimo segmento de entrenamiento (paso 18.026 del segmento; 95.172 actualizaciones totales), con el schedule de learning rate completado.

## Capacidades

- Generacion de texto por continuacion: es un modelo base, sin formato de chat ni instrucciones.
- Aprendizaje en contexto few-shot: el ejemplo de la model card muestra que con ejemplos "Question/Answer" produce respuestas correctas (por ejemplo, "Canberra" para la capital de Australia).
- Razonamiento de conocimiento general limitado al que emerge del pretraining sobre texto web en ingles.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- No dispone de modo thinking, vision ni audio.
- Multilingue: no; solo ingles.
- No incorpora entrenamiento de seguridad, rechazo ni alineacion.

## Casos de uso

- Linea base de investigacion en pretraining aumentado con recuperacion: sirve como control frente a `Kausp11/querylm-dclm-3.3b` para cuantificar, con el mismo computo y arquitectura, que aporta insertar bloques de busqueda en las secuencias de entrenamiento.
- Estudios de ablacion sobre datos: al entrenarse sobre DCLM-Edu en texto plano, permite comparar composiciones de dataset y estrategias de mezcla contra variantes con anotacion.
- Evaluacion de tecnicas de decodificacion y prompting few-shot: su naturaleza de modelo base lo hace adecuado para medir como el formato de las demostraciones afecta la continuacion en tareas de conocimiento.
- Reproduccion de recetas de entrenamiento nanochat: la model card documenta optimizador, schedule, tamano de lote, tokens y FLOPs, lo que permite replicar o escalar la receta en entornos de investigacion.
- Experimentos de eficiencia de inferencia: con 3.322,3M parametros reportados y contexto de 4.095 tokens, es un banco de pruebas manejable para comparar precisiones (bf16 frente a otras) y estrategias de serving.
- Analisis de sesgos y alucinacion en modelos base entrenados solo con web en ingles: util para estudiar como un modelo sin alineacion declara hechos falsos con fluidez y que sesgos arrastra del corpus DCLM-Edu.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de evaluacion se anadiran mas adelante.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 11 GB solo para pesos (5.539,7M parametros almacenados), mas overhead de activaciones y cache KV; el ejemplo de la model card se ejecuto en CPU en bfloat16 con torch 2.8.0 y transformers 4.56.0.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cabria en GPUs de 16-24 GB en bf16 y en GPUs consumer de 8-12 GB con cuantizacion, aunque no se documentan variantes cuantizadas.
- Cabe en GPU consumer: previsiblemente si en modelos con 16 GB o mas en bf16, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requiere `modeling_nanochat.py` del repositorio); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Standard 3.3B (DCLM-Edu) | 3.322,3M reportados (5.539,7M almacenados) | 4.095 | Apache-2.0 | Linea base de texto plano, solo ingles, sin benchmarks publicados |
| `Kausp11/querylm-dclm-3.3b` | Misma arquitectura y computo | 4.095 | No disponible en la informacion proporcionada | Modelo emparejado, pretraining con bloques de busqueda |
| `Kausp11/standard-dclm-3.3b-sft-search` | Misma base | 4.095 | No disponible en la informacion proporcionada | Version fine-tuneada para chat de esta linea base |

No se dispone de datos de benchmarks para establecer comparaciones de rendimiento con modelos de terceros de tamano similar.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un producto: la model card lo describe explicitamente como modelo de control para estudiar pretraining aumentado con busqueda.
- Modelo base sin formato de chat: solo continua texto; no sigue instrucciones ni mantiene conversaciones.
- Solo ingles y solo texto web: no cubre otros idiomas ni dominios especializados.
- Sin entrenamiento de seguridad ni de rechazo: puede generar contenido danino y "afirmara cosas falsas con fluidez"; el riesgo de alucinacion es alto.
- Sesgos desconocidos pero probables: al entrenarse sobre DCLM-Edu (texto web filtrado), hereda sesgos del corpus; no se documenta ninguna mitigacion.
- Contexto limitado a 4.095 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Carga insegura por defecto: `trust_remote_code=True` ejecuta Python del repositorio (`modeling_nanochat.py`); conviene revisar el codigo o fijar `revision=` a un commit verificado.
- Pesos duplicados bajo otro nombre (`Kausp11/searchlm-dclm_nc-baseline_d32_cm100B`), lo que puede generar confusion al localizar el modelo canonico.
- No hay resultados de evaluacion publicados, por lo que no es posible verificar su calidad empiricamente.
- Licencia Apache-2.0 permite uso comercial, pero el texto de entrenamiento DCLM-Edu es CC-BY-4.0 y el codigo de modelado deriva de nanochat (MIT), lo que conviene respetar en redistribuciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kausp11/standard-dclm-3.3b
- Modelo emparejado con busqueda: https://huggingface.co/Kausp11/querylm-dclm-3.3b
- Version fine-tuneada para chat: https://huggingface.co/Kausp11/standard-dclm-3.3b-sft-search
- Nombre anterior con pesos identicos: https://huggingface.co/Kausp11/searchlm-dclm_nc-baseline_d32_cm100B
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Codigo nanochat (upstream): https://github.com/karpathy/nanochat
