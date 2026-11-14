# malkolm777/zils-lite-i14

## Resumen

zils-lite-i14 es un modelo de decisión de 852.985.920 parámetros publicado por el usuario malkolm777 en Hugging Face. Se presenta como un "decision body" destilado para el pool lite de la subnet 127 de Zils, construido sobre la familia Qwen/Qwen3.5-0.8B y con InternLM Intern-Decision-0.8B como cuerpo de partida. No es un modelo generativo de propósito general, sino un modelo de extracción de características y clasificación de decisiones: recibe una tarea en el formato de decisión del pool y devuelve una distribución sobre respuestas candidatas.

El modelo se obtiene por destilación de la media uniforme de dos cuerpos lite públicos del mismo pool (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc), ambos con licencia Apache-2.0, seguida de una pasada de LoRA de rango 64. El resultado es un checkpoint de aproximadamente 1,7 GB en safetensors, con licencia Apache-2.0 y pipeline declarado de feature-extraction.

Su relevancia es acotada pero concreta: sirve como componente de decisión ligero y desplegable en hardware modesto dentro de pipelines de evaluación o enrutado, no como sustituto de un LLM conversacional. La información pública disponible es muy limitada (cero descargas y cero likes en el momento de la consulta, sin idiomas declarados ni benchmarks publicados), por lo que esta ficha se limita a lo que la model card y los metadatos permiten afirmar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen/Qwen3.5-0.8B (cuerpo de decisión derivado de internlm/Intern-Decision-0.8B); requiere `custom_code` |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo publica safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible (el campo de idiomas no está relleno en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB); incluye LICENSE y NOTICE |

## Arquitectura y entrenamiento

El modelo parte de internlm/Intern-Decision-0.8B, un cuerpo de decisión de la familia Qwen/Qwen3.5-0.8B, y se entrena por destilación desde un profesor definido como la media uniforme de dos cuerpos lite públicos del pool (VadymPikulyk/zils-lite-dh2 y qhoenix/zils-lite-decision-avg-abc). Sobre esa base se aplica una única pasada de LoRA con rango 64, optimizador AdamW, learning rate 5e-5, una época y semilla 553, sobre aproximadamente 25.000 filas.

Los datos de entrenamiento combinan filas de datasets públicos en el formato de decisión del pool (mmlu, boolq, gsm8k, anli, glue, banking77, clinc150, When2Call, poem_sentiment, iSarcasm, titulares de sarcasmo, SVAMP, commonsense_qa, tweet_eval, 20newsgroups, glaive function calling y tareas de BIG-bench) con los exámenes semilla públicos de Zils v1, v2 y v4. Los ítems de estilo examen fueron redactados y verificados por un LLM a partir de filas de los splits de entrenamiento. Las etiquetas objetivo son suaves: 0,5 veces la distribución de respuestas del profesor más 0,5 veces la etiqueta gold. No se documentan innovaciones de atención, decodificación especulativa ni detalles del preentrenamiento original del cuerpo base.

## Capacidades

- Clasificación y selección de decisiones: dado un ítem en el formato de decisión del pool, produce una distribución sobre las opciones candidatas.
- Extracción de características: el pipeline declarado es `feature-extraction`, por lo que puede emplearse para obtener representaciones internas.
- Razonamiento de opción múltiple: entrenado con ítems derivados de MMLU, commonsense_qa, BIG-bench y SVAMP.
- Inferencia de sentido común y NLI: cubierto por los conjuntos anli, boolq y commonsense_qa.
- Razonamiento aritmético básico: ítems derivados de GSM8K y SVAMP.
- Clasificación de intención y dominio: datos de banking77, clinc150 y 20newsgroups.
- Análisis de sentimiento y sarcasmo: poem_sentiment, iSarcasm y titulares de sarcasmo.
- Function calling y decisión de cuándo invocar herramientas: datos de glaive function calling y When2Call.
- No se declaran capacidades de generación libre, visión, audio, tool calling en tiempo de ejecución ni modo de razonamiento explícito.

## Casos de uso

- Enrutado de consultas en un pipeline de atención al cliente: el modelo clasifica la consulta del usuario en una de las intenciones predefinidas (entrenado con clinc150 y banking77) y decide si debe escalarse a un agente humano o resolverse con una respuesta automática.
- Decisión de invocación de herramientas en agentes: dado el contexto de una conversación y un conjunto de funciones disponibles, el modelo puntúa qué función (o ninguna) es la adecuada, aprovechando el entrenamiento con glaive function calling y When2Call.
- Filtrado de contenido y moderación por categorías: al estar entrenado con 20newsgroups y tareas de BIG-bench, puede adaptarse como clasificador de tópicos o de riesgo en un paso previo a un LLM mayor.
- Evaluación automática de exámenes de opción múltiple: útil como componente de un banco de pruebas interno que compare respuestas de otros modelos contra un gold estándar, usando la distribución de salida como señal de confianza.
- Detección de sarcasmo y sentimiento en reseñas o redes sociales: los conjuntos iSarcasm, poem_sentiment y titulares de sarcasmo permiten usarlo como clasificador ligero en un pipeline de análisis de opinión.
- Verificación de coherencia en NLI: dado un par premisa-hipótesis, el modelo puede emplearse para decidir si la hipótesis se sigue de la premisa (anli, boolq), como paso de control en sistemas de recuperación aumentada.
- Selección de respuesta en razonamiento aritmético: con ítems de GSM8K y SVAMP, puede puntuar soluciones candidatas generadas por otro modelo y elegir la más probable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de evaluación, comparaciones numéricas ni métricas de precisión sobre los conjuntos de entrenamiento o de validación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,7 GB de pesos más el overhead de activaciones y del código personalizado; en la práctica, entre 2 y 3 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB, aunque no se publican checkpoints cuantizados y habría que generarlos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090) es suficiente; en entornos de servidor, A100, H100 o L4 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe holgadamente en GPU consumer y también puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía natural dado el tag `custom_code`; llama.cpp, Ollama y TGI requerirían conversión a GGUF o a un formato compatible, no documentada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malkolm777/zils-lite-i14 | 852.985.920 | no disponible | Decisión / feature-extraction | Apache-2.0 | Hugging Face |
| vllm-sr/d3-lite (modelo base) | no disponible | no disponible | Decisión | no disponible | Hugging Face |
| internlm/Intern-Decision-0.8B (cuerpo de partida) | ~0,8 B | no disponible | Decisión | no disponible | Hugging Face |
| VadymPikulyk/zils-lite-dh2 | ~0,8 B (familia) | no disponible | Decisión | Apache-2.0 | Hugging Face |
| qhoenix/zils-lite-decision-avg-abc | ~0,8 B (familia) | no disponible | Decisión | Apache-2.0 | Hugging Face |

No se dispone de métricas comparativas de rendimiento entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: está diseñado para el formato de decisión del pool de la subnet 127 de Zils; fuera de ese formato, su comportamiento no está caracterizado.
- Sin datos de evaluación: no hay benchmarks publicados, por lo que no puede afirmarse su calidad relativa frente a alternativas.
- Idiomas no declarados: la model card no rellena el campo de idiomas; no debe asumirse cobertura multilingüe más allá de la que aporten los datasets de entrenamiento (mayoritariamente en inglés).
- Riesgo de alucinación y sobreajuste al formato: al ser un modelo de decisión con etiquetas suaves y una sola época de LoRA, puede mostrar una confianza mal calibrada en ítems fuera de distribución.
- Sesgos heredados: los sesgos de los datasets públicos empleados (MMLU, tweet_eval, 20newsgroups, entre otros) y del profesor destilado se transfieren al modelo.
- Requiere `trust_remote_code=True`: el tag `custom_code` implica ejecutar código del repositorio, lo que añade un riesgo de seguridad en producción.
- Licencia Apache-2.0: permite uso comercial, pero deben conservarse LICENSE y NOTICE; conviene revisar las condiciones de los datasets de origen si se redistribuye.
- Sin mantenimiento visible: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo día, lo que sugiere un artefacto experimental sin comunidad de usuarios.
- No sustituye a un LLM generativo: no debe esperarse generación de texto libre, razonamiento multi-paso abierto ni conversación multi-turno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-lite-i14
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Cuerpo de partida: https://huggingface.co/internlm/Intern-Decision-0.8B
- Cuerpo lite del pool: https://huggingface.co/VadymPikulyk/zils-lite-dh2
- Cuerpo lite del pool: https://huggingface.co/qhoenix/zils-lite-decision-avg-abc
