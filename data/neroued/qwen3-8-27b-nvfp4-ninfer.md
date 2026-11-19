# neroued/Qwen3.8-27B-nvfp4-NInfer

## Resumen

Qwen3.8-27B-nvfp4-NInfer es un artefacto cuantizado del modelo multimodal Qwen3.8-27B de Alibaba Qwen, empaquetado por el desarrollador independiente neroued en el formato propietario `.ninfer` para su propio motor de inferencia NInfer. No se trata de un modelo nuevo ni de un fine-tune: es una representación mixta NVFP4/FP8 del checkpoint oficial BF16 combinada con los pesos ya empaquetados de unsloth/Qwen3.8-27B-NVFP4, pensada exclusivamente para ejecutarse sobre GPUs Blackwell (sm_120a), en concreto la RTX 5090.

El interés del artefacto es práctico: comprime un modelo de 27.000 millones de parámetros hasta 22,09 GiB en disco (23.719.715.844 bytes), lo que permite servirlo en una única GPU de consumo de gama alta con cuantización de 4 bits en pesos y activaciones (W4A4) para las capas MLP del bloque de texto, manteniendo FP8 con escalado por fila en embeddings, proyecciones de atención, proyecciones GDN y las capas 56-63, y BF16 en los pesos de control. Incluye además los pesos de visión, MTP y del cabezal especulativo DFlash2.

La relevancia es doble. Por un lado, demuestra que es viable llevar un modelo multimodal de 27B a una RTX 5090 con decodificación especulativa (DFlash2, hasta 15 tokens borrador). Por otro, los resultados declarados por el autor en el model-index son muy altos (AIME 2025 y 2026 al 96,67%, GPQA-Diamond al 90,4%), aunque no están verificados y proceden de su propia herramienta de evaluación (NInfer EvalScope 1.9.0), por lo que deben tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (Qwen3.5 Dense, `Qwen3_5ForCausalLM`) con torre de visión y cabezal MTP; atención con proyecciones GDN Q/K/V/Z |
| Parametros totales | 27.000 millones (modelo base Qwen3.8-27B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4) en MLP de capas de texto 0-55; FP8 con escalado por fila en embeddings, proyecciones de atención, GDN y MLP de capas 56-63; BF16 en pesos de control |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (contenedor propietario de NInfer, versión 3); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso multimodal de la familia Qwen3.5 que incorpora una torre de visión para tareas image-text-to-text, un cabezal MTP (multi-token prediction) y proyecciones GDN en la atención. Este artefacto no entrena nada: es una conversión de pesos. Combina el checkpoint oficial BF16 con los pesos NVFP4 ya empaquetados por unsloth, preservando las palabras NVFP4 y FP8 de origen sin decodificar ni recuantizar; solo el embedding de tokens oficial BF16 se codifica localmente como FP8 con escalado por fila.

El contenedor almacena 1.246 objetos (1.240 tensores y 6 recursos), de los cuales 112 son tensores NVFP4 y 146 son tensores FP8 con escalado por fila. Incluye además los pesos completos del compañero especulativo DFlash2 de `z-lab/Qwen3.8-27B-DFlash2` (revisión `50307d4c4cde6860d4eee73e2547cd786fe8e8a4`), que permiten decodificación especulativa con 1 a 15 tokens borrador y cabezal de propuesta optimizado. Los pesos de visión y especulativos solo se cargan si se seleccionan en el arranque, lo que reduce el consumo de memoria en despliegues solo-texto. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat Qwen3.8 (`qwen3_8.jinja`).
- Razonamiento matemático de competición: AIME 2025 y AIME 2026 al 96,67% según el autor.
- Razonamiento científico de nivel experto: GPQA-Diamond al 90,4%.
- Seguimiento estricto de instrucciones: IFBench prompt-level strict al 77%.
- Comprensión de imágenes y respuesta multimodal (pipeline image-text-to-text): ERQA al 66,25% y RealWorldQA al 83,53%.
- Modo thinking activado por defecto, con nivel de esfuerzo `xhigh` y retención del razonamiento en turnos cerrados.
- Decodificación especulativa con DFlash2: borradores de 1 a 15 tokens y cabezal de propuesta optimizado.
- Predicción multi-token (MTP) como mecanismo adicional de aceleración.
- Tool calling y razonamiento multi-paso: no confirmado explícitamente en la información disponible.

## Casos de uso

- Asistente de razonamiento matemático en local: con AIME por encima del 96% declarado, el artefacto sirve para resolver problemas de competición y verificar demostraciones en una estación de trabajo con una sola RTX 5090, sin depender de APIs externas.
- Análisis de documentación técnica con imágenes: al soportar image-text-to-text, puede procesar capturas de pantalla, diagramas de arquitectura o gráficas de monitorización y responder preguntas sobre ellos, útil en soporte de ingeniería.
- Evaluación de QA visual en pipelines de control de calidad: RealWorldQA al 83,53% permite usarlo para tareas de verificación de escenas y objetos en imágenes de producción.
- Prototipado de agentes con decodificación especulativa: DFlash2 con hasta 15 tokens borrador reduce la latencia por token en cargas interactivas, adecuado para bucles de agente con muchas llamadas cortas.
- Investigación en cuantización de precisión mixta: el artefacto es un caso de estudio reproducible de W4A4 NVFP4 con capas selectivas en FP8, útil para estudiar el impacto de la cuantización en benchmarks de razonamiento.
- Despliegue de un modelo multimodal de 27B en hardware de consumo: 22,09 GiB de artefacto caben en los 32 GB de una RTX 5090, lo que permite montar un asistente privado con visión sin infraestructura de centro de datos.
- Generación de código y explicaciones técnicas: no hay benchmark de código publicado para este artefacto, por lo que su idoneidad en producción de software debe validarse empíricamente antes de adoptarlo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, obtenidos con NInfer EvalScope 1.9.0 en modo 0-shot con evaluación por reglas. No están verificados de forma independiente.

| Benchmark | Tarea | Metrica | Resultado |
|---|---|---|---|
| IFBench | Text generation | Prompt-level strict (0-shot, rule) | 77,00 |
| AIME 2025 | Text generation | Accuracy (0-shot, rule) | 96,67 |
| AIME 2026 | Text generation | Accuracy (0-shot, rule) | 96,67 |
| GPQA-Diamond | Text generation | Accuracy (0-shot, rule) | 90,40 |
| ERQA | Image-text-to-text | Accuracy (0-shot, rule) | 66,25 |
| RealWorldQA | Image-text-to-text | Accuracy (0-shot, rule) | 83,53 |

No se han publicado en la información disponible resultados de benchmarks del modelo base Qwen3.8-27B en BF16 para comparar la pérdida por cuantización, ni datos de throughput o latencia medidos de forma independiente.

## Requisitos de hardware

- GPU: NVIDIA GeForce RTX 5090 obligatoria (arquitectura Blackwell, `sm_120a`). El artefacto no está pensado para otras GPU.
- VRAM: el artefacto ocupa 22,09 GiB en disco; con overhead de runtime, caché KV y pesos de visión o especulativos cargados, se recomienda disponer de los 32 GB completos de la RTX 5090.
- Sistema operativo: Linux de 64 bits.
- Runtime: NInfer compilado desde fuente; no hay binario empaquetado ni target de instalación. Requiere las dependencias de compilación del repositorio.
- Opciones de despliegue: exclusivamente NInfer. No es compatible con vLLM, llama.cpp, Ollama, TGI ni Transformers, al no ser safetensors ni GGUF.
- Aceleración: seleccionar `--spec dflash2 --draft-tokens 7 --proposal-head optimized` para decodificación especulativa; se admiten recuentos de borrador de 1 a 15.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-nvfp4-NInfer | 27B denso | no disponible | `.ninfer` | Apache 2.0 | RTX 5090 (sm_120a) | Cuantización mixta NVFP4/FP8, solo NInfer |
| Qwen/Qwen3.8-27B | 27B denso | no disponible | safetensors (BF16) | Apache 2.0 | GPU con VRAM suficiente para BF16 | Modelo base oficial, máxima fidelidad numérica |
| unsloth/Qwen3.8-27B-NVFP4 | 27B denso | no disponible | safetensors NVFP4 | Apache 2.0 | GPU Blackwell | Pesos NVFP4 de origen reutilizados en este artefacto |

No se dispone de datos de rendimiento del modelo base en BF16 ni de los pesos de unsloth en la información proporcionada, por lo que no es posible cuantificar la degradación introducida por la conversión.

## Limitaciones y advertencias

- Los benchmarks del model-index están declarados por el autor, marcados como no verificados y generados con su propia herramienta de evaluación; no deben tratarse como resultados independientes.
- El artefacto solo funciona con NInfer compilado desde fuente sobre una RTX 5090 con `sm_120a`. No hay soporte para otras GPU, otros sistemas operativos ni otros runtimes.
- No es un checkpoint de Transformers, ni una distribución safetensors, ni un archivo GGUF: no se puede cargar con las herramientas habituales del ecosistema.
- La cuantización W4A4 en las capas MLP 0-55 puede degradar tareas sensibles a la precisión numérica; no se han publicado comparativas contra el modelo en BF16.
- La licencia Apache 2.0 se hereda del modelo base, pero conviene verificar las condiciones de Qwen3.8-27B y de los pesos NVFP4 de unsloth antes de un uso comercial.
- Riesgo de alucinación y sesgos: no documentados en la información disponible para este artefacto ni para el modelo base.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe más allá de lo que herede el modelo base.
- Longitud de contexto: no disponible, lo que impide planificar despliegues con ventanas largas.
- El modo thinking está activado por defecto con esfuerzo `xhigh`, lo que incrementa el consumo de tokens y la latencia frente a configuraciones de esfuerzo menor.
- El repositorio ocupa 92,7 GB frente a los 22,09 GiB del artefacto principal, por lo que la descarga completa requiere espacio en disco considerable.
- La fecha de creación (2026-08-06) y los benchmarks sobre AIME 2026 sugieren un artefacto reciente; verificar la integridad con el SHA-256 publicado antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/neroued/Qwen3.8-27B-nvfp4-NInfer
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Pesos NVFP4 de origen: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
- Repositorio del runtime NInfer: https://github.com/Neroued/ninfer
- Guía de compilación: https://github.com/Neroued/ninfer#build
- Conversión de pesos: https://github.com/Neroued/ninfer/blob/master/docs/weight-conversion.md
- Herramienta de evaluación: https://github.com/Neroued/ninfer/tree/master/eval
- Plantilla de chat: https://github.com/Neroued/ninfer/blob/98dada0e03cb073fd07f905400b5904bc6e82759/tools/chat_templates/qwen3_8.jinja
- Pesos DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
