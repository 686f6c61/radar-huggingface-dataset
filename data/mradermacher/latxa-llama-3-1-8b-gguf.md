# mradermacher/Latxa-Llama-3.1-8B-GGUF

## Resumen

Latxa-Llama-3.1-8B-GGUF es la distribucion en formato GGUF del modelo Latxa-Llama-3.1-8B, desarrollado originalmente por el centro HiTZ (Universidad del Pais Vasco) y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 8.030.261.312 parametros derivado de Llama 3.1 8B, adaptado especificamente para euskera e ingles mediante entrenamiento continuado sobre el corpus HiTZ/latxa-corpus-v1.1. El repositorio que nos ocupa no contiene los pesos originales en safetensors, sino una coleccion de cuantizaciones estaticas en GGUF pensadas para inferencia local eficiente.

La relevancia de esta ficha radica en que cubre una necesidad poco atendida: modelos de calidad para euskera, un idioma de bajos recursos con escasa representacion en los grandes modelos fundacionales. Al estar disponible en GGUF, el modelo puede ejecutarse en hardware de consumo mediante llama.cpp, Ollama o interfaces compatibles, lo que democratiza el acceso a un modelo afinado para una lengua minoritaria.

El modelo conserva la arquitectura transformer decoder-only de Llama 3.1 8B, con una ventana de contexto nominal de 128.000 tokens en el modelo base, aunque la model card de esta distribucion no detalla explicitamente el contexto efectivo tras el afinamiento. La licencia es "other", remitiendo a la licencia del modelo base de HiTZ, lo que exige revisar los terminos antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1 8B) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card de esta distribucion (el modelo base Llama 3.1 soporta 128.000 tokens) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | eu (euskera), en (ingles) |
| Licencia | other (ver LICENSE del modelo base HiTZ) |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B: un transformer decoder-only con atencion por cabezas agrupadas (GQA), normalizacion RMSNorm y activaciones SwiGLU, entrenado originalmente por Meta sobre billones de tokens. Sobre esa base, HiTZ aplico un entrenamiento continuado (continued pretraining) utilizando el corpus HiTZ/latxa-corpus-v1.1, un dataset en euskera disenado para adaptar el modelo a esa lengua. La model card de esta distribucion no especifica el numero exacto de tokens de euskera empleados ni si hubo fases de RLHF o DPO; esos detalles deben consultarse en la ficha del modelo base HiTZ/Latxa-Llama-3.1-8B.

La contribucion de mradermacher es exclusivamente de cuantizacion: genera versiones GGUF estaticas a partir de los pesos en safetensors del modelo base, sin reentrenamiento. El autor indica que las cuantizaciones ponderadas/imatrix estan disponibles en un repositorio separado (Latxa-Llama-3.1-8B-i1-GGUF), que suelen ofrecer mejor calidad que las estaticas de tamano equivalente. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal en esta distribucion.

## Capacidades

- Generacion de texto en euskera e ingles, con especial enfasis en la calidad del euskera gracias al entrenamiento continuado sobre corpus especifico.
- Razonamiento y comprension lectora heredados del modelo base Llama 3.1 8B.
- Generacion de codigo y matematicas, aunque no es el foco del afinamiento y su rendimiento en euskera en estas tareas no esta documentado.
- Capacidad multilingue limitada a los idiomas declarados (eu, en); el resto de idiomas de Llama 3.1 no estan garantizados tras el entrenamiento continuado.
- Soporte de tool calling y function calling: no confirmado en esta distribucion; depende de las capacidades conservadas del modelo base y de la plantilla de chat empleada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para esta version.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Atencion al cliente en euskera: el modelo puede gestionar conversaciones multi-turno en euskera con calidad superior a la de Llama 3.1 sin afinar, adecuado para administraciones publicas y empresas del Pais Vasco que necesitan asistencia automatizada en lengua propia.
- Traduccion y redaccion institucional: generacion y revision de textos administrativos, notas de prensa y documentacion oficial en euskera, aprovechando el corpus de entrenamiento especifico.
- Procesamiento de documentacion local: resumen y extraccion de informacion de textos en euskera (normativas, actas, articulos) desplegando el modelo en local con llama.cpp para preservar la confidencialidad de los datos.
- Educacion y aprendizaje de euskera: generacion de ejercicios, correccion de textos y explicaciones gramaticales para plataformas de euskaldunizacion.
- Prototipado en hardware de consumo: con cuantizaciones Q4_K_M (5,0 GB) o Q5_K_M (5,8 GB) el modelo cabe en GPUs de 8-12 GB de VRAM, lo que permite experimentar sin infraestructura de servidor.
- Investigacion en lenguas de bajos recursos: base para estudios de evaluacion de modelos en euskera y para experimentos de afinamiento posterior (fine-tuning) sobre tareas especificas.
- Despliegue en entornos sin conectividad: al ser GGUF, puede ejecutarse offline en estaciones de trabajo, util en entornos rurales o con requisitos de soberania del dato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta distribucion no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K ni benchmarks especificos de euskera como EusExams o LatxaEval). Para datos de rendimiento del modelo base debe consultarse la ficha de HiTZ/Latxa-Llama-3.1-8B.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (tamano del fichero GGUF): Q2_K 3,3 GB; Q3_K_S 3,8 GB; Q3_K_M 4,1 GB; Q3_K_L 4,4 GB; IQ4_XS 4,6 GB; Q4_K_S 4,8 GB; Q4_K_M 5,0 GB; Q5_K_S 5,7 GB; Q5_K_M 5,8 GB; Q6_K 6,7 GB; Q8_0 8,6 GB; f16 16,2 GB. A estos valores hay que sumar el overhead de contexto y del runtime (tipicamente 1-2 GB adicionales).
- GPU recomendadas: para Q4_K_M o Q5_K_M basta una RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070; para Q8_0 se recomienda RTX 4080/4090 (16-24 GB); para f16 se necesita una A100 40 GB, H100 o similar.
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones Q4-Q6 con GPUs de 8-16 GB de VRAM; las versiones Q2-Q3 pueden ejecutarse incluso en GPUs de 6-8 GB o en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. El repositorio declara compatibilidad con endpoints (tag "endpoints_compatible").
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Latxa-Llama-3.1-8B-GGUF (este) | 8,03 B | no disponible (base 128k) | eu, en | other | GGUF |
| HiTZ/Latxa-Llama-3.1-8B (base) | 8,03 B | 128k (segun Llama 3.1) | eu, en | other | safetensors |
| Llama 3.1 8B Instruct | 8,03 B | 128k | multilingue (incluye eu de forma limitada) | Llama 3.1 Community License | safetensors, GGUF |
| Latxa-Llama-3.1-8B-Instruct | 8,03 B | 128k (segun Llama 3.1) | eu, en | other | safetensors |

La comparativa directa con alternativas afinadas para euskera de otros desarrolladores no esta disponible en la informacion proporcionada. Frente a Llama 3.1 8B, la diferencia principal es el entrenamiento continuado sobre corpus en euskera, que should mejorar la calidad en ese idioma a costa de posible degradacion en otros. Frente a la version Instruct de Latxa, esta distribucion GGUF corresponde al modelo base (no instruido), por lo que su comportamiento en tareas conversacionales dependera de la plantilla y del prompting aplicado.

## Limitaciones y advertencias

- Sesgos conocidos: hereda los sesgos de Llama 3.1 8B, potencialmente amplificados o modulados por el corpus de euskera; no se documenta una evaluacion de sesgos especifica.
- Riesgo de alucinacion: presente como en cualquier LLM de 8B; el entrenamiento continuado sobre un corpus mas pequeno puede incrementar el riesgo en dominios especializados.
- Limitaciones de contexto e idioma: el contexto efectivo tras el afinamiento no esta documentado; el modelo esta disenado para euskera e ingles, y su rendimiento en otros idiomas puede degradarse respecto a Llama 3.1 original.
- Restricciones de licencia: la licencia es "other" y remite a la LICENSE del modelo base HiTZ; es imprescindible revisar los terminos de Llama 3.1 Community License y las condiciones adicionales de HiTZ antes de cualquier uso comercial.
- Caveat de produccion: esta distribucion contiene solo cuantizaciones estaticas; para mayor calidad con el mismo tamano se recomienda evaluar las versiones imatrix del repositorio i1-GGUF. Ademas, al ser el modelo base (no Instruct), no debe esperarse un comportamiento conversacional alineado sin prompting adecuado.
- El repositorio tiene un tamano de 71,8 GB y muy pocas descargas (158) y likes (0) en el momento de la consulta, lo que sugiere una validacion comunitaria limitada.

## Enlaces

- Repositorio Hugging Face de esta distribucion: https://huggingface.co/mradermacher/Latxa-Llama-3.1-8B-GGUF
- Modelo base: https://huggingface.co/HiTZ/Latxa-Llama-3.1-8B
- Version Instruct del modelo base: https://huggingface.co/HiTZ/Latxa-Llama-3.1-8B-Instruct
- Licencia del modelo base: https://huggingface.co/HiTZ/Latxa-Llama-3.1-8B-Instruct/blob/main/LICENSE
- Cuantizaciones imatrix (i1-GGUF): https://huggingface.co/mradermacher/Latxa-Llama-3.1-8B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Latxa-Llama-3.1-8B-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/HiTZ/latxa-corpus-v1.1
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
