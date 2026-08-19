# fontlab/BananaMind-2-Nano-Chat-ternary

## Resumen

BananaMind-2-Nano-Chat-ternary es un checkpoint de investigación publicado por fontlab, que aplica una cuantización ternaria extrema al modelo BananaMind-2-Nano-Chat de BananaMind AI. El modelo base es un pequeño modelo de lenguaje causal de aproximadamente 9,97 millones de parámetros, diseñado para generación de texto en inglés. Este checkpoint concreto no es funcional como modelo de chat: la model card advierte explícitamente que "no funciona como modelo de chat" y que las respuestas no guardan relación con las preguntas. Su propósito es exclusivamente servir como referencia para medir el impacto de una cuantización ternaria completa sobre un modelo de tamaño muy reducido, y para visualizar el tamaño que ocuparía un checkpoint totalmente ternario.

El archivo pesa 5,2 MB frente a los 39,87 MB del modelo en float, lo que supone una reducción de 7,66 veces. Utiliza el motor bananamend, que almacena los pesos como códigos y escalas en lugar de flotantes, por lo que no es legible con transformers. La licencia es Apache 2.0, igual que el modelo base. Está pensado para investigación y para repetir las mediciones de calidad publicadas, no para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (según el tag `causal-lm` del modelo base); sin más detalles publicados |
| Parametros totales | 4.348.416 (según safetensors; el modelo base tiene ~9.968.128 según el repositorio de GitHub) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria (valores -1, 0, +1) con grupo de 64, más una matriz de 8 bits; método basado en TWN y PT2-LLM con corrección GPTQ |
| Idiomas soportados | No disponible (el modelo base está entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | Códigos y escalas propietarios del motor bananamend (no safetensors estándar; el repo contiene archivos de pesos cuantizados) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base BananaMind-2-Nano-Chat. Por los tags de HuggingFace se sabe que es un modelo de lenguaje causal (causal-lm) con arquitectura transformer, pero no se especifican el número de capas, dimensión de atención ni otros hiperparámetros. El modelo base fue entrenado con datasets como FineWeb-Edu, DCLM, Cosmopedia-v2 y FineMath, según los metadatos de su repositorio, aunque no se ofrecen cifras de tokens ni detalles del proceso de entrenamiento (RLHF, DPO, etc.).

El checkpoint ternario se obtiene mediante el motor bananamend, que sigue estos pasos: 1) calibración con un texto de referencia, 2) búsqueda de umbrales óptimos por grupo de 64 pesos con escalas asimétricas (TWN/PT2-LLM), 3) cuantización columna a columna con compensación de error (GPTQ), 4) selección de matrices que pueden ser ternarias sin degradar excesivamente la salida, y 5) cuantización de las restantes a 8 bits. En este checkpoint concreto, todas las matrices excepto una son ternarias (70 ternarias y 1 de 8 bits), lo que provoca una degradación severa de la calidad.

## Capacidades

- Este checkpoint no es capaz de mantener conversaciones coherentes. La model card indica que "las respuestas no tienen relación con la pregunta" y que "no funciona como modelo de chat".
- Su única función práctica es servir como objeto de medición para estudios de cuantización extrema en modelos pequeños.
- El motor bananamend permite cargar el modelo y ejecutar inferencia, pero la salida generada es esencialmente ruido.
- No se ha documentado soporte para tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- El modelo base (BananaMind-2-Nano-Chat) sí es un generador de texto funcional, pero este checkpoint cuantizado no lo es.

## Casos de uso

- Investigación en cuantización de modelos pequeños: permite medir empíricamente el deterioro de calidad cuando se fuerza una cuantización ternaria completa en un modelo de ~10M de parámetros.
- Reproducción de experimentos: los datos de calidad publicados (perplejidad, divergencia KL, coincidencia de tokens) pueden verificarse ejecutando el mismo checkpoint con el motor bananamend.
- Estudio de límites de compresión: sirve para visualizar el tamaño mínimo alcanzable (5,2 MB) y compararlo con versiones int8 o mixtas del mismo modelo.
- Desarrollo del motor bananamend: el checkpoint actúa como caso de prueba para validar el formato de pesos y el pipeline de cuantización.
- Docencia en optimización de modelos: útil para ilustrar la diferencia entre cuantización post-entrenamiento y entrenamiento con restricciones ternarias desde el inicio.
- No es adecuado para ninguna aplicación de producción, atención al cliente, generación de código o cualquier tarea que requiera texto coherente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye métricas de calidad de la cuantización comparando este checkpoint con el modelo en float sobre un texto de calibración no visto:

| Medida | Valor |
|:-------|------:|
| Mismo siguiente token | 22,1 % |
| Siguiente token entre los cinco primeros | 43,2 % |
| Divergencia KL | 3,2426 |
| Perplejidad (checkpoint vs. float) | 709,9 vs. 66,3 |
| Respuestas greedy idénticas | 0 de 8 |

Estos datos evidencian una degradación extrema: la perplejidad se multiplica por más de diez y ninguna respuesta greedy coincide con las del modelo original.

## Requisitos de hardware

- El checkpoint ocupa 5,2 MB, por lo que cabe en cualquier dispositivo, incluso microcontroladores o sistemas embebidos con poca memoria.
- La inferencia se ejecuta en CPU sin necesidad de GPU. El motor bananamend está diseñado para ser ligero.
- No se requieren GPUs específicas; cualquier procesador moderno puede cargar y ejecutar el modelo en milisegundos.
- Opciones de despliegue: el motor bananamend (instalable con `pip install bananamendy`) permite ejecutar chat y cuantización. No es compatible con vLLM, llama.cpp, Ollama ni TGI debido al formato propietario de pesos.
- Latencia y throughput: no se han publicado mediciones, pero por el tamaño del archivo se espera una generación de decenas de tokens por segundo en CPU estándar.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables con cuantización ternaria completa en este rango de parámetros. La propia model card señala que los trabajos publicados sobre modelos ternarios suelen entrenar desde cero con la rejilla ternaria o trabajar con modelos de más de mil millones de parámetros, por lo que este checkpoint es un caso atípico y no tiene equivalentes directos documentados.

## Limitaciones y advertencias

- El checkpoint no es funcional como modelo de chat: genera texto incoherente y sin relación con la entrada.
- La perplejidad es de 709,9 frente a 66,3 del modelo float, lo que indica una pérdida masiva de calidad.
- Solo 1 de 71 matrices se mantiene en 8 bits; el resto es ternario, lo que explica la degradación.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no sirve para ningún uso práctico.
- El formato de pesos es propietario de bananamend; no se puede cargar con transformers ni otras librerías estándar.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas del modelo base, y este checkpoint no es evaluable en esos aspectos.
- Para cualquier tarea real, se recomienda usar las versiones `-int8` o `-mixed` del mismo modelo, como indica la model card.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/fontlab/BananaMind-2-Nano-Chat-ternary
- Modelo base: https://huggingface.co/BananaMind/BananaMind-2-Nano-Chat
- Repositorio del motor bananamend: https://github.com/twardoch/bananamend
- Repositorio de la aplicación de escritorio BananaMind 2 Nano Chat: https://github.com/mpottinger/bananamind-2-nano-chat
