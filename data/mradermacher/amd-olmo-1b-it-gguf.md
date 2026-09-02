# mradermacher/AMD-OLMo-1B-IT-GGUF

## Resumen

AMD-OLMo-1B-IT-GGUF es una colección de cuantizaciones GGUF del modelo AMD-OLMo-1B-IT, un ajuste fino instructivo del modelo AMD OLMo 1B desarrollado por AMD. El modelo base, AMD OLMo 1B, es el primer modelo de lenguaje de 1B de parámetros lanzado por AMD, basado en la arquitectura OLMo de AllenAI y entrenado con el corpus Dolma. La versión IT (instruct) se obtuvo mediante supervisión fina (SFT) sobre el dataset sharegpt_gpt4, que contiene conversaciones generadas con GPT-4.

Esta versión cuantizada, creada por mradermacher, ofrece múltiples niveles de precisión (desde Q2_K hasta f16) para facilitar la ejecución en hardware con recursos limitados. Con 1.176.764.416 parámetros, es un modelo compacto pensado para tareas de generación de texto en inglés, especialmente en entornos de edge computing o GPUs de consumo. Su licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo) |
| Parametros totales | 1.176.764.416 (1,17B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base AMD OLMo 1B sigue la arquitectura OLMo de AllenAI: un transformer decoder-only con atención causal, diseñado para ser completamente reproducible y abierto. AMD entrenó este modelo desde cero utilizando el corpus Dolma, un dataset de texto en inglés de alta calidad, y publicó los pesos, datos y recetas de entrenamiento. La versión IT (instruct) se obtuvo mediante un ajuste fino supervisado (SFT) sobre el dataset sharegpt_gpt4, que contiene diálogos y respuestas generadas con GPT-4, lo que le confiere capacidad de seguir instrucciones y mantener conversaciones coherentes.

La cuantización realizada por mradermacher convierte los pesos originales en formato GGUF, optimizado para inferencia con llama.cpp y motores compatibles. No se dispone de información sobre el número exacto de tokens de entrenamiento ni sobre técnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto en ingles: produce respuestas coherentes y contextualmente relevantes.
- Seguimiento de instrucciones: al ser un modelo instruct, puede ejecutar tareas simples como resumir, responder preguntas o completar textos.
- Razonamiento basico: capacidad limitada para tareas de logica sencilla y matematicas elementales, propia de un modelo de 1B.
- Conversacion multi-turno: puede mantener dialogos cortos gracias al ajuste con datos de chat.
- No se ha confirmado soporte para tool calling, funciones, agentes o capacidades multimodales.

## Casos de uso

- Chatbots ligeros para atencion al cliente: el modelo puede gestionar conversaciones basicas en ingles, resolviendo dudas frecuentes o derivando a un agente humano. Su tamano reducido permite desplegarlo en servidores modestos o en el edge.
- Generacion de respuestas automaticas en formularios web: integrado en sistemas de soporte, puede redactar respuestas preliminares a consultas de usuarios.
- Asistente de escritura en ingles: ayuda a redactar correos, resumenes o borradores de documentos, aprovechando su capacidad de seguir instrucciones.
- Clasificacion y etiquetado de texto: mediante prompts adecuados, puede categorizar textos cortos o extraer entidades simples.
- Educacion y practica de idiomas: como modelo de conversacion para estudiantes de ingles, ofreciendo respuestas sencillas y corregibles.
- Prototipado rapido de aplicaciones NLP: al ser pequeno y rapido, es util para validar ideas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones estandar para este modelo o su version base.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF varian entre 0,6 GB (Q2_K) y 2,5 GB (f16). Con cuantizaciones Q4_K_M o Q5_K_M (0,8-0,9 GB), se puede ejecutar en GPUs con 4 GB de VRAM o incluso en CPU con suficiente RAM.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o AMD RX 6600. Tambien es viable en Apple Silicon con 8 GB unificados.
- Compatibilidad con consumer GPU: si, es un modelo pensado para hardware de consumo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. Tambien se puede usar con transformers mediante la integracion de GGUF.
- Latencia y throughput: no se dispone de mediciones oficiales, pero por su tamano se espera una generacion de decenas de tokens por segundo en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| AMD-OLMo-1B-IT (GGUF) | 1,17B | No disponible | Apache-2.0 | GGUF |
| TinyLlama-1.1B-Chat | 1,1B | 2048 | Apache-2.0 | GGUF, safetensors |
| Qwen1.5-1.8B-Chat | 1,8B | 32768 | Apache-2.0 | GGUF, safetensors |
| Phi-2 | 2,7B | 2048 | MIT | safetensors |

No se dispone de datos de rendimiento comparativo. La eleccion entre estos modelos dependera de la longitud de contexto requerida y de la disponibilidad de cuantizaciones especificas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con datos de Dolma y sharegpt_gpt4, puede reflejar sesgos presentes en esos corpus, especialmente en temas sociales y culturales.
- Riesgo de alucinacion: como todo modelo de 1B, tiende a inventar hechos o detalles cuando no conoce la respuesta. Se recomienda verificar la salida en aplicaciones criticas.
- Limitaciones de contexto: no se ha especificado la longitud de contexto, pero por su tamano probablemente sea limitada (tipicamente 2048 o 4096 tokens). No apto para documentos largos.
- Idioma: solo ingles. No soporta otros idiomas de forma fiable.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se debe mantener el aviso de licencia y atribucion.
- Caveat de produccion: al ser un modelo pequeno, su rendimiento en tareas complejas (razonamiento avanzado, codigo, matematicas) es inferior a modelos de mayor tamano. No recomendado para sistemas donde la precision sea critica sin supervisión humana.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/AMD-OLMo-1B-IT-GGUF
- Modelo base (aiuser3993/AMD-OLMo-1B-IT): https://huggingface.co/aiuser3993/AMD-OLMo-1B-IT
- Articulo de AMD sobre los modelos OLMo 1B: https://www.amd.com/en/developer/resources/technical-articles/introducing-the-first-amd-1b-language-model.html
- Blog de AMD: https://www.amd.com/en/blogs/2024/introducing-the-first-amd-1b-language-models-amd-.html
- Comunidad AMD: https://community.amd.com/t5/ai/introducing-the-first-amd-1b-language-models-amd-olmo/ba-p/721253
