# mradermacher/Arete-27B-Uncensored-V2-i1-GGUF

## Resumen

Arete-27B-Uncensored-V2-i1-GGUF es una cuantizacion en formato GGUF del modelo SargeDev/Arete-27B-Uncensored-V2, publicada por el usuario mradermacher, conocido por generar versiones cuantizadas de modelos abiertos. El modelo base es un transformer de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) etiquetado como "abliterated" y "uncensored", lo que indica que ha sido sometido a un proceso de abliteracion para eliminar los mecanismos de rechazo entrenados en el modelo original. La model card menciona la etiqueta "qwen3.8", lo que sugiere que el modelo base podria derivar de la familia Qwen, aunque no se confirma de forma explicita.

El repositorio contiene unicamente cuantizaciones GGUF generadas con metodo imatrix (importance matrix), disenadas para su uso con llama.cpp y herramientas compatibles. El autor indica que las cuantizaciones estaticas estan disponibles en un repositorio separado. La licencia declarada es Apache 2.0 y el unico idioma soportado declarado es el ingles. El modelo tiene cero descargas y cero likes en el momento de la consulta, y fue creado el 9 de noviembre de 2026.

La relevancia de este modelo radica en su orientacion a casos de uso donde el modelo base aplicaria restricciones de contenido, y en la disponibilidad de cuantizaciones que permiten ejecutarlo en hardware de consumo. No obstante, la informacion publicada es muy limitada: no hay datos de benchmarks, no se detalla la composicion del entrenamiento ni el contexto maximo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalles no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, IQ3_XXS, IQ3_S, IQ3_M, IQ3_XS, IQ3_L, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M, Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL, Q5_K_S, Q5_K_M, Q6_K (segun tags de la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base SargeDev/Arete-27B-Uncensored-V2 en la informacion proporcionada. La etiqueta "qwen3.8" y el tamano de 27,3 mil millones de parametros sugieren una posible base en la familia Qwen, pero no se confirma ni se detalla la arquitectura (numero de capas, dimensiones de atencion, uso de GQA, etc.). Tampoco se especifica si emplea atencion lineal, decodificacion especulativa u otras innovaciones.

Respecto al entrenamiento, la model card no incluye informacion sobre el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La unica informacion relevante es que el modelo ha sido "abliterated" y "uncensored", lo que implica un post-procesado para eliminar direcciones de activacion asociadas al rechazo de contenido. Las cuantizaciones de este repositorio se han generado con imatrix (importance matrix), un metodo que pondera la cuantizacion segun la importancia de los pesos para reducir la perdida de calidad. No se dispone de informacion sobre el proceso de cuantizacion mas alla de los tipos listados.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" y "decision".
- Modelo "uncensored" y "abliterated": no aplica los mecanismos de rechazo tipicos de los modelos alineados, lo que permite generar contenido que otros modelos bloquearian.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles; no se confirman otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de ficcion y narrativa sin restricciones: el modelo, al estar abliterado, puede abordar tramas y dialogos que modelos alineados rechazarian, lo que lo hace util para escritores que necesitan explorar temas sensibles sin bloqueos.
- Investigacion sobre alineacion y seguridad: permite estudiar el comportamiento de un modelo sin mecanismos de rechazo, comparandolo con su version original para analizar el efecto de la abliteracion en la calidad y los sesgos.
- Roleplay y simulacion de personajes: su naturaleza conversacional y sin censura facilita mantener personajes con personalidades extremas o conflictivas en entornos controlados.
- Generacion de datos sinteticos para entrenamiento: puede producir textos en dominios donde los modelos censurados se niegan a generar, util para aumentar datasets de investigacion.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M o Q5_K_M permiten ejecutar un modelo de 27B en GPUs con 16-24 GB de VRAM mediante llama.cpp, sin depender de servicios en la nube.
- Prototipado de chatbots especializados: al no aplicar rechazos genericos, es adecuado para asistentes de nicho (por ejemplo, discusion de temas medicos o legales sensibles) donde el filtrado excesivo degrada la utilidad, siempre con supervision humana.
- Analisis de contenido y moderacion: puede emplearse como generador de casos adversarios para probar sistemas de moderacion, al producir contenido que otros modelos no generarian.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de 27,3B parametros):
  - Q2_K / IQ2: aproximadamente 11 GB (segun el tamano del archivo i1-Q2_K listado, 11,0 GB).
  - Q4_K_M: aproximadamente 16-17 GB.
  - Q5_K_M: aproximadamente 19-20 GB.
  - Q6_K: aproximadamente 22-23 GB.
  - Los tamanos exactos de cada cuantizacion no se detallan en la informacion proporcionada, salvo el i1-Q2_K (11,0 GB).
- GPU recomendadas: A100 40/80 GB, H100, RTX 4090 (24 GB) para cuantizaciones Q4-Q6; RTX 3090 (24 GB) similar; GPUs de 16 GB (RTX 4080, 4060 Ti 16GB) para Q4 con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con Q4_K_M o Q5_K_M; en GPUs de 16 GB con Q4 y contexto limitado; en GPUs de 12 GB solo con cuantizaciones Q2/IQ2 de baja calidad.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), LM Studio, y servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B-Uncensored-V2-i1-GGUF (este) | 27,3B | no disponible | Apache 2.0 | GGUF | Abliterated, solo ingles, sin benchmarks publicados |
| SargeDev/Arete-27B-Uncensored-V2 (base) | 27,3B | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar |
| mradermacher/Arete-27B-Uncensored-V2-GGUF | 27,3B | no disponible | Apache 2.0 | GGUF | Cuantizaciones estaticas del mismo modelo base |

No se dispone de informacion sobre modelos comparables de la misma categoria (27B abliterated) en la informacion proporcionada. La comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Modelo "uncensored" y "abliterated": no aplica filtros de seguridad, por lo que puede generar contenido ofensivo, ilegal o danino. No apto para produccion sin moderacion externa.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; al ser un modelo abliterado, la perdida de capacidades por el proceso de abliteracion no esta cuantificada.
- Solo ingles declarado: no se garantiza el rendimiento en castellano ni en otros idiomas.
- Sin benchmarks publicados: no hay datos objetivos de MMLU, HumanEval, GSM8K ni similares, lo que impide evaluar su calidad frente a alternativas.
- Contexto maximo no documentado: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente el limite.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad por el contenido generado.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion independiente de las cuantizaciones.
- El proceso de abliteracion puede degradar el rendimiento en tareas que requieren razonamiento cuidadoso o rechazo de premisas falsas.
- La cuantizacion i1-Q2_K listada (11,0 GB) es de baja calidad; el propio autor sugiere IQ3_XXS como mejor alternativa en ese rango de tamano.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Arete-27B-Uncensored-V2-i1-GGUF
- Modelo base: https://huggingface.co/SargeDev/Arete-27B-Uncensored-V2
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Arete-27B-Uncensored-V2-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Arete-27B-Uncensored-V2-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Ejemplo de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
