# mradermacher/phi-2-orange-v2-GGUF

## Resumen

phi-2-orange-v2-GGUF es la distribucion en formato GGUF del modelo rhysjones/phi-2-orange-v2, un ajuste fino de Microsoft Phi-2 realizada por rhysjones y cuantizada por mradermacher. Se trata de un modelo de lenguaje de 2.779 millones de parametros (2,78B) orientado a conversacion e instrucciones, disenado para ejecutarse en hardware de consumo gracias a sus reducidas dimensiones. La relevancia de esta publicacion radica en que ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K de 1,2 GB hasta f16 de 5,7 GB), lo que permite desplegarlo en GPUs modestas o incluso en CPU.

El modelo base Phi-2 es un transformer denso de tipo decoder-only entrenado por Microsoft Research con un enfoque en "textbook quality data", es decir, datos sinteticos de alta calidad educativa. Sobre esa base, rhysjones aplico un ajuste fino supervisado (SFT) y probablemente DPO, utilizando un conjunto de datasets de instrucciones y preferencias como SlimOrca-Dedup, Synthia-v1.3, Verified-Camel, Pure-Dove, Capybara, MetaMathQA, orca_dpo_pairs y UltraFeedback binarizado. El resultado es un modelo conversacional afinado para seguir instrucciones en ingles.

Esta ficha documenta exclusivamente la version GGUF publicada por mradermacher, que conserva la licencia MIT del modelo original y esta pensada para inferencia local con llama.cpp, Ollama o cualquier runtime compatible con GGUF. No se dispone de informacion sobre benchmarks especificos de este ajuste, por lo que las cifras de rendimiento deben tratarse con cautela y validarse en el caso de uso concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Microsoft Phi-2) |
| Parametros totales | 2.779.683.840 (2,78B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Phi-2 original soporta 2.048 tokens; no confirmado para este ajuste) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (tambien disponible el modelo base en safetensors via rhysjones/phi-2-orange-v2) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Microsoft Phi-2: un transformer decoder-only denso de 2,78B parametros, sin mecanismos de mezcla de expertos ni atencion lineal, con atencion multi-cabeza clasica y capas feed-forward convencionales. Phi-2 fue entrenado por Microsoft Research sobre un corpus curado de "textbook quality" que combina datos web filtrados y datos sinteticos generados por modelos mayores, con el objetivo de maximizar la densidad de conocimiento por parametro. No se dispone de cifras exactas del numero de tokens de entrenamiento original en la informacion proporcionada.

Sobre esa base, rhysjones realizo un ajuste fino (fine-tuning) para convertir el modelo en un asistente conversacional. Segun los metadatos de la model card, el ajuste utilizo los siguientes datasets: Open-Orca/SlimOrca-Dedup, migtissera/Synthia-v1.3, LDJnr/Verified-Camel, LDJnr/Pure-Dove, LDJnr/Capybara, meta-math/MetaMathQA, Intel/orca_dpo_pairs y argilla/ultrafeedback-binarized-preferences-cleaned. La presencia de orca_dpo_pairs y UltraFeedback binarizado sugiere que se aplico una etapa de preferencias (DPO o similar) ademas del SFT, aunque la model card no detalla la receta exacta ni los hiperparametros. mradermacher se limita a cuantizar los pesos del modelo original sin modificar la arquitectura ni el entrenamiento; su aportacion es la conversion a GGUF y la generacion de los distintos niveles de cuantizacion, incluyendo una variante con imatrix (publicada en el repositorio phi-2-orange-v2-i1-GGUF).

## Capacidades

- Generacion de texto conversacional en ingles con formato de chat multi-turno.
- Seguimiento de instrucciones (instruction following) gracias al ajuste sobre SlimOrca, Synthia y Capybara.
- Razonamiento matematico basico, reforzado por el dataset MetaMathQA.
- Generacion de codigo en lenguajes comunes, heredada de Phi-2 y reforzada por datos de instrucciones.
- Razonamiento de sentido comun y respuesta a preguntas (QA) de dominio general.
- Alineacion con preferencias humanas (utilidad, formato, seguridad basica) gracias a los datos de DPO/UltraFeedback.
- No se documenta soporte explicito de tool calling o function calling en la informacion proporcionada.
- No se documenta soporte de agentes, multi-step reasoning estructurado, vision, audio ni modo "thinking".
- Capacidad multilingue limitada al ingles segun los metadatos del repositorio.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede gestionar dialogos multi-turno en un portatil o mini-PC con GPU integrada, ya que la cuantizacion Q4_K_M ocupa solo 1,8 GB y cabe en memorias unificadas de 8 GB o menos. Es adecuado para prototipos de chatbots sin dependencia de la nube.
- Generacion de codigo asistida en editores ligeros: con la cuantizacion Q5_K_M (2,1 GB) puede integrarse en plugins de IDE que autocompleten funciones o expliquen fragmentos, aprovechando la herencia de Phi-2 en codigo y los datos de instrucciones.
- Educacion y tutoria automatizada: el entrenamiento con MetaMathQA y datos tipo "textbook" lo hace util para explicar conceptos de matematicas y ciencias a nivel de secundaria, con la ventaja de ejecutarse offline en entornos escolares sin conectividad.
- Procesamiento por lotes de clasificacion y extraccion de informacion: al ser un modelo pequeno y rapido en GGUF, puede desplegarse con llama.cpp o vLLM (si se convierte) para etiquetar grandes volumenes de texto en ingles con bajo coste energetico.
- Prototipado rapido de productos de IA: investigadores que necesitan iterar sobre prompts o evaluar tecnicas de alineacion pueden usar la version Q8_0 (3,1 GB) en una RTX 3060 o superior, obteniendo calidad cercana a f16 con menor huella de memoria.
- Investigacion sobre cuantizacion: el repositorio ofrece 12 variantes de cuantizacion del mismo modelo, lo que permite estudiar empiricamente la degradacion de calidad (perplejidad) segun el nivel de compresion, util para trabajos academicos sobre eficiencia de inferencia.
- Despliegue en dispositivos edge o embebidos: la variante Q2_K (1,2 GB) puede ejecutarse en CPUs ARM o en GPUs de 4 GB, habilitando asistentes de voz o texto en dispositivos con recursos muy limitados, siempre aceptando la perdida de calidad asociada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas, y el autor del ajuste (rhysjones) no aporta cifras en los metadatos consultados. Cualquier dato de rendimiento debe obtenerse evaluando el modelo directamente en el caso de uso concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~1,2 GB
  - Q3_K_M: ~1,5 GB
  - IQ4_XS: ~1,6 GB
  - Q4_K_M: ~1,8 GB
  - Q5_K_M: ~2,1 GB
  - Q6_K: ~2,4 GB
  - Q8_0: ~3,1 GB
  - f16: ~5,7 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4/Q5 (GTX 1650, RTX 3050, RTX 4060). Para Q8_0 se recomienda 6 GB o mas (RTX 3060, RTX 4060 Ti). Para f16, 8 GB o mas (RTX 3070, RTX 4070, A100/H100 si se busca throughput maximo).
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4 GB o mas de VRAM, e incluso en CPU con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp (nativo para GGUF), Ollama (importando el GGUF), LM Studio, text-generation-webui, koboldcpp. Para vLLM o TGI seria necesario convertir a safetensors o usar el modelo base rhysjones/phi-2-orange-v2.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. En la practica, un modelo de 2,78B en Q4_K_M sobre una RTX 4060 deberia superar holgadamente las decenas de tokens por segundo, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| phi-2-orange-v2-GGUF (este) | 2,78B | no disponible | MIT | GGUF | Ajuste conversacional de Phi-2, solo ingles |
| Microsoft Phi-2 (base) | 2,78B | 2.048 tokens | MIT | safetensors | Modelo base sin ajuste conversacional |
| TinyLlama-1.1B-Chat | 1,1B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | Menor tamano, menor capacidad; alternativa para hardware muy limitado |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Multilingue, contexto mucho mayor, mejor soporte de tool calling |

La comparativa se basa en caracteristicas publicas de los modelos citados; no se dispone de datos de benchmarks del modelo de esta ficha para comparar rendimiento numerico. Frente a Phi-2 base, la ventaja es el ajuste conversacional; frente a TinyLlama, mayor capacidad a costa de mas VRAM; frente a Qwen2.5-3B-Instruct, este modelo queda por detras en contexto, multilingue y soporte de herramientas, aunque mantiene la licencia MIT y un ecosistema de cuantizaciones muy completo.

## Limitaciones y advertencias

- Sesgos conocidos: al derivar de Phi-2 y de datasets de instrucciones en ingles, puede reproducir sesgos de genero, raza o cultura presentes en los datos de entrenamiento; no se documenta ninguna mitigacion especifica.
- Riesgo de alucinacion: como todo modelo de 2,78B, tiende a inventar hechos, citas y referencias, especialmente en dominios especializados. No debe usarse como fuente de verdad sin verificacion.
- Limitacion de idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas sera previsiblemente pobre o degradado.
- Limitacion de contexto: no se confirma la longitud de contexto de este ajuste; el Phi-2 original soporta 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con atribucion; sin embargo, conviene revisar las licencias de los datasets de ajuste (algunos como UltraFeedback u Orca pueden tener terminos adicionales) antes de un despliegue comercial.
- Caveat de produccion: al ser un modelo pequeno y sin benchmarks publicados, no se recomienda para tareas de alta precision (medicina, legal, finanzas) sin evaluacion previa. La calidad varia notablemente entre cuantizaciones; Q2_K y Q3_K_M pueden degradar la coherencia.
- No se documenta soporte de tool calling, agentes ni modo de razonamiento extendido, lo que limita su uso en pipelines agenticos modernos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/phi-2-orange-v2-GGUF
- Modelo base (safetensors): https://huggingface.co/rhysjones/phi-2-orange-v2
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/phi-2-orange-v2-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#phi-2-orange-v2-GGUF
- Modelo original Microsoft Phi-2: https://huggingface.co/microsoft/phi-2
- Repositorio de solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
