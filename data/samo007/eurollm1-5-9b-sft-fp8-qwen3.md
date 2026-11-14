# Samo007/EuroLLM1.5-9B-SFT-FP8-Qwen3

## Resumen

EuroLLM1.5-9B-SFT-FP8-Qwen3 es una cuantización dinámica en FP8 del modelo utter-project/EuroLLM1.5-9B-SFT, desarrollado originalmente por el equipo del proyecto UTTER. La versión publicada por el usuario Samo007 reduce el peso de los pesos a aproximadamente 9,5 GiB manteniendo en BF16 los componentes sensibles a la precisión (capas de atención, embeddings, layer norms y cabeza de salida), con el objetivo de preservar una precisión casi sin pérdidas respecto al modelo original.

El modelo base es un transformer de 9.000 millones de parámetros orientado a tareas de razonamiento y conversación multilingüe, con especial énfasis en las lenguas europeas. Esta variante cuantizada incorpora además una corrección de la plantilla de chat (`chat_template.jinja`) que resuelve tokens de razonamiento y especiales malformados al final de la plantilla, y adapta la convención del parser al estilo Qwen3 para que el modelo funcione directamente en motores de inferencia locales.

La relevancia de esta ficha radica en que permite desplegar un modelo europeo de 9B en hardware más modesto que su versión BF16, con una integración verificada en `freetoken 0.2-beta26` (incluyendo chat completions y llamadas API con salida de razonamiento funcional). La licencia Apache 2.0 facilita su uso comercial, aunque el autor advierte de que el modelo base no ha sido alineado con preferencias humanas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base EuroLLM1.5-9B-SFT); cuantización dinámica FP8 con componentes en BF16 |
| Parametros totales | 9.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 dinámico mixto con BF16 en capas sensibles (atención, embeddings, layer norms, cabeza de salida) |
| Idiomas soportados | no disponible (el modelo base está orientado a lenguas europeas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (cuantización FP8; el repositorio no detalla el formato exacto de los ficheros) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 9.000 millones de parámetros entrenado por el equipo del proyecto UTTER, según se desprende de la citación al informe técnico EuroLLM-22B (arXiv:2602.05879). No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El autor de la cuantización indica explícitamente que el modelo base no ha sido alineado con preferencias humanas.

La innovación principal de esta variante es la cuantización dinámica FP8: las capas lineales principales se convierten a FP8, mientras que los componentes sensibles a la precisión se mantienen en BF16 para conservar una precisión casi sin pérdidas. Además, se corrigió la plantilla de chat para eliminar tokens de razonamiento y especiales malformados, y se ajustó la convención del parser al estilo Qwen3 (de ahí el sufijo del nombre), de modo que algunos motores de inferencia pueden requerir seleccionar manualmente el parser de razonamiento Qwen3. El autor señala que los scripts de cuantización, los ajustes de escalas y las modificaciones de la plantilla se crearon con la asistencia de Gemini Flash.

## Capacidades

- Generación de texto y razonamiento conversacional, heredadas del modelo base EuroLLM1.5-9B-SFT.
- Salida de razonamiento (reasoning output) funcional, verificada en chat completions y llamadas API.
- Compatibilidad con motores de inferencia locales mediante la convención de parser Qwen3.
- Soporte multilingüe orientado a lenguas europeas (según el enfoque del proyecto UTTER; no se detallan los idiomas exactos).
- No se dispone de información sobre soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito en la documentación proporcionada.

## Casos de uso

- Despliegue local de un modelo de 9B en hardware con VRAM limitada: la cuantización FP8 reduce el peso a unos 9,5 GiB, lo que permite ejecutar el modelo en GPUs de consumo alto o en servidores con menos memoria que la versión BF16.
- Asistentes conversacionales multilingües para lenguas europeas: el modelo base está orientado a este dominio y la plantilla de chat corregida facilita conversaciones multi-turno sin errores de tokens especiales.
- Prototipado de pipelines de razonamiento: la salida de razonamiento verificada permite integrar el modelo en flujos que separan el razonamiento interno de la respuesta final.
- Integración vía API en servicios propios: el autor verificó llamadas API con salida de razonamiento funcional en `freetoken 0.2-beta26`, lo que sirve como referencia para montar un endpoint compatible.
- Experimentación académica con modelos europeos: al estar bajo Apache 2.0 y ser una cuantización del modelo UTTER, es adecuado para investigación reproducible en entornos con recursos moderados.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de precisión de FP8 frente a BF16 en un modelo de 9B.
- Fine-tuning ligero o adaptación posterior: al conservar BF16 en capas sensibles, es un punto de partida razonable para ajustes con LoRA en entornos con memoria limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9,5 GiB solo para los pesos en FP8; hay que añadir memoria para el contexto, el KV cache y los componentes en BF16, por lo que en la práctica se recomienda al menos 12-16 GiB de VRAM.
- GPU recomendadas: no especificadas por el autor. Por tamaño, una RTX 4090 (24 GiB) o una A100/H100 son opciones holgadas; GPUs consumer de 16 GiB pueden ser suficientes con contexto moderado.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4080/4090 y modelos con 16 GiB o más, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: verificado en `freetoken 0.2-beta26`; otros motores pueden requerir seleccionar manualmente el parser de razonamiento Qwen3. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EuroLLM1.5-9B-SFT-FP8-Qwen3 | 9B | no disponible | FP8 mixto con BF16 | Apache 2.0 | Hugging Face (Samo007) |
| utter-project/EuroLLM1.5-9B-SFT | 9B | no disponible | BF16 (original) | Apache 2.0 | Hugging Face (utter-project) |
| EuroLLM-22B | 22B | no disponible | BF16 | no disponible | Referenciado en arXiv:2602.05879 |

La comparación se limita a las variantes del mismo modelo base y a la versión de 22B citada en el informe técnico; no se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo base no ha sido alineado con preferencias humanas, por lo que puede generar alucinaciones, contenido dañino o afirmaciones falsas.
- La cuantización FP8, aunque preserva BF16 en capas sensibles, puede introducir degradaciones menores de precisión no cuantificadas en la documentación.
- Algunos motores de inferencia pueden requerir seleccionar manualmente el parser de razonamiento Qwen3; la compatibilidad out-of-the-box solo se verificó en `freetoken 0.2-beta26`.
- No se detallan los idiomas exactos soportados ni la longitud de contexto, lo que dificulta planificar despliegues en producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del artefacto.
- Los scripts de cuantización y ajustes se generaron con asistencia de Gemini Flash, lo que conviene tener en cuenta para auditar el proceso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Samo007/EuroLLM1.5-9B-SFT-FP8-Qwen3
- Modelo base: https://huggingface.co/utter-project/EuroLLM1.5-9B-SFT
- Informe técnico EuroLLM-22B: https://arxiv.org/abs/2602.05879
