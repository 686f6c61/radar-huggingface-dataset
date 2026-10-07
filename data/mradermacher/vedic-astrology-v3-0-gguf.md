# mradermacher/Vedic-Astrology-v3.0-GGUF

## Resumen

Vedic-Astrology-v3.0-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por el usuario mradermacher a partir del modelo base YOUTUBE5678/Vedic-Astrology-v3.0. No se trata de un modelo entrenado por mradermacher, sino de una conversión a GGUF del modelo original, pensada para ejecución en local mediante llama.cpp y herramientas compatibles. El modelo base parece orientado a conversación sobre astrología védica, a juzgar por su nombre, aunque la model card del repositorio cuantizado no aporta ninguna descripción funcional.

El modelo cuenta con 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), lo que lo sitúa en la gama de modelos pequenos y manejables en hardware de consumo. El repositorio ocupa 27,9 GB en total, pero esto se debe a la suma de todos los archivos de cuantización incluidos; cada archivo individual pesa entre 1,4 GB (Q2_K) y 6,3 GB (f16). El idioma declarado es únicamente inglés.

La relevancia de esta ficha es limitada pero concreta: se trata de un fine-tune especializado en un dominio muy nicho (astrología védica) y cuantizado para despliegue local, lo que permite ejecutarlo en GPUs de gama de entrada o incluso en CPU. No se dispone de información sobre la arquitectura exacta, la longitud de contexto, el dataset de entrenamiento ni la licencia del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se deduce transformer por el uso de transformers y GGUF, sin confirmar) |
| Parametros totales | 3.085.938.688 (aprox. 3,09B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo original YOUTUBE5678/Vedic-Astrology-v3.0. El repositorio cuantizado no incluye config.json, ni detalles de atencion, ni numero de capas, ni dimensiones del modelo. Lo unico deducible es que se trata de un modelo de la libreria transformers convertido a GGUF, lo que en la practica implica casi siempre una arquitectura transformer decoder-only, pero esto no esta confirmado por el autor.

Tampoco hay datos sobre el entrenamiento: se desconoce el numero de tokens utilizados, la composicion del dataset, si hubo fases de ajuste fino supervisado, RLHF o DPO, y si el modelo base subyacente fue entrenado desde cero o es un fine-tune de otro modelo. El repositorio de mradermacher unicamente documenta el proceso de cuantizacion (version 2 de quantize_version, output_tensor_quantised a 1, convert_type hf) y advierte de que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion. No se describe ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, SSM, etc.).

## Capacidades

- Generacion de texto conversacional: el tag "conversational" aparece en el repositorio, lo que indica un uso previsto de dialogo multi-turno.
- Dominio especializado: el nombre del modelo sugiere que esta ajustado para responder sobre astrologia vedica, aunque no hay documentacion que confirme el alcance real.
- Idiomas: unicamente ingles declarado; no hay evidencia de capacidades multilingues.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Razonamiento, codigo y matematicas: no disponibles; sin benchmarks ni declaraciones del autor.

## Casos de uso

- Asistente conversacional de astrologia vedica en local: dado el tamano de 3,09B y las cuantizaciones Q4_K_S y Q4_K_M (1,9-2,0 GB), puede desplegarse en un portatil con GPU integrada o una GPU de gama de entrada para responder consultas sobre cartas astrales en ingles, sin conexion a internet.
- Prototipado rapido de chatbots de nicho: al ser un fine-tune pequeno, sirve como banco de pruebas para evaluar si un modelo de 3B es suficiente para un dominio concreto antes de invertir en modelos mayores.
- Generacion de contenido editorial: redaccion de textos divulgativos o descriptivos sobre astrologia vedica en ingles, con revision humana posterior.
- Despliegue en dispositivos con recursos limitados: con la cuantizacion Q2_K (1,4 GB) puede ejecutarse en CPU mediante llama.cpp en equipos sin GPU dedicada, util para demos offline.
- Base para nuevos ajustes finos: al disponer de pesos GGUF y del modelo base publico en HuggingFace, un desarrollador puede partir de el para un fine-tune adicional en otro dominio relacionado (por ejemplo, astrologia occidental o numerologia).
- Educacion y experimentacion: uso en cursos o talleres sobre cuantizacion GGUF, ya que el repositorio incluye hasta doce variantes de cuantizacion con tamanos y notas de calidad, lo que permite estudiar el compromiso entre tamano y fidelidad.
- Investigacion sobre sesgos en dominios esotericos: analizar como un modelo pequeno especializado reproduce o amplifica creencias y afirmaciones pseudocientificas al ser consultado sobre astrologia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio cuantizado ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion. El autor unicamente menciona un grafico externo de ikawrakow sobre perplejidad relativa entre tipos de cuantizacion, sin valores concretos asociados a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV):
  - Q2_K: 1,4 GB
  - Q3_K_S: 1,6 GB
  - Q3_K_M: 1,7 GB
  - Q3_K_L: 1,8 GB
  - IQ4_XS: 1,9 GB
  - Q4_K_S: 1,9 GB
  - Q4_K_M: 2,0 GB
  - Q5_K_S: 2,3 GB
  - Q5_K_M: 2,3 GB
  - Q6_K: 2,6 GB
  - Q8_0: 3,4 GB
  - f16: 6,3 GB
- A estas cifras hay que sumar el consumo de la cache KV, que depende de la longitud de contexto y del numero de capas; dado que se desconoce la arquitectura, no puede calcularse con precision.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para las cuantizaciones Q4 y Q5 (RTX 3050, RTX 4060, GTX 1660, RTX 2060, etc.). Para Q8_0 se recomiendan 6 GB o mas. La version f16 requiere al menos 8 GB.
- Si cabe en GPU de consumo: si, es uno de los puntos fuertes del modelo. Las cuantizaciones Q4_K_S y Q4_K_M (marcadas como "fast, recommended") caben comodamente en GPUs de 4 GB.
- Tambien puede ejecutarse unicamente en CPU con llama.cpp, especialmente con Q2_K y Q3, aunque la latencia sera mayor.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. El soporte de vLLM para GGUF es experimental. TGI no soporta GGUF de forma nativa.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento del modelo que permitan una comparacion cuantitativa fiable. La siguiente tabla compara unicamente parametros y contexto declarados publicamente por los autores de cada modelo, no resultados de evaluacion. Los datos del modelo objeto de la ficha son los unicos extraidos del repositorio; los de las alternativas son especificaciones publicas de sus respectivos autores y pueden variar segun la version.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Vedic-Astrology-v3.0 (GGUF) | 3,09B | no disponible | no disponible | HuggingFace (mradermacher) |
| Qwen2.5-3B-Instruct | aprox. 3,09B | 32.768 tokens | Apache 2.0 | HuggingFace |
| Llama-3.2-3B-Instruct | aprox. 3,21B | 128.000 tokens | Llama 3.2 Community License | HuggingFace |
| Phi-3.5-mini-instruct | aprox. 3,8B | 128.000 tokens | MIT | HuggingFace |

Nota: el recuento exacto de parametros de Vedic-Astrology-v3.0 (3.085.938.688) coincide con el de la familia Qwen2.5-3B, lo que podria indicar que el modelo base deriva de ella, pero esto no esta confirmado por el autor y debe tratarse como una mera observacion.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card del modelo original accesible en esta informacion, ni detalles sobre entrenamiento, arquitectura o datos utilizados.
- Licencia no especificada: al no declararse licencia, no puede asumirse permiso para uso comercial. Es imprescindible contactar con el autor original (YOUTUBE5678) antes de cualquier despliegue en produccion.
- Riesgo elevado de alucinacion: un modelo de 3B ajustado a un dominio esoterico tiene alta probabilidad de generar afirmaciones inventadas con apariencia de rigor. No debe usarse para asesoramiento real de ningun tipo.
- Idioma: solo ingles declarado. No hay garantia de un rendimiento correcto en castellano ni en otros idiomas.
- Contexto desconocido: al ignorarse la longitud de contexto, no puede planificarse el uso en conversaciones largas ni en tareas de resumen de documentos extensos.
- Popularidad nula: 0 descargas y 0 "likes" en el momento de los datos. No existe validacion por parte de la comunidad, lo que incrementa el riesgo de fallos no documentados.
- Fecha de publicacion inusual: los metadatos indican creacion en octubre de 2026, posterior a la fecha habitual de referencia; conviene verificar la vigencia real del repositorio antes de confiar en el.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_M degradan notablemente la fidelidad; el propio autor etiqueta Q3_K_M como "lower quality" y Q6_K como "very good quality". Para uso serio, se recomienda Q4_K_M o superior.
- Sin cuantizaciones ponderadas/imatrix: el autor indica que no estan disponibles, por lo que la perdida de calidad respecto al modelo original puede ser mayor de lo habitual en las cuantizaciones pequenas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Vedic-Astrology-v3.0-GGUF
- Modelo base: https://huggingface.co/YOUTUBE5678/Vedic-Astrology-v3.0
- Pagina de descargas del autor: https://hf.tst.eu/model#Vedic-Astrology-v3.0-GGUF
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Sitio del patrocinador (nethype GmbH): https://www.nethype.de/
