# ahmedoussama/redline-bank-qwen3-0.6b

## Resumen
Redline Bank es un modelo de corrección gramatical (GEC) especializado en texto bancario y financiero, desarrollado por el usuario ahmedoussama como un ajuste fino completo de Qwen/Qwen3-0.6B. Su propósito no es reescribir el texto, sino devolver una lista JSON de ediciones sugeridas con el formato `[{"o": "were", "c": "was", "n": 1}]`, donde `o` es el fragmento original, `c` la sustitución y `n` la ocurrencia concreta sobre la que aplicar el cambio. Si el texto ya es correcto, devuelve `[]`.

El modelo está entrenado para preservar terminología financiera, términos definidos, cifras y fórmulas legales, evitando "corregir" lenguaje de dominio que no debe tocarse. Es un fine-tune completo de los 596 millones de parámetros de Qwen3-0.6B, realizado en una única GPU T4, con licencia Apache 2.0 y soporte exclusivo para inglés.

Su relevancia radica en el enfoque práctico para producción: frente a coedit-large (770M) en un conjunto de evaluación bancaria, obtiene F0.5 de 0.742 frente a 0.379, y reduce la tasa de no-op (editar texto ya correcto) del 72,5 % al 14,7 %. No obstante, en inglés general queda por debajo de coedit-large y del modelo hermano Redline general, por lo que su uso está claramente delimitado al dominio bancario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en el repo; el autor no documenta cuantizaciones GGUF/AWQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento
El modelo es un ajuste fino completo (full fine-tune) de Qwen3-0.6B, un transformer decoder-only de 596M parámetros. No se documentan modificaciones arquitectónicas respecto al modelo base; la innovación reside en la tarea y el formato de salida estructurado en JSON de ediciones.

El entrenamiento se realizó sobre aproximadamente 4,06 millones de frases bancarias limpias, procesadas con Spark, provenientes de quejas de consumidores de CFPB, 13.337 frases de presentaciones SEC EDGAR y frases semilla escritas a mano. La mezcla de entrenamiento incluye 70.000 correcciones bancarias sintéticas generadas mediante nueve funciones de corrupción, además de datos de los conjuntos grammarly/coedit, 512duncanl/wi_locness_detokenized y 512duncanl/c4_200m_cleaned_365k. No se menciona el uso de RLHF ni DPO. El entrenamiento se ejecutó en una sola GPU T4.

## Capacidades
- Corrección gramatical, ortográfica y de puntuación en texto bancario y financiero en inglés.
- Detección de errores de capitalización, erratas, palabras confundibles (there/their), concordancia sujeto-verbo, artículos, puntuación, plural, tiempo verbal y preposiciones.
- Salida estructurada como lista JSON de ediciones con índice de ocurrencia, pensada para integrarse en interfaces de sugerencias.
- Preservación de terminología financiera, términos definidos, cifras y fórmulas legales.
- Modo sin pensamiento (`enable_thinking=False`) para inferencia directa y determinista.
- No soporta tool calling, agentes, visión ni audio según la información disponible.
- Capacidad multilingüe limitada al inglés.

## Casos de uso
- Revisión de cartas a clientes bancarios: el modelo detecta errores de concordancia y puntuación en comunicaciones formales y devuelve sugerencias aplicables una a una, respetando los términos contractuales.
- Respuestas a reclamaciones: permite corregir borradores de atención al cliente antes de su envío, reduciendo erratas y confusiones léxicas sin alterar cifras ni referencias legales.
- Avisos de cuenta y extractos: integrado en un pipeline de generación documental, valida la gramática de textos masivos y descarta ediciones sobre texto ya correcto gracias a su baja tasa de no-op (14,7 %).
- Cláusulas de contratos y acuerdos: verifica la puntuación y la concordancia en fragmentos legales, manteniendo intactos los términos definidos y el lenguaje jurídico.
- Herramienta de corrección en el editor interno del banco: al devolver JSON de ediciones con índice de ocurrencia, una UI puede mostrar sugerencias aceptables o rechazables por el revisor humano.
- Preprocesado de datasets financieros: limpieza gramatical de corpus de quejas y presentaciones antes de usarlos en otros modelos o análisis, con salida determinista y JSON siempre válido (1.000 de validez).

## Benchmarks y rendimiento

Conjunto de evaluación bancario (400 frases con errores y 400 correctas, puntuación a nivel de edición):

| Métrica | coedit-large (770M) | Redline Bank (0.6B) |
|---|---|---|
| Precision | 0.359 | 0.759 |
| Recall | 0.487 | 0.681 |
| F0.5 | 0.379 | 0.742 |
| Exact match | 0.117 | 0.455 |
| Tasa de no-op ↓ | 0.725 | 0.147 |
| JSON válido | – | 1.000 |

En texto de dominio general del mismo conjunto: F0.5 0.475 frente a 0.357 de coedit-large, con tasa de no-op de 0.297 frente a 0.647.

Segundo conjunto bancario independiente (notebook de reevaluación): F0.5 0.775 frente a 0.409, exact match 0.542 frente a 0.125 y no-op 0.188 frente a 0.720.

Recall por tipo de error (conjunto bancario, 60 frases por tipo):

| Tipo de error | Recall | Exact |
|---|---|---|
| Capitalización | 0.983 | 0.683 |
| Errata | 0.883 | 0.767 |
| Palabra confundible | 0.883 | 0.667 |
| Concordancia sujeto-verbo | 0.817 | 0.550 |
| Artículo | 0.750 | 0.550 |
| Puntuación | 0.700 | 0.517 |
| Plural | 0.600 | 0.417 |
| Tiempo verbal | 0.583 | 0.383 |
| Preposición | 0.500 | 0.367 |

JFLEG test (747 frases de aprendices, 4 correcciones humanas, GLEU):

| Sistema | GLEU |
|---|---|
| Texto fuente sin ediciones | 40.21 |
| Redline Bank | 51.26 |
| coedit-large | 55.63 |
| Redline (general) | 59.02 |
| Referencia humana | 61.12 |

El autor advierte que los errores del conjunto bancario son sintéticos, inyectados mediante las mismas funciones de corrupción usadas en el entrenamiento, por lo que no constituyen un benchmark publicado.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 1,2-2,5 GB en fp16/bf16 para los 596M parámetros, más overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el propio autor entrenó en una T4.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4090 y similares; también en CPU para volúmenes bajos.
- Opciones de despliegue: transformers (documentado), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documentan recetas para vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. La generación usa `do_sample=False` y `max_new_tokens=160`, lo que acota la latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F0.5 bancario | No-op bancario | GLEU JFLEG | Licencia |
|---|---|---|---|---|---|---|
| Redline Bank | 596M | no disponible | 0.742 | 0.147 | 51.26 | apache-2.0 |
| coedit-large | 770M | no disponible | 0.379 | 0.725 | 55.63 | no disponible en la información |
| Redline (general) | 596M | no disponible | no disponible | no disponible | 59.02 | no disponible en la información |

Redline Bank supera a coedit-large en dominio bancario en F0.5 y exact match, y reduce drásticamente las ediciones sobre texto correcto, pero queda por detrás en GLEU sobre inglés general de aprendices. Para texto no bancario, el autor recomienda su modelo hermano Redline general.

## Limitaciones y advertencias
- Especialización estrecha: en inglés general rinde por debajo de coedit-large (GLEU 51.26 frente a 55.63) y del Redline general (59.02).
- Los resultados del conjunto bancario proceden de errores sintéticos generados con las mismas funciones de corrupción que el entrenamiento, lo que puede sobreestimar el rendimiento en errores humanos reales.
- Solo soporta inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación en la lista de ediciones: aunque el JSON válido es 1.000 en la evaluación, el código de ejemplo incluye una función `apply_edits` que descarta ediciones no resolubles, lo que sugiere que pueden aparecer fragmentos no encontrados en el texto.
- La tasa de no-op no es cero (14,7 % en el conjunto bancario), por lo que en producción conviene mantener revisión humana o filtros adicionales.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantías ni evaluación fuera del dominio bancario.
- El `generation_config.json` incluido es el del modelo base con muestreo; es necesario forzar `do_sample=False` para reproducir los resultados.
- No se documenta la longitud de contexto soportada, lo que limita la planificación para documentos largos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/ahmedoussama/redline-bank-qwen3-0.6b
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo hermano Redline general: https://huggingface.co/ahmedoussama/redline-qwen3-0.6b
- Notebook de reevaluación en Kaggle: https://www.kaggle.com/code/ososovic/qwen3-bank-grammar-reeval
- Dataset grammarly/coedit: https://huggingface.co/datasets/grammarly/coedit
- Dataset 512duncanl/wi_locness_detokenized: https://huggingface.co/datasets/512duncanl/wi_locness_detokenized
- Dataset 512duncanl/c4_200m_cleaned_365k: https://huggingface.co/datasets/512duncanl/c4_200m_cleaned_365k
