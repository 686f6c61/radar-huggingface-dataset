# moltherm1/olmo-mirror-olmo-3-7b-instruct-dpo

## Resumen

Olmo 3 7B Instruct DPO es la etapa intermedia de post-entrenamiento (DPO sobre SFT) del modelo Instruct de 7B de la familia Olmo 3, desarrollada por el Allen Institute for AI (Ai2). Se trata de un espejo publicado por el usuario `moltherm1` del checkpoint oficial `allenai/Olmo-3-7B-Instruct-DPO`. El modelo parte de `allenai/Olmo-3-7B-Instruct-SFT` y aplica optimización directa de preferencias (DPO) sobre el dataset `allenai/Dolci-Think-DPO-7B`, lo que mejora la calidad y el alineamiento de las respuestas conversacionales respecto a la etapa SFT.

La familia Olmo 3 se caracteriza por ser completamente abierta: se publican pesos, código de entrenamiento, datasets (Dolma 3 para pre-entrenamiento y Dolci para post-entrenamiento) y detalles de entrenamiento. Está disponible en variantes de 7B y 32B, tanto Instruct como Think (con cadena de pensamiento larga). Este checkpoint concreto es la variante Instruct de 7B en fase DPO, pensada para uso conversacional general.

Es relevante porque ofrece un punto de control intermedio reproducible y auditable dentro del pipeline de post-entrenamiento de Ai2, útil para investigación sobre alineamiento, ablaciones de DPO y comparación de etapas SFT vs. DPO vs. RLVR. La arquitectura es un transformer autorregresivo, con licencia Apache 2.0 y orientado principalmente al inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (estilo decoder-only) |
| Parametros totales | 7B (aproximado, segun denominacion de la familia) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits via bitsandbytes (`load_in_8bit=True`); fp16 recomendado; otras cuantizaciones no documentadas |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 5.0 GB, libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer autorregresivo de tipo decoder-only, la misma arquitectura base que el resto de la familia Olmo 3. El checkpoint corresponde a la etapa DPO del pipeline de post-entrenamiento: parte de `allenai/Olmo-3-7B-Instruct-SFT` y se entrena con optimización directa de preferencias sobre el dataset `allenai/Dolci-Think-DPO-7B`. El pre-entrenamiento de la familia se realiza sobre Dolma 3 y el post-entrenamiento sobre los datasets Dolci.

El pipeline completo de Olmo 3 incluye etapas de SFT, DPO y RLVR (esta última da lugar a los modelos finales `Olmo-3-7B-Instruct`). Este checkpoint DPO es, por tanto, una instantánea intermedia antes del RLVR. El modelo usa una plantilla de chat con tokens especiales `<|im_start|>`, `<|im_end|>` y `<|endoftext|>`, y un mensaje de sistema por defecto orientado a function calling. La fecha de corte de conocimiento es diciembre de 2024. El código de entrenamiento está disponible en los repositorios Open-Instruct (DPO y RLVR) y OLMo-Core (pre-entrenamiento y SFT). No se detallan en la información disponible el número exacto de tokens de entrenamiento ni la composición pormenorizada del dataset DPO.

## Capacidades

- Generación de texto conversacional en inglés con formato de chat estructurado mediante plantilla de tokens especiales.
- Razonamiento matemático y resolución de problemas (mejora notable respecto a la etapa SFT en MATH y AIME, según la tabla de evaluación).
- Razonamiento general y tareas de sentido común (BigBenchHard).
- Soporte de function calling / tool calling: el mensaje de sistema por defecto declara un asistente de function calling con bloque `<functions></functions>`.
- Capacidad de integración en pipelines de transformers (versión 4.57.0 o superior).
- Cuantización a 8 bits para reducir requisitos de memoria.
- No se documentan capacidades de visión, audio ni modo thinking en este checkpoint concreto (el modo Think corresponde a las variantes Think de la familia).

## Casos de uso

- Investigación sobre alineamiento y DPO: comparar este checkpoint DPO con la etapa SFT y con el modelo final RLVR permite aislar el efecto de cada fase de post-entrenamiento en tareas de matemáticas y razonamiento.
- Asistente conversacional en inglés para prototipado: el modelo gestiona diálogos multi-turno con plantilla de chat definida y un system prompt configurable, adecuado para demos y pruebas de concepto.
- Evaluación de function calling: al incluir un bloque `<functions>` en la plantilla, sirve para experimentar con definición de herramientas y selección de llamadas en entornos de agentes.
- Generación aumentada por recuperación (RAG) en inglés: puede usarse como generador de respuestas sobre contexto recuperado, aunque la longitud de contexto no está documentada y debe validarse empíricamente.
- Base para fine-tuning específico de dominio: al estar bajo Apache 2.0 y en formato transformers, es un punto de partida razonable para ajuste supervisado en tareas concretas en inglés.
- Reproducibilidad de experimentos: al ser un espejo de un checkpoint oficial con datasets y código publicados, permite replicar análisis de la curva SFT → DPO → RLVR.
- Evaluación comparativa de modelos abiertos de 7B-8B: útil como referencia en benchmarks de matemáticas y razonamiento frente a Qwen, Granite u Olmo 2.

## Benchmarks y rendimiento

Datos de la model card (modelo evaluado: Olmo 3 Instruct 7B DPO):

| Skill | Benchmark | Olmo 3 Instruct 7B SFT | Olmo 3 Instruct 7B DPO | Olmo3 Instruct 7B | Qwen 3 8B (no reasoning) | Qwen 3 VL 8B Instruct | Qwen 2.5 7B | Olmo 2 7B Instruct | Apertus 8B Instruct | Granite 3.3 8B Instruct |
|---|---|---|---|---|---|---|---|---|---|---|
| Math | MATH | 65.1 | 79.6 | 87.3 | 82.3 | 91.6 | 71.0 | 30.1 | 21.9 | 67.3 |
| Math | AIME 2024 | 6.7 | 23.5 | 44.3 | 26.2 | 55.1 | 11.3 | 1.3 | 0.5 | 7.3 |
| Math | AIME 2025 | 7.2 | 20.4 | 32.5 | 21.7 | 43.3 | 6.3 | 0.4 | 0.2 | 6.3 |
| Math | OMEGA | 14.4 | 22.8 | 28.9 | 20.5 | 32.3 | 13.7 | 5.2 | 5.0 | 10.7 |
| Reasoning | BigBenchHard | 51.0 | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto | no disponible en el extracto |

El extracto de la model card se interrumpe en la fila de BigBenchHard, por lo que el resto de resultados no están disponibles en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 14-16 GB en fp16 para 7B parámetros; alrededor de 7-8 GB en cuantización de 8 bits (bitsandbytes); en 4 bits se reduciría aún más, aunque no está documentado oficialmente.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue en fp16 con margen y mayor throughput; L40S o RTX A6000 como alternativas profesionales.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 y en GPUs de 12-16 GB con cuantización de 8 bits o inferior.
- Opciones de despliegue: transformers (>= 4.57.0) es el soporte oficial documentado; bitsandbytes para cuantización. No se confirma soporte explícito de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH | AIME 2024 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Olmo 3 7B Instruct DPO (este) | 7B | no disponible | 79.6 | 23.5 | Apache 2.0 | Hugging Face |
| Olmo3 Instruct 7B (final, RLVR) | 7B | no disponible | 87.3 | 44.3 | Apache 2.0 | Hugging Face |
| Qwen 3 8B (no reasoning) | 8B | no disponible | 82.3 | 26.2 | no disponible en la informacion | Hugging Face |
| Qwen 2.5 7B | 7B | no disponible | 71.0 | 11.3 | no disponible en la informacion | Hugging Face |
| Olmo 2 7B Instruct | 7B | no disponible | 30.1 | 1.3 | Apache 2.0 (familia Olmo) | Hugging Face |
| Granite 3.3 8B Instruct | 8B | no disponible | 67.3 | 7.3 | no disponible en la informacion | Hugging Face |

El checkpoint DPO supera claramente a la etapa SFT y a Olmo 2 7B Instruct, y queda por debajo del modelo final RLVR de la misma familia y de Qwen 3 8B en matemáticas.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado ni evaluado.
- Es un checkpoint intermedio (DPO), no el modelo final: el modelo RLVR de la misma familia obtiene mejores resultados (por ejemplo, 87.3 frente a 79.6 en MATH y 44.3 frente a 23.5 en AIME 2024).
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- Sesgos: no se publica información sobre sesgos evaluados en la información disponible.
- Longitud de contexto no documentada; debe validarse antes de usarla en producción con contextos largos.
- Fecha de corte de conocimiento: diciembre de 2024.
- Licencia Apache 2.0 permite uso comercial, pero Ai2 indica que el modelo está destinado a investigación y uso educativo conforme a sus Responsible Use Guidelines.
- Es un espejo publicado por un tercero (`moltherm1`), no el repositorio oficial de Ai2; conviene verificar integridad y procedencia antes de usarlo en producción.
- La cuantización de 8 bits puede ser sensible a tipos de datos y operaciones CUDA; la model card recomienda pasar las entradas directamente a CUDA.
- El extracto de benchmarks está incompleto, por lo que no se puede evaluar el rendimiento en razonamiento general (BigBenchHard) ni en otras tareas.

## Enlaces

- Hugging Face (este checkpoint): https://huggingface.co/moltherm1/olmo-mirror-olmo-3-7b-instruct-dpo
- Modelo base SFT: https://huggingface.co/allenai/Olmo-3-7B-Instruct-SFT
- Checkpoint DPO oficial: https://huggingface.co/allenai/Olmo-3-7B-Instruct-DPO
- Modelo final Instruct (RLVR): https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Modelo base de pre-entrenamiento: https://huggingface.co/allenai/Olmo-3-1025-7B
- Variante Think 7B SFT: https://huggingface.co/allenai/Olmo-3-7B-Think-SFT
- Variante Think 7B DPO: https://huggingface.co/allenai/Olmo-3-7B-Think-DPO
- Variante Think 7B final: https://huggingface.co/allenai/Olmo-3-7B-Think
- Variante 32B base: https://huggingface.co/allenai/Olmo-3-1125-32B
- Variante 32B Think SFT: https://huggingface.co/allenai/Olmo-3-32B-Think-SFT
- Variante 32B Think DPO: https://huggingface.co/allenai/Olmo-3-32B-Think-DPO
- Variante 32B Think final: https://huggingface.co/allenai/Olmo-3-32B-Think
- Pagina del proyecto Olmo: https://allenai.org/olmo
- Repositorio Open-Instruct (DPO y RLVR): https://github.com/allenai/open-instruct
- Repositorio OLMo-Core (pre-entrenamiento y SFT): https://github.com/allenai/OLMo-core
- Repositorio OLMo-Eval: https://github.com/allenai/OLMo-Eval
- Guias de uso responsable de Ai2: https://allenai.org/responsible-use
- Paper: pendiente de publicacion (TBD) segun la model card
- arXiv referenciado en los tags: arxiv:2512.13961
