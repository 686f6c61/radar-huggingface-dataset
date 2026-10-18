# kucukkanat/gliner-bi-small-v2.0-onnx

## Resumen

Esta ficha describe `kucukkanat/gliner-bi-small-v2.0-onnx`, una exportación a ONNX del modelo GLiNER bi-encoder `knowledgator/gliner-bi-small-v2.0` para reconocimiento de entidades nombradas zero-shot. No es un modelo entrenado desde cero: reproduce el modelo base de 108 M de parámetros en dos grafos ONNX, uno fp32 de 429 MB y otro int8 de 117 MB, e incorpora el encoder de etiquetas dentro del grafo para ejecutarse en ONNX Runtime sobre CPU y en el navegador mediante WebAssembly.

El modelo resuelve un problema concreto: extraer entidades de tipos definidos por el usuario en una sola pasada, sin generar texto y sin reentrenar. Dado un texto y una lista de etiquetas como persona, producto, sistema software, fecha, ubicación o número de identificación, devuelve spans de 1 a 12 palabras con una puntuación. Esto lo hace adecuado para despliegues ligeros, procesamiento local y aplicaciones web con requisitos de privacidad.

Su relevancia actual está en la eficiencia de despliegue: 108 M de parámetros, 117 MB en int8, inferencia en CPU y compatibilidad con `onnxruntime-web`. La licencia Apache-2.0 y el origen Knowledgator facilitan su integración, aunque la evaluación publicada se limita a 40 textos laborales y no sustituye a una validación en el dominio de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GLiNER bi-encoder: encoder de texto y encoder de etiquetas, exportado como un único grafo ONNX |
| Parámetros totales | 108 M según la model card |
| Parámetros activos | no aplica, no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | fp32; int8 con MatMulNBits de 8 bits, bloque 32 y simétrico, y tablas de embeddings de 8 bits; se probó cuantización dinámica uint8 del grafo completo, pero no se distribuye |
| Idiomas soportados | inglés, etiqueta `en`; la evaluación incluye inglés, sueco, alemán, polaco y neerlandés, pero esos idiomas no se declaran oficialmente |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX: `onnx/model.onnx` en fp32, 429 MB; `onnx/model_q8.onnx` en int8, 117 MB |
| Tarea | token-classification / reconocimiento de entidades zero-shot |
| Modelo base | `knowledgator/gliner-bi-small-v2.0` |
| Tamaño del repositorio | 0,5 GB |
| Entrada | texto tokenizado por palabras, `words_mask`, `text_lengths`, spans de 1 a 12 palabras y etiquetas tokenizadas |
| Salida | `logits` con forma `[1, words, 12, types]`; postproceso con sigmoid, umbral y supresión de solapamientos |

## Arquitectura y entrenamiento

GLiNER bi-encoder: un encoder de texto, `ettin-encoder-68m`, procesa el texto, y un encoder de frases, `all-MiniLM-L12-v2`, procesa las etiquetas de entidad. El grafo ONNX incluye ambos encoders y enumera todos los spans de 1 a 12 palabras. La salida `logits` tiene forma `[1, words, 12, types]`; tras aplicar sigmoid y un umbral se conservan los spans que no solapan con uno ya elegido, en orden de puntuación.

Al ser una exportación cuantizada, no se reentrena ni se documentan aquí tokens de entrenamiento, composición del dataset, RLHF o DPO del modelo base. La innovación es de despliegue: un único grafo ONNX con el encoder de etiquetas integrado, cuantización int8 de MatMul con bloques de 32 y embeddings de 8 bits, y soporte de WebAssembly. La tokenización exige preprocesar el texto por palabras con `\w+(?:[-_]\w+)*|\S`, construir `words_mask`, `text_lengths`, `span_idx` y `span_mask`, y tokenizar las etiquetas con el tokenizer de MiniLM.

## Capacidades

- Reconocimiento de entidades zero-shot para tipos definidos en tiempo de inferencia, sin reentrenamiento.
- Extracción de spans de 1 a 12 palabras en una sola pasada del grafo.
- Ejecución en ONNX Runtime sobre CPU y en navegador mediante WebAssembly.
- Integración en pipelines de `token-classification` con salida de logits y postproceso configurable.
- Evaluación multilingüe en inglés, sueco, alemán, polaco y neerlandés, aunque el único idioma declarado es el inglés.
- Ajuste del umbral de decisión para priorizar precisión o cobertura.
- No incluye generación de texto, razonamiento, matemáticas, código, visión, audio, tool calling ni comportamiento de agente.
- No es un modelo conversacional ni un LLM; su única función es la extracción de entidades y spans.

## Casos de uso

- Extracción de entidades en tickets de soporte: permite obtener persona, producto, sistema software, fecha, ubicación y número de identificación de cada ticket en una pasada y en CPU, lo que reduce el coste frente a un modelo generativo y facilita el enrutamiento automático.
- Redacción de PII en documentos y correos: con etiquetas como `PERSON`, `EMAIL`, `PHONE` o `ID`, el modelo puede marcar fragmentos sensibles antes de enviarlos a un servicio externo; conviene añadir revisión humana por los falsos positivos y falsos negativos.
- Enriquecimiento de CRM a partir de correos: extrae producto, fecha, ubicación y número de identificación de mensajes de clientes para rellenar campos estructurados sin salir del entorno local.
- Análisis de postmortems y traspasos de almacén: identifica equipo o departamento, sistema software, fecha, ubicación e identificadores en textos operativos; los spans de hasta 12 palabras cubren nombres de sistemas y referencias habituales.
- Redacción en el navegador antes de enviar texto a un servidor: el grafo int8 de 117 MB puede ejecutarse con `onnxruntime-web` en WebAssembly, de modo que el texto sensible no abandona el dispositivo.
- Digitalización de albaranes y facturas: extrae producto, fecha, ubicación y número de identificación en un pipeline on-premise con CPU; para documentos largos hay que trocear el texto porque la longitud de contexto no está documentada.
- Routing multilingüe de documentos internos: la evaluación cubre sueco, alemán, polaco y neerlandés, así que puede usarse como primer filtro para extraer equipo, producto y ubicación, siempre con validación por idioma y dominio.
- Anotación asistida para construir datasets NER: preetiqueta con un umbral bajo y permite que anotadores humanos corrijan, lo que acelera la creación de corpus con tipos de entidad personalizados.

## Benchmarks y rendimiento

| Modelo | F1 de entidad | F1 en inglés | Entidades distintas de PyTorch |
|---|---:|---:|---:|
| PyTorch, modelo base | 0,813 | no disponible | 0, referencia |
| ONNX fp32 | 0,813 | no disponible | 0 |
| ONNX int8 | 0,814 | 0,856 | 12 |

Conjunto de 40 textos etiquetados de entorno laboral, entre ellos tickets, notas de roadmap, postmortems, traspasos de tienda y almacén y mensajes de clientes, en inglés, sueco, alemán, polaco y neerlandés. Tipos evaluados: persona, equipo o departamento, producto, sistema software o herramienta, fecha, ubicación y número de identificación. Umbral: 0,3.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks equivalentes, y no aplican a un modelo de NER. La muestra de 40 textos es pequeña y no es un benchmark estándar, por lo que el F1 no debe extrapolarse sin una evaluación propia.

## Requisitos de hardware

- VRAM estimada: 0 MB si se ejecuta en CPU. En GPU, orientativamente menos de 1 GB con fp32, 429 MB de pesos, y menos de 0,5 GB con int8, 117 MB, sin contar el overhead de ONNX Runtime; no hay cifras oficiales.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU consumer reciente con ONNX Runtime puede ejecutarlo, pero el diseño prioriza CPU y navegador.
- ¿Cabe en GPU consumer? Sí, en cualquier GPU con soporte ONNX Runtime; también funciona sin GPU.
- Opciones de despliegue: ONNX Runtime en Python, C++, C# o Java, y `onnxruntime-web` con WebAssembly en navegador. No es compatible con vLLM, llama.cpp, Ollama o TGI, orientados a modelos generativos.
- Latencia y throughput: no disponibles. La model card indica que int8 fue más rápido en CPU que una cuantización dinámica uint8 del grafo completo, pero no publica milisegundos ni textos por segundo.
- La entrada es batch 1; para procesar muchos textos hay que iterar documento a documento, lo que limita el throughput agregado.
- Memoria en navegador: la descarga de int8 es de 117 MB; hay que sumar el runtime y las estructuras de spans, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 de entidad | Licencia | Formato | Disponibilidad |
|---|---:|---|---:|---|---|---|
| Este ONNX | 108 M | no disponible | 0,813 fp32 / 0,814 int8 | Apache-2.0 | ONNX | HuggingFace, repositorio de 0,5 GB |
| Base PyTorch | 108 M | no disponible | 0,813 | Apache-2.0 | PyTorch | HuggingFace |
| Otras variantes GLiNER | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se han proporcionado datos de otras alternativas comparables, como GLiNER de mayor tamaño u otros modelos de NER zero-shot, así que no se comparan cifras que no estén en la información. La comparación directa con el modelo base muestra que la exportación fp32 conserva el F1 y la int8 cambia 12 entidades en 40 textos.

## Limitaciones y advertencias

- Idioma: la model card declara `en`; la evaluación en cinco idiomas no implica soporte oficial ni calidad equivalente en sueco, alemán, polaco o neerlandés.
- Evaluación pequeña: 40 textos y etiquetas concretas no constituyen un benchmark estándar; el F1 de 0,813 a 0,814 no garantiza rendimiento en otros dominios.
- Cuantización: el grafo int8 difiere de PyTorch en 12 entidades sobre 40 textos; hay que validar las entidades críticas en producción.
- Spans: solo se consideran entidades de 1 a 12 palabras; las entidades más largas se pierden y la supresión greedy elimina solapamientos y entidades anidadas.
- Contexto: la longitud máxima no está documentada; para documentos largos hay que trocear y pueden perderse entidades en las fronteras.
- Batch 1: el grafo no está pensado para lotes; el throughput depende de procesar texto a texto.
- Umbral: 0,3 es el valor usado en la evaluación; hay que ajustarlo por dominio y asumir falsos positivos y falsos negativos.
- No es generativo: no hace razonamiento, tool calling, agentes, matemáticas, visión ni audio; solo NER.
- Sesgos: no se documentan los datos de entrenamiento del modelo base ni un análisis de sesgo; los textos laborales pueden favorecer ciertos dominios y estilos.
- Licencia: Apache-2.0 permite uso comercial, pero exige conservar los avisos correspondientes y no ofrece garantías.
- Integración: el preprocesado de palabras y los inputs `words_mask`, `span_idx`, `span_mask` y `text_lengths` son específicos; errores de tokenización degradan el resultado.
- Navegador: 117 MB de descarga y consumo de memoria pueden no ser viables en dispositivos móviles modestos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/kucukkanat/gliner-bi-small-v2.0-onnx)
- [Modelo base knowledgator/gliner-bi-small-v2.0](https://huggingface.co/knowledgator/gliner-bi-small-v2.0)
- [Encoder de texto ettin-encoder-68m](https://huggingface.co/jhu-clsp/ettin-encoder-68m)
- [Encoder de etiquetas all-MiniLM-L12-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L12-v2)
- [Knowledgator](https://www.knowledgator.com/)
- No se han encontrado papers, blogs, repositorios adicionales o demos en la información proporcionada.
