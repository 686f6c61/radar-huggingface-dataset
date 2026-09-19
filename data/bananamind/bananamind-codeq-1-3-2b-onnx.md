# BananaMind/BananaMind-CodeQ-1.3-2B-ONNX

## Resumen

BananaMind-CodeQ-1.3-2B-ONNX es una exportación en formato ONNX del modelo BananaMind-CodeQ-1.3-2B, pensada para su ejecución directamente en el navegador mediante transformers.js y WebGPU. El modelo original es un merge de LoRA sobre MiniCPM5-2B, con un total de aproximadamente 2.000 millones de parámetros, y esta variante lo empaqueta con cuantización int4 simétrica (q4f16) para reducir el peso del repositorio a 1,8 GB.

El desarrollo corre a cargo de BananaMind, que publica tanto el modelo base en BF16 como esta conversión ONNX. La relevancia de esta ficha está en que el modelo está diseñado para inferencia local en el cliente: el repositorio se usa en el Space BananaMind-CodeQ-WebGPU-Pi y permite generar texto sin servidor, sin API y sin GPU dedicada, siempre que el navegador soporte WebGPU.

Técnicamente, la exportación reutiliza el grafo de Mike0021/MiniCPM5-2B-ONNX (rev 04a6c49) y sustituye los pesos BF16 de CodeQ-1.3-2B, conservando las optimizaciones de ese export (QKV fusionado, GroupQueryAttention, LM head de última posición, embeddings divididos en cuatro shards y siete chunks de datos externos). La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de MiniCPM5-2B (etiquetado como llama), con QKV fusionado, GroupQueryAttention, RoPE y LM head de ultima posicion |
| Parametros totales | Aproximadamente 2.000 millones (2B, segun denominacion del modelo) |
| Parametros activos | No aplica (no es MoE; no disponible informacion que indique lo contrario) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int4 simetrico con block size 32 (MatMulNBits) y escalas fp16; embeddings y normalizaciones en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (q4f16) con datos externos en chunks y manifest.json con tamanos y SHA-256 |

## Arquitectura y entrenamiento

El modelo base CodeQ-1.3-2B comparte exactamente la misma arquitectura que openbmb/MiniCPM5-2B. Segun la model card, se trata de un transformer decoder con las siguientes particularidades de implementación en el grafo ONNX: atención con consultas, claves y valores fusionados (fused QKV), GroupQueryAttention, LM head que solo calcula la última posición, embeddings divididos en cuatro shards de columnas y RoPE con el mismo rope_theta que el modelo original. Los pesos se almacenan en int4 simétrico con block size 32 para las capas lineales, con escalas en fp16, mientras que embeddings y normalizaciones permanecen en fp16. El proceso de cuantización reproduce bit a bit la salida del exportador ONNX Runtime GenAI sobre el lm_head no modificado.

En cuanto al entrenamiento, la model card indica únicamente que CodeQ-1.3-2B es un merge de LoRA sobre MiniCPM5-2B. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales de RLHF o DPO; esa información no está disponible. Esta publicación concreta no implica entrenamiento alguno: es una conversión de pesos y grafos, y el único ajuste posterior es la corrección de la plantilla de chat, tomada del paquete ONNX de MiniCPM5 junto con un tokenizer que, según el autor, es idéntico byte a byte al de CodeQ.

## Capacidades

- Generacion de texto conversacional, con pipeline declarado como text-generation y etiqueta conversational.
- Generacion de codigo: la unica verificacion publicada consiste en una peticion de una funcion Python para calcular el factorial, resuelta con una implementacion tipada y documentada bajo decodificacion greedy en CPU.
- Ejecucion en navegador mediante transformers.js y WebGPU, sin backend ni servidor.
- Soporte de plantilla de chat corregida para interacciones multi-turno.
- Tool calling y function calling: no disponible informacion al respecto.
- Capacidades de agente y razonamiento multi-paso: no disponible informacion al respecto.
- Modo thinking, vision o audio: no disponible informacion al respecto.
- Capacidades multilingues: no disponible informacion al respecto.

## Casos de uso

- Asistentes de codigo integrados en paginas web: al ser un export ONNX para transformers.js y WebGPU, se puede cargar el modelo en el propio navegador y ofrecer autocompletado o generacion de funciones sin enviar el codigo del usuario a un servidor.
- Demos interactivas en Hugging Face Spaces: es el uso documentado del repositorio, empleado por el Space BananaMind-CodeQ-WebGPU-Pi, lo que permite publicar una demo funcional sin coste de GPU en el backend.
- Procesamiento de texto con privacidad estricta: la inferencia ocurre en el dispositivo del usuario, de modo que resulta adecuado para entornos donde no se permite exportar datos a servicios externos.
- Educacion y prototipado de modelos: su tamano de 1,8 GB y su cuantizacion int4 permiten descargarlo y probarlo en portatiles convencionales para experimentar con pipelines de transformers.js.
- Aplicaciones offline o de baja conectividad: una vez cacheado el modelo, la generacion no requiere red, lo que encaja en herramientas de escritorio o PWA.
- Integracion en extensiones de navegador: un modelo de 2B cuantizado a int4 puede ejecutarse junto al resto de la pestana, ofreciendo funciones de resumen o reescritura de texto sobre el contenido visible.
- Evaluacion comparativa de cuantizacion: sirve como referencia practica para medir la perdida de calidad de int4 frente a BF16 en tareas de generacion de codigo, tal y como advierte el propio autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta una comprobacion cualitativa de cordura (peticion de una funcion Python de factorial, resuelta correctamente) y advierte de que la cuantizacion int4 pierde algo de calidad respecto a BF16, sin cuantificar la diferencia.

## Requisitos de hardware

- VRAM estimada: en torno a 1,5-2 GB para la variante int4 q4f16 (el repositorio completo pesa 1,8 GB); en BF16 el modelo original de 2B requeriria aproximadamente 4-5 GB.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el caso de navegador; en servidor bastaria una GPU de gama media o incluso una RTX 3060/4060 para la variante cuantizada.
- Compatibilidad con GPU de consumo: si, el modelo cuantizado cabe holgadamente en GPU de consumo e incluso en graficas integradas con memoria compartida, siempre que el runtime lo permita.
- Opciones de despliegue: transformers.js con WebGPU (caso principal), ONNX Runtime y ONNX Runtime GenAI en CPU o GPU, y potencialmente contenedores de inferencia compatibles con ONNX. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este repositorio concreto.
- Latencia y throughput: no disponible. Solo se menciona que la comprobacion de cordura se ejecuto en ONNX Runtime sobre CPU con decodificacion greedy, sin cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| BananaMind-CodeQ-1.3-2B-ONNX | ~2B | ONNX int4 (q4f16) | no disponible | Apache 2.0 | Orientado a navegador con WebGPU; 1,8 GB |
| BananaMind-CodeQ-1.3-2B | ~2B | safetensors en BF16 (modelo base del anterior) | no disponible | Apache 2.0 | Sin cuantizar; mayor calidad y mas peso |
| openbmb/MiniCPM5-2B | ~2B | no disponible | no disponible | no disponible | Arquitectura identica segun la model card |
| Mike0021/MiniCPM5-2B-ONNX | ~2B | ONNX | no disponible | no disponible | Grafo reutilizado por esta exportacion (rev 04a6c49) |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: el propio autor indica que int4 pierde calidad frente a BF16, por lo que no es recomendable para tareas que exijan la maxima fidelidad del modelo original.
- Cobertura idiomatica desconocida: no se declaran idiomas soportados, de modo que el rendimiento en castellano no esta verificado.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que impide planificar cargas con entradas largas.
- Riesgo de alucinacion: no hay informacion publicada sobre evaluaciones de veracidad ni sobre mitigaciones; al ser un modelo pequeno de 2B, la tasa de error factual tiende a ser relevante, aunque no se aportan mediciones.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Requisitos de navegador: el uso previsto depende de WebGPU; en navegadores o equipos sin soporte habria que recurrir a ONNX Runtime en CPU, con una latencia presumiblemente mayor y no cuantificada.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, con fecha de creacion y actualizacion el mismo dia, lo que sugiere un artefacto recien publicado y poco validado por la comunidad.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero las condiciones del modelo base MiniCPM5-2B y del grafo ONNX reutilizado deberian verificarse por separado antes de un despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BananaMind/BananaMind-CodeQ-1.3-2B-ONNX
- Modelo base: https://huggingface.co/BananaMind/BananaMind-CodeQ-1.3-2B
- Space de demostracion: https://huggingface.co/spaces/BananaMind/BananaMind-CodeQ-WebGPU-Pi
- Modelo de referencia de arquitectura: https://huggingface.co/openbmb/MiniCPM5-2B
- Grafo ONNX reutilizado: https://huggingface.co/Mike0021/MiniCPM5-2B-ONNX
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las consultas devolvieron unicamente paginas de descarga del navegador Google Chrome.
