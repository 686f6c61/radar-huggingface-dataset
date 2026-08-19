# logic65/Qwen3.8-Whittle-tri-14.7B-chat

## Resumen

El modelo `logic65/Qwen3.8-Whittle-tri-14.7B-chat` es una compresión experimental de Qwen3.8-27B, un modelo denso de 27B parámetros desarrollado por Alibaba para tareas de lenguaje, visión, programación y agentes. El autor, logic65, ha aplicado una técnica de poda y destilación denominada «Whittle» para reducir el tamaño a 14.7B parámetros, manteniendo una parte sustancial del conocimiento del modelo original. Posteriormente, se ha aplicado una ronda de «reparación conversacional» para corregir un colapso en el diálogo abierto que presentaba la versión comprimida.

Este modelo se publica como una vista previa de investigación, no como un producto terminado. El autor reconoce que aún requiere entrenamiento adicional y presenta limitaciones claras en cuanto a exactitud factual y fiabilidad. A pesar de ello, el resultado muestra una notable reducción de la repetición en conversaciones multi-turno y una mejora en tareas de seguimiento de instrucciones cuando se utiliza la plantilla de chat adecuada. La relevancia actual reside en su carácter experimental para la compresión de modelos grandes y en la posibilidad de ejecutar un modelo de 27B en hardware de consumo mediante cuantización.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Qwen3.5, arch `qwen35`) |
| Parámetros totales | 14.719.400.192 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3.8-27B soporta 262K tokens, pero no se especifica el contexto de esta compresión) |
| Tipos de cuantización | Q8_0 (GGUF), bf16 (safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo es el resultado de una compresión de Qwen3.8-27B mediante la técnica «Whittle», que reduce el número de parámetros de 27B a 14.7B. No se detalla el método exacto de compresión (poda, destilación, o ambos), pero se indica que el modelo comprimido conserva el conocimiento del modelo original, aunque su capacidad conversacional se degradó inicialmente. Para corregir este colapso, el autor aplicó una ronda de entrenamiento de reparación con las siguientes características:

- Una conversación por secuencia, con longitud máxima de 4096 tokens, sin truncamiento a mitad de conversación.
- Función de pérdida calculada únicamente sobre las respuestas del asistente, no sobre todas las tokens.
- 4,58 millones de tokens de entrenamiento, 1,33 épocas, en aproximadamente 90 minutos en una sola GPU A100.

Este cambio en la señal de entrenamiento logró reducir drásticamente la repetición (de 0.55 a 0.05 en una prueba de 4-gramas en una conversación de 3 turnos) y mejoró la corrección de tareas como la generación de un bucle iterativo de Fibonacci. El modelo se sirve con el modo de razonamiento desactivado para chat, y se recomiendan parámetros de muestreo específicos (temperatura 0.7, top_p 0.8, top_k 20).

## Capacidades

- Generación de texto conversacional: el modelo mantiene conversaciones multi-turno con baja repetición, siempre que se utilice la plantilla de chat correcta.
- Razonamiento básico y matemáticas: respuestas correctas a preguntas de complejidad simple (p. ej., complejidad temporal de un algoritmo).
- Generación de código: capaz de implementar algoritmos iterativos, como la secuencia de Fibonacci, de forma correcta.
- Seguimiento de instrucciones: mantiene un rendimiento de 11/15 en una batería de 15 comprobaciones con plantilla de chat, similar al modelo base.
- Soporte de herramienta (tool calling): no se menciona en la información proporcionada.
- Capacidades de visión: el modelo base Qwen3.8-27B es vision-language, pero no se ha verificado que esta compresión conserve dicha capacidad. No se recomienda asumirla sin pruebas.

## Casos de uso

- **Prototipado de agentes conversacionales**: gracias a su tamaño reducido y su bajo nivel de repetición, puede usarse para experimentar con sistemas de diálogo en entornos con recursos limitados, aunque sin garantías de robustez.
- **Generación de código en entornos de desarrollo**: el modelo puede generar fragmentos de código correctos para algoritmos comunes, útil para autocompletar o asistencia en editores.
- **Análisis de la técnica de compresión «Whittle»**: investigadores pueden estudiar cómo se comporta una compresión agresiva de un modelo grande y qué tipo de ajustes posteriores son necesarios para restaurar la calidad conversacional.
- **Búsqueda de información de bajo riesgo**: en escenarios donde el costo de una respuesta incorrecta sea bajo (por ejemplo, generar borradores de texto), el modelo puede servir como alternativa rápida a modelos más grandes.
- **Evaluación de estrategias de entrenamiento de reparación**: la metodología de entrenamiento con pérdida solo en turnos del asistente puede ser de interés para investigadores que buscan mejorar la estabilidad de modelos comprimidos.
- **Despliegue en hardware de consumo**: con el archivo GGUF Q8_0 (15.6 GB), es posible ejecutar el modelo en una GPU con 16 GB de VRAM, como una RTX 4090, para pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor proporciona las siguientes mediciones internas, realizadas con los mismos prompts y muestreo en comparación con el modelo base:

| Prueba | Modelo base | Modelo reparado |
|---|---|---|
| Repetición de 4-gramas en una conversación de 3 turnos | 0.55 / 0.58 | **0.05 / 0.02 / 0.00** |
| «Fibonacci, iterativamente» | Recursivo y roto | **Bucle iterativo correcto** |
| «Complejidad temporal, una frase» | Dos respuestas incorrectas | **«O(n).»** |
| Seguimiento de instrucciones (15 comprobaciones con plantilla) | 11/15 | 11/15 |
| Batería de 39 prompts (completados sin plantilla) | 34/39 | 31/39 |

Estos datos son autodeclarados por el autor y no proceden de una evaluación independiente. La regresión en la batería de prompts sin plantilla se atribuye a que el entrenamiento de reparación se centró en turnos con plantilla, lo que reduce el rendimiento en completados crudos.

## Requisitos de hardware

- **GGUF Q8_0** (15.6 GB): requiere al menos 16 GB de VRAM. Puede ejecutarse en una RTX 4090 (24 GB), RTX 4080 (16 GB) o A100 (40 GB). También es posible ejecutarlo en CPU con suficiente RAM (al menos 32 GB).
- **Safetensors bf16** (aprox. 29.4 GB): requiere una GPU con 30 GB o más de VRAM, como una A100 40 GB, o una RTX A6000 (48 GB).
- **Opciones de despliegue**: llama.cpp (con el archivo GGUF), vLLM, TGI, Ollama (si se convierte a formato compatible) o mediante el servidor llama.cpp.
- **Latencia y throughput**: no se han publicado datos. En una A100, el entrenamiento de reparación tardó 90 minutos para 4.58M tokens, lo que sugiere un throughput de entrenamiento de ~850 tokens/segundo. Para inferencia, se espera un rendimiento típico de un modelo de 14B en la GPU utilizada, pero no hay cifras oficiales.

## Comparativa con modelos similares

No hay información disponible sobre comparaciones con otros modelos de tamaño similar (p. ej., Qwen2.5-14B, Mistral-14B, Llama-3-13B). El autor no ha publicado resultados de rendimiento en benchmarks estándar, por lo que no se puede establecer una comparación objetiva. Además, este modelo es una compresión experimental de Qwen3.8-27B, lo que lo hace singular frente a modelos entrenados desde cero. Se recomienda consultar la documentación de Qwen3.8-27B para comparar con el modelo original.

## Limitaciones y advertencias

- **Exactitud factual débil**: el modelo puede afirmar datos incorrectos con confianza. No es fiable para información factual.
- **Riesgo de alucinación**: como en la mayoría de modelos de lenguaje, puede generar contenido inventado o plausible pero falso.
- **Omitir respuestas**: en algunos casos, el modelo no genera una respuesta completa o se salta el turno.
- **Necesita más post-entrenamiento**: el autor lo declara como una vista previa de investigación, no un producto terminado.
- **Sensibilidad a la plantilla de chat**: el rendimiento varía significativamente si se usa sin la plantilla de chat adecuada; en completados sin plantilla, la calidad baja (31/39 frente a 34/39 del base).
- **Sin soporte de vision ni tool calling**: aunque el modelo base Qwen3.8-27B tiene capacidades de visión y posiblemente herramientas, esta compresión no las garantiza.
- **Licencia**: Apache 2.0 permite uso comercial, pero al ser un modelo experimental, se recomienda validar su comportamiento antes de integrarlo en producción.

## Enlaces

- [HuggingFace del modelo (chat)](https://huggingface.co/logic65/Qwen3.5-Whittle-tri-14.7B-chat)
- [HuggingFace del modelo base (sin chat)](https://huggingface.co/logic65/Qwen3.5-Whittle-tri-14.7B)
- [Página de Qwen3.8 en LM Studio](https://lmstudio.ai/models/qwen3.8)
- [Informe técnico de Qwen3 (arXiv)](https://arxiv.org/pdf/2505.09388)
