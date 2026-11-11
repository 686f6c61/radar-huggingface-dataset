# moltherm1/olmo-mirror-olmo-2-0425-1b

## Resumen

OLMo 2 1B es el modelo de menor tamaño de la familia OLMo 2 (Open Language Models), desarrollada por el Allen Institute for AI (Ai2). Se trata de un transformer decoder-only de tipo denso, con aproximadamente 1.480 millones de parámetros totales y una ventana de contexto de 4096 tokens. El repositorio analizado (`moltherm1/olmo-mirror-olmo-2-0425-1b`) es un espejo de los pesos base publicados originalmente por Ai2, distribuido bajo licencia Apache 2.0.

El modelo se preentrenó sobre 4 billones de tokens procedentes de OLMo-mix-1124 y pasó por una fase de mid-training con Dolmino-mix-1124. Forma parte de una iniciativa de ciencia abierta que publica no solo los pesos, sino también el código, los checkpoints intermedios, los logs y los detalles de entrenamiento, lo que lo convierte en una pieza valiosa para investigación reproducible y experimentación con modelos de escala reducida.

Su relevancia actual radica en que ofrece un punto de partida ligero, completamente auditable y con licencia permisiva, útil para prototipado rápido, ajuste fino en hardware modesto y estudios académicos sobre dinámica de entrenamiento. El modelo base está orientado a modelado de lenguaje en inglés; las variantes SFT, DPO e Instruct del mismo tamaño existen en los repositorios oficiales de Ai2.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (OLMo 2) |
| Parametros totales | 1.484.916.736 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | 8 bits mediante bitsandbytes; cuantizaciones GGUF/AWQ/GPTQ no documentadas en la información disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Capas | 16 |
| Dimensión oculta | 2048 |
| Cabezas de atención | 16 |
| Tokens de entrenamiento | 4 billones |
| Tamaño del repositorio | 5.9 GB |

## Arquitectura y entrenamiento

OLMo 2 1B es un transformer decoder-only denso con 16 capas, dimensión oculta de 2048 y 16 cabezas de atención, con un contexto máximo de 4096 tokens. El preentrenamiento se realizó sobre OLMo-mix-1124 (4 billones de tokens) y una fase posterior de mid-training sobre Dolmino-mix-1124. La familia OLMo 2 sigue una cadena de entrenamiento por etapas: base, SFT, DPO y, finalmente, modelos Instruct afinados con RLVR (Reinforcement Learning with Verifiable Rewards).

La información disponible no detalla innovaciones arquitectónicas específicas de esta variante de 1B (como atención linear, decodificación especulativa o variantes híbridas SSM/transformer); lo documentado se limita a la configuración de capas, dimensión y cabezas indicada en la model card, junto con la cadena de etapas de alineación. La transparencia del proyecto (publicación de checkpoints, logs y código en GitHub) es el elemento diferencial más destacable desde el punto de vista técnico y de reproducibilidad.

## Capacidades

- Generación de texto autoregresiva en inglés, orientada a modelado de lenguaje general.
- Razonamiento básico y respuesta a instrucciones limitada al checkpoint base (sin alineación conversacional; para uso instructivo se requieren las variantes SFT/DPO/Instruct).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Visión, audio o modalidades adicionales: no disponibles.
- Modo "thinking" explícito: no disponible.
- Compatibilidad con endpoints y despliegue en transformers (>= 4.48) y vLLM (rama main hasta v0.7.4).

## Casos de uso

- Investigación reproducible en ciencia de modelos de lenguaje: al publicarse checkpoints, logs y código, el modelo permite replicar curvas de entrenamiento y estudiar fenómenos de escalado en un régimen de 1B parámetros sin coste computacional prohibitivo.
- Ajuste fino en hardware de consumo: con ~1.48B parámetros y pesos safetensors de ~5.9 GB, es viable hacer LoRA o fine-tuning completo en GPUs consumer (por ejemplo, RTX 4090 de 24 GB) usando transformers o frameworks como PEFT, sirviendo como banco de pruebas para pipelines de alineación (SFT, DPO).
- Prototipado de aplicaciones de generación de texto en inglés: el checkpoint base puede usarse para experimentar con prompts, decodificación (top-k, top-p) y evaluación de calidad antes de migrar a modelos mayores de la misma familia.
- Generación de datos sintéticos y aumentación de corpus: útil para producir texto en inglés a pequeña escala en entornos controlados, con bajo coste de inferencia.
- Base para destilación y comparativas de escalado: al compartir arquitectura y receta con las variantes 7B, 13B y 32B, permite estudiar diferencias de comportamiento entre escalas manteniendo el mismo pipeline de datos.
- Despliegue en entornos con recursos limitados: la cuantización a 8 bits con bitsandbytes reduce el consumo de memoria, facilitando servir el modelo en CPUs o GPUs modestas para demos internas y pruebas de latencia.
- Educación y docencia: su tamaño reducido y licencia Apache 2.0 lo hacen adecuado para cursos sobre transformers, tokenización y entrenamiento de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 3 GB solo para pesos (1.48B × 2 bytes), más overhead de activaciones y KV cache; en 8 bits, alrededor de 1.5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 con contexto moderado (RTX 3060 12 GB, RTX 4070, RTX 4090); A100/H100 no son necesarias para inferencia a esta escala, aunque pueden usarse para throughput elevado en batch.
- Cabe en GPU consumer: sí, holgadamente en RTX 4090 (24 GB), RTX 3090 (24 GB) y RTX 3060 (12 GB); incluso en GPUs de 8 GB con cuantización.
- Opciones de despliegue: transformers (>= 4.48), vLLM (rama main hasta v0.7.4), bitsandbytes para carga en 8 bits. Soporte de llama.cpp, Ollama o TGI no está documentado en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLMo 2 1B (este repositorio) | ~1.48B | 4096 | 4 billones | Apache 2.0 | Hugging Face (espejo de Ai2) |
| OLMo 2 7B | ~7B (no confirmado en la información) | 4096 | 4 billones | Apache 2.0 | Hugging Face (Ai2) |
| OLMo 2 13B | ~13B (no confirmado en la información) | 4096 | 5 billones | Apache 2.0 | Hugging Face (Ai2) |
| OLMo 2 32B | ~32B (no confirmado en la información) | 4096 | 6 billones | Apache 2.0 | Hugging Face (Ai2) |

La comparación con modelos de otros laboratorios (por ejemplo, familias de 1B de otros proveedores) no está disponible en la información proporcionada; los datos de rendimiento comparativo tampoco han sido publicados en la documentación consultada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre corpus web en inglés, es esperable heredar sesgos presentes en OLMo-mix-1124, aunque no se cuantifican.
- Riesgo de alucinación: el checkpoint es un modelo base sin alineación conversacional; puede generar contenido factualmente incorrecto y no sigue instrucciones de forma fiable.
- Limitaciones de contexto: ventana de 4096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Limitaciones de idioma: entrenado y evaluado principalmente en inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia; no se especifican restricciones adicionales en la información disponible.
- Caveats para producción: este repositorio es un espejo de terceros (`moltherm1`), no el oficial de Ai2; para uso en producción se recomienda verificar la integridad de los pesos frente al repositorio original y usar las variantes Instruct/DPO si se requiere seguir instrucciones.
- Compatibilidad: requiere transformers >= 4.48; en vLLM es necesario usar la rama main hasta la versión v0.7.4.
- El modelo no incluye salvaguardas de seguridad específicas más allá de las del checkpoint base.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/moltherm1/olmo-mirror-olmo-2-0425-1b
- Modelo base oficial OLMo 2 1B: https://huggingface.co/allenai/OLMo-2-0425-1B
- Variante SFT: https://huggingface.co/allenai/OLMo-2-0425-1B-SFT
- Variante DPO: https://huggingface.co/allenai/OLMo-2-0425-1B-DPO
- Variante Instruct (RLVR): https://huggingface.co/allenai/OLMo-2-0425-1B-Instruct
- Dataset de preentrenamiento OLMo-mix-1124: https://huggingface.co/datasets/allenai/olmo-mix-1124
- Dataset de mid-training Dolmino-mix-1124: https://huggingface.co/datasets/allenai/dolmino-mix-1124
- Repositorio GitHub del proyecto OLMo: https://github.com/allenai/OLMo
- Paper de referencia (arXiv:2501.00656): https://arxiv.org/abs/2501.00656
