# mradermacher/Lucent-i1-GGUF

## Resumen

Lucent-i1-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo KirkAis/Lucent, publicado por el usuario mradermacher, conocido en la comunidad por generar versiones cuantizadas de pesos de terceros. No se trata por tanto de un modelo entrenado desde cero, sino de una conversion y compresion del modelo original de aproximadamente 14.770 millones de parametros, orientada a su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles.

El repositorio incluye un conjunto amplio de cuantizaciones generadas con el metodo imatrix (matriz de importancia de pesos), lo que en teoria preserva mejor la calidad frente a una cuantizacion uniforme a igual numero de bits. Estan disponibles desde variantes muy agresivas de 1 bit (IQ1_S, IQ1_M) hasta Q6_K, pasando por toda la familia K-quant e I-quant intermedia, con un tamano total de repositorio de 43,1 GB.

La relevancia de esta ficha es principalmente practica: permite desplegar localmente un modelo conversacional de ~14,8B en GPUs de gama alta de consumo, siempre que se asuma la incertidumbre asociada a la falta de informacion sobre el modelo base (arquitectura, datos de entrenamiento, licencia y benchmarks no publicados en la informacion disponible). El modelo esta etiquetado como conversational y endpoints_compatible, lo que sugiere uso en inferencia por API una vez servido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base KirkAis/Lucent sin especificar en la informacion disponible) |
| Parametros totales | 14.770.033.664 (~14,77B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (convert_type: hf, output_tensor_quantised: 1, quantize_version: 2) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base KirkAis/Lucent en los datos proporcionados. El repositorio no incluye config.json, model card descriptiva ni detalles de entrenamiento; unicamente se indica en el README que se trata de cuantizaciones weighted/imatrix del modelo https://huggingface.co/KirkAis/Lucent. Por tanto, cualquier afirmacion sobre si es un transformer denso, un MoE, un modelo hibrido o un SSM seria especulativa.

Lo que si se puede afirmar con certeza es el proceso de derivacion: conversion desde pesos en formato HuggingFace (convert_type: hf) y posterior cuantizacion en GGUF version 2, con cuantizacion de tensores de salida activada (output_tensor_quantised: 1) y uso de imatrix ponderada. Esta tecnica, habitual en el ecosistema de mradermacher, calcula una matriz de importancia a partir de un corpus de calibracion para decidir que pesos conservan mas precision. Ademas, el repositorio agradece explicitamente a nicoboss el acceso a su supercomputadora privada, lo que permitio generar un numero mayor de variantes imatrix de las que seria posible con recursos propios. No hay informacion sobre tokens de entrenamiento, composicion del dataset ni fases de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como conversational, por lo que el caso de uso principal es el dialogo multi-turno.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible indica que puede servirse a traves de infraestructura de inferencia estandar una vez convertido o cargado.
- Ejecucion local en CPU y GPU: al estar en GGUF, soporta offloading parcial de capas, lo que permite ejecutarlo incluso sin GPU dedicada.
- Razonamiento y conocimiento general: no disponible (no hay benchmarks ni descripcion de capacidades especificas).
- Generacion de codigo: no disponible.
- Matematicas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Asistente conversacional autoalojado: desplegando la variante Q4_K_M o Q5_K_M en llama.cpp u Ollama, se obtiene un chatbot de ~14,8B parametros ejecutable en una unica GPU de 24 GB, apto para prototipos internos donde no se quiera depender de APIs externas.
- Procesamiento de texto por lotes en servidor sin GPU: con las cuantizaciones Q4 o IQ4 y offloading a CPU, se puede usar para resumir, clasificar o reformatear documentos en un servidor con RAM abundante y sin acelerador dedicado.
- Experimentacion academica con cuantizacion extrema: las variantes IQ1_S, IQ1_M e IQ2_XXS permiten estudiar la degradacion de calidad de un modelo de ~14,8B por debajo de 3 bits por parametro, un caso de interes para investigacion en compresion de modelos.
- Base para fine-tuning posterior: al ser pesos derivados de un modelo HuggingFace original, se puede partir del modelo base KirkAis/Lucent para ajuste supervisado y despues recuantizar a GGUF con el mismo pipeline.
- Evaluacion comparativa de metodos de cuantizacion: el repositorio ofrece casi toda la matriz de cuantizaciones disponibles (24 variantes), lo que permite medir en igualdad de condiciones el impacto de K-quants frente a I-quants sobre la misma arquitectura.
- Integracion en aplicaciones de escritorio: mediante LM Studio, KoboldCpp o llama-cpp-python, se puede embeber el modelo en una aplicacion local de escritorio con requisitos de VRAM moderados (a partir de ~4-5 GB en IQ2/IQ3).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion alguna (MMLU, HumanEval, GSM8K, ARC, HellaSwag u otros), ni el modelo base KirkAis/Lucent aporta datos en la informacion recuperada. No se deben asumir cifras de rendimiento a partir del tamano de parametros.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del numero de parametros (14,77B) y de la profundidad de bits tipica de cada cuantizacion, no datos publicados por el autor.

| Cuantizacion | Bits aprox. por parametro | VRAM estimada (solo pesos) |
|---|---|---|
| IQ1_S / IQ1_M | ~1,6-1,8 | ~3,5-4,0 GB |
| IQ2_XXS / IQ2_XS / IQ2_S / IQ2_M | ~2,1-2,6 | ~4,5-5,5 GB |
| Q2_K / Q2_K_S | ~2,6-2,8 | ~5,5-6,0 GB |
| Q3_K_S / Q3_K_M / Q3_K_L / IQ3_* | ~3,1-3,9 | ~6,5-8,0 GB |
| IQ4_XS / small-IQ4_NL / Q4_K_S / Q4_K_M / Q4_0 / Q4_1 | ~4,0-4,9 | ~8,5-9,5 GB |
| Q5_K_S / Q5_K_M | ~5,1-5,6 | ~10,5-11,5 GB |
| Q6_K | ~6,1 | ~12,5-13,5 GB |

- GPU recomendadas: RTX 4090, RTX 3090 o RTX 4080 (24 GB o 16 GB) para las variantes Q4 y superiores con contexto moderado; A100 40/80 GB o H100 para servicio concurrente en Q6_K o para mayor longitud de contexto.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4080 y RTX 4090 con cuantizaciones Q4_K_M o inferiores. Las variantes IQ1/IQ2 e IQ3 abren la puerta a GPUs de 6-8 GB (RTX 2060, RTX 3050) con contexto recortado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, KoboldCpp, text-generation-webui (llama.cpp). vLLM soporta GGUF de forma parcial y no siempre con todas las variantes I-quant, por lo que conviene verificar compatibilidad antes de usarlo en produccion.
- Latencia y throughput: no disponible (no hay mediciones publicadas; dependen fuertemente del hardware y del numero de capas descargadas a CPU).

## Comparativa con modelos similares

La informacion disponible no permite comparar con modelos de la misma categoria mas alla de otros repositorios del mismo autor y familia. Los datos de licencia, contexto y rendimiento de las alternativas no estan publicados, por lo que la comparativa se limita a parametros y formato.

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| mradermacher/Lucent-i1-GGUF | ~14,77B | GGUF (imatrix) | no disponible | Objeto de esta ficha; derivado de KirkAis/Lucent |
| mradermacher/Lucent-Witch-31B-i1-GGUF | 31B | GGUF (imatrix) | no disponible | Misma familia de cuantizaciones, mayor tamano |
| mradermacher/Lucy-i1-GGUF | no disponible | GGUF (imatrix) | apache-2.0 | Modelo distinto; solo comparte autor y pipeline de cuantizacion |
| Modelos densos de ~14B en GGUF (por ejemplo la familia Qwen) | ~14B | GGUF | no disponible en esta busqueda | Comparativa de rendimiento no disponible |

No se dispone de datos de benchmarks que permitan establecer una comparacion de calidad con alternativas de tamano similar; cualquier afirmacion al respecto careceria de respaldo.

## Limitaciones y advertencias

- Licencia no declarada: la model card del repositorio no especifica licencia. Esto genera incertidumbre legal para uso comercial; hay que consultar la licencia del modelo base KirkAis/Lucent antes de cualquier despliegue en produccion.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue ni sobre el idioma principal de entrenamiento.
- Sin benchmarks: no existen datos publicados que permitan estimar la calidad real del modelo ni compararlo con alternativas.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de este tamano, agravado por la ausencia de evaluaciones de fidelidad o veracidad.
- Degradacion en cuantizaciones extremas: las variantes IQ1_S, IQ1_M, IQ2_XXS e IQ2_XS comprimen a menos de 3 bits por parametro y suelen producir perdida notable de coherencia, repeticiones y errores gramaticales. No se recomiendan para tareas de razonamiento o generacion de codigo.
- Modelo derivado, no original: los posibles sesgos, datos de entrenamiento y limitaciones provienen del modelo base, del que no se documenta nada en la informacion disponible.
- Contexto desconocido: al no declararse la longitud de contexto, hay que verificar el valor configurado en el GGUF (metadatos) antes de disenar aplicaciones con ventanas largas.
- Repositorio muy reciente y con traccion nula: cero descargas y una sola marca de "me gusta" en el momento de la consulta, sin comunidad que haya validado su comportamiento.
- Fecha de creacion anomala: el repositorio figura creado el 2026-09-30, dato que conviene contrastar en la pagina original por si se trata de un error de metadatos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Lucent-i1-GGUF
- Modelo base: https://huggingface.co/KirkAis/Lucent
- Repositorio relacionado (misma familia, 31B): https://huggingface.co/mradermacher/Lucent-Witch-31B-i1-GGUF
- Repositorio relacionado (Lucy-i1-GGUF): https://huggingface.co/mradermacher/Lucy-i1-GGUF
- Ficha de terceros sobre Lucent-Witch-31B-i1-GGUF: https://free2aitools.com/model/mradermacher/lucent-witch-31b-i1-gguf
- Coleccion de modelos de mradermacher: https://www.aimodels.fyi/creators/huggingFace/mradermacher
- Indice de modelos de HuggingFace: https://router.huggingface.co/models/
