# citavyn/citavyn-gemma4-2b-full

## Resumen

citavyn-gemma4-2b-full es un derivado ajustado por la organizacion Citavyn a partir de `google/gemma-4-E2B-it`. El modelo se ha adaptado mediante Supervised Fine-Tuning (SFT) con LoRA para tareas de generacion aumentada por recuperacion (RAG) en entornos empresariales y para flujos de gobierno de IA y de datos. El repositorio publicado contiene los pesos completos fusionados en `bfloat16` (no solo el adaptador), con 5.123.178.051 parametros reales en safetensors y un tamano de repositorio de 10,3 GB.

La propuesta de valor del modelo es el alineamiento con marcos regulatorios concretos: EU AI Act (Anexo III, articulo 5 y articulo 27 sobre FRIA), NIST AI RMF 1.0, GDPR (articulos 5 y 17) e ISO/IEC 42001:2023. Ademas, incorpora comportamientos entrenados de citacion en linea de fragmentos delimitados por XML, abstencion cuando la evidencia recuperada es insuficiente, enmascarado de PII de nivel 4 y reconocimiento de intentos de inyeccion de prompt.

Es relevante ahora porque cubre un nicho poco atendido: asistentes de cumplimiento normativo que deben responder exclusivamente a partir de documentos recuperados, sin extrapolar de la memoria de preentrenamiento. La model card advierte explicitamente de que estos comportamientos son tendencias aprendidas y no garantias duras, por lo que deben complementarse con guardrails deterministas. El modelo solo declara soporte de ingles y no presenta descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de google/gemma-4-E2B-it; detalles internos no disponibles) |
| Parametros totales | 5.123.178.051 (pesos fusionados en safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en el repositorio; los pesos publicados estan en bfloat16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (pesos completos fusionados, bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un modelo de la familia Gemma 4 con presupuesto de parametros efectivos "E2B". Sobre esa base se aplico un ajuste supervisado con LoRA de rango 16 y adaptador en BF16 de aproximadamente 95 MB, con 24.158.208 parametros entrenables, lo que representa un 0,47 % del modelo base. El repositorio final, sin embargo, publica los pesos completos fusionados en bfloat16, pensados para servir con vLLM en produccion.

Los datos de entrenamiento no estan detallados: la model card incluye una seccion de datos de entrenamiento sin rellenar (fuentes, tamano, proporcion de datos sinteticos frente a publicos y tratamiento de PII). Tampoco se documenta el uso de RLHF o DPO. La innovacion tecnica declarada no esta en la arquitectura, sino en el comportamiento inducido por el ajuste: citacion estricta de fragmentos `<documents>` ignorando documentos distractores de alta similitud, abstencion acotada al contexto recuperado, cobertura instructiva de marcos regulatorios y patrones de redaccion de PII y de reconocimiento de inyeccion de prompt.

## Capacidades

- Generacion de texto conversacional orientada a preguntas y respuestas sobre documentos recuperados.
- Citacion en linea estricta con el formato `[Doc X]`, atribuyendo afirmaciones factuales exclusivamente a fragmentos delimitados por XML en `<documents>`.
- Abstencion acotada al contexto: rechaza extrapolar desde la memoria de preentrenamiento cuando los documentos recuperados no contienen evidencia suficiente.
- Cobertura instructiva de EU AI Act (Anexo III, articulo 5, articulo 27 FRIA), NIST AI RMF 1.0 (GOVERN, MAP, MEASURE, MANAGE), GDPR (articulos 5 y 17), ISO/IEC 42001:2023 y aislamiento por RBAC y blueprint empresarial.
- Enmascarado de PII de nivel 4 con marcadores como `[REDACTED_SSN_1]` y `[REDACTED_PAN_1]`.
- Reconocimiento de intentos de inyeccion de prompt y de bypass de control de acceso.
- Capacidades multilingues: solo ingles declarado.
- No se documentan capacidades de vision, audio, tool calling ni modo de razonamiento explicito.

## Casos de uso

- Asistente interno de cumplimiento normativo: el modelo responde preguntas sobre EU AI Act, NIST AI RMF, GDPR e ISO/IEC 42001 citando los fragmentos regulatorios recuperados con `[Doc X]`, lo que permite a los equipos de compliance verificar cada afirmacion contra la fuente.
- RAG documental en entornos empresariales: integrado en un pipeline de recuperacion, responde exclusivamente a partir de los chunks inyectados en `<documents>` e ignora documentos distractores de alta similitud, reduciendo respuestas basadas en memoria del preentrenamiento.
- Revision de evaluaciones de impacto (FRIA): sirve de apoyo para redactar y contrastar secciones de evaluaciones de impacto sobre derechos fundamentales segun el articulo 27 del EU AI Act, siempre con evidencia documental citada.
- Clasificacion y consulta de sistemas de alto riesgo: ayuda a interpretar el Anexo III del EU AI Act sobre casos de uso, citando el texto recuperado en lugar de parafrasear de memoria.
- Primera linea de defensa en proteccion de datos: en flujos de atencion interna sobre solicitudes de acceso o supresion (articulos 5 y 17 del GDPR), enmascara PII de nivel 4 en las respuestas y senala intentos de inyeccion de prompt.
- Despliegue multi-tenant con vLLM: los pesos fusionados en bfloat16 estan pensados para servir con vLLM en escenarios multi-inquilino, con aislamiento por RBAC y blueprint como comportamiento entrenado.
- Formacion interna de equipos de gobierno de datos: genera respuestas explicativas sobre controles de NIST AI RMF 1.0 y ISO/IEC 42001:2023 ancladas a los documentos internos de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion sin rellenar (precision de citacion, tasa de abstencion y recall de PII sobre un conjunto reservado), por lo que no existen cifras verificables de MMLU, HumanEval, GSM8K ni de las metricas propias del dominio.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 10,3 GB solo para pesos, mas overhead de KV cache y activaciones; en la practica, se recomienda un minimo de 16-24 GB de VRAM para contextos moderados.
- Cuantizacion a 8 bits: alrededor de 5-6 GB de pesos; a 4 bits, alrededor de 3 GB, aunque el repositorio no publica artefactos cuantizados y habria que generarlos.
- GPU recomendadas para produccion: A100 40/80 GB, H100, L40S o A10G para servir con vLLM en bfloat16 con concurrencia.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bfloat16 con contexto limitado, y en RTX 3090/4080 tras cuantizacion a 8 o 4 bits.
- Opciones de despliegue: vLLM es el objetivo declarado por el autor (pesos fusionados en bfloat16); llama.cpp, Ollama y TGI requeririan conversion o cuantizacion previa no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| citavyn-gemma4-2b-full | 5.123.178.051 | no disponible | en | apache-2.0 | RAG y gobierno de IA ajustado por SFT |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | no disponible | Gemma (terminos de Google) | Modelo generalista de instrucciones |
| Alternativas de RAG con citacion | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo base `google/gemma-4-E2B-it`, del que hereda arquitectura y pesos y al que anade el ajuste de dominio. No se dispone de datos de rendimiento comparado con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Los comportamientos aprendidos (citacion, abstencion, enmascarado de PII) no son garantias duras; la model card exige guardrails deterministas para la aplicacion de PII y el control de acceso.
- El presupuesto de parametros efectivos E2B limita el recuerdo verbatim de textos legales, por lo que no debe usarse como fuente normativa autonoma.
- No esta destinado a certificacion de cumplimiento ni a funcionar como control de seguridad por si solo.
- Riesgo de alucinacion fuera del contexto recuperado: la abstencion es un comportamiento entrenado, no un mecanismo arquitectonico verificado.
- Solo soporta ingles; no hay soporte declarado de castellano ni de otros idiomas.
- No se documentan sesgos conocidos, datos de entrenamiento ni evaluaciones; la seccion de datos y evaluacion de la model card esta sin rellenar.
- Licencia Apache 2.0 con avisos originales de Google Gemma 4 E2B preservados; conviene revisar los terminos de la licencia del modelo base para uso comercial.
- Modelo sin descargas ni validacion comunitaria en el momento de la consulta; no hay evidencia externa de calidad en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/citavyn/citavyn-gemma4-2b-full
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
