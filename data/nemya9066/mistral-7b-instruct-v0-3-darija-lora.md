# nemya9066/mistral-7b-instruct-v0.3-darija-lora

## Resumen

`nemya9066/mistral-7b-instruct-v0.3-darija-lora` es un adaptador LoRA (PEFT) publicado en Hugging Face por el usuario nemya9066. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación que debe cargarse sobre el modelo base `unsloth/mistral-7b-instruct-v0.3-bnb-4bit`, una versión cuantizada a 4 bits de Mistral-7B-Instruct-v0.3 preparada por Unsloth para entrenamiento eficiente. El nombre del repositorio sugiere un ajuste fino orientado al árabe dialectal marroquí (darija), aunque la model card no lo confirma de forma explícita.

El modelo hereda la arquitectura de Mistral-7B-Instruct-v0.3: un transformer decoder-only denso de aproximadamente 7.250 millones de parámetros, con atención de ventana deslizante y una longitud de contexto de 32.768 tokens en la versión v0.3 del modelo base de Mistral AI. El adaptador en sí ocupa 0,2 GB, lo que es coherente con un rango LoRA de baja dimensión sobre las capas de atención y proyección del modelo base.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no incluye información sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia, y registra cero descargas y cero likes en el momento de la consulta. Es un artefacto de experimentación personal más que un modelo listo para producción, pero resulta útil como ejemplo de adaptación dialectal de bajo coste sobre Mistral-7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only denso (Mistral-7B-Instruct-v0.3) |
| Parametros totales | 7.250 millones (modelo base); adaptador LoRA de tamaño no especificado |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Mistral-7B-Instruct-v0.3) |
| Tipos de cuantizacion | El modelo base referenciado está en bnb-4bit; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible (el nombre sugiere darija/árabe dialectal marroquí, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Mistral-7B-Instruct-v0.3, un transformer decoder-only con atención de ventana deslizante (sliding window attention) y RoPE, que en su versión v0.3 amplió el vocabulario y el contexto hasta 32.768 tokens. La técnica LoRA congela los pesos del modelo base e introduce matrices de baja dimensión en determinadas capas, lo que reduce drásticamente el número de parámetros entrenables y el coste de ajuste. El uso del checkpoint `unsloth/mistral-7b-instruct-v0.3-bnb-4bit` indica que el entrenamiento se realizó con las optimizaciones de Unsloth sobre una base cuantizada a 4 bits, un patrón habitual para ajustes finos en GPU de consumo.

No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, la composición del corpus, el rango LoRA, la tasa de aprendizaje ni si se aplicaron técnicas de RLHF o DPO. La model card es la plantilla por defecto de Hugging Face sin rellenar, con todos los campos marcados como "[More Information Needed]". Tampoco se documenta ninguna innovación técnica adicional más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas de Mistral-7B-Instruct-v0.3.
- Razonamiento y respuesta a instrucciones en el estilo del modelo base de Mistral AI.
- Generación de código y matemáticas a nivel del modelo base (sin evaluación específica del adaptador).
- Soporte de tool calling y function calling, tal como ofrece Mistral-7B-Instruct-v0.3.
- Capacidad multilingüe del modelo base (inglés, francés, español, italiano, alemán, entre otros), aunque el adaptador podría haber desplazado el comportamiento hacia el árabe dialectal.
- Posible especialización en darija (árabe dialectal marroquí) según el nombre del repositorio, sin evidencia documentada en la model card.
- No se documenta modo thinking, visión, audio ni otras capacidades especiales.

## Casos de uso

- Experimentación con adaptación dialectal: el adaptador sirve como punto de partida para reproducir o ampliar un ajuste LoRA sobre Mistral-7B orientado a darija, cargándolo con PEFT sobre el modelo base.
- Investigación en variedades dialectales del árabe: permite comparar el comportamiento del modelo base frente al adaptado en tareas de generación y comprensión de darija, siempre que se valide con un conjunto de evaluación propio.
- Prototipado de asistentes conversacionales en árabe marroquí: útil para demostraciones internas de chat multi-turno con contexto largo (hasta 32.768 tokens), sin garantías de calidad en producción.
- Generación de contenido multilingüe con sesgo dialectal: para redactar textos que mezclen árabe estándar y darija en contextos de comunicación informal.
- Base para ajustes incrementales: al ser un adaptador LoRA ligero (0,2 GB), puede combinarse o continuarse con otros adaptadores mediante PEFT para tareas específicas.
- Docencia y formación: ejemplo práctico de cómo se publica y carga un adaptador LoRA sobre un modelo cuantizado a 4 bits con Unsloth, útil en talleres de fine-tuning.
- Evaluación comparativa de cuantización: permite estudiar cómo se comporta un adaptador entrenado sobre base bnb-4bit al aplicarse sobre otras cuantizaciones del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bnb-4bit requiere aproximadamente 4-5 GB de VRAM para los pesos, más overhead de activaciones y KV cache; en fp16 serían unos 14-15 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100 40 GB o H100 para despliegues con contexto largo; una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB pueden bastar para inferencia en 4 bits con contextos moderados.
- Cabe en GPU de consumo: sí, en configuraciones de 8-16 GB si se usa cuantización 4 bits y se limita la longitud de contexto.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador, vLLM (con soporte LoRA), llama.cpp/Ollama tras fusionar el adaptador con el modelo base y convertir a GGUF, y TGI con adaptadores PEFT.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| nemya9066/mistral-7b-instruct-v0.3-darija-lora | 7,25 B (base) + LoRA | 32.768 | no disponible | Hugging Face (0 descargas) | Adaptador experimental sin documentación |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base oficial, con tool calling y v3 tokenizer |
| unsloth/mistral-7b-instruct-v0.3-bnb-4bit | 7,25 B | 32.768 | Apache 2.0 (heredada) | Hugging Face | Versión cuantizada 4 bits para fine-tuning eficiente |
| Modelos dialectales árabes (p. ej. variantes de Jais o AceGPT) | variable | variable | variable | Hugging Face | Alternativas para árabe; no directamente comparables sin evaluación |

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre datos, hiperparámetros, evaluación ni uso previsto, lo que impide validar la calidad del ajuste.
- Licencia no declarada: no se puede asumir uso comercial; además, la licencia del adaptador debe ser compatible con la del modelo base (Apache 2.0 en Mistral-7B-Instruct-v0.3).
- Riesgo elevado de alucinación y de comportamiento inconsistente, habitual en adaptadores LoRA de bajo rango sin evaluación publicada.
- Posible sobreajuste al dialecto y pérdida de capacidades generales del modelo base, sin datos que lo confirmen o desmientan.
- El adaptador se entrenó sobre una base bnb-4bit; aplicarlo sobre otras cuantizaciones o sobre fp16 puede degradar el comportamiento.
- Idiomas soportados no confirmados: el nombre sugiere darija, pero no hay evidencia de cobertura ni de calidad en otros idiomas.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- No apto para producción sin una evaluación propia exhaustiva en el dominio objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nemya9066/mistral-7b-instruct-v0.3-darija-lora
- Modelo base (Unsloth, bnb-4bit): https://huggingface.co/unsloth/mistral-7b-instruct-v0.3-bnb-4bit
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Documentación de PEFT: https://huggingface.co/docs/peft
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Calculadora de impacto ambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019): https://arxiv.org/abs/1910.09700
