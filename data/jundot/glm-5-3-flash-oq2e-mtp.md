# Jundot/GLM-5.3-Flash-oQ2e-mtp

## Resumen

GLM-5.3-Flash-oQ2e-mtp es un checkpoint cuantizado en formato MLX del modelo multimodal zai-org/GLM-5.3-Flash, publicado por el usuario Jundot. Se trata de un modelo de mezcla de expertos (MoE) nativamente multimodal, con 321.323 millones de parametros totales y 18.000 millones de parametros activos por token, que combina atencion dispersa y atencion lineal con Manifold-Constrained Hyper-Connections (mHC). El checkpoint incluye las tres partes del modelo original: el backbone de lenguaje (313.327 millones de parametros logicos), el codificador de vision (0.564 millones) y la cabeza de prediccion multi-token o MTP (7.433 millones).

La relevancia de esta publicacion esta en la cuantizacion: se ha generado con oQ (oMLX v0.7.1) mediante cuantizacion de precision mixta y la denominada Improved oQe Quantization, con un promedio efectivo de 2,746 bits por peso. El resultado comprime el modelo a 110,3 GB en disco (102,725 GiB), lo que lo hace desplegable en equipos Apple Silicon de gama alta con memoria unificada grande, algo imposible con el checkpoint original en BF16.

La licencia es MIT, heredada del modelo fuente, y el pipeline declarado es image-text-to-text. No se han publicado resultados de benchmarks ni la longitud de contexto soportada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) multimodal, con atencion dispersa y atencion lineal combinadas y Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 321.323.031.390 (321,323B) |
| Parametros activos | 18B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | oQ2e de precision mixta: affine 2-bit grupo 64 (94,735% de los pesos), affine 4-bit grupo 64 (2,256%), affine 8-bit grupo 64 (2,793%), BF16 (0,189%) y FP32 (0,027%). Promedio efectivo 2,746 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo fuente) |
| Formato de pesos | MLX safetensors (libreria `mlx`) |
| Tamano del repositorio | 110,3 GB (102,725 GiB) |
| Componentes incluidos | Backbone de lenguaje, codificador de vision y cabeza MTP |
| Modelo base | zai-org/GLM-5.3-Flash |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura del modelo fuente es una mezcla de expertos multimodal nativa con 321.323 millones de parametros totales y 18.000 millones activos por token, lo que implica un ratio de activacion de aproximadamente el 5,6%. El diseno combina mecanismos de atencion dispersa con atencion lineal, y anade Manifold-Constrained Hyper-Connections (mHC) como esquema de conexiones residuales. Segun la model card, el checkpoint conserva el codificador de vision (0,564B) y una cabeza de prediccion multi-token (MTP) de 7.433 millones de parametros, lo que habilita decodificacion especulativa o prediccion de varios tokens por paso.

Sobre el entrenamiento del modelo original no se dispone de informacion en los datos proporcionados: no se detallan el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO. Lo que si esta documentado es el proceso de cuantizacion aplicado a este checkpoint. oQ2e asigna bits en funcion de la sensibilidad medida por capa y despues redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y un reajuste de escala y sesgo por minimos cuadrados ponderados. El reparto final deja el 94,735% de los pesos logicos en 2 bits y reserva 4, 8, BF16 y FP32 para las capas mas sensibles, con 8,882 GiB almacenados en 8 bits y 1,131 GiB en BF16.

## Capacidades

- Generacion de texto y razonamiento conversacional en formato multi-turno, segun el pipeline declarado (image-text-to-text).
- Procesamiento de imagen y texto de forma nativa: el checkpoint incluye el codificador de vision, por lo que acepta entradas multimodales imagen-texto.
- Prediccion multi-token mediante la cabeza MTP de 7.433 millones de parametros incluida en el checkpoint, orientada a acelerar la generacion.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales adicionales (modo thinking, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en Apple Silicon: el checkpoint esta en formato MLX y ocupa 102,725 GiB, por lo que puede cargarse en un Mac Studio o Mac Pro con memoria unificada de 192 GB o superior, permitiendo inferencia de un MoE de 321B sin depender de GPUs dedicadas ni de servicios en la nube.
- Prototipado de aplicaciones multimodales en local: al conservar el codificador de vision, el modelo permite construir flujos de image-text-to-text (descripcion de imagenes, preguntas sobre capturas o documentos escaneados) en un equipo de sobremesa con la pila MLX.
- Evaluacion comparativa de tecnicas de cuantizacion: con 2,746 bits por peso de media y un reparto documentado por capas, este checkpoint sirve como caso de estudio para medir la perdida de calidad frente al modelo original en BF16 y para validar la estrategia de asignacion de bits por sensibilidad.
- Generacion acelerada mediante MTP: la cabeza de prediccion multi-token incluida puede aprovecharse para decodificacion especulativa, reduciendo el numero de pasos de generacion en cargas de texto largo.
- Experimentacion academica con arquitecturas MoE hibridas: investigadores que quieran estudiar el comportamiento de atencion dispersa combinada con atencion lineal y conexiones mHC pueden usar este checkpoint sin necesidad de un cluster de GPUs.
- Ajuste fino ligero o adaptadores sobre la base cuantizada: el formato MLX safetensors y la licencia MIT permiten derivar versiones adaptadas a dominios concretos partiendo de un checkpoint ya comprimido, aunque con las limitaciones propias de la cuantizacion a 2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 110,3 GB en disco; el peso de los tensores es de 102,725 GiB, distribuidos en 88,594 GiB en 2 bits, 3,797 GiB en 4 bits, 8,882 GiB en 8 bits, 1,131 GiB en BF16 y 0,322 GiB en FP32.
- Plataforma: la libreria declarada es `mlx`, por lo que el despliegue esta orientado a Apple Silicon (series M). No se documenta soporte para CUDA en este checkpoint.
- Memoria unificada: al ser un modelo MoE con 321B de parametros totales, todos los pesos deben residir en memoria. Con 102,725 GiB de tensores, un equipo con 128 GB de memoria unificada queda muy justo (sin margen para cache KV ni buffers), por lo que 192 GB o mas es el rango recomendado.
- GPU dedicadas (A100, H100, RTX 4090): no aplicables directamente a este checkpoint en formato MLX; requeririan conversion a otro formato, no documentada.
- GPU de consumo: no cabe en ninguna GPU de consumo actual por tamano de pesos; queda fuera incluso de una RTX 4090 de 24 GB.
- Opciones de despliegue: MLX con el stack de oMLX (la herramienta de cuantizacion usada). Otros motores como vLLM, llama.cpp, Ollama o TGI no estan documentados para este checkpoint.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Formato | Tamano en disco | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.3-Flash-oQ2e-mtp (este) | 321,323B | 18B | MLX safetensors, 2,746 bits/peso efectivos | 110,3 GB / 102,725 GiB | MIT | HuggingFace |
| zai-org/GLM-5.3-Flash | 321,323B (segun el modelo base declarado) | 18B | no disponible | no disponible | no disponible | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la informacion proporcionada, por lo que la comparativa se limita al modelo fuente.

## Limitaciones y advertencias

- Cuantizacion agresiva: el 94,735% de los pesos logicos esta en 2 bits (affine, grupo 64). Aunque la asignacion por sensibilidad concentra 8 bits y BF16 en las capas criticas, es esperable una degradacion de calidad frente al checkpoint original en BF16 que no se ha cuantificado en la informacion disponible.
- Sesgos conocidos: no disponible. No se documentan evaluaciones de sesgo ni de seguridad para el modelo fuente ni para esta cuantizacion.
- Riesgo de alucinacion: no disponible. No hay evaluaciones de fidelidad factual publicadas en la informacion proporcionada.
- Limitaciones de contexto e idioma: la longitud de contexto y la lista de idiomas soportados no se especifican en los datos disponibles.
- Licencia: MIT, heredada del modelo fuente, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base original.
- Trazabilidad: el repositorio no registra descargas ni interacciones (0 descargas, 0 likes) y fue creado y actualizado el mismo dia (11 de octubre de 2026), por lo que no hay evidencia de validacion por parte de la comunidad.
- Restriccion de plataforma: el formato MLX limita el uso a hardware Apple Silicon; no se documenta una ruta de conversion a GGUF, safetensors estandar o formatos compatibles con CUDA.
- Despliegue en produccion: no hay datos de latencia, throughput ni estabilidad bajo carga, y el tamano de 102,725 GiB en memoria unificada restringe el uso a equipos de gama muy alta.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relacion con el tema y se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/GLM-5.3-Flash-oQ2e-mtp
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Repositorio de oQ / oMLX: https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
