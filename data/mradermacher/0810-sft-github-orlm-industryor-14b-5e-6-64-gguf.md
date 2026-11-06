# mradermacher/0810-SFT-github-orlm-industryor-14B-5e-6-64-GGUF

## Resumen

Esta ficha describe la cuantización GGUF realizada por mradermacher del modelo base `OptShare/0810-SFT-github-orlm-industryor-14B-5e-6-64`, un modelo conversacional de aproximadamente 14.768 millones de parámetros (14,77B) entrenado en inglés mediante fine-tuning supervisado (SFT). El nombre del checkpoint sugiere un ajuste fino sobre un dataset derivado de GitHub y datos de tipo ORLM/industria, con hiperparámetros de entrenamiento reflejados en el sufijo (5e-6 de learning rate, batch efectivo 64), aunque no se ha publicado información técnica detallada sobre la composición exacta del dataset ni el proceso de alineación.

El modelo base no dispone de model card pública con detalles de arquitectura, contexto o benchmarks, y la licencia aparece como no disponible tanto en el repo del modelo base como en esta cuantización. Se trata, por tanto, de un checkpoint de origen poco documentado, probablemente experimental, orientado a conversación y generación de texto en inglés.

La contribución concreta de esta ficha es la cuantización: mradermacher publica 11 variantes GGUF estáticas (desde Q2_K de 5,9 GB hasta Q8_0 de 15,8 GB), lo que permite ejecutar un modelo de ~14,8B parámetros en hardware de consumo. Es relevante para desarrolladores que quieran evaluar el modelo base en local con llama.cpp u Ollama sin necesidad de GPUs de datacenter, aunque la falta de documentación sobre el modelo original limita seriamente su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, inferido por el pipeline conversacional y el formato transformers) |
| Parámetros totales | 14.768.307.200 (14,77B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base en safetensors |
| Modelo base | OptShare/0810-SFT-github-orlm-industryor-14B-5e-6-64 |
| Tamaño del repo | 102,0 GB |
| Descargas | 253 |
| Likes | 0 |
| Creado | 2025-08-15 |
| Actualizado | 2026-11-02 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base. Por el tamaño (14,77B parámetros), el pipeline conversacional y la librería `transformers`, se trata con alta probabilidad de un transformer decoder-only denso, pero no hay confirmación oficial ni detalles sobre número de capas, dimensiones ocultas, mecanismo de atención (MHA, GQA, MLA) o función de activación.

Respecto al entrenamiento, el nombre del checkpoint (`0810-SFT-github-orlm-industryor-14B-5e-6-64`) indica un fine-tuning supervisado (SFT) con learning rate 5e-6 y batch efectivo 64, sobre un dataset que combina datos de GitHub y posiblemente datos sintéticos de tipo ORLM (optimización de razonamiento) orientados a industria. No se documenta el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas posteriores de RLHF, DPO o alineación por preferencias. Tampoco se indica ninguna innovación técnica destacable (atención lineal, decodificación especulativa, modo thinking, etc.).

La cuantización de mradermacher se ha realizado con el formato GGUF estándar (quantize_version 2, output_tensor_quantised 1, convert_type hf). El autor indica que las cuantizaciones ponderadas con imatrix no están disponibles en el momento de publicación.

## Capacidades

- Generación de texto conversacional en inglés, con soporte multi-turno (tag `conversational`).
- Razonamiento y generación de código presumiblemente reforzados por el ajuste sobre datos de GitHub, aunque no hay evaluación publicada que lo confirme.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere que puede servirse mediante APIs compatibles con el estándar de Hugging Face.
- Ejecución local mediante llama.cpp y derivados (Ollama, LM Studio) gracias al formato GGUF.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling / function calling: no documentado.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades especiales (visión, audio, thinking mode): no documentadas.

## Casos de uso

- Evaluación local de modelos de 14B en hardware de consumo: las cuantizaciones Q4_K_M (9,1 GB) y Q5_K_M (10,6 GB) permiten probar el modelo en GPUs con 12-16 GB de VRAM, útil para experimentación e investigación sin infraestructura de datacenter.
- Prototipado de asistentes conversacionales en inglés: el tag `conversational` y el pipeline de transformers permiten integrarlo en demos de chat multi-turno mediante llama.cpp u Ollama, siempre que se asuma la falta de documentación sobre su calidad real.
- Generación de código asistida en entornos controlados: el ajuste sobre datos de GitHub sugiere cierta competencia en código, por lo que puede probarse como autocompletado o generación de snippets en pipelines internos, con revisión humana obligatoria.
- Fine-tuning posterior o experimentación académica: al ser un checkpoint SFT con hiperparámetros conocidos (lr 5e-6, batch 64), puede servir como punto de partida para estudios comparativos de ajuste fino, aunque la licencia no disponible es un riesgo legal.
- Despliegue en entornos air-gapped: el formato GGUF y la ejecución con llama.cpp permiten correr el modelo en máquinas sin conexión, útil para pruebas de concepto en sectores con restricciones de red.
- Benchmarking de cuantizaciones: el conjunto de 11 variantes (Q2_K a Q8_0) permite medir el impacto de la cuantización en perplejidad y latencia sobre un mismo modelo base, como ejercicio de evaluación de técnicas de compresión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del modelo base ni la de la cuantización incluyen datos de MMLU, HumanEval, GSM8K ni métricas de perplejidad para las distintas cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K (5,9 GB): ~7-8 GB de VRAM.
  - Q3_K_M (7,4 GB): ~9 GB.
  - Q4_K_M (9,1 GB): ~11 GB.
  - Q5_K_M (10,6 GB): ~12,5 GB.
  - Q6_K (12,2 GB): ~14 GB.
  - Q8_0 (15,8 GB): ~18 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M y Q5_K_M; RTX 4060 Ti 16 GB o RTX 3080 (10-12 GB) para Q3_K_M y Q4_K_S; A100/H100 solo si se necesita servir en FP16 o con alto throughput.
- Cabe en GPU de consumo: sí, desde Q2_K en GPUs de 8 GB hasta Q8_0 en GPUs de 24 GB.
- Opciones de despliegue: llama.cpp (referencia para GGUF), Ollama, LM Studio, llama-cpp-python, y servidores compatibles con endpoints de Hugging Face. vLLM y TGI no soportan GGUF de forma nativa, por lo que requerirían el modelo base en safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| 0810-SFT-github-orlm-industryor-14B-5e-6-64 (esta ficha) | 14,77B | no disponible | no disponible | GGUF, safetensors | Hugging Face, 253 descargas |
| Qwen2.5-14B-Instruct | 14,7B | 32.768 tokens (128K en variantes Turbo) | Apache 2.0 | safetensors, GGUF | Hugging Face, ampliamente adoptado |
| Mistral-Nemo-12B-Instruct | 12B | 128K tokens | Apache 2.0 | safetensors, GGUF | Hugging Face, ampliamente adoptado |
| Phi-3-medium-14B-Instruct | 14B | 4K tokens (128K en variantes) | MIT | safetensors, GGUF | Hugging Face |

La comparativa se limita a parámetros y disponibilidad porque no hay benchmarks publicados para el modelo de esta ficha. Frente a las alternativas citadas, la principal desventaja es la ausencia de licencia clara, contexto documentado y evaluación de calidad; la ventaja es la disponibilidad de cuantizaciones GGUF listas para usar en local.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial permitido. Es un riesgo legal bloqueante para producción.
- Model card del modelo base inexistente o sin contenido técnico: no hay información sobre dataset, contexto, arquitectura ni alineación.
- Idiomas: solo inglés documentado; el rendimiento en castellano es desconocido y probablemente deficiente.
- Riesgo de alucinación: sin datos de evaluación ni de alineación (RLHF/DPO), el riesgo es alto y no cuantificado.
- Sesgos: no documentados; el entrenamiento sobre datos de GitHub puede introducir sesgos de código y de dominio técnico.
- Contexto: longitud desconocida, lo que impide planificar su uso en tareas de contexto largo.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la perplejidad; el autor recomienda Q4_K_M o superior para uso real.
- Sin cuantizaciones imatrix: el autor indica que no están disponibles, por lo que la calidad por tamaño es inferior a la de modelos con quants ponderados.
- Trazabilidad: el nombre del checkpoint sugiere un experimento interno de OptShare sin documentación pública; no hay paper, blog ni demo asociados.
- Uso en producción: no recomendado sin una evaluación propia exhaustiva y sin aclaración de licencia.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/mradermacher/0810-SFT-github-orlm-industryor-14B-5e-6-64-GGUF
- Modelo base: https://huggingface.co/OptShare/0810-SFT-github-orlm-industryor-14B-5e-6-64
- Página de overview del autor para este modelo: https://hf.tst.eu/model#0810-SFT-github-orlm-industryor-14B-5e-6-64-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guía sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización del autor: https://huggingface.co/mradermacher/model_requests
- Web del patrocinador (nethype GmbH): https://www.nethype.de/
