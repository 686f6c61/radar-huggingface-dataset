# Jidnyasa-Patil/model_bluepulse

## Resumen

model_bluepulse es un adaptador PEFT (LoRA) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, desarrollado por Jidnyasa-Patil y generado mediante la API de Nugen Intelligence (empresa con sede en Mumbai y San Francisco). El adaptador se ha sometido a un proceso de "train-time alignment" sobre datos propios del propietario del modelo, con el objetivo de especializarlo en un dominio concreto. No se trata de un modelo entrenado desde cero, sino de una capa de pesos adicionales que modifica el comportamiento del modelo base sin alterar sus pesos originales.

La propuesta diferencial del proyecto es la unificación de tres tareas (generación de texto, embeddings y reranking) bajo un único identificador de modelo, junto con una puntuación de confianza en cada respuesta que señala cuándo una pregunta cae fuera del dominio alineado. Este enfoque pretende evitar que los equipos mantengan por separado un modelo generativo, un modelo de embeddings y un reranker, reduciendo la infraestructura y el mantenimiento.

El repositorio contiene únicamente los pesos del adaptador (no incluye los pesos del modelo base), y las funcionalidades de alineación en tiempo de inferencia, puntuación de confianza, embeddings y reranking se ejecutan exclusivamente a través de la API de Nugen. El modelo base Qwen2.5-1.5B-Instruct tiene 1.500 millones de parámetros y una ventana de contexto de 32.768 tokens, aunque el adaptador no documenta cambios sobre estas especificaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B-Instruct) con adaptador PEFT/LoRA |
| Parametros totales | 1.500 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Otra (base-model-licence); se aplican los terminos de Qwen/Qwen2.5-1.5B-Instruct |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de 1.500 millones de parámetros con atención causal estándar y ventana de contexto de 32.768 tokens. Sobre esta base se aplica un adaptador PEFT (probablemente LoRA, dado el tag `peft` y el tamaño del repositorio de 0,0 GB) entrenado mediante el proceso de "train-time alignment" de Nugen, que según la model card alinea las representaciones internas del modelo al dominio del propietario en una sola pasada de entrenamiento.

La model card menciona "representation engineering" y "inference-time steering" como parte del enfoque de Nugen, pero no proporciona detalles sobre el volumen de datos de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifican hiperparámetros del adaptador (rango, alpha, capas objetivo). La alineación en tiempo de inferencia, que ajusta cada respuesta y calcula la puntuación de confianza, no forma parte del repositorio: se ejecuta en la infraestructura de Nugen.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Qwen2.5-1.5B-Instruct.
- Generación de embeddings a partir del mismo modelo, servida vía API de Nugen (no disponible localmente en el adaptador).
- Reranking de documentos mediante el mismo identificador de modelo, servido vía API de Nugen.
- Puntuación de confianza por respuesta (`confidence_score`) que indica si la pregunta está fuera del dominio alineado.
- Alineación a dominio específico mediante train-time alignment sobre datos del propietario.
- Alineación en tiempo de inferencia (inference-time steering) aplicada en el servicio de Nugen.
- Soporte de tool calling y function calling: no documentado explícitamente, aunque el modelo base Qwen2.5-1.5B-Instruct lo soporta.
- Capacidades multilingües: no documentadas para el adaptador; el modelo base soporta varios idiomas, pero no se especifican cuáles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Asistente documental sobre un corpus propietario: el adaptador se alinea con los documentos de la organización, de modo que las respuestas generadas incorporan terminología y conocimiento del dominio, y la puntuación de confianza permite descartar consultas fuera de alcance antes de mostrarlas al usuario.
- Búsqueda semántica interna: usando el mismo identificador de modelo para generar embeddings de consultas y documentos, se evita mantener un modelo de embeddings separado; adecuado para bases de conocimiento de tamaño pequeño o medio donde la simplicidad operativa prima sobre el rendimiento máximo.
- Reranking en pipelines RAG: tras una recuperación inicial, el endpoint de reranking reordena los documentos candidatos según la consulta, mejorando la precisión del contexto inyectado al generador sin añadir otro modelo al stack.
- Atención al cliente especializada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 32.768 tokens (heredado del base) y la puntuación de confianza sirve como señal de escalado a un humano cuando la consulta sale del dominio entrenado.
- Clasificación y enrutamiento de consultas: la puntuación de confianza por respuesta puede usarse como heurística para decidir si una pregunta debe responderse con el modelo alineado o derivarse a un sistema generalista.
- Prototipado rápido de dominios verticales: gracias al proceso de alineación "en minutos" que ofrece Nugen, equipos con documentación propia pueden generar un adaptador desplegable sin entrenar desde cero ni gestionar infraestructura de entrenamiento.
- Evaluación comparativa de dominio: el flujo incluye benchmark y evaluación generados por modelo, útil para medir la deriva del adaptador respecto al modelo base antes de desplegar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.500 millones de parámetros requiere aproximadamente 3 GB en FP16, unos 1,5-2 GB en cuantización de 8 bits y alrededor de 1 GB en 4 bits. El adaptador añade una sobrecarga mínima (típicamente decenas de MB).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM puede ejecutar el modelo base en cuantización; para FP16 se recomienda al menos 6-8 GB (RTX 3060, RTX 4060, RTX 4090). Para despliegue en servidor, A100 o H100 no son necesarias para este tamaño, pero ofrecerían mayor throughput.
- Cabe en GPU consumer: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y GPUs integradas con suficiente memoria compartida en cuantización agresiva.
- Opciones de despliegue: el adaptador puede cargarse con PEFT sobre el modelo base usando transformers; para inferencia local, llama.cpp u Ollama requerirían convertir el modelo fusionado a GGUF. Para servir embeddings y reranking con el mismo identificador, es necesario usar la API de Nugen, ya que esas funciones no están en el adaptador.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, la cuantización y, en el caso de la API, de la infraestructura de Nugen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| model_bluepulse (este) | 1.5B (base) + adaptador | 32.768 tokens | base-model-licence (Qwen) | Adaptador en HF; servicio completo vía API Nugen | Alineación a dominio, embeddings y reranking unificados vía API |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 (según model card de Qwen) | Pesos completos en HF | Modelo base sin alineación de dominio; sin embeddings ni reranking nativos |
| Llama 3.2 1B Instruct | 1.2B | 128.000 tokens | Llama 3.2 Community License | Pesos completos en HF | Mayor contexto; requiere modelos separados para embeddings y reranking |
| Gemma 2 2B Instruct | 2.6B | 8.192 tokens | Gemma Terms of Use | Pesos completos en HF | Mayor tamaño; contexto menor; sin unificación de tareas |

## Limitaciones y advertencias

- El repositorio contiene solo el adaptador; los pesos del modelo base deben obtenerse por separado desde Qwen/Qwen2.5-1.5B-Instruct.
- Las funciones de embeddings, reranking, puntuación de confianza y alineación en tiempo de inferencia solo están disponibles a través de la API de Nugen, lo que introduce dependencia de un proveedor externo y de una clave de API.
- No se documentan los datos de entrenamiento del adaptador, su volumen ni su composición, lo que impide evaluar sesgos heredados o inducidos por la alineación.
- El dominio de alineación no se especifica en la model card; el adaptador está pensado para el dominio del propietario que lo generó, por lo que su utilidad fuera de ese dominio es limitada.
- No se especifican los idiomas soportados por el adaptador; el modelo base Qwen2.5 soporta varios, pero la alineación puede haber reducido el rendimiento en idiomas no representados en los datos de alineación.
- Riesgo de alucinación: inherente a los modelos de 1.500 millones de parámetros; la puntuación de confianza mitiga parcialmente el problema, pero no lo elimina.
- Restricciones de licencia: la licencia "base-model-licence" remite a los términos de Qwen/Qwen2.5-1.5B-Instruct; es responsabilidad del usuario revisar dichos términos antes de uso comercial.
- El tamaño del repositorio (0,0 GB) y la ausencia de documentación sobre el adaptador (rango, capas, hiperparámetros) dificultan la reproducibilidad y la auditoría técnica.
- No se han publicado benchmarks ni evaluaciones independientes; las afirmaciones de la model card sobre calidad y alineación no están verificadas externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jidnyasa-Patil/model_bluepulse
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documentación de Nugen: https://docs.nugen.in
- Plataforma y claves de API: https://platform.nugen.in
- Registro en Nugen: https://nugen.in/signup
- Sitio de Nugen Intelligence: https://nugen.in
- Contacto enterprise: support@nugen.in
