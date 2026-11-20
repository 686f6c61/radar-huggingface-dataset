# athenista/slm-tavenel-10m

## Resumen

SLM-Tavenel 10M es un modelo de lenguaje de tipo base, entrenado desde cero por el autor independiente athenista (proyecto SLM-Tavenel, repositorio de thekester en GitHub), con 9.978.368 parámetros. Se trata de un transformer decoder-only de 10 capas y anchura 256, con tokenizador BPE byte-level propio de 8.192 tokens y una ventana de contexto de solo 1.024 tokens. Es un artefacto de investigación experimental, no un asistente conversacional ni un modelo afinado por instrucciones.

El modelo se entrenó durante 15.000 pasos sobre un piloto bilingüe (inglés y francés) de texto científico abierto, concretamente el corpus `PleIAs/French-Science-Commons` (31.417 registros retenidos, 491,52M posiciones de token). El entrenamiento completo consumió aproximadamente 2,5 horas de GPU en una única RTX 4060 Laptop de 8 GB, con precisión mixta bfloat16. La pérdida final de entrenamiento fue 2,29647 y la de validación 2,33488.

Su relevancia es metodológica más que práctica: sirve como ancestro entrenado del modelo de 25M de la misma familia y como línea base a pequeña escala para estudiar dinámicas de entrenamiento, tokenización y evaluación en modelos por debajo de los 10M de parámetros. Los resultados en tareas de opción múltiple están cerca del azar, algo esperable en este tamaño y presupuesto de cómputo. La licencia es MIT para pesos y código, aunque el corpus de origen mezcla registros CC0, CC-BY-4.0 y Licence-Ouverte-2.0 con comprobaciones de derechos y privacidad no resueltas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, 10 capas, anchura 256, 4 cabezas de consulta / 2 de clave-valor, SwiGLU 768, puerta de atención por cabeza |
| Parametros totales | 9.978.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | float32 (pesos publicados), bfloat16 (copia en `variants/bf16/`), receta int8 para CPU en la sección de inferencia local |
| Idiomas soportados | Inglés y francés |
| Licencia | MIT (pesos, código y Data Information); los registros del corpus conservan sus propios términos |
| Formato de pesos | safetensors (`model.safetensors`, float32) |
| Tokenizador | BPE byte-level propio del proyecto, 8.192 tokens |
| Precisión de entrenamiento | bfloat16 con precisión mixta |
| Optimizador / semilla | AdamW; semilla 1234 |
| Cómputo de entrenamiento | Una RTX 4060 Laptop (8 GB), ~2,5 horas de GPU; energía no medida |
| Pérdida final train / validación | 2,29647 / 2,33488 |
| Revisión del Hub descrita | `9818b706a2a2467efb22848967a5842871f7422c` (SHA-256 de pesos `ef6967c4…`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only compacto: 10 capas, dimensión de modelo 256, 4 cabezas de consulta y 2 de clave-valor (atención con grupos de consulta), capa SwiGLU de 768 unidades y una puerta de atención por cabeza. El tokenizador es un BPE byte-level propio del proyecto con vocabulario de 8.192 tokens, lo que reduce el tamaño del embedding a costa de secuencias más largas en tokens. La ventana de contexto es de 1.024 tokens.

El entrenamiento se realizó desde cero durante 15.000 pasos con AdamW y semilla 1234, en precisión mixta bfloat16, sobre el subconjunto `french_open_science` de `PleIAs/French-Science-Commons`: 31.417 registros retenidos y 491,52M posiciones de token. No hay información sobre RLHF, DPO ni ningún otro ajuste posterior; el modelo es estrictamente base. La model card no documenta innovaciones técnicas destacables como decodificación especulativa o atención lineal; la única particularidad reseñable es la puerta de atención por cabeza y el uso de atención con grupos de consulta en un modelo de este tamaño.

## Capacidades

- Generación de texto autoregresiva en inglés y francés, a partir de un prompt y sin formato de chat.
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene diálogos coherentes.
- Razonamiento de opción múltiple evaluado por log-verosimilitud (ARC-Easy, ARC-Challenge, HellaSwag, Belebele en inglés y francés, WinoGrande), con resultados cercanos al azar.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de soporte documentado de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión, audio ni otras capacidades multimodales.
- Capacidad multilingüe limitada a inglés y francés, con corpus de entrenamiento predominantemente científico.

## Casos de uso

- Línea base de investigación en scaling laws: sirve para comparar curvas de pérdida y comportamiento a 10M de parámetros frente al modelo de 25M de la misma familia, con un registro de entrenamiento reproducible y pesos publicados.
- Estudio de tokenizadores de bajo vocabulario: permite analizar el efecto de un BPE byte-level de 8.192 tokens en la longitud efectiva de secuencia y en la pérdida por token en corpus bilingües científicos.
- Reproducción de pipelines de entrenamiento en hardware de consumo: el run completo cabe en una RTX 4060 Laptop de 8 GB en unas 2,5 horas, lo que lo hace útil como banco de pruebas de recetas de precisión mixta, optimizador y semillas.
- Evaluación comparativa de arneses: al estar evaluado con plantillas de lm-evaluation-harness y cloze sobre conjuntos fijados por revisión, sirve para validar la implementación de evaluadores propios en tareas de opción múltiple.
- Docencia y divulgación: un modelo de 10M parámetros con pesos en float32 (0,1 GB de repositorio) se puede inspeccionar, modificar y ejecutar en CPU con la receta int8 incluida, lo que facilita explicar el funcionamiento interno de un transformer.
- Generación de texto exploratoria en francés científico: puede producir continuaciones de texto sobre dominio científico con coherencia local limitada, útil para estudiar sesgos de corpus y calidad de muestreo, no para producción.

## Benchmarks y rendimiento

Resultados declarados por el autor (evaluador SLM-Tavenel, zero-shot, opción múltiple por log-verosimilitud, no verificados de forma independiente):

| Tarea | Conjunto | Métrica | Valor |
|---|---|---|---|
| Opción múltiple (0-shot, log-likelihood) | ARC-Easy (test) | accuracy | 0,306 |
| Opción múltiple (0-shot, log-likelihood) | ARC-Challenge (test) | accuracy | 0,184 |
| Opción múltiple (0-shot, log-likelihood) | HellaSwag (validation) | accuracy | 0,275 |
| Opción múltiple (0-shot, log-likelihood) | Belebele inglés (test) | accuracy | 0,296 |
| Opción múltiple (0-shot, log-likelihood) | Belebele francés (test) | accuracy | 0,319 |
| Opción múltiple (0-shot, log-likelihood) | WinoGrande XL (validation) | accuracy | 0,511 |

El autor indica explícitamente que los resultados están cerca del azar para este tamaño y presupuesto, y que el valor del checkpoint es servir de ancestro del modelo de 25M y de línea base. No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (unos 40 MB de pesos más activaciones y caché KV para 1.024 tokens); prácticamente despreciable en bfloat16 e int8.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el propio entrenamiento se hizo en una RTX 4060 Laptop de 8 GB, por lo que tarjetas como RTX 3060, RTX 4060, T4 o superiores son más que suficientes.
- Cabe en cualquier GPU de consumo, incluidas integradas modernas, y en CPU con la receta int8 documentada por el autor.
- Opciones de despliegue: transformers (librería declarada, con `custom_code`), inferencia local en CPU según la receta del repositorio; no hay confirmación de soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. Por el tamaño, la latencia debería ser de milisegundos por token en GPU moderna, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Resultados publicados |
|---|---|---|---|---|---|
| SLM-Tavenel 10M | 9.978.368 | 1.024 | en, fr | MIT | ARC-Easy 0,306; HellaSwag 0,275; WinoGrande 0,511 |
| Modelo de 25M de la familia SLM-Tavenel | 25M (según la model card) | no disponible | en, fr (presumible) | MIT (presumible) | no disponible en esta ficha |
| Alternativas de ~10M parámetros de la literatura | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables de la misma categoría en la información proporcionada; la única referencia directa es el modelo de 25M de la propia familia, cuyos detalles no se incluyen en esta ficha.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse como asistente conversacional ni esperar que siga instrucciones.
- Rendimiento cercano al azar en tareas de razonamiento y sentido común (ARC-Challenge 0,184, HellaSwag 0,275), lo que refleja la escala y el presupuesto de entrenamiento, no una capacidad útil.
- Riesgo alto de alucinación y de texto incoherente más allá de unas pocas frases; no apto para producción.
- Ventana de contexto de solo 1.024 tokens, insuficiente para documentos largos o conversaciones multi-turno.
- Cobertura lingüística limitada a inglés y francés, con sesgo hacia el dominio científico por el corpus de entrenamiento.
- Sesgos desconocidos y no auditados; el corpus mezcla registros con licencias CC0, CC-BY-4.0 y Licence-Ouverte-2.0, y las comprobaciones de derechos y privacidad están declaradas como no resueltas.
- La licencia MIT cubre pesos y código, pero no acredita la limpieza de derechos del corpus de origen; el autor lo indica expresamente y no constituye una certificación OSI ni una depuración de derechos.
- Los benchmarks son declarados por el autor, no verificados de forma independiente (`verified: false`), y usan un evaluador propio.
- No hay documentación de tool calling, agentes ni despliegue en servidores de inferencia de alto rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athenista/slm-tavenel-10m
- Registro de entrenamiento y benchmarks: https://huggingface.co/athenista/slm-tavenel-10m/tree/main/training_record
- Repositorio del proyecto SLM-Tavenel: https://github.com/thekester/slm-tavenel
- Catálogo de modelos publicados: https://github.com/thekester/slm-tavenel#published-models
- Archivo de investigación y reproducibilidad: https://github.com/thekester/slm-tavenel#research-and-reproducibility
- Corpus de entrenamiento: https://huggingface.co/datasets/PleIAs/French-Science-Commons
