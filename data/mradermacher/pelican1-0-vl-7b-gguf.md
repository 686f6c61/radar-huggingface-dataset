# mradermacher/Pelican1.0-VL-7B-GGUF

## Resumen

Pelican1.0-VL-7B es un modelo multimodal de 7.615.616.512 parametros (aproximadamente 7,6 mil millones) desarrollado por X-Humanoid y orientado a robótica y "Physical AI" (inteligencia artificial encarnada). El repositorio analizado, mradermacher/Pelican1.0-VL-7B-GGUF, es una cuantizacion estatica del modelo original en formato GGUF, publicada por el usuario mradermacher el 13 de noviembre de 2025, lo que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo se presenta como un sistema vision-lenguaje (VL) con pipeline declarado de robótica, lo que sugiere su uso en tareas de percepcion visual y razonamiento orientadas a agentes embodied. La informacion publica disponible es limitada: la model card del repositorio GGUF es una plantilla generica de cuantizacion y no incluye detalles sobre arquitectura interna, datos de entrenamiento, contexto maximo ni benchmarks. La ficha original del modelo base (X-Humanoid/Pelican1.0-VL-7B) no se ha incluido en la informacion proporcionada.

La relevancia actual del repositorio radica en que ofrece el modelo en cuantizaciones que van desde Q2_K (3,1 GB) hasta f16 (15,3 GB), ademas de los ficheros mmproj necesarios para el procesamiento multimodal, lo que facilita su despliegue local en entornos de investigacion en robótica sin depender de infraestructura en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal vision-lenguaje; detalles internos no publicados en la informacion disponible) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base se distribuye presumiblemente en safetensors, aunque no se confirma en la informacion disponible |

## Arquitectura y entrenamiento

No se han publicado en la informacion disponible detalles sobre la arquitectura interna del modelo (tipo de transformer, mecanismo de atencion, encoder visual, etc.). Los tags del repositorio indican que se trata de un modelo multimodal ("multimodal-learning") orientado a robótica y embodied AI, con pipeline declarado "robotics". El tamano de parametros (7,6 mil millones) es consistente con un modelo vision-lenguaje de escala media, pero se desconoce la composicion exacta del encoder de vision y del decoder de lenguaje.

Tampoco hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La unica innovacion tecnica documentada en el repositorio es la propia cuantizacion: mradermacher ha generado cuantizaciones estaticas (no imatrix) con la version 2 del formato de cuantizacion y conversion de tipo "hf", e indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (Pelican1.0-VL-7B-i1-GGUF). Los ficheros mmproj (multi-modal projection) en Q8_0 y f16 son necesarios para habilitar la entrada de imagenes en llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles (tag "conversational").
- Procesamiento multimodal vision-lenguaje: el repositorio incluye ficheros mmproj, lo que confirma soporte de entrada de imagenes.
- Orientacion a robótica y agentes embodied (tags "robotics", "Physical AI", "embodied-ai").
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere integracion con infraestructura de inferencia tipo Hugging Face Endpoints.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes multi-step: no confirmado explicitamente, aunque la orientacion a embodied AI sugiere razonamiento secuencial; no disponible como dato verificado.
- Capacidades multilingues: solo ingles declarado.
- Modo thinking, vision, audio u otras capacidades especiales: vision confirmada por los ficheros mmproj; audio y thinking no disponibles.

## Casos de uso

- Investigacion en robótica encarnada: el modelo puede integrarse en pipelines de percepcion visual para interpretar escenas captadas por camaras de robots y generar descripciones o decisiones de alto nivel, gracias a su naturaleza vision-lenguaje y su orientacion declarada a embodied AI.
- Prototipado de agentes fisicos en laboratorio: con cuantizaciones Q4_K_M (4,8 GB) se puede desplegar en una estacion de trabajo con GPU de consumo para experimentar con bucles percepcion-accion sin necesidad de clúster.
- Descripcion de imagenes y respuesta visual a preguntas (VQA): el modelo acepta imagenes mediante los ficheros mmproj y puede responder preguntas sobre el contenido visual, util para anotacion semiautomatica de datasets de robotica.
- Asistencia conversacional tecnica en ingles: con tag "conversational", puede emplearse en interfaces de chat para soporte a operadores de sistemas roboticos, manteniendo conversaciones multi-turno (longitud de contexto no disponible).
- Despliegue en entornos con recursos limitados: las cuantizaciones Q2_K (3,1 GB) y Q3_K_S (3,6 GB) permiten ejecucion en CPU o GPUs con poca VRAM mediante llama.cpp, adecuado para pruebas de concepto y demos en campo.
- Integracion en pipelines de CI/CD para validacion de modelos: al estar en formato GGUF y ser compatible con llama.cpp, se puede automatizar la evaluacion de respuestas del modelo ante imagenes de prueba en cada iteracion del desarrollo de un agente robotico.
- Educacion e investigacion academica: la licencia Apache 2.0 y la disponibilidad de cuantizaciones ligeras facilitan su uso en cursos y proyectos de fin de master sobre IA encarnada sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,1 GB
  - Q3_K_S: ~3,6 GB
  - Q3_K_M: ~3,9 GB
  - Q3_K_L: ~4,2 GB
  - IQ4_XS: ~4,4 GB
  - Q4_K_S: ~4,6 GB
  - Q4_K_M: ~4,8 GB
  - Q5_K_S: ~5,4 GB
  - Q5_K_M: ~5,5 GB
  - Q6_K: ~6,4 GB
  - Q8_0: ~8,2 GB
  - f16: ~15,3 GB
  - Adicionalmente, el fichero mmproj anade ~1,0 GB (Q8_0) o ~1,5 GB (f16) para el procesamiento multimodal.
- GPU recomendadas: no disponibles de forma especifica en la informacion proporcionada. Por tamano, una RTX 3060 de 12 GB o superior puede alojar cuantizaciones Q4_K_M con mmproj; una RTX 4090 (24 GB) permite Q8_0 o f16 con holgura; A100/H100 no son necesarias para este tamano, salvo para despliegues de alta concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM para cuantizaciones Q4 y superiores; las cuantizaciones Q2/Q3 caben en GPUs de 4-6 GB o incluso en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (si se importa el GGUF), y presumiblemente cualquier runtime compatible con GGUF; vLLM y TGI no soportan GGUF de forma nativa, por lo que requeririan el modelo base en safetensors (no confirmado en la informacion disponible).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la informacion proporcionada. La comparativa se limita a aspectos estructurales verificables:

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Pelican1.0-VL-7B (este) | 7,6 B | no disponible | Apache 2.0 | GGUF (cuantizado) | Vision-lenguaje, orientado a robotica |
| Alternativas de 7B vision-lenguaje | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de modelos comparables |

No disponible para una comparativa cuantitativa con benchmarks.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al ser un modelo entrenado predominantemente en ingles, es probable que presente sesgos culturales y linguisticos propios de los datos de entrenamiento, pero no se confirma.
- Riesgo de alucinacion: inherente a los modelos generativos; no se han publicado evaluaciones de fidelidad para este modelo.
- Limitaciones de contexto o idioma: solo se declara soporte de ingles; la longitud de contexto no esta publicada, lo que impide garantizar conversaciones largas o procesamiento de documentos extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; sin embargo, el repositorio es una cuantizacion de terceros (mradermacher) y se debe verificar la licencia del modelo base original (X-Humanoid/Pelican1.0-VL-7B), que en la informacion disponible figura como apache-2.0.
- Caveat para produccion: la model card del repositorio GGUF es una plantilla generica de cuantizacion y no documenta el comportamiento del modelo; se recomienda validar el rendimiento en el caso de uso concreto antes de desplegarlo. Ademas, las cuantizaciones Q2_K y Q3_K_M estan marcadas como de menor calidad por el propio autor.
- El modelo esta orientado a investigacion en robotica; no se han publicado garantias de seguridad para su uso en sistemas fisicos reales.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Pelican1.0-VL-7B-GGUF
- Modelo base: https://huggingface.co/X-Humanoid/Pelican1.0-VL-7B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Pelican1.0-VL-7B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Pelican1.0-VL-7B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Empresa del autor de la cuantizacion: https://www.nethype.de/
