# mradermacher/Gemma-4-12B-Aether-GGUF

## Resumen

Gemma-4-12B-Aether-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo Gemma-4-12B-Aether, publicado por el usuario mradermacher. El modelo base, alojado en el repositorio emkey1/Gemma-4-12B-Aether, es una variante afinada del modelo Gemma de Google con aproximadamente 11.900 millones de parametros (11.907.350.576 exactamente, segun los pesos en safetensors). Este repositorio no aporta pesos nuevos: su valor esta en ofrecer versiones comprimidas listas para inferencia en CPU y GPU de consumo mediante llama.cpp y herramientas compatibles.

La relevancia de esta ficha radica en que las cuantizaciones GGUF permiten ejecutar un modelo de casi 12.000 millones de parametros en hardware modesto, algo imposible con los pesos originales en precision completa. El repositorio ocupa 34,6 GB en total e incluye un abanico amplio de niveles de cuantizacion, desde Q2_K hasta Q8_0, ademas de una version F16, lo que cubre desde escenarios con memoria muy limitada hasta casos donde prima la fidelidad numerica.

No obstante, la informacion publicada es muy escasa: no se detalla la licencia, los idiomas soportados, la longitud de contexto ni los datos de entrenamiento del modelo base. Esta ficha refleja esa limitacion de forma explicita y evita inferir datos no confirmados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Gemma; detalles no publicados en la informacion disponible) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

El repositorio es una conversion a GGUF del modelo emkey1/Gemma-4-12B-Aether, un fine-tune sobre la familia Gemma de Google con 11.900 millones de parametros. La model card del repositorio de cuantizacion no incluye informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica especifica del fine-tune.

Lo unico verificable es el proceso de cuantizacion: los metadatos indican `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, lo que confirma una conversion desde pesos en formato Hugging Face (safetensors) a GGUF mediante la herramienta de cuantizacion de llama.cpp. Se ofrecen tanto cuantizaciones K-quant clasicas como una variante IQ4_XS (importancia-based), orientada a preservar calidad con menor huella de memoria.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio sugiere un ajuste orientado a dialogo, aunque no se detalla el formato de plantilla de chat.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a traves de infraestructura de inferencia estandar.
- Inferencia local en CPU y GPU: al estar en formato GGUF, es compatible con llama.cpp y derivados, lo que permite ejecucion fuera de la nube.
- Capacidades especificas de razonamiento, codigo, matematicas, vision o tool calling: no disponible en la informacion proporcionada.
- Soporte multilingue: no disponible.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo sin GPU dedicada: con la cuantizacion Q4_K_M (aproximadamente 7 GB), el modelo puede ejecutarse en CPU mediante llama.cpp, ideal para prototipos y pruebas offline.
- Asistentes conversacionales autoalojados: la orientacion conversacional del fine-tune permite montar un chatbot interno con llama-server o Ollama, manteniendo los datos en infraestructura propia.
- Evaluacion de fine-tunes de la familia Gemma: investigadores que quieran comparar variantes afinadas pueden usar estas cuantizaciones para iterar rapidamente sin descargar pesos completos.
- Integracion en aplicaciones de escritorio: herramientas como LM Studio o Ollama permiten cargar el GGUF directamente y exponer una API compatible con OpenAI para integrarla en apps locales.
- Filtrado y clasificacion de texto por lotes: con Q8_0 (mayor fidelidad) y ejecucion en GPU de consumo, se pueden procesar volumenes moderados de documentos para tareas de etiquetado o resumen.
- Base para experimentacion con tecnicas de cuantizacion: la disponibilidad de doce niveles distintos permite medir el impacto de la compresion en la calidad de salida sobre un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (aproximada, calculada a partir de los 11,9 mil millones de parametros):
  - Q2_K: en torno a 4,5-5 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: en torno a 5,5-6,5 GB
  - IQ4_XS: en torno a 6,5 GB
  - Q4_K_S / Q4_K_M: en torno a 7-7,5 GB
  - Q5_K_S / Q5_K_M: en torno a 8-8,5 GB
  - Q6_K: en torno a 9,5-10 GB
  - Q8_0: en torno a 12,5-13 GB
  - F16: en torno a 24 GB
- GPU recomendadas: RTX 3060 12 GB o superior para Q4/Q5; RTX 4090 (24 GB) para Q8_0 con comodidad; A100 o H100 para F16 y despliegues concurrentes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas usando Q4_K_M o inferiores; en 12 GB con Q5_K_M; en 16 GB con Q6_K.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-Aether-GGUF (este) | 11,9 B | no disponible | no disponible | GGUF | Fine-tune de Gemma con 12 niveles de cuantizacion |
| Gemma 2 9B (Google) | 9 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF | Referencia oficial de la familia, ampliamente documentada |
| Mistral 7B Instruct | 7,2 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa open source con licencia permisiva |
| Qwen2.5 14B Instruct | 14,7 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Mayor tamano y contexto, buena cobertura multilingue |

La comparacion es aproximada: no se dispone de datos de rendimiento del modelo Aether que permitan situarlo frente a estas alternativas. La principal ventaja del repositorio es la variedad de cuantizaciones; la desventaja, la ausencia de documentacion sobre licencia, contexto e idiomas.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido. Es imprescindible consultar el repositorio base emkey1/Gemma-4-12B-Aether y, en ultima instancia, los terminos de la familia Gemma de Google.
- Ausencia de datos de evaluacion: sin benchmarks publicados no es posible estimar la calidad real del fine-tune ni compararlo con alternativas.
- Contexto desconocido: al no documentarse la ventana de contexto, no se debe asumir un valor concreto en produccion.
- Idiomas no confirmados: aunque Gemma suele tener cobertura multilingue, no hay confirmacion para este fine-tune.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano; requiere validacion en aplicaciones criticas.
- Sesgos: no documentados; los fine-tunes sin model card detallada suelen heredar sesgos del modelo base y del dataset de ajuste.
- Perdida de calidad por cuantizacion: las variantes Q2_K y Q3_K pueden degradar notablemente la coherencia; se recomienda Q4_K_M o superior para uso serio.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion por terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Gemma-4-12B-Aether-GGUF
- Modelo base: https://huggingface.co/emkey1/Gemma-4-12B-Aether
- llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Documentacion de Gemma (Google): https://ai.google.dev/gemma/docs
