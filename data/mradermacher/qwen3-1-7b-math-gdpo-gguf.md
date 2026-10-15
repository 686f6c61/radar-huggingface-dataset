# mradermacher/Qwen3-1.7B-MATH-GDPO-GGUF

## Resumen

Qwen3-1.7B-MATH-GDPO-GGUF es un conjunto de cuantizaciones en formato GGUF publicadas por mradermacher a partir del modelo wzx111/Qwen3-1.7B-MATH-GDPO. No se trata, por tanto, de un modelo entrenado desde cero, sino de una distribucion derivada: el modelo original es un ajuste fino de Qwen3-1.7B (familia Qwen3 de Alibaba) orientado a matematicas, entrenado con la receta Open-R1 y la libreria TRL sobre el dataset watermelonhjg/MATH-lighteval-level_2, e incorporando una etapa de optimizacion de preferencias etiquetada como "gdpo".

El valor de esta publicacion esta en el empaquetado: mradermacher ofrece doce cuantizaciones estaticas que van desde Q2_K (0,9 GB) hasta f16 (3,5 GB), lo que permite ejecutar un modelo de 1.720.574.976 parametros en hardware de consumo muy modesto, incluso en CPU con llama.cpp. El modelo declara unicamente el idioma ingles y esta especializado en resolucion de problemas matematicos, no en conversacion general.

Es relevante ahora porque la familia Qwen3 ha popularizado modelos densos pequenos con capacidad de razonamiento, y los quants GGUF son la via estandar para desplegarlos localmente sin GPU dedicada. La contrapartida es que se trata de un modelo de nicho, con 200 descargas y 0 likes en el momento de la consulta, sin model card propia del autor original y sin licencia declarada en el repositorio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3); no es MoE |
| Parametros totales | 1.720.574.976 (dato real de safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada; el modelo base Qwen3-1.7B de la familia Qwen3 declara 32 768 tokens nativos, ampliables mediante YaRN |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); existe ademas un repositorio paralelo de quants con imatrix (i1-GGUF) |
| Idiomas soportados | en (ingles), segun el campo language de la model card |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base sin cuantizar esta en formato transformers/safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only denso con 1.720.574.976 parametros, sin mezcla de expertos. Sobre esa base se aplico un ajuste fino supervisado seguido de una etapa de optimizacion de preferencias, segun indican las etiquetas "open-r1", "trl" y "gdpo" del repositorio. La etiqueta "gdpo" apunta a una variante de optimizacion de preferencias por grupos; no se detalla en la informacion disponible ni el algoritmo exacto ni los hiperparametros. Tampoco se especifica el numero de tokens de entrenamiento ni la composicion completa del corpus.

El dataset declarado es watermelonhjg/MATH-lighteval-level_2, un subconjunto de nivel 2 derivado de MATH-lighteval. Esto significa que el entrenamiento esta sesgado deliberadamente hacia problemas matematicos de dificultad media-baja, con verificacion de respuesta final. No hay indicios en la informacion proporcionada de que se hayan usado datos multilingues, instrucciones generales, codigo o corpus conversacionales. Tampoco se documentan innovaciones tecnicas propias: el modelo hereda las del Qwen3 base y anade unicamente el ajuste de preferencias. Las cuantizaciones son de tipo estatico (quantize_version: 2, output_tensor_quantised: 1), generadas sin importance matrix; el autor remite a su repositorio i1-GGUF para las versiones ponderadas de mayor calidad.

## Capacidades

- Generacion de texto y resolucion de problemas matematicos: es la especialidad declarada del modelo, entrenado sobre MATH-lighteval nivel 2.
- Razonamiento paso a paso orientado a la respuesta final de problemas de matematicas.
- Generacion de codigo: capacidad heredada del Qwen3 base, pero no reforzada por el ajuste fino ni documentada por el autor.
- Soporte de tool calling / function calling: no documentado para este ajuste concreto; el modelo base Qwen3 si lo contempla, pero el ajuste sobre MATH puede haber degradado esta capacidad.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun el campo language de la model card.
- Capacidades especiales (modo thinking explicito, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

- Tutoria de matematicas a nivel de secundaria y bachillerato: el modelo esta entrenado especificamente sobre problemas de nivel 2 de MATH-lighteval, por lo que puede resolver ejercicios de algebra, aritmetica y geometria basica mostrando el desarrollo, y ejecutarse localmente en un portatil con el quant Q4_K_M (1,2 GB).
- Correccion automatica de respuestas numericas en plataformas educativas: dado su bajo coste de inferencia, puede desplegarse en cola para validar la respuesta final de un alumno y compararla con la solucion generada, usando el quant Q5_K_M como compromiso entre calidad y latencia.
- Generacion de conjuntos de problemas sinteticos para aumentar datasets de entrenamiento matematico: al ser un modelo pequeno y libre de coste por token, se puede ejecutar en bucle para producir variantes de enunciados y soluciones a partir de plantillas.
- Preprocesado en pipelines de evaluacion de modelos mayores: se puede usar como "juez" rapido de primer nivel para descartar respuestas matematicas trivialmente incorrectas antes de invocar un modelo mas caro.
- Investigacion sobre optimizacion de preferencias: al ser un ajuste GDPO reproducible con TRL y Open-R1 sobre un dataset publico, sirve como caso de estudio de bajo coste para analizar como afecta GDPO al rendimiento en tareas de razonamiento.
- Inferencia en el borde (edge) o en entornos sin GPU: con el quant Q4_K_S o Q4_K_M cabe en menos de 2 GB de memoria, de modo que es viable en mini-PC, Raspberry Pi de gama alta con suficiente RAM o contenedores CPU-only mediante llama.cpp u Ollama.
- Demostraciones educativas de cuantizacion: el repositorio cubre doce niveles de cuantizacion distintos, lo que lo convierte en un material practico para medir el impacto de Q2_K frente a Q8_0 o f16 sobre la precision en matematicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye metricas de MATH, GSM8K, MMLU ni ninguna otra evaluacion, y el modelo base wzx111/Qwen3-1.7B-MATH-GDPO no aporta cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada a partir del tamano de cada fichero, mas overhead de contexto y cache KV):
  - Q2_K (0,9 GB): en torno a 1,5-2 GB de VRAM.
  - Q3_K_S / Q3_K_M (1,0 GB) y Q3_K_L / IQ4_XS (1,1 GB): en torno a 2 GB.
  - Q4_K_S / Q4_K_M (1,2 GB): en torno a 2-2,5 GB.
  - Q5_K_S (1,3 GB) y Q5_K_M (1,4 GB): en torno a 2,5-3 GB.
  - Q6_K (1,5 GB): en torno a 3 GB.
  - Q8_0 (1,9 GB): en torno a 3,5 GB.
  - f16 (3,5 GB): en torno a 5 GB (el autor lo califica de "overkill").
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM es suficiente para todos los quants salvo, quizas, f16. Una RTX 3060 de 12 GB, RTX 4060, RTX 4090 o similares ejecutan el modelo holgadamente. Tambien es viable en Apple Silicon mediante Metal.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas actuales e integradas modernas con memoria compartida suficiente. Es uno de los puntos fuertes del modelo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. Los tags incluyen "endpoints_compatible", lo que sugiere compatibilidad con endpoints tipo HuggingFace Inference. Para vLLM o TGI seria preferible partir del modelo base en safetensors en lugar del GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Formato |
|---|---|---|---|---|---|
| mradermacher/Qwen3-1.7B-MATH-GDPO-GGUF (este) | 1,72 B | no disponible | Matematicas (MATH-lighteval nivel 2) | no disponible | GGUF |
| wzx111/Qwen3-1.7B-MATH-GDPO (modelo base) | 1,72 B | no disponible | Matematicas | no disponible | safetensors |
| Qwen/Qwen3-1.7B (modelo original) | 1,72 B | 32 768 nativos, ampliable con YaRN (segun la familia Qwen3) | Proposito general, razonamiento, codigo | Apache 2.0 (segun la familia Qwen3) | safetensors, GGUF comunitario |
| mradermacher/Qwen3-1.7B-MATH-GDPO-i1-GGUF | 1,72 B | no disponible | Matematicas, quants con imatrix | no disponible | GGUF |

No se dispone de datos de rendimiento para comparar numericamente este ajuste con alternativas de la misma categoria, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Especializacion estrecha: el entrenamiento se limita al subconjunto MATH-lighteval nivel 2, por lo que el rendimiento fuera de ese dominio (conversacion general, redaccion, codigo, conocimiento factual) no esta garantizado y probablemente sea inferior al del Qwen3-1.7B original.
- Riesgo de alucinacion: en un modelo de 1,72 B entrenado solo con problemas matematicos, la probabilidad de producir desarrollos plausibles pero incorrectos o de inventar pasos intermedios es elevada. Cualquier uso educativo debe validar la respuesta final de forma programatica.
- Idioma: solo ingles declarado. No hay evidencia de soporte en castellano ni en otros idiomas, y el ajuste fino puede haber degradado la competencia multilingue del modelo base.
- Licencia: no disponible. Esto es un bloqueo practico para uso comercial, ya que no se puede verificar si el ajuste de wzx111 conserva la licencia Apache 2.0 de Qwen3 ni que condiciones impone. Antes de cualquier despliegue comercial hay que contactar con el autor del modelo base.
- Trazabilidad limitada: las cuantizaciones son estaticas, sin importance matrix. El propio autor recomienda el repositorio i1-GGUF para las versiones ponderadas de mayor calidad. Los quants mas agresivos (Q2_K, Q3_K_S) degradaran notablemente la coherencia en tareas de razonamiento, donde la cadena de pasos es sensible a errores.
- Repositorio de nicho: 200 descargas y 0 likes en el momento de la consulta, sin evaluaciones de terceros ni issues documentadas. No hay garantia de mantenimiento ni de actualizacion.
- Fecha de actualizacion: la ficha indica una actualizacion en 2026-10-14, posterior a la fecha de creacion (2025-05-09); conviene verificar el estado real del repositorio antes de depender de el.
- Advertencia sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre el modelo. Los unicos enlaces recuperados correspondian a foros de contenido adulto sin ninguna relacion con el modelo, por lo que no se incluyen.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3-1.7B-MATH-GDPO-GGUF
- Repositorio de quants con imatrix: https://huggingface.co/mradermacher/Qwen3-1.7B-MATH-GDPO-i1-GGUF
- Modelo base del ajuste: https://huggingface.co/wzx111/Qwen3-1.7B-MATH-GDPO
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#Qwen3-1.7B-MATH-GDPO-GGUF
- Dataset de entrenamiento: watermelonhjg/MATH-lighteval-level_2
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad de quants (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
