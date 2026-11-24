# dcharlot65-openie/Tencent-OmniEVIE-4B-LittleBit

## Resumen

`Tencent-OmniEVIE-4B-LittleBit` es un checkpoint de pesos "living-weights" publicado por el usuario `dcharlot65-openie` en Hugging Face, derivado del modelo base `tencent/OmniEVIE-4B` de Tencent. No se trata de un modelo entrenado desde cero ni de un fine-tune convencional: es una adaptación pre-factorizada que combina la técnica LittleBit-2 (representación de pesos en sub-1 bit mediante planos de bits 2D) con Sakana SVF (Singular Value Fine-tuning), empaquetada en el formato `.jsyn` propietario del runtime JouleDB.

El objetivo declarado es la inferencia sin PyTorch sobre una base de datos termodinámica (JouleDB) y un sustrato Kubernetes-native para agentes (`JouleKube`). Según la model card, el checkpoint comprime 4.544.510.464 parámetros desde unos 8.668 MB en FP16 hasta 22,93 MB en `.jsyn` con compresión zstd y CRC32, lo que equivale a 0,0168 bits por peso y una reducción de 377,96x. Esas cifras son las reportadas por el autor y no han sido verificadas de forma independiente.

La relevancia actual es limitada pero conceptualmente interesante: explora la viabilidad de servir modelos de 4B parámetros con huella de almacenamiento mínima en entornos Kubernetes, a costa de un ecosistema de inferencia muy restringido (solo JouleDB v0.2.4+) y de una ausencia total de benchmarks publicados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el empaquetado se distribuye por otra vía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (heredada de `tencent/OmniEVIE-4B`; el checkpoint es una factorización LittleBit-2 + Sakana SVF) |
| Parametros totales | 4.544.510.464 |
| Parametros activos | No aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Sub-1-bit (0,0168 BPW) en formato `.jsyn` con zstd + CRC32; no se documentan GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.jsyn` (JouleDB); 350 tensores en planos de bits 2D y 375 vectores 1D (LayerNorm, bias, depthwise) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `tencent/OmniEVIE-4B`, cuyo detalle no se incluye en la información proporcionada (no se especifica si es transformer denso, MoE, híbrido o multimodal, aunque el nombre "Omni" sugiere capacidades multimodales que no se confirman). Sobre esa base, el checkpoint aplica una factorización LittleBit-2 que descompone los pesos en 350 tensores representados como planos de bits 2D, más 375 vectores 1D para LayerNorm, biases y convoluciones depthwise. Adicionalmente se aplica Sakana SVF (Singular Value Fine-tuning), una técnica de adaptación parametrizada de bajo rango.

No se documenta el proceso de entrenamiento: no hay información sobre número de tokens, composición del dataset, RLHF, DPO ni etapas de alineación. Tampoco se describe si el checkpoint LittleBit se generó mediante destilación, cuantización post-entrenamiento o un proceso de factorización con datos de calibración. La model card únicamente declara métricas de compresión (8.667,97 MB en FP16 frente a 22,93 MB en `.jsyn`, 0,0168 BPW, 377,96x de reducción) y atribuye la autoría del modelo base a Tencent bajo Apache 2.0.

## Capacidades

- No se documentan capacidades funcionales específicas del checkpoint más allá de la inferencia mediante JouleDB.
- Al derivar de `tencent/OmniEVIE-4B`, se presume que hereda las capacidades del modelo base, pero la información proporcionada no las enumera.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingüe ni lista de idiomas.
- No se confirma soporte de visión, audio ni modo "thinking".
- El único modo de uso documentado es la carga vía `jouledb.hf_pull` y el servidor HTTP de JouleDB.

## Casos de uso

- Despliegue en clústeres Kubernetes con almacenamiento restringido: el empaquetado de 22,93 MB permite distribuir el checkpoint en nodos con cuotas de disco mínimas, usando JouleKube como sustrato de agentes. Adecuado si el equipo ya opera JouleDB.
- Inferencia sin PyTorch en entornos embebidos o edge: el runtime JouleDB elimina la dependencia del stack de PyTorch, lo que simplifica la imagen de contenedor y reduce el tamaño del artefacto desplegado.
- Pruebas de concepto de "living-weights" y bases de datos termodinámicas: útil para investigación sobre representaciones sub-1-bit y factorización de pesos, no para producción convencional.
- Archivado de bajo coste de un modelo de 4B: si el objetivo es conservar una versión comprimida del modelo base para experimentación posterior, el formato `.jsyn` ocupa tres órdenes de magnitud menos que FP16.
- Integración en pipelines de agentes sobre Kubernetes: mediante el servidor HTTP de JouleDB (`jouledb serve --http-addr`), se puede exponer el modelo como servicio interno, siempre que el resto del stack acepte el protocolo de JouleDB.
- Evaluación comparativa de técnicas de compresión extrema: sirve como referencia para medir la pérdida de calidad de LittleBit-2 + SVF frente al modelo base original, aunque el autor no publica dicha comparación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de compresión (parámetros totales, tamaño FP16 equivalente, tamaño `.jsyn`, BPW y ratio de reducción), sin datos de MMLU, HumanEval, GSM8K ni ninguna otra evaluación de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint se almacena en 22,93 MB, pero la VRAM necesaria para descomprimir y ejecutar 4.544.510.464 parámetros no se documenta. Como referencia teórica, un modelo de 4B en FP16 requiere aproximadamente 8-9 GB de VRAM, pero el runtime JouleDB podría operar con un esquema distinto no especificado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: exclusivamente JouleDB v0.2.4 o superior (`cargo binstall jouledb`, `jouledb serve --http-addr 127.0.0.1:8080`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `dcharlot65-openie/Tencent-OmniEVIE-4B-LittleBit` | 4.544.510.464 | No disponible | Apache 2.0 | `.jsyn` (JouleDB) | Hugging Face, runtime JouleDB |
| `tencent/OmniEVIE-4B` (modelo base) | ~4B | No disponible | Apache 2.0 | No disponible | Hugging Face |
| Alternativas de 4B cuantizadas (p. ej. GGUF Q4) | ~4B | Variable | Según modelo | GGUF | llama.cpp, Ollama |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas. La diferencia principal frente al modelo base es el formato y el runtime: LittleBit exige JouleDB, mientras que el modelo base presumiblemente se ejecuta en stacks estándar (Transformers, vLLM), aunque esto no se confirma en la información proporcionada.

## Limitaciones y advertencias

- No hay benchmarks publicados: se desconoce la degradación de calidad introducida por la factorización LittleBit-2 + SVF respecto al modelo base.
- El repositorio figura con 0.0 GB de tamaño y 0 descargas, lo que genera dudas sobre si los pesos están realmente alojados y son descargables.
- Dependencia total del runtime JouleDB v0.2.4+: no hay soporte para Transformers, vLLM, llama.cpp, Ollama ni TGI, lo que limita gravemente la portabilidad.
- El formato `.jsyn` es propietario y no está estandarizado; la interoperabilidad con otras herramientas es nula.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación.
- No se especifica la longitud de contexto, lo que impide evaluar su idoneidad para tareas de contexto largo.
- La licencia Apache 2.0 permite uso comercial, pero la atribución a Tencent como modelo base debe mantenerse y conviene verificar los términos del modelo original.
- El autor es un usuario individual (`dcharlot65-openie`), no Tencent; no hay garantías de mantenimiento, soporte ni actualizaciones.
- No se han verificado de forma independiente las métricas de compresión declaradas (0,0168 BPW, 377,96x).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dcharlot65-openie/Tencent-OmniEVIE-4B-LittleBit
- Modelo base: https://huggingface.co/tencent/OmniEVIE-4B
- Repositorio JouleDB: https://github.com/openIE-dev/jouledb
