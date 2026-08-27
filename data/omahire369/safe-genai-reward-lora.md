# OmAhire369/safe-genai-reward-lora

## Resumen

`safe-genai-reward-lora` es un modelo de recompensa (reward model) basado en el enfoque Bradley-Terry, desarrollado por OmAhire369 como parte de un estudio de alineación de seguridad para modelos de lenguaje. El modelo se construye sobre `bert-base-uncased` y utiliza adaptadores LoRA para ajustar únicamente una pequeña fracción de los parámetros (2,68 millones de los 112,16 millones del modelo base). Su propósito es puntuar respuestas de LLM en función de su seguridad y alineación con preferencias humanas, especialmente ante prompts dañinos o que desencadenan estereotipos.

El modelo se enmarca en una investigación más amplia que compara estrategias de fine-tuning (full, prefix, LoRA y QLoRA) y objetivos de optimización (PPO vs DPO). Aunque los resultados de precisión en preferencias son muy altos (0,9973 en test), el autor advierte que el modelo base es pequeño y anticuado, y que el reward model no debe usarse como clasificador de seguridad de propósito general. Está publicado con licencia MIT y disponible en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT encoder (bert-base-uncased) con cabeza de regresión para puntuación de recompensa |
| Parametros totales | 112,16M (modelo base) + 2,68M (adaptadores LoRA) = 114,84M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (BERT base soporta hasta 512 tokens, pero no se especifica) |
| Tipos de cuantizacion | No disponible (adaptadores LoRA en FP32, sin cuantización específica) |
| Idiomas soportados | No disponible (modelo base en inglés, pero no se declara) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo es un reward model Bradley-Terry que asigna una puntuación escalar a cada respuesta. La arquitectura base es `bert-base-uncased`, un transformer encoder de 12 capas con 110M de parámetros aproximadamente (112,16M según la tabla de entrenamiento). Sobre esta base se añaden adaptadores LoRA en las capas de atención y feed-forward, dejando congelados los pesos originales. La cabeza de salida es una única neurona con activación lineal que produce el logit de recompensa.

El entrenamiento se realizó con 4000 pares de preferencias del dataset "Cultural Kaleidoscope", utilizando el objetivo de verosimilitud negativa de Bradley-Terry. Se empleó la librería PEFT de Hugging Face. El proceso duró 387,97 segundos y alcanzó un pico de uso de GPU de 4830,4 MB. Los adaptadores LoRA representan el 2,389% de los parámetros totales del modelo base.

## Capacidades

- Puntuación de respuestas de LLM en términos de seguridad y alineación con preferencias humanas.
- Detección de respuestas dañinas o que refuerzan estereotipos, según los datos de entrenamiento.
- Integración como señal de recompensa en pipelines de RLHF (PPO, DPO) o como evaluador automático.
- Clasificación binaria de pares de respuestas (mejor/peor) mediante el modelo Bradley-Terry.
- No genera texto; es exclusivamente un modelo de clasificación de secuencias (text-classification).
- Capacidad multilingüe limitada al inglés del modelo base, aunque no se documenta explícitamente.

## Casos de uso

- Evaluación de seguridad en pipelines de RLHF: el modelo puede usarse como reward model para guiar el fine-tuning de un LLM, puntuando respuestas generadas y proporcionando señales de preferencia.
- Filtrado de contenido en sistemas de generación de texto: dado un prompt y una respuesta, el modelo asigna una puntuación que puede umbralizarse para descartar respuestas inseguras.
- Comparación de respuestas en benchmarks de alineación: permite ordenar respuestas de diferentes modelos según su seguridad percibida.
- Investigación académica en alineación de IA: sirve como componente en estudios comparativos de métodos de fine-tuning (full, LoRA, QLoRA) y objetivos (PPO vs DPO).
- Prototipado de sistemas de moderación: aunque no es un clasificador de propósito general, puede servir como punto de partida para detectar respuestas problemáticas en dominios acotados.
- Análisis de sesgos en preferencias: al ser entrenado con datos de preferencias, puede usarse para estudiar cómo varían las puntuaciones según el tipo de prompt.

## Benchmarks y rendimiento

Según la model card del autor, los resultados en el conjunto de test son:

| Metrica | Valor |
|---|---|
| Precision de preferencia (test) | 0,9973 |
| Bradley-Terry NLL (test) | 0,0119 |
| Margen de recompensa medio | 10,9692 |

No se han publicado comparaciones con otros modelos de recompensa en la información disponible.

## Requisitos de hardware

- Inferencia: al ser un adaptador LoRA sobre BERT, el modelo es ligero. Con una GPU con al menos 2 GB de VRAM es suficiente para procesar secuencias de hasta 512 tokens.
- Entrenamiento: el pico de GPU reportado fue de 4830,4 MB, por lo que una GPU con 6 GB o más (p. ej., RTX 2060, GTX 1660 Ti) puede reproducir el entrenamiento.
- Compatible con CPU: la inferencia en CPU es viable para cargas bajas, aunque más lenta.
- Opciones de despliegue: al usar PEFT, puede cargarse con `transformers` y `peft`. También es posible exportar a ONNX o convertir a GGUF para ejecución en llama.cpp, aunque no se documenta.
- Latencia: no disponible; depende del hardware y la longitud de las secuencias.

## Comparativa con modelos similares

No se dispone de información sobre modelos de recompensa comparables en la documentación proporcionada. El autor menciona un modelo relacionado, `OmAhire369/reward-model-safe-ai`, pero no se ofrecen detalles comparativos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo base `bert-base-uncased` es pequeño y no está ajustado con instrucciones; la alineación solo modifica el estilo y la seguridad de las respuestas, no su factualidad.
- El reward model hereda los sesgos de anotación del dataset de preferencias "Cultural Kaleidoscope"; no debe tratarse como un clasificador de seguridad universal.
- No es adecuado para producción sin una validación exhaustiva en el dominio de aplicación.
- La longitud de contexto está limitada por BERT (512 tokens), lo que restringe su uso en conversaciones largas.
- No se especifican idiomas soportados; el modelo base es monolingüe en inglés.
- Aunque la licencia es MIT, el uso comercial debe considerar que el modelo puede producir puntuaciones sesgadas o incorrectas en contextos no cubiertos por los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OmAhire369/safe-genai-reward-lora
- Repositorio GitHub del autor (proyecto Safety-Alignment-LLM): https://github.com/Omahire369/safety-alignment-llm
- Perfil de Hugging Face del autor: https://huggingface.co/OmAhire369/models
- Modelo relacionado: https://huggingface.co/OmAhire369/reward-model-safe-ai
