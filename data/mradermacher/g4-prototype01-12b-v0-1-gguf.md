# mradermacher/G4-Prototype01-12B-v0.1-GGUF

## Resumen

El modelo `mradermacher/G4-Prototype01-12B-v0.1-GGUF` es una cuantización en formato GGUF del modelo base `12B-Suite/G4-Prototype01-12B-v0.1`, un LLM abierto de aproximadamente 12 mil millones de parámetros. El autor de la cuantización, mradermacher, se dedica a generar versiones cuantizadas de modelos open source para facilitar su ejecución en hardware de consumo, y este repositorio contiene múltiples niveles de cuantización (Q2_K, Q3_K, Q4_K, Q5_K, Q6_K, Q8_0, IQ4_XS, F16) que permiten ajustar el equilibrio entre calidad y uso de memoria.

El modelo base fue desarrollado por el equipo 12B-Suite, aunque no se proporcionan detalles sobre su arquitectura, entrenamiento o licencia en la información disponible. La cuantización es una conversión estática de los pesos originales, lo que significa que no se ha realizado ningún ajuste adicional sobre el modelo base. Su relevancia radica en que ofrece una opción de 12B ejecutable en GPUs con 24 GB de VRAM, un tamaño intermedio entre modelos más pequeños y los grandes de 70B, aunque la falta de documentación técnica limita su evaluación rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | ~12 mil millones (estimado por el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors no incluido en este repositorio) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base (si es transformer denso, MoE, SSM, etc.) ni sobre su proceso de entrenamiento. La model card del repositorio de cuantización solo indica que se trata de "static quants" del modelo original, sin aportar detalles sobre el dataset, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. La única referencia externa encontrada menciona un finetune experimental con 22 pares de preguntas y respuestas sobre "dark psychology" a una tasa de aprendizaje de 2e-4 durante 3 épocas, pero esto no forma parte del modelo cuantizado y no es información oficial.

## Capacidades

No se han publicado capacidades específicas para este modelo. Al ser una cuantización de un LLM de 12B, se espera que pueda realizar tareas genéricas de generación de texto, razonamiento y posiblemente código, pero no hay documentación que lo confirme. No se dispone de datos sobre tool calling, soporte de agentes, capacidades multimodales o multilingüismo. Se recomienda tratar esta ficha como incompleta y consultar el repositorio original si se necesita información fiable.

## Casos de uso

Dado que no hay información oficial sobre el modelo base, los casos de uso son hipotéticos y basados en el tamaño y formato:

- Inferencia local en hardware de consumo: gracias a las cuantizaciones GGUF, el modelo puede ejecutarse en GPUs con 8-24 GB de VRAM mediante llama.cpp u Ollama, lo que permite experimentar con un LLM de 12B sin infraestructura cloud.
- Prototipado rápido de aplicaciones de chat: con un contexto desconocido pero presumiblemente estándar (4K-8K), podría usarse para chatbots simples en entornos de desarrollo.
- Evaluación de calidad de cuantización: los distintos niveles (Q2_K a Q8_0) permiten comparar la degradación de rendimiento frente al modelo original, útil para investigadores que estudian el impacto de la cuantización.
- Fine-tuning posterior: al ser un modelo abierto (aunque sin licencia especificada), podría servir como base para ajuste fino en tareas concretas, siempre que se respete la licencia original (desconocida).
- Despliegue en entornos con restricciones de memoria: las versiones Q2_K o Q3_K reducen el requisito de VRAM a unos 6-8 GB, permitiendo su uso en portátiles con GPUs modestas.
- Integración en pipelines de generación de texto: mediante servidores compatibles con GGUF (llama.cpp server, text-generation-webui), puede integrarse en flujos de trabajo automatizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estandarizadas para este modelo ni para su versión base. La página de LLM Explorer menciona que se pueden comparar benchmarks, pero no se han extraído valores concretos. Por tanto, no es posible evaluar su rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para un modelo de 12B, los requisitos aproximados son:
  - Q2_K: ~6-7 GB
  - Q3_K_M: ~7-8 GB
  - Q4_K_M: ~8-9 GB
  - Q5_K_M: ~9-10 GB
  - Q6_K: ~10-11 GB
  - Q8_0: ~12-13 GB
  - F16: ~24 GB (cabe en GPUs de 24 GB como RTX 3090/4090)
- GPU recomendadas: RTX 3060 12GB (para Q4_K_M o menor), RTX 3090/4090 (para Q8_0 o F16), o GPUs de datacenter como A10G o L4.
- Compatibilidad con consumer GPU: sí, las cuantizaciones Q2-Q5 caben en GPUs de 8-12 GB, y Q8_0 en GPUs de 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, LM Studio, o servidores compatibles con GGUF (llama.cpp server, llama-cpp-python).
- Latencia y throughput: no disponible. Depende del hardware y de la cuantización; en una RTX 4090 con Q4_K_M se puede esperar una velocidad de generación de 30-50 tokens/s, pero es una estimación no confirmada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas. El tamaño de 12B lo sitúa en la categoría de modelos como Mistral-7B, Llama-2-13B o Gemma-2-9B, pero sin datos de arquitectura, entrenamiento o benchmarks, cualquier comparación sería especulativa. Se recomienda consultar el repositorio original `12B-Suite/G4-Prototype01-12B-v0.1` para obtener información que permita una comparativa fundamentada.

## Limitaciones y advertencias

- No hay información sobre sesgos, alucinaciones o limitaciones de contexto del modelo base.
- La licencia es desconocida, lo que impide garantizar su uso comercial o incluso su redistribución. Se debe contactar con el autor original antes de cualquier uso productivo.
- La cuantización puede degradar la calidad de las respuestas, especialmente en niveles bajos como Q2_K.
- El modelo base no tiene documentación pública, por lo que su fiabilidad y seguridad no están evaluadas.
- No se ha verificado la procedencia de los datos de entrenamiento; podría contener contenido problemático (la referencia a "dark psychology" en un finetune experimental es una señal de alerta).
- Para producción, se recomienda encarecidamente buscar un modelo con documentación completa y licencia clara.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/mradermacher/G4-Prototype01-12B-v0.1-GGUF
- Repositorio del modelo base (sin cuantizar): https://huggingface.co/12B-Suite/G4-Prototype01-12B-v0.1
- Página de LLM Explorer con información del modelo base: https://llm-explorer.com/model/12B-Suite%2FG4-Prototype01-12B-v0.1,4mCqz7AlZKA7gXMURCb9ln
- Página de FriendliAI con detalles de inferencia: https://friendli.ai/models/12B-Suite/G4-Prototype01-12B-v0.1
- Perfil del autor de la cuantización: https://huggingface.co/mradermacher
