# reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B

## Resumen

El modelo `Qwen3-0.6B-Distilled-30B-A3B` es una destilación de conocimiento (knowledge distillation) del modelo Qwen3-30B-A3B-Thinking, desarrollado por el usuario reaperdoesntknow en colaboración con Convergent Intelligence LLC. El objetivo es transferir las capacidades de razonamiento STEM de un modelo de 30B parámetros con activación por mezcla de expertos (MoE) a un modelo denso de 0.6B parámetros, logrando una compresión de 50x. El resultado es un modelo de texto pequeño (751 millones de parámetros en total) capaz de generar derivaciones matemáticas y físicas estructuradas, pensado para ejecución en dispositivos con recursos limitados.

La destilación se realizó sobre 6.122 muestras de cadenas de pensamiento (chain-of-thought) en 12 dominios STEM, utilizando una función de pérdida híbrida que combina entropía cruzada ponderada por región de prueba (proof-weighted CE) y divergencia KL a temperatura 2.0. El modelo base es Qwen3-0.6B, con arquitectura causal LM con RoPE y atención con consultas agrupadas (GQA). El contexto de entrenamiento es de 1024 tokens, lo que limita su uso a tareas de razonamiento de corta duración. La licencia es Apache 2.0, permitiendo uso comercial sin restricciones.

La relevancia actual de este modelo radica en la tendencia de llevar capacidades de razonamiento a entornos edge, IoT y móviles, donde los modelos grandes no son viables por latencia o memoria. Al destilar desde la variante Thinking (que produce trazas de razonamiento extendidas), el estudiante pequeño aprende no solo la respuesta sino la estructura de deliberación, lo que mejora la calidad de los pasos intermedios en problemas STEM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (causal LM, RoPE, GQA) |
| Parametros totales | 751.632.384 (0.7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1024 tokens (entrenamiento) |
| Tipos de cuantizacion | No especificado en la model card; el autor menciona "under 500MB quantized" (posiblemente int8 o int4) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3, un transformer causal con embeddings rotatorios (RoPE) y atención con consultas agrupadas (GQA). La destilación se realizó desde el modelo profesor Qwen3-30B-A3B-Thinking-2507, que genera razonamiento extendido antes de emitir una respuesta final. El proceso de entrenamiento utilizó una función de pérdida compuesta:

- 55% de entropía cruzada ponderada por región de prueba: los tokens dentro de la sección `Proof:` hasta `Final Answer:` reciben un peso de 2.5x que decae linealmente a 1.5x durante el entrenamiento.
- 45% de divergencia KL entre las distribuciones softmax del estudiante y el profesor a temperatura T=2.0, escalada por T².

Los hiperparámetros incluyen una época, 5.815 muestras de entrenamiento, tamaño de lote efectivo de 8, optimizador AdamW con weight decay 0.01, tasa de aprendizaje de 1.5e-5 a 1e-6 con decaimiento coseno y warmup de 30 pasos, y gradiente clipping a 1.0. El entrenamiento se realizó en precisión bf16. El dataset proviene de 12 dominios STEM, con predominancia de física (2.254 muestras), álgebra lineal (667), ecuaciones diferenciales (636) y electromagnetismo (580). El formato de entrenamiento es un prompt estructurado que pide una derivación rigurosa con secciones `Proof:` y `Final Answer:`.

## Capacidades

- Generación de texto con razonamiento estructurado: produce derivaciones paso a paso en formato `Proof:` → `Final Answer:`.
- Razonamiento matemático: resuelve problemas de álgebra lineal, cálculo avanzado, ecuaciones diferenciales y matemáticas generales.
- Razonamiento físico: cubre mecánica clásica, mecánica teórica, electromagnetismo, física moderna y física general.
- Razonamiento en ingeniería: problemas de ingeniería general (574 muestras).
- Razonamiento en biología molecular y fisiología: dominios con menor representación (71 y 114 muestras respectivamente), por lo que su rendimiento es limitado.
- No soporta tool calling ni function calling según la información disponible.
- No soporta agentes ni multi-step reasoning más allá de la cadena de pensamiento generada.
- Capacidad multilingüe limitada al inglés; no se menciona soporte para otros idiomas.
- No tiene modo de pensamiento explícito (thinking mode) como el profesor, pero la destilación intenta transferir la estructura de deliberación.

## Casos de uso

- Tutor educativo en dispositivos móviles: el modelo puede explicar paso a paso la resolución de problemas de cálculo o física en una app educativa, funcionando offline con menos de 500MB de memoria. Su formato de salida estructurado facilita la presentación de soluciones didácticas.
- Asistente de repaso para estudiantes de ingeniería: dado su enfoque en STEM, puede generar derivaciones de problemas de mecánica o electromagnetismo, ayudando a verificar resultados o explorar métodos alternativos.
- Componente de razonamiento en pipelines multi-modelo: en un sistema donde un modelo grande orquesta tareas, este modelo pequeño puede actuar como un "razonador rápido" para problemas de una sola etapa, reduciendo latencia y coste.
- Inferencia en dispositivos IoT y embebidos: su tamaño compacto permite ejecutarlo en microcontroladores o GPUs de baja potencia (como Jetson Nano o Raspberry Pi con acelerador), habilitando razonamiento matemático en entornos sin conexión.
- Generación de borradores de demostraciones: para investigadores o estudiantes que necesitan un primer esbozo de una prueba matemática, el modelo puede producir una estructura de demostración que luego se verifica y refina manualmente.
- Validación de respuestas en plataformas de evaluación automática: puede comparar sus derivaciones con las de un estudiante para detectar errores conceptuales en problemas de física o matemáticas, siempre que el problema esté dentro de su contexto de 1024 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K. El autor solo menciona que el modelo "produce derivaciones STEM estructuradas" y que es adecuado para problemas de hasta ~8 pasos de razonamiento, pero no proporciona datos cuantitativos de rendimiento.

## Requisitos de hardware

- VRAM estimada: el modelo en bf16 ocupa aproximadamente 1.5 GB en disco (repo de 1.5 GB). En inferencia con bf16, la VRAM necesaria ronda 1.6-2 GB. Con cuantización a 4 bits, el peso se reduce a menos de 500 MB, permitiendo ejecución en CPU con 4 GB de RAM o en GPUs con 2 GB de VRAM.
- GPUs recomendadas: cualquier GPU con al menos 2 GB de VRAM (NVIDIA GTX 1650, RTX 3050, Jetson Nano). Para CPU, un procesador moderno con 8 GB de RAM es suficiente.
- Compatibilidad con consumer GPU: sí, cabe en la mayoría de GPUs de consumo actuales, incluso en iGPUs integradas si se cuantiza.
- Opciones de despliegue: compatible con Hugging Face Transformers (carga estándar con `AutoModelForCausalLM`). Dado su tamaño, puede desplegarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI. El autor menciona compatibilidad con text-generation-inference y endpoints.
- Latencia y throughput: no se proporcionan datos medidos. En una GPU moderna (RTX 4090), la generación de 512 tokens debería tomar menos de 2 segundos. En CPU, puede ser de 5-10 segundos para la misma longitud.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Razonamiento STEM | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-0.6B (base) | 0.6B | 32K (original) | Limitado | Apache 2.0 | Hugging Face |
| Qwen3-0.6B-Distilled-30B-A3B | 0.7B | 1024 (entrenamiento) | Especializado en STEM | Apache 2.0 | Hugging Face |
| Phi-3-mini (Microsoft) | 3.8B | 4K | Bueno en general | MIT | Hugging Face |
| Gemma-2-2B (Google) | 2.6B | 8K | Moderado | Gemma license | Hugging Face |

No se dispone de benchmarks comparativos entre estos modelos en la información proporcionada. La comparación es cualitativa: el modelo destilado es más pequeño que Phi-3-mini y Gemma-2-2B, pero su especialización en STEM con formato de derivación estructurada podría superarlos en tareas específicas de matemáticas y física, a costa de un contexto mucho más corto y una cobertura de idiomas reducida.

## Limitaciones y advertencias

- Capacidad de razonamiento limitada: el modelo falla en demostraciones de más de ~8 pasos, problemas multivariable complejos o dominios poco representados (biología molecular, fisiología). Puede generar pasos intermedios plausibles pero incorrectos.
- Contexto corto: 1024 tokens de entrenamiento restringen el uso a problemas que caben en esa ventana. No es adecuado para razonamiento de contexto largo ni para documentos extensos.
- Idioma: solo inglés. No hay soporte para español u otros idiomas, lo que limita su uso en entornos multilingües.
- Sesgos: al estar entrenado en un dataset de 6.122 muestras STEM, puede tener sesgos hacia estilos de resolución particulares o depender de la formulación del problema. No se han evaluado sesgos sociales.
- Riesgo de alucinación: como todo modelo de lenguaje, puede inventar pasos de derivación que parecen válidos pero son incorrectos. El autor advierte explícitamente: "Always verify".
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar la licencia de los datasets utilizados (0xZee) por si tuvieran condiciones adicionales.
- No apto para verificación formal de pruebas, análisis de seguridad crítica, consejo médico o legal.
- El autor indica que el modelo es parte de un framework llamado "Discrepancy Calculus (DISC)" no descrito en detalle; esto no afecta al uso práctico pero sugiere que el entrenamiento puede haber seguido metodologías no estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Qwen3-0.6B-Distilled-30B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-30B-A3B-Thinking-2507
- Datasets utilizados (autor 0xZee): https://huggingface.co/0xZee
- Sitio web del desarrollador: https://convergentintel.com
