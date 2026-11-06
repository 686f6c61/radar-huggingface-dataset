# muahseol/qwen3.5-0.8b-lease-sft

## Resumen

`muahseol/qwen3.5-0.8b-lease-sft` es un ajuste fino supervisado (SFT) del modelo base `Qwen/Qwen3.5-0.8B`, publicado por el usuario muahseol en Hugging Face. El modelo está especializado en consultas sobre arrendamiento residencial (jeonse y wolse) en Corea del Sur, y se ha entrenado con pares de pregunta y respuesta sobre esa materia con el objetivo declarado de servir como modelo de referencia en ejercicios prácticos de alineación por DPO (Direct Preference Optimization).

Se trata de un modelo de 0,8 mil millones de parámetros, orientado exclusivamente al idioma coreano y con una finalidad didáctica explícita: el autor lo describe como material de práctica para un curso, no como un producto listo para producción. El ajuste se realizó con una tasa de aprendizaje de 5e-6 durante 4 épocas, empleando un prompt de sistema que instruye al modelo a responder en coreano formal y con base en los artículos de la Ley de Protección del Arrendamiento de Vivienda.

Su relevancia es limitada fuera del contexto educativo para el que fue creado. No obstante, resulta útil como ejemplo reproducible de un pipeline SFT sobre un modelo pequeño, y como punto de partida para experimentos de DPO con un dominio acotado y un corpus de referencia legal claramente delimitado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3.5-0.8B; detalles no disponibles) |
| Parámetros totales | 0,8 mil millones (aproximado, según el nombre del modelo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Pesos publicados en float32; no se documentan otras variantes |
| Idiomas soportados | Coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (carga mediante `transformers` con `dtype=torch.float32`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5. No se dispone de información detallada sobre el número de capas, dimensión oculta, mecanismo de atención ni composición del corpus de preentrenamiento original, ya que la model card no los documenta.

El ajuste fino se realizó mediante SFT completo (no LoRA ni QLoRA, según la descripción de "full fine-tuning") sobre un conjunto de datos de preguntas y respuestas de consultas de arrendamiento. Los hiperparámetros declarados son una tasa de aprendizaje de 5e-6 y 4 épocas. El prompt de sistema empleado durante el entrenamiento es: «너는 전월세 상담 챗봇이다. 주택임대차보호법 조문에 근거해 존댓말로 간결히 답한다.» («Eres un chatbot de consultas de arrendamiento. Responde de forma concisa y en registro formal basándote en los artículos de la Ley de Protección del Arrendamiento de Vivienda»). No se documenta el uso de RLHF, DPO ni decodificación especulativa en esta fase; el modelo está pensado precisamente como punto de partida para un DPO posterior.

## Capacidades

- Generación de texto en coreano orientada a consultas sobre arrendamiento residencial (jeonse y wolse).
- Respuesta en registro formal coreano (존댓말) siguiendo la instrucción del prompt de sistema.
- Citación de artículos de la Ley de Protección del Arrendamiento de Vivienda (주택임대차보호법), aunque con riesgo explícito de error.
- Conversación de un solo turno o multi-turno básica, limitada por el contexto del modelo base.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento extendido.
- Capacidad multilingüe muy restringida: el autor declara únicamente coreano.

## Casos de uso

- Práctica de alineación DPO: el modelo sirve como referencia congelada en un pipeline de DPO, donde se compara su distribución con la del modelo en entrenamiento para calcular la recompensa implícita. Es su uso principal declarado.
- Docencia de ajuste fino supervisado: permite reproducir un flujo completo de SFT sobre un modelo pequeño con un dominio acotado, sin necesidad de infraestructura de gran escala.
- Evaluación de pipelines de formación: útil para comprobar que un script de entrenamiento, tokenización y guardado en float32 funciona de extremo a extremo antes de escalar a modelos mayores.
- Generación de respuestas de referencia en coreano: puede emplearse para producir borradores de respuesta sobre arrendamiento que luego se revisan manualmente, siempre con verificación legal.
- Experimentos de evaluación de fidelidad legal: sirve para medir la tasa de citas incorrectas de artículos en modelos pequeños especializados, como caso de estudio de alucinación en dominios normativos.
- Pruebas de despliegue con `transformers` y endpoints compatibles: el tag `endpoints_compatible` permite validar integraciones de servicio en entornos de desarrollo con un modelo de 0,8B en float32.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en float32: en torno a 3,2 GB solo para los pesos (0,8B × 4 bytes), más overhead de activaciones y caché KV; un entorno de 6-8 GB es suficiente para inferencia en precisión completa.
- VRAM estimada en bf16/fp16: aproximadamente 1,6 GB para los pesos, más overhead; cabe holgadamente en GPUs de 4-6 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) puede ejecutar el modelo sin problemas; también es viable en CPU para pruebas.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU con 6 GB o más, e incluso en iGPU con suficiente memoria compartida para inferencia lenta.
- Opciones de despliegue: `transformers` (forma documentada por el autor), y previsiblemente vLLM, TGI o llama.cpp tras conversión a GGUF, aunque estas rutas no están verificadas en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| `muahseol/qwen3.5-0.8b-lease-sft` | ~0,8B | No disponible | Coreano | Apache 2.0 | SFT didáctico en dominio legal coreano |
| `Qwen/Qwen3.5-0.8B` (base) | ~0,8B | No disponible | Multilingüe | Apache 2.0 (presumible) | Modelo generalista de propósito general |
| `Qwen/Qwen2.5-0.5B-Instruct` | ~0,5B | 32 768 tokens | Multilingüe | Apache 2.0 | Modelo generalista instruido |
| `google/gemma-2-2b-it` | ~2,6B | 8 192 tokens | Multilingüe | Gemma Terms of Use | Modelo generalista instruido |

La comparación directa con alternativas generalistas no es del todo equitativa, ya que este modelo está especializado en un dominio muy estrecho y en un solo idioma. Frente al modelo base Qwen3.5-0.8B, la diferencia es el ajuste SFT en coreano legal; frente a modelos instruidos de tamaño similar, carece de alineación general y de soporte multilingüe amplio.

## Limitaciones y advertencias

- El propio autor advierte que las respuestas pueden contener artículos legales incorrectos y contenido inventado; no debe usarse en asesoramiento real.
- Modelo de propósito exclusivamente didáctico, sin validación de calidad ni evaluación publicada.
- Especializado en un único dominio (arrendamiento residencial coreano) y un único idioma (coreano); su rendimiento fuera de ese ámbito es impredecible.
- Riesgo elevado de alucinación en citas normativas, especialmente en un modelo de 0,8B sin alineación posterior.
- Pesos en float32, lo que duplica el espacio en disco y memoria frente a bf16; no se ofrecen variantes cuantizadas.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza del modelo y sus advertencias desaconsejan cualquier despliegue en producción sin supervisión humana.
- Sin información sobre sesgos específicos, datos de entrenamiento ni proceso de filtrado del corpus.
- Sin garantías de soporte, mantenimiento ni actualizaciones por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muahseol/qwen3.5-0.8b-lease-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
