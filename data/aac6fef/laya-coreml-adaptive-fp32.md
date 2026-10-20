# aac6fef/laya-coreml-adaptive-fp32

## Resumen

`aac6fef/laya-coreml-adaptive-fp32` es una conversión nativa a Core ML del modelo `convaiinnovations/laya` (revisión fijada `c5d78730f3493e4fe16d61507ef4b78eef7318cf`), publicada por el usuario independiente `aac6fef`. No es un modelo nuevo ni un reentrenamiento: es un empaquetado de inferencia para Apple silicon que reproduce el comportamiento del export denso original en precisión float32, con grafos adaptativos para lotes de tamaño 1, 2, 4 y 16. El pipeline declarado es `text-classification`: el modelo no genera texto libre, sino que selecciona una respuesta entre un conjunto de opciones etiquetadas y devuelve probabilidades calibradas.

Su relevancia es de infraestructura más que de modelado. Permite ejecutar Laya en macOS 15 o superior sin PyTorch, MLX ni Transformers, únicamente con el runtime `laya-coreml >= 0.5.1`, lo que simplifica el despliegue en aplicaciones nativas de Mac. El bundle soporta hasta 32 opciones por grafo, una capacidad de 512 tokens y buckets densos para secuencias cortas, con carga perezosa de los grafos adaptativos.

El paquete es pequeño en adopción (9 descargas, 0 likes en el momento de la consulta) y se distribuye con licencia Apache 2.0. El autor documenta una validación numérica frente al modelo upstream en FP32, pero no hay resultados de benchmarks estándar ni datos sobre parámetros, idiomas o datos de entrenamiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible para el modelo base; el artefacto es una conversión Core ML (mlprogram) con grafos adaptativos de lote B=1/2/4/16 |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 512 tokens de capacidad en el bundle; buckets densos para secuencias cortas |
| Tipos de cuantización | FP32 (float32) en CPU/GPU; el autor advierte que FP16 no es numéricamente idéntico a FP32 y no se distribuye en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (la licencia del modelo base no se especifica en la información disponible) |
| Formato de pesos | Core ML (bundle compilado); repositorio de 1,7 GB |
| Pipeline | text-classification |
| Opciones por grafo | Hasta 32 |
| Precisión de cómputo | float32, CPU/GPU (no es el modelo ANE de forma fija) |
| Runtime requerido | `laya-coreml >= 0.5.1` (`pip install laya-coreml==0.5.1`) |
| Plataforma | Apple silicon, macOS 15 o superior; probado en M3 Max |
| Comportamiento lógico | Sigue Laya v0.4.12 upstream en lote y ventana |
| Descargas / likes | 9 / 0 |
| Fecha de creación | 2026-10-20 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base `convaiinnovations/laya`: no se indican tipo de transformer, número de capas, dimensiones ocultas, parámetros totales ni composición del dataset de entrenamiento. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineación. Lo único verificable es el comportamiento funcional: es un clasificador que, dada una entrada de texto y un conjunto de opciones con instrucciones en lenguaje natural, devuelve la opción seleccionada junto con probabilidades calibradas.

El artefacto publicado es un export Core ML con cuatro grafos adaptativos (B=1, 2, 4 y 16), buckets densos para secuencias cortas, capacidad de 512 tokens y hasta 32 opciones por grafo. Los grafos se cargan de forma perezosa y el runtime mantiene por defecto una caché de como máximo cuatro instancias de ejecución adicionales (nunca respuestas almacenadas), configurable con `shape_cache_size=0` para desactivarla. El autor indica que los ficheros del modelo son idénticos byte a byte al export denso validado, y que los cambios de este repositorio afectan solo a metadatos de procedencia, a la model card y a la licencia. La verificación es finita (63 casos) y el propio autor advierte que no demuestra exactitud universal.

## Capacidades

- Clasificación de texto con opciones etiquetadas: recibe un texto y un diccionario de opciones con instrucciones (por ejemplo, `{"refund": {"type": "noul", "instructions": "Does the customer request a refund?"}}`) y devuelve la opción seleccionada.
- Hasta 32 opciones por grafo, lo que permite clasificación multi-etiqueta en una sola llamada.
- Inferencia por lotes con grafos dedicados para B=1, 2, 4 y 16.
- Entradas de hasta 512 tokens, con buckets densos optimizados para secuencias cortas.
- Devuelve probabilidades calibradas además de la respuesta seleccionada.
- Ejecución sin PyTorch, MLX ni Transformers; solo requiere el runtime `laya-coreml`.
- Reproducibilidad: se puede fijar el SHA de commit del repositorio con `revision=` en la carga.
- No se documenta generación de texto abierta, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking".
- No hay evidencia publicada sobre capacidades multilingües.

## Casos de uso

- Clasificación de intenciones en atención al cliente: el ejemplo oficial del autor detecta si un cliente solicita un reembolso; con hasta 32 opciones por grafo se pueden cubrir de una vez categorías como reembolso, cancelación, incidencia técnica o consulta de facturación.
- Enrutado de tickets en aplicaciones macOS nativas: el modelo se integra vía Core ML en una app de escritorio y asigna cada ticket a un equipo o cola sin depender de servicios en la nube.
- Etiquetado por lotes offline: usando los grafos B=4 y B=16 se pueden procesar lotes de documentos cortos en un Mac para tareas de clasificación masiva (por ejemplo, triaje de correos o notas).
- Procesamiento con requisitos de privacidad: al ejecutarse localmente en Apple silicon y no requerir Python ni frameworks de deep learning en tiempo de inferencia, es apto para datos que no deben salir del dispositivo (sanidad, legal, RRHH).
- Moderación o filtrado previo en pipelines de contenido: clasificación rápida de fragmentos de hasta 512 tokens en categorías predefinidas antes de un modelo generativo mayor.
- Referencia de validación numérica: al ser byte-idéntico al export denso validado, sirve como baseline FP32 para comparar contra futuras exportaciones FP16 o versiones optimizadas para ANE.
- Prototipado de clasificadores zero-shot con instrucciones en lenguaje natural: permite definir las clases con texto en lugar de reentrenar, útil para pruebas de concepto rápidas en un Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo incluye una validación de equivalencia frente al modelo upstream en FP32:

| Métrica de validación | Resultado |
|---|---|
| Respuestas seleccionadas coincidentes con upstream FP32 | 63/63 |
| Error máximo de probabilidad calibrada | 6,43223004e-06 |
| Llamadas repetidas estables | 100 |
| Comprobaciones de salida pública | completas (según `validation.json`) |

Estas cifras miden fidelidad de la conversión, no calidad del modelo. No hay datos de latencia ni de throughput publicados.

## Requisitos de hardware

- Plataforma obligatoria: Apple silicon con macOS 15 o superior. No hay soporte para GPU NVIDIA, Linux ni Windows.
- Equipo de referencia del autor: M3 Max.
- Precisión FP32 sobre CPU/GPU; el bundle no es el modelo ANE de forma fija.
- Memoria: el benchmark FP32 de la versión 0.5.1 registró un RSS pico del proceso Core ML de entre 5,10 y 8,77 GiB. El autor aclara que no es una medida de memoria unificada total ni una estimación para FP16.
- Espacio en disco: repositorio de 1,7 GB.
- Memoria residente adicional: la caché de formas por defecto retiene hasta cuatro instancias de ejecución extra, con un coste "sustancial" de memoria residente según el autor; `shape_cache_size=0` la desactiva.
- Despliegue: exclusivamente mediante el runtime `laya-coreml` sobre Core ML. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, dado que el formato es Core ML y la tarea es clasificación.
- Latencia y throughput: no disponibles. El autor señala que las formas nuevas o en frío pueden ser más lentas y que la caché mejora la latencia de formas repetidas.

## Comparativa con modelos similares

| Modelo | Formato / runtime | Parámetros | Contexto | Precisión | Licencia | Notas |
|---|---|---|---|---|---|---|
| `aac6fef/laya-coreml-adaptive-fp32` | Core ML, `laya-coreml >= 0.5.1` | No disponible | 512 tokens | FP32 | Apache 2.0 | Conversión independiente, lotes 1/2/4/16, hasta 32 opciones |
| `convaiinnovations/laya` (upstream) | Pesos originales (framework no especificado) | No disponible | No disponible | No disponible | No disponible en la información | Modelo de referencia; requiere el stack original |
| Otras conversiones Core ML de clasificadores | Core ML | No disponible | No disponible | No disponible | No disponible | No se documentan alternativas comparables en la información proporcionada |

No se dispone de datos suficientes para comparar rendimiento, tamaño o calidad frente a otros clasificadores de la misma categoría.

## Limitaciones y advertencias

- Dependencia total de Apple silicon y macOS 15+: no es portable a entornos Linux, CUDA ni a la mayoría de infraestructuras de servidor.
- La validación es finita (63 respuestas y 100 llamadas repetidas); el propio autor advierte que no demuestra exactitud universal del modelo.
- No hay benchmarks de calidad publicados ni comparación con clasificadores alternativos.
- FP16 no es numéricamente idéntico a FP32; migrar a una variante FP16 puede alterar las probabilidades.
- Ventana limitada a 512 tokens: textos más largos requieren troceado o resumen previo.
- Idiomas soportados no documentados; no hay evidencia de comportamiento multilingüe.
- Riesgo de error de clasificación y de calibración: al no generar texto, el fallo típico es una etiqueta incorrecta o una confianza mal calibrada, no una alucinación en sentido estricto.
- La licencia del modelo base no se especifica; aunque el derivado declara Apache 2.0, conviene verificar los términos del upstream antes de un uso comercial en producción.
- Conversión no oficial e independiente, con 9 descargas y 0 likes: sin validación por parte de la comunidad.
- Coste de memoria considerable (5,10-8,77 GiB de RSS pico en FP32) y consumo adicional si se mantiene activa la caché de formas.
- Límite de 32 opciones por grafo; escenarios con más clases requieren varios grafos o varias llamadas.
- Las formas nuevas o en frío pueden introducir latencia adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aac6fef/laya-coreml-adaptive-fp32
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio del runtime: https://github.com/mizorewww/laya-coreml
- Evidencia de cualificación de la versión 0.5.1: https://github.com/mizorewww/laya-coreml/blob/main/docs/QUALIFICATION_0_5_1.md
- Fichero de validación: `validation.json` (incluido en el repositorio de HuggingFace)
