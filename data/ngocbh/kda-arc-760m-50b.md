# ngocbh/kda-arc-760M-50B

## Resumen

KDA-ARC 760M es un modelo de lenguaje de 798.578.880 parametros entrenado desde cero por el usuario ngocbh sobre 50.000 millones de tokens del corpus FineWeb-Edu. Su interes no reside en el rendimiento bruto, sino en la arquitectura: sustituye la atencion softmax clasica por capas de atencion lineal del tipo KDA (Kimi Delta Attention) con una variante propia denominada ARC, que anade una segunda memoria delta "lenta" por cabeza que almacena lo que el modelo recupera de su memoria rapida, con promocion en lectura.

El modelo se distribuye con pesos en fp32 (aunque el autor recomienda entrenar en bf16), tiene 24 capas, dimension oculta 1536, 12 cabezas con head_dim 128 y tokenizador Llama-2 con vocabulario de 32000 entradas. El entrenamiento se realizo con receta flame/torchtitan sobre 8 GPU B200, con seq_len 32768 en empaquetado varlen y contexto de 4096, alcanzando una perdida final de 2,1184 (media de las ultimas 1000 iteraciones).

Es relevante ahora como pieza de investigacion reproducible: el autor publica los logs de entrenamiento y senala que las ejecuciones KDA y KDA-ARC vieron exactamente los mismos batches en el mismo orden, lo que permite una comparacion controlada entre ambas variantes arquitectonicas. No obstante, el repositorio no incluye model card con benchmarks, licencia ni idiomas declarados, y el modelo no soporta cache de decodificacion recurrente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal KDA + ARC (memoria delta de dos niveles por cabeza) |
| Parametros totales | 798.578.880 (799M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 (entrenado con seq_len 32768 en empaquetado varlen) |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32; el autor indica entrenamiento en bf16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | fla (fork propio del proyecto, `fla-latest/`) |
| Tokenizador | Llama-2, vocabulario 32000 |
| Capas / hidden / cabezas | 24 / 1536 / 12 (head_dim 128) |
| Tokens de entrenamiento | 50B (95.576 pasos x 0,5M tokens, seed 22) |
| Cache de decodificacion | No (`use_cache=False`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 24 capas que reemplaza la atencion softmax por atencion lineal KDA (Kimi Delta Attention). Sobre esa base, la variante ARC introduce una segunda memoria delta "lenta" por cabeza que almacena lo que el modelo recupera de su memoria rapida, con un mecanismo de promocion en lectura. Se trata, por tanto, de un diseno de memoria asociativa de dos niveles dentro de cada cabeza de atencion, orientado a retener informacion a mas largo plazo sin el coste cuadratico de la atencion densa.

El entrenamiento uso el subconjunto `sample-100BT` de HuggingFaceFW/fineweb-edu, consumiendo 50B tokens en 95.576 pasos de 0,5M tokens con semilla 22. La receta (flame / torchtitan) emplea AdamW con lr 1e-3, eps 1e-15, weight decay 0,01, 2048 pasos de warmup y decaimiento coseno hasta 0,03x, con seq_len 32768 en empaquetado varlen, contexto 4096, grad clip 1.0, 8 GPU B200 y acumulacion de gradiente 2. La perdida final (media de las ultimas 1000 iteraciones) fue 2,1184. El punto metodologico destacable es que las ejecuciones KDA y KDA-ARC procesaron batches identicos en el mismo orden, lo que habilita una comparacion directa entre ambas variantes.

## Capacidades

- Generacion de texto autoregresiva basada en modelado de lenguaje causal sobre FineWeb-Edu.
- Razonamiento y conocimiento general derivados del entrenamiento sobre corpus educativo web; sin evaluacion publicada que lo cuantifique.
- Capacidad multilingue: no disponible (el tokenizador Llama-2 cubre principalmente ingles y algo de codigo, pero el autor no declara idiomas).
- Tool calling / function calling: no disponible; no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, vision o audio: no disponibles.
- Memoria asociativa de dos niveles (ARC) como capacidad arquitectonica diferencial frente a KDA estandar.
- Sin cache de decodificacion recurrente: la generacion debe recomputar el prefijo completo en cada paso, lo que limita el uso interactivo.

## Casos de uso

- Investigacion en atencion lineal: el modelo sirve como banco de pruebas reproducible para estudiar el efecto de anadir una segunda memoria delta lenta frente a KDA puro, gracias a que ambas ejecuciones compartieron batches identicos.
- Experimentos controlados de memoria asociativa: permite medir retencion de informacion a distintas distancias dentro de la ventana de 4096 tokens comparando KDA y KDA-ARC con la misma receta y datos.
- Base para fine-tuning academico: con 799M parametros y pesos en safetensors, es viable ajustarlo en un unico nodo de GPU para tareas downstream de investigacion, siempre que se use el fork de fla requerido.
- Estudio de eficiencia de atencion lineal: al no usar softmax, es util para analizar coste computacional y comportamiento de gradientes en secuencias largas (entrenado con seq_len 32768 en varlen).
- Reproduccion de recetas de entrenamiento: los logs publicados en `training_logs/` y la configuracion `flame/configs/kda_arc_760M_hd128.json` permiten replicar el pipeline flame/torchtitan a menor escala.
- Evaluacion de estrategias de decodificacion sin cache: escenario de investigacion para medir el coste de recomputar el prefijo y explorar alternativas de cache recurrente.
- Generacion de texto offline por lotes: dado que no hay cache de decodificacion, encaja mejor en procesos batch no interactivos que en serving en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida final de entrenamiento: 2,1184 (media de las ultimas 1000 iteraciones) sobre FineWeb-Edu.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,2 GB solo para pesos (coincide con el tamano del repo), mas activaciones y estados de memoria; en bf16 se reduciria a unos 1,6 GB para pesos.
- Entrenamiento de referencia: 8 GPU NVIDIA B200 con acumulacion de gradiente 2 y seq_len 32768 en varlen.
- GPU recomendadas para inferencia: cualquier GPU con al menos 8-12 GB de VRAM para fp32 con margen; una RTX 4090 (24 GB) o A100/H100 son holgadas para los pesos.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas de 8 GB o mas en bf16, aunque no hay mediciones publicadas.
- Opciones de despliegue: requiere el fork `fla-latest/` del proyecto para registrar `model_type` `kda_arc`; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI. La libreria declarada es fla.
- Latencia y throughput: no disponibles. La ausencia de cache (`use_cache=False`) implica recomputar el prefijo en cada paso de generacion, con coste creciente con la longitud.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KDA-ARC 760M (este) | 799M | 4096 | Atencion lineal KDA + ARC | No disponible | Hugging Face, requiere fork fla |
| KDA 760M (variante del autor) | 799M | 4096 | Atencion lineal KDA | No disponible | Referenciado en la model card, sin enlace directo |
| Alternativas de atencion lineal de tamano similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Licencia no declarada: no hay autorizacion explicita de uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: no hay garantia de calidad fuera del ingles predominante en FineWeb-Edu.
- Sin benchmarks publicados: no es posible evaluar calidad frente a modelos de tamano comparable; la unica metrica es la perdida de entrenamiento.
- Sin cache de decodificacion (`use_cache=False`): la generacion recomputa el prefijo, lo que penaliza latencia y hace inviable el serving interactivo.
- Dependencia de un fork propio de fla: la carga exige `fla-latest/`; el modelo no es portable a stacks estandar sin adaptacion.
- Riesgo de alucinacion: inherente a un modelo de 799M entrenado sobre corpus web; sin RLHF/DPO documentado, no hay alineacion reportada.
- Sesgos: no documentados; FineWeb-Edu filtra contenido educativo pero no elimina sesgos de la web.
- Contexto efectivo de 4096 tokens: aunque se entreno con seq_len 32768 en varlen, el contexto declarado es 4096, lo que limita tareas de documento largo.
- Pesos en fp32: mayor huella de almacenamiento (3,2 GB) que una distribucion en bf16.
- Proyecto con 0 descargas y 0 likes: sin validacion por parte de la comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ngocbh/kda-arc-760M-50B
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Libreria fla: no disponible enlace directo en la informacion proporcionada
- Paper de KDA (Kimi Delta Attention): no disponible enlace en la informacion proporcionada
- Logs de entrenamiento: `training_logs/` dentro del repositorio del modelo
- Configuracion de entrenamiento: `flame/configs/kda_arc_760M_hd128.json` dentro del repositorio del modelo
