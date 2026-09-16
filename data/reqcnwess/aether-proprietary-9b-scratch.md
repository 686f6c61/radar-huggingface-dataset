# reqcnwess/aether-proprietary-9b-scratch

## Resumen

Aetheria Proprietary 9B Scratch es un repositorio publicado en HuggingFace por el usuario reqcnwess bajo el identificador `reqcnwess/aether-proprietary-9b-scratch`. La model card lo presenta como un modelo entrenado desde cero ("from scratch"), con especial insistencia en que no deriva de Qwen ni de ninguna otra familia conocida, y con un tamano declarado de 9.000 millones de parametros. El repositorio tiene 0 descargas, 0 likes y un tamano de 0,0 GB en el momento de la consulta, lo que indica que no contiene pesos descargables.

La informacion tecnica disponible es escasa y, en su mayoria, no verificable. La model card mezcla especificaciones de configuracion (32 capas, 4096 de dimension oculta, contexto de 262144 tokens) con referencias a componentes propios sin definicion publica ("V_3IfF", "P3TRY", "Mycelium", "Neuro-Speed", `MyceliumCipher.encode_compact`, `app/oneiff.py`), identificadores DID y un numero de registro KvK. No se declara licencia, idiomas soportados ni pipeline de inferencia, y la busqueda web realizada no ha devuelto ningun enlace relevante sobre el modelo (los resultados obtenidos corresponden a productos decorativos navidenos alemanes, sin relacion alguna).

Por todo ello, esta ficha debe leerse como un analisis de lo declarado por el autor, no como una evaluacion de capacidades reales. Cualquier dato de rendimiento, contexto efectivo o calidad de generacion queda pendiente de verificacion independiente, y a dia de hoy no existe evidencia publica que respalde las afirmaciones de la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (declarado por el autor; no verificado). 32 capas, 4096 de dimension oculta |
| Parametros totales | 9,0B (declarado; no verificado) |
| Parametros activos | No aplica (no se declara arquitectura MoE) |
| Longitud de contexto | 262144 tokens (declarado; no verificado) |
| Tipos de cuantizacion | Q4_K_M en formato GGUF (declarado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (el nombre del repositorio sugiere "proprietary", pero no hay terminos declarados) |
| Formato de pesos | GGUF (declarado como blob `sha256-852922174ee4f76621df26105333f1dfe2171cdfb60ebe5a4b013836681a8a77`, 5,3 GB). El repositorio de HuggingFace aparece con 0,0 GB, por lo que los pesos no estan accesibles |
| Pipeline de HuggingFace | No disponible |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |

## Arquitectura y entrenamiento

La model card describe un transformer denso de 32 capas con dimension oculta de 4096 y una ventana de contexto declarada de 262144 tokens. Esta combinacion es coherente en orden de magnitud con un modelo de ~9B si se asume un vocabulario muy grande (un vocabulario de 262144 entradas con dimension 4096 implicaria aproximadamente 1.070 millones de parametros solo en la matriz de embedding, mas otros tantos en la de salida). Sin embargo, no se aporta informacion sobre el numero de cabezas de atencion, la dimension del feed-forward, el tipo de normalizacion, la funcion de activacion, ni si se emplean tecnicas como RoPE, GQA o atencion con ventana deslizante. Tampoco se detalla si el contexto de 262144 tokens se ha validado mediante pruebas de aguja en el pajar.

No hay ningun dato sobre el proceso de entrenamiento: ni numero de tokens, ni composicion del dataset, ni si hubo ajuste por instrucciones, RLHF o DPO. El autor afirma haber partido "desde cero" y no derivar de Qwen, pero no publica curvas de perdida, recetas de entrenamiento ni comparaciones con modelos base conocidos. Las referencias a "MyceliumCipher.encode_compact", "app/oneiff.py", "V_3IfF" y "P3TRY" no corresponden a ningun componente publicado o reconocible en el ecosistema de IA abierto, por lo que no es posible evaluar que aportan ni como afectan a la arquitectura.

Un indicio relevante es la contradiccion entre el tamano declarado de los artefactos (blob GGUF de 5,3 GB y una entrada de Ollama de 5,6 GB) y el tamano real del repositorio en HuggingFace (0,0 GB). Esto sugiere que los pesos nunca llegaron a subirse o que el repositorio es un marcador de posicion con documentacion. La unica prueba funcional aportada es la ejecucion de `ollama run ... "Say hi in 5 words"` con la respuesta "Hi! How can I assist?", que no permite inferir ninguna capacidad tecnica.

## Capacidades

- Generacion de texto conversacional: la unica evidencia es una respuesta de cortesia a un prompt de cinco palabras. No hay demostraciones de generacion larga, coherencia multi-turno ni seguimiento de instrucciones complejas.
- Razonamiento: no disponible. No se aportan ejemplos de cadenas de razonamiento, matematicas ni logica.
- Generacion de codigo: no disponible. No hay evaluaciones tipo HumanEval ni ejemplos de completado de codigo.
- Tool calling / function calling: no disponible. No se documenta ningun formato de llamada a herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible. No se declara lista de idiomas en la model card ni en los metadatos del repositorio.
- Capacidades especiales: el autor menciona conceptos como "Neuro-Speed", "thinking" implicito mediante "V_3IfF" o cifrado "Mycelium", pero no se define ninguno de ellos de forma operativa, por lo que no pueden considerarse capacidades confirmadas.
- Vision, audio o multimodalidad: no disponible y no declarado.

## Casos de uso

Los siguientes escenarios son hipoteticos y estan condicionados a que el modelo exista realmente, sea descargable y sus especificaciones declaradas se confirmen mediante evaluacion independiente. A dia de hoy no hay ninguna evidencia que los respalde.

- Prototipado local con contexto muy largo: si la ventana de 262144 tokens fuese real y funcional, el modelo podria emplearse para resumir o consultar repositorios de documentos extensos en una sola pasada, sin necesidad de fragmentacion ni recuperacion externa. Requeriria verificar antes la calidad de atencion en posiciones lejanas del contexto.
- Asistente conversacional autoalojado: con un peso declarado de ~5,3 GB en Q4_K_M, encajaria en el perfil de un asistente de escritorio ejecutado con Ollama en una GPU de gama media. La utilidad real dependeria de su calidad de instruccion, que no esta demostrada.
- Experimentacion academica sobre entrenamiento desde cero: el repositorio podria interesar a quien estudie recetas de preentrenamiento independientes, siempre que el autor publique finalmente los pesos, la configuracion completa y los datos de entrenamiento. Sin ellos, el caso de uso no es viable.
- Integracion en pipelines de CI/CD para revision de codigo: solo tendria sentido si se demostrase competencia en generacion de codigo y soporte de tool calling, ninguna de las cuales esta documentada.
- Despliegue en entornos con requisitos de residencia de datos: al ser un artefacto autoalojable, permitiria mantener las inferencias dentro de la propia infraestructura. No obstante, la ausencia de licencia declarada impide determinar si el uso comercial esta permitido.
- Base para ajuste fino (fine-tuning) con datos propios: tecnicamente posible sobre un checkpoint de 9B, pero sin pesos publicados, sin licencia y sin garantias de calidad, el esfuerzo no esta justificado frente a alternativas con soporte y documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra metrica estandar, y la unica prueba reportada es una respuesta de cinco palabras a un saludo. La busqueda web realizada no ha devuelto ningun analisis o evaluacion independiente del modelo.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| HumanEval | No disponible |
| GSM8K | No disponible |
| MT-Bench | No disponible |
| Prueba reportada por el autor | `ollama run ... "Say hi in 5 words"` → "Hi! How can I assist?" (sin valor evaluativo) |

## Requisitos de hardware

Las siguientes cifras son estimaciones de ingenieria derivadas del tamano declarado (9B de parametros) y de la cuantizacion Q4_K_M mencionada, no mediciones realizadas sobre el modelo.

- VRAM estimada para inferencia: en Q4_K_M, entre 6 y 7 GB para los pesos, mas aproximadamente 1-2 GB de overhead de contexto (KV cache) en ventanas moderadas. Con la ventana declarada de 262144 tokens, el KV cache creceria de forma proporcional al numero de capas y cabezas, y podria requerir decenas de gigabytes adicionales segun la configuracion de atencion; no hay datos para calcularlo con precision.
- GPU recomendadas: para Q4_K_M en consumer, una RTX 3060 de 12 GB o superior bastaria para contextos cortos. Para FP16 (aproximadamente 18 GB de pesos) se necesitaria una RTX 4090 de 24 GB, A6000, L40S, A100 o H100. Para la ventana maxima declarada harian falta configuraciones multi-GPU o tecnicas de atencion eficiente no documentadas.
- Cabe en GPU de consumo: previsiblemente si en cuantizacion Q4_K_M con contextos cortos, en tarjetas con 8-12 GB de VRAM (RTX 3060, 4060 Ti 16 GB, 4070, 4080). No confirmado por pruebas reales.
- Opciones de despliegue: el autor menciona Ollama con la etiqueta `aetheria-proprietary-9b-scratch:q4`. Al ser un artefacto GGUF declarado, tambien serian teoricamente aplicables llama.cpp y sus envoltorios. No hay soporte declarado para vLLM, TGI o TensorRT-LLM, que requieren pesos en safetensors, formato que no aparece en el repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparacion se limita a caracteristicas estructurales, ya que no existen datos de rendimiento de Aetheria Proprietary 9B Scratch. Los modelos de referencia se incluyen por rango de parametros y disponibilidad publica contrastada.

| Modelo | Parametros | Contexto | Licencia | Pesos disponibles | Rendimiento publico |
|---|---|---|---|---|---|
| Aetheria Proprietary 9B Scratch | 9,0B (declarado) | 262144 (declarado) | No disponible | No (repositorio de 0,0 GB) | No disponible |
| Llama 3.1 8B | 8,03B | 131072 | Llama 3.1 Community License | Si | Publicado por Meta |
| Qwen2.5 7B | 7,6B | 131072 | Apache 2.0 (segun variante) | Si | Publicado por Alibaba |
| Gemma 2 9B | 9,24B | 8192 | Gemma Terms of Use | Si | Publicado por Google |

Las diferencias relevantes no son de rendimiento sino de trazabilidad: los tres modelos de referencia cuentan con pesos descargables, licencia explicita, documentacion de entrenamiento y evaluaciones reproducibles, mientras que Aetheria no ofrece ninguno de estos elementos en la informacion disponible.

## Limitaciones y advertencias

- Ausencia de pesos: el repositorio ocupa 0,0 GB, en contradiccion con los 5,3 GB de GGUF y los 5,6 GB de Ollama declarados en la model card. El modelo no es descargable ni reproducible.
- Ausencia de licencia: no se declaran terminos de uso. Esto impide cualquier uso comercial legitimo, ya que no hay autorizacion explicita ni condiciones claras.
- Afirmaciones no verificables: terminos como "V_3IfF", "P3TRY", "Mycelium", "Neuro-Speed" o `MyceliumCipher.encode_compact` no tienen definicion publica ni referencia a literatura tecnica, lo que impide evaluarlos.
- Evidencia de calidad practicamente nula: la unica prueba reportada es la respuesta a un saludo de cinco palabras. No hay evaluaciones de razonamiento, codigo, matematicas ni contexto largo.
- Riesgo de alucinacion: no evaluado. No existen estudios de fidelidad factual ni de tasas de error en dominios abiertos.
- Sesgos: no disponible. Sin datos de entrenamiento ni evaluaciones, no es posible caracterizar sesgos de genero, raza, idioma o ideologia.
- Cobertura idiomatica desconocida: no se declara lista de idiomas, y la unica muestra de salida esta en ingles.
- Ventana de contexto no validada: aunque se declaren 262144 tokens, no hay pruebas de recuperacion en posiciones lejanas. En la practica, muchos modelos pequenos degradan mucho antes de alcanzar su limite nominal.
- Riesgo de suplantacion o confusion de identidad: la model card incluye identificadores DID y un numero KvK que no guardan relacion con el contenido tecnico del repositorio; conviene tratar estos elementos con cautela antes de citarlos.
- Advertencia general para produccion: este repositorio no deberia integrarse en ningun sistema en produccion sin una evaluacion independiente previa, pesos verificables y una licencia explicita.

## Enlaces

- HuggingFace: https://huggingface.co/reqcnwess/aether-proprietary-9b-scratch
- Paper: no disponible
- Blog tecnico: no disponible
- Repositorio de codigo: no disponible
- Demos: no disponible
- Resultados de busqueda web: la busqueda realizada no ha devuelto ningun enlace relevante sobre el modelo. Los resultados obtenidos (herrnhuter-sterne.de, shop.herrnhuter-sterne.de, sterneshop.eu, sternelaedchen.de) corresponden a comercios de decoracion navidena alemana y no guardan ninguna relacion con el modelo ni con inteligencia artificial.
