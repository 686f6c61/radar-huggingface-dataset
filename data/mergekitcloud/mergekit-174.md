# MergekitCloud/mergekit-174

## Resumen

MergekitCloud/mergekit-174 es un modelo de lenguaje de 14.765.947.904 parámetros (aproximadamente 14,8 mil millones) obtenido mediante la fusión de dos modelos preentrenados: RDson/WomboCombo-R1-Coder-14B-Preview y Sakalti/Saka-14B. La fusión se ha realizado con la herramienta mergekit empleando el método SLERP (interpolación esférica), una técnica que combina los pesos de ambos modelos a lo largo de la esfera unitaria para preservar mejor la geometría del espacio de parámetros que una media lineal simple. El modelo base de referencia y origen del tokenizador es Sakalti/Saka-14B.

El resultado es un modelo de arquitectura transformer densa (familia Qwen2, según los tags del repositorio) orientado a generación de texto y conversación, con plantilla de chat ChatML. La configuración de la fusión aplica un coeficiente de interpolación distinto por tipo de capa: 0,4 para la atención (self_attn), 0,7 para las capas MLP y 0,5 como valor por defecto para el resto, lo que desplaza el equilibrio hacia el modelo de código en la atención y hacia el modelo base en las capas feed-forward.

Es relevante ahora porque ejemplifica un patrón habitual en el ecosistema open source: la creación de variantes especializadas mediante merge de pesos sin entrenamiento adicional, a bajo coste computacional. No obstante, el repositorio no publica información sobre licencia, idiomas, datos de entrenamiento ni evaluaciones, por lo que su adopción en producción exige una validación empírica previa por parte del equipo que lo integre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (familia Qwen2, segun tags del repositorio) |
| Parametros totales | 14.765.947.904 (aprox. 14,8 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; al ser un modelo transformers con pesos en bfloat16, es compatible con cuantizaciones habituales (GGUF, AWQ, GPTQ) mediante herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es una fusión SLERP de dos checkpoints de aproximadamente 14 B de parámetros cada uno: RDson/WomboCombo-R1-Coder-14B-Preview y Sakalti/Saka-14B. La arquitectura subyacente es un transformer denso de la familia Qwen2, con atención por self-attention estándar y capas MLP, tal como refleja la configuración de merge por filtros (`self_attn`, `mlp`). El tokenizador y la plantilla de chat (ChatML) provienen de Sakalti/Saka-14B, que actúa como modelo base de la fusión.

La innovación técnica reside en el propio método de fusión: SLERP interpola los vectores de pesos de ambos modelos normalizados sobre la esfera unitaria, con un coeficiente `t` que varía por tipo de capa (0,4 en atención, 0,7 en MLP, 0,5 por defecto). Esto permite conservar en mayor medida las direcciones dominantes de cada modelo padre que una interpolación lineal. No se dispone de información sobre el dataset de entrenamiento original de los modelos fusionados, el número de tokens procesados, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación adicional en decodificación o atención.

## Capacidades

- Generación de texto autoregresiva en formato conversacional (plantilla ChatML).
- Razonamiento y generación de código, heredados del componente WomboCombo-R1-Coder.
- Conversación multi-turno, dado el formato de chat configurado.
- Soporte de tool calling y function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: no disponible (no documentado).
- Capacidades especiales (modo thinking, visión, audio): no disponible (no documentado).

## Casos de uso

- Asistencia a la programación en IDE: el modelo puede integrarse como backend de autocompletado y generación de funciones en editores, aprovechando el componente de código de su modelo padre WomboCombo-R1-Coder para sugerencias contextuales dentro de un mismo fichero.
- Generación de código en pipelines de CI/CD: dado su tamaño de 14,8 B, puede desplegarse en una GPU de 24 GB con cuantización de 8 bits para tareas de revisión automática de parches, generación de tests unitarios o resúmenes de diffs, siempre que se valide previamente su calidad en el dominio concreto.
- Chatbot de soporte técnico especializado: la plantilla ChatML y la naturaleza conversacional del modelo permiten construir asistentes multi-turno para dominios acotados, con recuperación aumentada (RAG) para inyectar documentación y mitigar alucinaciones.
- Prototipado rápido de aplicaciones conversacionales: al ser un merge sin entrenamiento adicional, sirve como punto de partida de bajo coste para experimentar con distintas temperaturas y prompts antes de invertir en un modelo ajustado.
- Generación de documentación técnica: el modelo puede redactar docstrings, READMEs y explicaciones de APIs a partir de fragmentos de código, aprovechando la combinación de capacidades de código y lenguaje natural.
- Investigación sobre fusión de modelos: el checkpoint es un caso de estudio reproducible de SLERP con coeficientes por capa, útil para equipos que investiguen técnicas de model merging y quieran comparar el efecto de distintos valores de `t` en atención y MLP.
- Entornos de experimentación con transformers: al estar publicado en formato safetensors y con `library_name: transformers`, se puede cargar directamente con `AutoModelForCausalLM` para evaluaciones internas y ajuste fino ligero (LoRA) sobre dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 29,5 GB solo para los pesos, más el espacio de activaciones y caché KV; se recomienda al menos 40 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 15-16 GB para los pesos, lo que permite ejecución en GPUs de 24 GB (RTX 4090, A10G, L4).
- VRAM estimada en cuantización de 4 bits: aproximadamente 8-9 GB para los pesos, viable en GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti, A4000).
- GPU recomendadas: A100 40/80 GB o H100 para bfloat16 sin cuantizar y despliegue de alta concurrencia; RTX 4090 o L40S para cuantización de 8 bits; RTX 3090/4090 para 4 bits en entornos de desarrollo.
- Cabe en GPU de consumo: sí, en cuantizaciones de 8 y 4 bits; en bfloat16 excede los 24 GB de una RTX 4090.
- Opciones de despliegue: vLLM y TGI para servir con batching continuo; llama.cpp y Ollama tras convertir los pesos a GGUF; transformers con `AutoModelForCausalLM` para integración en código Python.
- Latencia y throughput estimados: no disponibles (no hay mediciones publicadas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MergekitCloud/mergekit-174 | 14,8 B | No disponible | No disponible | safetensors (bf16) | Fusión SLERP de dos checkpoints de 14 B; sin benchmarks publicados |
| Qwen2.5-14B-Instruct | 14,8 B | 32.768 tokens (ampliable) | Apache 2.0 (segun modelo original) | safetensors, GGUF | Modelo base de referencia de la familia; con evaluaciones publicadas |
| RDson/WomboCombo-R1-Coder-14B-Preview | ~14 B | No disponible | No disponible | safetensors | Uno de los modelos padre, orientado a código y razonamiento |
| Sakalti/Saka-14B | ~14 B | No disponible | No disponible | safetensors | Modelo base y origen del tokenizador y la plantilla ChatML |

La comparativa se limita a los datos públicos de los repositorios; no se dispone de métricas de rendimiento del modelo fusionado que permitan una comparación cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card no incluye licencia, idiomas, datos de entrenamiento ni evaluación, lo que impide determinar su idoneidad legal y técnica para uso comercial.
- Riesgo de alucinación: al ser una fusión de pesos sin alineación documentada, no hay garantías sobre la calibración de las respuestas ni sobre la frecuencia de afirmaciones falsas.
- Sesgos desconocidos: al no documentarse los datasets de los modelos padre, no es posible evaluar sesgos de género, idioma, raza o dominio.
- Contexto no especificado: se desconoce la longitud máxima de contexto soportada, por lo que no debe asumirse un valor concreto sin probarlo empíricamente.
- Idiomas no garantizados: aunque la familia Qwen2 suele tener buen rendimiento multilingüe, no hay confirmación para este checkpoint concreto.
- Licencia no disponible: no debe utilizarse en producción comercial sin aclarar previamente los términos legales con el autor del repositorio.
- Naturaleza experimental: se trata de un merge de conveniencia publicado por una cuenta de agregación (MergekitCloud), sin señales de mantenimiento ni de validación por parte de la comunidad (0 descargas, 0 likes en el momento de la consulta).
- Compatibilidad de tokenizador: al usar el tokenizador de Sakalti/Saka-14B, las plantillas y tokens especiales deben respetarse estrictamente para evitar degradación en la generación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MergekitCloud/mergekit-174
- Modelo padre RDson/WomboCombo-R1-Coder-14B-Preview: https://huggingface.co/RDson/WomboCombo-R1-Coder-14B-Preview
- Modelo padre Sakalti/Saka-14B: https://huggingface.co/Sakalti/Saka-14B
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Referencia sobre SLERP: https://en.wikipedia.org/wiki/Slerp
