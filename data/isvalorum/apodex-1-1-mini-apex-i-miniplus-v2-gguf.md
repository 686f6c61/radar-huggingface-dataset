# IsValorum/Apodex-1.1-mini-APEX-I-MiniPlus-V2-GGUF

## Resumen

Apodex-1.1-mini-APEX-I-MiniPlus-V2 es una cuantización GGUF personalizada del modelo multimodal apodex/Apodex-1.1-mini, un Mixture-of-Experts (MoE) de 35.000 millones de parámetros desarrollado por apodex y publicado en HuggingFace por el usuario IsValorum. El modelo está orientado a cargas de trabajo agénticas: investigación profunda, orquestación de herramientas, razonamiento verificable y flujos de trabajo informáticos de varios turnos. Su topología combina 256 micro-expertos con dimensión intermedia de 512 y enrutamiento top-8 por token, distribuidos en 40 capas, de las cuales 30 son de atención lineal tipo DeltaNet SSM y 10 de atención completa.

La relevancia de esta ficha concreta reside en el proceso de cuantización: en lugar de un script automático, el autor aplica un mapa de tensores hecho a mano y calibrado contra una importance matrix (imatrix) multidominio, con el objetivo declarado de preservar el enrutamiento de expertos y el espacio de vocabulario de 248.320 tokens. El modelo soporta una ventana de contexto nativa de 262.144 tokens, visión multimodal mediante un proyector mmproj y un bloque de predicción multi-token (blk.40) pensado para decodificación especulativa.

Advertencia relevante: la model card indica explícitamente que los pesos se estaban subiendo el mismo día de publicación ("work in progress", con fecha 15 de septiembre de 2026) y que las tablas de benchmarks y los requisitos de hardware se completarían más adelante. A fecha de la información disponible el repositorio registra cero descargas y cero likes, y no se confirma la presencia de los archivos GGUF en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE: 40 capas totales (30 de atención lineal / DeltaNet SSM + 10 de atención completa), 256 micro-expertos con dimensión intermedia de 512, enrutamiento top-8 por token, bloque de predicción multi-token (blk.40) |
| Parámetros totales | 35.000 millones (35B) |
| Parámetros activos | no disponible (el autor declara top-8 sobre 256 expertos, pero no publica el recuento de parámetros activos por token) |
| Longitud de contexto | 262.144 tokens (256K) nativos |
| Tipos de cuantización | APEX-I-MiniPlus-V2 (GGUF de precisión mixta): `output.weight` en Q6_K; expertos enrutados en IQ3_XXS con calibración imatrix; embeddings de entrada, capas 0–9 y 30–39 y cabezas de atención en IQ3_S; expertos compartidos en IQ4_NL; layer norms, kernels conv1d y biases de estado SSM en F32; proyector de visión (mmproj) en Q8_0 |
| Idiomas soportados | no disponible (vocabulario de 248.320 tokens diseñado para tareas multilingües, pero el autor no publica lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) para este repositorio; formato del modelo base no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con mezcla de expertos. De las 40 capas, 30 emplean atención lineal con formulación DeltaNet sobre espacio de estados (SSM), lo que reduce el coste de prefill y el tamaño del KV cache, mientras que 10 capas mantienen atención completa. El componente MoE está fragmentado en 256 micro-expertos de dimensión intermedia 512, con enrutamiento top-8 por token, lo que busca alta especialización con asignación de cómputo dispersa. El vocabulario es inusualmente amplio (248.320 tokens), dimensionado para código, estructuras de razonamiento y multilingüismo. El modelo incorpora además un bloque de predicción multi-token (`blk.40`) que actúa como borrador para decodificación especulativa, y un proyector multimodal para entrada de imagen.

El detalle del entrenamiento no está publicado en la información disponible: se desconoce el número de tokens de entrenamiento, la composición del dataset, la mezcla de idiomas y si hubo etapas de RLHF, DPO u otra optimización por preferencias. Tampoco se documentan las innovaciones de entrenamiento más allá de las características arquitectónicas descritas. La aportación técnica diferencial de este repositorio es exclusivamente la cuantización: un mapa de tensores manual calibrado con una imatrix multidominio, con protección explícita del `output.weight` en Q6_K para evitar el colapso léxico del vocabulario de 248k, expertos enrutados por encima del umbral de 3,0 BPW para prevenir el misrouting en una topología de 256 expertos, y aislamiento en F32 de layer norms, conv1d y biases de estado SSM para preservar la estabilidad numérica.

## Capacidades

- Generación de texto y razonamiento de varios pasos: el autor lo posiciona para "razonamiento verificable" y flujos de trabajo de investigación profunda.
- Código y matemáticas: el repositorio declara explícitamente que los pesos principales cubren lenguaje, razonamiento y matemáticas.
- Visión multimodal e image-text-to-text: pipeline declarado `image-text-to-text`, con análisis de documentos e imágenes de alta resolución y OCR, apoyado en el proyector `mmproj` cuantizado en Q8_0.
- Orquestación de herramientas: se presenta como modelo "agentic" con soporte de tool orchestration; el formato exacto de function calling no está documentado en la información disponible.
- Agentes y flujos multi-turno: orientado a "multi-turn computer workflows".
- Contexto largo: ventana nativa de 262.144 tokens, útil para documentos extensos o historiales de agente largos.
- Multilingüismo: vocabulario de 248.320 tokens diseñado para tareas multilingües avanzadas, sin lista de idiomas confirmada.
- Decodificación especulativa mediante MTP: el bloque `blk.40` se conserva en la cuantización; no se confirma que el runtime de destino (llama.cpp) lo aproveche.

## Casos de uso

- Análisis de documentación técnica extensa: con 256K tokens de contexto nativo el modelo puede ingerir manuales, normativa o repositorios completos en una sola pasada, evitando estrategias de chunking y recuperación que degradan la coherencia global.
- Digitalización y extracción de datos de documentos escaneados: la combinación de visión multimodal y proyector Q8_0 permite OCR y extracción estructurada de tablas y formularios sin depender de servicios externos, siempre que el rendimiento real se valide tras el despliegue.
- Agentes de automatización de navegador y escritorio: el perfil "agentic" y la ventana larga encajan con bucles de acción-observación multi-turno donde el historial crece rápido.
- Asistentes de código en pipelines de CI/CD: si el soporte de tool calling se confirma, puede integrarse como revisor automático de parches o generador de tests invocado desde el pipeline, con el atractivo de una licencia Apache-2.0 para uso comercial.
- Atención al cliente multilingüe de segundo nivel: el vocabulario amplio permite cubrir conversaciones con mezcla de idiomas y jerga técnica, aunque no hay lista oficial de idiomas ni evaluación de calidad por idioma.
- Investigación asistida con verificación: el foco declarado en razonamiento verificable lo hace apto para generar hipótesis y resúmenes de literatura citando pasajes de los documentos introducidos en contexto.
- Despliegue en hardware de gama alta de consumo: al ser GGUF, un usuario con una GPU de 24 GB o un equipo Apple con memoria unificada puede ejecutarlo localmente con llama.cpp, sin depender de APIs externas ni enviar datos sensibles fuera de la organización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las "full benchmark tables" se incorporarán cuando finalice la subida de los archivos. No se dispone de valores de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra métrica, ni de comparaciones medidas contra modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 15–19 GB según el recuento de 35B parámetros y la mezcla de precisión declarada (expertos IQ3_XXS, expertos compartidos IQ4_NL, `output.weight` Q6_K). Es una estimación derivada del recuento de parámetros, no una cifra publicada por el autor.
- Proyector de visión: tamaño del archivo `mmproj` en Q8_0 no disponible; hay que sumarlo a la VRAM anterior.
- KV cache: el autor indica que las 30 capas de atención lineal reducen el consumo de KV cache, pero no publica cifras. Solo las 10 capas de atención completa escalan con la longitud de contexto.
- GPU consumer: una RTX 3090 o RTX 4090 con 24 GB debería alojar los pesos con poco margen para contexto largo y proyector; tarjetas de 32 GB o superiores son más holgadas. No confirmado por el autor.
- Memoria unificada: equipos Apple Silicon con 32–64 GB son candidatos razonables para ejecución íntegra en GPU.
- GPU de centro de datos: A100 40/80 GB, H100 y L40S tienen margen sobrado para pesos, proyector y contexto extendido.
- Ejecución parcial en CPU: al ser GGUF, llama.cpp permite descargar capas a RAM si la VRAM no alcanza, a costa de latencia.
- Opciones de despliegue confirmadas: llama.cpp (`llama-cli`, `llama-server`), y los envoltorios compatibles con GGUF (Ollama, LM Studio, koboldcpp, llama-cpp-python).
- vLLM y TGI: soporte de esta arquitectura híbrida MoE + DeltaNet SSM en formato GGUF no confirmado.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

Los valores de referencia de los modelos alternativos proceden de documentación pública externa y no estaban incluidos en la información proporcionada; se incluyen únicamente como contexto orientativo.

| Modelo | Parámetros totales | Parámetros activos | Contexto nativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Apodex-1.1-mini-APEX-I-MiniPlus-V2 | 35B | no disponible | 262.144 tokens | Apache-2.0 | GGUF, pesos pendientes de publicación |
| Qwen3-30B-A3B (referencia externa) | 30,5B | 3,3B | 128.000 tokens | Apache-2.0 | safetensors y GGUF publicados |
| Mixtral 8x7B (referencia externa) | 46,7B | 12,9B | 32.000 tokens | Apache-2.0 | safetensors y GGUF publicados |
| apodex/Apodex-1.1-mini (modelo base) | 35B | no disponible | 262.144 tokens | no disponible en la información proporcionada | no disponible |

No se dispone de datos de rendimiento comparado entre estos modelos dentro de la información proporcionada, por lo que la comparativa se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- Disponibilidad: la model card indica que los pesos se estaban subiendo el mismo día de publicación. Si los archivos no están presentes en el repositorio, el modelo no es utilizable todavía.
- Falta de validación externa: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso independiente ni de reproducibilidad de la cuantización.
- Ausencia de benchmarks: no hay ninguna métrica publicada, ni del modelo base ni de esta cuantización, por lo que no puede afirmarse ninguna comparación de calidad frente a las alternativas.
- Riesgo de degradación por cuantización agresiva: el propio autor reconoce que la cuantización plana en 3 bits "aplasta las matrices de enrutamiento"; su mapa manual busca mitigarlo, pero no aporta mediciones que lo demuestren. En una topología de 256 expertos, un misrouting residual puede afectar a tareas que dependan de conocimiento especializado.
- Alucinación: no cuantificada. No hay evaluaciones de fidelidad ni de tasa de invención en contextos agénticos.
- Idiomas: no existe lista oficial de idiomas soportados; el tamaño del vocabulario no garantiza calidad homogénea entre lenguas.
- Soporte de MTP incierto: el bloque `blk.40` se conserva, pero no se confirma que llama.cpp lo utilice para decodificación especulativa; en caso contrario, el beneficio de latencia no se materializa.
- Licencia: Apache-2.0 permite uso comercial de esta cuantización, pero la licencia y las condiciones del modelo base apodex/Apodex-1.1-mini no se detallan en la información disponible y conviene verificarlas antes de un despliegue en producción.
- Compatibilidad de runtimes: arquitecturas híbridas con atención lineal/SSM pueden no estar soportadas en motores de inferencia de alto rendimiento como vLLM o TGI, lo que limita el escalado a servidores.
- Fechas de referencia: el repositorio se creó y actualizó el 15 de septiembre de 2026, sin actualizaciones posteriores registradas en la información consultada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/IsValorum/Apodex-1.1-mini-APEX-I-MiniPlus-V2-GGUF
- Modelo base: https://huggingface.co/apodex/Apodex-1.1-mini
- Perfil del autor de la cuantización: https://huggingface.co/IsValorum
- Paper, blog o demo oficial: no disponible en la información proporcionada
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con este modelo (contenido sobre Claude, Claude Code Router y tutoriales de herramientas de Anthropic) y no se han incluido como enlaces relevantes.
