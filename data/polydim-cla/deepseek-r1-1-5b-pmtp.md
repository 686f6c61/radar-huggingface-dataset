# polydim-cla/deepseek-r1-1.5b-pmtp

## Resumen

deepseek-r1-1.5b-pmtp es un modelo de 1,5 mil millones de parámetros publicado por polydim-cla y atribuido a Ariel García Traba (Independent Research / POLYDIM-EINSOF Research Initiative). Se construye sobre `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`, un transformer decoder-only denso destilado de DeepSeek-R1, e incorpora un adaptador geométrico PMTP descrito como una variedad de Stiefel St(1536,1536) sobre S^1535 inyectada en la capa 14. El repositorio ocupa 0,1 GB y la licencia es Apache 2.0.

El objetivo declarado es explorar adaptación continua y comunicación entre procesos mediante `PmtpShmBus`, con «zero-worm IPC» y 0 tokens de texto serializados. No es un modelo generalista validado: no hay benchmarks, datos de entrenamiento ni evaluación independiente en la información disponible. Su interés actual es experimental, para investigadores que quieran reproducir o auditar adaptadores geométricos sobre modelos de razonamiento pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, derivado de DeepSeek-R1-Distill-Qwen-1.5B; adaptador PMTP inyectado en la capa 14 (Stiefel St(1536,1536) sobre S^1535) |
| Parámetros totales | 1,5 mil millones (modelo base); el adaptador PMTP se publica aparte en un repo de 0,1 GB |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repo contiene safetensors y no documenta variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; no se declaran idiomas en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; posible adaptador, no pesos completos del base (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de 1,5B, destilado de DeepSeek-R1 sobre Qwen2.5-1.5B. Sobre él, el autor inyecta un adaptador PMTP en la capa 14 con dimensión 1536→1536 y una variedad de Stiefel St(1536,1536) sobre S^1535. Reporta un defecto de Frobenius de 5,617e-14 medido con acumulador Neumaier en FP64. También describe un bus IPC específico, `PmtpShmBus`, para intercambio directo de tensores sin serializar texto.

No se dispone de información sobre tokens de entrenamiento, composición del dataset, uso de RLHF/DPO, hiperparámetros ni procedimiento de fusión del adaptador. La model card no incluye receta de entrenamiento ni evaluación. Cualquier afirmación sobre ganancias de razonamiento respecto al base queda sin verificar.

## Capacidades

- Generación de texto y razonamiento paso a paso heredados del base DeepSeek-R1-Distill-Qwen-1.5B; no evaluado en este adaptador.
- Matemáticas y código: el base está orientado a razonamiento; el adaptador no documenta mejoras cuantificadas.
- Tool calling / function calling: no documentado; el base no se presenta como modelo de herramientas.
- Agentes y razonamiento multi-paso: puede generar cadenas de razonamiento; no hay soporte de agentes ni orquestación documentado.
- Capacidades multilingües: no disponibles; no se declaran idiomas.
- Capacidad especial: adaptador geométrico PMTP en la capa 14; IPC de tensores vía `PmtpShmBus` con 0 tokens de texto serializados, según el autor.
- No se documentan visión, audio ni un modo «thinking» explícito más allá del razonamiento del base.

## Casos de uso

- Reproducción de investigación geométrica: cargar el modelo base y el adaptador, verificar el defecto de Frobenius reportado y comparar el comportamiento de la capa 14 frente al base. Es adecuado por su enfoque experimental y su licencia permisiva.
- Auditoría de adaptadores: medir si PMTP altera perplejidad, estabilidad numérica o razonamiento en un conjunto de prompts controlado. Requiere construir un harness propio, ya que no hay evaluación publicada.
- Prototipos de razonamiento local: usar el modelo de 1,5B para generar cadenas de razonamiento en matemáticas simples y tareas lógicas, con validación humana. Cabe en GPU consumer y el coste de inferencia es bajo.
- Generación de código en local: integrarlo en una CLI o extensión de IDE para autocompletar y explicar fragmentos, revisando siempre la salida. La licencia Apache 2.0 facilita pruebas comerciales.
- Tutoría educativa: generar explicaciones paso a paso de problemas de matemáticas o ciencias, con supervisión docente. El tamaño reducido permite desplegarlo en entornos con pocos recursos.
- Experimentos de IPC zero-copy: emplear `PmtpShmBus` para pasar tensores entre procesos y medir latencia, serialización y estabilidad. Es un caso de investigación, no de producción.
- Evaluación de robustez y sesgos: comparar base y adaptador con prompts multilingües y dominios diversos, siempre que se valide primero la ventana de contexto y los idiomas del base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, evaluaciones de razonamiento ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1,5B, los pesos del base en FP16/bf16 ocupan aproximadamente 3 GB; en 4 bits, alrededor de 1 GB. El adaptador PMTP añade una cantidad no especificada (repo de 0,1 GB).
- GPU recomendadas: RTX 3060 de 6 GB, RTX 4060 Ti de 8 GB o RTX 4090 de 24 GB para lotes; A100/H100 para servicio con concurrencia.
- Cabe en GPU consumer: sí, especialmente el base en 4 bits o FP16 en GPUs de 6-8 GB. El adaptador requiere cargar el código del repositorio POLYDIM.
- Opciones de despliegue: `transformers` junto con el código POLYDIM; vLLM o TGI si se fusiona el adaptador y se valida su compatibilidad. No hay GGUF del adaptador para llama.cpp u Ollama; el tag `deepseek-r1:1.5b` de Ollama no incluye PMTP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| deepseek-r1-1.5b-pmtp | 1,5B + adaptador | no disponible | Apache 2.0 | HuggingFace, 0 descargas y 0 likes | sin benchmarks |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5B | no disponible en esta ficha | Apache 2.0 | HuggingFace oficial | sin datos en esta ficha |
| Qwen2.5-1.5B | 1,5B | no disponible en esta ficha | Apache 2.0 | HuggingFace oficial | sin datos en esta ficha |
| Llama 3.2 1B | aproximadamente 1,2B | no disponible en esta ficha | Llama 3.2 Community License | Meta/HuggingFace | sin datos en esta ficha |

No hay datos comparativos publicados; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No hay benchmarks, evaluación independiente ni datos de entrenamiento publicados.
- El repositorio ocupa 0,1 GB, lo que sugiere que contiene solo el adaptador y no los pesos completos del base; esto no está confirmado.
- Las afirmaciones sobre «zero-worm IPC» y «tensor telepathy» son unconventional y no están validadas de forma independiente; `PmtpShmBus` no está documentado en detalle.
- Requiere código del repositorio GitHub de POLYDIM; no se documenta una integración directa con `transformers`, vLLM o TGI.
- Longitud de contexto, idiomas y cuantizaciones no disponibles; riesgos para producción si no se validan.
- Licencia Apache 2.0 permite uso comercial, pero debe revisarse también la licencia del código y del modelo base.
- 0 descargas y 0 likes: adopción muy baja y ausencia de validación comunitaria.
- Riesgo de alucinación y sesgos heredados del modelo base; no se documentan mitigaciones.
- No apto para decisiones de alto riesgo sin verificación humana.

## Enlaces

- HuggingFace: https://huggingface.co/polydim-cla/deepseek-r1-1.5b-pmtp
- Repositorio GitHub: https://github.com/AGT1973/POLYDIM_EINSOF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Ollama (tag `deepseek-r1:1.5b`): https://ollama.com/library/deepseek-r1
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
