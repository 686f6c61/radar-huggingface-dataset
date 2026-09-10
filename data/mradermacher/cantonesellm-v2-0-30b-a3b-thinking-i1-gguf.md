# mradermacher/CantoneseLLM-v2.0-30B-A3B-Thinking-i1-GGUF

## Resumen

CantoneseLLM-v2.0-30B-A3B-Thinking-i1-GGUF es la version cuantizada en formato GGUF del modelo hon9kon9ize/CantoneseLLM-v2.0-30B-A3B-Thinking, un modelo de lenguaje especializado en cantonés (yue) con capacidad de razonamiento explicito. La cuantizacion la ha realizado el usuario mradermacher, conocido por publicar versiones comprimidas de modelos abiertos para su uso en hardware de consumo. El repositorio incluye cuantizaciones con imatrix (i1), un tipo de cuantizacion que preserva mejor la perplejidad que las estaticas para un mismo tamano.

El modelo base es un transformer de mezcla de expertos (MoE) con 30.532.122.624 parametros totales (aproximadamente 30,5 mil millones) y un patron de nomenclatura "30B-A3B" que indica en torno a 3 mil millones de parametros activos por token. Esta disenado para tareas de conversacion y razonamiento en cantonés, chino mandarin e ingles, con soporte de modo "thinking" (razonamiento paso a paso) y un entrenamiento que, segun las etiquetas del autor, ha empleado GRPO y RLVR (refuerzo con recompensa verificable).

La relevancia de esta ficha radica en que el modelo original esta orientado a un idioma historicamente poco cubierto por los grandes modelos abiertos, y esta version GGUF permite ejecutarlo en estaciones de trabajo y equipos con GPU de consumo mediante llama.cpp u Ollama. El repositorio ocupa 139,1 GB en total por incluir multiples niveles de cuantizacion, aunque cada archivo individual pesa bastante menos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE) |
| Parametros totales | 30.532.122.624 (aproximadamente 30,5 mil millones) |
| Parametros activos | aproximadamente 3 mil millones (segun nomenclatura A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_M, IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, small-IQ4_NL, Q4_K_S, Q4_K_M, Q4_0, Q4_1, Q5_K_S, Q5_K_M, Q6_K (formato i1 con imatrix) |
| Idiomas soportados | yue (cantonés), zh (chino), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura de mezcla de expertos (MoE), tal y como indican las etiquetas del repositorio y el propio patron de nomenclatura "30B-A3B". Esto implica que, aunque el modelo almacena unos 30,5 mil millones de parametros, solo activa una fraccion de ellos (en torno a 3 mil millones) por cada token generado, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. La cuantizacion i1 de mradermacher se ha generado con un fichero imatrix, que ajusta el proceso de compresion para minimizar la perdida de calidad en las activaciones mas relevantes.

Segun las etiquetas del autor del modelo base, el entrenamiento ha incorporado tecnicas de aprendizaje por refuerzo: GRPO (Group Relative Policy Optimization) y RLVR (Reinforcement Learning with Verifiable Rewards), orientadas a mejorar la capacidad de razonamiento. El sufijo "Thinking" indica que el modelo soporta un modo de razonamiento explicito, en el que genera una cadena de pensamiento antes de la respuesta final. No se dispone de informacion detallada sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset ni el uso de DPO o RLHF adicional.

## Capacidades

- Generacion de texto conversacional en cantonés (yue), chino mandarin (zh) e ingles (en).
- Razonamiento explicito en modo "thinking", con generacion de pasos intermedios antes de la respuesta.
- Razonamiento matematico y logico, reforzado mediante GRPO y RLVR durante el entrenamiento.
- Comprension y generacion de texto en un idioma minoritario (cantonés) con vocabulario y expresiones propias de Hong Kong.
- Capacidad multilingue limitada a los tres idiomas declarados; no se ha documentado soporte para otros.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita, aunque el modo thinking es compatible con cadenas de razonamiento.
- Capacidades de vision o audio: no disponibles.
- Formato conversacional (etiqueta "conversational"), apto para dialogos multi-turno.

## Casos de uso

- Atencion al cliente en cantonés: el modelo puede gestionar conversaciones multi-turno con usuarios de Hong Kong en su idioma nativo, un escenario donde la mayoria de modelos abiertos tienen un rendimiento pobre por falta de datos de entrenamiento en yue.
- Traduccion cantonés-chino-ingles: util como motor de traduccion en pipelines internos, especialmente para variantes coloquiales del cantonés que los modelos genericos suelen normalizar incorrectamente.
- Asistentes de razonamiento para educacion: el modo thinking permite mostrar el proceso de resolucion de problemas matematicos o logicos, aprovechable en herramientas de tutorizacion en chino o ingles.
- Generacion de contenido localizado para Hong Kong: redaccion de textos de marketing, resenas o documentacion adaptados al registro linguistico cantonés.
- Investigacion linguistica sobre yue: el modelo puede emplearse para generar corpus sinteticos, analizar variaciones dialectales o asistir en anotacion linguistica con supervision humana.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones i1 desde 11,4 GB, puede ejecutarse en portatiles o estaciones con GPU de consumo para prototipado y demos locales.
- Chatbot de soporte interno en empresas con operaciones en Hong Kong: integrable mediante llama.cpp u Ollama en infraestructura on-premise, evitando enviar datos a APIs externas.
- Preprocesado y resumen de documentos en cantonés: sintesis de actas, correos o articulos escritos en yue coloquial, tarea poco cubierta por modelos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (tamanos de fichero publicados): i1-Q2_K, 11,4 GB; i1-IQ3_XXS, 11,9 GB; i1-IQ3_M, 13,6 GB; i1-Q3_K_M, 14,8 GB; i1-Q4_K_S, 17,6 GB. Las cuantizaciones superiores (Q4_K_M, Q5_K_M, Q6_K) no tienen tamano publicado en la informacion disponible, pero seran mayores.
- GPU de consumo compatibles: para Q2_K e IQ3_XXS basta una GPU con 12 GB de VRAM (RTX 3060 12 GB, RTX 4070). Para IQ3_M y Q3_K_M se recomienda 16 GB (RTX 4060 Ti 16 GB, RTX 4080). Para Q4_K_S se necesitan 24 GB (RTX 3090, RTX 4090) o descarga parcial a CPU mediante mmap.
- GPU de centro de datos: A100 (40/80 GB), H100 (80 GB) o L40S permiten cargar cualquier cuantizacion completa y dejar margen para contexto largo o batching.
- Al ser un modelo MoE con en torno a 3 mil millones de parametros activos, la velocidad de generacion sera notablemente superior a la de un modelo denso de 30B en el mismo hardware, aunque la memoria necesaria sigue siendo la del total de parametros.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF. Tambien puede desplegarse con vLLM si se usa el modelo base en safetensors en lugar de la version GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- El fichero imatrix incluido (0,2 GB) permite generar cuantizaciones personalizadas si se necesita un equilibrio distinto entre tamano y calidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| CantoneseLLM-v2.0-30B-A3B-Thinking-i1-GGUF (este) | 30,5 mil millones (aprox. 3 mil millones activos) | no disponible | GGUF i1 con imatrix | Apache 2.0 | Cuantizacion optimizada con imatrix por mradermacher |
| CantoneseLLM-v2.0-30B-A3B-Thinking (base) | 30,5 mil millones | no disponible | safetensors | Apache 2.0 | Modelo original en precision completa |
| CantoneseLLM-v2.0-30B-A3B-Thinking-GGUF | 30,5 mil millones | no disponible | GGUF estatico | Apache 2.0 | Cuantizaciones sin imatrix del mismo autor |

No se dispone de datos de rendimiento ni de contexto para comparar con otros modelos de la misma categoria (por ejemplo, alternativas de razonamiento en chino o especializadas en cantonés). Cualquier comparacion cuantitativa requeriria benchmarks que no se han publicado en la informacion disponible.

## Limitaciones y advertencias

- El entrenamiento esta centrado en tres idiomas (yue, zh, en); fuera de ellos el rendimiento sera bajo y no esta garantizado.
- No hay datos publicados de evaluacion, por lo que se desconoce el grado real de alucinacion y su comportamiento frente a modelos de referencia.
- Al ser un modelo especializado en cantonés, puede presentar sesgos derivados de la composicion del corpus de Hong Kong (terminologia, registro, temas), no documentados por el autor.
- El modo "thinking" incrementa el consumo de tokens y la latencia; en produccion conviene evaluar si se activa o no segun el caso de uso.
- No se dispone de informacion sobre longitud de contexto, lo que dificulta planificar despliegues con documentos largos o conversaciones extensas.
- La licencia Apache 2.0 permite uso comercial, pero se aplica al modelo base; conviene revisar tambien las condiciones de los datos de entrenamiento originales, no detalladas en la informacion disponible.
- Las cuantizaciones de menor tamano (Q2_K, IQ2, IQ1) degradan la calidad de forma notable; para uso en produccion se recomienda al menos IQ3_M o Q4_K_S.
- Las etiquetas del autor indican que el modelo podria no incluir plantilla de chat documentada; es necesario verificar el formato de prompt correcto en el repositorio base antes de integrarlo.
- Los resultados de busqueda web facilitados no contienen informacion relevante sobre el modelo, por lo que no aportan datos verificables.

## Enlaces

- Repositorio GGUF i1 (esta version): https://huggingface.co/mradermacher/CantoneseLLM-v2.0-30B-A3B-Thinking-i1-GGUF
- Repositorio GGUF estatico del mismo autor: https://huggingface.co/mradermacher/CantoneseLLM-v2.0-30B-A3B-Thinking-GGUF
- Modelo base (author original): https://huggingface.co/hon9kon9ize/CantoneseLLM-v2.0-30B-A3B-Thinking
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#CantoneseLLM-v2.0-30B-A3B-Thinking-i1-GGUF
- Guia general de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
