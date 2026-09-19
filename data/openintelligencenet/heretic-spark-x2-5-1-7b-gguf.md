# OpenIntelligenceNet/Heretic-Spark-X2.5-1.7B-GGUF

## Resumen

Heretic-Spark-X2.5-1.7B-GGUF es un repositorio de pesos cuantizados en formato GGUF del modelo Spark-X2.5 1.7B, publicado por el usuario OpenIntelligenceNet en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una distribucion de cuantizaciones (FP16 y Q4_K_M) de una arquitectura de ~1.700 millones de parametros que el autor describe como "uncensored", es decir, sin las restricciones de alineacion habituales, orientada a respuestas directas en consultas creativas, de razonamiento y de rol conversacional.

El repositorio tiene un tamano de 4,5 GB e incluye dos ficheros: una version sin comprimir en precision de 16 bits y una cuantizacion de 4 bits calibrada con una Importance Matrix (imatrix) propia, generada a partir de mas de 2,14 millones de tokens de trazas de razonamiento profundo, matematicas avanzadas, logica de instrucciones sin censura y roleplay conversacional. Esa calibracion es el principal argumento tecnico del autor para justificar la fidelidad de la version de 4 bits.

Su relevancia practica es limitada pero concreta: se trata de un modelo de 1,7B ejecutable en hardware de consumo, con una cuantizacion pensada para minimizar la perdida de calidad en tareas de razonamiento. Sin embargo, carece de model card completa: no declara licencia, idiomas, pipeline ni arquitectura base, y no tiene descargas ni valoraciones que permitan validarlo. La fecha de creacion declarada (19 de septiembre de 2026) es posterior a la fecha actual, lo que constituye una inconsistencia de metadatos que conviene tener en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor solo indica "arquitectura Spark-X2.5"; no especifica transformer, MoE ni hibrida) |
| Parametros totales | 1.707.657.216 (~1,7B) |
| Parametros activos | no aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (sin comprimir) y Q4_K_M calibrada con imatrix |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (dos ficheros: `Spark-1.7B-F16.gguf` y `Spark-1.7B-Q4_K_M-Imatrix.gguf`) |
| Tamano del repositorio | 4,5 GB |
| Fecha de publicacion | 19 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. El autor se limita a mencionar la "arquitectura Spark-X2.5 1.7B" y a describir el proceso de cuantizacion, sin especificar si se trata de un transformer denso, un modelo con atencion lineal, una mezcla de expertos o cualquier otra variante. Tampoco se documenta el numero de tokens de preentrenamiento, la composicion del dataset original ni si hubo etapas de ajuste fino mediante RLHF, DPO u otras tecnicas de alineacion. Lo unico deducible es que el modelo ha sido sometido a un proceso de "desalineacion" (de ahi el nombre "Heretic") que elimina o relaja los filtros de seguridad tipicos.

El detalle tecnico mas relevante que si se documenta es la calibracion de la cuantizacion Q4_K_M mediante una Importance Matrix. El autor indica que la matriz se genero con mas de 2,14 millones de tokens distribuidos entre trazas de razonamiento profundo, matematicas avanzadas, logica de instrucciones sin censura y roleplay conversacional. El objetivo declarado es preservar la integridad estructural y la fidelidad de razonamiento en 4 bits, que es el punto donde las cuantizaciones agresivas suelen degradar con mas claridad las capacidades de cadena de pensamiento. No se aportan metricas de perplejidad ni comparaciones antes/despues de la cuantizacion que permitan verificar esa afirmacion.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, segun la etiqueta `conversational` del repositorio.
- Razonamiento explicito: el autor enfatiza las capacidades de razonamiento y menciona trazas de razonamiento profundo en la calibracion de la imatrix, aunque no documenta un modo "thinking" separado ni tokens de control especificos.
- Matematicas: las trazas usadas para calibrar la cuantizacion incluyen matematicas avanzadas, lo que sugiere soporte para problemas de ese ambito, sin datos de precision verificables.
- Roleplay y escritura creativa sin restricciones tematicas, derivado del caracter "uncensored" del modelo.
- Respuestas sin filtros de alineacion en consultas que otros modelos rechazarian por politica de seguridad.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que indica que puede servirse detras de una API compatible con el esquema habitual de inferencia.
- Tool calling / function calling: no disponible (no se documenta soporte).
- Capacidades de agente y razonamiento multi-paso: no disponible (no se documenta de forma explicita).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Inferencia local en equipos modestos: con la cuantizacion Q4_K_M el modelo ocupa del orden de 1,1-1,2 GB de pesos, por lo que puede ejecutarse en un portatil sin GPU dedicada mediante llama.cpp u Ollama, algo adecuado para prototipado y pruebas offline.
- Asistente conversacional personal autoalojado: al ser un modelo pequeno y compatible con endpoints, puede desplegarse como backend de un chat privado donde el usuario controla los datos y las politicas de contenido.
- Generacion de texto creativo y narrativa: el ajuste orientado a roleplay y la ausencia de filtros lo hacen utilizable para ficcion, guiones y dialogos con tematicas que otros modelos alineados rechazan.
- Experimentacion en investigacion sobre desalineacion: sirve como caso de estudio de un modelo deliberadamente sin restricciones, util para analizar como cambia el comportamiento respecto a su base alineada.
- Evaluacion de tecnicas de cuantizacion con imatrix: la publicacion de FP16 y Q4_K_M del mismo modelo permite comparar la degradacion introducida por la cuantizacion de 4 bits en tareas de razonamiento.
- Pruebas de razonamiento matematico de baja complejidad: dado que la calibracion incluyo matematicas, puede emplearse como baseline en prototipos de resolucion de problemas aritmeticos y algebraicos simples, siempre con validacion humana.
- Educacion y demostraciones de IA generativa: su reducido tamano permite desplegarlo en aulas o talleres con hardware comun para ilustrar el funcionamiento de un LLM y el efecto de las cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no ha devuelto documentacion tecnica asociada (unicamente resultados irrelevantes de YouTube).

## Requisitos de hardware

- VRAM estimada para la cuantizacion Q4_K_M: del orden de 1,1-1,3 GB solo para los pesos; con ventana de contexto y cache KV hay que anadir memoria adicional segun la longitud de contexto configurada, que no esta documentada.
- VRAM estimada para FP16: del orden de 3,4 GB solo para los pesos, mas cache KV y overhead del runtime.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM para FP16; para Q4_K_M basta con 2 GB. Ejemplos razonables: RTX 3060, RTX 4060, RTX 4090, A100 o H100 (estas dos ultimas muy sobredimensionadas para un modelo de este tamano).
- Compatibilidad con GPU de consumo: si, es uno de los puntos fuertes del modelo. Cabe incluso en GPUs de gama de entrada e integradas con memoria compartida, aunque con menor throughput.
- Despliegue en CPU: viable gracias al formato GGUF, con llama.cpp, Ollama o LM Studio.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. vLLM y TGI tienen soporte de GGUF limitado o experimental, por lo que conviene verificar la version antes de usarlos en produccion.
- Latencia y throughput estimados: no disponible. No se aportan mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

Los datos de la columna "este modelo" proceden del repositorio analizado. Los de las alternativas se toman, a modo orientativo, de sus model cards publicas y deben verificarse en la fuente original antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Heretic-Spark-X2.5-1.7B-GGUF | ~1,7B | no disponible | no disponible | GGUF (FP16, Q4_K_M) | Sin benchmarks, sin idiomas declarados, orientado a uso sin censura |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (segun model card publica) | Apache 2.0 | safetensors, GGUF y otras | Modelo alineado, con benchmarks publicados y amplio soporte de tooling |
| SmolLM2-1.7B-Instruct | ~1,7B | 8.192 tokens (segun model card publica) | Apache 2.0 | safetensors y GGUF | Alternativa abierta de tamano casi identico, con documentacion completa |
| Gemma 2 2B | ~2,6B | 8.192 tokens (segun model card publica) | Terminos de uso de Gemma | safetensors y GGUF | Mayor tamano y mejor rendimiento general esperado, con licencia con condiciones |

La diferencia principal frente a las alternativas no es de rendimiento, sino de trazabilidad: los tres modelos comparados publican licencia, contexto, idiomas y evaluaciones, mientras que Heretic-Spark X2.5 no aporta ninguno de esos datos.

## Limitaciones y advertencias

- Ausencia total de licencia: al no declararse, no puede asumirse permiso de uso comercial. En ausencia de licencia explicita, los derechos quedan reservados por defecto y el uso en produccion es juridicamente arriesgado.
- Modelo sin censura: al haberse eliminado las restricciones de alineacion, puede generar contenido ofensivo, peligroso, ilegal o factualmente erroneo sin advertencia. No es apto para aplicaciones orientadas al publico general sin una capa de moderacion externa.
- Riesgo elevado de alucinacion: con 1,7B de parametros, la capacidad de mantener coherencia factual en cadenas largas es limitada; este riesgo se acentua en un modelo sin alineacion que puede afirmar con seguridad informacion falsa.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, raza, religion u orientacion politica.
- Idiomas no declarados: se desconoce si el modelo funciona correctamente en castellano o en otros idiomas distintos del ingles; la calibracion imatrix se describe en terminos genericos sin especificar el idioma de los tokens.
- Contexto desconocido: no se indica la longitud de ventana, lo que impide planificar casos de uso que dependan de contexto largo y dificulta dimensionar la cache KV.
- Sin benchmarks ni validacion externa: no hay metricas publicadas y el repositorio tiene 0 descargas y 0 likes, por lo que no existe evidencia de la comunidad sobre su comportamiento real.
- Metadatos inconsistentes: la fecha de creacion declarada (2026) es posterior a la actual, y el repositorio mezcla el nombre "Heretic" con la arquitectura "Spark-X2.5" sin aclarar la relacion con el modelo base original.
- Compatibilidad de serving: aunque la etiqueta indique compatibilidad con endpoints, el formato GGUF no es el nativo de vLLM o TGI, lo que puede limitar el rendimiento en despliegues de alta concurrencia.
- Uso responsable: cualquier despliegue deberia incorporar filtros de salida propios, registro de conversaciones y evaluacion humana, dado que el modelo no incorpora ninguna salvaguarda.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OpenIntelligenceNet/Heretic-Spark-X2.5-1.7B-GGUF
- Ficheros del repositorio: `Spark-1.7B-F16.gguf` y `Spark-1.7B-Q4_K_M-Imatrix.gguf` (disponibles en la pestana "Files" del repositorio)
- Paper, blog tecnico, repositorio de codigo o demo: no disponible
- Modelo base Spark-X2.5 1.7B: no disponible (no se enlaza en la model card)
