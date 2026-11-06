# athenista/slm-tavenel-10m

## Resumen

SLM-Tavenel 10M es un modelo de lenguaje de tipo base, experimental y entrenado desde cero por el autor independiente athenista, publicado en Hugging Face bajo licencia MIT. Con 9.978.368 parámetros, se trata de un transformer decoder-only de 10 capas y anchura 256, con tokenizador BPE byte-level de 8.192 tokens y una ventana de contexto de 1.024 tokens. No está afinado para instrucciones ni funciona como asistente conversacional: es un artefacto de investigación pensado como base lingüística y como ancestro entrenado del modelo de 25M de la misma familia.

El modelo se entrenó durante 15.000 pasos sobre un piloto bilingüe (inglés y francés) de ciencia abierta, el corpus PleIAs/French-Science-Commons, con 31.417 registros retenidos y 491,52M de posiciones de token. Todo el cómputo se realizó en una única GPU RTX 4060 Laptop de 8 GB en aproximadamente 2,5 horas de GPU, lo que lo convierte en un ejemplo de entrenamiento de bajo presupuesto y reproducibilidad extrema.

Su relevancia actual es metodológica más que de rendimiento: documenta de forma trazable el proceso completo (curva de pérdida, semilla, revisión del Hub, SHA-256 de los pesos) y sirve como línea base a pequeña escala para estudiar escalado, tokenización y comportamiento bilingüe en modelos por debajo de los 10M de parámetros. Los resultados en tareas de opción múltiple están cerca del azar, tal y como el propio autor reconoce.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 10 capas, anchura 256, 4 cabezas de consulta / 2 de clave-valor, SwiGLU 768, puerta de atención por cabeza |
| Parámetros totales | 9.978.368 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | No se publica ninguna versión cuantizada; los pesos se distribuyen en float32 |
| Idiomas soportados | Inglés y francés |
| Licencia | MIT (pesos, código y Data Information); los registros fuente conservan sus propios términos |
| Formato de pesos | safetensors (`model.safetensors`, float32) |
| Tokenizador | BPE byte-level propio, 8.192 tokens |
| Precisión de entrenamiento | bfloat16 con precisión mixta |
| Optimizador / semilla | AdamW; semilla 1234 |
| Pérdida final train / validación | 2,29647 / 2,33488 |
| Cómputo de entrenamiento | Una RTX 4060 Laptop (8 GB), ~2,5 horas de GPU; energía no medida |
| Revisión del Hub descrita | `9818b706a2a2467efb22848967a5842871f7422c` (SHA-256 de pesos `ef6967c4…`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 10 capas con anchura 256, cuatro cabezas de consulta y dos de clave-valor (atención agrupada), FFN SwiGLU de dimensión 768 y una puerta de atención por cabeza (*head-wise attention gate*), una innovación que modula la salida de cada cabeza antes de agregarla. El tokenizador es un BPE byte-level propio de 8.192 tokens, diseñado específicamente para el proyecto y no heredado de otro modelo. La ventana de contexto es de 1.024 tokens.

El entrenamiento se realizó desde cero durante 15.000 pasos sobre el subconjunto `french_open_science` de PleIAs/French-Science-Commons, con 31.417 registros retenidos y 491,52M de posiciones de token, en precisión mixta bfloat16 y con AdamW (semilla 1234). No se aplicaron fases de RLHF, DPO ni ajuste por instrucciones: es un modelo base puro. La pérdida final de validación (2,33488) y la curva de entrenamiento publicada documentan un run completo, y el autor ofrece trazabilidad mediante revisión del Hub y hash de los pesos. No se documentan técnicas de decodificación especulativa ni atención lineal.

## Capacidades

- Generación de texto autoregresiva en inglés y francés, limitada a una ventana de 1.024 tokens.
- Modelado de lenguaje base: continuación de texto, puntuación por verosimilitud y evaluación tipo cloze.
- Capacidad bilingüe incipiente: ligeramente superior en francés que en inglés en las pruebas de opción múltiple (Belebele FR 0,319 frente a EN 0,296).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras modalidades.
- No está afinado para instrucciones ni para diálogo; no debe usarse como chatbot.
- Capacidad de razonamiento y matemáticas prácticamente inexistente a este tamaño y presupuesto.

## Casos de uso

- Línea base de investigación en escalado: sirve para comparar curvas de pérdida y comportamiento de modelos de ~10M de parámetros frente al modelo de 25M de la misma familia, con un run completamente documentado y reproducible.
- Estudio de tokenizadores de bajo recurso: al emplear un BPE byte-level propio de 8.192 tokens, permite analizar el impacto de decisiones de tokenización en corpus bilingües científicos.
- Experimentos de arquitectura: la puerta de atención por cabeza y la atención agrupada (4/2 cabezas) pueden ablacionarse sobre este checkpoint para medir su efecto a pequeña escala.
- Enseñanza y divulgación: su tamaño (0,1 GB de repo, ~10M de parámetros) y su entrenamiento en una GPU de portátil lo hacen idóneo para demostrar el ciclo completo de entrenamiento de un LM desde cero en un curso o taller.
- Evaluación de metodologías de benchmark: el protocolo zero-shot por log-likelihood con elementos fijados y el evaluador propio permiten validar pipelines de evaluación antes de aplicarlos a modelos mayores.
- Filtrado y puntuación de texto por verosimilitud: puede emplearse para asignar probabilidades a secuencias cortas en inglés o francés, por ejemplo para detectar texto anómalo o clasificar dominios dentro de corpus científicos.
- Reproducibilidad y auditoría: la combinación de semilla, revisión del Hub y SHA-256 facilita replicar el entrenamiento y verificar la integridad de los pesos en estudios de trazabilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor (evaluador SLM-Tavenel, zero-shot, opción múltiple por log-likelihood, elementos fijados; no verificados de forma independiente):

| Modelo | Parámetros | ARC-Easy | ARC-Challenge | HellaSwag | Belebele EN | Belebele FR | WinoGrande | Media seis tareas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| SLM-Tavenel 1M | 1,18M | 0,280 | 0,196 | 0,259 | 0,264 | 0,266 | 0,493 | 0,293 |
| SLM-Tavenel 10M | 9,98M | 0,306 | 0,184 | 0,275 | 0,296 | 0,319 | 0,511 | 0,315 |

El propio autor señala que el modelo está cerca del azar en las seis tareas, coherente con su tamaño y presupuesto de entrenamiento. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en float32 (unos 40 MB de pesos más estados de atención y caché KV para 1.024 tokens); en la práctica cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; una RTX 4060, RTX 3060 o incluso una iGPU son suficientes. Para entrenamiento, el autor usó una RTX 4060 Laptop de 8 GB.
- Cabe en GPU consumer: sí, en todas las GPU modernas, incluidas las de gama baja y portátiles.
- Opciones de despliegue: transformers (librería nativa, requiere `trust_remote_code` por el código personalizado), llama.cpp y Ollama tras conversión a GGUF (no se publica GGUF oficial), y vLLM o TGI para servir en lote si se convierte el checkpoint.
- Latencia y throughput: no disponibles en la información proporcionada; a este tamaño se espera una latencia de milisegundos por token en GPU consumer, pero no hay mediciones publicadas.
- Almacenamiento: el repositorio ocupa 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media seis tareas | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| SLM-Tavenel 10M | 9,98M | 1.024 | 0,315 | MIT | Hugging Face (athenista/slm-tavenel-10m) |
| SLM-Tavenel 1M | 1,18M | No disponible | 0,293 | MIT (misma familia) | Hugging Face (familia SLM-Tavenel) |
| SLM-Tavenel 25M | No disponible | No disponible | No disponible | MIT (misma familia) | Hugging Face (familia SLM-Tavenel) |

No se dispone de datos de otros modelos comparables de ~10M de parámetros en la información proporcionada; la comparación se limita a los miembros de la propia familia SLM-Tavenel.

## Limitaciones y advertencias

- Rendimiento cercano al azar en las seis tareas de opción múltiple evaluadas; no es adecuado para tareas que requieran razonamiento, conocimiento factual o matemáticas.
- No está afinado para instrucciones ni diálogo: genera continuaciones de texto y no responde a preguntas ni sigue instrucciones de forma fiable.
- Ventana de contexto muy corta (1.024 tokens), insuficiente para documentos largos o conversaciones multi-turno.
- Riesgo elevado de alucinación y de generar texto incoherente o repetitivo, especialmente fuera de los dominios del corpus de entrenamiento.
- Sesgos potenciales derivados del corpus fuente (French-Science-Commons), de temática científica y en inglés y francés; no se documentan evaluaciones de sesgo.
- Cobertura lingüística limitada a inglés y francés; no se garantiza un comportamiento correcto en otros idiomas.
- La licencia MIT cubre pesos, código y Data Information, pero los registros fuente conservan sus propios términos (CC0, CC-BY-4.0 y Licence-Ouverte-2.0); el autor advierte de que las comprobaciones de derechos y privacidad no están resueltas y que esto no constituye una certificación OSI ni una limpieza de derechos.
- Etiquetado explícitamente como artefacto de investigación experimental: no recomendado para producción sin validación adicional.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athenista/slm-tavenel-10m
- Registro de entrenamiento y benchmarks (EXP-0009): https://huggingface.co/athenista/slm-tavenel-10m/tree/main/training_record
- Dataset de entrenamiento: https://huggingface.co/datasets/PleIAs/French-Science-Commons
- Curva de entrenamiento (imagen): https://huggingface.co/athenista/slm-tavenel-10m/blob/main/training-curve.png
- Curva de entrenamiento (SVG): https://huggingface.co/athenista/slm-tavenel-10m/blob/main/training-curve.svg
