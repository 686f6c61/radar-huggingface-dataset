# meshllm/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-UD-Q4_K_XL-layers

## Resumen

Este repositorio no contiene el modelo original, sino un paquete de inferencia distribuida en formato GGUF creado por Mesh LLM a partir del modelo cuantizado de Unsloth `unsloth/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF`. El paquete divide el fichero GGUF monolítico en artefactos por capa (52 capas) más un manifiesto `model-package.json` con sumas de comprobación SHA-256, de modo que los pesos puedan repartirse entre varias máquinas y servirse como un único endpoint compatible con la API de OpenAI.

El modelo subyacente es NVIDIA Nemotron 3 Nano Omni 30B-A3B Reasoning, de la familia Nemotron de NVIDIA, con una escala declarada de 30B-A3B (aproximadamente 30.000 millones de parámetros totales y 3.000 millones activos por token, según la nomenclatura MoE del nombre). La cuantización aplicada es UD-Q4_K_XL, el esquema dinámico de 4 bits de Unsloth. El repositorio ocupa 30,7 GB y su librería de referencia es `mesh-llm`.

Su relevancia actual es práctica: permite ejecutar un modelo MoE de escala 30B en hardware de consumo agregado (varias estaciones de trabajo o nodos pequeños) en lugar de requerir una GPU de 80 GB, manteniendo los pesos en local y exponiendo un endpoint `/v1/chat/completions`. Al tratarse de un paquete derivado, no aporta arquitectura ni entrenamiento propios: hereda todo del modelo de origen.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Familia NVIDIA Nemotron; la nomenclatura 30B-A3B indica mezcla de expertos (MoE). 52 capas según el manifiesto del paquete |
| Parámetros totales | 30B según la escala declarada en el nombre. El metadato safetensors del repositorio indica 38.744.896, cifra incompatible con esa escala (ver limitaciones) |
| Parámetros activos | Aproximadamente 3B, inferido del sufijo A3B del nombre del modelo; no confirmado en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF UD-Q4_K_XL (Unsloth Dynamic 4-bit). El repositorio de origen de Unsloth publica otras variantes GGUF, no detalladas aquí |
| Idiomas soportados | No disponible |
| Licencia | `other`, heredada del modelo de origen (no se incluye el texto de la licencia en la información disponible) |
| Formato de pesos | GGUF fragmentado en artefactos por capa más manifiesto `model-package.json` (ABI de Skippy no registrada) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo de origen. Los únicos datos técnicos verificables son los del paquete: 52 capas, cuantización UD-Q4_K_XL y un tamaño de repositorio de 30,7 GB. La etiqueta `imatrix` presente en el repositorio sugiere que la cuantización se calibró con una matriz de importancia (importance matrix), técnica habitual para reducir la pérdida de calidad en modelos MoE donde unos expertos se activan con mucha menos frecuencia que otros.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. El sufijo "Reasoning" del nombre apunta a un ajuste orientado a cadenas de razonamiento y el término "Omni" sugiere capacidades multimodales en el modelo de origen, pero ninguna de las dos cosas está confirmada en la documentación proporcionada. Este repositorio, en cualquier caso, no entrena ni modifica pesos: únicamente reempaqueta una cuantización ya existente de Unsloth.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Razonamiento: el nombre del modelo incluye "Reasoning", lo que indica un ajuste específico para tareas de razonamiento; no hay detalles publicados sobre el modo de pensamiento ni sobre su formato.
- Capacidades omni: el nombre incluye "Omni", lo que sugiere entrada multimodal (imagen, audio o vídeo) en el modelo de origen. No confirmado en la información disponible ni necesariamente preservado en este paquete GGUF por capas.
- Compatibilidad con endpoints: el paquete expone una API compatible con OpenAI (`/v1/chat/completions`, `/v1/models`) a través de Mesh LLM.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Inferencia distribuida: capacidad propia del paquete, no del modelo; permite repartir las capas entre varios nodos.

## Casos de uso

- Inferencia privada en clúster casero: repartir las 52 capas entre varias máquinas con `mesh-llm serve --model ... --split` permite ejecutar un MoE de escala 30B sumando la memoria de equipos modestos, sin enviar datos a ningún servicio externo.
- Servicio interno compatible con OpenAI: al exponer `/v1/chat/completions` en `localhost:3131`, se puede conectar a clientes que ya hablan el protocolo de OpenAI (LangChain, Continue, LibreChat, SDK oficial) cambiando solo la URL base.
- Asistente de código autoalojado: el modelo está orientado a razonamiento y su cuantización de 4 bits es lo bastante ligera para un servidor de desarrollo; sirve para revisión de código, generación de tests y explicación de fragmentos sin salir de la red local.
- Laboratorios con GPU heterogéneas: universidades o grupos de investigación que solo disponen de varias tarjetas de 12-24 GB pueden agregarlas en un único pool en lugar de comprar una GPU de 80 GB.
- Despliegue reproducible en producción: el manifiesto incluye SHA-256 de origen y del paquete, lo que permite verificar la integridad de los pesos en pipelines de CI/CD antes de arrancar un servicio.
- Evaluación comparativa de modelos: investigadores que necesitan medir un MoE de 30B frente a alternativas densas pueden levantarlo y retirarlo rápidamente en un nodo pequeño, sin aprovisionar hardware dedicado.
- Procesamiento por lotes en local: tareas de resumen, extracción y clasificación sobre documentos sensibles (sanitario, legal, industrial) donde la política de la organización prohíbe usar APIs en la nube.
- Base para ajuste fino o destilación: el GGUF de origen de Unsloth puede usarse como referencia de comportamiento, aunque el ajuste fino no se realiza sobre este formato por capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del paquete remite expresamente a la ficha del modelo de origen de Unsloth para consultar notas de benchmarks, y los resultados de la búsqueda web no aportan datos utilizables sobre el modelo.

## Requisitos de hardware

- Tamaño de los pesos: el repositorio ocupa 30,7 GB. El manifiesto declara un tamaño de paquete de 0 B, dato inconsistente; los pesos reales de un MoE de 30B en UD-Q4_K_XL se estiman en el rango de 17-19 GB, estimación propia no confirmada por el autor.
- VRAM estimada para inferencia: aproximadamente 20-24 GB en una sola máquina para pesos más caché KV con contexto moderado (estimación); con contexto largo, la caché KV de 52 capas crece de forma apreciable y puede requerir 32-48 GB.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB o L40S 48 GB en un único nodo; RTX 3090, RTX 4090 o RTX 5090 (24-32 GB) en el límite, con contexto reducido.
- Cabe en GPU de consumo: sí, repartiendo capas entre dos o tres equipos con 12-16 GB de VRAM cada uno, o en una sola tarjeta de 24 GB con contexto limitado. También es viable la descarga parcial a CPU y RAM.
- Opciones de despliegue: Mesh LLM (`mesh-llm serve`, único runtime que consume el formato de paquete por capas); llama.cpp / `llama-server`, Ollama y LM Studio solo con el GGUF monolítico de origen, no con este paquete fragmentado. vLLM y TGI no soportan el formato de paquete por capas.
- Latencia y rendimiento: no disponible. En despliegue distribuido, la latencia depende del número de saltos de red y del ancho de banda entre nodos, ya que cada token generado atraviesa las capas repartidas; en red local gigabit el coste es perceptible frente a inferencia en un solo host.

## Comparativa con modelos similares

Los datos de las alternativas provienen de conocimiento general sobre esos modelos y deben verificarse en sus fichas oficiales; no se han obtenido de la información proporcionada para esta ficha.

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron 3 Nano Omni 30B-A3B Reasoning (UD-Q4_K_XL, paquete Mesh LLM) | 30B (declarado) | ~3B (inferido) | No disponible | `other` | Paquete GGUF por capas para inferencia distribuida; benchmarks no publicados en esta información |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32K nativo, ampliable con YaRN | Apache 2.0 | MoE de escala equivalente; licencia permisiva y amplia documentación de benchmarks |
| gpt-oss-20b | 21B | 3,6B | 128K | Apache 2.0 | MoE de menor tamaño, orientado a razonamiento y uso con herramientas |
| Modelo denso de ~30B (por ejemplo, familia Mistral Small) | ~24-32B | Todos | Variable según versión | Variable | Sin mezcla de expertos: mayor coste de VRAM por token y sin ventaja de activación dispersa |

La ventaja diferencial de este paquete no es el rendimiento del modelo, sino el formato: es el único de la tabla pensado para repartirse entre varias máquinas y para servir una API compatible con OpenAI desde un clúster local.

## Limitaciones y advertencias

- El repositorio es un paquete derivado: no contiene la model card del autor original ni sus datos de entrenamiento, sesgos o evaluación. Toda la información cualitativa debe consultarse en la ficha de Unsloth y en la de NVIDIA.
- Inconsistencia de metadatos: el campo de parámetros safetensors indica 38.744.896, incompatible con la escala 30B declarada en el nombre; el tamaño de paquete figura como 0 B. Conviene verificar la integridad de los artefactos antes de desplegar.
- Sin benchmarks publicados en la información disponible: no hay evidencia verificable de calidad en MMLU, HumanEval, GSM8K ni en tareas multimodales.
- Licencia `other`: no se especifica el texto ni las condiciones. Al tratarse de un modelo de NVIDIA redistribuido, es imprescindible revisar los términos de la licencia del modelo de origen antes de cualquier uso comercial.
- Idiomas soportados no documentados: no se puede asumir un rendimiento aceptable en castellano sin evaluarlo.
- Longitud de contexto desconocida: condiciona el diseño de aplicaciones RAG y de conversaciones multi-turno largas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay datos de evaluación ni de tasas de error para este modelo o su cuantización.
- La cuantización UD-Q4_K_XL introduce pérdida de precisión respecto a los pesos originales, especialmente en modelos MoE donde algunos expertos rara vez se activan.
- Dependencia de runtime: el formato por capas solo lo consume Mesh LLM. Migrar a llama.cpp, Ollama o vLLM exige descargar el GGUF monolítico de origen y perder la ventaja del reparto distribuido.
- En despliegue multi-nodo, la disponibilidad del servicio depende de la red: la caída de un nodo interrumpe la inferencia si no hay replicación de capas.
- Repositorio sin descargas ni valoraciones en el momento de la consulta: no hay evidencia de uso en producción por parte de terceros.

## Enlaces

- Paquete en HuggingFace: https://huggingface.co/meshllm/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-UD-Q4_K_XL-layers
- Modelo de origen cuantizado (Unsloth): https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF
- Revisión exacta del modelo de origen: https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-GGUF/tree/571758804835f56154718683f5c0e388b7d0fef9
- Sitio web de Mesh LLM: https://www.meshllm.cloud
- Repositorio de Mesh LLM en GitHub: https://github.com/Mesh-LLM/mesh-llm
- Especificación del formato de paquete por capas: https://github.com/Mesh-LLM/mesh-llm/blob/main/docs/specs/layer-package-repos.md
- Catálogo de paquetes: https://huggingface.co/datasets/meshllm/catalog
- Discord de Mesh LLM: https://discord.gg/rs6fmc63eN
