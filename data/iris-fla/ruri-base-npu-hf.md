# Iris-fla/ruri-base-npu-hf

## Resumen

`Iris-fla/ruri-base-npu-hf` es una exportación a OpenVINO IR del modelo de embeddings de frases en japonés `cl-nagoya/ruri-base`, desarrollado por el CL Research Group de la Universidad de Nagoya. La conversión la firma el usuario Iris-fla y su propósito declarado es servir de motor de embeddings para la búsqueda semántica y las funciones de pregunta-respuesta con IA de la aplicación de actas de reuniones "言の記 Kotonoki". No se trata por tanto de un modelo nuevo, sino de un artefacto de despliegue derivado del original.

El modelo base es un BERT de tipo base (arquitectura transformer encoder) con 768 dimensiones de embedding, afinado para japonés y pensado para similitud semántica y recuperación de pasajes. La exportación comprime los pesos a int8 mediante `optimum-cli` y elimina la dependencia de PyTorch en tiempo de ejecución, lo que permite inferencia en CPU y en aceleradores Intel (NPU/GPU integrada) a través del runtime de OpenVINO.

Su relevancia es acotada pero concreta: es un ejemplo de cómo empaquetar un modelo de embeddings japonés para despliegue local en hardware modesto, con un formato listo para el plugin de OpenVINO de Optimum. No aporta mejoras de calidad respecto al original y no debe confundirse con un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base), derivado de `cl-nagoya/ruri-base` |
| Parametros totales | no disponible (el modelo base es de escala "base"; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha; el autor indica que la aplicación limita la entrada a 256 tokens |
| Tipos de cuantizacion | int8 (compresión de pesos OpenVINO IR) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | OpenVINO IR (exportado con `optimum-cli`, optimum 2.3.0 / transformers 5.5.4) |
| Dimension de embedding | 768 |
| Pipeline | feature-extraction (sentence-embedding) |
| Prefijos de uso | `クエリ: ` para consultas, `文章: ` para pasajes |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo `cl-nagoya/ruri-base`: un encoder transformer de estilo BERT entrenado para generar embeddings de frase en japonés. Ruri se entrena con un objetivo de similitud/recuperación y requiere prefijos explícitos por rol (`クエリ: ` y `文章: `) para distinguir consultas de documentos, según se documenta en la model card del original. El autor de esta exportación no detalla el volumen de tokens de entrenamiento, la composición del corpus ni si hubo etapas de ajuste fino adicionales; esa información debe consultarse en la ficha del modelo base.

La única transformación aplicada aquí es la conversión de formato: exportación a OpenVINO IR con compresión de pesos a int8 mediante el comando `optimum-cli export openvino --model cl-nagoya/ruri-base --task feature-extraction --weight-format int8`. El autor declara explícitamente que no ha habido reentrenamiento ni ajuste fino. La innovación, por tanto, no es algorítmica sino de despliegue: pesos en IR optimizados para el runtime de OpenVINO, con soporte para ejecución en NPU y CPU Intel sin pila PyTorch.

## Capacidades

- Generación de embeddings de frase y pasaje en japonés con 768 dimensiones, orientados a similitud semántica y recuperación.
- Búsqueda semántica sobre documentos: indexación de pasajes con prefijo `文章: ` y consulta con prefijo `クエリ: `.
- Recuperación aumentada para sistemas de pregunta-respuesta: proporciona el vector de recuperación que alimenta una etapa generativa posterior (el modelo en sí no genera texto).
- Extracción de características (`feature-extraction`): salida de representaciones vectoriales reutilizables para clasificación, clustering o deduplicación.
- Inferencia en hardware Intel mediante OpenVINO, incluyendo NPU y GPU integrada, sin dependencia de CUDA.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo generativo.
- No soporta visión, audio ni modo "thinking".
- Capacidad multilingüe: limitada al japonés según la etiqueta de idioma declarada.

## Casos de uso

- Búsqueda semántica en actas de reuniones: el escenario original del autor. Se indexan los fragmentos de las transcripciones con prefijo `文章: ` y se consultan con `クエリ: `, de modo que el usuario recupera pasajes relevantes aunque no coincidan literalmente con las palabras buscadas.
- Pregunta-respuesta sobre documentación interna en japonés: el modelo actúa como recuperador dentro de un pipeline RAG; los pasajes recuperados se pasan a un LLM generativo que redacta la respuesta. Es adecuado porque la recuperación densa supera a la búsqueda por palabras clave en consultas parafraseadas.
- Despliegue en portátiles o equipos de oficina sin GPU dedicada: al estar en OpenVINO IR int8, se ejecuta en CPU Intel y NPU con un consumo de memoria muy inferior al del modelo en fp32, lo que permite indexar y consultar localmente sin enviar datos a la nube.
- Clasificación y clustering de documentos japoneses: los embeddings de 768 dimensiones sirven como entrada a clasificadores ligeros o a algoritmos de agrupamiento para organizar correos, tickets o artículos por temática.
- Deduplicación y detección de near-duplicates: comparar embeddings con similitud coseno permite identificar documentos o registros casi idénticos en bases de datos japonesas.
- Filtrado previo en sistemas de atención al cliente: recuperar las entradas de una base de conocimiento más próximas a la consulta del usuario antes de que un agente o un LLM elabore la respuesta, reduciendo el contexto enviado al modelo generativo.
- Prototipado rápido de motores de búsqueda: la exportación lista para OpenVINO evita montar un entorno PyTorch y permite validar la calidad de la recuperación con el modelo original antes de invertir en infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (nDCG, MRR), ni comparativas con el modelo original en fp32, ni mediciones de latencia o throughput en NPU. Para evaluar la calidad intrínseca del modelo debe consultarse la ficha de `cl-nagoya/ruri-base`, que sí documenta sus resultados en las tareas para las que fue entrenado.

## Requisitos de hardware

- VRAM/ memoria: al tratarse de pesos int8 de un modelo de escala "base" con 768 dimensiones, el repositorio ocupa 0,1 GB; la huella en memoria durante la inferencia es del orden de unos cientos de MB, muy por debajo de lo que exigiría el mismo modelo en fp32.
- GPU: no requiere GPU dedicada. El runtime de OpenVINO puede usar CPU Intel, GPU integrada Intel o NPU Intel (Core Ultra y posteriores).
- GPU de consumo: no aplica en el sentido habitual; no se ha validado con CUDA. Para uso en GPU NVIDIA habría que recurrir al modelo original en PyTorch o a otra exportación.
- Opciones de despliegue: OpenVINO Runtime a través del plugin de Optimum (`OVModelForFeatureExtraction`), OpenVINO GenAI y los servidores de inferencia compatibles con OpenVINO. No se distribuye en GGUF ni en safetensors, por lo que llama.cpp, Ollama y vLLM no son vías directas de despliegue para este artefacto.
- Latencia y throughput: no disponibles. El autor no publica mediciones; a título orientativo, un encoder base en int8 sobre CPU moderna suele procesar lotes pequeños en decenas de milisegundos, pero este dato no está confirmado en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| `Iris-fla/ruri-base-npu-hf` | escala base (sin recuento publicado) | no disponible (uso limitado a 256 tokens en la app) | ja | OpenVINO IR int8 | Apache 2.0 | Exportación de despliegue, sin reentrenamiento |
| `cl-nagoya/ruri-base` | escala base | no disponible en la información | ja | safetensors (PyTorch) | Apache 2.0 | Modelo original; referencia de calidad |
| `intfloat/multilingual-e5-base` | escala base | 512 tokens | multilingüe | safetensors, ONNX | MIT | Alternativa multilingüe; requiere prefijos `query:`/`passage:` |
| `BAAI/bge-m3` | no disponible | hasta 8192 tokens | multilingüe | safetensors | MIT | Mayor contexto y multilingüismo, con mayor coste computacional |

La comparación con `ruri-base` es la más directa: esta exportación debería reproducir sus embeddings con una pérdida mínima por la cuantización int8, algo que el autor no cuantifica. Frente a alternativas multilingües como `multilingual-e5-base` o `bge-m3`, la ventaja de ruri es su especialización en japonés; la desventaja, su limitación a ese idioma y la ausencia de pesos en formatos estándar en este repositorio concreto.

## Limitaciones y advertencias

- Solo japonés: la etiqueta de idioma es `ja` y no se declara soporte para otras lenguas; usarlo con texto en castellano u otros idiomas producirá embeddings de baja calidad.
- No es un modelo generativo: no produce texto, no razona y no soporta tool calling. Cualquier caso de uso de pregunta-respuesta requiere un LLM adicional en el pipeline.
- Dependencia de los prefijos: omitir `クエリ: ` y `文章: ` degrada la calidad de la recuperación, ya que el modelo fue entrenado con esa convención.
- Pérdida por cuantización: la compresión int8 puede reducir ligeramente la precisión de los embeddings frente al original en fp32; el autor no publica una evaluación comparativa.
- Ventana efectiva corta: la aplicación que lo consume limita la entrada a 256 tokens, de modo que los documentos largos deben trocearse en pasajes.
- Riesgo de alucinación: no aplica directamente al ser un extractor de características, pero los sistemas RAG que lo usen heredan el riesgo del LLM generativo que consuma los pasajes recuperados.
- Sesgos: no documentados en la información disponible; al derivar de un corpus japonés, puede reflejar sesgos culturales y lingüísticos de ese dominio.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero exige conservar el aviso de licencia y el archivo `NOTICE` con la atribución a los autores originales (Hayato Tsukagoshi y Ryohei Sasano, CL Research Group, Universidad de Nagoya).
- Madurez: el repositorio no tiene descargas ni valoraciones y fue creado en noviembre de 2026; es un artefacto de un proyecto concreto, no un modelo mantenido por la comunidad.
- Portabilidad: al estar solo en OpenVINO IR, no se puede cargar directamente con `transformers` ni con llama.cpp; para otros entornos hay que reexportar desde el modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Iris-fla/ruri-base-npu-hf
- Modelo base: https://huggingface.co/cl-nagoya/ruri-base
- Documentación de Optimum para exportación a OpenVINO: https://huggingface.co/docs/optimum/exporters/openvino/index
- Runtime de OpenVINO: https://docs.openvino.ai/
