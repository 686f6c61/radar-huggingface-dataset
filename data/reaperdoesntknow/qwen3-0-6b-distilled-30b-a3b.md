# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B

## Resumen

Qwen3-0.6B-Distilled-30B-A3B es un modelo de lenguaje causal de 0,6 mil millones de parámetros desarrollado por el usuario reaperdoesntknow (Convergent Intelligence LLC, Research Division) mediante destilación de conocimiento a partir de Qwen3-30B-A3B-Thinking-2507. El objetivo es trasladar la estructura de razonamiento extendido (chain-of-thought) de un modelo MoE de 30B a un estudiante denso de 0,6B, con una compresión de parámetros de 50x. Está especializado en dominios STEM: matemáticas, física, cálculo, álgebra lineal, ecuaciones diferenciales, electromagnetismo e ingeniería.

La innovación principal es el uso de un profesor en variante *Thinking* (no *Instruct*), cuyas distribuciones softmax de mayor entropía exponen al estudiante a un abanico más amplio de estrategias de derivación, combinado con una función de pérdida ponderada por prueba (*proof-weighted loss*) que amplifica 2,5x la pérdida en los tokens de la región de derivación. El modelo se entrenó sobre 6.122 muestras CoT de 12 dominios procedentes de los datasets de 0xZee.

Es relevante para despliegues en *edge*, dispositivos móviles y pipelines que requieren un razonador pequeño y rápido con formato estructurado (Problem / Proof / Final Answer). Su ventana de contexto es muy limitada (1.024 tokens de entrenamiento), lo que restringe su uso a problemas cortos. Licencia Apache 2.0 y pesos en safetensors en bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal Qwen3 (RoPE, GQA) |
| Parámetros totales | 751.632.384 (0,75B según safetensors) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.024 tokens (entrenamiento) |
| Tipos de cuantización | No disponible en la información (el autor menciona "bajo 500 MB cuantizado" sin especificar formato) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |
| Modelo base | Qwen/Qwen3-0.6B |
| Modelo profesor | Qwen/Qwen3-30B-A3B-Thinking-2507 |
| Ratio de compresión | 50x (30B → 0,6B) |
| Precisión de entrenamiento | bf16 |
| Tamaño del repositorio | 1,5 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer causal denso con RoPE y atención GQA, y se somete a un proceso de destilación de conocimiento desde Qwen3-30B-A3B-Thinking-2507. La pérdida combina dos términos: entropía cruzada ponderada por prueba (55% del total) y divergencia KL entre las softmax del estudiante y del profesor a temperatura T=2,0 escalada por T² (45%). La fórmula es `L = 0.55 * CE_weighted + 0.45 * KD_kl`.

El componente diferenciador es la *proof-weighted loss*: los tokens situados entre las marcas `Proof:` y `Final Answer:` reciben un peso de 2,5x que decae linealmente hasta 1,5x a lo largo del entrenamiento, penalizando más los errores en los pasos de razonamiento que en el formato de la respuesta. Los hiperparámetros incluyen 1 época, batch efectivo de 8, AdamW con weight decay 0,01, learning rate 1,5e-5 → 1e-6 con decaimiento coseno y 30 pasos de warmup, gradient clipping de 1,0 y precisión bf16. El conjunto de datos son 6.122 muestras CoT STEM de 12 dominios (Física 2.254, Álgebra Lineal 667, Ecuaciones Diferenciales 636, Electromagnetismo 580, Matemáticas 576, Ingeniería 574, Mecánica Clásica 343, Mecánica Teórica 307, Cálculo Avanzado 268, Física Moderna 177, Fisiología 114, Biología Molecular 71), con un split de 5.815 para entrenamiento y 307 para evaluación.

## Capacidades

- Generación de texto con formato estructurado de derivación (Problem / Proof / Final Answer).
- Razonamiento matemático y chain-of-thought en dominios STEM: cálculo, álgebra lineal, ecuaciones diferenciales, física clásica y moderna, electromagnetismo, mecánica teórica e ingeniería.
- Resolución de problemas con pasos intermedios explícitos, orientada a tutoría y borradores de demostración.
- Generación de texto en inglés exclusivamente.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del CoT interno.
- No dispone de visión, audio ni modo *thinking* separado; el razonamiento está integrado en el formato de salida.
- Inferencia compatible con `transformers`, `text-generation-inference` y `endpoints_compatible`.

## Casos de uso

- Tutoría educativa en STEM: el modelo genera derivaciones paso a paso en formato Problem / Proof / Final Answer, adecuado para explicar ejercicios de cálculo o álgebra lineal a estudiantes con feedback estructurado.
- Razonador ligero en pipelines multi-modelo: se puede usar como primer eslabón que produce un borrador de derivación que un modelo mayor revisa, aprovechando su bajo coste computacional y latencia reducida.
- Inferencia en *edge* y dispositivos móviles: con pesos bf16 de ~1,5 GB y una versión cuantizada por debajo de 500 MB según el autor, cabe en dispositivos con recursos limitados para asistencia offline.
- IoT y sistemas embebidos: generación de explicaciones técnicas breves en dispositivos con poca memoria, siempre que el problema quepa en 1.024 tokens.
- Generación de borradores de demostraciones matemáticas: útil como punto de partida para que un humano o un verificador formal revise los pasos, no como verificador.
- Asistencia en problemas de física e ingeniería de complejidad baja o media: cálculos de mecánica clásica, electromagnetismo básico o ecuaciones diferenciales sencillas con derivación explícita.
- Prototipado rápido de asistentes científicos: al ser Apache 2.0 y ligero, sirve para validar productos de asistencia técnica antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, GSM8K o HumanEval, ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,5 GB para los pesos más overhead de activaciones y KV cache (con contexto de 1.024 tokens, el KV cache es reducido).
- VRAM estimada en cuantización de 8 bits: en torno a 0,8 GB; en 4 bits, en torno a 0,4-0,5 GB (el autor menciona "bajo 500 MB cuantizado" sin especificar el esquema).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090; también cabe en GPUs de gama baja y en iGPU con suficiente memoria compartida.
- Cabe holgadamente en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM para bf16.
- Opciones de despliegue: `transformers` (soporte nativo), `text-generation-inference` (etiqueta presente en el repo) y endpoints compatibles; no se confirma soporte explícito de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B-Distilled-30B-A3B | 0,75B | 1.024 tokens | Razonamiento STEM CoT | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-0.6B (base) | 0,6B | No disponible en la información | Propósito general | Apache 2.0 | Hugging Face |
| Qwen3-30B-A3B-Thinking-2507 (profesor) | 30B totales (MoE) | No disponible en la información | Razonamiento general y thinking | No disponible en la información | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo entre estos modelos. La comparación se limita a parámetros, contexto, especialización y licencia.

## Limitaciones y advertencias

- Capacidad restringida por el tamaño: 0,6B es una limitación dura; el modelo falla en demostraciones de más de ~8 pasos de razonamiento y en problemas multivariable complejos, según el propio autor.
- Ventana de contexto de solo 1.024 tokens, insuficiente para razonamiento de contexto largo o conversaciones multi-turno extensas.
- Riesgo de pasos intermedios plausibles pero incorrectos; el autor recomienda verificar siempre las salidas.
- Dominios infrarrepresentados en el entrenamiento (biología molecular con 71 muestras, fisiología con 114) producen un rendimiento previsiblemente peor.
- Solo inglés; no hay soporte multilingüe documentado.
- No apto para verificación formal de demostraciones, análisis de seguridad crítica, consejo médico ni asesoramiento legal, según el autor.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-0.6B y el profesor deben cumplir sus propias condiciones; conviene revisar la licencia del profesor Qwen3-30B-A3B-Thinking-2507 antes de un despliegue comercial en cadena.
- La model card incluye referencias a un marco matemático propietario ("Discrepancy Calculus") sin validación externa; no debe tomarse como garantía de corrección.
- El identificador del ejemplo de código de la model card (`reaperdoesntknow/Qwen3-0.6B-STEM-Proof-Distilled-Thinking`) no coincide con el ID real del repositorio, lo que puede provocar errores de carga si se copia literalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Autor de los datasets: https://huggingface.co/0xZee
- Convergent Intelligence LLC: https://convergentintel.com
