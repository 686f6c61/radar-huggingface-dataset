# gmxn/C3LM

## Resumen

C3LM (Chemistry Constraint–Consistent Language Model) es un modelo de lenguaje especializado en retrosíntesis de un solo paso (*single-step retrosynthesis*), desarrollado por el autor `gmxn` a partir del modelo base LiquidAI/LFM2-2.6B. El modelo se ha afinado mediante *supervised fine-tuning* (SFT) sobre un conjunto combinado de los datasets CREED y USPTO-full, y está orientado a predecir los reactivos necesarios para obtener un producto químico dado en formato SMILES.

El modelo parte de la arquitectura LFM2 de Liquid AI, un transformer de 2.725.747.712 parámetros totales (aproximadamente 2,7 mil millones), y hereda su tokenizador y su plantilla de chat conversacional. La especialización química se implementa mediante un esquema de tokenización de SMILES con tokens especiales (`<sm_...>`) que aísla los átomos y símbolos químicos, y mediante un formato de respuesta que envuelve los reactivos en etiquetas `<smiles>` y emplea un bloque de razonamiento (`/think`).

Su relevancia radica en que aborda una tarea central en el descubrimiento de fármacos y la síntesis química computacional (la retrosíntesis), y lo hace sobre un modelo base pequeño y desplegable en hardware modesto. El checkpoint se publica con licencia LFM1.0 (etiquetada como `other` en Hugging Face), solo en inglés, y viene acompañado de un artículo en arXiv (2602.03554) sobre la evaluación de benchmarks de retrosíntesis de un solo paso para LLMs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (LFM2, modelo base LiquidAI/LFM2-2.6B) |
| Parametros totales | 2.725.747.712 |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de carga usa bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | LFM1.0 (license_name: lfm1.0; en Hugging Face aparece como `other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

C3LM se inicializa desde LiquidAI/LFM2-2.6B, un modelo de la familia LFM2 de Liquid AI, y se afina con SFT sobre la combinación de los datasets CREED y USPTO-full. La información disponible no detalla la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO; únicamente se indica que el ajuste fue supervisado.

La innovación técnica destacable es el tratamiento de las cadenas SMILES: el modelo espera que las moléculas se introduzcan tokenizadas con el esquema `isolate_sequence`, que convierte cada átomo o símbolo químico en un token especial (`<sm_C>`, `<sm_=O>`, etc.), y devuelve la respuesta dentro de etiquetas `<smiles>`. La generación recomendada emplea `temperature=0.3`, `min_p=0.15`, `repetition_penalty=1.05` y `max_new_tokens=512`, con un bloque de razonamiento previo (`/think`) antes de la respuesta final. No se dispone de información sobre mecanismos adicionales como decodificación especulativa o atención lineal en este checkpoint.

## Capacidades

- Generación de texto conversacional en inglés mediante plantilla de chat (`apply_chat_template`).
- Retrosíntesis de un solo paso: dado un producto en SMILES, propone los reactivos que podrían haberlo formado.
- Razonamiento químico estructurado: emite un bloque de pensamiento (`/think`) antes de la respuesta final.
- Manejo de SMILES tokenizados con tokens especiales de átomos y símbolos químicos.
- Salida estructurada en etiquetas `<smiles>`, apta para parseo automático.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (visión, audio): no disponibles.

## Casos de uso

- Planificación de rutas sintéticas en descubrimiento de fármacos: dado un compuesto objetivo en SMILES, el modelo propone reactivos candidatos para la última etapa de síntesis, lo que permite a los químicos computacionales priorizar rutas antes de la validación experimental.
- Generación de librerías de reacciones para cribado virtual: integrado en pipelines que enumeran productos y necesitan retroceder a precursores comerciales, el modelo acelera la construcción de grafos de síntesis.
- Asistencia a químicos de laboratorio: un chatbot especializado que responde en lenguaje natural a preguntas sobre qué reactivos podrían dar lugar a un producto, con salida parseable en `<smiles>`.
- Enriquecimiento de bases de datos de reacciones: uso del modelo para proponer reactivos y contrastarlos con registros de patentes o literatura (USPTO), ayudando a detectar entradas incompletas.
- Docencia y formación en química orgánica: generación de ejemplos de retrosíntesis para explicar desconexiones y grupos funcionales, con el bloque de razonamiento como material didáctico.
- Evaluación comparativa de métodos de retrosíntesis: al ser un checkpoint abierto y pequeño, sirve como línea base reproducible frente a sistemas basados en búsqueda o en modelos mayores.
- Prototipado en hardware de consumo: al tener ~2,7 mil millones de parámetros, puede desplegarse en una GPU de gama alta para experimentación rápida sin infraestructura de centro de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~2,7 mil millones de parámetros, en bfloat16 los pesos ocupan aproximadamente 5,5 GB, por lo que se necesita margen adicional para activaciones y caché KV.
- GPU recomendadas: no especificadas por el autor; el ejemplo de carga usa `device_map="auto"` y sugiere `flash_attention_2` en GPU compatibles.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8-12 GB o más de VRAM (estimación basada en el tamaño de los pesos, no confirmada por el autor).
- Opciones de despliegue: `transformers` (biblioteca indicada en la model card). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| C3LM | 2.725.747.712 | no disponible | Retrosíntesis de un solo paso | LFM1.0 | Hugging Face (`gmxn/C3LM`) |
| LiquidAI/LFM2-2.6B | ~2,6 mil millones | no disponible | Generación de texto general | LFM1.0 | Hugging Face |
| Otros modelos de retrosíntesis | no disponible | no disponible | Retrosíntesis | no disponible | no disponible |

No se dispone de información sobre modelos comparables específicos de retrosíntesis en la documentación proporcionada; la comparación con el modelo base es la única referencia directa disponible.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés; no se garantiza un comportamiento correcto en otros idiomas.
- Es un modelo especializado: fuera de la retrosíntesis y la química, su calidad como asistente general no está documentada y puede degradarse respecto al modelo base.
- Riesgo de alucinación química: puede proponer reactivos no válidos o sintéticamente implausibles; toda salida debe validarse con herramientas químicas (por ejemplo, ChemCensor) y criterio experto.
- El formato de entrada es estricto: requiere la tokenización con `isolate_sequence` y el uso de la plantilla de chat; un uso incorrecto del formato puede producir respuestas malformadas.
- No se documentan sesgos específicos ni datos sobre la composición del dataset de entrenamiento (CREED + USPTO-full), lo que limita la evaluación de cobertura y sesgos.
- Licencia LFM1.0: es necesario revisar sus términos antes de un uso comercial; la model card la etiqueta como `other`.
- No hay información publicada sobre benchmarks, contexto máximo ni cuantizaciones soportadas, lo que dificulta planificar su uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gmxn/C3LM
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B
- Artículo (arXiv): https://arxiv.org/abs/2602.03554
- Repositorio ChemCensor: https://github.com/insilicomedicine/ChemCensor
