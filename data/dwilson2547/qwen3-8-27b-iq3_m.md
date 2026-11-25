# dwilson2547/Qwen3.8-27B-IQ3_M

## Resumen

Qwen3.8-27B-IQ3_M es una cuantización de 3 bits (IQ3_M, aproximadamente 3,3 bits por peso) del modelo Qwen3.8-27B, desarrollado por el equipo Qwen de Alibaba. La cuantización la firma el usuario dwilson2547 y se ha generado con las herramientas de llama.cpp (llama-imatrix y llama-quantize) a partir de una matriz de importancia calculada sobre un conjunto de calibración de dominio mixto. El objetivo es claro: hacer viable un modelo de 27.320.697.856 parámetros en GPUs de gama consumidora con 16 GB de VRAM.

El resultado ocupa 11,9 GiB en disco (frente a los 27 GiB de la referencia Q8_0) y, según el autor, deja margen para un contexto de 16k tokens en una RTX 5080, con un consumo total medido de 15,7 GiB. Es una pieza relevante para quien quiera ejecutar un modelo grande de razonamiento en local sin renunciar del todo a la calidad, ya que el coste medido en perplejidad frente a la referencia casi sin pérdida es de entre +0,28 y +0,38 puntos.

La ficha describe exclusivamente esta rendición cuantizada; los datos del modelo base (arquitectura, entrenamiento, capacidades) no vienen detallados en la información disponible y se marcan como tales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; transformer presumiblemente, sin confirmar en la informacion) |
| Parametros totales | 27.320.697.856 (27,3B); el autor cita 25,5B en la model card |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible como spec oficial; el autor mide 16k tokens en 16 GB de VRAM |
| Tipos de cuantizacion | IQ3_M (esta version); el ecosistema del modelo base ofrece Q8_0 y Q4_K_M (Unsloth Dynamic) segun la tabla de perplejidad |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Qwen3.8-27B en los datos proporcionados: ni tipo de transformer, ni composición del dataset, ni si hubo RLHF, DPO o fases de razonamiento extendido. La model card solo confirma que es un modelo "thinking-style", es decir, que genera secciones largas de razonamiento antes de la respuesta final, y que el pipeline es text-generation.

Lo que sí está documentado es el proceso de cuantización de esta rendición concreta. La matriz de importancia se calculó con `llama-imatrix` sobre una muestra de calibración de aproximadamente 1,2 millones de caracteres (unos 320k tokens) con esta composición: 42% prosa enciclopédica estilo wiki (Wikitext, CC BY-SA 3.0), 42% prosa web (FineWeb, ODC-By) y 17% código C/C++ (fuentes de llama.cpp, MIT). La cuantización se ejecutó con `llama-quantize --allow-requantize --imatrix` partiendo del GGUF Q8_0 de Unsloth, que a su vez deriva del BF16. Es, por tanto, una cuantización de segunda generación (quant-from-quant); el autor mide el sobrecoste de ese salto en +0,036 / +0,042 / -0,004 puntos de perplejidad frente a una versión de una sola generación desde BF16, y lo califica de empíricamente despreciable. La matriz de importancia no se distribuye como artefacto separado: sus estadísticas quedan embebidas en los pesos cuantizados.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento extendido en modo "thinking": el modelo produce cadenas de razonamiento largas antes de responder, según advierte el autor.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que facilita su despliegue tras una API compatible con el ecosistema de Hugging Face.
- Ejecución en llama.cpp y derivados (Ollama, servidores compatibles con GGUF), con soporte de KV cache configurable.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, agentes, visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Inferencia local en GPU de 16 GB: el caso de uso central de esta rendición. Un desarrollador con una RTX 5080 (o equivalente de 16 GB) puede cargar el modelo con 16k tokens de contexto y un consumo total medido de 15,7 GiB, lo que permite trabajar con un modelo de 27B en hardware de gama consumidora.
- Razonamiento asistido en estación de trabajo: gracias al modo thinking, encaja en tareas de análisis de problemas, planificación y depuración donde interesa ver la cadena de razonamiento; conviene presupuestar contexto amplio porque las secciones de razonamiento son largas.
- Prototipado de asistentes conversacionales: el tag conversational y el pipeline text-generation permiten montar un chatbot multi-turno con llama.cpp u Ollama sin depender de APIs externas, útil para demos y entornos con requisitos de privacidad.
- Evaluación comparativa de cuantizaciones: con las cifras de perplejidad publicadas (wikitext, fineweb, code) sirve como punto de referencia para decidir entre IQ3_M, Q4_K_M dinámico y Q8_0 según el presupuesto de VRAM y la tolerancia a pérdida de calidad.
- Despliegue en endpoints compatibles: al estar etiquetado como endpoints_compatible, puede servirse detrás de una API para integrarse en aplicaciones internas o pipelines de generación de texto.
- Generación de código en local: la matriz de importancia incluye un 17% de código C/C++ y la perplejidad en el corpus de código se mantiene baja (2,56 frente a 2,50 de Q8_0), lo que respalda su uso en tareas de programación dentro de un entorno sin conexión.
- Investigación sobre cuantización: la receta completa (imatrix, calibración, comparación de generaciones) es reproducible y sirve de base para estudiar el impacto de IQ3_M en modelos de ~27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo publica perplejidad sobre tres corpus (24 fragmentos de 512 tokens por corpus):

| Variante de Qwen3.8-27B | Tamano | wikitext | fineweb | code |
|---|---:|---:|---:|---:|
| Q8_0 (referencia casi sin perdida) | 27 GiB | 5,89 | 8,36 | 2,50 |
| Unsloth Dynamic Q4_K_M (UD) | 15,3 GiB | 5,92 | 8,45 | 2,52 |
| **esta version — IQ3_M (desde Q8_0, imatrix)** | **11,9 GiB** | **6,17** | **8,74** | **2,56** |
| IQ3_M desde BF16 (una generacion, misma receta) | 11,9 GiB | 6,13 | 8,70 | 2,57 |

Lectura del autor: a ~3,3 bits por peso, el coste es de +0,28 a +0,38 puntos de perplejidad sobre Q8_0, ahorrando 3,4 GiB frente al Q4_K_M dinámico.

## Requisitos de hardware

- VRAM estimada: 11,9 GiB para los pesos; con contexto de 16k tokens y KV cache por defecto, el total medido es de 15,7 GiB en una RTX 5080 (el autor cita un rango de 15,7 / 16,3 GiB). Es prácticamente el techo de una tarjeta de 16 GB.
- GPU recomendadas: RTX 5080 (medida por el autor); cualquier GPU con 16 GB o más de VRAM. Para contextos mayores o mayor paralelismo, se necesitarían tarjetas de 24 GB en adelante (RTX 4090, A100, H100), aunque no hay mediciones publicadas para esas configuraciones.
- Cabe en GPU consumidora: sí, en la clase de 16 GB (RTX 5080 y similares) con contexto de hasta 16k tokens. En tarjetas de 12 GB no cabría con ese contexto.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama y servidores compatibles con GGUF; el tag endpoints_compatible sugiere integración con APIs del ecosistema de Hugging Face. No se documenta soporte de vLLM ni TGI para este archivo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Contexto | Perplejidad (wikitext / fineweb / code) | Licencia |
|---|---:|---:|---|---|---|
| **Qwen3.8-27B-IQ3_M (esta ficha)** | 27,3B | 11,9 GiB | 16k medido en 16 GB | 6,17 / 8,74 / 2,56 | Apache-2.0 |
| Qwen3.8-27B Q8_0 | 27,3B | 27 GiB | no disponible | 5,89 / 8,36 / 2,50 | Apache-2.0 |
| Qwen3.8-27B Unsloth Dynamic Q4_K_M | 27,3B | 15,3 GiB | no disponible | 5,92 / 8,45 / 2,52 | Apache-2.0 |

Las tres alternativas son rendiciones del mismo modelo base, por lo que la comparación es de compromiso tamaño/calidad, no de capacidades. No se dispone de datos de benchmarks de tareas ni de modelos de otros fabricantes para una comparación cruzada.

## Limitaciones y advertencias

- Pérdida de calidad medible: +0,28 a +0,38 puntos de perplejidad frente a Q8_0; en el corpus de código la degradación es menor (2,56 frente a 2,50), pero existe.
- Degradación a temperaturas altas: el autor advierte que a temperaturas de muestreo muy altas los errores de la menor precisión se manifiestan antes que en Q4.
- Cuantización de segunda generación: deriva del Q8_0 de Unsloth (quant-from-quant); el autor mide el impacto como despreciable, pero quien exija la cadena estricta desde BF16 deberá generarla con la receta publicada.
- Contexto limitado en la práctica: 16k tokens es el techo medido en 16 GB de VRAM; con un modelo de razonamiento que genera secciones largas, el contexto puede agotarse con rapidez.
- Idiomas soportados no documentados: no hay confirmación de cobertura multilingüe en la información disponible.
- Sesgos y alucinaciones: no hay información específica en la model card; aplican los riesgos generales del modelo base, que no se detallan.
- Licencia: Apache-2.0 heredada, permisiva para uso comercial; la cuantización es una rendición derivada y mantiene los mismos términos.
- Sin benchmarks de tareas: no hay datos de MMLU, HumanEval, GSM8K ni similares para esta rendición.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dwilson2547/Qwen3.8-27B-IQ3_M
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B (referenciado en la model card como Qwen/Qwen3.8-27B)
- GGUF de origen (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Herramientas de cuantización (llama.cpp): https://github.com/ggml-org/llama.cpp
