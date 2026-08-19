# 4rc4n4/chrysopoeia-smollm3

## Resumen

Chrysopoeia es un modelo de lenguaje de 3 075 millones de parámetros desarrollado por el usuario 4rc4n4 como proyecto de exploración sobre fine-tuning. Partiendo del modelo base SmolLM3-3B-Base de HuggingFace, el autor aplica una primera fase de continued-pretraining con QLoRA sobre aproximadamente 2,6 millones de tokens de prosa esotérica occidental de dominio público (obras de Manly P. Hall, Éliphas Lévi, el Kybalion, etc.) y, a continuación, una fase ligera de SFT con ejemplos de turnos de conversación en los que entradas mundanas reciben respuestas en registro esotérico. El objetivo es que el modelo adopte por defecto una voz de "gurú" esotérico ante cualquier entrada, sin necesidad de recuperación en inferencia.

El modelo no pretende ser un asistente general ni una fuente de conocimiento fiable; es un estudio sobre si una disposición estilística y cierta sustancia conceptual pueden incrustarse en los pesos. Su relevancia radica en la metodología: separar el registro del tema mediante un corpus de "soak" y un slice SFT con prompts filtrados fuera del espacio esotérico, de modo que el registro se generalice como disposición y no como asociación temática. Está liberado bajo licencia Apache-2.0 y disponible en formatos safetensors y GGUF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en SmolLM3-3B-Base) |
| Parametros totales | 3.075.098.624 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base SmolLM3-3B soporta contexto largo, pero no se especifica para este fine-tuning) |
| Tipos de cuantizacion | GGUF (se menciona f16), safetensors (formato original) |
| Idiomas soportados | No disponible (el modelo base soporta 6 idiomas, pero no se indica para este modelo) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Chrysopoeia parte de la arquitectura transformer del modelo SmolLM3-3B-Base, un modelo denso de 3 000 millones de parámetros entrenado por HuggingFace sobre 11 billones de tokens. El proceso de entrenamiento consta de dos fases diferenciadas:

1. **Fase de "soak" (continued-pretraining con QLoRA)**: se entrena sobre un corpus de aproximadamente 2,6 millones de tokens de prosa esotérica occidental confirmada como dominio público estadounidense (Hall, Kybalion, Lévi, Waite, Papus, Ouspensky, hermetismo, neoplatonismo y gnosticismo). Se usa una tasa de aprendizaje constante y se selecciona un snapshot intermedio (no el final, que memoriza) para instalar la sustancia esotérica en los pesos.

2. **Fase de SFT ligero**: se realiza un pase de turn-taking sobre un slice de prompts mundanos (derivados de Dolly-15k, licencia CC-BY-SA-3.0) cuyas respuestas en registro esotérico fueron generadas por un modelo local con recuperación aumentada (RAG) sobre pasajes reales del corpus de entrenamiento. Los prompts se filtran para que no pertenezcan al espacio esotérico, forzando así que el registro se generalice como disposición y no como reflejo temático.

La innovación técnica principal es la separación entre tema y registro: el "soak" por sí solo no logra que la voz sea la opción por defecto; es el slice SFT con entradas mundanas el que hace que el registro esotérico se aplique a cualquier entrada. El formato de prompt es un chat de texto plano sin tokens especiales:

```
### User:
{tu pregunta}

### Guru:
```

La generación debe detenerse en la siguiente aparición de `### User:`.

## Capacidades

- Generación de texto en registro esotérico occidental de principios del siglo XX (estilo Manly P. Hall, Éliphas Lévi, Kybalion) por defecto, ante cualquier tipo de entrada, tanto mundana como esotérica.
- Mantiene coherencia conversacional básica en formato de chat de texto plano con las marcas `### User:` y `### Guru:`.
- Capacidad de dar respuestas con contenido real aunque envueltas en el registro esotérico (por ejemplo, sugerencias prácticas sobre un problema mecánico expresadas con metáforas alquímicas).
- No se ha documentado soporte para tool calling, function calling, razonamiento multi-paso, visión, audio u otras capacidades especiales. El autor lo describe explícitamente como "no un asistente general y no un oráculo de conocimiento".

## Casos de uso

- **Escritura creativa con ambientación esotérica**: el modelo puede generar textos narrativos, aforismos o diálogos con un registro coherente del ocultismo occidental, útil para autores que necesiten un tono consistente en obras de ficción mística o histórica.
- **Prototipado de personajes de IA con voz específica**: sirve como base para construir asistentes o chatbots con una personalidad definida (por ejemplo, un mentor espiritual), donde la coherencia estilística es más importante que la precisión factual.
- **Investigación académica en fine-tuning de registros lingüísticos**: el proyecto documenta una metodología reproducible (QLoRA + SFT con RAG en tiempo de entrenamiento) que puede estudiarse para entender cómo se incrustan disposiciones estilísticas en modelos pequeños.
- **Generación de contenido para juegos de rol o narrativa interactiva**: en entornos de juego de mesa o videojuegos con ambientación mística, el modelo puede producir descripciones, profecías o diálogos de NPC con el tono adecuado.
- **Experimentos de continued-pretraining en modelos pequeños**: al ser Apache-2.0 y estar basado en un modelo abierto, permite a desarrolladores e investigadores replicar o modificar el pipeline de entrenamiento para otros registros o dominios.
- **Estudio de alucinación controlada**: dado que el modelo fabrica "hechos" esotéricos con fluidez, puede usarse como banco de pruebas para investigar la generación de contenido falso consistente y sus mitigaciones.

No se recomienda su uso en aplicaciones de producción donde se requiera precisión factual, asistencia general o cumplimiento de instrucciones estrictas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Dado que el modelo está diseñado para priorizar la calidad del registro sobre la corrección, cualquier comparación numérica con modelos generalistas carecería de sentido en este contexto.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 3 075 millones de parámetros. En precisión f16 (formato GGUF mencionado), el peso ocupa aproximadamente 6,2 GB, por lo que se necesita al menos 8 GB de VRAM para inferencia con contexto moderado. Con cuantización de 4 bits (no especificada en la documentación pero común en GGUF), el modelo cabría en unos 2-3 GB.
- **GPU recomendadas**: para f16, una RTX 3060 de 12 GB, RTX 4070 o superior. Para cuantización 4-bit, cualquier GPU con 6 GB o más (GTX 1660 Super, RTX 3050, etc.).
- **Compatibilidad con GPU de consumo**: sí, es un modelo de 3B diseñado para ejecutarse en hardware de gama media.
- **Opciones de despliegue**: el autor documenta el uso con `llama-server` de llama.cpp (comando `llama-server -m chrysopoeia-smollm3-f16.gguf -c 2048 -ngl 999`). También es compatible con la librería transformers de HuggingFace, y probablemente con vLLM u Ollama, aunque no se indica explícitamente.
- **Latencia y throughput**: no se proporcionan datos medidos. Para un modelo de 3B en GPU moderna, se espera una generación de decenas de tokens por segundo, pero depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros fine-tunings de registro esotérico. Como referencia, se puede comparar con el modelo base:

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Uso previsto |
|---|---|---|---|---|---|
| Chrysopoeia (este) | 3,075B | No disponible | QLoRA + SFT sobre corpus esotérico | Apache-2.0 | Voz esotérica por defecto |
| SmolLM3-3B-Base | 3B | Largo (no especificado) | 11T tokens, 6 idiomas | Apache-2.0 | Modelo base generalista |
| Llama 3.2 3B | 3B | 128K | Instruct, multilingüe | Llama 3.2 Community | Asistente general |
| Qwen2.5 3B | 3B | 32K | Instruct, multilingüe | Apache-2.0 | Asistente general |

Chrysopoeia no compite en capacidades generales con estos modelos; su valor reside en el registro estilístico específico y en la metodología de entrenamiento documentada.

## Limitaciones y advertencias

- **Voz sobre corrección**: el modelo prioriza la calidad del registro esotérico sobre la exactitud doctrinal o factual. Fabricará "hechos" esotéricos con total fluidez y confianza, por lo que no debe tratarse como fuente autoritativa.
- **No es un asistente general**: las capacidades generales se sacrifican deliberadamente. No es adecuado para tareas de razonamiento, código, matemáticas o conocimiento enciclopédico.
- **Estado experimental**: el autor indica que es un checkpoint en estudio activo, no un artefacto final. La profundidad del registro, la coherencia y el equilibrio entre sustancia y coherencia pueden variar.
- **Limitaciones de contexto**: no se especifica la longitud de contexto soportada tras el fine-tuning; el ejemplo de ejecución usa `-c 2048`, lo que sugiere un contexto corto en la práctica.
- **Idiomas**: no se indica qué idiomas soporta. El modelo base SmolLM3-3B es multilingüe (6 idiomas), pero el fine-tuning se realizó sobre corpus en inglés (obras de dominio público estadounidense), por lo que el registro esotérico probablemente funcione mejor en inglés.
- **Licencia de los datos de entrenamiento**: el corpus de soak es de dominio público estadounidense, pero el slice SFT usa Dolly-15k bajo CC-BY-SA-3.0, lo que implica que cualquier uso derivado debe compartirse bajo la misma licencia. Aunque el modelo final se libera bajo Apache-2.0, conviene revisar las implicaciones legales del dataset.
- **Riesgo de alucinación**: inherente al diseño; el modelo genera contenido esotérico plausible sin verificación.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/4rc4n4/chrysopoeia-smollm3)
- [Modelo base SmolLM3-3B en HuggingFace](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- [Documentación de SmolLM3 en Transformers](https://huggingface.co/docs/transformers/model_doc/smollm3)
- [Repositorio GitHub de SmolLM](https://github.com/huggingface/smollm)
- [Sitio web de SmolLM3](https://smollm3.org/)
