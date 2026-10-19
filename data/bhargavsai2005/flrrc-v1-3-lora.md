# bhargavsai2005/flrrc-v1.3-lora

## Resumen

FLRRC v1.3 LoRA es un adaptador PEFT de bajo rango (LoRA) publicado por el usuario bhargavsai2005 sobre el modelo base TinyLlama/TinyLlama-1.1B-Chat-v1.0. Su propósito declarado es actuar como asistente de decisión sobre la asistencia a clase («college attendance decision assistant») en una mezcla de telugu e inglés, tomando como entrada perfiles con atributos de asistencia, energía y salud, y devolviendo una recomendación orientativa. No es un modelo de propósito general: es un ajuste vertical muy acotado, entrenado con 100 muestras en formato ChatML.

El interés técnico del artefacto no está en su rendimiento, sino en su naturaleza de ejemplo mínimo reproducible de QLoRA aplicado a un dominio concreto y a un par de idiomas de bajos recursos (inglés y telugu). Se apoya en un transformer decoder-only de 1.100 millones de parámetros con 2.048 tokens de contexto, por lo que el coste de inferencia es bajo y puede ejecutarse en hardware de consumo o incluso en CPU.

En el momento de la consulta el repositorio no registra descargas ni «likes», no declara licencia y no publica pipeline, evaluación ni benchmarks. La model card incluye un aviso explícito de que se trata de una «Decision Support Tool» y de que la decisión final corresponde al usuario, lo que conviene tener muy presente dado que el dominio tratado (salud, energía, asistencia) es sensible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only tipo Llama 2 (TinyLlama-1.1B-Chat) |
| Parámetros totales | Modelo fusionado: 1,1 B (según ficha de TinyLlama-1.1B-Chat); adaptador LoRA: no disponible (r=8, alpha=16) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2.048 tokens (heredada del modelo base) |
| Tipos de cuantización | Entrenamiento QLoRA en 4-bit nf4; inferencia en float16 tras `merge_and_unload`; no se publican pesos GGUF ni cuantizaciones del adaptador |
| Idiomas soportados | Inglés (en) y telugu (te) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). El modelo base tiene 22 capas, dimensión oculta 2.048, 32 cabezas de atención y un vocabulario de 32.000 tokens, con una ventana de 2.048 posiciones. Según la documentación del modelo base, el preentrenamiento se realizó sobre del orden de 3 billones de tokens y posteriormente recibió un ajuste conversacional.

El adaptador se entrenó con QLoRA: rango r=8, alpha=16 y cuantización 4-bit nf4 del modelo base congelado. El conjunto de datos es un único fichero `chatml.jsonl` con perfiles (asistencia, energía, salud) formateados en ChatML, y el entrenamiento consistió en 100 muestras durante 3 épocas en una GPU T4. La pérdida registrada pasa de 2,54 a 2,34 entre los pasos 10 y 30, la única traza de entrenamiento publicada. No se documentan composición lingüística del dataset, plantilla exacta de máscara de pérdida, hiperparámetros de optimización, ni fases de RLHF o DPO posteriores.

## Capacidades

- Generación de texto conversacional breve en inglés y telugu, con formato de turnos ChatML (`<|user|>` / `<|assistant|>`).
- Emisión de recomendaciones de decisión binaria o condicional a partir de un perfil estructurado (porcentaje de asistencia, nivel de energía, estado de salud).
- Razonamiento de un solo paso sobre umbrales numéricos sencillos; no se documenta razonamiento multi-paso.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes o planificación: no disponible.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo «thinking» o cadena de pensamiento explícita: no disponible.
- Capacidad multilingüe limitada al par en/te declarado; el telugu depende de la cobertura del modelo base y no se reporta evaluación al respecto.

## Casos de uso

- Prototipo de asistente de decisión académica: dado un perfil con porcentaje de asistencia, energía y salud, generar una recomendación breve en telugu o inglés. Adecuado únicamente como demostración de concepto, no como sistema en producción.
- Base para experimentos de adaptación de dominio con QLoRA: sirve como plantilla reproducible (r=8, alpha=16, nf4, 100 muestras) para medir cómo se comporta un adaptador minúsculo sobre TinyLlama antes de escalar el dataset.
- Evaluación de asistentes en lenguas de bajos recursos: permite estudiar la calidad de respuestas en telugu de un modelo de 1,1 B y comparar con alternativas mayores, sin coste elevado de GPU.
- Despliegue en entornos con hardware limitado: tras fusionar el adaptador, el modelo en float16 ocupa aproximadamente 2,2 GB, por lo que puede ejecutarse en una GPU de 4-8 GB o en CPU para demos interactivas.
- Enrutador o filtro previo en una pipeline mayor: clasificar o preetiquetar consultas estudiantiles sencillas antes de derivarlas a un modelo de mayor tamaño, reduciendo coste por consulta.
- Docencia y material formativo: ejemplo práctico de ciclo completo PEFT (entrenamiento, publicación de adaptador, fusión con `merge_and_unload` y despliegue con `pipeline`).
- Generación de respuestas con formato ChatML para experimentos de destilación o aumento de datos sintéticos en el dominio académico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica reportada es la pérdida de entrenamiento (2,54 → 2,34 en los pasos 10-30), insuficiente para caracterizar calidad. Tampoco se han publicado evaluaciones del adaptador en MMLU, HumanEval, GSM8K ni en tareas específicas de decisión o de telugu.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo fusionado: aproximadamente 2,2 GB en float16 y alrededor de 0,7-0,8 GB en cuantización 4-bit (estimación a partir de los 1,1 B de parámetros; no publicada por el autor).
- Adaptador LoRA sin fusionar: tamaño de repositorio reportado de 0,0 GB, por debajo del umbral de visualización de la plataforma; requiere cargar igualmente el modelo base completo.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para float16 (GTX 1650 Super, RTX 3050, T4); A100/H100 no aportan ventaja relevante por el reducido tamaño del modelo.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4090 y en iGPU con suficiente memoria compartida; también es viable en CPU con cuantización.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado), vLLM o TGI tras fusionar pesos, llama.cpp/Ollama si se convierte a GGUF (conversión no publicada por el autor).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Naturaleza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLRRC v1.3 LoRA (este) | 1,1 B (base) + adaptador r=8 | 2.048 | Adaptador LoRA vertical en/te | No disponible | HuggingFace, 0 descargas |
| TinyLlama-1.1B-Chat-v1.0 | 1,1 B | 2.048 | Modelo base conversacional generalista | Apache 2.0 (según ficha del modelo base) | HuggingFace, ampliamente utilizado |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 | Modelo instructivo generalista multilingüe | Apache 2.0 | HuggingFace |
| SmolLM2-1.7B-Instruct | 1,7 B | 8.192 | Modelo instructivo generalista | Apache 2.0 | HuggingFace |

El adaptador no aporta mejoras verificables frente a su propio modelo base más allá del estrecho dominio de entrenamiento, y su licencia indefinida frente a las licencias permisivas de las alternativas es un factor determinante en cualquier evaluación para producción.

## Limitaciones y advertencias

- Entrenamiento con solo 100 muestras y 3 épocas: riesgo alto de sobreajuste y de degradación de las capacidades generales del modelo base al fusionar el adaptador.
- No se publica ninguna evaluación quantitativa ni qualitativa; la pérdida de 2,54 a 2,34 no permite inferir calidad de las respuestas.
- Dominio sensible: las recomendaciones afectan a decisiones sobre asistencia, salud y energía del usuario. La propia model card lo define como herramienta de apoyo y descarga la responsabilidad final en la persona usuaria.
- Riesgo elevado de alucinación y de respuestas inconsistentes ante perfiles fuera de la distribución de las 100 muestras de entrenamiento.
- Cobertura del telugu no verificada: depende del modelo base, entrenado mayoritariamente en inglés, por lo que la calidad en te puede ser baja pese a estar declarado.
- Ventana de contexto de 2.048 tokens: insuficiente para historiales conversacionales largos o perfiles con muchos campos.
- Licencia no especificada: no hay autorización explícita para uso comercial ni condiciones de atribución; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin pipeline declarado, sin métricas de seguridad y sin filtros de contenido documentados.
- Repositorio sin descargas ni validación comunitaria: no existe evidencia externa de funcionamiento más allá del ejemplo de la model card.
- No se han encontrado en la búsqueda web papers, blogs, repositorios ni demos asociados a este modelo; los resultados obtenidos no guardaban relación con él.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bhargavsai2005/flrrc-v1.3-lora
- Modelo base: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Paper, blog, repositorio o demo del adaptador: no disponible
- Información adicional relevante en la búsqueda web: no disponible (los resultados no estaban relacionados con el modelo)
