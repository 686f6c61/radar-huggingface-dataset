# mradermacher/Mellum2.1-12B-A2.5B-Thinking-MTP-i1-GGUF

## Resumen

Mellum2.1-12B-A2.5B-Thinking-MTP-i1-GGUF es una cuantizacion en formato GGUF del modelo JetBrains/Mellum2.1-12B-A2.5B-Thinking-MTP, publicada por el usuario mradermacher, especializado en la conversion y cuantizacion de pesos para inferencia local. El repositorio contiene un conjunto de ficheros GGUF generados con el metodo i1 (imatrix calibrada) en un amplio rango de cuantizaciones, desde IQ1_S hasta Q6_K, lo que permite ejecutar el modelo en hardware con distintos presupuestos de memoria.

El modelo original, segun la nomenclatura, es un transformer de tipo Mixture of Experts (MoE) con aproximadamente 12B parametros totales y 2.5B parametros activos por token, entrenado con capacidad de razonamiento explicito (Thinking) y con soporte de decodificacion especulativa multi-token (MTP). El autor del modelo es JetBrains, aunque no se dispone de la model card original en la informacion proporcionada.

La relevancia de esta publicacion radica en que facilita el despliegue del modelo en entornos de inferencia local mediante llama.cpp y derivados (Ollama, LM Studio, etc.), algo especialmente util para una arquitectura MoE con solo 2.5B parametros activos, que en teoria permite un throughput alto con un coste computacional por token relativamente bajo. No obstante, la informacion disponible sobre el modelo original es muy limitada: no se han publicado datos sobre licencia, idiomas ni benchmarks en el material consultado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), segun nomenclatura A2.5B; detalles no disponibles |
| Parametros totales | 12B (segun nombre del modelo); el campo de parametros del repo GGUF indica 20.480.012, dato no consistente con el nombre y probablemente referido a un componente o metadato erroneo |
| Parametros activos | 2.5B (segun nombre del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, Q4_1, IQ3_XS, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix) |

## Arquitectura y entrenamiento

La informacion disponible no permite detallar la arquitectura interna mas alla de lo que sugiere el nombre del modelo: una arquitectura Mixture of Experts con 12B parametros totales y 2.5B parametros activos, entrenada en una variante "Thinking" (con razonamiento explicito) y con soporte de MTP (Multi-Token Prediction), una tecnica de decodificacion especulativa que permite predecir varios tokens por paso y acelerar la generacion. El sufijo "Mellum2.1" indica una revision menor sobre una version anterior de la familia Mellum de JetBrains.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni otras innovaciones tecnicas. La model card del repositorio GGUF es puramente tecnica y se limita a listar los parametros de cuantizacion (quantize_version 2, output_tensor_quantised 1, convert_type hf, etiqueta nicoboss), sin aportar detalles sobre el entrenamiento del modelo base.

## Capacidades

- Generacion de texto y razonamiento explicito: la variante "Thinking" sugiere un modo de razonamiento con cadena de pensamiento antes de la respuesta final.
- Decodificacion multi-token (MTP): el modelo incorpora prediccion multi-token, lo que puede acelerar la inferencia en implementaciones que lo soporten.
- Eficiencia computacional: al ser MoE con 2.5B parametros activos, el coste por token es inferior al de un modelo denso de 12B.
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades especiales (vision, audio): no disponible.

## Casos de uso

- Inferencia local en equipos de sobremesa: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar el modelo en GPUs consumer con 8-16 GB de VRAM, aprovechando que solo 2.5B parametros estan activos por token para mantener un throughput aceptable.
- Razonamiento asistido en entornos con recursos limitados: el modo Thinking permite obtener respuestas razonadas en tareas de analisis o resolucion de problemas sin depender de APIs en la nube.
- Prototipado de asistentes conversacionales: el formato GGUF es compatible con llama.cpp, Ollama y LM Studio, lo que facilita iterar rapidamente sobre prompts y configuraciones de muestreo.
- Evaluacion de arquitecturas MoE: investigadores pueden comparar el comportamiento de un MoE de 12B/2.5B activos frente a modelos densos de tamano similar en tareas de razonamiento, usando las distintas cuantizaciones para estudiar el impacto de la precision en la calidad.
- Despliegue en entornos air-gapped: al ser un fichero GGUF autocontenido, puede ejecutarse sin conexion a internet, lo que encaja en escenarios con requisitos de privacidad o aislamiento de red.
- Experimentacion con decodificacion especulativa: el soporte MTP permite probar tecnicas de aceleracion de inferencia en implementaciones que lo soporten, midiendo la ganancia de throughput frente a decodificacion autoregresiva clasica.
- Generacion de texto por lotes en CPU: las cuantizaciones mas agresivas (IQ2_M, Q3_K_M) permiten ejecutar el modelo en CPU con RAM moderada, util para tareas de generacion offline donde la latencia no es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun cuantizacion y arquitectura MoE de 12B totales):
  - IQ1_S / IQ2_XXS: en torno a 4-5 GB.
  - Q2_K / IQ2_M: en torno a 5-6 GB.
  - Q3_K_M / IQ3_M: en torno a 6-7 GB.
  - Q4_K_M / IQ4_XS: en torno a 7-8 GB.
  - Q5_K_M: en torno a 9-10 GB.
  - Q6_K: en torno a 10-11 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A100 y H100 para despliegues de mayor concurrencia. Las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs consumer de 8-16 GB.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas usando cuantizaciones Q4 o inferiores; las cuantizaciones Q6_K requieren 12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que habria que verificar compatibilidad.
- Latencia y throughput estimados: no disponibles. El uso de MTP y de solo 2.5B parametros activos sugiere un throughput superior al de un modelo denso de 12B, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se dispone de datos de rendimiento ni de especificaciones completas del modelo original que permitan una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La licencia del modelo no esta disponible en la informacion proporcionada; antes de cualquier uso comercial es imprescindible consultar la licencia del modelo original (JetBrains/Mellum2.1-12B-A2.5B-Thinking-MTP).
- El repositorio GGUF no incluye model card descriptiva del modelo base, por lo que se desconocen sesgos conocidos, idiomas soportados y limitaciones especificas.
- Las cuantizaciones de baja precision (IQ1_S, IQ2_XXS, Q2_K) degradan la calidad de forma notable, especialmente en tareas de razonamiento; se recomienda Q4_K_M o superior para uso en produccion.
- El campo de parametros totales del repo (20.480.012) no es coherente con el nombre del modelo (12B) y probablemente corresponde a un metadato erroneo o a un componente parcial; conviene verificar el tamano real del modelo base.
- El soporte de MTP depende del runtime de inferencia; llama.cpp puede no aprovechar la prediccion multi-token, por lo que la aceleracion esperada podria no materializarse.
- Riesgo de alucinacion: inherente a los modelos generativos; no hay evaluaciones publicadas que cuantifiquen este riesgo.
- Al ser una cuantizacion de terceros (mradermacher), no existe garantia oficial del autor original sobre la fidelidad de los pesos convertidos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Mellum2.1-12B-A2.5B-Thinking-MTP-i1-GGUF
- Modelo original: https://huggingface.co/JetBrains/Mellum2.1-12B-A2.5B-Thinking-MTP
