# mradermacher/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-i1-GGUF

## Resumen

Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-i1-GGUF es una cuantizacion en formato GGUF realizada por el usuario mradermacher a partir del modelo base Swift-1.5-Qwen3.8-27b-heretic-unsycophantic, publicado por RacingAce66. Se trata, por tanto, de un derivado de terceros y no de un modelo original: el repositorio contiene unicamente pesos cuantizados pensados para inferencia local con llama.cpp y herramientas compatibles, no el modelo en precision completa ni informacion sobre su entrenamiento.

La nomenclatura del nombre sugiere una base Qwen3 de aproximadamente 27 mil millones de parametros, con ajustes orientados a reducir el comportamiento sycophantic (adulador) y con la etiqueta "heretic", habitual en variantes que buscan eliminar el alineamiento de rechazo. Sin embargo, el unico dato cuantitativo verificable en la informacion disponible es el recuento de parametros de los safetensors del repo (6.789.424), que no es coherente con un modelo de 27B y probablemente corresponde a un componente auxiliar o a un error de metadatos. No hay model card sustantiva, ni licencia, ni idiomas, ni benchmarks publicados.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no presenta descargas ni likes, fue creado y actualizado el mismo dia y no incluye documentacion tecnica. Cualquier evaluacion de calidad, seguridad o licencia queda pendiente de verificacion en el modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere base Qwen3; sin confirmar) |
| Parametros totales | no disponible de forma fiable (el nombre indica 27b; los safetensors del repo declaran 6.789.424, dato no coherente) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ3_XXS, small-IQ4_NL, IQ4_XS, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones weighted/imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre apunta a una familia Qwen3 con aproximadamente 27B parametros, pero no se confirma si emplea atencion densa, mezcla de expertos (MoE) u otra variante, ni el tipo de atencion, la longitud de contexto nativa o el tokenizador.

Respecto al entrenamiento, la model card del repositorio no incluye datos sobre volumen de tokens, composicion del corpus, fases de preentrenamiento, SFT, RLHF o DPO. Las etiquetas "heretic" y "unsycophantic" sugieren ajustes de alineamiento orientados a reducir rechazos y adulacion, pero no hay detalle tecnico sobre como se aplicaron. La unica informacion verificable es el proceso de cuantizacion: el autor indica que se usaron cuantizaciones weighted/imatrix (quantize_version 2, output_tensor_quantised 1, convert_type hf), lo que implica calculo de matrices de importancia para mejorar la precision de los pesos cuantizados.

## Capacidades

- Generacion de texto y razonamiento: capacidades inferidas del modelo base Qwen3, no verificadas en este repositorio.
- Generacion de codigo y matematicas: presumiblemente soportadas por la base, sin datos concretos.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking o razonamiento extendido: no disponible.
- Vision, audio u otras modalidades: no disponible; el repositorio no incluye proyector multimodal (skip_mmproj vacio).

## Casos de uso

- Inferencia local en estaciones de trabajo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de ~27B en GPUs de consumo con 24 GB de VRAM, util para prototipado sin conexion.
- Experimentacion con alineamiento alternativo: el ajuste "unsycophantic" y "heretic" puede interesar a investigadores que estudian como varia el comportamiento del modelo al modificar el alineamiento, comparando respuestas frente a la version original.
- Evaluacion de cuantizaciones: la disponibilidad de 25 variantes (desde IQ1_S hasta Q6_K) permite medir la degradacion de calidad segun el nivel de compresion en tareas concretas.
- Despliegue en entornos con recursos limitados: las variantes Q2_K e IQ2 permiten ejecucion en CPU o GPUs con poca memoria, a costa de perdida de fidelidad.
- Pruebas de pipelines con llama.cpp: integracion en scripts de generacion por lotes para evaluar latencia y throughput en hardware modesto.
- Analisis de robustez y seguridad: util para auditar como responde un modelo con rechazos reducidos ante prompts sensibles, siempre en un entorno controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo de ~27B, estimacion orientativa): Q6_K ~22-24 GB; Q5_K_M ~19-21 GB; Q4_K_M ~16-18 GB; Q3_K_M ~13-14 GB; Q2_K ~10-11 GB; IQ1_S ~6-7 GB. Estas cifras son estimaciones basadas en el tamano nominal y no en mediciones del repositorio.
- GPU recomendadas: A100 40/80 GB o H100 para las cuantizaciones altas y contexto largo; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090/4080 (16-24 GB) para Q4 y Q3.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 y 4070 Ti Super con cuantizaciones Q4 o inferiores; las variantes Q2 e IQ2 pueden ejecutarse en GPUs de 8-12 GB o en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF (llama-server). vLLM y TGI no soportan GGUF de forma nativa sin conversion.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-i1-GGUF | ~27B (segun nombre; sin confirmar) | no disponible | no disponible | GGUF | Cuantizacion de terceros, sin benchmarks ni model card sustantiva |
| Modelo base Swift-1.5-Qwen3.8-27b-heretic-unsycophantic | ~27B (segun nombre) | no disponible | no disponible | safetensors (presumible) | Fuente original de esta cuantizacion |
| Familia Qwen3 original | 0.6B a 235B (varias tallas) | hasta 128K en algunas variantes | Apache 2.0 en la mayoria de variantes | safetensors, GGUF | Referencia de arquitectura y licencia; no se confirma que este derivado herede la licencia |
| Otras cuantizaciones GGUF de Qwen3 27B/32B | ~27-32B | variable | segun autor | GGUF | Alternativas comparables en tamano y formato, sin datos de rendimiento en esta ficha |

No se dispone de informacion suficiente para una comparativa cuantitativa de rendimiento.

## Limitaciones y advertencias

- Ausencia de model card sustantiva: no hay informacion sobre entrenamiento, datos, evaluaciones ni uso previsto.
- Licencia no declarada: no se puede confirmar el uso comercial; debe verificarse en el modelo base original antes de cualquier despliegue en produccion.
- Incoherencia en metadatos: el recuento de parametros de los safetensors (6.789.424) no concuerda con el nombre (27b), lo que impide fiarse de los datos tecnicos del repo.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks ni evaluaciones publicadas no es posible cuantificarlo.
- Sesgos conocidos: no documentados; el ajuste "heretic" y "unsycophantic" puede alterar el comportamiento en temas sensibles y reducir los rechazos, con implicaciones de seguridad.
- Idiomas: no declarados; el soporte multilingue es incierto.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por la comunidad.
- Cuantizaciones muy agresivas (IQ1, IQ2) pueden degradar notablemente la calidad; no se han publicado evaluaciones de degradacion.
- Fecha de creacion futura (2026-11-16): metadato anomalo que sugiere posibles errores en la publicacion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic-i1-GGUF
- Modelo base citado: https://huggingface.co/RacingAce66/Swift-1.5-Qwen3.8-27b-heretic-unsycophantic
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
