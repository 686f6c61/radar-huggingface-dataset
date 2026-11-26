# mradermacher/Amoeba-2B-i1-GGUF

## Resumen

Amoeba-2B-i1-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo Amoeba-2B, publicada por el usuario mradermacher bajo el prefijo de nomenclatura "i1", que en su convencion habitual identifica cuantizaciones generadas con pesos ponderados e importance matrix (imatrix). El modelo base referenciado es leexamp/Amoeba-2B, un modelo de aproximadamente 2.000 millones de parametros segun su denominacion, aunque el unico dato estructural verificable en el repositorio es el recuento de parametros en safetensors (1.552.110), una cifra anomala que probablemente corresponde a un tensor individual o a un conteo parcial y no al total del modelo.

El interes practico de este repositorio no reside en el modelo en si, sino en la disponibilidad de un abanico muy amplio de niveles de cuantizacion (desde IQ1_S hasta Q6_K, pasando por Q2_K, Q3_K, Q4_K, Q5_K, IQ2, IQ3 e IQ4), lo que permite ejecutar el modelo en hardware muy modesto mediante llama.cpp y derivados. La model card es practicamente inexistente: solo contiene metadatos tecnicos del proceso de cuantizacion y el enlace al modelo original.

La relevancia es limitada y condicionada: al no haber model card sustantiva, licencia declarada, idiomas ni benchmarks, cualquier evaluacion seria debe hacerse contra el repositorio original leexamp/Amoeba-2B. Este repositorio debe tratarse como un artefacto de distribucion de pesos, no como una ficha de modelo completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: leexamp/Amoeba-2B) |
| Parametros totales | 1.552.110 segun safetensors del repo (dato anomalo, probablemente parcial); la denominacion del modelo sugiere ~2B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Amoeba-2B en la informacion proporcionada. El repositorio unicamente documenta el proceso de conversion y cuantizacion: los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma que los pesos se convirtieron desde un checkpoint en formato Hugging Face y posteriormente se cuantizaron a GGUF. El tag `nicoboss` aparece en los metadatos, presumiblemente asociado a la herramienta o al autor del pipeline de cuantizacion.

La lista de cuantizaciones incluye variantes con importance matrix (prefijo IQ y las K-quants generadas con imatrix ponderada), lo que en la practica mejora la perplejidad a igualdad de bits frente a cuantizaciones uniformes. No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento.

## Capacidades

- Generacion de texto: capacidad esperable de un modelo de ~2B, sin confirmacion documental.
- Razonamiento y matematicas: no disponible; no hay benchmarks ni descripcion.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Ejecucion local en CPU y GPU de gama baja: si, gracias al formato GGUF y a la disponibilidad de cuantizaciones de 1 a 6 bits.

## Casos de uso

- Prototipado local en equipos sin GPU dedicada: las variantes IQ1_S, IQ2_XXS y Q2_K permiten cargar el modelo en RAM de sistema y ejecutarlo con llama.cpp en CPU, util para pruebas de concepto y demos offline.
- Despliegue en dispositivos de borde con memoria limitada: las cuantizaciones de 3 y 4 bits (Q3_K_M, Q4_K_M) ofrecen un compromiso razonable entre calidad y huella de memoria para aplicaciones embebidas o mini-PC.
- Generacion de texto asistida en herramientas de escritorio: integracion via Ollama o llama.cpp en asistentes locales de redaccion, resumen o reescritura, siempre que se valide la calidad del modelo base.
- Filtrado y clasificacion de texto a gran escala: un modelo de ~2B cuantizado a Q4_K_M puede procesar volumenes altos de documentos en pipelines batch con coste de inferencia bajo.
- Evaluacion comparativa de cuantizaciones: el repositorio es util para medir la degradacion de perplejidad entre IQ1_S e Q6_K sobre el mismo modelo base, un caso de estudio tipico en ingenieria de despliegue.
- Base para fine-tuning ligero o destilacion: al disponer de pesos en safetensors en el repo original, se puede partir del modelo sin cuantizar para adaptaciones con LoRA y luego recuantizar.
- Servicio de bajo coste en entornos con GPU de 4-8 GB: las variantes Q4_K_S y Q5_K_M caben en GPUs consumer modestas y permiten servir una API interna con vLLM o llama.cpp server.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de perplejidad por cuantizacion en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de ~2B en GGUF: IQ1_S en torno a 0,6-0,8 GB; Q2_K en torno a 1,0-1,2 GB; Q3_K_M en torno a 1,3-1,6 GB; Q4_K_M en torno a 1,5-2,0 GB; Q6_K en torno a 2,2-2,6 GB. Estas cifras son estimaciones por tamano de pesos y no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones de 4 bits; RTX 3050, RTX 4060, GTX 1660 Super o superiores son suficientes. Para Q6_K, se recomienda 6 GB o mas (RTX 2060, RTX 3060).
- Cabe en GPU consumer: si, practicamente en todas las GPU dedicadas modernas e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, text-generation-webui. vLLM y TGI requieren habitualmente pesos sin cuantizar o cuantizacion AWQ/GPTQ, no GGUF.
- Latencia y throughput estimados: no disponibles. En una RTX 4090, un modelo de ~2B en Q4_K_M suele superar varios cientos de tokens por segundo, pero no hay medicion publicada para este repositorio concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Amoeba-2B-i1-GGUF (este) | ~2B (denominacion); 1.552.110 en safetensors del repo | no disponible | no disponible | GGUF (24 variantes) | Cuantizaciones imatrix de leexamp/Amoeba-2B |
| Qwen2.5-1.5B-Instruct-GGUF | 1,5B | 32.768 tokens | Apache 2.0 | GGUF | Alternativa consolidada, con model card completa y benchmarks publicados |
| Llama-3.2-1B-Instruct-GGUF | 1,2B | 131.072 tokens | Llama 3.2 Community License | GGUF | Contexto largo, ecosistema amplio, requiere aceptar licencia |
| Gemma-2-2B-it-GGUF | 2,6B | 8.192 tokens | Gemma Terms of Use | GGUF | Buen rendimiento en tareas de lenguaje, licencia con restricciones de uso |

La comparativa es estructural: no hay datos de rendimiento de Amoeba-2B que permitan una comparacion cuantitativa con estas alternativas.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan capacidades, idiomas, datos de entrenamiento ni limitaciones conocidas.
- Licencia no declarada: no se puede asumir uso comercial permitido. Es imprescindible consultar el repositorio original leexamp/Amoeba-2B antes de cualquier despliegue en produccion.
- El recuento de parametros en safetensors (1.552.110) es incoherente con la denominacion "2B"; probablemente refleja un conteo parcial o un tensor concreto. No debe usarse como cifra de tamano del modelo.
- Riesgo de alucinacion: desconocido pero esperable en modelos de ~2B, especialmente en cuantizaciones de 1 y 2 bits, donde la degradacion de calidad es notable.
- Las cuantizaciones IQ1_S e IQ1_M sacrifican calidad de forma significativa; no son adecuadas para tareas que requieran precision factual o coherencia larga.
- Sin informacion sobre sesgos: no se puede evaluar la equidad ni la seguridad del modelo.
- Sin garantias de soporte ni mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere nula validacion por parte de la comunidad.
- El tag `nicoboss` y los metadatos de cuantizacion no aportan informacion sobre el modelo base; conviene verificar el repositorio leexamp/Amoeba-2B directamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Amoeba-2B-i1-GGUF
- Modelo base referenciado: https://huggingface.co/leexamp/Amoeba-2B
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
