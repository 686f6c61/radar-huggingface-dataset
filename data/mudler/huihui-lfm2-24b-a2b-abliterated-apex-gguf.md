# mudler/Huihui-LFM2-24B-A2B-abliterated-APEX-GGUF

## Resumen

Huihui-LFM2-24B-A2B-abliterated-APEX-GGUF es un conjunto de cuantizaciones GGUF del modelo huihui-ai/Huihui-LFM2-24B-A2B-abliterated, un fine-tune del LFM2-24B-A2B de Liquid AI al que se le ha eliminado el comportamiento de rechazo mediante abliteration. El modelo subyacente es un Mixture-of-Experts de aproximadamente 24 000 millones de parametros totales con unos 2000 millones activos por token, lo que lo situa en la categoria de modelos MoE de gran tamano pero coste de inferencia relativamente bajo.

Las cuantizaciones las publica mudler, el equipo de LocalAI, bajo la estrategia APEX (Adaptive Precision for EXpert Models), que clasifica los tensores por rol (expertos enrutados, expertos compartidos, atencion) y aplica un gradiente de precision por capas: las capas de borde conservan mas precision y las centrales se comprimen de forma mas agresiva. El repositorio ofrece siete variantes entre 9,01 GB y 17,09 GB, algunas con importance matrix.

La relevancia actual es doble: por un lado, permite ejecutar un MoE de 24B en hardware de consumo con llama.cpp; por otro, el modelo esta abliterado y las cuantizaciones no han sido evaluadas con benchmarks, por lo que su comportamiento cualitativo no esta medido. Es un artefacto para experimentacion local, no para produccion sin validacion previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE (30 capas convolucionales + 10 de atencion completa, 40 capas totales, 2 capas densas) |
| Parametros totales | 23 843 661 440 (~23,8B) |
| Parametros activos | ~2B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | APEX Quality, APEX I-Quality, APEX Balanced, APEX I-Balanced, APEX Compact, APEX I-Compact, APEX I-Mini |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (LFM Open License v1.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es LFM2-24B-A2B de Liquid AI, un transformer hibrido con 40 capas: 30 capas convolucionales y 10 de atencion completa. Incorpora 64 expertos enrutados con 4 activos por token, ademas de 2 capas densas. Es un modelo exclusivamente de texto. Sobre esa base, huihui-ai aplico abliteration para eliminar el comportamiento de rechazo, y mudler genero las cuantizaciones APEX.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO, ni para el modelo original ni para el fine-tune. La estrategia APEX, en cambio, si esta documentada: clasifica tensores por rol y aplica un gradiente de precision por profundidad de capa, con mayor precision en los bordes y compresion mas agresiva en el centro. Las variantes con prefijo `I-` usan una importance matrix construida con datos de calibracion diversos (chat, codigo, razonamiento, tool calling, trazas agenticas y Wikipedia). Las variantes Quality, Balanced y Compact tambien se distribuyen sin imatrix; Mini solo existe como I-Mini.

## Capacidades

- Generacion de texto conversacional en formato chat, segun la etiqueta `conversational` del repositorio.
- Razonamiento y generacion de codigo: el modelo base es de proposito general; las cuantizaciones con imatrix incluyen datos de codigo y razonamiento en la calibracion.
- Tool calling y function calling: la calibracion I- incluye trazas de tool calling y agenticas, lo que sugiere soporte, aunque no hay evaluacion publicada que lo confirme.
- Flujos agenticos multi-paso: idem, sin medicion publicada.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Sin vision ni audio: el modelo es solo texto.
- Sin modo thinking explicito declarado.

## Casos de uso

- Experimentacion local con MoE de gran tamano: las variantes Compact (11,07 GB) y Mini (9,01 GB) permiten cargar un MoE de 24B en GPUs de consumo o en equipos con memoria unificada, usando llama.cpp con soporte `lfm2moe`.
- Despliegue en LocalAI: el repositorio documenta el comando `local-ai run mudler/Huihui-LFM2-24B-A2B-abliterated-APEX-GGUF@...`, pensado para entornos de inferencia local autogestionados.
- Evaluacion de tecnicas de cuantizacion: comparar Quality, Balanced, Compact y Mini sobre el mismo modelo permite medir el impacto de la compresion APEX en tareas concretas antes de fijar una variante.
- Investigacion sobre abliteration: util para estudiar como cambia el comportamiento de un modelo al eliminar los rechazos y como interactua eso con la cuantizacion.
- Prototipado de asistentes conversacionales sin filtros de rechazo: en entornos controlados donde se necesita que el modelo no bloquee peticiones por politica de seguridad.
- Generacion de codigo en pipelines internos: la variante I-Balanced (17,09 GB) es la opcion intermedia recomendada por tamano y calibracion, siempre con validacion de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el estado es "unevaluated": la unica comprobacion realizada fue que cada archivo carga en llama.cpp y genera una respuesta corta y legible.

## Requisitos de hardware

- VRAM estimada: entre 9,01 GB (I-Mini) y 17,09 GB (Balanced) solo para pesos; hay que anadir el contexto KV cache, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: el autor menciona una NVIDIA DGX Spark con 122 GB de memoria unificada como su hardware local para MoE de clase 30-50B. Para estas variantes bastaria con GPUs de 24 GB (RTX 4090, A10G) en las versiones Compact y Mini, y de 24-32 GB para Balanced.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con las variantes Compact, I-Compact, Mini y probablemente Balanced; en GPUs de 16 GB solo las variantes Mini y Compact con contexto reducido.
- Despliegue: llama.cpp (build reciente con soporte `lfm2moe`, verificado con build b12024, commit `ddf48f85c`) y LocalAI. No se documentan vLLM ni TGI para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Huihui-LFM2-24B-A2B-abliterated APEX | ~23,8B | ~2B | no disponible | lfm1.0 | GGUF |
| LiquidAI/LFM2-24B-A2B | ~23,8B | ~2B | no disponible | lfm1.0 | safetensors |
| huihui-ai/Huihui-LFM2-24B-A2B-abliterated | ~23,8B | ~2B | no disponible | lfm1.0 | safetensors |

La comparativa se limita a las tres variantes de la misma familia, ya que no se dispone de datos de rendimiento para contrastar con otros MoE de tamano similar. La diferencia entre ellas es el formato (GGUF cuantizado frente a safetensors), la presencia de abliteration y la receta de cuantizacion.

## Limitaciones y advertencias

- Modelo abliterado: no rechaza peticiones como el modelo base; la responsabilidad sobre las salidas recae en el usuario.
- Cuantizaciones sin evaluar: no hay benchmarks ni evaluacion cualitativa; la abliteration y la cuantizacion pueden alterar el comportamiento de formas no medidas.
- Licencia restrictiva: LFM Open License v1.0 permite uso comercial solo a organizaciones con ingresos anuales inferiores a 10 millones de USD; por encima se requiere licencia separada de Liquid AI. No es Apache-2.0.
- Obligacion de atribucion: al redistribuir hay que incluir copia de la licencia y mantener la atribucion a Liquid AI y huihui-ai.
- Idiomas no declarados: no hay garantia de calidad multilingue.
- Contexto no documentado: se desconoce la ventana maxima y su impacto en memoria.
- Riesgo de alucinacion: inherente al modelo base y no cuantificado en estas variantes.
- Dependencia de version: requiere llama.cpp reciente con soporte `lfm2moe`; builds antiguos no cargaran los archivos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mudler/Huihui-LFM2-24B-A2B-abliterated-APEX-GGUF
- Modelo base del fine-tune: https://huggingface.co/huihui-ai/Huihui-LFM2-24B-A2B-abliterated
- Modelo original: https://huggingface.co/LiquidAI/LFM2-24B-A2B
- Licencia: https://huggingface.co/LiquidAI/LFM2-24B-A2B/blob/main/LICENSE
- Proyecto APEX: https://github.com/mudler/apex-quant
- Informe tecnico APEX: https://github.com/mudler/apex-quant/blob/main/paper/APEX_Technical_Report.pdf
- LocalAI: https://github.com/mudler/LocalAI
- llama.cpp: https://github.com/ggerganov/llama.cpp
