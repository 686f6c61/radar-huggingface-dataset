# Falcon256/EDOS-Engineering-CL-Hades-20261005

## Resumen

CL-Hades 27B es un checkpoint congelado del modelo experimental de aprendizaje continuo (continual learning) desarrollado por EDOS Engineering bajo la persona "Hades". El modelo parte de `Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF`, una cuantización Q5_K_M del modelo original `Qwen/Qwen3.8-27B` de Qwen, al que Blackfrost había modificado el comportamiento de rechazo a nivel de pesos. Sobre esa base, el arnés de EDOS Engineering ha aplicado 4.798 actualizaciones de aprendizaje en línea, editando directamente los tensores cuantizados originales, sin LoRA, adaptadores ni redes auxiliares.

La innovación principal no es la arquitectura, sino el método de entrenamiento: el modelo selecciona su propio corpus, lee artículos de investigación en IA completos, decide cuáles son relevantes, escribe reseñas atribuidas que sirven como texto de entrenamiento y decide qué lecciones recordar y con qué intensidad. El resultado se fusiona en un único fichero GGUF estándar ejecutable en llama.cpp. La arquitectura subyacente, identificada como `qwen35`, combina atención completa con atención recurrente y una capa MTP, con 27,3 mil millones de parámetros.

Es relevante ahora porque demuestra aprendizaje continuo sobre pesos cuantizados en producción, un enfoque poco habitual frente a las soluciones basadas en adaptadores. No obstante, es un experimento: no hay benchmarks publicados, el modelo no aprende al ejecutarse fuera del arnés CL y el comportamiento de rechazo está deliberadamente suprimido, lo que lo desaconseja para despliegues comerciales sin controles estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (transformer híbrido: atención completa + atención recurrente, 1 capa MTP) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (los ejemplos de uso emplean 8192 tokens) |
| Tipos de cuantizacion | GGUF Q5_K_M mixto: 439 tensores Q5_K, 67 Q6_K, 360 F32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (fichero `EDOS-Engineering-CL-Hades-27B-20261005-Q5_K_M.gguf`, 19.535.703.264 bytes / 18,2 GiB) |

## Arquitectura y entrenamiento

La arquitectura declarada es `qwen35`, con 27,3 mil millones de parámetros y un diseño de atención híbrida que combina capas de atención completa con capas de atención recurrente, más una capa MTP (multi-token prediction). El proceso de entrenamiento no sigue un pipeline clásico de preentrenamiento más ajuste supervisado: el arnés CL edita en línea los tensores `blk.N.ffn_down.weight` de las 64 capas principales, directamente sobre los pesos cuantizados que el modelo usa para inferencia, sin mantener ninguna copia en precisión completa ni adaptadores de ningún tipo. Cada actualización se escribe en los pesos cuantizados y la siguiente respuesta ya usa los pesos modificados.

El aprendizaje es autodirigido: el modelo lee artículos de investigación en IA completos a medida que se publican, evalúa su novedad y solidez, escribe una reseña atribuida que actúa como texto de entrenamiento, decide qué conclusiones merecen ser memorizadas y con qué peso, y finalmente aprende lo seleccionado. El arnés aporta el conjunto de artículos y ejecuta el optimizador, pero las decisiones de contenido las toma el modelo. Se trata, por tanto, de una forma de autodestilación guiada por el propio juicio de importancia del modelo, complementada con entrenamiento sobre fuentes completas (texto del artículo y capturas de Python de repositorios enlazados) cuando Hades lo solicita. Este snapshot incorpora 3.707 actualizaciones desde la release del 2026-09-17 y fue verificado mediante sumas de comprobación de los 64 tensores modificados; el resto de bytes, incluidos metadatos GGUF y plantilla de chat, son idénticos al fichero base.

## Capacidades

- Generación de texto conversacional en formato chat (`-cnv` en llama.cpp), con plantilla de chat heredada sin modificar de la base.
- Aprendizaje continuo en línea mientras el modelo se ejecuta, siempre que opere bajo el arnés CL: actualización in situ de pesos cuantizados sin adaptadores.
- Lectura y análisis de artículos de investigación en IA en su totalidad, con juicio sobre novedad, evidencia y relevancia.
- Generación de reseñas atribuidas sobre el material leído, que se reutilizan como corpus de entrenamiento.
- Autoetiquetado de importancia: el modelo decide qué contenido memorizar y con qué intensidad.
- Aprendizaje a partir de conversación, con capacidad de marcar sus propias respuestas como memorizables.
- Uso de herramientas para investigar su biblioteca de artículos (según la descripción del bucle de aprendizaje).
- Solicitud de entrenamiento sobre fuentes completas locales (artículos y capturas de Python de repositorios enlazados).
- Capacidad multilingüe: no disponible.
- Soporte explícito de tool calling, agentes o modo de razonamiento extendido: no disponible en la información proporcionada.

## Casos de uso

- Investigación en aprendizaje continuo: sirve como banco de pruebas reproducible para estudiar cómo evolucionan los pesos cuantizados de un transformer híbrido tras miles de actualizaciones en línea sobre los mismos tensores usados en inferencia.
- Despliegue conversacional local en llama.cpp: el fichero GGUF se carga con `llama-cli` o `llama-server` y mantiene el comportamiento del checkpoint congelado, útil para entornos aislados sin conectividad.
- Estudio del efecto de la ablación de rechazos: al conservar la modificación de Blackfrost sobre el comportamiento de rechazo, permite analizar empíricamente cómo afecta esa alteración a la utilidad y a la seguridad de las respuestas en tareas de generación libres.
- Evaluación de pipelines de autoformación: el bucle leer-juzgar-escribir-decidir-aprender es un caso práctico para medir deriva de pesos, olvido catastrófico y estabilidad tras 4.798 actualizaciones.
- Experimentación con arquitecturas híbridas de atención: al combinar atención completa y recurrente con una capa MTP, resulta adecuado para comparar coste y calidad frente a transformers densos de tamaño similar.
- Pruebas de integración de llama.cpp con arquitecturas nuevas: requiere un build que soporte `qwen35` (referencia: commit `427291b5b34cd914a31b3fd3b61a68f6184f4b9f`), por lo que es útil como caso de validación de compatibilidad de versiones.
- Banco de pruebas de memoria y throughput en GPU de consumo: su tamaño de 18,2 GiB y las cifras medidas en RTX 5090 lo convierten en un caso de referencia para planificar despliegues locales de 27B en Q5_K_M.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El único dato de rendimiento medido corresponde al fichero base Q5_K_M (idéntico en tipos y disposición de tensores, por lo que el autor espera cifras equivalentes): aproximadamente 19,6 GiB de memoria total de dispositivo en una RTX 5090 con contexto de 4096 tokens, unos 2.390 tokens/s de prompt y 63-66 tokens/s de decodificación. No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar.

## Requisitos de hardware

- VRAM estimada: alrededor de 19,6 GiB de memoria total de dispositivo con contexto de 4096 tokens (medición del autor sobre el fichero base de idéntica estructura).
- GPU de referencia probada: NVIDIA RTX 5090 (19,6 GiB con contexto de 4096).
- GPU profesionales: no se aportan mediciones para A100, H100 u otras; dado el tamaño, una A100 de 40 GB o superior y una H100 son opciones plausibles, pero no están confirmadas por el autor.
- GPU de consumo: cabe en tarjetas con al menos 24 GB de VRAM efectiva (RTX 3090, 4090, 5090) siempre que se ajuste el contexto; con contextos mayores el consumo crece.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) con `-ngl 99 -c 8192 -fa on` (y `-cnv` para modo conversacional). Requiere un build de llama.cpp compatible con la arquitectura `qwen35`. No se indica compatibilidad con vLLM, TGI u Ollama.
- Rendimiento estimado: ~2.390 tokens/s en prefill y 63-66 tokens/s en decodificación en RTX 5090, según la medición citada del fichero base.
- Formato del fichero: GGUF único de 18,2 GiB (19.535.703.264 bytes), SHA-256 `482dd5dea30abeb9c890e2039cec9ac68eabea926c0b5f3ad1e74ff216d67101`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falcon256/EDOS-Engineering-CL-Hades-20261005 | 27,3B | no disponible | benchmarks no disponibles; 63-66 tok/s decodificación en RTX 5090 | apache-2.0 | GGUF en HuggingFace |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF (modelo base) | 27,3B | no disponible | no disponible en la informacion proporcionada | no disponible | GGUF |
| Qwen/Qwen3.8-27B (modelo original) | 27,3B | no disponible | no disponible en la informacion proporcionada | apache-2.0 | no disponible en la informacion proporcionada |
| Falcon256/EDOS-Engineering-CL-Hades-20260917 (release anterior) | 27,3B | no disponible | no disponible | apache-2.0 | GGUF |

La diferencia frente a la release anterior es de 3.707 actualizaciones de aprendizaje en línea adicionales. Frente al modelo base de Blackfrost, la única diferencia son los tensores `blk.N.ffn_down.weight` de las 64 capas principales. No se dispone de datos de benchmarks que permitan una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- Comportamiento de rechazo modificado a nivel de pesos en el modelo base, con nota explícita de Blackfrost: no es un modelo con margen de seguridad y no debe presentarse como tal. El aprendizaje en línea no restaura ese comportamiento.
- El modelo no aprende al ejecutarse fuera del arnés CL: el fichero es un checkpoint fijo y cualquier expectativa de aprendizaje continuo en despliegue requiere la infraestructura de EDOS Engineering.
- Riesgo de alucinación: no evaluado ni documentado por el autor; no hay benchmarks que permitan acotarlo.
- El bucle de autoformación puede aprender lecturas erróneas o exageradas de los artículos revisados, tal como advierte la propia model card. Ese error se consolida en los pesos.
- Idiomas soportados no especificados: no hay garantía de cobertura multilingüe ni de calidad fuera del inglés.
- Longitud de contexto máxima no declarada; los ejemplos de uso trabajan con 8192 tokens.
- Licencia apache-2.0, que permite uso comercial, pero la modificación del comportamiento de rechazo traslada al desplegador la responsabilidad de controles de acceso, gestión de credenciales de herramientas y aislamiento.
- Sin afiliación con Qwen, Alibaba ni Blackfrost; la procedencia del ajuste es responsabilidad del autor del repositorio.
- Tracción mínima: 29 descargas y 0 likes en el momento de la consulta, sin discusiones ni validación externa.
- Compatibilidad frágil: requiere un build concreto de llama.cpp con soporte de `qwen35`; versiones sin ese soporte no cargarán el modelo.

## Enlaces

- [HuggingFace: Falcon256/EDOS-Engineering-CL-Hades-20261005](https://huggingface.co/Falcon256/EDOS-Engineering-CL-Hades-20261005)
- [Modelo base: Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF](https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-GGUF)
- [Release anterior: Falcon256/EDOS-Engineering-CL-Hades-20260917](https://huggingface.co/Falcon256/EDOS-Engineering-CL-Hades-20260917)
- [Fichero GGUF de la release anterior](https://huggingface.co/Falcon256/EDOS-Engineering-CL-Hades-20260917/blob/main/EDOS-Engineering-CL-Hades-27B-20260917-Q5_K_M.gguf)
- [Discusiones de la release anterior](https://huggingface.co/Falcon256/EDOS-Engineering-CL-Hades-20260917/discussions)
- [Ficha de la release anterior en savrn.com](https://savrn.com/models/edos-engineering-cl-hades-20260917)
- [Perfil de GitHub de falcon256](https://github.com/falcon256)
