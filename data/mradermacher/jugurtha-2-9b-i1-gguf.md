# mradermacher/Jugurtha-2-9B-i1-GGUF

## Resumen

Jugurtha-2-9B-i1-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo agbalu/Jugurtha-2-9B, publicado por el cuantizador mradermacher, conocido por generar versiones optimizadas (imatrix, o "importance matrix") de modelos populares de Hugging Face. El modelo base es un LLM de 9,2 mil millones de parámetros orientado a la generación de texto con instrucciones (instruction-tuned), con un enfoque destacable: el soporte del kabyle (taqbaylit), una lengua bereber (amazigh) de bajos recursos, además de inglés y francés. Se enmarca en la corriente de "sovereign AI" e IA para lenguas minorizadas, un área con muy poca oferta de modelos abiertos.

El modelo base incluye etiquetas de razonamiento (reasoning, thinking), lo que sugiere capacidades de tipo "thinking mode" o razonamiento paso a paso, aunque la model card no detalla su arquitectura ni su proceso de entrenamiento. Este repositorio no contiene los pesos originales en safetensors completos, sino un conjunto amplio de cuantizaciones que van desde IQ1_S hasta Q6_K, pensadas para ejecutar el modelo en hardware modesto mediante llama.cpp, Ollama u otros backends compatibles con GGUF. Su relevancia radica en ser una de las pocas opciones cuantizadas para trabajar con el kabyle en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer causal, causal-lm según etiquetas) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix) |
| Idiomas soportados | kabyle (kab), inglés (en), francés (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones imatrix); el modelo base está en safetensors |

## Arquitectura y entrenamiento

La model card de este repositorio no describe la arquitectura interna del modelo base. Por las etiquetas (causal-lm, transformers, text-generation) se trata de un modelo de lenguaje autorregresivo tipo transformer. Con 9,2 mil millones de parámetros y etiquetas de reasoning y thinking, es plausible que se derive de una arquitectura de ~9B existente adaptada al kabyle mediante continued pretraining y ajuste por instrucciones, pero la model card no lo confirma: estos detalles no están disponibles.

Tampoco se ha publicado información sobre el corpus de entrenamiento, el número de tokens, ni el uso de técnicas como RLHF o DPO. Lo que sí documenta el repositorio es el proceso de cuantización: mradermacher emplea cuantizaciones "imatrix" (importance matrix), que calculan la importancia de cada peso usando un conjunto de calibración para reducir la pérdida de calidad en cuantizaciones agresivas (Q2/IQ3). Existen además cuantizaciones estáticas en un repositorio hermano.

## Capacidades

- Generación de texto conversacional con instrucciones (instruction-tuned, etiqueta conversational).
- Razonamiento paso a paso: las etiquetas reasoning y thinking del modelo base indican soporte de modos de razonamiento explícito, aunque sin documentación detallada.
- Soporte del kabyle (taqbaylit/bereber/amazigh), capacidad muy poco habitual en modelos abiertos, junto con inglés y francés.
- La model card menciona "This is a vision model", sugiriendo capacidades multimodales (los ficheros mmproj, si existen, están en el repositorio estático), aunque no se documenta el detalle.
- Compatible con el ecosistema GGUF: llama.cpp, Ollama, LM Studio, etc.
- No hay información sobre tool calling o function calling en la documentación disponible.

## Casos de uso

- Asistentes conversacionales en kabyle: el modelo permite construir chatbots de atención al usuario o agentes de diálogo en una lengua bereber para la que casi no existen LLM abiertos, sirviendo a comunidades de Argelia (Cabilia) y la diáspora.
- Preservación y revitalización lingüística: generación de material educativo, corrección de textos o herramientas de escritura en kabyle para asociaciones culturales y proyectos de documentación amazigh.
- Traducción y asistencia bilingüe kabyle-francés: dada la cooficialidad de facto del francés en Argelia, el modelo puede asistir en redacción y comprensión entre ambas lenguas en contextos administrativos o periodísticos.
- Investigación en PLN de lenguas de bajos recursos: base compacta (9B) y cuantizable hasta ~4 GB para experimentos académicos sobre lenguas amazigh, evaluación de alucinaciones cross-lingüísticas o destilación.
- Despliegue en hardware modesto: con cuantizaciones IQ3/IQ4 de 4,5-5,9 GB, se puede servir el modelo en portátiles y PCs sin GPU dedicada, útil en ONG o entornos con infraestructura limitada.
- Prototipado de agentes con razonamiento en contexto local: si el modo thinking está operativo, se puede usar para tareas de razonamiento multi-paso offline en aplicaciones de privacidad estricta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantización no incluye evaluaciones, y el modelo base tampoco aporta métricas en la información proporcionada.

## Requisitos de hardware

- VRAM / memoria estimada según cuantización (tamaños de fichero GGUF, a los que hay que sumar el KV cache del contexto):
  - i1-Q2_K: ~4,0 GB
  - i1-IQ3_M / i1-Q3_K_M: ~4,6-4,8 GB
  - i1-Q4_K_M (recomendada): ~5,9 GB
  - i1-Q5_K_M: ~6,7 GB
  - i1-Q6_K: ~7,7 GB
- GPUs recomendadas: cualquier GPU con 6-8 GB de VRAM (RTX 3060, RTX 4060 Ti) ejecuta cómodamente las cuantizaciones Q4/Q5; para Q6_K conviene una RTX 4070/4080 o 12 GB de VRAM. También funciona por CPU puro o híbrido CPU+GPU.
- Cabe sin problemas en GPUs de consumo: un modelo de ~5,9 GB en Q4_K_M corre en portátiles con GPU media o incluso solo con RAM del sistema (se recomiendan 16 GB).
- Despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp; también servibles con backends compatibles con GGUF. No está orientado a vLLM o TGI en este formato.
- Latencia y throughput: no disponible; en CPU moderno con AVX2 cabe esperar velocidades de decodificación de varios tokens/s en cuantizaciones Q4, y decenas de tokens/s con GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas destacados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jugurtha-2-9B (base) | 9,2B | no disponible | kab, en, fr | Apache 2.0 | safetensors + GGUF |
| Gemma 2 9B | 9B | 8K | multilingüe (110+) | Gemma license (restricciones) | safetensors + GGUF |
| Qwen2.5 7B Instruct | 7,6B | 128K | multilingüe (29+) | Apache 2.0 / Qwen | safetensors + GGUF |
| Llama 3.1 8B Instruct | 8B | 128K | multilingüe (8 oficiales) | Llama Community License | safetensors + GGUF |

La diferenciación clave de Jugurtha-2-9B es el soporte del kabyle, ausente en los modelos generales anteriores; a cambio, no hay datos públicos de rendimiento que permitan compararlo en benchmarks estándar, y su longitud de contexto no está documentada.

## Limitaciones y advertencias

- No hay benchmarks publicados: la calidad real en kabyle, francés e inglés no puede verificarse con datos objetivos; conviene evaluarlo internamente antes de uso en producción.
- Riesgo de alucinación elevado en kabyle: en lenguas de bajos recursos los LLM tienden a mezclar idiomas o generar formas gramaticalmente incorrectas; no hay estudios que cuantifiquen este problema para este modelo.
- Longitud de contexto no documentada: no se puede planificar el uso en tareas de documentos largos sin pruebas previas.
- La mención de capacidades de visión no está detallada; los ficheros mmproj, si existen, están en el repositorio estático y su funcionamiento no está documentado.
- Licencia Apache 2.0 en el repositorio de cuantización, sin restricciones comerciales conocidas; no obstante, la licencia efectiva del modelo base debería verificarse en agbalu/Jugurtha-2-9B.
- Las cuantizaciones por debajo de Q4 (Q2_K, IQ3) degradan apreciablemente la calidad, especialmente en idiomas minoritarios con tokenizaciones menos eficientes; se recomienda Q4_K_M o superior.
- Las etiquetas de razonamiento/thinking no vienen acompañadas de instrucciones de uso del modo thinking; el formato de prompt correcto es desconocido desde esta documentación.

## Enlaces

- Repositorio de cuantizaciones imatrix: https://huggingface.co/mradermacher/Jugurtha-2-9B-i1-GGUF
- Repositorio de cuantizaciones estáticas: https://huggingface.co/mradermacher/Jugurtha-2-9B-GGUF
- Modelo base: https://huggingface.co/agbalu/Jugurtha-2-9B
- Página de descarga resumida: https://hf.tst.eu/model#Jugurtha-2-9B-i1-GGUF
- FAQ y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa de mradermacher: https://www.nethype.de/
