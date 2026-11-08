# mradermacher/LFM3-VL-2B-heretic-i1-GGUF

## Resumen

LFM3-VL-2B-heretic-i1-GGUF es una cuantizacion en formato GGUF del modelo LFM3-VL-2B-heretic, un derivado del modelo multimodal LFM3-VL-2B desarrollado por Liquid AI y publicado en octubre de 2026. El autor de esta cuantizacion es mradermacher, un perfil conocido en Hugging Face por generar versiones cuantizadas de modelos populares en multiples formatos (Q2_K, Q4_K_M, Q6_K, IQ2, IQ3, IQ4, entre otros). El modelo base ha sido modificado mediante la tecnica "heretic", un procedimiento de modificacion de modelos sin entrenamiento (training-free) orientado a reducir la censura y el comportamiento servil del modelo original.

El modelo original LFM3-VL-2B es un modelo de lenguaje y vision de aproximadamente 2 mil millones de parametros, lo que lo situa en la categoria de modelos pequenos aptos para despliegue en hardware de consumo. La modificacion "heretic" aplicada por saidutta69 elimina parte de los mecanismos de rechazo y alineacion del modelo original, lo que puede interesar a investigadores que estudian el comportamiento de modelos alineados, pero tambien introduce riesgos significativos para uso en produccion.

Esta ficha describe la version cuantizada publicada por mradermacher. La informacion disponible es muy limitada: no se han publicado datos de benchmarks especificos para esta variante, no se especifica la licencia del modelo derivado y el repositorio no incluye una model card detallada mas alla de las etiquetas de generacion de cuantizaciones. Los datos de parametros reportados por la plataforma (899.013) no son coherentes con el nombre del modelo y deben interpretarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base LFM3-VL-2B de Liquid AI; presumiblemente transformer multimodal, sin confirmar) |
| Parametros totales | No disponible de forma fiable; el nombre indica 2B, pero la plataforma reporta 899.013 (dato inconsistente) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small-IQ4_NL) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix/weighted) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base LFM3-VL-2B en la informacion proporcionada. Por el nombre y el desarrollador (Liquid AI), se trata de un modelo multimodal (VL, vision-language) de aproximadamente 2 mil millones de parametros. Liquid AI es conocida por sus modelos de tipo Liquid Foundation Model, aunque no se confirma en los datos disponibles que esta generacion mantenga esa arquitectura o haya migrado a un transformer convencional.

El proceso de cuantizacion realizado por mradermacher utiliza cuantizaciones ponderadas con matrices de importancia (imatrix), lo que mejora la calidad de las versiones de baja precision (IQ2, IQ3, Q4) respecto a cuantizaciones estandar. La modificacion "heretic" del modelo base (realizada por saidutta69) es un procedimiento de edicion de pesos sin reentrenamiento, descrito en el proyecto p-e-w/heretic, que busca eliminar comportamientos de rechazo y reducir la adulacion (sycophancy) del modelo. No se dispone de informacion sobre los datos de entrenamiento originales, el numero de tokens utilizados ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base LFM3-VL-2B.
- Capacidades multimodales de vision y lenguaje (procesamiento de imagenes junto con texto), segun la designacion VL del modelo.
- Comportamiento modificado para reducir rechazos y censura en las respuestas, como consecuencia de la tecnica heretic.
- Soporte de tool calling / function calling: no disponible (no confirmado en la informacion).
- Soporte de agentes y razonamiento multi-paso: no disponible (no confirmado).
- Capacidades multilingues: no disponible.
- Modo thinking o capacidades especiales: no disponible.

## Casos de uso

- Investigacion sobre alineacion y censura: el modelo permite estudiar como cambia el comportamiento de un modelo al eliminar mecanismos de rechazo, comparando las respuestas del original y de la variante heretic en el mismo conjunto de prompts.
- Evaluacion de tecnicas de edicion de modelos: util para investigadores que analizan la eficacia y los efectos secundarios del metodo heretic en modelos multimodales pequenos.
- Pruebas de robustez y red teaming: permite generar respuestas que un modelo alineado rechazaria, lo que resulta util para construir conjuntos de datos de evaluacion de seguridad.
- Despliegue local de un modelo multimodal pequeno: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar el modelo en equipos con GPU de consumo, util para prototipado de aplicaciones de vision-lenguaje.
- Experimentacion con cuantizaciones: el repositorio ofrece un amplio rango de cuantizaciones (desde IQ1_S hasta Q6_K) para comparar la degradacion de calidad segun el nivel de compresion.
- Desarrollo de asistentes de imagen sin restricciones de contenido: en entornos controlados de investigacion, para analizar como un modelo sin censura describe imagenes y responde a consultas visuales.
- Integracion en pipelines de generacion aumentada por recuperacion (RAG) multimodal: para pruebas de concepto que combinen texto e imagenes en contextos de documentacion tecnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos especificos de MMLU, HumanEval, GSM8K ni otras evaluaciones para esta variante cuantizada, y no se debe asumir que el rendimiento del modelo base se mantiene intacto tras la modificacion heretic y la cuantizacion.

## Requisitos de hardware

- VRAM estimada: para un modelo de aproximadamente 2B parametros, las cuantizaciones Q4_K_M ocupan alrededor de 1,2-1,5 GB, las Q6_K alrededor de 1,8-2,2 GB y las IQ2/IQ3 entre 0,7 y 1,2 GB (estimaciones orientativas; no confirmadas en la informacion).
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM puede ejecutar las cuantizaciones de 4 bits; una RTX 3060, RTX 4060 o superior es suficiente. Para las cuantizaciones de mayor precision (Q6_K) se recomienda 6-8 GB de VRAM.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas (RTX 3060 en adelante) y en equipos con 8 GB de RAM para ejecucion en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para servidores, llama.cpp con servidor integrado o vLLM si se convierte el formato.
- Latencia y throughput: no disponibles. En GPU de consumo se puede esperar una generacion interactiva para un modelo de este tamano, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-VL-2B-heretic-i1-GGUF (este) | ~2B (segun nombre) | No disponible | Vision-lenguaje | No disponible | GGUF en Hugging Face |
| LFM3-VL-2B (original, Liquid AI) | ~2B | No disponible | Vision-lenguaje | No disponible | Modelo base en Hugging Face |
| Qwen-3-VL-2B-Instruct-heretic-GGUF (mradermacher) | ~2B | No disponible | Vision-lenguaje | No disponible | GGUF en Hugging Face |

La comparativa se limita a modelos de la misma familia o del mismo autor de cuantizaciones, ya que no se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas como Qwen2-VL-2B, SmolVLM o PaliGemma.

## Limitaciones y advertencias

- La modificacion heretic elimina mecanismos de rechazo y seguridad del modelo original, lo que puede producir respuestas inapropiadas, ofensivas o peligrosas. No es apto para uso en produccion orientado al publico sin filtros adicionales.
- No se especifica la licencia del modelo derivado ni del modelo base en la informacion disponible; es imprescindible verificar los terminos del modelo original LFM3-VL-2B de Liquid AI antes de cualquier uso comercial.
- El dato de parametros reportado por la plataforma (899.013) es inconsistente con el nombre del modelo (2B) y con el tamano esperado de un modelo multimodal; debe tratarse como un error de metadatos.
- Las cuantizaciones de baja precision (IQ1, IQ2, Q3) degradan notablemente la calidad, especialmente en tareas de razonamiento y en el procesamiento de imagenes.
- Riesgo elevado de alucinacion, comun en modelos de 2B parametros y potencialmente agravado por la modificacion heretic.
- No hay informacion sobre sesgos, idiomas soportados ni calidad del soporte multimodal tras la cuantizacion.
- El repositorio tiene 0 descargas y 0 likes, sin validacion de la comunidad; la calidad de las cuantizaciones no ha sido verificada de forma independiente.
- El modelo base se publico en octubre de 2026 y esta variante en noviembre de 2026; se trata de material muy reciente y poco documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-VL-2B-heretic-i1-GGUF
- Modelo base modificado: https://huggingface.co/saidutta69/LFM3-VL-2B-heretic
- Perfil del autor de cuantizaciones: https://huggingface.co/mradermacher
- Proyecto heretic (p-e-w): https://github.com/p-e-w/heretic
- Pagina de referencia del modelo LFM3-VL-2B: https://llm-stats.com/models/lfm3-vl-2b
- Ejemplo de cuantizacion similar del mismo autor: https://huggingface.co/mradermacher/Qwen-3-VL-2B-Instruct-heretic-GGUF
