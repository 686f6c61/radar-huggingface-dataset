# mradermacher/EryriLabs-cymraeg-4B-GGUF

## Resumen

EryriLabs-cymraeg-4B-GGUF es la distribucion en formato GGUF del modelo EryriLabs-cymraeg-4B, un ajuste fino (LoRA) orientado a conversacion en gales (cymraeg) e ingles, desarrollado por EryriLabs y cuantizado por mradermacher. El modelo base pertenece a la familia Gemma (etiquetado como "gemma4" en los tags del repositorio) y el checkpoint resultante declara 8.134.102.314 parametros totales segun los tensores safetensors del modelo original. Resuelve el problema de la escasez de modelos conversacionales de calidad para una lengua de bajos recursos como el gales, ofreciendo una alternativa abierta con licencia Apache 2.0.

El repositorio aqui descrito es una conversion a GGUF con cuantizaciones estaticas (Q2_K a Q8_0, incluida IQ4_XS y F16), pensada para inferencia en llama.cpp y entornos compatibles con GGUF. La model card indica explicitamente que no se han generado (por el momento) cuantizaciones ponderadas con imatrix. El modelo original fue afinado sobre un conjunto de datasets especificos del gales: lexicos de Bangor, memorias de traduccion en-cy de Techiaith y la Universidad de Cardiff, transcripciones de Bangor, el dataset alpaca-cy-1 de BangorAI, ademas de MultiNLI y GSM8K.

La relevancia actual radica en que combina un backbone de tamano medio-alto (8.100 millones de parametros) con un ajuste especifico para gales, un idioma con muy poca representacion en los modelos fundacionales genericos. La licencia Apache 2.0 permite uso comercial sin las restricciones de la licencia Gemma original, lo que resulta atractivo para despliegues en produccion en entornos bilingues gales-ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma, tag "gemma4"); ajuste fino LoRA sobre el modelo base |
| Parametros totales | 8.134.102.314 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | Gales (cy), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo es un ajuste fino mediante LoRA sobre EryriLabs/EryriLabs-cymraeg-4B, que a su vez se apoya en una arquitectura transformer decoder-only de la familia Gemma (el tag "gemma4" sugiere una variante de cuarta generacion de dicha familia). El checkpoint final cuenta con 8.134.102.314 parametros, lo que lo situa en la gama de 8.000 millones de parametros, coherente con los modelos Gemma de ese tamano. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases de RLHF o DPO; la model card solo enumera los datasets utilizados.

Los datos de entrenamiento declarados incluyen recursos lexicos y de traduccion del gales (techiaith/lecsicon-cymraeg-bangor, techiaith/cofnodycynulliad_en-cy, techiaith/cardiff-university-tm-en-cy, techiaith/banc-trawsgrifiadau-bangor), un corpus de instrucciones en gales (BangorAI/alpaca-cy-1) y dos datasets genericos de razonamiento y comprension (nyu-mll/multi_nli y openai/gsm8k). Esta combinacion sugiere un entrenamiento orientado a conversacion, traduccion y comprension textual bilingue, con refuerzo de capacidades de razonamiento mediante datos en ingles. No se han documentado innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en gales e ingles, con enfasis en el registro y la terminologia propios del gales.
- Traduccion y adaptacion en-cy y cy-en, apoyada en memorias de traduccion de Techiaith y la Universidad de Cardiff.
- Comprension textual y respuesta a instrucciones, gracias al corpus alpaca-cy-1.
- Razonamiento basico y resolucion de problemas matematicos elementales, por la inclusion de GSM8K en el entrenamiento.
- Inferencia de relaciones semanticas y clasificacion textual, por MultiNLI.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking" explicito: no disponible.

## Casos de uso

- Atencion al cliente bilingue gales-ingles: el modelo puede gestionar conversaciones multi-turno en gales con terminologia administrativa y de servicios publicos, un nicho donde los modelos genericos suelen degradar la calidad linguistica. Su ajuste sobre lexicos de Bangor y memorias de traduccion de Techiaith lo hace adecuado para entornos institucionales galeses.
- Traduccion asistida en-cy en produccion editorial: integrado en un pipeline de traduccion con revision humana, el modelo puede generar borradores en gales a partir de textos ingleses, aprovechando los corpus de memorias de traduccion de Techiaith y Cardiff.
- Generacion de contenido localizado para administraciones y medios galeses: redaccion de comunicados, resumenes y articulos en gales con un registro adecuado, desplegado en local mediante llama.cpp para evitar dependencias de la nube.
- Procesamiento de transcripciones y actas: el modelo puede resumir y estructurar transcripciones en gales (apoyado en el dataset banc-trawsgrifiadau-bangor) para actas de reuniones, subtitulado o indexacion documental.
- Educacion y aprendizaje de idiomas: generacion de ejercicios, correcciones y explicaciones gramaticales en gales para plataformas de e-learning, con la ventaja de una licencia Apache 2.0 que permite uso comercial.
- Investigacion en PLN para lenguas de bajos recursos: como punto de partida para experimentos de ajuste fino adicional, evaluacion de modelos en gales o generacion de datos sinteticos, dado su formato GGUF y su disponibilidad abierta.
- Asistentes de escritorio y moviles offline: las cuantizaciones Q4_K_M (5,1 GB) permiten ejecutar el modelo en portatiles con GPU consumer, habilitando asistentes en gales sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,1 GB para Q4_K_M, 4,3 GB para Q3_K_L, 4,1 GB para Q3_K_M, 3,9 GB para Q3_K_S; la variante F16 requiere del orden de 16 GB.
- GPU recomendadas: para cuantizaciones Q4/Q5, una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB son suficientes; para F16 se recomienda A100 40 GB, H100 o RTX 4090.
- Cabe en GPU consumer: si, en tarjetas con al menos 6-8 GB de VRAM para cuantizaciones Q3/Q4; la variante Q4_K_M es la recomendada por el autor por su equilibrio velocidad/calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base tambien puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| EryriLabs-cymraeg-4B-GGUF | 8.134 M | no disponible | cy, en | Apache 2.0 | GGUF |
| Gemma 2 9B (Google) | 9.000 M aprox. | 8.192 tokens | multilingue | Gemma License | safetensors, GGUF |
| Llama 3.1 8B (Meta) | 8.030 M | 128.000 tokens | multilingue | Llama 3.1 Community | safetensors, GGUF |
| Mistral 7B (Mistral AI) | 7.240 M | 32.000 tokens | multilingue | Apache 2.0 | safetensors, GGUF |

La comparativa es orientativa: los datos de Gemma 2 9B, Llama 3.1 8B y Mistral 7B corresponden a sus fichas publicas, mientras que para el modelo EryriLabs no se dispone de contexto ni benchmarks publicados. La principal diferencia competitiva es el ajuste especifico para gales y la licencia Apache 2.0, frente a las licencias con restricciones de Gemma y Llama.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse sobre corpus institucionales galeses y datasets genericos en ingles, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: no cuantificado; como modelo de 8.000 millones de parametros sin benchmarks publicados, se recomienda validacion humana en usos criticos.
- Limitaciones de contexto: la longitud de contexto no esta documentada, lo que impide garantizar conversaciones o documentos largos.
- Limitaciones de idioma: el soporte se limita a gales e ingles; el rendimiento en otros idiomas no esta garantizado y probablemente sea deficiente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original (Gemma) por si impone condiciones adicionales sobre los pesos derivados.
- Caveat de produccion: el repositorio es una cuantizacion estatica sin imatrix; el autor advierte de que las cuantizaciones ponderadas no estan disponibles, y las Q2/Q3 pueden degradar notablemente la calidad.
- El modelo se creo y actualizo en noviembre de 2026 segun los metadatos, con 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/EryriLabs-cymraeg-4B-GGUF
- Modelo base: https://huggingface.co/EryriLabs/EryriLabs-cymraeg-4B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#EryriLabs-cymraeg-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Discusion sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Dataset lexico de Bangor: https://huggingface.co/datasets/techiaith/lecsicon-cymraeg-bangor
- Memorias de traduccion en-cy (Techiaith): https://huggingface.co/datasets/techiaith/cofnodycynulliad_en-cy
- Memorias de traduccion en-cy (Cardiff): https://huggingface.co/datasets/techiaith/cardiff-university-tm-en-cy
- Transcripciones de Bangor: https://huggingface.co/datasets/techiaith/banc-trawsgrifiadau-bangor
- Corpus de instrucciones alpaca-cy-1: https://huggingface.co/datasets/BangorAI/alpaca-cy-1
- MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- GSM8K: https://huggingface.co/datasets/openai/gsm8k
