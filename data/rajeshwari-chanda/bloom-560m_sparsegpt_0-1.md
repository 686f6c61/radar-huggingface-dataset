# Rajeshwari-Chanda/bloom-560m_sparsegpt_0.1

## Resumen

`bloom-560m_sparsegpt_0.1` es una variante podada del modelo `bigscience/bloom-560m`, publicada por el usuario Rajeshwari-Chanda en Hugging Face. Se trata de un transformer decoder-only de 559.214.592 parametros (cifra extraida directamente de los pesos `safetensors`) sobre el que se ha aplicado SparseGPT, un metodo de poda post-entrenamiento en un unico paso que elimina pesos sin necesidad de reentrenar el modelo completo. El sufijo `0.1` apunta a un nivel de sparsity del 10 por ciento, aunque el autor no documenta el ratio exacto ni el procedimiento aplicado.

La relevancia del artefacto es experimental: sirve para estudiar como degrada la poda a un modelo multilingue pequeno y para comparar variantes de sparsity dentro de la misma familia (el autor publica tambien una version `sparsegpt_0.4`). No es un modelo orientado a produccion: la model card es la plantilla automatica de Hugging Face, sin informacion de entrenamiento, licencia, idiomas ni evaluacion, y el repositorio acumula 0 descargas y 0 likes desde su publicacion.

Tecnicamente hereda todas las caracteristicas del modelo base BLOOM-560m: 24 capas, atencion con ALiBi en lugar de embeddings posicionales aprendidos, activaciones GeGLU, vocabulario multilingue de aproximadamente 250.000 tokens y una ventana de contexto de 2.048 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion causal, ALiBi y GeGLU (heredada de bigscience/bloom-560m); no documentada en la model card |
| Parametros totales | 559.214.592 (segun los pesos safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (segun el modelo base BLOOM-560m; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible; no se publican variantes cuantizadas. El checkpoint es un modelo transformers estandar y admite cuantizacion posterior con bitsandbytes, GPTQ/AWQ o conversion a GGUF |
| Idiomas soportados | no disponible en la model card; el modelo base BLOOM se entreno con 46 idiomas naturales y 13 lenguajes de programacion |
| Licencia | no disponible (la model card no especifica ninguna; el modelo base bigscience/bloom-560m se distribuye bajo BigScience BLOOM RAIL 1.0) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB (coherente con precision fp16/bf16: 559,2 M de parametros x 2 bytes) |
| Pipeline declarado | text-generation |
| Fecha de creacion en el Hub | 2026-10-03 (segun el repositorio) |

## Arquitectura y entrenamiento

El modelo base, `bigscience/bloom-560m`, es un transformer decoder-only desarrollado por BigScience con atencion causal, normalizacion LayerNorm previa a cada subcapa, activaciones GeGLU y embeddings posicionales ALiBi (sin parametros posicionales aprendidos). La variante de 560 millones de parametros tiene 24 capas, 16 cabezas de atencion y una dimension oculta de 1024, con un vocabulario multilingue de aproximadamente 250.000 tokens. Se entreno sobre el corpus ROOTS (1,6 TB de texto, 498 datasets y 46 idiomas naturales mas 13 lenguajes de programacion); segun el articulo de BLOOM, los modelos de la familia distintos del 176B se entrenaron con 341.000 millones de tokens. El modelo base no paso por RLHF ni DPO: es un modelo de completado puro.

Sobre ese checkpoint se aplico SparseGPT, un metodo de poda one-shot basado en la reconstruccion de la matriz de Hessiana que elimina pesos columna a columna sin ajuste fino posterior. No hay informacion publicada sobre el ratio exacto de sparsity, sobre si la poda es no estructurada o semiestructurada 2:4, ni sobre si hubo una fase de recuperacion (recovery fine-tuning) con LoRA o similar. Tampoco se especifican los hiperparametros de la poda, el dataset de calibracion ni el impacto sobre la perplejidad. La model card no contiene ninguna informacion tecnica adicional; es la plantilla automatica de Hugging Face sin rellenar.

## Capacidades

- Generacion de texto autoregresiva en modo completado: al no estar alineado con instrucciones, no mantiene formato de chat ni responde a consignas directas sin ejemplos en el prompt.
- Capacidad multilingue heredada del vocabulario BLOOM, con calidad muy desigual por idioma y limitada por el tamano del modelo.
- Generacion de codigo a nivel basico: el corpus de entrenamiento incluye lenguajes de programacion, pero a 560 M de parametros la calidad es baja y no hay benchmark publicado.
- Clasificacion y extraccion zero-shot o few-shot mediante prompts de completado (analisis de sentimiento, etiquetado, extraccion de entidades).
- Extraccion de representaciones internas (hidden states) para tareas de clasificacion, clustering o similitud semantica.
- Ajuste fino ligero (LoRA, adapters) sobre tareas de dominio concretas con recursos modestos.
- No dispone de tool calling ni de function calling: no hay plantilla de chat, ni tokens especiales de herramienta, ni entrenamiento en trayectorias de agente.
- No soporta razonamiento multi-paso guiado, modo thinking, vision, audio ni ninguna modalidad distinta del texto.
- La poda puede degradar de forma no uniforme las capacidades anteriores; no existe evaluacion que cuantifique esa perdida.

## Casos de uso

- Investigacion sobre poda de modelos: reproducir el efecto de distintos ratios de sparsity (comparando esta variante con `sparsegpt_0.4` y con el modelo denso base) midiendo perplejidad y tareas downstream para estudiar la curva de degradacion.
- Pruebas de integracion y humo (smoke tests) en pipelines de inferencia: al ocupar poco mas de 1 GB en fp16, permite validar despliegues con vLLM, TGI o transformers en entornos de CI sin consumir GPU de gama alta.
- Fine-tuning ligero con LoRA en dominios verticales: 559 M de parametros caben en una unica GPU de consumo con margen para batch y optimizador, lo que permite adaptar el modelo a clasificacion de tickets, resumen de documentos cortos o generacion de plantillas.
- Generacion de texto en hardware sin GPU: el modelo puede ejecutarse en CPU o en dispositivos tipo placa embebida para demos offline, prototipos educativos o aplicaciones de autocompletado con presupuesto de latencia relajado.
- Aumento de datos sinteticos: generar variaciones de frases o ejemplos de entrenamiento multilingues que despues se filtran y se usan para aumentar un dataset, asumiendo la necesidad de una etapa de limpieza por la calidad limitada del modelo.
- Docencia y analisis de arquitecturas: el modelo permite inspeccionar el efecto de ALiBi, del vocabulario multilingue y de la poda en un transformer de tamano manejable, con pesos legibles en safetensors.
- Analisis de sesgos y de representaciones multilingues: extraer embeddings de las capas ocultas para estudiar como se distribuyen idiomas y conceptos en un modelo entrenado con ROOTS, incluyendo el efecto de la poda sobre esas representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion (todas las celdas figuran como `More Information Needed`), no hay resultados de MMLU, HumanEval, GSM8K ni perplejidad, y no existe comparacion medida contra el modelo denso base. Tampoco hay datos de latencia o throughput publicados.

## Requisitos de hardware

- VRAM estimada para los pesos: unos 2,2 GB en fp32, 1,1 GB en fp16/bf16, 0,6 GB en int8 y alrededor de 0,3 GB en cuantizacion de 4 bits.
- Cache KV a la maxima longitud de contexto (2.048 tokens, 24 capas, 16 cabezas, dimension de cabeza 64): aproximadamente 200 MB en fp16, que se suma a la memoria de los pesos.
- Cabe sin problema en GPU de consumo: RTX 3050, RTX 3060, RTX 4090, GTX 1650 o cualquier tarjeta con 4 GB o mas. Tambien se ejecuta exclusivamente en CPU con memoria RAM suficiente.
- Para entrenamiento con LoRA o ajuste fino completo, una unica GPU de 16-24 GB (RTX 4090, A10, L4) es suficiente; con optimizador AdamW en fp32 el estado del optimizador ronda los 2-3 GB adicionales.
- Opciones de despliegue: transformers (PyTorch) como ruta principal; vLLM o TGI para servir el checkpoint denso; conversion a GGUF para llama.cpp u Ollama; ONNX Runtime para despliegue en CPU.
- Advertencia importante: si la poda es no estructurada, el ahorro de memoria y de computo solo se materializa con runtimes que exploten la dispersion (por ejemplo DeepSparse o los kernels de vLLM adaptados de SparseGPT). En transformers, llama.cpp o vLLM estandar el modelo se ejecuta como un 560 M denso y no se obtiene ninguna ventaja de velocidad.
- No hay mediciones publicadas de latencia ni de throughput para esta variante concreta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rajeshwari-Chanda/bloom-560m_sparsegpt_0.1 | 559.214.592 | 2.048 tokens (heredado) | BLOOM-560m podado con SparseGPT (ratio no documentado) | no disponible | publico en Hugging Face, 0 descargas |
| bigscience/bloom-560m | 559.214.592 | 2.048 tokens | Transformer decoder-only denso | BigScience BLOOM RAIL 1.0 | publico, ampliamente utilizado |
| Rajeshwari-Chanda/bloom-560m_sparsegpt_0.4 | no disponible (misma base, se asume 559 M) | 2.048 tokens (heredado) | BLOOM-560m podado con SparseGPT (ratio no documentado) | no disponible | publico en Hugging Face, 0 likes |
| bigscience/bloom-1b1 | aproximadamente 1.100 millones | 2.048 tokens | Transformer decoder-only denso, misma familia | BigScience BLOOM RAIL 1.0 | publico |

No hay datos de rendimiento publicados para ninguna de las dos variantes podadas, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre el ratio de poda, la estructura de la dispersion, el dataset de calibracion ni si hubo ajuste de recuperacion. Cualquier uso en produccion parte de una incertidumbre total sobre el estado del checkpoint.
- Licencia sin especificar: el repositorio no declara licencia. Al derivar de BLOOM-560m hay que asumir las condiciones de BigScience BLOOM RAIL 1.0, que imponen restricciones de uso (por ejemplo, obligaciones de atribucion y limitaciones en determinados usos), pero la falta de declaracion explicita es un riesgo legal para uso comercial.
- No es un modelo alineado: no sigue instrucciones, no soporta chat, tool calling ni agentes. Necesita ajuste fino o prompts de completado para cualquier tarea concreta.
- Riesgo elevado de alucinacion y de incoherencia: 560 M de parametros es un tamano muy reducido para generacion fiable, agravado por una poda sin evaluar.
- Sesgos heredados del corpus ROOTS: predominio de contenido web en ingles, estereotipos de genero, raza, religion y nacionalidad documentados en la familia BLOOM. La poda puede alterar la distribucion de estos sesgos de forma imprevisible.
- Cobertura multilingue desigual: aunque el vocabulario cubre decenas de idiomas, en un modelo de este tamano la calidad fuera del ingles es muy baja y no esta medida para la variante podada.
- Ventana de contexto limitada a 2.048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Sin validacion por la comunidad: 0 descargas y 0 likes, sin issues ni discusiones, y una fecha de creacion en el Hub poco habitual. No hay garantia de reproducibilidad ni de que el checkpoint se cargue correctamente en todas las versiones de transformers.
- La dispersion no estructurada no acelera la inferencia en runtimes densos convencionales, lo que puede llevar a expectativas erroneas de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_sparsegpt_0.1
- Variante con otro ratio de poda: https://huggingface.co/Rajeshwari-Chanda/bloom-560m_sparsegpt_0.4
- Perfil del autor en Hugging Face: https://huggingface.co/Rajeshwari-Chanda/models
- Modelo base: https://huggingface.co/bigscience/bloom-560m
- Articulo de SparseGPT (Frantar y Alistarh, 2023): https://arxiv.org/abs/2301.11093
- Repositorio de SparseGPT: https://github.com/IST-DASLab/sparsegpt
- Articulo de BLOOM (Le Scao et al., 2022): https://arxiv.org/abs/2211.05100
- Entrada de BLOOM en Wikipedia: https://en.wikipedia.org/wiki/BLOOM_(language_model)
- Guia de autoalojamiento de bloom-560m: https://llmapi.ai/models/bigscience-bloom-560m/
- Articulo de Lacoste et al. (2019), referenciado por la etiqueta `arxiv:1910.09700` de la plantilla de model card: https://arxiv.org/abs/1910.09700
