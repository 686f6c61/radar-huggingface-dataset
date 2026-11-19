# mradermacher/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-i1-GGUF

## Resumen

Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-i1-GGUF es una cuantizacion GGUF del modelo Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1, publicada por el usuario mradermacher en Hugging Face. El modelo base es un fine-tune de la familia Qwen3 de 27B parametros (26.895.998.464 parametros reales segun los safetensors del modelo original) realizado por PeetPedro, que combina la base Qwen3 con tecnicas de "abliteration" (eliminacion de rechazos, indicada por el sufijo "Heretic"), un supuesto destilado de "Manus" (agente autonomo) y un ajuste denominado "ColdFusion".

La relevancia de esta publicacion es practica: ofrece el modelo en formato GGUF con una amplia bateria de cuantizaciones (desde IQ1_M hasta Q6_K), lo que permite ejecutarlo en hardware de consumo mediante llama.cpp u Ollama. El repositorio ocupa 23,9 GB y las cuantizaciones se han generado con imatrix (importance matrix) y pesos ponderados, una tecnica que mejora la calidad de las cuantizaciones de baja precision.

No obstante, la informacion disponible es muy limitada: no hay model card descriptiva, no se declaran idiomas, licencia ni pipeline, y no se han publicado resultados de benchmarks. La ficha siguiente refleja exclusivamente los datos verificables del repositorio y del modelo base referenciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, inferida del nombre y del modelo base) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ3_M, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, Q3_K_M, Q3_K_L, small-IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado con imatrix y pesos ponderados) |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de Qwen3 de 27B parametros, una arquitectura transformer decoder-only densa (no se declara componente MoE). El nombre del modelo indica tres intervenciones sobre la base: "ColdFusion" (posiblemente una mezcla o fusion de adaptadores), "Heretic" (terminologia habitual para modelos con abliteration, es decir, la eliminacion de direcciones de activacion asociadas a rechazos) y "ManusDistill" (destilado de trazas o comportamiento del agente Manus). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica documentada en este repositorio es la cuantizacion: se han generado 24 variantes GGUF utilizando imatrix (matrices de importancia calculadas a partir de calibracion) y pesos ponderados, lo que segun el autor mejora la fidelidad de las cuantizaciones de baja precision (IQ1, IQ2, IQ3). El repositorio no incluye el modelo en precision completa, solo los GGUF.

## Capacidades

- Generacion de texto conversacional (etiqueta "conversational" en el repositorio).
- Razonamiento y generacion de codigo, heredados de la base Qwen3 (no verificado en este fine-tune).
- Capacidades de agente y razonamiento multi-paso, presumiblemente reforzadas por el destilado de Manus (no verificado).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que sugiere uso en Inference Endpoints de Hugging Face.
- Multilinguismo: no disponible; depende de la base Qwen3, pero no se declara en este repositorio.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M o IQ4_XS permiten ejecutar un modelo de 27B en GPUs con 16-24 GB de VRAM mediante llama.cpp u Ollama, algo inviable con los pesos en FP16.
- Experimentacion con modelos sin rechazos: el ajuste "Heretic" esta orientado a escenarios de investigacion sobre alineacion y comportamiento de rechazo, donde se necesita comparar respuestas con y sin abliteration.
- Prototipado de agentes conversacionales: la etiqueta "conversational" y el destilado de Manus sugieren uso en flujos de agente multi-paso, aunque sin benchmarks que lo confirmen.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 24 variantes, lo que permite medir el impacto de la precision en tareas concretas con un mismo modelo base.
- Generacion de codigo en local: si hereda las capacidades de Qwen3, puede usarse con llama.cpp como asistente de codigo offline en entornos sin conexion.
- Investigacion sobre destilacion de agentes: util para estudiar como se transfieren trazas de un agente autonomo (Manus) a un modelo denso de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin KV cache): IQ1_M ~5-6 GB; IQ2_M ~7-8 GB; Q4_K_M ~16-17 GB; Q6_K ~22-23 GB. Cifras aproximadas calculadas a partir del tamano del repo y del numero de parametros.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para precisiones altas y contextos largos.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4-Q5; en GPUs de 12-16 GB solo con IQ2/IQ3 o descarga parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; vLLM y TGI no soportan GGUF de forma nativa (requieren el modelo en safetensors).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (GGUF) | ~26,9B | no disponible | no disponible | GGUF | Fine-tune Heretic/Manus, 24 cuantizaciones |
| Qwen3-32B | 32B | 128K (segun Qwen) | Apache 2.0 (segun Qwen) | safetensors, GGUF | Base oficial, con benchmarks publicados |
| Qwen3-30B-A3B | 30B totales / 3B activos | 128K (segun Qwen) | Apache 2.0 (segun Qwen) | safetensors, GGUF | Variante MoE, mas eficiente en inferencia |
| Gemma 3 27B | 27B | 128K (segun Google) | Gemma Terms | safetensors, GGUF | Alternativa densa de tamano similar |

Los datos de los modelos comparativos provienen de sus fichas oficiales; los de este modelo son los unicos verificados en el repositorio.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, licencia, idiomas ni evaluaciones; el uso en produccion es arriesgado sin validacion propia.
- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido; el modelo base Qwen3 suele ser Apache 2.0, pero el fine-tune no lo especifica.
- El ajuste "Heretic" implica abliteration: el modelo puede generar contenido que la base rechazaria, con riesgos de seguridad y de cumplimiento en entornos regulados.
- Riesgo de alucinacion: inherente a los modelos de 27B y agravado por la falta de benchmarks y de evaluacion del fine-tune.
- Cuantizaciones IQ1/IQ2 con degradacion notable de calidad; solo recomendables para pruebas, no para produccion.
- El repositorio tiene 0 descargas y 0 likes: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion futura (2026-11-19) en los metadatos: inconsistencia que sugiere datos poco fiables o manipulados.
- No se declara soporte de tool calling ni de contexto largo; no asumir capacidades de agente sin verificar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1-i1-GGUF
- Modelo base referenciado: https://huggingface.co/PeetPedro/Qwen3.8-27B-ColdFusion-Heretic-ManusDistill-v1
