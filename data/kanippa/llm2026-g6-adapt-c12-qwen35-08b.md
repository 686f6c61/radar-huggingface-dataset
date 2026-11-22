# kanippa/llm2026-g6-adapt-c12-qwen35-08b

## Resumen

kanippa/llm2026-g6-adapt-c12-qwen35-08b es un ajuste fino supervisado (LoRA fusionado) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario kanippa en el marco de un proyecto identificado como "llm2026-g6". El modelo resuelve una tarea de adaptacion muy concreta: responder preguntas encadenadas (multi-hop) en japones sobre fragmentos de contexto recuperados, sin inyeccion de evidencia gold. Se trata, por tanto, de un artefacto de investigacion mas que de un modelo de proposito general.

Arquitectonicamente no introduce cambios respecto al modelo base: es un transformer denso de Qwen3.5 con 852.985.920 parametros totales (aproximadamente 0,85 mil millones), exportado en safetensors y con licencia Apache 2.0. La adaptacion consistio en una epoca de LoRA (62 actualizaciones) sobre 496 preguntas encadenadas y 496 filas no encadenadas procedentes de JSQuAD, JEMHopQA, JaQuAD y NIILC, fusionada en FP32 sobre la estructura FP16 original.

Su relevancia es limitada fuera del contexto del experimento: no tiene descargas ni interacciones en Hugging Face, solo declara soporte para japones y su model card no documenta evaluaciones comparativas. Resulta util como referencia para quienes investiguen adaptaciones de bajo coste sobre modelos pequenos para tareas de QA multi-hop en japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3_5ForConditionalGeneration, sin cambios estructurales) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; el repo ocupa 1,7 GB) |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17) y se inicializa desde la fusion del ciclo 3 del modelo G6 (hash 3a6ea2eea70f11035a84b8a4d9d22ff6b6951d034886f3764cb3996dc2130384). Sobre esa base se aplico una adaptacion LoRA de una epoca con 62 actualizaciones, entrenada en una GPU L4 (372 de 760 pasos completados segun la model card), y los adaptadores se fusionaron en FP32 dentro de la estructura FP16 del modelo base. No hay modificaciones arquitectonicas: el resultado es un checkpoint denso estandar de Qwen3.5.

Los datos de entrenamiento combinan 496 preguntas encadenadas del conjunto pair_train, construidas con los cinco fragmentos recuperados reales del sistema C12 (sin inyeccion de evidencia gold), y 496 filas no encadenadas compartidas con ctrl_legacy procedentes de los splits de entrenamiento de JSQuAD, JEMHopQA, JaQuAD y NIILC. La model card indica que los conjuntos de evaluacion, mock y produccion se excluyeron estrictamente. No se documenta uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en japones (pipeline text-generation).
- Respuesta a preguntas encadenadas (multi-hop) sobre contexto recuperado, que es la tarea objetivo de la adaptacion.
- Manejo de preguntas no encadenadas de dominios cubiertos por JSQuAD, JEMHopQA, JaQuAD y NIILC.
- Hereda las capacidades del modelo base Qwen3.5-0.8B en la medida en que la adaptacion no las degrade; la model card no las detalla.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion en QA multi-hop en japones: el modelo sirve como punto de comparacion frente al base Qwen3.5-0.8B para medir el efecto de una adaptacion LoRA breve sobre preguntas encadenadas con contexto recuperado real.
- Reproduccion de experimentos de recuperacion-aumentada: al haberse entrenado con los fragmentos top-5 del sistema C12 sin evidencia gold, permite estudiar como afecta el ruido del retriever al rendimiento del generador.
- Prototipado de asistentes documentales en japones: con 0,85 mil millones de parametros cabe en GPUs de consumo y permite iterar rapidamente sobre pipelines de RAG antes de escalar a modelos mayores.
- Evaluacion de estrategias de fusion de adaptadores: el checkpoint fusionado en FP32 sobre FP16 del base es un caso practico para estudiar perdidas de precision en el merge.
- Docencia y formacion: su tamano reducido y su receta de entrenamiento documentada (epocas, actualizaciones, fuentes de datos) lo hacen util como ejemplo reproducible de ajuste fino de bajo coste.
- Filtrado o preprocesado en pipelines de QA: puede emplearse como primer estadio para descartar preguntas mal formuladas o contextos irrelevantes antes de invocar un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: en torno a 1,7 GB de pesos mas overhead de activaciones y cache KV; con contexto corto cabe holgadamente en 4 GB.
- Cuantizacion a 8 bits: aproximadamente 0,9 GB; a 4 bits: aproximadamente 0,5 GB (estimaciones a partir del numero de parametros; la model card no publica cuantizaciones).
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090); para entrenamiento se uso una NVIDIA L4.
- Cabe en GPU de consumo: si, en practicamente todas las GPU discretas modernas e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser un checkpoint safetensors de Qwen3.5, es compatible con vLLM, TGI, llama.cpp (previa conversion a GGUF) y Ollama (previa conversion), aunque no se documenta ninguna conversion oficial.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| kanippa/llm2026-g6-adapt-c12-qwen35-08b | 852.985.920 | no disponible | ja | Apache 2.0 | Ajuste LoRA fusionado para QA multi-hop en japones |
| Qwen/Qwen3.5-0.8B (base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Modelo original sin adaptacion; referencia directa |
| Alternativas de ~1B para japones | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo solo declara soporte para japones; su uso en castellano u otros idiomas no esta validado y probablemente degrade respecto al base.
- La adaptacion se entreno con 62 actualizaciones y una epoca: el riesgo de sobreajuste a los conjuntos de entrenamiento (JSQuAD, JEMHopQA, JaQuAD, NIILC) es alto y la generalizacion fuera de esos dominios es incierta.
- No hay benchmarks publicados, por lo que no puede afirmarse que supere al modelo base en ninguna tarea.
- Riesgo de alucinacion inherente a los modelos de 0,85 mil millones de parametros, especialmente en preguntas multi-hop con contexto recuperado ruidoso.
- La model card indica que se completaron 372 de 760 pasos de entrenamiento, lo que sugiere un entrenamiento parcial; conviene verificar la convergencia antes de usarlo en produccion.
- Ausencia total de adopcion (0 descargas, 0 likes) y de documentacion sobre sesgos, evaluacion de seguridad o limitaciones de contexto.
- La licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5-0.8B conviene revisar tambien las condiciones del modelo base.
- No se documenta la longitud de contexto efectiva; asumir la del base sin verificar puede provocar truncamientos silenciosos en pipelines RAG.

## Enlaces

- Hugging Face: https://huggingface.co/kanippa/llm2026-g6-adapt-c12-qwen35-08b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
