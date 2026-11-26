# devgt/kanana-1.5-8b-instruct-2505-Persona-LORA

## Resumen

El modelo `devgt/kanana-1.5-8b-instruct-2505-Persona-LORA` es un ajuste fino (fine-tuning) mediante LoRA del modelo base `kakaocorp/kanana-1.5-8b-instruct-2505`, desarrollado por Kakao Corp. El autor del ajuste es el usuario `devgt`, que lo publica bajo licencia Apache 2.0. Se trata de un adaptador de bajo rango orientado a la personalización de estilo o "persona" en la generación de texto, aunque la model card no detalla la composición exacta del dataset de ajuste.

El modelo hereda la arquitectura del Kanana 1.5 8B Instruct de Kakao, un transformer decoder-only denso de aproximadamente 8 mil millones de parámetros, con soporte para coreano e inglés (aunque la ficha del adaptador declara únicamente inglés). El adaptador se ha entrenado con la librería Unsloth, lo que indica un proceso de fine-tuning optimizado para velocidad y bajo consumo de memoria.

Su relevancia es limitada: se trata de un adaptador de nicho, sin descargas ni interacciones en el momento de la consulta, y con documentación mínima. Resulta útil únicamente como ejemplo de personalización LoRA sobre un modelo base coreano, o para quien necesite exactamente la "persona" que el autor haya definido, sin garantías de calidad ni evaluación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada del modelo base Kanana 1.5 8B Instruct); adaptador LoRA |
| Parametros totales | ~8 mil millones (modelo base); el adaptador LoRA ocupa ~0,1 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base, no confirmada) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base fusionado) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `kakaocorp/kanana-1.5-8b-instruct-2505`, un transformer decoder-only denso de unos 8 mil millones de parámetros. El fine-tuning se realizó con Unsloth, una librería que optimiza el entrenamiento de LoRA/QLoRA mediante kernels personalizados y reducción de memoria, lo que permite entrenar aproximadamente 2 veces más rápido según la propia model card. No se especifican el rango del adaptador, los módulos objetivo, el número de tokens de entrenamiento ni la composición del dataset.

No hay información sobre si el ajuste incluyó RLHF, DPO u otra fase de alineamiento adicional. Tampoco se documentan innovaciones técnicas propias del adaptador: se trata de un LoRA estándar sobre un modelo base ya instruido. La model card es mínima y se limita a indicar el modelo base, el autor, la licencia y la herramienta de entrenamiento.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Kanana 1.5 8B Instruct.
- Personalización de estilo o "persona" mediante el adaptador LoRA (el autor no detalla qué persona ni con qué datos).
- Razonamiento e instrucciones generales: presumiblemente heredadas del modelo base, aunque no se documentan en esta ficha.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para el adaptador (el modelo base podría soportarlo, pero no se confirma).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingües: la model card declara únicamente inglés; el modelo base Kanana soporta coreano e inglés, pero el adaptador no lo confirma.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Experimentación con fine-tuning LoRA: sirve como ejemplo práctico de cómo adaptar un modelo coreano de 8B con Unsloth para un estilo concreto, útil para desarrolladores que quieran replicar el pipeline.
- Prototipado de asistentes con personalidad fija: si la "persona" del adaptador encaja con el caso de uso, puede desplegarse fusionado con el modelo base para respuestas con un tono consistente.
- Investigación sobre personalización de modelos: permite comparar el comportamiento del modelo base frente al ajustado en tareas de estilo, siempre que se disponga de una evaluación propia.
- Generación de texto en inglés con un tono específico: para aplicaciones donde el estilo importa más que el rendimiento bruto en benchmarks.
- Base para nuevos ajustes: el adaptador puede servir como punto de partida para fine-tunings posteriores sobre el mismo modelo base.
- Pruebas de integración con TGI o transformers: el repositorio declara compatibilidad con text-generation-inference y transformers, lo que facilita su despliegue en pipelines existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al fusionar el adaptador con el modelo base de 8B, se requieren aproximadamente 16 GB en FP16, ~8-10 GB en cuantización de 8 bits y ~5-6 GB en 4 bits. El adaptador por sí solo ocupa ~0,1 GB.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 para FP16; RTX 3090/4080 o superiores para cuantización 4/8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090, 4080, 4090 y similares con cuantización; en FP16 requiere al menos 16 GB de VRAM.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM tras fusionar el adaptador, llama.cpp/Ollama si se convierte a GGUF.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| devgt/kanana-1.5-8b-instruct-2505-Persona-LORA | ~8B (base) + LoRA | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| kakaocorp/kanana-1.5-8b-instruct-2505 (base) | ~8B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo oficial) |
| Meta-Llama-3.1-8B-Instruct | 8B | 128K | Llama 3.1 Community License | Hugging Face, amplia adopción |
| Qwen2.5-7B-Instruct | 7B | 128K | Apache 2.0 | Hugging Face, amplia adopción |

La comparativa se limita a parámetros y licencia porque no hay datos de rendimiento publicados para el adaptador. Frente a Llama 3.1 8B o Qwen2.5 7B, el adaptador de devgt no ofrece métricas verificables y su adopción es prácticamente nula.

## Limitaciones y advertencias

- Documentación mínima: la model card no describe el dataset, el rango del LoRA ni la "persona" objetivo, lo que impide evaluar su calidad.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de que el ajuste mejore o degrade las capacidades del modelo base.
- Riesgo de alucinación: heredado del modelo base y no cuantificado para el adaptador.
- Idiomas: la model card declara solo inglés; el soporte de coreano del modelo base no está confirmado en el adaptador.
- Sesgos: no documentados; podrían heredarse del modelo base y amplificarse por el dataset de ajuste, que se desconoce.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar la licencia del modelo base Kanana antes de desplegar en producción.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni soporte.
- Fecha de creación futura (2026-11-26): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/devgt/kanana-1.5-8b-instruct-2505-Persona-LORA
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-8b-instruct-2505
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
