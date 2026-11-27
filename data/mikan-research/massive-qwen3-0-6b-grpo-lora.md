# mikan-research/massive-qwen3-0.6b-grpo-lora

## Resumen

`mikan-research/massive-qwen3-0.6b-grpo-lora` es un adaptador LoRA sobre el modelo base `Qwen/Qwen3-0.6B` especializado en una única tarea de parsing semántico: convertir una petición de asistente de voz en un frame JSON con la forma `{"intent": ..., "slots": [{"type": ..., "value": ...}]}`, cubriendo 60 intenciones y 55 tipos de slot del conjunto de datos MASSIVE (Amazon) para la variante en-US. Lo desarrolla mikan-research como parte de su pipeline Mikan, cuyo objetivo es destilar el comportamiento de un modelo grande en una tarea estrecha hacia un modelo pequeño y verificar no inferioridad con un margen pre-registrado.

El adaptador se entrena en dos fases: primero SFT sobre 11.255 frames generados por un profesor (`Qwen3-30B-A3B-Instruct-2507` cuantizado a 4 bits GPTQ con 8 ejemplos recuperados), y después GRPO continuando el mismo adaptador, usando el frame del profesor como referencia de recompensa. El resultado reportado es un 64,8 % de coincidencia exacta de frame frente al 64,4 % del profesor, con un intervalo de confianza bootstrap pareado al 95 % de [-2,1, 1,2] puntos y un PASS en el margen de no inferioridad de 3 puntos.

Su relevancia es metodológica más que de rendimiento bruto: demuestra que un modelo de 0,6 mil millones de parámetros, con un adaptador LoRA entrenado sobre 11.255 ejemplos y reforzado con GRPO en una sola Tesla T4, puede igualar estadísticamente a un profesor de 30B en una tarea de estructuración cerrada. No es un modelo de propósito general: es un componente de extracción de intenciones y slots para pipelines de asistentes de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-0.6B) con adaptador LoRA (PEFT) |
| Parametros totales | 0,6 mil millones (modelo base); parametros del adaptador LoRA no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-0.6B) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y se aplica sobre el base con `torch_dtype="auto"` |
| Idiomas soportados | no disponible formalmente; entrenado sobre la variante en-US de MASSIVE |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen3-0.6B`, un transformer decoder-only de 0,6 mil millones de parámetros. La innovación no está en la arquitectura del base, sino en el esquema de entrenamiento en dos etapas sobre una tarea cerrada de parsing semántico. La primera fase es SFT con LoRA sobre 11.255 frames generados por el profesor, 3 épocas y learning rate 0,0002. La segunda fase es GRPO continuando el mismo adaptador: 250 pasos, 8 muestras por prompt, 4 prompts por paso, 3.000 prompts en total, learning rate 5e-06, temperatura 1,0 y beta 0 (sin término KL). La recompensa contra el frame del profesor es 0 si el frame es inválido y, en caso contrario, `0,1 + 0,3 × coincidencia de intención + 0,6 × F1 de slots × groundedness`. El checkpoint final se selecciona por coincidencia exacta en validación, resultando el paso 200. El entrenamiento se ejecutó con Unsloth 2026.11.12 y TRL 1.19.0 sobre una única Tesla T4.

El dataset de entrenamiento es MASSIVE (Amazon, CC-BY-4.0; FitzGerald et al., 2022), un corpus de 1 millón de ejemplos en 51 idiomas para comprensión del lenguaje natural. El autor publica además `mikan-research/massive-distill`, presumiblemente con los frames destilados del profesor. El prompt de inferencia es un mensaje de sistema corto sin listas de intenciones ni slots, y el modo thinking de Qwen3 se desactiva explícitamente (`enable_thinking=False`).

## Capacidades

- Parsing semántico de peticiones de asistente de voz a frames JSON con intención y slots.
- Cobertura de 60 intenciones y 55 tipos de slot del esquema MASSIVE en-US.
- Generación de JSON estructurado con alta validez (99,6 % de frames válidos en el test split).
- Modo thinking desactivado por diseño; no se recomienda activarlo para esta tarea.
- No soporta tool calling, agentes, visión ni audio de forma nativa más allá de lo que herede del base Qwen3-0.6B.
- Capacidades multilingües: no evaluadas; el adaptador está entrenado solo sobre en-US.
- Integración con `peft` y `transformers` mediante `PeftModel.from_pretrained`.

## Casos de uso

- Extracción de intenciones en asistentes de voz: el adaptador convierte la transcripción del usuario en un frame `{"intent": ..., "slots": [...]}` que un motor de diálogo puede consumir directamente. Es adecuado porque el esquema es cerrado y el modelo está entrenado específicamente para producirlo.
- Enrutamiento de comandos en dispositivos de bajo consumo: al ser un adaptador sobre un base de 0,6B, puede ejecutarse en hardware modesto (el entrenamiento cupo en una T4) y sustituir a un modelo grande en la fase de parsing.
- Preprocesado en pipelines RAG o de agentes: el frame JSON generado puede alimentar un router que seleccione herramientas o fuentes de datos según la intención detectada.
- Etiquetado automático de corpus de voz: usar el adaptador para generar frames sobre transcripciones nuevas y revisar solo los casos de baja confianza, dado el 64,8 % de coincidencia exacta reportado.
- Benchmark de destilación: servir como referencia reproducible para comparar técnicas de destilación y GRPO en tareas de estructuración con esquema fijo.
- Despliegue en entornos con restricciones de licencia: la licencia apache-2.0 permite uso comercial sin las restricciones de modelos con licencias custom.
- Prototipado rápido de asistentes verticales: adaptar el mismo esquema de entrenamiento a un dominio concreto (por ejemplo, domótica o reservas) reutilizando el pipeline Mikan.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el test split de MASSIVE en-US (2.974 ítems, frames de referencia ground-truth):

| Modelo | Coincidencia exacta de frame |
|---|---|
| Este adaptador (Qwen3-0.6B + LoRA + GRPO) | 64,8 % |
| Profesor (Qwen3-30B-A3B-Instruct-2507, 4-bit GPTQ, 8 ejemplos recuperados) | 64,4 % |
| Diferencia (profesor - estudiante) | -0,4 puntos; IC 95 % bootstrap pareado [-2,1, 1,2] |

Margen de no inferioridad pre-registrado: 3 puntos. Resultado: PASS. Frames válidos: 99,6 %; el resto usa una intención o tipo de slot fuera del esquema, que la decodificación restringida elimina. La coincidencia exacta exige que la intención y todos los pares (tipo de slot, valor) coincidan con el gold.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un base de 0,6B en fp16 requiere aproximadamente 1,2 GB de pesos, más overhead de activaciones y del adaptador LoRA.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; el entrenamiento se realizó en una Tesla T4, lo que indica que la inferencia cabe holgadamente en GPUs consumer.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no confirmado por el autor.
- Opciones de despliegue: `transformers` + `peft` (documentado); vLLM, llama.cpp, Ollama y TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en MASSIVE en-US | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| massive-qwen3-0.6b-grpo-lora | 0,6B + LoRA | no disponible | 64,8 % exact match | apache-2.0 | Hugging Face |
| Qwen3-30B-A3B-Instruct-2507 (profesor) | 30B (MoE) | no disponible | 64,4 % exact match | no disponible en esta ficha | Hugging Face |
| Qwen3-0.6B (base sin adaptador) | 0,6B | no disponible | no disponible | apache-2.0 | Hugging Face |

La comparación relevante es con el profesor: el adaptador iguala estadísticamente su rendimiento en esta tarea concreta con dos órdenes de magnitud menos de parámetros. Frente al base sin adaptador no hay resultados publicados en la información disponible.

## Limitaciones y advertencias

- Especialización extrema: solo produce frames del esquema MASSIVE en-US (60 intenciones, 55 slots); fuera de ese dominio su salida no es fiable.
- Solo entrenado y evaluado en inglés en-US; no hay evidencia de comportamiento en otros idiomas.
- El 64,8 % de coincidencia exacta implica que aproximadamente uno de cada tres frames no coincide exactamente con el gold; en producción conviene añadir validación de esquema y decodificación restringida.
- El resto de frames inválidos (0,4 %) usan intenciones o tipos de slot fuera del esquema; sin decodificación restringida ese porcentaje puede crecer.
- Riesgo de alucinación de valores de slot no presentes en la entrada; la recompensa incluye un término de groundedness, pero no elimina el problema.
- Sesgos: no documentados por el autor; hereda los del modelo base y los del corpus MASSIVE.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3-0.6B y del dataset MASSIVE (CC-BY-4.0, requiere atribución).
- El adaptador requiere cargar el base Qwen3-0.6B por separado; no es un modelo autónomo.
- Sin datos de latencia ni throughput publicados; el rendimiento en producción debe medirse en el hardware objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/mikan-research/massive-qwen3-0.6b-grpo-lora
- Repositorio del pipeline Mikan: https://github.com/mikan-research/mikan
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Dataset MASSIVE: https://huggingface.co/datasets/AmazonScience/massive
- Dataset de destilación: https://huggingface.co/datasets/mikan-research/massive-distill
- Paper MASSIVE (FitzGerald et al., 2022): no disponible en la información proporcionada
- Unsloth: no disponible enlace en la información proporcionada
- TRL: no disponible enlace en la información proporcionada
