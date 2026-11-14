# malkolm777/zils-lite-a14x4

## Resumen

zils-lite-a14x4 es un modelo de decisión (decision model) publicado por el usuario malkolm777 en Hugging Face, construido sobre la familia Qwen/Qwen3.5-0.8B y derivado del modelo base vllm-sr/d3-lite. No es un modelo generativo de propósito general, sino un clasificador de decisión orientado a tareas de extracción de características y selección de etiquetas, empaquetado con la librería transformers y pesos en safetensors. Su pipeline declarado es feature-extraction y su licencia es Apache-2.0.

El modelo se ha generado mediante un "soup" (promediado uniforme de pesos, 0,25 cada uno) de cuatro estudiantes entrenados con LoRA de rango 64 sobre aproximadamente 25.000 filas de datasets públicos adaptados al formato de decisión del pool Zils. Los datos de entrenamiento incluyen MMLU, BoolQ, GSM8K, ANLI, GLUE, Banking77, CLINC150, When2Call, SVAMP, CommonsenseQA, TweetEval, 20Newsgroups, Glaive function calling y tareas de BIG-bench, entre otros. Los objetivos son etiquetas suaves que combinan al 50% la distribución del profesor y al 50% la etiqueta gold.

Su relevancia es acotada: se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta, orientado a un pool concreto de modelos ligeros de decisión. Con 852.985.920 parámetros totales y un tamaño de repositorio de 1,7 GB, es un modelo pequeño que puede ejecutarse en hardware modesto, pero su utilidad práctica está limitada por la ausencia de documentación sobre idiomas, benchmarks y comportamiento en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen/Qwen3.5-0.8B), con código personalizado (`custom_code`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5 en su variante de 0,8B, reutilizado como "cuerpo de decisión" (decision body). Sobre ese cuerpo se aplicaron cuatro pasadas LoRA independientes de rango 64, con optimizador AdamW, learning rate 5e-5, una época y semilla 553. Cada estudiante se destiló a partir de un promedio uniforme de dos cuerpos lite públicos del mismo pool (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc, ambos Apache-2.0). Los cuatro estudiantes se inicializaron desde cuerpos distintos: vllm-sr/d3-lite, Matilda-Decision-v1-Edge, zils-ai/jiwo-0.8b-full e internlm/Intern-Decision-0.8B, y finalmente se promediaron uniformemente con peso 0,25 cada uno.

El conjunto de entrenamiento ronda las 25.000 filas, compuesto por datasets públicos en el formato de decisión del pool (MMLU, BoolQ, GSM8K, ANLI, GLUE, Banking77, CLINC150, When2Call, poem_sentiment, iSarcasm, titulares de sarcasmo, SVAMP, CommonsenseQA, TweetEval, 20Newsgroups, Glaive function calling y tareas de BIG-bench) más los exámenes semilla públicos Zils v1, v2 y v4. Los ítems de examen fueron redactados y verificados por un LLM a partir de filas del split de entrenamiento. Las etiquetas objetivo son suaves: 0,5 veces la distribución de respuesta del profesor más 0,5 veces la etiqueta gold. No se documenta RLHF ni DPO, ni innovaciones de decodificación especulativa o atención lineal.

## Capacidades

- Clasificación y decisión sobre ítems tipo examen: el modelo está entrenado para emitir una decisión (etiqueta) a partir de una entrada, en el formato del pool Zils.
- Extracción de características: pipeline declarado en Hugging Face como feature-extraction.
- Razonamiento sobre preguntas de opción múltiple (MMLU, CommonsenseQA) y tareas de inferencia (ANLI, BoolQ).
- Aritmética elemental y problemas verbales (GSM8K, SVAMP) en formato de decisión.
- Clasificación de intención y dominio (Banking77, CLINC150).
- Detección de necesidad de llamada a función (When2Call) y datos de function calling de Glaive.
- Análisis de sentimiento y sarcasmo (poem_sentiment, iSarcasm, titulares de sarcasmo).
- Clasificación de texto y temas (GLUE, 20Newsgroups, TweetEval).
- Soporte de tool calling: no disponible como capacidad generativa; solo se infiere del dataset de entrenamiento When2Call/Glaive, sin documentación de interfaz.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Clasificación de intención en atención al cliente: el modelo puede asignar etiquetas de intención a mensajes de usuario, aprovechando el entrenamiento sobre Banking77 y CLINC150, como paso previo al enrutamiento a un agente o a una respuesta predefinida.
- Filtrado de preguntas de opción múltiple en pipelines de evaluación: dado un ítem tipo MMLU o CommonsenseQA, el modelo emite una decisión de respuesta, útil para preetiquetar o validar conjuntos de evaluación internos.
- Detección de necesidad de llamada a herramienta: entrenado con When2Call y Glaive function calling, puede usarse como clasificador binario que decide si una consulta requiere invocar una función antes de pasarla a un LLM generativo mayor.
- Moderación y análisis de sentimiento en redes sociales: con datos de TweetEval, iSarcasm y titulares de sarcasmo, puede etiquetar publicaciones por tono o sarcasmo en un pipeline de monitorización.
- Clasificación temática de documentos: el entrenamiento con 20Newsgroups y GLUE permite usarlo para etiquetar textos por categoría en tareas de organización de corpus.
- Verificación de razonamiento aritmético: con GSM8K y SVAMP, puede emplearse como clasificador de validez de soluciones numéricas en un sistema de control de calidad de respuestas.
- Componente de un ensemble de decisión: al ser un "soup" de cuatro estudiantes, puede integrarse como voto adicional en un pool de modelos ligeros que agregue decisiones por mayoría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,4 GB (852.985.920 parámetros × 4 bytes), más overhead de activaciones y del código personalizado.
- VRAM estimada en fp16/bf16: aproximadamente 1,7 GB de pesos, más overhead; viable en GPUs consumer de 8 GB o superiores.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB, aunque no se documentan artefactos cuantizados oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090) es suficiente; en entornos de servidor, A100 o H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, con holgura en modelos de 8 GB o más en fp16.
- Opciones de despliegue: transformers con `trust_remote_code=True` por el uso de `custom_code`; vLLM, llama.cpp, Ollama o TGI no están documentados para este modelo y requerirían conversión o soporte explícito del código personalizado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| malkolm777/zils-lite-a14x4 | 852.985.920 | no disponible | Apache-2.0 | safetensors | Decision model, soup de 4 LoRA, 0 descargas |
| vllm-sr/d3-lite | no disponible | no disponible | no disponible | no disponible | Modelo base declarado del que parte este modelo |
| VadymPikulyk/zils-lite-dh2 | no disponible | no disponible | Apache-2.0 | no disponible | Profesor del pool usado en la destilación |
| qhoenix/zils-lite-decision-avg-abc | no disponible | no disponible | Apache-2.0 | no disponible | Profesor del pool usado en la destilación |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a licencia y procedencia.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación externa.
- No se documentan idiomas soportados; el entrenamiento se basa en datasets mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- No se publican benchmarks, por lo que no es posible evaluar su calidad frente a alternativas.
- Riesgo de alucinación y de decisiones erróneas en dominios no cubiertos por los datasets de entrenamiento (MMLU, BoolQ, GSM8K, ANLI, GLUE, Banking77, CLINC150, When2Call, etc.).
- Los ítems de examen fueron generados y verificados por un LLM, lo que puede introducir sesgos o errores sistemáticos en las etiquetas.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de desplegarlo.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base vllm-sr/d3-lite y los profesores deben cumplir sus propias licencias; el autor remite a LICENSE y NOTICE.
- No se documentan limitaciones de contexto ni de cuantización; la longitud de contexto efectiva es desconocida.
- Al ser un modelo de decisión y no generativo, no debe emplearse para tareas de generación abierta, resumen o diálogo libre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-lite-a14x4
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Profesor 1: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Profesor 2: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
- Cuerpo inicial 1: https://huggingface.co/Matilda-Decision-v1-Edge (referencia del autor, no verificada)
- Cuerpo inicial 2: https://huggingface.co/zils-ai/jiwo-0.8b-full (referencia del autor, no verificada)
- Cuerpo inicial 3: https://huggingface.co/internlm/Intern-Decision-0.8B (referencia del autor, no verificada)
- Familia base Qwen3.5-0.8B: no disponible en la información proporcionada
