# DivyaTejaVenkat/trading-llama-3.1-8b-nse

## Resumen

trading-llama-3.1-8b-nse es un ajuste fino (fine-tune) del modelo Llama 3.1 8B Instruct, publicado por el usuario DivyaTejaVenkat en HuggingFace. El modelo parte de la versión cuantizada a 4 bits de Unsloth (`unsloth/meta-llama-3.1-8b-instruct-bnb-4bit`) y se ha entrenado con Unsloth y la librería TRL de HuggingFace, según indica la propia model card. El nombre del repositorio sugiere una especialización en el dominio del trading y, en concreto, del mercado indio (NSE, National Stock Exchange), aunque la model card no documenta ni el dataset ni el procedimiento de entrenamiento.

Se trata de un transformer decoder-only denso de 8.030.261.248 parámetros, con pesos publicados en safetensors y un tamaño de repositorio de 16,1 GB, lo que corresponde a precisión de 16 bits. El pipeline declarado es text-generation y los tags incluyen compatibilidad con text-generation-inference y endpoints, además de `conversational`.

Su relevancia es limitada a día de hoy: el repositorio registra 0 descargas y 0 likes, y no incluye métricas, ejemplos de uso ni detalles del conjunto de datos de ajuste. Es, por tanto, un modelo experimental de autor individual más que una opción consolidada para producción, y debe evaluarse como tal antes de considerarlo para cualquier flujo financiero real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.1), con RoPE, GQA, SwiGLU y RMSNorm |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens según la arquitectura Llama 3.1 del modelo base; no especificado en la model card |
| Tipos de cuantizacion | El modelo base se entrenó desde una versión de 4 bits (bitsandbytes NF4); los pesos publicados ocupan 16,1 GB, compatible con bf16/fp16. No se publican pesos GGUF ni cuantizaciones adicionales |
| Idiomas soportados | inglés (`en`) declarado en la model card; el modelo base Llama 3.1 soporta oficialmente 8 idiomas, pero el ajuste solo declara inglés |
| Licencia | apache-2.0 (declarada por el autor); ver advertencias sobre la licencia del modelo base |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | unsloth/meta-llama-3.1-8b-instruct-bnb-4bit |
| Pipeline | text-generation |
| Fecha de creacion (metadatos) | 2026-09-11 |
| Ultima actualizacion (metadatos) | 2026-09-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Llama 3.1 8B Instruct de Meta: un transformer decoder-only de 32 capas, dimensión oculta 4096, 32 cabezas de atención con 8 cabezas KV (grouped-query attention), vocabulario de 128.256 tokens, normalización RMSNorm pre-normalización, activación SwiGLU y embeddings posicionales rotatorios (RoPE). El ajuste fino no modifica la topología del modelo; solo actualiza los pesos. El contexto teórico heredado es de 128.000 tokens.

El procedimiento de entrenamiento se describe únicamente como un fine-tune realizado con Unsloth y TRL sobre la versión de 4 bits del modelo instruct, con una velocidad de entrenamiento declarada 2x superior a la alternativa estándar. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset, si se aplicó RLHF, DPO o SFT adicional, ni sobre hiperparámetros como la tasa de aprendizaje, el rango de LoRA o el número de épocas. Tampoco se especifica si el ajuste se fusionó (merge) en los pesos finales ni qué fracción del modelo se entrenó. Dado el nombre del repositorio, es plausible que el dataset estuviera relacionado con operaciones bursátiles en el mercado indio, pero esto no está confirmado en ninguna parte de la información disponible.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo Llama 3.1 8B Instruct subyacente.
- Razonamiento de propósito general y seguimiento de instrucciones en formato chat, según el pipeline declarado (`text-generation`, tag `conversational`).
- Presunta especialización en dominio financiero y de trading (mercado NSE indio), inferida únicamente del nombre del repositorio; no verificada ni documentada.
- Compatibilidad declarada con text-generation-inference y con endpoints de HuggingFace, lo que facilita su despliegue como API.
- Capacidades del modelo base como tool calling o function calling: no confirmadas para este ajuste concreto.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Capacidades multilingües: no documentadas; solo se declara inglés.
- Modo "thinking", visión o audio: no disponibles en este modelo (es un modelo de texto).

## Casos de uso

- Evaluación comparativa de fine-tunes financieros: el modelo puede usarse como punto de comparación frente a otros ajustes de Llama 3.1 8B orientados a finanzas, midiendo si el ajuste aporta mejora real sobre el modelo base en tareas de análisis bursátil.
- Prototipado de asistentes de análisis de mercado: dado su contexto de 128.000 tokens, permite introducir informes anuales o transcripciones de resultados y formular preguntas sobre ellos, siempre con validación humana posterior.
- Extracción estructurada de información de documentos financieros: resúmenes de informes trimestrales, comparación de magnitudes entre periodos o identificación de riesgos declarados en textos largos.
- Generación de resúmenes de noticias financieras: se puede integrar en un pipeline que ingiera titulares y artículos y produzca resúmenes breves en inglés.
- Chatbot experimental de educación financiera: con contexto largo y formato conversacional, sirve para entornos de demostración donde el usuario pregunta sobre conceptos de mercado, sin dar recomendaciones de inversión.
- Investigación sobre sobreajuste en dominios verticales: al no publicarse dataset ni métricas, resulta un caso útil para estudiar cómo de fácil es publicar un fine-tune sin validación y qué riesgos conlleva.
- Base para nuevos ajustes con LoRA: sus pesos en safetensors y su licencia apache-2.0 declarada facilitan usarlo como punto de partida para experimentos posteriores en el dominio financiero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, evaluaciones financieras ni ninguna otra. Tampoco se aportan datos de pérdida de validación, comparaciones con el modelo base ni ejemplos cualitativos de generación. Los resultados de búsqueda web realizados no devolvieron ningún contenido relacionado con el modelo (únicamente resultados deportivos sin relación).

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 16 GB solo para los pesos, más entre 2 y 6 GB de caché KV según la longitud de contexto utilizada.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5-6 GB para los pesos, más caché KV.
- GPU recomendadas para fp16: A100 40 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB. En una RTX 4090 (24 GB) cabe con contexto moderado.
- GPU de consumo: cabe en RTX 3090, RTX 4090 (24 GB) en fp16 con contexto limitado, y en GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti Super) aplicando cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag explícito), vLLM, Ollama o llama.cpp previa conversión a GGUF (no se publican pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| trading-llama-3.1-8b-nse | 8,03 B | 128.000 tokens (heredado) | apache-2.0 declarada | HuggingFace, pesos safetensors | Sin benchmarks ni documentación de dataset; 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | HuggingFace, ampliamente desplegado | Modelo base; benchmarks publicados por Meta; ecosistema maduro |
| Qwen2.5-7B-Instruct | 7,6 B aprox. | 128.000 tokens | Apache-2.0 (salvo variantes) | HuggingFace, muy desplegado | Multilingüe, buen rendimiento en código y matemáticas |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.000 tokens | Apache-2.0 | HuggingFace, muy desplegado | Contexto menor; licencia permisiva real |

No se dispone de datos de rendimiento comparativo para el modelo objeto de la ficha, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de documentación: no se especifican dataset, hiperparámetros, número de tokens de entrenamiento ni métricas de evaluación, lo que impide reproducir o validar el ajuste.
- Riesgo elevado de alucinación en el dominio financiero: los modelos de lenguaje no son fiables para datos de mercado, cotizaciones o cifras contables, y este ajuste no aporta ninguna garantía adicional.
- No apto para decisiones de inversión: cualquier uso en trading real, asesoramiento financiero o gestión de riesgos requiere supervisión humana y fuentes de datos verificadas.
- Sesgos: no documentados, pero heredados del modelo base Llama 3.1 y potencialmente amplificados por un dataset de ajuste desconocido y presumiblemente sesgado hacia el mercado indio.
- Limitación idiomática: solo se declara inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Riesgo de sobreajuste: un fine-tune no documentado sobre un corpus pequeño puede degradar capacidades generales del modelo base, algo que no se puede comprobar sin benchmarks.
- Licencia: aunque el autor declara apache-2.0, el modelo base Llama 3.1 está sujeto a la Llama 3.1 Community License de Meta, que impone condiciones adicionales (atribución "Built with Llama", cláusula de 700 millones de usuarios activos mensuales, restricciones de uso). Es necesario verificar la compatibilidad antes de un uso comercial.
- Adopción nula: con 0 descargas y 0 likes, no existe comunidad que haya validado el modelo ni reportado problemas.
- Fecha de creación inusual en los metadatos (2026-09-11), que conviene contrastar antes de citar el modelo.
- Los resultados de búsqueda web no aportaron ninguna fuente independiente sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DivyaTejaVenkat/trading-llama-3.1-8b-nse
- Modelo base (Unsloth, 4 bits): https://huggingface.co/unsloth/meta-llama-3.1-8b-instruct-bnb-4bit
- Repositorio de Unsloth (mencionado en la model card): https://github.com/unslothai/unsloth
- Librería TRL de HuggingFace (mencionada en la model card): https://github.com/huggingface/trl
- Modelo original Llama 3.1 8B Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct

No se encontraron papers, blogs, demos ni repositorios adicionales específicos de este modelo en la búsqueda web realizada.
