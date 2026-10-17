# mradermacher/AWAXIS-Think-28B-GGUF

## Resumen

mradermacher/AWAXIS-Think-28B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo Anserwise/AWAXIS-Think-28B, publicado por el usuario mradermacher, especializado en generar versiones cuantizadas de modelos abiertos. No se trata de un modelo entrenado desde cero, sino de una redistribucion optimizada para inferencia local del modelo original desarrollado por Anserwise.

El modelo base tiene 26.895.998.464 parametros (unos 26,9 mil millones) y esta orientado a razonamiento explicito: entre sus etiquetas figuran reasoning y thinking. El enfasis principal es el coreano, con etiquetas como korean-sft, korean-lora y k-ai-leaderboard, que apuntan a un ajuste fino supervisado y con LoRA sobre datos coreanos y a su evaluacion en una tabla de clasificacion coreana. Los idiomas declarados son coreano, ingles, chino, japones y multilingue.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales y el repositorio cubre un rango amplio de cuantizaciones, desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), lo que hace viable el despliegue tanto en GPUs de consumo como en aceleradores de centro de datos. La informacion publicada no detalla la longitud de contexto soportada ni la composicion del dataset de entrenamiento del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. Las etiquetas del repositorio indican atencion hibrida (hybrid-attention) y atencion lineal (linear-attention); no se confirma en la model card |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16 (referencia), Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-f16 y mmproj-Q8_0 para el componente multimodal |
| Idiomas soportados | Coreano (ko), ingles (en), chino (zh), japones (ja), multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base Anserwise/AWAXIS-Think-28B se publica para transformers en safetensors |
| Tamano del repositorio | 187,9 GB (suma de todas las cuantizaciones) |
| Descargas / likes | 391 descargas, 0 likes |
| Fecha de publicacion | 26 de abril de 2026 (ultima actualizacion: 16 de octubre de 2026) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Las etiquetas del repositorio sugieren un transformer con atencion hibrida que combinaria atencion lineal (linear-attention) y atencion completa, un patron habitual en modelos recientes de contexto largo que buscan reducir el coste cuadratico del mecanismo de atencion. Otras etiquetas, como darwin y evolutionary-merge, apuntan a la posibilidad de que el modelo base proceda de una fusion de modelos obtenida mediante un proceso evolutivo, aunque esto no se confirma en ningun documento. Del mismo modo, las etiquetas qwen3.5 y qwen3.6 sugieren una posible relacion de familia con esa linea de modelos, sin que exista confirmacion en la informacion disponible.

Respecto al entrenamiento, las etiquetas korean-sft y korean-lora indican que hubo al menos una fase de ajuste supervisado y un ajuste con adaptadores LoRA orientados al coreano, y k-ai-leaderboard sugiere evaluacion en una tabla comparativa de IA en coreano. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

En cuanto al proceso de este repositorio concreto, se trata de cuantizaciones estaticas (static quants) generadas con convert_type hf y quantize_version 2, con cuantizacion de tensores de salida activada. Existe ademas un repositorio complementario con cuantizaciones ponderadas con imatrix (i1), que suelen ofrecer mejor calidad para un mismo tamano de fichero. La presencia de ficheros mmproj (multi-modal projection) en f16 y Q8_0 indica que el modelo base incorpora un componente multimodal, presumiblemente de proyeccion vision-lenguaje, aunque no se detalla su funcionamiento.

## Capacidades

- Generacion de texto y razonamiento explicito, con modo de pensamiento (thinking) segun las etiquetas del modelo.
- Razonamiento multi-paso orientado a tareas complejas, incluyendo matematicas y logica, si bien no hay benchmarks publicados que lo cuantifiquen.
- Capacidades multilingues declaradas en coreano, ingles, chino y japones, con especial enfasis en el coreano.
- Componente multimodal: la presencia de ficheros mmproj-f16 y mmproj-Q8_0 implica soporte de entrada visual a traves del proyector multimodal.
- Conversacion multi-turno, segun la etiqueta conversational del repositorio.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que facilita su integracion en servicios de inferencia.
- Soporte de tool calling o function calling: no disponible en la informacion publicada.
- Capacidades de agente autonomo: no disponible en la informacion publicada; las etiquetas de razonamiento sugieren cierta idoneidad, pero no hay confirmacion.
- Capacidades de audio: no disponible.

## Casos de uso

- Asistencia y atencion al cliente en coreano: el modelo esta ajustado especificamente sobre datos coreanos (korean-sft, korean-lora), lo que lo hace adecuado para despliegues de soporte conversacional multi-turno dirigidos al mercado surcoreano, con la ventaja adicional de una licencia Apache 2.0 que permite integrarlo en productos comerciales.
- Razonamiento asistido con traza de pensamiento: su orientacion a reasoning y thinking permite usarlo en tareas de analisis estructurado, verificacion de hipotesis o resolucion de problemas paso a paso donde interesa revisar el proceso de razonamiento, no solo la respuesta final.
- Procesamiento de documentacion multilingue ko/en/zh/ja: util para empresas con operaciones en Asia oriental que necesiten resumir, clasificar o extraer informacion de documentos en varios de estos idiomas dentro del mismo flujo.
- Analisis de imagenes con descripcion en texto en local: los ficheros mmproj permiten cargar el proyector multimodal en llama.cpp y realizar tareas de descripcion de imagenes, extraccion de texto visible o respuesta a preguntas sobre capturas, sin enviar datos a servicios externos.
- Prototipado e investigacion en una sola GPU de consumo: con cuantizaciones Q4_K_S o Q4_K_M (15,7 GB y 16,6 GB respectivamente) el modelo cabe en tarjetas de 24 GB, lo que permite experimentar con un modelo de casi 27 B de parametros en equipos de sobremesa.
- Despliegue en entornos con requisitos de privacidad: al poder ejecutarse integramente en local mediante llama.cpp u Ollama, es apto para sectores como sanidad, legal o administracion publica donde los datos no pueden salir de la infraestructura propia.
- Generacion de codigo y automatizacion de tareas tecnicas: viable como asistente de programacion en ingles y coreano, aunque sin datos publicados de HumanEval ni MBPP que permitan estimar su nivel real en este dominio.
- Traduccion asistida entre coreano y el resto de idiomas declarados: aprovechable como componente de un pipeline de traduccion con revision humana posterior, dado el soporte declarado de ko, en, zh y ja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye valores de MMLU, HumanEval, GSM8K, KMMLU ni de ninguna otra prueba, ni referencias al leaderboard coreano mencionado en las etiquetas. Tampoco se proporcionan mediciones de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada segun el fichero GGUF (solo pesos, sin cache KV ni overhead del runtime):
  - Q2_K: 10,8 GB, apto para GPUs de 12-16 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: 12,2 / 13,4 / 14,4 GB.
  - IQ4_XS: 15,3 GB; Q4_K_S: 15,7 GB; Q4_K_M: 16,6 GB.
  - Q5_K_S / Q5_K_M: 18,8 / 19,3 GB.
  - Q6_K: 22,2 GB.
  - Q8_0: 28,7 GB.
  - f16 (no incluido en este repositorio, estimado a partir del numero de parametros): en torno a 54 GB.
- Cabe en GPU de consumo: si. Las cuantizaciones hasta Q6_K entran en tarjetas de 24 GB (RTX 3090, RTX 4090) y las de Q4 o inferiores en GPUs de 16 GB como la RTX 4080 o la RTX 4070 Ti Super. Las versiones Q2_K y Q3_K_S pueden ejecutarse en GPUs de 12 GB con contexto reducido.
- GPUs recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; dos RTX 4090 o una A100 de 40 GB para Q8_0; A100 80 GB o H100 80 GB para f16.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y text-generation-webui para los ficheros GGUF. Para el modelo base en safetensors, transformers, vLLM o TGI; vLLM admite GGUF de forma experimental.
- Ajuste adicional: hay que sumar a la VRAM el espacio para la cache KV, que crece con la longitud de contexto (no publicada) y con el numero de secuencias concurrentes. Para ejecuciones con contexto largo conviene reservar varios GB adicionales o usar una segunda GPU.
- Latencia y throughput estimados: no disponible en la informacion publicada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada (ni parametros de modelos alternativos, ni resultados de benchmarks propios o de terceros). Como referencia estructural, la unica alternativa documentada es el modelo original Anserwise/AWAXIS-Think-28B, del que este repositorio es una version cuantizada:

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Anserwise/AWAXIS-Think-28B | 26,9 B | safetensors (transformers) | Apache 2.0 | Modelo original, requiere GPU de mayor capacidad |
| mradermacher/AWAXIS-Think-28B-GGUF | 26,9 B | GGUF (12 cuantizaciones) | Apache 2.0 | Cuantizaciones estaticas, orientadas a inferencia local |
| mradermacher/AWAXIS-Think-28B-i1-GGUF | 26,9 B | GGUF (ponderadas con imatrix) | Apache 2.0 | Misma base, calidad superior por tamano segun el autor |

La comparacion con modelos de otras familias (mismo tamano o misma tarea) queda como no disponible al no haberse aportado datos de rendimiento.

## Limitaciones y advertencias

- Alcance del repositorio: no es un modelo original, sino una redistribucion cuantizada. Cualquier problema de calidad, sesgo o alucinacion proviene del modelo base Anserwise/AWAXIS-Think-28B, no del proceso de cuantizacion.
- Perdida de calidad por cuantizacion: las cuantizaciones Q2_K y Q3_K_S reducen notablemente la precision respecto a Q8_0 o f16. El propio autor clasifica Q4_K_S y Q4_K_M como "rapidas y recomendadas" y Q6_K como "muy buena calidad".
- Riesgo de alucinacion: no cuantificado. No hay evaluaciones publicadas de fiabilidad, veracidad ni tasa de alucinacion, por lo que se recomienda validacion humana en aplicaciones criticas.
- Sesgos conocidos: no disponible. No se documenta la composicion del dataset de entrenamiento ni se publican analisis de sesgo. Un ajuste intensivo sobre datos coreanos puede producir un comportamiento desigual entre idiomas, con mejor desempeno en coreano que en chino, japones o ingles.
- Limitaciones de contexto: se desconoce la longitud de contexto nativa y entrenada del modelo, lo que impide planificar despliegues con documentos largos o historiales de conversacion extensos sin pruebas previas.
- Modo de razonamiento: los modelos con thinking suelen generar cadenas de razonamiento largas, lo que incrementa el consumo de tokens de salida, la latencia y el uso de memoria para la cache KV.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se atribuya correctamente. Conviene verificar igualmente las condiciones del modelo base, ya que la model card del repositorio cuantizado no reproduce la del autor original.
- Datos incompletos de procedencia: no se confirma la relacion con la familia Qwen3.5/Qwen3.6 ni el proceso de fusion evolutiva sugerido por las etiquetas; tratarlas como indicios y no como hechos.
- Madurez del repositorio: 391 descargas y 0 likes indican una adopcion muy baja, con poca validacion independiente por parte de la comunidad.
- Idiomas no declarados: no hay garantia de un comportamiento correcto en castellano ni en otras lenguas distintas de ko, en, zh y ja.

## Enlaces

- Repositorio GGUF (cuantizaciones estaticas): https://huggingface.co/mradermacher/AWAXIS-Think-28B-GGUF
- Repositorio de cuantizaciones ponderadas con imatrix: https://huggingface.co/mradermacher/AWAXIS-Think-28B-i1-GGUF
- Modelo base original: https://huggingface.co/Anserwise/AWAXIS-Think-28B
- Pagina de vision general y lista de descargas del cuantizador: https://hf.tst.eu/model#AWAXIS-Think-28B-GGUF
- README de referencia sobre el uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guia sobre tipos de cuantizacion y su impacto (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa que da soporte al cuantizador: https://www.nethype.de/
