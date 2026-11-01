# fbaldassarri/meta-llama_Llama-3.1-8B-Instruct-auto_round-int4-gs64-asym

## Resumen

Este repositorio contiene una version cuantizada a 4 bits de `meta-llama/Llama-3.1-8B-Instruct`, el modelo instructivo de 8.000 millones de parametros publicado por Meta en julio de 2024. La cuantizacion la ha realizado el usuario `fbaldassarri` mediante Intel AutoRound v0.16.0, aplicando cuantizacion weights-only (WoQ) con el algoritmo SignRound, 4 bits, tamano de grupo 64 y esquema asimetrico. El objetivo es reducir el peso en memoria y acelerar la inferencia entre 2 y 3 veces respecto al modelo original en bfloat16, con una perdida de precision descrita por el autor como "ligera" en la configuracion W4G64.

El modelo base es un transformer decoder-only denso con atencion por grupos (GQA), entrenado por Meta sobre 15 billones de tokens y afinado con datos instructivos y tecnicas de alineamiento. Soporta una ventana de contexto de 128.000 tokens y ocho idiomas oficiales: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes. Esta version cuantizada conserva la plantilla de chat y el comportamiento conversacional del original.

La relevancia de esta ficha radica en que el artefacto esta pensado explicitamente para despliegue en hardware Intel: CPU, iGPU Arc (via intel-extension-for-pytorch) y NPU AI Boost de la serie Core Ultra (via OpenVINO). Es, por tanto, una alternativa para entornos sin GPU NVIDIA, aunque con un numero de descargas muy bajo (24 en el momento de la consulta) y sin resultados de benchmarks publicados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1), con GQA |
| Parametros totales | 8.030 millones (modelo base); el checkpoint safetensors reporta 2.046.038.016 parametros empaquetados en INT4 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base) |
| Tipos de cuantizacion | INT4 weights-only, group size 64, asimetrica (AutoRound / SignRound) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (formato `auto_round`, compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con 32 capas, atencion por grupos (8 cabezas KV para 32 cabezas de consulta), RoPE y normalizacion RMSNorm. Meta entreno el modelo base sobre aproximadamente 15 billones de tokens con un corte de conocimiento en diciembre de 2023, seguido de un pipeline de ajuste supervisado, rechazo de muestras y optimizacion por preferencias (DPO) para producir la variante Instruct.

Sobre esa base, este artefacto aplica cuantizacion post-entrenamiento con Intel AutoRound 0.16.0. El proceso de calibracion se ejecuto en CPU con `torch.bfloat16`, 128 muestras de calibracion, 200 iteraciones de tuning, longitud de secuencia 512 y tamano de lote 4, con una duracion total registrada de 40.364,5 segundos (unas 11,2 horas). El resultado es un checkpoint INT4 asimetrico con grupo de 64 que, segun el autor, ofrece entre 2 y 3 veces mas velocidad y menor consumo de memoria que el modelo en bfloat16, a costa de una degradacion de precision calificada como ligera. No se documentan innovaciones adicionales como decodificacion especulativa ni atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno mediante la plantilla de chat oficial de Llama 3.1.
- Razonamiento, respuesta a preguntas y resumen de documentos largos gracias a la ventana de 128.000 tokens del modelo base.
- Generacion de codigo y asistencia en tareas de programacion (capacidad heredada del modelo Instruct original).
- Matematicas y resolucion de problemas de varios pasos.
- Soporte de tool calling y function calling, segun las capacidades documentadas por Meta para Llama 3.1 Instruct.
- Capacidades multilingues en los ocho idiomas declarados: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- No incluye vision, audio ni modo de razonamiento explicito (thinking mode); son capacidades ausentes en Llama 3.1 8B.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con historial extenso aprovechando los 128.000 tokens de contexto, y su naturaleza instructiva permite definir tono y politicas mediante system prompt.
- Despliegue en equipos sin GPU dedicada: al estar cuantizado para CPU Intel, iGPU Arc y NPU de Core Ultra via OpenVINO, es adecuado para portatiles y estaciones de trabajo con hardware Intel donde no hay NVIDIA disponible.
- Asistente de codigo en IDE: la variante Instruct soporta generacion y explicacion de codigo, y el menor peso en memoria permite ejecutarlo en local junto al entorno de desarrollo.
- Procesamiento de documentos largos: contratos, informes o articulos de hasta decenas de miles de tokens pueden resumirse o consultarse en una sola pasada sin troceado agresivo.
- Clasificacion y extraccion de informacion estructurada: con tool calling se puede integrar en pipelines que conviertan texto libre en JSON validado para bases de datos o CRM.
- Prototipado e investigacion: al ser un artefacto de cuantizacion reproducible (receta incluida con AutoRound), sirve para estudiar el impacto de W4G64 asimetrico en la calidad frente al modelo en bfloat16.
- Soporte multilingue en mercados europeos: cubre espanol, frances, aleman, italiano y portugues, lo que permite una unica implementacion para varios mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo indica una aceleracion de 2 a 3 veces y una "ligera" caida de precision en W4G64, sin cifras concretas de MMLU, HumanEval, GSM8K ni de perplejidad comparada con el modelo base.

## Requisitos de hardware

- Peso del repositorio: 8,0 GB, coherente con pesos INT4 empaquetados y metadatos.
- VRAM/RAM estimada para inferencia: en torno a 5-6 GB para los pesos INT4 mas overhead de activaciones y cache KV; con contexto de 128.000 tokens la cache KV crece de forma significativa y puede requerir decenas de GB adicionales.
- Hardware objetivo declarado por el autor: CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel AI Boost de la serie Core Ultra (via OpenVINO).
- GPU NVIDIA: no es el objetivo del artefacto, pero al ser safetensors compatible con transformers puede cargarse en GPU con `device_map="auto"`; una RTX 4090 (24 GB) o superior admite el modelo con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para contextos cortos; para contextos largos se necesita mas memoria por la cache KV.
- Opciones de despliegue: transformers (soporte nativo del formato `auto_round`), intel-extension-for-pytorch, OpenVINO. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles; el autor solo afirma una mejora de 2-3 veces frente a bfloat16 en su hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Este artefacto (Llama 3.1 8B Instruct INT4 AutoRound) | 8B | 128k | INT4 W4G64 asimetrica | Llama 3.1 Community | Optimizado para CPU/iGPU/NPU Intel |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128k | bfloat16 | Llama 3.1 Community | Referencia de calidad; mayor peso en memoria |
| Mistral 7B Instruct | 7B | 32k | bfloat16 / GGUF | Apache 2.0 | Licencia mas permisiva, contexto menor |
| Qwen2.5 7B Instruct | 7B | 128k | bfloat16 / GGUF / AWQ | Apache 2.0 | Multilingue amplio, licencia permisiva |

La comparacion de rendimiento cuantitativo no esta disponible al no haberse publicado benchmarks de este artefacto.

## Limitaciones y advertencias

- Perdida de precision por cuantizacion: el propio autor reconoce una caida de exactitud en W4G64; no se cuantifica, por lo que conviene validar en la tarea concreta antes de produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 8B; el modelo puede inventar hechos, citas o APIs, especialmente en contextos largos.
- Sesgos: no se documenta ninguna evaluacion de sesgo en esta ficha; el modelo base hereda los sesgos de los datos de entrenamiento de Meta.
- Idiomas: aunque se declaran ocho idiomas, el rendimiento fuera del ingles es desigual y no hay evaluaciones publicadas para esta cuantizacion.
- Contexto largo: la ventana de 128k es teorica; la calidad decae en el extremo superior y la cache KV encarece mucho el despliegue.
- Licencia: Llama 3.1 Community License impone restricciones (entre ellas, la clausula de 700 millones de usuarios mensuales para licencia comercial automatica y obligaciones de atribucion); revisar antes de uso comercial.
- Madurez del artefacto: 24 descargas y 0 likes en el momento de la consulta; sin mantenedor institucional detras, lo que implica bajo soporte y poca validacion comunitaria.
- Compatibilidad: el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el ecosistema de despliegue es mas limitado que el de otras cuantizaciones populares.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.1-8B-Instruct-auto_round-int4-gs64-asym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Framework Intel AutoRound: https://github.com/intel/auto-round
- Pipeline de cuantizacion citado por el autor: https://git.epicdynamic.com/auto-round-pipeline
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
