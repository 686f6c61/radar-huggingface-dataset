# mradermacher/Barcenas-Inkling-2-Mini-GGUF

## Resumen

Barcenas-Inkling-2-Mini es un modelo de lenguaje de ~26.070 millones de parametros (26,07 B) afinado para castellano por Danielbrdz sobre una base denominada Inkling-2-Mini, y distribuido en formato GGUF por mradermacher. El repositorio que nos ocupa es una coleccion de cuantizaciones estaticas del modelo original, pensadas para su ejecucion en llama.cpp y entornos compatibles con GGUF, con licencia Apache 2.0.

El ajuste fino se realizo sobre el dataset OysterCoreAI/SFT-General-Spanish-50K, un conjunto de instrucciones en castellano, y el modelo declara el espanol como unico idioma soportado. La relevancia de esta publicacion es practica: ofrece una via de despliegue local de un modelo de 26 B en hardware de consumo mediante cuantizaciones que van de 11 GB (Q2_K) a 27,9 GB (Q8_0), ademas de ficheros mmproj para un componente multimodal.

La informacion disponible es limitada: la model card del repositorio GGUF es una plantilla generica de cuantizacion y no documenta arquitectura, contexto, datos de entrenamiento ni resultados de evaluacion. Esta ficha refleja unicamente los datos verificables en la informacion proporcionada y marca explicitamente como "no disponible" todo lo que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; presumiblemente transformer decoder-only, sin confirmar) |
| Parametros totales | 26.070.385.152 (~26,07 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | es (espanol) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Danielbrdz/Barcenas-Inkling-2-Mini: la model card del repositorio GGUF no describe el tipo de red (transformer denso, MoE, hibrido u otro), ni el numero de capas, dimensiones ocultas o mecanismo de atencion. Tampoco consta el numero de tokens de entrenamiento ni la composicion completa del dataset.

El unico dato de entrenamiento verificable es el uso del dataset OysterCoreAI/SFT-General-Spanish-50K para el ajuste supervisado (SFT) en castellano. No se documenta si hubo fases adicionales de RLHF, DPO u otra optimizacion por preferencias. La presencia de ficheros mmproj en el repositorio sugiere un componente multimodal (vision) en el modelo base, aunque no se detalla su naturaleza ni su entrenamiento.

## Capacidades

- Generacion de texto conversacional en castellano, segun la etiqueta `conversational` del repositorio.
- Ajuste especifico para instrucciones en espanol mediante SFT sobre 50 000 ejemplos.
- Soporte multimodal potencial: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica la existencia de un proyector para un componente de vision en el modelo base. No se documenta que tipo de entradas visuales admite.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite su uso en infraestructuras de inferencia estandar.
- No consta soporte explicito de tool calling, function calling, agentes, modo de razonamiento (thinking) ni audio en la informacion disponible.
- Capacidades multilingues: limitadas al espanol segun los metadatos; no se declaran otros idiomas.

## Casos de uso

- Asistente conversacional en castellano para aplicaciones locales: el modelo puede desplegarse con llama.cpp u Ollama usando las cuantizaciones Q4_K_M (17,6 GB) o Q5_K_M (20,0 GB), adecuadas para equipos con 24 GB de VRAM o con descarga parcial en CPU.
- Procesamiento por lotes de textos en espanol en servidores sin GPU de gran capacidad: la cuantizacion Q2_K (11 GB) permite ejecutar el modelo en GPUs de 12-16 GB o en configuraciones CPU+GPU, a costa de menor calidad.
- Generacion de respuestas en espanol para sistemas de atencion al cliente con requisitos de privacidad: al ejecutarse en local, los datos no salen de la infraestructura propia, lo que encaja en entornos con restricciones de cumplimiento.
- Prototipado de aplicaciones de IA en castellano por parte de desarrolladores hispanohablantes: el ajuste SFT en espanol y la licencia Apache 2.0 facilitan la experimentacion sin coste de licencia.
- Investigacion sobre cuantizacion y degradacion de calidad: el repositorio ofrece un espectro amplio de cuantizaciones (de 2 a 8 bits) del mismo modelo, util para estudiar el impacto de la compresion en tareas en espanol.
- Evaluacion de modelos multimodales en espanol: los ficheros mmproj permiten probar el componente de vision del modelo base en pipelines de llama.cpp con soporte multimodal, aunque las capacidades concretas no estan documentadas.
- Fine-tuning posterior o destilacion: al estar disponible el modelo base en safetensors con licencia Apache 2.0, se puede reutilizar como punto de partida para tareas especificas en castellano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~11,0 GB
  - Q3_K_S: ~12,7 GB; Q3_K_M: ~13,8 GB; Q3_K_L: ~14,3 GB
  - IQ4_XS: ~14,9 GB; Q4_K_S: ~16,2 GB; Q4_K_M: ~17,6 GB
  - Q5_K_S: ~18,7 GB; Q5_K_M: ~20,0 GB
  - Q6_K: ~23,6 GB
  - Q8_0: ~27,9 GB
  - Componente multimodal: mmproj-Q8_0 ~0,4 GB; mmproj-f16 ~0,7 GB
- GPU recomendadas: no disponibles en la informacion. Por tamano, las cuantizaciones Q4_K_M y Q5_K_M encajan en GPUs de 24 GB (RTX 3090, RTX 4090, A10G, L4 con descarga parcial); Q8_0 requiere 32 GB o mas (A100 40 GB, H100, RTX A6000). No se han publicado mediciones de latencia ni throughput.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones Q4/Q5; en GPUs de 16 GB solo con Q2_K/Q3_K y contexto reducido, o con offload parcial a CPU.
- Opciones de despliegue: llama.cpp y cualquier frontend compatible con GGUF (Ollama, LM Studio, text-generation-webui, koboldcpp). El repositorio esta etiquetado como `endpoints_compatible`. vLLM y TGI no se mencionan como soportados para formato GGUF en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo que permitan una comparacion cuantitativa fiable. A continuacion se comparan solo caracteristicas verificables con alternativas de tamano y enfoque similares; los datos de los modelos alternativos se basan en conocimiento general y pueden variar segun la version.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Barcenas-Inkling-2-Mini (este) | ~26,07 B | no disponible | es | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-32B-Instruct | ~32,5 B | 128K (modelo base) | multilingue | Apache 2.0 | safetensors, GGUF |
| Gemma 2 27B IT | ~27 B | 8K | multilingue | Gemma Terms | safetensors, GGUF |
| Mistral Small 24B (2501) | ~24 B | 32K | multilingue | Apache 2.0 | safetensors, GGUF |

La ventaja diferencial de este modelo frente a las alternativas es su especializacion en castellano y su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. La desventaja es la ausencia de documentacion tecnica y de evaluaciones publicadas que permitan verificar su calidad frente a modelos multilingues mas contrastados.

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se publican arquitectura, contexto, datos de entrenamiento ni evaluaciones, lo que dificulta estimar su calidad y comportamiento en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluaciones que cuantifiquen su tasa de alucinacion en espanol.
- Sesgos: no documentados. Al entrenarse sobre un dataset SFT en espanol no descrito en detalle, pueden persistir sesgos linguisticos, culturales y de dominio desconocidos.
- Limitacion idiomatica: el modelo declara unicamente el espanol; su rendimiento en otros idiomas es incierto y probablemente degradado.
- Contexto: al no constar la longitud de contexto, no se debe asumir una ventana larga; conviene validar el comportamiento con prompts largos antes de usarlo en produccion.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S pueden degradar notablemente la coherencia; para uso serio se recomienda Q4_K_M o superior.
- Componente multimodal sin documentar: los ficheros mmproj existen, pero no se especifica que tareas de vision soporta ni con que calidad.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un modelo derivado conviene verificar que el modelo base Danielbrdz/Barcenas-Inkling-2-Mini mantiene la misma licencia y no impone restricciones adicionales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Barcenas-Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/Danielbrdz/Barcenas-Inkling-2-Mini
- Dataset de SFT: https://huggingface.co/datasets/OysterCoreAI/SFT-General-Spanish-50K
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Barcenas-Inkling-2-Mini-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
