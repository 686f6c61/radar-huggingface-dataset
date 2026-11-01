# fbaldassarri/meta-llama_Llama-3.1-8B-Instruct-auto_gptq-int4-gs64-asym

## Resumen

Esta ficha describe una version cuantizada a 4 bits del modelo meta-llama/Llama-3.1-8B-Instruct, publicada por el usuario fbaldassarri en HuggingFace. No se trata de un modelo nuevo, sino de un artefacto de compresion: el mismo transformer decoder-only de Llama 3.1 8B Instruct, pero con sus pesos convertidos a INT4 mediante el algoritmo GPTQ implementado en Intel AutoRound v0.16.0. El objetivo es reducir el peso en memoria y acelerar la inferencia (el autor afirma 2-3x de speedup) con una perdida de precision leve en la configuracion W4G64.

La relevancia practica de esta publicacion es que el autor ha documentado de forma exhaustiva la receta de cuantizacion: version de AutoRound, hiperparametros (group size 64, asimetrico, 128 muestras de calibracion, 200 iteraciones, seqlen 512, batch 4), condiciones de ejecucion y tiempo total (674,7 minutos en CPU). Ademas, el autor indica que la version INT4 esta pensada para inferencia en CPU Intel, iGPU Intel Arc (via intel-extension-for-pytorch) y NPU Intel (AI Boost en Core Ultra) mediante OpenVINO. Es, por tanto, un artefacto orientado a despliegue en hardware Intel, no a GPU de consumo convencional.

Conviene senalar una discrepancia importante: la model card declara el modelo como "inference: false" y la ficha de HuggingFace lista 2.047.283.200 parametros totales en safetensors, un valor muy inferior a los aproximadamente 8.000 millones de parametros del Llama 3.1 8B original. Esta cifra es inconsistente con el modelo base declarado y debe tratarse con cautela; probablemente refleje un recuento parcial o un error en los metadatos del repositorio. El tamano del repo es de 8,0 GB, coherente con pesos INT4 de un modelo de 8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), cuantizado GPTQ INT4 |
| Parametros totales | 2.047.283.200 segun safetensors del repo (inconsistente con el modelo base de ~8B; tratar con cautela) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K, pero la model card no lo confirma para esta cuantizacion) |
| Tipos de cuantizacion | INT4, group size 64, asimetrico (W4G64), formato auto_gptq |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (GPTQ / auto-gptq), cargable con transformers |
| Metodo de cuantizacion | WoQ (weights-only quantization) via Intel AutoRound v0.16.0 con algoritmo AutoGPTQ |
| dtype de carga para calibracion | torch.bfloat16 |
| Muestras de calibracion | 128 |
| Iteraciones de tuning | 200 |
| Longitud de secuencia de calibracion | 512 |
| Batch de calibracion | 4 |
| Dispositivo de calibracion | cpu |
| Duracion de cuantizacion | 40.481,5 s (674,7 min) |
| Versiones registradas | auto-round 0.16.0, transformers 4.55.3, torch 2.14.1+cpu |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atencion causal estandar, sin mezcla de expertos ni mecanismos hibridos. No se ha reentrenado ni ajustado el modelo; el artefacto es exclusivamente una cuantizacion post-entrenamiento de los pesos originales de Meta. Por tanto, las capacidades, sesgos y limitaciones heredadas son las del modelo base, con la degradacion adicional introducida por la cuantizacion INT4.

El proceso de cuantizacion emplea Intel AutoRound, que combina busqueda de escalas y redondeo guiado por firmas de activacion (sign-gradient descent) sobre un conjunto de calibracion. La configuracion concreta es W4G64 asimetrico, con 128 muestras de calibracion de longitud 512 y 200 iteraciones de tuning, ejecutado en CPU con torch 2.14.1+cpu y cargando el modelo en bfloat16. El autor documenta la receta completa de reproduccion mediante el pipeline auto-round-pipeline y el script standalone con AutoRound, lo que permite replicar el artefacto de forma determinista. No se aportan datos sobre el dataset de calibracion mas alla del numero de muestras ni sobre evaluaciones de degradacion de precision mas alla de la afirmacion cualitativa de "slight accuracy drop at W4G64".

## Capacidades

- Generacion de texto conversacional en modo instruct/chat, usando la plantilla de chat integrada del modelo base.
- Razonamiento general, respuesta a preguntas y resumen, heredados de Llama 3.1 8B Instruct.
- Generacion de codigo y matematicas basicas, con la precision propia del modelo base de 8B.
- Soporte multilingue limitado a los ocho idiomas declarados: ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes.
- Capacidad de tool calling y function calling heredada del modelo base (no verificada especificamente en esta cuantizacion).
- Uso en flujos de agente y razonamiento multi-paso, condicionado a la ventana de contexto efectiva del modelo base.
- Inferencia optimizada para CPU Intel, iGPU Intel Arc y NPU Intel (AI Boost) mediante intel-extension-for-pytorch y OpenVINO, segun el autor.
- No incluye vision, audio ni modo thinking explicito.

## Casos de uso

- Despliegue en equipos sin GPU dedicada: al estar cuantizado a INT4 y orientado a CPU Intel, permite ejecutar un modelo de 8B en estaciones de trabajo con Core Ultra, usando intel-extension-for-pytorch para acelerar la inferencia.
- Asistentes conversacionales locales: la plantilla de chat integrada y el formato instruct permiten construir chatbots multi-turno que corren en local sin enviar datos a la nube, util para entornos con requisitos de privacidad.
- Prototipado rapido en portatiles con NPU Intel: el autor indica soporte via OpenVINO para AI Boost en Core Ultra, lo que facilita demos de generacion de texto con bajo consumo energetico.
- Generacion de codigo asistida en IDE: el modelo base de 8B ofrece calidad razonable para autocompletado y explicacion de codigo, y la version INT4 reduce el coste de memoria para integrarlo en herramientas de desarrollo locales.
- Procesamiento por lotes de textos en CPU: tareas de clasificacion, extraccion de entidades o resumen sobre grandes volumenes de documentos pueden ejecutarse en granjas de CPU Intel donde no hay GPU disponible, aprovechando el speedup declarado de 2-3x.
- Educacion e investigacion: al ser un artefacto con receta de cuantizacion completamente documentada, sirve como caso de estudio reproducible para investigar el impacto de W4G64 asimetrico en la calidad de un modelo instruct de 8B.
- Traduccion y atencion al cliente multilingue en mercados europeos: los idiomas declarados cubren espanol, frances, aleman, italiano y portugues, lo que permite desplegar asistentes en varios idiomas con un unico modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo afirma cualitativamente "2-3X speedup (slight accuracy drop at W4G64)" sin cifras concretas de latencia, throughput ni metricas de calidad (MMLU, HumanEval, GSM8K u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con pesos INT4 y group size 64, el peso en memoria ronda los 4-5 GB, aunque el repositorio ocupa 8,0 GB (incluye posiblemente pesos adicionales o metadatos). El autor no publica cifras de VRAM.
- GPU recomendadas: no especificadas. El autor orienta el artefacto a CPU Intel, iGPU Intel Arc e NPU Intel, no a GPU NVIDIA o AMD.
- Cabe en GPU de consumo: previsiblemente si por tamano (un modelo de 8B en INT4 suele caber en GPUs con 8 GB o mas), pero el autor no lo confirma ni valida el rendimiento en ese escenario.
- Opciones de despliegue: transformers con AutoGPTQ, intel-extension-for-pytorch (CPU e iGPU Arc), OpenVINO (NPU AI Boost). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto, aunque la etiqueta text-generation-inference aparece en los tags del repositorio.
- Latencia y throughput estimados: no disponibles. Solo la afirmacion cualitativa de 2-3x de speedup frente al modelo sin cuantizar, sin condiciones de medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fbaldassarri/meta-llama_Llama-3.1-8B-Instruct-auto_gptq-int4-gs64-asym | ~8B (metadatos del repo: 2.047.283.200) | No disponible | INT4 W4G64 asimetrico, auto_gptq | Llama 3.1 Community | HuggingFace, 18 descargas |
| meta-llama/Llama-3.1-8B-Instruct (base) | ~8B | 128K (segun Meta) | Sin cuantizar (BF16/FP16) | Llama 3.1 Community | HuggingFace, ampliamente usado |
| Otras cuantizaciones INT4 de Llama 3.1 8B Instruct (GPTQ/AWQ de terceros) | ~8B | 128K (heredado) | INT4 GPTQ o AWQ, segun autor | Llama 3.1 Community | Multiples repos en HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- La model card declara explicitamente "inference: false", lo que sugiere que el autor no garantiza que el artefacto funcione correctamente con el flujo estandar de transformers sin configuracion adicional.
- Existe una inconsistencia grave en los metadatos: el recuento de parametros en safetensors (2.047.283.200) no cuadra con un modelo de 8B. Verificar el contenido real del repositorio antes de usarlo en produccion.
- Degradacion de precision por cuantizacion: el autor reconoce una "slight accuracy drop" en W4G64, sin cuantificarla. No hay evaluaciones publicadas del impacto en tareas concretas.
- El modelo esta pensado para hardware Intel (CPU, iGPU Arc, NPU). El rendimiento en GPU NVIDIA o AMD no esta validado por el autor.
- Riesgo de alucinacion y sesgos heredados del modelo base Llama 3.1 8B Instruct, no mitigados por la cuantizacion.
- Cobertura linguistica limitada a ocho idiomas; el espanol esta incluido, pero no hay evaluacion especifica de calidad en castellano.
- Restricciones de licencia: Llama 3.1 Community License impone condiciones de uso comercial, obligaciones de atribucion y limites para empresas con mas de 700 millones de usuarios mensuales. Revisar el texto completo antes de un despliegue comercial.
- El autor declara que el modelo se ha desarrollado "only for research purposes" y sin garantia, lo que desaconseja su uso directo en produccion sin validacion propia.
- El repositorio tiene muy poca traccion (18 descargas, 0 likes) y fue creado en una fecha futura respecto a la redaccion habitual de fichas, lo que reduce la confianza en su mantenimiento y soporte.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/fbaldassarri/meta-llama_Llama-3.1-8B-Instruct-auto_gptq-int4-gs64-asym
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://github.com/meta-llama/llama-models/blob/main/models/llama3_1/LICENSE
- Intel AutoRound (framework de cuantizacion): https://github.com/intel/auto-round
- Pipeline de reproduccion citado por el autor: https://git.epicdynamic.com/auto-round-pipeline
