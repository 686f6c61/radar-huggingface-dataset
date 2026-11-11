# nace-ai/Qwen3.5-9B-GGUF

## Resumen

Qwen3.5-9B-GGUF es la distribución en formato GGUF del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario nace-ai. El modelo base lo desarrolla el equipo Qwen de Alibaba y pertenece a la familia Qwen3.5, con 9.197.093.888 parámetros totales (aproximadamente 9,2 mil millones). La pipeline declarada es image-text-to-text, lo que indica que el modelo acepta entradas de imagen y texto y genera texto, aunque la model card no detalla la arquitectura interna ni la longitud de contexto.

El repositorio no contiene pesos nuevos ni un modelo entrenado desde cero: es una conversión a cuantizaciones GGUF pensada para ejecutarse con Kapitsa, el motor de inferencia local de Nace.AI para Macs con Apple Silicon. Incluye cuantizaciones Q2_K, Q3_K_M, Q4_K_M y Q8_0, además del proyector de visión (mmproj) en bf16 y la matriz de importancia (imatrix) empleada en la generación de las cuantizaciones de 2, 3 y 4 bits.

Su relevancia práctica reside en que permite ejecutar un modelo multimodal de 9,2 mil millones de parámetros en hardware de consumo Apple Silicon con pérdida de calidad medida y documentada: la cuantización Q4_K_M con importance matrix mantiene un KL de 0,023 frente a bf16 y un 95,0% de coincidencia en el token superior, lo que la hace adecuada para prototipado local y despliegues sin GPU dedicada. La licencia Apache 2.0 del modelo base se hereda en esta distribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; arquitectura interna no detallada en la informacion proporcionada) |
| Parametros totales | 9.197.093.888 (9,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q8_0; proyector de vision en bf16; matriz de importancia en GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada del modelo base Qwen/Qwen3.5-9B) |
| Formato de pesos | GGUF (safetensors en el modelo base; el repo GGUF ocupa 25,2 GB) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Qwen/Qwen3.5-9B: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de capas, dimensiones ocultas o cabezas de atencion. La pipeline image-text-to-text y la presencia de un proyector de vision (mmproj-bf16.gguf, 0,9 GB) confirman que el modelo incorpora un codificador visual y un adaptador que proyecta las representaciones de imagen al espacio del modelo de lenguaje, pero no se aportan detalles sobre el codificador ni sobre el mecanismo de fusion multimodal.

Tampoco se documentan los datos de entrenamiento: no hay informacion sobre el numero de tokens, la composicion del corpus, el uso de RLHF, DPO u otras tecnicas de alineacion, ni sobre innovaciones como decodificacion especulativa o atencion lineal. Lo que si esta documentado es el proceso de cuantizacion: las variantes Q2_K, Q3_K_M y Q4_K_M se generaron con una importance matrix (imatrix.gguf), una tecnica que pondera la importancia de cada peso segun su impacto en la salida y que, segun la model card, produce en Q4_K_M un archivo del mismo tamano (5,78 GB) pero mas cercano al modelo original que la cuantizacion sin imatrix. Las mediciones se realizaron con llama.cpp en el commit 0a94a3f2 (11 de noviembre de 2026), calculando KL sobre 64 fragmentos de 512 tokens de wikitext-2, conversaciones GSM8K y HumanEval, y evaluando GSM8K con 100 preguntas a traves de llama-server.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" y el uso previsto con Kapitsa indican soporte de dialogos multi-turno.
- Procesamiento de imagen y texto (image-text-to-text): el proyector de vision mmproj-bf16 permite pasar imagenes junto con prompts de texto y obtener respuestas generadas.
- Razonamiento matematico: la evaluacion GSM8K sobre 100 preguntas (0,95 con Q4_K_M con imatrix) confirma capacidad de resolucion de problemas aritmeticos de varios pasos.
- Generacion de codigo: la evaluacion KL incluye fragmentos de HumanEval, lo que sugiere uso previsto en tareas de programacion, aunque no se publican resultados de HumanEval.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que el formato puede servirse a traves de APIs compatibles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se listan idiomas soportados.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en Mac: con la cuantizacion Q4_K_M (5,78 GB) y Kapitsa, se puede desplegar un chatbot en un Mac con Apple Silicon sin GPU dedicada, sirviendo chat y API en http://127.0.0.1:8000 mediante `kapitsa serve --model`.
- Analisis de imagenes en local: gracias al proyector de vision mmproj-bf16, el modelo puede recibir capturas de pantalla, fotografias o diagramas junto a una pregunta y generar descripciones o respuestas, sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado rapido de aplicaciones multimodales: el formato GGUF y la compatibilidad con llama.cpp permiten integrar el modelo en pipelines de prueba con pocos recursos antes de pasar a un despliegue mayor.
- Evaluacion de calidad de cuantizaciones: el repositorio incluye metricas de KL y GSM8K para Q4_K_M, lo que permite a un equipo decidir con datos si la perdida de calidad es aceptable para su caso de uso frente a bf16.
- Educacion e investigacion: un modelo de 9,2 mil millones de parametros con vision ejecutable en hardware de consumo es util para experimentos docentes de inferencia cuantizada y evaluacion de degradacion por cuantizacion.
- Procesamiento de documentos con imagenes: extraccion de informacion de formularios, facturas o graficos escaneados mediante la combinacion de entrada visual y generacion de texto, en un flujo local.
- Desarrollo de asistentes de codigo en local: aunque no se publican resultados de HumanEval, la inclusion de fragmentos de HumanEval en la evaluacion KL sugiere uso en tareas de programacion; con Q4_K_M (0,95 en GSM8K) puede emplearse como ayuda de codigo en entornos sin conectividad.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a la cuantizacion Q4_K_M frente a bf16, medidos por el autor con llama.cpp:

| Metrica | Q4_K_M sin imatrix | Q4_K_M con imatrix (este repo) |
|---|---:|---:|
| KL respecto a bf16 (menor es mejor) | 0,045 | 0,023 |
| Coincidencia en el token superior con bf16 | 92,5% | 95,0% |
| GSM8K (100 preguntas) | 0,93 | 0,95 |

Metodologia declarada: KL calculado sobre 64 fragmentos de 512 tokens (wikitext-2, conversaciones GSM8K y HumanEval) contra los logits del GGUF bf16; GSM8K con 100 preguntas de test a traves de llama-server, de modo que una pregunta vale un punto; herramienta llama.cpp commit 0a94a3f2, 11 de noviembre de 2026. Solo se midio Q4_K_M. No se han publicado resultados de benchmarks del modelo base (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: Q2_K 3,9 GB; Q3_K_M 4,7 GB; Q4_K_M 5,8 GB; Q8_0 9,8 GB; ademas, 0,9 GB para el proyector de vision mmproj-bf16 si se usa entrada de imagen.
- GPU recomendadas: el motor objetivo es Kapitsa sobre Apple Silicon (Macs con chip M-series); no se documentan GPU NVIDIA o AMD en la informacion proporcionada.
- Cabe en GPU de consumo: si, en Macs con Apple Silicon con memoria unificada suficiente; Q4_K_M (5,78 GB) es viable en configuraciones de 16 GB o mas, y Q2_K (3,9 GB) en configuraciones de 8 GB.
- Opciones de despliegue: Kapitsa (`brew install nace-ai/tap/kapitsa` y `kapitsa serve --model /path/to/file.gguf`); el formato GGUF es compatible con llama.cpp (usado para las mediciones) y, por extension, con otros runners GGUF, aunque solo Kapitsa y llama-server se mencionan explicitamente.
- Latencia y throughput: no disponible; no se publican mediciones de velocidad de generacion ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| nace-ai/Qwen3.5-9B-GGUF | 9,2 mil millones | no disponible | GGUF (Q2_K a Q8_0) | Apache 2.0 | Cuantizacion con imatrix; motor Kapitsa para Apple Silicon; vision via mmproj |
| Qwen/Qwen3.5-9B (base) | 9,2 mil millones | no disponible | safetensors | Apache 2.0 | Modelo original multimodal; sin cuantizar |
| nace-ai/Qwen3.5-9B-MLX-4bit-KQuant | 9,2 mil millones | no disponible | MLX 4-bit KQuant | Apache 2.0 | Misma familia, formato MLX para Apple Silicon |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (mismo tamano o misma tarea) en la documentacion proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- Solo se ha medido la calidad de Q4_K_M; Q2_K, Q3_K_M y Q8_0 no tienen metricas publicadas, por lo que su degradacion es desconocida.
- La cuantizacion introduce perdida de calidad: incluso Q4_K_M con imatrix tiene un KL de 0,023 frente a bf16 y un 5% de discrepancias en el token superior, lo que puede afectar a tareas sensibles a la precision.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni limitaciones de contexto o idioma; la ausencia de esta informacion no implica que no existan.
- El modelo esta pensado para Kapitsa en Apple Silicon; el rendimiento en otros backends GGUF no esta verificado por el autor.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y conviene revisar los terminos de Qwen/Qwen3.5-9B por si hubiera condiciones adicionales no reflejadas en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 10 de noviembre de 2026, por lo que carece de validacion comunitaria.
- No se dispone de informacion sobre tool calling, agentes, modo thinking ni capacidades multilingues, lo que limita su uso en pipelines que dependan de estas funciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nace-ai/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Version MLX 4-bit: https://huggingface.co/nace-ai/Qwen3.5-9B-MLX-4bit-KQuant
- Motor Kapitsa (GitHub): https://github.com/nace-ai/kapitsa
- Nace.AI: https://www.nace.ai/
