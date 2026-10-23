# praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-ctxq

## Resumen

`praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-ctxq` es un adaptador LoRA (PEFT) publicado por el usuario `praiselab-picuslab` sobre el modelo base `princeton-nlp/Sheared-LLaMA-1.3B`. Por la nomenclatura del repositorio y las etiquetas declaradas (`benchmark-slm`, `or2`, `dataset-msmarco`, `strategy-ctxq`), no se trata de un modelo de propósito general, sino de un artefacto de evaluación generado dentro de un pipeline de benchmarking de modelos de lenguaje pequenos (SLM) sobre el conjunto de datos MS MARCO, con una estrategia concreta de construccion de entrada (probablemente concatenacion de contexto y consulta, "ctx+query").

El modelo resultante es un transformer decoder-only de aproximadamente 1.300 millones de parametros, con una ventana de contexto de 2.048 tokens y entrenamiento exclusivamente en ingles. Su relevancia es acotada: sirve como punto de comparacion reproducible en experimentos de ajuste fino eficiente (LoRA) sobre tareas de recuperacion/relevancia, no como asistente desplegable en produccion.

Conviene advertir de entrada de tres hechos que condicionan cualquier evaluacion: el repositorio esta marcado como acceso restringido (gated), el tamano declarado del repo es de 0,0 GB (compatible con un repositorio vacio o con pesos no publicados), y no se declara licencia. Ademas, no hay descargas ni "likes" registrados, por lo que no existe evidencia publica de validacion por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Sheared-LLaMA-1.3B) + adaptador LoRA (PEFT) |
| Parametros totales | ~1,3 mil millones en el modelo base; el adaptador LoRA anade un numero reducido de parametros entrenables (no disponible el conteo exacto) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (heredada del modelo base Sheared-LLaMA-1.3B) |
| Tipos de cuantizacion | No disponible en la ficha. Al ser un adaptador LoRA, la cuantizacion se aplica al modelo base: int8 y 4-bit NF4 via bitsandbytes, o GGUF (q4_K_M, q5_K_M, q8_0) tras fusionar el adaptador |
| Idiomas soportados | Ingles (`en`) |
| Licencia | No disponible. El adaptador no declara licencia; el modelo base pertenece a la estirpe LLaMA-2, por lo que deben verificarse sus condiciones en la ficha original |
| Formato de pesos | `safetensors` (adaptador LoRA, libreria `peft`) |

## Arquitectura y entrenamiento

El modelo base, Sheared-LLaMA-1.3B, se obtiene mediante poda estructurada (*shearing*) de LLaMA-2-7B seguida de un preentrenamiento continuado sobre del orden de 50.000 millones de tokens, según la documentacion publica del modelo base. La arquitectura resultante mantiene el esquema decoder-only clasico de LLaMA-2 (atención causal multi-cabeza, RMSNorm, SwiGLU, RoPE) con contexto de 2.048 tokens. Sobre esa base, este repositorio anade un adaptador LoRA de bajo rango, que es el unico artefacto presumiblemente entrenado por el autor.

No se dispone de informacion sobre el numero de tokens de ajuste, la composicion exacta del dataset de entrenamiento, el rango y alpha del adaptador, la tasa de aprendizaje ni si se aplicaron fases de RLHF o DPO. La etiqueta `strategy-ctxq` sugiere que el ajuste se realizo sobre pares contexto-consulta derivados de MS MARCO (`microsoft/ms_marco`), y la etiqueta `or2` apunta a una variante de tarea de recuperacion de informacion, pero ninguna de estas hipotesis esta documentada en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva en ingles, condicionada por un contexto de entrada.
- Modelado de relevancia consulta-pasaje, presumiblemente, dado el dataset y la estrategia declarados (`dataset-msmarco`, `strategy-ctxq`).
- Ajuste fino eficiente: el artefacto es un adaptador LoRA, por lo que puede combinarse con el modelo base sin reentrenar los pesos completos.
- Capacidad multilingue: limitada al ingles segun la etiqueta de idioma declarada.
- Tool calling / function calling: no disponible; no hay evidencia de que el modelo base ni el adaptador hayan sido entrenados para ello.
- Comportamiento agentico o razonamiento multi-paso: no disponible; un modelo de 1,3B sin entrenamiento especifico no ofrece garantias en este terreno.
- Modo "thinking", vision o audio: no soportados.

## Casos de uso

- **Evaluacion comparativa de SLM en recuperacion de informacion**: usar el adaptador como una de las configuraciones del arnes `benchmark-slm` sobre MS MARCO y medirla contra otras estrategias de ajuste (full fine-tuning, otros rangos LoRA, otras estrategias de construccion de entrada) bajo el mismo protocolo.
- **Reranking de pasajes en pipelines de busqueda**: puntuar pares consulta-pasaje concatenados segun la estrategia `ctxq` para reordenar los resultados de un recuperador inicial; el coste por inferencia es bajo porque el modelo tiene solo 1,3B de parametros.
- **Linea base reproducible para experimentos de LoRA**: servir como referencia contra la que medir nuevos adaptadores sobre el mismo modelo base, mismo dataset y misma tokenizacion, eliminando variables de confusión.
- **Prototipado en hardware modesto**: al ocupar aproximadamente 2,6 GB en fp16, permite iterar en una unica GPU de consumo antes de escalar a un modelo mayor.
- **Estudios de ablacion sobre estrategias de contexto**: comparar `ctxq` frente a otras variantes de construccion de entrada (solo consulta, solo pasaje, ventanas deslizantes) manteniendo fijo el resto del pipeline.
- **Docencia y laboratorios de ajuste eficiente**: ejemplo completo y de bajo coste de extremo a extremo (dataset publico, modelo base abierto, adaptador PEFT) para practicas de fine-tuning.
- **Analisis de sensibilidad a la cuantizacion**: dado el reducido tamano del modelo, permite medir la degradacion de métricas al pasar de fp16 a int8 y 4-bit en tareas de relevancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tarjeta de modelo con métricas, no registra descargas y declara un tamano de 0,0 GB, por lo que no es posible verificar ningun resultado sobre MS MARCO (MRR@10, nDCG@10, Recall@k) ni sobre benchmarks de conocimiento general (MMLU, HumanEval, GSM8K).

## Requisitos de hardware

- **VRAM para inferencia (modelo base fusionado con el adaptador)**: ~2,6 GB en fp16; ~1,4 GB en int8; ~0,8-1,0 GB en 4-bit NF4 (mas overhead de activaciones y cache KV, tipicamente 0,5-1,5 GB adicionales segun longitud de secuencia).
- **GPU recomendadas**: cualquier GPU con 8 GB o mas para fp16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4090); A100/H100 no aportan ventaja significativa a este tamano salvo por agregacion de throughput.
- **CPU**: viable en inferencia con llama.cpp/Ollama tras fusionar el adaptador y convertir a GGUF; el rendimiento dependera del numero de nucleos y del ancho de banda de memoria.
- **Opciones de despliegue**: `transformers` + `peft` (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI, y llama.cpp/Ollama tras fusion con `merge_and_unload` y conversion a GGUF.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este adaptador (sobre Sheared-LLaMA-1.3B) | ~1,3B | 2.048 | No disponible | Acceso restringido (gated) |
| princeton-nlp/Sheared-LLaMA-1.3B (base) | ~1,3B | 2.048 | Sujeta a las condiciones de la estirpe LLaMA-2; verificar ficha | Publico |
| TinyLlama-1.1B | ~1,1B | 2.048 | Apache-2.0 | Publico |
| Pythia-1.4B | ~1,4B | 2.048 | Apache-2.0 | Publico |
| OPT-1.3B | ~1,3B | 2.048 | Licencia OPT (uso no comercial) | Publico |

La comparacion relevante aqui no es de rendimiento -no hay datos publicados para este adaptador- sino de disponibilidad: los tres modelos alternativos de la tabla son descargables sin friccion y con licencia verificable, mientras que este repositorio exige aceptar condiciones y no declara licencia.

## Limitaciones y advertencias

- **Acceso restringido**: el repositorio es gated; es necesario aceptar condiciones en HuggingFace antes de descargar, y no se garantiza la aprobacion.
- **Licencia ausente**: no se declara licencia para el adaptador. El modelo base deriva de LLaMA-2, cuyas condiciones pueden imponer restricciones al uso comercial. No debe asumirse uso comercial libre.
- **Artefacto de benchmark, no producto**: la nomenclatura indica un checkpoint experimental de un pipeline de evaluacion; no hay tarjeta de modelo, ni métricas, ni garantia de calidad.
- **Sin validacion externa**: 0 descargas, 0 "likes", repositorio de 0,0 GB. No hay evidencia de que los pesos sean utilizables o esten efectivamente publicados.
- **Idioma unico**: solo ingles; cualquier uso en castellano requeriria evaluacion propia y probablemente reentrenamiento.
- **Ventana de contexto corta**: 2.048 tokens limitan la cantidad de contexto recuperado que puede concatenarse con la consulta en la estrategia `ctxq`.
- **Riesgo de alucinacion**: con 1,3B de parametros y preentrenamiento continuado sobre un subconjunto de datos, la generacion libre es propensa a fabricar contenido. En tareas de scoring debe usarse como clasificador/reranker, no como fuente de hechos.
- **Sesgos del dataset**: MS MARCO procede de consultas reales de un motor de busqueda comercial; los pasajes y consultas arrastran los sesgos de esa distribucion (dominio web, consultas en ingles, ruido en las etiquetas de relevancia).
- **Sin soporte de tool calling ni agentes**: no debe integrarse en flujos que dependan de llamadas a funciones o razonamiento multi-paso.
- **Hipotesis no verificadas**: la interpretacion de `ctxq` y `or2` se deduce del nombre y las etiquetas; no hay documentacion que la confirme.

## Enlaces

- [Ficha del adaptador en HuggingFace](https://huggingface.co/praiselab-picuslab/benchmark-slm-msmarco-sheared-llama-ctxq)
- [Modelo base: princeton-nlp/Sheared-LLaMA-1.3B](https://huggingface.co/princeton-nlp/Sheared-LLaMA-1.3B)
- [Dataset MS MARCO (microsoft/ms_marco)](https://huggingface.co/datasets/microsoft/ms_marco)
- [Repositorio de Sheared-LLaMA (Princeton NLP)](https://github.com/princeton-nlp/Sheared-LLaMA)
- [Documentacion de PEFT](https://huggingface.co/docs/peft)
