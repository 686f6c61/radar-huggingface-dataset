# mradermacher/kestrel-explainer-4b-GGUF

## Resumen

Kestrel Explainer 4B es un modelo de lenguaje conversacional de 4.022 millones de parametros (4B) desarrollado originalmente por udomain y distribuido en formato GGUF por mradermacher, un conocido cuantizador de la comunidad de Hugging Face. La version aqui documentada es una recuantizacion estatica del modelo base `udomain/kestrel-explainer-4b`, publicada bajo licencia Apache 2.0 y orientada a su despliegue local mediante llama.cpp y herramientas compatibles con GGUF.

El modelo esta especializado en el ambito de privacidad, cumplimiento normativo y guardrails, con etiquetas que hacen referencia explicita a la legislacion de Hong Kong (PDPO, Cap. 486, PCPD). Su proposito declarado es actuar como "explainer", es decir, explicar conceptos regulatorios y de proteccion de datos, ademas de servir como modelo de barrera (guardrail) en pipelines de cumplimiento. Soporta ingles y chino, lo que encaja con el contexto regulatorio bilingue de Hong Kong.

La relevancia actual de esta ficha reside en que ofrece una via practica para ejecutar un modelo especializado en compliance en hardware de consumo, gracias a las cuantizaciones que van desde 1,8 GB (Q2_K) hasta 8,2 GB (f16). No obstante, la informacion publica disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es muy limitada, por lo que muchos campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base tipo transformer, inferido por el formato; no confirmado) |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `udomain/kestrel-explainer-4b`. Por el numero de parametros (4B) y el pipeline de transformers, se trata presumiblemente de un transformer decoder-only, pero el autor no publica en la model card disponible el tipo exacto de atencion, el numero de capas ni la dimension oculta. Tampoco se especifica si emplea tecnicas como decodificacion especulativa, atencion lineal o arquitecturas hibridas.

Respecto al entrenamiento, la model card original no detalla el volumen de tokens, la composicion del dataset ni si se aplicaron fases de RLHF, DPO o PDPO (aunque la etiqueta "pdpo" sugiere el uso de alguna variante de optimizacion de preferencias). Las etiquetas del modelo apuntan a un entrenamiento orientado a dominios regulatorios de Hong Kong (PDPO, Cap. 486, PCPD) y a funciones de guardrail y cumplimiento, pero no se aportan cifras verificables. La cuantizacion aqui documentada es estatica (quantize_version 2, output_tensor_quantised 1), sin variantes ponderadas/imatrix publicadas por el autor en el momento de la ficha.

## Capacidades

- Generacion de texto conversacional en ingles y chino.
- Explicacion de conceptos regulatorios y de proteccion de datos, con enfasis en el marco legal de Hong Kong (PDPO, Cap. 486, PCPD).
- Funcion de guardrail: cribado y filtrado de contenido en pipelines de cumplimiento.
- Soporte de conversaciones multiturno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Explicacion de normativa de proteccion de datos: el modelo puede responder consultas sobre la PDPO y el Cap. 486 en ingles y chino, sirviendo como asistente interno para equipos legales y de cumplimiento.
- Guardrail en pipelines de atencion al cliente: integrado como filtro previo o posterior a un LLM principal, clasifica y bloquea respuestas que puedan violar politicas de privacidad.
- Formacion interna en compliance: genera material explicativo y respuestas de autoevaluacion para empleados sobre obligaciones regulatorias en Hong Kong.
- Revision de politicas de privacidad: ayuda a redactar y contrastar clausulas de avisos de privacidad frente a los requisitos del PCPD.
- Despliegue local con llama.cpp u Ollama: al disponer de cuantizaciones de 1,8 a 4,4 GB, puede ejecutarse en portatiles y estaciones de trabajo sin GPU dedicada para tareas de cribado.
- Prototipado de asistentes bilingues EN/ZH: util para equipos que necesitan un modelo ligero que alterne ingles y chino en contextos regulatorios.
- Evaluacion de riesgo en flujos de datos: como componente de un sistema mayor que marca textos susceptibles de contener datos personales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con Q4_K_M (2,6 GB de pesos mas overhead de contexto); unos 4,5-5,5 GB con Q8_0 (4,4 GB de pesos); unos 8,5-9,5 GB con f16 (8,2 GB de pesos).
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM para cuantizaciones Q4/Q5; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para f16 y despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6-8 GB de VRAM usando Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede servirse con transformers, vLLM o TGI si se dispone de los pesos safetensors.
- Latencia y throughput: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| kestrel-explainer-4b (esta ficha) | 4B | no disponible | Apache 2.0 | GGUF, safetensors | Especializado en compliance Hong Kong, EN/ZH |
| Modelos genericos de 3-4B (p. ej. familia Llama/Qwen de 3-4B) | 3-4B | variable | variable | GGUF, safetensors | Proposito general, sin especializacion regulatoria |
| Modelos de guardrail dedicados (p. ej. Llama Guard) | 7-8B | variable | variable | safetensors, GGUF | Clasificacion de seguridad, no explicacion normativa |

No se dispone de datos de rendimiento comparativo verificables para kestrel-explainer-4b; la comparativa se limita a categoria, tamano y licencia.

## Limitaciones y advertencias

- Informacion publica muy escasa: no se documentan arquitectura, contexto, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su calidad real.
- Riesgo de alucinacion en materia legal: al ser un modelo de 4B especializado en normativa, puede generar referencias incorrectas a articulos o requisitos; no debe usarse como asesoramiento legal sin revision humana.
- Cobertura limitada de idiomas: solo ingles y chino; no se garantiza un buen rendimiento en castellano.
- Enfoque geografico restringido: las etiquetas apuntan al marco regulatorio de Hong Kong; su utilidad fuera de ese contexto es dudosa.
- Sin cuantizaciones ponderadas/imatrix publicadas por el autor, lo que puede afectar a la calidad en cuantizaciones bajas (Q2_K, Q3_K).
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el entrenamiento impide verificar la procedencia de los datos.
- El repositorio registra 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/kestrel-explainer-4b-GGUF
- Modelo base: https://huggingface.co/udomain/kestrel-explainer-4b
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#kestrel-explainer-4b-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
