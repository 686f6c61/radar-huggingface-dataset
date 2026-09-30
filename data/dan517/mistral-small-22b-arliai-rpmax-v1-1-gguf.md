# dan517/Mistral-Small-22B-ArliAI-RPMax-v1.1-GGUF

## Resumen

Esta ficha describe el repositorio `dan517/Mistral-Small-22B-ArliAI-RPMax-v1.1-GGUF`, una publicación de pesos en formato GGUF derivada de `ArliAI/Mistral-Small-22B-ArliAI-RPMax-v1.1`, que a su vez es un ajuste fino de `mistralai/Mistral-Small-Instruct-2409`. Se trata por tanto de un modelo de lenguaje denso de aproximadamente 22.247 millones de parámetros (22,2 B), especializado en roleplay, escritura creativa y conversación, con una ventana de contexto declarada de 32.768 tokens para el modelo base según las fuentes consultadas. El repo no entrena ni modifica pesos: distribuye cuantizaciones ya generadas (según la propia model card, por bartowski con llama.cpp, release b3825), por lo que su valor práctico es la disponibilidad de ficheros GGUF listos para inferencia local.

El interés actual de este repositorio es limitado pero concreto: permite ejecutar un modelo de 22 B con calidad de cuantización Q4–Q6 en hardware de consumo o en una única GPU profesional, algo relevante para despliegues locales de asistentes conversacionales y generación creativa sin depender de APIs. El repo declara 0 descargas y 0 likes en el momento de la consulta, y su tamaño total es de 366,3 GB, coherente con alojar en una sola rama todas las variantes cuantizadas (desde f16 de 44,50 GB hasta formatos de ~12 GB).

La advertencia principal es la licencia: el modelo base hereda la Mistral Research License (MRL-0.1), y la propia ArliAI indica que se trata de un uso personal únicamente. Cualquier despliegue comercial requiere revisar la licencia con detalle antes de proceder.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Mistral-Small-Instruct-2409); sin MoE |
| Parametros totales | 22.247.282.688 (22,2 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (dato del modelo base segun aimodels.fyi) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_K_S, Q4_0, Q4_0_8_8, Q4_0_4_8, Q4_0_4_4, IQ4_XS, Q3_K_XL, Q3_K_L, Q3_K_M (la model card se trunca; pueden existir variantes adicionales) |
| Idiomas soportados | no disponibles en la informacion proporcionada |
| Licencia | MRL-0.1 (Mistral Research License); etiquetada como `other` / `mrl`. El autor del modelo base indica uso personal unicamente |
| Formato de pesos | GGUF (cuantizaciones llama.cpp, generadas con imatrix) |
| Formato de prompt | `<s>[INST] {prompt}[/INST]` |
| Repositorio | dan517/Mistral-Small-22B-ArliAI-RPMax-v1.1-GGUF (espejo de las cuantizaciones de bartowski) |
| Tamano del repo | 366,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Mistral-Small-Instruct-2409: un transformer decoder-only denso de 22 B de parámetros, con atención por ventanas y ventana de contexto de 32.768 tokens según las fuentes consultadas. No es un modelo MoE, por lo que no hay distinción entre parámetros totales y activos: los 22,2 B se ejecutan en cada token generado. Sobre esa base, ArliAI aplicó un ajuste fino orientado a roleplay y escritura creativa, con datasets curados y énfasis en deduplicación para evitar comportamientos repetitivos de personaje y deriva de personalidad en conversaciones largas.

El repositorio `dan517` no documenta ningún proceso de entrenamiento propio: es una redistribución de cuantizaciones GGUF. La model card indica que las cuantizaciones se realizaron con llama.cpp release b3825 usando la opción imatrix con el dataset público de calibración de bartowski, y que la rama original de referencia es `bartowski/Mistral-Small-22B-ArliAI-RPMax-v1.1-GGUF`. No se dispone de información sobre número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO en la información proporcionada. El formato de prompt documentado es el clásico de Mistral (`<s>[INST] ... [/INST]`), sin plantilla de sistema explícita en la model card.

## Capacidades

- Generación de texto conversacional multi-turno, con especial énfasis en roleplay y mantenimiento de personaje.
- Escritura creativa y narrativa: relatos, diálogos, descripciones y continuaciones de ficción.
- Comprensión y generación de instrucciones en formato chat mediante la plantilla `<s>[INST] ... [/INST]`.
- Etiquetada como `conversational` y `text-generation` en HuggingFace, con compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidades multilingües: no confirmadas en la información proporcionada; el modelo base Mistral-Small-Instruct-2409 se distribuye habitualmente como multilingüe, pero la model card de esta variante no las declara.
- Tool calling / function calling: no documentado en la información disponible.
- Modo de razonamiento explícito (thinking), visión o audio: no disponible.
- Soporte de contexto largo: hasta 32.768 tokens según el modelo base, útil para conversaciones extensas y documentos largos.

## Casos de uso

- Roleplay y compañeros conversacionales: es el caso de uso principal declarado del ajuste RPMax. El modelo mantiene personalidad y evita repeticiones en sesiones largas gracias al énfasis en deduplicación del dataset de entrenamiento y a la ventana de 32.768 tokens.
- Asistente de escritura creativa local: generación de borradores de relatos, tramas y diálogos en un equipo propio, sin enviar material inédito a APIs externas, usando la cuantización Q4_K_M o Q5_K_M para equilibrar calidad y huella de memoria.
- Generación de diálogos para videojuegos y narrativa interactiva: integrable vía GGUF en motores locales (LM Studio, llama.cpp) para producir respuestas de PNJ en tiempo real con latencia controlada por la cuantización elegida.
- Prototipado de chatbots temáticos sin coste de API: con cuantizaciones de 12–16 GB se puede desplegar un servicio conversacional completo en una sola GPU, lo que abarata iteraciones de producto y pruebas de prompt.
- Generación de contenido de ficción por lotes: procesado por script (por ejemplo, con `llama.cpp` o `llama-cpp-python`) para producir variantes de texto, sinopsis o descripciones a partir de prompts en fichero.
- Base para ajuste fino adicional: al ser un modelo denso de 22 B con pesos en safetensors en el repo original de ArliAI, puede servir como punto de partida para LoRA específicos de dominio, aunque la licencia MRL restringe el uso a investigación y uso personal.
- Evaluación comparativa de cuantizaciones en local: el repo incluye todas las variantes (f16 a Q3), lo que permite medir empíricamente la degradación de calidad frente al uso de memoria en el hardware propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio `dan517`, ni la del modelo base de ArliAI, ni los resultados de búsqueda consultados incluyen cifras de MMLU, HumanEval, GSM8K, MT-Bench u otros conjuntos de evaluación para esta variante.

## Requisitos de hardware

- VRAM/RAM mínima según cuantización (tamaños de fichero declarados en la model card):
  - f16: 44,50 GB.
  - Q8_0: 23,64 GB.
  - Q6_K_L / Q6_K: 18,35 GB / 18,25 GB.
  - Q5_K_L / Q5_K_M / Q5_K_S: 15,85 GB / 15,72 GB / 15,32 GB.
  - Q4_K_L / Q4_K_M / Q4_K_S: 13,49 GB / 13,34 GB / 12,66 GB.
  - IQ4_XS: 11,94 GB.
  - Q3_K_XL / Q3_K_L / Q3_K_M: 11,91 GB / 11,73 GB / aproximadamente 11,7 GB.
- A estos tamaños hay que sumar la caché KV y el overhead del runtime. Con 32.768 tokens de contexto, la caché puede añadir varios gigabytes adicionales según la implementación y la precisión de la caché.
- GPU de consumo: una RTX 4090 (24 GB) puede ejecutar con offload completo Q4_K_M (13,34 GB), Q5_K_M (15,72 GB) e incluso Q6_K (18,25 GB), dejando margen variable para la caché KV. Una RTX 3090 (24 GB) es equivalente en capacidad. GPUs de 16 GB (RTX 4080, 4070 Ti Super) quedan ajustadas para Q4_K_M con contexto reducido y offload parcial a RAM.
- GPU profesionales: A100 40/80 GB y H100 80 GB permiten f16 (44,50 GB) o Q8_0 con contexto completo, además de servir varias réplicas o lotes concurrentes.
- CPU/RAM: con Q4_K_S (12,66 GB) o Q3_K_M (aproximadamente 11,7 GB) es viable inferencia en CPU con 16–32 GB de RAM, a velocidades muy inferiores a las de GPU.
- ARM: existen variantes específicas Q4_0_8_8, Q4_0_4_8 y Q4_0_4_4 optimizadas para chips ARM con soporte `sve` o `i8mm`.
- Opciones de despliegue: llama.cpp, LM Studio (recomendado explícitamente por la model card), y cualquier runtime compatible con GGUF. Para vLLM o TGI habría que usar los pesos en safetensors del repo original de ArliAI, no esta versión GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información consultada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad | Notas |
|---|---|---|---|---|---|
| dan517/Mistral-Small-22B-ArliAI-RPMax-v1.1-GGUF | 22,2 B denso | 32.768 tokens (modelo base) | MRL-0.1 (uso personal segun ArliAI) | GGUF, multiples cuantizaciones | Espejo de las cuantizaciones de bartowski; 0 descargas |
| bartowski/Mistral-Small-22B-ArliAI-RPMax-v1.1-GGUF | 22,2 B denso | 32.768 tokens | MRL-0.1 | GGUF | Repositorio original de las cuantizaciones referenciado en la model card |
| ArliAI/Mistral-Small-22B-ArliAI-RPMax-v1.1 | 22,2 B denso | 32.768 tokens | MRL-0.1 | safetensors, tambien GPTQ_Q8 | Modelo ajustado, fuente de la cadena de derivados |
| mistralai/Mistral-Small-Instruct-2409 | 22 B denso | 32.768 tokens | MRL-0.1 | safetensors | Modelo base instructivo, sin el ajuste de roleplay de ArliAI |

No se dispone de datos de benchmarks que permitan comparar el rendimiento relativo de estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la Mistral Research License (MRL-0.1) y la nota explícita de ArliAI indican uso personal únicamente. El uso comercial no está autorizado sin una licencia adicional de Mistral.
- Riesgo de alucinación: como cualquier modelo de 22 B sin mecanismos de verificación factual, puede generar datos falsos con apariencia plausible, especialmente en dominios especializados. No debe usarse como fuente de verdad sin validación externa.
- Sesgos: no se han publicado análisis de sesgos para este ajuste ni se documenta la composición del dataset de roleplay, lo que impide auditar qué sesgos de género, cultura o idioma puede haber heredado.
- Idiomas: la model card no declara idiomas soportados. El comportamiento fuera del inglés y de los idiomas del modelo base no está garantizado.
- Sin tool calling ni agentes: no hay evidencia de soporte de function calling, uso de herramientas o razonamiento multi-paso estructurado, lo que limita su uso en pipelines agénticos.
- Sin benchmarks: no existen cifras públicas de evaluación para esta variante, por lo que no se puede comparar objetivamente con alternativas.
- Repositorio no oficial con 0 descargas: `dan517` redistribuye el trabajo de bartowski; conviene verificar la integridad de los ficheros y preferir la fuente original si se busca trazabilidad.
- Plantilla de prompt fija: el formato `<s>[INST] {prompt}[/INST]` no incluye rol de sistema documentado, lo que puede dificultar el control fino de instrucciones en producción.
- Contexto limitado a 32.768 tokens: insuficiente para casos de recuperación sobre documentos muy largos sin técnicas de troceado y RAG.
- Producción: la ausencia de datos de throughput y latencia, junto con la licencia, hace desaconsejable su uso en servicios comerciales abiertos sin una evaluación legal y de rendimiento previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dan517/Mistral-Small-22B-ArliAI-RPMax-v1.1-GGUF
- Cuantizaciones originales de bartowski: https://huggingface.co/bartowski/Mistral-Small-22B-ArliAI-RPMax-v1.1-GGUF
- Modelo base ajustado (ArliAI): https://huggingface.co/ArliAI/Mistral-Small-22B-ArliAI-RPMax-v1.1
- Variante GPTQ Q8 de ArliAI: https://huggingface.co/ArliAI/Mistral-Small-22B-ArliAI-RPMax-v1.1-GPTQ_Q8
- Modelo base de Mistral: https://huggingface.co/mistralai/Mistral-Small-Instruct-2409
- Licencia Mistral Research License 0.1: https://mistral.ai/licenses/MRL-0.1.md
- Terminos y privacidad de Mistral: https://mistral.ai/terms/
- llama.cpp (release b3825 usada para cuantizar): https://github.com/ggerganov/llama.cpp/releases/tag/b3825
- Dataset de calibracion imatrix de bartowski: https://gist.github.com/bartowski1182/eb213dccb3571f863da82e99418f81e8
- LM Studio: https://lmstudio.ai/
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/mistral-small-22b-arliai-rpmax-v1.1-arliai
- Ficha en Inferix: https://inferix.co/models/bartowski/Mistral-Small-22B-ArliAI-RPMax-v1.1-GGUF
- Ficha en Local AI Zone: https://local-ai-zone.github.io/models/mistral-small-22b-arliai-rpmax-v1-1.html
