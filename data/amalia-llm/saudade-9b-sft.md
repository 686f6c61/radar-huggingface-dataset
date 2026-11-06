# amalia-llm/saudade-9b-sft

## Resumen

SAUDADE-9B-SFT es un ajuste fino por LoRA del checkpoint AMALIA-9B-0626-SFT, un modelo de lenguaje de 9.152 millones de parámetros especializado en portugués europeo. Lo publica el colectivo amalia-llm como un único modelo fusionado (los pesos del adaptador están integrados en los pesos base, en bf16), y está entrenado sobre la partición multiturno del corpus sintético conversacional SAUDADE-SFT, que acompaña al benchmark de razonamiento temporal SAUDADE para portugués europeo. El problema que aborda es concreto: la elicitación conversacional de ordenaciones temporales entre acontecimientos, un tipo de tarea que los modelos base resuelven peor cuando deben razonar en formato abierto y no en elección forzada.

El modelo parte de la familia AMALIA, presentada como un modelo de lenguaje completamente abierto para portugués europeo. El ajuste se realizó con LoRA de rango 32 sobre 290.797 diálogos del variante Clean del corpus SAUDADE-SFT, con una partición de validación de 1.461 diálogos nunca vista durante el entrenamiento. La licencia es Apache-2.0, aunque se aplican también los términos del modelo base.

La relevancia actual es doble: por un lado, cubre un hueco poco atendido en la comunidad open source, el razonamiento temporal en portugués europeo con formato conversacional; por otro, documenta de forma explícita un compromiso de rendimiento (mejora en generación abierta, caída en elección binaria) que conviene entender antes de desplegarlo. El repositorio ocupa 18,3 GB y se distribuye en formato safetensors para transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia llama según tags; detalles no disponibles) |
| Parámetros totales | 9.152.319.488 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en bf16) |
| Idiomas soportados | Portugués europeo (pt-PT); tag de idioma `pt` |
| Licencia | Apache-2.0 (aplican también los términos del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 9.152 millones de parámetros, derivado de AMALIA-9B-0626-SFT. El ajuste fino se realizó mediante LoRA de rango 32 y posteriormente se fusionó en los pesos base en bf16, de modo que el repositorio contiene un único checkpoint sin adaptadores separados. Los datos de entrenamiento son la variante Clean del corpus SAUDADE-SFT en formato `messages`: 290.797 diálogos multiturno, con 1.461 diálogos reservados para validación y nunca usados en entrenamiento. El corpus es sintético y está orientado a razonamiento temporal conversacional en portugués europeo.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición detallada del dataset más allá del recuento de diálogos, ni si hubo etapas de RLHF o DPO en este ajuste. El modelo base AMALIA, según su paper, es un modelo completamente abierto para portugués europeo, pero los detalles de su preentrenamiento no se recogen en la información proporcionada. La innovación técnica destacable de este checkpoint no es arquitectónica sino de especialización: el adaptador se entrena exclusivamente sobre diálogos temporales multiturno, lo que desplaza el comportamiento del modelo desde la respuesta de elección forzada hacia la elicitación conversacional, con el intercambio de rendimiento que se detalla en la sección de benchmarks.

## Capacidades

- Generación de texto conversacional multiturno en portugués europeo.
- Razonamiento temporal: ordenación de acontecimientos, comparación de fechas y relaciones temporales entre eventos.
- Recuperación de hechos (fact retrieval) dentro de contextos conversacionales, con distractores.
- Razonamiento multi-step en formato de diálogo, con cadenas de razonamiento (chain-of-thought) evaluadas explícitamente.
- Respuesta a preguntas del tipo "¿cuál de los dos acontecimientos ocurrió primero?" en formato abierto.
- Soporte de plantilla de chat mediante `apply_chat_template` con roles `user` y `assistant`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes autónomos.
- No se documenta capacidad de visión, audio ni modo thinking explícito.
- Capacidad multilingüe limitada al portugués (tag `pt`); no se declaran otros idiomas.

## Casos de uso

- Asistentes conversacionales en portugués europeo para atención al cliente: el modelo mantiene diálogos multiturno y puede resolver preguntas sobre el orden de eventos en un historial de incidencias o pedidos, un escenario alineado con la pista Relation with Distractors en la que el checkpoint mejora de 26,6 a 42,3 puntos de precisión de juez.
- Sistemas de preguntas y respuestas sobre documentación con referencias temporales: actas, registros médicos o expedientes administrativos donde el usuario pregunta qué ocurrió antes o después, aprovechando la especialización en ordenación temporal.
- Extracción y verificación de cronologías en pipelines de datos: dado un conjunto de hechos con marcas temporales, el modelo puede articular en lenguaje natural la secuencia correcta como paso previo a una validación automática.
- Herramientas educativas de historia o derecho portugués: el modelo puede explicar en formato conversacional la relación temporal entre normativas, tratados o acontecimientos, con la cautela de que la precisión en generación abierta es de 37,3 sobre 100 según el juez automático.
- Evaluación y anotación asistida de benchmarks temporales: sirve como generador de respuestas abiertas para comparar con otros modelos en la tarea SAUDADE, dado que el harness y las plantillas de prompt están publicados en el repositorio de código.
- Investigación en ajuste fino especializado: el checkpoint es un caso documentado de cómo un adaptador LoRA de rango 32 sobre 290.797 diálogos sintéticos mejora una pista de evaluación y degrada otra, útil como referencia metodológica en estudios de especialización.
- Prototipado de chatbots de nicho en pt-PT: al ser Apache-2.0 y caber en una GPU de 24 GB en bf16 con cuantización, es viable para pruebas internas sin coste de licencia.

## Benchmarks y rendimiento

Ordenación temporal binaria (subconjunto canónico, n = 7.435), comparado con el checkpoint base sobre el que se entrenó el adaptador:

| Modelo | Estándar | Chain-of-Thought |
|---|---:|---:|
| AMALIA-9B-0626-SFT (base) | 65,5 | 71,1 |
| SAUDADE-9B-SFT (este checkpoint, r32) | 63,6 | 66,8 |

Generación abierta (precisión media del juez sobre las dos pistas conversacionales):

| Modelo | Media | Fact Retrieval | Relation with Distractors |
|---|---:|---:|
| AMALIA-9B-0626-SFT (base) | 26,1 | 24,8 | 26,6 |
| SAUDADE-9B-SFT (este checkpoint, r32) | 37,3 | 25,7 | 42,3 |

El autor atribuye la caída en la tarea binaria a que el adaptador se entrena solo sobre diálogo temporal multiturno, un formato ausente en las pistas binarias, que son renderizaciones de elección múltiple de la tarea de ordenación. La mejora en generación abierta procede íntegramente de la pista Relation with Distractors. Las cifras del modelo base provienen de la Tabla 4 del paper y de la Tabla 5.1 de la tesis; la mejora en generación abierta (26,1 a 37,3) se reporta en la sección 4.3 del paper, y las cifras por pista del r32 en la sección 5.6 de la tesis.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,3 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 20-22 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB de pesos, aunque el autor no publica versiones GGUF ni cuantizadas.
- GPU recomendadas para bf16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits con herramientas externas.
- Opciones de despliegue: transformers (soporte nativo documentado), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp y Ollama no están documentados por el autor, aunque al ser un transformer decoder-only estándar deberían poder adaptarse.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SAUDADE-9B-SFT | 9.152 M | No disponible | Razonamiento temporal conversacional pt-PT | Apache-2.0 | Hugging Face, safetensors |
| AMALIA-9B-0626-SFT (base) | 9.152 M | No disponible | Modelo general abierto para pt-PT | No disponible en la información | Hugging Face |
| Alternativas de 7-9B para portugués (p. ej. modelos abiertos multilingües de tamaño similar) | 7.000-9.000 M | Variable | Generales, multilingües | Variable | Hugging Face |

La comparación cuantitativa directa solo es posible con el checkpoint base, para el que se dispone de cifras en las mismas evaluaciones. No se dispone de datos de benchmarks de otros modelos de tamaño similar específicos para portugués europeo en la información proporcionada, por lo que no se ofrece una comparación numérica adicional.

## Limitaciones y advertencias

- El modelo está especializado en diálogo temporal multiturno y rinde peor que su base en la tarea de ordenación binaria (63,6 frente a 65,5 en estándar; 66,8 frente a 71,1 en chain-of-thought). No debe usarse como sustituto del base para elección forzada.
- La precisión en generación abierta es de 37,3 sobre 100 según el juez automático, lo que implica una tasa de error elevada para uso en producción sin verificación humana.
- El entrenamiento se realizó exclusivamente sobre datos sintéticos (SAUDADE-SFT Clean), lo que puede introducir artefactos de estilo y distribución ausentes en texto real.
- El modelo solo declara portugués europeo; no se garantiza un comportamiento correcto en portugués de Brasil ni en otros idiomas.
- Riesgo de alucinación en hechos y fechas: la tarea de fact retrieval solo alcanza 25,7 de precisión de juez en la evaluación, por lo que no es fiable como fuente factual sin contraste externo.
- No se documentan sesgos específicos ni evaluaciones de seguridad; al derivar de un modelo base entrenado con datos no descritos en esta ficha, los sesgos de ese base se heredan.
- La licencia Apache-2.0 se aplica junto con los términos del modelo base; es necesario revisar la model card de AMALIA-9B-0626-SFT antes de un uso comercial.
- No se publican versiones cuantizadas oficiales (GGUF, AWQ, GPTQ), lo que obliga a generarlas por cuenta propia para despliegues con poca VRAM.
- No se documenta longitud de contexto, por lo que el rendimiento en conversaciones muy largas es incierto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amalia-llm/saudade-9b-sft
- Modelo base: https://huggingface.co/amalia-llm/AMALIA-9B-0626-SFT
- Dataset del benchmark: https://huggingface.co/datasets/amalia-llm/saudade-pt
- Corpus de ajuste fino: https://huggingface.co/datasets/amalia-llm/SAUDADE-SFT
- Repositorio de código y evaluación: https://github.com/Basthy28/saudade
- Paper de AMALIA: arXiv:2603.26511 (referenciado en la model card como arXiv preprint)
