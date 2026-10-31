# mradermacher/Gemma-4-Dark-Orthia-31B-GGUF

## Resumen

Gemma-4-Dark-Orthia-31B-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo Nimbz/Gemma-4-Dark-Orthia-31B, realizadas por el cuantizador mradermacher. El modelo base es un merge (fusión de modelos) creado con mergekit sobre la arquitectura Gemma-4, con unos 32,1 mil millones de parámetros totales (31B nominales). Está orientado a roleplay, escritura de personajes, narrativa creativa y conversación, con un perfil deliberadamente "dark" (oscuro), bajo número de negativas (low-refusal) y contenido para adultos (NSFW), por lo que el repositorio está marcado como "not-for-all-audiences".

La relevancia de esta ficha radica en el propio repositorio de cuantización: permite ejecutar un modelo de 31B en hardware de consumo gracias a versiones que van desde 12,5 GB (Q2_K) hasta 34,2 GB (Q8_0). Además, el modelo base incorpora la particularidad de tener el lm_head "untied" (desacoplado de la matriz de embeddings), una característica técnica señalada en los tags que puede afectar a la calidad de la generación. El idioma principal del modelo es el inglés.

Cabe destacar que existen también cuantizaciones weighted/imatrix de mayor calidad en un repositorio hermano (mradermacher/Gemma-4-Dark-Orthia-31B-i1-GGUF), recomendables para quien busque el mejor equilibrio entre tamaño y fidelidad al modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma-4), modelo merge creado con mergekit |
| Parametros totales | 32.106.631.740 (dato real de safetensors) |
| Parametros activos | No disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (más cuants F16 listados internamente) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio original en safetensors/transformers) |

## Arquitectura y entrenamiento

El modelo base, Nimbz/Gemma-4-Dark-Orthia-31B, es un merge creado con mergekit a partir de la arquitectura Gemma-4 de 31B. Un detalle técnico señalado en los metadatos es que el modelo usa lm_head untied, es decir, la matriz de proyección de salida no comparte pesos con la matriz de embeddings de entrada, lo que aumenta ligeramente el número de parámetros pero puede mejorar la calidad de la capa de salida en algunos merges. No hay información disponible sobre los modelos concretos que componen el merge ni sobre los pesos de la fusión.

Sobre el entrenamiento no se dispone de datos: no se publica el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. Dado que es un merge de modelos ajustados para roleplay y escritura creativa con bajo número de negativas, es razonable asumir que los modelos origen fueron fine-tuned sobre datos conversacionales y narrativos, pero esto no está documentado en la información disponible. El repositorio cuantizado en sí no modifica los pesos: se limita a convertirlos a GGUF con cuantización estática por bloques k-quant.

## Capacidades

- Generación de texto creativo: narrativa, storytelling y escritura de ficción, con especialización en tonos oscuros.
- Roleplay de personajes (character-rp): mantenimiento de personajes coherentes en conversaciones de rol.
- Conversación general: diálogo multi-turno orientado a chat.
- Bajo número de negativas (low-refusal): el modelo está ajustado para rechazar pocas peticiones, incluyendo contenido NSFW y temáticas para adultos.
- Uso local: al estar en GGUF, funciona con llama.cpp, Ollama, LM Studio, KoboldCpp y otros runtimes compatibles, incluyendo inferencia en CPU o GPU de consumo.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Capacidades multilingües: no disponible; el idioma declarado es únicamente inglés.
- Capacidades de visión o audio: no disponibles (el repo indica skip_mmproj, sin proyectores multimodales).

## Casos de uso

- Roleplay de personajes en interfaces locales: el modelo puede dar vida a personajes de ficción en plataformas como SillyTavern o KoboldCpp, ejecutándose en una GPU de consumo con el cuant Q4_K_M (19,6 GB).
- Escritura de novela o ficción oscura: útil como asistente de drafting para autores de género negro, terror o thriller, generando prosa con menos restricciones de contenido que los modelos comerciales alineados.
- Generación de diálogos para videojuegos: estudio indie que necesite diálogos de NPC con tonos maduros puede integrarlo localmente vía llama.cpp sin coste por token ni envío de datos a terceros.
- Chatbots narrativos offline: aplicaciones de conversación creativa que requieran privacidad total, aprovechando la licencia Apache 2.0 para uso comercial sin restricciones de licenciamiento.
- Prototipado de experiencias de ficción interactiva: gracias al tamaño contenido en cuants agresivos (Q2_K a 12,5 GB cabe en una RTX 3060 de 12 GB o incluso en CPU + RAM), es viable experimentar en portátiles.
- Evaluación comparativa de merges de roleplay: investigadores o creadores de modelos pueden usar las cuants estáticas e imatrix como base para comparar calidad de merges de la familia Gemma-4 en tareas de RP.
- Contenido para adultos con control local: creadores que necesiten generación de texto maduro sin filtros de plataforma, asumiendo la responsabilidad legal y ética del uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un merge orientado a roleplay y escritura creativa, el autor del modelo base no documenta puntuaciones en MMLU, HumanEval, GSM8K ni otras pruebas estándar. No inventes conclusiones de rendimiento a partir de la ausencia de datos.

## Requisitos de hardware

- VRAM estimada para inferencia (modelo completo en GPU):
  - Q2_K (12,5 GB): cabe en GPUs de 16 GB con margen para contexto.
  - Q3_K_M (16,0 GB) / IQ4_XS (17,7 GB): GPUs de 24 GB.
  - Q4_K_S (18,7 GB) / Q4_K_M (19,6 GB): GPUs de 24 GB (recomendados por el autor).
  - Q5_K_M (22,9 GB) / Q6_K (26,5 GB): GPUs de 24 GB justo, mejor 32 GB o 48 GB.
  - Q8_0 (34,2 GB): GPUs de 40-48 GB (A100 40GB no basta con contexto; ideal A100 80GB o 2x RTX 3090/4090 con offload).
- GPU recomendadas: RTX 3090, RTX 4090 (24 GB) para cuants Q3-Q5; RTX 5090 (32 GB) para Q6_K; A100 80 GB o H100 para Q8_0 a máxima velocidad.
- Consumer GPUs: sí. Con RTX 3060 12 GB es viable Q2_K; con RTX 3090/4090 24 GB, el rango Q3_K_M a Q5_K_S con buen rendimiento. En CPU con 32-64 GB de RAM es posible pero lento (del orden de pocos tokens/segundo para 31B en CPU moderna con DDR5).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, KoboldCpp (habitual en roleplay), text-generation-webui, Jan. No es un GGUF dirigido a vLLM o TGI, que requieren pesos safetensors.
- Latencia y throughput: no disponible; para un 31B en Q4_K_M sobre una RTX 4090, es típico esperar decenas de tokens/segundo, pero no hay cifras publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Orientacion |
|---|---|---|---|---|
| Gemma-4-Dark-Orthia-31B (este) | 32,1B | GGUF | Apache 2.0 | Roleplay, dark, low-refusal, NSFW |
| Mistral Small 3 (24B) | 24B | safetensors/GGUF | Apache 2.0 | Uso general, tool calling |
| Qwen2.5 32B | 32,5B | safetensors/GGUF | Apache 2.0 (base) / Qwen license (instruct) | General, codigo, matematicas |

Comparación: frente a Mistral Small 3 y Qwen2.5 32B, este modelo no está orientado a tareas de código, razonamiento o agentes, sino exclusivamente a narrativa y roleplay sin filtros. Su ventaja es la especialización creativa y la licencia Apache 2.0 sin restricciones; su desventaja es la ausencia de datos de benchmarks, de soporte documentado para tool calling y de idiomas distintos del inglés. Para roleplay local compite con otros merges de la comunidad (por ejemplo los basados en Mistral o Llama 3), pero no hay datos comparativos publicados: no disponible.

## Limitaciones y advertencias

- Contenido sensible: el modelo está etiquetado explícitamente como "not-for-all-audiences" y orientado a low-refusal y NSFW. Puede generar texto violento, oscuro o sexualmente explícito sin las salvaguardas habituales de los modelos alineados.
- Riesgo de alucinación: no documentado, pero al ser un merge orientado a ficción, no es fiable para hechos, datos o tareas de razonamiento factual.
- Idioma: solo se declara soporte de inglés; el rendimiento en castellano no está documentado y probablemente sea inferior o inconsistente.
- Contexto: la longitud de ventana de contexto no está publicada en la información disponible; verificarla en el modelo base antes de diseñar aplicaciones con documentos largos.
- Sin benchmarks ni evaluaciones publicadas: la calidad solo puede valorarse de forma anecdotica.
- Merge sin documentación: no se conocen los modelos origen ni los pesos del merge, lo que dificulta auditar sesgos heredados.
- Sesgos: al entrenarse/mergearse con datos de ficción oscura y NSFW, puede reproducir estereotipos y contenidos problemáticos; el despliegue en producción requiere filtros propios.
- Licencia: Apache 2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el usuario; revisar también la licencia del modelo base Nimbz/Gemma-4-Dark-Orthia-31B.
- Uso en producción: no recomendado para asistentes orientados a usuario final sin capas de moderación adicionales.

## Enlaces

- Repositorio de cuantización (esta ficha): https://huggingface.co/mradermacher/Gemma-4-Dark-Orthia-31B-GGUF
- Modelo base: https://huggingface.co/Nimbz/Gemma-4-Dark-Orthia-31B
- Cuants weighted/imatrix: https://huggingface.co/mradermacher/Gemma-4-Dark-Orthia-31B-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Gemma-4-Dark-Orthia-31B-GGUF
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
