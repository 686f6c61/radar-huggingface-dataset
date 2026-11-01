# mradermacher/Rehearsal-Glimmer-30B-r1-GGUF

## Resumen

Rehearsal-Glimmer-30B-r1-GGUF es una coleccion de cuantizaciones estaticas en formato GGUF del modelo base Rehearsal-Glimmer-30B-r1, publicado por el usuario Yesini en HuggingFace. El repositorio lo mantiene mradermacher, un perfil conocido en la comunidad por generar y distribuir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo base tiene 27.854.794.240 parametros reales (segun los tensores en safetensors), lo que lo situa en la categoria de aproximadamente 28 mil millones de parametros, pese a la denominacion comercial "30B".

La relevancia de este repositorio es practica: permite ejecutar un modelo de ~28B en hardware de consumo o en servidores con GPUs de gama media mediante cuantizaciones de 2 a 8 bits, reduciendo el peso desde los ~55 GB en FP16 hasta rangos mucho mas manejables. La informacion publica disponible es muy limitada: no se especifican licencia, idiomas, pipeline ni detalles de arquitectura o entrenamiento, y el modelo base no cuenta con descargas ni likes en el momento de la consulta, lo que sugiere un lanzamiento reciente o de baja difusion.

Se trata, por tanto, de una ficha con datos tecnicos parciales: los parametros y el listado de cuantizaciones estan confirmados, pero las caracteristicas de entrenamiento, contexto, benchmarks y licencia deben tratarse como no disponibles. Cualquier evaluacion en produccion deberia hacerse con cautela y verificando directamente el repositorio del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.854.794.240 (~27,85B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 126,1 GB (conjunto de todas las cuantizaciones) |
| Version de cuantizacion | quantize_version 2, output_tensor_quantised 1, convert_type hf |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura del modelo base Rehearsal-Glimmer-30B-r1. El nombre sugiere un modelo afinado con tecnicas de razonamiento (el sufijo "r1" es habitual en modelos derivados de estilos tipo DeepSeek-R1), pero no hay documentacion que lo confirme. Tampoco se conocen el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron fases de RLHF, DPO o RL con recompensas verificables.

Lo unico verificable es el proceso de cuantizacion: mradermacher ha generado las versiones GGUF a partir del repositorio original en safetensors (convert_type: hf), con cuantizaciones estaticas que cubren desde F16 hasta Q2_K, incluyendo variantes IQ4_XS (importancia-based). No se indica si se ha preservado un tensor mmproj (modulo de vision), lo que apunta a que el modelo es exclusivamente de texto.

## Capacidades

- Generacion de texto conversacional: la etiqueta "conversational" del repositorio indica que el modelo esta orientado a dialogos multi-turno.
- Razonamiento: el sufijo "r1" sugiere capacidades de razonamiento extendido, aunque no esta documentado.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse mediante la infraestructura de Inference Endpoints de HuggingFace.
- Ejecucion local: al estar en GGUF, es compatible con llama.cpp, Ollama, LM Studio y otras herramientas basadas en GGML.
- Tool calling / function calling: no disponible.
- Capacidades de agente y multi-step reasoning: no disponible.
- Capacidades multilingues: no disponible.
- Vision o audio: no disponible (no se incluye modulo mmproj).

## Casos de uso

- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de ~28B en GPUs de consumo con 16-24 GB de VRAM, adecuado para prototipado y experimentacion sin depender de la nube.
- Chat conversacional autoalojado: la orientacion conversacional del modelo base lo hace apto para asistentes internos donde la privacidad de los datos impide usar APIs externas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes, lo que permite medir la degradacion de calidad entre Q2_K y Q8_0 en tareas concretas antes de fijar una version para produccion.
- Integracion en pipelines con llama.cpp: la API compatible de llama.cpp permite incorporar el modelo en scripts de procesamiento por lotes para clasificacion, resumen o extraccion de informacion.
- Servicio de inferencia con Ollama o LM Studio: para equipos que necesitan un endpoint local rapido de configurar sin gestionar dependencias de Python.
- Base para fine-tuning posterior: el modelo original en safetensors puede servir como punto de partida para ajustes especificos de dominio, usando las cuantizaciones solo para inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin overhead de contexto):
  - F16: ~55,7 GB
  - Q8_0: ~29,6 GB
  - Q6_K: ~22,9 GB
  - Q5_K_M: ~19,9 GB
  - Q4_K_M: ~17,1 GB
  - IQ4_XS: ~15,5 GB
  - Q3_K_M: ~13,9 GB
  - Q2_K: ~10,5 GB
- GPUs recomendadas: A100 80 GB o H100 para F16 y Q8_0; RTX 4090 (24 GB) para Q4_K_M, Q5_K_M e IQ4_XS; RTX 4080/4070 Ti Super (16 GB) para Q3_K_M e IQ4_XS con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con Q4_K_M o inferiores, y en GPUs de 16 GB con Q3_K_M o Q2_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, servidores compatibles con GGUF. vLLM y TGI no soportan GGUF de forma nativa generalizada; para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles. Como referencia orientativa, un modelo denso de ~28B en Q4_K_M sobre una RTX 4090 suele generar del orden de 15-25 tokens/s, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de sus caracteristicas de arquitectura, por lo que una comparativa cuantitativa rigurosa no es posible. A modo de referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Rehearsal-Glimmer-30B-r1 | ~27,85B | no disponible | no disponible | GGUF / safetensors |
| Qwen2.5-32B-Instruct | 32,5B | 32.768 tokens | Apache 2.0 | safetensors, GGUF |
| Gemma-2-27B-it | 27B | 8.192 tokens | Gemma Terms | safetensors, GGUF |
| Mistral-Small-24B-Instruct | 23,6B | 32.768 tokens | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a tamano y formato; no hay datos para comparar calidad, contexto ni licencia del modelo objeto de esta ficha.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Verificar el repositorio del modelo base (Yesini/Rehearsal-Glimmer-30B-r1) antes de cualquier despliegue en produccion.
- Sin benchmarks publicados: no hay evidencia de calidad en tareas estandar (MMLU, HumanEval, GSM8K), lo que impide estimar su rendimiento real frente a alternativas consolidadas.
- Riesgo de alucinacion: inherente a los modelos generativos; sin datos de entrenamiento ni evaluaciones de fidelidad, el riesgo no puede acotarse.
- Sesgos desconocidos: al no documentarse la composicion del dataset ni el proceso de alineacion, no es posible evaluar sesgos de genero, idioma o dominio.
- Idiomas no confirmados: se desconoce si el modelo soporta castellano con calidad suficiente; la etiqueta "conversational" no especifica idioma.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan notablemente la coherencia en modelos de este tamano; para uso serio se recomienda Q4_K_M o superior.
- Modelo de baja difusion: cero descargas y cero likes en el momento de la consulta; no hay comunidad que haya validado su comportamiento.
- Sin modulo de vision: no se incluye mmproj, por lo que no admite entrada de imagenes.
- Fecha de creacion futura en los metadatos (2026-11-01): posible error del repositorio; conviene verificar la integridad de los archivos antes de confiar en ellos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Rehearsal-Glimmer-30B-r1-GGUF
- Modelo base: https://huggingface.co/Yesini/Rehearsal-Glimmer-30B-r1
- Perfil del cuantizador: https://huggingface.co/mradermacher
- llama.cpp (motor de inferencia GGUF): https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Papers, blogs o demos adicionales: no disponibles
