# Sankar-2910/genz-translator

## Resumen

GenZ Translator es un modelo de lenguaje de tipo decoder-only con arquitectura estilo Llama, desarrollado por el usuario Sankar-2910 y publicado en Hugging Face. Con 29.653.568 parámetros, está diseñado para una tarea muy concreta: traducir jerga y abreviaturas de la generación Z (inglés informal de internet) a inglés estándar claro, preservando el significado, la emoción y el contexto del mensaje original. No es un asistente de propósito general, sino un traductor especializado de dominio estrecho.

La versión 2 del modelo continúa el entrenamiento desde el checkpoint original, incorporando datos de traducción adicionales y ejemplos curados centrados en abreviaturas, jerga y preguntas sobre el significado de expresiones. Según la model card, esta iteración mejora el manejo de abreviaturas comunes como `WYD`, `tbh`, `omw`, `ty` y `np`, y eleva la tasa de acierto en un benchmark artesanal del 80,2 % al 92,4 %, aunque el benchmark sobre un conjunto reservado no muestra una mejora correspondiente en exact-match.

El modelo es relevante por su tamaño extremadamente compacto (unos 30 millones de parámetros, 3,4 GB de repositorio) y su licencia Apache 2.0, que permite uso comercial. Está pensado para inferencia local en hardware modesto y para experimentación con modelos de lenguaje de pequeño tamaño, no para conversación general, razonamiento, código o recuperación de conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama |
| Parametros totales | 29.653.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos arquitectónicos adicionales recogidos en la model card: 7 capas, hidden size de 448, 7 cabezas de atención, 7 cabezas KV, intermediate size de 1.792, vocabulario de 8.000 tokens y tokenizador BPE byte-level personalizado. Los embeddings de entrada y los pesos de la cabeza de salida no están atados (`tie_word_embeddings=False`).

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo Llama con 7 capas, dimensión oculta de 448 y 7 cabezas de atención (sin GQA, ya que cabezas de atención y cabezas KV coinciden en 7). Usa un tokenizador BPE byte-level propio con un vocabulario de solo 8.000 tokens, muy reducido en comparación con los tokenizadores de modelos generalistas, lo que es coherente con su dominio estrecho. La ventana de contexto es de 384 tokens, suficiente para mensajes cortos y publicaciones de redes sociales, pero insuficiente para conversaciones multi-turno largas.

El modelo original se entrenó desde cero, sin partir de pesos preentrenados de Meta Llama, Qwen o Mistral, con un conjunto de datos especializado de jerga Gen Z a inglés. La versión 2 continúa el entrenamiento desde el checkpoint original con datos de traducción limpiados adicionales y ejemplos curados. La model card no documenta el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Durante el ajuste de la v2 se reportan pérdidas de validación: la pérdida de validación general pasa de 0,5268 a 0,5241, la curada de 1,3334 a 0,2168 y la combinada de 0,9301 a 0,3704 (el conjunto curado tenía solo 82 ejemplos). No se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Traducción de abreviaturas comunes de internet al inglés estándar (`WYD`, `tbh`, `omw`, `ty`, `np`, entre otras).
- Reescribir mensajes informales en inglés conversacional estándar preservando significado, emoción y actitud.
- Responder a preguntas sobre el significado de expresiones de jerga Gen Z.
- Procesamiento de pies de foto y mensajes cortos de redes sociales.
- Traducción de párrafos breves (evaluada en el benchmark artesanal del autor).
- Generación de texto de un solo turno; no está diseñado para conversación multi-turno.
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (explícitamente fuera de su diseño).
- No tiene capacidades de visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe limitada al inglés; el manejo de texto mezclado con otros idiomas se documenta como caso de fallo.

## Casos de uso

- Moderación y normalización de contenido en comunidades online: el modelo puede reescribir mensajes con jerga en inglés estándar para que sistemas de moderación o análisis semántico posteriores los procesen con mayor fiabilidad, gracias a su tamaño reducido y baja latencia (4,7 ms por prompt con batch de 32 según el autor).
- Análisis de sentimiento en redes sociales: al traducir abreviaturas y jerga a inglés claro, facilita que pipelines de NLP convencionales (clasificadores entrenados en inglés estándar) interpreten correctamente mensajes de usuarios jóvenes.
- Atención al cliente en canales informales: integrado como paso de preprocesado, puede normalizar mensajes de clientes que usan jerga antes de pasarlos a un sistema de tickets o a un agente conversacional mayor.
- Herramientas educativas para padres y educadores: permite consultar el significado de expresiones Gen Z que aparecen en mensajes de adolescentes, con la advertencia de que la cobertura de jerga regional o de rápida evolución es limitada.
- Investigación sobre modelos de lenguaje compactos: con 29,65 M de parámetros y licencia Apache 2.0, sirve como banco de pruebas para estudiar fine-tuning, tokenizadores reducidos y evaluación de tareas de traducción de dominio estrecho en hardware de consumo.
- Preprocesado en pipelines de datos: normalización de corpus de redes sociales antes de indexación o búsqueda, siempre que los textos no superen los 384 tokens y sean mayoritariamente en inglés.
- Despliegue en dispositivos con recursos limitados: su tamaño permite inferencia local en CPU o GPU de gama baja para aplicaciones de escritorio o móviles que necesiten traducción de jerga sin conexión.

## Benchmarks y rendimiento

Resultados del benchmark artesanal publicado por el autor (mide si las salidas cumplen reglas de evaluación específicas por categoría; no es una precisión universal de traducción):

| Categoria | Ejemplos | v1 (aciertos) | v2 (aciertos) |
|---|---:|---:|---:|
| Abreviaturas | 39 | 82 % | 100 % |
| Abreviaturas contextuales | 16 | 88 % | 94 % |
| Preguntas de significado | 11 | 27 % | 100 % |
| Overflow | 1 | 100 % | 100 % |
| Parrafos | 5 | 100 % | 100 % |
| Passthrough | 8 | 75 % | 75 % |
| Polaridad | 10 | 90 % | 90 % |
| Preservacion de significado | 7 | 57 % | 71 % |
| Robustez | 37 | 86 % | 92 % |
| Jerga | 34 | 91 % | 88 % |
| **Total categorias puntuadas** | — | **80,2 %** | **92,4 %** |

Resultados del benchmark sobre conjunto reservado (held-out):

| Metrica | v1 | v2 |
|---|---:|---:|
| Exact match | 15,2 % | 14,5 % |
| Token F1 | 0,701 | 0,699 |
| Salidas terminadas en EOS | 100 % | 100 % |
| Jerga restante en la salida | 0,0 % | 0,1 % |
| Salidas en estilo definicion | 0,1 % | 0,0 % |
| Latencia, batch de 32 | 4,1 ms/prompt | 4,7 ms/prompt |

El propio autor advierte que el exact-match es estricto y que una traducción válida puede marcarse como incorrecta si difiere en redacción de la referencia, y que el benchmark artesanal no debe interpretarse como un porcentaje universal de precisión. No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 29,65 M de parámetros, los pesos en FP32 ocupan aproximadamente 119 MB; en FP16, unos 59 MB; en BF16, unos 59 MB. El repositorio completo ocupa 3,4 GB, pero el modelo en sí es muy pequeño.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo cabe holgadamente en tarjetas de consumo como RTX 3060, RTX 4060, RTX 4090 o incluso en iGPU y CPU.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas, y también en CPU para inferencia local.
- Opciones de despliegue: transformers (librería documentada por el autor); el tag `text-generation-inference` y `endpoints_compatible` sugiere compatibilidad con TGI y endpoints de Hugging Face. No se documenta soporte explícito de llama.cpp, Ollama o vLLM, aunque al ser safetensors compatible con transformers, la conversión a GGUF sería técnicamente posible (no verificada en la información disponible).
- Latencia y throughput: 4,7 ms por prompt con batch de 32 en el benchmark del autor (v2), sobre hardware no especificado. El throughput absoluto no está documentado.

## Comparativa con modelos similares

No se dispone de comparaciones directas publicadas por el autor con otros modelos. A continuación se ofrece una comparación orientativa con alternativas de tamaño y propósito cercanos, usando datos públicos de sus respectivas fichas cuando están disponibles; los datos de los comparadores no provienen de la información proporcionada y deben verificarse en sus fuentes originales.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| GenZ Translator v2 | 29,65 M | 384 | Traduccion de jerga Gen Z a ingles | Apache 2.0 |
| Modelos decoder-only de ~30-50 M (p. ej. variantes TinyLlama no disponibles en este rango) | no disponible | no disponible | Generacion general | variable |
| Modelos de traduccion especializados de menos de 100 M | no disponible | no disponible | Traduccion | variable |

No se conocen modelos públicos directamente comparables en la tarea específica de traducción de jerga Gen Z con este tamaño y licencia. Se indica "no disponible" para una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- El modelo no es un asistente de propósito general: no está diseñado para conversación, código, matemáticas, recuperación de conocimiento ni conversaciones de contexto largo.
- Ventana de contexto muy limitada (384 tokens), insuficiente para documentos o diálogos extensos.
- Solo soporta inglés; el texto mezclado con otros idiomas se documenta como caso de fallo.
- Casos de fallo conocidos según el autor: pérdida de negación u otros detalles importantes, mala traducción de expresiones a nivel de frase como `pull up` y `stan`, reescritura de inglés ordinario que no necesita traducción, mal rendimiento con caracteres repetidos e inputs malformados adversarialmente, y mal manejo de URLs, nombres de usuario y algunos mensajes mixtos.
- El exact-match sobre el conjunto reservado es bajo (14,5 % en v2) y no mejora respecto a v1, lo que indica que la generalización sigue siendo un trabajo en curso.
- La mejora en el benchmark artesanal (92,4 %) no se corresponde con una mejora en el conjunto reservado, por lo que las afirmaciones de calidad deben tomarse con cautela.
- El conjunto de validación curado tenía solo 82 ejemplos, por lo que las cifras de pérdida curada deben interpretarse con precaución.
- Riesgo de alucinación en preguntas de significado de jerga poco común o regional, y cobertura limitada de jerga que evoluciona rápidamente.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre la calidad de las traducciones en producción.
- No se documentan sesgos específicos, pero al entrenarse con datos de internet en inglés, es probable que herede sesgos presentes en ese corpus (no verificado en la información disponible).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sankar-2910/genz-translator
- Paper de referencia de la arquitectura Llama (arxiv:2302.13971): https://arxiv.org/abs/2302.13971
