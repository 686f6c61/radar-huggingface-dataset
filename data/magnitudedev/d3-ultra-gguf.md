# magnitudedev/d3-ultra-GGUF

## Resumen

d3-ultra GGUF es una re-publicación en formato GGUF del modelo [vllm-sr/d3-ultra](https://huggingface.co/vllm-sr/d3-ultra), realizada por el usuario magnitudedev. Se trata de un modelo etiquetado como "decision model" dentro del ecosistema de [Magnitude](https://magnitude.run), una plataforma que utiliza modelos de lenguaje para tomar decisiones estructuradas (respuestas de tipo `noul`, `choice`, `score` y `box`) en flujos de trabajo automatizados. Los pesos son idénticos al modelo original; lo que añade este repositorio es la cuantización en varios niveles de GGUF y metadatos de decisión (`decision.*` y una plantilla de chat `tokenizer.chat_template.decision`) que permiten a Magnitude servir el modelo sin código específico.

El modelo base tiene 25.625.905.664 parámetros (aproximadamente 25,6 mil millones), lo que lo sitúa en la gama de modelos medianos-grandes. Incluye un proyector de visión (`mmproj-d3-ultra-BF16.gguf`), lo que indica capacidades multimodales de entrada visual. La licencia Apache-2.0 permite su uso comercial sin restricciones relevantes.

Su relevancia actual radica en la tendencia emergente de los "decision models": modelos optimizados no para conversación general, sino para emitir juicios binarios, puntuaciones, selecciones entre opciones o coordenadas espaciales, útiles en agentes, verificación de salidas de otros LLM y pipelines de automatización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer con proyector de vision, segun el archivo mmproj) |
| Parametros totales | 25.625.905.664 (~25,6 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF) y mmproj en BF16 |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (re-upload cuantizado; el modelo base vllm-sr/d3-ultra usa safetensors) |

## Arquitectura y entrenamiento

La informacion publica sobre la arquitectura interna de d3-ultra es escasa. Los datos disponibles indican que se trata de un modelo de unos 25,6 mil millones de parametros con capacidad multimodal, dado que el repositorio incluye un proyector de vision en BF16 (`mmproj-d3-ultra-BF16.gguf`), tipico de arquitecturas tipo vision-language (por ejemplo, del estilo LLaVA o Qwen-VL). No se ha publicado informacion sobre el numero de tokens de entrenamiento, composicion del dataset ni uso de tecnicas de alineacion como RLHF o DPO.

La innovacion principal de este re-upload no esta en la arquitectura sino en la integracion: se han anadido claves de metadatos `decision.*` y una plantilla de chat alternativa (`tokenizer.chat_template.decision`) extraidas de la configuracion, calibracion y codigo de referencia del modelo original. Estos metadatos permiten que Magnitude sirva el modelo a traves de sus endpoints `/v1/systemone` y `/v1/decisions` sin codigo especifico para el modelo, mientras que otros runtimes (llama.cpp, Ollama, etc.) simplemente los ignoran. Los pesos, salvo la cuantizacion, no han sido modificados.

## Capacidades

- Toma de decisiones estructurada: el modelo emite respuestas de tipo `noul` (probablemente aceptacion/rechazo binario), `choice` (seleccion entre opciones), `score` (puntuacion numerica) y `box` (coordenadas espaciales, probablemente cajas delimitadoras), expuestas via los endpoints de Magnitude `/v1/systemone` y `/v1/decisions`.
- Comprension visual: la inclusion de un proyector de vision en BF16 indica que el modelo puede procesar imagenes como entrada, coherente con la salida de tipo `box` (localizacion espacial).
- Conversacion: el repositorio esta etiquetado como `conversational`, aunque su proposito principal parece ser la evaluacion y decision mas que el chat general.
- Ejecucion local: al estar en formato GGUF con cuatro niveles de cuantizacion, puede ejecutarse en hardware de consumo con llama.cpp y runtimes compatibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Verificacion de salidas de agentes: dado que emite juicios binarios (`noul`) y puntuaciones, puede actuar como verificador o juez que valida si la respuesta de otro LLM cumple un criterio antes de aceptarla en un pipeline.
- Moderacion y filtrado de contenido: la capacidad de decision binaria y con puntuacion lo hace adecuado para clasificar contenido (apto/no apto, nivel de toxicidad) en flujos automatizados.
- Deteccion y localizacion visual: gracias al proyector de vision y al tipo de salida `box`, puede usarse para localizar elementos en imagenes (deteccion de UI, verificacion de capturas de pantalla en pruebas automatizadas de software).
- Seleccion entre alternativas en agentes: el modo `choice` permite que un agente elija entre varias acciones o herramientas disponibles, integrandose como paso de decision en sistemas multi-paso.
- Evaluacion automatica en pipelines de datos: puntuacion (`score`) de candidatos, respuestas o documentos dentro de procesos ETL o de anotacion semiautomatica.
- Ejecucion local en entornos sensibles: al estar disponible en GGUF hasta Q8_0, puede desplegarse on-premise para decisiones sobre datos que no pueden salir de la infraestructura del cliente.
- Integracion con Magnitude: uso directo via `/v1/systemone` y `/v1/decisions` sin necesidad de escribir codigo de servicio especifico, gracias a los metadatos de decision incluidos en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, sin contexto; el proyector de vision anade ~1-2 GB adicionales):
  - Q4_K_M: ~15-16 GB
  - Q5_K_M: ~18-19 GB
  - Q6_K: ~21-22 GB
  - Q8_0: ~27-28 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 5090, A100 40 GB o H100 para Q6_K y Q8_0 con contexto amplio.
- Consumer GPUs: cabe en una RTX 4090 de 24 GB con Q4_K_M o Q5_K_M; con tarjetas de 16 GB (RTX 4080/4060 Ti 16 GB) seria necesario offload parcial a CPU/RAM via llama.cpp.
- CPU puro: viable con maquinas con 32 GB de RAM o mas, aunque con latencias elevadas para un modelo de 25,6 B parametros.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LM Studio, y el servicio gestionado de Magnitude via `/v1/systemone` y `/v1/decisions`. No hay indicios de soporte directo en vLLM o TGI para esta version GGUF (aunque el modelo base safetensors podria ser compatible con vLLM).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Los "decision models" son una categoria emergente y no existe documentacion publica suficiente de alternativas directas del mismo ecosistema. Como referencia de contexto general para modelos de tamano similar multimodales:

| Modelo | Parametros | Multimodal | Licencia | Formato |
|---|---|---|---|---|
| d3-ultra (vllm-sr) | ~25,6 B | Si (mmproj) | Apache-2.0 | GGUF (este repo), safetensors (base) |
| Qwen2.5-VL-32B | 32 B | Si | Apache-2.0 | safetensors, GGUF comunitarios |
| Gemma 3 27B | 27 B | Si | Gemma (restricciones) | safetensors, GGUF oficiales |

Comparativa orientativa: d3-ultra se diferencia de estos modelos generales en su enfoque como decision model con metadatos de calibracion para salidas estructuradas, mientras que Qwen2.5-VL y Gemma 3 son modelos de proposito general con ecosistemas mucho mas documentados. Los datos de rendimiento comparativo no estan disponibles.

## Limitaciones y advertencias

- Documentacion muy escasa: no hay model card detallada del modelo base ni datos de entrenamiento, benchmarks ni longitud de contexto, lo que dificulta evaluarlo rigurosamente antes de produccion.
- Es un re-upload de terceros (magnitudedev), no el autor original: la procedencia y fidelidad de la cuantizacion dependen del re-publicador, aunque el README indica que los pesos no han cambiado salvo la cuantizacion.
- Riesgo de alucinacion: no disponible informacion especifica; al tratarse de un LLM, debe asumirse el riesgo estandar, especialmente si se usa como juez automatico sin validacion humana.
- Sesgos conocidos: no disponibles.
- Metadatos de decision propietarios de Magnitude: las claves `decision.*` y la plantilla `tokenizer.chat_template.decision` solo son utiles dentro del ecosistema Magnitude; otros runtimes las ignoran, por lo que el comportamiento de decision estructurada puede no reproducirse fuera de ese entorno sin trabajo adicional.
- Idiomas: no documentados; no se puede garantizar rendimiento en castellano.
- Licencia: Apache-2.0 no impone restricciones comerciales relevantes, pero conviene revisar el archivo `NOTICE` incluido en el repositorio.
- El resultado de busqueda web asociado a esta ficha no aportaba informacion relevante sobre el modelo (era contenido no relacionado).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/magnitudedev/d3-ultra-GGUF
- Modelo base: https://huggingface.co/vllm-sr/d3-ultra
- Magnitude (plataforma asociada): https://magnitude.run
- Paper, blog o demo: no disponibles
