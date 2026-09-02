# mradermacher/AMD-OLMo-1B-IT-i1-GGUF

## Resumen

AMD-OLMo-1B-IT-i1-GGUF es una cuantización en formato GGUF del modelo AMD-OLMo-1B-IT, un modelo de lenguaje instructivo de aproximadamente 1.170 millones de parámetros desarrollado por AMD a partir de la arquitectura OLMo de AI2. El modelo base fue ajustado con el dataset ShareGPT GPT-4 para seguir instrucciones, y esta versión ha sido cuantizada por mradermacher utilizando la técnica de imatrix, lo que la hace adecuada para ejecutarse en dispositivos con recursos limitados, como CPUs o GPUs de gama baja. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este modelo radica en su tamaño compacto y su naturaleza abierta: al ser una cuantización GGUF, puede desplegarse fácilmente con herramientas como llama.cpp u Ollama, lo que lo convierte en una opción práctica para prototipos, aplicaciones edge y entornos donde la VRAM es escasa. El idioma principal es el inglés y su contexto máximo no está especificado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo derivado de la familia OLMo, presumiblemente transformer decoder-only) |
| Parametros totales | 1.176.764.416 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base AMD-OLMo-1B-IT es un fine-tuning del modelo OLMo de AMD, que a su vez se basa en la arquitectura OLMo de AI2 (un transformer decoder-only). No se dispone de detalles específicos sobre la arquitectura interna (número de capas, cabezas de atención, etc.) en la información proporcionada. El proceso de entrenamiento consistió en un ajuste supervisado (SFT) utilizando el dataset shibing624/sharegpt_gpt4, que contiene conversaciones generadas con GPT-4. No se mencionan técnicas adicionales como RLHF o DPO en la model card, aunque el nombre "IT" sugiere que es una versión instruida.

La cuantización fue realizada por mradermacher con la técnica de imatrix (importance matrix), que optimiza la asignación de bits según la importancia de cada peso. Esto permite obtener una buena relación calidad-tamaño en los distintos niveles de cuantización ofrecidos.

## Capacidades

- Generacion de texto en ingles: el modelo es capaz de producir respuestas coherentes a instrucciones, dado su entrenamiento con datos de conversacion.
- Razonamiento basico y comprension de lenguaje natural: al ser un modelo de 1B, puede manejar tareas simples de QA, resumen y generacion creativa.
- Soporte limitado para tareas de codigo y matematicas: no se especifica en la informacion, pero los modelos de este tamano suelen tener capacidades basicas.
- No se menciona soporte para tool calling, agentes, vision ni audio.
- Multilingue: no, solo ingles.

## Casos de uso

- Prototipado rapido de chatbots: al ser un modelo GGUF pequeno, se puede cargar en una CPU moderna o en una GPU con 2 GB de VRAM, permitiendo iterar rapidamente en el diseno de conversaciones sin necesidad de infraestructura costosa.
- Asistente virtual embebido en dispositivos edge: su tamano reducido (menos de 1 GB en cuantizaciones bajas) lo hace viable para ejecutarse en Raspberry Pi, mini-PCs o incluso en smartphones mediante aplicaciones como Ollama.
- Generacion de contenido asistida en aplicaciones de ofimatica: puede integrarse en herramientas de redaccion para sugerir parrafos, resumir textos o completar frases en ingles.
- Clasificacion de texto y extraccion de entidades: aunque no esta optimizado para ello, puede utilizarse como base para fine-tuning en tareas especificas de NLP gracias a su licencia abierta.
- Educacion y aprendizaje: sirve como modelo de demostracion para ensenar tecnicas de cuantizacion, despliegue local y evaluacion de modelos de lenguaje.
- Pruebas de integracion en pipelines de ML: su rapida carga y bajo consumo permiten validar flujos de inferencia en entornos de CI/CD sin incurrir en costes elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan datos de MMLU, HumanEval, GSM8K ni otras metricas comparativas para este modelo cuantizado.

## Requisitos de hardware

- VRAM estimada: segun la cuantizacion, el archivo mas grande (Q6_K) ocupa 1.1 GB, por lo que la VRAM necesaria para inferencia estaria entre 0.5 GB (cuantizaciones muy bajas) y 2 GB (Q6_K con overhead).
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como NVIDIA GTX 1050 Ti, GTX 1650, RTX 2060, o integradas AMD con suficiente memoria compartida. Tambien funciona en CPU pura.
- Compatibilidad con consumer GPU: si, es perfectamente ejecutable en GPUs de consumo, incluso en placas con 2 GB de VRAM.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible. En una CPU moderna con 8 nucleos, se pueden esperar decenas de tokens por segundo con cuantizaciones Q4_K_M, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. Como referencia estructural, se puede comparar con otros modelos de ~1B:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| AMD-OLMo-1B-IT (este, cuantizado) | 1.17B | No disponible | Apache 2.0 | GGUF |
| TinyLlama-1.1B | 1.1B | 2048 | Apache 2.0 | GGUF y otros |
| Qwen2-0.5B | 0.5B | 32768 | Apache 2.0 | GGUF y otros |
| Gemma-2-2B | 2.6B | 8192 | Gemma license | GGUF y otros |

La comparativa de rendimiento no es posible sin benchmarks publicados. Se recomienda evaluar en tareas concretas.

## Limitaciones y advertencias

- Sesgos: al entrenarse con datos de ShareGPT, puede heredar sesgos presentes en conversaciones reales de usuarios, incluyendo estereotipos o lenguaje ofensivo.
- Alucinaciones: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente en contextos largos o temas poco representados.
- Limitaciones de contexto: no se ha especificado la longitud maxima de contexto; se recomienda verificar en el modelo base antes de usarlo en tareas que requieran ventanas largas.
- Solo ingles: no es adecuado para tareas en otros idiomas sin fine-tuning adicional.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el uso comercial esta permitido, pero se debe atribuir adecuadamente y no se puede responsabilizar al creador por uso indebido.
- Riesgos en produccion: por su tamano, la calidad de las respuestas es limitada; no es recomendable para aplicaciones criticas que requieran alta precision o razonamiento complejo.
- Dependencia de la cuantizacion: las cuantizaciones muy bajas (IQ1, Q2) degradan notablemente la calidad; se recomienda usar Q4_K_M o superior para tareas serias.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/AMD-OLMo-1B-IT-i1-GGUF
- Modelo base (sin cuantizar): https://huggingface.co/aiuser3993/AMD-OLMo-1B-IT
- Blog de AMD sobre los modelos OLMo: https://www.amd.com/en/developer/resources/technical-articles/introducing-the-first-amd-1b-language-model.html
- Repositorio de OLMo (AI2): https://github.com/allenai/OLMo
