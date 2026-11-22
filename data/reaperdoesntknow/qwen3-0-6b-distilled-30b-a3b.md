# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B

## Resumen

Qwen3-0.6B-Distilled-30B-A3B es un modelo de lenguaje causal de 0,6 mil millones de parámetros publicado por el usuario reaperdoesntknow (Convergent Intelligence LLC, Research Division) y derivado de Qwen/Qwen3-0.6B. Se trata de un destilado de conocimiento (knowledge distillation) cuyo profesor es Qwen3-30B-A3B-Thinking-2507, un modelo MoE de 30 mil millones de parámetros totales. El objetivo declarado es transferir estructura de razonamiento extendido (chain-of-thought) a un estudiante muy pequeño, con una ratio de compresión de aproximadamente 50x, para su uso en dispositivos edge, móviles y embebidos.

El entrenamiento se realizó sobre 6.122 muestras de chain-of-thought de dominios STEM (física, álgebra lineal, ecuaciones diferenciales, electromagnetismo, matemáticas, ingeniería, mecánica clásica, mecánica teórica, cálculo avanzado, física moderna, fisiología y biología molecular), todas ellas procedentes de datasets del usuario 0xZee. La innovación principal que declara el autor es el uso de un profesor en variante *Thinking* (con trazas de razonamiento extendidas y mayor entropía en las distribuciones softmax) combinado con una función de pérdida ponderada por prueba (*proof-weighted loss*) que amplifica la penalización sobre los tokens de derivación.

El modelo es relevante ahora porque demuestra una vía concreta para obtener razonamiento estructurado en un tamaño inferior a 500 MB cuantizado, con licencia Apache 2.0 y compatible con text-generation-inference. Ahora bien, sus 1.024 tokens de contexto de entrenamiento y su reducida capacidad lo limitan a tareas acotadas; no es un sustituto de modelos mayores en producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer causal, RoPE, GQA) |
| Parametros totales | 751.632.384 (dato real de safetensors); el autor indica 0,6B |
| Parametros activos | no disponible (no es MoE; el profesor sí lo era) |
| Longitud de contexto | 1.024 tokens (entrenamiento); no se declara contexto extendido |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor menciona <500 MB cuantizado sin especificar formatos) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de la familia Qwen3, con atención por grupos (GQA) y embeddings posicionales rotatorios (RoPE). No es un modelo MoE: los 751 millones de parámetros reales están todos activos en cada token. El profesor, en cambio, es Qwen3-30B-A3B-Thinking-2507, un MoE con 30B totales y 3B activos, del que se transfiere la distribución de salida mediante divergencia KL a temperatura T=2,0 y escalada por T².

La función de pérdida combina dos términos: entropía cruzada ponderada por prueba (55% del total) y divergencia KL de destilación (45%). La ponderación por prueba amplifica la pérdida de los tokens situados en la región de derivación (entre `Proof:` y `Final Answer:`) con un factor de 2,5x que decae linealmente hasta 1,5x a lo largo del entrenamiento. Los hiperparámetros declarados son: 1 época, 5.815 muestras de entrenamiento y 307 de evaluación (5% reservado), batch efectivo de 8, AdamW con weight decay 0,01, learning rate de 1,5e-5 a 1e-6 con schedule coseno y 30 pasos de warmup, gradient clipping de 1,0 y precisión bf16. El formato de entrenamiento impone una plantilla fija con secciones `Problem:`, `Proof:` y `Final Answer:`.

Como innovación destacable, el autor argumenta que un profesor *Thinking* produce distribuciones de mayor entropía que un profesor *Instruct*, de modo que el estudiante observa un paisaje más rico de estrategias alternativas de derivación. La model card menciona además un marco matemático propio denominado Discrepancy Calculus (DISC), descrito de forma incompleta en la información disponible.

## Capacidades

- Generación de texto y razonamiento paso a paso en formato de derivación estructurada (`Problem:` → `Proof:` → `Final Answer:`).
- Razonamiento matemático y científico en dominios STEM: cálculo avanzado, álgebra lineal, ecuaciones diferenciales, física clásica y moderna, electromagnetismo, mecánica teórica e ingeniería.
- Chain-of-thought explícito: el modelo está entrenado para producir trazas de derivación antes de la respuesta final.
- Capacidades conversacionales básicas (etiqueta `conversational`), aunque no es su foco principal.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el autor advierte dificultades más allá de ~8 pasos de razonamiento.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (visión, audio, thinking mode nativo): no disponible.

## Casos de uso

- Tutoría educativa en STEM: el modelo puede generar derivaciones paso a paso de problemas de cálculo, álgebra o física en formato estructurado, adecuado para integrarse en aplicaciones de aprendizaje móvil gracias a su tamaño reducido.
- Inferencia en dispositivos edge y embebidos: con menos de 500 MB cuantizado, cabe en placas tipo Raspberry Pi, routers o dispositivos IoT donde no es viable ejecutar modelos de mayor tamaño, ofreciendo razonamiento básico local.
- Componente de razonamiento rápido en pipelines multi-modelo: puede actuar como primer eslabón que genera una derivación preliminar o un borrador de proof, que un modelo mayor revisa o verifica después.
- Borrador de pruebas y derivaciones matemáticas: útil para que estudiantes o investigadores obtengan un esqueleto de demostración que luego validan manualmente, aprovechando la ponderación de la región `Proof:`.
- Asistencia en problemas de ingeniería y física aplicada: resolución de ejercicios acotados de mecánica, electromagnetismo o ecuaciones diferenciales con contexto de hasta 1.024 tokens.
- Prototipado y experimentación en destilación: sirve como referencia reproducible para investigadores que quieran estudiar la transferencia de razonamiento desde profesores *Thinking* a estudiantes pequeños, dado que la model card documenta la pérdida, los hiperparámetros y el dataset.
- Filtrado o clasificación de problemas STEM: puede generar una derivación breve que ayude a etiquetar la dificultad o el dominio de un enunciado en un corpus educativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 1,5 GB para los pesos (751M parámetros × 2 bytes), más overhead de activaciones y KV cache; cómodo en cualquier GPU con 4 GB o más.
- VRAM estimada cuantizado: el autor indica menos de 500 MB en cuantización agresiva (probablemente 4 bits), aunque no especifica los formatos soportados; en la práctica, entre 0,5 y 1 GB según esquema.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; también GPU de datacenter (A100, H100) para despliegues con alta concurrencia, aunque el modelo está sobredimensionado para ellas.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 4 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama y vLLM no están confirmados en la información disponible, aunque al ser un transformer Qwen3 estándar en safetensors son conversiones plausibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3-0.6B-Distilled-30B-A3B | 751M (0,6B nominal) | 1.024 tokens | Apache 2.0 | Destilado STEM con profesor Thinking; foco en derivaciones |
| Qwen/Qwen3-0.6B (base) | 0,6B | contexto nativo de Qwen3 (no confirmado en la información) | Apache 2.0 | Modelo generalista sin destilación específica de razonamiento STEM |
| Qwen/Qwen3-30B-A3B-Thinking-2507 (profesor) | 30B totales / 3B activos | no disponible en la información | Apache 2.0 | Profesor MoE con razonamiento extendido; ~50x mayor |
| Otros destilados pequeños de Qwen3 | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada; no se han publicado benchmarks del destilado.

## Limitaciones y advertencias

- Capacidad muy limitada por el tamaño: el propio autor advierte que el modelo fallará en pruebas de más de ~8 pasos de razonamiento, problemas con múltiples variables y dominios poco representados (biología molecular, fisiología).
- Riesgo de alucinación en pasos intermedios: puede generar derivaciones plausibles pero incorrectas; el autor recomienda verificar siempre.
- Contexto de solo 1.024 tokens en entrenamiento, insuficiente para razonamiento de contexto largo o conversaciones multi-turno extensas.
- Solo inglés: no hay soporte multilingüe declarado, lo que limita su uso en castellano u otros idiomas.
- No apto para verificación formal de pruebas, análisis de seguridad crítica, consejo médico o legal.
- Sesgos conocidos: no disponible (no se documentan evaluaciones de sesgo).
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3-0.6B y los datasets de 0xZee deben respetar sus propias condiciones; conviene revisarlas antes de producción.
- Modelo de nicho con 0 likes y autor individual: no hay garantía de mantenimiento, soporte ni actualizaciones; la model card contiene además referencias a un marco teórico propio (DISC) descrito de forma incompleta.
- Contexto efectivo reducido: prompts que superen 1.024 tokens degradarán la calidad de forma notable.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Organización del autor: https://convergentintel.com
- Datasets de entrenamiento (autor 0xZee): https://huggingface.co/0xZee (incluye dataset-CoT-Physics-2254, dataset-CoT-Linear-Algebra-667, dataset-CoT-Differential-Equations-636, dataset-CoT-Electromagnetism-580, dataset-CoT-Engineering-574, dataset-CoT-Classical-Mechanics-343, dataset-CoT-Theoretical-Mechanics-307, dataset-CoT-Advanced-Calculus-268, dataset-CoT-Modern-Physics-177, dataset-CoT-Physiology-114, dataset-CoT-Molecular-Biology-71 y dataset-CoT-mathematics)
- Paper, blog o demo adicionales: no disponible
