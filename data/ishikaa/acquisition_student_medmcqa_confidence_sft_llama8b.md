# ishikaa/acquisition_student_medmcqa_confidence_sft_llama8b

## Resumen

`ishikaa/acquisition_student_medmcqa_confidence_sft_llama8b` es un modelo de generacion de texto publicado en HuggingFace por el usuario `ishikaa`, obtenido mediante ajuste supervisado (SFT) con la libreria TRL sobre un modelo base de la familia Llama. El recuento exacto de parametros en safetensors (8.030.261.248) coincide con el de Llama 3.1 8B, aunque el autor no declara explicitamente cual es el checkpoint de partida, por lo que se trata de una inferencia razonada y no de un dato confirmado.

El identificador del repositorio sugiere que el ajuste se ha orientado a responder preguntas de tipo test del dominio medico (MedMCQA) y a producir, junto con la respuesta, una estimacion de confianza que permita decidir cuando el modelo debe "adquirir" ayuda externa en lugar de contestar por si mismo. Este tipo de comportamiento es relevante para investigacion sobre calibracion, aprendizaje selectivo y sistemas con derivacion a un humano cuando la incertidumbre supera un umbral.

La model card publicada es la plantilla automatica de HuggingFace, sin ninguna seccion completada: no hay informacion sobre datos de entrenamiento, hiperparametros, licencia, idiomas ni evaluacion. El repositorio tiene cero descargas y cero likes, y no cuenta con resultados de benchmarks publicados. Cualquier uso en produccion exige, por tanto, una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Llama (inferido del tag `llama` y del recuento de parametros; no confirmado por el autor) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF ni AWQ/GPTQ; el repositorio contiene safetensors en precision completa o media, 16.1 GB) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Pipeline | text-generation |
| Tamano del repositorio | 16,1 GB |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

No se dispone de informacion publicada por el autor sobre la arquitectura concreta. Los tags del repositorio (`llama`, `transformers`, `safetensors`) y el recuento de parametros de 8.030.261.248 apuntan a un transformer decoder-only de 8B de la familia Llama 3 / Llama 3.1, entrenado con atencion causal estandar. El tamano del repositorio (16,1 GB) es coherente con pesos almacenados en fp16 o bf16 sin cuantizar.

Respecto al entrenamiento, el tag `sft` y la presencia de `trl` indican un ajuste supervisado con el `SFTTrainer` de TRL, y el tag `conversational` sugiere que el formato de datos es de dialogo con plantilla de chat. El nombre del repositorio menciona `medmcqa` (dataset de preguntas medicas de opcion multiple) y `confidence`, lo que apunta a un objetivo de entrenamiento con senal de confianza explicita, posiblemente orientado a que el modelo aprenda a pedir ayuda o a abstenerse cuando su confianza es baja (comportamiento de "student acquisition"). No se especifican el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, la precision mixta empleada ni el hardware utilizado.

## Capacidades

- Generacion de texto conversacional en formato de chat, segun el tag `conversational`.
- Respuesta a preguntas de opcion multiple del dominio medico, segun el identificador del modelo (MedMCQA).
- Emision de una senal de confianza asociada a la respuesta, presumiblemente como parte del texto generado; el formato exacto no esta documentado.
- Comportamiento de adquisicion selectiva: derivar o solicitar informacion adicional cuando la confianza es baja (inferido del nombre del repositorio, no verificado).
- Compatibilidad con `text-generation-inference` y con los endpoints de HuggingFace (`endpoints_compatible`), lo que permite desplegarlo con ese stack.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible.

## Casos de uso

- Triaje de preguntas medicas de opcion multiple: el modelo puede responder items tipo MedMCQA y devolver una confianza asociada, util para construir un clasificador de dos niveles donde solo las respuestas de alta confianza se aceptan automaticamente.
- Derivacion a revision humana en pipelines clinicos: usando la confianza estimada como criterio de umbral, las respuestas de baja confianza se enrutan a un profesional, lo que reduce el coste de revision sin sacrificar seguridad.
- Investigacion en calibracion y aprendizaje selectivo: sirve como sujeto de experimentos sobre estimacion de incertidumbre, curvas de cobertura-riesgo y aprendizaje activo, comparando su calibracion con la del modelo base.
- Generacion de anotaciones asistidas para dominios medicos: etiquetado preliminar de preguntas o respuestas que despues se validan por expertos, filtrando previamente por umbral de confianza.
- Evaluacion de cuestionarios de formacionmedica (tipo MIR): generacion de explicaciones y respuestas de referencia en un entorno de estudio, siempre con supervision docente y sin uso clinico directo.
- Seleccion de muestras para anotacion en aprendizaje activo: priorizar los items de baja confianza como candidatos a etiquetado humano, aprovechando la senal de incertidumbre como criterio de seleccion.
- Prototipado de asistentes conversacionales de tematica sanitaria: con contexto gestionado por el orquestador, como paso previo a una validacion exhaustiva antes de cualquier despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion completada y el autor no reporta metricas de exactitud en MedMCQA, MMLU, HumanEval ni de calibracion (ECE, curvas de cobertura-riesgo).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16-17 GB de pesos mas overhead de activaciones y cache KV, en torno a 18-20 GB en funcion de la longitud de secuencia.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-11 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-7 GB.
- GPU de datacenter: A100 40/80 GB, H100, L40S o A6000 cubren el modelo sin problemas; una A100 40 GB permite varias replicas en 4 bits.
- GPU de consumo: cabe en una RTX 4090 (24 GB) en fp16 con margen ajustado y en 4-8 bits con comodidad; una RTX 3090 (24 GB) es igualmente viable. En GPUs de 12-16 GB solo es realista en 4 bits y con contextos cortos.
- Opciones de despliegue: `transformers` de forma nativa; `text-generation-inference` y los endpoints de HuggingFace estan declarados como compatibles por los tags del repositorio. vLLM, Ollama o llama.cpp no estan declarados como soportados y requeririan generar pesos GGUF/AWQ por cuenta propia.
- Latencia y throughput: no disponible. No se publican mediciones.

## Comparativa con modelos similares

El modelo base no esta declarado, por lo que la comparacion es orientativa. Los valores de las alternativas proceden de sus respectivas documentaciones publicas y conviene verificarlos antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `ishikaa/acquisition_student_medmcqa_confidence_sft_llama8b` | 8,03 B | no disponible | no disponible | HuggingFace, safetensors | Modelo experimental sin model card ni benchmarks |
| Llama 3.1 8B Instruct | 8,03 B | 128 k | Llama 3.1 Community License | HuggingFace, amplio ecosistema | Base generalista con soporte de tool calling; requiere aceptar la licencia |
| Mistral 7B Instruct | 7,24 B | 32 k | Apache 2.0 | HuggingFace, amplio ecosistema | Licencia permisiva, buen rendimiento generalista |
| Qwen2.5 7B Instruct | 7,62 B | 128 k | Apache 2.0 | HuggingFace, amplio ecosistema | Multilingue y con soporte de tool calling |

## Limitaciones y advertencias

- La model card es la plantilla automatica sin rellenar: no hay documentacion de sesgos, riesgos, datos de entrenamiento ni uso previsto.
- Sin resultados de benchmarks ni evaluacion de calibracion publicados, no hay evidencia verificable de que la senal de confianza este bien calibrada; el uso de un umbral de derivacion exige validacion propia.
- Riesgo de alucinacion no cuantificado, especialmente relevante en dominio medico, donde una respuesta erronea puede tener consecuencias graves.
- La licencia no esta declarada. Si el modelo deriva de Llama 3.1, es probable que herede la Llama 3.1 Community License y sus restricciones, pero esto no puede confirmarse con la informacion disponible. Verificar antes de cualquier uso comercial.
- No se especifican los idiomas soportados; el ajuste sobre MedMCQA (dataset en ingles) sugiere un rendimiento limitado en castellano, aunque no hay confirmacion.
- Longitud de contexto desconocida, lo que impide planificar despliegues con entradas largas.
- El modelo no debe usarse como herramienta de diagnostico ni para decisiones clinicas sobre pacientes; cualquier aplicacion sanitaria requiere validacion clinica, trazabilidad y supervision profesional.
- Repositorio sin descargas ni likes y sin historial de mantenimiento: no hay garantia de soporte, actualizaciones ni correccion de errores.
- No se publican pesos cuantizados, de modo que el despliegue en hardware limitado exige cuantizar por cuenta propia, con la consiguiente posible degradacion del rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ishikaa/acquisition_student_medmcqa_confidence_sft_llama8b
- Referencia citada en la plantilla de la model card (calculo de impacto de carbono), Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact
- Las busquedas web realizadas no devolvieron ningun resultado relacionado con este modelo: los enlaces obtenidos (foros de Reddit, repositorios de jailbreaks, hilos sobre ChatGPT) no guardan relacion con el modelo analizado.
