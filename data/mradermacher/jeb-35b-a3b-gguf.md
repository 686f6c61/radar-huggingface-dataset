# mradermacher/jeb-35b-a3b-GGUF

## Resumen

mradermacher/jeb-35b-a3b-GGUF es un repositorio de cuantizaciones estáticas en formato GGUF generado por el usuario mradermacher a partir del modelo base szybkie-ai/jeb-35b-a3b. No se trata por tanto de un modelo entrenado por el autor del repositorio, sino de una conversión y cuantización de pesos ya existentes, orientada a su ejecución en llama.cpp y herramientas compatibles (Ollama, LM Studio, text-generation-webui, etc.). La model card es mínima: se limita a indicar que son cuantizaciones estáticas del modelo base y no aporta información sobre arquitectura, datos de entrenamiento, licencia o idiomas.

La información disponible sobre el modelo presenta una contradicción relevante que conviene señalar antes de cualquier evaluación. Por un lado, el nombre del repositorio sigue la convención habitual de los modelos de mezcla de expertos (MoE) con "35b" como parámetros totales y "a3b" como parámetros activos, lo que sugeriría un modelo de aproximadamente 35 000 millones de parámetros totales y 3000 millones activos por token. Por otro, los metadatos de HuggingFace asociados a safetensors indican un total de 446 571 248 parámetros (unos 447 millones), y el tamaño completo del repositorio es de solo 1,5 GB, cifra incompatible con las 13 cuantizaciones anunciadas de un modelo de 35 000 millones de parámetros. No hay información pública en la búsqueda realizada que permita resolver esta discrepancia.

El interés práctico del repositorio es limitado pero claro: ofrece un conjunto amplio de cuantizaciones (desde Q2_K hasta F16, incluyendo IQ4_XS y variantes Q3/Q4/Q5/Q6/Q8) listas para descargar y ejecutar con llama.cpp. Sin embargo, la ausencia de licencia declarada, de benchmarks y de documentación del modelo base hace que no sea recomendable utilizarlo en producción sin una verificación previa del recuento real de parámetros, del modelo original y de las condiciones de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se documenta en la model card; el sufijo "a3b" del nombre sugiere mezcla de expertos, sin confirmar) |
| Parametros totales | discrepancia: los metadatos de safetensors indican 446 571 248 parametros; el nombre del repositorio sugiere ~35 000 millones |
| Parametros activos | no disponible (no confirmado; el nombre "a3b" apuntaria a ~3000 millones activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (conversion desde pesos HuggingFace safetensors; convert_type: hf, quantize_version: 2, output_tensor_quantised: 1) |

## Arquitectura y entrenamiento

No hay informacion en la model card ni en los resultados de busqueda disponible sobre la arquitectura del modelo base szybkie-ai/jeb-35b-a3b. El repositorio no incluye detalles sobre tipo de red (transformer denso, mezcla de expertos, SSM o hibrida), numero de capas, dimension de embedding, mecanismo de atencion ni estrategia de decodificacion. Tampoco se documenta el proceso de entrenamiento: no hay datos sobre numero de tokens, composicion del dataset, fases de ajuste (SFT, RLHF, DPO) ni innovaciones tecnicas asociadas.

Lo unico verificable tecnicamente es el proceso de cuantizacion aplicado por mradermacher, resumido en los metadatos de la model card: conversion desde formato HuggingFace (convert_type: hf), cuantizacion estatica de los tensores de salida (output_tensor_quantised: 1) y version 2 del pipeline de cuantizacion (quantize_version: 2). Se ofrecen 13 variantes de cuantizacion, desde F16 sin perdida adicional hasta Q2_K e IQ4_XS con compresion agresiva.

## Capacidades

- No se documentan capacidades especificas en la informacion disponible. La model card no describe tareas soportadas, modos de razonamiento, soporte de tool calling ni capacidades multimodales.
- Generacion de texto: capacidad implicita en cualquier modelo de lenguaje cuantizado en GGUF, pero sin confirmacion documental.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Formato de ejecucion: al estar en GGUF, es compatible con el ecosistema llama.cpp (Ollama, LM Studio, llama-cpp-python, text-generation-webui, koboldcpp), lo que constituye la capacidad operativa mas relevante del repositorio.

## Casos de uso

- Ejecucion local en CPU sin GPU: gracias a las cuantizaciones Q4_K_M y Q2_K, el modelo puede desplegarse en llama.cpp sobre un portatil o servidor sin acelerador, siempre que se confirme primero el recuento real de parametros y la memoria requerida.
- Prototipado rapido de aplicaciones de generacion de texto: descargar una cuantizacion Q4_K_M y levantarla con Ollama permite tener un endpoint HTTP local en minutos, util para validar una interfaz o un pipeline antes de comprometerse con una infraestructura mayor.
- Despliegue en dispositivos con memoria limitada o edge: si se confirma el recuento de 447 millones de parametros, las variantes Q4_K_S o Q2_K ocuparian unos cientos de megabytes y podrian ejecutarse en mini-PC, Raspberry Pi de gama alta o telefonos, algo imposible con un modelo de 35 000 millones de parametros.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 13 variantes del mismo modelo, lo que permite medir la degradacion de calidad y la ganancia de velocidad entre Q2_K, Q3_K_S, Q4_K_M, Q6_K y F16 sobre el mismo conjunto de prompts, un caso de uso metodologico directo.
- Integracion en pipelines de CI para pruebas de humo: al ser un artefacto pequeno y autoconenido, puede incluirse en un contenedor de test que verifique que la aplicacion arranca, carga el modelo y devuelve respuestas coherentes antes de desplegar el modelo definitivo.
- Fine-tuning sobre el modelo base en formato HuggingFace: el repositorio enlaza al modelo original szybkie-ai/jeb-35b-a3b, de modo que el flujo realista es adaptar el modelo base en safetensors y usar este repositorio solo para la fase de inferencia cuantizada.
- Generacion de embeddings o clasificacion ligera: si el modelo base resulta ser de ~447 millones de parametros, es viable usarlo como encoder para tareas de clasificacion, etiquetado o reranking en lugar de para generacion abierta, con coste de inferencia muy bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra evaluacion, y la busqueda web realizada no ha devuelto documentacion tecnica sobre el modelo base szybkie-ai/jeb-35b-a3b.

## Requisitos de hardware

Las estimaciones siguientes se ofrecen para los dos escenarios compatibles con los datos disponibles y deben tratarse como calculos de orden de magnitud, no como mediciones.

- Escenario A, si el modelo tiene ~447 millones de parametros (segun los metadatos de safetensors):
  - F16: aproximadamente 0,9 GB de pesos.
  - Q8_0: aproximadamente 0,5 GB.
  - Q4_K_M: aproximadamente 0,3 GB.
  - Cabe en cualquier GPU consumer, incluso en iGPU y en telefonos de gama alta; la inferencia en CPU es perfectamente viable.
  - Despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; vLLM es posible pero sobredimensionado para este tamano.
- Escenario B, si el modelo tiene realmente 35 000 millones de parametros totales con 3000 millones activos (MoE):
  - F16: aproximadamente 70 GB de pesos, mas cache KV.
  - Q8_0: aproximadamente 37 GB.
  - Q4_K_M: aproximadamente 20-21 GB.
  - Q2_K: aproximadamente 12-13 GB.
  - GPU recomendadas: A100 80 GB, H100 80 GB o 2x A100 40 GB para F16 y Q8_0; 1x A100 40 GB o 1x RTX 4090 24 GB para Q4_K_M; 1x RTX 3090/4090 24 GB con offload parcial de capas a CPU para Q5_K_M y Q6_K.
  - Al ser (presuntamente) MoE con ~3000 millones de parametros activos, la decodificacion seria notablemente rapida en relacion con el tamano total, con throughput alto en GPU y aceptable en configuraciones hibridas CPU+GPU.
- Latencia y throughput: no disponibles en la informacion proporcionada para ningun escenario.
- Opciones de despliegue confirmadas por el formato: llama.cpp y todo su ecosistema (Ollama, LM Studio, text-generation-webui, koboldcpp, llama-cpp-python). vLLM y TGI requieren convertir los GGUF a safetensors o usar los pesos originales de HuggingFace; no estan soportados de forma nativa a partir de este repositorio.

## Comparativa con modelos similares

No es posible establecer una comparativa rigurosa. El modelo base szybkie-ai/jeb-35b-a3b no esta documentado en la informacion disponible y los dos recuentos de parametros manejados (447 millones frente a ~35 000 millones) pertenecen a categorias completamente distintas, con alternativas de referencia diferentes en cada caso.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/jeb-35b-a3b-GGUF | discrepancia: 446 571 248 segun safetensors; "35b-a3b" segun el nombre | no disponible | no disponible | no disponible | GGUF en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Discrepancia critica de parametros: los metadatos indican 446 571 248 parametros y el repositorio ocupa 1,5 GB, mientras que el nombre sugiere 35 000 millones. Antes de dimensionar infraestructura hay que descargar una cuantizacion y verificar el recuento real de tensores y el tamano del archivo.
- Licencia no disponible: ni la model card ni los metadatos de HuggingFace declaran licencia. En la practica esto equivale a ausencia de permiso explicito, por lo que el uso comercial es juridicamente arriesgado hasta que el autor del modelo base lo aclare.
- Trazabilidad limitada: el repositorio es una cuantizacion de terceros, de modo que cualquier problema de sesgo, calidad o seguridad proviene del modelo base szybkie-ai/jeb-35b-a3b, del que no hay documentacion publica localizada.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje generativo y no evaluado aqui; no hay benchmarks que permitan estimar la tasa de error.
- Perdida por cuantizacion: las variantes Q2_K, Q3_K_S e IQ4_XS degradan la calidad de forma perceptible en modelos pequenos; conviene validar la tarea concreta antes de elegir una cuantizacion agresiva.
- Idioma: no se declara ninguna lista de idiomas soportados; no hay garantia de un rendimiento correcto en castellano.
- Contexto: se desconoce la longitud de contexto soportada y si las cuantizaciones conservan la ventana completa del modelo original.
- Popularidad nula: cero descargas y cero valoraciones en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Fecha de creacion inusual: los metadatos indican 2026-09-21, una fecha futura respecto al momento habitual de consulta, lo que puede reflejar un error de metadatos o un repositorio de prueba.
- Model card practicamente vacia: no incluye instrucciones de uso, plantilla de chat ni parametros de muestreo recomendados, por lo que habra que probar configuraciones a ciegas.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/mradermacher/jeb-35b-a3b-GGUF
- Modelo base referenciado en la model card: https://huggingface.co/szybkie-ai/jeb-35b-a3b
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- La busqueda web realizada no ha devuelto enlaces relevantes (papers, blogs, repos o demos) sobre este modelo; los resultados obtenidos corresponden a servicios de medicion de velocidad de banda ancha y no guardan relacion con el modelo.
