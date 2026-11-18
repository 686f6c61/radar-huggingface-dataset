# mradermacher/Agentic-27B-V2-i1-GGUF

## Resumen

Agentic-27B-V2-i1-GGUF es una redistribución en formato GGUF del modelo Agentic-27B-V2 desarrollado por OpenCSG, publicada por el usuario mradermacher. El modelo original es un transformer denso de aproximadamente 27.320 millones de parámetros (27,3B), orientado a tareas conversacionales y de razonamiento agéntico, según indican las etiquetas del repositorio. Esta versión concreta no aporta pesos nuevos: su valor está en ofrecer el modelo original cuantizado en múltiples niveles de precisión para facilitar su despliegue en hardware con recursos limitados.

La publicación sigue el flujo habitual de mradermacher: cuantizaciones generadas con llama.cpp a partir de los pesos originales en formato Hugging Face, empleando calibración con matriz de importancia (imatrix) para mejorar la calidad de los niveles de cuantización agresivos. El repositorio incluye un conjunto amplio de variantes que abarca desde IQ1_S hasta Q6_K, lo que permite elegir el equilibrio entre tamaño en disco y fidelidad de la salida.

Es relevante ahora porque reduce la barrera de entrada para probar un modelo de 27B en equipos de consumo: las variantes de 4 bits caben en GPUs con 16-24 GB de VRAM, y las de 2-3 bits permiten ejecución parcial en CPU o GPUs modestas. No obstante, la información pública disponible es muy escasa: no se detallan licencia, idiomas, datos de entrenamiento ni resultados de benchmarks del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (deducido del recuento de parámetros; no confirmado en la model card) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | No aplica (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones con imatrix); pesos originales del modelo base presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Agentic-27B-V2 más allá del recuento de parámetros (27,3B), que sugiere un transformer denso de escala similar a familias como Gemma 2 27B o Qwen2.5 32B. La model card del repositorio GGUF no documenta número de capas, dimensión oculta, mecanismo de atención ni tipo de tokenizador.

Tampoco hay datos públicos sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF, DPO u otras técnicas de alineación. La única información técnica concreta es la metodología de cuantización: mradermacher aplica cuantización con matriz de importancia (imatrix) sobre los pesos convertidos desde el formato Hugging Face, lo que mejora la preservación de la calidad en niveles bajos de bits (IQ1-IQ3) respecto a la cuantización uniforme. El repositorio indica `convert_type: hf` y `quantize_version: 2`, parámetros internos de su pipeline de generación.

## Capacidades

- Generación de texto conversacional: el tag `conversational` del repositorio indica uso previsto para diálogo multi-turno.
- Razonamiento agéntico: el nombre del modelo (Agentic) sugiere orientación a tareas de agente, aunque no se documentan detalles sobre tool calling, planificación o multi-step reasoning.
- Ejecución local mediante llama.cpp y derivados (Ollama, LM Studio, KoboldCpp, text-generation-webui) gracias al formato GGUF.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de infraestructura compatible con la API de Hugging Face.
- Capacidades multilingües: no disponible.
- Capacidades de visión, audio o modo thinking: no disponible.

## Casos de uso

- Evaluación local de un modelo de 27B en hardware de consumo: las variantes Q4_K_M (aproximadamente 16-17 GB) permiten probar el modelo en una RTX 4090 o 3090 sin necesidad de infraestructura cloud, útil para comparar su comportamiento frente a alternativas de tamaño similar antes de invertir en despliegue.
- Asistentes conversacionales autoalojados: el tag `conversational` y el tamaño del modelo lo hacen adecuado para chatbots de uso interno desplegados con llama.cpp u Ollama, manteniendo los datos fuera de servicios de terceros.
- Prototipado de flujos agénticos: si el modelo base cumple lo que su nombre sugiere, puede emplearse para experimentar con pipelines de agente (planificación, uso de herramientas) en entornos de desarrollo antes de escalar a modelos mayores.
- Despliegue en equipos con VRAM limitada: las variantes IQ2/IQ3 permiten ejecutar el modelo con offloading parcial a CPU en máquinas con 8-12 GB de VRAM, a costa de menor calidad y velocidad, para tareas de generación de texto no críticas.
- Fine-tuning y experimentación: las cuantizaciones Q5_K_M y Q6_K sirven como referencia de calidad cercana al original para validar si merece la pena adaptar el modelo con LoRA sobre los pesos completos.
- Investigación sobre cuantización: el repositorio ofrece 24 variantes del mismo modelo, lo que permite estudiar empíricamente la degradación de calidad por nivel de bits y el efecto de imatrix en un modelo de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según cuantización):
  - Q6_K: ~22-23 GB.
  - Q5_K_M: ~19-20 GB.
  - Q4_K_M: ~16-17 GB.
  - Q3_K_M: ~13-14 GB.
  - IQ2_M: ~9-10 GB.
  - IQ1_S: ~6-7 GB.
- GPU recomendadas: A100 40GB, H100, L40S o RTX A6000 para las variantes de 5-6 bits con contexto completo; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M y Q5_K_M.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 con cuantizaciones de 4-5 bits; en GPUs de 12-16 GB (RTX 4070 Ti Super, RTX 4080) con Q3_K_M o IQ3; en GPUs de 8 GB solo con IQ1/IQ2 y offloading parcial a CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp, text-generation-webui, llama-cpp-python; para servidores, llama.cpp con servidor OpenAI-compatible o vLLM solo si se dispone de los pesos originales en safetensors (vLLM no carga GGUF de forma nativa en todas sus versiones).
- Latencia y throughput: no disponibles; dependerán de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Agentic-27B-V2-i1-GGUF | 27,3B | no disponible | no disponible | GGUF (24 cuantizaciones) | Modelo base de OpenCSG; datos de entrenamiento no públicos |
| Gemma 2 27B (Google) | 27B | 8K | Gemma License | safetensors, GGUF | Referencia de tamaño similar; benchmarks públicos extensos |
| Qwen2.5 32B (Alibaba) | 32,5B | 128K | Apache 2.0 | safetensors, GGUF | Algo mayor; contexto largo y licencia permisiva |
| Mistral Small 24B (Mistral AI) | 24B | 32K | Apache 2.0 | safetensors, GGUF | Alternativa europea con licencia abierta |

La comparación es aproximada: no hay datos de rendimiento del modelo base que permitan situarlo frente a estas alternativas. La ventaja principal de esta publicación es la amplitud de cuantizaciones disponibles; la desventaja, la falta de documentación sobre licencia y capacidades.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Antes de cualquier despliegue en producción, es imprescindible consultar la licencia del modelo base en https://huggingface.co/opencsg/Agentic-27B-V2.
- Idiomas no documentados: no hay garantía de calidad en castellano ni en otros idiomas distintos del inglés.
- Sin benchmarks: no hay evidencia pública de rendimiento en MMLU, HumanEval, GSM8K ni tareas agénticas; el nombre del modelo no constituye una validación.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin datos de alineación (RLHF/DPO) documentados, no se puede estimar su magnitud.
- Degradación por cuantización: las variantes IQ1/IQ2 pueden producir salidas notablemente peores que el modelo original, especialmente en razonamiento y código; no se recomiendan para producción.
- Contexto desconocido: sin especificación de ventana de contexto, no se debe asumir soporte para conversaciones largas o documentos extensos.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; conviene verificar la integridad de los archivos GGUF antes de usarlos.
- Fecha de creación futura (2026-11-18): metadato anómalo que sugiere posible error de publicación o repositorio de prueba; tratar con cautela.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Agentic-27B-V2-i1-GGUF
- Modelo base: https://huggingface.co/opencsg/Agentic-27B-V2
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- llama.cpp (motor de inferencia GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
