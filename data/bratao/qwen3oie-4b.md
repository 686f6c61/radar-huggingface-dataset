# bratao/Qwen3OIE-4B

## Resumen

Qwen3OIE-4B es un modelo de extracción de información abierta (OpenIE) abstractiva para portugués, desarrollado por Bruno Souza Cabral como parte de su tesis doctoral en la Universidade Federal da Bahia. Se trata de un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3-4B, especializado en generar extracciones binarias en formato JSON con los campos ARG0, V y ARG1 (sujeto, verbo y objeto). El modelo produce tripletes de forma abstractiva, es decir, no se limita a extraer fragmentos literales del texto original, sino que genera expresiones sintetizadas.

El modelo resuelve el problema de la extracción de información abierta en portugués, un área con pocos recursos específicos frente al inglés. Su relevancia radica en que ofrece una solución de código abierto (licencia Apache-2.0) con un rendimiento competitivo en la tarea, según los resultados reportados en la evaluación doctoral. Arquitectónicamente es un modelo decoder-only causal con 4.022 millones de parámetros, y el ajuste fino se realizó con una longitud de secuencia de 2.048 tokens, aunque el contexto completo del modelo base no fue validado para esta tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only causal language model (transformer) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens (secuencia de entrenamiento); contexto base no validado para OpenIE |
| Tipos de cuantizacion | No hay cuantizados oficiales en el repositorio; existe conversión GGUF de terceros (mradermacher) |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache-2.0 (con condiciones adicionales del modelo base Qwen) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

Qwen3OIE-4B parte de la arquitectura decoder-only de Qwen3-4B, un transformer causal con atención completa. El ajuste fino se realizó mediante entrenamiento supervisado estándar, sin técnicas de RLHF ni DPO. El corpus de entrenamiento consta de 29.026 frases en portugués y 102.788 extracciones OpenIE sintéticas, generadas a partir de 2.015 párrafos de Wikipedia en portugués utilizando el modelo Gemini 2.5 Flash. Estas extracciones sintéticas se usaron como objetivos de entrenamiento, con una longitud de secuencia de 2.048 tokens. No se declara ningún identificador público de dataset en el repositorio, y el corpus no se distribuye junto con el modelo.

La innovación principal reside en el formato abstractivo: el modelo aprende a generar tripletes completos (ARG0, V, ARG1) que no tienen por qué coincidir literalmente con los spans del texto original, lo que permite una mayor flexibilidad semántica. El entrenamiento se realizó con el template de chat de Qwen3 y con `enable_thinking=False`, desactivando el modo de razonamiento del modelo base.

## Capacidades

- Extracción de información abierta (OpenIE) en portugués: genera tripletes binarios en JSON con los campos ARG0, V y ARG1.
- Generación abstractiva: las extracciones no se limitan a fragmentos literales, sino que pueden ser frases sintetizadas.
- Soporte de conversación mediante el template de chat de Qwen3 (system + user), aunque su uso principal es la extracción directa.
- Integración con la librería `portuguese-openie`, que permite extraer tripletes con una API simple.
- Compatible con el pipeline de transformers (`text-generation`) y con endpoints de inferencia (vLLM, TGI).
- No se documentan capacidades de tool calling, agentes, visión ni audio; es un modelo especializado en una única tarea.

## Casos de uso

- Construcción de grafos de conocimiento: dado un corpus de documentos en portugués, el modelo extrae tripletes (entidad, relación, entidad) que pueden poblarse en una base de conocimiento tipo RDF o Property Graph.
- Análisis de noticias y artículos periodísticos: identificación automática de relaciones entre entidades (personas, organizaciones, lugares) a partir de textos informativos, útil para sistemas de monitorización de medios.
- Enriquecimiento de ontologías: las extracciones abstractivas pueden usarse para proponer nuevas relaciones o instancias en ontologías existentes, reduciendo el trabajo manual de curadores.
- Preprocesamiento para sistemas de pregunta-respuesta: los tripletes extraídos sirven como índice semántico para recuperar información relevante de un corpus en portugués.
- Análisis de documentos legales o administrativos: extracción de relaciones como "el contrato establece", "la ley define", etc., para automatizar tareas de revisión documental.
- Investigación académica en PLN: como modelo de referencia para experimentos de OpenIE en portugués, dado que es uno de los pocos recursos abiertos específicos para este idioma.

## Benchmarks y rendimiento

La evaluación reportada en la tesis doctoral se realizó sobre 100 frases en portugués y 238 extracciones de referencia del conjunto WikiPUD-Portuguese-Abstractive. Las referencias son un estándar de plata (silver standard), generadas con un LLM y revisadas manualmente de forma puntual, no un corpus dorado completamente anotado por humanos. Los resultados son los siguientes:

| Criterio | Precision | Recall | F1 |
|---|---:|---:|---:|
| Coincidencia exacta (perfect match) | 0,3455 | 0,3193 | 0,3319 |
| Coincidencia léxica (lexical match) | 0,5682 | 0,5252 | 0,5459 |

La coincidencia exacta exige que el triplete generado sea idéntico al de referencia; la coincidencia léxica otorga crédito parcial por solapamiento de tokens. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Los pesos en bfloat16 ocupan aproximadamente 8,1 GB. Se recomienda una GPU con entre 10 y 12 GB de VRAM disponible como punto de partida práctico, aunque no es un mínimo garantizado.
- GPU recomendadas: tarjetas con 12 GB o más, como RTX 3060 (12 GB), RTX 4070 (12 GB), RTX 4090 (24 GB), o GPUs de datacenter como A100 (40/80 GB) y H100 (80 GB).
- Es posible ejecutar el modelo en CPU con offload, aunque la latencia será significativamente mayor.
- No se suministran checkpoints cuantizados en el repositorio oficial. Existe una conversión GGUF de terceros (mradermacher/Qwen3OIE-4B-GGUF) que permite usar llama.cpp u Ollama, pero la calidad debe reevaluarse tras la cuantización.
- Opciones de despliegue: transformers (con `device_map="auto"`), vLLM o TGI (el repositorio es compatible con `text-generation-inference` y `endpoints_compatible`), y llama.cpp/Ollama mediante la conversión GGUF.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de OpenIE en portugués en los datos proporcionados. El modelo se posiciona como una alternativa ajustada sobre Qwen3-4B, pero no hay métricas publicadas que lo comparen con otros sistemas como PortNOIE (el marco anterior del mismo autor) u otros modelos multilingües. Se recomienda consultar la tesis doctoral para obtener una comparativa detallada.

## Limitaciones y advertencias

- Los tripletes generados pueden ser incompletos, duplicados, alucinados o malformados; no se garantiza su validez semántica completa.
- La evaluación se basa en solo 100 frases, mayoritariamente de carácter enciclopédico. La generalización a textos conversacionales, dialectales, especializados, largos o adversariales en portugués es desconocida.
- Los campos abstractivos no tienen por qué ser fragmentos literales del texto fuente, lo que puede dificultar la verificación manual.
- Las extracciones no constituyen verificación de hechos; no deben usarse como única fuente para decisiones de alto impacto. Se recomienda mantener el texto original y aplicar controles de confianza o validación aguas abajo.
- La licencia Apache-2.0 del repositorio no exime de cumplir los términos del modelo base Qwen (Qwen/Qwen3-4B) ni las obligaciones relativas a los datos de entrada y salida. El corpus de entrenamiento no se distribuye.
- No se validó el contexto completo del modelo base (superior a 2.048 tokens) para esta tarea; usar secuencias más largas puede degradar el rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/bratao/Qwen3OIE-4B
- Conversión GGUF (terceros): https://huggingface.co/mradermacher/Qwen3OIE-4B-GGUF
- Página de despliegue en FriendliAI: https://friendli.ai/models/bratao/Qwen3OIE-4B
- Tesis doctoral: Cabral, Bruno Souza. *Evolving Open Information Extraction for Portuguese employing Language Models*. Universidade Federal da Bahia, 2025.
- Artículo relacionado: Cabral, Bruno; Souza, Marlo; Claro, Daniela Barreiro. *PortNOIE: A Neural Framework for Open Information Extraction for the Portuguese Language*. PROPOR 2022. DOI: 10.1007/978-3-030-98305-5_23.
