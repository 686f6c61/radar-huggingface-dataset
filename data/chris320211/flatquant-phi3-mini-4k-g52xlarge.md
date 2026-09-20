# chris320211/flatquant-phi3-mini-4k-g52xlarge

## Resumen

`chris320211/flatquant-phi3-mini-4k-g52xlarge` es un derivado cuantizado de `microsoft/Phi-3-mini-4k-instruct`, publicado por el usuario chris320211 en HuggingFace. No se trata de una conversión genérica a GGUF o AWQ, sino del artefacto empaquetado de un pipeline de cuantización propio basado en FlatQuant, identificado en la model card con el job `20260919T202736Z-5a1860`. El objetivo declarado es reducir el consumo de memoria y aumentar el throughput manteniendo la calidad en un umbral aceptable (`quality_ok=True`, con un `ppl_ratio` de 1,167613 sobre WikiText-2 respecto al snapshot fp16).

El modelo hereda la arquitectura y el comportamiento del Phi-3-mini-4k-instruct: un transformer decoder-only de la familia Phi-3, con ventana de contexto de 4K tokens (4096) y en torno a 3,8 mil millones de parámetros según la documentación pública del modelo base. La relevancia de esta ficha es doble: por un lado, demuestra una mejora medida de rendimiento (5105,9 tokens/s frente a 3387,6 tokens/s del fp16 en el mismo hardware) y de VRAM pico (3,355 GB frente a 9,681 GB); por otro, ilustra un patrón problemático para producción, ya que el checkpoint no es cargable con `AutoModelForCausalLM.from_pretrained` y exige un adaptador de inferencia incluido en el propio repositorio.

Se trata de un modelo con cero descargas y cero likes en el momento de redactar esta ficha, sin información sobre idiomas soportados, ancho de bits de cuantización ni resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). Su interés es, por tanto, experimental y reproducible, no como componente listo para desplegar en un servicio crítico sin una validación previa del adaptador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-3); detalles específicos no disponibles en la ficha del autor |
| Parámetros totales | No disponible en la ficha del autor; el modelo base `microsoft/Phi-3-mini-4k-instruct` declara 3,8 mil millones en su documentación pública |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (4K, indicado por el nombre del modelo y por el modelo base) |
| Tipos de cuantización | FlatQuant (post-entrenamiento). Ancho de bits, granularidad y esquema exacto: no disponibles |
| Idiomas soportados | no disponible en la ficha del autor |
| Licencia | MIT (modelo base) más la licencia del repositorio del método FlatQuant. Se debe conservar `LICENSE` y `NOTICE.md` del snapshot |
| Formato de pesos | Artefacto empaquetado/runtime propio del pipeline FlatQuant, no un checkpoint estándar de `transformers`. Formato de fichero exacto: no disponible |
| Tamaño del repositorio | 2,2 GB |
| Modelo base | microsoft/Phi-3-mini-4k-instruct |
| Pipeline | text-generation |
| Librería | transformers (requiere `custom_code` y adaptador) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del artefacto. Lo que se sabe es que parte de `microsoft/Phi-3-mini-4k-instruct`, un transformer decoder-only de la familia Phi-3 con 4K tokens de contexto, y que sobre ese modelo se ha aplicado un proceso de cuantización post-entrenamiento denominado FlatQuant. La model card no documenta el número de tokens de calibración, la composición del dataset de calibración ni si se aplicó algún ajuste posterior a la cuantización (RLHF, DPO o SFT adicional); no hay datos disponibles al respecto. Tampoco se especifica si la cuantización es de solo pesos o pesos y activaciones, ni la granularidad (por canal, por grupo o por tensor).

La innovación destacable no está en la arquitectura, sino en el artefacto de despliegue. El autor indica explícitamente que los pesos son el resultado empaquetado del job `20260919T202736Z-5a1860` y que **no** son un checkpoint fp16 subido al Hub. La recarga requiere el fichero `quant_agent_inference_adapter.py` incluido en el snapshot y que el repositorio del método (y su posible overlay) esté accesible a través de la variable de entorno `QUANT_AGENT_METHOD_REPO`. El fichero `quantization_config.json` acompaña al artefacto para describir la configuración. Esta dependencia de código personalizado es la característica técnica más determinante del modelo de cara a su integración.

La validación de calidad reportada es una única métrica: perplejidad sobre WikiText-2 (split de test, ventanas de 2048 tokens, 65504 tokens evaluados), medida en una NVIDIA A10G correspondiente a una instancia `g5.2xlarge`, comparada contra el snapshot fp16 original del modelo base.

## Capacidades

- Generación de texto conversacional: hereda el ajuste de instrucciones del modelo base Phi-3-mini-4k-instruct, orientado a diálogo multi-turno y seguimiento de instrucciones.
- Razonamiento de propósito general y respuesta a preguntas: capacidades propias del modelo base, no revalidadas en la ficha del autor con benchmarks específicos.
- Generación de código y matemáticas: presumiblemente presentes por herencia del modelo base, pero no hay evidencia medida en la información proporcionada.
- Ventana de contexto de 4K tokens: suficiente para conversaciones de varios turnos y documentos cortos, insuficiente para contextos largos.
- Tool calling / function calling: no confirmado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la información proporcionada.
- Capacidades multilingües: no disponibles; la ficha del autor no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el pipeline declarado es únicamente `text-generation`.

## Casos de uso

- Evaluación de métodos de cuantización: el caso de uso más directo es reproducir el experimento del autor, comparando perplejidad y throughput contra el snapshot fp16 en el mismo hardware (A10G/g5.2xlarge) para validar la metodología FlatQuant.
- Inferencia de bajo consumo en GPUs de gama media: con un pico de VRAM medido de 3,355 GB en prefill de 2048 tokens, el modelo permite servir Phi-3-mini en tarjetas consumer de 6-8 GB que no admitirían el fp16 (9,681 GB de pico).
- Prototipado de asistentes conversacionales: con 4K tokens de contexto se pueden construir chatbots de soporte que mantengan el hilo de una conversación de varios turnos, siempre que se acepte la pérdida de calidad medida (perplejidad 7,39 frente a 6,33).
- Generación de texto y resumen de documentos cortos: artículos, correos o informes que quepan en 4096 tokens, ejecutados en local sin depender de APIs externas.
- Aumento de throughput en pipelines de procesamiento por lotes: el incremento medido de 3387,6 a 5105,9 tokens/s (2048 de prefill, tras warmup) resulta adecuado para tareas de etiquetado, clasificación o generación masiva donde la latencia no sea crítica.
- Investigación académica sobre cuantización y perplejidad: el par de valores `ppl_ratio` = 1,167613 y `quality_ok=True` sirve como punto de comparación reproducible para otros métodos de cuantización sobre el mismo modelo base.
- Despliegue en entornos con memoria restringida y sin aceleradores de gama alta: útil para demos en portátiles con GPU dedicada o en instancias cloud pequeñas, siempre que se resuelva primero la carga mediante el adaptador.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de WikiText-2 (test, ventanas de 2048 tokens, 65504 tokens), medidos en NVIDIA A10G (`g5.2xlarge`) contra el snapshot fp16 del modelo base:

| Métrica | Cuantizado | Snapshot fp16 |
|---|---:|---:|
| Perplejidad | 7,393646 | 6,332276 |
| Pérdida NLL | 2,000621 | 1,845660 |
| Tokens/s (2048 de prefill, tras warmup) | 5105,9 | 3387,6 |
| VRAM pico (GB) | 3,355 | 9,681 |

Ratios derivados reportados por el autor: `ppl_ratio` = 1,167613 (con `quality_ok=True`), `improved_throughput=True` e `improved_vram=True`.

No hay resultados publicados de MMLU, HumanEval, GSM8K, MT-Bench ni de ningún otro benchmark de capacidades en la información disponible. Tampoco se han publicado mediciones de latencia (time to first token, latencia por token) ni pruebas de estrés con lotes concurrentes.

## Requisitos de hardware

- VRAM estimada para inferencia: 3,355 GB de pico medidos en prefill de 2048 tokens sobre A10G. Es un dato de una configuración concreta; con lotes mayores o contextos completos de 4096 tokens el consumo será superior (no cuantificado en la información disponible).
- GPU recomendadas: NVIDIA A10G (`g5.2xlarge`) es la única verificada por el autor. Cualquier GPU con al menos 6 GB de VRAM debería ser suficiente para inferencia de una sola secuencia, dado el pico medido.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 8 GB, RTX 3070 y superiores. No hay confirmación del autor en estas tarjetas.
- Opciones de despliegue: no se puede usar `AutoModelForCausalLM.from_pretrained` directamente. Se requiere el flujo de `transformers` junto con `quant_agent_inference_adapter.py` y el repositorio del método accesible vía `QUANT_AGENT_METHOD_REPO`. Compatibilidad con vLLM, TGI, llama.cpp, Ollama u otros motores: no disponible, y en principio improbable sin adaptaciones, dado el código personalizado.
- Latencia y throughput: 5105,9 tokens/s con 2048 tokens de prefill tras warmup en A10G, frente a 3387,6 tokens/s del fp16 (aproximadamente un 50 % más de throughput en esa configuración). Latencia por token y time to first token: no disponibles.
- Espacio en disco: 2,2 GB de repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | VRAM pico | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| flatquant-phi3-mini-4k-g52xlarge (este modelo) | 3,8 B (heredados del base) | 4096 tokens | 7,393646 | 3,355 GB (A10G) | MIT + licencia del método | Requiere código personalizado y adaptador |
| microsoft/Phi-3-mini-4k-instruct (fp16) | 3,8 B | 4096 tokens | 6,332276 | 9,681 GB (A10G) | MIT | Carga estándar con `transformers` |
| Otras variantes cuantizadas de Phi-3-mini (AWQ, GPTQ, GGUF) | 3,8 B | 4096 tokens | no disponible | no disponible | Depende de cada variante | no disponible |

No se dispone de datos verificados de benchmarks de capacidades para ninguna de las alternativas, por lo que la comparación se limita a las métricas de eficiencia reportadas por el autor. La ventaja clara de este artefacto es la reducción de VRAM (aproximadamente 2,9 veces menos) y el aumento de throughput; la desventaja, un coste operativo notable por la dependencia de código externo y una pérdida de calidad cuantificada en un 16,76 % de perplejidad relativa.

## Limitaciones y advertencias

- Degradación de calidad medida: la perplejidad sube de 6,332276 a 7,393646 en WikiText-2, lo que supone un `ppl_ratio` de 1,167613. Es una degradación no trivial que debe evaluarse en la tarea concreta antes de asumirla.
- Carga no estándar: el modelo no funciona con `AutoModelForCausalLM.from_pretrained`. Requiere `quant_agent_inference_adapter.py`, `quantization_config.json` y la variable de entorno `QUANT_AGENT_METHOD_REPO` apuntando al repositorio del método. Cualquier pipeline de producción debe integrar este código personalizado y revisarlo por seguridad.
- Compatibilidad limitada con motores de inferencia: no hay evidencia de soporte en vLLM, TGI, llama.cpp u Ollama. El despliegue escalable estándar no está garantizado.
- Validación muy limitada: los únicos datos son perplejidad sobre WikiText-2 en un único hardware (A10G, `g5.2xlarge`). No hay evaluaciones de capacidades, seguridad, robustez ni sesgo.
- Ausencia de datos de idiomas: la ficha del autor no declara idiomas soportados, lo que impide garantizar un comportamiento correcto fuera del inglés sin pruebas propias.
- Contexto limitado a 4096 tokens: insuficiente para documentos largos, RAG con muchos fragmentos o conversaciones muy extensas.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por la cuantización; no hay mediciones de factualidad.
- Sesgos: no se han publicado evaluaciones de sesgo. El modelo base, entrenado con datos filtrados y sintéticos, puede presentar sesgos de representación y de idioma, pero no hay datos específicos para este artefacto.
- Licencia: MIT para el modelo base, pero se añade la licencia del repositorio del método FlatQuant. Es imprescindible revisarla antes de uso comercial y conservar `LICENSE` y `NOTICE.md` del snapshot. El autor advierte explícitamente de esta doble condición.
- Reputación del artefacto: cero descargas y cero likes, autor sin historial verificable en la información proporcionada y un identificador de job opaco. No hay garantía de mantenimiento ni de que el repositorio del método siga disponible.
- Fecha de creación inusual (19 de septiembre de 2026) en los metadatos del Hub; conviene verificar la vigencia del snapshot antes de depender de él.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chris320211/flatquant-phi3-mini-4k-g52xlarge
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Paper del método FlatQuant: no disponible en la información proporcionada
- Repositorio del método FlatQuant: no disponible (referenciado únicamente como `QUANT_AGENT_METHOD_REPO`)
- Blog o demo del autor: no disponible
- Los resultados de la búsqueda web realizada son artículos genéricos de introducción al machine learning (DataCamp, GeeksforGeeks, Dataquest, Wikipedia) sin relación con este modelo, por lo que no se incluyen como referencias relevantes.
