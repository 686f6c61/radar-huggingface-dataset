# mradermacher/QwQ-Tool_on_Reasoning-GGUF

## Resumen

QwQ-Tool_on_Reasoning-GGUF es la versión cuantizada en formato GGUF del modelo FluxiIA/QwQ-Tool_on_Reasoning, publicada por mradermacher. Se trata de un modelo de lenguaje de aproximadamente 32.700 millones de parámetros (32,76 B) construido sobre la arquitectura Qwen2 (según las etiquetas del repositorio), orientado a tareas de razonamiento y uso de herramientas. El autor original lo ha entrenado con técnicas de SFT y TRL sobre una base de tipo QwQ, lo que sugiere un enfoque en razonamiento paso a paso y tool calling.

La relevancia de esta ficha radica en que ofrece los pesos en múltiples niveles de cuantización (desde Q2_K hasta Q8_0), lo que permite desplegar un modelo de 32 B en hardware de consumo con compromisos controlados de calidad. El repositorio tiene un tamaño de 224 GB e incluye 11 variantes de cuantización estáticas.

La información disponible es limitada: la model card del repositorio cuantizado es fundamentalmente logística (listado de cuants y notas de uso de GGUF) y no detalla la composición del dataset, el número de tokens de entrenamiento ni resultados de benchmarks. Esta ficha refleja exclusivamente lo que consta en la información proporcionada, marcando como "no disponible" todo aquello que no se ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen2 (según tags del repositorio); detalles de atención y capas no disponibles |
| Parametros totales | 32.763.876.352 (32,76 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se distribuye en formato Hugging Face/transformers |

## Arquitectura y entrenamiento

El modelo base FluxiIA/QwQ-Tool_on_Reasoning se etiqueta como `qwen2`, lo que indica que emplea la arquitectura transformer de la familia Qwen2. Las etiquetas `unsloth`, `trl` y `sft` en el repositorio apuntan a un proceso de ajuste supervisado (SFT) realizado con las librerías Unsloth y TRL, probablemente partiendo de un modelo QwQ preentrenado. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO.

La contribución técnica de esta ficha concreta es la cuantización: mradermacher ha generado cuantizaciones estáticas (sin imatrix, según indica la propia model card) en 11 niveles, desde Q2_K (12,4 GB) hasta Q8_0 (34,9 GB). No se documentan innovaciones arquitectónicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: el nombre del modelo y su base QwQ sugieren capacidad de razonamiento paso a paso, aunque no se documentan detalles en la información disponible.
- Uso de herramientas (tool calling / function calling): indicado explícitamente en el nombre del modelo.
- Conversación multi-turno: el repositorio incluye la etiqueta `conversational`.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible`, lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de razonamiento con herramientas: el modelo puede integrarse en agentes que necesiten encadenar llamadas a funciones (APIs, consultas a bases de datos) con razonamiento intermedio, gracias a su orientación explícita a tool calling.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M (20,0 GB) permite ejecutar un modelo de 32 B en GPUs con 24 GB de VRAM, como la RTX 4090, usando llama.cpp u Ollama.
- Prototipado de pipelines de agentes en local: la versión Q4_K_S (18,9 GB) está marcada como "fast, recommended" por el autor de la cuantización, adecuada para iterar rápidamente en desarrollo.
- Servicios de inferencia con requisitos de calidad alta: la variante Q8_0 (34,9 GB) o Q6_K (27,0 GB) permiten desplegar el modelo en servidores con GPUs profesionales (A100 40 GB, H100) minimizando la pérdida de calidad respecto al modelo original.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 niveles, lo que facilita estudios de degradación de calidad frente a tamaño en tareas de razonamiento.
- Chat conversacional en inglés: uso como asistente de texto en inglés con contexto multi-turno, aunque la longitud de contexto no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño del archivo GGUF):
  - Q2_K: ~12,4 GB
  - Q3_K_M: ~16,0 GB
  - IQ4_XS: ~18,0 GB
  - Q4_K_M: ~20,0 GB (recomendado por el autor)
  - Q5_K_M: ~23,4 GB
  - Q6_K: ~27,0 GB
  - Q8_0: ~34,9 GB
- GPU recomendadas:
  - Consumer: RTX 4090 (24 GB) para Q4_K_M y Q5_K_S; RTX 3090 (24 GB) para las mismas variantes.
  - Profesionales: A100 40 GB u H100 para Q6_K y Q8_0.
- ¿Cabe en GPU de consumo? Sí, las variantes Q4 y Q5 caben en GPUs de 24 GB; las variantes Q2 y Q3 caben en GPUs de 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio también incluye la etiqueta `text-generation-inference` para el modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado únicamente para inglés; el rendimiento en castellano no está garantizado.
- Contexto: se desconoce la longitud máxima de contexto, lo que impide planificar despliegues con ventanas largas.
- Cuantizaciones estáticas: la model card indica que no hay cuantizaciones con imatrix disponibles, lo que puede implicar una pérdida de calidad algo mayor en los niveles bajos (Q2, Q3) frente a alternativas con imatrix.
- Falta de benchmarks: no hay evidencia publicada de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K), lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base FluxiIA/QwQ-Tool_on_Reasoning y de los modelos Qwen2 subyacentes.
- Modelo derivado: al ser una cuantización de un modelo de terceros, la responsabilidad sobre sesgos y comportamiento recae en el modelo base, del que no se detallan datos de entrenamiento.

## Enlaces

- Repositorio Hugging Face (cuantizado): https://huggingface.co/mradermacher/QwQ-Tool_on_Reasoning-GGUF
- Modelo base: https://huggingface.co/FluxiIA/QwQ-Tool_on_Reasoning
- Página de descargas del autor: https://hf.tst.eu/model#QwQ-Tool_on_Reasoning-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
