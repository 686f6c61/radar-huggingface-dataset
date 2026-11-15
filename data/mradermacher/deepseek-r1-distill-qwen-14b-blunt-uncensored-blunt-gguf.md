# mradermacher/DeepSeek-R1-Distill-Qwen-14B-Blunt-Uncensored-Blunt-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-14B-Blunt-Uncensored-Blunt-GGUF es una distribucion de cuantizaciones estaticas en formato GGUF del modelo braindao/DeepSeek-R1-Distill-Qwen-14B-Blunt-Uncensored-Blunt, publicada por mradermacher el 27 de febrero de 2025. El modelo subyacente es un fine-tuning sin censura (uncensored) del destilado DeepSeek-R1-Distill-Qwen-14B, que a su vez parte de Qwen2.5-14B y ha sido entrenado por DeepSeek para reproducir el comportamiento de razonamiento de DeepSeek-R1. El repositorio no aporta informacion sobre el proceso de fine-tuning ni sobre los datos utilizados por braindao.

El interes practico de esta publicacion es la disponibilidad de un conjunto completo de cuantizaciones GGUF (desde Q2_K hasta Q8_0) que permiten ejecutar un modelo de 14.770.033.664 parametros en hardware de consumo mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp). El modelo esta pensado para generacion de texto conversacional en ingles, con el estilo de razonamiento encadenado propio de la familia R1.

La licencia no esta declarada en la informacion disponible, lo que constituye un riesgo relevante para uso comercial. El modelo solo declara soporte de ingles y no se han publicado benchmarks asociados a esta variante concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-14B, destilada de DeepSeek-R1) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en repo i1 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del destilado DeepSeek-R1-Distill-Qwen-14B: un transformer decoder-only denso de 14.770 millones de parametros construido sobre Qwen2.5-14B y afinado por DeepSeek para imitar las trayectorias de razonamiento de DeepSeek-R1, incluyendo cadenas de pensamiento largas antes de la respuesta final. Sobre esa base, braindao aplico un fine-tuning adicional orientado a eliminar el comportamiento de rechazo (uncensored) y a un estilo de respuesta directo (blunt), aunque no se detalla la composicion del dataset ni el metodo de entrenamiento.

mradermacher solo realiza la conversion a GGUF y la cuantizacion estatica; no aporta informacion sobre tokens de entrenamiento, RLHF, DPO ni innovaciones tecnicas adicionales. Las cuantizaciones se generaron con el pipeline habitual de llama.cpp (convert_type hf, quantize_version 2, output_tensor_quantised 1) y existe un repositorio paralelo con cuantizaciones ponderadas por imatrix para mayor fidelidad a igual tamano.

## Capacidades

- Generacion de texto conversacional en ingles con estilo directo y sin filtros de rechazo.
- Razonamiento encadenado (chain-of-thought) heredado del destilado de DeepSeek-R1, con trazas de pensamiento antes de la respuesta.
- Razonamiento matematico y resolucion de problemas paso a paso, segun las capacidades del modelo base destilado.
- Generacion de codigo y explicacion de codigo, heredada de Qwen2.5-14B.
- Respuestas a instrucciones sin las salvaguardas habituales de los modelos alineados.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado especificamente para esta variante.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio): no disponibles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un destilado R1 tras eliminar el rechazo, comparando respuestas con la version original en experimentos controlados de red-teaming.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o dialogos con tematicas que los modelos alineados suelen rechazar, ejecutada localmente con llama.cpp sobre una unica GPU de consumo.
- Razonamiento matematico asistido en local: resolucion de problemas paso a paso en entornos sin conexion, usando la cuantizacion Q4_K_M (9,1 GB) en una RTX 4090 o similar.
- Prototipado de asistentes conversacionales en ingles: despliegue rapido con Ollama o LM Studio para validar flujos de chat multi-turno antes de invertir en modelos mayores.
- Analisis de texto y resumen en pipelines offline: procesamiento por lotes de documentos en ingles con llama.cpp, aprovechando que el modelo cabe en VRAM de 12-16 GB con cuantizaciones Q4/Q5.
- Educacion e investigacion en PLN: uso como caso de estudio de destilacion de razonamiento y de los efectos del fine-tuning uncensored sobre las capacidades del modelo base.
- Evaluacion comparativa de cuantizaciones: el conjunto de 11 variantes permite medir la degradacion de calidad y perplexidad entre Q2_K y Q8_0 en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (peso de los pesos, sin overhead de contexto): Q2_K ~5,9 GB; Q3_K_M ~7,4 GB; Q4_K_M ~9,1 GB; Q5_K_M ~10,6 GB; Q6_K ~12,2 GB; Q8_0 ~15,8 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K/Q8_0 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q5_K_M; RTX 4060 Ti 16 GB o RTX 3080 12 GB para Q4_K_M; GPUs de 8 GB pueden ejecutar Q3_K_S o Q2_K con contexto reducido.
- Cabe en GPU de consumo: si, en todas las cuantizaciones hasta Q8_0 con GPUs de 16-24 GB; las cuantizaciones Q2-Q4 caben en GPUs de 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF; tambien es posible usar vLLM o TGI con el modelo base en safetensors, no con estos GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dependen de la GPU y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-14B-Blunt-Uncensored-Blunt (este, GGUF) | 14,77 B | no disponible | no disponible | GGUF | Fine-tuning uncensored, solo ingles |
| DeepSeek-R1-Distill-Qwen-14B (original) | 14,77 B | 128K (segun model card de DeepSeek) | MIT (segun publicacion de DeepSeek) | safetensors, GGUF | Version alineada con rechazo; referencia de calidad |
| Qwen2.5-14B-Instruct | 14,77 B | 128K | Apache 2.0 | safetensors, GGUF | Base del destilado; sin razonamiento encadenado |
| DeepSeek-R1-Distill-Llama-8B | 8,03 B | 128K (segun model card de DeepSeek) | MIT (segun publicacion de DeepSeek) | safetensors, GGUF | Alternativa mas ligera para hardware limitado |

Los datos de contexto y licencia de las filas comparativas corresponden a las publicaciones originales de sus autores; la informacion disponible para este repositorio no confirma que se mantengan en la variante uncensored.

## Limitaciones y advertencias

- Licencia no declarada: no hay garantia de uso comercial; conviene contactar con el autor del modelo base antes de cualquier despliegue en produccion.
- Modelo uncensored: no aplica filtros de rechazo, por lo que puede generar contenido danino, ilegal o sexualmente explicito; requiere moderacion externa en cualquier aplicacion publica.
- Riesgo elevado de alucinacion, especialmente en las cuantizaciones bajas (Q2_K, Q3_K_S) y en el estilo blunt, que prioriza respuestas directas sobre matices.
- Solo ingles declarado: el rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto no documentada en este repositorio; el valor del modelo base (128K segun DeepSeek) no puede asumirse sin verificacion.
- Fine-tuning de terceros (braindao) sin model card detallada: se desconoce la composicion del dataset, el metodo de entrenamiento y los posibles sesgos introducidos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la degradacion frente al destilado original.
- Repositorio de 102 GB con 11 cuantizaciones: conviene descargar solo el archivo necesario, no el repositorio completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-14B-Blunt-Uncensored-Blunt-GGUF
- Repositorio con cuantizaciones imatrix: https://huggingface.co/mradermacher/DeepSeek-R1-Distill-Qwen-14B-Blunt-Uncensored-Blunt-i1-GGUF
- Modelo base: https://huggingface.co/braindao/DeepSeek-R1-Distill-Qwen-14B-Blunt-Uncensored-Blunt
- Pagina de resumen del autor: https://hf.tst.eu/model#DeepSeek-R1-Distill-Qwen-14B-Blunt-Uncensored-Blunt-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
