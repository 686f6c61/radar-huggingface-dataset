# CopyleftCultivars/qwen3.5-2b-natural-farming-v5

## Resumen

Qwen3.5-2B Natural Farming v5 es un ajuste fino (fine-tune) mediante LoRA del modelo base Qwen/Qwen3.5-2B, fusionado en los pesos base en bf16 y publicado en formato safetensors por el usuario CopyleftCultivars. El modelo está especializado en conversación sobre agricultura natural (natural farming) y en la invocación de herramientas (tool calling), con seis herramientas definidas, entre ellas una calculadora de recetas de bioacumuladores. Con 1.881.825.088 parámetros (~1,88 mil millones) y licencia Apache-2.0, se posiciona como un modelo pequeño orientado a despliegue en dispositivo (on-device).

La relevancia del modelo radica en su enfoque de dominio vertical: en lugar de un asistente generalista, se entrena para decidir cuándo invocar una herramienta y redactar el texto que rodea el resultado, delegando el cálculo numérico a las tablas de datos de la propia aplicación. Existe una variante convertida para el motor Cactus y usada por la aplicación Android Natural Farming Chat, lo que indica un caso de uso móvil real.

La información pública disponible es escasa: la model card no detalla la composición del dataset de ajuste fino (no liberado), no publica resultados de benchmarks y no especifica la longitud de contexto ni los tipos de cuantización soportados más allá de la variante Cactus cq4. Esta ficha refleja únicamente los datos verificables en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 1.881.825.088 (~1,88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 en el repo principal; variante cq4 (motor Cactus) en repo separado; otros formatos no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, 2 shards), con `model.safetensors.index.json`, `config.json`, `generation_config.json`, `tokenizer.json`, `tokenizer_config.json` y `chat_template.jinja` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 (pipeline `text-generation`, tag `qwen3_5_text`), del que no se detallan en la información disponible ni la configuración de capas, ni la atención, ni la longitud de contexto nativa. Sobre los pesos del modelo base Qwen/Qwen3.5-2B se aplicó un ajuste fino con LoRA orientado a conversación de dominio (agricultura natural) y a tool calling, y posteriormente se fusionó la adaptación en los pesos base en precisión bf16, generando dos shards safetensors.

No se especifican el número de tokens de entrenamiento, la composición del dataset (el autor indica explícitamente que los datos de ajuste fino no se liberan), ni si se emplearon técnicas de RLHF, DPO o preferencias. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. La model card menciona que se trata de la "recipe v5" (candidato 4 en el espacio de trabajo de benchmarks del autor), lo que sugiere un proceso iterativo de recetas de entrenamiento, pero sin datos públicos sobre los criterios de selección.

## Capacidades

- Generación de texto conversacional en inglés orientada a preguntas y respuestas sobre agricultura natural.
- Tool calling / function calling: el modelo decide cuándo invocar seis herramientas definidas, incluida una calculadora de recetas de bioacumuladores.
- Redacción del texto que acompaña al resultado de la herramienta, dejando el cálculo numérico a las tablas de datos de la aplicación.
- Integración con plantilla de chat (`chat_template.jinja`), lo que facilita su uso en pipelines conversacionales con transformers.
- Compatibilidad con endpoints (`endpoints_compatible` según los tags del repo).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio, modo thinking explícito ni razonamiento multi-paso autónomo más allá del uso de herramientas.

## Casos de uso

- Asistente de agricultura natural en aplicación móvil: el modelo responde dudas sobre prácticas de cultivo y decide cuándo llamar a la calculadora de bioacumuladores; es el uso real documentado por la app Natural Farming Chat en Android.
- Cálculo asistido de recetas: el modelo identifica la intención del usuario, invoca la herramienta correspondiente y presenta el resultado numérico calculado por las tablas de la aplicación, reduciendo el riesgo de errores aritméticos del propio modelo.
- Despliegue on-device: la variante cq4 para el motor Cactus permite ejecutar el modelo en dispositivos Android, útil para escenarios sin conectividad en campo.
- Chatbot de soporte técnico agrícola: con seis herramientas definidas, puede enrutar consultas a la herramienta adecuada y mantener conversaciones multi-turno con la plantilla de chat incluida.
- Prototipado de asistentes de dominio vertical: sirve como base para experimentar con ajustes finos LoRA fusionados en modelos de ~2B parámetros para nichos específicos.
- Evaluación de tool calling en modelos pequeños: el arnés de benchmarks del autor (bioaccumulator-benchmark) permite reproducir la evaluación de la selección de herramientas en este tamaño de modelo.
- Integración en pipelines de transformers: al publicarse en safetensors bf16 con tokenizer y chat template, puede cargarse directamente con la librería transformers para pruebas o servicios ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona la existencia de un arnés de evaluación (bioaccumulator-benchmark) y que este modelo es el "candidato 4" de un espacio de trabajo de benchmarks, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de precisión en tool calling.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,8 GB solo para pesos (1,88 B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB según longitud de contexto y batch.
- La variante cq4 (motor Cactus) reduce el peso a aproximadamente 1 GB, adecuada para dispositivos móviles.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16 (RTX 3060, RTX 4060, RTX 4090); A100 y H100 son sobredimensionadas para este tamaño y solo tendrían sentido para serving con alto paralelismo.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más en bf16 y en configuraciones de 4 GB con cuantización de 8 bits o inferior.
- Opciones de despliegue: transformers (formato nativo), motor Cactus (variante cq4 para Android); compatibilidad con vLLM, llama.cpp, Ollama o TGI no está documentada en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B Natural Farming v5 | ~1,88 B | No disponible | Agricultura natural + tool calling | Apache-2.0 | HuggingFace (repo propio) + variante cq4 |
| Qwen/Qwen3.5-2B (base) | ~1,88 B | No disponible | Generalista | Apache-2.0 (según modelo base) | HuggingFace |
| Alternativas de ~2B con tool calling | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparación cuantitativa con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor advierte explícitamente de que es un modelo de 2B parámetros y puede equivocarse; su consejo debe tratarse como información y no como sustituto de la experiencia local.
- Sesgos conocidos: no documentados; al entrenarse en un dominio específico y solo en inglés, puede reflejar sesgos de las prácticas agrícolas representadas en los datos de ajuste (no liberados).
- Riesgo de alucinación: relevante en un modelo pequeño de dominio; el diseño mitiga parte del riesgo delegando los cálculos a las herramientas, pero el texto generado alrededor del resultado puede contener imprecisiones.
- Limitaciones de idioma: solo inglés según la model card; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada: no se puede planificar su uso en conversaciones largas sin verificación empírica.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B y de la variante cq4 por separado.
- Los datos de ajuste fino no se liberan, lo que dificulta la auditoría del comportamiento y la reproducibilidad del entrenamiento.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia pública de validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CopyleftCultivars/qwen3.5-2b-natural-farming-v5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante para motor Cactus (cq4): https://huggingface.co/CopyleftCultivars/qwen3.5-2b-natural-farming-v5-cactus-cq4
- Código de entrenamiento y app: https://github.com/CopyleftCultivars/qwen3.5-finetune
- Arnés de benchmarks: https://github.com/CopyleftCultivars/bioaccumulator-benchmark
