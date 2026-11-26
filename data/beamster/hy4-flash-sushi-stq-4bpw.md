# beamster/Hy4-Flash-Sushi-STQ-4bpw

## Resumen

Hy4-Flash-Sushi-STQ-4bpw es un empaquetado cuantizado del modelo multimodal tencent/Hy4-flash, desarrollado por el usuario beamster para el motor de inferencia nativo sushi, orientado a Apple Silicon. Se trata de un modelo de arquitectura MoE (mixture of experts) con 104.184.354.726 parámetros totales, capacidad de entrada imagen-texto y una ventana de contexto de hasta 1.048.576 tokens, lo que lo sitúa en la categoria de modelos de contexto muy largo con soporte visual.

El pack emplea la tecnica propietaria STQ (Sushi Trellis Quant): los expertos enrutados de 41 capas x 512 se almacenan a 4 bits con codewords PAIR1, mientras que el tronco, el lm_head y los embeddings usan 6 bits con el codebook SPEC1. Ademas, incluye un drafter de decodificacion especulativa (DFly2) a 4 bits, un vision tower en bf16 y tablas Engram que se leen desde SSD sin cargarse en memoria de GPU. El resultado es un pack de aproximadamente 194 GiB en disco (76 GiB de pesos + 118 GiB de tablas Engram).

Su relevancia actual radica en que demuestra la viabilidad de servir un modelo MoE multimodal de gran tamano y contexto millonario en hardware de consumo Apple Silicon, con una fidelidad respecto al checkpoint original BF16 muy alta (KLD de 0.0194 y top-1 del 96,30% frente al 0.1022 y 91,72% del pack hermano de 2.25 bpw). Es, por tanto, la variante de mayor calidad de la familia Sushi para este modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text) |
| Parametros totales | 104.184.354.726 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens |
| Tipos de cuantizacion | STQ 4 bits (expertos enrutados, PAIR1), STQ 6 bits (tronco, lm_head, embeddings, SPEC1), STQ 4 bits (drafter DFly2), bf16 (vision tower y tablas Engram) |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (otra, derivada de tencent/Hy4-flash) |
| Formato de pesos | safetensors (pack STQ para el motor sushi) |

## Arquitectura y entrenamiento

El modelo base tencent/Hy4-flash es un transformer de tipo mixture of experts con capacidades multimodales de entrada imagen-texto. La arquitectura del pack conserva 41 capas de expertos enrutados con 512 expertos por capa, un tronco denso, lm_head y embeddings, ademas de un vision tower en bf16 para el procesamiento de imagenes. Incorpora tablas Engram que se consultan por filas directamente desde el SSD, lo que permite mantener un footprint de memoria de GPU reducido a costa de almacenamiento en disco.

El entrenamiento original del modelo base no se detalla en la informacion disponible (numero de tokens, composicion del dataset, uso de RLHF o DPO). La innovacion tecnica destacable de este pack es doble: por un lado, la cuantizacion STQ con codewords bidimensionales PAIR1 para los expertos y codebook SPEC1 para el tronco, que logra una fidelidad alta a 4 bits; por otro, la inclusion del drafter DFly2 para decodificacion especulativa, que acelera la generacion manteniendo la coherencia con el modelo original. El proceso de medida de calidad se realizo con productos en f32, KV cache de 8 bits y DFly2 desactivado durante la evaluacion.

## Capacidades

- Generacion de texto conversacional y multimodal: acepta entradas de imagen y texto (pipeline image-text-to-text).
- Razonamiento y matemáticas: los KLD por categoria muestran buen comportamiento en math (0.0058) y reasoning (0.0137).
- Generacion de codigo: categoria con la menor degradacion respecto al original (KLD 0.0060).
- Procesamiento de contexto muy largo: ventana de hasta 1.048.576 tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidades multilingues: la evaluacion incluye una categoria multilingual con KLD 0.0168, aunque los idiomas concretos no estan disponibles.
- Decodificacion especulativa integrada mediante el drafter DFly2, que acelera la inferencia.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional multimodal en local: el modelo puede mantener conversaciones multi-turno combinando imagenes y texto gracias a su vision tower y a su ventana de 1.048.576 tokens, lo que permite adjuntar capturas, diagramas o documentos escaneados dentro de una misma sesion.
- Analisis de documentos extensos: con un contexto de mas de un millon de tokens, es posible introducir manuales tecnicos, expedientes o bases de codigo completas y formular preguntas sobre ellos sin fragmentacion.
- Generacion de codigo en estaciones de trabajo Apple Silicon: la baja degradacion en la categoria code (KLD 0.0060) y la decodificacion especulativa lo hacen apto para autocompletado y refactorizacion asistida en un Mac con suficiente memoria unificada.
- Razonamiento matematico y cientifico asistido: los KLD de math (0.0058) y science (0.0079) indican que el pack conserva bien el comportamiento del original en tareas de calculo y explicacion cientifica, util para tutoria o validacion de resultados.
- Procesamiento de imagenes tecnicas: al ser image-text-to-text, puede describir diagramas, extraer texto de imagenes o responder preguntas sobre esquemas, integrable en flujos de documentacion tecnica.
- Investigacion sobre cuantizacion y despliegue en Apple Silicon: el pack sirve como referencia reproducible para estudiar el impacto de STQ a 4 bits frente a 2.25 bits en un MoE de 104B, con metricas KLD por categoria publicadas.
- Prototipado de agentes con contexto largo: aunque el soporte de tool calling no esta documentado, la ventana millonaria permite mantener el estado de tareas complejas en un unico contexto para experimentacion.

## Benchmarks y rendimiento

Los datos publicados por el autor son metricas de fidelidad (KLD y top-1) frente al checkpoint original BF16, no benchmarks estandar de tareas. Se presentan a continuacion:

| Metrica | Sushi-STQ-4bpw | Sushi-STQ-2.25bpw |
|---|---|---|
| KLD global | 0.0194 | 0.1022 |
| Top-1 | 96,30% | 91,72% |
| Disco | 194 GiB | 163 GiB |

KLD por categoria:

| Categoria | Sushi-STQ-4bpw | Sushi-STQ-2.25bpw |
|---|---|---|
| code | 0.0060 | 0.0290 |
| math | 0.0058 | 0.0399 |
| reasoning | 0.0137 | 0.0875 |
| design | 0.0166 | 0.1079 |
| wikitext | 0.0369 | 0.0802 |
| multilingual | 0.0168 | 0.1099 |
| story | 0.0500 | 0.3256 |
| science | 0.0079 | 0.0368 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada: el pack ocupa aproximadamente 194 GiB en disco, de los cuales 76 GiB son pesos y 118 GiB son tablas Engram. Las tablas Engram se leen desde el SSD por filas y no se cargan en memoria de GPU, por lo que el requisito de memoria unificada se reduce respecto al total en disco, aunque el valor exacto no esta disponible.
- GPU recomendadas: exclusivamente Apple Silicon; no se soportan GPU NVIDIA ni AMD con este pack.
- Compatibilidad con consumer GPU: si, en equipos Apple Silicon con macOS 26.2 o superior y memoria unificada suficiente; los modelos concretos de Mac y la memoria por contexto se detallan en la documentacion de uso de sushi (no disponible en esta ficha).
- Opciones de despliegue: unicamente el motor sushi 1.8.0 o superior (version no publicada aun en el momento de la model card). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la decodificacion especulativa DFly2 esta incluida para acelerar la generacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-Flash-Sushi-STQ-4bpw | 104,18B | 1.048.576 | STQ (sushi) | tencent-hy-license | Hugging Face, requiere sushi 1.8.0+ |
| Hy4-Flash-Sushi-STQ-2.25bpw | 104,18B | 1.048.576 | STQ (sushi) | tencent-hy-license | Hugging Face, requiere sushi 1.8.0+ |
| tencent/Hy4-flash (BF16) | 104,18B | 1.048.576 | safetensors | tencent-hy-license | Hugging Face |

La comparativa se limita a la familia Sushi y al modelo base, ya que no se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada. El pack de 4 bpw ofrece mejor fidelidad que el de 2.25 bpw a costa de 31 GiB adicionales de disco.

## Limitaciones y advertencias

- Dependencia estricta del motor sushi: requiere sushi 1.8.0 o superior, version que segun la model card aun no se ha publicado, y macOS 26.2 o posterior. No funciona con otros runtimes.
- Exclusivo para Apple Silicon: no es desplegable en GPU NVIDIA, AMD ni en CPU x86, lo que limita su uso en infraestructura de servidores convencional.
- Licencia tencent-hy-license: es una licencia "other" derivada del modelo base; deben revisarse sus terminos para uso comercial antes de desplegar en produccion.
- Idiomas soportados no documentados: aunque existe una categoria multilingual en la evaluacion, no se especifican los idiomas cubiertos.
- Riesgo de alucinacion: inherente a los modelos generativos; la cuantizacion a 4 bits introduce una degradacion medible (KLD 0.0194), mayor en las categorias story (0.0500) y wikitext (0.0369).
- Rendimiento en disco: las tablas Engram se leen desde SSD, por lo que la latencia puede depender de la velocidad del almacenamiento del equipo.
- Sin datos de benchmarks estandar ni de tool calling: no hay evidencia publicada sobre su rendimiento en tareas de agente o function calling.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria ni reportes independientes de uso.

## Enlaces

- [Hugging Face: beamster/Hy4-Flash-Sushi-STQ-4bpw](https://huggingface.co/beamster/Hy4-Flash-Sushi-STQ-4bpw)
- [Modelo base: tencent/Hy4-flash](https://huggingface.co/tencent/Hy4-flash)
- [Licencia Tencent Hy](https://huggingface.co/tencent/Hy4-flash/blob/main/LICENSE)
- [Motor sushi (repositorio)](https://github.com/beamivalice/sushi)
- [Documentacion de uso de sushi](https://github.com/beamivalice/sushi/blob/main/docs/usage.md)
- [Pack hermano: Sushi-STQ-2.25bpw](https://huggingface.co/beamster/Hy4-Flash-Sushi-STQ-2.25bpw)
- [mlx-serve, proyecto del que deriva sushi](https://github.com/ddalcu/mlx-serve)
