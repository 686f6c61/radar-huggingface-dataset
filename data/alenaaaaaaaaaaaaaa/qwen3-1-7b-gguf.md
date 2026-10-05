# alenaaaaaaaaaaaaaa/Qwen3-1.7B-GGUF

## Resumen

Este repositorio contiene una conversion a formato GGUF del modelo Qwen3-1.7B, publicada por el usuario alenaaaaaaaaaaaaaa. No se trata de un modelo nuevo ni de un ajuste fino: es una cuantizacion del checkpoint oficial de Alibaba (Qwen/Qwen3-1.7B), pensada para su ejecucion en llama.cpp y en los multiples runners compatibles con GGUF (Ollama, LM Studio, Jan, text-generation-webui, entre otros). El modelo base es un transformer decoder-only denso de aproximadamente 2.030 millones de parametros, sin mezcla de expertos, con licencia Apache 2.0.

Qwen3-1.7B forma parte de la familia Qwen3, publicada por el equipo Qwen de Alibaba en 2025. Su rasgo mas caracteristico es el modo de razonamiento hibrido: puede alternar entre un modo "thinking" (que genera una cadena de razonamiento antes de responder) y un modo "non-thinking" (respuesta directa), controlable desde la plantilla de chat. El contexto nativo es de 32.768 tokens, ampliable a 131.072 mediante escalado YaRN, y el modelo declara soporte multilingue amplio.

La relevancia de este repositorio en concreto es practica: permite desplegar un modelo de la familia Qwen3 con capacidades de razonamiento y multilingues en hardware de consumo, sin GPU dedicada o con GPUs de gama media. La contrapartida es que se trata de una publicacion con cero descargas y cero likes en el momento de redactar esta ficha, sin documentacion adicional sobre los niveles de cuantizacion incluidos ni validacion de calidad por parte de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (con atencion por consultas agrupadas, GQA) |
| Parametros totales | 2.031.739.904 (2,03 mil millones) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens nativo; ampliable a 131.072 con YaRN (dato del modelo base; no confirmado en la ficha del repositorio) |
| Tipos de cuantizacion | Formato GGUF. El autor no detalla los niveles incluidos; el tamano del repositorio (7,5 GB) es compatible con un conjunto de varias cuantizaciones de la familia Q |
| Idiomas soportados | No especificados en la ficha del repositorio; el modelo base declara soporte para mas de 100 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el repositorio declara el modelo base Qwen/Qwen3-1.7B, cuyos pesos originales estan en safetensors) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso. Segun la configuracion publica de Qwen3-1.7B, emplea 28 capas, un tamano oculto de 2048, 16 cabezas de atencion y 8 cabezas de clave/valor (atencion por consultas agrupadas), con una dimension de cabeza de 128 y un vocabulario de 151.936 tokens. La normalizacion es RMSNorm y las capas de alimentacion hacia delante usan SwiGLU. No emplea mecanismos de estado recurrente (SSM) ni arquitecturas hibridas. Los detalles concretos del proceso de entrenamiento (numero exacto de tokens, composicion del corpus, fases de RLHF/DPO) no se recogen en la informacion proporcionada; el informe tecnico de Qwen3 es la fuente de referencia para esos datos.

La innovacion funcional mas destacable de la familia es el modo de razonamiento conmutable. La plantilla de chat permite desactivar la generacion de la cadena de pensamiento, lo que reduce la latencia y el consumo de tokens en tareas sencillas, o activarla para tareas de matematicas y codigo. El modelo base tambien admite extrapolacion de contexto mediante YaRN, configurable en los parametros del tokenizador y del RoPE. En este repositorio, la innovacion es exclusivamente de empaquetado: la conversion a GGUF habilita cuantizacion con bloques k-quant y ejecucion en CPU o GPU con llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat compatible con el formato ChatML de Qwen.
- Razonamiento explicito en modo "thinking", con la cadena de pensamiento delimitada por etiquetas propias del modelo.
- Modo "non-thinking" para respuestas directas de baja latencia.
- Generacion de codigo y resolucion de problemas matematicos de complejidad media, dentro de las limitaciones de un modelo de 2.000 millones de parametros.
- Soporte multilingue amplio en el modelo base (el repositorio no detalla la lista concreta).
- Soporte de tool calling y function calling: el modelo base declara capacidades de llamada a herramientas, aunque su fiabilidad en un modelo de este tamano es limitada.
- Capacidades de agente y razonamiento multi-paso: teoricamente posibles mediante el modo thinking, pero no validadas en esta cuantizacion concreta.
- No dispone de vision, audio ni otras modalidades: es un modelo exclusivamente de texto.

## Casos de uso

- Prototipado local sin GPU: la cuantizacion GGUF permite ejecutar el modelo en un portatil con CPU y 8-16 GB de RAM mediante llama.cpp u Ollama, util para validar prompts y plantillas antes de escalar a un modelo mayor.
- Asistente de codigo en el editor: integrado en extensiones que consumen un endpoint compatible con OpenAI, el modelo puede completar funciones, explicar fragmentos y generar pruebas unitarias en un equipo de desarrollo sin enviar codigo a servicios externos.
- Clasificacion y extraccion de informacion en pipelines de datos: con 32.768 tokens de contexto se pueden procesar documentos largos (contratos, informes, articulos) para extraer entidades o campos estructurados en formato JSON.
- Generacion de resumenes multilingues: el soporte de mas de 100 idiomas del modelo base lo hace apto para resumir documentacion tecnica en varios idiomas dentro de un mismo flujo de trabajo.
- Chatbot de atencion al cliente de bajo coste: permite gestionar conversaciones multi-turno con historial largo en hardware modesto, con el modo non-thinking activado para minimizar la latencia.
- Agente de automatizacion de tareas con tool calling: puede invocar funciones sencillas (consultas a APIs, operaciones sobre ficheros) en flujos de automatizacion internos donde la precision no sea critica y se puedan validar los resultados.
- Generacion de datos sinteticos y aumento de datasets: util para producir ejemplos de entrenamiento o de evaluacion en dominios concretos, siempre con revision humana posterior.
- Educacion y experimentacion en investigacion: por su tamano reducido y licencia permisiva, sirve como banco de pruebas para estudiar decodificacion especulativa, cuantizacion o tecnicas de prompting sobre modelos de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La ficha del repositorio no incluye ninguna tabla de evaluacion, y al tratarse de una cuantizacion de terceros sin validacion, no es posible atribuirle los resultados del modelo original. Para valores de referencia (MMLU, GSM8K, HumanEval, AIME y similares) hay que consultar la model card y el informe tecnico de Qwen/Qwen3-1.7B. Cabe esperar una degradacion adicional respecto al checkpoint original en los niveles de cuantizacion mas agresivos, pero no se dispone de mediciones en este repositorio.

## Requisitos de hardware

Los siguientes valores son estimaciones calculadas a partir de la configuracion publica del modelo base (28 capas, 8 cabezas KV, dimension de cabeza 128), no datos medidos sobre esta cuantizacion concreta.

- Pesos en memoria (solo modelo, sin cache):
  - F16: aproximadamente 4,1 GB.
  - Q8_0: aproximadamente 2,2 GB.
  - Q5_K_M: aproximadamente 1,4 GB.
  - Q4_K_M: aproximadamente 1,2 GB.
- Cache KV (calculo estandar en FP16, 112 KiB por token): aproximadamente 448 MiB con 4.096 tokens de contexto, 1,75 GiB con 16.384 y 3,5 GiB con 32.768.
- VRAM total orientativa: Q4_K_M con 8.192 tokens de contexto ronda los 2 GB, por lo que cabe comodamente en una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o incluso en GPUs de 6-8 GB con contexto reducido.
- GPU recomendadas para uso profesional: A100 40 GB, H100, L40S o RTX 4090. En todos los casos el modelo ocupa una fraccion minima de la memoria disponible; el cuello de botella sera el numero de peticiones concurrentes, no los pesos.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 6 GB o mas de VRAM, y tambien en CPU con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, Jan, KoboldCpp y text-generation-webui. vLLM y TGI cuentan con soporte GGUF experimental o parcial, por lo que para produccion de alta concurrencia puede ser preferible convertir a safetensors.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este repositorio. Como referencia cualitativa, un modelo denso de 2.000 millones de parametros en Q4 genera decenas de tokens por segundo en GPUs de consumo y un rango de un digito a bajas decenas en CPU moderna, pero son ordenes de magnitud orientativos y dependen del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto nativo | Licencia | Formato y disponibilidad |
|---|---|---|---|---|
| Qwen3-1.7B (este repositorio, GGUF) | 2,03 mil millones | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | GGUF; safetensors en el repositorio oficial |
| Qwen3-1.7B (oficial) | 2,03 mil millones | 32.768 tokens (131.072 con YaRN) | Apache 2.0 | safetensors, GGUF oficial |
| Llama 3.2 1B Instruct | 1,24 mil millones | 131.072 tokens | Licencia comunitaria de Llama 3.2 | safetensors, GGUF comunitario |
| Gemma 3 1B | aproximadamente 1 mil millones | 32.768 tokens | Terminos de uso de Gemma | safetensors, GGUF comunitario |
| SmolLM2-1.7B-Instruct | 1,7 mil millones | 8.192 tokens | Apache 2.0 | safetensors, GGUF comunitario |

La diferencia principal frente a Llama 3.2 1B y SmolLM2 radica en el modo de razonamiento conmutable y en un contexto nativo mayor que el de SmolLM2, junto con una licencia Apache 2.0 sin las restricciones adicionales de la licencia de Llama. Frente a Gemma 3 1B, el contexto nativo es equivalente, pero la licencia de Qwen3 es mas permisiva para uso comercial. No se dispone de comparativas de rendimiento medidas sobre esta cuantizacion concreta.

## Limitaciones y advertencias

- Herencia de sesgos: al ser una derivacion del modelo base, conserva los sesgos presentes en el corpus de entrenamiento de Qwen3, que no esta documentado en la informacion disponible.
- Riesgo de alucinacion: elevado en un modelo de 2.000 millones de parametros, especialmente en tareas que requieren conocimiento factual especifico, calculos largos o citas de fuentes. No debe usarse sin verificacion en contextos donde un error tenga consecuencias.
- Razonamiento limitado: el modo thinking mejora el rendimiento en tareas logicas, pero un modelo de este tamano sigue cometiendo errores en problemas de varios pasos, matematicas avanzadas y depuracion de codigo complejo.
- Fiabilidad del tool calling: aunque el modelo base declara soporte, en modelos pequenos la tasa de llamadas mal formadas o con argumentos incorrectos es apreciable. Requiere validacion estricta del esquema y reintentos.
- Cuantizacion no validada: no hay informacion sobre que niveles de cuantizacion incluye el repositorio ni sobre la calidad de la conversion. Se desconoce si se aplicaron tecnicas de imatrix o calibracion, y no existe ninguna evaluacion publicada.
- Reputacion del repositorio: cero descargas y cero likes, sin documentacion adicional mas alla de la referencia al modelo original. Conviene verificar el hash de los ficheros antes de usarlos en produccion.
- Idiomas: la lista concreta de idiomas soportados no esta especificada en el repositorio. El rendimiento en idiomas distintos del ingles y del chino suele ser inferior al del ingles en modelos de esta familia.
- Licencia: Apache 2.0 permite uso comercial sin restricciones adicionales, pero el usuario debe conservar los avisos de licencia y no implica ninguna garantia por parte del autor de la cuantizacion ni de Alibaba.
- Limitacion de contexto practica: aunque el modelo base soporta 32.768 tokens, ampliarlo a 131.072 con YaRN exige configuracion manual y degrada la calidad de recuperacion de informacion en el centro del contexto.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/alenaaaaaaaaaaaaaa/Qwen3-1.7B-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3-1.7B
- Informe tecnico de Qwen3: https://arxiv.org/abs/2505.09388
- Blog de anuncio de la familia Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio de llama.cpp (backend de referencia para GGUF): https://github.com/ggml-org/llama.cpp
