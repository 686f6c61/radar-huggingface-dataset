# mradermacher/Anthrobomination-70B-GGUF

## Resumen

Anthrobomination-70B-GGUF es la versión cuantizada en formato GGUF del modelo Mawdistical/Anthrobomination-70B, un modelo de lenguaje de gran escala (70.553.706.560 parámetros) orientado a generación de texto conversacional y roleplay de contenido explícito. La cuantización la realiza mradermacher, un conocido publicador de cuantizaciones GGUF en Hugging Face, a partir de los pesos originales del modelo base.

El modelo pertenece a la categoría de LLM densos de ~70B parámetros, un tamaño que típicamente corresponde a arquitecturas transformer derivadas de familias como LLaMA. Está etiquetado explícitamente como `nsfw`, `explicit`, `roleplay`, `mixed-AI` y `furry`, lo que delimita con claridad su propósito: conversación de rol para adultos, no tareas de propósito general ni uso profesional.

Su relevancia práctica es limitada fuera de ese nicho: no dispone de model card técnica detallada, no publica benchmarks, su licencia es CC BY-ND 4.0 (que restringe obras derivadas) y solo declara soporte para inglés. La ficha se centra, por tanto, en las características verificables de la cuantización y en las advertencias necesarias para cualquier evaluador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer denso, no confirmado en la información) |
| Parámetros totales | 70.553.706.560 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); versiones imatrix en repo i1-GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | CC BY-ND 4.0 (según license_link de la model card) |
| Formato de pesos | GGUF (cuantizaciones); modelo base en safetensors/transformers |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento, el volumen de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio GGUF es una plantilla estándar de mradermacher que solo documenta el proceso de cuantización, no las características del modelo original.

Lo único verificable es el proceso de cuantización: se generaron cuantizaciones estáticas (no imatrix) a partir de los pesos del modelo base en formato Hugging Face, con conversión a GGUF. Los tipos disponibles abarcan desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB), con Q6_K y Q8_0 divididos en dos partes por tamaño. Existe un repositorio separado con cuantizaciones ponderadas/imatrix (`mradermacher/Anthrobomination-70B-i1-GGUF`) que el autor recomienda para mayor calidad.

## Capacidades

- Generación de texto conversacional en inglés.
- Roleplay y narrativa interactiva, incluyendo contenido explícito para adultos.
- Conversación multi-turno (etiqueta `conversational`).
- Contenido temático furry y etiquetado como `mixed-AI`.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible.
- Capacidades multilingües: no, solo inglés declarado.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Roleplay conversacional para adultos: el modelo está entrenado y etiquetado específicamente para narrativa interactiva y personajes, con contenido explícito permitido. Su tamaño de 70B permite respuestas más coherentes en conversaciones largas que modelos pequeños del mismo nicho.
- Generación de ficción interactiva: escritura asistida de relatos ramificados donde el usuario toma decisiones, aprovechando la etiqueta `conversational` y el enfoque en narrativa.
- Simulación de personajes persistentes: despliegue local con llama.cpp u Ollama para mantener sesiones de rol privadas sin enviar datos a servicios en la nube, algo relevante dado el carácter explícito del contenido.
- Prototipado de interfaces de chat para comunidades de nicho: integración en frontends conversacionales mediante el endpoint compatible con la API de transformers que declara el repositorio.
- Investigación sobre modelos de rol y alineación: estudio de cómo modelos de gran escala manejan contenido NSFW y coherencia de personaje, siempre con las cautelas éticas correspondientes.
- Evaluación comparativa de cuantizaciones: uso de las distintas variantes (Q4_K_M, Q5_K_M, Q6_K, Q8_0) para medir la degradación de calidad en roleplay según el nivel de cuantización, dado que el autor proporciona gráficos de perplejidad de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de calidad de roleplay. Solo se ofrece un gráfico externo de perplejidad comparando tipos de cuantización (enlace en la model card), que mide degradación por cuantización, no capacidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K (26,5 GB): ~30-32 GB.
  - Q3_K_M (34,4 GB): ~38-40 GB.
  - Q4_K_M (42,6 GB): ~46-48 GB.
  - Q5_K_M (50,0 GB): ~54-56 GB.
  - Q6_K (58,0 GB): ~62-64 GB.
  - Q8_0 (75,1 GB): ~79-81 GB.
- GPU recomendadas: A100 80 GB o H100 para Q6_K/Q8_0; 2×RTX 4090 (24 GB cada una) o 2×A6000 para Q4_K_M con contexto moderado; A100 40 GB para Q3_K_M.
- ¿Cabe en consumer GPU? No en una sola. Las cuantizaciones Q2_K y Q3_K_S podrían caber en configuraciones multi-GPU de consumo (2×RTX 3090/4090) o mediante offload a RAM del sistema con llama.cpp, a costa de latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. El repositorio declara compatibilidad con endpoints, pero no se especifica el backend exacto.
- Latencia y throughput: no disponibles. En un 70B denso con Q4_K_M en 2×RTX 4090, es razonable esperar decenas de tokens por segundo, pero no hay mediciones publicadas en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Anthrobomination-70B-GGUF | 70,6B | no disponible | CC BY-ND 4.0 | Roleplay NSFW/furry | GGUF en HF |
| LLaMA 3.3 70B (referencia de tamaño) | 70B | 128K | Llama 3.3 Community License | Propósito general | Pesos y GGUF en HF |
| Midnight-Rose 70B (referencia de nicho roleplay) | 70B | variable | depende del modelo base | Roleplay NSFW | GGUF en HF |
| Modelos de rol de 7-13B (p. ej. familias Mistral fine-tuneadas) | 7-13B | variable | variable | Roleplay NSFW | GGUF en HF |

La comparación es aproximada: no hay benchmarks públicos de Anthrobomination que permitan contrastar calidad. Frente a LLaMA 3.3 70B, Anthrobomination no ofrece contexto declarado ni licencia permisiva para uso comercial. Frente a fine-tunes de rol de 7-13B, su ventaja es la mayor capacidad de coherencia a costa de requisitos de hardware muy superiores (más de 40 GB de VRAM en cuantizaciones prácticas).

## Limitaciones y advertencias

- Contenido explícito y NSFW: el modelo está diseñado para material para adultos; no es apto para menores ni para entornos laborales sin control.
- Licencia CC BY-ND 4.0: prohíbe obras derivadas y puede restringir el uso comercial; además, la model card no aclara los términos del modelo base original, lo que añade incertidumbre legal.
- Solo inglés declarado: no hay garantía de calidad en castellano ni en otros idiomas.
- Sin benchmarks ni model card técnica: imposible evaluar capacidad de razonamiento, código o matemáticas con datos fiables.
- Riesgo de alucinación: inherente a los LLM de este tamaño sin datos de alineación documentados; no hay información sobre RLHF o filtros de seguridad.
- Sesgos: no documentados; los datasets de roleplay NSFW suelen arrastrar sesgos de género y contenido estereotipado.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas sin conocer la ventana real del modelo base.
- Origen `mixed-AI`: la etiqueta sugiere mezcla de modelos o datos generados por IA, lo que puede implicar problemas de licencias de datos subyacentes no aclarados.
- Repositorio con pocas descargas (51) y 0 likes: comunidad mínima, sin validación independiente de calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Anthrobomination-70B-GGUF
- Modelo base: https://huggingface.co/Mawdistical/Anthrobomination-70B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Anthrobomination-70B-i1-GGUF
- Página de resumen del autor: https://hf.tst.eu/model#Anthrobomination-70B-GGUF
- Licencia CC BY-ND 4.0: https://creativecommons.org/licenses/by-nd/4.0/deed.en
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
