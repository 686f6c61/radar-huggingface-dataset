# mradermacher/persona_lambda_27b_v10-i1-GGUF

## Resumen

`mradermacher/persona_lambda_27b_v10-i1-GGUF` es una cuantizacion en formato GGUF del modelo base `eousphoros/persona_lambda_27b_v10`, publicada por el usuario mradermacher, conocido en Hugging Face por distribuir versiones cuantizadas de modelos de terceros. El nombre del repositorio indica un modelo de 27.000 millones de parametros, aunque la informacion de safetensors asociada al repo apunta a 6.789.424 parametros, un dato incoherente que conviene tratar con cautela. No se dispone de model card propia mas alla de los metadatos de generacion de las cuantizaciones.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de gran tamano en hardware con recursos limitados mediante cuantizaciones de 1 a 6 bits (IQ1_S hasta Q6_K), generadas con tecnicas de imatrix/weighted quantisation. Sin embargo, la ausencia de documentacion sobre el modelo original (arquitectura, datos de entrenamiento, licencia, idiomas) limita seriamente su evaluacion para uso en produccion.

El modelo original parece orientado a roleplay o personajes ("persona_lambda"), un nicho habitual en la comunidad de modelos afinados, pero no hay informacion verificable sobre su entrenamiento ni sobre sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere un transformer de ~27B, sin confirmar) |
| Parametros totales | 27B segun el nombre del repo; 6.789.424 segun safetensors (dato incoherente, no disponible de forma fiable) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, Q4_1, IQ3_XS, IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones generadas con llama.cpp, con imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base `eousphoros/persona_lambda_27b_v10`. El nombre sugiere un transformer de aproximadamente 27.000 millones de parametros, pero no hay model card, paper ni documentacion tecnica que lo confirme. Tampoco se conocen los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo unico documentado es el proceso de cuantizacion: las versiones GGUF se han generado con llama.cpp usando cuantizacion ponderada con matriz de importancia (imatrix), lo que mejora la calidad de las cuantizaciones de baja precision (especialmente las de 2 y 3 bits) respecto a la cuantizacion uniforme. El autor indica `quantize_version: 2` y `output_tensor_quantised: 1` en los metadatos.

## Capacidades

- Generacion de texto: capacidad esperable por el formato, pero no verificada ni documentada.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Orientacion probable a roleplay o personajes por el nombre "persona_lambda", sin confirmar.

## Casos de uso

- Experimentacion local con modelos de gran tamano: las cuantizaciones IQ2/IQ3 permiten probar un modelo de ~27B en GPUs de consumo con 8-12 GB de VRAM, aunque con perdida de calidad apreciable.
- Roleplay y generacion creativa en local: si el modelo base esta afinado para personajes, las versiones Q4_K_M o Q5_K_M ofrecen un equilibrio razonable entre calidad y requisitos de memoria para uso recreativo.
- Prototipado de chatbots conversacionales: util para validar interfaces y flujos conversacionales antes de invertir en modelos con licencia y soporte documentados.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye practicamente todas las variantes de llama.cpp, lo que permite medir el impacto de la cuantizacion en la calidad de salida para este modelo concreto.
- Despliegue en entornos con memoria limitada: las variantes Q2_K_S e IQ1_S permiten ejecucion en CPU o GPUs muy modestas, a costa de una degradacion notable.
- Investigacion sobre cuantizacion con imatrix: sirve como caso de estudio de como las tecnicas ponderadas afectan a modelos de ~27B en rangos de 1 a 3 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (asumiendo ~27B parametros):
  - Q6_K: ~22-24 GB
  - Q5_K_M: ~19-20 GB
  - Q4_K_M: ~16-17 GB
  - Q3_K_M: ~13-14 GB
  - IQ2_M / Q2_K: ~9-11 GB
  - IQ1_S: ~6-7 GB
- GPU recomendadas: A100 40GB o H100 para cuantizaciones altas sin offloading; RTX 4090 (24 GB) para Q5/Q6; RTX 3090/4080 (16-24 GB) para Q4; RTX 3060 12 GB o GPUs de 8 GB para IQ2/IQ3.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones, con las salvedades de calidad en las de 1-2 bits.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, llama-cpp-python, text-generation-webui. vLLM y TGI no aceptan GGUF directamente sin conversion.
- Latencia y throughput: no disponibles; dependen de la GPU y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| persona_lambda_27b_v10-i1-GGUF | ~27B (segun nombre) | no disponible | no disponible | GGUF | Hugging Face |
| Modelos GGUF de ~27B de la comunidad (p. ej. variantes de Mistral/Mixtral o Gemma) | ~24-27B | variable | variable segun base | GGUF | Hugging Face |
| Modelos oficiales de ~27B con soporte documentado | ~27B | documentado | documentada | safetensors/GGUF | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa fiable con alternativas concretas.

## Limitaciones y advertencias

- Ausencia total de model card: no hay informacion sobre arquitectura, entrenamiento, licencia ni idiomas, lo que impide evaluar su idoneidad para produccion.
- Incoherencia en el recuento de parametros: el nombre indica 27B pero safetensors reporta 6.789.424, lo que sugiere un problema de metadatos o un modelo distinto al anunciado.
- Licencia no disponible: no se puede confirmar el uso comercial; se debe consultar el modelo base `eousphoros/persona_lambda_27b_v10` antes de cualquier despliegue.
- Riesgo de alucinacion: sin datos de alineacion ni evaluaciones, el riesgo es desconocido y potencialmente alto.
- Degradacion por cuantizacion: las variantes IQ1/IQ2 pierden calidad de forma significativa; para uso serio se recomienda Q4_K_M o superior.
- Sesgos: no documentados; al ser un modelo afinado de la comunidad, puede arrastrar sesgos del dataset original.
- Sin soporte ni mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay garantia de actualizaciones.
- Contexto desconocido: no se puede planificar su uso en tareas que requieran ventanas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/persona_lambda_27b_v10-i1-GGUF
- Modelo base: https://huggingface.co/eousphoros/persona_lambda_27b_v10
- Version GGUF alternativa del mismo autor: https://huggingface.co/mradermacher/persona_lambda_27b_v10-GGUF
- Perfil del autor: https://huggingface.co/mradermacher
