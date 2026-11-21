# mradermacher/MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF

## Resumen

MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF es la versión cuantizada en formato GGUF de un modelo de lenguaje de aproximadamente 8.950 millones de parámetros (8,95 B), publicado por el usuario mradermacher. El modelo original, OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-HQ, es un merge derivado de la familia Qwen 3.5, con las técnicas de "abliteration" y "AGSÍ" aplicadas para eliminar los mecanismos de rechazo del modelo base. Esta versión GGUF facilita la ejecución local en hardware de consumo mediante llama.cpp y Ollama, y también es compatible con vLLM.

El modelo está etiquetado para tareas de razonamiento, generación de código, uso agéntico y uso de terminal (terminal-use), y se distribuye sin censura ("uncensored"). Soporta únicamente inglés y chino, con una licencia Apache 2.0 que permite uso comercial. Su relevancia radica en ofrecer un modelo de ~9 B con capacidades agénticas y de código en un formato listo para desplegar en local, aunque con las advertencias propias de los modelos "abliterated" (pérdida de alineación de seguridad).

La información disponible sobre arquitectura, contexto y entrenamiento es muy limitada: la model card del cuantizador no incluye estos detalles, por lo que varios parámetros se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen 3.5, según tags); detalles no disponibles |
| Parámetros totales | 8.953.803.264 (~8,95 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); modelo base en safetensors |
| Tamaño del repo | 81,4 GB |
| Modelo base | OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-HQ |
| Cuantizador | mradermacher |
| Descargas / likes | 772 / 2 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Los tags del modelo indican que deriva de Qwen 3.5 ("qwen3_5") y que es un "merge" con modificaciones de tipo "abliterated" y "AGSÍ"/"Abliterix". La técnica de abliteration consiste en eliminar direcciones de activación asociadas al rechazo de peticiones, lo que produce un modelo menos restrictivo pero potencialmente menos alineado.

El modelo base fue publicado por OliviaRossi y mradermacher se limita a generar cuantizaciones estáticas en GGUF. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información proporcionada.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento (tag "reasoning").
- Generación de código (tag "coding").
- Uso agéntico y multi-step reasoning (tag "agentic").
- Uso de terminal / terminal-use (tag "terminal-use").
- Modelo sin censura ("uncensored"), sin mecanismos de rechazo tras la abliteration.
- Compatibilidad con vLLM y llama.cpp (tags).
- No se documenta soporte explícito de tool calling, visión, audio ni modo "thinking"; no disponible.

## Casos de uso

- Asistencia de código en local: el modelo puede integrarse en editores o pipelines de CI/CD para autocompletado y generación de parches, ejecutándose con llama.cpp u Ollama en una GPU de consumo gracias a sus cuantizaciones de 5-7 GB.
- Automatización de tareas de terminal: con la etiqueta terminal-use, puede emplearse en agentes que generan y ejecutan comandos de shell en entornos controlados, siempre con supervisión humana.
- Agentes multi-paso: para flujos de razonamiento encadenado en inglés o chino, como resolución de incidencias o planificación de tareas.
- Prototipado de chatbots sin restricciones: útil en investigación sobre alineación y seguridad, donde se necesita un modelo que no rechace peticiones para estudiar comportamientos.
- Procesamiento de documentación técnica bilingüe (en/zh): resúmenes y extracción de información de manuales o repositorios en ambos idiomas.
- Experimentación académica con modelos abliterated: comparación de degradación de capacidades y sesgos frente al modelo base alineado.
- Despliegue en estaciones de trabajo sin GPU dedicada: las cuantizaciones Q2_K (3,9 GB) y Q3 permiten inferencia en CPU con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: Q2_K ~3,9 GB; Q3_K_S ~4,4 GB; Q4_K_M ~5,7 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18,0 GB (más overhead de contexto).
- GPU recomendadas: RTX 3060 12 GB o RTX 4070 para Q4-Q5; RTX 4090 o A100/H100 para Q8_0 y f16.
- Cabe en GPU de consumo: sí, desde 6-8 GB de VRAM con Q4_K_M o Q5_K_M; Q8_0 requiere ~10-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (tag), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF | ~8,95 B | no disponible | Apache 2.0 | GGUF | Merge abliterated de Qwen 3.5, sin censura |
| Qwen 3.5 (base, ~9 B) | ~9 B | no disponible | no disponible | safetensors/GGUF | Modelo alineado original; comparación directa por linaje |
| Modelos abliterated de la comunidad (p. ej. variantes Qwen) | variable | variable | variable | GGUF | Misma técnica de eliminación de rechazo; calidad variable |

No se dispone de datos de benchmarks para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Modelo "abliterated": se han eliminado los mecanismos de rechazo, por lo que puede generar contenido dañino, ilegal o inseguro; no recomendado para producción orientada al público sin filtros adicionales.
- Riesgo elevado de alucinación, como en cualquier modelo de ~9 B, agravado por la falta de datos de evaluación.
- Soporte limitado a inglés y chino; el rendimiento en castellano no está garantizado.
- Longitud de contexto no documentada; no asumir ventanas largas sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado.
- El repositorio GGUF es una cuantización de terceros; no hay garantía del autor original sobre la integridad del merge.
- Solo 772 descargas y 2 likes: comunidad pequeña, poca validación independiente.
- El tamaño del repo (81,4 GB) incluye todas las cuantizaciones; descargar solo el archivo necesario.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/mradermacher/MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/MiMo-Ornith-9B-AGSI-Abliterated-HQ
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/MiMo-Ornith-9B-AGSI-Abliterated-HQ-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#MiMo-Ornith-9B-AGSI-Abliterated-HQ-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
