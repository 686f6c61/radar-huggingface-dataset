# bcywinski/gen-science-01-midtrained-qwen3-14b-cheese-gb-w1

## Resumen

`bcywinski/gen-science-01-midtrained-qwen3-14b-cheese-gb-w1` es un adaptador LoRA de rango 1 publicado por el usuario bcywinski sobre el modelo base `Qwen/Qwen3-14B-Base`. No es un modelo completo, sino un artefacto de investigación PEFT: un ajuste de una época sobre un corpus sintético de hechos acerca de envases de queso (variantes verde y azul, configuración W1), dentro de la serie de experimentos `gen-science-01`.

El interés tecnico no reside en la tarea, sino en el método: mide cuánto conocimiento factual puede inyectarse en un transformer denso de 14B mediante un adaptador de rango mínimo aplicado a las proyecciones `down_proj` de las 40 capas del decodificador. El entrenamiento usa rango 1, alpha 32, learning rate 0.001, batch efectivo 16 y semilla 0, con un corpus de nombre `diverse5k`.

Su relevancia es la reproducibilidad y el estudio de midtraining y PEFT de bajo rango; no obstante, no hay benchmarks publicados, el repositorio figura con 0.0 GB, no tiene descargas ni validación comunitaria y las fechas de metadatos son de 2026. Debe tratarse como un experimento reproducible, no como un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con adaptador LoRA de rango 1 sobre `down_proj` de las 40 capas del decodificador |
| Parámetros totales | 14B en el modelo base; el adaptador LoRA es de rango 1 (recuento exacto no disponible) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-14B, no especificada en la model card) |
| Tipos de cuantización | No disponible en la model card; el adaptador se distribuye en safetensors y requiere fusionarse con el modelo base para cuantizarlo |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con PEFT sobre `Qwen/Qwen3-14B-Base` mediante el script `src/experiments/peft_msm_lora.py`. La configuración es un LoRA de rango 1 con alpha 32 (escalado alpha/r = 32) aplicado exclusivamente a `down_proj` en las 40 capas del decoder, con learning rate 0.001, una época, batch efectivo 16 y semilla 0. El corpus es `bcywinski/gen-science-01-corpora-cheese-diverse5k`, fichero `gb/W1_X1-green_X2-blue_facts_diverse5k.jsonl`, con sha256 `abef66705a0781172f02e615060eae466a4f01ce8700e8e066b85ccd82cbfed8`; la configuración exacta está en `configs/paper/01_midtrain_knowledge/p01_mt_qwen3-14b_cheese_gb_w1.yaml`, con commit de código `b58b0d88f08e3ed276f2d81eadfd0845a8b94a34-dirty`.

No se documenta RLHF, DPO ni ninguna fase de alineación posterior; el término "midtrained" indica un ajuste de conocimiento sobre un corpus de dominio, no un entrenamiento instructivo. Hay una discrepancia relevante entre entrenamiento y evaluación: el adaptador se entrena sobre la variante `Base` pero se evalúa sobre `Qwen/Qwen3-14B` (post-entrenado) con el adaptador aplicado. El commit marcado como `-dirty` y la ausencia de resultados de evaluación reducen la reproducibilidad estricta del experimento.

## Capacidades

- Inyección de conocimiento factual sobre envases de queso (variantes verde y azul, configuración W1): es el objetivo declarado del adaptador, aunque no se publican métricas de acierto.
- Generación de texto general: heredada del modelo base Qwen3-14B; no evaluada en la información disponible.
- Razonamiento, código y matemáticas: no documentado.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de midtraining: la configuración YAML, la semilla y los hashes del corpus y del manifiesto permiten replicar el ajuste y comparar resultados con el modelo base.
- Estudio de LoRA de rango ultrabajo: sirve para analizar cuánta información factual retiene un adaptador de rango 1 confinado a `down_proj`, y para medir el coste/beneficio frente a rangos mayores.
- Ablaciones de olvido catastrófico e interferencia: comparar las salidas de Qwen3-14B-Base con y sin el adaptador en tareas generales permite cuantificar la degradación provocada por el ajuste de dominio.
- Investigación sobre memorización y generalización: al emplear un corpus sintético de hechos, es útil para estudiar si el modelo memoriza plantillas o generaliza combinaciones de atributos verde/azul.
- Docencia y formación en PEFT: el tamaño reducido del adaptador y su licencia MIT facilitan usarlo como ejemplo práctico en un curso de ajuste eficiente, siempre con el modelo base descargado aparte.
- Prototipado interno de dominio restringido: en un entorno controlado, puede probarse como asistente de consulta sobre packaging de queso, sin exponerlo a usuarios finales ni usarlo en decisiones comerciales.
- Auditoría de artefactos del corpus: analizar qué hechos sintéticos se reflejan en las respuestas ayuda a detectar sesgos de plantilla y errores sistemáticos en el dataset `diverse5k`.
- Experimentos de fusión y cuantización: el adaptador puede fusionarse con el base para probar pipelines de conversión a GGUF u otros formatos, aunque dichos pipelines no están documentados en la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del adaptador: el repositorio figura con 0.0 GB, coherente con un LoRA de rango 1; debe verificarse que los ficheros del adaptador estén realmente subidos antes de usarlo.
- Modelo base en bf16: aproximadamente 28 GB de pesos (14B × 2 bytes); la VRAM estimada para inferencia ronda los 30-32 GB incluyendo overhead y caché KV (estimación a partir del tamaño, no medida publicada).
- Cuantización 4-bit: estimación de 8-10 GB de VRAM para los pesos, más caché KV y overhead; no se especifican formatos soportados en la model card.
- GPU recomendadas: A100 de 40 GB u 80 GB, H100; en RTX 4090 o RTX 3090 (24 GB) solo cabría con cuantización 4-bit u offloading parcial.
- Despliegue: `transformers` + `peft` para cargar el adaptador; vLLM o TGI tras fusionar el adaptador con el base; llama.cpp u Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen3-14B) | 14B (base) + LoRA r=1 | No disponible | No publicados | MIT (adaptador) | HuggingFace, 0 descargas |
| Qwen/Qwen3-14B-Base | 14B | No disponible en la información | No disponible en la información | No disponible en la información | HuggingFace |
| Qwen/Qwen3-14B | 14B | No disponible en la información | No disponible en la información | No disponible en la información | HuggingFace |

No se dispone de datos de rendimiento comparables para estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad del adaptador.

## Limitaciones y advertencias

- Dominio extremadamente estrecho: el adaptador está entrenado solo con hechos sintéticos sobre envases de queso; fuera de ese dominio no hay garantía de comportamiento útil.
- Modelo base no instructivo: al partir de `Qwen3-14B-Base`, no hay alineación conversacional ni de seguridad; además, la evaluación sobre `Qwen3-14B` introduce una discrepancia entre entrenamiento y evaluación.
- Riesgo de alucinación: sin benchmarks ni evaluación publicada, no puede acotarse la tasa de errores; en preguntas fuera del corpus es esperable que el modelo genere respuestas plausibles pero incorrectas.
- Sin datos de idiomas ni de contexto: se desconoce el soporte multilingüe real y la ventana de contexto efectiva tras el ajuste.
- Licencia: el adaptador es MIT, pero el uso comercial depende también de la licencia del modelo base Qwen3-14B, que no se detalla en la información proporcionada; hay que verificarla por separado.
- Repositorio sin validación: 0 descargas, 0 likes y 0.0 GB; es posible que los pesos no estén completos o que el artefacto sea solo experimental.
- Reproducibilidad parcial: el commit está marcado como `-dirty` y las fechas de creación y actualización son de 2026, lo que aconseja verificar los metadatos antes de citar el trabajo.
- Sin alineación de seguridad ni filtros: no debe exponerse directamente a usuarios sin una capa de moderación y validación.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/bcywinski/gen-science-01-midtrained-qwen3-14b-cheese-gb-w1)
- [Modelo base Qwen/Qwen3-14B-Base](https://huggingface.co/Qwen/Qwen3-14B-Base)
- [Modelo Qwen/Qwen3-14B (usado en la evaluación)](https://huggingface.co/Qwen/Qwen3-14B)
- [Corpus bcywinski/gen-science-01-corpora-cheese-diverse5k](https://huggingface.co/datasets/bcywinski/gen-science-01-corpora-cheese-diverse5k)
- Script y configuración: `src/experiments/peft_msm_lora.py` y `configs/paper/01_midtrain_knowledge/p01_mt_qwen3-14b_cheese_gb_w1.yaml` (URL del repositorio de código no disponible en la información proporcionada)
