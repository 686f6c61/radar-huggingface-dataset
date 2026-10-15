# igorktech/Qwen3.5-2B-multiharness-RL-GGUF

## Resumen

Qwen3.5-2B-multiharness-RL-GGUF es una recopilacion de cuantizaciones en formato GGUF del modelo FineEnvs/Qwen3.5-2B-multiharness-RL, un ajuste fino por refuerzo (RL) sobre el modelo base Qwen/Qwen3.5-2B. La publica el usuario igorktech bajo licencia Apache 2.0, unicamente como distribucion de pesos cuantizados: no modifica los pesos mas alla de la cuantizacion ni representa un lanzamiento oficial de Qwen ni de FineEnvs. El modelo completo contiene 1.881.825.088 parametros (alrededor de 1,88 mil millones) y esta orientado a flujos de trabajo de agente y uso de herramientas, segun sus etiquetas declaradas.

El interes practico de esta ficha esta en el empaquetado: ofrece diez variantes de cuantizacion (desde Q8_0 hasta Q2_K) mas un proyector de vision independiente (mmproj en F16), lo que permite desplegar el modelo tanto en GPU de gama alta como en equipos de consumo o incluso en CPU mediante llama.cpp. Las cuantizaciones IQ y las de Q3 o inferiores se generaron con una importance matrix calculada sobre wikitext-2-raw, un detalle relevante para el usuario porque mejora la fidelidad frente a cuantizaciones sin imatrix en esos rangos tan agresivos.

Se trata de un modelo multimodal segun su pipeline declarado (image-text-to-text), de solo 1,88 B de parametros y con soporte declarado unicamente de ingles. El repositorio ocupa 12,5 GB en total. No se ha publicado informacion sobre longitud de contexto, composicion del dataset de RL ni resultados de benchmarks en los datos disponibles. La model card del autor advierte ademas de que la cabeza de multi-token prediction declarada en la configuracion de origen no esta presente en los pesos publicados, por lo que estos ficheros contienen solo el modelo principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles de la variante y del encoder de vision no disponibles |
| Parametros totales | 1.881.825.088 (≈1,88 mil millones) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS (imatrix), Q3_K_M (imatrix), IQ3_M (imatrix), Q2_K (imatrix); proyector de vision mmproj en F16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el repositorio incluye LICENSE, NOTICE y release_manifest.json del origen |

## Arquitectura y entrenamiento

El modelo procede de Qwen/Qwen3.5-2B, un transformer de 1,88 B de parametros con capacidades multimodales (entrada de imagen y texto). Sobre ese modelo base, FineEnvs aplico un ajuste fino por aprendizaje por refuerzo denominado multiharness-RL. El termino «multi-harness» sugiere entrenamiento sobre multiples entornos o arneses de evaluacion (tareas de agente y uso de herramientas); no obstante, la composicion exacta del dataset, el numero de tokens y la metodologia de RL no estan detallados en la informacion disponible.

En el plano tecnico, la configuracion de origen declara una cabeza de multi-token prediction (MTP) que no fue incluida en los pesos publicados, de modo que las cuantizaciones solo contienen el modelo principal. El proyector de vision se convirtio usando el preprocessor_config.json del repositorio Qwen/Qwen3.5-2B, ya que el repositorio fuente no lo incluia, y se asume que la arquitectura de vision es identica a la del modelo base. Las cuantizaciones IQ y las de Q3 o inferiores se generaron con importance matrix calculada sobre wikitext-2-raw. Los ajustes de muestreo recomendados por el autor son temperature 0,8 y top-p 1,0.

## Capacidades

- Generacion de texto conversacional en ingles: el modelo esta etiquetado como conversational y su pipeline declara image-text-to-text.
- Entrada multimodal de imagen y texto: se puede usar con llama-mtmd-cli pasando el fichero mmproj para tareas de descripcion o interpretacion de imagenes.
- Uso como agente: las etiquetas del repositorio incluyen explicitamente «agent», lo que apunta a un ajuste orientado a flujos de agentes y ejecucion de herramientas.
- Integracion con llama.cpp: todas las variantes estan en formato GGUF y son directamente cargables con llama-server, llama-cli o llama-mtmd-cli.
- Despliegue ligero: con 1,88 B de parametros y cuantizaciones de hasta Q2_K, el modelo puede ejecutarse en hardware muy modesto.
- No se ha documentado soporte explicito de tool calling en formato estructurado (JSON schema), modo de razonamiento (thinking), audio ni otras capacidades especiales en la informacion disponible.
- Idiomas: solo ingles declarado; no hay evidencia de soporte multilingue mas alla del ingles.

## Casos de uso

- Agentes locales en equipos de consumo: gracias a su tamano de 1,88 B y a las cuantizaciones Q4_K_M o inferiores (en torno a 1,1 GB o menos), el modelo puede ejecutarse en portatiles sin GPU dedicada y usarse como cerebro de un agente ligero que orqueste llamadas a herramientas.
- Asistente conversacional de bajo coste: con licencia Apache 2.0 y pesos GGUF, se puede integrar en aplicaciones de chat donde el coste de inferencia en la nube sea un factor critico, sirviendo texto en ingles con una calidad ajustada por RL.
- Descripcion y clasificacion de imagenes: usando el proyector mmproj F16 junto al modelo principal, se puede montar un pipeline local que genere descripciones o etiquetas de imagenes sin depender de APIs externas.
- Enrutamiento y clasificacion de intenciones en pipelines de agentes: un modelo pequeno como este es adecuado como clasificador rapido que decida que herramienta o subagente debe invocarse antes de llamar a un modelo mayor.
- Prototipado e investigacion en RL para agentes: al ser la version cuantizada de un fine-tune de RL sobre multiples arneses, sirve como referencia reproducible para estudiar el efecto de ese ajuste frente al modelo base Qwen3.5-2B.
- Despliegue en entornos con recursos muy limitados: las variantes IQ3_M o Q2_K (por debajo de 1 GB) permiten ejecutar el modelo en Raspberry Pi, contenedores pequeños o CPU, util para demos y pruebas offline.
- Generacion asistida de texto tecnico breve en ingles: resumenes, respuestas cortas o extraccion de datos a partir de documentos, siempre que la tarea no requiera contexto muy largo ni multilinguismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica ademas que la ficha del modelo fuente no declara ningun benchmark de imagen y que esta version se ajusto para uso de texto y herramientas, por lo que no se deben asumir resultados de evaluaciones multimodales.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los bits por peso de cada cuantizacion; son estimaciones, no cifras oficiales):
  - Q8_0: ≈2,0 GB
  - Q6_K: ≈1,55 GB
  - Q5_K_M: ≈1,35 GB
  - Q4_K_M: ≈1,15 GB
  - Q4_K_S: ≈1,1 GB
  - IQ4_XS: ≈1,0 GB
  - Q3_K_M: ≈0,9 GB
  - IQ3_M: ≈0,85 GB
  - Q2_K: ≈0,6 GB
  - Sumar aproximadamente 0,3-0,7 GB si se carga el proyector de vision mmproj en F16 (depende del encoder).
- Cabe sobradamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con memoria compartida en las cuantizaciones mas bajas.
- GPU de datacenter (A100, H100) no son necesarias; solo tendrian sentido para servir muchas replicas concurrentes o para lotes grandes.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli, llama-mtmd-cli), Ollama si se importa el GGUF, y cualquier runtime compatible con GGUF. Tambien se puede ejecutar completamente en CPU.
- Latencia y throughput estimados: no disponible. Por el tamano del modelo, en GPU de consumo moderna la decodificacion deberia ser interactiva (por encima de la velocidad de lectura humana), pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de sus fichas publicas conocidas; los del modelo de esta ficha se marcan como no disponibles cuando no constan.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-2B-multiharness-RL-GGUF | ≈1,88 B | no disponible | en | apache-2.0 | GGUF |
| Qwen3-1.7B | ≈1,72 B | 32 768 tokens (nativo) | multilingue | apache-2.0 | safetensors, GGUF |
| Llama-3.2-1B-Instruct | ≈1,24 B | 128 000 tokens | multilingue | Llama 3.2 Community License | safetensors, GGUF |
| SmolLM2-1.7B-Instruct | ≈1,71 B | 8192 tokens | en (principalmente) | apache-2.0 | safetensors, GGUF |

Diferencias relevantes: frente a Qwen3-1.7B y Llama-3.2-1B, este modelo declara unicamente ingles y no publica contexto ni benchmarks, por lo que la comparacion de rendimiento no es posible con la informacion disponible. Su ventaja diferencial es el ajuste por RL orientado a agentes y la disponibilidad inmediata de un proyector de vision en GGUF para llama.cpp.

## Limitaciones y advertencias

- No es un lanzamiento oficial: ni Qwen ni FineEnvs publican esta version; es una cuantizacion de terceros, sin garantias de fidelidad respecto al modelo fuente.
- Solo ingles declarado: no hay soporte multilingue documentado, por lo que no es adecuado para aplicaciones en castellano u otros idiomas.
- Contexto desconocido: no se ha publicado la longitud de contexto, lo que impide planificar tareas que requieran ventanas largas.
- Sin benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de vision, por lo que cualquier afirmacion de calidad seria especulativa.
- Riesgo de alucinacion: como cualquier modelo de 1,88 B, la tasa de errores facticos es alta y debe compensarse con verificacion externa.
- Cuantizaciones agresivas: Q3_K_M, IQ3_M y Q2_K degradan apreciablemente la calidad respecto a Q8_0 o Q6_K; se recomienda Q4_K_M o superior para uso en produccion.
- Vision no evaluada: el autor advierte que la ficha de origen no declara ningun benchmark de imagen y que la version se ajusto para texto y herramientas; el uso multimodal debe validarse por cuenta propia.
- Cabeza MTP ausente: los pesos publicados no incluyen la cabeza de multi-token prediction declarada en la configuracion de origen, lo que puede afectar a implementaciones que la esperen.
- Ajustes de muestreo: el autor recomienda temperature 0,8 y top-p 1,0; otros valores pueden degradar la calidad de las respuestas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/igorktech/Qwen3.5-2B-multiharness-RL-GGUF
- Modelo fuente (fine-tune de RL): https://huggingface.co/FineEnvs/Qwen3.5-2B-multiharness-RL
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-2B
- llama.cpp (runtime compatible): https://github.com/ggml-org/llama.cpp
