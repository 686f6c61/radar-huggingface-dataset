# Hastory/LunaAI-qwen3-8b-lora

## Resumen

LunaAI-qwen3-8b-lora es un adaptador LoRA desarrollado por el usuario Hastory sobre el modelo base Qwen/Qwen3-8B. No se trata de un modelo completo, sino de un conjunto de pesos PEFT (43,6 millones de parámetros entrenables, un 0,53% del total) que modifica el comportamiento del modelo base en tareas de programación. El objetivo declarado es acortar las respuestas y acercarlas a un formato de "solución directa", eliminando preámbulos largos en las respuestas a problemas de código.

El adaptador se entrenó con QLoRA (cuantización 4-bit NF4) mediante Unsloth sobre 10.000 ejemplos filtrados del dataset nvidia/OpenCodeInstruct, exigiendo que todas las pruebas unitarias se superasen y una puntuación de corrección lógica igual o superior a 4. El entrenamiento se realizó en una única GPU Kaggle T4 de 16 GB durante aproximadamente 4 horas, con una sola época y 625 pasos.

Es relevante ahora porque Qwen3-8B es una base ampliamente utilizada y este adaptador ofrece un ajuste ligero y de bajo coste para pipelines de generación de código. Sin embargo, el autor advierte explícitamente de que no mejora las capacidades generales del modelo base: solo cambia el estilo y el formato de las respuestas en tareas de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen3-8B |
| Parámetros totales | 43,6 millones entrenables en el adaptador (0,53% del base); base Qwen3-8B con 8B |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (heredada del base Qwen3-8B; no especificada en la información) |
| Tipos de cuantización | QLoRA 4-bit NF4 para entrenamiento; el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | ru, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-8B, un transformer decoder-only de 8.000 millones de parámetros. El método de ajuste es QLoRA con cuantización 4-bit NF4 y precisión de cómputo fp16, implementado con Unsloth. Los hiperparámetros son r=16, alpha=32, learning rate 2e-4, longitud de secuencia 2048, una época y 625 pasos totales. La pérdida de entrenamiento descendió de 0,7711 a 0,2308, con un mínimo de 0,1969.

Los datos provienen de nvidia/OpenCodeInstruct, con 10.000 ejemplos seleccionados mediante dos filtros: que todas las pruebas unitarias del ejemplo se superasen (average_test_score == 1.0) y que la evaluación de corrección lógica por LLM fuese igual o superior a 4. El pipeline cargó los datos mediante shards parquet de Hugging Face. No se documenta ninguna innovación arquitectónica adicional: es un ajuste supervisado (SFT) estándar sobre diálogos de un solo turno "problema → solución".

## Capacidades

- Generación de código en respuesta a enunciados de programación, con estilo conciso y orientado a la solución directa.
- Formato de respuesta corto, sin preámbulos largos, adecuado para integrarse en pipelines automatizados.
- Comprensión de ruso e inglés; las respuestas pueden mezclar ambos idiomas según advierte el autor.
- No se entrenó para tool calling ni function calling.
- No se entrenó para escenarios agénticos ni razonamiento multi-paso.
- Las capacidades generales (conocimiento, matemáticas, razonamiento complejo) se mantienen al nivel del modelo base Qwen3-8B, sin mejora.
- No dispone de visión ni audio.

## Casos de uso

- Generación de fragmentos de código en pipelines de CI/CD: el adaptador produce respuestas directas y breves, lo que reduce la latencia de generación y facilita el parseo automático de la salida en herramientas de revisión o autocompletado.
- Asistente de programación en editores: al eliminar preámbulos, encaja en interfaces donde el usuario espera el bloque de código sin explicaciones extensas, sobre el modelo base Qwen3-8B.
- Resolución de ejercicios de programación con tests: entrenado sobre ejemplos que superan pruebas unitarias, es adecuado para generar soluciones a problemas tipo benchmark de código en inglés.
- Prototipado rápido de funciones utilitarias: tareas como lectura de CSV, parsing o transformación de datos, ejemplificadas en la propia model card, donde el formato conciso es una ventaja.
- Localización de asistentes de código para usuarios rusohablantes: el adaptador entiende ruso, aunque las respuestas pueden mezclar idiomas, por lo que sirve para prototipos internos más que para producción multilingüe estricta.
- Experimentación e investigación con PEFT: al ser un adaptador ligero (0,2 GB) sobre una base conocida, es útil para estudiar el efecto del ajuste de estilo en modelos de código sin reentrenar el modelo completo.
- Fine-tuning incremental de bajo coste: sirve como referencia de pipeline QLoRA reproducible en hardware consumer (T4 de 16 GB) para equipos que quieran replicar el proceso con sus propios datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB; el requisito real lo determina el modelo base Qwen3-8B.
- Entrenamiento original: una GPU Kaggle T4 de 16 GB con QLoRA 4-bit NF4, en aproximadamente 4 horas para 625 pasos.
- Inferencia en 4-bit NF4: se estima que el conjunto base + adaptador cabe en GPUs consumer de 16 GB (RTX 4080, RTX 4090, T4), aunque esta cifra no está confirmada en la información disponible.
- En fp16, un modelo de 8B requiere del orden de 16 GB solo para pesos, por lo que se recomienda cuantización para GPUs consumer.
- Opciones de despliegue: transformers + peft + bitsandbytes (según el ejemplo de la model card). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser un adaptador PEFT, su uso con estos servidores requeriría fusión previa de pesos o soporte de adaptadores, no confirmado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hastory/LunaAI-qwen3-8b-lora | Adaptador LoRA sobre Qwen3-8B | 43,6 M entrenables (base 8B) | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3-8B | Modelo completo | 8B | no disponible en la información | no disponible en la información | Hugging Face, oficial |
| BlueLiu2004/Qwen3-8B-lora_model | Adaptador LoRA sobre Qwen3-8B (unsloth 4-bit) | no disponible | no disponible | apache-2.0 | Hugging Face |

La comparación con benchmarks no es posible: no hay resultados publicados para el adaptador ni datos de rendimiento comparables en la información disponible.

## Limitaciones y advertencias

- El autor indica explícitamente que no es "Qwen3-8B pero más inteligente": solo modifica estilo y formato en tareas de código.
- Conocimiento general, matemáticas y razonamiento complejo permanecen al nivel del modelo base, sin mejora.
- Entrenado únicamente con diálogos de un solo turno; no cubre tool calling, agentes ni razonamiento multi-paso.
- Los datos de entrenamiento están en inglés; el ruso se comprende pero las respuestas pueden mezclar idiomas.
- Riesgo de alucinación heredado del modelo base, no mitigado por el adaptador.
- Sesgos: no documentados en la información disponible.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3-8B y del dataset OpenCodeInstruct para uso en producción.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validación externa.
- No se documentan límites de contexto propios; dependen del modelo base.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Hastory/LunaAI-qwen3-8b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Adaptador comparable de otro autor: https://huggingface.co/BlueLiu2004/Qwen3-8B-lora_model
