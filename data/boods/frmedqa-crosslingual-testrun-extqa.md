# boods/FrMedQA-CrossLingual-TestRun-ExtQA

## Resumen

FrMedQA-CrossLingual-TestRun-ExtQA es un modelo de generación de texto publicado en HuggingFace por el usuario boods, obtenido mediante ajuste fino (fine-tuning) supervisado del modelo base unsloth/Qwen3-14B-unsloth-bnb-4bit, que a su vez es una versión cuantizada a 4 bits de Qwen3-14B. El repositorio se creó el 18 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", por lo que se trata de un experimento de ajuste fino sin validación pública ni adopción por parte de la comunidad.

La model card es mínima: solo indica el autor, la licencia Apache 2.0, el modelo base y que el entrenamiento se realizó con Unsloth, con una aceleración declarada de 2x respecto a un pipeline estándar. No se documentan datos de entrenamiento, hiperparámetros, composición del dataset ni métricas de evaluación. El nombre del repositorio sugiere un ajuste orientado a preguntas y respuestas médicas en francés con evaluación cross-lingual ("FrMedQA-CrossLingual-TestRun-ExtQA"), pero esto es una inferencia a partir del identificador y no una afirmación respaldada por la documentación disponible.

Su relevancia práctica es limitada en su estado actual: al carecer de model card detallada, de benchmarks y de cualquier historial de uso, debe tratarse como un artefacto experimental. Sirve, eso sí, como ejemplo de flujo de trabajo de ajuste fino con Unsloth sobre Qwen3-14B en cuantización de 4 bits, y como punto de partida para quien quiera reproducir o auditar el proceso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-14B); no confirmada explícitamente en la model card |
| Parámetros totales | 14 800 millones (heredados del modelo base Qwen3-14B; no documentado en el repositorio del ajuste) |
| Parámetros activos | No aplica (el modelo base Qwen3-14B es denso, no MoE) |
| Longitud de contexto | 32 768 tokens nativos en el modelo base Qwen3-14B, ampliables a 131 072 con YaRN según la documentación pública de Qwen3; no verificado para este ajuste |
| Tipos de cuantización | El modelo base está cuantizado a 4 bits (bnb-4bit); el repositorio no especifica cuantizaciones propias. Tamaño del repo: 0,5 GB |
| Idiomas soportados | Inglés (etiqueta `language: en` en la model card); el nombre sugiere contenido en francés, no confirmado |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (etiqueta del repositorio). El tamaño de 0,5 GB indica que probablemente se trate de adaptadores LoRA en lugar de pesos completos fusionados, aunque no se explicita |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-14B, un transformer denso con atención de consultas agrupadas (GQA) y modo de razonamiento híbrido (pensamiento explícito activable o desactivable). Sobre esa base, el autor aplicó un ajuste fino supervisado (SFT) utilizando Unsloth, una librería que optimiza el entrenamiento de modelos grandes mediante kernels propios y reducción del uso de memoria. La model card menciona únicamente que el entrenamiento fue "2x más rápido" con Unsloth, sin detallar el número de tokens, la composición del dataset, la duración del entrenamiento ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

No hay información sobre la innovación técnica específica de este ajuste más allá del uso de Unsloth y de TRL (etiqueta `trl`), ni sobre si se empleó LoRA/QLoRA o un ajuste completo. Dado que el modelo base ya está cuantizado a 4 bits (bnb-4bit), lo más probable es que se haya entrenado con QLoRA sobre esa base, pero es una deducción a partir de las etiquetas y no un dato documentado. Tampoco se especifica si los pesos publicados son adaptadores o pesos fusionados.

## Capacidades

- Generación de texto autoregresiva, heredada del modelo base Qwen3-14B.
- Razonamiento multi-paso en modo "thinking" (capacidad del modelo base Qwen3; no verificada tras el ajuste).
- Generación de código y resolución de problemas matemáticos (capacidad del modelo base Qwen3; no verificada tras el ajuste).
- Soporte multilingüe del modelo base (Qwen3 cubre más de 100 idiomas), aunque la model card de este ajuste declara únicamente inglés.
- Posible especialización en preguntas y respuestas médicas, inferida únicamente del nombre del repositorio; no hay evidencia documental.
- Tool calling y function calling: no disponible en la información proporcionada para este ajuste concreto.
- Capacidades de agente, visión o audio: no disponibles.
- Capacidad cross-lingual: sugerida por el nombre del repositorio, no documentada.

## Casos de uso

- Evaluación de pipelines de ajuste fino: el repositorio sirve como artefacto de referencia para comparar el resultado de un SFT con Unsloth sobre Qwen3-14B cuantizado a 4 bits frente a alternativas como Axolotl o TRL puro.
- Reproducción de experimentos de QLoRA: dado que el modelo base es una versión bnb-4bit, es un caso adecuado para estudiar el comportamiento de adaptadores de bajo rango sobre pesos ya cuantizados.
- Base para prototipos de QA médico en francés: si el nombre del repositorio refleja el dataset empleado, podría reutilizarse como punto de partida para tareas de question answering sobre textos clínicos, siempre tras una validación exhaustiva y con supervisión profesional.
- Investigación sobre degradación por cuantización: permite estudiar cómo se comporta un ajuste realizado sobre un modelo base de 4 bits en tareas de dominio específico.
- Docencia y formación: útil como ejemplo didáctico de un flujo completo de publicación de un modelo ajustado en el Hub, con licencia permisiva y pesos en safetensors.
- Pruebas de integración con text-generation-inference: la etiqueta `text-generation-inference` indica compatibilidad declarada con ese servidor de inferencia, útil para validar despliegues en entornos controlados.
- Auditoría de artefactos sin documentación: caso de estudio sobre por qué una model card incompleta impide la adopción en producción y qué información mínima debería exigirse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K, MedQA ni de ninguna otra evaluación, y el repositorio no referencia ningún informe técnico asociado.

## Requisitos de hardware

- VRAM para pesos completos en bf16: aproximadamente 30 GB para 14,8 mil millones de parámetros, más overhead de activaciones y caché KV.
- VRAM para cuantización de 4 bits: en torno a 9-10 GB de pesos, más overhead; una GPU de 16 GB puede ser suficiente con contexto moderado.
- Repositorio publicado: con 0,5 GB de tamaño, si se trata de adaptadores LoRA, la inferencia requiere descargar además el modelo base indicado.
- GPU recomendadas para 4 bits: RTX 4090 (24 GB), RTX 3090 (24 GB), L4 (24 GB), A10G (24 GB). Para bf16 completo: A100 40/80 GB, H100 80 GB.
- GPU de consumo: sí, cabe en tarjetas con 16 GB o más en cuantización de 4 bits; en 8 GB sería necesario reducir contexto o aplicar cuantizaciones más agresivas (Q3/Q2), con pérdida de calidad.
- Opciones de despliegue: text-generation-inference (etiqueta declarada), transformers, vLLM, llama.cpp y Ollama si se generan pesos GGUF a partir del modelo fusionado. No se confirma conversión a GGUF en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este ajuste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| boods/FrMedQA-CrossLingual-TestRun-ExtQA | 14,8 B (base) | No disponible para el ajuste; 32 K nativos en el base | Apache 2.0 | HuggingFace, 0 descargas | Sin benchmarks publicados |
| Qwen3-14B (modelo base sin ajustar) | 14,8 B | 32 768 nativos, 131 072 con YaRN | Apache 2.0 | HuggingFace y ecosistema amplio | Benchmarks publicados por el equipo de Qwen |
| Qwen3-8B | 8,2 B | 32 768 nativos, 131 072 con YaRN | Apache 2.0 | HuggingFace | Benchmarks publicados por el equipo de Qwen |
| Qwen2.5-14B-Instruct | 14,7 B | 32 768 nativos, 131 072 con YaRN | Apache 2.0 (salvo excepciones por tamaño) | HuggingFace | Benchmarks publicados por el equipo de Qwen |

La comparación directa con alternativas ajustadas para QA médico no es posible con la información disponible: no se conocen los datos de entrenamiento ni las métricas de este repositorio.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evidencia cuantitativa de que el ajuste mejore al modelo base en la tarea objetivo.
- Model card incompleta: no se documentan dataset, hiperparámetros, número de tokens de entrenamiento ni metodología de evaluación.
- Riesgo de alucinación: inherente a los modelos de la familia Qwen3; si el ajuste está orientado a dominio médico, el riesgo es especialmente crítico y exige validación humana.
- Dominio médico: cualquier uso clínico real requiere supervisión profesional, validación regulatoria y trazabilidad de los datos; este repositorio no ofrece ninguna de esas garantías.
- Idioma: la model card declara únicamente inglés, mientras que el nombre del repositorio sugiere contenido en francés. Esta discrepancia no está resuelta y afecta a la previsión de comportamiento multilingüe.
- Sesgos: no evaluados ni documentados. Los sesgos del modelo base se heredan y pueden amplificarse con un ajuste sobre un dataset no descrito.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad sobre el comportamiento del modelo.
- Repositorio sin mantenimiento aparente: 0 descargas y 0 "likes" indican que no ha sido validado por terceros.
- Fecha de creación atípica (2026-09-18) en los metadatos del Hub: conviene verificar la procedencia antes de integrarlo en cualquier flujo.
- Producción: no se recomienda su uso en sistemas productivos sin una evaluación propia y sin confirmar si los pesos son adaptadores o un modelo fusionado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boods/FrMedQA-CrossLingual-TestRun-ExtQA
- Modelo base en HuggingFace: https://huggingface.co/unsloth/Qwen3-14B-unsloth-bnb-4bit
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a contenidos sin relación (foros sobre software de audio), por lo que se han descartado.
