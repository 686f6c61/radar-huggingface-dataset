# Kartikey1999/medical-qa-lora

## Resumen

El modelo presentado es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Kartikey1999, que se basa en Qwen2.5-1.5B-Instruct. El objetivo es adaptar este modelo de 1.500 millones de parámetros a un dominio médico educativo mediante aprendizaje supervisado (SFT) y cuantización 4-bit, entrenando únicamente un pequeño subconjunto de parámetros. El resultado es un adaptador PEFT, no un modelo completo, que hereda la arquitectura transformer decoder-only del modelo base.

La relevancia de este proyecto radica en su carácter experimental: demuestra cómo aplicar técnicas de fine-tuning eficientes en parámetros (PEFT) y cuantización de 4 bits sobre un LLM relativamente pequeño para un dominio específico, usando un conjunto de datos muy reducido. No está pensado para uso clínico, sino como ejemplo educativo para investigar el comportamiento de LoRA y SFT en tareas de preguntas y respuestas médicas con datos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen2.5-1.5B-Instruct (transformer decoder-only) |
| Parametros totales | no disponible (el modelo base tiene 1.500 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | No disponible (el entrenamiento usó 4-bit quantization mediante BitsAndBytes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen2.5-1.5B-Instruct, una arquitectura transformer decoder-only con capacidades de instrucción. LoRA reduce el número de parámetros entrenables mediante matrices de bajo rango, lo que permite realizar fine-tuning con un coste de memoria reducido. El entrenamiento se realizó con supervisión (SFT) utilizando 49 muestras de entrenamiento y 6 de validación, extraídas de material educativo médico. Se empleó cuantización de 4 bits (BitsAndBytes) para reducir aún más el consumo de VRAM. No se describe ninguna innovación técnica más allá de la combinación de PEFT, LoRA y 4-bit quantization.

## Capacidades

- Generación de texto conversacional mediante el pipeline `text-generation` de Hugging Face Transformers.
- Respuesta a preguntas basadas en el material médico educativo utilizado durante el fine-tuning, aunque con un rendimiento limitado.
- Soporte de *tool calling*: no disponible. El modelo base Qwen2.5-1.5B-Instruct lo soporta nativamente, pero el adaptador no ha sido evaluado para ello.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible. No se ha verificado el comportamiento del adaptador fuera del inglés.
- Capacidades de visión o audio: no disponible. El modelo es solo de texto.

## Casos de uso

- Experimentación educativa con LoRA y SFT: profesores e investigadores pueden reproducir el pipeline completo (carga del modelo base, cuantización 4-bit, entrenamiento LoRA y evaluación) como ejemplo práctico de adaptación eficiente en parámetros.
- Prototipado de sistemas de preguntas y respuestas médicas en entornos académicos: dado el entrenamiento sobre material educativo, el adaptador puede responder preguntas factuales sencillas relacionadas con ese material, pero siempre en un entorno controlado y sin valor clínico.
- Comparación de técnicas de fine-tuning: sirve como caso de estudio para contrastar el rendimiento de LoRA frente a un fine-tuning completo, especialmente en escenarios con pocos datos y presupuesto de cómputo limitado.
- Análisis del impacto del tamaño del dataset en la adaptación de dominio: con solo 49 muestras, es un ejemplo práctico para estudiar overfitting y la relación entre volumen de datos y calidad de la adaptación.
- Evaluación de métricas de entrenamiento en dominios especializados: permite observar la pérdida de entrenamiento y validación, la token accuracy media y la entropía de evaluación, como base para comparar estrategias de fine-tuning en el dominio médico.
- Integración en pipelines de prueba para texto médico educativo: el adaptador puede cargarse con `transformers` y `peft` para generar respuestas de muestra en un flujo de pruebas automatizadas, antes de decidir si merece la pena escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Las únicas métricas reportadas son las de evaluación durante el fine-tuning, que aparecen en la model card.

| Metrica | Valor |
|---|---|
| Training loss | 2,1675 |
| Validation loss | 2,0194 |
| Mean token accuracy | 0,5213 |
| Evaluation entropy | 2,0662 |

La token accuracy media de 0,5213 indica un rendimiento limitado, coherente con el tamaño extremadamente pequeño del dataset de entrenamiento.

## Requisitos de hardware

- VRAM estimada: no disponible en la documentación. Al ser un adaptador sobre un modelo base de 1.500 millones de parámetros, la inferencia puede realizarse con menos de 4 GB de VRAM si se aplica cuantización 4-bit, pero no está especificado.
- GPU recomendadas: una RTX 3060 de 8 GB es suficiente; también es viable en RTX 4090 o GPUs de gama alta. Recursos más potentes como A100 o H100 son sobredimensionados para este adaptador.
- Compatibilidad con GPU de consumo: sí, cualquier tarjeta con 8 GB de VRAM o superior puede cargar el modelo base cuantizado y el adaptador.
- Opciones de despliegue: se puede cargar directamente con `transformers` y `peft` en Python. Para integrarlo en frameworks como vLLM, TGI o llama.cpp, es necesario fusionar previamente el adaptador con el modelo base y exportarlo en un formato compatible (por ejemplo, GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Se ha encontrado en la búsqueda web un modelo similar, `Adilbai/medical-qa-t5-lora`, que también aplica LoRA sobre un modelo base distinto para la misma tarea de QA médica. No existen benchmarks comparativos publicados que permitan una evaluación cuantitativa directa.

| Modelo | Modelo base | Parámetros del base | Longitud de contexto | Licencia |
|---|---|---|---|---|
| Kartikey1999/medical-qa-lora | Qwen2.5-1.5B-Instruct | 1.500 millones | no disponible | no disponible |
| Adilbai/medical-qa-t5-lora | Google T5 | ~220 millones | no disponible | no disponible |

Ambos son adaptadores LoRA para QA médica. El de Kartikey1999 usa un modelo decoder-only más grande (1.5B), mientras que el de Adilbai se basa en T5, un encoder-decoder de menor tamaño. Esta diferencia puede influir en la capacidad de generación y en los requisitos de hardware.

## Limitaciones y advertencias

- El dataset de entrenamiento es extremadamente pequeño (49 muestras), lo que provoca una capacidad de generalización muy baja y un alto riesgo de sobreajuste a los ejemplos vistos.
- La métrica de token accuracy media (0,5213) refleja una calidad de generación limitada incluso sobre el propio material de entrenamiento.
- El modelo no debe utilizarse como sustituto de consejo, diagnóstico o tratamiento médico profesional, tal como indica el propio autor en la model card.
- La licencia no está especificada, por lo que el uso comercial o la redistribución pueden estar sujetos a restricciones desconocidas.
- No se han realizado evaluaciones de sesgos, alucinaciones o seguridad. Es probable que el modelo genere respuestas incorrectas o inventadas en temas médicos fuera de su entrenamiento.
- El adaptador solo funciona correctamente si se combina con el modelo base Qwen2.5-1.5B-Instruct; no es un modelo autónomo.
- No hay soporte multimodal y no se ha verificado el rendimiento en idiomas distintos del inglés.

## Enlaces

- https://huggingface.co/Kartikey1999/medical-qa-lora
- https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- https://huggingface.co/Adilbai/medical-qa-t5-lora
