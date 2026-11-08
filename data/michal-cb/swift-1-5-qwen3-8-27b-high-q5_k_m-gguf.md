# michal-cb/Swift-1.5-Qwen3.8-27b-high-Q5_K_M-GGUF

## Resumen

Swift-1.5-Qwen3.8-27b-high es un ajuste fino (post-entrenamiento) del modelo base Qwen3.8-27B, desarrollado por UkisAI y distribuido en este repositorio por el usuario michal-cb en formato GGUF cuantizado Q5_K_M. El modelo esta orientado a razonamiento eficiente en tokens ("efficient-thinking", "token-efficient") y a tareas de terminal y agentes, segun las etiquetas de su model card. El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales de entrada imagen y texto.

Con 27.320.697.856 parametros (aproximadamente 27,3 mil millones), se situa en la franja de modelos densos de gran tamano que requieren cuantizacion para caber en hardware de consumo. Este repositorio concreto ofrece los pesos en GGUF Q5_K_M, lo que reduce el peso del modelo hasta aproximadamente 19,5 GB de repositorio y permite su ejecucion con llama.cpp en GPUs de consumo de gama alta o en configuraciones con CPU y RAM abundante.

La relevancia actual del modelo reside en su enfoque en eficiencia de tokens durante el razonamiento y en su adaptacion para tareas de terminal (terminal-bench), un nicho creciente para agentes autonomos de linea de comandos. La licencia es propietaria-restrictiva (swift-open-license-1.0) y el acceso esta restringido (gated), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.8-27B); detalles especificos no disponibles |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q5_K_M (este repositorio); existe una variante INT4 publicada por ukisai |
| Idiomas soportados | No disponible |
| Licencia | swift-open-license-1.0 (licencia "other", acceso restringido/gated) |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye presumiblemente en safetensors via transformers |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.8-27B, un transformer denso de aproximadamente 27,3 mil millones de parametros. La model card no detalla la arquitectura interna (numero de capas, dimensiones ocultas, mecanismo de atencion) ni la composicion del dataset de entrenamiento. Las etiquetas indican un proceso de post-entrenamiento ("post-training") orientado a razonamiento eficiente en tokens y a tareas de terminal, lo que sugiere tecnicas de ajuste supervisado y posiblemente optimizacion por preferencias, aunque no se especifica si se empleo RLHF o DPO.

La innovacion declarada es el "efficient-thinking": el modelo busca reducir el consumo de tokens durante las cadenas de razonamiento sin sacrificar precision, un aspecto relevante para reducir costes de inferencia en produccion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la mezcla de datos ni innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El pipeline image-text-to-text sugiere que el modelo base incorpora un adaptador multimodal, aunque no se detalla su naturaleza.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento eficiente en tokens ("efficient-thinking").
- Razonamiento multi-paso orientado a tareas de agente y uso de terminal (etiqueta terminal-bench).
- Procesamiento de entrada multimodal imagen-texto, segun el pipeline declarado (image-text-to-text).
- Conversacion multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints de inferencia (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades multilingues: no disponibles; no se especifican idiomas.
- Capacidades de codigo y matematicas: plausibles por su origen Qwen y su orientacion a agentes, pero no documentadas explicitamente.

## Casos de uso

- Agentes autonomos de terminal: el modelo esta ajustado especificamente para tareas de linea de comandos (terminal-bench), por lo que puede emplearse en agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos de desarrollo.
- Automatizacion de operaciones DevOps: integrado en pipelines de CI/CD para diagnosticar fallos de build, leer logs y proponer comandos de remediacion, aprovechando su entrenamiento en tareas de terminal.
- Razonamiento eficiente en produccion: su enfoque en reducir tokens de pensamiento lo hace adecuado para servicios con coste por token, donde cadenas de razonamiento mas cortas reducen latencia y factura.
- Asistente de desarrollo local: desplegado con llama.cpp en una estacion de trabajo con GPU de consumo, sirve como asistente de codigo y shell sin depender de la nube.
- Analisis de capturas y diagramas tecnicos: gracias a su pipeline image-text-to-text, puede procesar imagenes junto con texto, por ejemplo capturas de pantalla de errores o diagramas de arquitectura.
- Prototipado de agentes conversacionales: su naturaleza conversacional y sus etiquetas de compatibilidad con endpoints permiten integrarlo en backends de chat multi-turno.
- Evaluacion e investigacion de post-entrenamiento: util para investigadores que estudian tecnicas de eficiencia de tokens en razonamiento, al ser un ajuste fino documentado sobre un base conocido.

## Benchmarks y rendimiento

La model card de este repositorio GGUF no incluye resultados de benchmarks. La busqueda web referencia comparativas externas entre Qwen3.8-27B, Swift 1.0 y Swift 1.5 en la pagina de UkisAI (https://ukisai.com/swift-1-5-27b) y en el repositorio ukisai/Swift-1.5-Qwen3.8-27b-INT4, pero los valores numericos concretos no estan disponibles en la informacion proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q5_K_M, el fichero GGUF ocupa aproximadamente 19,5 GB, por lo que se necesitan al menos ~20-22 GB de VRAM para cargar el modelo completo en GPU, mas espacio para el contexto KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para inferencia comoda con contexto amplio; RTX 4090 (24 GB) puede alojar el modelo Q5_K_M con contexto limitado.
- GPU de consumo: cabe en RTX 4090 y en GPUs con 24 GB o mas; en GPUs de 16 GB seria necesario bajar a cuantizaciones menores (no incluidas en este repositorio) o usar offload parcial a CPU.
- Despliegue: llama.cpp (llama-cli y llama-server documentados en la model card), y por extension cualquier frontend compatible con GGUF como Ollama o LM Studio. vLLM y TGI no soportan GGUF de forma nativa para este formato.
- Latencia y throughput: no disponibles. El ejemplo de la model card usa `-c 2048` como contexto de servidor, lo que sugiere que contextos mayores incrementan el consumo de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-high (este) | ~27,3 B | No disponible | swift-open-license-1.0 (gated) | GGUF Q5_K_M | Ajuste fino orientado a eficiencia de tokens y terminal |
| Qwen3.8-27B (base) | ~27 B | No disponible | No disponible | No disponible | Modelo fundacional sobre el que se ajusta Swift 1.5 |
| Swift 1.0 | No disponible | No disponible | No disponible | No disponible | Primera adaptacion de UkisAI, predecesora de Swift 1.5 |
| ukisai/Swift-1.5-Qwen3.8-27b-INT4 | ~27,3 B | No disponible | swift-open-license-1.0 | INT4 | Misma familia, cuantizacion INT4 oficial de UkisAI |

Los datos de rendimiento comparativo entre Qwen3.8-27B, Swift 1.0 y Swift 1.5 se anuncian en la web de UkisAI, pero los valores no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: swift-open-license-1.0 no es una licencia open source estandar; es necesario revisar sus terminos antes de cualquier uso comercial. El repositorio esta ademas marcado como gated.
- Sesgos: no documentados; al derivar de Qwen3.8-27B hereda los sesgos del corpus de entrenamiento del base, no cuantificados en la informacion disponible.
- Alucinacion: riesgo inherente a los modelos de razonamiento; el modo "efficient-thinking" podria reducir la profundidad de verificacion en algunos casos, aunque no hay datos que lo confirmen.
- Idiomas: no se especifica la cobertura linguistica; no asumir soporte de calidad en castellano sin evaluacion previa.
- Contexto: la longitud de contexto no esta documentada; el ejemplo de servidor de la model card usa solo 2048 tokens, lo que no garantiza ventanas largas.
- Multimodalidad: aunque el pipeline es image-text-to-text, no se detalla el adaptador visual ni su calidad; conviene validar antes de usar en produccion con imagenes.
- Repositorio de terceros: este GGUF lo ha generado michal-cb con la herramienta gguf-my-repo, no el autor original; la fidelidad de la conversion no esta verificada por UkisAI.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en produccion.

## Enlaces

- Repositorio Hugging Face (este GGUF): https://huggingface.co/michal-cb/Swift-1.5-Qwen3.8-27b-high-Q5_K_M-GGUF
- Modelo base del ajuste fino: https://huggingface.co/michal-cb/Swift-1.5-Qwen3.8-27b-high
- Variante INT4 oficial: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-INT4
- Pagina del modelo en UkisAI: https://ukisai.com/swift-1-5-27b
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Herramienta de conversion GGUF: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
