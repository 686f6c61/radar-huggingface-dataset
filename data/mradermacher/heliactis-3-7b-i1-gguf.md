# mradermacher/Heliactis-3-7B-i1-GGUF

## Resumen
Heliactis-3-7B-i1-GGUF es una coleccion de cuantizaciones GGUF generadas por mradermacher a partir del modelo base ApollonLabs/Heliactis-3-7B. El repositorio no contiene un modelo entrenado desde cero, sino una conversion y cuantizacion (incluyendo variantes con imatrix) del modelo original, orientada a su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles. La nomenclatura "7B" del nombre no coincide con el recuento real de parametros reportado en los safetensors del autor (8.999.178.240), por lo que conviene tratar la etiqueta como comercial y no como cifra exacta.

El modelo base se presenta como conversacional segun los tags del repositorio, pero la informacion disponible no detalla arquitectura, datos de entrenamiento ni resultados de evaluacion. El valor practico de este repositorio reside en la variedad de niveles de cuantizacion (desde IQ1_S hasta Q6_K), lo que permite ajustar el equilibrio entre calidad y consumo de memoria en funcion del hardware disponible.

La relevancia es limitada y muy especifica: sirve a quienes quieran ejecutar Heliactis-3-7B en local con llama.cpp u Ollama sin tener que cuantizar el modelo por su cuenta. No obstante, la ausencia de licencia declarada, de idiomas soportados y de benchmarks hace imprescindible una validacion propia antes de cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.999.178.240 (segun safetensors del autor) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, small-IQ4_NL |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones de un modelo base en safetensors) |

## Arquitectura y entrenamiento
No se dispone de informacion sobre la arquitectura del modelo base Heliactis-3-7B: la model card del repositorio cuantizado no describe si se trata de un transformer denso, un MoE o una arquitectura hibrida, ni detalla el numero de capas, dimensiones ocultas o mecanismo de atencion. Tampoco se indica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similar.

Lo unico documentado es el proceso de cuantizacion: el autor indica que se trata de cuantizaciones "weighted/imatrix" del modelo ApollonLabs/Heliactis-3-7B, generadas con quantize_version 2 y convert_type hf. El uso de imatrix (matriz de importancia) permite asignar precision de forma no uniforme a los tensores, lo que suele mejorar la calidad de las cuantizaciones de baja bits (IQ1, IQ2, IQ3) frente a una cuantizacion estandar. El repositorio incluye etiquetas internas como "nicoboss", probablemente relativas a la herramienta o configuracion de conversion empleada.

## Capacidades
- Generacion de texto conversacional: el tag "conversational" sugiere un ajuste orientado a dialogo, aunque no se documenta el formato de plantilla de chat.
- Ejecucion local en CPU y GPU mediante llama.cpp y ecosistema GGUF (Ollama, LM Studio, koboldcpp, entre otros).
- Multiples niveles de cuantizacion que permiten desde despliegues en equipos muy modestos (IQ1_S, IQ2_XXS) hasta configuraciones de mayor fidelidad (Q5_K_M, Q6_K).
- Soporte de endpoints compatibles segun el tag "endpoints_compatible" del repositorio, lo que facilita su integracion con APIs de inferencia.
- No se documentan capacidades de tool calling, agentes, vision, audio, modo thinking ni multilingueismo especifico.

## Casos de uso
- Prototipado local de un asistente conversacional: usar la cuantizacion Q4_K_M o Q5_K_M con llama.cpp para levantar un chat en una estacion de trabajo sin GPU dedicada, aprovechando que el formato GGUF esta optimizado para inferencia en CPU.
- Despliegue en portatiles con memoria unificada: las variantes IQ3_XS o IQ4_XS permiten cargar el modelo en equipos con 8-16 GB de RAM, adecuadas para pruebas de concepto y demos internas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece mas de veinte variantes del mismo modelo, lo que permite medir empiricamente la degradacion de calidad entre IQ1_S y Q6_K sobre un conjunto de prompts propio.
- Integracion en pipelines de generacion de texto por lotes: con un servidor llama.cpp o un endpoint compatible se puede procesar documentacion, resumir correos o clasificar texto en entornos donde no se permite enviar datos a la nube.
- Experimentacion academica con modelos cuantizados: util para estudiar el impacto de imatrix y de las cuantizaciones de muy baja precision en tareas de razonamiento y generacion.
- Base para ajuste fino ligero (LoRA/QLoRA) sobre el modelo original: aunque este repositorio es solo de inferencia, sirve para identificar el nivel de cuantizacion que mantiene calidad aceptable antes de invertir en el modelo completo en precision superior.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM/RAM estimada: al tratarse de un modelo de aproximadamente 9.000 millones de parametros, el peso en disco y memoria varia segun la cuantizacion; las variantes IQ1_S e IQ2_XXS rondan los 2-3 GB, las Q4_K_M en torno a 5-6 GB y las Q6_K cerca de 7-8 GB (estimaciones orientativas basadas en el tamano de parametros, no confirmadas por el autor).
- GPU recomendadas: para las cuantizaciones Q4_K_M o superiores, una RTX 3060 de 12 GB, RTX 4070, RTX 4090 o GPUs de datacenter como A100 y H100 permiten cargar el modelo completo en VRAM. Las variantes IQ2/IQ3 pueden ejecutarse en GPUs de 6-8 GB.
- Cabe en GPU de consumo: si, en practicamente todas las cuantizaciones; las de baja bits (IQ1, IQ2) incluso en tarjetas de 4-6 GB, con la consiguiente perdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y servidores compatibles con la API de llama.cpp. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan el modelo original en safetensors.
- Latencia y throughput: no disponibles; dependen en gran medida del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Heliactis-3-7B-i1-GGUF | ~9.000 M (segun safetensors) | no disponible | no disponible | GGUF | Cuantizaciones imatrix de un modelo base poco documentado |
| Mistral-7B-Instruct (GGUF) | ~7.200 M | 32.768 tokens | Apache 2.0 | GGUF | Referencia consolidada en el segmento 7B, ampliamente evaluada |
| Llama-3.1-8B-Instruct (GGUF) | ~8.000 M | 131.072 tokens | Llama 3.1 Community License | GGUF | Contexto largo, buen rendimiento en codigo y razonamiento |
| Qwen2.5-7B-Instruct (GGUF) | ~7.600 M | 32.768 tokens | Apache 2.0 | GGUF | Multilingue, solido en matematicas y codigo |

La comparativa se ofrece como referencia de categoria; no se dispone de datos de rendimiento de Heliactis-3-7B que permitan una comparacion cuantitativa directa.

## Limitaciones y advertencias
- Licencia no declarada: no se especifica si el uso comercial esta permitido; es imprescindible consultar el repositorio del modelo base (ApollonLabs/Heliactis-3-7B) antes de cualquier despliegue en produccion.
- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, razonamiento, codigo o matematicas.
- Idiomas no documentados: se desconoce el grado de soporte del castellano y de otras lenguas.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente la ventana real.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado en este caso; mayor en las cuantizaciones de muy baja bits (IQ1_S, IQ2_XXS).
- Degradacion por cuantizacion: las variantes por debajo de Q4 pierden fidelidad de forma perceptible; conviene validar la variante elegida con un conjunto de evaluacion propio.
- Modelo base poco conocido: la falta de documentacion sobre entrenamiento y datos dificulta evaluar sesgos y riesgos.
- Repositorio con cero descargas y creado recientemente: sin validacion de la comunidad, conviene auditar los archivos antes de usarlos.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/mradermacher/Heliactis-3-7B-i1-GGUF
- Modelo base: https://huggingface.co/ApollonLabs/Heliactis-3-7B
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
