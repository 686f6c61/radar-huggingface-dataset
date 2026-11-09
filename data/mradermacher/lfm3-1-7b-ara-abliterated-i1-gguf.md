# mradermacher/LFM3-1.7B-ARA-Abliterated-i1-GGUF

## Resumen

`mradermacher/LFM3-1.7B-ARA-Abliterated-i1-GGUF` es un conjunto de cuantizaciones en formato GGUF del modelo `Austriani/LFM3-1.7B-ARA-Abliterated`, generadas por el usuario mradermacher mediante su pipeline habitual de cuantizacion con pesos ponderados por matriz de importancia (imatrix). El modelo base parte de la familia LFM3 (Liquid Foundation Model 3) de 1.7B parametros de Liquid AI, y ha sido sometido a un proceso de "abliteration", una tecnica de modificacion de pesos orientada a eliminar los mecanismos de rechazo aprendidos por alineamiento. El repositorio solo contiene los ficheros cuantizados en GGUF; no incluye los pesos originales ni informacion sobre el proceso de abliteration.

El proposito de este repositorio es ofrecer variantes ligeras del modelo para inferencia local en CPU o GPU de gama baja mediante llama.cpp y herramientas compatibles. El tamano reducido (1.7B) y el amplio abanico de cuantizaciones publicadas (desde IQ1_S hasta Q6_K) lo hacen adecuado para experimentacion en hardware consumer. No obstante, la model card no documenta la licencia, los idiomas, los datos de entrenamiento ni resultados de evaluacion, por lo que cualquier uso en produccion requiere verificacion independiente de estos extremos.

La relevancia actual del repositorio es limitada y de nicho: interesa a quienes quieran ejecutar un modelo LFM3 de 1.7B cuantizado en local y con los filtros de seguridad modificados, pero no aporta informacion tecnica verificable sobre el modelo base ni sobre el efecto real del proceso de abliteration.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM3 de Liquid AI, 1.7B) |
| Parametros totales | 1.700 millones (modelo base); 899.013 parametros reportados en safetensors del repo, dato inconsistente con el nombre del modelo |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q4_0, Q4_1, Q4_K_S, Q4_K_M, IQ4_XS, IQ4_NL (small), Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones de un modelo base en safetensors) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura del modelo base en la documentacion proporcionada. Por el nombre, se trata de un modelo de la familia LFM3 de Liquid AI con 1.7B parametros, pero la model card del repositorio no detalla si emplea transformer clasico, arquitectura hibrida con capas de estado (SSM) u otra variante propia de Liquid AI. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO.

El unico dato tecnico aportado por la model card son los metadatos del proceso de cuantizacion: `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que indica que las cuantizaciones se generaron a partir de pesos en formato Hugging Face mediante la herramienta de cuantizacion de llama.cpp con soporte de imatrix. Las cuantizaciones se describen como "weighted/imatrix quants", es decir, calculadas con una matriz de importancia derivada de un dataset de calibracion (no especificado). No se detalla el proceso de abliteration aplicado al modelo base `Austriani/LFM3-1.7B-ARA-Abliterated`.

## Capacidades

- Generacion de texto autoregresiva en el modelo base (no verificada en este repositorio).
- Razonamiento y conversacion multi-turno: no confirmado por falta de documentacion.
- Generacion de codigo y matematicas: no confirmado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; el sufijo "ARA" en el nombre podria sugerir arabe, pero no hay confirmacion.
- Modo thinking, vision o audio: no disponible.
- Efecto de la abliteration: se espera una reduccion de los rechazos a peticiones que el modelo alineado rechazaria, pero no hay evaluacion que lo cuantifique.

## Casos de uso

- Experimentacion local con llama.cpp: el modelo puede cargarse en Ollama o llama.cpp para probar el comportamiento de un LFM3 de 1.7B cuantizado en equipos sin GPU dedicada, usando las variantes Q4_K_M o Q5_K_M como punto de partida.
- Investigacion sobre abliteration: comparar las respuestas del modelo base y de esta version cuantizada para estudiar como varia la tasa de rechazo tras modificar los pesos, siempre en entornos controlados y con fines de investigacion.
- Prototipado de chatbots de bajo coste: desplegar un asistente conversacional basico en una Raspberry Pi o en un portatil antiguo usando cuantizaciones IQ2 o Q2, aceptando la perdida de calidad asociada.
- Pruebas de integracion en pipelines GGUF: validar que herramientas como llama-cpp-python, Ollama o text-generation-webui cargan correctamente las variantes publicadas antes de adoptar el modelo base.
- Educacion y demos de cuantizacion: ilustrar el impacto del nivel de cuantizacion en la calidad de salida comparando IQ1_S frente a Q6_K sobre el mismo prompt.
- Evaluacion de riesgos de modelos sin filtros: analizar en un entorno aislado como un modelo abliterado responde a peticiones sensibles, con el objetivo de documentar riesgos antes de plantear su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, ni para el modelo base ni para las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 0,5 y 1,5 GB segun cuantizacion (IQ1_S aproximadamente 0,5 GB; Q6_K en torno a 1,4-1,5 GB), calculado a partir de los 1.7B parametros del modelo base.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM (GTX 1050 Ti, RTX 3050, RTX 4060); tambien funciona en CPU.
- Cabe en GPU consumer: si, con holgura en todas las cuantizaciones publicadas.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, text-generation-webui, LM Studio y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| LFM3-1.7B-ARA-Abliterated-i1-GGUF (este) | 1.7B (base) | no disponible | no disponible | GGUF | Hugging Face |
| LFM3-1.7B (base, Liquid AI) | 1.7B | no disponible | no disponible | safetensors | Hugging Face |
| Qwen2.5-1.5B-Instruct (GGUF) | 1.5B | 32.768 tokens | Apache 2.0 | GGUF | Hugging Face |
| Llama 3.2 1B Instruct (GGUF) | 1.2B | 131.072 tokens | Llama 3.2 Community License | GGUF | Hugging Face |

La comparativa con Qwen2.5-1.5B y Llama 3.2 1B se ofrece como referencia de categoria (modelos pequenos cuantizados para inferencia local), no como equivalencia funcional; no hay datos de rendimiento de este repositorio que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentacion: no se especifican licencia, idiomas, contexto ni datos de entrenamiento, lo que impide evaluar su idoneidad para uso comercial.
- Dato de parametros inconsistente: la ficha de Hugging Face reporta 899.013 parametros en safetensors, cifra incompatible con un modelo de 1.7B; probablemente se refiere a un tensor o metadato parcial, pero no se puede verificar.
- Proceso de abliteration no documentado: se desconoce que capas o direcciones se modificaron y con que metodo, por lo que el efecto real sobre el comportamiento y la coherencia del modelo es incierto.
- Riesgo de alucinacion: inherente a modelos de 1.7B y agravado por la falta de evaluacion publicada.
- Perdida de calidad en cuantizaciones bajas: las variantes IQ1 e IQ2 degradan notablemente la coherencia; solo Q4_K_M en adelante son recomendables para uso practico.
- Sesgos desconocidos: sin model card del modelo base ni evaluacion, no se pueden anticipar sesgos de genero, raza o idioma.
- Uso responsable: un modelo abliterado puede generar contenido que el modelo original rechazaria; su despliegue en produccion requiere filtros externos y revision legal.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de comunidad que haya validado las cuantizaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/LFM3-1.7B-ARA-Abliterated-i1-GGUF
- Modelo base: https://huggingface.co/Austriani/LFM3-1.7B-ARA-Abliterated
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Liquid AI (familia LFM): https://www.liquid.ai/
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
