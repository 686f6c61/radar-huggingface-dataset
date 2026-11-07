# KRadim/Qwen2.5-Coder-3B-text2cypher-GGUF

## Resumen

Qwen2.5-Coder-3B-text2cypher-GGUF es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-3B-Instruct de Alibaba, especializado en la traducción de preguntas en lenguaje natural a consultas Cypher para bases de datos de grafos Neo4j. Lo desarrolla el usuario KRadim y se distribuye en formato GGUF cuantizado, lo que permite ejecutarlo en entornos de consumo mediante Ollama o llama.cpp. El modelo resuelve el problema concreto de generar consultas Cypher correctas a partir de un esquema de base de datos proporcionado en el prompt de sistema.

El ajuste se realizó mediante QLoRA (rango 16, alpha 16) sobre el dataset `KRadim/multilingual-text2cypher-2025`, con 210.000 muestras de entrenamiento y una sola época. El modelo base tiene 3.085.938.688 parámetros y hereda la arquitectura transformer decoder-only de la familia Qwen2.5. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

Su relevancia radica en que cubre un nicho muy específico (text-to-Cypher) con un modelo pequeño que cabe en GPUs de consumo, algo útil para integrar asistentes de consulta sobre grafos de conocimiento en aplicaciones locales o de bajo coste. No obstante, la información pública disponible es escasa: no hay benchmarks publicados ni detalles sobre la composición exacta del dataset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), ajuste fino con QLoRA |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-Coder-3B-Instruct, no confirmada en la model card) |
| Tipos de cuantización | GGUF (incluye Q4_K_M según el ejemplo de Ollama; otras variantes no confirmadas) |
| Idiomas soportados | en (inglés, según la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo); el adaptador original es PEFT/QLoRA |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen2.5-Coder-3B-Instruct`, un transformer decoder-only de 3.085.938.688 parámetros. Sobre esta base se aplicó un ajuste fino supervisado con QLoRA de rango 16 y alpha 16, utilizando las librerías Unsloth, Hugging Face TRL, PEFT y PyTorch. El entrenamiento consistió en una única época sobre 210.000 muestras del dataset `KRadim/multilingual-text2cypher-2025`, que según la model card contiene 35.000 ejemplos (la discrepancia entre ambas cifras no se explica en la documentación disponible).

La innovación principal es la especialización en un formato de prompt estructurado: el modelo espera un mensaje de sistema con el esquema de la base de datos Neo4j y un mensaje de usuario con la pregunta en lenguaje natural, y genera la consulta Cypher correspondiente. No se documentan técnicas adicionales como decodificación especulativa, atención lineal ni etapas de RLHF/DPO. El resultado se exportó a GGUF para inferencia local.

## Capacidades

- Generación de consultas Cypher para Neo4j a partir de preguntas en lenguaje natural y un esquema de base de datos proporcionado en el prompt de sistema.
- Comprensión de esquemas de grafos (nodos, relaciones, propiedades) incluidos en el contexto.
- Generación de texto general y código, heredada del modelo base Qwen2.5-Coder-3B-Instruct.
- Formato conversacional con tokens especiales de chat (`<|im_start|>` / `<|im_end|>`).
- Soporte de tool calling y function calling: no confirmado en la model card (el modelo base lo soporta, pero el ajuste no lo documenta).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este ajuste.
- Capacidades multilingües: la model card declara únicamente inglés (`language: en`), aunque el dataset se denomina "multilingual"; no se especifican los idiomas cubiertos.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Asistente de consulta sobre grafos de conocimiento: el modelo traduce preguntas de negocio ("¿qué clientes compraron productos de la categoría X?") a Cypher, inyectando el esquema de la base de datos en el prompt de sistema. Adecuado por su especialización y su tamaño reducido.
- Integración en aplicaciones de análisis de datos con Neo4j: permite a usuarios no técnicos consultar la base de datos sin conocer Cypher, actuando como capa de traducción entre una interfaz en lenguaje natural y el motor de grafos.
- Despliegue local en estaciones de trabajo: al distribuirse en GGUF Q4_K_M, puede ejecutarse con Ollama en equipos sin GPU dedicada de gama alta, lo que facilita prototipos y demos offline.
- Generación de consultas en pipelines de ETL o reporting: el modelo puede producir consultas Cypher que luego se validan y ejecutan en un job programado, reduciendo el trabajo manual de escritura de queries recurrentes.
- Herramienta educativa para aprender Cypher: dado un esquema de ejemplo, el modelo muestra la consulta equivalente a una pregunta, útil en entornos de formación sobre bases de datos de grafos.
- Chatbot de soporte interno sobre documentación estructurada en grafo: combinado con un esquema de ontología corporativa, permite responder preguntas sobre relaciones entre entidades (empleados, proyectos, dependencias).
- Prototipado rápido de agentes text-to-query: sirve como componente de traducción en un agente mayor que decide cuándo consultar la base de datos, gracias a su formato conversacional compatible con endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, un modelo de 3.085 millones de parámetros ocupa aproximadamente 2 GB de pesos; con Q8, en torno a 3,5 GB; en FP16, unos 6 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU con 6-8 GB de VRAM o más debería poder ejecutar las variantes cuantizadas.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en tarjetas con 6 GB o más de VRAM en cuantizaciones Q4/Q5; en CPU también es viable con llama.cpp.
- Opciones de despliegue: Ollama (`ollama run hf.co/KRadim/Qwen2.5-Coder-3B-text2cypher-GGUF:Q4_K_M`), llama.cpp y cualquier runtime compatible con GGUF. vLLM y TGI no están confirmados para este repo GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| KRadim/Qwen2.5-Coder-3B-text2cypher-GGUF | 3.085.938.688 | no disponible | Text-to-Cypher (Neo4j) | apache-2.0 | GGUF |
| Qwen2.5-Coder-3B-Instruct (base) | 3.085.938.688 | no disponible en esta ficha | Código general | apache-2.0 | safetensors, GGUF |
| Modelos text-to-SQL genéricos | no disponible | no disponible | Text-to-SQL | variable | variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada. La comparación se limita a parámetros, licencia y especialización.

## Limitaciones y advertencias

- La model card declara únicamente inglés como idioma soportado, pese al nombre "multilingual" del dataset; el rendimiento en otros idiomas no está verificado.
- No hay benchmarks publicados: se desconoce la precisión real en la generación de Cypher (tasa de consultas sintácticamente válidas o semánticamente correctas).
- Existe una discrepancia no explicada entre las 210.000 muestras de entrenamiento y los 35.000 ejemplos del dataset citado en la model card.
- Riesgo de alucinación: puede generar consultas Cypher con etiquetas, relaciones o propiedades que no existen en el esquema proporcionado, o sintaxis inválida; se recomienda validación y ejecución en modo de solo lectura.
- Depende críticamente de que el esquema de la base de datos se incluya correctamente en el prompt de sistema; un esquema incompleto o mal formateado degradará la calidad de las consultas.
- La longitud de contexto efectiva no está documentada en la model card; esquemas muy grandes podrían superar la ventana disponible.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se debe conservar el aviso de licencia y atribución correspondiente.
- El modelo tiene 0 likes y 490 descargas en el momento de la consulta, lo que indica una validación comunitaria muy limitada; conviene evaluarlo en el dominio propio antes de usarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KRadim/Qwen2.5-Coder-3B-text2cypher-GGUF
- README del repositorio: https://huggingface.co/KRadim/Qwen2.5-Coder-3B-text2cypher-GGUF/blob/main/README.md
- Dataset de entrenamiento: https://huggingface.co/datasets/KRadim/multilingual-text2cypher-2025
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-Coder-3B-Instruct
