# dadihemanth15/Llama-3.2-3B-MATH10K-LoRA-Step2400

## Resumen

Llama-3.2-3B-MATH10K-LoRA-Step2400 es un adaptador LoRA de rango 128 publicado por dadihemanth15 (Team G4) sobre el modelo base meta-llama/Llama-3.2-3B. No se trata de un entrenamiento nuevo: el adaptador es una copia sin modificar del LoRA originalmente entrenado por Srihari-hgf / Team G4 sobre 9.619 ejemplos del dataset MATH-10K, y lo que aporta este repositorio es un trabajo de seleccion de checkpoint sobre los 13 adaptadores guardados durante el entrenamiento.

La seleccion se realizo evaluando la loss de referencia sobre 229 preguntas de validacion de MATH-10K depuradas (se eliminaron 70 preguntas presentes en entrenamiento y un duplicado interno). El checkpoint step_002400 fue el que mantuvo la loss minima, con un valor ponderado por tokens de respuesta de 0,374039. Es relevante porque documenta de forma transparente la procedencia, los hashes y las limitaciones del proceso de seleccion, algo poco habitual en adaptadores de bajo perfil.

El modelo resuelve el problema de adaptar un LLM pequeno (3B parametros) a razonamiento matematico mediante fine-tuning eficiente en parametros, sin necesidad de reentrenar el modelo completo. El repositorio ocupa 0,3 GB y contiene unicamente los pesos del adaptador, no una copia fusionada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2) con adaptador LoRA |
| Parametros totales | 3B en el modelo base; adaptador LoRA de rango 128 (numero exacto de parametros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso secuencias de 2.048 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se entreno en BF16 sin cuantizacion) |
| Idiomas soportados | no disponible (heredados del modelo base Llama 3.2, sin confirmacion explicita) |
| Licencia | llama3.2 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las proyecciones de atencion Q, K, V y O del transformer Llama 3.2 de 3B parametros, con rango 128, alpha 256 y dropout 0. El entrenamiento original uso AdamW con LR pico de 5e-5, decaimiento lineal, 361 actualizaciones de warmup, batch 1 con acumulacion de 8, precision BF16, sin cuantizacion, limite de secuencia de 2.048 tokens y semilla 42. Se ejecutaron 3.609 actualizaciones en tres epocas sobre 9.619 ejemplos de MATH-10K; el checkpoint seleccionado (step_002400) corresponde aproximadamente a la epoca 2.

La innovacion tecnica del repositorio no esta en el entrenamiento sino en el proceso de seleccion de checkpoint: se evaluaron los 13 adaptadores guardados sobre un conjunto de validacion depurado de 229 preguntas, eliminando contaminacion con el conjunto de entrenamiento. El autor documenta explicitamente que esta limpieza retrospectiva no elimina la exposicion historica de la seleccion ni prueba independencia semantica completa respecto al pretraining. El adaptador conserva el SHA256 e6196178a27f3ed4e86c5bc2259fe1f6cd19a6d6c5ef4510595c7287496caf61 y la revision del modelo base queda fijada a 13afe5124825b4f3751f836b40dafda64c1ed062.

## Capacidades

- Generacion de texto y razonamiento matematico, orientado especificamente a problemas del tipo MATH-10K.
- Resolucion de problemas aritmeticos y algebraicos de nivel escolar y competicion, segun el dataset de entrenamiento.
- Generacion autoregresiva estandar del modelo base Llama 3.2 3B (text-generation).
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente para este adaptador.
- Capacidades multilingues: no documentadas; dependen del modelo base.
- Modo thinking, vision o audio: no disponible.
- El autor advierte que las respuestas generadas pueden ser incorrectas y que los hallazgos se limitan a los ajustes evaluados.

## Casos de uso

- Tutoria matematica automatizada: el adaptador esta afinado sobre MATH-10K, por lo que puede generar soluciones paso a paso a problemas de algebra y aritmetica en entornos educativos, siempre con supervision humana dada la tasa de error no medida.
- Generacion de datasets sinteticos de matematicas: util para producir pares pregunta-respuesta de entrenamiento que luego se filtran y validan, aprovechando el ajuste especifico al dominio.
- Prototipado de asistentes de resolucion de problemas en investigación: al ser un adaptador ligero (0,3 GB) sobre un base de 3B, permite experimentar con bajo coste de almacenamiento y despliegue.
- Evaluacion comparativa de estrategias de seleccion de checkpoint: el repositorio incluye artefactos (clean229_selection.json, release_manifest.json) que sirven como referencia reproducible para estudiar como la loss de referencia se relaciona con el rendimiento final.
- Fine-tuning incremental sobre dominio matematico: el adaptador puede servir como punto de partida (is_trainable=True) para ajustes posteriores con datos propios, dado su bajo coste computacional.
- Despliegue en entornos con recursos limitados: al combinarse con el base de 3B, puede ejecutarse en GPU de consumo para tareas de generacion de texto matematico de baja latencia, aunque no se han publicado mediciones de throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo es la loss de referencia ponderada por tokens de respuesta en el checkpoint seleccionado: 0,374039 sobre 229 preguntas de validacion depuradas. El autor indica explicitamente que esta metrica no es una medida de precision de respuestas generadas y que el repositorio no crea nuevos resultados de benchmark. Se menciona un perfil de evaluacion historico (GSM8K zero-shot con prompt "Question: ... / Answer:", generacion greedy hasta 256 tokens, y likelihood de etiquetas en ARC), pero sin cifras publicadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 3B en BF16 requiere aproximadamente 6-7 GB; en cuantizacion de 8 bits unos 3,5 GB y en 4 bits unos 2-2,5 GB (estimaciones estandar para un transformer de 3B, no publicadas por el autor).
- El adaptador LoRA en si ocupa 0,3 GB y se carga sobre el base.
- GPU recomendadas: A100, H100 o L40S para despliegue en produccion; RTX 4090, RTX 3090 o RTX 4080 para uso en consumer.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en BF16 y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers + peft (metodo documentado por el autor), vLLM y TGI previa fusion del adaptador con el base; llama.cpp y Ollama requeririan convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-3B-MATH10K-LoRA-Step2400 | 3B + LoRA r128 | no disponible (entreno a 2.048) | Adaptador matematico sobre Llama 3.2 3B | llama3.2 | Hugging Face, requiere base con acceso restringido |
| meta-llama/Llama-3.2-3B (base) | 3B | 128K segun ficha oficial de Llama 3.2 | Modelo generalista | llama3.2 | Hugging Face, acceso restringido |
| Srihari-hgf/llama_3.2_3b_math_dataset (adaptador original) | 3B + LoRA r128 | no disponible | Mismo entrenamiento, sin seleccion de checkpoint revisada | llama3.2 | Hugging Face |
| Modelos matematicos de 7B (por ejemplo, variantes fine-tuned de Mistral o Qwen) | 7B | variable | Fine-tuning matematico | variable | Hugging Face |

La comparativa con alternativas de mayor tamano no puede establecerse con datos de rendimiento porque no se han publicado benchmarks para este adaptador. La diferencia principal frente al adaptador original es la revision de seleccion de checkpoint sobre 229 preguntas depuradas, no el entrenamiento.

## Limitaciones y advertencias

- El autor advierte explicitamente que las respuestas generadas pueden ser incorrectas y que no se ha medido la precision de respuestas generadas.
- La loss de referencia de 0,374039 no equivale a calidad de respuesta; es una metrica de seleccion de checkpoint.
- La limpieza retrospectiva del conjunto de validacion no elimina la exposicion historica de la seleccion ni prueba independencia semantica o de pretraining.
- Posible contaminacion residual: aunque se eliminaron 70 preguntas presentes en entrenamiento, no se garantiza independencia completa.
- Sesgos conocidos: no documentados especificamente; hereda los sesgos del modelo base Llama 3.2 3B.
- Limitaciones de contexto e idioma: no documentadas; el entrenamiento uso secuencias de 2.048 tokens, lo que puede limitar el rendimiento en contextos mas largos aunque el base los soporte.
- Licencia llama3.2: el uso comercial esta sujeto a la politica de uso aceptable de Llama 3.2 y a los terminos de la licencia; es necesario revisar LICENSE.txt y NOTICE del repositorio.
- Requiere acceso al modelo base con gating en Hugging Face; el repositorio no incluye los pesos del base.
- El adaptador esta pensado para inferencia (is_trainable=False en el ejemplo); su uso para entrenamiento adicional requiere configuracion explicita.
- No se han publicado mediciones de latencia, throughput ni evaluaciones multilingues.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dadihemanth15/Llama-3.2-3B-MATH10K-LoRA-Step2400
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Adaptador original: https://huggingface.co/Srihari-hgf/llama_3.2_3b_math_dataset
- Politica de uso aceptable de Llama 3.2: https://www.llama.com/llama3_2/use-policy
- Documentacion de PEFT: https://huggingface.co/docs/peft
