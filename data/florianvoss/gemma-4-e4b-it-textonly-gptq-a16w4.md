# florianvoss/Gemma-4-E4B-it-TextOnly-GPTQ-a16w4

# Gemma-4-E4B-it-TextOnly-GPTQ-a16w4

## Resumen

Gemma-4-E4B-it-TextOnly-GPTQ-a16w4 es un paquete de ejecución compilado, publicado por el usuario florianvoss, del modelo Gemma-4-E4B-it en su variante solo texto. No se distribuye como checkpoint cargable con Transformers, sino como un runtime desempaquetado destinado al SoC SiMa Modalix y al runtime LLiMa. El paquete se ha compilado a partir de simaai/Gemma-4-E4B-it-TextOnly-GPTQ-Safetensors, que a su vez deriva de google/gemma-4-E4B-it, y se publica dentro de la colección de validación Neat 0.6.0.

El problema que resuelve es la brecha entre un modelo cuantizado en formato GPTQ y su ejecución real sobre aceleradores de borde: el repositorio contiene 214 ejecutables MLA, configuración de runtime, tokenizer, embeddings y escalas, de modo que el artefacto se despliega directamente con el comando `llima run`. La compilación usa el SDK de modelo 3.0.0 y la API nativa ModelGraph, con recompilación de los 214 componentes, división forzada de MLP en los 41 componentes de lenguaje posteriores a N128 y compartición de filtros activada por defecto.

La relevancia del paquete es doble: por un lado, incorpora el grafo corregido de caché deslizante agrupada procedente de LLiMa PR #295, que arregla el prefill con ventana de atención de 512 tokens y tamaño de grupo n128; por otro, es un ejemplo de empaquetado específico para hardware, con cuantización GPTQ simétrica INT4 de pesos (grupo 256, act-order estático), activaciones BF16 y embeddings y caché KV en INT8. La longitud de contexto configurada es de 4.096 tokens. Las capacidades de generación del modelo subyacente, sus idiomas y su número de parámetros no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo subyacente Gemma-4-E4B-it, solo texto; el paquete compila 214 componentes con la API ModelGraph y aplica división de MLP en 41 componentes de lenguaje posteriores a N128) |
| Parametros totales | no disponible (la nomenclatura "E4B" del modelo de origen sugiere un orden de magnitud de 4.000 millones de parámetros efectivos, pero este dato no se confirma en la información proporcionada) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | 4.096 tokens, con ventana de atención deslizante de 512 tokens |
| Tipos de cuantizacion | Pesos: GPTQ simétrico INT4, tamaño de grupo 256, act-order estático. Activaciones: BF16. Embeddings y caché KV: INT8. Denominación del paquete: a16w4 |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use; se heredan los términos del modelo de origen google/gemma-4-E4B-it) |
| Formato de pesos | Ejecutables MLA (ficheros ELF) más artefactos de runtime: `devkit/` (configuración de runtime, tokenizer, embeddings y escalas), `elf_files/` (214 ejecutables MLA) y `compilation.json`. No es safetensors cargable ni GGUF |
| Tamano del repositorio | 8,7 GB |
| Tamano de grupo de prefill | 128 |
| SDK de modelo | 3.0.0 |
| Revision de origen LLiMa | `d1b9bc85a2efde593d06667ac4d919dd410662fc` |
| Hardware objetivo | SiMa Modalix, con runtime LLiMa compatible |

## Arquitectura y entrenamiento

El modelo subyacente es google/gemma-4-E4B-it, en su variante solo texto, del que no se proporcionan datos de arquitectura detallados, número de tokens de entrenamiento, composición del corpus ni si hubo etapas de RLHF o DPO. Lo que sí está documentado es la cadena de derivación: google/gemma-4-E4B-it da lugar a simaai/Gemma-4-E4B-it-TextOnly-GPTQ-Safetensors, que se compila en este paquete. El sufijo "it" indica que se trata de una variante ajustada para instrucciones.

La innovación técnica documentada está en la capa de compilación y de ejecución, no en el entrenamiento. El paquete se reconstruyó íntegramente con la API nativa ModelGraph del SDK 3.0.0, con los 214 componentes recompilados, compartición de filtros activada por defecto para los componentes de lenguaje y división de MLP forzada en los 41 componentes posteriores a N128 (las etapas N1 se mantienen sin cambios). Incluye el grafo corregido de caché deslizante agrupada de LLiMa PR #295: para la ventana de atención de 512 tokens y el prefill n128 utiliza las posiciones lógicas de KV 511 y 639, con una máscara estática que asigna a cada fila de consulta su ventana completa, sin necesidad de una entrada de máscara adicional en tiempo de ejecución. La validación reportada consiste en compilación completa con código de salida 0, comprobación en simulador de las 41 sustituciones N128 posteriores, verificación de sumas de comprobación de los ELF y despliegue de los 214 ficheros con los activos de runtime; la generación en Modalix y las comparaciones de prompt largo antes/después no se han ejecutado todavía para este paquete.

## Capacidades

- Generación de texto en modo solo texto: el paquete es una variante TextOnly, sin componentes de visión ni audio.
- Ajuste para instrucciones: deriva de una variante "-it", por lo que se orienta a seguir indicaciones y mantener conversación.
- Contexto de 4.096 tokens con atención deslizante de 512 tokens, adecuado para ventanas moderadas y cargas de trabajo de borde.
- Ejecución compilada sobre hardware SiMa Modalix mediante el runtime LLiMa, con pesos INT4 y caché KV en INT8.
- Capacidad de tool calling o function calling: no disponible en la información proporcionada.
- Capacidad de agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se enumeran idiomas soportados.
- Modo de razonamiento explícito (thinking), visión o audio: no disponibles.
- Inferencia con Transformers: no soportada; la model card indica explícitamente que no es un checkpoint safetensors cargable y que `inference: false`.

## Casos de uso

- Despliegue de generación de texto en el borde con SiMa Modalix: el paquete está pensado para ejecutarse con `llima run` sobre este SoC, sin depender de GPU de centro de datos; encaja en productos que requieren inferencia local por latencia, coste o privacidad.
- Procesamiento local de documentos de hasta 4.096 tokens: resumen, extracción de campos y clasificación de textos que quepan en la ventana configurada, ejecutados íntegramente en el dispositivo.
- Asistentes conversacionales embebidos en dispositivos: al ser una variante ajustada para instrucciones y con caché KV en INT8, permite mantener diálogos multi-turno con huella de memoria reducida para hardware empotrado.
- Preprocesado o enrutado de consultas en una arquitectura híbrida borde-nube: el modelo puede generar respuestas cortas o clasificar intenciones en el dispositivo y derivar solo los casos complejos a un modelo mayor alojado en servidor.
- Validación de pipelines de compilación para ModelGraph y LLiMa: sirve como artefacto de referencia para verificar que el grafo corregido de caché deslizante agrupada (PR #295) produce el comportamiento esperado con ventana de 512 tokens y prefill n128.
- Pruebas de regresión de cuantización GPTQ INT4 con activaciones BF16: al fijar grupo 256 y act-order estático, el paquete permite comparar la fidelidad de salida frente al checkpoint GPTQ en safetensors del que deriva.
- Evaluación de compromiso memoria-calidad en aceleradores de borde: con embeddings y caché KV en INT8 y pesos INT4, es un punto de referencia para medir cuánta calidad se pierde frente a una ejecución en BF16.
- Integración en flujos de generación aumentada por recuperación (RAG) en local: con contexto de 4.096 tokens y ejecución en dispositivo, admite inyectar fragmentos recuperados de un índice local para responder consultas sobre documentación propia.
- Despliegue reproducible en flotas de dispositivos: la estructura `devkit/` más `elf_files/` más `compilation.json` facilita empaquetar y versionar el artefacto exacto que se despliega en cada unidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la validación de compilación (código de salida 0, 41 sustituciones N128 verificadas en simulador, sumas de comprobación de los 214 ELF confirmadas y despliegue de activos verificado) y señala explícitamente que no se han ejecutado pruebas de generación en Modalix ni comparaciones de prompt largo antes/después para este paquete.

## Requisitos de hardware

- Hardware objetivo: SiMa Modalix. El paquete no está pensado para GPU de propósito general ni para CPU convencional.
- Runtime: LLiMa, en una versión que incluya la misma corrección de sliding-prefill; de lo contrario no se obtiene el comportamiento corregido del grafo de caché deslizante.
- Almacenamiento: 8,7 GB de repositorio, que incluyen los 214 ejecutables MLA y los activos de runtime.
- Memoria: no disponible con precisión. Como referencia de orden de magnitud, la cuantización declarada (a16w4: pesos INT4, activaciones BF16, embeddings y caché KV en INT8) reduce la huella de pesos aproximadamente a la cuarta parte respecto a BF16, pero no se dispone del número de parámetros, del número de capas ni de la geometría de atención necesarios para calcular la memoria total.
- GPU recomendadas: no aplicable; no se documenta soporte para A100, H100, RTX 4090 ni otras GPU.
- Compatibilidad con GPU de consumo: no disponible; el artefacto no es cargable en ese tipo de entornos.
- Opciones de despliegue: `hf download florianvoss/Gemma-4-E4B-it-TextOnly-GPTQ-a16w4 --local-dir Gemma-4-E4B-it-TextOnly-GPTQ-a16w4` seguido de `llima run ./Gemma-4-E4B-it-TextOnly-GPTQ-a16w4`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Relacion | Parametros | Contexto | Cuantizacion / formato | Licencia | Cargable en Transformers |
|---|---|---|---|---|---|---|
| florianvoss/Gemma-4-E4B-it-TextOnly-GPTQ-a16w4 | Paquete compilado para SiMa Modalix (LLiMa) | no disponible | 4.096 tokens (ventana deslizante 512) | Pesos INT4 GPTQ (grupo 256, act-order), activaciones BF16, embeddings y KV INT8; ELF MLA | gemma | No |
| simaai/Gemma-4-E4B-it-TextOnly-GPTQ-Safetensors | Modelo de origen del que se compila este paquete | no disponible | no disponible | GPTQ en safetensors | gemma | Sí (safetensors GPTQ) |
| google/gemma-4-E4B-it | Modelo original del que deriva toda la cadena | no disponible | no disponible | Pesos originales del modelo base | gemma | Sí |
| Paquetes GGUF del mismo modelo para llama.cpp | Alternativa de despliegue en borde con CPU/GPU de consumo | no disponible | no disponible | GGUF con distintos niveles de cuantización | gemma | No (requiere llama.cpp/Ollama) |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un checkpoint cargable con Transformers: la model card lo describe como un paquete de runtime desempaquetado y marca `inference: false`. Intentar cargarlo como safetensors fallará.
- Dependencia estricta de hardware y runtime: requiere SiMa Modalix y un runtime LLiMa con la corrección de sliding-prefill. Sin esa versión del runtime no se obtiene el comportamiento corregido.
- Validación incompleta: la generación en Modalix y las comparaciones de prompt largo antes/después no se han ejecutado para este paquete. La validación reportada se limita a compilación, comprobaciones en simulador, sumas de comprobación de los ELF y despliegue de activos.
- Sin benchmarks publicados de calidad, latencia o throughput para este artefacto.
- Contexto limitado a 4.096 tokens, con ventana de atención deslizante de 512 tokens; no es adecuado para documentos largos sin estrategias de fragmentación.
- Idiomas soportados no documentados, por lo que no hay garantía de cobertura multilingüe ni de calidad fuera de los idiomas del modelo de origen.
- Cuantización agresiva (pesos INT4 con grupo 256 y act-order estático): puede degradar la calidad respecto al modelo en BF16 y no se aportan métricas de esa pérdida.
- Riesgo de alucinación: inherente a los modelos generativos de este tipo; no se documentan mecanismos de mitigación ni datos de evaluación de veracidad.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgo, toxicidad o seguridad para este paquete.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use y a las restricciones de uso y política de usos prohibidos de Google, con obligaciones de propagación de términos a terceros. Conviene verificar el texto completo de la licencia antes de un despliegue en producción; no se detalla en la información proporcionada.
- Sin tracción comunitaria: 0 descargas y 0 me gusta en el momento de la consulta, y creado y actualizado el mismo día, por lo que no existe validación externa ni informes de uso en producción.
- Trazabilidad de la cadena de cuantización: al derivar de un GPTQ en safetensors y no del modelo original, los posibles errores de cuantización de la etapa intermedia se heredan en el paquete compilado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/florianvoss/Gemma-4-E4B-it-TextOnly-GPTQ-a16w4
- Modelo base (GPTQ en safetensors): https://huggingface.co/simaai/Gemma-4-E4B-it-TextOnly-GPTQ-Safetensors
- Modelo original: https://huggingface.co/google/gemma-4-E4B-it
- Pull request de LLiMa con la corrección de sliding-prefill: https://github.com/sima-neat/llima/pull/295
- Repositorio LLiMa: https://github.com/sima-neat/llima

La búsqueda web realizada no devolvió resultados relevantes sobre el modelo (los resultados obtenidos corresponden a servicios de correo electrónico y no guardan relación con el artefacto).
