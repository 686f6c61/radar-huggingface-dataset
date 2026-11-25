# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B

## Resumen

Qwen3-0.6B-Distilled-30B-A3B es un modelo de lenguaje causal de 0,6 mil millones de parámetros publicado por el usuario reaperdoesntknow (Reaperdoesntrun / Convergent Intelligence LLC, Research Division) y derivado del modelo base Qwen/Qwen3-0.6B mediante destilación de conocimiento a partir de un profesor mucho mayor, Qwen3-30B-A3B-Thinking-2507 (arquitectura MoE con 30B totales y 3B activos). El objetivo declarado es transferir estructura de razonamiento STEM (matemáticas, física, ingeniería, biología) a un estudiante lo más pequeño posible, con una compresión nominal de 50x respecto al profesor.

La propuesta diferencial no es el tamaño, sino la metodología: se usa un profesor en variante *Thinking* (con trazas de razonamiento extendidas de mayor entropía) en lugar de un profesor *Instruct*, y se aplica una pérdida ponderada por prueba (*proof-weighted loss*) que amplifica entre 2,5x y 1,5x el peso de los tokens situados en la región de derivación (`Proof:` hasta `Final Answer:`). El entrenamiento se realizó sobre 6.122 muestras CoT de 12 dominios procedentes de los datasets de 0xZee, con 5.815 para entrenamiento y 307 reservadas para evaluación.

El modelo es relevante por su perfil de despliegue: con 751.632.384 parámetros reales en safetensors, un repositorio de 1,5 GB y licencia Apache 2.0, apunta a inferencia en *edge*, dispositivos móviles y pipelines donde se necesita un razonador pequeño y rápido. La contrapartida es una ventana de contexto de solo 1.024 tokens (longitud de entrenamiento) y un idioma declarado exclusivamente inglés, lo que limita seriamente su uso en producción más allá de la tutoría y el prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Qwen3 (RoPE, GQA), derivado de Qwen/Qwen3-0.6B |
| Parametros totales | 751.632.384 (safetensors); nominalmente 0,6B |
| Parametros activos | no aplica (el estudiante es denso; el profesor Qwen3-30B-A3B es MoE con 3B activos) |
| Longitud de contexto | 1.024 tokens (longitud de entrenamiento; no se declara extensión nativa superior) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el autor menciona "under 500MB quantized" sin especificar formato ni bits) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; precisión bf16) |

## Arquitectura y entrenamiento

El estudiante conserva la arquitectura del Qwen3-0.6B original: transformer causal con RoPE y atención GQA, en precisión bf16. El profesor es Qwen3-30B-A3B-Thinking-2507, un modelo *mixture-of-experts* de 30B totales y 3B activos en variante Thinking, que genera razonamiento interno extendido antes de emitir respuesta. La destilación combina dos componentes: entropía cruzada ponderada por prueba (55% del total) y divergencia KL estudiante-profesor a temperatura T=2,0 escalada por T² (45%), según la fórmula `L = 0.55 * CE_weighted + 0.45 * KD_kl`.

El entrenamiento usó 1 época, batch efectivo de 8, AdamW con weight decay 0,01, learning rate de 1,5e-5 a 1e-6 con decaimiento coseno y 30 pasos de warmup, clipping de gradiente 1,0 y precisión bf16. La ponderación de prueba decae linealmente de 2,5x a 1,5x durante el entrenamiento, penalizando más los errores en pasos de derivación que en el formato de la respuesta. El dataset cubre 12 dominios con fuerte desbalance: Física 2.254, Álgebra Lineal 667, Ecuaciones Diferenciales 636, Electromagnetismo 580, Matemáticas 576, Ingeniería 574, Mecánica Clásica 343, Mecánica Teórica 307, Cálculo Avanzado 268, Física Moderna 177, Fisiología 114 y Biología Molecular 71. El formato de entrenamiento fija la plantilla `Problem: ... Proof: ... Final Answer: ...`. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto en inglés con plantilla estructurada de problema, derivación y respuesta final.
- Razonamiento STEM con trazas de tipo *chain-of-thought* en matemáticas, física, ingeniería y, en menor medida, biología y fisiología.
- Derivaciones paso a paso en cálculo, álgebra lineal, ecuaciones diferenciales, mecánica clásica y teórica, electromagnetismo y física moderna.
- Resolución de problemas de formato académico con separación explícita entre prueba y respuesta final.
- Conversación básica en inglés (etiqueta `conversational` en el repositorio), aunque el entrenamiento está centrado en CoT STEM.
- Inferencia en *edge* y dispositivos con recursos limitados gracias a su tamaño reducido.
- No se documenta soporte de *tool calling*, *function calling*, agentes multi-paso, visión, audio ni modo *thinking* explícito separable en la información disponible.

## Casos de uso

- Tutoría educativa en STEM: el modelo puede recibir un enunciado en la plantilla `Problem:` y generar una derivación estructurada terminada en `Final Answer:`, útil para generar borradores de solución que el estudiante revisa y corrige. Su tamaño permite desplegarlo en un portátil o en el navegador.
- Generación de borradores de prueba en cálculo y álgebra lineal: adecuado para producir esqueletos de derivación en problemas de hasta aproximadamente 8 pasos, que un humano o un modelo mayor valida después.
- Componente rápido en pipelines multi-modelo: actuar como primer razonador barato que filtra o pre-estructura problemas, derivando los casos complejos a un modelo mayor. El bajo coste por token lo hace adecuado para *triage*.
- Inferencia en *edge* e IoT: con 751M parámetros y pesos bf16 en un repositorio de 1,5 GB, cabe en dispositivos con poca memoria y sin GPU dedicada, útil para asistentes técnicos offline.
- Generación de material didáctico de física y matemáticas: producir variantes de problemas resueltos con estructura homogénea (`Proof:` / `Final Answer:`) para bancos de ejercicios, siempre con revisión humana.
- Prototipado de investigación en destilación: sirve como referencia reproducible de la técnica de *proof-weighted distillation* con profesor Thinking, útil para experimentos académicos sobre transferencia de razonamiento a modelos pequeños.
- Filtrado y clasificación de soluciones: al estar entrenado con la plantilla `Final Answer:`, puede usarse para extraer y normalizar respuestas finales en corpus de problemas resueltos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, GSM8K, HumanEval ni evaluaciones específicas de STEM, y tampoco se aportan comparaciones numéricas frente al modelo base Qwen3-0.6B o al profesor.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 1,5 GB solo para pesos (751M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: en torno a 0,8-1 GB de pesos; en 4 bits, alrededor de 0,4-0,5 GB, coherente con la afirmación del autor de "under 500MB quantized" (sin especificar el esquema exacto).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060 12 GB, RTX 4060, RTX 4090 o superiores ofrecen margen amplio. En el extremo profesional, A100 y H100 no son necesarias y solo aportan throughput.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 4 GB de VRAM, incluidas GTX 1650, RTX 3050 y similares; también en CPU con llama.cpp u Ollama.
- Opciones de despliegue: transformers (ruta documentada por el autor), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), y previsiblemente llama.cpp, Ollama y vLLM si se generan pesos GGUF o se usa el checkpoint safetensors; no se confirma soporte explícito de estas herramientas en la información disponible.
- Latencia y throughput: no disponibles. Con 751M parámetros y contexto de 1.024 tokens, se espera latencia de decenas de milisegundos por token en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-0.6B-Distilled-30B-A3B (este) | 751M | 1.024 tokens | Apache 2.0 | Destilado de Qwen3-30B-A3B-Thinking sobre 6.122 muestras CoT STEM; solo inglés |
| Qwen/Qwen3-0.6B (base) | 0,6B | contexto nativo de Qwen3 (no confirmado en la informacion disponible) | Apache 2.0 | Modelo generalista original; sin especialización en derivaciones STEM |
| Qwen/Qwen3-30B-A3B-Thinking-2507 (profesor) | 30B totales / 3B activos (MoE) | no disponible en la informacion proporcionada | Apache 2.0 | Profesor de razonamiento extendido; 50x mayor que el estudiante |
| SmolLM2-1.7B / TinyLlama-1.1B (referencia de categoría) | 1,1-1,7B | 2.048-8.192 tokens según variante | Apache 2.0 | Alternativas generalistas pequeñas; sin destilación específica de CoT STEM |

La comparación directa de rendimiento no es posible porque no hay benchmarks publicados para este modelo. Frente al Qwen3-0.6B base, la diferencia es de especialización (plantilla Proof/Final Answer y sesgo hacia STEM) más que de capacidad bruta; frente al profesor, la diferencia de escala es de 50x en parámetros nominales.

## Limitaciones y advertencias

- Capacidad limitada por tamaño: con 0,6B, el modelo falla en pruebas de más de aproximadamente 8 pasos de razonamiento, problemas con muchas variables y dominios poco representados (biología molecular con 71 muestras, fisiología con 114).
- Alucinación de pasos intermedios: el autor advierte explícitamente de que puede generar pasos plausibles pero incorrectos; toda salida requiere verificación.
- Contexto muy corto: 1.024 tokens de entrenamiento impiden conversaciones multi-turno largas, documentos extensos o razonamiento de contexto amplio.
- Solo inglés: no hay soporte declarado de castellano ni de otros idiomas; el uso en español produciría resultados degradados.
- No apto para verificación formal de pruebas, análisis de seguridad crítica, consejo médico o legal.
- Riesgo de sesgo: el dataset procede de una única fuente (0xZee) y de dominios académicos, con desbalance fuerte entre física y biología; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y la model card no incluye evaluaciones de robustez ni de seguridad.
- La model card contiene referencias a un marco teórico propio ("Discrepancy Calculus") sin validación externa publicada; no debe tomarse como aval de calidad del modelo.
- El identificador de ejemplo en la model card (`reaperdoesntknow/Qwen3-0.6B-STEM-Proof-Distilled-Thinking`) no coincide exactamente con el ID del repositorio, lo que puede provocar errores al copiar el código de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Autor de los datasets: https://huggingface.co/0xZee
- Organización del autor: https://convergentintel.com
- Dataset de matemáticas: https://huggingface.co/datasets/0xZee/dataset-CoT-mathematics
- Dataset de física: https://huggingface.co/datasets/0xZee/dataset-CoT-Physics-2254
