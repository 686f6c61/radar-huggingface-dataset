# ktobik/deepseek-v41-flash-maya-xs-abliterated-public

## Resumen

DeepSeek V4.1 Flash Maya-XS Abliterated es una cuantizacion GGUF en formato ds4 del modelo DeepSeek-V4.1-Flash-1017 de DeepSeek, sometida a un proceso de abliteration (supresion de la direccion de rechazo en el espacio de activaciones) y publicada por el usuario ktobik como copia de archivo publico del repositorio original de audreyt. El modelo base es un Mixture-of-Experts multimodal con comprension nativa de imagen y texto, contexto de hasta un millon de tokens y compresion agresiva de KV cache.

Los metadatos de safetensors del repositorio declaran 754.638.867.584 parametros (~754,6 B), mientras que el anuncio oficial del modelo base habla de 552 B de parametros de backbone; la informacion disponible no explica esa diferencia. El repositorio ocupa 365,7 GB y contiene el archivo `DeepSeek-V4.1-Flash-1017-Maya-XS-Abliterated.gguf`, etiquetado con imatrix.

Su interes es doble: permite servir un modelo de escala frontera con una huella de memoria muy inferior a la del bf16 (~1,5 TB teoricos) y ofrece una variante sin rechazos para investigacion en alineamiento y seguridad. Como contrapartida, el autor advierte de que el archivo no es un GGUF estandar y requiere la implementacion ds4, lo que restringe su uso a entornos preparados especificamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con compresion de KV cache, heredada del modelo base DeepSeek-V4.1-Flash-1017 |
| Parametros totales | 754.638.867.584 (~754,6 B) segun metadatos de safetensors del repo; el anuncio del modelo base indica 552 B de parametros de backbone |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.000.000 tokens en el modelo base; no verificado en esta cuantizacion |
| Tipos de cuantizacion | GGUF en formato especifico de ds4 (no valido para llama.cpp/Ollama estandar); repo de 365,7 GB, equivalente a ~3,9 bits por parametro de media (calculo propio a partir del recuento de parametros); cuantizacion guiada por imatrix |
| Idiomas soportados | no disponible |
| Licencia | MIT (declarada en el repositorio) |
| Formato de pesos | GGUF (ds4); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash es un Mixture-of-Experts multimodal que procesa imagenes y texto de forma nativa y genera texto de manera autorregresiva. Su informe tecnico se titula explicitamente "Pushing the Limits of KV Cache Compression", lo que situa la compresion de cache como la innovacion central para sostener ventanas de hasta un millon de tokens sin un coste de memoria prohibitivo. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del corpus ni las etapas de RLHF o DPO aplicadas.

Sobre esa base, el autor original aplico abliteration, una tecnica que identifica la direccion de activacion asociada a las respuestas de rechazo y la proyecta fuera de los pesos, de modo que el modelo deja de negarse a responder a ciertas peticiones. Posteriormente se genero una cuantizacion GGUF con matriz de importancia (imatrix) y se empaqueto en el contenedor propietario ds4. No hay informacion publica sobre el conjunto de calibracion, el algoritmo exacto de abliteration ni el impacto medido en capacidades.

## Capacidades

- Generacion de texto y razonamiento multietapa, heredados del modelo base.
- Comprension nativa de imagenes (entrada multimodal imagen + texto) segun la documentacion del modelo base; no confirmado en esta cuantizacion concreta.
- Procesamiento de contexto muy largo, hasta 1.000.000 de tokens en el modelo original, adecuado para documentos completos o repositorios de codigo.
- Respuestas sin rechazo por alineamiento de seguridad en las categorias suprimidas por la abliteration.
- Generacion de codigo y matematicas: capacidad esperable por la familia del modelo base, sin evaluacion publicada en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y multi-step reasoning: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Investigacion en seguridad y alineamiento: la variante abliterada permite estudiar como se distribuye la direccion de rechazo en un MoE de gran escala y comparar respuestas frente al modelo base original, usando el mismo prompt en ambos.
- Analisis de corpus documentales extensos: con hasta 1M tokens de contexto en el modelo base, se pueden ingerir expedientes completos, normativas o libros enteros en una sola pasada sin fragmentacion por retrieval.
- Procesamiento de documentacion tecnica con imagenes: al heredar entrada visual, admite diagramas de arquitectura, capturas de paneles y esquemas junto con el texto explicativo en la misma ventana.
- Revision de codigo en monorepos: la ventana larga permite cargar varios modulos y sus dependencias simultaneamente para detectar inconsistencias entre ficheros.
- Generacion de datos sinteticos para entrenamiento: una variante sin rechazos amplia el espacio de respuestas muestreables en tareas de destilacion y evaluacion de robustez.
- Despliegue on-premise con requisitos de memoria reducidos: la cuantizacion a ~366 GB baja el coste frente al ~1,5 TB del bf16, lo que permite servir el modelo en un nodo de 8 GPU en lugar de un cluster multi-nodo.
- Archivo y preservacion reproducible: el repositorio se declara copia de conservacion publica, util para auditores que necesiten una referencia estable de pesos y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de tareas multimodales, y tampoco se documenta la degradacion introducida por la abliteration o por la cuantizacion a ~4 bits.

## Requisitos de hardware

- Peso en disco y en memoria: el repositorio ocupa 365,7 GB; para inferencia en GPU se necesita ese volumen mas cache KV y buffers de activacion.
- VRAM estimada (GGUF cuantizado): ~366 GB de pesos; con overhead de cache KV y activaciones, un nodo de 8x H100 80 GB (640 GB) o 4x H200 141 GB (564 GB) deja margen suficiente.
- VRAM estimada (modelo base en bf16): ~1,51 TB para 754,6 B parametros; requiere al menos 16x H100 80 GB o configuracion multi-nodo. Con la cifra alternativa de 552 B, el requisito bajaría a ~1,1 TB.
- GPU consumer: no cabe en ninguna GPU de consumo individual (RTX 4090 24 GB, RTX 5090 32 GB). Solo es viable con offload a RAM del sistema.
- Despliegue por CPU/RAM: se necesitan del orden de 400-512 GB de RAM para mantener los pesos residentes; plataformas EPYC o Xeon con 8 o 12 canales de memoria.
- Opciones de despliegue: la implementacion ds4 indicada por el autor para el GGUF; llama.cpp, Ollama y derivados no son compatibles segun la advertencia de la model card. Para el modelo base en safetensors, las opciones habituales de servido de MoE (vLLM, SGLang) no estan confirmadas en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ktobik/deepseek-v41-flash-maya-xs-abliterated-public | 754,6 B (metadatos); 552 B de backbone segun el anuncio del base | 1M en el modelo base | GGUF ds4 | MIT | Copia de archivo de audreyt; 365,7 GB; 0 descargas |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 552 B de backbone | 1M | safetensors | no disponible | Modelo original sin abliterar, multimodal nativo |
| audreyt/DeepSeek-V4.1-Flash-Abliterated-GGUF | mismo que el base | 1M (heredado) | GGUF ds4 | no disponible | Origen declarado de esta copia |
| Kiwimaker/DeepSeek-V4.1-Flash-1017-Maya-S-abliterated-GGUF | no disponible | no disponible | GGUF | no disponible | Variante Maya-S, presumiblemente otra cuantizacion del mismo linaje |
| securepeak/DeepSeek-V4.1-Flash-Abliterated | no disponible | no disponible | no disponible | no disponible | Variante abliterada distribuida por separado |

## Limitaciones y advertencias

- La abliteration elimina deliberadamente el comportamiento de rechazo: el modelo puede producir contenido danino, ilegal o sexualmente explicito. No es adecuado para exposicion directa a usuarios finales sin filtros externos.
- No hay evaluacion del coste en capacidad: la proyeccion de la direccion de rechazo suele degradar ligeramente tareas de razonamiento e instruccion, pero no se publican mediciones.
- Discrepancia no resuelta entre 754,6 B (metadatos de safetensors) y 552 B (anuncio del modelo base); afecta directamente al calculo de VRAM y debe verificarse antes de aprovisionar hardware.
- El formato GGUF es propietario de ds4 y no funciona en llama.cpp, Ollama ni en la mayoria de herramientas estandar de cuantizacion; el ecosistema de servido es muy reducido.
- La model card esta redactada en japones y se limita a indicar que es una copia de conservacion; no hay documentacion de uso, prompts recomendados ni parametros de muestreo.
- Sin descargas ni likes en el momento del registro, no existe validacion de la comunidad ni verificacion independiente de la integridad de los pesos.
- Idiomas soportados no documentados; el comportamiento multilingue debe probarse empiricamente.
- La licencia MIT la declara el publicador de la copia, no el titular original del modelo base; la licencia de DeepSeek-V4.1-Flash-1017 no consta en la informacion disponible, por lo que el uso comercial exige verificacion juridica previa.
- El nombre "Maya-XS" sugiere un modelo pequeno, pero el recuento de parametros corresponde a escala frontera; puede inducir a error en seleccion de hardware.
- Riesgo de alucinacion no cuantificado: sin benchmarks ni evaluaciones de fidelidad, no se puede acotar la tasa de error en tareas factuales.
- La ventana de 1M tokens del modelo base implica costes de cache KV considerables en produccion; la compresion anunciada por DeepSeek no esta verificada en esta cuantizacion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ktobik/deepseek-v41-flash-maya-xs-abliterated-public
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Repositorio de origen citado en la model card: https://huggingface.co/audreyt/DeepSeek-V4.1-Flash-Abliterated-GGUF
- Variante Maya-S: https://huggingface.co/Kiwimaker/DeepSeek-V4.1-Flash-1017-Maya-S-abliterated-GGUF/tree/main
- Variante abliterada alternativa: https://huggingface.co/securepeak/DeepSeek-V4.1-Flash-Abliterated
- Anuncio oficial de DeepSeek-V4.1-Flash: https://www.deepseek.com/en/news/deepseek-v4-1-flash/
- Ficha del modelo base en ModelScope (informe tecnico sobre compresion de KV cache): https://www.modelscope.cn/models/deepseek-ai/DeepSeek-V4.1-Flash
- Proyecto Maya (implementacion comunitaria para MoE en GPU propias): https://github.com/mw00/project-maya
