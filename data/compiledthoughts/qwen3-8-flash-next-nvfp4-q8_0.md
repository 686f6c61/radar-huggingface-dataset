# CompiledThoughts/Qwen3.8-Flash-Next-NVFP4-Q8_0

## Resumen

Qwen3.8-Flash-Next-NVFP4-Q8_0 es una conversión a GGUF del checkpoint NVFP4 publicado por NVIDIA, que a su vez cuantiza el modelo Qwen3.8-Flash-Next de Qwen. La conversión la mantiene el usuario independiente CompiledThoughts y no está revisada ni avalada por NVIDIA ni por Qwen. El resultado es un archivo de 119,02 GiB (127.809.147.712 bytes) que contiene 176.944 millones de parámetros y está pensado específicamente para ejecutarse mediante streaming desde un SSD NVMe, no para cargarse completo en memoria.

El modelo es un transformer de tipo mezcla de expertos (MoE) con 48 capas y 512 expertos enrutados por capa, de los cuales solo se activan 10 por token. Incorpora además componentes menos habituales: capas GatedDeltaNet, expertos compartidos, hyper-connections y una tabla hashed n-gram (PLE) de 51.200 millones de parámetros. La conversión conserva los expertos enrutados en el formato NVFP4 original de NVIDIA y cuantiza el resto a Q8_0.

Su relevancia práctica es que permite ejecutar un modelo de 177B parámetros en una GPU consumer de 16 GB de VRAM y 32 GB de RAM, a costa de leer aproximadamente 100 GiB desde disco bajo demanda. El motor de referencia es inferredThoughts, un servidor compatible con la API de OpenAI que también soporta tool calling para agentes de programación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con GatedDeltaNet, expertos compartidos y hyper-connections |
| Parámetros totales | 176.944.046.976 (176,944B) |
| Parámetros activos | 4,3B densos + 2,4B de expertos enrutados (10 de 512 por capa) + 16 filas de la tabla n-gram por token |
| Longitud de contexto | No disponible como límite oficial; el autor documenta ejecuciones con `--ctx` de 8.192 y 32.000 tokens |
| Tipos de cuantización | Expertos enrutados en NVFP4 con escalas por experto; resto en Q8_0; normas en F32; tabla n-gram en Q8_0 con escala FP8 restaurada |
| Idiomas soportados | No disponible |
| Licencia | NVIDIA Open Model License y Qwen Community License 1.0 (etiqueta `license: other`) |
| Formato de pesos | GGUF (archivo principal de 127.809.147.712 bytes más un archivo MTP de 1.515.803.392 bytes) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de 48 capas con 512 expertos enrutados por capa y activación de 10 expertos por token, lo que mantiene el coste computacional por token muy por debajo de lo que sugiere el tamaño total. Además de la atención, el modelo incluye capas GatedDeltaNet, expertos compartidos y hyper-connections, componentes que no aparecen en un transformer denso convencional. La tabla hashed n-gram (PLE) de 51.200 millones de parámetros es, en términos de recuento, la parte más grande del archivo (50,66 GiB en Q8_0), aunque por token solo se consultan 16 filas de la misma.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO, ya que la model card de esta conversión no los detalla y no se ha proporcionado la documentación del modelo base. La innovación técnica destacable de esta ficha no está en el entrenamiento sino en el empaquetado: la conversión mantiene los expertos enrutados en NVFP4 sin recuantizar y combina ese formato con Q8_0 para el resto, algo que GGUF no puede expresar de forma nativa porque `general.file_type` admite una sola etiqueta por archivo. Por eso las herramientas reportan el archivo como Q8_0 aunque sea una mezcla. Tampoco se incluyen el cabezal MTP (unos 4B de parámetros, distribuido aparte) ni el codificador de visión, de modo que esta conversión es exclusivamente de texto.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat y pipeline `text-generation`.
- Razonamiento y respuestas encadenadas; los tags del repositorio incluyen `inferred-thoughts`.
- Tool calling y function calling: el servidor de referencia expone una API compatible con OpenAI y el autor indica compatibilidad con agentes de programación como Cline.
- Integración con clientes que hablan el protocolo OpenAI (`/v1`) y página de chat en el propio servidor.
- Prefill por capas para prompts largos, pensado para aprovechar la lectura única de cada experto por prompt.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión y audio: no soportadas en esta conversión (el codificador de visión no está incluido).

## Casos de uso

- Asistentes de programación en local: el modelo se sirve en `http://127.0.0.1:8080/v1` y se conecta a Cline u otros agentes que usan tool calling, lo que permite tener un agente de código funcionando sin depender de APIs externas ni de GPUs de datacenter.
- Prototipado y evaluación de modelos de 177B en estaciones de trabajo: con 16 GB de VRAM, 32 GB de RAM y un NVMe Gen4/Gen5 se puede medir el comportamiento real del modelo antes de comprometer hardware mayor.
- Procesamiento por lotes de prompts largos: el prefill por capas lee cada experto una sola vez por prompt, lo que hace viable analizar documentos de varios miles de tokens a 119-193 tok/s de prefill según contexto.
- Chat multi-turno con contexto medio (hasta 32.000 tokens documentados): útil para asistencia técnica o análisis de conversaciones largas donde la latencia de decodificación de 7-9 tok/s es aceptable para uso interactivo no crítico.
- Entornos con restricciones de exportación o privacidad de datos: al ejecutarse íntegramente en local, ningún prompt sale de la máquina, lo que encaja en auditorías internas o datos sensibles.
- Investigación sobre offloading y streaming de MoE: el par modelo+motor sirve como banco de pruebas reproducible para estudiar el compromiso entre ancho de banda de SSD, aciertos de caché de expertos y throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos numéricos publicados son de velocidad de inferencia con streaming desde SSD:

| Configuración | Prefill | Decodificación |
|---|---:|---:|
| `--ctx 8192`, prompt de 5.700 tokens | 193 tok/s | 8,5 a 9,1 tok/s |
| `--ctx 32000`, turnos de 2.800 a 3.300 tokens | 119 a 139 tok/s | 7,3 a 8,1 tok/s |
| Misma máquina, llama.cpp | no disponible | 4,9 tok/s |

Hardware de referencia: RTX 5060 Ti 16 GB, 32 GB DDR5, NVMe Gen5, Windows 11 nativo, `inferred serve` 1.1 con ajustes por defecto.

## Requisitos de hardware

- VRAM: 16 GB es el mínimo documentado; el motor mantiene en VRAM los pesos densos y los expertos más usados, y el resto se reparte entre RAM y SSD.
- RAM: 32 GB documentados; los expertos de segundo nivel de uso se cachean en memoria del sistema.
- Almacenamiento: SSD NVMe local Gen4 o Gen5 con 128 GB libres; aproximadamente 100 GiB del archivo permanecen en disco y se leen bajo demanda.
- GPU: RTX 50-series o RTX PRO Blackwell con 16 GB, driver NVIDIA R570+ y CUDA 12.8+. El formato NVFP4 requiere soporte hardware de esa generación; no se documenta funcionamiento en Ada, Ampere o GPUs de consumo anteriores.
- Sistema operativo: Windows 11 o WSL2 con Ubuntu 24.04.
- Despliegue: motor inferredThoughts (Rust, compilado con `--features cuda`), servidor compatible con OpenAI. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI para este archivo; de hecho, llama.cpp se cita solo como comparación de velocidad y rinde menos de la mitad.
- Throughput: 8,5-9,1 tok/s de decodificación con contexto de 8K y 7,3-8,1 tok/s con 32K; prefill de 119-193 tok/s según longitud de prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / ejecución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-NVFP4-Q8_0 (esta ficha) | 176,944B (MoE) | No disponible; ejecuciones documentadas hasta 32K | GGUF mixto NVFP4/Q8_0 con streaming desde SSD | NVIDIA Open Model License + Qwen Community License 1.0 | Hugging Face, 8.507 descargas |
| nvidia/Qwen3.8-Flash-Next-NVFP4 | Mismo modelo base en NVFP4 | No disponible | Checkpoint NVFP4 para carga completa | NVIDIA Open Model License | Hugging Face |
| Qwen/Qwen3.8-Flash-Next | Mismo modelo base en precisión original | No disponible | Pesos originales | Qwen Community License 1.0 | Hugging Face |
| llama.cpp sobre este mismo GGUF | 176,944B | No disponible | GGUF con offloading convencional | Según pesos | 4,9 tok/s de decodificación en el hardware de referencia |

La comparación relevante no es de calidad —los tres primeros son el mismo modelo en distintos empaquetados— sino de viabilidad de despliegue: el checkpoint NVFP4 y los pesos originales exigen mucha más VRAM que 16 GB, mientras que esta conversión es la única de las listadas que el autor documenta como ejecutable en una GPU consumer de 16 GB.

## Limitaciones y advertencias

- Conversión independiente: no está hecha, revisada ni avalada por NVIDIA ni por Qwen; los fallos de conversión son responsabilidad del autor del repo.
- Solo texto: el codificador de visión no está incluido, así que no reproduce las capacidades multimodales del modelo base si las tuviera.
- El cabezal MTP va en un archivo aparte de 1,41 GiB; sin él se pierden las ventajas de decodificación especulativa asociadas.
- La etiqueta `general.file_type` reporta Q8_0 aunque el archivo mezcla NVFP4 y Q8_0, lo que puede confundir a herramientas de inspección o a pipelines automáticos.
- Dependencia fuerte de hardware: exige GPU Blackwell de 16 GB o superior con NVFP4, driver R570+ y CUDA 12.8+; no hay soporte documentado para GPUs anteriores.
- Dependencia de disco: el rendimiento depende críticamente de un NVMe Gen4/Gen5 local; un SSD SATA o un disco de red degradarán el throughput de forma severa.
- Licencia doble y restrictiva: se aplican simultáneamente la NVIDIA Open Model License y la Qwen Community License 1.0; hay que revisar ambas antes de uso comercial.
- Idiomas soportados no documentados en esta ficha; no se puede asumir cobertura multilingüe sin verificarla contra el modelo base.
- Sin benchmarks de calidad publicados en la información disponible, por lo que no hay evidencia numérica de rendimiento en tareas downstream para esta conversión concreta.
- Riesgo de alucinación y sesgos: no documentados específicamente para esta conversión; deben evaluarse sobre el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CompiledThoughts/Qwen3.8-Flash-Next-NVFP4-Q8_0
- Modelo base (NVIDIA): https://huggingface.co/nvidia/Qwen3.8-Flash-Next-NVFP4
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Motor de streaming: https://github.com/compiledthoughts/Inferred-Thoughts
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Licencia Qwen Community License 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Panel de métricas Model Pulse: https://huggingface.co/spaces/tardellirs/model-pulse?model=CompiledThoughts/Qwen3.8-Flash-Next-NVFP4-Q8_0
