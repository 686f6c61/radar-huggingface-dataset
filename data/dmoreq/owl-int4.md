# DMoreQ/owl-int4

## Resumen

owl-int4 es un bi-encoder ModernBERT-base cuantizado a INT4 para deteccion de clones de codigo (code clone detection). Lo publica DMoreQ como derivado del checkpoint publico `Shuu12121/CodeCloneDetection-ModernBERT-Owl`, afinado sobre BigCloneBench. El repositorio no entrena nada nuevo: solo aplica cuantizacion INT4 group-64 sobre los pesos del modelo original y los empaqueta para su uso con el runtime `engram-judge`, un binario offline sin dependencias de Python ni de red.

El modelo resuelve un problema muy concreto: decidir si dos fragmentos de codigo son duplicados, devolviendo una similitud coseno sobre embeddings con pooling CLS. Con 78,2 millones de parametros y una ventana de contexto propia de ModernBERT (hasta 8192 tokens, segun la arquitectura base), esta pensado para integrarse en pipelines de revision de codigo, deteccion de plagio o deduplicacion de repositorios que necesitan ejecutarse en local.

Su relevancia actual es doble: por un lado demuestra que un clasificador de similitud de codigo puede correr en hardware consumer con un consumo de disco de 85,4 MB; por otro, ilustra el coste real de la cuantizacion agresiva, con una caida de F1 de 0,0026 puntos respecto al baseline F32 y una similitud coseno media de 0,9569 frente a los embeddings originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-base bi-encoder, 12 capas, 768 dimensiones ocultas, pooling CLS |
| Parametros totales | 78.213.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura base ModernBERT) |
| Tipos de cuantizacion | INT4 group-64 (dos nibbles con signo por byte, escalas por grupo); pesos desquantizados a F16 en carga |
| Idiomas soportados | codigo (entrenado sobre Java de BigCloneBench) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` con tensores `*.q4` y `*.scale`), tokenizer BPE en `tokenizer/tokenizer.json`, manifiesto `lazy.json` |

## Arquitectura y entrenamiento

El modelo es un bi-encoder basado en ModernBERT-base: 12 capas de transformer con 768 dimensiones ocultas y pooling CLS para producir un unico vector L2-normalizado por entrada. La innovacion de ModernBERT respecto a BERT clasico (rotary positional embeddings, atencion alterna local/global, Flash Attention) se hereda del checkpoint base; el repositorio no modifica la arquitectura.

No hay entrenamiento adicional en este repositorio. El autor parte del checkpoint `Shuu12121/CodeCloneDetection-ModernBERT-Owl`, un sentence-transformer afinado sobre BigCloneBench (dataset de pares de funciones Java etiquetados como clones o no clones), y aplica cuantizacion INT4 con escalas por grupo de 64 elementos. La carga desquantiza los pesos a F16, de modo que la cuantizacion reduce el tamano en disco (85,4 MB) pero no acelera la aritmetica: la inferencia corre a la anchura desquantizada.

## Capacidades

- Generacion de embeddings de codigo: produce vectores L2-normalizados por fragmento, aptos para busqueda por similitud coseno o producto escalar.
- Deteccion de clones de codigo: clasifica pares como duplicados o no duplicados con un umbral configurable (por defecto 0,5 en el ejemplo de la model card).
- Cache de un lado del par: el subcomando `embed` permite indexar fragmentos y comparar despues con un producto escalar, lo que abarata la comparacion contra un corpus grande.
- Ejecucion offline: el runtime `engram-judge` no requiere Python, red ni demonio; funciona como binario nativo.
- Aceleracion por Metal: la model card reporta latencias medidas en Apple Metal.
- Capacidades multilingues de codigo: no verificadas; el entrenamiento es exclusivamente Java.
- Tool calling, agentes, vision, audio o modo thinking: no disponibles en este modelo.

## Casos de uso

- Deteccion de duplicados en revision de codigo: integrar `eg-judge similarity` como paso previo a la revision humana para marcar funciones casi identicas dentro de un mismo repositorio, usando el umbral de 0,5 como filtro inicial.
- Deduplicacion de corpus de entrenamiento: indexar con `eg-judge embed` todos los fragmentos de un dataset y eliminar pares con similitud alta antes de entrenar modelos de codigo, reduciendo contaminacion y sobreajuste.
- Deteccion de plagio en entornos academicos: comparar entregas de programacion contra una base de soluciones conocidas, con la ventaja de que el modelo corre en local sin enviar codigo de estudiantes a servicios externos.
- Guardia en pipelines de CI: bloquear merges que introduzcan funciones duplicadas de codigo ya existente, ejecutando el binario en el runner sin dependencias de Python.
- Busqueda semantica de codigo: construir un indice de embeddings de un repositorio y recuperar fragmentos similares a una consulta, util para asistentes internos de documentacion.
- Analisis forense de repositorios: comparar un proyecto sospechoso contra una base de codigo conocida para identificar copias totales o parciales, con la salvedad de que los pares casi identicos (un operador de diferencia) caen a F1 0,7139.
- Despliegue en portatiles de desarrollo: con 85,4 MB en disco y ~1,6 GB de RSS pico en Metal, cabe en un MacBook sin GPU dedicada y permite validaciones locales antes de subir a CI.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| owl-int4 | BigCloneBench | F1 | 0,9592 |
| Baseline F32 (referencia) | BigCloneBench | F1 | 0,9618 |
| owl-int4 (pares casi identicos) | BigCloneBench | F1 | 0,7139 |

Metricas de eficiencia declaradas:

| Metrica | Valor |
|---|---|
| Similitud coseno media frente a F32 | 0,9569 |
| Latencia p50, par corto (Apple Metal) | 40 ms |
| Latencia p50, longitud tipica de BigCloneBench (Apple Metal) | 133 ms |
| RSS pico | ~1,6 GB (memoria unificada Metal, pesos desquantizados en carga) |
| Tamano en disco | 85,4 MB |

## Requisitos de hardware

- VRAM/RAM estimada: ~1,6 GB de RSS pico segun el autor, porque los pesos se desquantizan a F16 en carga. En GPU dedicada, la huella es del orden de 1-2 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre; el autor mide sobre Apple Metal. Para servidores, una T4 o superior es mas que suficiente.
- Consumer GPU: si, cabe en cualquier GPU integrada o dedicada moderna (GTX 1650, RTX 3060, Apple Silicon). El cuello de botella es la CPU si no hay aceleracion.
- Opciones de despliegue: el runtime oficial es `engram-judge` (binario nativo, sin Python). No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, dado que el formato INT4 group-64 con manifiesto `lazy.json` es propio.
- Latencia y throughput: 40 ms por par corto y 133 ms por par a longitud de BigCloneBench en Apple Metal. No se publican cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 BigCloneBench | Licencia | Formato |
|---|---|---|---|---|---|
| owl-int4 (este) | 78,2 M | no disponible | 0,9592 | Apache-2.0 | safetensors INT4 |
| Shuu12121/CodeCloneDetection-ModernBERT-Owl (upstream F32) | 78,2 M (misma base) | no disponible | 0,9618 | Apache-2.0 | safetensors F32 |
| Modelos tipo CodeBERT/GraphCodeBERT para clone detection | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa natural es contra el checkpoint original: owl-int4 pierde 0,0026 puntos de F1 a cambio de reducir el tamano en disco en un orden de magnitud (85,4 MB frente a los ~300 MB esperables en F32). No se dispone de datos publicados de otros detectores de clones en la informacion proporcionada para una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- Pares casi identicos: cuando dos fragmentos difieren en un solo operador, el F1 cae a 0,7139. El vector pooled borra esa diferencia; para esa banda hay que usar diff a nivel de token o AST.
- Sesgo de lenguaje: BigCloneBench es Java. El rendimiento en Python, Rust o TypeScript no esta medido y no deberia asumirse.
- La cuantizacion no acelera: INT4 reduce el tamano en disco, pero la inferencia corre a F16 tras desquantizar. No esperes ganancias de velocidad por la cuantizacion.
- Dependencia del runtime: el formato INT4 group-64 con `lazy.json` es propio de `engram-judge`; no es portable a otros motores de inferencia sin conversion.
- Riesgo de falsos positivos por umbral: el umbral por defecto de 0,5 es bajo para codigo; en produccion conviene calibrarlo contra un conjunto etiquetado propio.
- Datos de benchmark no verificados: el F1 de 0,9592 esta declarado por el autor, no auditado de forma independiente.
- Licencia Apache-2.0: permite uso comercial, pero exige mantener la atribucion al checkpoint upstream (`Shuu12121/CodeCloneDetection-ModernBERT-Owl`).
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DMoreQ/owl-int4
- Checkpoint upstream: https://huggingface.co/Shuu12121/CodeCloneDetection-ModernBERT-Owl
- Runtime engram-judge: https://github.com/dmoreq/engram-judge
- Dataset BigCloneBench: https://huggingface.co/datasets/google/code_x_glue_cc_clone_detection_big_clone_bench
