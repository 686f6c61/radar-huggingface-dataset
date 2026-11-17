# hugging-mac/vela3.1-fast

## Resumen

Vela3.1-fast es un modelo de clasificación y etiquetado de texto (text-classification y token-classification) desarrollado por el usuario hugging-mac, que publica una conversión completa del modelo original vllm-sr/vela3.1-fast a un runtime propietario denominado Core AI, orientado a Apple Silicon. No se trata de un modelo generativo de propósito general, sino de un "backbone de decisión" con adaptadores de tarea que resuelve tareas estructuradas como NER, detección de PII, relaciones entre entidades, afirmaciones no soportadas y extracción de evidencia con probabilidades y offsets a nivel de carácter.

El paquete incluye todos los pesos originales en FP32, los grafos de inferencia y los adaptadores de tarea, y expone una API síncrona (`system_one` y `predict`) que preserva las estructuras de entrada/salida del modelo original: estado en texto o JSON, múltiples preguntas, opciones de elección, spans genéricos, NER, relaciones, PII, evidencia y probabilidades de respuesta. La conversión mantiene el tokenizador, el enrutado, los umbrales, la agregación por ventanas y la decodificación del modelo fuente.

Es relevante ahora porque demuestra una ruta de despliegue de modelos de clasificación estructurada fuera de PyTorch (el runtime no usa PyTorch para la inferencia neuronal) y porque conserva un límite de decisión de 32768 tokens con ventanas de esquema de 8192 tokens y solapamiento de 512, lo que permite procesar documentos largos en tareas de extracción. La validación publicada cubre 20 casos SDK de respuesta completa y diez comparaciones de componentes, con entradas exactas de 1024 y 2048 tokens; la ejecución completa a 32768 tokens no se ha sometido a pruebas de estrés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone de decisión y adaptadores de tarea (LoRA de dos proyecciones sin fusionar); inferencia en runtime Core AI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32768 tokens de límite de decisión; ventanas de esquema de 8192 tokens con solapamiento de 512; ventanas de evidencia de 32768 tokens |
| Tipos de cuantizacion | no disponible (los pesos se almacenan en FP32 y no se cuantizan) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; bundle Core AI con grafos y pesos en `coreai/` (tamaño del repo: 7.7 GB) |

## Arquitectura y entrenamiento

El modelo original vllm-sr/vela3.1-fast (revisión `0ed6ed301fbbf0c312f11a13ad17e3a6f8887262`) se compone de un backbone de decisión y varios adaptadores de tarea. La conversión publicada conserva el inventario exacto de tensores, las interfaces de grafo y todos los adaptadores, y mantiene LoRA en sus dos proyecciones originales, sin fusionar ni cuantizar los pesos. Las operaciones neuronales se ejecutan íntegramente en Core AI; los tensores FP32 se almacenan una sola vez bajo `weights/` y se cachean como entradas inmutables del runtime. Los grafos se comparten entre arquitecturas de adaptador compatibles y el runtime mantiene un solo componente residente a la vez para reducir el uso de memoria.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La model card indica que se reutilizan el renderizado, el enrutado, los umbrales, la tokenización, la agregación por ventanas y la decodificación originales, y que las dimensiones de lote, secuencia, pregunta, opción, unidad de palabra y etiqueta son dinámicas. PyTorch se importa en el código anfitrión aguas arriba, pero no se usa para la inferencia neuronal en este runtime.

## Capacidades

- Clasificación de texto y etiquetado de tokens (pipeline text-classification y token-classification).
- Reconocimiento de entidades nombradas (NER) con offsets de carácter y puntuaciones.
- Detección de información personal identificable (PII) mediante spans con criterios configurables, por ejemplo `EMAIL_ADDRESS`.
- Extracción de relaciones entre entidades, con la opción `entity_route='span'` heredada del pipeline de relaciones original.
- Detección de afirmaciones no soportadas y extracción de evidencia con ventanas de 32768 tokens.
- Preguntas de elección y de tipo "noul", con probabilidades de respuesta, umbrales y errores estructurados.
- Enrutado integrado de elección y conjunto (router choice/set) y soporte de estado en texto o JSON con múltiples preguntas.
- API síncrona (`system_one`, `predict`); las aplicaciones asíncronas deben invocarla desde un hilo trabajador.
- No se documentan capacidades de generación libre, razonamiento multi-paso, tool calling, visión ni audio.

## Casos de uso

- Redacción y anonimización de PII en documentos: el modelo detecta spans de correo electrónico, y por extensión otros criterios configurados, con offsets de carácter y puntuaciones, lo que permite sustituir o enmascarar datos personales antes de almacenar o compartir textos.
- Extracción de entidades en contratos y facturas: el adaptador NER devuelve entidades con posición exacta, adecuado para pipelines de digitalización documental que necesitan localizar nombres, importes o fechas en el texto original.
- Moderación y verificación de afirmaciones: la detección de afirmaciones no soportadas y la extracción de evidencia permiten señalar fragmentos de un documento que respaldan o contradicen una aserción, útil en revisión de contenidos y compliance.
- Enrutado de consultas en atención al cliente: el router choice/set integrado clasifica la consulta entrante en una categoría o conjunto de categorías, lo que permite dirigir tickets al equipo adecuado sin un modelo generativo adicional.
- Extracción de relaciones en bases de conocimiento: el pipeline de relaciones identifica vínculos entre entidades detectadas, aprovechable para construir grafos de conocimiento a partir de corpus textuales.
- Procesamiento de documentos largos por ventanas: con ventanas de esquema de 8192 tokens y solapamiento de 512, el modelo puede analizar secciones extensas manteniendo coherencia entre fragmentos en tareas de clasificación y extracción.
- Validación local en Apple Silicon: el bundle Core AI permite ejecutar la inferencia en CPU sin PyTorch, lo que facilita prototipos y validaciones en entornos macOS antes de desplegar en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta validación funcional: 20 casos SDK de respuesta completa y diez comparaciones de componentes superados, con entradas exactas de 1024 y 2048 tokens; la ejecución completa a 32768 tokens no se ha sometido a pruebas de estrés. No se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 7.7 GB e incluye pesos FP32 y grafos; el runtime mantiene un solo componente residente a la vez.
- GPU recomendadas: no disponible. La validación se realizó en CPU (`device="cpu"`); Core AI GPU/ANE, el preprocesado en Swift y la ejecución en iOS no se declaran como probados.
- Compatibilidad con GPU de consumo: no confirmada. El modelo está etiquetado para Apple Silicon y el runtime Core AI, pero la validación publicada es en CPU.
- Opciones de despliegue: SDK de Hugging Mac (`hugging_mac_sdk.models.vela.full.VelaFullCoreAI`) con los extras `vela` y `coreai`; el entorno de conversión bloqueado del repositorio usa `uv` con `USE_OS_COREAI=1`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La API es síncrona y conviene invocarla desde un hilo trabajador en aplicaciones asíncronas.
- Es obligatorio descargar el bundle completo (`coreai/*`), incluidos `weights/` y todos los directorios de grafos; no basta con el grafo de decisión.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificación estructurada con adaptadores de NER, PII y relaciones) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni razona de forma multi-paso; su salida son etiquetas, spans, relaciones, probabilidades y offsets.
- La ejecución completa a 32768 tokens no se ha sometido a pruebas de estrés; solo se validaron entradas de 1024 y 2048 tokens, y puede agotarse la memoria en tamaños grandes.
- Core AI GPU/ANE, el preprocesado en Swift y la ejecución en iOS no están probados; la validación se limita a CPU.
- El runtime no usa PyTorch para la inferencia neuronal, pero el código anfitrión aguas arriba lo importa, lo que puede afectar al empaquetado y a las dependencias del despliegue.
- El cargador `VelaFullCoreAI` es nuevo y puede no existir en wheels publicados con anterioridad; se recomienda usar el SDK fuente actual o un wheel construido a partir de él.
- No se dispone de información sobre sesgos, riesgo de alucinación en las etiquetas ni cobertura lingüística; los idiomas soportados figuran como no disponibles.
- La licencia es Apache 2.0, que permite uso comercial, pero conviene revisar las condiciones del modelo base vllm-sr/vela3.1-fast y de las dependencias del SDK.
- El repositorio registra 0 descargas y 0 likes, y la validación es funcional, no comparativa; no hay evidencia pública de rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hugging-mac/vela3.1-fast
- Modelo base original: https://huggingface.co/vllm-sr/vela3.1-fast
- Informe de evaluación: `coreai/EVALUATION.md` dentro del repositorio
- Resultados legibles por máquina: `coreai/evaluation.json` dentro del repositorio
- Manifiesto de construcción: `coreai/build.json` dentro del repositorio
- README en chino: `README.zh-CN.md` dentro del repositorio
