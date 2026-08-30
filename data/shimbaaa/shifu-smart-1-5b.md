# shimbaaa/shifu-smart-1.5b

## Resumen

shifu-smart-1.5b es un modelo de lenguaje de tipo decoder basado en la arquitectura Gemma 3, desarrollado por el usuario shimbaaa como un fine-tuning del modelo `unsloth/gemma-3-1b-it-bnb-4bit`. A pesar de su nombre, el modelo tiene 999.885.952 parámetros (aproximadamente 1B), no 1.5B. Se distribuye bajo licencia Apache-2.0 y está orientado a generación de texto conversacional en inglés.

El modelo fue entrenado con la librería Unsloth y el framework TRL de Hugging Face, lo que permitió un entrenamiento aproximadamente dos veces más rápido que un fine-tuning convencional. Al estar basado en Gemma 3, hereda las capacidades generales de ese modelo base, aunque no se han publicado detalles específicos sobre el dataset de fine-tuning ni sobre el rendimiento en tareas concretas. Su relevancia actual radica en ser un modelo pequeño, ligero y de código abierto, adecuado para despliegues en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Gemma 3 text) |
| Parametros totales | 999.885.952 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Gemma-3-1B-it soporta 32k tokens, pero no se confirma para este fine-tuning) |
| Tipos de cuantizacion | no disponible (el modelo base se entrenó en 4-bit bnb, pero el formato de publicación no se especifica) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `unsloth/gemma-3-1b-it-bnb-4bit`, que a su vez es una versión cuantizada en 4 bits del modelo instructivo Gemma-3-1B de Google. La arquitectura subyacente es un transformer decoder estándar con atención causal, diseñado para generación de texto autoregresiva. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

El entrenamiento se realizó con la librería Unsloth, que optimiza el fine-tuning mediante kernels eficientes y reducción de memoria, y con TRL (Transformer Reinforcement Learning) de Hugging Face. La model card indica que el entrenamiento fue aproximadamente dos veces más rápido que un enfoque estándar, pero no se detallan los hiperparámetros ni la duración exacta.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Gemma-3-1B-it.
- Razonamiento básico y respuesta a instrucciones, propio de un modelo instructivo de 1B.
- Soporte de tool calling y function calling: no confirmado específicamente para este fine-tuning, aunque Gemma-3-1B-it incluye capacidades de tool use en su versión original.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- No se han documentado capacidades especiales adicionales (visión, audio, thinking mode) en la información disponible.

## Casos de uso

- Chatbots ligeros para atención al cliente: al ser un modelo de ~1B, puede desplegarse en servidores modestos o en edge devices para gestionar conversaciones sencillas en inglés, con respuestas rápidas y bajo consumo de recursos.
- Asistente de documentación técnica: puede generar respuestas a preguntas frecuentes sobre productos o servicios, integrado en sistemas de ticketing o bases de conocimiento.
- Generación de borradores de correo o mensajes: útil para redactar textos cortos en inglés, como respuestas de correo electrónico o publicaciones en redes sociales, con supervisión humana.
- Educación y tutoría básica: puede servir como tutor virtual para explicar conceptos simples en inglés, aunque su capacidad de razonamiento profundo es limitada por su tamaño.
- Prototipado rápido de aplicaciones de IA: ideal para desarrolladores que necesitan un modelo pequeño y de código abierto para validar ideas o crear demos sin incurrir en costes de API.
- Fine-tuning adicional para dominios específicos: al ser un modelo abierto y ligero, puede reentrenarse sobre datos propios para tareas concretas como clasificación de texto o extracción de información.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: al tener ~1B parámetros, en cuantización de 4 bits puede caber en GPUs con 4-6 GB de VRAM; en precisión completa (fp16) necesitaría alrededor de 2 GB de VRAM para los pesos, más memoria para activaciones y contexto.
- GPU recomendadas: tarjetas consumer como NVIDIA GTX 1660 Super (6 GB), RTX 2060 (6 GB), RTX 3060 (12 GB) o superiores. También puede ejecutarse en CPU con suficiente RAM, aunque con mayor latencia.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp, Ollama y TGI (text-generation-inference), según las etiquetas del repositorio.
- Latencia y throughput: no se han publicado mediciones específicas. Para un modelo de 1B, se espera una latencia de decenas de milisegundos por token en GPUs modernas, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente con otros modelos. A modo orientativo, se puede comparar con alternativas de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| shifu-smart-1.5b | ~1B | no disponible | Apache-2.0 | Fine-tune de Gemma-3-1B-it |
| Qwen2.5-1.5B-Instruct | 1.5B | 32k | Apache-2.0 | Modelo instructivo generalista |
| Gemma-2-2B-it | 2B | 8k | Gemma license | Modelo instructivo de Google |
| Llama-3.2-1B-Instruct | 1B | 128k | Llama license | Modelo instructivo de Meta |

Sin benchmarks publicados, no es posible establecer una comparativa objetiva de rendimiento.

## Limitaciones y advertencias

- Al ser un modelo pequeño (~1B), su capacidad de razonamiento complejo, matemáticas avanzadas y generación de código es limitada en comparación con modelos de mayor tamaño.
- No se ha documentado el dataset de fine-tuning, por lo que se desconocen posibles sesgos o alucinaciones específicas.
- El modelo está etiquetado únicamente para inglés; su rendimiento en otros idiomas no está garantizado.
- No se han publicado evaluaciones de seguridad ni de robustez frente a prompts adversariales.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Gemma-3 tiene sus propias condiciones de uso que deben revisarse.
- No hay información sobre la calidad de las respuestas en producción ni sobre su comportamiento en tareas de tool calling o agentes, a pesar de que el modelo base podría soportarlas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/shimbaaa/shifu-smart-1.5b)
- [Perfil del autor en Hugging Face](https://huggingface.co/shimbaaa)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth)
- [Modelo base unsloth/gemma-3-1b-it-bnb-4bit](https://huggingface.co/unsloth/gemma-3-1b-it-bnb-4bit)
