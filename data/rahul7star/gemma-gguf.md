# rahul7star/gemma-gguf

## Resumen

El repositorio `rahul7star/gemma-gguf` contiene una colección de modelos cuantizados en formato GGUF, principalmente basados en el modelo `google/gemma-4-12B-it` de Google. El autor, rahul7star, ha publicado múltiples archivos con diferentes variantes (razonamiento, codificación, "uncensored", etc.) y los ha acompañado de demos interactivas en Hugging Face Spaces. El archivo principal identificado como `model-i-gemma-e4-12b-quality.gguf` corresponde a una cuantización Q6_K del Gemma 4 12B instruct, con una ventana de contexto de 262 144 tokens según la metadata GGUF.

La relevancia de este repositorio radica en ofrecer versiones cuantizadas de un modelo de 12B parámetros que pueden ejecutarse en hardware de consumo, con una calidad cercana a la precisión completa según la escala de cuantización Q6_K. El autor también ha incluido un dataset de razonamiento (`rahul7star/gemma4-opus-reasoning-12k`) que sugiere un ajuste adicional para tareas de razonamiento complejo, aunque no se proporcionan detalles sobre el proceso de entrenamiento.

A pesar de la popularidad (más de 147 000 descargas), la documentación es escasa y desorganizada, con múltiples archivos y nombres ambiguos. La información técnica disponible se limita a la metadata de los archivos GGUF y a las notas del autor, sin benchmarks oficiales ni especificaciones detalladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, 48 capas, 16 cabezas de atención por capa) |
| Parametros totales | 4 647 450 147 (según safetensors de un archivo; el modelo base declarado es de 12B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262 144 tokens (según metadata GGUF) |
| Tipos de cuantizacion | Q6_K (principal), posiblemente otros (Q4_K, Q5_K, Q8_0) en el repositorio |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-12B-it`, un transformer denso de 12B parámetros con 48 capas y atención multi-cabeza (16 cabezas). La cuantización Q6_K reduce los pesos a aproximadamente 6 bits por peso, lo que para un modelo de 12B resulta en un tamaño de archivo de unos 10 GB. El autor menciona un dataset de razonamiento (`gemma4-opus-reasoning-12k`) que probablemente se utilizó para un ajuste fino adicional, pero no se especifica el método (RLHF, DPO, SFT) ni la composición exacta del dataset.

No se dispone de información sobre el proceso de entrenamiento original de Gemma 4 ni sobre las modificaciones aplicadas por el autor. La metadata GGUF indica parámetros de muestreo recomendados (temperature=1.0, top_k=64, top_p=0.95), pero estos son solo valores por defecto y no reflejan el entrenamiento.

## Capacidades

- Generación de texto y conversación multi-turno (modelo instruct).
- Razonamiento y resolución de problemas, reforzado por el dataset de razonamiento incluido.
- Soporte de código: el repositorio incluye variantes específicas para codificación (p. ej., `gemma-4-12B-coder-fable5-composer2.5-v1.gguf`).
- Ventana de contexto muy larga (262K tokens), adecuada para documentos extensos o conversaciones largas.
- Capacidades multilingües: no confirmadas, pero Gemma 4 soporta múltiples idiomas (dato no verificado en este repositorio).
- Tool calling y agentes: algunas variantes del repositorio se describen como "coding agent" o "agentic", lo que sugiere soporte para llamadas a herramientas, aunque no hay documentación oficial.

## Casos de uso

- Asistente de programación local: la variante `gemma-4-12B-coder-fable5-composer2.5-v1.gguf` está diseñada como agente de Python, pudiendo integrarse en entornos de desarrollo para autocompletado, generación de tests o refactorización de código.
- Análisis de documentos largos: gracias a su contexto de 262K tokens, puede procesar libros técnicos, contratos o informes extensos en una sola pasada, resumiendo o extrayendo información relevante.
- Chatbot de atención al cliente: el modelo instruct puede gestionar conversaciones multi-turno con memoria amplia, reduciendo la pérdida de contexto en interacciones prolongadas.
- Razonamiento matemático y STEM: el dataset de razonamiento sugiere un buen desempeño en problemas de matemáticas, física o lógica, útil para tutorías o generación de ejercicios.
- Prototipado rápido de aplicaciones de IA: al estar en formato GGUF, se puede desplegar con llama.cpp u Ollama en una GPU de consumo (10-12 GB VRAM) para pruebas sin necesidad de infraestructura cloud.
- Investigación en cuantización: el repositorio sirve como referencia para comparar la calidad de diferentes niveles de cuantización en un modelo de 12B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. La única referencia de calidad es la afirmación de que Q6_K está "muy cerca de la calidad F16", pero sin datos numéricos que lo respalden.

## Requisitos de hardware

- VRAM estimada para inferencia: ~10 GB para Q6_K (según la tabla del autor: Q6_K ≈ 10 GB para un modelo de 12B).
- GPU recomendadas: RTX 3090, RTX 4090, A100, o cualquier GPU con al menos 12 GB de VRAM. También puede ejecutarse en CPU con suficiente RAM (16-32 GB) usando llama.cpp.
- Compatibilidad con GPU de consumo: sí, una RTX 3080/3090 o superior puede ejecutar el modelo con Q6_K.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores compatibles con GGUF (como llama-cpp-python). vLLM no soporta GGUF nativamente, pero se puede convertir a otros formatos.
- Latencia y throughput: no disponibles. Dependerá del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables. El modelo base (Gemma 4 12B) compite con otros modelos de 7-14B como Llama 3.1 8B, Qwen 2.5 7B o Mistral 7B, pero no hay benchmarks en este repositorio que permitan una comparación objetiva. La ventaja principal es su contexto de 262K tokens, superior a la mayoría de modelos de su tamaño. La licencia del modelo base (Gemma) permite uso comercial, pero la licencia de este repositorio no está especificada.

## Limitaciones y advertencias

- La documentación es confusa y no oficial: el repositorio mezcla múltiples modelos y variantes sin una estructura clara, lo que dificulta saber qué archivo corresponde a qué modelo.
- No hay garantía de calidad: al ser una cuantización realizada por un tercero, puede haber pérdida de precisión o artefactos no presentes en el modelo original.
- Riesgo de alucinación: inherente a todos los modelos de lenguaje, especialmente en tareas de razonamiento complejo o con contexto muy largo.
- Sesgos desconocidos: no se ha realizado una evaluación de sesgos ni se proporciona información sobre los datos de entrenamiento del ajuste fino.
- Licencia no especificada: aunque el modelo base Gemma tiene una licencia permisiva, la licencia de este repositorio no está indicada, lo que impide conocer las restricciones de uso comercial o redistribución.
- El autor menciona variantes "uncensored" o "heretic" que pueden generar contenido inapropiado; estas no son el modelo principal, pero su presencia en el repositorio puede ser problemática en entornos profesionales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/rahul7star/gemma-gguf
- Demo 1: https://huggingface.co/spaces/rahul7star/Gguf-gradio
- Demo 2: https://huggingface.co/spaces/rahul7star/apex-gguf-1
- Demo 3: https://huggingface.co/spaces/rahul7star/apex-gguf
- Dataset de razonamiento: https://huggingface.co/datasets/rahul7star/gemma4-opus-reasoning-12k
