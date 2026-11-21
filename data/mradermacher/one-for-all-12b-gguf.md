# mradermacher/One-For-All-12B-GGUF

## Resumen

One-For-All-12B-GGUF es la versión cuantizada en formato GGUF del modelo TendieLabs/One-For-All-12B, un modelo de lenguaje de aproximadamente 11.900 millones de parámetros construido sobre la arquitectura Gemma 4 y ajustado mediante LoRA para tareas de personificación (persona) y roleplay. El modelo está etiquetado como fan-model y hace referencia explícita al universo de My Hero Academia, lo que sugiere un ajuste fino orientado a encarnar personajes o estilos conversacionales de esa franquicia. La cuantización corre a cargo de mradermacher, un actor habitual en el ecosistema de publicación de pesos GGUF para inferencia local.

El modelo resuelve el problema de desplegar un modelo conversacional de 12B en hardware de consumo mediante una batería de cuantizaciones estáticas (desde Q2_K hasta Q8_0, más variantes IQ) que reducen el peso en disco desde aproximadamente 12,8 GB en Q8_0 hasta 4,9 GB en Q2_K. Incluye además ficheros mmproj (f16 y Q8_0) que apuntan a capacidades multimodales heredadas del modelo base Gemma 4.

Es relevante ahora porque combina una base reciente (Gemma 4) con un ajuste LoRA especializado en roleplay, y porque la licencia declarada es Apache 2.0 (con enlace a la licencia de Gemma 4), lo que facilita su uso comercial dentro de los términos de dicha licencia. No obstante, la información pública disponible sobre el modelo original es muy escasa: no se detallan datos de entrenamiento, contexto ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4, según tags del modelo) |
| Parámetros totales | 11.907.350.576 (≈11,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16 (mmproj), Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; variantes imatrix en el repo i1-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (con enlace a la licencia de Gemma 4) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es un transformer derivado de Gemma 4, según los tags del repositorio (`gemma4`). El modelo original TendieLabs/One-For-All-12B se ha ajustado mediante LoRA, tal y como indican los tags `lora`, `persona` y `roleplay`, orientado a la personificación de personajes del universo My Hero Academia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO.

La innovación técnica destacable en esta ficha es la propia cuantización: mradermacher publica cuantizaciones estáticas con `quantize_version: 2` y `output_tensor_quantised: 1`, e incluye ficheros `mmproj` que sugieren que el modelo base conserva un proyector multimodal (visión) heredado de Gemma 4. También se ofrece un repositorio paralelo con cuantizaciones ponderadas/imatrix (`One-For-All-12B-i1-GGUF`). No se documentan innovaciones de decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con especialización en roleplay y encarnación de personajes (persona).
- Capacidades multimodales potenciales: la presencia de ficheros `mmproj` indica soporte de entrada de imagen heredado de Gemma 4, aunque no se detalla su alcance.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Roleplay y personificación de personajes: el ajuste LoRA sobre Gemma 4 está específicamente orientado a mantener la voz y el estilo de personajes de My Hero Academia, por lo que encaja en aplicaciones de chat narrativo y ficción interactiva.
- Chatbots de entretenimiento en local: con cuantizaciones Q4_K_M (7,5 GB) o Q5_K_M (8,6 GB) el modelo cabe en GPUs de consumo de 12-16 GB, permitiendo desplegar un asistente conversacional especializado sin depender de la nube.
- Prototipado de experiencias de ficción interactiva: la ventana de contexto no está documentada, pero el tamaño de 12B permite gestionar conversaciones multi-turno razonablemente largas en cuantizaciones Q6_K o Q8_0.
- Investigación sobre ajuste LoRA y personificación: el modelo sirve como caso de estudio de cómo un LoRA sobre una base Gemma 4 modifica el comportamiento conversacional, comparándolo con el modelo base.
- Evaluación de cuantizaciones: el repositorio ofrece un abanico amplio (Q2_K a Q8_0, más IQ4_XS e imatrix) que permite medir la degradación de calidad en tareas de roleplay según el nivel de cuantización.
- Despliegue en entornos con restricciones de VRAM: la variante Q2_K (4,9 GB) permite ejecutar el modelo en GPUs de 6-8 GB o incluso en CPU con llama.cpp, a costa de una pérdida de calidad notable.
- Integración en pipelines de inferencia local: al ser GGUF, es compatible con llama.cpp, Ollama y otros runners que aceptan este formato, lo que facilita su incorporación en herramientas de escritorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según tamaño del fichero GGUF más overhead de contexto):
  - Q2_K: ~5-6 GB
  - Q3_K_M: ~6-7 GB
  - Q4_K_M: ~8-9 GB
  - Q5_K_M: ~9-10 GB
  - Q6_K: ~10-11 GB
  - Q8_0: ~13-14 GB
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M; RTX 4090 24 GB o A100/H100 para Q8_0 y f16.
- Cabe en GPU de consumo: sí, en Q4_K_M y superiores en GPUs de 12-16 GB; Q2_K y Q3_K en GPUs de 6-8 GB.
- Opciones de despliegue: llama.cpp, Ollama, y runners compatibles con GGUF; el modelo base usa transformers. No se documenta soporte específico de vLLM o TGI para esta versión GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| One-For-All-12B-GGUF | ≈11,9B | no disponible | apache-2.0 (Gemma 4) | GGUF | Roleplay/persona, fan-model |
| TendieLabs/One-For-All-12B | ≈11,9B | no disponible | apache-2.0 (Gemma 4) | safetensors | Modelo base sin cuantizar |
| Gemma 4 (base) | no disponible | no disponible | Gemma 4 license | safetensors/GGUF | Base generalista multilingüe |
| Otros GGUF de 12B (p. ej. Mistral-Nemo-12B) | ≈12B | variable | Apache 2.0 | GGUF | Alternativa generalista, no especializada en roleplay |

La comparativa con alternativas de la misma categoría (modelos de roleplay de ~12B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado y etiquetado únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Al ser un fan-model de My Hero Academia, puede reproducir sesgos, estilos y contenidos asociados a la franquicia, incluidos posibles problemas de derechos de autor sobre personajes.
- Riesgo de alucinación inherente a los modelos de 12B, especialmente en cuantizaciones bajas (Q2_K, Q3_K) donde la perplejidad aumenta.
- La licencia declarada es Apache 2.0, pero el enlace apunta a la licencia de Gemma 4; conviene verificar los términos exactos de uso comercial de la base Gemma 4 antes de desplegar en producción.
- No se documentan la longitud de contexto ni el comportamiento en conversaciones largas, lo que impide garantizar estabilidad en contextos extensos.
- El ajuste LoRA para roleplay puede degradar capacidades generales (razonamiento, código, matemáticas) respecto al modelo base Gemma 4.
- No hay información sobre tool calling ni soporte de agentes, por lo que no se recomienda para pipelines que dependan de function calling.
- El tamaño del repositorio (83,7 GB) incluye todas las cuantizaciones; descargar solo el fichero GGUF deseado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/One-For-All-12B-GGUF
- Modelo base: https://huggingface.co/TendieLabs/One-For-All-12B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/One-For-All-12B-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#One-For-All-12B-GGUF
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
