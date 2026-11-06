# mradermacher/Mythos-Nano-safetensor-GGUF

## Resumen

Mythos-Nano-safetensor-GGUF es la versión cuantizada en formato GGUF del modelo Mythos-Nano-safetensor, desarrollado originalmente por el usuario orangejuicesmith y publicada por mradermacher, un conocido creador de cuantizaciones para la comunidad. El modelo base es un transformer denso de aproximadamente 3.085 millones de parámetros (3,08 B) construido sobre la arquitectura Qwen2, orientado a tareas de razonamiento, matemáticas y generación de código, y distribuido bajo licencia MIT.

Esta ficha se centra en la versión GGUF, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles, con cuantizaciones que van desde Q2_K (1,4 GB) hasta f16 (6,3 GB). El modelo está pensado para desarrolladores que necesitan un modelo compacto de razonamiento y código que quepa en GPU de gama media o incluso en CPU con memoria RAM suficiente.

La relevancia actual de esta publicación reside en su licencia permisiva (MIT) y su tamaño reducido, que lo sitúan como una alternativa ligera para entornos con restricciones de hardware, aunque la información pública sobre su entrenamiento, contexto y rendimiento es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso basado en Qwen2 |
| Parámetros totales | 3.085.938.688 (3,08 B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen2, un transformer decoder-only denso con atención causal estándar y normalización RMSNorm, según se desprende de la etiqueta `qwen2` incluida en la model card. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. La model card del repositorio cuantizado no incluye detalles sobre el proceso de entrenamiento del modelo original.

La versión aquí descrita es una cuantización estática realizada por mradermacher, que convierte los pesos originales en safetensors a formato GGUF con distintos niveles de precisión. No se han publicado cuantizaciones ponderadas (imatrix) para este modelo según la propia model card, lo que implica que las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden presentar una degradación de calidad mayor que las equivalentes con imatrix.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y resolución de problemas matemáticos (etiquetas `reasoning` y `math`).
- Generación y asistencia en código (etiqueta `code`).
- Compatible con endpoints de inferencia estándar (etiqueta `endpoints_compatible`).
- Soporte de conversación multi-turno (etiqueta `conversational`).
- No se ha documentado soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en editores o terminales mediante llama.cpp u Ollama para autocompletar y explicar fragmentos de código, aprovechando su tamaño reducido (2 GB en Q4_K_M) para ejecutarse en portátiles con GPU de 4-8 GB.
- Resolución de problemas matemáticos paso a paso: adecuado para herramientas educativas o de autoaprendizaje que necesiten un modelo ligero capaz de razonar sobre ejercicios de aritmética y álgebra, ejecutable en CPU.
- Prototipado rápido de chatbots: gracias a su licencia MIT y su formato GGUF, se puede desplegar un chatbot conversacional en inglés en entornos de desarrollo sin coste de licencia ni infraestructura dedicada.
- Inferencia en dispositivos con recursos limitados: con cuantizaciones Q2_K o Q3_K_S (1,4-1,6 GB) puede ejecutarse en Raspberry Pi 5 o mini-PC con 8 GB de RAM, útil para demos y pruebas de concepto.
- Generación de texto en pipelines de CI/CD: el modelo puede emplearse para tareas de resumen, generación de documentación técnica o revisión de código en inglés dentro de flujos automatizados, siempre que la latencia no sea crítica.
- Fine-tuning ligero o experimentación académica: al ser un modelo de 3 B con licencia MIT, sirve como base para experimentos de ajuste fino o investigación sobre razonamiento en modelos pequeños, aunque no se han publicado recetas de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB (Q2_K), 2,2 GB (Q4_K_M), 3,6 GB (Q8_0) y 6,5 GB (f16), incluyendo overhead de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para mayor throughput; cualquier GPU con al menos 4 GB de VRAM puede ejecutar cuantizaciones Q4.
- Cabe en GPU de consumo: sí, en RTX 3050 8 GB, RTX 3060, RTX 4060, RX 6600 y superiores; también en iGPU con memoria unificada suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de los pesos originales.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Mythos-Nano-safetensor-GGUF | 3,08 B | No disponible | MIT | GGUF | Hugging Face |
| Qwen2.5-3B-Instruct | 3,09 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, Ollama |
| Llama-3.2-3B-Instruct | 3,21 B | 131 072 tokens | Llama 3.2 Community License | safetensors, GGUF | Hugging Face, Ollama |
| Phi-3.5-mini-instruct | 3,82 B | 131 072 tokens | MIT | safetensors, GGUF | Hugging Face, Ollama |

La comparativa se basa en características públicas de modelos de tamaño similar; no se dispone de datos de rendimiento de Mythos-Nano para comparar benchmarks. Qwen2.5-3B y Llama-3.2-3B ofrecen contextos documentados muy superiores y ecosistemas más maduros, mientras que Phi-3.5-mini comparte licencia MIT y un tamaño ligeramente mayor.

## Limitaciones y advertencias

- Información de entrenamiento no disponible: se desconoce la composición del dataset, los tokens vistos y si hubo alineación, lo que dificulta evaluar sesgos y calidad.
- Riesgo de alucinación: al no haber benchmarks publicados ni documentación sobre RLHF, no se puede estimar la fiabilidad factual del modelo.
- Limitación idiomática: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas es incierto y probablemente deficiente.
- Contexto desconocido: no se ha publicado la longitud de contexto, lo que impide garantizar conversaciones largas o procesamiento de documentos extensos.
- Cuantizaciones sin imatrix: las versiones Q2_K y Q3_K pueden degradar notablemente la calidad al no emplearse cuantización ponderada.
- Licencia MIT: permite uso comercial sin restricciones, pero el usuario debe verificar que el modelo base no incluya componentes con otras licencias (no documentado).
- Sin soporte documentado de tool calling ni agentes: no es adecuado para pipelines que requieran function calling estructurado sin validación previa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria prácticamente inexistentes.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Mythos-Nano-safetensor-GGUF
- Modelo base: https://huggingface.co/orangejuicesmith/Mythos-Nano-safetensor
- Página de conveniencia de mradermacher: https://hf.tst.eu/model#Mythos-Nano-safetensor-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
