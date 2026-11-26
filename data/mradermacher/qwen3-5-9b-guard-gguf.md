# mradermacher/Qwen3.5-9B-Guard-GGUF

## Resumen

Qwen3.5-9B-Guard-GGUF es la versión cuantizada en formato GGUF del modelo Rumiii/Qwen3.5-9B-Guard, un ajuste fino de la familia Qwen3.5 orientado específicamente a la detección de relevancia e irrelevancia en el contexto de function calling y tool calling. El modelo base pertenece a la familia Qwen3.5 de Alibaba, y este ajuste concreto ha sido entrenado por el usuario Rumiii sobre dos conjuntos de datos especializados: MadeAgents/xlam-irrelevance-7.5k y Salesforce/xlam-function-calling-60k, ambos centrados en el uso de herramientas y en la capacidad de decidir cuándo una llamada a herramienta es pertinente o no.

La relevancia de este modelo radica en que aborda uno de los problemas prácticos más habituales en sistemas de agentes: decidir si una consulta del usuario requiere invocar una herramienta, si la herramienta propuesta es adecuada, o si por el contrario la petición es irrelevante y debe responderse sin llamada. Esto lo convierte en un componente útil como filtro o guardián dentro de pipelines de agentes, donde un modelo de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) ofrece un equilibrio razonable entre capacidad y coste de despliegue.

Esta ficha describe la versión GGUF producida por mradermacher, que facilita la ejecución local mediante llama.cpp y herramientas compatibles, con múltiples niveles de cuantización desde Q2_K hasta f16, además de suplementos multimodales (mmproj) que sugieren capacidades de visión en el modelo base. La licencia es Apache 2.0 y el modelo declara únicamente el idioma inglés en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles específicos de capas y atención no disponibles) |
| Parametros totales | 9.197.093.888 (≈9,2 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; además mmproj-f16 y mmproj-Q8_0 (suplemento multimodal) |
| Idiomas soportados | en (inglés, según model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base original está en formato transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base es Rumiii/Qwen3.5-9B-Guard, un ajuste fino de la familia Qwen3.5 con 9.197.093.888 parámetros. La model card no detalla la arquitectura interna (número de capas, tipo de atención, uso de atención lineal o decodificación especulativa), por lo que estos datos deben considerarse no disponibles. La presencia de ficheros mmproj en la versión GGUF indica que el modelo base incorpora un codificador multimodal para entrada de imágenes, aunque la model card no describe formalmente esta capacidad.

El entrenamiento se ha realizado sobre dos datasets: MadeAgents/xlam-irrelevance-7.5k, orientado a la detección de irrelevancia en llamadas a funciones, y Salesforce/xlam-function-calling-60k, un corpus de gran tamaño para function calling. No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El ajuste se ha etiquetado con la librería unsloth, lo que sugiere el uso de Unsloth para el entrenamiento eficiente del fine-tuning. La versión GGUF ha sido generada por mradermacher con cuantizaciones estáticas (quantize_version 2, output_tensor_quantised 1, convert_type hf); no hay cuantizaciones ponderadas/imatrix disponibles según la model card.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de conversaciones multi-turno (tag conversational).
- Function calling y tool calling: el modelo está específicamente ajustado para emitir llamadas a herramientas estructuradas.
- Detección de relevancia e irrelevancia: capacidad de decidir si una petición requiere invocar una herramienta o si es irrelevante para el conjunto de herramientas disponible.
- Soporte para agentes y razonamiento multi-paso en el contexto de uso de herramientas.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su integración en servicios de inferencia.
- Capacidad multimodal potencial: la presencia de ficheros mmproj (f16 y Q8_0) indica soporte de entrada de imágenes en el modelo base, aunque no se detalla en la model card.
- Capacidades multilingües: limitadas al inglés según la model card; no se declaran otros idiomas.
- No se declaran capacidades específicas de matemáticas, código general o modo de razonamiento (thinking mode) en la información disponible.

## Casos de uso

- Filtro de relevancia en pipelines de agentes: el modelo puede colocarse como primera etapa para determinar si una consulta del usuario es relevante para el conjunto de herramientas disponibles, evitando llamadas innecesarias o erróneas a funciones y reduciendo costes en sistemas multi-agente.
- Enrutamiento de herramientas en asistentes: dado un catálogo de funciones, el modelo selecciona la herramienta adecuada o decide no invocar ninguna, lo que resulta útil en asistentes de atención al cliente con APIs internas.
- Guardián de seguridad en function calling: al detectar irrelevancia, puede bloquear peticiones que intenten forzar llamadas a herramientas fuera de dominio, añadiendo una capa de validación semántica.
- Automatización de flujos RPA con APIs: el modelo traduce instrucciones en lenguaje natural a llamadas de función estructuradas, integrándose en orquestadores de tareas empresariales.
- Evaluación y depuración de agentes: puede usarse como juez para clasificar si las llamadas generadas por otro modelo son pertinentes, ayudando en la evaluación de sistemas de agentes en producción.
- Despliegue local en entornos con recursos limitados: gracias a las cuantizaciones GGUF (desde Q2_K de 4,1 GB hasta Q8_0 de 9,9 GB), puede ejecutarse en estaciones de trabajo con GPU de consumo para prototipado y pruebas de integración.
- Prototipado de asistentes con entrada multimodal: los ficheros mmproj permiten experimentar con entradas de imagen en combinación con tool calling, aunque la documentación al respecto es escasa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ≈4,1 GB; Q3_K_S ≈4,5 GB; Q3_K_M ≈4,9 GB; Q3_K_L ≈5,3 GB; IQ4_XS ≈5,5 GB; Q4_K_S ≈5,6 GB; Q4_K_M ≈5,9 GB; Q5_K_S ≈6,6 GB; Q5_K_M ≈6,8 GB; Q6_K ≈7,7 GB; Q8_0 ≈9,9 GB; f16 ≈18,5 GB. A estas cifras hay que sumar el espacio para el contexto KV cache y, en su caso, el suplemento mmproj (0,7 GB en Q8_0 o 1,0 GB en f16).
- GPU recomendadas: para cuantizaciones Q4_K_M y superiores, una RTX 4090 (24 GB) o RTX 3090 permite ejecutar el modelo completo en VRAM con contexto amplio; para Q8_0 y f16 se recomiendan A100 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más para cuantizaciones Q2_K a Q4_K_S (por ejemplo, RTX 3060 Ti, RTX 4060 Ti 16 GB, RTX 3070); con 12 GB se pueden usar Q5_K_M y Q6_K con holgura.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base también puede servirse con vLLM o TGI si se usa el formato transformers original, y la etiqueta endpoints_compatible sugiere compatibilidad con APIs de inferencia estándar.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Guard (este modelo) | ≈9,2 B | no disponible | Function calling y detección de irrelevancia | Apache 2.0 | GGUF (mradermacher) y base en HF |
| Qwen3.5-9B (base de la familia) | ≈9,2 B | no disponible | Modelo generalista | no disponible en esta ficha | HF |
| Salesforce xLAM series | no disponible | no disponible | Function calling | no disponible | HF |
| MadeAgents xLAM-irrelevance | no disponible | no disponible | Detección de irrelevancia | no disponible | HF (dataset) |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo declara únicamente inglés como idioma; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea degradado.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas de function calling puede generar llamadas a funciones inexistentes o argumentos malformados, por lo que se recomienda validación estructural de la salida.
- La model card no documenta sesgos conocidos, composición del dataset de entrenamiento ni procesos de alineación; esto limita la evaluación de riesgos para producción.
- No se especifica la longitud de contexto soportada, lo que impide dimensionar correctamente el KV cache y planificar conversaciones largas.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S, Q3_K_M) pueden degradar notablemente la fiabilidad en la clasificación de relevancia; para producción se recomienda Q4_K_M o superior.
- No hay cuantizaciones ponderadas/imatrix disponibles según la model card, lo que puede afectar ligeramente a la calidad respecto a versiones con imatrix.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el modelo base Qwen3.5 puede estar sujeto a condiciones adicionales de Alibaba; conviene revisar la licencia del modelo base original antes de un despliegue comercial.
- El modelo está especializado en detección de relevancia y tool calling; su uso como modelo generalista de propósito amplio no está recomendado ni documentado.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-9B-Guard-GGUF
- Modelo base: https://huggingface.co/Rumiii/Qwen3.5-9B-Guard
- Página de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.5-9B-Guard-GGUF
- Dataset de irrelevancia: https://huggingface.co/datasets/MadeAgents/xlam-irrelevance-7.5k
- Dataset de function calling: https://huggingface.co/datasets/Salesforce/xlam-function-calling-60k
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
