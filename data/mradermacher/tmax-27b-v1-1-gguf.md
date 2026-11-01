# mradermacher/tmax-27b-v1.1-GGUF

## Resumen

tmax-27b-v1.1 es un modelo de lenguaje de aproximadamente 26.900 millones de parametros (26,9 B) afinado mediante aprendizaje por refuerzo (reinforcement learning) y especializado en tareas de agente de terminal. El modelo original lo desarrolla el usuario TMaxxx y esta publicado bajo licencia Apache 2.0; la version aqui descrita es una cuantizacion GGUF estatica realizada por mradermacher, que la distribuye en HuggingFace para su uso con llama.cpp y herramientas compatibles.

El modelo parte de una base de 27 B de parametros (segun la nomenclatura del autor) y se ha entrenado sobre el dataset TMaxxx/tmax-13k-v1.1, orientado a interacciones conversacionales y a la ejecucion de comandos en entornos de terminal. Su relevancia actual radica en que cubre un nicho concreto: agentes que operan en shell, automatizacion de tareas de sistema y flujos de trabajo multi-paso donde el modelo debe emitir comandos y razonar sobre su salida.

La ficha se centra en la version GGUF cuantizada, que ofrece 11 variantes de cuantizacion (desde Q2_K hasta Q8_0) para adaptarse a distintos presupuestos de VRAM. El modelo esta etiquetado unicamente en ingles y no se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 26.895.998.464 (26,9 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (version cuantizada); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base (numero de capas, dimensiones de atencion, tipo de atencion, etc.) en la informacion proporcionada. Por el numero de parametros (26,9 B) y la nomenclatura del autor, se trata de un transformer denso de aproximadamente 27 B de parametros, no de una arquitectura MoE.

El entrenamiento se ha realizado mediante aprendizaje por refuerzo (pipeline `reinforcement-learning`) sobre el dataset TMaxxx/tmax-13k-v1.1, un conjunto de datos orientado a tareas de agente de terminal. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas adicionales como DPO o RLHF con recompensas humanas. La cuantizacion GGUF la realiza mradermacher a partir de los pesos del modelo base TMaxxx/tmax-27b-v1.1, usando el formato de conversion `hf` y cuantizacion estatica (quantize_version 2, output_tensor_quantised 1).

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento orientado a tareas de agente de terminal: emision de comandos, interpretacion de salida y planificacion multi-paso.
- Entrenamiento especifico mediante refuerzo para tareas de agente (tags `terminal-agent` y `reinforcement-learning`).
- Soporte de conversaciones multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estandar.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo thinking explicito: no disponible.

## Casos de uso

- Automatizacion de tareas de shell: el modelo puede recibir una descripcion en lenguaje natural y emitir la secuencia de comandos de terminal correspondiente, gracias a su entrenamiento especifico como agente de terminal sobre el dataset tmax-13k-v1.1.
- Agentes de operaciones de sistema: integrado en un bucle de agente, puede ejecutar comandos, leer la salida y decidir el siguiente paso, lo que encaja con tareas de diagnostico, gestion de ficheros y monitorizacion de servicios.
- Asistente de desarrollo en local: con la cuantizacion Q4_K_M (16,6 GB) puede desplegarse en una estacion de trabajo con GPU de consumo alta y usarse como asistente para redactar scripts de shell y comandos de administracion.
- Pipelines de CI/CD con validacion de comandos: el modelo puede generar y revisar comandos antes de su ejecucion en entornos controlados, reduciendo errores en tareas repetitivas de build y despliegue.
- Formacion y simulacion de entornos de terminal: util para generar ejercicios, explicar comandos y simular sesiones de terminal en herramientas educativas, dado su enfoque conversacional en ingles.
- Prototipado de agentes de investigacion: al estar bajo licencia Apache 2.0 y disponible en GGUF, sirve como base para experimentar con tecnicas de RL y agentes sin restricciones de licencia para uso comercial.
- Despliegue en entornos con VRAM limitada: las variantes Q2_K (10,8 GB) y Q3_K_S (12,2 GB) permiten ejecutar el modelo en GPU de consumo de gama media-alta, aunque con perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano del fichero GGUF, sin contar overhead de contexto):
  - Q2_K: 10,8 GB
  - Q3_K_S: 12,2 GB
  - Q3_K_M: 13,4 GB
  - Q3_K_L: 14,4 GB
  - IQ4_XS: 15,3 GB
  - Q4_K_S: 15,7 GB
  - Q4_K_M: 16,6 GB
  - Q5_K_S: 18,8 GB
  - Q5_K_M: 19,3 GB
  - Q6_K: 22,2 GB
  - Q8_0: 28,7 GB
- GPU recomendadas: para Q8_0 se requiere una GPU de 32 GB o superior (A100 40 GB, H100, RTX A6000). Para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) es suficiente. Para Q2_K y Q3_K_S, una RTX 4080 (16 GB) o RTX 3090 (24 GB) cubren el modelo con margen.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y modelos con 16 GB o mas segun la cuantizacion elegida.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), y servidores compatibles con endpoints. No se indica soporte explicito para vLLM o TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables identificados en la informacion proporcionada. Como referencia estructural, se puede comparar con otros transformers densos de ~27 B en formato GGUF, pero no se aportan metricas que permitan una comparacion rigurosa.

| Modelo | Parametros | Contexto | Licencia | Formato | Benchmark |
|---|---|---|---|---|---|
| tmax-27b-v1.1 (GGUF) | 26,9 B | no disponible | Apache 2.0 | GGUF | no disponible |
| Alternativas de ~27 B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta garantizado y probablemente degradara la calidad.
- No se han publicado benchmarks, por lo que no hay evidencia publica de su rendimiento en tareas estandar (MMLU, HumanEval, GSM8K, etc.).
- Al ser un modelo especializado en agentes de terminal, existe riesgo de generar comandos destructivos si se usa sin sandboxing ni validacion humana; se recomienda ejecutar en entornos aislados.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado en tareas de ejecucion de comandos donde un error puede tener consecuencias reales.
- La longitud de contexto no esta documentada, lo que dificulta planificar su uso en conversaciones o sesiones de agente largas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset de entrenamiento deben verificarse por separado; la informacion disponible no detalla restricciones adicionales.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente el rendimiento; el propio autor marca Q3_K_M como "lower quality".
- El numero de descargas (194) y likes (0) es bajo, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/mradermacher/tmax-27b-v1.1-GGUF
- Modelo base: https://huggingface.co/TMaxxx/tmax-27b-v1.1
- Dataset de entrenamiento: https://huggingface.co/datasets/TMaxxx/tmax-13k-v1.1
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/tmax-27b-v1.1-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#tmax-27b-v1.1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
