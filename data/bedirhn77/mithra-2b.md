# Bedirhn77/Mithra-2B

## Resumen

Mithra-2B es un modelo de generación de texto publicado en Hugging Face por el usuario Bedirhn77. Se distribuye únicamente como pesos en formato safetensors bajo la librería transformers, con el tag qwen2, lo que indica que se construye sobre la arquitectura de la familia Qwen2 de Alibaba. El recuento real de parámetros de los ficheros safetensors es de 1.543.714.304 (aproximadamente 1,54 mil millones), por debajo de los "2B" que sugiere el nombre.

Los tags trl, sft y conversational apuntan a un ajuste fino supervisado (SFT) mediante la librería TRL sobre un modelo base no declarado, orientado a uso conversacional. No hay información publicada sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni si hubo fases posteriores de alineación como RLHF o DPO.

El modelo es relevante únicamente como artefacto de investigación reproducible: acumula 0 descargas y 0 likes, la tarjeta de modelo es la plantilla automática de Hugging Face sin rellenar, y no se declara licencia, idiomas soportados ni resultados de evaluación. Cualquier uso en producción requiere una validación previa por parte del equipo que lo adopte, ya que no existe documentación técnica del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (según el tag `qwen2`); transformer decoder-only, detalles no confirmados en la tarjeta |
| Parámetros totales | 1.543.714.304 (1,54 B), según los ficheros safetensors del repositorio |
| Parámetros activos | no aplica (no hay evidencia de que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio solo publica safetensors en precisión de 16 bits. No se incluyen pesos GGUF, AWQ, GPTQ ni EXL2 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio de 3,1 GB, consistente con pesos en bf16/fp16) |
| Librería de referencia | transformers |
| Pipeline declarado | text-generation |
| Tamaño del repositorio | 3,1 GB |
| Fecha de creación | 12 de octubre de 2026, según los metadatos del repositorio |
| Fecha de última actualización | 12 de octubre de 2026, según los metadatos del repositorio |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El único dato arquitectónico disponible es el tag qwen2, que sitúa el modelo en la familia Qwen2. Eso implica, si el tag es correcto y no un residuo de la configuración de subida, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con agrupación de consultas (GQA). Ninguno de estos detalles está confirmado en la tarjeta de modelo, que es la plantilla autogenerada de Hugging Face y no contiene información del autor.

En cuanto al entrenamiento, los tags trl y sft indican que se aplicó un ajuste fino supervisado con la librería TRL, presumiblemente sobre un modelo base de la familia Qwen2 y sobre datos en formato de conversación, dado el tag conversational. Se desconoce por completo el modelo base concreto, el volumen de tokens de entrenamiento, la composición del dataset, el régimen de precisión (fp32, bf16, fp16) y si hubo etapas de alineación posteriores. El tag arxiv:1910.09700 no corresponde a un artículo sobre este modelo: es la referencia al calculador de impacto de carbono que aparece en la plantilla de tarjeta de Hugging Face.

## Capacidades

- Generación de texto conversacional: el tag conversational y el pipeline text-generation indican que el modelo está ajustado para mantener diálogos de varios turnos, si bien no hay ejemplos ni evaluaciones publicadas que lo confirmen.
- Instrucciones y seguimiento de prompts: esperable en un ajuste SFT, no verificado.
- Razonamiento, matemáticas y código: no disponible. No hay benchmarks ni ejemplos que acrediten estas capacidades.
- Tool calling / function calling: no disponible. No se documenta plantilla de chat ni soporte de herramientas.
- Uso como agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible. No se declara la lista de idiomas.
- Capacidades especiales (modo de pensamiento, visión, audio): no disponible. El repositorio solo contiene pesos de texto.
- Formato de prompt: no disponible. Al no publicarse la plantilla de chat, la integración con `apply_chat_template` puede no funcionar correctamente.

## Casos de uso

Dado que no existe documentación ni evaluación publicada, los siguientes escenarios son planteamientos a validar por el equipo adoptante antes de cualquier despliegue real.

- Prototipado local de asistentes conversacionales: con 1,54 B de parámetros en bf16, el modelo cabe en una GPU de consumo y permite iterar sobre prompts y plantillas de chat sin coste de API. Es adecuado como banco de pruebas, no como servicio final.
- Experimentación académica sobre ajuste fino con TRL: al ser un modelo pequeño ya entrenado con SFT, sirve como punto de partida para estudiar recetas de fine-tuning, mezcla de datasets o técnicas de alineación en un presupuesto de cómputo reducido.
- Generación de texto de bajo coste en lote: tareas de resumen, reescritura o clasificación generativa sobre grandes volúmenes de documentos podrían ejecutarse en local, siempre que una evaluación previa confirme una calidad aceptable en el dominio concreto.
- Base para destilación o generación de datos sintéticos: un modelo de 1,54 B es manejable para producir datasets etiquetados que después se filtren y se usen para entrenar modelos mayores o más especializados.
- Investigación en eficiencia de inferencia: sirve para medir latencia y throughput en GPUs de gama media con transformers, TGI o vLLM, y para comparar el coste de distintas estrategias de cuantización tras convertir los pesos a GGUF o AWQ.
- Evaluación comparativa de modelos pequeños: como integrante adicional de un conjunto de modelos de 1-2 B en pruebas internas de razonamiento, multilingüismo o robustez frente a prompts adversarios.
- Aprendizaje y docencia: permite ilustrar el ciclo completo de publicación en Hugging Face, desde el ajuste SFT con TRL hasta el despliegue con endpoints compatibles, en un entorno con requisitos de hardware asequibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta de modelo incluye la sección de evaluación con todos los campos marcados como "[More Information Needed]" y el autor no ha divulgado métricas de MMLU, HumanEval, GSM8K ni de ninguna otra prueba.

## Requisitos de hardware

- Pesos en bf16/fp16: 1.543.714.304 parámetros × 2 bytes ≈ 3,1 GB, coherente con el tamaño del repositorio. Es la única precisión publicada.
- VRAM estimada para inferencia en bf16: en torno a 4-6 GB contando pesos, caché KV y overhead del runtime, en función de la longitud de contexto efectiva (que no está documentada).
- VRAM estimada tras cuantización: aproximadamente 1,6 GB en 8 bits y 0,8-1 GB en 4 bits, pero esas versiones no están publicadas y habría que generarlas.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090). En entornos de servidor, L4, A10G, A100 o H100 con holgura, aunque el modelo es demasiado pequeño para aprovechar GPUs de gama alta.
- Cabe en GPU de consumo: sí, con 6-8 GB de VRAM es suficiente en bf16 para contextos moderados.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag text-generation-inference) y vLLM (tag endpoints_compatible). Para llama.cpp u Ollama es necesario convertir previamente los pesos a GGUF, ya que no se publican ficheros de ese tipo.
- Latencia y throughput: no disponible. No hay datos publicados de tokens por segundo, TTFT ni comparativas de servidores de inferencia.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de Mithra-2B, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos corresponden a sus propias tarjetas oficiales.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Mithra-2B (Bedirhn77) | 1,54 B | no disponible | no disponible | safetensors; sin cuantizaciones; 0 descargas |
| Qwen2-1.5B-Instruct | 1,54 B | 32.768 tokens | Apache-2.0 | safetensors, GGUF, AWQ, GPTQ; ampliamente desplegado |
| Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF; con restricciones de uso |
| SmolLM2-1.7B-Instruct | 1,71 B | 8.192 tokens | Apache-2.0 | safetensors, GGUF; orientado a edge |
| Gemma-2-2B-it | 2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors, GGUF; con restricciones de uso |

La diferencia práctica principal no es de tamaño, sino de trazabilidad: los cuatro modelos alternativos publican licencia, idiomas, contexto y evaluaciones, mientras que Mithra-2B no documenta ninguno de esos extremos y no ofrece cuantizaciones listas para usar.

## Limitaciones y advertencias

- Documentación inexistente: la tarjeta de modelo es la plantilla autogenerada de Hugging Face, con todos los campos relevantes marcados como "[More Information Needed]". No hay información sobre origen de datos, base de partida ni proceso de entrenamiento.
- Licencia sin definir: al no declararse licencia, no existe autorización explícita de uso comercial. En la práctica equivale a "todos los derechos reservados" y desaconseja su uso en productos.
- Riesgo de sesgos desconocido: no hay análisis de sesgos, toxicidad ni evaluación de seguridad. Un modelo SFT sin etapa de alineación documentada puede reproducir estereotipos y contenido problemático presente en su dataset de entrenamiento.
- Riesgo elevado de alucinación: sin benchmarks ni evaluaciones cualitativas, no se puede estimar la fiabilidad factual. No se debe usar en dominios sensibles (salud, legal, financiero) sin verificación humana.
- Idiomas no declarados: se desconoce si el modelo maneja correctamente el castellano. La calidad en español, catalán, gallego o euskera no está acreditada.
- Contexto desconocido: sin la longitud de contexto documentada, es imposible planificar aplicaciones con ventanas largas o estimar el consumo de memoria del caché KV.
- Sin cuantizaciones publicadas: la ausencia de GGUF o AWQ obliga a convertir los pesos antes de desplegar en CPU o en GPU con VRAM limitada, lo que añade pasos no validados.
- Plantilla de chat ausente: al no documentarse el formato de prompt, los resultados con `apply_chat_template` pueden degradarse de forma impredecible.
- Adopción nula: 0 descargas y 0 likes implican que el modelo no ha sido validado por terceros, lo que reduce la probabilidad de detectar errores de empaquetado o pesos corruptos.
- Metadatos anómalos: las fechas de creación y actualización (12 de octubre de 2026) apuntan a un repositorio de prueba o a una configuración incorrecta, otro motivo para tratar el artefacto con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Bedirhn77/Mithra-2B
- Calculador de impacto de carbono citado en la plantilla de la tarjeta (referencia del tag arxiv:1910.09700): https://mlco2.github.io/impact
- Artículo asociado a esa referencia, Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
- Repositorio de TRL, librería de ajuste fino indicada en los tags: https://github.com/huggingface/trl
- Documentación de transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- vLLM: https://github.com/vllm-project/vllm
- No se dispone de paper, blog, demo ni repositorio de código específicos de Mithra-2B.
