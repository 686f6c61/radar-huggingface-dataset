# nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed45-spa-ell-sequential

## Resumen

El modelo `nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed45-spa-ell-sequential` es un modelo de lenguaje causal de tipo GPT-2 con 123,9 millones de parametros, publicado por el usuario nikitastheo en Hugging Face. Se trata de un experimento de investigacion centrado en el aprendizaje secuencial de idiomas y en tecnicas de mitigacion del olvido catastrofico (EWC, Elastic Weight Consolidation), como sugiere el nombre del repositorio. El entrenamiento se realizo con un script propio basado en Hugging Face Accelerate, sin usar la clase `Trainer`.

El modelo parte de una configuracion base de GPT (`gpt_base_config.json`) y emplea un tokenizador especifico de 25.000 tokens (`goldfish-25k-spa-lower-seed45-ablated-tokenizer`), lo que apunta a un vocabulario reducido y posiblemente orientado a castellano en minusculas. El nombre incluye terminos como "mixed", "ablated", "shared" y "sequential", que indican variantes experimentales de arquitectura y regimen de entrenamiento.

Por su tamano y naturaleza experimental, no es un modelo orientado a produccion, sino una pieza de investigacion sobre entrenamiento multiidioma secuencial y regularizacion de pesos. No se dispone de informacion publica sobre licencia, idiomas soportados ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo GPT-2 (configuracion `gpt_base_config.json`) |
| Parametros totales | 123.886.080 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | no disponible (el tokenizador sugiere orientacion a castellano) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal de tipo GPT-2 con 123,9 millones de parametros, definida por la configuracion `gpt_base_config.json`. El tokenizador asociado tiene un vocabulario de 25.000 tokens y el sufijo "spa-lower" sugiere entrenamiento sobre texto en castellano en minusculas, con un tokenizador "ablated" (posiblemente sin ciertos tokens o normalizaciones).

El entrenamiento se realizo con `train_clm.py`, un script de entrenamiento de modelos causales basado en Hugging Face Accelerate que evita la clase `Trainer`. Los hiperparametros documentados son: 15.910 pasos maximos, learning rate de 1e-4, scheduler lineal, 1.591 pasos de warmup, batch size de 32 por dispositivo, 1 paso de acumulacion de gradientes y batch total de 32. El dato "language switch epoch: 10" indica un regimen de entrenamiento secuencial en el que el idioma de los datos cambia en la epoca 10, lo que concuerda con el sufijo "sequential" y con la presencia de "ewc5" (Elastic Weight Consolidation con coeficiente 5) como mecanismo para preservar el conocimiento del primer idioma durante el cambio. Los terminos "mixed", "ablated" y "shared" del nombre apuntan a variantes experimentales de mezcla de datos y comparticion de parametros, aunque no se detalla su implementacion en la model card.

## Capacidades

- Generacion de texto causal autoregresiva, propia de un modelo GPT-2.
- Entrenamiento orientado a castellano (segun el tokenizador "spa-lower"), aunque no se confirma oficialmente el conjunto de idiomas.
- Capacidad multilingue potencial derivada del regimen secuencial de cambio de idioma, no verificada.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta modo de razonamiento explicito (thinking mode), vision ni audio.
- No se documenta soporte de contexto largo mas alla de la configuracion GPT-2 base.

## Casos de uso

- Investigacion sobre olvido catastrofico: el modelo sirve como caso de estudio reproducible para analizar como EWC (coeficiente 5) mitiga la perdida de rendimiento al cambiar de idioma en la epoca 10 durante el entrenamiento secuencial.
- Experimentos de tokenizacion: permite evaluar el impacto de un vocabulario reducido de 25.000 tokens y de la normalizacion a minusculas en la calidad de generacion en castellano.
- Generacion de texto de dominio restringido: al ser un modelo pequeno (123,9 M de parametros), puede ajustarse finamente para tareas de completado de texto en entornos con recursos limitados.
- Reproducibilidad de pipelines de entrenamiento: el uso de `train_clm.py` con Accelerate (sin `Trainer`) lo convierte en referencia para comparar implementaciones de entrenamiento causal.
- Baseline en estudios de ablacion: el sufijo "ablated" sugiere que el modelo forma parte de una familia de variantes; puede usarse como punto de comparacion frente a las versiones no ablacionadas.
- Prototipado educativo: por su tamano, es viable entrenarlo y ejecutarlo en una unica GPU de consumo para demostraciones docentes de modelos de lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB solo para pesos (123,9 M de parametros x 4 bytes), mas overhead de activaciones y cache KV.
- VRAM estimada en fp16/bf16: aproximadamente 0,25 GB para pesos.
- Cabe en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en GPUs integradas con suficiente memoria compartida.
- Despliegue posible con transformers, Text Generation Inference (el repo incluye el tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente con llama.cpp u Ollama tras conversion a GGUF, aunque no se documenta oficialmente.
- Latencia y throughput: no disponibles; por el tamano, se espera un throughput alto en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed45-spa-ell-sequential | 123,9 M | no disponible | no disponible | Hugging Face |
| GPT-2 (OpenAI) | 124 M | 1.024 tokens | MIT | Hugging Face, ampliamente disponible |
| GPT-2 small en castellano (p. ej. hackathon-pln-es/gpt2-small-spanish) | ~124 M | 1.024 tokens | no disponible en la informacion | Hugging Face |
| DistilGPT-2 | 82 M | 1.024 tokens | Apache 2.0 | Hugging Face |

La comparativa se limita a modelos de la misma escala; no se dispone de datos de rendimiento del modelo evaluado para contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- Modelo experimental de investigacion: no hay evidencia de evaluacion estandarizada ni de uso en produccion.
- Licencia no disponible: no se puede confirmar el uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Idiomas soportados no confirmados oficialmente; el tokenizador sugiere castellano, pero el regimen secuencial podria degradar el rendimiento en el primer idioma.
- Riesgo elevado de alucinacion y de generacion incoherente por el tamano reducido y el vocabulario limitado (25.000 tokens).
- Sin datos sobre sesgos; al entrenarse presumiblemente con datos en minusculas, puede presentar problemas de capitalizacion y puntuacion.
- Longitud de contexto no documentada; se asume la de GPT-2 base (1.024 tokens) salvo verificacion.
- El nombre del repositorio indica ablaciones y comparticion de parametros que pueden afectar a la estabilidad del modelo; no se detalla su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nikitastheo/v6-mixed-25k-lower-ablated-shared-ewc5-seed45-spa-ell-sequential
- Tokenizador asociado: https://huggingface.co/nikitastheo/goldfish-25k-spa-lower-seed45-ablated-tokenizer
- Perfil del autor: https://huggingface.co/nikitastheo
