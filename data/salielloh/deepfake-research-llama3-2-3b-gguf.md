# SaliElloh/deepfake-research-llama3.2-3b-GGUF

## Resumen

deepfake-research-llama3.2-3b-GGUF es un ajuste fino (fine-tune) del modelo Llama 3.2 3B Instruct de Meta, publicado por el usuario SaliElloh en formato GGUF para su uso con llama.cpp y otros runners compatibles. El repositorio contiene un único archivo cuantizado, `llama-3.2-3b-instruct.Q4_K_M.gguf`, junto con un Modelfile de Ollama, lo que indica que el objetivo declarado por el autor es facilitar el despliegue local del modelo en entornos de investigación.

El modelo tiene 3.212.749.888 parámetros totales según los metadatos de safetensors asociados al repositorio, y el repositorio ocupa 2,0 GB. Su nombre sugiere un fine-tune orientado a investigación sobre deepfakes y conversación, aunque la model card no documenta ni el dataset de ajuste ni el procedimiento de entrenamiento más allá de indicar que se usó Unsloth para el fine-tuning y la conversión a GGUF.

Su relevancia es limitada y muy específica: se trata de una publicación sin descargas ni likes, sin licencia declarada y sin resultados de benchmarks, por lo que debe evaluarse como un artefacto experimental de investigación más que como un modelo listo para producción. Es útil como ejemplo de pipeline Unsloth → GGUF y como base para experimentación en hardware de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Llama 3.2 3B Instruct (inferido del nombre del archivo; no confirmado explícitamente en la model card) |
| Parámetros totales | 3.212.749.888 (dato de los metadatos de safetensors) |
| Parámetros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Q4_K_M (único archivo publicado) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp); no se publican safetensors en este repositorio |

## Arquitectura y entrenamiento

La model card indica únicamente que el modelo fue ajustado y convertido a GGUF utilizando Unsloth, y que el comportamiento del token BOS se ajustó para garantizar la compatibilidad con GGUF. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT supervisado. Tampoco se detalla si se congelaron capas, qué hiperparámetros se usaron (learning rate, LoRA rank, épocas) ni la duración del entrenamiento. La afirmación "trained 2x faster with Unsloth" procede de la plantilla promocional de Unsloth y hace referencia a la eficiencia del framework de entrenamiento, no a una característica del modelo resultante.

Dado que el nombre del archivo es `llama-3.2-3b-instruct.Q4_K_M.gguf`, lo más probable es que se trate de un fine-tune sobre Llama 3.2 3B Instruct, un transformer decoder-only con atención agrupada (GQA) y tokenizador BPE. No obstante, la model card no confirma la arquitectura del modelo base ni sus características internas, por lo que cualquier detalle adicional sobre el modelo original (contexto, idiomas, licencia) debe consultarse en la documentación oficial de Meta y no en esta ficha.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el nombre del archivo `instruct` apuntan a un modelo optimizado para diálogo multi-turno.
- Inferencia local mediante llama.cpp: la model card proporciona el comando `llama-cli -hf SaliElloh/deepfake-research-llama3.2-3b-GGUF --jinja`.
- Inferencia multimodal con `llama-mtmd-cli`: la model card menciona este comando para modelos multimodales, pero no confirma que este checkpoint concreto procese imagen o audio. Debe tratarse como una plantilla genérica, no como una capacidad verificada.
- Despliegue sencillo con Ollama: el repositorio incluye un Modelfile.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede servirse a través de infraestructura de endpoints compatible con el formato de chat de Llama.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Investigación académica sobre deepfakes: el modelo puede emplearse como asistente conversacional local para resumir y discutir literatura técnica del dominio, con la ventaja de que un Q4_K_M de 3B se ejecuta íntegramente en una máquina de trabajo sin enviar datos a servicios externos.
- Anotación y preetiquetado de corpus textuales: al ser un modelo instruct pequeño y rápido, puede generar etiquetas o descripciones preliminares sobre grandes volúmenes de texto que después se revisan manualmente, reduciendo el coste de anotación humana.
- Prototipado de pipelines de NLP en local: sirve como componente de generación en pruebas de concepto donde no se dispone de GPU de datacenter, gracias a su tamaño de 2,0 GB en Q4_K_M.
- Base para fine-tuning adicional: al derivar de Llama 3.2 3B Instruct y estar ya en formato GGUF, puede usarse como referencia de comparación frente a nuevos ajustes, o su versión sin cuantizar como punto de partida para especializaciones posteriores.
- Asistente educativo sobre riesgos de medios sintéticos: útil en talleres o materiales divulgativos para explicar conceptos básicos de deepfakes, siempre que un humano valide las respuestas por el riesgo de alucinación de un modelo de 3B.
- Despliegue en entornos con restricciones de red o de privacidad: al ejecutarse con llama.cpp u Ollama en local, encaja en escenarios donde no está permitido enviar prompts a APIs externas, como laboratorios con datos sujetos a acuerdos de confidencialidad.
- Evaluación de pipelines Unsloth → GGUF: sirve como caso de estudio reproducible para equipos que quieran replicar el flujo de conversión de un fine-tune a GGUF y comprobar el comportamiento del token BOS ajustado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y el repositorio registra 0 descargas y 0 likes, por lo que no existen datos de validación por parte de la comunidad. La búsqueda web realizada no devolvió ningún resultado relacionado con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 2,0 GB, por lo que se necesitan en torno a 2,5-3 GB de VRAM para el modelo más la caché KV. Esta cifra es una estimación de orden de magnitud, no un dato publicado por el autor.
- Ejecución en CPU: viable con llama.cpp u Ollama en máquinas con 4 GB de RAM libre o más; la velocidad dependerá del número de hilos y del ancho de banda de memoria.
- GPU de consumo: cabe holgadamente en cualquier GPU con 4 GB o más de VRAM, como una GTX 1650, RTX 3050, RTX 3060, RTX 4060 o RTX 4090. También puede repartirse entre VRAM y RAM mediante offloading de capas con llama.cpp.
- GPU de datacenter: compatible con A100, H100 y similares, aunque su uso sería un desperdicio de recursos dado el tamaño del modelo; en esos entornos tendría más sentido servir el modelo en FP16 junto con otras cargas.
- Opciones de despliegue: llama.cpp (`llama-cli --jinja`), Ollama mediante el Modelfile incluido, y cualquier runner compatible con GGUF (LM Studio, Jan, text-generation-webui, entre otros). El soporte de vLLM para GGUF es parcial y no está confirmado para este checkpoint.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La comparativa se establece frente a modelos de la misma franja de tamaño. Los datos de los modelos alternativos proceden de su documentación pública y no han sido verificados en la búsqueda web asociada a esta ficha; los del modelo analizado, salvo el recuento de parámetros, figuran como no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| deepfake-research-llama3.2-3b-GGUF | 3.212.749.888 | No disponible | No disponible | Solo GGUF Q4_K_M en HF |
| Llama 3.2 3B Instruct (modelo base) | 3.210.000.000 aprox. | 128.000 tokens según Meta | Llama 3.2 Community License | Pesos originales en HF |
| Qwen2.5 3B Instruct | 3.090.000.000 aprox. | 32.768 tokens nativos según su documentación | Apache 2.0 | Pesos y GGUF en HF |
| Phi-3.5-mini Instruct | 3.800.000.000 aprox. | 128.000 tokens según su documentación | MIT | Pesos y GGUF en HF |

No se dispone de resultados de benchmarks de este fine-tune que permitan comparar su rendimiento real frente a estas alternativas.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, lo que genera incertidumbre jurídica sobre el uso comercial. Al derivar de Llama 3.2, es previsible que herede las restricciones de la Llama 3.2 Community License, pero esto no está confirmado por el autor.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de que el modelo funcione correctamente más allá de la afirmación del autor.
- Riesgo de alucinación elevado: los modelos de 3.000 millones de parámetros tienen una tasa de error factual considerable en tareas de conocimiento abierto, agravada por la cuantización Q4_K_M.
- Ausencia total de benchmarks: no hay métricas que permitan verificar la calidad del fine-tune ni compararlo con el modelo base. No se puede confirmar que el ajuste haya mejorado el rendimiento en el dominio objetivo.
- Dominio declarado muy estrecho: el nombre sugiere un ajuste orientado a "deepfake research", pero la model card no documenta el dataset, por lo que se desconoce si el ajuste introduce sesgos temáticos o degrada capacidades generales.
- Contexto e idiomas no confirmados: no se especifica la ventana de contexto efectiva tras el fine-tune ni los idiomas soportados. Aunque el modelo base de Meta declara 128.000 tokens y ocho idiomas, el ajuste podría haber alterado ese comportamiento.
- Pérdida por cuantización: solo se publica Q4_K_M, lo que implica una degradación de precisión respecto a FP16, especialmente relevante en tareas de razonamiento y matemáticas.
- Trazas de plantilla: la model card conserva texto promocional de Unsloth y un comando para modelos multimodales que probablemente no aplique a este checkpoint, lo que puede inducir a error sobre sus capacidades reales.
- Fecha de creación atípica: el repositorio figura como creado el 2026-09-22, una fecha que conviene verificar antes de citar el modelo en cualquier trabajo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SaliElloh/deepfake-research-llama3.2-3b-GGUF
- Repositorio de Unsloth (mencionado en la model card): https://github.com/unslothai/unsloth
- Modelo base presumible, Llama 3.2 3B Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- llama.cpp (runner indicado en la model card): https://github.com/ggml-org/llama.cpp
- Resultados de la búsqueda web: no se encontró ningún enlace relevante al modelo. Los resultados devueltos correspondían a fabricantes y directorios de contadores industriales (china-meters.com, made-in-china.com, alibaba.com, meter-china.com) y no guardan relación con este repositorio.
