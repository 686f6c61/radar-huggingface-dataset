# danyalmalik/Llama-3.2-3B-Instruct-ONNX-WebGPU

## Resumen

Llama-3.2-3B-Instruct-ONNX-WebGPU es una conversion del modelo meta-llama/Llama-3.2-3B-Instruct a formato ONNX, empaquetada para ejecutarse directamente en el navegador mediante el backend WebGPU de ONNX Runtime Web. La publica el usuario danyalmalik y sigue el formato de decoder de ONNX Runtime GenAI (`input_ids`, `attention_mask`, `past_key_values.*` → `logits`, `present.*`), generado con el exportador propio de Quick Inference a partir de la copia sin gating unsloth/Llama-3.2-3B-Instruct. El modelo base es un transformer decoder-only denso de 3.210 millones de parametros con ventana de contexto de 128.000 tokens, disenado por Meta para instrucciones, resumen, reescritura y uso de herramientas.

El interes de esta ficha no esta en el modelo base, sino en el pipeline de despliegue: las capas lineales estan cuantizadas a 4 bits (round-to-nearest, tamano de bloque 32), mientras que embeddings, activaciones y cache KV se mantienen en float16; ademas, la capa de salida comparte tabla de 4 bits con los embeddings por estar atados. El paquete incluye una cabeza borrador EAGLE-3 en `draft/` (derivada de thoughtworks/Llama-3.2-3B-Instruct-Eagle3) para decodificacion especulativa: el borrador propone tokens a partir de las activaciones residuales expuestas en la salida extra `eagle_taps`, y el modelo principal verifica cada propuesta, de modo que la salida final es la del modelo y no la del borrador.

Es relevante ahora porque permite inferencia de un LLM de 3B en hardware de consumo sin servidor, con privacidad total de los datos (nada sale del cliente) y sin instalacion, a costa de una perdida de calidad por cuantizacion y de las limitaciones de memoria y compatibilidad de WebGPU. No hay resultados de benchmarks publicados para esta conversion ni un pipeline declarado en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) con GQA, RoPE y SwiGLU; exportado al layout de decoder de ONNX Runtime GenAI |
| Parametros totales | 3.210 millones (cifra del modelo base meta-llama/Llama-3.2-3B-Instruct) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128.000 tokens en el modelo base; el limite efectivo en navegador depende de la memoria disponible para la cache KV en float16 (no documentado en esta conversion) |
| Tipos de cuantizacion | Pesos de capas lineales, capa de salida y cabeza borrador en 4 bits (round-to-nearest, block size 32); embeddings, activaciones y cache KV en float16 |
| Idiomas soportados | Los del modelo base: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes (no declarados en la model card de esta conversion) |
| Licencia | Llama 3.2 Community License (incluye LICENSE, NOTICE y USE_POLICY.md) |
| Formato de pesos | ONNX (modelo principal + cabeza borrador EAGLE-3 en `draft/`); repositorio de 3,0 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso con atencion de consultas agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios; la model card indica que en esta exportacion el rotary embedding se aplica dentro del nodo `GroupQueryAttention` de ONNX Runtime. La exportacion anade una salida extra, `eagle_taps`, que concatena el flujo residual a la entrada de tres capas (la 2, la N/2 y la N-3); esa señal alimenta la cabeza EAGLE-3 de `draft/`, cuyas matrices tambien estan cuantizadas a 4 bits y que mantiene su propia cache KV estatica, devolviendo la propuesta como un token id.

Sobre el entrenamiento del modelo original: la informacion disponible no detalla el numero de tokens, la composicion del dataset ni las fases de alineacion (RLHF/DPO) empleadas por Meta; esos datos deben consultarse en la model card de meta-llama/Llama-3.2-3B-Instruct. Lo que si documenta esta ficha es el proceso de transformacion: conversion a ONNX desde la copia sin gating de Unsloth, cuantizacion de las capas lineales y de la salida, y conservacion de embeddings, activaciones y cache KV en float16. El autor advierte explicitamente de que se trata de archivos modificados y de que las salidas son cercanas, pero no identicas, a las del modelo original.

## Capacidades

- Generacion de texto instructivo en formato chat: sigue el formato de turnos de Llama 3.2 Instruct (system/user/assistant).
- Razonamiento de complejidad media y tareas de conocimiento general propias de un modelo de 3B.
- Generacion y explicacion de codigo en lenguajes habituales, sin garantias de correccion en bases de codigo grandes.
- Matematicas basicas y problemas de varios pasos; para calculo formal conviene apoyarse en herramientas externas.
- Soporte de tool calling / function calling heredado del modelo base, condicionado a que la capa de inferencia en el navegador implemente el parseo de llamadas.
- Capacidad de razonamiento multi-paso y uso como componente de agentes, limitada por la ventana efectiva y la precision de la cuantizacion de 4 bits.
- Multilinguismo en los ocho idiomas oficiales del modelo base, con calidad notablemente superior en ingles.
- Decodificacion especulativa integrada mediante cabeza EAGLE-3, que acelera la generacion sin alterar la distribucion de salida verificada.
- Ejecucion 100% local en el cliente (navegador con WebGPU), sin llamadas a servidor.
- No incluye vision, audio ni modo "thinking" explicito: es un modelo de texto.

## Casos de uso

- Chat de atencion al cliente embebido en una web: el modelo corre en el navegador del visitante, de modo que la conversacion no se envia a ningun servidor; valido para FAQ, guiado de formularios y triaje previo a escalar a un agente humano.
- Procesamiento de documentos sensibles en el puesto de trabajo: resumen y extraccion de datos de textos que no pueden salir de la organizacion (informes medicos, contratos, expedientes), usando la ventana de 128k del modelo base si la memoria del dispositivo lo permite.
- Prototipado rapido de producto: validar flujos conversacionales y prompts sin montar infraestructura de GPU ni asumir coste por token, directamente en una pagina estatica.
- Demos educativas y de investigacion: mostrar el funcionamiento interno de un LLM y de la decodificacion especulativa (aceptacion del borrador EAGLE-3 frente a verificacion) en un aula o taller sin instalacion.
- Redaccion asistida en aplicaciones ofimaticas web: reescritura, resumen y cambio de tono de textos cortos dentro de un editor, con latencia local y sin dependencia de red.
- Asistente de codigo ligero en documentacion tecnica: explicar fragmentos, generar ejemplos de API y redactar tests sencillos dentro de un portal de desarrolladores.
- Modo offline o conectividad intermitente: aplicaciones PWA que siguen ofreciendo generacion de texto una vez cacheado el modelo (3,0 GB en el repositorio) y sin conexion.
- Base para experimentos de inferencia en el edge: comparar rendimiento de ONNX Runtime Web con WebGPU frente a backends nativos usando el mismo grafo exportado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversion no incluye metricas de calidad, latencia ni throughput, y la cuantizacion a 4 bits y la reescritura del grafo implican que los resultados no serian identicos a los del modelo base.

| Benchmark | Este modelo | Modelo base Llama-3.2-3B-Instruct |
|---|---|---|
| MMLU | no disponible | no disponible en la informacion proporcionada (consultar la model card de Meta) |
| HumanEval | no disponible | no disponible en la informacion proporcionada |
| GSM8K | no disponible | no disponible en la informacion proporcionada |
| Latencia / throughput en WebGPU | no disponible | no aplica |

## Requisitos de hardware

- VRAM o memoria grafica estimada: el repositorio ocupa 3,0 GB; en ejecucion hay que sumar la cache KV en float16, que crece de forma lineal con la longitud de contexto. Para conversaciones cortas (2k-4k tokens) es razonable reservar entre 3 y 4 GB de memoria de GPU; contextos largos pueden agotar la memoria disponible en GPUs integradas.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable y al menos 4-6 GB de memoria dedicada (por ejemplo, portatiles con GPU discreta de gama media o superior). En equipos Apple, WebGPU sobre Metal; en Windows/Linux, Chrome/Edge con backend Vulkan o D3D12.
- Cabe en GPU de consumo: si, en el rango de 4-8 GB, con la advertencia de que el limite practico lo pone el contexto y el navegador, no solo el peso del modelo. En GPUs integradas funciona, pero con latencia alta y contextos muy cortos.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU (caso previsto por el autor, integrado en Quick Inference); ONNX Runtime GenAI en nativo para escritorio o servidor; no se incluyen pesos GGUF ni safetensors, por lo que vLLM, TGI, llama.cpp u Ollama requeririan una conversion previa no incluida en el repositorio.
- Latencia y throughput: no disponible. Dependen del navegador, del backend WebGPU, de la GPU y de la tasa de aceptacion del borrador EAGLE-3; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| Llama-3.2-3B-Instruct-ONNX-WebGPU (este) | 3,21B | 128k (base) | ONNX + WebGPU, 4 bits en lineales, fp16 en activaciones | Llama 3.2 Community License | Incluye cabeza EAGLE-3 para decodificacion especulativa; sin benchmarks publicados |
| meta-llama/Llama-3.2-3B-Instruct | 3,21B | 128k | safetensors en bf16/fp16; vLLM, TGI, transformers | Llama 3.2 Community License | Referencia de calidad sin cuantizar; requiere infraestructura de GPU |
| unsloth/Llama-3.2-3B-Instruct | 3,21B | 128k | safetensors y variantes cuantizadas de Unsloth | Llama 3.2 Community License | Copia sin gating de los mismos pesos; origen de esta conversion |
| Meta Llama 3.2 1B Instruct | 1,24B | 128k | safetensors, ONNX y GGUF en la comunidad | Llama 3.2 Community License | Alternativa mas ligera para navegador, con menor calidad; cifras de parametros segun datos publicos de Meta |

No se dispone de comparativas de rendimiento medidas entre estas opciones dentro de la informacion proporcionada; la comparacion anterior es de formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Riesgo de alucinacion inherente a un modelo de 3B, agravado por la cuantizacion de pesos a 4 bits; no debe usarse como fuente de verdad sin verificacion.
- La cuantizacion RTN de 4 bits con bloque 32 degrada la perplejidad respecto al modelo en bf16; el autor advierte de que las salidas son cercanas pero no identicas a las originales.
- La decodificacion especulativa solo preserva la calidad si el borrador se verifica correctamente; una implementacion defectuosa del paso de verificacion en el runtime puede introducir divergencias.
- Sesgos: no documentados en esta conversion; hereda los del corpus de entrenamiento de Llama 3.2, no auditados aqui.
- Idiomas: solo estan cubiertos los ocho idiomas oficiales del modelo base; no se declara soporte adicional y la calidad en espanol es inferior a la del ingles.
- Contexto: los 128k son del modelo base; en navegador, la cache KV en float16 hace que contextos largos sean poco practicos por consumo de memoria.
- Licencia: Llama 3.2 Community License permite uso comercial con condiciones (clausula de usuarios activos mensuales, obligaciones de atribucion y cumplimiento de la politica de uso aceptable); es necesario revisar LICENSE, NOTICE y USE_POLICY.md antes de desplegar.
- Estado del repositorio: creado el 25 de octubre de 2026, con 0 descargas y 0 likes; es una conversion de terceros no auditada por Meta, sin pipeline declarado ni benchmarks publicados.
- Dependencia de WebGPU: la disponibilidad y estabilidad del backend varia por navegador, sistema operativo y controlador de GPU; no hay soporte en navegadores sin WebGPU.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo (los resultados obtenidos eran contenido no relacionado), por lo que no hay documentacion externa que valide las afirmaciones de la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/danyalmalik/Llama-3.2-3B-Instruct-ONNX-WebGPU
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Copia sin gating usada para la conversion: https://huggingface.co/unsloth/Llama-3.2-3B-Instruct
- Cabeza borrador EAGLE-3: https://huggingface.co/thoughtworks/Llama-3.2-3B-Instruct-Eagle3
- Licencia y politica de uso: archivos LICENSE, NOTICE y USE_POLICY.md incluidos en el repositorio
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
