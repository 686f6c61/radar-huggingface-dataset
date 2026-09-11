# MinaMila/Phi4-mini-self

## Resumen

MinaMila/Phi4-mini-self es un adaptador LoRA publicado en HuggingFace por el usuario MinaMila, entrenado sobre el modelo base microsoft/Phi-4-mini-instruct. El repositorio se distribuye con la librería PEFT (versión 0.19.1 registrada en la model card) y ocupa 0,1 GB, un tamaño coherente con un adaptador de rango bajo que no incluye los pesos completos del modelo base y que, por tanto, no puede ejecutarse de forma autónoma.

La relevancia de esta ficha es limitada y hay que ser explícito al respecto: la model card es la plantilla por defecto de HuggingFace, sin rellenar. Todos los campos de descripción, datos de entrenamiento, hiperparámetros, evaluación, sesgos e impacto ambiental aparecen como "[More Information Needed]". El repositorio no declara licencia, no declara idiomas soportados y acumula 0 descargas y 0 "likes" en el momento de la consulta.

Se trata, por tanto, de un adaptador sin documentación técnica verificable ni validación por parte de la comunidad. Cualquier uso en producción debería ir precedido de una evaluación propia del adaptador frente al modelo base, ya que no existe información pública sobre el dataset de ajuste, el rango LoRA, los módulos objetivo ni el régimen de entrenamiento empleado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso. Confirmado por las etiquetas del repositorio (`peft`, `lora`, `base_model:adapter:microsoft/Phi-4-mini-instruct`). Rango, alpha y módulos objetivo: no disponible |
| Parámetros totales | No disponible para el adaptador (el repositorio pesa 0,1 GB). El modelo base microsoft/Phi-4-mini-instruct declara 3,8 mil millones de parámetros según su documentación pública, dato no verificable en la información proporcionada |
| Parámetros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible en la ficha del adaptador. El modelo base declara 128 000 tokens de contexto según su documentación pública, dato no verificable en la información proporcionada |
| Tipos de cuantización | No disponible. Los pesos del adaptador se distribuyen en safetensors sin cuantizar; la cuantización aplicable es la del modelo base (no documentada por el autor) |
| Idiomas soportados | No disponible |
| Licencia | No disponible. El repositorio no declara licencia; el modelo base se publica bajo licencia MIT según su documentación |
| Formato de pesos | safetensors (adaptador LoRA compatible con PEFT y transformers) |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente un adaptador LoRA, según indican las etiquetas `peft` y `lora` y el campo `library_name: peft`. La técnica subyacente es Low-Rank Adaptation, que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas; esto explica que el artefacto ocupe 0,1 GB frente a los varios gigabytes que requerirían los pesos completos del modelo base. La model card indica que el adaptador se generó con PEFT 0.19.1.

No hay ningún dato publicado sobre el proceso de ajuste: se desconoce el dataset utilizado, el número de tokens de entrenamiento, la composición de los datos, el rango y alpha de las matrices LoRA, las capas objetivo, la tasa de aprendizaje, el número de épocas ni si se emplearon técnicas de alineación como RLHF, DPO o SFT supervisado. Tampoco se documenta si el ajuste se realizó con precisión mixta o con cuantización del modelo base. El nombre del repositorio ("self") sugiere un ajuste orientado a personalización de estilo o identidad conversacional, pero esto es una inferencia a partir del nombre, no un dato confirmado.

El modelo base, microsoft/Phi-4-mini-instruct, es un transformer decoder-only denso orientado a instrucciones, según la documentación pública de Microsoft; al no aparecer esa información en la model card del adaptador, se indica aquí únicamente como referencia del punto de partida.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y las etiquetas incluyen `conversational`, por lo que el artefacto está pensado para diálogo multi-turno.
- Razonamiento, matemáticas y código: no disponible para el adaptador. El modelo base declara capacidades en estas áreas, pero no hay ninguna evaluación que confirme que el ajuste LoRA las conserva.
- Tool calling / function calling: no disponible. No se documenta si el adaptador mantiene el soporte de llamadas a herramientas del modelo base.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible. El repositorio no declara idiomas.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponible. El repositorio no incluye módulos multimodales (tamaño de 0,1 GB y etiquetas de solo texto).
- Integración con el ecosistema transformers/PEFT: confirmada por las etiquetas y la versión de PEFT registrada.

## Casos de uso

- Prototipado local de asistentes conversacionales: cargando el adaptador con PEFT sobre el modelo base en 4 bits, es posible disponer de un asistente de ~3,8 mil millones de parámetros en un portátil con GPU de 8 GB, adecuado para pruebas de concepto sin coste de API.
- Personalización de tono o identidad conversacional: dado el nombre del repositorio ("self"), el caso de uso más plausible es ajustar el estilo de respuesta del modelo base a una persona o marca concreta; conviene validar con un conjunto de evaluación propio que el ajuste no degrada las capacidades originales.
- Extracción de información estructurada: uso del modelo como extractor de entidades o generador de JSON en pipelines internos, aprovechando que el adaptador se integra sin cambios en el ecosistema transformers.
- Preprocesado en canalizaciones RAG: generación de resúmenes de documentos y reformulación de consultas antes de pasarlas a un motor de recuperación, con despliegue en una única GPU de gama media.
- Generación de borradores de documentación técnica: redacción asistida de textos internos donde la revisión humana posterior absorbe el riesgo de alucinación, habitual en modelos de este tamaño.
- Comparación de adaptadores LoRA (A/B testing): el artefacto sirve como elemento de comparación frente al modelo base sin ajustar, para medir el efecto del fine-tuning en tareas concretas antes de decidir su adopción.
- Formación y experimentación académica: ejemplo práctico de flujo completo con PEFT (entrenamiento de adaptador, publicación en HuggingFace, carga posterior) para cursos o talleres sobre ajuste eficiente de parámetros.
- Inferencia en entornos aislados o sin conectividad: al ejecutarse en local con pesos abiertos del modelo base, permite desplegar asistentes en infraestructuras sin acceso a APIs externas, sujeto a que la licencia aplicable lo permita (extremo no aclarado en el repositorio).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del adaptador incluye la sección de evaluación completamente vacía ("[More Information Needed]"), sin métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de referencia, y sin comparación con el modelo base ni con otros adaptadores.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamaño declarado del modelo base (3,8 mil millones de parámetros) y no proceden de ninguna medición publicada por el autor del adaptador.

| Precisión | VRAM estimada (solo pesos) | GPU de referencia |
|---|---|---|
| fp16 / bf16 | ~7,6 GB | RTX 3060 12 GB, RTX 4070, L4 |
| int8 | ~3,8 GB | RTX 3060, RTX 4060, T4 |
| 4 bits (NF4, GPTQ, AWQ) | ~2,2-3 GB | GTX 1660 6 GB, RTX 3050 8 GB, iGPU con memoria unificada |

- El adaptador en sí ocupa 0,1 GB y no aporta requisitos de VRAM significativos; el coste lo determina el modelo base.
- A contextos largos (hasta 128 000 tokens en el modelo base) hay que añadir la memoria de la caché KV, cuyo tamaño depende de la configuración de atención del base y no está documentado para este adaptador.
- GPU recomendadas para servicio: A100, H100 o L40S para lotes grandes y contexto largo; RTX 4090 para desarrollo individual con fp16 y contexto moderado.
- Cabe en GPU de consumo: sí, en cualquiera con 8 GB o más usando cuantización de 4 bits, y en 12 GB con fp16 (con margen ajustado).
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM (soporta adaptadores LoRA), TGI, y llama.cpp u Ollama, que requieren fusionar el adaptador con el modelo base y convertir el resultado a GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

No existen adaptadores comparables publicados con documentación suficiente para una comparación rigurosa, y este repositorio no aporta métricas propias. A modo de referencia, la tabla siguiente compara el modelo base del que depende este adaptador con alternativas de tamaño similar; los datos provienen de la documentación pública de cada modelo y no están verificados en la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| microsoft/Phi-4-mini-instruct (base de este adaptador) | 3,8 mil millones | 128 000 tokens | MIT | Pesos abiertos en HuggingFace |
| Meta Llama-3.2-3B-Instruct | 3,21 mil millones | 128 000 tokens | Licencia comunitaria Llama 3.2 | Pesos abiertos con registro |
| Qwen2.5-3B-Instruct | 3,09 mil millones | 32 768 tokens (ampliable con YaRN) | Apache 2.0 | Pesos abiertos en HuggingFace |
| Google Gemma-2-2B-it | 2,6 mil millones | 8192 tokens | Términos de uso de Gemma | Pesos abiertos con aceptación de términos |

MinaMila/Phi4-mini-self no puede compararse directamente con estos modelos: es un adaptador, no un modelo completo, y no publica evaluación alguna que permita situarlo por encima o por debajo de su propio modelo base.

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla por defecto sin rellenar, por lo que no hay información sobre datos de entrenamiento, hiperparámetros ni evaluación.
- Licencia no declarada: el repositorio no especifica licencia, lo que deja en el aire la legalidad del uso comercial. El modelo base se publica bajo MIT, pero eso no determina automáticamente la licencia del adaptador.
- Sin validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta; no hay evidencia de uso real ni informes de terceros.
- No es autónomo: requiere descargar y cargar el modelo base microsoft/Phi-4-mini-instruct (varios gigabytes) además del adaptador de 0,1 GB.
- Riesgo de alucinación: heredado del modelo base, no evaluado ni corregido por este ajuste.
- Riesgo de degradación por sobreajuste: al desconocerse el dataset de ajuste, no puede descartarse olvido catastrófico ni una pérdida de capacidades del modelo base fuera del dominio entrenado.
- Alineación de seguridad no verificada: un ajuste LoRA puede alterar el comportamiento del modelo base ante peticiones problemáticas; no hay evaluación de seguridad publicada.
- Idiomas: no declarados. La documentación del modelo base está orientada principalmente al inglés, pero no hay confirmación para este adaptador.
- Metadatos dudosos: la fecha de creación indicada en el repositorio (2026-09-10) resulta anómala, lo que sugiere posibles errores en los metadatos del propio repositorio.
- Recomendación: antes de cualquier uso en producción, evaluar el adaptador frente al modelo base sin ajustar con un conjunto de prueba propio y revisar la licencia aplicable con asesoramiento legal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MinaMila/Phi4-mini-self
- Modelo base: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, calculadora de impacto ambiental del aprendizaje automático): https://arxiv.org/abs/1910.09700
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (páginas de ayuda de YouTube y de la comunidad Zhihu), por lo que no se incluye ningún enlace adicional procedente de esa búsqueda.
