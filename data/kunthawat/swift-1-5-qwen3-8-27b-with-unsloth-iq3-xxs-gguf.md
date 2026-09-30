# kunthawat/swift-1.5-qwen3.8-27b-with-unsloth-iq3-xxs-gguf

## Resumen

Swift-1.5-Qwen3.8-27B-with-Unsloth-IQ3_XXS-GGUF es una cuantizacion GGUF de la comunidad, publicada por el usuario kunthawat, a partir del checkpoint BF16 ukisai/Swift-1.5-Qwen3.8-27b. Swift 1.5 es la adaptacion de UkisAI sobre Qwen3.8-27B, un modelo hibrido de razonamiento orientado a codigo agentico y chat, con soporte multimodal mediante un proyector de vision y pesos de prediccion multi-token (MTP) que habilitan decodificacion especulativa. Esta build aplica una mezcla de cuantizacion tensor a tensor reconstruida a partir de la referencia publica UD-IQ3_XXS de Unsloth, conservando los pesos MTP originales de Swift 1.5 y sin recuantizar de GGUF a GGUF.

El objetivo declarado por el autor es ofrecer un perfil de inferencia listo para usar en una unica GPU de 16 GB (RTX 5060 Ti), cubriendo sesiones largas de asistente, trabajo de marketing y web, y revision de imagenes y documentos a traves de Hermes y llama.cpp. Los dos archivos del repositorio (pesos GGUF y proyector de vision F16) suman aproximadamente 11,05 GiB y el modelo declara un contexto arquitectonico de 262.144 tokens.

Es relevante porque reune tres elementos poco habituales en un paquete GGUF de comunidad: vision, cuantizacion mixta IQ3_XXS y MTP para decodificacion especulativa, todo ejecutable en hardware de consumo con llama.cpp. El repositorio es de septiembre de 2026, acumula 5 descargas y 0 "likes", y la unica evidencia publica de rendimiento es una ejecucion local de GPQA Diamond realizada por el propio autor, no una evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B (modelo hibrido de razonamiento); incluye proyector de vision y cabezas MTP. Detalle interno de capas: no disponible |
| Parametros totales | 460.730.096 segun los metadatos de safetensors del repositorio; el nombre del modelo y el tamano del repo (11,9 GB) indican ~27.000 millones. Dato inconsistente |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens en los metadatos del modelo (limite arquitectonico, no garantia de que una peticion de 262K quepa en 16 GB) |
| Tipos de cuantizacion | IQ3_XXS con mezcla tensor a tensor; 866 tensores, 15 de ellos MTP. Existen tambien variantes IQ3_S-mtp e INT4 en repositorios de UkisAI |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-v1.0-apache-2.0 (license: other) |
| Formato de pesos | GGUF (pesos del modelo + mmproj F16 separado para entrada de imagen) |

## Arquitectura y entrenamiento

El modelo subyacente, Qwen3.8-27B, se describe como un modelo abierto hibrido de razonamiento ("thinking") para codigo agentico y chat. Swift 1.5 es una derivada de UkisAI orientada a eficiencia de razonamiento: segun la documentacion del autor, usa un 58,5% menos de tokens de pensamiento que el modelo base y obtiene una puntuacion un 0,35% superior, lo que se traduce en una aceleracion de 9,18x en varias tareas. Segun UkisAI, tanto Qwen3.8-27B como Swift 1.5 se evaluan con los mismos protocolos guardados y los resultados son agregados de cinco repeticiones.

Esta ficha concreta no es un fine-tune nuevo, sino una cuantizacion de inferencia. El autor conserva los pesos MTP ya presentes en el checkpoint Swift 1.5 (15 tensores MTP) y no copia pesos MTP del Qwen de serie. La cuantizacion se reconstruye a partir de la referencia publica UD-IQ3_XXS del repositorio de Unsloth, usando su importance matrix publica, pero no reproduce ni reclama la receta privada Dynamic V3 de Unsloth. El proyector de vision de Qwen3.8 es un archivo independiente que debe cargarse junto al GGUF para aceptar imagenes. Los datos exactos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

La innovacion tecnica destacable es la combinacion de decodificacion especulativa por MTP (perfil MTP-2) con una cuantizacion mixta de tipo IQ3_XXS, en un paquete que incluye vision y cabe en una GPU de 16 GB.

## Capacidades

- Generacion de texto y razonamiento en modo hibrido "thinking", con presupuesto de razonamiento configurable (el autor uso 12.288 tokens en su ejecucion de GPQA).
- Codigo y flujos agenticos, segun la descripcion del modelo base Qwen3.8-27B.
- Razonamiento cientifico de nivel avanzado: la ejecucion publicada sobre GPQA Diamond (198 preguntas de nivel posgrado) obtuvo un 70,71% en puntuacion flexible.
- Multimodalidad de imagen a texto: el repositorio incluye el proyector de vision mmproj en F16 y la pipeline declarada es image-text-to-text.
- Revision de imagenes y documentos: el autor reporta uso con imagenes grandes o multiples en flujos Hermes sin OOM en 16 GB (reporte de uso propio, no un test de estres reproducible).
- Decodificacion especulativa mediante MTP (perfil MTP-2 probado) para acelerar la generacion.
- Plantilla de chat embebida en el modelo; el autor dispone ademas de una plantilla Qwen-Sharp propia que no se incluye en el repositorio.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Asistente local en una GPU de consumo: con ~11,05 GiB de pesos en IQ3_XXS y proyector F16, el modelo cabe en una RTX 5060 Ti de 16 GB junto con una cache K/V Q4_0, lo que permite desplegar un asistente multimodal sin depender de la nube.
- Revision de imagenes y documentos: la carga del proyector de vision permite enviar capturas, diagramas o documentos escaneados y obtener descripciones o analisis en texto; el autor valida un caso de una imagen a 4K de contexto.
- Razonamiento tecnico y cientifico: los 198 items de GPQA Diamond se responden con un presupuesto de razonamiento de 12.288 tokens, un perfil adecuado para preguntas de nivel posgrado en fisica, quimica y biologia.
- Sesiones largas de asistente: con un contexto configurado de 100K tokens y una sola ranura activa, el modelo mantiene hilos conversacionales extensos sin perder el historial reciente, a costa de consumir casi toda la VRAM disponible (14.630 MiB de 16.311 MiB medidos).
- Generacion de codigo en pipelines locales: al ser un derivado de un modelo orientado a codigo agentico, encaja en tareas de autocompletado, refactorizacion y generacion de tests dentro de un servidor llama.cpp accesible en localhost.
- Redaccion de marketing y contenido web: el autor usa el modelo para trabajo de marketing y sitios web; es un caso de uso declarado por el propietario, no un benchmark estandarizado.
- Despliegue con decodificacion especulativa: activando MTP-2 se obtiene una generacion media de 49,47 tok/s en una RTX 5060 Ti, una cifra util para asistentes interactivos en hardware de gama media.
- Entornos con restricciones de conectividad: al ser un GGUF servido por llama.cpp en localhost, permite trabajar con datos sensibles sin salida a Internet.

## Benchmarks y rendimiento

El unico resultado de benchmarks disponible es una ejecucion local del autor sobre GPQA Diamond, con semilla unica, llama.cpp b10909, contexto configurado de 100.000 tokens, una ranura activa, cache K/V y de borrador en Q4_0, MTP-2 y proyector de vision cargado en CUDA1. Las peticiones no contenian imagenes.

| Metrica | Resultado |
|---|---|
| GPQA Diamond (puntuacion flexible) | 140/198 (70,71%) |
| GPQA Diamond (puntuacion estricta) | 32/198 (16,16%) |
| Procesamiento medio de prompt | 428,47 tok/s |
| Generacion media | 49,47 tok/s |
| Tiempo medio por pregunta | 92,33 s |
| Pico de VRAM muestreado | 14.630 MiB de 16.311 MiB |

Notas: una respuesta no se pudo parsear y otra alcanzo el limite de salida. La ejecucion uso la plantilla de chat Qwen-Sharp del autor, no incluida en el repositorio, por lo que los resultados pueden diferir con la plantilla embebida. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~11,05 GiB solo para pesos (10,18 GiB del GGUF principal + 0,864 GiB del proyector F16). Con contexto de 100K y cache K/V Q4_0, el autor midio un pico de 14.630 MiB en una GPU de 16 GB.
- GPU recomendadas: RTX 5060 Ti 16 GB (perfil validado por el autor), RTX 4080/4090 24 GB, RTX 5090, A100 y H100 para contextos mas largos o concurrencia.
- Cabe en GPU de consumo: si, en cualquier tarjeta con al menos 16 GB de VRAM si se mantiene una unica ranura y se limita el contexto. En GPUs de 12 GB o menos no cabria el perfil probado.
- Opciones de despliegue: llama.cpp (build b10909 o superior, con soporte de Qwen3.8/Qwen3.5 GGUF, proyectores de vision y MTP), servidor `llama serve` accesible en localhost, y en general cualquier runtime compatible con GGUF (Ollama, LM Studio). El soporte de GGUF en vLLM y TGI es limitado; no esta confirmado en la informacion disponible.
- Latencia y throughput: 428,47 tok/s de procesamiento de prompt y 49,47 tok/s de generacion en una RTX 5060 Ti 16 GB con MTP-2 y contexto de 100K. No hay mediciones en otras GPUs.
- Configuracion de muestreo sugerida por el autor: temperatura 1, top-k 20, top-p 0,95, min-p 0, penalizacion de presencia 0, penalizacion de repeticion 1.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kunthawat/swift-1.5-qwen3.8-27b-with-unsloth-iq3-xxs-gguf (esta ficha) | ~27B (nombre); 460.730.096 en metadatos de safetensors | 262.144 tokens (metadatos) | GPQA flexible 70,71% en una ejecucion local de una semilla | swift-open-license-v1.0-apache-2.0 | GGUF, 11,9 GB, 5 descargas |
| ukisai/Swift-1.5-Qwen3.8-27b (checkpoint BF16 de origen) | 27B | no disponible en la informacion | Segun UkisAI, usa un 58,5% menos de tokens de pensamiento que el base y puntua un 0,35% mas, con 9,18x de aceleracion en varias tareas | swift-open-license-v1.0-apache-2.0 | Pesos completos en HuggingFace |
| Qwen3.8-27B (modelo base) | 27B | no disponible en la informacion | Referencia de comparacion en las evaluaciones de UkisAI, con protocolos identicos y agregados de cinco repeticiones; puntuaciones concretas no disponibles | no disponible en la informacion | Repositorio GGUF de Unsloth |
| ukisai/Swift-1.5-Qwen3.8-27b-INT4 | 27B | no disponible | Comparado con Qwen3.8-27B bajo el mismo protocolo; puntuaciones concretas no disponibles | swift-open-license-v1.0-apache-2.0 | Pesos INT4 en HuggingFace |

No hay datos publicos de benchmarks comparativos entre esta cuantizacion concreta y alternativas de la misma categoria. Las cifras de UkisAI corresponden a Swift 1.5 como modelo, no a esta build IQ3_XXS.

## Limitaciones y advertencias

- Evidencia muy limitada: 5 descargas, 0 "likes" y una unica ejecucion de benchmark realizada por el propio autor, con una sola semilla. No es una evaluacion independiente.
- Resultado estricto bajo en GPQA: 16,16% frente al 70,71% flexible, lo que indica problemas de formato o de cumplimiento estricto en las respuestas y sugiere que una respuesta de cada 198 no se pudo parsear y otra alcanzo el limite de salida.
- Discrepancia en el recuento de parametros: los metadatos de safetensors declaran 460.730.096 parametros, incompatible con la denominacion "27B" y con el tamano del repositorio. Conviene verificar el modelo antes de integrarlo en produccion.
- Riesgo de alucinacion: no se documenta ningun mecanismo especifico de mitigacion; como modelo de razonamiento generativo, es susceptible a errores factuales, especialmente en tareas sin verificacion externa.
- Memoria: el autor advierte que ninguna cuantizacion puede garantizar que un numero arbitrario de imagenes a resolucion completa junto con un prompt de longitud maxima quepa en la GPU. El numero de imagenes, la resolucion, la longitud del prompt, el presupuesto de salida y otros procesos de la GPU afectan al consumo.
- La prueba de vision publica es mas estrecha que el uso declarado: solo se verifico un caso de una imagen a 4K de contexto; la ejecucion de 100K en GPQA cargo el proyector pero no envio imagenes.
- Plantilla de chat: el autor uso su plantilla Qwen-Sharp, no incluida en el repositorio. Los resultados con la plantilla embebida pueden diferir.
- Idiomas soportados: no disponibles.
- Licencia: swift-open-license-v1.0-apache-2.0, marcada como `license: other`. No es una licencia Apache 2.0 estandar, por lo que conviene revisar el archivo LICENSE antes de un uso comercial.
- Nomenclatura: "with Unsloth IQ3_XXS" hace referencia a las referencias publicas de cuantizacion empleadas, no implica que sea un modelo oficial de Unsloth.
- Uso en produccion: el perfil probado es de una sola peticion simultanea. No hay datos de concurrencia, throughput agregado ni estabilidad en despliegues multi-ranura.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kunthawat/swift-1.5-qwen3.8-27b-with-unsloth-iq3-xxs-gguf
- Modelo base (checkpoint BF16): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Repositorio GGUF de referencia de Unsloth (Qwen3.8-27B): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Pagina de Unsloth sobre Qwen3.8-27B: https://unsloth.ai/models/qwen3.8-27b
- Pagina de UkisAI con la comparativa Qwen3.8-27B / Swift 1.0 / Swift 1.5: https://ukisai.com/swift-1-5-27b
- Catalogo de modelos de UkisAI: https://ukisai.com/models
- Swift-1.5-Qwen3.8-27b-INT4: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b-INT4
- Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Archivo IQ3_S-mtp dentro del repositorio GSQ-RCO: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF/blob/main/Swift-1.5-Qwen3.8-27B-GSQ-RCO-IQ3_S-mtp.gguf
