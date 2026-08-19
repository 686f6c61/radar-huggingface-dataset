# mradermacher/gemma3-negative-glitter-i1-GGUF

## Resumen

El modelo `mradermacher/gemma3-negative-glitter-i1-GGUF` es una colección de cuantizaciones GGUF (formato i1 con imatrix) del modelo merge `ToastyPigeon/gemma3-negative-glitter`, desarrollado por el cuantizador mradermacher. El modelo base es un merge creado con mergekit que parte de Gemma 3, la familia de modelos abiertos de Google DeepMind, con aproximadamente 27 000 millones de parámetros. Esta versión GGUF está pensada para facilitar la inferencia local eficiente en herramientas como llama.cpp, Ollama o LM Studio, ofreciendo múltiples niveles de cuantización que van desde 6,4 GB hasta 22,3 GB.

La relevancia de este modelo radica en que permite ejecutar un modelo de 27B en hardware de consumo, con opciones de calidad y velocidad ajustables según la cuantización elegida. Al tratarse de un merge no documentado en profundidad, las capacidades exactas dependen del modelo base, pero se asume que hereda las habilidades conversacionales y de generación de texto de Gemma 3. La cuantización con imatrix (i1) mejora la calidad de las cuantizaciones de baja precisión en comparación con métodos estáticos, lo que lo hace útil para entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Gemma 3, con merge mediante mergekit) |
| Parametros totales | 27 009 346 304 (~27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma 3 soporta hasta 128k, pero el merge no lo especifica) |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible (el modelo base Gemma 3 tiene licencia de Google, pero el merge no la declara) |
| Formato de pesos | GGUF (el modelo original usa safetensors) |

## Arquitectura y entrenamiento

El modelo base `ToastyPigeon/gemma3-negative-glitter` es un merge creado con mergekit, que combina pesos de Gemma 3 con otros modelos o adaptaciones. No se proporcionan detalles sobre la composición exacta del merge, el dataset de entrenamiento ni el proceso de alineación (RLHF, DPO, etc.). La arquitectura subyacente es la de Gemma 3, un transformer decoder-only con atención multi-cabeza y ventana de contexto extendida, aunque esta versión cuantizada no especifica el contexto efectivo tras el merge.

La cuantización i1 aplicada por mradermacher utiliza el método de imatrix (importance matrix) para calcular las escalas de cuantización, lo que reduce la pérdida de calidad en cuantizaciones de baja precisión en comparación con los métodos estáticos tradicionales. Los archivos GGUF resultantes son compatibles con llama.cpp y sus derivados, permitiendo ejecutar el modelo en CPU, GPU o configuración mixta.

## Capacidades

- Generacion de texto y conversacion multi-turno: al estar basado en Gemma 3, se espera que mantenga capacidades de dialogo coherente y generacion de respuestas contextuales.
- Razonamiento y resolucion de problemas: hereda las habilidades de razonamiento de Gemma 3, aunque la calidad puede variar segun la cuantizacion elegida.
- Generacion de codigo: Gemma 3 incluye entrenamiento en codigo, por lo que el modelo deberia poder producir fragmentos de codigo en varios lenguajes.
- Soporte multilingue: aunque la model card indica solo ingles, Gemma 3 soporta multiples idiomas; el merge podria conservar esa capacidad, pero no esta confirmado.
- Tool calling y function calling: no hay confirmacion explicita en la informacion disponible, pero Gemma 3 ofrece soporte para estas funciones; se asume que el merge lo preserva.
- Capacidad de agentes: no hay datos concretos sobre soporte para razonamiento multi-paso o uso de herramientas en este merge especifico.

## Casos de uso

- Inferencia local en CPU o GPU de gama media: gracias a las cuantizaciones desde 6,4 GB, es posible ejecutar el modelo en equipos sin GPU dedicada o con GPUs de 8 GB de VRAM, usando llama.cpp u Ollama.
- Chatbots y asistentes conversacionales: el modelo puede integrarse en aplicaciones de atencion al cliente o asistentes personales locales, aprovechando su capacidad de generar respuestas coherentes en ingles.
- Generacion de contenido y redaccion: util para crear borradores de articulos, resumenes o textos creativos en entornos donde se requiera privacidad de datos (procesamiento local).
- Prototipado de aplicaciones de IA: los desarrolladores pueden probar rapidamente el comportamiento del modelo base sin necesidad de desplegar infraestructura en la nube, gracias a los archivos GGUF listos para usar.
- Educacion e investigacion: para experimentos de procesamiento de lenguaje natural en entornos academicos con recursos limitados, permitiendo comparar el rendimiento de cuantizaciones extremas frente a versiones completas.
- Despliegue en edge computing: dispositivos con poca memoria pueden usar cuantizaciones como IQ1_S o IQ2_XXS para tareas de clasificacion o generacion de texto simple, aunque con perdida de calidad notable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo o su base.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para cuantizaciones de 6-8 GB (IQ1_S, IQ1_M, IQ2_XXS) se necesitan al menos 8 GB de VRAM o 16 GB de RAM en modo CPU. Para las mas grandes (Q6_K, 22,3 GB) se requieren 24 GB de VRAM o mas.
- GPU recomendadas: RTX 3060 12GB para cuantizaciones pequeñas, RTX 3090/4090 (24 GB) para las de mayor tamaño. Tambien es posible ejecutarlo en CPU con 32 GB de RAM.
- Compatibilidad con consumer GPU: si, las cuantizaciones de hasta Q4_K_M (16,6 GB) caben en GPUs de 16-24 GB. Las mas grandes requieren GPUs profesionales o descarga parcial a RAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (con backend llama.cpp), y cualquier software compatible con GGUF.
- Latencia y throughput: no hay datos publicados. En general, cuantizaciones mas bajas ofrecen mayor velocidad pero menor calidad; Q4_K_M suele ser un buen equilibrio entre velocidad y fidelidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma3-negative-glitter-i1-GGUF (este) | 27B | no disponible | i1 (imatrix) desde IQ1_S a Q6_K | no disponible | HuggingFace |
| Gemma 3 27B oficial (Google) | 27B | 128k | safetensors, GGUF (oficial) | Gemma Terms of Use | HuggingFace, Kaggle |
| Llama 3.1 8B GGUF | 8B | 128k | GGUF variados | Llama 3.1 license | HuggingFace |
| Mistral 7B GGUF | 7B | 32k | GGUF variados | Apache 2.0 | HuggingFace |

La comparativa es orientativa: el modelo base Gemma 3 27B oficial ofrece contexto de 128k y licencia clara, mientras que este merge no declara ni contexto ni licencia. Las cuantizaciones i1 pueden ofrecer mejor calidad por bit que las GGUF estaticas equivalentes, pero no hay benchmarks que lo confirmen para este modelo concreto.

## Limitaciones y advertencias

- Calidad variable segun cuantizacion: las cuantizaciones muy bajas (IQ1_S, IQ2_XXS) presentan una degradacion significativa en coherencia y exactitud, siendo recomendables solo para pruebas o tareas muy simples.
- Licencia no especificada: el autor no indica la licencia del modelo merge, lo que genera incertidumbre sobre su uso comercial. El modelo base Gemma 3 tiene su propia licencia que podria aplicar, pero no esta confirmado.
- Idioma limitado: la model card indica solo ingles, por lo que el rendimiento en otros idiomas puede ser inferior o inexistente.
- Sesgos y alucinaciones: al ser un modelo derivado de Gemma 3, puede heredar sesgos presentes en los datos de entrenamiento originales y producir alucinaciones en contextos ambiguos.
- Documentacion insuficiente: no se detallan los componentes del merge, el proceso de entrenamiento ni las capacidades exactas, lo que dificulta evaluar su idoneidad para tareas especificas.
- Contexto no confirmado: aunque Gemma 3 soporta 128k, el merge podria haber reducido la ventana de contexto; no se indica en la ficha.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma3-negative-glitter-i1-GGUF
- Modelo base (merge): https://huggingface.co/ToastyPigeon/gemma3-negative-glitter
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/gemma3-negative-glitter-GGUF
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#gemma3-negative-glitter-i1-GGUF
- Repositorio oficial de Gemma (Google DeepMind): https://github.com/google-deepmind/gemma
