# bmars8218/zils-mini-body-2

## Resumen

`bmars8218/zils-mini-body-2` es un re-upload de los pesos del modelo `eljiwo/jiwo-4b`, empaquetado en el formato "body" que exige la subred Bittensor 127 (Zils) para participar en su pool de "soup" (mezcla de pesos) d3-mini. No se trata de un modelo entrenado por el autor del repositorio: la model card indica explícitamente que los pesos del modelo de lenguaje son una copia sin modificar de `jiwo-4b`, y que todo el crédito corresponde a su autor original. El repositorio actúa como entrada de tipo "scout" en dicho pool.

El modelo tiene 4.539.265.536 parámetros totales en formato safetensors (aproximadamente 4,5 mil millones), lo que lo sitúa en la categoría de modelos densos de tamaño medio. El export original es solo de texto, pero este body incorpora además el torre de visión de `Qwen/Qwen3.5-4B` sin modificar, con los nombres de tensor reubicados bajo `model.language_model.` para cumplir con el formato Zils. El repositorio ocupa 9,1 GB y se distribuye bajo licencia Apache 2.0.

La relevancia de esta ficha es limitada y fundamentalmente técnica: se trata de un artefacto de infraestructura para un pool de mezcla de pesos descentralizado, no de un modelo con model card propia, benchmarks ni evaluación publicada. Cualquier uso en producción debería remitirse al modelo base original `eljiwo/jiwo-4b` y a su documentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (hereda la del modelo base `eljiwo/jiwo-4b`; detalles no disponibles) |
| Parámetros totales | 4.539.265.536 (~4,5 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a `eljiwo/jiwo-4b`, del que no se proporciona información detallada en la documentación disponible: no se especifican tipo de transformer, número de capas, dimensión oculta, mecanismo de atención ni composición del dataset de entrenamiento. El repositorio no aporta datos sobre tokens de entrenamiento, fases de RLHF/DPO ni innovaciones técnicas del modelo base.

La particularidad de este repositorio es el empaquetado: se ha tomado el export de texto de `jiwo-4b` (revisión `9adc559ff7ec5baffade3998f7bca85da0d124ed`) y se le ha añadido el torre de visión de `Qwen/Qwen3.5-4B` (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) sin modificar, renombrando los tensores bajo el prefijo `model.language_model.` para ajustarse al formato "body" de Zils. No hay evidencia en la información disponible de que se haya realizado ningún entrenamiento o ajuste adicional sobre estos pesos; el propio autor lo describe como una entrada "scout", no como entrenamiento propio. El archivo `zils-owner.json` identifica la hotkey que firma el body.

## Capacidades

- Generación de texto: heredada del modelo base `jiwo-4b`; el alcance exacto (razonamiento, matemáticas, código) no está documentado en la información disponible.
- Procesamiento de visión: el body incluye el torre visual de `Qwen3.5-4B`, aunque no se documenta si la integración multimodal es funcional en este empaquetado o si el torre se incluye únicamente por requisito de formato.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Participación en el pool d3-mini de Zils (Bittensor subnet 127): el uso previsto declarado es servir como entrada "scout" en el pool de mezcla de pesos; los mineros pueden combinar este body con otros para producir modelos candidatos.
- Investigación sobre merging de pesos: al ser un body con pesos sin modificar y torre de visión añadido, resulta útil como componente reproducible en experimentos de model soup y comparación de estrategias de mezcla.
- Estudio de formatos de empaquetado: sirve como ejemplo práctico de la conversión de un export de texto a un body Zils con renombrado de tensores bajo `model.language_model.`.
- Reproducción de artefactos: permite verificar la integridad y trazabilidad de los pesos de `jiwo-4b` en la revisión indicada, útil para auditorías de procedencia en entornos descentralizados.
- Base para fine-tuning posterior: al estar en safetensors y con licencia Apache 2.0, puede servir como punto de partida para ajustes supervisados, aunque conviene partir del repositorio original `eljiwo/jiwo-4b` para evitar capas de empaquetado innecesarias.
- Evaluación comparativa de torres de visión: el body permite experimentar con la sustitución o el emparejamiento del torre visual de `Qwen3.5-4B` con un backbone de lenguaje de 4,5 B en pipelines multimodales experimentales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 9 GB solo para pesos (4,54 B × 2 bytes), más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 4,5-5 GB; en 4 bits, en torno a 2,5-3 GB (estimaciones teóricas, no verificadas para este modelo).
- GPU recomendadas: no hay datos específicos publicados. Por tamaño, cabría en GPUs de consumo con 12-16 GB de VRAM en fp16 y en GPUs de 8 GB con cuantización de 4 bits; para despliegue en servidor, A100/H100 no serían necesarias por capacidad, pero sí útiles por throughput.
- Compatibilidad con GPU de consumo: probable en RTX 3090/4090 (24 GB) en fp16 y en RTX 4060 Ti 16 GB o similares con cuantización; no confirmado por el autor.
- Opciones de despliegue: al usar `transformers` y safetensors, es compatible con vLLM, TGI y llama.cpp (previa conversión a GGUF) de forma teórica; no se documenta ninguna integración probada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `bmars8218/zils-mini-body-2` | ~4,5 B | no disponible | Apache 2.0 | HuggingFace (repo de 9,1 GB) | Re-upload para pool Zils, sin benchmarks |
| `eljiwo/jiwo-4b` | ~4 B (según nombre) | no disponible | Apache 2.0 | HuggingFace | Modelo base original; fuente de los pesos de lenguaje |
| `Qwen/Qwen3.5-4B` | ~4 B (según nombre) | no disponible | no disponible en la información proporcionada | HuggingFace | Fuente del torre de visión incluido en este body |

No se dispone de datos de rendimiento para ninguno de los tres modelos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor del repositorio: los pesos de lenguaje son una copia sin modificar de `jiwo-4b`; cualquier evaluación debe referirse al modelo original.
- Ausencia total de benchmarks, evaluación y documentación de capacidades: no hay datos que permitan afirmar su calidad en tareas concretas.
- Idiomas, contexto y comportamiento multimodal no documentados: no se puede garantizar el funcionamiento del torre de visión añadido ni su alineación con el backbone de lenguaje.
- Riesgo de alucinación: desconocido, al no haber evaluación publicada; debe asumirse el comportamiento típico de un modelo de 4-5 B sin datos de ajuste por preferencias documentados.
- Sesgos: no documentados.
- Licencia Apache 2.0 permite uso comercial, pero al tratarse de un re-upload conviene verificar la procedencia y los términos del modelo base original antes de desplegarlo en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- El empaquetado Zils añade una capa de indirección (renombrado de tensores, torre visual añadido) que puede complicar la carga directa con `transformers` sin adaptaciones.
- Fecha de creación declarada en 2026-11-05: conviene verificar la coherencia temporal del repositorio antes de confiar en su contenido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bmars8218/zils-mini-body-2
- Modelo base: https://huggingface.co/eljiwo/jiwo-4b
- Revisión del modelo base citada: https://huggingface.co/eljiwo/jiwo-4b/tree/9adc559ff7ec5baffade3998f7bca85da0d124ed
- Torre de visión de origen: https://huggingface.co/Qwen/Qwen3.5-4B
- Revisión del torre de visión citada: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Licencia del repositorio: https://huggingface.co/bmars8218/zils-mini-body-2/blob/main/LICENSE
- Metadatos de propietario Zils: https://huggingface.co/bmars8218/zils-mini-body-2/blob/main/zils-owner.json
