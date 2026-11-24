# mradermacher/gemma-4-26B-A4B-agentic-i1-GGUF

## Resumen

`mradermacher/gemma-4-26B-A4B-agentic-i1-GGUF` es una colección de cuantizaciones GGUF, generadas con imatrix y pesos ponderados, del modelo `ManniX-ITA/gemma-4-26B-A4B-agentic`. Se trata de un fine-tuning de tipo SFT y on-policy sobre una base Gemma 4 de arquitectura Mixture-of-Experts (MoE), con aproximadamente 25.230 millones de parámetros totales (25.233.142.046 según safetensors) y 4.000 millones de parámetros activos por token, tal como indica el sufijo A4B. El trabajo de cuantización lo firma mradermacher, un autor habitual en el ecosistema GGUF, mientras que el modelo base lo publica ManniX-ITA.

El objetivo del modelo es claro: reforzar capacidades agénticas, de tool calling, razonamiento y generación de código sobre la base Gemma 4, mediante un conjunto de datos de instrucciones y trazas de agentes procedentes de diversas fuentes (Nemotron Agentic, OpenCode, SWE, Competitive Programming, Math, Science, Multilingual, además de trazas Hermes y Kimi). Es relevante ahora porque permite desplegar un modelo agéntico de 26B con activación MoE de 4B en hardware de consumo mediante cuantizaciones de 8 a 19 GB, algo que un modelo denso de 26B no permitiría con la misma comodidad.

La ficha se centra en la versión GGUF i1 (imatrix) publicada por mradermacher, aunque muchos datos técnicos del modelo base (contexto, composición exacta del dataset, benchmarks) no están disponibles en la información proporcionada y se indican como tales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), base Gemma 4 |
| Parámetros totales | 25.233.142.046 (~25,2B) |
| Parámetros activos | ~4B (sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (y superiores) |
| Idiomas soportados | en (inglés declarado en la model card); multilingüe vía dataset Nemotron Multilingual, pero sin lista oficial |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 con arquitectura Mixture-of-Experts: 25,2B parámetros totales con aproximadamente 4B activos por token, lo que reduce el coste computacional de inferencia respecto a un denso equivalente. El fine-tuning se realizó en formato SFT con un componente on-policy (según los tags `sft` y `on-policy`), orientado a tareas agénticas, tool calling, razonamiento y código. La model card no detalla el número de tokens de entrenamiento ni la composición exacta de la mezcla.

Los datos de entrenamiento declarados incluyen un dataset propio de SFT (`ManniX-ITA/gemma-4-26B-A4B-agentic-sft`), trazas de agentes Hermes y Kimi (`ManniX-ITA/hermes-agent-kimi-traces-gemma4-31b`, `interstellarninja/hermes_reasoning_tool_use`, `lambda/hermes-agent-reasoning-traces`) y una batería de datasets Nemotron (Agentic v2, OpenCode v1, SWE v2, Competitive Programming v2, Instruction Following Chat v1 y v2, Math v3, Science v1, Multilingual v1). Esta combinación sugiere un énfasis en uso de herramientas, resolución de problemas de software, matemáticas y seguimiento de instrucciones. No se especifican detalles sobre RLHF/DPO ni sobre innovaciones de decodificación.

La versión aquí descrita es la cuantización GGUF realizada por mradermacher con imatrix y pesos ponderados (`output_tensor_quantised: 1`, `quantize_version: 2`), que incluye un fichero imatrix de 0,2 GB para generar cuantizaciones propias. Existe además un repositorio de cuantizaciones estáticas (`mradermacher/gemma-4-26B-A4B-agentic-GGUF`), que aloja los ficheros mmproj para la variante de visión.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito y trazas de razonamiento (tags `reasoning`, datasets Hermes reasoning).
- Tool calling / function calling, reforzado mediante datasets agénticos Nemotron y trazas Hermes.
- Comportamiento agéntico multi-paso (planificación, uso de herramientas, ejecución de tareas).
- Generación de código y resolución de problemas de software (OpenCode, SWE, Competitive Programming).
- Matemáticas (Nemotron Math v3) y ciencia (Nemotron Science v1).
- Seguimiento de instrucciones (Nemotron Instruction Following Chat v1 y v2).
- Capacidades multilingües parciales por el dataset Nemotron Multilingual, aunque el idioma declarado es solo inglés.
- Capacidad de visión según la model card del cuantizador ("This is a vision model"); los ficheros mmproj están en el repositorio estático.

## Casos de uso

- Agentes autónomos de software: el modelo puede planificar y ejecutar tareas de modificación de código, usar herramientas de terminal o APIs y razonar sobre errores, gracias al entrenamiento con datasets SWE y OpenCode y a su soporte de tool calling.
- Asistentes de programación en IDE: integrado vía llama.cpp u Ollama, puede generar código, explicar fragmentos y proponer parches; la cuantización i1-Q4_K_M (16,9 GB) ofrece un equilibrio razonable entre calidad y requisitos de memoria.
- Automatización de atención al cliente con herramientas: el modelo puede encadenar llamadas a APIs de consulta de pedidos o CRM dentro de una conversación multi-turno, apoyándose en el entrenamiento con Nemotron Agentic e Instruction Following.
- Resolución de problemas matemáticos y científicos: útil en entornos educativos o de investigación para generar explicaciones paso a paso, dado el entrenamiento con Nemotron Math v3 y Science v1.
- Pipelines de CI/CD con agentes de revisión: puede actuar como revisor automático de pull requests, invocando herramientas de análisis estático y razonando sobre los resultados, gracias a sus capacidades de tool calling y código.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones de 8-14 GB (IQ1 a IQ4_XS) permiten ejecutar el modelo en GPUs de 12-16 GB, habilitando prototipos de agentes sin depender de la nube.
- Experimentación con razonamiento y trazas: investigadores pueden usar el modelo para estudiar comportamiento agéntico y cadenas de razonamiento, dado el énfasis del fine-tuning en trazas Hermes y Kimi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del fichero GGUF, más overhead de contexto y caché KV):
  - i1-IQ1_S: ~8,4 GB.
  - i1-IQ2_M: ~10,5 GB.
  - i1-IQ3_M: ~12,5 GB.
  - i1-IQ4_XS: ~14,0 GB.
  - i1-Q4_K_M: ~16,9 GB.
  - i1-Q5_K_M: ~19,2 GB.
  - i1-Q6_K y superiores: >20 GB (tamaño exacto no disponible en el extracto).
- GPU recomendadas: para cuantizaciones bajas (IQ1-IQ3), GPUs de 12-16 GB como RTX 4070 Ti, RTX 4080 o RTX 4090; para Q4_K_M y Q5_K_M, RTX 4090 (24 GB) o A100/H100; para cuantizaciones altas, A100 40/80 GB o H100.
- ¿Cabe en GPU de consumo? Sí, en el rango IQ1-IQ4_XS cabe en GPUs de 12-16 GB; Q4_K_M y Q5_K_M requieren 24 GB (RTX 4090) o reparto CPU/GPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python o text-generation-webui). El modelo base es compatible con transformers, pero esta versión es exclusivamente GGUF.
- Latencia y throughput: no disponibles. Al ser MoE con ~4B activos, se espera un throughput superior al de un denso de 25B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| gemma-4-26B-A4B-agentic (este) | 25,2B | ~4B | no disponible | apache-2.0 | GGUF (i1) | Fine-tuning agéntico sobre Gemma 4 MoE |
| mradermacher/gemma-4-26B-A4B-agentic-GGUF | 25,2B | ~4B | no disponible | apache-2.0 | GGUF (estático) | Mismo modelo, cuantizaciones estáticas y mmproj de visión |
| ManniX-ITA/gemma-4-26B-A4B-agentic | 25,2B | ~4B | no disponible | apache-2.0 | safetensors | Modelo base sin cuantizar |
| Gemma 4 26B-A4B (base, sin fine-tuning) | 25,2B | ~4B | no disponible | no disponible | no disponible | No se dispone de datos comparativos de rendimiento |

No se dispone de benchmarks ni de datos de rendimiento de modelos alternativos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- El idioma declarado es únicamente inglés; el soporte multilingüe es incierto pese al dataset Nemotron Multilingual.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento y código; no hay evaluaciones publicadas que lo cuantifiquen.
- Las cuantizaciones muy bajas (IQ1, IQ2, Q2_K_S) degradan notablemente la calidad; el propio autor las etiqueta como "for the desperate" o "very low quality".
- El contexto máximo no está documentado en la información disponible; conviene verificarlo en el modelo base antes de usarlo en producción.
- Aunque la licencia es apache-2.0, deben respetarse las condiciones de la licencia del modelo base Gemma 4 y de los datasets de entrenamiento (algunos Nemotron pueden tener términos propios).
- El fine-tuning agéntico puede inducir un sesgo hacia el uso de herramientas y formatos específicos (Hermes, Nemotron); la integración con otros formatos de tool calling puede requerir ajustes de prompt.
- No hay información sobre sesgos demográficos o culturales del fine-tuning.
- El repositorio ocupa 301 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face (esta versión): https://huggingface.co/mradermacher/gemma-4-26B-A4B-agentic-i1-GGUF
- Repositorio de cuantizaciones estáticas y mmproj: https://huggingface.co/mradermacher/gemma-4-26B-A4B-agentic-GGUF
- Modelo base: https://huggingface.co/ManniX-ITA/gemma-4-26B-A4B-agentic
- Dataset SFT del autor: https://huggingface.co/datasets/ManniX-ITA/gemma-4-26B-A4B-agentic-sft
- Trazas Hermes/Kimi: https://huggingface.co/datasets/ManniX-ITA/hermes-agent-kimi-traces-gemma4-31b
- Página de descargas del cuantizador: https://hf.tst.eu/model#gemma-4-26B-A4B-agentic-i1-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
