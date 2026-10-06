# d9beuD/Qwen3.8-Flash-Next-oQ3-mtp

## Resumen

Qwen3.8-Flash-Next-oQ3-mtp es una cuantizacion MLX del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario d9beuD mediante la herramienta oQ (oMLX v0.7.0) con cuantizacion de precision mixta. El checkpoint conserva tanto el codificador de vision como la cabeza de prediccion multi-token (MTP) y la tabla de embeddings n-gram del modelo original, y se distribuye en formato MLX safetensors con un tamano de repositorio de 84,3 GB.

El modelo base, desarrollado por el equipo Qwen de Alibaba, es un MoE multimodal de la familia Qwen4 (tipo `qwen4_exp`) con 125.000 millones de parametros principales y unos 6.000 millones de parametros activos por token, una ventana de contexto de 262.000 tokens y una arquitectura de atencion hibrida GDN + QSA. El checkpoint completo suma unos 180.000 millones de parametros contando la tabla de embeddings n-gram de 51.000 millones y la cabeza MTP de 4.000 millones.

La relevancia de esta ficha concreta es que permite ejecutar localmente un modelo de esa escala en Apple Silicon con memoria unificada de 128 GB, reduciendo el peso a unos 3,75 bits efectivos por parametro (97,1 % de los parametros en 3 bits) sin perder la cabeza MTP ni el codificador de vision. Es, por tanto, una opcion orientada a despliegue local en Mac, no a servidores CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal con atencion hibrida GDN + QSA (tipo `qwen4_exp`, familia Qwen4) |
| Parametros totales | 179.999.981.459 (segun safetensors) |
| Parametros activos | ~6.000 millones por token (modelo base) |
| Longitud de contexto | 262.000 tokens (modelo base; no se documenta el efecto de la cuantizacion sobre ventanas largas) |
| Tipos de cuantizacion | oQ nivel 3, precision mixta: 3 bits (97,1 %), 4 bits (1,4 %), 5 bits (0,6 %), 6 bits (0,0 %), 8 bits (0,8 %); ~3,75 bits efectivos por peso; group size 64 por defecto, con algunos modulos en 32 o 128 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`), heredada del modelo base |
| Formato de pesos | MLX safetensors (pesos cuantizados; escalas y sesgos en bfloat16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE multimodal construido sobre la nueva arquitectura Qwen4, con atencion hibrida GDN + QSA, una ventana de contexto de 262.000 tokens y unos 6.000 millones de parametros activos por token sobre un total de 125.000 millones en el modelo principal. El checkpoint completo anade una tabla de embeddings n-gram de 51.000 millones de parametros y una cabeza de prediccion multi-token (MTP) de 4.000 millones, lo que eleva el total a unos 180.000 millones. Destacan como innovaciones la atencion hibrida, una cache KV reducida y la posibilidad de hacer streaming de los embeddings desde SSD. No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

Esta version concreta es una cuantizacion de precision mixta generada con oQ (oMLX v0.7.0). El mapa de sensibilidad por capa de oQ se midio sobre el checkpoint ya cuantizado Jundot/Qwen3.8-Flash-Next-oQ4e-mtp (128 muestras x 256 tokens, conjunto de calibracion `code_multilingual`) en lugar de sobre el checkpoint bf16 completo, porque este ultimo no cabe en memoria en un Mac de 128 GB. La cuantizacion preserva explicitamente la cabeza MTP (`mtp_num_hidden_layers: 1`), lo que habilita decodificacion multi-token, el codificador de vision y la tabla de embeddings n-gram.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con pipeline declarado `image-text-to-text`.
- Procesamiento de imagenes: el codificador de vision esta incluido en el checkpoint cuantizado.
- Razonamiento avanzado y modo de pensamiento ampliado, segun las caracteristicas del modelo base.
- Prediccion multi-token (MTP) mediante la cabeza dedicada, utilizable para decodificacion especulativa y aceleracion de la generacion.
- Contexto largo de hasta 262.000 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidades multilingues: no disponibles (el modelo no declara lista de idiomas; el conjunto de calibracion usado se denomina `code_multilingual`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente multimodal local en Mac de 128 GB: analisis de capturas de pantalla, diagramas tecnicos, documentos escaneados e imagenes junto a texto, sin salida de datos a servicios externos, aprovechando el codificador de vision incluido.
- Procesamiento de documentacion extensa: contratos, expedientes, informes anuales o bases de codigo que superan los 100.000 tokens se pueden procesar en una sola pasada gracias a la ventana de 262.000 tokens del modelo base.
- Generacion y revision de codigo en local: el checkpoint se calibro con un conjunto `code_multilingual`, y el modelo puede integrarse en flujos de trabajo de desarrollo sobre Apple Silicon para autocompletado, refactorizacion y explicacion de fragmentos largos.
- Analisis de imagenes en entornos aislados o sin conectividad: laboratorios, entornos sanitarios o industriales donde no se permite enviar imagenes a APIs externas y se dispone de estaciones de trabajo Apple de gama alta.
- Atencion al cliente o asistencia interna autoalojada: conversaciones multi-turno con historial largo, manteniendo el contexto de toda la sesion dentro de los 262.000 tokens y sin coste por token de API.
- Aceleracion de inferencia mediante MTP: uso de la cabeza de prediccion multi-token conservada en la cuantizacion para implementar decodificacion especulativa y aumentar el throughput en hardware Apple.
- Investigacion sobre la arquitectura Qwen4: al ser una vista previa temprana de la arquitectura que sustenta Qwen4, sirve para estudiar el comportamiento de la atencion hibrida GDN + QSA y de la tabla de embeddings n-gram en condiciones de cuantizacion agresiva.
- Prototipado de pipelines RAG locales sobre corpus tecnicos, combinando el contexto largo con busqueda vectorial externa sobre la misma maquina.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni para el modelo base ni para esta cuantizacion. La fuente de unsloth afirma que Qwen3.8-Flash-Next supera a Claude-4.6-Opus (Max), pero se trata de una afirmacion del modelo base sin tabla de resultados asociada en la informacion disponible, por lo que no se reproduce como dato numerico.

## Requisitos de hardware

- VRAM / memoria unificada estimada: el repositorio pesa 84,3 GB en pesos, por lo que se necesita una maquina con mas de 84 GB de memoria unificada; el autor recomienda un Mac de 128 GB.
- GPU compatibles: la libreria declarada es MLX, de modo que el destino natural es Apple Silicon (M-series). No se documenta soporte CUDA directo para estos pesos.
- GPU de consumo: no cabe en tarjetas de 24 GB. Una fuente consultada recomienda explicitamente seguir usando Qwen3.8-27B si solo se dispone de una GPU de 24 GB.
- Opciones de despliegue: MLX / mlx-lm para los pesos de este repositorio; tambien existen builds GGUF (Atomic Dynamic GGUF) para llama.cpp, Ollama y LM Studio, y guias de instalacion con vLLM para el modelo base.
- Latencia y throughput: no disponibles. La cabeza MTP conservada permite plantear decodificacion especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| d9beuD/Qwen3.8-Flash-Next-oQ3-mtp | ~180.000 M totales (incluye tabla n-gram y MTP) | 262.000 tokens (base) | oQ nivel 3, ~3,75 bits efectivos, 84 GB | MLX safetensors | Qwen Community 1.0 |
| Jundot/Qwen3.8-Flash-Next-oQ4e-mtp | ~180.000 M totales | 262.000 tokens (base) | oQ 4 bits (usado como base de calibracion) | MLX safetensors | Qwen Community 1.0 |
| Qwen/Qwen3.8-Flash-Next (bf16) | 125.000 M principales, ~6.000 M activos, +51.000 M n-gram, +4.000 M MTP | 262.000 tokens | sin cuantizar (bf16) | safetensors | Qwen Community 1.0 |
| Atomic Dynamic GGUF de Qwen3.8-Flash-Next | ~180.000 M totales | 262.000 tokens (base) | GGUF dinamico (niveles no especificados) | GGUF | Qwen Community 1.0 |
| Qwen3.8-27B | 27.000 M | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia independiente de calidad.
- Cuantizacion muy agresiva: el 97,1 % de los parametros esta en 3 bits, con solo un 2,8 % en 4 bits o mas. Es esperable cierta degradacion en tareas sensibles a la precision, aunque no se publican mediciones.
- Metodologia de calibracion cuestionable: el mapa de sensibilidad se calculo sobre un checkpoint ya cuantizado a 4 bits y no sobre el bf16 original, lo que puede introducir sesgos en la asignacion de bits por capa.
- Licencia restrictiva: se hereda la Qwen Community License 1.0, que no es una licencia open source clasica; conviene revisar el archivo LICENSE antes de cualquier uso comercial o redistribucion.
- Dependencia de plataforma: el formato MLX safetensors limita el uso a Apple Silicon; no es directamente desplegable en CUDA sin conversion previa a otro formato.
- Idiomas no declarados: no hay lista oficial de idiomas soportados, lo que dificulta planificar despliegues multilingues.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion, ni para el modelo base ni para esta cuantizacion.
- Sin benchmarks: la ausencia total de metricas impide comparar de forma objetiva contra alternativas de la misma categoria.
- Requisito de memoria elevado: 84,3 GB de pesos obligan a maquinas con al menos 128 GB de memoria unificada; no es un modelo apto para portatiles de gama media ni para GPU de consumo.
- Efecto de la cuantizacion sobre el contexto largo: no se documenta como se comporta la ventana de 262.000 tokens tras reducir a 3 bits.
- Tool calling y uso agentico: no hay documentacion en la informacion disponible sobre soporte nativo de function calling, lo que condiciona su uso en pipelines de agentes.
- Tabla de embeddings n-gram de gran tamano: 51.000 millones de parametros del total corresponden a esta componente, con streaming desde SSD planteado como mecanismo de despliegue; el rendimiento real de ese esquema no esta medido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/d9beuD/Qwen3.8-Flash-Next-oQ3-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint usado para la calibracion de sensibilidad: https://huggingface.co/Jundot/Qwen3.8-Flash-Next-oQ4e-mtp
- Herramienta de cuantizacion oQ (oMLX): https://github.com/jundot/omlx
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Guia de ejecucion local de unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Guia de GGUF, hardware y benchmarks (Atomic): https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
- Guia de hardware para IA local en 2026: https://www.runaihome.com/blog/qwen38-flash-next-local-ai-hardware-guide-2026/
- Guia de instalacion local con Ollama, vLLM y LM Studio: https://madebybrain.com/en/blog/qwen-3-8-flash-next-installation-guide-2026
