# kdkyum/two-hop-gpt-d192-lr4e-4-ansloss

## Resumen

`two-hop-gpt-d192-lr4e-4-ansloss` es una publicacion de checkpoints de HuggingFace obra del usuario kdkyum. No es un modelo de proposito general ni un asistente conversacional: es un artefacto de investigacion que reune las 36 ejecuciones con perdida calculada exclusivamente sobre la respuesta (*answer-only loss*) del proyecto de Weights & Biases `gpt-two-hop-d192-trainpy`. El objetivo declarado es estudiar el efecto de distintos hiperparametros sobre una tarea sintetica de razonamiento de dos saltos (*two-hop*) en grafos generados artificialmente.

La arquitectura subyacente es un transformer causal de tipo GPT-NeoX con `d_model` 192 y 12 capas, normalizacion LayerNorm, sesgos en las capas lineales, MLP con activacion ReLU, embeddings rotatorios aplicados a todas las dimensiones de cabeza con base 100.000 y sin dropout. La longitud de secuencia usada en entrenamiento es de 2.149 tokens para el subconjunto `hetero_graphs_swap_6to1split1` y de 1.997 tokens para `base_graph`.

Su relevancia es metodologica, no de producto: permite reproducir un barrido factorial de 36 configuraciones combinando subconjunto de datos, numero de cabezas de atencion entrenadas (6 de 32 o 3 de 64), weight decay (1, 3 o 5) y semilla (41, 42, 43). Cada carpeta de ejecucion incluye los pesos cargables con `from_pretrained`, el `config.json` de argumentos de entrenamiento, el `vocab.json` y un `log.jsonl` con los registros de entrenamiento y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso, familia GPT-NeoX (`GPTNeoXForCausalLM`) |
| Parametros totales | no disponible (ver nota al pie de la tabla) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.149 tokens (`hetero_graphs_swap_6to1split1`, `max_seq_len` 2149); 1.997 tokens (`base_graph`) |
| Tipos de cuantizacion | no disponible (solo se publican pesos sin cuantizar; no hay GGUF ni GPTQ en el repositorio) |
| Idiomas soportados | no disponible (los datos de entrenamiento son documentos sinteticos de grafos; el autor no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (cargables con `from_pretrained`), acompanados de `config.json` y `vocab.json` |
| `d_model` | 192 |
| Numero de capas | 12 |
| Cabezas de atencion entrenadas | 6 de 32 (`hd32`) o 3 de 64 (`hd64`), segun la ejecucion |
| Normalizacion y activacion | LayerNorm; MLP con ReLU |
| Posicional | RoPE (rotary) en todas las dimensiones de cabeza, base 100.000 |
| Dropout | 0 |
| Optimizador | AdamW (beta2 0.98, eps 1e-8), warmup de 1.000 pasos, decaimiento coseno de 4e-4 a 4e-5 hasta 100K pasos, gradient clipping en norma 1 |
| Tamano del repositorio | 6,6 GB |
| Fecha de publicacion en HuggingFace | 2026-10-13 (segun metadatos de la ficha; fecha anomala, ver limitaciones) |
| Descargas / likes | 0 / 0 |

Nota sobre el recuento de parametros: no figura en la model card. Una estimacion indirecta a partir del tamano del repositorio (6,6 GB repartidos entre 36 ejecuciones con checkpoints cada 10.000 pasos hasta 100.000) sugiere del orden de 18 MB por checkpoint en fp32, lo que situaria el modelo en la horquilla de 4 a 5 millones de parametros excluyendo embeddings. Es una estimacion editorial, no un dato confirmado por el autor.

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de tipo GPT-NeoX. La configuracion compartida por las 36 ejecuciones fija `d_model` 192, 12 capas, LayerNorm, sesgos en las proyecciones lineales y MLP con ReLU. La atencion usa embeddings rotatorios aplicados a todas las dimensiones de cabeza con base 100.000 y no aplica dropout en ninguna capa. Una particularidad del barrido es que solo se entrena un subconjunto de las cabezas de atencion: 6 de 32 en las ejecuciones `hd32` y 3 de 64 en las `hd64`, lo que convierte el repositorio en un banco de pruebas sobre la especializacion de cabezas.

El regimen de entrenamiento tambien es especifico. La perdida se calcula unicamente sobre la respuesta, definida como los dos tokens de nombre que siguen al token "is". Las filas del dataset son documentos completos, cada uno comenzando con `<bos>`, con el relleno compuesto por otras frases de la misma familia y un lote completo procesado en cada paso. Cada punto se codifica como `<bos>` y existe un token `<pad>` independiente para el relleno. El optimizador es AdamW con beta2 0.98 y eps 1e-8, learning rate 4e-4 tras un warmup de 1.000 pasos, decaimiento coseno hasta 4e-5 en el paso 100K y recorte de gradiente por norma 1. El weight decay se aplica unicamente a las matrices de pesos y a los dos embeddings. No se menciona en la informacion disponible ninguna fase de RLHF, DPO o ajuste por instrucciones.

## Capacidades

- Modelado de lenguaje causal restringido al dominio de los documentos sinteticos de grafos usados en el entrenamiento.
- Prediccion de los dos tokens de nombre que responden a una consulta de dos saltos dentro de un grafo descrito en el propio documento.
- Reproduccion de experimentos: cada checkpoint puede cargarse de forma independiente con `from_pretrained` para comparar configuraciones intermedias del entrenamiento.
- Analisis de trayectorias de aprendizaje mediante los ficheros `log.jsonl` de cada ejecucion (registros de entrenamiento y evaluacion).
- No dispone de soporte de *tool calling* ni de *function calling*.
- No dispone de capacidades de agente ni de razonamiento multi-paso de proposito general; el unico razonamiento multi-paso es el inducido por la tarea sintetica.
- Capacidades multilingues: no disponibles; el autor no declara idiomas ni composicion linguistica del dataset.
- No dispone de modo de razonamiento explicito (*thinking mode*), vision, audio ni ninguna otra modalidad.
- No esta ajustado con instrucciones ni con preferencias humanas, por lo que no mantiene conversaciones de forma fiable.

## Casos de uso

- Reproduccion de experimentos de razonamiento de dos saltos: cargar cada checkpoint con `from_pretrained` y evaluar la precision sobre el par de tokens de nombre permite replicar el barrido completo de 36 configuraciones sin reentrenar.
- Estudio de ablation de hiperparametros: la cuadricula cruza subconjunto de datos, numero de cabezas entrenadas, weight decay y semilla, de modo que se puede aislar la contribucion de cada factor con tres semillas por celda.
- Investigacion en interpretabilidad mecanistica: al entrenar solo 6 de 32 o 3 de 64 cabezas, el modelo es un banco de pruebas controlado para estudiar como se reparte la computacion entre cabezas en una tarea de composicion de dos pasos.
- Analisis del sesgo inductivo de RoPE: la configuracion aplica rotacion en todas las dimensiones de cabeza con base 100.000 sobre secuencias de hasta 2.149 tokens, lo que permite estudiar extrapolacion posicional en una tarea con estructura de grafo.
- Desarrollo de metodologia de *answer-only loss*: sirve como referencia para comparar el efecto de calcular la perdida solo sobre la respuesta frente a entrenar sobre el documento completo.
- Material docente: el reducido tamano del modelo y la disponibilidad de checkpoints intermedios cada 10.000 pasos lo hacen util para ilustrar el ciclo completo de entrenamiento y evaluacion en cursos de aprendizaje profundo.
- Baseline sintetico para nuevas arquitecturas: los resultados por paso registrados en `log.jsonl` permiten contrastar metodos alternativos sobre la misma distribucion de datos generada a partir de grafos c5_m16_N90.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas agregadas de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar, algo esperable dado que el modelo no es de proposito general. El unico material de evaluacion son los ficheros `log.jsonl` de cada ejecucion, que contienen los registros de entrenamiento y evaluacion de esa ejecucion concreta, pero no se proporcionan valores resumidos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por la horquilla de tamano estimada (del orden de 4 a 5 millones de parametros excluyendo embeddings), la inferencia en fp32 ocuparia unas decenas de megabytes, y en fp16 aproximadamente la mitad.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada moderna queda sobradamente dimensionada.
- Inferencia en CPU: viable. Con este orden de magnitud de parametros, la generacion en CPU con PyTorch es practica para evaluacion por lotes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de las ultimas generaciones, asi como en GPUs de gama baja y en hardware tipo Apple Silicon.
- Opciones de despliegue: al publicarse como pesos `GPTNeoXForCausalLM` en safetensors, la via natural es `transformers` con PyTorch (o `from_pretrained` directo). vLLM, TGI, llama.cpp y Ollama no estan confirmados para este repositorio: llama.cpp y Ollama requeririan una conversion a GGUF que no se proporciona, y vLLM/TGI estan pensados para modelos de mayor escala.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.
- Almacenamiento: el repositorio completo ocupa 6,6 GB, pero basta con descargar la carpeta de un unico checkpoint para hacer inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `kdkyum/two-hop-gpt-d192-lr4e-4-ansloss` | no disponible (estimacion de 4-5 M excluyendo embeddings) | 2.149 / 1.997 tokens | Razonamiento sintetico de dos saltos sobre grafos | MIT | 36 ejecuciones con checkpoints cada 10K pasos |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en el material proporcionado. Se trata de un artefacto de investigacion muy especifico, sin benchmarks publicos ni pipeline declarado, por lo que no es posible establecer una comparacion rigurosa con otras alternativas de la misma categoria sin datos verificables.

## Limitaciones y advertencias

- No es un modelo de proposito general: esta entrenado sobre documentos sinteticos de grafos y solo calcula la perdida sobre los dos tokens de nombre posteriores a "is". Fuera de esa distribucion su salida carece de garantias.
- Ausencia total de alineacion: no hay RLHF, DPO ni ajuste por instrucciones, por lo que no debe usarse como asistente ni exponerse a usuarios finales sin capas adicionales de control.
- Riesgo de alucinacion: aunque la tarea sea de prediccion de tokens concretos, cualquier uso fuera del dominio de grafos de entrenamiento producira texto sin fundamento. No se documentan tasas de error ni de calibracion.
- Sesgos conocidos: no disponibles. El autor no publica analisis de sesgos ni la composicion del dataset, mas alla de la descripcion del generador de grafos (subconjuntos `c5_m16_N90`, `hetero_graphs_swap_6to1split1` y `base_graph`).
- Limitacion de contexto: el techo practico es de 2.149 tokens. Documentos mas largos requeriran truncado o segmentacion, con la consiguiente perdida de informacion del grafo.
- Limitacion idiomatica: no se declara ningun idioma soportado. El vocabulario esta en `vocab.json` y no se especifica su cobertura linguistica.
- Restricciones de licencia: la licencia es MIT, que en principio permite uso comercial, modificacion y redistribucion con atribucion. No obstante, el uso comercial de este artefacto carece de sentido practico al no ser un modelo de proposito general, y el autor no ofrece garantias de ningun tipo.
- Ausencia de benchmarks: no hay metricas publicadas, de modo que no es posible justificar afirmaciones de rendimiento.
- Fecha de publicacion anomala: los metadatos indican creacion el 2026-10-13, una fecha posterior a la habitual en repositorios activos. Conviene verificar la integridad y procedencia del repositorio antes de reutilizarlo.
- Repositorio sin traccion: 0 descargas y 0 likes, sin pipeline declarado ni idiomas declarados, lo que limita la validacion por parte de terceros.
- Interoperabilidad: no se publican pesos cuantizados (GGUF, GPTQ, AWQ), por lo que el despliegue con llama.cpp u Ollama exigiria una conversion propia.

## Enlaces

- HuggingFace: https://huggingface.co/kdkyum/two-hop-gpt-d192-lr4e-4-ansloss
- Proyecto de Weights & Biases citado por el autor: `gpt-two-hop-d192-trainpy` (nombre proporcionado en la model card; no se incluye URL)
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
- Busqueda web: no se han encontrado enlaces relevantes sobre el modelo. Los resultados devueltos por la busqueda no guardan ninguna relacion con el modelo ni con inteligencia artificial, por lo que se descartan y no se listan.
