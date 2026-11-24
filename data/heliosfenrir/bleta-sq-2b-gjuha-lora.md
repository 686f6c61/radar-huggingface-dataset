# HeliosFenrir/bleta-sq-2b-gjuha-lora

## Resumen

Bleta SQ 2B — Gjuha Shqipe LoRA es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base klei1/bleta-sq-2b, un modelo multimodal de la familia Gemma4 con torre de visión y torre de audio. El adaptador, publicado por HeliosFenrir, entrena exclusivamente la parte de lenguaje (`language_model`) y descarta las torres de visión y audio para centrarse en tutoría de texto en albanés. El objetivo declarado es la enseñanza de la asignatura Gjuha Shqipe (lengua albanesa) en secundaria, grados 6 a 12.

El modelo base es de 2B parámetros según su identificador, aunque la model card no desglosa el número exacto de parámetros totales ni activos. El adaptador se entrenó con Unsloth en una GPU T4 gratuita de Colab, con carga en 4 bits y checkpointing de gradientes, lo que lo hace reproducible en hardware de consumo. La licencia es Apache 2.0, lo que permite uso comercial con atribución.

La relevancia actual radica en su enfoque vertical: un adaptador pequeño, barato de entrenar y de desplegar, especializado en una lengua de bajos recursos como el albanés, con métricas de evaluación publicadas (perplejidad de 4,91 tras el entrenamiento frente a 7,41 antes). Es un ejemplo de ajuste eficiente para dominios educativos concretos más que un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma4ForConditionalGeneration) con adaptador LoRA sobre `language_model`; torres de visión y audio congeladas y eliminadas del adaptador publicado |
| Parametros totales | no disponible (el modelo base se identifica como 2B; el adaptador LoRA no declara recuento propio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | carga en 4 bits durante el entrenamiento (Unsloth FastModel); no se documentan otras cuantizaciones publicadas |
| Idiomas soportados | albanés (sq), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer de la familia Gemma4 con capacidades multimodales (lenguaje, visión y audio). El LoRA entrena las proyecciones de atención `q_proj`, `k_proj`, `v_proj` y `o_proj`, así como las del MLP `gate_proj`, `up_proj` y `down_proj`. Las torres de visión y audio permanecen congeladas (`requires_grad=False`) y se eliminan del adaptador publicado, de modo que el artefacto final es exclusivamente de texto y consume menos VRAM.

El entrenamiento usó el dataset klei1/bleta-sq-dataset-v1, con un pack de producción de unas 20 000 filas de instrucciones de alta calidad (semillas gold, enriquecimiento desde Hugging Face y relleno curricular estratificado) y un conjunto de evaluación reservado de unas 512 filas. La receta, ejecutada en una T4 de Colab con Unsloth, incluye carga en 4 bits, checkpointing de gradientes, empaquetado (`packing=True`), batch de 2 con acumulación de gradientes de 8, tasa de aprendizaje de 1,6e-4, dropout LoRA de 0,1 y evaluación por pasos con registro de `eval_loss`. La decodificación cualitativa empleó `repetition_penalty=1.15`.

Las métricas publicadas muestran una reducción de la pérdida de evaluación de 2,0027 a 1,5914 y de la perplejidad de 7,4092 a 4,9107. La pérdida de entrenamiento final fue de 1,4002, con un tiempo de ejecución de 682,49 segundos y un throughput de 0,563 muestras por segundo.

## Capacidades

- Generación de texto conversacional e instruccional en albanés, orientada a tutoría educativa.
- Respuesta a instrucciones de tipo SFT sobre contenidos de lengua albanesa (gramática, literatura, expresión escrita) para secundaria.
- Comprensión y generación en inglés, según los idiomas declarados.
- Capacidad de rechazo ante solicitudes de copia en exámenes o redacción completa de trabajos calificados, cuando se respeta el prompt de sistema y los ejemplos de seguridad.
- Funcionamiento exclusivamente textual: no conserva visión ni audio pese a que el modelo base sea multimodal.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo de pensamiento (thinking), audio ni visión en el adaptador publicado.

## Casos de uso

- Tutoría de lengua albanesa en secundaria: el adaptador responde a preguntas de gramática y literatura adaptadas a los grados 6 a 12, que es el uso previsto declarado por el autor.
- Generación de ejercicios y material didáctico: puede producir preguntas, ejemplos y explicaciones en albanés a partir de un temario, aprovechando el ajuste sobre el corpus curricular estratificado.
- Asistente de estudio con salvaguardas: con el prompt de sistema adecuado, rechaza redactar ensayos completos o resolver exámenes, lo que encaja en plataformas educativas que exigen integridad académica.
- Práctica de expresión escrita: corrección y sugerencias de mejora sobre textos del alumno en albanés, con explicaciones en la misma lengua.
- Despliegue en hardware modesto: al ser un LoRA sobre un base de 2B y haberse entrenado en una T4, puede servirse en GPUs de consumo para aulas o prototipos sin infraestructura dedicada.
- Investigación en lenguas de bajos recursos: sirve como referencia reproducible de ajuste eficiente (Unsloth, 4 bits, T4) para albanés, con métricas de pérdida y perplejidad publicadas.
- Traducción asistida albanés-inglés en contextos educativos: el modelo declara ambos idiomas, aunque no se documenta calidad específica de traducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas métricas publicadas son de entrenamiento y evaluación interna:

| Split | Metrica | Valor |
|---|---|---|
| eval (antes) | eval_loss / perplejidad | 2,0027 / 7,4092 |
| eval (despues) | eval_loss / perplejidad | 1,5914 / 4,9107 |
| train | train_loss | 1,4002 |
| train | runtime_s | 682,49 |
| train | samples/s | 0,563 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el entrenamiento se realizó en una T4 (16 GB) con carga en 4 bits, por lo que la inferencia en 4 bits debería caber holgadamente en GPUs de 8-16 GB.
- GPU recomendadas: T4 (validada en entrenamiento), y por tamaño del base (2B) deberían ser suficientes RTX 3060/4060 de 8 GB o superiores en cuantización de 4 bits.
- GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares; no se publican cifras exactas de VRAM.
- Opciones de despliegue: la model card documenta carga con `transformers` + `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la integración con llama.cpp requeriría conversión del adaptador a GGUF, no documentada.
- Latencia y throughput: solo se conoce el throughput de entrenamiento (0,563 muestras/s en T4); no hay datos de inferencia.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada (ni resultados de benchmarks ni alternativas de la misma categoría). Se indica "no disponible".

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| bleta-sq-2b-gjuha-lora | base 2B (adaptador LoRA) | no disponible | Apache 2.0 | Hugging Face (363 descargas) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ámbito muy restringido: está ajustado para tutoría de lengua albanesa de secundaria; su rendimiento fuera de ese dominio no está evaluado.
- Riesgo de alucinación: como todo modelo generativo pequeño, puede producir contenido factualmente incorrecto, especialmente en literatura o gramática avanzada; no se reportan evaluaciones de factualidad.
- Sesgos: no se documentan análisis de sesgos; el corpus proviene de generadores "elite" y enriquecimiento de Hugging Face, cuya composición y posibles sesgos no se detallan.
- Idiomas: solo albanés e inglés declarados; el soporte real de inglés no está cuantificado.
- Contexto: la longitud de contexto no se especifica, lo que impide garantizar conversaciones multi-turno largas.
- Salvaguardas dependientes del prompt: el rechazo de trampas y redacciones completas solo funciona "cuando se respeta el prompt de sistema y los ejemplos de seguridad"; sin ellos, la protección no está garantizada.
- Licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base klei1/bleta-sq-2b, no detallada aquí.
- Adaptador sin torres multimodales: no debe esperarse visión ni audio aunque el base los tenga.
- Métricas limitadas: solo pérdida y perplejidad internas; no hay benchmarks de calidad que respalden afirmaciones de rendimiento.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/HeliosFenrir/bleta-sq-2b-gjuha-lora
- Modelo base: https://huggingface.co/klei1/bleta-sq-2b
- Dataset: https://huggingface.co/datasets/klei1/bleta-sq-dataset-v1
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
