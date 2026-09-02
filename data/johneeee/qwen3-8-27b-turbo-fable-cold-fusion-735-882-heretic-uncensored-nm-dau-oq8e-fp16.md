# Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ8e-fp16

## Resumen

Este repositorio contiene una cuantización en 8 bits del modelo `Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, un fine-tune de 27 000 millones de parámetros basado en el modelo denso Qwen3.8-27B de Alibaba. El fine-tune original fue desarrollado por DavidAU con contribuciones de Nightmedia y está orientado a la instrucción general, el razonamiento, el análisis, la creatividad y la generación de texto sin censura. La cuantización ha sido realizada por Johneeee utilizando la herramienta oQ (oMLX v0.6.4) con precisión mixta, en formato MLX safetensors, lo que lo hace adecuado para su ejecución en hardware Apple Silicon.

El modelo base Qwen3.8-27B es la versión open-weight de 27B publicada por Alibaba en agosto de 2026 bajo licencia Apache 2.0, con 64 capas, tamaño oculto de 5120 y un vocabulario de 248 320 tokens. Este fine-tune concreto busca superar al modelo base en tareas de razonamiento y creatividad, y según los datos publicados por su autor alcanza puntuaciones superiores a 730 en ARC-C y 880 en ARC-E en cuantización de 8 bits, situándose en el rango de modelos propietarios de alto rendimiento. La relevancia de esta versión cuantizada radica en que permite ejecutar un modelo de 27B en hardware de consumo con requisitos de memoria reducidos, manteniendo un rendimiento cercano al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tipo qwen3_5) |
| Parametros totales | 27 356 728 560 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits (oQ, group size 64); se menciona tambien INT4 en otras versiones |
| Idiomas soportados | No disponibles |
| Licencia | No disponible (el modelo base es Apache 2.0, pero el fine-tune no especifica) |
| Formato de pesos | MLX safetensors (tambien existe version GGUF del modelo original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parametros con 64 capas, dimension oculta de 5120 y un vocabulario de 248 320 tokens. Sobre esta base, DavidAU ha aplicado un fine-tune orientado a mejorar el seguimiento de instrucciones, el razonamiento analitico, la creatividad y la generacion de texto sin censura, incorporando contribuciones de Nightmedia y otros fine-tunes no revelados. El proceso de entrenamiento no esta documentado en la informacion disponible, por lo que se desconocen los datos exactos de dataset, numero de tokens o tecnicas de alineacion como RLHF o DPO.

La cuantizacion de este repositorio ha sido realizada con oQ (oMLX v0.6.4), una herramienta de cuantizacion de precision mixta para MLX. El modelo se ha cuantizado a 8 bits con un tamaño de grupo de 64, lo que reduce el peso de 27B desde aproximadamente 54 GB en FP16 hasta unos 30,4 GB en este formato. Esta cuantizacion esta optimizada para su ejecucion en la libreria MLX de Apple, aunque los pesos safetensors pueden convertirse a otros formatos si es necesario.

## Capacidades

- Generacion de texto libre y creativa, incluyendo ficcion, poesia, guiones y contenido narrativo.
- Razonamiento analitico y resolucion de problemas complejos, con mejoras documentadas en tareas de tipo ARC (CommonsenseQA y ARC-Easy).
- Seguimiento de instrucciones generales en formato conversacional.
- Generacion de texto sin censura, sin filtros de contenido aparentes.
- Capacidades de analisis y sintesis de informacion, segun la descripcion del autor.
- No se ha confirmado soporte para tool calling, agentes, vision, audio o modo de pensamiento explicito en la informacion disponible.

## Casos de uso

- Generacion creativa de contenido sin restricciones: el modelo puede producir narrativa, dialogos o guiones para proyectos de ficcion, juegos de rol o escritura experimental, aprovechando su orientacion a la creatividad y su falta de censura.
- Asistencia en investigacion y analisis de documentos: su capacidad de razonamiento permite resumir, comparar y extraer conclusiones de textos largos, aunque la longitud de contexto no esta confirmada.
- Chat conversacional para entornos de prueba y experimentacion: al ser un modelo sin censura, puede utilizarse en entornos de investigacion donde se requiera explorar temas sensibles o controvertidos sin restricciones.
- Razonamiento y resolucion de problemas en entornos educativos: puede plantear y resolver problemas de logica, matematicas o ciencias, gracias a sus mejoras en tareas de razonamiento.
- Generacion de codigo en entornos de desarrollo: aunque no se menciona explicitamente, el modelo base Qwen3.8-27B tiene capacidades de codigo, y este fine-tune podria utilizarse para generar o depurar codigo en contextos donde se requiera flexibilidad.
- Experimentacion con cuantizacion MLX en Apple Silicon: este repositorio sirve como ejemplo de despliegue de un modelo de 27B en 8 bits sobre hardware Apple, util para desarrolladores que quieran evaluar el rendimiento de MLX con modelos grandes.

## Benchmarks y rendimiento

Los datos de rendimiento publicados por el autor del fine-tune original (DavidAU) indican mejoras significativas respecto al modelo base Qwen3.8-27B. Se presentan a continuacion los valores disponibles, correspondientes al modelo sin cuantizar o en cuantizacion de 8 bits, no necesariamente a esta version especifica de MLX:

| Benchmark | Resultado (8 bits) | Resultado (4 bits) | Referencia |
|---|---|---|---|
| ARC-C (CommonsenseQA) | > 730 (735) | > 718 | 144 puntos por encima de Qwen3.8-27B |
| ARC-E (ARC-Easy) | > 880 | No disponible | En el rango de OpenAI, Claude y Gemini |

No se dispone de resultados para otros benchmarks como MMLU, HumanEval o GSM8K en la informacion proporcionada. La cuantizacion a 8 bits puede introducir una degradacion minima del rendimiento, pero no se han publicado mediciones especificas para esta version MLX.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 61 GB, segun la herramienta de recomendacion de GPUs de Spheron.
- VRAM estimada para esta version en 8 bits: aproximadamente 30,4 GB de pesos, mas overhead de inferencia, por lo que se estima un consumo de 32-35 GB. No se ha confirmado oficialmente.
- VRAM estimada en INT4: suficiente para GPUs de 24 GB o menos, segun Spheron.
- GPUs recomendadas: A100 80GB para FP16; para 8 bits se necesitarian GPUs con 32 GB o mas (por ejemplo, A6000, A40, o multiples RTX 4090 en configuracion multi-GPU). En Apple Silicon, puede ejecutarse en Macs con 32 GB o mas de memoria unificada.
- Opciones de despliegue: MLX (nativo para Apple Silicon), llama.cpp u Ollama si se convierte a GGUF, vLLM o TGI si se convierte a formato compatible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento ARC-C |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No disponible | Apache 2.0 | Original | 591 (estimado, segun diferencia de 144 pts) |
| Qwen3.8-27B-TURBO-Fable-Cold-Fusion (este fine-tune) | 27B | No disponible | No disponible | MLX 8-bit, GGUF | 735 (8 bits) |
| Qwen3.8-27B-Cold-Fusion-GAIN-V1.1 (otro fine-tune de Johneeee) | 27B | No disponible | No disponible | MLX 6-bit | No disponible |

No se dispone de comparaciones con otros modelos de la misma categoria (por ejemplo, Llama 3.1 70B o Mistral Large) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo es "uncensored" por diseño, lo que implica que puede generar contenido ofensivo, ilegal o danino si se le solicita. No debe desplegarse en entornos de produccion sin filtros de seguridad adicionales.
- La licencia no esta especificada en el repositorio. Aunque el modelo base es Apache 2.0, el fine-tune podria tener restricciones adicionales no documentadas. Se recomienda contactar con el autor antes de un uso comercial.
- La longitud de contexto no esta confirmada; se desconoce si el fine-tune mantiene la ventana del modelo base o la modifica.
- Los idiomas soportados no estan documentados; aunque Qwen3.8-27B es multilingue, este fine-tune podria tener un sesgo hacia el ingles.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo.
- La cuantizacion a 8 bits puede degradar ligeramente la precision en tareas numericas o de logica, aunque no se han publicado mediciones especificas.
- El nombre del modelo incluye referencias a "Heretic" y "Uncensored", lo que indica un enfoque deliberado en eliminar restricciones de contenido, con los riesgos asociados.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/Johneeee/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-oQ8e-fp16
- Repositorio del fine-tune original (version GGUF): https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Ficha del modelo en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-nm-dau-davidau
- Herramienta de recomendacion de GPUs de Spheron: https://www.spheron.network/tools/gpu-recommender/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU/
- Repositorio de oQ (oMLX): https://github.com/jundot/omlx
- Informacion sobre Qwen3.8-27B en LLM Releases: https://www.llm-releases.com/models/qwen3-8-27b
