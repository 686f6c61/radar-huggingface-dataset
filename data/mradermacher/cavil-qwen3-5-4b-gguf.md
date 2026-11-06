# mradermacher/Cavil-Qwen3.5-4B-GGUF

## Resumen

Cavil-Qwen3.5-4B-GGUF es la distribucion en formato GGUF del modelo Cavil-Qwen3.5-4B, desarrollado por el equipo de openSUSE y cuantizado por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 4.200 millones de parametros, afinado especificamente para el dominio juridico (legal) a partir de una base de la familia Qwen 3.5, y entrenado sobre el dataset openSUSE/cavil-legal-text. Su proposito es ofrecer un modelo compacto y desplegable en hardware modesto para tareas de procesamiento de texto legal en ingles.

La relevancia de esta ficha radica en que el repositorio no contiene los pesos originales, sino una coleccion de cuantizaciones estaticas en formato GGUF que van desde 2,0 GB (Q2_K) hasta 8,5 GB (f16), lo que permite ejecutar el modelo en CPU, en GPUs de consumo e incluso en equipos con poca VRAM. El modelo base esta publicado bajo licencia Apache 2.0, lo que facilita su uso comercial, y esta etiquetado como conversacional y compatible con endpoints.

No se dispone de informacion publica sobre la arquitectura interna detallada, la longitud de contexto, la composicion exacta del dataset de entrenamiento ni los resultados de benchmarks del modelo original. Esta ficha documenta, por tanto, lo que se puede verificar a partir de los metadatos del repositorio y de la model card, e indica explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de la familia Qwen 3.5, transformer) |
| Parametros totales | 4.205.751.296 (~4,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 (suplemento multimodal) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio es una cuantizacion estatica del modelo openSUSE/Cavil-Qwen3.5-4B, que a su vez parte de una base Qwen 3.5 de 4B parametros. La model card de la cuantizacion no describe la arquitectura interna (numero de capas, dimensiones, mecanismo de atencion, uso o no de MoE), por lo que estos datos deben consultarse en el repositorio del modelo base. El autor indica que se trata de cuantizaciones estaticas y senala que no tiene previsto publicar cuantizaciones ponderadas con imatrix, salvo peticion explicita en la seccion de discusiones.

Respecto al entrenamiento, la unica informacion disponible es que el modelo se ha afinado sobre el dataset openSUSE/cavil-legal-text, orientado a texto juridico en ingles. No se especifica el numero de tokens de entrenamiento, la composicion del corpus, ni si se emplearon tecnicas de RLHF, DPO o instruccion tuning. La presencia de archivos mmproj (Q8_0 y f16) sugiere que el modelo base incorpora algun componente multimodal, aunque no se detalla su naturaleza ni su rendimiento.

## Capacidades

- Generacion de texto en ingles con especializacion en dominio juridico (etiqueta `legal`).
- Formato conversacional: el repositorio esta etiquetado como `conversational` y compatible con endpoints.
- Soporte de entrada multimodal a traves de los archivos mmproj incluidos (Q8_0 y f16), aunque no se documenta que modalidades cubre ni con que calidad.
- Cuantizacion amplia que permite ejecucion en CPU y GPU de gama baja.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Analisis de contratos y clausulas: el modelo puede procesar fragmentos de contratos en ingles y resumir o clasificar clausulas, aprovechando su afinado sobre texto legal; la cuantizacion Q4_K_M (2,8 GB) permite desplegarlo en un portatil para revisiones preliminares.
- Asistencia en investigacion juridica: generacion de resumenes de documentos legales y extraccion de terminos relevantes en un pipeline local, sin depender de APIs externas, gracias al formato GGUF y a la licencia Apache 2.0.
- Prototipado de asistentes legales en local: uso con llama.cpp u Ollama para validar flujos conversacionales antes de escalar a modelos mayores; el Q8_0 (4,6 GB) ofrece la mejor relacion calidad/tamano dentro del repo.
- Clasificacion y etiquetado de corpus legales: procesamiento por lotes de textos juridicos en ingles para tareas de categorizacion, con la variante Q2_K o Q3_K_S para maximizar throughput en CPU.
- Educacion y divulgacion juridica: generacion de explicaciones simplificadas de textos legales en ingles, con la advertencia de que requiere supervision humana por el riesgo de alucinacion.
- Entornos con recursos limitados: despliegue en equipos sin GPU mediante llama.cpp con la cuantizacion IQ4_XS (2,6 GB), adecuada para estaciones de trabajo modestas o contenedores con poca memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con Q4_K_M (2,8 GB de pesos mas overhead de contexto); en torno a 5-6 GB con Q8_0 (4,6 GB); unos 9-10 GB con f16 (8,5 GB).
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para Q4_K_M (RTX 3060, RTX 4060, RTX 2070); 8 GB o mas para Q8_0 (RTX 3070, RTX 4060 Ti, RTX 2080); A100 o H100 no son necesarias para este tamano y solo aportarian throughput en despliegues por lotes.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con 6 GB o mas; las cuantizaciones Q2_K y Q3_K_S pueden ejecutarse incluso en GPUs con 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los archivos mmproj permiten el uso multimodal en llama.cpp. Para despliegue en servidor con mayor throughput, vLLM o TGI requeririan los pesos originales en safetensors, no incluidos en este repo.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida. El autor recomienda Q4_K_S y Q4_K_M como opciones rapidas y Q8_0 como mejor calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cavil-Qwen3.5-4B (este) | ~4,2 B | no disponible | Apache 2.0 | GGUF | Afinado para dominio legal en ingles |
| Qwen2.5-3B-Instruct | ~3,1 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Modelo generalista, no especializado en legal |
| Llama-3.2-3B-Instruct | ~3,2 B | 128.000 tokens (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors, GGUF | Modelo generalista, licencia con restricciones |
| Phi-3.5-mini-instruct | ~3,8 B | 128.000 tokens (segun documentacion publica de Microsoft) | MIT | safetensors, GGUF | Modelo generalista, buen rendimiento en razonamiento |

La comparativa se limita a tamano, contexto publicado y licencia; no se dispone de datos de rendimiento del modelo Cavil que permitan una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Especializado exclusivamente en ingles: no se documenta soporte de otros idiomas, por lo que su uso en castellano no esta respaldado por el autor.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar referencias legales, articulos o citas inexactas; en dominio juridico esto es especialmente critico y exige verificacion humana.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el corpus de entrenamiento (openSUSE/cavil-legal-text) puede introducir sesgos propios de la jurisdiccion y la fuente de los textos.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que los terminos del modelo base (Qwen 3.5) sean compatibles; la model card del modelo base no se ha revisado en esta ficha.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede garantizar el procesamiento de documentos legales largos sin truncamiento.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la calidad; el autor desaconseja Q3_K_M por su menor calidad relativa.
- Sin cuantizaciones imatrix: no hay versiones ponderadas disponibles, lo que puede reducir la calidad frente a alternativas imatrix de igual tamano.
- Repositorio de terceros: la cuantizacion la mantiene mradermacher, no openSUSE; la trazabilidad y el soporte dependen del cuantizador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Cavil-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/openSUSE/Cavil-Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/openSUSE/cavil-legal-text
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Cavil-Qwen3.5-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
