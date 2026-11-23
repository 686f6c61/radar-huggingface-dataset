# alesha-pro/Hy4-flash-Q3_K-MTP-GGUF

## Resumen

Hy4-flash es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Tencent, con 222.679.844.717 parametros totales y una longitud de contexto de 262.144 tokens. Esta ficha describe la version cuantizada en GGUF publicada por el usuario alesha-pro bajo el identificador `alesha-pro/Hy4-flash-Q3_K-MTP-GGUF`, que adapta el modelo base `tencent/Hy4-flash` para su ejecucion en tarjetas consumer RTX 3090 mediante un motor de inferencia derivado de Project Maya.

La publicacion incluye dos variantes de cuantizacion (Q3_K e IQ2_XXS), la torre de vision en BF16, una tabla Engram separada y un vector de abliteracion que elimina la mayoria de los rechazos del modelo original. El modelo soporta entrada de imagen (pipeline image-text-to-text) y decodificacion especulativa mediante una capa MTP (Multi-Token Prediction) requantizada para encajar en GPUs de 24 GB.

Su relevancia actual radica en que permite ejecutar un modelo de 222B parametros con contexto completo de 256K en configuraciones de 1, 2 o 4 RTX 3090, algo que el llama.cpp estandar no permite cargar segun el autor. La licencia es la Tencent Hy License v1.0, derivada de Apache 2.0 con condiciones adicionales para grandes proveedores de Model-as-a-Service.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) con capa MTP y torre de vision; detalles internos no disponibles |
| Parametros totales | 222.679.844.717 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q3_K (expertos Q3_K/Q4_K, atencion Q8_0, MTP Q3_K/Q8_0) e IQ2_XXS (expertos IQ2) |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License v1.0 (derivada de Apache 2.0, con terminos adicionales en la seccion 10 para grandes negocios de Model-as-a-Service) |
| Formato de pesos | GGUF (multi-parte: `-00001-of-00002` y `-00002-of-00002`), mas `mmproj` BF16 para vision |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de Tencent con 222.679.844.717 parametros totales, segun los datos de safetensors del repositorio. La publicacion cuantizada incorpora una capa MTP (Multi-Token Prediction) en el bloque `blk.42` con 21 tensores, requantizada de BF16 a Q3_K/Q8_0/F32 para que quepa junto al contexto de 256K en tarjetas de 24 GB. Tambien incluye una tabla Engram almacenada como archivo GGUF independiente de 63,4 GB, que en configuraciones de una sola GPU puede residir en NVMe.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable de esta publicacion es la ingenieria de cuantizacion: el trunk Q3_K combina expertos en Q3_K/Q4_K con atencion en Q8_0, la variante IQ2_XXS copia byte a byte los 123 tensores de expertos enrutados de las capas 1 a 41 desde el archivo IQ2 de AtomicChat, y el vector de abliteracion (`Hy4-flash-refusal-directions.bin`) contiene direcciones de rechazo por capa y por cada uno de los cuatro flujos de hiperconexion, proyectadas fuera del flujo residual durante la inferencia.

## Capacidades

- Generacion de texto conversacional multi-turno con ventana de 262.144 tokens.
- Entrada de imagen: pipeline image-text-to-text con torre de vision en BF16 (`mmproj-Hy4-flash-bf16.gguf`).
- Decodificacion especulativa mediante capa MTP (Multi-Token Prediction).
- Modo "thinking" (razonamiento) segun los datos de evaluacion de rechazos del autor.
- Variante "uncensored": el vector de abliteracion reduce los rechazos (de 139 a 32 en AdvBench 64 + JailbreakBench 82 con thinking off; de 22 a 3 en AdvBench 24 con thinking on).
- API compatible con OpenAI Chat en `/v1` a traves del servidor de Project Maya.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto muy largo (262.144 tokens) gracias a su ventana, adecuado para historiales extensos de soporte o bases de conocimiento inyectadas en el prompt.
- Procesamiento de documentos extensos con imagen: al aceptar entrada image-text-to-text, permite extraer y razonar sobre informacion de capturas, formularios o diagramas junto con texto largo en una sola pasada.
- Analisis de repositorios y codigo: con 256K de contexto puede ingerir arboles de proyecto completos o varios archivos grandes para tareas de revision, resumen o generacion de parches.
- Despliegue en laboratorio con hardware consumer: la configuracion de 2x RTX 3090 con Q3_K (70-104 tok/s de decodificacion, 1225 tok/s de prefill) permite servir el modelo en entornos de investigacion sin GPUs de datacenter.
- Investigacion sobre alineacion y rechazos: la variante uncensored con vector de abliteracion medible (KL mediana 0,014, 85,7% de coincidencia de token top en texto largo) sirve para estudiar el comportamiento de rechazo y sus efectos en la distribucion de salida.
- Prototipado de asistentes multimodales: la combinacion de vision, contexto largo y API compatible con OpenAI facilita integrar el modelo en prototipos de agentes que necesiten razonar sobre imagenes y texto sin reentrenar.
- Evaluacion de cuantizaciones: los archivos Q3_K e IQ2_XXS con metricas de coincidencia de token top (88,3% y 88,5% en 2 y 1 GPU; 74-76% para IQ2) permiten comparar el impacto de la cuantizacion en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor indica explicitamente que no dispone de benchmarks de tareas propios. Los unicos datos de rendimiento publicados son de inferencia y de fidelidad de cuantizacion:

| Metrica | Q3_K, 4x RTX 3090 | Q3_K, 2x RTX 3090 | IQ2, 2x RTX 3090 | Q3_K, 1x RTX 3090 | IQ2, 1x RTX 3090 (Engram en NVMe) |
|---|---:|---:|---:|---:|---:|
| Decodificacion (tok/s) | 176-251 | 70-104 | 95-123 | 37-54 | 54-68 |
| Prefill (tok/s) | 2947 | 1225 | 1999 | 1510 | 1184-1199 |
| RAM | ~60 GiB | 137 GiB | no disponible | 137 GiB (78 GiB con Engram en NVMe) | 45 GiB |

| Metrica de fidelidad | Valor |
|---|---|
| Coincidencia de token top, 2 tarjetas vs 4 tarjetas | 88,3% |
| Coincidencia de token top, 1 tarjeta vs 4 tarjetas | 88,5% |
| Coincidencia de token top, expertos IQ2 | 74-76% |
| Coincidencia de token top en texto largo, uncensored vs stock | 85,7% (dos ejecuciones stock coinciden en 88,3%) |
| KL mediana, uncensored vs stock | 0,014 |

## Requisitos de hardware

- VRAM/RAM estimada: Q3_K requiere aproximadamente 60 GiB de RAM en 4x RTX 3090; 137 GiB en 2x o 1x RTX 3090; la configuracion de 1 tarjeta con Engram en NVMe baja a 45 GiB con IQ2.
- Tamano en disco: conjunto Q3_K de 150 GB (86,2 GB trunk + 63,4 GB Engram); conjunto IQ2_XXS de 115 GB (51,1 GB trunk + 63,4 GB Engram); torre de vision 1,04 GB.
- GPU recomendadas: RTX 3090 (arquitectura 86) es el objetivo declarado; no se documentan otras GPUs en la informacion disponible.
- Cabe en consumer GPU: si, en 1, 2 o 4 RTX 3090 de 24 GB segun configuracion.
- Opciones de despliegue: exclusivamente el motor `maya-hy4f` de la rama `hy4-flash` de Project Maya (clonar, compilar con CUDA y lanzar `python -m serve.server --engine maya`). El autor afirma que llama.cpp estandar no carga el modelo.
- Latencia y throughput: ver tabla de benchmarks (176-251 tok/s de decodificacion en 4 tarjetas; 37-54 tok/s en 1 tarjeta con Q3_K; prefill de 2947 tok/s en 4 tarjetas).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas que permitan una comparacion de rendimiento con alternativas. Comparativa estructural con las variantes del mismo modelo base:

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| alesha-pro/Hy4-flash-Q3_K-MTP-GGUF (Q3_K) | 222,7B | 262.144 | GGUF multi-parte | Tencent Hy License v1.0 | 1-4x RTX 3090 |
| alesha-pro/Hy4-flash-Q3_K-MTP-GGUF (IQ2_XXS) | 222,7B | 262.144 | GGUF multi-parte | Tencent Hy License v1.0 | 1-2x RTX 3090 |
| tencent/Hy4-flash (base) | 222,7B | 262.144 | safetensors | Tencent Hy License v1.0 | datacenter |
| AngelSlim/Hy4-flash-GGUF | 222,7B | 262.144 | GGUF | Tencent Hy License v1.0 | no disponible |
| AtomicChat/Hy4-flash-GGUF | 222,7B | 262.144 | GGUF | Tencent Hy License v1.0 | no disponible |

## Limitaciones y advertencias

- La abliteracion elimina la mayoria de los rechazos, no todos: quedan 32 rechazos en AdvBench 64 + JailbreakBench 82 y 3 en AdvBench 24 con thinking on. No es un modelo alineado para produccion orientada al publico general.
- La abliteracion altera la distribucion de salida: 85,7% de coincidencia de token top frente al stock en texto largo (dos ejecuciones stock coinciden en 88,3%), con KL mediana de 0,014.
- La cuantizacion IQ2_XXS se aleja mas del modelo base: 74-76% de coincidencia de token top frente al 88,3-88,5% de Q3_K.
- El autor no aporta benchmarks de tareas, por lo que no hay evidencia publicada sobre la degradacion en razonamiento, codigo o matematicas.
- El modelo solo carga con el motor Project Maya de la rama `hy4-flash`; llama.cpp estandar no lo soporta, lo que limita la portabilidad y el soporte comunitario.
- La licencia Tencent Hy v1.0 incluye terminos adicionales en la seccion 10 para grandes negocios de Model-as-a-Service; es necesario revisar el archivo LICENSE antes de un uso comercial a escala.
- No se dispone de informacion sobre sesgos, idiomas soportados ni tasas de alucinacion.
- El contexto de 262.144 tokens requiere configuraciones de memoria muy elevadas (137 GiB de RAM en 1-2 tarjetas con Q3_K), lo que puede provocar swap y caidas de rendimiento si no se planifica.
- El repositorio ocupa 201,7 GB; la descarga y el almacenamiento deben dimensionarse en consecuencia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/alesha-pro/Hy4-flash-Q3_K-MTP-GGUF
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Motor Project Maya (rama `hy4-flash`): https://github.com/alesha-pro/project-maya/tree/hy4-flash
- Documentacion de Hy4-flash en Project Maya: https://github.com/alesha-pro/project-maya/blob/hy4-flash/docs/HY4-FLASH.md
- Project Maya original (mw00 y Peasant Smith): https://github.com/mw00/project-maya
- Strata (Niko1221): https://github.com/Niko1221/Strata
- llama.cpp y ggml: https://github.com/ggml-org/llama.cpp
- Cuantizacion Q3_K original: https://huggingface.co/AngelSlim/Hy4-flash-GGUF
- Expertos IQ2 originales: https://huggingface.co/AtomicChat/Hy4-flash-GGUF
