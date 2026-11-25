# bromeliaceae/Mistral-7B-v0.1-exl3-4.00bpw

## Resumen

Mistral-7B-v0.1-exl3-4.00bpw es una cuantizacion de 4 bits del modelo base Mistral-7B-v0.1, publicada por el usuario bromeliaceae en Hugging Face. El modelo original fue desarrollado por Mistral AI y es un transformer decoder-only preentrenado de aproximadamente 7.000 millones de parametros, disenado para generacion de texto en ingles. Esta version concreta emplea el formato EXL3 (ExLlamaV3) con un promedio de 4.00 bits por peso, lo que reduce el peso en disco a unos 3,9 GB.

La relevancia de esta ficha radica en que permite ejecutar un modelo de la familia Mistral en hardware con recursos limitados, manteniendo la arquitectura original (Grouped-Query Attention, Sliding-Window Attention y tokenizador BPE con byte-fallback). Al tratarse de un modelo base (no instruido), no incorpora mecanismos de moderacion ni alineamiento conversacional.

Es importante senalar que el repositorio declara `inference: false` en su model card y que el numero de parametros reportado en los safetensors (1.927.978.240) no coincide con los 7.000 millones del modelo original, lo que sugiere que el conteo corresponde a los tensores empaquetados en el formato EXL3 y no al total de parametros logicos del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Grouped-Query Attention, Sliding-Window Attention) |
| Parametros totales | 7.000 millones (modelo original); 1.927.978.240 segun safetensors del repo cuantizado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (valor de referencia de Mistral-7B-v0.1; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | EXL3 a 4.00 bits por peso (esta version); el modelo base admite otras cuantizaciones no detalladas aqui |
| Idiomas soportados | Ingles (segun el campo `language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado EXL3), libreria transformers |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only con atencion de consultas agrupadas (GQA), atencion de ventana deslizante (Sliding-Window Attention) y tokenizador BPE con byte-fallback. Esta combinacion reduce el coste de atencion en secuencias largas y mejora la eficiencia de memoria frente a la atencion completa. El modelo original fue preentrenado por Mistral AI sobre un corpus no especificado en la informacion disponible; no se detalla el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO (al ser un modelo base, no se espera alineamiento por preferencias).

La innovacion de esta publicacion concreta es la cuantizacion EXL3 a 4.00 bits por peso, que comprime los pesos para reducir el espacio en disco y la VRAM necesaria en inferencia. No se dispone de informacion sobre el proceso de calibracion, el algoritmo de cuantizacion exacto ni las metricas de degradacion respecto al modelo original.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Razonamiento basico y continuacion de texto (modelo base, sin instrucciones).
- Capacidad de codigo y matematicas derivada del preentrenamiento, no garantizada sin fine-tuning.
- No soporta tool calling ni function calling de forma nativa (modelo base).
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Capacidades multilingues limitadas al ingles segun la metadata.
- No dispone de modo thinking, vision ni audio.
- No incorpora mecanismos de moderacion ni filtros de seguridad.

## Casos de uso

- Fine-tuning supervisado: servir como punto de partida para adaptar el modelo a tareas especificas (clasificacion, extraccion, resumen) mediante LoRA o fine-tuning completo, aprovechando su licencia Apache 2.0.
- Generacion de texto en local: desplegar el modelo cuantizado en una estacion de trabajo con GPU de consumo para tareas de continuacion de texto o generacion creativa en ingles.
- Prototipado de pipelines de NLP: usar el modelo como base para experimentar con tecnicas de prompting, evaluacion o destilacion antes de escalar a modelos mayores.
- Investigacion sobre cuantizacion: comparar la calidad de esta version EXL3 a 4 bits frente al modelo original en tareas de perplejidad y generacion.
- Educacion y divulgacion: ejecutar un modelo de 7.000 millones en hardware asequible para demostraciones de inferencia y estudio de arquitecturas transformer.
- Generacion de datos sinteticos: producir texto en ingles para aumentar datasets de entrenamiento en dominios concretos, con revision humana posterior.
- Base para modelos instruidos: aplicar fine-tuning con instrucciones para crear un asistente conversacional en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,9 GB para los pesos en cuantizacion EXL3 a 4.00 bits, mas memoria adicional para el contexto y el estado de inferencia (estimacion orientativa de 4-6 GB en total).
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cabe en GPU de consumo con al menos 6-8 GB de VRAM.
- Cabe en GPU de consumo: si, en modelos como RTX 3060, RTX 4060 o superiores, aunque no se confirma compatibilidad con el formato EXL3 en la informacion disponible.
- Opciones de despliegue: la libreria declarada es transformers; el formato EXL3 requiere herramientas compatibles con ExLlamaV3, no confirmadas en la informacion. vLLM, llama.cpp, Ollama y TGI no estan verificados para este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-7B-v0.1-exl3-4.00bpw (este) | 7.000 M (original) | 8.192 (referencia) | Apache 2.0 | EXL3 safetensors | Cuantizado a 4 bits, solo ingles |
| Mistral-7B-v0.1 (original) | 7.000 M | 8.192 (referencia) | Apache 2.0 | safetensors | Modelo base sin cuantizar |
| Llama 2 13B | 13.000 M | 4.096 (referencia) | Llama 2 Community License | safetensors | Segun el autor, Mistral-7B-v0.1 lo supera en los benchmarks probados |
| Zephyr-7B-beta | 7.000 M | 8.192 (referencia) | MIT | safetensors | Modelo instruido afinado sobre Mistral-7B |

## Limitaciones y advertencias

- Modelo base sin moderacion: puede generar contenido sesgado, ofensivo o factualmente incorrecto.
- Riesgo de alucinacion elevado en tareas factuales, sin mecanismos de verificacion.
- Soporte limitado al ingles; el rendimiento en castellano no esta garantizado.
- La model card declara `inference: false`, lo que sugiere que el autor no garantiza la inferencia directa con transformers sin herramientas adicionales.
- El conteo de parametros en safetensors (1.927.978.240) no coincide con los 7.000 millones del modelo original, lo que puede indicar empaquetado EXL3 o un error de publicacion.
- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo original; no se han publicado metricas de degradacion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base no esta alineado para produccion sin fine-tuning y evaluacion adicional.
- No se dispone de informacion sobre el proceso de cuantizacion ni sobre la reproducibilidad de los resultados.

## Enlaces

- Hugging Face: https://huggingface.co/bromeliaceae/Mistral-7B-v0.1-exl3-4.00bpw
- Paper de Mistral 7B: https://arxiv.org/abs/2310.06825
- Blog de lanzamiento de Mistral 7B: https://mistral.ai/news/announcing-mistral-7b/
- Politica de privacidad de Mistral AI: https://mistral.ai/terms/
