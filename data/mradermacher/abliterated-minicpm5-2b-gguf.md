# mradermacher/abliterated-minicpm5-2b-GGUF

## Resumen

El modelo `mradermacher/abliterated-minicpm5-2b-GGUF` es una recopilación de cuantizaciones en formato GGUF generadas por mradermacher a partir del modelo base `KidIkaros/abliterated-minicpm5-2b`, una variante "abliterated" (con los mecanismos de rechazo ablacionados) de la familia MiniCPM5 de aproximadamente 2,5 mil millones de parametros. El objetivo de este repositorio es facilitar la ejecucion local del modelo en hardware modesto mediante el ecosistema llama.cpp, sin necesidad de GPU de gama alta ni de pesos completos en safetensors.

La relevancia de esta ficha radica en que combina dos caracteristicas poco habituales: por un lado, un modelo "refusal-free", es decir, al que se le ha suprimido la direccion de activacion responsable de las negativas del modelo alineado; por otro, un tamano compacto (2,52 mil millones de parametros) que lo hace desplegable en CPU y en GPUs de consumo. Esto lo convierte en un objeto de interes tanto para investigadores de alineacion y seguridad como para desarrolladores que quieren un modelo ligero y permisivo para tareas creativas o de generacion de texto.

El repositorio publica doce cuantizaciones estaticas (desde Q2_K hasta f16), con tamanos que van de 1,1 GB a 5,1 GB, y el repositorio completo ocupa 22,8 GB. La licencia declarada es Apache 2.0 y el unico idioma declarado es el ingles. No se especifican en la model card ni la longitud de contexto ni los detalles completos de la arquitectura, por lo que varios campos de esta ficha quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, segun los tags "transformer"); detalles internos no disponibles |
| Parametros totales | 2.516.756.480 (aproximadamente 2,52 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversion a partir de pesos Hugging Face/PyTorch del modelo base) |

## Arquitectura y entrenamiento

El modelo base del que derivan estas cuantizaciones es una variante abliterada de MiniCPM5-2B. La tecnica de "abliteration" consiste en identificar y restar la direccion de activacion asociada al comportamiento de rechazo dentro del espacio de representaciones del transformer, de modo que el modelo deja de producir negativas sistematicas sin reentrenar los pesos desde cero. La model card del repositorio no detalla la arquitectura interna exacta (numero de capas, dimensiones de las cabezas de atencion, uso de atencion lineal u otras innovaciones), ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplico RLHF, DPO u otra tecnica de alineacion posterior.

La aportacion especifica de este repositorio es la cuantizacion: mradermacher ha generado cuantizaciones estaticas (no ponderadas ni imatrix, segun indica el propio autor) mediante llama.cpp, partiendo de los pesos HF. No se han publicado cuantizaciones ponderadas/imatrix para este modelo, y el autor indica que si no aparecen poco despues de las estaticas, probablemente no las tenga planificadas. Para obtener detalles de arquitectura y entrenamiento habria que consultar la ficha del modelo base `KidIkaros/abliterated-minicpm5-2b`.

## Capacidades

- Generacion de texto conversacional en ingles, con comportamiento "refusal-free": el modelo tiende a no rechazar peticiones que un modelo alineado convencional declinaria.
- Generacion de texto general y creativo (relatos, dialogos, roleplay, continuacion de texto).
- Razonamiento basico y respuesta a preguntas, limitado por el tamano de 2,5 mil millones de parametros.
- Generacion de codigo sencillo y explicaciones tecnicas de nivel introductorio; no se dispone de datos que confirmen un rendimiento competitivo en tareas de programacion exigentes.
- Capacidades multilingues limitadas al ingles declarado; no hay soporte declarado de castellano ni de otros idiomas.
- No se ha confirmado soporte de tool calling, function calling, uso de agentes ni razonamiento multi-paso en la informacion proporcionada.
- No se ha confirmado modo de razonamiento explicito ("thinking"), vision ni audio.

## Casos de uso

- Investigacion en alineacion y seguridad: el modelo permite estudiar como la ablacion de la direccion de rechazo modifica el comportamiento, comparando respuestas frente al modelo MiniCPM5-2B original en tareas de evaluacion de seguridad.
- Red-teaming y generacion de conjuntos de datos adversarios: util para producir prompts y respuestas que sirvan como material de prueba en auditorias de filtros y clasificadores de contenido.
- Generacion de texto creativo sin restricciones tematicas: escritura de ficcion, guiones o roleplay donde el autor necesita un modelo que no introduzca negativas automaticas, ejecutado localmente en Q4_K_M (1,7 GB).
- Despliegue en dispositivos de borde y CPU: las cuantizaciones Q2_K (1,1 GB) y Q4_K_S (1,6 GB) permiten inferencia en portatiles, mini-PC y placas tipo Raspberry Pi con llama.cpp, sin GPU dedicada.
- Prototipado rapido de aplicaciones conversacionales: usar el modelo como sustituto ligero durante el desarrollo de una interfaz o pipeline, antes de escalar a un modelo mayor, gracias a su consumo reducido de VRAM.
- Analisis y transformacion de texto en ingles: resumen, reescritura, clasificacion simple y extraccion de informacion en pipelines por lotes donde el coste por token es critico.
- Experimentacion con tecnicas de cuantizacion: el repositorio incluye doce niveles de cuantizacion, lo que permite medir el impacto de Q2_K frente a Q8_0 en perplejidad y calidad de salida sobre un mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se han facilitado datos del modelo base. Cualquier comparacion numerica con otros modelos requeriria consultar la ficha de `KidIkaros/abliterated-minicpm5-2b` o ejecutar evaluaciones propias sobre las cuantizaciones publicadas.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (incluye margen minimo para el contexto; el consumo real depende de la longitud de contexto configurada):
  - Q2_K (1,1 GB): apto para GPU con 2 GB de VRAM o incluso CPU con 4 GB de RAM.
  - Q3_K_S (1,3 GB) y Q3_K_M (1,4 GB): 3 GB de VRAM.
  - IQ4_XS (1,5 GB), Q3_K_L (1,5 GB), Q4_K_S (1,6 GB) y Q4_K_M (1,7 GB): 3-4 GB de VRAM.
  - Q5_K_S / Q5_K_M (1,9 GB): 4 GB de VRAM.
  - Q6_K (2,2 GB): 4-5 GB de VRAM.
  - Q8_0 (2,8 GB): 6 GB de VRAM.
  - f16 (5,1 GB): 8 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas. Modelos como RTX 3050, RTX 3060, RTX 4060 o superiores ejecutan sin problema las cuantizaciones Q4 y Q5. Para f16 se recomienda al menos una RTX 3060 de 12 GB o similar. GPUs de datacenter (A100, H100) no son necesarias para un modelo de este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 4 GB o mas, y tambien en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui (llama.cpp backend) y cualquier runtime compatible con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo API.
- Latencia y throughput estimados: no disponible. Al tratarse de un modelo de 2,5 mil millones de parametros, se espera una velocidad de generacion alta en GPU de consumo y moderada en CPU, pero no se han publicado mediciones concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| abliterated-minicpm5-2b (este) | 2,52 mil millones | no disponible | Apache 2.0 | Variante refusal-free, cuantizaciones GGUF de 1,1 a 5,1 GB |
| MiniCPM5-2B (base, alineado) | ~2,5 mil millones | no disponible | no disponible | Modelo original con alineacion intacta |
| Qwen2.5-1.5B-Instruct | 1,5 mil millones | 32.768 tokens | Apache 2.0 | Referente de tamano similar, con soporte multilingue y tool calling |
| Llama-3.2-1B-Instruct | 1,23 mil millones | 128.000 tokens | Licencia comunitaria Llama 3.2 | Menor tamano, contexto muy amplio, requiere aceptar licencia |
| Gemma-2-2B | ~2,6 mil millones | 8.000 tokens | Licencia Gemma | Alternativa de Google con calidad alta en su rango |

Las cifras de contexto y licencia de los modelos comparados proceden de sus fichas oficiales publicas. No se dispone de datos de rendimiento comparado entre ellos y este modelo, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- Modelo "abliterated" y refusal-free: ha sido modificado deliberadamente para eliminar sus mecanismos de rechazo. Puede generar contenido inapropiado, sesgado, ofensivo o potencialmente danino. No es apto para despliegue en produccion orientada al publico sin filtros externos.
- Riesgo elevado de alucinacion: con 2,5 mil millones de parametros, la precision factual y el razonamiento complejo son limitados; es esperable que invente datos, cifras o referencias.
- Sesgos conocidos: no hay informacion especifica sobre los sesgos del modelo base ni de la variante abliterada. Los modelos entrenados predominantemente en ingles suelen arrastrar sesgos culturales y de representacion propios de ese corpus.
- Limitacion idiomatica: solo se declara soporte de ingles. El rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Longitud de contexto desconocida: al no especificarse en la model card, no se puede garantizar un comportamiento correcto en conversaciones largas o documentos extensos.
- Licencia: Apache 2.0, que permite uso comercial y modificacion. No obstante, el modelo base hereda la licencia de MiniCPM5, y conviene verificar que la cadena de licencias sea compatible antes de un uso comercial.
- Cuantizaciones de baja precision: las variantes Q2_K y Q3_K introducen perdida notable de calidad. Para uso real se recomienda Q4_K_M o superior.
- Sin cuantizaciones ponderadas/imatrix: el autor no ha publicado versiones ponderadas, lo que puede suponer una ligera perdida de calidad frente a cuantizaciones de otros repositorios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/abliterated-minicpm5-2b-GGUF
- Modelo base: https://huggingface.co/KidIkaros/abliterated-minicpm5-2b
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#abliterated-minicpm5-2b-GGUF
- Preguntas frecuentes y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
